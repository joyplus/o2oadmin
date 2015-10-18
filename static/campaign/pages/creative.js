define(function(require, exports){
    var $ = require("jquery")
        ,app = require("app")
        ,view = require("view")
        ,comm = require("common")
        ,linked = require("linked")
        ,taglabels = require("taglabels")
        ,previewMaterial = require("preview_material")
        ,upload = require("upload")
        ,grid = require("grid")
        ,form = require("form")
        ,pop = require("popwin")
        ,crumbs = require("crumbs")
        ,table = require("grid/table")
        ,tab = require('tab')
        ,util = require("util")
        ,materialGraphic = require('materialGraphic')
        ,materialOuterlink = require('materialOuterlink');

    function AddCreative(config,parent,idObject){
        this.config = $.extend(
            {
                "target":"body"
                ,"tag":"div"
                ,"class":"P-creativeAdd"
                ,"data":null
                ,"edit":0
                ,"noButtons": false
            }
            ,config || {}
        );
        this.el = this.createDom(this.config);
        this.config.target = $(this.config.target);

        // 数据接口
        // this.database = "/sweety/addsweety";
        this.database = "/sweety/sweetyedit?method=save";

        // 实例对象
        this.subject = {
            // 名称
            "creativeName":true
            // 上传封面
            ,"uploadThumbnail":true
            // 关联游戏
            ,"linkedGame":true
            // 创意标签
            ,"creativeTags":true
            // 上传素材
            ,"uploadMaterial":true
            // 素材预览
            ,"previewMaterial":true
            // 三方监测
            ,"monitor": true
        }

        // 页面统一UI对象
        this.section = null;

        // 主layout
        this.layout = null;
        // 第一步的容器
        this.stepOneCon = null;
        // 第二步的容器
        this.stepTwoCon = null;
        // 第一步layout
        this.stepOneLayout = null;
        // 第二步layout
        this.stepTwoLayout = null;

        // 步骤
        this.step = null;

        this.nowPageIndex = 0;

        this.ready = 0;

        // 已记录的尺寸
        this.$sizes = {};

        // 重复的尺寸
        this.$multiple = {};

        this.data = {};

        // 素材创意
        this.$creativeData = [];
    }
    extend(
        AddCreative
        ,view.container
        ,{
            init:function(){
                this.config.target.append(this.el);
                this.build();
            }
            ,build:function(){
                if(!this.ready){
                    this.ready = 1;
                    AddCreative.self(this,'buildLayout');
                    AddCreative.self(this,'buildStepOne');

                    if (this.data.Name){
                        this.setData(this.data);
                    }
                }
            }
            /**
             * 素材详细信息加载完成后的事件响应函数
             * @param  {Object}    ev 消息对象
             * @return {Bool}         false
             */
            ,onGetPreviewMaterialSuccess:function(ev){
                if(this.data.Creatives){
                    var data = this.subject.previewMaterial.getData();
                    this.data.CreativeNames = [];
                    for(var n in data){
                        // 尺寸索引
                        this.$sizes[data[n].Width+"x"+data[n].Height] = data[n];
                        this.data.CreativeNames.push(data[n].Name);
                    }
                }
                return false;
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
                        case "stepCancel":
                            this.cancel();
                            break;

                        case "stepUpdate":
                            if(ev.param.mode === "next"){
                                this.nextStep();
                            }else if(ev.param.mode === "back"){
                                this.prevStep();
                            }
                            break;

                        case "stepSave":
                            this.save();
                            break;

                        case "sizeChange":
                            // this.reSize();
                            // this.fire("heightChange");
                            break;

                        case "rename":
                            this.subject.previewMaterial.changePrefix(this.subject.creativeName.el.val());
                            break;
                    }
                    type = null;
                }
            }
            /**
             * 检测上传文件尺寸是否重复
             * @param  {Object}    data 文件信息
             * @return {Undefined}      无返回值
             */
            ,checkFile:function(data){
                if(data){
                    // 有数据时添加到缓存
                    var key = data.Width+"x"+data.Height
                    // 是否没有尺寸冲突
                        ,go = true;
                    for(var n in this.$sizes){
                        if(key === n){
                            this.$multiple[data._id] = data;
                            this.$multiple[data._id].isNew = 1;
                            this.$multiple[this.$sizes[n]._id] = this.$sizes[n];
                            go = false;
                            break;
                        }
                    }
                    // 新的尺寸
                    if(!this.$sizes[key]){
                        this.$sizes[key] = data;
                    }
                    return go;
                }else{
                    // 没数据则做最终检测
                    data = [];
                    for(var m in this.$multiple){
                        data.push(this.$multiple[m]);
                    }
                    if(data.length){
                        if(!this.$.selectOne){
                            // 选择弹出层
                            this.create(
                                "selectOne"
                                ,pop.selectOneCreative
                                ,{
                                    'title':LANG('素材尺寸重复')
                                }
                            );
                            $('<p/>').text(LANG('请选择需要投放的素材，每个尺寸只能选择一个')).appendTo(this.$.selectOne.el.find(".M-popwinHead"));
                        }
                        this.$.selectOne.reset()
                            .show();
                        this.$.selectOne.add(data);
                    }
                }
            }
            /**
             * 尺寸选择完成的响应函数
             * @param  {Object} ev 消息对象
             * @return {Bool}      false
             */
            ,onSelectSizeDone:function(ev){
                var data = ev.param
                    ,pmData = this.$.previewMaterial.data
                    ,key
                    ,id
                    ,deadMan = [];

                for(var i = 0,len = data.del.length;i<len;i++){
                    // 删除重复的素餐
                    for(var n in pmData){
                        if(pmData[n]._id === data.del[i]._id){
                            this.$.previewMaterial.del(data.del[i].indexKey);
                            break;
                        }
                    }
                }

                for(i = 0,len = data.selected.length;i<len;i++){
                    // 处理缓存数据
                    // 索引
                    key = data.selected[i].Width+"x"+data.selected[i].Height;
                    // 原有尺寸的素材id
                    id = this.$sizes[key]._id;

                    // 更新尺寸索引
                    this.$sizes[key] = data.selected[i];

                    // 尝试替换掉原来的冲突的尺寸
                    if(this.data.CreativeIds){
                        for(var j = 0,l = this.data.CreativeIds.length;j<l;j++){
                            if(this.data.CreativeIds[j] === id){
                                this.data.CreativeIds.splice(j,1,data.selected[i]._id);
                                this.data.CreativeNames.splice(j,1,data.selected[i].Name);
                            }
                        }
                        // 尝试添加
                        this.$.previewMaterial.add(data.selected[i],1);
                    }
                }
                this.$multiple = {};

                pmData = data = deadMan = null;
                return false;
            }
            /**
             * 文件上传成功
             * @param  {Object} ev 消息对象
             * @return {Bool}      阻止冒泡
             */
            ,onUploadSuccess:function(ev){
                if(ev.from.config.mode === "material"){
                    // 检测尺寸是否重复
                    this.checkFile(ev.param.data);
                    this.subject.previewMaterial.updateMaterial(ev.param.data);
                }
                return false;
            }
            ,onUploadError: function(ev){
                this.subject.previewMaterial.uploadFailed();
                return false;
            }
            /**
             * 文件上传过程
             * @param  {Object} ev 消息对象
             * @return {Bool}      阻止冒泡
             */
            ,onUploadProgress:function(ev){
                if(ev.from.config.mode === "material"){
                    this.subject.previewMaterial.updateUploadProgress(ev.param.loaded);
                }
                return false;
            }
            /**
             * 文件上传开始
             * @param  {Object} ev 消息对象
             * @return {Bool}      阻止冒泡
             */
            ,onUploadStart:function(ev){
                this.subject.previewMaterial.show();
                if(ev.from.config.mode === "material"){
                    var files = ev.param.files;
                    if(files && files.length){
                        this.subject.previewMaterial.multipleAdd(files);
                    }
                    files = null;
                    if (this.step){
                        this.step.disableSaveBtn();
                    }
                }
                return false;
            }
            /**
             * 上传失败
             * @param  {Object} ev 消息对象
             * @return {Bool}      false
             */
            ,onUploadFail:function(ev){
                if(ev.from.config.mode === "material"){
                    this.subject.previewMaterial.uploadFailed(ev.param);
                }
                return false;
            }
            /**
             * 全部上传完成后
             * @param  {Object} ev 消息对象
             * @return {Bool}      false
             */
            ,onAllUploaded:function(ev){
                this.checkFile();
                if (this.step){
                    this.step.enableSaveBtn();
                }
                return false;
            }
            /**
             * 删除预览的消息处理函数
             * @param  {Object} ev 消息对象
             * @return {Bool}      false
             */
            ,onDelPreviewMaterial:function(ev){
                // if(ev.param.len === 0){
                // 	this.subject.previewMaterial.hide();
                // }

                for(var n in this.$sizes){
                    if(this.$sizes[n]._id == ev.param.id){
                        delete this.$sizes[n];
                        if(this.$multiple[ev.param.id]){
                            delete this.$multiple[ev.param.id];
                        }
                        break;
                    }
                }
                return false;
            },
            save: function() {
                var data = this.getData();

                var count = 0;
                util.each(data.Creatives, function(creative) {
                    count += creative.length;
                });

                if (count <= 0) {
                    app.alert(LANG('请先添加一个创意后再保存'));
                    return false;
                }

                if (!this.subject.uploadMaterialGraphic.validate()){
                    return false;
                }

                if (this.$ayncCallback){
                    // 检查是否有回调函数设置
                    this.$ayncCallback(data);
                    this.$ayncCallback = null;
                }else {
                    // 调用创意包接口保存数据
                    this.showLoading();
                    app.data.put(this.database, data, this, 'afterSave');
                }
            },
            /**
             * 保存数据请求响应函数
             * @param  {Object}    err  错误信息
             * @param  {Object}    data 返回的数据对象
             * @return {Undefined}      无返回值
             */
            afterSave: function(err,data){
                this.hideLoading();
                if (err){
                    if (err.message){
                        app.alert(err.message);
                    }
                    app.error(err);
                }else {
                    this.hide();

                    if(window.opener && window.opener.app){
                        window.opener.app.core.cast("saveCreativeSuccess", {"id": data._id});
                    }
                    var section = this.get("saveNotify");
                    if(!section){
                        section = this.buildSaveNotify();
                    }else{
                        section.show();
                    }

                    this.data = data;
                    // 更新标题
                    app.core.get("platform").setPlatform(
                        0,
                        data._id+' '+data.Name, // 标题
                        null,
                        true // 是否编辑
                    );
                }
            },
            getData: function(){
                var subs = this.subject;
                var creatives = {
                    // flash上传
                    flash: subs.previewMaterial.getData() || [],
                    // 外部链接
                    outerLink: subs.uploadMaterialOuterLink.getData() || [],
                    // 自定义物料
                    custom: subs.uploadMaterialCustom.getData() || [],
                    // 图文创意
                    graphic: subs.uploadMaterialGraphic.getData() || []
                };
                var list = util.clone(this.data);
                var id = (list && (list.Id || list._id)) || 0;
                var data = this.data = {
                    'RefId': list && list.RefId,
                    'Id': id,
                    '_id': id,
                    'Name': subs.creativeName && subs.creativeName.getData() || '',
                    'Thumb': subs.uploadThumbnail && subs.uploadThumbnail.data.Path || '',
                    'Description': '',
                    'Creatives': creatives,
                    'Products': subs.linkedGame && subs.linkedGame.getData() || [],
                    'Label': subs.creativeTags && subs.creativeTags.getData() || [],
                    'AMonitorUrl': [subs.monitor.getData()]
                };

                return data;
            },
            getDataAsync: function(callback){
                this.$ayncCallback = callback;
                this.save();
                return this;
            },
            // 加载数据
            load: function(id){
                this.showLoading();
                app.data.get('sweety/sweetyedit?method=load',{
                    "Id": id,
                    'no_stastic_data': 1
                }, this, 'afterLoad');
                return this;
            },
            afterLoad: function(err, data){
                this.hideLoading();
                if (err){
                    if (err.message){
                        app.alert(err.message);
                    }
                    app.error(err);
                }else {
                    this.setData(data);
                }
            },
            setData: function(data){
                var self = this;
                self.data = data || {};
                if (self.ready){
                    // 设置创意包资料显示
                    var subs = self.$;
                    if (subs.creativeName){
                        subs.creativeName.setData(data && data.Name || '');
                    }
                    // 显示上传图片模块
                    self.stepOneLayout.get(1,1).show();
                    if (subs.uploadThumbnail){
                        subs.uploadThumbnail.setData({
                            'Path': data.Thumb
                        });
                    }

                    if (subs.linkedGame){
                        subs.linkedGame.setData(data.Products);
                    }
                    if (subs.meterialTab){
                        var creatives = data.Creatives || {};
                        if (creatives.flash) {
                            subs.previewMaterial.reset().setData(creatives.flash, true);
                            self.onGetPreviewMaterialSuccess();
                        }
                        if (creatives.outerLink) {
                            subs.uploadMaterialOuterLink.reset().setData(creatives.outerLink);
                        }
                        if (creatives.custom) {
                            subs.uploadMaterialCustom.reset().setData(creatives.custom, data.Id);
                        }
                        if (creatives.graphic) {
                            subs.uploadMaterialGraphic.reset().setData(creatives.graphic, data.Id);
                        }
                        // 设置显示tab
                        for(var name in creatives){
                            if(name){
                                subs.meterialTab.switchTab(name);
                            }
                            break;
                        }

                    }
                    if (subs.creativeTags){
                        subs.creativeTags.setData(data.Label || null);
                    }

                    if (subs.monitor){
                        subs.monitor.setData(data.AMonitorUrl ? data.AMonitorUrl.join('\n') : '');
                    }

                    // 更新标题
                    app.core.get("platform").setPlatform(
                        0,
                        data.Id+' '+data.Name, // 标题
                        null,
                        (data.Id > 0) // 是否编辑
                    );
                }
            },
            // 判断是否是流入的创意包（RefId大于0）
            hasRefId: function(){
                var data = this.data;
                if(data && data.RefId > 0){
                    return true;
                }else{
                    return false;
                }
            },
            showLoading: function(){
                // 显示加载状态
                app.showLoading();
                // 禁用保存按钮
                if (this.step){
                    this.step.disableSaveBtn();
                }
                return this;
            },
            hideLoading: function(){
                app.hideLoading();
                if (this.step){
                    this.step.enableSaveBtn();
                }
                return this;
            }

            /**
             * 构建添加完成后的界面
             * @return {Object} 添加完成的界面对象
             */
            ,buildSaveNotify:function(){
                if(!this.$.saveNotify){
                    this.create('saveNotify', form.successSection, {
                        'target': this.config.target,
                        'class': 'M-formSectionSave',
                        'title': LANG('保存成功!'),
                        'desc': LANG('您所操作的创意包已成功保存，您现在可以为其添加对应的落地页。'),
                        'list_title': LANG('填写说明：'),
                        'list': [
                            LANG('后期如果要增加不同尺寸的同种创意素材，建议上传到此创意包。'),
                            LANG('如果想停用某尺寸创意，可以直接到该创意包的创意列表暂停它。')
                        ]
                    });
                    var con = this.get("saveNotify").getContainer();
                    $('<input type="button" data-step="list" class="btnBigGray2" />').val(LANG('创意包列表')).appendTo(con);
                    $('<input type="button" data-step="add" class="btnBigGray2" />').val(LANG('继续添加创意包')).appendTo(con);
                    $('<input type="button" data-step="edit" class="btnBigGray2" />').val(LANG('继续编辑创意包')).appendTo(con);
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
                var step = $(elm).attr('data-step');
                switch (step){
                    case 'close':
                        window.close();
                        break;
                    case 'add':
                        this.show();
                        this.reset();
                        app.navigate('creative/add');
                        break;
                    case 'list':
                        app.navigate('creative');
                        break;
                    case 'edit':
                        this.show();
                        app.navigate('creative/edit/'+this.data._id);
                        break;
                }
                this.$.saveNotify.hide();
            }
            ,destroy:function(){
                this.creativeTags.destroy();
                this.uploadThumbnail.destroy();
                this.previewMaterial.destroy();
                this.el.find("*").unbind();
                this.el.empty();
                AddCreative.master(this,"destroy");
                var mod = app.core.get("creativeList");
                if(mod){
                    mod.reload();
                }
                mod = null;
            }
            /**
             * 取消
             * @return {Undefined} 无返回值
             */
            ,cancel:function(){
                window.close();
            }
            ,reset:function(){
                this.data = {};
                this.$sizes = {};
                this.$multiple = {};

                if(!this.config.noButtons){
                    this.step.setStep(0);
                }
                for(var n in this.subject){
                    if(n === "creativeName"){
                        var name = LANG("新建创意包_")+util.date("YmdHis");
                        this.$.creativeName.setDefault(name);
                        this.$.creativeName.setData(name);
                    }else{
                        this.subject[n].reset();
                    }
                }
                // 隐藏上传封面模块
                this.stepOneLayout.get(1,1).hide();
                if(this.$.selectOne){
                    this.$.selectOne.reset();
                }
            }
            /**
             * 重写父类hide方法
             * @return {None} 无
             */
            ,hide: function() {
                // 隐藏成功提示
                var msg = this.child('saveNotify');
                if (msg) {
                    msg.hide();
                }
                AddCreative.master(this, 'hide');
            }
        }, {
            /**
             * 构建结构
             * @return {Undefined} 无返回值
             * @private
             */
            buildLayout: function(){
                var tmp = app.config("userModules").addCreative.exclude[app.getUser().type];
                if(tmp){
                    for(var i = 0,len = tmp.length;i<len;i++){
                        delete this.subject[tmp[i]];
                    }
                }


                //当存在参数'noButtons'时，不创建步骤按钮
                if(!this.config.noButtons){
                    // 步骤
                    this.step = this.create(
                        "step"
                        ,form.step
                        ,{
                            "list":[LANG("创意包")]
                            ,"target":this.el
                            ,"btn_target":this.el
                            ,"showStep":0
                        }
                    ).hideBtn('draft');
                }

                this.section = this.create(
                    "Section"
                    ,form.section
                    ,{
                        "target":this.el
                        ,"title":LANG("创意包信息")
                        ,"list_title":LANG("如果需要用于RTB广告活动，则需注意不同RTB对素材尺寸、类型、大小的限制。详情请参考")
                        ,"addon":'<a href="#ads/priceList" target="_blank" >'+LANG("RTB广告位素材要求")+'</p>'
                        ,"list": []
                        ,"bottom":true
                    }
                );

                //当存在参数'noButtons'时，不创建步骤按钮
                if(!this.config.noButtons){
                    this.section.doms.bottom.append(this.step.btns);
                }

                // 主layout
                this.layout = this.create(
                    "pageLayout"
                    ,view.layout
                    ,{
                        "target":this.section.getContainer()
                        ,"grid":[3,1]
                        ,"cellSet":[
                            {"class":"P-pageNavArea"}
                            ,{"class":"P-pageStepCon"}
                            ,{"class":"P-pageCtrlCon"}
                        ]
                    }
                );

                // 第一步的容器
                this.stepOneCon = this.create(
                    "stepOneCon"
                    ,view.container
                    ,{
                        "target":this.layout.get(1,1)
                        ,"class":"P-pageStepNow"
                    }
                );

                // 第二步的容器
                /*this.stepTwoCon = this.create(
                 "stepTwoCon"
                 ,view.container
                 ,{
                 "target":this.layout.get(1,1)
                 ,"class":"P-pageStepNext"
                 }
                 );*/

                // 第一步layout
                this.stepOneLayout = this.create(
                    "stepOneLayout"
                    ,view.layout
                    ,{
                        "target":this.stepOneCon.el
                        ,"grid":[8,1]
                        ,"cellSet":[
                            {"class":"P-pageCon"}
                            ,{"class":"P-pageCon"}
                            ,{"class":"P-pageCon"}
                            ,{"class":"P-pageCon noMarginBottom"}
                            ,{"class":"P-pageCon"}
                            ,{"class":"P-pageCon"}
                            ,{"class":"P-pageCon"}
                            ,{"class":"P-pageCtrlCon"}
                        ]
                    }
                );
            }
            /**
             * 构建第一步
             * @return {Undefined} 无返回值
             * @private
             */
            ,buildStepOne: function(){
                // 名称
                if(this.subject.creativeName){
                    var nameCon = this.create('nameLayout', view.itemLayout,{
                        'target':this.stepOneLayout.get(0,1),
                        'label': LANG('名称：')
                    });

                    this.subject.creativeName = this.create(
                        "creativeName"
                        ,comm.input
                        ,{
                            "target":nameCon.getContainer()
                            ,"type":"text"
                            ,"value": LANG("新建创意包_")+util.date("YmdHis")
                            ,"data-action":"rename"
                            ,"events":"blur"
                        }
                    );
                }

                // 上传封面
                if(this.subject.uploadThumbnail){
                    var thumbCon = this.create('thumbLayout', view.itemLayout,{
                        'target':this.stepOneLayout.get(1,1),
                        'label': LANG('封面：')
                    });

                    this.subject.uploadThumbnail = this.create(
                        "uploadThumbnail"
                        ,upload.porter
                        ,{
                            "target": thumbCon.getContainer()
                            ,"title":null
                            ,"mode":"thumb"
                            ,'tips': LANG('给产品上传封面以便管理，请上传：jpg,png,gif文件。文件尺寸小于1MB。')
                        }
                    );
                    // 隐藏上传封面模块
                    this.stepOneLayout.get(1,1).hide();
                }

                // 关联游戏
                if(this.subject.linkedGame){
                    var linkedCon = this.create('linkedLayout', view.itemLayout,{
                        'target':this.stepOneLayout.get(2,1),
                        'label': LANG('关联产品：')
                    });

                    this.subject.linkedGame = this.create(
                        "linkedGame"
                        ,linked.base
                        ,{
                            "target": linkedCon.getContainer()
                            ,'tips': LANG('关联产品代表该创意包能够使用到哪些产品的推广活动上，可关联1个或多个产品，没有关联该创意包的产品是无法使用它来推广的。')
                        }
                    );

                    // 如果是无产品的，隐藏关联产品
                    var userData = app.getUser();
                    if(userData && userData.campany && (userData.campany.CategoryId == 2)){
                        linkedCon.hide();
                    }else{
                        linkedCon.show();
                    }
                }

                // 素材预览
                if(this.subject.previewMaterial){
                    var tabCon = this.stepOneLayout.get(4,1);
                    tabCon.append($('<label class="labelMeterial"/>').text(LANG('素材：')));

                    // 构建素材选项卡
                    tabCon = this.create('meterialTab',tab.base,{
                        target: tabCon
                        ,list:{
                            "flash":{
                                "text":LANG("上传素材")
                            }
                            ,"outerLink":{
                                "text":LANG("外部链接")
                            }
                            ,"graphic": {
                                "text": LANG("图文创意")
                            }
                            ,"custom":{
                                "text":LANG("自定义物料")
                            }
                        }
                        ,active: 'flash'
                    });

                    var tabFlash = tabCon.getContainer('flash');
                    var tabOuterLink = tabCon.getContainer('outerLink');
                    var tabCustom = tabCon.getContainer('custom');
                    var tabGraphic = tabCon.getContainer('graphic');

                    // 外链模块
                    this.subject.uploadMaterialOuterLink = this.create(
                        "uploadMaterialOuterLink"
                        ,materialOuterlink.main
                        ,{'target': tabOuterLink}
                    );

                    // 本地素材上传模块
                    this.subject.previewMaterial = this.create(
                        "previewMaterial"
                        ,previewMaterial.flash
                        ,{
                            "target":tabFlash
                            ,"progress":true
                            ,"type":"sweety"
                            ,"sender":"uploadMaterial"
                            ,"prefix":this.subject.creativeName.getData()
                        }
                    );
                    // 上传素材
                    if(this.subject.uploadMaterial){
                        var is150 = app.getUserAuth(app.config('auth/sweety_150'));
                        this.subject.uploadMaterial = this.create(
                            "uploadMaterial"
                            ,upload.porter
                            ,{
                                "target":tabFlash
                                ,"preview":0
                                ,"title":null
                                ,"type":is150 ? "sweety150" : "sweety"
                                ,"mode":"material"
                                ,"multiple":1
                                ,"progress":0
                                ,"uploadUrl":"/rest/addsweetycreative"
                                ,'tips': LANG('请上传：jpg,jpeg,png,gif,swf,flv文件。文件尺寸小于%1kb。可批量上传，每个尺寸只能上传一个！', is150 ? 150 : 100)
                            }
                        );
                    }

                    // 自定义物料
                    this.subject.uploadMaterialCustom = this.create(
                        "uploadMaterialCustom"
                        ,materialOuterlink.custom
                        ,{'target': tabCustom}
                    );

                    this.subject.uploadMaterialGraphic = this.create(
                        "uploadMaterialGraphic"
                        ,materialGraphic.main
                        ,{'target': tabGraphic}
                    );

                }

                if(this.subject.monitor){
                    // 代码检测
                    var monitorLayout =  this.create('monitorLayout', view.itemLayout,{
                        'target': this.stepOneLayout.get(5,1),
                        'label': LANG('三方监测：'),
                        'tips': '输入创意包第三方监控调用的URL地址，暂不支持谷歌渠道。'
                    });
                    this.subject.monitor = this.create('monitor', form.input,{
                        'target': monitorLayout.getContainer(),
                        'label': '',
                        'width':400
                    });
                }

                // 创意标签
                if(this.subject.creativeTags){
                    this.subject.creativeTags = this.create(
                        "creativeTags"
                        ,taglabels.base
                        ,{
                            "target":this.stepOneLayout.get(6,1)
                            ,"collapse":0
                            ,"label":LANG('标签：')
                            ,"tips":LANG('给创意包贴上标签，方便管理。多个标签用“,”分开')
                        }
                    );
                }
            }
        }
    );
    exports.addCreative = AddCreative;


    // 创意板块页面
    function List(config, parent){
        List.master(this);
    }
    extend(List, view.container, {
        init: function(){
            this.render();
            // 时间段控件
            var date = require('views/datebar');
            this.create('date', date.datepicker, {target: this.el});
            // 选项卡控件
            var tab = require('tab');
            this.create('tab', tab.base, {
                'list':{
                    'sweety':{
                        text: LANG('创意包'),
                        action: 'creative/sweetyList'
                    },
                    'whisky':{
                        text: LANG('落地页'),
                        action: 'whisky/list'
                    }
                }
            });
        }
    })
    exports.main = List;

    // 创意包列表
    function Sweety(config, parent){
        config = $.extend(
            true
            ,{
                "grid":{
                    'functional':{
                        render:this.renderFunctional
                        ,where: 1
                        ,context:this
                    }
                    ,"customParam":{}
                    ,'hasAdvancedSearch': true
                    // 批量操作
                    ,"batch":{
                        "enable":true
                        ,"list":[
                            {
                                "text":LANG("设置")
                                ,"type":"setting"
                                ,"subs":[
                                {"text":LANG("创意包名称关键词替换"),"type":"keywordReplace","mode":"pop","render":this.batchRender}
                            ]
                            }
                            ,{
                                "type":"disabled"
                                ,"text":LANG("暂停")
                            }
                            ,{
                                "type":"enable"
                                ,"text":LANG("开始")
                            }
                            ,{
                                "type":"store"
                                ,"text":LANG("归档")
                            }
                            ,{
                                "type":"recovery"
                                ,"text":LANG("还原")
                            }
                            ,{
                                "type":"export"
                                ,"text":LANG("下载")
                            }
                        ]
                    }
                }
                ,"hasDate":true
                ,"hasAdd":true
                ,"hasTags":true
                ,"hasVerifyPage":true
            }
            ,config
        );
        Sweety.master(this,null,config);
        this.$readOnly = false;
    }
    extend(Sweety, view.container, {
        init: function(){
            this.render();

            // 时间段控件
            var date = require('views/datebar');
            if(this.config.hasDate){
                this.create('date', date.datepicker, {target: this.el});
            }

            var labelCon = $('<div class="P-sweetyLabelCon"/>').appendTo(this.el);
            // 标签过滤
            if(this.config.hasTags){
                this.tags = this.create(
                    "sweetyTags"
                    ,taglabels.simple
                    ,{
                        "target":labelCon
                    }
                );
            }
            // 状态过滤
            this.create(
                "status"
                ,taglabels.listType
                ,{
                    "target":labelCon
                    ,"all_label":LANG('未归档')
                    ,'title': LANG('状态：')
                    ,'data': [null, LANG('已归档'), LANG('进行中'), LANG('已暂停'),LANG('所有')]
                }
            );

            if(this.config.hasVerifyPage){
                this.verifyBtn = this.create(
                    "verifyBtn"
                    ,view.container
                    ,{
                        "target":this.el
                        ,"tag":"button"
                        ,"class":"P-sweetyVerifyBtn btn"
                        ,"html":LANG('查看审核结果')
                    }
                );
                this.jq(this.verifyBtn.el,"click","onButtonClick");
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
                        ,"html":"<em></em>"+LANG('添加创意包')
                    }
                );
                this.jq(this.addBtn.el,"click","onButtonClick");
            }

            // 设置状态
            this.onUserChange();

            // 列表
            this.grid = this.create(
                'grid'
                ,grid.sweety
                ,this.config.grid
            );
        },
        // 用户切换更新列表记录
        onUserChange:function(ev){
            var user = app.getUser();
            this.$readOnly = (!user || user.auth <= 1);
            if (this.addBtn){
                if (this.$readOnly){
                    this.addBtn.hide();
                }else {
                    this.addBtn.show();
                }
            }
            if (this.grid){ this.grid.load(); }
        },
        load: function(param,sub_param){
            if(util.isObject(sub_param)){
                sub_param = sub_param.sub_param || "";
            }
            this.grid.reload(null,param,sub_param);
        },
        /**
         * 表格操作列格式化函数
         * @param  {Number}    index 当前行数
         * @param  {Mix}       value 单元格对应的数据
         * @param  {Object}    row   当前行对应的数据
         * @return {Undefined}       无返回值
         */
        renderFunctional: function(index, value, row){
            var html = '';

            if (row.IsDeleted){
                html += '<a data-func="none" title="'+LANG("已归档")+'" href="#"><em class="G-iconFunc store"/></a>';
                if (!this.$readOnly){
                    html += '<a data-func="restore" title="'+LANG("还原")+'" href="#"><em class="G-iconFunc restore"/></a>';
                }
                html += '<a href="#/creative/detail/'+row._id+'" target="_blank"><em title="'+LANG("详情")+'" class="G-iconFunc list"></em></a>';
                return html;
            }

            switch (row.Status){
                case 1:
                    html += '<a data-func="none" title="'+LANG("进行中")+'" href="#"><em class="G-iconFunc runing"/></a>';
                    break;
                case 2:
                    html += '<a data-func="none" title="'+LANG("已暂停")+'" href="#"><em class="G-iconFunc suspend"/></a>';
                    break;
                default:
                    html += '<a data-func="none" title="'+LANG("无效")+'" href="#"><em class="G-iconFunc done"/></a>';
                    break;
            }
            html += '<span class="spacing"></span>';

            // 暂停按钮
            if (!this.$readOnly){
                switch (row.Status){
                    case 1:
                        html += '<a data-func="disable" href="#"><em title="'+LANG("暂停")+'" class="G-iconFunc pause"></em></a>';
                        break;
                    case 2:
                        html += '<a data-func="enable" href="#"><em title="'+LANG("恢复")+'" class="G-iconFunc resume"></em></a>';
                        break;
                    default:
                        html += '<a><em title="'+LANG("无效")+'" class="G-iconFunc invaild"></em></a>';
                        break;
                }
            }
            html += '<a href="#/creative/creativeList/'+row._id+'" target="_blank"><em title="'+LANG("创意")+'" class="G-iconFunc creative"></em></a>';
            html += '<a href="#/creative/creativeVerifyList/'+row._id+'" target="_blank"><em title="'+LANG("创意审核")+'" class="G-iconFunc creativeVerify"></em></a>';
            html += '<a href="#/creative/detail/'+row._id+'" target="_blank"><em title="'+LANG("详情")+'" class="G-iconFunc list"></em></a>';
            // 下载按钮
            html += '<a href="'+app.util.formatIndex(app.config("download_page"),"Sweety",row._id)+'" target="_blank"><em title="'+LANG("下载")+'" class="G-iconFunc download"></em></a>';


            if (!this.$readOnly){
                // 归档按钮
                html += '<a href="#" data-func="store" title="'+LANG("归档")+'"><em class="G-iconFunc store"/></a>';
                // 编辑按钮, 动态创意不显示编辑
                if (row.ShowType != 2){
                    html += '<a href="#/creative/edit/'+row._id+'" target="_blank"><em title="'+LANG("编辑")+'" class="G-iconFunc edit"></em></a>';
                }
                // 删除按钮
                // html += '<a href="#" data-func="remove"><em title="'+LANG("删除")+'" class="G-iconFunc trash"></em></a>';
            }
            return html;
        },
        /**
         * 标签点击事件响应函数
         * @param  {Object}    ev 消息对象
         * @return {Undefined}    无返回值
         */
        onSimpleLabelChange:function(ev){
            if (ev.param){
                this.grid.setParam({'Label':JSON.stringify(ev.param)});
            }else {
                this.grid.setParam({'Label':null});
            }
            this.grid.load();
        },
        /**
         * 状态过滤响应
         * @param  {Object}    ev 消息对象
         * @return {Undefined}    无返回值
         */
        onListTypeChange: function(ev){
            var type = +ev.param.type;
            var grid = this.grid;
            if (ev.name == 'status'){
                var param = {'ListAll': null, 'IsDeleted': null, 'Status':null};
                switch (type){
                    case 1:
                        param.IsDeleted = true;
                        grid.setSort('UpdateTime', 'desc')
                        break;
                    case 2:
                        param.Status = 1;
                        break;
                    case 3:
                        param.Status = 2;
                        break;
                    case 4:
                        param.ListAll = 1;
                        break;
                }
                grid.setParam(param);
            }
            grid.setPage(1);
            grid.load();
            return false;
        },
        /**
         *
         * 添加按钮
         * @param  {Object}    ev 消息对象
         * @return {Undefined}    无返回值
         */
        onButtonClick: function(ev){
            // app.navigate("creative/addSweety");
            var clsReg = /P-sweety(\w+)/;
            var m = ev.target.className.match(clsReg),hash ='#/creative/';
            if(m[1]){
                switch(m[1]) {
                    case 'AddBtn':
                        hash += "add";
                        break;
                    case 'VerifyBtn':
                        hash += "sweetyVerifyList";
                        break;
                }
                window.open(window.location.href.split('#',1)+hash);
            }
            return false;
        },
        /**
         * 表格行操作按钮处理函数
         * @param  {Object}    ev 消息对象
         * @return {Undefined}    无返回值
         */
        onListFnClick: function(ev){
            var self = this;
            var param = ev.param;
            var id = param.data._id;
            switch (param.func){
                case 'disable':
                case 'enable':
                    param.Status = (param.func == 'disable' ? 2 : 1);
                    app.data.get(
                        '/rest/stopsweety',
                        {'Id':id,'Status':param.Status},
                        this.cbSetStatus, this, param
                    );
                    break;
                case 'store':
                    app.confirm(LANG('真的要归档这个创意包记录吗?'),function(isOK){
                        if(isOK){
                            app.data.del(
                                '/rest/deletesweety',
                                {'Id': id},
                                self.cbStore, self, param
                            );
                        }
                    });
                    break;
                case 'restore':
                    app.confirm(LANG('真的要取消这个创意包记录的归档吗?'),function(isOK){
                        if(isOK){
                            app.data.del(
                                '/rest/recyclesweety',
                                {'Id': id},
                                self.cbStore, self, param
                            );
                        }
                    });
                    break;
                /*case 'remove':
                 app.confirm(LANG('真的要删除这个创意包吗?'),function(isOK){
                 if(isOK){
                 param.IsDeleted = 0;
                 app.data.del(
                 '/rest/deletesweety',
                 {'Id': id},
                 self.cbRemove, self, param
                 );
                 }
                 });
                 break;*/
                case 'edit':
                    if(app.util.isFunc(this.edit)){
                        this.edit(id,param.data);
                    }
                    break;
            }
            return false;
        },
        /**
         * 状态设置回调
         * @param  {Object}    err   错误信息回调
         * @param  {Object}    data  返回的数据
         * @param  {Object}    param 列表行对应的数据
         * @return {Undefined}       无返回值
         */
        cbSetStatus: function(err, data, param){
            if (err){
                app.alert(err.message);
                return false;
            }
            this.grid.setRow(param.index, 'Status', param.Status);
        },
        /**
         * 归档回调
         * @param  {Object}    err   错误信息回调
         * @param  {Object}    data  返回的数据
         * @param  {Object}    param 列表行对应的数据
         * @return {Undefined}       无返回值
         */
        cbStore: function(err, data, param){
            if (err){
                app.alert(err.message);
                return false;
            }
            this.grid.load();
        },
        /**
         * 删除回调
         * @param  {Object}    err   错误信息回调
         * @param  {Object}    data  返回的数据
         * @param  {Object}    param 列表行对应的数据
         * @return {Undefined}       无返回值
         */
        cbRemove: function(err, data, param){
            if (err){
                app.alert(err.message);
                return false;
            }
            this.grid.removeRow(param.index);
        },
        onSaveCreativeSuccess: function(ev) {
            this.grid.load();

            if (ev.param && ev.param.id) {
                this.grid.setRowHighlight(ev.param.id);
            }
        },
        /**
         * 批量操作弹出层渲染函数
         * @param  {Object} conf 弹出层设置
         * @param  {Object} body 弹出层内容区域dom对象
         * @return {Object}      添加后的模块外部容器dom对象
         */
        batchRender:function(conf,body){
            var re;
            switch(conf.type){
                case "keywordReplace":
                    re = this.create(
                        conf.type
                        ,form.keywordReplace
                        ,{
                            "label":LANG('关键字替换')
                            ,"target":body
                        }
                    );
                    break;
            }
            return re.el;
        },
        /**
         * 批量更新活动
         * @param  {Object} param 请求参数
         * @return {Object}       模块实例
         */
        batchUpdate:function(param){
            app.data.get(
                "/rest/batchOperation"
                ,param
                ,this
                ,"onBatchCallback"
            );
            return this;
        },
        /**
         * 确认批量操作
         * @param  {Object} ev 消息对象
         * @return {Bool}      false
         */
        onBatchConfirm:function(ev){
            var type = ev.param.type
                ,data = ev.param.data
            if(data.length){
                var param;
                switch(type){
                    case "keywordReplace":
                        var val = this.get('grid/batch/normal/' + type);
                        val = (val && val.getData) ? val.getData() : null;
                        param = {
                            'Action': 'sweety'
                            ,'Type': 'update'
                            ,'Ids': data.toString()
                        }
                        param = $.extend(param, val);
                        this.batchUpdate(param);
                        break;

                    case "disabled":
                        this.batchUpdate({
                            'Action': 'sweety'
                            ,'Type': 'stop'
                            ,'Status': 2
                            ,'Ids': data.toString()
                        });
                        break;

                    case "enable":
                        this.batchUpdate({
                            'Action': 'sweety'
                            ,'Type': 'stop'
                            ,'Status': 1
                            ,'Ids': data.toString()
                        });
                        break;

                    case "store":
                        this.batchUpdate({
                            'Action': 'sweety'
                            ,'Type': 'delete'
                            ,'Ids': data.toString()
                        });
                        break;

                    case "recovery":
                        this.batchUpdate({
                            'Action': 'sweety'
                            ,'Type': 'recycle'
                            ,'Ids': data.toString()
                        });
                        break;

                    case "export":
                        var url = app.data.resolve("/rest/batchOperation", {
                            'Action': 'sweety'
                            ,'Type': 'export'
                            ,'Ids': data.toString()
                            ,"begindate":this.grid.sys_param.begindate
                            ,"enddate":this.grid.sys_param.enddate
                            ,"order":this.grid.sys_param.order
                            ,"tmpl":"export"
                        });
                        if (url){
                            window.location.href = url;
                        }
                        break;
                }
            }else{
                app.alert(LANG("请先选择一个或多个创意包。"));
            }

            this.resetModule(type);
            return false;
        },
        /**
         * 取消批量操作
         * @param  {Object} ev 消息对象
         * @return {Bool}      false
         */
        onBatchCancel:function(ev){
            this.grid.setSelectRowIds([]);
            this.resetModule(ev.param.type);
            ev = null;
            return false;
        },
        /**
         * 尝试重置指定的模块
         * @param  {String} type 模块名称
         * @return {Object}      模块实例
         */
        resetModule:function(type){
            var mod = this.get('grid/batch/normal/' + type);
            if (mod && mod.reset){
                mod.reset();
            }
            return this;
        },
        /**
         * 批量操作请求成功后的回调函数
         * @param  {Object}    err  错误信息对象
         * @param  {Object}    data 操作结果数据对象
         * @return {Undefined}      无返回值
         */
        onBatchCallback:function(err,data){
            if(err){
                alert(err.message);
                return;
            }
            var msg;
            if(data.fail.length){
                data = data.fail;
                msg = LANG("%1个创意包处理失败\n",data.length);
                for(var i = 0,l = data.length;i<l;i++){
                    msg += data[i].Id+","+data[i].message+"\n";
                }
                app.alert(msg);
            }else{
                app.alert(LANG('修改成功'));
            }


            this.grid.setSelectRowIds([]);
            this.grid.load();

            // 修改后，改变行为绿色
            if(data && data.success.length){
                util.each(data.success, function(item, idx){
                    if(item){
                        this.grid.setRowHighlight(item.Id);
                    }
                }, this);

            }
            msg = data = null;
        }
    });
    exports.sweety = Sweety;

    // 创意列表
    function CreativeList(config){
        this.config = $.extend({
            "class":"P-creativeList"
        },config);
        CreativeList.master(this,null,this.config);
    }
    extend(
        CreativeList
        ,Sweety
        ,{
            init: function(){
                this.render();
                // 时间段控件
                var date = require("views/datebar");

                this.create(
                    "date"
                    ,date.datepicker
                    ,{
                        "target":this.el
                    }
                );

                this.crumbs = this.create(
                    "crumbs"
                    ,crumbs.base
                    ,{
                        "target":this.el
                        ,"param":{
                            "Id":this.config.param.SweetyId
                        }
                        ,"now":{
                            "name":LANG("创意列表")
                        }
                    }
                );

                // 标签过滤
                this.tags = this.create(
                    "sweetyTags"
                    ,taglabels.multi
                    ,{
                        "target":this.el
                        ,"param":{
                            "Id":this.config.param.SweetyId
                        }
                        ,"tagContainer":{
                            "inClass":"wraper"
                        }
                        ,"collapse": true
                    }
                );

                // 更新状态
                this.onUserChange();

                var con = $('<div class="creativeListAddCon"></div>').appendTo(this.el);
                this.create(
                    "addButton"
                    ,comm.button
                    ,{
                        "html":'<em></em>'+LANG("添加创意")
                        ,"class":"btnAddGreen"
                        ,"target":con
                    }
                );

                // 列表
                this.grid = this.create(
                    'grid'
                    ,grid.sweetyCreative
                    ,{
                        'functional':{
                            render:this.reanderFunctional
                            ,where: 1
                            ,context:this
                        }
                        ,"param":this.config.param
                    }
                );

                con = null;
            }
            /**
             * 添加按钮响应函数
             * @param  {Object} ev 消息对象
             * @return {Bool}      false
             */
            ,onButtonClick:function(ev){
                window.open("#creative/uploadSweetyCreative/"+this.config.param.SweetyId);
                return false;
            }
            // 用户切换更新列表记录
            ,onUserChange:function(ev){
                var user = app.getUser();
                this.$readOnly = (!user || user.auth <= 1);
                if (this.grid){ this.grid.load(); }
            }
            ,reanderFunctional: function(index, value, row){
                var html = '';

                if(row.Status !== undefined){
                    if (row.Status == 2){
                        html += '<a data-func="none" title="'+LANG("已暂停")+'" href="#"><em class="G-iconFunc suspend"/></a>';
                    }else {
                        html += '<a data-func="none" title="'+LANG("进行中")+'" href="#"><em class="G-iconFunc runing"/></a>';
                    }
                    html += '<span class="spacing"></span>';
                }

                if(!this.$readOnly){
                    // 暂停按钮
                    if (row.Status == 2){
                        html += '<a data-func="enable" href="#"><em title="'+LANG("恢复")+'" class="G-iconFunc resume"></em></a>';
                    }else {
                        html += '<a data-func="disable" href="#"><em title="'+LANG("暂停")+'" class="G-iconFunc pause"></em></a>';
                    }
                }

                html += '<a href="'+app.util.formatIndex(app.config("download_page"),"SweetyCreative",row._id)+'" target="_blank"><em title="'+LANG("下载")+'" class="G-iconFunc download"></em></a>';
                if (this.$readOnly){ return html; }

                // 编辑按钮
                html += '<a data-func="edit" href="#"><em title="'+LANG("编辑")+'" class="G-iconFunc edit"></em></a>';
                // 删除按钮
                html += '<a data-func="remove" href="#"><em title="'+LANG("删除")+'" class="G-iconFunc trash"></em></a>';
                return html;
            }
            /**
             * 表格行操作按钮处理函数
             * @param  {Object}    ev 消息对象
             * @return {Undefined}    无返回值
             */
            ,onListFnClick: function(ev){
                var self = this;
                var param = ev.param;
                var id = param.data._id;
                switch (param.func){
                    case 'disable':
                    case 'enable':
                        param.Status = (param.func == 'disable' ? 2 : 1);
                        app.data.get(
                            '/rest/stopsweetycreative',
                            {'Id':id,'Status':param.Status},
                            this.cbSetStatus, this, param
                        );
                        break;
                    case 'remove':
                        app.confirm(LANG('真的要删除这个创意吗?'),function(isOK){
                            if(isOK){
                                param.IsDeleted = 0;
                                app.data.del(
                                    '/rest/deletesweetycreative',
                                    {'Id': id},
                                    self.cbRemove, self, param
                                );
                            }
                        });
                        break;
                    case 'edit':
                        if(app.util.isFunc(this.edit)){
                            this.edit(id,param.data);
                        }
                        break;
                }
                return false;
            }
            /**
             * 标签点击事件响应函数
             * @param  {Object}    ev 消息对象
             * @return {Undefined}    无返回值
             */
            ,onLabelChange:function(ev){
                var param = {
                    "FilterIds":JSON.stringify(ev.param.data)
                    ,"page":1
                };
                this.grid.setParam(param);
                this.grid.load();
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
                        ,pop.editSweetyCreative
                        ,{
                            "data":data
                            ,"creativeData":this.crumbs.data
                        }
                    );
                    this.pop.show();
                }else{
                    this.pop.show(data);
                }
            }
            /**
             * 重载
             * @param  {Number}    data 数据ID
             * @return {Undefined}      无返回值
             */
            ,reload:function(data){
                data = data || this.config.param.SweetyId;
                this.grid.setParam({"SweetyId":data});
                this.grid.load();
                this.crumbs.reload({"Id":data});
                this.tags.refresh({"Id":data});
            }
            /**
             * 编辑完成的响应函数
             * @param  {Object}    ev 消息对象
             * @return {Undefined}    无返回值
             */
            ,onEditDone:function(ev){
                this.reload();
            }
        }
    );
    exports.creativelist = CreativeList;

    function Detail(config){
        Detail.master(this,null,config);
        this.defImg = "resources/images/default.png";
        this.thumbPath = "sweety/imageshow";
        this.database = "sweety/sweetyedit?method=save";
        this.proDatabase = "/rest/listproduct";
        this.data = null;
    }
    extend(
        Detail
        ,view.container
        ,{
            init:function(){
                Detail.master(this,"init");
                this.build();
                this.getData();
            }
            /**
             * 界面构造函数
             * @return {Undefined} 无返回值
             */
            ,build:function(){

                this.section = this.create(
                    "section"
                    ,form.section
                    ,{
                        "target":this.el
                        ,"title":LANG("加载中")
                    }
                );

                this.layout = this.create(
                    "layout"
                    ,view.layout
                    ,{
                        "target":this.section.getContainer()
                        ,"grid":[5,1]
                        ,"cellSet":[
                            {"class":"P-pageCon","html":'<label>'+LANG("封面:")+'</label><div class="M-upload"><div class="uploadPreview"><div><img src="'+this.defImg+'" /></div></div></div>'}
                            ,{"class":"P-pageCon","html":'<label>'+LANG("关联游戏:")+'</label><div class="M-linkedGame"></div>'}
                            ,{"class":"P-pageCon","html":'<label>'+LANG("标签:")+'</label><div></div>'}
                            ,{"class":"P-pageCon","html":'<label>'+LANG("素材:")+'</label><div></div>'}
                        ]
                    }
                );

                this.name = this.section.doms.title;

                this.thumb = this.layout.get(0,1).find(".uploadPreview");
                this.thumb.show();
                this.thumb = this.thumb.find("img:first");

                this.linked = this.layout.get(1,1).find(".M-linkedGame");

                this.labels = this.layout.get(2,1).find("div:first");

                this.previewMaterial = this.create(
                    "previewMaterial"
                    ,previewMaterial.base
                    ,{
                        "target":this.layout.get(3,1)
                        ,"allowDel":0
                    }
                );
            }
            /**
             * 获取创意数据
             * @return {undefined} 无返回值
             */
            ,getData:function(){
                app.data.get(
                    this.database
                    ,this.config.param
                    ,this
                );
            }
            /**
             * 获取创意响应函数
             * @param  {Object}    err  错误消息对象
             * @param  {Object}    data 数据对象
             * @return {Undefiend}      无返回值
             */
            ,onData:function(err,data){
                if(err){
                    app.alert(LANG(err.message));
                    return false;
                }
                this.setData(data.total && data.items[0] || {});
            }
            /**
             * 设定数据
             * @param {Obejct}    data 数据对象
             * @return {Undefined}     无返回值
             */
            ,setData:function(data){
                this.data = data;
                this.name.text(this.data.Name);
                this.thumb.attr("src",app.config("front_base")+this.thumbPath+"?Width=160&Height=160&Path="+this.data.Thumb);

                this.getLinkedData(this.data.Products);

                this.labels.text(this.data.Label);
                this.previewMaterial.config.data = this.data.CreativeIds;
                this.previewMaterial.load();
            }
            /**
             * 获取关联产品数据
             * @param  {Array}     data 关联产品ID数组
             * @return {Undefined}      无返回值
             */
            ,getLinkedData:function(data){
                app.data.get(
                    this.proDatabase
                    ,{
                        "Ids":data.toString()
                    }
                    ,this
                    ,"onLinkedDataLoad"
                );
            }
            /**
             * 获取关联产品数据响应函数
             * @param  {Object}    err  错误消息对象
             * @param  {Object}    data 数据对象
             * @return {Undefiend}      无返回值
             */
            ,onLinkedDataLoad:function(err,data){
                if(err){
                    app.alert(LANG(err.message));
                    return false;
                }

                if(data.total){
                    for(var i = 0;i<data.total;i++){
                        this.linked.append(
                            _buildLinkBlock(data.items[i])
                        );
                    }
                }
            }
            /**
             * 重置
             * @return {Undefiend} 无返回值
             */
            ,rest:function(){
                this.data = {};
                this.name.text("");
                this.thumb.attr("src",this.defImg);
                this.linked.empty();
                this.labels.text("");
                this.previewMaterial.reset();
            }
            /**
             * 重载
             * @param  {Object}    param 获取数据的参数
             * @return {Undefined}       无返回值
             */
            ,reload:function(param){
                this.rest();
                if(param){
                    this.config.param = param;
                }
                this.getData();
            }
        }
    );
    function _buildLinkBlock(data){
        return '<div class="linkedsItem"><div class="linkGame"><div><img src="'+data.Thumb+'" data-type="Thumb" alt=""></div></div></div><div class="linkGameName" style="display: block;"><p title="data.Name">'+data.Name+'</p></div>';
    }
    exports.detail = Detail;

    //审核状态列表
    var VerifyList = app.extend(
        view.container
        ,{
            init:function(config, parent){
                config = $.extend(true, {
                    'class': 'P-creativeVerify',
                    'target': parent,
                    'hasPager':false,
                    'auto_load': 1, //自动加载 app.data.get
                    'url': '/rest/listsweetycreative',
                    'param': { //参数
                        no_stastic_data: 1,
                        order: 'CreateTime|-1'
                    },
                    'isLoadSweety':true,
                    'data': null  //静态数据
                }, config);
                VerifyList.master(this, null, config);
                VerifyList.master(this, 'init');
                this.param = this.config.param;
                this.build();
                this.load();
                this.$base = app.config("front_base");
            },
            build:function(){
                //创意包信息
                var dom = this.$title = $('<div class="P-creativeVerifyTitle"><img/><h1></h1></div>').appendTo(this.el);
                util.imageError(dom.find('img:first'), 'product');

                // 合并RTB项目
                var cols = [
                    {name:'Id',text:LANG("ID"),width:"5%"},
                    'CreativeNameWithThumb'
                ];
                // var width = Math.round(80 / app.config('exchanges').length) + '%';
                util.each(app.config('exchanges'), function(ex){
                    cols.push({
                        name: 'VerifyResult',
                        text: LANG('%1审核状态', LANG(ex.name)),
                        render: 'renderStatus',
                        align: 'center',
                        width: 100,
                        param: ex.alias_id || ex.id
                    });
                }, this);

                // 刷新按钮
                var refresh = $('<button class="btn" style="float:right;margin: 10px 0 -40px;">'+LANG("刷新")+'</button>').appendTo(this.el);
                this.jq(refresh, 'click', 'eventRefresh');

                //主表格
                this.create("search", comm.search, {target: this.el});
                this.$table = this.create("table",table.list,{
                    "target": this.el,
                    "cols": cols
                });
                if(this.config.hasPager){
                    this.pager = this.create('pager', comm.pager, this.config.pager);
                    this.param.page = this.pager.page;
                    this.param.limit = this.pager.size;
                }

                this.dg(this.$table.el,'div.rejectReason','mouseenter mouseleave','eventRejectReason');
                this.dg(this.el, '.M-grid-thumb img', 'mouseenter mouseleave imageLoad imageError', 'showPreviewImage');
            },
            showPreviewImage: function(evt,el){
                var tip  = this.get('previewImage');
                el = $(el);
                switch (evt.type){
                    case 'mouseenter':
                        //链接地址
                        if (el.attr('data-ready') !== '1'){ break; }
                        //图片地址
                        var href = el.attr('data-origin');
                        var img = util.imageThumb(href, 200, 200);
                        var html = '<a href='+ href +' target="_blank"><img width="200" src='+ img +'></a>';
                        //弹出框
                        if (!tip){
                            tip = this.create('previewImage', pop.tip, {
                                'width': 'auto',
                                'data': html,
                                'pos':'bm',
                                'anchor': el,
                                'autoHide': 1,
                                'outerHide': 1,
                                'class':'M-tip'
                            });
                        }else {
                            tip.reload({data:html, anchor: el});
                        }
                        tip.show();
                        break;
                    case 'mouseleave':
                        if (tip){ tip.delayHide(500); }
                        break;
                    case 'imageLoad':
                        el.attr('data-ready', '1');
                        break;
                    case 'imageError':
                        el.attr('data-thumb', null);
                        break;
                }
            },
            /**
             * 审核栏渲染函数
             * @param  {Array}     val   要查找的数组
             * @param  {Mix}       value 查询依据数据
             * @param  {String}    field 查询的关键字段"ExchangeId"
             */
            renderStatus: function(index, val, row, col){
                var v = util.find(val, col.param, "ExchangeId");
                var level = '';
                if(v){
                    if(util.exist(app.config('exchange_group/tanx'), v.ExchangeId)){
                        // tanx创意等级；
                        level = {
                                1: LANG('一级创意'),
                                99: LANG('普通创意')
                            }[row.Level || 99] || '';
                    }
                }

                if(v){
                    switch(v.Status){
                        case 1 :
                            return '<div title="'+LANG("通过")+'" data-mode="sub" class="icon done"></div>'+'<span class="level">'+level+'</span>';
                        case 0 :
                            return '<div title="'+LANG("待审核")+'" data-mode="sub" class="icon wait"></div>';
                        case -2 :
                            return '<div title="'+LANG("审核中")+'" data-mode="sub" class="icon ing"></div>';
                        case -1 :
                            var html = '<div title="'+LANG("未通过")+'" data-mode="sub" class="icon rejectReason ';
                            html += v.RejectReason.indexOf('系统判断：') === 0 ? 'sys' : 'err';
                            html += '" data-reason="'+util.html(v.RejectReason)+'"/>';
                            return html;
                    }
                }else{
                    return null;
                }
            },
            // 审核结果显示
            eventRejectReason: function(evt, elm){
                var tip  = this.get('rejectReasonTip');
                switch (evt.type){
                    case 'mouseenter':
                        elm = $(elm);
                        var rejectReason = elm.attr("data-reason");

                        if (!tip){
                            tip = this.create('rejectReasonTip', pop.tip, {
                                'width': 300,
                                'pos': 'ml',
                                'anchor': elm,
                                'autoHide': 1,
                                'outerHide': 1
                            });
                            this.$tipContent = $('<div class="con"/>').appendTo(tip.body);
                        }else{
                            tip.reload({anchor: elm});
                        }
                        this.$tipContent.text(rejectReason);
                        tip.show();
                        break;
                    case 'mouseleave':
                        if (tip){ tip.delayHide(500); }
                        break;
                }
                return false;
            },
            eventRefresh: function(){
                this.load();
            },
            load:function(param){
                var c = this.config;
                c.param = util.merge(c.param, param);
                //抓取创意信息
                app.data.get(c.url, c.param, this);
                //抓取创意包信息
                if(c.isLoadSweety){
                    app.data.get('/rest/listsweety', {
                        "Id":c.param.SweetyId,
                        "no_stastic_data":1
                    }, this, 'onTitleInfo');
                }
                this.$table.showLoading();
            },
            onData:function(err,data){
                if(err){
                    app.alert(LANG(err.message));
                    return false;
                }
                if(this.pager){
                    this.pager.setup({
                        'total':data.total,
                        'size':(data.size||undefined),
                        'page':(data.page||undefined)
                    })
                }
                this.setData(data.items);
            },
            onTitleInfo: function(err,data){
                if(err){
                    app.alert(LANG(err.message));
                    return false;
                }
                this.setDataTitleInfo(data.items[0]);
            },
            setData:function(data){
                this.$table.setData(data);
            },
            setDataTitleInfo:function(data){
                //TODO?是否要添加"标签"信息？
                var dom = this.$title.show();
                if(data){
                    dom.find('img:first').attr('src', this.$base + data.Thumb);
                    dom.find('h1:first').text(data.Name);
                }
            },
            onChangePage: function(ev){
                if (this.pager){
                    this.param.page = ev.param;
                    this.param.limit = this.pager.size;
                    this.load();
                }
                return false;
            },
            onSearch: function(ev){
                if (ev.param){
                    this.param.Word = ev.param;
                }else {
                    delete this.param.Word;
                }
                this.load();
                return false;
            }
        }
    );
    exports.verifyList = VerifyList;

    var SweetyVerifyList = app.extend(view.container,{
        init:function(config){
            config = $.extend({
                'class':'P-sweetyVerifyList'
            },config);
            SweetyVerifyList.master(this,null,config);
            SweetyVerifyList.master(this,'init',config);
            this.build();
        }
        ,build:function(){
            this.tab = this.create('tab',tab.verifyTab,{target:this.el})
        }
    })
    exports.sweetyVerifyList = SweetyVerifyList;


    var UploadSweetyCreative = app.extend(AddCreative, {
        init: function(config){
            UploadSweetyCreative.master(this, null, config);
            UploadSweetyCreative.master(this, 'init', arguments);
        },
        build:function(){
            if (!this.ready){
                this.ready = 1;
                this.create(
                    "section"
                    ,form.section
                    ,{
                        "target":this.el
                        ,"title":LANG("上传创意")
                        ,"list_title":LANG("填写说明：")
                        ,"list":[
                            LANG("可批量上传，每个尺寸只能上传一个。")
                            ,LANG("上传成功后才能保存，请耐心等候。")
                        ]
                        ,"bottom":true
                    }
                );
                this.$.section.doms.title.hide();

                // 步骤
                this.step = this.create(
                    "step"
                    ,form.step
                    ,{
                        "list":[LANG("创意包")]
                        ,"target":this.el
                        ,"btn_target":this.$.section.doms.bottom
                        ,"showStep":0
                    }
                );

                var tabFlash = this.$flashCon = $('<div/>');
                var tabOuterLink = this.$linkCon = $('<div/>').hide();
                this.$.section.getContainer().append(tabFlash, tabOuterLink);

                this.create("uploadMaterialOuterLink", materialOuterlink.main, {
                    'target': tabOuterLink
                });

                // 素材预览
                this.create(
                    "previewMaterial"
                    ,previewMaterial.base
                    ,{
                        "target":tabFlash
                        ,"progress":true
                        ,"type":"sweety"
                        ,"sender":"uploadMaterial"
                    }
                );

                // 上传素材
                // this.subject.uploadMaterial = this.create(
                this.create(
                    "uploadMaterial"
                    ,upload.porter
                    ,{
                        "target":tabFlash
                        ,"preview":0
                        ,"title":null
                        ,"type":"sweety"
                        ,"mode":"material"
                        ,"multiple":1
                        ,"progress":0
                        ,"uploadUrl":"/rest/addsweetycreative"
                        ,'tips': LANG('请上传：jpg,jpeg,png,gif,swf,flv文件。文件尺寸小于100kb。可批量上传，每个尺寸只能上传一个！')
                    }
                );

                this.subject = {
                    'uploadMaterial': this.$.uploadMaterial,
                    'previewMaterial': this.$.previewMaterial
                };
            }
            var id = this.config.param;
            if (id){
                this.load(id);
            }
        },
        reset: function(){
            var subs = this.$;
            subs.uploadMaterialOuterLink.reset();
            subs.previewMaterial.reset();

            return this;
        },
        // 加载数据
        load: function(id){
            this.showLoading();
            app.data.get('/rest/listsweety',{
                "Id": id,
                'no_stastic_data': 1
            }, this, 'afterLoad');
            return this;
        },
        afterLoad: function(err, data){
            this.hideLoading();
            if (err){
                if (err.message){
                    app.alert(err.message);
                }
                app.error(err);
            }else {
                this.setData(data.items[0]);
            }
        },
        setData: function(data){
            this.data = data;

            // 先重置所有模块, 等待拉取数据完成后设置
            var subs = this.$;
            subs.uploadMaterialOuterLink.reset();
            subs.previewMaterial.reset();
            subs.previewMaterial.changePrefix(data.Name);

            // 拉取创意详细信息
            if (data){
                var ids = data.CreativeIds;
                if (ids && ids.length){
                    this.showLoading();
                    app.data.get('/rest/listsweetycreative', {
                        'Ids': ids.join(','),
                        'no_stastic_data': 1,
                        'limit': 1
                    }, this, 'afterLoadCreative');
                }
            }
            return this;
        },
        afterLoadCreative: function(err, data){
            this.hideLoading();
            var items = data.items;
            if (items && items[0]){
                // 判断模块当前是外链还是本地创意, 显示对应的界面
                items = (items[0].Type == 3);
                this.$type = items ? 'link': 'flash';
                this.$flashCon.toggle(!items);
                this.$linkCon.toggle(items);
            }
            // return UploadSweetyCreative.master(this, 'afterLoadCreative', arguments);
        },
        getData: function(){
            if (!this.data){return null;}
            var data = $.extend(true, {}, this.data);

            // 素材上传，flash上传和外部链接，二者择其一
            var subs = this.$;
            var cids = data.CreativeIds = [];
            var names = data.CreativeNames = [];
            var list;

            if (this.$type == 'flash'){
                list = subs.previewMaterial.getData();
            }else {
                list = subs.uploadMaterialOuterLink.getData();
            }
            util.each(list, function(item){
                var id = item._id || item.Id;
                if (id){
                    cids.push(item._id || item.Id);
                    names.push(item.Name);
                }
            });

            return data;
        },
        save: function(){
            if (this.$type == 'flash') {
                this.doSave();
            }else {
                // 显示加载状态
                this.showLoading();
                this.$.uploadMaterialOuterLink.save();
            }
        },
        // 创意包外链上传完毕
        onMaterialUploadFinish: function(ev){
            this.hideLoading();
            var error = '';
            util.each(ev.param.error, function(err){
                error += '\n' + err.name + ': ' + err.message;
            });
            if(error){
                app.alert(LANG("外链素材上传失败。%1", error));
            }else{
                // 确认保存
                this.doSave();
            }
            return false;
        },
        /**
         * 完成
         * @return {Undefined} 无返回值
         */
        doSave:function(){
            // 获取模块数据
            var data = this.getData();

            // 判断数据有效性
            if (data.CreativeIds.length <= 0){
                app.alert(LANG('请先添加一个创意后再保存'));
                return false;
            }

            if (this.$ayncCallback){
                // 检查是否有回调函数设置
                this.$ayncCallback(data);
                this.$ayncCallback = null;
            }else {
                // 调用创意包接口保存数据
                this.showLoading();
                app.data.put(this.database, data, this, 'afterSave');
            }
        },
        afterSave: function(err,data){
            this.hideLoading();
            if (err){
                if (err.message){
                    app.alert(err.message);
                }
                app.error(err);
            }else {
                this.data = data;
                this.hide();
                if(window.opener && window.opener.app){
                    window.opener.app.core.cast("saveSweetyCreativeSuccess",this.config.param);
                }
                this.buildSaveNotify().show();
            }
        }
        /**
         * 构建添加完成后的界面
         * @return {Object} 添加完成的界面对象
         */
        ,buildSaveNotify:function(){
            if(!this.$.saveNotify){
                this.create('saveNotify', form.successSection, {
                    'target': this.config.target,
                    'class': 'M-formSectionSave',
                    'title': LANG('保存成功!'),
                    'desc': LANG('您所操作的创意已成功保存。'),
                    'list_title': LANG('填写说明：')
                });
                var con = this.get("saveNotify").getContainer();
                $('<input type="button" data-step="list" class="btnBigGray2" />').val(LANG('创意列表')).appendTo(con);
                $('<input type="button" data-step="add" class="btnBigGray2" />').val(LANG('继续添加创意')).appendTo(con);
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
            var step = $(elm).attr('data-step');
            this.$.saveNotify.hide();
            switch (step){
                case "close":
                    window.close();
                    break;
                case "add":
                    this.reset();
                    this.show();
                    break;
                case "list":
                    app.navigate("creative/creativeList/"+this.data._id);
                    break;
            }
        }
    });

    exports.uploadSweetyCreative = UploadSweetyCreative;
});