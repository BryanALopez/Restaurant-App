import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { createReservation, listReservationsByID, updateReservation } from '../utils/api';
import { formatAsDate, formatAsTime, today } from '../utils/date-time';
import ErrorAlert from '../layout/ErrorAlert';

function FormComponent({ what = 'new' }) {
  const { reservation_id } = useParams();
  const initialFormState = {
    first_name: 'First Name',
    last_name: 'Last Name',
    mobile_number: 'Mobile Number',
    reservation_date: formatAsDate(today()),
    reservation_time: formatAsTime(new Date().toTimeString()),
    people: 1,
  };

  const history = useHistory();
  const [formData, setFormData] = useState({ ...initialFormState });
  const [error, setError] = useState('');

  function loadReservation() {
    const abortController = new AbortController();
    setError(null);
    if (what === "edit") {
      listReservationsByID(reservation_id, abortController.signal)
        .then(setFormData)
        .catch(setError);
    }
    return () => abortController.abort();
  }
  useEffect(loadReservation, [reservation_id, what]);

  const handleChange = ({ target }) => {
    setFormData({
      ...formData,
      [target.name]: target.value,
    });
  };

  const isEditable = (formData.status === "booked");
  const handleCancel = () => history.go(-1);
  const handleSubmit = async (event) => {
    event.preventDefault();

    const abortController = new AbortController();
    const newReservation = formData;
    newReservation.people = parseInt(formData.people, 10);
    if (what === "new") {
      newReservation.status = "booked";
      createReservation(newReservation, abortController.signal)
        .then(rsp => history.push(`/dashboard?date=${formData.reservation_date}`))
        .catch(err => setError(err));
    } else if(isEditable) {
      updateReservation(newReservation, abortController.signal)
        .then(() => { history.go(-1); })
        .catch(err => setError(err));
    }
  };

  return (
    <div>
      <form>
        <input name="first_name" onChange={handleChange} value={formData.first_name} readOnly={!isEditable} required />
        <input name="last_name" onChange={handleChange} value={formData.last_name} readOnly={!isEditable} required />
        <input name="mobile_number" onChange={handleChange} value={formData.mobile_number} type='tel' readOnly={!isEditable} required />
        <input
          type="date"
          name="reservation_date"
          onChange={handleChange}
          value={formData.reservation_date}
          placeholder='YYYY-MM-DD'
          pattern='\d{4}-\d{2}-\d{2}'
          readOnly={!isEditable} 
          required />
        <input
          type="time"
          name="reservation_time"
          onChange={handleChange}
          value={formData.reservation_time}
          placeholder='HH-MM'
          pattern='[0-9]{2}:[0-9]{2}'
          readOnly={!isEditable} 
          required />
        <input name="people" onChange={handleChange} value={formData.people} type='number' min='1' readOnly={!isEditable} required />
        <button type="button" onClick={handleSubmit}>Submit</button>
        <button type="button" onClick={handleCancel}>Cancel</button>
      </form>
      <ErrorAlert error={error} />
    </div>
  );
}

export default FormComponent;