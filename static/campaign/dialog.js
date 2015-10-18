define(function(require, exports){
    var $ = require('jquery');
    var view = require('view');
    var util = require('util');

    var maskConfig = {
        "class":"M-mask"
    }

    function Option(config, parent, id){
        this.config = $.extend(true, {
            // 样色名配置
            'class': 'M-dialogOption',
            'bodyClass': 'M-dialogOptionBody',
            'footClass': 'M-dialogOptionFoot',
            // 位置尺寸配置
            'position': {},
            // 窗口外点击隐藏窗口
            'autoHide': true,
            // 按钮配置
            // 支持按钮类型'all', 'invert', 'ok', 'cancel'
            'buttons': [],
            'ok': {
                'type': 'button',
                'text': _T('确定'),
                'class': 'M-dialogOptionOk'
            },
            'cancel': {
                'type': 'button',
                'text': _T('取消'),
                'class': 'M-dialogOptionCancel'
            },
            'all': {
                'type': 'checkbox',
                'text': _T('全选'),
                'class': 'M-dialogOptionAll'
            },
            'invert': {
                'type': 'checkbox',
                'text': _T('反选'),
                'class': 'M-dialogOptionInvert'
            },
            'empty': {
                'type': 'button',
                'text': _T('清空'),
                'class': 'M-dialogOptionEmpty'
            },
            'default': {
                'type': 'button',
                'text': _T('默认'),
                'class': 'M-dialogOptionDefault'
            },
            'mask':0
        }, config || {});

        Option.master(this, null, this.config);

        // 创建必要的DOM实例
        var cfg = this.config;
        this.body = $('<div/>').attr('class', cfg.bodyClass).appendTo(this.el);
        if (cfg.buttons.length > 0){
            this.foot = $('<div/>').attr('class', cfg.footClass).appendTo(this.el);
            var doms = this.doms = {};
            for (var i=0; i<cfg.buttons.length; i++){
                var name = cfg.buttons[i];
                if (!cfg.hasOwnProperty(name)) {continue;}
                var btn = doms[name] = $('<input/>').attr(cfg[name]).attr('text', null).appendTo(this.foot);
                btn.attr('data-name', name).bind('click', this, this.clickButton);

                if (cfg[name].type != 'button'){
                    var id_name = 'label'+id.guid+'_'+name;
                    btn.attr({'id':id_name, 'class':null});
                    btn.wrap('<div/>').parent().addClass(cfg[name]['class']);
                    btn.after('<label for="'+id_name+'"></label>');
                }
            }
            this.foot.append('<em/>');
        }

        this.el.hide().bind('click', this.blockMouseEvent);
        this.isShow = false;
        this.mask = null;
    }
    extend(Option, view.container, {
        render: function(){
            var doms = this.doms;
            var cfg = this.config;
            for (var name in doms){
                if (doms.hasOwnProperty(name) && cfg[name]){
                    if (cfg[name].type == 'button'){
                        doms[name].val(LANG(cfg[name].text));
                    }else {
                        doms[name].next().text(LANG(cfg[name].text));
                    }
                }
            }
            this.el.css(this.config.position);
            Option.master(this, 'render');
        },
        toggle: function(){
            if (this.isShow){
                this.hide();
            }else {
                this.show();
            }
        },
        show: function(){
            if (this.isShow) {return;}
            this.isShow = true;
            Option.master(this, 'show');
            if(this.config.mask){
                this.toggleMask();
            }
        },
        toggleMask:function(){
            if(!this.mask){
                this.mask = this.create(
                    "mask"
                    ,view.container
                    ,maskConfig
                );
            }
            this.mask.el.css("height",$(document).height()+"px");
            this.mask[
            this.isShow && "show" || "hide"
                ]();
        },
        setMask:function(config){
            if(this.mask){
                config = config || {};
                config.height = $(document).height()+"px";
                this.mask.el.css(config);
            }
        },
        setData: function(sels){
            var inputs = this.body.find(':checkbox');

            //根据默认设置
            if (sels){
                inputs.each(function(id, elm){
                    elm.checked = (util.index(sels, elm.value) !== null);
                });
            }else {
                inputs.prop('checked', false);
            }
            return this;
        },
        hide: function(){
            //将下面3个选框都清除了
            this.foot.find('input[type="checkbox"]').prop('checked', false);
            this.isShow = false;
            Option.master(this, 'hide');
            if(this.config.mask){
                this.toggleMask();
            }
        },
        blockMouseEvent: function(evt){
            evt.stopPropagation();
        },
        autoHideEvent: function(evt){
            evt.data.hide();
        },
        clickButton: function(evt){
            var me = evt.data;
            var name = $(this).attr('data-name');
            me.fire(name, this);
        },
        onOk: function(evt){
            this.hide();
            return false;
        },
        onCancel: function(evt){
            this.hide();
            return false;
        },
        onAll: function(evt){
            var check = $(evt.param).prop('checked');
            //先将下面3个都清除了
            this.foot.find('input[type="checkbox"]').prop('checked', false);
            //单独设置当前的
            $(evt.param).prop('checked', check);

            var list = this.body.find('input[type="checkbox"]');
            list.prop('checked', check);
            return false;
        },
        onInvert: function(evt){
            var check = $(evt.param).prop('checked');
            //先将下面3个都清除了
            this.foot.find('input[type="checkbox"]').prop('checked', false);
            //单独设置当前的
            $(evt.param).prop('checked', check);

            var list = this.body.find(':checkbox');
            list.each(function(id, elm){
                elm.checked = !elm.checked;
            });
            return false;
        },
        onDefault: function(evt){
            //先将下面3个都清除了
            this.foot.find(':checkbox').prop('checked', false);

            //获取列表配置的，如果没有重新配置，则从全局配置config中抓取
            var sels = this.config.defSelected;
            var inputs = this.body.find(':checkbox').prop('checked', false);
            inputs.each(function(id, elm){
                if (util.find(sels, elm.value)){
                    elm.checked = true;
                }
            });
            return false;
        },
        onEmpty: function(evt){
            var list = this.body.find('input[type="checkbox"]');
            list.prop('checked', false);
        },
        onSwitchLanguage: function(){
            this.render();
        }
    });
    exports.option = Option;
});