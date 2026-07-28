/**
 * 简易文件数据库 - 存储每日采集的数据
 * 支持昨日记录追踪（用于不重复推荐）
 */
const fs = require('fs');
const path = require('path');
const config = require('./config');

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// 内存存储（用于 Vercel 等无持久文件系统的环境）
let memDB = { history: {} };
let useMemStore = false;

function loadDB() {
  if (useMemStore) return memDB;
  try {
    if (fs.existsSync(config.DB_FILE)) {
      return JSON.parse(fs.readFileSync(config.DB_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('[db] 读取数据库失败，切换到内存模式:', err.message);
    useMemStore = true;
  }
  return useMemStore ? memDB : { history: {} };
}

function saveDB(data) {
  if (useMemStore) {
    memDB = data;
    return;
  }
  try {
    const dir = path.dirname(config.DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(config.DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[db] 保存数据库失败，切换到内存模式:', err.message);
    useMemStore = true;
    memDB = data;
  }
}

function read(module) {
  const db = loadDB();
  const today = todayStr();
  if (db.history[module] && db.history[module].date === today) {
    return db.history[module];
  }
  return null;
}

function write(module, data) {
  const db = loadDB();
  const today = todayStr();
  const entry = { ...data, date: today, updatedAt: new Date().toISOString() };
  db.history[module] = entry;
  saveDB(db);
  return entry;
}

function readAll() {
  const db = loadDB();
  return db.history;
}

function getYesterdayData(module) {
  const db = loadDB();
  const yesterday = yesterdayStr();
  if (db.history[module] && db.history[module].date === yesterday) {
    return db.history[module];
  }
  return null;
}

module.exports = { read, write, readAll, todayStr, yesterdayStr, getYesterdayData, loadDB, saveDB };
