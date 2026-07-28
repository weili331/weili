/**
 * 播客服务 - 每日从B站推荐1条契合用户方向的学习播客
 */
const { fetchJSON } = require('../utils/fetcher');
const config = require('../config');

// 用户兴趣方向关键词（可扩展）
const INTEREST_KEYWORDS = [
  '学习方法 博主',
  '考研 经验分享',
  '英语学习 播客',
  '科研 入门讲解',
  '读书分享 知识',
  '自律 打卡 学习',
  '效率工具 方法',
];

/**
 * 从B站搜索视频
 */
async function searchBilibili(keyword) {
  try {
    const params = new URLSearchParams({
      search_type: 'video',
      keyword: keyword,
      order: 'pubdate',
      duration: '1', // 5-30分钟
      page_size: '10',
    });

    const url = `${config.SOURCES.bilibili.searchApi}?${params}`;
    const data = await fetchJSON(url, {
      headers: {
        'Referer': 'https://www.bilibili.com',
        'Accept': 'application/json',
      },
    });

    if (data.code === 0 && data.data && data.data.result) {
      return data.data.result
        .filter(v => v.title && v.bvid)
        .map(v => ({
          title: v.title.replace(/<[^>]+>/g, ''), // 去除高亮标签
          bvid: v.bvid,
          author: v.author,
          play: v.play,
          duration: v.duration,
          cover: v.pic,
          url: `${config.SOURCES.bilibili.videoPrefix}${v.bvid}`,
          description: v.description ? v.description.replace(/<[^>]+>/g, '') : '',
          pubdate: v.pubdate,
        }));
    }
    return [];
  } catch (err) {
    console.error('[podcastService] B站搜索失败:', err.message);
    return [];
  }
}

/**
 * 采集每日播客推荐
 */
async function collect() {
  console.log('[podcastService] 开始采集B站播客推荐...');

  // 每天轮换不同兴趣关键词
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const keyword = INTEREST_KEYWORDS[dayOfYear % INTEREST_KEYWORDS.length];

  let videos = await searchBilibili(keyword);

  // 如果失败，尝试默认关键词
  if (videos.length === 0) {
    console.log('[podcastService] 首次搜索失败，尝试默认关键词');
    videos = await searchBilibili(config.SOURCES.bilibili.defaultKeyword);
  }

  // 如果仍然失败，使用种子数据
  if (videos.length === 0) {
    console.log('[podcastService] B站采集失败，使用种子数据');
    return getSeedData();
  }

  // 选第1条作为今日推荐
  const top = videos[0];
  return {
    source: '哔哩哔哩',
    author: top.author,
    date: new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }).replace(/\//g, '-'),
    title: top.title,
    description: top.description || `UP主 ${top.author} 的学习分享视频`,
    duration: top.duration || '未知',
    playCount: top.play || 0,
    cover: top.cover || '',
    url: top.url,
    searchKeyword: keyword,
    recommendReason: generateRecommendReason(keyword, top),
  };
}

/**
 * 生成推荐理由
 */
function generateRecommendReason(keyword, video) {
  const reasons = {
    '学习方法 博主': `契合你关注的「学习方法」方向，UP主${video.author}分享了实用的学习技巧，播放量${video.play || '较多'}，值得一看。`,
    '考研 经验分享': `围绕考研经验，UP主${video.author}的分享对制定学习计划有参考价值。`,
    '英语学习 播客': `英语学习方向推荐，UP主${video.author}的内容有助于提升听力与口语。`,
    '科研 入门讲解': `科研入门方向，UP主${video.author}的讲解清晰易懂，适合了解学术研究方法。`,
    '读书分享 知识': `读书分享类内容，UP主${video.author}的知识解读拓宽视野。`,
    '自律 打卡 学习': `自律打卡方向，UP主${video.author}的学习日常可作为你的打卡参考。`,
    '效率工具 方法': `效率方法方向，UP主${video.author}的工具推荐值得借鉴。`,
  };
  return reasons[keyword] || `UP主${video.author}的分享契合你的学习方向，推荐观看。`;
}

/**
 * 种子数据
 */
function getSeedData() {
  return {
    source: '哔哩哔哩',
    author: '小Lin说',
    date: new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }).replace(/\//g, '-'),
    title: '我是如何快速学习一个领域的',
    description: 'UP主小Lin结合自身从北大到哥大的学习经验，系统讲解结构化思维：多问为什么、时间线梳理、异常数据分析、流程化拆解，帮你快速建立新领域的知识框架。',
    duration: '16:47',
    playCount: 3412000,
    cover: '',
    url: 'https://www.bilibili.com/video/BV11o4y1s7VY/',
    searchKeyword: '学习方法 博主',
    recommendReason: '契合你关注的「学习方法博主」方向，小Lin说是B站百大UP主（全网粉丝超1000万），该方法论视频播放量341万，信息密度高且实用，可直接跳转B站观看。',
  };
}

module.exports = { collect, getSeedData };
