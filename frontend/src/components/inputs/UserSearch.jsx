import {useEffect, useState} from "react";
import CustomSearch from "./CustomSearch";
import Requests from "../../api/Requests";
import {debounce} from "lodash";

export function UserSearch({handleIdSelect = (user_id) => {}}) {
    const [loading, setLoading] = useState(false);
    const [usersSearch, setUsersSearch] = useState('');
    const [usersSearchOptions, setUsersSearchOptions] = useState([]);

    const handleUsersSearchChange = (event, newValue) => {
        setUsersSearch(newValue);
    };

    function findForId() {
        const index = usersSearchOptions.findIndex(item => item.name === usersSearch);
        if (index !== -1) {
            const id = usersSearchOptions[index].id;
            handleIdSelect(id);
            return true;
        }
        return false;
    }

    async function searchUsers() {
        const resp = await Requests.findByUsername(usersSearch);
        if (resp.state === true && resp?.data?.length > 0){
            const nameIds = resp.data.map(({full_name, id}) => ({name:full_name, id}));
            findForId();
            setUsersSearchOptions(nameIds);
        }
    }

    const debouncedFetchData = debounce(async () => {
        setLoading(true);
        await searchUsers();
        setLoading(false);
    }, 1000);

    useEffect(() => {
        setUsersSearchOptions([]);
        if (!usersSearch || usersSearch.trim() === ''){
            handleIdSelect(undefined);
        }
        else if (!findForId()){
            setLoading(true);
            debouncedFetchData();
            return debouncedFetchData.cancel;
        }
    }, [usersSearch]);

    return (
        <>
            <CustomSearch
                value={usersSearch}
                options={usersSearchOptions.map(({name}) => name)}
                handleSearchChange={handleUsersSearchChange}
                label="Search for creator"
                loading={loading}
            />
        </>
    )
}
