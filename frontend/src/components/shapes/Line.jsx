import React, {useContext, useRef} from 'react';
import {ListItemIcon, ListItemText} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import {fabric} from "fabric";
import {getOffsets, getPointerStart, setLineCoordinates, setPointsCoordinates} from "../../utils/CoordinatesUtils";
import {EditorContext} from "../../pages/editor/EditorContextProvider";
import {removeShapeListeners} from "../../utils/Utils";

function Line({canvas, handleFiguresClose, icon, selectedInstrument, changeInstrument, setObjectsSelectable}) {
    const projectSettings = useContext(EditorContext);
    const isDrawing = useRef(false);
    const drawingLine = useRef(null);
    const pointProps = {
        radius: 3,
        fill: 'white',
        hasControls: false,
        hasBorders: false,
        originX: 'center',
        originY: 'center',
        strokeWidth: 0,
        hoverCursor: 'move',
        visible: false,
        linePoint: true,
        needToHide: true
    };
    const handlePointMoving = (drawingLine, point, isStartPoint) => {
        const { left, top } = point;
        if (isStartPoint) {
            drawingLine.set({ x1: left, y1: top });
        } else {
            drawingLine.set({ x2: left, y2: top });
        }
        drawingLine.setCoords();
        canvas.renderAll();
    };
    const onMouseDown = function createShape(opt){
        isDrawing.current = true;
        const pointer = canvas.getPointer(opt.e);
        const points = [pointer.x, pointer.y, pointer.x, pointer.y];
        drawingLine.current = new fabric.Line(points, {
            name: 'line',
            strokeWidth: projectSettings.strokeWidth,
            stroke: projectSettings.strokeColor,
            originX: 'center',
            originY: 'center',
            perPixelTargetFind: true,
            selectable: true,
            hasControls: false,
            hasBorders: false
        });
    }
    const onMouseMove = function changeShape(opt){
        if (!isDrawing.current) return;
        if (!canvas.contains(drawingLine.current))
            canvas.add(drawingLine.current);
        const pointer = canvas.getPointer(opt.e);
        drawingLine.current.set({ x2: pointer.x, y2: pointer.y });
        canvas.renderAll();
    };
    const onMouseUp = function endShape(opt){
        if (!isDrawing.current) return;
        isDrawing.current = false;
        drawingLine.current.setCoords();
        if (drawingLine.current.x1 === drawingLine.current.x2 && drawingLine.current.y1 === drawingLine.current.y2) {
            drawingLine.current = null;
            return;
        }
        changeInstrument('', false, true);
        setObjectsSelectable(true);
        addEndPoints();
        canvas.setActiveObject(drawingLine.current)
    };
    const addEndPoints = () => {
        const p1 = new fabric.Circle({
            ...pointProps,
            left: drawingLine.current.x1,
            top: drawingLine.current.y1
        });
        const p2 = new fabric.Circle({
            ...pointProps,
            left: drawingLine.current.x2,
            top: drawingLine.current.y2
        });
        let startX = 0, startY = 0;
        drawingLine.current.p1 = p1;
        drawingLine.current.p2 = p2;
        drawingLine.current.withPoints = true;

        p1.on('moving', (o) => handlePointMoving(drawingLine.current, p1, true));
        p2.on('moving', (o) => handlePointMoving(drawingLine.current, p2, false));
        canvas.on('mouse:down', (opt) => {
            ({ startX, startY } = getPointerStart(canvas, opt));
        });
        drawingLine.current.on('moving', function (opt) {
            if (drawingLine.current.p1.visible || drawingLine.current.p2.visible) {
                drawingLine.current.p1.visible = false;
                drawingLine.current.p2.visible = false;
                canvas.renderAll();
            }
        });
        drawingLine.current.on('modified', function (opt) {
            const { offsetX, offsetY } = getOffsets(canvas, opt, startX, startY);
            setPointsCoordinates(drawingLine.current, offsetX, offsetY);
            drawingLine.current.p1.visible = true;
            drawingLine.current.p2.visible = true;
            setLineCoordinates(drawingLine.current);
            canvas.renderAll();
        });

        canvas.add(p1);
        canvas.add(p2);
        canvas.renderAll();
    };
    function addListeners() {
        canvas.on('mouse:down', onMouseDown);
        canvas.on('mouse:move', onMouseMove);
        canvas.on('mouse:up', onMouseUp);
    }
    const createLine = () => {
        handleFiguresClose();
        if (selectedInstrument.current === 'line') {
            return;
        }
        setObjectsSelectable(false);
        changeInstrument('line', false, false);
        addListeners();
    };
    return (
        <MenuItem onClick={createLine}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText>Line</ListItemText>
        </MenuItem>
    );
}

export default Line;