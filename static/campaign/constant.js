define(function(require,exports){
    var util = require("util");
    var CONSTANT = {
        // 错误代码
        "error_code":{
            // 登录超时
            "1001":{
                // 提示信息。
                "msg":_T("登录超时")
                // 处理该状态的hash路径
                ,"uri":"login/logout"
            }
            ,"0":{
                "msg":_T("你特么在逗我？")
                // 处理该状态的响应函数。遵循事件机制的命名规则
                ,"action":"onKidding"
            }
        }
        // 货币对应符号
        ,"currencys":{
            // 软妹币
            "rmb":"￥"
            // 美刀
            ,"usd":"$"
        }
    }

    /**
     * 获取设定值
     * @param  {Mix} keys Array或String。当为字符串时可使用.运算符来指定要查找的值。
     * @return {Mix}      获取结果
     * eg.
     *  cons.get("error_code.0");
     *  cons.get(["error_code",0]);
     *  结果是一样的
     */
    exports.get = function(keys){
        if(!util.isArray(keys)){
            keys = ""+keys;
            keys = keys.split(".");
        }
        var re = CONSTANT[keys.shift()];
        while(keys.length){
            re = re[keys.shift()];
            if(!re){
                keys = [];
            }
        }
        keys = null;
        return re;
    }
});