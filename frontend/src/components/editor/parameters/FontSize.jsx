import React, {useContext, useEffect, useState} from "react";
import {customAlert} from "../../../utils/Utils";
import {EditorContext} from "../../../pages/editor/EditorContextProvider";
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import EditorNumberInput from "../../inputs/EditorNumberInput";
import Tooltip from "@mui/material/Tooltip";

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

    const handleFontSizeChange = (input) => {
        const fontSize = Number.parseInt(input);
        projectSettings.fontSize = fontSize;
        setFontSizeCurrent(fontSize);

        if (canvas) {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                activeObject.set("fontSize", fontSize);
                canvas.fire('object:modified', { target: activeObject });
                canvas.requestRenderAll();
            } else {
                customAlert('Please select an object on the canvas first.', 'warning');
            }
        }
    };

    return (
        <EditorNumberInput
            value={fontSizeCurrent}
            onChange={handleFontSizeChange}
            min={1} max={100}
            icon={<Tooltip title="Font size"><FormatSizeIcon fontSize="small" /></Tooltip>}
            postfixText="px"
        />
    )
}

export default FontSize;