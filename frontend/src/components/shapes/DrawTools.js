import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { EditorContext } from "../../pages/editor/EditorContextProvider";
import { ListItemIcon, ListItemText } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import { fabric } from "fabric";

function DrawTools({ canvas, icon, text, func, handleDrawClose }) {
    const pointProps = {
        radius: 3,
        fill: 'white',
        hasControls: false,
        hasBorders: false,
        originX: 'center',
        originY: 'center',
        strokeWidth: 0,
        hoverCursor: 'move',
        linePoint: true,
        needToHide: true,
        selectable: false,
    };
    const lineProps = {
        stroke: 'black',
        strokeWidth: 2,
        fill: '',
        selectable: false,
        objectCaching: false,
        needToHide: true,
        isPenObj: true
    }

    const projectSettings = useContext(EditorContext);
    const lastPoint = useRef(null);
    const tempLine = useRef(null);
    const tempCurve = useRef(null);
    const isMouseDown = useRef(null);
    const isCurving = useRef(null);
    const lastControlPoint = useRef(null)
    const firstClick = useRef(null)
    useEffect(() => {
        firstClick.current = true
    }, [])

    function onMouseUp(options) {
        firstClick.current = false
        isMouseDown.current = false
        canvas.add(tempLine.current)
        if (tempCurve.current) {
            tempCurve.current.set({ 'stroke': 'black' })
            tempCurve.current = null
        }
    }

    function onMouseDown(options) {
        isMouseDown.current = true
        const pointer = canvas.getPointer(options.e);
        let newPoint
        if (options.target?.isPenCircle) {
            newPoint = new fabric.Circle({
                ...pointProps,
                left: options.target.left,
                top: options.target.top,
                isPenCircle: true,
                isPenObj: true,
            })
        } else
            newPoint = new fabric.Circle({
                ...pointProps,
                left: pointer.x,
                top: pointer.y,
                isPenCircle: true,
                isPenObj: true,

            });

        canvas.add(newPoint);
        lastPoint.current = newPoint;
        canvas.renderAll();

        const pathString = `M ${lastPoint.current.left},${lastPoint.current.top} Q ${pointer.x},${pointer.y}`

        const line = new fabric.Path(pathString, lineProps)

        tempLine.current = line

        canvas.renderAll()
    }
    function getLastLine() {
        const objects = canvas.getObjects();
        if (objects.length > 1) {
            return objects[objects.length - 2];
        }
        return null; // If no objects are present on the canvas
    }
    function curveLine(options) {
        canvas.selection = false
        isCurving.current = true
        const pointer = canvas.getPointer(options.e);

        if (!tempCurve.current)
            tempCurve.current = getLastLine();
        if (!tempCurve.current) {
            return
        }

        tempCurve.current.set({ 'stroke': 'red' })

        tempCurve.current.path[1][1] = pointer.x
        tempCurve.current.path[1][2] = pointer.y
        lastControlPoint.current = { x: pointer.x, y: pointer.y }

        canvas.renderAll();
    }

    function calculatePointOnCurve(startPoint, controlPoint, endPoint, distance) {
        // Calculate the vector from the control point to the end point
        const dx = endPoint.x - controlPoint.x;
        const dy = endPoint.y - controlPoint.y;

        // Calculate the length of the vector
        const length = Math.sqrt(dx * dx + dy * dy);

        // Normalize the vector
        const unitVector = { x: dx / length, y: dy / length };

        // Scale the normalized vector by the desired distance
        return {
            x: endPoint.x + unitVector.x * distance,
            y: endPoint.y + unitVector.y * distance
        };
    }

    function drawNewLine(options) {
        if (isCurving.current) {
            let line;
            const objects = canvas.getObjects();

            if (objects.length > 1) {
                line = objects[objects.length - 3];
            }
            if (!line)
                return
            let criticalPoint = calculatePointOnCurve(
                { x: line.path[0][1], y: line.path[0][2] },
                { x: line.path[1][1], y: line.path[1][2] },
                { x: line.path[1][3], y: line.path[1][4] },
                50
            );

            tempLine.current.path[1][1] = criticalPoint.x
            tempLine.current.path[1][2] = criticalPoint.y

            isCurving.current = false;
        }
        const pointer = canvas.getPointer(options.e);

        if (lastPoint.current && tempLine.current) {
            tempLine.current.path[1][3] = pointer.x
            tempLine.current.path[1][4] = pointer.y
            canvas.renderAll();
        }
    }
    function onMouseMove(options) {
        if (isMouseDown.current && !firstClick.current)
            curveLine(options)
        else
            drawNewLine(options)
    }

    function handleCanvasInteraction() {
        handleDrawClose();

        canvas.on('mouse:down', onMouseDown);
        canvas.on('mouse:up', onMouseUp);
        canvas.on('mouse:move', onMouseMove);
        document.addEventListener('keydown', handleEscapeKey, true);
    }

    const handleEscapeKey = useCallback((event) => {
        if (event.key === 'Escape') {
            endPenMode();
        }
    }, []);

    const endPenMode = useCallback(() => {
        canvas.off('mouse:down', onMouseDown);
        canvas.off('mouse:up', onMouseUp);
        canvas.off('mouse:move', onMouseMove);
        document.removeEventListener('keydown', handleEscapeKey, true);

        const objectsToGroup = [];
        canvas.getObjects().forEach(obj => {
            if (obj.isPenObj) {
                objectsToGroup.push(obj);
            }
        });

        const group = new fabric.Group(objectsToGroup,{name:'vector'});
        canvas.add(group);
        objectsToGroup.forEach(obj => canvas.remove(obj));

        handleDrawClose();
    }, [canvas, handleDrawClose]);

    return (
        <MenuItem key={text} onClick={handleCanvasInteraction}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText>{text}</ListItemText>
        </MenuItem>
    );
}

export default DrawTools;
