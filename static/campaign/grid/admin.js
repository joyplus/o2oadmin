define(function(require, exports){
    var grid = require('grid'),
        util = require('util'),
        app = require('app'),
        $ = require('jquery'),
        labels = require('grid/labels'),
        format = labels.format || {},
        popwin = require('popwin'),
        BaseNoDate = grid.baseNoDate;

    var Base = app.extend(BaseNoDate, {
        init: function(config){
            config = $.extend({
                'is_sub_grid': false,
                'hasTab': false,
                'hasAmount': false,
                'hasExport': false,
                'sort': null
            }, config);
            Base.master(this, null, config);
            Base.master(this, 'init', arguments);
        },
        getParam: function(){
            return this.config.customParam;
        },
        setParam: function(params, replace){
            this.config.customParam = replace ? params : util.merge(
                this.config.customParam,
                params
            );
        }
    });
    exports.base = Base;

    exports.spotGroup = grid.spotGroup;

    // 内部方法-格式化数据
    /**
     * 角色
     */
    var _renderRole = function(i,val,row,con){
        if(val == 3){
            val = LANG('员工');
            //若员工有公司名，以"员工名-公司名"显示；
            if(row.CampanyName){val += '-' + row.CampanyName;}
        }else{
            val = LANG('客户');

        }
        return val;
    };
    /**
     * 登录信息
     */
    var _renderLoginInfo = function(i,val,row,con){
        return [
            LANG("帐号添加时间：%1", util.date("Y-m-d H:i:s", row.CreateTime)),
            LANG("最近登录时间：%1", util.date("Y-m-d H:i:s", row.UpdateTime))
        ].join('<br/>');
    };

    var _renderName = function(index,val,row){
        return '<p class="userName">'+val+'</p><p class="emailName">'+row.Name+'</p>';
    }
    // 客户列表
    var CustomerList = app.extend(Base, {
        init: function(config){

            var cols = [
                // {type:'id', width:50},
                {name:'UserId', text:'ID'},
                {name:"Status",text:LANG("状态"),render:"reanderFunctional","width":80},
                {name:"UserName",text:LANG("名称"),type:"index",render:"renderName","width":255},
                // {name:"Name",text:LANG("邮箱"),type:'dim'},
                {name:"Type",text:LANG("类型"),format:'formatType',align:'center'},
                {name:"CategoryId",text:LANG("版本"),format:'formatCategory',align:'center'},
                {name:"CostRateTmp",text:LANG("溢价"),format:'formatCostRate'},
                {name:"RestAmount",text:LANG("余额"),format:format.currency,render:"renderRest"},
                {name:"AllowAdCredit",text:LANG("可用额度")/*,format:format.currency*/,render:"renderCreadit"},
                {name:"yesterday_cost",text:LANG("昨日消费"),format:format.currency},
                {name:"loginInfo",text:LANG("登录信息"),align:"left",render:_renderLoginInfo},
                {name:"InvoiceStatus",text:LANG("发票信息"),align:"left",render:'renderInvoice'}
            ];

            // 移除溢价列
            var remove_charge_rules = app.config('auth/remove_charge_rules');
            var user = app.getUser();
            var c_uid = user.campany.UserId;
            var uid = user.userid;
            var cost_index;
            util.each(cols, function(col, idx){
                if(col && col.name == 'CostRateTmp'){
                    cost_index = idx;
                }
            })
            util.each(remove_charge_rules, function(item){
                if(item && item == c_uid || item == uid){
                    cols.splice(cost_index, 1);
                }
            });

            config = $.extend({
                "cols": cols
                ,"subs":['admin_employee', 'admin_direct', 'admin_cost']
                ,"sub_filter":'subFilter'
                ,"url":"/campany/listcustomer"
                ,"operation":{render: 'renderOperation', cls:'M-gridOPCursor', width:155}
            }, config);

            // 子表格时参数处理
            if (config.is_sub_grid){
                config.is_sub_grid = false;
                config.hasSearch = true;
                config.param = $.extend(config.param, {
                    'Type': 2,
                    'CampanyId': config.sub_id
                });
            }

            CustomerList.master(this, 'init', arguments);

            this.$user = app.getUser();
            if(this.$user.campany_type == 4 && (config.is_sub_grid !== false)){
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

            this.gridType = 'customerList';
            this.dg(this.el,'a[data-reason]','mouseenter mouseleave','eventShowStatusTips');
            this.dg(this.el,'a[data-op="manual"]','click','eventManualEdit');
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
        /**
         * 渲染余额
         * @param  {Number} index 行索引
         * @param  {String} val   单元格数据
         * @return {String}       处理完的渲染数据
         */
        renderRest:function(index,val){
            if(parseFloat(val) < 0){
                // 余额为负数时红色高亮
                val = '<span class="red">'+val+'</span>';
            }
            return val;
        },
        renderName:function(index,val,row){
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
        renderInvoice:function(index,val,row){
            return {
                    '1':LANG('资料不全'),
                    '2':LANG('待审核'),
                    '3':LANG('已通过'),
                    '4':LANG('已拒绝')
                }[val]||LANG('资料不全');
        },
        subFilter: function(subs, data, ctrl){
            util.each(subs, function(sub){
                if (sub.type === 'admin_direct'){
                    sub.iconBtn.toggle(data.Type != 2);
                }
            });
        },
        /**
         * 版本类型格式化
         * @param  {Number} type 类型代码
         * @return {String}      版本类型
         */
        formatCategory:function(type){
            switch (type){
                case 1: return LANG('有产品版');
                case 2: return LANG('无产品版');
                default:
                    return LANG('未知');
            }
        },
        formatType: function(type){
            switch (type){
                case 1: return LANG('代理');
                case 2: return LANG('直客');
                case 3: return LANG('员工');
                case 4: return LANG('管理员');
            }
        },
        formatCostRate: function(val){
            val = +val || 0;
            return (val ? val + '%' : '-');
        },
        /**
         * 可用信用额度渲染函数
         * @param  {Number} index 行索引
         * @param  {Number} val   信用额度
         * @param  {Object} row   行数据对象
         * @return {String}       格式化完的可用信用额度字符串
         */
        renderCreadit:function(index,val,row){
            if(row.RestAmount < 0){
                val = val + row.RestAmount;
                val = val < 0 ? 0 : val;
            }
            return format.currency(val);
        },
        // 列表status状态操作渲染，这里不使用functional配置
        reanderFunctional: function(index,value,row,col,td,list,rowDom){
            var html = '';
            var manualDeny = row.ManualDeny;
            var status = row.Status||1;
            // 系统判断原因
            var systemDeny = row.SystemDeny || {};
            var reason = '';
            var reason1 = systemDeny.contract  && LANG('合同到期') || '';
            var reason2 = systemDeny.arrears  && LANG('账户欠费') || '';
            var reason3 = !systemDeny.contract && !systemDeny.arrears && LANG('正常') || '';
            reason = reason1 + (reason1&&reason2&&'、'||'') + reason2 + reason3;
            var status_map = {
                '1': {'text': LANG('系统启用'), 'icon': 'runing'},
                '2': {'text': LANG('系统禁用'), 'icon': 'suspend'}
            };
            var manualDeny_map = {
                '1': {'text': LANG('人工启用'), 'icon': 'manualStart'},
                '2': {'text': LANG('人工禁用'), 'icon': 'manualPause'}
            };
            //手工强制状态manualDeny, 1 强制启用 ，2 强制禁用， 3 正常
            //用户当前的状态status，1：启用，2，禁用
            if(manualDeny == 3 || !manualDeny){
                return html = '<a data-status="'+status_map[status].text+'" data-reason="'+reason+'" ><em class="G-iconFunc '+status_map[status].icon+'"/></a>';
            }else if(manualDeny == 1 || manualDeny == 2){
                //manualDeny为1,2的情况
                return html = '<a data-status="'+manualDeny_map[manualDeny].text+'" data-reason="'+reason+'" title="'+LANG("点击取消人工控制")+'"href="#" data-op="manual" ><em class="G-iconFunc '+manualDeny_map[manualDeny].icon+'"/></a>';
            }
        },
        // 鼠标移入移出事件，控制提示框显隐
        eventShowStatusTips: function(evt, elm){
            var tip  = this.get('StatusTips');
            switch (evt.type){
                case 'mouseenter':
                    elm = $(elm);
                    var statusTips = elm.attr("data-status");
                    var reasonTips = elm.attr("data-reason");
                    var html = $([
                        '<p>',
                        LANG('当前状态：')+statusTips,
                        '</p>',
                        '<p>',
                        LANG('系统判断：')+reasonTips,
                        '</p>'
                    ].join(''))

                    if (!tip){
                        tip = this.create('StatusTips', popwin.tip, {
                            'width': 200,
                            'pos': 'tm',
                            'anchor': elm,
                            'autoHide': 1,
                            'outerHide': 1
                        });
                        this.$tipContent = $('<div class="con"/>').appendTo(tip.body);
                    }else{
                        tip.reload({'anchor': elm});
                    }
                    this.$tipContent.html(html);
                    tip.show();
                    break;
                case 'mouseleave':
                    if (tip){ tip.delayHide(100); }
                    break;
            }
            return false;
        },
        // 图标点击事件，人工状态下才有点击
        eventManualEdit: function(evt, elm){
            var self = this;
            var el = $(elm);
            var index = +el.closest("tr").attr("data-index");
            if (isNaN(index)){ return false; }
            var data = this.config.data[index];
            app.confirm(LANG('真的要取消人工控制账户 (%1) 吗？', data.Name), function(isOK){
                if(isOK){
                    var param = {
                        'Id': data._id,
                        'Status': 3
                    };
                    app.data.get('/campany/stopdspuser', param, self, 'afterToggleStatus', param);
                }
            });
            return false
        }
        // 修改人工状态后，回调刷新列表
        ,afterToggleStatus: function(err, data, param){
            if (err){
                app.error(err);
                return false;
            }
            this.load();
        },
        load: function(){
            // 直客列表作为子表格时，加载时传参
            var config = this.config;
            if(config.sub_id){
                config.param = $.extend(config.param, {
                    'CampanyId': config.sub_id
                });
            }

            CustomerList.master(this, 'load', arguments);
        }
    });
    exports.customerList = CustomerList;

    // 消费明细列表
    var CostDetailList = app.extend(Base, {
        init: function(config){
            config = $.extend({
                "cols":[
                    {type:'id', width:50},
                    {name:"time",text:LANG("日期"),align:"left",format:"formatDate"}
                ]
                ,"is_sub_grid":false
                ,"hasTab":false
                ,"hasAmount":false
                ,"hasExport":false
                ,"url":"/campany/listcost"
                ,"param": {}
            }, config);

            // 根据客户类型配置列
            var cols;
            var user = app.getUser();
            switch (user && user.campany && user.campany.Type){
                case 4: // 超级管理员
                    cols = [
                        ['cost1', LANG('价格1')],
                        ['cost2', LANG('价格2')],
                        ['cost3', LANG('价格3')]
                    ];
                    break;
                case 1: // 代理客户
                    cols = [
                        ['cost2', LANG('价格1')],
                        ['cost3', LANG('价格2')]
                    ];
                    break;
                default: // 普通客户
                    cols = [['cost3', LANG('金额')]];
                    break;
            }

            var col;
            while (cols.length){
                col = cols.shift();
                config.cols.push({
                    name: col[0],
                    text: col[1],
                    align: 'right',
                    render: 'renderCreadit'
                });
            }

            // 子表格时参数处理
            if (config.is_sub_grid){
                config.is_sub_grid = false;
                // config.hasSearch = true;
                config.param = $.extend(config.param, {
                    'CampanyId': config.sub_id
                });
            }
            CostDetailList.master(this, 'init', arguments);
            this.gridType = 'costDetailList';
        },
        formatDate: function(val){
            return val?util.date("Y-m-d",val):null;
        },
        renderCreadit:function(index,val,row){
            if(row.RestAmount < 0){
                val = val + row.RestAmount;
            }
            return format.currency(val);
        },
        load: function(){
            // 消费明细列表作为子表格时，加载时传参
            var config = this.config;
            if(config.sub_id){
                config.param = $.extend(config.param, {
                    'CampanyId': config.sub_id
                });
            }

            CostDetailList.master(this, 'load', arguments);
        }
    });
    exports.costDetailList = CostDetailList;

    // 员工列表
    var EmployeeList = app.extend(Base, {
        init: function(config){
            config = $.extend({
                "cols":[
                    {type:'id', width:50},
                    {name:"UserName",text:LANG("员工姓名"),type:"index",render:_renderName},
                    {name:"QQ",text:LANG("QQ号码"),align: 'center',render:'renderContact'},
                    {name:"Phone",text:LANG("电话号码"),align: 'center',render:'renderContact'},
                    {name:"Address",text:LANG("地址"),align: 'center',render:'renderContact'},
                    {name:"Auth",text:LANG("权限"),align:"center",format:"formatAuth"},
                    {name:"CreateTime",text:LANG("登录信息"),render:_renderLoginInfo}
                ]
                ,"is_sub_grid":false
                ,"hasTab":false
                ,"hasAmount":false
                ,"hasExport":false
                ,"url":"/campany/listemployee"
                ,"param": {}
            }, config);
            // 子表格时参数处理
            if (config.is_sub_grid){
                config.is_sub_grid = false;
                // config.hasSearch = true;
                config.param = $.extend(config.param, {
                    'CampanyId': config.sub_id
                });
            }
            EmployeeList.master(this, 'init', arguments);
            this.gridType = 'employeeList';
        },
        renderContact: function(index,val,row,con){
            if(!val){
                return '--'
            }
            return val;

        },
        formatAuth: function(val){
            switch(val){
                case 1:
                    val = LANG("只读");
                    break;
                case 2:
                    val = LANG("可读写");
                    break;
                case 3:
                    val = LANG("管理员");
                    break;
                default:
                    val = LANG("未设置");
                    break;
            }
            return val;
        },
        load: function(){
            // 员工列表作为子表格时，加载时传参
            var config = this.config;
            if(config.sub_id){
                config.param = $.extend(config.param, {
                    'CampanyId': config.sub_id
                });
            }

            EmployeeList.master(this, 'load', arguments);
        }
    });
    exports.employeeList = EmployeeList;

    // 用户列表
    var UserList = app.extend(Base, {
        init: function(config){
            config = $.extend({
                "cols":[
                    {type:'id', width:50},
                    {name:"UserName",text:LANG("名称"),type:"index",render:_renderName},
                    {name:"Type",text:LANG("角色"),align:"left",render:_renderRole},
                    {name:"CreateTime",text:LANG("登录信息"),render:_renderLoginInfo}
                ]
                ,"is_sub_grid":false
                ,"hasTab":false
                ,"hasAmount":false
                ,"hasExport":false
                ,"url":"/campany/listdspuser"
            }, config);
            UserList.master(this, 'init', arguments);
            this.gridType = 'userList';
        }
    });
    exports.userList = UserList;


    // 回收站列表
    var Recycle = app.extend(Base, {
        init: function(config){
            config = $.extend({
                "cols":[
                    {type:'id', width:50},
                    {name:"UserName",text:LANG("名称"),type:"index",render:_renderName},
                    {name:"Name",text:LANG("邮箱"),align:"left"},
                    {name:"Type",text:LANG("角色"),align:"left",render:_renderRole},
                    {name:"DeleteTime",text:LANG("删除时间"),align:"center",format:"formatDate"}
                ]
                ,"is_sub_grid":false
                ,"hasTab":false
                ,"hasAmount":false
                ,"hasExport":false
                ,"url":"/campany/listdspuser?IsDeleted=1"
            }, config);
            Recycle.master(this, 'init', arguments);
            this.gridType = 'recycle';
        },
        formatDate: function(val){
            return val?util.date("Y-m-d H:i:s",val):null;
        }
    });
    exports.recycle = Recycle;

    // 日志列表
    var Log = app.extend(Base, {
        init: function(config){
            config = $.extend({
                "cols":[
                    {type:'id', width:50},
                    {name:"CreateTime",text:LANG("时间"),type:"index",format:"formatDate"},
                    {name:"CreateUserName",text:LANG("帐号"),align:"left",render:"renderName"},
                    {name:"text",text:LANG("内容"),align:"left",render:"renderText"}
                ]
                ,"is_sub_grid":false
                ,"hasTab":false
                ,"hasAmount":false
                ,"hasExport":false
                ,"url":"/campany/listoperationlog"
            }, config);
            Log.master(this, 'init', arguments);
            this.gridType = 'log';
        },
        renderName: function(i, val, data){
            val = data.CampanyName ? data.CampanyName+"<br>"+ val : val;
            return val;
        },
        formatDate: function(val){
            return val?util.date("Y-m-d H:i:s",val):null;
        },
        renderText: function(i, val, data){
            var dom = $('<div/>').text(val);

            // 暂时只有活动的编辑操作有详情
            if(data.Type == 2 && data.Model == "Campaign"){
                var link = $('<a class="logDetailLink"/>').text(LANG('详情'));
                this.jq(link, 'click',data.Id, 'eventShowLogDetail');
                link.appendTo(dom);
            }
            return dom;
        },
        // 日志详情页
        eventShowLogDetail: function(ev){
            app.navigate('admin/logDetail/'+ev.data);
        }
    });
    exports.log = Log;

    // 消息公告
    var Notice = app.extend(Base, {
        init: function(config){
            config = $.extend({
                "cols":[
                    {type:'id', width:50},
                    {name:"Title",text:LANG("标题"),type:"index",width:240,render:"renderTitle"},
                    {name:"To",text:LANG("收件人"),align:"left",width:220,render:"renderName"},
                    {name:"From",text:LANG("发布人"),align:"left"},
                    {name:"CreateTime",text:LANG("发布时间"),align:"left",format:"formatDate"}
                ]
                ,"is_sub_grid":false
                ,"hasTab":false
                ,"hasAmount":false
                ,"hasExport":false
                ,"url":"message/index"
            }, config);
            Notice.master(this, 'init', arguments);
            this.gridType = 'log';
        },
        renderTitle: function(i, val, data,con){
            var dom = $('<div class="M-tableListWidthLimit" />');
            return dom.text(val).width(con.width).attr("title",val);
        },
        renderName: function(i, val, data,con){
            var dom = $('<div class="M-tableListWidthLimit" />');
            var arr=[];
            $.each(val,function (index,value){
                arr.push(value)
            })
            return dom.text(arr.join('、')).width(con.width).attr("title",arr.join('、'));

        },
        formatDate: function(val){
            return val?util.date("Y-m-d H:i:s",val):null;
        }
    });
    exports.notice = Notice;

    // 代码管理列表
    var CodeList = app.extend(Base, {
        init: function(config){
            config = $.extend({
                "cols":[
                    {type:'id', width:50},
                    {name:"Name",text:LANG("自定义代码名称"),type:"index",align:"left"},
                    {name:"Url",text:LANG("代码页面地址"),align:"left"},
                    {name:"CreateTime",text:LANG("修改时间"),align:"left",render:"renderTime"}
                ]
                ,"is_sub_grid":false
                ,"hasTab":false
                ,"hasAmount":false
                ,"hasExport":false
                ,"url":"/sweety/listcustomcode"
            }, config);
            CodeList.master(this, 'init', arguments);
            this.gridType = 'codeList';
        },
        //显示更新时间；若初次创建，显示创建时间
        renderTime: function(i, val, data){
            val = (data.UpdateTime) ? data.UpdateTime:data.CreateTime;
            return val?util.date("Y-m-d H:i:s",val):null;
        }
    });
    exports.codeList = CodeList;

    // 同步用户群体列表
    var SyncList = app.extend(Base, {
        init: function(config){
            config = $.extend({
                "cols":[
                    {type:'id', width:50},
                    {name:"Url",text:LANG("网站"),type:"index",align:"left"},
                    {name:"AuthorizeCode",text:LANG("授权码"),align:"left"},
                    {name:"Status",text:LANG("同步状态"),align:"center"}
                ]
                ,"is_sub_grid":false
                ,"hasTab":false
                ,"hasAmount":false
                ,"hasExport":false
                ,"url":"/campany/listsyn"
            }, config);
            //Z 修改了一个编写错误
            SyncList.master(this, 'init', arguments);
            this.gridType = 'syncList';
        }
    });
    exports.syncList = SyncList;

    // 同步用户群体详情列表
    var SyncDetailList = app.extend(Base, {
        init: function(config){
            config = $.extend({
                "cols":[
                    {type:'id', width:50},
                    {name:"Name",text:LANG("自定义用户"),type:"index",align:"left"},
                    // {name:"Duration",text:LANG("有效期"),align:"left"},
                    {name:"Visitors",text:LANG("已有用户数"),align:"right"}
                ]
                ,"is_sub_grid":false
                ,"hasTab":false
                ,"hasAmount":false
                ,"hasExport":false
                ,"url":"/sweety/listvisitorcategorizeinfo"
                ,"auto_load": false
            }, config);
            // 修改了一个编写错误
            SyncDetailList.master(this, 'init', arguments);
            this.gridType = 'syncDetailList';
        }
    });
    exports.syncDetailList = SyncDetailList;

    // 消息管理列表
    var MessageList = app.extend(Base, {
        init: function(config) {
            config = $.extend(true, {
                "cols":[
                    {type: 'id', width: 50},
                    {name:"Title", text: LANG("标题"), type: "index", align: "left", width: 280, render:"renderTitle"},
                    // 使用renderNames来生成格式化的名字
                    {name:"To", text: LANG("收件人"), align: "center", render:"renderNames", width: 250, type: "index"},
                    {name:"From", text: LANG("发布人"), align: "left", type: "index"},
                    // 使用formatDate来生成格式化的时间
                    {name:"CreateTime", text: LANG("发布时间"), align: "left", format:"formatDate", type: "index"}
                ],
                "is_sub_grid": false,
                "hasTab": false,
                "hasAmount": false,
                "hasExport": false,
                // 资源url，该Base会读取资源生成列表
                "url": "message/index"
            }, config);
            MessageList.master(this, 'init', arguments);
            this.gridType = 'messageList';
        },
        // 格式化时间
        formatDate: function(val) {
            return val?util.date("Y-m-d H:i:s",val):null;
        },
        renderTitle: function(i, val, data,con){
            var dom = $('<div class="M-tableListWidthLimit" />');
            return dom.text(val).width(con.width).attr("title",val);
        },
        renderNames: function(i, val, row, con) {
            if (!val || !val.length) {
                return LANG('所有人');
            }
            var result = [];
            for (var j = 0, len = val.length; j < len; j++) {
                if (val[j]) {
                    result.push(val[j]);
                }
            }
            var resultStr = result.join('、');
            return $('<div class="M-tableListWidthLimit" title="' + resultStr + '">').width(con.width).text(resultStr);
        }
    });
    exports.messageList = MessageList;

    // 联系人列表
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
                ,'emptyText': LANG('请添加联系人')
                ,"url":""
            }, config);

            LinkmanList.master(this, 'init', arguments);
        }
    });
    exports.linkmanList = LinkmanList;

    // 推广顾问列表
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
                ,'emptyText': LANG('请添加推广顾问')
                ,"url":""
            }, config);

            AdviserList.master(this, 'init', arguments);
        }
    });
    exports.adviserList = AdviserList;

    // 资质列表
    var AptitudeList = app.extend(Base, {
        init: function(config){
            config = $.extend({
                "cols":[
                    {name:'_id', width:50, align:'center',sort:false},
                    {name:"UserName",text:LANG("公司名称"),sort:false,type:"index",width:150,render:'renderName'},
                    {name:"SiteName",text:LANG("网站名"),sort:false,align:'left',width:150,render:'renderName'},
                    {name:"SiteUrl",text:LANG("网址"),sort:false,align:'left',width:150,render:'renderName'},
                    {name:"CreateUserName",text:LANG("资质所属"),sort:false,align:'left',width:200,render: 'renderSource'},
                    {name:'verifyStatus',text:LANG("审核状态"),sort:false,render:'renderVerifyStatus',align:'center',width:80,type:'op'}
                ]
                ,'opClick':true
                ,"hasTab":false
                ,"hasAmount":false
                ,"hasExport":false
                ,"url":"/campany/listqualification"
                ,"param": {}
            }, config);
            // 子表格时参数处理
            if (config.is_sub_grid){
                config.is_sub_grid = false;
                // config.hasSearch = true;
                config.param = $.extend(config.param, {
                    'CampanyId': config.sub_id
                });
            }
            this.verifyResults = [];
            AptitudeList.master(this, null, config);
            AptitudeList.master(this, 'init', arguments);
            this.gridType = 'aptitudeList';
            this.$verifyLists = {};

            this.$user = app.getUser();
            if(this.$user.campany.Type == 4){
                // 添加“只显示代理客户提交的资质”checkbox
                var showSubLabel = $([
                    '<div class="P-adminAptitudeListShowSub">',
                    '<label>',
                    '<input type="checkbox" value="1" class="isAgent">',
                    LANG('只显示代理客户提交的资质'),
                    '</label>',
                    // '<label class="ml20">',
                    // 	'<input type="checkbox" value="1" class="isDeleted">',
                    // 	LANG('已归档'),
                    // '</label>',
                    '</div>'
                ].join('')).insertAfter(this.getLayout('search').find('.M-commonSearchUndo'));
                // 绑定事件
                this.jq(showSubLabel.find('input.isAgent'), 'click', 'eventShowSubClick');
                this.jq(showSubLabel.find('input.isDeleted'), 'click', 'eventShowDelClick');
            }
        },
        // “搜索结果中显示其下属客户”checkbox的点击事件
        eventShowSubClick: function(ev, elm) {
            var param = this.sys_param;
            var isChecked = $(elm).prop('checked');

            // 更改搜索参数
            if (isChecked) {
                param.IsAgent = 1;
            } else {
                delete param.IsAgent;
            }

            this.load();
        },
        // 显示归档
        eventShowDelClick: function(ev, elm){
            var param = this.sys_param;
            var isChecked = $(elm).prop('checked');

            // 更改搜索参数
            if (isChecked) {
                param.IsDeleted = 1;
            } else {
                delete param.IsDeleted;
            }

            this.load();
        },
        renderVerifyStatus:function(i,val,row,con){
            this.verifyResults[i] = row.VerifyResult;
            var elm = $('<a class="G-icon rtbPosVerify" data-op="verifyStatus"/>');
            elm.attr('title', LANG("点击查看"));
            elm.attr('data-index', i);
            return elm;
        },
        onListOpClick: function(ev){
            if(ev.param.op === 'verifyStatus'){
                var idx = ev.param.index;
                var id = ev.param.data._id;
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
                        'mod': this.create(AptitudeVerify, {
                            target: subRow.div,
                            param:{Id:id}
                        }),
                        'id': id
                    };
                }else {
                    list.toggleSubRow(idx);
                    this.$verifyLists[idx].mod.load();
                }
                return false;
            }
        },
        renderName: function(i,val,row,con){
            return '<p style="width:150px" class="M-tableListWidthLimit" title="'+(val||'')+'">'+(val||'')+'</p>';
        },
        renderSource:function(i,val,row){
            var name  = val || '-';
            var email = row.CreateUserEmail || '-';
            var title = LANG("所属公司：") + name + LANG('\n%1', email);

            return [
                '<p class="M-tableListWidthLimit" style="width:190px"  title="'+title+'">',
                name,
                '</p>',
                '<p class="M-tableListWidthLimit" style="width:190px;color:#b9b9b9" title="'+title+'">',
                email,
                '</p>'
            ].join('');
        }
    });
    exports.aptitudeList = AptitudeList;

    // 资质审核状态子列表
    var AptitudeVerify = app.extend(Base,{
        init:function(config){
            var cols = [
                //{type:'id',width:"5%"},
                //{name:'Name', text:LANG('客户'),width:200}
            ];
            // 合并RTB项目
            // var width = Math.round(80 / app.config('exchanges').length) + '%';
            util.each(app.config('exchanges'), function(ex){
                //根据全局配置
                if(util.exist(app.config('exchange_group/aptitude_group'), ex.id)){
                    cols.push({
                        name: 'Info',
                        render: 'renderStatus',
                        align: 'center',
                        width: 100,
                        param: ex.id
                        ,head_html: this.renderHead(ex.id, ex.name)
                    });
                }
            }, this);

            config = $.extend({
                "cols":cols,
                'url': '/campany/listqualification',
                'param':null,  //参数
                'hasSearch':false,
                'hasExport': false,  // 是否有导出模块
                'hasAmount': false,	// 是否有总计模块
                'hasTab': false,		// 是否显示栏目切换栏
                'data': null,  //静态数据
                'hasPager': false
                ,'list':{
                    'default_sort':false,
                    'rowSelect': false,
                    'scroll_type': 'row',
                    'scroll_size': 1
                }
            },config);
            AptitudeVerify.master(this, null, config);
            AptitudeVerify.master(this,'init',arguments);
            this.list.el.addClass('P-adminAptitudeVerify');
            this.dg(this.list.el,'.rejectReason','mouseenter mouseleave','eventRejectReason');
        },
        // 渲染列头html代码
        renderHead:function(id, txt){
            var html = '<span>'+LANG(txt)+'</span><br/>';
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
                        html += (v.RejectReason && v.RejectReason.indexOf('系统判断：') === 0) ? 'sys' : 'err';
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
        }
    })
    exports.aptitudeVerify = AptitudeVerify;

    // 资质授权列表
    var AptitudeAccredit = app.extend(Base,{
        init: function(config){
            config = $.extend({
                "cols":[
                    // {type:'id', width:50},
                    {name:'_id',align:'center',"width":50},
                    {name:"UserName",text:LANG("名称"),type:"index","width":200},
                    {name:"Name",text:LANG("账号"),type:'dim',"width":200},
                    {name:"CategoryId",text:LANG("版本"),format:'formatCategory',align:'center',"width":80}
                ]
                ,"url":"/campany/listcustomer?no_limit=1"
            }, config);

            AptitudeAccredit.master(this, null, config);
            AptitudeAccredit.master(this, 'init', arguments);
        },
        //版本类型格式化
        formatCategory:function(type){
            switch (type){
                case 1: return LANG('有产品版');
                case 2: return LANG('无产品版');
                default:
                    return LANG('未知');
            }
        }
    });
    exports.aptitudeAccredit = AptitudeAccredit;

    // 帮助中心列表
    var HelpList = app.extend(
        Base
        ,{
            init:function(config){
                config = $.extend(
                    {
                        "cols":[
                            {name:"_id",width:'5%',align:'center'},
                            {name:"CreateTime",text:LANG('日期'), align:'center', sort:false, width:120},
                            {name:"Title",text:LANG('标题'), align:'left', sort:false, width:400,render:'renderTitle'},
                            {name:"Butt",text:LANG("对接情况"), sort:false, align:'center', width:100, render:"renderButt"},
                            {name:'Products', text: LANG('系统版本'), sort:false, align:'center',width:100,render:'renderProducts'},
                            {name:'Proxy', text:LANG('客户类型'),sort:false, align:'center',width:100, render:'renderProxy'}
                        ]
                        //,"sort":"CreateTime"
                        ,"hasTab":false
                        ,"hasExport":false
                        ,"hasAmount":false
                        ,"hasSearch":true
                        ,"url":"faq/displayfaqtopic"
                    }
                    ,config
                );

                HelpList.master(this,null,config);
                HelpList.master(this,"init",[config]);
            },
            renderTitle:function(i,val,row){
                return '<p style="width:380px" class="M-tableListWidthLimit" title="'+val+'">'+val+'</p>';
            },
            renderButt: function(i,val,row,con){
                return ['', LANG('已对接'), LANG('未对接'), LANG('不限')][val];
            },
            renderProducts: function(i,val,row,con){
                return ['', LANG('有产品'), LANG('无产品'), LANG('不限')][val];
            },
            renderProxy: function(i,val,row,con){
                return ['', LANG('直客'), LANG('代理'), LANG('不限')][val];
            }
        }
    );
    exports.helpList = HelpList;

    // 发票管理列表
    var InvoiceList = app.extend(
        grid.invoiceDetail
        ,{
            init:function(config){
                config = $.extend(
                    {
                        "cols":[
                            {type:"id"},
                            {name:"CreateTime",text:LANG('日期'), align:'center', width:120},
                            {name:"CampanyName",text:LANG('客户'), align:'left', sort:false, width:120,render:'renderName'},
                            {name:"Amount",text:LANG("发票金额"), render:"renderAmount", sort:false, width:120},
                            {name:'Content', text: LANG('内容'), sort:false, align:'left',width:100,render:'renderContent'},
                            {name:'Status', text:LANG('发票状态'), align:'left', render:'renderStatus',sort:false}
                        ]
                        ,"sort":"CreateTime"
                        ,"hasTab":false
                        ,"hasExport":false
                        ,"hasAmount":false
                        ,"hasSearch":true
                        ,"url":"invoice/listinvoicerecord"
                    }
                    ,config
                );

                InvoiceList.master(this,null,config);
                InvoiceList.master(this,"init",[config]);
            },
            renderName:function(i,val,row){
                var title = LANG("所属客户：") + row.CampanyMail;
                return '<p>'+val+'</p><p class="M-tableListWidthLimit emailName" title="'+title+'">'+row.CampanyMail+'</p>';
            },
            renderContent: function(i,val,row,con){
                var type = row.Info.Type==1 ? LANG("普通") : LANG("专用");
                var title = LANG("发票内容：") + val;
                return '<p>'+type+'</p><p style="width:100px" class="M-tableListWidthLimit invoiceContent" title="'+title+'">'+val+'</p>';
            }
        }
    );
    exports.invoiceList = InvoiceList;

    // 添加发票页面——发票账号列表
    var InvoiceAccountList = app.extend(
        Base
        ,{
            init:function(config){
                config = $.extend(
                    {
                        "cols":[
                            {type:"id",width:30},
                            {name:"UserName",text:LANG('公司名称'), align:'left', sort:false, width:210, render:'renderName'},
                            {name:"Name",text:LANG("账号"), align:'left', sort:false, width:210, render:'renderEmail'},
                            {name:"InvoiceAmount",text:LANG("可申请发票金额"), align:'left', sort:false, width:210}
                        ]
                        ,"sort":"CreateTime"
                        ,"hasTab":false
                        ,"hasExport":false
                        ,"hasAmount":false
                        ,"hasPager": false
                        ,"hasSelect": false
                        ,"url":"/campany/listcustomer"
                    }
                    ,config
                );

                InvoiceAccountList.master(this,null,config);
                InvoiceAccountList.master(this,"init",arguments);
            }
            ,renderName: function(i,val,row,con){
                var title = LANG("公司名称：") + val;
                var html = '<p class="M-tableListWidthLimit" title="'+title+'">'+val+'</p>';
                return $(html).width(210);
            }
            ,renderEmail: function(i,val,row,con){
                var title = LANG("账号：") + val;
                var html = '<p class="M-tableListWidthLimit" title="'+title+'">'+val+'</p>';
                return $(html).width(210);
            }
        }
    );
    exports.invoiceAccountList = InvoiceAccountList;

    // 订单管理——首选交易
    var DealPrefList = app.extend(Base, {
        init:function(config, parent){
            config = $.extend({
                "cols":[
                    {name:"_id", text:LANG("ID"), type:'index', align:'center', width: 70}
                    ,{name:"Name",text:LANG("名称"), align:'left', sort:false}
                    ,{name:"Status",text:LANG('状态'), align:'center', render: 'renderStatus', sort:false, width: 70}
                    ,{name:"AdxId",text:LANG('渠道'), align:'center', render: 'renderExchange', sort:false, width: 70}
                    ,{name:"DealInfo",text:LANG('广告位数'), render: 'renderSpots', align:'center', sort:false, width: 70}
                    ,{name:"UpdateTime",text:LANG('更新时间'), render: 'renderUpdate', align:'center', sort:false, width: 70}
                ],
                "sort":"CreateTime",
                "hasTab": false,
                "hasExport":false,
                "hasAmount":false,
                "hasPager": true,
                "hasSelect": false,
                "operation":{render: 'renderOperation', cls:'M-gridOPCursor', width:100},
                "url":"/nextgen/listdeal?Type=1"
            } ,config);

            DealPrefList.master(this,null,config);
            DealPrefList.master(this,"init",arguments);
        },
        renderOperation: function(index, val, row){
            var html = [];
            html.push('<a data-op="sync">同步</a>');

            var type = app.getUser()['campany_type'];
            // 管理员添加编辑
            if(type == 4){
                html.push('<a data-op="edit">编辑</a>');
            }
            return html.join(' | ');
        },
        renderSpots: function(i, val, row){
            return row.DealInfo && row.DealInfo.SpotInfos && row.DealInfo.SpotInfos.length || 0;
        },
        renderExchange: function(i, val, row) {
            var ex = util.find(app.config('exchanges'), val, 'id');
            if (ex) {
                return ex.name;
            }
            return LANG("未知渠道");
        },
        renderStatus: function(i, val, row){
            var status = {
                1: LANG('开启'),
                2: LANG('关闭')
            }[val];
            return status;
        },
        renderUpdate: function(i, val, row){
            return [
                LANG("最近同步时间：%1", util.date("Y-m-d H:i:s", row.UpdateTime))
            ].join('');
        },
        // 同步数据
        syncData: function(param) {
            app.showLoading();
            app.data.put('/nextgen/editdeal?method=syncInfo', param, this, 'afterSync');
        },
        afterSync: function(err) {
            app.hideLoading();
            if (err) {
                app.alert(err.message);
                return false;
            }
            this.reload();
        },
        onListOpClick: function(ev) {
            var param = ev.param;
            var id = param.data._id;
            switch(param.op) {
                case 'sync':
                    this.syncData(
                        {
                            'Id': id,
                            'AdxId': param.data.AdxId
                        }
                    );
                    break;
                case 'edit':
                    window.open(window.location.href.split('#',1)+'#/admin/dealPrefEdit/'+id);
                    break;
            }
        }
    });
    exports.dealPrefList = DealPrefList;

    // 订单管理——私下竞价
    var DealPrivList = app.extend(DealPrefList, {
        init:function(config, parent){
            config = $.extend({
                "url": "/nextgen/listdeal?Type=2"
            } ,config);

            DealPrivList.master(this,null,config);
            DealPrivList.master(this,"init",arguments);
        },
        renderOperation: function(index, val, row){
            var html = [];
            html.push('<a data-op="sync">同步</a>');
            html.push('<a data-op="edit">编辑</a>');
            return html.join(' | ');
        },
        onListOpClick: function(ev) {
            var param = ev.param;
            var id = param.data._id;
            switch(param.op) {
                case 'sync':
                    this.syncData(
                        {
                            'Id': id,
                            'AdxId': param.data.AdxId
                        }
                    );
                    break;
                case 'edit':
                    app.navigate('admin/dealPrivEdit/'+id);
                    break;
            }
        }
    });
    exports.dealPrivList = DealPrivList;

});