/**
 * weili App 后端服务
 * Express 服务器 - 提供 API 接口 + 静态前端文件
 */
const express = require('express');
const path = require('path');
const cors = require('cors');
const config = require('./config');
const db = require('./db');
const scheduler = require('./scheduler');
const lawService = require('./services/lawService');
const geographyService = require('./services/geographyService');
const podcastService = require('./services/podcastService');
const musicService = require('./services/musicService');
const musicRecommendationService = require('./services/musicRecommendationService');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 静态前端文件
const staticDir = config.STATIC_DIR;
const fs = require('fs');
if (fs.existsSync(staticDir)) {
  app.use(express.static(staticDir));
  console.log(`[server] 前端静态文件目录: ${staticDir}`);
} else {
  console.warn(`[server] 前端目录不存在: ${staticDir}`);
}

// ============ API 路由 ============

/**
 * 健康检查
 */
app.get('/api/health', (req, res) => {
  const allData = db.readAll();
  res.json({
    status: 'ok',
    server: 'weili-server',
    time: new Date().toISOString(),
    modules: {
      law: allData.law ? allData.law.date : null,
      geography: allData.geography ? allData.geography.date : null,
      podcast: allData.podcast ? allData.podcast.date : null,
      music: allData.music ? allData.music.date : null,
      musicRecommendation: allData.musicRecommendation ? allData.musicRecommendation.date : null,
    },
  });
});

/**
 * 法学 - 每日从人民日报/光明新闻/解放日报/新华日报/中国青年报随机选取3篇
 */
app.get('/api/law', async (req, res) => {
  let data = db.read('law');
  if (!data) {
    console.log('[api/law] 无缓存数据，即时采集...');
    try {
      const fresh = await lawService.collect();
      data = db.write('law', { items: fresh });
    } catch (err) {
      return res.status(500).json({ error: '采集失败', message: err.message });
    }
  }
  res.json(data);
});

/**
 * 地理 - 每日从中国地理/星球研究所/中国国家地理中文网随机选取1篇
 */
app.get('/api/geography', async (req, res) => {
  let data = db.read('geography');
  if (!data) {
    console.log('[api/geography] 无缓存数据，即时采集...');
    try {
      const fresh = await geographyService.collect();
      data = db.write('geography', fresh);
    } catch (err) {
      return res.status(500).json({ error: '采集失败', message: err.message });
    }
  }
  res.json(data);
});

/**
 * 播客 - 每日B站推荐
 */
app.get('/api/podcast', async (req, res) => {
  let data = db.read('podcast');
  if (!data) {
    console.log('[api/podcast] 无缓存数据，即时采集...');
    try {
      const fresh = await podcastService.collect();
      data = db.write('podcast', fresh);
    } catch (err) {
      return res.status(500).json({ error: '采集失败', message: err.message });
    }
  }
  res.json(data);
});

/**
 * 音乐 - 每日简谱推荐
 */
app.get('/api/music', (req, res) => {
  let data = db.read('music');
  if (!data) {
    console.log('[api/music] 无缓存数据，即时生成...');
    const fresh = musicService.collect();
    data = db.write('music', fresh);
  }
  res.json(data);
});

/**
 * 音乐推荐 - 从B站UP主JLRS-LeoFM视频中每日随机选取一首
 */
app.get('/api/music-recommendation', (req, res) => {
  let data = db.read('musicRecommendation');
  if (!data) {
    console.log('[api/music-recommendation] 无缓存数据，即时生成...');
    const fresh = musicRecommendationService.collect();
    data = db.write('musicRecommendation', fresh);
  }
  res.json(data);
});

/**
 * 全部数据（一次请求获取所有模块）
 */
app.get('/api/all', (req, res) => {
  const allData = db.readAll();
  res.json({
    updatedAt: new Date().toISOString(),
    law: allData.law,
    geography: allData.geography,
    podcast: allData.podcast,
    music: allData.music,
    musicRecommendation: allData.musicRecommendation,
  });
});

/**
 * 手动刷新所有数据
 */
app.post('/api/refresh', async (req, res) => {
  try {
    const results = await scheduler.refreshNow();
    res.json({ message: '刷新完成', results });
  } catch (err) {
    res.status(500).json({ error: '刷新失败', message: err.message });
  }
});

/**
 * 前端路由 fallback（SPA 支持）
 */
app.get('*', (req, res) => {
  const indexPath = path.join(staticDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: '前端文件未找到' });
  }
});

// ============ 启动服务 ============

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('  weili App 后端服务已启动');
  console.log(`  API: http://localhost:${PORT}/api`);
  console.log(`  前端: http://localhost:${PORT}`);
  console.log('  定时更新: 每日 0:00 (Asia/Shanghai)');
  console.log('========================================\n');

  // 启动定时任务
  scheduler.start();

  // 首次启动时检查是否需要采集数据
  const allData = db.readAll();
  const today = db.todayStr();
  const needRefresh = !allData.law || allData.law.date !== today;
  if (needRefresh) {
    console.log('[server] 检测到今日数据未采集，启动首次采集...');
    scheduler.refreshNow().then(() => {
      console.log('[server] 首次采集完成');
    }).catch(err => {
      console.error('[server] 首次采集失败:', err.message);
    });
  } else {
    console.log('[server] 今日数据已存在，跳过首次采集');
  }
});
