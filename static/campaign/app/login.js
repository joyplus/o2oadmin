define(function(require, exports){
    exports.MODULE_NAME = 'login';
    var pages = require('pages/login');
    var BOOT, APP;

    exports.beforeAction = function(boot,data,app){
        BOOT = boot;
        APP = app;
    }

    function getLoginMod(){
        var mod = APP.core.get("login");
        if(!mod){
            mod = APP.core.create(
                "login"
                ,pages.main
                ,{
                    "target":BOOT.getMainView()
                }
            );
        }
        return mod;
    }

    exports.onMain = function(boot, data, app){
        app.core.get("platform").setPlatform(0,LANG("登录"))
        getLoginMod().showLoginBox();
    }
    exports.onLogout = function(boot, data, app){
        getLoginMod().onDoUserLogout();
    }

    /**
     * 密码修改界面
     */
    exports.onPassword = function(boot, data, app){
        app.core.get("platform").setPlatform(0,LANG("修改用户密码"),true);
        var mod = app.core.get(data.name);
        if (!mod){
            mod = app.core.create(
                data.name,
                pages.password,
                {'target': boot.getMainView()}
            );
        }else{
            mod.reset();
        }

        // focus到第一个input中
        mod.focusOnTheFirstInput();

        boot.switchPage(mod._.uri);
    }

});