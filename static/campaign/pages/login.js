define(function(require, exports){
    var $ = require('jquery')
        ,app = require('app')
        ,view = require('view')
        ,common = require('common')
        ,pop = require("popwin_base")
        ,util = require('util');

    var Password = app.extend(
        view.container
        ,{
            init: function(config,parent){
                config = $.extend({
                    "class":"P-loginPassword"
                    ,"itemClass":"M-formItem"
                    ,"labelClass":"M-formItemLabel"
                    ,"url":"/user/setpassword"
                }, config);
                Password.master(this, null, config);
                Password.master(this,"init",[config,parent]);
                this.build();
            }
            ,build:function(){
                var cls = {"class":this.config.itemClass};
                this.layout = this.create(
                    "layout"
                    ,view.layout
                    ,{
                        "target":this.el
                        ,"grid":[4,1]
                        ,"cellSet":[cls,cls,cls,cls]
                    }
                );
                cls = this.config.labelClass;
                this.create(
                    "pass"
                    ,common.input
                    ,{
                        "target":this.layout.get(1,1)
                        ,"type":"password"
                        ,"attr":{
                            "placeholder":LANG("请输入您的原始密码")
                        }
                        ,"label":{
                            "html":LANG("原密码：")
                            ,"class":cls
                        }
                    }
                );

                this.create(
                    "newpass"
                    ,common.input
                    ,{
                        "target":this.layout.get(2,1)
                        ,"type":"password"
                        ,"attr":{
                            "placeholder":LANG("请输入您的新密码")
                        }
                        ,"label":{
                            "html":LANG("新密码：")
                            ,"class":cls
                        }
                    }
                );

                var pwConfirm = this.create(
                    "cnfpass"
                    ,common.input
                    ,{
                        "target":this.layout.get(3,1)
                        ,"type":"password"
                        ,"attr":{
                            "placeholder":LANG("请再次输入您的新密码")
                        }
                        ,"label":{
                            "html":LANG("确认密码：")
                            ,"class":cls
                        }
                    }
                );

                var okBtn = this.create(
                    "change"
                    ,common.button
                    ,{
                        "text":LANG("确认修改")
                        ,"class":"btnAddGreen mt15"
                        ,"target":this.layout.get(4,1)
                    }
                );

                // 最后一个input绑定事件，监听enter的输入
                pwConfirm.el.on('keydown', function(ev) {
                    if (ev.keyCode == 13) {
                        // enter按下时触发确认事件
                        okBtn.el.trigger('click');
                    }
                });

                cls = null;
            }
            ,reset: function(){
                this.$.pass.setData();
                this.$.newpass.setData();
                this.$.cnfpass.setData();
            }
            ,onButtonClick: function(ev){
                var pass = this.$.pass.getData();
                var new_pass = this.$.newpass.getData();
                var cnf_pass = this.$.cnfpass.getData();
                if (pass === ''){
                    app.alert(LANG('请先输入你的当前密码.'));
                    return false;
                }
                if (new_pass === ''){
                    app.alert(LANG('请先输入你的新的账号密码.'));
                    return false;
                }
                if(new_pass.length < 6){
                    app.alert(LANG('密码长度不能小于6个字符, 请重新输入.'));
                    return false;
                }
                if (new_pass != cnf_pass){
                    app.alert(LANG('两次输入的密码不相同, 请重新输入.'));
                    return false;
                }
                if (new_pass == pass){
                    app.alert(LANG('新密码和当前密码相同, 请重新输入.'));
                    return false;
                }
                //todo: 增加密码复杂度验证
                var c = this.config;
                app.data.put(c.url, {
                    'passwd': pass,
                    'new_passwd': new_pass
                }, this);
            }
            ,onData: function(err, data){
                if (err){
                    app.alert(err.message);
                    return false;
                }
                app.alert(data);
                window.location.href = '/';
            },
            focusOnTheFirstInput: function() {
                this.get('pass').el.trigger('focus');
            }

        }
    );
    exports.password = Password;

    var OLD_MAN = null;
    function Main(config){
        Main.master(this);

        // 用户数据
        this.user = app.getUser();
        // 登录弹出层
        this.loginBox = null;
        // 平台实例
        this.platform = app.core.get("platform");
        // 缓存
        this.cache = null;
        // 登录样式
        this.loginClass = 'M-login-scene';
    }
    extend(
        Main
        ,view.container
        ,{
            init:function(){
                Main.master(this,"init");
                if(!this.user && this.loginBox){
                    this.showLoginBox();
                }
            }
            /**
             * 用户退出的响应函数。可直接调用
             * @return {Undefined} 无返回值
             */
            ,onDoUserLogout:function(){
                app.data.get(
                    "/user/logout"
                    ,{}
                    ,this
                    ,"afterLogout"
                );
                return false;
            }
            /**
             * 用户登录的响应函数
             * @param  {Object}  ev 消息对象
             * @return {Boolean}    false，阻止广播
             */
            ,onDoUserLogin:function(ev){
                if(ev.param){
                    this.cache = ev.param;
                    app.data.get(
                        "/user/login"
                        ,ev.param
                        ,this
                        ,"afterLogin"
                    );
                }
                return false;
            }
            /**
             * 登出后的响应函数
             * @param  {Object}    err  错误信息对象
             * @param  {Object}    data 返回的数据对象
             * @return {Undefiend}      无返回值
             */
            ,afterLogout:function(err,data){
                OLD_MAN = app.getUser();
                OLD_MAN = OLD_MAN && OLD_MAN.userid || null;
                app.setUser(null);
                // 发送全局消息
                app.core.cast("userLogout");
                window.location.hash = "";
                this.showLoginBox();
            }
            /**
             * 登录后的响应函数
             * @param  {Object}    err  错误信息对象
             * @param  {Object}    data 返回的数据对象
             * @return {Undefiend}      无返回值
             */
            ,afterLogin:function(err,data){
                if(err){
                    app.error(err.message);
                    this.showErrorTips(err.message);
                    return false;
                }
                if(OLD_MAN && OLD_MAN != data.userid){
                    // 重置日期相关cookie
                    app.cookie("enddate",0);
                    app.cookie("begindate",0);
                    app.cookie("dateCountType",1);
                    // 重载
                    window.location.reload();
                    return;
                }
                app.setUser(data);
                require('boot').afterLogin();
                // 发送全局消息
                app.core.cast("userLogin", data);
                this.cache = null;
                this.hideLoginBox(true);
            }
            ,showErrorTips: function(data){
                this.loginBox.showErrorTips(data);
            }
            /**
             * 显示登录弹出层
             * @return {Undefined} 无返回值
             */
            ,showLoginBox:function(){
                if(!this.loginBox){
                    this.loginBox = this.create("loginBox", LoginBox);
                }
                // 去除应用Loading界面控制样式
                $('body:first')
                    .addClass(this.loginClass)
                    .removeClass("appIsLoading");
                this.platform.hide();
                this.loginBox.show();
                //简单获取焦点
                $('#LoginForm_email').focus();
            }
            ,hideLoginBox:function(show_platform){
                if (this.loginBox && this.loginBox.isShow){
                    this.loginBox.hide();
                    this.platform.updateTitle('');
                }
                $('body:first').removeClass(this.loginClass);
                if (show_platform){
                    this.platform.show();
                }
            }
        }
    );
    exports.main = Main;


    function LoginBox(config){
        config = $.extend(
            true
            ,{
                "width":600
                ,"buttonConfig":{
                    // 确定按钮样式
                    "ok": {
                        "value":LANG("登录")
                    }
                }
                ,"class":"M-popwin M-popwinBoxReflect M-login-logoHack"
                ,"cls":{
                    "main":"M-login"
                    ,"title":"M-login-title"
                    ,"name":"M-login-name"
                    ,"pws":"M-login-pws"
                    ,"addFun":"M-login-addFunctions"
                    ,"tip":"M-login-tip"
                    ,"foot":"M-login-foot"
                }
                ,"mask":0
                ,"close":null
            }
            ,config
        );
        LoginBox.master(this,null,config);
        this.config.buttons = ["ok"];
        this.subject = {};
        this.doc = $(document);
    }
    /**
     * 登录用到的检测方法
     * @type {Object}
     * @private
     */
    var CHK_SOME = {
        nospace:function(str){
            if(!str || !str.length){
                str = false;
            }else{
                str = /^[\s]|[\s]$/g.exec(str);
                str = !str;
            }
            return str;
        }
        ,mail: util.isEmail
    }
    extend(
        LoginBox
        ,pop.base
        ,{
            init:function(){
                LoginBox.master(this,"init");
                this.ready = 0;
                this.build();
            }
            /**
             * 构建登录弹出层内容
             * @return {Undefined} 无返回值
             */
            ,build:function(){
                if(this.ready){
                    console.error("别闹了，快到碗里来。");
                    return false;
                }

                var tmp = this.config.cls;
                // 添加主样式
                this.body.addClass(tmp.main).wrap('<form action="fake_login" target="hiddenLoginFrame" method="post" />');
                this.foot.addClass(tmp.foot);
                this.form = this.body.parent();

                // 构造结构并添加附属样式
                this.layout = this.create(
                    "layout"
                    ,view.layout
                    ,{
                        "target":this.body
                        ,"grid":[4,1]
                        ,"cellSet":[
                            {
                                "class":tmp.title,
                                "html":util.formatIndex(
                                    '<img src="%2" alt="%1" />',
                                    LANG(app.config('app_title')),
                                    app.config('app_logo_big')
                                )
                            }
                            ,{"class":tmp.name}
                            ,{"class":tmp.pws}
                            ,{"class":tmp.addFun}
                        ]
                    }
                );

                // 用户名
                this.subject.userName = this.create(
                    "userName"
                    ,common.input
                    ,{
                        "target":this.layout.get(1).el
                        ,"attr":{
                            'name': "LoginForm[email]"
                            ,'id': "LoginForm_email"
                            ,"data-name":"userName"
                            ,"placeholder":LANG("请输入您的邮箱")
                        }
                        ,"label":{
                            "html":LANG("邮箱：")
                        }
                        // ,"data-action":"chkForm"
                    }
                );
                // 用户名相关的提示
                this.subject.userNameTip = this.create(
                    "userNameTip"
                    ,view.container
                    ,{
                        "target":this.layout.get(1).el
                        ,"tag":"span"
                        ,"class":tmp.tip
                        ,"html":LANG("请输入合法的电子邮箱")
                    }
                );

                // 密码
                this.subject.userPws = this.create(
                    "userPws"
                    ,common.input
                    ,{
                        "target":this.layout.get(2).el
                        ,'type':'password'
                        ,"attr":{
                            'name': "LoginForm[password]"
                            ,'id': "LoginForm_password"
                            ,"data-name":"userPws"
                            ,"placeholder":LANG("请输入您的密码")
                        }
                        ,"label":{
                            "html":LANG("密码：")
                        }
                        // ,"data-action":"chkForm"
                    }
                );
                // 密码相关的提示
                this.subject.userPwsTip = this.create(
                    "userPwsTip"
                    ,view.container
                    ,{
                        "target":this.layout.get(2).el
                        ,"tag":"span"
                        ,"class":tmp.tip
                        ,"html":LANG("密码不能为空或密码前后不能带空格。")
                    }
                );

                // 附加功能
                this.subject.rememberMe = this.create(
                    "rememberMe"
                    ,common.input
                    ,{
                        "target":this.layout.get(3).el
                        ,"type":"checkbox"
                        ,"label":{
                            "html":LANG("记住用户名和密码")
                            ,"pos":0
                        }
                    }
                );

                this.el.append('<iframe name="hiddenLoginFrame" style="display:none;"/>');

                this.ready = 1;
            }
            /**
             * 消息响应处理函数
             * @param  {Object}    ev 消息信息对象
             * @return {Undefined}    无返回值
             */
            ,onEvent:function(ev){
                if(ev.from !== this){
                    var type = ev.param && ev.param.target && ev.param.target.attr("data-action") || ev.type
                        ,nono = "onOk,onCancel";
                    switch(type){
                        case "onOk":
                            this.onOk();
                            break;

                        case "blur":
                            this.chkForm(ev.param.target.attr("data-name"));
                            break;
                    }
                    if(nono.indexOf(type) !== -1){
                        type = nono = null;
                        return false;
                    }else{
                        type = nono = null;
                    }
                }
            }
            /**
             * 登录的处理函数
             * @return {Undefined} 无返回值
             */
            ,onOk:function(){
                // 还原密码错误提示
                this.$.userPwsTip.el.html('密码不能为空或密码前后不能带空格。');
                if(this.chkForm("userName") && this.chkForm("userPws")){
                    this.fire(
                        "doUserLogin"
                        ,{
                            "email":this.subject.userName.el.val()
                            ,"password":this.subject.userPws.el.val()
                            ,"rememberMe":this.subject.rememberMe.el.attr("checked") === "checked"?1:0
                        }
                    );
                    this.form.submit();
                }
            }
            /**
             * 监测keyup事件，响应用户回车输入
             * @param  {bool}   unbind 为真时解除绑定
             * @return {Object}        模块实例
             */
            ,bindEvent:function(unbind){
                if(unbind){
                    this.doc.unbind("keyup",_loginKeyupHandler);
                }else{
                    this.doc.bind("keyup",this,_loginKeyupHandler);
                }
                return this;
            }
            /**
             * 隐藏登录框
             * @return {Undefined} 无返回值
             */
            ,hide:function(){
                this.subject.userPws.el.val("");
                this.bindEvent(true);
                LoginBox.master(this,"hide");
            }
            /**
             * 显示登录框
             * @return {Undefined} 无返回值
             */
            ,show:function(){
                this.bindEvent();
                LoginBox.master(this,"show");
            }
            /**
             * 登录表单检测函数
             * @param  {String}  type 检测类型
             * @return {Boolean}      检测结果
             */
            ,chkForm:function(type){
                var re = true,
                    tmp = this.subject[type];
                if(tmp && tmp.el){
                    // 找到表达对象的情况下才进行判断
                    tmp = tmp.el;
                    // 检测
                    re = CHK_SOME[
                    type === "userName" && "mail" || "nospace"
                        ](tmp.val());

                    // 输入框样式操作
                    tmp[
                    re && "removeClass" || "addClass"
                        ]("nogood");

                    // 提示栏样式操作
                    this.subject[type+"Tip"].el[
                    re && "removeClass" || "addClass"
                        ]("showTip");
                }
                tmp = null;
                return re;
            }
            /**
             * 重置
             * @return {Undefined} 无返回值
             */
            ,reset:function(){
                this.subject.userName.el.val("");
                this.subject.userPws.el.val("");
                this.subject.rememberMe.el.attr("checked",false);
                this.bindEvent(true);
            }
            // 显示错误登陆信息提示
            ,showErrorTips: function(data){
                this.$.userPwsTip.el.html(data).addClass('showTip');
            }
        }
    );
    /**
     * 登录框按键keyup响应函数
     * @param  {Object} ev DOM消息对象
     * @return {Bool}      flase
     */
    function _loginKeyupHandler(ev){
        if(ev.keyCode == 13){
            ev.data.onOk();
        }
    }
    exports.login = LoginBox;
});