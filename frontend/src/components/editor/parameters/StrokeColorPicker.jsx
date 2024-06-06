import {TextField} from "@mui/material";
import React, {useContext, useEffect, useState} from "react";
import {customAlert} from "../../../utils/Utils";
import {EditorContext} from "../../../pages/editor/EditorContextProvider";

function StrokeColorPicker({canvas}) {
    const projectSettings = useContext(EditorContext);
    const [strokeColorCurrent, setStrokeColorCurrent] = useState(projectSettings.strokeColor);

    useEffect(() => {
        if (canvas) {
            const onObjectSelected = () => {
                const activeObject = canvas.getActiveObject();
                if (activeObject?.stroke) {
                    setStrokeColorCurrent(activeObject.stroke);
                    projectSettings.strokeColor = activeObject.stroke;
                }
            };

            canvas.on('selection:created', onObjectSelected);
            canvas.on('selection:updated', onObjectSelected);

            return () => {
                canvas.off('selection:created', onObjectSelected);
                canvas.off('selection:updated', onObjectSelected);
            };
        }
    }, [canvas, projectSettings]);

    const handleColorChange = (event) => {
        const color = event.target.value;
        projectSettings.strokeColor = color;
        setStrokeColorCurrent(color);

        if (canvas) {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                activeObject.set("stroke", color);
                canvas.requestRenderAll();
            } else {
                customAlert('Please select an object on the canvas first.', 'warning');
            }
        }
    };

    return (
        <TextField
            label="Border"
            type="color"
            margin="none"
            value={strokeColorCurrent}
            onChange={handleColorChange}
            size="small"
            sx={{ width: 70, height: 50}}
        />
    )
}

export default StrokeColorPicker;