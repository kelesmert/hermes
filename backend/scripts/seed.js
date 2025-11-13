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
const {
  hashPassword,
  comparePassword,
} = require("../src/utils/password");

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
    idealCycleTime: 3.5,
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

const seedAdminUser = async (rolesDocs) => {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.log(
      "SEED_ADMIN_EMAIL veya SEED_ADMIN_PASSWORD tanımlı değil, admin oluşturulmadı."
    );
    return null;
  }

  const adminRole = rolesDocs.find((role) => role.name === roles.MASTER);
  if (!adminRole) {
    throw new Error(
      "Master rolü bulunamadı, lütfen önce rol seed işlemini tamamlayın."
    );
  }

  const adminUsername = (
    process.env.SEED_ADMIN_USERNAME || "master"
  ).toLowerCase();

  const existingAdmin =
    (await User.findOne({ username: adminUsername })
      .select("+passwordHash")
      .populate("roles")) ||
    (await User.findOne({ email: adminEmail.toLowerCase() })
      .select("+passwordHash")
      .populate("roles"));
  if (existingAdmin) {
    let updated = false;
    if (!existingAdmin.username) {
      existingAdmin.username = adminUsername;
      updated = true;
    }
    if (
      !Array.isArray(existingAdmin.roles) ||
      existingAdmin.roles.length === 0
    ) {
      existingAdmin.roles = [adminRole._id];
      updated = true;
    }
    if (existingAdmin.role) {
      existingAdmin.role = undefined;
      updated = true;
    }
    const passwordMatches =
      existingAdmin.passwordHash &&
      (await comparePassword(adminPassword, existingAdmin.passwordHash));
    if (!passwordMatches) {
      existingAdmin.passwordHash = await hashPassword(adminPassword);
      updated = true;
    }
    if (updated) {
      await existingAdmin.save();
      console.log(
        `Master kullanıcısı rollerle güncellendi: ${
          existingAdmin.email || existingAdmin.username
        }`
      );
    } else {
      console.log(
        `Master kullanıcısı zaten mevcut: ${
          existingAdmin.email || existingAdmin.username
        }`
      );
    }
    return existingAdmin;
  }

  const passwordHash = await hashPassword(adminPassword);

  const adminUser = await User.create({
    username: adminUsername,
    firstName: process.env.SEED_ADMIN_FIRST_NAME || "Hermes",
    lastName: process.env.SEED_ADMIN_LAST_NAME || "Admin",
    email: adminEmail.toLowerCase(),
    passwordHash,
    roles: [adminRole._id],
  });

  console.log(
    `Master kullanıcısı oluşturuldu: ${adminUser.email || adminUser.username}`
  );
  return adminUser;
};

const seedSysUser = async (rolesDocs) => {
  const sysEmail = process.env.SEED_SYS_EMAIL;
  const sysUsername = (process.env.SEED_SYS_USERNAME || "sys").toLowerCase();
  const sysPassword = process.env.SEED_SYS_PASSWORD;

  if (!sysEmail || !sysPassword) {
    console.log(
      "SEED_SYS_EMAIL veya SEED_SYS_PASSWORD tanımlı değil, sys kullanıcısı oluşturulmadı."
    );
    return null;
  }

  const adminRole = rolesDocs.find((role) => role.name === roles.MASTER);
  if (!adminRole) {
    throw new Error("Admin rolü bulunamadı, sys kullanıcısı oluşturulamadı.");
  }

  const existingSys =
    (await User.findOne({ username: sysUsername })
      .select("+passwordHash")
      .populate("roles")) ||
    (await User.findOne({ email: sysEmail.toLowerCase() })
      .select("+passwordHash")
      .populate("roles"));
  if (existingSys) {
    let updated = false;
    if (!existingSys.username) {
      existingSys.username = sysUsername;
      updated = true;
    }
    const hasAdminRole = existingSys.roles.some((role) =>
      role._id.equals(adminRole._id)
    );
    if (!hasAdminRole) {
      existingSys.roles.push(adminRole._id);
      updated = true;
    }
    const passwordMatches =
      existingSys.passwordHash &&
      (await comparePassword(sysPassword, existingSys.passwordHash));
    if (!passwordMatches) {
      existingSys.passwordHash = await hashPassword(sysPassword);
      updated = true;
    }
    if (updated) {
      await existingSys.save();
      console.log(
        `Sys kullanıcısı güncellendi: ${
          existingSys.email || existingSys.username
        }`
      );
    } else {
      console.log(
        `Sys kullanıcısı zaten mevcut: ${
          existingSys.email || existingSys.username
        }`
      );
    }
    return existingSys;
  }

  const passwordHash = await hashPassword(sysPassword);

  const sysUser = await User.create({
    username: sysUsername,
    firstName: process.env.SEED_SYS_FIRST_NAME || "System",
    lastName: process.env.SEED_SYS_LAST_NAME || "Observer",
    email: sysEmail.toLowerCase(),
    passwordHash,
    roles: [adminRole._id],
  });

  console.log(`Sys kullanıcısı oluşturuldu: ${sysUser.email}`);
  return sysUser;
};

const seedViewerUser = async (rolesDocs) => {
  const viewerEmail = process.env.SEED_VIEWER_EMAIL || "viewer@hermes.local";
  const viewerUsername = (
    process.env.SEED_VIEWER_USERNAME || "viewer"
  ).toLowerCase();
  const viewerPassword = process.env.SEED_VIEWER_PASSWORD || "Viewer123!";

  const viewerRole = rolesDocs.find((role) => role.name === roles.VIEWER);
  if (!viewerRole) {
    throw new Error(
      "Viewer rolü bulunamadı, viewer kullanıcısı oluşturulamadı."
    );
  }

  const existingViewer =
    (await User.findOne({ username: viewerUsername })
      .select("+passwordHash")
      .populate("roles")) ||
    (await User.findOne({ email: viewerEmail.toLowerCase() })
      .select("+passwordHash")
      .populate("roles"));
  if (existingViewer) {
    let updated = false;
    if (!existingViewer.username) {
      existingViewer.username = viewerUsername;
      updated = true;
    }
    const hasViewerRole = existingViewer.roles.some((role) =>
      role._id.equals(viewerRole._id)
    );
    if (!hasViewerRole) {
      existingViewer.roles.push(viewerRole._id);
      updated = true;
    }
    const passwordMatches =
      existingViewer.passwordHash &&
      (await comparePassword(viewerPassword, existingViewer.passwordHash));
    if (!passwordMatches) {
      existingViewer.passwordHash = await hashPassword(viewerPassword);
      updated = true;
    }
    if (updated) {
      await existingViewer.save();
      console.log(
        `Viewer kullanıcısı güncellendi: ${
          existingViewer.email || existingViewer.username
        }`
      );
    } else {
      console.log(
        `Viewer kullanıcısı zaten mevcut: ${
          existingViewer.email || existingViewer.username
        }`
      );
    }
    return existingViewer;
  }

  const passwordHash = await hashPassword(viewerPassword);

  const viewerUser = await User.create({
    username: viewerUsername,
    firstName: "Viewer",
    lastName: "User",
    email: viewerEmail.toLowerCase(),
    passwordHash,
    roles: [viewerRole._id],
  });

  console.log(
    `Viewer kullanıcısı oluşturuldu: ${viewerUser.email || viewerUser.username}`
  );
  return viewerUser;
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
    await seedAdminUser(roleDocs);
    await seedSysUser(roleDocs);
    await seedViewerUser(roleDocs);
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
