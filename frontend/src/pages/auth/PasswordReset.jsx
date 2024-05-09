import {Link, useParams} from 'react-router-dom';
import {useState} from "react";
import Button from "@mui/material/Button";
import Requests from "../../api/Requests";
import CustomInputField from "../../components/inputs/CustomInputField";
import {passwordValidation} from "../../utils/InputHandlers";
import {enqueueSnackbar} from "notistack";
import Container from "@mui/material/Container";

function PasswordRecovery() {
    const { token } = useParams();

    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [status, setStatus] = useState(false);

    async function checkEntities() {
        if (password === '' || passwordConfirm === '') {
            enqueueSnackbar('Fill all fields correctly', { variant: 'warning', anchorOrigin: {horizontal: "right", vertical: 'bottom'} });
            setIsButtonDisabled(false);
            return;
        }
        try {
            const resp = await Requests.passwordResetConfirm(token, password);
            if (resp.state === true){
                setStatus(true);
                enqueueSnackbar('Password was successfully changed', { variant: 'success', anchorOrigin: {horizontal: "right", vertical: 'bottom'} });
            }
            else {
                enqueueSnackbar(resp?.message || 'Error', { variant: 'error', anchorOrigin: {horizontal: "right", vertical: 'bottom'} });
                setIsButtonDisabled(false);
            }
        } catch (e) {
            enqueueSnackbar(e.message, { variant: 'error', anchorOrigin: {horizontal: "right", vertical: 'bottom'} });
        }
    }

    return (
        <Container maxWidth="sm" sx={{
            backgroundColor: "background.default",
            padding: 2,
            borderRadius: 2,
            display: 'flex', flexDirection: 'column', gap: 2,
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)'
        }}>
            <h1>{status ? 'You can close this page' : 'Enter new password'}</h1>
            {!status &&
                <>
                    <CustomInputField
                        handleInput={passwordValidation}
                        onChangeChecked={(key, value) => setPassword(value)}
                        id="password"
                        label="Password"
                        type="password"
                    />
                    <CustomInputField
                        handleInput={passwordValidation}
                        onChangeChecked={(key, value) => setPasswordConfirm(value)}
                        id="passwordConfirm"
                        label="Password confirm"
                        type="password"
                    />
                    <Button
                        variant="contained"
                        disabled={isButtonDisabled}
                        onClick={() => {
                            setIsButtonDisabled(true);
                            checkEntities();
                        }}
                    >Change password</Button>
                </>
            }
            {status &&
                <div>
                    <p><Link to="/auth/login" style={{ textDecoration: 'none', color: 'inherit' }}>To login page</Link></p>
                </div>
            }
        </Container>
    )
}

export default PasswordRecovery;
