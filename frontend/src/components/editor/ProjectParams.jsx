import {Divider, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import React from "react";

function ProjectParams({canvas}) {
    return (
        <>
            <Divider/>
            <Stack direction="column" sx={{p: 1, m: 0, backgroundColor: 'background.default'}}>
                <Typography variant="h3" sx={{m: 'auto'}}>
                    Settings:
                </Typography>
                <Divider />
                <Typography>
                    Nothing here...
                </Typography>
            </Stack>
        </>
    )
}

export default ProjectParams;
