# Hospital Management System (HMS)

A full-stack, enterprise-grade **Hospital Management System (HMS)** built with a **FastAPI** Python backend and a **React + TypeScript + Vite** frontend.

Designed for multi-branch hospital operations, featuring comprehensive workflows for Super Admin, Reception & OPD, Doctors & Clinical Care, IPD (In-Patient Department), Pharmacy, Laboratory Diagnostics, and Central Store & Inventory Management.

---

## 🌟 Key Features & Modules

- 🏢 **Multi-Branch Operations**: Seamless multi-hospital / multi-branch support across all operational modules.
- 🔐 **Role-Based Access Control (RBAC)**: Fine-grained roles (`super_admin`, `admin`, `reception`, `doctor`, `nurse`, `pharmacy`, `lab`, `store_manager`).
- 🩺 **OPD & Queue Management**: Patient registration, appointment scheduling, real-time queue tracking, and walk-in token generation.
- 👨‍⚕️ **Clinical Consultations**: Doctor workbench for electronic health records, diagnosis, digital prescriptions, and vital tracking.
- 🏥 **IPD Management**: Bed allocation, ward transfers, nursing notes, vitals logging, and discharge summaries.
- 💊 **Pharmacy Management**: POS invoicing, medicine stock management, prescription fulfillment, batch tracking, and returns.
- 🧪 **Laboratory Diagnostics**: Test order management, sample collection & processing, result entry, and PDF report generation.
- 📦 **Store & Inventory**: Purchase Orders (PO), Goods Receipt Notes (GRN), stock transfers, reorder notifications, and batch management.
- ⚙️ **Super Admin Dashboard**: Hospital profile branding, department management, user administration, and system audit logs.

---

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **ORM & DB**: SQLAlchemy v2 + PostgreSQL (or SQLite for dev)
- **Migrations**: Alembic
- **Validation**: Pydantic v2 & Pydantic Settings
- **Auth & Security**: JWT (`python-jose`) + `passlib[bcrypt]`
- **Server**: Uvicorn (ASGI)

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Routing**: React Router DOM v6
- **Icons & Styling**: Lucide React + Vanilla CSS Design System
- **HTTP Client**: Axios with request/response interceptors

---

## 📁 Repository Structure

```
hms/
├── backend/                  # FastAPI Python Backend
│   ├── alembic/              # Alembic database migration revisions & config
│   ├── app/                  # Application core, models, routers, schemas, services
│   ├── alembic.ini           # Alembic settings
│   ├── Dockerfile            # Container build specification
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # React + TypeScript + Vite Frontend
│   ├── src/
│   │   ├── components/       # Shared UI components (Common, Dashboard, Nurse)
│   │   ├── context/          # React Context providers (Auth, HMS, Lab, Nurse, Pharmacy, SuperAdmin)
│   │   ├── pages/            # Feature pages (Auth, Common, Doctor, Lab, Landing, Nurse, Patient, Pharmacy, Reception, Store, SuperAdmin)
│   │   ├── services/         # Axios API service client
│   │   ├── types/            # TypeScript type definitions (hms, nurse, store, superAdmin)
│   │   └── utils/            # Utility helpers & formatters
│   └── package.json          # Frontend dependencies & npm scripts
│
├── CHANGELOG.md              # Project revision history
├── PROJECT_STRUCTURE.md      # Detailed directory architecture documentation
├── README.md                 # Root documentation (this file)
└── .gitignore                # Workspace git ignore rules
```

---

## ⚡ Getting Started

### Prerequisites
- **Python** >= 3.10
- **Node.js** >= 18
- **npm** or **bun** / **yarn**

---

### 1. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Create & activate virtual environment
python -m venv venv

# Windows PowerShell / CMD:
.\venv\Scripts\activate

# Mac / Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env from template
cp .env.example .env

# Run database migrations
alembic upgrade head

# Seed initial superadmin & system accounts
python -m app.seed

# Start backend dev server
uvicorn app.main:app --reload
```

Backend will be live at **`http://localhost:8000`**  
- **Swagger Interactive API Docs**: `http://localhost:8000/docs`  
- **ReDoc API Docs**: `http://localhost:8000/redoc`

---

### 2. Frontend Setup

```bash
# Navigate to frontend folder
cd frontend

# Install packages
npm install

# Start Vite development server
npm run dev
```

Frontend will be live at **`http://localhost:5173`** (or `http://localhost:3000`).

---

## 🔑 Pre-Configured Test Accounts (Default Password: `ChangeMe@123`)

| Username / Email | Role | Accessible Modules |
|---|---|---|
| `superadmin` / `admin@hospital.com` | `super_admin` | Super Admin Dashboard, Branding, Depts, Staff |
| `reception` / `reception@hospital.com` | `reception` | Patients, OPD Queue, Booking, Tokens |
| `doctor` / `doctor@hospital.com` | `doctor` | Doctor Workbench, Consultations, E-Prescriptions |
| `nurse` / `nurse@hospital.com` | `nurse` | IPD Bed Allocations, Vitals, Nursing Care |
| `pharmacy` / `pharmacy@hospital.com` | `pharmacy` | Drug POS, Stock Batches, Prescriptions |
| `lab` / `lab@hospital.com` | `lab` | Test Requests, Sample Collection, Results |
| `store` / `store@hospital.com` | `store_manager` | Inventory Items, POs, GRN, Stock Inward/Outward |

---

## 🗄️ Database Migrations (Alembic)

```bash
cd backend

# Generate a new migration script after changing models in app/models/
alembic revision --autogenerate -m "Add new feature columns"

# Apply pending migrations to database
alembic upgrade head
```

---

## 📜 Documentation & References

- [PROJECT_STRUCTURE.md](file:///e:/hms/PROJECT_STRUCTURE.md) — Complete folder layout reference
- [backend/README.md](file:///e:/hms/backend/README.md) — Backend specific details & API structure
