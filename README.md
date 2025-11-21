<div align="center">

# 🏢 Building & Rentals Manager

### Complete Property Administration Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

---

**Full property administration platform** designed for building owners and accounting staff, managing rentals, payments, contracts, clients, buildings, and financial insights.

Developed for **Departamentos Avalom** | Universidad Nacional de Costa Rica

[Features](#️-key-features) • [Modules](#️-system-modules) • [Tech Stack](#-tech-stack) • [Installation](#-installation--setup)

</div>

---

## 📘 Project Overview

**Building & Rentals Manager** is a complete real-estate management system that centralizes information traditionally handled in spreadsheets, offering better control, accuracy, and real-time visibility over all operations.

<div align="center">

### Core Capabilities

</div>

<div align="center">

<table>
<tr>
<td width="50%" align="center">

**🏗️ Property Management**
- Building and property administration
- Rental contract control
- Complete unit history

</td>
<td width="50%" align="center">

**💰 Financial Control**
- Payment and balance tracking
- Deposit management
- Detailed accounting reports

</td>
</tr>
<tr>
<td width="50%" align="center">

**👥 Client Administration**
- Centralized tenant registry
- Client rental history
- Advanced search and filtering

</td>
<td width="50%" align="center">

**📊 Analytics & Reports**
- Dashboard with key metrics
- Revenue charts (12 months)
- Data export capabilities

</td>
</tr>
</table>

</div>

<div align="center">

### Academic & Business Context

</div>

Project developed as part of the **Information Systems Engineering** program at **Universidad Nacional de Costa Rica**, implemented for **Departamentos Avalom** to:

<div align="center">

✅ Replace error-prone manual processes  
✅ Centralize data and improve supervision  
✅ Support growth of multiple property types (apartments, commercial units, Airbnb units, etc.)

</div>

---

<div align="center">

## ⚙️ Key Features

</div>

<div align="center">

| Module | Functionalities |
|:------:|:----------------|
| 🔐 **Authentication** | Secure login with email and password verification |
| 📊 **Dashboard** | Financial summaries, active rentals, cancellations, and recent payments |
| 👤 **Clients** | Searchable lists, filters, and detailed records |
| 🏢 **Buildings** | Complete control over each property and unit |
| 🏠 **Properties** | Attribute editing and rental history review |
| 📝 **Rentals** | Create, modify, and finalize contracts |
| 📅 **Monthly Generation** | 1-36 month timeline based on contract duration |
| 💳 **Payment Processing** | Validation, deposit tracking, and movement logs |
| 📚 **Accounting** | Review rentals, states, amounts, and transaction history |
| 📄 **Reports** | Multi-format data export |
| 📱 **Responsive Interface** | Optimized design for modern administrative workflows |

</div>

---

<div align="center">

## 🧰 Tech Stack

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Backend & Database
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

### Deployment & Tools
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)

</div>

---

<div align="center">

## 🏛️ System Modules

### 📊 1. Dashboard / Home Page

**Complete overview of accounting and rental activity**

</div>

<div align="center">

💰 Recent payments • ❌ Cancelled rentals • ✅ Active rentals • 👥 New clients • 📈 Revenue graph (12 months)

<img src="./src_ReadMe/HomePage.png" width="800" alt="Main Dashboard"/>

</div>

---

<div align="center">

### 👤 2. Client Management

**View, search, export, and manage all registered clients**

<img src="./src_ReadMe/GestionClientes.png" width="800" alt="Client Management"/>

</div>

---

<div align="center">

### 🏢 3. Building & Property Management

**Building list with detailed information and associated properties**

</div>

<div align="center">

Each building includes: 🔢 Building identifier • 📝 Description • 📍 Location & postal code • 🏠 Associated property units

<img src="./src_ReadMe/GestionEdificios.png" width="800" alt="Building Management"/>

**Property Details Modal**

<img src="./src_ReadMe/EditarPropiedad.png" width="800" alt="Edit Property"/>

</div>

---

<div align="center">

### 📝 4. Rental Management

**Manage all active, pending, cancelled, or finalized rentals**

</div>

<div align="center">

Includes: 📜 Rental history • 📅 Payment dates • 📊 Status • 👥 Linked clients • 📤 Export tools

<img src="./src_ReadMe/GestionAlquileres.png" width="800" alt="Rental Management"/>

**Modify Rental View**

<img src="./src_ReadMe/ModificarAlquiler.png" width="800" alt="Modify Rental"/>

</div>

---

<div align="center">

### 💳 5. Payment Movements

**Process payments, review deposits, and validate monthly rental installments**

</div>

<div align="center">

Displays: 👤 Client info • 💰 Total deposit & current balance • 📅 Each month (up to 36) • ✓ Payment status

<img src="./src_ReadMe/MovimientosAlquiler.png" width="800" alt="Payment Movements"/>

</div>

---

<div align="center">

### 📚 6. Accounting Module

**Centralized financial oversight for all property rentals**

</div>

<div align="center">

Features: 🔍 Filters (property type, status, building) • 📊 Complete financial records • 💼 Actions (pay, cancel, finalize) • 📤 Export tools

<img src="./src_ReadMe/Contabilidad.png" width="800" alt="Accounting Module"/>

</div>

---

<div align="center">

### 🏗️ 7. Buildings & Properties (Extended View)

**Complete management of real estate infrastructure**

</div>

<div align="center">

Allows: ✏️ Edit building information • ➕ Create new properties • 📄 Pagination management • 🔍 Search by identifiers

<img src="./src_ReadMe/PropiedadesYEdificios.png" width="800" alt="Properties and Buildings"/>

</div>

---

<div align="center">

## 🏗️ System Architecture

### Database Model

Based on official documentation (pages 26-27), the system includes the following core entities:

**Buildings** • **Properties** • **Clients** • **Rentals** • **Payments** • **Deposits**

### System Flow

Buildings contain multiple properties → Properties are rented by clients → Rentals generate monthly installments → Payments update accounting records → Dashboard aggregates financial information

**Architecture Benefits:**
- ✅ Scalability for long-term management
- ✅ Clear separation of responsibilities
- ✅ Facilitates audits and reports
- ✅ Supports multiple property types simultaneously

</div>

---

<div align="center">

## 🚀 Installation & Setup

### Prerequisites

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)
![npm](https://img.shields.io/badge/npm-9+-CB3837?style=flat-square&logo=npm)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-316192?style=flat-square&logo=postgresql)

</div>

### 📋 Installation Steps

**1. Clone the repository**
```bash
git clone https://github.com/Anthonyah131/SGI_Avalom.git
cd SGI_Avalom/sgi-avalom
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure environment variables**

Create `.env.local` file in the project root:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/avalom_db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

**4. Setup database**
```bash
npx prisma generate
npx prisma db push
```

**5. Run in development mode**
```bash
npm run dev
```

**6. Open in browser**

Navigate to [http://localhost:3000](http://localhost:3000)

<div align="center">

### 🏗️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build production application |
| `npm start` | Start production server |
| `npm run lint` | Run linter |
| `npm test` | Run tests with Jest |

</div>

---

<div align="center">

## 📄 License

Internal academic & business-use project for **Departamentos Avalom**  
© 2024 - Universidad Nacional de Costa Rica

---

### 👥 Developed with ❤️ for modern property management

[![Universidad Nacional](https://img.shields.io/badge/Universidad-Nacional_de_Costa_Rica-003DA5?style=for-the-badge)](https://www.una.ac.cr/)

</div>
