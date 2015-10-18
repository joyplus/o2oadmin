define(function(require, exports){
    var $ = require('jquery'),
        app = require('app'),
        util = require('util'),
        common = require('common');

    var listCache = null;

    var Base = app.extend(common.subLevelCheckbox, {
        init: function(config){
            config = $.extend({},config);
            Base.master(this,'init',[config]);
            if (listCache){
                this.setList(listCache);

            }else {
                app.data.get('/rest/listcountry', this);
            }

            // 添加五个辅助按钮
            var buttonsDiv = $('<div class="M-commonSLCButtons"></div>');
            this.el.prepend(buttonsDiv);
            var buttons = [
                {'class': 'selectFirstLine', 'onFunc': 'eventSelectFirstLine', 'text': LANG('一线城市')},
                {'class': 'selectSecondLine', 'onFunc': 'eventSelectSecondLine', 'text': LANG('二线城市')},
                {'class': 'selectThirdLine', 'onFunc': 'eventSelectThirdLine', 'text': LANG('三线城市')},
                {'class': 'selectInverse', 'onFunc': 'eventSelectInverse', 'text': LANG('反选')},
                {'class': 'clearAll', 'onFunc': 'eventClearAll', 'text': LANG('清空')}
            ]
            var i, len
            for(i = 0, len = buttons.length; i < len; i++) {
                var val = buttons[i];
                // 添加辅助按钮标签
                $('<a class="' + val['class'] + '">' + val['text']  + '</a>').appendTo(buttonsDiv);
                // 添加事件
                this.dg(this.el, '.' + val['class'], 'click', val['onFunc']);
            }

            // 特殊城市数据
            this.$cityData = {
                // 一线城市
                'firstLine': ["10761_10782_0", "10761_10783_0", "10761_10789_47667", "10761_10789_16496", "10761_10787_0"],
                // 二线城市
                'secondLine': ["10761_10787_69468", "10761_10765_37634", "10761_10773_104007", "10761_10779_103995",
                    "10761_12768_104038", "10761_10786_33489", "10761_11573_36785", "10761_10763_68433", "10761_10785_33494",
                    "10761_10779_104009", "10761_10763_54096", "10761_10785_59532", "10761_10769_104006", "10761_10766_25160",
                    "10761_10768_104085", "10761_10770_104026", "10761_10772_104044", "10761_10768_104084", "10761_10774_104317",
                    "10761_10788_104002", "10761_10776_104058", "10761_10765_33383", "10761_10765_104040", "10761_10764_104083",
                    "10761_10778_104137", "10761_10777_104110", "10761_10762_104129", "10761_10784_104063", "10761_10771_232179",
                    "10761_10780_104622", "10761_10789_57963", "10761_10789_59143", "10761_10771_104301", "10761_10785_104047",
                    "10761_10768_104130", "10761_10780_234748"],
                // 三线城市
                'thirdLine': ["10761_10781_104211","10761_10767_104339","10761_10770_104113","10761_10765_104089",
                    "10761_10765_104055","10761_10765_104013","10761_10785_104135","10761_10785_104191","10761_10763_104123",
                    "10761_10763_104116","10761_10763_333580","10761_10769_239044","10761_10779_104062","10761_10789_232153",
                    "10761_10789_104157","10761_10789_104057","10761_10766_104060","10761_10777_104069","10761_10775_104132",
                    "10761_10771_104092","10761_10771_104250","10761_10771_104190","10761_10771_105534","10761_10785_104079",
                    "10761_10785_104204","10761_10785_104374","10761_10785_104356","10761_10785_104303","10761_10785_104308",
                    "10761_10785_104076","10761_10763_104121","10761_10763_104118","10761_10763_104117","10761_10765_104309",
                    "10761_10765_104039","10761_10765_104144","10761_10765_104046","10761_10777_104056","10761_10789_104221",
                    "10761_10789_104068","10761_10789_104220","10761_10789_104146","10761_10772_104136","10761_10772_104246",
                    "10761_10772_104203","10761_12768_104532","10761_10773_104148","10761_10770_104042","10761_10770_104271",
                    "10761_10770_104273","10761_10764_104143","10761_10764_104294","10761_10762_104128","10761_10786_24848",
                    "10761_10769_104259","10761_10769_104257","10761_10779_104410","10761_10779_104073","10761_10779_104507",
                    "10761_10779_104074","10761_10779_104077","10761_10779_104075","10761_10771_104344","10761_10771_104254",
                    "10761_10771_104609","10761_10784_104516","10761_12768_104535","10761_10776_253019","10761_10774_104235",
                    "10761_10770_104195","10761_10770_104253","10761_10770_104070","10761_10770_104091","10761_10770_104109",
                    "10761_10785_104358","10761_10785_104142","10761_10785_104261","10761_10762_104156","10761_10762_104180",
                    "10761_10762_104335","10761_10765_104188","10761_10765_234026","10761_10763_106316","10761_10763_104283",
                    "10761_10773_104487","10761_10762_104177","10761_10764_104641","10761_10764_104587","10761_10772_104081",
                    "10761_10772_104193","10761_10772_104262","10761_10768_104119","10761_10789_104403","10761_10789_333558",
                    "10761_10789_104175","10761_10789_104214","10761_10777_104342","10761_10777_105302","10761_10786_104408",
                    "10761_10786_104371","10761_10778_67317","10761_10788_104524"]
            }
        },
        onData: function(err, data){
            if (err){
                app.alert(err.message);
                return false;
            }
            listCache = data;
            this.setList(listCache);

            // 所有可选择的城市列表，用于反选
            var selectableCitys = [];
            // 此方法用于获得所有具体城市（不包括省份、地区）的列表
            // 参数为城市数据的顶层对象
            // 注意方法内会递归调用
            function findCity(citys) {
                var city = null;
                for(var i = 0, len = citys.length; i < len; i++) {
                    city = citys[i];
                    if (city.child && city.child.length > 0) {
                        findCity(city.child);
                    } else {
                        // 没有child或child长度为零，该选项为可选择
                        selectableCitys.push(city.value)
                    }
                }
            }
            findCity(listCache);
            this.$selectableCitys = selectableCitys;

        },
        // 选择一线城市
        eventSelectFirstLine: function(ev, elm) {
            var newSelected = this._merageArray(this.$cityData.firstLine, this.getSelectedSubCity());
            this.setData(newSelected);
        },
        // 选择二线城市
        eventSelectSecondLine: function(ev, elm) {
            var newSelected = this._merageArray(this.$cityData.secondLine, this.getSelectedSubCity());
            this.setData(newSelected);
        },
        // 选择三线城市
        eventSelectThirdLine: function(ev, elm) {
            var newSelected = this._merageArray(this.$cityData.thirdLine, this.getSelectedSubCity());
            this.setData(newSelected);
        },
        // 反选
        eventSelectInverse: function(ev, elm) {
            // 得到没选择的城市
            var inverseCitys = _complementArray(this.$selectableCitys, this.getSelectedSubCity())
            this.setData(inverseCitys);
        },
        // 清空选择
        eventClearAll: function(ev, elm) {
            this.setData([]);
        },
        // 取得已经选择的城市（不包括省份和地区，包括其他）
        getSelectedSubCity: function() {
            var self = this;
            this.$selectedSubCity = [];
            this.doms.body.find('input:checkbox[checked="checked"]').each(function() {
                var el = $(this);
                var val = el.val();
                // “其他”选项使用的是数字0而非字符串，需先转换
                if (val === "0") {
                    val = 0;
                }
                if (self.$selectableCitys.indexOf(val) >= 0) {
                    self.$selectedSubCity.push(val)
                }
            })
            return this.$selectedSubCity;
        },
        // 此方法用于合并两个数组，但不添加重复的元素
        // 考虑将该方法添加到util
        _merageArray: function(arr1, arr2) {
            var newArr = arr1.slice(0);
            arr2.filter(function(e) {
                if (arr1.indexOf(e) < 0) {
                    newArr.push(e)
                }
            })
            return newArr;
        }
    });
    exports.base = Base;

    // 选择IP段
    var IpSections = app.extend(common.subLevelCheckbox, {
        init: function(config){
            config = $.extend({},config);
            IpSections.master(this,'init',[config]);
            var doms = this.doms;
            doms.ip = [];
            $('<div class="M-commonSLCIPSectionsTitle">').text(LANG('请输入IP地址范围，每一个范围必须包含起始地址和结束地址，最多填写3段范围')).appendTo(doms.head.text(''));
            var IPSectionsCon = $('<div class="M-commonSLCIPSectionsCon">').appendTo(doms.body);
            for(var i=0; i<3; i++){
                doms.ip.push($([
                    '<div class="M-commonSLCIPSectionsConItem">',
                    '<label>',
                    LANG('起始地址'),
                    '<input data-type="Start" placeholder="0 . 0 . 0 . 0"/>',
                    '</label>',
                    '<span>-</span>',
                    '<label>',
                    LANG('结束地址'),
                    '<input data-type="End" placeholder="0 . 0 . 0 . 0"/>',
                    '</label>',
                    '</div>'
                ].join('')).appendTo(IPSectionsCon));
            }
        },
        setData: function(data){
            var doms = this.doms;
            var index = 0;
            util.each(data, function(val){
                if(val){
                    doms.ip[index].find('input').eq(0).val(val.Start);
                    doms.ip[index].find('input').eq(1).val(val.End);
                    if (++index >= 3){
                        return false;
                    }
                }
            });
        },
        getData: function(){
            var doms = this.doms;
            var data = [];
            $.each(doms.ip, function(idx,item){
                var start = item.find('input').eq(0).val();
                var end = item.find('input').eq(1).val();
                if(start !== '' || end !== ''){
                    data.push({
                        'Start': start,
                        'End': end
                    });
                }
            });
            return data;
        },
        reset: function(){
            var doms = this.doms;
            $.each(doms.ip, function(idx,item){
                item.find('input').eq(0).val('');
                item.find('input').eq(1).val('');
            });
        }
    });
    exports.ipSections = IpSections;

    /**
     * 客户端
     */
    var Client = app.extend(common.subLevelCheckbox, {
        init: function(config, parent){
            config = $.extend({
                'class': 'M-commonSLC M-countryClient'
            }, config);
            Client.master(this, 'init', [config, parent]);

            this.initList();

            // 反选按钮与清空按钮
            var buttonsDiv = $('<div class="M-commonSLCButtons"></div>')
            $('<a class="selectInverse">反选</a>').appendTo(buttonsDiv);
            this.dg(buttonsDiv, '.selectInverse', 'click', 'eventSelectInverse');
            $('<a class="clearAll">清空</a>').appendTo(buttonsDiv);
            this.dg(buttonsDiv, '.clearAll', 'click', 'eventClearAll');

            this.el.prepend(buttonsDiv);
        },
        initList: function(){
            // 整理数据
            var data = [];
            data.push(
                _convertArrayGroup(LANG('操作系统'), 'os', app.config("client/os"))
            );
            data.push(
                _convertArrayGroup(LANG('浏览器'), 'bs', app.config("client/browser"))
            );
            this.setList([{name: LANG('全选'), child: data}]);
        },
        eventSelectInverse: function() {
            // 定义反选的数据data
            var inverseData = {};

            // 构建data的内容
            var inverseOsArray = this._getInverseArray('os');
            if (inverseOsArray.length > 0) {
                inverseData['os'] = inverseOsArray;
            }
            var inverseBrowserArray = this._getInverseArray('browser');
            if (inverseBrowserArray.length > 0) {
                inverseData['bs'] = inverseBrowserArray;
            }

            this.setData(inverseData);
        },
        // 该方法能得到某一项(os/browser)的反选数组
        // 参数为该项的名字：os/browser
        // 返回对应的反选数组，注意在getData中空数组指代全选，而这里空数组则指代空
        _getInverseArray: function(name) {
            var wholeArray = [];
            util.each(app.config("client/" + name), function(val, index) {
                for (var key in val.list) {
                    wholeArray.push(+key);
                }
            });
            var inverseArray;
            // 。。。因为browser在data里使用缩写bs，所以browser的情况需先将name改为bs
            name = name == 'browser' ? 'bs' : name;
            var selectedArray = this.getData()[name];
            if (!selectedArray) {
                // 没有选择的情况
                inverseArray = wholeArray.slice(0);
            } else if (selectedArray.length === 0) {
                // 长度为0，即全选的情况
                inverseArray = [];
            } else {
                // 取补集
                inverseArray = _complementArray(wholeArray, selectedArray);
            }

            return inverseArray;
        },
        eventClearAll: function() {
            this.setData({});
        },
        /**
         * 设置选中的项目
         * @param {object} data 选中的项目ID值
         * @return {None} 无返回
         */
        setData: function(data){
            var sels = [];
            util.each(data, function(list, type){
                if (!list || !list.length){
                    sels.push(type);
                }else {
                    util.each(list, function(id){
                        sels.push(type + ':' + id);
                    });
                }
            });
            Client.master(this,"setData",[sels]);
        },

        /**
         * 获取选中的区域数据
         * @return {Array} 返回选中的区域ID数组
         */
        getData: function(){
            //执行父类的getData
            var ret = Client.master(this,"getData");

            var data={}, all={};
            util.each(ret, function(id){
                var val = id.split(':');
                var type = val.shift();
                if (val.length === 0){
                    if (type){
                        all[type] = true;
                    }
                }else {
                    if (val.length === 1){
                        val = isNaN(+val[0]) ? val[0] : +val[0];
                    }else {
                        val = val.join(':');
                    }
                    if (!data[type]){
                        data[type] = [val];
                    }else {
                        data[type].push(val);
                    }
                }
            });
            util.each(data, function(list, type){
                if (all[type]){
                    return [];
                }
            });
            return data;
        },

        eventHoverItem: function(){
            // 重置鼠标回调事件
        }
    });
    exports.client = Client;


    /**
     * 移动设备
     */
    var MobileDevice = app.extend(common.subLevelCheckbox, {
        init: function(config, parent){
            config = $.extend({
                'class': 'M-commonSLC M-countryClient'
            }, config);
            MobileDevice.master(this, 'init', [config, parent]);

            this.initList();

            // 反选按钮与清空按钮
            var buttonsDiv = $('<div class="M-commonSLCButtons"></div>')
            $('<a class="selectInverse">反选</a>').appendTo(buttonsDiv);
            this.dg(buttonsDiv, '.selectInverse', 'click', 'eventSelectInverse');
            $('<a class="clearAll">清空</a>').appendTo(buttonsDiv);
            this.dg(buttonsDiv, '.clearAll', 'click', 'eventClearAll');

            this.el.prepend(buttonsDiv);

            //this.el.find('.M-commonSLCHead').show();
            this.el.find('.M-commonSLCZoneHead').hide();
            this.el.find('.M-commonSLCZoneBody').css('margin-left',0);
        },
        initList: function(){
            // 整理数据
            var data = [];
            data.push(
                _convertArrayGroup(LANG('设备型号'), 'deviceModel', app.config("moblieClientRTB/deviceModel"))
            );
            // data.push(
            // 	_convertArrayGroup(LANG('设备品牌'), 'deviceBrand', app.config("moblieClientRTB/deviceBrand"))
            // );
            this.setList([{name: LANG('全选'), child: data}]);
        },
        eventSelectInverse: function() {
            // 定义反选的数据data
            var inverseData = {};

            // 构建data的内容
            var inverseOsArray = this._getInverseArray('deviceModel');
            if (inverseOsArray.length > 0) {
                inverseData['deviceModel'] = inverseOsArray;
            }

            this.setData(inverseData);
        },
        // 该方法能得到某一项(os/browser)的反选数组
        // 参数为该项的名字：os/browser
        // 返回对应的反选数组，注意在getData中空数组指代全选，而这里空数组则指代空
        _getInverseArray: function(name) {
            var wholeArray = [];
            util.each(app.config("moblieClientRTB/" + name), function(val, index) {
                for (var key in val.list) {
                    wholeArray.push(key);
                }
            });
            var inverseArray;
            // 。。。因为browser在data里使用缩写bs，所以browser的情况需先将name改为bs
            name = name == 'deviceModel' ? 'deviceModel' : name;
            var selectedArray = this.getData()[name];
            if (!selectedArray) {
                // 没有选择的情况
                inverseArray = wholeArray.slice(0);
            } else if (selectedArray.length === 0) {
                // 长度为0，即全选的情况
                inverseArray = [];
            } else {
                // 取补集
                inverseArray = _complementArray(wholeArray, selectedArray);
            }

            return inverseArray;
        },
        eventClearAll: function() {
            this.setData({});
        },
        /**
         * 设置选中的项目
         * @param {object} data 选中的项目ID值
         * @return {None} 无返回
         */
        setData: function(data){
            var sels = [];
            util.each(data, function(list, type){
                if (!list || !list.length){
                    sels.push(type);
                }else {
                    util.each(list, function(id){
                        sels.push(type + ':' + id);
                    });
                }
            });
            MobileDevice.master(this,"setData",[sels]);
        },

        /**
         * 获取选中的区域数据
         * @return {Array} 返回选中的区域ID数组
         */
        getData: function(){
            //执行父类的getData
            var ret = MobileDevice.master(this,"getData");

            var data={}, all={};
            util.each(ret, function(id){
                var val = id.split(':');
                var type = val.shift();
                if (val.length === 0){
                    if (type){
                        all[type] = true;
                    }
                }else {
                    if (val.length === 1){
                        val = isNaN(+val[0]) ? val[0] : +val[0];
                    }else {
                        val = val.join(':');
                    }
                    if (!data[type]){
                        data[type] = [val];
                    }else {
                        data[type].push(val);
                    }
                }
            });
            // util.each(data, function(list, type){
            // 	if (all[type]){
            // 		return [];
            // 	}
            // });
            return data;
        },

        eventHoverItem: function(){
            // 重置鼠标回调事件
        }
    });
    exports.mobileDevice = MobileDevice;

    // 移动广告
    var MobileClient = app.extend(Client, {
        init: function(config){
            config = $.extend({
                'class': 'M-commonSLC M-countryClient M-countryClientHideLevel',
                'configType': 'os'
            }, config);

            // 跨过父层的init,因为不创建反选清空按钮
            Client.master(this, 'init', [config, parent]);

            this.initList();

            // // 反选按钮与清空按钮
            // var buttonsDiv = $('<div class="M-commonSLCButtons"></div>')
            // $('<a class="selectInverse">反选</a>').appendTo(buttonsDiv);
            // this.dg(buttonsDiv, '.selectInverse', 'click', 'eventSelectInverse');
            // $('<a class="clearAll">清空</a>').appendTo(buttonsDiv);
            // this.dg(buttonsDiv, '.clearAll', 'click', 'eventClearAll');

            // this.el.prepend(buttonsDiv);

        },
        initList: function(){
            var c = this.config;
            // 整理数据
            var data = [];

            data.push(
                _convertArrayGroup(c.configType, c.configType, app.config("moblieClientRTB/"+c.configType))
            );
            this.setList([{name: LANG('全选'), child: data}]);
        },
        getData: function(){
            //执行父类的getData
            var ret = Client.master(this,"getData");

            var data={}, all={};
            util.each(ret, function(id){
                var val = id.split(':');
                var type = val.shift();
                if (val.length === 0){
                    if (type){
                        all[type] = true;
                    }
                }else {
                    if (val.length === 1){
                        val = isNaN(+val[0]) ? val[0] : +val[0];
                    }else {
                        val = val.join(':');
                    }
                    if (!data[type]){
                        data[type] = [val];
                    }else {
                        data[type].push(val);
                    }
                }
            });
            return data;
        }
    });
    exports.mobileClient = MobileClient;

    /**
     * 客户端
     */
    var People = app.extend(Client, {
        initList: function(){
            // 整理数据
            var data = [
                _convertArray('性别', 'sex', ['男性','女性']),
                _convertArray('年龄', 'age', ['10-19岁','20-29岁','30-39岁','40-49岁','50-59岁','60岁以上']),
                _convertArray('职业', 'job', ['IT','教育/学生','电信/网络','服务','金融/房产','建筑','传媒/娱乐','政府/公共服务','零售','旅游/交通']),
                _convertArray('学历', 'edu', ['本科及以上','大专','高中','初中','小学']),
                _convertArray('收入', 'inc', ['3,000以下','3,0000-5,000','5,000-10,000','10,000-20,000','20,000-50,000','50,000以上'])
            ];
            this.setList([{name: LANG('全选'), child: data}]);
        }
    });
    exports.people = People;

    var Website = app.extend(
        common.subLevelCheckbox
        ,{
            init: function(config){
                config = $.extend(
                    {
                        "key":"children"
                        ,"valueKey":"_id"
                        ,"nameKey":"Name"
                        ,"silence":false
                        ,'auto_load': true
                        ,'getSubs': true
                        ,'url': '/rest/listsiteclass'
                        ,'param': {
                        'GetLayerSiteClass': 1,
                        'AdxId': 0
                    }
                    }
                    ,config
                );
                Website.master(this,"init",[config]);

                if (config.auto_load){
                    this.load();
                }
            }
            ,setParam: function(param){
                var c = this.config;
                this.$param = param;
                c.param = $.extend(c.param, param);
                switch (true){
                    case util.exist(app.config('exchange_group/youku'), c.param.AdxId):
                        c.url = '/rest/listpageclass';
                        break;
                    case util.exist(app.config('exchange_group/dm'), c.param.AdxId):
                        c.url = BASE('data/dm_siteclass.json');
                        break;
                    default:
                        c.url = '/rest/listsiteclass';
                }
                return this;
            }
            ,load: function(cb){
                var c = this.config;
                app.data.get(c.url, c.param, this, 'onData', cb);
                return this;
            }
            ,onData: function(err, data, cb){
                var c = this.config;
                c.param = $.extend(c.param, this.$param);
                if (err){
                    app.error(err);
                }else {
                    if(util.exist(app.config('exchange_group/youku'), c.param.AdxId)) {
                        this.setList(data);
                    }
                    else {
                        this.setList([{Name:LANG('全部'), _id:0, children:data}]);
                    }
                }
                if (cb){
                    cb();
                }
            }
            ,getData: function(detail){
                var list = Website.master(this,"getData");
                if(detail){
                    return {'list': list};
                }else {
                    return list;
                }
            }
        }
    );
    exports.website = Website;

    // 易传媒敏感词分类
    var SensitiveClass = app.extend(
        common.subLevelCheckbox
        ,{
            init: function(config){
                config = $.extend(
                    {
                        'key':'ChildData'
                        ,'valueKey':'CategoryId'
                        ,'nameKey':'Name'
                        ,'silence':false
                        ,'auto_load': true
                        ,'getSubs': true
                        ,'url': '/rest/listadcategory'
                        ,'param': null
                        ,'class': 'M-commonSLC M-commonSLCSensitiveClass'
                    }
                    ,config
                );
                SensitiveClass.master(this,"init",[config]);

                this.$item = $('<div class="M-formItem">').appendTo(this.config.target);

                $('<label class="M-formItemLabel"/>').text(this.config.label).appendTo(this.$item);
                this.el.css({
                    'display': 'inline-block',
                    'vertical-align': 'top'
                }).appendTo(this.$item);

                if (config.auto_load){
                    this.load();
                }
            }
            ,setParam: function(param){
                var c = this.config;
                c.param = $.extend(c.param, param);
                return this;
            }
            ,load: function(cb){
                var c = this.config;
                app.data.get(c.url, c.param, this, 'onData', cb);
                return this;
            }
            ,onData: function(err, data, cb){
                var arr = [{Name:LANG('全部'), CategoryId:0, ChildData:data.items}]
                if (err){
                    app.error(err);
                }else {
                    this.setList([{Name:LANG('全部'), CategoryId:0, ChildData:arr}]);
                }
                if (cb){
                    cb();
                }
            }
            ,getData: function(){
                SensitiveClass.master(this,"getData",arguments);
                var merge = !this.config.getSubs;
                var ret = [];
                // 获取项目数据
                var dom, input, total, check, i, body = this.doms.body;
                var doms = body.find('.M-commonSLCItem');
                for (i=0; i<doms.length; i++){
                    dom = doms.eq(i);
                    input = dom.children('input');
                    if (input.length){
                        if (input.prop('checked') && input.val() !== ''){
                            ret.push(input.val());
                        }
                    }else {
                        total = dom.find('.M-commonSLCSub input');
                        check = total.filter(':checked');
                        input = dom.find('.M-commonSLCItemHead > input');
                        if (total.length > 0 && check.length && input.val() !== ''){
                            ret.push(input.val());
                            if (merge){ check = false; }
                        }
                        if (check){
                            for (var j=0; j<check.length; j++){
                                input = check.eq(j);
                                if (input.val() !== ''){
                                    ret.push(input.val());
                                }
                            }
                        }
                    }
                }
                // 获取分区数据
                doms = body.find('.M-commonSLCZoneHead > input[value!=""]');
                for (i=0; i<doms.length; i++){
                    input = doms.eq(i);
                    if (input.prop('checked')){
                        ret.push(input.val());
                    }
                }

                this.$selected = ret;
                return ret;
            }
            ,setData: function(sels){
                SensitiveClass.master(this,"setData",arguments);
                this.reset();
                if (!sels || !sels.length){
                    return;
                }
                this.$selected = sels;

                var i,map = {};
                for (i=sels.length-1; i>=0; i--){
                    map[sels[i]] = 1;
                }

                var dom, body = this.doms.body;
                var doms = body.find('input[value!=""]');
                for (i=doms.length-1; i>=0; i--){
                    dom = doms.eq(i);
                    if (map[dom.val()]){
                        dom.prop('checked', true);
                    }
                }

                // 更新项目状态
                var total, check, input;
                doms = body.find('.M-commonSLCSub');
                for (i=0; i<doms.length; i++){
                    dom = doms.eq(i);
                    input = dom.prev().children('input');
                    total = dom.find('input');
                    check = total.filter(':checked');

                    if (check.length > 0 && check.length < total.length){
                        dom.next().css('display', 'block').text(check.length + '/' + total.length);
                    }

                }
            }
            ,hide: function(){
                SensitiveClass.master(this,"hide",arguments);
                this.$item.hide();
            }
            ,show: function(){
                SensitiveClass.master(this,"show",arguments);
                this.$item.show();
            }
        }
    );
    exports.sensitiveClass = SensitiveClass;

    // 视频分类
    var VideoClass = app.extend(
        Website
        ,{
            init: function(config){
                config = $.extend(
                    {
                        "key":"children"
                        ,"valueKey":"_id"
                        ,"nameKey":"Name"
                        ,"silence":false
                        ,'auto_load': false
                        ,'getSubs': true
                        ,'url': ''
                        ,'param': null
                    }
                    ,config
                );
                VideoClass.master(this,"init",[config]);
            }
            ,setUrl: function(param){
                VideoClass.master(this,"setUrl",arguments);
                this.config.url = param;
            }
            ,getConfig: function(param){
                VideoClass.master(this,"getConfig",arguments);
                var c = this.config;
                if(param){
                    return c[param];
                }else{
                    return c;
                }
            }
        }
    );
    exports.videoClass = VideoClass;

    // Mogo App 分类
    var MogoAppClass = app.extend(
        SensitiveClass
        ,{
            init: function(config){
                config = $.extend(
                    {
                        'key':'ChildData'
                        ,'valueKey':'CategoryId'
                        ,'nameKey':'Name'
                        ,'silence':false
                        ,'auto_load': false
                        //,'getSubs': true
                        ,'param': null
                        ,'class': 'M-commonSLC M-commonSLCMongoAppClass'
                    }
                    ,config
                );
                MogoAppClass.master(this,"init",[config]);
                this.el.parent().find('.M-formItemLabel').hide();
            },
            onData: function(err, data, cb){
                if (err){
                    app.error(err);
                }else {
                    this.setList(data.items);
                }
                if (cb){
                    cb();
                }
            }
            ,load: function(cb){
                var c = this.config;
                app.data.get(c.url, c.param, this, 'onData', cb);
                return this;
            }
        }
    );
    exports.mogoAppClass = MogoAppClass;

    // 同一data格式的App分类
    var MobileAppClass = app.extend(
        VideoClass
        ,{
            init: function(config){
                config = $.extend(
                    {
                        "key":"children"
                        ,"valueKey":"_id"
                        ,"nameKey":"Name"
                        ,"silence":false
                        ,'auto_load': false
                        ,'getSubs': true
                        ,'url': ''
                        ,'param': null
                    }
                    ,config
                );
                MobileAppClass.master(this,"init",[config]);
            }
        }
    );
    exports.mobileAppClass = MobileAppClass;

    // Sohu 频道分类
    var ChannelClass = app.extend(
        MogoAppClass
        ,{
            init: function(config){
                config = $.extend(
                    {
                        'key':'ChildData'
                        ,'valueKey':'CategoryId'
                        ,'nameKey':'Name'
                        ,'silence':false
                        ,'auto_load': false
                        //,'getSubs': true
                        ,'param': null
                        ,'class': 'M-commonSLC M-commonSLCChannelClass'
                    }
                    ,config
                );
                ChannelClass.master(this,"init",[config]);
            }
        }
    );
    exports.channelClass = ChannelClass;

    // Sohu 视频分类
    var MediaClass = app.extend(
        VideoClass
        ,{
            init: function(config){
                config = $.extend(
                    {
                        "key":"children"
                        ,"valueKey":"_id"
                        ,"nameKey":"Name"
                        ,"silence":false
                        ,'auto_load': false
                        ,'getSubs': true
                        ,'url': ''
                        ,'param': null
                    }
                    ,config
                );
                MediaClass.master(this,"init",[config]);
            }
        }
    );
    exports.mediaClass = MediaClass;


    //影视分类
    var VideoChannel = app.extend(common.subLevelCheckbox, {
        init: function(config){
            config = $.extend({},{
                    "key":"SubClass",
                    //层级值对应的key
                    "valueKey":"ClassId",
                    //显示名称对应的key
                    "nameKey":"ClassName"
                },
                config);
            this.listVideoChannelCache = null;
            VideoChannel.master(this,'init',[config]);
            if (this.listVideoChannelCache){
                this.setList(this.listVideoChannelCache);
            }else {
                //TODO:加载数据
                app.data.get('/rest/videochannel',{method: 'list'}, this);
            }

            this.el.addClass('M-formZone');

            // 添加辅助按钮
            var buttonsDiv = $('<div class="M-commonSLCButtons"></div>');
            this.el.prepend(buttonsDiv);
            var buttons = [
                {'class': 'selectInverse', 'onFunc': 'eventSelectInverse', 'text': LANG('反选')},
                {'class': 'clearAll', 'onFunc': 'eventClearAll', 'text': LANG('清空')}
            ]
            var i, len
            for(i = 0, len = buttons.length; i < len; i++) {
                var val = buttons[i];
                // 添加辅助按钮标签
                $('<a class="' + val['class'] + '">' + val['text']  + '</a>').appendTo(buttonsDiv);
                // 添加事件
                this.dg(this.el, '.' + val['class'], 'click', val['onFunc']);
            }
        },
        getData: function() {
            //获取已选的类型并返回
            var subVideoIds = this.getSelectedSubVideoInfo();
            return subVideoIds;
        },
        setData: function() {
            VideoChannel.master(this, 'setData', arguments);
        },
        onData: function(err, data){
            if (err){
                app.log(err.message);
                return false;
            }
            this.listVideoChannelCache = data;
            this.setList(this.listVideoChannelCache);

            // 第一层ClassId
            var level1_ids = this.$level1_ids = [];
            // 记录第一层ClassId；
            util.each(data, function(item){
                if(item && item.SubClass){
                    util.each(item.SubClass, function(sub){
                        if(sub && sub.ClassId){
                            level1_ids.push(sub.ClassId);
                        }
                    })
                }
            });

            // 所有可选择的影视分类列表，用于反选
            var selectableVideoChannel = [];
            // 此方法用于获得所有具体影视分类
            // 参数为分类数据的顶层对象
            // 注意方法内会递归调用
            function findVideo(channels) {
                var channel = null;
                for(var i = 0, len = channels.length; i < len; i++) {
                    channel = channels[i];
                    if (channel.SubClass && channel.SubClass.length > 0) {
                        findVideo(channel.SubClass);
                    } else {
                        // 没有child或child长度为零，该选项为可选择
                        selectableVideoChannel.push(channel.ClassId);
                    }
                }
            }
            findVideo(this.listVideoChannelCache);
            this.$selectableVideoChannel = selectableVideoChannel;
        },
        // 反选
        eventSelectInverse: function(ev, elm) {
            // 得到没选择的城市
            var inverseChannels = _complementArray(this.$selectableVideoChannel, this.getSelectedSubVideoInfo())
            this.setData(inverseChannels);
        },
        // 清空选择
        eventClearAll: function(ev, elm) {
            this.setData([]);
        },
        // 取得已经选择的影视类型
        getSelectedSubVideoInfo: function() {
            var self = this;
            this.$selectedSubVideoInfo = [];
            //var level1_ids = [];
            // this.doms.body.find('input:checkbox[checked="checked"]').each(function() {
            // 	var el = $(this);
            // 	var val = el.val();
            // 	// “其他”选项使用的是数字0而非字符串，需先转换
            // 	if (val === "0") {
            // 		val = 0;
            // 	}

            // 	// 如果选了一级，只发送一级，否则发送三级
            // 	if(self.$level1_ids.indexOf(val) >= 0){
            // 		level1_ids.push(+val);
            // 	}else{
            // 		if(!level1_ids.length){
            // 			if(self.$selectableVideoChannel.indexOf(val) >= 0) {
            // 				self.$selectedSubVideoInfo.push(+val);
            // 			}
            // 		}
            // 	}
            // })

            // 第一层id
            var head_ids = [];
            this.doms.body.find('.M-commonSLCZoneHead input:checkbox[checked="checked"]').each(function(){
                var el = $(this);
                var val = el.val();
                // “其他”选项使用的是数字0而非字符串，需先转换
                if (val === "0") {
                    val = 0;
                }
                if(self.$level1_ids.indexOf(val) >= 0){
                    head_ids.push(+val);
                }
            });

            // 第三层id
            this.doms.body.find('input:checkbox[checked="checked"]').each(function(){
                var el = $(this);
                var val = el.val();
                // “其他”选项使用的是数字0而非字符串，需先转换
                if (val === "0") {
                    val = 0;
                }

                if(self.$selectableVideoChannel.indexOf(val) >= 0) {
                    self.$selectedSubVideoInfo.push(+val);
                }
            });

            var result = [];
            // 如果选了一级，只发送一级，否则发送三级
            util.each(self.$selectedSubVideoInfo, function(item, idx){
                if(item){
                    var has = false;
                    util.each(head_ids, function(head){
                        var re = new RegExp("^"+head+"");
                        if(re.test(String(item))){
                            has = true;
                            return;
                        }
                    })
                    if(!has){
                        result.push(item);
                    }
                }
            });

            return result.concat(head_ids);
        }
        // 此方法用于合并两个数组，但不添加重复的元素
        // 考虑将该方法添加到util
        //_merageArray: function(arr1, arr2) {
        //    var newArr = arr1.slice(0);
        //    arr2.filter(function(e) {
        //        if (arr1.indexOf(e) < 0) {
        //            newArr.push(e)
        //        }
        //    })
        //    return newArr;
        //}
    });
    exports.videoChannel = VideoChannel;


    //转换格式
    function _convertArray(name, value, data){
        var res = [];
        util.each(data, function(item,key){
            res.push({
                'name': LANG(item),
                'value': value + ':' + key
            });
        })
        return {'name':name, 'value':value, 'child':res};
    }
    // 转换分组格式
    function _convertArrayGroup(name, value, data){
        var res = [];
        util.each(data, function(group){
            var item = _convertArray(
                LANG(group.text),
                value,
                group.list
            );
            delete item.value;
            res.push(item);
        });
        return {'name':name, 'value':value, 'child':res};
    }

    // 该方法取得子数组的补集
    // 第一个参数为父数组，第二个参数为子数组
    // 考虑将该方法添加到util
    function _complementArray(fatherArray, subArray) {
        return fatherArray.filter(function(e) {
            return subArray.indexOf(e) < 0;
        })
    }
});