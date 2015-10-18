/********************
 *	系统全局配置信息
 ********************/
define(function(require){
    var BASE = window.BASE;

    var default_info = {
        "title":_T('biddingx 广告整合优化平台'),
        "logo":"resources/images/dsp_logo.png",
        "big_logo":"resources/images/dsp_logo_c.png",
        "copyright":_T('&copy; 2012 - '+(new Date()).getFullYear()+' Biddingx 粤ICP备12093772号-1'),
        "show_privacy":1,
        "domain":"manager.biddingx.com",
        "custom_domain": "stuff.cdn.biddingx.com",
        "custom_domainA": "whisky.ana.biddingx.com",
        "custom_domainB": "masky.biddingx.com"
    };
    var info = window.APP_THEME || default_info;
    var front_base = 'http://'+info.domain+'/';

    return {
        // 调试模式
        debug: window.APP_DEBUG || 0,
        // 默认路由入口
        router: {
            default_module: 'campaign',
            default_action: 'main'
        },
        // 系统Logo
        app_logo: BASE(info.logo),
        app_logo_big: BASE(info.big_logo),
        // 系统名称
        app_title: info.title,
        // 系统CopyRight
        app_copyright: info.copyright,
        // 是否显示隐私控制
        app_show_privacy: +info.show_privacy,
        // 代码中心独立PDMP数据采集域名
        app_custom_domain: default_info.custom_domain,
        // 代码中心基础统计代码
        app_custom_domainA: default_info.custom_domainA,
        // 代码中心1像素图片／Flash版PDMP代码收集
        app_custom_domainB: default_info.custom_domainB,
        // 控制器所在目录
        app_base: BASE('app/'),
        // 模板文件基础路径
        tpl_base: BASE('tpl/'),
        // 预览文件地址
        preview_page: BASE('preview.html?Path={1}&Height={2}&Width={3}&FileType={4}'),
        // 活动创意模拟预览
        preview_spot: BASE('spot.html?Id={1}&SetSweetyCreativeId={2}#'+encodeURIComponent(front_base)),
        // 广告资源地址路径
        front_base: front_base,
        // 落地页、创意包、创意的下载地址
        download_page: front_base+"sweety/download?Type={1}&Id={2}",
        // 图片缩略工具地址
        // thumb_script: front_base+"sweety/imageshow?Path={1}&Height={2}&Width={3}",
        thumb_script: "{1}&h={2}&w={3}",
        // 数据中心参数配置
        data:{
            max_query: 10,
            points: {
                '/rest/listadgroup': '/sweety/listadposition',
                '/rest/listcampaigngo': '/nextgen/listCampaign',
                '/rest/listcampaign': '/nextgen/listCampaign',
                '/rest/listadposition': '/nextgen/listadposition',
                '/rest/listwhiskycreative': '/nextgen/listwhiskycreative',
                '/rest/listsweety': '/nextgen/listsweety',
                '/rest/listsweetycreative': '/nextgen/listsweetycreative',
                '/rest': '/sweety',
                '/i18n': BASE('i18n/')
            }
        },
        // 多语言配置
        language:{
            'default': 'zh_CN',
            'cookie': 'lang',
            'style': BASE('i18n/')
        },
        // 默认图片
        default_img: {
            product: BASE('resources/images/default.png'),
            sweety: BASE('resources/images/default.png'),
            'package': BASE('resources/images/default.png'),
            creative: BASE('resources/images/default.png'),
            whisky: BASE('resources/images/default.png')
        },
        // 创意类型
        sweety_type: {
            10001: 'GIF',
            10002: 'JPG',
            10003: 'PNG',
            20001: 'SWF',
            20002: 'FLV'
        },
        default_tab_cols: {
            "default":{
                "text":_T('默认'),
                "cols":[
                    "impressions"
                    ,"clicks"
                    ,"click_rate"
                    ,"back_pageviews"
                    ,"click_reach_rate"
                    ,"back_regs"
                    ,"back_reg_rate"
                    ,"cpm"
                    ,"avg_click_cost"
                    ,"avg_reg_cost"
                    // ,"back_reach_cost"
                    ,"cost"
                    ,"win_rate"
                ],
                "custom":true
            }
            ,"creative":{
                "text":_T('前端'),
                "cols":[
                    "impressions"
                    ,"new_impressions"
                    ,"old_impressions"
                    // ,"sessions"
                    ,"visitors"
                    ,"clicks"
                    ,"click_rate"
                    // ,"input"
                    ,"old_visitors"
                    // ,"reviews"
                    ,"new_visitors"
                    ,"new_visitor_rate"
                    ,"old_visitor_rate"
                    ,"click_reach_rate"
                    // ,"avg_loadtime"
                    // ,"avg_pagepixels"
                ]
            }
            ,"whisky":{
                "text":_T('落地页'),
                "cols":[
                    "back_pageviews"
                    ,"back_visitors"
                    ,"back_sessions"
                    ,"back_clicks"
                    ,"back_click"
                    ,"back_click_rate"
                    ,"back_inputs"
                    ,"back_new_visitors"
                    ,"back_new_pageviews"
                    ,"back_new_visitor_rate"
                    ,"back_old_visitors"
                    ,"back_old_visitor_rate"
                    ,"back_avg_staytime"
                    ,"back_avg_loadtime"
                    ,"back_avg_pagepixels"
                ]
            }
            ,"transform":{
                "text":_T('转化'),
                "cols":[
                    "back_regs"
                    ,"back_reg_click_rate"
                    ,"back_reg_rate"
                    ,"back_logins"
                    ,"back_login_click_rate"
                    // ,"back_login_rate"
                    ,"reg_per_mile"
                    ,"login_per_mile"
                ]
            }
            ,"cost":{
                "text":_T('成本'),
                "cols":[
                    "avg_click_cost"
                    ,"cpm"
                    ,"avg_reg_cost"
                    ,"back_reach_cost"
                    ,"cost"
                ]
            }
            ,"bid":{
                "text":_T('竞价'),
                "cols":[
                    "request_num"
                    ,"bid_num"
                    ,"win_num"
                    ,"win_rate"
                    ,"bid_use_rate"

                    // ,"new_bid_num"
                    // ,"new_win_num"
                    // ,"new_win_rate"
                ]
            }
        },
        // 特定账号过滤指标
        filter_tab_cols: [
            {
                userId: require('./auth').filter_tab_cols,
                exclude_cols: ['cost', 'bid'],
                exclude_cols_item: []
            }
        ],
        //客户端设置
        client: {
            os:[
                {
                    'text':_T('Windows'),
                    'list': {
                        10015:'Win7',
                        10018:'WinVista',
                        10019:'WinXP',
                        10054:'Win8',
                        10065:'Win10'
                    }
                },
                {
                    'text':_T('Unix'),
                    'list': {
                        10028:'MacOSX',
                        10050:'Ubuntu',
                        10051:'CentOS',
                        10052:'Debian',
                        10053:'RedHat'
                    }
                }
            ],
            browser:[
                {
                    'text':_T('主流'),
                    'list': {
                        10019: 'IE',
                        10156: '360安全',
                        11556: '360极速',
                        10004: 'Chrome',
                        10050: 'Safari',
                        10013: 'Firefox',
                        15356: 'QQBrowser',
                        10036: 'Maxthon',
                        15256: '搜狗',
                        10236: '猎豹',
                        10136: '2345'
                    }
                },
                {
                    'text':_T('非主流'),
                    'list': {
                        10856: 'BaiduBrowser',
                        10003: 'BlackBerry',
                        12356: 'Firebird',
                        14556: 'Myie',
                        10039: 'Mozilla',
                        15056: 'Netscape',
                        10042: 'Opera',
                        15456: 'UCWEB',
                        15656: 'webOS',
                        15856: 'TT',
                        15756: 'WebPro',
                        15956: 'TheWorld'
                    }
                }
            ],
            language:{
                10000:'简体中文',
                10001:'繁体中文(台湾)',
                10002:'丹麦语',
                10003:'西班牙语(美国)',
                10004:'朝鲜语',
                10005:'英语(美国)',
                10006:'瑞典语',
                10007:'挪威语',
                10008:'德语',
                10009:'日语',
                10010:'葡萄牙语',
                10011:'西班牙语',
                10012:'法语',
                10013:'荷兰语',
                10014:'意大利语',
                10015:'繁体中文(香港)',
                10016:'中文',
                10017:'英语(英国)',
                10018:'英语(爱尔兰)',
                10019:'英语(澳大利亚)',
                10020:'英语(伯利兹)',
                10021:'英语(菲律宾)',
                10022:'英语(南非)',
                10023:'英语(新西兰)'
            }
        },
        // 移动端RTB
        moblieClientRTB: {
            'deviceType': [
                {
                    'text':_T('手机'),
                    'list': {
                        0:'手机'
                    }
                },
                {
                    'text':_T('平板'),
                    'list': {
                        1:'平板'
                    }
                },
                // {
                // 	'text':_T('PC'),
                // 	'list': {
                // 		2:'PC'
                // 	}
                // },
                {
                    'text':_T('电视'),
                    'list': {
                        3:'电视'
                    }
                }
            ],
            'os':[
                {
                    'text':_T('IOS'),
                    'list': {
                        20028:'IOS'
                    }
                },
                {
                    'text':_T('安卓'),
                    'list': {
                        10006:'Android'
                    }
                }
            ],
            'deviceBrand': [
                {
                    'text':_T('华为'),
                    'list': {
                        'Huawei':'华为'
                    }
                },
                {
                    'text':_T('vivo'),
                    'list': {
                        'vivo':'vivo'
                    }
                },
                {
                    'text':_T('三星'),
                    'list': {
                        'samsung':'三星'
                    }
                },
                {
                    'text':_T('小米'),
                    'list': {
                        'Xiaomi':'小米'
                    }
                },
                {
                    'text':_T('苹果'),
                    'list': {
                        'apple':'苹果'
                    }
                }
            ],
            'deviceModel':[
                {
                    'text':_T('华为'),
                    'list': {
                        'HUAWEI G750-T01':'荣耀3X'
                    }
                },
                {
                    'text':_T('vivo'),
                    'list': {
                        'vivo X5L':'vivo X5',
                        'vivo X3t':'vivo X3t'
                    }
                },
                {
                    'text':_T('三星'),
                    'list': {
                        'SM-N9005':'Glaxy Note3',
                        'GT-I9300':'Glaxy S3',
                        'GT-N7100':'Glaxy Note2'
                    }
                },
                {
                    'text':_T('小米'),
                    'list': {
                        'hongmi':'红米',
                        'hongmi 1s':'红米1s',
                        'hongmi note 1':'红米note1',
                        'mi 1s':'小米1s',
                        'mi 2s':'小米2s',
                        'mi 3':'小米3',
                        'mi 4':'小米4'
                    }
                },
                {
                    'text':_T('苹果'),
                    'list': {
                        'iphone 2g':'iphone 2g',
                        'iphone 3g':'iphone 3g',
                        'iphone 3gs':'iphone 3gs',
                        'iphone 4':'iphone 4',
                        'iphone 4s':'iphone 4s',
                        'iphone 5':'iphone 5',
                        'iphone 5c':'iphone 5c',
                        'iphone 5s':'iphone 5s',
                        'iphone 6 plus':'iphone 6 plus',
                        'iphone 6':'iphone 6',
                        'ipad 1g':'ipad 1g',
                        'ipad 2':'ipad 2',
                        'ipad mini 1g':'ipad mini 1g',
                        'ipad 3':'ipad 3',
                        'ipad 4':'ipad 4',
                        'ipad air':'ipad air',
                        'ipad mini 2':'ipad mini 2',
                        'ipad mini 3':'ipad air 2'
                    }
                }
            ],
            'network': [
                {
                    'text':_T('wifi'),
                    'list': {
                        1:'Wifi'
                    }
                },
                {
                    'text':_T('2G'),
                    'list': {
                        2:'2G'
                    }
                },
                {
                    'text':_T('3G'),
                    'list': {
                        3:'3G'
                    }
                },
                {
                    'text':_T('4G'),
                    'list': {
                        4:'4G'
                    }
                }
            ]

        }
        ,country:{
            "china":10761
        }
        // 用户模块设置
        // 0,无类型或旧用户;
        // 1,游戏用户;
        // 2,电商用户
        ,userModules:{
            // 次级列表与更多活动信息内部模块的设定
            "subgrid":{
                // 排除
                "exclude":{
                    "0":['platform'],
                    "1":['platform'],
                    "2":["productAndPlatform"]
                }
            }
            ,"addCreative":{
                "exclude":{
                    "2":["linkedGame"]
                }
            }
            ,"AddWhisky":{
                "exclude":{
                    "2":["linkedGame"]
                }
            }
            ,"head":{
                "exclude":{
                    "2":["#product"]
                }
            }
        }
        ,exchanges: require('./exchanges')
        ,exchange_group: {
            // 保存需要检查广告分类的渠道
            ad_class: [10004,10023,10009,10024,10016,10027,10028,10029,10030,10031,10033,10035,10044,10048],
            // 保存需要检查敏感词分类的渠道
            sens_class: [10014],
            tanx: [10004,10023], // tanx类渠道ID
            baidu: [10009], // 百度类渠道
            baidu_ad: [10009,10024], // 百度类渠道需要行业分类
            yigao: [10014], // 亿告类渠道
            tencent: [10002], // 腾讯类渠道, 有广告分类
            video_class: [10002, 10020], // 广告位有视频分类渠道
            youku: [10008, 10022], // 优酷类渠道
            youkuMoblie: [10008], // 优酷移动
            googlePC: [10007],	// 谷歌PC
            google: [10007, 10026], // 谷歌类渠道
            mongo: [10016, 10026], // 芒果类渠道
            appFlood: [10027], // 木瓜移动类渠道
            valueMaker: [10029], // 万流客渠道
            huzhong: [10028], // 互众渠道
            sohu: [10025], // 搜狐渠道
            chuanyang: [10030], // 传漾渠道
            haiyun: [10031], // 海云渠道
            juxiaoPC: [10044], //聚效PC
            juxiao: [10033, 10044], // 聚效和聚效移动
            dm: [10035], // 地幔
            xunfei: [10051], // 讯飞移动
            weibo: [10048], // 新浪微博移动
            yingji: [10060], // 鹰击
            yi: [10015, 10017, 10018, 10019, 10021], // 易传媒类渠道
            pptv: [10061],	// PPTV
            zhongtian: [10069, 10070],	// 中天
            letv: [10050, 10041],	// 乐视
            no_domain: [10001,10002,10003,10005], // 活动诊断没有域名维度的渠道
            app_class: [10024, 10027, 10033, 10043], // 有app分类渠道，格式和mogo app分类不同
            channel_class: [10025], //有频道分类渠道
            videoClassMap: {
                10002: BASE('data/tencent_video.json') // 腾讯视频分类
                ,10020: BASE('data/sinaVideo_video.json') // 新浪视频视频分类
            },
            moblieAppClassMap: {
                10024: BASE('data/baidumobile_app.json') // 百度移动app分类
                ,10027: BASE('data/appFlood_app.json') // 木瓜移动app分类
                ,10033: BASE('data/juxiao_app.json') // 聚效移动app分类
                ,10043: BASE('data/baofengmobile_app.json') // 暴风移动app分类
            },
            mediaClassMap: {
                10025: BASE('data/sohu_media.json') // 搜狐媒体分类
            },
            aptitude_group: [10002, 10009, 10010, 10025, 10028, 10004, 10040, 10048, 10013, 10055, 10056, 10049, 10061, 10057, 10058], // 添加资质需要审核的渠道
            newAptitude: [10004, 10013, 10055, 10056, 10057, 10058] // 新资质提交送审验证渠道
        }
        // 特别权限账号id
        ,auth: require('./auth')
        ,'const':{
            'ITEM_EXIST': 2001
        }
        // 操作日志 op记录类型
        ,'log_type': {
            1000: "添加产品",
            1001: "删除产品",
            1002: "修改产品",

            1100: "添加创意包",
            1101: "删除创意包",

            1200: "添加落地页",
            1201: "删除落地页",

            1300: "添加白名单",
            1301: "删除白名单",
            1302: "修改白名单",

            1400: "添加黑名单",
            1401: "删除黑名单",
            1402: "修改黑名单",

            1502: "修改特殊条件",

            1600: "添加单独广告位出价",
            1601: "删除单独广告位出价",
            1602: "修改单独广告位出价"
        }
        ,'TencentClass': [
            {'_id': '001', 'Name': '网络游戏类'},
            {'_id': '002', 'Name': '服饰类'},
            {'_id': '003', 'Name': '日化类'},
            {'_id': '004', 'Name': '网络服务类'},
            {'_id': '005', 'Name': '个人用品类'},
            {'_id': '006', 'Name': '零售及服务类'},
            {'_id': '007', 'Name': '娱乐及消闲类'},
            {'_id': '008', 'Name': '教育出国类'},
            {'_id': '009', 'Name': '家居装饰类'},
            {'_id': '010', 'Name': '食品饮料类'},
            {'_id': '011', 'Name': '交通类'},
            {'_id': '012', 'Name': 'IT产品类'},
            {'_id': '013', 'Name': '消费类电子类'},
            {'_id': '014', 'Name': '医疗服务类'},
            {'_id': '015', 'Name': '金融服务类'},
            {'_id': '016', 'Name': '运营商类'},
            {'_id': '017', 'Name': '房地产类'},
            {'_id': '018', 'Name': '其他类'}
        ]
        ,'SohuClass': [
            {'_id': '101000', 'Name': '品牌'},
            {'_id': '102101', 'Name': '电商'},
            {'_id': '102102', 'Name': '游戏'},
            {'_id': '102100', 'Name': '其他'}
        ]
        ,'CustomerIndustry': [
            {'_id': 0, 'Name': '选择行业分类'},
            {'_id': 1001, 'Name': '服装内衣'},
            {'_id': 1002, 'Name': '鞋包配饰'},
            {'_id': 1003, 'Name': '体育健身与户外运动'},
            {'_id': 1004, 'Name': '手机数码与消费电子'},
            {'_id': 1005, 'Name': '家用电器'},
            {'_id': 1006, 'Name': '办公用品'},
            {'_id': 1007, 'Name': '美容与个人护理'},
            {'_id': 1008, 'Name': '母婴'},
            {'_id': 1009, 'Name': '家居生活'},
            {'_id': 1010, 'Name': '食品饮料'},
            {'_id': 1011, 'Name': '车辆'},
            {'_id': 1012, 'Name': '职业与教育'},
            {'_id': 1013, 'Name': '游戏'},
            {'_id': 1014, 'Name': '医疗保健'},
            {'_id': 1015, 'Name': '艺术与娱乐'},
            {'_id': 1016, 'Name': '生活服务'},
            {'_id': 1017, 'Name': '旅行与旅游'},
            {'_id': 1018, 'Name': '商务服务'},
            {'_id': 1019, 'Name': '互联网与电信'},
            {'_id': 1020, 'Name': '法律与政府'},
            {'_id': 1021, 'Name': '金融'},
            {'_id': 1022, 'Name': '房地产'},
            {'_id': 1023, 'Name': '农林牧渔'},
            {'_id': 1024, 'Name': '商业与工业'},
            {'_id': 1025, 'Name': '票务'},
            {'_id': 1026, 'Name': '新闻媒体与出版物'},
            {'_id': 1027, 'Name': '其他'},
            {'_id': 1028, 'Name': '敏感行业'}
        ]
        ,'smartMonitorIndex': [
            {Name: _T('成本'), _id: 'group', Unit: ''},
            {Name: _T('总消费'), _id: 'cost', Unit: _T('元')},
            {Name: _T('CPM'), _id: 'cpm', Unit: _T('元')},
            {Name: _T('CPA'), _id: 'cpa', Unit: _T('元')},
            {Name: _T('CPC'), _id: 'cpc', Unit: _T('元')},
            {Name: _T('到达单价'), _id: 'back_reach_cost', Unit: _T('元')},
            {Name: _T('前端'), _id: 'group', Unit: ''},
            {Name: _T('展示量'), _id: 'impressions', Unit: _T('次')},
            {Name: _T('点击量'), _id: 'clicks', Unit: _T('次')},
            {Name: _T('点击率'), _id: 'click_rate', Unit: _T('%'), NeedTrans: true},
            {Name: _T('点击到达率'), _id: 'click_reach_rate', Unit: _T('%'), NeedTrans: true},
            {Name: _T('转化'), _id: 'group', Unit: ''},
            {Name: _T('注册率'), _id: 'back_reg_rate', Unit: _T('%'), NeedTrans: true},
            {Name: _T('竞价'), _id: 'group', Unit: ''},
            {Name: _T('出价数'), _id: 'bid_num', Unit: _T('元')},
            {Name: _T('竞得率'), _id: 'win_rate', Unit: _T('%'), NeedTrans: true}
        ]
        ,'smartMonitorOperator': [
            {Name: _T('大于等于'), _id: '>='},
            //{Name: _T('大于'), _id: '>'},
            //{Name: _T('等于'), _id: '='},
            //{Name: _T('小于'), _id: '<'},
            {Name: _T('小于等于'), _id: '<='}
        ]
        ,'aptitudes': require('../data/aptitudes')
    };
});
