import React, {useContext, useEffect, useRef} from 'react';
import MenuItem from "@mui/material/MenuItem";
import {ListItemIcon, ListItemText} from "@mui/material";
import {fabric} from "fabric";
import {EditorContext} from "../../pages/editor/EditorContextProvider";
import {getPointerStart} from "../../utils/CoordinatesUtils";


function Polygons({ canvas, icon, text, handleFiguresClose, selectedInstrument, changeInstrument }) {
    const projectSettings = useContext(EditorContext);
    const figure = useRef(null);
    const startX = useRef(0);
    const startY = useRef(0);
    const name = useRef(text.toLowerCase());
    const polyOptions = {
        fill: projectSettings.fillColor,
        selectable: true,
        objectCaching: false,
    };

    const onMouseDown = function createShape(options) {
        if (selectedInstrument.current !== name.current) {
            removeListeners();
            return;
        }
        const pointer = getPointerStart(canvas, options);
        startX.current = pointer.startX;
        startY.current = pointer.startY;
        figure.current = new fabric.Polygon([], {
            ...polyOptions,
            left: startX.current,
            top: startY.current,
        });
        canvas.add(figure.current);
    }
    const onMouseMove = function changeShape(options) {
        if (!figure.current) return;

        const pointer = canvas.getPointer(options.e);
        const width = Math.abs(startX.current - pointer.x);
        const height = Math.abs(startY.current - pointer.y);

        switch (name.current) {
            case 'rectangle':
                figure.current.set({
                    points: [
                        { x: 0, y: 0 },
                        { x: width, y: 0 },
                        { x: width, y: height },
                        { x: 0, y: height },
                    ],
                    left: Math.min(pointer.x, startX.current),
                    top: Math.min(pointer.y, startY.current),
                });
                break;

            case 'polygon':
                figure.current.set({
                    points: [
                        { x: width / 2, y: 0 },
                        { x: width, y: height },
                        { x: 0, y: height }
                    ],
                    left: Math.min(pointer.x, startX.current),
                    top: Math.min(pointer.y, startY.current),
                });
                break;

            case 'ellipse':
                const rx = Math.abs((startX.current - pointer.x) / 2);
                const ry = Math.abs((startY.current - pointer.y) / 2);
                const ellipsePoints = [];
                for (let i = 0; i < 50; i++) {
                    const angle = (i * 2 * Math.PI) / 50;
                    ellipsePoints.push({
                        x: rx * Math.cos(angle),
                        y: ry * Math.sin(angle)
                    });
                }
                figure.current.set({
                    points: ellipsePoints,
                    width: width,
                    height: height,
                    left: Math.min(pointer.x, startX.current),
                    top: Math.min(pointer.y, startY.current),
                });
                break;
            default:
                throw new Error('Непідтримувана фігура: ' + text);
        }
        canvas.renderAll();
    }
    const onMouseUp = function endShape(options) {
        if (!figure.current) return;
        const pointer = canvas.getPointer(options.e);
        const isPoint = figure.current.points.length === 0;
        const width = isPoint ? 100 : Math.abs(startX.current - pointer.x);
        const height = isPoint ? 100 : Math.abs(startY.current - pointer.y);
        const shapesProps = {
            width: width,
            height: height,
            pathOffset: { x: width / 2, y: height / 2 },
            left: isPoint ? startX.current - 50 : figure.current.left,
            top: isPoint ? startY.current - 50 : figure.current.top,
        }
        switch (name.current) {
            case 'rectangle':
                figure.current.set({
                    ...shapesProps,
                    points: [
                        { x: 0, y: 0 },
                        { x: width, y: 0 },
                        { x: width, y: height },
                        { x: 0, y: height },
                    ],
                });
                break;

            case 'polygon':
                figure.current.set({
                    ...shapesProps,
                    points: [
                        { x: width / 2, y: 0 },
                        { x: width, y: height },
                        { x: 0, y: height }
                    ],
                });
                break;

            case 'ellipse':
                const ellipsePoints = [];
                for (let i = 0; i < 50; i++) {
                    const angle = (i * 2 * Math.PI) / 50;
                    ellipsePoints.push({
                        x: 50 * Math.cos(angle),
                        y: 50 * Math.sin(angle)
                    });
                }
                figure.current.set({
                    ...shapesProps,
                    points:  isPoint ? ellipsePoints : figure.current.points,
                    pathOffset: { x: 0, y: 0 },
                });
                break;
            default:
                throw new Error('Непідтримувана фігура: ' + text);
        }
        figure.current.setCoords();
        changeInstrument('', false, true);
        figure.current = null;
        removeListeners();
    }
    function removeListeners() {
        canvas.off('mouse:down', onMouseDown);
        canvas.off('mouse:move', onMouseMove);
        canvas.off('mouse:up', onMouseUp);
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
        removeListeners();
        addListeners();
        changeInstrument(name.current, false, false);
    }
    return (
        <MenuItem onClick={addShape}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText>{text}</ListItemText>
        </MenuItem>
    );
}


export default Polygons;