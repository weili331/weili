/**
 * 法学服务 - 每日从人民日报/光明新闻/解放日报/新华日报/中国青年报
 * 随机选取3篇社会热点并生成法律解析
 * 文章链接统一使用百度搜索链接，确保移动端稳定可打开
 * 每日 0:00 更新，不与昨天重复
 */
const cheerio = require('cheerio');
const { fetchText } = require('../utils/fetcher');
const legalAnalyzer = require('../utils/legalAnalyzer');
const config = require('../config');
const db = require('../db');

/**
 * 生成百度搜索链接（永远可用）
 */
function searchUrl(title) {
  return 'https://www.baidu.com/s?wd=' + encodeURIComponent(title);
}

/**
 * 采集人民日报当日文章
 */
async function fetchPeopleDaily() {
  const results = [];
  try {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
    const indexUrl = `${config.SOURCES.peopleDaily.indexUrl}rmrb/html/${dateStr}/nbs.D110000renmrb_01.htm`;
    const html = await fetchText(indexUrl);
    const $ = cheerio.load(html);

    const articleLinks = [];
    $('a[href*="nbs.D110000renmrb"]').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      if (href && text && text.length > 4) {
        const fullUrl = href.startsWith('http') ? href : config.SOURCES.peopleDaily.articlePrefix + 'rmrb/html/' + dateStr + '/' + href;
        articleLinks.push({ url: fullUrl, title: text });
      }
    });

    const keywords = ['法', '罪', '案', '判', '审', '纠纷', '违法', '侵权', '权益', '安全', '事故', '责任', '社会', '民生'];
    const filtered = articleLinks
      .filter(a => keywords.some(k => a.title.includes(k)))
      .slice(0, 5);

    for (const article of filtered) {
      try {
        const articleHtml = await fetchText(article.url);
        const $a = cheerio.load(articleHtml);
        const title = $a('h1, h3, .article-title').first().text().trim() || article.title;
        const paragraphs = [];
        $a('p, .article-content p, #ozoom p').each((_, p) => {
          const t = $a(p).text().trim();
          if (t.length > 20) paragraphs.push(t);
        });
        const summary = paragraphs.slice(0, 2).join('');
        results.push({
          source: '人民日报',
          title,
          summary: summary.slice(0, 150) || '暂无摘要',
          url: article.url,
        });
      } catch (e) {
        results.push({
          source: '人民日报',
          title: article.title,
          summary: '',
          url: article.url,
        });
      }
    }
    console.log(`[lawService] 人民日报采集到 ${results.length} 条`);
  } catch (err) {
    console.error('[lawService] 人民日报采集失败:', err.message);
  }
  return results;
}

/**
 * 采集光明新闻（光明日报）文章
 */
async function fetchGuangmingNews() {
  const results = [];
  try {
    const html = await fetchText('https://www.gmw.cn/news/');
    const $ = cheerio.load(html);

    const keywords = ['法', '罪', '案', '判', '审', '纠纷', '违法', '侵权', '权益', '安全', '事故', '责任', '社会'];
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      if (href && text.length > 6 && keywords.some(k => text.includes(k))) {
        const fullUrl = href.startsWith('http') ? href : 'https://www.gmw.cn' + href;
        results.push({
          source: '光明新闻',
          title: text,
          summary: '',
          url: fullUrl,
        });
      }
    });
    console.log(`[lawService] 光明新闻采集到 ${results.length} 条`);
  } catch (err) {
    console.error('[lawService] 光明新闻采集失败:', err.message);
  }
  const seen = new Set();
  return results.filter(r => {
    if (seen.has(r.title)) return false;
    seen.add(r.title);
    return true;
  }).slice(0, 5);
}

/**
 * 采集解放日报文章
 */
async function fetchJiefangDaily() {
  const results = [];
  try {
    const html = await fetchText('https://www.shobserver.com/');
    const $ = cheerio.load(html);

    const keywords = ['法', '罪', '案', '判', '审', '纠纷', '违法', '侵权', '权益', '安全', '事故', '责任', '社会'];
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      if (href && text.length > 6 && keywords.some(k => text.includes(k))) {
        const fullUrl = href.startsWith('http') ? href : 'https://www.shobserver.com' + href;
        results.push({
          source: '解放日报',
          title: text,
          summary: '',
          url: fullUrl,
        });
      }
    });
    console.log(`[lawService] 解放日报采集到 ${results.length} 条`);
  } catch (err) {
    console.error('[lawService] 解放日报采集失败:', err.message);
  }
  const seen = new Set();
  return results.filter(r => {
    if (seen.has(r.title)) return false;
    seen.add(r.title);
    return true;
  }).slice(0, 5);
}

/**
 * 采集新华日报文章
 */
async function fetchXinhuaDaily() {
  const results = [];
  try {
    const html = await fetchText('https://www.xhby.net/');
    const $ = cheerio.load(html);

    const keywords = ['法', '罪', '案', '判', '审', '纠纷', '违法', '侵权', '权益', '安全', '事故', '责任', '社会'];
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      if (href && text.length > 6 && keywords.some(k => text.includes(k))) {
        const fullUrl = href.startsWith('http') ? href : 'https://www.xhby.net' + href;
        results.push({
          source: '新华日报',
          title: text,
          summary: '',
          url: fullUrl,
        });
      }
    });
    console.log(`[lawService] 新华日报采集到 ${results.length} 条`);
  } catch (err) {
    console.error('[lawService] 新华日报采集失败:', err.message);
  }
  const seen = new Set();
  return results.filter(r => {
    if (seen.has(r.title)) return false;
    seen.add(r.title);
    return true;
  }).slice(0, 5);
}

/**
 * 采集中国青年报文章
 */
async function fetchChinaYouthDaily() {
  const results = [];
  try {
    const html = await fetchText('https://www.cyol.com/');
    const $ = cheerio.load(html);

    const keywords = ['法', '罪', '案', '判', '审', '纠纷', '违法', '侵权', '权益', '安全', '事故', '责任', '社会', '青年'];
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      if (href && text.length > 6 && keywords.some(k => text.includes(k))) {
        const fullUrl = href.startsWith('http') ? href : 'https://www.cyol.com' + href;
        results.push({
          source: '中国青年报',
          title: text,
          summary: '',
          url: fullUrl,
        });
      }
    });
    console.log(`[lawService] 中国青年报采集到 ${results.length} 条`);
  } catch (err) {
    console.error('[lawService] 中国青年报采集失败:', err.message);
  }
  const seen = new Set();
  return results.filter(r => {
    if (seen.has(r.title)) return false;
    seen.add(r.title);
    return true;
  }).slice(0, 5);
}

/**
 * 从数组中随机选取 n 个元素（Fisher-Yates 洗牌）
 */
function randomPick(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

/**
 * 采集并生成每日法学内容
 * 从5个数据源中随机选取3篇，不与昨天重复
 */
async function collect() {
  console.log('[lawService] 开始采集法学热点...');

  // 并行采集所有数据源
  const [peopleNews, gmNews, jfNews, xhNews, cyNews] = await Promise.allSettled([
    fetchPeopleDaily(),
    fetchGuangmingNews(),
    fetchJiefangDaily(),
    fetchXinhuaDaily(),
    fetchChinaYouthDaily(),
  ]);

  let allNews = [];
  if (peopleNews.status === 'fulfilled') allNews = allNews.concat(peopleNews.value);
  if (gmNews.status === 'fulfilled') allNews = allNews.concat(gmNews.value);
  if (jfNews.status === 'fulfilled') allNews = allNews.concat(jfNews.value);
  if (xhNews.status === 'fulfilled') allNews = allNews.concat(xhNews.value);
  if (cyNews.status === 'fulfilled') allNews = allNews.concat(cyNews.value);

  // 如果采集不足 3 条，使用种子数据补充
  if (allNews.length < 3) {
    console.log('[lawService] 采集不足3条，使用种子数据补充');
    allNews = allNews.concat(getSeedData());
  }

  // 获取昨天的数据，避免重复
  const yesterdayData = db.getYesterdayData('law');
  let yesterdayTitles = [];
  if (yesterdayData && yesterdayData.items) {
    yesterdayTitles = yesterdayData.items.map(item => item.title);
  }

  // 过滤掉昨天的文章
  let availableNews = allNews.filter(n => !yesterdayTitles.includes(n.title));
  // 如果过滤后不足3条，使用全部文章
  if (availableNews.length < 3) {
    availableNews = allNews;
  }

  // 随机选取3篇
  const selected = randomPick(availableNews, 3);
  console.log(`[lawService] 今日选取 ${selected.length} 篇，来源: ${selected.map(s => s.source).join(', ')}`);

  // 生成法律解析
  const withAnalysis = legalAnalyzer.analyzeBatch(selected);

  // 格式化输出（URL统一改为百度搜索链接，避免原网站链接失效或打不开）
  return withAnalysis.map((item, idx) => ({
    id: idx + 1,
    source: item.source || '人民日报',
    date: new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }).replace(/\//g, '-'),
    title: item.title,
    summary: item.summary || '',
    legalAnalysis: item.legalAnalysis,
    url: searchUrl(item.title),
  }));
}

/**
 * 种子数据（采集失败时的后备）
 * 不存储具体URL，由collect()统一生成百度搜索链接
 */
function getSeedData() {
  return [
    {
      source: '人民日报',
      title: '高空抛物没砸到人也违法吗？',
      summary: '湖北宜昌长阳县人民法院审结一起因高空抛物引发的纠纷。法院认为，从高空抛掷物品，如果存在危害他人人身安全、公私财产安全或者公共安全危险的，无论是否造成实际损害，均属于违法。',
    },
    {
      source: '光明新闻',
      title: '最高法：判断外卖小哥与平台是否存在劳动关系，要看是否存在支配性劳动管理',
      summary: '最高人民法院发布新就业形态劳动争议专题指导性案例，明确平台企业与新就业形态劳动者之间的劳动关系认定规则。',
    },
    {
      source: '解放日报',
      title: '公告｜《上海市数据条例（草案）》公开征求意见',
      summary: '上海市人大常委会就《上海市数据条例（草案）》公开征求意见，为城市数字化转型提供基础性制度保障。',
    },
    {
      source: '新华日报',
      title: '26万条个人信息“直通黑市”，这家公司竟把转卖客户数据当“KPI”',
      summary: '宿迁经开区人民法院审理一起网络店铺非法出售公民个人信息案，提醒网络平台加强商家管理，保护好消费者个人信息。',
    },
    {
      source: '中国青年报',
      title: '严惩行业“内鬼”泄露个人信息',
      summary: '最高人民法院发布依法惩治侵犯公民个人信息犯罪典型案例，加强对行业“内鬼”泄露个人信息等违法犯罪行为的惩处力度。',
    },
    {
      source: '人民日报',
      title: '民法典让“高空抛物”无所遁形',
      summary: '民法典针对高空抛物做出明确规定，禁止从建筑物中抛掷物品，物业服务企业未采取安全保障措施的应承担相应责任。',
    },
    {
      source: '光明新闻',
      title: '骑手参保，探路灵活就业者权益保障',
      summary: '国家层面对新就业形态用工关系作出清晰区分，探索政府、平台和个人多方参与的灵活就业者社保保障模式。',
    },
    {
      source: '解放日报',
      title: '《上海市促进浦东新区数据流通交易若干规定（草案）》征求民意',
      summary: '上海就促进浦东新区数据流通交易若干规定草案征求民意，探索数据产权分置机制和交易规则。',
    },
    {
      source: '新华日报',
      title: '倒卖12万条个人信息！检察办案揭秘网贷公司背后的黑产',
      summary: '涉案公司因倒卖个人信息被判处高额罚金和公益损害赔偿，并被判决删除非法获取的公民个人信息。',
    },
    {
      source: '中国青年报',
      title: '冒用客户信息办居住证 链家及员工被判赔偿十万元',
      summary: '链家公司及员工因冒用客户信息办理居住证被判公开赔礼道歉并连带赔偿10万元，反映企业信息保管漏洞。',
    },
  ];
}

module.exports = { collect, getSeedData, searchUrl };
