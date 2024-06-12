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
import {CustomStack} from "../../components/styled/CustomStack";
import {fabric} from "fabric";

function ProjectParams({canvas}) {
    const { projectId } = useParams();
    const projectSettings = useContext(EditorContext);
    const { userData } = useContext(UserContext);

    const [currentSelectedType, setCurrentSelectedType] = useState(undefined);
    const [textAccordion, setTextAccordion] = useState(false);
    const [strokeAndColours, setStrokeAndColours] = useState(false);
    const [fill, setFill] = useState(false);

    useEffect(() => {
        if (canvas) {
            const onObjectSelected = () => {
                const activeObject = canvas.getActiveObject();
                if (activeObject) {
                    resetParams();
                    typesCheck(activeObject);
                    setCurrentSelectedType(activeObject.type);
                } else {
                    resetParams();
                }
            };
            const onSelectionCleared = () => {
                resetParams();
            }

            canvas.on('selection:created', onObjectSelected);
            canvas.on('selection:updated', onObjectSelected);
            canvas.on('selection:cleared', onSelectionCleared);

            return () => {
                canvas.off('selection:created', onObjectSelected);
                canvas.off('selection:updated', onObjectSelected);
                canvas.off('selection:cleared', onSelectionCleared);
            };
        }
    }, [canvas]);

    function resetParams(){
        setStrokeAndColours(false);
        setFill(false);
        setTextAccordion(false);
        setCurrentSelectedType(undefined);
    }
    function typesCheck(activeObject) {
        const typesToCheckFill = ['i-text', 'polygon'];
        const typesToCheckStroke = [...typesToCheckFill, 'path', 'line'];
        let currentTypes = new Set();

        if (activeObject.type === 'group' || activeObject.type === 'activeSelection') {
            activeObject._objects.forEach(obj => currentTypes.add(obj.type));
        }
        else {
            currentTypes.add(activeObject.type)
        }

        if(currentTypes.has('i-text')){
            setTextAccordion(true);
        }
        if (typesToCheckStroke.some(type => currentTypes.has(type))) {
            setStrokeAndColours(true);
        }
        if (typesToCheckFill.some(type => currentTypes.has(type))) {
            setFill(true);
        }
    }
    function getCanvasSize() {
        const bounds = canvas.getObjects().reduce((acc, obj) => {
            const objBounds = obj.getBoundingRect();
            const left = objBounds.left;
            const top = objBounds.top;
            const right = left + objBounds.width;
            const bottom = top + objBounds.height;

            acc.minX = Math.min(acc.minX, left);
            acc.minY = Math.min(acc.minY, top);
            acc.maxX = Math.max(acc.maxX, right);
            acc.maxY = Math.max(acc.maxY, bottom);

            return acc;
        }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });

        const width = bounds.maxX - bounds.minX;
        const height = bounds.maxY - bounds.minY;
        return {width, height};
    }

    async function saveProject() {
        const {width, height} = getCanvasSize();
        const canvasData = canvas.toJSON();
        canvasData.width = width;
        canvasData.height = height;
        if (projectId === 'create' && !userData) {
            localStorage.setItem('project', JSON.stringify(canvasData));
            customAlert('Authorization is required', 'warning');
            window.location.href = '/auth/login';
        } else if (projectId === 'create' && userData) {
            const resp = await Requests.create_project(projectSettings.projectName);
            if (resp.state === true) {
                const projId = resp.data;
                await Requests.saveProject(projId, canvasData);
                customAlert('Success', 'success');
            } else
                customAlert(resp.message || 'Error', 'error');
        } else{
            Requests.saveProject(projectId, canvasData)
                .then((resp) => {
                    customAlert(resp.state ? 'Saved' : 'Error',
                        resp.state ? 'success' : 'error')
                })
                .catch((e) => {
                    customAlert(e.toString(), 'error')
                })
        }
    }

    return (
        <Container disableGutters sx={{
            p: 0, m: 0,
            overflow: 'hidden',
            backgroundColor: 'background.default', height: '100%'
        }}>
            <Divider/>
            <CustomStack direction="column" sx={{p: 0, m: 0, height: '100%', overflow: 'scroll'}}>

                <Accordion disableGutters>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon/>}
                    >
                                <Typography>Sizes</Typography>
                            </AccordionSummary>
                    <AccordionDetails>
                        <PositionSizes canvas={canvas}/>
                        { strokeAndColours &&
                            <>
                                <Divider sx={{m: 1}}/>
                                <StrokeWidth canvas={canvas}/>
                            </>
                        }
                    </AccordionDetails>
                </Accordion>
                <Divider style={{borderWidth: '1px'}}/>

                { textAccordion &&
                    <>
                        <Accordion disableGutters>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon/>}
                            >
                                <Typography>Text</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <FontSelector canvas={canvas}/>
                                <FontSize canvas={canvas}/>
                                <CharSpacing canvas={canvas}/>
                            </AccordionDetails>
                        </Accordion>
                        <Divider style={{borderWidth: '1px'}}/>
                    </>
                }

                { strokeAndColours &&
                    <>
                        <Accordion disableGutters>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                            >
                                <Typography>Colors</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {fill && <MainColorPicker canvas={canvas}/>}
                                <StrokeColorPicker canvas={canvas}/>
                            </AccordionDetails>
                        </Accordion>
                        <Divider style={{ borderWidth: '1px' }} />
                    </>
                }

                <Accordion disableGutters >
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
            </CustomStack>
        </Container>
    );
}

export default ProjectParams;
