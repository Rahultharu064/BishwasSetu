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
- **Dynamic Rating**: A unique scoring algorithm that calculates a provider's reliability based on reviews, timeliness, and community verification. Database support has been migrated.

### 📂 Service Marketplace
- **Categorized Discovery**: Services are organized into intuitive categories (e.g., Cleaning, Plumbing, Electrical).
- **Detailed Listings**: Each service includes descriptions, estimated pricing, and provider expertise.
- **Advanced Search**: Filter providers by category, location, and verification status.

### 📅 Booking & Job Management
- **Seamless Booking**: Customers can schedule services directly through the platform (Implemented).
- **Real-time Status Tracking**: Track jobs from "Pending" to "Accepted", "Cancelled", or "Completed" (Implemented).
- **WebSockets Communication**: Immediate booking event alerts (Implemented).

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
- **Auth**: JWT (JSON Web Tokens) with Email OTP Verification

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
- [x] **Email OTP Integration**: User registration verification via email OTP.
- [ ] **Phone OTP Integration**: SMS-based (Sparrow SMS) verification.
- [ ] **Review & Rating System**: Submitting reviews, replies, and ratings.
- [ ] **Trust Score Engine**: Dynamic rating computations and events tracking.
- [ ] **AI Assistant & matching**: RAG-based search and chat assistant.
- [ ] **Payment Gateway**: Khalti & eSewa credit wallet integration.
- [ ] **Mobile App**: Developing a companion app for providers and customers.


---

## 🤝 Contributing
We welcome contributions to make BishwasSetu even better! Please feel free to open issues or submit pull requests.

## 📄 License
This project is licensed under the MIT License.
