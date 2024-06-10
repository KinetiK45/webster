import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {fabric} from 'fabric';
import Toolbar from "@mui/material/Toolbar";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import TextFieldsIcon from '@mui/icons-material/TextFields';
import RectangleOutlinedIcon from '@mui/icons-material/RectangleOutlined';
import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';
import Menu from "@mui/material/Menu";
import {ListItemIcon, ListItemText, MenuList, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import {
    AddPhotoAlternateOutlined,
    ChangeHistoryOutlined,
    Edit, FilterFrames,
    Gesture, Group, HorizontalRuleOutlined,
    RadioButtonUncheckedOutlined
} from "@mui/icons-material";
import Avatar from "@mui/material/Avatar";
import {EditorContext} from "./EditorContextProvider";
import {actionHandler, anchorWrapper, polygonPositionHandler} from "../../utils/EditPolygon";
import Line from "../../components/shapes/Line";
import Polygons from "../../components/shapes/Polygons";
import EditorTextInput from "../../components/inputs/EditorTextInput";
import Requests from "../../api/Requests";
import {debounce} from "lodash";
import {customAlert, formatDouble, removeShapeListeners} from "../../utils/Utils";
import {findMinMaxValues, setShapeProps} from "../../utils/CoordinatesUtils";
import strokeWidth from "../../components/editor/parameters/StrokeWidth";
import CircularProgress from "@mui/material/CircularProgress";

export function ToolBar({canvas}) {
    const projectSettings = useContext(EditorContext);
    const [figuresAnchorEl, setFiguresAnchorEl] = useState(null);
    const [drawingAnchorEl, setDrawingAnchorEl] = useState(null);
    const [imgPath, setImgPath] = useState('');
    const [activeButtonFromIcons, setActiveButtonFromIcons] = useState(null);
    const selectedInstrument = useRef('');
    const [disabledEditPolygon, setDisabledEditPolygon] = useState(true);
    const [disabledGroup, setDisabledGroup] = useState(true);
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
        if (imgPath === '') return;
        fabric.Image.fromURL(imgPath, function (img) {
            canvas.add(img);
            selectedInstrument.current = '';
            setImgPath('');
        });
    }, [imgPath]);
    useEffect(() => {
        const updatedIcons = iconButtons.map(button => {
            const activeIcon = getActiveIcon(button.key);
            return activeIcon ? {...button, icon: activeIcon} : button;
        });
        setIconButtons(updatedIcons);
    }, [selectedInstrument.current]);
    useEffect(() => {
        if (canvas) {
            const isDisabled = () => {
                const object = canvas.getActiveObject();
                setDisabledEditPolygon(object?.type !== 'polygon');
                setDisabledGroup(object?.type !== 'activeSelection')
            }
            canvas.on('selection:created',isDisabled);
            canvas.on('selection:updated', (opt) => {
                isDisabled();
                clearGroupScale(opt.deselected);
            });
            canvas.on('selection:cleared', (opt) => {
                isDisabled();
                clearGroupScale(opt.deselected);
            });
            canvas.on('object:scaling', (opt)  => {
                if(opt.target.type === 'polygon') {
                   clearScale(opt.target)
                }
            })
            canvas.on('object:modified', (opt) => {
                const target = opt.target;
                if(target.type === 'polygon'){
                    let oldPoints = target.points;
                    let newPoints = [];
                    const isEllipse = target.name === 'ellipse';
                    if(target.edit) {
                        if(isEllipse){
                            newPoints = oldPoints;
                        }
                        else{
                            const { minX, minY, maxX, maxY } = findMinMaxValues(oldPoints);
                            for (let i = 0; i < oldPoints.length; i++) {
                                let x = (oldPoints[i].x - minX) / (maxX - minX) * target.width;
                                let y = (oldPoints[i].y - minY) / (maxY - minY) * target.height;
                                newPoints.push({ x, y });
                            }
                        }
                        target.set({
                            points: newPoints,
                            pathOffset: isEllipse ? target.pathOffset : { x: target.width / 2, y: target.height / 2 }
                        });
                        target.setCoords();
                    }
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
    const getActiveIcon = (key) => {
        switch (key) {
            case 'figures':
                return getActiveButtonFromActions(shapesActions)?.props.icon;
            case 'draw':
                return getActiveButtonFromActions(drawActions)?.icon;
            default:
                return null;
        }
    };
    const getActiveButtonFromActions = (actions) => {
        return actions.find(action => action.key?.toLowerCase() === selectedInstrument.current)
    };
    const changeInstrument = (name, isDrawing, selection) => {
        removeShapeListeners(canvas.__eventListeners);
        selectedInstrument.current = name;
        canvas.selection = selection;
        canvas.isDrawingMode = isDrawing;
    };
    const handleButtonClick = (event, key, onClick) => {
        setActiveButtonFromIcons(key);
        onClick(event);
    };
    const handleFiguresClick = (event) => {
        setFiguresAnchorEl(event.currentTarget);
    };
    const handleFiguresClose = () => {
        setFiguresAnchorEl(null);
    };
    const handleDrawClick = (event) => {
        setDrawingAnchorEl(event.currentTarget);
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
    function createText() {
        if(selectedInstrument.current === 'text') return;
        changeInstrument('text', false, false);
        handleFiguresClose();
        let isDown, origX, origY, textBox;
        function createShape(o) {
            if (textBox) return;
            isDown = true;
            const pointer = canvas.getPointer(o.e);
            origX = pointer.x;
            origY = pointer.y;
            textBox = new fabric.IText('', {
                name: 'text',
                left: origX,
                top: origY,
                fontSize: projectSettings.fontSize,
                fill: projectSettings.fillColor,
                fontFamily: projectSettings.fontFamily,
                stroke: projectSettings.strokeColor,
                strokeWidth: projectSettings.strokeWidth,
                width: 1,
                height: 1,
            });
            canvas.add(textBox);
            canvas.setActiveObject(textBox);
        }
        function changeShape(o) {
            if (!isDown) return;
            const pointer = canvas.getPointer(o.e);
            textBox.set({
                width: Math.abs(origX - pointer.x),
                height:  Math.abs(origY - pointer.y),
            });
            canvas.renderAll();
        }
        function endShape(o) {
            isDown = false;
            changeInstrument('', false, true);
            setObjectsSelectable(true);
            canvas.setActiveObject(textBox);
        }
        canvas.on('mouse:down', createShape);
        canvas.on('mouse:move', changeShape);
        canvas.on('mouse:up', endShape);
        setObjectsSelectable(false);
    }
    function handleAddImage() {
        changeInstrument('image', false, true);
        const input = document.createElement('input');
        input.type = 'file';
        input.addEventListener('change', function (event) {
            const file = event.target.files[0];
            const filePath = URL.createObjectURL(file);
            setImgPath(filePath);
        })

        input.click();
    }
    function enablePen() {
        handleDrawClose();
        changeInstrument('pen', false, false);
    }
    function handleEnableDrawing() {
        handleDrawClose();
        changeInstrument('pencil', true, canvas.selection);
    }
    function editPolygon() {
        const poly = canvas.getActiveObjects()[0];
        poly.edit = !poly.edit;

        if (poly.edit) {
            var lastControl = poly.points.length - 1;
            poly.cornerStyle = 'circle';
            poly.cornerColor = 'rgba(0,0,255,0.5)';
            poly.controls = poly.points.reduce(function (acc, point, index) {
                acc['p' + index] = new fabric.Control({
                    positionHandler: polygonPositionHandler,
                    actionHandler: anchorWrapper(index > 0 ? index - 1 : lastControl, actionHandler),
                    actionName: 'modifyPolygon',
                    pointIndex: index
                });
                return acc;
            }, {});
        } else {
            poly.cornerColor = 'blue';
            poly.cornerStyle = 'rect';
            poly.controls = fabric.Object.prototype.controls;
        }
        poly.hasBorders = !poly.edit;
        canvas.requestRenderAll();
    }
    function clearScale(shape, scaleX, scaleY) {
        if (!scaleX) scaleX = shape.scaleX;
        if (!scaleY) scaleY = shape.scaleY;
        if (scaleX === 1 && scaleY === 1) return;
        let oldPoints = shape.points;
        const isEllipse = shape.name === 'ellipse';
        let newPoints = [];
        const newWidth = formatDouble((shape.width * scaleX));
        const newHeight = formatDouble((shape.height * scaleY));
        const ellipseOffset = {
            x: (shape.pathOffset.x * newWidth) / shape.width,
            y: (shape.pathOffset.y * newHeight) / shape.height
        }
        const shapeProps = {
            width: newWidth,
            height: newHeight,
            scaleX: 1,
            scaleY: 1,
            pathOffset: isEllipse ? ellipseOffset : {x: newWidth / 2, y: newHeight / 2}
        }
        for (let i = 0; i < oldPoints.length; i++) {
            newPoints.push({
                x: (newWidth * oldPoints[i].x) / shape.width,
                y: (newHeight * oldPoints[i].y) / shape.height
            });
        }
        shape.set({
            ...shapeProps,
            points: newPoints
        });
        shape.setCoords();
    }
    function createGroup(){
        const object = canvas.getActiveObject();
        if(object.type === 'activeSelection') {
            object.toGroup();
        }
    }
    function createFrame(){
        changeInstrument('frame', false, false);
        let isDrawing = false;
        let startX, startY;
        let frame;
        function createShape(options) {
            isDrawing = true;
            const pointer = canvas.getPointer(options.e);
            startX = pointer.x;
            startY = pointer.y;

            frame = new fabric.Rect({
                name: 'frame',
                left: startX,
                top: startY,
                width: 0,
                height: 0,
                fill: 'white',
                stroke: 'black',
                strokeWidth: 1,
                selectable: false,
            });
            canvas.add(frame);
        }
        function changeShape(options) {
            if (!isDrawing) return;

            const pointer = canvas.getPointer(options.e);
            const width = pointer.x - startX;
            const height = pointer.y - startY;

            frame.set({
                width: Math.abs(width),
                height: Math.abs(height),
                left: width < 0 ? pointer.x : startX,
                top: height < 0 ? pointer.y : startY
            });

            canvas.renderAll();
        }
        function endShape(options) {
            isDrawing = false;
            frame.set({ selectable: true });
            changeInstrument('', false, true);
            setObjectsSelectable(true);
        }
        canvas.on('mouse:down', createShape);
        canvas.on('mouse:move', changeShape);
        canvas.on('mouse:up', endShape);
        setObjectsSelectable(false);
    }

    const shapesActions = [
        <Polygons key={'Rectangle'} icon={<RectangleOutlinedIcon fontSize="small"/>} text={'Rectangle'} canvas={canvas}
                  handleFiguresClose={handleFiguresClose} selectedInstrument={selectedInstrument}
                  changeInstrument={changeInstrument} setObjectsSelectable={setObjectsSelectable}/>,
        <Polygons key={'Polygon'} icon={<ChangeHistoryOutlined fontSize="small"/>} text={'Polygon'} canvas={canvas}
                  handleFiguresClose={handleFiguresClose} selectedInstrument={selectedInstrument}
                  changeInstrument={changeInstrument} setObjectsSelectable={setObjectsSelectable}/>,
        <Polygons key={'Ellipse'} icon={<RadioButtonUncheckedOutlined fontSize="small"/>} text={'Ellipse'}
                  canvas={canvas} handleFiguresClose={handleFiguresClose} selectedInstrument={selectedInstrument}
                  changeInstrument={changeInstrument} setObjectsSelectable={setObjectsSelectable}/>,
        <Line icon={<HorizontalRuleOutlined fontSize="small"/>} key={'Line'} canvas={canvas}
              handleFiguresClose={handleFiguresClose} selectedInstrument={selectedInstrument}
              changeInstrument={changeInstrument} setObjectsSelectable={setObjectsSelectable}/>,
    ];
    const drawActions = [
        {icon: <Gesture/>, text: 'Pencil', func: handleEnableDrawing},
        {icon: <Edit/>, text: 'Pen', func: enablePen},
    ];
    const [iconButtons, setIconButtons] = useState([
        {key: 'figures', ariaLabel: 'menu', onClick: handleFiguresClick, icon: <PermDataSettingIcon/>},
        {key: 'add-text', ariaLabel: 'add-text', onClick: createText, icon: <TextFieldsIcon/>},
        {key: 'add-image', ariaLabel: 'add-image', onClick: handleAddImage, icon: <AddPhotoAlternateOutlined/>},
        {key: 'draw', ariaLabel: 'menu', onClick: handleDrawClick, icon: <Gesture/>},
        {key: 'edit-polygon', ariaLabel: 'menu', onClick: editPolygon, icon: <Gesture/>},
        {key: 'group', ariaLabel: 'create-group', onClick: createGroup, icon: <Group/>},
        {key: 'frame', ariaLabel: 'create-frame', onClick: createFrame, icon: <FilterFrames/>}
    ]);

    return (
        <Toolbar variant="regular"
                 sx={{display: 'flex', justifyContent: 'space-between', backgroundColor: 'background.default'}}>
            <Stack direction="row" spacing={0.5}>
                {iconButtons.map(({key, ariaLabel, onClick, icon}) => (
                    <IconButton
                        key={key}
                        edge="start"
                        color="inherit"
                        aria-label={ariaLabel}
                        onClick={(event) => handleButtonClick(event, key, onClick)}
                        disabled={(key === 'edit-polygon' && disabledEditPolygon) || (key === 'group' && disabledGroup)}
                        style={{backgroundColor: activeButtonFromIcons === key ? 'grey' : 'initial'}}
                    >
                        {icon}
                    </IconButton>
                ))}
                <Menu
                    anchorEl={figuresAnchorEl}
                    open={Boolean(figuresAnchorEl)}
                    onClose={handleFiguresClose}
                >
                    <MenuList>
                        {shapesActions.map((item) => {
                            return item;
                        })}
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
