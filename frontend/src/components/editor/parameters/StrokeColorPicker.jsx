import React, {useContext, useEffect, useState} from "react";
import {customAlert, formatDouble, hexToRgba, rgbaToHex} from "../../../utils/Utils";
import {EditorContext} from "../../../pages/editor/EditorContextProvider";
import EditorColorPicker from "../../inputs/EditorColorPicker";
import Typography from "@mui/material/Typography";
import EditorNumberInput from "../../inputs/EditorNumberInput";
import {Stack} from "@mui/material";

function StrokeColorPicker({canvas}) {
    const projectSettings = useContext(EditorContext);
    const [strokeColorCurrent, setStrokeColorCurrent] = useState(projectSettings.strokeColor);
    const [strokeOpacityPercentCurrent, setStrokeOpacityPercentCurrent] = useState(projectSettings.fillOpacityPercent);

    const applyPropertyToGroup = (group, property, value) => {
        group.getObjects().forEach(obj => {
            if (obj.type === 'group') {
                applyPropertyToGroup(obj, property, value);
            } else if(obj.type !== 'image'){
                obj.set(property, value);
            }
        });
    };

    useEffect(() => {
        if (canvas) {
            const onObjectSelected = () => {
                const activeObject = canvas.getActiveObject();
                if (activeObject && activeObject.stroke) {
                    const stroke = activeObject.stroke;
                    if (stroke.startsWith('rgba')) {
                        const [hex, alpha] = rgbaToHex(stroke)
                        setStrokeColorCurrent(hex);
                        setStrokeOpacityPercentCurrent(alpha * 100);
                    } else {
                        setStrokeColorCurrent(stroke);
                        setStrokeOpacityPercentCurrent(100);
                    }
                }
                else if (activeObject){
                    setStrokeColorCurrent(projectSettings.strokeColor);
                    setStrokeOpacityPercentCurrent(0);
                }
                else {
                    setStrokeColorCurrent(projectSettings.strokeColor);
                    setStrokeOpacityPercentCurrent(projectSettings.strokeOpacityPercent);
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
        projectSettings.strokeColor = color;
        setStrokeColorCurrent(color);

        if (canvas) {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                const rgbaColor = hexToRgba(color, strokeOpacityPercentCurrent * 0.01);
                if (activeObject.type === 'activeSelection' || activeObject.type === 'group') {
                    applyPropertyToGroup(activeObject, 'stroke', rgbaColor);
                } else {
                    activeObject.set('stroke', rgbaColor);
                }
                canvas.fire('object:modified', { target: activeObject });
                canvas.requestRenderAll();
            }
        }
    };

    const handleOpacityChange = (opacityPercentInput) => {
        const opacityPercent = formatDouble(opacityPercentInput);
        projectSettings.strokeOpacityPercent = opacityPercent;
        setStrokeOpacityPercentCurrent(opacityPercent);
        if (canvas) {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                const rgbaColor = hexToRgba(strokeColorCurrent, opacityPercent * 0.01);
                if (activeObject.type === 'activeSelection'  || activeObject.type === 'group') {
                    applyPropertyToGroup(activeObject, 'stroke', rgbaColor);
                } else {
                    activeObject.set('stroke', rgbaColor);
                }
                canvas.fire('object:modified', { target: activeObject });
                canvas.requestRenderAll();
            }
        }
    };

    return (
        <Stack direction="row" >
            <EditorColorPicker
                icon={<Typography>Stroke</Typography>}
                value={strokeColorCurrent}
                onChange={handleColorChange}
            />
            <EditorNumberInput
                icon={<Typography></Typography>}
                value={strokeOpacityPercentCurrent}
                min={0} max={100} step={1}
                postfixText="%"
                onChange={handleOpacityChange}
            />
        </Stack>
    )
}

export default StrokeColorPicker;