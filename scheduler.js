/**
 * 定时调度器 - 每日 0:00 (Asia/Shanghai) 刷新所有数据
 */
const cron = require('node-cron');
const db = require('./db');
const lawService = require('./services/lawService');
const geographyService = require('./services/geographyService');
const podcastService = require('./services/podcastService');
const musicService = require('./services/musicService');
const musicRecommendationService = require('./services/musicRecommendationService');

let cronTask = null;

async function refreshNow() {
  const results = {};
  console.log('[scheduler] 开始刷新所有数据...');

  // 法学
  try {
    const law = await lawService.collect();
    db.write('law', { items: law });
    results.law = { success: true, count: law.length };
    console.log('[scheduler] 法学数据刷新成功:', law.length, '条');
  } catch (err) {
    results.law = { success: false, error: err.message };
    console.error('[scheduler] 法学数据刷新失败:', err.message);
  }

  // 地理
  try {
    const geo = await geographyService.collect();
    db.write('geography', geo);
    results.geography = { success: true };
    console.log('[scheduler] 地理数据刷新成功');
  } catch (err) {
    results.geography = { success: false, error: err.message };
    console.error('[scheduler] 地理数据刷新失败:', err.message);
  }

  // 播客
  try {
    const pod = await podcastService.collect();
    db.write('podcast', pod);
    results.podcast = { success: true };
    console.log('[scheduler] 播客数据刷新成功');
  } catch (err) {
    results.podcast = { success: false, error: err.message };
    console.error('[scheduler] 播客数据刷新失败:', err.message);
  }

  // 音乐
  try {
    const music = musicService.collect();
    db.write('music', music);
    results.music = { success: true };
    console.log('[scheduler] 音乐数据刷新成功');
  } catch (err) {
    results.music = { success: false, error: err.message };
    console.error('[scheduler] 音乐数据刷新失败:', err.message);
  }

  // 音乐推荐 (B站JLRS-LeoFM每日随机)
  try {
    const musicRec = musicRecommendationService.collect();
    db.write('musicRecommendation', musicRec);
    results.musicRecommendation = { success: true };
    console.log('[scheduler] 音乐推荐刷新成功');
  } catch (err) {
    results.musicRecommendation = { success: false, error: err.message };
    console.error('[scheduler] 音乐推荐刷新失败:', err.message);
  }

  console.log('[scheduler] 所有数据刷新完成');
  return results;
}

function start() {
  // 每日 0:00 北京时间执行 (UTC 16:00)
  cronTask = cron.schedule('0 16 * * *', async () => {
    console.log('\n[scheduler] 定时任务触发 (每日 0:00 Beijing)');
    try {
      await refreshNow();
    } catch (err) {
      console.error('[scheduler] 定时刷新失败:', err.message);
    }
  }, {
    timezone: 'UTC',
    scheduled: true,
  });
  console.log('[scheduler] 定时任务已启动: 每日 0:00 (Asia/Shanghai)');
}

function stop() {
  if (cronTask) {
    cronTask.stop();
    console.log('[scheduler] 定时任务已停止');
  }
}

module.exports = { start, stop, refreshNow };
