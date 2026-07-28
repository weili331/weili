/**
 * 地理服务 - 每日从中国地理/星球研究所/中国国家地理中文网随机选取一篇文章
 * 使用稳定种子数据，避免微信公众号链接过期问题
 * 每天随机选取一个数据源，不与昨天重复
 * 每日 0:00 更新
 */
const db = require('../db');

// 稳定数据源配置
const SOURCE_NAMES = ['中国国家地理中文网', '星球研究所', '中国地理'];

/**
 * 种子文章数据 - 全部使用稳定官方链接，不会过期
 * 每个数据源至少保证3篇文章，用于轮换
 */
function getSeedArticles() {
  return [
    // 中国国家地理中文网（dili360.com）
    {
      title: '新疆尉犁：盐碱与富饶共生的土地',
      summary: '新疆尉犁县是继罗布泊之后，塔里木盆地一个新的汇盐区。这里有大面积的盐渍化土地，却呈现盐碱与富饶共生的和谐景象。',
      source: '中国国家地理中文网',
      url: 'https://www.dili360.com/cng/article/p649272519b00187.htm',
    },
    {
      title: '走棱线：变“左手荒漠，右手昆仑”为现实',
      summary: '沿国道315线新疆段徒步棱线，南侧是皑皑雪峰，北侧是漫漫黄沙，体验中国地势第一、二级阶梯分界线两侧的极致景观。',
      source: '中国国家地理中文网',
      url: 'https://www.dili360.com/cng/article/p58087f9e2d46e48.htm',
    },
    {
      title: '天山把另一半美给了吉尔吉斯斯坦',
      summary: '天山的主体在我国新疆境内，但天山的另一半美却在中亚。漫长的国境线阻隔了我们对完整天山的认知。',
      source: '中国国家地理中文网',
      url: 'https://www.dili360.com/cng/article/p5e691d8ac843a72.htm',
    },
    {
      title: '穿越喜马拉雅南麓的林海 ——寻找神秘的“喜山小熊猫”',
      summary: '2024年至2025年，一支考察队深入喜马拉雅南麓森林，成功拍摄到目前国内最清晰的喜马拉雅小熊猫野外影像之一。',
      source: '中国国家地理中文网',
      url: 'https://www.dili360.com/cng/article/p694cf0a7c6b3934.htm',
    },
    {
      title: '中国国家地理2026年03期',
      summary: '东北是中国自然省最密集的地方；极致洞穴奇景惊艳亮相；柴达木盆地的泉——超乎想象的地质奇观。',
      source: '中国国家地理中文网',
      url: 'https://www.dili360.com/cng/mag/detail/1003.htm',
    },

    // 星球研究所（稳定转载或B站）
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
      title: '哪座城市，压轴2025？',
      summary: '星球研究所花费159天、推翻36版大纲，试图解答石家庄这座城市的秘密。',
      source: '星球研究所',
      url: 'https://www.163.com/dy/article/KHS5S82H0524A2BA.html',
    },
    {
      title: '2026，HHHHHHHH',
      summary: '星球研究所联合中国氢能联盟，科普氢能如何成为替代化石能源的关键选择。',
      source: '星球研究所',
      url: 'https://c.m.163.com/news/a/KI19ES8F0524A2BA.html',
    },
    {
      title: '星球研究所官方B站视频',
      summary: '在B站观看星球研究所的地理科普视频，内容精美、讲解深入。',
      source: '星球研究所',
      url: 'https://space.bilibili.com/1007850336/video',
    },

    // 中国地理（cng.com.cn，与《中国国家地理》同源）
    {
      title: '中国国家地理：探索中国最美景观',
      summary: '中国国家地理官方网站，探索中国壮丽的自然景观和深厚的人文底蕴。',
      source: '中国地理',
      url: 'https://www.cng.com.cn/',
    },
    {
      title: '中国国家地理：地理新闻与资讯',
      summary: '中国国家地理网提供最新的地理新闻、科考动态和自然人文报道。',
      source: '中国地理',
      url: 'https://www.cng.com.cn/news/',
    },
    {
      title: '中国国家地理：黑龙江是中国极光观测第一省',
      summary: '黑龙江省有北纬43°至53°的广袤地域，其最北点漠河较新疆阿勒泰更偏北约5个纬度，是中国极光观测的最佳省份。',
      source: '中国地理',
      url: 'https://www.dili360.com/cng/mag/detail/1001.htm',
    },
  ];
}

function getPastDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
}

/**
 * 采集每日地理推荐
 * 每日从三个数据源中随机选取一个，不与昨天使用的源重复
 * 全部使用稳定的种子数据，避免链接过期
 */
async function collect() {
  console.log('[geoService] 开始生成地理文章推荐（使用稳定种子数据）...');

  // 获取昨天的数据，避免使用昨天的源
  const yesterdayData = db.getYesterdayData('geography');
  let yesterdaySource = null;
  if (yesterdayData && yesterdayData.featured) {
    yesterdaySource = yesterdayData.featured.source;
  }

  // 随机选择一个数据源，优先选择与昨天不同的
  let availableSources = SOURCE_NAMES;
  if (SOURCE_NAMES.length > 1 && yesterdaySource) {
    const filtered = SOURCE_NAMES.filter(s => s !== yesterdaySource);
    if (filtered.length > 0) {
      availableSources = filtered;
    }
  }

  // 随机选取一个数据源
  const todaySource = availableSources[Math.floor(Math.random() * availableSources.length)];
  console.log(`[geoService] 今日数据源: ${todaySource} (昨天: ${yesterdaySource || '无'})`);

  // 从种子数据中筛选该数据源的文章
  const seedArticles = getSeedArticles();
  const sourceArticles = seedArticles.filter(a => a.source === todaySource);

  // 如果该数据源文章不足，使用全部种子数据兜底
  const articles = sourceArticles.length >= 2
    ? sourceArticles
    : seedArticles;

  // 确保不与昨天的文章重复
  let featured = articles[0];
  if (yesterdayData && yesterdayData.featured) {
    const yesterdayTitle = yesterdayData.featured.title;
    const differentArticles = articles.filter(a => a.title !== yesterdayTitle);
    if (differentArticles.length > 0) {
      featured = differentArticles[Math.floor(Math.random() * differentArticles.length)];
    }
  }

  // 往期推荐（从其他数据源选2篇）
  const otherSourceArticles = seedArticles.filter(a => a.source !== todaySource);
  const shuffled = otherSourceArticles.sort(() => Math.random() - 0.5);
  const past = shuffled.slice(0, 2);

  return {
    featured: {
      source: featured.source || todaySource,
      date: new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }).replace(/\//g, '-'),
      title: featured.title,
      summary: featured.summary,
      url: featured.url,
    },
    pastRecommendations: past.map((a, i) => ({
      source: a.source,
      date: getPastDate(i + 1),
      title: a.title,
      url: a.url,
    })),
  };
}

module.exports = { collect, getSeedArticles };
