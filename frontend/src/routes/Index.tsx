import CategoryCreate from "../components/Admindashboard/forum/CategoryCreate";
import CategoryUpdate from "../components/Admindashboard/forum/CategoryUpdate";
import CategoryAdminList from "../components/Admindashboard/forum/CategoryAdminList";
import ServiceAdminList from "../components/Admindashboard/forum/ServiceAdminList";
import ServiceCreate from "../components/Admindashboard/forum/ServiceCreate";

// Public Pages
import Homepage from "../pages/PublicUser/Homepage";
import ProvidersPage from "../pages/PublicUser/ProvidersPage";
import ServicesPage from "../pages/PublicUser/ServicesPage";
import ProfilePage from "../pages/PublicUser/ProfilePage";
import Register from "../components/auth/Register";
import Login from "../components/auth/Login";
import VerifyOtp from "../components/auth/VerifyOtp";
import BecomeProvider from "../components/ProviderDashboard/forum/BecomeProvider";
import AdminRegister from "../components/auth/AdminRegister";

// Admin Dashboard Pages
import AdminLayout from "../components/Admindashboard/layouts/AdminLayout";
import AdminDashboardPage from "../pages/Admindashboard/AdminDashboardPage";
import Users from "../components/Admindashboard/layouts/Users";
import ProviderVerification from "../components/Admindashboard/layouts/ProviderVerification";
import Analytics from "../components/Admindashboard/layouts/Analytics";
import Settings from "../components/Admindashboard/layouts/Settings";

// Provider Dashboard Pages
import ProviderLayoutPage from "../pages/ProviderDashboard/ProviderLayoutPage";
import DashboardPage from "../pages/ProviderDashboard/DashboardPage";
import ProviderServicesPage from "../pages/ProviderDashboard/ServicesPage";
import BookingsPage from "../pages/ProviderDashboard/BookingsPage";
import Complaints from "../components/Admindashboard/layouts/Complaints";

// Customer Dashboard Pages
import CustomerDashboardPage from "../pages/CustomerDashboard/CustomerDashboardPage";
import FindServices from "../components/CustomerDashboard/layouts/FindServices";
import MyBookings from "../components/CustomerDashboard/layouts/MyBookings";
import MyComplaints from "../components/CustomerDashboard/layouts/MyComplaints";

const routes = [
    // Public Routes
    {
        path: "/",
        element: <Homepage />
    },
    {
        path: "/providers",
        element: <ProvidersPage />
    },
    {
        path: "/services",
        element: <ServicesPage />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/verify-otp",
        element: <VerifyOtp />
    },
    {
        path: "/profile",
        element: <ProfilePage />
    },
    {
        path: "/become-provider",
        element: <BecomeProvider />
    },
    {
        path: "/admin-register",
        element: <AdminRegister />
    },

    // Admin Dashboard Routes
    {
        path: "/admin",
        element: <AdminLayout />,
        children: [
            { path: "dashboard", element: <AdminDashboardPage /> },
            { path: "users", element: <Users /> },
            { path: "provider-verification", element: <ProviderVerification /> },
            { path: "complaints", element: <Complaints /> },
            { path: "categories", element: <CategoryAdminList /> },
            { path: "services", element: <ServiceAdminList /> },
            { path: "service/create", element: <ServiceCreate /> },
            { path: "category/create", element: <CategoryCreate /> },
            { path: "category/update/:id", element: <CategoryUpdate /> },
            { path: "analytics", element: <Analytics /> },
            { path: "settings", element: <Settings /> },
        ]
    },

    // Provider Dashboard Routes
    {
        path: "/provider",
        element: <ProviderLayoutPage />,
        children: [
            { path: "dashboard", element: <DashboardPage /> },
            { path: "services", element: <ProviderServicesPage /> },
            { path: "bookings", element: <BookingsPage /> },
            { path: "profile", element: <ProfilePage /> },
        ]
    },

    // Customer Dashboard Routes
    {
        path: "/customer",
        element: <CustomerDashboardPage />,
        children: [
            { path: "dashboard", element: <CustomerDashboardPage /> },
            { path: "services", element: <FindServices /> },
            { path: "bookings", element: <MyBookings /> },
            { path: "complaints", element: <MyComplaints /> },
        ]
    }
];

export default routes;
