import React, {useContext} from 'react';
import {Divider, Stack, Typography} from '@mui/material';
import {customAlert} from "../../utils/Utils";
import {EditorContext} from "../../pages/editor/EditorContextProvider";
import MainColorPicker from "./MainColorPicker";
import FontSelector from "./FontSelector";
import Button from "@mui/material/Button";
import Requests from "../../api/Requests";
import {UserContext} from "../../RootLayout";
import Container from "@mui/material/Container";

function ProjectParams({canvas}) {
    const projectSettings = useContext(EditorContext);
    const {userData} = useContext(UserContext);

    async function saveProject(event) {
        console.log(canvas.toJSON());
        if (projectSettings.projectId === undefined && !userData) {
            // TODO: save project & redirect to login page + create project after login
            localStorage.setItem('project', JSON.stringify(canvas.toJSON()));
            customAlert('Authorization is required', 'warning');
            window.location.href = '/auth/login';
        } else if (projectSettings.projectId === undefined && userData) {
            // TODO: check
            const resp = await Requests.create_project(projectSettings.projectName);
            if (resp.state === true) {
                const projId = resp.data;
                await Requests.saveProject(projId, canvas.toJSON());
            }
            customAlert('Create project not specified =)', 'error');
        } else
            Requests.saveProject(projectSettings.projectId, canvas.toJSON())
                .then((resp) => {
                    customAlert(resp.state ? 'Saved' : 'Error',
                        resp.state ? 'success' : 'error')
                })
                .catch((e) => {
                    customAlert(e.toString(), 'error')
                })
    }

    return (
        <Container disableGutters sx={{
            p: 0, m: 0,
            overflow: 'hidden',
            backgroundColor: 'background.default', height: '100%'
        }}>
            <Divider/>
            <Stack direction="column" sx={{p: 1, m: 0, height: '100%'}}>
                <FontSelector canvas={canvas}/>
                <Divider sx={{margin: 1}}/>
                <MainColorPicker canvas={canvas}/>
                <Divider/>
                <Button variant="outlined" onClick={saveProject}>Save local</Button>
            </Stack>
        </Container>
    );
}

export default ProjectParams;
