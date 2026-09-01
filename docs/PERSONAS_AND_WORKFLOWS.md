# GovOS — User Personas, Workflows & Lifecycles

> Government Operations System (GovOS) serves a multi-tiered hierarchy of municipal government stakeholders. Each persona operates within strict role boundaries enforced by RBAC and Multi-Tenant Architecture (MTAS).

---

## 👤 Persona 1: Super Admin
**Role Code:** `SUPER_ADMIN`
**System Scope:** Cross-tenant (all municipalities)

### Profile
| Attribute | Detail |
|---|---|
| Who | Prajna Labs / Platform operator |
| Goal | Provision tenants, manage platform health |
| Pain Point | Needs full visibility without being inside any specific municipality |
| Device | Desktop only |

### Capabilities
- Provision new municipal tenants
- Access all data across all tenants
- Manage platform-level roles
- View platform-wide audit logs

### Lifecycle
```
Platform Setup → Tenant Provisioning → Assign TENANT_ADMIN → Monitor → Offboard Tenant
```

### Key Workflows
1. **Onboard a Municipality:** Create tenant → Configure subdomain → Create TENANT_ADMIN user → Send credentials
2. **Cross-Tenant Audit:** View all tenants → Select tenant → Drill into audit log
3. **Deactivate Tenant:** Soft-delete all tenant data → Revoke all JWTs for tenant

---

## 👤 Persona 2: Tenant Admin (Municipal Commissioner / Administrator)
**Role Code:** `TENANT_ADMIN`
**System Scope:** Single municipality (tenant)

### Profile
| Attribute | Detail |
|---|---|
| Who | Municipal Commissioner, IT Administrator |
| Goal | Configure the system, manage staff, track performance |
| Pain Point | Manual spreadsheets, paper-based reporting |
| Device | Desktop, tablet |

### Capabilities
- Manage Roles & Permissions for the municipality
- Onboard/offboard Officers and Dept Heads
- Configure ward boundaries and departments
- View analytics dashboard and audit logs
- Access all modules

### Lifecycle
```
Receives credentials → System Setup → Staff Onboarding → Daily Operations Monitoring → Report Generation
```

### Key Workflows

#### 1. Onboard an Officer
```
Admin Console → User Management → Add Officer →
  Fill: Name, Phone, Designation, Ward Assignment, Role
→ Officer receives OTP login credentials
```

#### 2. Monitor Daily Operations
```
Dashboard → Review KPIs (Complaints, Citizens, Projects, Assets) →
  Drill into Complaints → Filter by status/ward →
  Identify SLA breaches → Reassign Officer
```

#### 3. Generate Monthly Report
```
Analytics → Command Center → Export PDF →
  Review: Resolution Rate, Budget Burn, Satisfaction Score
```

#### 4. Configure System
```
Admin Console → Tenant Configuration →
  Set ward boundaries (via Map module) →
  Configure department structure →
  Set SLA thresholds
```

---

## 👤 Persona 3: Officer (Field Officer / Ward Officer)
**Role Code:** `OFFICER`
**System Scope:** Assigned ward(s) within a tenant

### Profile
| Attribute | Detail |
|---|---|
| Who | Field officer, ward officer, sanitation inspector |
| Goal | Resolve citizen complaints, update asset status |
| Pain Point | Manual complaint diaries, no real-time updates |
| Device | Mobile-first, smartphone browser |

### Capabilities
- View complaints assigned to them
- Update complaint status (IN_PROGRESS → RESOLVED)
- Add citizens to the system
- View and update documents (file movement)
- View map of their ward
- Receive real-time Socket.IO notifications

### Lifecycle
```
Login → See Assigned Complaints → Accept/Update → Field Work → Mark Resolved → Log Activity
```

### Key Workflows

#### 1. Morning Duty Check
```
Login → Dashboard (2 KPIs: Complaints, Projects) →
  Check Complaints Module →
  Filter: My Ward + Status=ASSIGNED →
  Review priority queue → Plan field visit schedule
```

#### 2. Resolve a Complaint
```
Complaints → Select complaint → Review details + GPS location →
  Click "Update Status" → Select IN_PROGRESS →
  Field work done →
  Click "Update Status" → Select RESOLVED →
  Citizen gets notification (SMS/In-App)
```

#### 3. Add a New Citizen
```
Citizens → Add Citizen →
  Enter: Name, Phone, Ward, Address →
  Save → System generates citizen profile
```

#### 4. Move a Document (Peshi)
```
Documents → Select file →
  Click Edit → Update "Current Desk" →
  Change Status to IN_TRANSIT → Save →
  Receiving officer gets notification
```

---

## 👤 Persona 4: Department Head
**Role Code:** `DEPT_HEAD`
**System Scope:** Assigned department within a tenant

### Profile
| Attribute | Detail |
|---|---|
| Who | Water supply head, road works head, parks director |
| Goal | Oversee projects and assets in their department |
| Pain Point | No visibility into asset condition and project burn rate |
| Device | Desktop |

### Capabilities
- Full CRUD on Assets (infrastructure they own)
- Full CRUD on Projects (department projects)
- View and manage Documents
- View analytics for their department
- Cannot manage officers or citizens

### Lifecycle
```
Login → Review Projects → Check Asset Status → Approve Documents → Budget Review
```

### Key Workflows

#### 1. Register a New Asset
```
Asset Registry → Add Asset →
  Enter: Name, Category, GPS, Maintenance Date →
  Save → Asset gets tracked with RLS
```

#### 2. Update Project Progress
```
Project Tracker → Select project →
  Click Edit → Update Completion % → Update Spent amount →
  Change Status if needed → Save →
  Dashboard KPI auto-updates
```

#### 3. Review Overdue Maintenance
```
Asset Registry → Filter: Status=MAINTENANCE or Overdue →
  View assets with past maintenance dates (red indicator) →
  Schedule maintenance → Update date
```

---

## 👤 Persona 5: Elected Representative (MLA / Councillor)
**Role Code:** `ROLE_REP`
**System Scope:** Assigned constituency/ward

### Profile
| Attribute | Detail |
|---|---|
| Who | Ward Councillor, MLA, Sarpanch |
| Goal | Monitor complaint resolution in their constituency |
| Pain Point | Citizen complaints go unresolved; no visibility |
| Device | Mobile, tablet |

### Capabilities
- View complaints in their ward (read-only)
- View map of their ward with complaint pins
- Receive SLA breach alerts
- Cannot modify any data

### Key Workflows

#### 1. Check Ward Status
```
Login → Dashboard →
  Map Dashboard → View complaint pins in ward →
  Identify hot-spots → Call TENANT_ADMIN for escalation
```

#### 2. SLA Breach Alert
```
Receive Socket.IO notification: "Complaint CMP-GVM-202506-041 breached SLA" →
  Open complaint → Review status → Contact officer
```

---

## 👤 Persona 6: Citizen (Self-Service)
**Role Code:** `CITIZEN`
**System Scope:** Own profile only

### Profile
| Attribute | Detail |
|---|---|
| Who | Resident, taxpayer |
| Goal | File complaints, track resolution |
| Pain Point | Opaque bureaucracy, no follow-up |
| Device | Mobile (primary), web |

### Capabilities
- Register via OTP
- File complaints (with GPS)
- Track own complaint status
- Receive notifications when resolved

### Lifecycle
```
Complaint → Register → File Complaint → Track → Receive Resolution → Rate Experience
```

### Key Workflows

#### 1. File a Complaint
```
Login (OTP) →
  Complaints → New Complaint →
  Enter: Title, Description, GPS auto-detected or manual →
  Submit → Get complaint number CMP-GVM-202506-041
```

#### 2. Track Complaint
```
My Complaints → Select CMP-GVM-202506-041 →
  View: Status timeline (NEW → ASSIGNED → IN_PROGRESS → RESOLVED) →
  Receive push/SMS notification on status change
```

---

## 🔄 Core User Lifecycles

### 1. Complaint Lifecycle
```
  Citizen files     System assigns    Officer picks up    Field work done    Admin confirms    (If unsatisfied)
   complaint      complaint number     (or auto-assign)
       |                |                    |                  |                |                   |
       v                v                    v                  v                v                   v
    [NEW] -------> [ASSIGNED] -------> [IN_PROGRESS] -------> [RESOLVED] -------> [CLOSED] -------> [REOPENED]
                                                                 |
                                                          SLA Timer runs
                                                    (breach = alert to TENANT_ADMIN)
```

**SLA Thresholds (configurable per tenant):**
| Priority | Resolution SLA |
|---|---|
| CRITICAL | 4 hours |
| HIGH | 24 hours |
| NORMAL | 72 hours |
| LOW | 7 days |

### 2. Officer Lifecycle
```
Provisioning → Login (OTP) → Ward Assignment →
  Daily Duties → Workload Tracking → Performance Review → Promotion/Deactivation
```

### 3. Document / Peshi Lifecycle
```
[DRAFT] → [RECEIVED] → [IN_TRANSIT] → [RECEIVED at desk] → [ARCHIVED]
                              |
                        Physical file movement
                        tracked by "Current Desk" field
                        Notification on each movement
```

### 4. Asset Lifecycle
```
[REGISTERED] → [ACTIVE] → [MAINTENANCE] → [ACTIVE] → ... → [DECOMMISSIONED]
                                |
                        Maintenance scheduled
                    Alert 7 days before next maintenance
```

### 5. User Onboarding Lifecycle
```
TENANT_ADMIN creates user →
  System assigns temp credentials (OTP-only) →
  User logs in with phone OTP →
  First login: System prompts profile completion →
  User assigned to ward →
  User begins operations
```

---

## 📱 Role x Module Access Matrix

| Module | SUPER_ADMIN | TENANT_ADMIN | DEPT_HEAD | OFFICER | REP | CITIZEN |
|---|---|---|---|---|---|---|
| **Dashboard** | All KPIs | All KPIs | Dept KPIs | Ward KPIs | Read | Own |
| **Complaints** | CRUD | CRUD | Read | Create+Update | Read | Own CRUD |
| **Citizens** | CRUD | CRUD | - | CRUD | - | Own |
| **Officers** | CRUD | CRUD | - | - | - | - |
| **Assets** | CRUD | CRUD | CRUD | - | - | - |
| **Projects** | CRUD | CRUD | CRUD | - | Read | - |
| **Documents** | CRUD | CRUD | CRUD | CRUD | - | - |
| **Analytics** | Full | Full | Dept | Ward | Ward | - |
| **Map** | All | All | Dept pins | Ward | Ward | Own pins |
| **Admin Console** | Full | Full | - | - | - | - |
| **Notifications** | All | All | Dept | Assigned | Ward alerts | Own |

---

## 🔔 Notification Trigger Map

| Event | Who gets notified | Channel |
|---|---|---|
| New complaint filed | Assigned officer + TENANT_ADMIN | In-App + SMS |
| Complaint status changed | Reporter (citizen) | SMS + WhatsApp |
| SLA warning (75%) | Assigned officer | In-App |
| SLA breach (100%) | Officer + TENANT_ADMIN + REP | In-App + SMS + Email |
| Document moved to desk | Receiving officer | In-App |
| Asset maintenance due (7d) | DEPT_HEAD | In-App + Email |
| New officer onboarded | TENANT_ADMIN | In-App |
| Complaint resolved | Citizen | SMS + WhatsApp + Push |
