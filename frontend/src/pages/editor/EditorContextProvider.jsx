import React, { useState, createContext, useContext } from "react";
import {Outlet} from "react-router-dom";
import Typography from "@mui/material/Typography";

export const EditorContext = createContext();

function EditorContextProvider({ children }) {
    // PROJECT:
    const [projectName, setProjectName] = useState('untitled');
    const [projectHeight, setProjectHeight] = useState(400);
    const [projectWidth, setProjectWidth] = useState(500);
    // COLORS:
    const [fillColor, setFillColor] = useState('red');
    const [backgroundColor, setBackgroundColor] = useState('#696969');
    const [textColor, setTextColor] = useState('white');
    // SIZES:
    const [fontSize, setFontSize] = useState(16);
    // OBJECTS:
    const [fillStyleEnable, setFillStyleEnable] = useState(true);

    const value = {
        projectName, setProjectName,
        projectHeight, setProjectHeight,
        projectWidth, setProjectWidth,
        fillColor, setFillColor,
        backgroundColor, setBackgroundColor,
        textColor, setTextColor,
        fontSize, setFontSize,
        fillStyleEnable, setFillStyleEnable
    };

    return (
        <EditorContext.Provider value={value}>
            <Outlet />
        </EditorContext.Provider>
    );
}

export default EditorContextProvider;
