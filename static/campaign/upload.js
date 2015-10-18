define(function(require, exports){
    var $ = require("jquery")
        ,app = require("app")
        ,comm = require("common")
        ,view = require("view")
        ,SWF = require("libs/swfupload/swfupload")
        ,pop = require("popwin")
        ,util = require('util');

    /**
     * 添加文件时的响应函数
     * @param  {Object}    file 文件信息对象
     * @return {Undefined}      无返回值
     * @private
     */
    function _fileQueued(file){
        _getBelong.call(this).onFlashFileChange(file);
    }

    /**
     * 添加文件失败时的响应函数
     * @param  {Object}    file 文件信息对象
     * @return {Undefined}      无返回值
     * @private
     */
    function _fileQueueError(file){
        // app.error("queue_eorro",arguments);
    }

    /**
     * 开始上传时的响应函数
     * @param  {Object}    file 文件信息对象
     * @return {Undefined}      无返回值
     * @private
     */
    function _uploadStart(file){
        _getBelong.call(this).onFlashUploadStart(file,this.getFile());
    }

    /**
     * 上传文件中的进度响应函数
     * @param  {Object}    file   文件信息对象
     * @param  {Number}    loaded 已经上传的体积
     * @return {Undefined}        无返回值
     * @description               函数的第三个参数原本是文件的总体积。但可能是flash bug的原因，最后一次的体积是错的。
     * @private
     */
    function _uploadProgress(file,loaded, size){
        _getBelong.call(this).onFlashProgress(size,loaded,file);
    }

    /**
     * 上传失败时的响应函数
     * @param  {Object}    file 文件信息对象
     * @return {Undefined}      无返回值
     * @description             cancelUpload时也会进来
     * @private
     */
    function _uploadError(){
        app.error('Err? =>', arguments);
    }

    /**
     * 上传成功后的flash回调
     * @param  {Object}    file  被上传的文件的相关信息
     * @param  {Object}    re    服务器返回的信息
     * @param  {Boolean}   stats 操作状态
     * @return {Undefined}       无返回值
     * @private
     */
    function _uploadSuccess(file,re,stats){
        re = JSON.parse(re);
        var be = _getBelong.call(this)
            ,isMultiple = be.config.multiple;
        if(stats && re.success){
            be.onFlashUploadSuccess(file,re.result);
        }else{
            be.onFlashUploadError(file, re.message);

            if(!isMultiple){
                // 不是多选的话直接显示
                be.failMsg();
            }
        }

        var _file = this.getFile();
        if (_file){
            if (isMultiple){
                // 有剩余文件且启用多选的情况
                app.log("next file >>> "+_file.name);
                be.progressBox.el.show();
                this.startUpload();
            }else {
                while(_file){
                    this.cancelUpload();
                    _file = this.getFile();
                }
            }
        }
        _file = null;
        if(isMultiple && !this.getStats().files_queued){
            // 多选的时候在全部传完后统一处理出错信息
            be.failMsg();
        }
        be = null;
    }

    /**
     * 文件选择完毕后的响应函数
     * @return {Undefined}      无返回值
     * @private
     */
    function _file_dialog_complete(){
        // uploadFile
        // _getBelong.call(this).uploadFile();
        // console.log("dialog_complete",arguments);
    }

    /**
     * 文件选择器显示时的响应函数
     * @return {Undefined} 无返回值
     * @private
     */
    function _file_dialog_start(){
        var belong = _getBelong.call(this);
        if(belong.timer){
            clearTimeout(belong.timer);
            belong.resetClass();
        }
        if(!belong.config.multiple){
            belong.cancelUpload(0);
        }
    }

    /**
     * 所有文件添加到缓冲区后的响应函数
     * @return {Undefined}      无返回值
     * @private
     */
    function _upload_complete(incoming){
        var be = _getBelong.call(this);
        be.setIncomingNum(incoming);
        be.stroeFiles();
        be.uploadFile();
    }

    /**
     * 获取文件所属的传实例
     * @return {Object}      上传实例
     * @private
     */
    function _getBelong(){
        return this.settings.custom_settings.belong;
    }

    /**
     * 生成上传说明
     * @return {String}      上传说明
     * @private
     */
    // @舍弃 20131022
    // function _getTip(rule){
    // 	return LANG("请上传："+rule.types+"文件。")+rule.tip;
    // }

    /**
     * 插入生成预览
     * @return {Undefined} 无返回值
     * @private
     */
    function _buildPreview(data){
        this.previewBox.el.append(
            '<div><img src="'+(this.config.host+this.config.thumbConfig.url+"?Path="+data.Path+"&Width="+this.config.thumbConfig.size.width+"&Height="+this.config.thumbConfig.size.height)+'" /></div>'
        );
        var img = this.previewBox.el.find('img');
        app.util.imageError(img,'product');
        this.previewBox.show();
        this.fire("sizeChange");
    }

    /**
     * 检测文件类型
     * @param  {String} path 文件地址
     * @return {Mix}         检测结果。null|Array
     * @private
     */
    function _chkPreviewFileType(path){
        return (/\.jpg|\.png|\.gif|\.ico/g).exec(path);
    }

    /**
     * swfupload 上传失败错误提示
     */
    var _swf_alert_tid = 0;
    function _swfupload_load_failed(message){
        var time = +(new Date());
        if(_swf_alert_tid === 0 || time - _swf_alert_tid > 60000){
            _swf_alert_tid = time;
            app.alert(LANG("提示：选择文件上传功能发生错误。此错误的发生可能与您的flash player插件有关，请激活或更新flash插件。"));
            app.error(message);
        }

    }
    /**
     * 上传说明
     * @type {Object}
     * @private
     */
    var UPLOAD_RULES = {
        "sweety":{
            "type":1
            ,"size":100*1024
            ,"type_size":{
                "flv": 3*1024*1024,
                "mp4": 3*1024*1024
            }
            ,"tip":LANG("文件大小超过 {size}KB 限制。可批量上传，每个尺寸只能上传一个！")
            ,"types":"jpg,jpeg,png,gif,swf,flv,mp4,html"
        }
        ,"sweety150":{
            "type":1
            ,"size":150*1024
            ,"type_size":{
                "flv": 3*1024*1024,
                "mp4": 3*1024*1024
            }
            ,"tip":LANG("文件大小超过 {size}KB 限制。可批量上传，每个尺寸只能上传一个！")
            ,"types":"jpg,jpeg,png,gif,swf,flv,mp4,html"
        }
        ,"whisky":{
            "type":2
            ,"size":5*1024*1024
            ,"tip":LANG("文件尺寸小于5MB。")
            ,"types":"zip,rar"
        }
        ,"thumb":{
            "type":3
            ,"size":1*1024*1024
            ,"tip":LANG("文件尺寸小于1MB。")
            ,"types":"jpg,png,gif,ico"
        }
        ,"youku":{
            "type":1
            ,"size":20*1024*1024
            ,"tip":LANG("视频文件大小不能超过 {size}KB 限制。")
            ,"types":"flv"
        }
        ,"logo":{
            "type":6
            ,"size":1*1024*1024
            ,"tip":LANG("文件尺寸小于1MB。")
            ,"types":"jpeg,jpg,png"
        }
    }

    var Porter = app.extend(
        view.container
        ,{
            init:function(config){

                this.config = $.extend(
                    {
                        "target":"body"
                        // 上传接口
                        ,"uploadUrl": "/rest/addfile"
                        // 附带参数
                        ,"param": null
                        // 上传类型
                        ,"type":"thumb"
                        // 标题
                        ,"title":LANG("上传")
                        // 主样式
                        ,"class":"M-upload"
                        // 上传按钮文字
                        ,"uploadButtonText":LANG("上传")
                        // 上传步骤中的提示信息
                        ,"uploadBtnTips":{
                        // 默认选择按钮显示的文字
                        "normal":LANG("上传文件")
                        // 上传成功
                        ,"ok":LANG("上传成功")
                        // 已选择文件
                        ,"ready":LANG("点击上传按钮上传文件")
                        // 已上传至服务器，正在处理中
                        ,"processed":LANG("正在处理")
                    }
                        // 资源渲染显示的开始服务器地址
                        ,"host": app.config("front_base")
                        // 是否为多选模式
                        ,"multiple":0
                        // 是否显示预览
                        ,"preview":1
                        // 预览图配置
                        ,"thumbConfig":{
                        "url":"sweety/imageshow"
                        ,"size":{
                            "width":160
                            ,"height":160
                        }
                    }
                        ,"data":null
                        ,"progress":1
                        ,"tips":false
                    }
                    ,config
                );
                Porter.master(this,null,this.config);
                // 标题
                this.title = null;
                // 预览
                this.previewBox = null;
                // 选择按钮
                this.selectBtn = null;
                // 上传进度条
                this.progressBox = null;
                // 上传按钮
                this.uploadBtn = null;
                // 上传说明
                this.tip = null;
                // swfuplaod实例
                this.worker = null;

                // 上传完的文件数据
                this.data = {};

                this.timer = null;

                // 上传失败的文件信息汇总
                this.$failMsg = {};
                // 失败的数量
                this.$failNum = 0;

                // 界面是否已经构造完毕
                this.ready = 0;

                this.$files = null;

                this.$incomingNum = 0;

                // 构造容器
                this.render();

                // 构造界面
                this.build();
            }
            ,setIncomingNum:function(num){
                this.$incomingNum = num;
            }
            /**
             * 添加或显示失败信息
             * @param  {Object}    msg 出错信息
             * @return {Undefined}     无返回值
             */
            ,failMsg:function(msg){
                /*
                 {"name":"file.jpg","text":"error msg"}
                 */
                if(msg !== undefined){
                    this.$failMsg[msg.name] = msg.txt;
                    this.$failNum += 1;
                }else if(!msg && this.$failNum){
                    msg = [];
                    for(var n in this.$failMsg){
                        msg.push({"text":n+" : <span class='red'>"+(this.$failMsg[n] || LANG("不符合要求。"))+"</span>"});
                    }
                    this.$failMsg = {};
                    this.$failNum = 0;
                    this.create(
                        "failMsg"
                        ,pop.sysNotice
                        ,{
                            "data":{
                                "msg":LANG("以下文件出错了：")
                                ,"tip":msg
                            }
                            ,"width":600
                            ,"type":"error"
                        }
                    );
                    msg = null;
                }
            }
            /**
             * 确定恢复用户
             * @param  {Object} ev 消息对象
             * @return {Bool}      false
             */
            ,onSysNoticeOk:function(){
                return false;
            }
            /**
             * 取消恢复用户
             * @param  {Object} ev 消息对象
             * @return {Bool}      false
             */
            ,onSysNoticeCancel:function(){
                return false;
            }
            /**
             * 构造界面
             * @return {Undefined} 无返回值
             */
            ,build:function(){
                if(this.ready){
                    return;
                }
                if(this.config.title){
                    this.title = this.create(
                        "title"
                        ,comm.label
                        ,{
                            "target":this.el
                            ,"html":this.config.title
                        }
                    );
                }

                // 预览
                this.previewBox = this.create(
                    "previewBox"
                    ,view.container
                    ,{
                        "target":this.el
                        ,"class":"uploadPreview"
                    }
                );

                // 选择按钮
                this.selectBtn = this.create(
                    "selectBtn"
                    ,view.container
                    ,{
                        "target":this.el
                        ,"html":"<div></div><span><i></i><em>"+this.config.uploadBtnTips.normal+"</em></span>"
                        ,"class":"selectBtn"
                        ,"id":'swfloader_ph_'+this._.guid
                        ,"data-action":"selectFile"
                    }
                );
                // 选择按钮后面的显示文字
                this.selectBtn.textSpan = this.selectBtn.el.find("span>em");

                // 说明提示
                if(this.config.tips){
                    this.create('tips', comm.tips, {
                        "target":this.el
                        ,"tips":this.config.tips
                    });
                }

                // 上传进度条
                this.progressBox = this.create(
                    "progressBox"
                    ,view.container
                    ,{
                        "target":this.selectBtn.el
                        ,"class":"uploadProgress"
                        ,"html":'<p></p>'
                    }
                );
                this.progressBox.bar = this.progressBox.el.find("p");

                var rule = UPLOAD_RULES[this.config.type];

                // 上传按钮
                /*this.uploadBtn = this.create(
                 "uploadBtn"
                 ,comm.input
                 ,{
                 "target":this.el
                 ,"type":"button"
                 ,"value":this.config.uploadButtonText
                 ,"class":"btn"
                 ,"data-action":"uploadFile"
                 }
                 );*/

                // // 上传说明
                // this.tip = this.create(
                // 	"tip"
                // 	,view.container
                // 	,{
                // 		"target":this.el
                // 		,"html":_getTip(rule)
                // 		,"class":"uploadTip"
                // 	}
                // );

                // url与cookie部分设定
                var _user = app.getUser()
                    ,tmp = document.cookie.split(";")
                    ,params = util.extend({
                        "Type":rule.type
                        ,"debug":1
                    }, this.config.param);
                for(var i=0;i<tmp.length;i++){
                    if(tmp[i].indexOf("cookie_info") !== -1){
                        params.cookie_info = app.util.trim(tmp[i]).split("=")[1];
                        break;
                    }
                }


                // swf设置
                this.uploadConfig = {
                    "upload_url":app.data.resolve(this.config.uploadUrl)
                    ,"flash_url":window.BASE("libs/swfupload/swfupload.swf")
                    ,"file_post_name":"MaterialFile"
                    ,"file_types":(function(){
                        var _type =rule.types.split(",");
                        for(var i =0;i<_type.length;i++){
                            _type[i] = "*."+_type[i];
                        }
                        return _type.join(";");
                    })()
                    ,"button_window_mode":"transparent"
                    ,"file_size_limit": rule.type_size ? 0: rule.size
                    ,"post_params":params
                    ,"custom_settings":{
                        "belong":this,
                        "rule":rule
                    }
                    ,"use_query_string":true
                    ,"button_placeholder":this.selectBtn.el.find("div")[0]
                    ,"button_width":this.selectBtn.el.outerWidth()
                    ,"button_height":this.selectBtn.el.outerHeight()
                    ,"file_queued_handler":_fileQueued
                    ,"file_queue_error_handler":_fileQueueError
                    ,"upload_start_handler":_uploadStart
                    ,"upload_progress_handler":_uploadProgress
                    ,"upload_error_handler":_uploadError
                    ,"upload_success_handler":_uploadSuccess
                    ,"file_dialog_start_handler":_file_dialog_start
                    ,"file_dialog_complete_handler":_upload_complete
                    ,"upload_complete_handler":_file_dialog_complete
                    ,"swfupload_load_failed_handler":_swfupload_load_failed
                    // ,"debug":true
                };

                this.worker = SWF.worker(this.uploadConfig);


                _user = tmp = params = null;

                if(this.config.data){
                    this.setData(this.config.data);
                }
            }
            /**
             * 设定上传数据
             * @param {Undefined} data 无返回值
             */
            ,setData:function(data){
                if(app.util.isObject(data)){
                    this.data = data;
                    if(this.config.preview && _chkPreviewFileType(data.Path)){
                        // 是图片且有预览时
                        _buildPreview.call(this,data);
                    }
                }else{
                    app.error("数据格式不正确。数据必须是Object类型。",data);
                }
            }
            ,getData: function() {
                return this.data;
            }
            /**
             * 上传文件
             * @return {Undefined} 无返回值
             */
            ,uploadFile:function(){
                if(this.chkQueuedFile()){
                    this.progressBox.el.show();
                    this.worker.startUpload();
                }
            }
            /**
             * 取消上传
             * @return {Undefined} 无返回值
             */
            ,cancelUpload:function(){
                this.worker.cancelUpload();
            }
            /**
             * 重置模块样式
             * @return {Undefined} 无返回值
             */
            ,resetClass:function(){
                this.setSelectBtnClass("",this.config.selectButtonText);
                this.selectBtn.textSpan.html(this.config.uploadBtnTips.normal);
            }
            /**
             * 当前选择文件发生改变时
             * @param  {Object}    file 文件信息对象
             * @return {Undefined}      无返回值
             */
            ,onFlashFileChange:function(file){
                if(this.chkQueuedFile(file)){
                    // this.setSelectBtnClass("ready",this.config.uploadBtnTips.ready);
                }else{
                    this.worker.cancelUpload(file.id);
                }
            }
            ,setSelectBtnClass:function(cls,txt){
                this.selectBtn.textSpan.attr("class",cls);
                this.selectBtn.textSpan.html(txt);
            }
            ,stroeFiles:function(){
                var files = []
                    ,file
                    ,len = this.worker.getStats();

                if(len){
                    len = len.files_queued; // - len.in_progress;
                    for(var i=0;i<len;i++){
                        file = this.worker.getQueueFile(i);
                        files.push({
                            'name': file.name,
                            'type': file.type,
                            'size': file.size
                        });
                    }
                    this.$files = files.slice(files.length-this.$incomingNum);
                }
                files = null;
            }
            ,onFlashUploadStart:function(file,files){
                this.fire(
                    "uploadStart"
                    ,{
                        "file":file
                        ,"files":this.$files
                    }
                );
                this.$files = null;
            }
            /**
             * 上传时进度条控制函数
             * @param  {Number}    fileSize 文件体积
             * @param  {Number}    loaded   已经上传的体积
             * @return {Undefined}          无返回值
             */
            ,onFlashProgress:function(fileSize,loaded,file){
                loaded = Math.round(loaded/fileSize*100);
                if(this.config.progress){
                    loaded = loaded > 100?"100%":loaded+"%";
                    this.progressBox.bar.css("width",loaded);
                    if(loaded === "100%"){
                        this.setSelectBtnClass("processed",this.config.uploadBtnTips.processed);
                    }
                }else{
                    this.fire(
                        "uploadProgress"
                        ,{
                            "loaded":loaded
                            ,"file":file
                        }
                    );
                }
            }
            /**
             * 检测文件
             * @param  {Object}  file 文件信息对象
             * @return {Boolean}      检测结果
             */
            ,chkQueuedFile:function(file){
                file = file || this.worker.getFile();
                var r = false;
                if(file){
                    // 限制特殊类型的文件大小
                    var rule = UPLOAD_RULES[this.config.type];
                    var max = rule.size;
                    if (rule.type_size){
                        var type = file.type.slice(1).toLowerCase();
                        max = rule.type_size[type] ? rule.type_size[type] : rule.size;
                    }
                    r = file.size < max;
                    if (!r){
                        max = max >> 10;
                        app.alert(rule.tip.replace('{size}', max));
                        this.resetClass();
                    }
                }
                return r;
            }
            /**
             * 上传成功后的操作
             * @param  {Object}    file 文件信息对象
             * @param  {Object}    re   服务器返回的信息
             * @return {Undefined}      无返回值
             */
            ,onFlashUploadSuccess:function(file,re){
                if(this.config.preview){
                    this.previewBox.el.empty();
                    if(_chkPreviewFileType(file.name)){
                        _buildPreview.call(this,re);
                    }
                }
                this.data = re;
                this.progressBox.el.hide();
                this.setSelectBtnClass("ok",this.config.uploadBtnTips.ok);
                this.fire(
                    "uploadSuccess"
                    ,{
                        "data":re
                    }
                );

                var me = this;
                this.timer = setTimeout(function(){
                    me.resetClass();
                },1000);
            }
            ,onFlashUploadError: function(file, message){
                app.error(message);
                this.failMsg({
                    "name": file.name
                    ,"txt": message || LANG("不符合要求。")
                });
                this.progressBox.el.hide();
                this.resetClass();
                this.fire("uploadError", message);
            }
            ,onEvent:function(ev){
                if(ev.from !== this && ev.param && ev.param.target){
                    var action = ev.param.target.attr("data-action");
                    if(this[action]){
                        this[action]();
                    }
                }
            }
            ,reset:function(){
                if(this.config.preview){
                    this.previewBox.el
                        .empty()
                        .hide();
                }
                this.config.data = {};
                this.data = {};
                this.$failMsg = {};
                this.$failNum = 0;
            }
            ,destroy:function(){
                this.worker.destroy();
                this.el.remove();
                Porter.master(this,"destroy");
            }
        }
    );

    exports.porter = Porter;
});