import { styled } from "@mui/material/styles";
import { Stack } from "@mui/material";

export const CustomStack = styled(Stack)(({ theme }) => ({
    position: 'relative',  // Позволяет дочерним элементам использовать абсолютное позиционирование

    '&::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
        position: 'absolute',  // Абсолютное позиционирование полосы прокрутки
    },
    '&::-webkit-scrollbar-track': {
        background: theme.palette.background.default,
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: theme.palette.primary.main,
        borderRadius: '10px',
        border: `2px solid ${theme.palette.background.default}`,
    },
    '&::-webkit-scrollbar-thumb:hover': {
        backgroundColor: theme.palette.primary.dark,
    },

    // Обеспечивает, что содержимое не будет сдвигаться полосой прокрутки
    '&::-webkit-scrollbar-corner': {
        background: 'transparent',
    }
}));
