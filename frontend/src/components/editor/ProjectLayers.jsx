import {Divider, Stack} from "@mui/material";
import React, {useContext, useEffect, useState} from "react";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from '@mui/icons-material/Delete';
import {EditorContext} from "../../pages/editor/EditorContextProvider";

function ProjectLayers({
                           canvas,
                       }) {
    const [objects, setObjects] = useState([]);
    const projectSettings = useContext(EditorContext);
    const [lastTargetLine, setLastTargetLine] = useState(null);
    function selectObject(index) {
        const object = canvas.getObjects()[index];
        if(object.type === 'line' && object.withPoints){
            canvas.discardActiveObject();
            object.p1.visible = true;
            object.p2.visible = true;
            setLastTargetLine(object);
            projectSettings.setActiveObjects([object]);
        }
        else{
            canvas.setActiveObject(object);
            if(lastTargetLine){
                lastTargetLine.p1.visible = false;
                lastTargetLine.p2.visible = false;
            }
        }
        canvas.renderAll();
    }
    useEffect(() => {
        if (canvas) {
            canvas.on('mouse:down', function (opt) {
                if (opt.target?.type === 'line' && opt.target?.withPoints) {
                    if(lastTargetLine && lastTargetLine !== opt.target){
                        lastTargetLine.p1.visible = false;
                        lastTargetLine.p2.visible = false;
                    }
                    projectSettings.setActiveObjects([opt.target]);
                    opt.target.p1.visible = true;
                    opt.target.p2.visible = true;
                    setLastTargetLine(opt.target)
                }
                else if (lastTargetLine && !opt.target?.linePoint) {
                    lastTargetLine.p1.visible = false;
                    lastTargetLine.p2.visible = false;
                    setLastTargetLine(null)
                }
                canvas.renderAll();
            });
        }
    }, [lastTargetLine]);
    function deleteObject(index) {
        if (canvas) {
            // console.log(canvas);
            const object = canvas.getObjects()[index];
            if (object) {
                console.log(object);
                if(object.withPoints){
                    canvas.remove(object.p1);
                    canvas.remove(object.p2);
                }
                canvas.remove(object);
            }
            // console.log(canvas);
        }
    }

    function calculateItemNumber(item) {
        return objects
            .filter((value) => value.type === item.type)
            .indexOf(item);
    }

    useEffect(() => {
        if (canvas) {
            canvas.on('object:added', () => {
                setObjects(canvas.getObjects())
            });
            canvas.on('object:removed', () => {
                setObjects(canvas.getObjects())
            });
            canvas.on('selection:created', (opt) => {
                projectSettings.setActiveObjects(canvas.getActiveObjects())
            });
            canvas.on('selection:updated', () => {
                projectSettings.setActiveObjects(canvas.getActiveObjects())
            });
            canvas.on('selection:cleared', () => {
                projectSettings.setActiveObjects([]);
            });
        }
    }, [canvas]);

    if (!canvas) {
        return <div>Loading...</div>
    }

    return (
        <>
            <Divider/>
            <Stack direction="column" sx={{p: 1, m: 0, backgroundColor: 'background.default'}}>
                <Typography variant="h3" sx={{m: 'auto'}}>
                    Layouts:
                </Typography>
                <Divider/>
                {objects.length === 0 &&
                    <Typography sx={{m: 'auto'}}>
                        Nothing here...
                    </Typography>
                }
                {objects.map((item, index) => (
                    !item.needToHide && (
                        <React.Fragment key={index}>
                            <Stack direction="row"
                                   onClick={() => {
                                       selectObject(index)
                                   }}
                                   sx={{
                                       display: 'flex', p: 1, justifyContent: 'space-between',
                                       backgroundColor: projectSettings.activeObjects.indexOf(item) === -1 ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                                       // border: '0.5px solid white'
                                   }}
                            >
                                <Typography sx={{m: 'auto'}}>
                                    {item.type} {item.name ? item.name : calculateItemNumber(item)}
                                </Typography>
                                <IconButton
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        deleteObject(index)
                                    }}
                                >
                                    <DeleteIcon/>
                                </IconButton>
                            </Stack>
                            {index < objects.length - 1 && <Divider />}
                        </React.Fragment>
                    )
                ))}
            </Stack>
        </>
    )
}

export default ProjectLayers;
