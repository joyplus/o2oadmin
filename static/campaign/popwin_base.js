define(function(require, exports){
    var $ = require("jquery")
        ,app = require('app')
        ,view = require("view")
        ,comm = require("common")
        ,util = require("util");

    /**
     * 遮罩默认设定
     * @type {Object}
     * @private
     */
    var maxZIndex = 1000;

    function Popwin(config,parent,idObject){

        this.config = $.extend(
            true
            ,{
                "target":"body"
                ,"autoHide":0
                // 模块主样式
                ,"class":"M-popwin"
                // 内容区域样式
                ,"bodyClass":"M-popwinBody"
                // 控制栏区域样式
                ,"footClass":"M-popwinFoot"
                // 顶部标题与关闭按钮区域样式
                ,"headClass":"M-popwinHead"
                // 关闭小按钮
                ,"close":{
                    "class":"closeTip"
                }
                // 允许显示的按钮
                // 默认只有确定与取消两个按钮。
                // 更多的按钮需要在buttonConfig中添加相应的设置
                ,"buttons":["ok","cancel"]
                ,"buttonConfig":{
                    // 确定按钮样式
                    "ok": {
                        "type":"button"
                        ,"value":LANG("完成")
                        ,"class":"btnBigGreen"
                        ,"data-action":"onOk"
                        ,"events":"click"
                    }
                    // 取消按钮的样式
                    ,"cancel": {
                        "type":"button"
                        ,"value":LANG("取消")
                        ,"class":"btnBigGray"
                        ,"data-action":"onCancel"
                        ,"events":"click"
                    }
                }
                // 按钮点击通过事件发送
                ,"buttonEvent":false
                // 显示底部
                ,"showFoot":1
                // 容器宽度
                ,"width":300
                // 容器高度
                ,"height":null
                // 是否带遮罩
                ,"mask":1
                // 窗口位置。auto<自动>|Object<具体设置>
                ,"winPosition":"auto"
                // 弹出层标题
                ,"title":null
                // 不发送事件
                ,"silence":true
            }
            ,config
        );

        // 缓存集合
        this.cache = {
            "doms":{
                "body":$("body:first")
            }
        }

        // 子实例集合
        this.subject = {
            // 标题
            "title":null
            // 头部
            ,"head":null
            // 内容
            ,"contain":null
            // 底部
            ,"footer":null
        }

        // 兼容旧写法中的对象
        this.head = null;
        this.body = null;
        this.foot = null;

        // 布局
        this.layout = null;

        // 是否已经显示
        this.isShow = 0;

        // 状态
        this.ready = 0;
        Popwin.master(this,null,this.config);
    }
    extend(
        Popwin
        ,view.container
        ,{
            init:function(){
                Popwin.master(this,"render");
                this.render();
                this.initWin();
            }
            ,render:function(){

                var self = this;
                var c = self.config;

                // 布局与组成对象
                self.winLayout = self.create(
                    "winLayout"
                    ,view.layout
                    ,{
                        "target":self.el
                        ,"grid":[3,1]
                        ,"cellSet":[
                            {"class":c.headClass}
                            ,{"class":c.bodyClass}
                            ,{"class":c.footClass}
                        ]
                    }
                );
                self.subject.head = self.winLayout.get(0);
                self.head = self.subject.head.el;
                self.subject.contain = self.winLayout.get(1);
                self.body = self.subject.contain.el;
                self.subject.footer = self.winLayout.get(2);
                self.foot = self.subject.footer.el;

                // 小关闭图标按钮
                if(c.close){
                    // 有关闭按钮
                    self.closeBnt = $('<em class="'+c.close["class"]+'"></em>');
                    self.closeBnt.bind("click",function(){
                        self.onCancel(null);
                    });
                    self.head.append(self.closeBnt);
                }

                // 标题
                self.title = self.create(
                    "popwinTitle"
                    ,view.container
                    ,{
                        "target":self.head
                        ,"class":"popwinTitle"
                    }
                );
                if(c.title){
                    self.title.el.html(c.title);
                }else{
                    self.title.el.hide();
                }

                // 按钮组
                var buttonDefine = c.buttonConfig;
                util.each(c.buttons, function(btn){
                    var def = buttonDefine[btn];
                    if(def && !self.$[btn]){
                        def.target = self.foot;
                        self.create(btn, comm.input, def);
                    }
                })

                // 设定不显示则隐藏
                if(!c.showFoot){
                    self.foot.hide();
                }
            }
            /**
             * 显示弹出层
             * @param {Object} config 显示设置
             * @return {Undefined} 无返回值
             */
            ,show:function(config){
                if(!this.isShow){
                    this.isShow = 1;
                    if(this.config.mask){
                        this.toggleMask(true);
                    }
                    this.el.css('z-index', maxZIndex++);
                    Popwin.master(this,"show",[]);
                }
                this.setWin(config);
            }
            /**
             * 关闭弹出层
             * @return {Undefined} 无返回值
             */
            ,hide: function(){
                if (this.isShow){
                    maxZIndex--;
                }
                this.isShow = 0;
                Popwin.master(this,"hide");
                if(this.config.mask){
                    this.toggleMask(false);
                }
            }
            /**
             * 切换遮罩层
             * @return {undefined} 无返回值
             */
            ,toggleMask:function(state){
                if (this.config.mask){
                    if(!this.mask){
                        this.mask = $('<div class="M-mask"/>')
                            .hide()
                            .appendTo(this.cache.doms.body);
                        this.$isMaskShow = false;
                    }
                    if (state === undefined){
                        state = this.isShow;
                    }
                    if (state){
                        if (!this.$isMaskShow){
                            this.$isMaskShow = true;
                            this.mask.css('z-index', maxZIndex++);
                            this.mask.show();
                        }
                    }else {
                        if (this.$isMaskShow){
                            this.$isMaskShow = false;
                            maxZIndex--;
                            this.mask.hide();
                        }
                    }
                }
                return this;
            }
            /**
             * 切换显示/隐藏
             * @return {Undefined} 无返回值
             */
            ,toggle: function(){
                if (this.isShow){
                    this.hide();
                }else {
                    this.show();
                }
            }
            /**
             * 设定弹出层
             * @param {Object} config 弹出层设置
             * @return {Undefined} 无返回值
             */
            ,setWin:function(config){
                var self = this;
                var c = self.config;
                if(util.isObject(c.winPosition)){
                    // 不是自动设定的话则更新设定值
                    config = $.extend(
                        {}
                        ,c.winPosition
                        ,config
                    );
                    self.el.css(config);
                }else{
                    // 自动设定的话则只处理top
                    if (config) {
                        self.el.css(config);
                    }
                    var w = self.el.outerWidth();
                    if (self.el.css('position') == 'fixed'){
                        self.el.css({
                            'top': '50%',
                            'left': '50%',
                            'margin': (-self.el.outerHeight()/2)+'px 0 0 -'+(w/2)+'px'
                        });
                    }else {
                        var d = document,
                            b = (d.compatMode === "CSS1Compat"?d.documentElement:d.body),
                            h = Math.max(0,(b.clientHeight-self.el.outerHeight(true))/2),
                            sh = Math.max(d.documentElement.scrollTop,d.body.scrollTop);
                        self.el.css({
                            'top': parseInt(sh + h, 10),
                            'margin': '0 0 0 -'+(w/2)+'px'
                        });
                    }
                }
                if (c.height){
                    var height = c.height - self.head.outerHeight(true) - self.foot.outerHeight(true);
                    height -= (self.body.outerHeight(true) - self.body.height());
                    self.body.height(height);
                }
                self.setMask();
            }
            /**
             * 设定遮罩层
             * @param  {Object}    config 遮罩层设定
             * @return {Undefined}        无返回值
             */
            ,setMask:function(config){
                if(this.mask){
                    config = config || {};
                    config.height = $(document).height()+"px";
                    this.mask.css(config);
                }
            }
            /**
             * 初始化弹出层
             * @return {Undefined} 无返回值
             */
            ,initWin:function(){
                if(!this.ready){
                    // 弹出层的基础设定
                    this.popwinSet = {
                        "width":this.config.width
                        ,"max-height":this.config.maxHeight || "auto"
                    };
                    if (this.config.height !== null){
                        this.popwinSet.height = this.config.height;
                    }
                    if(this.config.winPosition === "auto"){
                        // 自动设定的话则做居中处理
                        // this.popwinSet.margin = "0 0 0 -"+parseInt(this.config.width/2,10)+"px";
                    }
                    this.el.css(this.popwinSet);
                    this.ready = 1;
                }
            }
            /**
             * 修改标题
             * @param  {String}    html 标题字符串。文字或html
             * @return {Undefined}      无返回值
             */
            ,changeTitle:function(html){
                if(typeof(html) === "string"){
                    this.config.title = html;
                    this.title.el
                        .html(this.config.title)
                        .show();
                }else{
                    console.warn(html);
                }
                return this;
            }
            /**
             * 尺寸改变响应函数
             * @param  {Object}    ev 事件消息对象
             * @return {Undefined}    无返回值
             */
            ,onSizeChange:function(ev){
                this.setWin();
                this.setMask();
                return false;
            }
            /**
             * 语言切换响应函数
             * @return {Undefined} 无返回值
             * @todo 感觉有哪里不对……
             */
            ,onSwitchLanguage: function(){
                // ?
                // this.render();
            }
            /**
             * 确定响应事件
             * @param  {Object}    ev 事件消息对象
             * @return {Undefined}    无返回值
             */
            ,onOk: function(evt){
                if(!this.config.silence){
                    this.fire("popOk");
                }
                this.hide();
                return false;
            }
            /**
             * 取消响应事件
             * @param  {Object}    ev 事件消息对象
             * @return {Undefined}    无返回值
             */
            ,onCancel: function(evt){
                if(!this.config.silence){
                    this.fire("popCancel");
                }
                this.hide();
                return false;
            }
            /**
             * 消息响应处理函数
             * @param  {Object}    ev 消息信息对象
             * @return {Undefined}    无返回值
             */
            ,onClick:function(ev){
                if (!this.config.buttonEvent){
                    switch (ev.name){
                        case 'yes':
                        case 'ok':
                            this.onOk(ev);
                            return false;
                        case 'no':
                        case 'cancel':
                            this.onCancel(ev);
                            return false;
                    }
                }
            }
            ,toggleButton: function(buttons){
                var self = this;
                var list = ',' + buttons.toString() + ',';
                util.each(self.config.buttons, function(id){
                    if (list.indexOf(',' + id + ',') !== -1){
                        self.$[id].show();
                    }else {
                        self.$[id].hide();
                    }
                });
                return self;
            }
            /**
             * 获取模块某个区域对象
             * @param  {String} type 类型
             * @return {Object}      区域对象
             */
            ,getArea:function(type){
                return this[type];
            }
        }
    );
    exports.base = Popwin;

    var Notify = app.extend(view.container, {
        init: function(config){
            var self = this;
            config = $.extend({
                'target': 'body',
                'class': 'M-popwinNotify',
                'type': 'notify',
                'time': 5000,
                'offset': 0
            }, config);

            Notify.master(self, null, config);
            Notify.master(self, 'init', arguments);

            self.$ready = false;
            self.$type = config.type;
            self.$tid = 0;
            self.build();
        },
        build: function(){
            var self = this;
            if (self.$ready){ return self; }
            self.$ready = true;

            var el = self.el;
            var doms = self.doms = {};
            doms.title = $('<div class="M-popwinNotifyTitle"/>').appendTo(el);
            doms.icon = $('<div class="M-popwinNotifyIcon"/>').appendTo(el);
            doms.message = $('<div class="M-popwinNotifyMessage"/>').appendTo(el);

            this.jq(el, 'click', 'hide');
        },
        show: function(){
            var self = this;
            var el = self.el;
            if (self.$tid){
                clearTimeout(self.$tid);
            }
            el.show();

            var w = el.outerWidth(),
                h = el.outerHeight(),
                d = document,
                b = (d.compatMode === "CSS1Compat"?d.documentElement:d.body),
                ch = b.clientHeight,
                cw = b.clientWidth,
                st = Math.max(d.documentElement.scrollTop,d.body.scrollTop),
                sl = Math.max(d.documentElement.scrollLeft,d.body.scrollLeft);

            el.css({
                'top': parseInt(st + (ch - h) / 2, 10),
                'left': parseInt(sl + (cw - w) / 2, 10),
                'z-index': maxZIndex+100
            });

            self.$tid = this.setTimeout('hide', self.config.time);
        },
        hide: function(){
            this.el.fadeOut(500);
            return this;
        },
        setData: function(data){
            var self = this;
            var doms = self.doms;
            var el = self.el;
            if (util.isString(data.message)){
                doms.message.text(data.message);
            }else {
                doms.message.empty().append(data.message);
            }
            if (data.title){
                if (util.isString(data.title)){
                    doms.title.text(data.title);
                }else {
                    doms.title.empty().append(data.title);
                }
            }
            doms.title.toggle(!!data.title);
            var type = self.$type = data.type || self.$type;
            switch (type){
                case 'notify':
                    el.removeClass('M-popwinNotifyHasIcon');
                    break;
                case 'success':
                case 'error':
                    el.addClass('M-popwinNotifyHasIcon');
                    doms.icon.attr('class', 'M-popwinNotifyIcon '+type);
                    break;
            }
            return self;
        }
    });
    exports.notify = Notify;

    var AlertPopwin = app.extend(Popwin, {
        init: function(config, parent){
            config = $.extend({
                'width': 305,
                'data': null,
                "buttons": ["ok",'cancel',"yes","no"],
                "buttonConfig":{
                    // 确定按钮样式
                    "ok": {
                        "type":"button"
                        ,"value":LANG("确定")
                        ,"class":"btnBigGreen"
                        ,"events":"click"
                    }
                    ,"yes": {
                        "type":"button"
                        ,"value":LANG("是")
                        ,"class":"btnBigGreen"
                        ,"events":"click"
                    }
                    ,"no":{
                        "type":"button"
                        ,"value":LANG("否")
                        ,"class":"btnBigGray"
                        ,"events":"click"
                    }
                    // 取消按钮的样式
                    ,"cancel": {
                        "type":"button"
                        ,"value":LANG("取消")
                        ,"class":"btnBigGray"
                        ,"events":"click"
                    }
                },
                "class": 'M-popwin M-alert',
                "close": null
            }, config);

            AlertPopwin.master(this, null, config);
            AlertPopwin.master(this, 'init', arguments);

            // 事件时间戳
            this.$timeStamp = 0;

            this.build();
        },
        build: function(){
            if (this.$ready){ return; }
            this.$ready = true;
            this.$content = $('<p class="con"/>').appendTo(this.body);

            var data = this.config.data;

            if (data){
                this.setData(data).show();
            }
        }
        ,setData: function(data){
            var c = this.config;
            c.data = data;

            var con = this.$content;
            if (util.isString(data.text)){
                var html = con.text(data.text).html();
                con.html(html.replace(/\n/g, '<br/>'));
            }else {
                con.empty().append(data.text);
            }

            var buttons =data.buttons;
            buttons = buttons ? buttons : ['ok','cancel'];
            var width = Math.max(305, buttons.length * 140);
            this.toggleButton(data.type=='confirm' ? buttons.join() : buttons[0]);

            this.setWin({'width': width});
            return this;
        }
        ,onClick:function(ev){
            var c = this.config;
            if (!c.buttonEvent){
                var item = c.buttonConfig[ev.name];
                var data = c.data;
                var state = true;
                switch (ev.name){
                    case 'cancel':
                    case 'no':
                        state = false;
                    /* falls through */
                    case 'yes':
                    case 'ok':
                        if(data.callback){
                            data.callback.call(this, state, ev.name, item);
                        }
                        if (!data.next.call(this)){
                            this.hide();
                        }
                        return false;
                }
            }
        },
        show:function(config){
            if(!this.isShow){
                this.isShow = 1;
                if(this.config.mask){
                    this.toggleMask(true);
                }
                this.el.css('z-index', maxZIndex++);
                Popwin.master(this,"show",[]);

                var self = this;
                var data = self.config.data;
                if(data.type == 'alert'){
                    // 点击回车键隐藏弹框
                    $(document).bind('keypress.alert',function(e){
                        if(e.keyCode == 13){
                            if (!data.next.call(self)){
                                self.hide();
                            }
                        }
                        return false;
                    });

                    // 点击空白处隐藏弹框
                    if(self.mask){
                        // 鼠标点击弹框内
                        self.jq(self.el, 'click', function(e){
                            self.$timeStamp = e.timeStamp;
                        });
                        // 鼠标点击蒙板上
                        self.jq(self.mask, 'click', function(e){
                            if(self.$timeStamp != e.timeStamp){
                                // 隐藏
                                if (!data.next.call(self)){
                                    self.hide();
                                }
                            }
                        });
                    }
                }
            }
            this.setWin(config);
        }
        /**
         * 关闭弹出层
         * @return {Undefined} 无返回值
         */
        ,hide: function(){
            if (this.isShow){
                maxZIndex--;
            }
            this.isShow = 0;
            Popwin.master(this,"hide");
            if(this.config.mask){
                this.toggleMask(false);
            }

            $(document).unbind('keypress.alert');

        }

    });
    exports.alertPopwin = AlertPopwin;
});