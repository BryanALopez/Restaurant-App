import React, { useEffect, useState } from "react";
import { listTables, reserveTable } from "../utils/api";
import { useParams, useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";

function Seat() {
    const { reservation_id } = useParams();
    const [tables, setTables] = useState([]);
    const history = useHistory();
    const [error, setError] = useState('');

    function loadTables() {
        const abortController = new AbortController();
        setError(null);
        listTables(abortController.signal)
            .then(setTables)
            .catch(setError);
        return () => abortController.abort();
    }
    useEffect(loadTables, []);

    var e = document.getElementsByName("table_id")[0];
    const handleSubmit = async (event) => {
        event.preventDefault();

        const abortController = new AbortController();
        reserveTable(e.options[e.selectedIndex].value, reservation_id, abortController.signal)
            .then(() => history.push(`/dashboard`))
            .catch(setError);
    };
    const handleCancel = () => history.go(-1);

    const tablesList = tables.map((table, index) =>
        <option key={index} value={table.table_id}>{table.table_name} - {table.capacity}</option>
    );

    return (
        <div>
            <select name="table_id">
                {tablesList}
            </select>
            <button type="button" onClick={handleSubmit}>Submit</button>
            <button type="button" onClick={handleCancel}>Cancel</button>
            <ErrorAlert error={error} />
        </div>
    );
}

export default Seat;