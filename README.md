# HRMS — Human Resource Management System

A full-stack HR management web application built with **React (Vite)**, **Django REST Framework**, and **MySQL**. Supports four roles — Admin, HR, Manager, and Employee — each with a role-scoped experience across Employee Management, Attendance, Leave, Payroll, Performance Reviews, and Reports.

Built as a solo project to practice production-style full-stack architecture: JWT authentication, role-based permissions enforced at the database query level (not just hidden in the UI), and relational data modeling across interconnected HR domains.

---

## Live Demo

- **Frontend App:** [https://hrms-theta-dun.vercel.app](https://hrms-theta-dun.vercel.app)
- **Backend API:** [https://hrms-0l8s.onrender.com](https://hrms-0l8s.onrender.com)
- **Django Admin:** [https://hrms-0l8s.onrender.com/admin/](https://hrms-0l8s.onrender.com/admin/)

### Demo Logins (For Reviewers)

| Role | Username | Password | Access / Scope |
|---|---|---|---|
| **Admin** | `admin` | `Admin@1234` | Full company control, all modules, analytics & settings |
| **HR** | `priya_hr` | `Priya@HR2026` | Employee CRUD, company payroll, all leaves & attendance |
| **Manager** | `rahul_mgr` | `Rahul@Mgr2026` | Team performance reviews, attendance & leave approvals |
| **Employee** | `aman_dev` | `Aman@Dev2026` | Self check-in/out, apply leave, my salary, performance |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), React Router, Axios, Bootstrap 5, Recharts |
| Backend | Django 5.2 (LTS), Django REST Framework, django-filter |
| Auth | JWT (SimpleJWT) with refresh tokens and blacklisting |
| Database | MySQL |
| Other | python-decouple (env config), CORS headers |

---

## Why These Choices

- **Django 5.2 LTS**, not the latest release — chosen deliberately for MySQL 8.0 compatibility and long-term support, after hitting a real version-mismatch issue during setup.
- **JWT over session auth** — the frontend and backend are fully decoupled (different origins), so stateless token auth avoids cross-origin cookie complications and matches how most modern SPA + API projects are built.
- **DecimalField for all money fields** (salary, payslips) — never `FloatField`, to avoid floating-point rounding errors in financial calculations.
- **Computed properties over stored values** — `gross_salary`, `net_salary`, `overall_rating`, `working_hours`, and `total_days` are all Python `@property` methods, never stored columns, so they can never go stale if underlying data is edited.
- **Soft deletion (`is_active`) over hard deletion** — employees and departments are deactivated, never deleted, to preserve attendance/leave/payroll history for reporting.
- **CSV export over true PDF/Excel generation** — a deliberate scope decision. CSV opens natively in Excel/Sheets and requires zero extra dependencies, versus the real engineering cost of `openpyxl`/`reportlab` for a project at this scope.

---

## Features by Module

### Authentication & Roles
- JWT login/logout/refresh with automatic token renewal on the frontend (axios interceptor)
- Four roles: **Admin**, **HR**, **Manager**, **Employee** — each with its own dashboard and route guards
- Role checked both client-side (route protection, hidden UI) *and* server-side (every API view enforces permissions independently — the UI never being the only line of defense)

### Employee Management
- Custom `User` model (login/role) separated from `Employee` model (HR data) via a one-to-one link — keeps authentication concerns separate from business data
- Self-referencing `manager` field on `Employee` models a real reporting hierarchy
- Full CRUD with search, department/status filters, and pagination
- Creating an employee atomically creates both the login (`User`) and HR record (`Employee`) in one request
- Department/Designation management, with a cascading Department → Designation selector

### Attendance
- Check-in / check-out with automatically computed status (Present / Late / Half-Day) based on configurable time thresholds
- A management command (`mark_absent`) marks anyone with no check-in as Absent — or as Leave, if they have an approved leave request covering that date
- Manager view scoped to direct reports only; Admin/HR see company-wide attendance

### Leave Management
- Configurable leave types with per-year day allowances
- Apply/approve/reject workflow with real validation: no overlapping date ranges, no exceeding remaining balance, no self-approval
- Balance is computed from *approved* requests only — a pending request never consumes balance prematurely
- Manager approves only their own team; HR/Admin approve anyone

### Payroll
- Separate `SalaryStructure` (ongoing baseline pay) and `Payslip` (one immutable record per employee per month) — editing someone's salary never rewrites payroll history
- Formula-driven: Gross = Basic + HRA + Allowances + Bonus; Net = Gross − Deductions
- Guards against duplicate payslips and double "mark as paid"
- Employees see only their own salary/payslip history, enforced server-side

### Performance Reviews
- Four-criterion rating system (Technical Skills, Communication, Teamwork, Problem Solving) with a computed overall average
- Manager can only review their direct reports; HR/Admin can review anyone
- Employees view their own review history only

### Reports
- Attendance, Leave, and Payroll reports with date-range/department filters and aggregate summaries (via Django `annotate`/`Count`/`Sum`)
- CSV export on all three

---

## Architecture Notes

- **Permissions are enforced at the queryset level**, not just via DRF permission classes — e.g. a Manager's `GET /api/employees/` returns *only* their direct reports because the view's `get_queryset()` filters by the logged-in user's role, not because the frontend hides other rows. This means even a direct API call (Postman, browser dev tools) from an unauthorized role cannot read data it shouldn't see.
- **A known simplification, found and fixed during development:** earlier in the build, the Employee list/detail API had no role-based queryset filtering — any logged-in employee could fetch any colleague's personal data via a direct API call. This was identified and corrected before the Payroll module (which adds salary data) was built on top of it.
- Absence marking currently requires a scheduled job (`mark_absent`) run daily — locally via Windows Task Scheduler, in production via a hosting-platform cron job.

---

## Project Structure

```
hr_management_system/
├── hrms_backend/          # Django REST API
│   ├── accounts/          # Custom User model, JWT auth, role permissions
│   ├── employees/         # Employee, Department, Designation
│   ├── attendance/        # Check-in/out, mark_absent command
│   ├── leaves/             # Leave types, requests, approvals
│   ├── payroll/            # Salary structures, payslips
│   ├── performance/        # Performance reviews
│   └── config/              # Settings, root URLs
└── hrms_frontend/          # React (Vite) SPA
    └── src/
        ├── context/         # Auth + theme context
        ├── layouts/         # Shared dashboard shell (sidebar/navbar)
        ├── Pages/            # One folder per module
        ├── routes/           # Role-based route protection
        └── services/         # Axios instance with token refresh
```

---

## Running Locally

**Backend**
```bash
cd hrms_backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
# create a .env file with SECRET_KEY, DB credentials, etc.
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**Frontend**
```bash
cd hrms_frontend
npm install
# create a .env file with VITE_API_URL=http://127.0.0.1:8000/api
npm run dev
```

---

## Scope Decisions (Intentional Simplifications)

Built for a learning/portfolio project, not a legally complete production payroll/HR system. Deliberately excluded or simplified:

- No real-time push notifications — review outcomes are visible on next page load, not pushed
- CSV export instead of native PDF/Excel generation
- Single-approval payroll (no second Finance sign-off step)
- Attendance/leave day counting does not account for company holidays beyond weekends
- No multi-level (skip-level) manager visibility — one reporting level only

---

## What I'd Add Next

- Automated daily `mark_absent` via a production cron job
- Full Employee edit form (currently create + deactivate only, no in-place edit)
- Employee self-service profile photo upload (model field exists, UI not built)
- Email/in-app notifications for leave approval outcomes