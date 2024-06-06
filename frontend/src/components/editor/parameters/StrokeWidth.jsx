import {TextField} from "@mui/material";
import React, {useContext, useEffect, useState} from "react";
import {customAlert} from "../../../utils/Utils";
import {EditorContext} from "../../../pages/editor/EditorContextProvider";

function StrokeWidth({canvas}) {
    const projectSettings = useContext(EditorContext);
    const [strokeWidthCurrent, setStrokeWidthCurrent] = useState(projectSettings.strokeWidth);

    useEffect(() => {
        if (canvas) {
            const onObjectSelected = () => {
                const activeObject = canvas.getActiveObject();
                if (activeObject?.strokeWidth) {
                    setStrokeWidthCurrent(activeObject.strokeWidth);
                    projectSettings.strokeWidth = activeObject.strokeWidth;
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

    const handleStrokeWidthChange = (event) => {
        const input = event.target.value;
        if (input.trim() === '')
            return;
        const strokeWidth = Number.parseInt(input);
        projectSettings.strokeWidth = strokeWidth;
        setStrokeWidthCurrent(strokeWidth);

        if (canvas) {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                activeObject.set("strokeWidth", strokeWidth);
                canvas.requestRenderAll();
            } else {
                customAlert('Please select an object on the canvas first.', 'warning');
            }
        }
    };

    return (

        <TextField
            label="Stroke width"
            type="number"
            margin="none"
            value={strokeWidthCurrent}
            onChange={handleStrokeWidthChange}
            size="small"
            inputProps={{ min: 0, max: 999 }}
            // sx={{ width: 50, height: 50}}
        />
    )
}

export default StrokeWidth;