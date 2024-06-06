import React, {useContext} from "react";
import {Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import {EditorContext} from "../pages/editor/EditorContextProvider";

function Layer({ canvas, item, index, sameItemNumber }) {
    const projectSettings = useContext(EditorContext);

    function selectObject() {
        canvas.isDrawingMode = false;
        const object = canvas.getObjects()[index];
        console.log(object);
        canvas.setActiveObject(object);
        canvas.renderAll();
    }

    function deleteObject(event) {
        event.stopPropagation();
        if (canvas) {
            // console.log(canvas);
            const object = canvas.getObjects()[index];
            if (object) {
                console.log(object);
                if(object.withPoints){
                    canvas.remove(object.p1);
                    canvas.remove(object.p2);
                }
                canvas.remove(object);
            }
            // console.log(canvas);
        }
    }

    return <React.Fragment>
        <Stack direction="row"
               onClick={selectObject}
               sx={{
                   display: "flex", p: 1, justifyContent: "space-between",
                   backgroundColor: projectSettings.activeObjects.indexOf(item) === -1 ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)",
                   // border: '0.5px solid white'
               }}
        >
            <Typography sx={{m: "auto"}}>
                {item.type} {item.name ? item.name : sameItemNumber}
            </Typography>
            <IconButton
                onClick={deleteObject}
            >
                <DeleteIcon/>
            </IconButton>
        </Stack>
    </React.Fragment>;
}

export default Layer;
