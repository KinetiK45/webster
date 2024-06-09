import Button from "@mui/material/Button";
import React, {useEffect, useState} from "react";
import {hexToRgba} from "../../../utils/Utils";
import {Accordion, AccordionActions, AccordionDetails, AccordionSummary, Divider, Typography} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditorColorPicker from "../../inputs/EditorColorPicker";
import EditorNumberInput from "../../inputs/EditorNumberInput";

function Shadow({canvas}) {
    const [shadowBlur, setShadowBlur] = useState(15);
    const [offsetX, setOffsetX] = useState(10);
    const [offsetY, setOffsetY] = useState(10);
    const [opacity, setOpacity] = useState(0.5);
    const [color, setColor] = useState('#000000');


    useEffect(() => {
        addShadow();
    }, [shadowBlur, offsetY, offsetX, opacity, color]);

    function addShadow() {
        const obj = canvas.getActiveObject();
        if (obj){
            obj.set('shadow', {
                color: hexToRgba(color, opacity),
                blur: shadowBlur,
                offsetX: offsetX,
                offsetY: offsetY,
            });
            canvas.requestRenderAll();
        }
    }

    function removeShadow() {
        const obj = canvas.getActiveObject();
        if (obj){
            obj.set('shadow', null);
            canvas.requestRenderAll();
        }
    }

    return (
        <Accordion disableGutters>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
            >
                <Typography>Shadow</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <EditorColorPicker
                    value={color}
                    onChange={(input) => setColor(input)}
                    icon={<Typography>Color</Typography>}
                />
                <EditorNumberInput
                    value={offsetX}
                    onChange={(input) => setOffsetX(input)}
                    min={-10} max={10} step={0.1}
                    icon={<Typography>X</Typography>}
                />
                <EditorNumberInput
                    value={offsetY}
                    onChange={(input) => setOffsetY(input)}
                    min={-10} max={10} step={0.1}
                    icon={<Typography>Y</Typography>}
                />
                <EditorNumberInput
                    value={opacity}
                    onChange={(input) => setOpacity(input)}
                    min={0.01} max={1} step={0.01}
                    icon={<Typography>Opacity</Typography>}
                />
                <EditorNumberInput
                    value={shadowBlur}
                    onChange={(input) => setShadowBlur(input)}
                    min={1} max={25} step={1}
                    icon={<Typography>Blur</Typography>}
                />
            </AccordionDetails>
            <AccordionActions>
                <Button variant="outlined" onClick={addShadow}>ADD</Button>
                <Button variant="outlined" onClick={removeShadow}>REMOVE</Button>
            </AccordionActions>
        </Accordion>
    )
}

export default Shadow;
