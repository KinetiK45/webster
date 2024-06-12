import React, {useContext, useRef} from 'react';
import MenuItem from "@mui/material/MenuItem";
import {ListItemIcon, ListItemText} from "@mui/material";
import {fabric} from "fabric";
import {EditorContext} from "../../pages/editor/EditorContextProvider";
import {
    findMaxValue,
    getEllipsePoints,
    getPointerStart, setPolygonProps, setRectangleProps,
    setShapeProps
} from "../../utils/CoordinatesUtils";
import {removeShapeListeners} from "../../utils/Utils";

function Polygons({ canvas, icon, text, handleFiguresClose, selectedInstrument, changeInstrument, setObjectsSelectable, handleShapeClick }) {
    const projectSettings = useContext(EditorContext);
    const figure = useRef(null);
    const startX = useRef(0);
    const startY = useRef(0);
    const pointerLastX = useRef(0);
    const pointerLastY = useRef(0);
    const name = useRef(text.toLowerCase());
    const shiftPressed = useRef(false);
    const polyOptions = {
        strokeWidth: projectSettings.strokeWidth,
        stroke: projectSettings.strokeColor,
        name: name.current,
        fill: projectSettings.fillColor,
        selectable: true,
        objectCaching: false,
    };
    function shiftDown(event) {
        if (event.key === 'Shift' && !shiftPressed.current) {
            shiftPressed.current = true;
            const shape = figure.current;
            if (shape) {
                let sideSize = name.current === 'ellipse' ?
                    Math.max(shape.width, shape.height) :
                    findMaxValue(shape.points);
                const shapesProps = {
                    width: sideSize,
                    height: sideSize,
                    pathOffset: name.current === 'ellipse' ? { x: 0, y: 0} : { x: sideSize / 2, y: sideSize / 2},
                    left: shape.left < startX.current ? startX.current - sideSize : shape.left,
                    top: shape.top < startY.current ? startY.current - sideSize : shape.top
                }

                setShapeProps(name.current, shape, shapesProps, sideSize, sideSize);
                canvas.renderAll();
            }
        }
    }
    function shiftUp(event) {
        if (event.key === 'Shift') {
            shiftPressed.current= false;
            const shape = figure.current;
            if(shape){
                let width = Math.abs(pointerLastX.current - startX.current);
                let height = Math.abs(pointerLastY.current - startY.current);

                const shapesProps = {
                    width: width,
                    height: height,
                    pathOffset: name.current === 'ellipse' ? { x: 0, y: 0} : { x: width / 2, y: height / 2},
                    left: shape.left < startX.current ? pointerLastX.current : shape.left,
                    top: shape.top < startY.current ? pointerLastY.current : shape.top
                }

                setShapeProps(name.current, shape, shapesProps, width, height);
                canvas.renderAll();
            }
        }
    }
    const onMouseDown = function createShape(options) {
        const pointerStart = getPointerStart(canvas, options);
        startX.current = pointerStart.startX;
        startY.current = pointerStart.startY;
        figure.current = new fabric.Polygon([], {
            ...polyOptions,
            left: startX.current,
            top: startY.current,
        });
        canvas.add(figure.current);
        canvas.setActiveObject(figure.current)
        document.addEventListener('keydown', shiftDown);
        document.addEventListener('keyup', shiftUp);
    }
    const onMouseMove = function changeShape(options) {
        const shape = figure.current;
        if (!shape) return;
        const pointer = canvas.getPointer(options.e);
        let width = Math.abs(startX.current - pointer.x);
        let height = Math.abs(startY.current - pointer.y);
        let shapesProps = {
            left: Math.min(pointer.x, startX.current),
            top: Math.min(pointer.y, startY.current),
        }
        if (options.e.shiftKey) {
            width = height = Math.max(width, height);
            if(startX.current >= pointer.x){
                shapesProps.left = startX.current - height;
            }
            if(startY.current >= pointer.y) {
                shapesProps.top = startY.current - height;
            }
        }

        shapesProps = {
            ...shapesProps,
            pathOffset: name.current === 'ellipse' ? { x: 0, y: 0} : { x: width / 2, y: height / 2},
            width: width,
            height: height
        }

        setShapeProps(name.current, shape, shapesProps, width, height);
        canvas.fire('object:scaling', {target: figure.current})
        pointerLastX.current = pointer.x;
        pointerLastY.current = pointer.y;
        canvas.renderAll();
    }
    const onMouseUp = function endShape(options) {
        const shape = figure.current;
        if (!shape) return;
        const pointer = canvas.getPointer(options.e);
        let width =  Math.abs(startX.current - pointer.x);
        let height = Math.abs(startY.current - pointer.y);
        const isPoint = width === 0 || height === 0;
        if(isPoint){
            width = height = 100;
        }

        if (options.e.shiftKey) {
            width = height = Math.max(width, height);
        }
        const pathOffset = name.current !== 'ellipse' ?
            { x: width / 2, y: height / 2 } :
            { x: 0, y: 0 };

        const shapesProps = {
            width: width,
            height: height,
            pathOffset: pathOffset,
            left: isPoint ? startX.current - 50 : shape.left,
            top: isPoint ? startY.current - 50 : shape.top,
        }

        switch (name.current) {
            case 'rectangle':
                setRectangleProps(shape, shapesProps, width, height);
                break;
            case 'polygon':
                setPolygonProps(shape, shapesProps, width, height);
                break;
            case 'ellipse':
                shape.set({
                    ...shapesProps,
                    points:  isPoint ? getEllipsePoints(50,50) : shape.points,
                });
                break;
            default:
                throw new Error('Непідтримувана фігура: ' + text);
        }
        shape.setCoords();
        canvas.setActiveObject(figure.current)
        changeInstrument('', false, true);
        setObjectsSelectable(true);
        figure.current = null;
        document.removeEventListener('keydown', shiftDown);
        document.removeEventListener('keyup', shiftUp);
    }
    function addListeners() {
        canvas.on('mouse:down', onMouseDown);
        canvas.on('mouse:move', onMouseMove);
        canvas.on('mouse:up', onMouseUp);
    }
    function addShape() {
        handleFiguresClose();
        if (selectedInstrument.current === name.current ) {
            return;
        }
        setObjectsSelectable(false);
        changeInstrument(name.current, false, false);
        addListeners();
    }
    return (
        <MenuItem onClick={() => {
            handleShapeClick(text, icon, addShape);
            addShape();
        }}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText>{text}</ListItemText>
        </MenuItem>
    );
}

export default Polygons;