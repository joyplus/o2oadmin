define(function(require, exports){
    var $ = require("jquery")
        ,app = require("app")
        ,view = require("view");

    /**
     * 面包屑导航
     * @param {[type]} config [description]
     */
    function Crumbs(config){
        config = $.extend(
            {
                "target":"body"
                ,"class":"M-crumbs"
                ,"database":"/rest/listsweety"
                ,"param":{
                "Id":0
            }
                ,"now":{
                "name":""
            }
                ,"prev":null
            }
            ,config
        );
        Crumbs.master(this,null,config);
        this.ready = 0;
        this.data = {};
    }

    extend(
        Crumbs
        ,view.container
        ,{
            init:function(){
                this.render();

                this.layout = this.create(
                    "layout"
                    ,view.layout
                    ,{
                        "target":this.el
                        ,"grid":[1,3]
                        ,"cellSet":[
                            {"class":"backBnt","html":"<div></div>"+LANG("返回")}
                            ,{"class":"fnArea"}
                            ,{"class":"theCrumbs"}
                        ]
                    }
                );

                // 返回按钮
                this.layout.get(0,1).bind("click",this,this.goBack);

                // 附加功能区域
                // 针对面包屑的附加功能推荐在这里加载
                this.fnArea = this.create(
                    "fnArea"
                    ,view.container
                    ,{
                        "target":this.layout.get(1,1)
                    }
                );

                // 面包屑
                this.theCrumbs = this.create(
                    "theCrumbs"
                    ,view.container
                    ,{
                        "target":this.layout.get(2,1)
                    }
                );
                this.theCrumbs.el.delegate("span:not(:last)","click",this,this.crumbClick);

                if(this.config.param){
                    this.getData();
                }else if(this.config.data){
                    this.updata(this.config.data);
                }
                this.ready = 1;
            }
            /**
             * 返回上一层
             * @param  {Object}    ev 消息对象
             * @return {Undefined}    无返回值
             * @todo 详尽的需求还不明确。暂时按两层处理
             */
            ,goBack:function(ev){
                var me = ev.data;
                var uri = null;
                if(me.config.prev && me.config.prev.uris){
                    uri = me.config.prev.uris.pop();
                }else{
                    uri = window.location.hash.replace(/^[#|\/]+/,"");
                    uri = uri.substr(0,uri.indexOf("/"));
                }
                // uri = uri.split("/");
                // uri = uri.slice();
                if(uri){
                    app.navigate(uri);
                }
            }
            /**
             * 面包屑点击响应函数
             * @param  {Object}    ev 消息对象
             * @return {Undefined}    无返回值
             * @todo 暂时只做两层处理。如需求进一步确认的话需要做修改
             */
            ,crumbClick:function(ev){
                var me = ev.data;
                me.goBack(ev);
            }
            /**
             * 获取数据
             * @param  {Object}    err  错误消息对象
             * @param  {Object}    data 数据对象
             * @return {Undefined}      无返回值
             */
            ,onData:function(err,data){
                if(!err){
                    this.data = data.items;
                    this.updata(data.items[0]);
                }else{
                    console.log("Err=>",err,data);
                }
            }
            /**
             * 更新函数
             * @param  {Object}    data 本次更新的数据
             * @return {Undefined}      无返回值
             */
            ,updata:function(data){
                // this.chanleName.el.html(data.Name);
                if(data){
                    // data有可能没有。后端数据不可信啊……
                    this.theCrumbs.el.html(
                        '<span>'+data.Name+'</span>/<span>'+this.config.now.name+'</span>'
                    );
                }
            }
            /**
             * 获取数据
             * @return {Undefined} 无返回值
             */
            ,getData:function(){
                if(this.config.database){
                    app.data.get(
                        this.config.database
                        ,this.config.param
                        ,this
                    );
                }
            }
            /**
             * 重载
             * @param  {Object}    param 数据刷新参数
             * @return {Undefined}       无返回值
             */
            ,reload:function(param){
                if(param){
                    this.config.param = $.extend(
                        this.config.param
                        ,param
                    );
                }
                this.getData();
            }
        }
    );
    exports.base = Crumbs;

});