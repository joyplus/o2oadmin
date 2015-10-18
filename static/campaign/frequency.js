define(function(require,exports){
    var $ = require("jquery")
        ,app = require("app")
        ,view = require("view")
        ,common = require("common")
        ,form = require("form");

    // 频次控制模块
    var FrequencyControl = app.extend(view.container, {
        init: function(config){
            config = $.extend(true, {
                'class': 'M-frequencyControl'
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
                //if(i>1){
                typeOptions.push({Name: LANG('选择对象'), _id:null});
                //}
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
                //if(i>1){
                freqOptions.push({Name: LANG('选择单位'), _id:null});
                //}
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
            // 注意，这里跟新建活动中的Frequency模块的数据结构略有不同，
            // 这里返回的数据需要为一个对象，里面包含FrequencyFilters数组
            var data = this.$data = {
                FrequencyFilters: []
            };

            var i;
            for (i = 1; i <= 2; i++) {
                var row = {};
                // 类型选择
                row.Type = this.get('freqType' + i).getData();
                // 频率选择
                row.Period = this.get('freqInterval' + i).getData();
                // 频率
                row.Frequency = this.get('freqInput' + i).getData();

                data.FrequencyFilters.push(row);
            }

            return data;
        },
        setData: function(data) {
            // 这里需要的data格式与getData中保持一致
            this.$data = data;
            if (!data) {
                return this;
            }

            var FrequencyFilters = data.FrequencyFilters;
            if (FrequencyFilters && FrequencyFilters.length > 0) {
                var len = FrequencyFilters.length,
                    i;

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
            var i;
            for (i = 1; i <= 2; i++) {
                // 类型选择
                this.get('freqType' + i).reset();
                // 频率选择
                this.get('freqInterval' + i).reset();
                // 频率
                this.get('freqInput' + i).setData('');
            }
        }
    });
    exports.base = FrequencyControl;

})