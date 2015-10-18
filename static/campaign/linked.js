define(function(require, exports){
    var $ = require("jquery")
        ,app = require("app")
        ,view = require("view")
        ,comm = require("common")
        ,util = app.util
        ,popwin = require("popwin");

    function LinkedBox(config){
        this.config = $.extend(
            {
                "target":"body"
                ,"tag":"div"
                // 是否绑定事件
                ,"silence":0
            }
            ,config||{}
        );
        this.el = this.createDom(this.config);
    }
    extend(
        LinkedBox
        ,view.container
        ,{
            init:function(){
                this.render();
                if(!this.config.silence){
                    this.bindEvent();
                }
            }
            /**
             * 容器点击事件
             * @param  {Object}    ev 事件对象
             * @return {Undefined}    无返回值
             */
            ,click:function(ev){
                ev.data.fire("showAddPopwin");
            }
            /**
             * 事件绑定函数
             * @return {Undefined} 无返回值
             */
            ,bindEvent:function(){
                this.el.bind("click",this,this.click);
            }
            ,destroy:function(){
                if(!this.el){
                    return;
                }
                this.el.find("*").unbind();
                this.el.empty();
                LinkedBox.master(this,"destroy");
            }
        }
    );
    exports.box = LinkedBox;


    function Linked(config,parent,idObject){
        this.config = $.extend(
            true
            ,{
                "target":"body"
                // 显示容器设置
                ,"linkBox":{
                    "tag":"div"
                    ,"class":"linkedGameBox"
                }
                // 删除按钮设置
                ,"linkCancelBnt":{
                    "class":"linkCancel"
                    ,"type":"button"
                    ,"value":"X"
                }
                // 外部主容器设置
                ,"main":{
                    "tag":"div"
                    ,"class":"M-linkedGame"
                }
                ,"popup":{

                }
                ,"multiple":1
                ,"data":null
                ,"tips":false	// 说明提示
            }
            ,config
        );

        // 关联索引
        this.linkedIndex = 0;

        this.database = "/rest/listproduct";

        // 模块标题
        this.title = null;

        // 关联操作实例
        this.linkeds = {};

        // 已关联的数据
        this.data = {};

        this.config.target = $(this.config.target);
        this.el = this.createDom(this.config.main);
    }
    extend(
        Linked
        ,view.container
        ,{
            init:function(){
                var c = this.config;
                c.target.append(this.el);

                // 点击区域
                c.linkBox.target = this.el;
                // 添加产品按钮
                // this.createLinkbox();
                var con = $('<div class="wrap"><input type="button" class="selectProduct" value="添加产品"/></div>').appendTo(this.el);
                this.jq(con, 'click','showAddPopwin');

                // 说明提示
                if(c.tips){
                    this.create('tips', comm.tips, {
                        "target":con
                        ,"tips":c.tips
                    });
                }

                if(!this.popup){
                    _buildPop.call(this);
                }
                if(c.data){
                    this.load();
                }
            }
            /**
             * 创建关联的按钮容器
             * @return {Undefined} 无返回值
             */
            ,createLinkbox:function(no,data){
                if(!this.config.multiple){
                    var dat = this.data;
                    var self = this;
                    util.each(this.linkeds,function(linkBox,id){
                        linkBox.destroy();
                        delete self.linkeds[id];
                        delete dat[id];
                    })
                }
                // 关联的外部容器
                if(data){
                    this.data[data._id] = data;
                }
                var linkConfig = $.extend({},this.config.linkBox)
                    ,tmp;
                linkConfig.silence = +!!no;
                // linkConfig.silence = 1;
                var linkBox;
                if(no){
                    linkBox = this.linkeds[no] = this.create(
                        "linkBox"+this.linkedIndex
                        ,LinkedBox
                        ,linkConfig
                    );
                }else{
                    this.$addBtn = linkBox = this.create(
                        "linkBox"+this.linkedIndex
                        ,LinkedBox
                        ,linkConfig
                    );
                }

                // 游戏显示容器
                tmp = linkBox;
                tmp.game = this.create(
                    "game"+this.linkedIndex
                    ,view.container
                    ,{
                        "target":linkBox.el
                        ,"class":"linkedsItem"
                        ,"html":'<div class="addLink"><div><img src="/resources/images/blank.gif" data-type="Thumb" alt="" /></div><span>'+LANG("添加游戏")+'</span></div>'
                    }
                );
                tmp = linkBox.game;
                tmp.inner = tmp.el.find(".addLink:first");

                // 名字
                linkBox.name = this.create(
                    "name"+this.linkedIndex
                    ,view.container
                    ,{
                        "target":linkBox.el
                        ,"class":"linkGameName"
                        ,"html":'<p></p>'
                    }
                );
                tmp = linkBox.name;
                tmp.textArea = tmp.el.find("p:first");

                if(no){
                    // 添加名字
                    tmp = linkBox.name;
                    tmp.textArea.html(data.Name).attr('title',data.Name).addClass('M-tableListWidthLimit');
                    tmp.el.show();

                    // 取消关联按钮
                    var cancelBntSet = $.extend({},this.config.linkCancelBnt);
                    cancelBntSet.target = linkBox.el;
                    cancelBntSet["data-action"] = "cancel";
                    cancelBntSet["data-id"] = data._id;
                    linkBox.cancelBnt = linkBox.create(
                        "cancelBnt"
                        ,comm.input
                        ,cancelBntSet
                    );
                    cancelBntSet = null;

                    tmp = linkBox.game.inner;
                    tmp.attr("class","linkGame");
                    // 默认图片绑定
                    util.loadImage('product', data.Thumb, tmp.find("img:first"));
                    data._index = this.linkedIndex;

                    this.el.prepend(linkBox.el);
                }

                // 自增
                this.linkedIndex += 1;
                tmp = null;
            }
            /**
             * 创建关联游戏的预览块
             * @param  {Object}    data 游戏数据
             * @param  {Boolean}   nogo 是否发送消息
             * @return {Undefined}      无返回值
             */
            ,createLinkedbox:function(data,nogo){
                this.data[data._id] = data;
                if (!this.config.multiple){
                    if(this.$addBtn){
                        this.$addBtn.hide();
                    }
                    this.popup.setLimit(1, 1);
                }
                this.createLinkbox(data._id,this.data[data._id]);
                if(!nogo){
                    this.fire("sizeChange");
                }
            }
            ,removeLinkedBox:function(data){
                var id = data._id;
                if (!this.config.multiple){
                    if(this.$addBtn){
                        this.$addBtn.show();
                    }
                    this.popup.setLimit(0, 1);
                }
                if(this.linkeds[id]){
                    this.linkeds[id].destroy();
                    delete this.linkeds[id];
                }
                if(this.data[id]&&this.data[id].el){
                    // 如果有记录对象
                    this.data[id].el.attr({
                        "class":"btnGreen"
                        ,"data-op":"select"
                        ,"value":LANG("添加")
                    });
                }else{
                    // 没有记录对象的时候则尝试在表格中查找匹配的对象做操作
                    if(this.popup.popGrid){
                        var tmp = this.popup.popGrid.config.data
                            ,tmp2 = this.popup.popGrid.list.rows;
                        for(var i = 0;i<tmp.length;i++){
                            if(tmp[i]._id === id){
                                tmp2[i].find(".btnGray:first").attr({
                                    "class":"btnGreen"
                                    ,"data-op":"select"
                                    ,"value":LANG("添加")
                                });
                                break;
                            }
                        }
                    }
                }
                delete this.data[id];
                this.fire("sizeChange");
            }
            /**
             * linkbox更新函数
             * @param  {object} uplist 更新的数据
             * @return {undefined}        [description]
             */
            ,updateLinkBoxes:function(uplist){
                var ids = uplist['ids'],dels = uplist['dels'],cur,id,linkeds = this.linkeds;
                for(var i = 0;i<ids.length;i++){
                    id = ids[i];
                    cur = linkeds[id];
                    if(!cur){
                        this.createLinkbox(id,uplist[id]);
                    }
                }

                while (dels.length>0) {
                    id = dels.shift();
                    this.removeLinkedBox(id);
                }

            }
            ,setData: function(data){
                this.config.data = data || null;
                if (data && data.length){
                    this.load();
                }else {
                    this.reset();
                }
                return this;
            }
            ,getData: function(detail){
                if (detail){
                    return this.data;
                }else {
                    var ids = [];
                    util.each(this.data, function(item){
                        ids.push(item._id);
                    });
                    return ids;
                }
            }
            ,onData:function(err,data){
                if(!err){
                    for(var i=0;i<data.items.length;i++){
                        this.createLinkedbox(data.items[i],1);
                    }
                    this.fire("sizeChange");
                }
            }
            ,load:function(){
                app.data.get(
                    this.database
                    ,{
                        "Ids":this.config.data.toString()
                    }
                    ,this
                );
            }
            /**
             * 取消关联
             * @param  {Number}    id 关联实例/数据对应的id
             * @return {Undefined}       无返回值
             */
            ,cancelLink:function(id){
                this.removeLinkedBox(this.data[id]);
            }
            /**
             * 显示游戏列表弹出层
             * @return {Undefined} 无返回值
             */
            ,showAddPopwin:function(){
                var selectedIds=[];
                util.each(this.data,function(data,id){
                    selectedIds.push(+id);
                })
                this.popup.setSelected(selectedIds).show();
            }
            /**
             * 建立关联的时候
             * @param  {Object}     data 关联数据
             * @return {Undefined}       无返回值
             * @todo 需要发送事件
             */
            ,onLinked:function(data){
            }
            /**
             * 事件处理
             * @param  {Object}      ev 事件对象
             * @return {Undefined}      无返回值
             */
            ,onEvent:function(ev){
                if(ev.from !== this){
                    var dat = ev.param;
                    switch(ev.type){
                        case "click":
                            if(ev.param && ev.param.target.attr("data-action") === "cancel"){
                                this.cancelLink(+ev.param.target.attr("data-id"));
                                return false;
                            }
                            break;

                        case "showAddPopwin":
                            this.showAddPopwin();
                            break;
                        case 'selectGame':
                            this.createLinkedbox(dat);
                            break;
                        case 'unselectGame':
                            this.removeLinkedBox(dat);
                            break;
                        case 'updateGame':
                            this.updateLinkBoxes(dat);
                            break;
                    }
                }
            }
            ,reset:function(){
                for(var n in this.data){
                    this.removeLinkedBox(this.data[n]);
                    delete this.data[n];
                }
            }
        }
    );

    /**
     * 构造弹出层
     * @return {Undefined} 无返回值
     * @private
     */
    function _buildPop(){
        var c = this.config;
        var config = {
            "target":$("body:first")
        }
        if(c.data){
            config.data = c.data;
        }
        // 弹出层
        this.popup = this.create(
            "popup"
            ,popwin.selectProduct
            ,config
        );
        if (!c.multiple){
            this.popup.setLimit(0, 1);
        }
    }

    exports.base = Linked;

});