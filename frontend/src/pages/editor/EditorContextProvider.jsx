import React, {useState, createContext, useContext, useEffect} from "react";
import {Outlet} from "react-router-dom";
import Typography from "@mui/material/Typography";

export const EditorContext = createContext();

function EditorContextProvider({ children }) {
    // PROJECT:
    const [projectName, setProjectName] = useState('untitled');
    const [projectId, setProjectId] = useState(undefined);
    const [projectHeight, setProjectHeight] = useState(400);
    const [projectWidth, setProjectWidth] = useState(500);
    // COLORS:
    const [fillColor, setFillColor] = useState('#be0303');
    const [backgroundColor, setBackgroundColor] = useState('#696969');
    // SIZES:
    const [lineSize, setLineSize] = useState(3);
    const [fontSize, setFontSize] = useState(16);
    // OBJECTS:
    const [fillStyleEnable, setFillStyleEnable] = useState(true);
    // FONTS:
    const [fontFamily, setFontFamily] = useState('Times New Roman');
    const [activeObjects, setActiveObjects] = useState([]);

    const value = {
        projectName, setProjectName,
        projectId, setProjectId,
        projectHeight, setProjectHeight,
        projectWidth, setProjectWidth,
        fillColor, setFillColor,
        backgroundColor, setBackgroundColor,
        lineSize, setLineSize,
        fontSize, setFontSize,
        fillStyleEnable, setFillStyleEnable,
        fontFamily, setFontFamily,
        activeObjects, setActiveObjects
    };

    return (
        <EditorContext.Provider value={value}>
            <Outlet />
        </EditorContext.Provider>
    );
}

export default EditorContextProvider;
