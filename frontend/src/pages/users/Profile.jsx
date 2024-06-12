import {useContext, useEffect, useState} from "react";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import {useParams} from "react-router-dom";
import Requests from "../../api/Requests";
import Container from "@mui/material/Container";
import {Divider, LinearProgress, Pagination, Stack} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import {UserContext} from "../../RootLayout";
import Button from "@mui/material/Button";
import {debounce} from "lodash";
import ProjectMini from "../../components/ProjectMini";
import CustomImageDropzone from "../../components/inputs/CustomImageDropzone";
import {customAlert} from "../../utils/Utils";
import usePageName from "../../hooks/usePageName";
import ProfileSettingsMode from "./ProfileSettingsMode";
import ProfileReadMode from "./ProfileReadMode";
import Grid from "@mui/material/Grid";
import {CustomStack} from "../../components/styled/CustomStack";
import ProjectMiniSkeleton from "../../components/skeletons/ProjectMiniSkeleton";

function Profile() {
    const {user_id} = useParams();
    const {userData, setUserData} = useContext(UserContext);
    const [profileData, setProfileData] = useState(undefined);

    const [editMode, setEditMode] = useState(false);
    usePageName(profileData?.full_name || 'Profile');

    const [projects, setProjects] = useState([]);
    // pagenation
    const PAGE_SIZE = 10;
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };
    const debouncedFetchData = debounce(async () => {
        setLoading(true);
        const resp = await Requests.getUserProjects(user_id, currentPage, PAGE_SIZE);
        if (resp.state === true) {
            setTotalPages(resp.totalPages);
            setProjects(resp.data);
            const projects = resp.data;
            const currentPageParsed = Number.parseInt(resp.currentPage || 1);
            const totalPagesParsed = Number.parseInt(resp.totalPages || 1);
            if (currentPageParsed > totalPagesParsed)
                setCurrentPage(1);
            setProjects(projects);
        }
        else
            customAlert(resp.message || 'Error');
        setLoading(false);
    }, 1000);

    useEffect(() => {
        debouncedFetchData();
        return debouncedFetchData.cancel;
    }, [user_id, currentPage]);


    useEffect(() => {
        const fetchData = async () => {
            if (user_id === 'me') {
                setProfileData(userData);
                return;
            }
            const resp = await Requests.user_by_id(user_id);
            // alert(JSON.stringify(resp));
            if (resp.state === true) {
                // resp.data.avatar = Requests.get_avatar_link(resp.data.id);
                setProfileData(resp.data);
            } else {
                alert(resp.message || 'Error');
            }
        };
        fetchData();
    }, [user_id, userData]);

    if (!profileData)
        return <CircularProgress/>

    return (
        <>
            <Grid container spacing={1} sx={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center', overflowX: 'scroll'
            }}>
                <Grid item xs={12} md={4} >
                    <Container
                        sx={{
                            backgroundColor: "background.default",
                            padding: 2,
                            borderRadius: 2,
                            display: 'flex', flexDirection: 'column', gap: 2,
                            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)'
                        }}
                    >
                        {editMode ? (
                            <ProfileSettingsMode />
                        ) : (
                            <ProfileReadMode profileData={profileData} />
                        )}
                        {profileData.id === userData.id &&
                            <Button onClick={() => setEditMode(!editMode)}>Settings</Button>
                        }
                    </Container>
                </Grid>
                <Grid item xs={12} md={5}>
                    <CustomStack
                        sx={{
                            backgroundColor: "background.default",
                            padding: 2,
                            borderRadius: 2,
                            height: `calc(100vh - ${64}px)`,
                            maxWidth: 600,
                            overflowX: 'hidden', overflowY: 'scroll',
                            display: 'flex', flexDirection: 'column', gap: 2
                        }}
                    >
                        <Typography variant="h2">Projects</Typography>
                        <Divider sx={{margin: '1px'}} />
                        {totalPages > 1 &&
                            <Pagination
                                size="small"
                                count={totalPages}
                                page={currentPage}
                                onChange={handlePageChange}
                                color="primary"
                            />
                        }
                        {
                            loading ?
                                (
                                    Array.from({ length: PAGE_SIZE }).map((_, index) => (
                                        <>
                                            {index !== 0 && <Divider />}
                                            <ProjectMiniSkeleton />
                                        </>
                                    ))
                                )
                                : (
                                    <>
                                        {projects.map((project, index) => (
                                            <>
                                                {index !== 0 && <Divider />}
                                                <ProjectMini projectData={project}/>
                                            </>
                                        ))}
                                        {projects.length === 0 &&
                                            <Typography>No projects here</Typography>
                                        }
                                    </>
                                )
                        }
                    </CustomStack>
                </Grid>
            </Grid>
        </>
    )
}

export default Profile;
