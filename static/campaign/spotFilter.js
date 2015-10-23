define(function(require, exports){
    var $ = require("jquery")
        ,app = require("app")
        ,view = require("view")
        ,trigger = require('trigger')
        ,grid = require("grid")
        ,adminGrid = require("grid/admin")
        ,form = require("form")
        ,popwin = require("popwin")
        ,common = require("common")
        ,util = require('util')
        ,country = require('country')
        ,table = require('grid/table')
        ,labels = require('grid/labels');

    var DEFAULT_ADXID = app.config('exchanges')[0].id;

    // 展现形式选择
    var ShowType = app.extend(view.container, {
        init: function(config, parent){
            config = $.extend(true, {
                'target': parent,
                'class': 'P-campaignShowType',
                'data': null,
                'list': null,
                'readonly': false,
                'auto_load': true,
                'url': '/rest/listviewtype',
                'param': null,
                'key': 'Id',
                'name': 'Name',
                'hasLoading': false,
                'layout': {
                    'type': form.item,
                    'label': LANG('展现形式：')
                }
            }, config);

            ShowType.master(this, null, config);
            ShowType.master(this, 'init', arguments);

            this.$ready = false;
            this.$list = config.list;
            this.$data = config.data;
            this.build();
        },
        build: function(){
            if (this.$ready){ return this; }
            var c = this.config;
            var el = this.el;

            var doms = this.doms = {
                list: $('<div/>').css('min-height',20).appendTo(el)
            };
            // 创建布局
            c.layout.el = el;
            this.create('layout', c.layout.type, c.layout);

            this.$ready = true;

            // 创建选项
            if (this.$list){
                this.setList(this.$list);
            }else if (c.auto_load) {
                this.load();
            }

            // 绑定事件
            this.dg(doms.list, 'input:checkbox', 'change', 'eventChange');
        },
        buildItem: function(){
            var c = this.config;
            var con = this.doms.list;
            con.empty();
            util.each(this.$list, function(item){
                var dom = $('<label />').appendTo(con);
                $('<input type="checkbox" />').prop('disabled', c.readonly).val(item[c.key]).appendTo(dom);
                $('<span/>').text(item[c.name]).appendTo(dom);
            });
        },
        eventChange: function(evt, elm){
            var id = +elm.value;
            if (elm.checked){
                var data = this.$data || [];
                data.push(id);
                util.unique(data);
                this.$data = data;
            }else {
                util.remove(this.$data, id);
            }
            this.fire('checkboxChange', this.$data);
            return false;
        },
        setParam: function(param){
            var c = this.config;
            c.param = $.extend(c.param, param);
            return this;
        },
        // 加载选项列表数据
        load: function(){
            var c = this.config;
            this.$list = null;
            if(c.hasLoading){
                this.showLoading();
            }
            app.data.get(c.url, c.param, this);
            return this;
        },
        onData: function(err, data){
            if(this.config.hasLoading){
                this.hideLoading();
            }

            if (err){
                app.error(err);
            }else {
                this.setList(data.items);
            }
            this.fire('dataLoaded');
        },
        // 设置选中值
        setData: function(data){
            this.$data = data;
            if (this.$ready && this.$list){
                var inputs = this.doms.list.find('input:checkbox');
                if (data === null){
                    inputs.prop('checked', true);
                    this.$data = data = [];
                    var key = this.config.key;
                    util.each(this.$list, function(item){
                        data.push(item[key]);
                    });
                }else {
                    inputs.prop('checked', false);
                    util.each(data, function(id){
                        var input = inputs.filter('[value="'+id+'"]');
                        if (input.length){
                            input.prop('checked', true);
                        }else {
                            return null; // 不存在的ID, 删除
                        }
                    });
                }
            }
            return this;
        },
        getData: function(){
            return this.$data || [];
        },
        // 设置列表选项
        setList: function(list){
            this.$list = list;
            if (this.$ready){
                this.buildItem();
                this.setData(this.$data);
            }
            return this;
        },
        showLoading: function() {
            var con = this.el.find('div:first');
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

    // 广告位尺寸选择模块
    var SizeGrid = app.extend(view.container,{
        init:function(config,parent){
            config = $.extend(
                {
                    "total":{
                        "cols":[
                            {type:"select",all:true,width:50}
                            ,{type:"id",width:50}
                            ,{name:"Name",text:LANG("尺寸"),align:"center"}
                            ,{name:"Request",text:LANG("竞价次数"),render:"renderGraph"}
                            ,{name:"click_rate",text:LANG("平均点击率"),width:100,align:"center",format:labels.format.rate}
                        ],
                        "scroll_type": "row",
                        "scroll_size": 10,
                        "key":"Id"
                    }
                    ,"filter":{
                    "cols":[
                        {type:"id",width:50}
                        ,{name:"Name",text:LANG("尺寸"),type:"index",align:"center"}
                        ,{name:"Request",text:LANG("竞价次数"),render:"renderGraph"}
                        ,{name:"click_rate",text:LANG("平均点击率"),width:100,align:"center",format:labels.format.rate}
                        ,{type:"op", html:'<a data-op="remove" title="'+LANG("删除此条记录")+'">'+LANG("删除")+'</a>'}
                    ],
                    "opClick": true,
                    "scroll_type": "row",
                    "scroll_size": 10,
                    "key":"Id"
                }
                    ,"target":parent
                    ,'readonly': false
                    ,'auto_load': true
                    ,"class":"P-campaignPositionAttr"
                    ,"url":"/rest/listpositionsize"
                    ,"param":{
                    "order":"Request|-1"
                    ,"no_limit":1
                    ,"NoItems":0
                }
                }
                ,config
            );
            SizeGrid.master(this,null,config);
            SizeGrid.master(this,"init",arguments);

            //计算曝光量总数
            this.$sum = 0;

            //总数据
            this.$listData = null;

            //已勾选数据
            this.$data = null;

            //选中记录的id号
            this.$ids = []

            this.$cacheAttr = {};
            this.$channel = 0;

            // 延迟Reset回调ID
            this.$reset_tid = 0;

            this.$ready = false;

            this.build();
        }
        ,build:function(){
            if (this.$ready) { return false; }
            var c = this.config;

            //标题-广告位属性
            if(c.label){
                $('<div class="P-campaignPositionTitle"/>').text(c.label).appendTo(this.el);
            }

            if (c.readonly){
                c.total.cols[0].readonly = true;
                c.filter.cols.pop();
            }

            var conAll = $("<div class='all' />").appendTo(this.el);
            var conSelected =$("<div class='selected' />").appendTo(this.el);

            $("<p class='subTitle'/>").text(LANG("全部尺寸：")).appendTo(conAll);
            c.total.target = conAll;

            this.create('listTotal',table.list,c.total);

            $("<p class='subTitle'/>").text(LANG("已选尺寸：")).appendTo(conSelected);
            c.filter.target = conSelected;
            this.create('listFilter',table.list,c.filter);

            this.$ready = true;
            if(this.$listData){
                this.setListData(this.$listData);
            }
        }
        // 切换RTB渠道
        ,switchChannel: function(exchange_id){
            if (exchange_id && this.$channel !== exchange_id){
                //设置新渠道的值，无缓存值则设空
                this.$channel = exchange_id;
                if (this.config.auto_load) {
                    this.load();
                }
            }
            return this;
        }
        ,setParam:function(param){
            this.config.param = $.extend(this.config.param,param);
            return this;
        }
        ,load:function(){
            this.$listData = null;
            var c = this.config;
            this.$.listTotal.showLoading();
            if (this.$requestID){
                app.data.abort(this.$requestID);
            }
            c.param.AdxId = this.$channel;
            this.$requestID = app.data.get(
                c.url,
                c.param,
                this
            );
            return this;
        }
        ,onListOpClick:function(ev){
            //删除单条记录
            var index = ev.param.index;
            this.$.listFilter.removeRow(index);

            //更新this.$ids的值
            var listData = this.$.listFilter.getData();
            var ids = this.$ids = [];
            util.each(listData, function(size){
                ids.push(size.Id);
            });

            //更新表格的勾选状态
            this.$.listTotal.setSelectRowIds(ids);
            // 发送消息
            this.dataChange(ids);
            ids = null;
            return false;
        }
        ,onData:function(err,data){
            this.$.listTotal.hideLoading();
            if(err){
                app.error(err);
                return false;
            }

            //总列表添加数据
            this.setListData(data.items);
        }
        /**
         * 勾选事件 -添加选择的行
         * @param  {Object} ev  事件对象
         */
        ,onChangeSelect:function(ev){
            //总数据
            var data = this.$listData;
            var ids = this.$ids = ev.param.selected;
            var arr = [];

            util.each(ids, function(id){
                if (data[id]){
                    arr.push(data[id]);
                }
            });

            this.$.listFilter.setData(arr);

            this.dataChange(ids);

            ids = null;
            return false;
        }
        /**
         * 发送数据改变的消息
         * @param  {String} ids 改变的id列表
         * @return {Object}     模块实例
         */
        ,dataChange:function(ids){
            this.fire(
                "adSizeChange"
                ,{
                    "ids":ids
                }
            );
            ids = null;
            return this;
        }
        ,onChangeSort: function(ev){
            var field = ev.param.sort;
            var order = (ev.param.order == 'asc');

            function sort_cb(a, b){
                a = a[field] || 0;
                b = b[field] || 0;
                var c = 0;
                if (a > b){
                    c = 1;
                }else if (a < b){
                    c = -1;
                }
                return order ? c : -c;
            }

            var list, mod = ev.from;
            if (mod == this.$.listTotal){
                list = [];
                util.each(this.$listData, function(item){
                    list.push(item);
                });
            }else {
                list = mod.getData();
            }
            if (list && list.length){
                list.sort(sort_cb);
                mod.setData(list);
            }
            return false;
        }
        ,renderGraph:function(i,val){
            //若返回的是字符串，如"199,123"
            //若返回的是数字， 如"0"
            var value ;
            if(util.isString(val) && val.indexOf(',')!== -1){
                value = val.replace(',','');
            }else{
                value = +val;
            }
            var ratio = Number(value/this.$sum *100).toFixed(2)+'%';
            var con = $('<div class="P-campaignPositionAttrBar"/>');
            //数值
            $('<p/>').text(val).appendTo(con);
            //条状图
            $('<i/>').width(ratio).appendTo(con);
            return con;
        }
        ,showResultList: function(){
            var all = this.$listData;
            var data = this.$data;
            if (all){
                var list = [];
                var ids = [];
                util.each(data, function(id){
                    if (all[id]){
                        list.push(all[id]);
                        ids.push(id);
                    }
                });
                this.$ids = ids;
                this.$.listTotal.setSelectRowIds(ids);
                this.$.listFilter.setData(list);
            }
        }
        // 设置详细广告位列表
        ,setListData: function(data){
            this.$listData = data;
            if(!this.$ready){return;}

            //计算曝光量总数, 转换列表
            var list = {};
            var sum = 0;
            util.each(data, function(spot){
                sum += spot.Request || 0;
                list[spot.Id] = spot;
            });
            this.$sum = sum;
            this.$listData = list;
            this.$.listTotal.setData(data);

            // 显示选中的记录
            this.showResultList();
            this.fire('dataLoaded', data);
        }
        ,getData: function(){
            var data = this.$.listFilter.getData();
            var list = [];
            util.each(data, function(size){
                list.push(size.Id);
            });
            this.$data = list;
            return list;
        }
        ,setData: function(data){
            if (this.$reset_tid){
                clearTimeout(this.$reset_tid);
                this.$reset_tid = 0;
            }
            this.$data = data;
            if(!this.$ready){return;}

            //右边表格setData
            this.showResultList();
            return this;
        }
        ,reset: function(){
            var me = this;
            me.$.listFilter.setData([]);
            me.$ids = [];
            me.$data = null;
            me.$cacheAttr = {};
            me.$reset_tid = setTimeout(function(){
                me.$reset_tid = 0;
                if (me.$channel !== DEFAULT_ADXID){
                    me.$channel = DEFAULT_ADXID;
                    me.$listData = null;
                    me.$.listTotal.setData([]);
                    me.load();
                }else {
                    me.$.listTotal.setSelectRowIds([]);
                }
            },100);
        }
    });

    // 附加广告位选择
    var SpotGrid = app.extend(view.container, {
        init: function(config, parent){
            config = $.extend(true, {
                'target': parent,
                'readonly': false,
                'class': 'P-campaignPosition',
                'url': '/rest/listadposition',
                'param': null,
                'auto_load': true,
                'url_info': '/rest/listadsinfo',
                'noExport': false
            }, config);
            SpotGrid.master(this, null, config);

            this.$trigger = new trigger(this, [
                {name:'Reset', signals:'reset', event:'triggerReset'},
                {name:'ResetCache', signals:'*channel,*param,*reset', state:1, event:'triggerResetCache'},
                {name:'LoadGrid', signals:'*channel,*param,*showSel', event:'triggerLoadGrid'},
                {name:'LoadSelect', signals:'@LoadGrid,@ResetCache,*channel,*param,*selects', event:'triggerLoadSelect'},
                {name:'SetSelect', signals:'@LoadSelect,*channel,*param,*selects', state:1, event:'triggerSetSelect'},
                {name:'LoadAll', signals:'*selectall,*selectinvert', event:'triggerLoadAll'},
                {name:'SetSelectAll', signals:'@LoadAll,selectall', event:'triggerSetSelectAll'},
                {name:'SetSelectInvert', signals:'@SetSelect,@LoadAll,selectinvert', event:'triggerSelectInvert'}
            ]);

            // 默认参数
            this.$param = config.param ? $.extend({}, config.param) : null;

            // 当前数据
            this.$data = null;
            this.$cache = {};
            this.$allCache = null;
            this.$allTimer = 0;

            //被排除的广告位
            this.$data_cache = {};
            this.$position_cache = {};
            this.$channel = 0;

            // 构建显示布局
            this.build();
        },
        build: function(){
            var self = this;
            var c = self.config;
            var con = self.el;
            var doms = self.doms = {};
            self.render();

            //插入'显示已选'复选框
            doms.checkbox = $('<label class="P-campaignPositionListOp"><input type="checkbox"> '+LANG('显示已选')+'</label>').appendTo(con).find('input');
            //对$checkbox绑定触发选择'显示已选'功能的事件
            self.jq(doms.checkbox,'click','eventSwitchShowSeleted');

            // 广告位列表
            self.create('list', grid.rtbAdPosition, {
                'target': con,
                'readonly': c.readonly,
                'list':{'rowSelect':!c.readonly},
                'auto_load': false,
                'sort':"Request",
                'order':'desc'
            });

            // 选中的广告位列表
            var dom = doms.select_title = $('<div class="P-campaignPositionListTitle"/>').appendTo(con);
            doms.select_con = $('<div class="P-campaignPositionListCon"/>').appendTo(con);
            doms.select_list = $('<ul/>').appendTo(doms.select_con);
            doms.select_con.append('<div class="clear"/>');
            doms.empty = $('<div class="P-campaignPositionListEmpty"/>').text(LANG('请选择至少一个广告位')).appendTo(doms.select_con);

            // 全选所有广告位和清空广告位
            dom.text(LANG('已选择广告位'));
            if (!c.noExport){
                $('<input type="button" class="btn" data-action="batch"/>').val(LANG('批量导出')).appendTo(dom);
                $('<input type="button" class="btn" data-action="import"/>').val(LANG('批量导入')).appendTo(dom);
            }
            $('<input type="button" class="btn" data-action="select-invert"/>').val(LANG('反选')).appendTo(dom);
            $('<input type="button" class="btn" data-action="select-all"/>').val(LANG('全选所有')).appendTo(dom);
            $('<input type="button" class="btn" data-action="clear"/>').val(LANG('清空')).appendTo(dom);

            self.dg(dom, 'input[data-action]', 'click', 'eventButtonAction');
            self.dg(doms.select_list, 'li', 'click', 'eventRemoveItem');
            doms.buttons = dom.find('input[data-action]');

            if (c.auto_load){
                self.load();
            }
        },
        buildItem: function(item){
            var elm = $('<li/>').appendTo(this.doms.select_list);
            elm.text(item.Name).attr('data-id', item._id).attr('title', LANG('点击移除广告位'));
            return elm;
        },

        triggerResetCache: function(param, reg){
            this.$data_cache = {};
            this.$allCache = null;
        },
        triggerLoadGrid: function(param, reg){
            // 加载Grid列表
            var req = $.extend({}, this.config.param);
            if (param.showSel){
                req.Ids = this.$trigger.getData('ackSelects') || '';
                req.NoItems = +!req.Ids;
            }else {
                req.NoItems = 0;
            }
            var list = this.get('list');
            list.setPage(1);
            list.setParam(req);
            list.load();
            return false;
        },
        onGridDataLoad: function(ev){
            this.$trigger.resolve('LoadGrid', ev.param);
            // 把最新的记录缓存起来
            var cache = this.$data_cache;
            var ts = util.time();
            util.each(ev.param, function(item){
                cache[item._id] = [ts, item];
            });
            return false;
        },
        triggerLoadSelect: function(param, reg){
            // 加载指定选择id的资料
            var sels = param['@LoadGrid'];
            if (!sels || !sels.length){
                return 1;
            }
            sels = param.selects;
            if (!sels || !sels.length){
                return 2;
            }

            // 检查缺少的ID
            var ids = [];
            var cache = this.$data_cache;
            var time = util.time() - (app.config('cache_timeout') || 600);
            util.each(sels, function(id){
                if (!cache[id] || cache[id][0] < time){
                    ids.push(id);
                }
            });
            if (ids.length){
                // 需要加载数据
                var c = this.config;
                app.data.get(
                    c.url,
                    $.extend({
                        'no_stastic_data':1,
                        'no_limit':1,
                        'Ids': ids.join(','),
                        'MFields': '_id,Name,Width,Height,AdxId'
                    }, c.param),
                    this, 'afterLoadSelect'
                );
                return false;
            }
            return 0;
        },
        afterLoadSelect: function(err, data){
            if (err){
                app.error(err);
                return false;
            }
            var cache = this.$data_cache;
            var ts = util.time();
            util.each(data.items, function(item){
                cache[item._id] = [ts, item];
            });
            this.$trigger.resolve('LoadSelect', 0);
        },
        triggerSetSelect: function(param, reg){
            // 设置列表选中, 生成已选广告位列表
            var sels = [];
            var doms = this.doms;
            doms.select_list.empty();

            if (param['@LoadSelect'] === 0){
                var cache = this.$data_cache;
                util.each(param.selects, function(id){
                    if (cache[id]){
                        this.buildItem(cache[id][1]);
                        sels.push(id);
                    }
                }, this);
            }
            doms.empty.toggle(sels.length === 0);
            this.$.list.setSelectRowIds(sels);
            this.$trigger.signal('ackSelects', sels.sort().toString(), true);
            this.fire('dataLoaded', sels);
        },
        triggerLoadAll: function(param, reg){
            var cache = this.$allCache;
            var ts = util.time();
            var to = ts - (app.config('cache_timeout') || 600);
            if (cache){
                if (to > this.$allTimer){
                    cache = null
                }
            }
            if (cache){
                return 1;
            }

            this.$allCache = cache;
            this.$allTimer = ts;
            this.doms.buttons.prop('disabled', true);
            var c = this.config;
            app.data.get(
                c.url,
                $.extend({}, c.param, {
                    'no_stastic_data':1,
                    'no_limit':1,
                    'MFields': '_id,Name,Width,Height,AdxId'
                }),
                this, 'afterLoadAll'
            );
            return false;
        },
        afterLoadAll: function(err, data){
            this.doms.buttons.prop('disabled', false);
            if (err){
                app.error(err);
                return false;
            }
            this.$allCache = data.items;
            this.$trigger.resolve('LoadAll', 1);
        },
        triggerSetSelectAll: function(param, reg){
            var sels = [];
            util.each(this.$allCache, function(item){
                sels.push(item._id);
            });
            this.$trigger.signal('selects', sels);
        },
        triggerSelectInvert: function(param, reg){
            var list = ',' + this.$trigger.getData('ackSelects') + ',';
            var sels = [];
            util.each(this.$allCache, function(item){
                if (list.indexOf(','+item._id+',') != -1){ return; }
                sels.push(item._id);
            });
            this.$trigger.signal('selects', sels);
        },
        /**
         * 触发'显示全部已选广告位'
         * @param  {object} evt 事件对象
         * @param  {object} elm '显示已选'复选框
         */
        eventSwitchShowSeleted:function(evt,elm){
            //改变复选框状态
            this.$trigger.signal('showSel', elm.checked, true);
        },
        clearShowSelected: function(){
            this.doms.checkbox.prop('checked', false);
            this.$trigger.signal('showSel', false, true);
            return this;
        },
        /**
         * 点击已选中广告位标签删除广告位回调函数
         */
        eventRemoveItem: function(evt, elm){
            var id = $(elm).remove().attr('data-id');
            var sels = this.$trigger.getData('selects');
            if (util.remove(sels, id)){
                this.$trigger.signal('selects', sels);
            }
            return false;
        },
        /**
         * 选中广告位切换操作(全选/反选/清空)
         */
        eventButtonAction: function(evt, elm){
            var action = $(elm).attr('data-action');
            switch (action){
                case 'batch': // 导出
                    this.showExport();
                    break;
                case 'import': // 导入
                    this.showExport('import');
                    break;
                case 'clear':
                    // 清空选择
                    this.$trigger.signal('selects', []);
                    break;
                case 'select-all':
                    // 全选所有广告位
                    if (!confirm(LANG('确认要选择所有的广告位吗?'))){ break; }
                    this.$trigger.signal('selectall');
                    break;
                case 'select-invert':
                    // 反选广告位
                    if (!confirm(LANG('确认要反选所有的广告位吗?'))){ break; }
                    this.$trigger.signal('selectinvert');
                    break;
            }
        },
        /**
         * 选中广告位列表更新回调函数
         */
        onChangeSelect: function(ev){
            this.$trigger.signal('selects', ev.param.selected.slice());
            return false;
        },
        // 外部接口
        setData: function(data){
            this.$trigger.clear('Reset')
                .signal('selects', data || []);

            // 预先设置ackSelects，防止用户在表格还没加载完之前就选择“显示已选”的情况
            if(data && data.length){
                this.$trigger.setData('ackSelects', data.toString());
            }

            return this;
        },
        getData: function(){
            var actSels = this.$trigger.getData('ackSelects');
            return actSels && actSels.split(',') || [];
        },
        clear: function(){
            this.$trigger.clear()
                .setData('selects', [])
                .setData('blocks', [])
                .setData('ackSelects', '')
                .setData('actBlocks', '');
            this.$.list.setData([]);
            this.doms.select_list.empty();
            this.doms.empty.show();
        },
        /**
         * 设定附加广告位的表格请求参数
         * @param {Object} param 参数对象
         */
        setParam:function(param){
            var c = this.config;
            c.param = $.extend(c.param, param);
            if (c.auto_load){
                this.load();
            }
            // this.$trigger.signal('param', c.param);
            return this;
        },
        /**
         * 切换RTB渠道类型
         * @param  {Number} exchange_id 渠道ID
         * @return {None}
         */
        switchChannel: function(exchange_id){
            //更新渠道ID
            if (exchange_id != this.$channel){
                // 保存当前值
                this.$cache[this.$channel] = this.getData();
                // 设置缓存的值
                this.setData(this.$cache[exchange_id]);
                this.$channel = exchange_id;
                var c = this.config;
                c.param = $.extend(c.param, {'AdxId': exchange_id});

                if (c.auto_load){
                    this.load();
                    // this.$trigger.signal('channel', exchange_id, true);
                }
            }
            return this;
        },
        load: function(){
            var self = this;
            self.$trigger.signal('param', self.config.param)
                .signal('channel', self.$channel, true);
            return self;
        },


        /**
         * 重置控件模块状态
         * @return {None}
         */
        reset: function(){
            this.$trigger.clear().signal('reset');
        },
        triggerReset: function(param, reg){
            this.$cache = {};
            this.doms.checkbox.prop('checked', false);
            this.config.param = $.extend({}, this.$param);
            this.$trigger
                .signal('channel', DEFAULT_ADXID)
                .signal('param', this.config.param)
                .signal('selects', [])
                .signal('blocks', [])
                .signal('showSel', false);
        },

        // 显示导出广告位窗口
        showExport: function(isImport){
            var cache = this.$data_cache;
            var sels  = this.$.list.getSelectRowId();
            var code  = '';
            util.each(sels, function(id){
                var spot = cache[id];
                if (spot && spot[1]){
                    spot = spot[1];
                    code += [spot._id, spot.Width+'*'+spot.Height, spot.Name].join('\t\t') + '\n';
                }
            });

            var pop = this.get('export_win');
            if (!pop){
                pop = this.create('export_win', popwin.exportDlg);
            }
            // 如果是导入，清空原有值
            code = isImport ? '' : code;
            pop.setTitle(isImport).setData(code).show();
            return this;
        },
        /**
         * 导入完成消息
         * @param  {Object} ev 消息对象
         * @return {Bool}      false
         */
        onImportList: function(ev){
            // 导入操作时，会清空原有值；
            // 表格中已选中的广告位
            var sels  = this.$.list.getSelectRowId();
            // 弹出框填写的广告位
            var ids = ev.param.list;
            // 取以上两数组的并集
            ids = util.unique(sels.concat(ids));

            if (!ids.length){
                // 空数据导入
                this.$trigger.signal('selects', []);
            }else {
                var c = this.config;
                // 请求反推接口, 过滤有效广告位
                app.data.get(c.url_info, {
                    AdxId: this.$channel,
                    PositionIds: ids.join(',')
                }, this, 'afterImportList', [ids, ev.param.lines]);
            }
            return false;
        },
        afterImportList: function(err, data, param){
            if (err){
                app.error(err);
                return false;
            }
            var ids = param[0];
            var lines = param[1];
            var imports = data.position_ids || [];
            var self = this;

            // todo: 需要更换为反推接口的有效ID结果
            self.fire('importSpot', {
                siteclass: data.categories,
                sizes: data.sizes,
                spots: imports
            }, function(ev){
                if (ev.returnValue !== true){
                    self.$trigger.signal('selects', imports);
                }
            });

            // 过滤导入失败的广告位
            var list = [];
            util.each(ids, function(id, index){
                if (util.index(imports, id) === null){
                    list.push({text: lines[index]});
                }
            });

            if (list.length){
                self.create(
                    "failPop"
                    ,popwin.sysNotice
                    ,{
                        "data":{
                            "msg":LANG("以下广告位无法导入:")
                            ,"tip":list
                        }
                        ,"width":500
                        ,"type":"error"
                    }
                );
            }
        },
        /**
         * 导入广告位失败提示弹出层确定消息
         * @return {Bool} false
         */
        onSysNoticeOk:function(){
            return false;
        }
    });

    // 媒体域名
    var DomainGrid = app.extend(view.container, {
        init: function(config, parent){
            var self = this;
            config = $.extend(true, {
                'target': parent,
                'readonly': false,
                'url': '/rest/listpositiondomain'
            }, config);
            DomainGrid.master(self, null, config);
            DomainGrid.master(self, 'init', arguments);

            self.$trigger = new trigger(self, [
            ]);

            self.$callback = null;
            self.$value = null;
            self.$param = null;
            self.$allCache = null;
            self.$showSel = false;
            // 构建显示布局
            self.build();
            window.db = self;
        },
        build: function(){
            var self = this;
            var c = self.config;
            if (self.$ready){ return self; }
            self.$ready = true;

            self.el.css('position', 'relative');

            // 插入右侧容器
            var con = self.$rightCon = $('<div class="P-campaignPositionListOp" />').appendTo(self.el);
            con.append(
                '<label><input type="checkbox"> '+LANG('显示已选')+'</label>',
                '<button class="btn" data-action="allSel">'+LANG("全选")+'</button>',
                '<button class="btn" data-action="invSel">'+LANG("反选")+'</button>',
                '<button class="btn" data-action="export">'+LANG("批量导入/导出")+'</button>'
            );

            //插入'显示已选'复选框
            self.$checkbox = con.find('input:first');

            //对$checkbox绑定触发选择'显示已选'功能的事件
            self.jq(self.$checkbox,'change','eventSwitchShowSeleted');
            self.dg(con, 'button', 'click', 'eventButtonAction');

            self.create("grid", grid.websitesFilter, {
                "target": self.el,
                'readonly':c.readonly,
                'auto_load': false,
                'pager':{
                    'size': 10,
                    'sizeTypes': [10, 20, 0, 0]
                }
            });
        },
        setValue: function(value){
            // 过滤ID, 生成有效的ID列表
            var self = this;
            var all = self.$allCache;
            util.each(value, function(id){
                if (util.index(all, id) === null){
                    return null;
                }
            });
            self.$checkbox.prop('checked', false);
            self.$value = value;
            self.$.grid.setSelectRowIds(value);
            return self;
        },
        getValue: function(){
            return this.$.grid.getSelectRowId();
        },
        setParam: function(param){
            this.$.grid.setParam(param);
            this.$param = util.merge(this.$param, param);
            return this;
        },
        load: function(callback){
            var self = this;
            self.$wait = 2;
            self.$allCache = null;
            self.$callback = callback;
            self.$showSel = false;
            self.clearShowSelected();
            self.$.grid.load();

            // 拉取所有符合参数要求的域名ID
            if (self.$ajaxAll){
                app.data.abort(self.$ajaxAll);
            }
            self.$ajaxAll = app.data.get(
                self.config.url,
                $.extend({no_limit: 1, mfields: 'DomainHash'}, self.$param),
                this, 'afterLoadAllDomain'
            );
            return self;
        },
        afterLoadAllDomain: function(err, data){
            if (err){
                app.error(err);
            }else {
                this.$allCache = data.items;
            }
            this.runCallback();
        },
        onGridDataLoad: function(ev){
            this.runCallback();
            return false;
        },
        runCallback: function(){
            if (--this.$wait <= 0){
                if (this.$callback){
                    this.$callback();
                    this.$callback = null;
                }
            }
            return this;
        },
        onChangeSelect: function(ev){
            this.$value = ev.param.selected.slice();
            this.fire('domainChange', this.$value);
            return false;
        },
        eventSwitchShowSeleted: function(evt, elm){
            var grid = this.$.grid;
            var sels = this.$value;
            this.$showSel = elm.checked;
            if (elm.checked){
                sels = sels && sels.length ? sels.join() : 'none';
            }else {
                sels = null;
            }
            grid.setPage(1);
            grid.setParam({'SiteDomainIds': sels}).load();
        },
        clearShowSelected: function(){
            var self = this;
            self.$.grid.setParam({'SiteDomainIds': null});
            if (self.$showSel){
                self.$.grid.load();
                self.$showSel = false;
            }
            self.$checkbox.prop('checked', false);
            return self;
        },
        // 操作按钮事件
        eventButtonAction: function(evt, elm){
            var self = this;
            var tag = $(elm);

            switch (tag.attr("data-action")){
                case 'allSel': // 全选
                    app.confirm(LANG('确认要选择所有的网站域名吗?'), function(res){
                        if (res){
                            self.selectAllDomain();
                        }
                    });
                    break;
                case 'invSel': // 反选
                    app.confirm(LANG('确认要反选所有网站域名吗?'), function(res){
                        if (res){
                            self.selectInvertDomain();
                        }
                    });
                    break;
                case 'export':
                    self.showExport();
                    break;
            }
        },
        // 选择全选所有
        selectAllDomain: function(){
            var self = this;
            var ids = self.$allCache;
            if (ids){
                // 更新选中项目
                ids = ids.slice();
                self.$value = ids;
                self.$.grid.setSelectRowIds(ids);
                self.fire('domainChange', ids);
            }
            return self;
        },
        // 反选域名
        selectInvertDomain: function(){
            var self = this;
            if (self.$allCache){
                var last = self.$value;
                var sels = [];
                util.each(self.$allCache, function(id){
                    if (util.index(last, id) === null){
                        sels.push(id);
                    }
                });
                self.$value = sels;
                self.$.grid.setSelectRowIds(sels);
                self.fire('domainChange', sels);
            }
            return self;
        },
        // 导出或导入选中域名
        showExport: function(){
            var c   = this.config;
            var ids = this.$value;
            var btn = this.$rightCon.find('input[data-action="export"]');

            if (!ids || !ids.length){
                this.afterExportData(null, {}, btn);
                return this;
            }

            btn.prop('disabled', true);
            var param = $.extend({}, this.$param, {'SiteDomainIds': ids.toString(), 'no_limit': 1});
            app.data.get(c.url, param, this, 'afterExportData', btn);

            return this;
        },
        afterExportData: function(err, data, btn){
            btn.prop('disabled', false);
            if (err){
                app.error(err);
            }
            var code = '';
            util.each(data.items, function(domain){
                code += [
                        domain.DomainHash,
                        domain.SiteName,
                        domain.Domain,
                        domain.Thruput,
                        domain.Ip
                    ].join('\t\t') + '\n';
            });

            var pop = this.get('export_win');
            if (!pop){
                pop = this.create('export_win', popwin.exportDlg);
            }
            pop.setData(code).show();
        },
        onImportList: function(ev){
            this.setValue(ev.param.list);
            this.fire('domainChange', this.$value);
            return false;
        }
    });

    // 过滤项目标题布局
    var ItemLayout = app.extend(view.container, {
        init: function(config){
            config = $.extend(true, {
                'class': 'M-formItem',
                'label': '',
                'options': [],
                'target': parent,
                'tips': ''
            }, config);

            var self = this;
            ItemLayout.master(self, null, config);
            ItemLayout.master(self, 'init', arguments);

            self.$ready = false;
            self.$opts = {};
            self.$dirty = 0;
            self.build();
        },
        build: function(){
            var self = this;
            if (self.$ready){ return self; }
            self.$ready = true;

            var doms = self.doms = {
                label: $('<label class="M-formItemLabel"/>').appendTo(self.el),
                radios: $('<div class="M-formItemSwitch"/>').appendTo(self.el),
                container: $('<div class="M-formItemLayout"/>').appendTo(self.el)
            };
            $('<em class="clear"/>').appendTo(self.el);
            doms.label.text(self.config.label);
            var id = 'item_' + util.guid();
            var first = null;
            util.each(self.config.options, function(item){
                if (first === null){
                    first = item.id;
                }
                self.$opts[item.id] = $([
                    '<label>',
                    '<input type="radio" value="'+item.id+'" name="' + id +'">',
                    util.html(item.name),
                    '</label>'
                ].join('')).appendTo(doms.radios).find('input:radio:first');
            });

            self.setValue(first);
            self.dg(doms.radios, 'input', 'change', 'eventChange');
            if(self.config.tips){
                this.create('tips',common.tips,{
                    target: doms.radios,
                    tips:self.config.tips
                });
            }
            return self;
        },
        eventChange: function(){
            var id = this.getValue();
            this.doms.container.toggle(id > 0);
            this.fire('changeFilter', id);
        },
        setValue: function(id){
            var el = this.$opts[id];
            if (el){
                this.doms.radios.find('input:radio').prop('checked', false);
                el.prop('checked', true);
                this.doms.container.toggle(id > 0);
            }
            return this;
        },
        getValue: function(){
            return +this.doms.radios.find('input:checked:first').val() || 0;
        },
        getContainer: function(){
            return this.doms.container;
        },
        updateByList: function(list, update, skip){
            var id;
            if (update){
                id = (list && list.length ? 1 : 0);
                this.setValue(id);
            }else {
                id = this.getValue();
            }
            if (!skip){
                this.$dirty = !id;
            }
            return id;
        },
        isDirty: function(){
            if (this.$dirty){
                this.$dirty = 0;
                return 1;
            }else {
                return 0;
            }
        }
    });

    /**
     * RTB广告位选择模块
     */
    var MainForm = app.extend(view.container, {
        init: function(config, parent){
            config = $.extend(true, {
                'target': parent,
                'noSection': false,
                'noExport': false,
                'readonly': false
            }, config);
            MainForm.master(this, null, config);
            MainForm.master(this, 'init', arguments);

            this.$trigger = new trigger(this, [
                {name:'Reset', signals:'reset', event:'triggerReset'},
                {name:'Channel', signals:'channel', event:'triggerChannel'},
                {name:'Name', signals:'name', event:'triggerName'},
                {name:'WhiteBlackType', signals:'whiteBlackType', event:'triggerWhiteBlackType'},
                {name:'Remark', signals:'remark', event:'triggerRemark'},
                {name:'ViewType', signals:'@Channel,ackChannel', event:'triggerViewType'},
                {name:'SetViewType', signals:'@ViewType,viewtype', state:1, event:'triggerSetViewType'},
                {name:'SetScreen', signals:'screen,*ackChannel', state:1, event:'triggerSetScreen'},
                {name:'SiteClass', signals:'@SetViewType,$siteclass,*ackChannel', event:'triggerClass'},
                {name:'SetSiteClass', signals:'@SiteClass,siteclass', state:1, event:'triggerSetClass'},
                {name:'Domain', signals:'@SetSiteClass,$domain,*ackChannel,*ackViewType,*ackSiteClass', event:'triggerDomain'},
                {name:'SetDomain', signals:'@Domain,domain', state:1, event:'triggerSetDomain'},
                {name:'Size', signals:'@SetDomain,$spotsize,*ackChannel,*ackViewType,*ackSiteClass,*ackDomain', event:'triggerSize'},
                {name:'SetSize', signals:'@Size,spotsize', state:1, event:'triggerSetSize'},
                {name:'Spot', signals:'@SetSize,*ackChannel,*ackViewType,*ackScreen,*ackSiteClass,*ackDomain,*ackSpotSize', event:'triggerSpot'},
                {name:'SetSpot', signals:'@Spot,spot', state:1, event:'triggerSetSpot'}
            ]);
            this.$channel = null;
            this.$data = null;

            // 展现形式记录
            // this.$cache = {};

            this.$activeField = {};
            this.$updateField = {};

            // 构建显示布局
            this.build();
        },
        build: function(){
            var self = this;
            var c = self.config;
            var con = self.el;

            // 是否同步公用分组checkbox
            var checkboxCon = this.$checkboxCon = $('<div class="checkboxCon">');
            this.$checkbox = $('<label class=""><input type="checkbox"> '+LANG('同步公用分组')+'</label>').appendTo(checkboxCon).find('input');
            this.create('tips',common.tips,{
                target: checkboxCon,
                tips:LANG('勾选该选项后，修改将更新到该公用分组，并且所有使用了该分组的RTB活动都会使用新的设置。')
            });

            // 分组名称
            self.create('name', form.input, {
                target: con,
                width: 300,
                label: '名称：',
                value: LANG('新建分组_%1', util.date('YmdHis')),
                afterHtml: checkboxCon
            });

            // 从现有分组中复制
            $('<input type="button" class="btn primary ml20" id="COPY_ADSGROUP" value="'+LANG("从现有分组中复制")+'" />').appendTo(this.$.name.el);

            if (c.noSection){
                self.$.name.hide();
            }

            self.create('whiteBlackType', form.radio, {
                'target': con,
                'option': [
                    {'text':'白名单','value':1, 'checked': true},
                    {'text':'黑名单','value':2}
                ],
                'label': LANG('分组类型：')
            });

            // 展现形式
            self.create('showType', ShowType, {
                target: con,
                key: 'id',
                name: 'name',
                readonly: c.readonly,
                auto_load: false,
                hasLoading: true
            }).hide();

            // 屏次分类
            self.create('screen', ShowType, {
                target: con,
                key: 'id',
                name: 'name',
                readonly: c.readonly,
                auto_load: false,
                list: [
                    {id:1, name:LANG('第一屏')},
                    {id:2, name:LANG('第二屏')},
                    {id:3, name:LANG('第三屏')},
                    {id:4, name:LANG('第四屏')},
                    {id:5, name:LANG('第五屏')},
                    {id:102, name:LANG('五屏以外')},
                    // {id:101, name:LANG('非首屏')},
                    {id:0, name:LANG('未知')}
                ],
                layout: {
                    label: '屏次：'
                }
            }).hide();

            // 网站分类
            var layout = self.create('websiteSW', ItemLayout, {
                target: con,
                label: LANG('媒体分类：'),
                options: [
                    {id: 0, name:LANG('全部')},
                    {id: 1, name:LANG('指定媒体')}
                ],
                tips:LANG('指定推广的广告位所属媒体类型。')
            }).hide();
            self.create("website", country.website, {
                "target": layout.getContainer().addClass('P-campaignWebSiteClass')
                ,'readonly': c.readonly
                ,"auto_load": false
            });

            //mongo app 分类
            layout = self.create('mogoAppSW', ItemLayout, {
                target: con,
                label: LANG('App分类：'),
                options: [
                    {id: 0, name:LANG('全部')},
                    {id: 1, name:LANG('指定App')}
                ],
                tips:LANG('指定推广的广告位所属APP类型。')
            }).hide();

            self.create('mogoAppClass', country.mogoAppClass, {
                "target": layout.getContainer()
                ,'silence':false
                ,'url': BASE('data/mogo_app.json')
            });

            //移动端app分类,因为格式不一样，所有不能使用mongo的app分类
            layout = self.create('mobileAppSW', ItemLayout, {
                target: con,
                label: LANG('App分类：'),
                options: [
                    {id: 0, name:LANG('全部')},
                    {id: 1, name:LANG('指定App')}
                ],
                tips:LANG('指定推广的广告位所属APP类型。')
            }).hide();
            self.create('mobileAppClass', country.mobileAppClass, {
                "target": layout.getContainer().addClass('P-campaignWebSiteClass')
                ,'silence':false
                ,'auto_load':false
                ,'url': ''
                ,'url_map': app.config('exchange_group/moblieAppClassMap')
            });

            //sohu 频道分类
            layout = self.create('sohuChannelClassSW', ItemLayout, {
                target: con,
                label: LANG('频道分类：'),
                options: [
                    {id: 0, name:LANG('全部')},
                    {id: 1, name:LANG('指定频道')}
                ],
                tips:LANG('指定推广的广告位所属频道类型。')
            }).hide();

            self.create('sohuChannelClass', country.channelClass, {
                "target": layout.getContainer()
                ,'silence':false
                ,'auto_load': true
                ,'url': BASE('data/sohu_channel.json')
            });
            //sohu视频分类
            layout = self.create('sohuMediaClassSW', ItemLayout, {
                target: con,
                label: LANG('视频分类：'),
                options: [
                    {id: 0, name:LANG('全部')},
                    {id: 1, name:LANG('指定视频')}
                ],
                tips:LANG('指定推广的广告位所属视频类型。')
            }).hide();

            self.create('sohuMediaClass', country.mediaClass, {
                "target": layout.getContainer().addClass('P-campaignWebSiteClass')
                ,'silence':false
                ,'auto_load': true
                ,'url': BASE('data/sohu_media.json')
            });

            // 网站域名
            layout = self.create('domainSW', ItemLayout, {
                target: con,
                label: LANG('媒体域名：'),
                auto_load: false,
                options: [
                    {id: 0, name:LANG('全部')},
                    {id: 1, name:LANG('指定域名')}
                ],
                tips:LANG('指定推广的广告位所属的媒体域名，媒体域名是已选媒体分类下的域名。')
            }).hide();
            self.create("domain", DomainGrid, {
                "target":layout.getContainer(),
                'readonly':c.readonly
            });

            // 视频分类
            layout = self.create('videoSW', ItemLayout, {
                target: con,
                label: LANG('视频分类：'),
                options: [
                    {id: 0, name:LANG('全部')},
                    {id: 1, name:LANG('指定视频')}
                ],
                tips:LANG('指定推广的广告位所属视频分类。')
            }).hide();
            self.create("video", country.videoClass, {
                "target": layout.getContainer().addClass('P-campaignWebSiteClass')
                ,'silence':false
                ,'auto_load':false
                ,'url': ''
                ,'url_map': app.config('exchange_group/videoClassMap')
            });

            // 尺寸选择
            layout = self.create('sizesSW', ItemLayout, {
                target: con,
                label: LANG('广告尺寸：'),
                auto_load: false,
                options: [
                    {id: 0, name:LANG('全部')},
                    {id: 1, name:LANG('指定尺寸')}
                ],
                tips:LANG('指定推广的广告位的尺寸。')
            });
            self.create("sizes", SizeGrid, {
                "target":layout.getContainer(),
                'auto_load': false,
                'readonly':c.readonly
            });

            // 具体广告位位置
            layout = self.create('spotSW', ItemLayout, {
                target: con,
                label: LANG('广告位：'),
                options: [
                    {id: 0, name:LANG('全部')},
                    {id: 1, name:LANG('指定广告位')}
                ],
                tips:LANG('指定推广活动的广告位。')
            });
            self.create("spot", SpotGrid, {
                "target": layout.getContainer(),
                'readonly': c.readonly,
                'auto_load': false,
                'noExport': self.config.noExport
            });

            // 备注
            self.create('remark', form.input, {
                'type': 'textarea',
                target: con,
                class: 'M-formItem P-campaignSpotRemark',
                label: '备注：'
            });

            this.dg(this.el, '#COPY_ADSGROUP', 'click', 'eventCopy');

            self.$ready = true;
        },
        /**
         * 重置控件模块状态
         * @return {None}
         */
        reset: function(){
            // this.$cache = {};
            this.$data = null;
            this.$checkboxCon.show();
            this.$checkbox.prop('checked', false);
            this.$.domain.clearShowSelected();
            this.$.spot.clearShowSelected();
            this.$trigger.clear().signal('reset');
        },
        triggerReset: function(param, reg){
            this.$updateField = {
                'siteclass': 1,
                'domain': 1,
                'spotsize': 1,
                'spot': 1
            };
            this.$.name.setDefault(LANG('新建分组_%1', util.date('YmdHis')));
            this.$trigger
                .signal('channel', +DEFAULT_ADXID)
                .signal('name', '')
                .signal('remark', '')
                .signal('viewtype', null)
                .signal('screen', null)
                .signal('siteclass', [])
                .signal('domain', [])
                .signal('spotsize', [])
                .signal('spot', []);
            // this.$.spot.reset();
        },
        /**
         * 切换RTB渠道类型
         * @param  {Number} exchange_id 渠道ID
         * @return {None}
         */
        switchChannel: function(exchange_id){
            this.$updateField = {
                'siteclass': 1,
                'domain': 1,
                'spotsize': 1,
                'spot': 1
            };
            this.$trigger
                .clear('Reset')
                .signal('channel', +exchange_id)
                .signal('viewtype', null)
                .signal('screen', null)
                .signal('siteclass', [])
                .signal('domain', [])
                .signal('spotsize', [])
                .signal('spot', []);
            return this;
        },
        setValue: function(data){
            this.$updateField = {
                'siteclass': 1,
                'domain': 1,
                'spotsize': 1,
                'spot': 1
            };
            data = $.extend(true, {}, data);
            this.$data = data;

            // 兼容优酷分类属性名称
            var chn = this.$trigger.getData('channel');
            var cls = ( util.exist(app.config('exchange_group/youku'), chn) || util.exist(app.config('exchange_group/tencent'), chn) ) ? data.PageClass : data.SiteClass;

            this.$checkbox.prop('checked',data.SynCampaign);

            if(!data.Id){
                this.$checkboxCon.hide();
            }

            this.$trigger.clear('Reset')
                .signal('name', data.Name || LANG('新建分组_%1', util.date('YmdHis')))
                // 备注
                .signal('whiteBlackType', data.WhiteBlackType || 1)
                .signal('remark', data.Remark || '')
                .signal('viewtype', data.Type || null)
                .signal('screen', data.Screen || null)
                .signal('siteclass', cls || [])
                .signal('domain', data.Domain || [])
                .signal('spotsize', data.Size || [])
                .signal('spot', data.PositionIds || []);
        },
        //todo: 返回格式与setValue同步
        getValue: function(keep){
            var self = this;
            var cs = self.$;
            var tr = self.$trigger;
            var act = self.$activeField;
            var val = function(ack, ori){
                return tr.getData(ack) || tr.getData(ori) || [];
            }

            var data = {
                Name: cs.name.getData(),
                WhiteBlackType: +cs.whiteBlackType.getData(),
                // 备注
                Remark: cs.remark.getData(),
                Type: act.viewtype && cs.showType.getData() || null,
                Screen: act.screen && cs.screen.getData() || null,
                Domain: act.domain && val('@SetDomain', 'domain') || null,
                Size: act.size && val('@SetSize', 'spotsize') || null,
                PositionIds: act.spot && val('@SetSpot', 'spot') || null,
                SynCampaign:this.$checkbox.prop('checked') ? 1 : 0
            };
            if(this.$data && this.$data.Id){
                data.Id = this.$data.Id;
            }

            // 兼容优酷分类属性名称
            var chn = this.$trigger.getData('ackChannel');
            var cls = ( util.exist(app.config('exchange_group/youku'), chn) || util.exist(app.config('exchange_group/tencent'), chn) ) ? 'PageClass' : 'SiteClass';
            data[cls] = (act.catalog || act.mogo || act.video || act.app) && val('@SetSiteClass', 'siteclass') || null;

            // sohu特殊处理
            if(act.sohu){
                if(self.$.sohuChannelClassSW.getValue()){
                    data.SiteClass = self.$.sohuChannelClass.getData() || [];
                }
                if(self.$.sohuMediaClassSW.getValue()){
                    data.PageClass = self.$.sohuMediaClass.getData() || [];
                }
            }

            if (!keep){
                util.each(data, function(val, key){
                    if (val === null || (val && val.length === 0)){
                        return null;
                    }
                });
            }
            return data;
        },
        fieldValue: function(name, new_val){
            var cs = this.$;
            var isDomain = (name == 'domain');
            if (new_val){
                cs[name][isDomain?'setValue':'setData'](new_val);
            }
            if (new_val || cs[name + 'SW'].getValue()){
                return cs[name][isDomain?'getValue':'getData']().sort();
            }else {
                return [];
            }
        },
        checkLoad: function(name, signal){
            var self = this;
            var load = self.$[name].updateByList(
                self.$trigger.getData(signal),
                self.$updateField[signal]
            );
            self.$updateField[signal] = 0;
            return load;
        },
        checkSet: function(name, signal, list){
            var self = this;
            if (self.$updateField[signal]){
                self.$[name].updateByList(list, 1, 1);
            }
            return self;
        },
        // 切换渠道
        triggerChannel: function(param, reg){
            var self = this;
            var item = util.find(app.config('exchanges'), param.channel, 'id');
            if (item){
                var id = item.alias_id || item.id;
                self.$channel = item;
                var active = self.$activeField;
                var all = ['viewtype', 'screen', 'catalog', 'domain', 'size', 'spot', 'mogo', 'video', 'app', 'sohu'];
                var list;
                switch (true){
                    case util.exist(app.config('exchange_group/tanx'), id):
                        list = ['viewtype', 'screen', 'catalog', 'domain', 'size', 'spot'];
                        break;
                    case util.exist(app.config('exchange_group/baidu'), id):
                    case util.exist(app.config('exchange_group/yigao'), id):
                    case util.exist(app.config('exchange_group/juxiaoPC'), id):
                        list = ['catalog', 'domain', 'size', 'spot'];
                        break;
                    case util.exist(app.config('exchange_group/googlePC'), id):
                        list = ['screen', 'catalog', 'size', 'spot'];
                        break;
                    case util.exist(app.config('exchange_group/youku'), id):
                        if(app.getUserAuth(app.config('auth/hide_videoDirect'))){
                            list = ['size', 'spot'];
                        }else{
                            list = ['catalog', 'size', 'spot'];
                        }
                        break;
                    case util.exist(app.config('exchange_group/yi'), id):
                        list = ['catalog', 'size', 'spot'];
                        break;
                    case util.exist(app.config('exchange_group/mongo'), id):
                        list = ['size', 'spot', 'mogo'];
                        break;
                    case util.exist(app.config('exchange_group/video_class'), id):
                        list = ['size', 'spot', 'video'];
                        break;
                    case util.exist(app.config('exchange_group/app_class'), id):
                        list = ['size', 'spot', 'app'];
                        break;
                    case util.exist(app.config('exchange_group/sohu'), id):
                        list = ['size', 'spot', 'sohu'];
                        break;
                    case util.exist(app.config('exchange_group/dm'), id):
                        list = ['catalog', 'size', 'spot'];
                        break;
                    // case util.exist(app.config('exchange_group/google'), id):
                    // doubleClick为分类、尺寸和广告位
                    // TODO: 分类暂时不能上线，先不要
                    // list = ['catalog', 'size', 'spot'];
                    default:
                        list = ['size', 'spot'];
                        break;
                }
                for (var i=0; i<all.length; i++){
                    active[all[i]] = (util.index(list, all[i]) !== null);
                }
                var cs = self.$;
                cs.showType[active.viewtype ? 'show' : 'hide']();
                cs.screen[active.screen ? 'show' : 'hide']();
                cs.websiteSW[active.catalog ? 'show' : 'hide']();
                cs.mogoAppSW[active.mogo ? 'show' : 'hide']();
                cs.domainSW[active.domain ? 'show' : 'hide']();
                cs.videoSW[active.video ? 'show' : 'hide']();
                cs.mobileAppSW[active.app ? 'show' : 'hide']();
                cs.sohuChannelClassSW[active.sohu ? 'show' : 'hide']();
                cs.sohuMediaClassSW[active.sohu ? 'show' : 'hide']();

                self.$trigger.signal('ackChannel', id, true);

                return item;
            }else {
                return self.$channel;
            }
        },
        // 设置名称
        triggerName: function(param, reg){
            this.$.name.setData(param.name);
        },
        // 设置黑白名单类型
        triggerWhiteBlackType: function(param, reg){
            this.$.whiteBlackType.setData(param.whiteBlackType);
        },
        // 设置备注
        triggerRemark: function(param) {
            this.$.remark.setData(param.remark);
        },
        // 切换展现类型
        triggerViewType: function(param, reg){
            if (this.$activeField.viewtype){
                this.$.showType.setParam({'adxId':param.ackChannel}).load();
                return false;
            }
        },
        // 设置选中类型
        triggerSetViewType: function(param, reg){
            var types = [];
            if (this.$activeField.viewtype){
                types = this.$.showType.setData(param.viewtype).getData();
            }
            this.$trigger.signal('ackViewType', types.sort().toString(), true);
            return types;
        },
        // 设置屏次
        triggerSetScreen: function(param, reg){
            var types = [];
            if (this.$activeField.screen){
                if(util.exist(app.config('exchange_group/googlePC'), param.ackChannel)){
                    this.$.screen.setList([
                        {id:1, name:LANG('第一屏')},
                        {id:101, name:LANG('非首屏')},
                        {id:0, name:LANG('未知')}
                    ]);
                }else{
                    this.$.screen.setList([
                        {id:1, name:LANG('第一屏')},
                        {id:2, name:LANG('第二屏')},
                        {id:3, name:LANG('第三屏')},
                        {id:4, name:LANG('第四屏')},
                        {id:5, name:LANG('第五屏')},
                        {id:102, name:LANG('五屏以外')},
                        // {id:101, name:LANG('非首屏')},
                        {id:0, name:LANG('未知')}
                    ]);
                }
                types = this.$.screen.setData(param.screen).getData();
            }
            this.$trigger.signal('ackScreen', types.sort().toString(), true);
            return types;
        },
        // 拉取网站分类
        triggerClass: function(param, reg){
            var self = this;
            var mod = null;
            if (self.$activeField.catalog){		// 媒体分类
                mod = self.$.website.setParam({
                    GetLayerSiteClass: 1,
                    AdxId: param.ackChannel
                });

                if (self.checkLoad('websiteSW', 'siteclass')){
                    mod.load(function(){
                        self.$trigger.signal('siteclass').resolve(reg);
                    });
                    return false;
                }
            }
            else if(self.$activeField.mogo){		// Mogo app分类
                self.checkLoad('mogoAppSW', 'siteclass');
                self.$.mogoAppClass.load(function(){
                    self.$trigger.signal('siteclass').resolve(reg);
                });
            }
            else if(self.$activeField.video){      // 视频分类
                mod = self.$.video;
                // 设置不同的静态url
                mod.setUrl(mod.getConfig('url_map')[param.ackChannel]);
                mod.load(function(){
                    self.$trigger.signal('siteclass').resolve(reg);
                });

                return false;
            }
            else if(self.$activeField.app){		// 其他app分类
                mod = self.$.mobileAppClass;
                // 设置不同的静态url
                mod.setUrl(mod.getConfig('url_map')[param.ackChannel]);
                mod.load(function(){
                    self.$trigger.signal('siteclass').resolve(reg);
                });

                return false;
            }
        },
        // 设置/更新选中的网站分类
        triggerSetClass: function(param, reg){
            var self = this;
            var ids = [];
            if (self.$activeField.catalog){		// 媒体分类
                ids = param.siteclass || [];
                ids = self.fieldValue('website', ids);
                self.checkSet('websiteSW', 'siteclass', ids);
                self.$trigger.signal('ackSiteClass', ids.toString(), true);
                return ids;
            }
            else if(self.$activeField.mogo){		// Mogo app分类
                ids = param.siteclass || [];
                ids = self.fieldValue('mogoAppClass', ids);
                self.checkSet('mogoAppSW', 'siteclass', ids);
                self.$trigger.signal('ackSiteClass', ids.toString(), true);
                return ids;
            }
            else if(self.$activeField.app){		// 其他app分类
                ids = param.siteclass || [];
                ids = self.fieldValue('mobileAppClass', ids);
                self.checkSet('mobileAppSW', 'siteclass', ids);
                self.$trigger.signal('ackSiteClass', ids.toString(), true);
                return ids;
            }
            else if(self.$activeField.video){		 // 视频分类
                ids = param.siteclass || [];
                ids = self.fieldValue('video', ids);
                self.checkSet('videoSW', 'siteclass', ids);
                self.$trigger.signal('ackSiteClass', '', true);
                return ids;
            }
            else if(self.$activeField.sohu){		// sohu分类特殊处理
                var cs = self.$;
                if(self.$data.Remark !== undefined){
                    var data = self.$data;
                    // 设置sohu媒体分类
                    cs.sohuChannelClass.setData(data.SiteClass || null);
                    cs.sohuChannelClassSW.setValue(data.SiteClass ? 1 : 0);
                    // 设置sohu视频分类
                    cs.sohuMediaClass.setData(data.PageClass || null);
                    cs.sohuMediaClassSW.setValue(data.PageClass ? 1 : 0);

                }else {
                    cs.sohuChannelClass.setData();
                    cs.sohuChannelClassSW.setValue(0);
                    cs.sohuMediaClass.setData();
                    cs.sohuMediaClassSW.setValue(0);
                }

            }

        },
        // 加载域名数据
        triggerDomain: function(param, reg){
            var self = this;
            if (self.$activeField.domain){
                var ackSiteClass = param.ackSiteClass;
                if(util.exist(app.config('exchange_group/juxiaoPC'), param.ackChannel)){
                    ackSiteClass = '';
                }
                var mod = self.$.domain.setParam({
                    AdxId: param.ackChannel,
                    ViewType: param.ackViewType,
                    SiteClassIds: ackSiteClass
                });
                if (self.checkLoad('domainSW', 'domain')){
                    mod.load(function(){
                        self.$trigger.signal('domain').resolve(reg);
                    });
                    return false;
                }
            }
        },
        // 设置选中的域名
        triggerSetDomain: function(param, reg){
            var self = this;
            var ids = [];
            if (self.$activeField.domain){
                ids = param.domain || [];
                ids = self.fieldValue('domain', ids);
            }
            self.checkSet('domainSW', 'domain', ids);
            self.$trigger.signal('ackDomain', ids.toString(), true);
            return ids;
        },
        // 加载尺寸
        triggerSize: function(param, reg){
            if (this.$activeField.size){
                var mod = this.$.sizes;
                var und = '';

                // 优酷分类不联动
                var siteclass = param.ackSiteClass;
                if (util.exist(app.config('exchange_group/youku'), param.ackChannel)){
                    var ch = reg.changed;
                    switch (1){
                        case ch.ackChannel:
                        case ch.ackViewType:
                        case ch.ackDomain:
                            siteclass = und;
                            break;
                        default:
                            return;
                    }
                }
                if(util.exist(app.config('exchange_group/juxiaoPC'), param.ackChannel)){
                    siteclass = '';
                }
                mod.setParam({
                    'ViewType': param.ackViewType || und,
                    'DomainIds': param.ackDomain || und,
                    'SiteClassIds': !param.ackDomain && siteclass || und
                });

                mod.switchChannel(param.ackChannel);
                if (this.checkLoad('sizesSW', 'spotsize')){
                    mod.load();
                    return false;
                }
            }
        },
        // 设置尺寸
        triggerSetSize: function(param, reg){
            var self = this;
            var ids = [];
            if (self.$activeField.size){
                ids = self.fieldValue('sizes', param.spotsize || []);
            }

            self.checkSet('sizesSW', 'spotsize', ids);
            self.$trigger.signal('ackSpotSize', ids.toString(), true);
            return ids;
        },
        // 加载广告位
        triggerSpot: function(param, reg){
            // todo: 整理参数请求格式
            var self = this, und = '';
            var act  = self.$activeField;
            if (act.spot){
                var mod  = self.$.spot;

                // 优酷分类不联动
                var siteclass = param.ackSiteClass;
                if (util.exist(app.config('exchange_group/youku'), param.ackChannel)){
                    var ch = reg.changed;
                    switch (1){
                        case ch.ackChannel:
                        case ch.ackViewType:
                        case ch.ackScreen:
                        case ch.ackDomain:
                        case ch.ackSpotSize:
                            siteclass = und;
                            break;
                        default:
                            return;
                    }
                }

                mod.switchChannel(param.ackChannel);

                if(util.exist(app.config('exchange_group/juxiaoPC'), param.ackChannel)){
                    siteclass = '';
                }
                mod.setParam({
                    'ViewType': act.viewtype && param.ackViewType || und,
                    'ScreenIds': act.screen && param.ackScreen || und,
                    'SiteClassIds': (act.catalog || act.mogo || act.video || act.app) && siteclass || und,
                    'DomainIds': act.domain && param.ackDomain || und,
                    'SizeIds': act.size && param.ackSpotSize || und
                });
                if (this.checkLoad('spotSW', 'spot')){
                    mod.load();
                }
            }
        },
        // 设置选中广告位
        triggerSetSpot: function(param, reg){
            if (this.$activeField.spot){
                this.checkSet('spotSW', 'spot', param.spot);
                this.$.spot.setData(param.spot || []);
                return false;
            }
        },
        // 子模块数据加载完成事件
        onDataLoaded: function(ev){
            var trigger = this.$trigger;
            switch (ev.from){
                case this.$.showType:
                    trigger
                        .signal('viewtype')
                        .resolve('ViewType');
                    break;
                case this.$.sizes:
                    trigger
                        .signal('spotsize')
                        .resolve('Size');
                    break;
                case this.$.spot:
                    trigger.resolve('SetSpot', ev.param);
                    break;
                default:
                    return;
            }
            return false;
        },

        /**
         * 广告位尺寸选择改变
         * @param  {Object} ev 消息对象
         * @return {Bool}      false
         */
        onAdSizeChange:function(ev){
            var data = [];
            util.each(ev.param.ids, function(id){
                data.push(id)
            });
            this.$trigger
                .setData('@SetSize', data)
                .setData('spotsize', data)
                .signal('ackSpotSize', ev.param.ids.sort().toString(), true);
            return false;
        },
        // 修改展现形式 / 屏次
        onCheckboxChange: function(ev){
            var self = this;
            switch (ev.from){
                case self.$.showType:
                    self.$trigger
                        .setData('viewtype', ev.param)
                        .signal('ackViewType', ev.param.sort().toString(), true);
                    break;
                case self.$.screen:
                    self.$trigger
                        .setData('screen', ev.param)
                        .signal('ackScreen', ev.param.sort().toString(), true);
                    break;
            }
            return false;
        },
        // 切换网站分类
        onSubLevelChange: function(ev){
            if(ev.name == 'video'){
                this.$trigger
                    .setData('@SetSiteClass', ev.param.data)
                    .setData('siteclass', ev.param.data)
                    .signal('ackSiteClass', '', true);
            }else{
                this.$trigger
                    .setData('@SetSiteClass', ev.param.data)
                    .setData('siteclass', ev.param.data)
                    .signal('ackSiteClass', ev.param.data.sort().toString(), true);
            }

            return false;
        },
        onDomainChange: function(ev){
            this.$trigger
                .setData('@SetDomain', ev.param)
                .setData('domain', ev.param)
                .signal('ackDomain', ev.param.sort().toString(), true);
            return false;
        },
        // 项目切换全部还是指定类型
        onChangeFilter: function(ev){
            var self = this;
            var cs = self.$;
            var custom = ev.param;
            var data, name, ack, reg;
            var from = ev.from;
            switch (from){
                case cs.websiteSW:
                    if (custom && from.isDirty()){
                        cs.website.load();
                    }
                    data = custom ? cs.website.getData() : [];
                    reg  = '@SetSiteClass';
                    name = 'siteclass';
                    ack  = 'ackSiteClass';
                    break;
                case cs.domainSW:
                    if (custom && from.isDirty()){
                        cs.domain.load();
                    }
                    data = custom ? cs.domain.getValue() : [];
                    reg  = '@SetDomain';
                    name = 'domain';
                    ack  = 'ackDomain';
                    break;
                case cs.sizesSW:
                    if (custom && from.isDirty()){
                        cs.sizes.load();
                    }
                    data = custom ? cs.sizes.getData() : [];
                    reg  = '@SetSize';
                    name = 'spotsize';
                    ack  = 'ackSpotSize';
                    break;
                case cs.spotSW:
                    if (custom && from.isDirty()){
                        cs.spot.load();
                    }
                    data = custom ? cs.spot.getData() : [];
                    reg  = '@SetSpot';
                    name = 'spot';
                    ack  = 'ackSpot';
                    break;
                default:
                    return false;
            }
            self.$trigger
                .setData(reg, data)
                .setData(name, data)
                .signal(ack, data.sort().toString(), true);
            return false;
        },
        // 隐藏同步公用分组
        hideSync: function(){
            this.$checkboxCon.hide();
            return this;
        },
        // 设置白名单还是黑名单
        setWhiteBlackType: function(type){
            this.$.whiteBlackType.setData(type);
            // 设置为不可选择
            this.$.whiteBlackType.el.find('input').attr('disabled',true);
            return this;
        },
        eventCopy: function(){
            var self = this;
            if (!self.get('selectAdsGroup')){
                self.create('selectAdsGroup', popwin.selectAdsGroup, {});
            }
            self.$.selectAdsGroup.setParam({
                'WhiteBlackType': self.$.whiteBlackType.getData(),
                'AdxId': self.$trigger.getData('ackChannel')
            }).show();
        },
        // 激活渠道变更
        triggerSignalAckChannel: function(AdxId){
            var self = this;
            self.$trigger.signal('ackChannel', AdxId, false);
        }

    });
    exports.main = MainForm;

    // 弹窗编辑广告位分组
    var PopupForm = app.extend(app.Module, {
        init: function(config){
            var self = this,
                d = document,
                b = (d.compatMode==="CSS1Compat" ? d.documentElement : d.body);
            self.$config = $.extend(true, {
                'layout': {
                    'width': Math.min(1200, Math.max(b.clientWidth - 50, 1000)),
                    'height': Math.max(600, b.clientHeight - 30),
                    'title': LANG('新建广告位分组'),
                    "buttons":['savePublic', "ok", "cancel"],
                    "buttonConfig":{
                        'savePublic': {
                            "type":"button",
                            "value":LANG("保存为公用分组"),
                            "class":"btnBigGray",
                            "events":"click"
                        }
                    },
                    'buttonEvent': true
                },
                'save_url': '/rest/addpositioncategory'
            }, config);

            self.$ready = false;
            self.$resizeId = 0;
            self.$lastHeight = 0;
            self.$content = null;
            self.$param = null;
            self.$newToPublic = null; // 新建分组转换为公用分组data
            self.build();
        },
        build: function(){
            var self = this;
            if (self.$ready){ return self; }
            self.$ready = true;

            var layout = self.create('layout', popwin.base, self.$config.layout);
            layout.show();
            self.create('main', MainForm, {
                'target': layout.body,
                'class': 'P-campaignSpotPop'
            });
            self.create('scroll', common.scroller, {'target':layout.body, 'dir':'V'});
            self.$content = layout.body.children(':first');
            self.$lastHeight = self.$content.height();
            return self;
        },
        saveAsPublic: function(force){
            var spot = this.$.main.getValue();
            var data = {
                'Id': 0,
                'Name': spot.Name,
                // 备注，与Name一样，使用mainform模块传上来的数据
                'WhiteBlackType': spot.WhiteBlackType,
                'Remark': spot.Remark,
                'AdxId': this.$param.channel,
                'Spots': spot,
                'ForceReplace': force ? 1 : 0
            };
            app.data.put(this.$config.save_url, data, this, 'afterSaveAsPublic');
            return this;
        },
        afterSaveAsPublic: function(err, data){
            if (err){
                if (err.code === app.CONST('ITEM_EXIST')){
                    if (confirm(LANG('同名公用分组已存在，确定要覆盖？'))){
                        this.saveAsPublic(1);
                    }
                }
                return false;
            }
            this.$newToPublic = data;
            app.notify(LANG('广告位公用分组保存成功!'));
            return true;
        },
        updateScroll: function(){
            var height = this.$content.height();
            if (height && this.$lastHeight != height){
                this.$lastHeight = height;
                this.$.scroll.measure();
            }
        },
        setParam: function(param){
            if (param.channel){
                this.$.main.switchChannel(param.channel);
            }
            this.$.layout.changeTitle(
                param.index == -1 ? LANG('新建广告位分组') : LANG('编辑广告位分组')
            );
            this.$param = param;
            return this;
        },
        getParam: function(){
            return this.$param;
        },
        setValue: function(data){
            this.$.main.setValue(data);
            return this;
        },
        getValue: function(){
            var data = this.$.main.getValue(true);
            // 新建广告位分组，是该活动私有分组，不会有同步功能
            if(this.$newToPublic && this.$newToPublic._id){
                data.Id = this.$newToPublic._id;
            }
            return data;
        },
        reset: function(){
            this.$newToPublic = null;
            this.$.main.reset();
            return this;
        },
        onClick: function(ev){
            var layout = this.$.layout;
            if (ev.source === layout){
                switch (ev.name){
                    case 'ok':
                        this.doOk();
                        break;
                    case 'cancel':
                        layout.hide();
                        break;
                    case 'savePublic':
                        this.saveAsPublic();
                        break;
                }
                return false;
            }
        },
        doOk: function(){
            this.fire('spotDone', this.getValue());
            return this;
        },
        show: function(){
            var self = this;
            self.$.layout.show();
            self.$resizeId = setInterval(function(){
                self.updateScroll();
            }, 500);
            return self;
        },
        hide: function(){
            this.$.layout.hide();
            clearInterval(this.$resizeId);
            return this;
        },
        hideSync: function(){
            // 隐藏同步公用分组
            this.$.main.hideSync();
            return this;
        },
        // 设置白名单还是黑名单
        setWhiteBlackType: function(){
            var self = this;
            var type = self.$config.WhiteBlackType;
            if(type){
                self.$.main.setWhiteBlackType(type);
            }
            return self;
        },
        onSelectAdsGroup: function(ev){
            var self = this;
            app.confirm(
                LANG('确认要复制选中的广告位分组内容吗? 当前的广告位分组修改信息将会丢失.'),
                function(ret){
                    if (ret){
                        self.isCopy = true;
                        self.setValue(ev.param.Spots);
                        // 激活渠道变更
                        self.$.main.triggerSignalAckChannel(ev.param.AdxId);
                    }
                }
            );

            return false;
        }
    });
    exports.popupForm = PopupForm;

    // 附加名单弹出窗口
    var ViewForm = app.extend(PopupForm, {
        init: function(config){
            var self = this;
            // d = document,
            // b = (d.compatMode==="CSS1Compat" ? d.documentElement : d.body);
            self.$config = $.extend(true, {
                'layout': {
                    'width': 950,
                    // 'height': Math.max(600, b.clientHeight - 30),
                    'title': LANG('广告位列表'),
                    "buttons":["ok"],
                    'buttonEvent': true
                }
            }, config);

            self.$ready = false;
            self.$resizeId = 0;
            self.$lastHeight = 0;
            self.$content = null;
            self.$param = null;
            self.$data = null;
            self.build();
        },
        build: function(){
            var self = this;
            if (self.$ready){ return self; }
            self.$ready = true;

            var layout = self.create('layout', popwin.base, self.$config.layout);
            layout.show();

            self.create('main', grid.baseNoDate, {
                'target': layout.body.css('margin', '0 30px'),
                'cols': [
                    {type:'id'},
                    {name:'Name', text:LANG('广告位名称'), type:'index'},
                    {name: 'WidthHeight', text:LANG('尺寸'), align:'center', render:self.renderSize}
                ],
                'operation': {width:70, html:'<a href="#" data-op="remove">'+LANG("删除")+'</a>'},
                'hasTab': false,
                'hasAmount': false,
                'hasExport': false,
                'pager':{
                    size: 10,
                    showSizeTypes: 0
                },
                'auto_load': false,
                'url': '/rest/listadposition',
                'param': {
                    MFields: '_id,Name,Width,Height',
                    no_stastic_data: 1,
                    AllChannel: 1
                }
            });
            return self;
        },
        renderSize: function(id, val, row){
            return row.Width + '*' + row.Height;
        },
        setParam: function(param){
            this.$param = param;
            return this;
        },
        setValue: function(data){
            this.$data = data = $.extend(true, {}, data);
            this.$.main.setParam({
                Ids: data.PositionIds.toString()
            }).load();
            return this;
        },
        getValue: function(){
            return this.$data;
        },
        reset: function(){
            this.$data = null;
            this.$.main.setData([]);
            return this;
        },
        doOk: function(){
            this.fire('listDone', this.getValue());
            return this;
        },
        onListOpClick: function(ev){
            var self = this;
            var data = self.$data;

            if (data && ev.source === self.$.main){
                if (ev.param.op == 'remove'){
                    var item = ev.param.data;
                    if (confirm(LANG('真的要删除广告位: %1 吗?', item.Name))){
                        util.remove(data.PositionIds, item.Id);
                        self.$.main.setParam({
                            Ids: data.PositionIds.toString()
                        }).load();
                    }
                }
                return false;
            }
        },
        onSizeChange: function(){
            this.$.layout.setWin();
            return false;
        },
        show: function(){
            var self = this;
            self.$.layout.show();
            return self;
        }
    });
    exports.viewForm = ViewForm;


    // 弹窗编辑广告位分组
    var ComplexForm = app.extend(PopupForm, {
        init: function(config){
            var self = this,
                d = document,
                b = (d.compatMode==="CSS1Compat" ? d.documentElement : d.body);
            self.$config = $.extend(true, {
                'layout': {
                    'width': Math.min(1200, Math.max(b.clientWidth - 50, 1000)),
                    // 'height': Math.max(600, b.clientHeight - 30),
                    'title': LANG('系统过滤黑名单列表'),
                    "buttons":["ok"],
                    "buttonConfig":{
                        'savePublic': {
                            "type":"button",
                            "value":LANG("保存为公用分组"),
                            "class":"btnBigGray",
                            "events":"click"
                        }
                    },
                    'buttonEvent': true
                }
            }, config);

            self.$ready = false;
            self.$resizeId = 0;
            self.$lastHeight = 0;
            self.$content = null;
            self.$param = null;
            self.$data = null;
            self.build();
        },
        build: function(){
            var self = this;
            if (self.$ready){ return self; }
            self.$ready = true;

            var layout = self.create('layout', popwin.base, self.$config.layout);
            layout.show();

            var section = self.create('channelSection', form.section, {
                'target': layout.body.css('margin', '0 30px'),
                'title': LANG('广告位过滤黑名单'),
                'desc': LANG('选择活动投放目标渠道。')
            });
            self.create('main', table.list, {
                'target': section.getContainer(),
                'cols': [
                    {type:'id'},
                    {type:'index', name:'Name', text:LANG('过滤属性')},
                    {type:'op', width:70, html:'<a href="#" data-op="remove">'+LANG("删除")+'</a>'}
                ],
                'opClick': true,
                "scroll_type":"row",
                "scroll_size":10
            });
            self.create('scroll', common.scroller, {'target':layout.body, 'dir':'V'});
            self.$content = layout.body.children(':first');
            self.$lastHeight = self.$content.height();
            return self;
        },
        setParam: function(param){
            this.$param = param;
            this.$.layout.changeTitle(
                param.type == 'black' ? LANG('系统附加黑名单') : LANG('系统附加白名单')
            );
            return this;
        },
        setValue: function(data){
            this.$data = data = $.extend(true, {}, data);
            this.$.main.setData(data.List);
            return this;
        },
        getValue: function(){
            return this.$data;
        },
        reset: function(){
            this.$data = null;
            this.$.main.setData([]);
            return this;
        },
        doOk: function(){
            this.fire('listDone', this.getValue());
            return this;
        },
        onListOpClick: function(ev){
            var self = this;
            var data, list, item;
            if (ev.source === self.$.main){
                if (ev.param.op == 'remove' && (data = self.$data)){
                    list = data.List;
                    item = list[ev.param.index];
                    if (item && confirm(LANG('真的要删除过滤组合: %1 吗?', item.Name))){
                        list.splice(ev.param.index, 1);
                        self.$.main.setData(list);
                    }
                }
                return false;
            }
        }
    });
    exports.complexForm = ComplexForm;


    // 订单列表
    var DealGrid = app.extend(view.container, {
        init: function(config, parent){
            var self = this;
            config = $.extend(true, {
                'target': parent,
                'readonly': false,
                'url': '/nextgen/listdeal?no_limit=1&Status=1'
            }, config);
            DealGrid.master(self, null, config);
            DealGrid.master(self, 'init', arguments);

            self.$trigger = new trigger(self, [
            ]);

            self.$callback = null;
            self.$value = null;
            self.$param = null;
            self.$allCache = null;
            self.$showSel = false;
            // 构建显示布局
            self.build();
            window.db = self;
        },
        build: function(){
            var self = this;
            var c = self.config;
            if (self.$ready){ return self; }
            self.$ready = true;

            self.el.css('position', 'relative');

            // 插入右侧容器
            var con = self.$rightCon = $('<div class="P-campaignPositionListOp" />').appendTo(self.el);
            con.append(
                '<label><input type="checkbox"> '+LANG('显示已选')+'</label>'
            );

            //插入'显示已选'复选框
            self.$checkbox = con.find('input:first');

            //对$checkbox绑定触发选择'显示已选'功能的事件
            self.jq(self.$checkbox,'change','eventSwitchShowSeleted');

            self.create("grid", adminGrid.dealPrefList, {
                "target": self.el,
                'readonly':c.readonly,
                'auto_load': true,
                // 'pager':{
                // 	'size': 10,
                // 	'sizeTypes': [10, 20, 0, 0]
                // },
                'url': c.url+'&Type='+c.bidType,
                'hasPager': false,
                'hasSelect': true,
                'list':{
                    'rowSelect': true,
                    'scroll_type': 'row',
                    'scroll_size': 8
                }
            });
        },
        setData: function(data){
            // 过滤ID, 生成有效的ID列表
            var self = this;
            self.$data = data;
            var dealIds = [];
            util.each(data, function(item,idx){
                if(item){
                    dealIds.push(item.DealId)
                }
            });

            self.$checkbox.prop('checked', false);
            self.$.grid.setSelectRowIds(dealIds);
            return self;
        },
        getData: function(){
            return this.$.grid.getSelectRowId();
        },
        setParam: function(param){
            this.$.grid.setParam(param);
            this.$param = util.merge(this.$param, param);
            return this;
        },
        load: function(callback){
            var self = this;
            self.$wait = 2;
            self.$allCache = null;
            self.$callback = callback;
            self.$showSel = false;
            self.clearShowSelected();
            self.$.grid.load();

            return self;
        },
        onGridDataLoad: function(ev){
            this.runCallback();
            return false;
        },
        runCallback: function(){
            if (--this.$wait <= 0){
                if (this.$callback){
                    this.$callback();
                    this.$callback = null;
                }
            }
            return this;
        },
        onChangeSelect: function(ev){
            this.$value = ev.param.selected.slice();
            this.fire('dealChange', ev.param);
            return false;
        },
        eventSwitchShowSeleted: function(evt, elm){
            if (elm.checked){
                var ids = this.$.grid.getSelectRowId() || [];
                this.$.grid.setParam({'Ids': ids.join(',')});
            }else {
                this.$.grid.setParam({'Ids': null});
            }
            this.$.grid.load();
        },
        clearShowSelected: function(){
            var self = this;
            self.$checkbox.prop('checked', false);
            return self;
        }
    });

    // 附加广告位选择
    var DealSpotGrid = app.extend(view.container, {
        init: function(config, parent){
            config = $.extend(true, {
                'target': parent,
                'readonly': false,
                'class': 'P-campaignPosition',
                'param': null,
                'auto_load': false,
                'noExport': true
            }, config);
            DealSpotGrid.master(this, null, config);


            // 默认参数
            this.$param = config.param ? $.extend({}, config.param) : null;

            // 当前数据
            this.$data = null;
            this.$channel = 0;
            this.$selects = [];
            this.$selectsIds = [];
            this.$allData = [];
            this.$allSpotIds = [];
            // 构建显示布局
            this.build();
        },
        build: function(){
            var self = this;
            var c = self.config;
            var con = self.el;
            var doms = self.doms = {};
            self.render();

            //插入'显示已选'复选框
            doms.checkbox = $('<label class="P-campaignPositionListOp"><input type="checkbox"> '+LANG('显示已选')+'</label>').appendTo(con).find('input');
            //对$checkbox绑定触发选择'显示已选'功能的事件
            self.jq(doms.checkbox,'click','eventSwitchShowSeleted');

            // 广告位列表
            this.create('list', grid.base, {
                'target': con,
                'cols':[
                    {type:'id'},
                    {name:'Name', align:'left', text: LANG('广告位'), render: 'renderSpotName'},
                    {name:'DealId', align:'center', text: LANG('所属订单ID')},
                    {name:"Width",text:LANG("尺寸"),render: 'renderSize', align: 'center'}
                ],
                'opClick': true,
                'default_sort': false,
                'hasSearch': false,
                'hasPager': false,
                'is_sub_grid': false,
                'hasTab': false,
                'hasAmount': false,
                'hasExport': false,
                'auto_load': false,
                'sort': null,
                'hasSelect': true,
                'emptyText': LANG('您还没有选择广告位'),
                'list':{
                    'rowSelect': true,
                    'scroll_type': 'row',
                    'scroll_size': 8
                },
                'url': 'nextgen/editdeal?method=getSpotsByDealId'
            });

            // 选中的广告位列表
            var dom = doms.select_title = $('<div class="P-campaignPositionListTitle"/>').appendTo(con);
            doms.select_con = $('<div class="P-campaignPositionListCon"/>').appendTo(con);
            doms.select_list = $('<ul/>').appendTo(doms.select_con);
            doms.select_con.append('<div class="clear"/>');
            doms.empty = $('<div class="P-campaignPositionListEmpty"/>').text(LANG('请选择至少一个广告位')).appendTo(doms.select_con);

            // 全选所有广告位和清空广告位
            dom.text(LANG('已选择广告位'));
            if (!c.noExport){
                $('<input type="button" class="btn" data-action="batch"/>').val(LANG('批量导出')).appendTo(dom);
                $('<input type="button" class="btn" data-action="import"/>').val(LANG('批量导入')).appendTo(dom);
            }
            $('<input type="button" class="btn" data-action="select-invert"/>').val(LANG('反选')).appendTo(dom).hide();
            $('<input type="button" class="btn" data-action="select-all"/>').val(LANG('全选所有')).appendTo(dom);
            $('<input type="button" class="btn" data-action="clear"/>').val(LANG('清空')).appendTo(dom);

            self.dg(dom, 'input[data-action]', 'click', 'eventButtonAction');
            self.dg(doms.select_list, 'li', 'click', 'eventRemoveItem');
            doms.buttons = dom.find('input[data-action]');

            if (c.auto_load){
                self.load();
            }
        },
        // 渲染尺寸
        renderSize: function(i,val,row,con){
            return row.Width+" x "+row.Height;
        },
        // 渲染广告位名称
        renderSpotName: function(i,val,row,con){
            return $('<p class="M-tableListWidthLimit" />').width(380).text(val);
        },
        buildItem: function(item){
            var elm = $('<li/>').appendTo(this.doms.select_list);
            elm.text(item.Name).attr('data-id', item._id).attr('title', LANG('点击移除广告位'));
            return elm;
        },
        // 触发'显示全部已选广告位'
        eventSwitchShowSeleted:function(evt,elm){
            //改变复选框状态
            return false;
        },
        clearShowSelected: function(){
            this.doms.checkbox.prop('checked', false);
            return this;
        },
        /**
         * 点击已选中广告位标签删除广告位回调函数
         */
        eventRemoveItem: function(evt, elm){
            var id = $(elm).remove().attr('data-id');
            var sels = this.$selects;
            util.remove(sels, id, '_id');
            return false;
        },
        /**
         * 选中广告位切换操作(全选/反选/清空)
         */
        eventButtonAction: function(evt, elm){
            var action = $(elm).attr('data-action');
            switch (action){
                case 'clear':
                    // 清空选择
                    this.clear();
                    break;
                case 'select-all':
                    // 全选所有广告位
                    if (!confirm(LANG('确认要选择所有的广告位吗?'))){ break; }
                    this.setSelect(this.$allData);

                    break;
                case 'select-invert':
                    // 反选广告位
                    if (!confirm(LANG('确认要反选所有的广告位吗?'))){ break; }

                    break;
            }
        },
        /**
         * 选中广告位列表更新回调函数
         */
        onChangeSelect: function(ev){
            this.setSelect(ev.param.data);
            return false;
        },
        setSelect: function(data){
            if(data){
                // 设置列表选中, 生成已选广告位列表
                var sels = [];
                var doms = this.doms;
                doms.select_list.empty();
                util.each(data, function(item, idx){
                    if (item){
                        this.buildItem(item);
                        sels.push(item._id);
                    }
                }, this);
                doms.empty.toggle(sels.length === 0);
                this.$.list.setSelectRowIds(sels);
                this.$selects = data;
                this.$selectsIds = sels;
            }
            return this;
        },
        // 设置列表数据
        setGirdData: function(data){
            this.$allData = data;
            var ids = this.$allSpotIds;
            util.each(data, function(item){
                if(item){
                    ids.push(item._id);
                }
            });
            this.$.list.setData(data);
            return this;
        },
        load: function(param){
            if(param){
                this.$.list.setParam(param).load();
                this.$dealIds = param.Ids;
            }
        },
        onGridDataLoad: function(ev){
            var selectData = [];
            var gridData = this.$allData = this.$.list.getData();
            this.$.list.setSelectRowIds(this.$selectsIds)

            util.each(this.$selectsIds, function(item){
                if(item){
                    selectData.push(util.find(gridData,item,'_id'));
                }
            });
            this.setSelect(selectData);
            return false;
        },
        // 外部接口
        setData: function(data){
            this.$data = data;
            //this.$selects = data;
            var soptIds = this.$selectsIds;
            var dealIds =  [];
            util.each(data, function(item,idx){
                if(item){
                    dealIds.push(item.DealId);
                    util.each(item.PositionIds, function(spot){
                        soptIds.push(item.DealId+'_'+spot);
                    })
                }
            });

            this.load({Ids: dealIds.join(',')});
            return this;
        },
        getData: function(){

            return this.$selects || [];
        },
        clear: function(){
            this.$.list.setSelectRowIds([]);
            this.doms.select_list.empty();
            this.doms.empty.show();
            this.$selects = [];
            this.$selectsIds = [];
        },
        reset: function(){
            this.$data = null;
            this.$channel = 0;
            this.$selects = [];
            this.$allData = [];
            this.$allSpotIds = [];
            this.$selectsIds = [];
            this.clear();
            return this;
        }
    });

    // 订单管理
    var DealInfo = app.extend(view.container, {
        init: function(config, parent){
            config = $.extend(true, {
                'class': 'P-campaignDealInfo',
                'target': parent,
                'noSection': false,
                'noExport': false,
                'readonly': false
            }, config);
            DealInfo.master(this, null, config);
            DealInfo.master(this, 'init', arguments);

            this.$channel = null;
            this.$data = null;
            this.$dealIds = [];

            // 构建显示布局
            this.build();
        },
        build: function(){
            var self = this;
            var c = self.config;
            var con = self.el;

            // 订单选择
            var layout = self.create('dealSW', ItemLayout, {
                target: con,
                label: LANG('订单：'),
                auto_load: false,
                options: [
                    {id: 0, name:LANG('全部')},
                    {id: 1, name:LANG('指定订单')}
                ],
                tips:LANG('指定推广的订单。')
            });
            self.create("deal", DealGrid, {
                "target":layout.getContainer(),
                'auto_load': false,
                'readonly':c.readonly,
                'bidType': c.bidType
            });

            // 具体广告位位置
            layout = self.create('spotSW', ItemLayout, {
                target: con,
                label: LANG('广告位：'),
                options: [
                    {id: 0, name:LANG('全部')},
                    {id: 1, name:LANG('指定广告位')}
                ],
                tips:LANG('指定推广订单的广告位。')
            });
            self.create("spot", DealSpotGrid, {
                "target": layout.getContainer(),
                'readonly': c.readonly,
                'auto_load': false,
                'noExport': true
            });
        },
        onChangeFilter: function(ev){
            this.$getAllDeal = 1;
            var spotGrid = this.get('spot');
            if(ev.name == 'dealSW'){
                switch (ev.param){
                    case 0:
                        this.$getAllDeal = 1;
                        break;
                    case 1:
                        this.$getAllDeal = 0;
                        break;
                }
            }
            if(spotGrid){
                // spotGrid.load({
                // 	'getAllDeal': this.$getAllDeal
                // })
            }
        },
        // 更新渠道相应
        updateChannel: function(exchange_id){
            this.$channel = exchange_id;
            this.$.deal.setParam({AdxId: exchange_id}).load();
            this.$.spot.load({'Ids':''});
        },
        // 改变订单
        onDealChange: function(ev){
            // 订单选择时, 更新广告位列表数据
            this.$dealIds = ev.param.selected;
            this.$.spot.load({'Ids':ev.param.selected.join(',')});
        },
        getData: function(){
            var dealResult = []; // 没选广告位时的订单结果
            var result = []; // 返回结果
            var map = {}; // 临时json
            var data = this.$.spot.getData();

            // 先记录订单结果
            util.each(this.$dealIds, function(item){
                dealResult.push({
                    'DealId': item,
                    'PositionIds': []
                })
            })

            // 第一次循环建立订单id映射
            util.each(data, function(item, idx){
                if(item){
                    if(!map[item.DealId]){
                        map[item.DealId] = {
                            DealId: item.DealId,
                            PositionIds: []
                        }
                    }
                }
            });
            // 第二次循环放置订单对应的广告位
            util.each(data, function(item, idx){
                if(item){
                    if(map[item.DealId]){
                        map[item.DealId].PositionIds.push(item.SpotId);
                    }
                }
            });

            // map转换为数组
            util.each(map, function(item, idx){
                if(item){
                    result.push(item);
                }
            });

            // 合并最终结果，如果没有选择广告位的情况，也要传订单id；

            return {
                'result': util.merge(dealResult, result),
                'filterType': this.$.dealSW.getValue()
            };
        },
        setData: function(data){
            if(data){
                var self = this;
                self.$data = data;
                if(data.result.length > 0){
                    // 记录订单id
                    util.each(data.result,function(item){
                        if(item){
                            self.$dealIds.push(item.DealId);
                        }
                    })
                    self.$.deal.setData(data.result);
                    self.$.spot.setData(data.result);
                    self.$.dealSW.setValue(1);
                    self.$.spotSW.setValue(1);
                }
            }
            return this;
        },
        reset: function(){
            var self = this;
            var cs = self.$;
            self.$channel = null;
            self.$data = null;
            self.$dealIds = [];
            cs.spot.reset();
            cs.deal.reset();
            cs.dealSW.setValue(0);
            cs.spotSW.setValue(0);
            return self;
        }
    });
    exports.dealInfo = DealInfo;
});