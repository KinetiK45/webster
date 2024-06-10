import React, { useContext, useEffect, useRef, useState} from 'react';
import Toolbar from "@mui/material/Toolbar";
import MenuItem from "@mui/material/MenuItem";
import RectangleOutlinedIcon from '@mui/icons-material/RectangleOutlined';
import Menu from "@mui/material/Menu";
import {ListItemIcon, ListItemText, MenuList, Stack} from "@mui/material";
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
import {clearScale, handleEditedPolygon} from "../../utils/CoordinatesUtils";
import CircularProgress from "@mui/material/CircularProgress";
import IconButtons from "../../components/toolbar/IconButtons";

export function ToolBar({canvas}) {
    const projectSettings = useContext(EditorContext);
    const [figuresAnchorEl, setFiguresAnchorEl] = useState(null);
    const [drawingAnchorEl, setDrawingAnchorEl] = useState(null);
    const selectedInstrument = useRef('');
    const [lastSelectedTool, setLastSelectedTool] = useState(null);
    const [lastSelectedDraw, setLastSelectedDraw] = useState(null);
    const [projectName, setProjectName] = useState(projectSettings.projectName);
    const [projectSaving, setProjectSaving] = useState(false);
    const debouncedFetchData = debounce(async () => {
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
        if (projectName !== projectSettings.projectName && projectName.trim() !== '' && projectSettings.projectId){
            setProjectSaving(true);
            debouncedFetchData();
            return debouncedFetchData.cancel;
        }
    }, [projectName]);
    useEffect(() => {
        if (canvas) {
            canvas.on('selection:updated', (opt) => clearGroupScale(opt.deselected));
            canvas.on('selection:cleared', (opt) => clearGroupScale(opt.deselected));
            canvas.on('object:scaling', (opt)  => {
                if(opt.target.type === 'polygon') {
                   clearScale(opt.target)
                }
            })
            canvas.on('object:modified', (opt) => {
                if(opt.target.type === 'polygon'){
                   handleEditedPolygon(opt.target);
                }
            });
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
    function clearGroupScale(group) {
        if(group?.length){
            group.map(item => {
                if(item.type === 'polygon') clearScale(item)
            })
        }
    }
    function enablePen() {
        changeInstrument('pen', false, false);
    }
    function handleEnableDrawing() {
        changeInstrument('pencil', true, canvas.selection);
    }
    const commonProps = {
        canvas: canvas,
        handleShapeClick: handleShapeClick,
        handleFiguresClose: handleFiguresClose,
        selectedInstrument: selectedInstrument,
        changeInstrument: changeInstrument,
        setObjectsSelectable: setObjectsSelectable
    };
    const shapesActions = [
        <Polygons key={'Rectangle'} icon={<RectangleOutlinedIcon fontSize="small"/>} text={'Rectangle'} {...commonProps} />,
        <Polygons key={'Polygon'} icon={<ChangeHistoryOutlined fontSize="small"/>} text={'Polygon'} {...commonProps} />,
        <Polygons key={'Ellipse'} icon={<RadioButtonUncheckedOutlined fontSize="small"/>} text={'Ellipse'} {...commonProps} />,
        <Line icon={<HorizontalRuleOutlined fontSize="small"/>} key={'Line'} {...commonProps} />
    ];
    const drawActions = [
        {icon: <Gesture/>, text: 'Pencil', func: () => {
            handleDrawSelected('Pencil', <Gesture/>, handleEnableDrawing);
            handleEnableDrawing();
        }},
        {icon: <Edit/>, text: 'Pen', func: () => {
                handleDrawSelected('Pen', <Edit/>, enablePen);
                enablePen();
        }},
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
                            return <MenuItem key={item.text} onClick={item.func}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText>{item.text}</ListItemText>
                            </MenuItem>
                        })}
                    </MenuList>
                </Menu>
            </Stack>
            <EditorTextInput
                icon={projectSaving ? <CircularProgress /> : <Typography>Name:</Typography>}
                value={projectSettings.projectName}
                onChange={(input) => setProjectName(input)}
            />
            <Stack spacing={1} direction="row" sx={{display: 'flex', alignItems: 'center'}}>
                <Avatar alt="Avatar"/>
                <Typography>
                    Creator Name
                </Typography>
            </Stack>
        </Toolbar>
    );
}
