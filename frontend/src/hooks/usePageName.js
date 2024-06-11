import { useEffect } from 'react';

const usePageName = (pageName) => {
    useEffect(() => {
        document.title = pageName;
    }, [pageName]);
};

export default usePageName;