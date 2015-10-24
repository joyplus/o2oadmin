define(function(require, exports){
    var app = require('app')
        ,view = require("view")
        ,$ = require('jquery')
        ,comm = require("common")
        ,util = require('util');

    var cookie_begin = "begindate",
        cookie_end = "enddate",
        cookie_type = "dateCountType";

    // 本地数据缓存
    var STORE = {
        'mode': app.cookie(cookie_type) === '0' ? 0 : 1,
        'begin': +app.cookie(cookie_begin) || 0,
        'end': +app.cookie(cookie_end) || 0,
        'aDay': 86400,
        init: function(){
            var begin = this.begin, end = this.end;
            var today = this.today();
            var diff = today % this.aDay;
            if (begin){
                begin -= (begin - diff) % this.aDay;
            }else {
                begin = today;
            }
            if (end){
                end -= (end - diff) % this.aDay;
                if (end < begin){ end = begin; }
            }else {
                end = begin;
            }
            end += (this.aDay - 1);
            this.begin = begin;
            this.end = end;
        },
        today: function(){
            var tmp = new Date();
            tmp.setHours(0);
            tmp.setMinutes(0);
            tmp.setSeconds(0);
            return Math.floor(tmp.getTime() / 1000);
        },
        setMode: function(mode){
            if ((mode === 0 || mode === 1) && mode != this.mode) {
                this.mode = mode;
                app.cookie(cookie_type, mode);
                return true;
            }
            return false;
        },
        setTime: function(begin, end){
            var ret = false;
            begin = +begin;
            end = +end;
            if (begin && begin != this.begin){
                this.begin = begin;
                app.cookie(cookie_begin, begin);
                ret = true;
            }
            if (end && end != this.end){
                this.end = end;
                app.cookie(cookie_end, end);
                ret = true;
            }
            if (ret){
                app.cookie(cookie_type, this.mode);
            }
            return ret;
        },
        getMode: function(){
            return this.mode;
        },
        getBegin: function(){
            return this.begin;
        },
        getEnd: function(){
            return this.end;
        }
    };
    STORE.init();

    // 功能模块代码
    function DateBar(config,parent,idObject){
        var c = this.config = $.extend(
            true
            ,{
                "target":"body"
                ,"cls":"M-dateBar"
                ,"default":{
                    "begin":0
                    ,"end":0
                }
                //,"groups":{
                //    // 只进行单次操作的
                //    "single":[
                //        {
                //            // 显示的文字
                //            "text":LANG("今天")
                //            // 开始的偏移量
                //            ,"begin":0
                //            // 结束的偏移量
                //            ,"end":0
                //            // 特殊指定操作类型
                //            // 偏移量与特殊类型操作暂时不能共存
                //            // 当前支持currentMonth，有其他特殊类型需要自行添加
                //            // ,"type":"currentMonth"
                //        }
                //        ,{
                //            "text":LANG("昨天")
                //            ,"begin":-1
                //            ,"end":-1
                //        }
                //        ,{
                //            "text":LANG("前天")
                //            ,"begin":-2
                //            ,"end":-2
                //        }
                //        ,{
                //            "text":this._getDateDay()
                //            ,"begin":-7
                //            ,"end":-7
                //        }
                //        ,{
                //            "text":LANG("最近7天")
                //            ,"begin":-7
                //            ,"end":-1
                //        }
                //        ,{
                //            "text":LANG("最近30天")
                //            ,"begin":-30
                //            ,"end":-1
                //        }
                //        ,{
                //            "text":LANG("本月")
                //            // 特殊指定操作类型
                //            ,"type":"currentMonth"
                //        }
                //    ]
                //    // 会在当前值进行累加操作的
                //    ,"accum":[
                //        {
                //            "text":LANG("前一天")
                //            ,"type":"prevDay"
                //        }
                //        ,{
                //            "text":LANG("后一天")
                //            ,"type":"nextDay"
                //        }
                //    ]
                //}
                ,"dateInputs":{
                    "cls":"btn dateInput"
                }
                // 要显示的功能按钮
                ,"buttons":[
                    // {
                    // 	"name":LANG("历史累计")
                    // 	,"type":"button"
                    // 	,"cls":"btn total"
                    // 	,"action":"toggleCountType"
                    // 	,"pos":1
                    // }
                    // ,{
                    // 	"name":LANG("查询")
                    // 	// 按钮的类型
                    // 	,"type":"button"
                    // 	,"cls":"btn primary"
                    // 	// 按钮执行的实例自身事件
                    // 	// 或需要执行的函数
                    // 	,"action":"gotoQuery"
                    // }
                ]
                ,"dateFormat":"Y-m-d"
            }
            ,config
        );

        this.el = this.createDom({
            "tag":"div"
            ,"class":c.cls
        });
        c.target = $(c.target);

        // 类型按钮实例合集
        this.types = {};

        // 功能类型按钮实例合集
        this.buttons = {};

        // 一天
        this.aDay = 86400;
        this.endDay = 86399;

        // 现在的时间。
        this.nowDate = {};

        // 现在时间对应的时间戳
        this.nowTimestamp = {};

        // 统计类型 0 - 历史累计, 1 - 时段统计
        this.countType = 1;

        // 弹出日历是否已经选择
        this.calendarSelected = 0;

        // 控件是否渲染完成
        this.ready = 0;
    }
    extend(
        DateBar,
        view.container,
        {
            init:function(){
                this.render();
                this.setDate(
                    STORE.getBegin(),
                    STORE.getEnd(),
                    STORE.getMode(),
                    true
                );
            }
            /**
             * 渲染函数
             * @return {Undefined} 无返回值
             */
            ,render:function(){
                if(!this.ready){
                    DateBar.master(this, 'render');
                    var doms = this.doms = {};
                    var dom, item, n;

                    // 生成分组
                    var groups = this.config.groups;
                    for(n in groups){
                        item = n+"Gropu";
                        this.create(item, comm.buttonGroup, {
                            tag:'span',
                            no_state: (n === 'accum'),
                            items: groups[n]
                        });
                    }
                    //添加两个三角形
                    // var $buttons = this.el.find(".G-buttonGroup").eq(1);
                    // $($buttons).prepend("<div class='left'></div>");
                    // $($buttons).append("<div class='right'></div>");
                    // 日期显示input的外部容器
                    this.create('date', comm.dateRange, {
                        'tag': 'span'
                    });

                    // 前方的按钮区域
                    var front = doms.frontButtonsArea = $('<span />').hide().prependTo(this.el);
                    // 按钮外框对象
                    var end = doms.endButtonsArea = $('<span/>').appendTo(this.el);
                    this.dg(front, 'input[data-action]', 'click', 'eventClick');
                    this.dg(end, 'input[data-action]', 'click', 'eventClick');

                    // 生成按钮
                    //groups = this.config.buttons;
                    //for(n = 0;n<groups.length;n++){
                    //    item = groups[n];
                    //    dom = $('<input/>').attr({
                    //        "type":"button"
                    //        ,"value":item.name
                    //        ,"class":item.cls
                    //        ,"data-action":item.action
                    //    });
                    //
                    //    if(item.pos){
                    //        front.css('display', 'inline');
                    //        dom.appendTo(front);
                    //    }else{
                    //        dom.appendTo(end);
                    //    }
                    //}
                }
                this.ready = 1;
                return this;
            }
            /**
             * 更新显示状态
             * @return {Undefined} 无返回值
             */
            ,updateState:function(){
            // 更新时间段
            this.$.date.setData(this.nowDate);
            // 更新按钮状态
            this.el.toggleClass('M-dateBarTotal', !this.countType);
            // 更新按钮组状态
            //var list = this.config.groups.single;
            //var group = this.$.singleGropu;
            //if (this.countType){
            //    var today = this.today();
            //    var end = today + this.endDay;
            //    var ts = this.nowTimestamp;
            //    var item, b, e, now;
            //    for (var i=0; i<list.length; i++){
            //        item = list[i];
            //        if (item.type === 'currentMonth'){
            //            now = (new Date()).getDate();
            //            b = today - (now - 1) * this.aDay;
            //            e = today + this.endDay;
            //            if (now > 1){
            //                // 数据库查询不能跨今天
            //                e -= this.aDay;
            //            }
            //        }else {
            //            b = today + item.begin * this.aDay;
            //            e = end + item.end * this.aDay;
            //        }
            //        if (b === ts.begin && e == ts.end){
            //            break;
            //        }
            //    }
            //    if (i === list.length){ i = null; }
            //    group.setData(i);
            //}else {
            //    group.setData(null);
            //}
            // 更新上周同期的按钮显示
            //var newItem = list[3];
            //newItem.text = this._getDateDay();
            //group.setItem(3, newItem);
        }
            // 窗口切换时同步时间过滤参数
            ,eventWindowFocus: function(){
            this.onChannelChange();
        }
            /**
             * 频道改变的响应函数
             * @param  {Object}    ev 消息对象
             * @return {Undefined}    无返回值
             */
            ,onChannelChange:function(ev){
            // 更新字符串格式日期
            var eventFired = this.setDate(
                STORE.getBegin(),
                STORE.getEnd(),
                STORE.getMode()
            );

            // 默认频道切换需要刷新
            if(!eventFired && ev && (!ev.param || !ev.param.silence)){
                this.triggerEvent();
            }
            // 下层实例无需响应
            return false;
        }
            /**
             * 时间段模式按钮切换
             */
            ,onChangeButton:function(ev){
            var item = ev.param.item;
            var today = this.today();
            var ts = this.nowTimestamp;
            var b = ts.begin,e = ts.end;
            var oneDay = this.aDay;

            switch (item.type){
                case 'currentMonth':
                    var now = (new Date()).getDate();
                    b = today - (now - 1) * oneDay;
                    e = today + this.endDay;
                    if (now > 1){
                        e -= oneDay;
                    }
                    break;
                case 'prevDay':
                    b -= oneDay;
                    e -= oneDay;
                    if ((e-b)>oneDay && b<today && e>=today){
                        // 跨度大于1天, 不允许包含今天
                        return false;
                    }
                    break;
                case 'nextDay':
                    b += oneDay;
                    e += oneDay;
                    if (b > today || ((e-b)>oneDay && b<today && e>=today)){
                        // 时间跨一天, 不允许包含今天
                        return false;
                    }
                    break;
                default:
                    // 偏移量处理
                    b = today + item.begin * oneDay;
                    e = today + item.end * oneDay + this.endDay;
                    break;
            }
            this.setDate(b, e, 1);
            return false;
        }
            /**
             * 日历选择时间段事件
             */
            ,onDateRangeChange: function(ev){
            var date, begin, end;
            date = util.toDate(ev.param.begin);
            begin = Math.floor(date.getTime() / 1000);
            date = util.toDate(ev.param.end);
            end = Math.floor(date.getTime() / 1000);
            this.setDate(begin, end, 1);
            return false;
        }
            /**
             * 普通按钮点击事件
             */
            ,eventClick: function(evt, elm){
            var act = $(elm).attr('data-action');
            act = 'action' + util.ucFirst(act);
            if (this[act]){ this[act](); }
        }
            /**
             * 切换统计类型
             * @return {Undefined} 无返回值
             */
            ,actionToggleCountType:function(val){
            // 切换统计类型
            this.setDate(null, null, this.countType?0:1);
        }
            /**
             * 返回今天的时间戳
             */
            ,today: function(){
            var tmp = new Date();
            tmp.setHours(0);
            tmp.setMinutes(0);
            tmp.setSeconds(0);
            return Math.floor(tmp.getTime() / 1000);
        }
            /**
             * 设置控件日期范围
             * @param {Number} begin   开始时间戳
             * @param {Number} end     结束时间戳
             * @param {Bool}   noEvent 是否触发变更事件
             * @param {Bool}   hasToday 所有日期时是否包含今天
             * @return {Bool}  返回是否触发通知事件
             */
            ,setDate: function(begin, end, type, noEvent, hasToday){
            var update = false;
            var oneDay = this.aDay;

            if (begin !== null || end !== null){
                var c = this.config;

                // 初始化时间戳
                var today = this.today();
                var diff = today % oneDay;
                if (begin){
                    begin -= (begin - diff) % oneDay;
                }else {
                    begin = today;
                }
                if (end){
                    end -= (end - diff) % oneDay;
                    if (end < begin){ end = begin; }
                }else {
                    end = begin;
                }
                end += this.endDay;

                if(!hasToday){
                    if ((end-begin)>oneDay && begin<today && end>=today){
                        // 不能跨今天多天查询
                        end = today - 1;
                    }
                }

                // 更新变量
                var ts = this.nowTimestamp;
                if (begin != ts.begin || end != ts.end){
                    ts.begin = begin;
                    ts.end = end;
                    ts = this.nowDate;
                    ts.begin = util.date(c.dateFormat,begin);
                    ts.end = util.date(c.dateFormat,end);

                    // 更新Cookie
                    STORE.setTime(begin, end);
                    update = true;
                }
            }

            if ((type === 0 || type === 1) && type != this.countType) {
                this.countType = type;
                STORE.setMode(type);
                update = true;
            }

            if (update){
                // 更新显示状态
                this.updateState();

                // 发送更新通知
                if (!noEvent){
                    this.triggerEvent();
                    return true;
                }
            }
            return false;
        }
            /**
             * 触发父模块广播日期修改事件
             */
            ,triggerEvent: function(){
            var p = this.parent();
            if (!p){ return false; }
            var date,item = this.getNowType();
            if (this.countType){
                // 不启用历史统计
                date = {
                    "nowDate":this.nowDate
                    ,"nowTimestamp":this.nowTimestamp
                    ,"item":item
                }
            }else{
                date = {
                    "stastic_all_time":1
                    ,"item":item
                }
            }
            item = null;
            return p.cast("changeDate",date);
        }
            /**
             * 获取当前激活的日期类型
             * @return {Object} 日期对象数据对象
             */
            ,getNowType:function(){
            var group = this.$.singleGropu
                ,type;
            type = group && group.getData(1) || null;
            if(type && type.id !== undefined && type.text){
                type = {
                    "id":type.id
                    ,"text":type.text.text
                }
            }else{
                type = null;
            }
            group = null;
            return type;
        }
            ,onChangeDate: function(){
            return false;
        }
            /**
             * 获取今天是星期几
             * @param  String pre 前缀
             * @return String    结果字符串
             */
            ,_getDateDay: function() {
            var dayList = [LANG('日'), LANG('一'), LANG('二'), LANG('三'), LANG('四'), LANG('五'), LANG('六')];
            var day  = new Date().getDay();
            return LANG("上周") + dayList[day];
        }
        }
    );

    exports.datepicker = DateBar;

    /**
     * 判断是否包含今天的时间
     * @return {Object} 时间戳对象
     */
    exports.isContainsToday = app.isContainsToday = function(){
        var isContains = false;
        if(GetDate() && GetDate().enddate && STORE.today()){
            // 获取cookie中的结束时间是否大于今天的开始的时间；
            isContains = GetDate().enddate > STORE.today();
        }
        return isContains;
    }


    /**
     * 获取cookie中的时间
     * @return {Object} 时间戳对象
     */
    var GetDate = exports.getDate = app.getDate = function(){
        if (STORE.getMode()){
            return {
                'begindate': STORE.getBegin(),
                'enddate': STORE.getEnd()
            };
        }else{
            return {"stastic_all_time":1};
        }
    }
});