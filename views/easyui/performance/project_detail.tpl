
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    {{template "../public/header.tpl"}}
</head>
<body>
<div id="main">
    <div id="main_content">
    <div id="content_area">
        <input type="hidden" name="cid" value="83" />
        <div id="creat_title">
            <span style="margin-left:10px">项目明细</span>
            <div style="float:right">
                <span class="action_button" onclick="return editCampaign();">编辑</span>
            </div>
        </div>
        <div class="creat_area1 creat_area2">
            <div>
                <div class="are_unit are_unitb"><span class="unit_title unit_titleb">组名</span><span>第一单</span></div>
                <div class="are_unit are_unitb"><span class="unit_title unit_titleb">预算</span><span>50000</span></div>
            </div>
        </div>
        <!----------------------------viewreport------------------------------------------------------>
        <div id="search_area" >
            <div style="float:left;margin-left:10px;" id="f_campaign_div" >
                <select  name="f_campaign" id="f_campaign" class="easyui-combobox" style="height:32px;width:210px;" >
                    <option value="" >选择项目</option>
                </select>
            </div>

            <!-- <div style="height:5px;clear:both"></div> -->

            <div class="line-row">

                <div style="float:left;display:block;width:240px;height:32px;margin-left:10px;margin-top:5px;"  id="f_date_div">
                    <div style="float:left">
                        <div class="input-prepend input-group">
                            <span class="add-on input-group-addon"><i class="glyphicon glyphicon-calendar fa fa-calendar"></i></span><input type="text" style="width:200px" name="reservation" id="reservation" class="form-control" value="08/23/2015 - 09/21/2015" />
                        </div>
                    </div>
                    <script type="text/javascript">
                        $(document).ready(function() {
                            $('#reservation').daterangepicker({
                                opens: 'left',
                                //format: 'YYYY-MM-DD',
                                "ranges": {
                                    "Last 7 Days": [
                                        "09/14/2015",
                                        "09/20/2015"
                                    ],
                                    "Last 30 Days": [
                                        "08/22/2015",
                                        "09/20/2015"
                                    ],
                                    "Last Month": [
                                        "08/01/2015",
                                        "08/31/2015"
                                    ]
                                },
                                dateLimit: { days: 60 }
                            }, function(st, ed, label) {
                                start = st.format('YYYY-MM-DD');
                                end = ed.format('YYYY-MM-DD');
                                //console.log(start.toISOString(), end.toISOString(), label);
                            });
                        });
                    </script>
                </div>

            </div>


            <div style="float:left;margin-left:10px">
                <span class="action_button"  onclick="return getChart();">查询</span>
            </div>

            <div style="float:right;margin-left:10px">
                <span class="action_button"  onclick="return fullreport();">综合报表</span>
            </div>
        </div>

        <div id="data_area" class="result_area" style="display:none;">
            <div style="float:left;margin-left:60px;width:1200px;text-align:left;margin-top:20px;"  >
                <span style="font-size:12px;">Y-Axis(L)：</span>
                <select  name="yAxisL" id="yAxis" class="easyui-combobox" style="height:32px;width:180px;" >
                    <!-- <option value="Click" >Choose Count Node</option> -->
                    <option value="Impression">Impression</option>
                    <option value="Click">Click</option>
                    <option value="Spending">Spending</option>
                    <option value="Install" selected="selected">Install</option>
                    <option value="CTR" >CTR</option>
                    <option value="CVR" >CVR</option>
                    <option value="CPM" >CPM</option>
                    <option value="CPC" >CPC</option>
                    <option value="CPI" >CPI</option>
                </select>
            </div>
            <div  style="overflow:auto;overflow-y:hidden;height:450px;width:100%;float:left;padding:0px;margin-top:10px;">
                <div style='height:440px;width:100%;' id="idChart">
                </div>
            </div>

            <!--<div id="idChannel" style="height:450px;width:15%;float:left;z-index:99999;border-left:1px solid #DBDDEA;">
                <div class="c_title" style="padding-left:6px;">Choose the Flight  </div>
                <div class="c_content" id="c_content">

                </div>
            </div>-->
        </div>
        <div id="result_area" style="border:0">
            <table id="comp_list" title="活动列表" style="width:100%;height:90%"
                   data-options="rownumbers:false,singleSelect:true,method:'get'" pagination="true" fitcolumns="true">
                <thead>
                <tr>
                    <th data-options="field:'Name',width:100,formatter:formatName"><b>名称</b></th>
                    <th data-options="field:'Budget',width:120"><b>预算(元)</b></th>
                    <th data-options="field:'Spending',width:120,sortable:true"><b>广告主支出(元)</b></th>
                    <th data-options="field:'Cost',width:120,sortable:true"><b>成本(元)</b></th>
                    <th data-options="field:'Imp',width:80,sortable:true"><b>展示</b></th>
                    <th data-options="field:'Clk',width:80,sortable:true"><b>点击</b></th>
                    <th data-options="field:'Install',width:80,sortable:true"><b>普通激活</b></th>
                    <th data-options="field:'PostbackInstall',width:80,sortable:true"><b>激活</b></th>
                    <th data-options="field:'Register',width:80,sortable:true"><b>注册</b></th>
                    <th data-options="field:'Submit',width:80,sortable:true"><b>申请</b></th>
                    <th data-options="field:'Conversion',width:80,sortable:true"><b>申请成功</b></th>
                    <th data-options="field:'Revenue',width:80,sortable:true"><b>收入</b></th>
                    <th data-options="field:'ECPA',width:80,sortable:true"><b>eCPA</b></th>
                </tr>
                </thead>
            </table>
        </div>
        <div id="setting_dlg" class="easyui-dialog" style="width:520px;height:560px;padding:10px 20px" closed="true" draggable="false" modal="true">
            <form id="setting_edit" action="unit_chk.php?type=1" method="post" enctype="multipart/form-data">
                <table style="font-size:12px;">
                    <tr>
                    <tr style="height:45px;width:95%">
                        <td style="width:25%"><b>Flight Name</b></td>
                        <td style="width:70%"><input type="text" name="f_name" class="f1 easyui-textbox" style="width:310px;height:32px;" readonly ></td>
                    </tr>
                    <tr>
                    <tr style="height:45px;width:95%;" id="f_channel">
                        <td style="width:25%;"><b>Channel</b></td>
                        <td style="width:70%"><select class="easyui-combobox" name="f_channelid" style="width:310px;height:32px;" disabled>
                            <option value="00002">Inmobi</option>
                            <option value="00003">SmartMad</option>
                        </select></td>
                    </tr>
                    <tr style="height:45px;width:95%">
                        <td style="width:25%"><b>Date</b></td>
                        <td style="width:70%">From <input name="f_start" class="easyui-datebox" id="start_date" value="2015-09-21" style="width:120px;height:32px" readonly /> To <input name="f_end" class="easyui-datebox" id="end_date" value="2015-09-28" style="width:120px;height:32px" readonly /></td>
                    </tr>
                    <tr style="height:45px;width:95%">
                        <td style="width:25%"><b>Budget</b></td>
                        <td style="width:70%"><input name="f_day_budget" class="f1 easyui-numberbox" style="width:235px;height:32px;" data-options="max:999999999,precision:2" readonly /></td>
                    </tr>
                    <tr style="height:45px;width:95%">
                        <td style="width:25%"><b>Cost Price</b></td>
                        <td style="width:70%"><input name="f_price" class="f1 easyui-numberbox" style="width:235px;height:32px;" data-options="max:999999999,precision:2" readonly /></td>
                    </tr>
                    <tr style="height:45px;width:95%">
                        <td style="width:25%"><b>Bidding</b></td>
                        <td style="width:70%">
                            <select class="easyui-combobox" name="f_bidding" style="width:235px;height:32px;"  disabled>
                                <option value="2">CPA</option>
                                <option value="1">CPC</option>
                            </select></td>
                    </tr>
                    <tr style="height:45px;width:95%">
                        <td style="width:25%"><b>Geo Tag</b></td>
                        <td style="width:70%">
                            <select class="easyui-combobox" id="f_geotag" name="f_geotag" style="width:310px;height:32px;" data-options="multiple:true" disabled >
                                <option value=""></option>
                            </select>
                    </tr>
                    <tr style="height:45px;width:95%">
                        <td style="width:25%"><b>Install Postback</b></td>
                        <td style="width:70%"><input type="radio" name="f_pbacktag" value="1" checked="checked"  disabled />Attributed Installs<input  type="radio" name="f_pbacktag" value="2" style="margin-left:10px;"  disabled />All Installs</td>
                    </tr>
                    <tr style="height:45px;width:95%">
                        <td style="width:25%"><b>Cost based on</b></td>
                        <td style="width:70%"><input type="radio" name="f_cost_based_on" value="1"  disabled />Performad‘s data<input  type="radio" name="f_cost_based_on" value="2" style="margin-left:10px;"  disabled />Channel’s data</td>
                    </tr>
                    <tr style="height:45px;width:95%">
                        <td style="width:25%"><b>Event Postback</b></td>
                        <td style="width:70%"><input type="checkbox" name="f_eventtag" style="vertical-align: middle;" value="1"  disabled /></td>
                    </tr>
                    <tr style="height:45px;width:95%">
                        <td style="width:25%"><b>Click URL</b></td>
                        <td style="width:70%"><input type="text" class="f1 easyui-textbox" name="f_curl" style="width:280px;height:32px;" onclick="this.select();" value="" />&nbsp;<a href='javascript:showLinkUrl()'>S2S Test</a></td>

                    </tr>
                </table>
            </form>
        </div>
    </div>
</div>

</div>
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
    $('#f_adid').combobox({
        onSelect: function () {
            var adid = $('#f_adid').combobox('getValue');
            $('#f_appid').combobox({
                url:'ajax_getcvid.php?adid='+adid,
                valueField:'id',
                textField:'appStr',
                onLoadSuccess: function () { //加载完成后,设置选中第一项
                    var val = $(this).combobox("getData");
                    for (var item in val[0]) {
                        if (item == "id") {
                            $(this).combobox("select", val[0][item]);
                        }
                    }
                }
            });
        }
    });

    var url;

    function onDocLoaded(){
        //
    }
    $(function(){
        var ustart = "2015-08-23";
        var uend = "2015-09-21";
        unit_list(ustart,uend);
    });
    function unit_list(ustart,uend){
        $('#comp_list').datagrid({
            url:'/pmp/flight?group_id=1',
            view: detailview,
            pageSize:10,
            nowrap:false,
            sortName:"Name",
            showFooter: true,
            sortOrder:"desc",
            rowStyler:function(index,row){
                if (index%2==1){
                    return 'background-color:#F5F7F7;';
                }
            },
            onBeforeLoad:function(param){
                //return false;
            },
            onBeforeRender:function(){
            },
            onLoadError:function(){
            },
            onSelect:function(index,row){
                /*
                 //查看flight
                 var row = $('#comp_list').datagrid('getSelected');
                 $('#setting_dlg').dialog('open').dialog('setTitle','Info');
                 $('#setting_dlg').form('load',row);
                 */
            },
            onLoadSuccess:function(data){
                //setTimeout(function(){$('#comp_list').datagrid('fixRowHeight');},500);
                $(".user_edit_text").linkbutton({ text:'Edit', plain:true, iconCls:'icon-edit'});
                $(".user_import_text").linkbutton({ text:'TTO import', plain:true, iconCls:'icon-add'});
                $(".user_set_text").linkbutton({ text:'Setting', plain:true, iconCls:'icon-redo'});
                $(".user_finish_text").linkbutton({ text:'Finish', plain:true, iconCls:'icon-redo'});
            },
            detailFormatter:function(index,row){
                return '<div class="ddv" style="padding:5px 0"></div>';
            },
            onExpandRow: function(index,row){
//                //console.log(index);
//                //console.log(row);
//                var ddv = $(this).datagrid('getRowDetail',index).find('div.ddv');
//                ddv.panel({
//                    border:false,
//                    cache:false,
//                    href:'get_unit.php?cid=83&act=1&unitid='+row.f_id+'&start='+ustart+'&end='+uend,
//                    onLoad:function(){
//                        $('#comp_list').datagrid('fixDetailRowHeight',index);
//                    }
//                });
//                $('#comp_list').datagrid('fixDetailRowHeight',index);
            }
        });
    }
    function formatExPort(val,row){
        if(val){
            return '<img src="images/export.png" alt="" style="cursor:pointer" onclick="window.location.href=\'d_report.php?cid='+val+'&start_date='+start+'&end_date='+end+'\'">'
        }else{
            return '-';
        }
    }

    function formatDisplay(val,row){
        if(val == 1){
            var s = 'facebook';
        }else if(val == 2){
            var s = 'google adwards';
        }else{
            var s = row.f_channel_name;
        }
        return s;
    }

    function formatBidding(val,row){
        if(val == 1){
            var s = 'CPC';
        }else if(val == 2){
            var s = 'CPA';
        }
        return s;
    }

    function formatStatus(val,row){
        if(val == 1){
            var s = 'Yes';
        }else{
            var s = 'No';
        }
        return s;
    }

    var row_array = [];

    function formatName(val,row){
        if(val=="ft_flg") return '';
        row_array[row.f_id] = row;
        var s = "<a href='javascript:showUinfo("+row.Id+");void(0);'>"+row.Name+"</a>";
        return s;
    }

    function formatAName(val,row,index){
        row.f_name = 'Flight'+(index+1);
        row_array[row.f_id] = row;
        var s = "<a onclick='return showUinfo("+row.f_id+");'>Flight"+(index+1)+"</a>";
        return s;
    }

    window.onscroll = function () {
        $("#setting_dlg").dialog("move", { top: $(document).scrollTop() + ($(window).height() - 560) * 0.5 });
    }

    var show_fn = 0;

    function showLinkUrl(){
        var row = row_array[show_fn];
        if(!row.f_offer_id){
            alert('This flight has not been published!');
            return;
        }
        window.location.href = 's2s.php?oid='+row.f_offer_id;
    }

    function showUinfo(n){
        show_fn = n;
        //var row = $('#comp_list').datagrid('getSelected');
        var row = row_array[n]
        $('#setting_dlg').dialog('open').dialog('setTitle','Info');
        $("#setting_dlg").dialog("move", { top: $(document).scrollTop() + ($(window).height() - 560) * 0.5 });
        $(".window-mask").css({ height: $(document).height()});
        $('#setting_dlg').form('load',row);
        $("#f_geotag").combobox('setValue',row.f_geotag);
    }

    function formatADate(val,row){
        if(val=="Total") return "Total";
        if(row.f_start!=0 && row.f_end!=0){
            var s = row.f_start+"  "+row.f_end;
        }else{
            var s = " - ";
        }
        return s;
    }

    function formatDate(val,row){
        if(val=="Total") return "Total";
        if(row.f_start!=0 && row.f_end!=0){
            var s = row.f_start+" - "+row.f_end;
        }else{
            var s = " - ";
        }
        return s;
    }

    function formatClick(val,row){
        var s = row.beClickTotal;
        if(!s || s==0){
            s = '-';
        }
        return s;
    }

    function formatCost(val,row){
        var s = row.succPriceTotal;
        if(!s || s==0){
            s = '-';
        }
        return s;
    }

    function formatSpend(val,row){
        var s = row.unitPriceTotal;
        if(!s || s==0){
            s = '-';
        }
        return s;
    }

    function formatRevenue(val,row){
        var s = row.revenuePriceTotal;
        if(!s || s==0){
            s = '-';
        }
        return s;
    }

    function formatInstall(val,row){
        var s = row.beInstallTotal;
        if(!s || s==0){
            s = '-';
        }
        return s;
    }

    function formatPInstall(val,row){
        var s = row.succInstallTotal;
        if(!s || s==0){
            s = '-';
        }
        return s;
    }

    function formatEcpc(val,row){
        var s = row.inappRevnueTotal;
        if(!s || s==0){
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

    function formatPstatus(val,row){
        //var timestamp = $.now();
        var myDate = new Date();
        var year = myDate.getFullYear();
        var month = myDate.getMonth()+1;
        if(month<10){
            month = "0"+month;
        }
        var date = myDate.getDate();
        if(date<10){
            date = "0"+date;
        }
        var hour = myDate.getHours();
        var minute = myDate.getMinutes();
        var seconds = myDate.getSeconds();

        var timestamp = year+"-"+month+"-"+date+" "+hour+":"+minute+":"+seconds;

        var time1=row.f_start+" 00:00:00";


        var time2=row.f_end+" 23:59:59";

        if(val=="ft_flg") return '';

        if(val == 3 || (timestamp > time2)){
            var s = "<span style='color:Navy;'>Finished</span>";
        }else if(val == 1 && timestamp >= time1 && timestamp<=time2){
            var s = "<span style='color:Navy;'>Running</span>";
        }else if(val == 1 && timestamp < time1){
            var s = "<span style='color:Navy;'>Planned</span>";
        }else if(val==4){
            var s = "<span style='color:Navy;'>Stopped</span>";
        }else{
            var s = "<span style='color:Navy;'>Draft</span>";
        }

        return s;
    }

    function editCampaign(){
        window.location.href="/pmp/flightGroup/Edit/1";
    }

    function fullreport(){
        window.location.href="/pmp/flightGroup/FullReport/1";
    }

    function getCompNowData(){
        $('#comp_list').datagrid('load',{date:$('#ndate2').datebox('getValue'),f_mobile:$('#f_mobile2').val(),f_card:$('#f_card2').val()});
    }

    var start='08/23/2015';//开始时间
    var end='09/21/2015';//结束时间


    //记录所有的渠道ID
    var channelId = [];

    function getChart(){
        // var aid = $("#f_advertiser").val();

        // var cid = $("#f_campaign").val();
        var aid = $("#f_advertiser").combobox('getValue');
        var cid = $("#f_campaign").combobox('getValue');
        if(!aid){
            $.messager.alert('Info', "Please choose advertiser", 'info');
            return false;
        }
        if(!cid){
            $.messager.alert('Info', "Please choose campaign", 'info');
            return false;
        }

        var ycid = "83";
        if(ycid!=cid){
            window.location.href="detail_campaign.php?cid="+cid;
        }

        var dateType = 0;

        var dateTime = $("#reservation").val();

        var ustart1 = dateTime.split("-")[0].replace(/^\s\s*/, '').replace(/\s\s*$/, '');;
        var ustart2 = ustart1.split("/");
        var ustart = ustart2[2]+"-"+ustart2[0]+"-"+ustart2[1];

        var uend1 = dateTime.split("-")[1].replace(/^\s\s*/, '').replace(/\s\s*$/, '');;
        var uend2 = uend1.split("/");
        var uend = uend2[2]+"-"+uend2[0]+"-"+uend2[1];

        unit_list(ustart,uend);//取unitlist

        //console.log(dateTime);
        $.ajax({
            url: 'tto_campaign.php',
            async: false,
            data: {'aid':aid,'cid':cid,'dateType':dateType,'dateTime':dateTime},
            beforeSend: function(XMLHttpRequest){
                myChart.showLoading({
                    text: 'loading...',
                    effect: 'whirling'
                });
            },
            success:function(d){

                var da = eval("("+d+")");
                //console.log(da.chartData.length);
                if(da.chartData.length > 0){
                    //resetCombobox("xAxis");
                    resetCombobox("yAxis");
                    VDoc("data_area").style.display = "block";
                }else{
                    $.messager.alert('Info', "no info to return", 'info');
                    VDoc("data_area").style.display = "none";
                }
                myChart = echarts.init(VDoc('idChart'));
                var option = {
                    title : {
                        // text: da.channelName,
                    },
                    tooltip : {
                        trigger: 'axis'
                    },
                    legend: {
                        data:da.legendName
                    },
                    calculable : false,
                    xAxis : [
                        {
                            type : 'category',
                            boundaryGap : true,
                            axisLabel : {
                                rotate: 40
                            },
                            data : da.dateRange
                        }
                    ],
                    yAxis : [

                        {
                            name : da.yAxis,
                            type : 'value',
                            splitLine : {
                                show: false
                            }

                        }
                    ],
                    series : da.chartData

                };
                myChart.hideLoading();
                myChart.setOption(option);

                var chtml = "";
                $.each(da.channelList, function(i, item) {
                    _this.channelId.push(i);
                    //console.log(i + '----' + item);
                    //chtml += "<div class='c_change'><input type='checkbox' name='channel' value="+i+"  checked='checked' onclick='changeChart()'/><span>"+item+"</span></div>";
                    //VDoc("c_content").innerHTML = chtml;

                });
            }
        });
        //console.log(aid);

    }


    $('#xAxis').combobox({
        onSelect: function () {
            changeChart();
        }
    });

    $('#yAxis').combobox({
        onSelect: function () {
            changeChart();
        }
    });

    function changeChart(){
        // console.log(v);
        // console.log(o.checked);

        var aid = $("#f_advertiser").combobox('getValue');
        var cid = $("#f_campaign").combobox('getValue');
        if(!aid){
            $.messager.alert('Info', "Please choose advertiser", 'info');
            return false;
        }
        if(!cid){
            $.messager.alert('Info', "Please choose campaign", 'info');
            return false;
        }

        //var xAxis = $("#xAxis").combobox('getValue');
        var yAxis = $("#yAxis").combobox('getValue');

        var dateType = 0;
        var dateTime = $("#reservation").val();
        var unitId = []; //记录有效的媒体渠道(广告单元)
        unitId = channelId;
        /*
         $.each($("input[name='channel']"), function(i, item) {

         if(item.checked){
         //console.log('-------'+item.value);
         unitId.push(item.value);
         }
         });
         */
        //console.log(unitId);

        $.ajax({
            url: 'tto_campaign.php',
            async: false,
            data: {'aid':aid,'cid':cid,'dateType':dateType,'dateTime':dateTime,'yAxis':yAxis,'unitId':unitId.toString(),'isChange':1},
            beforeSend: function(XMLHttpRequest){
                myChart.showLoading({
                    text: 'loading...',
                    effect: 'whirling'
                });
            },
            success:function(d){
                //console.log(d);
                var da = eval("("+d+")");
                //console.log(da.channelName);
                myChart = echarts.init(VDoc('idChart'));
                var option = {
                    title : {
                        // text: da.channelName,
                    },
                    tooltip : {
                        trigger: 'axis'
                    },
                    legend: {
                        data:da.legendName
                    },
                    calculable : false,
                    xAxis : [
                        {
                            type : 'category',
                            boundaryGap : true,
                            axisLabel : {
                                rotate: 40
                            },
                            data : da.dateRange
                        }
                    ],
                    yAxis : [

                        {
                            name : da.yAxis,
                            type : 'value',
                            splitLine : {
                                show: false
                            }

                        }
                    ],
                    series : da.chartData

                };
                myChart.hideLoading();
                myChart.setOption(option);
                //console.log(da.countData);
            }
        });
    }


    function VDoc(id){
        return document.getElementById(id);
    }


    var url;
    var _this=this;

    $('#f_advertiser').combobox({
        onSelect: function () {
            var v = $('#f_advertiser').combobox('getValue');

            if(v){
                $('#f_campaign').combobox({
                    url:'tto_manage.php?type=select&operate=project&fpid='+v,
                    valueField:'f_id',
                    textField:'f_name',
                    onLoadSuccess: function () { //加载完成后,设置选中第一项
                        var val = $(this).combobox("getData");
                        //console.log(val);
                        for (var item in val[0]) {
                            //console.log(val[0][item]);
                            if (item == "f_id") {
                                $(this).combobox("select", val[0][item]);
                            }
                        }
                    }
                });
            }

        }
    });

    var adid = 10;
    var ccid = 83;
    function defaultSelect(){
        if(_this.adid){
            $('#f_campaign').combobox({
                url:'tto_manage.php?type=select&operate=project&fpid='+_this.adid,
                valueField:'f_id',
                textField:'f_name',
                onLoadSuccess: function () { //加载完成后,设置选中第一项
                    var val = $(this).combobox("getData");
                    //console.log(val);
                    for (var item in val) {
                        //console.log(val[item]['f_id']);
                        if (val[item]['f_id'] == _this.ccid) {
                            $(this).combobox("select", val[item]['f_id'] );
                            //console.log("aa");
                        }
                    }
                }
            });
        }
    }

    function defaultChart(){
        var dateType = 0;

        var dateTime = $("#reservation").val();
        $.ajax({
            url: 'tto_campaign.php',
            async: false,
            data: {'aid':_this.adid,'cid':_this.ccid,'dateType':dateType,'dateTime':dateTime},
            success:function(d){

                var da = eval("("+d+")");
                //console.log(da.chartData.length);
                if(da.chartData.length > 0){
                    //resetCombobox("xAxis");
                    resetCombobox("yAxis");
                    VDoc("data_area").style.display = "block";
                }else{
                    //$.messager.alert('Info', "no info to return", 'info');
                    VDoc("data_area").style.display = "none";
                }
                myChart = echarts.init(VDoc('idChart'));
                var option = {
                    title : {
                        // text: da.channelName,
                    },
                    tooltip : {
                        trigger: 'axis'
                    },
                    legend: {
                        data:da.legendName
                    },
                    calculable : false,
                    xAxis : [
                        {
                            type : 'category',
                            boundaryGap : true,
                            axisLabel : {
                                rotate: 40
                            },
                            data : da.dateRange
                        }
                    ],
                    yAxis : [

                        {
                            name : da.yAxis,
                            type : 'value',
                            splitLine : {
                                show: false
                            }

                        }
                    ],
                    series : da.chartData

                };

                myChart.setOption(option);

                var chtml = "";
                $.each(da.channelList, function(i, item) {
                    _this.channelId.push(i);
                    //console.log(i + '----' + item);
                    //chtml += "<div class='c_change'><input type='checkbox' name='channel' value="+i+"  checked='checked' onclick='changeChart()'/><span>"+item+"</span></div>";
                    //VDoc("c_content").innerHTML = chtml;

                });
            }
        });
    }

    //重置下拉框
    function resetCombobox(id){
        if(id == "yAxis"){
            $("#"+id).combobox("select", "Install");
            //$("#"+id).combobox("select", "Click");
        }else{
            $("#"+id).combobox("select", "Install");
        }
    }

    //选择日期
    function changeDate(v){

    }

    function onDocLoaded(){
        defaultSelect();
        defaultChart();
    }

    if(document.addEventListener){
        window.addEventListener("load", onDocLoaded, false);
    }else if(document.attachEvent){
        window.attachEvent("onload", onDocLoaded);
    }

</script>
</body>
</html>