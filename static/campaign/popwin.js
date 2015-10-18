define(function(require, exports){
    var $ = require("jquery")
        ,app = require("app")
        ,view = require("view")
        ,comm = require("common")
        ,grid = require("grid")
        ,taglabels = require("taglabels")
        ,util = require("util")
        ,form = require("form")
        ,creative = require('pages/creative')
        ,whisky = require('pages/whisky')
        ,product = require('pages/product')
        ,upload = require('upload')
        ,adPosition = require('pages/ads');

    var Popwin = exports.base = require("popwin_base").base;

    function PopWinTable(config,parent,idObject){
        this.config = $.extend({
            "buttons":['ok']
            ,"target":"body"
            // 表格请求参数
            ,"param":{}
            // 表格类型
            ,"type":"product"
            // 选择、取消时实时发送消息
            ,'realEvent': false
            // 分页相关信息(每页显示条数也在此设定)
            ,"pager":{
                "size":10,
                "bounds":5,
                "firstLast":false,
                "showJumper":0,
                "showSizeTypes":0
            }
            ,"data":null
        }, config);

        PopWinTable.master(this,null,this.config);
        // 弹出层中包含的表格对象
        this.builded = false;
        this.popGrid = null;
        this.selected = {};
        if (config.data && config.data.length){
            for (var i=0; i<config.data.length; i++){
                this.selected[config.data[i]] = 1;
            }
        }
        this.$reload = false;
    }
    extend(
        PopWinTable
        ,Popwin
        ,{
            setParam: function(param){
                this.$reload = util.merge(this.config.param, param, true) || this.$reload;
                if (this.$reload && this.isShow && this.builded){
                    this.$reload = false;
                    this.popGrid.reload(null, this.config.param);
                }
            },
            /**
             * 显示弹出层
             * @param  {Object} tabParams 表格数据加载请求参数
             * @param  {Object} popConfig 弹出层显示参数
             * @return {Undefined}           无返回值
             */
            show:function(tabParams,popConfig){
                PopWinTable.master(this,"show",[popConfig]);
                if (this.builded){
                    if (this.popGrid){
                        if (util.isObject(tabParams)){
                            $.extend(true, this.config.param, tabParams);
                            this.$reload = true;
                        }
                        // 直接调用表格的搜索实例做搜索条件重置
                        this.popGrid.search.reset();
                        if (this.$reload){
                            this.popGrid.updateParam(this.config.param);
                            this.popGrid.reload();
                        }
                    }
                }else {
                    this.build(tabParams);
                }
                this.$reload = false;
            }
            /**
             * 表格设置
             * @param  {Object} param 表格请求参数
             * @return {Undefined}        无返回值
             */
            ,build:function(param,pager){
                this.builded = true;
                var c = this.config;
                if (!grid[c.type]){
                    app.error('Grid Type Error! - ' + c.type);
                    return false;
                }
                $.extend(true, c.param, param);
                param = $.extend(true, {}, c.param, (c.grid && c.grid.param));
                this.popGrid = this.create(
                    'popGrid', grid[c.type],
                    $.extend(true, {
                        "target":this.body
                        ,"hasExport":false
                        ,"hasAmount":false
                        ,"hasSubGrid":false
                        ,"operation":{
                            width: 80,
                            render: 'renderOperation'
                        }
                    }, {
                        "pager":pager || c.pager
                    }, c.grid, {
                        "param":param
                    })
                );
            }
            /**
             * 操作列渲染回调函数
             * @param  {Number} index 列索引号
             * @param  {String} val   列数据值
             * @param  {Object} row   当前行数据
             * @return {String}       返回用作渲染的HTML字符串
             */
            ,renderOperation:function(index,val,row){
                val = this.selected[row._id] || 0;
                if (val){
                    return '<input data-op="unselect" type="button" class="btnGray" value="'+LANG("取消")+'" />';
                }else {
                    return '<input data-op="select" type="button" class="btnGreen" value="'+LANG("添加")+'" />';
                }
            }
            /**
             * 列表操作点击回调函数
             * @param  {Object} ev 事件变量
             * @return {Bool}    返回false阻止事件冒泡
             */
            ,onListOpClick:function(ev){
                var c = this.config;
                var el = ev.param.el;
                switch(ev.param.op){
                    case "select":
                        el.attr({
                            "class":"btnGray"
                            ,"data-op":"unselect"
                            ,"value":LANG("取消")
                        });
                        this.selected[ev.param.data._id] = 1;

                        if (c.realEvent) {
                            this.fire('popTableSelctItem', ev.param.data);
                        }
                        break;

                    case "unselect":
                        el.attr({
                            "class":"btnGreen"
                            ,"data-op":"select"
                            ,"value":LANG("添加")
                        });
                        this.selected[ev.param.data._id] = 0;
                        if (c.realEvent) {
                            this.fire('popTableUnselctItem', ev.param.data);
                        }
                        break;
                }
                return false;
            },
            /**
             * 设置选中的数据行
             * @param {Array} list 选中的数据行ID列表
             */
            setSelected: function(list){
                this.selected = {};
                if (list && list.length){
                    for (var i=0; i<list.length; i++){
                        this.selected[list[i]] = 1;
                    }
                }
                if (this.popGrid){
                    this.popGrid.updateOperation();
                }
                return this;
            },
            /**
             * 删除某个选中的ID选项
             * @param  {Number} id 要删除的ID号
             * @return {None}    无返回
             */
            removeSelect: function(id){
                this.selected[id] = 0;
                if (this.popGrid){
                    this.popGrid.updateOperation();
                }
            },
            /**
             * 重置当前表格选中状态
             * @return {None} 无返回
             */
            reset: function(){
                this.selected = {};
                if (this.popGrid){
                    this.popGrid.updateOperation();
                }
                return this;
            }
        }
    );
    exports.table = PopWinTable;

    /**
     * 选择游戏弹出窗口
     * @param {Object} config 配置信息对象
     */
    function SelectGame(config){
        config = $.extend({
            "title": LANG("选择游戏产品"),
            "type":"product",
            "class":"M-popwin M-popwinSelectGame",
            "width":1000
        }, config);
        SelectGame.master(this, null, config);
    }
    extend(SelectGame, PopWinTable, {
        onListOpClick: function(ev){
            SelectGame.master(this, 'onListOpClick');
            this.fire(ev.param.op + 'Game', ev.param.data);
            return false;
        }
    });
    exports.selectGame = SelectGame;

    /**
     * 选择创意包弹出窗口
     * @param {Object} config 配置信息对象
     */
    function SelectSweety(config){
        config = $.extend({
            "title":LANG("选择创意包"),
            "type":"sweety",
            "labelType":"SweetyLabel",
            "class":"M-popwin M-popwinSelect",
            "width":1000,
            'pager': {'size':8, 'showSizeTypes':0}
        }, config);
        SelectSweety.master(this, null, config);
        this.tag = null;

        //判断是哪一个页面
        this.$page = "list";

        this.$addPageReady = false;
        this.$formModule = creative.addCreative;
        this.$productId = 0;
    }
    extend(SelectSweety, PopWinTable, {
        /**
         * 构建界面元素
         * @param  {Object} param 参数对象
         * @return {None}       无返回
         */
        build: function(param){
            /** 布局
             * this.$wrapCon 顶层容器
             * this.$selCon 选择页面容器
             * this.$addCon 新建页面容器
             * this.$animatedCon 动画容器
             **/
            var c = this.config;

            //页面 -选择创意包
            this.$wrapCon = $("<div class='M-popwinSelectWrap' />").appendTo(this.body);
            this.$selCon = $("<div class='selectivePage' />").appendTo(this.$wrapCon);
            this.$addCon = $("<div class='addedPage' />").hide().appendTo(this.$wrapCon);
            this.$animatedCon = $("<div class='animated' />").appendTo(this.$addCon);

            // 创建标签模块
            if (c.labelType && !this.tag){
                this.tag = this.create("tag", taglabels.simple, {
                    "target": this.$selCon
                    ,"type": c.labelType
                    ,"param": param || {}
                });
            }
            if (param){
                this.tag.setParam(param);
            }

            var box = $('<div class="M-popwinSelectAction"/>').appendTo(this.$selCon);
            // 显示选择
            var showSel = $('<label><input type="checkbox"/> 显示已选</label>').appendTo(box);
            this.jq(showSel.find('input'), 'change', 'eventChangeShowSelect');

            // 新建按钮
            var text;
            switch (c.type){
                case 'sweety':
                    text = LANG('新建创意包');
                    break;
                case 'whisky':
                    text = LANG('新建落地页');
                    break;
                case 'product':
                    text = LANG('新建产品');
                    break;
                case 'adPosition':
                    text = LANG('新建广告位');
                    break;
            }
            if (text){
                this.$listPageTitle = c.title;
                this.$addPageTitle = text;
                this.create("addForm", comm.button, {
                    "target": box,
                    "class": "btn primary",
                    "text": text
                });
            }


            //容器内部创建表格
            var body = this.body;
            this.body = this.$selCon;
            SelectSweety.master(this, 'build', arguments);
            this.body = body;

            this.switchMode('list');
        },
        /**
         * 创建模块 -添加创意包
         */
        buildAddPage: function(){
            if (this.$addPageReady){ return false; }
            //隐藏外层容器
            this.$addCon.show();

            //创意包模块
            this.mod = this.create(
                'sweetyAddSub'
                ,this.$formModule
                ,{
                    'target': this.$animatedCon,
                    //是否需要删除默认的按钮
                    'noButtons': true,
                    'popwinCreate': true
                }
            );

            //创建滚动条
            this.$scroll = this.create(
                'scroll', comm.scroller,
                {
                    target: this.$addCon,
                    content: this.$animatedCon,
                    watch: 300,
                    dir: 'V'
                }
            );

            this.$addPageReady = true;
            return true;
        },
        renderSweetyStatus: function(index, val, data, con){
            var text = (+data.Status == 1) ? LANG('已开启'): LANG('已暂停');
            var className = (+data.Status == 1) ? 'runing': 'suspend';
            return '<div class="G-iconFunc '+className+'" title="'+text+'">';
        },
        // 设置产品ID
        setProductId: function(product_id){
            this.$productId = product_id;
        },
        eventChangeShowSelect: function(evt, elm){
            if (elm.checked){
                var ids = [];
                util.each(this.selected, function(chk, id){
                    if (chk){ ids.push(id); }
                });
                this.popGrid.setParam({'Ids': ids.join(',')});
            }else {
                this.popGrid.setParam({'Ids': null});
            }
            this.popGrid.load();
        },
        /**
         * 改变标签
         * @param  {[type]} ev [description]
         * @return {[type]}    [description]
         */
        onSimpleLabelChange: function(ev){
            if (!this.popGrid){
                return false;
            }
            if (ev.param){
                this.popGrid.setParam({'Label':JSON.stringify(ev.param)});
            }else {
                this.popGrid.setParam({'Label':null});
            }
            this.popGrid.load();
        },
        /**
         * 项目选择事件函数
         * @param  {Object} ev 事件变量
         * @return {Bool}    返回false阻止事件冒泡
         */
        onListOpClick: function(ev){
            var type = ev.param.op + 'Creative';
            var result = this.send(this.parent(), type, ev.param.data);
            if (result.returnValue){
                SelectSweety.master(this, 'onListOpClick');
            }
            return false;
        },
        /**
         * 按钮点击响应函数
         */
        onButtonClick: function(ev){
            //新建创意包
            if(ev.name == "addForm"){
                if (!this.$addPageReady){
                    this.buildAddPage();
                }
                this.switchMode('add');
            }
        },
        /**
         * 确定响应事件
         * @param  {Object}    ev 事件消息对象
         * @return {Undefined}    无返回值
         */
        onOk: function(evt){
            if(this.$page === "add"){
                //保存
                this.save();
            }else{
                this.hide();
            }
            return false;
        },
        /**
         * 取消响应事件
         * @param  {Object}    ev 事件消息对象
         * @return {Undefined}    无返回值
         */
        onCancel: function(evt){
            //新建创意包页面
            if(this.$page === "add"){
                //重置到选择创意包页面
                this.switchMode('list');
            }else{
                this.hide();
            }
            return false;
        },
        /**
         * 切换页面状态
         */
        switchMode: function(mode){
            switch (mode){
                case 'list':
                    // 重置表单
                    if (this.mod){ this.mod.reset(); }

                    // 动画效果-移出
                    var wrap = this.$addCon;
                    this.$animatedCon.animate({'left':'990px'}, 500, function(){
                        wrap.hide();
                    });
                    // 更新标题名字
                    this.changeTitle(this.$listPageTitle);

                    // 更新按钮名字
                    this.$.ok.setData(LANG("完成"));
                    this.$.cancel.hide();
                    // 隐藏加载动画
                    this.hideLoading();
                    break;
                case 'add':
                    this.$addCon.show();
                    // 重新计算滚动条
                    this.$scroll.measure();

                    // 动画效果-移进
                    this.$animatedCon.animate({'left':'0'}, 500);

                    // 更新标题名称
                    this.changeTitle(this.$addPageTitle);
                    // 更新按钮名称
                    this.$.ok.setData(LANG("保存"));
                    this.$.cancel.show();
                    break;
                default:
                    return false;
            }
            this.$page = mode;
            return true;
        },
        /**
         * 保存 -新建创意包
         */
        save: function(){
            var self = this;
            self.mod.getDataAsync(function(data){
                // 检查关联产品, 自动管理当前产品
                if (self.$productId){
                    if (util.find(data.Products, self.$productId) === null){
                        data.Products.push(self.$productId);
                    }
                }
                self.showLoading();
                app.data.put(self.mod.database, data, self, "afterSave");
            });
        },
        afterSave: function(err, data){
            this.hideLoading();
            if(err){
                app.alert(err.message);
                app.error(err);
                return false;
            }

            //添加选中创意包
            this.send(this.parent(), "selectCreative", data);

            //设置该操作列选中状态
            this.selected[data._id] = 1;

            //刷新表格
            if (this.popGrid){
                this.popGrid.updateOperation();
                this.popGrid.load();
            }

            //重置到选择创意包页面
            this.switchMode('list');
        },
        /**
         * 高度改变响应函数
         */
        onHeightChange: function(ev){
            // 重新计算滚动条高度
            if (this.$page === 'add'){
                this.$scroll.measure();
            }
        },
        /**
         * 显示数据加载中
         * @return {None} 无返回
         */
        showLoading: function(){
            if (this.$.loading){
                this.$.loading.show();
            }else {
                this.create('loading', comm.loadingMask);
            }
        },
        /**
         * 隐藏数据加载提示
         * @return {None} 无返回
         */
        hideLoading: function() {
            if (this.$.loading) {
                this.$.loading.hide();
            }
        }
    });
    exports.selectSweety = SelectSweety;

    /**
     * 选择落地页弹出窗口
     * @param {Object} config 配置信息对象
     */
    function SelectWhisky(config){
        config = $.extend({
            "title":LANG("选择落地页"),
            "type":"whisky",
            "labelType":"WhiskyLabel",
            "width":1000,
            'pager': {'size':8, 'showSizeTypes':0}
        }, config);
        SelectWhisky.master(this, null, config);
        this.$formModule = whisky.addWhisky;
    }
    extend(SelectWhisky, SelectSweety, {
        save: function(){
            var data = this.mod.getWhiskyData();
            if(data){
                // 检查关联产品, 自动管理当前产品
                if (this.$productId){
                    data.Products.push(this.$productId);
                }
                this.showLoading();
                app.data.put(
                    this.mod.database
                    ,data
                    ,this
                    ,"afterSave"
                );
            }
        }
    });
    exports.selectWhisky = SelectWhisky;

    /**
     * 选择活动弹出窗口
     * @param {Object} config 活动窗口配置信息
     */
    function SelectCampaign(config){
        config = $.extend({
            "title": LANG("活动列表"),
            "type":"campaign",
            "class":"M-popwin M-popwinSelectCampaign",
            "width":800,
            "showFoot":0,
            "grid":{
                hasTab: false,
                subs: null,
                cols: [
                    true,
                    {name:"_id",type:'fixed',sort:true,align:'center',width:70},
                    {name:'Name', type:'index'}
                ]
            }
        }, config);
        SelectCampaign.master(this, null, config);
    }
    extend(SelectCampaign, PopWinTable, {
        onListOpClick: function(ev){
            this.fire('selectCampaign', ev.param.data);
            this.hide();
            return false;
        },
        renderOperation:function(index,val,row){
            return '<input data-op="select" type="button" class="btn" value="'+LANG("选择")+'" />';
        }
    });
    exports.selectCampaign = SelectCampaign;

    /**
     * 选择直投广告位
     */
    var SelectAdPosition = app.extend(SelectSweety, {
        init: function(config, parent){
            config = $.extend({
                "title": LANG("广告位列表"),
                "class":"M-popwin M-popwinSelectAdPosition",
                "width":1020,
                "buttons":[],
                "labelType":null,
                "type":"adPosition",
                "param": {AdChannelId: 3},
                "grid":{
                    hasTab: false,
                    hasExport: false,
                    hasAmount: false
                }
                ,'pager': {'size':8, 'showSizeTypes':0}
            }, config);
            SelectAdPosition.master(this, null, config);
            SelectAdPosition.master(this, 'init', arguments);
            this.selected = {};
            this.$formModule = adPosition.add;
        },
        /**
         * 检查参数是否需要重新加载, 更新列表
         */
        show: function(){
            if (this.builded && this.$.media && this.$reload){
                this.$.media.setData(null);
                this.$.media.load(this.config.param);
            }
            SelectAdPosition.master(this, 'show');
        },
        /**
         * 建立窗口内容回调
         * @return {None} 无返回
         */
        build: function(param){
            var c = this.config;

            //页面 -选择创意包
            this.$wrapCon = $("<div class='M-popwinSelectWrap' />").appendTo(this.body);
            this.$selCon = $("<div class='selectivePage' />").appendTo(this.$wrapCon);
            this.$addCon = $("<div class='addedPage' />").hide().appendTo(this.$wrapCon);
            this.$animatedCon = $("<div class='animated' />").appendTo(this.$addCon);

            if (param){
                this.tag.setParam(param);
            }
            // 创建下拉选择框
            this.create('media', form.dropdown, {
                'target': this.$selCon,
                'label': LANG('选择媒体'),
                'def': LANG('所有媒体'),
                'width': 300,
                'option_render': this.renderOptionItem,
                'url': '/rest/listmassmedia?no_limit=1',
                'param': this.config.param,
                'all': {Name:'所有媒体', Url:''}
            });

            var box = $('<div class="M-popwinSelectAction"/>').appendTo(this.$selCon);
            // 显示选择
            var showSel = $('<label><input type="checkbox"/> 显示已选</label>').appendTo(box);
            this.jq(showSel.find('input'), 'change', 'eventChangeShowSelect');

            this.$listPageTitle = c.title;
            this.$addPageTitle = LANG('新建广告位');
            this.create("addForm", comm.button, {
                "target": box,
                "class": "btn primary",
                "text": this.$addPageTitle
            });

            //容器内部创建表格
            var body = this.body;
            this.body = this.$selCon;
            SelectSweety.master(this, 'build');
            this.body = body;

            this.switchMode('list');
        },
        /**
         * 列表操作点击回调函数
         * @param  {Object} ev 事件变量
         * @return {Bool}    返回false阻止事件冒泡
         */
        onListOpClick:function(ev){
            var el = ev.param.el;
            var data, parent;
            var list = this.popGrid;
            var sels = this.selected;
            if (ev.param.op === 'toggle'){
                data = ev.param.data;
                var id = data._id;
                if (sels[id]){
                    sels[id] = 0;
                    el.attr('class','act').text(LANG("选择"));
                    this.send(this.parent(), 'removePosition', data);
                    list.$all.prop('checked', false);
                }else {
                    sels[id] = 1;
                    el.attr('class','disable').text(LANG("取消"));
                    this.send(this.parent(), 'addPosition', data);
                    data = util.each(list.getData(), function(item){
                        if (!sels[item._id]){ return false; }
                    });
                    list.$all.prop('checked', (data === null));
                }
            }else if (ev.param.op == 'check_all' && list){
                data = list.getData();
                parent = this.parent();
                if (el.prop('checked')){
                    util.each(data, function(item){
                        if (!sels[item._id]){
                            sels[item._id] = 1;
                            this.send(parent, 'addPosition', item);
                        }
                    }, this);
                }else {
                    util.each(data, function(item){
                        if (sels[item._id]){
                            sels[item._id] = 0;
                            this.send(parent, 'removePosition', item);
                        }
                    }, this);
                }
                list.updateOperation();
            }
            data = sels = parent = list = null;
            return false;
        },
        /**
         * 操作列操作渲染回调函数
         */
        renderOperation:function(index,val,row){
            var btn = $('<a data-op="toggle" />');
            if (this.selected[row._id]){
                btn.attr('class', 'disable').text(LANG("取消"));
            }else {
                btn.attr('class', 'act').text(LANG("选择"));
            }
            return btn;
        },
        /**
         * Grid模块加载数据完成后触发, 监控更新全选按钮的状态
         * @param  {Object} ev 事件对象
         * @return {None}      无返回不拦截事件
         */
        onSizeChange: function(ev){
            SelectAdPosition.master(this, 'onSizeChange');
            var data = ev.from.getData();
            var ret = util.each(data, function(item){
                var id = item && item._id;
                if (!this.selected[id]){ return false; }
            }, this);
            if(ev.from.$all){
                ev.from.$all.prop('checked', (ret === null));
            }
            if (this.$page === 'add'){
                this.$scroll.measure();
            }
        },
        /**
         * 下拉框渲染回调函数
         */
        renderOptionItem: function(id, opt, dom){
            var url = opt.Url.replace(/^http[s]?:\/\//i, '');
            url = url.split('/').shift();
            $('<em style="float:right"/>').text(url).appendTo(dom);
            $('<b/>').text(opt.Name).appendTo(dom);
        },
        /**
         * 切换媒体过滤
         */
        onOptionChange: function(ev){
            var media_id = ev.param.id;
            this.popGrid.updateParam({MassMediaId: media_id});
            this.popGrid.load();
            return false;
        },
        save: function(){
            var self = this;
            var cid = self.config.param.AdSubChannelId;
            var data = self.mod.getData();
            if(data){
                if (data.AdSubChannelId != cid){
                    app.confirm('当前渠道与活动渠道不一致, 保存后将丢失之前的所选广告位, 继续保存吗?', function(res){
                        if (res){
                            self.showLoading();
                            app.data.put(self.mod.database, data, self, "afterSave", data);
                        }
                    });
                }else {
                    self.showLoading();
                    app.data.put(self.mod.database, data, self, "afterSave", data);
                }
            }
            return self;
        },
        afterSave: function(err, data, ori_data){
            var self = this;
            self.hideLoading();
            if(err){
                app.alert(err.message);
                app.error(err);
                return false;
            }

            var items = data && data.items;
            if (items && items.length){
                var form = self.parent();
                var param = self.config.param;
                // 检查渠道
                var cid = ori_data.AdSubChannelId;
                if (param.AdSubChannelId != cid){
                    // 渠道变化, 清空之前的广告位选择
                    self.send(form, 'resetSpotChannel', cid);
                    param.AdSubChannelId = cid;
                    self.selected = {};
                }
                // 选中的媒体
                var media_id = ori_data.Id;
                var media = self.$.media;
                media.setData(media_id);
                media.load(param);

                // 更新选中项目和表格
                util.each(data.items, function(item){
                    item.MassMediaName = ori_data.Name;
                    self.send(form, "addPosition", item);
                    self.selected[item._id] = 1;
                });
                if (this.popGrid){
                    this.popGrid.updateParam({
                        'AdSubChannelId': cid,
                        'MassMediaId': media_id
                    });
                    this.popGrid.updateOperation();
                    this.popGrid.load();
                }

                //重置到选择创意包页面
                this.switchMode('list');
            }
        },
        onButtonClick: function(ev){
            var ret = SelectAdPosition.master(this, 'onButtonClick', arguments);
            if(ev.name == "addForm"){
                // 显示表单, 设置当前参数
                var cid = this.config.param.AdSubChannelId;
                this.mod.setChannel(cid);
            }
            return ret;
        }
    });
    exports.selectAdPosition = SelectAdPosition;

    /**
     * 选择广告位分组弹出窗口
     * @param {Object} config 广告位分组窗口配置信息
     */
    function SelectAdsGroup(config){
        config = $.extend({
            "title": LANG("广告位分组"),
            "type":"spotGroup",
            "class":"M-popwin M-popwinSelectCampaign",
            "width":800,
            "showFoot":0,
            "grid":{
                hasTab: false,
                subs: null,
                cols: [
                    //true,
                    {name:"_id",type:'fixed',sort:true,align:'center',width:70},
                    {name:'Name', type:'index'},
                    {name: 'AdxId', text:LANG('渠道'), format:'formatChannel', align:'center'}
                ]
            }
        }, config);
        SelectAdsGroup.master(this, null, config);
    }
    extend(SelectAdsGroup, PopWinTable, {
        onListOpClick: function(ev){
            this.fire('selectAdsGroup', ev.param.data);
            this.hide();
            return false;
        },
        renderOperation:function(index,val,row){
            return '<input data-op="select" type="button" class="btn" value="'+LANG("选择")+'" />';
        },
        setParam: function(data){
            SelectAdsGroup.master(this, 'setParam', arguments);
            return this;
        }
    });
    exports.selectAdsGroup = SelectAdsGroup;

    /**
     * 编辑创意
     */
    function EditSweetyCreative(config){
        config = $.extend(
            {
                "width":800
                ,"data":{}
                ,"creativeData":{}
            }
            ,config
        );
        EditSweetyCreative.master(this,null,config);
        // this.database = app.config("front_base")+"sweety/addsweetycreative";
        this.database = "/sweety/addsweetycreative";
        this.contain = null;
        this.uploadMaterial = null;
        this.previewMaterial = null;
        this.$creativeType = 'file';
    }
    extend(
        EditSweetyCreative
        ,Popwin
        ,{
            /**
             * 显示弹出层
             * @param  {Object} modData   表格数据加载请求参数
             * @param  {Object} popConfig 弹出层显示参数
             * @return {Undefined}           无返回值
             */
            show:function(modData,popConfig){

                var me = this;
                if(util.isObject(modData)){
                    this.config.data = modData;
                }

                if (this.config.data.Type == 3) {
                    // 外部链接
                    this.$creativeType = 'outerLink';
                } else {
                    // 上传文件
                    this.$creativeType = 'file';
                }

                require.async(["upload","preview_material"],function(upload,previewMaterial){
                    EditSweetyCreative.master(me,"show",[popConfig]);
                    if(!me.uploadMaterial){
                        me.build(modData,upload,previewMaterial);
                    }else{
                        me.reload(modData);
                    }
                });
            }
            /**
             * 构造
             * @param  {Object}    data            要编辑的数据
             * @param  {Object}    upload          上传模块包
             * @param  {Object}    previewMaterial 预览模块包
             * @return {Undefined}                 无返回值
             */
            ,build:function(data,upload,previewMaterial){
                if(this.uploadMaterial){
                    return;
                }
                data = data || this.config.data;

                this.contain = this.create(
                    "container"
                    ,view.container
                    ,{
                        "target":this.body
                        ,"class":"M-popwinEditSweetyCreative"
                    }
                );

                // 布局
                this.layout = this.create(
                    "layout"
                    ,view.layout
                    ,{
                        "target":this.contain.el
                        ,"grid":[2,1]
                        ,"cellSet":[
                            {"class":"P-pageCon"}
                        ]
                    }
                );

                // 上传素材
                this.uploadMaterial = this.create(
                    "uploadMaterial"
                    ,upload.porter
                    ,{
                        "target":this.layout.get(0).el
                        ,"title":LANG("素材：")
                        ,"preview":0
                        ,"type":"sweety"
                        ,"mode":"material"
                        // ,"uploadUrl":this.database
                    }
                );

                var pf = data.Name.substr(0,data.Name.indexOf("_"));
                pf = pf || this.config.creativeData[0].Name;

                // 预览
                this.previewMaterial = this.create(
                    "previewMaterial"
                    ,previewMaterial.base
                    ,{
                        "target":this.layout.get(1).el
                        ,"prefix":pf
                        ,"isEdit":1
                        ,"showTotal":0
                    }
                );
                pf = null;
                this.previewMaterial.config.autoName = 0;
                this.previewMaterial.setData([data]);

                // 构建outerLink的html
                var outerLink = $('<div class="M-materialOuterlinkWrapper">').appendTo(this.body);
                var labels = [LANG('地址：'),LANG('尺寸：'),LANG('名称：')];
                var guid = util.guid()-1;
                var el = $([
                    '<div class="item" data-id="0">',
                    '<div class="innerDiv"><label>'+labels[0]+'</label><input type="text" class="path"></div>',
                    '<div class="innerDiv">',
                    '<label>'+labels[1]+'</label>',
                    '<input type="text" class="width"><span>px</span>',
                    '<i class="timsIcon"></i>',
                    '<input type="text" class="height"><span>px</span>',
                    '</div>',
                    '<div class="innerDiv creativeName"><label>'+labels[2]+'</label></div>',
                    '</div>'
                ].join('')).appendTo(outerLink);

                this.create(
                    comm.input
                    ,{
                        "target":el.find(".creativeName")
                        ,"type":"text"
                        ,"value": LANG("新建创意包_")+app.util.date("YmdHis")+LANG("_外链")+guid
                        ,"events":"blur"
                    }
                );
                this.$doms = {};
                this.$doms.outerLinkWidth = outerLink.find('.width');
                this.$doms.outerLinkHeight = outerLink.find('.height');
                this.$doms.outerLinkPath = outerLink.find('.path');
                this.$doms.outerLinkName = outerLink.find('.creativeName input');
                this.$outerLink = outerLink;

                // 根据当前creativeType显示对应的的div
                if (this.$creativeType == 'outerLink') {
                    // 外部链接

                    // 设置对应的dom的值
                    // 名称
                    this.$doms.outerLinkName.val(data.Name);
                    // 地址
                    this.$doms.outerLinkPath.val(data.Path);
                    // width & height
                    this.$doms.outerLinkWidth.val(data.Width);
                    this.$doms.outerLinkHeight.val(data.Height);

                    this.contain.el.hide();
                    this.$outerLink.show();
                } else {
                    // 上传文件

                    this.contain.el.show();
                    this.$outerLink.hide();
                }
            },
            /**
             * 重载
             * @param  {Object}   data 要编辑的数据
             * @return {Undefined}      无返回值
             */
            reload:function(data){
                // 根据当前的creativeType做对应的刷新
                if (this.$creativeType == 'outerLink') {
                    // 设置对应的dom的值
                    // 名称
                    this.$doms.outerLinkName.val(data.Name);
                    // 地址
                    this.$doms.outerLinkPath.val(data.Path);
                    // width & height
                    this.$doms.outerLinkWidth.val(data.Width);
                    this.$doms.outerLinkHeight.val(data.Height);

                    this.contain.el.hide();
                    this.$outerLink.show();

                    return;
                }

                // 默认为creativeType等于“file”
                if(!this.uploadMaterial){
                    // 没有对应的实例则跳到显示部分
                    this.show(data);
                    return;
                }
                for(var n in this.previewMaterial.lists){
                    this.previewMaterial.del(n);
                }
                if(!this.previewMaterial.config.autoName){
                    this.previewMaterial.config.autoName = 1;
                }
                this.previewMaterial.setData([data]);

                this.contain.el.show();
                this.$outerLink.hide();
            }
            /**
             * 文件上传成功
             * @param  {Object} ev 消息对象
             * @return {Bool}      阻止冒泡
             */
            ,onUploadSuccess:function(ev){

                this.previewMaterial.$nowUploading = this.previewMaterial.getQueue();
                this.previewMaterial.updateMaterial(ev.param.data);
                return false;
            }
            /**
             * 文件上传过程
             * @param  {Object} ev 消息对象
             * @return {Bool}      阻止冒泡
             */
            ,onUploadProgress:function(ev){
                this.previewMaterial.updateUploadProgress(ev.param.loaded);
                return false;
            }
            /**
             * 文件上传开始
             * @param  {Object} ev 消息对象
             * @return {Bool}      阻止冒泡
             */
            ,onUploadStart:function(ev){
                for(var n in this.previewMaterial.lists){
                    this.previewMaterial.del(n);
                }
                if(!this.previewMaterial.config.autoName){
                    this.previewMaterial.config.autoName = 1;
                }
                this.previewMaterial.config.isEdit = 0;

                var files = ev.param.files;
                if(files && files.length){
                    this.previewMaterial.multipleAdd(files);
                }
                files = null;
                return false;
            }
            /**
             * 上传失败
             * @param  {Object} ev 消息对象
             * @return {Bool}      false
             */
            ,onUploadFail:function(ev){
                this.previewMaterial.uploadFailed(ev.param);
                return false;
            }
            /**
             * 全部上传完成后
             * @param  {Object} ev 消息对象
             * @return {Bool}      false
             */
            ,onAllUploaded:function(ev){
                return false;
            }
            /**
             * 编辑完成
             * @return {Undefined} 无返回值
             * @todo 接口还未完成
             */
            ,onOk:function(){
                var data = null
                if (this.$creativeType == 'outerLink') {
                    // 外部链接的情况

                    // 构建data
                    data = {
                        "Name": this.$doms.outerLinkName.val(),
                        "Id": this.config.data.Id,
                        "Path": this.$doms.outerLinkPath.val(),
                        "Width": this.$doms.outerLinkWidth.val(),
                        "Height": this.$doms.outerLinkHeight.val()
                    }
                    // 发送请求
                    app.data.put(this.database, data, this);
                    return false;
                }

                // 上传文件
                data = null;
                for(var n in this.previewMaterial.data){
                    if(this.previewMaterial.data[n] && this.previewMaterial.data[n]._id !== this.config.data._id){
                        data = {
                            "Id":this.config.data._id
                            ,"FileId":this.previewMaterial.data[n]._id
                            ,"Name":this.previewMaterial.data[n].Name
                        };
                        break;
                    }
                }
                if(data){
                    // 有数据
                    app.data.get(
                        this.database
                        ,data
                        ,this
                    );
                    data = null;
                }else{
                    // 没数据
                    this.hide();
                }
                return false;
            }
            /**
             * 请求响应函数
             * @param  {Object}    err  错误信息
             * @param  {Object}    data 数据
             * @return {Undefined}      无返回值
             */
            ,onData:function(err,data){
                if(!err){
                    this.hide();
                    this.fire("editDone");
                }else{
                    app.alert(LANG(err.message));
                }
            }
        }
    );
    exports.editSweetyCreative = EditSweetyCreative;


    /**
     * 消息弹出层
     * @param {Object} config 模块设置
     */
    function Notice(config){
        config = $.extend(
            {
                // 位置参照锚点
                "anchor":null
                // 主样式
                ,"class":"M-notice"
                // 是否一次性
                ,"once":0
                // 显示位置
                ,"pos":"tm"
                // 定位偏移
                ,"offsetX":0
                ,"offsetY":0
                // 显示内容
                ,"data":''
                //指定点击显示坐标
                ,'location':null
                // 内容区域样式
                ,"bodyClass":"M-noticeBody"
                // 顶部标题与关闭按钮区域样式
                ,"headClass":"M-noticeHead"
                ,"footClass":"M-noticeFoot"
                ,"actClass":"M-tipAct"
                // 初始化设定为指定位置
                ,"winPosition":{
                "top":"-9999em"
                ,"left":"-9999em"
            }
                // 没按钮
                ,"buttons":null
                // 是否带箭头
                ,"hasArrow":0
                // 显示内容html字符串格式化函数
                ,'formater':null
                // 鼠标移出后隐藏
                ,'outerHide':0
                // info|warn|error
                ,"type":"info"
                // 自动显示
                // ,"autoShow":true
                // 没遮罩
                ,"mask":0
                // 没关闭
                ,"close":null
                // 鼠标经过事件辅助setTimeout方法的延迟时间(ms)
                ,"mouseChkDelay":500
                // 动画执行时间
                ,"fxDelay":300
            }
            ,config
        );
        if(config.type.toLowerCase() === "error" || config.type.toLowerCase() === "warn"){
            config.mask = 1;
        }

        // 没指定锚点则默认是在body
        if(!config.anchor){
            // 计算位置时用于决定要不要参照锚点
            this.noAnchor = 1;
        }
        config.anchor = $(config.anchor || "body");

        // 隐藏回调计时器
        this.timer = null;

        // 移出隐藏计时器
        this.$outerTimer = null;

        // 箭头
        this.arrow = null;

        // 内部容器
        this.inner = null;

        // 箭头体积
        this.arrowWidth = 0;
        this.arrowHeight = 0;

        if(util.isFunc(config.formater)){
            this.formater = config.formater;
        }

        Notice.master(this,null,config);
    }
    extend(
        Notice
        ,Popwin
        ,{
            init:function(){
                Notice.master(this,"init");

                this.inner = $('<div class="tipInner"></div>');
                this.typeIcon = $('<div class="noticeIcon notice'+util.ucFirst(this.config.type)+'"></div><div class="noticeBody"></div>');
                this.body.append(this.typeIcon);

                // 调整位置
                this.inner
                    .append(this.head)
                    .append(this.body)
                    .append(this.foot);

                this.body = this.typeIcon.eq(1);
                this.typeIcon = this.typeIcon.eq(0);
                this.el.append(this.inner);

                // 生成箭头
                if(this.config.hasArrow){
                    this.arrow = $('<b class="tipArrow"></b>').appendTo(this.el);
                }

                // 移出隐藏
                if (this.config.outerHide){
                    this.jq(this.el, 'mouseenter mouseleave', 'eventOuterHide');
                }

                if(this.config.autoShow){
                    this.show();
                }
            }
            /**
             * 获取弹出层的位置
             * @return {Object} 包含弹出层top与left数值
             */
            ,getPos:function(){
                var c = this.config, pos;

                if (app.util.isObject(c.pos)){
                    // 指定位置
                    pos = c.pos;
                    pos.left += c.offsetX;
                    pos.top += c.offsetY;
                }else if (!c.anchor || c.anchor[0] === document.body){
                    // 全屏幕显示居中
                    var d = document
                        ,b = (d.compatMode === "CSS1Compat"?d.documentElement:d.body)
                        ,h = Math.max(0,(b.clientHeight - this.el.outerHeight(true))/2)
                        ,w = Math.max(0,(b.clientWidth - this.el.outerWidth(true))/2)
                        ,sh = Math.max(d.documentElement.scrollTop,d.body.scrollTop)
                        ,sw = Math.max(d.documentElement.scrollLeft,d.body.scrollLeft);

                    pos = {
                        'left': parseInt(sw + w, 10) + c.offsetX,
                        'top': parseInt(sh + h, 10) + c.offsetY
                    };
                }else {
                    var content_width  = this.el.outerWidth();
                    var content_height = this.el.outerHeight();
                    var anchor_width  = c.anchor.outerWidth();
                    var anchor_height = c.anchor.outerHeight();
                    var anchor_offset = c.anchor.offset();

                    pos = {'left': 0, 'top': 0};
                    // 计算垂直坐标
                    var base = anchor_offset.top + c.offsetY;
                    switch (c.pos.charAt(0)){
                        case 'T': pos.top = base; break;
                        case 't': pos.top = base - content_height; break;
                        case 'B': pos.top = base + anchor_height - content_height; break;
                        case 'b': pos.top = base + anchor_height; break;
                        case 'm': pos.top = base + Math.round((anchor_height - content_height)/2); break;
                    }
                    // 计算水平坐标
                    base = anchor_offset.left + c.offsetX;
                    switch (c.pos.charAt(1)){
                        case 'L': pos.left = base; break;
                        case 'l': pos.left = base - content_width; break;
                        case 'R': pos.left = base + anchor_width - content_width; break;
                        case 'r': pos.left = base + anchor_width; break;
                        case 'm': pos.left = base + Math.round((anchor_width - content_width)/2); break;
                    }

                    // 处理箭头位置和位移
                    if (this.arrow){
                        if (!this.$arrowWidth){
                            this.arrow.addClass(c.pos);
                            this.$arrowWidth  = this.arrow.outerWidth();
                            this.$arrowHeight = this.arrow.outerHeight();
                        }
                        var arrow_pos = false,
                            arw = this.$arrowWidth+1,
                            arh = this.$arrowHeight+1,
                            arl = (anchor_offset.left - pos.left)+(anchor_width >> 1),
                            art = (anchor_offset.top - pos.top)+(anchor_height >> 1);

                        switch (c.pos.substr(0,2)){
                            case 'tm': case 'tL': case 'tR':
                            pos.top -= (arh >> 1);
                            arrow_pos = {left: arl - (arw>>1), top: content_height - 1};
                            break;
                            case 'bm': case 'bL': case 'bR':
                            pos.top += (arh >> 1);
                            arrow_pos = {left: arl - (arw>>1), top: -arh};
                            break;
                            case 'ml': case 'Tl': case 'Bl':
                            pos.left -= (arw >> 1);
                            arrow_pos = {left: content_width - 1, top: art - (arh>>1)};
                            break;
                            case 'mr': case 'Tr': case 'Br':
                            pos.left += (arw >> 1);
                            arrow_pos = {left: -arw, top: art - (arh>>1)};
                            break;
                        }

                        if (arrow_pos){
                            this.arrow.css(arrow_pos).attr('class', 'tipArrow '+c.pos).show();
                        }else {
                            this.arrow.hide();
                        }
                    }
                }
                return pos;
            }

            /**
             * 显示
             * @return {Undefined} 无返回值
             */
            ,show:function(){
                if(this.timer){
                    clearTimeout(this.timer);
                    this.timer = null;
                }
                if (this.$outerTimer){
                    clearTimeout(this.$outerTimer);
                }
                if (this.config.data){
                    this.body.html(this.formater(this.config.data));
                }
                Notice.master(this,"show");
                this.setWin(this.getPos());
                this.el.addClass(this.config.actClass);
            }
            ,setData: function(data){
                if(data){
                    this.config.data = data;
                }
                return this;
            }
            ,onSizeChange:function(){
                this.setWin(this.getPos());
                return false;
            }
            /**
             * 隐藏
             * @return {Undefined} 无返回值
             */
            ,hide:function(){
                if(this.timer){
                    clearTimeout(this.timer);
                }
                // 延时300ms执行让动画能显示完
                this.timer = this.setTimeout('doHide',this.config.fxDelay);
            }
            ,doHide: function(){
                this.timer = null;
                this.el.removeClass(this.config.actClass);
                Notice.master(this,"hide");
                if(this.config.once){
                    this.destroy();
                }
            }
            /**
             * 鼠标移出隐藏处理函数
             * @return {None}
             */
            ,eventOuterHide: function(evt){
                switch (evt.type){
                    case 'mouseenter':
                        this.delayHide(0);
                        break;
                    case 'mouseleave':
                        this.delayHide(this.config.mouseChkDelay);
                        break;
                }
            }
            ,toggleState:function(){
                this.showState = !this.showState;
            }
            ,delayHide: function(time){
                if (this.$outerTimer){
                    clearTimeout(this.$outerTimer);
                }
                if(this.timer){
                    clearTimeout(this.timer);
                    this.timer = null;
                }
                if (time){
                    this.$outerTimer = this.setTimeout('hide',time);
                }else {
                    this.$outerTimer = 0;
                }
            }
            /**
             * 显示内容html字符串格式化函数
             * @param  {String} data 原始内容字符串
             * @return {String}      格式化完的字符串
             */
            ,formater:function(data){
                return data;
            }
            /**
             * 重设弹出层设定
             * @param  {Object}    config 新设定
             * @return {Undefined}        无返回值
             */
            ,reload:function(config){
                this.config = $.extend(
                    this.config
                    ,config
                );
                // 没指定锚点则默认是在body
                if(!config.anchor){
                    // 计算位置时用于决定要不要参照锚点
                    this.noAnchor = 1;
                }
                this.config.anchor = $(config.anchor || "body");
            }
        }
    );
    exports.notice = Notice;

    var SysNotice = app.extend(
        Notice
        ,{
            init:function(config){
                config = $.extend(
                    {
                        "autoShow":true
                        ,"pos":"mm"
                        ,"once":1
                        ,"close":{}
                        ,"actClass":"M-noticeAct"
                        ,"buttons":["ok",null]
                        ,"buttonConfig":{
                        // 确定按钮样式
                        "ok": {
                            "type":"button"
                            ,"value":LANG("确定")
                            ,"class":"btnGreen"
                            ,"data-action":"onOk"
                            ,"events":"click"
                        }
                        // 取消按钮的样式
                        /*,"cancel": {
                         "type":"button"
                         ,"value":LANG("取消")
                         ,"class":"btnNormal"
                         ,"data-action":"onCancel"
                         ,"events":"click"
                         }*/
                    }
                        ,"mask":1
                        // 附带传递的参数
                        ,"param":null
                    }
                    ,config
                );
                // 格式化函数不允许修改
                config.formater = null;
                if(!config.type || config.type === "info"){
                    config.autoHide = true;
                }
                if(config.type === "warn"){
                    // 警告带取消按钮
                    config.buttons = ["ok","cancel"];
                }
                SysNotice.master(this,null,config);
                SysNotice.master(this,"init",[config]);
                this.dg(this.body,"a[data-action]","click","actionHandler");
            }
            ,getParam:function(){
                return this.config.param;
            }
            ,actionHandler:function(ev){
                var type = $(ev.target).attr("data-action");
                switch(type){
                    case "back":
                        window.location.hash = window.location.hash.split("/")[0];
                        this.hide();
                        break;

                    case "reload":
                        window.location.reload();
                        break;

                    default:

                }
                return false;
            }
            ,changeType:function(type){
                this.typeIcon.removeClass(this.config.type);
                this.config.type = type;
                this.config.autoHide = this.config.type === "info";
                this.typeIcon.addClass(this.config.type);
            }
            /**
             * 确定响应事件
             * @param  {Object}    ev 事件消息对象
             * @return {Undefined}    无返回值
             */
            ,onOk:function(evt){
                this.fire("sysNoticeOk");
                this.hide();
                return false;
            }
            /**
             * 取消响应事件
             * @param  {Object}    ev 事件消息对象
             * @return {Undefined}    无返回值
             */
            ,onCancel:function(evt){
                this.fire("sysNoticeCancel");
                this.hide();
                return false;
            }
            /**
             * 显示内容html字符串格式化函数
             * @param  {Mix}    data 提示内容对象或字符串
             * @return {String}      格式化完的字符串
             */
            ,formater:function(data){
                if(!data){
                    // 没有
                    return " ";
                }
                if(util.isString(data)){
                    // 字符串直接返回
                    return data;
                }
                /*
                 {
                 // 提示标题
                 "title":"错误提示"
                 // 提示内容主体
                 ,"msg":"站点ID错误或服务请错误。"
                 // 操作提示标题
                 ,"tipTitle":"您可以："
                 // 操作提示列表
                 ,"tip":[
                 {"text":"返回列表页面","action":"back"}
                 ,{"text":"刷新页面","action":"reload"}
                 ,{"text":"返回首页",href:"/"}
                 ,{"text":"联系我们"}
                 ]
                 }
                 */
                var html = ''
                    ,tmp;

                if(data.title){
                    html += '<p>'+data.title+'</p>';
                }

                html += '<div>'+data.msg+'</div>';

                if(data.tip && util.isArray(data.tip) && data.tip.length){
                    if(data.tipTitle){
                        // 操作提示标题
                        html += '<strong>'+data.tipTitle+'</strong>';
                    }
                    // 操作提示列表
                    html += '<ol>';
                    for(var i = 0,len = data.tip.length;i<len;i++){
                        tmp = data.tip[i];
                        if(tmp.text){
                            // 有文本才会输出
                            // 默认动作与链接不能共存
                            if(tmp.href){
                                // 有链接的情况
                                html += '<li><a href="'+tmp.href+'" target="_blank">'+tmp.text+'</a></li>';
                            }else if(tmp.action){
                                // 有默认动作的情况
                                html += '<li><a href="#" data-action="'+ tmp.action+'">'+tmp.text+'</a></li>';
                            }else{
                                // 自由文字
                                html += '<li>'+tmp.text+'</li>';
                            }
                        }
                    }
                    html += '</ol>';
                }
                tmp = null;
                return html;
            }
        }
    );
    exports.sysNotice = SysNotice;

    /**
     * 提示类型的弹出层
     * @param {[type]} config [description]
     */
    function Tip(config){
        config = $.extend(
            {
                "class":"M-tip"
                ,"bodyClass":"M-tipBody"
                // 顶部标题与关闭按钮区域样式
                ,"headClass":"M-tipHead"
                ,"footClass":"M-tipFoot"
                ,"width":260
                ,"hasArrow":1
            }
            ,config
        );
        Tip.master(this,null,config);
    }
    extend(
        Tip
        ,Notice
    );
    exports.tip = Tip;
    /**
     * 弹出日期时间段选择
     */
    var DateTip = app.extend(
        Tip
        ,{
            init: function(config){
                var self = this;
                config = $.extend(true, {
                    'target': 'body',
                    'bodyClass': 'M-commonDatePicker',
                    'footClass': 'M-commonDateButton',
                    'autoHide': 1,
                    'width': 'auto',
                    'buttons': null,

                    'numberOfMonths': 2,
                    'stepMonths': 1,
                    'week_name':['日', '一', '二', '三', '四', '五', '六'],
                    'week_start': 0,

                    'max': 0, // 可以选择的最大日期
                    'min': 0, // 可以选择的最小日期

                    'single': 0, // 只选择一天
                    'begin': 0,
                    'end': 0 ,
                    "hasArrow":0,
                    "autoShow":0
                }, config);
                DateTip.master(self,null,config);
                DateTip.master(self,'init');

                self.el.addClass("M-tipDate");

                // 当前选择状态
                // 0-未选, 1-选开始, 2-选范围
                self.$mode = 0;
                self.$begin = 0;
                self.$end = 0;
                self.$cur = 0;
                self.$max = 0;
                self.$min = 0;
                self.$dom_days = null;
                self.$cals = [];

                self.$show_year = 0;
                self.$show_month = 0;

                self.$chMonthTimer  = 0;
                self.$chMonthDir    = 0;
                self.$chMonthRotine = function(){
                    self.$show_month += self.$chMonthDir;
                    self.showDay();
                }
                self.buildCal();
            },
            /**
             * 更新配置
             * @param  {Object} config 新配置对象
             * @return {Module}        返回对象实例
             */
            setup: function(config){
                $.extend(true, this.config, config);
                // 修改显示月份数量
                var i=this.$cals.length, num = config.numberOfMonths;
                if (num){
                    var j = Math.min(i, num);
                    while (j--){
                        this.$cals[j].container.show();
                    }
                    for (; i<num; i++){
                        this.buildMonth();
                    }
                    for (; i>num;){
                        this.$cals[--i].container.hide();
                    }
                }
                return this;
            },
            /**
             * 构建整体日历
             */
            buildCal: function(){
                var c = this.config;
                var body = this.body;
                // 月份切换
                body.append('<div class="date-ctrl prev"><i/></div><div class="date-ctrl next"><i/></div>');
                // 生成日历
                for (var i=0; i<c.numberOfMonths; i++){
                    this.buildMonth();
                }
                // 监听事件
                this.jq(body.find('.prev:first'), 'mousedown mouseup mouseleave', 'eventPrevMonth');
                this.jq(body.find('.next:first'), 'mousedown mouseup mouseleave', 'eventNextMonth');
                this.dg(body, '.date-head span', 'click', 'eventSelectYearMonth');
                this.dg(body, 'a', 'click mouseenter mouseleave mousedown', 'eventDay');
                this.dg(this.foot,'button[data-action]','click', 'eventButtons');
            },
            /**
             * 构建月份日历
             */
            buildMonth: function(){
                var con = $('<div class="date-container"/>').appendTo(this.body),
                    head = $('<div class="date-head"/>').appendTo(con),
                    week = $('<div class="date-week"/>').appendTo(con),
                    cal = $('<div class="date-cal"/>').appendTo(con);

                var item = {
                    'container':con,// 容器对象
                    'head':head,	// 头部容器
                    'week':week,	// 星期显示容器
                    'body':cal,		// 日历日期容器
                    'year':$('<span class="date-year" />').appendTo(head),  // 头部年份
                    'month':$('<span class="date-month" />').appendTo(head),// 头部月份
                    'days':[],	// 1-31号容器容器
                    'base':0,	// 日期ID基础
                    'pad':null	// 日期开头站位容器
                };
                var i, c = this.config;
                // 生成星期
                for (i=0; i<7; i++){
                    $('<b/>').text(c.week_name[(i+c.week_start)%7]).appendTo(week);
                }

                // 开始日期占位
                item.pad = $('<em/>').appendTo(cal);

                // 生成日期
                for (i=1; i<=31; i++){
                    item.days.push($('<a/>').text(i).appendTo(cal));
                }

                head.attr('data-pos', this.$cals.length);
                this.$cals.push(item);
            },
            /**
             * 计算显示日期位置
             */
            showDay: function(){
                var c = this.config;
                var month = this.$show_month;
                var year  = this.$show_year;
                var max   = this.$max;
                var min   = this.$min;
                var date  = new Date(year, month, 1);
                var item, week, days, k, a, cl, id;

                if (month < 0){
                    this.$show_year = year += Math.floor(month / 12);
                    this.$show_month = month = 12 + (month % 12);
                }else if (month >= 12){
                    this.$show_year = year += Math.floor(month / 12);
                    this.$show_month = month %= 12;
                }

                for (var i=0; i<c.numberOfMonths;i++){
                    item = this.$cals[i];
                    // 开始周
                    week = (date.getDay() - c.week_start) % 7;

                    // 到月末
                    date.setMonth(++month);
                    date.setDate(0);
                    // 月份天数
                    days = date.getDate();


                    // 更新年月
                    item.year.text(year + '/');
                    item.month.text(util.fix0(month,2) + LANG('月'));
                    // 时间ID
                    item.base = year * 10000 + month * 100;
                    // 到下月1日
                    date.setDate(days+1);
                    if (month == 12){
                        year++;
                        month = 0;
                    }
                    // 生成日期
                    item.pad.attr('class', 'w'+week);
                    for (k=0; k<31; k++){
                        a = item.days[k];
                        if (k < days){
                            id = item.base + k + 1;
                            a.attr('date-id', id);
                            cl = (max && id>max || min && id<min)?'disabled':'';
                        }else {
                            a.removeAttr('date-id');
                            cl = 'hide';
                        }
                        a.attr('class', cl);
                    }
                }
                this.updateSelected();
            },
            /**
             * 更新显示选中的时间段
             */
            updateSelected: function(){
                var start = this.$begin, end, i;
                switch (this.$mode){
                    case 1: // 选择中
                        end = this.$cur;
                        break;
                    case 2: // 已选择
                        end = this.$end;
                        break;
                    default:
                        return false;
                }
                if (start > end){
                    i = start;
                    start = end;
                    end = i;
                }

                var item, k, a, id;
                for (i=0; i<this.config.numberOfMonths; i++){
                    item = this.$cals[i];
                    for (k=0; k<31;){
                        a = item.days[k++];
                        id = item.base + k;
                        a.toggleClass('sel', (id >= start && id <= end));
                    }
                }
            },
            /**
             * 切换上一个月份
             */
            eventPrevMonth: function(evt){
                switch (evt.type){
                    case 'mousedown':
                        this.$chMonthDir = -this.config.stepMonths;
                        this.$chMonthRotine();
                        this.$chMonthTimer = this.$chMonthTimer || setInterval(this.$chMonthRotine, 500);
                        return false;
                    case 'mouseup':
                    case 'mouseleave':
                        if (this.$chMonthTimer){
                            clearInterval(this.$chMonthTimer);
                            this.$chMonthTimer = 0;
                        }
                        return false;
                }
            },
            /**
             * 切换下一个月份
             */
            eventNextMonth: function(evt){
                switch (evt.type){
                    case 'mousedown':
                        this.$chMonthDir = this.config.stepMonths;
                        this.$chMonthRotine();
                        this.$chMonthTimer = this.$chMonthTimer || setInterval(this.$chMonthRotine, 500);
                        return false;
                    case 'mouseup':
                    case 'mouseleave':
                        if (this.$chMonthTimer){
                            clearInterval(this.$chMonthTimer);
                            this.$chMonthTimer = 0;
                        }
                        return false;
                }
            },
            /**
             * 日期块鼠标事件
             */
            eventDay: function(evt, elm){
                elm = $(elm);
                var id = +elm.attr('date-id');
                if (elm.hasClass('disabled')){
                    elm.removeClass('hov');
                    return false;
                }
                switch(evt.type){
                    case 'mouseenter':
                        elm.addClass('hov');
                        if (this.$mode === 1){
                            this.$cur = id;
                            this.updateSelected();
                        }
                        break;
                    case 'mouseleave':
                        elm.removeClass('hov');
                        break;
                    case 'click':
                        this.eventSelect(id, elm);
                        break;
                }
                return false;
            },
            /**
             * 日期选择事件处理
             */
            eventSelect: function(date, elm){
                var me = this;
                if (me.config.single){
                    me.$begin = me.$end = me.$cur = date;
                    me.fire('selectDate', me.getData());
                    this.hide();
                    this.updateSelected();
                    return;
                }
                switch (me.$mode){
                    case 0: // 选择开始日期
                    case 2: // 重新开始选择
                        me.$cur = me.$begin = date;
                        me.$end = 0;
                        me.$mode = 1;
                        break;
                    case 1: // 选择结束日期
                        if (date < me.$begin){
                            me.$end = me.$begin;
                            me.$begin = date;
                        }else {
                            me.$end = date;
                        }
                        me.$mode = 2;
                        me.fire('selectDateRange', me.getData());
                        me.hide();
                        break;
                    default:
                        return false;
                }
                this.updateSelected();
            },
            // 选择年月
            eventSelectYearMonth: function(evt, elm){
                //var head = $(elm).parent();

            },
            // 点击功能按钮
            eventButtons: function(evt, elm){
                var name = $(elm).attr('data-action');
                var btn = util.find(this.config.buttons, name, 'name');
                if (btn){
                    this.fire('clickDateButton', btn);
                }
            },
            /**
             * 重写显示函数
             */
            show: function(option){
                var self = this;
                if (option) {
                    self.reload(option);
                }
                var c = self.config;
                var b = util.toDate(c.begin);
                var e = util.toDate(c.end);
                if (b > e){
                    var t = b;
                    b = e;
                    e = t;
                }
                if (c.begin && c.end){
                    self.$mode = 2;
                    self.$begin = +util.date('Ymd', b);
                    self.$end = +util.date('Ymd', e);
                }else {
                    self.$mode = 0;
                    self.$begin = self.$end = 0;
                }
                if (!e){ e = new Date(); }
                self.$show_year  = e.getFullYear();
                self.$show_month = e.getMonth() - c.numberOfMonths + 1;

                self.$max = c.max && +util.date('Ymd', c.max) || 0;
                self.$min = c.min && +util.date('Ymd', c.min) || 0;

                var f = self.foot;
                if (c.buttons){
                    f.empty().show();
                    util.each(c.buttons, function(btn){
                        $('<button/>').text(btn.text)
                            .addClass(btn.cls || null)
                            .attr('data-action', btn.name)
                            .appendTo(f);
                    });
                }else {
                    f.hide();
                }
                self.showDay();
                DateTip.master(self, 'show', null);
            },
            getData: function(){
                var b, e;
                if (this.config.single){
                    b = this.$begin.toString();
                    return (b.substr(0,4) + '-' + b.substr(4,2) + '-' + b.substr(6,2));
                }else if (this.$mode == 2){
                    b = this.$begin.toString();
                    e = this.$end.toString();
                    return {
                        begin: b.substr(0,4) + '-' + b.substr(4,2) + '-' + b.substr(6,2),
                        end: e.substr(0,4) + '-' + e.substr(4,2) + '-' + e.substr(6,2)
                    };
                }else {
                    return null;
                }
            },
            onSwitchPage: function(){
                this.hide();
                return false;
            }
        }
    );
    exports.dateTip = DateTip;


    /**
     * 编辑广告位
     * @param {Object} config 弹出层配置
     */
    function AdPosition(config){
        config = $.extend(
            true
            ,{
                "width":800
                // 广告位编辑弹出层内容样式，ads.less
                ,"adsBoxCls":"adsOuterBox"
                ,"title":LANG("编辑广告位")
            }
            ,config
        );
        AdPosition.master(this,null,config);
        this.adPosition = null;
        // 广告位数据接口
        this.database = "/rest/listadposition";
        // 保存接口
        this.editbase = "/rest/addadposition";
    }
    extend(
        AdPosition
        ,Popwin
        ,{
            init:function(){
                AdPosition.master(this,"init");
                var me = this;
                // 不预加载
                require.async("./pages/media",function(page){
                    me.adPosition = me.create(
                        "ads"
                        ,page.addTheAds
                        ,{
                            "target":me.body

                        }
                    );
                    me.adPosition.el.addClass(me.config.adsBoxCls);
                    me.getAdData();
                });
            }
            /**
             * 获取广告位数据
             * @return {Undefined} 无返回值
             */
            ,getAdData:function(){
                if(this.config.id){
                    app.data.get(
                        this.database
                        ,{
                            "Id":this.config.id
                        }
                        ,this
                    );
                }

            }
            /**
             * 获取广告位请求的回调函数
             * @param  {Object}    err  出错信息
             * @param  {Object}    data 返回数据
             * @return {Undefined}      无返回值
             */
            ,onData:function(err,data){
                if(err){
                    app.alert(err.message);
                    return false;
                }
                var tmp = data.items[0].Name.split("_");
                this.adPosition
                    // 前缀
                    .changePrefix(tmp[0]+"_"+tmp[1])
                    // 写数据
                    .setData(data.items[0]);
                // 改变弹出层
                this.adPosition.fire("sizeChange");
                tmp = null;
            }
            /**
             * 重置弹出层
             * @param  {Object}    param 广告位设置
             * @return {Undefined}       无返回值
             */
            ,reset:function(param){
                if(param && param.id){
                    this.config.id = param.id;
                    this.getAdData();
                }else{
                    this.adPosition.reset();
                }
            }
            /**
             * 保存成功
             * @param  {Object}    err  出错信息
             * @param  {Object}    data 返回数据
             * @return {Undefined}      无返回值
             */
            ,onSaveDone:function(err,data){
                if(err){
                    app.alert(err.message);
                    return false
                }
                this.hide();
                this.fire("adsEditSuccess");
            }
            /**
             * 保存事件
             * @return {Boolean} 阻止冒泡
             */
            ,onOk:function(){
                var data = this.adPosition.getData();
                if(data){
                    app.data.put(
                        this.editbase
                        ,data
                        ,this
                        ,"onSaveDone"
                    );
                }else{
                    console.error("（¯﹃¯）");
                }
                return false;
            }
        }
    );
    exports.adPosition = AdPosition;

    function MediaChannel(config){
        config = $.extend(
            true
            ,{
                "width":500
                ,"id":0
                ,"name":""
            }
            ,config
        );
        MediaChannel.master(this,null,config);
        this.editbase = "/rest/addmasschannel";
    }
    extend(
        MediaChannel
        ,Popwin
        ,{
            init:function(){
                MediaChannel.master(this,"init");
                this.build();
            }
            ,build:function(){
                var me = this;
                this.contain = this.create(
                    "contain"
                    ,view.container
                    ,{
                        "target":this.body
                        ,"class":"pd10"
                    }
                );
                this.createAsync(
                    "channelNameInput"
                    ,'common.input'
                    ,{
                        "target":me.contain.el
                        ,"label":{
                            "html":LANG("频道名称")
                        }
                        ,"placeholder":LANG("请填写频道名称")
                    }
                    ,function(mod){
                        me.channelNameInput = mod;
                        mod.setData(me.config.name);
                        mod.label.el.css("display","block");
                    });
            }
            ,reset:function(param){
                if(param){
                    this.config = $.extend(
                        this.config
                        ,param
                    );
                    if(param.title){
                        this.changeTitle(param.title);
                    }
                    this.channelNameInput.el.val(this.config.name);
                }else{
                    this.config.id = 0;
                    this.config.name = "";
                    this.channelNameInput.el.val("");
                }
            }
            /**
             * 保存成功
             * @param  {Object}    err  出错信息
             * @param  {Object}    data 返回数据
             * @return {Undefined}      无返回值
             */
            ,onSaveDone:function(err,data){
                if(err){
                    app.alert(err.message);
                    return false
                }
                this.hide();
                this.fire("adsEditSuccess");
            }
            ,onOk:function(){
                var data = {
                    "Name":this.channelNameInput.el.val()
                    ,"MassMediaId":this.config.mediaId
                };
                if(this.config.id){
                    data.Id = this.config.id;
                }
                if(data.Name && data.MassMediaId){
                    app.data.put(
                        this.editbase
                        ,data
                        ,this
                        ,"onSaveDone"
                    );
                }else{
                    console.error("（¯﹃¯）");
                }
                return false;
            }
        }
    );
    exports.mediaChannel = MediaChannel;

    function ProgressDetail(config){
        config = $.extend(
            true
            ,{
                "class":"M-progressDetail"
                // 内容区域样式
                ,"bodyClass":"M-progressDetailBody"
                // 顶部标题与关闭按钮区域样式
                ,"headClass":"M-progressDetailHead"
                ,"footClass":"M-progressDetailFoot"
                ,"param":null
                ,"autoHide":1
                ,"winPosition":{
                    "left":0
                    ,"top":0
                }
                ,"mask":0
                ,"width":340
            }
            ,config
        );
        this.database = "/rest/listcampaignrundata";
        ProgressDetail.master(this,null,config);
    }
    extend(
        ProgressDetail
        ,Popwin
        ,{
            init:function(){
                ProgressDetail.master(this,"init");
                this.arrow = $('<div class="triangleWithShadow"><b></b><i></i></div>');
                this.el.append(this.arrow);
                if(this.config.param){
                    this.load();
                }
            }
            /**
             * 构建容器内容
             * @param  {Object}    data 对于进度数据
             * @return {Undefined}      无返回值
             * @todo 未完成。等数据
             */
            ,buildContain:function(data){
                var htm = '<div class="campaignValue">'
                    ,imp = _buildBlock({
                        "name":LANG("曝光")
                        ,"cls":"detailBlock imp"
                        ,"act":data.impressions
                        ,"est":0
                        ,"total":data.EstImpression
                    },"#4BA617")
                    ,click = _buildBlock({
                        "name":LANG("点击")
                        ,"cls":"detailBlock click"
                        ,"act":data.clicks
                        ,"est":0
                        ,"total":data.EstClick
                    },"#F57EFF")
                    ,date;
                // console.log(imp,click);
                // <li><span>'+LANG("使用创意")+'</span>'+data.creatives+'</li>'
                // <li><span>'+LANG("活动标签")+'</span>'+data.labels+'</li>
                date = _getDate(data.StartTime)+"-"+_getDate(data.EndTime);
                htm += (imp+click+'</div><div class="campaignInfo"><ul>');
                htm += '<li><span>'+LANG("投放周期:")+'</span>'+date+'</li>';
                htm += '<li><span>'+LANG("媒体平台:")+'</span>'+(data.SubChannelNames.toString() || LANG("无"))+'</li>';
                if(app.getUser().type !== 2){
                    // 电商无产品
                    // @todo 需要用配置来决定显示哪些？
                    htm += '<li><span>'+LANG("推广产品:")+'</span>'+(data.ProductNames || LANG("无"))+'</li>';
                }
                htm += '</ul></div>';
                // htm = $(htm);
                imp = click = date = null;
                this.body.append(htm);
            }
            /**
             * 弹出层定位函数
             * @param  {Element} anchor 定位DOM对象
             * @return {Object} 弹出层位置对象（top,left）
             */
            ,getPos:function(anchor){
                // 默认隐藏弹出层
                var pos = {top: -9999, left:0};
                if(anchor && anchor.width()){
                    pos = anchor.offset();
                    pos.left = pos.left + anchor.width();
                    pos.top  = Math.round(pos.top - this.el.outerHeight()/2);
                }
                this.config.winPosition = pos;
                return pos;
            }
            /**
             * 显示
             * @return {Undefined} 无返回值
             */
            ,show:function(el){
                ProgressDetail.master(this,"show",[this.getPos(el)]);
            }
            /**
             * 数据加载函数
             * @param  {Object} param 数据接口参数
             * @return {Object}       弹出层对象
             */
            ,load:function(param){
                if(!this.config.param && param){
                    this.config.param = param;
                }else if(param){
                    this.config.param = $.extend(
                        this.config.param
                        ,param
                    );
                }else{
                    console.error("Err->","need PARAM.");
                    return false;
                }
                this.body.empty();
                this.el.addClass('loading');
                app.data.get(
                    this.database
                    ,this.config.param
                    ,this
                );
                return this;
            }
            /**
             * 数据获取函数回调函数
             * @param  {Object}    err  错误消息对象
             * @param  {Object}    data 数据对象
             * @return {Undefined}      无返回值
             */
            ,onData:function(err,data){
                this.el.removeClass('loading');
                if(err){
                    app.alert(err.message);
                    return false;
                }
                if(data.items.length){
                    this.setData(data.items[0]);
                }
            }
            /**
             * 写入界面
             * @return {Object} 弹出层对象
             */
            ,setData:function(data){
                this.reset()
                    .buildContain(data);
                return this;
            }
            /**
             * 重置
             * @return {Object} 弹出层对象
             */
            ,reset:function(){
                this.body.empty();
                return this;
            }
        }
    );

    /**
     * 获取日期字符串
     * @param  {Int}    time 对应日期的8位数整数
     * @return {string}      格式化完的字符串
     */
    function _getDate(time){
        var str = "";
        if(time){
            time = time.toString();
            str += time.substr(0,4)+LANG("年")+time.substr(4,2)+LANG("月")+time.substr(6)+LANG("日");
        }else{
            str = LANG("不限");
        }
        return str;
    }

    /**
     * 构建进度详细弹出层中的类型块
     * @param  {Object} data 类型数据
     * @return {String}      html字符串
     * @private
     */
    function _buildBlock(data,color){
        var html = '<div class="'+data.cls+'"><strong>'+LANG(data.name+"完成度")+'</strong>'
            ,actRate = (data.act/data.total)*100
            ,estRate = (data.est/data.total)*100;
        actRate = isNaN(actRate) ? 0 : isFinite(actRate) && actRate || 0;
        estRate = isNaN(estRate) ? 0 : isFinite(estRate) && estRate || 0;

        if(actRate > 0){
            actRate = util.toFixed(actRate,2);
        }
        if(estRate > 0){
            estRate = util.toFixed(estRate,2);
        }
        // 进度条
        // <i style="left:'+estRate+'%"></i>
        html += '<div class="progressBar"><div>'+_buildBar(actRate,color)+'</div><span><em>'+actRate+'</em>%</span></div>';
        html += '<ul>';
        // 具体项目
        // <li>'+LANG("截至今日预计"+data.name+"数")+'<p>'+data.est+'</p></li>
        html += '<li>'+LANG("实际"+data.name+"数")+'<p>'+data.act+'</p></li><li>'+LANG("活动预计"+data.name+"数")+'<p>'+data.total+'</p></li>';
        html += '</ul></div>';
        actRate = estRate = data = null;
        return html;
    }
    /**
     * 构建状态进度条
     * @param  {Number} pre 比值
     * @return {String}     html字符串
     * @private
     */
    function _buildBar(pre,color){
        var str
            ,x = pre/100
            ,m = Math.floor(x);
        if(x>1){
            m = (x - m)*100;
            str = '<p style="width:'+m+'%;" class="anotherBar"><b></b></p><p style="width:100%"></p>';
        }else{
            str = '<p style="width:'+pre+'%"><b></b></p>';
        }
        x = m = null;
        return str;
    }
    exports.progressDetail = ProgressDetail;



    /**
     * 编辑渠道
     */
    function EditChannel(config){
        config = $.extend(
            {
                "width":600
                ,"data":{}
            }
            ,config
        );
        EditChannel.master(this,null,config);
        this.database = "/rest/addadsubchannel";
        this.channel = null;
        this.data = {};
        if(this.config.data){
            this.data = this.config.data;
            delete this.config.data;
        }
    }
    extend(
        EditChannel
        ,Popwin
        ,{
            /**
             * 显示弹出层
             * @param  {Object} modData   表格数据加载请求参数
             * @param  {Object} popConfig 弹出层显示参数
             * @return {Undefined}           无返回值
             */
            show:function(modData,popConfig){
                var me = this;
                if(util.isObject(modData)){
                    this.data = modData;
                }
                require.async("pages/channel",function(channel){
                    EditChannel.master(me,"show",[popConfig]);
                    if(!me.channel){
                        me.build(modData,channel);
                    }else{
                        me.reset(modData);
                    }
                });
            }
            /**
             * 构造
             * @param  {Object}    data             要编辑的数据
             * @param  {Object}    channel          上传模块包
             * @param  {Object}    previewMaterial  预览模块包
             * @return {Undefined}                  无返回值
             */
            ,build:function(data,channel){
                this.channel = this.create(
                    "channel"
                    ,channel.addChannelMain
                    ,{
                        "target":this.body
                        ,"class":"M-popwinEditChannel"
                    }
                );
                this.channel.channelName.el.val(this.data.Name?this.data.Name:"");
                this.channel.channelUrl.el.val(this.data.Url);
            }
            /**
             * 重载
             * @param  {Object}   data 要编辑的数据
             * @return {Undefined}      无返回值
             */
            ,reset:function(data){
                if(data){
                    this.data = $.extend(
                        true
                        ,this.data
                        ,data
                    );
                }
                this.channel.channelName.el.val(this.data.Name);
                this.channel.channelUrl.el.val(this.data.Url);
            }
            /**
             * 编辑完成
             * @return {Undefined} 无返回值
             */
            ,onOk:function(ev){
                this.data.Id = this.data._id;
                this.data.Name = this.channel.channelName.el.val();
                this.data.Url = this.channel.channelUrl.el.val();
                // 有数据
                app.data.put(
                    this.database
                    ,this.data
                    ,this
                );
                return false;
            }
            /**
             * 请求响应函数
             * @param  {Object}    err  错误信息
             * @param  {Object}    data 数据
             * @return {Undefined}      无返回值
             */
            ,onData:function(err,data){
                if(!err){
                    EditChannel.master(this,"hide");
                    this.fire("editChannelDone", {"id": data._id});
                }else{
                    app.alert(LANG(err.message));
                }
            }
        }
    );
    exports.editChannel = EditChannel;


    function EditPlatform(config){
        config = $.extend(
            {
                "width":600
                ,"data":{}
            }
            ,config
        );
        EditPlatform.master(this,null,config);
        this.database = "/rest/addplatform";
        this.platform = null;
        this.data = {};
        if(this.config.data){
            this.data = this.config.data;
            delete this.config.data;
        }
    }
    extend(
        EditPlatform
        ,Popwin
        ,{
            /**
             * 显示弹出层
             * @param  {Object} modData   表格数据加载请求参数
             * @param  {Object} popConfig 弹出层显示参数
             * @return {Undefined}           无返回值
             */
            show:function(modData,popConfig){
                var me = this;
                if(util.isObject(modData)){
                    this.data = modData;
                }
                require.async("pages/platform",function(platform){
                    EditPlatform.master(me,"show",[popConfig]);
                    if(!me.platform){
                        me.build(modData,platform);
                    }else{
                        me.reset(modData);
                    }
                });
            }
            /**
             * 构造
             * @param  {Object}    data              要编辑的数据
             * @param  {Object}    platform          上传模块包
             * @param  {Object}    previewMaterial   预览模块包
             * @return {Undefined}                   无返回值
             */
            ,build:function(data,platform){
                this.platform = this.create(
                    "platform"
                    ,platform.add
                    ,{
                        "target":this.body.addClass("M-popwinEditPlatform")
                    }
                );
                data = data || this.data;
                this.platform.show();
                this.platform.setData(data);
            }
            /**
             * 重载
             * @param  {Object}   data 要编辑的数据
             * @return {Undefined}      无返回值
             */
            ,reset:function(data){
                if(data){
                    this.data = $.extend(
                        true
                        ,this.data
                        ,data
                    );
                    this.platform.setData(data);
                }else{
                    this.platform.reset();
                }
            }
            /**
             * 编辑完成
             * @return {Undefined} 无返回值
             */
            ,onOk:function(ev){
                this.data = this.platform.getData();
                this.data.Id = this.data._id;
                // 数据过滤
                var data = {};
                data.Name = this.data.Name;
                data.Description = this.data.Description;
                data.Id = this.data.Id

                app.data.put(
                    this.database
                    ,data
                    ,this
                );
                return false;
            }
            /**
             * 请求响应函数
             * @param  {Object}    err  错误信息
             * @param  {Object}    data 数据
             * @return {Undefined}      无返回值
             */
            ,onData:function(err,data){
                if(!err){
                    EditPlatform.master(this,"hide");
                    this.fire("editPlatformDone", {"id": data._id});
                }else{
                    app.alert(LANG(err.message));
                }
            }
        }
    );
    exports.editPlatform = EditPlatform;

    var SelectProduct = app.extend(SelectSweety, {
        init: function(config, parent){
            config = $.extend({
                "title":LANG("选择产品"),
                "type":"product",
                "labelType":null,
                "width":1000,
                'grid':{
                    cols:[
                        {type:'id', width:60},
                        {name:'ProductNameWithThumb', thumb_size:35},
                        {name:'click_rate'},
                        {name:'back_reg_rate'}
                    ],
                    "sort": "_id", // 排序字段，默认为展示量
                    "order": "desc",
                    'hasTab': false
                },
                'param':{
                    'speed_up': 1,
                    'stastic_all_time':1
                },
                'pager': {'size':8, 'showSizeTypes':0}
            }, config);

            SelectProduct.master(this, null, config);
            this.$formModule = product.add;

            SelectProduct.master(this, 'init', arguments);

            this.$maxCount = 0;
            this.$curCount = 0;
            this.$initSelect = '';
            this.$dataCache = {};
        },
        setLimit: function(cur, max){
            this.$curCount = cur;
            this.$maxCount = max;
            return this;
        },
        setSelected: function(sels){
            if (sels){
                sels.sort();
                this.$curCount = sels.length;
                this.$initSelect = ','+sels+',';
            }else {
                this.$curCount = 0;
                this.$initSelect = ',,';
            }
            return SelectProduct.master(this, 'setSelected', arguments);
        },
        switchMode: function(mode){
            if (mode === 'add' && this.$maxCount){
                if (this.$curCount >= this.$maxCount){
                    app.alert(LANG('已超过允许选择的产品数量'));
                    return false;
                }
            }
            return SelectProduct.master(this, 'switchMode', arguments);
        },
        onListOpClick: function(ev){
            var block = false;
            var id = ev.param.data._id;
            switch (ev.param.op){
                case 'select':
                    if (this.$maxCount && this.$curCount >= this.$maxCount){
                        app.alert(LANG('已超过允许选择的产品数量'));
                        block = true;
                    }else {
                        this.$curCount++;
                    }
                    break;
                case 'unselect':
                    this.$curCount--;
                    if (this.$initSelect.indexOf(','+id+',') !== -1){
                        if (!confirm(LANG('真的要取消选择该产品么?'))){
                            block = true;
                        }
                    }
                    break;
            }
            if (block){
                return false;
            }else {
                this.$dataCache[id] = ev.param.data;
                return SelectProduct.master().master(this, 'onListOpClick', arguments);
            }
        },
        onOk: function(ev){
            if(this.$page === "add"){
                //保存
                this.save();
            }else{
                // 检查是否有改变选择的产品
                var ids = this.$initSelect;
                var cache = this.$dataCache;
                var dels = [], adds = [];
                util.each(this.selected, function(chk, id){
                    var exist = (ids.indexOf(','+id+',') !== -1);
                    if (chk != exist){
                        (chk ? adds : dels).push(cache[id]);
                    }
                });
                util.each(dels, function(game){
                    this.fire('unselectGame', game);
                }, this);
                util.each(adds, function(game){
                    this.fire('selectGame', game);
                }, this);

                // 隐藏窗口
                this.hide();
            }
            return false;
        },
        save: function(){
            var data = this.mod.getData();
            if(data){
                this.showLoading();
                app.data.put(
                    this.mod.database
                    ,data
                    ,this
                    ,"afterSave"
                );
            }
        },
        afterSave: function(err, data){
            this.hideLoading();
            if(err){
                app.alert(err.message);
                app.error(err);
                return false;
            }

            //设置该操作列选中状态
            this.selected[data._id] = 1;
            this.$dataCache[data._id] = data;

            //刷新表格
            if (this.popGrid){
                this.popGrid.updateOperation();
                this.popGrid.load();
            }

            //重置到选择创意包页面
            this.switchMode('list');
        }
    });
    exports.selectProduct = SelectProduct;


    /**
     * 省份信息提示tip
     * @type {function}
     */
    var MapTip = app.extend(Tip,{
        init:function(){
            MapTip.master(this,null);
            MapTip.master(this,'init');
        }
        ,setConfig:function(param){
            this.config.data = param.data;
            this.config.location = {
                x:param.x,
                y:param.y-10
            }
            return this;
        }
        //重写hide函数，触发tipHide事件告之上一层
        ,hide:function(){
            MapTip.master(this,'hide');
            this.fire('tipHided');
        }
    })
    exports.mapTip = MapTip;

    var SelectOneCreative = app.extend(
        Popwin
        ,{
            init:function(config){
                config = $.extend(
                    {
                        "width":600
                        ,"thumbUrl":app.config("front_base")+"sweety/imageshow"
                        ,"thumbHeight":80
                        ,"thumbWidth":65
                        ,"buttons":["ok",null]
                        ,"close":null
                    }
                    ,config
                );
                config.thumbUrl = config.thumbUrl+"?Path={Path}&Width="+config.thumbWidth+"&Height="+config.thumbHeight;
                SelectOneCreative.master(this,null,config);
                SelectOneCreative.master(this,"init",[config]);

                // 文件缓存
                this.$files = {};
                // 数据缓存
                this.$data = {};
                // 已选的数据
                this.$selectedData = {};
                // 临时数据
                this.$tmpData = null;
                // 要选的数量
                this.$len = 0;

                this.build();
                this.bindEvent();
            }
            /**
             * 构造
             * @return {Undefined} 无返回值
             */
            ,build:function(){
                var con = $('<div class="M-previewMaterial M-previewMaterialSelectOne"><div class="previewArea"><ul></ul></div></div>');
                this.doms = {
                    "box":con
                    ,"list":con.find("ul")
                }
                this.body.append(con);
                this.$goodScroller = this.create(
                    "goodScroller"
                    ,comm.scroller
                    ,{
                        "target":con.find(".previewArea:first")
                        ,"content":this.doms.list
                        ,"dir":"V"
                    }
                );
                con = null;
            }
            /**
             * 事件绑定
             * @return {Undeifned} 无返回值
             */
            ,bindEvent:function(){
                this.dg(this.doms.list,"input","click","eventHandler");
            }
            /**
             * 按钮事件响应函数
             * @param  {Object}    ev 鼠标事件
             * @return {Undefined}    无返回值
             */
            ,eventHandler:function(ev){
                var tag = $(ev.target)
                    ,type = tag.attr("data-action")
                    ,id = tag.attr("data-id");
                this[type](id,tag);
                tag = type = id = null;
            }
            /**
             * 设定选择的尺寸
             * @param  {Number}    id  索引
             * @param  {Object}    tag 按钮dom
             * @return {Undefined}     无返回值
             */
            ,select:function(id,tag){
                var item = this.$data[id]
                    ,key = item.Width+"x"+item.Height;
                if(this.$selectedData[key]){
                    this.$files["item_"+this.$selectedData[key]._id].removeClass("beSelected");
                }
                this.$files["item_"+item._id].addClass("beSelected");
                this.$selectedData[key] = item;
            }
            /**
             * 添加文件
             * @param  {Array}    files 文件列表
             * @return {Undefined}      无返回值
             */
            ,add:function(files){
                var img,key,data;

                this.$data = {};
                this.$tmpData = {};
                this.$len = 0;

                for(var i = 0,len = files.length;i<len;i++){
                    // 按文件尺寸分类
                    this.$data[files[i]._id] = files[i];
                    key = files[i].Width+"x"+files[i].Height;
                    if(!this.$tmpData[key]){
                        // 增加分类
                        this.$tmpData[key] = {};
                        this.$len += 1;
                    }
                    this.$tmpData[key][files[i]._id] = files[i];
                }

                for(var n in this.$tmpData){
                    // 按分类生成
                    this.doms.list.append('<li class="theSize">'+n+'</li>');
                    for(var m in this.$tmpData[n]){
                        data = this.$tmpData[n][m];
                        this.$files["item_"+data._id] = $(this.buildItem(data));
                        img = $('<img src="'+this.config.thumbUrl.replace("{Path}",encodeURIComponent(data.UploadPreview))+'" />');
                        util.imageError(img,this.config.type);
                        this.$files["item_"+data._id].find(".fileTypePic > div:first").append(img);
                        this.doms.list.append(this.$files["item_"+data._id]);
                    }
                }

                img = key = data = null;
                this.onSizeChange();
                // 修正滚动条
                this.$goodScroller.measure();
                this.$tmpData = null;
                return this;
            }
            /**
             * 重置
             * @return {Object} 模块实例
             */
            ,reset:function(){
                this.$len = 0;
                this.$data = {};
                this.$files = {};
                this.$selectedData = {};
                this.doms.list.empty();
                this.$goodScroller.measure();
                return this;
            }
            /**
             * 获取数据
             * @return {Object} 数据对象
             */
            ,getData:function(){
                var data = {
                        "selected":[]
                        ,"del":[]
                    }
                    ,selectedId = ",";

                // 已选的
                for(var n in this.$selectedData){
                    data.selected.push(this.$selectedData[n]);
                    selectedId += this.$selectedData[n]._id+",";
                }

                // 原删除的
                for(n in this.$data){
                    if(selectedId.indexOf(","+this.$data[n]._id+",") !== -1){
                        continue;
                    }
                    data.del.push(this.$data[n]);
                }
                return data;
            }
            /**
             * 生成预览项
             * @param  {Object} data 预览条目的数据
             * @return {String}      html字符串
             */
            ,buildItem:function(data){
                var htm = '<li>';
                htm += '<div class="fileTypePic"><div class="materialType_preview"></div></div><div class="fileInfo"><p>'+(data.Name+(data.isNew && '<b class="isNew">*</b>' || ''))+'</p>';
                htm += '<div class="theFileInfo">'+'<span>'+LANG("类型：")+'<em>'+data.FileType+'</em></span><span>'+LANG("大小：")+'<em>'+Math.ceil(data.FileSize/1024)+'KB</em></span>'+(data.Width && data.Height && ('<span class="block">'+LANG("尺寸：")+'<em>'+(data.Width || "N/A")+"*"+(data.Height || "N/A")+'</em></span>') || '')+'</div>';
                htm +='</div><div class="itemCtrl">'
                // if(data.isNew){
                htm += '<input class="linkBtn" type="button" value="选择" data-id="'+data._id+'" data-action="select" />';
                // }
                htm += '<input class="linkBtn" type="button" value="预览" data-id="'+data._id+'" data-action="preview" />';
                htm += '</div></li>';
                return htm;
            }
            /**
             * 完成按钮响应函数
             * @return {Bool} false
             */
            ,onOk:function(){
                var data = this.getData();
                // 判断已选的数量与必选数量
                if(data.selected.length !== this.$len){
                    this.create(
                        "confirm"
                        ,SysNotice
                        ,{
                            "data":{
                                "msg":LANG("还有未选择的尺寸")
                                ,"tip":[
                                    {"text":LANG("一共需要选"+this.$len+"个")}
                                    ,{"text":LANG("已选"+data.selected.length+"个")}
                                ]
                            }
                            ,"type":"error"
                            ,"width":400
                        }
                    );
                }else{
                    // 发消息
                    this.fire(
                        "selectSizeDone"
                        ,data
                    );
                    this.reset();
                    this.hide();
                }

                data = null;
                return false;
            }
            /**
             * 警告框确定事件
             * @return {Bool} false
             */
            ,onSysNoticeOk:function(ev){
                return false;
            }
            /**
             * 警告框取消事件
             * @return {Bool} false
             */
            ,onSysNoticeCancel:function(){
                return false;
            }
            /**
             * 预览
             * @param  {Strung}    id 行id。对应原始数据中的_id
             * @return {Undefined}    无返回值
             */
            ,preview:function(id){
                var item = this.$data[id];
                if (item && item.Path) {
                    var url = util.formatIndex(
                        app.config('preview_page'),
                        encodeURIComponent(app.config('front_base')+item.Path), item.Height, item.Width, item.FileType
                    );
                    window.open(url,"PreviewMaterialWindow");
                }
            }
        }
    );
    exports.selectOneCreative = SelectOneCreative;

    // 广告位导出导入弹出窗口
    var ExportDlg = app.extend(Popwin, {
        init: function(config, parent){
            config = $.extend({
                'title': LANG('广告位选择导出导入'),
                'width': 700,
                'textRow': 15,
                'noProcess': false
            }, config);
            ExportDlg.master(this, null, config);
            ExportDlg.master(this, 'init', arguments);

            this.$ready = false;
            this.$text  = null;
            this.build();
        },
        build: function(){
            if (this.$ready){ return; }
            this.$ready = true;

            var c = this.config;

            var copyBtn = $('<input type="button" class="btnBigGray fr copy"/>').val(LANG('复制')).appendTo(this.body);
            this.jq(copyBtn, 'mouseenter', 'eventCopy');

            this.$text = $('<textarea style="width:100%; height:auto; padding:0;"/>').appendTo(this.body);
            if (c.textRow){
                this.$text.attr('rows', c.textRow);
            }
            this.setWin();
        },
        setData: function(text){
            this.$text.val(text);
            return this;
        },
        setTitle: function(isImport){
            var title = this.title.el;
            if(isImport){
                title.text(LANG('广告位导入'));
            }else{
                title.text(LANG('广告位导出'));
            }
            return this;
        },
        getData: function(){
            return this.$text.val();
        },
        onOk: function(ev){
            this.hide();
            var data = this.getData();
            if (this.config.noProcess){
                this.fire('importList', data);
                return false;
            }
            var lines = data.split('\n');
            var list  = [];
            var datas = [];
            util.each(lines, function(line){
                var id = util.trim(line.split('\t').shift());
                if (id && !isNaN(+id)){
                    list.push(id);
                    datas.push(line);
                }
            });

            this.fire(
                "importList"
                ,{
                    "list":list
                    ,"lines":datas
                }
            );
            return false;
        },
        eventCopy: function(evt, elm){
            var a = $(elm);
            var text = this.$text.val();
            util.clip(text, a, this.copyComplete, this);
            return false;
        },
        copyComplete: function(){
            app.alert(LANG('复制成功'));
        }
    });
    exports.exportDlg = ExportDlg;


    var SpotGroupDlg = app.extend(Popwin, {
        init: function(config, parent){
            config = $.extend({
                'title': LANG('导入广告位分组'),
                'width': 850,
                'gridRow': 10,
                'url': '/rest/listpositioncategory',
                'param': {
                    'no_limit': 1,
                    'no_stastic_data': 1
                }
            }, config);
            SpotGroupDlg.master(this, null, config);
            SpotGroupDlg.master(this, 'init', arguments);

            this.$ready = false;
            this.$data  = {};
            this.build();
        },
        build: function(){
            if (this.$ready){ return; }
            this.$ready = true;

            var c = this.config;

            $('<p class="subTitle"/>').text(LANG('导入的广告位将加入已选的广告位')).appendTo(this.body);

            this.create('list', grid.spotGroup, {
                'target': this.body,
                'hasSelect': true,
                'auto_load': false,
                'param': c.param,
                'list':{
                    'rowSelect': true,
                    'scroll_type': 'row',
                    'scroll_size': 10
                }
            });

            // this.setWin();
        },
        setParam: function(param){
            this.$.list.setParam(param);
            return this;
        },
        load: function(){
            this.$.list.load();
            return this;
        },
        onGridDataLoad: function(ev){
            var data = this.$data;
            util.each(ev.param, function(item){
                data[item.Id] = item;
            });
            this.setWin();
            return false;
        },
        setData: function(data){
            this.$.list.setData(data);
            return this;
        },
        getData: function(){
            this.$.list.getData();
        },
        setValue: function(value){
            var ids = [];
            util.each(value, function(item){
                ids.push(item.Id);
            });
            this.$.list.setSelectRowIds(ids);
        },
        getValue: function(){
            var ids = this.$.list.getSelectRowId();
            var list = [];
            util.each(this.$data, function(item){
                if (util.index(ids, item.Id) !== null){
                    list.push(item);
                }
            });
            return list;
        },
        onOk: function(ev){
            this.hide();
            this.fire("importGroup", this.getValue());
            return false;
        },
        onChangeSelect: function(){
            return false;
        },
        show: function(){
            this.setValue();
            SpotGroupDlg.master(this, 'show', arguments);
        }
    });
    exports.spotGroupDlg = SpotGroupDlg;

    var AddToCampaign = app.extend(
        PopWinTable
        ,{
            init:function(config){
                config = $.extend(
                    {
                        "title":LANG("活动列表")
                        ,"type":"campaign"
                        ,"class":"M-popwin M-popwinSelectCampaign"
                        ,"width":800
                        ,"buttons":["ok","cancel"]
                        ,"url":"/rest/campaignadpositionadd"
                        ,"param":{}
                        ,"adsIds":[]
                        ,"grid":{
                        "hasTab":false
                        ,"subs":null
                        ,"url":"/rest/listcampaign"
                        ,"param":{
                            "no_stastic_data":1
                        }
                        ,"hasSelect":true
                        ,"cols":[
                            true,
                            {"name":"_id","type":'fixed',"sort":true,"align":'center',"width":70},
                            {"name":'Name', "type":'index'}
                        ]
                        ,"operation":null
                    }
                    }
                    ,config
                );
                AddToCampaign.master(this,null,config);
                AddToCampaign.master(this,"init",[config]);
            }
            /**
             * 获取数据
             * @return {Array} 已选的活动id数组
             */
            ,getData:function(){
                return this.popGrid.getSelectRowId();
            }
            /**
             * 确定响应事件
             * @param  {Object}    ev 事件消息对象
             * @return {Bool}         false
             */
            ,onOk:function(evt){
                if(this.addToCampaign()){
                    // 没有请求发送则直接隐藏
                    this.hide();
                }
                return false;
            }
            /**
             * 取消响应事件
             * @param  {Object}    ev 事件消息对象
             * @return {Bool}         false
             */
            ,onCancel:function(ev){
                this.fire(
                    "addToCampaignCancel"
                );
                this.hide();
                return false;
            }
            /**
             * 附加到活动
             * @return {Bool} 是否成功发出请求
             */
            ,addToCampaign:function(){
                var data = this.getData();
                if(data.length){
                    app.data.get(
                        this.config.url
                        ,{
                            "CampaignIds":this.getData().toString()
                            ,"AdPositionIds":this.config.adsIds.toString()
                            ,"Status":1
                        }
                        ,this
                        ,"onData"
                    );
                    return false;
                }else{
                    return true;
                }
            }
            /**
             * 提交附加请求回调函数
             * @param  {Object}    err  错误信息对象
             * @param  {Object}    data 数据对象
             * @return {Undefined}      无返回值
             */
            ,onData:function(err,data){
                if(err){
                    app.alert(err.message);
                    return false;
                }
                app.alert(LANG("附加到活动成功！"));
                this.fire(
                    "addToCampaignSuccess"
                );
                this.hide();
            }
            /**
             * 重置
             * @return {Undefiend} 无返回值
             */
            ,reset:function(){
                this.config.param = {};
                this.config.adsIds = [];
                this.popGrid.setSelectRowIds([]);
                this.popGrid.reset();
                return this;
            }
            /**
             * 设置已选的广告位id
             * @param {Array} ids 广告位id数组
             * @param {Object}    模块实例
             */
            ,setParam:function(ids,param){
                if(util.isArray(ids)){
                    this.config.adsIds = ids;
                }
                if(param){
                    AddToCampaign.master(this,"setParam",[param]);
                }
                return this;
            }
            ,onChangeDate:function(ev){
                return false;
            }
            // 重新load列表，设置日期默认今天，不随时间条改变
            ,load:function(){
                var tmp = new Date();
                tmp.setHours(0);
                tmp.setMinutes(0);
                tmp.setSeconds(0);
                var begindate = Math.floor(tmp.getTime() / 1000);
                var enddate = begindate+86399;
                this.popGrid.setParam({
                    "begindate":begindate
                    ,"enddate":enddate
                }).load();
            }
        }
    );
    exports.addToCampaign = AddToCampaign;

    var AddSpotGroupToCampaign = app.extend(AddToCampaign, {
        init: function(config){
            config = $.extend({
                'url': '/rest/attachSpotGroupToCampaign'
            }, config);
        },
        build: function(){
            // 先创建黑白名单选项
            this.create('type', form.radio, {
                'target': this.body,
                'option': [LANG('黑名单'), LANG('白名单')],
                'label': LANG('分组类型')
            });
            return AddSpotGroupToCampaign.master(this, 'build', arguments);
        },
        getData:function(){
            return {
                'type': this.$.type.getData(),
                'campaigns': this.popGrid.getSelectRowId()
            };
        },
        addToCampaign:function(){
            var data = this.getData();
            if(data.campaigns.length){
                // todo: 对接附加分组到活动接口

                app.data.get(
                    this.config.url
                    ,{
                        "CampaignIds":data.campaigns.toString(),
                        "spotGroupId":this.$spotGroup._id,
                        "spotGroupType":data.type,
                        "Status":1
                    }
                    ,this
                    ,"onData"
                );
                return false;
            }else{
                return true;
            }
        },
        setParam:function(spotGroup, param){
            this.$spotGroup = spotGroup;
            if(param){
                AddSpotGroupToCampaign.master(this,"setParam",[param]);
            }
            return this;
        }
    });
    exports.addSpotGroupToCampaign = AddSpotGroupToCampaign;

    var CampaignBudget = app.extend(
        Tip
        ,{
            init:function(config){
                config = $.extend(
                    {
                        "bodyClass":"M-tipBody P-campaignBudgetPopBody"
                        ,"footClass":"P-campaignBudgetPopFoot"
                        ,"width":200
                        ,"fxDelay":50
                        ,"buttons":["ok","cancel"]
                        ,"buttonConfig":{
                        // 确定按钮样式
                        "ok": {
                            "type":"button"
                            ,"value":LANG("确定")
                            ,"class":"btnGreen"
                            ,"data-action":"onOk"
                            ,"events":"click"
                        }
                        // 取消按钮的样式
                        ,"cancel": {
                            "type":"button"
                            ,"value":LANG("取消")
                            ,"class":"btnNormal"
                            ,"data-action":"onCancel"
                            ,"events":"click"
                        }
                    }
                        // ,"outerHide":true
                        ,"autoHide":true
                    }
                    ,config
                );
                this.$tpl = '<ul>'
                this.$tpl += '<li class="firstLi"><label>'+LANG("总预算：")+'</label><input type="text" data-type="TotalBudget" class="theTotalBudget" value="{TotalBudget}" />'+LANG("元")+'</li>';
                this.$tpl += '<li><label>'+LANG("每日预算：")+'</label><input type="text" data-type="Budget" class="theBudget" value="{Budget}" />'+LANG("元")+'</li>';
                this.$tpl += '</ul>';
                CampaignBudget.master(this,null,config);
                CampaignBudget.master(this,"init",[config])
            }
            ,formater:function(data){
                var htm = ""+this.$tpl,tmp;
                for(var n in data){
                    tmp = "{"+n+"}";
                    if(htm.indexOf(tmp)!== -1){
                        htm = htm.replace(tmp,data[n]);
                    }
                }
                tmp = null;
                return htm;
            }
            /**
             * 确定响应事件
             * @param  {Object}    ev 事件消息对象
             * @return {Undefined}    无返回值
             */
            ,onOk:function(evt){
                var ips = this.body.find("input");
                this.fire(
                    "campaignBudgetOk"
                    ,{
                        "TotalBudget":+ips.eq(0).val()
                        ,"Budget":+ips.eq(1).val()
                        ,"Id":this.config.data.Id
                        ,"oldBudget":this.config.data.Budget
                        ,"oldTotalBudget":this.config.data.TotalBudget
                    }
                );
                this.hide();
                return false;
            }
            /**
             * 取消响应事件
             * @param  {Object}    ev 事件消息对象
             * @return {Bool}         false
             */
            ,onCancel:function(){
                this.hide();
                return false;
            }
        }
    );
    exports.campaignBudget = CampaignBudget;

    // 选择收件人弹窗
    var SelectMessageReceiver = app.extend(
        PopWinTable,
        {
            init: function (config) {
                config = $.extend(
                    true,
                    {
                        "title": LANG("选择联系人"),
                        "width": 1000,
                        "buttons": ["ok", "cancel"],
                        "param": {}
                    }, config
                );

                this.$cache = {};
                this.$selected = [];
                this.$ids = [];
                this.$ready = false;
                SelectMessageReceiver.master(this, null, config);
                SelectMessageReceiver.master(this, "init", arguments);

                this.build();
            },
            build: function(){
                if (this.$ready){return}
                var body = this.body.height(580).addClass('P-adminCustomerSelectPopwin');
                var con = $('<div/>').appendTo(body);
                var tag_div = $('<div class="P-campaignListCon"/>').appendTo(con);

                // 创建筛选
                this.create("labels", taglabels.listType, {
                    "target":tag_div,
                    "data":[null, LANG("代理"), LANG("直客")]
                });

                this.create("labelsTrade", taglabels.listType, {
                    "target":tag_div,
                    'title': LANG('版本：'),
                    "data":[null, LANG("有产品版"), LANG("无产品版")]
                });

                // 创建列表
                this.create('grid', grid.customerSelectGrid, {
                    "target": con
                    ,'pager': {'size':10, 'showSizeTypes':1}
                    ,'list':{
                        'rowSelect': true,
                        'scroll_type': 'row',
                        'scroll_size': 5
                    }
                });

                // 创建滚动条
                this.$scroll = this.create(
                    'scroll', comm.scroller,
                    {
                        'target': body,
                        'content': con,
                        'watch': 400,
                        'dir': 'V'
                    }
                );
                this.$ready = true;
            },
            onListTypeChange:function(ev){
                var grid = this.$.grid;
                switch(ev.name){
                    case 'labels':// 类型：1代理 2直客
                        this.$Type = ev.param.type;
                        break;
                    case 'labelsTrade':// 版本：1有产品版，2无产品版
                        this.$CategoryId = ev.param.type;
                        break;
                }
                grid.setParam({
                    'Type':this.$Type,
                    'CategoryId':this.$CategoryId
                });
                grid.load();
                return false;
            },
            onGridDataLoad: function(ev){
                this.$.scroll.measure();
            },
            onOk: function (evt) {
                this.hide();
                this.fire('changeSelectedTo', this.getData());
                return false;
            },
            onCancel: function (ev) {
                this.hide();
                return false;
            },
            onChangeSelect: function(ev) {
                var cache = this.$cache;
                util.each(ev.param.data, function(row){
                    cache[row._id] = {
                        '_id': row._id,
                        'CampanyId': row.CampanyId,
                        'UserName': row.UserName,
                        'Name': row.Name,
                        'UserId': row.UserId
                    };
                });
                return false;
            },
            show: function() {
                SelectMessageReceiver.master(this, 'show');
                // 重新加载数据
                this.$.grid.load();
                return this;
            },
            reset: function () {
                // 设置好grid
                var grid = this.$.grid;
                grid.setSelectRowIds([]);
                // 重新加载数据
                grid.reload();
                return this;
            },
            setData: function(list) {
                this.$selected = list;
                var ids = this.$ids = [];
                var cache = this.$cache;
                util.each(list, function(to){
                    cache[to._id] = to;
                    ids.push(to._id);
                });
                this.$.grid.setSelectRowIds(ids);
                return this;
            },
            getData: function(){
                var ids = this.$.grid.getSelectRowId();
                var list = this.$selected = [];
                var cache = this.$cache;
                util.each(ids, function(id){
                    if (cache[id]){
                        list.push(cache[id]);
                    }
                });
                return list;
            }
        }
    );
    exports.selectMessageReceiver = SelectMessageReceiver;

    // 选择收件人弹窗
    var SelectSpotPosition = app.extend(
        PopWinTable,
        {
            init: function (config) {
                config = $.extend(
                    true,
                    {
                        "title": LANG("选择联系人"),
                        "width": 1000,
                        "buttons": ["ok", "cancel"],
                        "param": {}
                    }, config
                );

                this.$cache = {};
                this.$selected = [];
                this.$ids = [];
                this.$channel = 10001;
                this.$ready = false;
                SelectSpotPosition.master(this, null, config);
                SelectSpotPosition.master(this, "init", arguments);

                this.build();
            },
            build: function(){
                if (this.$ready){return}
                var body = this.body.height(550);
                var con = $('<div/>').appendTo(body);
                var tag_div = $('<div class="P-campaignListCon"/>').appendTo(con).hide();

                // 创建筛选
                this.create("labels", taglabels.listType, {
                    "target":tag_div,
                    "data":[null, LANG("代理"), LANG("直客")]
                });

                this.create("labelsTrade", taglabels.listType, {
                    "target":tag_div,
                    'title': LANG('版本：'),
                    "data":[null, LANG("有产品版"), LANG("无产品版")]
                });

                // 创建列表
                this.popGrid = this.create("grid", grid.base, {
                    'hasTab': false,
                    'hasAmount': false,
                    'hasExport': false,
                    'hasSelect': true,
                    'url': '/nextgen/listadposition',
                    'sort': '_id',
                    'param': {
                        'no_stastic_data': 1
                        //,'AdxId':10008
                    },
                    "cols": [
                        {type:'id'}
                        ,{name:"Name",text:LANG('广告位'),type:"index",render:this.renderName,width:400}
                        ,{name:"Width",text:LANG("尺寸"),render:this.renderSize, align: 'center'}
                    ],
                    'target': con,
                    'pager':{
                        "size":10,
                        "bounds":5,
                        "firstLast":false,
                        "showJumper":0,
                        "showSizeTypes":0
                    },
                    'list':{
                        'rowSelect': true,
                        'scroll_type': 'row',
                        'scroll_size': 10
                    }
                });

                // 创建滚动条
                this.$scroll = this.create(
                    'scroll', comm.scroller,
                    {
                        'target': body,
                        'content': con,
                        'watch': 400,
                        'dir': 'V'
                    }
                );
                this.$ready = true;
            },
            renderSize: function(i,val,row,con){
                return row.Width+" x "+row.Height;
            },
            renderName: function(i,val,row,con){
                return $('<p class="M-tableListWidthLimit" />').width(380).text(val);
            },
            onListTypeChange:function(ev){
                var grid = this.$.grid;
                switch(ev.name){
                    case 'labels':// 类型：1代理 2直客
                        this.$Type = ev.param.type;
                        break;
                    case 'labelsTrade':// 版本：1有产品版，2无产品版
                        this.$CategoryId = ev.param.type;
                        break;
                }
                grid.setParam({
                    'Type':this.$Type,
                    'CategoryId':this.$CategoryId
                });
                grid.load();
                return false;
            },
            onGridDataLoad: function(ev){
                this.$.scroll.measure();
            },
            onOk: function (evt) {
                this.hide();
                this.fire('changeSelectedSpot', this.getData());
                return false;
            },
            onCancel: function (ev) {
                this.hide();
                return false;
            },
            onChangeSelect: function(ev) {
                var cache = this.$cache;
                util.each(ev.param.data, function(row){
                    cache[row._id] = row;
                });
                return false;
            },
            setChannel: function(channel){
                if(channel){
                    this.$channel = channel;
                }
                return this;
            },
            show: function() {
                SelectMessageReceiver.master(this, 'show');
                // 重新加载数据
                this.$.grid.setParam({AdxId: this.$channel}).load();
                return this;
            },
            reset: function () {
                // 设置好grid
                var grid = this.$.grid;
                grid.setSelectRowIds([]);
                // 重新加载数据
                grid.reload();
                return this;
            },
            setData: function(list) {
                this.$selected = list;
                var ids = this.$ids = [];
                var cache = this.$cache;
                util.each(list, function(to){
                    cache[to._id] = to;
                    ids.push(to._id);
                });
                this.$.grid.setSelectRowIds(ids);
                return this;
            },
            getData: function(){
                var ids = this.$.grid.getSelectRowId();
                var list = this.$selected = [];
                var cache = this.$cache;
                util.each(ids, function(id){
                    if (cache[id]){
                        list.push(cache[id]);
                    }
                });
                return list;
            }
        }
    );
    exports.selectSpotPosition = SelectSpotPosition;


    // 溢价策略弹出框
    var PremiumPopwin = app.extend(Popwin, {
        init: function(config, parent){
            config = $.extend({
                modParam: null
            }, config);
            PremiumPopwin.master(this, null, config);
            PremiumPopwin.master(this, 'init', arguments);
            this.$ready = false;
            this.build();
        },
        build: function(){
            if (this.$ready){ return; }
            var c = this.config;

            var param = {
                'target': this.body,
                'hasExcludeBtn': false
            }

            this.createAsync('mod', c.mod, $.extend({}, param, c.modParam), 'afterCreate');

            this.$ready = true;
        },
        afterCreate: function(mod){
            this.show();
        },
        onOk:function(evt){
            var data = this.$.mod.getData();
            this.fire('popwinSave', data);
            this.reset();
            return false;
        },
        onCancel: function(evt){
            this.reset();
            return false;
        },
        reset: function(){
            this.$.mod.reset();
            this.hide();
        }
    });
    // 溢价 -重定向
    var CampaignPdmp = app.extend(PremiumPopwin, {
        init: function(config, parent){
            config = $.extend({
                'title': LANG('重定向'),
                'width': 835,
                'mod': 'pages/campaign.pdmp',
                'class': 'M-popwin P-campaignNiceItems',
                'modParam': {
                    'hasRadio': false,
                    'moduleTips': LANG('根据Cookies')
                }
            }, config);
            CampaignPdmp.master(this, null, config);
            CampaignPdmp.master(this, 'init', arguments);
        },
        setData: function(data){
            this.$.mod.setData({
                result:data.Character,
                filterType:data.CharacterValue
            });
            return this;
        }
    });
    exports.campaignPdmp = CampaignPdmp;
    // 溢价 -日程
    var CampaignSchedule = app.extend(PremiumPopwin, {
        init: function(config, parent){
            config = $.extend({
                'title': LANG('日程'),
                'width': 710
            }, config);
            CampaignSchedule.master(this, null, config);
            CampaignSchedule.master(this, 'init', arguments);

            this.$ready = false;
            this.build();
        },
        build: function(){
            if (this.$ready){ return; }

            this.create('mod',form.scheduleTable,{
                target:this.body
            })
            this.show();
            this.$ready = true;
        },
        setData: function(data){
            this.$.mod.setData(data.Schedule);
            return this;
        }
    });
    exports.campaignSchedule = CampaignSchedule;
    // 溢价 -人群属性 Odmp
    var CampaignOdmp = app.extend(PremiumPopwin, {
        init: function(config, parent){
            config = $.extend({
                'title': LANG('人群属性'),
                'width': 870,
                'mod': 'tree_select.main'
            }, config);
            CampaignOdmp.master(this, null, config);
            CampaignOdmp.master(this, 'init', arguments);
        },
        setData: function(data){
            this.$.mod.setData(data.NPeople,data.PeopleValue);
            return this;
        },
        onOk:function(evt){
            var data = this.$.mod.getData();
            if(!data.data.length){
                app.alert(LANG('请选择至少一个人群属性。'));
                return false;
            }
            this.fire('popwinSave', data);
            this.reset();
            return false;
        }
    });
    exports.campaignOdmp = CampaignOdmp;

    // 发票编辑
    var InvoiceInfo = app.extend(Popwin, {
        init: function(config, parent){
            config = $.extend({
                'title': LANG('发票信息'),
                'width': 650,
                'admin': false,
                'picName':['license', 'tax', 'prove', 'openAccount'],
                'class':'M-popwin P-InvoiceInfo',
                'url': 'invoice/updateinvoice'
            }, config);
            InvoiceInfo.master(this, null, config);
            InvoiceInfo.master(this, 'init', arguments);
            this.$ready = false;
            this.$uploadData = {};
            this.build();
        },
        build: function(){
            if (this.$ready){ return; }
            var c = this.config;
            var body = this.body;


            var con = $('<div/>').addClass('invoiceInfoWrap').appendTo(body);
            var conWrap = con.wrap('<div/>').parent().height(400);

            //发票类型
            this.create("invoiceType", form.radio,{
                'label': LANG('发票类型：'),
                'option':[
                    {'text':'普通','value':1},
                    {'text':'专用','value':2}
                ],
                'target': con,
                'changeEvent': true,
                'value':1
            });

            //内容
            this.create("invoiceContent", form.input,{
                "label":LANG('内容：')
                ,"width":400
                ,"target":con
            });
            //抬头
            this.create("invoiceTitle", form.input,{
                "label":LANG('抬头：')
                ,"width":400
                ,"target":con
            });
            //税号
            this.create("invoiceTariffNumber", form.input,{
                "label":LANG('税号：')
                ,"width":400
                ,"target":con
            });
            //开户银行
            this.create("invoiceBank", form.input,{
                "label":LANG('开户银行：')
                ,"width":400
                ,"target":con
            });
            //银行账号
            this.create("invoiceBankAccount", form.input,{
                "label":LANG('银行账号：')
                ,"width":400
                ,"target":con
            });
            //公司地址
            this.create("invoiceCompanyAddress", form.input,{
                "label":LANG('公司地址：')
                ,"width":400
                ,"target":con
            });
            //公司电话
            this.create("invoiceCompanyPhoneNumber", form.input,{
                "label":LANG('公司电话：')
                ,"width":400
                ,"target":con
            });
            //邮寄地址
            this.create("invoiceMailingAddress", form.input,{
                "label":LANG('邮寄地址：')
                ,"width":400
                ,"target":con
            });
            //收件人
            this.create("invoiceAddressee", form.input,{
                "label":LANG('收件人：')
                ,"width":400
                ,"target":con
            });
            //收件人电话
            this.create("invoiceAddresseePhoneNumber", form.input,{
                "label":LANG('收件人电话：')
                ,"width":400
                ,"target":con
            });

            //营业执照
            var thumbCon1 = this.create('thumbLayout1', view.itemLayout, {
                "label":LANG('营业执照：')
                ,"target":con
            });

            this.create("license", upload.porter, {
                "mode":"thumb",
                "title":null,
                "preview": 1,
                "target":thumbCon1.getContainer()
            });

            //税务登记证
            var thumbCon2 = this.create('thumbLayout2', view.itemLayout, {
                "label":LANG('税务登记证：')
                ,"target":con
            });
            this.create("tax", upload.porter, {
                "mode":"thumb",
                "title":null,
                "target":thumbCon2.getContainer()
            });

            //一般纳税人证明
            var thumbCon3 = this.create('thumbLayout3', view.itemLayout, {
                "label":LANG('一般纳税人证明：')
                ,"target":con
            }).hide();
            this.create("prove", upload.porter, {
                "mode":"thumb",
                "title":null,
                "target":thumbCon3.getContainer()
            });

            //开户许可证
            var thumbCon4 = this.create('thumbLayout4', view.itemLayout, {
                "label":LANG('开户许可证：')
                ,"target":con
            });
            this.create("openAccount", upload.porter, {
                "mode":"thumb",
                "title":null,
                "target":thumbCon4.getContainer()
            });


            if(c.admin){
                //审核
                this.$reason = $('<input/>').attr('placeholder',LANG('原因')).css('vertical-align', 'top').hide();
                this.create("invoiceVerify", form.radio,{
                    'label': LANG('审核：'),
                    'option':[
                        {'text':'通过','value':3},
                        {'text':'拒绝','value':4}
                    ],
                    'target': con,
                    'changeEvent': true,
                    'afterHtml':this.$reason
                });
            }

            //创建滚动条
            this.create('scroll', comm.scroller, {
                target: conWrap,
                content: con,
                dir: 'V'
            });

            this.setPicName(this.config.picName);
            this.dg(this.el, '.uploadPreview', 'click', 'eventPreview');
            this.dg(this.el, '.unloadOpBtn', 'click', 'eventDeletePic');

            this.$ready = true;
        },
        setPicName: function(picName){
            var self = this;
            util.each(picName, function(item, idx){
                self.$[item].el.find('.uploadPreview').attr('data-name',item).after(
                    $([
                        '<div class="unloadOpBtn" data-name="'+item+'">',
                        '<a>'+LANG('删除')+'</a>',
                        '</div>'
                    ].join(''))
                );
            });
        },
        //如果带参数isRecord，获取的发票信息来源于发票记录
        load: function(id, isRecord){
            this.showLoading();
            this.$Id = id;
            this.reset();

            var data = {};
            if(isRecord){
                data.Id = id;
                this.$recordTrue = isRecord;
                app.data.get("/invoice/getinvoicerecord", data, this);

            }else{
                this.$recordTrue = false;
                data.CampanyId = id;
                app.data.get("/invoice/getinvoice", data, this);
            }

            return this;
        },
        onData: function(err, data){
            this.hideLoading();
            if (err){
                //app.error(err);
                if (err.message){
                    app.alert(err.message);
                }
                return false;
            }

            if(data){
                if(this.$recordTrue){
                    data = data.Info;
                }
                this.setData(data);
            }
        },
        onOk: function(){
            var self = this;
            var cs = self.$;
            var type = cs.invoiceType.getData();
            var content = cs.invoiceContent.getData();
            var title = cs.invoiceTitle.getData();
            var tariffNumbe = cs.invoiceTariffNumber.getData();
            var bank = cs.invoiceBank.getData();
            var bankAccount = cs.invoiceBankAccount.getData();
            var companyAddress = cs.invoiceCompanyAddress.getData();
            var companyPhoneNumber = cs.invoiceCompanyPhoneNumber.getData();
            var mailingAddress = cs.invoiceMailingAddress.getData();
            var addressee = cs.invoiceAddressee.getData();
            var addresseePhoneNumber = cs.invoiceAddresseePhoneNumber.getData();
            var license = cs.license && cs.license.data.Path || '';
            var tax = cs.tax && cs.tax.data.Path || '';
            var prove = cs.prove && cs.prove.data.Path || '';
            var openAccount = cs.openAccount && cs.openAccount.data.Path || '';

            var data = {
                'Type': type,
                'Content': content,
                'InvoiceTitle': title,
                'TariffNumber': tariffNumbe,
                'Bank': bank,
                'BankAccount': bankAccount,
                'CompanyAddress': companyAddress,
                'CompanyPhoneNumber': companyPhoneNumber,
                'MailingAddress': mailingAddress,
                'Addressee': addressee,
                'AddresseePhoneNumber': addresseePhoneNumber,
                'BusinessLicenseUrl': license,
                'TaxRegistrationCertificateUrl': tax,
                'GeneralTaxpayerUrl': prove,
                'AccountPermitsUrl': openAccount
            };

            //如果是管理员，有审核选项
            if(self.config.admin){
                //管理员也分两种情况
                //1修改客户的发票信息
                data.AuditStatus = cs.invoiceVerify.getData();
                data.AuditRemark = self.$reason.val();
                data.CampanyId =this.$Id;
                if(data.AuditStatus === ''){
                    app.alert(LANG('请选择审核类型！'));
                    return false;
                }

                app.confirm(
                    LANG('你确认要修改和审核发票信息状态吗?'),
                    function(ret){
                        if (ret){
                            self.hide();
                            app.data.put('/invoice/auditinvoice', data, self, 'onSave');
                        }
                    }
                );

            }else{
                if(this.$recordTrue){ //2修改发票记录的发票信息
                    data.Id = this.$Id;
                    app.confirm(
                        LANG('你确认要修改发票信息吗?'),
                        function(ret){
                            if (ret){
                                self.hide();
                                app.data.put('/invoice/updateinvoicerecord', data, self, 'onSave');
                            }
                        }
                    );
                }else{ //用户增加
                    app.confirm(
                        LANG('你确认要修改发票信息吗?'),
                        function(ret){
                            if (ret){
                                self.hide();
                                app.data.put('/invoice/addinvoice', data, self, 'onSave');
                            }
                        }
                    );
                }

            }

            return false;
        },
        onSave: function(err, data){
            if (err){
                app.error(err);
                if (err.message){
                    app.alert(err.message);
                }
                return false;
            }
            app.alert(LANG('发票信息修改成功'));

            this.fire('processSuccess');
            // 广播chargeSuccess消息
            this.reset();
            this.hide();
        },
        setData: function(data){
            var self = this;
            var cs = self.$;
            cs.invoiceType.setData(data.Type);
            this.$.thumbLayout3[data.Type==2 ? 'show' : 'hide'](); // 一般纳税人证明
            cs.invoiceContent.setData(data.Content);
            cs.invoiceTitle.setData(data.InvoiceTitle);
            cs.invoiceTariffNumber.setData(data.TariffNumber);
            cs.invoiceBank.setData(data.Bank);
            cs.invoiceBankAccount.setData(data.BankAccount);
            cs.invoiceCompanyAddress.setData(data.CompanyAddress);
            cs.invoiceCompanyPhoneNumber.setData(data.CompanyPhoneNumber);
            cs.invoiceMailingAddress.setData(data.MailingAddress);
            cs.invoiceAddressee.setData(data.Addressee);
            cs.invoiceAddresseePhoneNumber.setData(data.AddresseePhoneNumber);
            cs.license.setData({"Path":data.BusinessLicenseUrl});
            cs.tax.setData({"Path":data.TaxRegistrationCertificateUrl});
            cs.prove.setData({"Path":data.Type==2 ? data.GeneralTaxpayerUrl : ''});
            cs.openAccount.setData({"Path":data.AccountPermitsUrl});

            this.$uploadData['license'] = {'Path': data.BusinessLicenseUrl};
            this.$uploadData['tax'] = {'Path': data.TaxRegistrationCertificateUrl};
            this.$uploadData['prove'] = {'Path': data.Type==2 ? data.GeneralTaxpayerUrl : ''};
            this.$uploadData['openAccount'] = {'Path': data.AccountPermitsUrl};

            // 设置删除按钮的显隐
            var opBtn_arr = this.el.find('.unloadOpBtn');
            $.each(opBtn_arr, function(idx,item){
                $(item)[$(item).prev('div').css('display')=='none'?'hide':'show']();
            });
            if(self.config.admin){
                cs.invoiceVerify.setData(data.AuditStatus);
                if(data.AuditStatus == 3){
                    self.$reason.val('');
                }else{
                    self.$reason.val(data.AuditRemark);
                }

            }
            this.$.scroll.measure();
        },
        //显示和隐藏原因输入框
        onRadioChange: function(evt){
            switch (evt.name){
                case "invoiceType":
                    this.eventToggleProve(+evt.param.value);
                    break;
                case "invoiceVerify":
                    this.eventToggleReason(+evt.param.value);
                    break;
            }
            return false;
        },
        //一般纳税人证明显隐
        eventToggleProve: function(btn){
            var thumb = this.get('thumbLayout3');
            var scroll = this.$.scroll;
            if(thumb){
                this.$.thumbLayout3[btn==2 ? 'show' : 'hide']();
            }
            if(scroll){
                this.$.scroll.measure();
            }
        },
        //原因input显隐
        eventToggleReason: function(btn){
            this.$reason[btn==4 ? 'show' : 'hide']();
        },
        show: function(){
            var ret = InvoiceInfo.master(this, 'show', arguments);
            this.$.scroll.measure();
            return ret;
        },
        reset: function(){
            var self = this;
            var cs = self.$;
            cs.invoiceType.setData(1);
            cs.invoiceContent.setData('');
            cs.invoiceTitle.setData('');
            cs.invoiceTariffNumber.setData('');
            cs.invoiceBank.setData('');
            cs.invoiceBankAccount.setData('');
            cs.invoiceCompanyAddress.setData('');
            cs.invoiceCompanyPhoneNumber.setData('');
            cs.invoiceMailingAddress.setData('');
            cs.invoiceAddressee.setData('');
            cs.invoiceAddresseePhoneNumber.setData('');
            this.$.thumbLayout3.hide();
            cs.license.reset();
            cs.tax.reset();
            cs.prove.reset();
            cs.openAccount.reset();
            if(self.config.admin){
                //cs.invoiceVerify.setData();
                // 这里不能用setData()，只能用这种方法去还原不选
                cs.invoiceVerify.el.find('input').attr('checked',false);
                self.$reason.val('');
            }
            this.el.find('.unloadOpBtn').hide();
            this.$uploadData = {};
            return self;
        },
        onHeightChange: function(ev){
            // 重新计算滚动条高度
            this.$.scroll.measure();
        },
        onUploadSuccess: function(ev){
            this.$uploadData[ev.name] = ev.param.data;
            // 显示删除按钮
            this.el.find('.unloadOpBtn').filter('div[data-name="'+ev.name+'"]').show();
            this.$.scroll.measure();
        },
        // 图片删除
        eventDeletePic: function(ev, elm){
            this.$[$(elm).attr('data-name')].reset();
            $(elm).hide();
            this.$.scroll.measure();
        },
        // 图片预览
        eventPreview: function(ev,elm){
            var url = '';
            var name = $(elm).attr('data-name');
            if(this.$uploadData[name]){
                url = encodeURIComponent(this.$uploadData[name].Path);
            }
            window.open(url,"PreviewMaterialWindow");
        },
        showLoading: function() {
            var con = $(this.el).parent();
            if (!this.loadingRow){
                this.loadingRow = $('<div class="M-tableListLoading"/>');
                this.loadingRow.appendTo(con).text(LANG("数据加载中"));
            }
            this.loadingRow.width(con.outerWidth()).height(con.outerHeight()).css(con.position());
            this.loadingRow.show();
        },
        hideLoading: function() {
            if (this.loadingRow) {
                this.loadingRow.hide();
            }
        }
    });
    exports.invoiceInfo = InvoiceInfo;

    // 发票申请
    var InvoiceApply = app.extend(Popwin, {
        init: function(config, parent){
            config = $.extend({
                'title': LANG('发票金额'),
                'width': 350
            }, config);
            InvoiceApply.master(this, null, config);
            InvoiceApply.master(this, 'init', arguments);
            this.$ready = false;
            this.build();
        },
        build: function(){
            if (this.$ready){ return; }
            var body = this.body;
            var doms = this.doms = {};

            var con = $('<div/>').addClass('invoiceApplyWrap').appendTo(body);

            //内容
            doms.input = this.create("invoiceMoney", form.input,{
                "label":LANG('')
                ,"width":220
                ,"target":con
                ,"hasStandar": true
                ,"afterText":LANG('元')

            });
            // 修改一下样式
            doms.input.el.find('.standar').css('text-indent',0);
            doms.canApplyMoney = $('<div class="invoiceMoney"><label>'+LANG("可申请发票金额：")+'</label><strong>0</strong><b>'+LANG("元")+'</b></div>').appendTo(con).find('strong');
            this.$ready = true;
        },
        onOk: function(){
            var self = this;
            //var id = this.$CampanyId;
            var amount = self.$.invoiceMoney.getData();

            if (!amount || amount <= 0 || !util.isNumber(amount)){
                app.alert(LANG('请填写正确的金额!'),function(){
                    self.$.invoiceMoney.el.find('input').select();
                });
                return false;
            }
            else if(+amount > +self.$canApplyMoney){  //todo 应该是一个实时获取的值比较
                app.alert(LANG('发票金额大于可开发票金额，请重新填写!'),function (){
                    self.$.invoiceMoney.el.find('input').select();
                });
                return false;
            }

            app.confirm(
                LANG('你确认要申请金额为 %1 元的发票吗?',amount),
                function(ret){
                    if (ret){
                        app.data.put('invoice/addinvoicerecord', {
                            'Amount':amount
                        }, self);
                    }
                }
            );
            return false;
        },
        onData: function(err, data){
            if (err){
                app.error(err);
                if (err.message){
                    app.alert(err.message);
                }
                return false;
            }

            app.alert(LANG('申请成功'));

            this.fire('processSuccess');
            // 广播chargeSuccess消息
            this.hide();
        },
        setData: function(data){
            this.reset();
            this.$CampanyId = data.CampanyId;
            var amount = util.numberFormat(
                util.round0(data.Amount,2)
            );
            this.doms.canApplyMoney.text(amount);
            this.$canApplyMoney = amount;
            return this;

        },
        //重置
        reset: function(){
            this.$.invoiceMoney.setData('');
            return this;
        },
        show: function(){
            InvoiceApply.master(this, 'show', arguments);
            this.$.invoiceMoney.el.find('input').select();
        }
    });
    exports.invoiceApply = InvoiceApply;

    // 自定义维度-过滤
    var MixedDimension = app.extend(PopWinTable, {
        init: function(config, parent){
            config = $.extend({
                'width': 750,
                'type':'mixedDimensionFilter',
                'grid':{
                    'param': {
                        'no_stastic_data': 1
                    },
                    operation:null
                }
            }, config);
            MixedDimension.master(this, null, config);
            MixedDimension.master(this, 'init', arguments);
            // 弹出框类型
            this.$type = '';
            // 保存已经选中的id
            this.$selected = {
                "campaign" : null,
                "sweety" : null
            }
            this.build();
        },
        reload: function(param){
            var url = param[0];
            this.$type = param[1];
            this.popGrid.reload(url);
            return this;
        },
        show: function(type,popConfig){
            // 先清空列表数据, 防止显示之前的其他维度的数据
            this.popGrid.setData([]);
            this.popGrid.setPage(1,0,0);
            this.popGrid.setSelectRowIds(this.$selected[type]);
            MixedDimension.master(this,"show",[popConfig]);
        },
        onOk:function(evt){
            var ids = this.popGrid.getSelectRowId();
            this.$selected[this.$type] = ids;
            this.fire('popwinSave', this.$selected);
            this.reset();
            this.hide();
            return false;
        }
    });
    exports.mixedDimension = MixedDimension;

    // 批量保存
    var BatchSave = app.extend(Popwin, {
        init: function(config, parent){
            config = $.extend({
                'title': LANG('活动组合'),
                'width': 1200
            }, config);

            this.$cacheData = {};

            BatchSave.master(this, null, config);
            BatchSave.master(this, 'init', arguments);

            this.$ready = false;


            this.build();
        },
        build: function(){
            if (this.$ready){ return; }
            this.el.addClass('P-campaignBatchSavePop')
            var body = this.body.height(500);
            var doms = this.doms = {
                con: $('<div class="P-campaignBatchSavePopCon">').appendTo(body)
            };

            $('<p class="desc">').text(LANG('请勾选要创建的活动：')).appendTo(doms.con);

            this.create('grid', grid.baseNoDate, {
                'target': doms.con,
                'is_sub_grid': false,
                'sort': '',
                'sub_field': 'BatchId',
                'hasTab': false,
                'hasAmount': false,
                'hasExport': false,
                'hasSelect': true,
                'hasSearch': false,
                'pager': {'size':10, 'showSizeTypes':1},
                'list':{
                    //'rowSelect': true,
                    'scroll_type': 'row',
                    'scroll_size': 8
                },
                'cols': [
                    {type: 'id'},
                    {name: 'Name', text: LANG('活动名称'), align: 'left', render: 'renderName',sort: false},
                    {name: 'SubChannel', text: LANG('广告位'), align: 'center', render: 'renderSubChannel', sort: false, width:100},
                    {name: 'BatchTab', text: LANG('创意策略'), align: 'center', render: 'renderGame', sort: false, width:100},
                    // {name: 'Creative', text: LANG('创意包'), align: 'center', render: 'renderCreative', sort: false, width:100},
                    // {name: 'Whisky', text: LANG('落地页'), align: 'center', render: 'renderWhisky', sort: false, width:100},
                    {name: 'AMonitorUrl', text: LANG('三方监测'), align: 'left', render: 'renderMonitor', sort: false, width:320}
                ]
                //,'operation':{render: 'renderOperation', cls:'M-gridOPCursor', width:155}
                //,'url': 'campany/listcustomer'
            })

            this.$ready = true;
        },
        renderName: function(i, val, row, con){
            var html = $('<input/>').val(val)
                .attr('data-name','name'+i)
                .width(340);
            return html;
        },
        renderSubChannel: function(i, val, row, con){
            var exchanges = app.config('exchanges');
            var result = util.find(exchanges, val, 'id');
            return result.name;

        },
        renderGame: function(i, val, row, con){
            var num = val.slice(-1);
            return LANG('创意策略') + num;
        },
        renderCreative: function(i, val, row, con){

        },
        renderWhisky: function(i, val, row, con){

        },
        renderMonitor: function(i, val, row, con){
            var html = $('<input/>').val(val)
                .attr('data-name','monitor'+i)
                .width(300);
            return html;
        },
        renderOperation: function(index, val, row){
            var html = [];
            html.push('<a data-op="AMonitorUrl">三方监测</a>');
            return html.join(' | ');
        },
        onListOpClick: function(ev){
            return false;
        },
        onOk: function(){
            var self = this;
            var data = self.getData();
            this.fire('batchSavePop', data);
            this.hide();
            return false;
        },
        onCancel: function(){
            this.getData();
            this.hide();
            return false;
        },
        setData: function(data){
            var self = this;
            if(data){
                var ids = [];
                var cache = self.$cacheData;
                util.each(data, function(item){
                    if(item){
                        util.each(cache, function(ca, idx){
                            if(ca && idx == (item.SubChannel + item.BatchTab)){
                                item.Name = ca.Name;
                                item.AMonitorUrl = ca.AMonitorUrl;
                            }
                        });
                        ids.push(item.BatchId);
                    }
                });
                self.$.grid.setData(data);
                self.$.grid.setSelectRowIds(ids);
            }
            return self;

        },
        getData: function(){
            if(this.$.grid){
                var self = this;
                var grid = self.$.grid;
                var select = grid.getSelectRowId();
                var data = grid.getData();
                var result = [];

                util.each(data, function(item){
                    if(item){
                        // 写入名称和三方监测
                        item.Name = grid.el.find('input[data-name="name'+item.BatchId+'"]').val();
                        item.AMonitorUrl = [grid.el.find('input[data-name="monitor'+item.BatchId+'"]').val()];

                        self.$cacheData[item.SubChannel+item.BatchTab] = {
                            Name: item.Name,
                            AMonitorUrl: item.AMonitorUrl
                        }
                    }
                });

                util.each(select, function(sel){
                    util.each(data, function(item){
                        if(item && item.BatchId == sel){
                            result.push(item);
                        }
                    });
                });
                return result;
            }else{
                return [];
            }
        },
        //重置
        reset: function(){

            return this;
        },
        show: function(){
            InvoiceApply.master(this, 'show', arguments);
        }
    });
    exports.batchSave = BatchSave;
});