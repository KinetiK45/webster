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
import TextFieldsIcon from "@mui/icons-material/TextFields";

function Text({ canvas, changeInstrument, setObjectsSelectable, handleButtonClick, activeButtonFromIcons }) {
    const projectSettings = useContext(EditorContext);
    const textBox = useRef(null);
    const origX = useRef(0);
    const origY = useRef(0);
    let isDown;

    const onMouseDown = function createShape(options) {
        if (textBox.current) return;
        isDown = true;
        const pointer = canvas.getPointer(options.e);
        origX.current = pointer.x;
        origY.current = pointer.y;
        textBox.current = new fabric.IText('', {
            name: 'text',
            left: origX.current,
            top: origY.current,
            fontSize: projectSettings.fontSize,
            fill: projectSettings.fillColor,
            fontFamily: projectSettings.fontFamily,
            stroke: projectSettings.strokeColor,
            strokeWidth: projectSettings.strokeWidth,
            width: 1,
            height: 1,
        });
        canvas.add(textBox.current);
        canvas.setActiveObject(textBox.current);
    }
    const onMouseMove = function changeShape(options) {
        if (!isDown) return;
        const pointer = canvas.getPointer(options.e);
        textBox.current.set({
            width: Math.abs(origX.current - pointer.x),
            height:  Math.abs(origY.current - pointer.y),
        });
        canvas.renderAll();
    }
    const onMouseUp = function endShape() {
        isDown = false;
        changeInstrument('', false, true);
        setObjectsSelectable(true);
        canvas.setActiveObject(textBox.current);
        textBox.current = null;
    }
    function addListeners() {
        canvas.on('mouse:down', onMouseDown);
        canvas.on('mouse:move', onMouseMove);
        canvas.on('mouse:up', onMouseUp);
    }
    function createText(){
        changeInstrument('text', false, false);
        addListeners();
        setObjectsSelectable(false);
    }
    return (
        <IconButton
            sx={{ backgroundColor: activeButtonFromIcons === 'add-text' ? 'grey' : 'transparent' }}
            edge="start"
            color="inherit"
            aria-label={'add-text'}
            onClick={(event) => handleButtonClick(event, 'add-text', createText)}
        >
            <TextFieldsIcon/>
        </IconButton>
    );
}

export default Text;