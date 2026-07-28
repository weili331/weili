/**
 * weili App - Vercel Serverless 入口
 * 将 Express 应用导出为 Vercel serverless function
 */
const express = require('express');
const cors = require('cors');
const config = require('../config');
const db = require('../db');
const lawService = require('../services/lawService');
const geographyService = require('../services/geographyService');
const podcastService = require('../services/podcastService');
const musicService = require('../services/musicService');
const musicRecommendationService = require('../services/musicRecommendationService');

const app = express();
app.use(cors());
app.use(express.json());

// ====== API 路由 ======

app.get('/api/health', (req, res) => {
  const allData = db.readAll();
  res.json({
    status: 'ok',
    server: 'weili-vercel',
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

app.get('/api/law', async (req, res) => {
  let data = db.read('law');
  if (!data) {
    try {
      const fresh = await lawService.collect();
      data = db.write('law', { items: fresh });
    } catch (err) {
      return res.status(500).json({ error: '采集失败', message: err.message });
    }
  }
  res.json(data);
});

app.get('/api/geography', async (req, res) => {
  let data = db.read('geography');
  if (!data) {
    try {
      const fresh = await geographyService.collect();
      data = db.write('geography', fresh);
    } catch (err) {
      return res.status(500).json({ error: '采集失败', message: err.message });
    }
  }
  res.json(data);
});

app.get('/api/podcast', async (req, res) => {
  let data = db.read('podcast');
  if (!data) {
    try {
      const fresh = await podcastService.collect();
      data = db.write('podcast', fresh);
    } catch (err) {
      return res.status(500).json({ error: '采集失败', message: err.message });
    }
  }
  res.json(data);
});

app.get('/api/music', (req, res) => {
  let data = db.read('music');
  if (!data) {
    const fresh = musicService.collect();
    data = db.write('music', fresh);
  }
  res.json(data);
});

app.get('/api/music-recommendation', (req, res) => {
  let data = db.read('musicRecommendation');
  if (!data) {
    const fresh = musicRecommendationService.collect();
    data = db.write('musicRecommendation', fresh);
  }
  res.json(data);
});

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

app.post('/api/refresh', async (req, res) => {
  const results = {};
  try {
    const law = await lawService.collect();
    db.write('law', { items: law });
    results.law = { success: true, count: law.length };
  } catch (err) {
    results.law = { success: false, error: err.message };
  }
  try {
    const geo = await geographyService.collect();
    db.write('geography', geo);
    results.geography = { success: true };
  } catch (err) {
    results.geography = { success: false, error: err.message };
  }
  try {
    const pod = await podcastService.collect();
    db.write('podcast', pod);
    results.podcast = { success: true };
  } catch (err) {
    results.podcast = { success: false, error: err.message };
  }
  const music = musicService.collect();
  db.write('music', music);
  results.music = { success: true };
  const musicRec = musicRecommendationService.collect();
  db.write('musicRecommendation', musicRec);
  results.musicRecommendation = { success: true };
  res.json({ message: '刷新完成', results });
});

module.exports = app;
