export const usernameValidation = (inputValue) => {
    let isError = false;
    let helperText = '';

    if (inputValue.length < 3) {
        isError = true;
        helperText = 'Username should be at least 3 characters long';
    }
    if (!/^[a-zA-Z0-9]+$/.test(inputValue)) {
        isError = true;
        helperText = 'Username should contain only English letters and numbers';
    }

    return {
        input: inputValue,
        error: isError,
        helper: helperText,
    };
}
export const passwordValidation = (inputValue) => {
    let isError = false;
    let helperText = '';

    if (inputValue.length < 6) {
        isError = true;
        helperText = 'Password should be at least 6 characters long';
    }
    else if (!/^[a-zA-Z0-9]+$/.test(inputValue)) {
        isError = true;
        helperText = 'Password should contain only English letters and numbers';
    }

    return {
        input: inputValue,
        error: isError,
        helper: helperText,
    }
}
export const emailValidation = (inputValue) => {
    let isError = false;
    let helperText = '';

    if (!/\S+@\S+\.\S+/.test(inputValue)) {
        isError = true;
        helperText = 'Please enter a valid email address';
    }

    return {
        input: inputValue,
        error: isError,
        helper: helperText,
    }
}
export const fullNameValidation = (inputValue) => {
    let isError = false;
    let helperText = '';

    if (inputValue.length < 1) {
        isError = true;
        helperText = 'Please enter your real name';
    }

    return {
        input: inputValue,
        error: isError,
        helper: helperText,
    }
}
