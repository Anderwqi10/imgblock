const config = require('../config');
const mysql = require('mysql2');
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: process.env.DB_PASS || config.password, database: config.database, port: config.mysqlPort });
const promisePool = pool.promise();

class SessionModel {
  save = async (data) => {
    const sql = `INSERT INTO auth_sessions (user_id,refresh_token,expires_at) VALUES (?,?,?)`;
    const [result] = await promisePool.query(sql, [data.user_id, data.refresh_token, data.expires_at]);
    return result;
  }

  revoke = async (data) => {
    const sql = `DELETE FROM auth_sessions WHERE refresh_token=?`;
    const [result] = await promisePool.query(sql, [data.refresh_token]);
    return result;
  }

  find = async (data) => {
    const sql = `SELECT * FROM auth_sessions WHERE refresh_token=? LIMIT 1`;
    const [rows] = await promisePool.query(sql, [data.refresh_token]);
    return rows;
  }
}

module.exports = new SessionModel();


