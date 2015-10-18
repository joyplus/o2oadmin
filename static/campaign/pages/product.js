define(function(require, exports){
    var $ = require("jquery")
        ,app = require("app")
        ,view = require("view")
        ,comm = require("common")
        ,grid = require("grid")
        ,upload = require("upload")
        ,taglabels = require("taglabels")
        ,platform = require("pages/platform")
        ,form = require("form")
        ,tab = require('tab')
        ,date = require("views/datebar")
        ,util = require("util");

    // 产品块页面
    var List = app.extend(
        view.container
        ,{
            init:function(config){
                config = $.extend(
                    {
                        // 是否有日期栏
                        "hasDate":true
                        // 是否有标签过滤
                        ,"hasTags":true
                        // 是否有添加按钮
                        ,"hasAdd":true
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

                // 标签过滤
                if(this.config.hasTags){
                    this.tags = this.create(
                        "productLabel"
                        ,taglabels.simple
                        ,{
                            "target":this.el
                            ,"type":"ProductLabel"
                        }
                    );
                }

                // 添加按钮
                if(this.config.hasAdd){
                    this.addBtn = this.create(
                        "addBtn"
                        ,view.container
                        ,{
                            "target":this.el
                            ,"tag":"button"
                            ,"class":"P-sweetyAddBtn btnAddGreen"
                            ,"html":"<em></em>"+LANG('添加产品')
                        }
                    );
                    this.jq(this.addBtn.el,"click","onButtonClick");
                }

                // 列表
                this.grid = this.create(
                    "grid"
                    ,grid.product
                    ,{
                        "functional":{
                            "render":this.renderFunctional
                        },
                        'auto_load': false
                        ,'hasAdvancedSearch': true
                    }
                );

                // 更新状态
                this.onUserChange();
            }
            ,onUserChange: function(ev){
                var user = app.getUser();
                this.$readOnly = (!user || user.auth <= 1);
                if (this.addBtn){
                    if (this.$readOnly){
                        this.addBtn.hide();
                    }else {
                        this.addBtn.show();
                    }
                }
                this.grid.switchFunctional(!this.$readOnly).load();
            }
            /**
             * 表格操作列格式化函数
             * @param  {Number}    index 当前行数
             * @param  {Mix}       value 单元格对应的数据
             * @param  {Object}    row   当前行对应的数据
             * @return {Undefined}       无返回值
             */
            ,renderFunctional:function(index, value, row){
                var html = '<a data-func="edit" href="javascript:void(0);"><em title="'+LANG("编辑")+'" class="G-iconFunc edit"></em></a>';
                if(row.IsUserAdd ==1){
                    html+='<a data-func="remove" href="#"><em title="'+LANG("删除")+'" class="G-iconFunc trash"></em></a>';
                }else{
                    html+='<em title="'+LANG("删除")+'" class="G-iconFunc trash disabledIcon"></em>';
                }
                return html;
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
                        if(confirm(LANG('真的要删除这个产品吗?'))){
                            app.data.del(
                                "/rest/deleteproduct",
                                {"Id":id},
                                this.cbRemove, this, param
                            );
                        }
                        break;
                    case 'edit':
                        window.open(window.location.href.split('#',1)+"#/product/edit/"+id);
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
                    app.alert(err.message);
                    return false;
                }
                this.grid.removeRow(param.index);
            }
            /**
             *
             * 添加按钮
             * @param  {Object}    ev 消息对象
             * @return {Undefined}    无返回值
             */
            ,onButtonClick: function(ev){
                window.open(window.location.href.split('#',1)+"#/product/add");
                return false;
            }
            /**
             * 标签点击事件响应函数
             * @param  {Object}    ev 消息对象
             * @return {Undefined}    无返回值
             */
            ,onSimpleLabelChange:function(ev){
                if (ev.param){
                    this.grid.setParam({'Label':JSON.stringify(ev.param)});
                }else {
                    this.grid.setParam({'Label':null});
                }
                this.grid.load();
            },
            /**
             * 产品成功保存回调
             */
            onSaveProductSuccess: function(ev){
                this.grid.reload();

                if (ev.param && ev.param.id) {
                    this.grid.setRowHighlight(ev.param.id);
                }
            }
        }
    );
    exports.list = List;

    var ProductAndOtherList = app.extend(
        view.container
        ,{
            init:function(config){
                ProductAndOtherList.master(this,null,config);
                ProductAndOtherList.master(this,"init",[config]);
                this.build();
            }
            ,build:function(){

                // 时间段控件
                this.create(
                    "date"
                    ,date.datepicker
                    ,{
                        "target":this.el
                    }
                );

                // 添加按钮
                this.addBtn = this.create(
                    "addBtn"
                    ,view.container
                    ,{
                        "target":this.el
                        ,"tag":"button"
                        ,"class":"P-sweetyAddBtn btnAddGreen"
                        ,"html":"<em></em>"+LANG('添加产品')
                    }
                );
                this.jq(this.addBtn.el,"click","onButtonClick");

                // 选项卡控件
                this.create(
                    "tab"
                    ,tab.productAndPlatformComplexTab
                    ,{
                        "target":this.el
                    }
                );

                this.onUserChange();
            }
            ,onUserChange: function(ev){
                var user = app.getUser();
                if (user && user.auth > 1){
                    this.addBtn.show();
                }else {
                    this.addBtn.hide();
                }
            }
            /**
             *
             * 添加按钮
             * @param  {Object}    ev 消息对象
             * @return {Undefined}    无返回值
             */
            ,onButtonClick: function(ev){
                window.open(window.location.href.split('#',1)+"#/product/add");
                return false;
            }
        }
    );
    exports.main = ProductAndOtherList;

    function AddProduct(config){

        config = $.extend(
            true
            ,{
                // 默认名称
                "defName":LANG("新增产品"),
                "noButtons": false
            }
            ,config
        );

        // 页面统一UI对象
        this.section = null;

        // 页面实例对象合集
        // 实例本身有带。这个对象为方便理解与调用
        this.subjects = {};

        // 数据
        this.data = {};

        // 平台数据
        this.platformData = null;

        // 实例初始化情况
        this.ready = 0;

        // 当前选择的平台名称
        this.nowPlatformName = null;

        // 添加平台容器状态
        this.addPlatformBoxStatus = 0;

        if(config.data){
            this.data = config.data;
            delete config.data;
        }

        // 操作数据节点
        this.database = "/rest/addproduct";
        AddProduct.master(this,null,config);
    }
    extend(
        AddProduct
        ,view.container
        ,{
            init:function(){
                AddProduct.master(this,"init");
                this.getNecessary();
            }
            /**
             * 获取操作的必要数据
             * @return {Undefined} 无返回值
             */
            ,getNecessary:function(){
                app.data.get(
                    "/rest/listplatform?all=1"
                    ,this
                    ,"onPlatformGetData"
                );
            }
            /**
             * 得到平台数据时的响应函数
             * @param  {Object}    err  错误对象
             * @param  {Object}    data 数据对象
             * @return {Undefined}      无返回值
             */
            ,onPlatformGetData:function(err,data){
                if(err){
                    app.alert(err.message);
                    return false;
                }
                this.platformData = data.items;
                this.build();
            }
            /**
             * 构造
             * @return {Undefined} 无返回值
             */
            ,build:function(){

                if(this.ready){
                    return;
                }

                var dat
                    ,subjects = this.subjects;
                this.section = this.create(
                    "Section"
                    ,form.section
                    ,{
                        "target":this.el
                        ,"title":LANG("产品信息")
                    }
                );

                var con = this.section.getContainer()
                    ,tmp = {"class":"P-pageCon"};
                con.addClass("P-product-stepContainer");

                this.layout = this.create(
                    "layout"
                    ,view.layout
                    ,{
                        "target":con
                        ,"grid":[6,1]
                        ,"cellSet":[tmp,tmp,tmp,tmp,tmp,tmp]
                    }
                );

                var platformCon = this.create('platformLayout', view.itemLayout,{
                    'target':this.layout.get(0).el,
                    'label': LANG('平台：'),
                    'additional': true,
                    'tips': LANG('标记产品所用，譬如一个游戏产品会有一个运营平台。')
                });
                var nameCon = this.create('nameLayout', view.itemLayout,{
                    'target':this.layout.get(2).el,
                    'label': LANG('名称：'),
                    'suffix': true
                });
                var thumbnailCon = this.create('thumbnailLayout', view.itemLayout,{
                    'target':this.layout.get(3).el,
                    'label': LANG('封面：'),
                    'tips': LANG('给产品上传封面以便管理，请上传：jpg,png,gif文件。文件尺寸小于1MB。')
                });
                var descCon = this.create('descLayout', view.itemLayout,{
                    'target':this.layout.get(4).el,
                    'label': LANG('描述：'),
                    'tips': LANG('给产品添加描述以便管理。')
                });

                // 平台选择
                subjects.platform = this.create(
                    "platform"
                    ,comm.dropdown
                    ,{
                        "target":platformCon.getContainer()
                        ,"def": LANG("选择平台")
                        ,'options': this.platformData
                        ,'search': true
                        ,'width': 274
                    }
                )

                // 新增平台按钮
                tmp = $('<span class="P-platform-platformCtrl"><a class="link">'+LANG("添加平台")+'</a></span>').appendTo(platformCon.getAdditional());
                subjects.addPlatform = tmp.find(".link");
                this.jq(subjects.addPlatform, 'click', "togglePlatform");


                // 添加平台区域
                tmp = this.layout.get(1).el;
                subjects.addPlatformSubject = this.create(
                    "addPlatformSubject"
                    ,platform.add
                    ,{
                        "target":tmp
                    }
                );
                tmp.hide();


                subjects.name = this.create(
                    "name"
                    ,comm.input
                    ,{
                        "target":nameCon.getContainer()
                        ,"type":"text"
                        ,"events":"click"
                        ,"data-action":"niceName"
                        ,"value":this.config.defName+"_"+app.util.date("YmdHis")
                        ,"placeholder":LANG("请输入产品名称。")
                    }
                );
                // 追加于产品名称后的平台名
                subjects.pfName = this.create(
                    "pfName"
                    ,comm.input
                    ,{
                        "target":nameCon.getSuffix()
                        ,"type":"text"
                        ,"class":"P-product-platformName"
                        ,"events":null
                        ,"value":"_"
                    }
                );
                subjects.pfName.el.attr("disabled","disabled");

                // 上传封面
                subjects.uploadThumbnail = this.create(
                    "uploadThumbnail"
                    ,upload.porter
                    ,{
                        "target":thumbnailCon.getContainer()
                        ,"title":null
                        ,"mode":"thumb"
                    }
                );

                // 简介
                subjects.description = this.create(
                    "description"
                    ,comm.input
                    ,{
                        "target":descCon.getContainer()
                        ,"type":"text"
                        ,"value":LANG("无")
                        ,"placeholder":LANG("请输入产品描述。")
                    }
                );

                // 创意标签
                dat = this.data && this.data.Label || null;
                subjects.productTags = this.create(
                    "productTags"
                    ,taglabels.base
                    ,{
                        "target":this.layout.get(5).el
                        ,"data":dat
                        ,"collapse":0
                        ,'label': LANG('标签：')
                        ,'tips': LANG('给创意包贴上标签，方便管理。多个标签用“,”分开')
                    }
                );

                tmp = $('<div class="P-campaignFormBtn M-formStepBtns"></div>');
                this.el.append(tmp);

                //创建按钮 -保存、取消
                if(!this.config.noButtons){
                    subjects.saveBnt = this.create(
                        "saveBnt"
                        ,comm.input
                        ,{
                            "target":tmp
                            ,"type":"button"
                            ,"value":LANG("保存")
                            ,"class":"btnBigGreen"
                            ,"data-action":"save"
                        }
                    );
                    subjects.cancelBnt = this.create(
                        "cancelBnt"
                        ,comm.input
                        ,{
                            "target":tmp
                            ,"type":"button"
                            ,"value":LANG("取消")
                            ,"class":"btnBigGray"
                            ,"data-action":"cancel"
                        }
                    );
                }
                this.ready = 1;
                this.loading  = this.create('loading', comm.loadingMask, {target: 'body', auto_show: false});
                subjects = tmp = null;
            }
            /**
             * 平台选择事件
             */
            ,onOptionChange: function(ev){
                this.platformChange();
            }
            /**
             * 设定数据
             * @param {Object} data 实例对象
             */
            ,setData:function(data){
                var tmp = this.platformData;
                for(var i = 0;i < tmp.length;i++){
                    if(tmp[i]._id == data.PlatformId){
                        this.subjects.platform.setData(tmp[i]._id, tmp);
                        this.nowPlatformName = tmp[i].Name;
                        this.subjects.pfName.el.val(this.nowPlatformName);
                        break;
                    }
                }
                tmp = this.subjects;
                //去掉后缀
                var dataName = data.Name;
                var pos = data.Name.lastIndexOf("_")
                if(pos>0){
                    dataName = data.Name.substr(0,pos);
                }
                tmp.name.el.val(dataName);
                tmp.description.el.val(data.Description);
                tmp.uploadThumbnail.setData({
                    "Path":data.Thumb
                });
                tmp.productTags.setData(data.Label);
                tmp = null;
                return this;
            }
            /**
             * 重置界面
             * @return {Undefined} 无返回值
             */
            ,reset:function(){
                this.data = null;
                //this.platformData = null;
                this.nowPlatformName = null;
                //this.subjects.platform.el.find("option:not(:first)").remove();
                this.resetPlatform();
                this.subjects.name.el.val(this.config.defName+"_"+app.util.date("YmdHis"));
                this.subjects.description.el.val("");
                this.subjects.uploadThumbnail.reset();
                this.subjects.productTags.reset();
            }
            /**
             * 获取模块数据
             * @return {Object} 数据对象
             */
            ,getData:function(){
                var tmp = this.subjects;
                if(!this.nowPlatformName){
                    app.alert(LANG("您还未选择产品所属的平台。"));
                    return false;
                }
                var old = this.data;
                var data = this.data = {
                    //"Name":tmp.name.el.val()+"_"+this.nowPlatformName
                    "Name":tmp.name.el.val()
                    ,"Thumb":tmp.uploadThumbnail.data.Path || ""
                    ,"Description":tmp.description.el.val() || ""
                    ,"Label":tmp.productTags.tagLabelsInput.el.val().split(",")
                    ,"PlatformId":this.subjects.platform.getData() || ""
                };
                var id = this.newId || (old && (old.Id || old._id)) || 0;
                if(id){
                    // 如果数据本身带有_id且不为0则视为是编辑状态
                    data.Id = id;
                }
                return this.data;
            }
            /**
             * 消息响应处理函数
             * @param  {Object}    ev 消息信息对象
             * @return {Undefined}    无返回值
             */
            ,onEvent:function(ev){
                if(ev.from !== this){
                    var type = ev.param && ev.param.target && ev.param.target.attr("data-action") || ev.type;
                    switch(type){
                        case "cancel":
                            this.cancel();
                            break;

                        case "save":
                            this.done();
                            break;

                        case "niceName":
                            if(ev.type == "blur"){
                                this.chkNiceName(ev.param.target.val());
                            }
                            break;

                        case "togglePlatform":
                            if(ev.type == "click"){
                                this.togglePlatform();
                            }
                            break;

                        case "cancelAddPlatform":
                            if(ev.type == "click"){
                                this.togglePlatform();
                            }
                            break;

                        case "addNewPlatform":
                            if(ev.type == "click"){
                                this.addNewPlatform();
                            }
                            break;

                        case "addPlatformSuccess":
                            this.addANewPlatform(ev.param);
                            this.togglePlatform();
                            break;
                        case "sizeChange":
                            this.fire("heightChange");
                            break;
                    }
                    type = null;
                    return false;
                }
            }
            /**
             * 添加一个平台到下拉列表
             * @param {Mix} data 当前的平台数据或false。
             */
            ,addANewPlatform:function(data){
                if(data){
                    this.platformData.push(data);
                    this.subjects.platform.setData(data._id, this.platformData);
                    this.platformChange();
                    return this.platformData;
                }
                return false;
            }
            /**
             * 切换添加平台容器与添加按钮的显示状态
             * @return {Boolean} 显示状态
             */
            ,togglePlatform:function(){
                var tmp = this.addPlatformBoxStatus
                    ,tmp2 = this.subjects
                this.layout.get(1).el[
                tmp && "hide" || "show"
                    ]();
                tmp2.addPlatformSubject[
                tmp && "hide" || "show"
                    ]();
                tmp2.addPlatform[
                tmp && "show" || "hide"
                    ]();
                // tmp2.addPlatform.label.el[
                // 	tmp && "show" || "hide"
                // ]();
                this.addPlatformBoxStatus = !this.addPlatformBoxStatus;
                tmp = tmp2 = null;
                return this.addPlatformBoxStatus;
            }
            /**
             * 更改平台时的响应函数
             * @return {String} 新的平台名称
             */
            ,platformChange:function(){
                var dom =  this.subjects.platform;
                var pfe = dom.el[0];
                var options = dom.getOptions();
                var id = dom.getData();
                this.nowPlatformName = util.find(options,id,'_id').Name;
                pfe = null;
                this.subjects.pfName.el.val("_"+this.nowPlatformName);
                return this.nowPlatformName;
            }
            /**
             * 检测输入的产品名
             * @param  {String} name 产品名称
             * @return {String}      产品名称
             */
            ,chkNiceName:function(name){
                if(!this.nowPlatformName){
                    app.alert(LANG("您还未选择产品所属的平台。"));
                }
                name = app.util.trim(name || this.subjects.name.el.val());
                if(!name){
                    // 没输入或输入是空格的话则转回默认名称
                    name = this.config.defName;
                }
                this.subjects.name.el.val(name);
                return name;
            }
            /**
             * 完成
             * @return {Undefined} 无返回值
             */
            ,done:function(){
                if(this.getData()){
                    this.loading.show();
                    app.data.put(
                        this.database
                        ,this.data
                        ,this
                        ,"onSaveData"
                    );
                }
            }
            /**
             * 保存产品数据请求响应函数
             * @param  {Object}    err  错误信息
             * @param  {Object}    data 返回的数据对象
             * @return {Undefined}      无返回值
             */
            ,onSaveData:function(err,data){
                if(this.loading){
                    this.loading.hide();
                }
                if(err){
                    app.alert(err.message);
                    return false;
                }
                // this.reset();
                this.hide();
                if(window.opener && window.opener.app){
                    window.opener.app.core.cast("saveProductSuccess", {"id": data._id});
                }
                var section = this.get("saveNotify");
                if(!section){
                    section = this.buildSaveNotify();
                }else{
                    section.show();
                }
                this.newId = data._id;
            }
            /**
             * 构建添加完成后的界面
             * @return {Object} 添加完成的界面对象
             */
            ,buildSaveNotify:function(){
                if(!this.$.saveNotify){
                    this.create('saveNotify', form.successSection, {
                        'target':this.config.target,
                        'class':'M-formSectionSave P-productSaveSuccess',
                        'title':LANG('保存成功!'),
                        'desc':LANG('您所添加的产品已成功保存。'),
                        'list_title':LANG('您现在可以为其：'),
                        'list': [
                            LANG('添加创意包。'),
                            LANG('添加落地页。')
                        ]
                    });
                    var con = this.get("saveNotify").getContainer();
                    $('<input type="button" data-step="list" class="btnBigGray2" />').val(LANG('产品列表')).appendTo(con);
                    $('<input type="button" data-step="add" class="btnBigGray2" />').val(LANG('添加产品')).appendTo(con);
                    $('<input type="button" data-step="edit" class="btnBigGray2" />').val(LANG('继续编辑产品')).appendTo(con);
                    $('<input type="button" data-step="close" class="btnBigGray2" />').val(LANG('关闭窗口')).appendTo(con);
                    this.dg(con, 'input', 'click', 'eventAfterSave');
                }
                return this.$.saveNotify;
            }
            /**
             * 添加完成后的界面的事件响应函数
             * @param  {Object} evt 事件对象
             * @param  {Object} elm Dom对象
             * @return {Mix}        响应结果
             */
            ,eventAfterSave: function(evt, elm){
                var step = $(elm).attr('data-step')
                    ,hash = window.location.hash;
                switch (step){
                    case 'close':
                        window.close();
                        break;
                    case 'add':
                        if(hash.indexOf("product/add")!== -1){
                            this.show();
                            this.reset();
                        }else{
                            app.navigate('product/add');
                        }

                        break;
                    case 'list':
                        app.navigate('product');
                        break;
                    case 'edit':
                        if(hash.indexOf("product/edit")!== -1){
                            this.show();
                        }else{
                            app.navigate('product/edit/'+this.newId);
                        }
                        break;
                }
                this.$.saveNotify.hide();
            }
            /**
             * 取消
             * @return {Undefined} 无返回值
             */
            ,cancel:function(){
                window.close();
            }
            /**
             * 销毁对象之前的执行函数
             * @return {Undefined} 无返回值
             */
            ,beforeDestroy:function(){
                this.subjects.productTags.destroy();
                this.subjects.uploadThumbnail.destroy();
                this.el.find("*").unbind();
                this.el.empty();
            },
            /**
             * 重写父类hide方法
             * @return {None} 无
             */
            hide: function() {
                // 隐藏成功提示
                var msg = this.child('saveNotify');
                if (msg) {
                    msg.hide();
                }
                AddProduct.master(this, 'hide');
            },
            /**
             * 重置平台
             */
            resetPlatform: function(){
                // 重置平台选项
                this.subjects.platform.setData(null,this.platformData);
                // 重置后缀
                this.subjects.pfName.el.val(this.nowPlatformName);
            }
        }
    );
    exports.add = AddProduct;

    function EditProduct(config){
        this.productDatabase = "/rest/listproduct";
        EditProduct.master(this,null,config);
    }
    extend(
        EditProduct
        ,AddProduct
        ,{
            getNecessary:function(){
                app.data.get(
                    this.productDatabase
                    ,{"Id":this.config.id}
                    ,this
                    ,"onProductGetData"
                );
            }
            ,onPlatformGetData:function(err,data){
                if(err){
                    app.alert(err.message);
                    return false;
                }
                this.platformData = data.items;
                this.build();
                this.setData(this.data);
            }
            ,onProductGetData:function(err,data){
                if(err){
                    app.alert(err.message);
                    return false;
                }
                this.data = data.items[0];
                app.core.get("platform").setPlatform(0,this.data.Id+' '+this.data.Name,null,'editing');
                app.data.get(
                    "/rest/listplatform?all=1"
                    ,this
                    ,"onPlatformGetData"
                );
            }
        }
    );
    exports.edit = EditProduct;

});