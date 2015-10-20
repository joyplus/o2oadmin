define(function(require, exports){
    var $ = require("jquery")
        ,app = require("app")
        ,tpl = require("tpl")
        ,view = require("view")
        ,common = require("common")
        ,date = require("views/datebar")
        ,grid = require("grid")
        ,form = require("form")
        ,popwin = require("popwin")
        ,util = require('util')
        ,country = require('country')
        ,taglabels = require('taglabels')
        ,table = require('grid/table')
        ,spotFilter = require('spotFilter')
        ,chart = require("chart")
        ,smartMonitor = require('smartMonitor')
        ,tab = require("tab")
        ,premium = require('premium');

    var THUMB_BUILDER = app.config("front_base")+"sweety/imageshow"
        ,FRONT_BASE = app.config("front_base");

    /**
     * 活动页面列表
     */
    var List = app.extend(view.container,{
        init:function(config,parent){
            config = $.extend(
                true
                ,{
                    "grid":{
                        'functional':{
                            "where":1,
                            "align":'left',
                            "text":LANG("状态"),
                            "render":this.reanderFunctional,
                            "context":this
                        },
                        "cols":[
                            {
                                "name":"_id","type":"fixed","sort":true
                                ,"align":"center","width":60
                                ,"render":"renderIdCell"
                            }
                        ],
                        "amount":{
                            "hasItemClick":true
                            ,"showAct":true
                        },
                        // 自动刷新
                        'hasRefresh': true,
                        'auto_load': false,
                        "batch":{
                            "enable":true
                        },
                        'hasAdvancedSearch': true,
                        // 更新活动全局信息
                        'updateGlobal': true,
                        'hasFrozen': false
                        // 'refresh_auto': this.config.state
                    }
                }
                ,config
            );

            var mod = app.core.get('balance');
            if (mod){
                config.state = mod.getState();
            }else {
                config.state = true;
            }
            config.grid.refresh_auto = config.state;

            List.master(this,null,config);
            List.master(this,"init",[config]);

            this.$trends = {};
            this.$readOnly = false;

            this.build();
        },
        build:function(){
            // 所有活动和单个活动切换按钮
            var titleCon = $('<div class="P-campaignTitle"/>').appendTo(this.el);
            this.create('buttonGroup', common.buttonGroup, {
                'target': titleCon,
                'label': null,
                'items': [LANG('所有活动'), LANG('单个活动')],
                'selected':0
            });
            // 时间段控件
            this.date = this.create('date', date.datepicker, {target: this.el});

            var div = $('<div class="P-campaignListCon"/>').appendTo(this.el);
            // 活动类型过滤
            this.type = this.create(
                'type', taglabels.listType,
                {
                    'target':div,
                    'all_label':LANG('所有活动'),
                    'data': [null, LANG('PC广告'), LANG('广告监测'),/*, LANG('直投')*/'', LANG('移动广告')]
                }
            );

            // 根据权限是否有竞价过滤
            var campany = app.getUserCampany();
            var hasPref = campany.HasCreatePref;	// 首选订单
            var hasPriv = campany.HasCreatePriv;	// 私有订单
            var bidTypeData = [];

            switch (true){
                case (!hasPref && !hasPriv):
                    bidTypeData = [];
                    break;
                case (hasPref && !hasPriv):
                    bidTypeData = [null, LANG('首选交易活动'), null];
                    break;
                case (!hasPref && hasPriv):
                    bidTypeData = [null, null, LANG('私下竞价活动'), null];
                    break;
                case (hasPref && hasPriv):
                    bidTypeData = [null, LANG('首选交易活动'), LANG('私下竞价活动'), null];
                    break;
            }

            if(bidTypeData.length){
                // 活动类型过滤
                this.bidType = this.create(
                    'bidType', taglabels.listType,
                    {
                        'target':div,
                        'title': LANG('竞价：'),
                        'all_label':LANG('所有活动'),
                        'data': bidTypeData
                    }
                ).hide();
            }


            // 频道过滤
            this.create(
                "channel"
                ,taglabels.channelLabels
                ,{
                    "target":div
                    ,'all_label': LANG('所有渠道')
                    ,'data': null
                    ,"collapse":true
                }
            )[app.getUserAuth(app.config('auth/hide_creative'), 'isEmployee') ? 'hide' : 'show']();

            // 标签过滤
            this.tags = this.create(
                "tags"
                ,taglabels.simple
                ,{
                    "target":div
                    ,"type":'CampaignLabel'
                }
            )[app.getUserAuth(app.config('auth/hide_creative'), 'isEmployee') ? 'hide' : 'show']();

            // 活动状态过滤
            div = $('<div class="P-campaignListConStatus"/>').appendTo(div);
            this.status = this.create(
                "status"
                ,taglabels.listType
                ,{
                    "target":div
                    // ,'class': 'M-tagLabelsSimpleContainer P-tagLabelsSimpleContainer--status'
                    ,"all_label":LANG('所有有效活动')
                    ,'title': LANG('状态：')
                    ,'data': [
                        null, LANG('进行中'), LANG('已暂停'),
                        LANG('未开始'), LANG('已结束'), LANG('超预算'),
                        {'html': '<em/>'+LANG("已归档"), cls:'archive'},
                        {'html': '<em/>'+LANG("草稿"), cls:'archive'}
                    ]
                }
            );
            var tmp = this.date.getNowType();
            if(!tmp){
                tmp = this.date.getData();
                tmp = tmp.date ? {"nowDate":tmp.date} : null;
            }
            this.create(
                "chart"
                ,chart.advChart
                ,{
                    "target":this.el
                }
            );
            this.$.chart.changeTitle(tmp);
            tmp = null;

            var addCon = $('<div class="P-campaignAddBtnOther" />').appendTo(this.el);
            var tmpCon = $('<div class="P-campaignAddBtn" />').appendTo(this.el);

            this.addBtnCreative = this.create(
                "addBtnCreative"
                ,view.container
                ,{
                    "target":addCon
                    ,"tag":"button"
                    ,"class":"btnAddGreen creativeAddBtn"
                    ,"html":"<em></em>"+LANG('添加创意包')
                }
            );
            this.addBtnWhisky = this.create(
                "addBtnWhisky"
                ,view.container
                ,{
                    "target":addCon
                    ,"tag":"button"
                    ,"class":"btnAddGreen ml20 whiskyAddBtn"
                    ,"html":"<em></em>"+LANG('添加落地页')
                    ,"data-action":"addWhisky"
                }
            );

            // 添加按钮
            this.addBtn = this.create('addBtn', form.campaignButton, {
                'target': tmpCon
            });

            this.jq(this.addBtnCreative.el,"click","onButtonClick");
            this.jq(this.addBtnWhisky.el,"click","onButtonClick");


            // 运行状态过滤
            // this.create('runStatus', ListRunStatus);
            // 活动列表
            this.grid = this.create('grid', grid.campaign,this.config.grid);
            this.dg(this.grid.list.body,"td[data-cellFn]","click mouseenter mouseleave","cellFnHandler");
            this.grid.amount.setAct(0,1);

            this.create("campaignBudget", popwin.campaignBudget);

            // 手动更新一次状态
            this.onUserChange();
        },
        // 过滤RTB类型
        filterRtbType: function() {
            this.type.el.find('span[data-id="1"]').trigger('click');
        },
        // 过滤代理类型
        filterProxyType: function() {
            this.type.el.find('span[data-id="2"]').trigger('click');
        },
        /**
         * 汇总项的点击消息响应函数
         * @param  {Object} ev 消息对象
         * @return {Bool}      false
         */
        onAmountItemClick:function(ev){
            ev = ev.param;
            if(this.$.chart && this.$.chart.ready){
                this.$.chart.changeIndex({
                    "id":ev.name
                    ,"option":ev.label
                });
            }
            ev = null;
            return false;
        },
        eventDropdownShow: function(ev){
            this.$conDropdown.toggle();
            return false;
        },
        eventPcDropdownShow: function(ev){
            this.$pcCon.toggle();
            return false;
        },
        eventMtDropdownShow: function(ev){
            this.$mtCon.toggle();
            return false;
        },
        /**
         * 检测是否已经有添加到图表中。无自动刷新的地方不需要去检测。默认是未添加
         * @param  {Number} id 数据对应的ID
         * @return {Number}    是否已添加。0/1
         */
        checkChart:function(id){
            var has;
            if(this.$trends[id]){
                has = 1;
            }else{
                has = this.$.chart && this.$.chart.hasAdded(id) || undefined;
                has = has === undefined?0:1;
            }
            return has;
        },
        /**
         * id单元格渲染函数
         * @return {String}  处理后的html字符串
         */
        renderIdCell:function(index,value,row,col,td){
            td.attr({
                // 行索引
                "data-index":index
                // 功能标识
                ,"data-cellFn":1
                // 当已添加到图表中的时候高亮第一个单元格
                ,"class":this.$trends[row._id]?"M-tableListCellFn M-tableListMark":"M-tableListCellFn"
            });
            return '<span>'+row._id+'</span>';
        },
        /**
         * 行首单元格事件响应函数
         * @param  {Object} ev 鼠标消息对象
         * @return {Bool}      false
         */
        cellFnHandler:function(ev){
            var tar = $(ev.target).closest("td");
            switch(ev.type){
                case "click":
                    var index = +tar.attr("data-index")
                        ,data = this.$.grid.list.rowData(index)
                        ,el = this.$.grid.list.getRow(index).find("a[data-func='trend']");
                    this.trendHandler(
                        el
                        ,this.$trends[data._id]?1:0
                        ,data
                        ,index
                        ,tar
                    );
                    el = data = index = tar = null;
                    break;

                case "mouseenter":
                    tar.addClass("M-tableListCellFnAct");
                    break;

                case "mouseleave":
                    tar.removeClass("M-tableListCellFnAct");
                    break;
            }
            return false;
        },
        // 列表功能操作响应函数
        reanderFunctional: function(index,value,row,col,td,list,rowDom){
            var html = ''
                ,status
                ,rs = row.RunStatus;

            if (row.IsDeleted) {		// 归档的状况
                html += '<a data-func="none" title="'+LANG("已归档")+'" href="#"><em class="G-iconFunc store"/></a>';
            }else if(row.IsDraft){
                html += '<a data-func="none" title="'+LANG("草稿")+'" href="#"><em class="G-iconFunc draft"/></a>';
            } else if (rs >=1 && rs <= 6){
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

            if (row.IsDeleted){
                html += '<a data-func="restore" title="'+LANG("还原")+'" href="#"><em class="G-iconFunc restore"/></a>';
                html += '<a data-func="detail" title="'+LANG("详情")+'" href="#"><em class="G-iconFunc list"/></a>';
                html += '<a data-func="saveas" title="'+LANG("另存为")+'" href="#"><em class="G-iconFunc saveas"/></a>';
                return html;
            }

            if (row.IsDraft){
                html += '<a data-func="edit" title="'+LANG("编辑")+'" href="#"><em class="G-iconFunc edit"/></a>';
                html += '<a data-func="saveas" title="'+LANG("另存为")+'" href="#"><em class="G-iconFunc saveas"/></a>';
                return html;
            }

            if (!this.$readOnly && (row.Channel === 1 || row.Channel === 4)){
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

            // 检测是否已经有添加到图表中。无自动刷新的地方不需要去检测。默认是未添加
            var tmp = this.checkChart(row._id);
            html += '<a data-func="trend" data-added="'+tmp+'" title="'+LANG("绘图")+'" href="#"><em class="G-iconFunc trend"/></a>';
            tmp = null;

            // 详情按钮
            html += '<a data-func="detail" title="'+LANG("详情")+'" href="#"><em class="G-iconFunc list"/></a>';
            if(row.Channel === 1 || row.Channel === 4){
                // 代理没有活动诊断
                html += '<a data-func="diagnosis" title="'+LANG("活动诊断")+'" href="#"><em class="G-iconFunc diagnosis"/></a>';
            }

            // 自读权限只有详情
            if (this.$readOnly){ return html; }

            // 编辑按钮
            html += '<a data-func="edit" title="'+LANG("编辑")+'" href="#"><em class="G-iconFunc edit"/></a>';

            // 另存按钮
            html += '<a data-func="saveas" title="'+LANG("另存为")+'" href="#"><em class="G-iconFunc saveas"/></a>';
            // 删除按钮
            // html += '<a data-func="remove" title="'+LANG("删除")+'" href="#"><em class="G-iconFunc trash"/></a>';

            // 归档按钮
            html += '<a data-func="store" title="'+LANG("归档")+'" href="#"><em class="G-iconFunc store"/></a>';

            if (row.Channel === 2){
                // 复制代码
                html += '<a data-func="code" title="'+LANG("广告位代码")+'" href="#"><em class="G-iconFunc code"/></a>';
            }

            if(row.Channel === 1 || row.Channel === 4){
                // 代理没有在线查看广告功能
                // html += '<a data-func="adOnline" title="'+LANG("在线查看广告")+'" href="#"><em class="G-iconFunc adOnline"/></a>';
            }

            return html;
        },
        // 用户切换更新列表记录
        onUserChange:function(ev){
            var user = app.getUser();
            if (user && user.auth > 1){
                this.addBtn.show();
                this.$readOnly = false;
            }else {
                this.addBtn.hide();
                this.$readOnly = true;
            }
            this.grid.load();
        },
        /**
         * 列表操作回调函数
         * @param  {Object} ev 事件变量对象
         * @return {Boolean}   返回false阻止事件冒泡
         */
        onListFnClick: function(ev){
            var param = ev.param;
            var id = param.data._id;
            var bidType = param.data.BidType || 0;
            switch (param.func){
                case 'detail':
                    window.open('#/campaign/detail/'+id);
                    break;
                case 'edit':
                    var action = 'edit';	// 下次再合体
                    switch (param.data.Channel){
                        case 2:
                            action = 'agentEdit';
                            window.open('#/campaign/'+action+'/'+id);
                            break;
                        case 3:
                            action = 'directEdit';
                            window.open('#/campaign/'+action+'/'+id);
                            break;
                        case 4:
                            action = 'MTEdit';
                            window.open('#/campaign/'+action+'/'+id+'?BidType='+bidType);
                            break;
                        default:
                            window.open('#/campaign/'+action+'/'+id+'?BidType='+bidType);
                    }

                    break;
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
                case 'remove':
                    if (confirm(LANG('真的要删除这个活动记录吗?'))){
                        app.data.del(
                            '/rest/deletecampaign',
                            {'Id': id},
                            this.cbRemove, this, param
                        );
                    }
                    break;
                case 'store':
                    if (confirm(LANG('真的要归档这个活动记录吗?'))){
                        param.IsDeleted = 1;
                        app.data.del(
                            '/rest/deletecampaign',
                            {'Id': id},
                            this.cbStore, this, param
                        );
                    }
                    break;
                case 'restore':
                    if (confirm(LANG('真的要取消这个活动记录的归档吗?'))){
                        param.IsDeleted = 0;
                        app.data.get(
                            '/sweety/recyclecampaign',
                            {'Id': id},
                            this.cbStore, this, param
                        );
                    }
                    break;
                case "diagnosis":
                    window.open('#campaign/diagnosis/'+id);
                    break;
                case 'code':
                    window.open('#campaign/code/'+id);
                    break;
                case "saveas":
                    window.open('#campaign/saveas/'+id+"?Channel="+param.data.Channel+'&BidType='+bidType);
                    break;
                case "trend":
                    var el = ev.param.el
                        ,added = el.attr("data-added");

                    added = added && +added || false;
                    this.trendHandler(el,added,param.data,ev.param.index);
                    el = added = null;
                    break;

                case "budget":
                    var data = param.data;
                    this.$.campaignBudget.reload({
                        "data":{
                            "Budget":data.Budget
                            ,"TotalBudget":data.TotalBudget
                            ,"Id":id
                        }
                        ,"anchor":param.el
                        ,"pos":"tm"
                    });
                    this.$.campaignBudget.show();
                    data = null;
                    break;

                case 'adOnline':
                    window.open('#campaign/adOnline/'+id);
                    break;
            }
            return false;
        },
        /**
         * 修改活动预算
         * @param  {Object} ev 消息对象
         * @return {Bool}      false
         */
        onCampaignBudgetOk:function(ev){
            var dat = ev.param;
            if(dat.Budget !== dat.oldBudget || dat.TotalBudget !== dat.oldTotalBudget){
                app.data.get(
                    "/rest/campaignbudgetset"
                    ,{
                        "TotalBudget":dat.TotalBudget
                        ,"Budget":dat.Budget
                        ,"CampaignId":dat.Id
                    }
                    ,this
                    ,"onChangeBudgetData"
                );
            }
            ev = dat = null;
            return false;
        },
        /**
         * 修改活动预算请求响应函数
         * @param  {Object}    err  错误信息
         * @param  {Object}    data 返回的数据对象
         * @return {Undefined}      无返回值
         */
        onChangeBudgetData:function(err,data){
            if(err){
                console.log(err.message);
                return false;
            }
            app.alert(LANG("活动预算修改成功。"));
            var grid = this.$.grid;
            grid.setRow(data._id,"Budget",data.Budget,1);
            grid.setRow(data._id,"TotalBudget",data.TotalBudget,1);
        },
        /**
         * 趋势相关UI处理函数
         * @param  {Object}    el     操作处理Dom对象
         * @param  {Bool}      status 状态
         * @param  {Object}    data   对应行的数据
         * @param  {Number}    index  对应行的行号索引
         * @param  {Object}    td     <可选>行首单元格dom
         * @return {Undefined}        无返回值
         */
        trendHandler:function(el,status,data,index,td){
            if(arguments.length < 4){
                app.log("缺少必要参数。需要至少4个啊亲。");
                return;
            }
            // 添加结果，失败时候是false
            var re = this.$.chart[
            status && "removeSeries" || "addSeries"
                ](data);

            if(!re && !status){
                // 添加失败
                status = !status;
            }
            if(status){
                delete this.$trends[data._id];
            }else{
                this.$trends[data._id] = 1;
            }
            el.attr({
                "data-added":status?0:1
                ,"title":status?LANG("绘图"):LANG("取消绘图")
            })
                // 图标切换
                .find("em:first").attr("class","G-iconFunc "+(status?"trend":"deltrend"));
            // 行首的高亮
            td = td || this.$.grid.list.getRow(index).find("td:first");
            td[
            status && "removeClass" || "addClass"
                ]("M-tableListMark");

            el = status = data = index = td = null;
        },
        /**
         * 修改记录状态操作
         */
        cbSetStatus: function(err, data, param){
            if (err){
                app.alert(err.message);
                return false;
            }
            // var row = this.grid.config.data[param.index];
            // row.Status = param.Status;
            // row.RunStatus = (row.Status === 1 ? 2 : 4);
            // this.grid.setRow(param.index, row);
            this.grid.load();
        },
        /**
         * 归档及取消归档记录操作
         */
        cbStore: function(err, data, param){
            if (err){
                app.alert(err.message);
                return false;
            }
            // 调用余额模块刷新余额信息
            // app.core.get("balance").fetch();
            // var row = this.grid.config.data[param.index];
            // row.IsDeleted = param.IsDeleted;
            // this.grid.setRow(param.index, row);
            this.grid.load();
        },
        /**
         * 删除记录操作
         */
        cbRemove: function(err, data, param){
            if (err){
                app.alert(err.message);
                return false;
            }
            // 调用余额模块刷新余额信息
            app.core.get("balance").fetch();
            this.grid.setRow(param.index);
        },
        /**
         * 标签点击事件响应函数
         * @param  {Object}    ev 消息对象
         * @return {Undefined}    无返回值
         */
        onSimpleLabelChange:function(ev){
            if (ev.param){
                this.grid.setParam({'Label':JSON.stringify(ev.param)});
            }else {
                this.grid.setParam({'Label':null});
            }
            this.grid.load();
            return false;
        },
        /**
         * 列表活动类型过滤响应
         * @param  {Object}    ev 消息对象
         * @return {Undefined}    无返回值
         */
        onListTypeChange: function(ev){
            var type = +ev.param.type;
            var grid = this.grid;
            this.grid.list.body.find("tr > td.M-tableListMark").removeClass("M-tableListMark");
            switch (ev.name){
                case 'type':
                    this.$ChannelType = type;
                    grid.setParam({
                        'Channel': (type || null),
                        'SubChannel': ''
                    });

                    // 切换渠道显示
                    this.$.channel.setMode(type);
                    if(this.bidType){
                        this.bidType[type==2 ? 'hide' : 'hide']();
                    }
                    break;
                case 'bidType':
                    grid.setParam({
                        'bidType': type
                    });
                    break;
                case 'status':
                    var trans = [0, 2, 4, 1, 3, 5];
                    // 筛选归档
                    if (type == 6) {
                        grid.setSort('UpdateTime', 'desc').setParam({
                            'IsDeleted': 1,
                            'IsDraft': null,
                            'RunStatus': null
                        });
                    } else if(type == 7){
                        grid.setSort('UpdateTime', 'desc').setParam({
                            'IsDeleted': null,
                            'IsDraft': 1,
                            'RunStatus': null
                        });
                    } else{
                        type = trans[type] || 0;
                        grid.setSort({
                            'impressions': 'desc',
                            'clicks': 'desc'
                        }).setParam({
                            'IsDeleted': null,
                            'IsDraft': null,
                            'RunStatus': (type || null)
                        });
                    }
                    break;
                case 'channel':
                    var id = (ev.param.item && ev.param.item.id) || '';

                    grid.setParam({
                        "SubChannel": id
                    });

                    // 只需要根据渠道，就能判断活动类型
                    if(ev.param.item && ev.param.item.isMobile){
                        grid.setParam({
                            "Channel": 4
                        });
                    }else if(ev.param.item && ev.param.item.agent){
                        grid.setParam({
                            "Channel": 2
                        });
                    }else if(ev.param.item && ev.param.item.isPc){
                        grid.setParam({
                            "Channel": 1
                        });
                    }else{
                        grid.setParam({
                            "Channel": this.$ChannelType
                        });
                    }

                    break;
                default:
                    return false;
            }
            grid.setPage(1);
            grid.load();
            grid.setSelectRowIds([]);
            return false;
        },
        /**
         * 运行状态功能响应函数
         * @param  {Object}    ev 消息对象
         * @return {Boolean}      阻止冒泡
         */
        onRunStatusChange: function(ev){
            if (ev.param > 0){
                this.grid.setParam({'RunStatus':ev.param,"page":1});
            }else {
                this.grid.setParam({'RunStatus':null,"page":1});
            }
            this.grid.load();
            return false;
        },
        /**
         * 添加按钮点击事件
         */
        onButtonClick: function(ev){
            var clsReg = /(\w+)AddBtn/;
            var m = ev.target.className.match(clsReg);
            var hash = '';

            // 添加创意包和添加落地页用
            if(m[1]){
                switch(m[1]) {
                    case 'creative':
                        hash = "#/creative/add";
                        break;
                    case 'whisky':
                        hash = "#/whisky/add";
                        break;
                }
                window.open(window.location.href.split('#',1)+hash);
                return false;
            }
        },
        /**
         * 活动表格成功保存事件
         */
        onSaveCampaignSuccess: function(ev){
            if (this.tags){
                this.tags.refresh();
            }
            this.grid.load();

            if (ev.param && ev.param.id) {
                this.grid.setRowHighlight(ev.param.id);
            }
        }
        /**
         * 余额变化通知事件
         */
        ,onBalanceChange:function(ev){
            this.config.state = ev.param;
            if (!ev.param){
                this.grid.toggleRefresh(0);
            }
            this.grid.load();
        }
        // 用户切换所有活动和单一活动
        ,onChangeButton: function(ev){
            var type = +ev.param.selected;
            switch (type){
                case 0:
                    app.navigate('campaign');
                    break;
                case 1: //第一个活动
                    if(this.$.grid.getData()){
                        var id = this.$.grid.getData()[0]._id;
                        app.navigate('campaign/more/'+id);
                    }
                    break;
            }
            return false;
        }
        ,reset: function(){
            this.$.buttonGroup.setData(0);
            return this;
        }
    });
    exports.list = List;

    /**
     * 活动列表列状态过滤
     */
    function ListRunStatus(config, parent){
        config = $.extend(true, {
            'class': 'P-campaignListRun',
            'target': parent,
            'types': [
                {type:0, name:LANG('活动状态')},
                {type:2, name:LANG('进行中'),"cls":"runing"},
                {type:4, name:LANG('已暂停'),"cls":"suspend"},
                {type:1, name:LANG('未开始'),"cls":"unstart"},
                {type:3, name:LANG('已结束'),"cls":"done"},
                {type:5, name:LANG('超预算'),"cls":"overload"},
                {type:6, name:LANG('已归档'),"cls":"store"}
            ]
        }, config);
        ListRunStatus.master(this, null, config);
        // 数据列表
        this.$data = null;
        // 当前选中的项目
        this.$type = 0;
    }
    extend(ListRunStatus, view.container, {
        init: function(){
            var c = this.config;
            ListRunStatus.master(this,'init');
            util.each(c.types, function(item){
                var dom = $('<span/>').appendTo(this.el);
                dom.text(item.name).attr('data', item.type);
                if (item.type > 0){
                    dom.prepend('<i class="G-iconFunc '+item.cls+'"/>');
                }
            }, this);
            this.el.children('span:first').addClass('act');
            this.dg(this.el, 'span', 'click', 'eventClick');
        },
        eventClick: function(evt, elm){
            elm = $(elm);
            var type = +elm.attr('data');
            if (isNaN(type) || type == this.$type) {return false;}
            this.el.children('.act').removeClass('act');
            this.$type = type;
            elm.addClass('act');

            this.fire('runStatusChange', type);
            return false;
        },
        setData: function(data){
            this.$type = data;
            this.el.children('span.act').removeClass('act');
            this.el.children('span[data="'+data+'"]').addClass('act');
        },
        getData: function(){
            return this.$type;
        }
    });

    /**
     * 选择广告活动类型界面
     */
    function TypeForm(config, parent){
        config = $.extend({
            'class': 'P-campaignType',
            'target': parent
        }, config);

        TypeForm.master(this, null, config);
    }
    extend(TypeForm, view.container, {
        init: function(){
            tpl.load('campaign', this.build, this);
            TypeForm.master(this, 'init');
        },
        build: function(){
            tpl.appendTo(this.el, 'campaign/campaign_type_form');
            this.dg(this.el, '.item', 'click', 'clickSelect');
        },
        clickSelect: function(evt, elm){
            var type = $(elm).find('.btn[data-id]').attr('data-id');
            switch (type){
                case '2':
                    // 代理编辑
                    app.navigate('campaign/agentEdit');
                    break;
                case '3':
                    // 直投编辑
                    app.navigate('campaign/directEdit');
                    break;
                case '4':
                    // RTB移动端
                    window.open('#campaign/MTEdit?BidType=0');
                    break;
                default:
                    // RTB编辑
                    window.open('#campaign/edit?BidType=0');
                    break;
            }
        }
    });
    exports.type = TypeForm;

    /**
     * RTB活动编辑页面
     */
    function Form(config, parent){
        config = $.extend({
            channelType: 1, // RTB活动
            modules: [
                {name:'info', title:LANG('活动信息'), creator:InfoRtb, config:{
                    bidType: config.bidType,
                    batch: config.batch
                }
                },
                {name:'position', title:LANG('广告位'), creator:SpotForm, config:{
                    bidType: config.bidType,
                    batch: config.batch
                }
                },
                {name:'game', title:LANG('添加游戏'), creator:GameForm, config: {
                    batch: config.batch
                }}
            ]
        }, config);
        // 电商配置
        var user = this.$user = app.getUser();
        if (user && user.campany.CategoryId == 2){
            config.modules.splice(
                2, 1,
                {name:'game', title:LANG('广告策略'), creator:CreativeForm}
            );
        }

        Form.master(this, null, config);
        this.data = null;
        this.ready = 0;
        // 加载计数器
        this.$loadCounter = 0;
        this.$step_module = [];
        this.$mode = 'relative';
        this.$nowStep = 0;
        this.$maxStep = 0;
        this.$lastScroll = 0;
        this.$autoScroll = false;
        this.$batchSaveData = [];	// 批量保存后，记录名称数组；
    }
    extend(Form, view.container, {
        init: function(){
            this.render();
            this.ready = 1;
            // 顶部步骤指示器
            var doms = this.doms = {};
            //包了一层
            doms.step = $('<div class="P-campaignFormStep"/>').appendTo(this.el);
            doms.body = $('<div class="P-campaignFormBody" />').appendTo(this.el);
            doms.button = $('<div class="P-campaignFormBtn"/>');
            // doms.draft = $('<input type="button" class="P-campaignFormDraft btn"/>');
            // doms.draft.val(LANG("存为草稿")).appendTo(doms.button);

            var list = [];
            util.each(this.config.modules, function(item, index){
                list.push(item.title);
                // 创建各个步骤的实例模块
                this.$step_module[index] = this[item.name] = this.create(
                    item.name, item.creator,
                    $.extend({target: doms.body}, item.config)
                );
            }, this);

            // 创建步骤
            this.step = this.create('step', form.step, {
                'list': list,
                'btn_target': doms.button,
                'jump': true,
                'step': 0,
                'floatMode': true,
                'target':doms.step
            });

            // 批量活动隐藏保存草稿按钮
            if(this.config.batch){
                this.step.hideBtn('draft');
            }
            this.loading = this.create('loading', common.loadingMask, {target:'body', auto_show: false});
            doms.body.appendTo(this.el);
            doms.button.appendTo(this.el);

            // this.jq(doms.draft, 'click', 'eventSaveDraft');
            this.dg(this.el, '#COPY_CAMPAIGN', 'click', 'eventCopy');

            //浏览器滚动时，消息提示框上移到顶部
            this.jq(window, 'scroll', 'eventUpdatePositon');

            // 同步初始化的渠道参数
            var spot = this.get('position');
            var game = this.get('game');
            if (spot && game){
                var data = spot.getData();
                game.setExchangeId(data.channel);
            }
        },
        show: function(){
            util.each(this.$step_module, function(mod){
                mod.appendTo(this.doms.body);
            }, this);
            Form.master(this, 'show');
        },
        /**
         * 重写父类hide方法
         * @return {None} 无
         */
        hide: function() {
            // 隐藏成功提示
            var msg = this.child('saveNotify');
            if (msg) {
                msg.hide();
            }
            Form.master(this, 'hide');
        },
        // 操作步骤变化事件
        onStepUpdate: function(ev){
            if (!this.ready){
                return false;
            }
            var steps = this.$step_module;
            var max = this.$maxStep = ev.param.max;
            util.each(steps, function(step, idx){
                if (idx <= max){
                    step.show();
                }else {
                    step.hide();
                }
            });
            this.$nowStep = max = ev.param.index;
            switch (ev.param.mode){
                case 'next':
                case 'back':
                case 'jump':
                    this.scrollStep(max);
                    break;
            }

            // 如果是跳转到广告位, 更新活动出价
            if (max == 1 && steps[1].updateCampaignPrice){
                var info = steps[0].getData();
                steps[1].updateCampaignPrice(info.ChargePrice);
            }
            return true;
        },
        //设置消息提示框位置函数
        eventUpdatePositon: function(evt){
            var self = this;
            var max = self.$maxStep;
            var now = self.$nowStep;
            var dom = self.$step_module;

            // 可选步骤大于1才需要判断状态, 并且不是在自动滚动过程中
            if (max > 0){
                var vp = util.getViewport();
                var offset;
                if (self.$lastScroll < vp.top){
                    // 向下滚动
                    if (now < max){
                        dom = dom[++now].getDOM();
                        offset = dom.offset();
                        // 下一步显示出100像素 (按钮区域覆盖了50像素)
                        if (offset.top + 100 < vp.top + vp.height){
                            self.step.setStep(now, false, 'silent');
                            self.$nowStep = now;
                        }
                    }
                }else {
                    // 向上滚动
                    if (now > 0){
                        dom = dom[--now].getDOM();
                        offset = dom.offset();
                        // 下一步显示出100像素 (按钮区域覆盖了50像素)
                        if (offset.top + dom.outerHeight(true) > vp.top + 150){
                            self.step.setStep(now, false, 'silent');
                            self.$nowStep = now;
                        }
                    }
                }

                self.$lastScroll = vp.top;
            }
        },
        scrollStep:function (step){
            var self = this;
            var mod = self.$step_module[step];
            if (mod){
                var dom = mod.getDOM();
                var top = dom.offset().top - 40;

                var body = util.isChrome ? $(document.body) : $(document.documentElement);
                body.animate({scrollTop: top});
            }
        },
        /**
         * 保存草稿回调处理函数
         * @return {None} 无返回
         */
        eventSaveDraft: function(){
            var data = this.getData();
            app.data.put('/rest/draftcampaign', data, this, 'onSave');
        },
        /**
         * 复制活动按钮点击事件, 弹出活动选择对话框
         * @return {None} 无返回
         */
        eventCopy: function(){
            if (!this.$.selectCampaign){
                this.create('selectCampaign', popwin.selectCampaign, {
                    'param': {
                        'Channel': this.config.channelType,
                        'bidType': this.config.bidType

                    }
                });
            }
            this.$.selectCampaign.show();
        },
        /**
         * 活动选择回调事件
         * @param  {Object} ev 事件对象变量
         * @return {Bool}    返回false阻止事件冒泡
         */
        onSelectCampaign: function(ev){
            var self = this;
            app.confirm(
                LANG('确认要复制选中的活动内容吗? 当前的活动修改信息将会丢失.'),
                function(ret){
                    if (ret){
                        self.loadData(ev.param._id, true);
                    }
                }
            );

            return false;
        },
        /**
         * 选择游戏回调
         */
        onAddGame: function(ev){
            // this.scale.addGame(ev.param.data);
            // this.creative.addGame(ev.param.data);
            return false;
        },
        /**
         * 移除游戏回调
         */
        onRemoveGame: function(ev){
            // this.scale.removeGame(ev.param.data);
            // this.creative.removeGame(ev.param.data);
            return false;
        },
        /**
         * 获取表格数据
         * @return {Object} 返回可以用于提交到服务器端保存的数据对象
         */
        getData: function(item){
            var data;
            if(item){
                data = util.clone(item);
            }else{
                data = Form.master(this, 'getData');
            }
            var info = data.info;
            var last = this.data;
            var sec;

            info.ProductRatioType = 3; // 暂时只做手工分配流量
            info.Products = data.game;
            info.BatchTab = data.game.BatchTab;
            if (sec = data.channel){
                info.SubChannel = sec.channel;
                info.AdPositions = sec.positions;
                info.AdType = sec.type;
                info.isExcludePosition = 0; // sec.isExclude ? 1 : 0;
            }

            if (sec = data.position){
                var chn = util.find(app.config('exchanges'), sec.channel, 'id');
                if (chn){
                    info.SubChannel = chn.alias_id || chn.id;
                    info.SubChannel2 = chn.id;
                }
                info.AdCategory = sec.adclass ? ( util.isArray(sec.adclass) ? sec.adclass : [sec.adclass] ) : [];

                if (util.exist(app.config('exchange_group/yi'), info.SubChannel)){
                    info.AdSensitive = sec.sensitive;
                }else {
                    info.AdSensitive = sec.sensitive ? [sec.sensitive] : [];
                }

                info.SetIncludeInfo = sec.white;
                info.SetExcludeInfo = sec.black;
                info.WhiteBlackList = sec.addon;
                info.PriceModify = sec.price;
                info.ClearWarden = sec.retainPrice;
                info.SelectDeals = sec.SelectDeals;
                info.SelectDealsValue = sec.SelectDealsValue;
                info.DealFilter = sec.DealFilter;
            }

            // 竞价方式
            info.BidType = +this.config.bidType;

            // 广告点击类型
            info.LandType = data.game && data.game.length && data.game[0] && data.game[0].LandType || 0;
            info.AppPackName = data.game && data.game.length && data.game[0] && data.game[0].AppPackName || '';

            // 保留旧数据
            if (last){
                info.Id = last.Id;
                if (last.CopyFromId){
                    info.CopyFromId = last.CopyFromId;
                }
            }
            return info;
        }
        /**
         * 获取广告位尺寸与附加广告位数据
         * @param  {Object} ev <可选>消息对象
         * @return {Mix}       当响应消息时向发送对象发送结果，返回false。其他则直接返回结果
         */
        ,onGetAdsizeData:function(ev){
            var dat = this.getData(),
                sizes = [],
                spots = [];

            util.each(dat.SetIncludeInfo, function(item){
                if (item.Size){
                    sizes.push.apply(sizes, item.Size);
                }
                if (item.PositionIds){
                    spots.push.apply(spots, item.PositionIds);
                }
            });

            var data = {
                'SizeIds': sizes.toString(),
                'AdPositionIds': spots.toString()
            };

            if(ev && ev.from){
                this.send(ev.from, "adsizeData", data);
                return false;
            }else{
                return data;
            }
        }
        /**
         * 用户切换RTB渠道事件
         * @return {None}
         */
        ,onChangeRtbChannel: function(ev){
            // 创意包与落地页设置
            if (this.game){
                this.game.setExchangeId(ev.param.id);
            }
            return false;
        },
        /**
         * 表单重置
         * @return {None} 无返回
         */
        reset: function(){
            Form.master(this, 'reset');
            this.step.reset();
            if (this.$.saveNotify){
                this.$.saveNotify.hide();
                this.show();
            }
            this.data = null;
            var id = this.info.getData().SubChannel;
            this.game.setExchangeId(id);
        },
        /**
         * 设置表单初始值
         * @param {Object} data 活动详细数据对象
         */
        setData: function(data){
            var self = this;
            var cid = data && data.SubChannel && data.SubChannel[0] || 0;
            self.showLoading();
            self.data = data;
            // 判断编辑状态显示save按钮
            if (data && (data._id || data.CopyFromId)){
                self.step.switchForceSave(true);
            }else {
                self.step.switchForceSave(false);
            }

            // 基本资料表单
            self.info.setData(data);
            // 渠道广告位
            if (self.channel){
                self.channel.setData({
                    isExclude: data.isExcludePosition,
                    type: data.AdType,
                    channel: cid,
                    positions: data.AdPositions
                });
            }
            // 敏感分类
            var sensitive = '';
            if (util.exist(app.config('exchange_group/yi'), data.SubChannel[0])){
                sensitive = data.AdSensitive;
            }else {
                sensitive = data.AdSensitive && data.AdSensitive[0] || null;
            }
            if (self.position){
                // RTB广告位
                self.position
                    .setData({
                        campaign_id: data._id,
                        save_as_id: data.CopyFromId || 0,
                        channel: cid,
                        adclass: data.AdCategory && ( data.AdCategory.length>1 ? data.AdCategory : data.AdCategory[0] ) || null,
                        sensitive: sensitive,
                        white: data.SetIncludeInfo,
                        black: data.SetExcludeInfo,
                        addon: data.WhiteBlackList,
                        price: data.PriceModify,
                        SelectDeals: data.SelectDeals||[],
                        SelectDealsValue: data.SelectDealsValue,
                        DealFilter: data.DealFilter,
                        IsDraft: data.IsDraft
                    });

                //游戏
                self.game.setExchangeId(cid);
            }

            // 输入数据格式为服务器的数据格式,
            // 需要转换和查找对应的数据记录,
            // ?? 缓存产品数据和创意数据
            var list = data.Products;
            if ((!list || !list.length) && !data.IsDraft){
                return;
            }

            // 显示正在拉取数据提示
            this.showLoading();

            var pid = [];
            var sid = [];
            var wid = [];
            util.each(list, function(prod){
                pid.push(prod.Id);
                util.each(prod.Sweetys, function(sweety){
                    sid.push(sweety.Id);
                });
                util.each(prod.WhiskyCreatives, function(whisky){
                    wid.push(whisky.Id);
                });
            });

            util.uniq(pid);
            util.uniq(sid);
            util.uniq(wid);

            // 查询数据缓存
            self.cache = {};

            // 查询创意包
            if (sid.length){
                self.$loadCounter++;
                app.data.get(
                    '/rest/listsweety',
                    {Ids: sid.toString(), no_stastic_data: 1, no_limit:1},
                    self, 'onData', 'sweety'
                );
                self.cache.sweetys = null;
            }else {
                self.cache.sweetys = {};
            }
            // 查询落地页
            if (wid.length){
                self.$loadCounter++;
                app.data.get(
                    '/rest/listwhiskycreative',
                    {Ids: wid.toString(), no_stastic_data: 1, no_limit:1},
                    self, 'onData', 'whisky'
                );
                self.cache.whiskys = null;
            }else {
                self.cache.whiskys = {};
            }

            if(pid.length){
                // 查询产品
                self.cache.products = null;
                self.$loadCounter++;
                app.data.get(
                    '/rest/listproduct',
                    {Ids: pid.toString(), no_stastic_data: 1, no_limit:1},
                    self, 'onData', 'product'
                );
            }else {
                self.cache.products = {};
                self.hideLoading();
            }

        },
        /**
         * 数据拉取响应处理函数
         */
        onData: function(err, data, type){
            if(!--this.$loadCounter){
                this.hideLoading();
            }
            if (err){
                app.alert(err.message);
                this.cache = null;
                return false;
            }
            if (!this.cache){
                return false;
            }
            var cache;

            switch (type){
                case 'product':
                    cache = this.cache.products = {};
                    break;
                case 'sweety':
                    cache = this.cache.sweetys = {};
                    break;
                case 'whisky':
                    cache = this.cache.whiskys = {};
                    break;
                default:
                    return false;
            }
            util.each(data.items, function(item){
                cache[item._id] = item;
            });
            if (this.cache.products && this.cache.sweetys && this.cache.whiskys){
                //TODO: 隐藏拉取数据提示

                // 数据拉取完成, 渲染数据
                util.each(this.data.Products, function(item){
                    item.game = this.cache.products[item.Id];
                    if (!item.game){
                        // 产品数据无效, 删除产品
                        return null;
                    }

                    util.each(item.Sweetys, function(item){
                        if (!this.cache.sweetys[item.Id]){
                            return null;
                        }
                        item.data = this.cache.sweetys[item.Id];
                    }, this);
                    util.each(item.WhiskyCreatives, function(item){
                        if (!this.cache.whiskys[item.Id]){
                            return null;
                        }
                        item.data = this.cache.whiskys[item.Id];
                    }, this);
                }, this);

                // 更新设置其他需要详细资料的模块记录
                var game = this.game;
                game.setAdType(this.data.AdType);
                game.setData(this.data.Products);
                game.setExchangeId(this.data.SubChannel[0]);
            }
            return false;
        },
        /**
         * 拉取指定ID的活动数据
         * @param  {Number} id 活动记录ID号
         * @return {None}    无返回
         */
        loadData: function(id, copy){
            this.showLoading();
            app.data.get(
                '/rest/loadcampaign',
                {
                    "Id":id
                    //,"no_stastic_data":1
                    //,"ListAll":1
                },
                this, 'onLoadData', copy
            );
        },
        /**
         * 获取活动资料回调函数
         * @param  {Object} err  数据中心错误对象
         * @param  {Object} data 数据中心返回的数据对象
         * @return {Bool}      返回false阻止事件冒泡
         */
        onLoadData: function(err, data, isCopy){
            this.hideLoading();
            if (err){
                app.alert(err.message);
                return false;
            }
            if (data.total === 0){
                app.alert(LANG('活动资料不存在'));
                return false;
            }
            // 增加Id
            data.Id = data._id;
            var item = data;
            var d = item.StartTime.toString();
            item.StartTime = d.substr(0,4) + '-' + d.substr(4,2) + '-' + d.substr(6);
            if (item.EndTime){
                d = item.EndTime.toString();
                item.EndTime = d.substr(0,4) + '-' + d.substr(4,2) + '-' + d.substr(6);
            }
            if (isCopy){
                item.CopyFromId = item._id;
                item._id = item.Id = this.data && (this.data.Id || this.data._id) || 0;
            }
            this.setData(item);
            return false;
        },
        onStepDraft: function(){
            var self = this;
            app.confirm(LANG('保存为草稿后活动将暂停投放。确定保存为草稿吗？'), function(isOk){
                if(isOk){
                    // 滚回到最顶层
                    self.step.setStep(0, true);
                    var data = self.getData();
                    // 将活动的状态设为3
                    data.Status = 3;
                    // 资料数据正常, 提交保存数据
                    self.step.disableSaveBtn();
                    self.loading.show();
                    app.core.get("platform").updateTitle(LANG('【草稿】')+' '+data.Name,true);
                    app.data.put('/rest/draftcampaign ', data, self, 'onSave');
                }
            });

            return false;
        },
        /**
         * 保存按钮点击事件回调函数
         * @param  {Object} ev 事件变量对象
         * @return {Bool}    返回false阻止事件冒泡
         */
        onStepSave: function(ev){
            if(this.config.batch){
                this.buildBatchSavePop();
                return;
            }

            // 滚回到最顶层
            this.step.setStep(0, true);
            var data = this.getData();
            if (data.Name === ''){
                this.step.setStep(0);
                app.alert(LANG('请先设置活动的名称'));
                return false;
            }
            if (
                (!data.AdCategory || !data.AdCategory.length) &&
                util.exist(app.config('exchange_group/ad_class'), data.SubChannel2)
            ){
                this.step.setStep(1);
                app.alert(LANG('请选择一个广告类别'));
                return false;
            }
            // 暂时隐藏敏感分类验证
            // if (
            // 	(!data.AdSensitive || !data.AdSensitive.length) &&
            // 	util.exist(app.config('exchange_group/sens_class'), data.SubChannel2)
            // ){
            // 	this.step.setStep(1);
            // 	app.alert(LANG('请选择一个活动敏感分类'));
            // 	return false;
            // }
            if (data.StartTime === ''){
                this.step.setStep(0);
                app.alert(LANG('请设置一个活动开始日期'));
                return false;
            }
            if (!data.WardenStatus && ( !util.isNumber(data.ChargePrice) || data.ChargePrice < 0 ) ){
                this.step.setStep(0);
                app.alert(LANG('最高出价必须为一个大于零的数字'));
                return false;
            }
            if(data.WardenStatus == -1){
                app.alert(LANG('出价方式发生改变，请重新填写相关设置！'));
                return false;
            }

            if (!util.isNumber(data.TotalBudget) || (data.TotalBudget < 0 )){
                this.step.setStep(0);
                app.alert(LANG('总预算必须为一个大于或等于0的数字'));
                return false;
            }
            if (!util.isNumber(data.Budget) || (data.Budget < 0 )){
                this.step.setStep(0);
                app.alert(LANG('每日预算必须为一个大于或等于0的数字'));
                return false;
            }
            if (!util.isNumber(data.AvgPrice) || (data.AvgPrice < 0 )){
                this.step.setStep(0);
                app.alert(LANG('平均CPM必须为一个大于或等于0的数字'));
                return false;
            }
            if ((data.WardenStatus == 1 || data.WardenStatus == 2) && data.TargetCpa <= 0 ){
                this.step.setStep(0);
                if ( data.WardenStatus == 1 ) {
                    app.alert(LANG('请输入一个有效的CAP单价'));
                } else {
                    app.alert(LANG('请输入一个有效的CPC单价'));
                }
                return false;
            }
            if((data.WardenStatus == 1 || data.WardenStatus == 2) && data.TargetCpa >= 10000){
                app.alert(LANG('出价不得超过9999.99元'));
                return false;
            }
            if(!data.WardenStatus && data.ChargePrice >= 10000){
                app.alert(LANG('出价不得超过9999.99元'));
                return false;
            }

            // 验证重定向
            if(data.CharacterValue){
                var cookie = data.Character.Cookie;
                var ip = data.Character.Ip;
                var device = data.Character.Device;
                if(!cookie.Exclude.length && !cookie.Include.length && !ip.Exclude.length && !ip.Include.length && !device.Exclude.length && !device.Include.length){
                    app.alert(LANG('请指定重定向人群标签！'));
                    return false;
                }

                var characterErr = false;
                var limit = 50;
                switch (true){
                    case cookie.Exclude.length > limit:
                    case cookie.Include.length > limit:
                    case ip.Exclude.length > limit:
                    case ip.Include.length > limit:
                    case device.Exclude.length > limit:
                    case device.Include.length > limit:
                        characterErr = true;
                        break;
                }
                if(characterErr){
                    app.alert(LANG('重定向条件最多只能选择%1个！', limit));
                    return false;
                }
            }
            // 验证后删除值
            delete data.CharacterValue;

            // 验证IP地址
            if(data.IpSections && data.IpSections.length){
                var re = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
                var tmp = false;
                util.each(data.IpSections, function(item, idx){
                    if(!re.test(item.Start) || !re.test(item.End) || item.Start === '' || item.End === ''){
                        tmp = true;
                    }
                });
                if(tmp){
                    app.alert(LANG('请输入正确的IP地址格式或IP地址范围'));
                    return false;
                }
            }

            var isShow = util.exist(app.config('auth/scene'), app.getUserId());
            if(isShow){
                // 验证上网场景
                var sceneData = this.get('info/scene').getData();
                if(sceneData && !sceneData.length){
                    app.alert(LANG('请指定上网场景'));
                    return false;
                }
            }


            // 验证温度
            // 平均温度
            if(data.Weather.TemperatureLevels){
                var openDays_t = data.Weather.TemperatureLevels.openDays;
                var re_t = /[\.-]/ig;
                if(isNaN(openDays_t) || openDays_t > 30 || re_t.test(openDays_t)){
                    app.alert("平均温度设置，请输入大于或等于0的整数，且持续投放天数不超过30天。");
                    return false;
                }
            }
            // 最低温
            if(data.Weather.LowTemperature){
                var openDays_l = data.Weather.LowTemperature.OpenDays;
                var changeCount_l = data.Weather.LowTemperature.ChangeCount;
                var re_l = /[\.-]/ig;
                if(isNaN(openDays_l) || openDays_l > 30 || re_l.test(openDays_l) || !util.isNumber(changeCount_l)){
                    app.alert("最低温设置，请输入数字，且持续投放天数不超过30天。");
                    return false;
                }
            }
            // 最高温
            if(data.Weather.HighTemperature){
                var openDays_h = data.Weather.HighTemperature.OpenDays;
                var changeCount_h = data.Weather.HighTemperature.ChangeCount;
                var re_h = /[\.-]/ig;
                if(isNaN(openDays_h) || openDays_h > 30 || re_h.test(openDays_h) || !util.isNumber(changeCount_h)){
                    app.alert("最高温设置，请输入数字，且持续投放天数不超过30天。");
                    return false;
                }
            }

            // 验证温差
            if(data.TemperatureDiff){
                var tempFlag = true;
                util.each(data.TemperatureDiff, function(item, idx){
                    if(item){
                        var RecentCount = item.Change.RecentCount;
                        var ChangeCount = item.Change.ChangeCount;
                        var OpenDays = item.OpenDays;
                        var re = /[\.-]/ig;
                        if(!util.isNumber(RecentCount) || !util.isNumber(ChangeCount) || !util.isNumber(OpenDays)){
                            tempFlag = false;
                        }
                        if(re.test(RecentCount) || re.test(ChangeCount) || re.test(OpenDays) ){
                            tempFlag = false;
                        }
                        if(OpenDays > 30){
                            tempFlag = false;
                        }
                    }
                });
                if(!tempFlag){
                    app.alert("温差设置，请输入大于或等于0的整数，且持续投放天数不超过30天。");
                    return false;
                }
            }

            // 验证关键词
            if(data.HotWord){
                var wordFlag = true;
                util.each(data.HotWord, function(item, idx){
                    if(item){
                        var RecentCount = item.Change.RecentCount;
                        var ChangeCount = item.Change.ChangeCount;
                        var ChangeLimit = item.Change.ChangeLimit;
                        var OpenDays = item.OpenDays;
                        var re = /[\.-]/ig;
                        if(!util.isNumber(RecentCount) || !util.isNumber(ChangeCount) || !util.isNumber(OpenDays) || !util.isNumber(ChangeLimit)){
                            wordFlag = false;
                        }
                        if(re.test(RecentCount) || re.test(ChangeCount) || re.test(OpenDays) || re.test(ChangeLimit)){
                            wordFlag = false;
                        }
                        if(OpenDays > 30){
                            wordFlag = false;
                        }
                        if(ChangeCount === '' || ChangeLimit === ''){
                            wordFlag = false;
                        }
                        if(!item.Words.length){
                            wordFlag = false;
                        }
                    }
                });
                if(!wordFlag){
                    app.alert("关键词设置请填写完整，请输入大于或等于0的整数，且持续投放天数不超过30天。");
                    return false;
                }
            }

            var premium = data.NSpeculator;
            var premium_price;
            if(premium.length){
                for (var i = 0; i < premium.length; i++) {
                    premium_price = premium[i].Stake;
                    if(premium_price === ''){
                        app.alert(LANG('请输入溢价'));
                        return false;
                    }
                    if(!util.isNumber(premium_price)){
                        app.alert(LANG('溢价不可输入非数字'));
                        return false;
                    }
                    premium[i].Stake = +premium_price;
                }
            }

            if(data.Status == 3){
                app.alert(LANG('请修改活动状态为开启或暂停'));
                return false;
            }

            // 智能监控监控条件判断
            if(data.AlarmStatus == 2 && data.SmartMonitor && !data.SmartMonitor.RuleIds.length){
                app.alert(LANG('请添加活动自定义智能监控条件！'));
                this.step.setStep(0);
                return false;
            }
            // 智能监控邮箱验证
            if(data.SmartMonitor && data.SmartMonitor.Emails){
                var isError = false;
                util.each(data.SmartMonitor.Emails, function(item, idx){
                    if(item && !util.isEmail(item)){
                        isError = true;
                    }
                });
                if(isError){
                    app.alert(LANG('智能监控联系邮箱存在格式错误！'));
                    this.step.setStep(0);
                    return false;
                }
            }

            // 订单检测
            if(data.BidType && data.SelectDealsValue == 1 && !data.SelectDeals.length){
                app.alert(LANG('请指定渠道订单！'));
                this.step.setStep(1);
                return false;
            }

            if (data.Products.length <= 0 && this.$user.campany.IsButt!==0){
                this.step.setStep(2);
                app.alert(LANG('请先选择一个游戏产品'));
                return false;
            }
            // if(!data.RTBAdPositions.Include.length){
            // 	this.step.setStep(1);
            // 	app.alert(LANG('请选择至少一个广告位'));
            // 	return false;
            // }
            // 检查产品的创意和落地页
            var ret = util.each(data.Products, function(game){
                if (game.Sweetys.length === 0 || game.WhiskyCreatives.length === 0){
                    return false;
                }
            });
            if (ret !== null){
                this.step.setStep(2);
                app.alert(LANG('请设置每个游戏产品的创意包和落地页'));
                return false;
            }

            // 资料数据正常, 提交保存数据
            this.step.disableSaveBtn();
            this.loading.show();
            app.core.get("platform").updateTitle(data.Name,true);
            app.data.put('/rest/addcampaign', data, this, 'onSave');
            return false;
        },
        // 批量建活动弹窗构建
        buildBatchSavePop: function(){
            var info, spots, games, data = [], self = this;

            // 获取批量数据
            util.each(self.childs(), function(item){
                if(item){
                    if(item._.name == 'info'){
                        info = item.getData();
                    }
                    if(util.isFunc(item.getBatchData)){
                        if(item._.name == 'position'){
                            spots = item.getBatchData();
                        }
                        if(item._.name == 'game'){
                            games = item.getBatchData();
                        }
                    }
                }
            });

            // 构建这样的对应结构
            //           info
            //       /          \
            //   position     position
            //        /    X   \
            //      game       game
            var gameFlag = false;	// 是否有添加产品
            util.each(games, function(game){
                if(game){
                    util.each(spots, function(spot){
                        if(spot){
                            var sub = {};
                            sub.game = game;
                            sub.position = spot;
                            sub.info = info;
                            data.push(sub);
                            if(!game.length){
                                gameFlag = true;
                            }else{
                                util.each(game, function(item){
                                    if(item){
                                        if(item.Sweetys.length === 0 || item.WhiskyCreatives.length === 0){
                                            gameFlag = true;
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            });
            // 产品检测验证
            if(gameFlag){
                app.alert(LANG('请选择游戏产品，并设置每个游戏产品的创意包和落地页！'));
                return false;
            }

            var result = [];
            // 转换为最终数组数据格式
            util.each(data, function(item, idx){
                if(item){
                    item.info.BatchId = idx;
                    result.push(self.getData(item));
                }
            })

            var win = self.get('batchSavePop');
            if(!win){
                win = self.create('batchSavePop', popwin.batchSave, {});
            }
            win.setData(result).show();
        },
        onBatchSavePop: function(ev){
            var self = this;
            app.showLoading();
            self.$queue = util.clone(ev.param) || []; // 批量数据队列
            if(self.$queue[0]){
                delete self.$queue[0].BatchId;
                delete self.$queue[0].BatchTab;
                app.data.put('/rest/addcampaign', self.$queue[0], self, 'onBatchSave');
            }
        },
        onBatchSave: function(err, data){
            app.hideLoading();
            if (err){
                app.alert(err.message);
                //return false;
            }
            var self = this;
            self.$queue.shift();	// 移除队列首位
            self.$batchSaveData.push(data && data.Name);

            if(!self.$queue.length){
                var text = '\n' + self.$batchSaveData.join('\n');
                app.alert(LANG('批量活动保存成功，共%1个。' + text, self.$batchSaveData.length));
                app.navigate('campaign');
            }else{
                self.onBatchSavePop({'param':self.$queue}); // 队列中还有数据，继续执行保存操作
            }
            return false;
        },
        onSave: function(err, data){
            this.loading.hide();
            this.step.enableSaveBtn();
            if (err){
                app.alert(err.message);
                return false;
            }

            // 保存活动之后提交如果选择了同步公用分组的广告位分组的修改（包括白名单和黑名单）
            var self = this;
            var arr = data.SetIncludeInfo.concat(data.SetExcludeInfo);
            util.each(arr, function(item, idx){
                if(item && item.SynCampaign){
                    // 参数需要分组类别,我就克隆一份
                    item.Spots = util.clone(item);
                    // 参数需要渠道id
                    item.AdxId = data.SubChannel2;
                    app.data.put('/rest/addpositioncategory', item, self,'afterSaveSpotGroup');
                }
            });

            if (data.Channel == 1 || data.Channel == 4){
                // 渠道ID
                var cid = data.SubChannel[0];

                // 行业分类
                var adCategory = data.AdCategory;
                if (adCategory){
                    adCategory = adCategory.length>1 ? adCategory : adCategory[0];
                    app.storage('campaign_last_ad_class_'+app.getUserId()+'_'+cid, adCategory);
                }

                // 敏感分类
                var adSensitive = data.AdSensitive;
                if (adSensitive){
                    adSensitive = adSensitive.length>1 ? adSensitive : adSensitive[0];
                    app.storage('campaign_last_category_'+app.getUserId()+'_'+cid, adSensitive);
                }
            }

            this.hide();
            if (window.opener && window.opener.app){
                window.opener.app.core.cast('saveCampaignSuccess', {"id": data._id});
            }

            // 调用余额模块刷新余额信息
            app.core.get("balance").fetch();

            var msg = this.child('saveNotify');
            if (msg){
                msg.show();
            }else {
                var section = this.create('saveNotify', form.successSection, {
                    'target': this.config.target,
                    'class': 'M-formSectionSave',
                    'title': LANG('保存成功！'),
                    'desc': LANG('您的广告活动已成功保存，并加入了RTB实时竞价行列。'),
                    'list_title': LANG('提示说明：'),
                    'list': [
                        LANG('如果暂时不想投放此广告活动，可以到活动列表暂停。'),
                        LANG('建议到活动列表实时查看活动进度和效果，并及时更改广告出价。'),
                        LANG('建议跟踪各产品的创意和落地页效果，并不断调整优化。')
                    ]
                });
                var con = section.getContainer();
                if (!this.data) {
                    this.data = {};
                }
                $('<input type="button" data-step="list" class="btnBigGray2" />').val(LANG('返回活动列表')).appendTo(con);
                $('<input type="button" data-step="add" class="btnBigGray2" />').val(LANG('继续添加活动')).appendTo(con);
                $('<input type="button" data-step="edit" class="btnBigGray2" />').val(LANG('继续编辑活动')).appendTo(con);
                $('<input type="button" data-step="saveAs" class="btnBigGray2" />').val(LANG('另存为')).appendTo(con);
                $('<input type="button" data-step="close" class="btnBigGray2" />').val(LANG('关闭当前窗口')).appendTo(con);

                this.dg(con, 'input', 'click', 'eventAfterSave');
            }

            if(!this.data){
                this.data = {};
            }
            this.data.Id = data._id;
            return false;
        },
        afterSaveSpotGroup: function(err, data){
            if (err){
                app.alert(err.message);
                return false;
            }
        },
        eventAfterSave: function(evt, elm){
            var step = $(elm).attr('data-step');
            switch (step){
                case 'close':
                    window.close();
                    break;
                case 'add':
                    app.navigate('campaign/create');
                    break;
                case 'list':
                    app.navigate('campaign');
                    break;
                case 'edit':
                    this.show();
                    this.step.setStep(0);
                    break;
                case 'saveAs':
                    window.open('#campaign/saveas/'+this.data.Id+"?Channel="+this.config.channelType+'&BidType='+this.config.bidType);
                    return false;
                default:
                    return false;
            }
            this.$.saveNotify.hide();
        },
        /**
         * 取消按钮点击事件回调函数
         */
        onStepCancel: function(ev){
            app.confirm(LANG('确认取消建活动吗？'), function(ret){
                if(ret){
                    app.navigate('campaign');
                }
            })
            return false;
        },
        showLoading: function() {
            if (this.$.loading){
                this.$.loading.show();
            }else {
                this.create('loading', common.loadingMask, {target: "body"});
            }
        },
        hideLoading: function() {
            if (this.$.loading){
                this.$.loading.hide();
            }
        },
        // 响应预估流量刷新广播事件
        onGetFlowParam: function(evt){
            var data = this.getData();
            if(data){
                // 旧的条件
                // var param = {
                // 	'SubChannel': data.SubChannel,
                // 	'TimeSet': data.TimeSet,
                // 	'Zone': data.Zone,
                // 	'BrowserType': data.BrowserType,
                // 	'OSType': data.OSType,
                // 	'NPeople': data.NPeople,
                // 	'PeopleValue': data.PeopleValue || 0
                // }
                // 获取预估流量模块，加载曝光量
                this.get('info/flowEstimateSwitcher').refresh(data);
            }
            return false;
        }
    });
    exports.form = Form;

    /**
     * RTB活动-移动端
     */
    var FormMT = app.extend(Form,{
        init:function(config,parent){
            config = $.extend({
                channelType: 4, // RTB移动端活动
                modules: [
                    {name:'info', title:LANG('活动信息'), creator:InfoRTBmoblie, config:{
                        bidType: config.bidType,
                        batch: config.batch
                    }
                    },
                    {name:'position', title:LANG('广告位'), creator:SpotForm, config:{
                        rtbType:'MT',
                        bidType: config.bidType,
                        batch: config.batch
                    }
                    },
                    {name:'game', title:LANG('添加游戏'), creator:GameForm, config:{
                        rtbType:'MT',
                        batch: config.batch
                    }}
                ]
            }, config);



            FormMT.master(this,null,config);
            // 电商配置
            var user = this.$user = app.getUser();
            if (user && user.campany.CategoryId == 2){
                config.modules.splice(
                    2, 1,
                    {name:'game', title:LANG('广告策略'), creator:CreativeForm, config:{
                        rtbType:'MT',
                        batch: config.batch
                    }}
                );
            }
            FormMT.master(this,"init",[config]);
        }
    });
    exports.formMT = FormMT;

    var DEFAULT_ADXID = app.config('exchanges')[0].id;

    /**
     * 活动表单 - 活动信息
     */
    function InfoRtb(config, parent){
        config = $.extend({
            'class': 'P-campaignFormInfo',
            'target': parent
        }, config);
        InfoRtb.master(this, null, config);
    }
    extend(InfoRtb, view.container, {
        init: function(){
            this.render();
            var c = this.config;

            // 建立分组
            var section = this.create('sectionBase', form.section, {
                'title': LANG('基本信息')
            });
            var con = section.getContainer();

            var tmp = {"class":"P-pageCon"};

            var layoutID = 0;
            this.layout = this.create(
                "layout"
                ,view.layout
                ,{
                    "target":con
                    ,"grid":[7,1]
                    ,"cellSet":[tmp,tmp,tmp,tmp,tmp,tmp,tmp]
                }
            );

            var nameCon = this.create('nameLayout', view.itemLayout,{
                'target':this.layout.get(layoutID++).el,
                'label': LANG('活动名称：'),
                'tips': LANG('如果活动设置跟已有活动相似，可以通过复制、修改的方式新建活动。')
            });

            this.name = this.create(
                'name', form.input,
                {
                    "width":394
                    ,"label":null
                    ,"target":nameCon.getContainer()
                    ,"value":app.util.date(LANG('新建活动_YmdHis'))
                    ,"afterHtml": '<input type="button" class="btn primary" id="COPY_CAMPAIGN" value="'+LANG("从现有活动中复制")+'" />'
                }
            )[c.batch ? 'disable' : 'enable']();

            // 出价方式
            var optimizationCon = this.create('optimizationLayout', view.itemLayout,{
                'target': this.layout.get(layoutID++).el[c.bidType ? 'hide' : 'hide'](),
                'label': LANG('出价方式：')
            });
            this.create('optimization', form.radio,{
                'target': optimizationCon.getContainer(),
                'label': null,
                'value': 0,
                'changeEvent': true,
                'option': [
                    {text: LANG('固定CPM'), value: 0},
                    {text: LANG('按CPA优化'), value: 1},
                    {text: LANG('按CPC优化'), value: 2}
                ]
            });

            var topPriceCon = this.create('topPriceLayout', view.itemLayout,{
                'target':this.layout.get(layoutID++).el[c.bidType > 0 ? 'show' : 'hide'](),
                'label': LANG('最高出价：'),
                'tips': LANG('这个活动参与竞价时出的最高价。')
            });
            this.topPrice = this.create(
                'topPrice', form.input,
                {label:null,beforeText: '￥',"afterText":LANG("元/千次曝光"), width:400,
                    target: topPriceCon.getContainer(),value:'0.00'}
            );

            var cpaPriceCon = this.create('cpaPriceLayout', view.itemLayout,{
                'target': this.layout.get(layoutID++).el.hide(),
                'label': LANG('优化单价：')
            });
            this.create('cpaPrice', form.input, {
                'target': cpaPriceCon.getContainer(),
                'label':null,
                'beforeText': '￥',
                "afterText":LANG("元"),
                'width':400,
                'value':'0.00'
            });

            // 新出价方式
            this.create('newPrice', form.newPrice, {
                'label': LANG(''),
                'target': this.layout.get(layoutID++).el.css('margin-bottom',0)[c.bidType ? 'hide' : 'show']()
            });

            var totalBudgetCon = this.create('totalBudgetLayout', view.itemLayout,{
                'target':this.layout.get(layoutID++).el,
                'label': LANG('总预算：'),
                'tips': LANG('活动的总消费。')
            });

            // 历史总消耗
            this.totalCost = $([
                '<label class="P-campaignFormInfoTotalCost">',
                LANG('（历史总消耗：'),
                '<span/>',
                '<i class="M-tagLabelsloading"/>',
                LANG('）'),
                '</label>'
            ].join(''));

            this.create(
                'totalBudget', form.input, {
                    'label': null,
                    'beforeText': '￥',
                    "afterText": LANG("元"),
                    'width': 400,
                    'target': totalBudgetCon.getContainer(),
                    'value': '0.00',
                    'afterHtml': this.totalCost.hide()
                }
            );

            var budgetCon = this.create('budgetLayout', view.itemLayout,{
                'target':this.layout.get(layoutID++).el,
                'label': LANG('每日预算：'),
                'tips': LANG('推广期间每天的广告预算。')
            });
            this.budget = this.create(
                'budget', form.input,
                {label:null,beforeText: '￥',"afterText":LANG("元"), width:400, target: budgetCon.getContainer(),value:'0.00'}
            );
            this.dg(this.topPrice.el,'input','change',{type:0},'eventPriceChange');
            this.dg(this.$.totalBudget.el,'input','change',{type:1},'eventPriceChange');
            this.dg(this.$.budget.el,'input','change',{type:2},'eventPriceChange');
            // 最低出价提示
            // this.dg(this.topPrice.el, 'input', 'focus', 'showLowPrice');
            // this.dg(this.topPrice.el, 'input', 'blur', 'hideLowPrice');

            //每日预算提示
            this.dg(this.$.totalBudget.el, 'input', 'focus', 'showBudgete');
            this.dg(this.$.totalBudget.el, 'input', 'blur', 'hideBudgete');
            this.dg(this.budget.el, 'input', 'focus', 'showBudgete');
            this.dg(this.budget.el, 'input', 'blur', 'hideBudgete');

            // 高级设置
            section = this.create('sectionAdvance', form.section, {
                'title': LANG('高级设定'),
                'class': 'M-formSection sectionAdvance'
            });
            con = section.getContainer();

            var layoutCfg = [];
            for (var i=0; i<21; i++){
                layoutCfg.push(tmp);
            }
            var layout = this.layoutMore = this.create(
                "layoutMore"
                ,view.layout
                ,{
                    "target":con
                    ,"grid":[layoutCfg.length,1]
                    ,"cellSet":layoutCfg
                }
            );

            layoutID = 0;

            var itemCon = this.create('bidSpeedLayout', view.itemLayout,{
                'target': layout.get(layoutID++),
                'label': LANG('投放速度：'),
                'tips': '快速：目标是获取尽量多的曝光<br>匀速：目标是尽可能覆盖各时段'
            });
            this.create('bidSpeed', form.radio,{
                'target': itemCon.getContainer(),
                'label': null,
                'value': 0,
                'changeEvent': true,
                'option': [
                    {text: LANG('快速'), value: 0},
                    {text: LANG('匀速'), value: 1}
                ]
            });


            // 频次控制
            var freqwrapCon = this.create('freqwrapLayout', view.itemLayout,{
                'target':layout.get(layoutID++).el,
                'label': LANG('频次控制：')
            });

            this.create('freqControl', FrequencyControl, {
                'target': freqwrapCon.getContainer(),
                'class': "frequency"
            });

            // 新重定向
            this.character = this.create(
                'character', NewPDMP,
                {label: LANG('重定向：'), target: layout.get(layoutID++).el}
            );


            var dateCon = this.create('dateLayout', view.itemLayout,{
                'target':layout.get(layoutID++).el,
                'label': LANG('投放日期：')
            });
            this.date = this.create(
                'date', form.dateRange,
                {label:null,target: dateCon.getContainer(), 'start': util.date('Y-m-d')}
            );

            this.time = this.create(
                'time', form.schedule,
                {
                    label: LANG('日程设置：'),
                    target: layout.get(layoutID++).el,
                    tips: LANG('设置活动的推广时间。')
                }
            );
            // 投放地区
            this.zone = this.create(
                'zone', form.zone,
                {label: LANG('投放地区：'), target: layout.get(layoutID++).el}
            );
            // IP地址
            this.ipSections = this.create(
                'ipSections', form.ipSections,
                {label: LANG('IP地址：'), target: layout.get(layoutID++).el}
            );

            // 暂时只有创速账户显示上网场景
            var isShow = util.exist(app.config('auth/scene'), app.getUserId());
            // 新上网场景
            var labelCon = this.create('scene', form.scene,{
                'target': layout.get(layoutID++)[isShow ? 'show' : 'hide']()
            });

            // 客户端
            this.client = this.create(
                'client', form.client,
                {
                    label: LANG('客户端：'),
                    target: layout.get(layoutID++).el,
                    tips: LANG('指定推广的客户端')
                }
            );

            // 终端类型
            this.targetPage = this.create('targetPage', form.radio, {
                'target': layout.get(layoutID++).el,
                'value': 0,
                'option': [
                    {'text':'不限','value':0},
                    {'text':'仅投PC网页','value':1},
                    {'text':'仅投移动网页','value':2}
                ],
                'label': LANG('终端类型：'),
                'tips': LANG('暂时只适用于tanx、百度、聚效、优酷、秒针、万流客、联通、谷歌、好耶、imageter、地幔、乐视渠道')
            });

            // 人群特性
            this.people = this.create(
                'people', form.people,
                {label: LANG('自有人群：'), target: layout.get(layoutID++).el}
            );

            this.peopleTanx = this.create(
                'peopleTanx', form.peopleTanx,
                {label: LANG('三方人群：'), target: layout.get(layoutID++).el}
            );

            this.peopleMiaozhen = this.create(
                'peopleMiaozhen', form.peopleMiaozhen,
                {
                    label: LANG('秒针人群：'),
                    target: layout.get(layoutID++).el,
                    tips: LANG('暂只适用于秒针渠道')
                }
            );

            var peopleBiddingxCon = this.create('peopleBiddingxLayout', view.itemLayout,{
                'target':layout.get(layoutID++).el,
                'label': LANG('其他人群：')
            });
            this.peopleBiddingx = this.create(
                'peopleBiddingx', PeopleBiddingx,
                {
                    'label': null,
                    target: peopleBiddingxCon.getContainer()
                }
            );

            // 天气
            // 温度
            this.temperature = this.create(
                'temperature', form.temperature,
                {label: LANG('温度：'), target: layout.get(layoutID++).el}
            );

            // 湿度
            labelCon = this.create('humidityLayout', view.itemLayout,{
                'target':layout.get(layoutID++).el,
                'label': LANG('湿度：')
            });
            this.create('humidity', CheckboxGroup,{
                'label': null,
                'target': labelCon.getContainer(),
                'list': [
                    {'id':1, 'text':LANG('干燥（0% ~ 40%）')},
                    {'id':2, 'text':LANG('舒适（40% ~ 70%）')},
                    {'id':3, 'text':LANG('潮湿（70% ~ 100%）')}
                ]
            });
            // 空气质量指数
            labelCon = this.create('aireIndexLayout', view.itemLayout,{
                'target':layout.get(layoutID++).el,
                'label': LANG('空气指数：')
            });
            this.create('aireIndex', CheckboxGroup,{
                'label': null,
                'target': labelCon.getContainer(),
                'list': [
                    {'id':1, 'text':LANG('优（0 ~ 50）')},
                    {'id':2, 'text':LANG('良（51 ~ 100）')},
                    {'id':3, 'text':LANG('轻度污染（101 ~ 150）')},
                    {'id':4, 'text':LANG('中度污染（151 ~ 200）')},
                    {'id':5, 'text':LANG('重度污染（201 ~ 300）')},
                    {'id':6, 'text':LANG('严重污染（300以上）')}
                ]
            });

            // 温差
            this.temperatureDiff = this.create(
                'temperatureDiff', form.temperatureDiff,
                {label: LANG('温差：'), target: layout.get(layoutID++).el}
            );

            //视频定向
            this.videoDirect = this.create(
                'videoDirect', form.videoDirect,
                {label:LANG('视频定向：'),
                    target:layout.get(layoutID++).el[app.getUserAuth(app.config('auth/hide_videoDirect')) ? 'hide' : 'show'](),
                    tips: LANG('暂时只适用于：百度、好耶、互众、聚效PC、秒针、搜狐、淘宝、腾讯、万流客、易传媒、优酷渠道')
                }
            );

            // 关键词
            this.hotWord = this.create(
                'hotWord', form.hotWord,
                {label: LANG('百度指数：'), target: layout.get(layoutID++).el}
            );

            // 页面关键词
            this.pageKeyword = this.create(
                'pageKeyword', form.pageKeyword,
                {label:LANG('页面关键词：'),
                    target:layout.get(layoutID++).el,
                    tips: LANG('对网民当前浏览的页面中包含选择的的页面关键词的网页进行定向投放。暂不支持谷歌渠道。')
                }
            );

            // 溢价设置
            section = this.create('sectionPremium', form.section, {
                'title': LANG('溢价策略')
            });
            con = section.getContainer();
            this.create('premium', premium.main,{
                target: con
            });

            // 其他设置
            section = this.create('sectionOther', form.section, {
                'title': LANG('其他设定')
            });
            con = section.getContainer();


            // 品牌保护
            var isSafe = util.exist(app.config('auth/brandSafe'), app.getUserId());
            // 品牌保护
            var brandSafeLayout = this.create('brandSafeLayout', view.itemLayout,{
                'target': con,
                'label': LANG('品牌保护：'),
                'tips': '输入活动品牌保护的URL地址。以http://开头'
            })[isSafe ? 'show' : 'hide']();
            this.create('brandSafe', form.input,{
                'target': brandSafeLayout.getContainer().css('margin-bottom', 8),
                'label': '',
                'width':400
            });

            // 代码检测
            var campaignMonitorLayout = this.create('campaignMonitorLayout', view.itemLayout,{
                'target':con,
                'label': LANG('三方监测：'),
                'tips': '输入活动第三方监控调用的URL地址。暂时不支持互众和腾讯渠道。多个URL地址使用回车换行隔开。'
            });
            this.create('campaignMonitor', form.input,{
                'target': campaignMonitorLayout.getContainer(),
                'label': '',
                'type': 'textarea',
                'width': 600,
                'height': 60
            })[c.batch ? 'disable' : 'enable']();

            // 智能监控
            this.create('smartMonitor', smartMonitor.monitor,{
                label: LANG("智能监控："), target: con
            });


            // 活动状态
            itemCon = this.create('campaignStatusLayout', view.itemLayout,{
                'target': con,
                'label': LANG('活动状态：')
            });
            this.create('campaignStatus', form.radio,{
                'target': itemCon.getContainer(),
                'label': null,
                'value': 1,
                'changeEvent': true,
                'option': [
                    {text: LANG('开启'), value: 1},
                    {text: LANG('暂停'), value: 2}
                    //{text: LANG('草稿'), value: 3}  // 暂时隐藏草稿功能
                ]
            });

            this.tags = this.create(
                'tags', taglabels.base,
                {
                    'target': con,
                    'class':'M-formItem',
                    'label': LANG('活动标签：'),
                    'tips':LANG('给活动贴上标签，方便管理。多个标签用“,”分开。'),
                    'type': 'CampaignLabel',
                    'all': true,
                    "collapse":0
                }
            );

            //新增活动流量预估flowEstimateSwitcher控件
            this.flowEstimateSwitcher = this.create('flowEstimateSwitcher',FlowEstimateSwitcher,{
                "target":this.el
            });
        },
        setData: function(data){
            if(data.Id){
                var title = '';
                if(data.Status == 3){
                    title = LANG('【草稿】')+' '+data.Id+' '+data.Name;
                }else{
                    title = data.Id+' '+data.Name;
                    // 历史总消耗
                    this.showTotalCost(data);
                }
                app.core.get("platform").setPlatform(0,title,null,'editing');
            }
            this.name.setData(data.Name || '');
            this.date.setData({start: data.StartTime, end: data.EndTime});
            this.time.setData(data.TimeSet);
            //this.impression.setData(data.EstImpression);
            //this.click.setData(data.EstClick);

            // 价格优化开关
            this.$.optimization.setData(data.WardenStatus || 0);
            this.$.cpaPrice.setData(data.TargetCpa || '0.00');
            this.topPrice.setData(data.ChargePrice || '0.00');

            // 新出价方式
            this.$.newPrice.setData(data);

            // 出价速度
            this.$.bidSpeed.setData(data.GovernorStatus || 0);

            // 频次控制
            // 频次控制使用新的模块
            this.get('freqControl').setData(data.FrequencyFilters);

            this.zone.setData(data.Zone);
            this.ipSections.setData(data.IpSections);

            // 上网场景
            this.$.scene.setData((data.Scene && data.Scene.length) ? data.Scene : null);
            this.targetPage.setData(data.TargetPage || 0);
            this.client.setData(data);
            this.people.setData(data.NPeople,data.PeopleValue);
            this.peopleMiaozhen.setData(data.MZPeople,data.MZPeopleValue);
            this.peopleTanx.setData(data.TBPeople,data.TBPeopleValue);
            // 自有人群
            var biddingxData = data.BdxPeople && data.BdxPeople.length ? {result:data.BdxPeople, filterType:data.BdxPeopleValue} : null
            this.peopleBiddingx.setData(biddingxData);

            // @暂隐藏
            // this.chargeMode.setData(data.ChargeType);
            this.$.totalBudget.setData(data.TotalBudget || '0.00');
            this.budget.setData(data.Budget || '0.00');
            this.tags.refresh();
            this.tags.setData(data.Label);

            // 重定向
            this.character.setData(data.Character);

            // 天气
            this.$.temperature.setData(data.Weather);
            this.$.humidity.setData(data.Weather && data.Weather.HumidityLevels);
            this.$.aireIndex.setData(data.Weather && data.Weather.ApiLevels);
            // 温差
            this.temperatureDiff.setData(data.TemperatureDiff);
            // 关键词
            this.hotWord.setData(data.HotWord);

            // 溢价
            this.$.premium.setData(data.NSpeculator);
            this.$.campaignStatus.setData(data.Status);
            // 代码监测
            this.$.campaignMonitor.setData(data.AMonitorUrl ? data.AMonitorUrl.join('\n') : '');
            // 智能监控
            this.$.smartMonitor.setData(data);

            this.$.videoDirect.setData(data.VideoDirect || {});

            this.$.pageKeyword.setData(data.PageKeyword || {});

            this.$.brandSafe.setData(data.BrandSafeUrl || '');
        },
        eventPriceChange:function(evt,elm){
            var type = evt.data.type;
            this.fire('priceChange',{value:$(elm).val(),type:type});
            if(type ==1 || type == 2){
                var total = this.$.totalBudget.getData();
                var budget = this.$.budget.getData();
                if(total === 0 && budget === 0){
                    this.$.bidSpeed.setData(0);
                    this.$.bidSpeed.disable(1,true);
                }
                else{
                    this.$.bidSpeed.disable(1,false);
                }
            }
        },
        getData: function(){
            var d = this.date.getData();
            var client= this.client.getData();

            // 自有人群
            var peopleBiddingx = this.peopleBiddingx.getData();
            // 人群属性
            var people = this.people.getData();
            var peopleMiaozhen = this.peopleMiaozhen.getData();
            var peopleTanx = this.peopleTanx.getData();

            // 智能监控
            var SmartMonitorData = this.$.smartMonitor.getData();

            // 新出价方式；
            var newPriceData = this.$.newPrice.getData();

            // 三方监测
            var aMonitorUrl = [];
            var aMonitorUrlArr = this.$.campaignMonitor.getData().replace(/(\n)+|(\r\n)+|(；)/g, '\n').split('\n');
            util.each(aMonitorUrlArr, function(item, idx){
                if(item && util.trim(item)){
                    aMonitorUrl.push(util.trim(item));
                }
            });

            var data = {
                Channel: 1, // RTB活动类型
                Name: this.name.getData(),
                StartTime: d.start,
                EndTime: d.end || 0,
                TimeSet: this.time.getData(),
                //EstImpression: this.impression.getData('int'),
                //EstClick: this.click.getData('int'),

                // 自动优化
                //WardenStatus: +this.$.optimization.getData() || 0,
                // 优化出价
                //TargetCpa: Math.round(+this.$.cpaPrice.getData()*100)/100 || 0,
                // 最高出价
                //ChargePrice: Math.round(+this.topPrice.getData()*100)/100,s
                WardenStatus: newPriceData.WardenStatus,
                TargetCpa: newPriceData.TargetCpa,
                ChargePrice: newPriceData.ChargePrice,
                AvgPrice: newPriceData.AvgPrice,
                GovernorStatus: +this.$.bidSpeed.getData() || 0,

                // 使用新的频次控制模块
                FrequencyFilters: this.get('freqControl').getData(),

                //分别处理浏览器、操作系统和语言
                BrowserType:client.BrowserType,
                OSType:client.OSType,
                Language:client.Language,
                // 百度人群属性和秒针人群属性
                // People: this.people.getData(),
                PeopleValue: people?people.exclude:null,
                NPeople: people ? {'sex': people.gender,'property': people.data} : [],
                MZPeopleValue: peopleMiaozhen?peopleMiaozhen.exclude:null,
                MZPeople: peopleMiaozhen ? {'sex': peopleMiaozhen.gender,'property': peopleMiaozhen.data} : [],
                // 淘宝人群属性
                TBPeopleValue: peopleTanx?peopleTanx.exclude:null,
                TBPeople: peopleTanx ? {'sex': [],'property': peopleTanx.data} : [],

                // ChargeType:+(this.chargeMode.getData()),
                // 自有人群
                BdxPeople: peopleBiddingx && peopleBiddingx.result || [],
                BdxPeopleValue: peopleBiddingx && peopleBiddingx.filterType || 0,
                ChargeType: 0,

                TotalBudget: Math.round(+this.$.totalBudget.getData()*100)/100,
                Budget: Math.round(+this.budget.getData()*100)/100,
                Label: this.tags.getData(),

                // 重定向
                Character: this.character.getData(),
                // 重定向验证用
                CharacterValue: this.character.verifyData(),

                // 地区
                Zone: this.zone.getData() || [],
                // IP地址栏
                IpSections: this.ipSections.getData() || [],

                // 上网场景
                Scene: this.$.scene.getData() || [],

                // 终端类型
                TargetPage: +this.targetPage.getData() || 0,

                // 天气相关
                Weather: {
                    "TemperatureLevels": this.$.temperature.getData().TemperatureLevels,  //温度等级
                    "LowTemperature": this.$.temperature.getData().LowTemperature, //最低温
                    "HighTemperature": this.$.temperature.getData().HighTemperature, //最高温
                    "HumidityLevels": this.$.humidity.getData(),  //选中的湿度等级
                    "ApiLevels": this.$.aireIndex.getData()  //空气质量等级
                },
                TemperatureDiff: this.temperatureDiff.getData(),
                HotWord: this.hotWord.getData(),
                // 溢价
                NSpeculator: this.$.premium.getData(),
                // 活动状态
                Status: this.$.campaignStatus.getData(),
                // 代码监测
                AMonitorUrl: aMonitorUrl,
                // 智能监控
                SmartMonitor: SmartMonitorData,
                AlarmStatus: SmartMonitorData.Status,
                AlarmId: SmartMonitorData.Id || 0,
                VideoDirect: this.$.videoDirect.getData(),
                PageKeyword: this.$.pageKeyword.getData(),
                BrandSafeUrl: this.$.brandSafe.getData()
            };

            if(this.config.bidType > 0){
                data.ChargePrice = data.TopPrice = Math.round(+this.topPrice.getData()*100)/100;
            }

            return data;
        },
        reset: function(){
            this.name.setData(app.util.date(LANG('新建活动_YmdHis')));
            this.date.setData({start:util.date('Y-m-d')});
            this.time.setData();
            // 频次控制使用新的模块
            this.get('freqControl').reset()

            this.zone.reset();
            this.ipSections.reset();

            this.$.scene.reset();

            this.targetPage.setData(0);
            this.client.reset();
            this.people.reset();
            this.peopleMiaozhen.reset();
            this.peopleBiddingx.reset();
            this.peopleTanx.reset();
            //this.impression.setData();
            //this.click.setData();
            this.topPrice.setData('0.00');
            // this.chargeMode.setData();
            this.$.totalBudget.setData('0.00');
            this.budget.setData('0.00');
            this.tags.refresh();
            this.tags.setData();
            this.character.reset();
            this.$.premium.reset();
            this.$.campaignStatus.setData(1);

            this.$.temperature.reset();
            this.$.humidity.reset();
            this.$.aireIndex.reset();

            this.temperatureDiff.reset();
            this.hotWord.reset();

            // 代码监测
            this.$.campaignMonitor.reset();

            // 智能监控
            this.$.smartMonitor.reset();

            // 历史总消耗
            this.totalCost.hide().find('span').text('');

            // 新出价方式
            this.$.newPrice.reset();

            // 视频定向
            this.$.videoDirect.reset();

            // 页面关键词
            this.$.pageKeyword.reset();

            // 品牌保护
            this.$.brandSafe.reset();
        },
        //提示每日预算提示框
        showBudgete: function(evt,elm){
            var config = {
                data: LANG('0 表示不限预算'),
                anchor: elm,
                pos: 'tm'
            };
            if (this.$.priceTip){
                this.$.priceTip.reload(config);
            }else {
                this.create('priceTip', popwin.tip, config);
            }
            this.$.priceTip.show();
        },
        //隐藏每日预算提示框
        hideBudgete: function(evt){
            if (this.$.priceTip){
                this.$.priceTip.hide();
            }
        },
        showLowPrice: function(evt, elm){
            //需求有变：隐藏出价提示
            if (!this.$priceData){
                app.data.get('/rest/lowestadposition', this, 'onPriceLoad', elm);
                return;
            }

            var id = +this.channel.getData();
            var item = util.find(this.$priceData, id, 'AdxId');
            if (!item){
                return false;
            }

            var config = {
                data: LANG('建议出价不低于 <b>%2</b> 元/千次曝光', item.Name, item.LowestPrice),
                anchor: elm,
                pos: 'tm'
            };
            // config.data += LANG('<br>不同广告位的资源底价不同');
            config.data += LANG('<br>不同广告位的资源底价不同，详情请查阅：<a href="#ads/priceList" target="_blank">RTB广告位底价</a>');

            if (this.$.priceTip){
                this.$.priceTip.reload(config);
            }else {
                this.create('priceTip', popwin.tip, config);
            }
            this.$.priceTip.show();
        },
        onPriceLoad: function(err, data, param){
            if (err){
                app.alert(err.message);
                return false;
            }
            this.$priceData = data.items;
            this.showLowPrice(null, param);
        },
        hideLowPrice: function(evt){
            if (this.$.priceTip){
                this.$.priceTip.hide();
            }
        },
        onRadioChange: function(evt){
            if (evt.from === this.$.optimization){
                var topPriceLayout = this.layout.get(2);
                var cpaPriceLayout = this.layout.get(3);
                if (evt.param.value === 0){
                    cpaPriceLayout.hide();
                    topPriceLayout.hide();
                    if (this.$.topPrice){
                        this.$.topPrice.updateWidth();
                    }
                }else {
                    topPriceLayout.hide();
                    cpaPriceLayout.hide();
                    if (this.$.cpaPrice){
                        this.$.cpaPrice.updateWidth();
                    }
                }
            }
            if(evt.from === this.$.campaignStatus){
                this.$draftStatus = (evt.param.value === 3) ? 1 : 0;
            }
            return false;
        },
        // 加载历史总消耗
        showTotalCost: function(data){
            if(util.exist(app.config('auth/filter_tab_cols'), app.getUserId())){
                return;
            }else{
                app.data.get("/rest/listcampaigngo", {
                    'Id': data._id,
                    'begindate': data.CreateTime,
                    'enddate': Math.floor(new Date().getTime()/1000)
                }, this, 'onCostLoad');
            }
        },
        onCostLoad: function(err, data){
            if (err){
                app.error(err.message);
                return false;
            }
            // 格式化数字
            var val = data && data.items && data.items[0] && data.items[0].cost || 0;
            val = LANG("￥")+util.numberFormat(util.round0(val, 2));
            this.totalCost.show().find('span').text(val).next('i').hide();
        }
    });
    exports.infoRtb = InfoRtb;

    // 移动端RTB
    var InfoRTBmoblie = app.extend(InfoRtb, {
        init: function(config,parent){
            InfoRTBmoblie.master(this,null,config);
            InfoRTBmoblie.master(this,"init",[config]);

            // 重写客户端模块
            var con = $(this.$.layoutMore.get(8).el).empty().addClass('mg0');

            // 设置重定向为设备id
            this.$.character.setPdmpType('device');

            // 移动活动隐藏客户端定向条件
            this.client.el.parent().hide();

            // 设备类型
            this.deviceType = this.create(
                'deviceType', form.moblieClientRTB,
                {
                    'label': LANG('设备类型：'),
                    'target': con,
                    'configType': 'deviceType',
                    'option': [LANG('不限'), LANG('选择设备类型')],
                    'class': 'P-campaignFormInfoMTdeviceType'
                }
            );
            // 设备品牌
            this.deviceBrand = this.create(
                'deviceBrand', form.moblieClientRTB,
                {
                    'label': LANG('设备品牌：'),
                    'target': con,
                    'configType': 'deviceBrand',
                    'option': [LANG('不限'), LANG('选择设备品牌')],
                    'class': 'P-campaignFormInfoMTdeviceType'
                }
            );
            // 设备型号
            this.deviceModel = this.create(
                'deviceModel', form.deviceModel,
                {
                    'label': LANG('设备型号：'),
                    'target': con,
                    'class': 'P-campaignFormInfoMTdeviceType'
                    //tips: LANG('指定推广的客户端')
                }
            );
            // 上网类型
            this.network = this.create(
                'network', form.moblieClientRTB,
                {
                    'label': LANG('上网类型：'),
                    'target': con,
                    'configType': 'network',
                    'option': [LANG('不限'), LANG('选择上网类型')],
                    'class': 'P-campaignFormInfoMTdeviceType'
                }
            );

            // 操作系统
            this.client = this.create(
                'clientMT', form.moblieClientRTB,
                {
                    'label': LANG('操作系统：'),
                    'target': con,
                    'configType': 'os',
                    'option': [LANG('不限'), LANG('选择操作系统')],
                    'class': 'P-campaignFormInfoMTdeviceType'
                }
            );

            // 运营商
            this.carriers = this.create('carriers', form.carriers,{
                'target': con,
                'class': 'P-campaignFormInfoMTdeviceType',
                'tips': LANG('暂只适用于百度移动、移动资源、Tanx移动、广点通四个渠道。')
            });

            var isShow = util.exist(app.config('auth/peopleUnicom'), app.getUserId()) || util.exist(app.config('auth/peopleUnicom'), app.getCreateUserId());
            if(app.getUserType() == 4){
                isShow = true;
            }
            // 移动活动显示联通人群
            this.peopleUnicom = this.create(
                'peopleUnicom', form.peopleUnicom,
                {
                    'class': 'M-formItem P-campaignFormInfoMTdeviceType',
                    'label': LANG('联通人群：'),
                    'target': con
                }
            )[isShow ? 'show' : 'hide']();

            // 移动活动隐藏其他人群
            this.peopleBiddingx.setParam({'Mobile': 1});
            // this.peopleBiddingx.el.parentsUntil('.M-formSectionContainer').hide();
            // 移动活动隐藏秒针人群
            this.peopleMiaozhen.el.parent().hide();

            // 移动活动隐藏百度人群(自有人群)
            this.people.el.parent().hide();

            // 移动活动隐藏淘宝人群
            this.peopleTanx.el.parent().hide();

            this.targetPage.el.parent().hide();


            // 移动活动隐藏温度，湿度，空气指数
            this.$.temperature.el.parent().hide();
            this.$.humidityLayout.el.parent().hide();
            this.$.aireIndexLayout.el.parent().hide();

            // 移动活动隐藏温差，关键词
            this.temperatureDiff.el.parent().hide();
            //this.hotWord.el.parent().hide();

            // 视频定向
            this.videoDirect.setTips(LANG('暂只适用于优酷'));

            // 页面关键词隐藏
            this.pageKeyword.el.parent().hide();

        },
        setData: function(data){
            InfoRTBmoblie.master(this,"setData",arguments);
            this.deviceType.setData(data.DeviceType);
            this.deviceBrand.setData(data.DeviceBrand);
            this.deviceModel.setData(data.DeviceModel);
            this.network.setData(data.Network);
            this.client.setData(data.OSType);
            this.peopleUnicom.setData(data.CUPeople, data.CUPeopleValue);
            this.carriers.setData(data.Carriers || []);
        },
        getData: function(){
            var data = InfoRTBmoblie.master(this,"getData",arguments);

            var peopleUnicom = this.peopleUnicom.getData();

            data.Channel = 4; // 1 RTB 2代理 3直投，4移动
            data.DeviceType = this.deviceType.getData()['deviceType'];
            data.OSType = this.client.getData()['os'];
            data.DeviceBrand = this.deviceBrand.getData()['deviceBrand'];
            data.DeviceModel = this.deviceModel.getData();
            data.Network = this.network.getData()['network'];
            data.CUPeopleValue = peopleUnicom ? peopleUnicom.exclude : 0;
            data.CUPeople = peopleUnicom ? {'sex': [],'property': peopleUnicom.data} : [];
            data.Carriers = this.carriers.getData();

            return data;
        },
        reset: function(){
            InfoRTBmoblie.master(this,"reset",arguments);
            this.deviceType.reset();
            this.deviceBrand.reset();
            this.deviceModel.reset();
            this.network.reset();
            this.client.reset();
            this.peopleUnicom.reset();
            this.carriers.reset();
        }
    });
    exports.infoRTBmoblie = InfoRTBmoblie;

    // 频次控制模块
    var FrequencyControl = app.extend(view.container, {
        init: function(config){
            config = $.extend(true, {
            }, config);
            FrequencyControl.master(this, null, config);
            FrequencyControl.master(this, 'init', arguments);

            this.build();
        },
        build: function() {
            var el = this.el;

            var i;
            for (i = 1; i <= 2; i++) {
                var freqRow = $('<div class="freqRow"></div>').appendTo(el);

                // 类型
                var typeOptions = [
                    {Name: LANG('创意包'), _id: 3},
                    {Name: LANG('活动'), _id: 0}
                ];
                if(i>1){
                    typeOptions.push({Name: LANG('选择对象'), _id:null});
                }
                this.create('freqType' + i, common.dropdown,{
                    'options': typeOptions,
                    'target': freqRow,
                    'width': 100,
                    'search': false,
                    'def': LANG('选择对象')
                });

                // 间隔
                var freqOptions = [
                    {Name: LANG('每小时'), _id: 1},
                    {Name: LANG('每天'), _id: 2},
                    {Name: LANG('每周'), _id: 0},
                    {Name: LANG('每月'), _id: 3}
                ];
                if(i>1){
                    freqOptions.push({Name: LANG('选择单位'), _id:null});
                }
                this.create('freqInterval' + i, common.dropdown,{
                    'options': freqOptions,
                    'target': freqRow,
                    'width': 100,
                    'search': false,
                    'def': LANG('选择单位')
                });

                // 次数
                this.create(
                    'freqInput' + i, form.input,
                    {
                        'afterText':LANG('次'),
                        'target': freqRow,
                        'value': '',
                        'label':'',
                        'class':'M-formItem freqInput',
                        'width':70
                    }
                );

                // 第一行添加提示
                if (i === 1 ) {
                    this.create('freqTips', common.tips, {
                        'target': freqRow,
                        'tips': LANG('控制在设定的时间内活动或创意包的展现次数。“0”表示不限次数。多个条件控制的情况，只要满足任意一个条件则暂停对应创意包或活动的投放。')
                    });
                }
            }
        },
        getData: function() {
            var data = this.$data = [];

            var i;
            for (i = 1; i <= 2; i++) {
                var row = {};
                // 类型选择
                row.Type = this.get('freqType' + i).getData();
                // 频率选择
                row.Period = this.get('freqInterval' + i).getData();
                // 频率
                row.Frequency = this.get('freqInput' + i).getData();

                data.push(row);
            }

            return data;
        },
        setData: function(data) {
            this.$data = data;
            if (data) {
                var len,
                    i;
                if (data && data.length) {
                    len = data.length;
                } else {
                    len = 0;
                }

                for (i = 1; i <= len; i++) {
                    var row = data[i - 1];
                    // 类型选择
                    this.get('freqType' + i).setData(row.Type);
                    // 频率选择
                    this.get('freqInterval' + i).setData(row.Period);
                    // 频率
                    this.get('freqInput' + i).setData(row.Frequency);
                }
            }

            return this;
        },
        reset: function() {
            // 第一列要设置默认值
            // 类型选择
            this.get('freqType1').setData(3);
            // 频率选择
            this.get('freqInterval1').setData(2);
            // 频率
            this.get('freqInput1').setData(6);

            // 类型选择
            this.get('freqType2').reset();
            // 频率选择
            this.get('freqInterval2').reset();
            // 频率
            this.get('freqInput2').reset();

        }
    });

    /**
     * 受众特征
     */
    var Character = app.extend(view.container, {
        init: function(config, parent){
            config = $.extend(true, {
                'target': parent,
                'label': LANG('受众特征'),
                'auto_load': true,
                'url': '/rest/listfeature',
                'param': null,
                'data': null
            }, config);
            Character.master(this, null, config);
            this.render();

            // 控件状态
            this.$default = {
                type: ['n'],
                time: 0,
                money: 0
            };
            this.$data = config.data || this.$default;

            // 主要内容容器
            this.$body = $('<div class="P-campaignCharacter"/>').appendTo(this.el);

            // 创建Item
            this.create(form.item, {
                'el': this.el,
                'label': config.label
            });

            this.build();
            this.$ready = 0;
            // 加载数据
            if (config.url && config.auto_load){
                this.load();
            }
        },
        /**
         * 构建内容
         * @return {None}
         */
        build: function(){
            var dom = this.$body;
            dom.html(LANG(
                '最近30天, 登录 %1 ≥ %2 次, 且充值金额 ≥ %3 元',
                '<span data-id="type" />',
                '<input type="text" class="time">',
                '<span data-id="money" />'
            ));
            this.$time = dom.find('.time:first');

            this.create('type', common.subDropdown, {
                'target': dom.find('[data-id="type"]:first'),
                'search': false,
                'scroll': false,
                'key': '_id',
                'name': 'text'
            });

            this.create('money', common.dropdown, {
                'target': dom.find('[data-id="money"]:first'),
                'width': 80,
                'scroll': false,
                'search': false,
                'key': 'id',
                'name': 'text'
            });
        },
        /**
         * 更新选项卡可选项目
         * @param  {Object} data 选项项目列表对象
         * @return {None}
         */
        updateOption: function(data){
            this.$ready = 1;

            var opts = [
                {_id:'n', text:LANG('不限')},
                {_id:'p', text:LANG('游戏'), search:true, scroll: 200},
                {_id:'c', text:LANG('类型')}
            ];
            opts[1].subs = data.product;
            opts[2].subs = data.category;
            this.$.type.setData(['n'], opts);

            opts = [
                {id:0, text:LANG('不限')},
                {id:10, text:'10'},
                {id:50, text:'50'},
                {id:100, text:'100'},
                {id:200, text:'200'},
                {id:500, text:'500'},
                {id:1000, text:'1,000'},
                {id:5000, text:'5,000'},
                {id:10000, text:'10,000'}
            ];
            this.$.money.setData(0, opts);
        },
        /**
         * 设置选中状态以及选项列表
         * @param {Array} data    ActionTerm条件列表数组
         * @param {Object} option 选项项目列表对象
         */
        setData: function(data, option){
            if (option){
                this.updateOption(option);
            }
            // 更新状态
            if (data){
                // 处理转换数据
                var value = this.$data = this.$default;
                util.each(data, function(at){
                    switch (at.Operation){
                        case '登录':
                            value.type = [at.TargetCate, at.Target];
                            value.time = at.Value;
                            break;
                        case '充值':
                            value.money = at.Value;
                            break;
                    }
                });
            }

            data = this.$data;
            this.$.type.setData(data.type);
            this.$time.val(data.time);
            this.$.money.setData(data.money);
        },
        /**
         * 重置控件选择状态
         */
        reset: function(){
            this.setData(this.$default);
        },
        /**
         * 加载选项数据
         */
        load: function(){
            var c = this.config;
            app.data.get(c.url, c.param, this);
        },
        /**
         * 加载数据回调函数
         */
        onData: function(err, data){
            if (err){
                // todo: 拉取列表数据错误, 禁用控件?
                return false;
            }
            util.each(data.product, function(item){
                item.text = item._id;
            });
            util.each(data.category, function(item){
                item.text = item._id;
            });
            this.setData(null, data);
        },
        /**
         * 获取受众特征数据格式
         * @return {Array} ActionTerm条件列表数组
         */
        getData: function(){
            var data = [];
            var val = this.$.type.getData();
            data.push({
                Type: 0,
                Operation: '登录',
                Target: val[1] || '',
                TargetCate: val[0],
                Comparison: '>=',
                Value: +this.$time.val() || 0,
                PrevLogical: 'and'
            });
            var money = this.$.money.getData();
            if (money > 0){
                data.push({
                    Type: 0,
                    Operation: '充值',
                    Target: val[1] || '',
                    TargetCate: val[0],
                    Comparison: '>=',
                    Value: money,
                    PrevLogical: 'and'
                });
            }
            return data;
        }
    });
    exports.character = Character;

    var CheckboxGroup = app.extend(view.container, {
        init: function(config, parent){
            config = $.extend({
                'class': 'P-campaignCheckGroup',
                'target': parent,
                'label': LANG('选项组'),
                'url': null,
                'param': null,
                'data': null,
                'list': null,
                'hasExcludeBtn': true,
                'hasSearch': false,
                'hasRadio': false,
                'hasAllSelect': false,
                'moduleTips': false, // 模块说明提示
                'checkboxType':[
                    {value: 'all', text: LANG('不限'), checked: true},
                    {value: 'include', text: LANG('包含以下条件')},
                    {value: 'exclude', text: LANG('排除以下条件')}
                ] // 所有, 包含, 排除选项
            }, config);

            CheckboxGroup.master(this, null, config);
            CheckboxGroup.master(this, 'init', arguments);

            this.$ready = false;
            this.$data = config.data || null;
            this.$list = config.list || null;

            this.build();
        },
        build: function(){
            var el = this.el;
            var c = this.config;

            // 所有, 包含, 排除选项
            var con = this.$typeContainer = $('<div class="P-campaignCheckGroupType"/>').appendTo(el);
            var name = 'PDMP_TYPE_'+util.guid();
            var elm = [];
            util.each(c.checkboxType, function(item, idx){
                if(item){
                    elm.push('<label><input type="radio" name="'+name+'" value="'+item.value+'" '+(item.checked ? 'checked' : '')+'> '+item.text+'</label>');
                }
            });
            con.append(elm.join(''));

            // 绑定事件
            this.dg(con, 'input:radio', 'change', 'eventChangeType');

            con = this.$listContainer = $('<div class="P-campaignCheckGroupList"/>').hide().appendTo(el);

            var header = this.$listheader = $('<div class="P-campaignCheckGroupListHeader"/>').appendTo(con).hide();

            // 创建搜索框
            if(this.config.hasSearch){
                this.create('search', common.searchBar, {
                    target: header.show()
                });
                // 删除按钮
                var delBtn = $('<a class="searchCancle"/>').appendTo(this.$.search.el);
                this.jq(delBtn, 'click', 'eventCancelSearch');
            }

            // 单选框 - 区分根据Cookies还是根据Ip（重定向模块）
            if(this.config.hasRadio){
                this.create('radio', form.radio, {
                    'target':header.show(),
                    'class':'PDMPtype',
                    'changeEvent': true,
                    'option':[
                        {'text':LANG('根据Cookies'), 'value':'cookie'},
                        {'text':LANG('根据IP'), 'value':'ip'},
                        {'text':LANG('根据设备'), 'value':'device'}
                    ],
                    'label': null
                });
            }
            // 模块提示文字
            if(this.config.moduleTips){
                $('<span class="fr mr20"/>').text(this.config.moduleTips).appendTo(header);
            }

            // 增加全选按钮
            if(this.config.hasAllSelect){
                this.$allSelect = $([
                    '<label>',
                    '<input type="checkbox" value="allSelect" style="margin-right:5px">',
                    LANG('全选'),
                    '</label>'
                ].join('')).css({
                    'margin-left':20,
                    'cursor':'pointer'
                }).appendTo(header.show()).find('input');
                this.jq(this.$allSelect,'change','eventAllSelect');
            }

            var wrap = this.$listCon = $('<div class="P-campaignCheckGroupListCon clear"/>').appendTo(con);

            // 创建滚动条
            this.create('scroll', common.scroller, {
                target: wrap.wrap('<div class="P-campaignCheckGroupListWrapper"/>').parent(),
                content: wrap,
                pad: false,
                dir: 'V'
            });

            if(!this.config.hasExcludeBtn){
                // 隐藏'包含排除'选项
                this.$typeContainer.hide().find('[value="include"]').click();
            }

            this.$ready = true;
            if (this.$list){
                this.setList(this.$list);
            }
            if (this.$data){
                this.setData(this.$data);
            }
        },
        // 搜索框搜索事件
        onSearchInput: function(ev){
            var items = this.$listCon.find('label');
            var value = ev.param.value;

            // 输入的时候设置全选按钮为false状态
            this.resetAllSelect();

            if(value){
                util.each(this.$list,function(data, i){
                    if(data.Name.indexOf(value)>=0 || String(data.Visitors).indexOf(value)>=0){
                        $(items[i]).show();
                    }else{
                        $(items[i]).hide();
                    }
                });
            }else{
                // 显示全部选项
                for (var i = 0; i < items.length; i++) {
                    $(items[i]).show();
                }
            }
            this.$.scroll.measure();
            return false;
        },
        // 搜索框删除按钮事件
        eventCancelSearch: function(ev){
            // 删除输入的时候设置全选按钮为false状态
            this.resetAllSelect();
            // 输入框清零
            this.$.search.el.find('input').val('');
            // 显示全部选项
            var items = this.$listCon.find('label');
            for (var i = 0; i < items.length; i++) {
                $(items[i]).show();
            }
            this.$.scroll.measure();
            return false;
        },
        eventAllSelect: function(ev, elm){
            var check = $(elm).prop('checked');
            this.$listCon.find('input:visible').prop('checked',check);
        },
        buildItem: function(item){
            var id = item.id;
            $('<label class="P-campaignCheckGroupItem" />').append(
                $('<input type="checkbox" />').val(id),
                $('<span title="'+item.text+'"/>').text(item.text)
            ).appendTo(this.$listCon);

            return this;
        },
        eventChangeType: function(evt, elm){
            var show = elm.value != 'all';
            this.$listContainer.toggle(show);
            if (show){
                // 搜索框对焦
                this.$listContainer.find('.M-commonSearchBar input').focus();
                if (this.$list){
                    this.$.scroll.measure();
                }else {
                    this.load();
                }
            }
        },
        onReset: function(){
            // 清空变量
            this.$data = null;

            // 清空选择列表
            this.$typeContainer.find('input[value="all"]').click();

            // 如果有加载数据url, 清空选项, 重新加载数据
            if (this.config.url){
                this.$list = null;
                this.$listCon.empty();
            }
        },
        getData: function(){
            var self = this;
            if (!self.$ready){ return null; }

            var type = self.$typeContainer.find('input:checked:first').val();
            if (type == 'all'){
                // 全部, 不限制
                this.$data = null;
                return null;
            }else {
                var cats = self.$listCon.find('input:checked').filter(':visible');
                var item, result = [];
                for (var i=cats.length; i>0;){
                    item = util.find(this.$list, cats[--i].value, 'id');
                    if (item){
                        result.push(item.id);
                    }
                }
                this.$data = {
                    // 0：包含，1：排除
                    'filterType': (type == 'include'?0:1),
                    'result': result
                };
                return this.$data;
            }
        },
        /**
         * @param {Object} data       选项数据
         * @param {Nmuber} filterType 下拉框数据 0：包含，1：排除
         */
        setData: function(data){
            this.$data = data;
            // 同步类型, 并开始加载列表数据
            var type = data ? (data.filterType ? 'exclude':'include') : 'all';
            this.$typeContainer.find('input[value="'+type+'"]').click();

            if (!this.$list){ return; }

            // 勾选选项列表
            var con = this.$listCon;
            con.find('input:checked').prop('checked', false);
            if(data){
                util.each(data.result, function(id){
                    con.find('input[value="'+id+'"]').prop('checked', true);
                });
            }
            // 设置数据的时候设置全选按钮为false状态
            this.resetAllSelect();
            return this;
        },
        setList: function(list){
            var self = this;
            self.$list = list;
            // 生成列表
            self.$listCon.empty();
            if (!list || !self.$ready){ return; }

            // 设置选项列表数据
            util.each(list, function(item){
                self.buildItem(item);
            });

            if (self.$data){
                self.setData(self.$data);
            }
            this.$.scroll.measure();
            return self;
        },
        load: function(url){
            var c = this.config;
            if (c.url){
                url = url ? url : c.url;
                this.showLoading();
                app.data.get(url, c.param, this);
            }
            return this;
        },
        onData: function(err, data){
            this.hideLoading();
            if (err){
                app.error(err);
                return;
            }
            this.setList(data.items);
        },
        onEvent: function(){
            return false;
        },
        reset: function(){
            this.setData(null);
        },
        // 设置全选按钮为false状态
        resetAllSelect: function(){
            if(this.config.hasAllSelect){
                this.$allSelect.prop('checked',false);
            }
            return this;
        },
        // 刷新滚动条
        updateScroll: function(){
            this.$.scroll.measure();
            return this;
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

    // 重定向
    var PDMP = app.extend(CheckboxGroup, {
        init: function(config, parent){
            config = $.extend({
                'label': LANG('重定向'),
                'url': '/rest/listvisitorcategorizeinfo?runstatus=1&order=Visitors%7C-1',
                'url_ip': '/rest/listipvisitorcategorizeinfo',
                'url_device': '/rest/listdevicevisitorcategorizeinfo',
                'hasSearch': true,
                'hasRadio': true,
                'hasAllSelect': true
            }, config);

            PDMP.master(this, null, config);
            PDMP.master(this, 'init', arguments);

            // 默认隐藏“根据设备”
            this.hideDevice(true);
        },
        buildItem: function(item){
            item = {
                id: item.VisitorCateId,
                text: LANG('%1 (%2人)', item.Name ,item.Visitors),
                name: item.Name,
                visitors: LANG('(%1人)',item.Visitors)
            };

            var id = item.id;
            $('<label class="P-campaignCheckGroupItem P-campaignPDMPCheckGroup"/>').append(
                $('<input type="checkbox" />').val(id),
                $('<span class="name" title="'+item.text+'"/>').text(item.name),
                $('<span class="visitors" title="'+item.text+'"/>').text(item.visitors)
            ).appendTo(this.$listCon);
        },
        getData: function(){
            var self = this;
            if (!self.$ready){ return null; }

            var type = self.$typeContainer.find('input:checked:first').val();
            if (type == 'all' || self.el.find('.M-commonLoading').is(':visible')){
                // 全部, 不限制
                this.$data = null;
                return null;
            }else {
                var cats = self.$listCon.find('input:checked');
                var item, result = [];
                for (var i=cats.length; i>0;){
                    item = util.find(this.$list, cats[--i].value, 'VisitorCateId');
                    if (item){
                        result.push({
                            Type: 0,
                            VisitorCateId: item.VisitorCateId,
                            OwnerType: item.OwnerType,
                            OwnerId: item.OwnerId,
                            CateName: item.Name,
                            Comparison: '>=',
                            Value: 1,
                            PrevLogical: 'or'
                        });
                    }
                }
                this.$data = {
                    // 0：包含，1：排除
                    'filterType': (type == 'include'?0:1),
                    'result': result,
                    'pdmpType':self.$.radio ? self.$.radio.getData(): ''
                };
                return this.$data;
            }
        },
        /**
         * @param {Object} data       选项数据
         * @param {Nmuber} filterType 下拉框数据 0：包含，1：排除
         */
        setData: function(data){
            this.$data = data;
            var type = data ? (data.filterType ? 'exclude':'include') : 'all';

            if(!this.config.hasExcludeBtn){
                // 限制为'包含'
                type = 'include';
            }

            if(this.$.radio){
                // 包含根据cookies或IP过滤功能
                var pdmpType = data && data.pdmpType;
                this.togglePDMP(pdmpType, type);
            }else{
                this.$typeContainer.find('input[value="'+type+'"]').click();
            }

            // 若列表数据还未拉取完成，退出此次
            if (!this.$list){ return; }

            // 勾选选项列表
            var con = this.$listCon;
            con.find('input:checked').prop('checked', false);
            if(data){
                util.each(data.result, function(item){
                    con.find('input[value="'+item.VisitorCateId+'"]').prop('checked', true);
                });
            }
            this.updateScroll();
            return this;
        },
        eventChangeType: function(evt, elm){
            var show = elm.value != 'all';
            this.$listContainer.toggle(show);
            if (show){
                // 搜索框对焦
                this.$listContainer.find('.M-commonSearchBar input').focus();
                if (this.$list){
                    this.$.scroll.measure();
                }else {
                    // 设置单选框的默认选中值-“根据cookie”
                    if(this.$.radio){
                        this.$.radio.el.find('input[value="cookie"]').prop('checked', true);
                    }
                    this.load();
                }
            }
        },
        // 切换重定向类型 -cookie还是ip；包含还是排除
        togglePDMP: function(pdmpType, type){
            if(type != 'all'){
                if (!this.$list){
                    // 加载重定向数据
                    this.loadData(pdmpType);
                    return;
                }

                // 切换cookie或ip
                var radio = this.$.radio;
                radio.el.find('input[value="'+pdmpType+'"]').prop('checked', true);
                // 设置last_value
                radio.last_value = util.find(radio.config.option, pdmpType, 'value');
            }

            // 显示内容框
            this.$listContainer.toggle( type!='all' );

            // 切换不限、包含或排除
            this.$typeContainer.find('input[value="'+type+'"]').prop('checked', true);
        },
        // 加载重定向数据
        loadData: function(type){
            var c = this.config,
                url = (type == 'ip') ? c.url_ip : c.url;
            url = type ? url : null;
            if(type == 'device'){
                url = c.url_device;
            }
            this.load(url);
        },
        // 单选框响应事件
        onRadioChange: function(ev){
            // 清空上一次的选项，因为根据cookies和根据ip是不同的接口数据
            this.$data = null;
            // 重新加载列表数据
            this.loadData(ev.param.value);
            return false;
        },
        // 隐藏原有的radio组
        hideTypeContainer: function(type){
            this.$typeContainer.hide();
            this.$typeContainer.find('input[value="'+type+'"]').prop('checked', true);
            this.eventChangeType(null, {'value': true});
            return this;
        },
        // 取消所有选择，有别于还原
        cancelSelect: function(type){
            var self = this;
            self.$listCon.find('input:checked').prop('checked', false);
            self.resetAllSelect();
            // 切换cookie或ip
            var radio = this.$.radio;
            radio.el.find('input[value="cookie"]').click();
            //设置last_value
            radio.last_value = util.find(radio.config.option, 'cookie', 'value');

            return self;
        },
        // 接收cast广播
        onSetPdmpType: function(ev){
            var type = ev.param.type;
            var radio = this.get('radio');
            this.hideDevice(false);
            if(radio){
                radio.el.find('input[value="'+type+'"]').click();
            }else{
                this.onRadioChange({'param': {'value': type}});
            }
        },
        // 是否隐藏“根据设备”
        hideDevice: function(bool){
            var radio = this.get('radio');
            if(radio){
                if(bool){
                    // 真值隐藏根据设备
                    radio.el.find('input[value="device"]').hide().next('label').hide();
                }else{
                    // 否值显示根据设备，隐藏其他
                    radio.el.children().show().filter('input[value="device"]').prevAll().hide();
                }
            }
            return this;
        }
    });
    exports.pdmp = PDMP;

    // 新重定向
    var NewPDMP = app.extend(form.radio, {
        init: function(config){
            config = $.extend({
                'label': LANG('人群属性'),
                'option': [LANG('不限'), LANG('指定人群')],
                'selected': null
            }, config);
            NewPDMP.master(this, null, config);
            NewPDMP.master(this, 'init', arguments);

            this.$ready = false;
            this.$data = config.selected;

            this.build();
        },
        build: function(){
            if (this.$ready){ return; }
            var self = this;
            self.doms = {
                con: $('<div class="M-formCountry P-campaignPDMP" />').appendTo(self.el)
            };

            self.tab = self.create('tab', tab.base, {
                'target': self.doms.con,
                'list': {
                    'include': {
                        'text': LANG('包含以下人群')
                    },
                    'exclude': {
                        'text': LANG('排除以下人群')
                    }
                }
            });

            // 包含区
            self.include = self.create('include', PDMP, {
                'target': self.tab.getContainer('include')
            }).hideTypeContainer('include');

            // 排除区
            self.exclude = self.create('exclude', PDMP, {
                'target': self.tab.getContainer('exclude')
            }).hideTypeContainer('exclude');

            self.afterCreate();


            $('<span class="ml20"/>')
                .html(LANG('若同时设置“包含”和“排除”条件，则投放两个条件交集的人群'))
                .appendTo(self.doms.con.find('.M-tabHead'));
        },
        onTabChange: function(ev){
            this.updateScroll();
            if(this.$data){
                this.setData();
            }
        },
        afterCreate: function(mod){
            this.$ready = true;
            this.jq(this.list[0], 'change', 'changeStatue');
            this.jq(this.list[1], 'change', 'changeStatue');
            if (this.$data){
                this.setData(this.$data);
            }else {
                this.changeStatue();
            }
        },
        changeStatue: function(evt){
            var checked = this.list[1].prop('checked');
            this.doms.con.toggle(checked);
            this.updateScroll();
        },
        updateScroll: function(){
            if(this.include){
                this.include.updateScroll();
            }
            if(this.exclude){
                this.exclude.updateScroll();
            }
        },
        setData: function(data){
            this.$data = data;
            var includeData = null;
            var excludeData = null;

            if(data && data.Cookie && data.Ip){
                if(data.Cookie.Exclude.length===0 && data.Cookie.Include.length===0 && data.Ip.Exclude.length===0 && data.Ip.Include.length===0){
                    this.list[0].click();
                }else{

                    if(data.Cookie.Include.length > 0 ){
                        includeData = {
                            filterType: 0,
                            result: data.Cookie.Include,
                            pdmpType: 'cookie'
                        }
                    }

                    if(data.Ip.Include.length > 0 ){
                        includeData = {
                            filterType: 0,
                            result: data.Ip.Include,
                            pdmpType: 'ip'
                        }
                        if(this.include){
                            this.include.loadData('ip');
                        }
                    }

                    if(data.Cookie.Exclude.length > 0 ){
                        excludeData = {
                            filterType: 0,
                            result: data.Cookie.Exclude,
                            pdmpType: 'cookie'
                        }
                    }

                    if(data.Ip.Exclude.length > 0 ){
                        excludeData = {
                            filterType: 0,
                            result: data.Ip.Exclude,
                            pdmpType: 'ip'
                        }
                        if(this.exclude){
                            this.exclude.loadData('ip');
                        }
                    }

                    this.list[1].click();

                    if(this.include && includeData){
                        this.include.setData(includeData);
                    }

                    if(this.exclude && excludeData){
                        this.exclude.setData(excludeData);
                    }

                }
            }

            if(data && data.Device){
                if(data.Device.Exclude.length===0 && data.Device.Include.length===0 && data.Cookie.Exclude.length===0 && data.Cookie.Include.length===0 && data.Ip.Exclude.length===0 && data.Ip.Include.length===0){

                    this.list[0].click();
                }else{

                    if(data.Device.Include.length > 0 ){
                        includeData = {
                            filterType: 0,
                            result: data.Device.Include,
                            pdmpType: 'device'
                        }
                        if(this.include){
                            this.include.loadData('device');
                        }
                    }

                    if(data.Device.Exclude.length > 0 ){
                        excludeData = {
                            filterType: 0,
                            result: data.Device.Exclude,
                            pdmpType: 'device'
                        }
                        if(this.exclude){
                            this.exclude.loadData('device');
                        }
                    }

                    this.list[1].click();

                    if(this.include && includeData){
                        this.include.setData(includeData);
                    }

                    if(this.exclude && excludeData){
                        this.exclude.setData(excludeData);
                    }

                }
            }
        },
        getData: function(){
            // 原始数值结构
            var init_data = {
                Ip: {
                    Include: [],
                    Exclude: []
                },
                Cookie: {
                    Include: [],
                    Exclude: []
                },
                Device: {
                    Include: [],
                    Exclude: []
                }
            };
            if (this.list[0].prop('checked')){
                // 不限时返回原始数值结构
                return init_data;
            }else {
                var data = util.clone(init_data);

                var includeData = this.include.getData();
                var excludeData = this.exclude.getData();

                // 如果没有数据，直接返回this.$data;
                if(!includeData && !excludeData){
                    return this.$data;
                }

                // 处理包含
                switch (includeData.pdmpType){
                    case 'cookie':
                        data.Cookie.Include = includeData.result;
                        break;
                    case 'ip':
                        data.Ip.Include = includeData.result;
                        break;
                    case 'device':
                        data.Device.Include = includeData.result;
                        break;
                }

                // 处理排除
                switch (excludeData.pdmpType){
                    case 'cookie':
                        data.Cookie.Exclude = excludeData.result;
                        break;
                    case 'ip':
                        data.Ip.Exclude = excludeData.result;
                        break;
                    case 'device':
                        data.Device.Exclude = excludeData.result;
                        break;
                }

                return util.merge(init_data, data);
            }
        },
        reset: function(){
            this.$data = null;
            this.list[0].prop('checked');
            this.list[0].click();
            this.tab.switchTab('include');

            if(this.include){
                this.include.cancelSelect('include');
            }
            if(this.exclude){
                this.exclude.cancelSelect('exclude');
            }
        },
        // 保存时的验证
        verifyData: function(){
            var selectValue = 0;
            // 选择“不限”或是“指定人群”
            if(this.list[1].prop('checked')){
                selectValue = 1;
            }

            return selectValue;
        },
        setPdmpType: function(type){
            if(type == 'device'){
                //this.include.setPdmpType(type);
                //this.exclude.setPdmpType(type);

                // 使用cast传播到下级模块
                this.cast('setPdmpType',{'type': type});
            }
            return this;
        }
    })
    exports.NewPDMP = NewPDMP;

    // 自有人群
    var PeopleBiddingx = app.extend(PDMP, {
        init: function(config, parent){
            config = $.extend({
                'label': LANG('自有人群'),
                'url': '/rest/listbiddingxinfo',
                'hasSearch': true,
                'hasRadio': false
            }, config);

            PeopleBiddingx.master(this, null, config);
            PeopleBiddingx.master(this, 'init', arguments);

            this.el.addClass('P-campaignPeopleBiddingx');
        },
        setParam: function(param){
            if(param){
                this.config.param = util.extend(param, this.config.param);
            }
            return this;
        }
    });
    exports.peopleBiddingx = PeopleBiddingx;

    var SpotSection = app.extend(app.Module, {
        init: function(config){
            var self = this;
            config = $.extend(true, {
                layout: {
                    module: 'form.section',
                    config: {
                        'title': '广告分组',
                        'container':{
                            'class': 'P-campaignSpotSection'
                        }
                    }
                },
                module: grid.spotGroup,
                max_list: 10,
                buttons: [
                    // '<button class="btnBigGray addonBtn" data-action="addonWhite">附加白名单</button>',
                    '<button class="btnBigGray" data-action="import">导入公用分组</button>',
                    '<button class="btnBigGray" data-action="add">新建分组</button>'
                ],
                WhiteBlackType: 1,
                excludes: ['AdxId'],
                list: {
                    'default_sort': false
                },
                operation: {
                    width: 100,
                    html: [
                        '<a href="#" data-op="edit">'+LANG("编辑")+'</a>',
                        '<a href="#" data-op="remove">'+LANG("删除")+'</a>'
                    ].join(' | '),
                    render: self.renderOperation
                }
            }, config);

            self.$config = config;
            self.$ready = 0;
            self.build();
        },
        build: function(){
            var self = this;
            if (self.$ready){ return self; }
            self.$ready = 1;

            var c = self.$config.layout;
            self.$layout = self.createAsync(
                'layout', c.module,
                c.config, 'afterBuildLayout'
            );
        },
        afterBuildLayout: function(layout){
            var con = layout.getContainer();
            var self = this;
            var c = self.$config;
            self.$ready = 2;
            if (c.buttons){
                con.append(c.buttons.join(''));
            }
            // self.$addonWhiteBtn = con.find('button.addonBtn');
            self.create('grid', c.module, {
                target: con,
                exclude_cols: c.excludes,
                auto_load: false,
                hasSearch: false,
                hasPager: false,
                list: c.list,
                url: '',
                operation: c.operation
            });

            // 创建完成, 初始化模块
            if (self.$value){
                self.setValue(self.$value);
            }

            self.dg(con, 'button[data-action]', 'click', self.eventButtonClick);
        },
        buildEditForm: function(){
            var self = this;
            var form = this.get('groupForm');
            if (!form){
                form = this.create('groupForm', spotFilter.popupForm, {
                    'WhiteBlackType': self.$config.WhiteBlackType
                });
            }
            return form;
        },
        buildViewForm: function(){
            var form = this.get('viewForm');
            if (!form){
                form = this.create('viewForm', spotFilter.viewForm);
            }
            return form;
        },
        renderOperation: function(idx, val, row){
            var ops = ['<a href="#" data-op="remove">删除</a>'];
            if (row.PositionIds){
                ops.unshift('<a href="#" data-op="view">查看</a>');
            }
            return ops.join(' | ');
        },
        setValue: function(value){
            var self = this;
            self.$value = value;
            if (self.$ready == 2){
                self.$.grid.setData(value);
            }
        },
        getValue: function(){
            return (this.$value ? this.$value.slice() : []);
        },
        eventButtonClick: function(evt, elm){
            var self = this;
            switch ($(elm).attr('data-action')){
                case 'import':
                    self.importGroup();
                    break;
                case 'add':
                    self.createGroup();
                    break;
            }
            return false;
        },
        onListOpClick: function(ev){
            var self = this, param = ev.param;
            if (ev.source === self.$.grid){
                switch (param.op){
                    case 'edit':
                        self.editGroup(param.index);
                        break;
                    case 'remove':
                        self.removeGroup(param.index);
                        break;
                    case 'view':
                        self.viewGroup(param.index);
                        break;
                }
            }
            return false;
        },
        // 删除广告位分组
        removeGroup: function(index){
            var self = this;
            var list = self.$value;
            app.confirm(LANG('要删除广告位分组: %1 吗?', list[index].Name || LANG('默认分组')), function(isOk){
                if(isOk){
                    list.splice(index, 1);
                    self.setValue(list);
                }
            });
            return self;
        },
        // 创建广告位分组
        createGroup: function(){
            var self = this;
            var list = self.$value;
            if (list.length >= self.$config.max_list){
                app.notify(LANG('已达到列表的最大数量'));
                return self;
            }else {
                var form = self.buildEditForm();
                form.reset().setParam({
                    channel: self.$channel,
                    index: -1
                }).setValue({}).hideSync().setWhiteBlackType().show();
            }
        },
        // 编辑广告位分组
        editGroup: function(index){
            var self = this;
            var data = self.$value[index];
            var form = self.buildEditForm();
            form.reset().setParam({
                channel: self.$channel,
                index: index
            }).setValue(data).setWhiteBlackType().show();
            return self;
        },
        // 编辑广告位分组保存
        onSpotDone: function(ev){
            var pop = ev.from;
            var data = ev.param;
            var empty = true;
            util.each(data, function(val){
                if (util.isArray(val) && val.length){
                    empty = false;
                }
            });
            data.Name = util.trim(data.Name);
            var err = [];
            if (!data.Name){
                err.push(LANG('分组名称不能为空'));
            }
            var re = /黑名单/ig;
            if(re.test(data.Name) && data.WhiteBlackType == 1){
                err.push(LANG('分组名称带有"黑名单"，请修改。当前分组类型为白名单'));
            }
            var re2 = /白名单/ig;
            if(re2.test(data.Name) && data.WhiteBlackType == 2){
                err.push(LANG('分组名称带有"白名单"，请修改。当前分组类型为黑名单'));
            }
            if (empty){
                err.push('请选择一个分组过滤条件');
            }
            if (err.length){
                app.notify(err.join('、'), LANG('分组资料存在问题'));
            }else {
                var param = pop.getParam();
                var list = this.$value;
                var grid = this.$.grid;
                if (param.index < 0){
                    list.push(data);
                }else {
                    var item = list[param.index] || {};
                    util.each(data, function(val, key){
                        //if (val && val.length){
                        item[key] = val;
                        // }else {
                        // 	delete item[key];
                        // }
                    });
                    //delete item.Id;
                    list[param.index] = item;
                }
                grid.setData(list);
                pop.hide();
            }
            return false;
        },
        // 查看附加广告位分组
        viewGroup: function(index){
            var self = this;
            var data = self.$value[index];
            var form = self.buildViewForm();
            form.reset().setParam({
                channel: self.$channel,
                index: index
            }).setValue(data).show();
            return self;
        },
        // 保存广告位信息
        onListDone: function(ev){
            var pop = ev.from;
            var param = pop.getParam();
            var list = this.$value;
            var grid = this.$.grid;
            var data = ev.param;

            if (data && data.PositionIds && data.PositionIds.length){
                list[param.index] = data;
            }else {
                list.splice(param.index, 1);
            }
            grid.setData(list);
            pop.hide();
            return false;
        },
        // 导入广告位分组
        importGroup: function(){
            var self = this;
            var dlg = self.get('importDlg');
            if (!dlg){
                dlg = self.create('importDlg', popwin.spotGroupDlg);
            }
            dlg.setParam({
                AdxId: self.$channel
                ,WhiteBlackType: self.$config.WhiteBlackType
            }).load().show();

            return false;
        },
        onImportGroup: function(ev){
            var self = this;
            var grid = self.$.grid,
                list = self.$value,
                max = self.$config.max_list;
            util.each(ev.param, function(item){
                if (list.length >= max){
                    app.notify(LANG('已达到列表的最大数量!'));
                    return false;
                }
                var group = item.Spots;
                if (group && util.index(list, item.Id, 'Id') === null){
                    group.Name = item.Name;
                    group.Id = item.Id;
                    list.push(group);
                }
            });

            grid.setData(list);
            return false;
        },
        updateChannel: function(cid){
            this.$channel = cid;
            var cols;
            switch (true){
                case util.exist(app.config('exchange_group/tanx'), cid):
                case util.exist(app.config('exchange_group/baidu'), cid):
                case util.exist(app.config('exchange_group/yigao'), cid):
                    // Tanx, 百度, 亿告渠道分类
                    cols = ['Name', 'SiteClass', 'Domain', 'Size', 'PositionIds', 'Remark'];
                    break;
                case util.exist(app.config('exchange_group/google'), cid):
                    // double_click有分类，没有域名 (暂时没有分类)
                    cols = ['Name', /*'SiteClass', */'Size', 'PositionIds', 'Remark'];
                    break;
                case util.exist(app.config('exchange_group/youku'), cid):
                    // 优酷没有域名和网站分类
                    cols = ['Name', 'PageClass', 'Size', 'PositionIds', 'Remark'];
                    break;
                default:
                    cols = ['Name', 'Size', 'PositionIds', 'Remark']
                    break;
            }
            this.$.grid.showColumn(cols);
            return this;
        },
        show: function(){
            this.$.layout.show();
            return this;
        },
        hide: function(){
            this.$.layout.hide();
            return this;
        }
    })

    // RTB广告位模块
    var SpotForm = app.extend(view.container, {
        init: function(config, parent){
            var self = this;
            config = $.extend({
                'class': 'P-campaignSpot',
                'target': parent,
                'max_list': 5
            }, config);
            SpotForm.master(self, null, config);
            SpotForm.master(self, 'init', arguments);

            self.$batchData = {};
            self.$cache = {};
            self.$channel = 0;
            self.$importType = null;
            self.$ready = false;
            self.$data = {
                white:[],
                black:[],
                price:[]
            };
            self.$addon = {};
            self.$campaignPrice = 0;
            var exchanges = app.config('exchanges');
            // 资质
            var check = self.$aptitudes = {};
            util.each(exchanges, function(item){
                check[item.id] = !item.needAptitudes;
            });
            // 行业分类
            check = self.$categories = {};
            util.each(exchanges, function(item){
                check[item.id] = !item.needCategories;
            });
            self.build();
        },
        build: function(){
            var self = this;
            if (self.$ready){ return self; }
            self.$ready = true;

            var el = self.el;
            var c = self.config;
            // 创建批量tab
            this.create('batchTab', tab.batchTab, {
                'target': el
            })[c.batch ? 'show' : 'hide']();
            var tabBody = c.batch ? this.$.batchTab.getContainer() : el;


            // 创建Section
            var section = self.create('channelSection', form.section, {
                'target': tabBody,
                'title': LANG('渠道'),
                'container':{
                    'class': 'P-campaignRTBInfoBase'
                }
            });
            var con = section.getContainer();



            // RTB渠道选择
            var items = [];

            if(c.rtbType === 'MT'){
                // 移动端的渠道默认是优酷
                DEFAULT_ADXID = 10008;
                util.each(app.config('exchanges'), function(ex){
                    if (ex.hasMoblieClient){
                        items.push(ex);
                    }
                });
            }else {
                // PC端渠道
                util.each(app.config('exchanges'), function(ex){
                    if (!ex.noPC){
                        items.push(ex);
                    }
                });
            }


            // 编辑时的渠道名称
            this.$channelName = $('<div class="P-campaignSpotChannelName" />').hide();

            // 广告渠道
            var options = [];
            util.each(items, function(ex){
                options.push({
                    'id': ex.id,
                    'text': LANG(ex.name)
                });
            });
            var channelCon = $('<div class="P-campaignSpotChannelCon">');
            this.create('channelCon', form.radio, {
                'label': LANG('广告渠道：'),
                'content': channelCon,
                'tips': LANG('即不同的AD-Exchange。'),
                'option': [],
                'afterHtml': this.$channelName,
                'target': con
            });
            this.create('channel', form.radio, {
                'label': null,
                'option': options,
                'value': 0, // 默认选中第一个
                'changeEvent': true,
                'autoChange': false,
                'eventWithoutChange': true,
                'setDataType': 'prop',
                'target': channelCon
            });

            // 用户数据
            var userData = app.getUser();
            // 判断资质是否存在
            var aptitudes = userData.campany.Aptitudes;
            util.each(aptitudes, function(val, i){
                if(val['AdxId'] && val['Aptitude']){
                    self.$aptitudes[val['AdxId']] = true;
                    // 当前客户资质对应的渠道在审核中时，添加活动的时候不能选择该渠道，需要等通过后才生效
                    if( val['Status'] && val['Status'] == -2){
                        self.$aptitudes[val['AdxId']] = 'verifying';
                    }
                }
            });
            // 判断行业分类是否存在
            var categories = userData.campany.AdvertiserCategories;
            util.each(categories, function(val, i){
                if(val['AdxId'] && val['Category']){
                    self.$categories[val['AdxId']] = true;
                }
            });

            // 初始化默认时显示缺少资质的提示
            this.$aptitudesTips = $('<div class="tips"/>').css({
                'color':'#CE4040',
                'margin-left': '80px'
            }).appendTo(con).hide();

            // 更新提示渠道提示状态
            self.checkChannel(DEFAULT_ADXID);


            // 广告类别
            this.create('adClass', form.subDropdown, {
                'target': con,
                'option_height': 400,
                'width': 300,
                'label': LANG('广告类别：'),
                'url': BASE('data/tanx_adv.json'),
                'def': LANG('选择分类')
            }).hide();

            // 敏感分类
            this.create('sensitiveClass', form.dropdown, {
                'target': con,
                'auto_load': false,
                'option_height': 400,
                'width': 300,
                'label': LANG('敏感分类：'),
                'url': '/rest/listadcategory',
                'key': 'CategoryId',
                'all': {Name: LANG('无')}
            }).hide();

            // 易传媒敏感分类
            this.create('yichuanmeiSensitiveClass', form.subDropdown, {
                'label': LANG('敏感分类：'),
                'target': con,
                'option_height': 400,
                'width': 300,
                'url': '/rest/listadcategory',
                'def': LANG('选择敏感分类'),
                'all': {Name: '无'},
                'param': {
                    'type': 2,
                    'adxId': app.config('exchange_group/yi/0')
                },
                'skey': 'ChildData',
                'key': 'CategoryId',
                'name': 'Name'
            }).hide();

            // 行业分类
            // --后端未提供接口，暂遗弃。@Jing 20140218
            /*this.create('tradeClass', form.subDropdown, {
             'target': con,
             'option_height': 400,
             'label': LANG('行业分类：'),
             'url': '/sweety/listadvertisercategory',
             'param': {'getLayer' : 1},
             'def': LANG('选择行业分类'),
             'render':this.renderCategories,
             'auto_load': false
             }).hide();*/
            // 百度行业分类
            this.create('baiduClass', form.subDropdown, {
                'target': con,
                'option_height': 400,
                'width': 300,
                'label': LANG('行业分类：'),
                'url': BASE('data/baidu_cat.json'),
                'param': {'getLayer' : 1},
                'def': LANG('选择行业分类'),
                'render':this.renderCategories
                // 'auto_load': false
            });
            // 腾讯行业分类
            this.create('tencentClass', form.dropdown, {
                'target': con,
                'option_height': 400,
                'width': 300,
                'label': LANG('行业分类：'),
                'options': app.config('TencentClass'),
                'def': LANG('选择行业分类')
            });
            // MOGO行业分类
            this.create('mogoClass', form.dropdown, {
                'target': con,
                'option_height': 400,
                'width': 300,
                'label': LANG('行业分类：'),
                'options': app.config('TencentClass'),
                'def': LANG('选择行业分类')
            });
            // 木瓜移动AppFLOOD行业分类
            this.create('appFloodClass', form.subDropdown, {
                'target': con,
                'option_height': 400,
                'width': 300,
                'label': LANG('行业分类：'),
                'url': BASE('data/appFlood_cat.json'),
                'param': {'getLayer' : 1},
                'def': LANG('选择行业分类'),
                'render':this.renderCategories
                // 'auto_load': false
            });
            // 万流客行业分类
            this.create('valueMakerClass', form.subDropdown, {
                'target': con,
                'option_height': 400,
                'width': 300,
                'label': LANG('行业分类：'),
                'url': BASE('data/valueMaker_cat.json'),
                'param': {'getLayer' : 1},
                'def': LANG('选择行业分类'),
                'render':this.renderCategories
                // 'auto_load': false
            });
            // 互众行业分类
            this.create('huzhongClass', form.subDropdown, {
                'target': con,
                'option_height': 400,
                'width': 300,
                'label': LANG('行业分类：'),
                'url': BASE('data/huzhong_cat.json'),
                'param': {'getLayer' : 1},
                'def': LANG('选择行业分类'),
                'render':this.renderCategories
                // 'auto_load': false
            });
            // 传漾行业分类
            this.create('chuanyangClass', form.subDropdown, {
                'target': con,
                'option_height': 400,
                'width': 300,
                'label': LANG('行业分类：'),
                'url': BASE('data/chuanyang_cat.json'),
                'param': {'getLayer' : 1},
                'def': LANG('选择行业分类'),
                'render':this.renderCategories
                // 'auto_load': false
            });
            // 海云行业分类
            this.create('haiyunClass', form.dropdown, {
                'target': con,
                'option_height': 400,
                'width': 300,
                'label': LANG('行业分类：'),
                'url': BASE('data/haiyun_cat.json'),
                'def': LANG('选择行业分类')
            });
            // 聚效移动行业分类
            this.create('juxiaoClass', form.subDropdown, {
                'target': con,
                'option_height': 400,
                'width': 300,
                'label': LANG('行业分类：'),
                'url': BASE('data/juxiao_cat.json'),
                'param': {'getLayer' : 1},
                'def': LANG('选择行业分类'),
                'render':this.renderCategories
                // 'auto_load': false
            });
            // 地幔行业分类
            this.create('dmClass', form.dropdown, {
                'target': con,
                'option_height': 400,
                'width': 300,
                'label': LANG('行业分类：'),
                //'options': app.config('TencentClass'),
                'url': BASE('data/dm_cat.json'),
                'def': LANG('选择行业分类')
            });
            // 搜狐行业分类
            this.create('sohuClass', form.dropdown, {
                'target': con,
                'option_height': 400,
                'width': 300,
                'label': LANG('行业分类：'),
                'options': app.config('SohuClass'),
                'def': LANG('选择行业分类')
            });
            // 讯飞移动行业分类
            this.create('xunfeiClass', form.dropdown, {
                'target': con,
                'option_height': 400,
                'width': 300,
                'label': LANG('行业分类：'),
                //'options': app.config('TencentClass'),
                'url': BASE('data/xunfei_cat.json'),
                'def': LANG('选择行业分类')
            });
            // 新浪微博移动行业分类
            this.create('weiboClass', form.subDropdown, {
                'target': con,
                'option_height': 400,
                'width': 300,
                'label': LANG('行业分类：'),
                'url': BASE('data/weibo_cat.json'),
                'param': {'getLayer' : 1},
                'def': LANG('选择行业分类'),
                'name': 'text',
                'key': 'id',
                'skey': 'subs',
                'render':this.renderCategories
            });

            // PMP订单-优酷媒体分类
            this.create('website', form.website, {
                'target': con,
                'auto_load': false
            }).setParam({
                'AdxId': 10008
            }).load();

            // 订单管理
            self.create('dealInfo', spotFilter.dealInfo, {
                'target': con,
                'bidType': c.bidType
            })[c.bidType ? 'show' : 'hide']();

            // 黑白名单
            self.create('white', SpotSection, {
                layout: {
                    config: {
                        'target': tabBody,
                        'title': '白名单',
                        'desc': LANG('活动只投放白名单下的广告位，可以同时设置10个分组。')
                    }
                },
                'WhiteBlackType':1
            })[c.bidType ? 'hide' : 'show']();
            self.create('black', SpotSection, {
                layout: {
                    config: {
                        'target': tabBody,
                        'title': '黑名单',
                        'desc': LANG('活动不投放黑名单下的广告位，可以同时设置10个分组。')
                    }
                },
                'WhiteBlackType':2
            })[c.bidType ? 'hide' : 'show']();
            self.create('addon', SpotSection, {
                layout: {
                    config: {
                        'target': tabBody,
                        'class': 'P-campaignSpotSection2',
                        'title': '特殊条件',
                        'desc': LANG('特殊条件是在活动报表subgrid中禁用与开启广告位过程中创建的。分启用和禁用类型，投放优先于黑白名单，并且依创建方式与顺序得出以下优先级。'),
                        'addon':[
                            '<button class="btn primary" data-act-name="importAddon">导入</button>',
                            '<button class="btn primary" data-act-name="exportAddon">导出</button>'
                        ].join('')
                    }
                },
                'module': grid.spotAddon,
                'operation': {
                    'html': null
                },
                'buttons': null
            })[c.bidType ? 'hide' : 'show']();

            section = self.create('priceSection', form.section, {
                'target': tabBody,
                'class': 'P-campaignSpotSection2',
                'title': LANG('单独出价广告位'),
                'desc': LANG('可以导入或导出单独出价的广告位出价设置，该项为非必填项。'),
                'addon':[
                    '<button class="btn danger" data-act-name="emptyPrice">删除所有</button>',
                    '<button class="btn primary" data-act-name="importPrice">导入</button>',
                    '<button class="btn primary" data-act-name="exportPrice">导出</button>'
                ].join('')
            })[c.bidType ? 'hide' : 'show']();
            con = section.getContainer();
            self.create('priceGrid', grid.base, {
                target: con,
                cols: [
                    {type: 'id'},
                    {name: 'Spot', type:'index', text:LANG('广告位名称'), render:'renderSpot'},
                    {name: 'Domain', type:'index', text:LANG('媒体域名')},
                    {name: 'Size', type:'index', text:LANG('尺寸')},
                    {name: 'Sum', text:LANG('出价'), render:'renderPriceSum', width:80, field:'Stake'},
                    {name: 'Stake', text:LANG('溢价'), format:'currency', render:'renderPriceEdit', width:100}
                ],
                operation: {
                    width: 60,
                    html: '<a href="#" data-op="remove">'+LANG("删除")+'</a>'
                },
                list: {
                    scroll_type: 'row',
                    scroll_size: 10
                },
                auto_load: false,
                hasSearch: false,
                hasExport: false,
                hasTab: false,
                hasAmount: false,
                hasPager: false
            });

            // 绑定事件
            this.dg(tabBody, 'button[data-act-name]', 'click', self.eventButtonClick);
            this.dg(con, '.P-campaignSpotPriceEdit', 'blur', self.eventPriceChange);

            var retainPriceSection = self.create('retainPriceSection', form.section, {
                'target': tabBody,
                'title': LANG(''),
                'class': 'M-formSection P-campaignSpotSection3'
            })[c.bidType ? 'hide' : 'show']();

            // 是否保留自动优化的广告位出价
            self.create('retainPrice', form.radio, {
                'target': retainPriceSection.getContainer(),
                'class': 'retainPrice',
                'label': LANG('自动优化的广告位出价：'),
                'option': [
                    {text:LANG("保留"), value:0},
                    {text:LANG("删除"), value:1}
                ],
                'value': 0
            })[c.bidType ? 'hide' : 'show']();

        },
        // 行业分类渲染函数
        renderCategories: function(sels, dom){
            var html = [];
            for(var i in sels){
                html.push(sels[i].text);
            }
            return html.join('-');
        },
        renderSpot: function(idx, val, row){
            if (!val){
                if (row.DomainId || row.SizeId){
                    return LANG('通过“媒体域名+尺寸”改价的广告位');
                }else {
                    return LANG('未知广告位');
                }
            }
            return val;
        },
        renderPriceEdit: function(idx, val, row){
            return '￥<input type="text" class="P-campaignSpotPriceEdit" data-idx="'+idx+'" value="'+val+'"/>';
        },
        renderPriceSum: function(idx, val, row){
            val = this.$campaignPrice + (val || 0);
            return require('grid/labels').format.currency(val);
        },
        eventButtonClick: function(evt, elm){
            var self = this;
            switch ($(elm).attr('data-act-name')){
                case 'emptyPrice':
                    self.emptyPrice();
                    break;
                case 'importPrice':
                    self.importPrice();
                    break;
                case 'exportPrice':
                    self.exportPrice();
                    break;
                case 'importAddon':
                    self.importAddon();
                    break;
                case 'exportAddon':
                    self.exportAddon();
                    break;
            }
        },
        eventPriceChange: function(evt, elm){
            var self = this;
            var idx  = $(elm).attr('data-idx');
            var data = self.$data.price[idx];
            var val  = +elm.value;
            if (data){
                if(isNaN(val)){
                    app.notify('价格格式错误, 必须是一个数字');
                }else {
                    // 价格和记录有效, 更新数据
                    data.Stake = val;
                    // app.notify('价格修改成功');
                    var grid = this.get('priceGrid');
                    if (grid){
                        grid.updateColumnByName('Sum');
                    }
                }
                elm.value = util.round0(data.Stake, 2);
            }
        },
        updateCampaignPrice: function(price){
            this.$campaignPrice = price || 0;
            var grid = this.get('priceGrid');
            if (grid){
                grid.updateColumnByName('Sum');
            }
            return this;
        },
        onBatchTabChange: function(ev){
            var batchData = this.$batchData;
            var tab = ev.param.tab;

            if(this.$.batchTab){
                var lastData = this.$.batchTab.getLast();
                batchData[lastData.tab] = this.getData();
            }

            if(batchData[tab]){
                this.setData(batchData[tab]);
            }else{
                this.reset();
            }
            return false;
        },
        onBatchTabCancel: function(ev){
            var tab = ev.param.tab;
            delete this.$batchData[tab];
            return false;
        },
        // 用户切换广告渠道
        onRadioChange: function(ev){
            var self = this;
            var cid = ev.param.id;
            // 当前编辑状态不允许切换渠道
            if (self.$data.campaign_id > 0 && !self.$data.IsDraft){
                return false;
            }

            // 更新提示渠道提示状态
            self.checkChannel(cid);

            var data = self.getData();
            if (self.$channel){
                data.channel = self.$channel;
                self.$cache[self.$channel] = $.extend({}, data);
            }
            data = self.$cache[cid] || {
                    'channel': cid,
                    'price': data.price
                };
            // 不知为什么这个要setData(),有问题先关闭
            self.setData(data);

            if(this.$.batchTab){
                this.$.batchTab.getActive({
                    'text': ev.param.text,
                    'id': ev.param.id
                });
            }

            self.fire('changeRtbChannel', ev.param);
            return false;
        },
        // 渠道提示
        checkChannel: function(channel_id, text){
            var self = this;
            var tips = self.$aptitudesTips;
            var text_tmp = text || self.$.channel.getData(true).text || '';

            // 缺少资质的提示
            var errors = [];
            if(!self.$aptitudes[channel_id] ){
                errors.push(LANG('当前帐号暂没有设置 %1 资质，请联系管理员。', text_tmp));
            }
            // 正在审核中的，不能使用渠道
            if(self.$aptitudes[channel_id] == 'verifying'){
                errors.push(LANG('当前帐号 %1 资质正在审核中，暂不能使用，请联系管理员。', text_tmp));
            }
            // 缺少行业分类提示
            if(!self.$categories[channel_id]){
                errors.push(LANG('当前帐号暂没有设置 %1 行业分类，请联系管理员。', text_tmp));
            }
            if (errors.length){
                tips.html(errors.join('<br>')).show();
            }else {
                tips.hide();
            }
            return self;
        },
        onListOpClick: function(ev){
            var self = this;
            if (ev.source === self.$.priceGrid){
                app.confirm(LANG('删除当前的出价吗?'), function(res){
                    if (res){
                        var data = self.$data.price;
                        data.splice(ev.param.index, 1);
                        self.$.priceGrid.setData(data);
                    }
                })
                return false;
            }
        },
        updateChannel: function(exchange_id){
            var self = this;
            var cs = self.$;

            // 更新模块渠道ID
            self.$channel = exchange_id;

            // 更新渠道分类显示状态
            cs.adClass.hide();
            cs.mogoClass.hide();
            cs.appFloodClass.hide();
            cs.baiduClass.hide();
            cs.tencentClass.hide();
            cs.sensitiveClass.hide();
            cs.yichuanmeiSensitiveClass.hide();
            cs.valueMakerClass.hide();
            cs.huzhongClass.hide();
            cs.chuanyangClass.hide();
            cs.haiyunClass.hide();
            cs.juxiaoClass.hide();
            cs.dmClass.hide();
            cs.sohuClass.hide();
            cs.xunfeiClass.hide();
            cs.weiboClass.hide();
            cs.website.hide();
            // // --后端未提供接口，暂遗弃。@Jing 20140218
            // cs.tradeClass.show();

            switch(true){
                case util.exist(app.config('exchange_group/tanx'), exchange_id):
                    cs.adClass.show();
                    cs.sensitiveClass.load({
                        'type': 2,
                        'adxId': app.config('exchange_group/tanx/0')
                    });
                    cs.sensitiveClass.show();
                    break;

                case util.exist(app.config('exchange_group/yigao'), exchange_id):
                    cs.sensitiveClass.load({
                        'type': 2,
                        'adxId': app.config('exchange_group/yigao/0')
                    });
                    cs.sensitiveClass.show();
                    break;
                case util.exist(app.config('exchange_group/baidu_ad'), exchange_id):
                    cs.baiduClass.show();
                    break;

                case util.exist(app.config('exchange_group/yi'), exchange_id):
                    cs.yichuanmeiSensitiveClass.show();
                    break;

                case util.exist(app.config('exchange_group/tencent'), exchange_id):
                    cs.tencentClass.hide();
                    break;

                case util.exist(app.config('exchange_group/mongo'), exchange_id):
                    cs.mogoClass.show();
                    break;

                case util.exist(app.config('exchange_group/appFlood'), exchange_id):
                    cs.appFloodClass.show();
                    break;

                case util.exist(app.config('exchange_group/valueMaker'), exchange_id):
                    cs.valueMakerClass.show();
                    break;

                case util.exist(app.config('exchange_group/huzhong'), exchange_id):
                    cs.huzhongClass.show();
                    break;

                case util.exist(app.config('exchange_group/chuanyang'), exchange_id):
                    cs.chuanyangClass.show();
                    break;

                case util.exist(app.config('exchange_group/haiyun'), exchange_id):
                    cs.haiyunClass.show();
                    break;

                case util.exist(app.config('exchange_group/juxiao'), exchange_id):
                    cs.juxiaoClass.show();
                    break;

                case util.exist(app.config('exchange_group/dm'), exchange_id):
                    cs.dmClass.show();
                    break;

                case util.exist(app.config('exchange_group/sohu'), exchange_id):
                    cs.sohuClass.hide();
                    break;

                case util.exist(app.config('exchange_group/xunfei'), exchange_id):
                    cs.xunfeiClass.show();
                    break;

                case util.exist(app.config('exchange_group/weibo'), exchange_id):
                    cs.weiboClass.show();
                    break;

                case util.exist(app.config('exchange_group/youkuMoblie'), exchange_id):
                case util.exist(app.config('exchange_group/yingji'), exchange_id):
                    if(self.config.bidType){
                        cs.website.show();
                    }
                    break;
            }

            // 更新黑白名单字段
            cs.white.updateChannel(exchange_id);
            cs.black.updateChannel(exchange_id);

            // 订单管理
            cs.dealInfo.updateChannel(exchange_id);

            return self;
        },
        setData: function(data){
            var self = this;
            var d = self.$data;
            var cs = self.$;

            if (!data){
                data = {};
            }

            // 更新渠道选择
            var cid = data.channel || DEFAULT_ADXID;
            self.updateChannel(cid);
            // Radio模块支持直接设置id
            cs.channel.setData(cid);
            var chn = cs.channel.getData(true);
            if (data.campaign_id > 0 && !data.IsDraft){
                self.$channelName.show().text(chn.text);
                self.$.channel.el.parent().hide();
                self.$.channelCon.el.find('.M-commonTips').hide();
            }else {
                self.$.channel.el.parent().show();
                self.$.channelCon.el.find('.M-commonTips').show();
                self.$channelName.hide();
            }
            d.campaign_id = data.campaign_id;
            d.channel = cid;
            d.IsDraft = data.IsDraft;

            // 展示数据的时候也显示缺少资质提示
            self.checkChannel(cid, chn.text || '');


            // 活动敏感分类
            var mod = cs.sensitiveClass;
            if (util.exist(app.config('exchange_group/yi'), cid)){
                mod = cs.yichuanmeiSensitiveClass;
            }
            var storage_sensitive = app.storage('campaign_last_category_'+app.getUserId()+'_'+cid);
            if(storage_sensitive){
                if(storage_sensitive.indexOf(',') != -1){
                    storage_sensitive = storage_sensitive.split(',');
                }else{
                    storage_sensitive = +storage_sensitive;
                }
            }
            mod.setData(data.sensitive || storage_sensitive);

            // 活动广告分类
            // tanx广告分类，百度、腾讯、芒果、木瓜移动、万流客行业分类 都共用同一字段(AdCategory)
            var storage_adClasss = app.storage('campaign_last_ad_class_'+app.getUserId()+'_'+cid);
            if(storage_adClasss){
                if(storage_adClasss.indexOf(',') != -1){
                    storage_adClasss = storage_adClasss.split(',');
                }else{
                    storage_adClasss = +storage_adClasss;
                }
            }
            var adClass = data.adclass || storage_adClasss;
            switch(true){
                case util.exist(app.config('exchange_group/tanx'), cid):
                    cs.adClass.setData([String(adClass).substr(0,3), adClass]);
                    break;
                case util.exist(app.config('exchange_group/baidu_ad'), cid):
                    cs.baiduClass.setData([String(adClass).substr(0,2), adClass]);
                    break;
                case util.exist(app.config('exchange_group/tencent'), cid):
                    cs.tencentClass.setData(adClass);
                    break;
                case util.exist(app.config('exchange_group/mongo'), cid):
                    cs.mogoClass.setData(adClass);
                    break;
                case util.exist(app.config('exchange_group/appFlood'), cid):
                    // 为了处理没有下级的情况
                    if( (Math.floor(adClass/100)) === 0){
                        cs.appFloodClass.setData([adClass]);
                    }else{
                        cs.appFloodClass.setData([Math.floor(adClass/100), adClass]);
                    }
                    break;
                case util.exist(app.config('exchange_group/valueMaker'), cid):
                    cs.valueMakerClass.setData([String(adClass).substr(0,2), adClass]);
                    break;
                case util.exist(app.config('exchange_group/huzhong'), cid):
                    cs.huzhongClass.setData([String(adClass).substr(0,2), adClass]);
                    break;
                case util.exist(app.config('exchange_group/chuanyang'), cid):
                    cs.chuanyangClass.setData([String(adClass).substr(0,3), adClass]);
                    break;
                case util.exist(app.config('exchange_group/haiyun'), cid):
                    cs.haiyunClass.setData(adClass);
                    break;
                case util.exist(app.config('exchange_group/juxiao'), cid):
                    cs.juxiaoClass.setData(adClass);
                    break;
                case util.exist(app.config('exchange_group/dm'), cid):
                    cs.dmClass.setData(adClass);
                    break;
                case util.exist(app.config('exchange_group/sohu'), cid):
                    cs.sohuClass.setData(adClass);
                    break;
                case util.exist(app.config('exchange_group/xunfei'), cid):
                    cs.xunfeiClass.setData(adClass);
                    break;
                case util.exist(app.config('exchange_group/weibo'), cid):
                    cs.weiboClass.setData(adClass);
                    break;
            }

            // 更新广告位分组和调价
            d.white = data.white || [];
            d.black = data.black || [];
            d.addon = data.addon || [];
            d.price = data.price || [];
            d.retainPrice = 0; // 默认都为保留出价

            cs.white.setValue(d.white);
            cs.black.setValue(d.black);
            cs.addon.setValue(d.addon);
            cs.priceGrid.setData(d.price);
            cs.dealInfo.setData({
                'result': data.SelectDeals || [],
                'filterType': data.SelectDealsValue
            });
            cs.website.setData(data.DealFilter && data.DealFilter.PageClass || []);

            // 更新自动优化出价设置
            cs.retainPrice.setData(d.retainPrice);
            return self;
        },
        getData: function(){
            var data = this.$data;
            var cs = this.$;
            var channel = data.channel || 0;
            //var channel = cs.channel.getData(true);
            //channel = (channel && channel.id) || 0;

            // 行业分类
            var adClass = 0;
            switch (true){
                case util.exist(app.config('exchange_group/baidu_ad'), channel):
                    // 没值的时候返回的是null
                    // getData不加参数true，多次获取后返回的数组内容会减少，如第一次得到[52,5202]，第二次变成[52]，第三次变成[]，所以到最后不能设置百度分类；
                    // 加true保证能获取第一层和第二层完整数据[object,object];
                    var baiduData = cs.baiduClass.getData(true);
                    adClass = baiduData && baiduData.pop().id || 0;
                    break;
                case util.exist(app.config('exchange_group/tanx'), channel):
                    var tanxData = cs.adClass.getData(true);
                    adClass = tanxData && tanxData.pop().id || 0;
                    break;
                case util.exist(app.config('exchange_group/tencent'), channel):
                    adClass = cs.tencentClass.getData();
                    break;
                case util.exist(app.config('exchange_group/mongo'), channel):
                    adClass = cs.mogoClass.getData();
                    break;
                case util.exist(app.config('exchange_group/appFlood'), channel):
                    var appFloodData = cs.appFloodClass.getData(true);
                    adClass = appFloodData && (+appFloodData.pop().id) || 0;
                    break;
                case util.exist(app.config('exchange_group/valueMaker'), channel):
                    var valueMakerData = cs.valueMakerClass.getData(true);
                    adClass = valueMakerData && valueMakerData.pop().id || 0;
                    break;
                case util.exist(app.config('exchange_group/huzhong'), channel):
                    var huzhongData = cs.huzhongClass.getData(true);
                    adClass = huzhongData && huzhongData.pop().id || 0;
                    break;
                case util.exist(app.config('exchange_group/chuanyang'), channel):
                    var chuanyangData = cs.chuanyangClass.getData(true);
                    adClass = chuanyangData && chuanyangData.pop().id || 0;
                    break;
                case util.exist(app.config('exchange_group/haiyun'), channel):
                    adClass = cs.haiyunClass.getData();
                    break;
                case util.exist(app.config('exchange_group/juxiao'), channel):
                    adClass = cs.juxiaoClass.getData();
                    break;
                case util.exist(app.config('exchange_group/dm'), channel):
                    adClass = cs.dmClass.getData();
                    break;
                case util.exist(app.config('exchange_group/sohu'), channel):
                    adClass = cs.sohuClass.getData();
                    break;
                case util.exist(app.config('exchange_group/xunfei'), channel):
                    adClass = cs.xunfeiClass.getData();
                    break;
                case util.exist(app.config('exchange_group/weibo'), channel):
                    adClass = cs.weiboClass.getData();
                    break;
            }

            // 敏感分类
            var sensitive;
            if (util.exist(app.config('exchange_group/yi'), channel)){
                sensitive = cs.yichuanmeiSensitiveClass.getData();
            }else {
                sensitive = cs.sensitiveClass.getData();
            }

            var dealInfoData = cs.dealInfo.getData();

            var result = {
                price: data.price.slice(),
                black: cs.black.getValue(),
                white: cs.white.getValue(),
                addon: cs.addon.getValue(),
                channel: channel,
                adclass: adClass,
                sensitive: sensitive,
                retainPrice: +cs.retainPrice.getData(), // 是否保留自动优化的广告位出价
                SelectDeals: dealInfoData.result,
                SelectDealsValue: dealInfoData.filterType,
                DealFilter: {
                    PageClass: cs.website.getData()
                }
            };

            return result;
        },
        getBatchData: function(){
            var batchData = this.$batchData;
            if(this.$.batchTab){
                var tab = this.$.batchTab.getActive().attr('data-tab');
                batchData[tab] = this.getData();
            }
            var result = [];
            util.each(batchData, function(item, idx){
                if(item){
                    result.push(item);
                }
            });
            return result;
        },
        reset: function(){
            this.$cache = {};
            if(this.config.rtbType === 'MT'){
                // 移动端的渠道默认是优酷
                DEFAULT_ADXID = 10008;
            }else{
                // PC端的渠道默认是秒针
                DEFAULT_ADXID = app.config('exchanges')[0].id;
            }
            return this.setData();
        },
        // 价格导出导入处理函数
        buildExportDialog: function(mode){
            var self = this;
            var win = self.get('priceDlg');
            if (!win){
                win = self.create('priceDlg', popwin.exportDlg, {'noProcess': true});
            }
            win.show();

            switch (mode){
                case 1:
                    win.toggleButton('ok').changeTitle(LANG('导出广告位出价'));
                    break;
                case 2:
                    win.toggleButton(['ok','cancel']).changeTitle(LANG('导入广告位出价'));
                    break;
                case 3:
                    win.toggleButton('ok').changeTitle(LANG('导出特殊条件'));
                    break;
                case 4:
                    win.toggleButton(['ok','cancel']).changeTitle(LANG('导入特殊条件'));
                    break;
            }
            return win;
        },
        exportAddon: function(){
            var win = this.buildExportDialog(3);
            win.setData(JSON.stringify(this.$.addon.getValue()));
            return this;
        },
        importAddon: function(){
            var win = this.buildExportDialog(4);
            win.setData('');
            this.$importType = 'addon';
            return this;
        },
        // 合并资料
        importAddonSave: function(data){
            var self = this, list = [],
                spot_black, spot_white,
                single_key = '', single_item,
                complex = {};
            var list_process = function(item){
                var type = self._getItemType(item);
                var isBlack = (item.Kind != 1);
                var items;
                if (type == 'Spot'){
                    items = isBlack ?
                        (spot_black || (spot_black = item)):
                        (spot_white || (spot_white = item));
                    items.PositionIds.push.apply(items.PositionIds, item.PositionIds);
                }else if (type){
                    if (type.length === 1){
                        type = type[0];
                        items = (isBlack ? 'black' : 'white') + type;
                        if (single_key == items){
                            // 存在记录, 合并
                            single_item.push.apply(single_item, item[type]);
                            util.unique(single_item);
                        }else {
                            // 新记录, 记录类型和加入队列
                            single_item = item[type];
                            single_key  = items;
                            list.push(item);
                        }
                    }else {
                        // 多条件直接合并
                        items = '';
                        while (type.length){
                            items += type[0] + item[type[0]];
                            type.shift();
                        }
                        if (!complex[items]){
                            single_key = '';
                            complex[items] = 1;
                            list.push(item);
                        }
                    }
                }
            };

            util.each(self.$data.addon, list_process);
            util.each(data, list_process);

            // 合并广告位ID记录
            if (spot_black){
                util.unique(spot_black.PositionIds);
                list.unshift(spot_black);
            }
            if (spot_white){
                util.unique(spot_white && spot_white.PositionIds);
                list.unshift(spot_white);
            }

            // 更新模块值
            self.$data.addon = list;
            self.$.addon.setValue(list);
        },
        emptyPrice: function(){
            var self = this;
            app.confirm(LANG('确认要清空当前所有出价记录吗?'), function(res){
                if (res){
                    self.$data.price = [];
                    self.$.priceGrid.setData([]);
                }
            })
            return self;
        },
        exportPrice: function(){
            var win = this.buildExportDialog(1);
            win.setData(JSON.stringify(this.$data.price));
            return this;
        },
        importPrice: function(){
            var win = this.buildExportDialog(2);
            win.setData('');
            this.$importType = 'price';
            return this;
        },
        onImportList: function(ev){
            var self = this;
            var list, win = ev.source;
            if (self.$importType && win === self.$.priceDlg){
                var data = null;
                try {
                    data = JSON.parse(ev.param);
                } catch (e){}

                if (util.isArray(data)){
                    if (self.$importType == 'addon'){
                        self.importAddonSave(data);
                    }else {
                        list = self.$data.price;
                        // todo: 合并相同的广告位设置
                        list.push.apply(list, data);
                        self.$.priceGrid.setData(list);
                    }
                }

                self.$importType = null;
                return false;
            }
        },
        _getItemType: function(item){
            if (!item){
                return null;
            }
            var types = [];
            for (var i in item){
                switch (i){
                    case 'PositionIds':
                        if (item[i].length){
                            return 'Spot';
                        }
                        break;
                    case 'Type':
                    case 'Size':
                    case 'Domain':
                    case 'SiteClass':
                        if (item[i].length){
                            types.push(i);
                        }
                        break;
                }
            }
            return types.length ? types.sort() : null;
        }
    });

    /**
     * RTB选择渠道
     */
    function ChannelRtb(config, parent){
        config = $.extend({
            'class': 'P-campaignFormChannel',
            'types': app.config('exchanges'),
            'target': parent
        }, config);
        ChannelRtb.master(this, null, config);
        this.$type = -1;
        this.$selected = null;
    }
    extend(ChannelRtb, view.container, {
        init: function(){
            var c = this.config;
            var doms = this.doms = {};
            // 建立分组
            var section = this.create('sectionAdPosition', form.section, {
                'title': LANG('广告位信息'),
                'desc': LANG('基本信息是活动必填的信息。'),
                'list_title': LANG('填写说明：'),
                'list': [
                    LANG('活动名称是用来标识不同活动的。'),
                    LANG('最高出价是对每一个广告展示曝光的竞价，不能低于所选RTB的起步价。'),
                    LANG('每日预算是指您每天愿意支付的最高推广费用。在当天的费用总额达到该预算值后，经一定的系统刷新时间，您的推广结果会自动下线。')
                ]
            });
            var con = section.getContainer();

            con.append('<span class="title">'+LANG("请选择渠道:")+'</span>');
            doms.group = $('<span class="G-buttonGroup"/>').appendTo(con);
            // 排除控件
            doms.exclude = $('<label class="exclude"><input type="checkbox" /> '+LANG("排除选中的广告位")+'</label>');
            doms.exclude = doms.exclude.appendTo(con).children('input');
            // 选择Grid
            doms.arrow = $('<em class="arrow"/>').appendTo(con);
            doms.list = $('<div class="channels"/>').appendTo(con);
            $('<div class="empty" />').text(LANG('请先选择渠道类型')).appendTo(doms.list);

            util.each(c.types, function(type){
                doms['type_'+type.id] = $('<input class="btn" type="button" data-id="'+type.id+'" />').val(LANG(type.name)).appendTo(doms.group);
                doms['grid_'+type.id] = $('<div class="list" />').appendTo(doms.list);
            });


            ChannelRtb.master(this, 'init');
            this.dg(doms.group, 'input', 'click', 'eventType');
        },
        show: function(){
            ChannelRtb.master(this, 'show');
            var doms = this.doms;
            var button = doms['type_' + this.$type];
            if (!button) { return; }
            doms.arrow.css('top', doms.list.prop('offsetTop'));
            doms.arrow.css('left', button.prop('offsetLeft') + button.outerWidth()/2);
        },
        /**
         * 渠道类型按钮切换回调函数
         */
        eventType: function(evt, elm){
            var id = $(elm).attr('data-id');
            if (id === this.$type){
                return false;
            }
            if (util.first(this.$selected)){
                if (!confirm(LANG('切换渠道类型, 将丢失当前所有的广告位选择和创意包的关联信息. 确认要切换吗?'))){
                    return;
                }
            }
            // this.send(this.parent(), 'resetAdPosition');
            this.setData({channel: +id});
        },
        /**
         * 类型变化回调函数
         * @param  {Object} data     广告位数据资料
         * @return {None}            无返回
         */
        setData: function(data){
            var id = data.channel;
            var selected = data.positions;

            if (id < 10001 || id > 10004){
                return this.reset();
            }
            var doms = this.doms;
            var name = 'grid_'+id;
            var button = doms['type_'+id];
            var grid_con = doms[name];

            this.$type = id;
            this.$selected = {};
            util.each(selected, function(ad){
                if (ad && ad.Id){
                    this.$selected[ad.Id] = 1;
                }
            }, this);

            doms.group.find('.selected').removeClass('selected');
            doms.list.children().hide();
            button.addClass('selected');
            grid_con.show();
            doms.arrow.css('top', doms.list.prop('offsetTop'));
            doms.arrow.css('left', button.prop('offsetLeft') + button.outerWidth()/2);

            var list = this.child(name);
            if (!list){
                list = this.create(name, grid.adPosition, {
                    target: grid_con,
                    param: {AdxId: id},
                    hasTab: false,
                    hasExport: false,
                    hasAmount: false,
                    operation: {
                        head_html: '<input type="checkbox" data-op="check_all"/> '+LANG("全选"),
                        width: 80,
                        render: 'renderOperation'
                    }
                });
            }else {
                list.updateOperation();
            }

            // 排除广告位选项
            doms.exclude.prop('checked', data.isExclude);
        },
        /**
         * 重置控件, 不选中任何类型模块
         * @return {[type]} [description]
         */
        reset: function(){
            var doms = this.doms;
            doms.arrow.css('top', -9999);
            doms.group.find('.selected').removeClass('selected');
            doms.list.children().hide().eq(0).show();
            this.doms.exclude.prop('checked', false);
            this.$type = -1;
            this.$selected = null;
        },
        /**
         * 返回可以提交到服务器的资料对象
         * @return {Object} 返回包含渠道类型和选中的广告位的对象
         */
        getData: function(){
            var ads = [];
            util.each(this.$selected, function(sel, id){
                if (sel){ ads.push({'Id': +id}); }
            });
            var data = {
                'channel': this.$type,
                'positions': ads,
                'type': 1,
                'isExclude': this.doms.exclude.prop('checked')
            };
            return data;
        },
        /**
         * 操作列操作渲染回调函数
         */
        renderOperation:function(index,val,row){
            var btn = $('<a data-op="toggle" />');
            if (this.$selected[row._id]){
                btn.attr('class', 'disable').text(LANG("取消"));
            }else {
                btn.attr('class', 'act').text(LANG("选择"));
            }
            return btn;
        },
        /**
         * 列表操作点击回调函数
         * @param  {Object} ev 事件变量
         * @return {Bool}    返回false阻止事件冒泡
         */
        onListOpClick:function(ev){
            var el = ev.param.el;
            var data, parent;
            var list = this.child('grid_' + this.$type);
            var sels = this.$selected;
            if (ev.param.op === 'toggle'){
                data = ev.param.data;
                var id = data._id;
                if (sels[id]){
                    sels[id] = 0;
                    el.attr('class','act').text(LANG("选择"));
                    // this.send(this.parent(), 'removeAdPosition', data);
                    list.$all.prop('checked', false);
                }else {
                    sels[id] = 1;
                    el.attr('class','disable').text(LANG("取消"));
                    // this.send(this.parent(), 'addAdPosition', data);
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
                            // this.send(parent, 'addAdPosition', item);
                        }
                    }, this);
                }else {
                    util.each(data, function(item){
                        if (sels[item._id]){
                            sels[item._id] = 0;
                            // this.send(parent, 'removeAdPosition', item);
                        }
                    }, this);
                }
                list.updateOperation();
            }
            data = sels = parent = list = null;
        },
        /**
         * Grid模块加载数据完成后触发, 监控更新全选按钮的状态
         * @param  {Object} ev 事件对象
         * @return {None}      无返回不拦截事件
         */
        onSizeChange: function(ev){
            var ret = util.each(ev.from.getData(), function(item){
                if (!this.$selected[item._id]){ return false; }
            }, this);
            ev.from.$all.prop('checked', (ret === null));
        }
    });
    exports.channelRtb = ChannelRtb;

    /**
     * 活动表单 - 添加游戏
     */
    function GameForm(config, parent){
        config = $.extend({
            'class': 'P-campaignFormGame',
            'target': parent,
            'limit': 0, // <Number> 可选产品数量, 0为不限制
            'sweety_limit': 0 // <Number> 创意包数量限制, 0为不限制
        }, config);
        GameForm.master(this, null, config);
        this.$adType = 0;
        this.$exchangeId = 0;

        // isButt：是否已和DSP对接
        var userData = app.getUser();
        this.$isButt = userData && userData.campany && userData.campany.IsButt;
    }
    extend(GameForm, view.container, {
        init: function(){
            this.doms = {};
            this.games = [];
            this.$batchData = {};
            this.data = {};
            tpl.load('campaign', this.build, this);
        },
        build: function(req){
            this.render();
            var c = this.config;
            var el = this.el;
            // 创建批量tab
            this.create('batchTab', tab.batchTab, {
                'target': el,
                'add': {
                    'text': LANG('+添加创意策略'),
                    'type': LANG('创意策略')
                }
            })[c.batch ? 'show' : 'hide']();
            var tabBody = c.batch ? this.$.batchTab.getContainer() : el;

            // 建立分组
            var section = this.create('sectionBase', form.section, {
                'title': LANG('选择产品'),
                'desc': LANG('选择本活动要推广的产品。'),
                'list_title': LANG('填写说明：'),
                'list': [
                    LANG('可选择一个或多个产品，当多个产品时，可以给各个产品分配流量。'),
                    LANG('为每个产品指定服务器，默认为自动选择最新服务器。自动选择服务器指不管是新用户还是老用户，都自动进入最新服务器。导入上次登录的服务器指老用户进入上一次登录的服务器，新用户自动进入最新服务器。'),
                    LANG('为每个产品设定创意包与落地页，每个产品可以设定多个创意包和落地页，并可以拖拉关联创意包和落地页。'),
                    LANG('每个产品的创意包以及落地页可以各自设定优化策略，默认为智能优化。')
                ],
                'target': tabBody
            });
            var con = section.getContainer();
            con.attr('class', 'P-campaignFormGameContainer');
            tpl.appendTo(con, 'campaign/game_form');

            // 没有对接，隐藏服务器列
            if(!this.$isButt){
                this.el.find('.server').hide();
            }

            var doms  = this.doms;
            doms.body = con.find('.P-campaignFormGameBody');
            doms.add  = con.find('.P-campaignFormGameAdd');

            this.jq(doms.add.find('button'), 'click', 'selectGame');
            this.dg(doms.body, '.delete', 'click', 'eventDelete');
            this.dg(doms.body, '.rule', 'click', 'eventRule');

            // 广告点击类型
            var landTypeCon = $('<div class="P-campaignFormGameLandType"/>').appendTo(tabBody);
            landTypeCon[c.rtbType == 'MT' ? 'show' : 'hide']();

            this.landType = this.create('landType', form.dropdown, {
                'label': LANG('广告点击类型：'),
                'target': landTypeCon,
                'key': 'id',
                'search':false,
                'width': 300,
                'options': [
                    {Name: LANG('打开网页'), id: 0},
                    {Name: LANG('下载ios应用'), id: 1},
                    {Name: LANG('下载android应用'), id: 2}
                ]
            });

            this.appPackName = this.create('appPackName', form.input, {
                'label': LANG('应用包名：'),
                'target': landTypeCon,
                'width': 288
            }).hide();

            this.popwin = this.create('popwin', popwin.selectProduct);
            this.ratio  = this.create('ratio', ScaleForm);
            this.ratio.hide();
        },
        buildItem: function(data, skip_ratio){//game, sweetys, whiskys){
            var game = data.game;
            if(!game){return}
            var dom = $(tpl.parse('campaign/game_form_item', game));
            var item = {
                dom: dom,
                id: game._id,
                data: game,
                sweety_num: dom.find('.sweety_num'),
                whisky_num: dom.find('.whisky_num'),
                sweetyType: data.SweetyRatioType || 0, // 优化方式
                sweetys: data.Sweetys || [], // 关联创意包列表
                whiskyType: data.WhiskyCreativeRatioType || 0, // 优化方式
                whiskys: data.WhiskyCreatives || []	// 关联落地页列表
            };
            var img = item.dom.find('.logo img');
            img.bind('load',function(){
                if(this.height<10){
                    this.src = app.config('default_img').product;
                    this.height = 73;
                }
            })
            // 默认图片绑定
            util.imageError(img, 'product');

            var btn = item.dom.find('.delete');
            btn.attr('title', btn.text());
            item.dom.appendTo(this.doms.body);

            if(this.$isButt){
                // 服务器选择模块
                item.server = this.create(common.dropdown, {
                    search: false,
                    all: {Name:LANG('自动选择最新服务器')},
                    fixed: [{Name:'导入上次登录的服务器', '_id':-1}],
                    url: '/rest/listproductserver?ProductId=' + item.id,
                    data: data.ServerId,
                    target: item.dom.find('.server')
                });
            }else{
                item.dom.find('.server').text(LANG('自动选择最新服务器')).hide();
            }

            this.games.push(item);

            // 添加产品分配比例
            if (!skip_ratio){
                this.ratio.addGame(data.game);
            }

            // 创意包和落地页数量
            item.sweety_num.text(item.sweetys.length);
            item.whisky_num.text(item.whiskys.length);

            // 广告类型
            this.updateRow(item);

            this.updateDisplay();
            return item;
        },
        removeItem: function(item){
            if(this.$isButt){
                item.server.destroy();
            }
            item.dom.remove();
            this.updateDisplay();
            this.ratio.removeGame(item.data);
            // this.fire('removeGame', item);
            return item;
        },
        updateDisplay: function(){
            // 已达到最大产品数量限制, 隐藏选择窗口, 隐藏添加按钮
            var limit = this.config.limit;
            if (limit > 0 && this.games.length >= limit){
                this.popwin.hide();
                this.doms.add.hide();
            }else {
                this.doms.add.show();
            }

            if (this.games.length > 1){
                this.ratio.show();
            }else {
                this.ratio.hide();
            }
        },
        updateRow: function(item){
            var popwin = (this.$adType == 2);
            item.dom.find('.creative button').text(
                popwin ? LANG('落地页') : LANG('创意包与落地页')
            );
            item.sweety_num.toggle(!popwin)
                .prev().toggle(!popwin);
        },
        selectGame: function(){
            var selectedIds = [];
            util.each(this.games,function(item){
                if(item.id){
                    selectedIds.push(item.id);
                }
            });
            this.popwin.setSelected(selectedIds)
                .setLimit(selectedIds.length, this.config.limit)
                .show();
        },
        onBatchTabChange: function(ev){
            var batchData = this.$batchData;
            var tab = ev.param.tab;

            if(this.$.batchTab){
                var lastData = this.$.batchTab.getLast();
                batchData[lastData.tab] = this.getData();
            }

            if(batchData[tab] && batchData[tab].length){
                this.load(batchData[tab]);
            }else{
                this.reset();
            }
            return false;
        },
        onBatchTabCancel: function(ev){
            var tab = ev.param.tab;
            delete this.$batchData[tab];
            return false;
        },
        onOptionChange: function(ev){
            // 下载android应用，显示应用包名；
            if(this.appPackName){
                this.appPackName[ev.param.id == 2 ? 'show' : 'hide']();
            }

            return false;
        },
        onSelectGame: function(ev){
            var game = ev.param;
            if (util.find(this.games, game._id, 'id')){
                return false;
            }
            var limit = this.config.limit;
            if (limit > 0 && this.games.length >= limit){
                app.alert(LANG('暂时只允许选择 %1 个游戏', limit));
                ev.returnValue = false;
                this.doms.add.hide();
                return false;
            }
            // 游戏资料不存在, 添加游戏
            this.buildItem({'game': game});

            // 发送消息, 通知游戏添加
            // this.fire('addGame', item);
            return false;
        },
        onUnselectGame: function(ev){
            var games = this.games,
                game = ev.param;

            var id = util.index(games, game._id, 'id');
            if (id !== null){
                var item = games.splice(id,1);
                this.removeItem(item[0]);
            }
            return false;
        },
        eventDelete: function(evt, elm){
            var self = this;
            app.confirm(LANG('真的要删除游戏资料吗? 删除游戏会同时删除该游戏的相关策略和创意设置'), function(res){
                if(res){
                    var id = +$(elm).closest('[data-id]').attr('data-id');
                    var index = util.index(self.games, id, 'id');
                    if (index !== null){
                        var item = self.games[index];
                        self.games.splice(index,1);
                        self.popwin.removeSelect(id);
                        self.removeItem(item)
                    }
                }
            })
            return false;
        },
        /**
         * 添加按钮点击事件
         * @param  {Object} evt jQuery事件对象
         * @return {Bool}     返回false阻止DOM事件冒泡
         */
        eventRule: function(evt, elm){
            var id = +$(elm).closest('[data-id]').attr('data-id');
            var item = util.find(this.games, id, 'id');
            if (item){
                var mod = this.get('creativeDetail');
                if (mod){
                    mod.show();
                }else {
                    mod = this.create('creativeDetail', CreativeDetail, {
                        'sweety_limit': this.config.sweety_limit
                    });
                }
                mod.setData(item, this.$adType);
                mod.setExchangeId(this.$exchangeId);
            }else {
                app.error('没有找到对应的游戏记录');
            }
            return false;
        },
        /**
         * 详细创意管理窗口保存事件
         * @param  {Object} ev 事件对象
         * @return {Bool}    返回false阻止事件冒泡
         */
        onCreativeDetailDone: function(ev){
            var data = ev.param;
            var item = util.find(this.games, data.id, 'id');
            if (item){
                $.extend(item, data);
            }
            item.sweety_num.text(item.sweetys.length);
            item.whisky_num.text(item.whiskys.length);
            return false;
        },
        /**
         * 重置表单
         * @return {None} 无返回
         */
        reset: function(){
            var mod = this.get('creativeDetail');
            if (mod){ mod.hide(); }
            var games = this.games.splice(0, this.games.length);
            util.each(games, function(item){
                this.removeItem(item);
            }, this);
            //GameForm.master(this, 'reset');
        },
        /**
         * 设置游戏列表信息
         * @param {Array} games 游戏资料对象数据
         */
        setData: function(games){
            this.reset();
            var list = [];
            util.each(games, function(item){
                // this.buildItem(item.game, item.Sweetys, item.WhiskyCreatives);
                this.buildItem(item, true);
                list.push(item.Id);
            }, this);

            this.popwin.setSelected(list);
            this.ratio.setData(games);
            if(games && games.length){
                this.landType.setData(games[0].LandType || 0);
                this.appPackName.setData(games[0].AppPackName || '');
                this.onOptionChange({
                    'param': {'id': games[0].LandType || 0}
                });
            }
        },
        /**
         * 设置广告形式
         * @param {Number} type 广告形式代号
         */
        setAdType: function(type){
            type = +type;
            if (this.$adType === type){
                return false;
            }
            this.$adType = type;
            util.each(this.games, function(item){
                this.updateRow(item);
            }, this);
        },
        setExchangeId: function(id){
            this.$exchangeId = id;
        },
        /**
         * 获取数据
         * @return {Array} 返回提交到服务器的数据格式
         */
        getData: function(){
            var products = [];
            var ratios = this.ratio.getData();

            util.each(this.games, function(game){
                products.push({
                    Id: game.id,
                    ServerId: this.$isButt ? game.server.getData() : null,
                    RatioSet: ratios[game.id],
                    SweetyRatioType: game.sweetyType,
                    Sweetys: this.transformList(game.sweetys),
                    WhiskyCreativeRatioType: game.whiskyType,
                    WhiskyCreatives: this.transformList(game.whiskys),
                    LandType: +this.landType.getData(),
                    AppPackName: this.appPackName.getData()
                });
            }, this);

            return products;
        },
        getBatchData: function(){
            var batchData = this.$batchData;
            if(this.$.batchTab){
                var tab = this.$.batchTab.getActive().attr('data-tab');
                batchData[tab] = this.getData();
            }
            var result = [];
            util.each(batchData, function(item, idx){
                if(item){
                    item.BatchTab = idx;
                    result.push(item);
                }
            });
            return result;
        },
        transformList: function(list){
            var new_list = [];
            util.each(list, function(item){
                var new_item = {
                    Id: item.Id,
                    RatioSet: item.RatioSet
                };
                if (item.WhiskyIds){
                    new_item.WhiskyIds = item.WhiskyIds;
                }
                new_list.push(new_item);
            });
            return new_list;
        },
        load: function(data){
            var self = this;
            var list = self.data.Products = util.clone(data);
            // 显示正在拉取数据提示
            self.showLoading();

            var pid = [];
            var sid = [];
            var wid = [];
            util.each(list, function(prod){
                pid.push(prod.Id);
                util.each(prod.Sweetys, function(sweety){
                    sid.push(sweety.Id);
                });
                util.each(prod.WhiskyCreatives, function(whisky){
                    wid.push(whisky.Id);
                });
            });

            util.uniq(pid);
            util.uniq(sid);
            util.uniq(wid);

            // 查询数据缓存
            self.cache = {};

            // 查询创意包
            if (sid.length){
                self.$loadCounter++;
                app.data.get(
                    '/rest/listsweety',
                    {Ids: sid.toString(), no_stastic_data: 1, no_limit:1},
                    self, 'onData', 'sweety'
                );
                self.cache.sweetys = null;
            }else {
                self.cache.sweetys = {};
            }
            // 查询落地页
            if (wid.length){
                self.$loadCounter++;
                app.data.get(
                    '/rest/listwhiskycreative',
                    {Ids: wid.toString(), no_stastic_data: 1, no_limit:1},
                    self, 'onData', 'whisky'
                );
                self.cache.whiskys = null;
            }else {
                self.cache.whiskys = {};
            }

            if(pid.length){
                // 查询产品
                self.cache.products = null;
                self.$loadCounter++;
                app.data.get(
                    '/rest/listproduct',
                    {Ids: pid.toString(), no_stastic_data: 1, no_limit:1},
                    self, 'onData', 'product'
                );
            }else {
                self.cache.products = {};
                self.hideLoading();
            }
        },
        onData: function(err, data, type){
            if(!--this.$loadCounter){
                this.hideLoading();
            }
            if (err){
                app.alert(err.message);
                this.cache = null;
                return false;
            }
            if (!this.cache){
                return false;
            }
            var cache;

            switch (type){
                case 'product':
                    cache = this.cache.products = {};
                    break;
                case 'sweety':
                    cache = this.cache.sweetys = {};
                    break;
                case 'whisky':
                    cache = this.cache.whiskys = {};
                    break;
                default:
                    return false;
            }
            util.each(data.items, function(item){
                cache[item._id] = item;
            });
            if (this.cache.products && this.cache.sweetys && this.cache.whiskys){
                //TODO: 隐藏拉取数据提示

                // 数据拉取完成, 渲染数据
                util.each(this.data.Products, function(item){
                    item.game = this.cache.products[item.Id];
                    if (!item.game){
                        // 产品数据无效, 删除产品
                        return null;
                    }

                    util.each(item.Sweetys, function(item){
                        if (!this.cache.sweetys[item.Id]){
                            return null;
                        }
                        item.data = this.cache.sweetys[item.Id];
                    }, this);
                    util.each(item.WhiskyCreatives, function(item){
                        if (!this.cache.whiskys[item.Id]){
                            return null;
                        }
                        item.data = this.cache.whiskys[item.Id];
                    }, this);
                }, this);

                // 更新设置其他需要详细资料的模块记录
                //var game = this.game;
                //this.setAdType(this.data.AdType);
                this.setData(this.data.Products);
                //this.setExchangeId(this.data.SubChannel[0]);
            }
            return false;
        }
    });
    exports.gameForm = GameForm;

    /**
     * 活动表单 - 游戏策略
     */
    function ScaleForm(config, parent){
        config = $.extend({
            'class': 'P-campaignFormScale',
            'target': parent
        }, config);
        ScaleForm.master(this, null, config);
    }
    extend(ScaleForm, view.container, {
        init: function(){
            this.render();

            // 产品比例分配
            var section = this.create('sectionRatio', form.section, {
                'title': LANG('流量分配'),
                'desc': LANG('可拖拉分配流量到每个产品上，默认平均分配。')
            });
            this.create('scale', form.scale, {
                target: section.getContainer(),
                height:150
            });
        },
        renderItem: function(item, dom){
            return item.data ? item.data.Name : '';
        },
        addGame: function(game){
            this.$.scale.add({
                id: game._id,
                data: game,
                render: this.renderItem
            });
        },
        removeGame: function(game){
            this.$.scale.remove(game._id);
        },
        reset: function(){
            this.$.scale.reset();
        },
        setData: function(items){
            var list = [];
            util.each(items, function(item){
                list.push({
                    id: item.Id,
                    data: item.game,
                    render: this.renderItem,
                    value: item.RatioSet
                });
            }, this);
            this.$.scale.setData(list);
        },
        getData: function(){
            return this.$.scale.getPercent();
        }
    });
    exports.scaleForm = ScaleForm;

    // 电商广告策略
    var CreativeForm = app.extend(view.container, {
        init: function(config, parent){
            config = $.extend({
                'class': 'P-campaignFormRule',
                'target': parent,
                'height': 700,
                'data': null
            }, config);
            CreativeForm.master(this, null, config);

            // 广告模式
            this.$adType = 0;
            this.$exchangeId = 0;
            this.$detail = null;
            this.$ready = false;

            // 构建内容
            this.render();
        },
        build: function(){
            if (this.$ready) { return false; }
            var c = this.config;
            // 建立分组
            var sec = this.create('sectionBase', form.section, {
                'title': LANG('广告策略'),
                'desc': LANG('选择本活选择关联创意包和落地页。'),
                'list_title': LANG('说明：'),
                'list': [
                    LANG('为本活动设定创意包与落地页，可以设定多个创意包和落地页，并可以拖拉关联创意包和落地页。'),
                    LANG('活动的创意包以及落地页可以各自设定优化策略，默认为智能优化。')
                ]
            });

            // 创建策略窗口
            var con = sec.getContainer();
            con.css('background-color', '#fff');

            this.$detail = this.create('detail', CreativeDetail, {
                'class': 'P-campaignFormDetail',
                popwin: false,
                only_list: 1,
                target: con,
                max_height: this.config.height
            });
            this.$detail.setData(
                this.config.data || {
                    id:0,
                    whiskys:[],
                    whiskyType:0,
                    sweetys:[],
                    sweetyType:0
                },
                this.$adType
            );
            this.$detail.setExchangeId(this.$exchangeId);

            // 广告点击类型
            var landTypeCon = $('<div class="P-campaignFormGameLandType"/>').appendTo(this.el);
            landTypeCon[c.rtbType == 'MT' ? 'show' : 'hide']();

            this.landType = this.create('landType', form.dropdown, {
                'label': LANG('广告点击类型：'),
                'target': landTypeCon,
                'key': 'id',
                'search':false,
                'width': 300,
                'options': [
                    {Name: LANG('打开网页'), id: 0},
                    {Name: LANG('下载ios应用'), id: 1},
                    {Name: LANG('下载android应用'), id: 2}
                ]
            });

            this.appPackName = this.create('appPackName', form.input, {
                'label': LANG('应用包名：'),
                'target': landTypeCon,
                'width': 288
            }).hide();

            this.$ready = true;
        },
        onOptionChange: function(ev){
            // 下载android应用，显示应用包名；
            if(this.appPackName){
                this.appPackName[ev.param.id == 2 ? 'show' : 'hide']();
            }

            return false;
        },
        show: function(){
            CreativeForm.master(this,'show');
            if (!this.$ready){ this.build(); }
        },
        reset: function(){
            this.config.data = null;
            if (this.$detail){
                this.$detail.reset();
            }
        },
        setAdType: function(type){
            this.$adType = type;
            if (this.$detail){
                this.$detail.setAdType(type);
            }
        },
        setExchangeId: function(id){
            this.$exchangeId = id;
            if (this.$detail){
                this.$detail.setExchangeId(id);
            }
        },
        // 设置初始值
        setData: function(products){
            if (products.length){
                var data = products[0];
                this.config.data = {
                    id: data.game && data.game._id || 0,
                    sweetyType: data.SweetyRatioType || 0, // 优化方式
                    sweetys: data.Sweetys || [], // 关联创意包列表
                    whiskyType: data.WhiskyCreativeRatioType || 0, // 优化方式
                    whiskys: data.WhiskyCreatives || []	// 关联落地页列表
                };
                if (this.$detail){
                    this.$detail.setData(this.config.data, this.$adType);
                }
                if(this.landType){
                    this.landType.setData(data.LandType || 0);
                }
                if(this.appPackName){
                    this.appPackName.setData(data.AppPackName || '');
                    this.onOptionChange({
                        'param': {'id': data.LandType || 0}
                    });
                }

            }else {
                this.reset();
            }
        },
        // 获取保存资料
        getData: function(){
            var data = this.$detail ? this.$detail.getData() : this.config.data;
            if (!data){
                return [];
            }
            var item = {
                Id: data.id || 0,
                ServerId: 0,
                RatioSet: 100,
                SweetyRatioType: data.sweetyType,
                Sweetys: this.transformList(data.sweetys),
                WhiskyCreativeRatioType: data.whiskyType,
                WhiskyCreatives: this.transformList(data.whiskys),
                LandType: +this.landType.getData(),
                AppPackName: this.appPackName.getData()
            };
            return [item];
        },
        // 转换资料
        transformList: function(list){
            var new_list = [];
            util.each(list, function(item){
                var new_item = {
                    Id: item.Id,
                    RatioSet: item.RatioSet
                };
                if (item.WhiskyIds){
                    new_item.WhiskyIds = item.WhiskyIds;
                }
                new_list.push(new_item);
            });
            return new_list;
        }
    });

    /**
     * 游戏创意编辑窗口
     */
    function CreativeDetail(config, parent){
        config = $.extend({
            'class': 'P-campaignFormDetail',
            'target': 'body',
            'popwin': true,
            'only_list': false, // 电商版只有列表
            'min_height': 380,
            'max_height': 0,
            'sweety_limit': 0
        }, config);
        CreativeDetail.master(this, null, config);

        this.data = null;
        this.ready = 0;
        this.$adType = 0;
        this.$exchangeId = 0;
    }
    extend(CreativeDetail, view.container, {
        init: function(){
            var c = this.config;
            this.games = [];
            if (c.popwin){
                this.el.addClass('P-campaignFormDetailPopwin');
                this.$popwin = this.create('popwin', popwin.base, {
                    'showFoot': 0
                });
                this.$popwin.body.append(this.el);
                this.$popwin.show(this.getWinSize());
            }else {
                this.render();
            }
            if (c.only_list){
                this.el.addClass('listMode');
                this.$height = [c.min_height,0,0];
            }
            tpl.load('campaign', this.build, this);
        },
        getWinSize: function(){
            var d = document,
                b = (d.compatMode === "CSS1Compat"?d.documentElement:d.body);
            return {
                'width': b.clientWidth - 50,
                'height': b.clientHeight-100
            };
        },
        build: function(req){
            this.ready = 1;
            var el = this.el;
            tpl.appendTo(el, 'campaign/creative_detail');
            this.doms = {
                title: el.find('.title > .name'),
                icon: el.find('.title > .icon > img'),
                sweety: el.find('.sweety_list'),
                whisky: el.find('.whisky_list'),
                done: el.find('.done'),
                cancel: el.find('.cancel'),
                relation: el.find('.relation')
            };
            // $(document.body).addClass('fullSize');

            // 创建子模块
            var c = this.config;
            this.relation = this.create(
                'relation', Relation,
                {target: this.doms.relation}
            );
            this.sweety_list = this.create(
                'sweety_list', SweetyList,
                {
                    target: this.doms.sweety,
                    limit: c.sweety_limit,
                    list_mode: c.only_list
                }
            );
            this.whisky_list = this.create(
                'whisky_list', WhiskyList,
                {
                    target: this.doms.whisky,
                    list_mode: c.only_list
                }
            );

            // 绑定DOM事件
            this.jq(this.doms.done, 'click', 'clickDone');
            this.jq(this.doms.cancel, 'click', 'clickCancel');
            // 默认图片绑定
            util.imageError(this.doms.icon, 'product');

            // 初始化数据
            if (this.data){
                this.setData(this.data, this.$adType);
            }
            this.sweety_list.setExchangeId(this.$exchangeId);
        },
        show: function(){
            // $(document.body).addClass('fullSize');
            if (this.$popwin){
                this.$popwin.show(this.getWinSize());
            }else {
                CreativeDetail.master(this, 'show', arguments);
            }
        },
        hide: function(){
            // $(document.body).removeClass('fullSize');
            if (this.$popwin){
                this.$popwin.hide();
            }else {
                CreativeDetail.master(this, 'hide', arguments);
            }
        },
        /**
         * 列表模块添加项目通知事件处理
         * @param  {Object} ev 事件变了对象
         * @return {Bool}    返回false阻止事件冒泡
         */
        onAddItem: function(ev){
            var side = (ev.param.type == 'sweety' ? 'left' : 'right');
            var id = ev.param.id;
            this.relation.add(id, side);
            return false;
        },
        onRemoveItem: function(ev){
            var side = (ev.param.type == 'sweety' ? 'left' : 'right');
            var id = ev.param.id;
            this.relation.remove(id, side);
            return false;
        },
        /**
         * 列表容器滚动事件处理函数
         * @param  {Object} ev 事件变了对象
         * @return {Bool}    返回false阻止事件冒泡
         */
        onListScroll: function(ev){
            var side = (ev.param.type == 'sweety' ? 'left' : 'right');
            this.relation.scroll(side, ev.param.offset);
            return false;
        },
        onSweetyListResize: function(ev){
            var c = this.config;
            if (!c.only_list) {return false;}
            var maxHeight = this.$height;
            if (ev.param.name === 'sweety'){
                maxHeight[1] = ev.param.height;
            }else {
                maxHeight[2] = ev.param.height;
            }

            var h = Math.max.apply(Math, maxHeight);
            if (c.max_height > 0 && h > c.max_height){
                h = c.max_height;
            }
            this.el.height(h);
            this.sweety_list.updateScroll();
            this.whisky_list.updateScroll();
        },
        /**
         * 完成按钮处理事件
         */
        clickDone: function(evt){
            var data = this.getData();
            if (!data) {return false;}
            this.fire('creativeDetailDone', data);
            this.hide();
        },
        /**
         * 取消按钮处理事件
         */
        clickCancel: function(evt){
            // 不保留当前编辑状态, 重新打开时重新渲染
            this.data = null;
            this.hide();
        },
        setAdType: function(type){
            this.$adType = type;
            var doms = this.doms;
            if (doms){
                // 检查是否创建完毕
                if (type == 2){
                    doms.sweety.hide();
                    doms.whisky.addClass('full');
                    doms.relation.hide();
                }else {
                    doms.whisky.removeClass('full');
                    doms.sweety.show();
                    doms.relation.show();
                }
            }
        },
        setExchangeId: function(id){
            this.$exchangeId = id;
            if (this.sweety_list){
                this.sweety_list.setExchangeId(id);
            }
        },
        /**
         * 重置模块数据
         */
        reset: function(){
            this.data = null;
            CreativeDetail.master(this,'reset');
        },
        /**
         * 设置并显示模块数据
         * @param {Object} item 产品详细信息对象
         */
        setData: function(item, type){
            this.data = item;
            this.$adType = type;

            if (!this.ready){
                return;
            }
            // 更新标题数据
            var doms = this.doms;
            if (!this.config.only_list){
                doms.icon.get(0).setErrored = false;
                doms.title.text(item.data.Name);
                doms.icon.attr('src', item.data.Thumb);
            }

            // 落地页数据更新
            this.whisky_list.setData(item.whiskys, item.whiskyType, item.id);
            // 创意包数据更新
            this.sweety_list.setData(item.sweetys, item.sweetyType, item.id);
            // 设置关系
            doms.relation.show(); //修正类库字体对齐问题

            var rels = {left:[], right:[], link:{}};
            util.each(item.sweetys, function(item){
                rels.left.push(item.Id);
                rels.link[item.Id] = item.WhiskyIds;
            });
            util.each(item.whiskys, function(item){
                rels.right.push(item.Id);
            });
            this.relation.setData(rels, type);
            // 更新显示模式
            this.setAdType(type);
        },
        /**
         * 获取详细创意配置数据
         * @return {Object} 返回可以提交的创意和落地页配置对象
         */
        getData: function(){
            var sweety = this.sweety_list.getData();
            var whisky = this.whisky_list.getData();
            // 基本资料
            var data = {
                id: this.data && this.data.id || 0,
                sweetyType: sweety.type,
                sweetys: sweety.list,
                whiskyType: whisky.type,
                whiskys: whisky.list
            };

            // 更新关系
            var relation = this.relation.getData();
            if (!relation){ return false; }
            util.each(sweety.list, function(item){
                item.WhiskyIds = relation[item.Id] || null;
            });

            return data;
        }
    });
    exports.creativeDetail = CreativeDetail;


    /**
     * 游戏创意编辑窗口 - 优化方式选择
     */
    function Optimiza(config, parent){
        config = $.extend({
            'class': 'P-campaignOptimiza',
            'target': parent,
            'type': 0,
            'data': {},
            'render': null
        }, config);
        Optimiza.master(this, null, config);

        this.opts_name = [
            LANG('智能优化'),
            LANG('按注册率优化'),
            LANG('按点击率优化'),
            LANG('人工分配流量')
        ];
        this.manual_id = 3;
    }
    extend(Optimiza, view.container, {
        init: function(){
            this.render();

            var c = this.config;
            var doms = this.doms = {};
            this.el.append(LANG('策略') + ':');

            doms.text = $('<span class="current_state"/>').text(this.opts_name[c.type]).appendTo(this.el);
            doms.button = $('<a class="detail_button"/>').appendTo(this.el);
            doms.popup = $('<div class="P-campaignOptimizaPopup"/>').appendTo(this.el);

            this.$ratio = this.create(
                'ratio', form.scale,
                {
                    target:doms.popup,
                    'class':'P-campaignOptimizaRatio'
                }
            );

            this.$type = this.create(
                'type', form.radio,
                {
                    target:doms.popup,
                    option:this.opts_name,
                    value:c.type, label:'', changeEvent: true,
                    'class':'P-campaignOptimizaType'
                }
            );
            var con = this.parent().parent().el;
            var pos = util.offset(doms.popup, con);
            if (pos.left < 20){
                pos.left = 20;
            }
            pos.right = 'auto';
            this.popup_top = pos.top;
            this.popup_show = false;
            pos.top = -9999;
            doms.popup.appendTo(con).css(pos);
            this.$ratio.appendTo(doms.popup);

            // 绑定事件
            this.jq(doms.button, 'click', 'toggleWin');
            this.jq(document.body, 'click', 'hideWin');
        },
        toggleWin: function(evt){
            this.popup_show = !this.popup_show;
            this.doms.popup.css('top', this.popup_show ? this.popup_top : -9999);
            return false;
        },
        hideWin: function(evt){
            if (!this.popup_show){
                return;
            }
            var pos = this.doms.popup.offset();
            pos.right = pos.left + this.doms.popup.outerWidth();
            pos.bottom = pos.top + this.doms.popup.outerHeight();

            if (evt.pageX < pos.left || evt.pageX > pos.right || evt.pageY < pos.top || evt.pageY > pos.bottom){
                this.doms.popup.css('top', -9999);
                this.popup_show = false;
            }
        },
        afterDestroy: function(){
            $(document.body).unbind(this.hideWin);
            Optimiza.master(this, 'afterDestroy', arguments);
        },
        /**
         * 改变优化策略类型的回调函数
         */
        onRadioChange: function(ev){
            var type = ev.param.value;
            this.doms.text.text(this.opts_name[type] || '');
            if (type == this.manual_id){
                this.$ratio.show();
            }else {
                this.$ratio.hide();
            }
            return false;
        },
        /**
         * 添加人工分配流量的项目
         */
        add: function(item){
            item.render = this.config.render;
            this.$ratio.add(item);
        },
        /**
         * 删除手工流量分配的选项
         * @param  {Object} item 项目详细资料对象
         * @return {None}      无返回
         */
        remove: function(item){
            this.$ratio.remove(item.id);
        },
        /**
         * 重置控件
         */
        reset: function(){
            this.$ratio.reset();
            this.setType(0);
        },
        /**
         * 设置类型
         */
        setType: function(type){
            this.doms.text.text(this.opts_name[type] || '');
            this.$type.setData(type);
        },
        /**
         * 获取优化配置信息
         * @return {Object} 返回优化方式和优化比例信息对象
         */
        getData: function(){
            return {
                type: +this.$type.getData() || 0,
                ratio: this.$ratio.getData()
            };
        }
    });
    exports.optimiza = Optimiza;


    /**
     * 游戏创意编辑窗口 - 选择创意包模块
     */
    function SweetyList(config, parent){
        config = $.extend({
            'class': 'P-campaignSweetyList',
            'title': LANG('创意包'),
            'button': LANG('添加创意包'),
            'item_tpl': 'creative_detail_sweety_item',
            'limit': 0, // 限制选择的创意数量
            'scroll_size': true,
            'list_mode': false,
            'default_logo': 'sweety'
        }, config);
        SweetyList.master(this, null, config);
        this.type = 'sweety';
        this.ready = 0;
        this.delayData = null;
        this.index = 1;
        this.exchange_id = 0;
        this.popwin_list = null;
        this.popwin_pid = null;
        this.popwin_type = popwin.selectSweety;
        this.popwin_conf = {
            grid: {
                cols: [
                    {name:"_id",type:'fixed',sort:true,align:'center',width:50},
                    {name:'Status',render:'renderSweetyStatus',width:30},
                    {name:'PackageNameWithThumb',thumb_size:35},
                    {name:'click_rate',sort:true},
                    {name:'back_reg_rate',sort:true}
                ],
                param:{
                    MFields: 'Status,Name,Thumb,click_rate,back_reg_rate'
                },
                customParam: {
                    begindate: util.date('Ymd', -86400),
                    enddate: util.date('Ymd', -86400)
                },
                sort: 'click_rate',
                hasTab:false
            }
        };

        // 广告位尺寸与附加广告位数据
        this.$sizeData = {};

        this.miss_size = [];
        this.$ExchangeId = 0;
    }
    extend(SweetyList, view.container, {
        init: function(){
            this.doms = {};
            this.items = [];
            tpl.load('campaign', this.build, this);
        },
        /**
         * 模版加载完毕, 生成列表记录
         * @return {None} 无返回
         */
        build: function(){
            var c = this.config;
            var doms = this.doms;
            doms.head = $('<div class="list_head" />').appendTo(this.el);
            doms.body = $('<div class="list_body" />').appendTo(this.el);
            doms.foot = $('<div class="list_foot" />').appendTo(this.el);
            doms.items = $('<div class="list_items" />').appendTo(doms.body);

            $('<span class="list_name" />').text(c.title).appendTo(doms.head);
            doms.opt = $('<div class="list_optimiza" />').appendTo(doms.head);

            this.render();
            this.opt = this.create(
                'optimiza', Optimiza,
                {target: doms.opt, render: this.OptimizaRender}
            );

            this.add = $('<input type="button" class="btn" />').val(c.button).appendTo(doms.foot);
            this.jq(this.add, 'click', 'clickAdd');

            this.ready = 1;

            if (this.delayData){
                this.setData.apply(this, this.delayData);
            }

            // 滚动条
            this.scroll = this.create(
                'scroll', common.scroller,
                {target: doms.body, dir: 'V', pad:false, side:c.scroll_size}
            );
        },
        /**
         * 建立单个记录对象
         * @param  {Object} data     创意包详细信息
         * @param  {Number} ratio    <可选> 手工控制流量比例数值
         * @param  {Bool}   silent   <可选> 是否发送添加事件
         * @return {Object}          返回记录详细记录对象
         */
        buildItem: function(data, ratio, silent){
            var c = this.config;
            var dom = $(tpl.parse('campaign/' + c.item_tpl, data));
            var item = {
                dom: dom,
                type: this.type,
                remove: dom.find('.delete'),

                id: data._id,
                data: data, // 创意包详细资料
                value: ratio || 0 // 流量分配比例
            };

            // 设置间隔样式
            dom.toggleClass('alt', (++this.index%2)===0);
            // 自定义资料设置
            this.customBuild(item, data);
            // 绑定事件
            this.jq(item.remove, 'click', data._id, 'clickRemove');
            // 默认图片绑定
            util.imageError(dom.find('.logo img'), c.default_logo);

            item.dom.appendTo(this.doms.items);
            this.items.push(item);

            // 优化策略添加记录
            this.opt.add(item);

            // 发送事件通知新项目建立
            if (!silent) {
                this.fire('addItem', item);
            }

            // 检查数量限制
            if (c.limit && this.items.length >= c.limit){
                this.add.addClass('disabled');
                if (this.popup){ this.popup.hide(); }
            }
            return item;
        },
        /**
         * 自定义项目设置
         * @param  {Object} item     记录对象
         * @param  {Object} data     创意包详细信息
         */
        customBuild: function(item, data){
            item.tag_list = item.dom.find('.tag_list');
            util.each(data.Label, function(text){
                $('<span/>').text(text).appendTo(item.tag_list);
            });

            item.address = item.dom.find('.logo > a');
            // 设置创意包logo图片的连接地址
            var href = "#/creative/creativeList/"+data._id;
            item.address.attr('href', href);
        },
        /**
         * 优惠策略比例模块渲染函数
         * @param {Object} item 项目资料对象
         * @param {jQuery} dom  项目容器jQuery对象
         */
        OptimizaRender: function(item, dom){
            dom.text(item.data.Name);
        },
        /**
         * 发送获取广告位尺寸与附加广告位数据消息
         * @return {Undefined} 无返回值
         */
        getAdSizeData:function(){
            this.fire(
                "getAdsizeData"
            );
        },
        /**
         * 广告位尺寸与附加广告位数据消息响应函数
         * @param  {Object} ev 消息对象
         * @return {Bool}      false
         */
        onAdsizeData:function(ev){
            this.$sizeData = ev.param;
            return false;
        },
        sizeLackRender: function(index, value, row, col, cell, table){
            var con;
            if (row.size_complete){
                this.miss_size[index] = null;
                con = $("<div/>").text(LANG('尺寸齐全'));
                $("<div class='P-campaignSweetySizeOk'/>").appendTo(con);
                return con;
                //return '<div class="P-campaignSweetySizeOk"/>';
            }else {
                this.miss_size[index] = row.size_lack;
                con = $("<div/>").text(LANG('缺少尺寸'));
                $("<div class='P-campaignSweetySizeMiss' data-index='"+index+"'/>").appendTo(con);
                return con;
                //return LANG('共 X 个创意有效')+'<div class="P-campaignSweetySizeMiss" data-index="'+index+'"/>';
            }
        },
        eventMissSize: function(evt, elm){
            elm = $(elm);
            var tip = this.get('sizeTip');

            if (evt.type != 'mouseenter'){
                // 非鼠标进入事件
                if (tip){ tip.hide(); }
                return false;
            }

            // 鼠标进入事件
            var id = +elm.attr('data-index');
            if (!this.miss_size[id]){ return false; }
            var sizeTable = this.$.sizeTable;
            var names = app.config('sweety_type');
            var datas = [];
            util.each(this.miss_size[id], function(types, size){
                var req = [];

                util.each(types, function(type){
                    if (names[type]){
                        req.push(names[type]);
                    }
                });

                datas.push({
                    size: size,
                    require: req.join(',')
                });
            });

            if (!tip){
                tip = this.create('sizeTip', popwin.tip, {
                    'width': 300,
                    'pos': 'ml',
                    'anchor': elm,
                    'outerHide': 1,
                    'autoHide': 1
                });
            }else{
                tip.reload({anchor: elm});
            }

            //创建表格
            if(!sizeTable){
                var con = $('<div class = "P-campaignWrap" />').appendTo(tip.body);
                $("<div class='title'/>").text(LANG('欠缺以下尺寸创意')).appendTo(con);

                sizeTable = this.create('sizeTable', table.list, {
                    "cols":[
                        {type:'id'},
                        {name:'size',text:LANG("尺寸")},
                        {name:'require',text:LANG("要求"),align:'left'}
                    ],
                    "target":con,
                    "scroll_type":"row",
                    "scroll_size":10
                });

            }
            tip.show();

            //更新表格的数据
            sizeTable.setData(datas);
            return false;
        },
        /**
         * 列表滚动事件处理函数
         * @param  {Object} ev 事件对象变量
         * @return {Bool}    返回false阻止事件冒泡
         */
        onScroll: function(ev){
            if (ev.from === this.scroll){
                this.fire('listScroll', {offset: ev.param.pos, type: this.type});
            }
            return false;
        },
        updateSize: function(){
            if (this.config.list_mode){
                var doms = this.doms;
                var height = doms.head.outerHeight(true) + doms.foot.outerHeight(true);
                height += doms.items.height() + 1;

                this.fire('sweetyListResize', {name: this.type, height: height});
            }else {
                this.updateScroll();
            }
        },
        updateScroll: function(){
            if (this.scroll){
                this.scroll.measure();
            }
        },
        onSelectCreative: function(ev){
            ev.returnValue = true;
            this.buildItem(ev.param);
            this.updateSize();
        },
        onUnselectCreative: function(ev){
            // if (confirm(LANG('真的要删除这个记录吗?'))){
            ev.returnValue = true;
            this.remove(ev.param._id);
            // }
        },
        /**
         * 项目记录删除按钮点击事件
         * @param  {[type]} evt [description]
         * @return {[type]}     [description]
         */
        clickRemove: function(evt){
            var id = evt.data;
            // if (confirm(LANG('真的要删除这个记录吗?'))){
            this.remove(id);
            // }
        },
        /**
         * 添加按钮点击事件
         * @param  {Object} evt jQuery事件对象
         * @return {Bool}     返回false阻止DOM事件冒泡
         */
        clickAdd: function(evt){
            if (this.config.limit && this.items.length >= this.config.limit){
                return false;
            }
            if(this.type === "sweety"){
                this.getAdSizeData();
            }
            var ex_id = this.$ExchangeId;

            if (!this.popup){
                if (ex_id && this.popwin_conf){
                    this.popwin_conf.grid.cols.push({name:'SweetySizeLack', type:'index', render:'sizeLackRender', context:this});
                }
                this.popup = this.create('popup', this.popwin_type, this.popwin_conf);
                this.dg(this.popup.el, '.P-campaignSweetySizeMiss', 'mouseenter mouseleave', 'eventMissSize');
            }
            if (this.popwin_list){
                this.popup.setSelected(this.popwin_list);
                this.popwin_list = null;
            }
            var opt;
            if (this.popwin_pid){
                var user = app.getUser();
                if(user && user.campany.CategoryId == 2){
                    opt = {};
                }else{
                    opt = {Products: '['+this.popwin_pid+']'};
                }
                this.popup.setProductId(this.popwin_pid);
                this.popwin_pid = null;
            }
            opt = $.extend(
                (opt || {})
                ,this.$sizeData
            );
            if (this.exchange_id != ex_id){
                if (opt){
                    opt.ExchangeId = ex_id;
                }else {
                    opt = {ExchangeId: ex_id};
                }
                this.exchange_id = ex_id;
            }
            this.popup.show(opt);
        },
        setExchangeId: function(id){
            this.$ExchangeId = id;
        },
        /**
         * 重置控件内容, 清空显示和数据
         * @return {None} 无返回
         */
        reset: function(){
            util.each(this.items, function(item){
                item.dom.remove();
                return null;
            });
            this.$sizeData = {};
            this.index = 1;
            this.opt.reset();
            this.add.removeClass('disabled');
            this.updateSize();
        },
        /**
         * 设置初始数据并显示
         */
        setData: function(list, type, product_id){
            if (!this.ready){
                this.delayData = [list, type, product_id];
                return;
            }
            this.delayData = null;
            this.reset();

            // 生成项目资料
            this.popwin_pid = product_id;
            this.popwin_list = [];
            util.each(list, function(item){
                this.buildItem(item.data, item.RatioSet, true);
                this.popwin_list.push(item.data._id);
            }, this);

            // 设置优化类型
            this.opt.setType(type)

            // 计算滚动条位置
            this.updateSize();
        },
        /**
         * 获取数据格式资料
         * @return {Object} 整理后的数据格式对象
         */
        getData: function(){
            var opt = this.opt.getData();
            var data = {
                type: opt.type,
                list: []
            };
            util.each(this.items, function(item){
                var ratio = opt.ratio[item.id] || 0;
                item.value = ratio;
                data.list.push({
                    Id: item.id,
                    data: item.data,
                    RatioSet: ratio
                });
            });
            return data;
        },
        /**
         * 删除某个ID记录
         * @param  {Number} id 记录ID号码
         * @return {None}    无返回
         */
        remove: function(id){
            var list = this.items;
            for (var i=0; i<list.length; i++){
                if (list[i].id == id){
                    this.fire('removeItem', list[i]);
                    this.opt.remove(list[i]);
                    list[i].dom.remove();
                    list.splice(i, 1);
                    break;
                }
            }
            for (; i<list.length; i++){
                list[i].dom.toggleClass('alt');
            }
            this.index--;
            // 检查数量限制, 判断是否显示添加按钮
            if (this.config.limit && list.length < this.config.limit){
                this.add.removeClass('disabled');
            }
            if (this.popup){
                this.popup.removeSelect(id);
            }
            if (this.popwin_list){
                util.remove(this.popwin_list, id);
            }
            this.updateSize();
            if (this.scroll){
                // 同步滚动
                this.fire('listScroll', {offset: -this.scroll.getScrollPos(), type: this.type});
            }
        },
        toggleFull: function(set){
            this.el.toggleClass('full', set);
        }
    });

    /**
     * 游戏创意编辑窗口 - 选择落地页模块
     */
    function WhiskyList(config, parent){
        config = $.extend({
            'class': 'P-campaignWhiskyList',
            'title': LANG('落地页'),
            'button': LANG('添加落地页'),
            'item_tpl': 'creative_detail_whisky_item',
            'scroll_size': false,
            'default_logo': 'whisky'
        }, config);
        WhiskyList.master(this, null, config);
        this.type = 'whisky';
        this.popwin_type = popwin.selectWhisky;
        this.popwin_conf = {
            grid: {
                cols: [
                    {name:"_id",type:'fixed',sort:true,width:50,align:'center'},
                    {name:'WhiskyNameWithThumb',thumb_size:35},
                    {name:'click_rate',sort:true},
                    {name:'back_reg_rate',sort:true}
                ],
                param:{
                    MFields: 'Status,Name,Thumb,OuterLink,click_rate,back_reg_rate'
                },
                customParam: {
                    begindate: util.date('Ymd', -86400),
                    enddate: util.date('Ymd', -86400)
                },
                sort: 'back_pageviews',
                hasTab:false
            }
        };
    }
    extend(WhiskyList, SweetyList, {
        /**
         * 自定义项目设置
         * @param  {Object} item     记录对象
         * @param  {Object} data     创意包详细信息
         */
        customBuild: function(item, data){
            //预览地址
            item.address = item.dom.find('.address > a');
            //图片地址
            item.address_pic = item.dom.find('.logo > a');
            // 设置连接地址
            var href = data.OuterLink || (data.WhiskyPreviewUrl);
            item.address.text(href).attr('href', href);
            //设置图片的链接
            item.address_pic.attr('href', href);
        }
    });

    /**
     * 游戏创意编辑窗口 - 关系管理模块
     */
    function Relation(config, parent){
        config = $.extend({
            'class': 'P-campaignRelation',
            'item_height': 121,
            // 圈圈属性
            'radius': 25,
            'stroke_width': 3,
            'stroke_color': '#999',
            'background': '#fff',
            // 连接线属性
            'line_attr': {
                "stroke": '#999',
                "stroke-width": 3,
                "stroke-linecap": "round"
            },
            'offset': 4
        }, config);
        Relation.master(this, null, config);
        this.ready = false;
        this.left = [];
        this.right = [];
        this.cache = [];
        this.show_tip = true;
    }
    extend(Relation, view.container, {
        init: function(){
            this.render();
            var c = this.config;

            // 检查表格类型
            c.formType = this.parent().parent().parent().config.channelType;

            var doms = this.doms = {};
            doms.head = $('<div class="P-campaignRelationHead"/>').appendTo(this.el);
            doms.body = $('<div class="P-campaignRelationBody"/>').appendTo(this.el);

            if (c.formType == 1){
                doms.linktip = $('<div class="P-campaignRelationTip"/>').appendTo(this.el);
                $('<div/>').html(LANG('可拖拽节点关联前后端创意。<br>未关联落地页的前端创意包，将由系统自动将其与所有落地页进行关联！')).appendTo(doms.linktip);

                //创建'不再提醒'复选框
                var notRemind  = $('<div class="notRemind"/>').appendTo(doms.linktip);
                this.$checkbox = $('<input type="checkbox" />').appendTo(notRemind);
                $('<span />').text(LANG('不再提醒')).appendTo(notRemind);

                var btn = $('<input type="button" class="btn"/>').val(LANG('知道了')).appendTo(doms.linktip);

                this.jq(btn, 'click', 'eventClickTip');
            }

            c.width = doms.body.width();
            c.limit = c.width - 2 * (c.radius * 2 + c.offset) - c.stroke_width;

            var rp = require('raphael');
            if (rp){
                this.page = rp(doms.body.get(0), c.width, 900);
                this.left_set = this.page.set();
                this.left_pos = 0;
                this.right_set = this.page.set();
                this.right_pos = 0;

                this.delete_tip = this.page.add([
                    {
                        type: 'rect',
                        x: -40,
                        y: -30,
                        width: 80,
                        height: 20,
                        r: 4,
                        'stroke': '#ccc',
                        'stroke-width': 2,
                        'fill': '#EDB1B1'
                    },
                    {
                        type: 'text',
                        text: LANG('双击删除'),
                        x: 0,
                        y: -20,
                        fill: '#fff',
                        'font-size': 14,
                        'font-weight': 300
                    }
                ]);

                this.delete_tip.transform('t-100,-100');
            }else {
                app.error('Raphael Lib Load Error!');
                return false;
            }
            this.ready = true;
            this.$adType = 0;
        },
        /**
         * 重置模块数据
         * @return {None} 无返回
         */
        reset: function(){
            // 删除左边的节点
            util.each(this.left, function(item){
                item.holder.remove();
                item.mask.remove();
                item.trigger.remove();
                item.text.remove();
                util.each(item.lines, function(link){
                    link.line.remove();
                    link.line = null;
                });
            });
            this.left_set.clear();
            // this.left_pos = 0;
            this.left.splice(0, this.left.length);

            // 删除右边的节点
            util.each(this.right, function(item){
                item.holder.remove();
                item.mask.remove();
                item.trigger.remove();
                item.text.remove();
                util.each(item.lines, function(link){
                    if (link.line) {link.line.remove();}
                });
            });
            this.right_set.clear();
            // this.right_pos = 0;
            this.right.splice(0, this.right.length);

            // 隐藏提示标签
            this.delete_tip.hide();
            this.show_tip = true;
        },
        /**
         * 设置关系数据
         * @param {Object} data ID关系数据
         */
        setData: function(data, type){
            this.reset();
            // 添加左节点
            util.each(data.left, function(left_id){
                this.add(left_id, 'left');
            }, this);
            // 添加右节点
            util.each(data.right, function(right_id){
                this.add(right_id, 'right');
            }, this);
            // 添加链接
            util.each(data.link, function(rights, left_id){
                util.each(rights, function(right_id){
                    this.addLink(+left_id, right_id);
                }, this);
            }, this);
            this.$adType = type;
        },
        /**
         * 获取关系数据
         * @return {Object} 返回ID关系数据对象
         */
        getData: function(){
            var result = {};
            var rights = [];
            var empty_right = [];
            var hasEmpty = false;
            var autoLink = !!this.doms.linktip;

            if (this.$adType != 2){
                if (autoLink){
                    util.each(this.right, function(right){
                        rights.push(right.id);
                        if (util.first(right.lines) === undefined){
                            empty_right.push(right.id);
                            hasEmpty = true;
                        }
                    });
                }

                util.each(this.left, function(left){
                    var list = [];
                    util.each(left.lines, function(link, right_id){
                        list.push(+right_id);
                    });

                    if (autoLink){
                        if (list.length){
                            list.push.apply(list, empty_right);
                            result[left.id] = list;
                        }else {
                            result[left.id] = rights;
                            hasEmpty = true;
                        }
                    }else {
                        result[left.id] = list;
                    }
                    list = null;
                });
            }
            if (hasEmpty && !confirm(LANG('尚有创意包或者落地页没有建立任何关系, 要自动建立关系吗?'))){
                return false;
            }

            return result;
        },
        /**
         * 添加链接点
         * @param {Number} id   链接点ID
         * @param {String} side 添加位置, left - 左边, right - 右边
         * @return {Object} 返回记录项目
         */
        add: function(id, side){
            if (!this.ready){
                this.cache.push([id, side]);
                return false;
            }

            var item, list;
            side = (side == 'left');
            list = (side ? this.left : this.right);
            // 检查是否已经存在同一个ID记录
            item = util.find(list, id, 'id');
            if (item){
                return item;
            }

            var c = this.config;
            var x, y, dr, set, pos;
            if (side){
                set = this.left_set;
                x = c.radius + c.stroke_width/2 + c.offset;
                dr = c.radius;
                pos = this.left_pos;
            }else {
                set = this.right_set;
                x = c.width - c.radius - c.stroke_width/2 - c.offset;
                dr = -c.radius;
                pos = this.right_pos;
            }
            y = list.length * c.item_height + c.item_height / 2;

            // 建立节点圈圈
            var big = this.page.circle(x, y, c.radius);
            big.attr({
                "stroke": c.stroke_color,
                "stroke-width": c.stroke_width,
                "fill": c.background
            });
            var small = this.page.circle(x + dr, y, c.radius / 5);
            small.attr({
                "stroke-width": 0,
                "fill": c.stroke_color
            });
            var num = this.page.text(x, y, list.length + 1);
            num.attr({
                "fill": c.stroke_color,
                'font-size': c.radius * 1.2,
                'font-weight': 600,
                'cursor': 'default'
            });

            var mask = this.page.circle(x, y, c.radius*1.2 );
            mask.attr({
                'fill': '#fff',
                'stroke-width': 0,
                'opacity': 0,
                'cursor':'pointer'
            }).data('index', id);

            // 绑定事件
            mask.drag(this.dragMove, this.dragStart, this.dragEnd, this, this, this);
            set.push(big, small, num, mask);
            this.delete_tip.toFront();
            big.transform('t0,'+pos);
            small.transform('t0,'+pos);
            num.transform('t0,'+pos);
            mask.transform('t0,'+pos);

            item = {
                id: id,
                holder: big,
                trigger: small,
                text: num,
                mask: mask,
                posY: y,
                lines: {}
            };
            list.push(item);

            //从cookies读值，判断是否有勾选‘不再提醒’选项
            var notRemind = app.cookie('notRemind');
            if(!notRemind){
                // 左右都添加了项目时, 显示提示
                if (this.left.length && this.right.length && this.show_tip){
                    this.show_tip = false;
                    if (this.doms.linktip) {this.doms.linktip.show();}
                }
            }

            // 代理活动时, 自动添加连线
            if (this.config.formType == 2){
                util.each(this.left, function(left){
                    util.each(this.right, function(right){
                        this.addLink(left.id, right.id);
                    }, this);
                }, this);
            }
            return item;
        },
        /**
         * 删除链接点
         * @param  {Number} id   要删除的链接点ID
         * @param  {String} side 删除的位置, left - 左边, right - 右边
         * @return {Bool}      返回删除状态
         */
        remove: function(id, side){
            side = (side == 'left');
            var list = side ? this.left : this.right;
            var set  = side ? this.left_set : this.right_set;

            // 删除对应的链接
            if (side){
                this.removeLink(id, 0);
            }else {
                this.removeLink(0, id);
            }

            // 删除节点
            var len=list.length, dy=0, item, y;
            function update_link(link){
                if (side){
                    link.path[1] -= dy;
                    link.path[3] -= dy;
                }else {
                    link.path[5] -= dy;
                    link.path[7] -= dy;
                }
                this.setLine(link.line, link.path);
            }
            for (var i=0; i<list.length; i++){
                item = list[i];
                if (item.id == id){
                    list.splice(i,1);
                    set.exclude(item.holder);
                    item.holder.remove();
                    set.exclude(item.trigger);
                    item.trigger.remove();
                    set.exclude(item.text);
                    item.text.remove();
                    set.exclude(item.mask);
                    item.mask.remove();
                    dy += this.config.item_height;
                    i--;
                }else if (dy){
                    item.posY -= dy;
                    y = item.posY;
                    item.holder.attr('cy', y);
                    item.trigger.attr('cy', y);
                    item.mask.attr('cy', y);
                    item.text.attr('y', y);
                    item.text.attr('text', i+1);

                    // 同步修改连线坐标
                    util.each(item.lines, update_link, this);
                }
            }
            return (len - i);
        },
        /**
         * 删除关系链接
         * @param  {Number} left_id  左边节点的节点ID
         * @param  {Number} right_id 右边节点的节点ID
         * @return {None}          无返回
         */
        removeLink: function(left_id, right_id){
            // 删除左边的节点
            if (right_id){
                util.each(this.left, function(item){
                    if ((!left_id || item.id == left_id) && item.lines[right_id]){
                        var link = item.lines[right_id];
                        if (link.line){
                            link.line.remove();
                            link.line = null;
                        }
                        item.lines[right_id] = null;
                        delete(item.lines[right_id]);
                    }
                });
            }

            // 删除右边的节点
            if (left_id){
                util.each(this.right, function(item){
                    if ((!right_id || item.id == right_id) && item.lines[left_id]){
                        var link = item.lines[left_id];
                        if (link.line){
                            link.line.remove();
                            link.line = null;
                        }
                        item.lines[left_id] = null;
                        delete(item.lines[left_id]);
                    }
                });
            }

            this.delete_tip.hide();
        },
        /**
         * 添加关系连接
         * @param {Number} left_id  左边关联ID
         * @param {Number} right_id 右边关联ID
         */
        addLink: function(left_id, right_id){
            var left = util.find(this.left, left_id, 'id');
            var right = util.find(this.right, right_id, 'id');

            if (!left || !right){
                return false;
            }
            if (left.lines[right_id] && right.lines[left_id]){
                // 已经存在该关系
                return true;
            }

            var xl = left.trigger.attr('cx');
            var yl = left.posY + this.left_pos;
            var xr = right.trigger.attr('cx');
            var yr = right.posY + this.right_pos;
            var xm = this.config.width / 2;

            var link = {
                path: [xl,yl,xm,yl,xm,yr,xr,yr],
                line: this.page.path('M0,0'),
                left_pos: this.left_pos,
                right_pos: this.right_pos
            };
            this.setLine(link.line, link.path);

            link.line.toBack();
            link.line.hover(this.lineEvent, this.lineEvent, this, this);
            link.line.mousemove(this.lineEvent, this);
            link.line.dblclick(this.lineEvent, this);
            link.line.mousedown(this.noEvent);
            link.line.attr(this.config.line_attr);
            link.line.attr('cursor', 'pointer')
            link.line.data('left', left_id);
            link.line.data('right', right_id);

            left.lines[right_id] = link;
            right.lines[left_id] = link;

            // 有关联存在, 移除提示信息
            if (this.doms.linktip) { this.doms.linktip.hide(); }
        },
        /**
         * 设置滚动位置
         * @param  {String} side 要滚动的位置, left - 左边, right - 右边
         * @param  {Number} pos  滚动的偏移位置
         * @return {None}      无返回
         */
        scroll: function(side, pos){
            switch(side){
                case 'left':
                    this.left_pos = pos;
                    break;
                case 'right':
                    this.right_pos = pos;
                    break;
                default:
                    return false;
            }
            this.doScroll(side);
            return true;
        },
        /**
         * 滚动功能执行函数 <私有> 更新链接线的位置
         * @param  {String} side 要滚动的位置, left - 左边, right - 右边
         * @return {None}      无返回
         */
        doScroll: function(side){
            side = (side == 'left');
            var set = side ? this.left_set : this.right_set;
            var pos = side ? this.left_pos : this.right_pos;
            var list = side ? this.left : this.right;

            set.transform('t0,'+pos);

            // 更新线条位置
            util.each(list, function(item){
                util.each(item.lines, function(link){
                    var dpos;
                    if (side){
                        dpos = pos - link.left_pos;
                        link.left_pos = pos;
                        link.path[1] += dpos;
                        link.path[3] += dpos;
                    }else {
                        dpos = pos - link.right_pos;
                        link.right_pos = pos;
                        link.path[5] += dpos;
                        link.path[7] += dpos;
                    }
                    this.setLine(link.line, link.path);
                },this);
            },this);
        },
        /**
         * <私有> 更新连接线的绘图位置
         * @param {Object} line 要更新的线条对象
         * @param {Array} p    要更新的线条参数
         */
        setLine: function(line, p){
            var path = 'M'+p[0]+','+p[1]+'C'+p[2]+','+p[3]+','+p[4]+','+p[5]+','+p[6]+','+p[7];
            line.attr('path', path);
        },
        /**
         * <私有> 拖动头线段跟随图像位置
         * @param  {Number} x 相对画布的绝对X位置坐标
         * @param  {Number} y 相对画布的绝对Y位置坐标
         * @return {None}   无返回
         */
        updateLine: function(x, y){
            var i = this.dragInfo;
            i.elm.attr('cx', x);
            i.elm.attr('cy', y - i.item_pos);
            i.path[2] = (x + i.x)/2;
            i.path[4] = i.path[2];
            i.path[5] = y;
            i.path[6] = x;
            i.path[7] = y;
            this.setLine(i.line, i.path);
        },
        /**
         * 关联点拖动事件处理函数
         */
        dragStart: function(x, y, evt){
            if (this.dragInfo){
                return false;
            }
            var elm = this.page.getByTarget(evt.target);
            var side = elm.attr('cx') > this.config.width/2;
            var index = elm.data('index');
            var item = util.find(side ? this.right : this.left, index, 'id');
            var pos = side ? this.right_pos : this.left_pos;

            if (!item) { return false; }
            var point = item.trigger;
            var offset = this.doms.body.offset();

            var i = this.dragInfo = {
                elm: point.toFront(),
                line: this.page.path('M0,0'),
                path: null,
                item: item,
                item_pos: pos,
                target: null,
                target_pos: (side ? this.left_pos : this.right_pos),
                x: point.attr('cx'),
                y: point.attr('cy') + pos,
                dx: evt.pageX - offset.left,
                dy: evt.pageY - offset.top,
                side: side
            };
            i.path = [i.x, i.y, i.x, i.y, i.x, i.y, i.x, i.y];
            i.line.attr(this.config.line_attr);
            item.lines.drag = {
                path: i.path,
                line: i.line,
                left_pos: this.left_pos,
                right_pos: this.right_pos
            };

            this.updateLine(i.dx, i.dy);

            // 开始拖动, 移除提示框
            if (this.doms.linktip) { this.doms.linktip.hide(); }
        },
        dragMove: function(dx, dy){
            var i = this.dragInfo;
            var c = this.config;

            if (!i){ return false; }

            var x = i.dx + dx, y = i.dy + dy;
            if (!i.target){
                this.updateLine(x,y);
            }

            var inx = i.side ? x: c.width - x;
            inx = (inx > c.offset && inx < c.offset + 2 * (c.radius + c.stroke_width));
            var iny = (y - i.target_pos) % c.item_height;
            iny = (iny > c.item_height/2 - c.radius && iny < c.item_height/2 + c.radius);
            i.target = null;

            if (inx && iny){
                inx = Math.floor((y-i.target_pos)/c.item_height);
                iny = i.side ? this.left : this.right;
                if (iny[inx]){
                    var item = iny[inx];
                    if (!i.target || i.target !== item){
                        i.target = item;
                        x = item.holder.attr('cx') + (i.side ? c.radius : -c.radius);
                        this.updateLine(x, item.holder.attr('cy') + i.target_pos);
                    }
                }
            }
        },
        dragEnd: function(){
            var i = this.dragInfo;
            this.dragInfo = null;
            i.elm.attr('cx', i.x);
            i.elm.attr('cy', i.y - i.item_pos);
            i.item.mask.toFront();

            if (i.target && !i.target.lines[i.item.id] && !i.item.lines[i.target.id]){
                // 有目标, 建立联系
                // 绑定线条事件
                i.line.toBack();
                i.line.hover(this.lineEvent, this.lineEvent, this, this);
                i.line.mousemove(this.lineEvent, this);
                i.line.dblclick(this.lineEvent, this);
                i.line.mousedown(this.noEvent);
                i.line.attr('cursor', 'pointer')
                i.line.data('left', i.side ? i.target.id : i.item.id);
                i.line.data('right', i.side ? i.item.id : i.target.id);

                var link = i.item.lines.drag;
                i.item.lines[i.target.id] = link;
                i.target.lines[i.item.id] = link;

                if (i.side){
                    // 右边拖拽，交换坐标点
                    link = link.path;
                    var j = link[0];
                    link[0] = link[6]; link[6] = j;
                    j = link[1];
                    link[1] = link[3] = link[7];
                    link[5] = link[7] = j;
                }
            }else {
                i.line.remove();
            }
            // 没有目标，或者关系已存在，删除连接
            i.item.lines.drag = null;
            delete(i.item.lines.drag);
        },
        /**
         * 连线操作事件处理函数
         * @param  {[type]} evt [description]
         * @return {[type]}     [description]
         */
        lineEvent: function(evt){
            if (this.dragInfo || this.config.formType == 2){
                return false;
            }
            var line = this.page.getByTarget(evt.target);
            if (!line){
                return false;
            }
            var c = this.config, tip = this.delete_tip;
            switch (evt.type){
                case 'mousemove':
                    tip.animate({'transform': 't'+evt.offsetX+','+evt.offsetY}, 100);
                    break;
                case 'mouseover':
                    tip.transform('t'+evt.offsetX+','+evt.offsetY).show();
                    line.attr({
                        "stroke": '#f00',
                        "stroke-width": 5
                    });
                    break;
                case 'mouseout':
                    line.attr(c.line_attr);
                    tip.hide();
                    break;
                case 'dblclick':
                    this.removeLink(line.data('left'), line.data('right'));
                    return false;
            }
        },
        /**
         * 线条鼠标事件拦截函数
         */
        noEvent: function(evt){
            if (evt.preventDefault) {evt.preventDefault();}
            evt.cancelBubble = true;
            return false;
        },
        eventClickTip: function(evt){
            //若勾选了‘不再提醒’，则设置cookies
            if($(this.$checkbox).prop("checked")){
                app.cookie("notRemind",true,365);
            }
            this.doms.linktip.hide();
        }
    });

    /**
     * 代理活动表格
     */
    function FormAgent(config, parent){
        config = $.extend({
            channelType: 2, // 代理活动
            modules: [
                {name:'info', title:LANG('活动信息'), creator:InfoAgent},
                {name:'channel', title:LANG('选择广告位'), creator:ChannelAgent},
                {name:'game', title:LANG('选择产品'), creator:GameForm, config:{limit:1, sweety_limit:1}}
            ]
        }, config);

        FormAgent.master(this, null, config);
    }
    extend(FormAgent, Form, {
        /**
         * 保存按钮点击事件回调函数
         * @param  {Object} ev 事件变量对象
         * @return {Bool}    返回false阻止事件冒泡
         */
        onStepSave: function(ev){
            var data = this.getData();
            if (data.Name === ''){
                app.alert(LANG('请先设置活动的名称'));
                this.step.setStep(0);
                return false;
            }
            if (data.StartTime === ''){
                app.alert(LANG('请设置一个活动开始日期'));
                this.step.setStep(0);
                return false;
            }
            // 检查广告形式和广告位
            if (data.AdType != 1 && data.AdType != 2){
                app.alert(LANG('请先选择广告形式'));
                this.step.setStep(1);
                return false;
            }
            if (data.AdPositions.length <= 0){
                app.alert(LANG('请先选择一个或多个广告位'));
                this.step.setStep(1);
                return false;
            }
            // 检查产品数量
            if (data.Products.length <= 0){
                app.alert(LANG('请先选择一个游戏产品'));
                this.step.setStep(2);
                return false;
            }
            // 检查产品的创意和落地页
            var ret = util.each(data.Products, function(game){
                if ((data.AdType != 2 && game.Sweetys.length === 0) || game.WhiskyCreatives.length === 0){
                    return false;
                }
            });
            if (ret !== null){
                app.alert(LANG('请设置每个游戏产品的创意包和落地页'));
                this.step.setStep(2);
                return false;
            }
            this.loading.show();
            // 资料数据正常, 提交保存数据
            app.core.get("platform").updateTitle(data.Name,true);
            app.data.put('/rest/addcampaign', data, this, 'onSave');
            this.step.disableSaveBtn();
            return false;
        },
        onSave: function(err, data){
            if(this.loading){
                this.loading.hide();
            }
            this.step.enableSaveBtn();
            if (err){
                app.alert(err.message);
                return false;
            }
            this.hide();
            if (window.opener && window.opener.app){
                window.opener.app.core.cast('saveCampaignSuccess', {"id": data._id});
            }

            // 调用余额模块刷新余额信息
            app.core.get("balance").fetch();

            var msg = this.child('saveNotify');
            if (msg){
                msg.show();
            }else {
                var section = this.create('saveNotify', form.successSection, {
                    'target': this.config.target,
                    'class': 'M-formSectionSaveMore',
                    'title': LANG('保存成功!'),
                    'desc': LANG('您所添加的广告活动已成功保存，您需要复制下面的代码并投放到相应的媒体广告位。'),
                    'list_title': LANG('提示说明：'),
                    'list': [
                        LANG('建议跟踪各产品的创意和落地页效果，并不断调整优化。'),
                        LANG('建议跟踪各渠道、各媒体及各广告位效果，并及时调整广告投放策略。')
                    ]
                });
                var con = section.getContainer();

                this.create('code', CampaignCode, {target: con, param:{Id: data._id}});

                con = $('<div class="P-campaignFormSaveAction" />').appendTo(con);
                if (!this.data) {
                    this.data = {};
                }
                $('<input type="button" data-step="list" class="btnBigGray2" />').val(LANG('返回活动列表')).appendTo(con);
                $('<input type="button" data-step="add" class="btnBigGray2" />').val(LANG('继续添加活动')).appendTo(con);
                $('<input type="button" data-step="edit" class="btnBigGray2" />').val(LANG('继续编辑活动')).appendTo(con);
                $('<input type="button" data-step="close" class="btnBigGray2" />').val(LANG('关闭当前窗口')).appendTo(con);

                this.dg(con, 'input', 'click', 'eventAfterSave');
            }
            if(!this.data){
                this.data = {};
            }
            this.data.Id = data._id;
            return false;
        },
        /**
         * 广告形式修改
         */
        onChangeAdType: function(ev){
            var data = this.$.channel.getData();
            this.$.game.setAdType(+data.type);
            return false;
        },
        onChangeAgentChannel: function(){
            return false;
        },
        /**
         * 添加广告位列表
         */
        onAddAdPosition: function(ev){

        },
        /**
         * 删除广告位列表
         */
        onRemoveAdPosition: function(ev){

        }
    });
    exports.formAgent = FormAgent;

    // 另存为
    var SaveAsForm = app.extend(
        Form
        ,{
            init:function(config){
                config = $.extend(
                    {}
                    ,config
                );
                SaveAsForm.master(this,null,config);
                SaveAsForm.master(this,"init",[config]);

                // 隐藏复制活动
                this.info.$.sectionBase.doms.addon.hide();
            }
            ,eventAfterSave: function(evt, elm){
                var step = $(elm).attr('data-step');
                switch (step){
                    case 'close':
                        window.close();
                        break;
                    case 'add':
                        app.navigate('campaign/create');
                        break;
                    case 'list':
                        app.navigate('campaign');
                        break;
                    case 'edit':
                        var id = this.data.Id;
                        this.reset();
                        app.navigate("campaign/edit/"+id+'?BidType='+this.config.bidType);
                        break;
                    case 'saveAs':
                        window.open('#campaign/saveas/'+this.data.Id+"?Channel="+this.config.channelType+'&BidType='+this.config.bidType);
                        return false;
                    default:
                        return false;
                }
                this.$.saveNotify.hide();
            }
        }
    );
    exports.saveAsForm = SaveAsForm;

    var SaveAsFormAgent = app.extend(
        FormAgent
        ,{
            init:function(config){
                config = $.extend(
                    {}
                    ,config
                );
                SaveAsFormAgent.master(this,null,config);
                SaveAsFormAgent.master(this,"init",[config]);

                // 隐藏复制活动
                this.info.$.sectionBase.doms.addon.hide();
            }
            ,eventAfterSave: function(evt, elm){
                var step = $(elm).attr('data-step');
                switch (step){
                    case 'close':
                        window.close();
                        break;
                    case 'add':
                        app.navigate('campaign/create');
                        break;
                    case 'list':
                        app.navigate('campaign');
                        break;
                    case 'edit':
                        var id = this.data.Id;
                        this.reset();
                        app.navigate("campaign/agentEdit/"+id);
                        break;
                    default:
                        return false;
                }
                this.$.saveNotify.hide();
            }
        }
    );
    exports.saveAsFormAgent = SaveAsFormAgent;

    var SaveAsFormMobile = app.extend(
        FormMT
        ,{
            init:function(config){
                config = $.extend(
                    {}
                    ,config
                );
                SaveAsFormMobile.master(this,null,config);
                SaveAsFormMobile.master(this,"init",[config]);

                // 隐藏复制活动
                this.info.$.sectionBase.doms.addon.hide();
            }
            ,eventAfterSave: function(evt, elm){
                var step = $(elm).attr('data-step');
                switch (step){
                    case 'close':
                        window.close();
                        break;
                    case 'add':
                        app.navigate('campaign/create');
                        break;
                    case 'list':
                        app.navigate('campaign');
                        break;
                    case 'edit':
                        var id = this.data.Id;
                        this.reset();
                        app.navigate("campaign/MTEdit/"+id);
                        break;
                    case 'saveAs':
                        window.open('#campaign/saveas/'+this.data.Id+"?Channel="+this.config.channelType);
                        return false;
                    default:
                        return false;
                }
                this.$.saveNotify.hide();
            }
        }
    );
    exports.saveAsFormMobile = SaveAsFormMobile;


    /**
     * 复制广告位代码
     */
    function CampaignCode(config, parent){
        config = $.extend(true, {
            'class': 'P-campaignCode',
            'target': parent,
            'url': '/rest/listcampaigncode',
            'param': null
        }, config);

        CampaignCode.master(this, null, config);
        this.$data = null;
        this.$ready = false;
    }
    extend(CampaignCode, view.container, {
        init: function(){
            this.render();
            tpl.load('campaign', this.build, this);
            this.load();

            this.dg(this.el, 'button.download', 'click', 'eventDownload');
            this.dg(this.el, '.copy a', 'mouseenter', 'eventCopy');
        },
        eventDownload: function(evt, elm){
            var c = this.config;
            var url = app.data.resolve(c.url, $.extend({tmpl: 'export'}, c.param));
            window.open(url);
        },
        eventCopy: function(evt, elm){
            var a = $(elm);
            var td = a.parent().prev();
            var url = td.find('span').text();
            util.clip(url, a, this.copyComplete, this);
            return false;
        },
        copyComplete: function(){
            app.alert(LANG('复制成功'));
        },
        build: function(){
            this.$ready = true;
            if (this.$data){
                this.buildItem();
            }
        },
        buildItem: function(){
            if (this.$ready){
                tpl.set('list', this.$data);
                tpl.appendTo(this.el, 'campaign/campaign_code_list');
            }
        },
        reset: function(){
            this.el.empty();
            CampaignCode.master(this, 'reset');
        },
        setData: function(data){
            this.reset();
            this.$data = data;
            this.build();
        },
        load: function(param){
            this.showLoading();
            var c = this.config;
            if (param){
                c.param = util.merge(c.param, param);
            }
            app.data.get(c.url, c.param, this);
        },
        onData: function(err, data){
            this.hideLoading();
            // @todo 就算没数据也要显示表格
            if(err){
                this.el.empty();
                tpl.set('error', err);
                tpl.appendTo(this.el, 'campaign/campaign_code_list_empty');
                return false;
            }
            // 转换数据
            var list = {};
            util.each(data.items, function(item){
                item.AdType = data.campaign.AdType;
                if (!list[item.MassMediaName]){
                    list[item.MassMediaName] = [item];
                }else {
                    list[item.MassMediaName].push(item);
                }
            });
            this.setData(list);
        },
        showLoading: function(){
            if (this.$ && this.$.loading){
                this.$.loading.show();
            }else {
                this.create('loading', common.loadingMask, {target: "body"});
            }

        },
        hideLoading: function() {
            if (this.$.loading){
                this.$.loading.hide();
            }
        }
    });
    exports.campaignCode = CampaignCode;


    /**
     * 代理活动表单 - 活动信息
     */
    function InfoAgent(config, parent){
        config = $.extend({
            'class': 'P-campaignFormInfo',
            'target': parent
        }, config);
        InfoAgent.master(this, null, config);
    }
    extend(InfoAgent, view.container, {
        init: function(){
            this.render();

            // 基本信息
            var section = this.create('sectionBase', form.section, {
                'title': LANG('基本信息')
            });
            var con = section.getContainer();

            this.layout = this.create(
                "layout"
                ,view.layout
                ,{
                    "target":con
                    ,"grid":[2,1]
                    ,"cellSet":[{"class":"P-pageCon"},{"class":"P-pageCon"}]
                }
            );
            var nameCon = this.create('nameLayout', view.itemLayout,{
                'target':this.layout.get(0).el,
                'label': LANG('活动名称：'),
                'suffix': true,
                'tips': LANG('如果活动设置跟已有活动相似，可以通过复制、修改的方式新建活动。')
            });

            $('<input type="button" class="btn primary" id="COPY_CAMPAIGN" value="'+LANG("从现有活动中复制")+'" />').appendTo(nameCon.getSuffix());

            this.name = this.create(
                'name', form.input,
                {
                    "label": null
                    ,"width":400
                    ,"target": nameCon.getContainer()
                }
            );

            var dateCon = this.create('dateLayout', view.itemLayout,{
                'target':this.layout.get(1).el,
                'label': LANG('投放日期：')
            });
            this.date = this.create(
                'date', form.dateRange,
                {
                    target: dateCon.getContainer(),
                    start: util.date('Y-m-d'),
                    label: null
                }
            );

            section = this.create('sectionOther', form.section, {
                'title': LANG('其他设定')
            });
            con = section.getContainer();

            this.tags = this.create(
                'tags', taglabels.base,
                {
                    'target': con,
                    'class':'M-formItem',
                    'label': LANG('活动标签：'),
                    'tips': LANG('给活动贴上标签，方便管理。多个标签用“,”分开'),
                    'type': 'CampaignLabel',
                    'all': true,
                    "collapse":0
                }
            );
        },
        setData: function(data){
            if(data.Id){
                app.core.get("platform").setPlatform(0,data.Id+' '+data.Name,null,'editing');
            }
            this.name.setData(data.Name || '');
            this.date.setData({start: data.StartTime, end: data.EndTime});
            // this.impression.setData(data.EstImpression);
            // this.click.setData(data.EstClick);
            // this.budget.setData(data.Budget || '0.00');
            this.tags.refresh();
            this.tags.setData(data.Label);
            // this.character.setData(data.Character);
        },
        getData: function(){
            var d = this.date.getData();
            var ret = {
                Channel: 2, // 代理活动类型
                Name: this.name.getData(),
                StartTime: d.start,
                EndTime: d.end || 0,
                // EstImpression: this.impression.getData('int'),
                // EstClick: this.click.getData('int'),
                // Budget: this.budget.getData('float'),
                Label: this.tags.getData()
                // Character: this.character.getData()
            };
            return ret;
        },
        reset: function(){
            this.name.setData(app.util.date(LANG('新建活动_YmdHis')));
            this.date.setData({start: util.date('Y-m-d')});
            // this.impression.setData();
            // this.click.setData();
            // this.budget.setData('0.00');
            this.tags.refresh();
            this.tags.setData();
            // this.character.reset();
        }
    });
    exports.infoAgent = InfoAgent;

    /**
     * 代理活动表单 - 广告位
     */
    function ChannelAgent(config, parent){
        config = $.extend({
            'class': 'P-campaignFormPosition'
        }, config);
        ChannelAgent.master(this, null, config);

        // 广告位记录
        this.$data = [];
    }
    extend(ChannelAgent, view.container, {
        init: function(){
            this.render();

            // 基本信息
            var section = this.create('sectionBase', form.section, {
                'title': LANG('选择广告位'),
                'desc': LANG('选择需要投放的媒体广告位，以便跟踪分析各媒介平台的效果。')
            });
            var con = section.getContainer();

            this.layout = this.create(
                "layout"
                ,view.layout
                ,{
                    "target":con
                    ,"grid":[3,1]
                    ,"cellSet":[{"class":"P-pageCon"},{"class":"P-pageCon"},{"class":"P-pageCon adsPositionToFixWidth"}]
                }
            );

            var adTypeCon = this.create('adTypeLayout', view.itemLayout,{
                'target':this.layout.get(0).el,
                'label': LANG('广告形式：')
            });

            this.create('type', form.buttonGroup, {
                'target': adTypeCon.getContainer(),
                'label': null,
                'items': {
                    1:LANG('硬广'),
                    2:LANG('弹窗')
                },
                "selected":1
            });

            var channelCon = this.create('channelLayout', view.itemLayout,{
                'target':this.layout.get(1).el,
                'label': LANG('渠道：'),
                'tips': LANG('广告位所属的渠道，若没有，请先“添加广告位”。')
            });

            this.create('channel', form.dropdown, {
                'target': channelCon.getContainer(),
                'label': null,
                'width': 300,
                'option_render': this.renderOptionItem,
                'url': '/rest/listadsubchannel',
                'param': {no_stastic_data:1, no_limit:1}
            });

            // 排除控件
            // var doms = this.doms = {};
            // doms.exclude = $('<label class="exclude"><input type="checkbox" /> '+LANG("排除选中的广告位")+'</label>');
            // doms.exclude = doms.exclude.appendTo(con).children('input');

            var tableCon = $('<div class="tableLayout"><label>'+LANG('广告位：')+'</label><div class="wrap"></div></div>').appendTo(this.layout.get(2).el);

            var table = require('grid/table');
            this.create('list', table.list, {
                target: $('<div class="list"/>').appendTo(tableCon.find(".wrap")),
                cols:[
                    {type:'id', width:80},
                    // {name:'channel', text:'渠道', format:'formatItemName'},
                    {name:'MassMediaName', text:'媒体', align:'left'},
                    {name:'ads_name', align:'left'},
                    {type:'op', width:50, html:'<a href="#" data-op="remove">删除</a>'}
                ],
                opClick: true,
                default_sort: false,
                emptyText: LANG('请选择添加广告位')
            });

            var addBtn = $('<input type="button" class="btn" value="'+LANG("添加广告位")+'" />').appendTo(tableCon.find(".wrap"));

            this.create('select', popwin.selectAdPosition, {
                'param': {AdChannelId: 2}
            });

            this.jq(addBtn, 'click', 'eventSelectPosition')
        },
        /**
         * 下拉框渲染回调函数
         */
        renderOptionItem: function(id, opt, dom){
            var url = opt.Url && opt.Url.replace(/^http[s]?:\/\//i, '') || '';
            url = url.split('/').shift();
            $('<em style="float:right"/>').text(url).appendTo(dom);
            $('<b/>').text(opt.Name).appendTo(dom);
        },
        /**
         * 选择广告位按钮事件
         */
        eventSelectPosition: function(){
            var type = this.$.type.getData();
            if (type === null){
                app.alert(LANG('请先选择广告形式.'));
                return false;
            }
            var channel = this.$.channel.getData();

            this.$.select.setParam({
                AdShowTypeEx: type,
                AdSubChannelId: channel
            });
            this.$.select.show();
        },
        /**
         * 添加广告位
         * @param  {Object} ev 消息变量对象
         * @return {None}    无返回, 不连接消息, 上层Form需要处理
         */
        onAddPosition: function(ev){
            var data = ev.param;
            data.media = {'Name': data.MassMediaName};

            var index = util.index(this.$data, data._id, 'Id');
            if (index === null){
                this.$data.push({
                    'Id': data._id,
                    'position': data
                });
                this.$.list.addRow(data);
            }else {
                this.$data[index].position = data;
                this.$.list.setRowByField(data);
            }
            this.send(this.parent(), 'addAdPosition', data);
            return false;
        },
        onResetSpotChannel: function(ev){
            this.$data.splice(0, this.$data.length);
            this.$.list.setData([]);
            this.$.channel.setData(ev.param);
            this.$.channel.load();
            this.fire('changeAgentChannel', ev.param.option);
        },
        /**
         * 取消广告位
         * @param  {Object} ev 消息变量对象
         * @return {None}    无返回, 不连接消息, 上层Form需要处理
         */
        onRemovePosition: function(ev){
            this.removePosition(ev.param, true);
            return false;
        },
        /**
         * 切换广告形式
         * @return {Boolean} 返回false阻止事件冒泡
         */
        onChangeButton: function(ev){
            if (this.$data.length <= 0 || confirm(LANG('切换广告形式, 将会丢失当前广告位设置信息. 要确认切换吗?'))){
                var type = +ev.param.selected;
                this.$data.splice(0, this.$data.length);
                this.$.list.setData([]);
                this.$.select.setSelected();
                this.fire('changeAdType', type);
            }else {
                this.$.type.setData(ev.param.last);
            }
            return false;
        },
        /**
         * 切换不同渠道时的事件
         */
        onOptionChange: function(ev){
            var param = ev.param;
            if (this.$data.length <= 0 || confirm(LANG('切换渠道, 将会丢失当前广告位设置信息. 要确认切换吗?'))){
                this.$data.splice(0, this.$data.length);
                this.$.list.setData([]);
                this.$.select.setSelected();
                this.fire('changeAgentChannel', param.option);
            }else {
                this.$.channel.setData(param.last);
            }
            return false;
        },
        /**
         * 广告位列表操作事件
         */
        onListOpClick: function(ev){
            this.removePosition(ev.param.data);
            return false;
        },
        /**
         * 移除指定的广告位记录
         * @param  {Object} position 广告位记录对象
         * @return {None}            无返回
         */
        removePosition: function(position, skipUpdatePopwin){
            this.$.list.removeRowByValue(position._id);
            util.remove(this.$data, position._id, 'Id');
            this.send(this.parent(), 'removeAdPosition', position);
            if (!skipUpdatePopwin){
                this.$.select.removeSelect(position._id);
            }
        },
        /**
         * 设置广告位信息
         * @param {Number} channelType <预留> 兼容RTB广告位渠道
         * @param {Array}  positions   广告位数组
         * @param {Number} adType      广告形式类型
         */
        setData: function(data){
            var positions = data.positions,
                adType = data.type,
                channel = data.channel;

            this.reset();
            // 广告形式
            if (adType){
                this.$.type.setData(adType);
            }

            // 广告渠道
            if (channel){
                this.$.channel.setData(channel);
            }

            // 排除广告位选项
            // this.doms.exclude.prop('checked', data.isExclude);

            // 拉取广告位资料
            if (positions && positions.length){
                var list = [];
                util.each(positions, function(ad){
                    list.push(ad.Id);
                });
                app.data.get(
                    '/rest/listadposition',
                    {
                        Ids: list.toString(),
                        AdChannelId: 2,
                        InfoMore: 1
                    },
                    this
                );
                this.$.select.setSelected(list);
            }
        },
        /**
         * 拉取广告位详细资料回调函数
         */
        onData: function(err, data){
            if (err){
                app.alert(err.message);
                return false;
            }
            util.each(data.items, function(pos){
                pos.channel = {'Name': pos.AdSubChannelName};
                pos.media = {'Name': pos.MassMediaName};
                this.$.list.addRow(pos);
                this.$data.push({
                    'Id': pos._id,
                    'position': pos
                });
            }, this);
        },
        /**
         * 获取广告位列表和广告形式
         */
        getData: function(){
            var list = [];
            util.each(this.$data, function(ad){
                list.push({'Id': ad.Id});
            });

            return {
                'channel': this.$.channel.getData(),
                'positions': list,
                'type': this.$.type.getData(),
                'isExclude': false // this.doms.exclude.prop('checked')
            };
        },
        /**
         * 重置模块
         */
        reset: function(){
            this.$.type.setData(1);
            this.$.channel.setData(null);
            this.$.list.setData([]);
            this.$.select.setSelected();
            this.$data.splice(0, this.$data.length);
            // this.doms.exclude.prop('checked', false);
        },
        /**
         * 获取广告位资料列表
         */
        getList: function(){
            return this.$.list.getData();
        }
    });
    exports.channelAgent = ChannelAgent;

    /**
     * 直投活动表格
     */
    function FormDirect(config, parent){
        config = $.extend({
            channelType: 3,
            modules: [
                {name:'info', title:LANG('活动信息'), creator:InfoAgent},
                {name:'channel', title:LANG('选择媒体'), creator:ChannelRtb},
                {name:'game', title:LANG('选择产品'), creator:GameForm},
                {name:'scale', title:LANG('分配流量'), creator:ScaleForm}
            ]
        }, config);
        FormDirect.master(this, null, config);
    }
    extend(FormDirect, Form);
    exports.formDirect = FormDirect;

    /**
     *详情页面-日程设置-表格
     */
    function CampaignScheduleTable(config) {
        CampaignScheduleTable.master(this, null, config);
    }
    extend(
        CampaignScheduleTable
        ,form.scheduleTable
        ,{
            init: function() {
                CampaignScheduleTable.master(this, "init");
            },
            // 禁用所以事件响应
            eventRange: function(evt, elm){
            },
            eventAllDay: function(evt, elm){
            },
            eventToggle: function(evt, elm){
            }
        }
    );

    /**
     *  详情页面-日程设置
     */
    function CampaignSchedule(config) {
        config = $.extend({
            'option': [LANG('全天候展示广告'), LANG('指定时间')],
            'selected': null
        }, config);
        CampaignSchedule.master(this, null, config);
    }
    extend(
        CampaignSchedule
        ,form.radio
        ,{
            init: function() {
                var c = this.config;
                CampaignSchedule.master(this,'init');
                this.container = $('<div class="M-formSchedule" />').appendTo(this.el);
                this.table = this.create(
                    'table', CampaignScheduleTable,
                    {target: this.container, selected: c.selected}
                );

                this.jq(this.list[0], 'change', 'changeStatue');
                this.jq(this.list[1], 'change', 'changeStatue');
                this.changeStatue();
            },
            changeStatue: function(evt){
                var checked = this.list[1].prop('checked');
                this.container.toggle(checked);
            },
            setData: function(data){
                if (!data || data.Type !== 2){
                    this.list[0].click();
                    this.$.table.setData();
                }else {
                    this.$.table.setData(data.DayHour);
                    this.list[1].click();
                }
            },
            getData: function(){
                var data = {
                    Type: (this.list[0].prop('checked') ? 1 : 2),
                    DayHour: this.$.table.getData()
                };
                return data;
            },
            disable: function() {
                this.list[0].prop("disabled","disabled");
                this.list[1].prop("disabled","disabled");
            }
        }
    );

    /**
     *  详情页面-投放地区-国家
     */
    function CampaignCountry(config) {
        CampaignCountry.master(this, null, config);
    }
    extend(CampaignCountry, country.base, {
        init: function() {
            CampaignCountry.master(this, "init");
        }
    });

    /**
     *  详情页面-投放地区
     */
    function CampaignZone(config) {
        config = $.extend({
            'option': [LANG('不限'), LANG('选择地区')],
            'selected': null
        }, config);
        CampaignZone.master(this, null, config);
    }
    extend(
        CampaignZone
        ,form.radio
        ,{
            init: function(){
                var c = this.config;
                CampaignZone.master(this,'init');
                this.container = $('<div class="M-formCountry" />').appendTo(this.el);
                this.country = this.create(
                    'country', CampaignCountry,
                    {target: this.container, selected: c.selected, callback: function() {
                        $("input", this.head).prop("disabled", true);
                        $("input", this.body).prop("disabled", true);
                    }}
                );

                this.jq(this.list[0], 'change', 'changeStatue');
                this.jq(this.list[1], 'change', 'changeStatue');
                this.changeStatue();
            },
            changeStatue: function(evt){
                var checked = this.list[1].prop('checked');
                this.container.toggle(checked);
            },
            setData: function(data){
                if (!data || !data.length){
                    this.list[0].click();
                }else if(data && data.length){
                    this.country.setData(data);
                    this.list[1].click();
                }
            },
            getData: function(){
                if (this.list[0].prop('checked')){
                    return [];
                }else if(this.list[1].prop('checked')){
                    return this.country.getData();
                }
            },
            disable: function() {
                this.list[0].prop("disabled","disabled");
                this.list[1].prop("disabled","disabled");
            }
        }
    );

    /**
     *  详情页面-产品流量
     */
    function CampaignProductScale(config, parent){
        config = $.extend({
            'class': 'P-campaignDetailProductScale',
            'target': parent
        }, config);
        CampaignProductScale.master(this, null, config);
    }
    extend(CampaignProductScale, view.container, {
        init: function(){
            this.render();

            // 产品比例分配
            var section = this.create('sectionRatio', form.section, {
                'title': LANG('流量分配')
            });
            this.create('scale', form.scale, {
                target: section.getContainer(),
                height:150,
                disabled:true
            });
        },
        addGame: function(game){
            this.$.scale.add({
                id: game.id,
                text: game.text,
                value: game.value,
                data: game
            });
        }
    });

    /**
     *  详情页面-产品列表
     */
    function CampaignProducts(config) {
        config = $.extend({
            'class': 'P-campaignDetailProductContainer'
        }, config);
        this.data = config.data;
        this.database = "/rest/listproduct";
        CampaignProducts.master(this, null, config);

        // isButt：是否已和DSP对接
        var userData = app.getUser();
        this.$isButt = userData && userData.campany && userData.campany.IsButt;
    }
    extend(CampaignProducts, view.container, {
        init: function() {
            this.doms = {};
            this.items = [];
            this.products = this.data.Products;
            this.whiskys = [];
            this.sweetys = [];
            tpl.load('campaign', this.build, this);
        },
        /**
         * 构造函数
         * @return {Undefined} 无
         */
        build: function() {
            this.render();
            var sectionProducts = this.create('sectionProducts', form.section, {
                'title': LANG('关联产品'),
                'target': this.el
            });
            var con = sectionProducts.getContainer();
            con.after('<i class="clearBox"></i>');

            tpl.appendTo(con, 'campaign/detail_product_list');
            this.doms.body = con.find('.P-campaignDetailProductBody');

            if (this.products.length > 1) {
                this.ratio  = this.create('ratio', CampaignProductScale);
            }
            // 没有对接，隐藏服务器列
            if(!this.$isButt){
                this.el.find('.server').hide();
            }
        },
        /**
         * 构造单个广告策略
         * @param  {Object} 数据项
         * @return {Undefined}	无
         */
        buildItem: function(data) {
            var game = data.game;
            var dom = $(tpl.parse('campaign/detail_product_item', game));
            var item = {
                dom: dom,
                id: game._id,
                data: game,
                sweety_num: dom.find('.sweety_num'),
                whisky_num: dom.find('.whisky_num'),
                sweetyType: data.SweetyRatioType || 0, // 优化方式
                sweetys: data.Sweetys || [], // 关联创意包列表
                whiskyType: data.WhiskyCreativeRatioType || 0, // 优化方式
                whiskys: data.WhiskyCreatives || []	// 关联落地页列表
            };

            // 默认图片绑定
            util.imageError(item.dom.find('.logo img'), 'product');
            item.dom.appendTo(this.doms.body);

            // 服务器选择模块
            var serverEl = item.dom.find('.server');
            var product = util.find(this.products, game._id, "Id");
            var serverId = product.ServerId;
            if (serverId) {
                app.data.get("/rest/listproductserver", {"ProductId": item.id}, this, 'onServerData', {"el": serverEl, "serverId": serverId});
            } else {
                serverEl.text(LANG('自动选择最新服务器'));
            }

            if(!this.$isButt){
                serverEl.hide();
            }

            // 构建广告策略列
            var creativeEl = item.dom.find('.creative');
            var that = this;
            $.each(product.Sweetys, function(index, item) {
                var sweetyEl = $("<div style='overflow: hidden;' data-id=" + item.Id + "><div class='sweetyItem'><ul></ul></div></div>");
                sweetyEl.appendTo(creativeEl);
                // 根据id获取创意包
                app.data.get("/rest/listsweety", {"Id": item.Id}, that, 'onSweetyData', {"el": sweetyEl});

                var sweetyCon = sweetyEl.find("div:first ul");
                $.each(item.WhiskyIds, function(index, num) {
                    var whiskyEl = $("<li><a data-id=" + num +"><img></img></a></li>").appendTo(sweetyCon);
                    // 根据id获取落地页
                    app.data.get("/rest/listwhiskycreative", {"Id": num}, that, 'onWhiskyData', {"el": whiskyEl});
                });
            });

            this.items.push(item);

            // 向流量滚动条中添加产品
            if (this.ratio) {
                this.ratio.addGame({
                    id: product.Id,
                    value: product.RatioSet,
                    text: game.GameName
                });
            }
        },
        /**
         * 创意包数据响应函数
         * @param  {Object} err   错误信息
         * @param  {Object} data  返回的数据对象
         * @param  {Object} param 参数
         * @return {Undefined}    无
         */
        onSweetyData: function(err, data, param) {
            if (data && param && param.el) {
                var item = data.items[0];
                param.el.prepend(_buildSweety(item.Name, item.Thumb, item._id));
                this.sweetys.push(item);
            }
        },
        /**
         * 落地页数据相依函数
         * @param  {Object} err   错误信息
         * @param  {Object} data  返回的数据对象
         * @param  {Object} param 参数
         * @return {Undefined}    无
         */
        onWhiskyData: function(err, data, param) {
            if (data && param && param.el) {
                var item = data.items[0];
                var name = item.Name;
                var preUrl = item.WhiskyPreviewUrl || item.OuterLink;
                param.el.find("a").text(name).attr("href", preUrl);
                param.el.find("img").attr({
                    "class": "sweety",
                    "src": THUMB_BUILDER+"?Path="+ item.Thumb +'&Width='+16+'&Height='+16,
                    "alt": name
                });
                this.whiskys.push(item);
            }
        },
        /**
         * 产品服务器数据相依函数
         * @param  {Object} err   错误信息
         * @param  {Object} data  返回的数据对象
         * @param  {Object} param 参数
         * @return {Undefined}    无
         */
        onServerData: function(err, data, param) {
            if (data && param && param.el) {
                var server = util.find(data.items, param.serverId, "_id");
                param.el.text(LANG(server.Name));
            }
        },
        /**
         * 数据请求响应函数
         * @param  {Object} err   错误信息
         * @param  {Object} data  返回的数据对象
         * @param  {Object} param 参数
         * @return {Undefined}    无
         */
        onData: function(err, data, param) {
            if (data && data.items[0]) {
                this.buildItem({"game": data.items[0]});
            }
        },
        /**
         * 设定当前产品数据
         * @return {Object} 当前产品数据
         */
        setData: function(data) {
            var that = this;
            $.each(data, function(index, item) {
                app.data.get(that.database, {"Id": item.Id}, that, 'onData');
            });
        }
    })

    /**
     * 详情页面构建广告策略链接
     */
    function _buildSweety(val,thumb,id){
        var url = FRONT_BASE+"#/creative/creativeList/"+id;
        var dom =$('<div class="sweetyItem"><a class="" href="'+ url +'" target="_blank" ><img class="sweety" src="'+(THUMB_BUILDER+"?Path="+thumb)+'&Width=16&Height=16'+'" alt="'+val+'" />'+val+'</a></div>');
        util.imageError(dom.find('img'), 'sweety');
        return dom;
    }

    /**
     *  活动详情
     */
    var Detail = app.extend(view.container, {
        init: function(config, parent) {
            config = $.extend({
                'class': 'P-campaignDetail'
            }, config);
            this.database = "/rest/loadcampaign"; // 后台数据url
            this.channelType = 0; // 1 - RTB, 2 - 代理
            Detail.master(this, null, config);

            Detail.master(this, "init");
            this.getData();
        },
        /**
         * 构造函数
         * @param  {Object} data 数据对象
         * @return {Undefined}   无返回值
         */
        build: function(data){
            // 根据频道类型实例化对应的详情对象
            if (data.Channel === 1 || data.Channel === 4) {
                this.content = this.create(
                    "content"
                    ,RtbDetail
                    , {
                        "target": this.el,
                        "data": data
                    }
                );
            } else if (data.Channel === 2) {
                this.content = this.create(
                    "content"
                    ,AgentDetail
                    , {
                        "target": this.el,
                        "data": data
                    }
                );
            }
        }
        /**
         * 获取数据
         * @return {undefined} 无返回值
         */
        ,getData: function(){
            app.data.get(
                this.database
                ,this.config.param
                ,this
            );
        }
        /**
         * 获取数据响应函数
         * @param  {Object}    err  错误消息对象
         * @param  {Object}    data 数据对象
         * @return {Undefiend}      无返回值
         */
        ,onData: function(err,data){
            if(err){
                app.alert(LANG(err.message));
                return false;
            }
            this.setData(data || {});
        }
        /**
         * 设定数据
         * @param {Obejct}    data 数据对象
         * @return {Undefined}     无返回值
         */
        ,setData: function(data){
            this.data = data;
            this.name = this.data.Name;
            this.channelType = this.data.Channel;
            this.build(data);
        }
    });
    exports.detail = Detail

    /**
     *  RTB活动详情
     */
    var RtbDetail = app.extend(view.container,
        {
            init: function(config, parent) {
                var items = {};
                util.each(app.config('exchanges'), function(ex){
                    items[ex.id] = LANG(ex.name);
                });
                config = $.extend({
                    'class': 'P-campaignDetailProductContainer',
                    'channelNames': items
                }, config);
                RtbDetail.master(this, null, config);
                this.data = config.data;

                RtbDetail.master(this,"init");
                this.build();
            },
            /**
             * 构造函数
             * @return {Undefined} 无返回值
             */
            build: function() {
                RtbDetail.self(this, "_buildSectionBase");
                RtbDetail.self(this, "_buildSectionAdvanced");
                RtbDetail.self(this, "_buildSectionOther");
                RtbDetail.self(this, "_buildSectionProducts");
            }
        },
        {
            /**
             * 构造基本信息
             * @return {Undefined} 无返回值
             */
            _buildSectionBase: function() {
                var sectionBase = this.create('sectionBase', form.section, {
                    'title': LANG('基本信息'),
                    'target': this.el
                });
                var con = sectionBase.getContainer();
                con.addClass("detailBase");
                // con.after('<i class="clearBox"></i>');

                this.create('name', form.item, {
                        label: LANG('活动名称:'),
                        content: this.data.Name,
                        target: con,
                        'class': "detailItem"
                    }
                );

                this.create('channel', form.item, {
                        label: LANG('广告渠道:'),
                        content: this.config.channelNames[this.data.SubChannel[0]],
                        target: con,
                        'class': "detailItem"
                    }
                );

                this.create('topPrice', form.item, {
                        label: LANG('最高出价:'),
                        content: this.data.TopPrice + LANG(" 元/千次曝光"),
                        target: con,
                        'class': "detailItem"
                    }
                );

                this.create('budget', form.item, {
                        label: LANG('每日预算:'),
                        content: this.data.Budget + LANG(" 元"),
                        target: con,
                        'class': "detailItem"
                    }
                );
            },
            /**
             * 构造高级设定信息
             * @return {Undefined} 无返回值
             */
            _buildSectionAdvanced: function() {

                var sectionAdvanced = this.create('sectionAdvanced', form.section, {
                    'title': LANG('高级设定'),
                    'target': this.el
                });
                var con = sectionAdvanced.getContainer();
                // con.after('<i class="clearBox"></i>');

                this.create('freq', form.item, {
                        label: LANG('频次控制:'),
                        content: this.data.Frequency + LANG(" 次"),
                        target: con,
                        'class': "detailItem"
                    }
                );

                this.date = this.create(
                    'date', form.dateRange,
                    {label: LANG("投放日期:"), target: con, 'start': util.date('Y-m-d'), disabled: true, 'class': "detailItem"}
                );

                // 数据转换
                var startTime = this.data.StartTime;
                var endTime = this.data.EndTime;
                this.date.setData({
                    start: startTime ? util.dateNumberToDate(startTime) : 0,
                    end: endTime ? util.dateNumberToDate(endTime) : 0
                });

                this.time = this.create(
                    "time"
                    ,CampaignSchedule,
                    {
                        "label": LANG("日程设置:")
                        ,"target": con
                        ,"class": "M-formItem clearBox"
                    }
                );
                this.time.setData(this.data.TimeSet);
                this.time.disable();

                this.zone = this.create(
                    'zone', CampaignZone,
                    {label: LANG("投放地区:"), target: con}
                );
                this.zone.setData(this.data.Zone);
                this.zone.disable();
            },
            /**
             * 构造其他设定信息
             * @return {Undefined} 无返回值
             */
            _buildSectionOther: function() {
                var sectionOther = this.create('sectionOther', form.section, {
                    'title': LANG('其他设定'),
                    'target': this.el
                });
                var con = sectionOther.getContainer();
                con.addClass("detailOther");
                // con.after('<i class="clearBox"></i>');

                this.create('estImpression', form.item, {
                        label: LANG('预计曝光:'),
                        content: this.data.EstImpression + LANG(" 次"),
                        target: con,
                        'class': "detailItem"
                    }
                );

                this.create('estClick', form.item, {
                        label: LANG('预计点击:'),
                        content: this.data.EstClick + LANG(" 次"),
                        target: con,
                        'class': "detailItem"
                    }
                );

                var labels = this.data.Label ? this.data.Label.join(", ") : [];
                this.create('labels', form.item, {
                        label: LANG('活动标签:'),
                        content: labels,
                        target: con,
                        'class': "detailItem"
                    }
                );
            },
            /**
             * 构造相关产品信息
             * @return {Undefined} 无返回值
             */
            _buildSectionProducts: function() {
                this.products = this.create('products', CampaignProducts, {
                    target: this.el,
                    data: this.data
                });
                this.products.setData(this.data.Products);
            }
        }
    );

    /**
     *  代理活动详情
     */
    var AgentDetail = app.extend(view.container,
        {
            init: function(config, parent) {
                config = $.extend({
                    'adNames': {
                        1: LANG("硬广"),
                        2: LANG("弹窗")
                    }
                }, config);

                AgentDetail.master(this, null, config);
                this.data = config.data;

                AgentDetail.master(this,"init");
                this.build();
            },
            /**
             * 构造函数
             * @return {Undefined} 无返回值
             */
            build: function() {
                AgentDetail.self(this, "_buildSectionBase");
                AgentDetail.self(this, "_buildSectionOther");
                AgentDetail.self(this, "_buildSectionAd");
                AgentDetail.self(this, "_buildSectionProducts");
            },
            /**
             * 广告位数据回调
             * @param  {Object}    err   错误信息回调
             * @param  {Object}    data  返回的数据
             * @param  {Object}    param 列表行对应的数据
             * @return {Undefined}       无返回值
             */
            onPositionData: function(err, data, param) {
                if (data) {
                    this.list.setData(data.items);
                }
            },
            /**
             * 渠道数据回调
             * @param  {Object}    err   错误信息回调
             * @param  {Object}    data  返回的数据
             * @param  {Object}    param 列表行对应的数据
             * @return {Undefined}       无返回值
             */
            onChannelData: function(err, data, param) {
                if (data && param) {
                    var name =  data && data.items[0] && data.items[0].Name;
                    param.el.append(LANG(name));
                }
            }
        },
        {
            /**
             * 构造基本信息
             * @return {Undefined} 无返回值
             */
            _buildSectionBase: function() {
                var sectionBase = this.create('sectionBase', form.section, {
                    'title': LANG('基本信息'),
                    'target': this.el
                });
                var con = sectionBase.getContainer();

                this.create('name', form.item, {
                        label: LANG('活动名称:'),
                        content: this.data.Name,
                        target: con,
                        'class': "detailItem"
                    }
                );

                var startTime = this.data.StartTime;
                var endTime = this.data.EndTime;
                this.date = this.create('date', form.dateRange,{
                    'target': con,
                    'disabled': true,
                    'class': "detailItem",
                    'label': LANG("投放日期:"),
                    'start': startTime ? util.dateNumberToDate(startTime) : 0,
                    'end': endTime ? util.dateNumberToDate(endTime) : 0
                });
            },
            /**
             * 构造广告位信息
             * @return {Undefined} 无返回值
             */
            _buildSectionAd: function() {
                var sectionAdvanced = this.create('sectionAdvanced', form.section, {
                    'title': LANG('广告位'),
                    'target': this.el
                });
                var con = sectionAdvanced.getContainer();

                this.create('adType', form.item, {
                        label: LANG('广告形式:'),
                        content: this.config.adNames[this.data.AdType],
                        target: con,
                        'class': "detailItem"
                    }
                );

                var subChannel = this.create('subChannel', form.item, {
                        label: LANG('渠道:'),
                        target: con,
                        'class': "detailItem"
                    }
                );
                var SubChannel = this.data.SubChannel;
                if (SubChannel.length) {
                    app.data.get(
                        "/rest/listadsubchannel"
                        ,{"Id": this.data.SubChannel[0]}
                        ,this
                        ,'onChannelData'
                        ,{"el": subChannel.el}
                    );
                }

                this.create('listTitle', form.item, {
                        label: LANG('广告列表:'),
                        target: con,
                        'class': "detailItem"
                    }
                );
                var table = require('grid/table');
                this.list = this.create('list', table.list, {
                    target: $('<div class="list"/>').appendTo(con),
                    cols:[
                        {type:'id', width:80},
                        {name:'MassMediaName', text: LANG('媒体'), align:'center'},
                        {name:'Name', align:'center'}
                    ],
                    opClick: true,
                    default_sort: false
                });

                var positionIds = [];
                $.each(this.data.AdPositions, function(index, item) {
                    positionIds.push(item.Id);
                });
                if (positionIds.length) {
                    app.data.get(
                        "/rest/listadposition?InfoMore=1&AdChannelId=2"
                        ,{"Ids": positionIds.join(",")}
                        ,this
                        ,'onPositionData'
                    );
                }
                positionIds = null;
            },
            /**
             * 构造其他设定信息
             * @return {Undefined} 无返回值
             */
            _buildSectionOther: function() {
                var sectionOther = this.create('sectionOther', form.section, {
                    'title': LANG('其他设定'),
                    'target': this.el
                });
                var con = sectionOther.getContainer();
                con.addClass("detailOther");
                // con.after('<i class="clearBox"></i>');

                this.create('estImpression', form.item, {
                        label: LANG('预计曝光:'),
                        content: this.data.EstImpression + LANG(" 次"),
                        target: con,
                        'class': "detailItem"
                    }
                );

                this.create('estClick', form.item, {
                        label: LANG('预计点击:'),
                        content: this.data.EstClick + LANG(" 次"),
                        target: con,
                        'class': "detailItem"
                    }
                );

                var labels = this.data.Label ? this.data.Label.join(", ") : [];
                this.create('labels', form.item, {
                        label: LANG('活动标签:'),
                        content: labels,
                        target: con,
                        'class': "detailItem"
                    }
                );
            },
            /**
             * 构造关联产品信息
             * @return {Undefined} 无返回值
             */
            _buildSectionProducts: function() {
                this.products = this.create('products', CampaignProducts, {
                    target: this.el,
                    data: this.data
                });
                this.products.setData(this.data.Products);
            }
        });

    var More = app.extend(
        view.container
        ,{
            init:function(config, parent){
                config = $.extend(
                    true
                    ,{
                        "target":"body"
                        // 支持的内部模块
                        ,"subs":{
                            "mediaAndAd":{
                                "name":LANG("广告位")
                                ,"pack":"pages/campaignSub"
                                ,"mod":"mediaAndAd"
                            }
                            ,"creative":{
                                "name":LANG('创意包')
                                ,"mod":"sweety"
                            }
                            ,"whisky":{
                                "name":LANG('落地页')
                            }
                            ,"period":{
                                "name":LANG('时段分析')
                                ,"pack":"pages/campaignSub"
                                ,"mod":"period"
                            }
                            ,"comp":{
                                "name":LANG('频次分布')
                                ,"pack":"pages/campaignSub"
                                ,"mod":"comp"
                            }
                            ,"geo":{
                                "name":LANG("受众地域")
                                ,"pack":"pages/campaignSub"
                                ,"mod":"geo"
                            }
                            ,"client":{
                                "name":LANG('客户端')
                                ,"pack":"pages/campaignSub"
                                ,"mod":"client"
                            }
                            // ,"platform":{
                            // 	"name":LANG("平台列表")
                            // }
                            ,"product":{
                                "name":LANG('产品')
                                ,"pack":"pages/campaignSub"
                                ,"mod":"productAndPlatform"
                            }
                        }
                        // 请求参数
                        ,"request":{}
                    }
                    ,config
                );

                // 根据用户类型设定去除不需要显示的内部模块
                var tmp = app.config("userModules").subgrid.exclude[app.getUser().type];
                if(tmp){
                    for(var i = 0,len = tmp.length;i<len;i++){
                        delete config.subs[tmp[i]];
                    }
                }

                More.master(this,null,config);
                More.master(this,"init",[config, parent]);

                // 平台区域实例
                tmp = this.platform = app.core.get("platform");
                this.frameAside = tmp.body.frameAside;
                this.frameTitle = tmp.body.frameHead.title;

                // 对应的活动ID
                this.$id = 0;
                this.$ready = 0;

                // 活动下拉菜单对象
                this.$listData = null;
                this.$campaignList = null;
                this.$request = null;
                this.$menus = null;

                // 当前模块
                this.$subFirst = util.first_key(config.subs);
                this.$subName = '';
                this.$subMod = null;
                //活动数据
                this.$data = null;

                this.$readOnly = false;
                this.$IsDeleted = false;

                // 当前次级实例名称
                // this.nowSub = this.config.request.search && this.config.request.search.sub || "";
                // 当前的次级实例配置
                // this.nowSubs = [];
                // 当前次级实例
                // this.nowMod = null;

                // this.setNowSubs();
                // this.setTitle();
                // this.loadPage();

                tmp = null;
            }
            // 构建界面
            ,build: function(){
                this.$ready = 1;

                // 生成DOM对象
                var doms = this.doms = {};

                // 生成标题内容
                var con = doms.titleContainer = $('<div class="P-campaignMoreTitle"/>').appendTo(this.el);
                doms.selectList = $('<div class="campaignList"/>').appendTo(con);
                doms.campaignStatus = $('<div class="campaignStatus"/>').appendTo(con);
                doms.statusTxt = $('<em></em>').appendTo(doms.campaignStatus).hide();
                doms.statusIcon = $('<a class="G-icon pause"/>').appendTo(doms.campaignStatus).hide();
                doms.campaignName = $('<div class="M-tableListWidthLimit campaignName"/>').appendTo(con);

                // 生成按钮组
                doms.buttonGroupCon = $('<div class="P-campaignMoreBtnCon"/>').appendTo(this.el);
                this.create('buttonGroup', common.buttonGroup, {
                    'target': doms.buttonGroupCon,
                    'label': null,
                    'items': [LANG('所有活动'), LANG('单个活动')],
                    'selected':1
                });


                // 创建下拉列表
                this.$campaignList = this.create("campaignList",common.dropdown,{
                    "target":doms.selectList
                    ,"width":"auto"
                    ,"option_width":444
                    ,"option_height":600
                    ,"option_render": this.renderDropdown
                });
                this.$campaignList.hide();

                //新增campaignSwitcher控件
                this.campaignSwitcher = this.create('switcher',CampaignSwitcher,{
                    "target":this.el
                });

                // 拉取活动资料列表
                // app.data.get(
                // 	'/rest/listcampaign?no_stastic_data=1&limit=99999&MFields=_id,Id,Name,Channel,Status',
                // 	this, 'onCampaignList'
                // );
            }
            ,renderDropdown: function(i, data, con){
                return $('<div class="M-tableListWidthLimit" title="'+data.Name+'">').width(con.width()).text(data.Name);
            }
            // 拉取活动数据回调函数
            ,onCampaignList: function(err, data){
                if (err){
                    app.alert(err.message);
                    return false;
                }
                //this.$data = data.items;
                this.$campaignList.setData(null, data.items);
                // 更新标题状态
                this.setTitle();
                // 更新活动状态
                this.setStatus();
                // 显示子模块
                this.showSubModule();
            }
            /**
             * 隐藏当前的模块
             * @return {Object} 模块实例
             */
            ,hide:function(){
                More.master(this, 'hide');
                this.$menus = null;
                return this;
            }
            /**
             * 显示当前的模块
             * @return {Object} 模块实例
             */
            ,show:function(){
                More.master(this, 'show');
                // 显示界面布局
                var doms = this.doms;
                this.setMenu();
                this.frameTitle.empty().append(doms.titleContainer);
                doms.campaignStatus.show();
                return this;
            }
            // 更新显示侧边菜单
            ,setMenu: function(){
                // 生成侧边栏配置选项
                //if (this.$menus) { return true; }

                var req = this.$request,
                    menus = this.$menus = [],
                    url = '#'+req.module+'/'+req.action+'/'+req.param+'?sub=';

                util.each(this.config.subs, function(param, mod){
                    var nav = $.extend({
                        'uri': url+mod,
                        'iconCls': 'nav-'+mod
                    }, param);
                    menus.push(nav);
                });
                this.frameAside.setData(menus);
            }
            // 更新标题栏状态
            ,setTitle: function(){
                // if (!this.$data){ return false; }
                // this.$campaignList.setData(this.$id);
            }
            // 更新活动状态
            ,setStatus: function(){
                if (!this.$data){ return false; }
                var doms = this.doms;
                var item = this.$data;

                //设置标题
                var statusMap = ['','unstart','runing','done','suspend','overload'];
                var labelMap = ['',LANG('未开始'),LANG('进行中'),LANG('已结束'),LANG('已暂停'),LANG('超预算')];
                var status = item.IsDeleted ? 'store' : statusMap[item.RunStatus];
                var label = item.IsDeleted ? LANG('已归档') : labelMap[item.RunStatus];
                doms.campaignName.attr('title',LANG('活动状态：')+label+' '+item.Id+' '+item.Name).text(' '+item.Id+' '+item.Name).prepend('<em class="G-iconFunc '+status+'"/>');

                //设置按钮组
                this.$.buttonGroup.setData(1);

                //每次先清除
                this.resetFunctional();
                if(item){
                    this.reanderFunctional(item);
                    //故意在这里绑定事件，避免重复
                    this.dg(doms.campaignStatus,"a[data-func]","click","eventStatusClick");
                    this.setMenu();
                }
            }
            /**
             * 加载/重载数据
             * @param  {Object}    req 请求对象
             * @return {Undefined}     无返回值
             */
            ,load:function(req){
                if(util.isObject(req)){
                    this.$request = req;
                }
                if (!this.$request){
                    return false;
                }
                if (!this.$ready){
                    this.build();
                }

                this.$subName = req && req.search && req.search.sub || this.$subFirst;

                var id = +req.param;
                if (id && id !== this.$id){
                    this.$id = id;
                    // this.setTitle();
                    // this.setStatus();
                }
                //this.$id = id;

                this.showSubModule();
            }
            // 显示并加载当前的模块
            ,showSubModule: function(module, param, isDelete){
                //if (!this.$data){ return false; }
                var name = this.$subName;
                var conf = this.config.subs[name];
                if (param !== 'afterLoad'){
                    var uri = conf.pack || "pages/"+name;
                    app.loadModule(uri, 'afterLoad', this, 'showSubModule');
                    return;
                }
                // 判断模块构造函数是否存在
                var creator = module[conf.mod] || module.list;
                if (!util.isCreator(creator)){
                    return false;
                }

                // 加载完整的活动记录
                // if (this.$loadId){
                // 	app.data.abort(this.$loadId);
                // }

                //为了已归档的活动，能够显示
                if(this.$IsDeleted){
                    this.$loadId = app.data.get('/rest/listcampaign', {
                        no_stastic_data: 1,
                        Ids: this.$id,
                        IsDeleted: 1
                    }, this, 'afterLoadCampaign', creator);
                }else{
                    this.$loadId = app.data.get('/rest/listcampaign', {
                        no_stastic_data: 1,
                        Ids: this.$id
                    }, this, 'afterLoadCampaign', creator);
                }
            }
            ,afterLoadCampaign: function(err, data, creator){
                if(data){
                    // 加载模块完成
                    this.$data = data.items[0];

                    if(!data.items.length){
                        this.$IsDeleted = 1;
                        this.load({param: this.$id});
                        return;
                    }
                    // 更新全局变量状态
                    this.setGlobalData();

                    // 更新活动状态
                    this.setStatus();

                    var name = this.$subName;
                    var mod = this.$subMod, id = this.$id;
                    if (mod){ mod.hide(); }

                    var gridParam = {
                        "is_sub_grid": 1
                        ,"sub_id": id
                        ,"sub_static": data.items[0]
                        ,"sub_param": "campaign_id|"+id
                    };

                    mod = this.get(name);
                    if (mod){
                        mod.load(null, gridParam);
                    }else{
                        mod = this.create(name, creator, {
                            "target":this.el
                            ,"grid":gridParam
                            ,"hasAdd":false
                            ,"hasTags":false
                            ,"hasTpl":false
                        });
                    }
                    this.$subMod = mod;

                    mod.show();
                    mod.cast("channelChange",{
                        "silence":true
                    });

                    this.$IsDeleted = 0;
                }

            }
            ,setGlobalData: function(){
                var campaign = this.$data;
                var uri = '/campaign/'+campaign.Id;
                // 合并超级黑名单
                var blacklist = campaign.WhiteBlackList || [];
                if (campaign.SetExcludeInfo){
                    blacklist.push.apply(blacklist, campaign.SetExcludeInfo);
                }
                app.store.set(uri, {
                    'blacklist': blacklist,
                    'pricelist': campaign.PriceModify,
                    'price': campaign.TopPrice
                });
            }
            /**
             * 下拉菜单响应函数
             * @param  {Object} ev 菜单消息数据
             * @return {Bool}      阻止冒泡
             */
            ,onOptionChange:function(ev){
                if (this.$request){
                    var req = this.$request;
                    window.location.hash = '#'+req.module+'/'+req.action+'/'+ev.param.id;
                }
                return false;
            }
            /**
             * 金额改变事件响应函数
             * @param  {Object}    ev 消息数据对象
             * @return {undefined}    无返回值
             */
            // ,onBalanceChange:function(ev){
            //	this.reset();
            // }

            /**
             * 活动状态切换按钮绑定函数
             * @param  {Object}    evt jq鼠标事件
             * @return {Undefined}     无返回值
             */
            ,eventStatusClick:function(evt, elm){
                var self = this;
                var status = $(elm).attr("data-func");
                var id = this.$id;
                var data = this.$data;
                var param = {};
                switch (status){
                    case 'detail':
                        window.open('#/campaign/detail/'+id);
                        break;
                    case 'edit':
                        var action = 'edit';
                        switch (data.Channel){
                            case 2:
                                action = 'agentEdit';
                                window.open('#/campaign/'+action+'/'+id);
                                break;
                            case 3:
                                action = 'directEdit';
                                window.open('#/campaign/'+action+'/'+id);
                                break;
                            case 4:
                                action = 'MTEdit';
                                window.open('#/campaign/'+action+'/'+id+'?BidType='+(data.BidType||0));
                                break;
                            default:
                                window.open('#/campaign/'+action+'/'+id+'?BidType='+(data.BidType||0));
                        }

                        break;
                    case 'disable':
                    case 'enable':
                        // 停止状态不再请求数据
                        if (data.RunStatus === 3){ return; }
                        param.Status = (status == 'disable' ? 2 : 1);
                        app.data.get(
                            '/rest/stopcampaign',
                            {'Id': id, 'Status': param.Status},
                            self.cbSetStatus, self, param
                        );
                        break;
                    case 'remove':
                        app.confirm(LANG('真的要删除这个活动记录吗?'),function(isOk){
                            if(isOk){
                                param.IsDeleted = 1;
                                app.data.get(
                                    '/rest/deletecampaign',
                                    {'Id': id},
                                    self.cbRemove, self, param
                                );
                            }
                        });
                        break;
                    case 'store':
                        app.confirm(LANG('真的要归档这个活动记录吗?'),function(isOk){
                            if(isOk){
                                param.IsDeleted = 1;
                                app.data.get(
                                    '/rest/deletecampaign',
                                    {'Id': id},
                                    self.cbStore, self, param
                                );
                            }
                        });
                        break;
                    case 'restore':
                        app.confirm(LANG('真的要取消这个活动记录的归档吗?'),function(isOk){
                            if(isOk){
                                param.IsDeleted = 0;
                                app.data.get(
                                    '/sweety/recyclecampaign',
                                    {'Id': id},
                                    self.cbStore, self, param
                                );
                            }
                        });
                        break;
                    case "diagnosis":
                        window.open('#campaign/diagnosis/'+id);
                        break;
                    case 'code':
                        window.open('#campaign/code/'+id);
                        break;
                    case "saveas":
                        window.open('#campaign/saveas/'+id+"?Channel="+data.Channel+'&BidType='+(data.BidType||0));
                        break;

                }
                return false;
            }
            /**
             * 重置
             * @return {Object} 实例对象
             */
            ,reset:function(){
                // this.setMenu();
                // this.showSubModule();
                // this.$id = null;
                return this;
            }
            // 标题操作栏渲染
            ,reanderFunctional: function(row){
                var html = ''
                    ,status
                    ,rs = row.RunStatus;

                html += '<span class="spacing"></span>';

                if (row.IsDeleted){
                    html += '<a data-func="restore" title="'+LANG("还原")+'" href="#"><em class="G-iconFunc restore"/>'+LANG("还原")+'</a>';
                    html += '<a data-func="detail" title="'+LANG("详情")+'" href="#"><em class="G-iconFunc list"/>'+LANG("详情")+'</a>';
                    html = $(html).appendTo(this.doms.campaignStatus);
                    return html;
                }

                if (!this.$readOnly && (row.Channel === 1 || row.Channel === 4)){
                    // 暂停按钮
                    status = row.Status;
                    // 暂时屏蔽，后端还未完善 @Edwin,2013.05.13
                    // if(this.config.state===false) { status = 3; }
                    switch (status){
                        case 1:
                            //未开始的活动，不加暂停按钮
                            if(rs != 1){
                                html += '<a data-func="disable" title="'+LANG("暂停")+'" href="#"><em class="G-iconFunc stop"/>'+LANG("暂停")+'</a>';
                            }
                            break;
                        case 2:
                            html += '<a data-func="enable" title="'+LANG("恢复")+'" href="#"><em class="G-iconFunc resume"/>'+LANG("恢复")+'</a>';
                            break;
                        default:
                            html += '<a title="'+LANG("无效")+'"><em class="G-iconFunc invaild"/>'+LANG("无效")+'</a>';
                            break;
                    }
                }

                // 详情按钮
                html += '<a data-func="detail" title="'+LANG("详情")+'" href="#"><em class="G-iconFunc list"/>'+LANG("详情")+'</a>';
                if(row.Channel === 1 || row.Channel === 4){
                    // 代理没有活动诊断
                    html += '<a data-func="diagnosis" title="'+LANG("活动诊断")+'" href="#"><em class="G-iconFunc diagnosis"/>'+LANG("活动诊断")+'</a>';
                }

                // 自读权限只有详情
                if (this.$readOnly){ return html; }

                // 编辑按钮
                html += '<a data-func="edit" title="'+LANG("编辑")+'" href="#"><em class="G-iconFunc edit"/>'+LANG("编辑")+'</a>';

                // 另存按钮
                html += '<a data-func="saveas" title="'+LANG("另存为")+'" href="#"><em class="G-iconFunc saveas"/>'+LANG("另存为")+'</a>';
                // 删除按钮
                // html += '<a data-func="remove" title="'+LANG("删除")+'" href="#"><em class="G-iconFunc trash"/></a>';

                // 归档按钮
                html += '<a data-func="store" title="'+LANG("归档")+'" href="#"><em class="G-iconFunc store"/>'+LANG("归档")+'</a>';

                if (row.Channel === 2){
                    // 复制代码
                    html += '<a data-func="code" title="'+LANG("广告位代码")+'" href="#"><em class="G-iconFunc code"/>'+LANG("广告位代码")+'</a>';
                }

                if(row.Channel === 1 || row.Channel === 4){
                    // 代理没有在线查看广告功能
                    // html += '<a data-func="adOnline" title="'+LANG("在线查看广告")+'" href="#">在线查看广告<em class="G-iconFunc adOnline"/>'+LANG("在线查看广告")+'</a>';
                }

                html = $(html).appendTo(this.doms.campaignStatus);
                return html;
            }
            // 重置标题栏
            ,resetFunctional: function(){
                this.doms.campaignStatus.empty();
                this.doms.campaignStatus.unbind('click');

            }
            // 事件广播
            ,onUpdateCampaign: function(ev){
                var id = ev.param;
                app.navigate('campaign/more/'+id);
                this.load({param:id});
            }
            /**
             * 状态操作回调函数
             * @param  {Object}    err       错误信息对象
             * @param  {Object}    data      操作结果对象
             * @param  {Number}    newStatus 新的状态
             * @return {Undefined}           无返回值
             */
            ,cbSetStatus:function(err,data,newStatus){
                if(err){
                    app.alert(err.message);
                    return false;
                }
                this.load({param:this.$id});
            }
            // 归档及取消归档记录操作
            ,cbStore: function(err, data, param){
                if (err){
                    app.alert(err.message);
                    return false;
                }
                this.load({param:this.$id})
            }
            // 删除记录操作
            ,cbRemove: function(err, data, param){
                if (err){
                    app.alert(err.message);
                    return false;
                }
            }
            // 用户切换所有活动和单一活动
            ,onChangeButton: function(ev){
                var type = +ev.param.selected;
                switch (type){
                    case 0:
                        app.navigate('campaign');
                        break;
                }
                return false;
            }
            // 用户切换更新列表记录
            ,onUserChange:function(ev){
                var user = app.getUser();
                if (user && user.auth > 1){
                    this.$readOnly = false;
                }else {
                    this.$readOnly = true;
                }
            }
        }
    );

    exports.more = More;

    /**
     * 活动诊断
     */
    var Diagnosis = app.extend(
        view.container
        ,{
            init:function(config,parent){
                config = $.extend(
                    {
                        "target":parent||"body"
                        ,"url":"/rest/listcampaignadinfo"
                        ,"usbUrl":"/rest/listcampaignadinfosub"
                        ,"class":"P-campaignDiagnosis"
                        ,"gridColsTitle":{
                        "Size":LANG("尺寸")
                        ,"Domain":LANG("媒体域名")
                        ,"AdPosition":LANG("广告位")
                        ,"Sweety":LANG("创意包")
                    }
                    }
                    ,config
                );

                Diagnosis.master(this,null,config);
                Diagnosis.master(this,"init",[config,parent]);

                // 默认文本
                this.$defTxts = {
                    "name":LANG("加载中")
                    ,"QueryType":LANG("查看维度：")
                    ,"Complete":LANG("尺寸状态：")
                    ,"Verify":LANG("审核状态：")
                }

                // 过滤类型静态数据
                this.$labels = {
                    "QueryType":[
                        {"name":LANG("按广告位尺寸"),"val":"Size","def":1}
                        ,{"name":LANG("按媒体域名"),"val":"Domain"}
                        ,{"name":LANG("按广告位"),"val":"AdPosition"}
                        ,{"name":LANG("按创意包"),"val":"Sweety"}
                    ]
                    ,"Complete":[
                        null
                        ,{"name":LANG("齐全"),"val":1}
                        ,{"name":LANG("部分缺少"),"val":2}
                        ,{"name":LANG("没有尺寸"),"val":3}
                    ]
                    ,"Verify":[
                        null
                        ,{"name":LANG("全部通过"),"val":1}
                        ,{"name":LANG("部分通过"),"val":2}
                        ,{"name":LANG("没有通过"),"val":3}
                    ]
                }

                // 没有域名的渠道
                this.$noDomain = app.config('exchange_group/no_domain');
                var ud;
                // 状态弹出层
                this.$tips = {
                    "CompleteStatus":{
                        "titles":{
                            "Size":LANG("以下创意包缺少该尺寸创意")
                            ,"Domain":LANG("以下创意包缺少对应尺寸的创意")
                            ,"AdPosition":LANG("以下创意包缺少该广告位的尺寸创意")
                            ,"Sweety":LANG("缺少以下尺寸")
                        }
                        ,"pos":"mr"
                        ,"width":420
                        ,"grid":{}
                        // 尺寸弹出层不显示的列
                        ,"exclude":{
                            "Sweety":["Name","SweetyNameWithThumb","VerifyStatus"]
                            ,"Size":["SizeLackInfo","Name","VerifyStatus"]
                            ,"Domain":["Name","VerifyStatus"]
                            ,"AdPosition":["Name","VerifyStatus"]
                        }
                    }
                    ,"VerifyStatus":{
                        "titles":{
                            "Size":LANG("以下创意未通过审核")
                            ,"Domain":LANG("以下创意未通过审核")
                            ,"AdPosition":LANG("以下创意未通过审核")
                            ,"Sweety":LANG("以下创意未通过审核")
                        }
                        ,"pos":"ml"
                        ,"width":720
                        ,"grid":{
                            "cols":[
                                {"name": 'Id', text: LANG('创意ID'), align: 'center', 'type': 'index'},
                                ud,ud,ud,ud,
                                {"name":"RejectReason","text":LANG("审核原因"),"align":"left","render":this.renderReject}
                            ]
                        }
                        // 审核状态弹出不显示的列
                        ,"exclude":{
                            "Sweety":["name"]
                            ,"Size":["SizeLackInfo"]
                            ,"Domain":[]
                            ,"AdPosition":[]
                        }
                    }
                }

                // 模块数据
                this.$data = {};
                this.$campaignData = {};

                // 活动id
                this.$cid = null;

                // 类型
                this.$type = "Size";

                // 模块状态
                this.ready = false;

                // 维度设定状况
                this.$labelReady = false;

                this.doms = {};

                this.$param = {"QueryType":"Size"};

                this.build();
                this.bindEvent();

            }
            /**
             * 渲染不过审原因
             * @param  {Number} index   行索引值
             * @param  {Number} val     单元格数据
             * @return {String}         状态html字符串
             */
            ,renderReject:function(index,val){
                return '<div class="warpWord">'+val+'</div>';
            }
            /**
             * 构造
             * @return {Undefined} 无返回值
             */
            ,build:function(){
                if(this.ready){
                    return;
                }
                this.doms.name = $('<div class="P-campaignDiagnosisName"><em>'+LANG("活动名称：")+'</em><span>'+this.$defTxts.name+'</span></div>');
                this.el.append(this.doms.name);
                this.doms.name = this.doms.name.find("span:first");

                // 条件
                var con = $('<div class="P-campaignListCon"/>');
                for(var n in this.$labels){
                    this.create(
                        n
                        ,taglabels.listType
                        ,{
                            "target":con
                            ,"class":"M-tagLabelsSimpleContainer"
                            // 维度是唯一的
                            ,"all_label":n === "QueryType"?null:undefined
                            ,"title":this.$defTxts[n]
                            ,"data":this.$labels[n]
                        }
                    );
                }
                this.el.append(con);

                // 表格
                this.create(
                    "grid"
                    ,grid.diagnosis
                    ,{
                        "target":this.el
                    }
                );

                for(n in this.$tips){
                    this.create(
                        n
                        ,popwin.tip
                        ,{
                            "pos":this.$tips[n].pos
                            ,"outerHide":true
                            ,"width":this.$tips[n].width
                            ,"mouseChkDelay":30
                            ,"fxDelay":100
                            ,"data":'<div class ="P-campaignDiagnosisWrap"><p class="title"></p></div>'
                        }
                    );
                    // 表格容器
                    this.$[n].con = null;
                    // 标题容器
                    this.$[n].titleCon = null;
                    // 表格
                    this.$[n].grid = null;
                }

                con = null;
            }
            /**
             * 事件绑定
             * @return {Undefined} 无返回值
             */
            ,bindEvent:function(){
                if(this.ready){
                    return;
                }

                // 状态绑定
                this.dg(this.$.grid.el,"p[data-type] em","mouseenter mouseleave","statusHandler");

                this.ready = true;
            }
            /**
             * 状态鼠标事件响应函数
             * @return {Undefined} 无返回值
             */
            ,statusHandler:function(ev){
                // 得到当前的维度
                var currentQueryType = this.$.QueryType.getData();
                var tag = $(ev.target).closest("p[data-type]")
                // 状态类型
                    ,type = tag.attr("data-type")
                // 状态码
                    ,status = +tag.attr("data-status");

                // 需要显示的状态只有两个
                if(status > 1 && status < 4){
                    if(ev.type === "mouseenter"){
                        var param = {
                                "CampaignId":this.$cid
                                ,"QueryType":this.$type
                                ,"Id":+tag.attr("data-id")
                                ,"ListType":type
                            }
                            ,tmp;
                        type = type+"Status"

                        // 弹出层
                        tmp = this.$[type];
                        tmp.reload({
                            "anchor":$(ev.target)
                        });
                        tmp.show();

                        if(!tmp.con){
                            // 缓存dom对象
                            tmp.con = tmp.el.find(".P-campaignDiagnosisWrap:first");
                            tmp.titleCon = tmp.el.find(".title:first");
                        }
                        // 更新标题
                        tmp.titleCon.text(this.$tips[type].titles[this.$type]);

                        if(!tmp.grid){
                            // 去掉预设的的结构数据
                            tmp.config.data = null;
                            // 表格
                            this.$tips[type].grid.target = tmp.con;
                            tmp.grid = this.$[type].create(
                                "grid"
                                ,grid.diagnosisPop
                                ,this.$tips[type].grid
                            );
                        }

                        if (currentQueryType == '3') {
                            // 在按创意包的taglabel中隐藏“创意包”列
                            tmp.grid.toggleColumn('SweetyNameWithThumb', false);
                        } else {
                            // 默认的情况显示
                            tmp.grid.toggleColumn('SweetyNameWithThumb', true);
                        }

                        // 加载状态数据
                        this.loadStatusData(param,type);

                        tmp = param = status = null;
                    }else{
                        tag = this.$[type+"Status"];
                        var to = $(ev.toElement).offset()
                            ,from = $(ev.fromElement).offset()
                            ,x = true;

                        if(to && from){
                            // 向定义的方向移动的话则认为是要移动到弹出层中
                            x = tag.config.pos === "mr"?to.left - from.left < 0:from.left - to.left >= 0
                        }
                        if(x){
                            tag.hide();
                        }
                        to = from = x = null;
                    }
                    tag = type = null;
                }else{
                    // 不需要处理的情况
                    tag = null;
                    return false;
                }
            }
            ,onGridDataLoad:function(){

                return false;
            }
            /**
             * 加载指定广告位的状态数据
             * @param  {Object}    param  状态类型
             * @param  {String}    type   请求参数
             * @return {Undefined}        无返回值
             */
            ,loadStatusData:function(param,type){
                this.$[type].grid.showLoading();
                app.data.get(
                    this.config.usbUrl
                    ,param
                    ,this
                    ,"onStatusData"
                    ,type
                );
            }
            /**
             * 加载指定广告位的状态数据回调函数
             * @param  {Object}    err   错误信息对象
             * @param  {Object}    data  数据对象
             * @param  {String}    type  状态类型
             * @return {Undefined}       无返回值
             */
            ,onStatusData:function(err,data,type){
                var i,len;
                if(err){
                    return;
                }

                if(this.$[type].isShow){
                    var cols = this.$[type].grid.config.cols.slice()
                        ,newCols = []
                        ,exclude = this.$tips[type];

                    exclude = exclude?exclude.exclude[this.$type]:null;
                    if(exclude){
                        // 有排除设置
                        exclude = ","+exclude+","
                        for(i =0,len = cols.length;i<len;i++){
                            if(i && exclude.indexOf(","+cols[i].name+",") === -1){
                                newCols.push(cols[i].name);
                            }
                        }
                        cols = exclude = null;
                    }else{
                        // 没有就全部显示
                        newCols = null;
                    }


                    // 打平数据
                    var list = data.items;
                    if(type != 'VerifyStatus'){
                        var datas = data.items;
                        list = [];

                        for(i=0;i<datas.length;i++){
                            var lack = datas[i].SizeLackInfo;
                            var name = datas[i].SweetyName;
                            var thumb = datas[i].Thumb;
                            for(var size in lack){
                                list.push({
                                    'SizeLackInfo':size,
                                    'SweetyName':name,
                                    'Thumb':thumb
                                });
                            }
                        }
                    }else{
                        // 把拒绝原因抽出来。
                        // @todo 后端有空这个事得让他们去做
                        for(var r = 0,l = list.length;r<l;r++){
                            list[r].RejectReason = list[r].VerifyInfo.RejectReason || LANG("无");
                        }
                    }

                    this.$[type].grid
                        .setCols(newCols)
                        .setData(list);
                }
            }
            /**
             * 响应表格分页切换事件
             * @return {Bool} false
             */
            ,onChangePage:function(){
                var param = this.$.grid.getParam();
                delete param.begindate;
                delete param.enddate;
                delete param.order;
                this.load(
                    this.$cid
                    ,param
                );
                param = null;
                return false;
            }
            /**
             * 加载数据
             * @param  {Number} id 请求活动id
             * @return {Object}    模块实例
             */
            ,load:function(id,param){
                id = id || this.$cid;
                if(!isNaN(id)){
                    this.$cid = id;
                    if(param){
                        this.$param = $.extend(
                            this.$param
                            ,param
                        );
                    }
                    this.$param.CampaignId = this.$cid;
                    this.$.grid.showLoading();
                    app.data.get(
                        this.config.url
                        ,this.$param
                        ,this
                        ,"onData"
                    );
                }else{
                    app.log(LANG("Id必须是数字形式"));
                }
                return this;
            }
            /**
             * 数据加载回调函数
             * @param  {Object}    err  错误信息对象
             * @param  {Object}    data 数据对象
             * @return {Undefined}      无返回值
             */
            ,onData:function(err,data){
                if(err){
                    this.$.grid.hideLoading();
                    app.log(err.message);
                    return;
                }
                this.setTypeLabel(data.campaign.SubChannel)
                    .setGrid(data)
                    .setData(data);
            }
            /**
             * 设置能显示的维度
             * @param {Array} sub 渠道代码
             * @return            模块实例
             * @todo              有必要的话可以写成检测任意不显示的项目。暂时只针对域名
             */
            ,setTypeLabel:function(sub){
                if(!this.$labelReady){
                    for(var i = 0;i<sub.length;i++){
                        if (util.exist(this.$noDomain, sub[i])){
                            var newLabel =this.$labels.QueryType.slice();
                            newLabel.splice(1,1);
                            this.$.QueryType.setData(newLabel);
                            newLabel = null;
                            break;
                        }
                    }
                    this.$labelReady = true;
                }
                return this;
            }
            /**
             * 设定表格
             * @return {Object} 模块实例
             */
            ,setGrid:function(data){
                var index = 0;
                // 更新分页
                var pager = this.$.grid.pager;
                if (pager){
                    pager.setup({
                        'total': data.total,
                        'size': (data.size || undefined),
                        'page': (data.page || undefined)
                    });
                    var info = pager.getData();
                    if (info.count > 1){
                        pager.show();
                        index = (info.page - 1) * info.size;
                    }else if (this.config.is_sub_grid){
                        pager.hide();
                    }
                }

                if(!this.$.grid.list.head.nameCol){
                    // 0是序号列，1是状态列，2才是要更改的主列
                    this.$.grid.list.head.nameCol = this.$.grid.list.head.find("th:eq(2) span:first");
                }
                if(this.$type){
                    var col = this.$.grid.list.head.nameCol;
                    this.$.grid.setNameColType(this.$type);
                    // 显示隐藏状态列
                    this.$.grid.toggleStatusCol(this.$type);
                    col.text(this.config.gridColsTitle[this.$type]);
                }
                return this;
            }
            /**
             * 类型过滤消息事件处理
             * @return {Boolean}    false
             */
            ,onListTypeChange:function(ev){
                var param = {},tmp;

                if(ev.name === "QueryType"){
                    // 改变维度类型
                    this.$type = ev.param.item.val;
                }

                for(var n in this.$){
                    // 不是表格且不是提示
                    if(n !== "grid" && !this.$tips[n]){
                        tmp = this.$[n].getData(1);
                        if(tmp && tmp !== -1){
                            // 全选的状态
                            param[n] = tmp.val;
                        }else{
                            // 一般状态
                            param[n] = "";
                        }
                    }
                }
                // 刷列表
                this.load(null,param);
                tmp = param = null;
                return false;
            }
            /**
             * 重置
             * @return {Object} 模块实例
             */
            ,reset:function(){
                console.log("reset");
                return this;
            }
            /**
             * 设定模块数据
             * @param  {Object} data 模块数据
             * @return {Object}      模块实例
             */
            ,setData:function(data){
                this.$data = data.items;
                this.$campaignData = data.campaign;

                this.doms.name.text(this.$campaignData.Name);
                this.$.grid.setData(this.$data);
            }
            ,getData:function(){
                return this.$data;
            }
        }
    );

    exports.diagnosis = Diagnosis;

    /**
     * 在线查看广告
     */
    var AdOnline = app.extend(view.container,{
        init: function(config, parent){
            config = $.extend(true, {
                'class': 'P-campaignAdOnline',
                'target': parent,
                'url': '/rest/listcampaigngo',
                'set_url':'/rest/campaignallowcookiesset',
                'param': null
            }, config);

            this.$data = [];
            this.$ready = false;
            this.$CampaignId = null;

            AdOnline.master(this, null, config);
            AdOnline.master(this,"init",arguments);

            this.build();
        },
        build: function(){
            if(this.$ready){
                return;
            }
            var el = this.el;
            $('<p/>').text(LANG('为满足让指定的Cookie刷出广告的需求，系统会以50元/CPM的最高出价，向指定Cookie的广告展示进行竞价。该特殊出价的有效期为设置后1小时。')).appendTo(el);
            var dl = $('<dl class="infoTitle" />').appendTo(el);
            var html = [
                '<dt><h3>'+LANG("设置方式")+'：</h3></dt>',
                '<dd class="copy"'+LANG(">1、用需要被指定的浏览器打开后面的地址获取浏览器的Cookie ID")+'：<span>http://www.getcookie.biddingx.com</span> <a title="'+LANG("复制网址")+'">'+LANG("复制")+'</a></dd>',
                '<dd>'+LANG("2、把获得的Cookie ID填写到下面文本框并添加")+'</dd>'
            ].join('');
            dl.append(html);

            this.msgCon = $('<div class="msgCon"><span class="msg">'+LANG("复制成功")+'</span><b class="arrow"></b></div>').appendTo(dl.find('dd').eq(0));

            var formWrap = $('<div class="formWrap" />').appendTo(el);

            this.create('input',form.input,{
                'holder':LANG('输入Cookie ID并添加')
                ,'label':''
                ,'width':240
                ,'target':formWrap
            });

            this.create('addBtn',common.button,{
                'text':LANG('添加')
                ,'target':formWrap
                ,'data':'add'
                ,'class':'btnBigGray'
            });

            var gridWarp = $('<div class="gridWarp"/>').appendTo(el);
            this.create('grid',grid.adOnline,{
                'target':gridWarp
                ,'operation':{
                    width: 125,
                    html: '<a href="#" data-op="remove">'+LANG("删除")+'</a>'
                }
            })

            this.dg(el, '.copy a', 'mouseenter', 'eventCopy');
            this.$ready = true;
        },
        onButtonClick: function(ev){
            if (ev.from === this.$.addBtn){
                this.addCookieID();
            }
            return false;
        },
        onListOpClick: function (ev){
            var self = this;
            var c = self.config;

            if (ev.param.op === 'remove'){

                var CampaignId = c.CampaignId;
                var id = ev.param.data.Id;
                var idx = ev.param.index;

                app.confirm(LANG('要删除Cookie ID : %1 吗?', id),function(isOk){
                    if(isOk){
                        //改变要删除的那一行cookieID的状态
                        self.$data[idx].Refresh = -1;
                        var param = {
                            "CampaignId":CampaignId
                            ,"AllowCookies":self.$data
                        }
                        app.data.put(c.set_url, param, self, 'onRemove');
                    }
                });
            }
        },
        onRemove: function (){
            this.setParam(this.config.param).load();
        },
        //添加CookieID
        addCookieID: function (){
            var self = this;
            var c = self.config;
            var id = self.$.input.getData();
            var newCookie = {
                "Id":id, //cookie_id
                "Refresh": 1 //是否刷新cookie， -1表示删除cookie，0不操作，1表示刷新增加
            }
            self.$data.push(newCookie);
            var param = {
                "CampaignId":c.CampaignId
                ,"AllowCookies":self.$data
            }
            app.data.put(c.set_url, param, self, 'onAdd');

        },
        onAdd:function (err, data){
            if (err){
                app.error(err);
                return;
            }
            this.setParam(this.config.param).load();
        },
        eventCopy: function(evt, elm){
            var a = $(elm);
            var url = a.parent().find('span').eq(0).text();
            util.clip(url, a, this.copyComplete, this);
            return false;
        },
        copyComplete: function(){
            this.showMessage();
        },
        reset: function(){
            this.$.input.setData('');
            AdOnline.master(this, 'reset');
        },
        setParam: function (param){
            this.config.param = param;
            return this;
        },
        load: function(){
            this.showLoading();
            var c = this.config;
            app.data.get(c.url, c.param, this);
        },
        onData: function(err, data){
            this.hideLoading();

            if (err){
                app.error(err);
                return;
            }
            this.reset();
            //记录列表数据
            this.$data = data.items[0].AllowCookies;

            this.setGrid(data.items[0].AllowCookies);

        },
        //设置列表显示数据函数
        setGrid:function(data){
            this.$.grid.setData(data);
            return this;
        },
        showLoading: function(){
            if (this.$ && this.$.loading){
                this.$.loading.show();
            }else {
                this.create('loading', common.loadingMask, {target: "body"});
            }

        },
        hideLoading: function() {
            if (this.$.loading){
                this.$.loading.hide();
            }
        }
        // 显示复制成功提示信息
        ,showMessage: function(text){
            var el = this.msgCon;

            if (this.$messageTid){
                clearTimeout(this.$messageTid);
            }
            el.fadeIn();

            this.$messageTid = setTimeout(function(){
                el.fadeOut();
                el = null;
                clearTimeout(this.$messageTid);
            },2000);
        }
    });
    exports.adOnline = AdOnline;

    //活动流量预估切换控件
    var FlowEstimateSwitcher = app.extend(view.container, {
        init:function(config){
            config = $.extend(true,{
                'class':'M-flowEstimateSwitcher'
                ,'url': '/rest/listFlowInfo'
                ,'toggleBtnText':LANG('预估流量')
                ,'param': {
                    "order": 'impressions|-1,clicks|-1'
                    // ,"no_limit": 1
                },
                'drag': true
            },config);
            FlowEstimateSwitcher.master(this,null,config);
            FlowEstimateSwitcher.master(this,'init',arguments);

            // 当前用户信息
            this.$data = app.getUser();
            this.sys_param = {};
            this.$Channel = null;
            this.$ready = false;
            this.build();
        }
        //构建函数
        ,build:function(){
            if (this.$ready){ return false; }

            var el = this.el;
            var doms = this.doms = {
                contentCon: $('<div class="contentCon"></div>').appendTo(el),
                titleCon : $('<div class="titleCon"><b class="arrow"/></div>').appendTo(el)
            }
            //右侧按钮
            $('<h3/>').text(this.config.toggleBtnText).appendTo(doms.titleCon);

            $([
                '<h3>'+LANG('根据以下设置：')+'</h3>',
                '<span>'+LANG('投放地区、时段设置、浏览器、操作系统、PC端、自有人群、三方人群、上网场景、渠道、广告位、影视定向、终端类型、设备类型')+'</span>',
                '<h3>'+LANG('预计一天内曝光量为：')+'</h3>',
                '<strong>'+util.numberFormat(0)+'</strong>'
            ].join('')).appendTo(doms.contentCon);

            doms.flowValue = doms.contentCon.find('strong');

            //取消按钮
            this.create('refresh', common.button,{
                'target':doms.contentCon,
                'text':LANG('刷新'),
                'data':'refresh',
                'class':'btnBigGray'
            });

            this.jq(doms.titleCon,'click','eventToggleList');
        }
        //弹出控制函数
        ,eventToggleList:function(){
            this.el.toggleClass('hideActive2');
            // 广播事件通知拉取所需参数
            this.fire('getFlowParam');
            return false;
        }
        ,onButtonClick: function(ev){
            // 广播事件通知拉取所需参数
            this.fire('getFlowParam');
            return false;
        }
        // 刷新流量值
        ,refresh: function(data){
            //资料数据正常, 提交保存数据
            this.showLoading();
            app.data.put(
                this.config.url,
                data,
                this,
                'afterRefresh'
            );
            return this;
        }
        ,afterRefresh: function(err, data){
            this.hideLoading();
            if (err){
                app.error(err);
                return false;
            }
            if(data){
                this.doms.flowValue.text(util.numberFormat(data.number || 0));
            }
        }
        // 显示数据加载中
        ,showLoading: function() {
            var con = this.doms.contentCon;
            if (!this.loadingRow){
                this.loadingRow = $('<div class="M-tableListLoading"/>');
                this.loadingRow.appendTo(con).text(LANG("数据加载中"));
            }
            this.loadingRow.width(con.outerWidth()).height(this.el.height()).css(con.position());
            this.loadingRow.show();
        }
        // 隐藏数据加载提示
        ,hideLoading: function() {
            if (this.loadingRow) {
                this.loadingRow.hide();
            }
        }
    });

    //活动切换控件
    var CampaignSwitcher = app.extend(view.container,{
        init:function(config){
            config = $.extend(true,{
                'class':'M-campaignSwitcher'
                ,'url': '/rest/listcampaign'
                ,'toggleBtnText':LANG('筛选')
                ,'param': {
                    "order": 'impressions|-1,clicks|-1',
                    'no_stastic_data': 1
                    // ,"no_limit": 1
                },
                'drag': true
            },config);
            CampaignSwitcher.master(this,null,config);
            CampaignSwitcher.master(this,'init',arguments);

            // 当前用户信息
            this.$data = app.getUser();
            this.sys_param = {};
            this.$Channel = null;
            this.$ready = false;
            this.build();
        }
        //构建函数
        ,build:function(){
            if (this.$ready){ return false; }

            var el = this.el;
            var doms = this.doms = {
                buttonCon: $('<div class="buttonCon"></div>').appendTo(el),
                searchCon: $('<div class="searchCon"></div>').appendTo(el),
                tagTreeCon: $('<div class="tagTreeCon"></div>').appendTo(el),
                titleCon : $('<div class="titleCon"><b class="arrow"/></div>').appendTo(el)
            }
            //右侧按钮
            $('<h3/>').text(this.config.toggleBtnText).appendTo(doms.titleCon);

            //所有类型
            this.create('Channel', common.dropdown,{
                'options': [
                    {Name: LANG('所有类型'), _id: null},
                    {Name: LANG('RTB'), _id: 1},
                    {Name: LANG('代理'), _id: 2}
                ],
                'data':0,
                'target': doms.buttonCon,
                'width': 80,
                'search': false
            });

            this.loadChannel();
            //所有渠道
            this.create('SubChannel', common.dropdown,{
                'target': doms.buttonCon,
                'options': this.$subChannel,
                'search':true,
                'def': LANG('所有渠道'),
                'width': 80
            });

            //所有状态
            this.create('RunStatus', common.dropdown,{
                'options': [
                    {Name: LANG('所有状态'), _id: null},
                    {Name: LANG('未开始'), _id: 1},
                    {Name: LANG('进行中'), _id: 2},
                    {Name: LANG('已结束'), _id: 3},
                    {Name: LANG('已暂停'), _id: 4},
                    {Name: LANG('超预算'), _id: 5},
                    {Name: LANG('已归档'), _id: 6}
                ],
                'data':0,
                'target': doms.buttonCon,
                'width': 80,
                'search': false
            });

            //搜索框
            this.create('searchBar',common.searchNoClear,{
                'target': doms.searchCon
            });


            //树形标签过滤
            this.tags = this.create(
                "tags"
                ,TreeTagLabels
                ,{
                    "target": doms.tagTreeCon
                }
            );
            this.jq(doms.titleCon,'click','eventToggleList');

            if(this.config.drag){
                // 拖拉图标
                doms.drag = $('<div class="dragIcon"/>').appendTo(el);
                app.drag(doms.drag, this.eventCtrs, this);
            }

        }
        //控制drag函数
        ,eventCtrs: function(data, ev){
            // 树形标签的容器
            var tagsCon = this.$.tags.el.find('.M-treeTagLabelsSimpleContainer');
            switch (data.type){
                case 'moveDrag':
                    // 当前高度
                    var height_el = this.$height_el + data.dy;
                    var height_tagsCon= this.$height_tagsCon + data.dy;
                    if(data.originHight && (data.originHight < height_el)){
                        this.el.height(height_el);
                        tagsCon.height(height_tagsCon);
                    }
                    break;
                case 'startDrag':
                    // 当前容器的高度
                    this.$height_el =this.el.css('minHeight','').height();
                    // 树形标签的高度
                    this.$height_tagsCon = tagsCon.css('minHeight','').height();
                    if(!data.originHight){
                        data.originHight = this.$height_el;
                    }
                    break;
                case 'endDrag':
                    //更新滚动条
                    this.$.tags.updateScroll();
                    break;
            }
            return true;
        }
        //弹出控制函数
        ,eventToggleList:function(){
            this.el.toggleClass('hideActive');
            this.$.searchBar.el.find('input').select();
        }
        //搜索组件的广播事件，拉取数据
        ,onSearch: function(ev){
            var param = ev.param;
            var UD;
            var SP = this.sys_param;
            SP.Word = param || UD;
            if(SP.Word != UD){
                this.load();
            }else{
                this.$.tags.setSearchData(null);
            }
            return false;
        }
        //拉取标签
        ,load: function(){
            this.$.tags.showLoading();
            var cfg = this.config;
            var param = $.extend({},
                cfg.param,
                this.sys_param
            );
            app.data.get(cfg.url, param, this, 'onData');
        }
        ,onData: function(err, data){
            this.$.tags.hideLoading();
            if (err){
                app.error(err);
                if (err.message){
                    app.alert(err.message);
                }
                return false;
            }
            this.sys_param.no_limit = 0;
            this.$.tags.setSearchData(data.items);
        }
        //dropdown组件的广播事件，记录参数
        ,onOptionChange: function(ev){
            var SP = this.sys_param;
            var name = ev.name;
            var id = ev.param.id || null;
            switch (name){
                case 'Channel':
                    SP.Channel = id;
                    this.$Channel = id;
                    if(id ==1 && this.$SubChannel!=null){
                        this.$SubChannel=null;
                        SP.SubChannel = null;
                    }
                    this.setSubChannel();
                    break;
                case 'SubChannel':
                    SP.SubChannel = id;
                    this.$SubChannel = id;
                    break;
                case 'RunStatus':
                    if(id == 6){
                        this.config.param.order = 'UpdateTime|-1';
                        SP.IsDeleted = 1;
                        SP.RunStatus = null;
                        this.$RunStatus = null;
                        break;
                    }else{
                        SP.IsDeleted = 0;
                        this.config.param.order = 'impressions|-1,clicks|-1';
                        SP.RunStatus = id;
                        this.$RunStatus = id;
                        break;
                    }
            }
            this.load();
            return false;
        }
        ,loadChannel: function(){
            app.data.get('/rest/listadsubchannel', {
                'no_stastic_data': 1,
                'no_limit': 1
            }, this, 'onChannelData');
        }
        //设置所有渠道下拉参数
        ,onChannelData: function(err, data){
            if (err){
                app.error(err);
                if (err.message){
                    app.alert(err.message);
                }
                return false;
            }
            var self = this;
            var CHANNEL = app.config('exchanges') || [];
            this.$rtbs = [];
            this.$agents = [];

            util.each(CHANNEL, function(item){
                self.$rtbs.push({
                    'Name': item.name,
                    '_id': item.id
                });

            })
            util.each(data.items, function(item){
                self.$agents.push({
                    'Name': item.Name,
                    '_id': item.Id
                });
            })
            this.setSubChannel();
        }
        //设置渠道，根据所有类型切换
        ,setSubChannel: function(){
            var arr = [{'Name':LANG('所有渠道'),'_id':null}];
            var tmp;
            if(this.$Channel == 1){
                tmp = arr.concat(this.$rtbs);
            }
            if(this.$Channel == 2){
                tmp = arr.concat(this.$agents);
            }
            if(this.$Channel == null){
                tmp = arr.concat(this.$rtbs,this.$agents);
            }
            this.$.SubChannel.setData(tmp);
        }
        ,onLoad: function(ev){
            this.sys_param.no_limit = 1;
            this.load();
        }
    });

    //树形标签
    var TreeTagLabels = app.extend(view.container, {
        init: function(config, parent){
            config = $.extend({
                "target": 'body',
                "class": 'M-treeTagLabels',
                "labelUrl": '/rest/listlabel',
                "campaignUrl": '/rest/listcampaign',
                "param": {},
                "pageSize": 20,
                "all": false,
                "type": 'CampaignLabel',
                "order": '_id|-1',
                "txts": {
                    'result': LANG('搜索结果')
                    ,'all': LANG('所有标签')
                }
            }, config);

            TreeTagLabels.master(this, null, config);
            TreeTagLabels.master(this, 'init', arguments);

            var tmp = date.getDate();
            //设置标签url的参数
            this.$labelParam = config.all?{}:$.extend({}, tmp);
            if(this.config.type){
                this.$labelParam.type = this.config.type;
            }
            //设置活动url的参数
            this.$campaignParam = $.extend({}, tmp);
            this.$campaignParam.order = config.order;
            this.$campaignParam.no_stastic_data = 1; //加了这个就不能按order排序
            //this.$campaignParam.page = 1;
            //this.$campaignParam.limit = 20;
            //this.$campaignParam.no_limit = 1;

            this.$data = null;
            this.$labelData = {};

            //是否已经拉取过
            this.$isOver = {};

            this.build();

            tmp = null;
        },
        build: function(){

            var doms = this.doms = {};
            doms.con = $('<div class="M-treeTagLabelsSimpleContainer"/>').appendTo(this.el);
            doms.wrap = $('<ul class="wrapper" />').appendTo(doms.con);
            doms.tags = {};

            //搜索结果标签
            var li = $([
                '<li data-id="search" class="tagList">',
                '<div class="item">',
                '<b class="arrow" />',
                '<span>', this.config.txts.result, '</span>',
                '<em>(0)</em>',
                '</div>',
                '<ul></ul>',
                '</li>'
            ].join('')).appendTo(doms.wrap).hide();
            this.$searchItem = {
                'li': li,
                'list': li.find('ul'),
                'count': li.find('em')
            };

            //创建滚动条
            this.create('scroll', common.scroller, {
                target: doms.con,
                content: doms.wrap,
                dir: 'V'
            });

            this.dg(this.el, 'div.item', 'click', 'eventToggleList');
            this.dg(this.el, 'li.loadMore', 'click', 'eventLoadMoreCampaign');
            this.dg(this.el, 'li[data-cid]', 'click', 'eventChangeCampaign');

            this.load();
        }
        //拉取标签
        ,load: function(){
            this.showLoading();
            var self = this;
            app.data.get(
                self.config.labelUrl
                ,$.extend({}, self.config.param, self.$labelParam)
                ,self
            );
        }
        ,onData: function(err, data){
            this.hideLoading();
            if (err){
                app.error(err);
                if (err.message){
                    app.alert(err.message);
                }
                return false;
            }

            this.$len = data.total;
            var items = data.items;

            //所有标签
            items.unshift({
                name: this.config.txts.all,
                count: data.items_child_count
            });

            // 设置模块标签数据
            this.setData(items);
        }
        //设置标签
        ,setData: function(data){
            var self = this;
            var list = self.doms.tags;
            var con = self.doms.wrap;
            this.$data = data;
            //循环创建其他标签
            util.each(data, function(item, id){
                if (item){
                    list[id] = $([
                        '<li data-id="'+id+'" class="tagList">',
                        '<div class="item">',
                        '<b class="arrow" />',
                        '<span>', item.name, '</span>',
                        '<em>(', item.count, ')</em>',
                        '</div>',
                        '<ul></ul>',
                        '</li>'
                    ].join('')).appendTo(con);
                }
            });
            self.updateScroll();
            return self;
        }
        // 标签点击事件
        ,eventToggleList: function(ev, elm){
            var self = this;
            var li = $(elm).parent();
            var id = li.attr('data-id');
            var sub = li.children('ul');
            var data = self.$labelData[id];

            if (data || id=='search'){
                sub.toggle();
                self.updateScroll();
            }else {
                sub.show();
                // 初始化节点数据
                self.$labelData[id] = {
                    'id': id,
                    'name': self.$data[id].name,
                    'total': -1,
                    'page': 0,
                    'list': sub,
                    'count': $(elm).children('em')
                };
                self.loadLabelCampaign(id);
            }
        }
        // 加载列表数据
        ,loadLabelCampaign: function(id){
            var self = this;
            var c = self.config;
            var data = self.$labelData[id];
            if (data && (data.total<0 || data.total>data.page*c.pageSize)){
                var param = $.extend(
                    {}, this.$campaignParam,
                    {'page': ++data.page, 'size':c.pageSize}
                );
                if (id>0){
                    param.Label = JSON.stringify([data.name]);
                }
                self.showLoading();
                app.data.get(c.campaignUrl, param, self, 'afterLoadLabelCampaign', id);
            }
            return self;
        }
        // 加载活动回调函数
        ,afterLoadLabelCampaign: function(err, data, id){
            this.hideLoading();
            if (err){
                app.error(err);
            }else {
                var item = this.$labelData[id];
                if (item){
                    item.total = +data.total || 0;
                    // 更新总数
                    item.count.text('('+ item.total + ')');
                    this.appendCampaignList(item, data.items);
                }
            }
        }
        // 添加活动资料到列表中
        ,appendCampaignList: function(item, list){
            var self = this;
            // 更新列表
            var ul = item.list;
            var statusMap = ['','unstart','runing','done','suspend','overload'];
            util.each(list, function(data){
                var status = data.IsDeleted ? 'store' : statusMap[data.RunStatus];
                $('<li class="M-tableListWidthLimit"/>')
                    .text(data.Id + ' ' + data.Name)
                    .attr('title', data.Name)
                    .attr('data-cid', data.Id)
                    .prepend('<em class="G-iconFunc '+status+'"/>')
                    .appendTo(ul);
            });

            // 更新加载更多
            var more = ul.find('li.loadMore');
            if (item.total && item.total>item.page*self.config.pageSize){
                if (!more.size()){
                    more = $('<li class="loadMore" data-id="'+item.id+'"/>')
                        .text(LANG('加载更多..'));
                }
                more.appendTo(ul);
            }else {
                more.hide();
            }
            // 刷新滚动条
            self.updateScroll();
            return self;
        }
        // 加载更多活动
        ,eventLoadMoreCampaign: function(evt, elm){
            var id = +$(elm).attr('data-id') || 0;
            if (this.$labelData[id]){
                this.loadLabelCampaign(id);
            }
            return false;
        }
        //单条活动点击事件，触发更新页面
        ,eventChangeCampaign: function (ev, elm){
            var id = $(elm).attr('data-cid');
            this.fire('updateCampaign',id);
        }

        // 设置显示搜索记录结果
        ,setSearchData: function(list){
            var self = this;
            var item = self.$searchItem;

            if (list){
                // 更新总数
                item.li.show();
                item.list.empty();
                item.count.text('('+ list.length + ')');
                self.appendCampaignList(item, list);
            }else {
                item.li.hide();
                // 刷新滚动条
                self.updateScroll();
            }

            return self;
        }

        // 刷新滚动条
        ,updateScroll: function(){
            this.$.scroll.measure();
            return this;
        }

        //重置
        ,reset: function(tagName){
            return this;
        }

        ,showLoading: function() {
            var con = this.el;
            if (!this.loadingRow){
                this.loadingRow = $('<div class="M-tableListLoading"/>');
                this.loadingRow.appendTo(con).text(LANG("数据加载中"));
            }
            this.loadingRow.width(con.outerWidth()).height(con.outerHeight()).css(con.position());
            this.loadingRow.show();
        }
        ,hideLoading: function() {
            if (this.loadingRow) {
                this.loadingRow.hide();
            }
        }
    });

});
