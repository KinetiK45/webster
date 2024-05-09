import {Outlet} from "react-router-dom";
import {createContext, Suspense, useEffect, useState} from "react";
import Requests from "./api/Requests";
import CustomNavigation from "./components/CustomNavigation";

export const UserContext = createContext(undefined);

function RootLayout() {
    const [userData, setUserData] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            // const resp = await Requests.user_by_id('me');
            // if (resp.state === true){
            //     setUserData(resp.data);
            // }
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) {
        return <h1>Loading...</h1>;
    }

    const contextValue = {
        userData,
        setUserData,
    };

    return (
        <UserContext.Provider value={contextValue}>
            <CustomNavigation />
            <div className={'main-content'}>
                <Suspense fallback={<h1>Loading...</h1>}>
                    <Outlet />
                </Suspense>
            </div>
        </UserContext.Provider>
    );
}

export default RootLayout;
