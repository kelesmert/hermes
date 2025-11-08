/* eslint-disable no-console */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const roles = require('../src/constants/roles');
const permissions = require('../src/constants/permissions');
const { connectDatabase } = require('../src/config/database');
const Permission = require('../src/models/permission-model');
const Role = require('../src/models/role-model');
const User = require('../src/models/user-model');
const { hashPassword } = require('../src/utils/password');

const permissionSeeds = [
  {
    name: permissions.DASHBOARD_READ,
    label: 'Dashboard Görüntüleme',
    description: 'Genel dashboard metriklerini okuma izni',
    category: 'dashboard',
  },
  {
    name: permissions.MACHINES_READ,
    label: 'Makine Görüntüleme',
    description: 'Tüm makine kayıtlarını görüntüleme',
    category: 'machines',
  },
  {
    name: permissions.MACHINES_WRITE,
    label: 'Makine Yönetimi',
    description: 'Makine kayıtlarında değişiklik yapma',
    category: 'machines',
  },
  {
    name: permissions.MACHINES_UPDATE_OWN,
    label: 'Kendi Makinesini Güncelle',
    description: 'Kullanıcıya atanmış makinelerde işlem yapma',
    category: 'machines',
  },
  {
    name: permissions.REPORTS_READ,
    label: 'Raporları Görüntüle',
    description: 'Analitik ve rapor ekranlarını okuma',
    category: 'reports',
  },
  {
    name: permissions.REPORTS_EXPORT,
    label: 'Rapor Dışa Aktarma',
    description: 'CSV/Excel vb. çıktılar alma',
    category: 'reports',
  },
  {
    name: permissions.USERS_MANAGE,
    label: 'Kullanıcı Yönetimi',
    description: 'Kullanıcı oluşturma/güncelleme/silme',
    category: 'users',
  },
  {
    name: permissions.ROLES_MANAGE,
    label: 'Rol Yönetimi',
    description: 'Rolleri ve izinlerini düzenleme',
    category: 'roles',
  },
  {
    name: permissions.AUDIT_READ,
    label: 'Audit Log Görüntüleme',
    description: 'Audit log kayıtlarını okuma',
    category: 'audit',
  },
];

const roleSeeds = [
  {
    name: roles.ADMIN,
    label: 'Admin',
    description: 'Sistem yöneticisi, tüm yetkiler.',
    permissionNames: ['*'],
  },
  {
    name: roles.SUPERVISOR,
    label: 'Supervisor',
    description: 'Üretim yöneticisi, rapor ve makine yönetimi.',
    permissionNames: [
      permissions.DASHBOARD_READ,
      permissions.MACHINES_READ,
      permissions.MACHINES_WRITE,
      permissions.REPORTS_READ,
      permissions.REPORTS_EXPORT,
    ],
  },
  {
    name: roles.OPERATOR,
    label: 'Operator',
    description: 'Makine operatörü, atanmış makineleri yönetir.',
    permissionNames: [permissions.MACHINES_READ, permissions.MACHINES_UPDATE_OWN],
    isDefault: true,
  },
  {
    name: roles.VIEWER,
    label: 'Viewer',
    description: 'Sadece görüntüleme yetkisi.',
    permissionNames: [permissions.DASHBOARD_READ],
  },
];

const seedPermissions = async () => {
  const upserts = permissionSeeds.map((seed) =>
    Permission.findOneAndUpdate({ name: seed.name }, { $set: seed }, { upsert: true, new: true }),
  );
  const results = await Promise.all(upserts);
  console.log(`Permission kayıtları güncellendi (${results.length})`);
  return results;
};

const seedRoles = async () => {
  const permissionDocs = await seedPermissions();
  const permissionMap = new Map(permissionDocs.map((doc) => [doc.name, doc]));

  const upserts = roleSeeds.map((seed) => {
    let permissionIds = [];
    if (seed.permissionNames?.includes('*')) {
      permissionIds = permissionDocs.map((doc) => doc._id);
    } else {
      permissionIds = (seed.permissionNames || []).map((permName) => {
        const permDoc = permissionMap.get(permName);
        if (!permDoc) {
          throw new Error(`Permission bulunamadı: ${permName}`);
        }
        return permDoc._id;
      });
    }

    const payload = {
      ...seed,
      permissions: permissionIds,
    };
    delete payload.permissionNames;

    return Role.findOneAndUpdate({ name: seed.name }, { $set: payload }, { upsert: true, new: true });
  });

  const results = await Promise.all(upserts);
  console.log(`Rol kayıtları güncellendi (${results.length})`);
  return results;
};

const seedAdminUser = async (rolesDocs) => {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.log('SEED_ADMIN_EMAIL veya SEED_ADMIN_PASSWORD tanımlı değil, admin oluşturulmadı.');
    return null;
  }

  const adminRole = rolesDocs.find((role) => role.name === roles.ADMIN);
  if (!adminRole) {
    throw new Error('Admin rolü bulunamadı, lütfen önce rol seed işlemini tamamlayın.');
  }

  const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() }).populate('roles');
  if (existingAdmin) {
    let updated = false;
    if (!Array.isArray(existingAdmin.roles) || existingAdmin.roles.length === 0) {
      existingAdmin.roles = [adminRole._id];
      updated = true;
    }
    if (existingAdmin.role) {
      existingAdmin.role = undefined;
      updated = true;
    }
    if (updated) {
      await existingAdmin.save();
      console.log(`Admin kullanıcısı rollerle güncellendi: ${existingAdmin.email}`);
    } else {
      console.log(`Admin kullanıcısı zaten mevcut: ${existingAdmin.email}`);
    }
    return existingAdmin;
  }

  const passwordHash = await hashPassword(adminPassword);

  const adminUser = await User.create({
    firstName: process.env.SEED_ADMIN_FIRST_NAME || 'Hermes',
    lastName: process.env.SEED_ADMIN_LAST_NAME || 'Admin',
    email: adminEmail.toLowerCase(),
    passwordHash,
    roles: [adminRole._id],
  });

  console.log(`Admin kullanıcısı oluşturuldu: ${adminUser.email}`);
  return adminUser;
};

const run = async () => {
  try {
    await connectDatabase();
    const roleDocs = await seedRoles();
    await seedAdminUser(roleDocs);
    console.log('Seed işlemi tamamlandı.');
    process.exit(0);
  } catch (err) {
    console.error('Seed sırasında hata oluştu:', err);
    process.exit(1);
  }
};

run();
