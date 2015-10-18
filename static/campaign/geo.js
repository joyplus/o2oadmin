define(function(require, exports){
    var $ = require("jquery")
        ,view = require("view")
        ,map = require("map/map")
        ,util = require('util')
        ,datebar = require('views/datebar')
        ,app = require("app");

    /**
     * 国家对应的ID
     * @type {Object}
     */
    var COUNTRY_ID = app.config("country");

    var Geo = app.extend(
        view.container
        ,{
            init:function(config){
                config = $.extend(
                    {
                        // 地图国家
                        "country":"china"
                        // 地图设置
                        ,"map":{
                        // 是否马上绘制
                        "atOnce":1
                        ,"width":480
                        ,"height":380
                        // 地图渲染配置
                        // ,"attr":null
                        // ,"actAttr":null
                        // 地图是否具备事件响应
                        ,"bindEvent":1
                        ,"animDelay":300
                        // 地图绘制前的操作
                        ,"beforDraw":null
                    }
                        // 自动加载数据
                        ,"autoLoad":1
                        // 模块固有的请求参数
                        ,"modParam":{
                        "type":"geo"
                        // ,"stastic_all_time":1
                        ,"limit":999
                        ,"order":"impressions|-1,clicks|-1"
                    }
                        // 地图颜色等级
                        ,"colors":["#FAE1E1", "#ffbebe", "#ff9090", "#fe6464", "#FF2525", "#D60404"]
                        // 附加参数
                        ,"param":null
                    }
                    ,config
                );
                config.map.type = config.country;
                // 拼装国家条件
                config.modParam.condition = "country_id|"+COUNTRY_ID[config.country];
                if(config.sub_param.length>0){
                    config.modParam.condition+=','+config.sub_param;
                }
                Geo.master(this,null,config);
                Geo.master(this,"init");

                // 数据相关设定
                this.database = "/rest/subgrid";
                // 数据缓存
                this.data = {};
                this.ready = false;
                // 等级划分
                this.levels = [];
                // 索引
                this.indexMap = {};

                // 添加区域
                if(!this.config.map.target){
                    this.config.map.target = this.el;
                }

                // 构造
                this.build();

                // 加载数据
                if(this.config.autoLoad){
                    this.load();
                }

            }
            /**
             * 构造地图界面
             * @return {Undefined} 无返回值
             */
            ,build:function(){
                if(this.ready){
                    return;
                }
                this.map = this.create(
                    "map"
                    ,map.base
                    ,this.config.map
                );
                this.ready = true;
            }
            /**
             * 获取请求参数
             * @param  {Object}    param 请求参数
             * @return {Object}          请求参数对象
             */
            ,getParam:function(param){
                var condition;
                var dateParam = datebar.getDate();
                if(param){
                    condition = {
                        "condition":this.config.modParam.condition+","+param.condition
                    }
                    this.config.param = param;
                }
                return $.extend(
                    {}
                    ,this.config.modParam
                    ,this.config.param
                    ,condition
                    ,dateParam
                );
            }
            /**
             * 数据请求响应函数
             * @param  {Object}    err  错误信息
             * @param  {Object}    data 返回的数据对象
             * @return {Undefined}      无返回值
             */
            ,onData:function(err,data){
                if(err){
                    app.alert(err.message);
                    return false;
                }
                this.setData(data);
            }
            /**
             * 获取数据
             * @param {Mix} key 获取数据的索引。可以是字符串，数字，其他类型
             * @return {Object} 地域数据
             */
            ,getData:function(key){
                var data;
                switch(typeof(key)){
                    case "string":
                        data = this.data[this.indexMap[key]];
                        break;

                    case "nunmer":
                        data = this.data[key];
                        break;

                    default:
                        data = this.data;
                }
                return data;
            }
            /**
             * 设定地域数据
             * @param {Object} data 地域数据
             */
            ,setData:function(data){
                var items = this.data = data.items || []
                    ,len = items.length
                    ,avg = data.amount && ((data.amount.impressions || 0)/len)
                    ,setp
                    ,v = 0;
                while(len--){
                    items[len].click_rate = util.round0(items[len].click_rate*100, 3) + '%';
                    v += Math.pow((items[len].impressions-avg),2);
                }
                v /= (items.length-1);
                setp = Math.round(Math.sqrt(v));
                for(var i =1,l = this.config.colors.length+1;i<l;i++){
                    this.levels.push(setp*i);
                }
                this.coloring();
                len = avg = setp = v = 0;
                this.fire('geoReady');
            }
            /**
             * 染色
             * @return {Undefined} 无返回值
             */
            ,coloring:function(){
                var region = this.map.states[this.config.country]
                    ,len = this.data.length
                    ,items = this.data
                    ,path
                    ,attr;
                for(var i = 0;i<len;i++){
                    if(region.hasOwnProperty(items[i].region_name)){
                        // 地域对应的数据位置
                        this.indexMap[items[i].region_name] = i;
                        attr = {
                            "fill":_getColor.call(this,items[i].impressions)
                            ,"stroke":"#c30"
                            ,"stroke-width":1
                        }
                        path = region[items[i].region_name];
                        // 重写区域的显示属性
                        path.data('attrs',attr);
                        path.animate(attr,500);
                    }
                }
                attr = path = null;
            }
            /**
             * 重置模块
             * @return {Object} 实例本身
             */
            ,reset:function(){
                this.data = {};
                this.indexMap = {};
                this.map.reset();
            }
            /**
             * 加载数据
             * @param  {Object}    param 请求参数
             * @return {Undefined}       无返回值
             */
            ,load:function(param){
                app.data.get(
                    this.database
                    ,this.getParam(param)
                    ,this
                );
            }
            ,removeSelected:function(){
                this.map.removeSelected();
            }
        }
    );

    /**
     * 颜色等级辨识函数
     * @param  {Number} n 要检测的数值。该数值会与_Levels数组中的数进行对比
     * @return {Number}   颜色等级
     * @private
     */
    function _getColor(n,lvs){
        lvs = lvs || this.config.colors;
        var len = lvs.length
            ,re;
        for(var i = 0;i<len;i++){
            if(n < this.levels[i]){
                re = lvs[i];
                break;
            }
        }
        return re;
    }

    exports.base = Geo;

});