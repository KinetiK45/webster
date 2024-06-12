import React, { useContext, useEffect, useRef, useState} from 'react';
import Toolbar from "@mui/material/Toolbar";
import RectangleOutlinedIcon from '@mui/icons-material/RectangleOutlined';
import Menu from "@mui/material/Menu";
import {FormControlLabel, MenuList, Stack, Switch} from "@mui/material";
import Typography from "@mui/material/Typography";
import {
    ChangeHistoryOutlined,
    Edit, Gesture, HorizontalRuleOutlined,
    RadioButtonUncheckedOutlined
} from "@mui/icons-material";
import Avatar from "@mui/material/Avatar";
import {EditorContext} from "./EditorContextProvider";
import Line from "../../components/shapes/Line";
import Polygons from "../../components/shapes/Polygons";
import EditorTextInput from "../../components/inputs/EditorTextInput";
import Requests from "../../api/Requests";
import {debounce} from "lodash";
import {customAlert, removeShapeListeners} from "../../utils/Utils";
import CircularProgress from "@mui/material/CircularProgress";
import IconButtons from "../../components/toolbar/IconButtons";
import DrawTools from "../../components/shapes/DrawTools";
import AutoSave from "../../components/editor/parameters/AutoSave";

export function ToolBar({canvas}) {
    const projectSettings = useContext(EditorContext);
    const [figuresAnchorEl, setFiguresAnchorEl] = useState(null);
    const [drawingAnchorEl, setDrawingAnchorEl] = useState(null);
    const selectedInstrument = useRef('');
    const [lastSelectedTool, setLastSelectedTool] = useState(null);
    const [lastSelectedDraw, setLastSelectedDraw] = useState(null);
    const [projectName, setProjectName] = useState(projectSettings.projectName);
    const [projectSaving, setProjectSaving] = useState(false);

    const debouncedUpdateProjectName = debounce(async () => {
        setProjectSaving(true);
        const resp = await Requests.updateProjectDetails(projectSettings.projectId, projectName);
        if (resp.state === true){
            projectSettings.projectName = projectName;
        }
        else
            customAlert(resp.message || 'Error');
        setProjectSaving(false);
    }, 1000);
    useEffect(() => {
        if (projectSettings.projectId){
            if (projectName !== projectSettings.projectName && projectName.trim() !== ''){
                setProjectSaving(true);
                debouncedUpdateProjectName();
                return debouncedUpdateProjectName.cancel;
            }
        }
        else
            projectSettings.projectName = projectName;
    }, [projectName]);

    useEffect(() => {
        if (canvas) {
            document.addEventListener('keydown', function(event) {
                if (event.key === 'Backspace' || event.key === 'Delete') {
                    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
                        return;
                    }
                    event.preventDefault();
                    const activeObjects = canvas.getActiveObjects();
                    if (activeObjects.length) {
                        activeObjects.map(item => canvas.remove(item));
                        canvas.discardActiveObject();
                    }
                }
            });
        }
    }, [canvas]);
    function setObjectsSelectable(selectable) {
        canvas.getObjects().forEach(obj => {
            obj.selectable = selectable;
            obj.evented = selectable;
        });
    }
    const changeInstrument = (name, isDrawing, selection) => {
        removeShapeListeners(canvas.__eventListeners);
        selectedInstrument.current = name;
        canvas.selection = selection;
        canvas.isDrawingMode = isDrawing;
    };
    const handleDrawSelected = (draw, icon, onClick) => {
        setLastSelectedDraw({ draw, icon, onClick });
        setDrawingAnchorEl(null);
    };
    const handleShapeClick = (shape, icon, onClick) => {
        setLastSelectedTool({ shape, icon, onClick });
        setFiguresAnchorEl(null);
    };
    const handleFiguresClose = () => {
        setFiguresAnchorEl(null);
    };
    const handleDrawClose = () => {
        setDrawingAnchorEl(null);
    };
    const commonProps = {
        canvas: canvas,
        selectedInstrument: selectedInstrument,
        changeInstrument: changeInstrument,
        setObjectsSelectable: setObjectsSelectable
    };
    const commonShapesProps = {
        ...commonProps,
        handleShapeClick: handleShapeClick,
        handleFiguresClose: handleFiguresClose
    };
    const commonDrawProps = {
        ...commonProps,
        handleDrawSelected: handleDrawSelected,
        handleDrawClose: handleDrawClose
    };
    const shapesActions = [
        <Polygons key={'Rectangle'} icon={<RectangleOutlinedIcon />} text={'Rectangle'} {...commonShapesProps} />,
        <Polygons key={'Polygon'} icon={<ChangeHistoryOutlined />} text={'Polygon'} {...commonShapesProps} />,
        <Polygons key={'Ellipse'} icon={<RadioButtonUncheckedOutlined />} text={'Ellipse'} {...commonShapesProps} />,
        <Line icon={<HorizontalRuleOutlined />} key={'Line'} {...commonShapesProps} />
    ];
    const drawActions = [
        <DrawTools icon={<Gesture />} text={'Pencil'} {...commonDrawProps}/>,
        <DrawTools icon={<Edit />} text={'Pen'} {...commonDrawProps}/>,
    ];
    return (
        <Toolbar variant="regular"
                 sx={{display: 'flex', justifyContent: 'space-between', backgroundColor: 'background.default'}}>
            <Stack direction="row" spacing={0.5}>
                <IconButtons
                    canvas={canvas} setObjectsSelectable={setObjectsSelectable}
                    changeInstrument={changeInstrument} setFiguresAnchorEl={setFiguresAnchorEl}
                    setDrawingAnchorEl={setDrawingAnchorEl} lastSelectedTool={lastSelectedTool}
                    lastSelectedDraw={lastSelectedDraw}
                />
                <Menu
                    anchorEl={figuresAnchorEl}
                    open={Boolean(figuresAnchorEl)}
                    onClose={handleFiguresClose}
                >
                    <MenuList>
                        {shapesActions.map((item) => (
                           item
                        ))}
                    </MenuList>
                </Menu>
                <Menu
                    anchorEl={drawingAnchorEl}
                    open={Boolean(drawingAnchorEl)}
                    onClose={handleDrawClose}
                >
                    <MenuList>
                        {drawActions.map((item) => {
                            return item;
                        })}
                    </MenuList>
                </Menu>
            </Stack>
            <EditorTextInput
                icon={projectSaving ? <Typography><CircularProgress size={15} sx={{mr: 1}} />Name:</Typography> : <Typography>Name:</Typography>}
                value={projectName}
                onChange={(input) => setProjectName(input)}
            />
            <AutoSave canvas={canvas} />
        </Toolbar>
    );
}
