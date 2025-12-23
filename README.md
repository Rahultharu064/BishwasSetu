# BishwasSetu 🤝
### *Home Services & Community Trust Platform*

BishwasSetu is a modern, trust-based home services marketplace designed to bridge the gap between customers and service providers. Our platform prioritizes security and reliability through a rigorous verification process and a community-driven Trust Score system.

---

## 🌟 Key Features

### 🔐 Multi-Role Authentication
- **Secure Access**: JWT-based authentication with role-based access control (RBAC).
- **Three User Roles**:
  - **Customers**: Can discover services, view trusted providers, and manage bookings.
  - **Providers**: Can list services, upload KYC documents, and manage their professional profile.
  - **Admin**: Oversees the entire platform, reviews KYC documents, and resolves complaints.

### 🛡️ Provider Verification (KYC)
- **Mandatory Onboarding**: Providers must complete their professional profile and upload legal documents (Government ID, Certificates) before they can offer services.
- **Verification Workflow**: Documents are reviewed by administrators to ensure platform safety and quality.
- **Trust Badges**: Verified providers receive distinct badges on their profiles.

### 📊 Trust Score Engine (Planned)
- **Dynamic Rating**: A unique scoring algorithm that calculates a provider's reliability based on:
  - Customer reviews and ratings.
  - Job completion timeliness.
  - Verification status.
  - Community "vouches" and conflict resolution history.

### 📂 Service Marketplace
- **Categorized Discovery**: Services are organized into intuitive categories (e.g., Cleaning, Plumbing, Electrical).
- **Detailed Listings**: Each service includes descriptions, estimated pricing, and provider expertise.
- **Advanced Search**: Filter providers by category, location, trust score, and verification status.

### 📅 Booking & Job Management (Planned)
- **Seamless Booking**: Customers can schedule services directly through the platform.
- **Real-time Status tracking**: Track jobs from "Requested" to "Completed".
- **History**: Maintain a record of all past services and interactions.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS 4.0
- **Animations**: Framer Motion
- **Feedback**: React Hot Toast

### Backend
- **Runtime**: Node.js & Express
- **Database**: MySQL
- **ORM**: Prisma
- **Validation**: Joi & Zod
- **Auth**: JWT (JSON Web Tokens)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MySQL](https://www.mysql.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rahultharu064/BishwasSetu.git
   cd BishwasSetu
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create a .env file and add your DATABASE_URL
   npx prisma migrate dev
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## 🛣️ Roadmap
- [ ] **OTP Integration**: Phone-based authentication for enhanced security.
- [ ] **Trust Score Algorithm**: Finalizing the variables for the dynamic scoring system.
- [ ] **Review System**: Implementing the media-rich review and rating module.
- [ ] **Payment Gateway**: Integration for secure service payments.
- [ ] **Mobile App**: Developing a companion app for providers and customers on the go.

---

## 🤝 Contributing
We welcome contributions to make BishwasSetu even better! Please feel free to open issues or submit pull requests.

## 📄 License
This project is licensed under the MIT License.
