import {useContext, useEffect, useState} from "react";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import {useParams} from "react-router-dom";
import Requests from "../../api/Requests";
import Container from "@mui/material/Container";
import {Pagination, Stack} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import {UserContext} from "../../RootLayout";
import Button from "@mui/material/Button";
import {debounce} from "lodash";
import ProjectMini from "../../components/ProjectMini";

function Profile() {
    const {user_id} = useParams();
    const {userData} = useContext(UserContext);
    const [profileData, setProfileData] = useState(undefined);

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
        const resp = await Requests.getProjects(user_id, currentPage, PAGE_SIZE);
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
            const resp = await Requests.getProjects(user_id);
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
                <Avatar
                    src={profileData.avatar}
                    sx={{width: 200, height: 200}}
                    variant="rounded"
                >
                    {profileData.full_name}
                </Avatar>
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
            <Button variant="outlined" onClick={async () => {
                const newVar = await Requests.create_project('zaloopa proj 2');
                console.log(newVar);
            }}>Create project</Button>
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
                            {projects.map((project) => (
                                <ProjectMini projectData={project} />
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
