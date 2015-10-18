define(function(require, exports){
    var $ = require("jquery")
        ,app = require("app")
        ,util = require("util")
        ,view = require("view")
        ,comm = require("common")
        ,datebar = require("views/datebar");

    /**
     * 在指定数组中排除某一个/多个元素
     * @param  {Array} arr      待筛选数组
     * @param  {Mix}   deadMans 要排除的数据
     * @return {Array}          筛选完的数组
     * @private
     * @todo 排除多个的还未实现
     */
    function _without(arr,deadMans){
        var newArr = [];
        for(var i = 0;i<arr.length;i++){
            if(arr[i] === deadMans){
                continue;
            }
            newArr.push(arr[i]);
        }
        return newArr;
    }

    function TagLabels(config){
        config = $.extend(
            true
            ,{
                "target":"body"
                ,"class":"M-tagLabels"
                ,"label":{
                    "html":LANG("标签：")
                }
                // 标签列表容器
                ,"tagContainer":{
                    // 容器主样式
                    "class":"M-tagLabelsContainer"
                    // 标题。用的是P标签。所以不要在html里写默认是块状显示的标签
                    // ,"title":{
                    // 	"html":LANG("选择一个合适的标签（点击即可）：")
                    // }
                    ,"inClass":"M-tagLabelsInner"
                    ,"tagClass":""
                    ,"tagAct":"act"
                }
                // 提交服务器的查询参数
                ,"param":{}
                // 读取所有标签
                ,"all": false
                // 标签类型
                // SweetyLabel|WhiskyLabel|null
                ,"type":"SweetyLabel"
                ,"data":null
                // 折叠
                ,"collapse":1
                // 数据发送类型。为真时发送标签文字，为假时发送Id
                ,"dataType":1
                // 数据节点
                ,"database":null
                // 显示文字
                ,"txts":{
                    "title":LANG("标签：")
                    ,"__nolabel__":LANG("其它")
                    ,"__all__":LANG("标签")
                }
                ,"tips":false
            }
            ,config || {}
        );

        // 数据接口
        this.database = config.database || "/rest/listlabel";

        var tmp = datebar.getDate();
        this.sysParam = config.all?{}:tmp;
        if(config.type){
            this.sysParam.type = config.type;
        }

        // 标签对象集合
        this.tags = {};

        // 标签数量
        this.len = 0;

        // 原始数据
        this.data = null;

        // 已选的数据
        this.selectedData = {};

        // 数据请求中
        this.busy = false;

        // 行高
        this.lineHeight = 0;

        // 整体高度
        this.allHeight = 0;

        // 折叠功能控制对象
        this.collapseCtrl = null;

        // 折叠状态
        this.collapseStatus = 0;
        //标签输入框线程控制
        this.inputBusy = 0;

        if(config.collapse){
            config.tagContainer["class"] += " M-tagLabels-allowCollapse";
        }else{
            config.tagContainer["class"] += " M-tagLabels-noCollapse";
        }

        TagLabels.master(this,null,config);

        tmp = null;
    }

    extend(
        TagLabels
        ,view.container
        ,{
            init:function(){
                this.render();

                var c = this.config;

                $('<label class="M-tagLabelsLabel"/>').text(c.label).appendTo(this.el);

                // 输入框
                this.tagLabelsInput = this.create(
                    "tagLabelsInput"
                    ,comm.input
                    ,{
                        "target":this.el
                        ,"label":null
                        ,"placeholder":LANG("输入标签或从下面对列表中选择")
                        ,"events":"blur"
                    }
                );

                if(c.tips){
                    this.create('tips', comm.tips, {
                        "target":this.el
                        ,"tips":c.tips
                    });
                }

                // 标签显示外部容器
                this.tagLabelsContainer = this.create(
                    "tagLabelsContainer"
                    ,view.container
                    ,{
                        "class":'tag_select'
                        ,"target":this.el
                        ,"html":'<div class="'+this.config.tagContainer.inClass+'"></div>'
                    }
                );

                this.tagLabelsContainer.tagsBox = this.tagLabelsContainer.el.find("div:first");
                // 事件
                this.dg(this.tagLabelsContainer.tagsBox, 'span', 'click', 'appendToInput');
                this.jq(this.tagLabelsInput.el,'input','inputChange');
                if(this.config.data){
                    this.setData(this.config.data);
                }
                this.refresh();
            }
            /**
             * 设定数据
             * @param {Array} data 标签数据
             * @return {Undefined} 无返回值
             */
            ,setData:function(data){
                TagLabels.self(this, 'setTag', data);
                return this.selectedData;
            }
            /**
             * 返回选中的标签数据
             * @return {Array} 返回选中的标签数组
             */
            ,getData: function(){
                var list = [];
                util.each(this.selectedData, function(check, tag){
                    if (check){
                        list.push(tag);
                    }
                });
                return list;
            }
            /**
             * 标签输入框监听事件,设定线程300毫秒后执行 changeTag事件
             * @param  {event} ev  jquery事件
             * @param  {dom} elm dom元素
             * @return {undefined}     [description]
             */
            ,inputChange:function(ev,elm){
                if(!this.inputBusy){
                    var me = this;
                    setTimeout(function(){
                        me.changeTag(elm.value);
                        me.inputBusy = 0;
                    },300)
                    this.inputBusy = 1;
                }
            }
            /**
             * 标签激活事件，根据传入value设定所以激活的标签
             * @param  {string} value [标签输入框的值]
             * @return {undefined}       [description]
             */
            ,changeTag:function(value){
                var me = this,data = this.selectedData,inputlist = value.split(/,|，/);
                util.each(data,function(item,index){
                    data[index] = 0;
                    if(util.has(me.tags,index)){
                        me.tags[index].el.removeClass('act');
                    }
                });
                util.each(inputlist,function(item){
                    var index = util.trim(item);
                    if(util.has(me.tags,index)){
                        data[index] = 1;
                        me.tags[index].el.addClass('act');
                    }
                })
            }
            /**
             * 添加/删除选中的标签到输入框。同时操作选中标签的样式
             * @param  {Object}    ev 事件对象
             * @return {Undefined}    无返回值
             */
            ,appendToInput:function(ev, elm){
                var val = this.tagLabelsInput.el.val()
                    ,tagVal = elm.innerHTML.replace(/<em>(.*)<\/em>/,"");
                if(val === ''){
                    val = [];
                }else{
                    val = val.split(/,|，/);
                }
                if (this.selectedData[tagVal]){
                    val = _without(val,tagVal);
                    delete this.selectedData[tagVal];
                }else{
                    val.push(tagVal);
                    this.selectedData[tagVal] = 1;
                }
                $(elm).toggleClass(this.config.tagContainer.tagAct);
                this.tagLabelsInput.el.val(val);
                tagVal = val = null;
            }
            /**
             * 插入标签
             * @param  {String} tag 标签名
             * @return {Object}     标签对应的实例
             */
            ,addTag:function(tag,target){
                target = target || this.tagLabelsContainer.tagsBox;

                this.tags[tag.name] = this.create(
                    tag.name
                    ,view.container
                    ,{
                        "target":target
                        ,"tag":"span"
                        ,"class":this.selectedData[tag.name] && this.config.tagContainer.tagAct || this.config.tagContainer.tagClass
                        ,"html":tag.name+"<em>("+tag.count+")</em>"
                    }
                );
                this.tags[tag.name].data = tag;
                return this.tags[tag.name];
            }
            /**
             * 输入框失去焦点时的响应函数
             * @param  {Object}    ev 消息对象
             * @return {Undefined}    无返回值
             */
            ,onBlur:function(ev){
                var val = ev && ev.param.value.split(/,|，/);
                TagLabels.self(this,'setTag',val);
            }
            /**
             * 删除标签
             * @param  {String}    tag 标签索引
             * @return {Undefined}     无返回值
             */
            ,removeTag:function(tag){
                var _tag = this.tags[tag];
                _tag.destroy();
                delete this.tags[tag];
                _tag = null;
            }
            /**
             * 删除所有标签
             * @return {Undefined}     无返回值
             */
            ,removeAllTags:function(){
                try{
                    for(var n in this.tags){
                        this.removeTag(n);
                    }
                }catch(err){
                    if(window.console){
                        console.error(err);
                    }
                }
            }
            /**
             * 数据请求响应函数
             * @param  {Object}    err  错误信息
             * @param  {Object}    data 返回的数据对象
             * @return {Undefined}      无返回值
             */
            ,onData:function(err,data){
                this.busy = false;
                var tagBox = this.tagLabelsContainer.tagsBox;
                tagBox.removeClass("M-tagLabelsloading");
                if(err){
                    app.alert(err.message);
                    return false;
                }else {
                    this.len = data.total;
                    this.data = data.items;

                    for(var i = 0;i<data.total;i++){
                        if (this.data[i].name == '__nolabel__'){
                            this.len--;
                            continue;
                        }
                        this.addTag(this.data[i]);
                    }
                    var tags = [];
                    util.each(this.selectedData, function(chk, tag){
                        if (chk) { tags.push(tag); }
                    });
                    TagLabels.self(this,'setTag',tags);
                    this.fire("sizeChange");
                }
            }
            /**
             * 返回自定义参数
             * @return {Object} 参数对象
             */
            ,setParam:function(param){

                $.extend(this.config.param, param);
            }
            /**
             * 刷新标签列表
             * @return {Undefined} 无返回值
             */
            ,refresh:function(){
                if (this.busy) {return false;}
                this.busy = true;

                var tagBox = this.tagLabelsContainer.tagsBox;
                tagBox.addClass("M-tagLabelsloading");
                this.removeAllTags();
                app.data.get(
                    this.database
                    ,$.extend({}, this.config.param, this.sysParam)
                    ,this
                );
            }
            /**
             * 销毁函数
             * @return {Undefined} 无返回值
             */
            ,beforeDestroy:function(){
                this.tagLabelsContainer.tagsBox.undelegate("span","click",this,this.appendToInput);
                this.el.remove();
            }
            /**
             * 时间改变的响应函数
             * @param  {Object}  ev 消息对象
             * @return {Boolean}    阻止冒泡
             */
            ,onChangeDate:function(ev){
                ev = ("stastic_all_time" in ev.param) ?ev.param:ev.param.nowTimestamp;
                $.extend(this.sysParam,ev);
                this.refresh();
                ev = null;
                return false;
            }
            /**
             * 重置
             * @return {Undefined} 无返回值
             */
            ,reset:function(){
                this.selectedData = {};
                this.tagLabelsInput.el.val("");
                this.tagLabelsContainer.tagsBox.find("span").removeClass(this.config.tagContainer.tagAct);
            }
            /**
             * 检测总体高度与行高
             * @return {Boolean} 总体高度与行高对比度结果
             */
            ,chkLine:function(){
                if(!this.config.collapse){
                    return false;
                }
                if(!this.lineHeight){
                    this.lineHeight = app.util.first(this.tags).el.height();
                    this.allHeight = this.tagLabelsContainer.tagsBox.height();
                    this.collapseCtrl[
                    this.allHeight <= this.lineHeight*1.5 && "hide" || "show"
                        ]();
                    this.tagLabelsContainer.tagsBox.height(this.lineHeight);
                }

            }
            ,toggleLine:function(){
                // this.collapseCtrl
                if(this.collapseStatus){
                    this.tagLabelsContainer.tagsBox.height(this.lineHeight);
                }else{
                    this.tagLabelsContainer.tagsBox.css("height","100%");
                }
                this.collapseCtrl.html(this.collapseStatus?this.collapseCtrl.attr("data-open"):this.collapseCtrl.attr("data-close"));
                this.collapseStatus = !this.collapseStatus;
            }
        },{
            /**
             * 检查标签
             * @param  {Array}  val 已输入的标签
             * @param  {Object} tmp 索引对象
             * @return {Object}     索引对象
             * @private
             */
            setTag: function(list){
                var cls = this.config.tagContainer.tagAct;
                var sels = this.selectedData;
                var tags = this.tags;
                var news = {};
                var text = [];
                util.each(list, function(tag){
                    tag = util.trim(tag);
                    if (tag === ''){ return; }
                    if (!sels[tag] && tags[tag]){
                        tags[tag].el.addClass(cls);
                    }
                    text.push(tag);
                    sels[tag] = news[tag] = 1;
                });
                util.each(sels, function(chk, tag){
                    if (chk && !news[tag]){
                        if (tags[tag]){
                            tags[tag].el.removeClass(cls);
                        }
                        return null;
                    }
                });
                this.tagLabelsInput.el.val(text.toString());
                cls = news = sels = tags = null;
                return this.selectedData;
            }
        }
    );

    exports.base = TagLabels;

    function SimpleLabels(config){
        config = $.extend(
            {
                "tagContainer":{
                    "class":"M-tagLabelsSimpleContainer"
                    ,"inClass":"wraper"
                }
            }
            ,config
        );
        SimpleLabels.master(this,null,config);
    }
    extend(
        SimpleLabels
        ,TagLabels
        ,{
            init:function(){
                this.render();

                // 标签显示外部容器
                this.tagLabelsContainer = this.create(
                    "tagLabelsContainer"
                    ,view.container
                    ,{
                        "target":this.el
                        ,"class":this.config.tagContainer["class"]
                        ,"html":'<label class="spLabelTitle">'+this.config.txts.title+'</label><div class="'+this.config.tagContainer.inClass+'"></div>'
                    }
                );

                this.tagLabelsContainer.tagsBox = this.tagLabelsContainer.el.find("div:first");

                if(this.config.collapse){
                    this.collapseCtrl = $('<em class="ctrlBnt" data-open="'+LANG("更多")+'" data-close="'+LANG("收起")+'">'+LANG("更多")+'</em>');
                    this.tagLabelsContainer.el.append(this.collapseCtrl);
                    this.collapseCtrl.bind("click",this,this.doCollapse);
                }

                // 事件
                this.tagLabelsContainer.tagsBox.delegate("span","click",this,this.appendToInput);

                this.refresh();
            }
            /**
             * 发送选择请求
             * @param  {Object}    ev 消息对象
             * @return {Undefined}    无返回值
             */
            ,appendToInput:function(ev){
                var me = ev.data
                    ,cn = me.config.tagContainer.tagAct
                    ,tag = $(this)
                    ,tags
                    ,list = [];

                // if(tag.attr('data-name') !== '__all__'){
                tag.toggleClass(cn);
                // }

                tags = tag.parent().find('.' + cn);
                // list = null;

                if(tag.attr('data-name') == '__all__' && tags.length > 1){
                    tags.removeClass(cn);
                    tag.addClass(cn);
                }else if(tag.attr('data-name') == '__all__' && tags.length ==1){
                    return;
                }else{
                    list = [];
                    for (var i=0; i<tags.length; i++){
                        tag = tags.eq(i).attr(me.config.dataType && 'data-name' || 'data-id');
                        if(me.config.dataType){
                            tag = tags.eq(i).attr('data-name');
                        }else{
                            tag = +tags.eq(i).attr('data-id');
                        }
                        if (tag && tag != '__all__'){
                            list.push(tag);
                        }else{
                            tags.eq(i).removeClass(cn);
                        }
                    }
                }
                me.fire("simpleLabelChange",list);

                me = cn = tag = tags = list = null;
            }
            /**
             * 请求响应函数
             * @param  {Object}    err  错误信息
             * @param  {Object}    data 请求返回的数据
             * @return {Undefined}      无返回值
             */
            ,onData:function(err,data){
                var tagBox = this.tagLabelsContainer.tagsBox;
                tagBox.removeClass("M-tagLabelsloading");
                if(!err){

                    this.removeAllTags();

                    this.len = data.total;
                    this.data = data.items;
                    var _all;
                    this.tagLabelsContainer.tagsBox.empty();
                    for(var i = 0;i<this.len;i++){
                        if(this.data[i].name === "__nolabel__"){
                            _all = this.addTag({
                                "name":this.config.txts["__nolabel__"]
                                ,"count":this.data[i].count
                            });
                        }else{
                            _all = this.addTag(this.data[i]);
                        }
                        _all.el.attr('data-name', this.data[i].name);
                        if(!this.config.dataType && (this.data[i].Id || this.data[i]._id)){
                            _all.el.attr('data-id', (this.data[i].Id || this.data[i]._id));
                        }
                    }
                    _all = this.addTag({
                        "name":LANG("所有%1",this.config.txts["__all__"])
                        ,"count":data.items_child_count
                    });
                    _all.el.addClass(this.config.tagContainer.tagAct);
                    this.tagLabelsContainer.tagsBox.prepend(_all.el);
                    _all.el.attr('data-name', '__all__');

                    this.chkLine();

                    data = null;
                    this.fire("sizeChange");
                }else{
                    tagBox.removeClass("M-ajaxErr");
                }
            }
            ,doCollapse:function(ev){
                ev.data.toggleLine();
            }
        }
    );
    exports.simple = SimpleLabels;

    function MultiLabels(config){
        this.config = $.extend(
            {
                "tagContainer":{
                    "class":"M-tagLabelsMultiContainer"
                    ,"inClass":""
                }
                ,"param":{
                "Id":0
            }
            }
            ,config
        );
        MultiLabels.master(this,null,this.config);
        this.database = "/rest/listsweetyinfo";

        // 行集合
        this.rows = {};
        // 标签集合
        this.tags = {};
        // 原始数据
        this.data = {};

        // 已选中的数据
        this.selectedData = {};
    }

    /**
     * 对应名字
     * @type {Object}
     */
    var _LABEL_TYPE_NAME = {
        "wh":LANG("尺寸")
        ,"type":LANG("类型")
        ,"size":LANG("大小")
    }

    function _buildLabelRow(data,name){
        var row = this.create(
                "row_"+name
                ,view.container
                ,{
                    "target":this.tagLabelsContainer.el
                    ,"class":"theLabelRow"
                    ,"html":'<label class="spLabelTitle">'+_LABEL_TYPE_NAME[name]+'：</label><div class="'+this.config.tagContainer.inClass+'"></div>'
                }
            )
            ,all = 0;

        this.$tags[name] = {};

        row.labelBox = row.el.find("div:first");
        for(var n in data){
            this.$tags[name][n] = this.addTag(
                {
                    "name":n
                    ,"count":data[n].length
                    ,"Id":(data[n].Id || data[n]._id)
                }
                ,row.labelBox
            );
            this.$tags[name][n].el.attr({
                "data-type":n
                ,"data-is":name
            });
            if(!this.config.dataType && (data[n].Id || data[n]._id)){
                this.$tags[name][n].el.attr('data-id', (data[n].Id || data[n]._id));
            }
            all += data[n].length;
            this.len += 1;
        }
        // this.$tags[name] = this.tags
        all = this.addTag(
            {
                "name":LANG("所有%1",_LABEL_TYPE_NAME[name])
                ,"count":all
            }
            ,row.labelBox
        );
        row.labelBox.prepend(all.el.addClass('act').attr({
            "data-type":"all"
            ,"data-is":name
        }));

        if(this.config.collapse){
            this.collapseCtrl = $('<em class="ctrlBnt" data-open="'+LANG("更多")+'" data-close="'+LANG("收起")+'">'+LANG("更多")+'</em>');
            row.labelBox.append(this.collapseCtrl);
            this.collapseCtrl.bind("click",this,this.doCollapse);
        }
        var lineHeight = this.$lineHeight = app.util.first(this.tags).el.height()+5;
        if(row.labelBox.height()>lineHeight ){
            row.labelBox.height(lineHeight)
            this.collapseCtrl.show();
            this.collapseStatus = false;
        }
        return row;
    }

    extend(
        MultiLabels
        ,TagLabels
        ,{
            init:function(){
                this.render();

                // 标签显示外部容器
                this.tagLabelsContainer = this.create(
                    "tagLabelsContainer"
                    ,view.container
                    ,{
                        "target":this.el
                        ,"class":this.config.tagContainer["class"]
                    }
                );

                this.tagLabelsContainer.tagsBox = $('<div></div>');
                this.tagLabelsContainer.el.append(this.tagLabelsContainer.tagsBox);
                // 事件
                this.tagLabelsContainer.el.delegate("span","click",this,this.appendToInput);

                this.refresh();
                this.$tags = {};
            }
            /**
             * 刷新请求响应函数
             * @param  {Object}    err  错误消息对象
             * @param  {Object}    data 服务器返回的数据对象
             * @return {Undefined}      无返回值
             */
            ,onData:function(err,data){
                var tagBox = this.tagLabelsContainer.tagsBox;
                tagBox.removeClass("M-tagLabelsloading");
                if(!err){
                    this.removeAllTags();

                    this.len = 0;
                    this.data = data.items;

                    this.tagLabelsContainer.el.empty();
                    for(var n in this.data){
                        this.rows[n] = _buildLabelRow.call(this,this.data[n],n);
                    }

                    if(!this.len){
                        // 如果毛有
                        this.tagLabelsContainer.el.empty().append(LANG("没有任何标签。"));
                    }

                    this.fire("sizeChange");
                }else{
                    tagBox.removeClass("M-ajaxErr");
                }
            }
            /**
             * 刷新
             * @param {Object}      param id
             * @return {Undefined}        无返回值
             */
            ,refresh:function(param){
                var tagBox = this.tagLabelsContainer.tagsBox;
                // 清除标签
                this.removeAllTags();
                // 清除行
                try{
                    for(var m in this.rows){
                        this.rows[m].destroy();
                        delete this.rows[m];
                    }
                }catch(err){
                    if(window.console){
                        console.error(err);
                    }
                }
                tagBox.addClass("M-tagLabelsloading");

                if (param){
                    this.setParam(param);
                }
                app.data.get(
                    this.database
                    ,$.extend({}, this.config.param, this.sysParam)
                    ,this
                );
            }
            /**
             * 点击
             * @param  {Object}    ev jq事件对象
             * @return {Undefined}    无返回值
             */
            ,appendToInput:function(ev){
                var me = ev.data
                // ,tagVal = this.innerHTML.replace(/<em>(.*)<\/em>/,"");
                    ,tag = $(this)
                    ,type = tag.attr("data-type")
                    ,is;

                // 计数器
                var countGlo = 0;

                // 复原
                me.selectedData = {};

                if(type){
                    if(type == "all"){
                        tag.siblings().removeClass("act");
                        tag.toggleClass("act");
                    }else{
                        tag.toggleClass("act");
                        tag.siblings().first().removeClass("act");
                    }
                }
                var data = {};
                for(var i in me.$tags){
                    var tags = me.$tags[i],
                        obj = {};

                    // 局部计数器
                    var countLoc = 0;

                    // 循环获取选中的数据
                    for(var n in tags){
                        if(me.tags[n].el.hasClass("act")){
                            type = me.tags[n].el.attr("data-type");
                            if(type !== "all"){
                                obj[type] = me.selectedData[type] = me.data[me.tags[n].el.attr("data-is")][type];
                                countGlo++;countLoc++;
                            }
                            type = null;
                        }
                    }

                    data[i] = countLoc ? obj : "";
                }

                // // 循环获取选中的数据
                // for(var n in me.tags){
                // 	if(me.tags[n].el.hasClass("act")){
                // 		type = me.tags[n].el.attr("data-type");
                // 		if(type !== "all"){
                // 			me.selectedData[type] = me.data[me.tags[n].el.attr("data-is")][type];
                // 			count++;
                // 		}
                // 		type = null;
                // 	}
                // }
                me.fire(
                    "labelChange"
                    ,{
                        "type":"multi"
                        ,"data": countGlo ? data : ""
                    }
                );

                tag = type = is = null;
            }
            ,doCollapse: function(ev){
                var me = ev.data;
                var elm = $(this);

                if(me.collapseStatus){
                    elm.parent().height(me.$lineHeight);
                }else{
                    elm.parent().css("height","100%");
                }
                elm.html(me.collapseStatus?me.collapseCtrl.attr("data-open"):me.collapseCtrl.attr("data-close"));
                me.collapseStatus = !me.collapseStatus;
            }
        }
    );
    exports.multi = MultiLabels;


    /**
     * 列表列表类型选择
     */
    function ListType(config, parent){
        config = $.extend(true, {
            'class': 'M-tagLabelsSimpleContainer',
            'target': parent,
            'title': LANG('类型：'),
            'all_label': LANG('所有'),
            'data': [null, LANG('PC广告'), LANG('广告监测')/*, LANG('直投')*/],
            'url': null, // 数据接口地址
            'param': null, // 接口参数
            'format': null, // 数据格式化
            // 是否支持多选
            'multiple':false,
            'collapse':true // 折叠
        }, config);
        ListType.master(this, null, config);
        // 数据列表
        this.$data = null;
        // 当前选中的项目
        this.$type = -1;
    }
    extend(ListType, view.container, {
        init: function(){
            var c = this.config;
            ListType.master(this,'init');
            $('<label/>').text(c.title).addClass('spLabelTitle').appendTo(this.el);
            this.$tagBox = $('<div class="tagLoading"/>').appendTo(this.el);
            this.$body = $('<div '+(c.collapse?'':'class="M-tagLabelsListTypeBox"')+'/>').appendTo(this.el);
            this.$wrapBody = $('<div class="wraper"/>').appendTo(this.$body);
            this.$innerBody = $('<div/>').appendTo(this.$wrapBody);
            this.dg(this.$body, 'span', 'click', 'eventClick');
            this.lineHeight = this.$wrapBody.css('line-height');
            this.collapseStatus = false;
            if (c.data){
                this.setData(c.data);
            }else if (c.url){
                this.load();
            }
        },
        /**
         * 给指定的label增加样式
         * @param  {Number} dataId    行所在id
         * @param  {String} className 增加的class
         * @return {Boolean}          增加的label数量
         */
        addClass: function(dataId, className){
            return !!this.el.find('[data-id='+dataId+']').addClass(className).length;
        },
        eventClick: function(evt, elm){
            elm = $(elm);
            var type = elm.attr('data-id');
            if(type === undefined){
                type = null;
            }
            if (type == this.$type){
                return false;
            }
            this.$body.find('.act').removeClass('act');
            this.$type = type;
            elm.addClass('act');
            // 类型如果没有设置值，默认返回产从1～N的数值
            // 全部是null
            this.fire('listTypeChange', {
                'type':type,
                'item':this.$data[type]
            });
            return false;
        },
        reset: function(){
            this.$innerBody.empty();
            this.$type = -1;
        },
        setData: function(data){
            this.reset();
            this.$data = data;
            var c = this.config;

            // 所有类型项目固有
            if (c.all_label){
                this.$innerBody.append('<span data-all="1" class="act">'+c.all_label+'</span>');
            }

            // 其他类型
            util.each(data, function(item, id){
                if (!item) {return;}
                var dom = $('<span/>').attr('data-id', id).appendTo(this.$innerBody);
                if (util.isString(item)){
                    dom.text(item);
                }else {
                    if (item.html){
                        dom.html(item.html);
                    }else {
                        dom.text(item.name);
                    }
                    if (util.has(item, 'count')){
                        dom.append('<i>('+item.count+')</i>');
                    }
                    if(item.def || (item.id && item.id == c.selected)){
                        // 有默认设置则去除之前设定的选中状态
                        this.$innerBody.find(".act").removeClass("act");
                        dom.addClass("act");
                        this.$type = id;
                    }
                    if (item.cls){
                        dom.addClass(item.cls);
                    }
                }
            }, this);
            this.$body.parent().addClass('M-tagLabels-allowCollapse');
            this.$wrapBody.height(this.lineHeight);
            var flag = this.$innerBody.height()>(parseInt(this.lineHeight,10)+5);
            if(c.collapse){
                if (!this.collapseCtrl){
                    this.collapseCtrl = $('<em class="ctrlBnt" />')
                        .attr('data-open', LANG('更多'))
                        .attr('data-close', LANG('收起'))
                        .text(LANG('更多'))
                        .appendTo(this.$body);
                    this.jq(this.collapseCtrl,'click','doCollapse');
                }
                this.collapseCtrl.toggle(flag);
            }
        },
        getData: function(all){
            var type = this.$type;
            if (all){
                if (type === null){
                    return null;
                }else if (this.$data){
                    return this.$data[type];
                }
            }else {
                return type;
            }
        },
        getOrignData:function(){
            return this.$data;
        },
        load: function(param){
            // this.$body.addClass('laoding');
            var c = this.config;
            if (param){
                c.param = util.merge(c.param, param);
            }
            this.$tagBox.addClass('M-tagLabelsloading');
            app.data.get(c.url, c.param, this);
        },
        onData: function(err, data){
            this.$tagBox.removeClass('M-tagLabelsloading');
            if (err){
                app.alert(err.message)
                return false;
            }
            if (util.isFunc(this.config.format)){
                this.setData(this.config.format(data.items));
            }else {
                this.setData(data.items);
            }
            return false;
        },
        doCollapse: function(){
            if(this.collapseStatus){
                this.$wrapBody.height(this.lineHeight);
            }else{
                this.$wrapBody.css("height","100%");
            }
            this.collapseCtrl.html(this.collapseStatus?this.collapseCtrl.attr("data-open"):this.collapseCtrl.attr("data-close"));
            this.collapseStatus = !this.collapseStatus;
        },
        hideAll: function(){
            this.el.find('span[data-all]:first').hide();
            return this;
        },
        setValue: function(id){
            if(id){
                this.el.find('span[data-id="'+id+'"]').click();
            }
            return this;
        }
    });
    exports.listType = ListType;

    //标签模块-广告位属性
    var AttrLabels = app.extend(view.container, {
        init: function(config, parent){
            config = $.extend(true, {
                'target': parent,
                'url': 'test/ads.json'
            }, config);
            AttrLabels.master(this, null, config);
            AttrLabels.master(this, 'init', arguments);
            this.$data = [];
            this.build();
            this.load();
        },
        build: function(){
            var c = this.config;
            $("<label />").text(c.text).appendTo(this.el);
            $("<div class='itemDiv all act' data-id='all' />").text(LANG("全部")).appendTo(this.el);
            this.$con = $("<div class='content'/>").appendTo(this.el);
            this.dg(this.el,'.itemDiv','click',this,'eventOnClick');
        },
        load: function(){
            //需要参数么？
            var c = this.config;
            app.data.get(c.url,this);
        },
        onData: function(err, data){
            if(err){
                app.error('Load Date Error', err);
                return false;
            }
            data = data.items;
            for(var i=0; i<data.length; i++){
                this.buildItem(i, data[i].Name,data[i].Ratio);
            }
        },
        buildItem: function(i, name, ratio){
            var con = $("<div class='itemDiv' />").attr({
                "data-id":i
            }).appendTo(this.$con);

            //添加子项目
            $("<p data-type=item />").text(name).appendTo(con);

            //暂不需要添加比率
            // //添加对应的比率
            // $("<p data-type=ratio />").text(ratio).appendTo(con);
        },
        eventOnClick:function(ev){
            var elm = $(ev.currentTarget);
            var serial = elm.attr("data-id");
            if(serial=="all"){
                //添加'全部'的类
                elm.addClass('act');
                //去掉其他的类
                elm.siblings('div').children().removeClass('act');
                //选‘全部’时候，为空
                this.$data=[];
            }else{
                elm.toggleClass('act');
                //去掉'全部'的类
                elm.parents(".P-campaignPositionAttrTag").find(".all").removeClass('act');
                //取消当前激活状态
                if(!elm.hasClass('act')){
                    var i = util.index(this.$data, serial);
                    this.$data[i] = '';
                }else{
                    this.$data.push(serial);
                }
            }
            this.fire('adsTagChange',this.$data);
        },
        getData: function(){
            var data = [];
            //去掉空值
            for(var i in this.$data){
                if(this.$data[i]!==''){
                    data.push(this.$data[i]);
                }
            }
            return data;
        },
        setData: function(data){
            //更新全局变量$data
            if(data){
                this.$data = data;
            }

            var items = this.el.find(".itemDiv");
            //遍历每一个div,为匹配成功的div添加激活状态
            for(var i = 0; i<items.length; i++){
                var val = $(items[i]).attr("data-id");
                if(util.index(data, val) !== -1){
                    items[i].addClass('act');
                }
            }

        },
        reset: function(){}
    });
    exports.attrLabels = AttrLabels;


    var ChannelLabels = app.extend(ListType, {
        init: function(config, parent){
            config = $.extend({
                'title': LANG('渠道：'),
                'url': '/rest/listadsubchannel',
                'mode': 0,
                'param': {
                    'no_stastic_data': 1,
                    'no_limit': 1
                }
            }, config);

            this.$mode = config.mode;
            var exchanges = app.config('exchanges') || [];
            var pcClient = this.$rtbs = []; // RTB

            util.each(util.clone(exchanges), function(item){
                // PC广告删除芒果渠道
                if(!item.noPC){
                    item.isPc = true;
                    pcClient.push(item);
                }
            });

            var moblieClient = this.$rtbsMT = []; // RTB移动端
            // 过滤出支持移动端的渠道
            util.each(util.clone(exchanges), function(item){
                if(item.hasMoblieClient){
                    if(item.id == app.config('exchange_group/youkuMoblie')){
                        // 暂时性移动端的优酷改名为优酷移动
                        item.name = _T('优酷移动');
                    }
                    if(item.id == app.config('exchange_group/yingji')){
                        item.name = _T('鹰击移动');
                    }
                    // 移动端的加个移动标识
                    item.isMobile = true;
                    moblieClient.push(item);
                }
            });

            this.$agents = [];

            ChannelLabels.master(this, null, config);
            ChannelLabels.master(this, 'init', arguments);
        },
        onData: function(err, data){
            if (!err){
                util.each(data.items, function(item){
                    return {'id': item.Id, 'name': item.Name, 'agent': true};
                });
            }
            ChannelLabels.master(this, 'onData', arguments);
        },
        setData: function(data){
            this.$agents = data || [];
            var list = [null];
            switch (this.$mode){
                case 0: // 全部
                    list.push.apply(list, this.$rtbs.concat(this.$rtbsMT, data));
                    break;
                case 1: // RTB
                    list.push.apply(list, this.$rtbs);
                    break;
                case 2: // 代理
                    list.push.apply(list, data);
                    break;
                case 3: // 直投
                    break;
                case 4: // 移动端
                    list.push.apply(list, this.$rtbsMT);
                    break;
                case 5: // RTB+移动
                    list.push.apply(list, this.$rtbs.concat(this.$rtbsMT));
                    break;
            }
            return ChannelLabels.master(this, 'setData', [list]);
        },
        setMode: function(mode){
            this.$mode = mode;
            this.setData(this.$agents);
        }
    });
    exports.channelLabels = ChannelLabels;
});