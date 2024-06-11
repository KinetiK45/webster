import SearchIcon from "@mui/icons-material/Search";
import {Autocomplete, CircularProgress, TextField} from "@mui/material";

function CustomSearch({ value, options = [], handleSearchChange, label = 'Search', loading = false }) {
    return (
        <Autocomplete
            sx={{ width: '100%' }}
            filterOptions={(x) => x}
            options={options}
            value={value}
            freeSolo
            loading={loading}
            onInputChange={(event, newInputValue) => {
                handleSearchChange(event, newInputValue); // Вызываем функцию handleSearchChange
            }}
            onChange={(event, newValue) => {
                handleSearchChange(event, newValue); // Вызываем функцию handleSearchChange при выборе значения
            }}
            renderInput={
                (props) => (
                    <TextField
                        {...props}
                        label={label}
                        variant="outlined"
                        InputProps={{
                            ...props.InputProps,
                            startAdornment: (
                                <>
                                    {loading ? <CircularProgress size={24} /> : <SearchIcon />}
                                    {props.InputProps.startAdornment}
                                </>
                            )
                        }}
                    />
                )
            }
        />
    )
}

export default CustomSearch;
