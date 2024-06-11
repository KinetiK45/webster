import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import LineStyleIcon from '@mui/icons-material/LineStyle';
import Typography from '@mui/material/Typography';

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
    '& input[type=color]': {
        padding: 0,
        border: 'none',
        width: 36,
        height: 36,
        marginRight: '1px',
    },
    '& .colorSquare': {
        display: 'inline-block',
        width: 20,
        height: 20,
        border: '1px solid #999',
        borderRadius: 2,
        backgroundColor: ({ color }) => color,
        marginRight: '1px',
    },
}));

function EditorColorPicker({ value = '#000000', icon = <LineStyleIcon fontSize="small" />, postfixText = '', onChange }) {
    const [internalValue, setInternalValue] = useState(value);

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

    return (
        <CustomTextField
            type="color"
            margin="none"
            variant="outlined"
            size="small"
            value={internalValue}
            onChange={handleChange}
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
            }}
        />
    );
}

export default EditorColorPicker;
