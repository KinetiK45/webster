import {Link} from 'react-router-dom';
import {useState} from "react";
import Button from "@mui/material/Button";
import Requests from "../../api/Requests";
import {passwordValidation, usernameValidation} from "../../utils/InputHandlers";
import CustomInputField from "../../components/inputs/CustomInputField";
import {enqueueSnackbar} from "notistack";
import Container from "@mui/material/Container";
import {customAlert} from "../../utils/Utils";

function Login() {

    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmationCode, setConfirmationCode] = useState('');

    async function firstStepCheck() {
        if (username === '' || password === '') {
            customAlert('Fill all fields correctly', 'warning');
            return;
        }
        try {
            const resp = await Requests.login(username, password);
            if (resp.state === true){
                setStep(2);
                customAlert('Success', 'success');
                localStorage.setItem('user_id', resp.data.user_id);
            }
            else {
                customAlert(resp?.message || 'Error', 'error');
            }
        } catch (e) {
            customAlert(e.message, 'error');
        }
    }

    async function secondStepCheck() {
        if (confirmationCode === '') {
            customAlert('Fill all fields correctly', 'warning');
            return;
        }
        try {
            const resp = await Requests.loginConfirm(Number.parseInt(confirmationCode));
            if (resp.state === true){
                customAlert('Success', 'success');
                window.location.href = '/users/me';
            }
            else {
                customAlert(resp?.message || 'Error', 'error');
            }
        } catch (e) {
            customAlert(e.message, 'error');
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
            <h1>Login</h1>
            {step === 1 &&
                <>
                    <CustomInputField
                        handleInput={usernameValidation}
                        onChangeChecked={(value) => setUsername(value)}
                        id="username"
                        label="Username"
                        type="text"
                    />
                    <CustomInputField
                        handleInput={passwordValidation}
                        onChangeChecked={(value) => setPassword(value)}
                        id="password"
                        label="Password"
                        type="password"
                    />
                </>
            }
            {step === 2 &&
                <CustomInputField
                    // handleInput={passwordValidation}
                    onChangeChecked={(value) => setConfirmationCode(value)}
                    id="confirmationCode"
                    label="Confirmation code"
                    type="text"
                />
            }
            <div>
                <p>Don't have an account? <Link to='/auth/registration' style={{ textDecoration: 'none', color: 'inherit' }}>Register</Link></p>
                <p>Forgot your password? <Link to={"/auth/password-recovery"} style={{ textDecoration: 'none', color: 'inherit' }}>Recovery</Link></p>
            </div>
            {step === 1 &&
                <Button variant="contained"
                        onClick={firstStepCheck}
                >Login</Button>
            }
            {step === 2 &&
                <Button variant="contained"
                        onClick={secondStepCheck}
                >Confirm login</Button>
            }
        </Container>
    )
}

export default Login;
