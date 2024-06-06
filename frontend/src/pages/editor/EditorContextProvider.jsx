import React, {createContext, useState} from "react";
import {Outlet} from "react-router-dom";
import {EditorSettings} from "../../utils/EditorSettings";

export const EditorContext = createContext(new EditorSettings());

function EditorContextProvider({ children }) {
    const [projectSettings, setProjectSettings] = useState(new EditorSettings());

    return (
        <EditorContext.Provider value={projectSettings}>
            <Outlet />
        </EditorContext.Provider>
    );
}

export default EditorContextProvider;
