const config = require('../config');
const mysql = require('mysql2');
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: process.env.DB_PASS || config.password, database: config.database, port: config.mysqlPort });
const promisePool = pool.promise();

class WalletModel {
  addWallet = async (data) => {
    const sql = `INSERT INTO user_wallets (user_id,address,chain,is_primary) VALUES (?,?,?,?)`;
    const [result] = await promisePool.query(sql, [data.user_id, data.address, data.chain, data.is_primary ? 1 : 0]);
    return result;
  }

  listWallets = async (data) => {
    const sql = `SELECT id,user_id,address,chain,is_primary,created_at FROM user_wallets WHERE user_id=? ORDER BY id DESC`;
    const [rows] = await promisePool.query(sql, [data.user_id]);
    return rows;
  }

  removeWallet = async (data) => {
    const sql = `DELETE FROM user_wallets WHERE id=? AND user_id=?`;
    const [result] = await promisePool.query(sql, [data.id, data.user_id]);
    return result;
  }
}

module.exports = new WalletModel();


