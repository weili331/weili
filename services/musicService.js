/**
 * 音乐服务 - 每天推荐一首简单曲子并附带简谱
 * 从内置歌曲库中按天轮换
 */
const fs = require('fs');
const path = require('path');
const config = require('../config');

let songs = [];

function loadSongs() {
  try {
    const filePath = path.join(config.DATA_DIR, config.SONGS_FILE);
    songs = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log(`[musicService] 已加载 ${songs.length} 首歌曲`);
  } catch (err) {
    console.error('[musicService] 加载歌曲库失败:', err.message);
    songs = [];
  }
}

loadSongs();

/**
 * 获取今日推荐歌曲
 * 按天轮换，每7天循环一次
 */
function collect() {
  console.log('[musicService] 生成每日音乐推荐...');

  if (songs.length === 0) {
    return {
      title: '小星星',
      subtitle: 'C大调 4/4拍 · 英国民歌',
      notation: '1 1 5 5 | 6 6 5 - | 4 4 3 3 | 2 2 1 - |',
      solfege: 'do do sol sol | la la sol - | fa fa mi mi | re re do - |',
      tip: '最经典的入门曲，练习 do-sol 的音程跳跃',
      difficulty: '入门',
      videoUrl: 'https://www.bilibili.com/video/BV1LvqpBEEXq/',
      date: new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }).replace(/\//g, '-'),
    };
  }

  // 计算今天是第几天（从年初开始），然后取模
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const todaySong = songs[dayOfYear % songs.length];

  return {
    ...todaySong,
    date: new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }).replace(/\//g, '-'),
  };
}

module.exports = { collect, loadSongs };
