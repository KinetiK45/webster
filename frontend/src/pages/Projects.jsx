import {useEffect, useState} from "react";
import {debounce} from "lodash";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Pagination from "@mui/material/Pagination";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import {Skeleton} from "@mui/material";
import Requests from "../api/Requests";
import CustomInputField from "../components/inputs/CustomInputField";
import CustomSearch from "../components/inputs/CustomSearch";
import ProjectMini from "../components/ProjectMini";
import usePageName from "../hooks/usePageName";
import {CustomStack} from "../components/styled/CustomStack";

function Projects() {
    usePageName('Projects');
    const [projects, setProjects] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [searchValue, setSearchValue] = useState('');
    const [searchOptions, setSearchOptions] = useState([]);
    const ONE_PAGE_LIMIT = 20;
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const debouncedFetchData = debounce(async () => {
        setLoading(true);
        const data = {
            limit: ONE_PAGE_LIMIT,
            searchValue: searchValue,
            page: 1
        }
        if (searchValue === null || searchValue.trim() === '') {
            data.page = page;
        }
        if (new Date(dateFrom).toString() !== 'Invalid Date')
            data.dateFrom = new Date(dateFrom).toISOString()
        if (new Date(dateTo).toString() !== 'Invalid Date')
            data.dateTo = new Date(dateTo).toISOString()

        const resp = await Requests.getProjects(data);
        if (resp.state === true) {
            setProjects(resp.data);
            setTotalPages(resp.totalPages);
            setSearchOptions([...new Set(resp.data.map(project => project.project_name))]);
            if (page > totalPages)
                setPage(1);
        }
        setLoading(false);
        setSearchLoading(false);
    }, 1000);

    useEffect(() => {
        setLoading(true);
        debouncedFetchData();
        return debouncedFetchData.cancel;
    }, [page, searchValue, dateFrom, dateTo]);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleSearchChange = (event, newValue) => {
        setSearchValue(newValue);
        setSearchLoading(true);
    };

    return (
        <Grid container spacing={1}>
            <Grid item xs={12} md={2}>
                <Container sx={{
                    backgroundColor: "background.default",
                    padding: 2,
                    borderRadius: 2,
                    display: 'flex', flexDirection: 'column', gap: 2,
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)'
                }}>
                    <Stack direction="column" gap={2}>
                        <CustomInputField
                            onChangeChecked={(key, value) => setDateFrom(value)}
                            id="eventDateFrom"
                            label="Date from"
                            type="datetime-local"
                            InputLabelProps={{ shrink: true }}
                        />
                        <CustomInputField
                            onChangeChecked={(key, value) => setDateTo(value)}
                            id="eventDateTo"
                            label="Date to"
                            type="datetime-local"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Stack>
                    {totalPages > 1 &&
                        <Container maxWidth="sm" sx={{
                            backgroundColor: "background.default",
                            padding: 2,
                            borderRadius: 2,
                            display: 'flex', flexDirection: 'column', gap: 2
                        }}>
                            <Stack direction="row" spacing={2} justifyContent="center">
                                <Pagination
                                    size="small"
                                    count={totalPages}
                                    page={page}
                                    onChange={handlePageChange}
                                    color="primary"
                                />
                            </Stack>
                        </Container>
                    }
                </Container>
            </Grid>
            <Grid item xs={12} md={10}>
                <CustomStack
                    sx={{
                        backgroundColor: "background.default",
                        padding: 2,
                        borderRadius: 2,
                        height: `calc(100vh - ${64}px)`, overflowX: 'hidden', overflowY: 'scroll',
                        display: 'flex', flexDirection: 'column', gap: 2
                    }}
                >
                    <Container sx={{ display: 'flex' }} disableGutters>
                        <CustomSearch value={searchValue} options={searchOptions} handleSearchChange={handleSearchChange} />
                    </Container>
                    <Grid container spacing={1}>
                        {loading ? (
                            Array.from({ length: ONE_PAGE_LIMIT }).map((_, index) => (
                                <Grid item xs={12} sm={6} md={4} lg={3}>
                                    <Skeleton width={200} height={100} />
                                </Grid>
                            ))
                        ) : (
                            <>
                                {projects.length === 0 &&
                                    <Typography>No projects found</Typography>
                                }
                                {projects.map((event, index) => (
                                    <Grid item xs={12} sm={6} md={4} lg={3}>
                                        <ProjectMini projectData={event} key={event.id} />
                                    </Grid>
                                ))}
                            </>
                        )}
                    </Grid>
                </CustomStack>
                {/*<Container sx={{*/}
                {/*    backgroundColor: "background.default",*/}
                {/*    padding: 2,*/}
                {/*    borderRadius: 2,*/}
                {/*    height: `calc(100vh - ${64}px)`, overflowX: 'hidden', overflowY: 'scroll',*/}
                {/*    display: 'flex', flexDirection: 'column', gap: 2*/}
                {/*}}>*/}
                {/*    */}
                {/*</Container>*/}
            </Grid>
        </Grid>
    )
}

export default Projects;
