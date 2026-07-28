/**
 * 音乐推荐服务 - 从B站UP主JLRS-LeoFM视频中每日随机选取一首
 * 每日0点更新，不与昨天重复
 */
const config = require('../config');
const db = require('../db');

// B站UP主JLRS-LeoFM的视频库（UID: 3493093607213343）
const VIDEO_POOL = [
  { bvid: 'BV12G3c6VEN5', title: '方大同《南音》百万豪装录音棚大声听', cover: 'http://i2.hdslb.com/bfs/archive/560b1fd9279650eddc9cfc8adf93446d687aa8dd.jpg', duration: '03:34', play: 16071 },
  { bvid: 'BV1bogY6zEDC', title: '许嵩《出雨林记》百万豪装录音棚大声听', cover: 'http://i2.hdslb.com/bfs/archive/ad819151762bc30621b28dc6789e16f46c23cb57.jpg', duration: '04:35', play: 27756 },
  { bvid: 'BV1bogY6zEZo', title: '王菲《流年》百万豪装录音棚大声听', cover: 'http://i0.hdslb.com/bfs/archive/6f879da7138e2e56ce916e5d802992af3a3becee.jpg', duration: '04:36', play: 68945 },
  { bvid: 'BV1DMgh6eEvY', title: 'A-Lin《P.S.我爱你》百万豪装录音棚大声听', cover: 'http://i2.hdslb.com/bfs/archive/e49b9b7764c3460f75f86c6bbfd7b1b8e6cbbda5.jpg', duration: '04:15', play: 51243 },
  { bvid: 'BV1ohgS6hEas', title: '毛华锋《奇迹再现》百万豪装录音棚大声听', cover: 'http://i0.hdslb.com/bfs/archive/13519636d3316ab1c8b47afc8cc70e7ce0d7e083.jpg', duration: '03:53', play: 140963 },
  { bvid: 'BV1mXg66sEbp', title: '黄霄雲&刘端端《空心》百万豪装录音棚大声听', cover: 'http://i0.hdslb.com/bfs/archive/8531b6bf0dca66ec62d65d254af6745041d72082.jpg', duration: '04:57', play: 248443 },
  { bvid: 'BV154K86ZEMV', title: 'CNBLUE《孤独的人》百万豪装录音棚大声听', cover: 'http://i1.hdslb.com/bfs/archive/3a5942cf90d33ceda75e9bdb73915c0bd05f5754.jpg', duration: '03:39', play: 95580 },
  { bvid: 'BV1AwKU6ZEGF', title: 'Boney M.《Sunny》百万豪装录音棚大声听', cover: 'http://i1.hdslb.com/bfs/archive/175d765670593641df1226c0e70c6bc9de0f2534.jpg', duration: '04:03', play: 43258 },
  { bvid: 'BV13vKn6aER5', title: '金池&孙伯纶《白首相依》百万豪装录音棚大声听', cover: 'http://i0.hdslb.com/bfs/archive/50684129a5a9dc199a8a169d3f74df10e0089f16.jpg', duration: '04:03', play: 47901 },
  { bvid: 'BV1hvKn6hEdD', title: 'Apink《Mr.Chu》百万豪装录音棚大声听', cover: 'http://i1.hdslb.com/bfs/archive/cee0e3eb3cb8b5b119f5c7c73d5c72278a103a0c.jpg', duration: '03:35', play: 86371 },
  { bvid: 'BV1YaKn6eEm3', title: 'S.H.E《波斯猫》百万豪装录音棚大声听', cover: 'http://i1.hdslb.com/bfs/archive/311708ecfbece6bd577dd1723a078f05cc600e52.jpg', duration: '03:52', play: 103432 },
  { bvid: 'BV1gnKg6wEsY', title: '白智英《像中枪一样》百万豪装录音棚大声听', cover: 'http://i1.hdslb.com/bfs/archive/eab6afca11a885aebc3b75a8d3dd5d9f88b106aa.jpg', duration: '03:59', play: 209906 },
  { bvid: 'BV1V2Ne6qEBW', title: '芮恩《讨厌》百万豪装录音棚大声听', cover: 'http://i0.hdslb.com/bfs/archive/5419f4f9e73d6d23001baa3457922c0b56a99bcb.jpg', duration: '04:21', play: 151760 },
  { bvid: 'BV1xoNX6kEJ7', title: '七水Lena《民国十九年冬》百万豪装录音棚大声听', cover: 'http://i0.hdslb.com/bfs/archive/3bb956952242942c37c14ba427185c8b3fc03dac.jpg', duration: '03:35', play: 97548 },
  { bvid: 'BV1BoNy66E7i', title: '飞轮海&S.H.E《新窝》百万豪装录音棚大声听', cover: 'http://i2.hdslb.com/bfs/archive/31c124a41733547d0efdec86f7aa9add51530b21.jpg', duration: '03:54', play: 67576 },
  { bvid: 'BV1XrNE6REt7', title: '林俊杰《街道》百万豪装录音棚大声听', cover: 'http://i2.hdslb.com/bfs/archive/251eee774d48f343d8133b1d26468660a8f3298e.jpg', duration: '04:01', play: 208678 },
  { bvid: 'BV1hCNE6WEBX', title: '杨丞琳《左边》百万豪装录音棚大声听', cover: 'http://i0.hdslb.com/bfs/archive/156e8af64a4d34a3ef906e4961b731fb61fee457.jpg', duration: '04:36', play: 158845 },
  { bvid: 'BV1YAME6aEzJ', title: 'AlanWalker×张韶涵《遗忘之海》百万豪装录音棚大声听', cover: 'http://i1.hdslb.com/bfs/archive/add451c6dea03c2171dacce3df82b6bc536bd943.jpg', duration: '03:28', play: 64863 },
  { bvid: 'BV1tyMv6BE67', title: '许嵩《一见如故》百万豪装录音棚大声听', cover: 'http://i0.hdslb.com/bfs/archive/375a84719aaafd004704ed00e36eae002842b6d3.jpg', duration: '04:23', play: 96361 },
  { bvid: 'BV14aM46yEGU', title: 'A-Lin《爱,请问怎么走》百万豪装录音棚大声听', cover: 'http://i1.hdslb.com/bfs/archive/0a783098501497f57462d88192d53554002effc4.jpg', duration: '04:30', play: 139794 },
  { bvid: 'BV1PLTQ6zEnD', title: '王力宏《Forever Love》百万豪装录音棚大声听', cover: 'http://i1.hdslb.com/bfs/archive/82e47d6333eed07edcf44760552a2ccfa1958b8e.jpg', duration: '04:52', play: 109337 },
  { bvid: 'BV1ruTs6ZES3', title: '张惠妹《也许明天》百万豪装录音棚大声听', cover: 'http://i2.hdslb.com/bfs/archive/83f49e9bfc2225a2b16dbe0710aeb12658b852c0.jpg', duration: '05:01', play: 78535 },
  { bvid: 'BV1r3Ts64Ewx', title: 'S.H.E《最近还好吗》百万豪装录音棚大声听', cover: 'http://i0.hdslb.com/bfs/archive/1d1f245b90b667fc3c3240f905baddec14de1b48.jpg', duration: '03:58', play: 145968 },
  { bvid: 'BV1ruTs6ZEeS', title: '许嵩《老歌》百万豪装录音棚大声听', cover: 'http://i0.hdslb.com/bfs/archive/4ccaec6eb501bd89edd5fa5552d239ff709b67cd.jpg', duration: '03:45', play: 85164 },
  { bvid: 'BV1irTv62EJS', title: '徐良&小暖《不好听》百万豪装录音棚大声听', cover: 'http://i1.hdslb.com/bfs/archive/ef3687e863313ffe175aeb45c91856a480aa2e2e.jpg', duration: '03:51', play: 88013 },
  { bvid: 'BV1ZgKZ6VEZP', title: '周传雄《弱水三千》百万豪装录音棚大声听', cover: 'http://i2.hdslb.com/bfs/archive/afe2492675b666e4a46d3dfc6f36e224b63b743a.jpg', duration: '05:20', play: 248438 },
  { bvid: 'BV1F8KS6tEit', title: '杨丞琳《仰望》百万豪装录音棚大声听', cover: 'http://i0.hdslb.com/bfs/archive/9321e1fdbd75e06a7bd13ecbc9f0a3038fcf6545.jpg', duration: '03:35', play: 159979 },
  { bvid: 'BV1Jv7G6UEsP', title: '许嵩《心安之地》百万豪装录音棚大声听', cover: 'http://i0.hdslb.com/bfs/archive/325c3560e36991cdc840e26e606d091a5ab5c5be.jpg', duration: '04:23', play: 101930 },
  { bvid: 'BV1PT7V6oEbZ', title: '王菲《主角》百万豪装录音棚大声听', cover: 'http://i2.hdslb.com/bfs/archive/514defa1c6a59681cb66ee50cf0afb5e9f83f279.jpg', duration: '05:02', play: 233063 },
  { bvid: 'BV1By7q6UEcq', title: '王铮亮&谭松韵《小半》百万豪装录音棚大声听', cover: 'http://i1.hdslb.com/bfs/archive/f320effa0206aca626fe1e8ae9f3d3ba1596deca.jpg', duration: '05:17', play: 253934 },
];

const BILIBILI_VIDEO_PREFIX = 'https://www.bilibili.com/video/';

/**
 * 每日随机选取一首，不与昨天重复
 */
function collect() {
  console.log('[musicRecommendationService] 选取每日音乐推荐...');

  // 获取昨天的推荐
  const yesterday = db.getYesterdayData('musicRecommendation');
  const yesterdayBvid = yesterday && yesterday.recommendation ? yesterday.recommendation.bvid : null;

  // 过滤掉昨天的视频
  let candidates = VIDEO_POOL;
  if (yesterdayBvid && VIDEO_POOL.length > 1) {
    candidates = VIDEO_POOL.filter(v => v.bvid !== yesterdayBvid);
  }

  // 随机选取
  const selected = candidates[Math.floor(Math.random() * candidates.length)];

  const result = {
    recommendation: {
      title: selected.title,
      bvid: selected.bvid,
      url: BILIBILI_VIDEO_PREFIX + selected.bvid,
      cover: selected.cover,
      duration: selected.duration,
      play: selected.play,
      author: 'JLRS-LeoFM',
      authorUrl: 'https://space.bilibili.com/3493093607213343',
      source: 'B站',
    },
    totalVideos: VIDEO_POOL.length,
  };

  console.log('[musicRecommendationService] 今日推荐:', selected.title);
  return result;
}

module.exports = { collect, VIDEO_POOL };
