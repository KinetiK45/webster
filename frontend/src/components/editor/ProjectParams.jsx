import React, {useContext} from 'react';
import {Accordion, AccordionDetails, AccordionSummary, Divider, Stack, Typography} from '@mui/material';
import {customAlert} from "../../utils/Utils";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MainColorPicker from "./parameters/MainColorPicker";
import FontSelector from "./parameters/FontSelector";
import Button from "@mui/material/Button";
import Requests from "../../api/Requests";
import {UserContext} from "../../RootLayout";
import Container from "@mui/material/Container";
import {useParams} from "react-router-dom";
import StrokeColorPicker from "./parameters/StrokeColorPicker";
import StrokeWidth from "./parameters/StrokeWidth";
import FontSize from "./parameters/FontSize";
import PositionSizes from "./parameters/PositionSizes";
import CharSpacing from "./parameters/CharSpacing";

function ProjectParams({canvas}) {
    const {projectId} = useParams();
    const {userData} = useContext(UserContext);

    async function saveProject() {
        if (projectId === 'create' && !userData) {
            localStorage.setItem('project', JSON.stringify(canvas.toJSON()));
            customAlert('Authorization is required', 'warning');
            window.location.href = '/auth/login';
        } else if (projectId === 'create' && userData) {
            // TODO: project name
            const resp = await Requests.create_project('untitled');
            if (resp.state === true) {
                const projId = resp.data;
                await Requests.saveProject(projId, canvas.toJSON());
                customAlert('Success', 'success');
            } else
                customAlert(resp.message || 'Error', 'error');
        } else
            Requests.saveProject(projectId, canvas.toJSON())
                .then((resp) => {
                    customAlert(resp.state ? 'Saved' : 'Error',
                        resp.state ? 'success' : 'error')
                })
                .catch((e) => {
                    customAlert(e.toString(), 'error')
                })
    }

    return (
        <Container disableGutters sx={{
            p: 0, m: 0,
            overflow: 'hidden',
            backgroundColor: 'background.default', height: '100%'
        }}>
            <Divider/>
            <Stack direction="column" sx={{p: 0, m: 0, height: '100%'}}>
                <Accordion defaultExpanded disableGutters>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                    >
                        <Typography>Sizes</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <PositionSizes canvas={canvas}/>
                        <Divider sx={{m: 1}}/>
                        <StrokeWidth canvas={canvas}/>
                    </AccordionDetails>
                </Accordion>
                <Divider style={{ borderWidth: '1px' }} />
                <Accordion disableGutters>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                    >
                        <Typography>Text</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <FontSelector canvas={canvas}/>
                        <FontSize canvas={canvas} />
                        <CharSpacing canvas={canvas}/>
                    </AccordionDetails>
                </Accordion>

                <Divider style={{ borderWidth: '1px' }} />
                <Accordion disableGutters>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                    >
                        <Typography>Colors</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <MainColorPicker canvas={canvas}/>
                        <StrokeColorPicker canvas={canvas}/>
                    </AccordionDetails>
                </Accordion>

                <Divider/>
                <Button variant="outlined" onClick={saveProject}>Save</Button>
            </Stack>
        </Container>
    );
}

export default ProjectParams;
