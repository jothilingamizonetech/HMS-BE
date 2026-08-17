# Hospital Management System (HMS) - Project Structure & Architecture

This document provides a comprehensive overview of the modular directory structure and architectural organization for both the backend (FastAPI) and frontend (React / Vite / TypeScript) applications.

---

## Workspace Layout

```
hms/
├── backend/                              # FastAPI Python Backend
│   ├── alembic/                          # Alembic database migration scripts
│   │   ├── versions/                     # Migration revisions
│   │   ├── env.py                        # Migration runtime configuration
│   │   └── script.py.mako                # Revision script template
│   ├── app/                              # Core application code
│   │   ├── core/                         # Application core configuration & security
│   │   │   ├── config.py                 # Pydantic environment & app settings
│   │   │   ├── crud_utils.py             # Reusable CRUD helper utilities
│   │   │   ├── database.py               # SQLAlchemy database session engine
│   │   │   ├── logging_utils.py          # Structured logger configuration
│   │   │   └── security.py               # Password hashing & JWT token management
│   │   ├── models/                       # SQLAlchemy ORM database models
│   │   │   ├── appointment.py            # OPD Appointments & Token models
│   │   │   ├── batch.py                  # Inventory & Pharmacy batch tracking
│   │   │   ├── clinical.py               # Vitals, prescriptions, consultations
│   │   │   ├── doctor.py                 # Doctor profiles & availability schedule
│   │   │   ├── goods_receipt.py          # Goods Receipt Note (GRN) models
│   │   │   ├── ipd.py                    # In-Patient beds, admissions, discharges
│   │   │   ├── lab.py                    # Lab tests, samples, & report results
│   │   │   ├── mixins.py                 # Reusable model mixins (Audit, Timestamp)
│   │   │   ├── notification.py           # System alert notifications
│   │   │   ├── patient.py                # Patient demographics & medical record
│   │   │   ├── pharmacy.py               # Pharmacy stock, POS sales, dispensing
│   │   │   ├── purchase_order.py         # Store purchase orders & line items
│   │   │   ├── staff.py                  # Staff profiles, roles, shifts, leaves
│   │   │   ├── stock_movement.py         # Inventory movements & transfers
│   │   │   ├── store_item.py             # Store inventory items & categories
│   │   │   ├── superadmin.py             # Hospital profile, depts, permissions
│   │   │   └── user.py                   # System User credentials & auth identity
│   │   ├── routers/                      # FastAPI API REST endpoint routers
│   │   │   ├── appointments.py           # OPD appointment scheduling & tokens
│   │   │   ├── auth.py                   # Login authentication & token issuance
│   │   │   ├── clinical.py               # Clinical consults, notes, & vitals
│   │   │   ├── doctors.py                # Doctor management & schedules
│   │   │   ├── goods_receipts.py         # GRN processing & stock inwarding
│   │   │   ├── ipd.py                    # IPD bed management & nurse actions
│   │   │   ├── lab.py                    # Diagnostic lab tests & result entry
│   │   │   ├── notifications.py          # Real-time alert notifications
│   │   │   ├── patients.py               # Patient registration & records
│   │   │   ├── pharmacy.py               # Drug inventory, POS, & dispensing
│   │   │   ├── purchase_orders.py        # Store purchase order workflows
│   │   │   ├── queue.py                  # Live OPD consultation queue
│   │   │   ├── reorder_batch.py          # Low-stock reordering logic
│   │   │   ├── staff.py                  # Staff shifts, leaves, & roster
│   │   │   ├── stock_movements.py        # Stock transfer & adjustments
│   │   │   ├── store_items.py            # Central store inventory master
│   │   │   └── superadmin.py             # RBAC permissions, depts, hospital profile
│   │   ├── schemas/                      # Pydantic data validation & request DTOs
│   │   │   ├── appointment.py, batch.py, clinical.py, common.py, doctor.py,
│   │   │   ├── goods_receipt.py, ipd.py, notification.py, patient.py,
│   │   │   ├── purchase_order.py, stock_movement.py, store_item.py,
│   │   │   └── superadmin.py, user.py
│   │   ├── seed/                         # Database initial seeders
│   │   │   └── super_admin.py            # Superadmin system account seeder
│   │   ├── services/                     # Domain business services
│   │   │   └── notification_service.py   # Alert notification delivery logic
│   │   ├── deps.py                       # FastAPI dependency injection (Auth, DB, RBAC)
│   │   ├── main.py                       # Application entrypoint & Lifespan handler
│   │   └── seed.py                       # Seeder execution script
│   ├── alembic.ini                       # Alembic database migration config
│   ├── Dockerfile                        # Docker container configuration
│   ├── docker-compose.yml                # Docker Compose orchestration setup
│   ├── pyrefly.toml                      # Pyrefly linter/formatter config
│   ├── requirements.txt                  # Python package dependencies
│   ├── seed_db.py                        # Standalone database seed runner
│   └── test_*.py                         # Integration & live flow test suites
│
├── frontend/                             # React + TypeScript + Vite Frontend
│   ├── public/                           # Public static assets & favicons
│   ├── src/
│   │   ├── components/                   # Modular UI Components
│   │   │   ├── common/                   # Global components (Navbar, Footer, Modal, Toast)
│   │   │   ├── dashboard/                # Dashboards, Sidebars & Header elements
│   │   │   └── nurse/                    # Nurse-specific UI widgets & patient cards
│   │   ├── context/                      # React Context Global State Providers
│   │   │   ├── AuthContext.tsx           # Authentication state & user session
│   │   │   ├── HMSContext.tsx            # Main operational state management
│   │   │   ├── LabContext.tsx            # Diagnostics lab state manager
│   │   │   ├── NurseContext.tsx          # IPD nursing & bed allocation state
│   │   │   ├── PharmacyContext.tsx       # Pharmacy POS & stock state manager
│   │   │   └── SuperAdminContext.tsx     # Superadmin, roles, & hospital settings state
│   │   ├── pages/                        # Page components grouped by domain module
│   │   │   ├── auth/                     # Authentication pages (LoginPage)
│   │   │   ├── common/                   # Shared pages (Staff Leave, Roster)
│   │   │   ├── doctor/                   # Doctor module (Dashboard, Consultations, History)
│   │   │   ├── lab/                      # Laboratory module (Test Master, Results, Reports)
│   │   │   ├── landing/                  # Public landing / homepage
│   │   │   ├── nurse/                    # Nursing care & IPD ward pages
│   │   │   ├── patient/                  # Patient portal (Booking, History)
│   │   │   ├── pharmacy/                 # Pharmacy module (POS, Stock, Prescriptions, Returns)
│   │   │   ├── reception/                # Reception module (Appointments, Tokens, Queue)
│   │   │   ├── store/                    # Central Store module (Items, POs, GRN, Batches)
│   │   │   └── superadmin/               # Super Admin module (Hospital setup, Depts, Roles)
│   │   ├── services/                     # Backend API client communication
│   │   │   └── api.ts                    # Axios client instance & REST service wrappers
│   │   ├── types/                        # TypeScript Interfaces & Definitions
│   │   │   ├── hms.ts                    # Main HMS core domain interfaces
│   │   │   ├── nurse.ts                  # Nurse & IPD patient domain types
│   │   │   ├── store.ts                  # Central store & inventory interfaces
│   │   │   └── superAdmin.ts             # Superadmin & RBAC state types
│   │   ├── utils/                        # Utility & helper functions
│   │   │   └── helpers.ts                # Date formatting, currency & status helpers
│   │   ├── App.tsx                       # Main application routing container
│   │   ├── main.tsx                      # React root entry point
│   │   ├── index.css                     # Global design tokens & CSS styles
│   │   └── vite-env.d.ts                 # Vite environment definitions
│   ├── package.json                      # Node project configuration & npm scripts
│   ├── tsconfig.json                     # TypeScript compiler configuration
│   ├── vite.config.ts                    # Vite build tool & proxy dev server configuration
│   └── vercel.json                       # Vercel deployment configuration
│
├── CHANGELOG.md                          # Revision history & updates log
├── PROJECT_STRUCTURE.md                  # Comprehensive folder layout documentation
├── README.md                             # Main repository overview & setup instructions
└── .gitignore                            # Workspace git ignore rules
```

---

## Architectural Highlights

1. **FastAPI Lifespan Management**:
   - Backend uses modern `@asynccontextmanager` in `app/main.py` for database auto-patching and superadmin seeding on startup.

2. **Alembic Database Migrations**:
   - Database migrations are versioned under `backend/alembic/versions/` for schema management.

3. **Fine-Grained Role-Based Access Control (RBAC)**:
   - Module-level permission matrix enforcement built into FastAPI router dependencies (`app/deps.py`).

4. **Multi-Branch Support**:
   - Operational scoping supported across backend models (`branch` entity relations) and frontend state contexts.
