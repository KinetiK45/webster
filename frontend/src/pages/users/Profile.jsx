import {useContext, useEffect, useState} from "react";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import {useParams} from "react-router-dom";
import Requests from "../../api/Requests";
import Container from "@mui/material/Container";
import {Divider, Pagination, Stack} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import {UserContext} from "../../RootLayout";
import Button from "@mui/material/Button";
import {debounce} from "lodash";
import ProjectMini from "../../components/ProjectMini";
import CustomImageDropzone from "../../components/inputs/CustomImageDropzone";
import {customAlert} from "../../utils/Utils";
import usePageName from "../../hooks/usePageName";

function Profile() {
    const {user_id} = useParams();
    const {userData, setUserData} = useContext(UserContext);
    const [profileData, setProfileData] = useState(undefined);
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
            setProjects(resp.data);
            setTotalPages(resp.totalPages);
            if (Number.parseInt(resp.currentPage) > Number.parseInt(resp.totalPages))
                setCurrentPage(1);
            else
                setCurrentPage(Number.parseInt(resp.currentPage));
        }
        setLoading(false);
    }, 1000);

    useEffect(() => {
        setLoading(true);
        debouncedFetchData();
        return debouncedFetchData.cancel;
    }, [currentPage]);


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

    useEffect(() => {
        const fetchData = async () => {
            const resp = await Requests.getUserProjects(user_id);
            if (resp.state === true) {
                setProjects(resp.data);
            } else {
                alert(resp.message || 'Error');
            }
        };
        fetchData();
    }, [user_id]);

    if (!profileData)
        return <CircularProgress/>

    return (
        <Container
            maxWidth={'sm'}
            sx={{
                backgroundColor: "background.default",
                padding: 2,
                borderRadius: 2,
                display: 'flex', flexDirection: 'column', gap: 2,
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)'
            }}
        >
            <Stack direction="row">
                {/*<Avatar*/}
                {/*    src={profileData.avatar}*/}
                {/*    sx={{width: 200, height: 200}}*/}
                {/*    variant="rounded"*/}
                {/*>*/}
                {/*    {profileData.full_name}*/}
                {/*</Avatar>*/}
                <CustomImageDropzone
                    imageLink={profileData.avatar}
                    alt={profileData.full_name}
                    onFileSelected={(file, renderedImage) => {
                        Requests.avatarUpload(file).then((resp) => {
                            if (resp.state === true) {
                                customAlert('Avatar changed', 'success');
                                setUserData({...userData, avatar: renderedImage});
                            } else
                                customAlert(resp?.message || 'Error uploading avatar', 'error');
                        });
                    }}/>
                <Stack direction="column" sx={{margin: 'auto', textAlign: 'center'}}>
                    <Typography variant="h3">
                        {profileData.full_name}
                    </Typography>
                    {profileData?.email &&
                        <Typography variant="caption">
                            {profileData.email}
                        </Typography>
                    }
                </Stack>
            </Stack>
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
                    (<CircularProgress/>)
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
        </Container>
    )
}

export default Profile;
