<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- 上述3个meta标签*必须*放在最前面，任何其他内容都*必须*跟随其后！ -->
    <title>Bootstrap 101 Template</title>

    <!-- Bootstrap -->
    <link href="http://cdn.bootcss.com/bootstrap/3.3.5/css/bootstrap.min.css" rel="stylesheet">
    <link href="/static/css/campaign.css" rel="stylesheet">

    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="//cdn.bootcss.com/html5shiv/3.7.2/html5shiv.min.js"></script>
      <script src="//cdn.bootcss.com/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->
  </head>
  <body>
    <div class="container">
        <div class="page-header">

        </div>
        <form class="form-horizontal" role="form" method="POST"  id="create_form"   action="#"  autocomplete="off" > 
            <div class="form-group" input-name="ad_category" input-value="" ng-controller="CategoryCtrl">
                <label class="col-sm-3 control-label" label-for="ad_category">广告分类</label>
                <div class="category-selects append-bottom-10 category-wrap">
                    <select class="form-control" id="" name="" >
                        <option value="">请选择一级分类</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-3 control-label">落地页链接</label>
                <div class="col-sm-6">
                    <input class="col-sm-12 form-control" placeholder="http://" value="" name="external_url" type="text">
                </div><span class="help-block valierr" style="color:#FF9966">*</span>
            </div>

            <div class="form-group">
                <label class="col-sm-3 control-label">广告类型</label>
                <div class="col-sm-8">
                    <label class="radio-inline">
                        <input type="radio" name="image_mode" value="2" checked="checked"> 开屏
                    </label>
                    <label class="radio-inline">
                        <input type="radio" name="image_mode" value="3"> 信息流
                    </label>
                    <label class="radio-inline">
                        <input type="radio" name="image_mode" value="4"> 焦点图
                    </label>
					 <label class="radio-inline">
                        <input type="radio" name="image_mode" value="5"> Banner
                    </label>
                    
                </div>
            </div>

            <div class="form-group">
                <label class="col-sm-3 control-label">信息流展示图片</label>
                <div class="col-sm-8">
                    <label class="radio-inline">
                        <input type="radio" name="image_mode" value="2" checked="checked"> 小图(228x150)
                    </label>
                    <label class="radio-inline">
                        <input type="radio" name="image_mode" value="3"> 大图(690x286)
                    </label>
                    <label class="radio-inline">
                        <input type="radio" name="image_mode" value="4"> 组图(228x150)
                    </label>
                    
                </div>
            </div>
 
<div class="form-group">
            <label class="col-sm-3 control-label">
                创意列表
                <i class="fa fa-question-circle tooltip-icon" data-toggle="tooltip" data-placement="top" title="" data-original-title="多个图片标题组合，给用户展示最匹配的创意，提高点击效果"></i>
            </label>
            <div class="col-sm-8">
                <ul class="creative-list clearfix">
                    <!-- todo -->
                    <li ng-click="addCreative()" alt="新增创意" title="新增创意">
                        <i class="fa fa-plus-square-o btn-add-creative"></i>
                        <div>新增创意</div>
                    </li>
                </ul>
                <input type="hidden" name="creative_info" ng-value="creativeInfo|json" value="[]">

                <!-- 此区域用于存储模板回填的数据 -->
                <input type="hidden" id="creative-data" value="">
                <input type="hidden" id="image-mode-data" value="">
                <!-- 此区域用于存储模板回填的数据 -->
            </div>
        </div>
            <div class="form-group">
                <label class="col-sm-3 control-label">
                    第三方展示监测链接
                    <i class="fa fa-question-circle tooltip-icon" data-toggle="tooltip" data-placement="top" title="" data-original-title="用于监测广告的展示效果。"></i>
                </label>
                <div class="col-sm-9 ng-scope" >
                        <div class="row has-feedback url-detect">
                            <div class="col-sm-6">
                                <input type="text" class="form-control" name="track_url" placeholder="http://" value="">
                            </div>
                        </div>
                </div>
            </div>
			<div class="form-group">
                <label class="col-sm-3 control-label">
                    第三方点击监测链接
                    <i class="fa fa-question-circle tooltip-icon" data-toggle="tooltip" data-placement="top" title="" data-original-title="用于监测广告的展示效果。"></i>
                </label>
                <div class="col-sm-9 ng-scope" >
                        <div class="row has-feedback url-detect">
                            <div class="col-sm-6">
                                <input type="text" class="form-control" name="track_url" placeholder="http://" value="">
                            </div>
                        </div>
                </div>
            </div>

            <div class="page-header">
                <h3 id="download" class="text-center">选择受众</h3>
            </div>
            <div class="bs-callout bs-callout-info audience-callout col-sm-12 affix-top" ng-show="audience.is_smart==1" style="width: 1140px;">
                    <h4 class="text-center">系统将自动根据您对广告的分类,描述,广告创意中的信息,自动匹配受众.</h4>
                    <div class="selected-audience row clearfix">
                        <div class="audience-info col-sm-10">
                            <div ng-show="audienceText">您选择了:</div>
                            <span ng-bind="audienceText" class="ng-binding">智能托管: (是), 频道: (推荐)</span>
                        </div>
                        <div class="col-sm-2">
                            <button type="button" class="btn btn-primary pull-right">复制目标人群</button>
                        </div>
                    </div>
            </div>
            <div class="form-group audience-group">
                <label for="" class="col-sm-3 control-label">性别</label>
                <div class="col-sm-8">
                    <!-- ngRepeat: item in audienceItems.gender --><label class="radio-inline ng-scope" ng-repeat="item in audienceItems.gender">
                        <input type="radio" name="gender" ng-value="item.value" ng-model="model.gender" class="ng-pristine ng-untouched ng-valid" value=""><span ng-bind="item.label" class="ng-binding">不限</span>
                    </label><!-- end ngRepeat: item in audienceItems.gender --><label class="radio-inline ng-scope" ng-repeat="item in audienceItems.gender">
                        <input type="radio" name="gender" ng-value="item.value" ng-model="model.gender" class="ng-pristine ng-untouched ng-valid" value="1"><span ng-bind="item.label" class="ng-binding">男</span>
                    </label><!-- end ngRepeat: item in audienceItems.gender --><label class="radio-inline ng-scope" ng-repeat="item in audienceItems.gender">
                        <input type="radio" name="gender" ng-value="item.value" ng-model="model.gender" class="ng-pristine ng-untouched ng-valid" value="2"><span ng-bind="item.label" class="ng-binding">女</span>
                    </label><!-- end ngRepeat: item in audienceItems.gender -->
                </div>
            </div>
            <div class="form-group audience-group">
                <label for="" class="col-sm-3 control-label">地域</label>
                <div class="col-sm-8">
                    <!-- ngRepeat: item in audienceItems.district --><label class="radio-inline ng-scope" ng-repeat="item in audienceItems.district">
                        <input type="radio" name="district" ng-value="item.value" ng-model="model.district" class="ng-pristine ng-untouched ng-valid" value="all"><span ng-bind="item.label" class="ng-binding">不限</span>
                    </label><!-- end ngRepeat: item in audienceItems.district --><label class="radio-inline ng-scope" ng-repeat="item in audienceItems.district">
                        <input type="radio" name="district" ng-value="item.value" ng-model="model.district" class="ng-pristine ng-untouched ng-valid" value="select"><span ng-bind="item.label" class="ng-binding">自定义</span>
                    </label><!-- end ngRepeat: item in audienceItems.district -->
                </div>
                <div class="col-sm-8 col-sm-offset-3 ng-hide" ng-show="model.district == 'select'">
                    <label class="checkbox-inline">
                        <input type="checkbox" name="exclude_district" ng-model="model.exclude_district" ng-true-value="'1'" ng-false-value="''" value="1" ng-change="confirmExclude()" class="ng-pristine ng-untouched ng-valid"> 过滤下面城市
                    </label>
                    <div class="embed">
                        <input class="cityinput  form-control ng-isolate-scope" style="width:400px; " placeholder="(支持拼音/拼音首字母/汉字查询)" >
                        <input type="hidden" id="city_codes" name="city" ng-value="model.city" value="">
                        <input type="hidden" id="province_codes" name="province" ng-value="model.province" value="">
                    </div>
                    <div id="selected-city-list" class="select-list">
                        <ul></ul>
                    </div>
                </div>
            </div>
            <div class="form-group audience-group">
                <label for="" class="col-sm-3 control-label">平台</label>
                <div class="col-sm-8">
                    <label class="checkbox-inline">
                        <input type="checkbox" name="platform" value="" checked="" checkall="model.platform" class="ng-isolate-scope"> 不限
                    </label>
                    <!-- ngRepeat: item in audienceItems.platform --><label class="checkbox-inline ng-scope" ng-repeat="item in audienceItems.platform">
                        <input type="checkbox" name="platform" checklist-change="platformChanged()" checklist-value="item.value" ng-value="item.value" ng-model="checked" class="ng-scope ng-pristine ng-untouched ng-valid" value="2">
                        <span ng-bind="item.label" class="ng-binding">iPhone</span>
                    </label><!-- end ngRepeat: item in audienceItems.platform --><label class="checkbox-inline ng-scope" ng-repeat="item in audienceItems.platform">
                        <input type="checkbox" name="platform" checklist-change="platformChanged()" checklist-value="item.value" ng-value="item.value" ng-model="checked" class="ng-scope ng-pristine ng-untouched ng-valid" value="1">
                        <span ng-bind="item.label" class="ng-binding">Android</span>
                    </label><!-- end ngRepeat: item in audienceItems.platform --><label class="checkbox-inline ng-scope" ng-repeat="item in audienceItems.platform">
                        <input type="checkbox" name="platform" checklist-change="platformChanged()" checklist-value="item.value" ng-value="item.value" ng-model="checked" class="ng-scope ng-pristine ng-untouched ng-valid" value="8">
                        <span ng-bind="item.label" class="ng-binding">手机网站</span>
                    </label><!-- end ngRepeat: item in audienceItems.platform -->
                </div>
            </div>
			 <div class="form-group">
                <label class="col-sm-3 control-label">手机品牌定向</label>
                <div class="col-sm-8">
                    <label class="radio-inline">
                        <input type="radio" name="image_mode" value="2" checked="checked"> 不限
                    </label>
                    <label class="radio-inline">
                        <input type="radio" name="image_mode" value="3"> 按品牌
                    </label>
 
                </div>
            </div>
			<div class="form-group">
                <label class="col-sm-3 control-label">网络定向</label>
                <div class="col-sm-8">
                    <label class="radio-inline">
                        <input type="radio" name="image_mode" value="2" checked="checked"> 不限
                    </label>
                    <label class="radio-inline">
                        <input type="radio" name="image_mode" value="3"> WIFI
                    </label>
 
                </div>
            </div>
            <div class="page-header" id="bidding-header">
                <h3 class="text-center">广告计划和出价</h3>
            </div>
            <div class="form-group" id="campaign_input_group">
                <label for="" class="col-sm-3 control-label">新广告组名称</label>
                <div class="col-sm-8">
                    <input placeholder="请输入新广告组名称" type="text" class="col-sm-4 form-control" name="campaign_name" value="" id="campaign_name_input" style="width: 300px; margin-right: 4px; float:left">
                    <input type="hidden" name="campaign_id" id="campaign_id_input" value="">
                    <a class="btn btn-primary" id="toggle_campaign_name_selector" style="width:120px">使用现有广告组</a>
                </div>
            </div>
            <div class="form-group">
                <label for="" class="col-sm-3 control-label">出价方式</label>
                <div class="col-sm-8" style="position:relative">
                    <label class="radio-inline" id="PricingTypeCPM">
                        <input type="radio" name="pricing" value="1"> 按千次展示(CPM)
                        <i class="fa fa-question-circle tooltip-icon" data-toggle="tooltip" data-placement="top" title="" data-original-title="CPM：按每千次展现付费"></i>
                    </label>
                    <label class="radio-inline" id="PricingTypeCPC">
                        <input type="radio" name="pricing" value="2" checked=""> 按点击(CPC)
                        <i class="fa fa-question-circle tooltip-icon" data-toggle="tooltip" data-placement="top" title="" data-original-title="CPC ：按每次点击付费"></i>
                    </label>
                </div>
            </div>
			<div class="form-group" for-radio="pricing" data-value="1,2" style="display: block;">
    

<label for="" class="col-sm-3 control-label">投放时间</label>
<div class="col-sm-8" id="delivery-time">
    <div class="radio">
        <label>
            <input type="radio" name="schedule_type" value="1">从现在开始一直投放
            <span class="pricing-time" style="padding-left: 20px; display: none;" for-radio="schedule_type" data-value="1">
            
                2015-09-19 22:54 至 2016-09-19 22:54
                <input type="hidden" name="from_time" value="2015-09-19 22:54">
            
            </span>
        </label>
    </div>

    <div class="radio">
        <label>
            <input type="radio" name="schedule_type" value="2" checked="">选择起始时间
        </label>
        <div class="embed future_datetime" for-radio="schedule_type" data-value="2" style="display: block;">
            开始  :  <input type="text" class="form-control form-control-inline" name="start_time" value="2015-09-20 00:00" data-ga="ga">
            结束  :  <input type="text" class="form-control form-control-inline" name="end_time" value="2015-09-21 00:00" data-ga="ga">
        </div>
    </div>

    <div class="radio">
        <label>
            <input type="radio" name="schedule_type" value="4">选择时间段<span class="text-danger"></span>
        </label>

        <div class="embed future_date" for-radio="schedule_type" data-value="4" style="display: none;">
            开始  :  <input type="text" class="form-control form-control-inline" name="start_date" value="2015-09-20">
            结束  :  <input type="text" class="form-control form-control-inline" name="end_date" value="2015-10-20">
            <input name="week_time" type="hidden" value="">
            <div id="calendarContainer" style="margin-top:10px;">
                <div id="calendar">
                    <div class="schedule"></div>
                <table id="calendar-table"><thead id="calendar-head"><tr><th rowspan="2">星期 / 时间</th><th colspan="24">上午</th><th colspan="24">下午</th></tr><tr><td colspan="2">0</td><td colspan="2">1</td><td colspan="2">2</td><td colspan="2">3</td><td colspan="2">4</td><td colspan="2">5</td><td colspan="2">6</td><td colspan="2">7</td><td colspan="2">8</td><td colspan="2">9</td><td colspan="2">10</td><td colspan="2">11</td><td colspan="2">12</td><td colspan="2">13</td><td colspan="2">14</td><td colspan="2">15</td><td colspan="2">16</td><td colspan="2">17</td><td colspan="2">18</td><td colspan="2">19</td><td colspan="2">20</td><td colspan="2">21</td><td colspan="2">22</td><td colspan="2">23</td></tr></thead><tbody id="calendar-body"><tr><td>星期一</td><td class="calendar-atom-time" data-week="0" data-time="0"></td><td class="calendar-atom-time" data-week="0" data-time="1"></td><td class="calendar-atom-time" data-week="0" data-time="2"></td><td class="calendar-atom-time" data-week="0" data-time="3"></td><td class="calendar-atom-time" data-week="0" data-time="4"></td><td class="calendar-atom-time" data-week="0" data-time="5"></td><td class="calendar-atom-time" data-week="0" data-time="6"></td><td class="calendar-atom-time" data-week="0" data-time="7"></td><td class="calendar-atom-time" data-week="0" data-time="8"></td><td class="calendar-atom-time" data-week="0" data-time="9"></td><td class="calendar-atom-time" data-week="0" data-time="10"></td><td class="calendar-atom-time" data-week="0" data-time="11"></td><td class="calendar-atom-time" data-week="0" data-time="12"></td><td class="calendar-atom-time" data-week="0" data-time="13"></td><td class="calendar-atom-time" data-week="0" data-time="14"></td><td class="calendar-atom-time" data-week="0" data-time="15"></td><td class="calendar-atom-time" data-week="0" data-time="16"></td><td class="calendar-atom-time" data-week="0" data-time="17"></td><td class="calendar-atom-time" data-week="0" data-time="18"></td><td class="calendar-atom-time" data-week="0" data-time="19"></td><td class="calendar-atom-time" data-week="0" data-time="20"></td><td class="calendar-atom-time" data-week="0" data-time="21"></td><td class="calendar-atom-time" data-week="0" data-time="22"></td><td class="calendar-atom-time" data-week="0" data-time="23"></td><td class="calendar-atom-time" data-week="0" data-time="24"></td><td class="calendar-atom-time" data-week="0" data-time="25"></td><td class="calendar-atom-time" data-week="0" data-time="26"></td><td class="calendar-atom-time" data-week="0" data-time="27"></td><td class="calendar-atom-time" data-week="0" data-time="28"></td><td class="calendar-atom-time" data-week="0" data-time="29"></td><td class="calendar-atom-time" data-week="0" data-time="30"></td><td class="calendar-atom-time" data-week="0" data-time="31"></td><td class="calendar-atom-time" data-week="0" data-time="32"></td><td class="calendar-atom-time" data-week="0" data-time="33"></td><td class="calendar-atom-time" data-week="0" data-time="34"></td><td class="calendar-atom-time" data-week="0" data-time="35"></td><td class="calendar-atom-time" data-week="0" data-time="36"></td><td class="calendar-atom-time" data-week="0" data-time="37"></td><td class="calendar-atom-time" data-week="0" data-time="38"></td><td class="calendar-atom-time" data-week="0" data-time="39"></td><td class="calendar-atom-time" data-week="0" data-time="40"></td><td class="calendar-atom-time" data-week="0" data-time="41"></td><td class="calendar-atom-time" data-week="0" data-time="42"></td><td class="calendar-atom-time" data-week="0" data-time="43"></td><td class="calendar-atom-time" data-week="0" data-time="44"></td><td class="calendar-atom-time" data-week="0" data-time="45"></td><td class="calendar-atom-time" data-week="0" data-time="46"></td><td class="calendar-atom-time" data-week="0" data-time="47"></td></tr><tr><td>星期二</td><td class="calendar-atom-time" data-week="1" data-time="0"></td><td class="calendar-atom-time" data-week="1" data-time="1"></td><td class="calendar-atom-time" data-week="1" data-time="2"></td><td class="calendar-atom-time" data-week="1" data-time="3"></td><td class="calendar-atom-time" data-week="1" data-time="4"></td><td class="calendar-atom-time" data-week="1" data-time="5"></td><td class="calendar-atom-time" data-week="1" data-time="6"></td><td class="calendar-atom-time" data-week="1" data-time="7"></td><td class="calendar-atom-time" data-week="1" data-time="8"></td><td class="calendar-atom-time" data-week="1" data-time="9"></td><td class="calendar-atom-time" data-week="1" data-time="10"></td><td class="calendar-atom-time" data-week="1" data-time="11"></td><td class="calendar-atom-time" data-week="1" data-time="12"></td><td class="calendar-atom-time" data-week="1" data-time="13"></td><td class="calendar-atom-time" data-week="1" data-time="14"></td><td class="calendar-atom-time" data-week="1" data-time="15"></td><td class="calendar-atom-time" data-week="1" data-time="16"></td><td class="calendar-atom-time" data-week="1" data-time="17"></td><td class="calendar-atom-time" data-week="1" data-time="18"></td><td class="calendar-atom-time" data-week="1" data-time="19"></td><td class="calendar-atom-time" data-week="1" data-time="20"></td><td class="calendar-atom-time" data-week="1" data-time="21"></td><td class="calendar-atom-time" data-week="1" data-time="22"></td><td class="calendar-atom-time" data-week="1" data-time="23"></td><td class="calendar-atom-time" data-week="1" data-time="24"></td><td class="calendar-atom-time" data-week="1" data-time="25"></td><td class="calendar-atom-time" data-week="1" data-time="26"></td><td class="calendar-atom-time" data-week="1" data-time="27"></td><td class="calendar-atom-time" data-week="1" data-time="28"></td><td class="calendar-atom-time" data-week="1" data-time="29"></td><td class="calendar-atom-time" data-week="1" data-time="30"></td><td class="calendar-atom-time" data-week="1" data-time="31"></td><td class="calendar-atom-time" data-week="1" data-time="32"></td><td class="calendar-atom-time" data-week="1" data-time="33"></td><td class="calendar-atom-time" data-week="1" data-time="34"></td><td class="calendar-atom-time" data-week="1" data-time="35"></td><td class="calendar-atom-time" data-week="1" data-time="36"></td><td class="calendar-atom-time" data-week="1" data-time="37"></td><td class="calendar-atom-time" data-week="1" data-time="38"></td><td class="calendar-atom-time" data-week="1" data-time="39"></td><td class="calendar-atom-time" data-week="1" data-time="40"></td><td class="calendar-atom-time" data-week="1" data-time="41"></td><td class="calendar-atom-time" data-week="1" data-time="42"></td><td class="calendar-atom-time" data-week="1" data-time="43"></td><td class="calendar-atom-time" data-week="1" data-time="44"></td><td class="calendar-atom-time" data-week="1" data-time="45"></td><td class="calendar-atom-time" data-week="1" data-time="46"></td><td class="calendar-atom-time" data-week="1" data-time="47"></td></tr><tr><td>星期三</td><td class="calendar-atom-time" data-week="2" data-time="0"></td><td class="calendar-atom-time" data-week="2" data-time="1"></td><td class="calendar-atom-time" data-week="2" data-time="2"></td><td class="calendar-atom-time" data-week="2" data-time="3"></td><td class="calendar-atom-time" data-week="2" data-time="4"></td><td class="calendar-atom-time" data-week="2" data-time="5"></td><td class="calendar-atom-time" data-week="2" data-time="6"></td><td class="calendar-atom-time" data-week="2" data-time="7"></td><td class="calendar-atom-time" data-week="2" data-time="8"></td><td class="calendar-atom-time" data-week="2" data-time="9"></td><td class="calendar-atom-time" data-week="2" data-time="10"></td><td class="calendar-atom-time" data-week="2" data-time="11"></td><td class="calendar-atom-time" data-week="2" data-time="12"></td><td class="calendar-atom-time" data-week="2" data-time="13"></td><td class="calendar-atom-time" data-week="2" data-time="14"></td><td class="calendar-atom-time" data-week="2" data-time="15"></td><td class="calendar-atom-time" data-week="2" data-time="16"></td><td class="calendar-atom-time" data-week="2" data-time="17"></td><td class="calendar-atom-time" data-week="2" data-time="18"></td><td class="calendar-atom-time" data-week="2" data-time="19"></td><td class="calendar-atom-time" data-week="2" data-time="20"></td><td class="calendar-atom-time" data-week="2" data-time="21"></td><td class="calendar-atom-time" data-week="2" data-time="22"></td><td class="calendar-atom-time" data-week="2" data-time="23"></td><td class="calendar-atom-time" data-week="2" data-time="24"></td><td class="calendar-atom-time" data-week="2" data-time="25"></td><td class="calendar-atom-time" data-week="2" data-time="26"></td><td class="calendar-atom-time" data-week="2" data-time="27"></td><td class="calendar-atom-time" data-week="2" data-time="28"></td><td class="calendar-atom-time" data-week="2" data-time="29"></td><td class="calendar-atom-time" data-week="2" data-time="30"></td><td class="calendar-atom-time" data-week="2" data-time="31"></td><td class="calendar-atom-time" data-week="2" data-time="32"></td><td class="calendar-atom-time" data-week="2" data-time="33"></td><td class="calendar-atom-time" data-week="2" data-time="34"></td><td class="calendar-atom-time" data-week="2" data-time="35"></td><td class="calendar-atom-time" data-week="2" data-time="36"></td><td class="calendar-atom-time" data-week="2" data-time="37"></td><td class="calendar-atom-time" data-week="2" data-time="38"></td><td class="calendar-atom-time" data-week="2" data-time="39"></td><td class="calendar-atom-time" data-week="2" data-time="40"></td><td class="calendar-atom-time" data-week="2" data-time="41"></td><td class="calendar-atom-time" data-week="2" data-time="42"></td><td class="calendar-atom-time" data-week="2" data-time="43"></td><td class="calendar-atom-time" data-week="2" data-time="44"></td><td class="calendar-atom-time" data-week="2" data-time="45"></td><td class="calendar-atom-time" data-week="2" data-time="46"></td><td class="calendar-atom-time" data-week="2" data-time="47"></td></tr><tr><td>星期四</td><td class="calendar-atom-time" data-week="3" data-time="0"></td><td class="calendar-atom-time" data-week="3" data-time="1"></td><td class="calendar-atom-time" data-week="3" data-time="2"></td><td class="calendar-atom-time" data-week="3" data-time="3"></td><td class="calendar-atom-time" data-week="3" data-time="4"></td><td class="calendar-atom-time" data-week="3" data-time="5"></td><td class="calendar-atom-time" data-week="3" data-time="6"></td><td class="calendar-atom-time" data-week="3" data-time="7"></td><td class="calendar-atom-time" data-week="3" data-time="8"></td><td class="calendar-atom-time" data-week="3" data-time="9"></td><td class="calendar-atom-time" data-week="3" data-time="10"></td><td class="calendar-atom-time" data-week="3" data-time="11"></td><td class="calendar-atom-time" data-week="3" data-time="12"></td><td class="calendar-atom-time" data-week="3" data-time="13"></td><td class="calendar-atom-time" data-week="3" data-time="14"></td><td class="calendar-atom-time" data-week="3" data-time="15"></td><td class="calendar-atom-time" data-week="3" data-time="16"></td><td class="calendar-atom-time" data-week="3" data-time="17"></td><td class="calendar-atom-time" data-week="3" data-time="18"></td><td class="calendar-atom-time" data-week="3" data-time="19"></td><td class="calendar-atom-time" data-week="3" data-time="20"></td><td class="calendar-atom-time" data-week="3" data-time="21"></td><td class="calendar-atom-time" data-week="3" data-time="22"></td><td class="calendar-atom-time" data-week="3" data-time="23"></td><td class="calendar-atom-time" data-week="3" data-time="24"></td><td class="calendar-atom-time" data-week="3" data-time="25"></td><td class="calendar-atom-time" data-week="3" data-time="26"></td><td class="calendar-atom-time" data-week="3" data-time="27"></td><td class="calendar-atom-time" data-week="3" data-time="28"></td><td class="calendar-atom-time" data-week="3" data-time="29"></td><td class="calendar-atom-time" data-week="3" data-time="30"></td><td class="calendar-atom-time" data-week="3" data-time="31"></td><td class="calendar-atom-time" data-week="3" data-time="32"></td><td class="calendar-atom-time" data-week="3" data-time="33"></td><td class="calendar-atom-time" data-week="3" data-time="34"></td><td class="calendar-atom-time" data-week="3" data-time="35"></td><td class="calendar-atom-time" data-week="3" data-time="36"></td><td class="calendar-atom-time" data-week="3" data-time="37"></td><td class="calendar-atom-time" data-week="3" data-time="38"></td><td class="calendar-atom-time" data-week="3" data-time="39"></td><td class="calendar-atom-time" data-week="3" data-time="40"></td><td class="calendar-atom-time" data-week="3" data-time="41"></td><td class="calendar-atom-time" data-week="3" data-time="42"></td><td class="calendar-atom-time" data-week="3" data-time="43"></td><td class="calendar-atom-time" data-week="3" data-time="44"></td><td class="calendar-atom-time" data-week="3" data-time="45"></td><td class="calendar-atom-time" data-week="3" data-time="46"></td><td class="calendar-atom-time" data-week="3" data-time="47"></td></tr><tr><td>星期五</td><td class="calendar-atom-time" data-week="4" data-time="0"></td><td class="calendar-atom-time" data-week="4" data-time="1"></td><td class="calendar-atom-time" data-week="4" data-time="2"></td><td class="calendar-atom-time" data-week="4" data-time="3"></td><td class="calendar-atom-time" data-week="4" data-time="4"></td><td class="calendar-atom-time" data-week="4" data-time="5"></td><td class="calendar-atom-time" data-week="4" data-time="6"></td><td class="calendar-atom-time" data-week="4" data-time="7"></td><td class="calendar-atom-time" data-week="4" data-time="8"></td><td class="calendar-atom-time" data-week="4" data-time="9"></td><td class="calendar-atom-time" data-week="4" data-time="10"></td><td class="calendar-atom-time" data-week="4" data-time="11"></td><td class="calendar-atom-time" data-week="4" data-time="12"></td><td class="calendar-atom-time" data-week="4" data-time="13"></td><td class="calendar-atom-time" data-week="4" data-time="14"></td><td class="calendar-atom-time" data-week="4" data-time="15"></td><td class="calendar-atom-time" data-week="4" data-time="16"></td><td class="calendar-atom-time" data-week="4" data-time="17"></td><td class="calendar-atom-time" data-week="4" data-time="18"></td><td class="calendar-atom-time" data-week="4" data-time="19"></td><td class="calendar-atom-time" data-week="4" data-time="20"></td><td class="calendar-atom-time" data-week="4" data-time="21"></td><td class="calendar-atom-time" data-week="4" data-time="22"></td><td class="calendar-atom-time" data-week="4" data-time="23"></td><td class="calendar-atom-time" data-week="4" data-time="24"></td><td class="calendar-atom-time" data-week="4" data-time="25"></td><td class="calendar-atom-time" data-week="4" data-time="26"></td><td class="calendar-atom-time" data-week="4" data-time="27"></td><td class="calendar-atom-time" data-week="4" data-time="28"></td><td class="calendar-atom-time" data-week="4" data-time="29"></td><td class="calendar-atom-time" data-week="4" data-time="30"></td><td class="calendar-atom-time" data-week="4" data-time="31"></td><td class="calendar-atom-time" data-week="4" data-time="32"></td><td class="calendar-atom-time" data-week="4" data-time="33"></td><td class="calendar-atom-time" data-week="4" data-time="34"></td><td class="calendar-atom-time" data-week="4" data-time="35"></td><td class="calendar-atom-time" data-week="4" data-time="36"></td><td class="calendar-atom-time" data-week="4" data-time="37"></td><td class="calendar-atom-time" data-week="4" data-time="38"></td><td class="calendar-atom-time" data-week="4" data-time="39"></td><td class="calendar-atom-time" data-week="4" data-time="40"></td><td class="calendar-atom-time" data-week="4" data-time="41"></td><td class="calendar-atom-time" data-week="4" data-time="42"></td><td class="calendar-atom-time" data-week="4" data-time="43"></td><td class="calendar-atom-time" data-week="4" data-time="44"></td><td class="calendar-atom-time" data-week="4" data-time="45"></td><td class="calendar-atom-time" data-week="4" data-time="46"></td><td class="calendar-atom-time" data-week="4" data-time="47"></td></tr><tr><td>星期六</td><td class="calendar-atom-time" data-week="5" data-time="0"></td><td class="calendar-atom-time" data-week="5" data-time="1"></td><td class="calendar-atom-time" data-week="5" data-time="2"></td><td class="calendar-atom-time" data-week="5" data-time="3"></td><td class="calendar-atom-time" data-week="5" data-time="4"></td><td class="calendar-atom-time" data-week="5" data-time="5"></td><td class="calendar-atom-time" data-week="5" data-time="6"></td><td class="calendar-atom-time" data-week="5" data-time="7"></td><td class="calendar-atom-time" data-week="5" data-time="8"></td><td class="calendar-atom-time" data-week="5" data-time="9"></td><td class="calendar-atom-time" data-week="5" data-time="10"></td><td class="calendar-atom-time" data-week="5" data-time="11"></td><td class="calendar-atom-time" data-week="5" data-time="12"></td><td class="calendar-atom-time" data-week="5" data-time="13"></td><td class="calendar-atom-time" data-week="5" data-time="14"></td><td class="calendar-atom-time" data-week="5" data-time="15"></td><td class="calendar-atom-time" data-week="5" data-time="16"></td><td class="calendar-atom-time" data-week="5" data-time="17"></td><td class="calendar-atom-time" data-week="5" data-time="18"></td><td class="calendar-atom-time" data-week="5" data-time="19"></td><td class="calendar-atom-time" data-week="5" data-time="20"></td><td class="calendar-atom-time" data-week="5" data-time="21"></td><td class="calendar-atom-time" data-week="5" data-time="22"></td><td class="calendar-atom-time" data-week="5" data-time="23"></td><td class="calendar-atom-time" data-week="5" data-time="24"></td><td class="calendar-atom-time" data-week="5" data-time="25"></td><td class="calendar-atom-time" data-week="5" data-time="26"></td><td class="calendar-atom-time" data-week="5" data-time="27"></td><td class="calendar-atom-time" data-week="5" data-time="28"></td><td class="calendar-atom-time" data-week="5" data-time="29"></td><td class="calendar-atom-time" data-week="5" data-time="30"></td><td class="calendar-atom-time" data-week="5" data-time="31"></td><td class="calendar-atom-time" data-week="5" data-time="32"></td><td class="calendar-atom-time" data-week="5" data-time="33"></td><td class="calendar-atom-time" data-week="5" data-time="34"></td><td class="calendar-atom-time" data-week="5" data-time="35"></td><td class="calendar-atom-time" data-week="5" data-time="36"></td><td class="calendar-atom-time" data-week="5" data-time="37"></td><td class="calendar-atom-time" data-week="5" data-time="38"></td><td class="calendar-atom-time" data-week="5" data-time="39"></td><td class="calendar-atom-time" data-week="5" data-time="40"></td><td class="calendar-atom-time" data-week="5" data-time="41"></td><td class="calendar-atom-time" data-week="5" data-time="42"></td><td class="calendar-atom-time" data-week="5" data-time="43"></td><td class="calendar-atom-time" data-week="5" data-time="44"></td><td class="calendar-atom-time" data-week="5" data-time="45"></td><td class="calendar-atom-time" data-week="5" data-time="46"></td><td class="calendar-atom-time" data-week="5" data-time="47"></td></tr><tr><td>星期日</td><td class="calendar-atom-time" data-week="6" data-time="0"></td><td class="calendar-atom-time" data-week="6" data-time="1"></td><td class="calendar-atom-time" data-week="6" data-time="2"></td><td class="calendar-atom-time" data-week="6" data-time="3"></td><td class="calendar-atom-time" data-week="6" data-time="4"></td><td class="calendar-atom-time" data-week="6" data-time="5"></td><td class="calendar-atom-time" data-week="6" data-time="6"></td><td class="calendar-atom-time" data-week="6" data-time="7"></td><td class="calendar-atom-time" data-week="6" data-time="8"></td><td class="calendar-atom-time" data-week="6" data-time="9"></td><td class="calendar-atom-time" data-week="6" data-time="10"></td><td class="calendar-atom-time" data-week="6" data-time="11"></td><td class="calendar-atom-time" data-week="6" data-time="12"></td><td class="calendar-atom-time" data-week="6" data-time="13"></td><td class="calendar-atom-time" data-week="6" data-time="14"></td><td class="calendar-atom-time" data-week="6" data-time="15"></td><td class="calendar-atom-time" data-week="6" data-time="16"></td><td class="calendar-atom-time" data-week="6" data-time="17"></td><td class="calendar-atom-time" data-week="6" data-time="18"></td><td class="calendar-atom-time" data-week="6" data-time="19"></td><td class="calendar-atom-time" data-week="6" data-time="20"></td><td class="calendar-atom-time" data-week="6" data-time="21"></td><td class="calendar-atom-time" data-week="6" data-time="22"></td><td class="calendar-atom-time" data-week="6" data-time="23"></td><td class="calendar-atom-time" data-week="6" data-time="24"></td><td class="calendar-atom-time" data-week="6" data-time="25"></td><td class="calendar-atom-time" data-week="6" data-time="26"></td><td class="calendar-atom-time" data-week="6" data-time="27"></td><td class="calendar-atom-time" data-week="6" data-time="28"></td><td class="calendar-atom-time" data-week="6" data-time="29"></td><td class="calendar-atom-time" data-week="6" data-time="30"></td><td class="calendar-atom-time" data-week="6" data-time="31"></td><td class="calendar-atom-time" data-week="6" data-time="32"></td><td class="calendar-atom-time" data-week="6" data-time="33"></td><td class="calendar-atom-time" data-week="6" data-time="34"></td><td class="calendar-atom-time" data-week="6" data-time="35"></td><td class="calendar-atom-time" data-week="6" data-time="36"></td><td class="calendar-atom-time" data-week="6" data-time="37"></td><td class="calendar-atom-time" data-week="6" data-time="38"></td><td class="calendar-atom-time" data-week="6" data-time="39"></td><td class="calendar-atom-time" data-week="6" data-time="40"></td><td class="calendar-atom-time" data-week="6" data-time="41"></td><td class="calendar-atom-time" data-week="6" data-time="42"></td><td class="calendar-atom-time" data-week="6" data-time="43"></td><td class="calendar-atom-time" data-week="6" data-time="44"></td><td class="calendar-atom-time" data-week="6" data-time="45"></td><td class="calendar-atom-time" data-week="6" data-time="46"></td><td class="calendar-atom-time" data-week="6" data-time="47"></td></tr></tbody></table></div>
                <div id="readableWeekTime" style="display: none;">
                    <a class="btn btn-danger btn-xs" href="#" id="reset">撤销所有选择</a>
                    <ul></ul>
                </div>
            </div>
        </div>
    </div>

    

    
</div>

    </div>
			
            <div class="form-group" for-radio="pricing" data-value="1,2" id="FlowControlMode" input-name="flow_control_mode" input-value="0" style="display: block;">
                <label for="" class="col-sm-3 control-label">投放策略</label>
                <div class="col-sm-8">
                    <label class="radio-inline">
                        <input type="radio" name="flow_control_mode" value="0"> 尽快投放
                        <i class="fa fa-question-circle tooltip-icon" data-toggle="tooltip" data-placement="top" title="" data-original-title="尽可能快的获取展现"></i>
                    </label>
                    <label class="radio-inline">
                        <input type="radio" name="flow_control_mode" value="1"> 平均投放
                        <i class="fa fa-question-circle tooltip-icon" data-toggle="tooltip" data-placement="top" title="" data-original-title="根据所选时间段的流量，匀速投放"></i>
                    </label>
                    <label class="radio-inline">
                        <input type="radio" name="flow_control_mode" value="2"> 按小时投放
                        <i class="fa fa-question-circle tooltip-icon" data-toggle="tooltip" data-placement="top" title="" data-original-title="根据预算和流量，平均到每个小时进行投放"></i>
                    </label>
                </div>
            </div>
            <div class="form-group" for-radio="pricing" data-value="1,2" id="BudgetMode" input-name="budget_mode" input-value="0" style="display: block;">
                <label for="" class="col-sm-3 control-label">预算方式</label>
                <div class="col-sm-8">
                    <label class="radio-inline">
                        <input type="radio" name="budget_mode" class="budget-radio" value="0"> 日预算
                    </label>
                    <label class="radio-inline">
                        <input type="radio" name="budget_mode" class="budget-radio" value="1"> 总预算
                    </label>
                </div>
            </div>
            <div class="form-group" for-radio="pricing" data-value="1,2" id="PricingBudget" style="display: block;">
                <label for="" class="col-sm-3 control-label">预算</label>
                <div class="col-sm-5">
                    <input class="form-control form-control-inline" name="budget" type="text" onclick="this.select()" value="" placeholder="¥" data-ga="budget">
                    <span>(最低预算100元)</span>
                </div>
            </div>
            <div class="form-group" for-radio="pricing" data-value="1,2" id="PricingBid" style="display: block;">
                <label for="" class="col-sm-3 control-label">出价</label>
                <div class="col-sm-8">
                    <input class="form-control form-control-inline" name="bid" type="text" onclick="this.select()" placeholder="¥" value="">
                    
                    <span for-radio="pricing" data-value="1" style="display: none;">(最低出价
                        <span ng-show="baseInfo.image_mode==2">10</span>
                        <span ng-show="baseInfo.image_mode==3 || baseInfo.image_mode==5" class="ng-hide">15</span>
                        <span ng-show="baseInfo.image_mode==4" class="ng-hide">13</span>
                        元/千次展示)
                    </span>
                    <span for-radio="pricing" data-value="2" style="display: inline;">
                        <span id="min_bid" style="display: none;">(最低出价
                            <span ng-show="baseInfo.image_mode==2">0.3</span>
                            <span ng-show="baseInfo.image_mode==3" class="ng-hide">0.45</span>
                            <span ng-show="baseInfo.image_mode==4" class="ng-hide">0.39</span>
                            元/点击)
                        </span>
                        <span id="estimation_bid" style="display: inline;">建议出价大于
                            <span ng-show="baseInfo.image_mode==2" id="cpc_small">0.75</span>
                            <span ng-show="baseInfo.image_mode==3" id="cpc_large" class="ng-hide">1.36</span>
                            <span ng-show="baseInfo.image_mode==4" id="cpc_group" class="ng-hide">0.98</span>
                            元.
                            <i class="fa fa-question-circle tooltip-icon" data-toggle="tooltip" data-placement="top" title="" data-original-title="建议出价金额是根据定向受众和竞争广告的出价而确定的"></i>
                        </span>
                    </span> 
                </div>
            </div>
            <div class="form-group" id="create-submit-group">
                <div class="col-sm-offset-3 col-sm-9">
                    <button type="submit" class="btn btn-primary" id="creat_submit">提交</button>
                </div>
            </div>
        </form>
    </div>

    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script src="//cdn.bootcss.com/jquery/1.11.3/jquery.min.js"></script>
    <!-- Include all compiled plugins (below), or include individual files as needed -->
    <script src="js/bootstrap.min.js"></script>
  </body>
</html>