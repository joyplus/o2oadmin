define(function(require, exports){
    var con = console;
    function log(trace){
        if (!window.APP_DEBUG){ return; }
        var args = arguments;
        if (typeof trace == 'string'){
            con.log.apply(con, args);
        }else if (trace === 0){
            con.groupEnd();
        }else {
            args = Array.prototype.slice.call(args, 1);
            if (trace === true){
                con.groupCollapsed.apply(con, args);
                con.trace();
                con.groupEnd();
            }else if (trace === 1){
                con.group.apply(con, args);
            }
        }
    }

    function has(obj, prop){
        return obj.hasOwnProperty(prop);
    }
    function uniq(arr){
        var i,j,l = arr.length-1;
        for (i=0; i<l; i++){
            for (j=i+1; j<=l; j++){
                if (arr[i] === arr[j]){
                    arr.splice(j--,1);
                    l--;
                }
            }
        }
        return arr;
    }
    var DEPEND_MARK = '@';
    var ANY_MARK    = '*';
    var REQ_MARK	= '$';
    var INSTANCE_ID = 0;

    function Trigger(scope, registers){
        var self = this;
        self.$id      = INSTANCE_ID++;
        self.$timer   = 0; // 正在触发事件调用
        self.$scope   = null;
        self.$regs    = {}; // 注册的触发器
        self.$queue   = []; // 触发器排序队列
        self.$signals = {}; // 信号变量临时存储
        self.$states  = {}; // 运行状态
        self.$sver    = 0;

        self.routine = function(){
            self._runCallback();
        }

        self.setScope(scope);
        if (registers && registers.length){
            for (var i=0; i<registers.length; i++){
                self.register(registers[i], true);
            }
            self._sortQueue();
        }
    }

    Trigger.prototype = {
        constructor: Trigger,
        /**
         * 设置作用域参数
         * @param  {Object} scope 作用域对象
         * @return {Object}       返回当前对象
         */
        setScope: function(scope){
            this.$scope = scope || window;
            return this;
        },
        /**
         * 注册触发事件
         * @param  {String} name    触发器名称
         * @param  {String} signals 触发信号名称, 英文逗号分隔多个信号
         * @param  {Mix}    event   触发函数, 字符串, 函数, 数组(作用域, 函数)
         * @param  {Mix}    data    触发函数的附加数据
         * @return {Object}         返回当前对象
         */
        register: function(option, skip_sort){
            var self   = this;
            var scope  = option.context || null;
            var event  = option.event;
            var signal = option.signals;
            if (typeof event === 'string'){
                event = (scope && scope[event]) || (self.$scope && self.$scope[event]);
            }else if (event instanceof Array){
                scope = event[0];
                if (typeof event[1] === 'string'){
                    event = scope && scope[event[1]];
                }
            }
            var signals = option.signals = {};
            var depends = option.depends = [];
            var list    = signal && signal.split(',') || [];
            option.wait = 0;
            option.some = -1;
            for (var i=0; i<list.length; i++){
                signal = list[i];
                switch (signal.charAt(0)){
                    case DEPEND_MARK:
                        depends.push(signal);
                        break;
                    case ANY_MARK:
                        option.some  = 1;
                        signals[signal.slice(1)] = 4; // 信号状态5表示可选
                        break;
                    case REQ_MARK:
                        signals[signal.slice(1)] = 8; // 包含参数, 不作触发条件
                        break;
                    default:
                        if (!has(signals, signal)){
                            signals[signal] = 0; // 信号状态0表示必须
                            option.wait++;
                        }
                        break;
                }
            }
            if (option.wait === 0){
                option.wait = -1; // -1状态表示没有需要的信号
            }
            var regs  = self.$regs;
            var name  = option.name;

            if (name === undefined){
                name = self.$queue.length;
                while (has(regs, name)){
                    name++;
                }
                option.name = name;
            }
            option.sver    = 0;
            option.cver    = {};
            option.sdat    = {};
            option.event   = event || null;
            option.context = scope;
            option.changed = {}; // 已改变的信号量
            regs[name]     = option;
            self.$states[DEPEND_MARK+name] = option.state ? 1 : 0; // 初始状态

            if (!skip_sort){
                self._sortQueue();
            }
            return self;
        },
        /**
         * 设置触发器状态为有效
         * @param  {Mix}     register    触发器项目对象或字符串触发器名称
         * @param  {Mix}     value       触发器状态信号变量
         * @param  {Boolean} no_callback <可选> 是否触发事件调用
         * @return {Objec}               返回当前对象
         */
        resolve: function(register, value, no_callback){
            var self = this;
            var name = DEPEND_MARK + (typeof register==='string' ? register : register.name);
            log('%cTrigger<%d>::resolve(%s) %O', 'color:#F800E4', self.$id, name, value);
            self.$states[name] = 1;
            // self.setData(name, value);
            var signal = self.$signals[name];
            if (signal){
                signal[1] = value;
            }else {
                self.$signals[name] = [0, value, 0];
            }
            return (no_callback ? self : self._delayRun());
        },
        /**
         * 设置触发器状态为无效
         * @param  {Mix}    register 触发器项目对象或字符串触发器名称
         * @return {Object}          返回当前对象
         */
        reject: function(register){
            var self = this;
            var name = DEPEND_MARK + (typeof register==='string' ? register : register.name);
            log('Trigger<%d>::reject(%s)', self.$id, name);
            self.$states[name] = 0;
            return self;
        },
        /**
         * 触发信号
         * @param  {String}  name  信号名称字符串
         * @param  {Mix}     data  <可选> 信号变量
         * @param  {Boolean} check <可选> 检查变量变化
         * @return {Object}        返回当前对象
         */
        signal: function(name, data, check){
            var self = this;
            var signal = self.$signals[name];
            log(true, '%cTrigger<%d>::signal(%s) %O', 'color:#009;', self.$id, name, data);
            if (signal){
                signal[0]++;
                if (arguments.length > 1){
                    signal[1] = data;
                }
                signal[2] = check?1:0;
            }else {
                self.$signals[name] = [1, data, 0];
            }
            self.$sver++;
            return self._delayRun();
        },
        // 更新信号变量参数值
        setData: function(name, data){
            var self = this;
            log('Trigger<%d>::setdata(%s) %O', self.$id, name, data);
            var signal = self.$signals[name];
            if (signal){
                signal[1] = data;
            }else {
                self.$signals[name] = [0, data, 0];
            }
            return self;
        },
        getData: function(name){
            var signals = this.$signals[name];
            return (signals && signals[1]);
        },
        // 重置触发器信号状态
        clear: function(name){
            log(true, '%cTrigger<%d>::clear() %O', 'color:#f00;', this.$id, name);
            var self = this;
            var regs = self.$regs;
            if (name){
                if (has(regs, name)){
                    self._clearReg(regs[name]);
                }
            }else {
                // 重置所有触发器
                for (name in regs){
                    if (has(regs, name)){
                        self._clearReg(regs[name]);
                    }
                }
            }
            return self;
        },
        /**
         * 清空所有信号状态数据
         * @return {Object} 返回当前对象
         */
        reset: function() {
            this.$signals = {};
            this.$states  = {};
            return this.clear();
        },
        /**
         * 清空所有设置, 包括触发器设置信息
         * @return {Object} 返回当前对象
         */
        resetAll: function(){
            this.$regs  = {};
            this.$queue = [];
            return this.reset();
        },
        /**
         * 触发器调用顺序依赖顺序处理
         * @return {Object} 返回当前对象
         */
        _sortQueue: function(){
            var regs  = this.$regs;
            var queue = this.$queue;
            var next  = queue.length;
            var cache = [];
            var ready = {};
            var i, j, k, reg, dep, deep_dep;

            // 先设置外部依赖(手动设置)
            for (reg in regs){
                if (has(regs, reg)){
                    cache.push(reg);
                    reg = regs[reg];
                    dep = reg.depends;
                    for (j=dep.length; j>0;){
                        i = dep[--j];
                        if (!has(regs, i.slice(1))){
                            ready[i] = 2;
                        }
                    }
                }
            }
            queue.splice(0, next);
            next = cache.length;

            while (next){
                next = 0;
                for (i=0;i<cache.length;i++){
                    reg = regs[cache[i]];
                    dep = reg.depends;
                    for (j=dep.length; j>0;){
                        k = ready[dep[--j]];
                        if (k !== 1 && k !== 2){
                            // 依赖次序没有完成
                            reg = null;
                            break;
                        }
                    }
                    if (reg){
                        // 递归依赖
                        deep_dep = dep.slice();
                        for (j=dep.length; j>0;){
                            k = dep[--j];
                            if (ready[k] === 1){
                                // 合并依赖
                                deep_dep.push.apply(deep_dep, regs[k.slice(1)].depends);
                            }
                        }
                        cache.splice(i--,1);
                        j = reg.name;
                        reg.depends = uniq(deep_dep);
                        queue.push(j);
                        ready[DEPEND_MARK+j] = 1;
                        next = cache.length;
                    }
                }
            }
            if (cache.length){
                // 警告, 有依赖的状态未设置
                if (console && console.warn){
                    console.warn('警告: 存在环形依赖的触发器!', cache);
                }
                queue.push.apply(queue, cache);
            }
            return this;
        },
        _clearReg: function(reg, force){
            var self = this;
            if (force || reg.sver !== self.$sver){
                reg.sver = self.$sver;

                var id, signals = reg.signals;
                var $signals = self.$signals;
                if (reg.some === 0){ // 重置可选信号触发状态
                    reg.some = 1;
                }
                for (id in signals){
                    if (has(signals, id)){
                        // 更新信号版本号
                        reg.cver[id] = $signals[id] && $signals[id][0] || 0;
                        switch (signals[id]){
                            case 1:
                                reg.wait++;
                            /* falls through */
                            case 5:
                                signals[id]--; // 重置信号触发状态
                                break;
                        }
                    }
                }
            }
            return self;
        },
        _delayRun: function(){
            var self = this;
            if (!self.$timer){
                log('%cTrigger<%d>::DelayRunCallback', 'color:#0a0;font-weight:bold', self.$id);
                self.$timer = setTimeout(self.routine, 0);
            }
            return this;
        },
        _checkReady: function(reg){
            var self = this;
            var $signals = self.$signals;
            var signal, name;
            if (reg.sver !== self.$sver){
                reg.sver = self.$sver;
                // 检查触发的信号
                var signals = reg.signals;
                for (name in signals){
                    signal = $signals[name];
                    if (signal && reg.cver[name] !== signal[0] && has(signals, name)){
                        reg.cver[name] = signal[0];
                        if (!signal[2] || reg.sdat[name] !== signal[1]){
                            reg.sdat[name] = signal[1];
                            reg.changed[name] = 1;
                            switch (signals[name]){
                                case 0:
                                    reg.wait--;
                                    signals[name] = 1;
                                    break;
                                case 4:
                                    reg.some = 0;
                                    signals[name] = 5;
                                    break;
                            }
                        }
                    }
                }
            }
            if (reg.wait === 0 || reg.wait === -1 && reg.some === 0){
                // 判断依赖状态是否完整
                var states = self.$states;
                for (name=reg.depends.length; name>0;){
                    signal = reg.depends[--name];
                    if (states[signal] !== 1){
                        return false;
                    }
                    reg.sdat[signal] = $signals[signal] && $signals[signal][1];
                }
                return true;
            }
            return false;
        },
        /**
         * 异步触发回调事件
         * @return {Object}      返回当前对象
         */
        _runCallback: function(){
            var self = this;
            self.$timer = 0;
            log(1, 'Trigger<%d>::_runCallback %O', self.$id, self);

            // 检查触发事件
            var reg, i, j;
            var registers = self.$regs;
            var queue     = self.$queue;
            for (i=0; i<queue.length; i++){
                reg = registers[queue[i]];
                if (self._checkReady(reg)){
                    self._clearReg(reg, 1);
                    log(1, '%cTrigger<%d>::callback(%s) %O', 'color:#900; font-weight: bold', self.$id, reg.name, reg);
                    log(JSON.stringify(reg.changed));
                    // 把当前触发器状态设置为无效
                    self.reject(reg);
                    // 触发回调函数
                    j = reg.event.call(reg.context || self.$scope, reg.sdat, reg);
                    // 返回不是false, 表示已成功, 自动设置状态生效
                    if (j !== false){
                        self.resolve(reg, j, true);
                    }
                    reg.changed = {};
                    log(0);
                }
            }
            log(0);
        }
    };

    Trigger.create = function(scope, registers){
        return new Trigger(scope, registers);
    }

    return Trigger;
});