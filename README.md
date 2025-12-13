🌾 AgroVerify – Digital Agricultural Export Certification Platform

AgroVerify is a full-stack web application that digitizes agricultural export certification by integrating shipment management, quality inspection, certificate issuance, and public verification into a single secure system.

🧩 System Overview

The platform supports role-based workflows:

Exporters create and track shipments

QA Agents inspect shipments and issue certificates

Public users verify certificates using ID or QR code

🏗️ Architecture

Architecture Pattern: Client–Server

Browser (React)
      |
      v
Supabase APIs (Auth + DB)
      |
      v
PostgreSQL Database

🛠️ Technology Stack
Frontend

React.js

Tailwind CSS

Lucide Icons

Backend

Supabase (PostgreSQL + REST APIs)

Authentication

Supabase Auth

JWT-based session management

🗂️ Database Schema
auth.users (Supabase managed)
Column	Description
id (PK)	Unique user ID
email	Login email
profiles
Column	Key	Description
id	PK, FK	References auth.users.id
name		User name
email		User email
role		exporter / qa / admin
organization		Company or agency
shipments
Column	Key	Description
id	PK	Shipment ID
product_name		Product name
quantity		Quantity
unit		Measurement unit
origin		Shipment origin
reference_id		External reference
status		Pending / Approved / Rejected
exporter_id	FK	auth.users.id
inspector_id	FK	auth.users.id
inspection_comments		QA remarks
inspected_at		Inspection timestamp
certificate_generated		Boolean
🔐 Authentication Flow

User selects role (Exporter / QA Agent)

User logs in using email and password

Supabase validates credentials

JWT token is issued

Role-based dashboard is rendered

🔁 Application Workflows
Exporter Workflow

Login to exporter dashboard

Create shipment

Shipment marked as Pending Inspection

Track inspection status

Download certificate after approval

QA Agent Workflow

Login to QA dashboard

View pending inspections

Inspect shipment

Submit inspection result

Certificate issued if approved

📜 Certificate Verification

Certificate verification is publicly accessible.

Methods:

Enter Certificate ID

Upload QR code image

Process:

Input received

Certificate fetched from database

Authenticity validated

Result displayed to user

📁 Project File Structure
AgroVerify/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── DashboardCards.jsx
│   │   └── ShipmentTable.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── ExporterDashboard.jsx
│   │   ├── QADashboard.jsx
│   │   ├── InspectShipment.jsx
│   │   ├── VerifyCertificate.jsx
│   │   └── CertificateDetails.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── lib/
│   │   └── supabaseClient.js
│   ├── App.jsx
│   └── main.jsx
├── public/
├── package.json
└── README.md

🛡️ Security Considerations

JWT-based authentication

Role-based UI and API access

Exporters restricted to own shipments

QA Agents restricted to inspection actions

Public users have read-only access

🚀 Future Enhancements

Blockchain-backed certificate hash

Multi-stage inspections

Audit logs

Mobile application

Government authority dashboard
