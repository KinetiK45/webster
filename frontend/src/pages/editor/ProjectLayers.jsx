import {Divider, Stack} from "@mui/material";
import React, {useContext, useEffect, useRef, useState} from "react";
import Typography from "@mui/material/Typography";
import {EditorContext} from "./EditorContextProvider";
import Layer from "../../components/Layer";
import {getOffsets, getPointerStart, setLineCoordinates, setPointsCoordinates} from "../../utils/CoordinatesUtils";
import Container from "@mui/material/Container";
import {customAlert} from "../../utils/Utils";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function ProjectLayers({canvas}) {
    const [objects, setObjects] = useState([]);
    const projectSettings = useContext(EditorContext);
    const objectsRef = useRef([]);

    useEffect(() => {
        objectsRef.current = objects;
    }, [objects]);

    function calculateItemNumber(item) {
        return item.name ?
            objects
            .filter((value) => value.name === item.name)
            .indexOf(item) :
            objects
            .filter((value) => value.type === item.type)
            .indexOf(item);
    }

    function makePointsVisible(active) {
        const object = active[0];
        if (active.length === 1 && object.withPoints) {
            object.p1.visible = object.p2.visible = true;
        }
    }

    function setLinePoints(active) {
        objectsRef.current.map((item, index) => {
            if (item.withPoints) {
                if (item.x1 !== item.p1.left) setLineCoordinates(item);
                item.p1.visible = item.p2.visible = active.includes(item.p1) || active.includes(item.p2);
            }
        });
    }

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const reorderedObjects = Array.from(objects);
        const [movedItem] = reorderedObjects.splice(result.source.index, 1);
        reorderedObjects.splice(result.destination.index, 0, movedItem);
        canvas.remove(...objects);
        reorderedObjects.forEach(obj => canvas.add(obj));
        canvas.renderAll();
    };

    useEffect(() => {
        if (canvas) {
            setObjects(canvas.getObjects());
            let startX = 0, startY = 0;
            canvas.on('mouse:down', (opt) => {
                ({startX, startY} = getPointerStart(canvas, opt))
            });
            canvas.on('object:added', () => {
                setObjects(canvas.getObjects());
            });
            canvas.on('object:removed', () => {
                setObjects(canvas.getObjects());
            });
            canvas.on('selection:created', (opt) => {
                const active = canvas.getActiveObjects();
                makePointsVisible(active);
            });
            canvas.on('selection:updated', () => {
                const active = canvas.getActiveObjects();
                setLinePoints(active);
                makePointsVisible(active);
            });
            canvas.on('selection:cleared', () => {
                setLinePoints([]);
            });
            canvas.on('object:modified', (opt) => {
                if (opt.target.type === 'activeSelection') {
                    opt.target._objects.map((item, index) => {
                        const {offsetX, offsetY} = getOffsets(canvas, opt, startX, startY);
                        if (item.withPoints) {
                            setPointsCoordinates(item, offsetX, offsetY);
                        }
                    });
                }
            });
        }
    }, [canvas]);

    if (!canvas) {
        return <div>Loading...</div>
    }

    return (
        <Container disableGutters sx={{
            p: 0, m: 0,
            overflow: 'hidden',
            backgroundColor: 'background.default', height: '100%'
        }}>
            <Divider/>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                    {(provided) => (
                        <Stack
                            direction="column"
                            sx={{ p: 1, m: 0, height: '100%', overflow: 'scroll' }}
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {objects.length === 0 &&
                                <Typography sx={{ m: 'auto' }}>
                                    No layouts here...
                                </Typography>
                            }
                            {objects.map((item, index) => (
                                !item.needToHide && (
                                    <Draggable key={index} draggableId={index.toString()} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                            >
                                                <Layer
                                                    item={item}
                                                    canvas={canvas}
                                                    index={index}
                                                    sameItemNumber={calculateItemNumber(item)}
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                )
                            ))}
                            {provided.placeholder}
                        </Stack>
                    )}
                </Droppable>
            </DragDropContext>
        </Container>
    )
}

export default ProjectLayers;
