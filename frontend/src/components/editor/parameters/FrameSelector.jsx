import React, {useEffect, useState} from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Button, List, ListItem, ListItemText } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {customAlert} from "../../../utils/Utils";

const frameSizes = [
    { name: 'A4', width: 595, height: 842 },
    { name: 'A5', width: 420, height: 595 },
    { name: 'A6', width: 297, height: 420 },
    { name: 'Letter', width: 612, height: 792 },
    { name: 'Tabloid', width: 792, height: 1224 }
];

const FrameSelector = ({ canvas }) => {
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
    const changeFrame = (width, height) => {
        if (canvas) {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                activeObject.set({
                    width: width,
                    height: height
                });
                canvas.requestRenderAll();
            } else {
                customAlert('Please select an object on the canvas first.', 'warning');
            }
        }
    };

    return (
        <Accordion disableGutters sx={{display: currentSelectedType === 'rect' ? '' : 'none'}}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Frames</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <List>
                    {frameSizes.map((frame, index) => (
                        <ListItem key={index} onClick={() => changeFrame(frame.width, frame.height)}>
                            <ListItemText primary={frame.name} secondary={`${frame.width} × ${frame.height}`} />
                        </ListItem>
                    ))}
                </List>
            </AccordionDetails>
        </Accordion>
    );
};

export default FrameSelector;
