
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

        <div id="search_area">
            <div style="float:left;margin-left:10px">
                <select class="easyui-combobox" name="f_cid" id="f_cid" style="width:230px;height:32px;" >

                </select>
            </div>
            <div style="float:left;margin-left:10px">
                <!--
                <input type="button" id="f_search" name="f_search" class="user_search_button" onclick="return showUserSearch();" value="Search" />
                -->
                <a id="f_search" href="javascript:showUserSearch();" class="easyui-linkbutton" style="height:32px;width:80px;">查询</a>
            </div>

            <div style="float:right;font-size:16px;width:250px;">
                <div style="float:right">
                    <div class="input-prepend input-group" style="height:32px;">
                        <span class="add-on input-group-addon"><i class="glyphicon glyphicon-calendar fa fa-calendar"></i></span><input type="text" style="width: 200px;height:32px;" name="reservation" id="reservation" class="form-control" value="08/23/2015 - 09/21/2015" />
                    </div>
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
                        dateLimit: { days: 180 }
                    }, function(st, ed, label) {
                        start = st.format('YYYY-MM-DD');
                        end = ed.format('YYYY-MM-DD');
                        showUserSearch();
                        //console.log(start.toISOString(), end.toISOString(), label);
                    });
                });
            </script>
        </div>

        <div id="result_area" style="display:none;">
            <div class="easyui-tabs" style="width:1240px;height:487px" id="tabsbox">
                <div title="启动"  style="padding:30px 10px 10px 10px;">
                    <div id="nec_area_start" style="height:400px;width:1220px;float:left;">

                    </div>
                </div>
                <div title="注册"  style="padding:30px 10px 10px 10px;">
                    <div id="nec_area_register" style="height:400px;width:1220px;float:left;">

                    </div>
                </div>
                <div title="申请"  style="padding:30px 10px 10px 10px;">
                    <div id="nec_area_submit" style="height:400px;width:1220px;float:left;">

                    </div>
                </div>
                <div title="转化"  style="padding:30px 10px 10px 10px;">
                    <div id="nec_area_conversion" style="height:400px;width:1220px;float:left;">

                    </div>
                </div>
                <div title="收入"  style="padding:30px 10px 10px 10px;">
                    <div id="nec_area_iap" style="height:400px;width:1220px;float:left;">

                    </div>
                </div>
                <div title="投资回报率" style="padding:30px 10px 10px 10px;" selected="true">
                    <div id="ec_area_roi" style="height:400px;width:1220px;float:left;">

                    </div>
                </div>
            </div>
            <div id="channelbox" style="display:none;">
                <div class="c_title">Choose the Flight</div>
                <div class="c_content">

                </div>
            </div>
            <div id="eventflightbox" style="display:none;">
                <select name="eventflight" id="eventflight" style="width:120px;height:30px;">
                    <option value="all">all Flight</option>
                    <option value="168">Mobpartner</option>
                    <option value="169">MobileCore</option>
                    <option value="170">Leadbolt</option>
                    <option value="171">Komli</option>
                    <option value="172">ArtOfClick</option>
                </select>
            </div>
            <div id="labelbox" style="display:none;">
                <select name="lable" id="label" style="width:120px;height:30px;">

                </select>
            </div>

            <div class="datelimitbox3" style="right:70px">
                <select name="rio" id="roitype"><option value="1">投资回报率</option><option value="2">收入</option></select>
            </div>

            <div class="cohort_control" style="display:none;">
                <div class="cohort_control_s" style="width:240px;">
                    Metric <select name="cohortretention" id="cohortretention" style="width:150px;height:30px;">
                    <option value="1">User Retention</option>
                    <option value="2">Register</option>
                    <option value="3">Revenue</option>
                    <option value="4">Revenue per install</option>
                    <option value="5">Event</option>
                    <option value="6">Event per install</option>
                    <option value="7">Open</option>
                    <option value="8">Open per install</option>
                </select>
                </div>
                <div class="cohort_control_s" id="cohorttimesbox" style="width:390px;">
                    Retention as Session at Least <select name="cohorttimes" id="cohorttimes" style="width:120px;height:30px;">
                    <option value="1">One Time</option>
                    <option value="2">Two Times</option>
                </select>
                </div>
                <!--
                <div class="cohort_control_s" style="width:240px;">
                   Group By <select name="cohortgroup" id="cohortgroup" style="width:120px;height:30px;">
                       <option value="1">Channel</option>
                       <option value="2">Country</option>
                   </select>
                </div>
                -->
                <div class="cohort_control_s">
                    <input type="button" name="f_search" class="time_search_button7" value="DAY" onclick="return getcodtype(1);"/><input type="button" name="f_search" class="time_search_button8" value="WEEK"  onclick="return getcodtype(2);"/><input type="button" name="f_search" class="time_search_button9" value="MONTH" onclick="return getcodtype(3);"/>
                </div>
            </div>
            <div class="payback_control" style="display:none;">
                <div class="payback_control_s" style="width:240px;">
                    <select name="paybackselect" id="paybackselect" style="width:190px;height:30px;">
                        <!--
                        <option value="1">Mobvista</option>
                        <option value="2">Rippte</option>
                        -->
                        <option value="">Choose flight</option>
                        <option value="168">Mobpartner</option>
                        <option value="169">MobileCore</option>
                        <option value="170">Leadbolt</option>
                        <option value="171">Komli</option>
                        <option value="172">ArtOfClick</option>
                    </select>
                </div>
            </div>
            <div class="payback_control_rb" style="display:block;">

            </div>
        </div>
        <div class="tablearea" style="display:none;">
            <div>
                <table width='100%' bordercolor='#ccc'  border='0' style="border:1px solid #aaa;border-bottom:0px;" cellspacing='0' cellpadding='0'>
                    <tr>
                        <td  style="width:15%;height:45px;border-right:1px solid #aaa;" class="tablename">Cohort Type</td>
                        <td  style="width:85%;height:45px;" class=""></td>
                    </tr>
                </table>
            </div>
            <div class="cohort_top_menu" style="display:none;">
                <div style="position:absolute;left:200px;top:10px;">
                    <select name="cohorttbale" id="cohorttbale" style="width:120px;height:30px;">
                        <option value="1">channel</option>
                        <option value="2">date</option>
                    </select>
                </div>
                <div style='position:absolute;right:20px;top:15px;'>
                    <a style='width:40px;border-bottom:3px solid #ccc;float:left;' id='co_button1' href='javascript:void(0);' onclick='return cohort_table_get(1)'>New</a><a style='width:40px;border-bottom:3px solid #4D3667;float:left;'  id='co_button2' href='javascript:void(0);' onclick='return cohort_table_get(2)'>All</a>
                    <!--
                    <input type='button' value='Expert' style='background-color:#4D3667;color:#fff;width:100px;height:25px;border:0px;margin-top:-5px;margin-left:5px;'>
                    -->
                </div>
            </div>
            <div style="clear:both;"></div>
            <div id="tablebox" style="height:400px;overflow-x:scroll;overflow-y:scroll;">
                <!--table content-->
            </div>
            <div style="margin-top:10px;display:none;" class="cohort_bottom_menu">
                <div style="width:600px;float:left;text-align:left;"><span style="margin-right:10px;color:#000;">Showing</span><input type="radio" name="tradio" value="1" checked="checked"><span style="margin-right:10px;">% of total</span><input type="radio" name="tradio" value="2">% of Previous</div>
                <div style="width:600px;float:right;text-align:right;"><span style="margin-right:10px;">Highlight drops over</span><select><option>5%</option><option>10%</option></select></div>
            </div>
        </div>
    </div>
</div>

</div>
<script type="text/javascript">
    var myChart1 = echarts.init(VDoc('ec_area_roi'));
    var start='2015-08-23';//开始时间
    var end='2015-09-21';//结束时间
    var channel="";
    var currenttitle = "iap";
    var roilimit= "7";//Revenue的时间段
    var roitype = "1";
    var retentionlimit= "1";//留存的期限

    /*cohort*/
    var co_act="1";
    var co_dtype="1";
    var co_group="1";
    var co_times="1";
    var dataType="2";
    var co_tmptype ="1";

    /*conversion event*/
    var sflight = "all";
    var slabel = "";
    var data_url="";

    function VDoc(id){
        return document.getElementById(id);
    }

    function showDiv(d){
        VDoc(d).style.display = 'block';
    }

    function closeDiv(d){
        VDoc(d).style.display = 'none';
    }

    function getJsonData(jData){
        // return JSON.parse(jData);
        return eval("(function(){return " + jData + ";})()");
    }

    var evid_js = '[{"f_id":"48","f_event_en":"iap","f_event_name":"iap","f_status":"1","f_sort":"4"},{"f_id":"47","f_event_en":"pay","f_event_name":"pay","f_status":"1","f_sort":"3"},{"f_id":"46","f_event_en":"start","f_event_name":"start","f_status":"1","f_sort":"2"}]';

    function getEvidByName(name){
        var ev_obj = getJsonData(evid_js);
        for(var s in ev_obj){
            if(ev_obj[s].f_event_en==name) return  ev_obj[s].f_id;
        }
        return 0;
    }

    function showUserSearch(){
        //$("#result_area").show();


        var aid = $("#f_pid").combobox('getValue');
        var cid = $("#f_cid").combobox('getValue');

        var dateTime = $("#reservation").val();
        var ustart1 = dateTime.split("-")[0].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        var ustart2 = ustart1.split("/");
        var start = ustart2[2]+"-"+ustart2[0]+"-"+ustart2[1];

        var uend1 = dateTime.split("-")[1].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        var uend2 = uend1.split("/");
        var end = uend2[2]+"-"+uend2[0]+"-"+uend2[1];

        if(cid=="" || cid=="Choose Campaign"){
            alert("Please Choose Campaign!");
            return;
        }else{
            window.location.href="index.php?cid="+cid+"&start="+start+"&end="+end+"&aid="+aid;
        }
    }

    var cidval = "70";
    if(cidval){
        $("#result_area").show();
        getChannels(cidval);
    }

    function getChannels(cvid){
        //var cvid = $("#f_cvid").val();
        var cvid = "70";
        jQuery.ajax({
            type: "get",
            url: "/pmp/flight",
            data:"cvid="+cvid,
            cache:false,
            beforeSend: function(XMLHttpRequest){
            },
            success: function(data, textStatus){
//                var chtml ="";
//                var checkvalues = "";
//                var json =(new Function("","return "+data))();
//                for(var i=0;i<=(json.rows.length-1);i++){
//                    chtml += "<div class='c_change'><input type='checkbox' name='channel' value="+json.rows[i].f_id+"  checked='checked' onclick='selectchannel(this)'/><span>"+json.rows[i].f_name+"</span></div>";
//                    checkvalues += json.rows[i].f_id+",";
//                }
//                channel = checkvalues;//默认全部channel
//                channel = channel.substring(0,channel.length-1);
//                //$(".c_content").html(chtml);
//                //$("#channelbox").show();
//                if(currenttitle=="roi"){
//                    getRoi(cvid,channel,roilimit,roitype);
//                }else if(currenttitle=="payback"){
//                    getPayback(cvid,uid="");
//                }else{
//                    getConversion(cvid,channel,currenttitle,sflight,slabel);//获取conversion
//                }
            },
            complete: function(XMLHttpRequest, textStatus){
            },
            error: function(){
                //请求出错处理
            }
        });

    }

    function showLazyAjax(data_url,myChart,title){
        if(title=='pay'){
            var name_y = 'value($)';
            var tablename = "In-app Revenue";
        }else{
            var name_y = '';
            var tablename = "Conversion";
        }

        var startData = ''
        jQuery.ajax({
            type: "get",
            url: "/pmp/flight",
            data:data_url,
            cache:false,
            beforeSend: function(XMLHttpRequest){
                myChart.showLoading({
                    text: 'loading...',
                    effect: 'whirling'
                });
            },
            success: function(data, textStatus){
                var date_array=[];
                var series_array=[];
                var key_array = [];
                var channel_array = [];
                var tkey = 0;
                var tablehtml = "<table width='100%' bordercolor='#ccc' border='1' cellspacing='0' cellpadding='0'><tr class='tbodyc' style='background-color:#86CEFA'><td style='color:white'>Channel</td><td style='color:white'>"+tablename+"</td><td style='color:white'>"+tablename+" %</td></tr>";

                var iapData = '{"result":1,"msg":"\u6210\u529f","total":5,"rows":{"Mobpartner":[{"f_date":"2015-07-01","f_nums":"0.00"},{"f_date":"2015-07-02","f_nums":"0.00"},{"f_date":"2015-07-03","f_nums":"0.00"},{"f_date":"2015-07-04","f_nums":"546.00"},{"f_date":"2015-07-05","f_nums":"548.80"},{"f_date":"2015-07-06","f_nums":"546.00"},{"f_date":"2015-07-07","f_nums":"554.40"},{"f_date":"2015-07-08","f_nums":"537.60"},{"f_date":"2015-07-09","f_nums":"548.80"},{"f_date":"2015-07-10","f_nums":"557.20"},{"f_date":"2015-07-11","f_nums":"1170.00"},{"f_date":"2015-07-12","f_nums":"1164.00"},{"f_date":"2015-07-13","f_nums":"1134.00"},{"f_date":"2015-07-14","f_nums":"0.00"},{"f_date":"2015-07-15","f_nums":"0.00"},{"f_date":"2015-07-16","f_nums":"0.00"},{"f_date":"2015-07-17","f_nums":"0.00"},{"f_date":"2015-07-18","f_nums":"0.00"},{"f_date":"2015-07-19","f_nums":"0.00"},{"f_date":"2015-07-20","f_nums":"0.00"},{"f_date":"2015-07-21","f_nums":"0.00"},{"f_date":"2015-07-22","f_nums":"0.00"},{"f_date":"2015-07-23","f_nums":"0.00"},{"f_date":"2015-07-24","f_nums":"0.00"},{"f_date":"2015-07-25","f_nums":"0.00"},{"f_date":"2015-07-26","f_nums":"0.00"},{"f_date":"2015-07-27","f_nums":"0.00"},{"f_date":"2015-07-28","f_nums":"0.00"},{"f_date":"2015-07-29","f_nums":"0.00"},{"f_date":"2015-07-30","f_nums":"0.00"},{"f_date":"2015-07-31","f_nums":"0.00"}],"MobileCore":[{"f_date":"2015-07-01","f_nums":"0.00"},{"f_date":"2015-07-02","f_nums":"0.00"},{"f_date":"2015-07-03","f_nums":"0.00"},{"f_date":"2015-07-04","f_nums":"570.00"},{"f_date":"2015-07-05","f_nums":"570.00"},{"f_date":"2015-07-06","f_nums":"570.00"},{"f_date":"2015-07-07","f_nums":"570.00"},{"f_date":"2015-07-08","f_nums":"2400.00"},{"f_date":"2015-07-09","f_nums":"2392.00"},{"f_date":"2015-07-10","f_nums":"1600.00"},{"f_date":"2015-07-11","f_nums":"1600.00"},{"f_date":"2015-07-12","f_nums":"1600.00"},{"f_date":"2015-07-13","f_nums":"1600.00"},{"f_date":"2015-07-14","f_nums":"1600.00"},{"f_date":"2015-07-15","f_nums":"1600.00"},{"f_date":"2015-07-16","f_nums":"1600.00"},{"f_date":"2015-07-17","f_nums":"1600.00"},{"f_date":"2015-07-18","f_nums":"1600.00"},{"f_date":"2015-07-19","f_nums":"1600.00"},{"f_date":"2015-07-20","f_nums":"1600.00"},{"f_date":"2015-07-21","f_nums":"1600.00"},{"f_date":"2015-07-22","f_nums":"1600.00"},{"f_date":"2015-07-23","f_nums":"1600.00"},{"f_date":"2015-07-24","f_nums":"1600.00"},{"f_date":"2015-07-25","f_nums":"1600.00"},{"f_date":"2015-07-26","f_nums":"1600.00"},{"f_date":"2015-07-27","f_nums":"1600.00"},{"f_date":"2015-07-28","f_nums":"1600.00"},{"f_date":"2015-07-29","f_nums":"1600.00"},{"f_date":"2015-07-30","f_nums":"1600.00"},{"f_date":"2015-07-31","f_nums":"1592.00"}],"Leadbolt":[{"f_date":"2015-07-01","f_nums":"0.00"},{"f_date":"2015-07-02","f_nums":"0.00"},{"f_date":"2015-07-03","f_nums":"0.00"},{"f_date":"2015-07-04","f_nums":"0.00"},{"f_date":"2015-07-05","f_nums":"933.10"},{"f_date":"2015-07-06","f_nums":"939.30"},{"f_date":"2015-07-07","f_nums":"926.90"},{"f_date":"2015-07-08","f_nums":"3322.00"},{"f_date":"2015-07-09","f_nums":"3322.00"},{"f_date":"2015-07-10","f_nums":"5200.00"},{"f_date":"2015-07-11","f_nums":"5200.00"},{"f_date":"2015-07-12","f_nums":"5200.00"},{"f_date":"2015-07-13","f_nums":"5200.00"},{"f_date":"2015-07-14","f_nums":"5200.00"},{"f_date":"2015-07-15","f_nums":"7875.00"},{"f_date":"2015-07-16","f_nums":"7875.00"},{"f_date":"2015-07-17","f_nums":"7875.00"},{"f_date":"2015-07-18","f_nums":"7875.00"},{"f_date":"2015-07-19","f_nums":"7860.00"},{"f_date":"2015-07-20","f_nums":"9826.00"},{"f_date":"2015-07-21","f_nums":"9826.00"},{"f_date":"2015-07-22","f_nums":"9826.00"},{"f_date":"2015-07-23","f_nums":"9826.00"},{"f_date":"2015-07-24","f_nums":"9826.00"},{"f_date":"2015-07-25","f_nums":"9826.00"},{"f_date":"2015-07-26","f_nums":"9826.00"},{"f_date":"2015-07-27","f_nums":"9826.00"},{"f_date":"2015-07-28","f_nums":"9826.00"},{"f_date":"2015-07-29","f_nums":"9826.00"},{"f_date":"2015-07-30","f_nums":"9826.00"},{"f_date":"2015-07-31","f_nums":"9826.00"}],"Komli":[{"f_date":"2015-07-01","f_nums":"0.00"},{"f_date":"2015-07-02","f_nums":"0.00"},{"f_date":"2015-07-03","f_nums":"0.00"},{"f_date":"2015-07-04","f_nums":"0.00"},{"f_date":"2015-07-05","f_nums":"880.00"},{"f_date":"2015-07-06","f_nums":"880.00"},{"f_date":"2015-07-07","f_nums":"880.00"},{"f_date":"2015-07-08","f_nums":"880.00"},{"f_date":"2015-07-09","f_nums":"4800.00"},{"f_date":"2015-07-10","f_nums":"6286.00"},{"f_date":"2015-07-11","f_nums":"6272.00"},{"f_date":"2015-07-12","f_nums":"6286.00"},{"f_date":"2015-07-13","f_nums":"6286.00"},{"f_date":"2015-07-14","f_nums":"6286.00"},{"f_date":"2015-07-15","f_nums":"9456.00"},{"f_date":"2015-07-16","f_nums":"9456.00"},{"f_date":"2015-07-17","f_nums":"9472.00"},{"f_date":"2015-07-18","f_nums":"9456.00"},{"f_date":"2015-07-19","f_nums":"9456.00"},{"f_date":"2015-07-20","f_nums":"11232.00"},{"f_date":"2015-07-21","f_nums":"11250.00"},{"f_date":"2015-07-22","f_nums":"11250.00"},{"f_date":"2015-07-23","f_nums":"11250.00"},{"f_date":"2015-07-24","f_nums":"11250.00"},{"f_date":"2015-07-25","f_nums":"11250.00"},{"f_date":"2015-07-26","f_nums":"11250.00"},{"f_date":"2015-07-27","f_nums":"11250.00"},{"f_date":"2015-07-28","f_nums":"11250.00"},{"f_date":"2015-07-29","f_nums":"11250.00"},{"f_date":"2015-07-30","f_nums":"11250.00"},{"f_date":"2015-07-31","f_nums":"11250.00"}],"ArtOfClick":[{"f_date":"2015-07-01","f_nums":"0.00"},{"f_date":"2015-07-02","f_nums":"0.00"},{"f_date":"2015-07-03","f_nums":"0.00"},{"f_date":"2015-07-04","f_nums":"798.00"},{"f_date":"2015-07-05","f_nums":"798.00"},{"f_date":"2015-07-06","f_nums":"800.00"},{"f_date":"2015-07-07","f_nums":"4800.00"},{"f_date":"2015-07-08","f_nums":"4800.00"},{"f_date":"2015-07-09","f_nums":"4800.00"},{"f_date":"2015-07-10","f_nums":"4200.00"},{"f_date":"2015-07-11","f_nums":"4188.00"},{"f_date":"2015-07-12","f_nums":"4200.00"},{"f_date":"2015-07-13","f_nums":"4200.00"},{"f_date":"2015-07-14","f_nums":"4200.00"},{"f_date":"2015-07-15","f_nums":"4200.00"},{"f_date":"2015-07-16","f_nums":"3500.00"},{"f_date":"2015-07-17","f_nums":"3500.00"},{"f_date":"2015-07-18","f_nums":"3500.00"},{"f_date":"2015-07-19","f_nums":"3500.00"},{"f_date":"2015-07-20","f_nums":"2500.00"},{"f_date":"2015-07-21","f_nums":"2500.00"},{"f_date":"2015-07-22","f_nums":"2250.00"},{"f_date":"2015-07-23","f_nums":"2250.00"},{"f_date":"2015-07-24","f_nums":"2250.00"},{"f_date":"2015-07-25","f_nums":"2250.00"},{"f_date":"2015-07-26","f_nums":"2250.00"},{"f_date":"2015-07-27","f_nums":"2241.00"},{"f_date":"2015-07-28","f_nums":"2250.00"},{"f_date":"2015-07-29","f_nums":"2250.00"},{"f_date":"2015-07-30","f_nums":"2241.00"},{"f_date":"2015-07-31","f_nums":"2250.00"}]},"f_total":547766.1,"table":{"Mobpartner":7306.8,"MobileCore":42264,"Leadbolt":192715.3,"Komli":222014,"ArtOfClick":83466}}';
                var startData = '{"result":1,"msg":"\u6210\u529f","total":5,"rows":{"Mobpartner":[{"f_date":"2015-07-01","f_nums":"194.00"},{"f_date":"2015-07-02","f_nums":"196.00"},{"f_date":"2015-07-03","f_nums":"193.00"},{"f_date":"2015-07-04","f_nums":"195.00"},{"f_date":"2015-07-05","f_nums":"196.00"},{"f_date":"2015-07-06","f_nums":"195.00"},{"f_date":"2015-07-07","f_nums":"198.00"},{"f_date":"2015-07-08","f_nums":"192.00"},{"f_date":"2015-07-09","f_nums":"196.00"},{"f_date":"2015-07-10","f_nums":"199.00"},{"f_date":"2015-07-11","f_nums":"195.00"},{"f_date":"2015-07-12","f_nums":"194.00"},{"f_date":"2015-07-13","f_nums":"189.00"},{"f_date":"2015-07-14","f_nums":"0.00"},{"f_date":"2015-07-15","f_nums":"0.00"},{"f_date":"2015-07-16","f_nums":"0.00"},{"f_date":"2015-07-17","f_nums":"0.00"},{"f_date":"2015-07-18","f_nums":"0.00"},{"f_date":"2015-07-19","f_nums":"0.00"},{"f_date":"2015-07-20","f_nums":"0.00"},{"f_date":"2015-07-21","f_nums":"0.00"},{"f_date":"2015-07-22","f_nums":"0.00"},{"f_date":"2015-07-23","f_nums":"0.00"},{"f_date":"2015-07-24","f_nums":"0.00"},{"f_date":"2015-07-25","f_nums":"0.00"},{"f_date":"2015-07-26","f_nums":"0.00"},{"f_date":"2015-07-27","f_nums":"0.00"},{"f_date":"2015-07-28","f_nums":"0.00"},{"f_date":"2015-07-29","f_nums":"0.00"},{"f_date":"2015-07-30","f_nums":"0.00"},{"f_date":"2015-07-31","f_nums":"0.00"}],"MobileCore":[{"f_date":"2015-07-01","f_nums":"300.00"},{"f_date":"2015-07-02","f_nums":"300.00"},{"f_date":"2015-07-03","f_nums":"300.00"},{"f_date":"2015-07-04","f_nums":"300.00"},{"f_date":"2015-07-05","f_nums":"300.00"},{"f_date":"2015-07-06","f_nums":"300.00"},{"f_date":"2015-07-07","f_nums":"300.00"},{"f_date":"2015-07-08","f_nums":"300.00"},{"f_date":"2015-07-09","f_nums":"300.00"},{"f_date":"2015-07-10","f_nums":"200.00"},{"f_date":"2015-07-11","f_nums":"200.00"},{"f_date":"2015-07-12","f_nums":"200.00"},{"f_date":"2015-07-13","f_nums":"200.00"},{"f_date":"2015-07-14","f_nums":"200.00"},{"f_date":"2015-07-15","f_nums":"200.00"},{"f_date":"2015-07-16","f_nums":"200.00"},{"f_date":"2015-07-17","f_nums":"200.00"},{"f_date":"2015-07-18","f_nums":"200.00"},{"f_date":"2015-07-19","f_nums":"200.00"},{"f_date":"2015-07-20","f_nums":"200.00"},{"f_date":"2015-07-21","f_nums":"200.00"},{"f_date":"2015-07-22","f_nums":"200.00"},{"f_date":"2015-07-23","f_nums":"200.00"},{"f_date":"2015-07-24","f_nums":"200.00"},{"f_date":"2015-07-25","f_nums":"200.00"},{"f_date":"2015-07-26","f_nums":"200.00"},{"f_date":"2015-07-27","f_nums":"200.00"},{"f_date":"2015-07-28","f_nums":"200.00"},{"f_date":"2015-07-29","f_nums":"200.00"},{"f_date":"2015-07-30","f_nums":"200.00"},{"f_date":"2015-07-31","f_nums":"200.00"}],"Leadbolt":[{"f_date":"2015-07-01","f_nums":"389.00"},{"f_date":"2015-07-02","f_nums":"301.00"},{"f_date":"2015-07-03","f_nums":"299.00"},{"f_date":"2015-07-04","f_nums":"301.00"},{"f_date":"2015-07-05","f_nums":"301.00"},{"f_date":"2015-07-06","f_nums":"303.00"},{"f_date":"2015-07-07","f_nums":"300.00"},{"f_date":"2015-07-08","f_nums":"302.00"},{"f_date":"2015-07-09","f_nums":"302.00"},{"f_date":"2015-07-10","f_nums":"400.00"},{"f_date":"2015-07-11","f_nums":"400.00"},{"f_date":"2015-07-12","f_nums":"400.00"},{"f_date":"2015-07-13","f_nums":"400.00"},{"f_date":"2015-07-14","f_nums":"400.00"},{"f_date":"2015-07-15","f_nums":"525.00"},{"f_date":"2015-07-16","f_nums":"525.00"},{"f_date":"2015-07-17","f_nums":"525.00"},{"f_date":"2015-07-18","f_nums":"525.00"},{"f_date":"2015-07-19","f_nums":"525.00"},{"f_date":"2015-07-20","f_nums":"578.00"},{"f_date":"2015-07-21","f_nums":"579.00"},{"f_date":"2015-07-22","f_nums":"579.00"},{"f_date":"2015-07-23","f_nums":"578.00"},{"f_date":"2015-07-24","f_nums":"578.00"},{"f_date":"2015-07-25","f_nums":"578.00"},{"f_date":"2015-07-26","f_nums":"578.00"},{"f_date":"2015-07-27","f_nums":"578.00"},{"f_date":"2015-07-28","f_nums":"578.00"},{"f_date":"2015-07-29","f_nums":"578.00"},{"f_date":"2015-07-30","f_nums":"578.00"},{"f_date":"2015-07-31","f_nums":"578.00"}],"Komli":[{"f_date":"2015-07-01","f_nums":"400.00"},{"f_date":"2015-07-02","f_nums":"400.00"},{"f_date":"2015-07-03","f_nums":"400.00"},{"f_date":"2015-07-04","f_nums":"400.00"},{"f_date":"2015-07-05","f_nums":"400.00"},{"f_date":"2015-07-06","f_nums":"400.00"},{"f_date":"2015-07-07","f_nums":"400.00"},{"f_date":"2015-07-08","f_nums":"400.00"},{"f_date":"2015-07-09","f_nums":"400.00"},{"f_date":"2015-07-10","f_nums":"449.00"},{"f_date":"2015-07-11","f_nums":"449.00"},{"f_date":"2015-07-12","f_nums":"450.00"},{"f_date":"2015-07-13","f_nums":"449.00"},{"f_date":"2015-07-14","f_nums":"450.00"},{"f_date":"2015-07-15","f_nums":"592.00"},{"f_date":"2015-07-16","f_nums":"591.00"},{"f_date":"2015-07-17","f_nums":"593.00"},{"f_date":"2015-07-18","f_nums":"591.00"},{"f_date":"2015-07-19","f_nums":"592.00"},{"f_date":"2015-07-20","f_nums":"625.00"},{"f_date":"2015-07-21","f_nums":"625.00"},{"f_date":"2015-07-22","f_nums":"625.00"},{"f_date":"2015-07-23","f_nums":"625.00"},{"f_date":"2015-07-24","f_nums":"625.00"},{"f_date":"2015-07-25","f_nums":"625.00"},{"f_date":"2015-07-26","f_nums":"625.00"},{"f_date":"2015-07-27","f_nums":"625.00"},{"f_date":"2015-07-28","f_nums":"625.00"},{"f_date":"2015-07-29","f_nums":"625.00"},{"f_date":"2015-07-30","f_nums":"625.00"},{"f_date":"2015-07-31","f_nums":"625.00"}],"ArtOfClick":[{"f_date":"2015-07-01","f_nums":"400.00"},{"f_date":"2015-07-02","f_nums":"400.00"},{"f_date":"2015-07-03","f_nums":"400.00"},{"f_date":"2015-07-04","f_nums":"400.00"},{"f_date":"2015-07-05","f_nums":"399.00"},{"f_date":"2015-07-06","f_nums":"400.00"},{"f_date":"2015-07-07","f_nums":"400.00"},{"f_date":"2015-07-08","f_nums":"400.00"},{"f_date":"2015-07-09","f_nums":"400.00"},{"f_date":"2015-07-10","f_nums":"350.00"},{"f_date":"2015-07-11","f_nums":"350.00"},{"f_date":"2015-07-12","f_nums":"350.00"},{"f_date":"2015-07-13","f_nums":"350.00"},{"f_date":"2015-07-14","f_nums":"350.00"},{"f_date":"2015-07-15","f_nums":"350.00"},{"f_date":"2015-07-16","f_nums":"350.00"},{"f_date":"2015-07-17","f_nums":"350.00"},{"f_date":"2015-07-18","f_nums":"350.00"},{"f_date":"2015-07-19","f_nums":"350.00"},{"f_date":"2015-07-20","f_nums":"250.00"},{"f_date":"2015-07-21","f_nums":"250.00"},{"f_date":"2015-07-22","f_nums":"250.00"},{"f_date":"2015-07-23","f_nums":"250.00"},{"f_date":"2015-07-24","f_nums":"250.00"},{"f_date":"2015-07-25","f_nums":"250.00"},{"f_date":"2015-07-26","f_nums":"250.00"},{"f_date":"2015-07-27","f_nums":"250.00"},{"f_date":"2015-07-28","f_nums":"250.00"},{"f_date":"2015-07-29","f_nums":"250.00"},{"f_date":"2015-07-30","f_nums":"250.00"},{"f_date":"2015-07-31","f_nums":"250.00"}]},"f_total":50398,"table":{"Mobpartner":2532,"MobileCore":7100,"Leadbolt":14361,"Komli":16306,"ArtOfClick":10099}}';
                if (title == 'start') {
                    data = startData;
                } else if (title == 'iap') {
                    data = iapData;
                } else {
                    data = startData;
                }

                var json = JSON.parse(data)
                $.each(json.table, function(i, item) {
                    tkey ++ ;
                    if(tablename=="In-app Revenue"){
                        nitem = "$ "+item;
                    }else{
                        nitem = item;
                    }
                    if(item==0||json.f_total==0){
                        var pernum = 0;
                    }else{
                        var pernum = item/json.f_total;
                    }
                    if(tkey%2==0){
                        tablehtml += "<tr class='tbodyb'><td>"+i+"</td><td>"+nitem+"</td><td>"+(pernum*100).toFixed(2)+"%</td></tr>";
                    }else{
                        tablehtml += "<tr class='tbody'><td>"+i+"</td><td>"+nitem+"</td><td>"+(pernum*100).toFixed(2)+"%</td></tr>";
                    }
                });
                tablehtml += "</table>";

                $.each(json.rows, function(i, item) {
                    key_array.push(i);
                });
                for(var i=0;i<(key_array.length);i++){
                    for(var j=0;j<=(json.rows[key_array[i]].length-1);j++){
                        date_array.push(json.rows[key_array[i]][j].f_date);
                    }
                    break;
                }
                for(var i=0;i<(key_array.length);i++){
                    channel_array.push(key_array[i]);
                    var newdata=[];
                    for(var j=0;j<=(json.rows[key_array[i]].length-1);j++){
                        newdata.push(json.rows[key_array[i]][j].f_nums);
                    }
                    var newobj = {name:key_array[i],type:"line",data:newdata,smooth:true};
                    series_array.push(newobj);
                }
                var option = {
                    tooltip: {
                        show: true
                    },
                    legend: {
                        //y:'bottom',
                        data:channel_array
                    },
                    xAxis : [
                        {
                            type : 'category',
                            axisLabel : {
                                rotate: 40
                            },
                            data : date_array
                        }
                    ],
                    yAxis : [
                        {
                            name:name_y,
                            type : 'value'
                        }
                    ],
                    series : series_array
                };


                myChart.hideLoading();

                myChart.setOption(option);

                /*
                 setTimeout(function(){
                 myChart.hideLoading();
                 },1000);
                 */

                showtable(title,tablehtml);//表格数据
            },
            complete: function(XMLHttpRequest, textStatus){

            },
            error: function(){
                //请求出错处理
            }
        });
    }


    function getConversion(cvid,channel,title,sflight,slabel){

        //console.log(cvid+"=="+channel+"=="+title+"=="+sflight+"=="+slabel);

        var areaid = 'nec_area_'+title;
        var myChart = echarts.init(VDoc(areaid));

        var lcvid ="0b73fd9d81db8e5c";

        //sflight = $("#eventflight").combobox('getValue');

        jQuery.ajax({
            type: "get",
            url: "/pmp/flight",
            data:"cvid="+lcvid+"&action="+title,
            success: function(data, textStatus){
                data = '{"result":1,"msg":"\u6210\u529f","total":5,"rows":{"Mobpartner":[{"f_date":"2015-07-01","f_nums":"0.00"},{"f_date":"2015-07-02","f_nums":"0.00"},{"f_date":"2015-07-03","f_nums":"0.00"},{"f_date":"2015-07-04","f_nums":"546.00"},{"f_date":"2015-07-05","f_nums":"548.80"},{"f_date":"2015-07-06","f_nums":"546.00"},{"f_date":"2015-07-07","f_nums":"554.40"},{"f_date":"2015-07-08","f_nums":"537.60"},{"f_date":"2015-07-09","f_nums":"548.80"},{"f_date":"2015-07-10","f_nums":"557.20"},{"f_date":"2015-07-11","f_nums":"1170.00"},{"f_date":"2015-07-12","f_nums":"1164.00"},{"f_date":"2015-07-13","f_nums":"1134.00"},{"f_date":"2015-07-14","f_nums":"0.00"},{"f_date":"2015-07-15","f_nums":"0.00"},{"f_date":"2015-07-16","f_nums":"0.00"},{"f_date":"2015-07-17","f_nums":"0.00"},{"f_date":"2015-07-18","f_nums":"0.00"},{"f_date":"2015-07-19","f_nums":"0.00"},{"f_date":"2015-07-20","f_nums":"0.00"},{"f_date":"2015-07-21","f_nums":"0.00"},{"f_date":"2015-07-22","f_nums":"0.00"},{"f_date":"2015-07-23","f_nums":"0.00"},{"f_date":"2015-07-24","f_nums":"0.00"},{"f_date":"2015-07-25","f_nums":"0.00"},{"f_date":"2015-07-26","f_nums":"0.00"},{"f_date":"2015-07-27","f_nums":"0.00"},{"f_date":"2015-07-28","f_nums":"0.00"},{"f_date":"2015-07-29","f_nums":"0.00"},{"f_date":"2015-07-30","f_nums":"0.00"},{"f_date":"2015-07-31","f_nums":"0.00"}],"MobileCore":[{"f_date":"2015-07-01","f_nums":"0.00"},{"f_date":"2015-07-02","f_nums":"0.00"},{"f_date":"2015-07-03","f_nums":"0.00"},{"f_date":"2015-07-04","f_nums":"570.00"},{"f_date":"2015-07-05","f_nums":"570.00"},{"f_date":"2015-07-06","f_nums":"570.00"},{"f_date":"2015-07-07","f_nums":"570.00"},{"f_date":"2015-07-08","f_nums":"2400.00"},{"f_date":"2015-07-09","f_nums":"2392.00"},{"f_date":"2015-07-10","f_nums":"1600.00"},{"f_date":"2015-07-11","f_nums":"1600.00"},{"f_date":"2015-07-12","f_nums":"1600.00"},{"f_date":"2015-07-13","f_nums":"1600.00"},{"f_date":"2015-07-14","f_nums":"1600.00"},{"f_date":"2015-07-15","f_nums":"1600.00"},{"f_date":"2015-07-16","f_nums":"1600.00"},{"f_date":"2015-07-17","f_nums":"1600.00"},{"f_date":"2015-07-18","f_nums":"1600.00"},{"f_date":"2015-07-19","f_nums":"1600.00"},{"f_date":"2015-07-20","f_nums":"1600.00"},{"f_date":"2015-07-21","f_nums":"1600.00"},{"f_date":"2015-07-22","f_nums":"1600.00"},{"f_date":"2015-07-23","f_nums":"1600.00"},{"f_date":"2015-07-24","f_nums":"1600.00"},{"f_date":"2015-07-25","f_nums":"1600.00"},{"f_date":"2015-07-26","f_nums":"1600.00"},{"f_date":"2015-07-27","f_nums":"1600.00"},{"f_date":"2015-07-28","f_nums":"1600.00"},{"f_date":"2015-07-29","f_nums":"1600.00"},{"f_date":"2015-07-30","f_nums":"1600.00"},{"f_date":"2015-07-31","f_nums":"1592.00"}],"Leadbolt":[{"f_date":"2015-07-01","f_nums":"0.00"},{"f_date":"2015-07-02","f_nums":"0.00"},{"f_date":"2015-07-03","f_nums":"0.00"},{"f_date":"2015-07-04","f_nums":"0.00"},{"f_date":"2015-07-05","f_nums":"933.10"},{"f_date":"2015-07-06","f_nums":"939.30"},{"f_date":"2015-07-07","f_nums":"926.90"},{"f_date":"2015-07-08","f_nums":"3322.00"},{"f_date":"2015-07-09","f_nums":"3322.00"},{"f_date":"2015-07-10","f_nums":"5200.00"},{"f_date":"2015-07-11","f_nums":"5200.00"},{"f_date":"2015-07-12","f_nums":"5200.00"},{"f_date":"2015-07-13","f_nums":"5200.00"},{"f_date":"2015-07-14","f_nums":"5200.00"},{"f_date":"2015-07-15","f_nums":"7875.00"},{"f_date":"2015-07-16","f_nums":"7875.00"},{"f_date":"2015-07-17","f_nums":"7875.00"},{"f_date":"2015-07-18","f_nums":"7875.00"},{"f_date":"2015-07-19","f_nums":"7860.00"},{"f_date":"2015-07-20","f_nums":"9826.00"},{"f_date":"2015-07-21","f_nums":"9826.00"},{"f_date":"2015-07-22","f_nums":"9826.00"},{"f_date":"2015-07-23","f_nums":"9826.00"},{"f_date":"2015-07-24","f_nums":"9826.00"},{"f_date":"2015-07-25","f_nums":"9826.00"},{"f_date":"2015-07-26","f_nums":"9826.00"},{"f_date":"2015-07-27","f_nums":"9826.00"},{"f_date":"2015-07-28","f_nums":"9826.00"},{"f_date":"2015-07-29","f_nums":"9826.00"},{"f_date":"2015-07-30","f_nums":"9826.00"},{"f_date":"2015-07-31","f_nums":"9826.00"}],"Komli":[{"f_date":"2015-07-01","f_nums":"0.00"},{"f_date":"2015-07-02","f_nums":"0.00"},{"f_date":"2015-07-03","f_nums":"0.00"},{"f_date":"2015-07-04","f_nums":"0.00"},{"f_date":"2015-07-05","f_nums":"880.00"},{"f_date":"2015-07-06","f_nums":"880.00"},{"f_date":"2015-07-07","f_nums":"880.00"},{"f_date":"2015-07-08","f_nums":"880.00"},{"f_date":"2015-07-09","f_nums":"4800.00"},{"f_date":"2015-07-10","f_nums":"6286.00"},{"f_date":"2015-07-11","f_nums":"6272.00"},{"f_date":"2015-07-12","f_nums":"6286.00"},{"f_date":"2015-07-13","f_nums":"6286.00"},{"f_date":"2015-07-14","f_nums":"6286.00"},{"f_date":"2015-07-15","f_nums":"9456.00"},{"f_date":"2015-07-16","f_nums":"9456.00"},{"f_date":"2015-07-17","f_nums":"9472.00"},{"f_date":"2015-07-18","f_nums":"9456.00"},{"f_date":"2015-07-19","f_nums":"9456.00"},{"f_date":"2015-07-20","f_nums":"11232.00"},{"f_date":"2015-07-21","f_nums":"11250.00"},{"f_date":"2015-07-22","f_nums":"11250.00"},{"f_date":"2015-07-23","f_nums":"11250.00"},{"f_date":"2015-07-24","f_nums":"11250.00"},{"f_date":"2015-07-25","f_nums":"11250.00"},{"f_date":"2015-07-26","f_nums":"11250.00"},{"f_date":"2015-07-27","f_nums":"11250.00"},{"f_date":"2015-07-28","f_nums":"11250.00"},{"f_date":"2015-07-29","f_nums":"11250.00"},{"f_date":"2015-07-30","f_nums":"11250.00"},{"f_date":"2015-07-31","f_nums":"11250.00"}],"ArtOfClick":[{"f_date":"2015-07-01","f_nums":"0.00"},{"f_date":"2015-07-02","f_nums":"0.00"},{"f_date":"2015-07-03","f_nums":"0.00"},{"f_date":"2015-07-04","f_nums":"798.00"},{"f_date":"2015-07-05","f_nums":"798.00"},{"f_date":"2015-07-06","f_nums":"800.00"},{"f_date":"2015-07-07","f_nums":"4800.00"},{"f_date":"2015-07-08","f_nums":"4800.00"},{"f_date":"2015-07-09","f_nums":"4800.00"},{"f_date":"2015-07-10","f_nums":"4200.00"},{"f_date":"2015-07-11","f_nums":"4188.00"},{"f_date":"2015-07-12","f_nums":"4200.00"},{"f_date":"2015-07-13","f_nums":"4200.00"},{"f_date":"2015-07-14","f_nums":"4200.00"},{"f_date":"2015-07-15","f_nums":"4200.00"},{"f_date":"2015-07-16","f_nums":"3500.00"},{"f_date":"2015-07-17","f_nums":"3500.00"},{"f_date":"2015-07-18","f_nums":"3500.00"},{"f_date":"2015-07-19","f_nums":"3500.00"},{"f_date":"2015-07-20","f_nums":"2500.00"},{"f_date":"2015-07-21","f_nums":"2500.00"},{"f_date":"2015-07-22","f_nums":"2250.00"},{"f_date":"2015-07-23","f_nums":"2250.00"},{"f_date":"2015-07-24","f_nums":"2250.00"},{"f_date":"2015-07-25","f_nums":"2250.00"},{"f_date":"2015-07-26","f_nums":"2250.00"},{"f_date":"2015-07-27","f_nums":"2241.00"},{"f_date":"2015-07-28","f_nums":"2250.00"},{"f_date":"2015-07-29","f_nums":"2250.00"},{"f_date":"2015-07-30","f_nums":"2241.00"},{"f_date":"2015-07-31","f_nums":"2250.00"}]},"f_total":547766.1,"table":{"Mobpartner":7306.8,"MobileCore":42264,"Leadbolt":192715.3,"Komli":222014,"ArtOfClick":83466}}';

//                var json =(new Function("","return "+data))();
                var json = JSON.parse(data);

                if(json.total==0){
                    //type=0;
                    $("#eventflightbox").hide();
                    $("#labelbox").hide();
                    data_url="cvid="+cvid+"&start="+start+"&end="+end+"&channel="+channel+"&eventen="+title+"&evid="+getEvidByName(title)+"&type=0";
                    showLazyAjax(data_url,myChart,title);

                }else{
                    $("#eventflightbox").show();
                    $("#labelbox").show();
                    var idstr = "";
                    $.each(json.rows, function(i, item) {
                        idstr += item.id+",";
                    });
                    idstr = idstr.substring(0,idstr.length-1);

                    $('#label').combobox({
                        url: "/pmp/flight",
                        valueField:'id',
                        textField:'label',
                        onLoadSuccess: function () { //加载完成后,设置选中第一项
                            var val = $(this).combobox("getData");
                            slabel = $('#label').combobox('getValue');
                            if(sflight=='all'){
                                //type=1
                                data_url="cvid="+cvid+"&start="+start+"&end="+end+"&channel="+channel+"&eventen="+title+"&evid="+getEvidByName(title)+"&type=1&label="+slabel;

                            }else{
                                //type=2;
                                data_url="cvid="+cvid+"&start="+start+"&end="+end+"&channel="+channel+"&eventen="+title+"&evid="+getEvidByName(title)+"&type=2&label="+slabel+"&sflight="+sflight;
                            }
                            showLazyAjax(data_url,myChart,title);
                        }

                    });
                }
            },
            complete: function(XMLHttpRequest, textStatus){

            },
            error: function(){
                //请求出错处理
            }
        });
    }

    function getRoi(cvid,channel,roilimit,roitype){
        if(roitype==1){
            var ryname = "ROI";
        }else{
            var ryname = "Revenue";
        }

        myChart1 = echarts.init(VDoc('ec_area_roi'));

        jQuery.ajax({
            type: "get",
            url: "/pmp/flight",
            data:"cvid="+cvid+"&start="+start+"&end="+end+"&channel="+channel+"&date_limit="+roilimit+"&type="+roitype,
            cache:false,
            beforeSend: function(XMLHttpRequest){
                myChart1.showLoading({
                    text: 'loading...',
                    effect: 'whirling'
                });
            },
            success: function(data, textStatus){
                data = '{"result":1,"msg":"成功","info":{"Mobpartner":{"roi":2.6154,"budget":"20256.00"},"MobileCore":{"roi":6.1105,"budget":"54400.00"},"Leadbolt":{"roi":13.7428,"budget":"111776.00"},"Komli":{"roi":13.9164,"budget":"127248.00"},"ArtOfClick":{"roi":8.4512,"budget":"77592.00"}}}';
                var roi_data = [];
                var budget_data = [];
                var key_array = [];
                var budgettotal = 0;

                if(ryname=='Revenue'){
                    ryname = '% share of Total Revenue';
                }
                /*下方表*/
                var tablehtml = "<table width='100%'  bordercolor='#999999'  border='1' cellspacing='0' cellpadding='0'><tr><tr class='tbody' style='background-color:#86CEFA;color:white;font-weight:bold'><td style='width:15%;'>Channel</td><td>"+ryname+"</td><td>% share of Total Cost</td></tr>";
                /*下方表*/
                var json =(new Function("","return "+data))();

                $.each(json.info, function(i, item) {
                    key_array.push(i);
                });
                /*下方表*/
                for(var i=0;i<(key_array.length);i++){
                    budgettotal = parseFloat(budgettotal)+parseFloat(json.info[key_array[i]].budget);
                }

                /*下方表*/
                for(var i=0;i<(key_array.length);i++){
                    roi_data.push(json.info[key_array[i]].roi);
                    if(budgettotal == 0){
                        budget_data.push(0);
                    }else{
                        budget_data.push((((parseFloat(json.info[key_array[i]].budget)/budgettotal))*100).toFixed(2));
                    }
                    /*下方表*/
                    if(json.info[key_array[i]].budget==0 || budgettotal==0){
                        var pernum = 0;
                    }else{
                        var pernum = parseFloat(json.info[key_array[i]].budget)/budgettotal;
                    }
                    if(i%2==0){
                        tablehtml += "<tr class='tbodyb'><td>"+key_array[i]+"</td><td>"+(json.info[key_array[i]].roi*100).toFixed(2)+"%</td><td>"+(pernum*100).toFixed(2)+"%</td></tr>";
                    }else{
                        tablehtml += "<tr class='tbody'><td>"+key_array[i]+"</td><td>"+(json.info[key_array[i]].roi*100).toFixed(2)+"%</td><td>"+(pernum*100).toFixed(2)+"%</td></tr>";
                    }
                    /*下方表*/
                }
                /*下方表*/
                tablehtml += "</table>";
                /*下方表*/
                var option = {
                    tooltip: {
                        show: true
                    },
                    legend: {
                        y:'bottom',
                        data:['cost(%)',ryname]
                    },
                    xAxis : [
                        {
                            type : 'category',
                            axisLabel : {
                                rotate: 1
                            },
                            data : key_array
                        }
                    ],
                    yAxis : [
                        {
                            name : 'cost(%)',
                            type : 'value',
                            //splitNumber:5,
                            boundaryGap: [0, 0.1]
                        },
                        {
                            name : ryname,
                            type : 'value',
                            splitLine : {
                                show: false
                            }
                            //splitNumber:5,
                            //boundaryGap: [0.2, 0.2]
                        }
                    ],
                    series : [
                        {
                            name:'cost(%)',
                            type:'bar',
                            data:budget_data
                        },
                        {
                            name:ryname,
                            yAxisIndex: 1,
                            type:'bar',
                            data:roi_data
                        }
                    ]
                };
                myChart1.hideLoading();
                myChart1.setOption(option);
                showtable(title="ROI",tablehtml);//表格数据
            },
            complete: function(XMLHttpRequest, textStatus){
            },
            error: function(){
                //请求出错处理
            }
        });

    }

    function getCohort(cvid,co_act,co_group,co_dtype,co_times,dataType,type){
        if(type){
            co_tmptype = type;
        }
        if(co_tmptype==1){
            var c_title="Channel";
            co_group = "1";
            var data = $('#cohorttbale').combobox('getData');
            if (data.length > 0) {
                $("#cohorttbale").combobox('select', data[0].value);
            }
            var myChart = echarts.init(VDoc('ec_area_2'));
        }else{
            var c_title="Date";
        }
        //$(".tablearea").hide();//table隐藏
        jQuery.ajax({
            type: "get",
            url: "/pmp/flight",
            data:"cvid="+cvid+"&start="+start+"&end="+end+"&act="+co_act+"&dtype="+co_dtype+"&group="+co_group+"&times="+co_times+"&dataType="+dataType,
            cache:false,
            beforeSend: function(XMLHttpRequest){
                if(type==1){
                    myChart.showLoading({
                        text: 'loading...',
                        effect: 'whirling'
                    });
                }
            },
            success: function(data, textStatus){
                var date_array=[];
                var series_array=[];
                var key_array = [];
                var channel_array = [];

                json = JSON.parse(data);
                $.each(json, function(i, item) {
                    key_array.push(i);
                });

                for(var i=0;i<(key_array.length);i++){
                    for(var j=0;j<=(json[key_array[i]].length-1);j++){
                        date_array.push("+"+json[key_array[i]][j].dwm);
                    }
                    break;
                }

                /*构造table*/

                var tablehtml = "<table width='100%' bordercolor='#ccc'  border='1' cellspacing='0' cellpadding='0'><tr style='height:40px;background-color:#86CEFA;color:white;font-weight:bold'><td>"+c_title+"</td>";
                for(i=0;i<(date_array.length);i++){
                    tablehtml += "<td><div style='float:left;padding-top:3px'><span style='font-weight:bold;'>"+date_array[i]+"</span></div></td>";
                }
                tablehtml += "</tr>";
                /*构造table*/


                for(var i=0;i<(key_array.length);i++){
                    /*构造table*/
                    if(i%2==0){
                        tablehtml += "<tr class='tbodyb'>"+"<td style='width:15%;'>"+key_array[i]+"</td>";
                    }else{
                        tablehtml += "<tr class='tbody'>"+"<td style='width:15%;'>"+key_array[i]+"</td>";
                    }
                    /*构造table*/
                    var newdata=[];
                    for(var j=0;j<=(json[key_array[i]].length-1);j++){
                        tablehtml +="<td>"+json[key_array[i]][j].nums+"</td>";
                        newdata.push(json[key_array[i]][j].nums);
                    }
                    /*构造table*/
                    tablehtml += "</tr>";
                    /*构造table*/

                    var newobj = {name:key_array[i],type:"line",data:newdata,smooth:true};
                    series_array.push(newobj);
                }
                /*构造table*/
                tablehtml += "</table>";
                /*构造table*/
                var option = {
                    tooltip: {
                        show: true
                    },
                    legend: {
                        y:'bottom',
                        data:key_array
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
                if(co_tmptype==1){
                    myChart.hideLoading();
                    myChart.setOption(option);
                }
                showtable(title="Cohort Type",tablehtml);//表格数据
            },
            complete: function(XMLHttpRequest, textStatus){
            },
            error: function(){
                //请求出错处理
            }
        });

    }

    function getPayback(cvid,uid){
        //$(".tablearea").hide();//table隐藏
        var myChart = echarts.init(VDoc('ec_area_3'));

        jQuery.ajax({
            type: "get",
            url: "/pmp/flight",
            data:"cvid="+cvid+"&uid="+uid+"&start="+start+"&end="+end,
            cache:false,
            beforeSend: function(XMLHttpRequest){
                myChart.showLoading({
                    text: 'loading...',
                    effect: 'whirling'
                });
            },
            success: function(data, textStatus){
                var date_array=[];
                var series_array=[];
                var key_array = [];
                var channel_array = [];

                var json = JSON.parse(data)
                $.each(json, function(i, item) {
                    if(i!="node"){
                        key_array.push(i);
                    }
                });
                $(".payback_control_rb").html(json.node);
                for(var i=0;i<(key_array.length);i++){
                    for(var j=0;j<=(json[key_array[i]].length-1);j++){
                        date_array.push(json[key_array[i]][j].date);
                    }
                    break;
                }

                /*构造table*/

                var tablehtml = "<table width='100%'  bordercolor='#ccc'  border='1' cellspacing='0' cellpadding='0'><tr style='background-color:#86CEFA;color:white;font-weight:bold'><td style='width:15%;'>Day</td>";
                for(i=0;i<(date_array.length);i++){
                    tablehtml += "<td>"+date_array[i]+"</td>";
                }
                tablehtml += "</tr>";
                /*构造table*/


                for(var i=0;i<(key_array.length);i++){
                    if(key_array[i]=='node') continue;
                    /*构造table*/
                    if(i%2==0){
                        tablehtml += "<tr class='tbodyb'>"+"<td style='width:15%;'>"+key_array[i]+"($)</td>";
                    }else{
                        tablehtml += "<tr class='tbody'>"+"<td style='width:15%;'>"+key_array[i]+"($)</td>";
                    }
                    /*构造table*/
                    var newdata=[];
                    for(var j=0;j<=(json[key_array[i]].length-1);j++){
                        tablehtml +="<td>"+json[key_array[i]][j].nums+"</td>";
                        newdata.push(json[key_array[i]][j].nums);
                    }
                    /*构造table*/
                    tablehtml += "</tr>";
                    /*构造table*/

                    var newobj = {name:key_array[i],type:"line",data:newdata,smooth:true};
                    series_array.push(newobj);
                }
                /*构造table*/
                tablehtml += "</table>";
                /*构造table*/

                var option = {
                    tooltip: {
                        show: true
                    },
                    legend: {
                        y:'bottom',
                        data:key_array
                    },
                    xAxis : [
                        {
                            type : 'category',
                            data : date_array
                        }
                    ],
                    yAxis : [
                        {
                            name:'value($)',
                            type : 'value'
                        }
                    ],
                    series : series_array
                };
                myChart.hideLoading();
                myChart.setOption(option);
                showtable(title="payback",tablehtml);//表格数据
            },
            complete: function(XMLHttpRequest, textStatus){
            },
            error: function(){
                //请求出错处理
            }
        });

    }

    var tmp_d = '"iap","pay","start"';

    function onDocLoaded(){

        $('#f_cid').combobox({
            url: "/pmp/flightGroup",
            method: 'get',
            valueField:'Id',
            textField:'Name'/*,
             onLoadSuccess: function () { //加载完成后,设置选中第一项
             var val = $(this).combobox("getData");
             for (var item in val[0]) {
             if (item == "f_id") {
             $(this).combobox("select", val[0][item]);
             }
             }
             }*/
        });

        if(tmp_d!=''){
            $(".datelimitbox").hide();
            $(".datelimitbox3").hide();
        }

        //set default roi display 20150825
        $(".datelimitbox").show();
        $(".datelimitbox3").show();

        getRoi('','','','');
    }

//    var title_array = ["start","register","iap", "roi","payback"];
    var title_array = ["start","register","submit","conversion","iap", "roi"];
    //set default roi display 20150825
    currenttitle="roi";


    //var title_array = [,"retention","roi"];
    var cvid = "70";

    $(function(){
        //var cvid = $("#f_cvid").val();
        var cvid = "70";
        $('#tabsbox').tabs({
            tabHeight:25,
            tabWidth:110,
            border:false,
            onSelect:function(title,index){
                //alert(title+' is selected');
                //title = title.toLowerCase();
                title = title_array[index];
                currenttitle = title;
                //var cvid = $("#f_cvid").val();
                var cvid = "70";

                $(".payback_control_rb").hide();
                if(title=="roi"){
                    $(".datelimitbox").show();
                    $(".datelimitbox3").show();
                    $(".cohort_control").hide();
                    $(".payback_control").hide();
                    $(".payback_control_r").hide();
                    //$("#channelbox").show();
                    $("#eventflightbox").hide();
                    $("#labelbox").hide();
                    getRoi(cvid,channel,roilimit,roitype);
                }else if(title=="payback"){
                    $(".payback_control_rb").show();
                    $(".datelimitbox").hide();
                    $(".datelimitbox3").hide();
                    $(".cohort_control").hide();
                    $(".payback_control").show();
                    $(".payback_control_r").show();
                    //$("#channelbox").show();
                    $("#eventflightbox").hide();
                    $("#labelbox").hide();
                    getPayback(cvid,uid="");
                }else if(title=="cohort"){
                    $(".datelimitbox").hide();
                    $(".datelimitbox3").hide();
                    $(".cohort_control").show();
                    $(".payback_control").hide();
                    $(".payback_control_r").hide();
                    //$("#channelbox").hide();
                    $("#eventflightbox").hide();
                    $("#labelbox").hide();
                    getCohort(cvid,co_act,co_group,co_dtype,co_times,dataType,1);
                }else if(title=="iap"){
                    $(".datelimitbox").hide();
                    $(".datelimitbox3").hide();
                    $(".cohort_control").hide();
                    $(".payback_control").hide();
                    $(".payback_control_r").hide();
                    //$("#channelbox").show();
                    $("#eventflightbox").show();
                    $("#labelbox").show();
                    getConversion(cvid,channel,title,sflight,slabel);
                }else if(title=="start" || title == "submit" || title == "conversion"){
                    $(".datelimitbox").hide();
                    $(".datelimitbox3").hide();
                    $(".cohort_control").hide();
                    $(".payback_control").hide();
                    $(".payback_control_r").hide();
                    //$("#channelbox").show();
                    $("#eventflightbox").show();
                    $("#labelbox").show();
                    getConversion(cvid,channel,title,sflight,slabel);
                }else if(title=="register"){
                    $(".datelimitbox").hide();
                    $(".datelimitbox3").hide();
                    $(".cohort_control").hide();
                    $(".payback_control").hide();
                    $(".payback_control_r").hide();
                    //$("#channelbox").show();
                    $("#eventflightbox").show();
                    $("#labelbox").show();
                    getConversion(cvid,channel,title,sflight,slabel);
                }
            }
        });
        /*
         $("#roilimit").change(function(){
         roilimit = $(this).children('option:selected').val();
         getRoi(cvid,channel,roilimit,roitype);
         });
         */
        $('#roilimit').combobox({
            onSelect: function () {
                roilimit = $('#roilimit').combobox('getValue');
                getRoi(cvid,channel,roilimit,roitype);
            }
        });
        /*
         $("#roitype").change(function(){
         roitype = $(this).children('option:selected').val();
         getRoi(cvid,channel,roilimit,roitype);
         });
         */
        $('#roitype').combobox({
            onSelect: function () {
                roitype = $('#roitype').combobox('getValue');
                getRoi(cvid,channel,roilimit,roitype);
            }
        });
        $('#cohortretention').combobox({
            onSelect: function () {
                co_act = $('#cohortretention').combobox('getValue');

                if(co_act=="1"){
                    $("#cohorttimesbox").show();
                }else{
                    $("#cohorttimesbox").hide();
                }
                getCohort(cvid,co_act,co_group,co_dtype,co_times,dataType,1);
            }
        });
        /*
         $('#cohortgroup').combobox({
         onSelect: function () {
         co_group = $('#cohortgroup').combobox('getValue');
         getCohort(cvid,co_act,co_group,co_dtype,co_times);
         }
         });
         */

        $('#cohorttimes').combobox({
            onSelect: function () {
                co_times = $('#cohorttimes').combobox('getValue');
                getCohort(cvid,co_act,co_group,co_dtype,co_times,dataType,1);
            }
        });

        $('#cohorttbale').combobox({
            onSelect: function () {
                co_group = $('#cohorttbale').combobox('getValue');
                if(co_group==2){
                    getCohort(cvid,co_act,co_group,co_dtype,co_times,dataType,type="2");
                }else{
                    getCohort(cvid,co_act,co_group,co_dtype,co_times,dataType,type="1");
                }
            }
        });
        $('#paybackselect').combobox({
            onSelect: function () {
                paybackselect = $('#paybackselect').combobox('getValue');
                //alert(paybackselect);
                getPayback(cvid,paybackselect);
            }
        });
        $('#eventflight').combobox({
            onSelect: function () {
                sflight = $('#eventflight').combobox('getValue');
                getConversion(cvid,channel,currenttitle,sflight,slabel);
            }
        });
        $('#label').combobox({
            onSelect: function () {
                slabel = $('#label').combobox('getValue');
                getConversion(cvid,channel,currenttitle,sflight,slabel);
            }
        });
    });
    function cohortgroup_table(v){
        co_group = v;
        getCohort(cvid,co_act,co_group,co_dtype,co_times,dataType);
    }
    function cohort_table_get(v){
        if(v==1){
            dataType= "1";
            $("#co_button1").css("border-bottom","3px solid #4D3667");
            $("#co_button2").css("border-bottom","3px solid #ccc");
            getCohort(cvid,co_act,co_group,co_dtype,co_times,dataType);
        }else{
            dataType= "2";
            $("#co_button1").css("border-bottom","3px solid #ccc");
            $("#co_button2").css("border-bottom","3px solid #4D3667");
            getCohort(cvid,co_act,co_group,co_dtype,co_times,dataType);
        }
    }
    function getcodtype(val){
        for (var i=1;i<=3;i++)
        {
            var k = i+6;
            if(val==i){
                $(".time_search_button"+k).css("background-color","#E9EBF5");
            }else{
                $(".time_search_button"+k).css("background-color","#ffffff");
            }
        }
        co_dtype=val;
        getCohort(cvid,co_act,co_group,co_dtype,co_times,dataType);
    }

    function showtable(title,tablehtml){
        $(".tablearea").show();//table显示
        $(".tablename").html(title);//修改table name
        $("#tablebox").html(tablehtml);
        if(title=="payback"){
            $("#tablebox").css("height","140px");
        }else{
            $("#tablebox").css("height","400px");
        }
        if(title=="Cohort Type"){
            //$(".cohort_top_menu,.cohort_bottom_menu").show();
            $(".cohort_top_menu").show();
        }else{
            //$(".cohort_top_menu,.cohort_bottom_menu").hide();
            $(".cohort_top_menu").hide();
        }
    }

    if(document.addEventListener){
        window.addEventListener("load", onDocLoaded, false);
    }else if(document.attachEvent){
        window.attachEvent("onload", onDocLoaded);
    }

</script>
</body>
</html>