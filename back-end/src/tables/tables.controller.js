const tablesService = require('./tables.service');
const reservationsService = require('../reservations/reservations.service');
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');
const setError = require('../errors/setError');
const hasProperties = require('../errors/hasProperties');

// Debug info
function printDebug(req, res, next) {
  // console.log(req);
  next();
}

// Validation functions
function hasData(req, res, next) {
  // console.log(req.body);
  if (req.body && req.body.data) next();
  else setError(400, "Data is missing", next);
}

const hasRequiredProperties = hasProperties(
  "table_name",
  "capacity",
);

function validateName(req, res, next) {
  if (req.body.data.table_name.length > 1) next();
  else setError(400, "table_name must be at least 2 characters long", next);
}

function validateCapacity(req, res, next) {
  if (Number.isInteger(req.body.data.capacity) && (req.body.data.capacity > 0)) next();
  else setError(400, "capacity must be a positive integer", next);
}

function reservationExists(req, res, next) {
  reservationsService
    .listByID(req.body.data.reservation_id)
    .then(data => {
      if (data) {
        res.locals.reservation = data;
        next();
      } else setError(404, `reservation_id=${req.body.data.reservation_id} does not exist`, next);
    })
}

function validateReservationStatus(req, res, next) {
  if (res.locals.reservation.status === "booked") next();
  else setError(400, `cannot update reservation with status=${res.locals.reservation.status}`, next);
}

function tableExists(req, res, next) {
  tablesService
    .listTable(req.params.table_id)
    .then(data => {
      if (data) {
        res.locals.table = data;
        next();
      } else setError(404, `table_id=${req.params.table_id} does not exist`, next);
    })
}

function isFree(req, res, next) {
  if (res.locals.table.is_seated && res.locals.table.is_seated === true) setError(400, `Table occupied`, next);
  else next();
}

function isOccupied(req, res, next) {
  if (res.locals.table.is_seated && res.locals.table.is_seated === true) next();
  else setError(400, `Table not occupied`, next);
}

function hasSufficientCapacity(req, res, next) {
  if (res.locals.reservation.people <= res.locals.table.capacity) next();
  else setError(400, `Insufficient capacity at this table`, next);
}

/**
 * List handler for table resources
 */
async function list(req, res, next) {
  return tablesService.list()
}

/**
 * Create handler for table resources
 */
async function create(req, res, next) {
  return tablesService
    .create(req.body.data)
    .then(rsp => {
      ({ table_id, created_at, updated_at, ...data } = rsp);
      return data;
    })
}

/**
 * Update handler for table resources
 */
async function seat(req, res, next) {
  res.locals.table.is_seated = true;
  res.locals.table.reservation_id = res.locals.reservation.reservation_id;
  // console.log(res.locals);
  return tablesService.update(res.locals.table)
    .then(() => reservationsService.update({ reservation_id: res.locals.table.reservation_id, status: "seated" }));
}
async function unSeat(req, res, next) {
  res.locals.table.is_seated = false;
  // console.log(res.locals);
  return tablesService.update(res.locals.table)
    .then(() => reservationsService.update({ reservation_id: res.locals.table.reservation_id, status: "finished" }));
}

module.exports = {
  list: [
    printDebug,
    asyncErrorBoundary(list),
  ],
  create: [
    printDebug,
    hasData,
    hasRequiredProperties,
    validateName,
    validateCapacity,
    asyncErrorBoundary(create, 201)
  ],
  seat: [
    printDebug,
    hasData,
    hasProperties("reservation_id"),
    reservationExists,
    validateReservationStatus,
    tableExists,
    isFree,
    hasSufficientCapacity,
    asyncErrorBoundary(seat, 200)
  ],
  unseat: [
    printDebug,
    tableExists,
    isOccupied,
    asyncErrorBoundary(unSeat, 200)
  ],
};
