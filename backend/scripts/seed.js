/* eslint-disable no-console */
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const roles = require("../src/constants/roles");
const permissions = require("../src/constants/permissions");
const machineStatuses = require("../src/constants/machine-statuses");
const { connectDatabase } = require("../src/config/database");
const Permission = require("../src/domains/auth/models/permission-model");
const Role = require("../src/domains/auth/models/role-model");
const User = require("../src/domains/auth/models/user-model");
const Machine = require("../src/domains/machines/models/machine-model");
const MachineTelemetry = require("../src/domains/machines/models/machine-telemetry-model");
const Part = require("../src/domains/parts/models/part-model");
const { hashPassword, comparePassword } = require("../src/utils/password");

const sanitizeUsernameBase = (value) =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "")
    .toLowerCase();

const ensureUsernames = async () => {
  const usersWithoutUsername = await User.find({
    $or: [
      { username: { $exists: false } },
      { username: null },
      { username: "" },
    ],
  });

  if (usersWithoutUsername.length === 0) {
    return;
  }

  for (const user of usersWithoutUsername) {
    const baseSource =
      user.email?.split("@")[0] ||
      `${user.firstName || ""}${user.lastName || ""}` ||
      `user${Date.now()}`;
    let base = sanitizeUsernameBase(baseSource);
    if (!base) {
      base = `user${Date.now()}`;
    }
    let candidate = base;
    let suffix = 1;
    // eslint-disable-next-line no-await-in-loop
    while (await User.exists({ username: candidate })) {
      candidate = `${base}${suffix}`;
      suffix += 1;
    }
    user.username = candidate;
    // eslint-disable-next-line no-await-in-loop
    await user.save();
    console.log(`Eksik username güncellendi: ${user._id} -> ${candidate}`);
  }
};

const permissionSeeds = [
  {
    name: permissions.DASHBOARD_READ,
    label: "Dashboard Görüntüleme",
    description: "Genel dashboard metriklerini okuma izni",
    category: "dashboard",
  },
  {
    name: permissions.MACHINES_READ,
    label: "Makine Görüntüleme",
    description: "Tüm makine kayıtlarını görüntüleme",
    category: "machines",
  },
  {
    name: permissions.MACHINES_WRITE,
    label: "Makine Yönetimi",
    description: "Makine kayıtlarında değişiklik yapma",
    category: "machines",
  },
  {
    name: permissions.MACHINES_UPDATE_OWN,
    label: "Kendi Makinesini Güncelle",
    description: "Kullanıcıya atanmış makinelerde işlem yapma",
    category: "machines",
  },
  {
    name: permissions.REPORTS_READ,
    label: "Raporları Görüntüle",
    description: "Analitik ve rapor ekranlarını okuma",
    category: "reports",
  },
  {
    name: permissions.REPORTS_EXPORT,
    label: "Rapor Dışa Aktarma",
    description: "CSV/Excel vb. çıktılar alma",
    category: "reports",
  },
  {
    name: permissions.PRODUCTION_READ,
    label: "İş Emirlerini Görüntüle",
    description: "Job order ve üretim verilerini okuma",
    category: "production",
  },
  {
    name: permissions.PRODUCTION_MANAGE,
    label: "İş Emri Yönetimi",
    description: "Job order oluşturma/güncelleme ve yönetme",
    category: "production",
  },
  {
    name: permissions.USERS_MANAGE,
    label: "Kullanıcı Yönetimi",
    description: "Kullanıcı oluşturma/güncelleme/silme",
    category: "users",
  },
  {
    name: permissions.ROLES_MANAGE,
    label: "Rol Yönetimi",
    description: "Rolleri ve izinlerini düzenleme",
    category: "roles",
  },
  {
    name: permissions.AUDIT_READ,
    label: "Audit Log Görüntüleme",
    description: "Audit log kayıtlarını okuma",
    category: "audit",
  },
  {
    name: permissions.WORK_ORDERS_EXECUTE,
    label: "İş Emri Yürütme",
    description:
      "İş emirlerini başlatma/durdurma ve operasyon adımlarını yürütme",
    category: "execution",
  },
  {
    name: permissions.SHIFTS_MANAGE,
    label: "Vardiya Yönetimi",
    description: "Vardiya açma/kapama ve vardiya planlarını yönetme",
    category: "shifts",
  },
  {
    name: permissions.PARTS_READ,
    label: "Parça Görüntüleme",
    description: "Parça tanımlarını listeleme ve görüntüleme",
    category: "parts",
  },
  {
    name: permissions.PARTS_MANAGE,
    label: "Parça Yönetimi",
    description: "Parça kayıtları üzerinde CRUD işlemleri yapma",
    category: "parts",
  },
];

const roleSeeds = [
  {
    name: roles.MASTER,
    label: "Master",
    description: "Sistemdeki tüm yetkilere sahip rol.",
    permissionNames: ["*"],
  },
  {
    name: roles.SUPERVISOR,
    label: "Supervisor",
    description:
      "Operatörleri ve makineleri yönetir, iş emirlerini ve vardiya üretimini kontrol eder, raporları görüntüler.",
    permissionNames: [
      permissions.DASHBOARD_READ,
      permissions.MACHINES_READ,
      permissions.MACHINES_WRITE,
      permissions.MACHINES_UPDATE_OWN,
      permissions.PRODUCTION_READ,
      permissions.PRODUCTION_MANAGE,
      permissions.PARTS_READ,
      permissions.PARTS_MANAGE,
      permissions.REPORTS_READ,
      permissions.REPORTS_EXPORT,
      permissions.WORK_ORDERS_EXECUTE,
      permissions.SHIFTS_MANAGE,
      permissions.USERS_MANAGE,
    ],
  },
  {
    name: roles.OPERATOR,
    label: "Operator",
    description:
      "Atanmış istasyondaki işi yürütür, makine ve iş emri durumlarını günceller.",
    permissionNames: [
      permissions.DASHBOARD_READ,
      permissions.MACHINES_READ,
      permissions.MACHINES_UPDATE_OWN,
      permissions.PRODUCTION_READ,
      permissions.PARTS_READ,
      permissions.WORK_ORDERS_EXECUTE,
    ],
    isDefault: true,
  },
  {
    name: roles.VIEWER,
    label: "Viewer",
    description: "Sadece görüntüleme yetkisi.",
    permissionNames: [permissions.DASHBOARD_READ, permissions.MACHINES_READ],
  },
];

const userSeeds = [
  {
    username: "sys",
    firstName: "Hermes",
    lastName: "Admin",
    email: "sys@hermes.local",
    password: "syssys",
    role: roles.MASTER,
  },
  {
    username: "kelesmert",
    firstName: "Mert",
    lastName: "Keles",
    email: "mertkeles@hermes.local",
    password: "kelesmert",
    role: roles.MASTER,
  },
  {
    username: "supervisor1",
    firstName: "Zeynep",
    lastName: "Kaya",
    email: "zeynepkaya@hermes.local",
    password: "supervisor1",
    role: roles.SUPERVISOR,
  },
  {
    username: "supervisor2",
    firstName: "Emre",
    lastName: "Çelik",
    email: "emrecelik@hermes.local",
    password: "supervisor2",
    role: roles.SUPERVISOR,
  },
  {
    username: "operator1",
    firstName: "Burak",
    lastName: "Şahin",
    email: "buraksahin@hermes.local",
    password: "operator1",
    role: roles.OPERATOR,
  },
  {
    username: "operator2",
    firstName: "Ahmet",
    lastName: "Özdemir",
    email: "ahmetozdemir@hermes.local",
    password: "operator2",
    role: roles.OPERATOR,
  },
  {
    username: "viewer1",
    firstName: "Murat",
    lastName: "Arslan",
    email: "muratarslan@hermes.local",
    password: "viewer1",
    role: roles.VIEWER,
  },
];

const machineSeeds = [
  {
    code: "MCH-001",
    name: "Simülasyon Presi",
    status: machineStatuses.UNKNOWN,
    tags: ["press", "line-a"],
  },
  {
    code: "MCH-002",
    name: "CNC Kesim",
    status: machineStatuses.UNKNOWN,
    tags: ["cnc", "line-b"],
  },
];

const seedPermissions = async () => {
  const upserts = permissionSeeds.map((seed) =>
    Permission.findOneAndUpdate(
      { name: seed.name },
      { $set: seed },
      { upsert: true, new: true }
    )
  );
  const results = await Promise.all(upserts);
  console.log(`Permission kayıtları güncellendi (${results.length})`);
  return results;
};

const partSeeds = [
  {
    code: "PART-VIDA-M8X20",
    name: "Vida M8x20",
    description: "Paslanmaz çelik vida",
    idealCycleTime: 4,
    category: "fasteners",
    unit: "piece",
    tags: ["critical", "fastener"],
    defaultMachineSettings: {
      feedRate: 0.07,
      spindleSpeed: 3800,
      torque: 0.45,
    },
  },
  {
    code: "PART-PROFIL-ALU50",
    name: "Alüminyum Profil 50mm",
    description: "50mm genişlikte alüminyum profil",
    idealCycleTime: 6,
    category: "mechanical_plastics",
    unit: "piece",
    tags: ["profile", "line-b"],
    defaultMachineSettings: {
      moldTemp: 210,
      coolingTime: 8,
      pressure: 32,
    },
  },
  {
    code: "PART-MB-001",
    name: "Anakart Seti",
    description: "Laptop anakart montaj seti",
    idealCycleTime: 600,
    category: "electronics",
    unit: "set",
    tags: ["motherboard", "electronics"],
    defaultMachineSettings: {
      placementSpeed: 125,
      reflowTemp: 245,
      solderType: "Sn63Pb37",
    },
  },
];

const seedRoles = async () => {
  const permissionDocs = await seedPermissions();
  const permissionMap = new Map(permissionDocs.map((doc) => [doc.name, doc]));

  const upserts = roleSeeds.map((seed) => {
    let permissionIds = [];
    if (seed.permissionNames?.includes("*")) {
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

    return Role.findOneAndUpdate(
      { name: seed.name },
      { $set: payload },
      { upsert: true, new: true }
    );
  });

  const results = await Promise.all(upserts);
  console.log(`Rol kayıtları güncellendi (${results.length})`);
  return results;
};

const seedUsers = async (rolesDocs) => {
  const roleMap = new Map(rolesDocs.map((role) => [role.name, role]));

  for (const seed of userSeeds) {
    const roleDoc = roleMap.get(seed.role);
    if (!roleDoc) {
      throw new Error(`Rol bulunamadı: ${seed.role}`);
    }

    const username = seed.username.toLowerCase();
    const email = seed.email.toLowerCase();

    const existingUser =
      (await User.findOne({ username })
        .select("+passwordHash")
        .populate("roles")) ||
      (await User.findOne({ email }).select("+passwordHash").populate("roles"));

    if (existingUser) {
      let updated = false;
      if (existingUser.username !== username) {
        existingUser.username = username;
        updated = true;
      }
      if (existingUser.email !== email) {
        existingUser.email = email;
        updated = true;
      }
      if (existingUser.firstName !== seed.firstName) {
        existingUser.firstName = seed.firstName;
        updated = true;
      }
      if (existingUser.lastName !== seed.lastName) {
        existingUser.lastName = seed.lastName;
        updated = true;
      }
      if (existingUser.role) {
        existingUser.role = undefined;
        updated = true;
      }
      const hasRole =
        Array.isArray(existingUser.roles) &&
        existingUser.roles.length === 1 &&
        existingUser.roles[0]._id.equals(roleDoc._id);
      if (!hasRole) {
        existingUser.roles = [roleDoc._id];
        updated = true;
      }
      const passwordMatches =
        existingUser.passwordHash &&
        (await comparePassword(seed.password, existingUser.passwordHash));
      if (!passwordMatches) {
        existingUser.passwordHash = await hashPassword(seed.password);
        updated = true;
      }
      if (updated) {
        await existingUser.save();
        console.log(
          `Kullanıcı güncellendi: ${
            existingUser.email || existingUser.username
          }`
        );
      } else {
        console.log(
          `Kullanıcı zaten mevcut: ${
            existingUser.email || existingUser.username
          }`
        );
      }
      continue;
    }

    const passwordHash = await hashPassword(seed.password);
    const createdUser = await User.create({
      username,
      firstName: seed.firstName,
      lastName: seed.lastName,
      email,
      passwordHash,
      roles: [roleDoc._id],
    });
    console.log(
      `Kullanıcı oluşturuldu: ${createdUser.email || createdUser.username}`
    );
  }
};

const seedMachines = async () => {
  const upserts = machineSeeds.map((seed) => {
    const normalizedCode = seed.code.trim().toUpperCase();
    return Machine.findOneAndUpdate(
      { code: normalizedCode },
      {
        $set: {
          code: normalizedCode,
          name: seed.name,
          status: seed.status || machineStatuses.UNKNOWN,
          tags: seed.tags || [],
          isActive: true,
        },
      },
      { upsert: true, new: true }
    );
  });
  const results = await Promise.all(upserts);
  console.log(`Makine kayıtları güncellendi (${results.length})`);
  return results;
};

const seedParts = async (machines) => {
  const machineMap = new Map(
    (machines || []).map((machine) => [machine.code, machine])
  );

  const payloads = partSeeds.map((seed) => {
    const compatibleMachines = [];
    if (seed.tags?.includes("fastener") && machineMap.has("MCH-001")) {
      compatibleMachines.push(machineMap.get("MCH-001")._id);
    }
    if (seed.tags?.includes("profile") && machineMap.has("MCH-002")) {
      compatibleMachines.push(machineMap.get("MCH-002")._id);
    }
    return {
      ...seed,
      compatibleMachines,
    };
  });

  const upserts = payloads.map((payload) =>
    Part.findOneAndUpdate(
      { code: payload.code },
      { $set: payload },
      { upsert: true, new: true }
    )
  );
  const results = await Promise.all(upserts);
  console.log(`Parça kayıtları güncellendi (${results.length})`);
  return results;
};

const seedTelemetry = async (machines) => {
  if (!machines || machines.length === 0) {
    console.log("Telemetry seed için makine bulunamadı.");
    return;
  }

  await MachineTelemetry.deleteMany({ source: "seed" });

  const baseTime = Date.now();
  const docs = [];

  machines.forEach((machine, index) => {
    const tempBase = 55 + index * 5;
    const torqueBase = 110 + index * 8;
    const energyBase = 2.5 + index * 0.5;

    docs.push(
      {
        machine: machine._id,
        timestamp: new Date(baseTime - 10 * 60 * 1000 + index * 1000),
        signalValue: 1,
        metrics: {
          temperatureC: tempBase,
          torqueNm: torqueBase,
          energyKwh: energyBase,
        },
        intervalMs: 5000,
        source: "seed",
      },
      {
        machine: machine._id,
        timestamp: new Date(baseTime - 2 * 60 * 1000 + index * 1000),
        signalValue: 0,
        metrics: {
          temperatureC: tempBase + 3,
          torqueNm: torqueBase - 10,
          energyKwh: energyBase * 0.3,
        },
        intervalMs: 5000,
        source: "seed",
      },
      {
        machine: machine._id,
        timestamp: new Date(baseTime - 30 * 1000 + index * 1000),
        signalValue: 1,
        metrics: {
          temperatureC: tempBase + 1,
          torqueNm: torqueBase + 5,
          energyKwh: energyBase + 0.4,
        },
        intervalMs: 5000,
        source: "seed",
      }
    );
  });

  await MachineTelemetry.insertMany(docs);
  console.log(`Telemetry seed kayıtları eklendi (${docs.length})`);
};

const run = async () => {
  try {
    await connectDatabase();
    await ensureUsernames();
    const roleDocs = await seedRoles();
    await seedUsers(roleDocs);
    const machines = await seedMachines();
    await seedParts(machines);
    await seedTelemetry(machines);
    console.log("Seed işlemi tamamlandı.");
    process.exit(0);
  } catch (err) {
    console.error("Seed sırasında hata oluştu:", err);
    process.exit(1);
  }
};

run();
