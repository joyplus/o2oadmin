// 图文创意编辑模块
define(function(require, exports) {
    var $ = require('jquery');
    var app = require('app');
    var view = require('view');
    var util = require('util');
    var upload = require('upload');
    var pop = require("popwin_base");
    var form = require('form');
    var common = require('common');
    var dynamicForm = require("dynamicForm");

    // 选择模板弹出层
    var SelectPop = app.extend(pop.base, {
        init: function(config) {
            config = $.extend({
                'title': LANG("请选择渠道模板"),
                'url': '',
                'param': null,
                'auto_load': false,
                'key': 'id',
                'text': 'text'
            }, config);

            this.$data = [];

            SelectPop.master(this, null, config);
            SelectPop.master(this, 'init', arguments);

            this.build();
        },
        build: function(){
            this.con = $('<div class="M-graphicCreativePopCon"/>').appendTo(this.body);
        },
        render: function() {
            var c = this.config;
            SelectPop.master(this, 'render', arguments);
            if (c.auto_load) {
                this.load();
            }
        },
        showLoading: function(){
            var cs = this.$ || {};
            if (!cs.loading){
                this.body.css({
                    position: 'relative'
                });

                this.create('loading', common.loadingMask, {
                    target: this.con
                });
            }
            cs.loading.show();
        },
        hideLoading: function() {
            if (this.$ && this.$.loading) {
                this.$.loading.hide();
            }
        },
        setParam: function(param, replace) {
            var c = this.config;
            c.param = replace ? param : util.extend(c.param, param);
            return this;
        },
        reset: function(resetData) {
            if (resetData) {
                this.$data = [];
            }

            if (this.$ && this.$.content) {
                this.$.content.reset();
            }
            return this;
        },
        load: function() {
            var c = this.config;
            this.showLoading();
            app.data.get(c.url, c.param, this);
            return this;
        },
        onData: function(err, data) {
            this.hideLoading();
            if (err) {
                return app.alert(err.message);
            }

            this.setData(data || []);
        },
        formatData: function(data) {
            var res = [];
            var c = this.config;
            util.each(data, function(item) {
                res.push({
                    text: item[c.text],
                    value: item[c.key]
                });
            });
            return res;
        },
        setData: function(data) {
            this.$data = this.formatData(data);
            if (this.$ && this.$.content) {
                this.$.content.setData(data);
            } else {
                var content = this.create('content', form.checkbox, {
                    'target': this.con,
                    'label': null,
                    'option': this.$data,
                    'value': null,
                    'changeEvent': false,
                    'vertical': true
                });
                content.reset();
            }
            return this;
        },
        onOk: function(ev) {
            var res = [];
            var values = this.$.content.getData();
            var data = this.$data || [];
            if (!values) {
                return app.alert(LANG("你还没有选择"));
            }

            // 将id转为对象
            util.each(values, function(id) {
                var item = util.find(data, id, 'value');
                res.push({
                    id: id,
                    name: item ? item.text : LANG("未知")
                });
            });

            this.fire('selectTplOk', res);
            this.hide();
        }
    });


    // 单个渠道模板表单
    var Item = app.extend(view.container, {
        init: function(config) {
            config = $.extend({
                '$id': '',   // 渠道模板id
                'class': 'M-graphicCreativeItemContent',
                'namePrefix': LANG("新建创意包")
            }, config);

            Item.master(this, null, config);
            Item.master(this, 'init', arguments);

            this.$list = [];
            this.$ready = false;

            this.build();
        },
        build: function() {
            var c = this.config;
            var doms = this.doms = {};
            if (this.$ready) {
                return false;
            }

            doms.title = $('<h5 class="M-graphicCreativeItemTitle">' + c.title + '</h5>').appendTo(this.el);
            doms.container = $('<div class="M-graphicCreativeItemListContainer"></div>').appendTo(this.el);
            doms.list = $('<ul></ul>').appendTo(doms.container);

            this.$scroller = this.create('scroller', common.scroller, {
                "target": doms.container,
                "content": doms.list,
                "dir": "v",
                "pad": 0
            });

            // 动态限制图片类型、图片大小、预览图大小
            this.$uploader = this.create('uploadMaterial', upload.porter, {
                'target': this.el,
                'class': 'M-upload M-graphicCreativeItemUpload',
                // 上传接口
                "uploadUrl": "/sweety/sweetyedit?method=upload",
                "param": {
                    'AdxId': c.$id
                },
                // 上传类型
                "type":"thumb",  // TODO: 需要加多一个类型
                // 标题
                "title": null,
                "mode": "graphic",
                "multiple": 1,
                "process": 1,
                "preview": 0,
                'tips': LANG('请上传：jpg,png文件。可批量上传，每个尺寸只能上传一个！')
            });

            this.$ready = true;
        },
        validate: function() {
            var validatePass = true;
            if (!this.checkRepeat()) {
                app.alert(LANG("存在重复模板"));
                return false;
            }

            util.each(this.$list, function(item, index) {
                if (!item.form.validate()) {
                    validatePass = false;
                    return false;
                }
            });
            return validatePass;
        },
        getData: function() {
            var res = [];
            var c = this.config;
            util.each(this.$list, function(item, index) {
                var name = item.nameInput.getData();
                res.push({
                    _id: item.originData && item.originData._id || -index,
                    Name: name,
                    Type: c.$id,     // 主模板id
                    SubType: item.tplId,  // 子模板id
                    Data: util.extend({
                        Material: item.material  // 主素材
                    }, item.form.getData())      // 模板字段
                });
            }, this);

            return res;
        },
        setData: function(data) {
            this.$data = data;
            util.each(data, function(item) {
                this.addItem(item.Data && item.Data.Material || {}, item.Template, item);
            }, this);
            return this;
        },
        // 根据上传的素材尺寸获取插入的前一项的dom
        getBeforeItemEl: function(material) {
            var curElm = null;
            var curWidth = 0;
            var curHeight = 0;
            var curTime = 0;
            util.each(this.$list, function(item) {
                var materialData = item.material;
                var width = materialData.Width;
                var height = materialData.Height;
                // 按照width > height > timestamp的优先级排序，选择最优的插入位置
                if (width <= material.Width && height <= material.Height &&
                    (
                        width > curWidth ||
                        width == curWidth && height > curHeight ||
                        width == curHeight && height == curHeight && materialData.timestamp > curTime
                    )
                ) {
                    curElm = item.elm;
                    curWidth = width;
                    curHeight = height;
                    curTime = materialData.timestamp;
                }
            });

            return curElm;
        },
        itemTpl: [
            '<div class="graphicHead"></div>',
            '<div class="graphicMaterial clear">',
            '<div class="graphicLeft"/>',
            '<div class="graphicRight">',
            '<div class="graphicName"/>',
            '<div class="fileInfo">',
            '<span>' + LANG("类型：") + '<em>{1}</em></span>',
            '<span>' + LANG("大小：") + '<em>{2}KB</em></span>',
            '<span class="block">' + LANG("尺寸：") + '<em>{3}*{4}</em></span>',
            '</div>',
            '</div>',
            '<div class="graphicCtrl"/>',
            '</div>',
            '<div class="graphicForm"></div>'
        ].join(''),
        /**
         * 添加一项
         * @param {Object} material 素材
         * @param {Object} tpl      模板配置
         * @param {Object} data     全部数据（编辑时用到）
         */
        addItem: function(material, tpl, data) {
            var c = this.config;
            var guid = util.guid('_GRAPHIC_ITEM_');
            var befItemEl = this.getBeforeItemEl(material);
            var elm = $('<li class="M-graphicCreativeItemChild"></li>');

            if (befItemEl) {
                elm.insertAfter(befItemEl);
            } else {
                elm.prependTo(this.doms.list);
            }
            // 插入模板
            elm.append(util.formatIndex2(this.itemTpl, material.FileType, Math.ceil(material.FileSize/1024), material.Width || "N/A", material.Height || "N/A"));

            // 图片素材
            var img = $('<img src="' + util.imageThumb(material.Thumb, 65, 80) + '" />');
            util.imageError(img, 'creative');
            img.appendTo(elm.find('.graphicLeft'));

            // 名称
            var nameInput = this.create('NAME' + guid, common.input, {
                "target": elm.find('.graphicName'),
                "type":"text",
                "value": data && data.Name || c.namePrefix + (material.Width && material.Width + "x" || "") + (material.Height && material.Height + "_" || "") + material.FileType + "_" + util.date("Y-m-d")
            });

            // 按钮
            var previewBtn = $('<a href="#">' + LANG("预览") + '</a>').appendTo(elm.find('.graphicCtrl'));
            var removeBtn = $('<a href="#">' + LANG("删除") + '</a>').appendTo(elm.find('.graphicCtrl'));
            this.jq(previewBtn, 'click', guid, 'eventPreviewItem');
            this.jq(removeBtn, 'click', guid, 'eventRemoveItem');

            // 模板相关
            var title = $('<div class="graphicTitle"></div>').appendTo(elm.find('.graphicHead')).text(tpl && tpl.title || '');
            var form = this.create('FORM'+ guid, dynamicForm.base, {
                'target': elm.find('.graphicForm'),
                'fields': tpl && tpl.fields || null,
                'values': data && data.Data || null,
                'class': 'M-GraphicPreviewMaterialForm M-dynamicForm'
            });

            this.$list.push({
                elm: elm,
                frontendId: guid,
                timestamp: +new Date(),  // 用于排序
                previewBtn: previewBtn,
                nameInput: nameInput,
                removeBtn: removeBtn,
                title: title,
                form: form,
                material: material,
                tpl: tpl,
                tplId: tpl && tpl.templateId || '',
                originData: data
            });

            this.$scroller.measure();
        },
        // 移除某项
        removeItem: function(frontendId) {
            var index = util.index(this.$list, frontendId, 'frontendId');

            if (index != null) {
                var item = this.$list[index];
                item.previewBtn.unbind('click');
                item.removeBtn.unbind('click');
                item.nameInput.destroy();
                item.form.destroy();
                item.elm.remove();
                this.$list.splice(index, 1);
                this.$scroller.measure();
            }
        },
        // 预览某项
        previewItem: function(frontendId) {
            var item = util.find(this.$list, frontendId, 'frontendId');
            if (item && item.material) {
                // TODO: 预览
                var material = item.material;
                if (material.Path) {
                    var url = util.formatIndex(
                        app.config('preview_page'),
                        encodeURIComponent(app.config('front_base') + material.Path), material.Height, material.Width, material.FileType
                    );
                    window.open(url, "PreviewGraphicMaterialWindow");
                }
            }
        },
        // 检查重复
        checkRepeat: function() {
            var uniqueObj = {};
            var repeatCount = 0;
            util.each(this.$list, function(item) {
                var key = [item.material.Width, item.material.Height, item.tplId].join('__');
                uniqueObj[key] = (uniqueObj[key] || []).concat(item);
            });

            util.each(uniqueObj, function(arr){
                var isRepeat = arr.length > 1;
                if (isRepeat) {
                    repeatCount++;
                }
                util.each(arr, function(item) {
                    item.elm.toggleClass('M-graphicCreativeItemChildRepeat', isRepeat);
                });
            });
            return repeatCount === 0;
        },
        onSizeChange: function() {
            this.$scroller.measure();
        },
        // 单个素材上传成功
        onUploadSuccess: function(ev) {
            var data = ev.param.data || {};
            var tpls = data.Template;
            var availableSize = data.availableSize || [];
            var materialData = data.Material;   // 上传时文件信息和模板分开两个属性
            if (ev.source == this.$uploader) {
                if (!tpls || !tpls.length) {
                    app.alert(LANG("没有找到和上传素材尺寸相匹配的模板，目前支持的尺寸有【%1】", availableSize.join('、')));
                    return;
                }

                util.each(tpls, function(tpl) {
                    this.addItem(materialData, tpl);
                }, this);
            }
        },
        // 素材全部上传完毕
        onAllUploaded: function(ev) {
            if (ev.source == this.$uploader) {
                this.checkRepeat();
            }
        },
        // 预览事件
        eventPreviewItem: function(evt) {
            evt.preventDefault();
            this.previewItem(evt.data);
        },
        eventRemoveItem: function(evt) {
            evt.preventDefault();
            this.removeItem(evt.data);
        }
    });

    // 图文创意主模块
    var Main = app.extend(view.container, {
        init: function(config, parent) {
            config = $.extend({
                'class': 'M-graphicCreative'
            }, config);

            Main.master(this, null, config);
            Main.master(this, 'init', arguments);

            this.$itemsStack = [];
            this.$ready = false;

            this.build();
        },
        build: function() {
            if (this.$ready) {
                return false;
            }

            // 构建容器
            var doms = this.doms = {
                wrap: $('<div class="M-graphicCreativeWrapper">').appendTo(this.el),
                addBtn: $('<input class="addBtn mt10" type="button" value="'+LANG("添加模板")+'">').appendTo(this.el)
            }

            this.jq(doms.addBtn, 'click', 'eventAddBtnClick');

            this.$ready = true;
        },
        reset: function() {
            while(this.$itemsStack.length) {
                this.removeItem(this.$itemsStack[0]);
            }
            return this;
        },
        validate: function() {
            var validatePass = true;
            var cs = this.$ || {};

            util.each(this.$itemsStack, function(item) {
                if (!cs[item.name].validate()) {
                    validatePass = false;
                    return false;
                }
            });

            return validatePass;
        },
        getData: function() {
            var data = [];
            var cs = this.$ || {};

            util.each(this.$itemsStack, function(item) {
                // 打平数据
                data = data.concat(cs[item.name].getData());
            }, this);

            return data;
        },
        setData: function(data) {
            this.$data = data;
            var formatData = {};
            var typeTextMap = {};
            // 按渠道模板分组
            util.each(data, function(item) {
                typeTextMap[item.Type] = typeTextMap[item.Type] || item.TypeText;
                formatData[item.Type] = (formatData[item.Type] || []).concat(item);
            });

            util.each(formatData, function(item, typeId) {
                this.addItem(typeId, typeTextMap[typeId], item);
            }, this);
            return this;
        },
        // 添加一项
        addItem: function(typeId, typeText, data) {
            if (util.find(this.$itemsStack, typeId, 'typeId') !== null) {
                app.alert(LANG("该类型已存在"));
                return false;
            }

            var name = util.guid('GRAPHIC_CREATIVE_ITEM_');
            var container = $('<div class="M-graphicCreativeItem"></div>').appendTo(this.doms.wrap);
            var close = $('<i class="removeBtn" title="' + LANG("删除") + '"></i>').appendTo(container);
            var item = {
                typeId: typeId,
                typeText: typeText,
                name: name,
                close: close,
                originData: data,
                container: container
            };

            this.jq(close, 'click', typeId, 'eventRemoveItem');

            this.$itemsStack.push(item);

            this.create(name, Item, {
                target: container,
                $id: typeId,
                title: typeText
            }).setData(data);
        },
        // 移除一项
        removeItem: function(typeId) {
            var cs = this.$;
            var stack = this.$itemsStack;
            if (util.isObject(typeId)) {
                typeId = typeId.typeId;
            }
            var index = util.index(stack, typeId, 'typeId');
            if (index != null) {
                var item = stack.splice(index, 1).shift();
                if (item) {
                    if (cs && cs[item.name]) {
                        cs[item.name].destroy();
                    }
                    item.close.unbind('click');
                    item.container.remove();
                }
            }
        },
        // 显示选择模板弹出层
        showSelectPop: function() {
            var needLoad = false;
            if (!this.$ || !this.$.selectTpl) {
                this.create('selectTpl', SelectPop, {
                    url: 'sweety/sweetyedit?method=loadPicTextTemplate',
                    auto_load: false,
                    key: 'AdxId',
                    text: 'Name'
                });

                needLoad = true;
                this.$.selectTpl.load();
            }
            var mod = this.$.selectTpl;
            mod.reset();
            mod.show();
            if (needLoad) {
                mod.load();
            }
        },
        onSelectTplOk: function(ev) {
            var data = ev.param;
            if (ev.name == 'selectTpl') {
                util.each(data, function(item) {
                    this.addItem(item.id, item.name);
                }, this);
                return false;
            }
        },
        eventAddBtnClick: function() {
            this.showSelectPop();
        },
        eventRemoveItem: function(evt) {
            this.removeItem(evt.data);
        }
    });

    exports.main = Main;
});