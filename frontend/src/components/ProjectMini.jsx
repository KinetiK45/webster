import {Grid, Skeleton, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import {Link} from "react-router-dom";
import {formatDate} from "../utils/Utils";
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import UpdateIcon from '@mui/icons-material/Update';
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import {ToolBar} from "../pages/editor/ToolBar";
import React, {useState} from "react";
import Container from "@mui/material/Container";

function ProjectMini({projectData}) {
    const {
        id, project_name,
        updated_at, created_at,
        projectImageUrl,
        creatorId, creatorName, creatorAvatarLink
    } = projectData;

    const [previewLoaded, setPreviewLoaded] = useState(false);
    const [avatarLoaded, setAvatarLoaded] = useState(false);
    const handlePreviewLoad = () => {
        setPreviewLoaded(true);
    };
    const handleAvatarLoad = () => {
        setAvatarLoaded(true);
    };

    return (
        <Container
            disableGutters
        >
            {!previewLoaded && (
                <Skeleton variant="rounded" width="100%" height={200} />
            )}
            <Avatar
                variant="rounded"
                src={projectImageUrl}
                onLoad={handlePreviewLoad}
                sx={{
                    display: previewLoaded ? 'block' : 'none',
                    width: 'auto',
                    height: 200
                }}
            >
                18+
            </Avatar>
            <Stack direction="row" spacing={1} sx={{mt: 1}}>
                <Avatar src={creatorAvatarLink} onLoad={handleAvatarLoad} width={40} height={40}>
                    {creatorName}
                </Avatar>
                {!avatarLoaded && creatorAvatarLink && creatorAvatarLink.trim() !== '' && (
                    <Skeleton variant="circular" width={40} height={40} sx={{position: 'absolute'}} />
                )}
                <Stack direction="column">
                    <Link to={`/projects/${id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                        <Typography variant="subtitle1" sx={{textAlign: 'left'}}>{project_name}</Typography>
                    </Link>
                    <Link to={`/users/${creatorId}`} style={{textDecoration: 'none', color: 'inherit'}}>
                        <Typography variant="subtitle2" sx={{textAlign: 'left'}}>{creatorName}</Typography>
                    </Link>
                    <Typography variant="caption">
                        {formatDate(created_at)}
                    </Typography>
                </Stack>

            </Stack>
        </Container>
    )
}

export default ProjectMini;
