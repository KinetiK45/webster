import {useDropzone} from "react-dropzone";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import {useState} from "react";

function CustomImageDropzone({ imageLink = '', onFileSelected, alt= 'Drop logo here' }) {
    const [imageSrc, setImageSrc] = useState(imageLink);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (acceptedFiles) => {
            const validFiles = acceptedFiles.filter(file => {
                const allowedExtensions = ['jpeg', 'jpg', 'png'];
                const fileExtension = file.name.split('.').pop().toLowerCase();
                return allowedExtensions.includes(fileExtension);
            });

            if (validFiles.length > 0) {
                const file = acceptedFiles[0];
                const reader = new FileReader();
                reader.onload = () => {
                    setImageSrc(reader.result);
                    onFileSelected(file, reader.result);
                };
                reader.readAsDataURL(file);
            }
        }
    });

    return (
        <Box {...getRootProps()} sx={{ textAlign: 'center', mt: 2, border: '2px dashed',
            width: 'max-content',
            padding: '10px', borderRadius: '8px', cursor: 'copy'}}>
            <input {...getInputProps()} />
            <Avatar
                variant="rounded"
                src={imageSrc}
                sx={{ width: 150, height: 150 }}
            >
                {alt}
            </Avatar>
        </Box>
    );
}

export default CustomImageDropzone;
