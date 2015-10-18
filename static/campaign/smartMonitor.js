define(function(require, exports){
    var $ = require("jquery")
        ,app = require("app")
        ,view = require("view")
        ,form = require("form")
        ,popwin = require('popwin')
        ,common = require("common")
        ,grid = require("grid")
        ,util = require('util');

    // 智能监控
    var Monitor = app.extend(form.radio, {
        init: function(config, parent){
            config = $.extend({
                'class': 'M-formItem M-monitor',
                'option': [LANG('关闭'), LANG('引用公用监控设置'), LANG('自定义')],
                'selected': 1,
                'value': 1,
                'changeEvent': false,
                'tips': LANG('开启智能监控后，系统可在满足所定义的条件时自动发送提醒邮件、发系统消息，避免造成损失。多个条件之间是“或”的关系。')
            }, config);

            Monitor.master(this, null, config);
            Monitor.master(this, 'init', arguments);

            this.$data = null;

            this.build();
        },
        build: function(){
            var el = this.el;

            // 公用监控
            this.$publicList =  $('<p class="publicList"/>').text(LANG('暂无公用监控设置，设置请点击')).append($('<a/>').text(' 这里')).appendTo(el);

            // 自定义监控
            this.$customList =  this.create('customList', MonitorDetail, {
                'target': el
            });

            this.jq(this.list[0], 'change', 'changeStatus');
            this.jq(this.list[1], 'change', 'changeStatus');
            this.jq(this.list[2], 'change', 'changeStatus');

            // 触发公用设置
            this.jq(this.$publicList.find('a'),'click', 'eventSetPublic');

            this.changeStatus();

        },
        changeStatus: function(evt){
            var checked1 = this.list[1].prop('checked');
            if(checked1){
                this.loadPublic();
            }
            this.$publicList.hide();

            var checked2 = this.list[2].prop('checked');
            this.$customList[checked2 ? 'show' : 'hide']();
        },
        eventSetPublic: function(ev, elm){
            $(document).find('a[href="#smartMonitor"]').click();
            return false;
        },
        loadPublic: function(){
            var self = this;
            //this.showLoading();
            app.data.get('/alarm/getcampaignalarm', {'IsCommon': true}, self, 'onLoadPublic');
            return self;
        },
        onLoadPublic: function(err, data){
            //this.hideLoading();
            if (err){
                app.error(err);
                if(!err.result){
                    this.list[0].click();
                    this.$publicList[!err.result ? 'show' : 'hide']();
                }
                if (err.message){
                    app.alert(err.message);
                }
                return false;
            }
            this.list[1].click();

        },
        setData: function(data){
            if(data){
                this.$data = data.SmartMonitor;
                var status = data.AlarmStatus;
                switch (status){
                    case 0:
                        this.list[0].click();
                        break;
                    case 1:
                        this.list[1].click();
                        break;
                    case 2:
                        this.list[2].click();
                        this.$.customList.setData(data.SmartMonitor);
                        break;
                }
            }
            return this;
        },
        getData: function(){
            if (this.list[0].prop('checked')){
                return {
                    'Status': 0
                };
            }else if(this.list[1].prop('checked')){
                return {
                    'Status': 1,
                    'IsCommon': true
                };
            }else{
                var customData = this.$.customList.getData();
                var data = {
                    'Id': this.$data && this.$data._id || 0,
                    'Status': 2,
                    'IsCommon': false,
                    'Frequency': customData.Frequency,
                    'Emails': customData.Emails,
                    'RuleIds': customData.RuleIds
                    //'Notify': []
                };
                return data;
            }
        },
        reset: function(){
            this.$data = null;
            if(this.$.customList){
                this.$.customList.reset();
            }
            this.list[1].prop('checked');
            this.list[1].click();
        },
        showLoading: function(){
            if (this.$.loading){
                this.$.loading.show();
            }else {
                this.create('loading', common.loadingMask, {target: this.el});
            }
        },
        hideLoading: function() {
            if (this.$.loading) {
                this.$.loading.hide();
            }
        }
    });
    exports.monitor = Monitor;

    // 监控表单详细
    var MonitorDetail = app.extend(view.container,{
        init: function(config){
            config = $.extend({
                'class': 'M-monitorDetail',
                'hasAddBtn': true,
                'isCommon': false
            }, config);

            MonitorDetail.master(this, null, config);
            MonitorDetail.master(this, 'init', arguments);

            this.$gridData = [];
            this.$data = null;

            this.build();
        }
        ,build: function(){
            var el = this.el;
            var c = this.config;

            var doms = this.doms = {};
            doms.con = $('<div class="M-monitorDetailCon clear"/>').appendTo(el);
            if(c.isCommon){
                doms.con.addClass('M-monitorDetailConPublic');
            }
            doms.conditionCon = $('<div class="M-monitorDetailConditionCon clear"/>').appendTo(doms.con);
            doms.gridCon = $('<div class="M-monitorDetailGridCon clear"/>').appendTo(doms.con);
            doms.emailCon = $('<div class="M-monitorDetailEmailCon clear"/>').appendTo(doms.con);

            // 监控条件
            var itemCon = this.create('conditionLayout', view.itemLayout,{
                'class': 'M-formItemsLayout conditionLayout',
                'target': doms.conditionCon,
                'label': LANG('监控条件：')
            });

            if(c.hasAddBtn){
                var btnCon = $('<div class="btnCon"/>').appendTo(itemCon.getContainer())
                if(!c.isCommon){
                    //复制条件按钮
                    this.create('copy', common.button,{
                        'target': btnCon
                        ,'text': LANG('复制公用条件')
                        ,'data': 'copy'
                        ,'class': 'btnBigGray mr20'
                    });
                }

                //创建条件按钮
                this.create('add', common.button,{
                    'target': btnCon
                    ,'text': LANG('创建新条件')
                    ,'data': 'add'
                    ,'class': 'btnBigGray'
                });
            }

            //表格
            this.create('monitorGrid', MonitorGrid,{
                'target': doms.gridCon
                ,'disabled': c.disabled
                ,"operation":{render: 'renderOperation', cls:'M-gridOPCursor', width:100}
            });

            //监控频率
            itemCon = this.create('freqLayout', view.itemLayout,{
                'class': 'M-formItemsLayout freqLayout',
                'target': doms.emailCon,
                'label': LANG('监控频率：'),
                'suffix': true
            });
            $('<span/>').text(LANG('监控一次')).appendTo(itemCon.getSuffix());

            // 监控频率
            this.create('frequency', common.dropdown,{
                'options': [
                    {Name: LANG('每15分钟'), _id: 15},
                    {Name: LANG('每30分钟'), _id: 30},
                    {Name: LANG('每小时'), _id: 60},
                    {Name: LANG('每2小时'), _id: 120},
                    {Name: LANG('每3小时'), _id: 180},
                    {Name: LANG('每6小时'), _id: 360},
                    {Name: LANG('每12小时'), _id: 720},
                    {Name: LANG('每24小时'), _id: 1440}
                ]
                ,'width': 100
                ,'height': 25
                ,'search': false
                ,'target': itemCon.getContainer()
            }).setData(3600);


            //邮箱提醒
            itemCon = this.create('emailLayout', view.itemLayout,{
                'class': 'M-formItemsLayout emailLayout',
                'target': doms.emailCon,
                'label': LANG('联系邮箱：'),
                'suffix': true
            });
            $('<span class="ml15"/>').text(LANG('多个邮箱使用 ; 隔开')).appendTo(itemCon.getSuffix());
            this.$textarea = $('<textarea/>').appendTo(itemCon.getContainer());


        }
        ,onButtonClick: function(ev){
            var self = this;
            switch (ev.param){
                case 'add':
                    var dlgAdd = self.get('addMonitorItemPopwin');
                    if (!dlgAdd){
                        dlgAdd = self.create('addMonitorItemPopwin', AddMonitorItemPopwin,
                            {
                                'isCommon': self.config.isCommon
                            }
                        );
                    }
                    dlgAdd.reset().show();
                    break;
                case 'copy':

                    if(true){
                        var dlgCopy = self.get('copyMonitorItemPopwin');
                        if (!dlgCopy){
                            dlgCopy = self.create('copyMonitorItemPopwin', CopyMonitorItemPopwin);
                        }
                        dlgCopy.load().show();
                    }else{
                        // 判断数据是否完整
                        var err = [
                            {'text': LANG('您目前还未有设置账号级别的公用监控条件，无法复制公用条件。')},
                            {'text': LANG('温馨提示：可进入账号设置——智能监控进行设置')}
                        ];

                        if (err.length){
                            this.create(
                                "failPop"
                                ,popwin.sysNotice
                                ,{
                                    "data":{
                                        "msg":LANG("未有设置公用条件:")
                                        ,"tip":err
                                    }
                                    ,"width":500
                                    ,"type":"error"
                                }
                            );
                            return false;
                        }
                    }

                    break;
            }
            return false;
        }
        ,getData: function(){
            var self = this;
            var cs = self.$;

            // 转换邮箱
            var emails = [];
            var emailsArr = self.$textarea.val().replace(/(\n)+|(\r\n)+|(；)/g, ';').split(';');
            util.each(emailsArr, function(item, idx){
                if(item){
                    emails.push(item);
                }
            });

            // 转换列表项id
            var ruleIds = [];
            var gridData = cs.monitorGrid.getData();
            util.each(gridData, function(item, idx){
                if(item){
                    ruleIds.push(item._id);
                }
            });

            var data = {
                'Frequency': cs.frequency.getData(),
                'Emails': emails,
                'RuleIds': ruleIds,
                'IsCommon': true
                //'Notify': []
            }

            return data;
        }
        ,setData: function (data){
            if(data){
                this.$data = data;
                this.$gridData = data.Rules;
                this.$.monitorGrid.setData(data.Rules);
                this.$.frequency.setData(data.Frequency);
                this.$textarea.val(data.Emails.join(';\n')+(data.Emails.length?';':''));
            }
            return this;
        }
        ,reset: function(){
            this.$gridData = [];
            this.$data = null;
            this.$.monitorGrid.setData([]);
            this.$.frequency.setData(3600);
            this.$textarea.val('');
            return this;
        }
        ,onAddMonitorItem: function(ev){
            // 如果是数组，合并数组
            if(util.isArray(ev.param)){
                this.$gridData = this.$gridData.concat(ev.param);

                // 否则push
            }else{
                var index = ev.param.index;
                if(util.isNumber(index)){
                    this.$gridData[index] = ev.param;
                    delete this.$gridData[index].index;
                }else{
                    this.$gridData.push(ev.param);
                }
            }

            this.$.monitorGrid.setData(this.$gridData);
        }
        ,onListOpClick: function(ev){
            var data = ev.param.data;
            var index = ev.param.index;
            var op = ev.param.op;
            switch (op){
                case 'edit':
                    this.edit(index, data);
                    break;
                case 'remove':
                    this.remove(index, data);
                    break;
            }
        }
        // 删除指定记录
        ,remove: function(index, data){
            var self = this;
            var gridData = self.$gridData;
            if (gridData[index]){
                app.confirm(LANG('确定要删除选中的记录吗?'), function(ret){
                    if (ret){
                        gridData.splice(index, 1);
                        self.$.monitorGrid.setData(gridData);
                        //app.data.get('/alarm/deletealarmrule', {'Id': data._id}, self, 'onRemove');
                    }
                });
            }
            return this;
        },
        edit: function(index, data){
            var self = this;
            var dlg = self.get('editMonitorItemPopwin');
            if (!dlg){
                dlg = self.create('editMonitorItemPopwin', AddMonitorItemPopwin);
            }
            data.index = +index;
            dlg.setData(data).show();
        },
        onRemove: function(err, data){
            if (err){
                app.error(err);
                if (err.message){
                    app.alert(err.message);
                }
                return false;
            }
        }
    });
    exports.monitorDetail = MonitorDetail;

    // 监控列表
    var MonitorGrid = app.extend(grid.baseNoDate, {
        init: function(config){
            config = $.extend({
                'cols': [
                    {type: 'id', width: 50},
                    {name: 'Conditions', text:LANG('控制条件'), align:'left',render:'renderCondition',sort: false, type: 'op'},
                    {name: 'NeedEmail', text:LANG('预警项'), align:'left',render:'renderCheckbox', sort: false, width: 200, type: 'op'}
                ]
                ,'hasTab': false
                ,'hasExport': false
                ,'hasAmount': false
                ,'hasSearch': false
                ,'hasPager': false
                ,"list":{
                    "scroll_type":"row"
                    ,"scroll_size":5
                    ,'rowSelect': true
                }
            }, config);

            this.$smartMonitorIndex = app.config('smartMonitorIndex');

            MonitorGrid.master(this, null, config);
            MonitorGrid.master(this, 'init', arguments);
        }
        ,renderOperation: function(index, val, row){
            var html = [];
            html.push('<a data-op="edit">编辑</a>');
            html.push('<a data-op="remove">删除</a>');
            return html.join(' | ');
        }
        ,renderCondition: function(idx, val, row, col, td){
            var self = this;
            var con = $('<div class="M-tableListWidthLimit renderCondition"/>').width(420);
            var smartMonitorIndex = app.config('smartMonitorIndex');
            var smartMonitorOperator = app.config('smartMonitorOperator');
            var text = [];

            util.each(val, function(item, idx){
                if(item){
                    var value = +item.Value;
                    // %为单位的，需要转换
                    if(util.find(self.$smartMonitorIndex,item.Name,'_id').NeedTrans){
                        value = value*100;
                    }
                    text.push([item.IsAll ? LANG('最近30天') : LANG('当日')]);
                    text.push(util.find(smartMonitorIndex,item.Name,'_id').Name);
                    text.push(util.find(smartMonitorOperator,item.Comparison,'_id').Name);
                    text.push(value);
                    text.push(util.find(smartMonitorIndex,item.Name,'_id').Unit);
                    text.push(idx == val.length-1 ? '' : '<span>'+LANG('且')+'</span>');
                }
            });
            return con.attr('title', text.join(' ').replace(/<\/?[^>]*>/g,'')).html(text.join(' '));
        }
        ,renderCheckbox: function(idx, val, row, col, td){

            if(!row.NeedEmail && !row.NeedSysLog){
                return '';
            }

            var con = $('<div class="renderCheckbox"/>');
            var text = [];

            if(row.NeedEmail){
                text.push(LANG('邮件提醒'));
            }
            if(row.NeedSysLog){
                text.push(LANG('系统消息提醒'));
            }
            con.html(text.join('、'));
            return con;
        }
        ,renderName: function(idx, val, row, col, td){
            var con = $('<div class="M-tableListWidthLimit "/>').width(100);
            return con.attr('title', val).html(val);
        }
    });
    exports.monitorGrid = MonitorGrid;

    /**
     * 可增减条件- 数量可变
     */
    var FlexibleCondition = app.extend(form.item, {
        init: function(config, parent){
            config = $.extend({
                'holder': '',
                'value': '',
                'type': 'text',
                'label': '',
                'limit': 5
            }, config);
            this.$ready = false;
            this.$data = null;
            this.$amount = 0;
            this.$count = 0;
            FlexibleCondition.master(this, null, config);
            FlexibleCondition.master(this,'init',arguments);
            this.build();
        },
        build: function(){
            if (this.$ready){ return false; }

            var el = this.el.addClass('M-flexibleCondition');

            //构建input组
            this.$conditionGroup = $('<div class="M-flexibleConditionGroup"></div>').appendTo(el);
            //按钮-新增一个输入框
            var addBtn = $('<span class="M-flexibleConditionBtnAdd">+</span>').appendTo(el);

            //绑定按钮事件
            this.jq(addBtn,"click", "eventAddItem");
            this.dg(this.$conditionGroup, '.M-flexibleConditionBtnDel', 'click', 'eventDelItem');

            this.$ready = true;
            this.$smartMonitorIndex = app.config('smartMonitorIndex');

            //构建单条input组
            this.buildItem();

        },
        /**
         * 单条input组
         * @return {Object} Jquery对象
         */
        buildItem: function(data){
            //单条input组
            var conditionItemCon =$('<div class="M-flexibleConditionItemCon"/>').attr('data-index',this.$amount).appendTo(this.$conditionGroup);

            $('<span class="mr15"/>').text(LANG('活动')).appendTo(conditionItemCon);

            // 计数维度
            this.create("count"+this.$amount, common.dropdown,{
                'options': [
                    {Name: LANG('当日'), _id: false},
                    {Name: LANG('最近30天'), _id: true}
                ]
                ,'width': 100
                ,'search': false
                ,'target': conditionItemCon
            }).setData(data ? data.isAll : false);

            // 指标
            this.create("index"+this.$amount, common.dropdown,{
                'options': app.config('smartMonitorIndex')
                ,'width': 100
                ,'search': false
                //,'def': LANG('选择指标')
                ,'target': conditionItemCon
                ,'option_render': this.renderOption
            }).setData(data ? data.Name : (this.$amount > 0 ? 'cpm' : 'cost'));

            // 比较
            this.create("compare"+this.$amount, common.dropdown,{
                'options': app.config('smartMonitorOperator')
                ,'width': 100
                ,'search': false
                ,'target': conditionItemCon
            }).setData(data ? data.Comparison : '>=');

            // 值
            var value = 0;
            if(data && data.Value){
                value = data.Value;
                // %为单位的，需要转换
                if(util.find(this.$smartMonitorIndex,data.Name,'_id').NeedTrans){
                    value = value*100;
                }
            }
            this.create("value"+this.$amount, common.input,{
                'width': 100
                ,'height': 20
                ,'target': conditionItemCon
                ,'value': (data && data.Value) ? value : '0'
            });

            var unit = '';
            if(data && data.Name){
                unit = util.find(this.$smartMonitorIndex, data.Name, '_id').Unit;
            }
            $('<span class="ml15" data-unit-index='+this.$amount+'/>').text((data && data.Name) ? unit : LANG('元')).appendTo(conditionItemCon);

            // 按钮-删除
            $('<span class="M-flexibleConditionBtnDel">-</span>').appendTo(conditionItemCon);

            // 预算提醒
            $('<span class="ml15 bubget" data-budget-index='+this.$amount+'/>').text(LANG('日预算%1元',0)).appendTo(conditionItemCon).hide();

            // 分割线
            $('<div class="borderText"/>').text(LANG('且'))[this.$amount===0 ? 'hide' : 'show']().appendTo(conditionItemCon);
            $('<div class="borderLine"/>')[this.$amount===0 ? 'hide' : 'show']().appendTo(conditionItemCon);

            this.$amount++;
            this.$count++;
            if (this.$amount > 1){
                this.$conditionGroup.find(".M-flexibleConditionBtnDel").show();
            }
        },
        onOptionChange: function(ev){
            // 暂时指标变换有变化

            // 暂时用特殊方法处理日预算的问题
            var re_index = /index/ig;
            var re_count = /count/ig;
            var campaignData = this.parent().parent().parent().parent().getData();
            var isCommon = this.parent().parent().config.isCommon;
            if(re_index.test(ev.name)){
                var id = ev.param.id;
                var index = +ev.name.replace(re_index,'');
                // 设置指标单位
                this.el.find('span[data-unit-index='+index+']').html(util.find(this.$smartMonitorIndex, id, '_id').Unit);
                var countType = this.$['count'+index].getData();

                var bubget_el = this.el.find('span[data-budget-index='+index+']');
                if(id == 'cost' && !isCommon){
                    if(countType){
                        bubget_el.html(LANG('总预算%1元',campaignData.TotalBudget)).show();
                    }else{
                        bubget_el.html(LANG('日预算%1元',campaignData.Budget)).show();
                    }
                }else{
                    bubget_el.hide();
                }
            }
            if(re_count.test(ev.name)){
                var id_count = ev.param.id;
                var index_count = +ev.name.replace(re_count,'');
                var indexType = this.$['index'+index_count].getData();
                var bubget_el_count = this.el.find('span[data-budget-index='+index_count+']');
                if(indexType == 'cost' && !isCommon){
                    if(id_count){
                        bubget_el_count.html(LANG('总预算%1元',campaignData.TotalBudget)).show();
                    }else{
                        bubget_el_count.html(LANG('日预算%1元',campaignData.Budget)).show();
                    }
                }
            }

        },
        renderOption: function(id, opt, dom){
            if(opt._id == 'group'){
                $(dom).addClass('optionGroup').click(function(){
                    return false;
                });
            }else {
                $(dom).addClass('optionItem')
            }
            return opt.Name;
        },
        /**
         * 新增-按钮的回调事件
         * @param  {object} ev 事件对象
         */
        eventAddItem: function(ev, elm){
            if(this.$count >= this.config.limit){
                app.notify(LANG('已达到条件的最大数量'));
                return false;
            }

            this.buildItem();
        },
        /**
         * 删除-按钮的回调事件
         * @param  {object} ev 事件对象
         */
        eventDelItem: function(ev, elm){
            if(this.$count > 0){
                $(elm).parent().hide();
                this.$count--;
                var visibleItem = this.$conditionGroup.find('.M-flexibleConditionItemCon').filter(':visible');
                if(this.$count == 1){
                    visibleItem.find('.M-flexibleConditionBtnDel').hide();
                }
                // 隐藏最顶上的分割线
                visibleItem.find('.borderText').eq(0).hide();
                visibleItem.find('.borderLine').eq(0).hide();
            }
        },
        getData: function(){
            var self = this;
            var cs = self.$;
            var data = [];
            var items = self.$conditionGroup.find('.M-flexibleConditionItemCon').filter(':visible');
            $.each(items, function(idx, item){
                if(item){
                    var index = $(item).attr('data-index');
                    var name = cs['index'+index].getData();
                    var value = Math.round(+cs['value'+index].getData()*100)/100;
                    // %为单位的，需要转换
                    if(util.find(self.$smartMonitorIndex,name,'_id').NeedTrans){
                        value = value/100;
                    }
                    data.push({
                        'Name': name,
                        'Comparison': cs['compare'+index].getData(),
                        'Value':  value,
                        'IsAll': cs['count'+index].getData()
                    });
                }

            });
            return data;
        },
        setData: function(data){
            var self = this;
            self.$data = data;
            // 全清
            self.reset(true);
            // 根据data重新构建
            for(var i=0; i<data.length; i++){
                self.buildItem(data[i]);
            }

            return self;
        },
        reset: function(full){
            var self = this;
            var cs = self.$;
            self.$data = null;

            self.$amount = 0;
            self.$count = 0;

            var items = self.$conditionGroup.find('.M-flexibleConditionItemCon');
            $.each(items, function(idx, item){
                if(item){
                    var index = $(item).attr('data-index');
                    cs['index'+index].destroy();
                    cs['compare'+index].destroy();
                    cs['value'+index].destroy();
                    cs['count'+index].destroy();
                }
            });
            self.$conditionGroup.empty();
            // 是否全清
            if(!full){
                self.buildItem();
            }
        }
    });
    exports.flexibleCondition = FlexibleCondition;

    // 创建新条件弹窗
    var AddMonitorItemPopwin = app.extend(popwin.base, {
        init: function(config, parent){
            config = $.extend({
                'title': LANG('创建新条件'),
                'width': 800,
                'class': 'M-popwin M-monitorDetailPopwin',
                'isCommon': false
            }, config);

            AddMonitorItemPopwin.master(this, null, config);
            AddMonitorItemPopwin.master(this, 'init', arguments);

            this.$index = null;
            this.$data = null;
            this.build();
        },
        build: function(){
            var body = this.body;
            var con = $('<div class="M-monitorDetailPopwinCon"/>').appendTo(body);

            // 描述
            $('<p class="desc"/>').text(LANG('为了得到更精确的监控效果，您可以同时设置基础指标和效果指标。')).appendTo(con);

            // 条件名称
            this.create('conditionName', form.input, {
                'target': con,
                'label': LANG('条件名称：'),
                'width': 150
            }).hide();

            // 累加
            this.create('flexibleCondition', FlexibleCondition, {
                'target': con
            });

            // checkbox
            this.create('checkbox', form.checkbox, {
                'target': con,
                'label': '',
                'option': [
                    LANG('发邮件提醒')
                    , LANG('发系统消息')
                    //, LANG('暂停投放')
                ]
            }).setData([0,1]);
        },
        load: function(param){
            return this;
        },
        onOk:function(evt){
            var self = this;
            var data = self.getData();

            if(data && data.Conditions && data.Conditions.length){
                var cond = data.Conditions;
                var isError = false;
                util.each(cond, function(item, idx){
                    if(item){
                        if(!util.isNumber(item.Value) || item.Value < 0){
                            isError = true;
                        }
                    }
                });
                if(isError){
                    app.alert(LANG('请输入≥0的数字，小数保存到小数点后两位！'));
                    return false;
                }
                if(!data.NeedEmail && !data.NeedSysLog){
                    app.alert(LANG('请至少选择一种监控预警项'));
                    return false;
                }
            }

            app.data.put('/alarm/addalarmrule', data, self, 'onData');
        },
        onData: function(err, data){
            if (err){
                app.error(err);
                if (err.message){
                    app.alert(err.message);
                }
                return false;
            }
            //app.notify(LANG('创建成功'));
            data.index = this.$index;
            this.fire("addMonitorItem", data);
            this.hide();
        },
        getData: function(){
            var self = this;
            var data = {
                'Name': self.$.conditionName.getData(),
                'Conditions': self.$.flexibleCondition.getData(),
                'NeedStop': false,
                'NeedSysLog': false,
                'NeedEmail': false
            };
            var checkboxData = self.$.checkbox.getData();
            util.each(checkboxData, function(item, idx){
                if(+item === 0){
                    data.NeedEmail = true;
                }else if(+item === 1){
                    data.NeedSysLog = true;
                }else if(+item === 2){
                    data.NeedStop = true;
                }
            });
            if(self.$data && self.$data._id){
                data.Id = self.$data._id;
            }

            return data;
        },
        setData: function(data){
            var self = this;
            if(data){
                self.$data = data;
                self.$index = data.index;
                self.$.conditionName.setData(data.Name)
                self.$.flexibleCondition.setData(data.Conditions);
                var checkboxData = [];
                if(data.NeedEmail){
                    checkboxData.push(0);
                }
                if(data.NeedSysLog){
                    checkboxData.push(1);
                }
                if(data.NeedStop){
                    checkboxData.push(2);
                }

                if(checkboxData.length){
                    self.$.checkbox.setData(checkboxData);
                }else{
                    self.$.checkbox.reset();
                }
            }
            return self;
        },
        reset: function(){
            var self = this;
            self.$index = null;
            self.$data = null;
            self.$.conditionName.setData('');
            self.$.flexibleCondition.reset();
            self.$.checkbox.setData([0,1]);
            return self;
        }
    });

    // 复制公用条件弹窗
    var CopyMonitorItemPopwin = app.extend(popwin.base, {
        init: function(config, parent){
            config = $.extend({
                'title': LANG('复制公用条件'),
                'width': 1000,
                'class': 'M-popwin M-monitorDetailPopwin'
            }, config);

            CopyMonitorItemPopwin.master(this, null, config);
            CopyMonitorItemPopwin.master(this, 'init', arguments);

            this.build();
        },
        build: function(){
            var body = this.body;
            var con = $('<div class="M-monitorDetailPopwinCon"/>').appendTo(body);
            $('<p class="desc  mb10"/>').html(LANG('公用监控条件可以被账号下的所有活动引用，可进入：账号设置——智能监控进行<a class="setBtn"> 设置</a>。')).appendTo(con);
            $('<p class="desc mb20"/>').text(LANG('复制选中的公用条件后，编辑条件不会影响原有的公用条件设置。')).appendTo(con);

            this.create('monitorGrid', MonitorGrid, {
                'target': con
                ,'hasSelect': true
                ,'operation': null
                ,'url': 'alarm/listalarmrule'
                ,'param': {'isCommon': true}
                ,'cols': [
                    {type: 'id', width: 50},
                    //{name: 'Name', text:LANG('条件名称'), align:'left',render:'renderName',sort: false},
                    {name: 'Conditions', text:LANG('控制条件'), align:'left',render:'renderCondition',sort: false},
                    {name: 'NeedEmail', text:LANG('预警项'), align:'left',render:'renderCheckbox', sort: false, width: 200}
                ]

            });
            // 触发公用设置
            this.jq(body.find('.setBtn'),'click', 'eventSetPublic');
        },
        load: function(param){
            this.$.monitorGrid.load();
            this.$.monitorGrid.setSelectRowIds([]);
            return this;
        },
        onOk:function(evt){
            var self = this;
            var data = [];
            var gridData = self.$.monitorGrid.getData();
            var ids = self.$.monitorGrid.getSelectRowId();

            for (var i=ids.length; i>0;){
                var item = util.find(gridData, ids[--i], '_id');
                if (item){
                    data.push(item._id);
                }
            }
            if(data.length){
                app.data.put('/alarm/copyalarmrule', {'Ids': data}, self, 'onData');
            }

            //self.fire("addMonitorItem", data);
            self.hide();
        },
        onData: function(err, data){
            if (err){
                app.error(err);
                if (err.message){
                    app.alert(err.message);
                }
                return false;
            }
            this.fire("addMonitorItem", data);
            this.hide();
        },
        eventSetPublic: function(ev, elm){
            $(document).find('a[href="#smartMonitor"]').click();
            return false;
        },
        onSetMonitorSuccess: function(ev){
            this.load();
        }
    });

    // 智能监控弹窗
    var MonitorPopwin = app.extend(popwin.base, {
        init: function(config, parent){
            config = $.extend({
                'title': LANG('智能监控公用设置'),
                'width': 1000,
                'class': 'M-popwin M-monitorDetailPopwin',
                'buttonConfig': {
                    // 确定按钮样式
                    "ok": {
                        "type":"button"
                        ,"value":LANG("保存")
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
            }, config);

            MonitorPopwin.master(this, null, config);
            MonitorPopwin.master(this, 'init', arguments);

            this.$data = null;

            this.build();
        },
        build: function(){
            var el = this.body;
            // 描述
            $('<p class="descPublic"/>')
                .text(LANG('修改公用设置后，所有引用此设置的活动也会同步修改。'))
                .appendTo(el);
            // 内容区
            this.$publicList =  this.create('publicList', MonitorDetail, {
                'target': el,
                'isCommon': true
            });
        },
        setData: function(data){
            this.$data = data;
            this.$publicList.setData(data);
            return this;
        },
        load: function(param){
            var self = this;
            app.showLoading();
            app.data.get('/alarm/getcampaignalarm', {'IsCommon': true}, self, 'onData');
            return self;
        },
        onData: function(err, data){
            app.hideLoading();
            if (err){
                app.error(err);
                if (err.message){
                    app.alert(err.message);
                }
                return false;
            }
            this.setData(data);
        },
        onOk: function(evt){
            var self = this;
            var data = this.$publicList.getData();
            if(self.$data && self.$data._id){
                data.Id = self.$data._id;
            }

            if(data){
                var isError = false;
                util.each(data.Emails, function(item, idx){
                    if(item && !util.isEmail(item)){
                        isError = true;
                    }
                });
                if(isError){
                    app.alert(LANG('智能监控联系邮箱存在格式错误！'));
                    return false;
                }
            }

            if(data.Id){
                app.confirm(LANG('修改公用设置后，所有引用此设置的活动也会同步修改。是否继续保存？'), function(isOk){
                    if(isOk){
                        app.data.put('/alarm/addcampaignalarm', data, self, 'onSave');
                    }
                })
            }else{
                app.data.put('/alarm/addcampaignalarm', data, self, 'onSave');
            }

        },
        onSave: function(err, data){
            if (err){
                app.error(err);
                if (err.message){
                    app.alert(err.message);
                }
                return false;
            }
            this.hide();
            //app.notify(LANG('公用设置保存成功'));
            app.core.cast('setMonitorSuccess');

        },
        reset: function(){
            this.$data = null;
            this.$publicList.reset();
            return this;
        },
        /**
         * 显示数据加载中
         * @return {None} 无返回
         */
        showLoading: function() {
            var con = this.el;
            if (!this.loadingRow){
                this.loadingRow = $('<div class="M-tableListLoading"/>');
                this.loadingRow.appendTo(con).text(LANG("数据加载中"));
            }
            this.loadingRow.width(con.outerWidth()).height(con.outerHeight()).css(con.position());
            this.loadingRow.show();
        },
        /**
         * 隐藏数据加载提示
         * @return {None} 无返回
         */
        hideLoading: function() {
            if (this.loadingRow) {
                this.loadingRow.hide();
            }
        }
    });
    exports.monitorPopwin = MonitorPopwin;

});