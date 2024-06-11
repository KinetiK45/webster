import React, {useContext, useEffect, useState} from 'react';
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
    Edit,
    Gesture,
    RadioButtonUncheckedOutlined
} from "@mui/icons-material";
import Avatar from "@mui/material/Avatar";
import {EditorContext} from "./EditorContextProvider";
import {actionHandler, anchorWrapper, polygonPositionHandler} from "../../utils/EditPolygon";
import Line from "../../components/shapes/Line";
import Polygons from "../../components/shapes/Polygons";
import DrawTools from "../../components/shapes/DrawTools";

export function Editor({canvas}) {
    const projectSettings = useContext(EditorContext);
    const [figuresAnchorEl, setFiguresAnchorEl] = useState(null);
    const [drawingAnchorEl, setDrawingAnchorEl] = useState(null);
    const [imgPath, setImgPath] = useState('');

    useEffect(() => {
        if (imgPath === '') return;
        fabric.Image.fromURL(imgPath, function (img) {
            canvas.add(img);
            setImgPath('');
        });
    }, [imgPath]);
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
    function createText() {
        const text = new fabric.Textbox('Hello', {
            left: 100,
            top: 130,
            fontSize: projectSettings.fontSize,
            fill: projectSettings.fillColor,
            fontFamily: projectSettings.fontFamily,
        });
        canvas.add(text);
        handleFiguresClose();
    }
    function handleAddImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.addEventListener('change', function (event) {
            const file = event.target.files[0];
            const filePath = URL.createObjectURL(file);
            setImgPath(filePath);
        })

        input.click();
    }
    function handleEnableDrawing() {
        handleDrawClose();
        canvas.isDrawingMode = !canvas.isDrawingMode;
    }
    function enablePen() {
        handleDrawClose();
        // changeInstrument('pen', false, false);
    }
    function editPolygon() {
        const poly = canvas.getActiveObjects()[0];
        poly.edit = !poly.edit;

        if (poly.edit) {
            var lastControl = poly.points.length - 1;
            poly.cornerStyle = 'circle';
            poly.cornerColor = 'rgba(0,0,255,0.5)';
            poly.controls = poly.points.reduce(function(acc, point, index) {
                acc['p' + index] = new fabric.Control({
                        positionHandler: polygonPositionHandler,
                        actionHandler: anchorWrapper(index > 0 ? index - 1 : lastControl, actionHandler),
                        actionName: 'modifyPolygon',
                        pointIndex: index
                });
                return acc;
            }, { });
        } else {
            poly.cornerColor = 'blue';
            poly.cornerStyle = 'rect';
            poly.controls = fabric.Object.prototype.controls;
        }
        poly.hasBorders = !poly.edit;
        canvas.requestRenderAll();
    }
    const isDisabled = () => {
        if (!canvas) return true;
        const objects = canvas.getActiveObjects();
        return !(objects.length === 1 && objects[0].type === 'polygon');
    };

    const shapesActions = [
        <Polygons key={'Rectangle'} icon={<RectangleOutlinedIcon fontSize="small" />} text={'Rectangle'} canvas={canvas} handleFiguresClose={handleFiguresClose}/>,
        <Polygons key={'Polygon'} icon={<ChangeHistoryOutlined fontSize="small" />} text={'Polygon'} canvas={canvas} handleFiguresClose={handleFiguresClose}/>,
        <Polygons key={'Ellipse'} icon={<RadioButtonUncheckedOutlined fontSize="small" />} text={'Ellipse'} canvas={canvas} handleFiguresClose={handleFiguresClose}/>,
        <Line key={'Line'} canvas={canvas} handleFiguresClose={handleFiguresClose}/>,
    ];
    const drawActions = [
        <DrawTools canvas={canvas} icon={<Edit fontSize="small" />} text={'Pen'} handleDrawClose={handleDrawClose}/>,
        <DrawTools canvas={canvas} icon={<Gesture fontSize="small" />} text={'Pencil'} handleDrawClose={handleDrawClose} />
    ];
    const iconButtonConfigs = [
        { key: 'figures', ariaLabel: 'menu', onClick: handleFiguresClick, icon: <PermDataSettingIcon /> },
        { key: 'add-text', ariaLabel: 'add-text', onClick: createText, icon: <TextFieldsIcon /> },
        { key: 'add-image', ariaLabel: 'add-image', onClick: handleAddImage, icon: <AddPhotoAlternateOutlined /> },
        { key: 'draw', ariaLabel: 'menu', onClick: handleDrawClick, icon: <Gesture /> },
        { key: 'edit-polygon', ariaLabel: 'menu', onClick: editPolygon, icon: <Gesture />, disabled: isDisabled() }
    ];

    return (
        <Toolbar variant="regular" sx={{display: 'flex', justifyContent: 'space-between', backgroundColor: 'background.default'}}>
            <Stack direction="row" spacing={0.5}>
                {iconButtonConfigs.map(({ key, ariaLabel, onClick, icon, disabled }) => (
                    <IconButton
                        key={key}
                        edge="start"
                        color="inherit"
                        aria-label={ariaLabel}
                        onClick={onClick}
                        disabled={disabled}
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
                            return item;
                        })}
                    </MenuList>
                </Menu>
            </Stack>
            <Typography>
                {projectSettings.projectName}
            </Typography>
            <Stack spacing={1} direction="row" sx={{display: 'flex', alignItems: 'center'}}>
                <Avatar alt="Avatar" />
                <Typography>
                    Creator Name
                </Typography>
            </Stack>
        </Toolbar>
    );
}
