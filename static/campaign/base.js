(function(Sea, Win, Doc){
    var root = Win.location.href.split('#').shift();
    var base = root;

    var node = Doc.getElementsByTagName('base');
    if (node.length){
        base = node[0].getAttribute('href');
        node[0].setAttribute('href', root);
    }else if (base.slice(-1) !== '/'){
        base = base.substr(0, base.lastIndexOf('/') + 1);
    }

    function BASE(path){
        if (!path){return base;}
        if (base && path.charAt(0) != '/'){
            return base + path;
        }
        return path;
    }
    Win.BASE = BASE;
    Win._T = function(text){ return text; }

// SeaJS全局配置
    Sea.config({
        base: BASE("/static/campaign/"),
        alias: {
            // 目录缩写
            "core":			BASE("/static/campaign/core"),
            "libs":			BASE("/static/campaign/libs"),

            // 基本模块缩写
            "sys_config":	BASE("/static/campaign/core/config.js"),
            "boot":			BASE("/static/campaign/core/boot.js"),
            "app":			BASE("/static/campaign/core/app.js"),
            "util":			BASE("/static/campaign/core/util.js"),
            "tpl":			BASE("/static/campaign/core/template.js"),
            "underscore":	BASE("/static/campaign/libs/underscore/underscore.js"),
            "less":			BASE("/static/campaign/libs/less/less-1.3.1.js"),
            "jquery":		BASE("/static/campaign/libs/jquery/jquery-1.8.3.min.js"),
            "jquery-ui":	BASE("/static/campaign/libs/jquery/jquery-ui-1.9.2.custom.min.js"),
            "raphael":		BASE("/static/campaign/libs/raphael/raphael.2.1.0.js"),
            // kindeditor编辑器
            "kindEditor": BASE('/static/campaign/libs/kindeditor/kindeditor-min.js')
        },
        map: [
            [/^.*$/, function(url){
                /* 加入版本号码 */
                if (Win.VERSION){
                    url += (url.indexOf('?') == -1 ? '?v=' : '&v=') + Win.VERSION;
                }
                return url;
            }]
        ],
        preload:[
            Win.JSON ? "" : "libs/json",
            Function.prototype.bind ? "" : "libs/es5-safe"
        ],
        debug: 0
    });

    Sea.use('boot');
})(seajs, window, document);
