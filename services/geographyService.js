/**
 * 地理服务 - 每日从中国地理/星球研究所/中国国家地理中文网随机选取一篇文章
 * 每天随机选取一个数据源，不与昨天重复
 * 每日 0:00 更新
 */
const cheerio = require('cheerio');
const { fetchText } = require('../utils/fetcher');
const config = require('../config');
const db = require('../db');

/**
 * 从搜狗微信搜索采集文章
 */
async function fetchFromSogou(sourceName) {
  try {
    const url = `https://weixin.sogou.com/weixin?type=2&query=${encodeURIComponent(sourceName + ' 地理')}`;
    const html = await fetchText(url);
    const $ = cheerio.load(html);

    const articles = [];
    $('.news-box .news-list li, .results .news-list li').each((_, el) => {
      const titleEl = $(el).find('h3 a, .txt-box h3 a').first();
      const title = titleEl.text().trim();
      const link = titleEl.attr('href');
      const summary = $(el).find('.txt-info, p.txt-info').text().trim();
      const account = $(el).find('.account, .s-p .account').text().trim();

      if (title && title.length > 4) {
        articles.push({
          title,
          summary: summary.slice(0, 120),
          source: account || sourceName,
          url: link ? (link.startsWith('http') ? link : 'https://weixin.sogou.com' + link) : '#',
        });
      }
    });

    return articles;
  } catch (err) {
    console.error(`[geoService] 搜狗搜索 ${sourceName} 失败:`, err.message);
    return [];
  }
}

/**
 * 采集每日地理推荐
 * 每日从三个数据源中随机选取一个，不与昨天使用的源重复
 */
async function collect() {
  console.log('[geoService] 开始采集地理文章...');

  const sources = config.SOURCES.geography.sources;
  const sourceNames = sources.map(s => s.name);

  // 获取昨天的数据，避免使用昨天的源
  const yesterdayData = db.getYesterdayData('geography');
  let yesterdaySource = null;
  if (yesterdayData && yesterdayData.featured) {
    yesterdaySource = yesterdayData.featured.source;
  }

  // 随机选择一个数据源，优先选择与昨天不同的
  let availableSources = sourceNames;
  if (sourceNames.length > 1 && yesterdaySource) {
    const filtered = sourceNames.filter(s => s !== yesterdaySource);
    if (filtered.length > 0) {
      availableSources = filtered;
    }
  }

  // 随机选取一个数据源
  const todaySource = availableSources[Math.floor(Math.random() * availableSources.length)];
  console.log(`[geoService] 今日数据源: ${todaySource} (昨天: ${yesterdaySource || '无'})`);

  let articles = await fetchFromSogou(todaySource);

  // 如果采集失败，使用种子数据
  if (articles.length === 0) {
    console.log('[geoService] 采集失败，使用种子数据');
    articles = getSeedArticles().filter(a => sourceNames.includes(a.source));
    // 如果种子数据中也没有匹配的源，使用全部种子数据
    if (articles.length === 0) {
      articles = getSeedArticles();
    }
  }

  // 确保不与昨天的文章重复
  let featured = articles[0];
  if (yesterdayData && yesterdayData.featured) {
    const yesterdayTitle = yesterdayData.featured.title;
    const differentArticles = articles.filter(a => a.title !== yesterdayTitle);
    if (differentArticles.length > 0) {
      featured = differentArticles[0];
    }
  }

  // 往期推荐（第2-3篇）
  const past = articles.slice(1, 3).length >= 2
    ? articles.slice(1, 3)
    : getSeedArticles().slice(1, 3);

  return {
    featured: {
      source: featured.source || todaySource,
      date: new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }).replace(/\//g, '-'),
      title: featured.title,
      summary: featured.summary,
      url: featured.url,
    },
    pastRecommendations: past.map((a, i) => ({
      source: a.source || sourceNames[(i + 1) % sourceNames.length],
      date: getPastDate(i + 1),
      title: a.title,
      url: a.url,
    })),
  };
}

function getPastDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
}

/**
 * 种子文章数据
 */
function getSeedArticles() {
  return [
    {
      title: '横断山脉：中国最极致的地理走廊',
      summary: '从青藏高原边缘到云贵高原，横断山脉用三江并流的奇观，书写了地球上最壮丽的地理篇章。',
      source: '星球研究所',
      url: 'https://weixin.sogou.com/weixin?type=2&query=星球研究所',
    },
    {
      title: '塔克拉玛干沙漠的绿色奇迹',
      summary: '中国最大的沙漠正在经历一场前所未有的生态治理，公路沿线的绿色走廊令人惊叹。',
      source: '中国地理',
      url: 'https://weixin.sogou.com/weixin?type=2&query=中国地理',
    },
    {
      title: '黄河三角洲：候鸟的最终驿站',
      summary: '黄河入海口的湿地生态系统，每年为数百万候鸟提供停歇和越冬栖息地。',
      source: '星球研究所',
      url: 'https://weixin.sogou.com/weixin?type=2&query=星球研究所',
    },
    {
      title: '喀斯特地貌：大自然的雕塑艺术',
      summary: '从桂林山水到贵州溶洞，喀斯特地貌塑造了中国南方最独特的自然景观。',
      source: '中国国家地理中文网',
      url: 'https://weixin.sogou.com/weixin?type=2&query=中国国家地理中文网',
    },
    {
      title: '青藏高原冰川退缩：气候变化的警示',
      summary: '亚洲水塔的冰川正在加速融化，影响着数十亿人的水资源安全。',
      source: '中国地理',
      url: 'https://weixin.sogou.com/weixin?type=2&query=中国地理',
    },
    {
      title: '丹霞地貌：大地的调色板',
      summary: '从广东丹霞山到甘肃张掖，红色砂岩在不同气候条件下呈现出壮观的色彩。',
      source: '中国国家地理中文网',
      url: 'https://weixin.sogou.com/weixin?type=2&query=中国国家地理中文网',
    },
  ];
}

module.exports = { collect, getSeedArticles };
