import React, { useState, useEffect, useRef } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import LineStyleIcon from '@mui/icons-material/LineStyle';
import Typography from "@mui/material/Typography";
import {formatDouble} from "../../utils/Utils";

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
    '& input[type=number]': {
        '-moz-appearance': 'textfield',
        '-webkit-appearance': 'none',
        margin: 0,
    },
    '& input[type=number]::-webkit-outer-spin-button': {
        '-webkit-appearance': 'none',
        margin: 0,
    },
    '& input[type=number]::-webkit-inner-spin-button': {
        '-webkit-appearance': 'none',
        margin: 0,
    },
}));

function EditorNumberInput({ value = 0, min = 0, max = 999, step = 1,
                               icon = <LineStyleIcon fontSize="small" />,
                               postfixText = '',
                               onChange }) {
    const [internalValue, setInternalValue] = useState(value);
    const [prevValue, setPrevValue] = useState(value);
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            const length = internalValue.toString().length;
            inputRef.current.style.width = `${length + 1}ch`;
        }
    }, [internalValue]);

    useEffect(() => {
        setInternalValue(value);
    }, [value]);

    const handleChange = (event) => {
        let newValue = event?.target?.value;
        if (newValue !== undefined) {
            if (newValue.trim() === '')
                newValue = '0';
            const number = Number.parseFloat(newValue);
            setInternalValue(formatDouble(number));
            if (onChange) {
                onChange(number);
            }
        }
    };

    const handleBlur = () => {
        if (internalValue === '' || isNaN(internalValue)) {
            setInternalValue(prevValue);
        } else {
            setPrevValue(internalValue);
        }
    };

    return (
        <CustomTextField
            type="number"
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
                    min: min,
                    max: max,
                    step: step,
                    style: {
                        textAlign: 'center',
                        width: 'auto',
                    }
                }
            }}
        />
    );
}

export default EditorNumberInput;
