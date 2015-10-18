define(function(require, exports){
    var $ = require("jquery")
        ,app = require("app")
        ,view = require("view");

    var Progress = app.extend(
        view.container
        ,{
            init:function(config,parent){
                config = $.extend(
                    {
                        // 进度消息发送者。1对1
                        "sender":null
                        // 添加区域
                        ,"target":parent
                        ,"class":"M-Progress"
                        // 不同状态显示的文本
                        ,"texts":{
                        "wait":LANG("等待上传")
                        ,"pause":LANG("暂停")
                        ,"done":LANG("完成")
                        ,"failed":LANG("上传失败")
                        ,"cancel":LANG("上传取消")
                        ,"going":LANG("上传中({pre}%)")
                        ,"processing":LANG("处理中")
                    }
                        // 不同状态的样式
                        ,"statusCls":{
                        "wait":"M-ProgressWaiting"
                        ,"pause":"M-ProgressPause"
                        ,"done":"M-ProgressDone"
                        ,"failed":"M-ProgressFailed"
                        ,"cancel":"M-ProgressCancel"
                        ,"going":"M-ProgressGoing"
                        ,"processing":"M-ProgressProcessing"
                    }
                    }
                    ,config
                );

                Progress.master(this,null,config);
                Progress.master(this,"init",[config]);

                // 数据
                this.data = null;

                // 状态
                this.$status = "wait";

                // 模块状态
                this.$ready = false;

                this.doms = {
                    // 进度条主体外部容器
                    "box":$('<div class="M-ProgressBar"><p></p></div>')
                    // 进度条主体
                    ,"bar":null
                    // 状态栏容器
                    ,"status":$('<div class="M-ProgressStatus"></div>')
                }
                this.doms.bar = this.doms.box.find("p");

                this.build();
            }
            /**
             * 写入进度数据
             * @param  {Object} data 进度数据
             * @return {Object}      实例对象
             */
            ,setData:function(data){
                data = +data;
                if(isNaN(data)){
                    app.log("WT?");
                    return this;
                }
                this.data = data;
                if(this.$status === "pause"){
                    return this;
                }
                switch(this.data){
                    // 完成
                    case 100:
                        this.$status = "done";
                        this.setView("done");
                        break;

                    // 等待中
                    case 0:
                        this.$status = "wait";
                        this.setView("wait");
                        break;

                    // 失败
                    case -101:
                        this.$status = "failed";
                        this.setView("failed");
                        break;

                    // 正在处理
                    case 101:
                        this.$status = "processing";
                        this.setView("processing");
                        break;

                    // 取消
                    case -100:
                        this.cancel();
                        break;

                    // 过程中
                    default:
                        var text,conf = this.config;
                        this.$status = "going";
                        this.el.attr("class",conf["class"]+" "+conf.statusCls["going"]);
                        text = (""+conf.texts.going).replace("{pre}",this.data)
                        this.doms.status
                            .text(text);
                        this.doms.bar.width(this.data+"%");

                        text = conf = null;
                }

                return this;
            }
            /**
             * 进度响应
             * @param  {[type]} ev [description]
             * @return {[type]}    [description]
             */
            ,onProgress:function(ev){
                if(ev.from === this.config.sender){
                    // 只响应需要响应的模块
                    this.setData(ev.param);
                    return false;
                }
            }
            /**
             * 构造界面
             * @return {Undefined} 无返回值
             */
            ,build:function(){
                this.el.append(this.doms.status)
                    .append(this.doms.box);
                this.$ready = true;
                this.setData(0);
                return this;
            }
            /**
             * 重置
             * @return {Undefiend} 无返回值
             */
            ,reset:function(){
                this.data = null;
                // 回复样式
                this.el
                    .removeClass(this.config.statusCls[this.$status])
                    .addClass(this.config.statusCls.wait);
                // 状态
                this.$status = "wait";

                // dom
                // 界面的效果全部交予样式去操作
                var ds = this.doms;
                ds.status
                    .text(this.config.texts.wait);
                ds.bar.width(0);
                return this;
            }
            /**
             * 开始进度
             * @return {Object} 实例对象
             */
            ,start:function(){
                this.$status = "start";
                this.setData(this.data);
                return this;
            }
            /**
             * 暂停
             * @return {Object} 实例对象
             */
            ,pause:function(){
                this.$status = "pause";
                return this;
            }
            /**
             * 获取状态
             * @return {String} 当前状态
             */
            ,status:function(){

                return this.$status;
            }
            /**
             * 进度条变化中
             * @return {Object} 实例对象
             */
            ,going:function(){
                return this;
            }
            /**
             * 取消
             * @return {Object} 实例对象
             */
            ,cancel:function(){
                this.reset();
                this.fire(
                    "progressCancel"
                );
                return this;
            }
            /**
             * 设置界面
             * @param  {String} type 类型
             * @return {Object}      实例对象
             * @description          进行中，取消这两种类型不能设定
             */
            ,setView:function(type){
                var conf = this.config;
                this.$status = type;

                this.el.attr("class",conf["class"]+" "+conf.statusCls[type]);

                this.doms.status
                    .text(conf.texts[type]);

                return this;
            }
        }
    );

    exports.main = Progress;

})