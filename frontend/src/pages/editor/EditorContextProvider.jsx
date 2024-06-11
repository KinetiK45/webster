import React, {createContext, useEffect, useState} from "react";
import {Outlet, useParams} from "react-router-dom";
import {EditorSettings} from "../../utils/EditorSettings";
import Requests from "../../api/Requests";
import {customAlert} from "../../utils/Utils";

export const EditorContext = createContext(new EditorSettings());

function EditorContextProvider({ children }) {
    const [projectSettings, setProjectSettings] = useState(new EditorSettings());
    const { projectId} = useParams();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            projectSettings.projectId = Number.parseInt(projectId);
            try {
                const resp = await Requests.getProjectDetails(projectId);
                if (resp.state === true){
                    projectSettings.projectName = resp.data.project_name;
                }
            } catch (e) {
                customAlert(e.message, 'error')
            }
            setLoading(false);
        };
        if (projectId === 'create'){
            setLoading(false);
        }
        else
            fetchData();
    }, []);

    if (loading) {
        return <h1>Loading project...</h1>;
    }
    return (
        <EditorContext.Provider value={projectSettings}>
            <Outlet />
        </EditorContext.Provider>
    );
}

export default EditorContextProvider;
