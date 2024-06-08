import React, {useContext, useEffect, useState} from "react";
import {customAlert} from "../../../utils/Utils";
import {EditorContext} from "../../../pages/editor/EditorContextProvider";
import EditorColorPicker from "../../inputs/EditorColorPicker";
import Typography from "@mui/material/Typography";

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

    const handleColorChange = (color) => {
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
        <EditorColorPicker
            icon={<Typography>Stroke</Typography>}
            value={strokeColorCurrent}
            onChange={handleColorChange}
        />
    )
}

export default StrokeColorPicker;