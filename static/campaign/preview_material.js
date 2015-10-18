define(function(require, exports){
    var $ = require("jquery")
        ,app = require("app")
        ,view = require("view")
        ,comm = require("common")
        ,util = require('util')
        ,progress = require("progress");


    var Total = app.extend(
        view.container
        ,{
            init:function(config) {
                config = $.extend(
                    {
                        "total":0
                        ,"class":"M-totalBar"
                        ,"text":{
                        "tip":LANG("已上传")
                        ,"sp":"/"
                    }
                        ,"cls":{
                        "text":"M-totalBarText"
                        ,"barBox":"M-totalBarBox"
                    }
                    }
                    ,config
                );
                Total.master(this,null,config);
                Total.master(this,"init",[config]);
                this.$done = 0;
                this.$total = isNaN(this.config.total)?0:this.config.total;
                this.doms = {};
                this.build();
            }
            ,build:function(){
                var ds = this.doms
                    ,conf = this.config;
                ds.text = $('<div class="'+conf.cls.text+'">'+conf.text.tip+'<strong><span>0</span>'+conf.text.sp+'<em>'+conf.total+'</em></strong></div>');
                ds.barBox = $('<div class="'+conf.cls.barBox+'"><p></p></div>');
                ds.bar = ds.barBox.find("p:first");
                ds.bar.width(0);
                this.el.append(ds.text).append(ds.barBox);
                ds.total = ds.text.find("em:first");
                ds.text = ds.text.find("span:first");
            }
            ,setData:function(n){
                if(!isNaN(+n)){
                    this.$done = +n;
                    this.doms.text.text(this.$done);
                    this.doms.bar.width(
                        (this.$done/this.$total)*100+"%"
                    );
                    if(this.$done === this.$total){
                        this.reset();
                        this.fire(
                            "totalReached"
                        );
                    }
                }
            }
            ,reset:function(){
                this.$done = 0;
                this.$total = 0;
                this.doms.text.text(0);
                this.doms.bar.width("0%");
                this.doms.total.text(0);
                return this;
            }
            ,setTotal:function(n){
                this.$total = isNaN(+n)?0:+n;
                this.doms.total.text(this.$total);
                return this.$total;
            }
        }
    );

    /**
     * 素材预览
     * @param {Object} config 模块配置
     */
    var PreviewMaterial = app.extend(
        view.container
        ,{
            init:function(config){
                config = $.extend(
                    true
                    ,{
                        "target":"body"
                        ,"prefix":""
                        ,"readonly":0
                        ,"class":"M-previewMaterial"
                        ,"database":null
                        // 资源渲染显示的开始服务器地址
                        ,"host":app.config("front_base")
                        ,"preview":1
                        ,"progress":1
                        // 自动命名
                        ,"autoName":0
                        // 允许删除
                        ,"allowDel":1
                        // 显示上传失败的项目
                        ,"showFail":1
                        // 0 则不做限制
                        ,"maxShow":5
                        // 资源缩略图地址
                        ,"thumbUrl":app.config("front_base")+"sweety/imageshow"
                        ,"thumbHeight":80
                        ,"thumbWidth":65
                        ,"isEdit":0
                        ,"showTotal":1
                    }
                    ,config
                );
                // http://dsp.server/sweety/imageshow?Path={Path}&Width=80&Height=100

                config.thumbUrl = config.thumbUrl+"?Path={Path}&Width="+config.thumbWidth+"&Height="+config.thumbHeight;

                PreviewMaterial.master(this,null,config);
                PreviewMaterial.master(this,"init",[config]);

                // 列表id
                this.lid = 1;
                // 行实例合集
                this.lists = {};
                this.failedList = {};

                // 数据合集
                this.data = {};

                // 预览素材数量
                this.len = 0;
                this.failed = 0;
                this.database = this.config.database || "/rest/listsweetycreative";

                // 成功上传的内容容器的滚动条实例
                this.$goodScroller = null;
                // 上传失败的内容容器的滚动条实例
                this.$badScroller = null;
                // 正在上传的内容
                this.$nowUploading = null;
                // 上传队列
                this.$uploadQueue = [];

                this.doms = {
                    "success":null
                    ,"failed":null
                }

                // 本次上传的总量
                this.$total = this.config.data && !isNaN(this.config.data.length)?this.config.data.length:0;
                // 已完成的数量(成功失败都算完成)
                this.$done = 0;

                this.build();

                if(this.config.data){
                    // this.load();
                    // 不load了，而是更改为直接setData
                    var data = this.config.data;
                    this.setData(data);
                    // onData里面移过来的
                    this.$totlaContant.setTotal(data.length);
                    for(var i = 0;i<data.length;i++){
                        this.$nowUploading = this.$uploadQueue.shift();
                        this.updateMaterial(data[i]);
                    }
                    this.fire("getPreviewMaterialSuccess",data);
                }
            }
            ,build:function(){
                var conf = this.config
                    ,areas;

                // 添加区域
                areas = this.doms.success = $('<div class="previewArea theSuccessList"></div>');
                this.list = this.create(
                    "list"
                    ,view.container
                    ,{
                        "target":this.doms.success
                        ,"tag":"ul"
                    }
                );

                if(conf.showFail){
                    // 失败区域
                    this.doms.failed = $('<div class="previewArea theFailedList"></div>');
                    this.failList = this.create(
                        "failList"
                        ,view.container
                        ,{
                            "target":this.doms.failed
                            ,"tag":"ul"
                        }
                    );
                    areas = areas.add(this.doms.failed);
                }

                this.el.append(areas);

                this.$goodScroller = this.create(
                    "goodScroller"
                    ,comm.scroller
                    ,{
                        "target":this.doms.success
                        ,"content":this.list.el
                        ,"dir":"V"
                        ,"pad":0
                    }
                );

                if(this.failList){
                    this.$badScroller = this.create(
                        "badScroller"
                        ,comm.scroller
                        ,{
                            "target":this.doms.failed
                            ,"content":this.failList.el
                            ,"dir":"V"
                            ,"pad":0
                        }
                    );
                }

                this.$totlaContant = this.create(
                    "totlaContant"
                    ,Total
                    ,{
                        "target":this.el
                    }
                );

                areas = null;
            }
            /**
             * 设定数据
             * @param {Array} data 数据
             */
            ,setData:function(data, done){
                for(var i=0;i<data.length;i++){
                    this.add(data[i], done);
                }
            }
            /**
             * 上传完成后的事件响应函数
             * @return {Bool} 阻止冒泡
             */
            ,onTotalReached:function(){
                this.$total = 0;
                this.$done = 0;
                this.$uploadQueue = [];
                this.$totlaContant.hide();
                this.fire("sizeChange");
                this.fire("allUploaded");
                return false;
            }
            /**
             * 负数添加
             * @param  {Array}     files 文件信息数组
             * @return {Undefined}       无返回值
             */
            ,multipleAdd:function(files){
                this.setTotal(files);
                for(var i = 0,len = files.length;i<len;i++){
                    if(files[i]){
                        this.add({
                            "Name":files[i].name
                            ,"FileType":files[i].type.substr(1)
                            ,"FileSize":files[i].size
                        },0,1);
                    }
                }
            }
            ,setTotal:function(files){
                this.$total += files.length;
                if(this.config.showTotal){
                    this.$totlaContant.show();
                }
                this.$totlaContant.setTotal(this.$total);
            }
            /**
             * 文件上传失败
             * @param  {Object}    file 文件信息
             * @return {Undefined}      无返回值
             * @description             未实际联调测试
             */
            ,uploadFailed:function(file){

                var now = this.$nowUploading
                    ,id = now.name.el.attr("data-id");
                now.progress.setData(-101);
                this.failedList[id] = this.lists[id];
                delete this.lists[id];
                delete this.data[id];
                this.lid -= 1;
                this.len -= 1;
                this.failed++;
                this.$goodScroller.measure();

                this.failList.el.append(this.failedList[id].el);
                this.$badScroller.measure();

                this.$nowUploading = null;

                this.$done += 1;
                this.$totlaContant.setData(this.$done);
            }
            /**
             * 更新上传进度
             * @param  {Number}    loaded 上传进度0～100
             * @return {Undefined}        无返回值
             */
            ,updateUploadProgress:function(loaded){
                if(!this.$nowUploading){
                    this.$nowUploading = this.getQueue();
                    if(!this.$nowUploading){
                        return;
                    }
                }
                if(this.$nowUploading.progress.el){
                    this.$nowUploading.progress.setData(loaded);
                }
                if(loaded === 100){
                    // 上传完成后要等服务器处理素材
                    this.$nowUploading.progress.setData(101);
                }
            }
            /**
             * 获取正在上传的队列对象
             * @return {Object} 正在上传的对象
             */
            ,getQueue:function(){
                var tmp = null;
                // 上传过程中如果被删除，则对应的项会被置为null
                while(!tmp && this.$uploadQueue.length){
                    tmp = this.$uploadQueue.shift();
                }
                return tmp;
            }
            /**
             * 更新预览信息
             * @param  {Object}    data 服务器返回的文件信息
             * @return {Undefined}      无返回值
             */
            ,updateMaterial:function(data,pass){
                var now = this.$nowUploading
                    ,tmp;

                if(!now || !now.name.el){
                    this.$nowUploading = null;
                    this.$totlaContant.setData(this.$done);
                    return;
                }
                tmp = now.name.el.attr("data-id");
                now.progress.setData(100);

                data.indexKey = this.data[tmp].indexKey;
                delete this.data[tmp];
                if(!pass){
                    if (!data.Name) {
                        data.Name = _getName(this.config.prefix,data);
                    }
                    now.name.el.attr("data-id",data._id).val(
                        data.Name
                    );
                    if(this.config.preview){
                        now.previewBnt.el
                            .attr("data-id",data._id).show();
                    }
                    var img = $('<img src="'+util.imageThumb(data.Thumb, 65, 80)+'" />');
                    // 图片错误监听
                    // @todo 太丑了！要找另外的解决方案
                    util.imageError(img,this.config.type);
                    now.pic
                        .attr("class","materialType_preview")
                        .html("")
                        .append(img);
                    img = null;

                    now.fileInfo.html(
                        _getFileInfo(data)
                    );
                }

                this.data[data._id] = data;
                this.$nowUploading = null;
                this.$done += 1;
                this.$totlaContant.setData(this.$done);

                tmp = null;
                return now;
            }
            /**
             * 根据id获取数据
             * @return {Undefined} 无返回值
             */
            ,load:function(ids){
                // 暂遗弃
                if(util.isArray(ids)){
                    this.config.data = ids;
                }
                this.onData(null,this.config.data);
                if(this.config.data && this.config.data.length){
                    app.data.get(
                        this.database
                        ,{
                            "Ids":this.config.data.toString()
                            ,"no_limit":1
                        }
                        ,this
                    );
                }
            }
            /**
             * 获取数据的响应函数
             * @param  {Object}    err  错误信息
             * @param  {Object}    data 返回的数据
             * @return {Undefined}      无返回值
             */
            ,onData:function(err,data){
                // 暂遗弃
                if(!err){
                    this.setData(data.items);
                    this.$totlaContant.setTotal(data.items.length);
                    for(var i = 0;i<data.items.length;i++){
                        this.$nowUploading = this.$uploadQueue.shift();
                        this.updateMaterial(data.items[i]);
                    }
                    this.fire("getPreviewMaterialSuccess",data.items);
                }else{
                    console.log("Err=>",err,data);
                }
            }
            /**
             * 获取数据
             * @return {Undefined} 无返回值
             */
            ,getData:function(){
                var data = {};
                for(var n in this.data){
                    if(this.data[n]._id){
                        // 有下_id的数据才是已经上传成功的
                        data[n] = this.data[n];
                    }
                }
                return data;
            }
            /**
             * 添加
             * @param  {Object}     data 行对应的数据
             * @return {Undefined}       无返回值
             */
            ,add:function(data,isdone,multipleAdd){
                if(data && data._id && this.data[data._id]){
                    return;
                }
                if(!multipleAdd){
                    this.setTotal([data]);
                }
                data.lid = this.lid;
                // 现在不是传完再生成，只能用时间戳做索引
                data.indexKey = util.guid();
                this.data[data.indexKey] = data;
                if(data && data.Name){
                    var pf = data.Name.substr(0,data.Name.indexOf("_"));
                    this.config.prefix = pf || this.config.prefix;
                    pf= null;
                }
                this.lists[data.indexKey] = _buildItem.call(this,data);
                this.data[data.indexKey].Name = data && data.Name || this.lists[data.indexKey].name.el.val();
                this.lid += 1;
                this.len += 1;

                // 更新滚动条
                this.$goodScroller.measure();
                this.$goodScroller.scrollTo(-240000);

                // 加入队列
                this.$uploadQueue.push(
                    this.lists[data.indexKey]
                );
                this.data[data.indexKey].queue = this.$uploadQueue.length -1;
                if(isdone){
                    this.$nowUploading = this.$uploadQueue.shift();
                    this.updateMaterial(data);
                }
                this.fire("addPreviewMaterial",{"len":this.len});
                this.fire("sizeChange");
            }
            /**
             * 删除
             * @param  {Strung}    id 行id。对应原始数据中的_id
             * @return {Undefined}    无返回值
             */
            ,del:function(id){
                if (this.failedList[id]){
                    this.failedList[id].el.remove();
                    this.failedList[id].destroy();
                    delete this.failedList[id];
                    this.failed--;

                    this.$goodScroller.measure();

                    this.fire("sizeChange");
                    return;
                }

                var _id = this.lists[id].name.el.attr("data-id");
                this.lists[id].el.find("input,img").unbind();

                if(this.data[id] && this.data[id].queue !== undefined){
                    // 上传过程中被删
                    this.$uploadQueue[this.data[id].queue] = null;
                    this.$total -= 1;
                    this.$totlaContant.setTotal(this.$total);
                    if ( !this.$total) {
                        this.$totlaContant.hide();
                    }
                }

                this.$goodScroller.scrollBy(this.lists[id].el.outerHeight());

                this.lists[id].el.remove();
                this.lists[id].destroy();

                delete this.lists[id];
                delete this.data[_id];
                this.lid -= 1;
                this.len -= 1;

                this.$goodScroller.measure();

                this.fire("sizeChange");
                this.fire("delPreviewMaterial",{"len":this.len + this.failed,"id":_id});
            }
            /**
             * 预览
             * @param  {Strung}    id 行id。对应原始数据中的_id
             * @return {Undefined}    无返回值
             */
            ,preview:function(id){
                var item = this.data[id];
                if (item && item.Path) {
                    var url = util.formatIndex(
                        app.config('preview_page'),
                        encodeURIComponent(app.config('front_base')+item.Path), item.Height, item.Width, item.FileType
                    );
                    window.open(url,"PreviewMaterialWindow");
                }
            }
            /**
             * 重命名素材
             * @param {String}      id 行对应ID
             * @param {String}     val 名称文本框的值
             * @return {Undefined}     无返回值
             */
            ,rename:function(id,val){
                if(val !== this.data[id].Name && !this.config.readonly){
                    this.data[id].Name = val;
                }
            }
            /**
             * 修改名称前缀
             * @param  {String}    val 新的前缀
             * @return {Undefined}     无返回值
             */
            ,changePrefix:function(val){
                if(val != this.config.prefix && !this.config.readonly){
                    for(var n in this.data){
                        if(this.data[n]._id){
                            var dat = this.data[n]
                                ,newName = dat.Name.replace(this.config.prefix,val);
                            this.rename(dat._id,newName);
                            this.lists[dat.indexKey].name.el.val(newName);
                        }
                    }
                    this.config.prefix = val;
                }
            }
            /**
             * 其它的事件响应
             * @param  {Object} ev 消息对象
             * @return {Bool}      阻止冒泡，false
             */
            ,onEvent:function(ev){
                if(ev.from !== this && ev.param && ev.param.target){
                    var _id = ev.param.target.attr("data-id");
                    switch(ev.param.target.attr("data-action")){
                        case "del":
                            this.del(_id);
                            break;

                        case "rename":
                            if(ev.type === "blur" && !this.config.readonly){
                                this.rename(_id,ev.param.target.val());
                            }
                            break;

                        case "preview":
                            this.preview(_id);
                            break;
                    }
                    return false;
                }
            }
            /**
             * 重置
             * @return {Undefned} 无返回值
             */
            ,reset:function(){
                for(var n in this.data){
                    this.del(this.data[n].indexKey);
                    delete this.data[n];
                }
                this.$total = 0;
                this.$done = 0;
                this.$uploadQueue = [];
                this.$totlaContant.hide();
                return this;
            }
        }
    );

    /**
     * 生成行html结构
     * @param  {Object} data 行对应的数据
     * @return {String}      生成完的html字符串
     * @private
     */
    function _getItemHtml(data){
        return '<div class="fileTypePic"><div class="materialType_'+data.FileType+'"></div></div><div class="fileInfo"><p></p>'+_getFileInfo(data)+'</div><div class="itemCtrl"></div>';
    }

    /**
     * 生成文件说明
     * @param   {Object} data 文件数据
     * @return  {String}      文件数据html字符串
     * @private
     */
    function _getFileInfo(data){
        return '<div class="theFileInfo">'+'<span>'+LANG("类型：")+'<em>'+data.FileType+'</em></span><span>'+LANG("大小：")+'<em>'+Math.ceil(data.FileSize/1024)+'KB</em></span>'+(data.Width && data.Height && ('<span class="block">'+LANG("尺寸：")+'<em>'+(data.Width || "N/A")+"*"+(data.Height || "N/A")+'</em></span>') || '')+'</div>';
    }

    /**
     * 获取文件名称
     * @param   {String} pf   文件前缀
     * @param   {Object} data 文件数据
     * @return  {String}      文件名
     * @private
     */
    function _getName(pf,data){
        return pf+"_"+(data.Width && data.Width+"x" || "")+(data.Height && data.Height+"_" || "")+data.FileType+"_"+util.date("Y-m-d");
    }

    /**
     * 构建li
     * @param  {Object} data 当前行对应的数据
     * @return {Object}      当前行对应的实例
     * @private
     */
    function _buildItem(data){

        var item = this.create(
            "item_"+(data.indexKey || data.lid)
            ,view.container
            ,{
                "target":this.list.el
                ,"tag":"li"
                ,"html":_getItemHtml(data)
            }
        );
        // 预览图片容器
        item.pic = item.el.find(".fileTypePic > div:first");
        // 图片信息
        item.fileInfo = item.el.find(".theFileInfo");
        var name;
        if(this.config.autoName && this.config.prefix && !this.config.isEdit){
            // 自动命名且有前缀的时候
            name = _getName(this.config.prefix,data);
        }else{
            name = data.FileName || data.Name;
            if(!name){
                // 如果没名字，则需要自动命名
                console.warn("Warn ->",LANG("未找到对应字段，文件名称改用自动命名方式显示。"));
                name = _getName(this.config.prefix,data);
            }
        }
        // 名称输入框
        item.name = item.create(
            "name"
            ,comm.input
            ,{
                "target":item.el.find("p:first")
                ,"type":"text"
                ,"value":name
                ,"data-id":data.indexKey
                ,"data-action":"rename"
            }
        );
        data.Name = name;
        name = null;

        if(this.config.readonly){
            item.name.el.attr("disabled","disabled");
        }
        // item.el.find("p:first").append('<em>'+LANG("名称作为您今后管理的标识。<br/>例：创意_960x90_jpg_2013-01-06")+'</em>');

        if(this.config.progress){
            item.progress = item.create(
                "progress"
                ,progress.main
                ,{
                    "target":item.el.find(".itemCtrl:first")
                    ,"sender":this
                }
            );
        }

        if(this.config.preview){
            item.previewBnt = item.create(
                "previewBnt"
                ,comm.input
                ,{
                    "target":item.el.find(".itemCtrl:first")
                    ,"type":"button"
                    ,"value":LANG("预览")
                    // 行对应的索引与数据中的indexKey字段一致
                    ,"data-id":data.indexKey
                    ,"class":"linkBtn"
                    ,"data-action":"preview"
                }
            );
            item.previewBnt.el.hide();
        }else{
            item.el.find(".itemCtrl:first").addClass("noPreview");
        }

        // 删除按钮
        if(this.config.allowDel){
            item.delBnt = item.create(
                "delBnt"
                ,comm.input
                ,{
                    "target":item.el.find(".itemCtrl:first")
                    ,"type":"button"
                    ,"value":LANG("删除")
                    // 行对应的索引与数据中的_id字段一致
                    ,"data-id":data.indexKey
                    ,"class":"linkBtn"
                    ,"data-action":"del"
                }
            );
        }else{
            item.delBnt = null;
        }

        return item;
    }

    exports.base = PreviewMaterial;

    // for: 创意包编辑(flash素材上传tab)表单模块
    // date: 2015-05-12
    var CreativeEditFlashForm = app.extend(PreviewMaterial, {
        getData: function() {
            var data = CreativeEditFlashForm.master(this, 'getData', arguments);
            var res = [];
            util.each(data, function(item, id) {
                res.push(item);
            });
            return res;
        }
    });
    exports.flash = CreativeEditFlashForm;
});