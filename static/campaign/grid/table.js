define(function(require, exports){
    var $ = require('jquery');
    var app = require('app');
    var view = require('view');
    var dialog = require('dialog');
    var common = require('common');
    var util = require("util");
    var popwin = require("popwin");
    var labels = require('grid/labels');
    var format = labels.format;
    labels = labels.labels;

    /**
     * 自定义栏目设置窗口
     * @param {Object} config 模块实例配置对象
     * @todo 记录暂时使用localStorage，要兼容ie6的话将使用userData。
     *       模块已写完，位于devcode。未测试，需要使用时再做。
     */
    function CustomColumn(config,parent){
        this.config = $.extend(true, {
            'class': 'M-tableCustomColumn',
            'list':{},
            'buttons':['all','invert','empty','default','ok','cancel'],
            // 'gridType':null,
            'selected':[]
        }, config || {});
        CustomColumn.master(this, null, this.config);
        this.ready = 0;
    }
    extend(CustomColumn, dialog.option, {
        init: function(){
            // this.initConfig();
            var self = this;
            var c = self.config;
            var doms = self.doms;

            // 构建结构
            // var skips = {'default': 1, 'custom': 1};
            var table = $('<table/>').appendTo(self.body);
            var list = doms.list = $('<tr/>').appendTo(table);
            util.each(c.list, function(item){
                if (item.name == 'default'){
                    return;
                }
                // 分组容器
                var td = $('<td/>').appendTo(list);
                // 分组标题
                var lb = labels.get(item.text);
                $('<strong />').text(lb.text).appendTo(td);

                // 分组项目
                var name, i;
                for (i=0; i<item.cols.length; i++){
                    name = item.cols[i];
                    lb = labels.get(name);
                    lb = $('<label />').text(lb.text).appendTo(td);
                    $('<input type="checkbox" />').val(name)
                        .prop('checked', (c.selected.indexOf(name) != -1))
                        .prependTo(lb);
                }
            });
            this.dg(list, 'input', 'change', 'eventOptionChange');
            CustomColumn.master(self, 'init', arguments);
            self.ready = 1;
        },
        /**
         * 确定事件的响应函数
         * @param  {Obeject}   evt 消息对象
         * @return {Undefined}     无返回值
         */
        onOk: function(evt){
            // 获取选中的栏目
            var sels = [];

            this.body.find(':checked').each(function(i, v){
                sels.push(v.value);
            })

            if (sels.length){
                this.config.selected = sels;

                this.fire(
                    "columnChange"
                    ,{"name":this.config.name,"selected":sels}
                );
            }
            this.hide();
            return false;
        },
        eventOptionChange: function(evt, elm){
            this.doms.list.find('input[value="'+elm.value+'"]').prop('checked', elm.checked);
        }
    });

    /**
     * 栏目分类切换
     */
    function Tab(config, parent){
        config = $.extend({
            'class':'M-tableTab',
            'target':parent,
            'tag':'ul',
            'cols':null, // 列修改或过滤, null-排除, [...]-合并, [true,...]-忽略默认, [false,...]-合并到末尾
            'list':[],
            'active': false,
            'activeClass': 'M-tableTabActive',
            'itemClass': 'M-tableTabItem',
            'table': null,
            'gridType': null,
            'gridCols': null,
            // 是否自动补齐分类
            "autoComplete": 'default_tab_cols'
        }, config || {});

        var list = config.list;
        var cols;
        if(config.autoComplete){
            var LIST = app.config(config.autoComplete);

            // 根据账号过滤指标组或指标；
            var filter_tab_cols = app.config('filter_tab_cols');
            var user = app.getUser();
            if(user && user.campany && user.campany.UserId){
                util.each(filter_tab_cols, function(item){
                    // 判断账号
                    if(item && item.userId && item.userId.length>0){
                        util.each(item.userId, function(id){
                            if(id == user.campany.UserId){
                                // 过滤指标组
                                util.each(item.exclude_cols, function(exCol){
                                    delete LIST[exCol];
                                });

                                // 过滤指标
                                util.each(item.exclude_cols_item, function(exColItem, exIdx){
                                    util.each(LIST, function(l1, i1){
                                        LIST[i1]['cols'] = $.grep(LIST[i1]['cols'], function(n, i){
                                            return n != exColItem;
                                        });
                                    });
                                });
                            }
                        });
                    }
                });
            }

            var n, m, item;
            if (list.length === 0){
                // 啥都没设定话
                cols = config.cols;
                for (n in LIST){
                    m = cols ? cols[n] : 0;
                    if (m === null){ continue; }
                    item = $.extend(true,{name:n}, LIST[n]);
                    if (m){
                        item.cols = _mergeCols(m, LIST[n].cols);
                    }
                    list.push(item);
                }
            }else {
                // 只设了一部分
                for (n=0; n<list.length; n++){
                    item = list[n];
                    if (util.isString(item)){
                        // 字符串, 查找默认的列配置属性
                        if (LIST[item]){
                            list[n] = $.extend(true, {name: item}, LIST[item]);
                        }
                    }else if (item && LIST[item.name]){
                        // 合并对应项目的cols和对应默认配置
                        cols = _mergeCols(item.cols, LIST[item.name].cols);
                        delete item.cols;
                        $.extend(true, item, LIST[item.name]);
                        item.cols = cols;
                    }else {
                        // 删掉默认配置不存在的项目?
                        list.splice(n--, 1);
                    }
                }
            }
        }

        // 自动合并Grid字段到默认分组 (有修改)
        cols = (list[0] && list[0].cols);
        if (config.gridCols && cols){
            cols.unshift.apply(cols, config.gridCols);
            util.unique(cols, false, true);
        }

        if (config.active){
            for (var i=0; i<list.length; i++){
                if (list[i].name == config.active){
                    break;
                }
            }
            if (i === list.length){
                config.active = false;
            }
        }
        if (!config.active){
            config.active = (list[0] && list[0].name) || false;
        }

        Tab.master(this, null, config);
        this.storage = window.localStorage;
    }
    extend(Tab, view.container, {
        init: function(){
            Tab.master(this, 'init', arguments);
            var cfg = this.config;
            var doms = this.doms = {};
            var hasCustom = false;
            for (var i=0; i< cfg.list.length; i++){
                var item = cfg.list[i];
                var li = $('<li/>').text(LANG(item.text)).appendTo(this.el);
                li.attr('class', cfg.itemClass).attr('data-name', item.name);
                li.toggleClass(cfg.activeClass, item.name == cfg.active);
                if (item.custom){
                    li.addClass('M-tableTabCustom');
                    $('<span class="custom-click-btn"/>').appendTo(li);
                    hasCustom = true;

                    // 如果外部没传入指定值则尝试获取已设定的自定义选项
                    if(!item.sels || !item.sels.length){
                        item.sels = this.getCustom(item);
                    }
                }
                doms[item.name] = li;
            }
            this.dg(this.el, 'li[data-name]', 'click', 'clickTab');
            if (hasCustom){
                this.dg(this.el, 'span.custom-click-btn', 'click', 'clickCustom');
            }
        },
        clickTab: function(evt, elm){
            var cfg = this.config;
            var li = $(elm);
            var name = li.attr('data-name');
            if (name == cfg.active) {return false;}

            if (this.currentWin){
                this.currentWin.hide();
            }

            // 查找配置
            var item = util.find(cfg.list, name, 'name');
            if (item){
                if (item.custom && !item.sels.length){
                    this.getCustomWin(item).show();
                }else {
                    this.fire('changeTab', item);
                    if (cfg.table){
                        cfg.table.showColumn(item.sels || item.cols);
                    }
                }
            }

            // 移除原来选中的标签的激活状态
            if (this.doms[cfg.active]) {
                this.doms[cfg.active].removeClass(cfg.activeClass);
            }
            li.addClass(cfg.activeClass);
            cfg.active = name;
            return false;
        },
        clickCustom: function(evt, elm){
            var c = this.config;
            var li = $(elm).parent();
            var name = li.attr('data-name');
            var item = util.find(c.list, name, 'name');
            if (item){
                this.getCustomWin(item).toggle();
            }
            return false;
        },
        getCustomWin: function(item){
            var win = item.customWin;
            if (!win){
                var c = this.config;
                var li = this.doms[item.name];
                win = item.customWin = this.create(CustomColumn, {
                    'name': item.name,
                    'selected': item.sels,
                    'defSelected': (item.name == 'default' ? item.cols : []),
                    'target': li,
                    'list':c.list,
                    // 'gridType':c.gridType,
                    'position': {
                        // 贴左边对齐
                        'left': -1,
                        // 下沉1像素以配合UI
                        'top': li.height()+1
                    }
                });
            }else {
                win.setData(item.sels);
            }
            var cur = this.currentWin;
            if (cur && cur !== win){
                cur.hide();
                this.currentWin = win;
            }
            return win;
        },
        /**
         * 自定义设置改变时的响应函数
         * @param  {Object}  ev 消息对象
         * @return {Boolean}    阻止事件冒泡
         */
        onColumnChange: function(ev){
            var cfg = this.config;
            var name = ev.param.name;
            var sels = ev.param.selected;

            var item = util.find(cfg.list, name, 'name');
            if (item){
                if (item.cols && item.cols.length){
                    // 排序
                    var head = [];
                    util.each(item.cols, function(col){
                        if (util.index(sels, col) !== null){
                            head.push(col);
                        }
                    });
                    while (head.length){
                        sels.unshift(head.pop());
                    }
                    util.unique(sels);
                }
                // 保存当前选中
                item.sels = sels;
                this.setCustom(item, sels);

                if (sels.length <= 0){ return false; }
                if (cfg.active === name) {cfg.active = null;}
                this.doms[name].click();
            }
            return false;
        },
        getColumns: function(ev){
            var c = this.config;
            var list = c.list;
            var item = util.find(list, c.active, 'name') || list[0];

            if (item){
                c.active = item.name;
                return (item.sels || item.cols);
            }else {
                return [];
            }
        },
        /**
         * 获取已设定的自定义选项
         * @return {String} 存储的值
         */
        getCustom:function(item){
            var id = this.config.gridType + '/' + item.name;

            // 从user中得到信息
            var userData = app.getUser(),
                list = userData.custom_info && userData.custom_info[id];

            if(list){
                return list.split(',');
            }else {
                return (item.name == 'default' ? item.cols : []);
            }
        },
        /**
         * 存储自定义选项
         * @param {Array}      data 选项数组
         * @return {Undefined}      无返回值
         */
        setCustom:function(item, data){
            var id = this.config.gridType + '/' + item.name;

            // 使用后端接口保存设置
            app.data.put('/user/setcustom', {
                'Name': id,
                'Value': data.join(',')
            }, this, 'afterSetCustom');
        },
        afterSetCustom: function(err, data) {
            if (err) {
                app.alert(LANG('自定义指标保存失败：') + err.message);
            }
        },
        // 获取字段列表配置
        getList: function(){
            return this.config.list;
        },
        // 触发指定的栏目-隐藏或显示
        toggleTabColumn: function(name,show){
            if(!show){
                this.doms[name].addClass('M-tableTabHide');
            }else{
                this.doms[name].removeClass('M-tableTabHide');
            }
        },
        // 激活指定的栏目
        activateTabColumn: function(name){
            var c = this.config;
            this.doms[c.active].removeClass(c.activeClass);
            c.active = null;
            $('li[data-name='+name+']').click();
        }
    });
    /**
     * 检测列配置
     * @param  {Array} re  自定义列
     * @param  {Array} def 默认列定义
     * @return {Array}     合并完的列
     * @private
     */
    function _mergeCols(re,def){
        var first = re.shift();
        switch (first){
            case null: // 排除
                var ret = [];
                util.each(def, function(col){
                    if (util.index(re, col) === null){
                        ret.push(col);
                    }
                });
                return ret;
            case true: // 替换
                return re;
            case false: // 末尾合并
                re.unshift.apply(re, def);
                return util.unique(re,false,true);
            default: // 默认前端合并
                if (first){
                    re.unshift(first);
                }
                re = re.concat(def);
                return util.unique(re);
        }
    }
    exports.tab = Tab;

    /**
     * 格式化列回调函数值(把字符串转换为对应的回调函数变量)
     * @param  {Module} ctx  回调对象实例
     * @param  {Object} col  列配置对象
     * @param  {String} name 回调参数属性名称
     * @return {Boolean}     返回处理状态
     */
    function _prepare_col_callback(ctx, col, name){
        var cb = col[name];
        var scope = col.context;
        if (cb && util.isString(cb)){
            while (1){
                // 指定作用域查找
                if (scope && scope[cb]){ break; }
                // 查找父层
                scope = ctx;
                while (scope !== app.core){
                    scope = scope.parent();
                    if (scope[cb]){ break; }
                }
                if (scope !== app.core){ break; }
                // 寻找自己本身
                scope = ctx;
                if (scope[cb]){ break; }
                // 寻找labels
                scope = format;
                if (scope[cb]){ break; }
                scope = labels;
                if (scope[cb]){ break; }
                // 没有找到
                col[name] = null;
                return false;
            }
            // 保存作用域和结果
            col[name] = scope[cb];
        }else if (!util.isFunc(cb)){
            return false;
        }
        col[name+'_ctx'] = scope;
        return true;
    }

    /**
     * 计算需要交换顺序的列操作顺序
     * @param  {Array} cols    列配置列表
     * @param  {Array} columns 显示顺序配置列表
     * @return {Array}         返回交换操作列表
     */
    function _gen_sort(cols, columns){
        var order = [], ops = [];
        var i,s,e,m;
        for (i=0; i<columns.length; i++){
            order.push(util.index(cols, columns[i], 'name'));
        }
        for (s=0; s<i; s++){
            if (order[s] === null){ continue; }
            m = s;
            for (e=s+1; e<i; e++){
                if (order[e] === null){ continue; }
                if (order[e] < order[m]){ m = e; }
            }
            if (m !== s){
                // 交互位置
                ops.push([order[m], order[s]]);
                e = order[s];
                order[s] = order[m];
                order[m] = e;
            }
        }

        for (i=0; i<ops.length; i++){
            s = ops[i];
            m = cols.splice(s[1], 1);
            e = cols.splice(s[0], 1, m[0]);
            cols.splice(s[1], 0, e[0]);
        }
        return ops;
    }
    /**
     * 修改元素的顺序
     * @param  {Array}  ops   排序操作记录列表
     * @param  {Array}  elems 待排序元素列表
     * @param  {String} attrs 需同步元素属性(用逗号分隔多个属性)
     * @return {None}
     */
    function _do_sort_element(ops, elems, attrs){
        var i, s, e1, e2, pe, ns, av;
        if (attrs){ attrs = attrs.split(','); }
        for (i=0; i<ops.length; i++){
            s = ops[i];
            e1 = elems[s[0]];
            e2 = elems[s[1]];
            if (!e1 || !e2){ continue; }
            elems[s[0]] = e2;
            elems[s[1]] = e1;

            // 交换位置
            pe = e2.parentNode;
            ns = (pe.lastChild === e2) ? null : e2.nextSibling;
            e1.parentNode.insertBefore(e2, e1);
            if (ns){
                pe.insertBefore(e1, ns);
            }else {
                pe.appendChild(e1);
            }

            // 交换属性
            if (attrs){
                for (s=attrs.length; s>0;){
                    ns = attrs[--s];
                    pe = e1.getAttribute(ns);
                    av = e2.getAttribute(ns);
                    if (pe === null){
                        e2.removeAttribute(ns);
                    }else {
                        e2.setAttribute(ns, pe);
                    }
                    if (av === null){
                        e1.removeAttribute(ns);
                    }else {
                        e1.setAttribute(ns, av);
                    }
                }
            }
        }
    }

    /**
     * 总计模块
     * @param {Object} config 模块配置
     */
    function Amount(config, parent){
        config = $.extend({
            'class': 'M-tableAmount',
            'target': parent,
            'hasItemClick': false,
            'cols': [], // 字段设置
            'data': null,
            "showAct":false,
            "actCls":"itemAct"
        }, config);

        this.$cols = [];
        Amount.master(this, null, config);
    }
    extend(Amount, view.container,{
        init: function(){
            this.delayResize = this.delayResize.bind(this);
            Amount.master(this, 'init');
            this.list = $('<ul/>').appendTo(this.el);
            if(this.config.hasItemClick){
                this.list.addClass("allowClick");
            }
            var cols = this.$cols;
            // 处理列配置
            util.each(this.config.cols, function(col){
                if (util.isString(col)){
                    col = {'name':col};
                }else if (!col.name){
                    return;
                }
                col = $.extend(true,
                    {
                        'name': null,
                        'desc': null,
                        'field': null,
                        'format': null,
                        'render': null,
                        'context': null
                    },
                    labels.get(col.name),
                    col
                );
                switch (col.type){
                    case 'id':
                    case 'index':
                    case 'dim':
                    case 'fixed':
                    case 'control':
                    case 'select':
                    case 'op': return;
                }

                // 处理回调函数
                _prepare_col_callback(this, col, 'format');
                _prepare_col_callback(this, col, 'render');

                cols.push(col);
            }, this);

            var doms = this.doms = {};
            for (var i=0; i<cols.length; i++){
                doms[i] = this.buildBox(i, cols[i]);
            }
            this.setData();
            this.resize();
            this.scroll = this.create('scroll', common.scroller, {wheel: 'shift'});
            this.doms.lists = this.list.find("li");
            // 绑定事件
            this.dg(this.list, 'em[data-desc]', 'mouseenter mouseleave', 'eventTips');
            if (this.config.hasItemClick){
                this.dg(this.list, 'li[data-index]', 'click', 'eventItemClick');
            }
        },
        buildBox: function(index, col){
            var box = $('<li/>').attr('data-index', index);
            $('<span/>').text(col.text).appendTo(box);
            $('<b/>').appendTo(box);
            if (col.desc) {
                $('<em/>').attr('data-desc', col.desc).appendTo(box);
            }
            if(this.config.hasItemClick){
                box.append('<p/>');
            }
            return box.appendTo(this.list);
        },
        /**
         * 设定当前激活的项目
         * @param  {Mix}    key     项目索引或指标名
         * @param  {Bool}   silence 是否发送消息
         * @return {Object}         模块实例
         */
        setAct:function(key,silence){
            if(!isNaN(+key)){
                key = +key;
            }
            var tag,col,val;
            if(util.isString(key)){
                for(var i = 0,len = this.config.cols.length;i<len;i++){
                    if(this.config.cols[i].name === key){
                        tag = this.doms[i];
                        col = this.config.cols[i];
                        break;
                    }
                }
            }else if(util.isNumber(key)){
                tag = this.doms[key];
                col = this.config.cols[key];
            }
            this.doms.lists.removeClass(this.config.actCls);
            tag.addClass(this.config.actCls);

            if(!silence){
                val = this.config.data;
                val = val && val[col.field || col.name] || 0;
                this.fire(
                    "amountItemClick"
                    ,{"name":col.name,"value": val,"label": col}
                );
            }
            return this;
        },
        eventItemClick: function(evt, elm){
            var dat = this.config.data;
            var tar = $(elm);
            var idx = tar.attr('data-index');
            var col = this.$cols[idx];
            var val = dat && dat[col.field || col.name] || 0;
            if(this.config.showAct){
                this.doms.lists.removeClass(this.config.actCls);
                tar.addClass(this.config.actCls);
            }
            this.fire('amountItemClick', {'name': col.name, 'value': val, 'label': col});
        },
        eventTips: function(evt, elm){
            var tag = $(elm);
            var desc = tag.attr('data-desc');
            var me = this;
            if(!me.tip){
                me.tip = me.create("tip", popwin.tip, {
                    "anchor":tag,"data":desc
                });
            }else{
                me.tip.reload({"anchor":tag,"data":desc});
            }
            if (evt.type === 'mouseenter'){
                me.tip.show();
            }else {
                me.tip.hide();
            }
        },
        /**
         * 设置或更新数据
         * @param {Object} data <可选> 新的数据记录对象
         */
        setData: function(data){
            var me = this;
            var cfg = me.config;
            var doms = me.list.children();

            data = cfg.data = (data || {});
            util.each(me.$cols, function(col, index){
                var cell = doms.eq(index).children('b');
                var val = data && data[col.field || col.name] || 0;
                if (col.format){
                    val = col.format.call(col.format_ctx || window, val);
                }
                if (col.render){
                    val = col.render.call(
                        col.render_ctx || window,
                        0, val, data, col, cell, me
                    );
                }
                if (val === null || val === undefined){
                    val = '-';
                }else if (val === ''){
                    val = '&nbsp;';
                }
                cell.empty().append(val);
            });
            me.resize();
        },
        /**
         * 设置要显示那些列
         * @param  {Array} columns 要显示的列名称数组
         * @return {None}         无返回
         */
        showColumn: function(columns){
            if (!columns){
                // 全显示
                this.list.children().css('display', '');
            }else {
                var doms = this.list.children();
                var cols = this.$cols;
                for (var i=0; i<doms.length; i++){
                    doms[i].style.display = (util.index(columns, cols[i].name) === null ? 'none':'');
                }
                _do_sort_element(_gen_sort(cols, columns), doms, 'data-index');
            }
            this.resize();
        },
        /**
         * 计算格子大小
         * @return {None} 无返回
         */
        resize: function(){
            var width = this.el.width();
            if (width <= 0){
                this.delayResize(true);
                return;
            }
            var boxs = this.list.find('li:visible');
            if (boxs.length <= 0){
                app.log('no visible item');
            }
            this.delayResize(false);

            var box = boxs.removeClass('first').css('width', '').eq(0);
            var diff = box.outerWidth() - box.width();
            var i, w, box_ws = [];
            for (i=0; i<boxs.length; i++){
                w = boxs.eq(i).width();
                width -= (w + diff);
                box_ws.push(w);
            }
            box.addClass('first')
            if (width > 0){
                w = Math.floor(width / boxs.length);
                for (i=1; i<boxs.length; i++){
                    boxs.eq(i).width(box_ws[i] + w);
                }
                box.width(box_ws[0] + w + (width % w));
                this.list.css('width', '');
            }else {
                this.list.width(this.el.width() - width);
            }
            if (this.scroll) {this.scroll.measure();}
        },
        delayResize: function(set){
            if (set){
                if (!this.$delay_resize_tid){
                    this.$delay_resize_tid = setInterval(this.delayResize, 500);
                }
            }else if (set === false){
                if (this.$delay_resize_tid){
                    clearInterval(this.$delay_resize_tid);
                    this.$delay_resize_tid = 0;
                }
            }else {
                this.resize();
            }
        }
    });
    exports.amount = Amount;

    /**
     * 二级表格选择控件
     * @param  {[type]} config [description]
     * @return {[type]}        [description]
     */
    var subGridPrefix = 'M-grid-';
    var subGridConClass = 'M-tableListSubCtr';
    var subGridConSelector = '.'+subGridConClass;
    function subGridCtr(config){
        if (!config || !config.subs || config.subs.length === 0){
            return null;
        }
        this.active = null;
        this.target = null;
        this.default_class = null;
        this.showCallback = config.showCallback || null;
        this.divs = [];

        config['class'] = 'M-tableSubGridCtr';
        subGridCtr.master(this);
        this.$hide_tid = 0;
    }
    extend(subGridCtr, view.container, {
        init: function(){
            var cfg = this.config;
            var doms = this.doms = {};
            var sub,lab,btn;
            for (var i=0; i<cfg.subs.length; i++){
                sub = cfg.subs[i];
                if (util.isString(sub)){
                    sub = cfg.subs[i] = {type: sub};
                }
                lab = labels.get('grid_' + sub.type);
                if (!lab){
                    app.error('SubGrid Config Not Found - ' + sub.type);
                    continue;
                }
                btn = doms[sub.type] = sub.iconBtn = $('<a href="#"/>');
                btn.attr({
                    'class': lab['class'] || (subGridPrefix + sub.type),
                    'title': (sub.text || lab.text),
                    'data-mode': lab.mode,
                    'data-index': i
                });
                if (!this.default_class){
                    this.default_class = btn.attr('class');
                }
                btn.appendTo(this.el);
            }

            this.dg(this.el, 'a', 'click', 'clickButton');
            this.jq(this.el, 'mouseleave mouseenter', 'eventHide');

            $([
                '<div class="roundCon">',
                '<div class="roundInside"></div>',
                '</div>'
            ].join('')).appendTo(this.el);
        },
        /**
         * 扩展功能按钮点击响应函数
         * @param  {Object}  evt 鼠标事件
         * @return {Boolean}     阻止冒泡
         */
        clickButton: function(evt, elm){
            var dom = $(elm);
            var id = dom.attr('data-index');
            var cfg = this.config.subs[id];
            if (!cfg){
                return false;
            }

            switch(dom.attr('data-mode')){
                case "sub":
                    if (dom.hasClass('act')){
                        // 取消显示
                        this.hideSubGrid();
                    }else {
                        // 打开或切换显示
                        this.showSubGrid(cfg);
                    }
                    break;

                case "func":
                    /*
                     {
                     action:function(){
                     //code
                     }
                     ,"type":"detail"
                     ,"mode":"func"
                     ,context:this
                     }
                     */
                    if(util.isFunc(cfg.action)){
                        cfg.action.call(
                            cfg.context && cfg.context || this
                            ,this.getRowData()
                        );
                    }
                    break;

                default:
                    // 功能按钮, 调用对应功能
                    this.subFunction(cfg);
            }

            return false;
        },
        eventHide: function(evt){
            if (evt === true){
                this.$hide_tid = 0;
                this.hide();
            }else if (evt.type === 'mouseleave'){
                if (!this.$hide_tid){
                    this.$hide_tid = this.setTimeout('eventHide', 300, true);
                }
            }else {
                clearTimeout(this.$hide_tid);
                this.$hide_tid = 0;
            }
        },
        /**
         * 显示选择控件
         * @param  {Element} dom 目标图表DOM Element
         * @return {None}
         */
        show: function(dom){
            var cfg = this.config;
            var doms = this.doms;
            dom = this.target = $(dom).children('div[data-sub]:first');
            if (this.active){
                doms[this.active].removeClass('act');
            }
            this.el.appendTo(dom);
            if (dom.hasClass('act')){
                var sub = dom.attr('data-sub');
                if (doms[sub]){
                    doms[sub].addClass('act');
                    this.active = sub;
                }
            }
            var cb = this.showCallback;
            if (cb){
                var data = this.getRowData();
                if (data){
                    if (util.isFunc(cb)){
                        cb(cfg.subs, data, this);
                    }else if (util.isArray(cb)){
                        cb[1].call(cb[0], cfg.subs, data, this);
                    }
                }
            }
            subGridCtr.master(this, 'show', null);
        },
        /**
         * 关闭subGrid显示列
         * @return {None}
         */
        hideSubGrid: function(){
            this.target.attr('class', this.default_class);
            var sub = this.target.closest('tr');
            var index = +sub.attr('data-index');
            sub = this.parent().hideSubRow(index);
            if (sub){
                this.fire('hideSubGrid', {
                    'type':sub.attr('data-sub'),
                    'index':index
                });
            }
            if (this.active){
                this.doms[this.active].removeClass('act');
            }
            // this.hide();
        },
        /**
         * 打开指定类型的subGrid
         * @param  {Object} cfg subGrid类型配置信息
         * @return {None}
         */
        showSubGrid: function(cfg){
            var name = cfg.type;
            var row = this.target.closest('tr');
            var index = +row.attr('data-index');
            if (isNaN(index)){
                app.error('二级表格获取数据列索引失败');
                return false;
            }
            var c = this.config;
            var parent = this.parent();
            var label = labels.get('grid_' + cfg.type);
            var data = parent.rowData(index);
            var old_name = this.target.attr('data-sub');
            this.target.removeClass(subGridPrefix + old_name);
            this.target.addClass('act '+ subGridPrefix + name).attr('data-sub', name);

            var sub = parent.showSubRow(index, label.collapse);
            if (!sub) { return false; }

            if (c.key){
                sub.row.attr({
                    'data-id': data[c.key],
                    'data-sub': name,
                    'data-idx': index
                });
            }

            this.fire('showSubGrid', {'type':name, 'config':cfg, 'label':label, 'target':sub.div, 'index':index, 'data':data});

            // 修改图标状态
            var doms = this.doms;
            if (this.active){
                doms[this.active].removeClass('act');
            }
            doms[name].addClass('act');
            this.active = name;
        },
        /**
         * 扩展功能非sub类型默认处理函数
         * @param  {Object}    cfg 配置
         * @return {Undefined}     无返回值
         */
        subFunction: function(cfg){
            var name = cfg.type;
            var label = labels.get('grid_' + cfg.type);

            this.fire(
                'subFunction'
                ,{
                    'type':name
                    ,'config':cfg
                    ,'label':label
                    // 获取对应行的索引
                    ,'index':this.getRowIndex()
                    // 获取对应行的数据
                    ,'data':this.getRowData()
                }
            );
            this.hide();
        },
        getRowIndex:function(){
            var index = +this.target.closest('tr').attr('data-index');
            if (isNaN(index)){
                app.error('二级表格获取数据列索引失败');
                return false;
            }
            return index;
        },
        /**
         * 获取对应行的数据
         * @return {Object} 行数据
         */
        getRowData:function(){
            var index = this.getRowIndex();
            return index !== false?this.parent().rowData(index):null;
        }
    });

    /**
     * 获取某路径上的某个属性值
     * @param  {DOM} elm  开始获取的DOM对象
     * @param  {String} name 要获取的属性名称
     * @param  {DOM} end  <可选> 直到结束的DOM对象
     * @return {String}      返回获取到的属性字符串值或者NULL
     */
    function closetAttr(elm, name, end){
        if (!end) {end = document.body;}
        var val;
        while (elm != end){
            val = elm.getAttribute(name);
            if (val !== null){
                return val;
            }
            elm = elm.parentElement;
        }
        return null;
    }

    //todo: 暂时修正表格消息拦截问题
    var lastEventSubGridTS = 0;

    /**
     * 列表主体表格
     */
    function List(config, parent){
        config = this.config = $.extend(true, {
            'class': 'M-tableList',
            'target': parent,
            'cols': [],
            'subs': null,
            'subClass': 'M-tableListSubGrid',
            'subFilter': null,
            'rowClick': false,
            'rowSelect':false,
            'singleSelect':false,
            'opClick': false,
            'data': null,
            'index': 0,
            'sort': null,
            'key': null, // 记录索引字段名
            'order': 'desc',
            'default_sort': true,
            'scroll_type': 'horizontal', // 滚动类型, horizontal-普通水平, row-垂直行滚动, col-水平列滚动
            'scroll_size': 20, // 滚动显示的行列数
            'dragset':true,//列表左右拖拽控制
            'emptyText': LANG('没有数据'),
            'loadingText': LANG('数据加载中, 请稍后..'),
            /*
             render > list > html
             "functional":{
             ,render:function(){//code}
             ,"html":'<a><em></em>text</a>'
             ,"list":[
             {
             "text":"abc"
             ,"icon":"resume"
             ,"class":"G-icon"
             ,"func":"enable"
             ,"attr":{
             "href":"http://"
             ,"data-func":"enable"
             }
             }
             ]
             }
             */
            "functional":null,
            "disable_func":false,
            // {1}:text,{2}:main icon class,{3}:icon class,{4}:functional type,{5}:other attr.
            "functionalElTpl":'<a title={1} {4} {5}><em class="{2} {3}"></em>{1}</a>',
            'highlightClassName': "M-tableListRowHighlight",
            "highlightRowClass":"M-tableListHighlightRow"
        }, config);
        if (config.order != 'desc'){ config.order = 'asc'; }

        //触发行选择函数
        if(config.rowSelect && !config.rowClick){
            config.rowClick = this.eventSelectRow;
        }

        if(config.functional){
            if(isNaN(config.functional.where)){
                config.functional.where = (!config.cols.length || config.cols[0].type !== "id")?0:1;
            }
            config.functional.width = isNaN(config.functional.width)?30:config.functional.width;
            config.functional.text = config.functional.text || LANG("操作");
            config.functional.type = "control";
            config.functional.name = "functional";
            config.cols.splice(
                config.functional.where
                ,0
                ,config.functional
            );
        }

        List.master(this, null, config);

        this.$set_data_hide = true;

        // 表格数据
        this.$data = null;

        // 选中状态
        this.$selectedRowId = {};
        this.$hasSelect = false;

        // 高亮行的id
        this.$highlightIds = [];

        // 子表格容器列表
        this.$subs_div = [];

        // 功能函数禁用状态
        this.$disableFunc = config.disable_func;

        // 当前横向滚动方向坐标
        this.$scrollPos = 0;

    }
    extend(List,view.container,{
        init: function(){
            this.doms = {};
            var cfg = this.config;
            this.cols = [];
            for (var i=0; i<cfg.cols.length; i++){
                // 列设置存入对象变量中
                this.cols.push(this.formatCol(cfg.cols[i]));
            }
            // subGrid控制模块
            if (cfg.subs){
                this.subCtr = this.create(
                    'subCtrl', subGridCtr,
                    {
                        'subs': cfg.subs,
                        'key': cfg.key,
                        'showCallback': cfg.subFilter
                    }
                );
            }

            this.rows = [];
            this.table = $('<table/>').appendTo(this.el);
            this.buildHead();
            this.buildBody();
            this.render();

            // 绑定事件监控
            this.dg(this.table, ".M-tableListSub"/*subGridConSelector*/, 'mouseenter mouseleave', 'eventSubGrid');
            this.dg(this.table, '.M-tableListClickable', 'click', 'clickRow');

            var scroll = {
                wheel: 'shift',
                type:'manual',
                step:3,
                offset:0,
                margin:[2, this.head.outerHeight() + 2]
            };
            switch (cfg.scroll_type){
                case 'none':
                    scroll = null;
                    cfg.dragset = null;
                    break;
                case 'row':
                    scroll.dir = 'V';
                    scroll.pad = false;
                    scroll.wheel = true;
                /* falls through */
                case 'col':
                    cfg.dragset = null;
                    break;
                default:
                    scroll = {wheel:'shift'};
                    break;
            }

            if (cfg.dragset){
                app.drag(this.body, this.eventScrollerHandler, this);
            }

            if (scroll){
                this.scroll = this.create('scroll', common.scroller, scroll);
            }else {
                this.el.css('overflow', 'visible');
            }

            if(cfg.functional){
                // 功能弹出层中的功能
                this.dg(this.body,".M-tableListFunctional a[data-func]","click","eventFunctionalHandler");
                this.dg(this.body,".M-tableListFunctional","mouseenter mouseleave","eventToggleFunctional");
            }

            // 选择功能事件监听
            if (this.$hasSelect){
                this.dg(this.body, 'input[data-type="select_item"]', 'change', 'eventSelectChange');
            }

            // 设置预设数据
            this.setData(this.config.data);
        },
        // 获取字段列表配置
        getCols: function(){
            var data = [],
                cols = this.cols;

            for(var i in cols){
                if(cols[i].type == 'col'){
                    data.push(cols[i]);
                }
            }
            return data;
        },
        // 格式化列配置为标准的配置对象
        formatCol: function(col){
            var name, cfg = this.config;
            if (typeof(col) == 'string'){
                col = {'name': col};
            }
            // 处理选择类型列
            if (col.type === 'select'){
                this.$hasSelect = true;
                col.select_id = name = util.guid();
                if (col.all && !col.head_html){
                    col.head_html = '<input type="checkbox" data-select="'+name+'" data-type="select_all"'+(col.readonly?'disabled':'')+'/>';
                }
                if (!col.html){
                    col.html = '<input type="checkbox" data-select="'+name+'" data-type="select_item" '+(col.readonly?'disabled':'')+'/>';
                }
                if (!col.width){
                    col.width = 30;
                }
                // 创建选中状态存储
                this.$selectedRowId[name] = [];
            }
            // 扩展默认列属性
            col = $.extend(
                {
                    type: 'col',	// 列类型: col, id, index, dim, fixed, select
                    name: null,
                    field: null,
                    text: null,
                    desc: null,
                    halign: null,
                    hcls: null,
                    align: null,
                    cls: null,
                    width: 0,
                    format: null,
                    render: null,
                    hide: false,
                    force_sort: false,
                    sort: cfg.default_sort,
                    order: 'asc'
                },
                labels.get(col.name, 'type_'+col.type),
                col
            );
            _prepare_col_callback(this, col, 'format');
            _prepare_col_callback(this, col, 'render');

            // 检查列是否需要排序
            if (col.force_sort){
                col.sort = col.force_sort;
            }
            if (col.sort === true){
                col.sort = (col.field || col.name);
            }
            if (!col.align){
                switch(col.type){
                    case 'id':		// 自动递增序号
                    case 'op':		// 操作列
                    case 'select':	// 勾选框
                        col.align = 'center';
                        break;
                    case 'index':	// 主列
                    case 'dim':		// 维度列
                    case 'fixed':	// 固定列
                        col.align = 'left';
                        break;
                }
            }

            return col;
        },
        onScrollReset:function(evt){
            var c = this.config;
            if (c.dragset !== null){
                c.dragset = evt.param;
            }
            return false;
        },
        /**
         * 生成列表的头部
         * @return {None} 无返回
         */
        buildHead: function(){
            var head = this.head = $('<thead/>');
            var cols = this.cols;
            var col, cell, row = $('<tr/>');

            for (var i=0; i<cols.length; i++){
                col = cols[i];
                cell = $('<th/>').attr('data-col', i).appendTo(row);
                this.buildHeadCell(cell, col);
            }
            head.append(row).appendTo(this.table);
            // 监听事件
            this.dg(head, '.M-tableListHeadSort', 'click', 'clickSort');
            this.dg(head, '.M-tableListHeadSort', 'mouseenter mouseleave mousedown mouseup', 'eventSort');
        },
        buildHeadCell: function(cell, col){
            var text, c = this.config;
            if (col.head_html){
                cell.html(col.head_html);
            }else {
                text = col.text || '&nbsp;';
                cell.append($('<span/>').text(text));
            }

            if (col.halign){
                cell.attr('align', col.halign);
            }
            if (col.hcls){
                cell.attr('class', col.hcls);
            }
            if (col.width){
                cell.width(col.width);
            }
            if (col.force_sort || (('col dim fixed'.indexOf(col.type) !== -1) && col.sort)){
                cell.addClass('M-tableListHeadSort');
                cell.append('<em/>');
                if (col.sort === c.sort){
                    cell.addClass(c.order);
                }
            }else if (col.type === 'op' && c.opClick){
                this.jq(cell, 'click', 'clickOpHeader');
            }else if (col.type === 'select' && col.all){
                this.jq(cell.find('input[data-type="select_all"]'), 'click', 'clickSelectHeader');
            }
        },
        /**
         * 表头鼠标排序事件响应
         * @param  {Object} evt jQuery事件对象
         * @return {None}     无返回
         */
        eventSort: function(evt, elm){
            switch (evt.type){
                case 'mouseenter': $(elm).addClass('M-tableListHeadHover'); break;
                case 'mousedown': $(elm).addClass('M-tableListHeadDown'); break;
                case 'mouseup': $(elm).removeClass('M-tableListHeadDown'); break;
                case 'mouseleave': $(elm).removeClass('M-tableListHeadHover M-tableListHeadDown'); break;
            }
            evt.stopPropagation();
            evt.preventDefault();
        },
        /**
         * 表头排序点击事件
         * @param  {Object} evt jQuery事件对象
         * @return {None}     无返回
         */
        clickSort: function(evt, elm){
            var td = $(elm);
            var col = td.attr('data-col');
            var c = this.config;
            td.parent().children('.M-tableListHeadSort').removeClass('asc desc');
            col = this.cols[col];
            if (c.sort == col.sort){
                c.order = (c.order == 'desc' ? 'asc' : 'desc');
            }else {
                c.sort = col.sort;
            }
            col.order = c.order;
            td.addClass(c.order);
            this.fire('changeSort', col);
            evt.stopPropagation();
        },
        /**
         * 表格拖放事件处理
         * @param  {object} ev dragEvent
         * @param  {event} e  jqueryEvent
         * @return {boolean}    return boolean是否继续事件
         */
        eventScrollerHandler: function(ev,e){
            switch(ev.type) {
                case "moveDrag":
                    this.scroll.scrollBy(-ev.cdx);
                    this.setFrozenColumn(this.scroll.getScrollPos());
                    break;
                case 'endDrag':
                    this.body.removeClass('draghand');
                    if (Math.abs(ev.dx) > 5){
                        this.$skipClickRow = util.time_diff();
                    }
                    break;
                case "startDrag":
                    if (e.ctrlKey || this.scroll.getScrollMax()<=0){ return false; }
                    var bd = this.body[0];
                    var td = e.target, tr = td.parentElement, pe = tr.parentElement;
                    while (pe && pe != bd){
                        if (pe === document.body){ return false; }
                        td = tr;
                        tr = pe;
                        pe = pe.parentElement;
                    }
                    if ($(td).attr('data-ctype')){ return false; }
                    if ($(tr).attr('data-type') !== 'row'){ return false; }

                    // 允许拖动
                    this.body.addClass('draghand');
                    return true;
            }
        },
        setSort: function(field, order){
            var c = this.config;
            var head = this.head;
            head.find('.M-tableListHeadSort').removeClass('asc desc');
            c.sort = field;
            c.order = order;

            util.each(this.cols, function(col, idx){
                if (col.sort == field){
                    head.find('th[data-col="'+idx+'"]:first').addClass(order);
                }
            });
            return this;
        },
        /**
         * 获取当前排序字段
         * @return {String} 返回排序字符串
         */
        getSort: function(){
            var cfg = this.config;
            if (!cfg.sort || cfg.sort === true){
                return undefined;
            }
            // 这里应该只返回sort的值就可以了
            if (util.isString(cfg.sort)){
                return cfg.sort + (cfg.order == 'asc' ? '|1' : '|-1');
            }else {
                var sort = '';
                util.each(cfg.sort, function(order, name){
                    sort += ',' + name + (order == 'asc' ? '|1' : '|-1');
                });
                if (sort !== ''){
                    return sort.substr(1);
                }else {
                    return undefined;
                }
            }
        },
        /**
         * 生成表格记录行
         * @return {None} 无返回
         */
        buildBody: function(){
            this.body = $('<tbody/>').appendTo(this.table);
            if (this.config.opClick){
                this.dg(this.body, 'td[data-ctype="op"]', 'click', 'clickOp');
            }
        },
        /**
         * 生成表格行
         * @param  {Number} index 数据行索引号
         * @param  {Object} data  数据行数据
         * @return {jQuery}       返回行的jQuery对象
         */
        buildRow: function(index, data){
            var cols = this.cols;
            var cfg = this.config;
            var col, cell;
            var row = $('<tr data-type="row"/>').attr('data-index', index);
            if (index % 2){
                row.attr('class', 'alt');
            }
            var env = {
                'id': index,
                'dat': data,
                'sub': true,
                "func": true
            };

            // 生成单元格
            for (var i=0; i<cols.length; i++){
                col = cols[i];
                cell = $('<td/>').appendTo(row);
                if (col.type != 'col'){
                    cell.attr('data-ctype', col.type);
                }
                this.buildCell(cell, col, env,row);
            }

            // 绑定行点击事件
            if (cfg.rowClick){
                row.addClass('M-tableListClickable');
            }
            this.rows[index] = row;
            return row.appendTo(this.body);
        },
        /**
         * 生成表格单元格信息
         * @param  {jQuery} cell 单元格jQuery对象
         * @param  {Object} col  列配置对象
         * @return {None}      无返回
         */
        buildCell: function(cell, col, env,row){
            var cfg = this.config;
            var text = null;
            if (col.type == 'id'){
                text = cfg.index + env.id + 1;
            }else if (col.html){
                text = col.html;
            }else {
                if (col.field && util.has(env.dat, col.field)){
                    text = env.dat[col.field];
                }else if (util.has(env.dat, col.name)){
                    text = env.dat[col.name];
                }
                if (col.format){
                    // 格式化函数, 只传单元格的值进入
                    text = col.format.call(col.format_ctx || window, text, col, this);
                }
                if (col.render){
                    // 渲染函数, 传入当前数据索引, 当前经过格式化的值, 还有行数据
                    // 可以返回jQuery对象
                    text = col.render.call(col.render_ctx || window, env.id, text, env.dat, col, cell, this,row);
                }
                if (text === null || text === undefined){
                    text = '-';
                }
            }
            if (text === ''){
                text = '&nbsp;';
            }
            if (col.align){
                cell.addClass(col.align);
            }
            if (col.cls){
                cell.addClass(col.cls);
            }
            if (col.hide || col.forceHide){
                cell.hide();
            }

            var hasSub = env.sub && cfg.subs && col.type == 'index';

            var hasFun = env.func && cfg.functional && col.type == 'control';
            var mode = (hasSub ? 1 : 0);

            if(hasFun){
                cell.empty();
                if(!this.$disableFunc){
                    var fun = $('<div class="M-tableListFunctional"/>');
                    cell.append(
                        $('<div class="M-tableListFunctionalAnchor" />').append(
                            fun.append(
                                this.buildFunction(cfg.functional,env,fun,col,row)
                            )
                        )
                    );
                    fun = null;
                }
                env.func = false;
            }

            if (mode){
                // 功能模块单元格, 增加功能模块结构
                var content;
                var frame = cell.children('.M-tableListSub');
                if (frame.length){
                    content = frame.children('.M-tableListContent');
                }else {
                    frame = $('<div class="M-tableListSub"></div>').appendTo(cell);
                    content = $('<div class="M-tableListContent"/>').appendTo(frame);
                }

                // 插入功能模块控制
                /*if (hasFun){
                 var fun = frame.children('.M-tableListFunctional');
                 if (this.$disableFunc){
                 fun.remove();
                 mode--;
                 }else {
                 if (fun.length){
                 fun.empty();
                 }else {
                 fun = $('<div class="M-tableListFunctional"/>').appendTo(frame);
                 }
                 var dom = this.buildFunction(cfg.functional, env, fun, col);
                 if (dom){
                 fun.append(dom);
                 }else {
                 fun.remove();
                 mode--;
                 }
                 }
                 env.func = false;
                 }*/

                // 插入子表格控制列
                if (hasSub){
                    var sub = frame.children(subGridConSelector);
                    env.sub = cfg.subs[0].type;
                    if (sub.length){
                        sub = sub.children('div:first');
                    }else {
                        sub = $('<div class="'+subGridConClass+'"/>').appendTo(frame);
                        sub = $('<div/>').appendTo(sub);
                    }
                    sub.attr('class', subGridPrefix + env.sub).attr('data-sub', env.sub);
                    env.sub = false;
                }

                // 设置多行高度修正
                if (mode > 1){
                    frame.addClass('M-tableListSubRow2');
                }else {
                    frame.removeClass('M-tableListSubRow2');
                }
                // 设置显示内容
                if (mode > 0 && text !== cell){
                    content.empty().append(text);
                }
            }
            if (mode === 0 && text !== cell && !hasFun){
                // 普通单元格, 清空内容重新设置
                cell.empty().append(text);
            }

            // 选择栏状态更新
            if (col.type === 'select'){
                text = env.dat[cfg.key];
                var sels = this.$selectedRowId[col.select_id];
                if (util.index(sels, text) !== null){
                    cell.find('input:first').prop('checked', true);
                }
            }
        },
        buildFunction: function(cfg, env, cell, col,row){
            var dom = '';

            if (util.isFunc(cfg.render)){
                dom = cfg.render.call(
                    cfg.context || window,
                    env.id, null, env.dat, col, cell, this,row
                );
            }else if (cfg.html){
                dom = cfg.html;
            }else if (util.isArray(cfg.list) && cfg.list.length){
                util.each(cfg.list, function(i){
                    var list = [];
                    if (i.func){
                        list.push('data-func="'+i.func+'"');
                    }
                    if (i.attr){
                        for (var n in i.attr){
                            list.push(n+'="'+util.html(i.attr[n])+'"');
                        }
                    }
                    dom += util.formatIndex(
                        cfg.functionalElTpl,
                        i.text,
                        i['class'] || 'G-icon',
                        i.icon || '',
                        list.join(' ')
                    );
                });
                cfg.html = dom;
            }

            return (dom || false);
        },
        /**
         * 显示无数据提示
         * @return {None} 无返回
         */
        showEmptyRow: function(){
            if (!this.emptyRow){
                var len = this.cols.length;
                this.emptyRow = $('<tr class="M-tableListEmpty"><td colspan="'+len+'"></td></tr>');
                this.emptyRow.appendTo(this.body).children().text(this.config.emptyText);
            }
            this.body.children('tr').hide();
            this.hideLoading();
            this.emptyRow.css('display', '');
        },
        /**
         * 隐藏空数据提示
         * @return {None} 无返回
         */
        hideEmptyRow: function(){
            if (this.emptyRow){
                this.emptyRow.hide();
            }
        },
        /**
         * 显示数据加载中
         * @return {None} 无返回
         */
        showLoading: function(opacity){
            if (!opacity){
                // 	this.el.addClass('disabled');
                // }else {
                var mask = this.loadingRow;
                var el = this.el;
                var width = el.width();
                if(!width){
                    this.$showloadingDelay = true;// 需要等容器显示出来后再showLoading
                    return false;
                }
                if (!mask){
                    mask = this.loadingRow = $('<div class="M-tableListLoading"/>').appendTo(el);
                }
                mask.width(width).height(el.height()).show();
                if (this.emptyRow){
                    this.emptyRow.children().text(this.config.loadingText)
                }
            }
        },
        /**
         * 隐藏数据加载提示
         * @return {None} 无返回
         */
        hideLoading: function(){
            this.$showloadingDelay = false;
            if (this.loadingRow){
                this.loadingRow.hide();
            }
            if (this.emptyRow){
                this.emptyRow.children().text(this.config.emptyText)
            }
            // this.el.removeClass('disabled');
        },
        /**
         * 显示自动刷新提示
         * @return {None}
         */
        showRefresh: function(mode){
            if (mode === 'hide'){
                this.el.removeClass('disabled');
            }else {
                this.el.addClass('disabled');
                this.setTimeout('showRefresh', 300, 'hide');
            }
        },
        /**
         * 行点击jQuery回调函数
         * @param  {Object} evt jQuery事件对象
         * @return {None}     无返回
         */
        clickRow: function(evt, elm){
            // 检查是否有拖拽情况发生
            var time = this.$skipClickRow;
            this.$skipClickRow = 0;
            if (time && util.time_diff(time) < 500){
                return false;
            }
            // 如果是特殊类型的单元格, 则不允许点击
            var col_type = closetAttr(evt.target, 'data-ctype', elm);
            switch (col_type){
                case 'op':
                case 'id':
                case 'select':
                case 'noclick':
                    return;
            }

            var row = $(elm);
            var index = +row.attr('data-index');
            var data = this.rowData(index);

            if (!data){ return; }

            if (util.isFunc(this.config.rowClick)){
                this.config.rowClick(data, index, this);
            }else {
                this.fire('listRowClick', {'index': index, 'data': data, 'col_type':col_type, 'row':elm, 'event':evt});
            }
        },
        /**
         * 操作方法点击处理
         * @param  {Object} evt jQuery事件对象
         * @param  {Object} elm DOM对象
         * @return {None}     无返回 / 返回false阻止事件冒泡
         */
        clickOp: function(evt, elm){
            evt.stopPropagation();
            var type = closetAttr(evt.target, 'data-op', elm);
            if (!type){
                return;
            }

            var index = +$(elm).parent().attr('data-index');
            var data = this.rowData(index);

            if (!data){ return false; }
            var target = $(evt.target);

            if (util.isFunc(this.config.opClick)){
                this.config.opClick(type, data, index, this, target);
            }else {
                this.fire('listOpClick', {'index':index, 'data':data, 'op':type, 'el':target});
            }
            return false;
        },
        /**
         * 操作列表头点击处理
         * @param  {Object} evt jQuery事件对象
         * @param  {Object} elm DOM对象
         * @return {None}     无返回 / 返回false阻止事件冒泡
         */
        clickOpHeader: function(evt, elm){
            evt.stopPropagation();
            var type = closetAttr(evt.target, 'data-op', elm);
            if (!type){ return; }
            var target = $(evt.target);
            if (util.isFunc(this.config.opClick)){
                this.config.opClick(type, null, null, this, target);
            }else {
                this.fire('listOpClick', {'op':type, 'el':target});
            }
        },
        /**
         * 行选择功能选择变更回调函数
         * @param  {Object} evt jQuery事件对象
         * @param  {Object} elm DOM对象
         * @return {None}     无返回 / 返回false阻止事件冒泡
         */
        eventSelectChange: function(evt, elm){
            evt.stopPropagation();
            var index = closetAttr(elm, 'data-index', this.body[0]);
            if (index === null || isNaN(+index)){ return; }
            var keyName = this.config.key;
            var cid = +$(elm).attr('data-select');
            var col = util.find(this.cols, cid, 'select_id');
            var data = this.rowData(index);
            var key = data[keyName];
            var sels = this.$selectedRowId[col.select_id] || [];
            var changed = false;
            var singleSelect = this.config.singleSelect;

            if (elm.checked){
                // 选择
                if (util.index(sels, key) === null){
                    //如果是单选的情况
                    if(singleSelect){
                        sels=[key];
                    }else{
                        sels.push(key);
                    }
                    changed = true;
                }
            }else {
                // 取消
                changed = util.remove(sels, key);
            }
            this.$selectedRowId[col.select_id] = sels;
            this.updateSelectRowByCol(col);
            if(changed){
                data = [];
                util.each(sels, function(id){
                    var row = util.find(this.$data, id, keyName);
                    if (row){ data.push(row); }
                }, this);
                this.fire(
                    'changeSelect'
                    ,{
                        "column":col
                        ,"selected":$.extend([], sels)
                        ,"data":data
                    }
                );
                data = null;
            }
        },
        /**
         * 选择表格行元素时，改变checkbox的状态
         * @param  {object} data  行数据
         * @param  {number} index 索引号
         * @return {None]}        无返回
         */
        eventSelectRow : function(data,index,list){
            if(list.rows[index]){
                list.rows[index].find("input[data-select]:first").click();
            }
        },
        /**
         * 点击全选框事件回调函数
         * @param  {Object} evt jQuery事件对象
         * @param  {Object} elm DOM对象
         * @return {None}     无返回 / 返回false阻止事件冒泡
         */
        clickSelectHeader: function(evt, elm){
            evt.stopPropagation();
            var c = this.config;
            var cid = +$(elm).attr('data-select');
            var col = util.find(this.cols, cid, 'select_id');
            var sels = this.$selectedRowId[col.select_id];
            var chk = elm.checked;
            this.body.find('input[data-select='+cid+']').prop('checked', chk);
            var len = sels.length;
            var me = this;
            util.each(this.$data, function(item){
                var key = item[c.key];
                if (chk){
                    sels.push(key);
                    me.setSelectedRowHighlight(key,me.config.highlightRowClass);
                }else {
                    util.remove(sels, key);
                    me.unsetSelectedRowHighlight(key,me.config.highlightRowClass);
                }
            });
            me = null;
            if (chk){
                util.unique(sels);
            }
            if (sels.length != len){
                // 数据有修改, 发送事件
                var data = [];
                util.each(sels, function(id){
                    var row = util.find(this.$data, id, c.key);
                    if (row){ data.push(row); }
                }, this);
                this.fire('changeSelect', {'column': col, 'selected': sels, 'data': data});
            }
        },
        /**
         * 更新列表的选择状态
         * @param  {String} name <可选> 指定设置那个列的ID, 不指定则修改全部
         * @return {None}
         */
        updateSelectRow: function(name){
            var data = this.$data;
            // 当前没有数据
            if (!data || !data.length){
                this.table.find('input[data-select]').prop('checked', false);
                return true;
            }
            // 更新状态
            if (name === undefined){
                util.each(this.cols, function(col){
                    if (col.type !== 'select'){ return; }
                    this.updateSelectRowByCol(col);
                }, this);
            }else {
                var col = util.find(this.cols, name, 'name');
                if (col && col.type === 'select'){
                    this.updateSelectRowByCol(col);
                }
            }
        },
        updateSelectRowByCol: function(col){
            var key = this.config.key
                ,sid = col.select_id
                ,sels = this.$selectedRowId[sid];
            if(!sels || !sels.length){
                var cls = this.config.highlightRowClass;
                sels = this.table.find("."+cls).removeClass(cls);
                this.$highlightIds = [];
                this.table.find('input[data-select='+sid+']').prop('checked',false);
                return;
            }
            var me = this
                ,ips = this.body.find('input[data-select='+sid+']')
                ,idx = 0, all = true, data = false;
            util.each(this.$data, function(row){
                var chk = (util.index(sels, row[key]) !== null);
                ips.eq(idx++).prop('checked', chk);
                me[
                chk && "setSelectedRowHighlight" || "unsetSelectedRowHighlight"
                    ](row[key],me.config.highlightRowClass);
                all = all && chk;
                data = true;
            });
            this.head.find('input[data-select='+sid+']').prop('checked', all && data);
            key = sid = sels = me = ips = idx = null;
        },
        /**
         * 设置选中的行ID信息
         * @param  {Array}  ids  选中的行ID记录数组
         * @param  {String} name <可选> 指定设置那个列的ID, 不指定则修改全部
         * @return {Bool}        返回是否修改
         */
        setSelectRowIds: function(ids, name){
            var sels = this.$selectedRowId;
            var cols = this.cols;
            var updated = false;
            if (name === undefined){
                util.each(sels, function(row, sid){
                    var col = util.find(cols, +sid, 'select_id');
                    if (col && col.type === 'select'){
                        sels[sid] = ids;
                        this.updateSelectRowByCol(col);
                        updated = true;
                    }else {
                        return null;
                    }
                }, this);
            }else {
                var col = util.find(cols, name, 'name');
                if (col && col.type === 'select'){
                    sels[col.select_id] = ids;
                    this.updateSelectRowByCol(col);
                    updated = true;
                }
            }
            return updated;
        },
        addSelectRowId: function(id, name){
            var SelIds = this.$selectedRowId;
            var cols = this.cols;

            if (name === undefined){
                var updated = false;
                util.each(SelIds, function(sels, sid){
                    var col = util.find(cols, +sid, 'select_id');
                    if (col && col.type === 'select'){
                        if (util.index(sels, id) !== null){ return; }
                        sels.push(id);
                        this.updateSelectRowByCol(col);
                        updated = true;
                    }else {
                        return null;
                    }
                }, this);
                return updated;
            }else {
                var col = util.find(cols, name, 'name');
                if (!col || col.type !== 'select'){ return false; }
                var sels = SelIds[col.select_id];
                if (util.index(sels, id) !== null){ return false; }
                sels.push(id);
                this.updateSelectRowByCol(col);
                return true;
            }
        },
        removeSelectRowId: function(id, name){
            var SelIds = this.$selectedRowId;
            var cols = this.cols;

            if (name === undefined){
                var updated = false;
                util.each(SelIds, function(sels, sid){
                    var col = util.find(cols, +sid, 'select_id');
                    if (col && col.type === 'select'){
                        if (!util.remove(sels, id)){ return; }
                        this.updateSelectRowByCol(col);
                        updated = true;
                    }else {
                        return null;
                    }
                }, this);
                return updated;
            }else {
                var col = util.find(cols, name, 'name');
                if (!col || col.type !== 'select'){ return false; }
                var sels = SelIds[col.select_id];
                if (!util.remove(sels, id)){ return false; }
                this.updateSelectRowByCol(col);
            }
        },
        /**
         * 获取选中的行ID数组
         * @param  {String} name <可选> 返回指定的名称选中列
         * @return {Mix}      返回指定名称的ID数组, 或者名称对象数组
         */
        getSelectRowId: function(name){
            if (name === undefined){
                var data = {};
                var cols = this.cols;
                var index = 0;
                util.each(this.$selectedRowId, function(sels, sid){
                    var col = util.find(cols, +sid, 'select_id');
                    if (col){
                        data[col.name || index] = $.extend([],sels);
                        index++;
                    }
                });
                return data;
            }else {
                var col = util.find(this.cols, name, 'name');
                if (col && col.type === 'select'){
                    return $.extend([], this.$selectedRowId[col.select_id]);
                }
            }
        },
        /**
         * 控制功能响应处理函数
         * @param  {Object} evt jQuery事件对象
         * @param  {Object} el  鼠标事件源DOM对象
         * @return {Bool}       阻止默认事件
         */
        eventFunctionalHandler:function(evt,elm){
            var el = $(elm);
            var index = +el.closest("tr").attr("data-index");
            if (isNaN(index)){ return false; }

            this.fire(
                "listFnClick"
                ,{
                    "func":el.attr("data-func")
                    ,"index":index
                    ,"el":el
                    ,"data":this.rowData(index)
                }
            );
            return false;
        },
        /**
         * 切换显示控制功能
         */
        eventToggleFunctional:function(evt,el){
            if (this.$disableFunc){ return; }
            el = $(el);
            var a = el.find("a:first");
            el.width(
                evt.type === "mouseleave" && a.outerWidth() || a.outerWidth()*el.find("a").length+(el.find(".spacing")&&el.find(".spacing").width()||0)
            );
            el.closest(".M-tableListFunctionalAnchor")[
            evt.type === "mouseleave" && "removeClass" || "addClass"
                ]("functionalHover");
            el = null;
            return false;
        },
        switchFunctional: function(state){
            state = !state;
            if (!this.config.functional || state === this.$disableFunc){
                return this;
            }
            this.$disableFunc = state;
            this.updateColumnType('index');
        },
        /**
         * 二级表格按钮触发
         * @param  {Object} evt jQuery事件对象
         * @return {None}     无返回
         */
        eventSubGrid: function(evt, elm){
            if (lastEventSubGridTS == evt.timeStamp){
                return false;
            }
            lastEventSubGridTS = evt.timeStamp;

            if(this.subCtr){
                if(evt.type === "mouseenter"){
                    this.subCtr.show(
                        $(elm).find(subGridConSelector)
                    );
                }else if(evt.type === "mouseleave"){
                    this.subCtr.hide();
                }
            }
        },
        /**
         * 二级表格滚动式固定位置处理
         * @param  {Object} evt jQuery事件对象
         * @return {None}     无返回
         */
        onScroll: function(ev){
            var c = this.config;
            var p = ev.param;
            var rows = this.rows;
            var i, end;
            var start = this.$scrollPos = Math.abs(p.pos);

            switch (c.scroll_type){
                case 'row':
                    end = Math.min(p.con, start + c.scroll_size);
                    for (i=0; i<rows.length; i++){
                        rows[i].toggle(i>=start && i<end);
                    }
                    return false;
                case 'col':
                    // todo: 滚动数量处理
                    console.log(ev);
                    return false;
                case 'horizontal':
                    this.setFrozenColumn(start);
                //return false;
            }
            var divs = this.$subs_div;
            if (divs.length > 0){
                start = (-this.table.css('marginLeft').slice(0,-2) || 0) + 'px';
                for (i=divs.length; i>0;){
                    divs[--i].style.marginLeft = start;
                }
            }

            return false;
        },
        /**
         * 二级表格滚动式固定位置处理
         * @param  {number} start x轴变化距离
         * @return {this}     返回自身
         */
        // 设置冻结列
        setFrozenColumn: function(start){
            //判断是否是谷歌浏览器
            var isChrome = navigator.userAgent.toLowerCase().match(/chrome/) != null;
            if(isChrome){
                var c = this.config;
                var site = c.frozenSite;	// 冻结位置列
                var trs = this.el.find('tbody').eq(0).find('>tr').not('.M-tableListSubGrid');
                var tds = trs.find('td:eq('+site+')');	// 冻结位置列单元格
                var height = tds.height();	// 冻结列行高

                // 默认x轴临界点为50
                var flag = start > 50 && c.hasAmount && c.hasFrozen;

                if(flag){
                    // 设置td高度与冻结列的高度保证一致
                    trs.find('td').height(height);
                }
                // 根据flag值，是否更改样式
                trs.toggleClass('M-tableListFrozenColumnTr', flag)
                tds.toggleClass('M-tableListFrozenColumnTd', flag);
            }

            return this;
        },
        updateScroll: function(){
            var mod = this.scroll;
            if (!mod){ return; }

            var c = this.config;
            switch (this.config.scroll_type){
                case 'row':
                    var pos = this.$scrollPos || 0;
                    var dat = this.$data;
                    var len = dat && dat.length || 0;
                    var end = Math.min(len, pos + c.scroll_size);
                    var rows = this.rows;
                    for (var i=0; i<rows.length; i++){
                        rows[i].toggle(i>=pos && i<end);
                    }
                    mod.setSize(len, c.scroll_size);
                    return;
                case 'col':
                    //todo: 行列滚动计算滚动数量更新
                    return;
            }
            mod.measure();
        },
        onContainerShow: function(){
            if (this.scroll){
                this.scroll.measure();
            }
            if(this.$showloadingDelay){
                this.showLoading();
            }
        },
        /**
         * 获取指定索引号的行数据
         * @param  {Number} index 行数据索引编号
         * @return {Object}       返回行数据对象
         */
        rowData: function(index){
            var dat = this.$data;
            if (!dat || index < 0 || index >= dat.length){
                return null;
            }
            return dat[index];
        },
        /**
         * 重设表格数据
         * @param {Array} data 数据
         * @param {Number} index <可选> 数据开始索引, 默认为1
         * @param {Bool} no_hide <可选> 是否隐藏子表格
         */
        setData: function(data, index, no_hide){
            var c = this.config;
            this.$data = data;
            this.$set_data_hide = !no_hide;
            c.index = index || 0;

            if (!data || data.length <= 0){
                this.showEmptyRow();
            }else {
                this.hideLoading();
                this.hideEmptyRow();
                this.body.children('tr[data-type="sub"]').attr('data-hide', 1);
                for (var i=0; i<data.length; i++){
                    this.updateRow(i, data[i]);
                }
                // 隐藏不需要的行
                while (this.rows[i]){
                    this.rows[i++].hide();
                }
                this.body.children('tr[data-hide]').hide();
            }
            this.updateScroll();
            this.updateSelectRow();
            this.$set_data_hide = true;
        },
        /**
         * 设置某行记录数据
         * @param {Number} index 行索引号
         * @param {Object} row   行数据对象 / {String} 行属性名称
         * @param {Mix}    value <可选> 行属性值
         * @return {Mix} 返回false修改失败, 或者列表记录列表对象表示成功
         */
        setRow: function(index, row, value){
            var data = this.$data;
            if (data.length <= index) {
                return false;
            }
            if (app.util.isObject(row)){
                data[index] = row;
            }else {
                data[index][row] = value;
            }
            this.updateRow(index, data[index]);
            return data;
        },
        /**
         * 已某项属性值来查找数据行并更新行
         * @param {Object} row   行数据对象
         * @param {String} field 要对比的属性名称
         */
        setRowByField: function(row, field){
            var key = row[field];
            var index = this.findIndex(key, field);
            if (index === null){ return false; }
            this.$data[index] = row;
            return this.updateRow(index, row);
        },
        /**
         * 重设指定行的数据显示
         * @param {Number} index 数据行索引号
         * @param {Object} data  行数据对象
         * @return {jQuery} 返回jQuery行对象
         */
        updateRow: function(index, data){
            var row;
            if (index >= this.rows.length){
                // 没有找到记录, 新建一行
                row = this.buildRow(index, data);
            }else {
                row = this.rows[index];
                row.css('display', '');

                var cols = this.cols;
                var tds = row.children();

                var env = {
                    'id': index,
                    'dat': data,
                    'sub': true,
                    "func": true
                };

                // 生成单元格
                for (var i=0; i<cols.length; i++){
                    this.buildCell(tds.eq(i), cols[i], env,row);
                }
            }

            // 同步子表格的位置
            var c = this.config;
            var id = (c.key && data[c.key]);
            var subrow, old_sub, row_id = id;
            while (this.subCtr && id !== undefined){
                subrow = row.next();
                if (subrow.attr('data-type') !== 'sub' || subrow.attr('data-id') != id){
                    subrow = this.body.children('tr[data-type="sub"][data-id="'+id+'"]');
                    if (subrow.length <= 0){ break; }

                    old_sub = row.next();
                    id = +subrow.attr('data-idx');
                    if (old_sub.attr('data-type') === 'sub'){
                        old_sub.insertBefore(subrow).attr('data-idx', id);
                    }
                    subrow.attr('data-idx', index).removeAttr('data-hide').insertAfter(row);
                    this.fire('switchSubGrid', {'from': id, 'to': index});
                }

                // 更新同步图标状态
                subrow.removeAttr('data-hide');
                if (subrow.css('display') !== 'none'){
                    id = row.find(subGridConSelector+'>div:first');
                    c = subrow.attr('data-sub');
                    id.attr('data-sub', c).attr('class', 'act ' + subGridPrefix + c);
                }
                break;
            }

            // 判断是否要添加高亮效果
            this._addRowHighlight(row, row_id);

            // for debug
            row.attr('debug-id', row_id);
            return row;
        },
        getData: function(){
            return this.$data;
        },
        /**
         * 删除记录行
         * @param  {[type]} index [description]
         * @return {[type]}       [description]
         */
        removeRow: function(index){
            var rs = this.rows;
            if (index >= rs.length){
                return false;
            }
            // 移除数据
            var c = this.config;
            var data = this.$data;
            data.splice(index, 1);

            // 把行记录移动到最后
            var tr = rs.splice(index, 1)[0];
            var sub = tr.next();
            rs.push(tr);
            tr.appendTo(this.body).hide();
            if (sub.attr('data-type') == 'sub'){
                sub.appendTo(this.body).hide();
            }

            // 修正data-index 和 间隔类
            var i, col;
            var cols = '', id = c.index + index;
            for (i=0; i<this.cols.length; i++){
                col = this.cols[i];
                if (col.type != 'id') {continue;}
                cols += ',:eq(' + i + ')';
            }
            cols = (cols === '' ? null : cols.substr(1));
            for (i=index; i<rs.length; i++){
                rs[i].attr('data-index', i).toggleClass('alt', i % 2);
                if (cols){
                    rs[i].children(cols).text(++id);
                }
            }
            this.updateSelectRow();
            if(data.length===0){
                this.showEmptyRow();
            }
            return data;
        },
        /**
         * 删除指定属性值的行
         * @param  {Mix}    value 要查找的属性值
         * @param  {String} field <可选> 要查找的属性名称
         * @return {Boolean}      返回删除是否成功
         */
        removeRowByValue: function(value, field){
            var index = this.findIndex(value, field);
            if (index === null){ return false; }
            return this.removeRow(index);
        },
        /**
         * 增加一行数据
         * @param {Object} row 行数据对象
         */
        addRow: function(row){
            this.hideEmptyRow();
            if (this.$data){
                this.$data.push(row);
            }else {
                this.$data = [row];
            }
            var id = this.$data.length - 1;
            this.updateRow(id, row);
            this.updateSelectRow();
            return id;
        },
        /**
         * 查找指定行的Index值
         * @param  {Mix}    value 要查找的属性值
         * @param  {String} field <可选> 要查找的属性名称
         * @return {Number}       返回找到的行索引号 或 NULL表示没有找到
         */
        findIndex: function(value, field){
            if (!field){ field = '_id'; }
            return util.each(this.$data, function(row){
                if (row[field] == value){ return false; }
            });
        },
        /**
         * 显示、隐藏指定列
         * @param  {String} name 列的名字
         * @param  {Boolean} show 显示还是隐藏
         */
        toggleColumn: function(name, show){
            // 获取指定列的索引号
            var index = util.index(this.cols,name,"name");
            if (index === null){ return this; }

            var isShow = show ? "":"none";
            this.cols[index].forceHide = !show;

            // 更新标题列
            this.head.find('>tr>th').eq(index)[0].style.display = isShow;

            // 更新每一行
            index = ':eq('+index+')';
            var rows = this.body.children('tr[data-type=row]');
            var td;
            for (var j=0; j<rows.length; j++){
                td = rows.eq(j).children(index)[0];
                td.style.display = isShow;
            }
            return this;
        },
        /**
         * 设置要显示那些列
         * @param  {Array} columns 要显示的列名称数组
         * @return {None}         无返回
         */
        showColumn: function(columns){
            if (!columns){
                // 全显示
                this.head.find('>tr>th').css('display', '');
                this.body.find('>tr>td').css('display', '');
                this.updateScroll();
                return;
            }

            var sets = [];
            var cols = this.cols;
            var col;
            for (var i=0; i<cols.length; i++){
                col = cols[i];
                if (col.forceHide){
                    sets[i] = 'none';
                    continue;
                }
                switch (col.type){
                    case 'id':
                    case 'index':
                    case 'fixed':
                    case "control":
                    case 'select':
                    case 'op':
                        sets[i] = '';
                        break;
                    default:
                        col.hide = (columns.indexOf(col.name) == -1);
                        sets[i] = col.hide ? 'none' : '';
                        break;
                }
            }

            // 计算需要交换顺序的操作
            var sorts = _gen_sort(cols, columns);

            // 更新表头
            var tds = this.head.find('>tr>th');
            for (i=0; i<tds.length; i++){
                tds[i].style.display = sets[i];
            }
            // 排列Element
            _do_sort_element(sorts, tds, 'data-col');

            // 更新列表记录
            var rows = this.body.children('tr[data-type=row]');
            var row;
            for (var j=0; j<rows.length; j++){
                row = rows.eq(j);
                tds = row.children();
                for (i=0; i<tds.length; i++){
                    tds[i].style.display = sets[i];
                }
                // 排列Element
                _do_sort_element(sorts, tds);
            }
            this.updateScroll();
        },
        /**
         * 更新指定列数配置
         * @param  {Number} index 列配置索引号
         * @param  {Object} col   列配置对象
         * @return {Boolean}      操作结果
         */
        updateColumn: function(index, col){
            var cols = this.cols;
            if (!cols[index]){
                app.error('Miss Column Config');
                return false;
            }
            cols[index] = this.formatCol(col);

            // 处理选择事件
            var lastSelect = this.$hasSelect;
            this.$hasSelect = false;
            for (var i=0; i<cols.length; i++){
                if (cols[i].type === 'select'){
                    this.$hasSelect = true;
                    break;
                }
            }
            if (lastSelect != this.hasSelect){
                if (lastSelect){
                    this.body.unbind('change', this.eventSelectChange);
                }else {
                    this.dg(this.body, 'input[data-select]', 'change', 'eventSelectChange');
                }
            }

            // 修改Head的单元
            var cell = this.head.find('th[data-col='+index+']');
            if (cell.length){
                cell.unbind('click', this.clickOpHeader).empty();
                this.buildHeadCell(cell, cols[index]);
            }

            // 更新列表单元
            this.updateColumnByIndex(index);
            return true;
        },
        /**
         * 跟新指定索引的列数据
         * @param  {String} type 类型字符串
         * @return {None}      无返回
         */
        updateColumnByIndex: function(index){
            var data = this.$data;
            var rows = this.rows;
            var col = this.cols[index];
            var td;

            if (!col){ return false; }

            for (var i=0; i<rows.length && i<data.length; i++){
                td = rows[i].children().eq(index);
                this.buildCell(td, col, {
                    'id': i,
                    'dat': data[i],
                    'sub': true
                });
            }
            this.updateScroll();
        },
        /**
         * 更新指定名称的列
         * @param  {String} name 要更新的列名称
         * @return {Module}      返回当前模块实例
         */
        updateColumnByName: function(name){
            var index = util.index(this.cols, name, 'name');
            if (index !== null){
                this.updateColumnByIndex(index);
            }
            return this;
        },
        /**
         * 跟新指定类型的列数据
         * @param  {String} type 类型字符串
         * @return {None}      无返回
         */
        updateColumnType: function(type){
            var data = this.$data;
            var cols = this.cols;
            var env, col, tds;

            for (var i=0; i<this.rows.length && i<data.length; i++){
                tds = this.rows[i].children();
                env = {
                    'id': i,
                    'dat': data[i],
                    'sub': true,
                    'func': true
                };

                // 生成单元格
                for (var c=0; c<cols.length; c++){
                    col = cols[c];
                    if (col.type != type){
                        continue;
                    }
                    this.buildCell(tds.eq(c), col, env);
                }
            }
            this.updateScroll();
        },
        /**
         * 切换行选中效果
         * @param {Number} id    选中的数据id
         * @param {String} selectedClass   选中的class名称
         */
        setRowHighlight: function(id, selectedClass) {
            if (id) {
                this.setSelectedRowHighlight(id, selectedClass);
                if (util.index(this.$highlightIds, id) === null) {
                    this.$highlightIds.push(id);
                }
            }
        },
        /**
         * 设置有选择框的选中行选中效果
         * @param {Number} id    选中的数据id
         * @param {String} selectedClass   选中的class名称
         */
        setSelectedRowHighlight: function(id, selectedClass) {
            if (id) {
                var index = this.findIndex(id);
                var	row = this.rows[index];
                if (row) {
                    row.addClass(selectedClass || this.config.highlightClassName);
                }
            }
        },
        /**
         * 取消行选中效果
         * @param {Number} id    选中的数据id
         * @param {String} selectedClass   选中的class名称
         */
        unsetRowHighlight: function(id, selectedClass) {
            if (id) {
                this.unsetSelectedRowHighlight(id, selectedClass);
                util.remove(this.$highlightIds, id);
            }
        },
        /**
         * 取消有选择框的选中行选中效果
         * @param {Number} id    选中的数据id
         * @param {String} selectedClass   选中的class名称
         */
        unsetSelectedRowHighlight: function(id, selectedClass) {
            if (id) {
                var index = this.findIndex(id);
                var	row = this.rows[index];
                if (row) {
                    row.removeClass(selectedClass || this.config.highlightClassName);
                }
            }
        },
        /**
         * 去除行选中效果
         * @return {Undefined}    无
         */
        resetRowHighlight: function() {
            var cn = this.config.highlightClassName;
            this.body.find('.'+cn).removeClass(cn);
            this.$highlightIds = [];
        },
        /**
         * 判断是否要添加高亮效果
         * @param {Object} row 行对象
         * @param {Number} id  数据id
         */
        _addRowHighlight: function(row, id) {
            if (!row) {
                return false;
            }
            if (this.$highlightIds.length && util.index(this.$highlightIds, id) !== null) {
                row.addClass(this.config.highlightClassName);
            } else {
                row.removeClass(this.config.highlightClassName);
            }
        },
        /**
         * 收起子表格事件回调函数
         */
        clickCollapse: function(evt, elm){
            var row = $(elm).closest('tr').hide();
            row.prev().find(subGridConSelector+' > div.act').removeClass('act');
            return false;
        },
        showSubRow: function(index, collapse){
            var row = this.rows[index];
            if (!row){ return false; }

            var div, sub = row.next();
            if (sub.attr('data-type') !== 'sub'){
                var cols = row.children().length;
                sub = $('<tr class="'+this.config.subClass+'" data-type="sub"/>');
                sub.append('<td colspan="'+cols+'"><div class="con"><div class="subgrid" /></div><div class="bg" /></td>');
                row.after(sub);
                div = sub.find('div.subgrid:first');
                div.before('<em class="arrow" /><em class="collapse">'+LANG("收起")+'</em>');
                row = div.parent();
                this.$subs_div.push(row[0]);
                // 绑定收起事件
                this.jq(row.find('.collapse'), 'click', 'clickCollapse');
            }else {
                sub.css('display', '');
                div = sub.find('div.subgrid:first');
                row = div.parent();
            }
            var pos = -this.table.css('marginLeft').slice(0,-2) || 0;
            row.toggleClass('show_collapse', !!collapse).css('marginLeft', pos);
            div.width(this.el.width() - 20);

            return {row: sub, div: div};
        },
        hideSubRow: function(index){
            var row = this.rows[index];
            if (row){
                var sub = row.next();
                if (sub.attr('data-type') === 'sub'){
                    sub.hide();
                    return sub;
                }
            }
            return false;
        },
        toggleSubRow: function(index){
            var row = this.rows[index];
            if (row){
                var sub = row.next();
                if (sub.attr('data-type') === 'sub'){
                    if (sub.css('display') === 'none'){
                        sub.css('display', '');
                        return true; // 显示
                    }else {
                        sub.hide();
                        return false;
                    }
                }
            }
            return null;
        },
        /**
         * 获取指定索引或指定数值的行对象
         * @param  {Mix}    val   行索引或值
         * @param  {String} field 数据键
         * @return {Object}       行对象或null
         */
        getRow:function(val,field){
            if(field){
                val = this.findIndex(val,field);
            }
            return this.rows[val] || null;
        }
    });
    exports.list = List;

    /**
     * 批量操作
     * @event batchItemClick
     */
    var Batch = app.extend(
        view.container
        ,{
            init:function(config){
                config = $.extend(
                    {
                        "class":"M-tableBatch"
                        // "list":[{"type":"","name":""/*,noData:1,mode:"def|pop|lpop"*/},..]
                        ,"list":null
                        ,"listNode":"ul"
                        ,"title":LANG("批量操作")
                        // 弹出层的相应设置
                        ,"popwin":{
                        "normal":{
                            "mask":0
                            ,"width":740
                            ,"close":null
                            ,"silence":false
                            ,"bodyClass":"M-popwinBatchBody"
                        }
                        ,"small":{
                            "mask":0
                            ,"width":400
                            ,"close":null
                            ,"silence":false
                            ,"bodyClass":"M-popwinBatchBody"
                        }
                        ,"large":{
                            "mask":0
                            ,"width":945
                            // ,"close":null
                            ,"silence":false
                            ,"bodyClass":"M-popwinBatchBody"
                        }
                    }
                        // 是否启用
                        ,"enable":true
                    }
                    ,config
                );
                Batch.master(this,null,config);
                Batch.master(this,"init",[config]);

                if(util.isArray(config.list)){
                    for(var i = 0,len = config.list.length;i<len;i++){
                        if(!config.list[i]){
                            config.list.splice(i,1);
                            len = config.list.length;
                            i--;
                        }
                    }
                }

                // 每个项目的配置
                this.$iConf = {};

                // 当前打开的弹出层
                this.$nowPop = null;

                // 当前弹出层的配置对象
                this.$nowPopConf = null;

                // 弹出层内部模块对象集
                this.$popInner = {};

                // 当前弹出层内部高度
                this.$popInnerHeight = 0;

                // 计时器
                this.$timer = null;

                // 计时器延迟
                this.$delay = 300;

                this.build();
            }
            /**
             * 监控弹出层状态
             * @param  {Bool}      status 监控状态
             * @return {Undefined}        无返回值
             */
            ,watchPop:function(status){
                if(!this.$nowPop){
                    status = false;
                }
                if(status){
                    this.setTimeout(function(){
                        var h = this.$nowPop.getArea("body").height();
                        if(this.$popInnerHeight && this.$popInnerHeight < h){
                            // 有记录了高度才比较
                            this.$nowPop.onSizeChange();
                        }else{
                            // 没有则记录起来下次对比
                            this.$popInnerHeight = h;
                        }
                        this.watchPop(1);
                    },this.$delay);
                }else if(this.$timer){
                    // 重置
                    this.$popInnerHeight = 0;
                    clearTimeout(this.$timer);
                }
            }
            /**
             * 构建显示界面
             * @return {Undefined} 无返回值
             */
            ,build:function(){
                var list = this.config.list;
                for(var i = 0;i<list.length;i++){
                    if(list[i].subs){
                        for(var j = 0,l = list[i].subs.length;j<l;j++){
                            this.$iConf[list[i].subs[j].type] = list[i].subs[j];
                        }
                    }else{
                        this.$iConf[list[i].type] = list[i];
                    }
                }
                this.create(
                    "list"
                    ,common.dropdownMenu
                    ,{
                        "target":this.el
                        ,"no_state":true
                        ,"width":90
                        ,"height":25
                        ,"option_width":140
                        ,"line_height":30
                        ,"options":list
                        ,"def":this.config.title
                    }
                );
                list = null;
            }
            /**
             * 下拉列表点击响应函数
             * @param  {Object} ev 消息对象
             * @return {Bool}      false
             */
            ,onOptionChange:function(ev){
                if(this.$nowPop){
                    this.$nowPop.hide();
                }
                var conf = this.$iConf[ev.param.id];
                switch(conf.mode){
                    case "spop":
                        Batch.self(this,"buildPop","small",conf);
                        break;

                    case "pop":
                        Batch.self(this,"buildPop","normal",conf);
                        break;

                    case "lpop":
                        Batch.self(this,"buildPop","large",conf);
                        break;

                    default:
                        this.fireMsg(
                            ev.param.id
                            ,{
                                "type":ev.param.id
                                ,"option":ev.param.option
                                ,"fireType":"batchConfirm"
                            }
                        );
                }
                conf = null;
                return false;
            }
            /**
             * 发送消息
             * @param  {String} type 批量处理类型
             * @param  {Object} key  附加信息对象
             * @return {Object}      模块实例
             */
            ,fireMsg:function(type,key,fireType){
                if(!this.$iConf[type].noData){
                    // 需要获取相关数据的场景
                    key.fireType = fireType;
                    this.fire(
                        "getData"
                        ,{
                            "action":"getSelectRowId"
                            ,"key":key
                        }
                    );
                }else{
                    // 直接返回操作类型的场景
                    this.doBatch(
                        {
                            "type":type
                            ,"data":null
                        }
                        ,fireType
                    );
                }
                return this;
            }
            /**
             * 向表格获取数据的回调函数
             * @param  {Object} ev 消息对象
             * @return {Bool}      false
             */
            ,onGridData:function(ev){
                this.doBatch(
                    {
                        "type":ev.param.key.type
                        ,"data":ev.param.data
                        // 批量操作选项的数据
                        ,"batchData":ev.param.key
                    }
                    ,ev.param.key.fireType
                );
                ev = null;
                return false;
            }
            /**
             * 操作结果的统一发送接口
             * @param  {Object}    data 要发送到数据
             * @return {Undefined}      无返回值
             */
            ,doBatch:function(data,type){
                type = type || "batchConfirm";
                this.fire(type,data);
            }
            /**
             * 设定弹出层内部显示
             * @param  {Object} pop  弹出层对象
             * @param  {Object} conf 批量操作配置
             * @return {Obecjt}      弹出层对象
             */
            ,setPopInner:function(pop,conf){
                var body = pop.getArea("body");
                body.children().hide();

                // 标题
                // 为了防止某些模块因为容器未显示而导致渲染错误，
                // 这里需要先把弹出层显示出来
                pop.changeTitle(conf.text).show();
                // 区域Dom缓存
                pop.area = pop.area || {};

                if(!pop.area[conf.type]){
                    var htm;
                    if(conf.html){
                        htm = conf.html;
                    }else if(conf.render){
                        var render;
                        // 渲染函数
                        if(util.isFunc(conf.render)){
                            render = conf.render;
                        }else if(util.isString(conf.render) && util.isFunc(this.parent()[conf.render])){
                            // 是字符串则尝试在父层找
                            render = this.parent()[conf.render];
                        }

                        if(render){
                            // 如果render是字符串形式的，作用域默认是上层的grid模块，否则则是弹出层
                            htm = render.call(
                                conf.context || util.isString(conf.render) && this.parent() || pop
                                ,conf
                                ,body
                            );
                        }
                        render = null;
                    }
                    pop.area[conf.type] = $(htm);
                    htm = null;
                }

                if(this.$popInner[conf.type]){
                    pop.area[conf.type].show();
                }else{
                    body.append(pop.area[conf.type]);
                    this.$popInner[conf.type] = 1;
                }
                body = null;

                return pop;
            }
            /**
             * 弹出层确认
             * @param  {Object} ev 消息对象
             * @return {Bool}      false
             */
            ,onPopOk:function(ev){
                this.fireMsg(
                    this.$nowPopConf.type
                    ,{
                        "type":this.$nowPopConf.type
                        ,"option":this.$nowPopConf
                        ,"area":ev.from.area[this.$nowPopConf.type]
                    }
                    ,"batchConfirm"
                );
                this.$nowPopConf = null;
                this.watchPop(0);
                return false;
            }
            /**
             * 弹出层取消
             * @param  {Object} ev 消息对象
             * @return {Bool}      false
             */
            ,onPopCancel:function(ev){
                this.fireMsg(
                    this.$nowPopConf.type
                    ,{
                        "type":this.$nowPopConf.type
                        ,"option":this.$nowPopConf
                        ,"area":ev.from.area[this.$nowPopConf.type]
                    }
                    ,"batchCancel"
                );
                this.$nowPopConf = null;
                this.watchPop(0);
                return false;
            }
            ,onContainerShow:function(ev){
                return false;
            }
            ,disable: function(disabled){
                var list = this.get('list');
                if (list){
                    list.disable(disabled);
                }
                return this;
            }
            ,setTip: function(text){
                this.$tip_text = text;
                var el = this.el;
                el.unbind('mouseenter mouseleave');
                if (text){
                    this.jq(el, 'mouseenter mouseleave', 'eventToggleTip');
                }
                return this;
            }
            ,eventToggleTip:function(ev){
                var tip = this.get('tip');
                if(ev.type === "mouseenter"){
                    if(!tip){
                        tip = this.create("tip", popwin.tip, {
                            "data":this.$tip_text
                            ,"anchor":$(ev.target)
                            ,"width":140
                            ,"pos":"tm"
                            ,"autoHide":1
                            ,"outerHide":1
                        });
                    }else {
                        tip.reload({
                            "data":this.$tip_text
                            ,"anchor":$(ev.target)
                        });
                    }
                    tip.show();
                }else{
                    if(tip){
                        tip.hide();
                    }
                }
            }
        }
        ,{
            /**
             * 构造弹出层
             * @param   {String} type 弹出层类型
             * @param   {Object} conf 弹出层配置
             * @return  {Object}      模块实例
             * @private
             */
            buildPop:function(type,conf){
                this.$nowPopConf = conf;
                var pop;
                if(!this.$[type] && this.config.popwin[type]){
                    /*conf = $.extend(
                     conf
                     ,this.config.popwin[type]
                     );*/
                    pop = this.create(
                        type
                        ,popwin.base
                        ,this.config.popwin[type]
                    );
                }else{
                    pop = this.$[type];
                }
                this.setPopInner(pop,conf);
                conf = null;
                this.$nowPop = pop;
                this.watchPop(1);
                return pop;
            }
        }
    );

    exports.batch = Batch;
});