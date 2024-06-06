import {TextField} from "@mui/material";
import React, {useContext, useEffect, useState} from "react";
import {customAlert} from "../../../utils/Utils";
import {EditorContext} from "../../../pages/editor/EditorContextProvider";

function FontSize({canvas}) {
    const projectSettings = useContext(EditorContext);
    const [fontSizeCurrent, setFontSizeCurrent] = useState(projectSettings.fontSize);

    useEffect(() => {
        if (canvas) {
            const onObjectSelected = () => {
                const activeObject = canvas.getActiveObject();
                if (activeObject?.fontSize) {
                    setFontSizeCurrent(activeObject.fontSize);
                    projectSettings.fontSize = activeObject.fontSize;
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

    const handleFontSizeChange = (event) => {
        const input = event.target.value;
        if (input.trim() === '')
            return;
        const fontSize = Number.parseInt(input);
        projectSettings.fontSize = fontSize;
        setFontSizeCurrent(fontSize);

        if (canvas) {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                activeObject.set("fontSize", fontSize);
                canvas.requestRenderAll();
            } else {
                customAlert('Please select an object on the canvas first.', 'warning');
            }
        }
    };

    return (

        <TextField
            label="Font size"
            type="number"
            margin="none"
            value={fontSizeCurrent}
            onChange={handleFontSizeChange}
            size="small"
            inputProps={{ min: 0, max: 999 }}
            // sx={{ width: 50, height: 50}}
        />
    )
}

export default FontSize;