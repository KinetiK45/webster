import React, {useContext, useRef} from 'react';
import MenuItem from "@mui/material/MenuItem";
import {ListItemIcon, ListItemText} from "@mui/material";
import {fabric} from "fabric";
import {EditorContext} from "../../pages/editor/EditorContextProvider";
import {getPointerStart} from "../../utils/CoordinatesUtils";

function Polygons({ canvas, icon, text, handleFiguresClose }) {
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

    function onMouseDown(options) {
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

    function onMouseMove(options) {
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

    function onMouseUp(options) {
        if (!figure.current) return;
        removeListeners();
        const pointer = canvas.getPointer(options.e);
        const width = Math.abs(startX.current - pointer.x);
        const height = Math.abs(startY.current - pointer.y);
        if (name.current !== 'ellipse') {
            figure.current.set({
                width: width,
                height: height,
                pathOffset: { x: width / 2, y: height / 2 }
            });
        }
        figure.current.setCoords();
        canvas.selection = true;
        figure.current = null;
    }

    function removeListeners() {
        canvas.off('mouse:down', onMouseDown);
        canvas.off('mouse:move', onMouseMove);
        canvas.off('mouse:up', onMouseUp);
    }

    function addShape() {
        canvas.selection = false;
        handleFiguresClose();

        canvas.on('mouse:down', onMouseDown);
        canvas.on('mouse:move', onMouseMove);
        canvas.on('mouse:up', onMouseUp);
    }

    return (
        <MenuItem onClick={() => addShape()}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText>{text}</ListItemText>
        </MenuItem>
    );
}


export default Polygons;