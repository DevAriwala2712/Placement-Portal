import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const collectionKeys = {
    students: 'students',
    companies: 'companies',
    jobs: 'jobs',
    'placement-drives': 'placementDrives'
};

export default function useApiResource(resource, options = {}) {
    const [rows, setRows] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchRows = useCallback(async (params = {}) => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`${API_BASE_URL}/${resource}`, {
                params: { limit: options.limit || 25, ...params }
            });
            const key = collectionKeys[resource];
            setRows(response.data[key] || []);
            setPagination(response.data.pagination || {});
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to load records');
        } finally {
            setLoading(false);
        }
    }, [options.limit, resource]);

    useEffect(() => {
        fetchRows();
    }, [fetchRows]);

    return { rows, pagination, loading, error, fetchRows, setRows };
}
