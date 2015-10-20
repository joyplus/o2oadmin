<!DOCTYPE html>
<html lang="zh-CN">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- 上述3个meta标签*必须*放在最前面，任何其他内容都*必须*跟随其后！ -->
    <title>创建活动</title>

    <!-- Bootstrap -->
    <link href="http://cdn.bootcss.com/bootstrap/3.3.5/css/bootstrap.min.css" rel="stylesheet">
    <link href="/static/css/campaign.css" rel="stylesheet">
    <link href="/static/css/phonebrand.css" rel="stylesheet">
    <link href="/static/css/bootstrap-datetimepicker.min.css" rel="stylesheet">
    <link href="/static/css/bootstrap-treeview.css" rel="stylesheet">
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
            <h3 id="download" class="text-center">基本信息</h3>
        </div>
        <form class="form-horizontal" role="form" method="POST" id="create_form" action="#" autocomplete="off">
            <div class="form-group" input-name="ad_category" input-value="" ng-controller="CategoryCtrl">
                <label class="col-sm-3 control-label" label-for="ad_category">广告分类</label>
                <div class="category-selects append-bottom-10 category-wrap">
                    <select class="form-control" id="category_one_id" name="">
                        <option value="">请选择一级分类</option>
                        {{range .categoryones}}
                        <option value="{{.Id}}">{{.Name}}</option>
                        {{end}}
                    </select>
                    <select class="form-control" id="category_two_id" style="display:none;" name="">
                        <option value="">请选择二级分类</option>
                    </select>
                    <select class="form-control" id="category_three_id" style="display:none;" name="">
                        <option value="">请选择三级分类</option>
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
                    {{range index .lovmaps "ad_type"}} {{if eq .DispOrder 0}}
                    <label class="radio-inline">
                        <input type="radio" name="ad_type" value="{{.LovKey}}" checked="checked"> {{.LovValue}}
                    </label>
                    {{else}}
                    <label class="radio-inline">
                        <input type="radio" name="ad_type" value="{{.LovKey}}"> {{.LovValue}}
                    </label>
                    {{end}} {{end}}
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
                <div class="col-sm-9 ng-scope">
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
                <div class="col-sm-9 ng-scope">
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
            <div class="form-group audience-group">
                <label for="" class="col-sm-3 control-label">匹配精度</label>
                <div class="col-sm-8">
                    {{range index .lovmaps "accurate_type"}} {{if eq .DispOrder 0}}
                    <label class="radio-inline ng-scope" ng-repeat="item in audienceItems.gender">
                        <input type="radio" name="Campaign.AccurateType" ng-value="item.value" ng-model="model.gender" class="ng-pristine ng-untouched ng-valid" value="{{.LovKey}}" checked="checked"><span ng-bind="item.label" class="ng-binding">{{.LovValue}}</span>
                    </label>
                    {{else}}
                    <label class="radio-inline ng-scope" ng-repeat="item in audienceItems.gender">
                        <input type="radio" name="Campaign.AccurateType" ng-value="item.value" ng-model="model.gender" class="ng-pristine ng-untouched ng-valid" value="{{.LovKey}}"><span ng-bind="item.label" class="ng-binding">{{.LovValue}}</span>
                    </label>
                    {{end}} {{end}}
                </div>
            </div>

            <!--
            <div class="form-group audience-group">
                <label for="" class="col-sm-3 control-label">性别</label>
                <div class="col-sm-8">
					{{range index .lovmaps "gender"}}
						{{if eq .DispOrder 0}}
							<label class="radio-inline ng-scope" ng-repeat="item in audienceItems.gender">
		                        <input type="radio" name="gender" checked="checked" ng-value="item.value" ng-model="model.gender" class="ng-pristine ng-untouched ng-valid" value="{{.LovKey}}"><span ng-bind="item.label" class="ng-binding">{{.LovValue}}</span>
		                    </label>
						{{else}}
							<label class="radio-inline ng-scope" ng-repeat="item in audienceItems.gender">
		                        <input type="radio" name="gender" ng-value="item.value" ng-model="model.gender" class="ng-pristine ng-untouched ng-valid" value="{{.LovKey}}"><span ng-bind="item.label" class="ng-binding">{{.LovValue}}</span>
		                    </label>
						{{end}}
					{{end}}
                </div>
            </div>
			-->

            <div class="form-group audience-group">
                <label for="" class="col-sm-3 control-label">地域</label>
                <div class="col-sm-8">
                    <label class="radio-inline ng-scope" ng-repeat="item in audienceItems.district" id="cityunlimited">
                        <input type="radio" checked="checked" name="district" ng-value="item.value" ng-model="model.district" class="ng-pristine ng-untouched ng-valid" value="all"><span ng-bind="item.label" class="ng-binding">不限</span>
                    </label>
                    <label class="radio-inline ng-scope" ng-repeat="item in audienceItems.district" id="citydefined">
                        <input type="radio" name="district" ng-value="item.value" ng-model="model.district" class="ng-pristine ng-untouched ng-valid" value="select"><span ng-bind="item.label" class="ng-binding">自定义</span>
                    </label>
                </div>
                <div class="col-sm-8 col-sm-offset-3 ng-hide" ng-show="model.district == 'select'">
                    <div class="embed" id="cityselectiondiv">
                        <input class="cityinput  form-control ng-isolate-scope" style="width:400px; " placeholder="选择城市" id="cityinput" readonly="readonly">
                        <input type="hidden" id="city_codes" name="city" ng-value="model.city" value="">
                        <input type="hidden" id="province_codes" name="province" ng-value="model.province" value="">
                    </div>
                    <div id="selected-city-list" class="select-list">
                        <ul id="selected-city-list-ul">

                        </ul>
                    </div>
                </div>
            </div>

            <div class="form-group audience-group">
                <label for="" class="col-sm-3 control-label">平台</label>
                <div class="col-sm-8" id="osdiv">
                    <label class="checkbox-inline">
                        <input type="checkbox" id="allplateform" name="platform" value="" checked="checked" onclick="checkallplateform()" class="ng-isolate-scope"> 不限
                    </label>
                    <!-- ngRepeat: item in audienceItems.platform -->
                    <label class="checkbox-inline ng-scope" ng-repeat="item in audienceItems.platform">
                        <input type="checkbox" name="platform" onclick="uncheckallplateform()" checklist-value="item.value" ng-value="item.value"  class="ng-scope ng-pristine ng-untouched ng-valid" value="2">
                        <span ng-bind="item.label" class="ng-binding">iPhone</span>
                    </label>
                    <!-- end ngRepeat: item in audienceItems.platform -->
                    <label class="checkbox-inline ng-scope" ng-repeat="item in audienceItems.platform">
                        <input type="checkbox" name="platform" onclick="uncheckallplateform()" checklist-value="item.value" ng-value="item.value"  class="ng-scope ng-pristine ng-untouched ng-valid" value="1">
                        <span ng-bind="item.label" class="ng-binding">Android</span>
                    </label>
                    <!-- end ngRepeat: item in audienceItems.platform -->
                    <label class="checkbox-inline ng-scope" ng-repeat="item in audienceItems.platform">
                        <input type="checkbox" name="platform" onclick="uncheckallplateform()" checklist-value="item.value" ng-value="item.value"  class="ng-scope ng-pristine ng-untouched ng-valid" value="8">
                        <span ng-bind="item.label" class="ng-binding">手机网站</span>
                    </label>
                    <!-- end ngRepeat: item in audienceItems.platform -->
                </div>
            </div>

            <div class="form-group audience-group ng-scope" ng-controller="PhoneBrandController" ng-show="showBrandAudience">
                <label for="" class="col-sm-3 control-label">手机品牌定向</label>
                <div class="col-sm-8">
                    <label class="radio-inline">
                        <input type="radio" name="phone_brand" checked="checked" value="0" ng-model="phone_brand" id="phonebrandunlimited" class="ng-pristine ng-untouched ng-valid"> 不限
                    </label>
                    <label class="radio-inline">
                        <input type="radio" name="phone_brand" value="1" ng-model="phone_brand" id="phonebrandid" class="ng-valid ng-dirty ng-valid-parse ng-touched"> 按品牌
                    </label>
                    <div class="prepend-top-15" ng-show="phone_brand == 1" id="phonebrandselectiondiv">
                        <div class="column-wrap clearfix ng-isolate-scope" categories="categories" preset="preset" title="品牌选择" selected="selected">
                            <div class="column-side left-side">
                                <div class="column-header ng-binding">品牌选择</div>
                                <div class="column-body">
                                    <div class="category-list">
                                        <ul class="list-items" id="sourcecategorylist">
                                            <li ng-repeat="item in categories" class="ng-scope">
                                                <span ng-bind="item.name" class="ng-binding">HTC</span>
                                                <i class="fa fa-plus" onclick="addCategory(this)"></i>
                                            </li>
                                            <li ng-repeat="item in categories" class="ng-scope">
                                                <span ng-bind="item.name" class="ng-binding">LG</span>
                                                <i class="fa fa-plus" onclick="addCategory(this)"></i>
                                            </li>
                                            <li ng-repeat="item in categories" class="ng-scope">
                                                <span ng-bind="item.name" class="ng-binding">OPPO</span>
                                                <i class="fa fa-plus" onclick="addCategory(this)"></i>
                                            </li>
                                            <li ng-repeat="item in categories" class="ng-scope">
                                                <span ng-bind="item.name" class="ng-binding">TCL</span>
                                                <i class="fa fa-plus" onclick="addCategory(this)"></i>
                                            </li>
                                            <li ng-repeat="item in categories" class="ng-scope">
                                                <span ng-bind="item.name" class="ng-binding">VIVO</span>
                                                <i class="fa fa-plus" onclick="addCategory(this)"></i>
                                            </li>
                                            <li ng-repeat="item in categories" class="ng-scope">
                                                <span ng-bind="item.name" class="ng-binding">ZUK</span>
                                                <i class="fa fa-plus" onclick="addCategory(this)"></i>
                                            </li>
                                            <li ng-repeat="item in categories" class="ng-scope">
                                                <span ng-bind="item.name" class="ng-binding">一加</span>
                                                <i class="fa fa-plus" onclick="addCategory(this)"></i>
                                            </li>
                                            <li ng-repeat="item in categories" class="ng-scope">
                                                <span ng-bind="item.name" class="ng-binding">三星</span>
                                                <i class="fa fa-plus" onclick="addCategory(this)"></i>
                                            </li>
                                            <li ng-repeat="item in categories" class="ng-scope">
                                                <span ng-bind="item.name" class="ng-binding">中兴</span>
                                                <i class="fa fa-plus" onclick="addCategory(this)"></i>
                                            </li>
                                            <li ng-repeat="item in categories" class="ng-scope">
                                                <span ng-bind="item.name" class="ng-binding">乐视</span>
                                                <i class="fa fa-plus" onclick="addCategory(this)"></i>
                                            </li>
                                            <li ng-repeat="item in categories" class="ng-scope">
                                                <span ng-bind="item.name" class="ng-binding">努比亚</span>
                                                <i class="fa fa-plus" onclick="addCategory(this)"></i>
                                            </li>
                                            <li ng-repeat="item in categories" class="ng-scope">
                                                <span ng-bind="item.name" class="ng-binding">华为</span>
                                                <i class="fa fa-plus" onclick="addCategory(this)"></i>
                                            </li>
                                            <li ng-repeat="item in categories" class="ng-scope">
                                                <span ng-bind="item.name" class="ng-binding">华硕</span>
                                                <i class="fa fa-plus" onclick="addCategory(this)"></i>
                                            </li>
                                            <li ng-repeat="item in categories" class="ng-scope">
                                                <span ng-bind="item.name" class="ng-binding">天语</span>
                                                <i class="fa fa-plus" onclick="addCategory(this)"></i>
                                            </li>
                                            <li ng-repeat="item in categories" class="ng-scope">
                                                <span ng-bind="item.name" class="ng-binding">小米</span>
                                                <i class="fa fa-plus" onclick="addCategory(this)"></i>
                                            </li>
                                            <li ng-repeat="item in categories" class="ng-scope">
                                                <span ng-bind="item.name" class="ng-binding">小辣椒</span>
                                                <i class="fa fa-plus" onclick="addCategory(this)"></i>
                                            </li>
                                            <li ng-repeat="item in categories" class="ng-scope">
                                                <span ng-bind="item.name" class="ng-binding">摩托罗拉</span>
                                                <i class="fa fa-plus" onclick="addCategory(this)"></i>
                                            </li>                                        
                                            <li ng-repeat="item in categories" class="ng-scope">
                                                <span ng-bind="item.name" class="ng-binding">朵唯</span>
                                                <i class="fa fa-plus" onclick="addCategory(this)"></i>
                                            </li>
                                            <li ng-repeat="item in categories" class="ng-scope">
                                                <span ng-bind="item.name" class="ng-binding">索尼</span>
                                                <i class="fa fa-plus" onclick="addCategory(this)"></i>
                                            </li>
                                            <li ng-repeat="item in categories" class="ng-scope">
                                                <span ng-bind="item.name" class="ng-binding">联想</span>
                                                <i class="fa fa-plus" onclick="addCategory(this)"></i>
                                            </li>
                                            <li ng-repeat="item in categories" class="ng-scope">
                                                <span ng-bind="item.name" class="ng-binding">苹果</span>
                                                <i class="fa fa-plus" onclick="addCategory(this)"></i>
                                            </li>
                                            <li ng-repeat="item in categories" class="ng-scope">
                                                <span ng-bind="item.name" class="ng-binding">酷派</span>
                                                <i class="fa fa-plus" onclick="addCategory(this)"></i>
                                            </li>
                                            <li ng-repeat="item in categories" class="ng-scope">
                                                <span ng-bind="item.name" class="ng-binding">金立</span>
                                                <i class="fa fa-plus" onclick="addCategory(this)"></i>
                                            </li>
                                            <li ng-repeat="item in categories" class="ng-scope">
                                                <span ng-bind="item.name" class="ng-binding">锤子</span>
                                                <i class="fa fa-plus" onclick="addCategory(this)"></i>
                                            </li>
                                            <li ng-repeat="item in categories" class="ng-scope">
                                                <span ng-bind="item.name" class="ng-binding">魅族</span>
                                                <i class="fa fa-plus" onclick="addCategory(this)"></i>
                                            </li>
                                            <li ng-repeat="item in categories" class="ng-scope">
                                                <span ng-bind="item.name" class="ng-binding">其他</span>
                                                <i class="fa fa-plus" onclick="addCategory(this)"></i>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div class="column-side right-side">
                                <div class="column-header">已选择<span id="selectednumberid" class="ng-binding">0</span>个, 剩<span id="remainnumberid" class="ng-binding">10</span>个可选</div>
                                <div class="column-body">
                                    <div class="category-list">
                                        <ul class="list-items" id="selectedcategorylist">
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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
                            <input type="radio" id="selectstartendtime" name="schedule_type" value="2" checked="checked">选择起始时间
                        </label>
                        <div id="selectstartendtimediv" class="embed future_datetime" for-radio="schedule_type" data-value="2" style="display: block;">
                            开始 :
                            <input type="text" class="form-control form-control-inline" name="start_time" id="start_time" value="2015-09-20 00:00" data-ga="ga"> 结束 :
                            <input type="text" class="form-control form-control-inline" name="end_time" id="end_time" value="2015-09-21 00:00" data-ga="ga">
                        </div>
                    </div>

                    <div class="radio">
                        <label>
                            <input type="radio" id="selectduration" name="schedule_type" value="4">选择时间段<span class="text-danger"></span>
                        </label>

                        <div id="selectdurationdiv" class="embed future_date" for-radio="schedule_type" data-value="4" style="display: none;">

                            开始 :
                            <input type="text" id="start_date" class="form-control form-control-inline" name="start_date" value="2015-09-20"> 结束 :
                            <input type="text" id="end_date" class="form-control form-control-inline" name="end_date" value="2015-10-20">
                            <input name="week_time" type="hidden" value="">
                            <div id="calendarContainer" style="margin-top:10px;">
                                <div id="calendar">
                                    <div class="schedule"></div>
                                    <table id="calendar-table">
                                        <thead id="calendar-head">
                                            <tr>
                                                <th rowspan="2">星期 / 时间</th>
                                                <th colspan="24">上午</th>
                                                <th colspan="24">下午</th>
                                            </tr>
                                            <tr>
                                                <td colspan="2">0</td>
                                                <td colspan="2">1</td>
                                                <td colspan="2">2</td>
                                                <td colspan="2">3</td>
                                                <td colspan="2">4</td>
                                                <td colspan="2">5</td>
                                                <td colspan="2">6</td>
                                                <td colspan="2">7</td>
                                                <td colspan="2">8</td>
                                                <td colspan="2">9</td>
                                                <td colspan="2">10</td>
                                                <td colspan="2">11</td>
                                                <td colspan="2">12</td>
                                                <td colspan="2">13</td>
                                                <td colspan="2">14</td>
                                                <td colspan="2">15</td>
                                                <td colspan="2">16</td>
                                                <td colspan="2">17</td>
                                                <td colspan="2">18</td>
                                                <td colspan="2">19</td>
                                                <td colspan="2">20</td>
                                                <td colspan="2">21</td>
                                                <td colspan="2">22</td>
                                                <td colspan="2">23</td>
                                            </tr>
                                        </thead>
                                        <tbody id="calendar-body">
                                            <tr>
                                                <td>星期一</td>
                                                <td class="calendar-atom-time" data-week="0" data-time="0"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="1"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="2"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="3"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="4"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="5"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="6"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="7"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="8"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="9"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="10"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="11"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="12"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="13"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="14"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="15"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="16"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="17"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="18"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="19"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="20"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="21"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="22"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="23"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="24"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="25"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="26"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="27"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="28"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="29"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="30"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="31"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="32"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="33"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="34"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="35"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="36"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="37"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="38"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="39"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="40"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="41"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="42"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="43"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="44"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="45"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="46"></td>
                                                <td class="calendar-atom-time" data-week="0" data-time="47"></td>
                                            </tr>
                                            <tr>
                                                <td>星期二</td>
                                                <td class="calendar-atom-time" data-week="1" data-time="0"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="1"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="2"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="3"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="4"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="5"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="6"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="7"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="8"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="9"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="10"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="11"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="12"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="13"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="14"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="15"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="16"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="17"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="18"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="19"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="20"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="21"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="22"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="23"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="24"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="25"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="26"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="27"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="28"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="29"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="30"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="31"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="32"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="33"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="34"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="35"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="36"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="37"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="38"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="39"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="40"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="41"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="42"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="43"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="44"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="45"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="46"></td>
                                                <td class="calendar-atom-time" data-week="1" data-time="47"></td>
                                            </tr>
                                            <tr>
                                                <td>星期三</td>
                                                <td class="calendar-atom-time" data-week="2" data-time="0"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="1"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="2"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="3"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="4"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="5"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="6"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="7"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="8"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="9"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="10"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="11"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="12"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="13"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="14"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="15"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="16"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="17"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="18"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="19"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="20"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="21"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="22"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="23"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="24"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="25"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="26"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="27"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="28"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="29"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="30"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="31"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="32"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="33"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="34"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="35"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="36"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="37"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="38"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="39"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="40"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="41"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="42"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="43"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="44"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="45"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="46"></td>
                                                <td class="calendar-atom-time" data-week="2" data-time="47"></td>
                                            </tr>
                                            <tr>
                                                <td>星期四</td>
                                                <td class="calendar-atom-time" data-week="3" data-time="0"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="1"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="2"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="3"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="4"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="5"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="6"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="7"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="8"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="9"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="10"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="11"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="12"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="13"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="14"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="15"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="16"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="17"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="18"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="19"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="20"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="21"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="22"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="23"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="24"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="25"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="26"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="27"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="28"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="29"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="30"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="31"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="32"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="33"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="34"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="35"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="36"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="37"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="38"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="39"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="40"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="41"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="42"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="43"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="44"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="45"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="46"></td>
                                                <td class="calendar-atom-time" data-week="3" data-time="47"></td>
                                            </tr>
                                            <tr>
                                                <td>星期五</td>
                                                <td class="calendar-atom-time" data-week="4" data-time="0"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="1"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="2"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="3"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="4"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="5"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="6"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="7"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="8"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="9"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="10"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="11"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="12"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="13"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="14"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="15"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="16"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="17"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="18"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="19"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="20"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="21"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="22"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="23"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="24"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="25"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="26"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="27"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="28"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="29"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="30"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="31"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="32"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="33"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="34"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="35"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="36"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="37"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="38"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="39"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="40"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="41"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="42"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="43"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="44"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="45"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="46"></td>
                                                <td class="calendar-atom-time" data-week="4" data-time="47"></td>
                                            </tr>
                                            <tr>
                                                <td>星期六</td>
                                                <td class="calendar-atom-time" data-week="5" data-time="0"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="1"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="2"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="3"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="4"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="5"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="6"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="7"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="8"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="9"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="10"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="11"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="12"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="13"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="14"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="15"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="16"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="17"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="18"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="19"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="20"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="21"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="22"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="23"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="24"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="25"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="26"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="27"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="28"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="29"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="30"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="31"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="32"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="33"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="34"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="35"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="36"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="37"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="38"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="39"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="40"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="41"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="42"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="43"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="44"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="45"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="46"></td>
                                                <td class="calendar-atom-time" data-week="5" data-time="47"></td>
                                            </tr>
                                            <tr>
                                                <td>星期日</td>
                                                <td class="calendar-atom-time" data-week="6" data-time="0"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="1"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="2"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="3"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="4"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="5"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="6"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="7"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="8"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="9"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="10"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="11"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="12"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="13"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="14"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="15"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="16"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="17"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="18"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="19"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="20"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="21"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="22"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="23"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="24"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="25"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="26"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="27"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="28"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="29"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="30"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="31"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="32"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="33"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="34"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="35"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="36"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="37"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="38"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="39"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="40"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="41"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="42"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="43"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="44"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="45"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="46"></td>
                                                <td class="calendar-atom-time" data-week="6" data-time="47"></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div style="display:none;" class="readableWeekModel">
                                    <li>星期<span class="readableWeekday">三</span>,
                                        <time class="readableWeektime1">2:00</time>~
                                        <time class="readableWeektime2">2:30</time><i class="del" data-time="39" data-week="6">×</i>
                                    </li>
                                </div>
                                <div id="readableWeekTime" style="display: block;">
                                    <a class="btn btn-danger btn-xs" id="reset">撤销所有选择</a>
                                    <ul>
                                    </ul>
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
                    {{range index .lovmaps "budget_type"}}
                    <label class="radio-inline">
                        <input type="radio" name="budget_mode" class="budget-radio" value="{{.LovKey}}"> {{.LovValue}}
                    </label>
                    {{end}}
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
                    <span ng-show="baseInfo.image_mode==4" class="ng-hide">13</span> 元/千次展示)
                    </span>
                    <span for-radio="pricing" data-value="2" style="display: inline;">
                        <span id="min_bid" style="display: none;">(最低出价
                            <span ng-show="baseInfo.image_mode==2">0.3</span>
                    <span ng-show="baseInfo.image_mode==3" class="ng-hide">0.45</span>
                    <span ng-show="baseInfo.image_mode==4" class="ng-hide">0.39</span> 元/点击)
                    </span>
                    <span id="estimation_bid" style="display: inline;">建议出价大于
                            <span ng-show="baseInfo.image_mode==2" id="cpc_small">0.75</span>
                    <span ng-show="baseInfo.image_mode==3" id="cpc_large" class="ng-hide">1.36</span>
                    <span ng-show="baseInfo.image_mode==4" id="cpc_group" class="ng-hide">0.98</span> 元.
                    <i class="fa fa-question-circle tooltip-icon" data-toggle="tooltip" data-placement="top" title="" data-original-title="建议出价金额是根据定向受众和竞争广告的出价而确定的"></i>
                    </span>
                    </span>
                </div>
            </div>
            <div class="page-header" id="bidding-header">
                <h3 class="text-center">高级设置</h3>
            </div>
            <div class="form-group">
                <label class="col-sm-3 control-label">广告渠道</label>
                <div class="col-sm-8">
	                <div class="P-campaignSpotChannelCon">
	                   <div class="M-formItem" type="radio">
						    <label class="M-formItem">
						        <input type="checkbox" name="form_el_265" id="form_el_265_0" data-id="10008" value="0">
						        <span>优酷&nbsp;&nbsp;</span>
						    </label>
						    <label class="M-formItem">
						        <input type="checkbox" name="form_el_265" id="form_el_265_1" data-id="10002" value="1">
						        <span>腾讯&nbsp;&nbsp;</span>
						    </label>
						    <label class="M-formItem">
						        <input type="checkbox" name="form_el_265" id="form_el_265_2" data-id="10001" value="2">
						        <span>秒针&nbsp;&nbsp;</span>
						    </label>
						    <label class="M-formItem">
						        <input type="checkbox" name="form_el_265" id="form_el_265_3" data-id="10032" value="3">
						        <span>今日头条</span>
						    </label>
						    <label class="M-formItem">
						        <input type="checkbox" name="form_el_265" id="form_el_265_4" data-id="10024" value="4">
						        <span>百度移动</span>
						    </label>
						    <label class="M-formItem">
						        <input type="checkbox" name="form_el_265" id="form_el_265_5" data-id="10038" value="5">
						        <span>易传媒移动</span>
						    </label>
						    <label class="M-formItem">
						        <input type="checkbox" name="form_el_265" id="form_el_265_6" data-id="10016" value="6">
						        <span>移动资源</span>
						    </label>
						    <label class="M-formItem">
						        <input type="checkbox" name="form_el_265" id="form_el_265_7" data-id="10033" value="7">
						        <span>聚效移动</span>
						    </label>
						    <label class="M-formItem">
						        <input type="checkbox" name="form_el_265" id="form_el_265_8" data-id="10023" value="8">
						        <span>TanX移动</span>
						    </label>
						    <label class="M-formItem">
						        <input type="checkbox" name="form_el_265" id="form_el_265_9" data-id="10026" value="9">
						        <span>谷歌移动</span>
						    </label>
						    <label class="M-formItem">
						        <input type="checkbox" name="form_el_265" id="form_el_265_10" data-id="10041" value="10">
						        <span>乐视移动</span>
						    </label>
						    <label class="M-formItem">
						        <input type="checkbox" name="form_el_265" id="form_el_265_11" data-id="10051" value="11">
						        <span>讯飞移动</span>
						    </label>
						    <label class="M-formItem">
						        <input type="checkbox" name="form_el_265" id="form_el_265_12" data-id="10036" value="12">
						        <span>Smaato</span>
						    </label>
						
						</div>
						<div class="M-formItem" type="radio">
						    <label class="M-formItem">
						        <input type="checkbox" name="form_el_265" id="form_el_265_13" data-id="10037" value="13">
						        <span>M_Inmobi</span>
						    </label>
						    <label class="M-formItem">
						        <input type="checkbox" name="form_el_265" id="form_el_265_14" data-id="10045" value="14">
						        <span>M_PubMatic</span>
						    </label>
						    <label class="M-formItem">
						        <input type="checkbox" name="form_el_265" id="form_el_265_15" data-id="10046" value="15">
						        <span>爱奇艺移动</span>
						    </label>
						    <label class="M-formItem">
						        <input type="checkbox" name="form_el_265" id="form_el_265_16" data-id="10052" value="16">
						        <span>百度助手</span>
						    </label>
						    <label class="M-formItem">
						        <input type="checkbox" name="form_el_265" id="form_el_265_17" data-id="10054" value="17">
						        <span>风行移动</span>
						    </label>
						    <label class="M-formItem">
						        <input type="checkbox" name="form_el_265" id="form_el_265_18" data-id="10048" value="18">
						        <span>新浪微博</span>
						    </label>
						    <label class="M-formItem">
						        <input type="checkbox" name="form_el_265" id="form_el_265_19" data-id="10049" value="19">
						        <span>广点通</span>
						    </label>
						    <label class="M-formItem">
						        <input type="checkbox" name="form_el_265" id="form_el_265_20" data-id="10060" value="20">
						        <span>鹰击</span>
						    </label>
						    <label class="M-formItem">
						        <input type="checkbox" name="form_el_265" id="form_el_265_21" data-id="10063" value="21">
						        <span>M_PPTV</span>
						    </label>
						    <label class="M-formItem">
						        <input type="checkbox" name="form_el_265" id="form_el_265_22" data-id="10064" value="22">
						        <span>百川移动</span>
						    </label>
						    <label class="M-formItem">
						        <input type="checkbox" name="form_el_265" id="form_el_265_23" data-id="10067" value="23">
						        <span>玉米移动</span>
						    </label>
						    <label class="M-formItem">
						        <input type="checkbox" name="form_el_265" id="form_el_265_24" data-id="10069" value="24">
						        <span>中天移动</span>
						    </label>
						</div> 
	                </div>                   
                </div>
            </div>
            
			<!-- tree view start-->
			<div class="form-group audience-group ng-scope">
			    <label for="" class="col-sm-3 control-label">其他人群</label>
			    <div class="col-sm-8">
			        <label class="radio-inline">
			            <input type="radio" name="peoplecondition" checked="checked" value="0" id="peopleunlimited" class="ng-pristine ng-untouched ng-valid"> 不限
			        </label>
			        <label class="radio-inline">
			            <input type="radio" name="peoplecondition" value="1" id="includepeopleid" class="ng-valid ng-dirty ng-valid-parse ng-touched"> 包含以下条件
			        </label>
			        <label class="radio-inline">
			            <input type="radio" name="peoplecondition" value="1" id="excludepeopleid" class="ng-valid ng-dirty ng-valid-parse ng-touched"> 排除以下条件
			        </label>
			        <div class="prepend-top-15" id="peopleconditiondiv" style="display:none;">
			            <div class="column-wrap clearfix ng-isolate-scope" title="所有条目" selected="selected">
			                <div class="column-side left-side">
			                    <div class="column-header ng-binding">所有条目</div>
								<div style="max-height:408px;overflow-y:scroll;" id="sourcetree"></div>		                    
			                </div>
			
			                <div class="column-side right-side">
			                    <div class="column-header">已选择 <span style="float:right;"><a class="custom-btn btn-primary" onclick="deleteAllSelectedNodes();">删除所有</a></span></div>
								<div style="max-height:408px;overflow-y:scroll;" id="selectedtree"></div>
								<!--
								<div class="column-body">
                                    <div class="category-list">  </div>
								</div>
								-->
								
			                </div>
			            </div>
			        </div>
			    </div>
			</div>
			<!-- tree view end-->
			
            <div class="form-group" id="create-submit-group">
                <div class="col-sm-offset-3 col-sm-9">
                    <button type="submit" class="btn btn-primary" id="creat_submit">提交</button>
                </div>
            </div>
        </form>
    </div>

    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script src="http://cdn.bootcss.com/jquery/1.11.3/jquery.min.js"></script>
    <!-- Include all compiled plugins (below), or include individual files as needed -->
    <script type="text/javascript" src="/static/js/lazyload-min.js"></script>
    <script src="http://cdn.bootcss.com/bootstrap/3.3.4/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="/static/js/moment.min.js"></script>
    <script src="/static/js/bootstrap-datetimepicker.min.js"></script>
    <script src="/static/js/campaign_weektime.js"></script>
    <script src="/static/js/campaign/campaignadd.js"></script>
    <script src="/static/js/bootstrap-treeview.js"></script>

    <script type="text/javascript">
        $('#start_time').datetimepicker({
            format: 'YYYY-MM-DD HH:mm'
        });
        $('#end_time').datetimepicker({
            format: 'YYYY-MM-DD HH:mm'
        });
        $('#start_date').datetimepicker({
            format: 'YYYY-MM-DD'
        });
        $('#end_date').datetimepicker({
            format: 'YYYY-MM-DD'
        });
        LazyLoad.css(["/static/css/cityStyle.css"], function() {
            LazyLoad.js(["/static/js/cityScript.js"], function() {
                var test = new citySelector.cityInit("cityinput");
            });
        });	
		
        $(function() {
            $("#cityselectiondiv").css("display", "none");
            $("#phonebrandselectiondiv").css("display", "none");
            bindCategoryChange();
            $("#cityinput").bind("keyup", function() {
                //searchcity($(this).val());
            });
			
            $("#cityunlimited").bind("click", function() {
                deleteAllSelected();
                $("#cityselectiondiv").css("display", "none");
            });
			
            $("#citydefined").bind("click", function() {
                $("#cityselectiondiv").css("display", "block");
            });
			
            $("#phonebrandunlimited").bind("click", function() {
                $("#phonebrandselectiondiv").css("display", "none");
            });
			
            $("#phonebrandid").bind("click", function() {
                $("#phonebrandselectiondiv").css("display", "block");
            });
			
			$("#selectstartendtime").bind("click", function() {
               $("#selectstartendtimediv").css("display", "block");
				$("#selectdurationdiv").css("display", "none");
            });
			
			$("#selectduration").bind("click", function() {
               $("#selectdurationdiv").css("display", "block");
				$("#selectstartendtimediv").css("display", "none");
            });
			
            $tree = $('#sourcetree').treeview({
                 data: getTree(),
				 multiSelect:true,
				 levels:1
            });
			
			$('#sourcetree').on('nodeSelected', function(event, data) {
			  treeNodeSelected(data);
			});
			
			$('#sourcetree').on('nodeUnselected', function(event, data) {
			  treeNodeUnSelected(data);
			});
			
			//$("#peopleconditiondiv").css("display", "block");
			$("#peopleunlimited").bind("click", function(){
				$("#peopleconditiondiv").css("display", "none");
				//TODO
				// empty selectedNodes
			});
			$("#includepeopleid").bind("click", function(){
				$("#peopleconditiondiv").css("display", "block");
			});
			
			$("#excludepeopleid").bind("click", function(){
				$("#peopleconditiondiv").css("display", "block");
			});
        });
		
		
    </script>
</body>

</html>