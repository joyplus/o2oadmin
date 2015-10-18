define(function (require, exports) {
    var app = require('app');
    var $ = require('jquery');
    var util = require('util');
    var view = require('view');
    var form = require('form');
    var upload = require('upload')

    // 根据配置动态生成表单模块(用于图文创意的子模板)
    var Base = app.extend(view.container, {
        init: function(config) {
            config = $.extend({
                'class': 'M-dynamicForm',
                'fields': [
                ],
                'values': null
            }, config);

            Base.master(this, null, config);
            Base.master(this, 'init', arguments);

            this.$items = [];
            this.$ready = false;
            this.build();
        },
        build: function() {
            var c = this.config;
            if (this.$ready) {
                return;
            }

            util.each(c.fields, this.buildItem, this);

            if (c.values) {
                this.setData(c.values);
            }

            this.$ready = true;
        },
        buildItem: function(field, index) {
            var container = $('<div class="M-dynamicFormItem"></div>').appendTo(this.el);
            var name = util.guid('DYNAMIC_FORM_ITEM_');
            var title = field.title;
            var type = field.type;
            switch(type) {
                case 'text':
                    this.buildTextItem(field, name, container);
                    break;
                case 'image':
                    this.buildImageItem(field, name, container);
                    break;
                default:
                    return;
            }
            $([
                '<div class="M-dynamicFormTitle">',
                title,
                '<small class="M-dynamicFormDesc">(' + field.description + ')</small>',
                '</div>'
            ].join('')).prependTo(container);

            this.$items.push({
                name: name,
                type: type,
                field: field,
                title: title,
                container: container
            });
        },
        // 文本类型
        buildTextItem: function(field, name, container) {
            var isTextArea = field.max > 50;
            this.create(name, form.input, {
                'target': container,
                'class': 'M-formItem M-dynamicFormText',
                'label': null,
                'type': isTextArea ? 'textarea' : 'text',
                'width': 450,
                'height': isTextArea ? 60 : null,
                'value': field.defaultValue || ""
            });
        },
        // 图片类
        buildImageItem: function(field, name, container) {
            // 动态限制图片类型、图片大小、预览图大小
            this.create(name, upload.porter, {
                'target': container,
                'class': 'M-upload M-dynamicFormUpload',
                // 上传接口
                "uploadUrl": "/rest/addfile",
                // 上传类型
                "type":"thumb",
                // 标题
                "title": null,
                // 预览图配置
                "thumbConfig":{
                    "url":"sweety/imageshow",
                    "size": {
                        "width": 100,
                        "height": 100
                    }
                }
            });
        },
        validate: function() {
            var cs = this.$ || {};
            var isFit = true;
            util.each(this.$items, function(item) {
                var module = cs[item.name];
                var value = module.getData();
                var field = item.field;
                isFit = false;
                switch(item.type) {
                    case 'text':
                        if (field.min && util.byteLen(value) < field.min) {
                            module.focus();
                            app.alert(LANG("%1的长度最小需要为%2", field.title, field.min));
                        } else if (field.max && util.byteLen(value) > field.max) {
                            module.focus();
                            app.alert(LANG("%1的最大长度不能超过%2", field.title, field.max));
                        } else {
                            isFit = true;
                        }
                        break;
                    case 'image':
                        if (field.maxSize && value.FileSize > field.maxSize) {
                            app.alert(LANG("%1的图片大小最大只能为%2kb", field.title, field.maxSize));
                        } else if ((field.width || field.height) && (field.width != value.Width || field.height != value.Height)) {
                            app.alert(LANG("%1的图片尺寸不对，图片需要为%2X%3 px", field.title, field.width, field.height));
                        } else {
                            isFit = true;
                        }
                        break;
                    default:
                        isFit = true;
                }
                if (!isFit) {
                    return false;
                }
            }, this);

            return isFit;
        },
        setData: function(data) {
            var cs = this.$ || {};
            util.each(this.$items, function(item) {
                var field = item.field.field;
                if (field in data) {
                    cs[item.name].setData(data[field]);
                }
            });

            return this;
        },
        getData: function() {
            var data = {};
            var cs = this.$ || {};
            util.each(this.$items, function(item) {
                data[item.field.field] = cs[item.name].getData();
            });

            return data;
        }
    });
    exports.base = Base;
})