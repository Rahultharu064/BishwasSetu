import CategoryCreate from "../components/Admindashboard/forum/CategoryCreate";
import CategoryUpdate from "../components/Admindashboard/forum/CategoryUpdate";
import CategoryAdminList from "../components/Admindashboard/forum/CategoryAdminList";
import CategoryList from "../components/Homepage/CategoryList";

// Public Pages
import Homepage from "../pages/PublicUser/Homepage";
import ProvidersPage from "../pages/PublicUser/ProvidersPage";
import ServicesPage from "../pages/PublicUser/ServicesPage";
import ProfilePage from "../pages/PublicUser/ProfilePage";
import Register from "../components/auth/Register";
import Login from "../components/auth/Login";
import VerifyOtp from "../components/auth/VerifyOtp";




// Provider Dashboard Pages
// Provider Dashboard Pages
import ProviderLayoutPage from "../pages/ProviderDashboard/ProviderLayoutPage";
import DashboardPage from "../pages/ProviderDashboard/DashboardPage";
import ProviderServicesPage from "../pages/ProviderDashboard/ServicesPage";
import BookingsPage from "../pages/ProviderDashboard/BookingsPage";

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

    // Admin/Existing Routes
    {
        path: "/admin/category/create",
        element: <CategoryCreate />
    },
    {
        path: "/categories",
        element: <CategoryList />
    },
    {
        path: "/admin/categories",
        element: <CategoryAdminList />
    },
    {
        path: "/admin/category/update/:id",
        element: <CategoryUpdate />
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
    }
];


export default routes
