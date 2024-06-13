import React, { useContext, useEffect, useState } from "react";
import {formatDouble, hexToRgba, rgbaToHex} from "../../../utils/Utils";
import { EditorContext } from "../../../pages/editor/EditorContextProvider";
import EditorColorPicker from "../../inputs/EditorColorPicker";
import Typography from "@mui/material/Typography";
import EditorNumberInput from "../../inputs/EditorNumberInput";
import {Stack} from "@mui/material";

function MainColorPicker({ canvas }) {
    const projectSettings = useContext(EditorContext);
    const [fillColorCurrent, setFillColorCurrent] = useState(projectSettings.fillColor);
    const [fillOpacityPercentCurrent, setFillOpacityPercentCurrent] = useState(projectSettings.fillOpacityPercent);

    const applyPropertyToGroup = (group, property, value) => {
        group.getObjects().forEach(obj => {
            if (obj.type === 'group') {
                applyPropertyToGroup(obj, property, value);
            } else if(obj.type === 'i-text' || obj.type === 'polygon'){
                obj.set(property, value);
            }
        });
    };

    useEffect(() => {
        if (canvas) {
            const onObjectSelected = () => {
                const activeObject = canvas.getActiveObject();
                if (activeObject && activeObject.fill) {
                    const fill = activeObject.fill;
                    if (fill.startsWith('rgba')) {
                        const [hex, alpha] = rgbaToHex(fill)
                        setFillColorCurrent(hex);
                        setFillOpacityPercentCurrent(alpha * 100);
                    }
                    else {
                        setFillColorCurrent(fill);
                        setFillOpacityPercentCurrent(100);
                    }
                }
                else if (activeObject){
                    setFillColorCurrent(projectSettings.fillColor);
                    setFillOpacityPercentCurrent(0);
                }
                else {
                    setFillColorCurrent(projectSettings.fillColor);
                    setFillOpacityPercentCurrent(projectSettings.fillOpacityPercent);
                }
            };
            onObjectSelected();
            // canvas.on('selection:created', onObjectSelected);
            canvas.on('selection:updated', onObjectSelected);
            canvas.on('selection:cleared', onObjectSelected);

            return () => {
                // canvas.off('selection:created', onObjectSelected);
                canvas.off('selection:updated', onObjectSelected);
                canvas.off('selection:cleared', onObjectSelected);
            };
        }
    }, [canvas, projectSettings]);

    const handleColorChange = (color) => {
        projectSettings.fillColor = color;
        setFillColorCurrent(color);

        if (canvas) {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                const rgbaColor = hexToRgba(color, fillOpacityPercentCurrent * 0.01);
                if (activeObject.type === 'activeSelection' || activeObject.type === 'group') {
                    applyPropertyToGroup(activeObject, 'fill', rgbaColor);
                } else {
                    activeObject.set('fill', rgbaColor);
                }
                canvas.fire('object:modified', { target: activeObject });
                canvas.requestRenderAll();
            }
        }
    };

    const handleOpacityChange = (opacityPercentInput) => {
        const opacityPercent = formatDouble(opacityPercentInput);
        projectSettings.fillOpacityPercent = opacityPercent;
        setFillOpacityPercentCurrent(opacityPercent);
        if (canvas) {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                const rgbaColor = hexToRgba(fillColorCurrent, opacityPercent * 0.01);
                if (activeObject.type === 'activeSelection' || activeObject.type === 'group') {
                    applyPropertyToGroup(activeObject, 'fill', rgbaColor);
                } else {
                    activeObject.set('fill', rgbaColor);
                }
                canvas.fire('object:modified', { target: activeObject });
                canvas.requestRenderAll();
            }
        }
    };

    return (
        <Stack direction="row" >
            <EditorColorPicker
                icon={<Typography>Fill</Typography>}
                value={fillColorCurrent}
                onChange={handleColorChange}
            />
            <EditorNumberInput
                icon={<Typography></Typography>}
                value={fillOpacityPercentCurrent}
                min={0} max={100} step={1}
                postfixText="%"
                onChange={handleOpacityChange}
            />
        </Stack>
    )
}

export default MainColorPicker;
