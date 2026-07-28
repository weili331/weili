/**
 * weili App 配置文件
 */
const path = require('path');

const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const STATIC_DIR = path.join(ROOT_DIR, 'public');

module.exports = {
  PORT: process.env.PORT || 3000,
  ROOT_DIR,
  DATA_DIR,
  STATIC_DIR,
  DB_FILE: path.join(DATA_DIR, 'db.json'),
  SONGS_FILE: 'songs.json',

  SOURCES: {
    geography: {
      sources: [
        { name: '中国地理', searchUrl: 'https://weixin.sogou.com/weixin?type=2&query=' },
        { name: '星球研究所', searchUrl: 'https://weixin.sogou.com/weixin?type=2&query=' },
        { name: '中国国家地理中文网', searchUrl: 'https://weixin.sogou.com/weixin?type=2&query=' },
      ],
    },
    law: {
      sources: ['人民日报', '光明新闻', '解放日报', '新华日报', '中国青年报'],
    },
    peopleDaily: {
      indexUrl: 'http://paper.people.com.cn/',
      articlePrefix: 'http://paper.people.com.cn/',
    },
    bilibili: {
      searchApi: 'https://api.bilibili.com/x/web-interface/search/type',
      videoPrefix: 'https://www.bilibili.com/video/',
      defaultKeyword: '学习方法',
    },
  },
};
