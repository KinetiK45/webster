import {Outlet} from "react-router-dom";
import {Suspense} from "react";
import {Skeleton} from "@mui/material";

function UserLayout() {
    return (
        <Suspense fallback={<Skeleton variant="rectangular" width={210} height={118} />}>
            <Outlet />
        </Suspense>
    );
}

export default UserLayout;
