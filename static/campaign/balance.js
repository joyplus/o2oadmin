define(function(require, exports){
    var $ = require('jquery');
    var app = require('app');
    var view = require('view');
    var cons = require("constant");
    var format;
    /**
     * 货币对应符号
     * @type {Object}
     */
    var CURRENCYS = cons.get("currencys");


    function Balance(config){
        config = $.extend(
            {
                "target":"body"
                // 当前货币
                ,"currency":"rmb"
                ,"class":"M-balance"
                ,"lClass":"loading"
                ,"nClass":"red"
                ,"txts":{
                // 余额前要显示的内容
                "before":LANG("余额 :")
            }
                ,"state":true
            }
            ,config
        );

        this.data = {
            // 余额
            "amount":null
            // 已用余额？
            ,"use_amount":null
            // 剩余金额
            ,"cp_rest_amount":null
        };

        // 数据节点
        this.database = "/user/account";

        Balance.master(this,null,config);

        // 自动刷新控制
        this.$auto_tid = 0;
    }
    extend(
        Balance
        ,view.container
        ,{
            init:function(){
                Balance.master(this,"init");
                this.build();
                this.hide();
                if (app.isLogin()){
                    this.autoFetch();
                }
            }
            /**
             * 构建显示界面
             * @return {Undefined} 无返回值
             */
            ,build:function(){
                this.el.append(this.config.txts.before+CURRENCYS[this.config.currency]+'<strong></strong>');
                this.moneyBox = this.el.find("strong:first");
            }
            /**
             * 远程获取余额
             * @return {Undefined} 无返回值
             */
            ,fetch:function(){
                this.moneyBox.addClass(this.config.lClass);
                app.data.get(
                    this.database
                    ,this
                    ,"onFetch"
                );
            }
            /**
             * 获取余额的回调函数
             * @param  {Object}    err  错误信息对象
             * @param  {Object}    data 信息对象
             * @return {Undefined}      无返回值
             */
            ,onFetch:function(err,data){
                if(err){
                    if(err.code !== undefined && this.chkErrCode(err.code)){
                        // 检测结果有返回则不再往下执行
                        return;
                    }
                    data = {
                        "cp_rest_amount":0
                        ,"use_amount":0
                    };
                }
                app.core.cast('balanceFetch', data);
                this.setData(data);
            }
            /**
             * 检测错误代码
             * @param  {Number}  code 错误代码
             * @return {Boolean}      检测结果
             */
            ,chkErrCode:function(code){
                // code = cons.get("error_code."+code);
                code = cons.get(["error_code",code]);
                if(code && code.uri){
                    // 有路由跳转设定
                    app.navigate(code.uri);
                }else if(code && this[code.action]){
                    // 有特定指定事件
                    this[code.action](code);
                }else{
                    code = null;
                }
                return !!code;
            }
            /**
             * 自动刷新余额 每60秒刷新一次
             * @return {undefined} 无返回值
             */
            ,autoFetch:function(){
                var self = this;
                if (self.$auto_tid){
                    clearInterval(self.$auto_tid);
                }
                self.fetch();
                self.$auto_tid = setInterval(function(){
                    self.fetch();
                }, 60000);
            }
            /**
             * 设定当前用户的余额
             * @param {Object} data 余额信息对象
             */
            ,setData:function(data){
                // @todo 先只做简单的替换。有特别需求总再做扩展
                var me = this,flag;
                this.data = data;
                require.async("grid/labels",function(mod){
                    format = mod.format;
                    me.moneyBox
                        .removeClass(me.config.lClass)
                        // 看是否有钱
                        .toggleClass(me.config.nClass,me.data.cp_rest_amount<=0)
                        .html(
                        format.currency(me.data.cp_rest_amount,1)
                    );
                });
                flag =(data.cp_rest_amount>0);
                if(this.config.state!=flag){
                    this.config.state = flag;
                    app.core.cast('balanceChange', flag);
                }
                return this.data;
            }
            /**
             * 重置
             * @return {Undefined} 无返回值
             */
            ,reset:function(){
                this.data = {};
                this.moneyBox
                    .removeClass(this.config.lClas)
                    .html("");
            }
            /**
             * 用户登出响应函数
             * @return {Undefined} 无返回值
             */
            ,onUserLogout:function(){
                this.hide();
                var id = this.$auto_tid;
                this.$auto_tid = 0;
                if (id){
                    clearTimeout(id);
                }
            }
            /**
             * 用户登录响应函数
             * @return {Undefined} 无返回值
             */
            ,onUserLogin:function(){
                this.reset();
                this.autoFetch();
            }
            /**
             * 获取当前用户的余额信息
             * @return {Object} 余额
             */
            ,getData:function(){
                return this.data;
            }
            ,getState: function(){
                return this.config.state;
            }
        }
    );
    exports.base = Balance;
});