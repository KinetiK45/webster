import {useContext, useEffect, useState} from "react";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import {useParams} from "react-router-dom";
import Requests from "../../api/Requests";
import Container from "@mui/material/Container";
import {Stack} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import {UserContext} from "../../RootLayout";

function Profile() {
    const { user_id} = useParams();
    const {userData} = useContext(UserContext);
    const [profileData, setProfileData] = useState(undefined);

    useEffect(() => {
        const fetchData = async () => {
            if (user_id === 'me'){
                setProfileData(userData);
                return;
            }
            const resp = await Requests.user_by_id(user_id);
            // alert(JSON.stringify(resp));
            if (resp.state === true){
                // resp.data.avatar = Requests.get_avatar_link(resp.data.id);
                setProfileData(resp.data);
            }
            else {
                alert(resp.message || 'Error');
            }
        };
        fetchData();
    }, [user_id, userData]);

    if (!profileData)
        return <CircularProgress />

    return (
        <Container
            maxWidth={'sm'}
            sx={{
                backgroundColor: "background.default",
                padding: 2,
                borderRadius: 2,
                display: 'flex', flexDirection: 'column', gap: 2,
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)'
            }}
        >
            <Stack direction="row">
                <Avatar
                    src={profileData.photo}
                    sx={{ width: 200, height: 200 }}
                    variant="rounded"
                >
                    {profileData.full_name}
                </Avatar>
                <Stack direction="column" sx={{margin: 'auto', textAlign: 'center'}}>
                    <Typography variant="h3">
                        {profileData.full_name}
                    </Typography>
                    {profileData?.email &&
                        <Typography variant="caption">
                            {profileData.email}
                        </Typography>
                    }
                </Stack>
            </Stack>
        </Container>
    )
}

export default Profile;
