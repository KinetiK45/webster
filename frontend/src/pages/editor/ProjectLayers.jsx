import {Divider, Stack} from "@mui/material";
import React, {useContext, useEffect, useRef, useState} from "react";
import Typography from "@mui/material/Typography";
import {EditorContext} from "./EditorContextProvider";
import Layer from "../../components/Layer";
import {getOffsets, getPointerStart, setLineCoordinates, setPointsCoordinates} from "../../utils/CoordinatesUtils";
import Container from "@mui/material/Container";
import {CustomStack} from "../../components/styled/CustomStack";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function ProjectLayers({canvas}) {
    const [objects, setObjects] = useState([]);
    const objectsRef = useRef([]);
    const groupCount = useRef(0);

    useEffect(() => {
        objectsRef.current = canvas.getObjects();
    }, [objects]);

    function flattenCanvasObjects(canvasObjects) {
        const result = [];

        function recurse(objects) {
            objects.forEach((item) => {
                if (item.type === 'group' && Array.isArray(item._objects)) {
                    recurse(item._objects);
                }
                result.push(item);
            });
        }

        recurse(canvasObjects);
        return result;
    }
    function calculateItemNumber(item, canvasObjects) {
        const flattenedObjects = flattenCanvasObjects(canvasObjects);
        if (item.name) {
            return flattenedObjects
                .filter((value) => value.name === item.name)
                .indexOf(item);
        } else {
            return flattenedObjects
                .filter((value) => value.type === item.type)
                .indexOf(item);
        }
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

    const moveObjectToIndex = (currentIndex, targetIndex) => {
        const canvasObjects = canvas.getObjects();
        const canvasObj = canvasObjects[currentIndex];

        if (!canvasObj || targetIndex < 0 || targetIndex >= canvasObjects.length) {
            return;
        }

        while (currentIndex < targetIndex) {
            canvas.bringForward(canvasObj);
            currentIndex++;
        }

        while (currentIndex > targetIndex) {
            canvas.sendBackwards(canvasObj);
            currentIndex--;
        }

        canvas.discardActiveObject();
        canvas.renderAll();
        updateObjects(canvas.getObjects());
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const { source, destination } = result;
        const objlen = canvas.getObjects().length;
        moveObjectToIndex(objlen - 1 - source.index, objlen - 1 - destination.index);
    };

    const processItem = (canvasObjects, item, index = null, groupIndex = null) => {
        const objectData = {
            needToHide: item.needToHide,
            name: item.name,
            type: item.type,
            index: index,
            groupIndex: groupIndex,
            itemNumber: calculateItemNumber(item, canvasObjects)
        }
        if (item.type === 'group' && Array.isArray(item._objects)) {
            item.index = groupCount.current++;
            const objects = item._objects.map((groupItem, index) =>
                processItem(canvasObjects, groupItem, index, item.index)
            );
            objectData._objects = objects.reverse();
        }
        return objectData;
    };

    const updateObjects = (canvasObjects) => {
        const updatedObjects = canvasObjects.map((item, index) =>
            processItem(canvasObjects, item, index)
        );

        setObjects(updatedObjects.reverse());
    };

    useEffect(() => {
        if (canvas) {
            updateObjects(canvas.getObjects());
            let startX = 0, startY = 0;
            canvas.on('mouse:down', (opt) => {
                ({startX, startY} = getPointerStart(canvas, opt))
            });
            canvas.on('object:added', () => {
                updateObjects(canvas.getObjects());
            });
            canvas.on('object:removed', () => {
                updateObjects(canvas.getObjects());
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
            // overflow: 'hidden',
            backgroundColor: 'background.default', height: '100%'
        }}>
            <Divider/>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                    {(provided) => (
                        <CustomStack
                            direction="column"
                            sx={{ p: 1, m: 0, height: '100%', overflowX: 'hidden', overflowY: 'scroll' }}
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
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                )
                            ))}
                            {provided.placeholder}
                        </CustomStack>
                    )}
                </Droppable>
            </DragDropContext>
        </Container>
    )
}

export default ProjectLayers;
