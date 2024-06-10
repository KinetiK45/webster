import React, {useContext, useRef, useState} from "react";
import {EditorContext} from "../../pages/editor/EditorContextProvider";
import {
    findMaxValue, getEllipsePoints,
    getPointerStart,
    setPolygonProps,
    setRectangleProps,
    setShapeProps
} from "../../utils/CoordinatesUtils";
import {fabric} from "fabric";
import MenuItem from "@mui/material/MenuItem";
import {ListItemIcon, ListItemText} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import {FilterFrames} from "@mui/icons-material";

function Frame({ canvas, icon, text, changeInstrument, setObjectsSelectable }) {
    const projectSettings = useContext(EditorContext);
    const frame = useRef(null);
    const startX = useRef(0);
    const startY = useRef(0);
    let isDrawing = false;
    const [disabledGroup, setDisabledGroup] = useState(true);

    const onMouseDown = function createShape(options) {
        isDrawing = true;
        const pointer = canvas.getPointer(options.e);
        startX.current = pointer.x;
        startY.current = pointer.y;

        frame.current = new fabric.Rect({
            name: 'frame',
            left: startX,
            top: startY,
            width: 0,
            height: 0,
            fill: 'white',
            stroke: 'black',
            strokeWidth: 1,
            selectable: false,
        });
        canvas.add(frame);
    }
    const onMouseMove = function changeShape(options) {
        if (!isDrawing) return;

        const pointer = canvas.getPointer(options.e);
        const width = pointer.x - startX.current;
        const height = pointer.y - startY.current;

        frame.current.set({
            width: Math.abs(width),
            height: Math.abs(height),
            left: width < 0 ? pointer.x : startX.current,
            top: height < 0 ? pointer.y : startY.current
        });

        canvas.renderAll();
    }
    const onMouseUp = function endShape() {
        isDrawing = false;
        frame.current.set({ selectable: true });
        changeInstrument('', false, true);
        setObjectsSelectable(true);
    }
    function addListeners() {
        canvas.on('mouse:down', onMouseDown);
        canvas.on('mouse:move', onMouseMove);
        canvas.on('mouse:up', onMouseUp);
    }
    function createFrame(){
        changeInstrument('frame', false, false);
        addListeners();
        setObjectsSelectable(false);
    }
    return (
        <IconButton
            key={'frame'}
            edge="start"
            color="inherit"
            aria-label={'create-frame'}
            onClick={createFrame}
            disabled={disabledGroup}
        >
            <FilterFrames/>
        </IconButton>
    );
}

export default Frame;