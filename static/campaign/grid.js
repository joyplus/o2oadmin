define(function(require, exports){
    var app = require('app');
    var table = require('grid/table');
    var common = require('common');
    var view = require('view');
    var $ = require('jquery');
    var datebar = require('views/datebar');
    var util = require('util');
    var popwin = require("popwin");
    var labels = require('grid/labels');
    var geo = require('geo')
        ,form = require("form");
    var priceModity = require('price_modity');

    function Base(config, parent){
        config = $.extend(true, {
            'class': 'M-gridBase',
            'target': parent,
            'readonly': false,
            'gridType':null,	//gridType
            'cols': [],			// 列定义
            'exclude_cols':null,// 要排除的列
            'subs': null,		// 二级表格定义
            // 'sort': null,		// 当前激活的排序列 (TODO: 需要完成List模块处理)
            'sort': {'impressions':'desc', 'clicks':'desc'},
            'order': 'desc',
            'rowClick': null,	// 表格行点击事件
            'rowSelect':null,	// 表格行选择事件
            'opClick': null,	// 行操作点击事件 不同的方法绑定data-op属性
            'operation': null,	// 自定义行操作, 可以为col配置对象或者数组
            // 操作功能按钮
            "functional":null,

            'amount': null,		// 静态总计数据
            'data': null,		// 静态数据
            'url': null,		// 远程数据地址
            'param': null,		// 远程数据请求参数
            'is_sub_grid': false, // 判断是否二级菜单
            'sub_static': null, // 固定传递二级菜单数据
            'sub_param': null,	// 二级表格当前过滤参数
            'sub_param_ex': null, // 附加的自表格参数, 会递归传递
            'sub_key': null,	// 参数名称
            'sub_field': '_id',	// 索引字段名称
            'sub_exname': null,	// 子表格导出文件名前续
            'sub_filter': null, // 子表格图标过滤函数
            'sub_gen_url': true,// 自定拼接子表格请求地址
            'auto_load': true,	// 自动加载数据
            "acted_subs":null,	// 已经激活的子表格列表
            "sub_lv":3,			// 允许展开的子表格层数,3层以后的没有子表

            'hasRefresh': false,// 刷新控件
            'refresh_time': 10,	// 刷新间隔
            'refresh_auto': 0,	// 自动刷新中

            'hasFrozen': false,	// 是否冻结列
            'frozenSite': 3, // 冻结列位置列
            'autoFocus': true, // 搜索模块自动聚焦
            'hasSearch': true,	// 是否有搜索模块
            'hasAdvancedSearch': false,	// 是否有高级搜索模块
            'hasAdvancedDate': false,
            'hasSubGrid': true,	// 是否显示子表格
            'hasExport': true,  // 是否有导出模块
            'hasPager': true,	// 是否有分页模块
            'hasAmount': true,	// 是否有总计模块
            'hasTab': true,		// 是否显示栏目切换栏
            "hasSelect": false, // 是否显示选择列
            'singleSelect':false, //是否单选
            'pager': null,		// 分页模块配置信息
            'list': null,		// 表格详细配置信息
            'tab': null,		// 栏目切换配置信息
            'highlight_time': 180,  // 保存成功后记录的高亮时间
            "batch":false,		// 批量操作
            "hasRefreshManual": true, // 当为子表格时的手动刷新按钮，默认显示
            // 模块加载区域设定。
            // 这个设定根据buildLayout函数生成的结果来设定。
            // 如果有自定义的结构，这里可能需要根据生成的结果做调整
            "layoutMap":{
                "search":"row1"
                ,"amount":"row3"
                ,"list":"row4"
                ,"pager":"row5"
                ,"tab":"row2_cell1"
                ,"excel":"row2_cell2"
                ,"refresh":"row2_cell2"
                ,"batch":"row2_cell2"
            }
        }, config);

        if(config.is_sub_grid && util.isArray(config.acted_subs) && config.subs && config.subs.length){
            config.sub_lv = isNaN(config.sub_lv)?4:config.sub_lv;
            // 子表格中打开子表格，已经打开过的类型不再显示，子表中包含了主表的也不显示
            // #877 隐藏无效subgrid
            if(config.acted_subs.length > config.sub_lv){
                config.subs = null;
            }else{
                var subs = config.subs+",";
                for(var j = 0,l = config.acted_subs.length;j<l;j++){
                    // 擦除已展开过的类型
                    subs = subs.replace(config.acted_subs[j]+",","");
                }
                // 重新生成
                config.subs = subs.substr(0,subs.length-1).split(",");
                subs = null;
            }
        }

        if (config.sub_filter && util.isString(config.sub_filter)){
            var cb = config.sub_filter;
            config.sub_filter = util.isFunc(this[cb]) ? [this, this[cb]] : null;
        }

        var tmp = app.config("userModules").subgrid.exclude[app.getUser().type];
        if(tmp && config.subs && config.subs.length){
            for(var i = 0,len = tmp.length;i<len;i++){
                util.remove(config.subs,tmp[i]);
            }
        }
        tmp = null;

        this.sys_param = datebar.getDate();
        config.highlight_time = config.highlight_time * 1000;

        // 区域对象
        this.$layout = null;

        Base.master(this, null, config);
        // 自动刷新Timeout ID
        this.$refresh_timeid = 0;
        // 行名称字段名
        this.gridRowName = 'Name';
        // 子表格实例缓存
        this.$subGrids = {};

    }
    extend(Base, view.container, {
        init: function(){
            Base.master(this, 'init');
            this.buildLayout();
            var cfg = this.config,tmp;

            // 建立搜索过滤
            if (cfg.hasSearch){
                this.search = this.create('serach', common.search, {
                    'target': this.getLayout("search"),
                    'advancedSearch': !!cfg.hasAdvancedSearch,
                    'advancedDate': cfg.hasAdvancedDate,
                    'autoFocus': cfg.autoFocus
                });
            }

            // Excel导出控件
            if (cfg.hasExport){
                this.excel = this.create('excel', common.excelExport,this.getLayout("excel",1));
            }

            // 自动刷新模块
            if (cfg.hasRefresh){
                // 读取记录的配置
                cfg.refresh_id = 'autoRefresh' + this._.uri.replace(/\//g, '_');
                if (cfg.refresh_auto){
                    cfg.refresh_auto = (app.storage(cfg.refresh_id) !== '0');
                }
                tmp = this.getLayout("refresh");
                var div = $('<div class="M-gridRefresh" />').appendTo(tmp);
                div.html('<input type="button" data-type="0" class="btn" /><button><em class="refNormal"></em></button>');
                var ref = this.$refresh = {
                    dom: div,
                    check: div.find('input:first').val(LANG("自动刷新")),
                    button: div.find('button:first')
                };
                this.refreshCallBack = this.refreshCallBack.bind(this);
                if (cfg.refresh_auto){
                    ref.check.addClass('active').attr('data-type', 1);
                }
                // 检测是否禁用自动刷新按钮；
                this.toggleRefreshDisable();
                this.jq(ref.check, 'click', 'eventRefreshMode');
                this.jq(ref.button, 'click', 'eventRefreshManual');
            }

            // 手动刷新模块
            if (cfg.is_sub_grid && !cfg.hasRefresh && cfg.hasRefreshManual) {
                var refreshLayout = this.getLayout("refresh");
                var refreshManualDiv = $('<div class="M-gridRefresh" />').appendTo(refreshLayout);
                refreshManualDiv.html('<button><em class="refNormal"></em></button>');
                var refManual = this.$refreshManual = {
                    dom: refreshManualDiv,
                    button: refreshManualDiv.find('button:first')
                };
                this.jq(refManual.button, 'click', 'eventRefreshManual');
            }

            // 批量操作
            if(cfg.batch && util.isObject(cfg.batch) && cfg.batch.enable){
                /*
                 {
                 "type":"check"
                 ,"class":"test"
                 ,"text":LANG("测试")
                 }
                 */
                tmp = this.getLayout("batch",1);
                tmp.list = cfg.batch.list;
                this.create(
                    "batch"
                    ,table.batch
                    ,tmp
                );
                cfg.hasSelect = true;
            }

            // 默认选择列
            if(cfg.hasSelect){
                cfg.cols.unshift({
                    "type":"select",
                    "name":"sel",
                    "all":(cfg.hasSelect === true),
                    "readonly":cfg.readonly
                });
            }

            // 子表格排除创建时间与状态
            if (cfg.is_sub_grid){
                if (cfg.exclude_cols){
                    cfg.exclude_cols.push("CreateTime","Status");
                }else {
                    cfg.exclude_cols = ["CreateTime","Status"];
                }
            }

            // 排除配置
            if(cfg.exclude_cols){
                util.each(cfg.cols, function(item){
                    var name = util.isString(item) ? item : (item.name || null);
                    if (name !== null && util.index(cfg.exclude_cols, name) !== null){
                        return null;
                    }
                });
            }

            // 栏目切换控件
            if (cfg.hasTab){
                // 获取初始字段列表
                var list = [];
                var all = [];
                util.each(cfg.cols, function(item){
                    if (util.isString(item)){
                        all.push(item);
                        list.push(item);
                    }else if (item.name){
                        all.push(item.name);
                        if (!item.type || item.type == 'col'){
                            list.push(item.name);
                        }
                    }
                });
                var initLength = all.length;

                cfg.tab = cfg.tab || {};
                cfg.tab.gridType = this.gridType;
                if(cfg.tab.gridCols !== false){
                    cfg.tab.gridCols = list;
                }
                cfg.tab.target = this.getLayout("tab");
                this.tab = this.create('tab', table.tab, cfg.tab);
                // 有栏目分类切换的话,尝试自动补齐未配置的字段
                // 生成支持的所有字段
                util.each(this.tab.getList(), function(item){
                    if (item.custom){ return; }
                    list.push.apply(list, item.cols);
                });

                // 字段去重
                all.push.apply(all, list);
                util.unique(all);

                // 合并字段到Grid配置中
                if (cfg.cols){
                    cfg.cols.push.apply(cfg.cols, all.slice(initLength));
                }else {
                    cfg.cols = all;
                }
            }

            // 子表格排除创建时间与状态
            if (cfg.is_sub_grid){
                if (cfg.exclude_cols){
                    cfg.exclude_cols.push("CreateTime","Status");
                }else {
                    cfg.exclude_cols = ["CreateTime","Status"];
                }
            }

            // 排除配置
            if(cfg.exclude_cols){
                util.each(cfg.cols, function(item){
                    var name = util.isString(item) ? item : (item.name || null);
                    if (name !== null && util.index(cfg.exclude_cols, name) !== null){
                        return null;
                    }
                });
            }

            // 总计控件
            if(cfg.hasAmount){
                cfg.amount = $.extend(cfg.amount, {
                    'cols': cfg.cols,
                    'data': cfg.amount_data || null,
                    'target':this.getLayout("amount")
                });
                this.amount = this.create('amount', table.amount, cfg.amount);
            }

            // 把附加的自定义操作写入列定义中
            if (cfg.operation){
                if (cfg.operation instanceof Array){
                    Array.push.apply(cfg.cols, cfg.operation);
                }else {
                    cfg.operation.type = 'op';
                    cfg.cols.push(cfg.operation);
                }
                if (!cfg.opClick) {cfg.opClick = true;}
            }

            // 操作功能配置
            if(util.isObject(cfg.functional)){
                cfg.functional.type = "func";
            }else if(cfg.functional){
                if(window.console){
                    window.console.warn("操作功能配置类型错误 >> ",cfg.functional);
                }
                cfg.functional = null;
            }

            // 建立基本Table结构
            var listCfg = $.extend({
                'cols': cfg.cols,
                'subs': cfg.hasSubGrid ? cfg.subs : null,
                'rowClick': cfg.rowClick,
                'rowSelect':cfg.rowSelect,
                'opClick': cfg.opClick,
                'subFilter': cfg.sub_filter,
                'data': cfg.data,
                "sort": cfg.sort,
                'order': cfg.order,
                'key': cfg.sub_field,
                "functional":cfg.functional,
                'singleSelect':cfg.singleSelect,
                'emptyText':cfg.emptyText,
                'hasAmount': cfg.hasAmount,
                'hasFrozen': cfg.hasFrozen,
                'frozenSite': cfg.frozenSite,
                "target":this.getLayout("list")
            }, cfg.list);
            this.list = this.create('list', table.list, listCfg);

            // 高级搜索指标过滤下拉框填入指标
            if(this.search){
                this.search.setOptions(this.list.getCols());

            }
            // util.imageError(this.list.el,'default.png');
            this.sys_param.order = this.list.getSort();

            // 分页定义
            if (cfg.hasPager){
                cfg.pager = cfg.pager || {};
                cfg.pager.target = this.getLayout("pager");
                this.pager = this.create('pager', common.pager, cfg.pager);
                this.sys_param.page = this.pager.page;
                this.sys_param.limit = this.pager.size;
            }

            if (this.tab){
                var cols = this.tab.getColumns();
                if (this.amount){
                    this.amount.showColumn(cols);
                }

                this.list.showColumn(cols);
            }
            if(cfg.gridType){
                this.gridType = cfg.gridType;
            }
            // 加载数据
            if (!cfg.data && cfg.auto_load && (cfg.url || cfg.is_sub_grid)){
                this.load();
            }
            if(cfg.singleSelect){
                //隐藏序号隔离全选的checkbox
                this.el.find('input[data-type="select_all"]').hide();
            }
        },
        /**
         * 表格区域生成函数。子区域的命名用"_"分割。区域没特殊原因在一开始不要添加到容器中
         * @return       {Undefined} 无返回值
         */
        buildLayout:function(){
            if(this.$layout){
                return;
            }
            var tpl = '<div></div><div><div></div><div></div></div><div></div><div></div><div></div>'
                ,tmp = {};
            $(tpl).each(function(i,n){
                tmp["row"+(i+1)] = $(n).addClass("M-gridLayoutRow");
                tmp["row"+(i+1)].added = 0;
            });
            this.$layout = tmp;
            tmp = this.$layout.row2.find("div");
            this.$layout["row2_cell1"] = tmp.eq(0).addClass("M-gridLayoutCellLeft");
            this.$layout["row2_cell2"] = tmp.eq(1).addClass("M-gridLayoutCellRight");
            this.$layout["row2_cell1"].added = 1;
            this.$layout["row2_cell2"].added = 1;
            tmp = null;
        },
        /**
         * 获取区域
         * @param  {String} type 区域名称
         * @param  {Bool}   cfg  是否直接返回配置对象
         * @return {Object}      区域对象或配置对象
         */
        getLayout:function(type,cfg,isValue){
            var lmap = this.config.layoutMap,tmp;
            if(!type || !this.$layout || !lmap){
                // 毛都没有
                return null;
            }
            tmp = lmap[type].split("_");
            if(tmp.length > 1){
                tmp = tmp[0];
                if(this.$layout[tmp] && !this.$layout[tmp].added){
                    // 如果父层没添加的话要先添加父层
                    this.$layout[tmp].added = 1;
                    this.el.append(this.$layout[tmp]);
                }
                tmp = null;
            }
            type = this.$layout[lmap[type]];
            if(type && !type.added){
                // 用到了才添加
                this.el.append(type);
                type.added = 1;
            }
            if(cfg){
                type = {
                    "target":type
                }
            }
            return type;
        },
        /**
         * 获取grid数据或grid指定方法的返回数据
         * @param  {Object} ev 消息对象
         * @return {Bool}      false
         */
        onGetData:function(ev){
            var conf = ev.param
            // 尝试在模块里找子模块
                ,module = this[conf.module] || this.$[conf.module]
            // 数据
                ,dat = {
                    "data":null
                };

            // 没指定则默认grid本身
            module = module || this;
            // 执行方法，默认是获取数据
            conf.action = conf.action || "getData";

            if(util.isFunc(module[conf.action])){
                dat.data = module[conf.action](conf.param);
            }
            // key为发送者希望保留回发的数据
            if(conf.key !== undefined){
                dat.key = conf.key;
            }

            this.send(
                ev.from
                ,"gridData"
                ,dat
            );
            dat = null;
            return false;
        },
        eventRefreshMode: function(evt, elm){
            // var c = this.config;
            this.config.refresh_auto = +$(elm).attr("data-type");
            this.toggleRefresh();
        },
        eventRefreshManual: function(evt, elm){
            $(elm).find('em').removeClass("refNormal").addClass("refing");
            // 如果重新了load方法，则广播事件触发，否则就调用load
            this.fire('load');
            this.load(true);
        },
        toggleRefresh: function(mode){
            var c = this.config;
            if (mode === undefined){
                mode = !c.refresh_auto;
            }else {
                mode = !!mode;
            }
            c.refresh_auto = mode;
            this._toggleRefresh(mode);
            this.$refresh.check.attr("data-type",mode?1:0).toggleClass("active",mode);
            app.storage(c.refresh_id, +mode);
        },
        _toggleRefresh: function(mode){
            if (mode){
                if (!this.$refresh_timeid){
                    this.$refresh_timeid = setTimeout(
                        this.refreshCallBack,
                        this.config.refresh_time * 1000
                    );
                }
            }else {
                if (this.$refresh_timeid){
                    clearTimeout(this.$refresh_timeid);
                    this.$refresh_timeid = 0;
                }
            }
        },
        refreshCallBack: function(mode){
            var me = this;
            if (me.el.width() > 0){
                me.cast('autoRefresh');
            }else {
                me.$refresh_timeid = 0;
                me._toggleRefresh(1);
            }
        },
        onAutoRefresh: function(){
            if (this.el.width() > 0){
                // 表格正常显示, 刷新自己

                // 如果包含今天，自动刷新才有效；
                this.toggleRefreshDisable();
                if(app.isContainsToday()){
                    this.load(true);
                }else {
                    return false;
                }
            }else {
                // 表格隐藏, 拦截事件不刷新
                return false;
            }
        },
        /**
         * 设置分页数据
         * @param {Number} page  当前页面数据
         * @param {Number} size  分页数据大小
         * @param {Number} total 总记录条数
         */
        setPage: function(page, size, total){
            if (!page){ page = 1; }
            if (this.pager){
                this.pager.setup({
                    page: page,
                    total: total,
                    size: size
                });
            }
            this.sys_param.page = page;
        },
        setSort: function(field, order){
            var c = this.config;
            c.sort = field;
            c.order = order;

            this.sys_param.order = this.list.setSort(field, order).getSort();
            return this;
        },
        /**
         * 手工设置列表数据
         * @param {Array} data 列表数据数组
         */
        setData: function(data){
            var index = 0;
            if (this.pager){
                index = (this.pager.page - 1) * this.pager.size;
            }
            this.config.data = data;
            this.list.setData(data,index);
            this.fire("sizeChange");
        },
        /**
         * 返回当前Grid数据列表
         * @return {Array} 返回数据列表数组
         */
        getData: function(){
            return this.config.data;
        },
        /**
         * 设置总计模块数据
         * @param {Object} data 总计模块数据对象
         */
        setAmount: function(data){
            if (this.amount){
                this.amount.setData(data);
            }
        },
        /**
         * 设置表格的某一项记录
         * @param {Number} index 行索引号
         * @param {Object} row   行数据对象 / {String} 行属性名称
         * @param {Mix}    data  <可选> 行属性值
         * @param {Bool}   isId  <可选> index参数是否是ID
         * @return {Bool} 返回更新操作结果
         */
        setRow: function(index, row, data,isId){
            if(isId){
                index = this.list.findIndex(index);
            }
            var res = this.list.setRow(index, row, data);
            if (!res){
                return false;
            }
            this.config.data = res;
            return true;
        },
        /**
         * 删除某一行记录
         * @param  {Number} index 行索引号码
         * @return {Bool}       返回删除操作结果
         */
        removeRow: function(index){
            var res = this.list.removeRow(index);
            if (!res){
                return false;
            }
            this.config.data = res;
            return true;
        },
        /**
         * 增加一行数据
         * @param {Object} row 行数据对象
         */
        addRow: function(row){
            return this.list.addRow(row);
        },
        /**
         * 增加一行数据
         * @param {Object} row 行数据对象
         */
        showEmptyRow: function(){
            this.list.showEmptyRow();
        },
        /**
         * 隐藏空数据提示
         * @return {None} 无返回
         */
        hideEmptyRow: function(){
            this.list.hideEmptyRow();
        },
        /**
         * 加载远程服务器数据
         * @return {None}     无返回
         */
        load: function(auto){
            var cfg = this.config;

            // 自动刷新
            if (this.$refresh){
                this._toggleRefresh(0);
                this.$refresh.button.prop('disabled', true)
                    .children("em").removeClass("refNormal").addClass("refing");
            }

            if (cfg.is_sub_grid && cfg.sub_param){
                var type = this.subGridType || this.gridType;
                if (cfg.sub_gen_url && type){
                    cfg.url = '/rest/subgrid?type=' + type;
                }
                this.sys_param.condition = cfg.sub_param;
            }else {
                delete(this.sys_param.condition);
            }

            if (!cfg.url){ return; }

            var param = $.extend({},
                cfg.param,
                cfg.sub_param_ex,
                this.sys_param,
                this.getParam()
            );

            if (!cfg.hasAmount){
                param.noAmountData = 1;
            }
            auto = (auto === true);
            if (this.$request_id){
                app.data.abort(this.$request_id);
            }
            this.$request_id = app.data.get(cfg.url, param, this, 'onData', auto);
            this.list.showLoading(auto);
        },
        /**
         * 重新加载数据, 默认重置当前页码
         * @param  {Object} url <可选> 新的远程服务器配置信息
         * @param  {Object} param <可选> 新的远程服务器配置信息
         * @param  {Object} sub_param <可选> 新的远程服务器配置信息
         * @param  {Object} page <可选> 新的远程服务器配置信息
         * @return {None}     无返回
         */
        reload: function(url, param, sub_param, page){
            var cfg = this.config;
            if (url){
                cfg.url = url;
            }
            if (param){
                cfg.param = param;
            }
            if (sub_param){
                cfg.sub_param = sub_param;
            }
            this.sys_param.page = page || 1;
            this.load();
        },
        /**
         * 更新操作列显示
         * @return {None} 无返回
         */
        updateOperation: function(){
            this.list.updateColumnType('op');
        },
        updateColumnByName: function(){
            this.list.updateColumnByName.apply(this.list, arguments);
            return this;
        },
        /**
         * 更新合并请求参数
         * @param  {Object} param 变更的参数对象
         * @return {None}       无返回
         */
        updateParam: function(param){
            this.config.param = util.merge(this.config.param, param);
        },
        /**
         * 数据中心返回数据回调方法
         * @param  {Object} err  请求错误对象
         * @param  {Object} data 请求数据返回结果
         * @return {None}      无返回
         */
        onData: function(err, data, param){
            // 自动刷新
            if (this.$refresh){
                this.$refresh.button.prop('disabled', false)
                    .children("em").removeClass("refing").addClass("refNormal");
                if (this.config.refresh_auto){
                    this._toggleRefresh(1);
                }
                // 自动拉取时, 错误不更新不提示错误
                if (param === true && !err){
                    this.list.showRefresh();
                }
            }
            // 子表格刷新按钮复原
            if(this.config.hasRefreshManual && this.$refreshManual){
                this.$refreshManual.button.children("em").removeClass("refing").addClass("refNormal");
            }
            // 判断错误
            if (err){
                this.list.showEmptyRow();
                app.error('拉取数据错误', err);
                return;
            }
            var index = 0;
            // 更新分页
            var pager = this.pager;
            if (pager){
                pager.setup({
                    'total': data.total,
                    'size': (data.size || undefined),
                    'page': (data.page || undefined)
                });
                var info = pager.getData();
                if (info.count > 1 || info.size != info.init_size){
                    pager.show();
                    index = (info.page - 1) * info.size;
                }else if (this.config.is_sub_grid){
                    pager.hide();
                }
            }

            // 设置数据到表格中
            var items = this.config.data = data.items || [];
            this.list.setData(items, index, param);

            // 更新数据到总计模块
            if (this.amount) {this.amount.setData(data.amount || {});}

            this.fire("sizeChange");
            this.fire('gridDataLoad', items);
        },
        /**
         * 搜索事件处理函数
         * @param  {Object} ev 事件变量
         * @return {Bool}       返回false拦截事件冒泡
         */
        onSearch: function(ev){
            var param = ev.param;
            var UD;
            var SP = this.sys_param;

            SP.Word = UD;
            SP.Words = UD;
            SP.metrics_filter = UD;
            SP.BeginCreate = UD;
            SP.EndCreate = UD;

            // 普通搜索
            if(!util.isObject(param)){
                SP.Word = param || UD;
            }else{	// 多词搜索
                switch (param.type){
                    case 'keys':
                        SP.Words = param.data.toString() || UD;
                        break;
                    case 'metric':
                        SP.metrics_filter = JSON.stringify(param.data) || UD;
                        break;
                    case 'date':
                        SP.BeginCreate = util.date('T', param.data.begin);
                        SP.EndCreate = util.date('T', param.data.end);
                        break;
                }
            }

            this.sys_param.page = 1;
            this.load();
            return false;
        },
        /**
         * 分页切换事件
         * @param  {Object} ev 事件变量
         * @return {Bool}       返回false拦截事件冒泡
         */
        onChangePage: function(ev){
            if (this.pager){
                this.sys_param.page = ev.param;
                this.sys_param.limit = this.pager.size;
                this.load();
            }
            return false;
        },
        /**
         * 切换排序事件
         * @param  {Object} ev 事件变量
         * @return {Bool}       返回false拦截事件冒泡
         */
        onChangeSort: function(ev){
            this.sys_param.order = this.list.getSort();
            this.load();
            return false;
        },
        /**
         * 切换栏目事件处理函数
         * @param  {Object} ev 事件变量
         * @return {Bool}     返回false拦截事件冒泡
         */
        onChangeTab: function(ev){
            var sels = ev.param.sels || ev.param.cols;
            if (this.amount) {
                this.amount.showColumn(sels);
            }
            if (this.list) {
                this.list.showColumn(sels);
            }
            return false;
        },

        /**
         * 导出按钮点击事件
         * @param  {Object} ev 事件变量
         * @return {Bool}     返回false拦截事件冒泡
         */
        onExcelExport: function(ev){
            var cfg = this.config;
            var param = $.extend({},
                cfg.param,
                this.sys_param,
                this.getParam(),
                this.getExportParam && this.getExportParam()
            );
            if (cfg.sub_exname){
                param.subex_name = cfg.sub_exname;
            }
            ev.returnValue = app.data.resolve(cfg.export_url || cfg.url, param);
            return false;
        },
        /**
         * 打开二级表格事件通知
         * @param  {Object} ev 事件变量
         * @return {Bool}     返回false拦截事件冒泡
         */
        onShowSubGrid: function(ev){
            var param = ev.param;
            // 判断表格分类是否存在
            var module = (param.config.module || param.label.module);
            if (!util.isCreator(module)){
                if (util.isString(module)){
                    app.loadModule(module, param, this, 'buildSubGrid');
                    return false;
                }
                module = exports[param.type];
                if (!util.isCreator(module)){
                    app.error('SubGrid Constructor Missing' - param.type);
                    return false;
                }
            }
            this.buildSubGrid(module, param);
            return false;
        },
        /**
         * 关闭二级表格事件通知
         * @param  {Object} ev 事件变量
         * @return {Bool}     返回false拦截事件冒泡
         */
        onHideSubGrid: function(ev){
            var index = ev.param.index;
            var list = this.$subGrids;
            if (index && list[index]){
                list[index].show = 0;
            }
            return false;
        },
        /**
         * 构建指定类型的二级表格实例
         * @param  {Module} module 实例定义函数
         * @param  {Object} param  实例构建参数
         * @return {None}
         */
        buildSubGrid: function(module, param){
            var gridParam = this.getSubGridParam(param);
            var cid = param.index;
            var inst = this.$subGrids[cid];

            // 设定已展开的子表格列表
            gridParam.acted_subs = util.isArray(this.config.acted_subs) && this.config.acted_subs.slice() || [this.gridType];
            // 追加当前打开的子表格类型
            gridParam.acted_subs.push(param.type);

            if (inst){
                var subgrid = inst.grid;
                if (inst.type === param.type){
                    if (gridParam.sub_param != inst.param){
                        inst.param = gridParam.sub_param;
                        if (!inst.date){
                            subgrid.cast('updateSubGrid', gridParam);
                        }
                    }
                    if (inst.date){
                        // 表格需要重新加载
                        subgrid.cast('changeDate', inst.date);
                        inst.date = false;
                    }
                    // 同一个类型的Grid, 直接返回, 无需重复加载
                    return;
                }else {
                    inst.grid.destroy();
                }
            }

            // 创建实例
            this.$subGrids[cid] = {
                grid: this.create(module, gridParam),
                type: param.type,
                param: gridParam.sub_param,
                date: 0,
                show: 1
            };
            return;
        },
        // 子表格参数更新
        onUpdateSubGrid: function(ev){
            var p = ev.param;
            var c = this.config;
            c.sub_exname = p.sub_exname;
            c.sub_param  = p.sub_param;
            c.sub_param_ex = p.sub_param_ex;
            c.sub_id     = p.sub_id;
            c.sub_data   = p.sub_data
            if (c.sub_static){
                c.sub_static = p.sub_static || p.sub_data;
            }
            this.load();
            return false;
        },
        /**
         * 切换更新二级表格实例索引
         */
        onSwitchSubGrid: function(ev){
            var from = ev.param.from;
            var to = ev.param.to;
            var list = this.$subGrids;
            var fromInst = list[from];
            var toInst = list[to];
            if (toInst){
                list[from] = toInst;
            }else {
                delete list[from];
            }
            if (fromInst){
                list[to] = fromInst;
            }else {
                delete list[to];
            }
            return false;
        },
        /**
         * 生成子查询Condition参数
         * @param  {Object} param subGrid模块传递进来的带行DATA对象参数
         * @return {String}       子表格查询参数字符串
         */
        getSubParam: function(param){
            var cfg = this.config;
            var id = param.data[cfg.sub_field];
            var sub_param = cfg.sub_param || '';
            sub_param += (sub_param && ',') + (cfg.sub_key || ((this.subGridType || this.gridType) + '_id')) + '|' + id;
            return sub_param;
        },
        /**
         * 返回子表格的自定义参数 (具体表格分类重写本函数可控制子表格的样式)
         * @param  {Object} param showSubGrid的事件对象
         * @return {Object}       返回子表格的参数对象
         */
        getSubGridParam: function(param){
            return {
                'is_sub_grid': true,
                'sub_exname': param.data[this.gridRowName],
                'sub_param': this.getSubParam(param),
                'sub_param_ex': this.config.sub_param_ex,
                'sub_id': param.data[this.config.sub_field],
                'sub_static': this.config.sub_static,
                'sub_data': param.data,
                'hasSearch': true,
                'hasAdvancedSearch': true,
                'hasAmount': false,
                'target': param.target
            };
        },
        /**
         * 子功能调用通知事件
         * @param  {Object} ev 通知事件对象
         * @return {Bool}    返回false阻止事件冒泡
         */
        onSubFunction: function(ev){
            var param = ev.param;
            // 判断表格分类是否存在
            var module = (param.config.module || param.label.module);
            if (!util.isCreator(module)){
                if (util.isString(module)){
                    app.loadModule(module, param, this, 'runSubFunction');
                    return false;
                }
            }
            this.runSubFunction(module, param);
            return false;
        },
        runSubFunction: function(module, param){
            if (module && util.isCreator(module)){
                var cid = 'funcmod_' + param.type;
                var mod = this.child(cid);
                if (mod){
                    mod.setParam(param);
                }else {
                    mod = this.create(cid, module, param);
                }
                return mod;
            }else {
                return false;
            }
        },
        switchFunctional: function(state){
            this.list.switchFunctional(state);
            return this;
        },
        /**
         * 时间改变的响应函数
         * @param  {Object}  ev 消息对象
         * @return {Boolean}    阻止广播
         */
        onChangeDate:function(ev){
            // 检测是否禁用自动刷新按钮；
            this.toggleRefreshDisable();
            var param = ev.param;
            if (param.stastic_all_time){
                param = {stastic_all_time: 1};
            }else {
                param = {
                    begindate: param.nowTimestamp.begin,
                    enddate: param.nowTimestamp.end
                };
            }
            // 强制刷新数据
            this.setDateRange(param);
            this.load();
            // 二级表格全部置重新加载状态
            util.each(this.$subGrids, function(inst){
                if (inst.show){
                    inst.grid.cast('changeDate', ev.param);
                }else {
                    inst.date = ev.param;
                }
            })
            return false;
        },
        /**
         * 更新时间段参数
         * @param {Object} date datebar模块返回的时间段参数
         * @return {Bool}		返回是否有参数更新
         */
        setDateRange:function(date){
            var sp = this.sys_param;
            if (!sp){ return false; }
            var param = {};
            if (date.stastic_all_time){
                param = {
                    stastic_all_time: 1,
                    begindate: null,
                    enddate: null
                };
            }else {
                param = {
                    stastic_all_time: null,
                    begindate: date.begindate,
                    enddate: date.enddate
                };
            }
            return util.merge(sp, param, true);
        },
        /**
         * 设置表格某行选中
         * @param {Number} id 行ID值
         */
        setRowHighlight: function(id) {
            if (id) {
                this.list.setRowHighlight(id);
                this.setTimeout('unsetRowHighlight', this.config.highlight_time, id);
            }
        },
        /**
         * 取消表格高亮行
         * @param  {Number} id 行ID值
         * @return {None}
         */
        unsetRowHighlight: function(id){
            this.list.unsetRowHighlight(id);
        }
        /**
         * 设定选中的行
         * @param {Array} sels 行id数组
         */
        ,setSelectRowIds: function(sels){
            this.list.setSelectRowIds(sels, 'sel');
            return this;
        }
        /**
         * 获取选中的行
         * @return {Array} 选中的行的ID
         */
        ,getSelectRowId: function(){
            return this.list.getSelectRowId('sel');
        }
        ,showColumn: function(cols){
            this.$.list.showColumn(cols);
            return this;
        }
        /**
         * 统一获取表格自定义查询参数
         * @return {Object} 返回自定义查询参数
         */
        ,getParam: function(){
            return this.config.customParam;
        }
        /**
         * 统一设置表格自定义参数
         * @param {Object} params 要设置合并的自定义参数对象
         * @param {Boolean} replace 是否要完成替换参数
         */
        ,setParam: function(params, replace){
            this.config.customParam = replace ? params : util.merge(
                this.config.customParam,
                params
            );
            return this;
        }
        /**
         * 显示、隐藏指定列
         * @param  {String} name 指定列的名字
         * @param  {Boolean} show 显示还是隐藏
         */
        ,toggleColumn: function(name,show){
            return this.list.toggleColumn(name,show);
        }
        ,toggleBatch: function(show){
            var batch = this.get('batch');
            if (batch){
                if (show){
                    batch.show();
                }else {
                    batch.hide();
                }
            }
            return this;
        }
        ,disableBatch: function(disabled, tip_text){
            var batch = this.get('batch');
            if (batch){
                batch.disable(disabled).setTip(tip_text);
            }
            return this;
        }
        // 显示、隐藏指定的Tab栏目
        ,toggleTabColumn: function(name,show){
            return this.tab.toggleTabColumn(name,show);
        }
        // 激活指定的Tab栏目
        ,activateTabColumn: function(name){
            return this.tab.activateTabColumn(name);
        }
        // 检测是否禁用自动刷新按钮；
        ,toggleRefreshDisable: function(){
            var flag = app.isContainsToday();
            if(this.$refresh && this.$refresh.check){
                this.$refresh.check
                    .attr('disabled', !flag)
                    .toggleClass('active', flag);
            }
        }
    });
    exports.base = Base;

    function BaseNoDate(config){
        BaseNoDate.master(this);
        delete this.sys_param.stastic_all_time;
        delete this.sys_param.begindate;
        delete this.sys_param.enddate;
    }
    extend(BaseNoDate, Base, {
        onChangeDate: function(){
        }
    });
    exports.baseNoDate = BaseNoDate;

    //========= 友好的分割线: 以下是各类自定义表格定义 =========//

    /**
     * 重载表格
     * @return {Boolean} false
     * @private
     */
    function _reloadGrid(){
        this.reload();
        return false;
    }

    /**
     * 限制宽度名字字段渲染函数
     */
    function _renderValWithTag(i,val,row,con){
        var dom = $('<div class="M-tableListWidthLimit" />');
        if (val === ''){
            val = LANG("其他");
            dom.addClass('ti');
        }else if (val === null){
            val = LANG('(空)');
            dom.addClass('tdef');
        }
        return dom.text(val).width(con.width).attr("title",val);
    }

    /**
     * 格式化名称字段, 如果是空的话, 返回: (空)
     * @param  {String} val 要格式化的字段数值
     * @return {String}     返回格式化后的字符串
     */
    function _formatEmptyName(val){
        if (val === '' || val === null || val === undefined){
            return LANG('<i class="tdef">(空)</i>');
        }else {
            return val;
        }
    }

    /**
     * 点击Thumb时弹出预览大图
     * @param  {object} evt 事件对象
     * @param  {object} el  当前DOM元素
     * @return {boolean}     false
     */
    function _showPreviewImage(evt,el){
        var tip  = this.get('previewImage');
        el = $(el);
        switch (evt.type){
            case 'mouseenter':
                //链接地址
                if (el.attr('data-ready') !== '1'){ break; }
                //图片地址
                var href = el.attr('data-origin');
                var img = util.imageThumb(href, 200, 200);
                var html = '<a href='+ href +' target="_blank"><img width="200" src='+ img +'></a>';
                //弹出框
                if (!tip){
                    tip = this.create('previewImage', popwin.tip, {
                        'width': 'auto',
                        'data': html,
                        'pos':'bm',
                        'anchor': el,
                        'autoHide': 1,
                        'outerHide': 1,
                        'class':'M-tip'
                    });
                    tip.show();
                }else {
                    tip.reload({data:html, anchor: el});
                }
                tip.show();
                break;
            case 'mouseleave':
                if (tip){ tip.delayHide(100); }
                break;
            case 'imageLoad':
                el.attr('data-ready', '1');
                break;
            case 'imageError':
                el.attr('data-thumb', null);
                break;
        }
        return false;
    }

    function _parseSubs(param){
        var ret = [];
        util.each(param.split(','), function(item){
            var key = item.split('|').shift();
            if (key){
                if (key.slice(-3) === '_id'){
                    ret.push(key.slice(0,-3));
                }else {
                    ret.push(key);
                }
            }
        });
        return ret;
    }

    function _renderName(i,val,row,con){
        return $("<div/>").width(con.width).text(val);
    }

    /**
     * 产品列表
     */
    function Product(config){
        config = $.extend({
            'cols':[
                {type:'id'},
                'ProductNameWithThumb'
            ],
            'tab':{
                cols:{'bid':null}
            },

            // 二级表单
            // 远程服务器数据点
            'url': '/rest/listproduct?all=1',
            'subs':  ['platform','campaign','mediaAndAd','sweety','whisky','period','comp','geo','client']
        }, config);
        Product.master(this, null, config);
        this.config.originalData = config.originalData;
        this.gridType = 'product';
    }
    extend(
        Product
        ,Base
        ,{
            init:function(){
                Product.master(this,"init");
                //绑定事件-预览大图
                this.dg(this.el, '.M-grid-thumb img', 'mouseenter mouseleave imageLoad imageError', 'showPreviewImage');
            }
            ,onAddProductSuccess:_reloadGrid
            ,onEditProductSuccess:_reloadGrid
            ,showPreviewImage:_showPreviewImage
        }
    );
    exports.product = Product;

    /**
     * 活动列表
     */
    var PDMP = require("pdmp").base
        ,FREQUENCY = require("frequency").base;

    function _setGlobalStore(type, campaign){
        var uri = '/campaign/'+campaign.Id;
        // 合并超级黑名单
        var blacklist = campaign.WhiteBlackList || [];
        if (campaign.SetExcludeInfo){
            blacklist.push.apply(blacklist, campaign.SetExcludeInfo);
        }

        // 更新数据模型
        switch (type){
            case 'all':
                app.store.set(uri, {
                    'blacklist': blacklist,
                    'pricelist': campaign.PriceModify,
                    'price': campaign.TopPrice
                });
                break;
            case 'price':
                app.store.set(uri + '/' + type, campaign.TopPrice);
                break;
            case 'blacklist':
                app.store.set(uri + '/' + type, blacklist);
                break;
            case 'pricelist':
                app.store.set(uri + '/' + type, campaign.PriceModify);
                break;
        }
    }
    function Campaign(config){
        var tmp;
        if(config.cols){
            // 有自定义的话先保留自定义的
            tmp = config.cols.slice();
            delete config.cols;
        }
        config = $.extend(true,{
            'cols':[
                // {type:'id'},
                {name:"_id",type:'fixed',sort:true,align:'center', width:60},
                {name:'Name',text:LANG("活动"), type:'index',render:'renderColName', width:210},
                {name:"top_price",field:'TopPrice',type:'dim',render:'renderTopPrice'}
                // {name:'showus',type:'dim', text:LANG('进度'),render:this.renderProgress,width:156}
            ],
            'tab':{
                'cols': {
                    'default': [false, 'top_price'],
                    'bid': [true, "bid_num", "win_num", "win_rate", "top_price"]
                }
            },
            // 二级表单
            'subs':  ['mediaAndAd','mediaAndAdCampaign','sweetyCampaign','whiskyCampaign','period','periodAgent','comp','geo','client','productAndPlatform','platform'],
            'sub_filter': 'subFilter',
            // 远程服务器数据点
            'url': '/rest/listcampaigngo',
            'priceUrl': '/rest/campaignset',
            // 批量操作
            "batch":{
                "enable":false
                ,"list":[
                    {
                        "text":LANG("设置")
                        ,"type":"setting"
                        ,"subs":[
                        {"text":LANG("频次控制"),"type":"frequency","mode":"pop","render":"batchRender"}
                        ,{"text":LANG("投放速度"),"type":"bidSpeed","mode":"pop","render":"batchRender"}
                        ,{"text":LANG("人群选择"),"type":"character","mode":"spop","render":"batchRender"}
                        ,{"text":LANG("投放日期"),"type":"date","mode":"spop","render":"batchRender"}
                        ,{"text":LANG("日程设置"),"type":"time","mode":"pop","render":"batchRender"}
                        ,{"text":LANG("投放地区"),"type":"zone","mode":"lpop","render":"batchRender"}
                        ,{"text":LANG("客户端"),"type":"client","mode":"lpop","render":"batchRender"}
                        ,{"text":LANG("修改出价"),"type":"price","mode":"lpop","render":"batchRender"}
                        ,{"text":LANG("活动名称关键词替换"),"type":"keywordReplace","mode":"pop","render":"batchRender"}
                    ]
                    }
                    ,{
                        "type":"disabled"
                        ,"text":LANG("暂停")
                    }
                    ,{
                        "type":"enable"
                        ,"text":LANG("开始")
                    }
                    ,{
                        "type":"store"
                        ,"text":LANG("归档")
                    }
                    ,{
                        "type":"recovery"
                        ,"text":LANG("还原")
                    }
                    ,{
                        "type":"export"
                        ,"text":LANG("下载")
                    }
                ]
            },
            'updateGlobal': false
        }, config);
        if(tmp && tmp[0] === true){
            // 有自定义的话再覆盖回去……
            config.cols = tmp.slice(1);
        }
        if (config.is_sub_grid){
            switch(_parseSubs(config.sub_param).pop()){
                case 'platform':
                case 'spot':
                    delete config.tab.cols.bid;
                    break;
                default:
                    config.tab.cols.bid = null;
                    break;
            }
            delete config.tab.cols['default'];
        }

        this.progressDetailWin = null;
        this.gridType = 'campaign';

        this.$updatePrice = null;

        Campaign.master(this, null, config);
    }
    extend(Campaign, Base, {
        init:function(){
            Campaign.master(this,"init");
            // 绑定弹出详情框事件
            this.dg(this.el, ".M-grid-progressOuterBox", "click", 'showProgressDetail');
            this.dg(this.el,".M-formValueEditor","mouseenter mouseleave","showPriceWarn");
        }
        /**
         * 批量操作弹出层渲染函数
         * @param  {Object} conf 弹出层设置
         * @param  {Object} body 弹出层内容区域dom对象
         * @return {Object}      添加后的模块外部容器dom对象
         */
        ,batchRender:function(conf,body){
            var re;
            switch(conf.type){
                case "frequency":
                    re = this.create(
                        conf.type
                        ,FREQUENCY
                        ,{
                            "target":body
                        }
                    );
                    break;

                case "bidSpeed":
                    re = this.create(
                        conf.type
                        ,form.bidSpeed
                        ,{
                            "label":LANG('投放速度')
                            ,"target":body
                        }
                    );
                    break;

                case "character":
                    re = this.create(
                        conf.type
                        ,PDMP
                        ,{
                            "label":LANG('人群选择')
                            ,"target":body
                            ,"width":265
                        }
                    );
                    break;

                case "date":
                    re = this.create(
                        conf.type
                        ,form.dateRange
                        ,{
                            "label":LANG('投放日期')
                            ,"target":body
                            ,"start":util.date('Y-m-d')
                        }
                    );
                    break;

                case "time":
                    re = this.create(
                        conf.type
                        ,form.schedule
                        ,{
                            "label":LANG('日程设置')
                            ,"target":body
                        }
                    );
                    break;

                case "zone":
                    re = this.create(
                        conf.type
                        ,form.zone
                        ,{
                            "label":LANG('投放地区')
                            ,"target":body
                        }
                    );
                    break;

                case "client":
                    re = this.create(
                        conf.type
                        ,form.client
                        ,{
                            "label":LANG('客户端')
                            ,"target":body
                        }
                    );
                    break;

                case "price":
                    re = this.create(
                        conf.type
                        ,form.newPrice
                        ,{
                            "label":LANG('')
                            ,"target":body
                        }
                    );
                    break;
                case "keywordReplace":
                    re = this.create(
                        conf.type
                        ,form.keywordReplace
                        ,{
                            "label":LANG('关键字替换')
                            ,"target":body
                        }
                    );
                    break;
            }

            return re.el;
        }
        ,showProgressDetail:function(evt, elm){
            // 创建弹出窗口
            var win = this.progressDetailWin;
            if (!win){
                win = this.progressDetailWin = this.create("progressDetailWin", popwin.progressDetail);
                this.$progressShowId = 0;
            }
            elm = $(elm);
            var id = +elm.attr('data-id');
            if (id){
                if (this.$progressShowId === id){
                    if (win.isShow){
                        win.hide();
                    }else {
                        win.show(elm);
                    }
                }else {
                    this.$progressShowId = id;
                    win.load({'Id': id}).show(elm);
                }
                return false;
            }
        }
        /**
         * 价格预警提示
         * @param  {Object}    ev 鼠标事件对象
         * @return {Undefined}    无返回值
         */
        ,showPriceWarn:function(ev){
            var tag = $(ev.target).closest(".M-formValueEditor");
            if(!tag.hasClass("red")){
                return;
            }
            tag = this.$[tag.attr("data-name")];
            if(ev.type === "mouseleave"){
                tag.hideMessage();
                return;
            }
            tag.showMessage(LANG("出价过低"));
        }
        /**
         * @deprecated 暂时放弃
         */
        ,renderName: function(index, val, row, config, table){
            var rs = row.RunStatus, title;
            // var con = $('<div class="M-gridCampaignIndexCon"/>');
            var cell = $('<span/>').text(val);

            if(config.width){
                cell.width(config.width).attr("title",val).addClass("M-tableListWidthLimit");
            }
            if (rs >=1 && rs <= 5){
                switch(rs){
                    case 1:
                        title = LANG("未开始");
                        break;
                    case 2:
                        title = LANG("进行中");
                        break;
                    case 3:
                        title = LANG("已结束");
                        break;
                    case 4:
                        title = LANG("已暂停");
                        break;
                    case 5:
                        title = LANG("超预算");
                        break;
                }
                cell.prepend('<i class="M-gridCampaign S' + rs +'" title="'+ title +'"/>');
            }

            return cell;
        }
        ,renderTopPrice: function(index,val,row,col,td,table){
            var up = this.$updatePrice;
            if (this.config.updateGlobal && !up){
                _setGlobalStore('all', row);
            }

            var name = 'editor'+index
                ,mod = this.get(name)
                ,id = row[this.config.sub_field]
                ,span = td.children('.text:first')
                ,is_agent = (row.Channel == 2)
                ,value = (!row.WardenStatus ? val : row.TargetCpa);

            if (!span.length){
                span = $('<span class="text"/>').appendTo(td);
            }
            span.text(is_agent ? '-' : labels.format.currency(value));

            // 判断出价过低
            // 是RTB活动, 正在投放, 有竞价数, 没有竞得数
            var isLow = (!is_agent && row.RunStatus == 2 && row.request_num > 0 && row.win_num <= 0);
            if(isLow){
                span.addClass("red");
            }

            // 判断用户权限
            var user = app.getUser();
            if (user && user.auth <= 1){
                // 只读权限
                span.show();
                if (mod){ mod.hide(); }
                return td.removeAttr('data-ctype');
            }

            var cls =  isLow ? "M-formValueEditor red":"M-formValueEditor";
            if (mod){
                if (is_agent){
                    mod.hide();
                    span.show();
                }else {
                    mod.show();
                    span.hide();
                    mod.el.attr("class", cls);
                }
                if (id != mod.getParam()){
                    mod.setParam(id);
                }
                if (!mod.isEditing()){
                    mod.setData(value).setType(row.WardenStatus);
                }
            }else {
                if (!is_agent){
                    mod = this.create(
                        name
                        ,priceModity.valueEditor
                        ,{
                            "target":td
                            ,"data":value
                            ,"param":id
                            ,"prefix":"￥"
                            ,'suffix':LANG('元')
                            ,"width":95
                            ,"step":0.5
                            // 没竞得率则需要高亮提示
                            ,"class":cls
                            ,"type": row.WardenStatus //0.关闭，1.使用CPA自动优化，2.使用CPC自动优化
                        }
                    );
                    this.$[name].el.attr("data-name",name);
                    span.hide();
                }
            }
            if (!is_agent && mod && up && id && id == up.id){
                up.id = 0;
                if (up.error){
                    mod.setData(up.price).setType(row.WardenStatus).showMessage(up.error, 'error');
                }else {
                    row.TopPrice = up.price;
                    mod.setData(up.price).setType(row.WardenStatus);
                    mod.showMessage(LANG('修改成功'));
                }
            }
            return td.attr('data-ctype', 'noclick');
        }
        // 修改出价事件
        ,onValueChange: function(ev){
            var id = ev.param.param;
            var value = ev.param.value;
            if (value <= 0){
                ev.from.showMessage(LANG('价格必须为一个正数'));
            }else {
                app.data.get(
                    this.config.priceUrl,
                    {
                        CampaignId: id,
                        Price: value
                    },
                    this, 'afterChangePrice',
                    {
                        'mod':ev.from,
                        'id':id,
                        'price':value,
                        'last':ev.param.last
                    }
                );
            }
            return false;
        }
        ,afterChangePrice: function(err, data, param){
            if (err){
                this.$updatePrice = {
                    'id': param.id,
                    'price': param.last,
                    'error': err.message || LANG('服务器错误')
                };
                app.error(err);
            }else {
                this.$updatePrice = {
                    'id': param.id,
                    'price': param.price
                };
                _setGlobalStore('price', {
                    Id: param.id,
                    TopPrice: param.price
                });
            }
            this.updateColumnByName('top_price');
            this.$updatePrice = null;
        }
        ,subFilter: function(subs, data, ctrl){
            util.each(subs, function(sub){
                if (sub.type === 'sweety'){
                    sub.iconBtn.toggle(data.AdType != 2);
                }
                // 若为代理活动
                // 媒体和广告位
                if(sub.type === 'mediaAndAd'){
                    sub.iconBtn.toggle(data.Channel == 2);
                }
                // 时段分析
                if(sub.type === 'periodAgent'){
                    sub.iconBtn.toggle(data.Channel == 2);
                }

                // 若为RTB活动
                //// 媒体和广告位，显示有启用/暂停功能的
                if(sub.type === 'mediaAndAdCampaign'){
                    sub.iconBtn.toggle(data.Channel == 1 || data.Channel == 4);
                }
                // 时段分析
                if(sub.type === 'period'){
                    sub.iconBtn.toggle(data.Channel == 1 || data.Channel == 4);
                }

                //暂无直投
            });
        },
        onSwitchPage: function(){
            var win = this.progressDetailWin;
            if (win){
                win.hide();
            }
        },
        /**
         * 渲染活动列名称
         */
        renderColName: function(i, val, data, con){
            var dom = $('<a class="M-tableListWidthLimit" href="#campaign/more/'+data._id+'" target="_blank"/>');
            if (val === ''){
                val = LANG("其他");
                dom.addClass('ti');
            }else if (val === null){
                val = LANG('(空)');
                dom.addClass('tdef');
            }
            return dom.text(val).width(con.width).attr("title",val);
        }
        /**
         * 批量更新活动
         * @param  {Object} param 请求参数
         * @return {Object}       模块实例
         */
        ,batchUpdateCampaign:function(param){
            app.data.put(
                "/rest/updatecampaign"
                ,param
                ,this
                ,"onBatchCallback"
            );
            return this;
        }
        /**
         * 确认批量操作
         * @param  {Object} ev 消息对象
         * @return {Bool}      false
         */
        ,onBatchConfirm:function(ev){
            var type = ev.param.type
                ,data = ev.param.data;

            if(data.length){
                var param = {"Ids":data}
                    ,tmp = this.$[type] && this.$[type].getData && this.$[type].getData();
                switch(type){
                    case "frequency":
                        param = $.extend(param,tmp);
                        this.batchUpdateCampaign(param);
                        break;

                    case "bidSpeed":
                        param = $.extend(param,tmp);
                        this.batchUpdateCampaign(param);
                        break;

                    case "character":
                        param.Character = tmp;
                        this.batchUpdateCampaign(param);
                        break;

                    case "date":
                        param.StartTime = util.date('Ymd', tmp.start);
                        param.EndTime = tmp.end && util.date('Ymd', tmp.end) || 0;
                        this.batchUpdateCampaign(param);
                        break;

                    case "time":
                        param.TimeSet = tmp;
                        this.batchUpdateCampaign(param);
                        break;

                    case "zone":
                        param.Zone = tmp;
                        this.batchUpdateCampaign(param);
                        break;

                    case "price":
                        console.log(tmp);
                        if(tmp && (!util.isNumber(+tmp.TopPrice) || tmp.TopPrice < 0)){
                            app.alert(LANG('最高出价必须为一个大于零的数字'));
                            return false;
                        }
                        if(!tmp.WardenStatus && ( !util.isNumber(tmp.ChargePrice) || tmp.ChargePrice < 0 ) ){
                            app.alert(LANG('最高出价必须为一个大于零的数字'));
                            return false;
                        }
                        if((tmp.WardenStatus == 1 || tmp.WardenStatus == 2) && tmp.TargetCpa <= 0 ){
                            if ( tmp.WardenStatus == 1 ) {
                                app.alert(LANG('请输入一个有效的CAP单价'));
                            } else {
                                app.alert(LANG('请输入一个有效的CPC单价'));
                            }
                            return false;
                        }
                        if((tmp.WardenStatus == 1 || tmp.WardenStatus == 2) && tmp.TargetCpa >= 10000){
                            app.alert(LANG('出价不得超过9999.99元'));
                            return false;
                        }
                        if(!tmp.WardenStatus && tmp.ChargePrice >= 10000){
                            app.alert(LANG('出价不得超过9999.99元'));
                            return false;
                        }
                    /* falls through */
                    case "client":
                    case "keywordReplace":
                        param = $.extend(param,tmp);
                        this.batchUpdateCampaign(param);
                        break;

                    case "disabled":
                        app.data.get(
                            "/rest/stopcampaign"
                            ,{
                                "Status":2
                                ,"Ids":data.toString()
                            }
                            ,this
                            ,"onBatchCallback"
                        );
                        break;

                    case "enable":
                        app.data.get(
                            "/rest/stopcampaign"
                            ,{
                                "Status":1
                                ,"Ids":data.toString()
                            }
                            ,this
                            ,"onBatchCallback"
                        );
                        break;

                    case "store":
                        app.data.get(
                            "/rest/deletecampaign"
                            ,{
                                "Ids":data.toString()
                            }
                            ,this
                            ,"onBatchCallback"
                        );
                        break;

                    case "recovery":
                        app.data.get(
                            "/rest/recyclecampaign"
                            ,{
                                "Ids":data.toString()
                            }
                            ,this
                            ,"onBatchCallback"
                        );
                        break;

                    case "export":
                        var url = app.data.resolve("/rest/listcampaigngo", {
                            "Ids":data.toString()
                            ,"begindate":this.sys_param.begindate
                            ,"enddate":this.sys_param.enddate
                            ,"order":this.sys_param.order
                            ,"tmpl":"export"
                        });
                        if (url){
                            window.location.href = url;
                        }
                        break;
                }
                param = tmp = null;
            }else{
                app.alert(LANG("请先选择一个或多个活动。"));
            }

            this.resetModule(type);
            return false;
        }
        /**
         * 取消批量操作
         * @param  {Object} ev 消息对象
         * @return {Bool}      false
         */
        ,onBatchCancel:function(ev){
            this.setSelectRowIds([]);
            this.resetModule(ev.param.type);
            ev = null;
            return false;
        }
        /**
         * 尝试重置指定的模块
         * @param  {String} type 模块名称
         * @return {Object}      模块实例
         */
        ,resetModule:function(type){
            if(this.$[type] && this.$[type].reset){
                this.$[type].reset();
            }
            return this;
        }
        /**
         * 批量操作请求成功后的回调函数
         * @param  {Object}    err  错误信息对象
         * @param  {Object}    data 操作结果数据对象
         * @return {Undefined}      无返回值
         */
        ,onBatchCallback:function(err,data){
            if(err){
                alert(err.message);
                return;
            }
            var msg;
            if(data.fail.length){
                data = data.fail;
                msg = LANG("%1个活动处理失败\n",data.length);
                for(var i = 0,l = data.length;i<l;i++){
                    msg += data[i].Id+","+data[i].message+"\n";
                }
                app.alert(msg);
            }else{
                app.alert(LANG('修改成功'));
            }


            this.setSelectRowIds([]);
            this.load();

            // 修改后，改变行为绿色
            if(data && data.success && data.success.length){
                util.each(data.success, function(item, idx){
                    if(item){
                        this.setRowHighlight(item.Id);
                    }
                }, this);

            }
            msg = data = null;
        }
    });
    exports.campaign = Campaign;

    /**
     * 时段数据二级表格容器
     */
    function Period(config, parent){
        config = $.extend({
            'target': config.target,
            'class': config['class'] || 'M-gridPeriodContainer',
            'url': config.url || '/rest/trend',
            'param': {
                'type': parent.gridType,
                'no_limit': 1,
                'condition': config.sub_param
            },
            'table_size': 20,
            'mode': 1,
            'viewtb': 0,
            // 'subs': ['mediaAndAdCampaign','sweetyCampaign','whiskyCampaign','comp','geo','client','productAndPlatform','platform'],
            'subGridParam': config['is_sub_grid'] ? {
                is_sub_grid: config['is_sub_grid'],
                sub_data: config['sub_data'],
                sub_exname: config['sub_exname'],
                sub_id: config['sub_id'],
                sub_param: config['sub_param'],
                sub_param_ex: config['sub_param_ex'],
                sub_static: config['sub_static']
            }: ''
        }, config);
        Period.master(this, null, config);

        // 处理时间段
        var c = this.config;
        var param = parent.sys_param;
        if (param.stastic_all_time){
            c.param.stastic_all_time = 1;
        }else {
            c.param.begindate = param.begindate;
            c.param.enddate = param.enddate;
        }
        this.$data = null;
        this.$mode = c.mode;
        this.$dirty = {};
    }
    extend(Period, view.container, {
        init: function(){
            this.render();
            // 右边切换时间段
            this.create('time', common.timeRange, {'class': 'fr'});
            // 左边模式切换
            this.create('mode', common.buttonGroup, {
                items: [LANG('图'), LANG('表')],
                selected: this.$mode
            });
            // 容器
            var doms = this.doms = {};
            doms.chart = $('<div class="M-gridPeriodChart" />').appendTo(this.el);
            doms.table = $('<div class="M-gridPeriodTable" />').appendTo(this.el);

            // 获取初始化数据
            this.$viewtb = this.config.param.viewtb = this.$.time.getData();
            // 加载数据
            this.load();
        },
        /**
         * 显示数据加载中
         * @return {None} 无返回
         */
        showLoading: function(){
            if (this.$.loading){
                this.$.loading.show();
            }else {
                this.create('loading', common.loadingMask, {target: this.el});
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
        },
        /**
         * 切换显示模式 (图表/表格)
         */
        switchMode: function(mode){
            if (mode){
                this.$mode = parseInt(mode, 10);
            }
            mode = this.$mode;
            var doms = this.doms;
            doms.chart.toggle(mode === 0);
            doms.table.toggle(mode === 1);

            // 创建子模块
            if (mode === 0){
                this.buildChart();
            }else {
                this.buildTable();
            }
        },
        // 如果表格重写了load方法，手动刷新的时候就调用该方法重新加载
        onLoad: function(ev){
            this.load();
            return false;
        },
        /**
         * 加载数据
         */
        load: function(param){
            var c = this.config;
            if (param){
                util.merge(c.param, param);
            }
            if (param !== false){ this.showLoading(); }
            app.data.get(c.url, $.extend({}, c.sub_param_ex, c.param), this);
        },
        /**
         * 加载数据回调函数
         */
        onData: function(err, data){
            // 子表格刷新按钮复原样式
            this.el.find('.refing').removeClass("refing").addClass("refNormal");

            this.hideLoading();
            if (err){
                this.setData([]);
                return false;
            }

            // 保存数据
            this.setData(data.items);
        },
        /**
         * 设置数据
         * @param {Array} data 数据记录数组
         */
        setData: function(data){
            this.$data = data;
            this.$dirty.table = 1;
            this.$dirty.chart = 1;
            this.switchMode();
        },
        /**
         * 构建表格
         */
        buildTable: function(){
            var c = this.config;
            if (!this.$.table){
                var param = {
                    target: this.doms.table,
                    viewtb: this.$viewtb, // 时段分析时间粒度当前值
                    subs: c.subs // subgrid配置
                    //,url: c.url // subgrid要传url配置才能够实现排序点击
                    //,param: c.param // 也要传参
                }
                // subgrid参数
                if(c.subGridParam){
                    param = $.extend({}, c.subGridParam,param);
                }

                this.create('table', PeriodGrid, param);

                //下载excel表格按钮
                this.create('export', common.excelExport,{
                    target: this.$.table.getLayout('excel')
                }).hide();

                this.create('pager', common.pager, {
                    showSizeTypes: 0,
                    target: this.doms.table
                });
            }
            if (this.$dirty.table){
                this.$dirty.table = 0;
                // 处理分页
                var tab = this.$.table;
                var data = this.$data;
                var size = this.config.table_size;
                var list = [];
                if (this.$viewtb && data.length > size){
                    this.$.pager.show();
                    this.$.pager.setup({
                        'page': 1,
                        'size': size,
                        'total': data.length
                    });
                    util.each(data, function(item, index){
                        if (index < size){
                            list.push(item);
                        }else {
                            return false;
                        }
                    });
                }else {
                    this.$.pager.hide();
                    list = data;
                }
                tab.setData(list);
            }
        },
        /**
         * 构建图表
         */
        buildChart: function(){
            if (!this.$.chart){
                return app.loadModule('chart.line', this.createChart, this);
            }
            if (this.$dirty.chart){
                this.$dirty.chart = 0;
                var chart = this.$.chart;
                chart.setData(this.$data);
                chart.toggleSeries(0, true);
                chart.toggleSeries(1, true);
                chart.toggleSeries(2, true);
                chart.toggleSeries(3, false);
                chart.toggleSeries(4, false);
                chart.toggleSeries(5, false);
                chart.toggleSeries(6, false);
                chart.toggleSeries(7, false);
                chart.toggleSeries(8, false);
            }
        },
        /**
         * 创建图表实例
         */
        createChart: function(chart){
            var con = this.doms.chart;
            this.create('chart', chart, {
                'height': 400,
                'width': con.width(),
                'target': con,
                'build': {
                    xAxis: {
                        labels: {
                            step:1,
                            rotation: -25,
                            align: 'right'
                        }
                    },
                    yAxis: [
                        {opposite: false, min:0/*, title:{text:LANG('展示量 / 点击量 / 注册量')}*/},
                        {opposite: false, min:0, title:{text:LANG('展示量 / 点击量 / 注册量')}},
                        {opposite: true, min:0/*, title:{text:LANG('点击率')}*/},
                        {opposite: true, min:0, title:{text:LANG('比率(%) / 价格(RMB)')}}
                    ]
                },
                'series':[
                    {y_field:'impressions', label_field:'trend_key', text:LANG('展示量'), y_axis:0},
                    {y_field:'clicks', label_field:'trend_key', text:LANG('点击量'), y_axis:1},
                    {y_field:'back_regs', label_field:'trend_key', text:LANG('注册量'), y_axis:1},
                    {y_field:'click_rate', label_field:'trend_key', text:LANG('点击率(%)'), y_axis:2, y_format:this.formatRate},
                    {y_field:'back_reg_rate', label_field:'trend_key', text:LANG('注册率(%)'), y_axis:2, y_format:this.formatRate},
                    {y_field:'avg_reg_cost', label_field:'trend_key', text:LANG('注册单价'), y_axis:3, y_format:this.formatCurrency},
                    {y_field:'cpm', label_field:'trend_key', text:LANG('CPM单价'), y_axis:3, y_format:this.formatCurrency},
                    {y_field:'avg_click_cost', label_field:'trend_key', text:LANG('点击单价'), y_axis:3, y_format:this.formatCurrency},
                    {y_field:'back_reach_cost', label_field:'trend_key', text:LANG('到达单价'), y_axis:3, y_format:this.formatCurrency}
                ]
            });
            this.buildChart();
        },
        formatRate: function(val){
            return util.toFixed(val * 100, 3);
        },
        formatCurrency: function(val){
            return util.toFixed(val, 3);
        },
        // 导出按钮导出事件
        onExcelExport: function(ev){
            var c = this.config;
            ev.returnValue = app.data.resolve(c.url, c.param) + '&tmpl=export';
            return false;
        },
        /**
         * 切换模式
         */
        onChangeButton: function(ev){
            this.switchMode(ev.param.selected);
            return false;
        },
        /**
         * 切换时间粒度
         */
        onChangeTimeRange: function(ev){
            if(ev.from !== this){
                this.$viewtb = +ev.param.selected || 0;
                this.load({'viewtb': this.$viewtb});
                this.cast('changeTimeRange',this.$viewtb);
                return false;
            }
        },
        /**
         * 时间改变的响应函数
         * @param  {Object}  ev 消息对象
         * @return {Boolean}    阻止广播
         */
        onChangeDate:function(ev){
            var param = ev.param;
            if (param.stastic_all_time){
                param = {
                    stastic_all_time: 1,
                    begindate: null,
                    enddate: null
                };
            }else {
                param = {
                    stastic_all_time: null,
                    begindate: param.nowTimestamp.begin,
                    enddate: param.nowTimestamp.end
                };
            }
            this.$viewtb = this.config.param.viewtb = this.$.time.updateState(param);
            this.load(param);
            return false;
        },
        // 子表格更新事件
        onUpdateSubGrid: function(ev){
            this.$viewtb = this.config.param.viewtb = this.$.time.computSelected();
            this.load({condition: ev.param.sub_param});
            return false;
        },
        // 自动刷新
        onAutoRefresh: function(ev){
            this.load(false);
            return false;
        },
        // 响应表格分页切换事件
        onChangePage: function(ev){
            var size = this.config.table_size;
            var data = this.$data;
            var idx = (ev.param - 1) * size;
            var last = Math.min(data.length, idx + size);
            var list = [];

            for (;idx<last; idx++){
                list.push(data[idx]);
            }
            this.$.table.setData(list);
            return false;
        }
    });
    exports.period = Period;

    // 时段分析subgrid -代理
    var PeriodAgent = app.extend(Period, {
        init: function(config, parent){
            config = $.extend({
                subs: ['mediaAndAd','sweetyCampaign','whiskyCampaign','comp','geo','client','productAndPlatform','platform']
            }, config);

            PeriodAgent.master(this, null, config);
            PeriodAgent.master(this, 'init', arguments);
        }
    });
    exports.periodAgent = PeriodAgent;

    // 汇总-时段分析subgrid
    var PeriodCollect = app.extend(Period, {
        init: function(config, parent){
            config = $.extend({

            }, config);

            PeriodCollect.master(this, null, config);
            PeriodCollect.master(this, 'init', arguments);
        },
        buildTable: function(){
            var c = this.config;
            if (!this.$.table){
                var param = {
                    target: this.doms.table,
                    viewtb: this.$viewtb, // 时段分析时间粒度当前值
                    subs: c.subs // subgrid配置
                }
                // subgrid参数
                if(c.subGridParam){
                    param = $.extend({}, c.subGridParam,param);
                }
                param.tab = {
                    'cols':{
                        'bid': [null, 'request_num'],
                        'cost': [
                            true
                            ,'avg_click_cost'
                            ,'cpm'
                            ,'avg_reg_cost'
                            ,'back_reach_cost'
                            //,'cost'
                            ,'show_cost'
                            ,'show_cost_over'
                            ,'show_cost_over2'
                        ]
                    } // 活动
                };
                this.create('table', PeriodGrid, param);

                //下载excel表格按钮
                this.create('export', common.excelExport,{
                    target: this.$.table.getLayout('excel')
                }).hide();

                this.create('pager', common.pager, {
                    showSizeTypes: 0,
                    target: this.doms.table
                });
            }
            if (this.$dirty.table){
                this.$dirty.table = 0;
                // 处理分页
                var tab = this.$.table;
                var data = this.$data;
                var size = this.config.table_size;
                var list = [];
                if (this.$viewtb && data.length > size){
                    this.$.pager.show();
                    this.$.pager.setup({
                        'page': 1,
                        'size': size,
                        'total': data.length
                    });
                    util.each(data, function(item, index){
                        if (index < size){
                            list.push(item);
                        }else {
                            return false;
                        }
                    });
                }else {
                    this.$.pager.hide();
                    list = data;
                }
                tab.setData(list);
            }
        }
    });
    exports.periodCollect = PeriodCollect;

    /**
     * 时段分析数据表格
     */
    function PeriodGrid(config, parent){
        config = $.extend(true, {
            "hasAmount": false,
            "hasSearch": false,
            "hasExport": true,
            "hasPager": false,
            'sub_gen_url': false,
            "cols":[
                {type:"id"}
                ,{name:"trend_key",type:"index",text:LANG("时间")}
            ],
            'tab':{
                'cols':{
                    'bid': [null, 'request_num'],
                    'cost': [
                        true
                        ,'avg_click_cost'
                        ,'cpm'
                        ,'avg_reg_cost'
                        ,'back_reach_cost'
                        ,'cost'
                        // ,'show_cost'
                        // ,'show_cost_over'
                        // ,'show_cost_over2'
                    ]
                } // 活动
            }
        }, config);

        if (config.is_sub_grid){
            var subgridType = _parseSubs(config.sub_param).pop();
            switch(subgridType){
                case 'spot':
                case 'medium':
                    $.extend(true, config, {
                        'tab':{'cols':{'cost': null}}
                    });
                    break;
                case 'whisky':
                    $.extend(true, config, {
                        'tab':{'cols':{'cost': null, 'creative': null}}
                    });
                    break;
            }
            // 特殊处理 ：只有活动下的时段分析子表格才有subgrid
            if(subgridType != 'campaign'){
                delete config['is_sub_grid'];
                delete config.subs;
            }
        }

        PeriodGrid.master(this, null, config);
        this.config.originalData = config.originalData;

        this.gridType = 'period';
        // this.subGridType = 'spot';
        this.gridRowName = 'trend_key';
    }
    extend(PeriodGrid, Base,{
        getSubParam: function(param){
            var c = this.config;
            var sub_param = c.sub_param || '';
            this.$viewtb = (this.$viewtb === undefined) ? c.viewtb : this.$viewtb;

            // 根据返回的time_id,按照hour,date,week,month 装成condition返回
            var trans = ['hour', 'date', 'week', 'month'];
            sub_param += (sub_param && ',') + (trans[this.$viewtb])  + '|' + param.data['time_id'];
            return sub_param;
        },
        // 时段分析时间粒度变化事件
        onChangeTimeRange: function(ev){
            this.$viewtb = +ev.param || 0;
            // 设置时间粒度参数
            this.sys_param.viewtb = this.$viewtb;
            return false;
        }
    });
    exports.periodGrid = PeriodGrid;

    /**
     * 获取产品数据下面的创意/落地页id
     * @param  {Array} products 产品数据
     * @param  {string} field    创意或落地页数据下标
     * @return {array}          id数组
     */
    function _getActiveIds(products,field){
        var arr = [];
        util.each(products,function(product){
            util.each(product,function(){
                util.each(product[field],function(item){
                    arr.push(item.Id);
                })
            })
        })
        return arr;
    }
    //状态判定，没有对应数据返回true
    function _getStatus(data){
        var flag = false,_id = +data._id,cur;
        cur = util.find(this.activeIds,_id);
        if(cur===null){
            flag = true;
        }
        return flag;
    }

    /**
     * 创意包列表
     */
    function Sweety(config){
        config = $.extend({
            'cols':[
                // {type:'id'},
                {name:"_id",type:'fixed',sort:true,align:'center'},
                'SweetyNameWithThumb'
                // {name:'verifyStatus', text:LANG("审核状态"),render:"renderVerifyStatus", type:'index'},
                // {name:'Status', align:'center', type:'dim'}
            ],
            'tab':{
                cols:{'bid':null} // 活动
            },
            // 二级表单
            'subs': ['sweetyCreative','whisky','mediaAndAd','period','comp','geo','client','campaign','productAndPlatform','platform'],
            // 远程服务器数据点
            'url': '/rest/listsweety'
            ,'exclude_cols':['win_rate']
        }, config);

        if (config.is_sub_grid){
            switch(_parseSubs(config.sub_param).pop()){
                case 'medium':
                    delete config.tab.cols.bid;
                    break;
                case 'whisky':
                    $.extend(true, config, {
                        'tab':{'cols':{'cost': null, 'creative': null}}
                    });
                    break;
            }
        }

        Sweety.master(this, null, config);
        this.gridType = 'package';
    }
    extend(Sweety, Base,{
        init:function(){
            Sweety.master(this,"init");
            //绑定事件-预览大图
            this.dg(this.el, '.M-grid-thumb img', 'mouseenter mouseleave imageLoad imageError', 'showPreviewImage');

        }
        ,onAddSweetySuccess:_reloadGrid
        ,onEditSweetySuccess:_reloadGrid
        ,showPreviewImage:_showPreviewImage
        //创建审核状态的icon
        ,renderVerifyStatus:function(i,val,row,con){
            var elm = $('<a class="G-icon rtbPosVerify"/>');
            elm.attr('title', LANG("点击查看"));
            elm.attr('href', '#/creative/creativeVerifyList/'+row._id);
            return elm;
        }
        /**
         * 详情按钮响应函数
         * @param  {Object}  ev 消息对象
         * @return {Boolean}    阻止冒泡
         */
        ,onSubFunction:function(ev){
            if(ev.param.type === "detail"){
                window.open(window.location.href.split('#',1)+"#/creative/detail/"+ev.param.data._id,"SweetyDetailWindow");
            }
            return false;
        }
        ,onData:function(err, data, param){
            Sweety.master(this,'onData',[err, data, param]);
            if(this.config.is_sub_grid){
                //this.pauseRowsHandle();
            }
        }
        ,pauseRowsHandle:function(){
            var data = this.getData(),list = this.list;
            util.each(data,function(item,index){
                if(item.Status ===2){
                    var row = list.rows[index];
                    if(row){
                        row.find('.M-grid-thumb').css('text-decoration','line-through');
                    }
                }
            })
        }
    });
    exports.sweety = Sweety;

    //subgrid状态的创意包
    var SweetyCampaign = app.extend(Sweety,{
        init:function(config){
            config = $.extend({
                'cols':[
                    {name:"_id",type:'fixed',sort:true,align:'center'},
                    {name:'status', text:LANG("状态"), align:'center',render:'renderStatus', type:'fixed'},
                    'SweetyNameWithThumb'
                ]
            }, config);
            SweetyCampaign.master(this,null,config);
            SweetyCampaign.master(this,'init');
            this.$parent_row = this.config.sub_data || [];
            this.activeIds = this.getActiveIds(this.$parent_row.Products,'Sweetys');
        }
        ,renderName:function(i,val,row,con,td){
            $(td).closest('tr').toggleClass('M-gridDeleted', this.getStatus(row));
            return SweetyCampaign.master(this, 'renderName');
        }
        ,renderStatus:function(i, val, data, con){
            var text = (+data.Status == 1) ? LANG('已开启'): LANG('已暂停');
            var className = (+data.Status == 1) ? 'runing': 'suspend';
            return '<div class="G-iconFunc '+className+'" title="'+text+'">';
        }
        ,getActiveIds:_getActiveIds
        ,getStatus:_getStatus
    });
    exports.sweetyCampaign = SweetyCampaign;


    /**
     * 落地页列表
     */
    function Whisky(config){
        config = $.extend({
            'cols':[
                {name:"_id",type:'fixed',sort:true,align:'center'},
                'WhiskyNameWithThumb',
                // {name:'Name',text:LANG("落地页"),type:'index',render:"renderName",width:210},
                {name:'Status', align:'center', type:'dim'}
            ],
            "tab":{
                "cols": {
                    'default':[
                        true
                        ,"back_pageviews"
                        ,"back_click"
                        ,"back_click_rate"
                        ,"back_regs"
                        ,"back_reg_rate"
                        ,"back_logins"
                        ,"back_login_rate"
                        ,"back_avg_loadtime"
                        ,"back_avg_staytime"
                        ,"back_avg_pagepixels"
                    ],
                    'creative':null,
                    'cost':null,
                    'bid':null,
                    'transform':[
                        true
                        ,"back_regs"
                        ,"back_reg_rate"
                        ,"back_logins"
                        ,"back_login_rate"
                    ]
                }
            },
            // 二级表单
            'subs':  ['sweety','mediaAndAd','period','geo','client','campaign','productAndPlatform','platform'],
            // 远程服务器数据点
            'url': '/rest/listwhiskycreative'
            ,'sort': {'back_pageviews':'desc', 'clicks':'desc'}
        }, config);
        Whisky.master(this, null, config);
        this.gridType = 'whisky';
    }
    extend(Whisky, Base, {
        init:function(){
            Whisky.master(this,"init");
            //绑定事件-预览大图
            this.dg(this.el, '.M-grid-thumb img', 'mouseenter mouseleave imageLoad imageError', 'showPreviewImage');
        }
        ,showPreviewImage:_showPreviewImage
        /**
         * 详情按钮响应函数
         * @param  {Object}  ev 消息对象
         * @return {Boolean}    阻止冒泡
         */
        ,onSubFunction:function(ev){
            if(ev.param.type === "detail"){
                window.open(window.location.href.split('#',1)+"#/whisky/detail/"+ev.param.data._id,"WhiskyDetailWindow");
            }
            return false;
        }
        ,onData:function(err, data, param){
            Whisky.master(this,'onData',[err, data, param]);
            if(this.config.is_sub_grid){
                //this.pauseRowsHandle();
            }
        }
        ,pauseRowsHandle:function(){
            var data = this.getData(),list = this.list;
            util.each(data,function(item,index){
                if(item.Status ===2){
                    var row = list.rows[index];
                    if(row){
                        row.find('.M-grid-thumb').css('text-decoration','line-through');
                    }
                }
            })
        }
    });
    exports.whisky = Whisky;
    //subgrid状态的落地页
    var WhiskyCampaign = app.extend(Whisky,{
        init:function(config){
            WhiskyCampaign.master(this,null,config);
            WhiskyCampaign.master(this,'init');
            this.$parent_row = this.config.sub_data || [];
            this.activeIds = this.getActiveIds(this.$parent_row.Products,'WhiskyCreatives');
        }
        ,renderName:function(i,val,row,con,td){
            $(td).closest('tr').toggleClass('M-gridDeleted', this.getStatus(row));
            return WhiskyCampaign.master(this, 'renderName');
        }
        ,getActiveIds:_getActiveIds
        ,getStatus:_getStatus
    })
    exports.whiskyCampaign = WhiskyCampaign;
    /**
     * 前端创意列表
     */
    function SweetyCreative(config){
        config = $.extend({
            'cols':[
                {name:"_id",type:'fixed',sort:true,align:'center'},
                {name:'CreativeNameWithThumb',width:300,context:this},
                {name:'verifyStatus', text:LANG("审核状态"),render:"renderVerifyStatus", type:'index', align:'center'},
                {name:"Duration",text:LANG('时长'),sort:false,type:'fixed',align:'right', render:'renderDuration'}
            ]
            ,'tab':{'cols': {'bid': null}}
            ,"url":"/rest/listsweetycreative"
            ,"subs":['campaign','productAndPlatform','platform','period','geo','client','comp']
        },config);

        //去除创意包subgrid里面的审核状态
        if(config.is_sub_grid){
            config.cols.splice(2,1);
        }
        SweetyCreative.master(this, null, config);

        this.gridType = 'creative';
        //创意包的审核结果集合
        this.verifyResults = [];
    }
    extend(
        SweetyCreative
        ,Sweety
        ,{
            init:function(){
                SweetyCreative.master(this,"init");
                //绑定'审核状态图标'的事件
                this.dg(this.el, 'a[data-action="verifyStatus"]', 'click', 'eventShow');
                this.dg(this.el, '.M-grid-thumb img', 'mouseenter mouseleave imageLoad imageError', 'showPreviewImage');
            },
            showPreviewImage:_showPreviewImage,
            //渲染审核状态显示
            renderVerifyStatus:function(i,val,row,con){
                this.verifyResults[i] = row.VerifyResult;
                var elm = $('<a href="#" class="G-icon rtbPosVerify" data-action="verifyStatus"/>');
                elm.attr('title', LANG("点击查看"));
                elm.attr('data-index', i);
                return elm;
            },
            //渲染时长
            renderDuration:function(i,val,row,con){
                return val ? val+'s' : '-';
            },
            eventShow:function(evt,el){
                var id = +$(el).attr('data-index');
                var verifyResult = this.verifyResults[id];
                var data = [];
                util.each(app.config('exchanges'), function(ex){
                    var text = LANG(
                        "%1审核状态: %2",
                        LANG(ex.name),
                        this.renderText(util.find(verifyResult, ex.alias_id || ex.id, "ExchangeId"))
                    );
                    data.push(text);
                }, this);
                data = '<li>' + data.join('</li><li>') + '</li>';

                //创建审核状态弹出框
                var tip  = this.get('verifyStatusTip');
                if (!tip){
                    tip = this.create('verifyStatusTip', popwin.tip, {
                        width: 300,
                        data: data,
                        pos:'mr',
                        anchor: el,
                        autoHide: 1
                    });
                }else {
                    tip.reload({data: data, anchor: el});
                }
                tip.show();
                return false;
            },
            //返回审核结果
            renderText:function(v){
                if(v){
                    switch(v.Status){
                        case 1 :
                            return LANG("通过");
                        case 0 :
                            return LANG("待审核") ;
                        case -2 :
                            return LANG("审核中") ;
                        case -1 :
                            return LANG("未通过<br>原因：") + v.RejectReason;
                        default:
                            return LANG("无");
                    }
                }else{
                    return LANG("无");
                }
            }
        }
    );
    exports.sweetyCreative = SweetyCreative;

    var SweetyVerify = app.extend(Base,{
        init:function(config){

            var cols = [
                {name:"_id",type:'fixed',sort:true,align:'center', width:80},
                {name:'SweetyNameWithThumb', thumb_size:30, width:0},
                {name:"_id", text:LANG('审核状态'), type:'op', align:'center', render:'renderVerifyStatus', width:80, param:'_id'}
            ];
            var userId = app.getUserId();
            var update_sweety = app.config('auth/update_sweety') || [];
            if(update_sweety.length){
                util.each(update_sweety, function(item){
                    if(item && item == userId){
                        cols.push({name:"_id", text:LANG('操作'), type:'op', align:'center', render:'renderUpdateVerifyStatus', width:80, param:'_id'});
                    }
                });
            }

            config = $.extend({
                'cols': cols,
                'hasRefresh': true,
                'refresh_time': 30,
                'refresh_auto': 0,
                "layoutMap":{
                    "search":"row2_cell1"
                },
                'sort':'CreateTime', // 按照创建时间排序
                'order':'desc',
                'hasExport': false,  // 是否有导出模块
                'hasAmount': false,	// 是否有总计模块
                'hasTab': false,		// 是否显示栏目切换栏
                // 远程服务器数据点
                'url': '/rest/listsweety'
            }, config);
            this.gridType = 'SweetyVerify';
            SweetyVerify.master(this, null, config);
            SweetyVerify.master(this,'init',config);
            this.$verifyLists = {};
            this.dg(this.el, '.M-grid-thumb img', 'mouseenter mouseleave imageLoad imageError', 'showPreviewImage');

            this.dg(this.el,'a[data-op="verifyStatus"]','click','onListOpClick');
            this.dg(this.el,'input[data-op="updateVerifyStatus"]','click','onListOpUpdate');
        },
        showPreviewImage:_showPreviewImage,
        renderVerifyStatus:function(i,val,row,con){
            return $('<a class="G-icon rtbPosVerify" data-op="verifyStatus"/>').attr({
                'title': LANG("点击查看"),
                'data-id': val,
                'data-index': i
            });
        },
        renderUpdateVerifyStatus:function(i,val,row,con){
            return $('<input type="button" class="btn" data-op="updateVerifyStatus"/>').attr({
                'title': LANG("获取结果"),
                'data-id': val,
                'data-index': i
            }).val(LANG('获取结果'));
        },
        onListOpClick: function(ev, elm){
            if($(elm).attr('data-op') !== 'verifyStatus'){
                return;
            }
            var idx = $(elm).attr('data-index');
            var id = $(elm).attr('data-id');
            var list = this.$.list;
            var subs = this.$verifyLists[idx] || null;
            if (subs){
                if (subs.id != id){
                    subs.mod.destroy();
                    subs = null;
                }
            }
            if (!subs){
                // 新建对象
                var subRow = list.showSubRow(idx);
                this.$verifyLists[idx] = {
                    'mod': this.create(CreativeVerify, {
                        target: subRow.div,
                        param:{SweetyId:id}
                    }),
                    'id': id
                };
            }else {
                list.toggleSubRow(idx);
            }
            return false;
        },
        onListOpUpdate: function(ev, elm){
            if($(elm).attr('data-op') !== 'updateVerifyStatus'){
                return;
            }
            var id = $(elm).attr('data-id');
            app.showLoading();
            app.data.get('nextgen/sweetyaudit', {ids: id}, this, 'onUpdate');
        },
        onUpdate: function(err, data){
            app.hideLoading();
            if (err){
                app.alert(err.message);
                return false;
            }
            app.notify(LANG('更新审核结果已提交，稍后请刷新列表'));
        }
    });
    exports.sweetyVerify = SweetyVerify;

    var CreativeVerify = app.extend(Base,{
        init:function(config){
            var cols = [
                {name:'_id',width:"5%"},
                {name:'CreativeNameWithThumb', thumb_size:20}
            ];
            // 合并RTB项目
            // var width = Math.round(80 / app.config('exchanges').length) + '%';
            util.each(app.config('exchanges'), function(ex){
                cols.push({
                    name: 'VerifyResult',
                    render: 'renderStatus',
                    align: 'center',
                    width: 100,
                    param: ex.alias_id || ex.id,
                    head_html: this.renderHead(ex.alias_id || ex.id, ex.name)
                });
            }, this);

            config = $.extend({
                "cols":cols,
                list:{
                    'default_sort':false
                },
                'url': '/rest/listsweetycreative',
                'param':null,  //参数
                'hasSearch':false,
                'hasExport': false,  // 是否有导出模块
                'hasAmount': false,	// 是否有总计模块
                'hasTab': false,		// 是否显示栏目切换栏
                'data': null  //静态数据
            },config);
            CreativeVerify.master(this, null, config);
            CreativeVerify.master(this,'init',config);
            this.list.el.addClass('P-creativeVerify');
            this.dg(this.list.el,'.M-grid-headBtn','click','eventHeadBtnClick');
            this.dg(this.list.el,'.rejectReason','mouseenter mouseleave','eventRejectReason');
            this.dg(this.list.el,'.M-grid-thumb img', 'mouseenter mouseleave imageLoad imageError', 'showPreviewImage');
        },
        showPreviewImage:_showPreviewImage,
        // 渲染列头html代码
        renderHead:function(id, txt){
            var html = '<span>'+LANG('%1审核状态', LANG(txt))+'</span><br/>';
            html += '<button class="M-grid-headBtn btn" title = "'+ LANG("提交该列审核失败的素材") + '" data-id="'+id+'">'+LANG("重新审核")+'</button></p>';
            return html;
        },
        /**
         * 审核栏渲染函数
         * @param  {Array}     val   要查找的数组
         * @param  {Mix}       value 查询依据数据
         * @param  {String}    field 查询的关键字段"ExchangeId"
         */
        renderStatus: function(index, val, row, col){
            var v = util.find(val, col.param, "ExchangeId");
            if(v){
                switch(v.Status){
                    case 1 :
                        return '<div title="'+LANG("通过")+'" data-mode="sub" class="icon done"></div>';
                    case 0 :
                        return '<div title="'+LANG("待审核")+'" data-mode="sub" class="icon wait"></div>';
                    case -2 :
                        return '<div title="'+LANG("审核中")+'" data-mode="sub" class="icon ing"></div>';
                    case -1 :
                        var html = '<div title="'+LANG("未通过")+'" data-mode="sub" class="icon rejectReason ';
                        html += v.RejectReason.indexOf('系统判断：') === 0 ? 'sys' : 'err';
                        html += '" data-info="'+util.html(v.RejectReason)+'"/>';
                        return html;
                }
            }else{
                return null;
            }
        },
        /**
         * 鼠标事件-展示素材审核失败的原因
         */
        eventRejectReason: function(evt, elm){
            var tip  = this.get('rejectReasonTip');
            switch (evt.type){
                case 'mouseenter':
                    elm = $(elm);
                    var rejectReason = elm.attr("data-info");

                    if (!tip){
                        tip = this.create('rejectReasonTip', popwin.tip, {
                            'width': 300,
                            'pos': 'ml',
                            'anchor': elm,
                            'autoHide': 1,
                            'outerHide': 1
                        });
                        this.$tipContent = $('<div class="con"/>').appendTo(tip.body);
                    }else{
                        tip.reload({anchor: elm});
                    }
                    this.$tipContent.text(rejectReason);
                    tip.show();
                    break;
                case 'mouseleave':
                    if (tip){ tip.delayHide(500); }
                    break;
            }
            return false;
        },
        eventHeadBtnClick:function(evt, el){
            var id = +$(el).attr('data-id');
            if (isNaN(id) || id === 0){ return; }
            this.submitCreatives(id);
        },
        submitCreatives:function(ExchangeId){
            var sweetyId = this.config.param.SweetyId;
            app.data.put('/rest/reuploadsweety',{
                SweetyIds:sweetyId,
                ExchangeIds:ExchangeId
            },this,'reload')
        }
    })
    exports.creativeVerify = CreativeVerify;
    /**
     * 广告平台列表
     */
    function Platform(config){
        config = $.extend(
            true,
            {
                'cols':[
                    {type:'id'},
                    {name:'Name',text:LANG("平台"), type:'index',render:"renderName",width:210}
                ]
                // 二级表单
                // 远程服务器数据点
                ,'url': '/rest/listplatform?all=1'
                ,"subs":['product','campaign','mediaAndAd','sweety','whisky','period','comp','geo','client']
                ,'tab':{
                'cols': {'bid': null}
            }
            },
            config
        );
        Product.master(this, null, config);
        this.config.originalData = config.originalData;
        this.gridType = 'platform';
    }
    extend(
        Platform
        ,Base
        ,{
            onEditPlatformSuccess:_reloadGrid
            ,renderName:_renderValWithTag
        }
    );
    exports.platform = Platform;

    /**
     * 落地页模板
     */
    function WhiskyTemplate(config){
        config = $.extend({
            'cols':[
                {type:'id'},
                {name:'Name', type:'index'},
                {name:'CreateTime',type:'dim',sort:true},
                "Description"
            ],
            // 远程服务器数据点
            'url': '/rest/listlayout',
            "hasTab":false,
            "hasAmount":false,
            "hasExport":false
        }, config);
        WhiskyTemplate.master(this, null, config);
        this.gridType = 'WhiskyTemplate';
    }
    extend(WhiskyTemplate, Base);
    exports.whiskyTemplate = WhiskyTemplate;

    /**
     * 广告位列表
     */
    function Ads(config){
        config = $.extend(
            true,{
                "cols":[
                    {name:"_id",type:'fixed',sort:true,align:'center', width:60}
                    ,{name:"Name",text:LANG("广告位"),type:"index",render:"renderName",width:210}
                    ,{name:'ads_size',type:'index'}
                    ,{name:'AdvisePrice',type:'fixed'}
                    // ,{name:"MassMediaName",type:"index"} // 暂隐藏媒体
                    ,{name:"AdChannelId",text:LANG("渠道"),render:"renderChannel",type:'fixed'}
                    ,{name:"request_num",align:'right'}
                ]
                ,'tab':{'cols': {'bid':['AdvisePrice']}}
                ,"showTip":true
                ,"hasRefresh":true
                ,"auto_load":true
                ,"hasAdvancedDate":true
                // 远程服务器数据点
                ,"url":"/rest/listadposition"
                ,'subs':['mediaAndAd','sweetyCreative','whisky','period','comp','geo','client','campaign','productAndPlatform','platform']
            },
            config
        );

        if (config.is_sub_grid){
            if (_parseSubs(config.sub_param).pop() == 'whisky'){
                $.extend(true, config, {
                    'tab':{'cols':{'bid': null, 'cost': null, 'creative': null}}
                });
            }else {
                $.extend(true, config, {
                    'tab':{'cols':{'bid': null}}
                });
            }
        }

        Ads.master(this, null, config);
        this.config.originalData = config.originalData;
        this.gridType = 'spot';
        this.sys_param = this.sys_param || {};
        this.sys_param.InfoMore = 1;
    }
    extend(Ads, Base, {
        init:function(){
            Ads.master(this,'init');
            if(this.config.showTip && !this.config.is_sub_grid){
                var tip = $('<span class="M-gridAdsTip"/>');
                tip.text(LANG('RTB广告位底价、尺寸、素材要求等信息请查看'));
                tip.append('<a target="_blank" href="#ads/priceList">'+LANG("广告位详情")+'</a>');
                this.el.prepend(tip);
            }
        }
        ,renderName: function(i,val,row,con){
            var dom;
            if(row.PageUrl){
                dom = $('<a class="M-tableListWidthLimit" href="'+row.PageUrl+'" target="_blank"/>');
            }else{
                dom = $('<div class="M-tableListWidthLimit"/>')
            }
            if (val === ''){
                val = LANG("其他");
                dom.addClass('ti');
            }else if (val === null){
                val = LANG('(空)');
                dom.addClass('tdef');
            }
            return dom.text(val).width(con.width).attr("title",val+'\n'+row._id);
        }
        ,renderChannel: function(i,val,row,con){
            var data;
            switch(val){
                case 1: // RTB
                    var exchanges = app.config('exchanges');
                    data = util.find(exchanges,row.AdxId,'id');
                    if(data){data = data.name}

                    break;
                case 2: // 代理
                    data = row.MassMediaName;
                    break;
                default:
                    break;
            }
            return data ? data : LANG('无');
        }
        /**
         * 生成子查询Condition参数
         * @param  {Object} param subGrid模块传递进来的带行DATA对象参数
         * @return {String}       子表格查询参数字符串
         */
        ,getSubParam: function(param){
            var subParam = Ads.master(this,"getSubParam",[param])
                ,tmp = param.data
                ,channel = tmp && (tmp.AdxId || tmp.AdSubChannelId) || null;

            if(channel && subParam.indexOf(",channel_id|") === -1){
                subParam += (",channel_id|"+channel);
            }
            tmp = channel = null;
            return subParam;
        }
    });
    exports.ads = Ads;

    /**
     * 添加活动的广告位选择列表
     */
    function AdPosition(config){
        config = $.extend(true, {
            'url':'/rest/listadposition',
            'pager': {'size':10},
            'cols': [
                {type:'id'},
                {type:'index', name:'ads_name',width:210,render:'renderName'},
                {name:'ads_size'},
                {name:'ads_price',sort:!config.is_sub_grid},
                {name:'ads_type', format:'formatAdType'}
            ]
        }, config);
        AdPosition.master(this, null, config);
        this.gridType = 'spot';
        this.gridRowName = 'ads_name';
    }
    extend(AdPosition, BaseNoDate, {
        init: function(){
            AdPosition.master(this, 'init');
            this.$all = this.el.find('input[data-op="check_all"]:first');
        }
        ,renderName: function(i,val, row, con){
            return $('<a class="M-tableListWidthLimit"/>').attr({'title':val}).text(val).width(con.width);
        }
        ,formatAdType: function(val){
            var types = [null, LANG('固定'),LANG('富媒体'),LANG('对联'),LANG('视频'),LANG('弹窗')];
            return types[val] || LANG('其他');
        }
    });
    exports.adPosition = AdPosition;

    /**
     * 添加RTB活动的广告位选择列表
     */
    function RtbAdPosition(config){
        config = $.extend(true, {
            'url':'/rest/listadposition',
            'param': {'no_stastic_data': 1, 'InfoMore':1},
            'pager': {'size':10, 'bounds':5, 'firstLast':false},
            'hasAmount': false,
            'hasTab': false,
            'hasExport': false,
            'auto_load': false,
            'hasSelect': true,
            'cols': [
                {type:'id'},
                {type:'index', name:'ads_name',render:'renderName'},
                {name:'ads_size', sort:false},
                {name:'AdvisePrice'},
                {name:"MassMediaName", align:'center', sort:'MassMediaId'},
                {name:"MassChannelName", align:'center', sort:'MassChannelId'},
                {name:'ScreenName', sort:'Screen'},
                {name:'LocQualityName', sort:'LocQuality'},
                //{name:'ads_price'},
                {name:'Request', text:LANG('竞价次数')},
                {name:'AdsPreview', field:'ReviewPicture', sort:false}
            ]
        }, config);

        RtbAdPosition.master(this, null, config);
        this.gridType = 'spot';
        this.gridRowName = 'ads_name';
        //被排除的广告位
        this.excludes = [];
    }
    extend(RtbAdPosition, BaseNoDate, {
        init: function(){
            RtbAdPosition.master(this, 'init');
        }
        //渲染行
        ,renderName: function(i,val,row,con,td){
            var excludes = this.excludes;
            //判断当前行是否属于被排除的广告位
            var switchFlag = Boolean(util.index(excludes, row._id));
            //为整个tr添加‘删除线’
            $(td).attr('title',row._id).closest("tr").toggleClass('M-gridDeleted',switchFlag);
            return val;
        }
        //把要过滤的值用变量存起来
        ,excludeFliter: function(excludes){
            this.excludes = excludes;
        }
    });
    exports.rtbAdPosition = RtbAdPosition;

    /**
     * 广告渠道列表
     */
    function Channel(config){
        config = $.extend(
            true,
            {
                "cols":[
                    {type:"id"}
                    ,{name:"Name",text:LANG("渠道"),type:"index",render:"renderName",width:210}
                ]
                // 远程服务器数据点
                ,"url":"/rest/listadsubchannel?all=1"
                ,'subs':['mediaAndAdCampaign','sweety','whisky','period','comp','geo','productAndPlatform','platform']//,'client'
                ,'tab':{
                'cols': {'bid': null}
            }
            },
            config
        );

        if (config.is_sub_grid){
            if (_parseSubs(config.sub_param).pop() == 'whisky'){
                $.extend(true, config, {
                    'tab':{'cols':{'cost': null, 'creative': null}}
                });
            }
        }

        Channel.master(this, null, config);
        this.config.originalData = config.originalData;
        this.gridType = 'channel';
    }
    extend(Channel, Base, {
        onAddChannelSuccess:_reloadGrid
        ,onEditChannelSuccess:_reloadGrid
        ,renderName:_renderValWithTag
    });
    exports.channel = Channel;

    /**
     * 媒体列表
     * @param {Object} config 配置
     */
    function Media(config){
        config = $.extend(
            true,
            {
                "cols":[
                    {type:"id"}
                    ,{name:"Name",text:LANG("媒体"),type:"index",render:"renderName",width:210}
                    ,{name:"AdSubChannelName",text:LANG("所属渠道"),type:"index",format:_formatEmptyName}
                ]
                ,'tab':{'cols':{'bid': null}}
                // 远程服务器数据点
                ,"url":"/rest/listmassmedia?all=1&InfoMore=1"
                ,'subs':['mediaAndAdCampaign','sweety','whisky','period','comp','geo','productAndPlatform','platform']//'client','campaign' 删掉的sub
            },
            config
        );
        if (config.is_sub_grid){
            if (_parseSubs(config.sub_param).pop() == 'whisky'){
                $.extend(true, config, {
                    'tab':{'cols':{'cost': null, 'creative': null}}
                });
            }
        }

        Media.master(this, null, config);
        this.config.originalData = config.originalData;
        this.gridType = 'medium';
    }
    extend(Media, Base, {
        renderName:_renderValWithTag
    });
    exports.media = Media;

    /**
     * 媒体频道列表
     * @param {Object} config 配置
     */
    function MediaChannel(config){
        config = $.extend(
            true,
            {
                "cols":[
                    {type:"id"}
                    ,{name:"Name",type:"index",render:_renderName,width:210}
                    ,{name:'CreateTime',type:'dim',sort:true}
                ]
                // 远程服务器数据点
                ,"url":"/rest/listmasschannel"
                ,"hasTab":false
                ,"hasExport":false
                ,"hasAmount":false
            },
            config
        );
        MediaChannel.master(this, null, config);
        this.config.originalData = config.originalData;
        this.gridType = 'spot_channel';
    }
    extend(MediaChannel, Base, {
    });
    exports.mediaChannel = MediaChannel;

    /**
     * 频次对比
     */
    function Comp(config, parent){
        config = $.extend(true, {
            chart: {
                'height': 400,
                'url': '/rest/trendfrequency',
                'param': {
                    no_limit:1
                },
                'context': this,
                'build': {
                    xAxis: {
                        labels: {
                            step:1,
                            rotation: -25,
                            align: 'right'
                        }
                    },
                    yAxis: [
                        {opposite: false, min:0, title:{text:LANG('展示量')}},
                        {opposite: true, min:0, title:{text:LANG('点击量')}}
                    ]
                },
                'series':[
                    {
                        y_axis:0,
                        y_field:'impressions',
                        x_field:'trend_key',
                        x_format:this.chartFormatX,
                        label_field:'trend_key',
                        group:'frequencyslot',
                        text:LANG('展示量'),
                        init:this.chartSeriesInit,
                        filter:this.chartFilter
                    },
                    {
                        y_axis:1,
                        y_field:'clicks',
                        x_field:'trend_key',
                        x_format:this.chartFormatX,
                        label_field:'trend_key',
                        group:'frequencyslot',
                        text:LANG('点击量'),
                        init:this.chartSeriesInit,
                        filter:this.chartFilter
                    }
                ]
            }
        }, config);
        Comp.master(this, null, config);
        this.$sub_param = config;
        var param = this.config.param;
        delete param.type;

        // 图表拉取参数
        this.$chart_config = config.chart;
        this.$chart_param = $.extend(true, {}, param);
        this.$chart_xaxis = [];
    }
    extend(Comp, Period, {
        /**
         * 加载模块数据
         */
        load: function(param){
            var c = this.config;
            if (param){
                util.merge(c.param, param);
                util.merge(this.$chart_param, param);
            }
            c = this.$dirty;
            c.table = c.chart = 1;
            this.hideLoading();
            this.switchMode();
        },
        /**
         * 构建表格
         */
        buildTable: function(){
            var d = this.$dirty;
            var tab = this.$.table;

            if (!tab){
                this.$sub_param.target = this.doms.table;
                this.create('table', Frequency, this.$sub_param);
            }else if (d.table){
                tab.setParam(this.config.param, true);
                tab.setDateRange(this.config.param);
                tab.load();
            }
            d.table = 0;
        },
        /**
         * 构建图表
         */
        buildChart: function(){
            if (!this.$.chart){
                return app.loadModule('chart.line', this.createChart, this);
            }
            if (this.$dirty.chart){
                this.$dirty.chart = 0;
                this.$chart_xaxis.splice(0,this.$chart_xaxis.length);
                this.$.chart.load(this.$chart_param, true);
            }
        },
        /**
         * 创建图表实例
         */
        createChart: function(chart){
            var c = this.$chart_config;
            var con = this.doms.chart;
            c.width = con.width();
            c.target = con;
            this.create('chart', chart, c);
            this.buildChart();
        },
        /**
         * 图表数据过滤
         */
        chartFilter: function(data){
            return (data.frequencyslot < 14 && data.frequencyslot > 0);
        },
        chartFormatX: function(val){
            var id = util.index(this.$chart_xaxis, val);
            if (id === null){
                id = this.$chart_xaxis.push(val) - 1;
            }
            return id;
        },
        /**
         * 图表数据配置信息初始化
         */
        chartSeriesInit: function(opt, data, cfg){
            opt.name += '(' + data.frequencyslot_name + ')';
        }
    });
    exports.comp = Comp;

    function Frequency(config){
        config = $.extend(
            true,
            {
                "cols":[
                    {type:"id"}
                    ,{name:"Name",field:"frequencyslot_name",type:"index",render:_renderName,width:210}
                ]
                ,"tab":{
                'list':[
                    {
                        name: 'default',
                        cols: [
                            true
                            ,"impressions"
                            ,"clicks"
                            ,"click_rate"
                            ,"back_regs"
                            ,"cpm"
                            ,"avg_click_cost"
                            ,"cost"
                        ]
                    },
                    {
                        name: 'creative',
                        cols: [
                            true
                            ,"impressions"
                            ,"new_impressions"
                            ,"visitors"
                            ,"clicks"
                            ,"click_rate"
                            ,"reviews"
                            ,"new_visitors"
                            ,"new_visitor_rate"
                            ,"old_visitor_rate"
                        ]
                    },
                    {
                        name: 'cost',
                        cols: [
                            true
                            ,"avg_click_cost"
                            ,"cpm"
                            // ,"avg_reg_cost"
                            ,"cost"
                        ]
                    },
                    'custom'
                ]
            }
                ,"param":{
                no_limit: 1
            }
                ,"hasPager": false
            },
            config
        );
        Frequency.master(this,null,config);
        this.gridType = "frequency";
        this.gridRowName = 'frequencyslot_name';
    }
    extend(
        Frequency
        ,Base
        ,{
        }
    );
    exports.frequency = Frequency;

    /**
     * 地域列表
     * @param {object} config
     */
    function Geo(config){
        config = $.extend(true, {
            "cols":[
                {type:"id"}
                ,{name:"Name",field:"country_name",type:"index",render:'renderName'}
            ],
            'tab':{
                'cols': {'bid':null} // 活动
            }
        }, config);

        if (config.is_sub_grid){
            switch(_parseSubs(config.sub_param).pop()){
                case 'spot':
                case 'medium':
                    $.extend(true, config, {
                        'tab':{'cols':{'cost': null}}
                    });
                    break;
                case 'whisky':
                    $.extend(true, config, {
                        'tab':{'cols':{'cost': null, 'creative': null}}
                    });
                    break;
            }
        }

        Geo.master(this,null,config);
        this.gridType = "geo";
        this.gridRowName = "country_name";
        this.$basePath = window.BASE('resources/images/geo/');
    }
    extend(
        Geo
        ,Base
        ,{
            renderName:function(i,val,row){
                return '<i class="vmiddle"><img src="'+this.$basePath+row.country_icon+'.png" alt=""> '+row.country_name+" "+row.region_name+'</i>';
            }
        }
    );
    exports.geo = Geo;
    /**
     * 地图列表
     * @param {object} config
     */
    function GeoMap(config){
        config = $.extend(true, {
            'class': 'M-gridGeoMap'
        }, config);
        GeoMap.master(this, null, config);
    }
    extend(GeoMap,view.container,{
        init:function(){
            GeoMap.master(this,'init')
            var mapcfg = $.extend(true,this.config,{
                target:this.el
            });
            delete mapcfg['class'];
            this.create('geo',geo.base,mapcfg);
            this.create('tip',popwin.mapTip,{
                width:120,
                autoHide:1,
                target:this.el
            });
            this.create('mask', common.loadingMask);
        },
        // 自动刷新事件
        onAutoRefresh: function(){

            this.load();
        },
        // 重新加载数据
        load: function(){
            this.showLoading();
            this.$.geo.load();
        },
        //地图准备事件，完成后渲染列表
        onGeoReady:function(){
            this.renderList();
            this.hideLoading();
        },
        //top10地区列表渲染函数
        renderList:function(){
            var data= this.$.geo.getData(),htm,cur,
                len = Math.min(10,data.length),
                html = [
                    '<div class="mapTableCon" >',
                    '<table class="mapTable"><thead><tr>',
                    '<td>'+LANG("序号")+'</td>',
                    '<td>'+LANG("名称")+'</td>',
                    '<td>'+LANG("展示数")+'</td>',
                    '<td>'+LANG("点击量")+'</td>',
                    '<td>'+LANG("点击率")+'</td>',
                    '</tr></thead>'
                ].join('');

            if(len>0){
                for(var i=0;i<len;i++){
                    cur = data[i];
                    htm='<tr>';
                    htm+='<td>'+(i+1)+'</td>';
                    htm+='<td>'+cur.region_name+'</td>';
                    htm+='<td>'+cur.impressions+'</td>';
                    htm+='<td>'+cur.clicks+'</td>';
                    htm+='<td>'+cur.click_rate+'</td>';
                    htm+='</tr>';
                    html+=htm;
                }
            } else {
                html+='</thead><tr><td colspan="5" style="text-align:center">'+LANG("没有数据")+'</td></tr>';
            }
            html+='</table></div>';
            this.el.append($(html));
        }
        //地图hover处理事件
        ,onMapHoverIn:function(e){
            if (this.config.current&&this.config.current ===e.param.data){
                return;
            }
            var param = e.param,html='',data = this.$.geo.getData(param.data);
            this.config.current = param.data;
            if(data&&data.region_name){
                html+='<strong>'+data.region_name+'</strong><br/>';
                html+=LANG('展示数: %1', data.impressions)+'<br/>';
                html+=LANG('点击量: %1', data.clicks)+'<br/>';
                html+=LANG('点击率: %1', data.click_rate)+'<br/>';
            }
            var pos = this.el.offset();
            param.data = html;
            param.x -= pos.left;
            param.y -= pos.top;
            if(param.data){
                var tip = this.get('tip');
                tip.setConfig(param).show();
            }
        },
        onHideTip:function(){
            this.$.tip.hide();
        }
        //tip隐藏后触发的事件，当前显示的省份名字设为null
        ,onTipHided:function(){
            this.config.current = null;
            this.$.geo.removeSelected();
        },
        /**
         * 时间改变的响应函数
         * @param  {Object}  ev 消息对象
         * @return {Boolean}    阻止广播
         */
        onChangeDate:function(ev){
            // 重新加载地图数据
            this.$.geo.load();
            return false;
        }
        /**
         * 显示数据加载中
         * @return {None} 无返回
         */
        ,showLoading: function() {
            this.$.mask.show();
        }
        /**
         * 隐藏数据加载提示
         * @return {None} 无返回
         */
        ,hideLoading: function() {
            this.$.mask.hide();
        }
    });
    exports.geoMap = GeoMap;


    /**
     * 操作系统
     * @param {Object} config 模块配置
     */
    function Os(config){
        config = $.extend(
            true
            ,{
                'cols':[
                    {type:'id'},
                    {name:'os_type_name',type:'index',render:'renderName'}
                ]
                ,'tab': {'cols': {'bid': null}}
            }
            ,config
        );

        if (config.is_sub_grid){
            switch(_parseSubs(config.sub_param).pop()){
                case 'spot':
                    config.tab.cols.cost = null;
                    break;
                case 'whisky':
                    $.extend(true, config, {
                        'tab':{'cols':{'cost': null, 'creative': null}}
                    });
                    break;
            }
        }
        Os.master(this,null,config);
        this.gridType = "os";
        this.subGridType = "os_type";
        this.gridRowName = "os_type_name";
        this.$basePath = window.BASE('resources/images/os/');
    }
    extend(
        Os
        ,Base
        ,{
            renderName:function(i,val,row){
                return '<i class="vmiddle"><img src="'+this.$basePath+row.os_icon+'.png" alt=""> '+val+'</i>';
            }
        }
    );
    exports.os = Os;

    /**
     * 浏览器
     * @param {Object} config 模块配置
     */
    function Browser(config){
        config = $.extend(
            true
            ,{
                'cols':[
                    {type:'id'},
                    {name:'Name',field:"browser_type_name",type:'index',render:'renderName'}
                ]
                ,'tab': {'cols': {'bid': null}}
            }
            ,config
        );

        if (config.is_sub_grid){
            switch(_parseSubs(config.sub_param).pop()){
                case 'spot':
                    config.tab.cols.cost = null;
                    break;
                case 'whisky':
                    $.extend(true, config, {
                        'tab':{'cols':{'cost': null, 'creative': null}}
                    });
                    break;
            }
        }

        Browser.master(this,null,config);
        this.gridType = "browser";
        this.subGridType = "browser_type";
        this.gridRowName = "browser_type_name";
        this.$basePath = window.BASE('resources/images/browser/');
    }
    extend(
        Browser
        ,Base
        ,{
            renderName:function(i,val,row){
                return '<i class="vmiddle"><img src="'+ this.$basePath +row.browser_icon+'.png" alt=""> '+val+'</i>';
            }
        }
    );
    exports.browser = Browser;

    /**
     * 语言
     * @param {Object} config 模块配置
     */
    function Language(config){
        config = $.extend(
            true
            ,{
                'cols':[
                    {type:'id'},
                    {name:'language_name', type:'index'}
                ]
                ,'tab': {'cols': {'bid': null}}
            }
            ,config
        );

        if (config.is_sub_grid){
            switch(_parseSubs(config.sub_param).pop()){
                case 'spot':
                    config.tab.cols.cost = null;
                    break;
                case 'whisky':
                    $.extend(true, config, {
                        'tab':{'cols':{'cost': null, 'creative': null}}
                    });
                    break;
            }
        }

        Language.master(this,null,config);
        this.gridType = "language";
        this.gridRowName = "language_name";
    }
    extend(
        Language
        ,Base
    );
    exports.language = Language;

    /**
     * 分辨率
     * @param {Object} config 模块配置
     */
    function Resolution(config){
        config = $.extend(
            true
            ,{
                'cols':[
                    {type:'id'},
                    {name:'resolution_name', type:'index'}
                ]
                ,"tab":{
                    "list":[
                        {
                            "name":'default',
                            "cols":[
                                true
                                ,"back_pageviews"
                                ,"back_visitors"
                                ,"back_clicks"
                                ,"back_click"
                                ,"back_click_rate"
                                ,"back_regs"
                                ,"back_reg_rate"
                            ]
                        }
                        ,{
                            "name":'whisky',
                            "cols":[
                                true
                                ,"back_pageviews"
                                ,"back_sessions"
                                ,"back_visitors"
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
                        ,{
                            "name":'transform',
                            "cols":[
                                true
                                ,"back_regs"
                                ,"back_reg_rate"
                            ]
                        }
                        ,'custom'
                    ]
                }
            }
            ,config
        );
        Resolution.master(this,null,config);
        this.gridType = "resolution";
        this.gridRowName = "resolution_name";
    }
    extend(
        Resolution
        ,Base
    );
    exports.resolution = Resolution;

    /**
     * 窗口大小
     * @param {Object} config
     */
    function Pixels(config){
        config = $.extend(
            true
            ,{
                'cols':[
                    {type:'id'},
                    {name:'pixels_name', type:'index'}
                ],
                'tab': {
                    'cols':{
                        'creative': null,
                        'cost': null,
                        'bid': null,
                        'transform': [null, 'back_reg_click_rate', 'back_login_click_rate', 'reg_per_mile', 'login_per_mile']
                    }
                }
            }
            ,config
        );
        this.gridType = "pixels";
        this.gridRowName = "pixels_name";
        Pixels.master(this,null,config);
    }
    extend(
        Pixels
        ,Base
    );
    exports.pixels = Pixels;

    /**
     * 广告素材要求表格
     * @param {Object} config 表格设定
     */
    function AdRequest(config){
        config = $.extend(
            {
                "cols":[
                    {type:"id"}
                    ,{name:"Name",text:LANG('广告位'),type:"index",render:"renderName",width:210}
                    ,{name:"Width",text:LANG("尺寸"),render:'renderSize'}
                    ,{name:'AdvisePrice'}
                    //,{name:'bid_num',text:LANG('竞价次数')}
                    ,'request_num'
                    ,{name:'click_rate',text:LANG('平均点击率')}
                    ,{name:"AllowMaterialNames",text:LANG("素材要求"),render:'renderAllowMaterialNames',align:"center"}
                ]
                ,'hasSubGrid':false
                ,'hasExport':true
                ,'hasAmount':false
                ,'hasTab':false
                // 远程服务器数据点
                ,"url":"/rest/listadposition"
            },
            config
        );
        AdRequest.master(this,null,config);
    }
    extend(
        AdRequest
        ,Base
        ,{
            getExportParam:function(){
                //return {export_type: 1};
            }
            /**
             * 格式化尺寸
             * @param  {Number} i   行索引
             * @param  {String} val 字段值
             * @param  {Object} row 行对应的数据
             * @param  {Object} con 单元格配置
             * @return {String}     格式化后的文字
             */
            ,renderSize: function(i,val,row,con){
                return val+" x "+row.Height;
            }

            /**
             * 格式化素材要求
             * @param  {Number} i   行索引
             * @param  {String} val 字段值
             * @param  {Object} row 行对应的数据
             * @param  {Object} con 单元格配置
             * @return {String}     格式化后的文字
             */
            ,renderAllowMaterialNames: function(i,val,row,con){
                return ""+val;
            }
        }
    );
    exports.adRequest = AdRequest;


    // 活动子表格基础类
    var CampaignSubGrid = app.extend(Base, {
        init: function(config){
            config = $.extend({
                'subs':['mediaAndAdCampaign','sweety','whisky','period','comp','geo','productAndPlatform','platform']
                ,'resumeLabel':LANG('启用')
                ,'stopLabel':LANG('禁用')
                ,'changeUrl':'/rest/campaignadfilterset'
                ,'priceUrl':'/rest/campaignpositionstakeset'
            }, config);

            // 活动组合条件过滤广告位处理
            this.prepareParam(config);
            if (this.$campaignId){
                // 插入状态切换列
                config.cols.splice(1,0,{name:'campaign_spot_statue', render:'renderCampaignStatue', type:'fixed'});
            }

            // 最高出价修改的时间
            this.$priceEditTime = 0;
            // 修改提示间隔
            this.$editInterval = 1000;
            // 修改价格更新记录
            this.$updatePrice = null;

            CampaignSubGrid.master(this, null, config);
            CampaignSubGrid.master(this, 'init', arguments);

            if (this.$campaignId){
                // 绑定状态切换事件
                this.dg(this.el, 'a[data-action="toggleStatue"]', 'click', 'eventToggleStatue');
                this.dg(this.el,'div[data-type="otherFunc"]',"mouseenter mouseleave","statusEventHandler");
            }
            this.dg(this.el,".M-formValueEditor","mouseenter mouseleave","showPriceWarn");

            // 获取父模块data，这里做个小小兼容（活动列表）和（单一活动查看）的情况；
            var parent = this.parent();
            this.parentData = (parent && parent.config && parent.config.sub_data) || null;
            if(!this.parentData){
                parent = this.parent().parent().parent();
                this.parentData = (parent && parent.$data) || null;
            }
        },
        prepareParam: function(config){
            var self = this;
            var c = config || self.config;
            self.$subParam = c.is_sub_grid && c.sub_param && util.parse(c.sub_param, ',', '|') || {};
            var id = self.$campaignId = self.$subParam.campaign_id || 0;

            // 绑定数据变化回调事件
            if (self.$bindId){
                app.store.unbindById(self.$bindId);
            }
            self.$bindId = app.store.bind(
                '/campaign/'+id,
                self.atCampaignUpdate, id, self
            ).lastBindId();
            return self;
        },
        atCampaignUpdate: function(ev){
            var self = this;
            var rel = ev.relative;
            if (rel !== 'price'){
                self.$exclude_ids = null;
            }
            if (self.$modifyPrice){
                self.$modifyPrice = true;
                self.$isSyncPrice = (rel === 'pricelist');
                if (rel === 'price' || rel === 'pricelist'){
                    self.list.updateColumnByName('top_price').updateColumnByName('adj_price');
                }
                self.$isSyncPrice = false;
            }
            if (rel === 'blacklist'){
                self.list.updateColumnByName('campaign_spot_statue');
            }
        },
        beforeDestroy: function(){
            if (this.$bindId){
                app.store.unbindById(this.$bindId);
            }
        },
        /**
         * 价格预警提示
         * @param  {Object}    ev 鼠标事件对象
         * @return {Boolean}      false
         */
        showPriceWarn:function(ev){
            ev.stopPropagation();
            ev.preventDefault();
            var tag = $(ev.target).closest(".M-formValueEditor");
            if(!tag.hasClass("red") || !this.$[tag.attr("data-name")]){
                return false;
            }
            tag = this.$[tag.attr("data-name")];
            if(ev.type === "mouseleave"){
                tag.hideMessage();
                return false;
            }
            tag.showMessage(LANG("出价过低"));
            return false;
        },
        /**
         * 检测修改价格后的间隔时间
         * @return {Bool} 是否达到指定间隔
         */
        chkEditInterval:function(){
            return (new Date()).getTime() - this.$priceEditTime >= this.$editInterval;
        },
        /**
         * 状态栏显示控制函数
         * @param  {Object} ev 消息对象
         * @return {Bool}      阻止冒泡
         */
        statusEventHandler:function(ev){
            var tag = $(ev.target).closest("div[data-type]")
                ,stat = ev.type === "mouseenter"
                ,len = tag.find("a").length
                ,w = tag.find("a:first").outerWidth();
            w = stat && w*len+10 || w;
            tag.toggleClass("functionalHover")
                .find("div")
                .width(w);
            tag = null;
            return false;
        },
        // 获取活动过滤ID列表
        getExcludeIds: function(){
            if (this.$exclude_ids){
                return this.$exclude_ids;
            }

            // 处理当前记录过滤ID
            var c = this.config;
            var param = this.$subParam;
            var type = c.sub_field;

            // 生成过滤ID列表
            var type2Field = {
                "spot_size_id":'Size',
                "spot_type_id":'Type',
                "spot_screen_id":'Screen',
                "referer_domain_id":'Domain'
            };
            param[type] = '{id}';
            var field = type2Field[type];
            var list = [];
            var last = 'include';
            if (field){
                // 获取当前过滤条件
                var where = {};
                util.each(param, function(val, key){
                    if (key = type2Field[key]){
                        where[key] = val;
                    }
                });
                // 循环分组合并ID记录
                var groups = app.store.get('/campaign/'+this.$campaignId+'/blacklist');
                util.each(groups, function(group){
                    // 先判断有没有当前ID属性
                    var i, g, k, c = 0;
                    for (i in type2Field){
                        k = type2Field[i];
                        if (g = group[k]){
                            if ((i = where[k]) && (k == field || util.index(g, i) !== null)){
                                c++;
                            }else {
                                // 超出属性, 不符合判断条件
                                return;
                            }
                        }
                    }
                    // 满足条件
                    if (i = group[field]){
                        if (i.length){
                            i = i.slice();
                            i.unshift(group.Kind == 1 ? 'include' : 'exclude');
                            list.push(i);
                        }
                    }else if (c){
                        // 部分先前条件满足, 整体过滤
                        last = (group.Kind == 1) ? 'include' : 'exclude';
                        return false;
                    }
                });
            }
            list = this.$exclude_ids = {'list': list, 'last': last};

            // 生成请求ID字符串模板
            var ids = [];
            var idsPrefixs = {
                "spot_size_id":'s',
                "spot_type_id":'t',
                "spot_screen_id":'S',
                "referer_domain_id":'d'
            };
            util.each(idsPrefixs,function(item,index){
                if(param[index]){
                    ids.push(item+param[index]);
                }
            })
            this.$ids = ids.join(',');

            return list;
        },
        // 获取指定ID的记录的状态
        getStatus:function(id){
            var c = this.config
            var ids = this.getExcludeIds();
            var res = 'include';
            if (ids){
                res = ids.last;
                ids = ids.list;
                for (var i=0; i<ids.length; i++){
                    if (util.index(ids[i], id) > 0){
                        res = ids[i][0];
                        break;
                    }
                }
            }
            if (res == 'exclude'){
                return {status:0, icon:'exclude', title:c.resumeLabel};
            }else {
                return {status:1, icon:'include', title:c.stopLabel};
            }
        },
        // 状态切换列渲染函数
        renderCampaignStatue: function(index, val,row, col, cell, table){
            var stat = this.getStatus(row[this.config.sub_field]);
            var td = $(cell);
            td.parent().toggleClass('M-gridDeleted', !stat.status);

            var user = app.getUser();
            if (user && user.auth <= 1){
                return '<em title="'+(stat.status? LANG('正常') : LANG('已暂停'))+'" class="G-iconFunc '+(stat.status ? "runing" : "invaild")+'" />';
            }

            var div = td.children('.M-tableListFunctionalAnchor');
            if (!div.length){
                var html = [
                    '<div class="M-tableListFunctionalAnchor" data-type="otherFunc"><div class="M-tableListOtherFunc">',
                    '<a href="javascript:;" data-type="status"><em /></a>',
                    '<span class="spacing"></span>',
                    '<a href="javascript:;" data-action="toggleStatue"></a>',
                    '</div></div>'
                ].join('');
                div = $(html);
            }
            div.find('[data-type="status"]').attr('title', (stat.status? LANG('正常') : LANG('已暂停')));
            div.find('em:first').attr('class', 'G-iconFunc '+(stat.status ? "runing" : "invaild"));
            div.find('[data-action="toggleStatue"]').attr({
                'class':'G-iconFunc '+stat.icon,
                'title':stat.title,
                'data-id':index,
                'data-statue':stat.status
            });
            return div;
        },
        eventScreenshot: function(evt, elm){
            var el = $(elm);
            var campaignName = el.attr('data-campaignName');
            var campaignId = el.attr('data-campaignId');
            var selfName = el.attr('data-selfName');
            var selfUrl = el.attr('data-selfUrl');
            var selfId = el.attr('data-spotId');
            var selfData = 'c='+campaignId+'&p='+selfId+'&pr=10';

            var data = {
                'action': 'screenshot',
                'url': selfUrl,
                'name': campaignId+' '+campaignName+'_'+selfName,
                'data': selfData
            };
            app.data.get(
                '/rest/adpositionscreenshot',
                data,
                this, 'afterScreenshot'
            );
            //$(document).find('a[href="#adScreenshot"]').click();
            return false;
        },
        afterScreenshot: function(err, data){
            if (err){
                //显示错误信息
                app.alert(err.message);
                return false;
            }
            app.notify(LANG('广告位截图中'));
        },
        // 切换按钮回调事件函数
        eventToggleStatue: function(evt,elm){
            elm = $(elm);
            var c = this.config, dat = c.data, id = elm.attr('data-id');
            if (!dat || !util.isNumber(id) || !dat[id]){
                return false;
            }
            id = dat[id][c.sub_field];
            var status = +elm.attr('data-statue');
            this.changeStatue(id, !status, elm);
            return false;
        },
        // 切换记录状态
        changeStatue: function(id, status, elm){
            if (!this.$ids){ return false; }

            var c = this.config,
                cid = this.$campaignId,
                ids = this.$ids.replace('{id}', id);

            app.data.get(
                c.changeUrl,
                {
                    'CampaignId':cid,
                    'ExcludeId':ids,
                    'IsDeleted':status ? 1 : 0
                },
                this, 'afterChangeStatue'
            );
        },
        /**
         * 修改状态接口回调函数
         * @param  {Object}    err   错误信息
         * @param  {Object}    data  服务器返回的数据信息
         * @return {Undefined}       无返回值
         */
        afterChangeStatue: function(err, data){
            if (err){
                //显示错误信息
                app.alert(err.message);
                return false;
            }

            // 更新活动数据
            _setGlobalStore('blacklist', {
                'Id': data._id,
                'SetExcludeInfo': data.SetExcludeInfo,
                'WhiteBlackList': data.WhiteBlackList
            });
        },
        // SubGrid更新主记录
        onUpdateSubGrid: function(){
            if (this.$modifyPrice){
                this.$modifyPrice = true;
            }
            if (this.$exclude_ids){
                this.$exclude_ids = null;
            }
            var ret = CampaignSubGrid.master(this, 'onUpdateSubGrid', arguments);
            this.prepareParam();
            return ret;
        },
        // 检查是否需要展现调价模块
        checkTopPrice: function(config){
            var c = config || this.config;
            c = c.sub_param;
            if (!c || c.indexOf('campaign_id|') === -1){ return false; }

            switch (this.gridType){
                case 'referer_domain':
                    return (c.indexOf(',spot_size_id|') !== -1);
                case 'spot_size':
                    return (c.indexOf(',referer_domain_id|') !== -1);
                case 'spot':
                    return true;
            }
            return false;
        },
        prepareTopPrice: function(){
            var price = this.$modifyPrice;
            if (price === true){
                // 符合设置条件, 创建设置模块
                var idName, condName, condValue;
                var cond = this.$subParam;
                var param = {
                    CampaignId: cond.campaign_id,
                    DomainId: cond.referer_domain_id,
                    SizeId: cond.spot_size_id,
                    Stake: 0
                };
                switch (this.gridType){
                    case 'spot_size':
                        idName = 'SizeId';
                        condName = 'DomainId';
                        condValue = cond.referer_domain_id;
                        break;
                    case 'referer_domain':
                        idName = 'DomainId';
                        condName = 'SizeId';
                        condValue = cond.spot_size_id;
                        break;
                    case 'spot':
                        idName = 'PositionId';
                        delete(param.DomainId);
                        delete(param.SizeId);
                        break;
                }
                var cid = this.$campaignId;
                price = this.$modifyPrice = {
                    name: idName,
                    cond: condName,
                    value: condValue,
                    param: param,
                    top: app.store.get('/campaign/'+cid+'/price', 0),
                    list: {}
                };
                var list = price.list;
                util.each(app.store.get('/campaign/'+cid+'/pricelist'), function(set){
                    var id = set[idName];
                    if (id && (!condName || set[condName] == condValue)){
                        list[set[idName]] = set;
                    }
                });
            }
            return price || null;
        },
        // 出价调整列渲染函数
        renderTopPrice: function(index,val,row,col,td,table){
            var price = this.prepareTopPrice();
            if (price){
                var c = this.config;
                var id = row[c.sub_field];
                var cur = price.list[id];

                if (cur && this.$isSyncPrice){
                    // 有价格修改记录, 并且是在更新事件状态中
                    val = row.set_stake = (cur.Stake || 0);

                    // todo: 广告位出价是否要合并属性溢价
                    // if (this.gridType == 'spot'){}
                }
                val += price.top;
            }else {
                val = row.set_top_price;
            }
            return labels.format.currency(val);
        },
        renderAdjPrice: function(index, val, row, col, td, table){
            var price = this.prepareTopPrice();
            if (price){
                var name = 'editor'+index;
                var mod = this.get(name);
                var value = (!row.WardenStatus ? val : row.ChargePrice);
                // 只读权限
                var user = app.getUser();
                if (user && user.auth <= 1){
                    if (mod){ mod.destroy(); }
                    return labels.format.currency(value || 0);
                }

                var c = this.config;
                var id = row[c.sub_field];
                var cur = price.list[id];
                if (cur && this.$isSyncPrice){
                    // 有价格修改记录, 并且是在更新事件状态中
                    value = row.set_stake = (cur.Stake || 0);
                }
                var cls = (row.request_num > 0 && row.win_num <= 0)?"M-formValueEditor red":"M-formValueEditor";

                if (mod){
                    if (id != mod.getParam()){
                        mod.setParam(id);
                    }
                    if (!mod.isEditing()){
                        mod.setData(value);
                    }
                    mod.el.attr('class', cls);
                }else {
                    mod = this.create(name,priceModity.valueEditor,{
                        "target":td
                        ,"data":value
                        ,"param":id
                        ,"width":85
                        ,"prefix":"￥"
                        ,'suffix':LANG('元')
                        ,"step":0.5
                        // 没竞得率则需要高亮提示
                        ,"class": cls
                        ,"type": row.WardenStatus //0.关闭，1.使用CPA自动优化，2.使用CPC自动优化, undefined.溢价
                        ,"top_price": row.set_top_price // 最高出价
                    });
                    this.$[name].el.attr("data-name",name);
                }
                var up = this.$updatePrice;
                if (mod && up && id && id == up.id){
                    up.id = 0;
                    if (up.error){
                        mod.setData(up.price).setType(row.WardenStatus).showMessage(up.error, 'error');
                    }else {
                        mod.showMessage(LANG('修改成功'));
                    }
                }
                return td;
            }else {
                return val;
            }
        },
        // 修改出价事件
        onValueChange: function(ev){
            var price = this.prepareTopPrice();
            if (price) {
                var param = price.param;
                var id = ev.param.param;
                var value = ev.param.value;
                param[price.name] = id;
                param.Stake = value;
                app.data.get(
                    this.config.priceUrl, param, this,
                    'afterChangePrice',
                    {'mod': ev.from, 'last':ev.param.last, 'id': id, 'price': value}
                );
            }
            return false;
        },
        afterChangePrice: function(err, data, param){
            if (err){
                this.$updatePrice = {
                    'id': param.id,
                    'price': param.last,
                    'error': err.message || LANG('服务器错误')
                };
                app.error(err);
            }else {
                // 记录修改时的时间戳
                this.$priceEditTime = (new Date()).getTime();
                this.$updatePrice = {
                    'id': param.id,
                    'price': param.price
                };

                // 更新记录数据
                var list = this.$.list.getData();
                var row = util.find(list, param.id, '_id');
                row.set_stake = param.price;

                // 更新活动数据
                _setGlobalStore('pricelist', {
                    'Id': data._id,
                    'PriceModify': data.PriceModify
                });
            }
            this.updateColumnByName('adj_price');
            this.$updatePrice = null;
        },
        /**
         * 生成子查询Condition参数
         * @param  {Object} param subGrid模块传递进来的带行DATA对象参数
         * @return {String}       子表格查询参数字符串
         */
        getSubParam: function(param){
            var subParam = Ads.master(this,"getSubParam",[param])
                ,tmp = param.data
                ,channel = tmp && (tmp.AdxId || tmp.AdSubChannelId) || null;

            if(!channel && this.config.customParam){
                tmp = this.config.customParam;
                channel = (tmp.AdxId || tmp.AdSubChannelId) || null;
            }

            if(channel && subParam.indexOf(",channel_id|") === -1){
                subParam += (",channel_id|"+channel);
            }
            tmp = channel = null;
            return subParam;
        }
    });

    // 广告位-活动维度
    var AdsCampaign = app.extend(CampaignSubGrid, {
        init: function(config){
            config = $.extend({
                "cols":[
                    {type:"id"}
                    ,{name:"Name",text:LANG("广告位"),type:"index",render:"renderName",width:210}
                    // ,{name:"MassMediaName",type:"index"}
                    ,{name:"AdxId",render:"renderChannel"}
                    ,'win_rate'
                    ,{name:'ads_size',type:"fixed",sort:false}
                    ,{name:"request_num",type:'fixed'}
                ]
                ,'tab':{'cols':{
                    'default': ['win_rate', 'ads_size'],
                    'bid': [null, 'request_num']
                }}
                ,'subs':['mediaAndAd','sweetyCreative','whisky','period','comp','geo','productAndPlatform','platform']//'client','campaign',删掉sub
                ,'resumeLabel':LANG('恢复此广告位')
                ,'stopLabel':LANG('暂停此广告位')
                ,'changeUrl':'/rest/campaignadpositionset'
                ,"hasAdvancedDate":true
                ,"hasSelect":true
                // 批量操作
                ,"batch":{
                    "list":[
                        {
                            "type":"disabled"
                            ,"text":LANG("批量暂停")
                        }
                        ,{
                            "type":"enable"
                            ,"text":LANG("批量开始")
                        }
                    ]
                    ,"enable":true
                }
            }, config);
            this.gridType = 'spot';
            if (this.checkTopPrice(config)){
                this.$modifyPrice = true;
                config.cols.splice(3, 0,
                    {name:"top_price",render:'renderTopPrice',field:'set_stake'},
                    {name:'adj_price',render:'renderAdjPrice',field:'set_stake'}
                )
            }else {
                util.remove(config.tab.cols['default'], 'win_rate');
            }
            AdsCampaign.master(this,'init',arguments);

            // 添加3个状态过滤按钮
            // 创建容器存放按钮
            var statusFilterDiv = $('<div class="M-tableListSubGridStatusFilter">' + LANG('状态') + ': </div>');
            var status = [
                {'text': LANG('所有'), 'value': ''},
                {'text': LANG('进行中'), 'value': 'include'},
                {'text': LANG('已暂停'), 'value': 'exclude'}
            ];
            util.each(status, function(item, index) {
                var statusVal = item.value;
                var statusSpan = $('<span data-status="' + statusVal + '">').text(item.text);
                if (!statusVal) {
                    // 默认选中“所有”radio
                    statusSpan.toggleClass('act');
                }
                statusSpan.appendTo(statusFilterDiv);
            });
            statusFilterDiv.prependTo(this.getLayout('excel'));

            // 绑定按钮事件
            this.jq(statusFilterDiv.find('span'), 'click', 'eventStatusClick');
            this.dg(this.el, 'a[data-action="screenshot"]', 'click', 'eventScreenshot');

        },
        reanderFunctional: function(i,val,row,con){
            return '';
        },
        // 状态切换列渲染函数
        renderCampaignStatue: function(index, val,row, col, cell, table){
            var parentData = this.parentData;
            var stat = this.getStatus(row[this.config.sub_field]);
            var td = $(cell);
            td.parent().toggleClass('M-gridDeleted', !stat.status);

            var user = app.getUser();
            if (user && user.auth <= 1){
                return '<em title="'+(stat.status? LANG('正常') : LANG('已暂停'))+'" class="G-iconFunc '+(stat.status ? "runing" : "invaild")+'" />';
            }

            var div = td.children('.M-tableListFunctionalAnchor');
            if (!div.length){
                var html = [
                    '<div class="M-tableListFunctionalAnchor" data-type="otherFunc"><div class="M-tableListOtherFunc">',
                    '<a href="javascript:;" data-type="status"><em /></a>',
                    '<span class="spacing"></span>',
                    '<a href="javascript:;" data-action="toggleStatue"></a>',
                    '</div></div>'
                ].join('');
                div = $(html);
            }
            div.find('[data-type="status"]').attr('title', (stat.status? LANG('正常') : LANG('已暂停')));
            div.find('em:first').attr('class', 'G-iconFunc '+(stat.status ? "runing" : "invaild"));
            div.find('[data-action="toggleStatue"]').attr({
                'class':'G-iconFunc '+stat.icon,
                'title':stat.title,
                'data-id':index,
                'data-statue':stat.status
            });

            // 暂时只有创速账户显示添加广告截屏操作按钮；
            var isShow = util.exist(app.config('auth/screenshot'), app.getUserId());
            if(isShow){
                div.find('.M-tableListOtherFunc').append($('<a href="javascript:;" data-action="screenshot"><em /></a>'));
            }
            div.find('[data-action="screenshot"]').attr({
                'title': LANG('广告截屏'),
                'data-campaignName': parentData && parentData.Name || '',
                'data-campaignId': parentData && parentData.Id || '',
                'data-selfName': row.Name || '',
                'data-selfUrl': row.PageUrl || '',
                'data-spotId': row._id
                //,'data-selfData': null	//暂时隐藏
            }).find('em').attr('class', 'G-iconFunc shot');

            return div;
        },
        eventScreenshot: function(evt, elm){
            var el = $(elm);
            var campaignName = el.attr('data-campaignName');
            var campaignId = el.attr('data-campaignId');
            var selfName = el.attr('data-selfName');
            var selfUrl = el.attr('data-selfUrl');
            var selfId = el.attr('data-spotId');
            var selfData = 'c='+campaignId+'&p='+selfId+'&pr=10';

            var data = {
                'action': 'screenshot',
                'url': selfUrl,
                'name': campaignId+' '+campaignName+'_'+selfName,
                'campaign_id': campaignId,
                'spot_id': selfId,
                'data': selfData
            };
            app.data.get(
                '/rest/adpositionscreenshot',
                data,
                this, 'afterScreenshot'
            );
            //$(document).find('a[href="#adScreenshot"]').click();
            return false;
        },
        afterScreenshot: function(err, data){
            if (err){
                //显示错误信息
                app.alert(err.message);
                return false;
            }
            app.notify(LANG('广告位截图中'));
        },
        // 状态过滤按钮的点击事件
        eventStatusClick: function(ev, elm) {
            // 按钮原本已选中时不做任何动作
            var item = $(elm);
            if (item.hasClass('act')){
                return;
            }
            item.addClass('act').siblings().removeClass('act');

            // 取得状态信息
            var param = {
                'subgrid_status': item.attr('data-status') || undefined
            };
            // 刷新本grid
            this.reload(null, param);
        },
        // 广告位名称渲染函数
        renderName:function(i,val,row,cfg){
            var dom = $('<a class="M-tableListWidthLimit" href="'+row.PageUrl+'" target="_blank"/>');
            if (val === ''){
                val = LANG("其他");
                dom.addClass('ti');
            }else if (val === null){
                val = LANG('(空)');
                dom.addClass('tdef');
            }
            return dom.text(val).width(cfg.width).attr("title",val);
        },
        renderChannel: function(i,val,row,con){
            // 子表格中没有AdChannelId来区分活动类型（RTB还是代理）
            // AdxId是RTB;AdSubChannelId是代理
            // 若是RTB,则从config里取值；若是代理，则显示MassMediaName的值
            var exchanges = app.config('exchanges');
            var id = row.AdxId || row.AdSubChannelId || 0;
            var data = util.find(exchanges,id,'id');
            data = data ? data.name : row.MassMediaName;
            return data ? data : LANG('无');
        },
        // 获取活动过滤列表
        getExcludeIds: function(){
            if (this.$exclude_ids){
                return this.$exclude_ids;
            }
            var groups = app.store.get('/campaign/'+this.$campaignId+'/blacklist');

            var list = [];
            var blacks = [];
            var item;
            util.each(groups, function(group){
                if (group.PositionIds && group.PositionIds.length){
                    switch (group.Kind){
                        case 1: // 白名单
                            item = ['include'];
                            item.push.apply(item, group.PositionIds);
                            list.push(item);
                            break;
                        case 2: // 黑名单
                            item = ['exclude'];
                            item.push.apply(item, group.PositionIds);
                            list.push(item);
                            break;
                        default: // 默认黑名单
                            blacks.push.apply(blacks, group.PositionIds);
                            break;
                    }
                }
            });
            if (blacks.length){
                blacks.unshift('exclude');
                list.push(blacks);
            }
            return (this.$exclude_ids = {'list': list, 'last': 'include'});
        },
        // 修改记录过滤状态
        changeStatue: function(id, status, elm){
            var c = this.config;
            app.data.get(
                c.changeUrl,
                {
                    'CampaignId': this.$campaignId,
                    'AdPositionId': id,
                    'Status': status ? 1 : 2
                },
                this, 'afterChangeStatue', [elm, status, id]
            );
        }
        /**
         * 批量操作事件
         * @param  {Object} ev 消息对象
         * @return {Bool}      false
         */
        ,onBatchConfirm:function(ev){
            var data = ev.param.data;
            if(!data.length){
                // 一个都没选
                app.alert(LANG("请先选择一个或多个广告位。"));
            }else{
                var param = {
                    "CampaignId":this.config.sub_id
                    ,"AdPositionIds":data.toString()
                    ,"Status":ev.param.type === "enable" ? 1 : 2
                }
                app.data.get(
                    "/rest/campaignadpositionadd"
                    ,param
                    ,this
                    ,"afterBatchChangeStatus"
                );
            }
            return false;
        }
        /**
         * 批量操作请求完成回调函数
         * @param  {Object}    err   错误信息
         * @param  {Object}    data  服务器返回的数据信息
         * @param  {Array}     param 附加参数数组
         * @return {Undefined}       无返回值
         */
        ,afterBatchChangeStatus:function(err,data,param){
            if(err){
                app.alert(err.message);
                return false;
            }
            // 广告位ID数组
            this.afterChangeStatue(err, data[0]);
            // 清除已选
            this.setSelectRowIds([]);
            param = null;
        }
    });
    exports.adsCampaign = AdsCampaign;

    // 媒体域名表格
    var MediaDomain = app.extend(CampaignSubGrid, {
        init: function(config){
            config = $.extend({
                "cols":[
                    {type:"id"}
                    ,{name:"referer_domain_name",text:LANG('媒体域名') ,type:"index",render:"renderName",width:210}
                ]
                ,'tab': {cols:{
                    'default': ['win_rate']
                }}
                ,'resumeLabel':LANG('启用该域名')
                ,'stopLabel':LANG('过滤该域名')
                ,"sub_field": 'referer_domain_id'
                // 批量操作
                ,"batch":{
                    "list":[
                        {
                            "type":"disabled"
                            ,"text":LANG("批量暂停")
                        }
                        ,{
                            "type":"enable"
                            ,"text":LANG("批量开始")
                        }
                    ]
                    ,"enable":true
                }
            }, config);

            if (config.is_sub_grid){
                switch(_parseSubs(config.sub_param).pop()){
                    case 'campaign':
                    case 'package':
                    case 'product':
                    case 'platform':
                        $.extend(true, config, {
                            'tab':{'cols':{'bid': null}}
                        });
                        break;
                    case 'product':
                        $.extend(true, config, {
                            'tab':{'cols':{'creative':null, 'bid': null, 'cost': null}}
                        });
                        break;
                }
            }

            this.gridType = 'referer_domain';
            if (this.checkTopPrice(config)){
                this.$modifyPrice = true;
                config.cols.splice(2,0,
                    {name:"top_price",render:'renderTopPrice', field:'set_stake'},
                    {name:"adj_price",render:'renderAdjPrice', field:'set_stake'},
                    "win_rate"
                );
            }else {
                util.remove(config.tab.cols['default'], 'win_rate');
            }
            MediaDomain.master(this, 'init', arguments);
            // 添加3个状态过滤按钮
            // 创建容器存放按钮
            //var statusFilterDiv = $('<div class="M-tableListSubGridStatusFilter">' + LANG('状态') + ': </div>');
            //var status = [
            //	{'text': LANG('所有'), 'value': ''},
            //	{'text': LANG('进行中'), 'value': 'include'},
            //	{'text': LANG('已暂停'), 'value': 'exclude'}
            //];
            //util.each(status, function(item, index) {
            //	var statusVal = item.value;
            //	var statusSpan = $('<span data-status="' + statusVal + '">').text(item.text);
            //	if (!statusVal) {
            //		// 默认选中“所有”radio
            //		statusSpan.toggleClass('act');
            //	}
            //	statusSpan.appendTo(statusFilterDiv);
            //});
            //statusFilterDiv.prependTo(this.getLayout('excel'));

            //// 绑定按钮事件
            //this.jq(statusFilterDiv.find('span'), 'click', 'eventStatusClick');
        },
        // 状态过滤按钮的点击事件
        eventStatusClick: function(ev, elm) {
            // 按钮原本已选中时不做任何动作
            var item = $(elm);
            if (item.hasClass('act')){
                return;
            }
            item.addClass('act').siblings().removeClass('act');

            // 取得状态信息
            var param = {
                'subgrid_status': item.attr('data-status') || undefined
            };
            // 刷新本grid
            this.reload(null, param);
        },
        renderName: function(i, val, data,con){
            if (!val){
                return LANG('其他');
            }
            var title = data.referer_domain_title;
            var dom = $('<div class="M-tableListWidthLimit"/>');
            dom.attr('title', title).width(con.width);
            $('<div/>').text(title).appendTo(dom);
            $('<a target="_blank"/>').attr('href', 'http://'+val).text(val).appendTo(dom);
            return dom;
        },
        renderAdjPrice: function(i, val, data){
            if (data.referer_domain_name){
                return MediaDomain.master(this, 'renderAdjPrice', arguments);
            }else {
                return '-';
            }
        }
        /**
         * 批量操作事件
         * @param  {Object} ev 消息对象
         * @return {Bool}      false
         */
        ,onBatchConfirm:function(ev){
            var data = ev.param.data;
            if(!data.length){
                // 一个都没选
                app.alert(LANG("请先选择一个或多个媒体域名。"));
            }else{
                util.each(data,function(item,index){
                    data[index] = 'd'+ item;
                });
                var param = {
                    "CampaignId":this.config.sub_id
                    ,"MediaDomainIds":data.toString()
                    ,"Status":ev.param.type === "enable" ? 1 : 2
                }
                app.data.get(
                    "/rest/campaignadfilteradd"
                    ,param
                    ,this
                    ,"afterBatchChangeStatus"
                );
            }
            return false;
        }
        /**
         * 批量操作请求完成回调函数
         * @param  {Object}    err   错误信息
         * @param  {Object}    data  服务器返回的数据信息
         * @param  {Array}     param 附加参数数组
         * @return {Undefined}       无返回值
         */
        ,afterBatchChangeStatus:function(err,data,param){
            if(err){
                app.alert(err.message);
                return false;
            }
            // 广告位ID数组
            this.afterChangeStatue(err, data[0]);
            // 清除已选
            this.setSelectRowIds([]);
            param = null;
        }
    });
    exports.mediaDomain = MediaDomain;

    //广告尺寸
    var SpotSize = app.extend(CampaignSubGrid, {
        init: function(config){
            config = $.extend(true,{
                "cols":[
                    {type:"id"}
                    ,{name:"spot_size_name",text:LANG('广告尺寸'),type:'index',render:_renderName,width:210}
                ]
                ,'resumeLabel':LANG('启用该尺寸')
                ,'stopLabel':LANG('过滤该尺寸')
                ,"sub_field": 'spot_size_id'
                ,"url":"/rest/listpositionsize"
            }, config);

            if (config.is_sub_grid){
                switch(_parseSubs(config.sub_param).pop()){
                    case 'campaign':
                        $.extend(true, config, {
                            'tab':{'cols':{'bid': null}}
                        });
                        break;
                    case 'medium':
                        $.extend(true, config, {
                            'tab':{'cols':{'bid': null, 'cost': null}}
                        });
                        break;
                }
            }

            this.gridType = 'spot_size';
            if (this.checkTopPrice(config)){
                this.$modifyPrice = true;
                config.cols.push({name:"top_price",render:'renderTopPrice', field:'set_stake'});
                config.cols.push({name:"adj_price",render:'renderAdjPrice', field:'set_stake'});
            }
            SpotSize.master(this, 'init', arguments);
        }
    });
    exports.spotSize = SpotSize;

    //屏次
    var SpotScreen = app.extend(CampaignSubGrid, {
        init: function(config){
            config = $.extend({
                "cols":[
                    {type:"id"}
                    ,{name:"spot_screen_name",text:LANG('屏次'),render:_renderName,width:210,type:'index'}
                ]
                ,'tab':{'cols':{'bid': null}}
                ,'resumeLabel':LANG('启用该屏次')
                ,'stopLabel':LANG('过滤该屏次')
                ,"sub_field": 'spot_screen_id'
                ,"url":"/rest/listpositionsize"
            }, config);

            if (config.is_sub_grid){
                if (_parseSubs(config.sub_param).pop() == 'medium'){
                    $.extend(true, config, {
                        'tab':{'cols':{'cost': null}}
                    });
                }
            }

            this.gridType = 'spot_screen';
            SpotScreen.master(this, 'init', arguments);
        }
    });
    exports.spotScreen = SpotScreen;

    /**
     * 白名单域名
     */
    var WebsitesFilter = app.extend(
        BaseNoDate
        ,{
            init:function(config){
                config = $.extend({
                    "cols":[
                        {'type':'select', 'name':'sel', 'all':1, width:50}
                        ,{"type":"id"}
                        ,{"name":"SiteName","text":LANG("媒体"),"type":"index","width":210}
                        ,{"name":"Domain","text":LANG("域名"),"type":"index"}
                        // ,{"name":"rank","text":LANG("Alex排名")}
                        // ,{"name":"Thruput","text":LANG("日展示量")}
                        // ,{"name":"Ip","text":LANG("独立IP访问量")}
                    ]
                    ,"hasTab":false
                    ,"hasExport":false
                    ,"hasAmount":false
                    ,'sub_field':'DomainHash'
                    // ,"hasPager":false
                    ,"param":{
                        "SiteClassIds":""
                    }
                    ,"url":"/rest/listpositiondomain"
                }, config);
                this.gridType = 'websitesFilter';
                WebsitesFilter.master(this,null,config);
                WebsitesFilter.master(this,"init",arguments);
            }
            ,renderName: function(idx, val, row,con){
                var dom = $('<div class="M-tableListWidthLimit"/>').text(val);
                $('<div/>').width(con.width).text(row.Domain).appendTo(dom);
                return dom;
            }
        }
    );
    exports.websitesFilter = WebsitesFilter;

    var SpotGroup = app.extend(BaseNoDate, {
        init: function(config){
            config = $.extend({
                'cols': [
                    {name:"Id", text:LANG('ID'),type:'fixed',sort:true,align:'center', width:60},
                    {name: 'Name', type:'index',render:'renderName',width:200},
                    {name: 'AdxId', text:LANG('渠道'), format:'formatChannel', align:'center'},
                    //{name: 'PageClass', text:LANG('优酷分类数'), render:'renderYoukuCount',align:'center'},
                    {name: 'SiteClass', text:LANG('域名分类数'), render:'renderSiteClass',align:'center'},
                    {name: 'Domain', text:LANG('域名数量'), render:'renderCount',align:'center'},
                    {name: 'Size', text:LANG('尺寸数量'), render:'renderCount',align:'center'},
                    {name: 'PositionIds', text:LANG('广告位数量'), render:'renderCount',align:'center'},
                    {name: 'Remark', text:LANG('备注'), render:'renderRemark',align:'center', width: 250}
                ],
                'hasTab': false,
                'hasExport': false,
                'hasAmount': false,
                'url': '/rest/listpositioncategory'
            }, config);

            SpotGroup.master(this, null, config);
            SpotGroup.master(this, 'init', arguments);

            this.$youku = app.config('exchange_group/youku');
            var exchanges = this.$channels = {};
            util.each(app.config('exchanges'), function(item){
                exchanges[item.id] = LANG(item.name);
            });
        }
        ,formatChannel: function(val){
            return this.$channels[val] || LANG('未知渠道');
        }
        ,renderName: function(i, val, data,con){
            val = val || LANG('默认分组');
            return $('<span class="M-tableListWidthLimit"/>')
                .attr({'title':val})
                .text(val).width(con.width);
        }
        ,renderRemark: function(i, val, data, con) {
            val = val || '-';
            return $('<span class="M-tableListWidthLimit"/>')
                .attr({'title':val})
                .text(val).width(con.width);
        }
        ,renderYoukuCount: function(idx, val, row, col){
            if (row.AdxId && !util.exist(this.$youku, row.AdxId)){
                return '-';
            }
            return val && val.length || LANG('全部');
        }
        ,renderSiteClass: function(idx, val, row, col){
            if (!val){
                // 兼容广告分组
                val = row.Spots && row.Spots[col.name];
                if(util.exist(this.$youku, row.AdxId)){
                    val = row.Spots && row.Spots.PageClass || [];
                }
            }
            return val && val.length || LANG('全部');
        }
        ,renderCount: function(idx, val, row, col){
            if (!val){
                // 兼容广告分组
                val = row.Spots && row.Spots[col.name];
            }
            return val && val.length || LANG('全部');
        }
    });
    exports.spotGroup = SpotGroup;

    var SpotAddon = app.extend(BaseNoDate, {
        init: function(config){
            config = $.extend(true, {
                'cols': [
                    {type: 'id', text:LANG('优先级')},
                    {name: 'Kind', text:LANG('类型'), render:'renderKind', width: 40},
                    {name: 'Name', type:'index'},
                    {name: 'Size', text:LANG('广告位数量'), render:'renderCount',align:'center', width:100}
                ],
                'list': {
                    "scroll_type":"row",
                    "scroll_size":10
                },
                'hasTab': false,
                'hasExport': false,
                'hasAmount': false,
                'hasPager': false,
                'url': '/rest/listpositioncategory'
            }, config);

            SpotAddon.master(this, null, config);
            SpotAddon.master(this, 'init', arguments);

            var exchanges = this.$channels = {};
            util.each(app.config('exchanges'), function(item){
                exchanges[item.id] = LANG(item.name);
            });
        },
        // 展现类型
        renderKind: function(idx, val){
            var html = '<em class="G-iconFunc {icon}" title="{title}"></em>';
            return html
                .replace('{icon}', (val == 1 ? 'runing' : 'invaild'))
                .replace('{title}', (val == 1 ? LANG('白名单') : LANG('黑名单')));
        },
        // 渲染显示广告位记录名称
        renderName: function(){
            return '-';

        },
        // 渲染计算广告位数量
        renderCount: function(idx, val, row){
            return row.PositionIds && row.PositionIds.length || '--';
        }
    });
    exports.spotAddon = SpotAddon;

    /**
     * 活动诊断
     */
    var Diagnosis = app.extend(
        Base
        ,{
            init:function(config){
                config = $.extend({
                    "cols":[
                        {"type":"id"}
                        ,{"name":"Status","text":LANG("状态"),render:"renderStatus",align:'center'}
                        ,{"name":"Name","text":LANG("尺寸"),"dimType":"Size","type":"index","width":210,render:"renderName"}
                        ,{"name":"Complete","text":LANG("尺寸情况"),"type":"index","width":320,render:"renderSizeStatus"}
                        ,{"name":"Verify","text":LANG("审核情况"),"type":"index","width":320,render:"renderVerifyStatus"}
                        ,{"name":"AllowMaterialNames","text":LANG("素材要求"),"type":"index","width":320,render:"renderAllowMaterialNames"}
                        ,{"name": "request_num"}
                    ]
                    ,"hasSearch":false
                    ,"hasTab":false
                    ,"hasExport":false
                    ,"hasAmount":false
                    ,"auto_load":false
                }, config);
                this.gridType = "diagnosis";
                // icon
                this.$statusIcon = {
                    "1":'<em class="dStatus pass"></em>'
                    ,"2":'<em class="dStatus part"></em>'
                    ,"3":'<em class="dStatus shit"></em>'
                };
                // 文本
                this.$sizeStatusTxt = {
                    "1":LANG("齐全")
                    ,"2":LANG("部分缺少")
                    ,"3":LANG("没有尺寸")
                }
                // 不再这里的话就是没尺寸了
                this.$verifyStatusTxt = {
                    "1":LANG("全部通过")
                    ,"2":LANG("部分通过")
                    ,"3":LANG("没有通过")
                }
                Diagnosis.master(this,null,config);
                Diagnosis.master(this,"init",arguments);
            }
            /**
             * 设置名称列的类型
             * @param {Undefined} type 无返回值
             */
            ,setNameColType:function(type){
                // 0是序号列，1是状态列，2才是要更改的主列
                this.list.config.cols[2].dimType = type;
                this.list.cols[2].dimType = type;
            }
            /**
             * 名称列渲染函数
             * @param  {Number} index   行索引值
             * @param  {Number} val     单元格数据
             * @param  {Object} rowData 行数据
             * @param  {Object} col     列配置
             * @param  {Object} con     单元格对象
             * @return {String}         单元格内部dom
             */
            ,renderName:function(index,val,rowData,col,con){
                if(col.dimType === "Domain"){
                    // 媒体域名时的处理
                    val = '<p>'+rowData.DomainTitle+'</p><a href="'+val+'" title="'+rowData.DomainTitle+'" target="_blank">'+val+'</a>';
                }
                val = $('<div class="M-tableListWidthLimit" />').append(val).width(col.width-5);
                return val;
            }
            /**
             * 渲染尺寸状态
             * @param  {Number} index   行索引值
             * @param  {Number} val     单元格数据
             * @param  {Object} rowData 行数据
             * @return {String}         状态html字符串
             */
            ,renderSizeStatus:function(index,val,rowData){
                return '<p data-type="Complete" data-id="'+rowData.Id+'" data-status="'+val+'">'+(this.$statusIcon[val] && (this.$statusIcon[val]+this.$sizeStatusTxt[val]) || (this.$statusIcon["3"]+this.$sizeStatusTxt["3"]))+'</p>';
            }
            /**
             * 渲染审核状态
             * @param  {Number} index   行索引值
             * @param  {Number} val     单元格数据
             * @param  {Object} rowData 行数据
             * @return {String}         状态html字符串
             */
            ,renderVerifyStatus:function(index,val,rowData){
                return '<p data-type="Verify" data-id="'+rowData.Id+'" data-status="'+val+'">'+(this.$verifyStatusTxt[val] && (this.$statusIcon[val]+this.$verifyStatusTxt[val]) || "-")+'</p>';
            }
            /**
             * 显示加载状态
             * @return {Undefined} 无返回值
             */
            ,showLoading:function(){
                this.list.showLoading();
            }
            /**
             * 分页切换事件
             * @param  {Object}     ev 事件变量
             * @return {Undefined}
             */
            ,onChangePage: function(ev){
                if (this.pager){
                    this.sys_param.page = ev.param;
                    this.sys_param.limit = this.pager.size;
                }
            }
            /**
             * 获取表格的系统参数
             * @return {Object} 参数对象
             */
            ,getParam:function(){
                return this.sys_param;
            }
            // 渲染状态列
            ,renderStatus:function(i, val, data, con){
                var text = (+data.Status == 1) ? LANG('已开启'): LANG('已暂停');
                var className = (+data.Status == 1) ? 'runing': 'suspend';
                return '<div class="G-iconFunc '+className+'" title="'+text+'">';
            }
            // 显示隐藏状态列
            ,toggleStatusCol: function(type){
                // 只有按创意包形式浏览时候才要显示
                if(type == 'Sweety'){
                    this.list.toggleColumn('Status',true);
                }else{
                    this.list.toggleColumn('Status',false);
                }
                if(type == 'AdPosition'){
                    this.list.toggleColumn('AllowMaterialNames',true);
                    this.list.toggleColumn('request_num',true);
                }
                else{
                    this.list.toggleColumn('AllowMaterialNames',false);
                    this.list.toggleColumn('request_num',false);
                }

            }
            ,renderAllowMaterialNames: function(i,val,row,con){
                return ""+(val||'');
            }
        }
    );
    exports.diagnosis = Diagnosis;

    var DiagnosisPop = app.extend(
        Base
        ,{
            init:function(config){
                config = $.extend(true,{
                    "cols":[
                        {"type":"id"}
                        ,{"name":"SweetyNameWithThumb","field":"SweetyName","type":"col","width":0,"align":"left",render:"renderName"}
                        ,{"name":"Name","text":LANG("创意"),"align":"left",render:"renderName"}
                        ,{"name":"SizeLackInfo","text":LANG("尺寸"),"align":"left"}
                        ,{"name":"VerifyStatus","text":LANG("审核状态"),"align":"left",render:this.renderPopGridVerify,"context":this}
                    ]
                    ,"hasSearch":false
                    ,"hasTab":false
                    ,"hasExport":false
                    ,"hasAmount":false
                    ,"auto_load":false
                    ,"hasPager":false
                    ,"list":{
                        "scroll_type":"row"
                        ,"scroll_size":10
                    }
                }, config);
                this.gridType = "diagnosisPop";

                // 审核状态
                this.$verifyStatusTxt = {
                    "0":LANG("待审核")
                    ,"-2":LANG("审核中")
                    ,"-1":LANG("未通过")
                    ,"1":LANG("审核通过")
                }

                DiagnosisPop.master(this,null,config);
                DiagnosisPop.master(this,"init",[config]);

                this.dg(this.el, '.M-grid-thumb img', 'mouseenter mouseleave imageLoad imageError', 'showPreviewImage');
            }
            /**
             * 渲染弹出层审核状态列
             * @param  {Number} index   行索引值
             * @param  {Number} val     单元格数据
             * @param  {Object} rowData 行数据
             * @return {String}         状态html字符串
             */
            ,renderPopGridVerify:function(index,val,rowData){
                return this.$verifyStatusTxt[val] || "-";
            }
            /**
             * 渲染弹出层表格尺寸列
             * @param  {Number} index   行索引值
             * @param  {Number} val     单元格数据
             * @param  {Object} rowData 行数据
             * @return {String}         状态html字符串
             */
            // ,renderPopGridSize:function(index,val,rowData){
            // 	var str = '-'
            // 		,i;
            // 	if(val){
            // 		str = '<ul class="dsPopSizeList">';
            // 		i = 1;
            // 		for(var n in val){
            // 			str += ('<li class="'+(i%2===0 && "even" || "odd")+'">'+n+'</li>');
            // 			i++;
            // 		}
            // 		str += '</ul>';
            // 		i = null;
            // 	}else if(rowData.Width !== undefined){
            // 		str = rowData.Width+"*"+rowData.Height;
            // 	}
            // 	return str;
            // }
            /**
             * 设定要显示的列
             * @param  {Array}  cols 列数组
             * @return {Object}      模块实例
             */
            ,setCols:function(cols){
                this.list.showColumn(cols);
                return this;
            }
            /**
             * 显示加载状态
             * @return {Undefined} 无返回值
             */
            ,showLoading:function(){
                this.list.showLoading();
            }
            ,renderName:function(index,val,rowData){
                return '<div title="'+val+'" class="dsNameLimit">'+val+'</div>';
            }
            ,showPreviewImage:_showPreviewImage
        }
    );
    exports.diagnosisPop = DiagnosisPop;

    // 财务明细列表
    var FinanceDetail = app.extend(
        Base
        ,{
            init:function(config){
                config = $.extend(
                    {
                        "cols":[
                            {type:"id"},
                            {name:"Date",text:LANG('日期'), align:'center', sort:false, width:120, render:"renderDate"},
                            {name:"Type",text:LANG('类型'), align:'center', sort:false, width:120, render:'renderType'},
                            {name:"Source",text:LANG('来源'), align:'center', sort:false, width:120, render:'renderSource'},
                            {name:"Amount",text:LANG("金额"), sort:false, width:120, render:"renderAmount"},
                            {name:"RestAmount",text:LANG("余额"), sort:false, width:120, render:"renderRestAmount"},
                            {name:'Memo', text: LANG('备注'), sort:false, align:'left', render:"renderMemo"}
                        ]
                        ,"sort":"CreateTime"
                        ,"hasTab":false
                        ,"hasExport":false
                        ,"hasAmount":false
                        ,"url":"/campany/listbill"
                    }
                    ,config
                );

                FinanceDetail.master(this,null,config);
                FinanceDetail.master(this,"init",[config]);

            },
            renderType: function(idx, val, row, col){
                return {
                    '0':LANG("其他"),
                    '1':LANG("预充值"),
                    '2':LANG("保证金"),
                    '3':LANG("返款"),
                    '4':LANG("分成"),
                    '5':LANG("扣费"),
                    '6':LANG("收益")
                }[val];
            },
            renderSource: function(idx, val, row, col){
                return {
                        '0':LANG("其他"),
                        '1':LANG("人工"),
                        '2':LANG("RTB"),
                        '3':LANG("在线充值"),
                        '4':LANG("快钱"),
                        '5':LANG("广告监测")
                    }[val]||val;
            },
            renderDate: function(idx, val, row, col){
                return val ? util.dateNumberToDate(val) : '-';
            },
            // 重写onData
            onData: function(err, data, param){
                FinanceDetail.master(this,"onData",arguments);
                this.fire('gridDataLoad', data);
            },
            // 重写onSearch
            // onSearch: function(ev){
            // 	var param = ev.param;
            // 	var UD;
            // 	var SP = this.sys_param;

            // 	SP.Word = UD;
            // 	SP.BeginCreate = UD;
            // 	SP.EndCreate = UD;
            // 	//如果来源里需要按用户名称去搜索的话，需要把 source 置为0，Word 字段传入用户名称的关键字
            // 	if(param == '人工' || param == 'RTB' || param == '在线充值' || param == '快钱'){
            // 		SP.source = null;
            // 	}else{
            // 		SP.source = 0;
            // 	}
            // 	// 普通搜索
            // 	SP.Word = param || UD;

            // 	this.sys_param.page = 1;
            // 	this.load();
            // 	SP.source = null;
            // 	return false;
            // },
            // 渲染金额
            renderAmount: function(idx, val, row, col, td){
                val = util.round0(val, 3);
                // 金额正数字体为绿色，扣费和负数的类型金额为红色
                var color = (row.Type == 5 || /-/g.test(val)) ? 'red' : '#34ad16';
                $(td).css('color', color);
                return LANG("￥")+util.numberFormat(val);
            },
            // 渲染余额
            renderRestAmount: function(idx, val, row, col){
                return (val != null) ? (LANG("￥")+util.numberFormat(util.round0(val, 2))) : '-';
            },
            // 渲染备注
            renderMemo: function(idx, val, row, col){
                if(val){
                    return (val == 'null') ? '' : val
                }else{
                    return '';
                }
            }
        }
    );
    exports.financeDetail = FinanceDetail;

    // 汇总客户列表
    var Customer = app.extend(
        Base
        ,{
            init:function(config){
                config = $.extend(
                    true
                    ,{
                        "cols":[
                            {"type":"id"}
                            ,{"name":"UserName","text":LANG("客户"),"render":"renderName","type":"index","width":260}
                        ]
                        ,"hasTab":true
                        ,"hasExport":true
                        ,"autoLoad":false
                        ,"url":"/admin/listuser"
                        ,'param':{
                            'get_all_info':1
                        }
                    }
                    ,config
                );

                // 作为子表格时拥有campaign子表格
                if (config.is_sub_grid){
                    $.extend(true, config, {
                        'subs':['campaign'],
                        'sub_key' : 'user_id',
                        'sub_field': 'UserId'
                    });
                }

                Customer.master(this,null,config);
                Customer.master(this,"init",[config]);
                this.gridType = "customer";

                // 添加“搜索结果中显示其下属客户”checkbox && 添加“搜索结果中只显示一级客户”checkbox
                $([
                    '<div class="P-collectListShowSub">',
                    '<label>',
                    '<input type="checkbox" value="1" data-type="showChildren">',
                    LANG('搜索结果中显示其下属客户'),
                    '</label>',
                    '</div>',
                    '<div class="P-collectListShowSub">',
                    '<label>',
                    '<input type="checkbox" value="1" data-type="userLevel">',
                    LANG('搜索结果中只显示一级客户'),
                    '</label>',
                    '</div>'
                ].join('')).insertAfter(this.getLayout('search').find('.M-commonSearchUndo'));

                // 绑定事件
                this.jq($('.P-collectListShowSub').find('input'), 'click', 'eventShowSubClick');

            },
            // 过滤checkbox的点击事件
            eventShowSubClick: function(ev, elm) {
                var param = this.sys_param;
                var isChecked = $(elm).prop('checked');
                var type = $(elm).attr('data-type');

                switch (type){
                    case 'showChildren':
                        // 更改搜索参数
                        if (isChecked) {
                            param.showChildren = 1;
                        } else {
                            delete param.showChildren;
                        }
                        // 没有关键字的情况不做任何动作
                        if (!param.Word && !param.Words) {
                            return;
                        }
                        break;
                    case 'userLevel':
                        // 更改搜索参数
                        if (isChecked) {
                            param.userLevel = 1;
                        } else {
                            delete param.userLevel;
                        }
                        break;
                }
                this.load();
            },
            renderName:function(index,val,row,col,td){
                var html = val ? '<p class="userName">'+util.html(val)+(row.IsDeleted ? LANG('（已删除）') : '')+'</p>' : '';
                var dom = $(html + '<p class="emailName">'+util.html(row.Name)+'</p>');
                if (row.Type == 2){
                    var list = app.store.get('/customer_list');
                    var user = app.getUser();
                    var company = util.find(list, row.CreateUserId, 'UserId');
                    if (company && company._id != user.origin_campany_id){
                        val = LANG('所属代理公司: %1 (%2)', company.UserName, company.Name);
                        $('<span class="P-collectListCompanyIcon"/>')
                            .attr('title', val)
                            .prependTo(dom.eq(0));

                    }
                }
                // 如果客户删除，改变背景颜色
                if(row.IsDeleted){
                    $(td).parent().css('background','#FCF9EA');
                }
                return dom;
            }
        }
    );
    exports.customer = Customer;

    // 汇总活动列表
    var CollectCampaign = app.extend(Campaign, {
        init:function(config){
            CollectCampaign.master(this,null,config);
            CollectCampaign.master(this,"init");

            // 添加“搜索结果中显示其下属客户的活动”checkbox
            var showSubLabel = $([
                '<div class="P-collectListShowSub">',
                '<label>',
                '<input type="checkbox" value="1">',
                LANG('搜索结果中显示其下属客户的活动'),
                '</label>',
                '</div>'
            ].join('')).insertAfter(this.getLayout('search').find('.M-commonSearchUndo'));

            // 绑定事件
            this.jq(showSubLabel.find('input'), 'click', 'eventShowSubClick');
        },
        // “搜索结果中显示其下属客户”checkbox的点击事件
        eventShowSubClick: function(ev, elm) {
            var param = this.sys_param;
            var isChecked = $(elm).prop('checked');
            // 更改搜索参数
            if (isChecked) {
                param.showChildren = 1;
            } else {
                delete param.showChildren;
            }
            // 没有关键字的情况不做任何动作
            if (!param.Word && !param.Words) {
                return;
            }

            this.load();
        },
        renderColName: function(i, val, data, con){
            var dom = $('<a class="M-tableListWidthLimit" href="#campaign/more/'+data._id+'" target="_blank"/>');
            if (val === ''){
                val = LANG("其他");
                dom.addClass('ti');
            }else if (val === null){
                val = LANG('(空)');
                dom.addClass('tdef');
            }
            dom.text(val).width(con.width).attr("title",val);
            var title = LANG("所属公司：") + (data.DspUserName || '') + '\n' +" ( "+ (data.DspName || '') + " )";
            $('<span class="P-collectListCompanyIcon"/>').css('margin-right',3).attr('title', title).prependTo(dom);

            return dom;
        }
    });
    exports.collectCampaign = CollectCampaign;

    /**
     * 消息公告列表
     */
    var Message = app.extend(BaseNoDate, {
        init: function(config){
            config = $.extend({
                'cols': [
                    {type: 'id'},
                    {name: 'title', text:LANG('标题'), align:'left',render:'renderName'},
                    {name: 'create_time', text:LANG('发布时间'),align:'center',width:'300'}
                ]
                ,'hasTab': false
                ,'hasExport': false
                ,'hasAmount': false
                ,'hasSearch': true
                ,'url' : 'usermessage/index'
            }, config);

            Message.master(this, null, config);
            Message.master(this, 'init', arguments);
        }
        ,renderName: function(idx, val, row, col, td){
            if(!row.is_read){
                td.parent().css({
                    fontWeight: 'bold'
                })
            }else{
                td.parent().css({
                    fontWeight: 'normal'
                })
            }
            return val;
        }
        ,formatDate: function(val){
            return val?util.date("Y-m-d H:i:s",val):null;
        }
    });
    exports.message = Message;

    /**
     * 消息公告列表
     */
    var MessageMonitor = app.extend(BaseNoDate, {
        init: function(config){
            config = $.extend({
                'cols': [
                    {type: 'id'},
                    {name: 'title', text:LANG('标题'), align:'left',render:'renderName'},
                    {name: 'create_time', text:LANG('发布时间'),align:'center',width:'300'}
                ]
                ,'hasTab': false
                ,'hasExport': false
                ,'hasAmount': false
                ,'hasSearch': true
                ,'url' : 'alarmnotice/index'
            }, config);

            MessageMonitor.master(this, null, config);
            MessageMonitor.master(this, 'init', arguments);
        }
        ,renderName: function(idx, val, row, col, td){
            if(!row.is_read){
                td.parent().css({
                    fontWeight: 'bold'
                })
            }else{
                td.parent().css({
                    fontWeight: 'normal'
                })
            }
            return val;
        }
        ,formatDate: function(val){
            return val?util.date("Y-m-d H:i:s",val):null;
        }
    });
    exports.messageMonitor = MessageMonitor;

    // 新建消息选择联系人弹窗
    var CustomerSelectGrid = app.extend(BaseNoDate, {
        init: function (config) {
            config = $.extend(true,
                {
                    "cols": [
                        {name: "UserId", text: LANG('ID'),align: 'center', width: 70},
                        {name: "UserName", text: LANG("公司名称"), type: "index", align: "left", render: 'renderName'},
                        //{name: "Name", text: LANG("邮箱"), align: "left", width: 250, sort: false},
                        {name: "Type", text: LANG("类型"), align: "center", render: 'renderType', sort: false, width:100},
                        {name: "CategoryId", text: LANG("版本"), align: "center", render: 'renderCategory', sort: false, width:100}
                    ],
                    "is_sub_grid": false,
                    "sort": '',
                    "hasTab": false,
                    "hasAmount": false,
                    "hasExport": false,
                    "hasSelect": true,
                    "url": "campany/listcustomer"
                }, config)
            CustomerSelectGrid.master(this, null, config)
            CustomerSelectGrid.master(this, 'init', config)
            this.gridType = 'customerSelectGrid'

            this.$user = app.getUser();
            if(this.$user.campany_type == 4){
                // 添加“搜索结果中只显示一级客户”checkbox
                var showSubLabel = $([
                    '<div class="P-collectListShowSub">',
                    '<label>',
                    '<input type="checkbox" value="1">',
                    LANG('搜索结果中只显示一级客户'),
                    '</label>',
                    '</div>'
                ].join('')).insertAfter(this.getLayout('search').find('.M-commonSearchUndo'));
                // 绑定事件
                this.jq(showSubLabel.find('input'), 'click', 'eventShowSubClick');
            }

        },
        // “搜索结果中显示其下属客户”checkbox的点击事件
        eventShowSubClick: function(ev, elm) {
            var param = this.sys_param;
            var isChecked = $(elm).prop('checked');

            // 更改搜索参数
            if (isChecked) {
                param.userLevel = 1;
            } else {
                delete param.userLevel;
            }

            this.load();
        },
        renderName: function(index,val,row){
            var className = (+row.ShowAgent) ? "tips" : " ";
            var title = LANG("所属公司：") + row.AgentUserName +" ( "+ row.AgentEmail + " )";
            var html = [
                '<p class="userName" title="'+val+'"><span class="'+className+'" title = "'+title+'"/>',
                val,
                '</p>',
                '<p class="emailName" title="'+row.Name+'">',
                row.Name,
                '</p>'
            ].join('');
            return html;
        },
        // 根据type的数字生成对应类型名称
        renderType: function (i, val, row, con) {
            var result = '';
            switch (val) {
                case 2:
                    result = LANG('直客');
                    break;
                case 3:
                    result = LANG('员工');
                    break;
                case 4:
                    result = LANG('管理员');
                    break;
                default: // 1
                    result = LANG('代理');
                    break;
            }
            return result
        },
        // 根据CategoryId生成对应种类名称
        renderCategory: function (i, val, row, con) {
            var result = '';
            switch (val) {
                case 2:
                    result = LANG('无产品版')
                    break;
                default: // 1
                    result = LANG('有产品版')
                    break;
            }
            return result
        }
    });
    exports.customerSelectGrid = CustomerSelectGrid;

    /**
     * 在线查看广告
     */
    var AdOnline = app.extend(
        Base
        ,{
            init:function(config){
                config = $.extend({
                    "cols":[
                        {"name":"Id","text":LANG("Cookie ID"),"type":"index","width":330}
                        ,{"name":"ExistTime","text":LANG("有效时间"),"width":380,render:"renderExpire",align:"center"}
                    ]
                    ,"hasSearch":false
                    ,"hasTab":false
                    ,"hasExport":false
                    ,"hasAmount":false
                    ,"hasPager":false
                    ,"auto_load":false
                }, config);
                this.gridType = "adOnline";

                AdOnline.master(this,null,config);
                AdOnline.master(this,"init",arguments);
            }
            ,renderExpire:function(index,val,rowData,col,con){
                return val>0 ? Math.ceil(val/60)+"min" : LANG('已过期');
            }
        }
    );
    exports.adOnline = AdOnline;

    // 运营日志
    var RunningLog = app.extend(Base, {
        init: function (config) {
            config = $.extend(true,
                {
                    "cols": [
                        {type: 'id'},
                        {name: "Author", text: LANG("账号"), type: "index", align: "left", width: 250, render: 'renderName'},
                        {name: "Title", text: LANG("标题"), align: "left", width: 450, render: 'renderTitle'},
                        {name: "EditTime", text: LANG("时间"), align: "center", format: 'formatDate'}
                    ],
                    "is_sub_grid": false,
                    "sort": '',
                    "hasTab": false,
                    "hasAmount": false,
                    "hasExport": false,
                    "url": "/operationremark/listoperationremark"
                }, config);

            RunningLog.master(this, null, config)
            RunningLog.master(this, 'init', config)
        },
        renderName:function(i, val, row, con){
            return '<p class="userName">'+row.NickName+'</p><p class="emailName">'+val+'</p>';
        },
        formatDate: function(val){
            return val?util.date("Y-m-d",val):null;
        },
        renderTitle: function(i, val, row, con) {
            var dom = $('<div class="M-tableListWidthLimit" />').width(350);
            return dom.text(val).attr('title',val);
        }
    });
    exports.runningLog = RunningLog;

    // 广告位的活动子表格
    var AdSubCampaign = app.extend(Campaign,{
        init:function(config){
            config = $.extend({
                'functional':{
                    "where":1,
                    "align":'left',
                    "text":LANG("状态"),
                    "render":this.reanderFunctional,
                    "context":this
                }
            }, config);
            AdSubCampaign.master(this,null,config);
            AdSubCampaign.master(this,"init",arguments);
        },
        reanderFunctional: function(index,value,row,col,td,list,rowDom){
            var html = ''
                ,status
                ,rs = row.RunStatus;

            if (row.IsDeleted) {		// 归档的状况
                html += '<a data-func="none" title="'+LANG("已归档")+'" href="#"><em class="G-iconFunc store"/></a>';
            } else if(row.IsDraft){
                html += '<a data-func="none" title="'+LANG("草稿")+'" href="#"><em class="G-iconFunc draft"/></a>';
            }else if (rs >=1 && rs <= 6){
                switch(rs){
                    case 1:
                        html += '<a data-func="budget" title="'+LANG("未开始")+'" href="#"><em class="G-iconFunc unstart"/></a>';
                        break;
                    case 2:
                        html += '<a data-func="budget" title="'+LANG("进行中")+'" href="#"><em class="G-iconFunc runing"/></a>';
                        break;
                    case 3:
                        html += '<a data-func="budget" title="'+LANG("已结束")+'" href="#"><em class="G-iconFunc done"/></a>';
                        break;
                    case 4:
                        html += '<a data-func="budget" title="'+LANG("已暂停")+'" href="#"><em class="G-iconFunc suspend"/></a>';
                        break;
                    case 5:
                        // title = LANG("超预算");
                        html += '<a data-func="budget" title="'+LANG("超预算")+'" href="#"><em class="G-iconFunc overload"/></a>';
                        break;
                }
            }
            html += '<span class="spacing"></span>';



            if (!this.$readOnly && (row.Channel === 1  || row.Channel == 4)){
                // 暂停按钮
                status = row.Status;
                // 暂时屏蔽，后端还未完善 @Edwin,2013.05.13
                // if(this.config.state===false) { status = 3; }
                switch (status){
                    case 1:
                        //未开始的活动，不加暂停按钮
                        if(rs != 1){
                            html += '<a data-func="disable" title="'+LANG("暂停")+'" href="#"><em class="G-iconFunc stop"/></a>';
                        }
                        break;
                    case 2:
                        html += '<a data-func="enable" title="'+LANG("恢复")+'" href="#"><em class="G-iconFunc resume"/></a>';
                        break;
                    default:
                        html += '<a title="'+LANG("无效")+'"><em class="G-iconFunc invaild"/></a>';
                        break;
                }
            }
            return html;
        },
        onListFnClick: function(ev){
            var param = ev.param;
            var id = param.data._id;
            switch (param.func){
                case 'disable':
                case 'enable':
                    // 停止状态不再请求数据
                    if (param.data.RunStatus === 3){ return; }
                    param.Status = (param.func == 'disable' ? 2 : 1);
                    app.data.get(
                        '/rest/stopcampaign',
                        {'Id': id, 'Status': param.Status},
                        this.cbSetStatus, this, param
                    );
                    break;
            }
            return false;
        }
    });
    exports.adSubCampaign = AdSubCampaign;

    // 汇总渠道列表
    var CollectChannel = app.extend(Base,{
        init:function(config){
            config = $.extend({
                "cols":[
                    // {type:"id"}
                    {name:"Id",text:LANG("渠道Id"),type:"index",align:'center',width:80,render:'renderId'}
                    ,{name:"Name",text:LANG("渠道"),type:"index",render:"renderName",width:150}
                ],
                'tab':{
                    'list':[{
                        "text":_T('默认'),
                        "name":"default",
                        "custom":true,
                        "cols":[
                            'request_num'
                            ,'bid_num'
                            ,'impressions'
                            ,'win_rate'
                            ,'show_cost'
                            ,'show_cost_over'
                            ,'show_cost_over2'
                        ]
                    },{
                        "text":_T('DSP'),
                        "name":"c2",
                        "cols":[
                            'request_num'
                            ,'bid_num'
                            ,'impressions'
                            ,'win_rate'
                            ,'avg_reg_cost'
                            ,'avg_click_cost'
                            ,'cpm'
                            ,'back_reg_rate'
                            ,'click_rate'
                            ,'show_cost'
                            ,'show_cost_over'
                            ,'show_cost_over2'
                        ]
                    },{
                        "text":_T('ADX'),
                        "name":"c3",
                        "cols":[
                            'adx_bid_num',
                            'adx_impressions',
                            'adx_clicks',
                            'adx_win_rate',
                            'adx_cost'
                        ]
                    }
                    ],
                    "gridCols":false,
                    "autoComplete":0
                },
                'hasTab': true,
                'hasExport':true,
                'url':'admin/listchannel'
            }, config);
            this.gridType = 'collectChannel';
            CollectChannel.master(this,null,config);
            CollectChannel.master(this,"init",arguments);
        },
        renderId: function(i, val, data, con){
            return $('<div/>').text(val).width(con.width);
        }
    });
    exports.collectChannel = CollectChannel;

    // 账号信息联系人列表
    var LinkmanList = app.extend(Base,{
        init: function(config){
            config = $.extend({
                "cols":[
                    {type:'id', width:50},
                    {name:"CName",text:LANG("姓名"),align:"left",width:80,sort:false},
                    {name:"CPhone",text:LANG("电话"),align:"left",width:150,sort:false},
                    {name:"CEmail",text:LANG("邮箱"),align:"left",width:250,sort:false},
                    {name:"CQQ",text:LANG("QQ"),align:"left",width:100,sort:false},
                    {name:"CCampanyAddress",text:LANG("公司地址"),align:"left",width:300,sort:false}
                ]
                ,"hasTab":false
                ,"hasAmount":false
                ,"hasExport":false
                ,"hasSearch": false
                ,"hasPager": false
                ,"url":""
            }, config);
            LinkmanList.master(this, null, config);
            LinkmanList.master(this, 'init', arguments);
        }
    });
    exports.linkmanList = LinkmanList;

    // 账号信息推广顾问列表
    var AdviserList = app.extend(Base,{
        init: function(config){
            config = $.extend({
                "cols":[
                    {type:'id', width:50},
                    {name:"PName",text:LANG("姓名"),align:"left",width:80,sort:false},
                    {name:"PPhone",text:LANG("电话"),align:"left",width:150,sort:false},
                    {name:"PEmail",text:LANG("邮箱"),align:"left",width:300,sort:false},
                    {name:"PQQ",text:LANG("QQ"),align:"left",width:100,sort:false}
                ]
                ,"hasTab":false
                ,"hasAmount":false
                ,"hasExport":false
                ,"hasSearch": false
                ,"hasPager": false
                ,"url":""
            }, config);
            AdviserList.master(this, null, config);
            AdviserList.master(this, 'init', arguments);
        }
    });
    exports.adviserList = AdviserList;

    // 账号信息发票列表
    var AccountAptitudeList = app.extend(Base,{
        init: function(config){
            config = $.extend({
                "cols":[
                    {type:'id', width:50},
                    {name:"AdxId",text:LANG("渠道"),align:"left",width:80,sort:false, render: 'renderAdxId'},
                    {name:"Aptitude",text:LANG("资质名"),align:"left",width:150,sort:false}
                    // ,{name:"Status",text:LANG("审核状态"),align:"left",width:300,sort:false}
                ]
                ,"hasTab":false
                ,"hasAmount":false
                ,"hasExport":false
                ,"hasSearch": false
                ,"hasPager": false
                ,"url":""
            }, config);
            AccountAptitudeList.master(this, null, config);
            AccountAptitudeList.master(this, 'init', arguments);
        }
        ,renderAdxId: function(i, val, data, con){
            // 渠道信息
            var CHANNEL = app.config('exchanges');
            util.each(CHANNEL, function(item){
                if(val && item.id == val){
                    val = item.name;
                }
            });
            return val;
        }
        // to 审核状态渲染，后端欠
    });
    exports.accountAptitudeList = AccountAptitudeList;

    // 发票详细资料
    var InvoiceDetail = app.extend(
        Base
        ,{
            init:function(config){
                config = $.extend(
                    {
                        "cols":[
                            {type:"id"},
                            {name:"CreateTime",text:LANG('日期'), align:'center', sort:false, width:140},
                            {name:"Amount",text:LANG("发票金额"), render:"renderAmount", sort:false, width:140},
                            {name:'Content', text: LANG('内容'), sort:false, align:'left',width:200,render:'renderContent'},
                            {name:'Status', text:LANG('发票状态'),render:'renderStatus', align:'left'}
                        ]
                        ,"sort":"CreateTime"
                        ,"hasTab":false
                        ,"hasExport":false
                        ,"hasAmount":false
                        ,"hasSearch":false
                        ,"url":"/invoice/listinvoicerecord"
                    }
                    ,config
                );

                InvoiceDetail.master(this,null,config);
                InvoiceDetail.master(this,"init",[config]);
            },
            renderContent: function(i,val,row,con){
                var type = row.Info.Type==1 ? LANG("普通") : LANG("专用");
                var title = LANG("发票内容：") + val;
                return '<p>'+type+'</p><p style="width:180px" class="M-tableListWidthLimit invoiceContent" title="'+title+'">'+val+'</p>';
            },
            renderStatus: function(i,val,row,con){
                var html = [];
                var info = row.StatusInfo;
                var space = "&nbsp;&nbsp;";
                //提交区
                var submitRemark = info.Submit.Remark;
                var submitRemark_title = submitRemark && ('title="'+submitRemark+'"') || '';
                var submit = [
                    '<div class="statusWrap statusSubmit">',
                    '<em class="statusIcon finishIcon"></em>',
                    '<span class="statusType finishFont">'+LANG('提交')+'</span>',
                    '<span class="statusTime">'+util.date("Y-m-d",info.Submit.Time)+'</span>',
                    '<span class="statusNote M-tableListWidthLimit" '+submitRemark_title+'>'+(submitRemark||space)+'</span>',
                    '</div>'
                ].join('');
                //审核区
                var auditRemark = info.Audit.Remark;
                var auditRemark_title = auditRemark && ('title="'+auditRemark+'"') || '';
                var audit = [
                    '<div class="statusWrap statusAudit">',
                    '<em class="statusIcon"></em>',
                    '<span class="statusType finishFont">'+LANG('审核')+'</span>',
                    '<span class="statusTime">'+util.date("Y-m-d",info.Audit.Time)+'</span>',
                    '<span class="statusNote M-tableListWidthLimit" '+auditRemark_title+'>'+(auditRemark||space)+'</span>',
                    '</div>'
                ].join('');
                //寄送区
                var sendRemark = info.Send.Remark;
                var sendRemark_title = sendRemark && ('title="'+sendRemark+'"') || '';
                var send = [
                    '<div class="statusWrap statusSend">',
                    '<em class="statusIcon"></em>',
                    '<span class="statusType">'+LANG('寄送')+'</span>',
                    '<span class="statusTime">'+util.date("Y-m-d",info.Send.Time)+'</span>',
                    '<span class="statusNote M-tableListWidthLimit" '+sendRemark_title+'>'+(sendRemark||space)+'</span>',
                    '</div>'
                ].join('');
                //完成区
                var completeRemark = info.Complete.Remark;
                var completeRemark_title = completeRemark && ('title="'+completeRemark+'"') || '';
                var complete = [
                    '<div class="statusWrap statusComplete">',
                    '<em class="statusIcon"></em>',
                    '<span class="statusType">'+LANG('完成')+'</span>',
                    '<span class="statusTime">'+util.date("Y-m-d",info.Complete.Time)+'</span>',
                    '<span class="statusNote M-tableListWidthLimit" '+completeRemark_title+'>'+(completeRemark||space)+'</span>',
                    '</div>'
                ].join('');
                //拒绝区
                var refusalRemark = info.Refusal.Remark;
                var refusalRemark_title = refusalRemark && ('title="'+refusalRemark+'"') || '';
                var refusal = [
                    '<div class="statusWrap statusRefusal statusHide">',
                    '<em class="statusIcon finishIcon"></em>',
                    '<span class="statusType finishFont">'+LANG('拒绝')+'</span>',
                    '<span class="statusTime">'+util.date("Y-m-d",info.Refusal.Time)+'</span>',
                    '<span class="statusNote M-tableListWidthLimit" '+refusalRemark_title+'>'+(refusalRemark||space)+'</span>',
                    '</div>'
                ].join('');

                // 分隔线
                var line1 = '<div class="statusLine fullLine"></div>';
                var line2 = '<div class="statusLine"></div>';
                var line3 = '<div class="statusLine"></div>';

                //合体
                html.push(submit, line1, audit, line2, send, line3, complete, refusal);
                html = html.join('');
                //临时转换为jq对象
                var wrap = $("<div class='P-invoiceDetailStatusRender'></div>");
                var tmp = $(html).appendTo(wrap);

                switch (val){
                    //待审核，渲染形态
                    case 2:
                        tmp.find('.statusIcon').eq(1).addClass('processIcon');
                        tmp.find('.statusTime').filter('span:gt(0)').html(space);
                        tmp.find('.statusNote').filter('span:gt(0)').html(space);
                        return wrap;
                    //寄送中，渲染形态
                    case 3:
                        tmp.find('.statusIcon').eq(1).addClass('finishIcon');
                        tmp.find('.statusIcon').eq(2).addClass('processIcon');
                        tmp.find('.statusType').eq(2).addClass('finishFont');
                        tmp.filter('.statusLine').eq(1).addClass('fullLine');
                        tmp.find('.statusTime').filter('span:gt(2)').html(space);
                        tmp.find('.statusNote').filter('span:gt(2)').html(space);
                        return wrap;
                    //已完成，渲染形态
                    case 4:
                        tmp.find('.statusIcon').eq(1).addClass('finishIcon');
                        tmp.find('.statusIcon').eq(2).addClass('finishIcon');
                        tmp.find('.statusIcon').eq(3).addClass('finishIcon');
                        tmp.find('.statusType').eq(2).addClass('finishFont');
                        tmp.find('.statusType').eq(3).addClass('finishFont');
                        tmp.filter('.statusLine').eq(1).addClass('fullLine');
                        tmp.filter('.statusLine').eq(2).addClass('fullLine');
                        return wrap;
                    //拒绝，渲染形态
                    case 5:
                        tmp.find('.statusIcon').eq(1).addClass('finishIcon');
                        tmp.filter('.statusSend').addClass('statusHide');
                        tmp.filter('.statusComplete').addClass('statusHide');
                        tmp.filter('.statusLine').eq(2).addClass('statusHide');
                        tmp.filter('.statusLine').eq(1).addClass('fullLine');
                        tmp.filter('.statusRefusal').addClass('statusShow');
                        return wrap;
                    default:
                        return '';
                }
            },
            renderAmount: function(i,val,row){
                return labels.format.currency(val, false);
            }
        }
    );
    exports.invoiceDetail = InvoiceDetail;

    // 汇总广告位列表
    var CollectAds = app.extend(Ads,{
        init:function(config){
            CollectAds.master(this,null,config);
            CollectAds.master(this,"init",arguments);
        },
        getSubParam: function(param){
            // 跳过Ads模块，因为那里额外加上了channel_id
            return Ads.master(this,"getSubParam",[param]);
        }
        ,getSubGridParam: function(param){
            // 之表格为了加get_all_info参数
            return {
                'is_sub_grid': true,
                'sub_exname': param.data[this.gridRowName],
                'sub_param': this.getSubParam(param),
                'sub_param_ex': {
                    get_all_info : 1
                },
                'sub_id': param.data[this.config.sub_field],
                'sub_static': this.config.sub_static,
                'sub_data': param.data,
                'hasSearch': true,
                'hasAdvancedSearch': true,
                'hasAmount': false,
                'target': param.target
            };
        }
    });
    exports.collectAds = CollectAds;

    // 自定义维度
    var MixedDimension = app.extend(Base,{
        init:function(config){
            config = $.extend({
                "cols":[
                    {"type":"id"},
                    {"name":"Status","type":"index", "render": "renderStatus"},
                    {"name":"date","type":"index","text":LANG("日期"),render:'renderDate', width:200},
                    {"name":"Campaign","type":"index","text":LANG("活动"),"render":"renderCampaign",width:200},
                    {"name":"Creative","type":"index","text":LANG("创意包"),"render":"renderCreative",width:200},
                    {"name":"Whisky","type":"index","text":LANG("落地页"),"render":"renderWhisky",width:200},
                    {"name":"Channel","type":"index","text":LANG("渠道"),width:200},
                    {"name":"Zone","type":"index","text":LANG("地区"),"render":"renderZone",width:200}
                    // {"name":"Frequency","type":"index","text":LANG("频次"),"render":"renderName"},
                    // {"name":"Geo","type":"index","text":LANG("地域"),"render":"renderName"},
                    // {"name":"Client","type":"index","text":LANG("客户端"),"render":"renderName"}
                ],
                'url':'dimension/listdimension'
                ,'param': {
                    'Channel':1, //表示RTB渠道，后端要求发送此参数
                    'tmpl':'json'
                }
            }, config);
            MixedDimension.master(this,null,config);
            MixedDimension.master(this,"init",arguments);
        },
        renderStatus:function(i, val, data, con){
            // @todo 如果没有此字段，要隐藏
            var text = (+data.Status == 1) ? LANG('已开启'): LANG('已暂停');
            var className = (+data.Status == 1) ? 'runing': 'suspend';
            return '<div class="G-iconFunc '+className+'" title="'+text+'">';
        },
        renderCampaign: function(i, val, data, con){
            var dom = $('<div class="M-tableListWidthLimit"/>').width(con.width);
            $('<a target="_blank"  href="#campaign/more/'+data.campaign_id+'"/>').text(val).appendTo(dom);
            return dom;
        },
        renderCreative: function(i, val, data, con){
            var dom = $('<div class="M-tableListWidthLimit"/>').width(con.width);
            $('<a target="_blank"  href="#campaign/creativePreview/'+data.package_id+'"/>').text(val).appendTo(dom);
            return dom;
        },
        renderWhisky: function(i, val, data, con){
            var dom = $('<div class="M-tableListWidthLimit"/>').width(con.width);
            $('<a target="_blank"  href="#campaign/creativePreview/'+data.WhiskyPreviewUrl+'"/>').text(val).appendTo(dom);
            return dom;
        },
        renderZone: function(i, val, data, con){
            var path = window.BASE('resources/images/geo/');
            return '<i class="vmiddle"><img src="'+path+data.country_icon+'.png" alt=""> '+data.country_name+" "+data.region_name+'</i>';
        },
        renderDate: function(i, val, data, con){
            return $('<div />').text(val).width(con.width);
        },
        onChangeSort: function(){
            // 清空排序参数
            this.setParam({
                order:null
            });
            this.sys_param.order = this.list.getSort();
            this.load();
            return false;
        }
    });
    exports.mixedDimension = MixedDimension;

    // 过滤 -自定义维度
    var MixedDimensionFilter = app.extend(Base,{
        init:function(config){
            config = $.extend({
                "cols":[
                    {"type":"id"},
                    {"name":"Name","type":"index","text":LANG("名称"),"render":"renderName"}
                ],
                "hasTab": false,
                "hasExport": false,
                "hasAmount": false,
                "hasSelect": true
            }, config);
            MixedDimensionFilter.master(this,null,config);
            MixedDimensionFilter.master(this,"init",arguments);
        },
        renderName: function(i, val, data, con){
            return data.Name;
        }
    });
    exports.mixedDimensionFilter = MixedDimensionFilter;

});