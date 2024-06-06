import {TextField} from "@mui/material";
import React, {useContext, useEffect, useState} from "react";
import {customAlert} from "../../../utils/Utils";
import {EditorContext} from "../../../pages/editor/EditorContextProvider";

function MainColorPicker({canvas}) {
    const projectSettings = useContext(EditorContext);
    const [fillColorCurrent, setFillColorCurrent] = useState(projectSettings.fillColor);

    useEffect(() => {
        if (canvas) {
            const onObjectSelected = () => {
                const activeObject = canvas.getActiveObject();
                if (activeObject?.fill) {
                    setFillColorCurrent(activeObject.fill);
                    projectSettings.fillColor = activeObject.fill;
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
        projectSettings.fillColor = color;
        setFillColorCurrent(color);

        if (canvas) {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                activeObject.set("fill", color);
                canvas.requestRenderAll();
            } else {
                customAlert('Please select an object on the canvas first.', 'warning');
            }
        }
    };

    return (
        <TextField
            label="Fill"
            type="color"
            margin="none"
            value={fillColorCurrent}
            onChange={handleColorChange}
            size="small"
            sx={{ width: 50, height: 50}}
        />
    )
}

export default MainColorPicker;