
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=1280,target-densitydpi=high-dpi,user-scalable=no" />
    {{template "../public/header.tpl"}}
    <!------Main Styles------>
    <style type="text/css">
        #loading{
            width:1280px;
            height:722px;
            background: #FFFFFF;
            position: absolute;
            top: 0px;
            left: 0;
            z-index:999;
            opacity:1;
            -webkit-transition:all 1s ease 0s;
            -moz-transition:all 1s ease 0s;
            -ms-transition:all 1s ease 0s;
            -o-transition:all 1s ease 0s;
            transition:all 1s ease 0s;
        }

        .textbox .textbox-text{
            font-size: 12px;
        }

        .combobox-item, .combobox-group {
            font-size: 12px;
            padding: 3px 0px 3px 3px;
        }

        .datagrid-row-selected{
            /*background:#d7ebf9;*/
            background:#FFF0BC;
            color:#000;
        }

        .datagrid-row-click{
            background:#3baae3;
            color:#fff;
        }

        /*
        .panel-title {
            font-weight: bold;
            height: 22px;
            line-height: 22px;
            font-size: 14px;
        }
        */
        .datagrid-header-row, .datagrid-row {
            height: 32px;
        }
        .panel-title {
            font-weight: bold;
            color: #4D3667;
            height: 22px;
            line-height: 22px;
            font-size: 12px;
        }
        #result_area a{
            color:#000;
        }

        #timezone_info{
            position:absolute;
            z-index:2;
            right:10px;
            top:420px;
            color:gray;
        }

        a:hover{
            text-decoration:underline;
        }
    </style>
</head>
<body>
<div id="main_content">
    <div id="content_area" style="height:1100px;">
        <div id="search_areab">
            <div style="float:left;margin-left:0px">
                <select name="f_adname" id="f_adid" style="width:210px;height:32px;font-size:12px;">
                    <option value="">所有广告主</option>
                    <option value="1">madhouse</option>
                    <option value="2">wechat</option>
                    <option value="13">Elex</option>
                    <option value="14">CMGE</option>
                    <option value="15">Efun</option>
                    <option value="16">4399</option>
                    <option value="38">Elex Android</option>
                </select>
            </div>
            <div style="float:left;margin-left:10px">
                <select class="easyui-combobox" name="f_camname" id="f_camid" style="width:210px;height:32px;font-size:12px;">
                    <option value="">所有活动</option>
                </select>
            </div>
            <!--
            <div style="float:left;margin-left:10px;margin-top:1px;">
                <input type="button" class="time_search_button1" value="YD" onclick="return getfournums(1);"/><input type="button" class="time_search_button2" value="W"  onclick="return getfournums(2);"/><input type="button" class="time_search_button3" value="M"  onclick="return getfournums(3);"/>
            </div>
            -->
        </div>
        <div class="toparea1">
            <div class="index_top">
                <img src="/static/images/money.png" class="dashboard-img"/><span class="dashboard-img-text">总支出</span>
                <div class="c-nums" id="spendnum">$0</div>
            </div>
            <div class="index_top">
                <img src="/static/images/dashboard_install.png" class="dashboard-img"/><span class="dashboard-img-text">总安装数</span>
                <div class="c-nums" id="installnum">0</div>
            </div>
            <div class="index_top">
                <img src="/static/images/money.png" class="dashboard-img"/><span class="dashboard-img-text">总收入</span>
                <div class="c-nums" id="ecpcnum">$0</div>
            </div>
            <div class="index_topb">
                <img src="/static/images/money.png" class="dashboard-img"/><span class="dashboard-img-text">eCPA</span>
                <div class="c-nums" id="ecpanum">$0</div>
            </div>
        </div>
        <div style="margin-top:10px;">
            <div class="index_center_l">
                <div class="top_button">
                    <div style="float:left;margin-left:0px">
                        <select name="f_select" id="f_select" style="width:210px;height:30px;font-size:14px;">
                            <option value="campaign">最优的5个活动</option>
                            <option value="channel">最优的5个渠道</option>
                        </select>
                    </div>
                    <div style="float:right;margin-left:0px">
                        <a class="menu1" href="javascript:void(0);" onclick="return getchartbytype(1)" >安装</a><a class="menu2" href="javascript:void(0);" onclick="return getchartbytype(2)" >支出</a>
                    </div>
                </div>
                <div style="clear:both;"></div>
                <div style='height:260px;width:100%;margin-top:8px;' id="idChart"></div>
            </div>
        </div>
        <div style="clear:both;"></div>

        <div id="search_area" style="margin-top:0px">
            <div style="float:left;margin-left:0px">
                <input name="f_s_name" id="f_s_name" type="text" class="f1 easyui-textbox" data-options="prompt:'请输入活动名称'"  style="height:32px;width:200px;" maxlength="30" />
            </div>
            <!--<div style="float:left;margin-left:10px">
                <select class="easyui-combobox" name="f_status" id="f_status" style="width:200px;height:32px;font-size:12px;">
                        <option value="">All Status</option>
                        <option value="0">Draft</option>
                        <option value="1">Planned</option>
                        <option value="2">Running</option>
                        <option value="3">Finished</option>
                </select>
            </div>-->
            <div style="float:left;margin-left:10px">
                <!--<input type="button" id="f_search" name="f_search" class="user_search_button" onclick="return showUserSearch();" value="Search" style="height:35px;margin-top:4px;"/>-->
                <a id="f_search" href="javascript:showUserSearch();" class="easyui-linkbutton" style="height:32px;width:80px;">查找</a>
            </div>
            <div style="float:right">
                <!--<input type="button" id="f_new" name="f_new" class="user_search_button" style="width:150px;height:35px;margin-top:4px;" onclick="return createCampaign();" value="New Campaign" />-->
                <a id="f_new" href="javascript:createCampaign();" class="easyui-linkbutton" style="height:32px;width:150px;">新建活动</a>
            </div>
        </div>

        <div id="result_area" style="margin-top:10px;border:0">
            <table id="comp_list" title="活动列表" style="width:100%;height:95%"
                   data-options="rownumbers:false,singleSelect:true,url:'get_campaign.php',method:'get'" pagination="true">
                <thead>
                <tr>
                    <th data-options="field:'f_status',width:80,formatter:formatStatus,sortable:true"><b>状态</b></th>
                    <th data-options="field:'f_name',width:169,formatter:formatCName"><b>名称</b></th>
                    <th data-options="field:'f_adname',width:109"><b>广告主</b></th>
                    <th data-options="field:'f_track_type',width:100,formatter:formatTrack"><b> Tracking</b></th>
                    <th data-options="field:'flights',width:60,formatter:formatFlight,sortable:true"><b>Flight No.</b></th>
                    <th data-options="field:'spend',width:100,formatter:formatSpend,sortable:true"><b>渠道成本</b></th>
                    <th data-options="field:'revenue',width:120,formatter:formatRevenue,sortable:true"><b>广告主支出(元)</b></th>
                    <th data-options="field:'install',width:80,formatter:formatInstall,sortable:true"><b>总安装数</b></th>
                    <th data-options="field:'pinstall',width:100,formatter:formatSuccInstall,sortable:true"><b>回传安装数</b></th>
                    <!--
                    <th data-options="field:'ecpc',width:100,formatter:formatEcpc,sortable:true"><b>In-app Revenue</b></th>
                    -->
                    <th data-options="field:'inappRevnueTotal',width:100,formatter:formatappRevenue,sortable:true"><b>收入</b></th>
                    <th data-options="field:'ecpa',width:60,formatter:formatEcpa,sortable:true"><b>eCPA</b></th>
                    <th data-options="field:'f_id',width:60,align:'center',formatter:formatExPort"><b>Export</b></th>
                </tr>
                </thead>
            </table>

        </div>
    </div>

</div>

</div>
<script src="/static/echartsjs/echarts-all.js"></script>
<script type="text/javascript">

    function VDoc(id){
        return document.getElementById(id);
    }

    function showDiv(d){
        VDoc(d).style.display = 'block';
    }

    function closeDiv(d){
        VDoc(d).style.display = 'none';
    }

    var fournum_day = "1";

    function showUserSearch(){
        //$('#comp_list').datagrid('load',{f_name:$('#f_s_name').val(),f_status:$('#f_status').combobox('getValue')});
        $('#comp_list').datagrid('load',{f_name:$('#f_s_name').val()});
    }

    function adtop5(day){
        $('#topadver_list').datagrid('load',{day:day});
        for (var i=1;i<=3;i++)
        {
            var k = i+3;
            if(day==i){
                $(".time_search_button"+k).css("background-color","#E9EBF5");
            }else{
                $(".time_search_button"+k).css("background-color","#ffffff");
            }
        }
    }

    function formatExPort(val,row){
        if(row.flights > 0){
            return '<img src="/static/images/export.png" alt="" style="cursor:pointer" onclick="window.location.href=\'d_report.php?campaign_id='+val+'\'">'
        }else{
            return '-';
        }
    }

    var url;
    function onDocLoaded(){
        //
    }

    $('#f_adid').combobox({
        onSelect: function () {
            var adid = $('#f_adid').combobox('getValue');
            getfournums(daytype="",act="preview",adid,cdid="");
            $('#f_camid').combobox({
                url:'ajax_getcampaign.php?pid='+adid,
                valueField:'f_id',
                textField:'f_name',
                onLoadSuccess: function () { //加载完成后,设置选中第一项
                    var val = $(this).combobox("getData");
                    for (var item in val[0]) {
                        if (item == "f_id") {
                            $(this).combobox("select", val[0][item]);
                        }
                    }
                    //$(this).combobox("select", "");
                },
                onSelect: function () {
                    var adid = $('#f_adid').combobox('getValue');
                    var cdid = $('#f_camid').combobox('getValue');
                    getfournums(daytype="",act="preview",adid,cdid);
                }
            });
        }
    });

    getfournums(daytype="",act="preview",aid="",cid="");//默认取值

    function getfournums(daytype,act,aid,cid){
        if(daytype){
            fournum_day = daytype;
            for (var i=1;i<=3;i++)
            {
                if(daytype==i){
                    $(".time_search_button"+i).css("background-color","#E9EBF5");
                }else{
                    $(".time_search_button"+i).css("background-color","#ffffff");
                }
            }
            var act="preview";
            var aid = $('#f_adid').combobox('getValue');
            if(aid=="All Advertisers"){
                aid="";
            }
            var cid = $('#f_camid').combobox('getValue');
            if(cid=="All Campaigns"){
                cid="";
            }

        }
        jQuery.ajax({
            type: "get",
            url: "ajax_campaign.php",
            data:"act="+act+"&aid="+aid+"&cid="+cid+"&day="+fournum_day,
            cache:false,
            beforeSend: function(XMLHttpRequest){
            },
            success: function(data, textStatus){
                var obj = eval(data);
                if(obj[0].spend==0){
                    $("#spendnum").html("$0");
                }else{
                    $("#spendnum").html("$"+obj[0].spend);
                }
                /*spend画线spend*/
                var test_7 = obj[0].spend_7.toString();
                var test_7_array = test_7.split(",");
                max_num = Math.max.apply(null, test_7_array);
                min_num = Math.min.apply(null, test_7_array);
                if((max_num-min_num)==0){
                    var per_num = 0;
                }else{
                    var per_num = (30/(max_num-min_num));
                }

                var test_7_1 = Math.abs(parseInt((test_7_array[0]-min_num)*per_num-30));
                var test_7_2 = Math.abs(parseInt((test_7_array[1]-min_num)*per_num-30));
                var test_7_3 = Math.abs(parseInt((test_7_array[2]-min_num)*per_num-30));
                var test_7_4 = Math.abs(parseInt((test_7_array[3]-min_num)*per_num-30));
                var test_7_5 = Math.abs(parseInt((test_7_array[4]-min_num)*per_num-30));
                var test_7_6 = Math.abs(parseInt((test_7_array[5]-min_num)*per_num-30));
                var test_7_7 = Math.abs(parseInt((test_7_array[6]-min_num)*per_num-30));

                var canvas1 = document.getElementById('c-img-right-c1');
                var ctx1 = canvas1.getContext('2d');
                ctx1.clearRect(0,0,canvas1.width,canvas1.height);
                ctx1.strokeStyle="#8ACACA";
                ctx1.lineWidth=1;
                ctx1.beginPath();
                ctx1.moveTo(0,test_7_1);
                ctx1.lineTo(13,test_7_2);
                ctx1.moveTo(13,test_7_2);
                ctx1.lineTo(26,test_7_3);
                ctx1.moveTo(26,test_7_3);
                ctx1.lineTo(39,test_7_4);
                ctx1.moveTo(39,test_7_4);
                ctx1.lineTo(52,test_7_5);
                ctx1.moveTo(52,test_7_5);
                ctx1.lineTo(65,test_7_6);
                ctx1.moveTo(65,test_7_6);
                ctx1.lineTo(78,test_7_7);
                ctx1.closePath();
                ctx1.stroke();
                /*spend画线spend*/

                if(obj[0].install==0){
                    $("#installnum").html("0");
                }else{
                    $("#installnum").html(obj[0].install);
                }
                /*install画线install*/
                var test_7 = obj[0].install_7.toString();
                var test_7_array = test_7.split(",");
                max_num = Math.max.apply(null, test_7_array);
                min_num = Math.min.apply(null, test_7_array);
                if((max_num-min_num)==0){
                    var per_num = 0;
                }else{
                    var per_num = (30/(max_num-min_num));
                }

                var test_7_1 = Math.abs(parseInt((test_7_array[0]-min_num)*per_num-30));
                var test_7_2 = Math.abs(parseInt((test_7_array[1]-min_num)*per_num-30));
                var test_7_3 = Math.abs(parseInt((test_7_array[2]-min_num)*per_num-30));
                var test_7_4 = Math.abs(parseInt((test_7_array[3]-min_num)*per_num-30));
                var test_7_5 = Math.abs(parseInt((test_7_array[4]-min_num)*per_num-30));
                var test_7_6 = Math.abs(parseInt((test_7_array[5]-min_num)*per_num-30));
                var test_7_7 = Math.abs(parseInt((test_7_array[6]-min_num)*per_num-30));
                var canvas1 = document.getElementById('c-img-right-c2');
                var ctx1 = canvas1.getContext('2d');
                ctx1.clearRect(0,0,canvas1.width,canvas1.height);
                ctx1.strokeStyle="#DB9781";
                ctx1.lineWidth=1;
                ctx1.beginPath();
                ctx1.moveTo(0,test_7_1);
                ctx1.lineTo(13,test_7_2);
                ctx1.moveTo(13,test_7_2);
                ctx1.lineTo(26,test_7_3);
                ctx1.moveTo(26,test_7_3);
                ctx1.lineTo(39,test_7_4);
                ctx1.moveTo(39,test_7_4);
                ctx1.lineTo(52,test_7_5);
                ctx1.moveTo(52,test_7_5);
                ctx1.lineTo(65,test_7_6);
                ctx1.moveTo(65,test_7_6);
                ctx1.lineTo(78,test_7_7);
                ctx1.closePath();
                ctx1.stroke();
                /*install画线install*/

                if(obj[0].inapp_revnue==0){
                    $("#ecpcnum").html("$0");
                }else{
                    $("#ecpcnum").html("$"+obj[0].inapp_revnue);
                }
                /*ecpc画线ecpc*/
                var test_7 = obj[0].inapp_revnue_7.toString();
                var test_7_array = test_7.split(",");
                max_num = Math.max.apply(null, test_7_array);
                min_num = Math.min.apply(null, test_7_array);
                if((max_num-min_num)==0){
                    var per_num = 0;
                }else{
                    var per_num = (30/(max_num-min_num));
                }

                var test_7_1 = Math.abs(parseInt((test_7_array[0]-min_num)*per_num-30));
                var test_7_2 = Math.abs(parseInt((test_7_array[1]-min_num)*per_num-30));
                var test_7_3 = Math.abs(parseInt((test_7_array[2]-min_num)*per_num-30));
                var test_7_4 = Math.abs(parseInt((test_7_array[3]-min_num)*per_num-30));
                var test_7_5 = Math.abs(parseInt((test_7_array[4]-min_num)*per_num-30));
                var test_7_6 = Math.abs(parseInt((test_7_array[5]-min_num)*per_num-30));
                var test_7_7 = Math.abs(parseInt((test_7_array[6]-min_num)*per_num-30));
                var canvas1 = document.getElementById('c-img-right-c3');
                var ctx1 = canvas1.getContext('2d');
                ctx1.clearRect(0,0,canvas1.width,canvas1.height);
                ctx1.strokeStyle="#BAB2DB";
                ctx1.lineWidth=1;
                ctx1.beginPath();
                ctx1.moveTo(0,test_7_1);
                ctx1.lineTo(13,test_7_2);
                ctx1.moveTo(13,test_7_2);
                ctx1.lineTo(26,test_7_3);
                ctx1.moveTo(26,test_7_3);
                ctx1.lineTo(39,test_7_4);
                ctx1.moveTo(39,test_7_4);
                ctx1.lineTo(52,test_7_5);
                ctx1.moveTo(52,test_7_5);
                ctx1.lineTo(65,test_7_6);
                ctx1.moveTo(65,test_7_6);
                ctx1.lineTo(78,test_7_7);
                ctx1.closePath();
                ctx1.stroke();
                /*ecpc画线ecpc*/

                if(obj[0].ecpa==0){
                    $("#ecpanum").html("$0");
                }else{
                    $("#ecpanum").html("$"+obj[0].ecpa);
                }
                /*ecpa画线ecpa*/
                var test_7 = obj[0].ecpa_7.toString();
                var test_7_array = test_7.split(",");
                max_num = Math.max.apply(null, test_7_array);
                min_num = Math.min.apply(null, test_7_array);
                if((max_num-min_num)==0){
                    var per_num = 0;
                }else{
                    var per_num = (30/(max_num-min_num));
                }

                var test_7_1 = Math.abs(parseInt((test_7_array[0]-min_num)*per_num-30));
                var test_7_2 = Math.abs(parseInt((test_7_array[1]-min_num)*per_num-30));
                var test_7_3 = Math.abs(parseInt((test_7_array[2]-min_num)*per_num-30));
                var test_7_4 = Math.abs(parseInt((test_7_array[3]-min_num)*per_num-30));
                var test_7_5 = Math.abs(parseInt((test_7_array[4]-min_num)*per_num-30));
                var test_7_6 = Math.abs(parseInt((test_7_array[5]-min_num)*per_num-30));
                var test_7_7 = Math.abs(parseInt((test_7_array[6]-min_num)*per_num-30));
                var canvas1 = document.getElementById('c-img-right-c4');
                var ctx1 = canvas1.getContext('2d');
                ctx1.clearRect(0,0,canvas1.width,canvas1.height);
                ctx1.strokeStyle="#FFB7FF";
                ctx1.lineWidth=1;
                ctx1.beginPath();
                ctx1.moveTo(0,test_7_1);
                ctx1.lineTo(13,test_7_2);
                ctx1.moveTo(13,test_7_2);
                ctx1.lineTo(26,test_7_3);
                ctx1.moveTo(26,test_7_3);
                ctx1.lineTo(39,test_7_4);
                ctx1.moveTo(39,test_7_4);
                ctx1.lineTo(52,test_7_5);
                ctx1.moveTo(52,test_7_5);
                ctx1.lineTo(65,test_7_6);
                ctx1.moveTo(65,test_7_6);
                ctx1.lineTo(78,test_7_7);
                ctx1.closePath();
                ctx1.stroke();
                /*ecpa画线ecpa*/
            },
            complete: function(XMLHttpRequest, textStatus){
            },
            error: function(){
                //请求出错处理
            }
        });

    }


    var isvalue = 1;
    $('#f_select').combobox({
        onSelect: function () {
            var select = $('#f_select').combobox('getValue');
            getTopChart(act="top",isvalue,select);
        }
    });
    getTopChart(act="top",type="1",tname="campaign");//默认取值

    function getchartbytype(type){
        isvalue = type;
        for (var i=1;i<=2;i++)
        {
            if(type==i){
                $(".top_button .menu"+i).css("border-bottom","3px solid #4D3667");
            }else{
                $(".top_button .menu"+i).css("border-bottom","3px solid #cccccc");
            }
        }
        var select = $('#f_select').combobox('getValue');
        getTopChart(act="top",type,select);
    }

    function getTopChart(act,type,tname){
        if(tname=="Top 5 campaigns"){
            tname = "campaign";
        }
        jQuery.ajax({
            type: "get",
            url: "ajax_campaign.php",
            data:"act="+act+"&type="+type+"&tname="+tname,
            cache:false,
            beforeSend: function(XMLHttpRequest){
            },
            success: function(data, textStatus){
                var date_array=[];
                var series_array=[];
                var key_array = [];
                var channel_array = [];

                var json =(new Function("","return "+data))();
                $.each(json, function(i, item) {
                    key_array.push(i);
                });
                for(var i=0;i<(key_array.length);i++){
                    for(var j=0;j<=(json[key_array[i]].length-1);j++){
                        date_array.push(json[key_array[i]][j].date);
                    }
                    break;
                }

                for(var i=0;i<(key_array.length);i++){
                    var newdata=[];
                    for(var j=0;j<=(json[key_array[i]].length-1);j++){
                        newdata.push(json[key_array[i]][j].nums);
                    }
                    var newobj = {name:key_array[i],type:"line",data:newdata,smooth:true,draggable:false};
                    series_array.push(newobj);
                }
                var option = {
                    tooltip: {
                        show: true
                    },
                    legend: {
                        data:key_array
                    },
                    grid:{
                        x:45,
                        y:50,
                        x2:2,
                        y2:20
                    },
                    xAxis : [
                        {
                            type : 'category',
                            data : date_array
                        }
                    ],
                    yAxis : [
                        {
                            type : 'value'
                        }
                    ],
                    series : series_array
                };
                var myChart = echarts.init(VDoc('idChart'));
                /*
                 myChart.showLoading({
                 text: 'loading...',
                 });
                 */

                myChart.setOption(option);

                /*
                 setTimeout(function(){
                 myChart.hideLoading();
                 },1000);
                 */
            },
            complete: function(XMLHttpRequest, textStatus){
            },
            error: function(){
                //请求出错处理
            }
        });

    }
    $(function(){
        $('#comp_list').datagrid({
            pageSize:10,
            nowrap:false,
            sortName:"b.beInstallTotal",
            showFooter: true,
            sortOrder:"desc",
            /*remoteSort:false,multiSort:true,*/
            onBeforeLoad:function(param){
                //return false;
            },
            onBeforeRender:function(){
            },
            onLoadError:function(){
            },
            onSelect:function(index,row){
                //Detail(row);
            },
            onHeaderContextMenu:function(e,field){

            },
            rowStyler:function(index,row){
                if (index%2==1){
                    return 'background-color:#F5F7F7;';
                }
            },
            onLoadSuccess:function(data){
            }
        });
    });
    $(function(){
        $('#topadver_list').datagrid({
            pageSize:5,
            width:606,
            nowrap:false,
            pagination:false,//分页控件
            onBeforeLoad:function(param){
                //return false;
            },
            onBeforeRender:function(){
            },
            onLoadError:function(){
            },
            onSelect:function(index,row){
                Detail(row);
            },
            rowStyler:function(index,row){
                if (index%2==1){
                    return 'background-color:#F5F7F7;height:46px;';
                }else{
                    return 'height:46px;';
                }
            },
            onLoadSuccess:function(data){
            }
        });
    });

    function formatCName(val,row){
        if(val != undefined){
            return "<a href='detail_campaign.php?cid="+row.f_id+"' style='color:#5A7ACF'>"+val+"</a>";
        }else{
            return '';
        }
    }

    function formatStatus(val,row){

        if(val=='ft_flg') return '';

        if(val == 4){
            var s = "<span style='color:Navy;'>Stopped</span>";
        }else if(val == 3){
            var s = "<span style='color:Navy;'>Finished</span>";
        }else if(val == 2){
            var s = "<span style='color:Navy;'>Running</span>";
        }else if(val == 1){
            var s = "<span style='color:Navy;'>Planned</span>";
        }else{
            var s = "<span style='color:Navy;'>Draft</span>";
        }

        return "<a href='detail_campaign.php?cid="+row.f_id+"'>"+s+"</a>";
    }

    function formatFlight(val,row){
        if(val === null) return 0;
        return val;
    }

    function formatTrack(val,row){
        if(val==1){
            var s = "PerforMad";
        }else if(val==2){
            var s = "Appsflyer";
        }else if(val==3){
            var s = "MAT";
        }else{
            var s = '';
        }
        return s;
    }
    function formatDate(val,row){
        if(row.f_start!=0 && row.f_end!=0){
            var s = row.f_start+" - "+row.f_end;
        }else{
            var s = " - ";
        }
        return s;
    }
    function formatCost(val,row){
        var s = row.succPriceTotal;
        if(!s){
            s = '-';
        }
        return s;
    }
    function formatSpend(val,row){
        var s = row.unitPriceTotal;
        if(!s){
            s = '-';
        }
        return s;
    }
    function formatRevenue(val,row){
        var s = row.revenuePriceTotal;
        if(!s){
            s = '-';
        }
        return s;
    }
    function formatInstall(val,row){
        if(row.beInstallTotal==null){
            var s='-';
        }else{
            //var s = row.beInstallTotal+"("+row.testInstallTotal+")";
            var s = row.beInstallTotal;
        }
        return s;
    }
    function formatSuccInstall(val,row){
        if(row.succInstallTotal==null){
            var s='-';
        }else{
            //var s = row.beInstallTotal+"("+row.testInstallTotal+")";
            var s = row.succInstallTotal;
        }
        return s;
    }
    function formatappRevenue(val,row){
        var s = row.inappRevnueTotal;
        if(!s){
            s = '-';
        }
        return s;
    }

    function formatEcpa(val,row){
        var s = row.ecpa;
        s = Math.round(val*100)/100;
        if(!s){
            s = '-';
        }
        return s;
    }
    function formatAEcpa(val,row){
        var s = row.ecpa;
        s = Math.round(val*100)/100;
        if(!s){
            s = '-';
        }
        return s;
    }
    function formatEventEdit(val,row){

    }
    function createCampaign(){
        window.location.href="/pmp/Campaign/Create";
    }

    function DataReport(id){
        var row = $('#comp_list').datagrid('getSelected');
        window.location.href="view_report.php?adid="+row.f_adid+"&cid="+row.f_id;
    }

    function DataROI(id){
        var row = $('#comp_list').datagrid('getSelected');
        window.location.href="index.php?aid="+row.f_adid+"&cid="+row.f_id;
    }

    function Edit(row){
        var row = $('#comp_list').datagrid('getSelected');
        window.location.href="edit_campaign.php?cid="+row.f_id;
    }
    function Detail(row){
        var row = $('#comp_list').datagrid('getSelected');
        window.location.href="detail_campaign.php?cid="+row.f_id;
    }

    function getCompNowData(){
        $('#comp_list').datagrid('load',{date:$('#ndate2').datebox('getValue'),f_mobile:$('#f_mobile2').val(),f_card:$('#f_card2').val()});
    }

    if(document.addEventListener){
        window.addEventListener("load", onDocLoaded, false);
    }else if(document.attachEvent){
        window.attachEvent("onload", onDocLoaded);
    }

</script>
</body>
</html>