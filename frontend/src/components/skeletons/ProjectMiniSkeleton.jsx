import React from 'react';
import { Container, Stack, Typography, Box, Avatar, Skeleton } from '@mui/material';

function ProjectMiniSkeleton({withCreator = false}) {
    return (
        <Container disableGutters>
            <Skeleton variant="rectangular" width="100%" height={200} />
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                {withCreator &&
                    <Skeleton variant="circular" width={45} height={40} />
                }
                <Stack direction="column" sx={{width: '100%'}}>
                    <Skeleton variant="text" width="60%" />
                    {withCreator && <Skeleton variant="text" width="40%" />}
                    <Skeleton variant="text" width="30%" />
                </Stack>
            </Stack>
        </Container>
    );
}

export default ProjectMiniSkeleton;
