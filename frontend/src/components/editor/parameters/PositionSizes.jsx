import {Grid} from "@mui/material";
import React, {useEffect, useState} from "react";
import {formatDouble} from "../../../utils/Utils";
import ThreeSixtyIcon from '@mui/icons-material/ThreeSixty';
import Typography from "@mui/material/Typography";
import EditorNumberInput from "../../inputs/EditorNumberInput";
import Tooltip from "@mui/material/Tooltip";

function PositionSizes({canvas}) {
    const [w, setW] = useState(0);
    const [h, setH] = useState(0);
    const [top, setTop] = useState(0);
    const [left, setLeft] = useState(0);
    const [angle, setAngle] = useState(0);
    const [lastChangedObject, setLastChangedObject] = useState(undefined);

    const onBlurMarkModified = () => {
        if (lastChangedObject)
            canvas.fire('object:modified', { target: lastChangedObject });
    }

    const changeNumbers = (activeSelection) => {
        if (activeSelection) {
            setW(formatDouble(activeSelection.width * activeSelection.scaleX));
            setH(formatDouble(activeSelection.height * activeSelection.scaleY));
            setLeft(formatDouble(activeSelection.left));
            setTop(formatDouble(activeSelection.top));
            setAngle(formatDouble(activeSelection.angle));
        } else {
            setW(0);
            setH(0);
            setTop(0);
            setLeft(0);
            setAngle(0);
        }
    }
    useEffect(() => {
        if (canvas) {
            const onTargetAction = () => {
                const activeObject = canvas.getActiveObject();
                changeNumbers(activeObject);
            }

            const selectionCleared = () => {
                changeNumbers();
            }

            canvas.on('selection:created', onTargetAction);
            canvas.on('selection:updated', onTargetAction);
            canvas.on('selection:cleared', selectionCleared);
            canvas.on('object:scaling', onTargetAction);
            canvas.on('object:moving', onTargetAction);
            canvas.on('object:rotating', onTargetAction);

            return () => {
                canvas.off('selection:created', onTargetAction);
                canvas.off('selection:updated', onTargetAction);
                canvas.off('selection:cleared', selectionCleared);
                canvas.off('object:scaling', onTargetAction);
                canvas.off('object:moving', onTargetAction);
                canvas.off('object:rotating', onTargetAction);
            };
        }
    }, [canvas]);

    function onWChange(input) {
        const activeObject = canvas.getActiveObject();
        setLastChangedObject(activeObject);
        if (activeObject) {
            const newWidth = input / (activeObject.scaleX);
            if(activeObject.type === 'polygon')
                setNewShapeSize(activeObject, newWidth, 'width', 'x', 'y');
            else
                activeObject.set('width', newWidth);
            activeObject.setCoords();
            canvas.requestRenderAll();
        }
    }

    function onHChange(input) {
        const activeObject = canvas.getActiveObject();
        setLastChangedObject(activeObject);
        if (activeObject) {
            const newHeight = input / (activeObject.scaleY);
            if(activeObject.type === 'polygon')
                setNewShapeSize(activeObject, newHeight, 'height', 'y', 'x');
            else
                activeObject.set('height', newHeight);
            activeObject.setCoords();
            canvas.requestRenderAll();
        }
    }

    function setNewShapeSize(activeObject, newSize, sizeToChange, coordToChange, coordToStay){
        if (!newSize) newSize = 1;
        let newPoints = [];
        let oldPoints = activeObject.points;
        const isEllipse = activeObject.name === 'ellipse';
        const ellipseOffset = {
            [coordToChange]: (activeObject.pathOffset[coordToChange] * newSize) / activeObject[sizeToChange],
            [coordToStay]: activeObject.pathOffset[coordToStay]
        }
        const shapeProps = {
            [sizeToChange]: newSize,
            pathOffset: isEllipse ? ellipseOffset : {[coordToChange]: newSize / 2, [coordToStay]: activeObject.pathOffset[coordToStay]}
        }
        for (let i = 0; i < oldPoints.length; i++) {
            newPoints.push({
                [coordToChange]: (newSize * oldPoints[i][coordToChange]) / activeObject[sizeToChange],
                [coordToStay]: oldPoints[i][coordToStay]
            });
        }
        activeObject.set({
            ...shapeProps,
            points: newPoints
        });
    }

    function onParamChange(input, key) {
        const activeObject = canvas.getActiveObject();
        setLastChangedObject(activeObject);
        if (activeObject) {

            activeObject.set(key, input);

            activeObject.setCoords();
            canvas.requestRenderAll();
        }
    }

    return (
        <Grid container spacing={1}>
            <Grid item xs={6}>
                <EditorNumberInput
                    value={w} step={0.01}
                    onChange={onWChange}
                    onBlur={onBlurMarkModified}
                    icon={<Tooltip title="Element width"><Typography>W:</Typography></Tooltip>}
                />
            </Grid>
            <Grid item xs={6}>
                <EditorNumberInput
                    value={h} step={0.01}
                    onChange={onHChange}
                    onBlur={onBlurMarkModified}
                    icon={<Tooltip title="Element height"><Typography>H:</Typography></Tooltip>}
                />
            </Grid>
            <Grid item xs={6}>
                <EditorNumberInput
                    value={left}
                    onChange={(input) => onParamChange(input, 'left')}
                    onBlur={onBlurMarkModified}
                    icon={<Tooltip title="Left margin"><Typography>L:</Typography></Tooltip>}
                />
            </Grid>
            <Grid item xs={6}>
                <EditorNumberInput
                    value={top}
                    onChange={(input) => onParamChange(input, 'top')}
                    onBlur={onBlurMarkModified}
                    icon={<Tooltip title="Top margin"><Typography>T:</Typography></Tooltip>}
                />
            </Grid>
            <Grid item xs={6}>
                <EditorNumberInput
                    min={0} max={359} value={angle} step={0.01}
                    icon={<Tooltip title="Rotation"><ThreeSixtyIcon fontSize="small"/></Tooltip>}
                    postfixText="deg"
                    onChange={(input) => onParamChange(input, 'angle')}
                    onBlur={onBlurMarkModified}
                />
            </Grid>
        </Grid>
    )
}

export default PositionSizes;