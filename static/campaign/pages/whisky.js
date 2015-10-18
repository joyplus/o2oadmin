define(function(require, exports){
    var $ = require("jquery")
        ,view = require('view')
        ,app = require('app')
        ,linked = require("linked")
        ,common = require('common')
        ,form = require("form")
        ,grid = require('grid')
        ,taglabels = require("taglabels")
        ,previewMaterial = require("preview_material")
        ,upload = require("upload")
        ,tab = require("tab")
        ,util = require("util")
        ,crumbs = require("crumbs")
        ,tpl = require('tpl');

    /**
     * 落地页列表页面模块
     */
    function List(config, parent){
        config = $.extend(
            true
            ,{
                "grid":{
                    'functional': {
                        render:this.reanderFunctional
                        ,where: 1
                        ,context:this
                    }
                    ,'hasAdvancedSearch': true
                    // 批量操作
                    ,"batch":{
                        "enable":true
                        ,"list":[
                            {
                                "text":LANG("设置")
                                ,"type":"setting"
                                ,"subs":[
                                {"text":LANG("落地页名称关键词替换"),"type":"keywordReplace","mode":"pop","render":this.batchRender}
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
                ,"hasTpl":true
            }
            ,config
        );
        List.master(this,null,config);
        this.$readOnly = false;
    }
    extend(List, view.container, {
        init: function(){
            this.render();

            // 时间段控件
            var date = require('views/datebar');
            if(this.config.hasDate){
                this.create('date', date.datepicker, {target: this.el});
            }

            var labelCon = $('<div class="P-whiskyLabelCon"/>').appendTo(this.el);
            // 标签过滤
            if(this.config.hasTags){
                // this.tag = this.create('tag', tag.sweety);
                this.tags = this.create(
                    "whiskyTags"
                    ,taglabels.simple
                    ,{
                        "target":labelCon
                        ,"type":"WhiskyLabel"
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
                    ,'data': [null, LANG('已归档'),LANG('进行中'), LANG('已暂停'),LANG('所有')]
                }
            );

            if(this.config.hasAdd || this.config.hasTpl){
                var con = $('<div class="P-whiskyAddCon"/>').appendTo(this.el);

                // 若没有和DSP对接，不创建模板库
                var userData = app.getUser();
                // 模板库按钮
                if(this.config.hasTpl && userData && userData.campany && userData.campany.IsButt){
                    this.create('templateBtn', common.button, {
                        'target': con,
                        'text': LANG('模板库'),
                        'class': 'P-whiskyTemplateBtn btn',
                        'data': 'template'
                    });
                }

                // 添加按钮
                if(this.config.hasAdd){
                    this.addBtn = this.create(
                        "addBtn"
                        ,view.container
                        ,{
                            "target":con
                            ,"tag":"button"
                            ,"class":"P-whiskyAddBtn btnAddGreen"
                            ,"html":"<em></em>"+LANG('添加落地页')
                            ,"data-action":"addWhisky"
                        }
                    );
                    this.jq(this.addBtn.el,"click","onAddWhisky");
                }
            }
            // 更新状态
            this.onUserChange();

            // 列表
            this.grid = this.create(
                'grid'
                ,grid.whisky
                ,this.config.grid
            );
        },
        onUserChange: function(ev){
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
            this.grid.reload();
        },
        /**
         * 表格操作列格式化函数
         * @param  {Number}    index 当前行数
         * @param  {Mix}       value 单元格对应的数据
         * @param  {Object}    row   当前行对应的数据
         * @return {Undefined}       无返回值
         */
        reanderFunctional:function(index, value, row){
            var html = '';

            if (row.IsDeleted){
                html += '<a data-func="none" title="'+LANG("已归档")+'" href="#"><em class="G-iconFunc store"/></a>';
                if (!this.$readOnly){
                    html += '<a data-func="restore" title="'+LANG("还原")+'" href="#"><em class="G-iconFunc restore"/></a>';
                }
                html += '<a href="#/whisky/detail/'+row._id+'" target="_blank"><em title="'+LANG("详情")+'" class="G-iconFunc list" ></em></a>';
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
            if (!this.$readOnly){
                // 暂停按钮
                switch (row.Status){
                    case 1:
                        html += '<a data-func="disable" href="#"><em title="'+LANG("暂停")+'" class="G-iconFunc pause"></em></a>';
                        break;
                    case 2:
                        html += '<a data-func="enable" href="#"><em title="'+LANG("恢复")+'" class="G-iconFunc resume" ></em></a>';
                        break;
                    default:
                        html += '<a ><em title="'+LANG("无效")+'" class="G-iconFunc invaild"></em></a>';
                        break;
                }
            }
            // 详情
            html += '<a href="#/whisky/detail/'+row._id+'" target="_blank"><em title="'+LANG("详情")+'" class="G-iconFunc list" ></em></a>';

            // 下载按钮
            html += '<a href="'+app.util.formatIndex(app.config("download_page"),"WhiskyCreative",row._id)+'" target="_blank"><em title="'+LANG("下载")+'" class="G-iconFunc download"></em></a>';

            if (this.$readOnly){ return html; }

            // 归档按钮
            html += '<a href="#" data-func="store" title="'+LANG("归档")+'"><em class="G-iconFunc store"/></a>';

            // 编辑按钮
            html += '<a href="#/whisky/edit/'+row._id+'" target="_blank"><em title="'+LANG("编辑")+'" class="G-iconFunc edit" ></em></a>';

            // 删除按钮
            // html += '<a data-func="remove" href="#"><em title="'+LANG("删除")+'" class="G-iconFunc trash"></em></a>';
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
                        grid.setSort('UpdateTime', 'desc');
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
         * 添加按钮
         * @param  {Object}    ev 消息对象
         * @return {Undefined}    无返回值
         */
        onButtonClick: function(ev){
            switch(ev.param){
                case "template":
                    app.navigate("whisky/template");
                    break;

                case "addWhisky":
                    // @ignore
                    app.navigate("whisky/add");
                    break;
            }
            return false;
        },
        onAddWhisky:function(){
            // app.navigate("whisky/add");
            window.open(window.location.href.split('#',1)+"#/whisky/add");
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
                        '/rest/stopwhiskycreative',
                        {'Id':id,'Status':param.Status},
                        this.cbSetStatus, this, param
                    );
                    break;
                case 'store':
                    app.confirm(LANG('真的要归档这个落地页记录吗?'),function(isOK){
                        if(isOK){
                            app.data.del(
                                '/rest/deletewhiskycreative',
                                {'Id': id},
                                self.cbStore, self, param
                            );
                        }
                    });
                    break;
                case 'restore':
                    app.confirm(LANG('真的要取消这个落地页记录的归档吗?'),function(isOK){
                        if(isOK){
                            app.data.del(
                                '/rest/recyclewhiskycreative',
                                {'Id': id},
                                self.cbStore, self, param
                            );
                        }
                    });
                    break;
                /*case 'remove':
                 app.confirm(LANG('真的要删除这个落地页吗?'),function(isOK){
                 if(isOK){
                 app.data.del(
                 '/rest/deletewhiskycreative',
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
        onSaveWhiskySuccess: function(ev) {
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
                ,data = ev.param.data;

            if(data.length){
                var param;
                switch(type){
                    case "keywordReplace":
                        var val = this.get('grid/batch/normal/' + type);
                        val = (val && val.getData) ? val.getData() : null;
                        param = {
                            'Action': 'whisky'
                            ,'Type': 'update'
                            ,'Ids': data.toString()
                        }
                        param = $.extend(param, val);
                        this.batchUpdate(param);
                        break;

                    case "disabled":
                        this.batchUpdate({
                            'Action': 'whisky'
                            ,'Type': 'stop'
                            ,'Status': 2
                            ,'Ids': data.toString()
                        });
                        break;

                    case "enable":
                        this.batchUpdate({
                            'Action': 'whisky'
                            ,'Type': 'stop'
                            ,'Status': 1
                            ,'Ids': data.toString()
                        });
                        break;

                    case "store":
                        this.batchUpdate({
                            'Action': 'whisky'
                            ,'Type': 'delete'
                            ,'Ids': data.toString()
                        });
                        break;

                    case "recovery":
                        this.batchUpdate({
                            'Action': 'whisky'
                            ,'Type': 'recycle'
                            ,'Ids': data.toString()
                        });
                        break;

                    case "export":
                        var url = app.data.resolve("/rest/batchOperation", {
                            'Action': 'whisky'
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
                app.alert(LANG("请先选择一个或多个落地页。"));
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
                msg = LANG("%1个落地页处理失败\n",data.length);
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
    exports.list = List;

    /**
     * 添加落地页
     * @param {Object} config 配置
     */
    function AddWhisky(config){
        config = $.extend(
            {
                "edit":0,
                "noButtons":false
            }
            ,config
        );
        this.database = "/rest/addwhiskycreative";
        AddWhisky.master(this,null,config);

        this.subject = {
            // 名称
            "whiskyName":true
            // 上传封面
            ,"uploadThumbnail":true
            // 素材
            ,"tab":true
            // 关联游戏
            ,"linkedGame": !config.noButtons
            // 标签
            ,"whiskyTags":true
            // 上传素材
            ,"uploadMaterial":true
            // 素材预览
            ,"previewMaterial":true
            // 外部链接
            ,"outerLink":true
        }
        // 预览地址
        this.previewMaterialUrl = null;
        this.data = {};
    }
    // var OUT_LINK_EXP = /[a-zA-z]+:\/\/[^\s]*/;
    extend(
        AddWhisky
        ,view.container
        ,{
            init:function(){
                this.render();
                this.build();
                // this.linkedGame.config.multiple = 0;
                // this.ready = 1;
            }
            /**
             * 构造
             * @return {Undefined} 无返回值
             */
            ,build:function(){
                if(!this.ready){
                    _buildLayout.call(this);
                    _buildSetpOne.call(this);
                    this.ready = 1;
                }
            }
            /**
             * 数据请求响应函数
             * @param  {Object}    err  错误信息
             * @param  {Object}    data 返回的数据对象
             * @return {Undefined}      无返回值
             */
            ,onData:function(err,data){
                if(this.loading){
                    this.loading.hide();
                }
                if(!err){
                    // this.data = {};
                    // this.destroy();
                    // app.navigate(-1);
                    // app.core.cast("addWhiskySuccess");
                    var previewUrl = ""+this.previewMaterialUrl;
                    // this.reset();
                    this.hide();
                    this.previewMaterialUrl = previewUrl;

                    if(window.opener && window.opener.app){
                        window.opener.app.core.cast("saveWhiskySuccess", {"id": data._id});
                    }
                    var section = this.get("saveNotify");
                    if(!section){
                        section = this.buildSaveNotify();
                    }else{
                        section.show();
                    }
                    this.newId = data._id;
                }else{
                    app.alert(err.message);
                    console.log("Add Whisky Fail.");
                }
                this.saveBnt.enable();
            }
            /**
             * 外链素材地址变化响应函数
             * @return {Undefined} 无返回值
             */
            ,onOuterLinkChange:function(){
                var link = $.trim(this.subject.outerLink.el.val());
                _setPreview.call(this,link);
            }
            ,reset:function(){
                this.data = {};
                for(var n in this.subject){
                    switch(n){
                        case "whiskyName":
                            this.subject[n].el.val(LANG("新建落地页_")+app.util.date("YmdHis"));
                            break;

                        case "tab":
                            this.subject[n].switchTab("outerLink");
                            break;

                        case "outerLink":
                            if(this.subject[n].el){
                                this.subject[n].el.val("");
                            }
                            break;

                        default:
                            if(this.subject[n].reset){
                                this.subject[n].reset();
                            }
                    }
                }
                // 隐藏上传封面模块
                this.layout.get(1).el.hide();
                var section = this.get("saveNotify");
                if(section){
                    section.hide();
                }
                if(!this.config.noButtons){
                    this.previewBnt.el.attr("disabled","disabled");
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
                        'desc': LANG('您所添加的落地页已成功保存。'),
                        'list_title': LANG('填写说明：'),
                        'list': [
                            LANG('建议对该落地页进行预览/测试，确保能够正确登录到对应的游戏。')
                        ]
                    });
                    var con = this.get("saveNotify").getContainer();
                    $('<input type="button" data-step="list" class="btnBigGray2" />').val(LANG('落地页列表')).appendTo(con);
                    $('<input type="button" data-step="preview" class="btnBigGray2" />').val(LANG('预览/测试')).appendTo(con);
                    $('<input type="button" data-step="add" class="btnBigGray2" />').val(LANG('继续添加落地页')).appendTo(con);
                    $('<input type="button" data-step="edit" class="btnBigGray2" />').val(LANG('继续编辑落地页')).appendTo(con);
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
                        if(hash.indexOf("whisky/add") !== -1){
                            this.show();
                            this.reset();
                        }else{
                            app.navigate('whisky/add');
                        }
                        break;
                    case 'list':
                        app.navigate('whisky');
                        break;
                    case "preview":
                        this.preview();
                        return;
                    case 'edit':
                        if(hash.indexOf("whisky/edit") !== -1){
                            this.show();
                        }else{
                            app.navigate('whisky/edit/'+this.newId);
                        }
                        break;
                }
                this.$.saveNotify.hide();
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

                        case "preview":
                            this.preview();
                            break;

                        case "save":
                            this.saveBnt.disable();
                            this.done();
                            break;

                        case "delPreviewMaterial":
                            if(!ev.param.len){
                                _setPreview.call(this,null);
                            }
                            return false;

                        case "rename":
                            if(util.isObject(this.subject.previewMaterial.changePrefix)){
                                this.subject.previewMaterial.changePrefix(this.subject.whiskyName.el.val());
                            }
                            break;

                        case "outerLinkChange":
                            if(ev.type === "blur"){
                                this.onOuterLinkChange();
                            }
                            break;
                        case "sizeChange":
                            this.fire("heightChange");
                            break;
                    }
                    type = null;
                }
            }

            /**
             * 文件上传成功
             * @param  {Object} ev 消息对象
             * @return {Bool}      阻止冒泡
             */
            ,onUploadSuccess:function(ev){
                if(ev.from.config.mode === "material"){
                    this.subject.previewMaterial.updateMaterial(ev.param.data);
                    _setPreview.call(this,ev.param.data.WhiskyPreviewUrl);
                }
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
                if(ev.from.config.mode === "material"){
                    var files = ev.param.files;
                    if(files && files.length){
                        for(var n in this.subject.previewMaterial.lists){
                            this.subject.previewMaterial.del(n);
                        }
                        this.subject.previewMaterial.multipleAdd(files);
                    }
                    files = null;
                }
                return false;
            }
            ,onUploadFail:function(ev){
                if(ev.from.config.mode === "material"){
                    this.subject.previewMaterial.uploadFailed(ev.param);
                }
                return false;
            }

            /**
             * 选项卡切换响应函数
             * @param  {Object}    ev 消息对象
             * @return {Undefined}    无返回值
             */
            ,onTabChange:function(ev){
                if(this.ready){
                    var previewUrl;
                    if(this.subject.tab.active === "body"){
                        for(var n in this.subject.previewMaterial.data){
                            previewUrl = this.subject.previewMaterial.data[n].Path;
                            break;
                        }
                    }else{
                        if(this.outerLink){
                            previewUrl = $.trim(this.subject.outerLink.el.val());
                        }
                    }
                    _setPreview.call(this,previewUrl);
                }
                this.fire("heightChange");
            }
            /**
             * 完成
             * @return {Undefined} 无返回值
             */
            ,done:function(){
                if(this.getWhiskyData()){
                    app.data.put(
                        this.database
                        ,this.data
                        ,this
                    );
                    this.loading.show();
                }
            }
            /**
             * 预览
             * @return {Undefined} 无返回值
             */
            ,preview:function(){
                // 外链素材预览
                if(this.subject.tab.active == "outerLink"){
                    window.open(this.data.OuterLink,"PreviewMaterialWindow");
                }else if(this.previewMaterialUrl){
                    // 普通上传素材预览
                    window.open(this.previewMaterialUrl,"PreviewMaterialWindow");
                }
            }
            /**
             * 生成创意包数据
             * @return {Object} 创意包数据
             */
            ,getWhiskyData:function(){
                var _id = this.data._id || this.data.Id;
                this.data = {
                    // 封面
                    "Thumb":""
                    // 名称
                    ,"Name":""
                    // 素材类型
                    ,"Type":""
                    // ,"Layout":0
                    // 上传文件
                    ,"Body":""
                    // 外部链接
                    ,"OuterLink":""
                    // 描述
                    ,"Description":""
                    // 关联产品
                    ,"Products":[]
                    // 落地页预览地址
                    // ,"WhiskyPreviewUrl":this.previewMaterialUrl
                    // 设置标签
                    ,"Label":[]
                    // 最终着陆页
                    ,"LandingPage": ""
                }
                if(this.config.edit){
                    this.data.Id = _id;
                }
                if(this.subject.whiskyName){
                    this.data.Name = this.subject.whiskyName.el.val();
                }

                if(this.subject.tab){
                    if(this.subject.tab.active === "body"){
                        this.data.Type = 1;
                        for(var n in this.subject.previewMaterial.data){
                            this.data.Body = this.subject.previewMaterial.data[n].Path;
                            this.data.Layout = this.subject.previewMaterial.data[n].Layout;
                            break;
                        }
                    }else{
                        this.data.Type = 2;
                        var linkData = this.subject.outerLink.el.val();
                        // 若没加'http://'或'https://',自动补上'http://'
                        var isMatch = linkData.match(/^(http|https):\/\//g);
                        this.data.OuterLink = (isMatch == null) ? ('http://' + linkData) : linkData;

                        // 最终着陆页
                        var landingPage = this.subject.landingPage.getData();
                        isMatch = landingPage.match(/^(http|https):\/\//g);
                        if(landingPage == 'http://'){
                            landingPage = '';
                        }
                        if(!landingPage){
                            isMatch = true;
                        }
                        this.data.LandingPage = (isMatch == null) ? ('http://' + landingPage) : landingPage;
                    }
                }

                if($.trim(this.data.Name)){
                    this.data.Description = "";
                    this.data.Thumb = this.subject.uploadThumbnail && this.subject.uploadThumbnail.data.Path || "";

                    if(this.subject.linkedGame){
                        var data = this.subject.linkedGame.data;
                        for(var m in data){
                            this.data.Products.push(data[m]._id);
                        }
                    }

                    if(this.subject.whiskyTags){
                        this.data.Label = this.subject.whiskyTags.getData();
                    }

                }else{
                    app.alert(LANG("落地页名称不能为空。"));
                    var me = this;
                    setTimeout(function(){
                        me.whiskyName.el.focus();
                    },100);
                    return false;
                }

                return this.data;
            }
            /**
             * 取消
             * @return {Undefined} 无返回值
             */
            ,cancel:function(){
                // this.destroy();
                // app.navigate(-1);
                window.close();
            }
            ,beforeDestroy:function(){
                this.subject.uploadMaterial.destroy();
                this.subject.whiskyTags.destroy();
                this.subject.uploadThumbnail.destroy();
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
                AddWhisky.master(this, 'hide');
            }
            /**
             * 复制代码响应函数
             * @param  {Object} evt 鼠标事件
             * @param  {Object} elm Jq Dom 对象
             * @return {Bool}       阻止冒泡
             */
            ,eventGotoCodeCenter: function(evt, elm){
                window.open('#codeCenter');
                return false;
            }
            /**
             * 复制成功后的响应函数
             * @return {Undefined} 无返回值
             */
            ,copyComplete: function(){
                app.alert(LANG('复制成功'));
            }
        }
    );

    /**
     * 设定预览按钮
     * @param {String} previewUrl 预览地址
     * @private
     */
    function _setPreview(previewUrl){
        if(previewUrl){
            this.previewMaterialUrl = previewUrl;
        }else{
            this.previewMaterialUrl = null;
        }
        if(!this.config.noButtons){
            this.previewBnt.el[
            previewUrl && "removeAttr" || "attr"
                ]("disabled","disabled");
        }
    }

    /**
     * 构建结构
     * @return {Undefined} 无返回值
     * @private
     */
    function _buildLayout(){
        var tmp = app.config("userModules").AddWhisky.exclude[app.getUser().type];
        if(tmp){
            for(var i = 0,len = tmp.length;i<len;i++){
                delete this.subject[tmp[i]];
            }
        }
        this.section = this.create(
            "Section"
            ,form.section
            ,{
                "target":this.el
                ,"title":LANG("落地页信息")
                ,"bottom":true
            }
        );

        // 主layout
        this.layout = this.create(
            "pageLayout"
            ,view.layout
            ,{
                "target":this.section.getContainer()
                ,"grid":[6,1]
                ,"cellSet":[
                    {"class":"P-pageCon"}
                    ,{"class":"P-pageCon"}
                    ,{"class":"P-pageCon"}
                    ,{"class":"P-pageCon P-whiskyUpload"}
                    ,{"class":"P-pageCon"}
                    ,{"class":"M-formStepBtns"}
                ]
            }
        );
        //创建3个按钮 -预览、保存、取消
        if(!this.config.noButtons){
            this.previewBnt = this.create(
                "previewBnt"
                ,common.input
                ,{
                    "target":this.layout.get(5).el
                    ,"type":"button"
                    ,"class":"btnBigGray"
                    ,"value":LANG("预览")
                    ,"data-action":"preview"
                }
            );
            this.previewBnt.el.attr("disabled","disabled");
            if(this.data && this.data.WhiskyPreviewUrl){
                _setPreview.call(this,this.data.WhiskyPreviewUrl);
            }
            this.saveBnt = this.create(
                "saveBnt"
                ,common.input
                ,{
                    "target":this.layout.get(5).el
                    ,"type":"button"
                    ,"value":LANG("保存")
                    ,"class":"btnBigGreen"
                    ,"data-action":"save"
                }
            );
            this.cancelBnt = this.create(
                "cancelBnt"
                ,common.input
                ,{
                    "target":this.layout.get(5).el
                    ,"type":"button"
                    ,"value":LANG("取消")
                    ,"class":"btnBigGray"
                    ,"data-action":"cancel"
                }
            );
            this.loading = this.create('loading', common.loadingMask, {target: 'body', auto_show: false});
            this.section.doms.bottom.append(this.layout.get(5).el);
        }

        this.dg(
            this.el
            ,"#codeCenter"
            ,"click"
            ,"eventGotoCodeCenter"
        );

        tmp = null;
    }

    /**
     * 构建第一步
     * @return {Undefined} 无返回值
     * @private
     */
    function _buildSetpOne(){
        var me = this;
        // 名称
        if(this.subject.whiskyName){
            var nameCon = this.create('nameLayout', view.itemLayout,{
                'target':this.layout.get(0).el,
                'label': LANG('名称：')
            });

            this.subject.whiskyName = this.create(
                "whiskyName"
                ,common.input
                ,{
                    "target":nameCon.getContainer()
                    ,"type":"text"
                    ,"data-action":"rename"
                    ,"value":LANG("新建落地页_")+app.util.date("YmdHis")
                    ,"events":"blur"
                }
            );
            if(this.data.Name){
                this.subject.whiskyName.setData(this.data.Name);
            }
        }

        var dat;
        // 上传封面
        if(this.subject.uploadThumbnail){
            var thumbCon = this.create('thumbLayout', view.itemLayout,{
                'target':this.layout.get(1).el,
                'label': LANG('封面：'),
                'tips': LANG('给落地页上传封面以便管理，请上传：jpg,png,gif文件。文件尺寸小于1MB。')
            });
            dat = this.data.Thumb && {"Path":this.data.Thumb} || null;
            this.subject.uploadThumbnail = this.create(
                "uploadThumbnail"
                ,upload.porter
                ,{
                    "target":thumbCon.getContainer()
                    ,"title":null
                    ,"mode":"thumb"
                    ,"data":dat
                }
            );
            // 非编辑状态的话要隐藏上传封面模块
            if(!dat){
                this.layout.get(1).el.hide();
            }else{
                // 当选择‘继续添加落地页’时，因为mod.reset()隐藏过一次，所以此时要show()
                this.layout.get(1).el.show();
            }
        }

        var materialCon = $('<div class="materialLayout"><label>'+LANG('素材：')+'</label><div class="wrap"></div></div>').appendTo(this.layout.get(3).el);

        // 用户信息
        var userData = app.getUser();

        // 素材
        if(this.subject.tab){
            this.subject.tab = this.create(
                "tab"
                ,tab.base
                ,{
                    "target":materialCon.find(".wrap")
                    ,"list":{
                        "outerLink":{
                            "text":LANG("外部链接")
                            ,render:function(item,config){
                                // 动态设置用户ID
                                tpl.set("name", userData && userData.campany && userData.campany.UserId || 0);
                                tpl.load("outerLink",function(re){
                                    tpl.appendTo(item.body,"outerLink/main");
                                    me.subject.outerLink = me.create(
                                        "outerLink"
                                        ,common.input
                                        ,{
                                            "target":item.body.find(".theLink:first")
                                            ,"type":"text"
                                            ,"placeholder":LANG("请输入外部链接地址，必须以http://或者https://开头")
                                            ,"data-action":"outerLinkChange"
                                            ,"events":"blur"
                                            ,"width": 600
                                        }
                                    ).setData(me.data.OuterLink || "");

                                    me.subject.landingPage = me.create(
                                        "landingPage"
                                        ,form.input
                                        ,{
                                            "target":item.body.find(".finalTheLink:first"),
                                            "holder":LANG("请输入最终着陆页地址，必须以http://或者https://开头"),
                                            "label": LANG('最终着陆页：'),
                                            "width": 600,
                                            "tips": LANG('当落地页有做302跳转时，渠道需要审核最终着陆页。')
                                        }
                                    ).setData(me.data.LandingPage || "");
                                    var isShow = app.getUserAuth(app.config('auth/landingPage'));
                                    me.subject.landingPage[isShow ? 'show' : 'hide']();
                                    if(me.data.LandingPage){
                                        me.subject.landingPage.disable().show();
                                    }

                                },me);

                                this.fire("heightChange");
                                // util.clip();
                            }
                        },
                        "body":{
                            "text":LANG("上传素材")
                            ,render:function(item,config){

                                // 素材预览
                                var dat = me.data;
                                me.subject.previewMaterial = me.create(
                                    "previewMaterial"
                                    ,previewMaterial.base
                                    ,{
                                        "target":item.body
                                        // ,"data":dat
                                        ,"readonly":1
                                        ,"preview":0
                                        ,"autoName":0
                                        ,"progress":true
                                        ,"type":"whisky"
                                        ,"sender":"uploadMaterial"
                                        // ,"database":"/rest/listwhiskycreative"
                                        ,"prefix":me.subject.whiskyName.getData()
                                    }
                                );

                                // 上传素材
                                me.subject.uploadMaterial = me.create(
                                    "uploadMaterial"
                                    ,upload.porter
                                    ,{
                                        "target":item.body
                                        ,"title":''
                                        ,"preview":0
                                        ,"type":"whisky"
                                        ,"mode":"material"
                                        ,"progress":0
                                        ,"tips":LANG('请上传：zip,rar文件。文件尺寸小于5MB。')
                                        // ,"uploadUrl":"http://192.168.10.14/whisky/addwhiskycreative"
                                    }
                                );

                                if(app.util.first(dat) && !dat.OuterLink && dat.Body && dat.Layout){
                                    // 有值则是编辑状态
                                    me.subject.previewMaterial.add({
                                        "_id":dat._id
                                        ,"FileName":dat.UploadFileName
                                        ,"FileSize":dat.UploadFileSize
                                        ,"FileType":dat.UploadFileType
                                        ,"Path":dat.Body
                                        ,"Layout":dat.Layout
                                    },1,0);
                                }

                                dat = null;
                            }
                        }
                    }
                }
            );
            if(this.data.OuterLink || this.data.Body && this.data.Layout){
                this.subject.tab.switchTab(
                    this.data.OuterLink && "outerLink" || "body"
                );
            }

            // 若没有和DSP对接，隐藏上传素材的tab，整个tab切换栏要隐藏
            if(userData && userData.campany && !userData.campany.IsButt){
                this.$.tab.hideTabHeader();
            }
        }

        // 关联游戏
        if(this.subject.linkedGame){
            var linkedCon = this.create('linkedLayout', view.itemLayout,{
                'target':this.layout.get(2).el,
                'label': LANG('关联产品：'),
                'tips': LANG('关联产品代表该落地页能够使用到哪些产品的推广活动上，1个落地页只能关联1个，没有关联该落地页的产品是无法使用它来推广的。')
            });

            dat = this.data && this.data.Products || null;
            this.subject.linkedGame = this.create(
                "linkedGame"
                ,linked.base
                ,{
                    "target": linkedCon.getContainer()
                    ,"data":dat
                    ,"multiple":0
                }
            );
            // 如果是无产品的，隐藏关联产品
            if(userData && userData.campany && (userData.campany.CategoryId == 2)){
                linkedCon.hide();
            }else{
                linkedCon.show();
            }
        }

        // 创意标签
        if(this.subject.whiskyTags){
            dat = this.data && this.data.Label || null;
            this.subject.whiskyTags = this.create(
                "whiskyTags"
                ,taglabels.base
                ,{
                    "target":this.layout.get(4).el
                    ,"data":dat
                    ,"collapse":0
                    ,"type":"WhiskyLabel"
                    ,'label': LANG('标签：')
                    ,'tips': LANG('给创意包贴上标签，方便管理。多个标签用“,”分开')
                }
            );
        }

        dat = null;

        this.fire("heightChange");
    }

    exports.addWhisky = AddWhisky;

    /**
     * 编辑落地页
     * @param {Object} config 配置
     */
    function EditWhisky(config){
        config = $.extend(
            {
                "edit":1
                ,"id":0
            }
            ,config
        );
        EditWhisky.master(this,null,config);
    }
    extend(
        EditWhisky
        ,AddWhisky
        ,{
            init:function(){
                this.getData();
                this.render();
            }
            /**
             * 请求响应函数
             * @description             获取数据后才做界面渲染处理
             * @param  {Object}    err  错误信息
             * @param  {Object}    data 服务器返回的数据
             * @return {Undefined}      无返回值
             */
            ,onData:function(err,data){
                if(this.loading){
                    this.loading.hide();
                }
                if(!err){
                    if(!this.ready){
                        this.data = data.items[0];
                        this.build();
                        app.core.get("platform").setPlatform(0,this.data.Id+' '+this.data.Name,null,'editing');
                    }else{
                        var previewUrl = ""+this.previewMaterialUrl;
                        // this.reset();
                        this.hide();
                        this.previewMaterialUrl = previewUrl;
                        if(window.opener && window.opener.app){
                            window.opener.app.core.cast("saveWhiskySuccess", {"id": data._id});
                        }
                        var section = this.get("saveNotify");
                        if(!section){
                            section = this.buildSaveNotify();
                        }else{
                            section.show();
                        }
                    }
                }else{
                    app.alert(err.message);
                    console.log("Edit Whisky Fail.");
                }
                this.saveBnt.enable();
            }
            /**
             * 获取创意数据
             * @return {Undefined} 无返回值
             */
            ,getData:function(){
                app.data.get(
                    '/rest/listwhiskycreative'
                    ,{
                        "Id":this.config.id
                    }
                    ,this
                );
            }
            ,reset:function(param){
                EditWhisky.master(this,"reset");
                this.data = {};
                if(param){
                    this.config = $.extend(
                        true
                        ,this.config
                        ,param
                    );
                    this.getData();
                }
            }
        }
    );
    exports.editWhisky = EditWhisky;

    /**
     * 模板库
     * @param {Object} config 配置
     */
    function Template(config){
        config = $.extend(
            {}
            ,config
        );
        this.host = app.config("front_base");
        Template.master(this,null,config);
    }
    extend(
        Template
        ,view.container
        ,{
            init:function(){
                this.render();
                this.crumbs = this.create(
                    "crumbs"
                    ,crumbs.base
                    ,{
                        "target":this.el
                        ,"data":{
                            "Name":LANG("创意")
                        }
                        ,"now":{
                            "name":LANG("模板库")
                        }
                        ,"prev":{
                            "uris":["whisky"]
                        }
                        ,"param":null
                    }
                );
                this.grid = this.create(
                    "grid"
                    ,grid.whiskyTemplate
                    ,{
                        "operation":{
                            "width":120
                            ,render:function(){
                                return '<a data-op="download" href="#">下载</a>';
                            }
                        }
                    }
                );
            }
            /**
             * 下载
             * @param  {String}    path 压缩包地址
             * @param  {String}    name 模板名称
             * @return {Undefined}      无返回值
             */
            ,download:function(path,name){
                path = path && path.charAt(0) === "/" && path.substr(1) || path;
                window.open(this.host+path,name);
                // window.location.href = this.host+path;
            }
            /**
             * 表格操作栏响应函数
             * @param  {Object}    ev 行数据
             * @return {Boolean}      false，阻止冒泡
             */
            ,onListOpClick:function(ev){
                var param = ev.param;
                var data = param.data;
                if(param.op === "download" && data.Download){
                    this.download(data.Download,data.Name+(data.Description && ("_"+data.Description)||""));
                }
                return false;
            }
        }
    );
    exports.template = Template;

    function WhiskyDetail(config){
        WhiskyDetail.master(this,null,config);
        this.defImg = "resources/images/default.png";
        this.database = "/rest/listwhiskycreative";
        this.proDatabase = "/rest/listproduct";
        this.data = null;
    }
    extend(
        WhiskyDetail
        ,view.container
        ,{
            init:function(){
                WhiskyDetail.master(this,"init");
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
                            ,{"class":"P-pageCon","html":'<label>'+LANG("素材:")+'</label><div class=""outlink></div><div class="inlink"></div>'}
                            ,{"class":"P-pageCon","html":'<label>'+LANG("关联游戏:")+'</label><div class="M-linkedGame"></div>'}
                            ,{"class":"P-pageCon","html":'<label>'+LANG("标签:")+'</label><div></div>'}
                        ]
                    }
                );

                this.name = this.section.doms.title;

                this.thumb = this.layout.get(0,1).find(".uploadPreview");
                this.thumb.show();
                this.thumb = this.thumb.find("img:first");

                this.previewBoies = this.layout.get(1,1).find("div");

                this.linked = this.layout.get(2,1).find(".M-linkedGame");

                this.labels = this.layout.get(3,1).find("div:first");
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
                this.thumb.attr("src", util.imageThumb(this.data.Thumb, 160, 160));

                this.getLinkedData(this.data.Products);

                this.labels.text(this.data.Label);

                // 素材预览
                var tmp = this.layout.get(1,1).find("div");
                if(this.data.OuterLink){
                    this.previewBoies.eq(0).html(LANG("外部链接：")+'<a href="'+this.data.OuterLink+'" title="'+this.data.OuterLink+'" target="_blank">'+this.data.OuterLink+'</a>');
                    this.previewBoies.eq(1).hide();
                }else{
                    this.previewBoies.eq(0).hide();
                    if(!this.previewMaterial){
                        this.previewMaterial = this.create(
                            "previewMaterial"
                            ,previewMaterial.base
                            ,{
                                "target":this.previewBoies.eq(1)
                                ,"readonly":1
                                ,"autoName":0
                                ,"allowDel":0
                                ,"prefix":this.data.Name
                            }
                        );
                    }

                    this.previewMaterial.add({
                        "_id":data._id
                        ,"FileName":data.UploadFileName
                        ,"FileSize":data.UploadFileSize
                        ,"FileType":data.UploadFileType
                        ,"Path":data.Body
                        ,"Layout":data.Layout
                    });
                }
                tmp = null;
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
                this.previewBoies.eq(0).empty();
                if(this.previewMaterial){
                    this.previewMaterial.reset();
                }
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
        }
    );
    function _buildLinkBlock(data){
        return '<div class="linkedsItem"><div class="linkGame"><div><img src="'+data.Thumb+'" data-type="Thumb" alt=""></div></div></div><div class="linkGameName" style="display: block;"><p title="data.Name">'+data.Name+'</p></div>';
    }
    exports.detail = WhiskyDetail;

});