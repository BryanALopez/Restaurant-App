import React, { useState } from 'react';
import { useHistory } from "react-router-dom";
import { freeTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function ListItem({ table }) {
    const history = useHistory();
    const [error, setError] = useState('');

    const handleFinish = async event => {
        event.preventDefault();

        if (window.confirm('Is this table ready to seat new guests? This cannot be undone.')) {
            const abortController = new AbortController();
            freeTable(table.table_id, abortController.signal)
                .then(() => { history.go(0); }) // refresh
                .catch(err => setError(err));
        }

    };

    return (
        <tr>
            <td>{table.table_name}</td>
            <td>{table.capacity}</td>
            <td>
                <span data-table-id-status={`${table.table_id}`}>
                    Status: {table.is_seated ? 'occupied' : 'free'}
                </span>
            </td>
            <td>
                <button type='button' data-table-id-finish={table.table_id} onClick={handleFinish}>Finish</button>
            </td>
            <td>
                <ErrorAlert error={error} />
            </td>
        </tr>
    );
}

export default ListItem;