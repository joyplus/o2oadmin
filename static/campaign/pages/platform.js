define(function(require, exports){
    var $ = require("jquery")
        ,app = require("app")
        ,view = require("view")
        ,comm = require("common")
        ,pop = require("popwin")
        ,grid = require("grid")
        ,date = require("views/datebar");

    // 创意板块页面
    var List = app.extend(
        view.container
        ,{
            init:function(config){
                config = $.extend(
                    {
                        // 是否有日期栏
                        "hasDate":true
                    }
                    ,config
                );
                List.master(this,null,config);
                List.master(this,"init",[config]);
                this.build();
            }
            ,build:function(){

                // 时间段控件
                if(this.config.hasDate){
                    this.create(
                        "date"
                        ,date.datepicker
                        ,{
                            "target":this.el
                        }
                    );
                }

                // 列表
                this.grid = this.create(
                    "grid"
                    ,grid.platform
                    ,{
                        "functional":{
                            "render":this.renderFunctional
                        }
                    }
                );
            }
            /**
             * 表格操作列格式化函数
             * @param  {Number}    index 当前行数
             * @param  {Mix}       value 单元格对应的数据
             * @param  {Object}    row   当前行对应的数据
             * @return {Undefined}       无返回值
             */
            ,renderFunctional:function(index, value, row){
                return '<a data-func="edit" href="javascript:void(0);"><em title="'+LANG("编辑")+'" class="G-iconFunc edit"></em></a><a data-func="remove" href="#"><em title="'+LANG("删除")+'" class="G-iconFunc trash"></em></a>';
            }
            /**
             * 表格行操作按钮处理函数
             * @param  {Object}    ev 消息对象
             * @return {Undefined}    无返回值
             */
            ,onListFnClick:function(ev){
                var param = ev.param;
                var id = param.data._id;

                switch (param.func){
                    case 'remove':
                        if(confirm(LANG('删除平台将导致该平台下的所有产品也被删除！\n\n真的要删除这个平台吗?'))){
                            app.data.del(
                                "/rest/deleteplatform",
                                {"Id":id},
                                this.cbRemove, this, param
                            );
                        }
                        break;
                    case 'edit':
                        this.edit(id,param.data);
                        break;
                }
            }
            /**
             * 删除回调
             * @param  {Object}    err   错误信息回调
             * @param  {Object}    data  返回的数据
             * @param  {Object}    param 列表行对应的数据
             * @return {Undefined}       无返回值
             */
            ,cbRemove: function(err, data, param){
                if (err){
                    alert(err.message);
                    return false;
                }
                this.grid.removeRow(param.index);
            }
            /**
             * 编辑
             * @param  {Number}    id   行数据ID
             * @param  {Object}    data 行数据
             * @return {Undefined}      无返回值
             */
            ,edit:function(id,data){
                if(!this.pop){
                    this.pop = this.create(
                        "pop"
                        ,pop.editPlatform
                        ,{
                            "data":data
                        }
                    );
                    this.pop.show();
                }else{
                    this.pop.show(data);
                }
            }
            ,onEditPlatformDone:function(ev){
                this.grid.reload();

                if (ev.param && ev.param.id) {
                    this.grid.setRowHighlight(ev.param.id);
                }
                return false;
            }
        }
    );
    exports.main = List;

    function AddPlatform(config){
        config = $.extend(
            true
            ,{
                "target":"body"
                ,"id":0
                ,"class":"P-platform-addNewPlatformBox"
            }
            ,config
        );
        this.data = {
            "Name":""
            ,"Description":""
        };
        this.platformListDatabase = "/rest/listplatform";
        this.database = "/rest/addplatform";
        AddPlatform.master(this,null,config);
    }
    extend(
        AddPlatform
        ,view.container
        ,{
            init:function(){
                AddPlatform.master(this,"init");
                this.build();
                if(this.config.id){
                    this.getData(1);
                }
            }
            ,build:function(){
                var tmp = this.el;
                // 新平台名
                this.newPlatformName = this.create(
                    "newPlatformName"
                    ,comm.input
                    ,{
                        "target":tmp
                        ,"valu":LANG("新增平台_")+app.util.date("YmdHis")
                        ,"label":{
                            "html":LANG("平台名称")
                        }
                    }
                );
                // 新平台说明
                this.newPlatformDesc = this.create(
                    "newPlatformDesc"
                    ,comm.input
                    ,{
                        "target":tmp
                        ,"label":{
                            "html":LANG("平台说明")
                        }
                        ,"value":LANG("无")
                    }
                );
                // 新平台添加按钮
                this.newPlatformAdd = this.create(
                    "newPlatformAdd"
                    ,comm.input
                    ,{
                        "target":tmp
                        ,"class":"btnGreen"
                        ,"type":"button"
                        ,"value":LANG("添加")
                        ,"data-action":"save"
                    }
                );
                // 新平台取消按钮
                this.newPlatformCancel = this.create(
                    "newPlatformCancel"
                    ,comm.input
                    ,{
                        "target":tmp
                        ,"class":"btn"
                        ,"type":"button"
                        ,"value":LANG("取消")
                        ,"data-action":"cancelAddPlatform"
                    }
                );
            }
            /**
             * 获取正在编辑的平台获取数据
             * @param  {Boolean} go 是否远程拉取数据
             * @return {Object}     平台数据
             */
            ,getData:function(go){
                if(go && this.config.id){
                    app.data.get(
                        this.platformListDatabase
                        ,{
                            "Id":this.config.id
                        }
                        ,this
                        ,"onPlatformDataCome"
                    );
                    return this.data;
                }else{
                    this.data.Name = this.newPlatformName.el.val();
                    this.data.Description = this.newPlatformDesc.el.val();
                    if(this.config.id){
                        this.data.Id = this.config.id;
                    }
                    return this.data;
                }
                return false;
            }
            /**
             * 取得平台数据时
             * @param  {Object}    err  错误信息
             * @param  {Object}    data 数据
             * @return {Undefined}      无返回值
             */
            ,onPlatformDataCome:function(err,data){
                if(err){
                    alert(err.message);
                    return false;
                }
                this.setData(data);
            }
            /**
             * 添加新平台
             * @return {Undefined} 无返回值
             */
            ,done:function(){
                this.getData();
                app.data.put(
                    this.database
                    ,this.data
                    ,this
                    ,"onSaved"
                );
            }
            /**
             * 消息响应处理函数
             * @param  {Object}    ev 消息信息对象
             * @return {Undefined}    无返回值
             */
            ,onClick:function(ev){
                if(ev.from === this.$.newPlatformAdd){
                    this.done();
                    return false;
                }
            }
            ,onEvent:function(ev){
                if(ev.from !== this){
                    // 拦截全部不是由自身发出的事件
                    return false;
                }
            }
            /**
             * 保存后的回调函数
             * @param  {Object}    err  错误信息
             * @param  {Object}    data 返回数据
             * @return {Undefined}      无返回值
             */
            ,onSaved:function(err,data){
                if(err){
                    alert(err.message);
                    return false;
                }
                this.reset();
                this.fire("addPlatformSuccess",data);
            }
            /**
             * 重置
             * @return {Undefined} 无返回值
             */
            ,reset:function(){
                this.data = {};
                this.newPlatformName.el.val("");
                this.newPlatformDesc.el.val(LANG("无"));
            }
            /**
             * 设定数据
             * @param {Object} data 设定后的数据
             */
            ,setData:function(data){
                this.data = data;
                this.newPlatformName.el.val(this.data.Name);
                this.newPlatformDesc.el.val(this.data.Description);
                return this.data;
            }
        }
    );
    exports.add = AddPlatform;

});