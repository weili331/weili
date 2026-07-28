/**
 * 地理服务 - 每日从中国地理/星球研究所/中国国家地理中文网随机选取一篇文章
 * 每天随机选取一个数据源，不与昨天重复
 * 每日 0:00 更新
 */
const cheerio = require('cheerio');
const { fetchText } = require('../utils/fetcher');
const db = require('../db');

// 稳定数据源配置（不会过期的官方页面）
const SOURCE_PAGES = {
  '中国国家地理中文网': {
    home: 'https://www.dili360.com/',
    list: 'https://www.dili360.com/article/',
    selector: '.article-list .item h3 a, .list-item h3 a, .article-item a',
    baseUrl: 'https://www.dili360.com',
  },
  '星球研究所': {
    home: 'https://space.bilibili.com/1007850336/',
    list: 'https://space.bilibili.com/1007850336/video',
    selector: '', // B站页面动态加载，较难直接解析，使用种子数据
    baseUrl: '',
  },
  '中国地理': {
    home: 'https://www.cng.com.cn/',
    list: 'https://www.cng.com.cn/news/',
    selector: '.news-list h3 a, .article-list h3 a, .list h3 a',
    baseUrl: 'https://www.cng.com.cn',
  },
};

/**
 * 从官方网站文章列表采集
 */
async function fetchFromOfficial(sourceName) {
  const cfg = SOURCE_PAGES[sourceName];
  if (!cfg) return [];

  try {
    const html = await fetchText(cfg.list || cfg.home);
    const $ = cheerio.load(html);
    const articles = [];

    if (cfg.selector) {
      $(cfg.selector).each((_, el) => {
        const title = $(el).text().trim();
        let link = $(el).attr('href') || '';
        if (link && !link.startsWith('http') && cfg.baseUrl) {
          link = cfg.baseUrl + (link.startsWith('/') ? '' : '/') + link;
        }
        if (title && title.length > 4) {
          articles.push({
            title,
            summary: '',
            source: sourceName,
            url: link || cfg.home,
          });
        }
      });
    }

    return articles;
  } catch (err) {
    console.error(`[geoService] 官网采集 ${sourceName} 失败:`, err.message);
    return [];
  }
}

/**
 * 采集每日地理推荐
 * 每日从三个数据源中随机选取一个，不与昨天使用的源重复
 */
async function collect() {
  console.log('[geoService] 开始采集地理文章...');

  const sourceNames = Object.keys(SOURCE_PAGES);

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

  let articles = await fetchFromOfficial(todaySource);

  // 如果采集失败或数量不足，使用种子数据
  if (articles.length < 2) {
    console.log('[geoService] 官网采集不足，使用种子数据');
    const seed = getSeedArticles().filter(a => a.source === todaySource || todaySource.includes(a.source) || a.source.includes(todaySource));
    articles = seed.length >= 2 ? seed : getSeedArticles();
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
  const remaining = articles.filter(a => a.title !== featured.title);
  const past = remaining.slice(0, 2).length >= 2
    ? remaining.slice(0, 2)
    : getSeedArticles().filter(a => a.title !== featured.title).slice(0, 2);

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
 * 种子文章数据 - 使用稳定官方链接，不会过期
 */
function getSeedArticles() {
  return [
    {
      title: '出发G331！北境寻秋3000里',
      summary: '一条超级边境走廊，横跨四个时区，纵越寒温带、中温带与暖温带。在吉林段331国道绵延1314公里，串联长白山、三江流域与中朝边境线。',
      source: '中国国家地理',
      url: 'https://news.qq.com/rain/a/20250909A06PEM00',
    },
    {
      title: '2025十大自然地理热点事件盘点',
      summary: '从西藏墨脱莲花瀑布刷新世界纪录，到贵州4.8亿年地下水晶宫，再到缅甸7.9级地震——2025年地球上的震撼印记。',
      source: '侠客地理',
      url: 'https://www.163.com/dy/article/KHNLDAPL0512VPKM.html',
    },
    {
      title: '天山，被打穿了？！',
      summary: '用时5年，这条前所未有的天山大通道诞生了。星球研究所联合中国交建、极氪001推出科普视频，见证天山大通道的诞生。',
      source: '星球研究所',
      url: 'https://www.163.com/dy/article/KHN14MHV0524A2BA.html',
    },
    {
      title: '4000年，等一个永不到来的黎明',
      summary: '最沉重的孤独，是用四千年的时光等待一个永不到来的黎明。黄土之下，他们的生命被永远定格在破晓之前。',
      source: '星球研究所',
      url: 'https://www.163.com/dy/article/KCUKTVO00524A2BA.html',
    },
    {
      title: '中国国家地理2026年03期',
      summary: '东北是中国自然省最密集的地方；极致洞穴奇景惊艳亮相；柴达木盆地的泉——超乎想象的地质奇观。',
      source: '中国国家地理中文网',
      url: 'https://www.dili360.com/cng/mag/detail/1003.htm',
    },
    {
      title: '中国国家地理中文网首页',
      summary: '汇聚大量关于中国自然地理、人文地理的深度文章和精美图片。',
      source: '中国国家地理中文网',
      url: 'https://www.dili360.com/',
    },
  ];
}

module.exports = { collect, getSeedArticles };
