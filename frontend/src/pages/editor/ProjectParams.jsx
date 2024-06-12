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

function ProjectParams({canvas}) {
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
            </CustomStack>
        </Container>
    );
}

export default ProjectParams;
