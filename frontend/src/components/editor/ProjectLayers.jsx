import {Divider, Stack} from "@mui/material";
import React, {useContext, useEffect, useRef, useState} from "react";
import Typography from "@mui/material/Typography";
import {EditorContext} from "../../pages/editor/EditorContextProvider";
import Layer from "../Layer";
import {getOffsets, getPointerStart, setLineCoordinates, setPointsCoordinates} from "../../utils/CoordinatesUtils";
import Container from "@mui/material/Container";

function ProjectLayers({canvas}) {
    const [objects, setObjects] = useState([]);
    const projectSettings = useContext(EditorContext);
    const objectsRef = useRef([]);

    useEffect(() => {
        objectsRef.current = objects;
    }, [objects]);

    function calculateItemNumber(item) {
        return objects
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
                projectSettings.setActiveObjects(active);
            });
            canvas.on('selection:updated', () => {
                const active = canvas.getActiveObjects();
                setLinePoints(active);
                makePointsVisible(active);
                projectSettings.setActiveObjects(active);
            });
            canvas.on('selection:cleared', () => {
                setLinePoints([]);
                projectSettings.setActiveObjects([]);
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
            <Stack direction="column" sx={{p: 1, m: 0, height: '100%'}}>
                {objects.length === 0 &&
                    <Typography sx={{m: 'auto'}}>
                        No layouts here...
                    </Typography>
                }
                {objects.map((item, index) => (
                    !item.needToHide && (
                        <Layer key={index} item={item} canvas={canvas} index={index}
                               sameItemNumber={calculateItemNumber(item)}/>
                    )
                ))}
            </Stack>
        </Container>
    )
}

export default ProjectLayers;
