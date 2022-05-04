const reservationsService = require('./reservations.service');
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');
const setError = require('../errors/setError');
const hasProperties = require('../errors/hasProperties');

// Validation functions
function hasData(req, res, next) {
  // console.log(req.body);
  if (req.body && req.body.data) next();
  else setError(400, "Data is missing", next);
}

const hasRequiredProperties = hasProperties(
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people"
);

function validateDate(req, res, next) {
  if (Date.parse(req.body.data.reservation_date)) next();
  else setError(400, "reservation_date is not valid", next);
}

function validateTime(req, res, next) {
  // if(Time.parse(req.body.data.reservation_time)) next();
  // if(moment(req.body.data.reservation_time, 'HH:mm', true).isValid()) next();
  if (/^0[0-9]|1[0-9]|2[0-3]:[0-5][0-9] to 0[0-9]|1[0-9]|2[0-3]:[0-5][0-9]$/.test(req.body.data.reservation_time)) next();
  else setError(400, "reservation_time is not valid", next);
}

function validatePeople(req, res, next) {
  if (Number.isInteger(req.body.data.people) && (req.body.data.people > 0)) next();
  else setError(400, "people must be a positive integer", next);
}

function validateStatus(validStatus) {
  return (req, res, next) => {
    if (!req.body.data.status || validStatus.includes(req.body.data.status)) next();
    else setError(400, `Bad status=${req.body.data.status} for request`, next);
  }
}

function dateIsNotTuesday(req, res, next) {
  const date = new Date(req.body.data.reservation_date + 'T' + req.body.data.reservation_time);
  if (date.getUTCDay() !== 2) {
    res.locals.date = date;
    next();
  } else setError(400, "We're closed on Tuesdays", next);
}

function dateIsInFuture(req, res, next) {
  if (res.locals.date > (new Date)) next();
  else setError(400, "reservation_date must be in the future", next);
}

function isWithinBusinessHours(req, res, next) {
  if ((req.body.data.reservation_time >= '10:30') && (req.body.data.reservation_time <= '21:30')) {
    res.locals.reservation = req.body.data;
    next();
  } else setError(400, "reservation_time must be within business hours", next);
}

function validateListQuery(req, res, next) {
  if (req.query.date) {
    res.locals.date = req.query.date;
    next();
  } else if (req.params.reservation_id) {
    res.locals.reservation_id = req.params.reservation_id;
    next();
  } else if (req.query.mobile_number) {
    res.locals.mobile_number = req.query.mobile_number;
    next();
  } else setError(400, "Bad List Query", next);
}

function reservationExists(req, res, next) {
  reservationsService
    .listByID(req.params.reservation_id)
    .then(data => {
      if (data) {
        res.locals.reservation = data;
        next();
      } else setError(404, `reservation_id=${req.params.reservation_id} does not exist`, next);
    })
}
/*
function validateReservationStatus(req, res, next) {
  if ((req.body.data.status === "booked") || (req.body.data.status === "seated") || (req.body.data.status === "finished")) next();
  else setError(400, `cannot update reservation status to ${req.body.data.status}`, next);
}*/

function reservationIsFinished(req, res, next) {
  if (res.locals.reservation.status !== "finished") next();
  else setError(400, `cannot update reservation with status=${res.locals.reservation.status}`, next);
}

/**
 * List handler for reservation resources
 */
async function list(req, res, next) {
  if (res.locals.date) return reservationsService.listByDate(res.locals.date)
  else if (res.locals.mobile_number) return reservationsService.listByNumber(res.locals.mobile_number)
  else return reservationsService.listByID(res.locals.reservation_id)
    .then(data => data ? data : Promise.reject({ status: 404, message: `reservation_id=${res.locals.reservation_id} does not exist` }));
}

/**
 * Create handler for reservation resources
 */
async function create(req, res, next) {
  return reservationsService
    .create(res.locals.reservation)
    .then(rsp => {
      ({ reservation_id, created_at, updated_at, ...data } = rsp);
      return data;
    })
}

/**
 * Update handler for reservation resources
 */
async function updateStatus(req, res, next) {
  res.locals.reservation.status = req.body.data.status;
  return reservationsService
    .update(res.locals.reservation)
    .then(rsp => ({status: rsp.status}));
}

/**
 * Update handler for reservation resources
 */
async function update(req, res, next) {
  return reservationsService
    .update(res.locals.reservation)
    .then(rsp => {
      ({ status, reservation_id, created_at, updated_at, ...data } = rsp);
      return data;
    })
}

module.exports = {
  list: [
    validateListQuery,
    asyncErrorBoundary(list),
  ],
  create: [
    hasData,
    hasRequiredProperties,
    validateDate,
    validateTime,
    validatePeople,
    validateStatus(["booked"]),
    dateIsNotTuesday,
    dateIsInFuture,
    isWithinBusinessHours,
    asyncErrorBoundary(create, 201)
  ],
  updateStatus: [
    reservationExists,
    validateStatus(["booked", "seated", "finished", "cancelled"]),
    reservationIsFinished,
    asyncErrorBoundary(updateStatus, 200)
  ],
  update: [
    hasData,
    reservationExists,
    hasRequiredProperties,
    validateDate,
    validateTime,
    validatePeople,
    dateIsNotTuesday,
    dateIsInFuture,
    isWithinBusinessHours,
    asyncErrorBoundary(update, 200)
  ],
};
