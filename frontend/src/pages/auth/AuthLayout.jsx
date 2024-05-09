import {Outlet} from "react-router-dom";
import {Suspense} from "react";

function AuthLayout() {
    return (
        <Suspense fallback={<h1>Loading...</h1>}>
            <Outlet />
        </Suspense>
    );
}

export default AuthLayout;
