import React, { useState, useEffect, useRef } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import LineStyleIcon from '@mui/icons-material/LineStyle';
import Typography from "@mui/material/Typography";

const CustomTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            border: 'none',
        },
        '&:hover fieldset': {
            border: `1px solid ${theme.palette.primary.main}`,
        },
        '&.Mui-focused fieldset': {
            border: `1px solid ${theme.palette.primary.main}`,
        },
    },
}));

function EditorTextInput({ value = '',
                             icon = <LineStyleIcon fontSize="small" />,
                             postfixText = '',
                             onChange, onBlur }) {
    const [internalValue, setInternalValue] = useState(value);
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            const length = internalValue.length;
            inputRef.current.style.width = `${length + 1}ch`;
        }
    }, [internalValue]);

    useEffect(() => {
        setInternalValue(value);
    }, [value]);

    const handleChange = (event) => {
        const newValue = event.target.value;
        setInternalValue(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    const handleBlur = () => {
        if (internalValue.trim() === '') {
            setInternalValue(value);
        }
        if (onBlur)
            onBlur();
    };

    return (
        <CustomTextField
            type="text"
            margin="none"
            variant="outlined"
            size="small"
            value={internalValue}
            onChange={handleChange}
            onBlur={handleBlur}
            inputRef={inputRef}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        {icon}
                    </InputAdornment>
                ),
                endAdornment: postfixText && (
                    <InputAdornment position="end">
                        <Typography variant="overline">{postfixText}</Typography>
                    </InputAdornment>
                ),
                inputProps: {
                    style: {
                        textAlign: 'center',
                        width: 'auto',
                    }
                }
            }}
        />
    );
}

export default EditorTextInput;
