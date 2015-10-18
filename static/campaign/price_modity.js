define(function(require, exports){
    var $ = require('jquery');
    var app = require('app');
    var view = require('view');
    var util = require('util');

    //表格字段编辑保持控件
    var ValueEditor = app.extend(view.container,{
        init:function(config){
            config = $.extend(true,{
                "class": 'M-formValueEditor',
                width: 120,
                height: 30,
                size: 2,
                step: 0.5,
                prefix: "￥",//字段前缀
                suffix: LANG('元'),//字段后缀
                param: null,
                data: 0,//初始值
                labelCls: 'label',
                //type: 0, // 计费类型 0.关闭，1.使用CPA自动优化，2.使用CPC自动优化 undefined.溢价
                //top_price: 0 //最高出价
                iconGroup: ['editCPM', 'editCPA', 'editCPC', 'editCOM', 'editCOM', 'editCOM'] // 计费类型按钮
            },config);
            this.$ready = false;
            this.$data = config.data;
            this.$messageTid = 0;
            this.$editingParam = null;
            ValueEditor.master(this,null,config);
            ValueEditor.master(this,'init',[config]);
            this.build();
        }
        ,build:function(){
            var el = this.el,c = this.config;
            el.width(c.width).height(c.height);
            var con = $('<div class="result"/>').appendTo(el);
            this.doms = {
                "label": $('<div />').addClass(c.labelCls).appendTo(con),
                "ctr": $('<a href="javascript:void(0)" class="G-iconFunc '+c.iconGroup[c.type===undefined?3:c.type]+' iconCtr inputLock"/>').insertBefore(con),
                "msgCon":$('<div class="msgCon"><span class="msg"/><b class="arrow"></b></div>').appendTo(el),
                "msg":null
            };
            this.doms.msg = this.doms.msgCon.find('.msg');

            this.bindEvent();
            this.$ready = true;
            this.$editMode = false;
            this.setData(this.$data);
        }
        ,bindEvent:function(){
            this.jq(this.doms.ctr,'click','eventCtrClick');
            this.jq(this.el, 'click', util.stopEvent);

        }
        ,eventCtrClick:function(ev,elm){
            var self = this;
            var c = self.config;
            var mod = self.get('input');

            if(!mod){
                mod = self.create('input', CountSelector, {
                    target: $(document.body),
                    prefix: c.prefix,
                    suffix: c.suffix,
                    addCount: c.step
                });
            }

            var cls = $(this.el).attr('class').indexOf('red')>0 ? 'red' : '';

            self.$editingParam = c.param;
            self.$editMode = true;
            mod.show({
                anchor:$(ev.target).offset()
                ,price:self.$data
                ,addClass:cls
            });

        }
        //广播事件，更新出价
        ,onUpdateValue:function (ev){
            var self = this;
            var c = self.config;
            var value = ev.param;
            var param = self.$editingParam;

            if (isNaN(value)){
                // 还原数值
                self.$.input.setData(self.$data);
                // 提示错误
                self.showMessage(LANG('价格信息错误'), 'error');
            }else if (value != self.$data){

                // 溢价的情况
                if(c.type === undefined){
                    if(-value>c.top_price){
                        self.showMessage(LANG('溢价的绝对值要小于出价'), 'error');
                        return false;
                    }
                    // 出价的情况
                }else{
                    // 出价校验
                    if(value <= 0){
                        self.showMessage(LANG('价格必须为一个正数'), 'error');
                        return false;
                    }
                }

                if(value >= 10000){
                    self.showMessage(LANG('出价不得超过9999.99元'), 'error');
                    return false;
                }

                // 发送修改资料
                self.doms.label.text(c.prefix + util.round0(value, c.size));
                self.fire('valueChange', {
                    'value': Math.round(+value*100)/100,
                    'param': param,
                    'last': self.$data
                });
                self.$data = value;
            }
            self.$editMode = false;
            ev.from.destroy();
            return false;
        }
        // 取消编辑消息
        ,onCancelValue: function(){
            this.$editMode = false;
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
            this.doms.label.text(c.prefix + util.round0(value, c.size));

            return this;
        }
        ,setType: function(type){
            var self = this;
            var c = self.config;
            var doms = self.doms;

            util.each(c.iconGroup, function(item, idx){
                doms.ctr.removeClass(item);
            });
            doms.ctr.addClass(c.iconGroup[type===undefined?3:type]);
            return self;
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
                addCount:0.5
            },config);
            // 是否已经显示
            this.isShow = 0;
            this.$timeStamp = 0;

            CountSelector.master(this,null,config);
            CountSelector.master(this,'init',[config]);
            this.$orivalue = config.value;
            this.build();
        }
        ,build:function(){
            var doms = this.doms = {},el = this.el,c = this.config;

            $('<b class="prefix"/>').text(c.prefix).appendTo(el);
            this.input = doms.input = $('<input type="text" class="countInput"/>').appendTo(el);

            var btnCon = doms.btnCon = $('<div class="btnCon"/>').appendTo(el);
            doms.add = $('<i class="addIcon countSelectorCtr" data-action="add"></i>').appendTo(btnCon);
            doms.sub = $('<i class="subIcon countSelectorCtr" data-action="sub"></i>').appendTo(btnCon);
            $('<b class="suffix"/>').text(c.suffix).appendTo(el);
            doms.ctr =  $('<a href="javascript:void(0)" data-action="edit" class="edit"/>').appendTo(el);

            this.setData(c.value);
            this.bindEvent();
        }
        ,bindEvent:function(){
            var self = this;
            self.dg(self.el,'.countSelectorCtr','click','eventClickCtr');
            self.dg(self.el,'.edit','click','eventClickCtr');
            self.jq(self.input,'mousedown', self.focus);
            self.jq(self.input, 'keydown', function(ev){
                switch (ev.keyCode){
                    // 回去保存
                    case 13:
                        self.save();
                        break;
                    //上下键可控制增减
                    case 38:
                        self.doAdd();
                        break;
                    case 40:
                        self.doSub();
                        break;
                    default:
                        return;
                }
                return false;
            });
            //阻止浏览器input默认拖动行为，chrome可在全选状态下拖动
            self.input.bind('dragstart', util.stopEvent);

            // 点击元素拦截隐藏
            self.jq(self.el,'mouseup',function (ev){
                self.$timeStamp = ev.timeStamp;
            });

            //不在focus状态，也能回车确定
            var id = self.$eventClassId = '.counter' + util.guid();
            self.jq(document, 'keydown' + id, function(ev){
                if (ev.keyCode == 13) {
                    self.save();
                    return false;
                }
            });
            self.jq(document, 'mouseup' + id, function (ev){
                if(ev.timeStamp !== self.$timeStamp){
                    self.fire('cancelValue', function(){
                        self.destroy();
                    });
                }
            });
        }
        ,beforeDestroy: function(){
            $(document).unbind('keydown' + this.$eventClassId)
                .unbind('mouseup' + this.$eventClassId);
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
                case "edit":
                    this.save();
            }
            evt.preventDefault();
            return false;
        }
        ,focus: function(){
            this.input.focus();
        }
        ,select: function(){
            this.input.select();
        }
        ,setData:function(data){
            var value = +data;
            if(!isNaN(value)){
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
        //点击nike更新数据
        ,save:function (){
            var data = this.getData();
            //广播事件
            this.fire('updateValue', data);
        }
        ,show:function (param){

            if(!this.isShow){
                this.isShow = 1;
                //修正位置
                $(this.el).css({
                    left:param.anchor.left-27,
                    top:param.anchor.top-14
                });
                //变红色文字
                if(param.addClass){
                    $(this.el).addClass(param.addClass);
                }
                this.setData(param.price);

                CountSelector.master(this,"show",[]);
                this.focus();
                this.select();
            }

        }
    })
    exports.countSelector = CountSelector;
});