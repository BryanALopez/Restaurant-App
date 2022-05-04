const knex = require('../db/connection');

function list() {
  // console.log("list")
  return knex('tables').select('*').orderBy('table_name');
}

function create(table) {
  // console.log("create")
  return knex('tables')
    .insert(table)
    .returning('*')
    .then(createdRecords => createdRecords[0]);
}

function update(table) {
  // console.log("update")
  return knex("tables")
    .select("*")
    .where({ "table_id": table.table_id })
    .update(table, "*")
    .then((updatedRecords) => updatedRecords[0]);
}

function listTable(table_id) {
  // console.log("listTable")
  return knex('tables').select('*').where({ "table_id": table_id }).first();
}

module.exports = {
  list,
  create,
  update,
  listTable
};
