import React, { useEffect, useState } from "react";
import { listReservations, listTables } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { today, next, previous } from "../utils/date-time";
import useQuery from "../utils/useQuery";
import { Link } from 'react-router-dom';
import ReservationsListItem from "../reservations/ListItem";
import TablesListItem from "../tables/ListItem";

/**
 * Defines the dashboard page.
 * @returns {JSX.Element}
 */
function Dashboard() {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [error, setError] = useState('');
  let date = useQuery().get("date");
  if (!date) date = today();

  function loadDashboard() {
    const abortController = new AbortController();
    setError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setError);
    return () => abortController.abort();
  }
  useEffect(loadDashboard, [date]);

  function loadTables() {
    const abortController = new AbortController();
    setError(null);
    listTables(abortController.signal)
      .then(setTables)
      .catch(setError);
    return () => abortController.abort();
  }
  useEffect(loadTables, []);

  const reservationsList = reservations.map(
    (reservation, index) => <tr key={`${index}`}><ReservationsListItem reservation={reservation} /></tr>
  );
  const tablesList = tables.map(
    (table, index) => <TablesListItem key={`${index}`} table={table} />
  );

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for date {date}</h4>
        <Link to={`/dashboard?date=${next(date)}`}>Next</Link>
        <Link to={`/dashboard?date=${previous(date)}`}>Previous</Link>
        <Link to={`/dashboard?date=${today()}`}>Today</Link>
      </div>
      <table>
        <tbody>
          {reservationsList}
          {tablesList}
        </tbody>
      </table>
      <ErrorAlert error={error} />
    </main>
  );
}

export default Dashboard;
