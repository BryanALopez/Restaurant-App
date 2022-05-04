const knex = require('../db/connection');

function listByDate(date) {
  return knex('reservations').select('*').where({ "reservation_date": date }).whereNot({ status: 'finished' }).orderBy('reservation_time');
}

function listByID(reservation_id) {
  return knex('reservations').select('*').where({ "reservation_id": reservation_id }).first();
}

function listByNumber(mobile_number) {
  return knex('reservations').select('*')
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    );
}

function create(reservation) {
  return knex('reservations')
    .insert(reservation)
    .returning('*')
    .then(createdRecords => createdRecords[0]);
}

function update(reservation) {
  // console.log(`update status to ${status}, reservation_id=${reservation_id}`);
  return knex("reservations")
    .select("*")
    .where({ "reservation_id": reservation.reservation_id })
    .update(reservation, "*")
    .then((updatedRecords) => updatedRecords[0]);
}

module.exports = {
  listByDate,
  listByID,
  listByNumber,
  create,
  update
};
