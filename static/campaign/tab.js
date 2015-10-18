define(function(require, exports){
    var app = require('app');
    var $ = require('jquery');
    var view = require('view');
    var common = require("common");
    var util = require('util');

    // 选项卡
    function Base(config, parent){
        config = $.extend({
            'class': 'M-tab',
            // 展现形式 tab - 标签, button - 按钮组
            'type': 'tab',
            'target': parent,
            'list': {
                // "text":LANG("操作系统")
                // ,"action":"grid/os"
                // ,render:function(){
                // /*code*/
                // }
                // ,"module":"grid.os"
                // ,"html":''
            },
            'active': null
        }, config);
        this.active = null;
        this.$origin_conf = null;
        Base.master(this, null, config);
    }
    extend(Base, view.container, {
        init: function(){
            this.build();
            this.switchTab(this.config.active);
        },
        /**
         * 构建结构
         * @return {Undefined} 无返回值
         */
        build:function(){
            var c = this.config;
            var type = c.type;
            this.tabs = {};
            if (type === 'button'){
                this.head = $('<div class="G-buttonGroup"/>').appendTo(this.el);
                this.body = $('<div class="M-tabButtonBody"/>').appendTo(this.el);
            }else {
                this.head = $('<ul class="M-tabHead clear"></ul>').appendTo(this.el);
                this.body = $('<div class="M-tabBody"></div>').appendTo(this.el);
            }

            var tab, li, div, first = null;
            for (var name in c.list){
                // 构造tab
                tab = c.list[name];
                if (type === 'button'){
                    li = $('<input class="btn" type="button" />').val(tab.text);
                }else{
                    li = $('<li/>').text(tab.text);
                }
                li.attr('data-tab', name).appendTo(this.head);
                div = $('<div/>').attr('class', tab['class']).appendTo(this.body);
                if (tab.html){
                    div.html(tab.html);
                }

                // 绑定事件
                this.jq(li, 'click', 'eventClick');

                this.tabs[name] = {
                    name: name,
                    head: li,
                    body: div,
                    run: false
                };
                if (!first){
                    first = name;
                }
            }
            this.render();

            // 激活初始分页
            if (!c.active || !this.tabs.hasOwnProperty(c.active)){
                c.active = first;
            }
        },
        /**
         * 切换至指定的tab
         * @param  {String} name tab名
         * @return {Object}      指定的tab对象。未找到时返回null。
         */
        switchTab: function(name){
            if (name == this.active || !this.tabs.hasOwnProperty(name)){
                return null;
            }
            var cls = (this.config.type === 'button' ? 'selected' : 'act');
            var item = this.tabs[name];
            this.head.children().removeClass(cls);
            item.head.addClass(cls);
            this.body.children().removeClass(cls);
            item.body.addClass(cls);

            if (!item.run){
                // 未创建过则进入构建流程
                var c = this.config.list[name], uri;
                if(c){
                    // 选项卡内的第一层不受已打开的子表格规则影响
                    delete c.acted_subs;
                }
                item.run = true;
                // render,action,module不可共存
                // 权重render > action > module
                if (app.util.isFunc(c.render)){
                    c.render.call(c.context || this, item, c);
                }else if(c.action){
                    item.body.addClass('loading');
                    uri = c.action.split('/', 3);
                    uri[2] = {
                        'module':this
                        ,'item':item
                        ,'config':c
                    };
                    var boot = require('boot');
                    boot.run.apply(boot, uri);
                }else if(c.module){
                    item.body.addClass('loading');
                    item.dirty = false;
                    var m = c.module;
                    var o = this.$origin_conf;
                    if (o){
                        delete o.list;
                        delete o.target;
                        // 选项卡内的第一层不受已打开的子表格规则影响
                        delete o.acted_subs;
                    }
                    var conf = $.extend({target: item.body}, o, m.config);
                    var callback = function(mod){
                        // 取消loadding界面
                        item.instance = mod;
                        item.body.removeClass('loading');
                    }
                    if (util.isString(m)){
                        this.createAsync(name, m, conf, callback);
                    }else {
                        m.config.target = item.body;
                        this.createAsync(name, m.uri, conf, callback);
                    }
                }
            }

            this.active = name;
            this.fire('tabChange', item);

            return item;
        },
        eventClick: function(evt, elm){
            var tab = $(elm).attr('data-tab');
            this.switchTab(tab);
        },
        getContainer: function(name){
            var item = this.tabs[name];
            if (item){
                return item.body;
            }else {
                return null;
            }
        },
        // 隐藏头部
        hideTabHeader: function(){
            this.head.hide();
        }
    });
    exports.base = Base;

    // 批量tab（批量见活动用）
    var BatchTab = app.extend(view.container, {
        init: function(config){
            config = $.extend({
                'class': 'M-batchTab',
                'add': {
                    'text': LANG('+添加渠道'),
                    'type': LANG('渠道')
                },
                'list': []
            }, config);

            this.guid = 1;
            this.last = null;

            BatchTab.master(this, null, config);
            BatchTab.master(this, "init", arguments);

            this.build();
        },
        build: function(){
            var self = this;
            var c = self.config;
            var el = self.el;
            self.headCon = $('<div class="M-batchTabHeadCon"/>').appendTo(el);
            self.head = $('<ul class="M-batchTabHead"/>').appendTo(self.headCon);
            self.add = $('<a href="" class="M-batchTabAdd"/>')
                .text(c.add.text).appendTo(el);
            self.body = $('<div class="M-batchTabBody"/>').appendTo(el);



            if(c.list && c.list.length){
                util.each(c.list, function(item){
                    if(item){
                        self.buildTab(item);
                    }
                });
            }

            self.buildTab({
                'text': c.add.type + self.guid,
                'name': 'tab' + self.guid,
                'guid': self.guid,
                'id': null
            });
            self.setActive(self.guid);

            // 创建滚动条
            self.create('scroll', common.scroller, {
                target: self.headCon.width(1000),
                content: self.head,
                watch: 800,
                dir: 'H'
            });

            self.jq(self.add, 'click', 'eventAddTab');
            self.dg(self.head, 'li', 'click', 'eventClick');
            self.dg(el, '.cancel', 'click', 'eventCancelClick');
        },
        buildTab: function(item){
            if(item){
                var self = this;
                var li = $('<li/>').text(item.text)
                    .attr({
                        'data-tab': item.name,
                        'data-id': item.id,
                        'data-guid': item.guid
                    })
                    .appendTo(self.head);
                $('<em class="cancel"/>').appendTo(li).attr('data-tab', item.name);
                return li;
            }
            return this;
        },
        eventClick: function(evt, elm){
            var guid = $(elm).attr('data-guid');
            this.setActive(guid);
            this.fire('batchTabChange', $(elm).data());
        },
        eventCancelClick: function(evt, elm){
            this.fire('batchTabCancel',$(elm).parent().data());
            $(elm).parent().remove();
            this.setActive();
            return false;
        },
        eventAddTab: function(evt, elm){
            var c = this.config;
            this.guid++;
            var tab = this.buildTab({
                'text': c.add.type + this.guid,
                'name': 'tab' + this.guid,
                'guid': this.guid
            });
            this.$.scroll.measure();
            this.eventClick(null, tab);
            return false;
        },
        setActive: function(guid){
            var self = this;
            var lis = self.head.find('li')
            // 记录最上一次tab
            var last = lis.filter('.act');
            if(!last.length){
                last = lis.first();
            }
            var lastData = last.data();
            lastData.el = last;
            self.last = lastData;
            lis.removeClass('act');
            if(guid){
                lis.filter('[data-guid="'+guid+'"]').addClass('act');
            }else{
                lis.first().addClass('act');
            }
            return self;
        },
        getContainer: function(name){
            return this.body;
        },
        getActive: function(attr){
            var act = this.head.find('.act');
            var text = act.text();
            if(attr){
                // 改变显示文字
                var em = act.find('em');
                if(attr.text){
                    text = text.split('（')[0] + '（' + attr.text + '）';
                }
                act.text(text).attr('data-id', attr.id || null).append(em);
            }
            return act;
        },
        getLast: function(){
            return this.last;
        },
        reset: function(){
            this.guid = 1;
            this.last = null;
        }
    });
    exports.batchTab = BatchTab;

    // 子表格标签模块(响应子表格更新操作)
    var SubBase = app.extend(Base, {
        init:function(config){
            if (config.filterList){
                this.filterConfig(config);
            }
            SubBase.master(this, null, config);
            this.$origin_conf = config;
            SubBase.master(this, "init", arguments);
        },
        // 子表格参数更新
        onUpdateSubGrid: function(ev){
            this.$origin_conf = ev.param;
            util.each(this.tabs, function(item){
                item.dirty = true;
            });
            this.updateActiveGrid();
            return false;
        },
        // 重写切换标签方法, 增加更新子表格调用
        switchTab: function(name){
            var item = SubBase.master(this, 'switchTab', arguments);
            if (item){
                this.updateActiveGrid();
            }
        },
        /**
         * 更新当前激活的tab中的表格
         * @return {Undeifned} 无返回值
         */
        updateActiveGrid:function(){
            var item = this.tabs[this.active];
            if (item && item.dirty && item.instance){
                item.dirty = false;
                item.instance.cast('updateSubGrid', this.$origin_conf);
            }
        }
        // 根据子表格条件过滤选项卡项目
        ,filterConfig:function(config){
            if (!config){ return; }
            var sub_param = config.sub_param,
                filter = config.filterList;

            if (!sub_param || !filter) { return config; }
            sub_param = util.parse(sub_param, ',', '|');

            util.each(config.list, function(val, name){
                name = filter[name];
                if (name && sub_param[name]){
                    return null;
                }
            });
            delete config.filterList;
            return config;
        }
    });

    // 客户端属性
    var Client = app.extend(SubBase, {
        init:function(config){
            config = $.extend({
                "list":{
                    "os":{
                        "text":LANG("操作系统")
                        ,"module": "grid.os"
                    }
                    ,"browser":{
                        "text":LANG("浏览器")
                        ,"module": "grid.browser"
                    }
                    ,"language":{
                        "text":LANG("语言")
                        ,"module": "grid.language"
                    }
                    ,"resolution":{
                        "text":LANG("落地页分辨率")
                        ,"module": "grid.resolution"
                    }
                    ,"pixels":{
                        "text":LANG("窗口大小")
                        ,"module": "grid.pixels"
                    }
                }
                ,"filterList":{
                    "os":"os_type_id",
                    "browser":"browser_type_id",
                    "language":"language_id",
                    "resolution":"resolution_id",
                    "pixels":"pixels"
                }
            }, config);
            Client.master(this, "init", arguments);
        }
    });
    exports.client = Client;

    // 代理活动与一般媒体与广告位
    var MediaAndAd = app.extend(SubBase, {
        init:function(config){
            config = $.extend({
                "list":{
                    "ad":{
                        "text":LANG("广告位")
                        ,"module": "grid.ads"
                    }
                    ,"media_domain":{
                        "text":LANG("媒体域名")
                        ,"module":{
                            "uri":"grid.mediaDomain"
                            ,"config":{
                                "hasDate":false
                            }
                        }
                    }
                    ,"media":{
                        "text":LANG("媒体")
                        ,"module": "grid.media"
                    }
                    ,"channel":{
                        "text":LANG("渠道")
                        ,"module": "grid.channel"
                    }
                }
                ,"filterList":{
                    "ad":"spot_id",
                    "media_domain":"referer_domain_id",
                    "media":"medium_id",
                    "channel":"channel_id"
                }
            }, config);
            MediaAndAd.master(this, "init", arguments);
        }
    });
    exports.mediaAndAd = MediaAndAd;

    // 产品与平台
    var ProductAndPlatform = app.extend(SubBase, {
        init:function(config){
            config = $.extend({
                "list":{
                    "product":{
                        "text":LANG("产品")
                        ,"module": "grid.product"
                    }
                    ,"platform":{
                        "text":LANG("平台")
                        ,"module": "grid.platform"
                    }
                }
                ,"filterList":{
                    "product":"product_id",
                    "platform":"platform_id"
                }
            }, config);
            ProductAndPlatform.master(this, "init", arguments);
        }
    });
    exports.productAndPlatform = ProductAndPlatform;


    // RTB媒体和广告位
    var MediaAndAdCampaign = app.extend(SubBase, {
        init:function(config){
            config = $.extend({
                "list":{
                    "ad":{
                        "text":LANG("广告位")
                        ,"module":"grid.adsCampaign"
                    }
                    ,"ad_size":{
                        "text":LANG("尺寸")
                        ,"module":{
                            "uri":"grid.spotSize"
                            ,"config":{
                                "hasDate":false
                                ,"hasAdd":false
                            }
                        }
                    }
                    ,"media_domain":{
                        "text":LANG("媒体域名")
                        ,"module":{
                            "uri":"grid.mediaDomain"
                            ,"config":{
                                "hasDate":false
                            }
                        }
                    }
                    ,"media":{
                        "text":LANG("媒体")
                        ,"module":"grid.media"
                    }
                    ,"channel":{
                        "text":LANG("渠道")
                        ,"module":"grid.channel"
                    }
                    ,"screen":{
                        "text":LANG("屏次")
                        ,"module":{
                            "uri":"grid.spotScreen"
                            ,"config":{
                                "hasDate":false
                            }
                        }
                    }
                }
                ,"filterList":{
                    "ad":"spot_id",
                    "media":"medium_id",
                    "channel":"channel_id",
                    "ad_size":"spot_size_id",
                    "media_domain":"referer_domain_id",
                    "screen":"spot_screen_id"
                }
            }, config);

            MediaAndAdCampaign.master(this,"init",arguments);
        }
    });
    exports.mediaAndAdCampaign = MediaAndAdCampaign;

    //地域列表的TAB
    var GeoTab = app.extend(SubBase, {
        init:function(config){
            config = $.extend({
                'type': 'button',
                'active': 'table',
                "list":{
                    "map":{
                        "text":LANG("图")
                        ,"module":"grid.geoMap"
                    }
                    ,"table":{
                        "text":LANG("表")
                        ,"module":"grid.geo"
                    }
                }
            },config);

            GeoTab.master(this,"init",arguments);
            this.el.css('position','relative');
        }
    });
    exports.geo = GeoTab;

    var AdsAndOtherComplexTab = app.extend(SubBase,{
        init:function(config){
            config = $.extend({
                "list":{
                    "ad":{
                        "text":LANG("广告位")
                        ,"module":{
                            "uri":"pages/ads.list"
                            ,"config":{
                                "hasDate":false
                                ,"hasAdd":false
                            }
                        }
                    }
                    ,"media":{
                        "text":LANG("媒体")
                        ,"module":{
                            "uri":"pages/media.main"
                            ,"config":{
                                "hasDate":false
                            }
                        }
                    }
                    ,"channel":{
                        "text":LANG("渠道")
                        ,"module":{
                            "uri":"pages/channel.main"
                            ,"config":{
                                "hasDate":false
                            }
                        }
                    }
                }
                ,"filterList":{
                    "ad":"spot_id",
                    "media":"medium_id",
                    "channel":"channel_id"
                }
            },config);
            AdsAndOtherComplexTab.master(this,"init",arguments);
        }
    });
    exports.adsAndOtherComplexTab = AdsAndOtherComplexTab;

    var ProductAndPlatformComplexTab = app.extend(SubBase,{
        init:function(config){
            config = $.extend({
                "list":{
                    "product":{
                        "text":LANG("产品")
                        ,"module":{
                            "uri":"pages/product.list"
                            ,"config":{
                                "hasDate":false
                                ,"hasAdd":false
                            }
                        }
                    }
                    ,"platform":{
                        "text":LANG("平台")
                        ,"module":{
                            "uri":"pages/platform.main"
                            ,"config":{
                                "hasDate":false
                            }
                        }
                    }
                }
                ,"filterList":{
                    "product":"product_id",
                    "platform":"platform_id"
                }
            },config);
            ProductAndPlatformComplexTab.master(this,"init",arguments);
        }
    });
    exports.productAndPlatformComplexTab = ProductAndPlatformComplexTab;

    // 创意包与创意审核列表
    var VerifyTab = app.extend(SubBase,{
        init:function(config){
            config = $.extend(
                true
                ,{
                    "list":{
                        "product":{
                            "text":LANG("创意包")
                            ,"module":"grid.sweetyVerify"
                        }
                        ,"platform":{
                            "text":LANG("创意")
                            ,"module":{
                                "uri":"pages/creative.verifyList"
                                ,"config":{
                                    'param':{},
                                    'hasPager':true,
                                    'isLoadSweety':false
                                }
                            }
                        }
                    }
                    ,"filterList":{
                        "product":"package_id",
                        "platform":"creative_id"
                    }
                }
                ,config
            );
            VerifyTab.master(this,"init",arguments);
        }
    })
    exports.verifyTab = VerifyTab;

    var AdminOrderManageTab = app.extend(SubBase,{
        init:function(config){
            config = $.extend({
                "list":{
                    "preferred":{
                        "text":LANG("产品")
                        ,"module":{
                            "uri":"pages/product.list"
                            ,"config":{
                                "hasDate":false
                                ,"hasAdd":false
                            }
                        }
                    }
                    ,"private":{
                        "text":LANG("平台")
                        ,"module":{
                            "uri":"pages/platform.main"
                            ,"config":{
                                "hasDate":false
                            }
                        }
                    }
                }
                ,"filterList":{
                    "product":"product_id",
                    "platform":"platform_id"
                }
            },config);
            AdminOrderManageTab.master(this,"init",arguments);
        }
    });
    exports.adminOrderTab = AdminOrderManageTab;
});