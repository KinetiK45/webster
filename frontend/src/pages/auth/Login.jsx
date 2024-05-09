import {Link} from 'react-router-dom';
import {useState} from "react";
import Button from "@mui/material/Button";
import Requests from "../../api/Requests";
import {passwordValidation, usernameValidation} from "../../utils/InputHandlers";
import CustomInputField from "../../components/inputs/CustomInputField";
import {enqueueSnackbar} from "notistack";
import Container from "@mui/material/Container";

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    async function checkEntities() {
        if (username === '' || password === '') {
            enqueueSnackbar('Fill all fields correctly', { variant: 'warning', anchorOrigin: {horizontal: "right", vertical: 'bottom'} });
            return;
        }
        try {
            const resp = await Requests.login(username, password);
            if (resp.state === true){
                enqueueSnackbar('Success', { variant: 'success', anchorOrigin: {horizontal: "right", vertical: 'bottom'} });
                localStorage.setItem('user_id', resp.data.user_id);
                window.location.href = '/users/me';
            }
            else {
                enqueueSnackbar(resp?.message || 'Error', { variant: 'error', anchorOrigin: {horizontal: "right", vertical: 'bottom'} });
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
            <h1>Login</h1>
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
            <div>
                <p>Don't have an account? <Link to='/auth/registration' style={{ textDecoration: 'none', color: 'inherit' }}>Register</Link></p>
                <p>Forgot your password? <Link to={"/auth/password-recovery"} style={{ textDecoration: 'none', color: 'inherit' }}>Recovery</Link></p>
            </div>
            <Button variant="contained"
                    onClick={checkEntities}
            >Login</Button>
        </Container>
    )
}

export default Login;
