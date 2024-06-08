import React, { useState, useEffect } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import LineStyleIcon from '@mui/icons-material/LineStyle';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from "@mui/material/Typography";
import Select from '@mui/material/Select';

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

function EditorSelector({ value = '', options = [], icon = <LineStyleIcon fontSize="small" />, postfixText = '', onChange }) {
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
            select
            value={internalValue}
            onChange={handleChange}
            margin="none"
            variant="outlined"
            size="small"
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
                style: {
                    textAlign: 'center',
                    width: 'auto',
                }
            }}
        >
            {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    {option.label}
                </MenuItem>
            ))}
        </CustomTextField>
    );
}

export default EditorSelector;
