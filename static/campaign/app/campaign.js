define(function(require, exports){
    var pages = require('pages/campaign');
    var util = require('util');

    exports.MODULE_NAME = 'campaign';

    var CAMPAIGNNAME = {
        0: LANG('PC活动'),
        1: LANG('首选交易活动'),
        2: LANG('私下竞价活动')
    };

    var MTCAMPAIGNNAME = {
        0: LANG('移动广告'),
        1: LANG('移动首选交易活动'),
        2: LANG('移动私下竞价活动')
    };

    var PLATFORM;
    exports.beforeAction = function(boot, data, app){
        if(!PLATFORM){
            PLATFORM = app.core.get("platform");
        }
    }

    // 活动列表
    exports.onMain = function(boot, data, app){
        PLATFORM.setPlatform(0,LANG("活动"),true);
        var mod = app.core.get(data.name);
        if (!mod){
            mod = app.core.create(
                data.name,
                pages.list,
                {
                    'class': 'P-campaignList',
                    'target': boot.getMainView()
                }
            );
        }else{
            mod.cast("channelChange");
        }
        mod.reset();
        // 通过url参数做种类过滤，用于快捷键跳转地址
        var filterType = data.search ? data.search.filterType : null;
        if (filterType == 'rtb') {
            mod.filterRtbType();
        }
        if (filterType == 'proxy') {
            mod.filterProxyType();
        }

        boot.switchPage(mod._.uri);
    }

    // 添加活动
    exports.onCreate = function(boot, data, app){

        PLATFORM.setPlatform(0,LANG("添加活动"));
        var mod = app.core.get(data.name);
        if (!mod){
            mod = app.core.create(
                data.name, pages.type,
                {target: boot.getMainView()}
            );
        }
        boot.switchPage(mod._.uri);
    }

    // 编辑活动
    function doEdit(boot, data, app, form){
        // 设置显示区域为特殊样色
        PLATFORM.toggleAside(0, 0);
        var mod = app.core.get(data.name);
        if (!mod){
            mod = app.core.create(
                data.name, form,
                {
                    'class': 'P-campaignForm',
                    'target': boot.getMainView(),
                    'bidType': data.BidType,
                    'batch': data.Batch
                }
            );
        }
        var title = LANG(data.Batch ? LANG('批量')+"添加%1" : "添加%1", data.title);
        if (+data.param){
            mod.loadData(+data.param);
            title = LANG("编辑%1", data.title);
        }else{
            mod.reset();
        }
        PLATFORM.setPlatform(0,title);
        boot.switchPage(mod._.uri);
    }

    // 另存为
    exports.onSaveas = function(boot,data,app){
        PLATFORM.toggleAside(0, 0);
        if(!app.util.isObject(data.search) || !data.search.Channel){
            app.alert(LANG("似乎一些节操丢失了。。。"));
            if(window.opener){
                window.close();
            }else{
                app.navigate("campaign");
            }
            return false;
        }

        // 表单类型
        var type = data.search.Channel,
            text = '',
            pagename = '',
            BidType = data.search && +data.search.BidType || 0;

        data.BidType = BidType;

        switch(+type){
            case 1:
                text = CAMPAIGNNAME[BidType||0];
                pagename = 'saveAsForm';
                break;
            case 2:
                text = LANG('广告监测');
                pagename = 'saveAsFormAgent';
                break;
            case 4:
                text = MTCAMPAIGNNAME[BidType||0];
                pagename = 'saveAsFormMobile';
                break;
            default:
                break;
        }

        var mod = app.core.get("campaignEdit");
        PLATFORM.setPlatform(0,LANG("添加%1",text));

        if (!mod){
            mod = app.core.create(
                data.name
                ,pages[pagename]
                ,{
                    "class":"P-campaignForm",
                    "target":boot.getMainView(),
                    "bidType": data.BidType
                }
            );
        }
        mod.loadData(+data.param,true);
        boot.switchPage(mod._.uri);
    }

    // RTB活动编辑
    exports.onEdit = function(boot, data, app){
        var BidType = data.search && +data.search.BidType || 0;
        var Batch = data.search && +data.search.Batch || 0;
        data.Channel = 1;

        var campany = app.getUserCampany();
        var hasPref = campany.HasCreatePref;	// 首选订单
        var hasPriv = campany.HasCreatePriv;	// 私有订单
        if(BidType){
            // 权限跳转
            switch (true){
                case (!hasPref && !hasPriv):
                case (!hasPref && BidType==1):
                case (!hasPriv && BidType==2):
                    app.navigate('campaign');	// 没有权限，跳转会列表页
                    break;
            }
        }

        // 更改名称
        data.title = CAMPAIGNNAME[BidType||0];

        data.BidType = BidType;
        data.Batch = Batch;
        doEdit.call(this, boot, data, app, pages.form);
        if(util.exist([34750], app.getOriginUserId())){
            if(Batch){
                // 显示新建单个活动
                PLATFORM.setBatch('#campaign/edit'+'?BidType='+BidType+'&Batch='+0, LANG('新建单个活动'));
            }else{
                // 显示批量建活动
                PLATFORM.setBatch('#campaign/edit'+'?BidType='+BidType+'&Batch='+1, LANG('批量建活动'));
            }
        }


    }
    // 编辑代理活动
    exports.onAgentEdit = function(boot, data, app){
        data.Channel = 2;
        data.title = LANG('广告监测');
        data.name = 'campaignAgentEdit';
        doEdit.call(this, boot, data, app, pages.formAgent);
    }
    // 编辑直投活动
    exports.onDirectEdit = function(boot, data, app){
        data.Channel = 3;
        data.title = LANG('直投广告');
        data.name = 'campaignDirectEdit';
        doEdit.call(this, boot, data, app, pages.formDirect);
    }
    // RTB活动编辑 -移动端
    exports.onMTEdit = function(boot, data, app){
        var BidType = data.search && +data.search.BidType || 0;
        var Batch = data.search && +data.search.Batch || 0;
        data.Channel = 4;

        var campany = app.getUserCampany();
        var hasPref = campany.HasCreatePref;	// 首选订单
        var hasPriv = campany.HasCreatePriv;	// 私有订单
        if(BidType){
            // 权限跳转
            switch (true){
                case (!hasPref && !hasPriv):
                case (!hasPref && BidType==1):
                case (!hasPriv && BidType==2):
                    app.navigate('campaign');	// 没有权限，跳转会列表页
                    break;
            }
        }

        // 更改名称
        data.title = MTCAMPAIGNNAME[BidType||0];

        data.BidType = BidType;
        data.Batch = Batch;
        doEdit.call(this, boot, data, app, pages.formMT);
        if(util.exist([34750], app.getOriginUserId())){
            if(Batch){
                // 显示新建单个活动
                PLATFORM.setBatch('#campaign/MTEdit'+'?BidType='+BidType+'&Batch='+0, LANG('新建单个活动'));
            }else{
                // 显示批量建活动
                PLATFORM.setBatch('#campaign/MTEdit'+'?BidType='+BidType+'&Batch='+1, LANG('批量建活动'));
            }
        }
    }

    // 复制广告位代码
    exports.onCode = function(boot, data, app){
        PLATFORM.setPlatform(0,LANG("广告位代码复制"));

        var mod = app.core.get(data.name);
        if (!mod){
            mod = app.core.create(
                data.name,
                pages.campaignCode,
                {
                    'target': boot.getMainView(),
                    'param': {Id: data.param}
                }
            );
        }else{
            mod.reset();
            mod.load({Id: data.param});
        }
        boot.switchPage(mod._.uri);
    }

    // 详情
    exports.onDetail = function(boot,data,app){
        PLATFORM.setPlatform(0,LANG("活动详情"));

        var mod = app.core.get("campaignDetail");
        if(mod){
            mod.reload({
                "Id":data.param
            });
        }else{
            mod = app.core.create(
                "campaignDetail"
                ,pages.detail
                ,{
                    "target":boot.getMainView().el
                    ,"param":{
                        "Id":data.param
                    }
                }
            );
        }

        boot.switchPage(mod._.uri);
    }

    exports.onMore = function(boot,data,app){
        var mod = app.core.get("campaignMore");
        PLATFORM.toggleAside(1, 1);
        if(!mod){
            PLATFORM.setPlatform(1,LANG("活动"),true);
            mod = app.core.create(
                "campaignMore"
                ,pages.more
                ,{
                    "target":boot.getMainView().el
                }
            );
        }
        mod.reset();
        mod.load(data);
        boot.switchPage(mod._.uri);
    }

    /**
     * 活动诊断
     * @return {Undefined}      无返回值
     */
    exports.onDiagnosis = function(boot,data,app){
        PLATFORM.setPlatform(0,LANG("活动诊断"));
        var mod = app.core.get("campaignDiagnosis");
        if(!mod){
            mod = app.core.create(
                "campaignDiagnosis"
                ,pages.diagnosis
                ,{
                    "target":boot.getMainView().el
                }
            );
        }
        mod.load(+data.param);
        boot.switchPage(mod._.uri);
    }

    /**
     * 活动 -创意包subgrid-点击名称预览创意
     * @return {Undefined}      无返回值
     */
    exports.onCreativePreview = function(boot,data,app){
        var body = document.body;
        body.innerHTML = '';
        body.className = '';
        body.style.background = '#fff';

        var param = {
            SweetyId: data.param,
            no_stastic_data: 1,
            limit: 1
        };

        app.data.get('/rest/listsweetycreative', param, function(i,datas){
            var preview_url = app.config('preview_page'),
                front_base  = app.config('front_base'),
                row = datas.items[0];

            if (!/^(http|https):\/\//i.test(row.Path)){
                row.Path = front_base + row.Path;
            }
            var url = util.formatIndex2(
                preview_url, encodeURIComponent(row.Path),
                row.Height, row.Width, row.FileType
            );
            window.location.href=url;
        });
    }

    // 在线查看广告
    exports.onAdOnline = function(boot, data, app){
        PLATFORM.setPlatform(0,LANG("在线查看广告"));

        var mod = app.core.get(data.name);
        if (!mod){
            mod = app.core.create(
                data.name,
                pages.adOnline,
                {
                    'target': boot.getMainView().el
                    ,'CampaignId':data.param
                }
            );
        }
        mod.setParam({
            'Ids': data.param
            ,'no_stastic_data':1
            ,'MFields':'AllowCookies'
        }).load();
        boot.switchPage(mod._.uri);
    }

});