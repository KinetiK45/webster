import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Box from "@mui/material/Box";

const ITEM_HEIGHT = 48;

function MenuOptions({options = []}) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Box sx={{mt: 1}}>
            <IconButton
                disabled={options.length === 0}
                aria-label="more"
                aria-controls={open ? 'long-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup="true"
                onClick={handleClick}
            >
                <MoreVertIcon />
            </IconButton>
            <Menu
                id="long-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                sx={{
                    textDecoration: 'none',
                    color: 'inherit'
                }}
            >
                {options.map((option) => option)}
            </Menu>
        </Box>
    );
}

export default MenuOptions;
