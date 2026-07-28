/**
 * weili App 前端逻辑 v2
 * 支持：层级任务、自主添加子目/大项、我的、复盘、音乐推荐
 */

// ===== 全局状态 =====
const state = {
  currentPage: 'today',
  tasks: {},
  expandedGroups: {},
  data: {
    law: null,
    geography: null,
    podcast: null,
    music: null,
    musicRecommendation: null,
  },
  modalContext: null, // { type: 'task'|'subitem'|'nav', category, parentId }
};

// ===== B站音乐推荐视频池 (UP主: JLRS-LeoFM) =====
const MUSIC_VIDEO_POOL = [
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

// ===== 降级数据（无后端时使用） =====
const FALLBACK_DATA = {
  music: {
    title: '小星星', subtitle: 'C大调 4/4拍 · 英国民歌',
    notation: '1 1 5 5 | 6 6 5 - | 4 4 3 3 | 2 2 1 - |',
    solfege: 'do do sol sol | la la sol - | fa fa mi mi | re re do - |',
    tip: '最经典的入门曲，练习 do-sol 的音程跳跃',
    difficulty: '入门',
    videoUrl: 'https://www.bilibili.com/video/BV1LvqpBEEXq/',
  },
  law: {
    items: [
      { source: '人民日报', title: '高空抛物没砸到人也违法吗？', summary: '湖北宜昌长阳县人民法院审结一起因高空抛物引发的纠纷。法院认为，从高空抛掷物品，如果存在危害他人人身安全、公私财产安全或者公共安全危险的，无论是否造成实际损害，均属于违法。', url: 'https://society.people.com.cn/n1/2026/0727/c1008-40768248.html', legalAnalysis: { law: '《民法典》第1254条、《治安管理处罚法》', analysis: '从建筑物抛掷物品，无论是否造成实际损害，只要存在危害他人或公共安全危险的，即属违法；情节严重的还可能承担刑事责任。' } },
      { source: '光明日报', title: '最高法：判断外卖小哥与平台是否存在劳动关系，要看是否存在支配性劳动管理', summary: '最高人民法院发布新就业形态劳动争议专题指导性案例，明确平台企业与新就业形态劳动者之间的劳动关系认定规则。', url: 'https://m.gmw.cn/gmsogh/202412/23/37754327.html', legalAnalysis: { law: '《劳动法》及最高法指导性案例', analysis: '判断劳动关系应抓住本质特征，即是否存在支配性劳动管理；不能仅因签订承揽协议或注册为个体工商户就否定劳动关系。' } },
      { source: '中国青年报', title: '严惩行业“内鬼”泄露个人信息', summary: '最高人民法院发布依法惩治侵犯公民个人信息犯罪典型案例，加强对行业“内鬼”泄露个人信息等违法犯罪行为的惩处力度。', url: 'https://zqb.cyol.com/pc/content/202605/09/content_425561.html', legalAnalysis: { law: '《个人信息保护法》第66条、第70条', analysis: '违反国家规定出售或提供公民个人信息，情节严重的构成犯罪；行业“内鬼”利用职务便利泄露信息的应依法从重处罚。' } },
    ],
  },
  geography: {
    featured: {
      source: '中国国家地理',
      title: '出发G331！北境寻秋3000里',
      summary: '一条超级边境走廊，横跨四个时区，纵越寒温带、中温带与暖温带。在吉林段331国道绵延1314公里，串联长白山、三江流域与中朝边境线，是一首浪漫的秋日史诗。',
      url: 'https://news.qq.com/rain/a/20250909A06PEM00',
    },
    pastRecommendations: [
      { date: '07-27', title: '天山，被打穿了？！', url: 'https://www.163.com/dy/article/KHN14MHV0524A2BA.html', source: '星球研究所' },
      { date: '07-26', title: '2025十大自然地理热点事件盘点', url: 'https://www.163.com/dy/article/KHNLDAPL0512VPKM.html', source: '侠客地理' },
      { date: '07-25', title: '中国国家地理2026年03期：东北是中国自然省最密集的地方', url: 'https://www.dili360.com/cng/mag/detail/1003.htm', source: '中国国家地理中文网' },
    ],
  },
  podcast: {
    title: '我是如何快速学习一个领域的',
    author: '小Lin说', duration: '12:30', playCount: 890000,
    cover: '', description: 'UP主小Lin结合自身学习经验，系统讲解结构化思维：从多问为什么、时间线梳理到流程化拆解。',
    recommendReason: '帮助你建立快速掌握新领域的底层框架',
    url: 'https://www.bilibili.com/video/BV11o4y1s7VY/',
  },
};

// 客户端音乐推荐选取（不与昨天重复）
function clientSideMusicRecommendation() {
  const today = todayStr();
  const stored = JSON.parse(localStorage.getItem('weili-music-rec') || '{}');
  if (stored.date === today && stored.recommendation) {
    return { recommendation: stored.recommendation, totalVideos: MUSIC_VIDEO_POOL.length };
  }
  // 昨天的bvid
  const yesterdayBvid = stored.recommendation ? stored.recommendation.bvid : null;
  let candidates = MUSIC_VIDEO_POOL;
  if (yesterdayBvid && candidates.length > 1) {
    candidates = candidates.filter(v => v.bvid !== yesterdayBvid);
  }
  const selected = candidates[Math.floor(Math.random() * candidates.length)];
  const rec = {
    title: selected.title, bvid: selected.bvid,
    url: 'https://www.bilibili.com/video/' + selected.bvid,
    cover: selected.cover, duration: selected.duration, play: selected.play,
    author: 'JLRS-LeoFM', authorUrl: 'https://space.bilibili.com/3493093607213343',
    source: 'B站',
  };
  localStorage.setItem('weili-music-rec', JSON.stringify({ date: today, recommendation: rec }));
  return { recommendation: rec, totalVideos: MUSIC_VIDEO_POOL.length };
}

// ===== 默认任务定义（无时间） =====
const DEFAULT_TASKS = {
  exercise: [
    {
      id: 'ex-stretch', name: '拉伸放松', desc: '舒缓肌肉紧张', type: 'group',
      subItems: [
        { id: 'ex-stretch-d1', name: '拉伸放松视频', url: 'https://www.bilibili.com/video/BV1Yk4y1d7Wn/?spm_id_from=333.337.search-card.all.click&vd_source=bb863adf8ea80ee8496fcfbbf78f95da' },
      ],
    },
    {
      id: 'ex-strength', name: '力量训练', desc: '核心或上肢力量练习', type: 'group',
      subItems: [
        { id: 'ex-strength-d1', name: '力量训练视频一', url: 'https://www.bilibili.com/video/BV1eK4y1t7zi/?spm_id_from=333.337.search-card.all.click&vd_source=bb863adf8ea80ee8496fcfbbf78f95da' },
        { id: 'ex-strength-d2', name: '力量训练视频二', url: 'https://www.bilibili.com/video/BV19WQTB6Exq/?spm_id_from=333.337.search-card.all.click&vd_source=bb863adf8ea80ee8496fcfbbf78f95da' },
      ],
    },
  ],
  english: [],
  music: [
    { id: 'mu-practice', name: '练习今日推荐曲目', desc: '简谱视唱练习', type: 'task' },
  ],
  geography: [
    { id: 'geo-read', name: '阅读今日地理文章', desc: '了解中国地理奇观', type: 'task' },
  ],
  law: [
    { id: 'law-read1', name: '阅读法学文章一', desc: '社会热点 + 法律解析', type: 'task' },
    { id: 'law-read2', name: '阅读法学文章二', desc: '社会热点 + 法律解析', type: 'task' },
    { id: 'law-read3', name: '阅读法学文章三', desc: '社会热点 + 法律解析', type: 'task' },
  ],
  podcast: [
    { id: 'pod-watch', name: '观看今日播客', desc: '学习成长类视频', type: 'task' },
  ],
};

// ===== 自定义数据管理（localStorage） =====
function loadCustomData() {
  try {
    return JSON.parse(localStorage.getItem('weili-custom') || '{}');
  } catch {
    return {};
  }
}

function saveCustomData(data) {
  localStorage.setItem('weili-custom', JSON.stringify(data));
}

function getCustomTasks(category) {
  const data = loadCustomData();
  return (data.tasks && data.tasks[category]) || [];
}

function getCustomSubItems(parentId) {
  const data = loadCustomData();
  return (data.subItems && data.subItems[parentId]) || [];
}

function getCustomNav() {
  const data = loadCustomData();
  return data.nav || [];
}

function getCustomPageContent(pageId) {
  const data = loadCustomData();
  return (data.navPages && data.navPages[pageId]) || { text: '', images: [] };
}

function getAllTasks() {
  // 合并默认任务和自定义任务
  const result = {};
  for (const cat of Object.keys(DEFAULT_TASKS)) {
    result[cat] = [...DEFAULT_TASKS[cat], ...getCustomTasks(cat)];
  }
  return result;
}

function getAllTaskIds() {
  const allTasks = getAllTasks();
  const ids = [];
  for (const cat of Object.keys(allTasks)) {
    for (const t of allTasks[cat]) {
      ids.push(t.id);
      if (t.type === 'group') {
        const defaultSubs = t.subItems || [];
        const customSubs = getCustomSubItems(t.id);
        const allSubs = [...defaultSubs, ...customSubs];
        for (const s of allSubs) {
          ids.push(s.id);
        }
      }
    }
  }
  return ids;
}

// ===== 任务完成状态（localStorage） =====
function loadTasks() {
  try {
    const today = todayStr();
    const stored = JSON.parse(localStorage.getItem('weili-tasks') || '{}');
    if (stored.date !== today) {
      state.tasks = {};
      saveTasks();
    } else {
      state.tasks = stored.tasks || {};
    }
  } catch {
    state.tasks = {};
  }
}

function saveTasks() {
  localStorage.setItem('weili-tasks', JSON.stringify({
    date: todayStr(),
    tasks: state.tasks,
  }));
}

function toggleTask(taskId) {
  state.tasks[taskId] = !state.tasks[taskId];
  saveTasks();
  renderTasks();
  updateTaskCounter();
}

function toggleSubItem(subId) {
  state.tasks[subId] = !state.tasks[subId];
  saveTasks();
  renderTasks();
  updateTaskCounter();
}

function getCompletedCount() {
  return getAllTaskIds().filter(id => state.tasks[id]).length;
}

function getTotalCount() {
  return getAllTaskIds().length;
}

// ===== 图片压缩工具 =====
function compressImage(file, maxWidth = 1280, quality = 0.7) {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = Math.round(h * maxWidth / w);
          w = maxWidth;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

function viewImage(src) {
  let lightbox = document.getElementById('lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.className = 'lightbox';
    lightbox.innerHTML = '<img id="lightbox-img" src="" alt="预览"><button class="lightbox-close" onclick="closeLightbox()">✕</button>';
    document.body.appendChild(lightbox);
    lightbox.addEventListener('click', closeLightbox);
  }
  document.getElementById('lightbox-img').src = src;
  lightbox.classList.add('active');
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (lightbox) lightbox.classList.remove('active');
}

// ===== 日期工具 =====
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatDateCN() {
  const d = new Date();
  const weekdays = ['日','一','二','三','四','五','六'];
  return `${d.getMonth()+1}月${d.getDate()}日 星期${weekdays[d.getDay()]}`;
}

// ===== 初始化 =====
function init() {
  loadTasks();
  renderTodayDate();
  renderTodayCards();
  renderTasks();
  renderCustomNav();
  bindEvents();
  loadProfile();
  updateSidebarHeader();
  loadReview();
  initAliveDays();
  initCalendar();
  initClock();
  loadCountdowns();
  fetchAllData();
}

// ===== 渲染 =====
function renderTodayDate() {
  document.getElementById('today-date').textContent = formatDateCN();
}

function renderTodayCards() {
  const cards = [
    { page: 'exercise', icon: '🏃', iconClass: 'exercise', title: '运动', desc: '今日运动任务' },
    { page: 'music', icon: '🎵', iconClass: 'music', title: '音乐', desc: '每日简谱 + 音乐推荐' },
    { page: 'english', icon: '📖', iconClass: 'english', title: '英语学习', desc: '背单词 + 听力' },
    { page: 'geography', icon: '🌍', iconClass: 'geography', title: '地理文章推荐', desc: '每日精选文章' },
    { page: 'law', icon: '⚖️', iconClass: 'law', title: '每日法学', desc: '社会热点解析' },
    { page: 'podcast', icon: '🎬', iconClass: 'podcast', title: '播客推荐', desc: 'B站学习视频' },
  ];

  const container = document.getElementById('today-cards');
  let html = cards.map(c => `
    <div class="today-card" onclick="navigateTo('${c.page}')">
      <div class="card-icon ${c.iconClass}">${c.icon}</div>
      <div class="card-title">${c.title}</div>
      <div class="card-desc">${c.desc}</div>
      <div class="card-arrow">›</div>
    </div>
  `).join('');

  // 添加自定义导航项的卡片
  const customNav = getCustomNav();
  customNav.forEach(nav => {
    html += `
      <div class="today-card" onclick="navigateTo('${nav.id}')">
        <div class="card-icon custom">${nav.icon}</div>
        <div class="card-title">${nav.label}</div>
        <div class="card-desc">自定义页面</div>
        <div class="card-arrow">›</div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function renderTasks() {
  renderTaskList('exercise-tasks', 'exercise');
  renderTaskList('english-tasks', 'english');
}

function renderTaskList(containerId, category) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const tasks = [...(DEFAULT_TASKS[category] || []), ...getCustomTasks(category)];

  container.innerHTML = tasks.map(t => {
    if (t.type === 'group') {
      return renderTaskGroup(t, category);
    }
    return renderSimpleTask(t);
  }).join('');
}

function renderSimpleTask(t) {
  const done = state.tasks[t.id];
  return `
    <div class="task-item ${done ? 'done' : ''}" onclick="toggleTask('${t.id}')">
      <div class="task-checkbox"></div>
      <div class="task-content">
        <div class="task-name">${t.name}</div>
        ${t.desc ? `<div class="task-desc">${t.desc}</div>` : ''}
      </div>
      ${t.url ? `<a href="${t.url}" target="_blank" rel="noopener" class="sub-item-arrow" onclick="event.stopPropagation()">›</a>` : ''}
      ${t.custom ? `<button class="task-delete-btn" onclick="event.stopPropagation(); deleteCustomTask('${t.id}', event)">✕</button>` : ''}
    </div>
  `;
}

function renderTaskGroup(t, category) {
  const done = state.tasks[t.id];
  const expanded = state.expandedGroups[t.id];
  const defaultSubs = t.subItems || [];
  const customSubs = getCustomSubItems(t.id);
  const allSubs = [...defaultSubs, ...customSubs];

  return `
    <div class="task-group ${expanded ? 'expanded' : ''}" id="group-${t.id}">
      <div class="task-group-header" onclick="toggleGroup('${t.id}')">
        <div class="task-checkbox ${done ? 'checked' : ''}" onclick="event.stopPropagation(); toggleTask('${t.id}')"></div>
        <div class="task-group-content">
          <div class="task-group-name">${t.name}</div>
        </div>
        ${t.custom ? `<button class="task-delete-btn" onclick="event.stopPropagation(); deleteCustomTask('${t.id}', event)">✕</button>` : ''}
        <span class="task-group-arrow">›</span>
      </div>
      <div class="task-group-body">
        ${allSubs.map(s => {
          const subDone = state.tasks[s.id];
          return `
          <div class="sub-item ${subDone ? 'sub-done' : ''}">
            <div class="task-checkbox ${subDone ? 'checked' : ''}" onclick="event.stopPropagation(); toggleSubItem('${s.id}')"></div>
            ${s.url
              ? `<a href="${s.url}" target="_blank" rel="noopener" class="sub-item-link">
                   <span class="sub-item-name">${s.name}</span>
                   <span class="sub-item-arrow">›</span>
                 </a>`
              : `<div class="sub-item-link">
                   <span class="sub-item-name">${s.name}</span>
                 </div>`
            }
            ${s.custom ? `<button class="sub-item-delete" onclick="event.stopPropagation(); deleteSubItem('${t.id}', '${s.id}', event)">✕</button>` : ''}
          </div>
          `;
        }).join('')}
        <button class="add-sub-btn" onclick="openAddSubItemModal('${t.id}')">
          <span>＋</span> 添加小子目
        </button>
      </div>
    </div>
  `;
}

function toggleGroup(groupId) {
  state.expandedGroups[groupId] = !state.expandedGroups[groupId];
  const el = document.getElementById(`group-${groupId}`);
  if (el) {
    el.classList.toggle('expanded');
  }
}

function updateTaskCounter() {
  const completed = getCompletedCount();
  const total = getTotalCount();
  const countEl = document.getElementById('task-count');
  const totalEl = document.getElementById('task-total');
  const barEl = document.getElementById('progress-bar');

  animateNumber(countEl, parseInt(countEl.textContent) || 0, completed);
  totalEl.textContent = total;
  barEl.style.width = total > 0 ? `${(completed / total) * 100}%` : '0%';
}

function animateNumber(el, from, to) {
  if (from === to) { el.textContent = to; return; }
  const step = from < to ? 1 : -1;
  let current = from;
  const timer = setInterval(() => {
    current += step;
    el.textContent = current;
    if (current === to) clearInterval(timer);
  }, 80);
}

// ===== 导航 =====
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`page-${page}`);
  if (target) {
    target.classList.add('active');
  } else {
    // 自定义页面 - 检查是否已创建
    let customPage = document.getElementById(`page-${page}`);
    if (!customPage) {
      createCustomPage(page);
      customPage = document.getElementById(`page-${page}`);
    }
    if (customPage) customPage.classList.add('active');
  }

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');

  state.currentPage = page;
  closeSidebar();
  document.getElementById('page-container').scrollTo({ top: 0, behavior: 'smooth' });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  loadPageData(page);
}

// ===== 侧栏 =====
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-overlay').classList.remove('hidden');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.add('hidden');
}

// ===== 自定义导航项 =====
function renderCustomNav() {
  const nav = getCustomNav();
  const navContainer = document.getElementById('sidebar-nav');
  // 移除已有的自定义导航项
  navContainer.querySelectorAll('.nav-item-custom').forEach(el => el.remove());

  nav.forEach(item => {
    const el = document.createElement('a');
    el.className = 'nav-item nav-item-custom';
    el.dataset.page = item.id;
    el.innerHTML = `
      <span class="nav-icon">${item.icon}</span>
      <span class="nav-label">${item.label}</span>
      <button class="nav-delete-btn" onclick="event.stopPropagation(); deleteCustomNav('${item.id}')">✕</button>
    `;
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(item.id);
    });
    navContainer.appendChild(el);
  });
}

function createCustomPage(pageId) {
  const nav = getCustomNav().find(n => n.id === pageId);
  if (!nav) return;

  const pageDiv = document.createElement('div');
  pageDiv.id = `page-${pageId}`;
  pageDiv.className = 'page';
  pageDiv.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">${nav.label}</h1>
    </div>
    <div class="custom-page-content">
      <label class="profile-label">内容</label>
      <textarea class="custom-textarea" id="custom-text-${pageId}" placeholder="写下你的内容..." oninput="saveCustomPageText('${pageId}')"></textarea>
      <div class="review-images-section">
        <label class="profile-label">图片</label>
        <div class="review-images-grid" id="custom-images-${pageId}"></div>
        <button class="upload-img-btn" onclick="document.getElementById('custom-img-input-${pageId}').click()">
          <span>📷</span> 上传图片
        </button>
        <input type="file" id="custom-img-input-${pageId}" accept="image/*" multiple style="display:none" onchange="handleCustomImageUpload(event, '${pageId}')">
      </div>
    </div>
  `;
  document.getElementById('page-container').appendChild(pageDiv);

  // 加载已有内容
  const content = getCustomPageContent(pageId);
  document.getElementById(`custom-text-${pageId}`).value = content.text || '';
  renderCustomImages(pageId);
}

function renderCustomImages(pageId) {
  const content = getCustomPageContent(pageId);
  const grid = document.getElementById(`custom-images-${pageId}`);
  if (!grid) return;

  const images = content.images || [];
  grid.innerHTML = images.map((img, idx) => `
    <div class="review-image-item">
      <img src="${img}" alt="图片${idx+1}" data-img-idx="${idx}" class="review-clickable-img">
      <button class="review-image-delete" onclick="event.stopPropagation(); deleteCustomImage('${pageId}', ${idx})">✕</button>
    </div>
  `).join('');

  // 事件委托：点击图片预览
  grid.querySelectorAll('.review-clickable-img').forEach(el => {
    el.addEventListener('click', function() {
      viewImage(images[parseInt(this.dataset.imgIdx)]);
    });
  });
}

function saveCustomPageText(pageId) {
  const data = loadCustomData();
  if (!data.navPages) data.navPages = {};
  if (!data.navPages[pageId]) data.navPages[pageId] = { text: '', images: [] };
  data.navPages[pageId].text = document.getElementById(`custom-text-${pageId}`).value;
  saveCustomData(data);
}

async function handleCustomImageUpload(event, pageId) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  const data = loadCustomData();
  if (!data.navPages) data.navPages = {};
  if (!data.navPages[pageId]) data.navPages[pageId] = { text: '', images: [] };
  if (!data.navPages[pageId].images) data.navPages[pageId].images = [];

  showToast('正在处理图片...');
  for (const file of Array.from(files)) {
    const compressed = await compressImage(file, 1280, 0.7);
    if (compressed) data.navPages[pageId].images.push(compressed);
  }
  saveCustomData(data);
  renderCustomImages(pageId);
  showToast(`已添加 ${files.length} 张图片`);
  event.target.value = '';
}

function deleteCustomImage(pageId, idx) {
  const data = loadCustomData();
  if (data.navPages && data.navPages[pageId] && data.navPages[pageId].images) {
    data.navPages[pageId].images.splice(idx, 1);
    saveCustomData(data);
    renderCustomImages(pageId);
  }
}

function deleteCustomNav(navId) {
  if (!confirm('确定删除这个大项吗？相关内容也会被删除。')) return;
  const data = loadCustomData();
  data.nav = (data.nav || []).filter(n => n.id !== navId);
  if (data.navPages) delete data.navPages[navId];
  saveCustomData(data);
  renderCustomNav();
  renderTodayCards();
  // 如果当前在这个页面，跳回今日
  if (state.currentPage === navId) navigateTo('today');
  showToast('已删除');
}

// ===== 我的页面 =====
function loadProfile() {
  const data = loadCustomData();
  const profile = data.profile || { name: '', avatar: '' };

  const nameInput = document.getElementById('profile-name-input');
  if (nameInput) nameInput.value = profile.name || '';

  const avatarDisplay = document.getElementById('profile-avatar-display');
  if (avatarDisplay) {
    if (profile.avatar) {
      avatarDisplay.innerHTML = `<img src="${profile.avatar}" alt="头像">`;
    } else {
      avatarDisplay.innerHTML = '<span class="avatar-placeholder">点击上传头像</span>';
    }
  }
}

function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const data = loadCustomData();
    if (!data.profile) data.profile = { name: '', avatar: '' };
    data.profile.avatar = e.target.result;
    saveCustomData(data);
    loadProfile();
    showToast('头像已更新');
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function saveProfile() {
  const data = loadCustomData();
  if (!data.profile) data.profile = { name: '', avatar: '' };
  data.profile.name = document.getElementById('profile-name-input').value.trim();
  saveCustomData(data);
  updateSidebarHeader();
  showToast('保存成功');
}

// ===== 侧栏标题更新 =====
function updateSidebarHeader() {
  const data = loadCustomData();
  const name = (data.profile && data.profile.name) || '';
  const el = document.getElementById('sidebar-username');
  if (el) {
    el.textContent = name ? `Hi~${name}` : 'Hi~';
  }
}

// ===== 百词斩 App 跳转 =====
function openBaicizhan() {
  const isAndroid = /android/i.test(navigator.userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const appStoreUrl = 'https://apps.apple.com/cn/app/%E7%99%BE%E8%AF%8D%E6%96%A9-%E8%83%8C%E5%8D%95%E8%AF%8D%E5%AD%A6%E8%8B%B1%E8%AF%AD%E5%BF%85%E5%A4%87/id709685760';
  const webUrl = 'https://www.baicizhan.com/';
  // 百词斩当前包名为 com.jiongji.andriod.card（旧版为 com.jiongji.andriod.box）
  const BAICIZHAN_PACKAGE = 'com.jiongji.andriod.card';

  let opened = false;

  // 监听页面可见性变化（App打开后页面会隐藏）
  function onVisibilityChange() {
    if (document.hidden) opened = true;
  }
  document.addEventListener('visibilitychange', onVisibilityChange);

  if (isAndroid) {
    // 用 intent 协议拉起原生 App，包名正确时直接打开百词斩
    // 失败降级到官网（而非 Play Store，国内手机通常没有 Play Store）
    const fallback = encodeURIComponent(webUrl);
    window.location.href = 'intent://#Intent;scheme=bcz;package=' + BAICIZHAN_PACKAGE + ';S.browser_fallback_url=' + fallback + ';end';
  } else if (isIOS) {
    // iOS 用 URL Scheme，2秒后降级到 App Store
    window.location.href = 'bcz://';
  } else {
    // 桌面端直接打开官网
    window.open(webUrl, '_blank');
    return;
  }

  // 2秒后检查是否成功打开，未打开则降级
  setTimeout(() => {
    document.removeEventListener('visibilitychange', onVisibilityChange);
    if (opened) return; // App 已打开，不降级
    if (isIOS) {
      window.location.href = appStoreUrl;
    } else if (isAndroid) {
      // intent 降级失败时兜底，跳官网
      window.location.href = webUrl;
    }
  }, 2000);
}

// ===== 复盘页面（支持往期记录） =====
function loadReview() {
  const data = loadCustomData();

  // 兼容旧数据迁移
  if (data.review && data.review.text && !data.reviewEntries) {
    data.reviewEntries = [{
      id: Date.now(),
      date: new Date().toISOString(),
      text: data.review.text,
      images: data.review.images || [],
    }];
    delete data.review;
    saveCustomData(data);
  }
  if (!data.reviewEntries) data.reviewEntries = [];
  if (!data.reviewDraft) data.reviewDraft = { text: '', images: [] };

  // 恢复草稿
  const textEl = document.getElementById('review-text');
  if (textEl) textEl.value = data.reviewDraft.text || '';
  renderReviewImages(data.reviewDraft.images || []);

  // 渲染往期列表
  renderReviewHistory(data.reviewEntries);
}

function renderReviewImages(images) {
  const grid = document.getElementById('review-images-grid');
  if (!grid) return;

  grid.innerHTML = images.map((img, idx) => `
    <div class="review-image-item">
      <img src="${img}" alt="复盘图片${idx+1}" data-img-idx="${idx}" class="review-clickable-img">
      <button class="review-image-delete" onclick="event.stopPropagation(); deleteReviewImage(${idx})">✕</button>
    </div>
  `).join('');

  // 事件委托：点击图片预览（避免 base64 放在 inline onclick 中出错）
  grid.querySelectorAll('.review-clickable-img').forEach(el => {
    el.addEventListener('click', function() {
      viewImage(images[parseInt(this.dataset.imgIdx)]);
    });
  });
}

async function handleReviewImageUpload(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  const data = loadCustomData();
  if (!data.reviewDraft) data.reviewDraft = { text: '', images: [] };
  if (!data.reviewDraft.images) data.reviewDraft.images = [];

  showToast('正在处理图片...');
  for (const file of Array.from(files)) {
    const compressed = await compressImage(file, 1280, 0.7);
    if (compressed) data.reviewDraft.images.push(compressed);
  }
  saveCustomData(data);
  renderReviewImages(data.reviewDraft.images);
  showToast(`已添加 ${files.length} 张图片`);
  event.target.value = '';
}

function deleteReviewImage(idx) {
  const data = loadCustomData();
  if (data.reviewDraft && data.reviewDraft.images) {
    data.reviewDraft.images.splice(idx, 1);
    saveCustomData(data);
    renderReviewImages(data.reviewDraft.images);
  }
}

function saveReview() {
  const text = document.getElementById('review-text').value.trim();
  const data = loadCustomData();
  if (!data.reviewEntries) data.reviewEntries = [];
  if (!data.reviewDraft) data.reviewDraft = { text: '', images: [] };

  if (!text && (!data.reviewDraft.images || data.reviewDraft.images.length === 0)) {
    showToast('请输入复盘内容或上传图片');
    return;
  }

  // 创建新条目
  const now = new Date();
  const entry = {
    id: Date.now(),
    date: now.toISOString(),
    text: text,
    images: data.reviewDraft.images || [],
  };
  data.reviewEntries.unshift(entry); // 最新的放最前

  // 清空草稿
  data.reviewDraft = { text: '', images: [] };
  saveCustomData(data);

  // 刷新界面
  document.getElementById('review-text').value = '';
  renderReviewImages([]);
  renderReviewHistory(data.reviewEntries);
  showToast('复盘已保存');
}

function renderReviewHistory(entries) {
  const list = document.getElementById('review-history-list');
  if (!list) return;

  if (!entries || entries.length === 0) {
    list.innerHTML = '<div class="review-empty">暂无往期复盘记录</div>';
    return;
  }

  list.innerHTML = entries.map((entry, entryIdx) => {
    const d = new Date(entry.date);
    const dateStr = formatReviewDate(d);
    const imgsHtml = (entry.images || []).map((img, imgIdx) => `<img src="${img}" alt="复盘图片" class="review-history-img" data-entry-idx="${entryIdx}" data-img-idx="${imgIdx}">`).join('');
    const textHtml = entry.text ? `<div class="review-history-text">${escapeHtml(entry.text)}</div>` : '';
    const imgsSection = imgsHtml ? `<div class="review-history-images">${imgsHtml}</div>` : '';

    return `
      <div class="review-history-item">
        <div class="review-history-header">
          <span class="review-history-date">📅 ${dateStr}</span>
          <button class="review-history-delete" onclick="deleteReviewEntry(${entry.id})">🗑️</button>
        </div>
        ${textHtml}
        ${imgsSection}
      </div>
    `;
  }).join('');

  // 事件委托：点击往期图片预览
  list.querySelectorAll('.review-history-img').forEach(el => {
    el.addEventListener('click', function() {
      const eIdx = parseInt(this.dataset.entryIdx);
      const iIdx = parseInt(this.dataset.imgIdx);
      const img = entries[eIdx] && entries[eIdx].images && entries[eIdx].images[iIdx];
      if (img) viewImage(img);
    });
  });
}

function deleteReviewEntry(id) {
  if (!confirm('确定删除这条复盘记录吗？')) return;
  const data = loadCustomData();
  if (data.reviewEntries) {
    data.reviewEntries = data.reviewEntries.filter(e => e.id !== id);
    saveCustomData(data);
    renderReviewHistory(data.reviewEntries);
    showToast('已删除');
  }
}

function formatReviewDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  return `${y}年${m}月${day}日 周${weekdays[d.getDay()]} ${h}:${min}`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML.replace(/\n/g, '<br>');
}

// ===== 弹窗管理 =====
function openAddTaskModal(category) {
  state.modalContext = { type: 'task', category };
  document.getElementById('modal-title').textContent = category === 'exercise' ? '添加运动项目' : '添加学习项目';
  document.getElementById('modal-name-input').value = '';
  document.getElementById('modal-url-input').value = '';
  document.getElementById('modal-url-field').style.display = 'flex';
  document.getElementById('modal-icon-field').style.display = 'none';
  document.getElementById('add-modal').classList.remove('hidden');
  setTimeout(() => document.getElementById('modal-name-input').focus(), 100);
}

function openAddSubItemModal(parentId) {
  state.modalContext = { type: 'subitem', parentId };
  document.getElementById('modal-title').textContent = '添加小子目';
  document.getElementById('modal-name-input').value = '';
  document.getElementById('modal-url-input').value = '';
  document.getElementById('modal-url-field').style.display = 'flex';
  document.getElementById('modal-icon-field').style.display = 'none';
  document.getElementById('add-modal').classList.remove('hidden');
  setTimeout(() => document.getElementById('modal-name-input').focus(), 100);
}

function openAddNavModal() {
  state.modalContext = { type: 'nav' };
  document.getElementById('modal-title').textContent = '添加大项';
  document.getElementById('modal-name-input').value = '';
  document.getElementById('modal-url-input').value = '';
  document.getElementById('modal-url-field').style.display = 'none';
  document.getElementById('modal-icon-field').style.display = 'flex';
  document.getElementById('add-modal').classList.remove('hidden');
  setTimeout(() => document.getElementById('modal-name-input').focus(), 100);
}

function closeAddModal() {
  document.getElementById('add-modal').classList.add('hidden');
  state.modalContext = null;
}

function confirmAdd() {
  const name = document.getElementById('modal-name-input').value.trim();
  if (!name) {
    showToast('请输入名称');
    return;
  }
  const url = document.getElementById('modal-url-input').value.trim();
  const ctx = state.modalContext;
  if (!ctx) return;

  const data = loadCustomData();

  if (ctx.type === 'task') {
    if (!data.tasks) data.tasks = {};
    if (!data.tasks[ctx.category]) data.tasks[ctx.category] = [];
    const newTask = {
      id: `custom-${ctx.category}-${Date.now()}`,
      name,
      desc: url ? '点击跳转' : '',
      type: 'task',
      url: url || undefined,
      custom: true,
    };
    data.tasks[ctx.category].push(newTask);
    saveCustomData(data);
    renderTasks();
    updateTaskCounter();
    showToast('添加成功');
  } else if (ctx.type === 'subitem') {
    if (!data.subItems) data.subItems = {};
    if (!data.subItems[ctx.parentId]) data.subItems[ctx.parentId] = [];
    data.subItems[ctx.parentId].push({
      id: `custom-sub-${Date.now()}`,
      name,
      url: url || undefined,
      custom: true,
    });
    saveCustomData(data);
    renderTasks();
    showToast('添加成功');
  } else if (ctx.type === 'nav') {
    const icon = document.getElementById('modal-icon-input').value.trim() || '📌';
    if (!data.nav) data.nav = [];
    const navId = `custom-nav-${Date.now()}`;
    data.nav.push({ id: navId, icon, label: name });
    if (!data.navPages) data.navPages = {};
    data.navPages[navId] = { text: '', images: [] };
    saveCustomData(data);
    renderCustomNav();
    renderTodayCards();
    showToast('大项添加成功');
  }

  closeAddModal();
}

function deleteCustomTask(taskId, event) {
  event.stopPropagation();
  if (!confirm('确定删除这个项目吗？')) return;
  const data = loadCustomData();
  if (data.tasks) {
    for (const cat of Object.keys(data.tasks)) {
      data.tasks[cat] = data.tasks[cat].filter(t => t.id !== taskId);
    }
  }
  if (data.subItems) delete data.subItems[taskId];
  delete state.tasks[taskId];
  saveTasks();
  saveCustomData(data);
  renderTasks();
  updateTaskCounter();
  showToast('已删除');
}

function deleteSubItem(parentId, subId, event) {
  event.stopPropagation();
  const data = loadCustomData();
  if (data.subItems && data.subItems[parentId]) {
    data.subItems[parentId] = data.subItems[parentId].filter(s => s.id !== subId);
    saveCustomData(data);
    renderTasks();
    showToast('已删除');
  }
}

// ===== Toast =====
let toastTimer = null;
function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.display = 'block';
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.display = 'none';
  }, 2000);
}

// ===== 事件绑定 =====
function bindEvents() {
  document.getElementById('menu-toggle').addEventListener('click', openSidebar);
  document.getElementById('sidebar-overlay').addEventListener('click', closeSidebar);
  document.querySelectorAll('.nav-item').forEach(item => {
    if (!item.classList.contains('nav-item-custom')) {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(item.dataset.page);
      });
    }
  });
  // 弹窗背景点击关闭
  document.getElementById('add-modal').addEventListener('click', (e) => {
    if (e.target.id === 'add-modal') closeAddModal();
  });
  // 回车确认
  document.getElementById('modal-name-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmAdd();
  });
  // 倒计时回车添加
  const cdNameInput = document.getElementById('countdown-name');
  if (cdNameInput) {
    cdNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addCountdown();
    });
  }

  // 复盘草稿自动保存
  const reviewTextEl = document.getElementById('review-text');
  if (reviewTextEl) {
    reviewTextEl.addEventListener('input', () => {
      const data = loadCustomData();
      if (!data.reviewDraft) data.reviewDraft = { text: '', images: [] };
      data.reviewDraft.text = reviewTextEl.value;
      saveCustomData(data);
    });
  }
}

// ===== 数据加载 =====
async function fetchAllData() {
  updateTaskCounter();
  fetchLaw();
  fetchGeography();
  fetchMusic();
  fetchMusicRecommendation();
  fetchPodcast();
}

function loadPageData(page) {
  switch (page) {
    case 'law': if (!state.data.law) fetchLaw(); break;
    case 'geography': if (!state.data.geography) fetchGeography(); break;
    case 'music':
      if (!state.data.music) fetchMusic();
      if (!state.data.musicRecommendation) fetchMusicRecommendation();
      break;
    case 'podcast': if (!state.data.podcast) fetchPodcast(); break;
  }
}

async function fetchLaw() {
  try {
    const resp = await fetch('/api/law');
    if (!resp.ok) throw new Error('API unavailable');
    const data = await resp.json();
    state.data.law = data;
    renderLaw(data);
  } catch (err) {
    // 降级：使用内置数据
    state.data.law = FALLBACK_DATA.law;
    renderLaw(FALLBACK_DATA.law);
  }
}

async function fetchGeography() {
  try {
    const resp = await fetch('/api/geography');
    if (!resp.ok) throw new Error('API unavailable');
    const data = await resp.json();
    state.data.geography = data;
    renderGeography(data);
  } catch (err) {
    // 降级：使用内置数据
    state.data.geography = FALLBACK_DATA.geography;
    renderGeography(FALLBACK_DATA.geography);
  }
}

async function fetchMusic() {
  try {
    const resp = await fetch('/api/music');
    if (!resp.ok) throw new Error('API unavailable');
    const data = await resp.json();
    state.data.music = data;
    renderMusic(data);
  } catch (err) {
    // 降级：使用内置数据
    state.data.music = FALLBACK_DATA.music;
    renderMusic(FALLBACK_DATA.music);
  }
}

async function fetchMusicRecommendation() {
  try {
    const resp = await fetch('/api/music-recommendation');
    if (!resp.ok) throw new Error('API unavailable');
    const data = await resp.json();
    state.data.musicRecommendation = data;
    renderMusicRecommendation(data);
  } catch (err) {
    // 降级：客户端本地选取（不与昨天重复）
    const data = clientSideMusicRecommendation();
    state.data.musicRecommendation = data;
    renderMusicRecommendation(data);
  }
}

async function fetchPodcast() {
  try {
    const resp = await fetch('/api/podcast');
    if (!resp.ok) throw new Error('API unavailable');
    const data = await resp.json();
    state.data.podcast = data;
    renderPodcast(data);
  } catch (err) {
    // 降级：使用内置数据
    state.data.podcast = FALLBACK_DATA.podcast;
    renderPodcast(FALLBACK_DATA.podcast);
  }
}

// ===== 渲染内容 =====
function renderLaw(data) {
  const container = document.getElementById('law-content');
  if (!container) return;

  const items = data.items || data || [];
  if (!Array.isArray(items) || items.length === 0) {
    container.innerHTML = '<div class="loading">暂无法学数据</div>';
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="law-article">
      <div class="law-article-header">
        <span class="law-article-source">${item.source || '未知来源'}</span>
      </div>
      <div class="law-article-title">
        ${item.url && item.url !== '#' ? `<a href="${item.url}" target="_blank" rel="noopener" class="law-title-link">${item.title || '无标题'}</a>` : (item.title || '无标题')}
      </div>
      ${item.summary ? `<div class="law-article-summary">${item.summary}</div>` : ''}
      ${item.legalAnalysis ? `
        <div class="law-analysis">
          <div class="law-analysis-label">⚖️ 法律解析</div>
          ${item.legalAnalysis.law ? `<div class="law-analysis-law">依据：${item.legalAnalysis.law}</div>` : ''}
          <div class="law-analysis-text">${item.legalAnalysis.analysis || item.legalAnalysis}</div>
        </div>
      ` : ''}
      ${item.url && item.url !== '#' ? `<a href="${item.url}" target="_blank" rel="noopener" class="article-link">阅读原文 ›</a>` : ''}
    </div>
  `).join('');
}

function renderGeography(data) {
  const container = document.getElementById('geography-content');
  if (!container) return;

  const featured = data.featured;
  if (!featured) {
    container.innerHTML = '<div class="loading">暂无地理数据</div>';
    return;
  }

  const past = data.pastRecommendations || [];

  container.innerHTML = `
    <div class="article-featured">
      <span class="article-source">${featured.source || '地理推荐'}</span>
      <div class="article-title">${featured.title || '无标题'}</div>
      ${featured.summary ? `<div class="article-summary">${featured.summary}</div>` : ''}
      ${featured.url && featured.url !== '#' ? `<a href="${featured.url}" target="_blank" rel="noopener" class="article-link">阅读全文 ›</a>` : ''}
    </div>
    ${past.length > 0 ? `
      <div class="article-past">
        <div class="article-past-title">往期推荐</div>
        ${past.map(p => `
          <div class="past-item">
            <span class="past-item-date">${p.date || ''}</span>
            <a href="${p.url || '#'}" target="_blank" rel="noopener" class="past-item-title">${p.title || '无标题'}</a>
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;
}

function renderMusic(data) {
  const container = document.getElementById('music-content');
  if (!container) return;

  if (!data || !data.title) {
    container.innerHTML = '<div class="loading">暂无音乐数据</div>';
    return;
  }

  container.innerHTML = `
    <div class="music-header">
      <div class="music-title">${data.title}</div>
      ${data.subtitle ? `<div class="music-subtitle">${data.subtitle}</div>` : ''}
    </div>
    ${data.difficulty ? `<div class="music-difficulty">${data.difficulty}</div>` : ''}
    ${data.notation ? `
      <div class="music-notation">${data.notation}</div>
      ${data.solfege ? `<div class="music-solfege">${data.solfege}</div>` : ''}
    ` : ''}
    ${data.tip ? `
      <div class="music-tip">
        <span>💡</span>
        <span>${data.tip}</span>
      </div>
    ` : ''}
    ${data.videoUrl ? `
      <a href="${data.videoUrl}" target="_blank" rel="noopener" class="music-video">
        <span>▶</span>
        <span>观看教学视频</span>
      </a>
    ` : ''}
  `;
}

function renderMusicRecommendation(data) {
  const container = document.getElementById('music-recommendation-content');
  if (!container) return;

  const rec = data.recommendation;
  if (!rec) {
    container.innerHTML = '<div class="loading">暂无音乐推荐</div>';
    return;
  }

  container.innerHTML = `
    <div class="music-rec-card">
      ${rec.cover ? `
        <div class="music-rec-cover">
          <img src="${rec.cover}" alt="${rec.title}" onerror="this.parentElement.style.display='none'">
        </div>
      ` : ''}
      <div class="music-rec-info">
        <div class="music-rec-title">${rec.title}</div>
        <div class="music-rec-meta">
          <a href="${rec.authorUrl || '#'}" target="_blank" rel="noopener">UP主: ${rec.author || 'JLRS-LeoFM'}</a>
          ${rec.duration ? `<span>时长: ${rec.duration}</span>` : ''}
          ${rec.play ? `<span>播放: ${formatNumber(rec.play)}</span>` : ''}
          <span>来源: ${rec.source || 'B站'}</span>
        </div>
      </div>
      <a href="${rec.url}" target="_blank" rel="noopener" class="music-rec-link">
        <span>▶</span>
        <span>在B站收听</span>
      </a>
    </div>
  `;
}

function renderPodcast(data) {
  const container = document.getElementById('podcast-content');
  if (!container) return;

  if (!data || !data.title) {
    container.innerHTML = '<div class="loading">暂无播客数据</div>';
    return;
  }

  container.innerHTML = `
    ${data.cover ? `
      <div class="podcast-cover">
        <img src="${data.cover}" alt="${data.title}" onerror="this.parentElement.style.display='none'">
      </div>
    ` : ''}
    <div class="podcast-title">${data.title}</div>
    <div class="podcast-meta">
      <span>UP主: ${data.author || '未知'}</span>
      ${data.duration ? `<span>时长: ${data.duration}</span>` : ''}
      ${data.playCount ? `<span>播放: ${formatNumber(data.playCount)}</span>` : ''}
    </div>
    ${data.description ? `<div class="podcast-desc">${data.description}</div>` : ''}
    ${data.recommendReason ? `<div class="podcast-reason">📌 ${data.recommendReason}</div>` : ''}
    ${data.url ? `
      <a href="${data.url}" target="_blank" rel="noopener" class="podcast-link">
        <span>▶</span>
        <span>在B站观看</span>
      </a>
    ` : ''}
  `;
}

function formatNumber(n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  return n.toString();
}

// ===== 日历功能 =====
let calendarDate = new Date(); // 当前显示的月份

function initClock() {
  updateClock();
  setInterval(updateClock, 1000);
}

function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const weekdays = ['日','一','二','三','四','五','六'];
  const dateStr = `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日 星期${weekdays[now.getDay()]}`;

  const timeEl = document.getElementById('clock-time');
  const dateEl = document.getElementById('clock-date');
  if (timeEl) timeEl.textContent = `${h}:${m}:${s}`;
  if (dateEl) dateEl.textContent = dateStr;
}

function initCalendar() {
  calendarDate = new Date();
  renderCalendar();
}

function renderCalendar() {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const today = new Date();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  // 获取倒计时日期集合，用于在日历上标黄
  const cdData = loadCustomData();
  const countdownDates = new Set();
  if (cdData.countdowns) {
    cdData.countdowns.forEach(cd => {
      const td = new Date(cd.targetDate);
      countdownDates.add(`${td.getFullYear()}-${td.getMonth()}-${td.getDate()}`);
    });
  }

  // 标题
  const titleEl = document.getElementById('calendar-title');
  if (titleEl) titleEl.textContent = `${year}年${month + 1}月`;

  // 计算月份天数和第一天星期几
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const grid = document.getElementById('calendar-grid');
  if (!grid) return;

  let html = '';

  // 上月尾部
  for (let i = firstDay - 1; i >= 0; i--) {
    html += `<div class="cal-day cal-day-other">${daysInPrevMonth - i}</div>`;
  }

  // 本月
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = isCurrentMonth && d === today.getDate();
    const isCountdown = countdownDates.has(`${year}-${month}-${d}`);
    const classes = ['cal-day'];
    if (isToday) classes.push('cal-day-today');
    if (isCountdown) classes.push('cal-day-countdown');
    html += `<div class="${classes.join(' ')}">${d}</div>`;
  }

  // 下月头部补齐
  const totalCells = firstDay + daysInMonth;
  const remaining = (7 - (totalCells % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    html += `<div class="cal-day cal-day-other">${d}</div>`;
  }

  grid.innerHTML = html;
}

function changeMonth(delta) {
  calendarDate.setMonth(calendarDate.getMonth() + delta);
  renderCalendar();
}

function goToToday() {
  calendarDate = new Date();
  renderCalendar();
}

// ===== 倒计时功能 =====
function loadCountdowns() {
  const data = loadCustomData();
  const countdowns = data.countdowns || [];
  renderCountdowns(countdowns);
}

function renderCountdowns(countdowns) {
  const container = document.getElementById('countdown-list');
  if (!container) return;

  if (!countdowns || countdowns.length === 0) {
    container.innerHTML = '<div class="countdown-empty">暂无倒计时，添加一个吧！</div>';
    return;
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  container.innerHTML = countdowns.map(cd => {
    const target = new Date(cd.targetDate);
    target.setHours(0, 0, 0, 0);
    const diff = Math.round((target - now) / (1000 * 60 * 60 * 24));
    let diffText, diffClass;
    if (diff > 0) {
      diffText = `还剩 ${diff} 天`;
      diffClass = 'countdown-future';
    } else if (diff === 0) {
      diffText = '还剩 0 天';
      diffClass = 'countdown-today';
    } else {
      diffText = `已超 ${Math.abs(diff)} 天`;
      diffClass = 'countdown-past';
    }
    const dateStr = `${target.getFullYear()}-${String(target.getMonth()+1).padStart(2,'0')}-${String(target.getDate()).padStart(2,'0')}`;
    return `
      <div class="countdown-item ${diffClass}">
        <div class="countdown-info">
          <div class="countdown-name">${cd.name}</div>
          <div class="countdown-date">${dateStr}</div>
        </div>
        <div class="countdown-diff">${diffText}</div>
        <button class="countdown-delete" onclick="deleteCountdown('${cd.id}')">✕</button>
      </div>
    `;
  }).join('');
}

function addCountdown() {
  const nameInput = document.getElementById('countdown-name');
  const dateInput = document.getElementById('countdown-date');
  const name = nameInput.value.trim();
  const date = dateInput.value;

  if (!name) { showToast('请输入倒计时名称'); return; }
  if (!date) { showToast('请选择目标日期'); return; }

  const data = loadCustomData();
  if (!data.countdowns) data.countdowns = [];
  data.countdowns.push({
    id: `cd-${Date.now()}`,
    name,
    targetDate: date,
  });
  // 按日期排序
  data.countdowns.sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate));
  saveCustomData(data);

  nameInput.value = '';
  dateInput.value = '';
  renderCountdowns(data.countdowns);
  renderCalendar(); // 同步日历标黄
  showToast('倒计时已添加');
}

function deleteCountdown(id) {
  const data = loadCustomData();
  if (data.countdowns) {
    data.countdowns = data.countdowns.filter(cd => cd.id !== id);
    saveCustomData(data);
    renderCountdowns(data.countdowns);
    renderCalendar(); // 同步日历标黄
    showToast('已删除');
  }
}

// ===== 好好活着天数 =====
function initAliveDays() {
  const data = loadCustomData();
  // 首次访问：记录登录日期
  if (!data.firstLoginDate) {
    data.firstLoginDate = todayStr();
    saveCustomData(data);
  }
  updateAliveDays();
  // 每分钟检查一次（跨日时自动更新）
  setInterval(updateAliveDays, 60000);
}

function updateAliveDays() {
  const data = loadCustomData();
  if (!data.firstLoginDate) return;
  const first = new Date(data.firstLoginDate);
  first.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  // 从第0天开始
  const days = Math.floor((now - first) / (1000 * 60 * 60 * 24));
  const el = document.getElementById('alive-days-count');
  if (el) el.textContent = days;
}

// ===== 启动 =====
document.addEventListener('DOMContentLoaded', init);
