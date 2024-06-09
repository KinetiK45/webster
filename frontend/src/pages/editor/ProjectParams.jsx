import React, {useContext, useEffect, useState} from 'react';
import {Accordion, AccordionDetails, AccordionSummary, Divider, Stack, Typography} from '@mui/material';
import {customAlert} from "../../utils/Utils";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MainColorPicker from "../../components/editor/parameters/MainColorPicker";
import FontSelector from "../../components/editor/parameters/FontSelector";
import Button from "@mui/material/Button";
import Requests from "../../api/Requests";
import {UserContext} from "../../RootLayout";
import Container from "@mui/material/Container";
import {useParams} from "react-router-dom";
import StrokeColorPicker from "../../components/editor/parameters/StrokeColorPicker";
import StrokeWidth from "../../components/editor/parameters/StrokeWidth";
import FontSize from "../../components/editor/parameters/FontSize";
import PositionSizes from "../../components/editor/parameters/PositionSizes";
import CharSpacing from "../../components/editor/parameters/CharSpacing";
import Shadow from "../../components/editor/effects/Shadow";
import {EditorContext} from "./EditorContextProvider";

function ProjectParams({canvas}) {
    const {projectId} = useParams();
    const projectSettings = useContext(EditorContext);
    const {userData} = useContext(UserContext);


    const [currentSelectedType, setCurrentSelectedType] = useState(undefined);


    useEffect(() => {
        if (canvas) {
            const onObjectSelected = () => {
                const activeObject = canvas.getActiveObject();
                setCurrentSelectedType(activeObject?.type)
            };
            const onSelectionCleared = () => {
                setCurrentSelectedType(undefined);
            }

            canvas.on('selection:created', onObjectSelected);
            canvas.on('selection:updated', onObjectSelected);
            canvas.on('selection:cleared', onSelectionCleared)

            return () => {
                canvas.off('selection:created', onObjectSelected);
                canvas.off('selection:updated', onObjectSelected);
                canvas.off('selection:cleared', onSelectionCleared)
            };
        }
    }, [canvas]);

    async function saveProject() {
        if (projectId === 'create' && !userData) {
            localStorage.setItem('project', JSON.stringify(canvas.toJSON()));
            customAlert('Authorization is required', 'warning');
            window.location.href = '/auth/login';
        } else if (projectId === 'create' && userData) {
            const resp = await Requests.create_project(projectSettings.projectName);
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
            <Stack direction="column" sx={{p: 0, m: 0, height: '100%', overflow: 'scroll'}}>
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
                <Accordion disableGutters sx={{display: currentSelectedType === 'textbox' ? '' : 'none'}}>
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
                <Divider style={{ borderWidth: '1px' }} />
                <Accordion disableGutters sx={{display: currentSelectedType !== undefined ? '' : 'none'}}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                    >
                        <Typography>Effects</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Shadow canvas={canvas}/>
                    </AccordionDetails>
                </Accordion>

                <Divider/>
                <Button variant="outlined" onClick={saveProject}>Save</Button>
            </Stack>
        </Container>
    );
}

export default ProjectParams;
