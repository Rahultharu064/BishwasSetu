import CategoryCreate from "../components/Admindashboard/forum/CategoryCreate";
import CategoryUpdate from "../components/Admindashboard/forum/CategoryUpdate";
import CategoryAdminList from "../components/Admindashboard/forum/CategoryAdminList";
import CategoryList from "../components/Homepage/CategoryList";




const routes= [
    {
        path:"/",
        element:<CategoryCreate />
    },
    {
        path:"/categories",
        element:<CategoryList />
    },
    {
        path:"/admin/categories",
        element:<CategoryAdminList />
    },
    {
        path:"/update/:id",
        element:<CategoryUpdate />
    }
]


export default routes
