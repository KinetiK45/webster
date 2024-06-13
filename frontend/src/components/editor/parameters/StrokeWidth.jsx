import React, {useContext, useEffect, useState} from "react";
import {customAlert} from "../../../utils/Utils";
import {EditorContext} from "../../../pages/editor/EditorContextProvider";
import EditorNumberInput from "../../inputs/EditorNumberInput";
import LineWeightIcon from '@mui/icons-material/LineWeight';
import Tooltip from "@mui/material/Tooltip";

function StrokeWidth({canvas}) {
    const projectSettings = useContext(EditorContext);
    const [strokeWidthCurrent, setStrokeWidthCurrent] = useState(projectSettings.strokeWidth);

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
                if (activeObject?.strokeWidth) {
                    setStrokeWidthCurrent(activeObject.strokeWidth);
                    projectSettings.strokeWidth = activeObject.strokeWidth;
                }
            };
            onObjectSelected();
            // canvas.on('selection:created', onObjectSelected);
            canvas.on('selection:updated', onObjectSelected);

            return () => {
                // canvas.off('selection:created', onObjectSelected);
                canvas.off('selection:updated', onObjectSelected);
            };
        }
    }, [canvas, projectSettings]);

    const handleStrokeWidthChange = (input = 0) => {
        const strokeWidth = input;
        projectSettings.strokeWidth = strokeWidth;
        setStrokeWidthCurrent(strokeWidth);

        if (canvas) {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                if (activeObject.type === 'activeSelection' || activeObject.type === 'group') {
                    applyPropertyToGroup(activeObject, 'strokeWidth', strokeWidth);
                } else {
                    activeObject.set('stroke', strokeWidth);
                }
                canvas.fire('object:modified', { target: activeObject });
                canvas.requestRenderAll();
            }
        }
    };

    return (
        <EditorNumberInput
            value={strokeWidthCurrent}
            onChange={handleStrokeWidthChange}
            min={0} max={999}
            icon={<Tooltip title="Stroke width"><LineWeightIcon fontSize="small" /></Tooltip>}
            postfixText="px"
        />
    )
}

export default StrokeWidth;