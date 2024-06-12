import {useContext, useState} from "react";
import {Stack} from "@mui/material";
import Requests from "../../api/Requests";
import {customAlert} from "../../utils/Utils";
import CustomImageDropzone from "../../components/inputs/CustomImageDropzone";
import {UserContext} from "../../RootLayout";
import CustomInputField from "../../components/inputs/CustomInputField";
import Container from "@mui/material/Container";
import {fullNameValidation} from "../../utils/InputHandlers";

function ProfileSettingsMode() {
    const {userData, setUserData} = useContext(UserContext);

    return (
        <Container direction="column" maxWidth="xl">
            <CustomImageDropzone
                imageLink={userData.avatar}
                alt={userData.full_name}
                onFileSelected={(file, renderedImage) => {
                    Requests.avatarUpload(file).then((resp) => {
                        if (resp.state === true) {
                            customAlert('Avatar changed', 'success');
                            setUserData({...userData, avatar: renderedImage});
                        } else
                            customAlert(resp?.message || 'Error uploading avatar', 'error');
                    });
                }}
            />
            <CustomInputField
                defaultValue={userData.full_name}
                onChangeChecked={(value) => {setUserData({...userData, full_name: value})}}
                label="Full name"
                type="text"
                handleInput={fullNameValidation}
            />
        </Container>
    )
}

export default ProfileSettingsMode;
