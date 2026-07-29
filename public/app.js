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

// ===== 法律文章池（30篇，每日随机选3篇，不重复） =====
const LAW_ARTICLE_POOL = [
  { source: '人民日报', title: '高空抛物没砸到人也违法吗？', summary: '湖北宜昌长阳县人民法院审结一起因高空抛物引发的纠纷。法院认为，从高空抛掷物品，如果存在危害他人人身安全、公私财产安全或者公共安全危险的，无论是否造成实际损害，均属于违法。', legalAnalysis: { law: '《民法典》第1254条、《治安管理处罚法》', analysis: '从建筑物抛掷物品，无论是否造成实际损害，只要存在危害他人或公共安全危险的，即属违法；情节严重的还可能承担刑事责任。' } },
  { source: '光明日报', title: '最高法：判断外卖小哥与平台是否存在劳动关系，要看是否存在支配性劳动管理', summary: '最高人民法院发布新就业形态劳动争议专题指导性案例，明确平台企业与新就业形态劳动者之间的劳动关系认定规则。', legalAnalysis: { law: '《劳动法》及最高法指导性案例', analysis: '判断劳动关系应抓住本质特征，即是否存在支配性劳动管理；不能仅因签订承揽协议或注册为个体工商户就否定劳动关系。' } },
  { source: '中国青年报', title: '严惩行业"内鬼"泄露个人信息', summary: '最高人民法院发布依法惩治侵犯公民个人信息犯罪典型案例，加强对行业"内鬼"泄露个人信息等违法犯罪行为的惩处力度。', legalAnalysis: { law: '《个人信息保护法》第66条、第70条', analysis: '违反国家规定出售或提供公民个人信息，情节严重的构成犯罪；行业"内鬼"利用职务便利泄露信息的应依法从重处罚。' } },
  { source: '新华日报', title: '26万条个人信息"直通黑市"，公司把转卖客户数据当KPI', summary: '宿迁经开区人民法院审理一起网络店铺非法出售公民个人信息案，提醒网络平台加强商家管理，保护好消费者个人信息。', legalAnalysis: { law: '《刑法》第253条之一 侵犯公民个人信息罪', analysis: '违反国家有关规定，向他人出售或者提供公民个人信息，情节严重的处三年以下有期徒刑；情节特别严重的处三年以上七年以下有期徒刑。' } },
  { source: '人民日报', title: '民法典让"高空抛物"无所遁形', summary: '民法典针对高空抛物做出明确规定，禁止从建筑物中抛掷物品，物业服务企业未采取安全保障措施的应承担相应责任。', legalAnalysis: { law: '《民法典》第1254条', analysis: '禁止从建筑物中抛掷物品。经调查难以确定具体侵权人的，除能够证明自己不是侵权人的外，由可能加害的建筑物使用人给予补偿。物业服务企业未采取安全保障措施的应依法承担责任。' } },
  { source: '解放日报', title: '《上海市数据条例》公开征求意见', summary: '上海市人大常委会就《上海市数据条例（草案）》公开征求意见，为城市数字化转型提供基础性制度保障。', legalAnalysis: { law: '《数据安全法》、《个人信息保护法》', analysis: '数据处理活动应当遵守法律法规，尊重社会公德和伦理；收集数据应限于实现处理目的的最小范围；涉及个人信息的须取得个人同意。' } },
  { source: '光明日报', title: '骑手参保，探路灵活就业者权益保障', summary: '国家层面对新就业形态用工关系作出清晰区分，探索政府、平台和个人多方参与的灵活就业者社保保障模式。', legalAnalysis: { law: '《社会保险法》、《关于维护新就业形态劳动者劳动保障权益的指导意见》', analysis: '平台企业应当规范用工，不得规避用工主体责任；灵活就业人员有权参加基本养老保险和基本医疗保险，平台应予以配合。' } },
  { source: '中国青年报', title: '冒用客户信息办居住证 链家及员工被判赔偿十万元', summary: '链家公司及员工因冒用客户信息办理居住证被判公开赔礼道歉并连带赔偿10万元，反映企业信息保管漏洞。', legalAnalysis: { law: '《民法典》第111条、第1165条 侵权责任', analysis: '自然人个人信息受法律保护。任何组织或个人需要获取他人个人信息的应当依法取得并确保信息安全；非法使用他人个人信息造成损害的应承担侵权责任。' } },
  { source: '人民日报', title: '网络直播带货中的消费者权益保护', summary: '随着直播电商快速发展，虚假宣传、假冒伪劣等问题频发。多地市场监管部门加大对直播带货违法行为查处力度。', legalAnalysis: { law: '《消费者权益保护法》第55条、《电子商务法》', analysis: '直播带货中经营者提供商品或服务有欺诈行为的应增加赔偿；电子商务平台对平台内经营者侵害消费者合法权益的行为未采取必要措施的依法承担连带责任。' } },
  { source: '光明日报', title: '预付卡消费陷阱多 消费者如何维权', summary: '健身房、美容院、教育培训等预付卡消费领域频现"跑路"事件，消费者预存费用后商家关门失联。', legalAnalysis: { law: '《消费者权益保护法》第53条、《单用途商业预付卡管理办法》', analysis: '经营者以预收款方式提供商品或服务的，未按照约定提供的应当按照消费者要求履行约定或退回预付款；发卡企业应按规定进行资金存管。' } },
  { source: '新华日报', title: '物业公司停电催缴物业费是否合法', summary: '多地发生物业公司以停电停水方式催缴物业费引发纠纷，法院认定物业无权采取断水断电等极端手段。', legalAnalysis: { law: '《民法典》第944条、《物业管理条例》', analysis: '物业服务人不得采取停止供电、供水、供热、供燃气等方式催交物业费；业主逾期不交纳物业费的物业服务人可以催告其在合理期限内交纳，逾期仍不交纳的可提起诉讼或申请仲裁。' } },
  { source: '中国青年报', title: '校园欺凌的法律责任与预防', summary: '多部门联合发文要求加强中小学生欺凌防治工作，明确学校、家庭和相关部门职责，建立早期预警和事中处理机制。', legalAnalysis: { law: '《未成年人保护法》第39条、《预防未成年人犯罪法》', analysis: '学校应当建立学生欺凌防控工作制度；对实施欺凌的学生学校应根据情节给予纪律处分，情节严重的公安机关可依法予以治安管理处罚或追究刑事责任。' } },
  { source: '人民日报', title: '网络暴力是否构成犯罪？', summary: '网络暴力事件频发，从造谣传谣到人肉搜索，严重侵害公民人格权益。最高法明确网络暴力可构成诽谤罪、侮辱罪等。', legalAnalysis: { law: '《刑法》第246条 诽谤罪/侮辱罪、《民法典》第1024条', analysis: '以暴力或者其他方法公然侮辱他人或捏造事实诽谤他人情节严重的处三年以下有期徒刑；网络暴力造成他人名誉权损害的应承担民事侵权责任。' } },
  { source: '光明日报', title: '醉驾入刑十年：危险驾驶罪的适用', summary: '醉驾入刑以来全国查处酒驾醉驾案件数量大幅下降，危险驾驶罪已成为刑事案件中占比最高的罪名之一。', legalAnalysis: { law: '《刑法》第133条之一 危险驾驶罪', analysis: '在道路上醉酒驾驶机动车的处拘役并处罚金；血液酒精含量达到80毫克/100毫升以上的属于醉酒驾驶。醉驾造成交通事故构成其他犯罪的依照处罚较重的规定定罪处罚。' } },
  { source: '解放日报', title: '正当防卫的认定标准与界限', summary: '多起正当防卫案件引发社会关注，最高法最高检联合发布指导性案例明确正当防卫的适用条件。', legalAnalysis: { law: '《刑法》第20条 正当防卫', analysis: '为了使国家、公共利益、本人或他人的人身、财产和其他权利免受正在进行的不法侵害而采取的制止不法侵害的行为对不法侵害人造成损害的属于正当防卫不负刑事责任；明显超过必要限度造成重大损害的应当负刑事责任但应当减轻或免除处罚。' } },
  { source: '新华日报', title: '快递丢失损毁 消费者如何索赔', summary: '网购快递在运输过程中丢失损毁事件频发，消费者面临理赔难、赔偿低等问题。', legalAnalysis: { law: '《邮政法》第47条、《电子商务法》第20条', analysis: '快件延误、丢失、损毁或内件短少的经营快递业务的企业应当按照与用户的约定予以赔偿；未约定赔偿标准的按照相关法律规定执行；保价的快件按保价额赔偿。' } },
  { source: '中国青年报', title: '兼职陷阱：大学生如何识别和防范', summary: '刷单返利、打字员兼职、模特代理等骗局利用大学生求职心切进行诈骗，造成财产损失。', legalAnalysis: { law: '《刑法》第266条 诈骗罪', analysis: '以非法占有为目的用虚构事实或隐瞒真相的方法骗取数额较大的公私财物的处三年以下有期徒刑；刷单本身属于违法行为参与刷单不受法律保护。' } },
  { source: '人民日报', title: '电子合同的法律效力与签订注意事项', summary: '随着数字经济发展电子合同应用越来越广泛，其法律效力已获法律确认但签订时需注意身份认证和证据保存。', legalAnalysis: { law: '《民法典》第469条、《电子签名法》第14条', analysis: '当事人订立合同可以采用电子数据交换等形式；可靠的电子签名与手写签名或盖章具有同等的法律效力；签订电子合同应注意使用第三方电子签名平台确保签名可靠性。' } },
  { source: '光明日报', title: '信用卡逾期不还的法律后果', summary: '信用卡透支后长期不还可能面临高额利息、信用记录受损甚至刑事追责，银行有权通过法律途径追讨欠款。', legalAnalysis: { law: '《刑法》第196条 信用卡诈骗罪', analysis: '恶意透支信用卡数额较大的处五年以下有期徒刑；持卡人以非法占有为目的超过规定限额或期限透支经发卡银行两次有效催收后超过三个月仍不归还的属于恶意透支。' } },
  { source: '新华日报', title: '房贷断供后银行能否直接收回房屋', summary: '经济下行导致部分购房者房贷断供，银行可通过法律程序拍卖抵押房产但须经过法院诉讼程序。', legalAnalysis: { law: '《民法典》第410条 抵押权实现', analysis: '债务人不履行到期债务或者发生当事人约定的实现抵押权的情形抵押权人可以与抵押人协议以抵押财产折价或拍卖变卖该财产所得价款优先受偿；协议不成的抵押权人可以请求人民法院拍卖变卖抵押财产。' } },
  { source: '中国青年报', title: '知识产权侵权：短视频搬运的法律风险', summary: '未经授权搬运、剪辑他人短视频在网络平台传播可能构成著作权侵权，多起案件判决搬运者赔偿。', legalAnalysis: { law: '《著作权法》第53条、第54条', analysis: '未经著作权人许可复制通过信息网络向公众传播其作品的应当承担停止侵害、消除影响、赔礼道歉、赔偿损失等民事责任；侵权赔偿数额按照权利人实际损失或侵权人违法所得确定。' } },
  { source: '人民日报', title: '医疗纠纷中患者的权利与维权途径', summary: '医疗纠纷发生后患者可通过协商、调解、诉讼等途径维权，医疗损害鉴定是认定责任的关键环节。', legalAnalysis: { law: '《民法典》第1218条 医疗损害责任', analysis: '患者在诊疗活动中受到损害医疗机构或者其医务人员有过错的由医疗机构承担赔偿责任；患者有损害且医疗机构存在隐匿拒绝提供病历等情形的推定医疗机构有过错。' } },
  { source: '解放日报', title: '劳动合同到期不续签是否需要赔偿', summary: '劳动合同期满后用人单位不续签或降低条件续签劳动者不同意终止的，用人单位应支付经济补偿。', legalAnalysis: { law: '《劳动合同法》第46条、第47条', analysis: '除用人单位维持或提高劳动合同约定条件续订劳动合同劳动者不同意续订的情形外劳动合同期满终止固定期限劳动合同的用人单位应当向劳动者支付经济补偿；经济补偿按劳动者在本单位工作年限每满一年支付一个月工资。' } },
  { source: '光明日报', title: '工伤认定的标准与申请时限', summary: '劳动者在工作中受伤后需及时申请工伤认定，认定工伤是获得工伤保险待遇的前提条件。', legalAnalysis: { law: '《工伤保险条例》第14条、第17条', analysis: '职工在工作时间和工作场所内因工作原因受到事故伤害的应当认定为工伤；用人单位应在事故伤害发生之日起30日内提出工伤认定申请，用人单位未按规定提出申请的职工或其直系亲属可在1年内直接提出申请。' } },
  { source: '新华日报', title: '房屋租赁中租客的权益保护', summary: '租房市场中房东随意涨租、提前收房、不退押金等问题频发，租客应签订书面合同维护自身权益。', legalAnalysis: { law: '《民法典》第725条、第733条', analysis: '租赁物在承租人按照租赁合同占有期限内发生所有权变动的不影响租赁合同的效力；承租人按照约定的方法或根据租赁物的性质使用租赁物致使租赁物受到损耗的不承担赔偿责任。' } },
  { source: '中国青年报', title: '未成年人网络打赏能否追回', summary: '未成年人在直播平台大额打赏主播引发纠纷，法院多判决平台返还打赏款项。', legalAnalysis: { law: '《民法典》第19条、第145条', analysis: '八周岁以上的未成年人为限制民事行为能力人，实施的纯获利益的民事法律行为或与其年龄智力相适应的民事法律行为有效；其他民事法律行为经法定代理人同意或追认后有效。未成年人未经监护人同意进行大额网络打赏的监护人可以主张追回。' } },
  { source: '人民日报', title: '环境污染侵权中的举证责任倒置', summary: '环境污染侵权案件适用举证责任倒置规则，污染者需证明其行为与损害结果之间不存在因果关系。', legalAnalysis: { law: '《民法典》第1230条', analysis: '因污染环境破坏生态发生纠纷行为人应当就法律规定的不承担责任或者减轻责任的情形及其行为与损害之间不存在因果关系承担举证责任；这不同于一般侵权纠纷中"谁主张谁举证"的原则。' } },
  { source: '光明日报', title: '遗产继承：法定继承与遗嘱继承的顺序', summary: '民法典对法定继承人的范围和顺序进行了调整，遗嘱继承优先于法定继承但遗嘱须符合法定要件。', legalAnalysis: { law: '《民法典》第1123条、第1127条', analysis: '继承开始后按照法定继承办理；有遗嘱的按照遗嘱继承或者遗赠办理。法定继承第一顺序为配偶子女父母，第二顺序为兄弟姐妹祖父母外祖父母。民法典新增打印遗嘱和录像遗嘱形式但须符合法定要件。' } },
  { source: '新华日报', title: '见义勇为受伤能否要求受益人补偿', summary: '为保护他人权益而受伤的见义勇为者有权请求受益人给予适当补偿，民法典对此作出明确规定。', legalAnalysis: { law: '《民法典》第183条', analysis: '因保护他人民事权益使自己在受到损害的由侵权人承担民事责任受益人可以给予适当补偿。没有侵权人侵权人逃逸或者无力承担民事责任受害人请求补偿的受益人应当给予适当补偿。' } },
  { source: '中国青年报', title: '不正当竞争：流量造假与刷单炒信的法律责任', summary: '电商平台商家通过刷单炒信制造虚假流量提升排名被认定为不正当竞争行为，面临行政处罚和民事赔偿。', legalAnalysis: { law: '《反不正当竞争法》第8条、第20条', analysis: '经营者不得对其商品的销售状况用户评价等作虚假或者引人误解的商业宣传欺骗误导消费者；经营者违反规定由监督检查部门责令停止违法行为处二十万元以上一百万元以下罚款情节严重的处一百万元以上二百万元以下罚款吊销营业执照。' } },
];

// ===== 播客视频池（20个B站学习视频，每日随机选1个，不重复） =====
const PODCAST_VIDEO_POOL = [
  { bvid: 'BV11o4y1s7VY', title: '我是如何快速学习一个领域的', author: '小Lin说', duration: '16:47', playCount: 3412000, cover: '', description: 'UP主小Lin结合自身从北大到哥大的学习经验，系统讲解结构化思维：多问为什么、时间线梳理、异常数据分析、流程化拆解，帮你快速建立新领域的知识框架。', recommendReason: '契合你关注的学习方法方向，小Lin说是B站百大UP主，该方法论视频播放量341万，信息密度高且实用。' },
  { bvid: 'BV1GJ411x7h7', title: '【TED】如何掌控你的自由时间', author: 'TED君学演讲', duration: '11:32', playCount: 1280000, cover: '', description: '时间管理专家Laura Vanderkam指出我们不是通过节省时间来打造想要的生活，而是先创造想要的生活时间自然就省出来了。', recommendReason: '时间管理方向经典TED演讲，帮助你重新审视时间分配的优先级。' },
  { bvid: 'BV1Hx411y7nH', title: '考研政治该怎么复习？学姐分享经验', author: '考研学长学姐', duration: '15:20', playCount: 890000, cover: '', description: '考研上岸学姐系统分享政治复习规划，从基础阶段到冲刺阶段的时间安排和资料选择，附答题技巧。', recommendReason: '考研经验方向，对你的考研准备有直接参考价值。' },
  { bvid: 'BV1Kb411W7fK', title: '英语听力训练方法：影子跟读法', author: '英语老师Ella', duration: '12:45', playCount: 1560000, cover: '', description: '影子跟读法是提升英语听力最有效的方法之一，Ella老师详细讲解操作步骤和注意事项，附练习素材推荐。', recommendReason: '英语学习方向，影子跟读法被广泛验证有效，适合日常练习。' },
  { bvid: 'BV1L4411A7dC', title: '科研入门：如何阅读和撰写学术论文', author: '博士学长', duration: '22:10', playCount: 670000, cover: '', description: '博士生系统讲解学术论文阅读方法：精读与泛读策略、文献管理工具使用、论文写作规范与投稿流程。', recommendReason: '科研入门方向，对了解学术研究方法和论文写作有系统指导。' },
  { bvid: 'BV1Wb41177pE', title: '自律100天打卡：我是如何坚持的', author: '自律少女阿May', duration: '10:30', playCount: 980000, cover: '', description: 'UP主分享自律100天打卡的经历和方法，包括目标设定、习惯养成、应对拖延和失败调整策略。', recommendReason: '自律打卡方向，真实经历分享可作为你的习惯养成参考。' },
  { bvid: 'BV1Sb411s7CP', title: '效率工具盘点：Notion/Obsidian/飞书', author: '效率达人', duration: '18:55', playCount: 1230000, cover: '', description: '深度对比三款主流效率工具的优缺点和适用场景，附使用技巧和模板分享，帮你选对工具提升效率。', recommendReason: '效率工具方向，工具选择是提升效率的第一步，值得借鉴。' },
  { bvid: 'BV1dJ411W7fC', title: '读书方法分享：如何高效阅读一本书', author: '读书人小李', duration: '14:20', playCount: 760000, cover: '', description: '分享主题阅读法、SQ3R阅读法和番茄阅读法三种高效阅读方法，帮助你从书中获取更多价值。', recommendReason: '读书分享方向，阅读方法论对知识积累有长期价值。' },
  { bvid: 'BV1HJ41157k7', title: '费曼学习法：最强学习技巧详解', author: '学习区UP主', duration: '09:15', playCount: 2100000, cover: '', description: '费曼学习法核心是用简单的语言向他人解释复杂的概念。视频详解四个步骤和实际应用案例。', recommendReason: '学习方法方向，费曼学习法被公认为最有效的学习技巧之一。' },
  { bvid: 'BV1Tb411W7fC', title: '考研英语阅读理解技巧大全', author: '考研英语老师', duration: '25:30', playCount: 1450000, cover: '', description: '系统讲解考研英语阅读理解的六大题型和解题技巧，附真题分析和练习方法。', recommendReason: '考研方向，阅读理解是考研英语的拉分关键。' },
  { bvid: 'BV1YJ411s7dC', title: '记笔记的正确方法：康奈尔笔记法', author: '学习博主', duration: '08:45', playCount: 1340000, cover: '', description: '康奈尔笔记法是全球公认的高效笔记方法，视频详解笔记区域划分、记录要点和复习流程。', recommendReason: '学习方法方向，笔记是知识管理的基础，康奈尔法简单实用。' },
  { bvid: 'BV1pb41177pK', title: '如何克服拖延症：心理学视角', author: '心理学长', duration: '13:50', playCount: 1670000, cover: '', description: '从心理学角度分析拖延症成因，提供认知行为疗法、番茄工作法、环境设计等实用策略。', recommendReason: '自律方向，克服拖延是提升学习效率的关键一步。' },
  { bvid: 'BV1WJ411x7h7', title: '英语口语提升：每日跟读练习指南', author: '口语教练Tom', duration: '11:20', playCount: 890000, cover: '', description: '口语教练Tom分享每日15分钟跟读练习计划，从发音纠正到语调训练，附免费练习素材。', recommendReason: '英语学习方向，口语提升需要每日坚持，方法指导很重要。' },
  { bvid: 'BV1Kx411y7dH', title: '思维导图使用指南：从入门到精通', author: '知识管理达人', duration: '16:30', playCount: 1100000, cover: '', description: '系统讲解思维导图的原理和制作方法，涵盖XMind、幕布等工具使用，附学习和工作中的实际应用案例。', recommendReason: '效率方法方向，思维导图是整理思路和知识结构的利器。' },
  { bvid: 'BV1Sx411y7nC', title: '大学四年如何规划才不后悔', author: '学长说', duration: '19:45', playCount: 2340000, cover: '', description: '毕业学长分享大学四年规划经验：大一探索、大二聚焦、大三深耕、大四冲刺，涵盖学业、实习、竞赛、考研。', recommendReason: '学习规划方向，适合大学生系统规划大学生活。' },
  { bvid: 'BV1Hb411W7dP', title: '番茄工作法详解：如何专注25分钟', author: '效率工具控', duration: '07:30', playCount: 1560000, cover: '', description: '番茄工作法是最简单有效的时间管理方法，视频详解操作步骤、常见误区和进阶技巧。', recommendReason: '效率方法方向，番茄法简单易行，适合立刻开始实践。' },
  { bvid: 'BV1Yx411A7dK', title: '深度工作：如何在分心时代保持专注', author: '读书博主', duration: '20:15', playCount: 980000, cover: '', description: '基于卡尔·纽波特的《深度工作》一书，分享在社交媒体时代培养深度专注力的四大策略和日常实践方法。', recommendReason: '学习方法方向，深度工作是高效率学习的核心能力。' },
  { bvid: 'BV1pb411s7CK', title: '英语写作提升：从句子到段落', author: '写作老师Emily', duration: '17:40', playCount: 670000, cover: '', description: 'Emily老师从句子结构到段落展开，系统讲解英语写作的核心技巧，附常见错误分析和修改示范。', recommendReason: '英语学习方向，写作是英语综合能力的体现。' },
  { bvid: 'BV1Wb411x7hP', title: '记忆法训练：宫殿记忆法入门', author: '记忆达人', duration: '12:55', playCount: 1890000, cover: '', description: '宫殿记忆法是世界记忆冠军的常用技巧，视频从原理讲解到实操训练，帮你打造超强记忆力。', recommendReason: '学习方法方向，记忆是学习的基础，宫殿法效果显著。' },
  { bvid: 'BV1dx411W7fC', title: '复盘方法论：如何从经验中学习', author: '成长博主', duration: '14:10', playCount: 760000, cover: '', description: '复盘是个人成长的核心方法，视频详解GRAI复盘法（回顾目标、评估结果、分析原因、总结规律），附复盘模板。', recommendReason: '效率方法方向，复盘习惯对持续进步至关重要。' },
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
      { source: '人民日报', title: '高空抛物没砸到人也违法吗？', summary: '湖北宜昌长阳县人民法院审结一起因高空抛物引发的纠纷。法院认为，从高空抛掷物品，如果存在危害他人人身安全、公私财产安全或者公共安全危险的，无论是否造成实际损害，均属于违法。', url: 'https://www.baidu.com/s?wd=' + encodeURIComponent('高空抛物没砸到人也违法吗？'), legalAnalysis: { law: '《民法典》第1254条、《治安管理处罚法》', analysis: '从建筑物抛掷物品，无论是否造成实际损害，只要存在危害他人或公共安全危险的，即属违法；情节严重的还可能承担刑事责任。' } },
      { source: '光明日报', title: '最高法：判断外卖小哥与平台是否存在劳动关系，要看是否存在支配性劳动管理', summary: '最高人民法院发布新就业形态劳动争议专题指导性案例，明确平台企业与新就业形态劳动者之间的劳动关系认定规则。', url: 'https://www.baidu.com/s?wd=' + encodeURIComponent('最高法：判断外卖小哥与平台是否存在劳动关系，要看是否存在支配性劳动管理'), legalAnalysis: { law: '《劳动法》及最高法指导性案例', analysis: '判断劳动关系应抓住本质特征，即是否存在支配性劳动管理；不能仅因签订承揽协议或注册为个体工商户就否定劳动关系。' } },
      { source: '中国青年报', title: '严惩行业"内鬼"泄露个人信息', summary: '最高人民法院发布依法惩治侵犯公民个人信息犯罪典型案例，加强对行业"内鬼"泄露个人信息等违法犯罪行为的惩处力度。', url: 'https://www.baidu.com/s?wd=' + encodeURIComponent('严惩行业"内鬼"泄露个人信息'), legalAnalysis: { law: '《个人信息保护法》第66条、第70条', analysis: '违反国家规定出售或提供公民个人信息，情节严重的构成犯罪；行业"内鬼"利用职务便利泄露信息的应依法从重处罚。' } },
    ],
  },
  geography: {
    featured: {
      source: '中国国家地理中文网',
      title: '新疆尉犁：盐碱与富饶共生的土地',
      summary: '新疆尉犁县是继罗布泊之后，塔里木盆地一个新的汇盐区。这里有大面积的盐渍化土地，却呈现盐碱与富饶共生的和谐景象。',
      url: 'https://www.baidu.com/s?wd=' + encodeURIComponent('新疆尉犁：盐碱与富饶共生的土地'),
    },
    pastRecommendations: [
      { date: '07-27', title: '天山，被打穿了？！', url: 'https://www.baidu.com/s?wd=' + encodeURIComponent('天山，被打穿了？！'), source: '星球研究所' },
      { date: '07-26', title: '哪座城市，压轴2025？', url: 'https://www.baidu.com/s?wd=' + encodeURIComponent('哪座城市，压轴2025？'), source: '星球研究所' },
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

// ===== 客户端每日选取系统（不依赖后端，localStorage记录历史，不与之前所有推荐重复） =====

// 通用：从池中按日期选取，排除历史记录，池耗尽时自动重置
function dailySelect(pool, historyKey, idField, count, date) {
  const today = date || todayStr();
  const cacheKey = historyKey + '-cache';
  const cached = JSON.parse(localStorage.getItem(cacheKey) || '{}');
  // 如果今天已经选过了，直接返回缓存
  if (cached.date === today && cached.selection) {
    return cached.selection;
  }

  // 读取历史记录
  let history = JSON.parse(localStorage.getItem(historyKey) || '[]');

  // 从池中排除已推荐过的
  let candidates = pool.filter(item => !history.includes(item[idField]));
  // 如果排除后不够选，清空历史重新开始
  if (candidates.length < count) {
    history = [];
    candidates = [...pool];
  }

  // 随机选取
  const selected = [];
  const tempPool = [...candidates];
  for (let i = 0; i < count && tempPool.length > 0; i++) {
    const idx = Math.floor(Math.random() * tempPool.length);
    selected.push(tempPool[idx]);
    tempPool.splice(idx, 1);
  }

  // 更新历史
  selected.forEach(item => {
    if (!history.includes(item[idField])) history.push(item[idField]);
  });
  localStorage.setItem(historyKey, JSON.stringify(history));

  // 缓存今天的选择（同一天内不变）
  localStorage.setItem(cacheKey, JSON.stringify({ date: today, selection: selected }));

  return selected;
}

// 法律：每日选3篇，不与历史重复
function clientSideLawSelection() {
  const selected = dailySelect(LAW_ARTICLE_POOL, 'weili-law-history', 'title', 3);
  const today = todayStr();
  return {
    items: selected.map((item, idx) => ({
      id: idx + 1,
      source: item.source,
      date: today.slice(5),
      title: item.title,
      summary: item.summary,
      legalAnalysis: item.legalAnalysis,
      url: baiduSearchUrl(item.title),
    })),
  };
}

// 播客：每日选1个视频，不与历史重复
function clientSidePodcastSelection() {
  const selected = dailySelect(PODCAST_VIDEO_POOL, 'weili-podcast-history', 'bvid', 1);
  const v = selected[0];
  const today = todayStr();
  return {
    source: '哔哩哔哩',
    author: v.author,
    date: today.slice(5),
    title: v.title,
    description: v.description,
    duration: v.duration,
    playCount: v.playCount,
    cover: v.cover || '',
    url: 'https://www.bilibili.com/video/' + v.bvid,
    recommendReason: v.recommendReason,
  };
}

// 音乐推荐：每日选1个视频，不与历史重复
function clientSideMusicRecommendation() {
  const selected = dailySelect(MUSIC_VIDEO_POOL, 'weili-music-history', 'bvid', 1);
  const v = selected[0];
  const rec = {
    title: v.title, bvid: v.bvid,
    url: 'https://www.bilibili.com/video/' + v.bvid,
    cover: v.cover, duration: v.duration, play: v.play,
    author: 'JLRS-LeoFM', authorUrl: 'https://space.bilibili.com/3493093607213343',
    source: 'B站',
  };
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
  // 添加自定义大项页面的任务
  const customNav = getCustomNav();
  for (const nav of customNav) {
    result[nav.id] = getCustomTasks(nav.id);
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
      // 日期变化：归档前一天的自定义任务到历史记录
      if (stored.date && stored.tasks) {
        archiveYesterdayTasks(stored.date, stored.tasks);
      }
      state.tasks = {};
      saveTasks();
    } else {
      state.tasks = stored.tasks || {};
    }
  } catch {
    state.tasks = {};
  }
  // 渲染各页面的往期记录
  renderAllTaskHistory();
}

// 归档前一天的自定义任务（含完成状态）到历史记录，然后清除自定义任务
function archiveYesterdayTasks(yesterdayDate, yesterdayTaskState) {
  const data = loadCustomData();
  if (!data.taskHistory) data.taskHistory = [];

  // 收集所有自定义任务（含完成状态）
  const archivedTasks = {};
  if (data.tasks) {
    for (const [category, tasks] of Object.entries(data.tasks)) {
      if (tasks && tasks.length > 0) {
        archivedTasks[category] = tasks.map(t => ({
          ...t,
          completed: !!yesterdayTaskState[t.id],
        }));
      }
    }
  }

  // 收集自定义子项目
  const archivedSubItems = {};
  if (data.subItems) {
    for (const [parentId, subs] of Object.entries(data.subItems)) {
      if (subs && subs.length > 0) {
        archivedSubItems[parentId] = subs.map(s => ({
          ...s,
          completed: !!yesterdayTaskState[s.id],
        }));
      }
    }
  }

  // 只有确实有自定义任务时才归档
  const hasTasks = Object.keys(archivedTasks).length > 0;
  const hasSubs = Object.keys(archivedSubItems).length > 0;

  if (hasTasks || hasSubs) {
    data.taskHistory.unshift({
      date: yesterdayDate,
      tasks: archivedTasks,
      subItems: archivedSubs,
    });
    // 只保留最近30条历史
    if (data.taskHistory.length > 30) data.taskHistory = data.taskHistory.slice(0, 30);

    // 清除自定义任务（默认任务保留在DEFAULT_TASKS中）
    data.tasks = {};
    data.subItems = {};
    saveCustomData(data);
    console.log(`[archive] 已归档 ${yesterdayDate} 的自定义任务到历史记录`);
  }
}

// 渲染所有页面的往期记录
function renderAllTaskHistory() {
  renderTaskHistory('exercise-history', 'exercise');
  renderTaskHistory('english-history', 'english');
}

// 渲染某个分类的往期记录
function renderTaskHistory(containerId, category) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const data = loadCustomData();
  const history = data.taskHistory || [];

  // 过滤出该分类有记录的历史条目
  const relevant = history.filter(h => {
    const tasks = (h.tasks && h.tasks[category]) || [];
    return tasks.length > 0;
  });

  if (relevant.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div class="task-history-section">
      <div class="task-history-title">📅 往期记录</div>
      ${relevant.map(h => {
        const tasks = (h.tasks && h.tasks[category]) || [];
        const completedCount = tasks.filter(t => t.completed).length;
        return `
          <div class="task-history-item">
            <div class="task-history-date">${h.date}（完成 ${completedCount}/${tasks.length}）</div>
            <div class="task-history-list">
              ${tasks.map(t => `
                <div class="task-history-entry ${t.completed ? 'done' : ''}">
                  <span class="task-history-check">${t.completed ? '✅' : '⬜'}</span>
                  <span class="task-history-name">${escapeHtml(t.name)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
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
  renderAllTaskHistory();
  // 渲染自定义页面的任务列表和历史
  renderCustomPageTasks();
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

  // 移除可能已存在的旧页面
  const existing = document.getElementById(`page-${pageId}`);
  if (existing) existing.remove();

  const pageDiv = document.createElement('div');
  pageDiv.id = `page-${pageId}`;
  pageDiv.className = 'page';
  pageDiv.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">${nav.label}</h1>
    </div>
    <div class="task-list" id="${pageId}-tasks"></div>
    <button class="add-item-btn" onclick="openAddTaskModal('${pageId}')">
      <span>＋</span> 添加${nav.label}项目
    </button>
    <div id="${pageId}-history"></div>
  `;
  document.getElementById('page-container').appendChild(pageDiv);

  // 渲染该页面的任务和历史
  renderTaskList(`${pageId}-tasks`, pageId);
  renderTaskHistory(`${pageId}-history`, pageId);
}

// 渲染所有自定义页面的任务列表
function renderCustomPageTasks() {
  const customNav = getCustomNav();
  customNav.forEach(nav => {
    const container = document.getElementById(`${nav.id}-tasks`);
    if (container) {
      renderTaskList(`${nav.id}-tasks`, nav.id);
    }
    const historyContainer = document.getElementById(`${nav.id}-history`);
    if (historyContainer) {
      renderTaskHistory(`${nav.id}-history`, nav.id);
    }
  });
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
  const titleMap = { exercise: '添加运动项目', english: '添加学习项目' };
  const navItem = getCustomNav().find(n => n.id === category);
  document.getElementById('modal-title').textContent = titleMap[category] || (navItem ? `添加${navItem.label}项目` : '添加项目');
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

// 法律：客户端每日选取3篇，不与历史重复（不依赖Vercel API，因Vercel无法持久化状态）
async function fetchLaw() {
  const data = clientSideLawSelection();
  state.data.law = data;
  renderLaw(data);
}

// 生成百度搜索链接（永远可用）
function baiduSearchUrl(title) {
  return 'https://www.baidu.com/s?wd=' + encodeURIComponent(title);
}

// 检查URL是否为不稳定链接（非百度搜索的链接都视为可能不稳定）
function isUnstableUrl(url) {
  if (!url || url === '#') return true;
  // 百度搜索链接永远稳定
  if (url.startsWith('https://www.baidu.com/s?')) return false;
  // 其他直接文章链接可能过期
  const unstablePatterns = ['weixin.sogou.com', 'mp.weixin.qq.com', 'sogou.com/link', 'dili360.com', '163.com', 'cng.com.cn'];
  return unstablePatterns.some(p => url.includes(p));
}

// 从种子文章池中按日期选取稳定的地理文章（全部使用百度搜索链接）
function getStableGeographyData() {
  const stableArticles = [
    { source: '中国国家地理中文网', title: '新疆尉犁：盐碱与富饶共生的土地', summary: '新疆尉犁县是继罗布泊之后，塔里木盆地一个新的汇盐区。这里有大面积的盐渍化土地，却呈现盐碱与富饶共生的和谐景象。' },
    { source: '中国国家地理中文网', title: '走棱线：变"左手荒漠，右手昆仑"为现实', summary: '沿国道315线新疆段徒步棱线，南侧是皑皑雪峰，北侧是漫漫黄沙，体验中国地势第一、二级阶梯分界线两侧的极致景观。' },
    { source: '中国国家地理中文网', title: '天山把另一半美给了吉尔吉斯斯坦', summary: '天山的主体在我国新疆境内，但天山的另一半美却在中亚。漫长的国境线阻隔了我们对完整天山的认知。' },
    { source: '中国国家地理中文网', title: '穿越喜马拉雅南麓的林海——寻找神秘的"喜山小熊猫"', summary: '2024年至2025年，一支考察队深入喜马拉雅南麓森林，成功拍摄到目前国内最清晰的喜马拉雅小熊猫野外影像之一。' },
    { source: '中国国家地理中文网', title: '中国国家地理2026年03期', summary: '东北是中国自然省最密集的地方；极致洞穴奇景惊艳亮相；柴达木盆地的泉——超乎想象的地质奇观。' },
    { source: '星球研究所', title: '天山，被打穿了？！', summary: '用时5年，这条前所未有的天山大通道诞生了。星球研究所联合中国交建、极氪001推出科普视频，见证天山大通道的诞生。' },
    { source: '星球研究所', title: '4000年，等一个永不到来的黎明', summary: '最沉重的孤独，是用四千年的时光等待一个永不到来的黎明。黄土之下，他们的生命被永远定格在破晓之前。' },
    { source: '星球研究所', title: '哪座城市，压轴2025？', summary: '星球研究所花费159天、推翻36版大纲，试图解答石家庄这座城市的秘密。' },
    { source: '星球研究所', title: '星球研究所地理科普视频合集', summary: '在B站观看星球研究所的地理科普视频，内容精美、讲解深入。' },
    { source: '中国地理', title: '中国国家地理：探索中国最美景观', summary: '中国国家地理官方网站，探索中国壮丽的自然景观和深厚的人文底蕴。' },
    { source: '中国地理', title: '中国国家地理：地理新闻与资讯', summary: '中国国家地理网提供最新的地理新闻、科考动态和自然人文报道。' },
    { source: '中国地理', title: '黑龙江是中国极光观测第一省', summary: '黑龙江省有北纬43°至53°的广袤地域，其最北点漠河较新疆阿勒泰更偏北约5个纬度，是中国极光观测的最佳省份。' },
  ];

  // 按日期种子选取，确保每天不同但稳定
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  const featuredIdx = dayOfYear % stableArticles.length;

  // 往期推荐：选取另外两篇
  const pastIndices = [];
  for (let i = 1; i <= 2; i++) {
    pastIndices.push((featuredIdx + i * 3) % stableArticles.length);
  }

  const featured = stableArticles[featuredIdx];
  const past = pastIndices.map((idx, i) => {
    const a = stableArticles[idx];
    const d = new Date();
    d.setDate(d.getDate() - (i + 1));
    return {
      source: a.source,
      date: `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      title: a.title,
      url: baiduSearchUrl(a.title),
    };
  });

  return { featured: { ...featured, date: `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`, url: baiduSearchUrl(featured.title) }, pastRecommendations: past };
}

// 地理文章：前端直接使用本地稳定数据（百度搜索链接），不依赖后端API
// 这样即使Vercel serverless函数缓存了旧数据也不受影响
async function fetchGeography() {
  try {
    const resp = await fetch('/api/geography');
    if (!resp.ok) throw new Error('API unavailable');
    const data = await resp.json();

    // 检查API返回的URL是否为不稳定链接
    if (isUnstableUrl(data.featured && data.featured.url)) {
      // 使用本地稳定数据（百度搜索链接）
      const stableData = getStableGeographyData();
      state.data.geography = stableData;
      renderGeography(stableData);
      return;
    }

    // 过滤往期推荐中的不稳定链接
    if (data.pastRecommendations) {
      data.pastRecommendations = data.pastRecommendations.map(p => {
        if (isUnstableUrl(p.url)) {
          return { ...p, url: baiduSearchUrl(p.title) };
        }
        return p;
      });
    }

    state.data.geography = data;
    renderGeography(data);
  } catch (err) {
    // 降级：使用本地稳定数据（百度搜索链接）
    const stableData = getStableGeographyData();
    state.data.geography = stableData;
    renderGeography(stableData);
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

// 音乐推荐：客户端每日选取1个JLRS-LeoFM视频，不与历史重复
async function fetchMusicRecommendation() {
  const data = clientSideMusicRecommendation();
  state.data.musicRecommendation = data;
  renderMusicRecommendation(data);
}

// 播客：客户端每日选取1个B站学习视频，不与历史重复
async function fetchPodcast() {
  const data = clientSidePodcastSelection();
  state.data.podcast = data;
  renderPodcast(data);
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
      ${item.url && item.url !== '#' ? `<a href="${item.url}" target="_blank" rel="noopener" class="article-link">搜索阅读原文 ›</a>` : ''}
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
      ${featured.url && featured.url !== '#' ? `<a href="${featured.url}" target="_blank" rel="noopener" class="article-link">搜索阅读全文 ›</a>` : ''}
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
