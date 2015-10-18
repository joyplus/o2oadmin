define(function(require,exports){
    var $ = require("jquery")
        ,app = require("app")
        ,view = require("view")
        ,common = require("common")
        ,form = require("form");

    var PDMP = app.extend(view.container, {
        init: function(config, parent){
            config = $.extend({
                'class': 'P-campaignPDMP',
                'target': parent,
                'label': LANG('人群选择'),
                'url': '/rest/listvisitorcategorizeinfo',
                'param': {
                    'runstatus': 1
                },
                'data': null,
                'list': null,
                "width":300
            }, config);

            PDMP.master(this, null, config);
            PDMP.master(this, 'init', arguments);

            this.$ready = false;
            this.$data = config.data || null;
            this.$list = config.list || null;

            if (config.url && !config.list){
                this.load();
            }

            this.build();
        },
        build: function(){
            var c = this.config;
            var con = $('<div/>').addClass(c['class']).appendTo(this.el);
            this.create('layout', form.item, {
                'el': this.el,
                'label': this.config.label
            });

            this.create('list', common.dropdown, {
                'target': con,
                'all': {VisitorCateId:0, Name:'所有人群'},
                'width': c.width,
                'key': 'VisitorCateId',
                'option_render': this.renderOption,
                'name': 'Name'
            });

            this.$ready = true;
            if (this.$data && this.$list){
                this.setList(this.$list);
                this.setData(this.$data);
            }
        },
        renderOption: function(id, opt, dom){
            if (id === null){
                return opt.Name;
            }
            return LANG('%1 (%2人)', opt.Name ,opt.Visitors);
        },
        onReset: function(){
            var list = null;
            // 清空变量
            this.$data = null;

            if (this.config.url){
                this.$list = null;
                this.load();
                list = [];
            }
            // 清空选择列表
            this.$.list.setData(null, list);
        },
        getData: function(){
            if (!this.$ready){ return null; }
            var cat = this.$.list.getData(true);
            if (cat){
                // 组合数据
                if (cat.VisitorCateId === 0){
                    this.$data = [];
                }else {
                    this.$data = [{
                        Type: 0,
                        VisitorCateId: cat.VisitorCateId,
                        OwnerType: cat.OwnerType,
                        OwnerId: cat.OwnerId,
                        CateName: cat.Name,
                        Comparison: '>=',
                        Value: 1,
                        PrevLogical: 'and'
                    }];
                }
            }

            return this.$data;
        },
        setData: function(data){
            this.$data = data;
            if (!data || !this.$ready){ return; }

            // 转换数据格式
            var id = data[0] && data[0].VisitorCateId || 0;
            this.$.list.setData(id);
        },
        setList: function(list){
            this.$list = list;
            if (!list || !this.$ready){ return; }

            // 设置选项列表数据
            this.$.list.setData(list);
        },
        load: function(){
            var c = this.config;
            app.data.get(c.url, c.param, this);
        },
        onData: function(err, data){
            if (err){
                app.error(err);
                return;
            }
            this.setList(data.items);
        },
        onEvent: function(){
            return false;
        }
    });
    exports.base = PDMP;
})