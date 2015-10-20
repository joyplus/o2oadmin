define(function(require,exports){
    var $ = require('jquery');
    var app = require('app');
    var view = require('view');
    var common = require('common');
    var util = require('util');
    var hChart = require("libs/charts/highcharts");

    // 颜色
    var colors = (function(){
        // 默认颜色
        var colors = ["#1899d7","#16be00","#ffa200","#ff1800"];
        var color = 0;
        for (var i=0; i<36; i++){
            colors.push(util.hsb2rgb(color, 0.33, 0.88));
            color += 130;
        }
        return {colors:colors};
    })();

    /**
     * 图表的默认设置
     * @type {Object}
     * @private
     */
    var DEFAULT_SET = {
        "build":{
            // x轴设定
            "xAxis":{
                // 坐标分割线宽度
                "gridLineWidth":1
                // 分割步长
                ,"tickInterval":2
                ,"tickmarkPlacement":"on"
                // 坐标分割线样式
                ,"gridLineDashStyle":"longdash"
                // 坐标分割线颜色
                ,"gridLineColor":"#c0e8f0"
                // 坐标上显示的文字设定
                ,"labels":{
                    // 文字样式
                    "style":{
                        "font":"normal 11px Verdana, sans-serif"
                    }
                    // 步长
                    ,"step":1
                    // 标签到坐标轴的距离
                    ,"y":20
                }
            }
            // y轴设定。部分设定请参照x轴
            ,"yAxis":{
                // y轴上显示的标题
                "title":{
                    "text":null
                }
                // 可显示的最小值
                ,"min":0
                ,"gridLineWidth":1
                ,"gridLineColor":"#eeeeee"
                ,"gridLineDashStyle":"longdash"
                ,"plotLines": [{
                    "value":0
                    ,"width":1
                    ,"color":"#808080"
                }]
            }
            // 图表设定
            ,"chart": {
                // 间距
                "margin":[50,80,100,100]
                // 图表背景
                ,"backgroundColor":null
                // 图表边框
                ,"borderColor":null
                // 图表主样式
                ,"style":{
                    "fontFamily":"'Microsoft YaHei',Verdana, Arial, Helvetica, sans-serif"
                }
            }
            // 版权
            ,"credits":{
                "enabled":false
            }
            // 图表标题
            ,"title":null
            // 信息浮动层
            ,"tooltip":{
                // 关联所有同X坐标的series
                "shared":true
                // 标识线样式
                ,"crosshairs":{
                    "width":1
                    ,"color":"red"
                    ,"dashStyle":"DashDot"
                }
                ,"backgroundColor":"#ffffff"
            }
            ,"legend":{
                labelFormatter:function(){
                    return this.name.length > 10 ? this.name.substr(0,10)+"...":this.name;
                }
            }
            ,"plotOptions":{
                "areaspline":{
                    // 线大小
                    "lineWidth":1.5
                    // 填充的不透明度
                    ,"fillOpacity":0.1
                    // 是否显示阴影
                    ,"shadow":false
                }
                ,"series":{
                    "marker":{
                        "lineWidth":1
                        ,"symbol":"circle"
                    }
                    ,"dataLabels":{
                        // "enabled":true
                    }
                    // ,"dashStyle":"longdash"
                }
            }
        }
    }

    /*
     series配置对象格式
     {
     group: <分组维度名称, 按该维度的值把数据分组>
     label_field: <X轴显示标签属性名称>
     label_format: <X轴显示标签格式化回调函数>
     x_field: <维度属性名称>
     x_format: <X轴显示信息格式化>
     y_field: <指标属性名称>
     y_format: <Y轴显示信息格式化> : 可以返回null过滤不符合要求的记录
     init: <series 初始化回调函数>
     param: <series 附加配置参数>
     filter: <记录过滤参数对象 / 过滤检查函数(返回true/false)>,
     }
     */
    function Chart(config, parent){
        config = $.extend(
            true
            ,{
                'class': 'M-chart', // 图表容器类名称
                'type': 'none', // 图表类型
                'target': parent, // 图表位置
                'title': null, // 图表标题
                'loading': LANG('资料加载中..'), // Loading提示信息
                'empty': LANG('没有数据'),
                'url': null, // 图表数据拉取点
                'param': null, // 数据请求参数
                'export': false, // 是否有导出选项
                'series': null, // 图表数据配置选项
                'context': null, // 回调函数的作用域对象
                'height': 500,
                'width': 700,
                'build':{}
            }
            ,colors
            ,DEFAULT_SET
            ,config
        );

        if(util.isArray(config.build.yAxis)){
            var tmp = config.build.yAxis
                ,tmp2 = DEFAULT_SET.build.yAxis;

            // 多纵坐标
            for(var i =0;i<tmp.length;i++){
                tmp[i] = $.extend(
                    true
                    ,{}
                    ,tmp2
                    ,tmp[i]
                );
            }

            tmp = tmp2 = null;
        }

        Chart.master(this, null, config);

        // 默认chart渲染参数设置
        var build_cfg = this.config.build;
        build_cfg.chart.width = config.width;
        build_cfg.chart.height = config.height;
        if (!build_cfg.chart.renderTo){
            build_cfg.chart.renderTo = this.el.get(0);
        }
        if (config.title){
            build_cfg.title = {text: config.title};
        }

        // 如果series是一个对象的话, 转换成一个数组项
        if (this.config.series && !util.isArray(this.config.series)){
            this.config.series = [this.config.series];
        }

        // 默认对象数据
        this.$cats = null;
        this.$data = null;
    }
    extend(Chart, view.container, {
        /**
         * 模块初始化生成函数
         * @return {None} 无返回
         */
        init: function(){
            Chart.master(this, 'init');
            var c = this.config;

            // 生成导出按钮控件
            if (c['export']){
                this.create('export', common.excelExport, c['export']);
            }

            // 生成图表
            this.$chart = new hChart.Chart(this.config.build);
            this.$chartCon = $(this.$chart.container);
            // 提示信息容器
            this.$tip = $('<div class="M-chartTip"/>').appendTo(this.el);
            this.fire('sizeChange');
        },
        toggleLoading: function(show){
            var tip = this.$tip;
            this.$chartCon.toggle(!show);
            tip.removeClass('M-chartEmpty');
            if (show){
                tip.addClass('M-chartLoading').show().text(this.config.loading);
            }else {
                tip.removeClass('M-chartLoading').hide();
            }
        },
        toggleEmpty: function(show){
            var tip = this.$tip;
            this.$chartCon.toggle(!show);
            tip.removeClass('M-chartLoading');
            if (show){
                tip.addClass('M-chartEmpty').show().text(this.config.empty);
            }else {
                tip.removeClass('M-chartEmpty').hide();
            }
        },
        toggleSeries: function(index, state){
            var serie = this.$chart.series[index];
            if (serie){
                if (state !== true && state !== false){
                    state = serie.visible;
                }
                if (state){
                    serie.show();
                }else {
                    serie.hide();
                }
            }
        },
        /**
         * 重置图表内容
         * @return {None} 无返回
         */
        reset: function(){
            // 移除图像数据
            var series = this.$chart.series;
            while (series.length > 0){
                series[0].remove(false);
            }
            this.$chart.redraw();
        },
        /**
         * 设置图表数据, 并更新显示图表
         * @param {Array} list 数据对象数组
         */
        setData: function(list){
            this.reset();
            if (!list || !list.length){
                this.toggleEmpty(true);
                return;
            }

            this.formatData(list);

            if (this.$data.length){
                this.toggleEmpty(false);
                // 设置X轴标签
                if (this.$cats){
                    this.$chart.xAxis[0].setCategories(this.$cats);
                }

                // 添加图表数据集
                util.each(this.$data, function(serie){
                    this.$chart.addSeries(serie, false);
                }, this);
                this.$chart.redraw();
            }else {
                // 数据被过滤后没有合适的数据
                this.toggleEmpty(true);
            }
        },
        /**
         * 格式化列表数据, 生成各个需要的图表数据组
         * @param  {Array} data 数据对象数组
         * @return {Array}      HightChart使用的series列表数组
         */
        formatData: function(data){
            var UD, c = this.config;
            var series = this.$data = [];
            var cats = [];
            var ctx = c.context || this;

            util.each(c.series, function(cfg){
                var list = {};
                util.each(data, function(item){
                    if (cfg.filter && !cfg.filter.call(ctx, item, cfg)) {return;}

                    var id, d;
                    if (cfg.group && util.has(item, cfg.group)){
                        d = id = item[cfg.group];
                    }else {
                        id = 'main'; d = null;
                    }
                    if (util.has(list, id)){
                        d = list[id];
                    }else {
                        d = list[id] = $.extend({
                            name: cfg.text || d,
                            yAxis: cfg.y_axis || 0,
                            data: []
                        }, cfg.param);
                        if (cfg.init && util.isFunc(cfg.init)){
                            // 参数说明: 配置对象, 数据行, 配置信息
                            cfg.init.call(ctx, d, item, cfg);
                        }
                    }
                    id = d.data.length;

                    var val={x:id};
                    var v = util.own(item, cfg.y_field);
                    if (cfg.y_format && util.isFunc(cfg.y_format)){
                        // 参数说明: 记录对象, 当前值, 数据行, 数据行号
                        v = cfg.y_format.call(ctx, v, val, item, id);
                    }
                    if (v !== UD){
                        val.y = +v;

                        v = util.own(item, cfg.x_field);
                        if (cfg.x_format && util.isFunc(cfg.x_format)){
                            // 参数说明: 记录对象, 当前值, 数据行, 数据行号
                            v = cfg.x_format.call(ctx, v, val, item, id);
                        }
                        if (v !== UD) {val.x = v;}

                        v = util.own(item, cfg.label_field);
                        if (cfg.label_format && util.isFunc(cfg.label_format)){
                            // 参数说明: 记录对象, 当前值, 数据行, 数据行号
                            v = cfg.label_format.call(ctx, v, val, item, id);
                        }
                        if (v !== UD) {cats[val.x] = v;}

                        d.data.push(val);
                    }

                });

                util.each(list, function(serie){
                    if (serie.data.length <= 0) {return;}
                    serie.color = c.colors[series.length % c.colors.length];
                    series.push(serie);
                });
            });

            if (cats.length > 0){
                this.$cats = cats;
            }
            series = cats = null;
            return this.$data;
        },
        /**
         * 指定参数加载远端数据
         * @param  {Object} param <可选> 要提交到服务器端的GET参数
         * @param  {Boolean} replace_param <可选> 是否替换请求参数
         * @return {Boolean}      返回是否成功发出请求
         */
        load: function(param, replace_param){
            var c = this.config;
            if (!c.url){
                app.error('Chart load data with no url!');
                return false;
            }
            this.toggleLoading(true);
            if (!c.param || replace_param){
                c.param = param || null;
            }else {
                util.merge(c.param, param);
            }
            this.$ajax_id = app.data.get(c.url, c.param, this);
            return (this.$ajax_id > 0);
        },
        /**
         * 服务器数据返回响应回调函数
         * @param  {Object} err  请求错误信息对象
         * @param  {Object} data 请求数据结果
         * @return {Boolean}     返回false阻止事件冒泡
         */
        onData: function(err, data){
            this.toggleLoading(false);
            if (err){
                this.setData(null);
                app.alert(err.message);
                return false;
            }
            this.setData(data.items);
            return false;
        },
        /**
         * 对象销毁前处理函数, 调用chart对象的销毁函数销毁图表对象
         * @return {None} 无返回
         */
        beforeDestroy: function(){
            this.$chart.destroy();
            Chart.master(this, 'beforeDestroy');
        },
        getChart:function(){
            return this.$chart;
        },
        setSeries: function(index, option){
            var serie = this.$chart.series[index];
            if (serie){
                serie.update(option);
                var c = this.config;
                c.series[index] = $.extend(true, c.series[index], option);
            }
            return this;
        }
    });
    exports.base = Chart;

    /**
     * 直线图类型模块
     */
    function Line(config){
        config = $.extend(true,{
            build: {
                chart: {
                    defaultSeriesType: 'areaspline'
                }
            }
        }, config);

        Line.master(this, null, config);
    }
    extend(Line, Chart);
    exports.line = Line;

    var AdvChart = app.extend(
        view.container
        ,{
            init:function(config){
                config = $.extend(
                    true
                    ,{
                        // 时间粒度
                        "viewtb":0
                        // 数据接口
                        ,"url":"/rest/trend"
                        ,"class":"M-chartAdv"
                        ,"param":{
                            "no_limit":1
                            ,"type":"campaign"
                            // ,"begindate":""
                            // ,"enddate":""
                        }
                        // 图表配置
                        ,"chart":{
                            "height":270
                            ,"build":{
                                "chart": {
                                    // 间距
                                    "margin":[30,20,60,70]
                                }
                                ,"legend":{
                                    "borderWidth":0
                                }
                                ,"plotOptions":{
                                    "series":{
                                        // 平时不显示数据点
                                        "marker":{
                                            "enabled":false
                                        }
                                    }
                                }
                            }
                        }
                        /*
                         {
                         "module":""
                         ,"config":{}
                         }
                         */
                        ,"grid":1
                        // 允许改变指标
                        ,"allowChangeIndex":false
                        // 允许切换时间粒度
                        ,"allowChangeTimerange":true
                        // 允许切换图表类型
                        ,"allowChangeType":false
                        // 要排除的指标
                        ,"excludeIndexs":null
                        // 默认显示的指标
                        ,"defIndex":null
                        // 支持的指标
                        ,"indexs":null
                        // 图表类型
                        ,"type":"line"
                        // 可添加的统计数据总量
                        ,"max":3
                        // 折叠状态
                        ,"collapse":1
                        // 是否已折叠
                        ,"hasCollapse":1
                        // x轴要显示的字段
                        ,"label_field":"trend_key"
                        // 图表x轴步长。
                        ,"xAxisSetp":6
                        // 表格每页显示页数
                        ,"table_size":20
                        // 是否显示标题
                        ,"hasTitle":true
                        // 默认标题
                        ,"title":LANG("标题")
                        // 是否有汇总
                        ,"hasTotal":true
                        // 自动抓取数据
                        ,"autoLoad":true
                        // 主判断键名
                        ,"key":"_id"
                        // 请求conditions字段的配置
                        // 当有多个要传递或传递的conditions与param中的type不同时使用
                        // key代表condition，对应的值表示取数据中的某个字段
                        // eg.{"user":"Id","status":"RunStatus"}
                        ,"conditions":null
                        // 每个condition的后缀
                        ,"conditionSuffix":"_id"
                        // 是否在参数中传递condition
                        ,"hasCondition":true
                    }
                    ,config
                );
                AdvChart.master(this,null,config);
                AdvChart.master(this,"init",[config]);

                // 图表里的设定是/2的
                this.config.xAxisSetp = Math.ceil(this.config.xAxisSetp/2);

                // 数据
                this.$data = {
                    // 总量
                    "0":null
                };

                // 支持的指标
                this.$indexs = this.config.indexs;

                this.$defIndex = this.config.defIndex;

                // 当前指标
                this.$nowIndex = this.config.defIndex;

                // 指标相关的设置项
                this.$indexsLabels = [];

                // 标签设定
                this.$labels = null;

                // 加载状态
                this.$loading = false;

                // 正在等待加载的请求数量
                this.$waitting = 0;

                // 正在请求的ajax请求id
                this.$waittingXhrIds = {};

                this.$param = {};

                // 图表类型
                this.$type = this.config.type !== "advChart" ? this.config.type : "line";

                // 时间粒度
                this.$timerange = this.config.viewtb;
                this.config.param.viewtb = this.$timerange;

                // 添加的趋势数量
                this.$serieNum = 0;
                this.$serieIndex = 0;

                // 当前模式
                this.$mode = 0;

                // 当前页数
                this.$nowPage = 1;

                // 标题模板
                this.$titleTpl = "{date} {type}";

                // 标题上显示的时间
                this.$titleDate = "";

                // 条数关系
                this.$seriesNumMap = {};

                this.doms = {
                    "index":null
                    ,"time":null
                    ,"collapse":null
                    ,"chart":null
                    ,"main":null
                    ,"refresh":null
                    ,"mode":null
                }

                // 模块状态
                this.ready = false;

                this.$collapse = this.config.collapse;

                var me = this;
                // 读表格的labels,时间条
                require.async(["grid/labels","views/datebar","grid"],function(labels,datebar,grid){
                    me.config.param = $.extend(
                        me.config.param
                        ,datebar.getDate()
                    );
                    me.getIndexSetting(labels)
                        .build(grid);

                    // 数据加载
                    // 启用自动加载且不说折叠状态下才加载数据
                    if(me.config.autoLoad && !me.$collapse){
                        me.load(me.config.param,0);
                    }
                    me = labels = datebar = grid = null;
                });
            }
            /**
             * 获取图表支持的指标相关设定
             * @param  {Object} labels 表格指标设定模块
             * @return {Object}        模块实例
             */
            ,getIndexSetting:function(labels){
                labels = labels && labels.labels.config || {};
                this.$labels = labels;
                if(!this.ready){
                    var tmp = app.config("default_tab_cols")
                    // 初始是否设置了指标
                        ,tmp2 = !!this.config.indexs
                        ,conf = this.config;

                    this.$indexs = this.$indexs || [];

                    for(var n in tmp){
                        if(n === "default"){
                            if(!this.$nowIndex){
                                // 没有设定默认显示的则采用表格默认设置的第一个
                                this.$nowIndex = tmp[n] && tmp[n].cols && tmp[n].cols[0] || null;
                                if(!this.$nowIndex){
                                    this.$nowIndex = labels["impressions"];
                                    this.$nowIndex.field = "impressions";
                                    this.$nowIndex.label_field = conf.label_field;
                                    app.log("默认指标设置失败，将采用展示量(impressions)作为默认指标");
                                }
                            }
                        }else if(tmp[n] && tmp[n].cols){
                            if(tmp2){
                                // 有设置初始指标则不去获取表格固定设置的
                                break;
                            }
                            this.$indexs = this.$indexs.concat(tmp[n].cols);
                        }
                    }

                    if(util.isArray(conf.excludeIndexs) && conf.excludeIndexs.length){
                        tmp = this.$indexs+",";
                        for(var i = 0,len = conf.excludeIndexs.length;i<len;i++){
                            // 干掉要排除的
                            tmp = tmp.replace(conf.excludeIndexs+",","");
                        }
                        tmp = tmp.substr(0,tmp.length-1).split(",");
                        this.$indexs = tmp;
                    }

                    // 生成下拉菜单能识别的数据格式
                    for(var j = 0,l = this.$indexs.length;j<l;j++){
                        tmp = labels[this.$indexs[j]] || {};
                        tmp2 = {
                            "text":tmp.text
                            ,"field":tmp.name || tmp.field || this.$indexs[j]
                            ,"label_field":conf.label_field
                        }
                        tmp2.y_field = tmp2.field;
                        if(this.$indexs[j] === this.$nowIndex){
                            // tmp2.text = LANG("汇总");
                            this.$nowIndex = tmp2;
                            this.$defIndex = tmp2;
                        }
                        this.$indexsLabels.push(tmp2);
                    }

                    tmp = labels = tmp2 = conf = null;
                }
                return this;
            }
            /**
             * 界面构造
             * @return {Object} 模块实例
             */
            ,build:function(grid){
                if(!this.ready){
                    var conf = this.config;
                    this.doms.main = $('<div class="M-chartAdvMain"></div>').appendTo(this.el);

                    if(conf.grid){
                        this.doms.mode = $('<div class="M-chartAdvModeBox"></div>').appendTo(this.doms.main);
                        this.create(
                            "mode"
                            ,common.buttonGroup
                            ,{
                                "items":[LANG("图"),LANG("表")]
                                ,"target":this.doms.mode
                                ,"selected":this.$mode
                            }
                        );
                    }

                    // 指标类型
                    if(conf.allowChangeIndex){
                        this.doms.index = $('<div class="M-chartAdvIndexBox"></div>').appendTo(this.doms.main);
                        this.create(
                            "index"
                            ,common.dropdown
                            ,{
                                "target":this.doms.index
                                ,"width":140
                                ,"options":this.$indexsLabels
                                ,"def":this.$nowIndex.text
                                // ,"data":this.$nowIndex
                                ,"name":"text"
                                ,"key":"field"
                                ,"drag":false
                            }
                        );
                    }

                    // 标题
                    // 这里的标题用完后会被干掉，chart不会再用到
                    if(conf.hasTitle){
                        this.config.title = this.config.title && this.config.title+" "+this.$nowIndex.text || this.$nowIndex.text;
                        this.doms.title = $('<div class="M-chartAdvTitleBox">'+this.config.title+'</div>').appendTo(this.doms.main);
                        delete this.config.title;
                    }

                    this.doms.refresh = $('<div class="M-chartAdvRefreshBox"><input class="btn" value="'+LANG("刷新")+'" type="button" disabled="disabled" /></div>').appendTo(this.doms.main);
                    this.doms.refresh = this.doms.refresh.find("input:first");
                    this.jq(this.doms.refresh,"click","refreshHandler");

                    // 时间粒度
                    if(conf.allowChangeTimerange){
                        this.doms.time = $('<div class="M-chartAdvTimeBox"></div>').appendTo(this.doms.main);
                        this.create(
                            "time"
                            ,common.timeRange
                            ,{
                                "target":this.doms.time
                                ,"selected":this.$timerange
                            }
                        );
                    }

                    if(conf.allowChangeType){
                        // 图表类型
                    }

                    // 设定图表添加区域
                    this.doms.chart = $('<div class="M-chartAdvChart"></div>').appendTo(this.doms.main);
                    // 完成配置
                    this.config.chart.target = this.doms.chart;
                    if(conf.hasTotal){
                        // 有汇总
                        var series = $.extend({},this.$nowIndex);
                        series.text = series.text + LANG("汇总");
                        series.label_field = this.config.label_field;
                        series.y_field = 'm_' + (this.$serieIndex++);
                        this.config.chart.series = [series];
                        this.$serieNum++;
                    }else{
                        this.config.chart.series = [];
                    }
                    this.config.chart.width = this.config.chart.width || this.el.width();

                    this.create("chart", exports[this.$type], this.config.chart);
                    this.$chart = this.$.chart.getChart();

                    // 表格
                    if(conf.grid){
                        this.doms.grid = $('<div class="M-chartAdvGrid"></div>').appendTo(this.doms.main);
                        this.create(
                            "grid"
                            ,grid.periodGrid
                            ,{
                                "target":this.doms.grid
                                ,"auto_load":false
                                ,"export_url": conf.url
                                ,"param": conf.param
                                ,"sort": ''
                            }
                        );
                        this.create(
                            "pager",
                            common.pager
                            ,{
                                "showSizeTypes":0
                                ,"target":this.doms.grid
                            }
                        );
                        this.$.pager.hide();
                    }

                    // 折叠功能
                    if(conf.hasCollapse){
                        this.doms.collapse = $('<div class="M-chartAdvCollapse"><div><p data-close="0"><em></em><b></b><span></span><i></i></p></div></div>').appendTo(this.el);
                        this.doms.collapseBtn = this.doms.collapse.find("p:first");
                        this.toggleChart(!this.$collapse);
                        this.jq(this.doms.collapseBtn,"click mouseenter mouseleave","collapseHandler");
                    }

                    this.ready = true;
                }
                grid = null;
                return this;
            }
            /**
             * 修改标题
             * @param  {String} title 新的标题
             * @return {Object}       实例对象
             */
            ,changeTitle:function(title){
                if(this.config.hasTitle && this.doms.title){
                    if(util.isObject(title)){
                        title = this.getTitleText(title);
                    }else if(!title){
                        title = this.getTitleText();
                    }
                    this.doms.title.text(title);
                }
                return this;
            }
            /**
             * 切换显示图表，表格
             * @param  {Number} mode 类型索引
             * @return {Object}      模块实例
             */
            ,switchMode:function(mode){
                if(mode !== undefined){
                    this.$mode = parseInt(mode,10);
                }
                this.doms.chart.toggle(this.$mode === 0);
                this.doms.grid.toggle(this.$mode === 1);
                if(this.config.allowChangeIndex){
                    this.$.index[this.$mode ? "hide" : "show"]();
                }
                if(this.$mode){
                    this.$.grid.setData(
                        this.buildGridData()
                    );
                }else{
                    this.multipleLoad();
                }
                return this;
            }
            /**
             * 获取表格数据
             * @return {Array}  数据数组
             */
            ,buildGridData:function(){
                var list = []
                    ,data = this.$data[0];

                for(var i = 0,l = (data && data.length || 0);i<l;i++){
                    if(!this.$timerange || i < this.config.table_size){
                        list.push(data[i]);
                    }else{
                        break;
                    }
                }
                data = null;
                return list;
            }
            ,buildChartData: function(){
                var self = this;
                var data = [];
                var key = self.$nowIndex.field;
                var label_key = self.config.label_field;
                var labels = self.$labels;
                var formater = labels[key] && util.isFunc(labels[key].format) && labels[key].format || null;
                var series = self.$.chart.config.series;

                util.each(self.$data, function(serie, idx){
                    if ( !series[idx] ) {
                        return;
                    }
                    var filed = series[idx].y_field;
                    util.each(serie, function(node, id){
                        var item = data[id];
                        if (!item){
                            item =  data[id] = {};
                            item[label_key] = node[label_key];
                        }
                        data[id][filed] = self._getKeyData(node,key,formater);//node[key];
                    })
                })
                return data;
            }
            /**
             * 刷新按钮响应函数
             * @param  {Object} ev 鼠标事件
             * @return {Bool}      false
             */
            ,refreshHandler:function(ev){
                // if(!this.$waitting){
                // 没有正在请求的连接才可发起新的请求
                this.multipleLoad();
                // this.toggleRefreshStatus(true);
                // }
                return false;
            }
            /**
             * 切换模式
             */
            ,onChangeButton: function(ev){
                this.switchMode(ev.param.selected);
                return false;
            }
            /**
             * 切换刷新按钮状态
             * @param  {Bool}      status 按钮状态
             * @return {Undefined}        无返回值
             */
            ,toggleRefreshStatus:function(status){
                this.doms.refresh.attr(
                    "disabled"
                    ,status
                );
            }
            /**
             * 折叠功能响应函数
             * @param  {Object} ev 消息对象
             * @return {Bool}      false
             */
            ,collapseHandler:function(ev){
                if(ev.type === "click"){
                    // 切换状态
                    var open = this.$collapse;
                    this.toggleChart(open);
                    if(open){
                        // 如果打开则加载数据
                        this.multipleLoad();
                    }
                }else{
                    this.doms.collapse[
                    ev.type === "mouseenter" && "addClass" || "removeClass"
                        ]("actCol");
                }
                return false;
            }
            /**
             * 重置
             * @return {Undefined} 无返回值
             */
            ,reset:function(){
                this.abort();
                this.$nowIndex = this.$defIndex;
                this.$timerange = this.config.viewtb;
                this.$mode = 0;
                this.$.mode.setData(this.$mode);
                this.$data = {
                    "0":null
                };
                this.$loading = false;
                this.$waitting = 0;
                this.$waittingXhrIds = {};
                this.$param = {};
                this.$serieNum = 0;
                if(this.config.hasTitle){
                    this.changeTitle("");
                }
                if(this.config.allowChangeIndex){
                    this.$.index.reset();
                }
                if(this.config.allowChangeTimerange){
                    this.$.time.reset();
                }
                if(this.config.allowChangeType){
                    // 图表类型
                }
                this.$.chart.reset();
            }
            /**
             * 加载数据
             * @param  {Object}    param 请求参数
             * @return {Undefined}       无返回值
             */
            ,load:function(param,serieNum){
                this.toggleLoading(1);
                if(param){
                    this.setParam(param);
                }
                this.$waittingXhrIds[serieNum] = app.data.get(
                    this.config.url
                    ,$.extend({}, this.config.param, this.$param[serieNum])
                    ,this
                    ,"onData"
                    ,serieNum || (this.$serieNum - 1)
                );
            }
            /**
             * 数据请求响应函数
             * @param  {Object}    err      错误信息
             * @param  {Object}    data     返回的数据对象
             * @param  {Number}    serieNum 趋势索引值
             * @return {Undefined}          无返回值
             */
            ,onData:function(err,data,serieNum){
                this.toggleLoading(0);
                if(this.$waittingXhrIds[serieNum]){
                    delete this.$waittingXhrIds[serieNum];
                }
                if(err){
                    app.alert(err.message);
                    this.setData([],serieNum);
                    return false;
                }
                this.setData(data.items,serieNum);
                this.toggleRefreshStatus(false);
            }
            /**
             * 请求多条数据
             * @param  {Object}    param 请求参数
             * @return {Undefined}       无返回值
             */
            ,multipleLoad:function(param){
                var self = this;
                self.abort();
                var url = self.config.url;
                var max = self.$waitting = self.$serieNum;
                if (param){
                    self.setParam(param);
                }
                if (max>0){
                    this.toggleLoading(1);
                }
                // 显示加载状态, 开始加载多个数据
                for (;max>0;){
                    param = $.extend({}, self.config.param, self.$param[--max]);
                    self.$waittingXhrIds[max] = app.data.get(
                        url, param, this, "onMultipleData", max
                    );
                }
                return self;
            }
            /**
             * 多个请求的回调函数
             * @param  {Object}    err      错误信息
             * @param  {Object}    data     返回的数据对象
             * @param  {Number}    serieNum 趋势索引值
             * @return {Undefined}          无返回值
             */
            ,onMultipleData:function(err,data,serieNum){
                if(err){
                    data = [];
                }else{
                    data = data.items;
                }
                this.$data[serieNum] = data;
                this.$waitting--;
                if(!this.$waitting){
                    this.$waittingXhrIds = {};
                    this.setData();
                    if(this.config.hasTotal){
                        // 有汇总, 且有其他数据则因此汇总
                        this.toggleSeries(0, this.$serieNum <= 1);
                    }
                    this.toggleLoading(0);
                    // this.toggleRefreshStatus(false);
                }
            }
            /**
             * 放弃正在进行的请求
             * @return {Object} 模块实例
             */
            ,abort:function(){
                for(var n in this.$waittingXhrIds){
                    app.data.abort(this.$waittingXhrIds[n]);
                    delete this.$waittingXhrIds[n];
                }
                return this;
            }
            /**
             * 设置图表X轴的显示步长
             * @return {Object} 模块实例
             */
            ,setChartSetp:function(){
                var _max = this.$data[0].length
                    ,oldSetp = this.$chart.xAxis[0].userOptions.labels.step
                    ,newSetp;
                if(_max <= this.config.xAxisSetp){
                    newSetp = 1;
                }else{
                    newSetp = Math.ceil(_max/(this.config.xAxisSetp*2));
                }
                if(newSetp !== oldSetp){
                    this.$chart.xAxis[0].userOptions.labels.step = newSetp;
                    this.$chart.xAxis[0].options.labels.step = newSetp;
                }
                newSetp = _max = oldSetp = null;
                return this;
            }
            /**
             * 获取图表数据
             * @return {Array} 图表数据
             */
            ,getData:function(){
                return this.$data;
            }
            /**
             * 设定图表数据
             * @param  {Array} data 图表数据
             * @return {Object}     模块实例
             */
            ,setData:function(data,serieNum){
                if(data){
                    this.$data[serieNum] = data;
                }

                var key = this.$nowIndex.field,
                    label_key = this.config.label_field,
                // 格式化函数
                    formater = this.$labels[key] && util.isFunc(this.$labels[key].format) && this.$labels[key].format || null;

                // 整理所有x轴节点数据
                var labels = [];
                util.each(this.$data, function(serie){
                    util.each(serie, function(node){
                        labels.push(node[label_key]);
                    });
                });
                labels = util.uniq(labels).sort();

                // 补完所有缺少数据的节点
                util.each(this.$data, function(serie){
                    if (serie && serie.length != labels.length){
                        var list = [];
                        util.each(labels, function(label){
                            var node = util.find(serie, label, label_key);
                            if (!node){
                                node = {};
                                node[label_key] = label;
                            }
                            list.push(node);
                        });
                        return list;
                    }
                });

                if(!serieNum){
                    this.setChartSetp();
                }
                if(this.$mode){
                    if(this.$timerange){
                        this.$.pager.show();
                        this.$.pager.setup({
                            "total":this.$data[0].length
                        });
                    }
                    this.$.grid.setData(
                        this.buildGridData(this.$nowPage)
                    );
                }else{
                    this.$.chart.setData(
                        this.buildChartData()
                    );
                }
                // 汇总操作
                if(this.config.hasTotal){
                    this.toggleSeries(0,!(serieNum && serieNum > 0));
                }
                data = formater = null;
                return this;
            }
            /**
             * 响应表格分页切换事件
             * @param  {Object} ev 消息对象
             * @return {Bool}      false
             */
            ,onChangePage: function(ev){
                var size = this.config.table_size
                    ,data = this.$data[0]
                    ,idx = (ev.param - 1) * size
                    ,last = Math.min(data.length, idx + size)
                    ,list = [];
                for(;idx<last; idx++){
                    list.push(data[idx]);
                }
                this.$.grid.setData(list);
                size = data = idx = last = list = null;
                return false;
            }
            /**
             * 获取指定字段的数据
             * @param  {Object}   data     数据对象
             * @param  {String}   key      字段名
             * @param  {Function} formater 格式化函数
             * @return {Number}            获取的数据
             * @private
             */
            ,_getKeyData:function(data,key,formater){
                data = data && data[key] || 0;
                if(data && formater){
                    data = formater(data);
                }
                formater = null;
                data = this._getNumberData(data);
                return data;
            }
            /**
             * 将格式化后的数据转回图表能用的数字
             * @param  {String} data 要处理的数据字符串
             * @return {Number}      处理完的数据(处理过程中如果NaN则会当成0)
             * @private
             */
            ,_getNumberData:function(data){
                data = ""+data;
                data = data.replace(/[^0-9\.]/g,"");
                data = parseFloat(data);
                data = isNaN(data)?0:data;
                return data;
            }
            /**
             * 设定请求参数
             * @param {Object}  param   参数对象
             * @param {Bool}    replace 是否采用覆盖模式
             * @return {Object}         模块实例
             */
            ,setParam:function(param,replace,serieNum){
                if(param){
                    if(replace){
                        this.config.param = param;
                    }else {
                        $.extend(this.config.param, param);
                    }
                }
                return this;
            }
            /**
             * 更新图表设置
             * @param {Object} config 新的配置对象
             * @param {Number} index  趋势索引
             */
            ,setChartSerie:function(config,index){
                if(this.$chart && util.isObject(this.$.chart.config.series[index])){
                    this.$.chart.config.series[index] = $.extend(
                        true
                        ,this.$.chart.config.series[index]
                        ,config
                    );
                }
            }
            /**
             * 指标类型改变消息响应函数
             * @param       {Object} ev 消息对象
             * @return      {Bool}      false
             * @description             切指标不更新数据
             */
            ,onOptionChange:function(ev){
                this.changeIndex(ev.param);
                ev = null;
                return false;
            }
            /**
             * 修改显示的指标
             * @param  {Object} param 切换到相关数据
             * @return {Object}       实例对象
             */
            ,changeIndex:function(param){
                if(param){
                    param.last = param.last || this.$nowIndex.field;
                    this.$nowIndex = param.option;
                    this.$nowIndex.field = param.id;
                    this.$nowIndex.text = this.$labels[this.$nowIndex.field].text;

                    if(this.config.hasTotal){
                        this.$nowIndex.text += LANG("汇总");
                        this.$.chart.setSeries(0, this.$nowIndex);
                    }

                    this.changeTitle();
                    if(!this.$collapse){
                        this.setData();
                    }
                }
                return this;
            }
            /**
             * 时间粒度改变的响应函数
             * @param  {Object}  ev 消息对象
             * @return {Boolean}    阻止广播
             */
            ,onChangeTimeRange:function(ev){
                this.abort();
                this.$timerange = +ev.param.selected || 0;
                this.multipleLoad({
                    "viewtb":this.$timerange
                });
                return false;
            }
            /**
             * 获取标准的标题文本
             * @param  {Object} item 标题要用到的数据对象
             * @return {String}      标题文本
             */
            ,getTitleText:function(item){
                if(item){
                    if(item.text){
                        item = item.text;
                    }else{
                        item = item.nowDate;
                        item = item.begin+"--"+item.end
                    }
                    this.$titleDate = item;
                    item = null;
                }
                return this.$titleTpl.replace('{date}',this.$titleDate).replace('{type}',this.$nowIndex.text);
            }
            /**
             * 时间改变的响应函数
             * @param  {Object}  ev 消息对象
             * @return {Boolean}    阻止广播
             */
            ,onChangeDate:function(ev){
                this.abort();
                var param = ev.param
                    ,item = param.item;
                this.changeTitle(item || param);
                if(param.stastic_all_time){
                    param = {
                        "stastic_all_time":1
                    };
                }else {
                    param = {
                        "begindate":param.nowTimestamp.begin
                        ,"enddate":param.nowTimestamp.end
                    };
                }
                // 先更新下时间粒度
                this.setDateRange(param);
                if(!this.$collapse){
                    this.multipleLoad(this.setDateRange(param));
                }
                item = param = null;
                return false;
            }
            /**
             * 更新时间段参数
             * @param {Object} date datebar模块返回的时间段参数
             * @return {Bool}		返回是否有参数更新
             */
            ,setDateRange:function(date){
                var param = {};
                if (date.stastic_all_time){
                    param = {
                        "stastic_all_time":1
                        ,"begindate":null
                        ,"enddate":null
                    };
                }else {
                    param = {
                        "stastic_all_time":null
                        ,"begindate":date.begindate
                        ,"enddate":date.enddate
                    };
                }
                // 时间粒度
                this.$timerange = this.$.time.updateState(param);
                this.config.param.viewtb = this.$timerange;
                this.config.param.begindate = date.begindate;
                this.config.param.enddate = date.enddate;
                return param;
            }
            /**
             * 自动刷新
             * @return {Bool} false
             */
            ,onAutoRefresh:function(){
            }
            /**
             * 切换加载遮罩显示状态
             * @param  {Bool}   status 显示状态
             * @return {Object}        模块实例
             */
            ,toggleLoading:function(status){
                if(!this.$.loading){
                    this.create(
                        "loading"
                        ,common.loadingMask
                        ,{
                            "target":this.el,
                            "offset_y": 10
                        }
                    );
                }
                this.$.loading[status && "show" || "hide"]();
                return this;
            }
            /**
             * 切换显示图表空白提示
             * @param  {Bool}      show 显示状态
             * @return {Undefined}      无返回值
             */
            ,toggleEmpty:function(show){
                this.$.chart.toggleEmpty(show);
            }
            /**
             * 切换显示单条
             * @param  {Number}      index 显示状态
             * @param  {Bool}        show  显示状态
             * @return {Undefined}         无返回值
             */
            ,toggleSeries:function(index,state){
                this.$.chart.toggleSeries(index,state);
            }
            /**
             * 获取Condition
             * @param  {Object} data 数据对象
             * @return {String}      Condition字符串
             */
            ,getConditions:function(data){
                var conditions = []
                    ,conf = this.config
                    ,suffix = conf.conditionSuffix+"|";
                if(conf.conditions){
                    conf = conf.conditions;
                    for(var n in conf){
                        conditions.push(
                            n+suffix+data[conf[n]]
                        );
                    }
                }else{
                    if(conf.param.type){
                        conditions.push(conf.param.type+suffix+data[conf.key]);
                    }
                }
                conf = suffix = null;
                return conditions.toString();
            }
            /**
             * 添加一条趋势
             * @param  {Object} data  要添加的趋势对应的数据
             * @param  {Object} param 附加参数
             * @return {Bool}         添加结果
             */
            ,addSeries:function(data,param){
                var key = data && data[this.config.key];

                if(key){
                    var num = this.$serieNum;
                    var max = this.config.max;
                    if (this.config.hasTotal){
                        max++;
                    }
                    if(num < max){
                        this.$seriesNumMap[key] = num;
                        var conf = {
                            "text":data.Name
                            ,"y_field": 'm_' + (this.$serieIndex++)
                            ,"label_field":this.config.label_field
                            ,"id":key
                        }
                        this.$.chart.config.series.push(conf);
                        this.$chart.addSeries(conf);
                        param = param || {};
                        if(this.config.hasCondition){
                            param.condition =this.getConditions(data);
                        }
                        this.$serieNum++;
                        this.$param[num] = param;
                        // 图表已打开, 加载当前数据
                        if (!this.$collapse){
                            this.load(null,num);
                        }
                        return true;
                    }else{
                        app.alert(LANG("最多只能添加%1条对比数据",this.config.max));
                    }
                }
                return false;
            }
            /**
             * 删除一条趋势
             * @param  {Mix}    data 要删除的趋势对应的索引或数据
             * @return {Bool}        删除结果
             */
            ,removeSeries:function(data){
                var key = data[this.config.key]
                    ,map = this.$seriesNumMap
                    ,num = this.$serieNum--
                    ,index = isNaN(data) ? map[key] : data;

                if(this.$chart.series[index]){
                    // 删除chart配置
                    this.$chart.series[index].remove();
                    this.$.chart.config.series.splice(index,1);

                    // 修正id map数据
                    util.each(map, function(id){
                        if (id == index){
                            return null;
                        }else if (id > index){
                            return id-1;
                        }
                    });

                    // 删除数据
                    data = this.$data;
                    for (;index<num;){
                        data[index] = data[++index];
                        data[index] = null;
                    }

                    if(num == 2){
                        this.toggleSeries(0,true);
                    }
                    return true;
                }
                return false;
            }
            /**
             * 检测某个id的数据是否已经添加
             * @param  {Number}  id 数据id
             * @return {Boolean}    true为已添加
             */
            ,hasAdded:function(id){
                return this.$seriesNumMap[id] === undefined ? false : true;
            }
            /**
             * 切换图表的显示状态
             * @param  {Bool}   show 显示状态
             * @return {Object}      模块实例
             */
            ,toggleChart:function(show){
                if (show === undefined){
                    show = this.$collapse;
                }else {
                    this.$collapse = !show;
                }
                this.doms.collapseBtn.toggleClass("M-chartAdvCollapseClose", !show);
                this.doms.main[show ? "show" : "hide"]();
                this.toggleLoading(show);
                return this;
            }
        }
    );
    exports.advChart = AdvChart;

});
