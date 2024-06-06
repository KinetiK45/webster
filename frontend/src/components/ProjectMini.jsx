import {Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import {Link} from "react-router-dom";
import {formatDate} from "../utils/Utils";
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import UpdateIcon from '@mui/icons-material/Update';
import Box from "@mui/material/Box";

function ProjectMini({projectData}) {
    //{"id":2,
    // "project_name":"untitled",
    // "projectImageUrl":"",
    // "updated_at":"2024-06-04T16:16:13.452Z",
    // "created_at":"2024-06-04T16:16:13.452Z"}
    return (
        <Stack direction="column">
            <Link to={`/projects/${projectData.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                <Typography variant="h3">{projectData.project_name}</Typography>
            </Link>
            <Stack direction="row" justifyContent="space-between" sx={{display: 'flex'}}>
                <Box display="flex" alignItems="center">
                    <EditCalendarIcon />
                    <Typography variant="body1" ml={1}>
                        {formatDate(projectData.created_at)}
                    </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                    <UpdateIcon />
                    <Typography variant="body1" ml={1}>
                        {formatDate(projectData.updated_at)}
                    </Typography>
                </Box>
            </Stack>
        </Stack>
    )
}

export default ProjectMini;
