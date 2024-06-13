import { FormControlLabel, Stack, Switch, Button, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { customAlert, formatDateRecent } from "../../../utils/Utils";
import Requests from "../../../api/Requests";
import { useParams } from "react-router-dom";
import { EditorContext } from "../../../pages/editor/EditorContextProvider";
import { UserContext } from "../../../RootLayout";
import SaveIcon from '@mui/icons-material/Save';
import CreateIcon from '@mui/icons-material/Create';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import IconButton from "@mui/material/IconButton";
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import Tooltip from "@mui/material/Tooltip";
import {fabric} from "fabric";


function AutoSave({ canvas }) {
    const { projectId } = useParams();
    const projectSettings = useContext(EditorContext);
    const { userData } = useContext(UserContext);
    const [autoSave, setAutoSave] = useState(false);
    const [lastSaveTime, setLastSaveTime] = useState(formatDateRecent(new Date(projectSettings.updated_at)));

    useEffect(() => {
        let intervalId;
        if (autoSave) {
            intervalId = setInterval(saveProject, 60000);
        }
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [autoSave]);

    useEffect(() => {
        const timerId = setInterval(() => {
            setLastSaveTime(formatDateRecent(new Date(projectSettings.updated_at)));
        }, 1000);
        return () => clearInterval(timerId);
    }, []);

    function moveObjectsToOrigin() {
        const hiddenCanvas = new fabric.Canvas(null, { width: canvas.width, height: canvas.height });
        const objects = canvas.getObjects().map(obj => fabric.util.object.clone(obj));
        const group = new fabric.Group(objects);

        hiddenCanvas.add(group);
        group.set({
            left: 0,
            top: 0
        })
        group.setCoords();
        hiddenCanvas.renderAll();

        const items = group._objects;
        group._restoreObjectsState();
        hiddenCanvas.remove(group);

        items.forEach(item => {
            item.toObject = (function(toObject) {
                return function() {
                    return fabric.util.object.extend(toObject.call(this), {
                        name: this.name
                    });
                };
            })(item.toObject);
            hiddenCanvas.add(item);
        });

        hiddenCanvas.renderAll();
        return hiddenCanvas.toJSON();
    }
    function getCanvasSize() {
        const bounds = canvas.getObjects().reduce((acc, obj) => {
            const left = obj.left;
            const top = obj.top;
            const right = left + obj.width;
            const bottom = top + obj.height;

            acc.minX = Math.min(acc.minX, left);
            acc.minY = Math.min(acc.minY, top);
            acc.maxX = Math.max(acc.maxX, right);
            acc.maxY = Math.max(acc.maxY, bottom);

            return acc;
        }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
        const width = bounds.maxX - bounds.minX;
        const height = bounds.maxY - bounds.minY;
        return { width, height };
    }

    async function saveProject() {
        const objects = moveObjectsToOrigin().objects;
        const { width, height } = getCanvasSize();
        const canvasData = canvas.toJSON();
        canvasData.width = width;
        canvasData.height = height;
        canvasData.objects = objects;
        try {
            if (projectId === 'create' && !userData) {
                localStorage.setItem('project', JSON.stringify(canvasData));
                customAlert('Authorization is required', 'warning');
                window.location.href = '/auth/login';
            } else if (projectId === 'create' && userData) {
                const resp = await Requests.create_project(projectSettings.projectName);
                if (resp.state === true) {
                    const projId = resp.data;
                    await Requests.saveProject(projId, canvasData);
                    customAlert('Success', 'success');
                } else {
                    customAlert(resp.message || 'Error', 'error');
                }
            } else {
                const resp = await Requests.saveProject(projectId, canvasData);
                if (resp.state === true)
                    projectSettings.updated_at = new Date();
                customAlert(resp.state ? 'Project saved' : 'Error saving project', resp.state ? 'info' : 'error');
            }
        } catch (e) {
            customAlert(e.toString(), 'error');
        }
    }

    return (
        <Stack direction="row" alignItems="center" spacing={2}>
            {userData !== undefined && projectId !== 'create' && (
                <Tooltip title={`AutoSave mode. Last saved ${lastSaveTime}`}>
                    <IconButton
                        onClick={() => setAutoSave(!autoSave)}
                        sx={{
                            backgroundColor: autoSave ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                            borderRadius: '50%',
                        }}
                    >
                        <AutorenewIcon />
                    </IconButton>
                    </Tooltip>
            )}
            <Tooltip title={autoSave ? 'Blocked by AutoSave' : `${projectId === 'create' ? 'Create' : 'Save'} project`}>
                <Button
                    variant="outlined"
                    onClick={saveProject}
                    disabled={autoSave}
                    startIcon={projectId === 'create' ? <NoteAddIcon /> : <SaveIcon />}
                >
                    {projectId === 'create' ? 'Create' : 'Save'}
                </Button>
            </Tooltip>
        </Stack>
    );
}

export default AutoSave;
