define(function(require, exports){
    var $ = require("jquery")
        ,raphael = require("raphael")
        ,mapset = require("./mapset")
        ,util = require("util")
        ,view = require("view")
        ,app = require("app");

    /**
     * 绘图函数
     * @param  {String}   path     描图路径数据字符串
     * @param  {Object}   attr     描图路径的样式设置
     * @return {Object}            绘制完后的raphael图形对象
     * @private
     */
    function _draw(path,attr){
        attr = attr || this.config.attr;
        path = this.svg.path(path);
        path.attr(attr);
        return path;
    }

    /**
     * 地图路径的固有尺寸
     * svg无法根据用户设置的大小自动缩放尺寸，所以需要有一个基准尺寸来设定地图路径
     *
     * （¯﹃¯）
     * 乖，听话，不要改变这个设定，除非你想重写mapset模块中的mapData对象中的所有path数据
     *
     * @type {Object}
     */
    var defSet = {
        "width":480
        ,"height":380
    };
    var mode = 0;
    var zoom = 4;

    var Map = app.extend(
        view.container
        ,{
            init:function(config){
                config = $.extend(
                    {
                        // 是否马上绘制
                        "atOnce":1
                        // 国家地图
                        ,"type":"china"
                        ,"width":480
                        ,"height":400
                        // 地图渲染配置
                        ,"attr":{
                        "fill":"#f5f5f5"
                        ,"stroke":"#ddd"
                        ,"stroke-width":1
                        ,"stroke-linejoin":"round"
                        ,"cursor":"pointer"
                    }
                        // 地图区域激活时的效果
                        ,"actAttr":{
                        // "fill":"#fcc",
                        "stroke": "#555",
                        "stroke-width":2
                    }
                        // 地图是否具备事件响应
                        ,"bindEvent":1
                        ,"animDelay":300
                        // 能响应的事件处理对象
                        // 多事件响应的话请用空格分隔事件类型
                        ,"events":"click"
                        // 地图绘制前的操作
                        ,"beforDraw":null
                    }
                    ,config
                );
                Map.master(this,null,config);
                Map.master(this,"init");
                this.build();
            }
            /**
             * 界面构造及相关设定
             * @return {Undefined} 无返回值
             */
            ,build:function(){
                var conf = this.config
                    ,size_zoom;
                // 地图图形对象缓存
                this.states = {};

                // 常规|缩放
                if (mode){
                    size_zoom = mode ? zoom : 1;
                }else {
                    size_zoom = 1;
                }

                // 地图宽高设定
                var w = conf.width * size_zoom
                    ,h = conf.height * size_zoom;

                // 地图主raphael svg对象。真正的svg对象是该对象中的canvas
                var con = conf.target[0],tar = con.childNodes[0];
                this.svg = raphael(tar, w, h);

                // 缩放初始数值相关计算
                if (w * defSet.height > h * defSet.width){
                    conf.scale = defSet.height/h;
                    conf.viewWidth = conf.scale*w;
                    conf.viewHeight = defSet.height;
                    conf.left = Math.round((defSet.width - conf.viewWidth)/2);
                    conf.top = 0
                }else {
                    conf.scale = defSet.width/w
                    conf.viewWidth = defSet.width;
                    conf.viewHeight = conf.scale*h;
                    conf.top = Math.round((defSet.height - conf.viewHeight)/2);
                    conf.left = 0;
                }

                this.svg.setViewBox(conf.left, conf.top, conf.viewWidth, conf.viewHeight,false);

                if(conf.bindEvent){
                    // 事件绑定
                    this.bindEvent();
                }

                this.zoomInfo = null;

                // 当前选中的区域
                this.currentPath = null;
                this.animation = raphael.animation(conf.actAttr,300);

                if(conf.atOnce){
                    this.draw();
                }
            }
            /**
             * 事件绑定
             * @return {Undefined} 无返回值
             */
            ,bindEvent:function(){
                this.jq(this.el,this.config.events,this.eventHandler);

            }
            /**
             * 事件分发函数
             * @param  {Object}    evt 鼠标事件
             * @return {Undefined}     无返回值
             */
            ,eventHandler:function(evt){
                var type = evt.type.replace(/\w/,function(w){
                    return w.toUpperCase();
                });
                type = "event"+type;
                if(util.isFunc(this[type])){
                    this[type](evt);
                }
                type = null;
                return false;
            }
            /**
             * 绘制地图
             * @param  {String}    type       国家
             * @param  {Function}  callback   绘制完成后的回调
             * @return {Undefined}            无返回值
             */
            ,draw:function(type,callback){
                var mData = mapset.get(type || this.config.type),self = this;
                if(mData){
                    // 检索到有对应的地图数据时
                    if(type){
                        this.config.type = type;
                    }

                    // 绘制前的前期处理函数入口
                    if(util.isFunc(this.config.beforDraw)){
                        this.config.beforDraw.call(this,mData);
                    }
                    var states = this.states[this.config.type] = this.states[this.config.type] || {};
                    var hoverInFn = function(evt){
                        var tar = $(evt.target),x,y,pos  = tar.offset(),box = this.getBBox();
                        x  = pos.left + box.width/2;
                        y = pos.top + box.height/2;
                        self.removeSelected();
                        self.currentPath = this;
                        this.toFront().animate(self.animation);
                        if(self.timer){
                            clearTimeout(self.timer);
                            self.timer = null;
                        }
                        self.fire(
                            "mapHoverIn"
                            ,{
                                "x":x
                                ,"y":y
                                ,"data":this.data('name')
                                ,"el":tar
                            }
                        );
                    }
                    var hoverOutFn = function(){
                        self.timer = setTimeout(function(){
                            self.fire('hideTip');
                        },500);
                    }
                    // 循环生成
                    for(var state in mData){
                        states[state] = _draw.apply(this,[mData[state].path, mData[state].attr]);
                        states[state].data({
                            "name":state
                            ,"attrs":this.config.attr
                        });
                        states[state].hover(hoverInFn,hoverOutFn);
                    }

                    // 回调
                    if(util.isFunc(callback)){
                        callback.call(states[state], state, mData[state]);
                    }

                    // 兼容处理
                    this.svg.safari();
                }
            }
            /**
             * 取消选中的省份状态
             * @return {None}
             */
            ,removeSelected: function(){
                var path = this.currentPath;
                if(path){
                    this.currentPath = null;
                    path.stop().animate(path.data("attrs"), 100);
                }
            }
            /**
             * 点击处理函数, 单击选中省份
             * @param  {Object} evt jQuery事件对象参数
             * @return {Undefined}
             */
            ,eventClick:function(evt){
                var path = evt.target;
                if (path && (path.nodeName == "path"||path.nodeName == "shape") && path.raphael){
                    // path = this.svg.getById(path.raphaelid);
                    // if(path){
                    // 	this.removeSelected();

                    // 	// 缓存当前对象属性
                    // 	this.currentPath = path;

                    // 	path.toFront().animate(this.animation);
                    // 	this.fire(
                    // 		"mapClick"
                    // 		,{
                    // 			"x":evt.pageX
                    // 			,"y":evt.pageY
                    // 			,"data":path.data("name")
                    // 			,"el":$(evt.target)
                    // 		}
                    // 	);
                    // }
                }
                else{
                    this.fire('hideTip');
                }
            }
            /**
             * 获取数据
             * @return {mix} 对应的数据
             */
            ,getData:function(key){
                var path = this.currentPath;
                if(path && key){
                    return path.data(key);
                }else{
                    return null;
                }
            }
            /**
             * 设定地域数据
             * @param {Object} data 地域数据
             */
            ,setData:function(data){}
            /**
             * 重置模块
             * @return {Object} 实例本身
             */
            ,reset:function(){
                this.svg.clear();
                this.states = {};
                this.draw();
                return this;
            }
            /**
             * 加载数据
             * @param  {Object}    param 请求参数
             * @return {Undefined}       无返回值
             */
            ,load:function(param){}
        }
    );
    exports.base = Map;

});