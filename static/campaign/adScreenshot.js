define(function(require, exports){
    var $ = require("jquery")
        ,app = require("app")
        ,popwin = require('popwin')
        ,grid = require("grid")
        ,util = require('util');


    // 广告截屏弹窗
    var AdScreenshot = app.extend(popwin.base, {
        init: function(config, parent){
            config = $.extend({
                'title': LANG('广告截屏'),
                'width': 1000,
                'class': 'M-popwin M-shotDetailPopwin',
                'buttonConfig': {
                    // 确定按钮样式
                    "ok": null
                    // 取消按钮的样式
                    ,"cancel": {
                        "type":"button"
                        ,"value":LANG("关闭")
                        ,"class":"btnBigGray"
                        ,"data-action":"onCancel"
                        ,"events":"click"
                    }
                }
            }, config);

            AdScreenshot.master(this, null, config);
            AdScreenshot.master(this, 'init', arguments);

            this.$data = null;

            this.build();
        },
        build: function(){
            var el = this.body;
            var doms = this.doms = {
                con: $('<div class="M-shotDetailPopwinCon"/>').appendTo(el),
                processCon: $('<div class="M-shotDetailPopwinProcessCon"/>'),
                finishCon: $('<div class="M-shotDetailPopwinFinishCon"/>')
            };

            // 描述
            $('<p class="desc"/>')
                .text(LANG('在“活动”报表点击“媒体&广告位”图标，展开“广告位”报表的“状态”列点击“广告截屏”图标，截取该广告位的网页图片。'))
                .appendTo(doms.con);

            doms.processCon.appendTo(doms.con);
            doms.finishCon.appendTo(doms.con);

            $('<p class="title">').html(LANG('处理中')+'<span>'+LANG('“处理中”的任务最多10个')+'</span>').appendTo(doms.processCon);

            this.create("processGrid", grid.base, {
                'hasTab': false,
                'hasAmount': false,
                'hasExport': false,
                'hasSelect': false,
                'hasSearch': false,
                'hasRefresh': true,
                'refresh_time': 30,	// 刷新间隔
                'refresh_auto': 1,	// 自动刷新中
                'url': '/rest/adpositionscreenshot',
                'param': {
                    'action': 'list',
                    'done': false,
                    'page': 1,
                    'limit': 10
                },
                "cols": [
                    {name:"Status",text:LANG('状态'),render:this.renderStatus,width:100,align:'left'},
                    {name:"Name",text:LANG('广告位'),render:this.renderName,width:500,align:'left'}
                ],
                "operation":{render: this.renderOperationProcess, cls:'M-gridOPCursor', width:120},
                'target': doms.processCon,
                'pager':{
                    "size": 10,
                    "bounds": 5,
                    "firstLast": false,
                    "showJumper": 0,
                    "showSizeTypes": 0
                },
                'list':{
                    'rowSelect': true,
                    'scroll_type': 'row',
                    'scroll_size': 5
                }
            });

            $('<p class="title">').html(LANG('已完成')+'<span>'+LANG('30天后系统会自动清除过期的截图图片')+'</span>').appendTo(doms.finishCon);

            this.create("finishGrid", grid.base, {
                'hasTab': false,
                'hasAmount': false,
                'hasExport': false,
                'hasSelect': false,
                'hasSearch': true,
                'hasRefresh': true,
                'refresh_time': 60,	// 刷新间隔
                'refresh_auto': 1,	// 自动刷新中
                'url': '/rest/adpositionscreenshot',
                'sort': 'Id',
                'param': {
                    'action': 'list',
                    'done': true,
                    //'page': 1,
                    'limit': 10
                },
                "cols": [
                    {name:"Name",text:LANG('广告位'),type:"index",render:this.renderName,width:500,align:'left'}
                    ,{name:"SuccessTime",text:LANG('日期'),type:"index",render:this.renderDate,width:200,align:'left'}
                ],
                "operation":{render: this.renderOperationFinish, cls:'M-gridOPCursor', width:120},
                'target': doms.finishCon,
                'pager':{
                    "size": 10,
                    "bounds": 5,
                    "firstLast": false,
                    "showJumper": 0,
                    "showSizeTypes": 0
                },
                'list':{
                    'rowSelect': true,
                    'scroll_type': 'row',
                    'scroll_size': 5
                }
            });

        },
        renderStatus: function(index, val, row){
            var html = $('<span/>');
            switch (val){	//截图状态 １排队中　２截图中　３失败　４成功
                case 1:
                    html = html.css('color','#aaa').html(LANG('排队中...'));
                    break;
                case 2:
                    html = html.addClass('renderStatus').css('color','#47a903').html('<em class="M-tagLabelsloading"/>'+LANG('截屏中...'));
                    break;
                case 3:
                    html = html.css('color','#F00000').html(LANG('失败'));
                    break;
            }
            return $('<p/>').width(100).html(html);

        },
        renderName: function(index, val, row){
            var suffix = row.Path.replace(/^.+\./,'');
            var name = val+'.'+suffix;
            var html = '<p class="M-tableListWidthLimit" title="'+name+'">'+name+'</p>';
            return $(html).width(500);
        },
        renderDate: function(index, val, row){
            var html = $('<p/>').html(util.date('Y-m-d H:i', val)).width(100);
            return html;
        },
        // 处理中列表操作渲染
        renderOperationProcess: function(index, val, row){
            var html = [];
            var status = row.Status;
            switch (status){
                case 1:
                case 2:
                    html.push('<a data-op="cancel" class="mr20">取消</a>');
                    break;
                case 3:
                    html.push('<a data-op="retry" class="mr20">重试</a>');
                    break;
            }
            html.push('<a data-op="remove"  class="mr20">删除</a>');
            return html.join('');
        },
        // 已完成列表操作渲染
        renderOperationFinish: function(index, val, row){
            var html = [];
            html.push('<a data-op="check" class="mr20">查看</a>');
            html.push('<a data-op="download" class="mr20">下载</a>');
            return html.join('');
        },
        onListOpClick: function(ev){
            var self = this;
            var op = ev.param.op;
            var id = ev.param.data.Id;
            switch (op){
                case 'cancel':	// 取消
                    self.eventOperate(1, id);
                    break;
                case 'retry':	// 重试
                    self.eventOperate(2, id);
                    break;
                case 'remove':	// 删除
                    self.eventOperate(3, id);
                    break;
                case 'check':	// 查看
                    self.eventOperate(4, id);
                    break;
                case 'download':	// 下载
                    self.eventOperate(5, id);
                    break;
            }
        },
        eventOperate: function(type, id){
            var self = this;
            var text = [
                '',
                LANG('取消'),
                LANG('重试'),
                LANG('删除'),
                LANG('查看'),
                LANG('下载')
            ];

            switch (type){
                case 1:
                case 2:
                    app.data.get(
                        '/rest/adpositionscreenshot',
                        {
                            'action': 'operate',
                            'opt': type,
                            'id': id
                        },
                        self,
                        'afterEventOperate',
                        type
                    );
                    break;
                case 3:
                    app.confirm(LANG('是否%1这条记录？',text[type]), function(isOk){
                        if(isOk){
                            app.data.get(
                                '/rest/adpositionscreenshot',
                                {
                                    'action': 'operate',
                                    'opt': type,
                                    'id': id
                                },
                                self,
                                'afterEventOperate',
                                type
                            );
                        }
                    });
                    break;
                case 4:
                    app.data.get(
                        '/rest/adpositionscreenshot',
                        {
                            'action': 'show',
                            'id': id
                        },
                        self,
                        'afterEventOperate',
                        type
                    );
                    break;
                case 5:
                    window.location.href = app.data.resolve('/rest/adpositionscreenshot?action=download&id='+id);
                    break;
            }
            return false;
        },
        afterEventOperate: function(err, data, type){
            if (err){
                app.error(err);
                if (err.message){
                    app.alert(err.message);
                }
                return false;
            }
            var self = this;
            var cs = self.$;
            if(cs.processGrid){
                cs.processGrid.load();
            }
            // if(cs.finishGrid){
            // 	cs.finishGrid.load();
            // }

            // 图片查看
            if(type == 4){
                window.open(app.data.resolve(data.Url));
            }
        },
        setData: function(data){
            this.$data = data;
            return this;
        },
        load: function(param){
            var self = this;
            var cs = self.$;
            // 更新列表
            if(cs.processGrid){
                cs.processGrid.load();
            }
            if(cs.finishGrid){
                cs.finishGrid.load();
            }
            return self;
        },
        onData: function(err, data){
            if (err){
                app.error(err);
                if (err.message){
                    app.alert(err.message);
                }
                return false;
            }
            this.setData(data);
        },
        reset: function(){
            this.$data = null;
            return this;
        }
    });
    exports.adScreenshot = AdScreenshot;

});