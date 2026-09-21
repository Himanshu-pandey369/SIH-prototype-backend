# AI Safe - Backend API (SIH 2026 Prototype)

AI Safe is an Android AR-based industrial safety training and certification platform designed for workers in mining, steel, and mica industries.

This backend provides robust REST APIs for:
1. **Unity Android AR application** (training scenarios, hazard checklists, offline synchronization)
2. **React Admin Dashboard** (analytics, worker records, certificate management)
3. **Public Certificate Verification Website** (QR-based instant verification)

---

## 🚀 Prototype Scope

For the SIH 2026 prototype, the system implements **ONLY ONE** module:
- **`SPACE_HAZARD`**: Confined Space & Space Hazard Safety
  - Target hazards: Oxygen deficiency (< 19.5%), H2S/CO toxic gases, mechanical ventilation, Lockout/Tagout (LOTO), non-entry rescue retrieval
  - Multilingual assessment: **English**, **Hindi**, and **Santali** (`sat`)
  - Auto-generated digital certificates with unique IDs (e.g. `SURAKSHA-SPACE-2026-0001`) and visual QR codes

---

## 🛠️ Tech Stack & Conventions

- **Runtime**: Node.js (ES Modules `"type": "module"`)
- **Framework**: Express.js
- **Database**: MongoDB via Mongoose
- **Security**: Single JWT access token (`{ userId }`), `bcryptjs`, CORS with credentials, HTTP-only cookies
- **API Versioning**: `/api/v1/...`
- **Architecture**: MVC pattern with controller-level direct HTTP status codes and try/catch (no custom Error class, no global error middleware)

---

## 📦 Project Structure

```text
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── adminController.js    # Dashboard stats, worker & certificate management
│   │   ├── assessmentController.js # Questions retrieval & scoring engine
│   │   ├── authController.js     # Register, login, me, logout
│   │   ├── certificateController.js # Verification (public) & user certificates
│   │   ├── healthController.js   # Health check
│   │   ├── moduleController.js   # Module catalog (SPACE_HAZARD)
│   │   ├── progressController.js # Worker scenario steps & hazard checklist
│   │   ├── syncController.js     # Offline batch sync engine
│   │   └── trainingResultController.js # AR simulation result logger
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification & admin guard
│   ├── models/
│   │   ├── Assessment.js         # Multilingual questions & hidden answer keys
│   │   ├── Certificate.js        # Digital certificate with QR data URL
│   │   ├── SyncRecord.js         # Offline sync idempotency records
│   │   ├── TrainingModule.js     # Module config & passing threshold
│   │   ├── TrainingResult.js     # AR scenario metrics
│   │   ├── User.js               # Worker & admin accounts
│   │   └── WorkerProgress.js     # Sequential step tracking
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── assessmentRoutes.js
│   │   ├── authRoutes.js
│   │   ├── certificateRoutes.js
│   │   ├── healthRoutes.js
│   │   ├── moduleRoutes.js
│   │   ├── progressRoutes.js
│   │   └── syncRoutes.js
│   ├── tests/
│   │   └── testSuite.js          # Automated end-to-end test suite
│   ├── utils/
│   │   ├── certificateGenerator.js # SURAKSHA-SPACE-2026-XXXX generator
│   │   ├── qrCodeGenerator.js    # High-res base64 QR code builder
│   │   ├── seeder.js             # Seeds admin, SPACE_HAZARD module & questions
│   │   └── token.js              # JWT sign & cookie management
│   ├── app.js                    # Express application setup
│   └── server.js                 # Server listener & auto-seeder
├── .env.example
├── package.json
└── README.md
```

---

## ⚙️ Setup & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory (based on `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/ai_safe
JWT_ACCESS_SECRET=your_jwt_access_secret_key_here
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:3000
```

### 3. Run Automated Tests
```bash
npm test
```

### 4. Start the Server
```bash
# Production / Standard start
npm start

# Development with auto-restart
npm run dev
```

The initial run automatically provisions:
- Default Admin: `admin@aisafe.org` / `Admin@123456`
- Active Module: `SPACE_HAZARD`
- Multilingual Assessment: 5 industry-standard Confined Space safety questions with English, Hindi, and Santali localizations

---

## 📡 Key API Endpoints

### 1. Authentication
- `POST /api/v1/auth/register` (Public worker registration)
- `POST /api/v1/auth/login` (Returns JWT & sets HTTP-only cookie)
- `GET /api/v1/auth/me` (Protected profile lookup)
- `POST /api/v1/auth/logout`

### 2. Training Module
- `GET /api/v1/modules` (List active modules — returns `SPACE_HAZARD`)
- `GET /api/v1/modules/SPACE_HAZARD`

### 3. Training Progress & Simulation Results
- `GET /api/v1/progress/SPACE_HAZARD` (Worker scenario checklist)
- `POST /api/v1/progress/step` (Update completed AR step or found hazard)
- `POST /api/v1/training-results` (Log simulation completion)

### 4. Assessment & Certification
- `GET /api/v1/assessments/module/SPACE_HAZARD?lang=sat` (Fetch localized questions)
- `POST /api/v1/assessments/submit` (Score test, pass threshold $\ge 75\%$, auto-issues certificate)

### 5. Digital Certificates & Public QR Verification
- `GET /api/v1/certificates/verify/:certificateId` (**PUBLIC - NO AUTH REQUIRED**)
  - Returns sanitized certificate details + embedded base64 PNG QR code
- `GET /api/v1/certificates/my-certificates` (Worker certificate list)

### 6. Offline Batch Synchronization
- `POST /api/v1/sync/batch` (Upload offline simulation, progress, and assessments with idempotency)

### 7. Admin Dashboard & Operations
- `GET /api/v1/admin/dashboard` (Analytics & statistics)
- `GET /api/v1/admin/workers` (Worker accounts)
- `GET /api/v1/admin/certificates` (All certificates)
- `PATCH /api/v1/admin/certificates/:certificateId/status` (Revoke / reinstate)
