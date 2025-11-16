# Naming Convention Standardı

## Güncelleme Kuralları

**Ne zaman güncellenir:** Yeni isimlendirme kuralı belirlendiğinde, mevcut kural değiştiğinde, yeni dosya türü eklendiğinde.

**Format:** Bölüm başlığı altında (örn: ## Backend, ## Frontend, ## Docs), örnek dosya adları ve kod içi kullanım göster.

**Önemli:** Her yeni kural zorunlu olmalı, tutarlılık için tüm projeye uygulanmalı.

---

## Genel Kural

**Tüm dosya adları kebab-case, sadece React bileşenleri PascalCase**

## Hızlı Kurallar

1. **Dosya Adları:** kebab-case (tüm projede)
2. **React Bileşenleri:** PascalCase (zorunlu istisna)
3. **Kod İçi:**
   - Fonksiyon/değişken: camelCase
   - Sabitler: UPPER_SNAKE_CASE
   - Class/Model: PascalCase
4. **Env Variables:** UPPER_SNAKE_CASE
5. **API URLs:** kebab-case

## Detaylı Kurallar

### 1. Dosya ve Klasör Adları

#### Backend ve Frontend → kebab-case

```text
✅ DOĞRU:
  auth-guard.js
  user.model.js
  api-client.js
  validation-schemas.js
  seed-database.js

❌ YANLIŞ:
  authGuard.js         (camelCase)
  UserModel.js         (PascalCase)
  API_client.js        (snake_case)
```

#### Tek İstisna: React Bileşenleri → PascalCase

```text
✅ DOĞRU:
  components/
    LoginForm.jsx       (PascalCase - React zorunluluğu)
    MachineCard.jsx
    DashboardLayout.jsx

❌ YANLIŞ:
  components/
    login-form.jsx      (kebab-case)
    machineCard.jsx     (camelCase)
```

### 2. Kod İçi İsimlendirme

#### Fonksiyonlar ve Değişkenler → camelCase

```javascript
// ✅ DOĞRU
function formatDate(date) { ... }
function checkPermission(user, permission) { ... }

const accessToken = 'token';
const machineData = [...];
const isAuthenticated = true;
```

#### Sabitler → UPPER_SNAKE_CASE

```javascript
// ✅ DOĞRU
const API_BASE_URL = "http://localhost:5000/api";
const MAX_RETRY_COUNT = 3;
const JWT_ACCESS_EXPIRES_IN = "15m";
```

#### Class, Constructor, Model → PascalCase

```javascript
// ✅ DOĞRU
class AuthService { ... }
class MachineSimulator { ... }

const User = mongoose.model('User', userSchema);
const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
```

#### React Bileşenleri → PascalCase (zorunlu)

```javascript
// ✅ DOĞRU
export function LoginForm() { ... }
export function MachineCard() { ... }

// JSX'te kullanım
<LoginForm />
<MachineCard machineId={id} />
```

#### Custom Hooks → camelCase fonksiyon, kebab-case dosya

```javascript
// filepath: src/hooks/use-auth.js  ← kebab-case dosya

// ✅ DOĞRU
export function useAuth() {
  // camelCase fonksiyon (use* prefix zorunlu)
  const [user, setUser] = useState();
  return { user, login, logout };
}

// Kullanım
import { useAuth } from "@/hooks/use-auth";
const { user, login } = useAuth();
```

### 7. Import Alias Kullanımı

- `@/` alias’ı hem frontend hem backend’de proje kök `src/` dizinine işaret eder.
- Amaç: `../../services/token-service` gibi karmaşık relatif yollar yerine `@/services/token-service` formatını standart hale getirmek.
- Alias kullanırken dosya isimlendirme kuralları (kebab-case dosya, PascalCase bileşen) aynen geçerlidir.

### 3. Environment Variables

#### Tüm env değişkenleri → UPPER_SNAKE_CASE

```bash
# backend/.env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hermes_dev
JWT_ACCESS_SECRET=secret
JWT_REFRESH_SECRET=secret

# frontend/.env.local
VITE_API_URL=http://localhost:5000/api  # VITE_ prefix zorunlu
```

### 4. Database İsimlendirme

#### Database adı → snake_case

```text
hermes_dev
hermes_prod
hermes_test
```

#### MongoDB Collections → lowercase (Mongoose otomatik plural)

```javascript
// Model tanımı
const User = mongoose.model("User", userSchema);
// → Otomatik 'users' collection oluşturur

// Manuel collection adı (snake_case)
const AuditLog = mongoose.model("AuditLog", auditLogSchema, "audit_logs");
```

### 5. API Route İsimlendirme

#### URL'ler → kebab-case, lowercase

```javascript
// ✅ DOĞRU
router.post("/auth/login");
router.get("/machines/:id");
router.get("/audit-logs");
router.post("/refresh-token");

// ❌ YANLIŞ
router.post("/auth/loginUser"); // camelCase
router.get("/AuditLogs"); // PascalCase
```

### 6. Git Branch İsimlendirme

#### Branch adları → kebab-case

```bash
# ✅ DOĞRU
git checkout -b feature/user-authentication
git checkout -b feature/machine-simulation
git checkout -b fix/token-refresh-bug
git checkout -b hotfix/critical-security-patch

# ❌ YANLIŞ
git checkout -b feature/userAuthentication  (camelCase)
git checkout -b Feature/UserAuth            (PascalCase)
```

## Proje Yapısı Örneği

```text
hermes/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── user.model.js              # kebab-case
│   │   ├── middleware/
│   │   │   ├── auth-guard.js              # kebab-case
│   │   │   ├── permission-guard.js
│   │   │   └── error-handler.js
│   │   ├── services/
│   │   │   ├── auth.service.js            # kebab-case
│   │   │   └── token.service.js
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   └── seed-database.js           # kebab-case
│   │   └── config/
│   │       ├── database.js
│   │       └── env-validator.js           # kebab-case
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginForm.jsx              # PascalCase (React istisna)
│   │   │   ├── MachineCard.jsx
│   │   │   ├── MachineList.jsx
│   │   │   └── DashboardLayout.jsx
│   │   ├── pages/
│   │   │   ├── login-page.jsx             # kebab-case
│   │   │   ├── dashboard-page.jsx
│   │   │   └── machines-page.jsx
│   │   ├── lib/
│   │   │   ├── axios.js                   # kebab-case
│   │   │   ├── api-client.js
│   │   │   └── validation-schemas.js
│   │   ├── stores/
│   │   │   ├── auth-store.js              # kebab-case
│   │   │   └── ui-store.js
│   │   ├── hooks/
│   │   │   ├── use-auth.js                # kebab-case
│   │   │   ├── use-machines.js
│   │   │   └── use-permissions.js
│   │   └── utils/
│   │       ├── format-date.js             # kebab-case
│   │       └── permission-checker.js
│   └── .env.local
│
└── docs/
    ├── project-guidelines.md
    ├── specs/
    │   ├── project-report.md
    │   └── requirements.md
    ├── tasks/
    │   └── project-checklist.md
    ├── standart/
    │   ├── backend-decisions.md
    │   ├── frontend-decisions.md
    │   ├── technical-decisions.md
    │   └── naming-conventions.md
    └── logs/
        └── chat-summary.md
```

## Kod Örnekleri

### Backend Model (Mongoose)

```javascript
// filepath: backend/src/domains/auth/models/user-model.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Model adı PascalCase
const User = mongoose.model("User", userSchema);

module.exports = User;
```

### Backend Service

```javascript
// filepath: backend/src/domains/auth/services/auth-service.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user-model");

// Sabitler UPPER_SNAKE_CASE
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_EXPIRES_IN = "15m";

class AuthService {
  // Class adı PascalCase
  // Fonksiyon adı camelCase
  async registerUser(email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    return await newUser.save();
  }

  async generateAccessToken(userId) {
    // camelCase
    return jwt.sign({ userId }, JWT_ACCESS_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  }
}

module.exports = new AuthService();
```

### Frontend Component (React)

```javascript
// filepath: frontend/src/components/LoginForm.jsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validation-schemas"; // kebab-case import
import { useAuth } from "@/hooks/use-auth"; // kebab-case import

// Component adı PascalCase (zorunlu)
export function LoginForm() {
  // Değişken adları camelCase
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Fonksiyon adı camelCase
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>{/* JSX içeriği */}</form>
  );
}
```

### Frontend Store (Zustand)

```javascript
// filepath: frontend/src/stores/auth-store.js

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Sabitler UPPER_SNAKE_CASE
const STORAGE_KEY = "auth-storage";

// Store hook camelCase
export const useAuthStore = create(
  persist(
    (set) => ({
      // State değişkenleri camelCase
      user: null,
      tokens: null,
      isAuthenticated: false,

      // Actions camelCase
      login: (user, tokens) => set({ user, tokens, isAuthenticated: true }),

      logout: () => set({ user: null, tokens: null, isAuthenticated: false }),

      refreshTokens: (tokens) => set((state) => ({ ...state, tokens })),
    }),
    { name: STORAGE_KEY }
  )
);
```

### Frontend Axios Config

```javascript
// filepath: frontend/src/lib/axios.js

import axios from "axios";
import { useAuthStore } from "@/stores/auth-store";

// Sabitler UPPER_SNAKE_CASE
const API_BASE_URL = import.meta.env.VITE_API_URL;
const REQUEST_TIMEOUT = 10000;

// Export edilen değişken camelCase
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const tokens = useAuthStore.getState().tokens;
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

export default api;
```

## Özet Tablo

| Kategori               | Convention       | Örnek                 | Gerekçe                       |
| ---------------------- | ---------------- | --------------------- | ----------------------------- |
| **Backend Dosyaları**  | kebab-case       | `auth-guard.js`       | Proje kuralı                  |
| **Frontend Dosyaları** | kebab-case       | `api-client.js`       | Proje kuralı                  |
| **React Bileşenleri**  | PascalCase       | `LoginForm.jsx`       | React zorunluluğu             |
| **Fonksiyonlar**       | camelCase        | `formatDate()`        | JavaScript standardı          |
| **Değişkenler**        | camelCase        | `accessToken`         | JavaScript standardı          |
| **Sabitler**           | UPPER_SNAKE_CASE | `API_BASE_URL`        | Geleneksel standart           |
| **Classes/Models**     | PascalCase       | `User`, `AuthService` | JavaScript/Mongoose standardı |
| **Custom Hooks**       | camelCase        | `useAuth()`           | React Hook kuralı             |
| **Hook Dosyaları**     | kebab-case       | `use-auth.js`         | Proje kuralı                  |
| **Env Variables**      | UPPER_SNAKE_CASE | `JWT_SECRET`          | Standart                      |
| **DB Collections**     | lowercase        | `users`, `audit_logs` | MongoDB standardı             |
| **Database Adı**       | snake_case       | `hermes_dev`          | Proje kuralı                  |
| **API URLs**           | kebab-case       | `/audit-logs`         | REST API standardı            |
| **Git Branches**       | kebab-case       | `feature/user-auth`   | Git best practice             |

## ESLint Yapılandırması (Önerilen)

```json
// filepath: frontend/.eslintrc.json
{
  "rules": {
    "react/jsx-pascal-case": "error",
    "camelcase": [
      "error",
      {
        "properties": "never",
        "ignoreDestructuring": true,
        "allow": ["^VITE_", "^API_", "JWT_.*"]
      }
    ]
  }
}
```
