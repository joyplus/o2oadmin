define(function(require, exports){
    var $ = require("jquery")
        ,app = require("app")
        ,view = require("view")
        ,common = require("common")
        ,country = require("country")
        ,util = require('util')
        ,tab = require('tab')
        ,grid = require('grid')
        ,popwin = require("popwin")
        ,form = require('form');

    /**
     * 分步骤表单控制模块
     */
    function Step(config, parent){
        if (app.util.isArray(config)){
            config = {list: config};
        }
        config = $.extend({
            'class': 'M-formStep',
            'target': parent,
            'btn_target': null,
            'list': null,
            'step': 0,
            'jump': false,
            'showStep':true,
            'floatMode': false,
            'forceSave':false
        }, config);
        this.step = config.step;
        this.maxStep = 0;
        Step.master(this, null, config);
    }
    extend(Step, view.container, {
        init: function(){
            this.render();
            var c = this.config;
            if (!c.list || !c.list.length){
                return false;
            }

            // 创建步骤列表
            var stepCon = this.el;
            if (c.floatMode){
                this.floatCon = $('<div class="M-formStepFloatCon"/>').appendTo(stepCon);
                stepCon = this.floatHead = $('<div class="M-formStepFloatHead"/>').appendTo(this.floatCon);
                stepCon.width(stepCon.width());
            }
            this.list = $('<ul class="M-formStepList"/>').appendTo(stepCon);
            this.steps = [];
            var item, len = c.list.length-1;
            for (var i=0; i<=len; i++){

                item = c.list[i];
                if (app.util.isString(item)){
                    item = {'text': item, 'id':(i+1), 'type':'circel', 'end':'arrow'};
                }else {
                    item = $.extend({'id':(i+1), 'type':'circel', 'end':'arrow'}, item);
                }
                item.index = i;

                // showStep
                if(c.showStep){
                    item.dom = $('<li/>').attr('data-index', i).appendTo(this.list);
                    $('<em class="M-formStepType '+item.type+'"/>').text(item.id).appendTo(item.dom);
                    item.text = $('<span class="M-formStepText"/>').text(item.text).appendTo(item.dom);
                }

                this.steps.push(item);
            }

            if(c.showStep){
                // 计算宽度
                var firstItem=this.steps[0].dom;
                var lastItem=this.steps[len].dom;
                var width = stepCon.width();
                var pad = Math.max(firstItem.width(), lastItem.width());
                var space = Math.floor((width - pad) / len);
                firstItem.width(pad).css('paddingRight', (space-pad) / 2);
                lastItem.width(pad).css('paddingLeft', (space-pad) / 2);
                for (i=1; i<len; i++){
                    this.steps[i].dom.width(space);
                }

                // 插入棒棒
                var barCon = $('<div class="M-formStepBar"/>').prependTo(stepCon);
                barCon.css({
                    'width': width - pad,
                    'margin-left': (pad - width)/2,
                    'left': '50%'
                });
                this.bar = $('<em/>').appendTo(barCon);

                // 显示分布条, 绑定点击事件
                if (c.jump){
                    this.dg(this.list, '.M-formStepType,span', 'click', 'eventJump');
                }
            }else{
                this.el.hide();
            }

            // 创建按钮
            this.btns = $('<div class="M-formStepBtns"/>').appendTo(c.btn_target || this.el);
            this.draft = this.create(
                'draft', common.button,
                {'target':this.btns, 'text':LANG('保存草稿'), data:'draft', 'class':'btnBigGray'}
            );
            this.back = this.create(
                'back', common.button,
                {'target':this.btns, 'text':LANG('上一步'), data:'back', 'class':'btnBigGreen'}
            );
            this.next = this.create(
                'next', common.button,
                {'target':this.btns, 'text':LANG('下一步'), data:'next', 'class':'btnBigGreen'}
            );
            this.save = this.create(
                'save', common.button,
                {'target':this.btns, 'text':LANG('保存'), data:'save', 'class':'btnBigGreen'}
            );
            this.cancel = this.create(
                'cancel', common.button,
                {'target':this.btns, 'text':LANG('取消'), data:'cancel', 'class':'btnBigGray'}
            );

            if (c.floatMode){
                this.floatBtn = $('<div class="M-formStepFloatBtns"/>').insertBefore(this.btns);
                this.btns.appendTo(this.floatBtn);
            }

            this.update('init');

            // 显示分步并且设置为漂浮模式, 绑定监控事件
            if (c.showStep && c.floatMode){
                var self = this;
                self.$floatStat = {
                    'topFloat': false,
                    'topLeft': 0,
                    'btnFloat': false
                };

                var callback = function(evt){
                    var type = evt && evt.type || 'interval';
                    self.updateFloat(type);
                };
                setInterval(callback, 300);
                $(window).bind('scroll resize', callback);
            }
        },
        /**
         * 设定当前所处的步骤
         * @param  {Number} step 第N步。N>=0;
         * @param  Bool}    force 强制跟新
         * @return {Number}      当前步骤编号
         */
        setStep: function(step, force, mode){
            if (step < 0 || (this.config.floatMode ? step > this.maxStep : step >= this.steps.length)){
                return false;
            }
            if (this.step == step && !force){
                return true;
            }
            this.step = step;
            this.update(mode || (this.step > step ? "back" : "next"));
            return step;
        },
        //拉取数据后，更新步骤按钮和保存取消按钮
        switchForceSave: function(state){
            var c = this.config;
            if (state == c.forceSave){ return; }
            c.forceSave = state;

            if(state){
                // 编辑状态, 显示最大步骤
                if (c.floatMode){
                    this.maxStep = this.steps.length-1;
                }
            }else {
                this.maxStep = this.step;
            }
            //更新
            this.update('load');
        },
        update: function(mode){
            var c = this.config;
            var steps = this.steps;
            var len = steps.length-1;
            var step = this.step;
            var max = Math.max(this.maxStep, step);

            if(c.showStep){
                for (var i=0; i<=len; i++){
                    steps[i].dom
                        .toggleClass('jump', (c.jump && (!c.floatMode || i <= max)))
                        .toggleClass('act', (i <= max))
                        .toggleClass('now', (i == step));
                }
                // 更新进度条
                this.bar.animate({'width': (max / len * 100) + '%'}, 200);
            }

            // 上一步按钮状态
            this.back[step > 0 ? 'show':'hide']();
            // 下一步按钮状态
            this.next[step < len ? 'show':'hide']();
            // 保存按钮状态
            this.save[(c.forceSave || max == len)?'show':'hide']();

            // 发送更新消息
            if (mode != 'silent'){
                steps[step].mode = mode;
                this.fire('stepUpdate', {
                    'index':step,
                    'mode':mode,
                    'max':max,
                    'step':steps[step]
                });
            }
        },
        updateFloat: function(mode){
            // 判断模块是否可见
            if (this.el.width() > 0){
                var stat = this.$floatStat;
                var vp = util.getViewport();
                var offset, isFloat;

                if (mode != 'interval'){
                    // 顶部分步状态判断
                    offset = this.el.offset();
                    // 设置固定状态
                    isFloat = (vp.top + 5 > offset.top);
                    if (isFloat !== stat.topFloat){
                        stat.topFloat = isFloat;
                        this.floatCon.toggleClass('M-formStepFloated', isFloat);
                    }
                    // 更新左侧固定坐标
                    isFloat = isFloat ? offset.left - vp.left : 0;
                    if (isFloat != stat.topLeft){
                        stat.topLeft = isFloat;
                        this.floatHead.css('margin-left', isFloat);
                    }
                }

                // 底部按钮容器状态判断
                offset = this.floatBtn.offset();
                isFloat = (vp.top + vp.height < offset.top + 40);
                if (isFloat !== stat.btnFloat){
                    stat.btnFloat = isFloat;
                    this.btns.toggleClass('M-formStepFloated', isFloat);
                }
            }
        },
        onButtonClick: function(ev){
            switch (ev.param){
                case 'back':
                    if (this.step <= 0){
                        return false;
                    }
                    this.step--;
                    break;
                case 'next':
                    if (this.step >= this.steps.length -1){
                        return false;
                    }
                    this.step++;
                    if (this.maxStep >= 0 && this.maxStep < this.step){
                        this.maxStep = this.step;
                    }
                    break;
                case 'save':
                    this.fire('stepSave');
                    return false;
                case 'cancel':
                    this.fire('stepCancel');
                    return false;
                case 'draft':
                    this.fire('stepDraft');
                    return false;
                default:
                    return false;
            }
            this.update(ev.param);
            return false;
        },
        /**
         * 直接跳转步骤事件函数，点击过的下一步才能跳转
         * @return {None} 无返回
         */
        eventJump: function(evt, elm){
            var idx = +$(elm).parent().attr('data-index');
            if (isNaN(idx) || idx < 0 || (this.config.floatMode ? idx > this.maxStep : idx >= this.steps.length)){
                return false;
            }
            this.step = idx;
            this.update('jump');
        },
        // 禁用保存按钮
        disableSaveBtn: function() {
            this.save.disable();
            return false;
        },
        // 启用保存按钮
        enableSaveBtn: function() {
            this.save.enable();
            return false;
        },
        // 隐藏某个操作按钮
        hideBtn: function(name) {
            if(util.isString(name)){
                if(this[name]){
                    this[name].hide();
                }
            }else if(util.isArray(name)){
                util.each(name, function(item, idx){
                    if(item && this[item]){
                        this[item].hide();
                    }
                }, this);
            }
            return this;
        },
        //还原到步骤一
        reset: function (){
            this.setStep(0);
            for (var i=0; i<=2; i++){
                this.steps[i].dom.toggleClass('now', (i === 0));
            }
            this.switchForceSave(false);
        }
    });
    exports.step = Step;

    /**
     * 表单项目基类
     */
    function Item(config, parent, id){
        config = $.extend({
            'class': 'M-formItem',
            'target': parent,
            'label': LANG('标签'),
            'pos': 'before',
            'beforeText': null,
            'afterText': null,
            'afterHtml': null,
            'tip': null,
            'content': null
        }, config);
        Item.master(this, null, config);
        this.config.id = 'form_el_' + id.guid;
    }
    extend(Item, view.container, {
        init: function(){
            var c = this.config;
            var el = this.el;
            if (c.content){
                el.append(c.content);
            }
            if (c.beforeText){
                this.$beforeText = $('<span class="M-formItemPrefix" />').text(c.beforeText).prependTo(el);
            }
            if (c.afterText){
                el.append(c.afterText.big());
            }
            if (c.afterHtml){
                el.append(c.afterHtml);
            }
            if (c.tip){
                this.tip = $('<li class="M-formItemTip"/>').text(c.tip).appendTo(el);
            }
            if (c.label){
                this.label = $('<label for="'+c.id+'" class="M-formItemLabel"/>').text(c.label);
                if (c.pos == 'after'){
                    this.label.appendTo(el);
                }else {
                    this.label.prependTo(el);
                }
            }
            this.render();
        }
    });
    exports.item = Item;

    /**
     * 输入框模块
     */
    function Input(config){
        config = $.extend({
            'holder': '',
            'value': '',
            'type': 'text',
            'tips':'',		// 提示说明
            'hasStandar': false, // 配置数字大小写转换
            'hasStandarUnit': true, // 配置数字大小写是否带单位
            'width': null,
            'height': null
        }, config);
        Input.master(this, null, config);
    }
    extend(Input, Item, {
        init: function(){
            var c = this.config;

            // 建立DOM对象
            if(c.type == "textarea"){
                this.input = $('<textarea/>').attr({
                    'id': c.id
                }).appendTo(this.el);
            }else{
                this.input = $('<input/>').attr({
                    'id': c.id,
                    'type': c.type,
                    'placeholder': c.holder,
                    'value': c.value
                }).appendTo(this.el);
                // 鼠标事件
                this.jq(this.input, 'focus', 'click');
                this.jq(this.input, 'blur', 'blur');
            }
            if(c.height){
                this.input.height(c.height);
            }

            Input.master(this,'init');
            this.updateWidth();

            // 提示说明
            if(c.tips){
                this.create('tips',common.tips,{
                    target: this.el,
                    tips:c.tips
                });
            }

            if(c.hasStandar){
                this.standar = $('<p class="standar"></p>').css({
                    'text-indent': '80px',
                    'margin-top': '8px'
                }).appendTo(this.el);
                // 金额输入框监听事件，每次输入都显示该金额的正体格式
                this.jq(this.input, 'keyup', 'eventShowStandar');
            }
        },
        updateWidth: function(){
            var c = this.config;
            if (c.width){
                var prefixWidth = this.$beforeText ? this.$beforeText.width() : 0;
                if (prefixWidth){
                    prefixWidth += 8;
                    this.input.css('paddingLeft', prefixWidth);
                }
                this.input.width(c.width - prefixWidth);
            }
        },
        setData: function(data){
            // this.config.value = data;
            this.input.val(data || this.config.value);
            if(this.config.hasStandar){
                this.eventShowStandar();
            }
            return this;
        },
        setDefault: function(data){
            this.config.value = data;
        },
        /**
         * 获取数据
         * @param  {String} format <可选> 返回数据的格式
         * @return {Mix}        返回输入框的内容
         */
        getData: function(format){
            var val = this.input.val();
            switch (format){
                case 'int':
                    return (parseInt(val, 10) || 0);
                case 'float':
                    return (parseFloat(val) || 0);
                default:
                    return val;
            }
        },
        click: function(ev, dom){
            var isInput = $(dom).attr("type") == "text" ? true : false;
            if(isInput){
                var value = this.input.val();
                if(value == this.config.value){
                    this.input.val("");
                }
            }
            // this.fire('inputClick');
            return false;
        },
        blur: function(ev,dom){
            var isInput = $(dom).attr("type") == "text" ? true : false;
            if(isInput){
                var value = this.input.val();
                if(value === ''){
                    this.input.val(this.config.value);
                }
                // this.fire('inputBlur');
            }
            return false;
        },
        disable: function(){
            this.input.prop('disabled', true);
            return this;
        },
        enable: function(){
            this.input.prop('disabled', false);
            return this;
        },
        //联动显示大写
        eventShowStandar: function(evt, elm) {
            var inputVal = this.input.val();
            var result;
            if(this.config.hasStandarUnit){
                result = _getStandarAmount(inputVal);
            }else{
                result = _getStandarAmountWithoutUnit(inputVal);
            }

            this.standar.css('color',(result == '输入非法！') ? 'red': '#555555');
            this.standar.text(result);
        },
        //获取焦点
        focus: function(){
            this.input.select();
        }
    });
    exports.input = Input;

    // 将金额字符串转为正体格式的方法，合并到input模块中
    var _getStandarAmount, _getStandarAmountWithoutUnit;
    (function() {
        var standardizedMap = {
            0: "零",
            1: "壹",
            2: "贰",
            3: "叁",
            4: "肆",
            5: "伍",
            6: "陆",
            7: "柒",
            8: "捌",
            9: "玖"
        };

        var levels = [
            ["亿", 100000000],
            ["万", 10000],
            ["仟", 1000],
            ["佰", 100],
            ["拾", 10],
            ["", 1]
        ];

        function parse2Standar(charge) {
            if (charge === 0) {
                return '';
            }
            var hasBegin = false;
            var isOver = false,
                hasZero = false,
                result = '';
            while (!isOver) {
                var i, len;
                for (i = 0, len = levels.length; i < len; i++) {
                    var currentLevel = levels[i],
                        currentLevelNum = currentLevel[1],
                        currentLevelWord = currentLevel[0];

                    // 整除
                    var currentByte = Math.floor(charge/currentLevelNum);
                    if(currentByte > 0) {
                        if (hasBegin === false) {
                            hasBegin = true;
                        }
                        if (i < 2) {
                            // 亿级和万级的情况
                            result += parse2Standar(currentByte) + currentLevelWord;
                            charge -= currentByte * currentLevelNum;
                        } else if (currentByte < 10) {
                            // 万级以下
                            result += standardizedMap[currentByte] + currentLevelWord;
                            charge -= currentByte * currentLevelNum;

                            hasZero = false;
                        }
                        if (charge <= 0) {
                            // 不再有值时直接退出
                            break;
                        }
                    } else {
                        // 等于零的情况
                        if (!hasBegin) {
                            // 先判断是否已开始
                            continue;
                        }
                        if (!hasZero) {
                            // 判断是否已存在零
                            result += standardizedMap[0];
                            hasZero = true;
                        }
                    }
                }
                if (charge <= 0) {
                    isOver = true;
                }
            }

            return result;
        }

        // 该方法用于转换小数点后的，传入的number应为一个小数
        function parseCent2Standar(number) {
            if (number === 0) {
                return '';
            }

            var result = '';
            number = Math.round(number*100);

            // 角
            var hair = Math.floor(number / 10);
            if (hair > 0) {
                result += standardizedMap[hair] + '角';
                number -= hair*10;
            }

            // 分
            var cent = Math.floor(number);
            if (cent > 0) {
                result += standardizedMap[cent] + '分';
            }

            return result;
        }

        // 不带单位，纯数字
        function parseCent2StandarWithoutUnit(number) {
            if (number === 0) {
                return '';
            }

            var result = '';
            number = Math.round(number*100);

            result += '点';

            //小数点后一位
            var hair = Math.floor(number / 10);
            if (hair > 0) {
                result += standardizedMap[hair] + '';
                number -= hair*10;
            }else if(hair === 0){
                result += '零';
            }

            //小数点后两位
            var cent = Math.floor(number);
            if (cent > 0) {
                result += standardizedMap[cent] ;
            }

            return result;
        }

        var getStandar = function(input) {
            // 得到input的int形式
            var originCharge = parseFloat(input.replace(/-/, '')),
                chargeIntPart = Math.floor(originCharge),
                chargeCentPart = originCharge - chargeIntPart,
                result;
            // 合法数字正则
            var re = /^-?(0|[1-9]\d*)(\.\d+)?$/;

            if (input === '') {
                result = '';
            } else if (!re.test(input)) {
                result = '输入非法！'
            }else {
                // 加上单位
                result = parse2Standar(chargeIntPart);
                if (result !== '') {
                    result += '元';
                }
                var centPart = parseCent2Standar(chargeCentPart)
                if (centPart) {
                    result += centPart;
                } else {
                    if(originCharge === 0){
                        result += '零元整';
                    }else{
                        result += '整';
                    }
                }
                // 是负数加一个减号
                if (/^-(0|[1-9]\d*)(\.\d+)?$/.test(input)){
                    result = '负' + result;
                }
            }

            return result;
        }

        var getStandarWithoutUnit = function(input) {
            // 得到input的int形式
            var originCharge = parseFloat(input.replace(/-/, '')),
                chargeIntPart = Math.floor(originCharge),
                chargeCentPart = originCharge - chargeIntPart,
                result;
            // 合法数字正则
            var re = /^-?(0|[1-9]\d*)(\.\d+)?$/;

            if (input === '') {
                result = '';
            } else if (!re.test(input)) {
                result = '输入非法！'
            }else {
                // 加上单位
                result = parse2Standar(chargeIntPart);
                if (result !== '') {
                    result += '';
                }
                var centPart = parseCent2StandarWithoutUnit(chargeCentPart)
                if (centPart) {
                    result += centPart;
                } else {
                    if(originCharge === 0){
                        result += '零';
                    }else{
                        result += '';
                    }
                }
                // 是负数加一个减号
                if (/^-(0|[1-9]\d*)(\.\d+)?$/.test(input)){
                    result = '负' + result;
                }
            }

            return result;
        }

        // 导出方法，带人民币单位
        _getStandarAmount = getStandar;
        // 不带人民币单位，纯数字
        _getStandarAmountWithoutUnit = getStandarWithoutUnit;
    })();

    /**
     * 可增减输入框- 数量可变
     */
    var FlexibleInput = app.extend(Item, {
        init: function(config, parent){
            config = $.extend({
                'holder': '',
                'value': '',
                'type': 'text',
                'intervalText': '',
                'width': null
            }, config);
            this.$ready = false;
            this.$data = null;
            this.$amount = 0;
            FlexibleInput.master(this, null, config);
            this.build();
        },
        build: function(){
            if (this.$ready){ return false; }

            //构建input组
            this.$inputGroup = $('<div class="M-formFlexibleInput"></div>').appendTo(this.el);
            //按钮-新增一个输入框
            var addBtn = $('<span class="M-formFlexibleInputAdd">+</span>').appendTo(this.el);

            FlexibleInput.master(this,'init');

            //绑定按钮事件
            this.jq(addBtn,"click", "eventAddItem");
            this.dg(this.$inputGroup, '.M-formFlexibleInputDel', 'click', 'eventDelItem');

            this.$ready = true;
            //构建单条input组
            if (this.$data){
                this.setData(this.$data);
            }else {
                this.buildItem();
            }
        },
        /**
         * 单条input组
         * @return {Object} Jquery对象
         */
        buildItem: function(value){
            var c = this.config;

            //单条input组
            var inputDiv =$('<div class="M-formFlexibleInputDiv"/>').appendTo(this.$inputGroup);

            // 输入框input
            this.input = $('<input/>').attr({
                'id': c.id,
                'type': c.type,
                'placeholder': c.holder,
                'value': value || ''
            }).appendTo(inputDiv);
            this.input.css('width', c.width);


            //按钮-删除当前输入框
            $('<span class="M-formFlexibleInputDel">×</span>').appendTo(inputDiv);

            if(c.intervalText){
                $('<span class="mr10 intervalText"/>').html(c.intervalText).hide().appendTo(inputDiv);
            }

            this.$amount++;
            if (this.$amount > 1){
                this.$inputGroup.find(".M-formFlexibleInputDel").show();
                this.$inputGroup.find(".intervalText").show();
                this.$inputGroup.find(".intervalText").eq(this.$amount-1).hide();
            }
        },
        /**
         * 新增输入框 -按钮的回调事件
         * @param  {object} ev 事件对象
         */
        eventAddItem: function(ev, elm){
            this.buildItem();
        },
        /**
         * 删除输入框 -按钮的回调事件
         * @param  {object} ev 事件对象
         */
        eventDelItem: function(ev, elm){
            if(this.$amount > 1){
                this.$amount--;
                $(elm).parent().remove();
                this.$inputGroup.find(".intervalText").eq(this.$amount-1).hide();
                //若只剩下一个输入框，隐藏删除按钮
                if(this.$amount==1){
                    this.$inputGroup.find(".M-formFlexibleInputDel").hide();
                    this.$inputGroup.find(".intervalText").hide();
                }
            }
        },
        getData: function(){
            //在数组inputs中的每一条，返回各自的val;
            //保存在data数组里面。
            var inputs = this.el.find("input");
            var data = [], val;
            for(var i=0; i<inputs.length; i++){
                val = util.trim($(inputs[i]).val());
                if (val !== ''){
                    data.push(val);
                }
            }
            return data;
        },
        setData: function(data){
            this.$data = data;
            if (!this.$ready) { return; }
            if(data){
                this.$inputGroup.empty();
                this.$amount = 0;
                for(var i=0; i<data.length; i++){
                    //调用buildItem，创建输入框
                    this.buildItem(data[i]);
                }
                if (this.$amount === 0){
                    this.buildItem();
                }
            }else {
                this.reset();
            }
        },
        reset: function(){
            this.$data = null;
            this.$inputGroup.empty();
            this.$amount=0;
            this.buildItem();
        }
    });
    exports.flexibleInput = FlexibleInput;

    /**
     * 单选模块
     */
    function Radio(config){
        config = $.extend({
            'option': [],
            'value': '',
            'changeEvent': false,
            'autoChange': true, // 构建后是否自动触发changeEvent
            'eventWithoutChange': false, //是否允许不改变值的情况下，仍然广播事件；
            'tips':'',		// 提示说明
            'type': 'radio',
            'setDataType': 'click',
            'hasVerifyValue': false, // 用于是否开启验证值作用
            'verifyValue': 0, // 验证值，用于getData为空的时候，返回这个值；
            'vertical': false // 是否竖排
        }, config);
        Radio.master(this, null, config);
        this.last_value = null;
    }
    extend(Radio, Item, {
        init: function(){
            var c = this.config;
            this.list = [];
            var input,label, opt, id, not_select = true;
            for (var i=0; i<c.option.length; i++){
                opt = c.option[i];
                if (app.util.isString(opt)){
                    opt = {'text':opt, 'value':i};
                }else {
                    opt = $.extend({'text':LANG('选项'), 'value':i}, opt);
                }
                id = c.id + '_' + i;

                input = $('<input/>')
                    .attr({
                        'type': c.type,
                        'name': c.id,
                        'id': id,
                        'data-id': opt.id || opt._id || null,
                        'checked': opt.checked,
                        'value': opt.value
                    })
                    .appendTo(this.el);

                label = $('<label class="M-formItemRadio"/>').attr('for', id).appendTo(this.el);
                if(c.vertical){
                    $('<div class="M-formItemRadioIsolation"/>').appendTo(this.el);
                }
                if (opt.html){
                    label.html(opt.html);
                }else {
                    label.text(opt.text);
                }

                if (c.changeEvent){
                    this.jq(input, 'change', opt, 'eventChange');
                }
                if (not_select && (opt.value == c.value || opt.id == c.value || opt._id == c.value)){
                    input.prop('checked', true);
                    not_select = false;
                    if(c.autoChange){
                        input.change();
                    }
                }

                this.list.push(input);
            }

            Radio.master(this,'init');
            // 提示说明
            if(c.tips){
                this.create('tips',common.tips,{
                    target: this.el,
                    tips:c.tips
                });
            }
        },
        setData: function(data){
            var c = this.config;
            var chk;
            var isClick = (c.setDataType == 'click');
            var list = this.list;
            c.value = data;
            for (var i=0; i<list.length; i++){
                chk = (list[i].val() == data || list[i].attr('data-id') == data);
                if (isClick){
                    if (chk){
                        list[i].click();
                    }
                }else {
                    list[i].prop('checked', chk);
                }
            }
            return this;
        },
        getData: function(complete){
            for (var i=0; i<this.list.length; i++){
                if (this.list[i].prop('checked')){
                    return complete ? this.config.option[i] : this.list[i].val();
                }
            }
            var c = this.config;
            return c.hasVerifyValue ? c.verifyValue : '';
        },
        /*
         * param data : 要设置的radio
         * param state : 要设置的状态值，当为true是就为disable 当为false就为 enable
         */
        disable:function(data,state){
            for (var i=0; i<this.list.length; i++){
                if(data === true || data === false){
                    // 整个组件禁用启用
                    this.list[i].attr('disabled', data).next().toggleClass('M-formItemRadioDisabled', data);
                }else{
                    if (this.list[i].val() == data || this.list[i].attr('data-id') == data){
                        this.list[i].attr('disabled',state);
                        break;
                    }
                }
            }
            return this;
        },
        disableAll: function(bool){
            for (var i=0; i<this.list.length; i++){
                this.list[i].attr('disabled', bool);
            }
            return this;
        },
        eventChange: function(evt){
            var data = evt.data;
            if (this.last_value === data){
                // 是否允许不改变值的情况下，仍然广播事件；
                if(!this.config.eventWithoutChange){
                    return false;
                }
            }

            if (data){
                this.config.value = data.value;
                this.last_value = data;
                data.el = evt.target || evt.srcElement;
                this.fire('radioChange', data);
            }
        },
        setTips: function(text){
            if(this.$.tips){
                this.$.tips.setData(text);
            }
        },
        reset: function(){
            for (var i=0; i<this.list.length; i++){
                this.list[i].prop('checked',false);
            }
            return this;
        }
    });
    exports.radio = Radio;

    // 复选框
    var Checkbox = app.extend(Radio, {
        init: function(config){
            config = $.extend({
                'option': [],
                'value': '',
                'changeEvent': false,
                'tips':'',		// 提示说明
                'type': 'checkbox'
            }, config);
            Checkbox.master(this, null, config);
            Checkbox.master(this, 'init', arguments);
        },
        // 参数attr，指匹配的值，带这个参数的时候默认为data-id;
        setData: function(data, attr){
            var box;
            if(!data||!data.length){return;}
            this.reset();

            for (var i=0; i<this.list.length; i++){
                box = this.list[i];
                for(var x=0; x<data.length; x++){
                    if(attr || attr == 'data-id'){
                        if (box.attr('data-id') == data[x]){
                            box.attr('checked',true);
                        }
                    }else{
                        if (box.val() == data[x]){
                            box.attr('checked',true);
                        }
                    }
                }
            }
        },
        // 返回一个数组, 参数type代表要获取input中那个值，带这个参数的时候默认为data-id;
        getData: function(type){
            var arr = [];
            for (var i=0; i<this.list.length; i++){
                if (this.list[i].prop('checked')){
                    if(type || type == 'id' || type == 'data-id'){
                        if(isNaN(+this.list[i].attr('data-id'))){
                            arr.push(this.list[i].attr('data-id'));
                        }else{
                            arr.push(+this.list[i].attr('data-id'));
                        }
                    }else{
                        arr.push(this.list[i].val());
                    }

                }
            }
            return arr;
        },
        reset: function(){
            for (var i=0; i<this.list.length; i++){
                this.list[i].attr('checked',false);
            }
            return this;
        }
    });
    exports.checkbox = Checkbox;

    // 原生下拉
    var Select = app.extend(Item, {
        init: function(config, parent){
            config = $.extend({
                'options': [],
                'name': 'text',
                'key': 'id',
                'width': 260,
                'height': 18
            }, config);

            this.$data = null;
            Select.master(this, null, config);
            Select.master(this, 'init', arguments);
            this.build();
        },
        build: function(){
            var self = this;
            var el = self.el;
            var c = self.config;
            var doms = self.doms = {};

            doms.select = $([
                '<select></select>'
            ].join('')).appendTo(el).addClass('M-formSelect');

            if(c.width){
                doms.select.width(c.width);
            }
            if(c.height){
                doms.select.height(c.height);
            }

            var html = [];
            util.each(c.options, function(item,idx){
                if(item){
                    html.push('<option data-id = "'+item[c.key]+'" value ="'+item[c.key]+'">'+item[c.name]+'</option>');
                }
            });

            doms.select.append(html.join(''));

            this.jq(doms.select, 'change', 'eventChange');
        },
        eventChange: function(ev, elm){
            var val = $(elm).find('option:selected').val();
            var text = $(elm).find('option:selected').text();

            this.fire('selectChange',{
                text: text,
                id: val
            });
            return false;
        },
        setData: function(id){
            this.doms.select.val(id);
            this.eventChange(null, this.doms.select);
            return this;
        },
        getData: function(all){
            var selected = this.el.find('select option:selected');
            if(all){
                return {
                    text: selected.text(),
                    id: selected.val()
                };
            }
            return selected.val();
        },
        reset: function(){
            this.el.find('select option:selected').val();
            return this;
        }
    });
    exports.select = Select;

    /**
     * 地区选择模块
     */
    function Zone(config){
        config = $.extend({
            'option': [LANG('不限'), LANG('选择地区')],
            'selected': null
        }, config);
        Zone.master(this, null, config);
        this.$moduleClass = country.base;
    }
    extend(Zone, Radio, {
        init: function(){
            var c = this.config;
            Zone.master(this,'init');
            this.container = $('<div class="M-formCountry M-formZone" />').appendTo(this.el);
            this.checkbox = this.create(
                'checkbox', this.$moduleClass,
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
            if (!data || !data.length){
                this.list[0].click();
            }else if(data && data.length){
                this.checkbox.setData(data);
                this.list[1].click();
            }
        },
        getData: function(){
            if (this.list[0].prop('checked')){
                return [];
            }else if(this.list[1].prop('checked')){
                return this.checkbox.getData();
            }
        },
        reset:function(){
            this.setData({});
        }
    });
    exports.zone = Zone;

    /**
     * IP地址模块
     */
    var IpSections = app.extend(Radio, {
        init: function(config){
            config = $.extend({
                'label': LANG('人群属性'),
                'option': [LANG('不限'), LANG('选择IP段')],
                'selected': null
            }, config);
            IpSections.master(this, null, config);
            IpSections.master(this, 'init', arguments);

            this.$ready = false;
            this.$moduleClass = 'country.ipSections';
            this.$data = config.selected;

            this.build();
        },
        build: function(){
            if (this.$ready){ return; }

            this.doms = {
                con: $('<div class="M-formCountry" />').appendTo(this.el)
            };

            this.createAsync(
                'detail', this.$moduleClass,
                {
                    target: this.doms.con
                },
                'afterCreate'
            );
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
        },
        setData: function(data){
            this.$data = data;
            if (!this.$ready){ return false; }

            if (data  && data.length>0 ){
                this.list[1].click();
                this.$.detail.setData(data);
            }else {
                this.list[0].click();
            }
        },
        getData: function(){
            if (this.list[0].prop('checked')){
                return null;
            }else {
                return this.$.detail.getData();
            }
        },
        reset: function(){
            if(this.get('detail')){
                this.get('detail').reset();
            }
            this.list[0].prop('checked');
            this.list[0].click();
        }
    })
    exports.ipSections = IpSections;

    /**
     * 客户端选择模块
     */
    function Client(config){
        config = $.extend({
            'option': [LANG('不限'), LANG('选择客户端')],
            'selected': null
        }, config);
        Client.master(this, null, config);
        this.$moduleClass = country.client;
    }
    extend(Client,Zone,{
        setData: function(data){
            var sels = {
                os: data.OSType,
                bs: data.BrowserType
            };
            if (this.isEmpty(sels)){
                this.list[0].click();
            }else {
                this.checkbox.setData(sels);
                this.list[1].click();
            }
        },
        getData: function(){
            var bs=[],os=[];
            if (!this.list[0].prop('checked')){
                var data = this.checkbox.getData();
                bs = data.bs;
                os = data.os;
            }
            return {
                BrowserType: bs,
                OSType: os,
                Language: []
            };
        },
        reset: function(){
            this.list[0].click();
            this.checkbox.reset();
        },
        isEmpty: function(data){
            for (var i in data){
                if (util.has(data, i) && data[i] && data[i].length){
                    return false;
                }
            }
            return true;
        }
    });
    exports.client = Client;

    /*
     *	批量修改最高出价
     */
    var Price = app.extend(view.container, {
        init : function(config){
            config = $.extend({
                "class":"M-formPrice"
            }, config);

            Price.master(this, null, config);
            Price.master(this, "init", arguments);
            this.build();
        },
        build : function() {
            var self = this;
            var el = self.el;

            var tmp = {"class":"P-pageCon"};

            var layoutID = 0;
            this.layout = this.create(
                "layout"
                ,view.layout
                ,{
                    "target":el
                    ,"grid":[6,1]
                    ,"cellSet":[tmp,tmp,tmp,tmp,tmp,tmp]
                }
            );

            // 出价方式
            var optimizationCon = self.create('optimizationLayout', view.itemLayout,{
                'target': this.layout.get(layoutID++).el,
                'label': LANG('出价方式：')
            });
            self.create('optimization', form.radio,{
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

            var topPriceCon = self.create('topPriceLayout', view.itemLayout,{
                'target': this.layout.get(layoutID++).el,
                'label': LANG('最高出价：'),
                'tips': LANG('这个活动参与竞价时出的最高价。')
            });
            self.topPrice = self.create(
                'topPrice', form.input,
                {label:null,beforeText: '￥',"afterText":LANG("元/千次曝光"), width:400,
                    target: topPriceCon.getContainer(),value:'0.00'}
            );

            var cpaPriceCon = self.create('cpaPriceLayout', view.itemLayout,{
                'target': this.layout.get(layoutID++).el,
                'label': LANG('优化单价：')
            });
            self.create('cpaPrice', form.input, {
                'target': cpaPriceCon.getContainer(),
                'label':null,
                'beforeText': '￥',
                "afterText":LANG("元"),
                'width':400,
                'value':'0.00'
            });
        },
        onRadioChange: function(evt){
            if (evt.from === this.$.optimization){
                var topPriceLayout = this.layout.get(1);
                var cpaPriceLayout = this.layout.get(2);
                if (evt.param.value === 0){
                    cpaPriceLayout.hide();
                    topPriceLayout.show();
                    if (this.$.topPrice){
                        this.$.topPrice.updateWidth();
                    }
                }else {
                    topPriceLayout.hide();
                    cpaPriceLayout.show();
                    if (this.$.cpaPrice){
                        this.$.cpaPrice.updateWidth();
                    }
                }
            }
            return false;
        },
        getData : function() {
            var data = this.$data = {
                'WardenStatus': +this.$.optimization.getData() || 0,
                'TargetCpa': Math.round(+this.$.cpaPrice.getData()*100)/100 || 0,
                // 最高出价
                "TopPrice" : Math.round(+this.topPrice.getData()*100)/100,
                'ChargePrice': Math.round(+this.topPrice.getData()*100)/100
            }
            return data;
        },
        reset : function() {
            // 价格优化开关
            this.$.optimization.setData(0);
            this.$.cpaPrice.setData('0.00');
            this.topPrice.setData('0.00');
            this.$data = null;
            return this;
        }
    });
    exports.price = Price;

    // 新出价方式
    var NewPrice = app.extend(view.container, {
        init : function(config){
            config = $.extend({
                'class': 'M-formPrice',
                'radios': [
                    {text: LANG('CPM竞价'), value: 0},
                    {text: LANG('固定CPM'), value: 4},
                    {text: LANG('CPC优化'), value: 2},
                    {text: LANG('固定CPC'), value: 3},
                    {text: LANG('CPA优化'), value: 1}
                ],
                'inputs': [
                    {
                        'label': LANG('最高出价：'),
                        'beforeText': LANG('￥'),
                        'afterText': LANG('元/千次曝光'),
                        'tips': LANG('这个活动参与竞价时出的最高价。'),
                        'rel-id': 0
                    },
                    {
                        'label': LANG('结算CPM：'),
                        'beforeText': LANG('￥'),
                        'afterText': LANG('元'),
                        'rel-id': 4
                    },
                    {
                        'label': LANG('优化CPC：'),
                        'beforeText': LANG('￥'),
                        'afterText': LANG('元'),
                        'rel-id': 2
                    },
                    {
                        'label': LANG('结算CPC：'),
                        'beforeText': LANG('￥'),
                        'afterText': LANG('元'),
                        'rel-id': 3
                    },
                    {
                        'label': LANG('优化CPA：'),
                        'beforeText': LANG('￥'),
                        'afterText': LANG('元'),
                        'rel-id': 1
                    }
                ],
                'averages': [
                    {
                        'label': LANG('平均CPM：'),
                        'beforeText': LANG('￥'),
                        'afterText': LANG('元/千次曝光'),
                        'tips': LANG('活动结算的目标CPM，控制活动的CPM指标在设定值左右。'),
                        'rel-id': 0
                    },
                    {
                        'label': LANG('平均CPM：'),
                        'beforeText': LANG('￥'),
                        'afterText': LANG('元/千次曝光'),
                        'tips': LANG('活动结算的目标CPM，控制活动的CPM指标在设定值左右。'),
                        'rel-id': 2
                    },
                    {
                        'label': LANG('平均CPM：'),
                        'beforeText': LANG('￥'),
                        'afterText': LANG('元/千次曝光'),
                        'tips': LANG('活动结算的目标CPM，控制活动的CPM指标在设定值左右。'),
                        'rel-id': 1
                    }
                ],
                'oldChargeMap': {
                    '-1': {type: LANG(''), unit: LANG(''), price: LANG('')},
                    0: {type: LANG('CPM竞价'), unit: LANG('元/千次曝光'), price: LANG('最高出价：')},
                    1: {type: LANG('按CPA优化'), unit: LANG('元'), price: LANG('优化单价：')},
                    2: {type: LANG('按CPC优化'), unit: LANG('元'), price: LANG('优化单价：')},
                    3: {type: LANG('固定CPC'), unit: LANG('元'), price: LANG('结算CPC：')},
                    4: {type: LANG('固定CPM'), unit: LANG('元'), price: LANG('结算CPM：')}
                }
            }, config);

            NewPrice.master(this, null, config);
            NewPrice.master(this, "init", arguments);
            this.build();
        },
        build : function() {
            var self = this;
            var el = self.el;
            var c = self.config;
            var doms = this.$doms = {};
            var user = app.getUser();
            var ChargePriority = user && user.campany && user.campany.ChargePriority || [];

            var radios = this.$radios = [];
            var inputs = this.$inputs = [];
            var averages = this.$averages = [];
            var hasAverages = app.getUserAuth(app.config('auth/avgPrice'));

            // 根据账号出价权限显示出价方式；
            util.each(ChargePriority, function(child){
                if(child){
                    util.each(c.radios, function(item){
                        if(child.childType == item.value){
                            radios.push(item);
                        }
                    });
                    util.each(c.inputs, function(item){
                        if(child.childType == item['rel-id']){
                            inputs.push(item);
                        }
                    });
                    util.each(c.averages, function(item){
                        if(hasAverages && child.childType == item['rel-id']){
                            averages.push(item);
                        }
                    });
                }
            });

            // 出价方式
            var optimizationCon = self.create('optimizationLayout', view.itemLayout,{
                'target': el,
                'label': LANG('出价方式：')
            }).getContainer();

            doms.oldCon = $('<div class="M-formPriceOldCon"/>').appendTo(optimizationCon);

            // 提示
            $('<span>').text('本用户没有出价权限').appendTo(optimizationCon)[ChargePriority.length?'hide':'show']();

            self.create('optimization', form.radio,{
                'class': 'M-formItem M-formPriceRadioCon',
                'target': optimizationCon,
                'label': null,
                'value': 0,
                'changeEvent': true,
                'vertical': false,
                'eventWithoutChange': true,
                'option': radios,
                'hasVerifyValue': true, // 用于是否开启验证值作用
                'verifyValue': -1 // 验证值，用于getData为空的时候，返回这个值；
            });

            // 出价输入
            var inputCon = doms.inputCon = $('<div class="M-formPriceInputCon">').appendTo(optimizationCon);
            util.each(inputs, function(item, idx){
                if(item){
                    self.create('input'+item['rel-id'], form.input, {
                        'class': 'M-formItem',
                        'label': item.label,
                        'beforeText': item.beforeText,
                        'afterText': item.afterText,
                        'width': 400,
                        'target': inputCon,
                        'value': '0.00',
                        'tips': item.tips || ''
                    }).el.attr('rel-id', item['rel-id']).hide();
                }
            });

            var averageCon = doms.averageCon = $('<div class="M-formPriceInputCon M-formPriceAverageCon">').appendTo(optimizationCon);
            util.each(averages, function(item, idx){
                if(item){
                    self.create('average'+item['rel-id'], form.input, {
                        'label': item.label,
                        'beforeText': item.beforeText,
                        'afterText': item.afterText,
                        'width': 400,
                        'target': averageCon,
                        'value': '0.00',
                        'tips': item.tips || ''
                    }).el.attr('rel-id', item['rel-id']).hide();
                }
            });

            // 默认选择第一个；
            var relId = inputCon.find('.M-formItem:first').attr('rel-id');
            this.$.optimization.setData(+relId);

            this.dg(doms.averageCon, 'input', 'focus', 'showBudgete');
            this.dg(doms.averageCon, 'input', 'blur', 'hideBudgete');
        },
        onRadioChange: function(evt){
            this.el.find('[rel-id]').hide();
            this.el.find('[rel-id="'+evt.param.value+'"]').show();
        },
        getData : function() {
            var self = this;
            var WardenStatus = +self.$.optimization.getData();
            var ChargePrice = 0;
            var TargetCpa = 0;
            var AvgPrice = 0;

            if(self.get('input'+WardenStatus)){
                var mod = self.get('input'+WardenStatus);
                if(WardenStatus === 0){
                    ChargePrice = Math.round(+mod.getData()*100)/100;
                }else{
                    TargetCpa = Math.round(+mod.getData()*100)/100;
                }
            }
            if(self.get('average'+WardenStatus)){
                AvgPrice = Math.round(+self.get('average'+WardenStatus).getData()*100)/100;
            }

            var data = {
                // 出价方式
                WardenStatus: WardenStatus,
                // 最高出价保存
                ChargePrice: ChargePrice,
                TopPrice: ChargePrice,
                // 自动优化
                TargetCpa: TargetCpa,
                // 平均CPM
                AvgPrice: AvgPrice

            };
            return data;
        },
        //提示不限提示框
        showBudgete: function(evt,elm){
            var config = {
                data: LANG('0或空白不填表示不限'),
                anchor: elm,
                width: 200,
                pos: 'tm'
            };
            if (this.$.priceTip){
                this.$.priceTip.reload(config);
            }else {
                this.create('priceTip', popwin.tip, config);
            }
            this.$.priceTip.show();
        },
        //隐藏不限提示框
        hideBudgete: function(evt){
            if (this.$.priceTip){
                this.$.priceTip.hide();
            }
        },
        setData: function(data){
            var self = this;
            var c = self.config;
            if(data){
                var WardenStatus = +data.WardenStatus;
                // 如果出价方式为正常RTB，使用ChargePrice填充值，否则使用TargetCpa；
                var val = (WardenStatus === 0 ? data.ChargePrice : data.TargetCpa) || '0.00';
                var inputs = self.$inputs;
                // 是否是古老的出价方式，出价权限里不存在；
                var isOldStatus = !util.exist(inputs, WardenStatus, 'rel-id');

                if(isOldStatus){
                    // '修改前的出价方式：（固定CPM，最高出价：100元/千次曝光）'
                    var doms = self.$doms;
                    var map = c.oldChargeMap;
                    // 提示旧的出价方式；
                    doms.oldCon.text([
                        LANG('修改前的出价方式：（'),
                        map[WardenStatus].type || LANG('其他'),
                        LANG('，'),
                        map[WardenStatus].price,
                        val,
                        map[WardenStatus].unit,
                        LANG('）')
                    ].join(''));
                    self.$.optimization.reset();
                }else{
                    self.$.optimization.setData(WardenStatus);
                    if(self.get('input'+WardenStatus)){
                        self.get('input'+WardenStatus).setData(val);
                    }
                    if(self.get('average'+WardenStatus)){
                        self.get('average'+WardenStatus).setData(data.AvgPrice || '0.00');
                    }
                }
            }
            return self;
        },
        reset : function() {
            var self = this;
            self.$doms.oldCon.text('');
            self.$.optimization.reset();
            var inputs = self.$inputs;
            var averages = self.$averages;
            util.each(inputs, function(item){
                if(item && self.get('input'+item['rel-id'])){
                    self.get('input'+item['rel-id']).setData('').hide();
                }
            });
            util.each(averages, function(item){
                if(item && self.get('average'+item['rel-id'])){
                    self.get('average'+item['rel-id']).setData('').hide();
                }
            });
            // 默认选择第一个；
            var relId = self.$doms.inputCon.find('.M-formItem:first').attr('rel-id');
            this.$.optimization.setData(+relId);
            return self;
        }
    });
    exports.newPrice = NewPrice;

    /*
     *	批量修改投放速度
     */
    var BidSpeed = app.extend(view.container, {
        init : function(config){
            config = $.extend({
                "class":"M-formPrice"
            }, config);

            BidSpeed.master(this, null, config);
            BidSpeed.master(this, "init", arguments);
            this.build();
        },
        build : function() {
            var self = this;
            var el = self.el;

            var itemCon = self.create('bidSpeedLayout', view.itemLayout,{
                'target': el,
                'label': LANG('投放速度：'),
                'tips': '快速：目标是获取尽量多的曝光<br>匀速：目标是尽可能覆盖各时段'
            });
            self.create('bidSpeed', form.radio,{
                'target': itemCon.getContainer(),
                'label': null,
                'value': 0,
                'changeEvent': true,
                'option': [
                    {text: LANG('快速'), value: 0},
                    {text: LANG('匀速'), value: 1}
                ]
            });

        },
        getData : function() {
            var data = this.$data = {
                'GovernorStatus': +this.$.bidSpeed.getData() || 0
            }
            return data;
        },
        reset : function() {
            this.$.bidSpeed.setData(0);
            this.$data = null;
            return this;
        }
    });
    exports.bidSpeed = BidSpeed;

    // 批量活动名称修改（关键词替换）
    var KeywordReplace = app.extend(view.container, {
        init : function(config) {
            config = $.extend({
                "class" : "P-keywordReplace"
            }, config);

            KeywordReplace.master(this, null, config);
            KeywordReplace.master(this, "init", arguments);
            this.build();
        },
        build : function() {
            var self = this;
            // 创建两个itemlayout
            self.create('keywordReplaceOrigin', view.itemLayout, {
                'target' : self.el,
                'label' : LANG('关键字'),
                'tips' : LANG('需要替换掉的关键字')
            });
            self.create('keywordReplaceNew', view.itemLayout, {
                'target' : self.el,
                'label' : LANG('替换为'),
                'tips' : LANG('需要替换成的关键字')
            });
            // 创建两个输入框
            self.create('keywordOrigin', form.input, {
                'label' : '',
                'width' : 240,
                'target' : self.get('keywordReplaceOrigin').getContainer(),
                'holder' : LANG('旧关键字')
            });
            self.create('keywordNew', form.input, {
                'label' : '',
                'width' : 240,
                'target' : self.get('keywordReplaceNew').getContainer(),
                'holder' : LANG('新关键字')
            });
        },
        getData : function() {
            var data = this.$data = {
                'OriginKeyword' : this.get('keywordOrigin').getData(),
                'NewKeyword' : this.get('keywordNew').getData()
            }
            return data;
        },
        reset : function() {
            this.get('keywordOrigin').setData('');
            this.get('keywordNew').setData('');
            this.$data = null;
        }
    });
    exports.keywordReplace = KeywordReplace

    // 移动广告
    var MoblieClientRTB = app.extend(Zone, {
        init: function(config){
            config = $.extend({
                'option': [LANG('不限'), LANG('选择操作系统')],
                'selected': null
            }, config);
            Zone.master(this, null, config);
            this.$moduleClass = country.mobileClient;
            // MoblieClientRTB.master(this, 'init', arguments);
            Zone.master(this,'init');

            this.container = $('<div class="M-formCountry" />').appendTo(this.el);
            this.checkbox = this.create(
                'checkbox', this.$moduleClass,{
                    target: this.container,
                    selected: config.selected,
                    configType: config.configType
                }
            );

            this.jq(this.list[0], 'change', 'changeStatue');
            this.jq(this.list[1], 'change', 'changeStatue');
            this.changeStatue();

        },
        setData: function(data){
            var c = this.config;
            var sels = {};
            sels[c.configType] = data;

            if (this.isEmpty(sels)){
                this.list[0].click();
            }else {
                this.checkbox.setData(sels);
                this.list[1].click();
            }
        },
        isEmpty: function(data){
            for (var i in data){
                if (util.has(data, i) && data[i] && data[i].length){
                    return false;
                }
            }
            return true;
        },
        reset: function(){
            this.checkbox.reset();
            this.list[0].prop('checked');
            this.list[0].click();
            return this;
        }
    });
    exports.moblieClientRTB = MoblieClientRTB;

    // 移动广告-设备型号
    function DeviceModel(config){
        config = $.extend({
            'option': [LANG('不限'), LANG('选择设备型号')],
            'selected': null
        }, config);
        DeviceModel.master(this, null, config);
        this.$moduleClass = country.mobileDevice;
    }
    extend(DeviceModel,Zone,{
        setData: function(data){
            var sels = {
                deviceModel: data
            };
            if (this.isEmpty(sels)){
                this.list[0].click();
            }else {
                this.checkbox.setData(sels);
                this.list[1].click();
            }
        },
        getData: function(){
            var data;
            if (!this.list[0].prop('checked')){
                data = this.checkbox.getData();
            }
            data = data && data.deviceModel || [];
            return data;
        },
        reset: function(){
            this.list[0].click();
            this.checkbox.reset();
        },
        isEmpty: function(data){
            for (var i in data){
                if (util.has(data, i) && data[i] && data[i].length){
                    return false;
                }
            }
            return true;
        }
    });
    exports.deviceModel = DeviceModel;

    /**
     * 上网场景
     */
    var Scene = app.extend(Radio, {
        init: function(config){
            config = $.extend({
                'label': LANG('上网场景：'),
                'option': [LANG('不限'), LANG('选择场景')],
                'selected': null,
                'list': [{
                    // name: '场景',
                    // value: ''
                    child: [
                        {
                            child: [
                                {
                                    name: '网吧',
                                    value: 1,
                                    child: []
                                },
                                {
                                    name: '学校',
                                    value: 2,
                                    child: [
                                        {name: '小学', value: 5},
                                        {name: '中学', value: 6},
                                        {name: '大学', value: 7}
                                    ]
                                },
                                {
                                    name: '公司',
                                    value: 3,
                                    child: []
                                },
                                {
                                    name: '家庭',
                                    value: 4,
                                    child: []
                                },
                                {
                                    name: '其他',
                                    value: 0,
                                    child: []
                                }
                            ]
                        }
                    ]
                }]
            }, config);
            Scene.master(this, null, config);
            Scene.master(this, 'init', arguments);

            this.$ready = false;
            this.$data = config.selected;

            this.build();
        },
        build: function(){
            if (this.$ready){ return; }

            this.doms = {
                con: $('<div class="M-formCountry" />').appendTo(this.el)
            };

            this.createAsync(
                'detail', 'common.subLevelCheckbox',
                {
                    'target': this.doms.con
                    ,'getSubs': true
                },
                'afterCreate'
            );

            this.el.find('.M-commonSLCZone').css({
                'border':'none',
                'background': '#fff'
            });
            this.el.find('.M-commonSLCHead').hide();
            this.el.find('.M-commonSLCZoneHead').hide();
            this.el.find('.M-commonSLCZoneBody').css('margin-left',10);
        },
        afterCreate: function(mod){
            var c = this.config;
            mod.setList(c.list);
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
        },
        setData: function(data){
            this.$data = data;
            if (!this.$ready){ return false; }

            if (data){
                this.list[1].click();
                var res = data;
                util.each(data, function(item){
                    if(item == 2){
                        res.push(5,6,7);
                    }
                });
                this.$.detail.setData(data);
            }else {
                this.list[0].click();
            }
        },
        getData: function(){
            if (this.list[0].prop('checked')){
                return null;
            }else {
                var data = this.$.detail.getData();
                var res = [];
                util.each(data, function(item){
                    res.push(+item);
                });
                return res;
            }
        },
        reset: function(){
            if(this.get('detail')){
                this.get('detail').reset();
            }
            this.list[0].prop('checked');
            this.list[0].click();
        }
    })
    exports.scene = Scene;

    // 运营商
    var Carriers = app.extend(Radio, {
        init: function(config){
            config = $.extend({
                'label': LANG('运营商：'),
                'option': [LANG('不限'), LANG('选择运营商')],
                'selected': null,
                'list': [{
                    // name: '运营商',
                    // value: ''
                    child: [
                        {
                            child: [
                                {
                                    name: '中国移动',
                                    value: 1,
                                    child: []
                                },
                                {
                                    name: '中国电信',
                                    value: 2,
                                    child: []
                                },
                                {
                                    name: '中国联通',
                                    value: 3,
                                    child: []
                                },
                                {
                                    name: '中国铁通',
                                    value: 4,
                                    child: []
                                }
                            ]
                        }
                    ]
                }]
            }, config);
            Carriers.master(this, null, config);
            Carriers.master(this, 'init', arguments);

            this.$ready = false;
            this.$data = config.selected;

            this.build();
        },
        build: function(){
            if (this.$ready){ return; }

            this.doms = {
                con: $('<div class="M-formCountry" />').appendTo(this.el)
            };

            this.createAsync(
                'detail', 'common.subLevelCheckbox',
                {
                    'target': this.doms.con
                    ,'getSubs': true
                },
                'afterCreate'
            );

            this.el.find('.M-commonSLCZone').css({
                'border':'none',
                'background': '#fff'
            });
            this.el.find('.M-commonSLCHead').hide();
            this.el.find('.M-commonSLCZoneHead').hide();
            this.el.find('.M-commonSLCZoneBody').css('margin-left',10);
        },
        afterCreate: function(mod){
            var c = this.config;
            mod.setList(c.list);
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
        },
        setData: function(data){
            this.$data = data;
            if (!this.$ready){ return false; }

            if (data && data.length){
                this.list[1].click();
                this.$.detail.setData(data);
            }else {
                this.list[0].click();
            }
        },
        getData: function(){
            if (this.list[0].prop('checked')){
                return null;
            }else {
                var data = this.$.detail.getData();
                var res = [];
                util.each(data, function(item){
                    res.push(+item);
                });
                return res;
            }
        },
        reset: function(){
            if(this.get('detail')){
                this.get('detail').reset();
            }
            this.list[0].prop('checked');
            this.list[0].click();
        }
    })
    exports.carriers = Carriers;

    /**
     * 百度人群属性模块
     */
    var People = app.extend(Radio, {
        init: function(config){
            config = $.extend({
                'label': LANG('人群属性'),
                'option': [LANG('不限'), LANG('选择人群')],
                'selected': null
            }, config);
            People.master(this, null, config);
            People.master(this, 'init', arguments);

            this.$ready = false;
            this.$moduleClass = 'tree_select.main';
            this.$data = config.selected;

            this.build();
        },
        build: function(){
            if (this.$ready){ return; }

            this.doms = {
                con: $('<div class="M-formCountry" />').appendTo(this.el)
            };

            this.createAsync(
                'detail', this.$moduleClass,
                {
                    target: this.doms.con
                },
                'afterCreate'
            );
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
        },
        setData: function(data,exclude){
            this.$data = data;
            if (!this.$ready){ return false; }

            if (data  && data.sex && (data.property && data.property.length || (data.sex.length===1)) ){
                this.list[1].click();
                this.$.detail.setData(data,exclude);
            }else {
                this.list[0].click();
            }
        },
        getData: function(){
            if (this.list[0].prop('checked')){
                return null;
            }else {
                return this.$.detail.getData();
            }
        },
        reset: function(){
            if(this.get('detail')){
                this.get('detail').reset();
            }
            this.list[0].prop('checked');
            this.list[0].click();
        }
    })
    exports.people = People;

    /**
     * 秒针人群属性模块
     */
    var PeopleMiaozhen = app.extend(Radio, {
        init: function(config){
            config = $.extend({
                'label': LANG('人群属性'),
                'option': [LANG('不限'), LANG('选择人群')],
                'selected': null
            }, config);
            PeopleMiaozhen.master(this, null, config);
            PeopleMiaozhen.master(this, 'init', arguments);

            this.$ready = false;
            this.$moduleClass = 'tree_select.main';
            this.$data = config.selected;

            this.build();
        },
        build: function(){
            if (this.$ready){ return; }

            this.doms = {
                con: $('<div class="M-formCountry" />').appendTo(this.el)
            };

            this.createAsync(
                'detail', this.$moduleClass,
                {
                    'target': this.doms.con
                    ,'url':'/rest/listmiaozhenpeople'
                    ,'hasRoot': true
                },
                'afterCreate'
            );
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
        },
        setData: function(data,exclude){
            this.$data = data;
            if (!this.$ready){ return false; }

            if (data  && data.sex && (data.property && data.property.length || (data.sex.length===1)) ){
                this.list[1].click();
                this.$.detail.setData(data,exclude);
            }else {
                this.list[0].click();
            }
        },
        getData: function(){
            if (this.list[0].prop('checked')){
                return null;
            }else {
                return this.$.detail.getData();
            }
        },
        reset: function(){
            if(this.get('detail')){
                this.get('detail').reset();
            }
            this.list[0].prop('checked');
            this.list[0].click();
        }
    })
    exports.peopleMiaozhen = PeopleMiaozhen;

    /**
     * 淘宝人群属性模块
     */
    var PeopleTanx = app.extend(Radio, {
        init: function(config){
            config = $.extend({
                'label': LANG('人群属性'),
                'option': [LANG('不限'), LANG('选择人群')],
                'selected': null
            }, config);
            PeopleTanx.master(this, null, config);
            PeopleTanx.master(this, 'init', arguments);

            this.$ready = false;
            this.$moduleClass = 'tree_select.main';
            this.$data = config.selected;

            this.build();
        },
        build: function(){
            if (this.$ready){ return; }

            this.doms = {
                con: $('<div class="M-formCountry M-formPeopleTanx" />').appendTo(this.el)
            };

            this.createAsync(
                'detail', this.$moduleClass,
                {
                    'target': this.doms.con,
                    'url': '/rest/listtaobaopeople',
                    'height': 400
                },
                'afterCreate'
            );
        },
        afterCreate: function(mod){
            // 调整高度
            this.el.find('.M-treeListTab').next('div').height(319);

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
        },
        setData: function(data,exclude){
            this.$data = data;
            if (!this.$ready){ return false; }

            if (data  && data.sex && (data.property && data.property.length || (data.sex.length===1)) ){
                this.list[1].click();
                this.$.detail.setData(data,exclude);
            }else {
                this.list[0].click();
            }
        },
        getData: function(){
            if (this.list[0].prop('checked')){
                return null;
            }else {
                return this.$.detail.getData();
            }
        },
        reset: function(){
            if(this.get('detail')){
                this.get('detail').reset();
            }
            this.list[0].prop('checked');
            this.list[0].click();
        }
    })
    exports.peopleTanx = PeopleTanx;

    /**
     * 联通人群属性模块
     */
    var PeopleUnicom = app.extend(Radio, {
        init: function(config){
            config = $.extend({
                'label': LANG('人群属性'),
                'option': [LANG('不限'), LANG('选择人群')],
                'selected': null
            }, config);
            PeopleUnicom.master(this, null, config);
            PeopleUnicom.master(this, 'init', arguments);

            this.$ready = false;
            this.$moduleClass = 'tree_select.main';
            this.$data = config.selected;

            this.build();
        },
        build: function(){
            if (this.$ready){ return; }

            this.doms = {
                con: $('<div class="M-formCountry M-formPeopleTanx" />').appendTo(this.el)
            };

            this.createAsync(
                'detail', this.$moduleClass,
                {
                    'target': this.doms.con,
                    'url': '/nextgen/category?method=DmpCUM',
                    'height': 400,
                    'data': {
                        'Id': -1,
                        'Name': LANG('ROOT'),
                        'Subs': [{
                            'Id': 0,
                            'Name': LANG('人群分类'),
                            'Subs': true
                        }]
                    }
                },
                'afterCreate'
            );
        },
        afterCreate: function(mod){
            // 调整高度
            this.el.find('.M-treeListTab').next('div').height(319);

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
        },
        setData: function(data,exclude){
            this.$data = data;
            if (!this.$ready){ return false; }

            if (data  && data.sex && (data.property && data.property.length || (data.sex.length!==2)) ){
                this.list[1].click();
                this.$.detail.setData(data,exclude);
            }else {
                this.list[0].click();
            }
        },
        getData: function(){
            if (this.list[0].prop('checked')){
                return null;
            }else {
                return this.$.detail.getData();
            }
        },
        reset: function(){
            if(this.get('detail')){
                this.get('detail').reset();
            }
            this.list[0].prop('checked');
            this.list[0].click();
        }
    })
    exports.peopleUnicom = PeopleUnicom;

    /**
     * 温度属性模块
     */
    var Temperature = app.extend(Radio, {
        init: function(config){
            config = $.extend({
                'label': LANG('标签'),
                'option': [LANG('不限'), LANG('指定')],
                'selected': null
            }, config);
            Temperature.master(this, null, config);
            Temperature.master(this, 'init', arguments);

            this.$ready = false;
            this.$data = config.selected;
            this.$count = 0; // 日后可能有多条记录

            this.build();
        },
        build: function(){
            if (this.$ready){ return; }

            var doms = this.doms = {
                con: $('<div class="M-formTemperature" />').appendTo(this.el)
            };

            doms.head = $('<div class="M-formTemperatureHead" />').appendTo(doms.con);
            doms.levelsCon = $('<div class="M-formTemperatureLevelsCon" />').appendTo(doms.con);
            doms.lowCon = $('<div class="M-formTemperatureLowCon" />').appendTo(doms.con);
            doms.highCon = $('<div class="M-formTemperatureHighCon" />').appendTo(doms.con);

            // 头部
            $([
                '<label><input type="checkbox" data-id="1" checked="checked"/>'+LANG('平均温度')+'</label>',
                '<label><input type="checkbox" data-id="2" checked="checked"/>'+LANG('最低温')+'</label>',
                '<label><input type="checkbox" data-id="3" checked="checked"/>'+LANG('最高温')+'</label>'
            ].join('')).appendTo(doms.head);


            // 平均温度
            this.buildLevels();
            // 最低温
            this.buildItem('low');
            // 最高温
            this.buildItem('high');

            this.dg(doms.head, 'input', 'click', 'eventToggleCon');
            this.dg(doms.levelsCon, 'a[data-type]', 'click', 'eventChangeCheckbox');

            this.afterCreate();
        },
        buildLevels: function(){
            var levelsCon = this.doms.levelsCon;
            var btnCon = $('<div class="btnCon"/>').appendTo(levelsCon);
            var con = $('<div class="con"/>').appendTo(levelsCon);

            $([
                '<a data-type="all">'+LANG('全选')+'</a>',
                '<a data-type="invert">'+LANG('反选')+'</a>'
            ].join('')).appendTo(btnCon);

            con.append($('<span class="mr20"/>').html(LANG('当日平均温度')));

            this.create('result', Checkbox,{
                'label': null,
                'target': con,
                'option': [
                    {'id':1, 'text':LANG('-5℃以下')},
                    {'id':2, 'text':LANG('-5℃ ~ 5℃')},
                    {'id':3, 'text':LANG('5℃ ~ 15℃')},
                    {'id':4, 'text':LANG('15℃ ~ 25℃')},
                    {'id':5, 'text':LANG('25℃ ~ 35℃')},
                    {'id':6, 'text':LANG('35℃以上')}
                ],
                'value': '',
                'changeEvent': true
            }).reset();

            var div = $('<div/>').appendTo(con);

            div.append($('<span class="mr10"/>').html(LANG('之后')));

            this.create('openDays', form.input,{
                'label': '',
                'target': div,
                'width': 60,
                'height': 20,
                'value': "0",
                'tips': LANG('持续投放天数填“0”天表示当天投放。'),
                'afterHtml': $('<span class="mg10"/>').html(LANG('天持续投放广告'))
            });
        },
        buildItem: function(type){
            var self = this;
            var wrap = type == 'low' ? self.doms.lowCon : self.doms.highCon;

            wrap.append($('<span class="mg10"/>').html(type == 'low' ? LANG('当日最低温') : LANG('当日最高温')));

            self.create('changeType'+type, common.dropdown,{
                'target': wrap,
                'width': 100,
                'search': false,
                'options': [
                    {Name: LANG('大于等于'), _id: 1},
                    {Name: LANG('小于等于'), _id: 2}
                ]
            }).setData(3);

            wrap.append($('<span class="mg5"/>').html(LANG(' ')));

            self.create('changeCount'+type, form.input,{
                'label': '',
                'target': wrap,
                'width': 40,
                'height': 20,
                'value': "0"
            });

            wrap.append($('<span class="mg10"/>').html(LANG('℃时，之后')));

            self.create('openDays'+type, form.input,{
                'label': '',
                'target': wrap,
                'width': 60,
                'height': 20,
                'value': "0",
                'tips': LANG('持续投放天数填“0”天表示当天投放。'),
                'afterHtml': $('<span class="mg10"/>').html(LANG('天持续投放广告'))
            });
        },
        eventChangeCheckbox: function(evt, elm){
            var type = $(elm).attr('data-type');
            switch (type){
                case 'all':
                    this.$.result.el.find('input').prop('checked', true);
                    break;
                case 'invert':
                    $.each(this.$.result.el.find('input'), function(idx, item){
                        if(item){
                            var check = $(item).prop('checked');
                            $(item).prop('checked', !check);
                        }
                    });
                    break;
            }
        },
        eventToggleCon: function(evt, elm){
            var type = $(elm).attr('data-id');
            var doms = this.doms;
            switch (+type){
                case 1:
                    doms.levelsCon.toggle($(elm).prop('checked'));
                    break;
                case 2:
                    doms.lowCon.toggle($(elm).prop('checked'));
                    break;
                case 3:
                    doms.highCon.toggle($(elm).prop('checked'));
                    break;
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
        },
        setData: function(data,exclude){
            var self = this;
            var cs = self.$;
            var doms = self.doms;
            self.$data = data;
            if (!self.$ready){ return false; }

            if (data  && (data.TemperatureLevels || data.LowTemperature || data.HighTemperature) ){
                self.list[1].click();

                if(data.TemperatureLevels){
                    this.doms.head.find('input').eq(0).prop('checked', true);
                    cs['result'].setData(data.TemperatureLevels.result, 'data-id');
                    cs['openDays'].setData(data.TemperatureLevels.openDays);
                    doms.levelsCon.toggle(true);
                }else{
                    this.doms.head.find('input').eq(0).prop('checked', false);
                    doms.levelsCon.toggle(false);
                }

                if(data.LowTemperature){
                    this.doms.head.find('input').eq(1).prop('checked', true);
                    cs['changeCount'+'low'].setData(data.LowTemperature.ChangeCount);
                    cs['changeType'+'low'].setData(data.LowTemperature.ChangeType);
                    cs['openDays'+'low'].setData(data.LowTemperature.OpenDays);
                    doms.lowCon.toggle(true);
                }else{
                    this.doms.head.find('input').eq(1).prop('checked', false);
                    doms.lowCon.toggle(false);
                }

                if(data.HighTemperature){
                    this.doms.head.find('input').eq(2).prop('checked', true);
                    cs['changeCount'+'high'].setData(data.HighTemperature.ChangeCount);
                    cs['changeType'+'high'].setData(data.HighTemperature.ChangeType);
                    cs['openDays'+'high'].setData(data.HighTemperature.OpenDays);
                    doms.highCon.toggle(true);
                }else{
                    this.doms.head.find('input').eq(2).prop('checked', false);
                    doms.highCon.toggle(false);
                }
            }else {
                self.list[0].click();
            }
        },
        getData: function(){
            var data = {
                TemperatureLevels: null,
                LowTemperature: null,
                HighTemperature: null
            };
            if (this.list[0].prop('checked')){
                return data;
            }else {
                var cs = this.$;
                if(this.doms.head.find('input').eq(0).prop('checked')){
                    data.TemperatureLevels = {
                        'filterType': 0,
                        'result': cs['result'].getData('data-id'),
                        'openDays': +cs['openDays'].getData()
                    }
                }
                if(this.doms.head.find('input').eq(1).prop('checked')){
                    data.LowTemperature = {
                        "ChangeCount": +cs['changeCount'+'low'].getData(), // 温度
                        "ChangeType": +cs['changeType'+'low'].getData(), //0： 不限制 1: >=，2: <=
                        "OpenDays": +cs['openDays'+'low'].getData() //持续投放多少天
                    }
                }
                if(this.doms.head.find('input').eq(2).prop('checked')){
                    data.HighTemperature = {
                        "ChangeCount": +cs['changeCount'+'high'].getData(), // 温度
                        "ChangeType": +cs['changeType'+'high'].getData(), //0： 不限制 1: >=，2: <=
                        "OpenDays": +cs['openDays'+'high'].getData() //持续投放多少天
                    }
                }

                return data;
            }
        },
        reset: function(){
            var self = this;
            var cs = self.$;
            var doms = self.doms;
            doms.head.find('input').prop('checked', true);

            doms.levelsCon.toggle(true);
            doms.lowCon.toggle(true);
            doms.highCon.toggle(true);

            cs['result'].reset();
            cs['openDays'].setData(0);

            cs['changeCount'+'low'].setData(0);
            cs['changeType'+'low'].setData(1);
            cs['openDays'+'low'].setData(0);

            cs['changeCount'+'high'].setData(0);
            cs['changeType'+'high'].setData(1);
            cs['openDays'+'high'].setData(0);


            self.list[0].prop('checked');
            self.list[0].click();
            return self;
        }
    })
    exports.temperature = Temperature;

    /**
     * 温差属性模块
     */
    var TemperatureDiff = app.extend(Radio, {
        init: function(config){
            config = $.extend({
                'label': LANG('标签'),
                'option': [LANG('不限'), LANG('指定温差')],
                'selected': null
            }, config);
            TemperatureDiff.master(this, null, config);
            TemperatureDiff.master(this, 'init', arguments);

            this.$ready = false;
            this.$data = config.selected;
            this.$count = 0; // 日后可能有多条记录

            this.build();
        },
        build: function(){
            if (this.$ready){ return; }

            this.doms = {
                con: $('<div class="M-formTemperatureDiff" />').appendTo(this.el)
            };

            this.buildItem(this.$count);
            this.afterCreate();
        },
        buildItem: function(id){
            var self = this;
            var con = self.doms.con;
            var wrap = $('<div class="M-formTemperatureDiffItem"/>').appendTo(con);

            wrap.append($('<span class=""/>').html(LANG('当所投 城市')));

            // 暂时隐藏，用文字代替
            self.create('target', common.dropdown,{
                'target': wrap,
                'width': 60,
                'search': false,
                'options': [
                    //{Name: LANG('国家'), _id: 1},
                    //{Name: LANG('省份'), _id: 2},
                    {Name: LANG('城市'), _id: 3}
                ]
            }).hide();

            wrap.append($('<span class="mr10"/>').html(LANG(' 最近')));

            self.create('recentCount', form.input,{
                'label': '',
                'target': wrap,
                'width': 40,
                'height': 20,
                'value': 7,
                'disabled': false
            });

            self.create('recentCountType', common.dropdown,{
                'target': wrap,
                'width': 60,
                'search': false,
                'options': [
                    {Name: LANG('天'), _id: 1},
                    {Name: LANG('小时'), _id: 2}
                ]
            });

            wrap.append($('<span class="ml10"/>').html(LANG(' 的温度，')));

            self.create('changeType', common.dropdown,{
                'target': wrap,
                'width': 100,
                'search': false,
                'options': [
                    {Name: LANG('上升'), _id: 1},
                    {Name: LANG('下降'), _id: 2},
                    {Name: LANG('上升或下降'), _id: 3}
                ]
            }).setData(3);
            this.$.changeType.hide();

            wrap.append($('<span class=""/>').html(LANG('上升或下降')));

            wrap.append($('<span class="mr10"/>').html(LANG('≥')));

            self.create('changeCount', form.input,{
                'label': '',
                'target': wrap,
                'width': 40,
                'height': 20,
                'value': "0"
            });

            self.create('changeCountType', common.dropdown,{
                'target': wrap,
                'width': 50,
                'search': false,
                'options': [
                    //{Name: LANG('%'), _id: 1},
                    {Name: LANG('℃'), _id: 2}
                ]
            }).hide();

            wrap.append($('<span class="mg10"/>').html(LANG('℃ 时，之后')));

            self.create('openDays', form.input,{
                'label': '',
                'target': wrap,
                'width': 40,
                'height': 20,
                'value': "0",
                'tips': LANG('持续投放天数填“0”天表示当天投放。'),
                'afterHtml': $('<span class="mg10"/>').html(LANG('天持续投放广告'))
            });
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
        },
        setData: function(data,exclude){
            var self = this;
            var cs = self.$;
            self.$data = data;
            if (!self.$ready){ return false; }

            if (data  && data.length > 0 ){
                self.list[1].click();

                var Change = data[0].Change;
                cs.target.setData(data[0].Target);
                cs.recentCount.setData(Change.RecentCount);
                cs.recentCountType.setData(Change.RecentCountType);
                cs.changeType.setData(Change.ChangeType);
                cs.changeCount.setData(Change.ChangeCount);
                cs.changeCountType.setData(Change.ChangeCountType);
                cs.openDays.setData(data[0].OpenDays);

            }else {
                self.list[0].click();
            }
        },
        getData: function(){
            if (this.list[0].prop('checked')){
                return null;
            }else {
                var data = [];
                var cs = this.$;
                data.push({
                    Target: +cs.target.getData(),
                    Change: {
                        RecentCount: +cs.recentCount.getData(),
                        RecentCountType: +cs.recentCountType.getData(),
                        ChangeType: 3,
                        ChangeCount: +cs.changeCount.getData(),
                        ChangeCountType: +cs.changeCountType.getData()
                    },
                    OpenDays: +cs.openDays.getData()
                });
                return data;
            }
        },
        reset: function(){
            var cs = this.$;

            cs.target.setData(3);
            cs.recentCount.setData(7);
            cs.recentCountType.setData(1);
            cs.changeType.setData(3);
            cs.changeCount.setData(0);
            cs.changeCountType.setData(2);
            cs.openDays.setData(0);

            this.list[0].prop('checked');
            this.list[0].click();
        },
        onOptionChange: function(ev){
            if(ev){
                switch (ev.name){
                    case "recentCountType": // 最近时间单位
                        switch (ev.param.id){
                            case 1:
                                this.$.recentCount.setData(7);
                                break;
                            case 2:
                                this.$.recentCount.setData(5);
                                break;
                        }

                        break;
                }
            }
        }
    })
    exports.temperatureDiff = TemperatureDiff;

    /**
     * 关键词属性模块
     */
    var HotWord = app.extend(Radio, {
        init: function(config){
            config = $.extend({
                'label': LANG('标签'),
                'option': [LANG('关闭'), LANG('开启')],
                'selected': null
            }, config);
            HotWord.master(this, null, config);
            HotWord.master(this, 'init', arguments);

            this.$ready = false;
            this.$data = config.selected;
            this.$count = 0;

            this.build();
        },
        build: function(){
            if (this.$ready){ return; }

            var doms = this.doms = {
                con: $('<div class="M-formHotWord"/>').appendTo(this.el)
            };
            $('<p>').text(LANG('最多监控5个关键词')).appendTo(doms.con);
            doms.itemCon = $('<div class="M-formHotWordCon">').appendTo(doms.con);
            this.buildItem(this.$count);

            // 增加按钮
            this.create('add', common.button,{
                'target': doms.con,
                'text': LANG('添加“或”条件'),
                'data': 'add',
                'class': 'btnBigGray'
            });

            this.dg(this.el, '.M-formHotWordConItemBtnDel', 'click', 'eventDelItem');

            this.afterCreate();
        },
        buildItem: function(id){
            var self = this;
            var con = self.doms.itemCon;
            // 文字或
            $('<p class="M-formHotWordConOr">').html(LANG('或')).appendTo(con)[!id?'hide':'show']();
            // item容器
            var wrap = $('<div class="M-formHotWordConItem" data-id="'+id+'"/>').appendTo(con);
            var wordsWrap = $('<div class="mb10"/>').appendTo(wrap);

            // 关键词
            wordsWrap.append($('<span class="mr10"/>').html(LANG('关注的关键词')));
            // 关键词输入框
            self.create('words'+id, FlexibleHotWord,{
                'label': '',
                'target': wordsWrap,
                'width': 90,
                'height': 20
            });


            // 其他内容区
            wrap.append($('<span class="mr10"/>').html(LANG('当所投')));

            self.create('target'+id, common.dropdown,{
                'target': wrap,
                'width': 60,
                'search': false,
                'options': [
                    {Name: LANG('国家'), _id: 1},
                    {Name: LANG('省份'), _id: 2},
                    {Name: LANG('城市'), _id: 3}
                ]
            }).setData(3);

            wrap.append($('<span class="mg10"/>').html(LANG('最近')));

            self.create('recentCount'+id, form.input,{
                'label': '',
                'target': wrap,
                'width': 40,
                'height': 20,
                'value': 7,
                'disabled': false
            });

            self.create('recentCountType'+id, common.dropdown,{
                'target': wrap,
                'width': 60,
                'search': false,
                'options': [
                    {Name: LANG('天'), _id: 1}
                    //,{Name: LANG('小时'), _id: 2}
                ]
            }).hide();

            wrap.append($('<span class="mg10"/>').html(LANG('天，百度搜索指数上升≥')));

            self.create('changeType'+id, common.dropdown,{
                'target': wrap,
                'width': 100,
                'search': false,
                'options': [
                    {Name: LANG('上升'), _id: 1},
                    {Name: LANG('下降'), _id: 2},
                    {Name: LANG('上升或下降'), _id: 3}
                ]
            }).hide().setData(1);

            self.create('changeCount'+id, form.input,{
                'label': '',
                'target': wrap,
                'width': 40,
                'height': 20,
                'value': ""
            });

            self.create('changeCountType'+id, common.dropdown,{
                'target': wrap,
                'width': 50,
                'search': false,
                'options': [
                    {Name: LANG('%'), _id: 1}
                ]
            }).hide();

            wrap.append($('<span class="mg10"/>').html(LANG('% ，且搜索指数≥')));

            self.create('changeLimit'+id, form.input,{
                'label': '',
                'target': wrap,
                'width': 40,
                'height': 20,
                'value': ""
            });

            wrap.append($('<span class="mg10"/>').html(LANG('时，之后')));

            self.create('openDays'+id, form.input,{
                'label': '',
                'target': wrap,
                'width': 40,
                'height': 20,
                'value': "3",
                'tips': LANG('持续投放天数填“0”天表示当天投放。'),
                'afterHtml': $('<span class="mg10"/>').html(LANG('天持续投放广告'))
            });

            //按钮-删除item
            $('<span class="M-formHotWordConItemBtnDel" data-id="'+id+'"></span>').appendTo(wrap)[!id?'hide':'show']();
        },
        eventDelItem: function(evt, elm){
            var cs = this.$;
            var id = $(elm).attr('data-id');

            // 销毁模块
            cs['words'+id].destroy();
            cs['target'+id].destroy();
            cs['recentCount'+id].destroy();
            cs['recentCountType'+id].destroy();
            cs['changeType'+id].destroy();
            cs['changeCount'+id].destroy();
            cs['changeCountType'+id].destroy();
            cs['changeLimit'+id].destroy();
            cs['openDays'+id].destroy();
            // 移除元素
            $(elm).parent().prev('p').remove();
            $(elm).parent().remove();

            return false;
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
        },
        onButtonClick: function(evt){
            var self = this;
            if (evt.name === 'add'){
                // 查找有多少个关键词输入框
                var length = self.doms.itemCon.find('.M-formFlexibleInput').find('input').length;
                if(length >= 5){
                    app.notify(LANG('最多监控5个关键词'));
                    return false;
                }
                this.buildItem(++this.$count);
            }
        },
        setData: function(data,exclude){
            var self = this;
            var cs = self.$;
            self.$data = data;
            if (!self.$ready){ return false; }

            if (data  && data.length > 0 ){
                self.list[1].click();

                util.each(data, function(item, idx){
                    if(idx > 0){
                        self.buildItem(idx);
                        self.$count = idx;
                    }
                    if(item){
                        cs['words'+idx].setData(item.Words);
                        cs['target'+idx].setData(item.Target);
                        cs['recentCount'+idx].setData(item.Change.RecentCount);
                        cs['recentCountType'+idx].setData(item.Change.RecentCountType);
                        cs['changeType'+idx].setData(item.Change.ChangeType);
                        cs['changeCount'+idx].setData(item.Change.ChangeCount);
                        cs['changeCountType'+idx].setData(item.Change.ChangeCountType);
                        cs['changeLimit'+idx].setData(item.Change.ChangeLimit);
                        cs['openDays'+idx].setData(item.OpenDays);
                    }

                });

            }else {
                self.list[0].click();
            }
        },
        getData: function(){
            if (this.list[0].prop('checked')){
                return null;
            }else {
                var data = [];
                var cs = this.$;
                for(var i = 0; i <= this.$count; i++){
                    if(this.doms.itemCon.find('.M-formHotWordConItem').filter('[data-id='+i+']').is(':visible')){
                        data.push({
                            Words: cs['words'+i] ? cs['words'+i].getData() : [],
                            Target: cs['target'+i] ? +cs['target'+i].getData() : 3,
                            Change: {
                                RecentCount: cs['recentCount'+i] ? +cs['recentCount'+i].getData() : 7,
                                RecentCountType: cs['recentCountType'+i] ? +cs['recentCountType'+i].getData() : 1,
                                ChangeType: cs['changeType'+i] ? +cs['changeType'+i].getData() : 1,
                                ChangeCount: cs['changeCount'+i] ? +cs['changeCount'+i].getData() : '',
                                ChangeLimit: cs['changeLimit'+i] ? +cs['changeLimit'+i].getData() : '',
                                ChangeCountType: cs['changeCountType'+i] ? +cs['changeCountType'+i].getData() : 1
                            },
                            OpenDays: cs['openDays'+i] ? +cs['openDays'+i].getData() : 0
                        });
                    }
                }
                return data;
            }
        },
        reset: function(){
            var cs = this.$;
            // 销毁所有模块
            for(var i = 0; i <= this.$count; i++){
                cs['words'+i].destroy();
                cs['target'+i].destroy();
                cs['recentCount'+i].destroy();
                cs['recentCountType'+i].destroy();
                cs['changeType'+i].destroy();
                cs['changeCount'+i].destroy();
                cs['changeCountType'+i].destroy();
                cs['changeLimit'+i].destroy();
                cs['openDays'+i].destroy();
            }
            // 清空元素，再构建
            this.doms.itemCon.empty();
            this.buildItem(0);

            this.list[0].prop('checked');
            this.list[0].click();
            this.$count = 0;
        }
    })
    exports.hotWord = HotWord;

    // 关键词输入框
    var FlexibleHotWord = app.extend(FlexibleInput, {
        init: function(config, parent,id){
            config = $.extend({
                'class': 'M-formFlexibleHotWord',
                'intervalText': LANG('或')
            }, config);

            FlexibleHotWord.master(this, null, config);
            FlexibleHotWord.master(this, 'init', arguments);
        },
        /**
         * 新增输入框 -按钮的回调事件
         * @param  {object} ev 事件对象
         */
        eventAddItem: function(ev, elm){
            // 查找有多少个关键词输入框
            var length = this.el.parent().parent().parent()
                .find('.M-formFlexibleInput')
                .find('input')
                .length;
            if(length >= 5){
                app.notify(LANG('最多监控5个关键词'));
                return false;
            }
            this.buildItem();
        }
    });

    /**
     * 日程设置时间段设置模块
     */
    function ScheduleTable(config, parent){
        config = $.extend({
            'target': parent,
            'class': 'M-formScheduleTable'
        }, config);
        ScheduleTable.master(this, null, config);
    }
    extend(ScheduleTable, view.container, {
        init: function(){
            var self = this;
            self.el.append('<em class="arrow"/>');

            // 添加辅助按钮
            var buttons = [
                {'class': 'selectWorkday', 'onFunc': 'eventSelectWorkday', 'text': LANG('工作日')},
                {'class': 'selectWeekend', 'onFunc': 'eventSelectWeekend', 'text': LANG('周末')},
                {'class': 'selectInverse', 'onFunc': 'eventSelectInverse', 'text': LANG('反选')},
                {'class': 'clearAll', 'onFunc': 'eventClearAll', 'text': LANG('清空')}
            ]

            var tab = self.$table = $('<table />');
            var head = $('<thead />').appendTo(tab);
            var body = self.$body = $('<tbody />').appendTo(tab);
            var tr, td, k, j;

            // 添加辅助按钮
            tr = $('<tr />').appendTo(head);
            td = $('<th colspan="8" align="right" class="buttonsDiv"/>').appendTo(tr);
            util.each(buttons, function(btn){
                k = $('<a/>').addClass(btn['class']).text(btn.text).appendTo(td);
                self.jq(k, 'click', btn.onFunc);
            });

            tr = $('<tr />').appendTo(head);
            tr.append(
                '<th><i data="0" title="0:00~0:59">00</i><i data="1" title="1:00~1:59">01</i><i data="2" title="2:00~2:59">02</i><i data="3" title="3:00~3:59">03</i></th>'+
                '<th><i data="4" title="4:00~4:59">04</i><i data="5" title="5:00~5:59">05</i><i data="6" title="6:00~6:59">06</i><i data="7" title="7:00~7:59">07</i></th>'+
                '<th><i data="8" title="8:00~8:59">08</i><i data="9" title="9:00~9:59">09</i><i data="10" title="10:00~10:59">10</i><i data="11" title="11:00~11:59">11</i></th>'+
                '<th><i data="12" title="12:00~12:59">12</i><i data="13" title="13:00~13:59">13</i><i data="14" title="14:00~14:59">14</i><i data="15" title="15:00~15:59">15</i></th>'+
                '<th><i data="16" title="16:00~16:59">16</i><i data="17" title="17:00~17:59">17</i><i data="18" title="18:00~18:59">18</i><i data="19" title="19:00~19:59">19</i></th>'+
                '<th><i data="20" title="20:00~20:59">20</i><i data="21" title="21:00~21:59">21</i><i data="22" title="22:00~22:59">22</i><i data="23" title="23:00~23:59">23</i></th>'
            );
            tr.find('th').addClass('range');
            tr.prepend('<th>'+LANG("日期")+'</th><th>'+LANG("时间段")+'</th>');

            var names = [
                LANG('星期日'),LANG('星期一'),LANG('星期二'),
                LANG('星期三'),LANG('星期四'),LANG('星期五'),LANG('星期六')
            ];
            for (var i=0; i<7; i++){
                k = (i + 1) % 7;
                tr = $('<tr/>').attr('data-day', k).appendTo(body);
                tr.append('<td>'+names[k]+'</td>');
                tr.append('<td class="all_day">'+LANG("全天投放")+'</td>');
                for (j=0; j<24; j++){
                    if (j%4 === 0){
                        td = $('<td class="checkcon"/>').attr('data', Math.floor(j/4)).appendTo(tr);
                    }
                    td.append('<i class="checkbox" data="'+k+'-'+j+'" title="'+j+':00~'+j+':59"/>');
                }
            }

            tab.appendTo(self.el);
            ScheduleTable.master(self, 'init');

            self.dg(head, '.range i', 'click', 'eventRange');
            self.dg(body, '.all_day', 'click', 'eventAllDay');
            self.dg(body, 'i.checkbox', 'click', 'eventToggle');
        },
        // 该方法会生成本模块需要的时间data
        // 参数为需要的日子的数组，如[0, 6]表示星期日和星期六
        // 返回一个对象，格式与getData()相同
        _buildDaysData: function(daysArray) {
            // 小时数组
            var hourArr = [];
            for (var j = 0; j < 24; j++) {
                hourArr.push(j);
            }

            var daysData = {};
            var i, len;
            for (i = 0, len = daysArray.length; i < len; i++) {
                daysData[daysArray[i]] = hourArr.slice(0);
            }

            return daysData;
        },
        // 该方法取得子数组的补集
        // 第一个参数为父数组，第二个参数为子数组
        // 考虑将该方法添加到util
        _complementArray: function(fatherArray, subArray) {
            return fatherArray.filter(function(e) {
                return subArray.indexOf(e) < 0;
            })
        },
        // 选择周末
        eventSelectWeekend: function(evt, elm) {
            // 周末data对象
            var weekendData = this._buildDaysData([6, 0]);

            // 合并当前已选择的
            var newData = util.extend(this.getData(), weekendData)

            this.setData(newData);
        },
        // 选择工作日
        eventSelectWorkday: function(evt, elm) {
            // 工作日data对象
            var workdayData = this._buildDaysData([1, 2, 3, 4, 5]);

            // 合并当前已选则的
            var newData = util.extend(this.getData(), workdayData)

            this.setData(newData);
        },
        eventSelectInverse: function(evt, elm) {
            // 整星期的data
            var aWeekDays = [0, 1, 2, 3, 4, 5, 6];
            var aWeekData = this._buildDaysData(aWeekDays);

            // 取得补集
            var selectedData = this.getData();
            var inverseData = {};
            for (var key in aWeekData) {
                // 如果不存在该天
                if (!selectedData[key])	{
                    // 添加一整天
                    inverseData[key] = aWeekData[key].slice(0);
                } else {
                    // 添加相补的小时
                    var complementHours = this._complementArray(aWeekData[key], selectedData[key]);
                    if (complementHours.length > 0) {
                        inverseData[key] = complementHours;
                    }
                }
            }

            this.setData(inverseData);
        },
        // 清空所有选择
        eventClearAll: function(evt, elm) {
            this.setData({})
        },
        /**
         * 整周按照时间段选择
         * @param  {jQuery}  evt jQuery事件对象
         * @param  {Element} elm 事件触发DOM元素
         * @return {None}        无返回
         */
        eventRange: function(evt, elm){
            var data = $(elm).attr('data');
            var list = this.$body.find('.checkcon > i.checkbox[data$=-'+data+']');
            if (list.filter('.act').length == list.length){
                list.removeClass('act');
            }else {
                list.addClass('act');
            }
            list = null;
        },
        /**
         * 整天日程选择
         * @param  {jQuery}  evt jQuery事件对象
         * @param  {Element} elm 事件触发DOM元素
         * @return {None}        无返回
         */
        eventAllDay: function(evt, elm){
            var list = $(elm).parent().find('i.checkbox');
            if (list.filter('.act').length == list.length){
                list.removeClass('act');
            }else {
                list.addClass('act');
            }
            list = null;
        },
        /**
         * 按小时切换选中状态
         * @param  {jQuery}  evt jQuery事件对象
         * @param  {Element} elm 事件触发DOM元素
         * @return {None}        无返回
         */
        eventToggle: function(evt, elm){
            $(elm).toggleClass('act');
        },
        /**
         * 设置控件选中的时间数据
         * @param {Object} data 选中的时间格式
         */
        setData: function(data){
            var boxs = this.$body.find('i.checkbox');
            boxs.removeClass('act');
            util.each(data, function(list, day){
                if (--day < 0) { day=6; }
                util.each(list, function(time){
                    boxs.eq(day * 24 + time).addClass('act');
                });
            });
        },
        /**
         * 获取控件选中的数据
         * @return {Object} 返回选中的时间数据
         */
        getData: function(){
            var data = {};
            var sels = this.$body.find('i.checkbox.act');
            var item, i;
            for (i=0; i<sels.length; i++){
                item = sels.eq(i).attr('data').split('-');
                if (!data[item[0]]){
                    data[item[0]] = [];
                }
                data[item[0]].push(+item[1]);
            }
            sels = item = null;
            return data;
        },
        reset: function(){
            this.setData();
        }
    });
    exports.scheduleTable = ScheduleTable;

    /**
     * 日程选择模块
     */
    function Schedule(config){
        config = $.extend({
            'option': [LANG('全天候展示广告'), LANG('指定时间')],
            'selected': null
        }, config);
        Schedule.master(this, null, config);
    }
    extend(Schedule, Radio, {
        init: function(){
            var c = this.config;
            Schedule.master(this,'init');
            this.container = $('<div class="M-formSchedule" />').appendTo(this.el);
            this.create(
                'table', ScheduleTable,
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
        reset:function(){
            this.setData();
        }
    });
    exports.schedule = Schedule;

    /**
     * 渠道选择模块
     */
    function Channel(config){
        config = $.extend({
            'option': [
                {text: LANG('RTB'), value: 1},
                {text: LANG('网盟'), value: 2}
            ],
            'value': 1,
            'selected': null
        }, config);
        Channel.master(this, null, config);
    }
    extend(Channel, Radio, {
        init: function(){
            Channel.master(this,'init');

            this.cons = [
                $('<div class="M-formChannel" />').appendTo(this.el),
                $('<div class="M-formChannel" />').appendTo(this.el)
            ];

            // RTB价格设置
            this.price = this.create('price', Input, {
                label: LANG('最高出价'),
                beforeText: '￥',
                target: this.cons[0],
                width: 120
            });
            this.budget = this.create('budget', Input, {
                label: LANG('每日预算'),
                beforeText: '￥',
                target: this.cons[0],
                width: 120
            });

            this.jq(this.list[0], 'click', 'changeStatue');
            this.jq(this.list[1], 'click', 'changeStatue');
            this.changeStatue();
        },
        changeStatue: function(evt){
            var checked = this.list[0].prop('checked');
            this.cons[0].toggle(checked);
        },
        setData: function(data){
            if (!data || !data.length){
                this.list[0].click();
            }else {
                this.country.setData(data);
                this.list[1].click();
            }
        },
        getData: function(){
            if (this.list[0].prop('checked')){
                return [];
            }else {
                return this.country.getData();
            }
        }
    });
    exports.channel = Channel;

    /**
     * 日期模块
     */
    function Calendar(config){
        config = $.extend({
            'value': '',
            'max': 0,
            'min': 0,
            'disabled': false
        }, config);
        Calendar.master(this, null, config);
    }
    extend(Calendar, Item, {
        init: function(){
            var c = this.config;

            this.create('date', common.datePicker, {
                target: this.el,
                value: c.value,
                max: c.max,
                min: c.min,
                disabled: c.disabled
            });
            Calendar.master(this,'init');
        },
        setData: function(data){
            this.config.value = data;
            this.date.setData(data);
        },
        getData: function(){
            return this.date.getData();
        }
    });
    exports.cal = Calendar;


    /**
     * 日期范围模块
     */
    function DateRange(config){
        config = $.extend({
            'start': '',
            'end': '',
            'noLimit': LANG('不限'),
            'disabled': false
        }, config);
        DateRange.master(this, null, config);
    }
    extend(DateRange, Item, {
        init: function(){
            var c = this.config;

            this.create('start', common.datePicker, {
                target: this.el,
                value: c.start,
                max: c.end || 0,
                disabled: c.disabled
            });

            this.el.append('<span style="padding:0 10px;">'+LANG("至")+'</span>');

            this.create('end', common.datePicker, {
                target: this.el,
                value: c.end,
                min: c.start || 0,
                disabled: c.disabled,
                no_date: c.noLimit,
                buttons: [{text:c.noLimit, name:'clear', cls:'fr'}]
            });
            DateRange.master(this,'init');
        },
        onDateButton: function(ev){
            if (ev.param.name === 'clear'){
                this.$.end.setData(0).selectDate();
                this.$.start.setup({max:0});
            }
        },
        onDateChange: function(ev){
            var cs = this.$;
            switch (ev.from){
                case cs.start:
                    cs.end.setup({min: ev.param});
                    break;
                case cs.end:
                    cs.start.setup({max: ev.param});
                    break;
            }
            return false;
        },
        setData: function(data){
            var start = data && data.start || 0;
            var end = data && data.end || 0;
            var cs = this.$;
            cs.start.setData(start).setup({max: end});
            cs.end.setData(end).setup({min: start});
            return this;
        },
        getData: function(){
            var ret = {
                start: this.$.start.getData(),
                end: this.$.end.getData()
            };
            return ret;
        },
        reset:function(){
            this.setData(this.config);
            return this;
        }
    });
    exports.dateRange = DateRange;


    /**
     * 比例拖拽模块
     */
    function Scale(config, parent){
        config = $.extend({
            'class': 'M-formScale',
            'target': parent,
            'items': null,
            'width': null,
            'height': null,
            'disabled': false,
            'frontClass': 'front',
            'colorLineOff': 20,
            'ruler':{
                'bottom':7,
                'left':0,
                'space':2
            }
        }, config);

        Scale.master(this, null, config);
        this.drag = null;
        this.isDataDirty = false;
        this.delayShowId = 0;
        this.isInited = false;
        this.disabled = config.disabled;
        this.color = 100;
    }
    extend(Scale, view.container, {
        init: function(){
            var c = this.config;
            this.render();

            this.bar = $('<div class="M-formScaleBar" />').appendTo(this.el);
            this.ctrs = [];
            this.tips = [];
            this.colorLines = [];
            this.index = 0;
            if (c.items){
                var cnt = c.items.length;
                for (var i=0; i<cnt; i++){
                    // 生成拖动块
                    this.buildItem(c.items[i]);
                }
                this.measure();
            }
            this.create('ruler',common.ruler,c.ruler);
            // Tip被点击时将其置于最前
            this.dg(this.el, '.M-formScaleTips', 'click', 'eventTipClick');
        },
        // Tip点击回调
        eventTipClick: function(evt, elm) {
            var el = $(elm);
            var frontClass = this.config.frontClass;
            el.addClass(frontClass).siblings().removeClass(frontClass);
        },
        updateSize: function(){
            if (this.isInited){ return true; }
            this.isInited = true;
            var c = this.config;
            if (!c.width || isNaN(+c.width)){
                this.width = this.el.width();
            }else {
                this.width = c.width;
            }
            if (c.height > 0){
                this.el.height(c.height);
            }
            this.bar.width(this.width);
        },
        /**
         * 控制块拖动处理函数
         * @param  {Object} ev 拖动事件对象
         * @return {Bool}    返回操作是否成功
         */
        eventCtrs: function(ev){
            if (this.disabled) {
                return;
            }

            var d, dx, size, sum;
            switch (ev.type){
                case 'moveDrag':
                    d = this.drag;
                    if (!d){
                        return false;
                    }
                    dx = Math.min(d[2].size, Math.max(-d[0].size, ev.dx));

                    // 更新位置
                    d[1].css('left', d[0].next + dx);
                    d[3].css('width',d[0].colorLineW+dx);
                    d[4].css({
                        'width':d[2].colorLineW-dx,
                        'left':d[2].colorLineL+dx
                    })
                    var dx1 = d[0].pos + Math.round(dx / 2);
                    var dx2 = d[2].pos + Math.round(dx / 2);
                    d[0].tip.css('left', dx1);
                    d[2].tip.css('left', dx2);

                    // 更新百分比
                    sum = d[0].precent + d[2].precent;
                    size = d[0].size + d[2].size;
                    dx1 = Math.round(sum * (d[0].size + dx) / size);
                    dx2 = sum - dx1;
                    d[0].num.text(dx1 + '%');
                    d[2].num.text(dx2 + '%');
                    break;
                case 'startDrag':
                    for (var i=0; i<this.tips.length; i++){
                        if (ev.data == this.tips[i].id){
                            this.drag = [this.tips[i-1], this.ctrs[i-1], this.tips[i],this.colorLines[i-1],this.colorLines[i]];
                            return true;
                        }
                    }
                    break;
                case 'endDrag':
                    d = this.drag;
                    if (!d){
                        return false;
                    }
                    dx = Math.min(d[2].size, Math.max(-d[0].size, ev.dx));

                    d[0].next += dx;
                    d[0].pos += Math.round(dx / 2);
                    d[2].pos += Math.round(dx / 2);

                    size = d[0].size + d[2].size;
                    d[0].size += dx;
                    d[2].size -= dx;

                    sum = d[0].precent + d[2].precent;
                    d[0].precent = Math.round(sum * d[0].size / size);
                    d[2].precent = sum - d[0].precent;

                    sum = d[0].value + d[2].value;
                    d[0].value = Math.round(sum * d[0].size / size);
                    d[2].value = sum - d[0].value;

                    d[0].colorLineW += dx;
                    d[2].colorLineW -= dx;
                    d[2].colorLineL += dx;
                    d[1].css('left', d[0].next);
                    d[3].css('width',d[0].colorLineW);
                    d[4].css({
                        'width':d[2].colorLineW,
                        'left':d[2].colorLineL
                    })
                    d[0].tip.css('left', d[0].pos);
                    d[2].tip.css('left', d[1].pos);
                    d[0].num.text(d[0].precent + '%');
                    d[2].num.text(d[2].precent + '%');
                    this.drag = null;
                    break;
            }
            return true;
        },

        /**
         * 计算标签位置
         * @return {None} 无返回
         */
        measure: function(force){
            var self = this;
            if (self.el.width() <= 0){
                if (!self.delayShowId){
                    self.delayShowId = setInterval(function(){self.measure();}, 300);
                }
                if (!force){
                    this.isDataDirty = true;
                    return;
                }
            }else if (self.delayShowId){
                clearInterval(self.delayShowId);
                self.delayShowId = 0;
            }
            this.isDataDirty = false;
            this.updateSize();

            var i, sum = 0;
            for (i=0; i<this.tips.length; i++){
                sum += this.tips[i].value;
            }
            if (sum === 0 && this.tips.length){
                sum = Math.round(100 / this.tips.length);
                for (i=1; i<this.tips.length; i++){
                    this.tips[i].value = sum;
                }
                this.tips[0].value = 100 - sum * (this.tips.length - 1);
                sum = 100;
            }

            var w = this.width, cw = 0;
            if (this.ctrs.length){
                cw = this.ctrs[0].outerWidth();
                w -= cw * this.ctrs.length;
            }

            var it, off = 0,latestLeft = 0;
            for (i=0; i<this.tips.length; i++){
                it = this.tips[i];
                it.precent = Math.round(it.value / sum * 100);
                it.size = Math.round(w * it.value / sum);
                it.pos = off + Math.round(it.size / 2);
                it.next = off + it.size;
                off = cw + it.next;
                it.num.text(it.precent + '%');
                it.tip.css('left', it.pos);
                it.tip.css('marginLeft', -Math.round(it.tip.outerWidth() / 2));
                if (this.ctrs.length > i){
                    this.ctrs[i].css('left', it.next);
                }
                this.colorLines[i].css({
                    'width':it.next - latestLeft+4,
                    'left': latestLeft
                });
                it.colorLineW = this.colorLines[i].width();
                it.colorLineL = this.colorLines[i].position().left;
                latestLeft = off -4;
            }
        },
        /**
         * 建立标签实例
         * @param  {Object} item 项目配置对象
         * @return {Mix}      返回项目标识ID
         */
        buildItem: function(item){
            var id = item.id || this.index++;
            // 确定标签颜色
            var color = app.util.hsb2rgb(this.color, 0.70, 0.80);
            this.color += 130;
            var dom;
            dom = $('<div class="M-formScaleColorLine"/>').appendTo(this.bar);
            dom.css('background', color);
            this.colorLines.push(dom);
            // 生成拖动块
            if (this.tips.length>0){
                dom = $('<div class="M-formScaleCtr" data-id="'+id+'"/>').appendTo(this.bar);
                app.drag(dom, id, this.eventCtrs, this);
                this.ctrs.push(dom);
            }

            // 生成标签
            dom = $('<div class="M-formScaleTips"><div></div><span></span><em class="M-formScaleTipsArrow"></em></div>').appendTo(this.bar);
            dom.css('background', color);
            dom.find('em').css('border-top-color', color);
            this.tips.push({
                id: id,
                tip: dom,
                num: dom.children('span'),
                data: item,
                value: (item.value || 0),
                size: 0,
                next: 0,
                pos: 0,
                precent: 0,
                colorLineW:0,
                colorLineL:0
            });

            dom = dom.children('div');
            if (app.util.isFunc(item.render)){
                dom.html(item.render(item, dom));
            }else if (item.html){
                dom.html(item.html);
            }else {
                dom.text(item.text);
            }

            return id;
        },
        /**
         * 添加项目
         * @param {Object} item 标签项目对象
         * @return {Mix} 返回项目标识ID
         */
        add: function(item){
            if (this.tips.length > 0){
                var v, c = this.tips.length + 1, sum = 0;
                for (var i=0; i<this.tips.length; i++){
                    if (item.id && item.id == this.tips[i].id){
                        return false;
                    }
                    if (!item.value){
                        v = Math.round(this.tips[i].value / c);
                        this.tips[i].value -= v;
                        sum += v;
                    }
                }
                if(!item.value){
                    item.value = sum;
                }
            }else if (!item.value){
                item.value = 100;
            }
            var id = this.buildItem(item);
            this.measure();
            return id;
        },
        /**
         * 删除项目
         * @param  {Mix} id    要删除的标签标识ID
         * @return {Bool}    返回操作是否成功
         */
        remove: function(id){
            for (var i=0; i<this.tips.length; i++){
                if (this.tips[i].id == id){
                    break;
                }
            }
            if (i >= this.tips.length){
                return false;
            }

            // 合并数值, 删除dom对象
            var item = this.tips.splice(i, 1).pop();
            item.tip.remove();
            var colorLine = this.colorLines.splice(i,1).pop();
            if(colorLine){
                colorLine.remove();
            }
            if (i > 0){
                i--;
            }
            var dom  = this.ctrs.splice(i, 1).pop();
            if (dom){
                dom.remove();
            }
            if (i < this.tips.length){
                this.tips[i].value += item.value;
            }
            this.measure();
            return true;
        },
        /**
         * 重置数据, 删除所有标签
         * @return {None} 无返回
         */
        reset: function(){
            while (this.ctrs.length){
                this.ctrs.shift().remove();
            }
            while (this.tips.length){
                this.tips.shift().tip.remove();
            }
            while(this.colorLines.length){
                this.colorLines.shift().remove();
            }
            this.config.items = null;
            this.drag = null;
            this.isDataDirty = false;
            if (this.delayShowId){
                clearInterval(this.delayShowId);
                this.delayShowId = 0;
            }
            // this.isHide = false;
            this.index = 0;
        },
        /**
         * 设置数据
         * @param {Array} data 节点数据数组
         */
        setData: function(data){
            this.reset();

            if (data){
                this.config.items = data;
                var cnt = data.length;
                for (var i=0; i<cnt; i++){
                    // 生成拖动块
                    this.buildItem(data[i]);
                }
                this.measure();
            }
        },
        /**
         * 获取分配的选项值
         * @return {Object} 分配值对象, key是选项的标识ID
         */
        getData: function(){
            if (this.isDataDirty){
                this.measure(true);
            }
            var data = {};
            for (var i=0; i<this.tips.length; i++){
                data[this.tips[i].id] = this.tips[i].value;
            }
            return data;
        },
        /**
         * 获取分配的
         * @return {Object} 分配值对象, key是选项的标识ID
         */
        getPercent: function(){
            if (this.isDataDirty){
                this.measure(true);
            }
            var data = {};
            for (var i=0; i<this.tips.length; i++){
                data[this.tips[i].id] = this.tips[i].precent;
            }
            return data;
        }
    });
    exports.scale = Scale;

    /**
     * 下拉选择模块
     */
    function Dropdown(config, parent){
        var item = {
            'class': 'M-formItem',
            'target': (config.target || parent),
            'label': config.label,
            'pos': (config.pos || 'before'),
            'beforeText': (config.beforeText || null),
            'afterText': (config.afterText || null),
            'tip': (config.tip || null)
        };
        Dropdown.master(this, null, item);

        config.target = this.el;
        this.$dropdown_config = config;
    }
    extend(Dropdown, Item, {
        init: function(){
            this.create('list', common.dropdown, this.$dropdown_config);
            Dropdown.master(this, 'init');
        },
        setData: function(select, options){
            return this.$.list.setData(select, options);
        },
        reset: function(){
            return this.$.list.reset();
        },
        getData: function(){
            var m = this.$.list;
            return m.getData.apply(m, arguments);
        },
        load: function(param){
            var m = this.$.list;
            return m.load.apply(m, arguments);
        }
    });
    exports.dropdown = Dropdown;

    // 三级下拉框
    var SubDropdown = app.extend(Item,{
        init: function(config, parent) {
            var item = {
                'class': 'M-formItem',
                'target': (config.target || parent),
                'label': config.label,
                'pos': (config.pos || 'before'),
                'beforeText': (config.beforeText || null),
                'afterText': (config.afterText || null),
                'tip': (config.tip || null)
            };

            config.target = this.el;
            this.$dropdown_config = config;
            SubDropdown.master(this, null, item);
            SubDropdown.master(this,"init");
            this.build();
        },
        build: function(){
            this.create('list', common.subDropdown, this.$dropdown_config);
        },
        setData: function(select, options){
            return this.$.list.setData(select, options);
        },
        reset: function(){
            return this.$.list.reset();
        },
        getData: function(){
            var m = this.$.list;
            return m.getData.apply(m, arguments);
        },
        load: function(param){
            var m = this.$.list;
            return m.load.apply(m, arguments);
        },
        onOptionChange:function(ev){
            this.$.list.showResult();
        }

    });
    exports.subDropdown = SubDropdown;

    /**
     * 按钮组模块
     */
    function ButtonGroup(config, parent){
        this.$item_class = config['class'];
        delete config['class'];
        ButtonGroup.master(this, null, config);
    }
    extend(ButtonGroup, common.buttonGroup, {
        init: function(){
            var c = this.config;
            ButtonGroup.master(this, 'init');
            c.content = this.el;
            if (this.$item_class){
                c['class'] = this.$item_class;
            }
            this.create('con_item', Item, c);
            delete c.content;
        }
    });
    exports.buttonGroup = ButtonGroup;

    /**
     * 表单分组模块
     * @param {Object} config 配置信息对象
     *   title		- <String> 分组标题
     *   desc		- <String> 分组备注说明
     *   list_title	- <String> 说明列表标题
     *   list		- <Array>  说明列表项目
     *   addon		- <String> 右侧区域HTML代码
     */
    function Section(config, parent){
        config = $.extend(true, {
            'title': LANG('标题'),
            'desc': null,
            'list_title': null,
            'list': null,
            'addon': null,
            'class': 'M-formSection',
            'container': null,
            'target': parent,
            // "bottom":{
            // "class":"theSectionBottom"
            // }
            "bottom":null
        }, config);
        Section.master(this, null, config);
    }
    extend(Section, view.container, {
        init: function(){
            this.render();

            var c = this.config;
            var doms = this.doms = {};
            // 标题
            doms.title = $('<div class="M-formSectionTitle"/>').text(c.title).appendTo(this.el);
            // 右侧区域
            doms.addon = $('<div class="M-formSectionAddon"/>').appendTo(this.el);
            // 备注说明
            if (c.desc){
                doms.desc = $('<div class="M-formSectionDesc"/>').text(c.desc).appendTo(this.el);
            }
            // 备注说明列表
            if (c.list_title && c.list){
                $('<em class="M-formSectionListTitle" />').text(c.list_title).appendTo(this.el);
                doms.list = $('<ul class="M-formSectionList"/>').appendTo(this.el);
                util.each(c.list, function(item){
                    if (util.isString(item)){
                        $('<li/>').text(item).appendTo(doms.list);
                    }else if (item.text) {
                        var text = item.text;
                        delete(item.text);
                        $('<li/>').text(text).attr(item).appendTo(doms.list);
                        item.text = text;
                    }
                });
            }
            // 右侧内容
            if (c.addon){
                doms.addon.html(c.addon);
                if (doms.list){
                    doms.list.addClass('narrow');
                }
            }
            // 主要内容容器
            var wrap = $('<div class="M-formSectionWraper"/>').appendTo(this.el);
            doms.container = $('<div class="M-formSectionContainer"/>').appendTo(wrap);
            if (c.container && c.container['class']){
                doms.container.addClass(c.container['class']);
            }
            doms.bottom = null;
            if(c.bottom){
                doms.bottom = $('<div class="'+(app.util.isObject(c.bottom) && c.bottom['class'] || 'M-formSectionBottom')+'"></div>');
                this.el.append(doms.bottom);
            }
        },
        /**
         * 获取主要容器jQuery对象
         * @return {jQuery} 容器jQuery对象
         */
        getContainer: function(name){
            if (!name){
                name = 'container';
            }
            return this.doms[name];
        }
    });
    exports.section = Section;

    /**
     * 保存成功Section
     */
    var SuccessSection = app.extend(Section, {
        init: function(config, parent) {
            SuccessSection.master(this, null, config);
            this.data = config.data;
            SuccessSection.master(this,"init");

            var el = this.el;
            el.addClass("M-formSaveSuccess");
            el.prepend("<div class='M-formSectionSuccessImage'><b></b></div>");
            $(".M-formSectionDesc, .M-formSectionListTitle, .M-formSectionList", el).wrapAll("<div class='M-formSaveSuccessWrapper'></div>");
        }
    })
    exports.successSection = SuccessSection;

    /**
     * 折叠容器模块
     * @param {Object} config 配置信息对象
     *	fold_text	- 收起显示的文字
     *	fold_class	- 按钮状态切换CSS类名称
     *	unfold_text	- 展开显示的文字
     *
     */
    function Folding(config, parent){
        config = $.extend({
            'class': 'M-formFolding',
            'target': parent,
            'fold_text': LANG('收起'),
            'fold_class': 'open',
            'unfold_text': LANG('展开'),
            'show': false
        }, config);

        Folding.master(this, null, config);
        this.$state = !config.show;
    }
    extend(Folding, view.container, {
        init: function(){
            this.render();
            var doms = this.doms = {};
            doms.button = $('<a class="M-formFoldingButton" />').appendTo(this.el);
            doms.container = $('<div class="M-formFoldingContainer" />').appendTo(this.el);
            this.jq(doms.button, 'click', 'eventToggle');
            doms.button.click();
        },
        eventToggle: function(evt, elm){
            var c = this.config;
            this.$state = !this.$state;
            this.el.toggleClass(c.fold_class, this.$state);
            if (this.$state){
                this.doms.button.text(c.fold_text);
            }else {
                this.doms.button.text(c.unfold_text);
            }
        },
        getContainer: function(){
            return this.doms.container;
        }
    });
    exports.folding = Folding;

    // 影视搜索控件
    var VideoSearch = app.extend(view.container, {
        init: function (config) {
            config = $.extend({
                'class':'M-formVideoDirectGrid',
                'url': {
                    // 列表接口
                    'list': 'sweety/videochannel?method=search',
                    // get接口
                    'get': 'sweety/videochannel?method=get'
                },
                'hasExclude': false // 是否有排除
            },config);

            this.$filterData = [];
            this.$ids = [];
            this.$cache = {};

            this.$excludeData = [];
            this.$exclude_ids = [];
            this.$exclude_cache = {};

            this.$inExType = 0;	// 包含、排除内型

            VideoSearch.master(this, null,config);
            VideoSearch.master(this, 'init', arguments);

            this.build();
        },
        build: function(){
            var self = this;
            var c = self.config;
            var el = self.el.addClass(c.class);

            $([
                '<div class="listCon">',
                '<label>',
                LANG('搜索结果：'),
                '</label>',
                '</div>',
                '<div class="filterCon">',
                '<label>',
                LANG('已选结果：'),
                '</label>',
                '<div class="inExCon"/>',
                '</div>'
            ].join('')).appendTo(el);

            this.list = this.create('list', grid.base, {
                'cols': [
                    {type: 'id'},
                    {name: 'Keyword', text:'关键词', sort: false, 'align': 'left'},
                    {name: 'Bid', text:'昨日竞价量', sort: false}
                ],
                'sub_field': 'Id',
                'url': c.url.list,
                'hasSelect': true,
                'hasTab': false,
                'hasAmount': false,
                'hasExport': false,
                'pager':{
                    'size': 20,
                    'bounds': 5,
                    // 'firstLast': false,
                    // 'showJumper': 0,
                    'showSizeTypes': 0
                },
                'list':{
                    'rowSelect': true,
                    'scroll_type': 'row',
                    'scroll_size': 10
                },
                'autoFocus': false,
                'target': el.find('.listCon')
            });

            this.filter = this.create('filter', grid.base, {
                'cols': [
                    {type: 'id'},
                    {name: 'Keyword', text:'关键词', sort: false, 'align': 'left'},
                    {name: 'Bid', text:'昨日竞价量', sort: false}
                    //{type:"op", html:'<a data-op="remove" title="'+LANG("删除此条记录")+'">'+LANG("删除")+'</a>'}
                ],
                'operation':{
                    render: this.renderOperation,
                    cls:'M-gridOPCursor',
                    width: 60
                },
                'sub_field': 'Id',
                'hasSelect': false,
                'hasTab': false,
                'hasAmount': false,
                'hasExport': false,
                'hasPager': false,
                'hasSearch': false,
                'list':{
                    'rowSelect': false,
                    'scroll_type': 'row',
                    'scroll_size': 10
                },
                'target': el.find('.filterCon')
            });

            if(c.hasExclude){
                this.create('inEx', form.radio,{
                    'target': el.find('.inExCon'),
                    'label': null,
                    'value': 0,
                    'changeEvent': true,
                    'option': [
                        {text: LANG('包含'), value: 0},
                        {text: LANG('排除'), value: 1}
                    ]
                });
            }

        },
        renderOperation: function(index, val, row){
            var html = '<a data-op="remove" title="'+LANG("删除此条记录")+'">'+LANG("删除")+'</a>';
            return html;
        },
        onListOpClick: function(ev){
            var index = ev.param.index;
            var ids = this.$ids;
            var data = this.$filterData;

            var id = ids.splice(index, 1);
            data.splice(index, 1);
            this.$cache[id] = null;
            this.$.filter.setData(data);
            this.$.list.setSelectRowIds(ids);
            this.dataChange(ids);
            return false;
        },
        onChangeSelect: function(ev){
            if(this.$ids && this.$ids.length >= 50){
                app.notify(LANG('已达到结果选择的最大数量50个！'));
                return false;
            }
            // 更新数据
            this.updateData(ev.param.data);
            return false;
        },
        onRadioChange: function(ev){
            this.$inExType = ev.param.value;
            return false;
        },
        dataChange:function(ids){
            this.fire(
                "videoGridChange"
                ,{
                    "ids":ids
                }
            );
            ids = null;
            return this;
        },
        load: function(param){
            var self = this;
            var c = self.config;
            app.data.put(c.url.get, {
                'ids': param
            }, self, 'onData');
        },
        onData: function(err, data){
            if (err){
                app.error(err);
                return false;
            }
            // 更新数据
            this.updateData(data && data.items || []);
            this.$.list.setSelectRowIds(this.$ids);
        },
        // 更新数据
        updateData: function(result){
            var cache = this.$cache;
            var data = this.$filterData;
            var ids = this.$ids;

            util.each(result, function(row){
                if(row && !cache[row.Id]){
                    cache[row.Id] = row;
                    data.push(row);
                    ids.push(row.Id);
                }
            });
            // id去重
            ids = util.uniq(ids);
            this.$.filter.setData(data);
            this.dataChange(ids);

            return this;
        },
        setData: function(data, type){
            if(data){
                this.load(data);
                var c = this.config;
                if(c.hasExclude){
                    this.$.inEx.setData(type || 0);
                }
            }

            return this;
        },
        getData: function(){
            var c = this.config;
            if(c.hasExclude){
                if(this.$inExType){
                    return {
                        WordIds: [],
                        ExcWordIds: this.$ids || [],
                        Type: this.$inExType
                    }
                }else{
                    return {
                        WordIds: this.$ids || [],
                        ExcWordIds: [],
                        Type: this.$inExType
                    }
                }
            }
            return this.$ids || [];
        },
        reset: function(){
            this.$.filter.setData([]);
            this.$filterData = [];
            this.$ids = [];
            this.$cache = {};
            this.$inExType = 0;
        }
    });

    // 视频定向控件
    var VideoDirect = app.extend(Radio, {
        init: function (config) {
            config = $.extend({
                'label': LANG('标签'),
                'option': [LANG('关闭'), LANG('开启')]
            },config);

            VideoDirect.master(this, null,config);
            VideoDirect.master(this, 'init', arguments);
            this.$ready = false;
            this.build();
        },
        build:function(){
            var self = this;

            self.doms = {
                con: $('<div class="M-formVideoDirect"/>').appendTo(self.el)
            };

            self.tab = this.create('videoDirectTab', tab.base, {
                'target':this.doms.con,
                'list':{
                    'cate':{
                        text:LANG('影视类型')
                    },
                    'word': {
                        text: LANG('视频搜索')
                    }
                }
            });

            //在此构建组件
            self.create('videoSearch', VideoSearch, {
                'target':self.tab.getContainer('word')
            });

            self.create('videoCategory', country.videoChannel, {
                'target':self.tab.getContainer('cate').addClass('')
            });

            this.afterCreate();
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
        },
        getData: function() {
            var data = {
                'CategoryIds': this.$.videoCategory.getData() || [],
                'WordIds': this.$.videoSearch.getData() || []
            };
            if (this.list[0].prop('checked')){
                data.Status = false;
            }else {
                data.Status = true;
            }
            return data;
        },
        setData: function(data) {
            if(data.Status) {
                this.list[1].click();
                this.doms.con.toggle(data.Status);
            }
            else {
                this.list[0].click();
            }

            this.$.videoCategory.setData(data.CategoryIds || []);
            this.$.videoSearch.setData(data.WordIds || []);
        },
        reset: function(){
            this.$.videoCategory.reset();
            this.$.videoSearch.reset();
            this.list[0].prop('checked');
            this.list[0].click();
            return this;
        }
    });
    exports.videoDirect = VideoDirect;

    // 页面关键词控件
    var PageKeyword = app.extend(Radio, {
        init: function (config) {
            config = $.extend({
                'label': LANG('标签'),
                'option': [LANG('关闭'), LANG('开启')]
            },config);

            PageKeyword.master(this, null,config);
            PageKeyword.master(this, 'init', arguments);
            this.$ready = false;
            this.build();
        },
        build:function(){
            this.doms = {
                con: $('<div class="M-formPageKeyword"/>').appendTo(this.el)
            };

            //在此构建组件
            this.create('detail', VideoSearch, {
                'target': this.doms.con,
                'hasExclude': true,
                'url': {
                    'list': '/sweety/videochannel?method=pageWord',
                    'get': '/sweety/videochannel?method=get'
                }
            });

            this.afterCreate();
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
        },
        getData: function() {
            // var data = {
            // 	'WordIds': this.$.detail.getData() || []
            // };
            var data = this.$.detail.getData();
            if (this.list[0].prop('checked')){
                data.Status = false;
            }else {
                data.Status = true;
            }
            return data;
        },
        setData: function(data) {
            if(data.Status) {
                this.list[1].click();
                this.doms.con.toggle(data.Status);
            }
            else {
                this.list[0].click();
            }
            if(data.Type){
                this.$.detail.setData(data.ExcWordIds || [], data.Type);
            }else{
                this.$.detail.setData(data.WordIds || [], data.Type);
            }
            return this;

        },
        reset: function(){
            if(this.get('detail')){
                this.get('detail').reset();
            }
            this.list[0].prop('checked');
            this.list[0].click();
            return this;
        }
    });
    exports.pageKeyword = PageKeyword;

    // 添加活动按钮
    var CampaignButton = app.extend(view.container, {
        init: function (config) {
            config = $.extend({
                'class':'M-formCampaignButton',
                'items': [
                    //{
                    //    text: LANG('PC广告'),
                    //    link: '#campaign/edit?BidType=0',
                    //    items: [
                    //        {
                    //            text: LANG('公开竞价活动'),
                    //            link: '#campaign/edit?BidType=0'
                    //        },
                    //        {
                    //            text: LANG('首选交易活动'),
                    //            link: '#campaign/edit?BidType=1',
                    //            type: 'pref'
                    //        },
                    //        {
                    //            text: LANG('私下竞价活动'),
                    //            link: '#campaign/edit?BidType=2',
                    //            type: 'priv'
                    //        }
                    //    ]
                    //},
                    //{
                    //    text: LANG('移动广告'),
                    //    link: '#campaign/MTEdit?BidType=0',
                    //    items: [
                    //        {
                    //            text: LANG('公开竞价活动'),
                    //            link: '#campaign/MTEdit?BidType=0'
                    //        },
                    //        {
                    //            text: LANG('首选交易活动'),
                    //            link: '#campaign/MTEdit?BidType=1',
                    //            type: 'pref'
                    //        },
                    //        {
                    //            text: LANG('私下竞价活动'),
                    //            link: '#campaign/MTEdit?BidType=2',
                    //            type: 'priv'
                    //        }
                    //    ]
                    //},
                    //{
                    //    text: LANG('广告监测'),
                    //    link: '#campaign/agentEdit'
                    //}
                ]
            },config);

            CampaignButton.master(this, null,config);
            CampaignButton.master(this, 'init', arguments);

            this.build();
        },
        onAddCampaignBtnClick: function(){
            //window.open('/pmp/campaign/edit?Id=6');
            window.location.href='/pmp/campaign/edit?Id=6';
        },
        build: function(){
            var self = this;
            var c = self.config;
            var el = self.el.addClass(c.class);

            // 添加按钮
            this.addBtn = this.create('addBtn', view.container, {
                'target': el,
                'tag':'button',
                'class':'btnAddGreen',
                'html':'<em></em>'+LANG('添加活动')+'<span></span>'
            });
            this.jq(this.addBtn.el,"click","onAddCampaignBtnClick");

            var groupCon = this.groupCon = $('<ul class="group"/>').appendTo(el);

            var campany = app.getUserCampany();
            var hasPref = campany.HasCreatePref;
            var hasPriv = campany.HasCreatePriv;

            if(c.items && c.items.length){
                util.each(c.items, function(group, idx){

                    if(group){

                        var liCon = $([
                            '<li class="groupItem">',
                            '<a  target="_blank">',
                            '<span>'+group.text+'</span>',
                            '</a>',
                            '</li>'
                        ].join('')).appendTo(groupCon);

                        if(group.items && (hasPref || hasPriv)){
                            group.link = '';
                        }
                        if(!hasPref && !hasPriv){
                            group.items = null;
                        }

                        if(group.link){
                            liCon.find('>a').attr('href',group.link);
                        }

                        if(group.items && group.items.length){

                            var subGroupCon = $('<ul class="subGroup"></ul>'
                            ).appendTo(liCon);

                            util.each(group.items, function(item){
                                if(!hasPref && item && item.type == 'pref'){
                                    item = null;
                                }
                                if(!hasPriv && item && item.type == 'priv'){
                                    item = null;
                                }
                                if(item){
                                    $([
                                        '<li class="groupItem">',
                                        '<a href="'+item.link+'" target="_blank">',
                                        '<span>'+item.text+'</span>',
                                        '</a>',
                                        '</li>'
                                    ].join('')).appendTo(subGroupCon);
                                }

                            });
                        }

                    }
                })
            }

            this.jq(el, 'mouseenter mouseleave', 'eventDropdownShow');
        },
        eventDropdownShow: function(evt, elm){
            this.groupCon.toggle();
            return false;
        }
    });
    exports.campaignButton = CampaignButton;

    // 优酷媒体分类
    var Website = app.extend(Radio, {
        init: function(config){
            config = $.extend({
                'label': LANG('媒体分类：'),
                'option': [LANG('全部'), LANG('指定媒体')],
                'tips': LANG('指定推广的广告位所属媒体类型。'),
                'auto_load': true,
                'param': null,
                'selected': null
            }, config);
            Website.master(this, null, config);
            Website.master(this, 'init', arguments);

            this.$ready = false;
            this.$data = config.selected;

            this.build();
        },
        build: function(){
            if (this.$ready){ return; }
            var c = this.config;
            var el  = this.el.css({
                'padding-top': 20,
                'padding-bottom': 0
            }).addClass('P-campaignWebSiteClass');
            this.doms = {
                con: $('<div class="M-formCountry" />').appendTo(el)
            };

            this.createAsync(
                'detail', 'country.website',
                {
                    'target': this.doms.con,
                    'param': c.param,
                    'auto_load': c.auto_load,
                    'selected': c.selected
                },
                'afterCreate'
            );
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
        },
        setParam: function(param){
            this.$.detail.setParam(param);
            return this;
        },
        load: function(){
            this.$.detail.load.apply(this.$.detail, arguments);
            return this;
        },
        setData: function(data){
            this.$data = data;
            if (!this.$ready){ return false; }

            if (data && data.length){
                this.list[1].click();
                this.$.detail.setData(data);
            }else {
                this.list[0].click();
            }
        },
        getData: function(){
            if (this.list[0].prop('checked')){
                return [];
            }else {
                var data = this.$.detail.getData();
                return data;
            }
        },
        reset: function(){
            if(this.get('detail')){
                this.get('detail').reset();
            }
            this.list[0].prop('checked');
            this.list[0].click();
        }
    });
    exports.website = Website;

});