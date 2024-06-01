import {createTheme} from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: '#F2ECFF', // Основной цвет
        },
        // secondary: {
        //     main: '#1f1d1e', // Вторичный цвет
        // },
        // text: {
        //     primary: '#F2ECFF',
        //     disabled: '#F2ECFF',
        //     // secondary: '#08f500',
        // },
        // background: {
        //     default: '#1F2833',
        // },
    },
});

export default theme;
