import React, {useContext, useEffect, useState} from "react";
import {customAlert} from "../../../utils/Utils";
import TextRotationNoneIcon from '@mui/icons-material/TextRotationNone';
import EditorNumberInput from "../../inputs/EditorNumberInput";
import Tooltip from "@mui/material/Tooltip";
import FormatSizeIcon from "@mui/icons-material/FormatSize";

function CharSpacing({canvas}) {
    const [charSpacing, setCharSpacing] = useState(0);

    useEffect(() => {
        if (canvas) {
            const onObjectSelected = () => {
                const activeObject = canvas.getActiveObject();
                if (activeObject?.charSpacing) {
                    setCharSpacing(activeObject.charSpacing);
                }
                else
                    setCharSpacing(0);
            };

            canvas.on('selection:created', onObjectSelected);
            canvas.on('selection:updated', onObjectSelected);
            canvas.on('selection:cleared', onObjectSelected);

            return () => {
                canvas.off('selection:created', onObjectSelected);
                canvas.off('selection:updated', onObjectSelected);
                canvas.off('selection:cleared', onObjectSelected);
            };
        }
    }, [canvas]);

    const handleCharSpacingChange = (input = 0) => {
        setCharSpacing(input);

        if (canvas) {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                activeObject.set("charSpacing", Number.parseInt(input));
                canvas.requestRenderAll();
            } else {
                customAlert('Please select an object on the canvas first.', 'warning');
            }
        }
    };

    return (
        <EditorNumberInput
            value={charSpacing}
            onChange={handleCharSpacingChange}
            min={0} max={999}
            icon={<Tooltip title="Char spacing"><TextRotationNoneIcon fontSize="small" /></Tooltip>}
            postfixText="px"
        />
    )
}

export default CharSpacing;