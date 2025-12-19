import CategoryCreate from "../components/Admindashboard/forum/CategoryCreate";
import CategoryUpdate from "../components/Admindashboard/forum/CategoryUpdate";
import CategoryAdminList from "../components/Admindashboard/forum/CategoryAdminList";
import CategoryList from "../components/Homepage/CategoryList";

// Public Pages
import Homepage from "../pages/PublicUser/Homepage";
import ProvidersPage from "../pages/PublicUser/ProvidersPage";
import ServicesPage from "../pages/PublicUser/ServicesPage";
import Register from "../components/auth/Register";
import Login from "../components/auth/Login";
import VerifyOtp from "../components/auth/VerifyOtp";




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
        path:"/register",
        element: <Register />
    },
    {
        path:"/login",
        element:<Login />
    },
    {
        path:"/verify-otp",
        element: <VerifyOtp />
    },
    

    // Admin/Existing Routes (Keeping these as requested/defaults)
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
    }
]


export default routes
