// 启动模块定义(路由模块)
define(function(require, exports){
    var app = require('app')
        ,tpl = require('tpl')
        ,platform = require("views/platform")
        ,Win = window
        ,Doc = Win.document;

    // 定义路由操作
    var env = exports.env = {
        login: null,
        module: null,
        action: null,
        param: null,
        search: null,
        current: null,
        wait_template: false
    };

    // 定义无需登录检查的模块
    var publics = ['login', 'privacy'];

    function run(module, action, param, search){
        env.module = module || app.config('router/default_module') || 'default';
        env.action = action || app.config('router/default_action') || 'main';
        env.param  = param || null;
        env.search = search || null;

        var isPublic = false;
        for (var i = publics.length - 1; i >= 0; i--) {
            if (env.module === publics[i]){
                isPublic = true;
                break;
            }
        }
        // 判断登录状态
        if (!isPublic && !app.isLogin()){
            env.login = [env.module, env.action, env.param, env.search];
            env.module = 'login';
            env.action = 'main';
            env.param = env.search = '';
        }else {
            app.core.get("platform").show();

            // 判断是否需要修改用户密码
            if (!isPublic && app.getUser().need_to_set_password){
                // 跳转到修改密码界面, 并提示
                app.navigate("login/password");
                app.alert(LANG('第一次登陆，请先修改密码！'));
                return;
            }
        }

        // 加载控制器
        require.async(app.config('app_base')+env.module, onRun);
    }

    /**
     * 参数格式化
     * @param  {String} search 附加参数字符串
     * @return {Object}        格式化完的附加参数对象
     * @preserve
     */
    function _formatSearch(search){
        if (typeof(search) !== 'string'){
            return search;
        }
        search = search.split("&");
        var p = {};
        for(var i =0;i<search.length;i++){
            search[i] = search[i].split("=");
            p[search[i][0]] = search[i][1];
        }
        search = null;
        return p;
    }

    function onRun(mod){
        // 已经被运行过, 防止快速点击的时候重复运行
        if (!env.module || !env.action) {return false;}

        // 模块加载完成，检查方法是否有效，有效则调用
        var act = 'on' + app.util.ucFirst(env.action);
        if (!mod){
            app.error('Module is missing - ' + env.module + ':' + act + '()');
        }else if (mod.MODULE_NAME != env.module){
            app.error('Module is invalid - ' +  env.module + ':' + act + '()');
        }else {
            var now = {
                name: env.module + app.util.ucFirst(env.action),
                module: env.module,
                action: env.action,
                param: env.param,
                search: env.search,
                method: act
            };

            env.current = [env.module, env.action, env.param, env.search];

            // 检查模版文件依赖
            if (env.wait_template || (mod.TEMPLATE_FILE && !tpl.load(mod.TEMPLATE_FILE))){
                return; // 模板为加载, 等待加载
            }

            if (mod[act] && app.util.isFunc(mod[act])){
                var ret;
                if(now.search){
                    // 有附加参数的时候
                    now.search = _formatSearch(now.search);
                }

                // 模块预处理调用
                if (mod.beforeAction && app.util.isFunc(mod.beforeAction)){
                    ret = mod.beforeAction(exports, now, app);
                    if (ret === false || env.wait_template){ return; }
                }

                // 调用指定动作
                ret = mod[act](exports, now, app);
                if (ret === false || env.wait_template){ return; }

                // 模块后处理调用
                if (mod.afterAction && app.util.isFunc(mod.afterAction)){
                    mod.afterAction(exports, now, app);
                    if (env.wait_template){ return;	}
                }
            }else {
                app.error('Action is invalid - ' + env.module + ':' + act + '()');
            }
            if (env.module == now.module && env.action == now.action && env.param == now.param){
                env.module = env.action = env.param = null;
            }
        }
    }
    exports.run = run;

    // 登录成功回调功能
    exports.afterLogin = function(){
        if (env.login){
            removeImagter();
            var argvs = env.login;
            env.login = null;
            run.apply(exports, argvs);
        }
    }
    // 重新加载当前操作
    exports.reload = function(silent){
        if (env.current){
            run.apply(exports, env.current);
        }
        // 发送全局消息
        if (!silent){
            app.core.cast('reload');
        }
    }
    // 切换页面显示模块
    var lastPage = null;
    /**
     * 切换整体页面
     * @param  {String} name 要切换到当前的页面模块对象URI
     * @return {String}      返回原显示的模块URI
     */
    exports.switchPage = function(name){
        if (name == lastPage){
            return;
        }
        var param = {
            'lastName': lastPage,
            'thisName': name
        };
        var last = lastPage;
        var mod;
        if (lastPage && lastPage !== name){
            mod = app.core.get(lastPage);
            if (mod){
                mod.hide();
                param.lastModule = mod;
            }
        }
        lastPage = name;
        mod = app.core.get(name);
        if (mod){
            mod.show();
            param.thisModule = mod;
        }
        app.core.cast('switchPage', param);
        return last;
    }

    // 监听Hash变化事件
    var oldURL = -1;
    function hashChanged(){
        if (oldURL === -1) {return;} // 应用还没有开始
        oldURL = Win.location.href;
        var hash = Win.location.hash.replace(/^[#\/\!]+/, '');
        var search = hash.split('?');
        var param = search.shift().split('/');

        var module = param.shift();
        var action = param.shift();
        param  = param.join('/');
        search = search.join('?');

        run(module, action, param, search);
    }
    if (('onhashchange' in Win) && (Doc.documentMode === undefined || Doc.documentMode==8)){
        if (Win.addEventListener){
            Win.addEventListener('hashchange', hashChanged, false);
        }else if (Win.attachEvent){
            Win.attachEvent('onhashchange', hashChanged);
        }else {
            Win.onhashchange = hashChanged;
        }
    } else {
        setInterval(function(){
            if (oldURL != Win.location.href){
                hashChanged.call(Win);
            }
        }, 150);
    }

    // 设置默认配置
    app.init(
        require('sys_config')
        , function(){
            // 自动登录的请求
            app.data.get(
                "/user/logininfo"
                // "/data/freq_chart.php"
                ,function(err,data){
                    // 设置用户状态
                    app.setUser(data);

                    if (data){
                        // 指定用户显示优酷帖片渠道
                        removeImagter();
                    }

                    app.core.create(
                        "platform"
                        ,platform.mainView
                    );
                    tpl.set('FRONT_BASE', app.config('front_base'));
                    tpl.set('BASE', Win.BASE());
                    // 开始应用
                    oldURL = Win.location.href;
                    hashChanged();
                }
            );
            Win.app = app;
            app.config('more_col', +app.cookie('ColumnMore'));
        }
    );

    exports.getMainView = function(){
        return app.core.get("platform").getShowarea();
    }

    // 临时限制
    function removeImagter(){
        var util = require('util');
        var user = app.getUser();
        var uid = user.campany.UserId;

        // 部分账号有优酷前贴(IMAGTER)
        var allow_IMAGTER = app.config('auth/allow_IMAGTER');
        if (util.index(allow_IMAGTER, uid) === null){
            util.remove(app.config('exchanges'), 10022, 'id');
        }

        // 部分账号有暴风移动
        var allow_baofengMobile = app.config('auth/allow_baofengMobile');
        if (util.index(allow_baofengMobile, uid) === null){
            util.remove(app.config('exchanges'), 10043, 'id');
        }

        // 部分账号有PubRight
        var allow_PubRight = app.config('auth/allow_PubRight');
        if (util.index(allow_PubRight, uid) === null){
            util.remove(app.config('exchanges'), 10013, 'id');
        }

        // 部分账号有ALL X
        var allow_AllX = app.config('auth/allow_AllX');
        if (util.index(allow_AllX, uid) === null){
            util.remove(app.config('exchanges'), 10058, 'id');
        }

        // 部分账号有物优SSP
        exchangesAuth(10056);
        // 部分账号有usingde
        exchangesAuth(10057);

        // 部分账号只显示部分渠道
        var allow_exchange = app.config('auth/allow_exchange');
        var del_ex = [];
        var exchanges = app.config('exchanges');
        util.each(exchanges, function(item){
            if(item){
                del_ex.push(item.id);
            }
        });
        util.each(allow_exchange, function(group, idx){

            if(idx == uid){
                util.each(group, function(item){
                    util.remove(del_ex, item);
                });
                util.each(del_ex, function(item){
                    util.remove(exchanges, item, 'id');
                });
            }

        });
    }

    // 渠道权限控制
    function exchangesAuth(exchange){
        var util = require('util');
        var uid = app.getUserId(); // 登录用户id
        var allow = app.config('auth/allow_' + exchange); // 可见用户id组

        if (util.index(allow, uid) === null){
            // 没有可见权限的话，移除渠道
            util.remove(app.config('exchanges'), exchange, 'id');
        }
        return;
    }
});

