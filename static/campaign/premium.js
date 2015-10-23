// 溢价策略模块
define(function(require, exports){
    var $ = require('jquery'),
        app = require('app'),
        view = require('view'),
        common = require('common'),
        popwin = require('popwin'),
        grid = require('grid'),
        util = require('util');

    var Premium = app.extend(view.container, {
        init: function(config, parent){
            config = $.extend({
                'class': 'M-premium',
                'target': parent
            }, config);

            Premium.master(this, null, config);
            Premium.master(this, 'init', arguments);

            this.$ready = false;
            this.$data = []; // 从popwin中选择出来的数据
            this.build();
        },
        build: function(){
            if (this.$ready){ return false; }

            // 创建布局
            var el = this.el;
            var doms = this.doms = {
                header: $('<div class="M-premiumHeader"/>').appendTo(el),
                table: $('<div class="M-premiumTable"/>').appendTo(el)
            };

            // 下拉框
            this.create('premiumDropdown', common.dropdown, {
                'width': 110,
                'target': doms.header,
                "drag": false,
                'search':false,
                'options': [
                    {Name:LANG('重定向'), _id: 'Pdmp'},
                    {Name:LANG('人群属性'), _id: 'Odmp'},
                    {Name:LANG('日程'), _id: 'Schedule'}
                ],
                'no_state': true,
                'def': LANG('新建策略')
            });

            // 说明
            this.create('tips', common.tips, {
                'target': doms.header,
                'tips': LANG('根据设定条件进行广告位溢价出价，对于同一条件设置多个溢价的，将会累加出价。')
            });

            // 表格
            this.create("grid", StrategyTable, {
                "target": doms.table,
                "operation":{
                    render: 'renderOperation',
                    cls:'M-gridOPCursor',
                    width:155
                }
            });
            doms.table.hide();

            this.$ready = true;
            if (this.$data.length){
                this.setData(this.$data);
            }
        },
        // 下拉框选项选中事件
        onOptionChange: function(ev){
            if(ev.name == 'premiumDropdown'){
                var type = ev.param.option._id;
                this.showPopwin(type);
            }
            return false;
        },
        // 显示弹框
        showPopwin: function(type){
            // 状态置为非编辑
            this.el.find('.premiumInput').attr('data-edit','');

            if(this.$[type]){
                this.$[type].show();
            }else{
                this.create(type, popwin['campaign'+type]);
            }
        },
        // 弹框保存事件
        onPopwinSave: function(ev){
            var list = this.getData();
            var obj = null;
            var data = ev.param;

            // 转换数据结构
            switch(ev.name){
                case 'Pdmp':		// 重定向
                    obj = {
                        Type: 1,
                        CharacterValue: data.filterType,
                        Character: data.result
                    }
                    break;
                case 'Odmp':		// 人群属性
                    obj = {
                        Type: 2,
                        PeopleValue: data.exclude,
                        NPeople: {
                            sex: data.gender,
                            property: data.data
                        }
                    }
                    break;
                case 'Schedule':	// 日程
                    obj = {
                        Type: 3,
                        Schedule: data
                    }
                    break;
                default:
                    return false;
            }

            // 判断是编辑还是新增
            var isEdit = util.index(list,true,'edit');
            if(isEdit!== null){
                // 保存价格
                obj.Stake = list[isEdit].Stake;
                // 编辑后的值
                list[isEdit] = obj;
                // 删除edit属性
                delete list[isEdit].edit;
            }else{
                obj.Stake = null;
                // 添加新值
                list.push(obj);
            }

            // 重新生成表格数据
            this.setData(list);
            return false;
        },
        // 渲染操作列
        renderOperation: function(i, val, data, con){
            var html = [
                '<a data-op="edit" data-id="'+data.id+'" data-type="'+data.category+'">'+LANG("编辑")+'</a>',
                '<a data-op="remove" data-id="'+data.id+'">'+LANG("删除")+'</a>'
            ].join(' | ')
            return html;
        },
        // 操作列选中事件
        onListOpClick: function(ev){
            var index = ev.param.index;
            var op = ev.param.op;

            switch (op){
                case 'edit':	// 编辑
                    this.editItem(index, ev.param.el);
                    break;
                case 'remove':	// 删除
                    this.removeItem(index);
                    break;
            }
            return false;
        },
        // 删除记录
        removeItem: function(index){
            // 获取最新数据
            var data = this.getData();
            // 删除一条记录
            data.splice(+index,1);
            // 重新生成表格数据
            this.setData(data);
            return this;
        },
        // 编辑记录
        editItem: function(index, el){
            this.$data = this.getData();

            // 状态置为编辑
            el.parent().siblings().find('.premiumInput').attr('data-edit',true);
            var data = this.$data[index];
            data.edit = 'true';

            // 显示弹框
            var trans = [null,'Pdmp','Odmp','Schedule']; //0，不处理；1，重定向-pdmp; 2，人群-Odmp; 3，日程
            var name = trans[data.Type];
            if(this.$[name]){
                this.$[name].setData(data).show();
            }else{
                var mod = this.create(name, popwin['campaign'+name]);
                mod.setData(data).show();
            }
            return this;
        },
        setData: function(data){
            this.$data = data;
            if (!this.$ready){ return this; }
            // 跟新表格数据
            var grid = this.$.grid;
            grid.setData(data);
            this.doms.table.toggle(data.length > 0);
            return this;
        },
        getData: function(){
            var data = this.$data;
            var inputs = this.$.grid.el.find('input');
            var el;
            // 更新溢价价格值
            for (var i = 0; i < data.length; i++) {
                el = $(inputs[i]);
                data[i].Stake = el.val();
                // 编辑状态
                if(el.attr('data-edit')){
                    data[i].edit = true;
                }
            }
            return data;
        },
        reset: function(){
            this.setData([]);
            return this;
        }
    });
    exports.main = Premium;

    // 溢价策略表格
    var StrategyTable = app.extend(grid.baseNoDate, {
        init: function(config){
            config = $.extend({
                'sort': null,
                'hasTab': false,
                'hasPager': false,
                'hasAmount': false,
                'hasExport': false,
                'hasSearch': false,
                'cols': [
                    {name: 'Type', text: LANG('类别'), render: 'renderName', align:'center'},
                    {name: 'Type', text: LANG('内容'), render: 'renderContent', width:580, align:'left'},
                    {name: 'Stake', text: LANG('溢价'), render: 'renderPrice', width:50}
                ]
            }, config);
            StrategyTable.master(this, null, config);
            StrategyTable.master(this, 'init', arguments);
        },
        renderName: function (index, val, data, con) {
            var trans = [LANG('无'),LANG('重定向'),LANG('人群属性'),LANG('日程')];
            return trans[val];
        },
        renderContent: function (index, val, data, con) {
            // 转换原始数据
            var dom;
            var type; // 类型：包含，排除
            var typeTrans = [LANG('包含：'),LANG('排除：')]; // 转换列表

            switch (+val){
                case 1:		// 重定向
                    type = data.CharacterValue;
                    dom = this._formatData(data.Character, 'CateName');
                    break;
                case 2:		// 人群属性
                    type = data.PeopleValue;
                    dom = this._formatData(data.NPeople.property, 'text');
                    dom = data.NPeople.sex.join(' ').replace('woman',LANG('女')).replace('man',LANG('男'))+' '+dom;
                    break;
                case 3:		// 日程
                    dom = '';
                    var sched = data.Schedule;
                    for(var i in sched){
                        if(sched[i].length){
                            var trans = [LANG('日'),LANG('一'),LANG('二'),LANG('三'),LANG('四'),LANG('五'),LANG('六')];
                            dom = dom+LANG("星期")+trans[i]+"："+ _formatTime(sched[i])+'<br/>'
                        }
                    }
                    // 只有包含关系
                    type = 0;
                    dom = dom ? dom : LANG('未选择');
                    break;
                default:
                    return '-';
            }
            var tmp = $('<div title="'+dom.replace(/<br\/>/g,'\n')+'"/>').width(con.width);
            return tmp.append($('<div class="fl">'+typeTrans[type]+'</div><div class="M-tableListWidthLimit" class="fl">'+dom+'</div>'))
        },
        // 循环获取所需数据
        _formatData: function(data, field){
            var arr = [];
            for (var i = 0; i < data.length; i++) {
                arr.push(data[i][field]);
            }
            return (arr.length ? arr.join(' ') : LANG('所有'));
        },
        renderPrice: function (i, val, data, con) {
            // 输入框
            var dom = $('<input class="premiumInput" type="text">').width(con.width);
            return $('<label>'+LANG(' 元')+'</label>').prepend(dom.val(val));
        }
    });

    // 日程数据格式化函数
    function _formatTime (data) {
        data = data.slice(); // 克隆一份副本
        var first = data.shift(), // 移出第一个值
            text = first + '~',
            last = first + 1,
            list = [], // 结果数组
            now;

        for (var i = 0; i < data.length; i++) {
            now = data[i];
            if(now != last){
                // 结束
                text += last;
                list.push(text);
                text = now + '~';
            }
            last = now +1;
        }
        text += last;
        list.push(text);

        return list.join(' ');
    }

});