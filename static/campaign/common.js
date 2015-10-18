define(function(require, exports){
    var $ = require('jquery');
    var app = require('app');
    var view = require('view');
    var util = require('util');

    /**
     * 搜索列表框
     * @param {Object} config 自定义配置信息
     * @param {Module} parent 父模块实例
     */
    function Search(config, parent){
        this.config = $.extend(
            true,
            {
                'class':'M-commonSearch clear',
                'target': parent,
                'inputClass': 'M-commonSearchInput',
                'searchTip': LANG('请输入搜索内容'),
                'searchText': '',
                'buttonClass': 'M-commonSearchButton btn primary',
                'buttonText': LANG('搜索'),
                'undoClass': 'M-commonSearchUndo btn',
                'undoText': LANG('取消'),
                "undoIcoClass":"UndoIco",
                "searchConClass":"M-commonSearchInputCon",
                'advancedSearch': false,
                'advancedDate': false,
                'autoFocus': true,
                'tabs':{
                    'keys': {
                        name: LANG('多词搜索'),
                        tip: LANG('请输入关键词，不同关键词换行隔开')
                    },
                    'metric': {
                        name: LANG('指标过滤'),
                        tip: LANG('同时用以下条件过滤')
                    }
                }
            },
            config
        );
        // 是否发送过
        this.$fire = 0;
        this.$data = ['text', this.config.searchText];
        this.$showAdvDlg = false;

        this.$actTab = 'metric';

        Search.master(this, null, this.config);
    }
    extend(Search, view.container, {
        /**
         * 模块初始化
         * @return {None} 无返回
         */
        init: function(){
            // 渲染界面
            this.render();
            var el = this.el;
            var cfg = this.config;
            var tmp = $('<div class="'+cfg.searchConClass+'"></div>').appendTo(el);
            var doms = this.doms = {
                'input': $('<input type="input" />').appendTo(tmp),
                'clearIco': $('<input type="button" />').appendTo(tmp),
                'button': $('<input type="button" />').appendTo(el),
                'clear': $('<input type="button" />')
            };

            // 创建输入框
            doms.input.attr({
                'class': cfg.inputClass,
                'placeholder': cfg.searchTip,
                'value': cfg.searchText,
                'data-type': 'text'
            });
            // 取消搜索输入图标
            doms.clearIco.attr({
                'class': cfg.undoIcoClass,
                'data-type': 'clear'
            });
            // 创建搜索按钮
            doms.button.attr({
                'class':cfg.buttonClass,
                'value':cfg.buttonText,
                "data-type":"search"
            });

            // 创建高级搜索
            if(cfg.advancedSearch){
                doms.advancedSearch = $([
                    '<div class="M-commonSearchAdvancedCon">',
                    '<a class="search">',
                    LANG('高级搜索'),
                    '<i/></a></div>'
                ].join('')).appendTo(el).find('.search');
                this.jq(doms.advancedSearch, 'click', 'eventTogglePopwin');
                this.jq(doms.input, 'focus', 'eventClosePopwin');
            }

            // 创建取消按钮
            doms.clear.appendTo(el).attr({
                'class':cfg.undoClass,
                'value':cfg.undoText,
                "data-type":"clear"
            });
            doms.clear = doms.clear.add(doms.clearIco);

            // 高级搜索条件展示框
            doms.tips = $('<div class="M-commonSearchTips"/>').appendTo(el);

            // 绑定事件
            this.dg(el, 'input', "click keypress", "eventHandler");

            if(cfg.autoFocus){
                doms.input.focus();
            }

        },
        /**
         * 创建弹出层
         */
        buildPopwin: function(){
            var self = this;
            var c = self.config;
            var tabs = c.tabs;
            var doms = self.doms;
            var dlg = doms.dialog = $([
                '<div class="M-commonSearchAdvancedPopwin">',
                '<div class="title">'+LANG('高级搜索')+'<a class="close"></a></div>',
                '<div class="tab">',
                '<div data-action="metric">'+tabs.metric.name+'</div>',
                '<div data-action="keys">'+tabs.keys.name+'</div>',
                '</div>',
                '<div class="content">',
                '<div data-type="metric"><p>'+tabs.metric.tip+'</p></div>',
                '<div data-type="keys"><p>'+tabs.keys.tip+'</p><textarea/></div>',
                '</div>',
                '<input type="button" class="button primary" value="'+LANG('搜索')+'"/>',
                '</div>'
            ].join('')).appendTo('body');

            var tab_head = dlg.find('div.tab');
            if (c.advancedDate){
                tab_head.addClass('three_cols');
                tab_head.append('<div data-action="date">'+LANG('上线时间')+'</div>');
                var con = $('<div data-type="date"><p>'+LANG("按照上线时间过滤广告位")+'</p></div>').appendTo(tab_head.next());
                self.create('date', DateRange, {
                    'target': con,
                    'pos': 'bL'
                });
            }

            doms.title = dlg.find('div.title');
            doms.content = dlg.find('div.content:first');
            // doms.keys = dlg.find('div[data-action=keys]');
            doms.metric = dlg.find('div[data-action=metric]');
            doms.keysInput = dlg.find('div[data-type=keys] textarea');

            // 绑定事件
            self.dg(dlg.find('div.tab'), 'div[data-action]', 'click', 'eventSwitchTab');
            self.jq(dlg.find('input.primary'), 'click', 'eventAdvancedSearch');
            self.jq(dlg.find('.close'), 'click', 'eventClosePopwin')
            app.drag(doms.title, this.eventDragDlg, this);

            // 更新激活状态
            tab_head.children('[data-action="'+this.$actTab+'"]').click();

            // 创建指标组模块
            var mod = self.create(
                'indexGroups', IndexGroups,
                {'target': dlg.find('div[data-type=metric]')}
            );
            if (self.$metrics){
                mod.setData(self.$metrics);
            }

            return dlg;
        },
        updateUIState: function(){
            var data = this.$data;
            var doms = this.doms;
            var adv = doms.advancedSearch;
            switch (data[0]){
                case 'text':
                    var b = Boolean(data[1]);
                    doms.input.toggleClass('act', b);
                    doms.clear.toggle(b);
                    if (adv){
                        adv.removeClass('highlight');
                    }
                    doms.tips.hide();
                    break;
                case 'keys':
                case 'metric':
                case 'date':
                    doms.input.removeClass('act').val('');
                    doms.clear.show();
                    doms.clearIco.hide();
                    if (adv){
                        adv.addClass('highlight');
                    }
                    doms.tips.show();
                    break;
            }
            return this;
        },
        /**
         * 事件响应函数
         * @param  {Object} ev 鼠标事件
         * @return {Bool}
         */
        eventHandler:function(ev, elm){
            var self = this;
            var op = $(elm).attr('data-type');
            var doms = self.doms;
            var data = self.$data;
            switch (op){
                case 'text':
                    if (ev.type != 'keypress' || ev.keyCode != 13){
                        return;
                    }
                /* falls through */
                case 'search':
                    // 搜索事件
                    var text = util.trim(doms.input.val());
                    if (data[0] != 'text' || text != data[1]){
                        data[0] = 'text';
                        data[1] = text;
                        self.updateUIState();
                        self.fire('search', text);
                    }
                    break;
                case 'clear':
                    // 情况搜索事件
                    doms.input.val('');
                    if (data[0] != 'text' || data[1]){
                        data[0] = 'text';
                        data[1] = '';
                        self.updateUIState();
                        self.fire('search', '');
                    }
                    self.resetPopwin();
                    break;
            }
            //return false;
        },
        // 关闭高级搜索窗口
        eventClosePopwin: function(){
            // 简单输入框点击, 隐藏高级搜索窗口
            var dlg = this.doms.dialog;
            if (dlg){
                dlg.hide();
                this.$showAdvDlg = false;
                // this.doms.advancedSearch.removeClass('highlight');
            }
        },
        /**
         * 隐藏、显示弹出层
         */
        eventTogglePopwin: function(){
            var self = this;
            var doms = self.doms;
            var dlg = doms.dialog || self.buildPopwin();
            var show = self.$showAdvDlg = !self.$showAdvDlg;
            dlg.toggle(show);
            if (show){
                // 计算弹出窗口位置
                var offset = self.el.offset();
                offset.top += 40;
                dlg.offset(offset);
                if (self.$.date){
                    self.$.date.setup({'max': (new Date())});
                }
            }
        },
        // 清空高级搜索内容
        resetPopwin: function(){
            var self = this;
            var mod = self.get('indexGroups');
            if(mod){
                mod.reset();
                self.doms.keysInput.val('');
                self.doms.metric.click();
            }
            return self;
        },
        /**
         * 控制块拖动处理函数
         * @param  {Object} ev 拖动事件对象
         * @return {Bool}    返回操作是否成功
         */
        eventDragDlg: function(data, ev){
            var self = this;
            var dom = this.doms.dialog;

            switch (data.type){
                case 'moveDrag':
                    dom.css({
                        top: (self.$top + data.dy) + 'px',
                        left: (self.$left + data.dx)+ 'px'
                    });
                    break;
                case 'startDrag':
                    // 保存初始位置
                    self.$top  = +dom.css('top').slice(0,-2);
                    self.$left = +dom.css('left').slice(0,-2);
                    break;
            }
            return true;
        },
        /**
         * 栏目切换
         */
        eventSwitchTab: function(ev, dom){
            var type = this.$actTab = $(dom).attr('data-action');
            $(dom).addClass('act');
            $(dom).siblings().removeClass('act');

            dom = this.doms.content.find('[data-type="'+type+'"]');
            dom.show().siblings().hide();
        },
        /**
         * 高级搜索事件 -点击搜索按钮
         */
        eventAdvancedSearch: function(ev){
            var self = this;
            var type = self.$actTab;
            var doms = self.doms;
            var data;
            switch (type){
                case 'keys':
                    data = doms.keysInput.val().split(/[\r\n]+/g);
                    util.each(data, function(key){
                        key = util.trim(key);
                        return key || null;
                    });
                    break;

                case 'metric':
                    data = self.$.indexGroups.getData();
                    break;

                case 'date':
                    data = self.$.date.getData();
                    break;

                default:
                    return;
            }
            self.eventClosePopwin();

            if (data){
                self.$data[0] = type;
                self.$data[1] = data;

                self.showResultTips();
                self.fire('search', {'type': type, 'data': data});
            }
        },
        onContainerHide: function(){
            this.eventClosePopwin();
            return false;
        },
        /**
         * 显示搜索内容
         */
        showResultTips: function(){
            var self = this;
            var data = self.$data;
            var tips = self.doms.tips;
            var tabs = self.config.tabs;

            switch(data[0]){
                case 'keys':
                    tips.text(tabs.keys.name + '：' +data[1]);
                    break;
                case 'metric':
                    var html = [];
                    util.each(data[1], function(item){
                        var metric = util.find(self.$metrics, item.factor, 'name');
                        if (metric){
                            html.push(metric.text + ' ' + item.sign + ' ' + item.value + (metric.unit || ''));
                        }
                    });
                    tips.text(tabs.metric.name + '：' + html.join('、'));
                    break;
                case 'date':
                    tips.text(LANG('上线时间过滤: %1 -> %2', data[1].begin, data[1].end));
                    break;
            }

            self.updateUIState();
            return self;
        },
        /**
         * 设置指标变量
         */
        setOptions:function(cols){
            this.$metrics = cols;
            var mod = this.get('indexGroups');
            if (mod){
                mod.setData(cols);
            }
            return this;
        },
        getData: function(){
            return this.$data;
        },
        /**
         * 复位查询参数
         * @return {None} 无返回
         */
        reset: function(){
            var self = this;
            var data = self.$data;
            self.$data = ['text', ''];
            self.doms.input.val('');
            self.updateUIState();
            self.resetPopwin();

            // 发送重置事件
            if (data[0] != 'text' || data[0]){
                self.fire('search', '');
            }
        },
        onSwitchPage: function(){
            // 设置搜索框鼠标焦点
            this.doms.input.focus();
        }
    });
    exports.search = Search;

    var SearchBar = app.extend(view.container,{
        init:function(config,parent){
            config = $.extend(true,{
                'class':'M-commonSearchBar',
                'inputClass':'M-commonSearchBarInput',
                'searchTip': LANG('请输入搜索内容')
            },config);
            Search.master(this,null,config);
            Search.master(this,'init',[config]);
            this.build();
        }
        ,build:function(){
            var c = this.config;
            var input = $('<input type="input" placeholder="'+c.searchTip+'">').addClass(c.inputClass);
            this.$input = input;
            this.el.append(input);
            this.jq(input,'keyup','eventInput');
            // this.jq(input,'keypress','eventPress');
        }
        ,focus: function(){
            this.$input.focus();
            return this;
        }
        ,eventInput:function(ev,elm){
            this.fire('searchInput',{
                'value': elm.value,
                'keycode':ev.keyCode
            });
        }
    });
    exports.searchBar = SearchBar;

    // 不带取消按钮的搜索框
    var SearchNoClear = app.extend(Search, {
        init:function(config,parent){
            config = $.extend(true,{
            },config);
            SearchNoClear.master(this,null,config);
            SearchNoClear.master(this,'init',[config]);
            this.build();
        }
        ,build:function(){
            SearchNoClear.master(this,'build',arguments);
            //简单去除右侧取消按钮
            this.doms.clear[1] = null;
        }
    });
    exports.searchNoClear = SearchNoClear;

    /**
     * 指标组
     * @description 可自由增减的指标过滤组
     * @从属于【Search】模块
     */
    var IndexGroups = app.extend(view.container,{
        init: function(config, parent){
            config = $.extend({
                'class':'wrapper'
            }, config);
            this.$ready = false;

            // 指标变量
            this.$options = null;

            // 用户填入的数据
            this.$data = {};
            this.$items = [];

            this.$amount = 0;
            IndexGroups.master(this, null, config);
            IndexGroups.master(this,'init',[config]);
            this.build();
        },
        build: function(){
            if (this.$ready){ return false; }

            //构建组
            this.$group = $('<div class="groups"></div>').appendTo(this.el);
            var addBtn = $('<span class="addBtn"></span>').appendTo(this.el);

            //绑定按钮事件
            this.jq(addBtn,"click", "eventAddItem");
            this.dg(this.$group, '.del', 'click', 'eventDelItem');

            this.$ready = true;
        },
        setData: function(cols){
            this.$options = cols;
            this.reset();
            return this;
        },
        // 获取指标变量
        getOptions: function(){
            return this.$options ? this.$options : [];
        },
        /**
         * 单条组
         * @return {Object} Jquery对象
         */
        buildItem: function(isFirst){
            var guid = util.guid();
            //单条组
            var con =$('<div class="singleGroup"/>').appendTo(this.$group);

            // 选择指标变量
            var metric = this.create('metric'+guid, DropdownList, {
                'target':con,
                'width': 142,
                'key': 'name',
                'name': 'text',
                'search': true,
                'search_atonce': true,
                'options':this.getOptions()
            });

            // 选择符号
            var sign = this.create('sign'+guid,DropdownList,{
                'target':con,
                'width': 75,
                'search': false,
                'drag':false,
                'options':[
                    {Name: '>', _id:'>'},
                    {Name: '<', _id:'<'},
                    {Name: '=', _id:'='}
                ]
            });

            // 输入框
            var value = this.create('input'+guid,Input, {
                'class': 'metricValue',
                'target': con,
                'value': '0',
                'width':  73
            });

            // 单位修饰符
            var unit = $('<span class="unit"/>').appendTo(con);

            // 删除按钮
            $('<span class="del" key="'+guid+'"></span>').appendTo(con);

            // 保存示例对象
            this.$items.push([guid, con, metric, sign, value, unit]);

            // 更新删除按钮显示状态
            if (this.$items.length > 1){
                this.$group.find(".del").show();
            }

            // 通知内容变化
            // this.fire('resize');
        },
        /**
         * 新增输入框 -按钮的回调事件
         * @param  {object} ev 事件对象
         */
        eventAddItem: function(ev, elm){
            this.buildItem();
            // this.fire('resize');
        },
        /**
         * 删除输入框 -按钮的回调事件
         * @param  {object} ev 事件对象
         */
        eventDelItem: function(ev, elm){
            var list = this.$items;
            if(list.length > 1){
                var guid = $(elm).attr('key');
                var item = util.find(list, guid, 0);
                if (item){
                    item[2].destroy();
                    item[3].destroy();
                    item[4].destroy();
                    item[1].remove();
                    util.remove(list, guid, 0)
                }

                //若只剩下一个输入框，隐藏删除按钮
                if(list.length <= 1){
                    this.$group.find(".del").hide();
                }

                // 计算滚动条高度
                // this.fire('resize');
            }
        },
        onOptionChange: function(ev){
            if (ev.name.substr(0,6) == 'metric'){
                var guid = +ev.name.substr(6);
                var item = util.find(this.$items, guid, 0);
                if (item){
                    item[5].text(ev.param.option.unit || '');
                }
            }
            console.log(ev);
        },
        getData: function(){
            var data = [];
            util.each(this.$items, function(item){
                // 检测用户输入是否非数字
                var val = item[4].getData();
                if(!util.isNumber(val)){
                    app.notify('输入不正确。【搜索数值仅限于数字】');
                    data = null;
                    return false;
                }

                data.push({
                    'factor': item[2].getData(),
                    'sign': item[3].getData(),
                    'value': val
                });
            });

            return data || false;
        },
        reset: function(){
            util.each(this.$items, function(item){
                item[2].destroy();
                item[3].destroy();
                item[4].destroy();
            });
            this.$group.empty();
            this.$items = [];
            this.buildItem();
            // this.fire('resize');
        }
    });

    /**
     * Excel报表导出功能调用
     * @param {Objcet} config 模块初始化配置
     * @param {Module} parent 父模块实例
     */
    function ExcelExport(config, parent){
        this.config = $.extend(
            {
                'text': LANG('导出Excel'),
                'class': 'M-commonExcel',
                'target': parent,
                'data': null,
                'subs': null // 二级导出选项
            },
            config
        );
        ExcelExport.master(this, null, this.config);
    }
    extend(ExcelExport, view.container, {
        init: function(){
            $('<span/>').text(this.config.text).click(this, this.buttonClick).appendTo(this.el);
            if (this.config.subs){
                $('<div class="M-commonExcelCustom"/>').click(this, this.customClick).appendTo(this.el);
            }
            this.render();
        },
        customClick: function(evt){
            app.log('custom export click');
        },
        buttonClick: function(evt){
            var me = evt.data;
            me.fire('excelExport', me.config.data);
        },
        onEventSent: function(evt){
            if (evt.count > 0 && evt.returnValue){
                var url = evt.returnValue;
                // 合成URL地址
                url += (url.indexOf('?') === -1 ? '?' : '&') + 'tmpl=export';

                // 调用下载地址下载文件
                if (url){
                    window.location.href = app.data.resolve(url);
                }
            }
        }
    });
    exports.excelExport = ExcelExport;


    /**
     * 分页控制模块
     * @param {Objcet} config 模块初始化配置
     * @param {Module} parent 父模块实例
     */
    function Pager(config, parent){
        this.config = $.extend(
            true,
            {
                'class': 'M-commonPager', // 容器类名称
                'target': parent,
                'subClass': {
                    'list': 'M-commonPagerList',
                    'prev': 'M-commonPagerAction',
                    'next': 'M-commonPagerAction',
                    'first':'M-commonPagerAction',
                    'last': 'M-commonPagerAction',
                    'info': 'M-commonPagerInfo',
                    'page': 'M-commonPagerPage',
                    'active': 'M-commonPagerActive',
                    'disable': 'M-commonPagerDisable',
                    "goto":"M-commonPagerGoto",
                    "box":"M-commonPagerBox"
                },
                'subText': {
                    'prev': _T('<'),
                    'next': _T('>'),
                    'first': _T('首页'),
                    'last': _T('末页'),
                    'info': _T('总共 %1 条记录, 共 %2 页, 当前第 %3 页'),
                    "prePage":_T('每页显示'),
                    "a":_T('条'),
                    "jump":_T("跳转")
                },
                // 分页大小
                'size': 20,
                // 初始页码
                'page': 1,
                // 分页总数 <一般自动计算>
                'count': 0,
                // 记录总数
                'total': 0,
                // 最多显示分页数
                'bounds':8,
                // 是否显示上一页和下一页
                'stepButton': true,
                // 是否显示第一页和最后一页
                'firstLast': true,
                // 是否显示页数信息
                'pageInfo': true,
                // 每页显示的数据数量
                "sizeTypes":[10,20,50,100],
                // 是否显示切换每页显示数据数量的功能
                "showSizeTypes":1,
                // 是否显示页码跳转输入框
                "showJumper":1
            },
            config
        );

        this.$initPageSize = this.config.size;
        Pager.master(this, null, this.config);
    }
    /**
     * 每页显示数量的数组排序函数
     * @param  {Number} a 前一个数
     * @param  {Number} b 后一个数
     * @return {Number}   对比结果
     * @private
     */
    function _sizeTypesSortFuns(a,b){
        return a-b;
    }
    extend(Pager, view.container, {
        init: function(){
            // 建立DOM元素
            this.build();

            // 调用父类的初始化方法
            Pager.master(this,'init');
        },
        /**
         * 重新设定分页
         * @param  {Object} config 新的分页配置
         * @return {Undefined}        无返回值
         */
        setup: function(config){
            this.config = $.extend(true,this.config,config);
            this.build();
            return this;
        },
        /**
         * 获取分页当前的请求参数
         * @return {Undefined} 无返回值
         */
        getParam: function(){
            return {
                page: this.page,
                limit: this.size
            };
        },
        // 获取分页参数
        getData: function(){
            return {
                init_size: this.$initPageSize,
                size: this.size,
                total: this.total,
                count: this.count,
                page: this.page
            };
        },
        /**
         * 计算分页相关变量
         * @param  {Bool}      init 是否做初始化处理
         * @return {Undefined}      无返回值
         */
        countPage: function(init){
            var cfg = this.config;
            // 计算分页参数
            if (init){
                // 检查是否存在在尺寸类型中
                if(util.index(cfg.sizeTypes,cfg.size) === null){
                    // 没有则追加并重新排序
                    cfg.sizeTypes.push(cfg.size);
                    cfg.sizeTypes.sort(_sizeTypesSortFuns);
                }
                this.size  = Math.max(1, cfg.size);
                this.total = cfg.total;
                this.count = cfg.count = Math.ceil(cfg.total / this.size);
                this.page  = Math.max(1, Math.min(cfg.page, this.count));
            }
            var bound  = cfg.bounds - 1;
            this.start = Math.max(1, this.page - Math.floor(bound / 2));
            this.end   = this.start + bound;
            if (this.end > this.count){
                this.end = this.count;
                this.start = Math.max(1, this.end - bound);
            }
        },
        /**
         * 分页界面构造函数
         * @return {Undefined} 无返回值
         */
        build: function(){
            if (!this.doms){
                this.doms = {};
            }
            var doms = this.doms;
            var cfg = this.config;

            // 计算分页参数
            this.countPage(true);

            // 建立页码按钮
            if (!doms.list){
                doms.list = $('<span/>').addClass(cfg.subClass.list).appendTo(this.el);
                this.pageBtns = [];
            }
            for (var i=this.start + this.pageBtns.length; i<=this.end; i++){
                var btn = $('<input type="button"/>').addClass(cfg.subClass.page).appendTo(doms.list);
                this.pageBtns.push(btn);
                btn.bind('click', this, this.clickPage);
            }
            // 建立步进按钮
            if (cfg.stepButton && this.count > cfg.bounds && !doms.prev){
                doms.prev = $('<input type="button"/>').addClass(cfg.subClass.prev).insertAfter(doms.list);
                doms.prev.bind('click', this, this.clickPrev);
                doms.next = $('<input type="button"/>').addClass(cfg.subClass.next).insertAfter(doms.prev);
                doms.next.bind('click', this, this.clickNext);
            }

            // 建立首页和末页按钮
            if (cfg.firstLast && this.count > cfg.bounds && !doms.first){
                doms.first = $('<input type="button"/>').addClass(cfg.subClass.first).insertBefore(doms.list);
                doms.first.bind('click', this, this.clickFirst);
                doms.last = $('<input type="button"/>').addClass(cfg.subClass.last).insertAfter(doms.list);
                doms.last.bind('click', this, this.clickLast);
            }

            // 建立页面信息
            if (cfg.pageInfo && !doms.info){
                doms.info = $('<span class="'+cfg.subClass.box+'"></span>').addClass(cfg.pageInfo).prependTo(this.el);
            }

            // 每页显示的数量
            if(cfg.showSizeTypes && !doms.sizeTypesOuterBox){
                doms.sizeTypesOuterBox = $('<span class="'+cfg.subClass.box+'">'+cfg.subText.prePage+'</span>');
                for(var j = 0;j<cfg.sizeTypes.length;j++){
                    if (!cfg.sizeTypes[j]){continue;}
                    doms.sizeTypesOuterBox.append('<input type="button" class="'+(cfg.subClass.page+(cfg.sizeTypes[j] === cfg.size && " "+cfg.subClass.active || ""))+'" value="'+cfg.sizeTypes[j]+'" />');
                }
                doms.sizeTypes = doms.sizeTypesOuterBox.find("input");
                // 事件
                this.jq(doms.sizeTypes,"click",this.updatePageSize);
                doms.sizeTypesOuterBox.prependTo(this.el);
            }

            // 页码跳转输入框
            if(cfg.showJumper && !doms.jumperBox){
                // doms.list.addClass(cfg.subClass.box);
                doms.jumperBox = $('<span class="M-commonPagerGotoBox"><input class="'+cfg.subClass.goto+'" type="text" /><input type="button" class="'+cfg.subClass.page+'" value="'+cfg.subText.jump+'"/></span>');
                doms.jumper = doms.jumperBox.find(":button");
                doms.jumper.page = doms.jumperBox.find(":text");
                this.jq(doms.jumper,"click",this.jumpTo);
                this.el.append(doms.jumperBox);
            }

            // 更新状态
            this.update(true);

            // 设置按钮语言文字
            this.setText();
        },
        /**
         * 跳转至指定页码
         * @param  {Mix}       ev 指定的页码或输入的页码
         * @return {Undefined}    无返回值
         */
        jumpTo:function(ev){
            if(!ev){
                return false;
            }
            var page;
            if(util.isObject(ev)){
                page = +this.doms.jumper.page.val();
            }else{
                page = +ev;
            }
            if(isNaN(page)){
                if(util.isObject(ev)){
                    this.doms.jumper.page.val("");
                }
                return false;
            }
            this.config.page = page;
            this.build();
            this.fire("changePage",this.page);
        },
        /**
         * 更新每页显示数量
         * @param  {Object} ev 鼠标事件对象
         * @return {Number}    每页显示数量
         * @todo 支持直接输入数字更新显示数量
         */
        updatePageSize:function(ev){
            var tag = $(ev.target)
                ,val = +tag.val()
                ,actCls = this.config.subClass.active;

            if(!tag.hasClass(actCls)){
                this.config.size = val;
                this.config.page = 1;
                this.size = val;
                this.doms.sizeTypes.removeClass(actCls);
                tag.addClass(actCls);
                this.build();
                this.fire("changePage",this.page);
            }
            val = null;
            return val;
        },
        update: function(skip_count){
            if (!skip_count){
                this.countPage();
            }
            var cfg = this.config.subClass;
            var doms = this.doms;
            var btn, page;
            // 处理分页状态和显示
            for (var i=0; i<this.pageBtns.length; i++){
                btn = this.pageBtns[i];
                page = i + this.start;
                if (page > this.end){
                    btn.hide();
                }else {
                    btn.attr({
                        'data-page': page,
                        'value': page
                    })
                        .css('display','inline-block')
                        .toggleClass(cfg.active, page==this.page);
                }
            }

            // 更新分页状态
            if (doms.prev) {doms.prev.toggleClass(cfg.disable, this.page <= 1);}
            if (doms.first) {doms.first.toggleClass(cfg.disable, this.page <= 1);}
            if (doms.next) {doms.next.toggleClass(cfg.disable, this.page >= this.count);}
            if (doms.last) {doms.last.toggleClass(cfg.disable, this.page >= this.count);}
            this.updateInfo();

            this.config.page = this.page;
        },
        setText: function(){
            var text = this.config.subText;
            var doms = this.doms;
            if (doms.prev) {doms.prev.val(LANG(text.prev));}
            if (doms.next) {doms.next.val(LANG(text.next));}
            if (doms.first) {doms.first.val(LANG(text.first));}
            if (doms.last) {doms.last.val(LANG(text.last));}
            this.updateInfo();
        },
        updateInfo: function(){
            var text = this.config.subText;
            var doms = this.doms;
            if (doms.info){
                doms.info.text(LANG(text.info, this.total, this.count, this.page, this.config.size));
            }
        },
        onSwitchLanguage: function(evt){
            this.setText();
        },
        clickPage: function(evt){
            var me = evt.data;
            var page = parseInt($(this).attr('data-page'), 10) || 0;
            if (page && page != me.page){
                me.page = page;
                me.update();
                me.fire('changePage', page);
            }
        },
        clickPrev: function(evt){
            var me = evt.data;
            if (me.page > 1){
                me.page--;
                me.update();
                me.fire('changePage', me.page);
            }
        },
        clickNext: function(evt){
            var me = evt.data;
            if (me.page < me.count){
                me.page++;
                me.update();
                me.fire('changePage', me.page);
            }
        },
        clickFirst: function(evt){
            var me = evt.data;
            if (me.page > 1){
                me.page = 1;
                me.update();
                me.fire('changePage', me.page);
            }
        },
        clickLast: function(evt){
            var me = evt.data;
            if (me.page < me.count){
                me.page = me.count;
                me.update();
                me.fire('changePage', me.page);
            }
        }
    });
    exports.pager = Pager;


    /**
     * 滚动条控制模块
     * @param {Object} config 模块配置对象
     */
    function Scroller(config, parent){
        this.config = $.extend({
            'class': 'M-commonScroller',
            'target': parent, // 要滚动的容器
            'content': null, // 要滚动的内容
            'viewport': null, // 滚动区域大小, 配合content来计算虚拟滚动条
            'type': 'linear', // 滚动方式, manual - 手动滚动方式, 不控制外部DOM
            'dir': 'H', // 滚动方向 H-横向, V-纵向
            'size': 8, // 滚动条大小
            'pad': true, // 插入滚动条间隔
            'side': false, // 是否反方向放置滚动条
            'margin': 2, // 滚动条两端偏移位置支持数组形式分别制定两端偏移量
            'offset': 2, // 滚动条侧面偏移位置
            'width': 0, // 指定滚动容器宽度
            'height': 0, // 指定滚动容器高度
            'watch': 0, // 是否监测容器此存变化
            'auto': true, // 自动隐藏
            'wrap': false, // 自动包含子元素
            'step': 100, // 滚轮滚动距离
            'wheel': true // 绑定鼠标滚轮事件
        }, config);

        if (this.config.wrap === true){
            this.config.wrap = 'div';
        }
        this.pad = 0;

        this.info = {};
    }
    extend(Scroller, app.Module, {
        init: function(){
            var c = this.config;
            var margin = c.margin;
            var isH = (c.dir === 'H');
            var bar = this.bar = $('<div/>').addClass(c['class']);
            this.ctr = $('<div/>').appendTo(bar);
            if (!util.isArray(margin)){
                c.margin = margin = [margin, margin];
            }
            margin[2] = margin[0] + (margin[1] || 0);
            bar.css(c.side?'left':'right', isH ? margin[0] : c.offset);
            bar.css(c.side?'top':'bottom', isH ? c.offset : margin[0]);

            if (c.target.el){
                c.target = c.target.el;
            }
            var tar = c.target.get(0);
            bar = bar.appendTo(tar).get(0);
            if (bar.offsetParent != tar){
                tar.style.position = 'relative';
            }

            var i = this.info;
            if (c.type === 'manual'){
                // 虚拟滚动状态
                i.init = i.margin = i.pos = 0;
                i.type = isH ? 'horizontal' : 'vertical';
            }else {
                // DOM元素滚动
                if (c.wrap){
                    if (c.content){
                        c.content.wrap('<'+c.wrap+'/>');
                        c.content = c.content.parent();
                    }else {
                        c.target.wrapInner('<'+c.wrap+'/>');
                        c.content = c.target.children(':first');
                    }
                }else if (!c.content) {
                    c.content = c.target.children(':first');
                }

                // 初始化获取原margin
                var getCSS = util.getCssValue;
                if (isH){
                    i.init = getCSS(c.content, 'marginLeft');
                    i.margin = getCSS(c.content, 'marginRight') + i.init;
                    i.noMin = !c.width && !getCSS(c.target, 'minWidth');
                    i.type = 'horizontal';
                    c.target.css('overflow-x', 'hidden');
                }else {
                    i.init = getCSS(c.content, 'marginTop');
                    i.margin = getCSS(c.content, 'marginBottom') + i.init;
                    i.noMin = !c.height && !getCSS(c.target, 'minHeight');
                    i.type = 'vertical';
                    c.target.css('overflow-y', 'hidden');
                }
            }

            // 绑定事件
            this.bindEvent();

            // 监控尺寸变化
            if (c.watch){
                var self = this;
                self.$watchSize = isH ? c.content.width() : c.content.height();
                self.$watchCallback = function(){
                    var size = isH ? c.content.width() : c.content.height();
                    if (size && size != self.$watchSize){
                        self.$watchSize = size;
                        self.measure();
                    }
                }
                self.$watchId = setInterval(self.$watchCallback, c.watch);
            }

            // 计算滚动条数据
            this.measure();
        },
        beforeDestroy: function(){
            clearInterval(this.$watchId);
        },
        bindEvent: function(){
            var c = this.config;
            var el = c.target.get(0);
            var ctr = this.ctr.get(0);
            if (el.attachEvent){
                var me = this;
                this.IEcb = function(evt){
                    return me.handleEvent(evt);
                }
                if (c.wheel){
                    el.attachEvent('onmousewheel', this.IEcb);
                }
                ctr.attachEvent('onmousedown', this.IEcb);
            }else {
                if (c.wheel){
                    el.addEventListener('DOMMouseScroll', this, false);
                    el.addEventListener('mousewheel', this, false);
                }
                ctr.addEventListener('mousedown', this, false);
                ctr.addEventListener('touchstart', this, false);
            }
            ctr = el = null;
        },
        handleEvent: function(evt){
            switch (evt.type){
                case 'touchmove':
                case 'onmousemove':
                case 'mousemove':
                    this.eventMouseMove(evt);
                    break;

                case 'onmousewheel':
                case 'DOMMouseScroll':
                case 'mousewheel':
                    if (this.info.max === 0){return;}
                    if (this.config.wheel === 'shift' && !evt.shiftKey){
                        return;
                    }
                    this.eventWheel(evt);
                    break;
                case 'touchstart':
                case 'onmousedown':
                case 'mousedown':
                    this.eventMouseDown(evt);
                    break;
                case 'touchend':
                case 'onmouseup':
                case 'mouseup':
                    this.eventMouseUp(evt);
                    break;
            }
            evt.cancelBubble = true;
            evt.returnValue = false;
            if (evt.preventDefault) {evt.preventDefault();}
            if (evt.stopPropagation) {evt.stopPropagation();}
        },
        /**
         * 输入控制scorller位置
         * @param  {Number} offset 滚动条偏移量
         * @return {None}
         */
        scrollBy:function(offset){
            this.scrollTo(this.info.pos - offset);
        },
        /**
         * 滚动到指定位置
         * @param  {Number} pos 滚动位置值
         * @return {None}
         */
        scrollTo: function(pos){
            var txtPos, txtMargin, i = this.info, c = this.config;
            if (c.dir == 'H'){
                txtPos='left'; txtMargin='marginLeft';
            }else {
                txtPos='top'; txtMargin='marginTop';
            }
            pos = Math.min(0, Math.max(i.max, pos));
            if (pos == i.pos) {return;} // 位置没有变化, 不触发事件

            i.pos = pos;
            i.bPos = Math.floor(i.bMax * pos / i.max);

            this.ctr.css(txtPos, i.bPos);
            if (c.type !== 'manual'){
                c.content.css(txtMargin, pos + i.init);
            }

            this.fire('scroll', i);
        },
        /**
         * 鼠标滚轮回调处理事件
         */
        eventWheel: function(evt){
            var dir = ('wheelDelta' in evt ? (evt.wheelDelta<0) : (evt.detail>0));
            var txtPos, txtMargin, i = this.info, c = this.config;
            if (c.dir == 'H'){
                txtPos='left'; txtMargin='marginLeft';
            }else {
                txtPos='top'; txtMargin='marginTop';
            }
            var pos;
            if(navigator.userAgent.indexOf('Mac OS X') > 0){
                pos = i.pos + evt.wheelDelta;	// 修正苹果电脑滚动快速问题
            }else{
                pos = i.pos + (dir ? -c.step : c.step);
            }
            pos = Math.min(0, Math.max(i.max, pos));
            if (pos == i.pos) {return;} // 位置没有变化, 不触发事件

            i.pos = pos;
            i.bPos = Math.floor(i.bMax * pos / i.max);

            this.ctr.css(txtPos, i.bPos);
            if (c.type !== 'manual'){
                c.content.css(txtMargin, pos + i.init);
            }

            this.fire('scroll', i);
        },
        /**
         * 鼠标按下拖动事件
         * @param  {Object} evt 系统事件变量
         * @return {None}     无返回
         */
        eventMouseDown: function(evt){
            var identifier = 0;
            if(evt.type == 'touchstart'){
                var touch = evt.touches;
                if(touch.length > 1){
                    // 多点触控的情况，不拖动
                    return;
                }
                touch = touch[0];
                evt.screenX = touch.screenX;
                evt.screenY = touch.screenY;
                identifier = touch.identifier;
            }
            if (!this.mouse){
                if (document.attachEvent){
                    document.attachEvent('onmousemove', this.IEcb);
                    document.attachEvent('onmouseup', this.IEcb);
                }else {
                    document.addEventListener('mousemove', this, false);
                    document.addEventListener('mouseup', this, false);
                    // 移动端
                    document.addEventListener('touchmove', this, false);
                    document.addEventListener('touchend', this, false);
                }
            }
            this.mouse = {
                screenX: evt.screenX,
                screenY: evt.screenY,
                pos: this.info.bPos,
                identifier: identifier
            };
            this.bar.addClass('act');
        },
        /**
         * 鼠标移动事件
         * @param  {Object} evt 系统事件变量
         * @return {None}     无返回
         */
        eventMouseMove: function(evt){
            var i = this.info;
            var m = this.mouse;
            var c = this.config;
            var txtPage, txtPos, txtMargin;

            if (evt.type == 'touchmove'){
                var touch = util.find(evt.touches, m.identifier, 'identifier');
                if (!touch){
                    return;
                }
                evt.screenX = touch.screenX;
                evt.screenY = touch.screenY;
            }

            if (c.dir == 'H'){
                txtPage='screenX'; txtPos='left'; txtMargin='marginLeft';
            }else {
                txtPage='screenY'; txtPos='top'; txtMargin='marginTop';
            }
            i.bPos = Math.max(0, Math.min(i.bMax, m.pos + evt[txtPage] - m[txtPage]));
            this.ctr.css(txtPos, i.bPos);
            var pos = Math.floor(i.max * i.bPos / i.bMax);
            if (pos == i.pos){ return; }
            i.pos = pos;
            if (c.type !== 'manual'){
                c.content.css(txtMargin, pos + i.init);
            }
            this.fire('scroll', i);
        },
        /**
         * 鼠标按键放开事件
         * @param  {Object} evt 系统事件变量
         * @return {None}     无返回
         */
        eventMouseUp: function(evt){
            if (evt.type == 'touchend'){
                var touch = util.find(evt.changedTouches, this.mouse.identifier, 'identifier');
                if (!touch){
                    return;
                }
                evt.screenX = touch.screenX;
                evt.screenY = touch.screenY;
            }

            if (document.detachEvent){
                document.detachEvent('onmouseup', this.IEcb);
                document.detachEvent('onmousemove', this.IEcb);
            }else {
                document.removeEventListener('mouseup', this, false);
                document.removeEventListener('mousemove', this, false);
                // 移动端
                document.removeEventListener('touchend', this, false);
                document.removeEventListener('touchmove', this, false);
            }
            this.eventMouseMove(evt);
            this.bar.removeClass('act');
            this.mouse = null;
        },
        /**
         * 设置手动滚动区域数据
         * @param  {Number} content  内容区数值
         * @param  {Number} viewport 可视区数值
         * @return {Module}          返回模块实例
         */
        setSize: function(content, viewport){
            var c = this.config;
            if (c.type === 'manual' && (c.content != content || c.viewport != viewport)){
                c.content = content;
                c.viewport = viewport;
                this.measure();
                this.fire('scroll', this.info, this.afterScrollEvent, this);
            }
            return this;
        },
        afterScrollEvent: function(ev){
            // 需要重新计算展现尺寸
            if (ev.returnValue === true){
                this.measure();
            }
        },
        /**
         * 计算系统数据
         * @param {Number} content <可选> 虚拟滚动时给定滚动内容大小
         * @return {None} 无返回
         */
        measure: function(){
            var c = this.config;
            var i = this.info;
            var hasScroll = (i.max !== 0);
            var txtMargin, txtPos, txtPadding, txtOuter, txtProp, txtProp2, txtCfg, txtCfg2;
            if (c.dir == 'H'){
                txtMargin='marginLeft'; txtPos='left'; txtPadding=c.side?'paddingTop':'paddingBottom';
                txtOuter='outerWidth'; txtProp='width'; txtProp2='height'; txtCfg='x'; txtCfg2='y';
            }else {
                txtMargin='marginTop'; txtPos='top'; txtPadding=c.side?'paddingLeft':'paddingRight';
                txtOuter='outerHeight'; txtProp='height'; txtProp2='width'; txtCfg='y'; txtCfg2='x';
            }

            var now, conSize, winSize, barSize, ctrSize;
            if (c.type === 'manual'){
                now = i.pos;
                conSize = c.content;
                winSize = c.viewport;
                barSize = (c[txtProp] || c.target[txtProp]()) - c.margin[2];
            }else {
                now = util.getCssValue(c.content, txtMargin) - i.init; // 当前内容滚动位置
                c.content.css(txtMargin, i.init); // 回复默认位置, 避免取宽度错误
                conSize = c.content[txtOuter](false) + i.margin; // 当前内容区域大小
                winSize = (c[txtProp] || c.target[txtProp]()); // 可视窗口大小
                if (i.noMin){
                    if (winSize < conSize){
                        c.target.css('min-'+txtProp, winSize);
                    }else {
                        c.target.css('min-'+txtProp, '');
                        winSize = conSize;
                    }
                }
                barSize = winSize - c.margin[2]; // 滚动条容器大小
            }
            if (winSize && conSize){
                ctrSize = Math.max(15, Math.floor(barSize * winSize / conSize)); // 滚动条控制块大小
            }else {
                ctrSize = barSize;
                winSize = Math.max(winSize, conSize);
            }

            i.win = winSize;	// 视口大小
            i.con = conSize;	// 内容大小
            i.max = Math.min(0, winSize - conSize);	// 内容移动限制
            i.pos = Math.max(now, i.max); // 内容当前位置
            i.bMax = barSize - ctrSize; // 拖块最大位置
            i.bPos = i.max ? Math.floor(i.bMax * i.pos / i.max) : 0; // 拖块当前位置
            i.show = (i.max !== 0 || !c.auto); // 滚动条是否显示

            this.bar[txtProp2](c.size)[txtProp](barSize).toggle(i.show);
            this.ctr[txtProp2](c.size)[txtProp](ctrSize).css(txtPos, i.bPos);
            if (c.type !== 'manual'){
                c.content.css(txtMargin, i.pos + i.init);
            }

            if (c.pad){
                var pad = util.getCssValue(c.target, txtPadding);
                if (i.show){
                    pad += (c.size + c.offset - this.pad);
                    this.pad = c.size + c.offset;
                }else {
                    pad -= this.pad;
                    this.pad = 0;
                }
                c.target.css(txtPadding, pad);
            }
            var flag = (i.max !== 0);
            if (flag !== hasScroll){
                this.fire('scrollReset',flag);
            }
        },
        // 获取最大滚动像素值
        getScrollMax: function(){
            return -this.info.max;
        },
        // 获取当前滚动位置
        getScrollPos: function(){
            return -this.info.pos;
        }
    });
    exports.scroller = Scroller;

    /**
     * Input类
     */
    function Input(config,parent,idObject){
        this.config = $.extend(
            true
            ,{
                "target":"body"
                ,"class":""
                ,"type":"text"
                ,"value":""
                ,"placeholder":null
                ,"label":null
                ,"events":"click"
                ,"disabled": false
            }
            ,config
        );
        // 只能是input
        this.$isInput = (this.config.type === 'text');
        this.config.tag = (this.config.type === "textarea")?"textarea":"input";
        this.el = this.createDom(this.config);
        if(this.config.placeholder){
            this.el.attr("placeholder",this.config.placeholder);
        }
        if(this.config.width){
            this.el.css("width",this.config.width);
        }
        if(this.config.height){
            this.el.css("height",this.config.height);
        }
        if(this.config.disabled){
            this.el.prop('disabled',this.config.disabled)
        }
        this.config.target = $(this.config.target);
    }
    /**
     * 执行事件冒泡
     * @param  {String}    type   事件类型
     * @param  {Object}    me     Input实例
     * @param  {Object}    target 事件触发的Jq对象
     * @return {Undefined}        无返回值
     */
    function _fireInTheHole(type,me,target){
        if (me.$isInput){
            var value = target.val();
            var defValue = me.config.value;

            if(type == 'focus'){
                if(value == defValue){
                    target.val("");
                }
            }
            if(type == 'blur'){
                if(value === ''){
                    target.val(defValue);
                }
            }
        }

        me.fire(type,{
            "value":target.val()
            ,"target":target
        });
    }
    extend(
        Input
        ,view.container
        ,{
            init:function(){
                var c = this.config;
                c.target.append(this.el);
                if(c.label && c.label.html){
                    this.label = this.create(
                        "label"
                        ,Label
                        ,$.extend({target: this.el}, c.label)
                    )
                }
                if (this.$isInput){
                    if (c.events && c.events.indexOf('blur') === -1){
                        c.events += ' blur';
                    }
                    if (c.events && c.events.indexOf('focus') === -1){
                        c.events += ' focus';
                    }
                }
                this.bindEvent();
            }

            /**
             * 事件绑定方法
             * @return {Object}        Input实例对象
             */
            ,bindEvent:function(){
                if(this.config.events){
                    this.el.bind(this.config.events,this,this.mEvent);
                }
                return this;
            }
            ,mEvent:function(ev){
                // console.log(ev.type);
                _fireInTheHole(ev.type,ev.data,$(ev.target));
            }
            /**
             * 点击方法
             * @param  {Object}    ev 事件对象
             * @return {Undefined}    无返回值
             */
            ,click:function(ev){
                _fireInTheHole("click",ev.data,$(ev.target));
            }
            /**
             * 失去焦点方法
             * @param  {Object}    ev 事件对象
             * @return {Undefined}    无返回值
             */
            ,blur:function(ev){
                _fireInTheHole("blur",ev.data,$(ev.target));
            }
            /**
             * 获得焦点方法
             * @param  {Object}    ev 事件对象
             * @return {Undefined}    无返回值
             */
            ,focus:function(ev){
                _fireInTheHole("focus",ev.data,$(ev.target));
            }
            ,disable: function() {
                this.el.attr('disabled','disabled');
            }
            ,enable: function() {
                this.el.removeAttr('disabled');
            }
            ,setData: function(data){
                this.el.val(data);
                return this;
            }
            ,setDefault: function(data){
                this.config.value = data;
            }
            /**
             * 获取数据
             * @param  {String} format <可选> 返回数据的格式
             * @return {Mix}           返回输入框的内容
             */
            ,getData: function(format){
                var val = this.el.val();
                switch (format){
                    case "int":
                        return (parseInt(val, 10) || 0);
                    case "float":
                        return (parseFloat(val) || 0);
                    default:
                        return val;
                }
            }
        }
    );
    exports.input = Input;

    function Label(config,parent,idObject){
        this.config = $.extend(
            {
                "target":"body"
                ,"html":"Label"
                ,"pos":1
            }
            ,config||{}
        );
        this.config.tag = "label";
        this.el = this.createDom(this.config);
        var id =this.config.target.attr("id");
        if(!id){
            id = parent._.name+"_"+parent._.guid+"_"+idObject.guid;
            this.config.target.attr("id",id);
        }
        this.el.attr("for",id);
    }
    extend(
        Label
        ,view.container
        ,{
            init:function(){
                this.config.target[
                this.config.pos && "before" || "after"
                    ](this.el);
            }
        }
    );
    exports.label = Label;


    /**
     * 按钮模块
     */
    function Button(config, parent){
        var c = config || {};
        this.target = $(c.target || parent.el || 'body');
        this.text = c.text || LANG('按钮');
        this.html = c.html || null;
        this.data = c.data || null;
        delete(c.target);
        delete(c.text);
        delete(c.html);
        delete(c.data);
        c.type = 'button';
        this.attr = c;
    }
    extend(Button, app.Module, {
        init: function(){
            var el = this.el = $('<button/>').attr(this.attr);
            if (this.html){
                el.html(this.html);
            }else {
                el.text(this.text);
            }
            el.appendTo(this.target);
            el.bind('click', this, this.eventClick);
        },
        eventClick: function(evt){
            var me = evt.data;
            me.fire('buttonClick', me.data);
        },
        hide: function(){
            this.el.hide();
        },
        show: function(){
            this.el.show();
        },
        disable: function() {
            this.el.attr('disabled','disabled');
        },
        enable: function() {
            this.el.removeAttr('disabled');
        }
    });
    exports.button = Button;

    /**
     * 按钮组模块
     */
    function ButtonGroup(config, parent){
        config = $.extend(true, {
            'target': parent,
            'items': null,
            'selected': null,
            'no_state': false,
            'tips': '',		// 提示说明
            'disabled': false
        }, config);
        ButtonGroup.master(this, null, config);
    }
    extend(ButtonGroup, view.container, {
        init: function(){
            this.doms = {};
            this.buildItems();
            this.updateSelected();
            this.el.addClass('G-buttonGroup');
            this.dg(this.el, 'input', 'click', 'eventClick');
            ButtonGroup.master(this, 'init');
        },
        /**
         * 禁用某几个按钮
         * @param  {Array}  items   按钮索引数组
         * @param  {Bool}   reverse 是否反向操作
         * @return {Object}         实例对象
         */
        disableItems:function(items){
            var c = this.config;
            var doms = this.doms;
            util.each(c.items, function(item, index){
                doms['item_'+index].prop('disabled', false);
            });

            util.each(items, function(item){
                item = doms['item_'+item];
                if (item){
                    item.prop('disabled', true);
                }
            });
            return this;
        },
        // 生成按钮组按钮项目
        buildItems: function(){
            var doms = this.doms;
            var c = this.config;
            util.each(c.items, function(item, index){
                var id = 'item_'+index;
                var name = (item && item.text) || item;
                if (util.has(doms, id)) {return;}

                var dom = $('<input class="btn" type="button"/>');
                doms[id] = dom.attr('data-id', index)
                    .val(name)
                    .prop('disabled', c.disabled)
                    .appendTo(this.el);
            }, this);

            // 提示说明
            if(c.tips){
                this.create('tips',Tips,{
                    target: this.el,
                    tips:c.tips
                });
            }
        },
        // 更新按钮选中状态
        updateSelected: function(){
            var c = this.config;
            if (c.no_state) {return false;}
            var doms = this.doms;
            this.el.children('.selected').removeClass('selected');
            if (c.selected !== null){
                var item = doms['item_' + c.selected];
                if (item){
                    item.addClass('selected');
                }
            }
        },
        // 按钮点击事件
        eventClick: function(evt, elm){
            var c = this.config;
            var id = $(elm).attr('data-id');
            if (!c.no_state && id === c.selected){ return false; }
            var msg = {
                last: c.selected,
                selected: id,
                item: c.items[id] || null
            };
            c.selected = id;
            if (!c.no_state) { this.setData(id); }
            this.fire('changeButton', msg);
        },
        // 重置控件, 清除按钮组选项按钮
        reset: function(){
            util.each(this.doms, function(item, name){
                if (name == 'group') {return;}
                item.remove();
                return null;
            });
            this.config.items = null;
            this.config.selected = null;
        },
        // 设置控件数据
        setData: function(selected, items){
            if (util.isArray(selected)){
                items = selected;
            }else {
                this.config.selected = selected;
            }
            if (items){
                this.reset();
                this.config.items = items;
                this.buildItems();
            }
            this.updateSelected();
        },
        // 获取选中状态
        getData: function(complete){
            var c = this.config;
            return complete?{
                "id":c.selected,
                "text":c.items[c.selected]
            }:c.selected;
        },
        /**
         * 设置单个控件的数据
         * @param {Number} index 索引
         * @param {Object} data  数据item
         */
        setItem: function(index, data) {
            var item = this.config.items[index];
            item = $.extend(item, data);
            var id = 'item_' + index;
            var name = item && item.text;
            this.doms[id].val(name);
        }
    });
    exports.buttonGroup = ButtonGroup;


    /**
     * 下拉选择模块
     */
    function DropdownList(config, parent){
        // 搜索过滤可选
        // 滚动条
        // 高度, 宽度
        // 默认提示信息
        config = $.extend(true,{
            'class': 'M-commonDropdown',
            'target': parent,
            'no_state': false,
            'scroll': true, // 是否有滚动条
            'search': true, // 是否有过滤框
            'search_atonce': false, // 立即搜索
            'search_callback': null, // 过滤回调函数
            'height': 30, // 显示框高度
            'width': 200, // 显示框框度
            'option_height': 200, // 弹出选项窗口高度
            'option_width': 0,  // 弹出选项窗口宽度
            'line_height': 18,	// 每个option高度
            'render': null, // 显示渲染回调函数
            'option_render': null, // 选项内容渲染函数
            'options': null,  // 选项对象<数组>
            'data': null, // 选中的选项
            'key': '_id', // 选项记录关键字字段名
            'name': 'Name', // 选项记录显示字段名
            'url': null,  // 列表数据拉取地址, 留空不拉取
            'param': null, // 拉取数据时请求的参数
            'auto_load': true, // 初始化时自动拉取数据
            'all': null, // 默认全选项
            'fixed': null, // 固定选项参数<数组>
            'def': null,
            "drag": true,		// 下拉框是否允许动态改变尺寸
            "hasArrow": true    // 是否有三角符号
        }, config);
        DropdownList.master(this, null, config);
        if(this.config.filter && util.isFunc(this.config.filter)){
            this.filter = this.config.filter;
        }
        delete this.config.options;
        delete this.config.data;
        this.$options = config.options;
        this.$data = this.$origin = config.data;
        this.$index = null;
        this.$show_option = false;
        this.$dirty_option = false;
        this.$disabled = false;
        this.mergeFixed();
    }
    extend(DropdownList, view.container, {
        init: function(){
            DropdownList.master(this, 'init');
            var c = this.config;
            var doms = this.doms = {};
            var con = $('<div />').appendTo(this.el);
            doms.result = $('<div class="result"/>').css('line-height', c.height + 'px').appendTo(con);
            doms.arrow = $('<div class="arrow"/>').appendTo(con);
            doms.arrow[c.hasArrow ? 'show' : 'hide']();
            this.el.width(c.width).height(c.height);

            this.jq(con, 'click', 'eventTrigger');
            this.jq(this.el, 'mousedown', 'eventTrackMe');

            if (c.url && c.auto_load){
                this.load();
            }else {
                this.updateSelected();
                this.showResult();
            }
        },
        // 重置选择
        reset: function(){
            this.$data = null;
            this.$origin = null;
            this.hideOption();
            this.updateSelected();
            this.showResult();
            this.enable();
            this.fire('optionReset');
        },
        // 获取选中的数据ID
        getData: function(detail){
            if (!detail){ return this.$data; }
            var idx, c = this.config;
            if (detail === true){
                // 获取当前值
                idx = this.$index;
                if (idx === null){
                    return null;
                }else if (idx === -1){
                    return c.all;
                }else {
                    return this.$options[idx];
                }
            }else {
                // 获取指定的记录
                if (detail === -1){
                    if (c.all){ return c.all; }
                }else{
                    return util.find(this.$options, detail, c.key);
                }
                return null;
            }
        },
        /**
         * 获取当前的Options
         * @return {Array} Option数组
         */
        getOptions:function(){
            return this.$options;
        },
        // 设置显示数据
        setData: function(select, options){
            if (util.isArray(select)){
                options = select;
                select = this.$origin;
            }

            if (options){
                this.$options = options;
                this.mergeFixed();
            }
            this.$origin = this.$data = select;
            this.updateSelected();
            this.showResult();
            if (this.$show_option){
                this.buildPanel();
                this.showSelect();
            }else {
                this.$dirty_option = true;
            }
            return this;
        },
        mergeFixed: function(){
            var fixed = this.config.fixed;
            var opts = this.$options;
            if (fixed){
                if (opts){
                    opts.unshift.apply(opts, fixed);
                }else {
                    this.$options = fixed;
                }
            }
        },
        // 加载显示数据
        load: function(param){
            var c = this.config;
            if (param){
                c.param = util.merge(c.param, param);
            }
            //todo: 加入加载状态提示
            app.data.get(c.url, c.param, this);
        },
        // 拉取数据回调
        onData: function(err, data){
            //todo: 移除加载状态
            if (err){
                app.alert(err.message);
                return false;
            }
            this.setData(this.$origin, data.items);
            // 数据加载完成
            this.fire(
                "dropdownDataLoaded"
                ,{
                    "data":this.$options
                    ,"now":this.$options[this.$index]
                }
            );
        },
        /**
         * 显示选中的选项信息
         */
        showResult: function(opt){
            var c = this.config;
            var dom = this.doms.result;
            var option = c.no_state ? null : (opt || this.getData(true));
            if (option === null){
                if (c.def){
                    dom.html(c.def);
                }else {
                    dom.html('&nbsp;');
                }
            }else {
                if (c.render){
                    var html = c.render(option, dom);
                    if (html){ dom.html(html); }
                }else {
                    dom.text(option[c.name]);
                }
            }
        },
        // 监控鼠标是否点击到控件上, 防止选项被隐藏
        eventTrackMe: function(){
            this.$mouse_inside = true;
        },
        // 隐藏选项
        hideOption: function(){
            if (this.$mouse_inside){
                this.$mouse_inside = false;
                return;
            }
            if (this.doms.list){ this.doms.list.hide(); }
            this.$show_option = false;
            $(document.body).unbind('mousedown.dropdown');
        },
        // 显示选项
        showOption: function(){
            this.$mouse_inside = false;
            this.$show_option = true;
            this.doms.list.show();
            this.showSelect();
            this.jq(document.body, 'mousedown.dropdown', 'hideOption');
        },
        // 显示对应的选中子菜单和状态
        showSelect: function(){
            var doms = this.doms.options;
            var index = this.$index;
            doms.find('.act').removeClass('act');
            if (index === -1){
                doms.children('[data-all]:first').addClass('act');
            }else if (index !== null) {
                doms.children('[data-id='+index+']:first').addClass('act');
            }
        },
        // 显示选项界面触发
        eventTrigger: function(evt){
            if (this.$disabled){
                return;
            }
            var doms = this.doms;
            if (!doms.list){
                this.buildList();
            }
            if (this.$show_option){
                this.hideOption();
            }else {
                if (this.$dirty_option){
                    this.doms.list.show();
                    this.buildPanel();
                }
                this.showOption();
                if (doms.search_key){
                    doms.search_key.focus();
                }
            }
        },
        // 选项过滤
        eventSearch: function(evt){
            var input = this.doms.search_key;
            var val = '';

            if (evt.data == 'cancel'){
                input.val('');
            }else {
                val = input.val();
            }

            if (val === ''){
                this.toggleSeatchIcon(true)
            }else{
                this.toggleSeatchIcon(false)
            }

            this.filterOption(
                this.$options,
                this.doms.options.children('.option'),
                val,
                this.config.search_callback
            );
            this.updateScroll();
        },
        // 显示或者隐藏搜索按钮
        toggleSeatchIcon: function(state){
            var search = this.doms.btnSearch;
            var cancel = this.doms.btnCancel;
            if(state){
                search.show();
                cancel.hide();
            }else{
                search.hide();
                cancel.show();
            }
        },
        // 选项过滤循环函数
        filterOption: function(opts, elms, key, cb){
            if (key){
                var elm, text;
                key = key.toUpperCase();
                for (var i=0; i<elms.length; i++){
                    elm = elms.eq(i);
                    if (elm.attr('data-all') == '1'){continue;}
                    if (cb){
                        text = elm.attr('data-id');
                        text = opts[text];
                        if (text){
                            elm.toggle(cb(key, text));
                        }
                    }else {
                        text = elm.text().toUpperCase();
                        elm.toggle(text.indexOf(key) !== -1);
                    }
                }
            }else {
                elms.show();
            }
        },
        // 选中某个选项
        eventSelect: function(evt, elm){
            evt.preventDefault();
            evt.stopPropagation();
            var id, opt, dom = $(elm);
            if (dom.attr('data-all') == '1'){
                id = null;
                opt = this.config.all;
                this.$index = -1;
            }else {
                id = +dom.attr('data-id');
                opt = this.$options[id];
                if (isNaN(id) || !opt) {return;}
                this.$index = id;
                id = opt[this.config.key];
            }
            this.hideOption();
            if (!this.config.no_state && id === this.$data) { return; }
            var msg = {
                id: id,
                last: this.$data,
                option: opt
            };
            this.$data = id;
            this.showResult(opt);
            this.fire('optionChange', msg);
        },
        // 生成选项列表
        buildList: function(){
            var doms = this.doms;
            var c = this.config;
            doms.list = $('<div class="list"/>').appendTo(this.el);
            doms.list.width(c.option_width || c.width);
            doms.list.css('top', this.el.outerHeight());

            if (c.search){
                doms.search = $('<div class="search" />').appendTo(doms.list);
                doms.search_key = $('<input type="text" />').appendTo(doms.search);
                doms.btnSearch = $('<div class="btnSearch"/>').appendTo(doms.search);
                doms.btnCancel = $('<div class="btnCancel"/>').appendTo(doms.search);
                this.jq(doms.search_key, (c.search_atonce ? 'keyup' : 'change'), 'eventSearch');
                this.jq(doms.btnSearch, 'click', 'eventSearch');
                this.jq(doms.btnCancel,'click', 'cancel' , 'eventSearch');
                this.jq(doms.list, 'click', util.stopEvent);
            }

            if(c.drag){
                // 拖拉图标
                doms.drag = $('<div class="dragIcon"/>').appendTo(doms.list);
                app.drag(doms.drag, this.eventCtrs, this);
            }

            doms.options = $('<div class="options"/>').appendTo(doms.list);
            this.dg(doms.options, '.option', 'click', 'eventSelect');


            if (c.scroll){
                doms.scroll = $('<div/>').appendTo(doms.list);
                doms.options.appendTo(doms.scroll);
                this.create('scroll', Scroller, {
                    target: doms.scroll,
                    content: doms.options,
                    dir: 'V'
                });
            }
            this.buildPanel();
        },
        /**
         * 控制块拖动处理函数
         * @param  {Object} ev 拖动事件对象
         * @return {Bool}    返回操作是否成功
         */
        eventCtrs: function(data, ev){
            var doms = this.doms;
            var list = doms.list;
            var search = doms.search_key;
            var opts = doms.options.parent();
            switch (data.type){
                case 'moveDrag':
                    // 当前下拉框宽度
                    var width = this.$width + data.dx;

                    // 当前搜索框宽度
                    var searchWidth = search && (this.$search + data.dx);

                    // 当前下拉框高度
                    var height = this.$height + data.dy;

                    if(data.originWidth && (data.originWidth < width)){
                        list.width(width);
                        if(search){search.width(searchWidth);}
                    }

                    if(data.originHight && (data.originHight < height)){
                        opts.height(height);

                    }
                    break;
                case 'startDrag':

                    // 长宽
                    this.$width =list.width();
                    this.$search = search && search.width();
                    this.$height =opts.css('minHeight','').height();

                    // 原始长宽保存到object里面去
                    if(!data.originWidth){
                        data.originWidth = this.$width;
                    }
                    if(!data.originHight){
                        data.originHight = this.$height;
                    }

                    break;
                case 'endDrag':
                    this.$.scroll.measure();
                    break;
            }
            return true;
        },
        /**
         * 过滤项目的对外接口函数。需要显示自定义数据的请在这边处理
         * @return {Array} 符合需求的数据
         */
        filter:function(options){
            return options;
        },
        /**
         * 添加一个项目
         * @param {Object} data 添加的数据
         */
        add:function(data){
            this.$options = this.$options || [];
            this.$options.unshift(data);
            this.$data = data[this.config.key];
            this.$index = 0;
            this.showResult(data);
            return this.$data;
        },
        // 生成选项
        buildPanel: function(){
            var c = this.config;
            var doms = this.doms;
            doms.options.empty();
            this.$dirty_option = false;

            // 默认显示的项目
            if (c.all){
                this.buildOption(c.all, null);
            }

            // 筛选数据
            this.$options = this.filter(this.$options);

            // 循环生成
            util.each(this.$options, this.buildOption, this);

            // 搜索过滤框
            if (c.search){
                var w = doms.search_key.outerWidth(true) - doms.search_key.width();
                doms.search_key.hide();
                w = doms.search.width() - w;
                doms.search_key.show().width(w);
            }
            this.updateScroll();
        },
        // 生成选项DOM对象
        buildOption: function(opt, id){
            var c = this.config;
            var dom = $('<a class="option" href="#"/>').css('line-height', c.line_height+'px').appendTo(this.doms.options);
            if (id === null){
                dom.attr('data-all', 1);
            }else {
                dom.attr('data-id', id);
            }
            if (c.option_render){
                var html = c.option_render(id, opt, dom);
                if (html){ dom.html(html); }
            }else {
                dom.text(opt[c.name]);
            }
        },
        // 更新滚动条状态
        updateScroll: function(){
            var c = this.config;
            if (!c.scroll) { return; }
            var doms = this.doms;
            if (c.option_height){
                var h = c.option_height;
                if (doms.search){
                    h -= doms.search.outerHeight(true);
                }
                doms.options.css('marginTop', '');
                if (h > doms.options.outerHeight(true)){
                    doms.scroll.css('height', 'auto');
                }else {
                    doms.scroll.height(h);
                }
            }
            this.$.scroll.measure();
        },
        // 更新选中的项目状态
        // 根据选中的this.$data更新项目的选中状态
        updateSelected: function(){
            var c = this.config;
            var opts = this.$options;
            var index = null;
            if (this.$data !== null){
                index = util.index(opts, this.$data, c.key);
            }
            if (index === null){
                this.$data = null;
                if (!c.def){
                    if (c.all){
                        index = -1;
                    }else{
                        var op = util.first(opts);
                        if (op){
                            this.$data = op[c.key];
                            index = 0;
                        }
                    }
                }
            }
            this.$index = index;
        },
        // 禁用控件
        disable2: function(disabled){
            this.$disabled = Boolean(disabled);
            this.el.toggleClass('disabled', disabled);
            return this;
        },
        disable: function(){
            $('<span class="mask"/>').appendTo(this.el).show();
            return this;
        },
        enable: function(){
            this.el.find('.mask').hide();
            return this;
        }
    });
    exports.dropdown = DropdownList;

    /**
     * 自定义
     */
    function SubDropdownList(config, parent){
        config = $.extend(true, {
            'name': 'text',
            'key': 'id',
            'skey': 'subs'
            ,"sListClass":"has-sub"
            ,"canSelectParent": false
        }, config);
        SubDropdownList.master(this, null, config);
        this.$subs_id = 1;
        this.$subs_level = 0;
        this.$subs_opts = {};
        this.$subs_sels = [];
        this.$subs_hide = {};
    }
    extend(SubDropdownList, DropdownList, {
        // 获取选中的数据
        getData: function(detail){
            if (!detail){ return this.$data; }

            var idx, c = this.config;
            var opts = this.$options;
            var sels = [];
            var skey = c.skey;

            if (detail === true){
                // 获取当前选择数据
                idx = this.$index;
                if (idx === null){
                    return null;
                }else if (idx === -1){
                    return c.all;
                }else {
                    idx = util.each(idx, function(id){
                        if (id === null){
                            if (!c || !c.all){ return false; }
                            id = c.all;
                        }else {
                            c = id = opts && opts[id];
                            if (!id){ return false; }
                            opts = id[skey];
                        }
                        sels.push(id);
                    });
                    if (idx === null){ return sels; }
                }
            }else{
                // 选择指定的记录
                if (detail === -1){
                    if (c.all){ return c.all; }
                }else{
                    idx = util.each(detail, function(val){
                        val = util.find(opts, val, c.key)
                        if (!val){ return false; }
                        sels.push(val);
                    });
                    if (idx === null){ return sels; }
                }
            }
            return null;
        },
        // 设置选项
        setData: function(select, options){
            if (options){ this.$options = options; }
            this.$origin = this.$data = select;
            this.updateSelected();
            this.showResult();
            if (this.$show_option){
                this.buildPanel();
                this.showSelect();
            }else {
                this.$dirty_option = true;
            }
            return this;
        },
        // 更新选中的项目状态
        updateSelected: function(){
            var c = this.config,
                opts = this.$options,
                data = [],
                index = [],
                opt, idx;

            idx = util.each(this.$data, function(id){
                // 上一个选项是所有选项, 不允许有子项目
                if (idx === -1){ return false; }
                if (id === null){
                    // 所有选项
                    if (opt && opt.all){
                        idx = -1;
                        data.push(null);
                    }else {
                        return false;
                    }
                }else {
                    idx = util.index(opts, id, c.key);
                    if (idx === null){
                        return false;
                    }
                    opt = opts[idx];
                    opts = opt[c.skey];
                    data.push(opt[c.key]);
                }
                index.push(idx);
            });
            if (idx !== null){
                data = null;
                if (c.def){
                    index = null;
                }else{
                    if (c.all){
                        index = -1;
                    }else{
                        opts = this.$options;
                        idx = util.index(opts, undefined, c.skey);
                        if (idx !== null){
                            data = [opts[idx][c.key]];
                            index = [idx];
                        }
                    }
                }
            }
            this.$data = data;
            this.$index = index;
        },
        // 生成选中的选项信息
        showResult: function(){
            var c = this.config;
            var dom = this.doms.result;
            var sels = this.getData(true);
            if (sels && sels.length){
                if (c.render){
                    var html = c.render(sels, dom);
                    if (html){ dom.html(html); }
                }else {
                    var opt = sels.pop();
                    dom.text(opt[c.name]);
                }
            }else {
                if (c.def){
                    dom.html(c.def);
                }else {
                    dom.html('&nbsp;');
                }
            }
        },
        // 显示对应的选中子菜单和状态
        showSelect: function(){
            var doms = this.doms;
            var index = this.$index;

            // 去掉选择状态
            doms.options.find('a.act').removeClass('act');
            if (doms.subOption){
                doms.subOption.find('a.act').removeClass('act');
            }

            if (index === -1){
                doms.options.children('[data-all]:first').addClass('act');
            }else if (index){
                // 处理选择
                doms = doms.options;
                this.$subs_sels = [];
                util.each(index, function(idx, lv){
                    var a = doms.find('[data-id='+idx+']:first').addClass('act');
                    var sid = +a.attr('data-subs');
                    if (isNaN(sid)){ return false; }
                    var sub = this.$subs_opts[sid];
                    if (!sub){ return false; }
                    doms = sub.list;
                    this.showSubOption(sid);
                }, this);
            }
        },
        // 处理搜索
        eventSearch: function(evt, input){
            var con = $(input).parent().parent();
            var sid = +con.attr('data-sid');
            var sels = this.$subs_sels;
            if (isNaN(sid)){
                // 主列表调用原搜索函数
                SubDropdownList.master(this, 'eventSearch');
                // 隐藏所有子选项卡
                this.doms.subOption.children().hide();
                sels.splice(0, sels.length);
            }else {
                var sub = this.$subs_opts[sid];
                this.filterOption(
                    sub.options,
                    sub.list.children('.option'),
                    input.value,
                    sub.search_callback
                );
                // 调用相对的滚动条更新
                sub.scroll_dirty = 1;
                this.updateSubScroll(sid);
                // 搜索时隐藏子菜单
                this.showSubOption(sid, true);
            }
        },
        // 生成选项
        buildPanel: function(){
            // 清除子菜单项目
            if (this.doms.subOption){
                this.doms.subOption.empty();
                util.each(this.$subs_opts, function(sub){
                    if (sub.scroll){
                        sub.scroll.destroy();
                    }
                    return null;
                });
            }
            // 调用父类方法构建选项
            this.$subs_id = 1;
            SubDropdownList.master(this, 'buildPanel');
            this.doms.options.children().attr('data-level', 0);
        },
        // 构建选项
        buildOption: function(opt, id){
            SubDropdownList.master(this, 'buildOption');
            var c = this.config;

            if (opt[c.skey] && opt[c.skey].length){
                var doms = this.doms;
                this.buildSubPanel(
                    opt, id,
                    doms.options.children(':last')
                );
            }
        },
        // 构建子菜单选项
        buildSubPanel: function(opt, id, parent_elm){
            var sid = this.$subs_id++;
            var doms = this.doms;
            if (!doms.subOption){
                doms.subOption = $('<div class="sub-list"/>').appendTo(doms.list);
                this.dg(doms.subOption, '.search_key', 'change', 'eventSearch');
                this.dg(doms.list, 'a.option', 'mouseenter mouseleave', 'eventOptionMouse');
                this.dg(doms.list, 'a.option', 'click', 'eventSelect');
            }

            // 列表容器
            var c = this.config;
            parent_elm.attr('data-subs', sid);
            if(c.sListClass){
                parent_elm.addClass(c.sListClass);
            }
            var ori_option = doms.options;
            var panel = $('<div class="subs"/>').appendTo(doms.subOption);
            panel.width(opt.option_width || c.option_width || c.width);
            c = this.$subs_opts[sid] = {
                'id': opt[this.config.key],
                'index': id,
                'panel': panel,
                'anchor': parent_elm,
                'level': this.$subs_level++,
                'options': opt[this.config.skey],
                'list': $('<div class="options" data-type="sub"/>').appendTo(panel),
                'arrow': $('<div class="sub_arrow"/>').appendTo(panel)
            };

            // 是否有搜索框
            if (opt.search){
                c.search_init = 1;
                c.search = $('<div class="search" />').prependTo(panel);
                c.search_key = $('<input type="text" class="search_key" />').appendTo(c.search);
            }
            // 是否需要滚动条
            if (opt.scroll){
                c.height = opt.scroll;
                c.scroll_dirty = 1;
                c.container = $('<div/>').appendTo(panel).append(c.list);
                c.scroll = this.create(Scroller, {
                    target: c.container,
                    content: c.list,
                    dir: 'V'
                });
            }

            // 创建子选项
            panel.attr({
                'data-sid':sid,
                'data-level':c.level
            });
            doms.options = c.list;
            util.each(c.options, this.buildOption, this);
            doms.options = ori_option;
            c.list.children().attr('data-level', this.$subs_level);
            this.$subs_level--;
        },
        // 更新滚动条
        updateSubScroll: function(sid){
            var sub = this.$subs_opts[sid];
            if (!sub.scroll || !sub.scroll_dirty){ return; }
            sub.scroll_dirty = 0;
            if (sub.height){
                var h = sub.height;
                if (sub.search){
                    h -= sub.search.outerHeight(true);
                }
                sub.list.css('marginTop', '');
                if (h > sub.list.outerHeight(true)){
                    sub.container.css('height', 'auto');
                }else {
                    sub.container.height(h);
                }
            }
            sub.scroll.measure();
        },
        // 隐藏选项
        hideOption: function(){
            SubDropdownList.master(this, 'hideOption');
            if (!this.$show_option){
                if (this.doms.subOption){
                    this.doms.subOption.children().hide();
                }
                this.$subs_sels.splice(0, this.$subs_sels.length);
            }
        },
        // 子菜单选中
        eventOptionMouse: function(evt, elm){
            var a = $(elm);
            var sid = +a.attr('data-subs');
            if (isNaN(sid)){
                var doms = this.doms;
                // 没有子菜单的选项(隐藏下一层菜单)
                sid = +a.attr('data-level');
                if (this.$subs_sels.length > sid){
                    this.hideSubOption(this.$subs_sels[sid]);
                }else {
                    doms = a.closest('.subs[data-sid]');
                    if (doms.length){
                        sid = +doms.attr('data-sid');
                        if (sid === this.$subs_hide.sid){
                            this.hideSubOption(false);
                        }
                    }
                }
                return;
            }

            // 子菜单选项处理

            switch (evt.type){
                case 'mouseenter':
                    // 显示子栏目
                    this.showSubOption(sid);
                    // 更新滚动条状态
                    this.updateSubScroll(sid);
                    break;
                case 'mouseleave':
                    this.hideSubOption(sid);
                    break;
            }
        },
        // 选项选择
        eventSelect: function(evt, elm){
            evt.preventDefault();
            evt.stopPropagation();
            var a = $(elm);
            if (!this.config.canSelectParent && a.attr('data-subs')){
                // 子选项, 显示选项, 不能选中
                evt.type = 'mouseenter';
                this.eventOptionMouse(evt, elm);
                return;
            }
            var lv = +a.attr('data-level');
            var subs = this.$subs_opts, sels = this.$subs_sels;
            var opts = this.$options;
            var data = [], index = [], opt = [];
            var id, c = this.config;

            for (id=0; id<lv; id++){
                if (sels.length <= id){ return; }
                c = subs[sels[id]];
                opt.push(opts[c.index]);
                index.push(c.index);
                data.push(c.id);
                opts = c.options;
            }
            if (a.attr('data-all') === '1'){
                id = null;
                opt.push(c.all);
                index.push(id);
                if (data.length === 0){
                    data = id;
                }else {
                    data.push(id);
                }
            }else {
                id = +a.attr('data-id');
                if (!opts[id]) {return;}
                opt.push(opts[id]);
                index.push(id);
                id = opts[id][this.config.key];
                data.push(id);
            }

            this.hideOption();
            if (this.$data === data && data === null){
                return;
            }else if (this.$data && data &&  this.$data.toString() === data.toString()){
                return;
            }

            var msg = {
                id: data,
                last: this.$data,
                option: opt
            };
            this.$data = data;
            this.$index = index;

            this.showResult();
            this.fire('optionChange', msg);
        },
        // 显示指定的子选项
        showSubOption: function(sid, force){
            var sub = this.$subs_opts[sid];
            var sels = this.$subs_sels;
            this.hideSubOption(false);
            if (!force && sels[sub.level] === sid){ return; }
            while (sels.length > sub.level){
                this.$subs_opts[sels.pop()].panel.hide();
            }
            sels.push(sid);
            var pos = this.measureOptionPos(sub.anchor[0]);
            var con = sub.panel.show();
            var con_height = con.outerHeight() / 2;
            sub.arrow.css('top', con_height - sub.arrow.outerHeight() / 2);
            pos.top -= con_height;
            con.css(pos);
            // 修正搜索框宽度
            if (sub.search_init){
                sub.search_init = 0;
                con = sub.search_key
                pos = con.outerWidth(true) - con.width();
                con.hide();
                pos = sub.search.width() - pos;
                con.show().width(pos);
            }
        },
        // 隐藏子选项
        hideSubOption: function(mode){
            var c = this.$subs_hide;
            if (mode === true){
                // 隐藏子选项
                var sub = this.$subs_opts[c.sid];
                if (!sub){ return; }
                var sels = this.$subs_sels;
                if (sels[sub.level] !== c.sid){ return; }
                while (sels.length > sub.level){
                    this.$subs_opts[sels.pop()].panel.hide();
                }
            }else if (mode === false){
                // 取消隐藏
                if (c.tid){ clearTimeout(c.tid); }
            }else {
                // 延迟隐藏
                c.sid = mode;
                if (c.tid){ clearTimeout(c.tid); }
                c.tid = this.setTimeout('hideSubOption', 500, true);
                return;
            }
            c.tid = 0;
            c.sid = -1;
        },
        // 计算菜单位置
        measureOptionPos: function(elm){
            var relate = this.doms.list[0];
            var top = elm.offsetHeight / 2;
            var left = elm.parentElement.parentElement.offsetWidth;
            while (elm !== relate && elm !== document.body){
                top += elm.offsetTop;
                left += elm.offsetLeft;
                elm = elm.offsetParent;
            }
            return {'top':top, 'left':left};
        }
    });
    exports.subDropdown = SubDropdownList;

    var DropdownMenu = app.extend(
        SubDropdownList
        ,{
            init:function(config){
                config = $.extend(
                    {
                        "label":null
                        ,"search":false
                        ,"scroll":false
                        ,"key":"type"
                        ,"name":"text"
                        ,"drag":false
                        ,"def":LANG("菜单")
                        ,"sListClass":null
                    }
                    ,config
                );
                DropdownMenu.master(this,null,config);
                DropdownMenu.master(this,"init",[config]);
            }
            /**
             * 项目点击响应函数
             * @param  {Object}    evt 鼠标事件对象
             * @param  {Object}    elm 事件源dom对象
             * @return {Undefined}     无返回值
             */
            ,eventSelect: function(evt,elm){
                evt.preventDefault();
                evt.stopPropagation();
                var id, opt = [], dom = $(elm);
                if (dom.attr('data-subs')){
                    // 子选项, 显示选项, 不能选中
                    evt.type = 'mouseenter';
                    this.eventOptionMouse(evt, elm);
                    return;
                }

                var lv = +dom.attr('data-level')
                    ,subs = this.$subs_opts, sels = this.$subs_sels
                    ,opts = this.$options
                    ,data = [], index = [],c;

                for (id=0; id<lv; id++){
                    if (sels.length <= id){ return; }
                    c = subs[sels[id]];
                    opt.push(opts[c.index]);
                    index.push(c.index);
                    data.push(c.id);
                    opts = c.options;
                }
                if (dom.attr('data-all') === '1'){
                    id = null;
                    opt.push(c.all);
                    index.push(id);
                    if (data.length === 0){
                        data = id;
                    }else {
                        data.push(id);
                    }
                }else {
                    id = +dom.attr('data-id');
                    if (!opts[id]) {return;}
                    opt.push(opts[id]);
                    index.push(id);
                    id = opts[id][this.config.key];
                    data.push(id);
                }

                this.hideOption();
                if (this.$data === null){
                    if (data === null){return;}
                }else if (!this.config.no_state && this.$data.toString() === data.toString()){
                    return;
                }
                var msg = {
                    id: id,
                    last: this.$data,
                    option: opt
                };
                this.$data = id;
                this.$index = index;
                this.fire("optionChange",msg);
            }
            /**
             * 设定选择状态
             * @return      {Object} 模块实例
             * @description          不设定选择项状态
             */
            ,showSelect:function(){
                /*var doms = this.doms;
                 // 去掉选择状态
                 doms.options.find('a.act').removeClass('act');
                 if(doms.subOption){
                 doms.subOption.find('a.act').removeClass('act');
                 }*/
                return this;
            }
        }
    );
    exports.dropdownMenu = DropdownMenu;

    /**
     * 时间粒度切换模块
     */
    function TimeRange(config, parent){
        config = $.extend(true, {
            'target': parent,
            'class': 'M-commonTimeRange',
            'items': [LANG('小时'), LANG('天'), LANG('周'), LANG('月')],
            'selected': null
        }, config);
        TimeRange.master(this, null, config);
    }
    extend(TimeRange, view.container, {
        init: function(){
            var c = this.config;
            this.render();
            this.create('buttons', ButtonGroup, {
                'items': c.items,
                'selected': c.selected
            });
            this.$date = null;
            var me = this;
            require.async("views/datebar",function(datebar){
                me.$date = datebar;
                // 计算自动指定粒度
                me.updateState();
                if (c.selected === null){
                    me.computSelected();
                }
                c = me = null;
            });
        },
        computSelected: function(){
            var c = this.config;
            var sel = c.selected;
            var date = this.$date.getDate();
            if (date.stastic_all_time){
                // 汇总数据
                sel = 3;
            }else {
                // 时间段间隔
                var diff = date.enddate - date.begindate;
                var span = [172800, 2592000, 7776000]; // 2天, 30天, 90天
                for (sel=0; sel<span.length; sel++){
                    if (diff < span[sel]){
                        break;
                    }
                }
            }
            c.selected = sel;

            this.$.buttons.setData(sel);
            return sel;
        },
        /**
         * 按照给定的日期选择时间段决定哪些按钮不能选中
         * @param  {Object} date 时间段参数对象
         * @return {Number}      返回选中的数据
         */
        updateState: function(date){
            var c = this.config;
            var max = 0;
            if (!date){
                date = this.$date.getDate();
            }
            if (date.stastic_all_time){
                max = 3;
            }else {
                var diff = date.enddate - date.begindate;
                var span = [86400, 604800, 2592000];// 1天, 7天, 30天
                for (max=0; max<span.length; max++){
                    if (diff < span[max]){
                        break;
                    }
                }
            }
            if (c.selected > max){
                c.selected = max;
                this.$.buttons.setData(max);
            }
            var items = [];
            for (max++; max<c.items.length; max++){
                items.push(max);
            }
            this.$.buttons.disableItems(items);
            return c.selected;
        },
        getData: function(){
            return this.config.selected;
        },
        /**
         * 切换时间粒度
         */
        onChangeButton: function(ev){
            var c = this.config;
            c.selected = ev.param.selected;
            this.fire('changeTimeRange', ev.param);
            return false;
        }
    });
    exports.timeRange = TimeRange;

    /**
     * 日期段选择
     */
    var DateRangeWin = null;
    /**
     * 创建日期选择弹出模块
     */
    function _createDateTip(mod){
        if (DateRangeWin){ return DateRangeWin; }
        if (mod){
            DateRangeWin = app.core.create('DateRangePicker', mod);
            this.selectDate();
        }else {
            app.loadModule('popwin.dateTip', _createDateTip, this);
        }
    }

    // 单日期选择框
    var DatePicker = app.extend(view.container, {
        init: function(config){
            config = $.extend({
                'target': parent,
                'tag':'span',
                'months': 1,
                'value': 0,
                'max': 0,
                'min': 0,
                'format': 'Y-m-d',
                'no_date': '',
                'buttons': null,
                'disabled': false,
                'pos': 'bL',
                'width': 80
            }, config);

            DatePicker.master(this, null, config);
            DatePicker.master(this, 'init', arguments);

            // 建立DOM对象
            var date = $('<input type="input" class="M-commonDate btn" />').prop('readonly', true).appendTo(this.el);
            if (config.disabled){
                date.prop('disabled', true);
            }else {
                this.jq(date, 'click', 'selectDate');
            }
            date.width(config.width).mousedown(util.blockEvent);

            this.doms = {'date':date};
            this.showData();
        },
        showData: function(){
            var c = this.config;
            // 设置初始值
            this.doms.date.val(c.value ? util.date(c.format, c.value) : c.no_date);
            return this;
        },
        selectDate: function(){
            var date = _createDateTip.call(this);
            if (!date){ return false; }

            var c = this.config;
            var input = this.doms.date;
            date.unbind();
            date.bind('selectDate', this);
            date.bind('clickDateButton', this);

            // 显示弹出界面
            date.setup({
                'begin': c.value, 'end': c.value,
                'max':c.max, 'min':c.min,
                'numberOfMonths':c.months, 'single':1,
                'buttons': c.buttons
            }).show({'anchor': input, 'offsetY':2, 'offsetX':0, 'pos':c.pos});
            return false;
        },
        onSelectDate: function(ev){
            this.setData(ev.param);
            this.fire('dateChange', ev.param);
            return false;
        },
        onClickDateButton: function(ev){
            this.fire('dateButton', ev.param);
            return false;
        },
        setup: function(config){
            $.extend(true, this.config, config);
            return this;
        },
        setData: function(data){
            this.config.value = data || 0;
            this.showData();
            return this;
        },
        getData: function(){
            var c = this.config;
            return c.value ? util.date(c.format, c.value) : null;
        }
    });
    exports.datePicker = DatePicker;

    /**
     * 日期段选择
     */
    function DateRange(config, parent){
        config = $.extend({
            'target': parent,
            'tag':'span',
            'months': 2,
            'begin':0,
            'end':0,
            'max':0,
            'min':0,
            'buttons': null,
            // 不根据参照物自动计算，改为固定在选择容器的下方出现
            'pos':'bR',
            'width': 180
        }, config);

        config.begin = util.date('Y-m-d', config.begin);
        config.end = util.date('Y-m-d', config.end);

        DateRange.master(this, null, config);
    }
    extend(DateRange, view.container, {
        init: function(){
            DateRange.master(this,'init');

            // 建立DOM对象
            var date = $('<input type="input" class="M-commonDate btn" />').prop('readonly', true).appendTo(this.el);
            this.jq(date, 'click', 'selectDate');
            date.width(this.config.width).mousedown(util.blockEvent);
            this.doms = {'date': date};

            this.showData();
        },
        showData: function(){
            var c = this.config;
            // 设置初始值
            var text = util.date('Y-m-d', c.begin) + ' -- ' + util.date('Y-m-d', c.end);
            this.doms.date.val(text);
        },
        selectDate: function(){
            var date = _createDateTip.call(this);
            if (!date){ return false; }

            var c = this.config;
            var input = this.doms.date;
            date.unbind();
            date.bind('selectDateRange', this);
            date.bind('clickDateButton', this);

            // 显示弹出界面
            date.setup({
                'begin': c.begin, 'end': c.end,
                'max':c.max, 'min':c.min,
                'numberOfMonths':c.months, 'single':0,
                'buttons': c.buttons
            }).show({'anchor': input, 'offsetY':2, 'offsetX':0, 'pos':c.pos});
            return false;
        },
        onSelectDateRange: function(ev){
            this.setData(ev.param);
            this.fire('dateRangeChange', ev.param);
            return false;
        },
        setup: function(config){
            $.extend(true, this.config, config);
            return this;
        },
        setData: function(data){
            var c = this.config;
            c.begin = data.begin;
            c.end = data.end;
            this.showData();
        },
        getData: function(){
            var c = this.config;
            return {
                begin: c.begin,
                end: c.end
            };
        }
    });
    exports.dateRange = DateRange;

    /**
     * 多级选择控件
     */
    var SubLevelCheckbox = app.extend(view.container, {
        init: function(config, parent){
            config = $.extend({
                'class': 'M-commonSLC',
                'target': parent,
                'readonly': false,
                'selected': null,
                'getSubs': false,
                'callback': null,
                // 子级对应的key
                "key":"child",
                // 层级值对应的key
                "valueKey":"value",
                // 显示名称对应的key
                "nameKey":"name",
                // 是否发消息
                "silence":true,
                "level":2
            }, config);
            SubLevelCheckbox.master(this, null, config);
            SubLevelCheckbox.master(this, 'init', [config, parent]);

            this.$guid = util.guid('c_');
            this.$list = null;
            this.$selected = config.selected;
            this.$key = config.key;
            this.$vKey = config.valueKey;
            this.$nKey = config.nameKey;

            var doms = this.doms = {};
            doms.head = $('<ul class="M-commonSLCHead" />').appendTo(this.el);
            doms.body = $('<div class="M-commonSLCBody" />').appendTo(this.el);

            doms.head.append('<span>' + LANG('数据加载中...') + '</span>');

            // 绑定事件
            this.dg(doms.head, 'li', 'click', 'eventSwitchSection');
            this.dg(doms.head, 'li > input', 'change', 'eventToggleSection');
            this.dg(doms.body, '.M-commonSLCItem', 'mouseenter mouseleave', 'eventHoverItem');
            if (!config.readonly){
                this.dg(doms.body, 'input', 'change', 'eventToggleChange');
            }
        },
        /**
         * 设置选项列表
         * @param {Array} list 列表对象
         */
        setList: function(list){
            this.$list = list;
            this.build();
        },
        /**
         * 构建模块界面, 生成选项
         * @return {None}
         */
        build: function(){
            var doms = this.doms;
            var list = this.$list;
            var c = this.config;
            doms.head.empty();
            doms.body.empty();

            for (var i=0; i<list.length; i++){
                var id = this.$guid + '_' + i;
                this.buildSection(id, list[i]);
            }

            // 显示默认面板
            doms.head.children(':eq(0)').addClass('act');
            doms.body.children(':gt(0)').hide();

            if (c.readonly){
                doms.head.find('input:checkbox').prop('disabled', true);
                doms.body.find('input:checkbox').prop('disabled', true);
            }

            // 设置选中的选项
            if (this.$selected){
                this.setData(this.$selected);
            }

            // 回调函数
            var callback = c.callback;
            if (callback && $.isFunction(callback)) {
                callback.call(this);
            }
        },
        eventToggleChange: function(evt, elm){
            var type = $(elm).attr('data-type');
            switch (type){
                case 'zone':
                    this.eventToggleZone(evt, elm);
                    break;
                case 'item':
                    this.eventToggleItem(evt, elm);
                    break;
                case 'sub':
                    this.eventToggleSub(evt, elm);
                    break;
            }
            if(!this.config.silence){
                // 非静默模式
                this.fire(
                    "subLevelChange"
                    ,{
                        "type":type
                        ,"data":this.getData()
                    }
                );
            }
        },
        // 创建分区
        buildSection: function(id, data){
            var doms = this.doms;
            var head = $('<li/>').attr('data-link', id).appendTo(doms.head);
            var body = $('<div/>').attr('data-link', id).appendTo(doms.body);

            $('<input type="checkbox"/>').val(data[this.$vKey] === 0 && '0' || data[this.$vKey] || '').appendTo(head);
            $('<label/>').attr('title', data[this.$nKey]).text(data[this.$nKey]).appendTo(head);
            var tmp = data[this.$key];
            if(tmp){
                for (var i=0; i<tmp.length; i++){
                    var con = $('<div class="M-commonSLCZone"/>').toggleClass('alt', (i%2 === 0)).appendTo(body);
                    this.buildZone(id + '_' + i, con,tmp[i]);
                }
            }
            tmp = null;
        },
        eventSwitchSection: function(evt, elm){
            elm = $(elm);
            elm.siblings().removeClass('act');
            var link = elm.addClass('act').attr('data-link');
            this.doms.body.children().hide().filter('[data-link="'+link+'"]').show();
        },
        eventToggleSection: function(evt, elm){
            var dom = $(elm);
            var chk = dom.prop('checked');
            var link = dom.parent().attr('data-link');
            var body = this.doms.body.children('[data-link="'+link+'"]');
            body.find('input').prop('checked', chk);
            body.find('.M-commonSLCSubCount').hide();
            if(!this.config.silence){
                // 非静默模式
                this.fire(
                    "subLevelChange"
                    ,{
                        "type":"all"
                        ,"data":this.getData()
                    }
                );
            }
        },
        updateSectionCheck: function(body){
            var input = body.find('input');
            var check = input.filter(':checked').length;
            var link = body.attr('data-link');
            var dom = this.doms.head.find('[data-link="'+link+'"] > input');
            dom.prop('checked', (input.length > 0 && check == input.length));
        },
        // 创建栏目
        buildZone: function(id, con, data){
            var head = $('<div class="M-commonSLCZoneHead" />').appendTo(con);
            $('<input id="'+id+'" type="checkbox" data-type="zone"/>').val(data[this.$vKey] === 0 && '0' || data[this.$vKey] || '').appendTo(head);
            $('<label for="'+id+'"/>').attr('title', data[this.$nKey]).text(data[this.$nKey]).appendTo(head);
            var tmp = data[this.$key];
            if (!tmp || !tmp.length){
                return;
            }
            var body = $('<ul class="M-commonSLCZoneBody" />').appendTo(con);
            for (var i=0; i<tmp.length; i++){
                var item = $('<li class="M-commonSLCItem"/>').appendTo(body);
                this.buildItem(id + '_' + i, item,tmp[i]);
            }
            body.append('<div class="clear"/>');
            tmp = null;
        },
        eventToggleZone: function(evt, elm){
            var dom = $(elm);
            var chk = dom.prop('checked');
            dom = dom.parent().next();
            if (dom.length){
                dom.find('input').prop('checked', chk);
                dom.find('.M-commonSLCSubCount').hide();
            }else {
                dom = $(elm).parent();
            }
            this.updateSectionCheck(dom.parent().parent());
        },
        updateZoneCheck: function(body){
            var input = body.find('input');
            var check = input.filter(':checked').length;
            body.prev().children('input').prop('checked', (input.length > 0 && check == input.length));
            this.updateSectionCheck(body.parent().parent());
        },
        // 创建项目
        buildItem: function(id, con, data){
            var head = con, body = null
                ,tmp = data[this.$key];
            if (tmp && tmp.length){
                head = $('<div class="M-commonSLCItemHead" />').appendTo(con);
                body = $('<ul class="M-commonSLCSub" />').appendTo(con);
                $('<span class="M-commonSLCSubCount" />').appendTo(con);
                con.addClass('hasSub');
            }

            $('<input id="'+id+'" type="checkbox" data-type="item"/>').val(data[this.$vKey] === 0 && '0' || data[this.$vKey] || '').appendTo(head);
            $('<label for="'+id+'"/>').attr('title', data[this.$nKey]).text(data[this.$nKey]).appendTo(head);

            if (body){
                for (var i=0; i<tmp.length; i++){
                    var item = $('<li/>').appendTo(body);
                    this.buildSubItem(id + '_' + i, item,tmp[i]);
                }
            }
            tmp = null;
        },
        eventHoverItem: function(evt, elm){
            var dom = $(elm);
            if (evt.type == 'mouseenter'){
                dom = dom.children('.M-commonSLCItemHead');
                if (dom.length){
                    dom.parent().addClass('act');
                    dom.next().css('left', dom.innerWidth()-1);
                }
            }else {
                dom.removeClass('act');
            }
        },
        eventToggleItem: function(evt, elm){
            var dom = $(elm);
            if (dom.parent().hasClass('M-commonSLCItemHead')){
                var chk = dom.prop('checked');
                dom = dom.parent().next();
                dom.find('input').prop('checked', chk);
                dom.next().hide();
            }
            this.updateZoneCheck(dom.parent().parent());
        },
        // 创建子项目
        buildSubItem: function(id, con, data){
            $('<input id="'+id+'" type="checkbox" data-type="sub"/>').val(data[this.$vKey] === 0 && '0' || data[this.$vKey] || '').appendTo(con);
            $('<label for="'+id+'"/>').attr('title', data[this.$nKey]).text(data[this.$nKey]).appendTo(con);
        },
        eventToggleSub: function(evt, elm){
            var ul = $(elm).parent().parent();
            var total = ul.children().length;
            var check = ul.find('input:checked').length;
            if (check > 0 && check != total){
                ul.next().css('display', 'block').text(check + '/' + total);
            }else {
                ul.next().hide();
            }
            ul.prev().children('input').prop('checked', check > 0);

            this.updateZoneCheck(ul.parent().parent());
        },

        /**
         * 设置选中的项目
         * @param {Array} sels 选中的项目ID值
         * @return {None} 无返回
         */
        setData: function(sels){
            this.reset();
            if (!sels || !sels.length){
                return;
            }
            this.$selected = sels;

            var i,map = {};
            for (i=sels.length-1; i>=0; i--){
                map[sels[i]] = 1;
            }

            var dom, body = this.doms.body;
            var doms = body.find('input[value!=""]');
            for (i=doms.length-1; i>=0; i--){
                dom = doms.eq(i);
                if (map[dom.val()]){
                    dom.prop('checked', true);
                }
            }

            // 更新项目状态
            var total, check, input;
            doms = body.find('.M-commonSLCSub');
            for (i=0; i<doms.length; i++){
                dom = doms.eq(i);
                input = dom.prev().children('input');
                total = dom.find('input');
                if (input.prop('checked')){
                    total.prop('checked', true);
                }else {
                    check = total.filter(':checked');
                    if (input.prop('checked')){
                        if (check.length === 0){
                            total.prop('checked', true);
                        }
                    }else {
                        if (check.length > 0){
                            input.prop('checked', true);
                        }
                    }
                    if (check.length > 0 && check.length < total.length){
                        dom.next().css('display', 'block').text(check.length + '/' + total.length);
                    }
                }
            }

            // 更新栏目状态
            doms = body.find('.M-commonSLCZoneBody');
            for (i=0; i<doms.length; i++){
                dom = doms.eq(i);
                input = dom.prev().children('input');
                total = dom.find('input');
                if (input.prop('checked')){
                    total.prop('checked', true);
                    dom.find('.M-commonSLCSubCount').hide();
                }else {
                    check = total.filter(':checked');
                    if (total.length > 0 && check.length == total.length){
                        input.prop('checked', true);
                    }
                }
            }

            // 更新分区状态
            doms = body.children();
            for (i=0; i<doms.length; i++){
                dom = doms.eq(i);
                input = this.doms.head.find('input:eq('+i+')');
                total = dom.find('.M-commonSLCZoneHead > input');
                if (input.prop('checked')){
                    total.prop('checked', true);
                    dom.find('.M-commonSLCSubCount').hide();
                }else {
                    check = total.filter(':checked');
                    if (total.length > 0 && check.length == total.length){
                        input.prop('checked', true);
                    }
                }
            }
        },
        /**
         * 清空所有选择
         * @return {None} 无返回
         */
        reset: function(){
            var doms = this.doms;
            doms.head.find('input').prop('checked', false);
            doms.body.find('input').prop('checked', false);
            doms.body.find('.M-commonSLCSubCount').hide();
            this.$selected = null;
        },
        /**
         * 获取选中的区域数据
         * @return {Array} 返回选中的区域ID数组
         */
        getData: function(){
            var merge = !this.config.getSubs;
            var ret = [];
            // 获取项目数据
            var dom, input, total, check, i, body = this.doms.body;
            var doms = body.find('.M-commonSLCItem');
            for (i=0; i<doms.length; i++){
                dom = doms.eq(i);
                input = dom.children('input');
                if (input.length){
                    if (input.prop('checked') && input.val() !== ''){
                        ret.push(input.val());
                    }
                }else {
                    total = dom.find('.M-commonSLCSub input');
                    check = total.filter(':checked');
                    input = dom.find('.M-commonSLCItemHead > input');
                    if (total.length > 0 && check.length == total.length && input.val() !== ''){
                        ret.push(input.val());
                        if (merge){ check = false; }
                    }
                    if (check){
                        for (var j=0; j<check.length; j++){
                            input = check.eq(j);
                            if (input.val() !== ''){
                                ret.push(input.val());
                            }
                        }
                    }
                }
            }
            // 获取分区数据
            doms = body.find('.M-commonSLCZoneHead > input[value!=""]');
            for (i=0; i<doms.length; i++){
                input = doms.eq(i);
                if (input.prop('checked')){
                    ret.push(input.val());
                }
            }

            this.$selected = ret;
            return ret;
        }
    });
    exports.subLevelCheckbox = SubLevelCheckbox;
    /**
     * 标尺控件
     */
    var Ruler = app.extend(view.container,{
        init:function(config,parent){
            config = $.extend({
                'width':'100%',
                'target':parent,
                'class':'M-commonRuler',
                'bottom':0,
                'left':0,
                'space':1
            },config)
            Ruler.master(this, null, config);
            Ruler.master(this, 'init', [config, parent]);
            this.build();
        }
        ,build:function(){
            var c = this.config;
            this.el.css({
                'width':c.width,
                'bottom':c.bottom,
                'left':c.left
            }).html(_getRuleStr({
                'suffix':'0',
                'space':this.config.space
            }));

        }
        ,setup:function(config){
            this.config = $.extend(true,this.config,config);
            this.build();
        }
    })
    //标尺生成主函数
    function _getRuleStr (config) {
        config = $.extend({
            'deep':1,//递归层级,为0则停止递归
            'count':10,//标尺刻度分段
            'prefix':'',//标尺刻度前缀
            'suffix':'',//刻度后缀
            'noDegree':false,//刻度显示控制
            'isEnd':true,//标尺末端控制，为true则为其添加0跟最终刻度
            'space':1,//刻度显示间距
            'curStyle':0//刻度数值样式大小控制,根据数值选择不同样式方案
        },config)
        if(!config.deep){
            return '';
        }
        var d = config.deep,count = config.count,prefix = config.prefix,t,
            suffix = config.suffix,end;
        d--;
        var width = 100/count,arr = [],str = '',w = width+'%',space = config .space,
            c = {
                'deep':d,
                'count':count,
                'prefix':prefix,
                'suffix':suffix,
                'isEnd':false,
                'curStyle':config.curStyle+1
            };
        var sizeList = [
            {
                linesize:9,countsize:13
            },
            {
                linesize:5,countsize:8
            }
        ],size = sizeList[config.curStyle];
        for(var i = 0;i<count;i++){
            end = '';
            if(i !== 0){
                t = config.noDegree?null:prefix+i+suffix;
                if(i%space !== 0){
                    t = null
                }
            }
            else if(i===0){
                t = config.isEnd?0:null;
            }
            if(i===count-1&&config.isEnd){
                end = _buildCur(prefix+(i+1)+suffix,null,null,true);
            }
            str = '<span class="ruler" style="width:'+w+';">'+_buildCur(t,size.linesize,size.countsize)+_getRuleStr(c)+end+'</span>';
            arr.push(str);
        }
        return arr.join('');
    }
    /**
     * 刻度生成函数
     * @param  {string} t         刻度数值
     * @param  {number} linesize  [刻度线条高度]
     * @param  {number} countsize [数值高度]
     * @param  {boolean} offRight  [是否生成末端刻度]
     * @return {string}           [返回的html字段]
     */
    function _buildCur(t,linesize,countsize,offRight){
        linesize = linesize||9;
        countsize = countsize||13;
        var off,str;
        if(offRight){
            off = 'right: '+(-countsize)+'px;'
        }
        else{
            off = 'left:'+(-(Math.max(linesize,countsize)/4+2))+'px;'
        }
        if(t === null){
            str = '';
        }
        else{
            str = '<div class="curCon" style="'+off+'"><p><span class="line" style="height:'+linesize+'px;"></span></p><p style="font-size:'+countsize+'px;">'+t+'</p></div>';
        }
        return str;
    }
    exports.ruler = Ruler;


    //表格字段编辑保持控件
    var ValueEditor = app.extend(view.container,{
        init:function(config){
            config = $.extend(true,{
                "class": 'M-formValueEditor',
                width: 120,
                height: 30,
                size: 2,
                prefix: '',//字段前缀
                suffix: '',//字段后缀
                param: null,
                data: 0,//初始值
                labelCls: 'label'
            },config);
            this.$ready = false;
            this.$editMode = false;
            this.$data = config.data;
            this.$messageTid = 0;
            ValueEditor.master(this,null,config);
            ValueEditor.master(this,'init',[config]);
            this.build();
        }
        ,build:function(){
            var el = this.el,c = this.config;
            el.width(c.width).height(c.height);
            var con = $('<div/>').appendTo(el);
            var doms = this.doms = {
                label: $('<div/>').addClass(c.labelCls).appendTo(con),
                inputCon: $('<div class="inputCon"/>').appendTo(con),
                ctr: $('<a href="javascript:void(0)" class="G-icon inputLock"/>').appendTo(el),
                "msgCon":$('<div class="msgCon"><span class="msg"/><b class="arrow"></b></div>').appendTo(el),
                "msg":null
            };
            this.doms.msg = this.doms.msgCon.find('.msg');
            this.create('input', CountSelector, {
                target: doms.inputCon,
                prefix: c.prefix,
                suffix: c.suffix
            });
            this.bindEvent();
            this.$ready = true;

            this.toggleView(false);
            this.setData(this.$data);
        }
        ,bindEvent:function(){
            this.jq(this.doms.ctr,'click','eventCtrClick');
            this.jq(this.doms.inputCon, 'keydown', function(ev){
                if (ev.keyCode == 13) {
                    this.eventCtrClick();
                    return false;
                }
            });
            this.jq(this.el, 'click', util.stopEvent);

        }
        ,eventCtrClick:function(ev,elm){
            if (this.$ready && this.$editMode){
                var c = this.config;
                var data = this.$.input.getData();
                if (isNaN(data)){
                    // 还原数值
                    this.$.input.setData(this.$data);
                    // 提示错误
                    this.showMessage(LANG('价格信息错误'), 'error');
                }else if (data != this.$data){
                    this.doms.label.text(c.prefix + util.round0(data, c.size) + c.suffix);
                    this.fire('valueChange', {value: data, param: c.param, last: this.$data});
                    this.$data = data;
                }
            }
            this.toggleView();
        }
        //编辑状态切换
        ,toggleView:function(flag){
            var mode = this.$editMode;
            if(typeof flag === 'undefined'){
                mode = !mode;
            }else{
                mode = flag;
            }
            var doms = this.doms;

            doms.label.toggle(!mode);
            doms.ctr.toggleClass('edit',mode);
            doms.inputCon.toggle(mode);
            if (mode){
                this.$.input.focus();
            }

            this.$editMode = mode;
            return this;
        }
        ,isEditing: function(){
            return this.$editMode;
        }
        ,getParam: function(){
            return this.config.param;
        }
        ,setParam: function(param){
            this.config.param = param;
            return this;
        }
        ,setData:function(value){
            this.$data = Math.round(value*1000)/1000; // 修正PHP的浮点数精度问题
            if (!this.$ready){ return this; }

            var c = this.config;
            this.doms.label.text(c.prefix + util.round0(value, c.size) + c.suffix);
            if(this.$.input){
                this.$.input.setData(value);
            }
            return this;
        }
        ,getData:function(){
            return this.$data;
        }
        // 显示提示信息
        ,showMessage: function(text, type){
            var el = this.doms.msg;
            el.toggleClass('error', (type == 'error')).text(text);
            if (this.$messageTid){
                clearTimeout(this.$messageTid);
            }
            el = el.parent().show();
            // 消息外部主体容器
            el = this.doms.msgCon;
            this.$messageTid = setTimeout(function(){
                el.hide();
                el = null;
            },2000);
        }
        /**
         * 隐藏提示信息
         * @return {Undefined} 无返回值
         */
        ,hideMessage:function(){
            if(this.$messageTid){
                clearTimeout(this.$messageTid);
            }
            this.doms.msgCon.hide();
        }
    });
    exports.valueEditor = ValueEditor;
    //数字选择控件
    var CountSelector = app.extend(view.container,{
        init:function(config){
            config = $.extend({
                'class':'M-formCountSelector',
                prefix:'',
                suffix:'',
                value:0,
                size:2,
                addCount:0.01
            },config);
            CountSelector.master(this,null,config);
            CountSelector.master(this,'init',[config]);
            this.$orivalue = config.value;
            this.build();
        }
        ,build:function(){
            var doms = this.doms = {},el = this.el,c = this.config;
            this.input = doms.input = $('<span class="countInputCon"><b class="prefix"/><input type="text" class="countInput"/><b class="suffix"/></span>').appendTo(el).find('input');
            this.input.siblings('.prefix').text(c.prefix);
            this.input.siblings('.suffix').text(c.suffix);
            var btnCon = doms.btnCon = $('<div class="btnCon"/>').appendTo(el);
            doms.add = $('<i class="addIcon countSelectorCtr" data-action="add"></i>').appendTo(btnCon);
            doms.sub = $('<i class="subIcon countSelectorCtr" data-action="sub"></i>').appendTo(btnCon);
            this.setData(c.value);
            this.bindEvent();
        }
        ,bindEvent:function(){
            this.dg(this.el,'.countSelectorCtr','click','eventClickCtr');
            this.jq(this.input,'mousedown', this.focus);
        }
        ,eventClickCtr:function(evt,elm){
            var action = $(elm).attr("data-action");
            switch(action) {
                case "sub":
                    this.doSub();
                    break;
                case "add":
                    this.doAdd();
                    break;
            }
            evt.preventDefault();
            return false;
        }
        ,focus: function(){
            this.input[0].focus();
        }
        ,setData:function(data){
            var value = +data;
            if(!isNaN(value)&&value>=0){
                value = util.round0(value,this.config.size);
                this.input.val(value);
            }

            return this;
        }
        ,getData:function(){
            return +this.input.val();
        }
        ,doAdd:function(){
            var value = this.getData();
            this.setData(value+this.config.addCount);
        }
        ,doSub:function(){
            var value = this.getData();
            this.setData(value-this.config.addCount);
        }
    })
    exports.countSelector = CountSelector;

    // 加载蒙板层
    var LoadingMask = app.extend(view.container, {
        init: function(config, parent){
            config = $.extend({
                'class': 'M-commonLoading',
                'target': parent,
                'auto_show': true,
                'margin': 0,
                'offset_y': 0,
                'opacity': null
            }, config);

            LoadingMask.master(this, null, config);
            LoadingMask.master(this, 'init', arguments);

            $('<div class="M-commonLoadingIcon"/>').appendTo(this.el);
            this.el.css('z-index', 9999);

            var margin = config.margin;
            if (margin){
                if (util.isArray(margin)){
                    switch(margin.length){
                        case 0:
                            margin = 0;
                            break;
                        case 1:
                            margin[1] = margin[0];
                        /* falls through */
                        case 2:
                            margin[2] = margin[0];
                        /* falls through */
                        case 3:
                            margin[3] = margin[1];
                            break;
                    }
                }else {
                    margin = [margin,margin,margin,margin];
                }
                this.config.margin = margin;
            }
            if (config.auto_show){
                this.show();
            }
        },
        calculate: function(){
            var d = document;
            var c = this.config;
            var el = this.el.show();
            var con = el.parent().get(0);
            // 计算容器大小
            var w = con.clientWidth, h = con.clientHeight;
            var x=0, y=0;

            if (con === d.body){
                var b = (d.compatMode === "CSS1Compat"?d.documentElement:d.body);
                h = Math.max(b.clientHeight, b.scrollHeight);
                w = Math.max(b.clientWidth, b.scrollWidth);
            }else {
                el.find('div:first').css('position', 'absolute');
                var pcon = con;
                while (h <= 0){
                    pcon = pcon.parentElement;
                    if (pcon === d.body){ break; }

                    h = pcon.clientHeight;
                    if (h){
                        w = pcon.clientWidth;
                        var con_offset = $(con).offset();
                        var base_offset = $(pcon).offset();
                        x = base_offset.left - con_offset.left;
                        y = base_offset.top - con_offset.top;
                    }
                }
            }
            // 计算定位位置
            if (el[0].offsetParent !== con){
                x += con.offsetLeft;
                y += con.offsetTop;
            }

            // 计算定位修正
            var m = c.margin;
            if (m){
                y += m[0];
                x += m[3];
                w -= (m[1] - m[3]);
                h -= (m[0] - m[2]);
            }
            el.css({
                left: x,
                top: y-c.offset_y,
                width: w,
                height: h
            });

            this.$con = con;
            this.$conWidth = w;
            this.$conHeight = h;

            if (c.opacity !== null){
                el.css('opacity', c.opacity);
                el.css('filter', 'alpha(opacity='+Math.round(c.opacity*100)+')');
            }
        },
        show: function(){
            var self = this;
            self.calculate();
            if(self.el.parent().get(0) === document.body){
                self.$checkId = setInterval(function(){
                    self.syncSize();
                }, 500);
            }
            return self;
        },
        hide: function(){
            this.el.hide();
            clearInterval(this.$checkId);
            return this;
        },
        zIndex: function(index){
            this.el.css('zIndex', index);
            return this;
        },
        syncSize: function(){
            var self = this;
            var con = self.$con;
            if (con){
                var i = Math.max(con.clientWidth, con.scrollWidth);
                if (i > self.$conWidth){
                    self.$conWidth = i;
                    self.el.width(i);
                }
                i = Math.max(con.clientHeight, con.scrollHeight);
                if (i > self.$conHeight){
                    self.$conHeight = i;
                    self.el.height(i);
                }
            }
            return self;
        }
    });
    exports.loadingMask = LoadingMask;

    /**
     * 提示框
     * @样式 问号图标 + 弹出层
     */
    var Tips = app.extend(view.container, {
        init: function(config, parent){
            config = $.extend({
                'class': 'M-commonTips',
                'target': parent,
                'tag':'span',
                'tips': ''
            }, config);

            this.$tips = config.tips;

            Tips.master(this, null, config);
            Tips.master(this, 'init', arguments);
            this.build();
        },
        build: function(){
            var tips = $('<span class="M-commonTipsIcon"/>').appendTo(this.el);
            this.jq(tips, 'mouseenter mouseleave', this.config.tips, 'eventTips');
        },
        eventTips: function(ev, elm){
            var tag = $(elm);
            var desc = this.$tips;
            var me = this;
            if(!me.tip){
                me.createAsync('tip', 'popwin.tip',{
                    "anchor":tag,
                    "data":desc
                },function(dom){
                    me.tip = dom;
                    dom.show();
                });
            }else{
                me.tip.reload({"anchor":tag,"data":desc});
                if (ev.type === 'mouseenter'){
                    me.tip.show();
                }else {
                    me.tip.hide();
                }
            }
        },
        setData: function(data){
            if(data){
                this.$tips = data;
            }
            return this;
        }
    });
    exports.tips = Tips;
});