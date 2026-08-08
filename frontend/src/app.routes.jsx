
import { createBrowserRouter } from "react-router-dom";
import Register from "./features/auth/pages/register";
import Login from "./features/auth/pages/login";

const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    }
]);

export default router;