# CivicPath Database Documentation

## 📁 Files in This Directory

- **schema.sql** - Complete PostgreSQL database schema with all tables, indexes, views, and functions
- **seed-data.sql** - Sample data for testing and development
- **SETUP-GUIDE.md** - Comprehensive step-by-step setup instructions
- **ER-DIAGRAM.md** - Entity Relationship diagram and table descriptions

## 🚀 Quick Start

1. Install PostgreSQL (see SETUP-GUIDE.md)
2. Create database: `CREATE DATABASE civicpath;`
3. Run schema: `psql -U postgres -d civicpath -f schema.sql`
4. Load data: `psql -U postgres -d civicpath -f seed-data.sql`

## 📊 Database Overview

### Core Tables
- **users** - Officers, admins, MLAs
- **complaints** - Citizen complaints/issues
- **departments** - Government departments
- **officers** - Field officers
- **mlas** - Legislative members

### Supporting Tables
- complaint_history - Audit trail
- comments - Work notes and updates
- mla_directives - MLA instructions
- notifications - System notifications
- attachments - Photos/documents

## 🔗 Relationships

```
complaints → departments (assigned_department_id)
complaints → officers (assigned_officer_id)
complaints → constituencies (constituency_id)
officers → users (user_id)
officers → departments (department_id)
mlas → users (user_id)
mlas → constituencies (constituency_id)
```

## 📈 Views

- **v_active_complaints** - All open complaints with details
- **v_officer_performance** - Officer statistics
- **v_department_statistics** - Department metrics

## 🔧 Functions

- **generate_complaint_number()** - Auto-generate complaint IDs
- **calculate_sla_deadline()** - Calculate SLA based on priority

## 📖 Documentation

See **SETUP-GUIDE.md** for detailed setup instructions.
