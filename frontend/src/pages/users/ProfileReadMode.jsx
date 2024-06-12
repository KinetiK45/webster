import {Stack} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

function ProfileReadMode({profileData}) {
    return (
        <Container direction="column" maxWidth="xl">
            <Avatar
                src={profileData.avatar}
                sx={{width: '100%', height: 'auto'}}
                variant="rounded"
            >
                {profileData.full_name}
            </Avatar>
            <Typography variant="h3" textAlign="center">
                {profileData.full_name}
            </Typography>
            {/*{profileData?.email &&*/}
            {/*    <Typography variant="caption" textAlign="center">*/}
            {/*        {profileData.email}*/}
            {/*    </Typography>*/}
            {/*}*/}
        </Container>
    )
}

export default ProfileReadMode;
