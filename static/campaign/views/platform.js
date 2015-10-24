define(function(require,exports) {
    var app = require("app")
        ,$ = require("jquery")
        ,view = require("view")
        ,util = require("util")
        ,common = require("common")
        ,balance = require("balance");

    /**
     * 顶部视图
     * @return {Undefined} 无返回值
     */
    var Head = app.extend(
        app.Module
        ,{
            init:function(config){
                this.config = $.extend(
                    {
                        // logo
                        "logo": util.formatIndex(
                            '<h1><a href="/" title="{1}"><img src="{2}"></a></h1>',
                            LANG(app.config('app_title')),
                            app.config('app_logo')
                        )
                        ,"nav":{
                        // 显示的项目
                        "list":[
                            // {
                            // 	"name":LANG("首页")
                            // 	,"uri":"#home"
                            // 	,"iconCls":"nav-home"
                            // 	,"act": 1
                            // }
                            {
                                "name":LANG("活动")
                                ,"uri":"#campaign"
                                ,"iconCls":"nav-campaign"
                                ,"act": 1
                            }
                            ,{
                                "name":LANG("创意包")
                                ,"uri":"#creative"
                                ,"iconCls":"nav-creative"
                                ,"filter": app.getUserAuth(app.config('auth/hide_creative'), 'isEmployee')
                            }
                            ,{
                                "name":LANG("落地页")
                                ,"uri":"#whisky"
                                ,"iconCls":"nav-whisky"
                            }
                            ,{
                                "name":LANG("广告位")
                                ,"uri":"#ads"
                                ,"iconCls":"nav-ads"
                            }
                            /*,{
                             "name":LANG("媒体")
                             ,"uri":"#media"
                             ,"iconCls":"nav-media"
                             }
                             ,{
                             "name":LANG("渠道")
                             ,"uri":"#channel"
                             ,"iconCls":"nav-channel"
                             }*/
                            ,{
                                "name":LANG("产品")
                                ,"uri":"#product"
                                ,"iconCls":"nav-product"
                            }
                            /*,{
                             "name":LANG("媒体资源")
                             ,"uri":"#ads/priceList"
                             ,"iconCls":"nav-pricelist"
                             }
                             ,{
                             "name":LANG("平台")
                             ,"uri":"#platform"
                             ,"iconCls":"nav-platform"
                             }*/
                            ,{
                                "name":LANG("组合维度")
                                ,"uri":"#mixedDimension"
                                ,"iconCls":"nav-Collect"
                            }
                            ,{
                                "name":LANG("汇总")
                                ,"uri":"#collect"
                                ,"iconCls":"nav-collect"
                            }
                            ,{
                                "name":LANG("管理后台")
                                ,"uri":"#admin"
                                ,"iconCls":"nav-Collect"
                            }
                        ]
                    }
                    },
                    config||{}
                );

                this.build();
                this.onUserLogin();
            }
            /**
             * 宽/窄屏设置
             */
            ,setHead:function(){
                var wideScreen = true; //window.screen.availWidth > 1024;
                this.inner.el[
                wideScreen && "addClass" || "removeClass"
                    ]("G-theWidescreenHead");
            }
            /**
             * 构造界面
             * @return {Undefined} 无返回值
             */
            ,build:function(){
                this.inner = this.create(
                    "innerBox"
                    ,view.container
                    ,{
                        "target":this.config.target
                        ,"class":"G-innerHead"
                    }
                );
                this.setHead();

                this.layout = this.create(
                    "headLayout"
                    ,view.layout
                    ,{
                        "target":this.inner.el
                        ,"grid":[1,3]
                        ,"cellSet":[
                            {"tag":"h1"}
                            ,{"class":"nav"}
                            ,{"class":"usertoolbar"}
                        ]
                    }
                );

                // 主导航
                var list = this.config.nav.list,
                    user = app.getUser();

                if (user){
                    var exclude = ','+app.config("userModules/head/exclude/" + user.type)+',';
                    util.each(list, function(item){
                        if(item.filter){
                            return null;
                        }
                        if (exclude.indexOf(','+item.uri+',') !== -1){
                            return null;
                        }
                    });
                }

                this.nav = this.create(
                    "nav"
                    ,Nav
                    ,{
                        "target":this.layout.get(1,1)
                        ,"list":list
                    }
                );

                // 余额
                this.balance = app.core.create(
                    "balance"
                    ,balance.base
                    ,{
                        "target":this.layout.get(2,1)
                    }
                );

                // 用户工具栏
                this.usertoolbar = this.create(
                    "usertoolbar"
                    ,Usertoolbar
                    ,{
                        "target":this.layout.get(2,1)
                    }
                );

                this.layout.get(0,1).html(this.config.logo);
            }
            ,toggleItem: function(uri, state, isRemove){
                return this.nav.toggleItem(uri, state, isRemove);
            }
            ,onUserLogin: function(ev){
                var user = app.getUser();
                var hasCollect = user && user.is_admin && user.origin_campany_id == user.campany_id;
                this.toggleItem("#collect", hasCollect);
                this.toggleItem('#collect', (user && !user.ufo && user.campany_type == 4));
                this.toggleItem('#admin', (user && !user.ufo));
            }
        }
    );

    /**
     * 导航视图
     * @param {Object}     config   导航设置
     * @return {Undefined}          无返回值
     */
    var Nav = app.extend(
        view.container
        ,{
            init:function(config){
                this.config = $.extend(
                    {
                        // 列表日期
                        "main":"ul"
                        // 列表标签
                        ,"el":"li"
                        // 合集标签
                        ,"cel":"div"
                        // 列表
                        ,"list":[]
                        // 追加区域
                        ,"target":"body"
                        // 激活样式
                        ,"actCls":"main"
                        // 默认选择第一个
                        ,'defaultSelect': 1
                    }
                    ,config
                );
                this.main = null;
                this.list = null;
                this.listBtns = {};
                this.collection = {}
                this.uri = window.location.href.replace(window.location.origin+"/","");
                this.uri = this.uri.length<2?0:this.uri;
                this.ready = 0;
                this.build();
            }
            /**
             * 构造界面
             * @return {Undefined} 无返回值
             */
            ,build:function(rebuild){
                var c = this.config;
                if (!rebuild){
                    if (this.ready) { return false; }
                    this.dg(c.target,c.el+'[data-uri]', 'click', 'eventClick');
                }else {
                    // todo: 删除之前创建的子对象与DOM元素
                    this.listBtns = {};
                    this.collection = {};
                }
                this.$setAct = null;

                if(util.isArray(c.list)){
                    this.buildItems(c.target, c.list, this);
                }else if(util.isObject(c.list)){
                    for(var n in c.list){
                        this.collection[n] = this.create(
                            view.container
                            ,{
                                "target":c.target
                                ,"tag":c.cel
                                ,"html":'<strong '+(c.list[n].iconCls && ('class="'+c.list[n].iconCls) || '')+'">'+c.list[n].name+'</strong>'
                            }
                        );
                        this.buildItems(
                            this.collection[n].el
                            ,c.list[n].items
                            ,this.collection[n]
                        );
                    }
                }

                this.updateActive();

                this.list = c.target.find(c.el+'[data-uri]');

                this.ready = 1;
            }
            ,buildItems:function(target,list,parent){
                var c = this.config;

                // 创建列表容器对象
                if(!parent.main){
                    parent.main = this.create(view.container, {
                        "tag":c.main
                        ,"target":target
                    });
                }

                var html = '', item, conf;
                for(var i =0;i<list.length;i++){
                    item = list[i];
                    conf = {
                        "tag":c.el
                        ,"class":item.iconCls
                        ,"html":'<a href="#"><b></b>'+item.name+'</a>'
                        ,"data-uri":item.uri
                        ,"stringify":1
                    };
                    html += parent.main.createDom(conf);

                    // 更新手工选中
                    if (item.act && !this.$setAct){
                        this.$setAct = item.uri;
                    }
                }
                // 添加到容器
                parent.list = $(html).appendTo(parent.main.el);

                // 以URI建立对象索引
                list = this.listBtns;
                parent.list.each(function(){
                    item = $(this);
                    conf = item.attr('data-uri');
                    list[conf] = item;
                });
            }
            ,updateActive: function(){
                var first = false,
                    found = false,
                    level = 0,
                    setAct = this.$setAct,
                    regx = /^[#\/]+/g,
                    c = this.config,
                    loc = window.location,
                    hash = loc.hash.toLowerCase().replace(regx, '') + '/',
                    path = loc.pathname.toLowerCase(),
                    href = loc.href.toLowerCase();

                util.each(this.listBtns, function(el, uri){
                    if (!first){ first = uri; }
                    el.removeClass(c.actCls);
                    var match = false, len = uri.length;
                    if (len <= level){ return; }


                    uri = uri.toLowerCase();
                    if (uri.substr(0,7) === 'http://' || uri.substr(0,8) === 'https://'){
                        // 网站匹配
                        match = (href.indexOf(uri) === 0);
                    }else if (uri.charAt(0) === '#'){
                        // 匹配HASH路由
                        uri = uri.replace(regx, '') + '/';
                        match = (hash.indexOf(uri) === 0);
                    }else {
                        // 匹配路径
                        match = (path.indexOf(uri) === 0);
                    }

                    if (match){
                        found = el;
                        level = len;
                    }
                });

                if (!found){
                    if (setAct){
                        found = this.listBtns[setAct];
                    }else {
                        found = this.listBtns[first];
                    }
                }
                if (found){
                    found.addClass(c.actCls);
                }
            }
            /**
             * 导航栏点击回调处理函数
             * @param  {Object} evt jQuery事件对象
             * @return {None}     无返回
             */
            ,eventClick: function(evt, elm){
                var uri = $(elm).attr('data-uri');
                // 设置激活元素Class
                this.setAct(uri);
                // 浏览器hash跳转
                window.location.href = uri;
                return false;
            }
            /**
             * 获取当前的uri
             * @return {String} 当前的uri
             */
            ,getNowUri:function(){
                var hash = window.location.hash;
                if(window.location.hash.indexOf("/") !== -1){
                    hash = hash.substr(1,hash.indexOf("/"));
                }else{
                    hash = hash.substr(1);
                }
                return hash;
            }
            /**
             * 设置激活的频道
             * @param  {String} uri 要激活的频道URI地址
             * @return {Boolean}    操作结果
             */
            ,setAct:function(uri){
                var tag = uri ? this.listBtns[uri] : null;
                var unset = (uri === null);
                if (tag || unset){
                    this.list.removeClass(this.config.actCls);
                }
                if (tag){
                    tag.addClass(this.config.actCls);
                    return true;
                }else {
                    return unset;
                }
            }
            /**
             * 切换某个项目的显示状态
             * @param  {String}  uri   项目URI字符串
             * @param  {Boolean} state <可选> 切换状态
             * @return {Boolean}       执行结果
             */
            ,toggleItem: function(uri, state, isRemove){
                var btn = this.listBtns[uri];
                if (!btn) { return false; }
                // 是否隐藏
                btn.toggle(state);
                // 是否移除
                if(isRemove && !state){
                    btn.remove();
                }
                return true;
            }
            /**
             * 设置新的菜单列
             * @param {Array} list 新的菜单列数据
             */
            ,setData:function(list){
                if(!util.isArray(list)){
                    return false;
                }
                this.config.list = list;
                this.ready = 0;
                this.main.el.empty();
                this.build(true);
            }
            ,onSwitchPage: function(){
                this.updateActive();
                return false;
            }
        }
    );

    /**
     * 边导航视图
     * @param {Object}     config   导航设置
     * @return {Undefined}          无返回值
     */
    var AsideNav = app.extend(
        Nav
        ,{
            init:function(config){
                config = $.extend(
                    true
                    ,{
                        "list":[
                            /*{
                             "name":LANG("活动")
                             ,"uri":"#campaign"
                             ,"iconCls":"nav-campaign"
                             ,"act": 1
                             }
                             ,{
                             "name":LANG("创意包")
                             ,"uri":"#creative"
                             ,"iconCls":"nav-creative"
                             }
                             ,{
                             "name":LANG("落地页")
                             ,"uri":"#whisky"
                             ,"iconCls":"nav-whisky"
                             }
                             ,{
                             "name":LANG("广告位")
                             ,"uri":"#ads"
                             ,"iconCls":"nav-ads"
                             }
                             ,{
                             "name":LANG("媒体")
                             ,"uri":"#media"
                             ,"iconCls":"nav-media"
                             }
                             ,{
                             "name":LANG("渠道")
                             ,"uri":"#channel"
                             ,"iconCls":"nav-channel"
                             }
                             ,{
                             "name":LANG("产品")
                             ,"uri":"#product"
                             ,"iconCls":"nav-product"
                             }
                             ,{
                             "name":LANG("平台")
                             ,"uri":"#platform"
                             ,"iconCls":"nav-platform"
                             }*/
                        ]
                        ,"actCls":"act"
                    }
                    ,config
                );
                // AsideNav.master(this,null,config);
                AsideNav.master(this,"init",[config]);

                // 鼠标经过事件
                this.list.hover(
                    function(){
                        var tag = $(this);
                        if(!tag.hasClass("act")){
                            tag.addClass("liHover");
                        }
                        tag = null;
                    }
                    ,function(){
                        $(this).removeClass("liHover");
                    }
                );
            }
        }
    );

    /**
     * 简繁体切换视图
     * @return {Undefined}          无返回值
     */
    var Cn2hk = app.extend(
        view.container
        ,{
            init: function(config) {
                this.config = $.extend({
                    'target': 'body'
                }, config);
                this.build();
            }
            ,build: function() {
                var cont = this.config.target;
                var lyt = $([
                    '<div class="twcnBar">',
                    '<span class="langIcon zhCN" lang="zh_CN" title="'+ LANG('简体中文') +'"></span>',
                    '<span class="langIcon zhHK" lang="zh_HK" title="'+ LANG('繁体中文') +'"></span>',
                    '</div>'
                ].join(''));
                lyt.appendTo(cont);

                this.dg(lyt, 'span', 'click', this.eventSwichTWCN);
            }
            ,eventSwichTWCN: function(evt, elm) {
                var type = $(elm).attr('lang');
                var curLang = app.cookie('lang');
                if (curLang === type) {
                    return false;
                }
                // 切换语言
                else {
                    app.lang.set(type);
                    window.location.reload();
                }
            }
        }
    );

    /*
     * 用户工具栏模块
     * @param {Object}     config   导航设置
     * @return {Undefined}          无返回值
     */
    var Usertoolbar = app.extend(
        view.container
        ,{
            init:function(config){
                var self = this;
                self.config = $.extend(
                    {
                        "target":"body"
                        ,"list":[
                        {
                            "name":LANG("账号详情")
                            ,"uri":"#user/accountDetail"
                            ,"target":'_blank'
                        }
                        ,{
                            "name":LANG("修改密码")
                            ,"uri":"#login/password"
                            ,"target":'_blank'
                        }
                        ,{
                            "name":LANG("财务明细")
                            ,"uri":"#user/financeDetail"
                            ,"target":'_blank'
                            ,"filter": util.exist(app.config('auth/hideFinance'), app.getUserId()) || util.exist(app.config('auth/hideFinance'), app.getEmployeeUserId()) || util.exist(app.config('auth/filter_tab_cols'), app.getUserId())
                        }
                        ,{
                            "name":LANG("发票管理")
                            ,"uri":"#user/invoiceDetail"
                            ,"target":'_blank'
                        }
                        ,{
                            "name":LANG("消息公告")
                            ,"uri":"#message"
                            ,"target":'_blank'
                        }
                        ,{
                            "name":LANG("代码中心")
                            ,"uri":"#codeCenter"
                        }
                        ,{
                            "name":LANG("监控消息")
                            ,"uri":"#messageMonitor"
                            ,"target":'_blank'
                        }
                        ,{
                            "name":LANG("智能监控")
                            ,"uri":"#smartMonitor"
                        }
                        ,{
                            "name":LANG("快捷菜单")
                            ,"uri":"#hotkeySetup"
                        }
                        // ,{
                        // 	"name":LANG("帮助中心")
                        // 	,"uri":"#help/faq"
                        // }
                        ,{
                            "name":LANG("运营日志")
                            ,"uri":"#runninglog"
                        }
                        ,{
                            "name":LANG("人群标签")
                            ,"uri":"#pdmpManage"
                            ,"target":'_blank'
                        }
                        ,{
                            "name":LANG("广告截屏")
                            ,"uri":"#adScreenshot"
                        }
                        ,{
                            "name":LANG("退出")
                            ,"uri":"#login/logout"
                        }
                    ]
                    }
                    ,config
                );
                self.$userID = 0;
                self.ready = 0;
                self.build();

                // 设置定时器, 检查用户变化
                setInterval(function(){
                    var cid = +app.cookie('currentUserID') || 0;
                    if (cid !== self.$userID){
                        self.$userID = cid;
                        window.location.reload();
                    }
                }, 10000);
            }
            /**
             * 构造弹出层
             * @return {Undefined} 无返回值
             */
            ,build:function(){
                // 简繁体切换
                this.cn2hk = this.create(
                    'cn2hk'
                    ,Cn2hk
                    ,{
                        'target': this.config.target
                    }
                );

                // 用户名或邮件显示容器
                this.userName = this.create(
                    "userName"
                    ,view.container
                    ,{
                        "target":this.config.target
                        ,"html":'<span class="bg"></span><span class="txt">'+this.getUserName()+'</span>'
                        ,"class":"email"
                    }
                );
                this.userName.txt = this.userName.el.find(".txt:first");

                //新增user按钮
                this.userBtn = this.createDom({
                    "tag":"div"
                    ,"class": 'userBtn'
                })
                this.config.target.append(this.userBtn)

                // 个人信息弹出层容器
                this.popUserInfo = this.create(
                    "popUserInfo"
                    ,view.container
                    ,{
                        "target":this.config.target
                        ,"tag":"div"
                        ,"class":"userInfo"
                        ,"autoHide":{
                            "andSelf":[this.userBtn]
                        }
                    }
                );
                this.popUserInfo.act = 0;

                // 个人信息详情
                this.create(
                    "accountDetail"
                    ,AccountDetail
                    ,{
                        "target":this.popUserInfo.el
                    }
                );

                //新增setting按钮
                this.settingBtn = this.createDom({
                    "tag":"div"
                    ,"class": 'settingBtn'
                })
                this.config.target.append(this.settingBtn)


                // 弹出层容器
                this.popList = this.create(
                    "popList"
                    ,view.container
                    ,{
                        "target":this.config.target
                        ,"tag":"ul"
                        ,"class":"info"
                        ,"autoHide":{
                            "andSelf":[this.settingBtn]
                        }
                    }
                );
                this.popList.act = 0;

                // 列表htm
                var htm = ""
                    ,list = this.config.list;
                for(var i =0;i < list.length;i++){
                    if(!list[i].filter){
                        htm += this.createDom({
                            "tag":"li"
                            ,"html":'<a href="'+list[i].uri+ (list[i].target ? '" target="' + list[i].target:'')+ '">'+list[i].name+'</a>'
                            ,"data-uri":list[i].uri
                            ,"stringify":1
                        });
                    }

                }
                this.list = $(htm);

                this.popList.el.append(this.list);

                var self = this;

                self.list.find('a[href="#smartMonitor"]').bind('click', function(){
                    if(!self.monitorPopwin){
                        self.monitorPopwin = self.create('monitorPopwin',
                            require("smartMonitor").monitorPopwin
                        );
                    }
                    self.monitorPopwin.load().show();
                    self.popList.hide();
                    return false;
                });

                // 暂时只有创速账户显示添加广告截屏操作按钮；
                var isShow = util.exist(app.config('auth/screenshot'), app.getUserId());
                self.list.find('a[href="#adScreenshot"]').bind('click', function(){
                    if(!self.adScreenshot){
                        self.adScreenshot = self.create('adScreenshot',
                            require("adScreenshot").adScreenshot
                        );
                    }
                    self.adScreenshot.load().show();
                    self.popList.hide();
                    return false;
                }).parent().toggle(isShow);

                self.list.find('a[href="#hotkeySetup"]').bind('click', function(){
                    self.keySetting.show();
                    self.popList.hide();
                    return false;
                })
                this.keySetting = this.create('keySetting', KeySettingWin);

                //新增UserSwitcher控件
                this.userSwitcher = this.create('switcher',UserSwitcher,{
                    "target":this.config.target
                    ,"autoHide":{
                        "andSelf":[this.userName.el]
                    }
                });
                this.userSwitcher.act = 0;

                this.popUserInfo.afterShow = this.popUserInfo.afterHide = function(){
                    this.act = !this.act;
                }

                this.popList.afterShow = this.popList.afterHide = function(){
                    this.act = !this.act;
                }

                this.userSwitcher.afterShow = this.userSwitcher.afterHide = function(){
                    this.act = !this.act;
                }

                this.popUserInfo.el.bind('click', function(){
                    //self.popUserInfo.hide();
                });

                this.userBtn.bind("click",function(){
                    self.popUserInfo[
                    self.popUserInfo.act && "hide" || "show"
                        ]();
                });

                this.popList.el.bind('click', function(){
                    self.popList.hide();
                });

                this.settingBtn.bind("click",function(){
                    self.popList[
                    self.popList.act && "hide" || "show"
                        ]();
                });

                // this.settingBtn.bind("mouseenter",function(){
                // 	self.popList["show"]();
                // });

                this.userName.el.bind("click",function(){
                    self.userSwitcher[
                    self.userSwitcher.act && "hide" || "show"
                        ]();
                });
                this.ready = 1;
            }
            ,getUserName: function(){
                var user = this.user = app.getUser();
                if (user && user.campany){
                    if (user.origin_campany_id === user.campany_id){
                        user = user.origin_campany;
                    }else {
                        user = user.campany;
                    }
                    this.$userID = +user.UserId || 0;
                    app.cookie('currentUserID', user.UserId);
                    return (user.UserName || user.Name);
                }else {
                    this.$userID = 0;
                    app.cookie('currentUserID', '');
                    return LANG('未登录');
                }
            }
            /**
             * 用户登录后的响应函数
             * @param  {Object}  ev 消息对象
             * @return {Boolean}    阻止广播
             */
            ,onUserLogin:function(ev){
                if(!this.ready){
                    this.build();
                }else{
                    this.reset();
                }
            }
            /**
             * 用户退出后的响应函数
             * @param  {Object}  ev 消息对象
             * @return {Boolean}    阻止广播
             */
            ,onUserLogout:function(ev){
                this.$.accountDetail.reset();
                app.cookie('currentUserID', '');
                this.$userID = 0;
                this.user = null;
                return false;
            }
            ,onUserSwitcherToggle: function(ev){
                this.userName.el.toggleClass('noUserSwitch', !ev.param);
                return false;
            }
            /**
             * 重置显示的用户名
             * @return {Undefined} 无返回值
             */
            ,reset:function(){
                this.userName.txt.html(this.getUserName());
            }
        }
    );

    /**
     * 内容视图
     * @return {Undefined} 无返回值
     */
    var MainContent = app.extend(
        view.container
        ,{
            init:function(config){

                this.config = $.extend(
                    true
                    ,{
                        "target":"body"
                        ,"el":null
                        ,"frame":{
                            "head":{
                                "cls":"frameBodyNav"
                            }
                            ,"aside":{
                                "cls":"frameAsideBox"
                            }
                            ,"body":{
                                "cls":"frameBodyBox"
                            }
                            ,"inner":{
                                "cls":"G-frameBodyInnner hideFrameAside"
                            }
                        }
                    }
                    ,config||{}
                );

                this.config.target = $(this.config.target);
                if(this.config.el){
                    this.el = $(this.config.el);
                    delete this.config.el;
                }else{
                    this.config.target.append(this.el);
                }

                this.frameHead = null;
                this.frameBody = null;

                this.build();
            }
            /**
             * 构造
             * @return {Undefined} 无返回值
             */
            ,build:function(){
                var frame = this.config.frame;
                // 内部显示容器
                this.inner = this.create(
                    "frameInner"
                    ,view.container
                    ,{
                        "target":this.el
                        ,"class":frame.inner.cls
                    }
                );

                this.layout = this.create(
                    "layout"
                    ,view.layout
                    ,{
                        "target":this.inner.el
                        ,"grid":[3,1]
                        ,"cellSet":[
                            {"class":frame.head.cls}
                            ,{"class":frame.aside.cls}
                            ,{"class":frame.body.cls}
                        ]
                    }
                );

                this.setFrame();

                // 内部容器顶部导航区域
                this.frameHead = this.layout.get(0);
                this.frameHead.title = $('<div class="frameTitle"></div>');
                this.frameHead.el.append(this.frameHead.title);

                // this.frameAside = this.layout.get(1);
                this.frameAside = this.create(
                    "aside"
                    ,AsideNav
                    ,{
                        "target":this.layout.get(1).el
                        ,"class":"frameAside"
                    }
                );


                // 内部主内容外部容器
                this.frameBody = this.layout.get(2);

                // 内容显示容器
                this.showArea = this.create(
                    "showArea"
                    ,view.container
                    ,{
                        "target":this.frameBody.el
                        ,"class":"G-showArea"
                    }
                );
            }
            /**
             * 宽/窄屏设置
             */
            ,setFrame:function(){
                var wideScreen = true; //window.screen.availWidth > 1024;
                this.inner.el[
                wideScreen && "addClass" || "removeClass"
                    ]("G-theWidescreen");
            }
            /**
             * 更新标题
             * @param  {String} title 标题字符串
             * @return {Boolean|Container}       返回false则表示操作失败|主视图实例
             */
            ,updateTitle:function(title, isEdit){
                if(isEdit){
                    var dom = this.frameHead.title.html('');
                    $('<span/>').text('编辑：').appendTo(dom);
                    $('<span class="edit"/>').text(title).appendTo(dom);
                    return this;
                }
                this.frameHead.title.html(title || '');
                return this;
            }
        }
    );

    /**
     * 消息视图
     * @return {Undefined} 无返回值
     */
    var MessageContent = app.extend(
        view.container
        ,{
            init:function (config){
                this.data = null;

                this.$ready = false;
                this.$hide = true;
                this.$mode = 'static';
                this.$messageId = 0;
                this.$data = null;
                this.$reads = '';

                MessageContent.master(this,null,config);
                MessageContent.master(this,"init",arguments);

                this.build();
            }
            //构建包裹层黄色背景和橙色消息条数框
            ,build:function (data){
                var self = this;
                if(self.$ready){ return; }
                self.$ready = true;

                var doms = self.doms = {
                    placeholder: $('<div class="M-messagePlaceholder"/>'),
                    bar: $('<div class="M-messageBar"/>'),
                    wrap: $('<div class="M-messageBarWrap"/>'),
                    count: $('<div class="M-messageBarCount"/>'),
                    text: $('<div class="M-messageBarText"/>').attr('title', LANG('点击查看详细内容')),
                    btn: $('<div class="M-messageBarBtn"/>').text(LANG('我知道了'))
                };
                self.el.append(
                    doms.placeholder,
                    doms.bar
                );
                doms.bar.append(doms.wrap);
                doms.wrap.append(
                    doms.count,
                    doms.btn,
                    doms.text
                );

                //点击消息条数，进入消息列表
                self.jq(doms.count, 'click', 'eventCheckMessageList');
                self.jq(doms.text, 'click', 'eventCheckMessageDetail');
                self.jq(doms.btn, 'click', 'eventNextMessage');

                //浏览器滚动时，消息提示框上移到顶部
                self.jq(window, 'scroll resize', 'eventUpdatePositon');

                // 创建计时器, 定时拉取数据
                var cb = function(){
                    self.load();
                };
                setInterval(cb, 60000);
                // 第一次加载数据
                setTimeout(cb, 5000);

                // 检查窗口是否重置了大小
                var body = document.body;
                self.$lastWidth = body.clientWidth;
                setInterval(function(){
                    if (self.$lastWidth != body.clientWidth){
                        self.$lastWidth = body.clientWidth;
                        doms.bar.hide().width(body.scrollWidth).toggle(!self.$hide);
                    }
                }, 300);
            }
            //设置消息提示框位置函数
            ,eventUpdatePositon: function(evt){
                if (this.$hide){return;}

                var bar = this.doms.bar;
                var body = document.body;
                //var top = body.scrollTop;

                if (!evt || evt.type != 'scroll'){
                    this.$lastWidth = body.clientWidth;
                    bar.hide().width(body.scrollWidth).toggle(!this.$hide);
                }

                // if (top > 38){
                // 	if (this.$mode == 'static'){
                // 		this.$mode = 'fixed';
                // 		bar.css({'position': 'fixed', 'top': 0});
                // 	}
                // 	bar.css('left', -body.scrollLeft);
                // }else {
                // 	if (this.$mode == 'fixed'){
                // 		this.$mode = 'static';
                // 		bar.css({'position': 'absolute', 'top': 38, 'left': 0});
                // 	}
                // }
            }
            ,hide: function(){
                this.doms.bar.hide();
                this.doms.placeholder.hide();
                this.$hide = true;
                return this;
            }
            ,show: function(){
                this.doms.bar.show();
                this.doms.placeholder.hide();
                this.$hide = false;
                this.eventUpdatePositon();
                return this;
            }

            //远程获取消息
            ,load: function(){
                var user = app.getUser();
                if (user){
                    app.data.get(
                        '/usermessage/index',
                        {'action': 'is_noticed=false'},
                        this,'onData'
                    );
                }
            }
            //获取消息的回调函数
            ,onData:function (err,data){
                err = '';
                data = JSON.parse('{"items":[],"total":"0"}');
                if (err){
                    app.error(err);
                }else {
                    this.setData(data.items);
                }
            }
            // 拉取信息详细内容
            ,loadContent: function(){
                if (this.$messageId){
                    app.data.get(
                        'usermessage/show',
                        {'Id':this.$messageId},
                        this, 'afterLoadContent'
                    );
                }
                return this;
            }
            ,afterLoadContent: function(err, data){
                if(err){
                    app.error(err);
                }else {
                    this.show();
                    var doms = this.doms;
                    var content = $('<div/>').html(data.Content).text();
                    doms.text.text('【'+ data.Title + '】' + content);
                }
            }
            // 更新记录为已提醒记录
            ,setMessageNoticed: function(ids){
                ids = ids.toString();
                this.$reads += ',' + ids;
                app.data.get('/usermessage/update', {
                    'Ids': ids,
                    'action': 'is_noticed'
                });
                return this;
            }
            // 设置需要显示的列表
            ,setData: function(data){
                this.$data = data;
                var reads = this.$reads + ',';
                var message = null;
                util.each(data, function(msg){
                    if (msg.is_noticed || reads.indexOf(',' + msg.id + ',') != -1){
                        return null;
                    }else if (!message){
                        message = msg;
                    }
                });

                if (message){
                    if (this.$messageId != message.id){
                        this.$messageId = message.id;
                        this.loadContent();
                    }
                }else {
                    this.hide();
                }

                // 更新未读信息数量
                var count = message && data.length || 0;
                app.core.cast('messageUpdateCount', count);
                this.doms.count.text(count);

                return this;
            }

            //‘我知道’按钮隐藏消息提示框位置函数
            ,eventNextMessage: function (evt){
                if (this.$messageId){
                    // 更新消息为已提醒
                    this.setMessageNoticed(this.$messageId);
                }
                // 显示下一条提醒
                this.setData(this.$data);
                return false;
            }
            //点击提示框，查看消息详细函数
            ,eventCheckMessageDetail: function (ev){
                if (this.$messageId){
                    // 阅读信息
                    //app.navigate('message/messageDetail/'+this.$messageId);
                    window.open('#message/messageDetail/'+this.$messageId);
                    // 记录已提醒记录ID
                    this.$reads += ',' + this.$messageId;
                }
                // 显示下一条提醒
                this.setData(this.$data);
            }
            //消息条数点击事件
            ,eventCheckMessageList:function(){
                // 更新所有提醒消息为已提醒
                var ids = [];
                util.each(this.$data, function(msg){
                    ids.push(msg.id);
                });
                if (ids.length){
                    this.setMessageNoticed(ids);
                }

                // 清空列表
                this.setData(null);

                // 导航到消息列表页面
                app.navigate('message');

                return false;
            }

            //用户退出
            ,onUserLogout:function(){
                this.hide();
            }
            //接受广播更新
            ,onUpdateMessageShow:function(ev){
                var id = ev.param.id;
                if (id){
                    this.$reads += ',' + id;
                    this.setData(this.$data);
                }
                return false;
            }
        }
    );

    /**
     * 智能监控消息视图
     * @return {Undefined} 无返回值
     */
    var MessageMonitorContent = app.extend(
        view.container
        ,{
            init:function (config){
                this.data = null;

                this.$ready = false;
                this.$hide = true;
                this.$mode = 'static';
                this.$messageId = 0;
                this.$data = null;
                this.$reads = '';

                MessageMonitorContent.master(this,null,config);
                MessageMonitorContent.master(this,"init",arguments);

                this.build();
            }
            //构建包裹层黄色背景和橙色消息条数框
            ,build:function (data){
                var self = this;
                if(self.$ready){ return; }
                self.$ready = true;

                var doms = self.doms = {
                    placeholder: $('<div class="M-messagePlaceholder"/>'),
                    bar: $('<div class="M-messageBar"/>'),
                    wrap: $('<div class="M-messageBarWrap"/>'),
                    count: $('<div class="M-messageBarCount"/>'),
                    text: $('<div class="M-messageBarText"/>').attr('title', LANG('点击查看详细内容')),
                    btn: $('<div class="M-messageBarBtn"/>').text(LANG('我知道了'))
                };
                self.el.append(
                    doms.placeholder,
                    doms.bar
                );
                doms.bar.append(doms.wrap);
                doms.wrap.append(
                    doms.count,
                    doms.btn,
                    doms.text
                );

                //点击消息条数，进入消息列表
                self.jq(doms.count, 'click', 'eventCheckMessageList');
                self.jq(doms.text, 'click', 'eventCheckMessageDetail');
                self.jq(doms.btn, 'click', 'eventNextMessage');

                //浏览器滚动时，消息提示框上移到顶部
                self.jq(window, 'scroll resize', 'eventUpdatePositon');

                // 创建计时器, 定时拉取数据
                var cb = function(){
                    self.load();
                };
                setInterval(cb, 60000);
                // 第一次加载数据
                setTimeout(cb, 5000);

                // // 检查窗口是否重置了大小
                var body = document.body;
                self.$lastWidth = body.clientWidth;
                setInterval(function(){
                    if (self.$lastWidth != body.clientWidth){
                        self.$lastWidth = body.clientWidth;
                        doms.bar.hide().width(body.scrollWidth).toggle(!self.$hide);
                    }
                }, 300);
            }
            //设置消息提示框位置函数
            ,eventUpdatePositon: function(evt){
                if (this.$hide){return;}

                var bar = this.doms.bar;
                var body = document.body;
                //var top = body.scrollTop;

                if (!evt || evt.type != 'scroll'){
                    this.$lastWidth = body.clientWidth;
                    bar.hide().width(body.scrollWidth).toggle(!this.$hide);
                }

                // if (top > 38){
                // 	if (this.$mode == 'static'){
                // 		this.$mode = 'fixed';
                // 		bar.css({'position': 'fixed', 'top': 0});
                // 	}
                // 	bar.css('left', -body.scrollLeft);
                // }else {
                // 	if (this.$mode == 'fixed'){
                // 		this.$mode = 'static';
                // 		bar.css({'position': 'absolute', 'top': 38, 'left': 0});
                // 	}
                // }
            }
            ,hide: function(){
                this.doms.bar.hide();
                this.doms.placeholder.hide();
                this.$hide = true;
                return this;
            }
            ,show: function(){
                this.doms.bar.show();
                this.doms.placeholder.hide();
                this.$hide = false;
                this.eventUpdatePositon();
                return this;
            }

            //远程获取消息
            ,load: function(){
                var user = app.getUser();
                if (user){
                    app.data.get(
                        '/alarmnotice/index',
                        {'action': 'is_noticed=false'},
                        this,'onData'
                    );
                }
            }
            //获取消息的回调函数
            ,onData:function (err,data){
                if (err){
                    app.error(err);
                }else {
                    this.setData(data.items);
                }
            }
            // 拉取信息详细内容
            ,loadContent: function(){
                if (this.$messageId){
                    app.data.get(
                        'alarmnotice/show',
                        {'Id':this.$messageId},
                        this, 'afterLoadContent'
                    );
                }
                return this;
            }
            ,afterLoadContent: function(err, data){
                if(err){
                    app.error(err);
                }else {
                    this.show();
                    var doms = this.doms;
                    var content = $('<div/>').html(data.Content).text();
                    doms.text.text('【'+ data.Title + '】' + content);
                }
            }
            // 更新记录为已提醒记录
            ,setMessageNoticed: function(ids){
                ids = ids.toString();
                this.$reads += ',' + ids;
                app.data.get('/alarmnotice/update', {
                    'Ids': ids,
                    'action': 'is_noticed'
                });
                return this;
            }
            // 设置需要显示的列表
            ,setData: function(data){
                this.$data = data;
                var reads = this.$reads + ',';
                var message = null;
                util.each(data, function(msg){
                    if (msg.is_noticed || reads.indexOf(',' + msg.id + ',') != -1){
                        return null;
                    }else if (!message){
                        message = msg;
                    }
                });

                if (message){
                    if (this.$messageId != message.id){
                        this.$messageId = message.id;
                        this.loadContent();
                    }
                }else {
                    this.hide();
                }

                // 更新未读信息数量
                var count = message && data.length || 0;
                app.core.cast('messageUpdateCount', count);
                this.doms.count.text(count);

                return this;
            }

            //‘我知道’按钮隐藏消息提示框位置函数
            ,eventNextMessage: function (evt){
                if (this.$messageId){
                    // 更新消息为已提醒
                    this.setMessageNoticed(this.$messageId);
                }
                // 显示下一条提醒
                this.setData(this.$data);
                return false;
            }
            //点击提示框，查看消息详细函数
            ,eventCheckMessageDetail: function (ev){
                if (this.$messageId){
                    // 阅读信息
                    //app.navigate('messageMonitor/messageDetail/'+this.$messageId);
                    window.open('#messageMonitor/messageDetail/'+this.$messageId);
                    // 记录已提醒记录ID
                    this.$reads += ',' + this.$messageId;
                }
                // 显示下一条提醒
                this.setData(this.$data);
            }
            //消息条数点击事件
            ,eventCheckMessageList:function(){
                // 更新所有提醒消息为已提醒
                var ids = [];
                util.each(this.$data, function(msg){
                    ids.push(msg.id);
                });
                if (ids.length){
                    this.setMessageNoticed(ids);
                }

                // 清空列表
                this.setData(null);

                // 导航到消息列表页面
                app.navigate('messageMonitor');

                return false;
            }

            //用户退出
            ,onUserLogout:function(){
                this.hide();
            }
            //接受广播更新
            ,onUpdateMessageMonitorShow:function(ev){
                var id = ev.param.id;
                if (id){
                    this.$reads += ',' + id;
                    this.setData(this.$data);
                }
                return false;
            }
        }
    );

    /**
     * 所有消息集合容器
     * @return {Undefined} 无返回值
     */
    var MessageContainer = app.extend(
        view.container
        ,{
            init:function (config){

                MessageContainer.master(this,null,config);
                MessageContainer.master(this,"init",arguments);

                this.$mode = 'static';
                this.$hide = true;

                this.build();
            }
            //构建包裹层黄色背景和橙色消息条数框
            ,build:function (data){
                var self = this;

                // 消息提醒视图实例
                self.message = app.core.create(
                    "message"
                    ,MessageContent
                    ,{
                        "el": self.el
                    }
                );

                // 智能监控消息提醒视图实例
                self.messageMonitor = app.core.create(
                    "messageMonitor"
                    ,MessageMonitorContent
                    ,{
                        "el": self.el
                    }
                );

                //浏览器滚动时，消息提示框上移到顶部
                self.jq(window, 'scroll resize', 'eventUpdatePositon');

                // 检查窗口是否重置了大小
                var body = document.body;
                self.$lastWidth = body.clientWidth;
                setInterval(function(){
                    if (self.$lastWidth != body.clientWidth){
                        self.$lastWidth = body.clientWidth;
                        //self.el.hide().width(body.scrollWidth).toggle(!self.$hide);
                        self.el.width(body.clientWidth);
                        self.message.doms.bar.width(body.clientWidth);
                        self.messageMonitor.doms.bar.width(body.clientWidth);
                    }
                }, 300);

            }
            //设置消息提示框位置函数
            ,eventUpdatePositon: function(evt){
                //if (this.$hide){return;}

                var el = this.el;
                var body = document.body;
                var top = body.scrollTop;

                if (!evt || evt.type != 'scroll'){
                    this.$lastWidth = body.clientWidth;
                    //bar.hide().width(body.scrollWidth).toggle(!this.$hide);
                    el.width(body.clientWidth);
                    this.message.doms.bar.width(body.clientWidth);
                    this.messageMonitor.doms.bar.width(body.clientWidth);
                }

                if (top > 38){
                    if (this.$mode == 'static'){
                        this.$mode = 'fixed';
                        el.css({'position': 'fixed', 'top': 0});
                    }
                    el.css('left', -body.scrollLeft);
                }else {
                    if (this.$mode == 'fixed'){
                        this.$mode = 'static';
                        el.css({'position': 'absolute', 'top': 38, 'left': 0});
                    }
                }
            }
            ,hide: function(){
                this.el.hide();
                this.$hide = true;
                return this;
            }
            ,show: function(){
                this.el.show();
                this.$hide = false;
                this.eventUpdatePositon();
                return this;
            }

        }
    );

    // 账号详情
    var AccountDetail = app.extend(
        view.container
        ,{
            init:function(config){
                config = $.extend(
                    {
                        "class":"userInfoDetail"
                        ,"accountCls":"userInfoDetailAccount"
                        ,"opList": [
                        {
                            "name":LANG("消息公告")
                            ,"class": 'first'
                            ,"uri":"#message"
                            ,"target":'_blank'
                        }
                        ,{
                            "name":LANG("财务明细")
                            ,"uri":"#user/financeDetail"
                            ,"target":'_blank'
                            ,"filter": util.exist(app.config('auth/hideFinance'), app.getUserId()) || util.exist(app.config('auth/hideFinance'), app.getEmployeeUserId()) || util.exist(app.config('auth/filter_tab_cols'), app.getUserId())
                        }
                        ,{
                            "name":LANG("修改密码")
                            ,"uri":"#login/password"
                            ,"target":'_blank'
                        }
                        ,{
                            "name":LANG("退出")
                            ,"uri":"#login/logout"
                        }
                    ]
                        ,"financeList": [
                        {
                            "name": LANG('账户余额：')
                            ,"type": 'rest'
                            ,"unit": LANG('元')
                        }
                        ,{
                            "name": LANG('今日消费：')
                            ,"type": 'used'
                            ,"unit": LANG('元')
                        }
                        ,{
                            "name": LANG('可用额度：')
                            ,"type": 'allowAdCredit'
                            ,"unit": LANG('元')
                        }
                    ]
                    }
                    ,config
                );
                AccountDetail.master(this,null,config);
                AccountDetail.master(this,"init",[config]);

                this.build();
            },
            build:function(){
                var self = this;
                var el = self.el;
                var doms = self.doms = {};
                doms.account = $('<div class="'+self.config.accountCls+'"></div>').appendTo(el);
                // 构建界面
                $([
                    '<div class="accountInfo">',
                    '<div>',
                    '<strong></strong>',
                    '<em></em>',
                    '<span></span>',
                    '<b></b>',
                    '</div>',
                    '<ol class="opListCon"></ol>',
                    '<ul class="financeListCon"></ul>',
                    '</div>'
                ].join('')).appendTo(doms.account);

                // 操作列表
                var list = this.config.opList;
                for(var i =0;i < list.length;i++){
                    if(!list[i].filter){
                        $([
                            '<li class="'+list[i].class+'">',
                            '<a title="'+list[i].name+'" href="'+list[i].uri+ (list[i].target ? '" target="' + list[i].target:'')+ '">'+list[i].name+'</a>',
                            '</li>'
                        ].join('')).appendTo(doms.account.find('.opListCon'));
                    }
                }

                // 财务列表
                list = this.config.financeList;
                for(var j =0;j < list.length;j++){
                    $([
                        '<li>',
                        list[j].name,
                        '<p>',
                        '<span data-type="'+list[j].type+'">0</span>',
                        '<em>'+list[j].unit+'</em>',
                        '</p>',
                        '</li>'
                    ].join('')).appendTo(doms.account.find('.financeListCon'))
                }
                list = null;

                // 账户信息
                doms.accountCon = doms.account.find(".accountInfo div:first");
                doms.userName = doms.accountCon.find("strong:first");
                doms.email = doms.accountCon.find("em:first");
                doms.campanyName = doms.accountCon.find("span:first");
                doms.campanyId = doms.accountCon.find("b:first");

                // 消费信息
                doms.ulCon = doms.account.find("ul span");
                doms.rest = doms.ulCon.eq(0);
                doms.used = doms.ulCon.eq(1);
                doms.allowAdCredit = doms.ulCon.eq(2);

                // 公告消息
                doms.message = doms.account.find('.first').find('a');

            },
            // 设置名字相关信息
            setData:function(data){
                if(data.campany){
                    var doms = this.doms;
                    var user = data;
                    var campany = user.campany;
                    var isFake = (user.campany_id != user.origin_campany_id || user.userid == campany.UserId);

                    doms.userName.text(isFake ? campany.UserName : user.nickname);
                    doms.email.text(isFake ? campany.Name : user.username);
                    doms.campanyName.text(LANG('所属公司：') + campany.UserName);
                    doms.campanyId.text('(ID:'+campany.UserId+')');
                    this.refresh(data);
                }
            },
            // 设置相关数字
            refresh:function(data){
                var doms = this.doms;
                doms.rest.text(
                    this.formatCurrency(data.cp_rest_amount)
                ).css('color', data.cp_rest_amount < 0 ? '#c30': '');
                doms.used.text(
                    this.formatCurrency(data.cp_today_cost)
                );
                // 如果账号余额小于0
                var tmp_credit = data.campany.AllowAdCredit;
                if(data.cp_rest_amount < 0){
                    tmp_credit += data.cp_rest_amount;
                    tmp_credit = tmp_credit < 0 ? 0 : tmp_credit;
                }
                doms.allowAdCredit.text(
                    this.formatCurrency(tmp_credit)
                );
                return this;
            },
            // 格式化数字
            formatCurrency:function(val){
                return util.numberFormat(
                    util.round0(val,2)
                );
            },
            // 消息变化通知事件
            onMessageUpdateCount: function(ev){
                var el = this.doms.message;
                el.text(
                    el.attr('title') + (ev.param ? '('+ev.param+')' : '')
                );
                return false;
            },
            // 余额变化通知事件
            onBalanceFetch:function(ev){
                this.setData($.extend(app.getUser(), ev.param));
            },
            // 重置
            reset:function(){
                var doms = this.doms;
                doms.userName.text('');
                doms.email.text('');
                doms.campanyName.text('');
                doms.campanyId.text('');

                doms.rest.text('');
                doms.used.text('');
                doms.allowAdCredit.text('');
            }

        }
    );

    /**
     * 主视图
     * @return {Undefined} 无返回值
     */
    var MainView = app.extend(
        view.container
        ,{
            init:function(config){
                MainView.master(
                    this
                    ,null
                    ,{
                        "tag":"body"
                        ,'hasSwitcher':true
                    }
                );

                // 渲染主视图
                this.render();
                this.build();
            }
            /**
             * 构造
             * @return {Undefiend} 无返回值
             */
            ,build:function(){
                // 主视图layout
                this.layout = this.create(
                    "layout"
                    ,view.layout
                    ,{
                        "target":this.el
                        ,"grid":[4,1]
                        ,"cellSet":[
                            //{"class":"G-frameHead"}
                            ,{"class":"G-frameMessage"}
                            ,{"class":"G-frameBody"}
                            //,{"class":"G-frameFooter"}
                        ]
                    }
                );

                // 创建头部视图实例
                //this.head = this.create(
                //    "mainHead"
                //    ,Head
                //    ,{
                //        "target":this.layout.get(0,1)
                //    }
                //);

                // 主内容视图
                this.body = this.create(
                    "mainBody"
                    ,MainContent
                    ,{
                        "el":this.layout.get(2,1)
                    }
                );

                // 公告和智能监控消息提醒视图实例
                this.messageContainer = app.core.create(
                    "messageContainer"
                    ,MessageContainer
                    ,{
                        "el":this.layout.get(1,1)
                    }
                );

                // 底部版权
                var tmp = this.layout.get(-1,1);
                tmp.html(LANG(app.config('app_copyright')));
                if (app.config('app_show_privacy')){
                    tmp.append(' - <a href="#privacy">'+LANG("隐私政策")+'</a>');
                }

                // 预先加载背景雪碧图。2S后从dom中删除
                tmp = $('<div class="advanceLoadBackgroundimage"><div></div><p></p><em></em><i></i></div>');
                $("body").append(tmp);
                setTimeout(function(){
                    tmp.remove();
                    tmp = null;
                },2000);

                // 默认隐藏主界面
                this.hide();
                this.onUserLogin();
            }
            ,hide: function(){
                for (var i=0; i<4; i++){
                    this.layout.get(i).el.hide();
                }
            }
            ,show: function(){
                for (var i=0; i<4; i++){
                    this.layout.get(i).el.show();
                }
                // 去除应用Loading界面控制样式
                $('body:first').removeClass("appIsLoading");
                var login = app.core.get('login');
                if (login){
                    login.hideLoginBox();
                }
            }
            /**
             * 获取内容显示容器实例
             * @return {Container} 内容显示容器实例
             */
            ,getShowarea:function(){
                return this.body.showArea;
            }
            /**
             * 更新视图内容模块标题
             * @param  {[type]} title [description]
             * @return {[type]}       [description]
             */
            ,updateTitle:function(title , isEdit){
                this.body.updateTitle(title, isEdit);
                document.title = (title ? title+" - ":'')+LANG(app.config('app_title'));
                return this;
            }
            /**
             * 选择频道
             * @param  {String}    channel 频道uri
             * @return {Undefined}         无返回值
             */
            ,selectChannel:function(channel){
                //this.head.nav.setAct(channel);
            }
            /**
             * 设置子菜单
             * @param {[type]} uri [description]
             */
            ,setMenuActive: function(uri){
                this.body.frameAside.setAct(uri);
            }
            /**
             * 切换边导航
             * @return {Undefined} 无返回值
             */
            ,toggleAside:function(r,sp){
                var el = this.body.inner.el;
                if (r === undefined){
                    el.toggleClass('hideFrameAside G-frameLagerHead');
                }else {
                    el.toggleClass('hideFrameAside',!r)
                        .toggleClass("G-frameLagerHead",!sp);
                }
                return this;
            },
            /**
             * 切换主内容部分容器的额外类
             * @param  {String} class_name 类名称
             * @param  {Boolean} mode      <可选> 强制指定切换方式
             * @return {Module}            返回当前模块实例, 链式调用
             */
            toggleClass: function(class_name, mode){
                this.body.inner.el.toggleClass(class_name, mode);
                return this;
            }
            /**
             * 切换平台显示状态
             * @param  {Boolean}   status 状态。真则显示，假则隐藏
             * @return {Undefined}        无返回值
             */
            ,togglePlatform:function(status){
                if (status){
                    this.show();
                }else {
                    this.hide();
                }
            }
            /**
             * 设置平台显示状态与标题文字
             * @param {Bool}   status 状态
             * @param {String} txt    标题文字
             * @param {String} isEdit   处于编辑状态
             */
            ,setPlatform:function(status,txt,sp,isEdit){
                sp = sp || false;
                if(status !== undefined && txt !== undefined){
                    this.toggleAside(status,sp)
                        .updateTitle(txt, isEdit);
                }
                return this;
            }
            ,setBatch:function(url, text){
                var batch = $('<a class="frameTitleBatch">')
                    .attr({
                        'href': url,
                        'target': '_blank'
                    })
                    .text(text || '');
                this.body.el.find('.frameTitle').append(batch);
                return this;
            }
            ,onUserLogin: function(){
                var user = app.getUser();
                //this.head.toggleItem('#product', (user && user.type != 2));
                //this.head.toggleItem('#collect', (user && !user.ufo && user.campany_type == 4));
                //this.head.toggleItem('#admin', (user && user.auth == 3 && !user.ufo));
            }
            ,onUserLogout: function(){
                //this.head.toggleItem('#admin', false);
                //this.head.toggleItem('#collect', false);
            }
        }
    );
    //用户切换控件
    var UserSwitcher = app.extend(view.container,{
        init:function(config){
            config = $.extend(true,{
                'class':'userSwitcher'
                ,'url':'/campany/listusercampany'
                ,'urlParam':{'Morder':'Amount|-1'}	// 按总金额排序
                ,'putUrl':'/campany/setcampany'
                ,'infoUrl': '/user/logininfo'
                ,'toggleBtnText':LANG('用户切换')
            },config);
            UserSwitcher.master(this,null,config);
            UserSwitcher.master(this,'init',arguments);

            // 当前用户信息
            this.$data = app.getUser();
            // 可切换用户列表
            this.$list = null;
            // 当前生效用户ID, 检测发送事件用
            this.$currentID = -1;
            // 切换用户ID, 阻止重复切换请求用
            this.$switchID = -1;
            // 用户列表拉取ID, 阻止重复更新用户列表用
            this.$listID = 0;

            this.$ready = false;
            this.$disable = true;

            // 方向键操作序号
            this.$index = -1;

            this.build();
        }
        //构建函数
        ,build:function(){
            if (this.$ready){ return false; }

            var el = this.el;
            var doms = this.doms = {
                titleCon: $('<div class="userTitle"><b class="arrow"/></div>').appendTo(el),
                listCon: $('<div class="userList"><div class="userCon"><p class="curUser cancelBtn"/></div><div class="searchField"/><div class="listField"/></div>').appendTo(el),
                title: $('<h3/>').text(this.config.toggleBtnText),
                list: $('<ul/>')
            };
            doms.listField  = doms.listCon.find('.listField');
            doms.title.appendTo(doms.titleCon);
            doms.list.appendTo(doms.listField);
            doms.userCon = doms.listCon.find('.userCon .curUser');
            var delBtn = $('<a class="cancel"/>').appendTo(doms.listCon);
            this.jq(delBtn, 'click', 'eventCancelSearch');
            // 构建子模块
            this.create('searchBar',common.searchBar,{
                target:doms.listCon.find('.searchField')
            });
            // this.jq(searchBar, 'click',);
            this.create('scroller',common.scroller,{
                'target':doms.listField
                ,'dir':'V'
                ,'size':4
                ,'pad': false
                ,'x':1
            });

            // 绑定事件
            this.dg(this.doms.list,'li[data-id]','click','eventListClick');
            this.jq(this.doms.titleCon,'click','eventToggleList');
            this.jq(doms.userCon,'click','eventCancelSel');
            this.jq(window.document, 'mouseup', 'eventHideList');
            // this.el.bind('mouseup', util.stopEvent);
            //为源帐号添加激活状态
            if(this.$data && +this.$data.campany_id === +this.$data.origin_campany_id){
                this.doms.userCon.addClass('act');
            }

            this.$ready = true;

            if (this.$data){
                this.setData(this.$data, true);
            }else {
                this.hide();
            }
        }
        //列表构建函数
        ,buildList:function(){
            this.doms.list.empty();
            util.each(this.$list, this.buildItem, this);
            this.$.scroller.measure();
        }
        //列表子元素构建函数
        ,buildItem:function(item,index){
            var id = +item._id;
            var cid = +this.$data.campany_id;
            var oid = +this.$data.origin_campany_id;
            if(id === oid){ return; }
            var dom = $('<li/>').attr({
                'data-id': id,
                'title': 'ID: ' + item.UserId
            }).appendTo(this.doms.list);
            dom.html('<strong>'+ util.html(item.UserName)+'</strong></br>'+util.html(item.Name));
            dom.toggleClass('act', id === cid);
        }
        ,show:function (){
            if (!this.$disable){
                UserSwitcher.master(this,'show',arguments);
                this.$.searchBar.focus();
                this.$.scroller.measure();
            }
            return this;
        }
        //data设置函数，通过logininfo获取user后设置
        ,setData: function(data, noEvent){
            this.$data = data;
            if (!this.$ready){ return false; }

            var type = data && data.origin_campany && data.origin_campany.Type;
            this.$disable = ((type !== 4 && type !== 1 && data.group_id <= 0) || (data.auth !== 3))
            if (this.$disable){
                this.reset();
                this.fire('userSwitcherToggle', false);
                return false;
            }
            this.fire('userSwitcherToggle', true);

            // 判断用户切换, 发送切换消息, 判断用户类型是否显示
            var cid = data.campany_id;
            if (cid == data.origin_campany_id){ cid = -1; }
            this.$switchID = cid;
            if (this.$currentID != cid){
                this.$currentID = cid;
                if (!noEvent){
                    app.core.cast('userChange', data);
                }
            }

            // 获取可切换用户列表
            this.getUserlist();

            // 更新界面内容
            this.doms.userCon.text(data.username);
        }
        //重置函数,修改data或切换用户后可调用该函数重置界面
        ,reset:function(){
            this.doms.list.empty();
            this.$listID = 0;
            this.$currentID = -1;
            this.hide();
        }
        // 取消搜索
        ,eventCancelSearch: function(ev, elm){
            $(elm).parent().find('.searchField input').val("");
            // ev.param.value
            this.onSearchInput({param:{value:""}});
            $(elm).parent().find('.searchField input').focus();
            return false;
        }
        //弹出控制函数
        ,eventToggleList:function(){
            // this.$scrollPos = this.$.scroller.getScrollPos();
            this.el.toggleClass('active');
            this.el.find(".searchField input").focus();
        }
        ,eventHideList: function(){
            this.$.scroller.scrollTo(0);
            this.el.removeClass('active');
        }
        //取消函数，发送id为-1返回原本用户
        ,eventCancelSel:function(){
            this.changeUser(-1);
        }
        //用户列表点击处理
        ,eventListClick:function(ev,elm){
            elm = $(elm);
            if(!elm.hasClass('act')){
                elm.addClass('act').siblings('.act').removeClass('act');
                var id = +elm.attr('data-id');
                this.changeUser(id);
            }
        }
        // 获取用户列表
        ,getUserlist:function(){
            var id = this.$data.origin_campany_id;
            if (this.$listID != id){
                this.$listID = id;
                app.data.get(this.config.url, this.config.urlParam, this, 'onGetUserList');
            }
        }
        //用户列表获取后回调函数
        ,onGetUserList:function(err,data){
            if(err){
                app.error(err);
                this.$listID = 0;
                return;
            }
            this.$list = data.items;
            app.store.set('/customer_list', data.items);
            this.buildList();
        }
        //用户切换函数
        ,changeUser:function(id){
            if (this.$switchID == id){ return; }
            this.showLoading();
            var old_id = this.$switchID;
            this.$switchID = id;
            var text = id === -1 ? LANG('恢复账号...') : LANG('用户切换中...');
            this.doms.userCon.text(text);
            app.data.get(this.config.putUrl,{
                CampanyId:id
            },this,'onChangeUser', old_id);
        }
        //设置当前用户回调函数，由changeUser执行后回调
        ,onChangeUser:function(err,data,param){
            this.hideLoading();
            if(err){
                this.doms.userCon.text(LANG('用户切换失败!'));
                this.$switchID = param;
                app.error(err);
                return;
            }

            // if(window.location.hash.indexOf("#admin") !== -1){
            window.location.reload();
            return true;
            // }

            /*if (this.$switchID === -1){
             this.doms.list.find('li.act').removeClass('act');
             //为源帐号添加激活状态
             this.doms.userCon.addClass('act');
             }else{
             this.doms.userCon.removeClass('act');
             }
             app.data.get(this.config.infoUrl, this, 'onGetUserInfo');*/
        }
        //重新拉取当前用户登录信息
        ,onGetUserInfo: function(err, data){
            if (err){
                app.error(err);
                return;
            }
            app.setUser(data);
            this.setData(data);
        }
        ,move: function(dom){
            // 高度
            var height = $(".listField ul li:visible").first().outerHeight();
            // 滚动条跟随移动
            this.$.scroller.scrollTo( -(this.$index - 2) *height);
            // 按键选中状态
            dom.eq(this.$index).addClass('hoverClass');
        }
        //searchInput事件处理
        ,onSearchInput:function(ev){
            var visCon = $(".listField ul li:visible").removeClass('hoverClass'),
                max = visCon.length,
                elm;

            switch(ev.param.keycode){
                case 38:							// 向上方向键
                    this.$index--;

                    // 向上已到顶部
                    if(this.$index < 0){
                        this.$index = max -1;
                    }
                    this.move(visCon);
                    break;
                case 40:							// 向下方向键
                    this.$index++;

                    // 向下已到底部
                    if(this.$index >= max){
                        this.$index = 0;
                    }

                    this.move(visCon);
                    break;
                case 13:							// 回车键
                    if(this.$index == -1){
                        this.$index = 0;
                    }
                    elm = visCon.eq(this.$index);
                    if(!elm.hasClass('act')){
                        elm.addClass('act').siblings('.act').removeClass('act');
                        var id = +elm.attr('data-id');
                        this.changeUser(id);
                    }
                    break;
                case 27:							// Esc键
                    var delBtn = this.doms.listCon.find(".cancel");
                    this.eventCancelSearch(null, delBtn);
                    break;
                default:
                    // 重置变量
                    this.$index = -1;

                    // 过滤列表数据
                    var val = ev.param.value.toLowerCase();
                    var doms = this.doms.list.children('li');
                    var idx = 0;
                    util.each(this.$list, function(item){
                        var dom = doms.eq(idx);
                        if (dom.attr('data-id') != item.Id){ return; }
                        var name = (item.Name || '').toLowerCase()
                            ,user = (item.UserName || '').toLowerCase()
                            ,userId = String((item.UserId || '')).toLowerCase();
                        dom.toggle(name.indexOf(val)>=0 || user.indexOf(val)>=0 || userId.indexOf(val)>=0);
                        idx++;
                    });
                    this.$.scroller.measure();
                    break;
            }
        }
        // 响应用户登录消息
        ,onUserLogin: function(ev){
            this.setData(ev.param);
            return false;
        }
        // 响应用户注销消息
        ,onUserLogout: function(ev){
            this.reset();
            return false;
        }
        /**
         * 显示数据加载中
         * @return {None} 无返回
         */
        ,showLoading: function() {
            var con = this.el.parent();
            if (!this.loadingRow){
                this.loadingRow = $('<div class="M-tableListLoading"/>');
                this.loadingRow.appendTo(con).text(LANG("数据加载中"));
            }
            this.loadingRow.width(con.outerWidth()).height(con.outerHeight()).css(con.position());
            //this.loadingRow.width(screen.width).height(screen.height).css({top:0,left:0});

            this.loadingRow.show();
        }
        /**
         * 隐藏数据加载提示
         * @return {None} 无返回
         */
        ,hideLoading: function() {
            if (this.loadingRow) {
                this.loadingRow.hide();
            }
        }
    })
    exports.mainView = MainView;

    // 创建快捷键设置弹窗（非popwin）
    var KeySettingWin = app.extend(view.container, {
        init: function(config){
            config = $.extend({
                'width': 800,
                'class': 'M-hotkey',
                'target': $('body'),
                // 关闭小按钮
                "close":{
                    "class":"closeTip"
                }
            }, config);
            KeySettingWin.master(this, null, config);
            KeySettingWin.master(this, 'init', arguments);

            this.$ready = false;
            this.$data = null;
            this.$timeStamp = 0;
            this.build();
        },
        build: function(){
            var el = this.el;
            this.$inputDoms = {};
            var self = this;
            var c = self.config;

            //弹出层容器
            self.head = $('<div class="M-hotkeyHead"/>').appendTo(el);
            self.body = $('<div class="M-hotkeyBody"/>').appendTo(el);

            // 小关闭图标按钮
            if(c.close){
                // 有关闭按钮
                self.closeBnt = $('<em class="'+c.close["class"]+'"></em>');
                self.closeBnt.bind("click",function(){
                    self.onCancel(null);
                });
                self.head.append(self.closeBnt);
            }

            // 添加标题
            $('<div class="hotkeyTitle"/>').text(LANG('快捷菜单')).appendTo(self.head);

            // 快捷键设置
            var settingConfig = [
                {"name": "campaign", "title": "首页", "key": "Alt+S", "url": "campaign"},
                {"name": "campaign", "title": "所有活动", "key": "Alt+H", "url": "campaign"},
                {"name": "rtbCampaign", "title": "RTB 活动", "key": "Alt+R", "url": "campaign?filterType=rtb"},
                {"name": "proxyCampaign", "title": "代理活动", "key": "Alt+D", "url": "campaign?filterType=proxy"},
                {"name": "creative", "title": "创意包", "key": "Alt+C", "url": "creative"},
                {"name": "creative/sweetyVerifyList", "title": "创意审核结果", "key": "Alt+J", "url": "creative/sweetyVerifyList"},
                {"name": "whisky", "title": "落地页", "key": "Alt+L", "url": "whisky"},
                {"name": "product", "title": "产品", "key": "Alt+P", "url": "product"},
                {"name": "ads", "title": "广告位", "key": "Alt+G", "url": "ads"},
                {"name": "admin/customer", "title": "客户列表", "key": "Alt+K", "url": "admin/customer"},
                {"name": "admin/employee", "title": "员工列表", "key": "Alt+Y", "url": "admin/employee"},
                {"name": "admin/messageCenter", "title": "消息公告", "key": "Alt+X", "url": "admin/messageCenter"},
                {"name": "user/financeDetail", "title": "财务明细", "key": "Alt+Z", "url": "user/financeDetail"},
                // 没有url的情况则另外定义事件
                {"name": "hotkey", "title": "快捷菜单", "key": "Alt+1"},
                {"name": "campaign/edit", "title": "新建 RTB 活动", "key": "Ctrl+Alt+R", "url": "campaign/edit", "newPage": true},
                {"name": "campaign/agentEdit", "title": "新建广告监测", "key": "Ctrl+Alt+D", "url": "campaign/agentEdit", "newPage": true},
                {"name": "creative/add", "title": "新建创意包", "key": "Ctrl+Alt+C", "url": "creative/add", "newPage": true},
                {"name": "whisky/add", "title": "新建落地页", "key": "Ctrl+Alt+L", "url": "product/add", "newPage": true},
                {"name": "ads/add", "title": "新建广告位", "key": "Ctrl+Alt+G", "url": "ads/add", "newPage": true},
                {"name": "admin/customerEdit", "title": "新建客户", "key": "Ctrl+Alt+K", "url": "admin/customerEdit", "newPage": true},
                {"name": "admin/employeeEdit", "title": "新建员工", "key": "Ctrl+Alt+Y", "url": "admin/employeeEdit", "newPage": true}
            ];

            // 实现快捷键绑定功能，这一功能模块或许应分离
            var keyBinder = new KeyBinder($(document));

            util.each(settingConfig, function(item, index){
                var callback = null;
                if (item.name == 'hotkey'){
                    // 特殊情况
                    // 显示hotkey窗口
                    callback = function() {
                        self.toggle();
                    }
                }else if (item.url){
                    // 绑定转跳方法
                    callback = function() {
                        if (item.newPage) {
                            window.open('#' + item.url);
                        } else {
                            app.navigate(item.url)
                        }
                    }
                }else {
                    return;
                }
                keyBinder.bind(item.key, callback);
            });

            // 添加快捷键配置信息的table
            var settingTable = $('<table></table>').appendTo(self.body);
            var i, len, middle;

            // item的排列顺序有上到下后再从左到右
            for (i = 0, len = settingConfig.length, middle = Math.floor((len + 1) / 2); i < middle; i++) {
                var tr = $('<tr></tr>').appendTo(settingTable);
                for (var k = 0; k < 2; k++) {
                    var index = i;
                    if (k == 1) {
                        index = i + middle;
                        if (index >= len) {
                            break;
                        }
                    }
                    var item1 = settingConfig[index];
                    if (item1.url) {
                        // 快捷功能描述有点击功能
                        var a = $('<a href="#' + item1.url + '">' + item1.title + '</a>');
                        if (item1.newPage) {
                            a.attr('target', '_blank');
                        }
                        $('<td></td>').append(a).appendTo(tr);
                    } else {
                        $('<td></td>').text(item1.title).appendTo(tr);
                    }
                    var keyTd = $('<td></td>').text(item1.key).appendTo(tr);
                    if (k === 0) {
                        keyTd.addClass('splitLine')
                    }
                }
            }


            // 设置点击窗外隐藏弹窗
            this.jq(this.el, 'mouseup', function(ev) {
                this.$timeStamp = ev.timeStamp;
                return true;
            });
            this.jq($('body'), 'mouseup', function(ev) {
                if (this.isShow()) {
                    if (ev.timeStamp != this.$timeStamp) {
                        this.hide();
                        return false;
                    }
                }
            });
            // 点击关闭弹窗
            self.dg(settingTable, 'td > a', 'click', function(){
                self.hide();
            });

            this.jq(window,'resize', this.setWin, this);
        },
        isShow: function() {
            return (this.el.css('display') !== 'none');
        },
        show: function() {
            // 设置居中位置
            var el = this.el;
            var win = $(window);
            var h = win.height();
            var w = win.width();
            var st = win.scrollTop();
            var sl = win.scrollLeft();
            el.css({
                'top': (h - el.height()) / 2 + st,
                'left': (w - el.width()) / 2 + sl
            })

            KeySettingWin.master(this, 'show', arguments);
        },
        onCancel: function(evt){
            this.hide();
            return false;
        },
        // 显示或隐藏弹窗
        toggle: function() {
            if (this.isShow()) {
                this.hide();
            } else {
                this.show();
            }
        },
        // 窗口resize时，改变left值
        setWin: function (){
            var l = ($(window).width()-this.el.width())/2 + $(window).scrollLeft()
            this.el.css({
                'left': l
            });
            return this;
        }
    });


    // 热键监听调度管理模块
    function KeyBinder(watchElm) {
        // 特殊键
        var _specialKeys = { 27: 'esc', 9: 'tab', 32:'space', 13: 'return', 8:'backspace', 145: 'scroll',
            20: 'capslock', 144: 'numlock', 19:'pause', 45:'insert', 36:'home', 46:'del',
            35:'end', 33: 'pageup', 34:'pagedown', 37:'left', 38:'up', 39:'right',40:'down',
            109: '-', 112:'f1',113:'f2', 114:'f3', 115:'f4', 116:'f5', 117:'f6', 118:'f7', 119:'f8',
            120:'f9', 121:'f10', 122:'f11', 123:'f12', 191: '/'};

        // 该方法将按钮事件转换成具体的字符串
        var _keyupEventToString = function(ev) {
            var code = ev.which;
            var keyStr;
            if (_specialKeys[code]) {
                // 特殊键的情况
                keyStr = _specialKeys[code];
            } else {
                // 转换成具体的字符（小写）
                keyStr = String.fromCharCode(code).toLowerCase();
            }

            var combiMap = {
                'shift': ev.shiftKey,
                'ctrl': ev.ctrlKey,
                'alt': ev.altKey,
                // mac下的command键
                'command': ev.metaKey
            };
            var combiStr = '';
            if (combiMap.shift) {combiStr+='shift+'}
            if (combiMap.ctrl) {combiStr+='ctrl+'}
            if (combiMap.alt) {combiStr+='alt+'}
            if (combiMap.command) {combiStr+='command+'}
            keyStr = combiStr + keyStr;

            return keyStr;
        }

        // 考虑到多浏览与多系统支持，使用keydown；不同系统keypress的结果会有很大区别
        var _bindingEventName = 'keydown';
        // map用于存放快捷键名称与绑定的方法
        var _bindingMap = {};
        // 过滤器map，储存过滤函数，若函数返回true，就让事件pass掉
        var _filterMap = {
            // 如果在输入框内则要取消快捷键功能
            // 该过滤器是快捷键在input,textarea,select中失效
            editTextCasePass: function(ev) {
                var targetElm = $(ev.target);
                if (targetElm.is("input") || targetElm.is("textarea") || targetElm.is("select")) {
                    return true;
                }
            },
            // 该过滤器使只支持ctrl或alt的组合情况
            ctrlOrAltCombiOnly: function(ev) {
                // 如果按键不是已经按下alt或ctrl的情况下，直接pass
                var ctrl = ev.ctrlKey;
                var alt = ev.altKey;
                if (!ctrl && !alt) {
                    return true;
                }
                // 如果按键为ctrl或alt的话，也pass掉
                var code = ev.which;
                if (code == 17 || code == 18) {
                    return true;
                }
            }
        };
        // 绑定到元素keyup事件的具体方法
        var _trigger = function(ev) {
            // 调用过滤器
            for (var key in _filterMap) {
                var filterFunc = _filterMap[key];
                if (filterFunc(ev)) {
                    return true;
                }
            }

            // 转换为字符串
            var keyStr = _keyupEventToString(ev)

            // 触发bindingMap中对应的事件
            var triggerFunc = _bindingMap[keyStr];
            if (triggerFunc) {
                triggerFunc(ev);
                // 要阻止事件传递
                return false;
            } else {
                return true;
            }

        }

        // 该方法将jq元素与keyBinder绑定起来
        this.catJQElement = function(jqElm) {
            jqElm.on(_bindingEventName, _trigger);
        };
        // 取消jq元素与keyBinder的绑定
        this.uncatJQElement = function(jqElm) {
            jqElm.off(_bindingEventName, _trigger);
        };
        // 绑定热键与对应事件
        this.bind = function(bindingKey, bindingFunc) {
            bindingKey = bindingKey.toLowerCase();
            _bindingMap[bindingKey] = bindingFunc;
        };
        // 取消热键
        this.unbind = function(bindingKey) {
            bindingKey = bindingKey.toLowerCase();
            delete _bindingMap[bindingKey];
        };

        if (watchElm){
            this.catJQElement(watchElm);
        }
        return this;
    }
});
