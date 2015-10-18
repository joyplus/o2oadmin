// 创意包上传素材——外部链接
define(function(require, exports){
    var $ = require('jquery'),
        app = require('app'),
        util = require('util'),
        common = require('common'),
        popwin = require("popwin_base"),
        upload = require("upload"),
        view = require('view');

    var MaterialOuterlink = app.extend(view.container, {
        init: function(config, parent){
            config = $.extend({
                'class': 'M-materialOuterlink',
                'target': parent,
                'urlUpload': '/sweety/addsweetycreative',
                'labels': [LANG('地址：'),LANG('尺寸：'),LANG('名称：')]
            }, config);

            MaterialOuterlink.master(this, null, config);
            MaterialOuterlink.master(this, 'init', arguments);

            // data为数组
            this.$data = [];

            this.$ready = false;
            // 全局变量 -单条组集合
            this.$items = [];
            this.$ids = [];
            this.$uploadFail = false;
            this.build();
        },
        build: function(){
            if (this.$ready){ return false; }
            // 构建第一组
            var doms = this.doms = {
                wrap: $('<div class="M-materialOuterlinkWrapper">').appendTo(this.el),
                addBtn: $('<input class="addBtn mt10" type="button" value="'+LANG("添加素材")+'">').appendTo(this.el)
            }
            // this.buildItem();
            // 构建添加按钮
            this.jq(doms.addBtn, 'click', 'eventAddItem');
            this.dg(doms.wrap, '.deletBtn', 'click', 'eventDeletItem');
            this.dg(doms.wrap, '.innerUploadMaterial', 'click', 'eventUploadMaterial');

            this.$ready = true;
        },
        buildItem: function(data){
            var guid = util.guid();
            var c = this.config;

            var el = $([
                '<div class="item" data-id="'+guid+'">',
                '<i class="deletBtn" key="'+guid+'"></i>',
                '<div class="innerDiv"><label>'+c.labels[0]+'</label><input type="text" class="path"><a class="innerUploadMaterial">'+LANG('上传物料到优酷')+'</a></div>',
                '<div class="innerDiv">',
                '<label>'+c.labels[1]+'</label>',
                '<input type="text" class="width"><span>px</span>',
                '<i class="timsIcon"></i>',
                '<input type="text" class="height"><span>px</span>',
                '</div>',
                '<div class="innerDiv creativeName"><label>'+c.labels[2]+'</label></div>',
                '</div>'
            ].join('')).appendTo(this.doms.wrap);

            var name = this.create(common.input,{
                "target":el.find(".creativeName")
                ,"type":"text"
                ,"value": LANG("新建创意包_")+app.util.date("YmdHis")+LANG("_外链")+guid
                ,"events":"blur"
            });

            var item = {
                el: el,
                guid: guid,
                data: data,
                id: 0,
                name: name,
                path: el.find('.path'),
                width: el.find('.width'),
                height: el.find('.height')
            };

            // 有数据，setData的情况
            if(data){
                item.id = data._id;
                name.setData(data.Name);
                item.path.val(data.Path);
                item.width.val(data.Width);
                item.height.val(data.Height);
            }
            this.$items.push(item);
        },
        eventAddItem: function(){
            this.buildItem();
        },
        eventDeletItem: function(ev, dom){
            var index = +$(dom).attr("key");
            if (index){
                // 从DOM中删除
                var item = util.find(this.$items, index, 'guid');
                if(item){
                    item.el.remove();
                    item.name.destroy();
                    // 从this.$items中删除
                    util.remove(this.$items, item);
                }
            }
        },
        eventUploadMaterial: function(ev, dom){
            var pathInput = $(dom).prev('.path');
            var win = this.get('uploadMaterialWin');
            if (!win){
                win = this.create('uploadMaterialWin', UploadMaterialWin);
            }
            win.reset().setData(pathInput).show();

        },
        // 传入全部data,loop 创建
        setData: function(data){
            this.$data = data;
            if (!this.$ready){ return this; }

            // 清空内容
            this.empty();

            // 循环创建
            util.each(data, this.buildItem, this);

            return this;
        },
        // 获取模块数据方法
        getData: function(){
            var data = this.$data = [];
            for (var i=0; i<this.$items.length; i++){
                data.push(this.getItemData(this.$items[i]));
            }
            return data;
        },
        // 获取单项item里面的数据
        getItemData: function(item){
            return {
                'Id': item.id,
                'Path': item.path.val(),
                'Name': item.name.getData(),
                'Width': +item.width.val(),
                'Height': +item.height.val()
            };
        },
        // 保存项目数据
        save: function(){
            var self = this;
            var count = 0;
            util.each(self.$items, function(item){
                var data = self.getItemData(item);
                if (item.data){
                    var last = item.data;
                    if (
                        item.id > 0 &&
                        last.Path == data.Path &&
                        last.Name == data.Name &&
                        last.Width == data.Width &&
                        last.Height == data.Height
                    ){
                        return;
                    }
                }

                // 数据变化或者为新数据, 保存数据
                count++;
                app.data.put(self.config.urlUpload, data, self, 'afterSave', item);
            });
            self.$saveError = [];
            self.$saveCount = count;
            if (count <= 0){
                self.fire('materialUploadFinish', {
                    'error': self.$saveError,
                    'data': self.getData()
                });
            }
            return self;
        },
        afterSave: function(err, data, item){
            var self = this;
            self.$saveCount--;
            if (err){
                self.$saveError.push({
                    'name':item.name.getData(),
                    'message': err.message || '未知错误'
                });
                app.error(err);
            }else {
                item.id = data._id;
                item.data = data;
            }
            if (self.$saveCount === 0){
                self.fire('materialUploadFinish', {
                    'error': self.$saveError,
                    'data': self.getData()
                });
            }
        },
        empty: function(){
            // 清空data
            this.$data = [];
            util.each(this.$items, function(item){
                item.name.destroy();
            });

            this.doms.wrap.empty();
            this.$items = [];
        },
        reset: function(){
            this.empty();
            //this.buildItem();
            return this;
        }
    });
    exports.main = MaterialOuterlink;


    // 上传物料窗口
    var UploadMaterialWin = app.extend(popwin.base, {
        init: function(config){
            config = $.extend({
                width: 550,
                title: LANG('上传物料')
            }, config);
            UploadMaterialWin.master(this, null, config);
            UploadMaterialWin.master(this, 'init', arguments);

            this.$ready = false;
            this.$pathInput = null;
            this.build();
        },
        build: function(){
            if (this.$ready){ return false; }
            var el = this.body;
            var doms = this.doms = {};
            doms.wrap = $('<div class="uploadMaterialWrap"/>').css('margin-left',30).appendTo(el);

            // 上传物料按钮
            doms.uploadMaterial = this.create(
                "uploadMaterial"
                ,upload.porter
                ,{
                    "target":doms.wrap
                    ,"preview":0
                    ,"title":null
                    ,"type":"youku"
                    ,"mode":"material"
                    ,"multiple":0
                    ,"progress":1
                    ,"uploadUrl":"/materials/upload"
                    ,'tips': LANG('请上传：flv文件。')
                }
            );
            this.$ready = true;
        },
        setData: function(pathInput){
            this.$pathInput = pathInput;
            return this;
        },
        reset: function(){
            this.$pathInput = null;
            this.doms.uploadMaterial.reset();
            return this;
        },
        onOk: function(){
            this.hide();
            return false;
        }
        /**
         * 文件上传成功
         * @param  {Object} ev 消息对象
         * @return {Bool}      阻止冒泡
         */
        ,onUploadSuccess:function(ev){
            if(ev.from.config.mode === "material"){
                if(this.$pathInput && this.$pathInput.length!==0){
                    // 设置地址栏input框的值
                    this.$pathInput.val(ev.param.data && ev.param.data.video_url);
                    this.hide();
                }
            }
            return false;
        }
        ,onUploadProgress: function(ev){
            return false;
        }
        ,onUploadStart: function(ev){
            return false;
        }
    });

    // 上传自定义物料
    var MaterialCustom  = app.extend(view.container, {
        init: function(config, parent){
            config = $.extend({
                'target': parent,
                'class': 'M-materialCustom',
                'urlLoad': '/nextgen/sweetyedit?method=getAdm', // 物料上传地址 todo
                'urlUpload': '/nextgen/sweetyedit?method=saveAdm'
            }, config);

            MaterialCustom.master(this, null, config);
            MaterialCustom.master(this, 'init', arguments);

            // 数据
            this.$data = [];
            // 创意包Id
            this.$id = 0;

            // 计数
            this.$count = 0;

            this.build();
        },
        build: function(){
            var el = this.el;

            this.$wrap = $('<div class="M-materialCustomMain"/>').appendTo(el);
            //this.buildItem();


            this.$addBtn = $('<input class="addBtn mt10" type="button" value="'+LANG("添加物料")+'">').appendTo(el);

            this.jq(this.$addBtn, 'click', 'eventAddItem');
        },
        eventAddItem: function(ev){
            this.buildItem();
            return false;
        },
        // 创建项目
        buildItem: function(data){
            data = data || {};

            var target = this.$wrap;
            var con = $([
                '<div class="M-materialCustomWrapper" data-id="'+util.html(data.Id||this.$count--)+'">',
                '<div class="M-materialCustomHeader">',
                '<label>'+LANG('地址：')+'</label><input type="text" class="url" value="'+util.html(data.AdmUrl||'')+'"/>',
                '<i class="remove"></i>',
                '</div>',
                '<div class="M-materialCustomContent">',
                '<div class="M-materialCustomThumb">',
                '<img alt="'+LANG('预览图')+'" src="'+util.html(data.Thumb||'')+'"/>',
                '</div>',
                '<div class="M-materialCustomInfo">',
                '<input type="text" class="name" value="'+util.html(data.Name||'')+'"/>',
                '<div>',
                '<label>'+LANG('类型：')+'</label><span class="type">'+util.html(data.Type||'')+'</span>',
                '</div>',
                '<div>',
                '<label>'+LANG('宽度：')+'</label><span class="width">'+util.html(data.Width||'')+'</span>',
                '<label>'+LANG('高度：')+'</label><span class="height">'+util.html(data.Height||'')+'</span>',
                '</div>',
                '</div>',
                '<div class="M-materialCustomCtrl">',
                '<a class="preview" href="/nextgen/sweetyedit?method=previewAdm&url='+encodeURIComponent(data.AdmUrl|| '')+'" target="_blank">'+LANG('预览')+'</a>',
                '</div>',
                '</div>',
                '</div>'
            ].join('')).appendTo(target);

            this.jq(con.find('.M-materialCustomHeader input'), 'change', 'eventInputChange');
            this.jq(con.find('.M-materialCustomHeader .remove'), 'click', 'eventRemoveItem');
            this.jq(con.find('.M-materialCustomCtrl .preview'), 'click', 'eventPreview');
        },
        // 删除项目
        eventRemoveItem: function(ev, dom){
            var item = $(dom).parents('.M-materialCustomWrapper');
            item.remove();
            return false;
        },
        // 地址输入框数据改变事件
        eventInputChange: function(ev, dom){
            // @todo 检测是否为网址格式
            this.loadInfo($(dom));
            return false;
        },
        // 加载自定义物料
        loadInfo: function(dom){
            var url = this.config.urlLoad;
            var data = dom.val();
            // todo 添加loading
            app.data.get(url, {url: data}, this, 'onInfo', dom);
        },
        onInfo: function(err, data, dom){
            if(err){
                app.alert(err.message);
                return false;
            }
            this.setInfo(data, dom);
        },
        // 更新物料信息
        setInfo: function(data, target){
            var dom = target.parent().siblings('.M-materialCustomContent');
            dom.show();

            // 自定义创意名显示级别高于默认创意名
            var name = dom.find('.name').val();
            if(!name){
                dom.find('.name').val(data.name);
            }

            dom.find('img').attr('src', data.thumb);
            dom.find('.type').html(data.type);
            dom.find('.width').html(data.width);
            dom.find('.height').html(data.height);

            var url = target.val();
            dom.find('.preview').attr('href', '/nextgen/sweetyedit?method=previewAdm&url='+encodeURIComponent(url));
        },
        getData: function(){
            return this.getItemData();
        },
        setData: function(data, id){
            this.$id = id;
            this.el.find('.M-materialCustomMain').empty();
            for (var i = 0; i < data.length; i++) {
                this.buildItem(data[i]);
                this.$data.push({
                    Name: data[i].Name,
                    Id: data[i].Id
                });
            }
            this.el.find('.M-materialCustomContent').show();
        },
        reset: function(){
            this.$id = 0;
            this.$data = [];
            this.$count = 0;
            this.el.find('.M-materialCustomMain').empty();
            //this.buildItem();
            return this;
        },
        getItemData: function(){
            var data = [];
            var item;
            var doms = this.el.find('.M-materialCustomWrapper');

            // 编辑时为创意id; 新建时为0
            var id = 0;

            for (var i = 0; i < doms.length; i++) {
                item = $(doms[i]);
                id = +item.attr('data-id');
                if(item.find('.M-materialCustomContent').css('display') !== 'none'){
                    data.push({
                        Name: item.find('.name').val(),
                        Url: item.find('.url').val(),
                        Id: id || 0
                    });
                }
            }
            return data;
        },
        // 保存项目数据
        save: function(){
            var self = this;
            var count = 0;

            var itemData = self.getItemData();
            util.each(itemData, function(data){
                count++;
                app.data.put(self.config.urlUpload, data, self, 'afterSave', data);
            });
            self.$saveError = [];
            self.$saveCount = count;
            if (count <= 0){
                self.fire('materialUploadFinish', {
                    'error': self.$saveError
                });
            }
            return self;
        },
        afterSave: function(err, data, item){
            var self = this;
            self.$saveCount--;

            if (err){
                self.$saveError.push({
                    'name':item.Name,
                    'message': err.message || '未知错误'
                });
                app.error(err);
            }else {
                // 查找相应的负数id，更新为正确的id；
                var dom = this.el.find('.M-materialCustomWrapper[data-id="'+item.Id+'"]');
                dom.attr('data-id', data._id);
            }
            if (self.$saveCount === 0){
                self.fire('materialUploadFinish', {
                    'error': self.$saveError
                });
            }
        }
    });
    exports.custom = MaterialCustom;


});