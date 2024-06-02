import {TextField} from "@mui/material";
import React, {useContext, useEffect} from "react";
import {customAlert} from "../../utils/Utils";
import {EditorContext} from "../../pages/editor/EditorContextProvider";

function MainColorPicker({canvas}) {
    const projectSettings = useContext(EditorContext);

    useEffect(() => {
        if (canvas) {
            const onObjectSelected = () => {
                const activeObject = canvas.getActiveObject();
                if (activeObject) {
                    projectSettings.setFillColor(activeObject.fill || projectSettings.fillColor);
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
        projectSettings.setFillColor(color);

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
            label="Choose Color"
            type="color"
            value={projectSettings.fillColor}
            onChange={handleColorChange}
            sx={{ width: '100%', margin: '8px 0' }}
        />
    )
}

export default MainColorPicker;