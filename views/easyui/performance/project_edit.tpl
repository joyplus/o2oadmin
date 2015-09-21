
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

        <form id="campaign_edit" action="campaign_chk.php?type=1"  method="post" enctype="multipart/form-data">
            <input type="hidden" name="cid" value="83" />
            <div id="creat_title">
                <span style="margin-left:10px">Edit Campaign</span>
                <div style="float:right">
                    <a class="user_creat_button" onclick="return Creatcampaign();" >Save</a>
                    <a class="user_cancel_button" onclick="return cancelcampaign();">Cancel</a>
                </div>
            </div>
            <div class="creat_area1" style="height:345px;">
                <div>
                    <div class="are_unit"><span class="unit_title">Advertiser</span>
                        <select class="easyui-combobox" name="f_adname" id="f_adid" style="width:365px;height:32px;" >
                        </select>
                    </div>
                    <div class="are_unit"><span class="unit_title">Campaign Name</span><input name="f_name" id="f_name" class="f1 easyui-textbox" data-options="required:true,missingMessage:'Please input the Name!'" value="test new campaign"  style="width:365px;height:32px;" maxlength="20" /></div>
                </div>
                <div class="are_unita">
                    <span class="unit_title">Application</span><span class="right rightb">
		    <select class="easyui-combobox" name="f_appid" id="f_appid" style="width:365px;height:32px;" >
                <option value="98" selected='selected'>1211--Android</option>
                <option value="125" >g666ssd--IOS</option>
            </select>
		</span>
                </div>
                <div style="float:left;width:100%;">
                    <div class="are_unit"><span class="unit_title">IO Budget</span><input name="f_budget" class="f1 easyui-numberbox" data-options="precision:2,required:true,missingMessage:'Please input the Budget!'" value="11.00"  style="width:365px;height:32px;" id="f_budget"/></div>
                    <div class="are_unit"><span class="unit_title">Advertiser Price <img src="images/altb.png" style="cursor:pointer;margin-top:-8px" title="Campaign offer price given by advertiser." alt="Campaign offer price given by advertiser."></span><input name="f_price" class="f1 easyui-numberbox" data-options="precision:2,required:true,missingMessage:'Please input the Price!'" value="1.00"  style="width:365px;height:32px;" id="f_price"/></div>
                </div>
                <div class="are_unita" style="margin-top:4px">
                    <span class="unit_title">Description</span><textarea rows="3" name="f_description" class="f1" style="border-radius:5px;border:0;font-size:12px" data-options="required:true,missingMessage:'Please input the App Description'" >1</textarea>
                </div>
            </div>
        </form>
        <!-------------------unit unit unit unit----------------------------------->
        <div id="search_area">
            <div style="text-align:center;">
                <input type="image" src="images/other.png" class="user_search_button" style="width:109px;margin-left:10px;" onclick="return newApp();" value="Create New Flight" id="button03" />
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

        </div>

        <div id="result_area" style="border:0">
            <table id="comp_list" title="Flight List" style="width:100%;height:90%"
                   data-options="rownumbers:false,singleSelect:true,url:'get_unit.php?cid=83',method:'get'" pagination="true">
                <thead>
                <tr>
                    <th data-options="field:'f_pstatus',width:80,formatter:formatPstatus"><b>Status</b></th>
                    <th data-options="field:'f_name',width:120"><b>Name</b></th>
                    <th data-options="field:'f_channel_name',width:120"><b>Channel</b></th>
                    <th data-options="field:'f_bidding',width:78,formatter:formatBidding"><b>Bidding</b></th>
                    <th data-options="field:'f_price',width:120"><b>Channel Price($)</b></th>
                    <th data-options="field:'f_day_budget',width:120"><b>Budget</b></th>
                    <th data-options="field:'f_start',width:160,formatter:formatDate"><b>Date</b></th>
                    <th data-options="field:'f_id',width:320,align:'left',formatter:formatEventEdit"><b>Operation</b></th>
                    <th data-options="field:'f_cid',width:120,formatter:formatDataImport"><b>Data Import</b></th>
                </tr>
                </thead>
            </table>

            <div id="show_dlg" class="easyui-dialog" style="width:520px;height:280px;padding:10px 20px" closed="true" draggable="false" modal="true">
                <table style="font-size:14px;">
                    <tr style="height:45px;width:95%">
                        <td style="width:20%"><b>Cvid</b></td>
                        <td style="width:75%"><span id="scvid"></span></td>
                    </tr>
                    <tr style="height:45px;width:95%">
                        <td style="width:20%"><b>Offer ID</b></td>
                        <td style="width:75%"><span id="offerid"></span></td>
                    </tr>
                    <tr style="height:45px;width:95%">
                        <td style="width:20%"><b>Click URL</b></td>
                        <td style="width:75%">
                            <textarea id="linkurl" style="width:350px;height:110px;" onclick="this.select();" readonly></textarea>
                        </td>
                    </tr>
                </table>
            </div>

            <div id="set_dlg" class="easyui-dialog" style="width:580px;height:350px;padding:10px 20px" closed="true" draggable="false" modal="true">
                <form id="set_edit" action="unit_set_chk.php?type=1" method="post" enctype="multipart/form-data">
                    <input type="hidden" name="uid" id="unitid" value="" />
                    <div style="font-size:14px;">
                        <div style="height:45px;width:100%" id="tablecontent">
                            <div>
                                No setting info
                            </div>
                        </div>
                    </div>
                    <div style="position:absolute;right:20px;bottom:20px;">
                        <a class="user_creat_button" onclick="return Setup();" href="#">Save</a>
                        <a class="user_cancel_button" href="javascript:$('#set_dlg').dialog('close');void(0);">Cancel</a>
                    </div>
                </form>
            </div>
            <div id="frun_dlg" class="easyui-dialog" style="width:320px;height:150px;padding:10px 20px" closed="true" draggable="false" modal="true">
                <form id="set_endtime" action="unit_reendtime.php?type=1" method="post" enctype="multipart/form-data">
                    <input type="hidden" name="uid" id="reset_unitid" value="" />
                    <div style="font-size:14px;">
                        <div style="height:45px;width:100%">
                            <div>
                                Reset endtime <input name="f_r_end" class="easyui-datebox" id="r_end_date" value="2015-09-21" style="width:120px;height:32px" />
                            </div>
                        </div>
                    </div>
                    <div style="position:absolute;right:40px;bottom:20px;">
                        <a class="user_creat_button" onclick="return ResetEndtime();" href="#">yes</a>
                        <a class="user_cancel_button" href="javascript:$('#frun_dlg').dialog('close');void(0);">no</a>
                    </div>
                </form>
            </div>
            <!--<div id="set-buttons">
                <a href="javascript:void(0)" class="easyui-linkbutton c6" iconCls="icon-ok" onclick="Setup()" style="width:90px">Save</a>
                <a href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-cancel" onclick="javascript:$('#set_dlg').dialog('close')" style="width:90px">Cancel</a>
            </div>-->

            <div id="setting_dlg" class="easyui-dialog" style="width:520px;height:560px;padding:10px 20px" closed="true" draggable="false" modal="true">
                <form id="setting_edit" action="unit_chk.php?type=1" method="post" enctype="multipart/form-data">
                    <table style="font-size:12px;">
                        <tr>
                        <tr style="height:45px;width:95%">
                            <td style="width:25%"><b>Flight Name</b></td>
                            <td style="width:70%"><input type="text" name="f_name" class="f1 easyui-textbox" style="width:310px;height:32px;" data-options="required:true,missingMessage:'Please input the Name'" id="f_uname"></td>
                        </tr>
                        <tr>
                        <tr style="height:45px;width:95%;display:none;">
                            <td style="width:25%"><b>Campaign</b></td>
                            <td style="width:70%"><input name="f_cname" id = "f_cname" style="width:290px;height:32px;" value="test new campaign" readonly /></td>
                        </tr>
                        <tr style="height:45px;width:95%;" id="f_channel">
                            <td style="width:25%;"><b>Channel</b></td>
                            <td style="width:70%"><select class="easyui-combobox" name="f_channelid" style="width:310px;height:32px;">
                                <option value="00002">Inmobi</option>
                                <option value="00003">SmartMad</option>
                                <option value="00004">Tapjoy</option>
                                <option value="00005">SponsorPay</option>
                                <option value="00006">MillennialMedia</option>
                            </select></td>
                        </tr>
                        <tr style="height:45px;width:95%">
                            <td style="width:25%"><b>Date</b></td>
                            <td style="width:70%">From <input name="f_start" class="easyui-datebox" id="start_date" value="2015-09-21" style="width:120px;height:32px" /> To <input name="f_end" class="easyui-datebox" id="end_date" value="2015-09-28" style="width:120px;height:32px" /></td>
                        </tr>
                        <tr style="height:45px;width:95%">
                            <td style="width:25%"><b>Budget</b></td>
                            <td style="width:70%"><input name="f_day_budget" class="f1 easyui-numberbox" style="width:235px;height:32px;" data-options="max:999999999.00,precision:2,required:true,missingMessage:'Please input the Budget'" id="f_day_budget"/></td>
                        </tr>
                        <tr style="height:45px;width:95%">
                            <td style="width:25%"><b>Cost Price</b></td>
                            <td style="width:70%"><input name="f_price" class="f1 easyui-numberbox" style="width:235px;height:32px;" data-options="max:999999999.00,precision:2,required:true,missingMessage:'Please input the Cost Price'" id="f_uprice"/></td>
                        </tr>
                        <tr style="height:45px;width:95%">
                            <td style="width:25%"><b>Bidding</b></td>
                            <td style="width:70%">
                                <select class="easyui-combobox" name="f_bidding" style="width:235px;height:32px;">
                                    <option value="2">CPA</option>
                                    <option value="1">CPC</option>
                                </select></td>
                        </tr>
                        <!--<tr style="height:45px;width:95%">
                        <td style="width:25%"><b>Geo Tag</b></td>
                        <td style="width:70%"><input name="f_geotag" class="f1 easyui-textbox" style="width:235px;height:32px;" data-options="required:true,missingMessage:'Please input the Geo Tag'" maxlength="20" /></td>
                        </tr>-->
                        <tr style="height:45px;width:95%">
                            <td style="width:25%"><b>Geo Tag</b></td>
                            <td style="width:70%">
                                <select class="easyui-combobox" id="f_geotag" name="f_geotag" style="width:310px;height:32px;" data-options="multiple:true,onSelect:onGeoSelect">
                                    <option value="">Select ALL</option>
                                    <option value="AF">Afghanistan</option>
                                    <option value="AL">Albania</option>
                                    <option value="DZ">Algeria</option>
                                    <option value="AS">AmericanSamoa</option>
                                    <option value="AD">Andorra</option>
                                </select>
                        </tr>
                        <tr style="height:45px;width:95%">
                            <td style="width:25%"><b>Install Postback</b></td>
                            <td style="width:70%"><input type="radio" name="f_pbacktag" value="1" checked="checked"/>Attributed Installs<input  type="radio" name="f_pbacktag" value="2" style="margin-left:10px;"/>All Installs</td>
                        </tr>
                        <tr style="height:45px;width:95%">
                            <td style="width:25%"><b>Cost based on</b></td>
                            <td style="width:70%"><input type="radio" name="f_cost_based_on" value="1" />Performad‘s data<input  type="radio" name="f_cost_based_on" value="2" style="margin-left:10px;"/>Channel’s data</td>
                        </tr>
                        <tr style="height:45px;width:95%">
                            <td style="width:25%"><b>Event Postback</b></td>
                            <td style="width:70%"><input type="checkbox" name="f_eventtag" style="vertical-align: middle;" value="1" /></td>
                        </tr>
                    </table>
                    <div style="float:right;margin-top:5px;">
                        <a class="action_button" onclick="return saveSetting();" href="#">Save</a>
                        <a class="cancel_button" href="javascript:$('#setting_dlg').dialog('close');void(0);">Cancel</a>
                    </div>
                </form>
            </div>

            <!--<div id="setting-buttons">
                <a href="javascript:void(0)" class="easyui-linkbutton c6" iconCls="icon-ok" onclick="saveSetting()" style="width:90px">Save</a>
                <a href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-cancel" onclick="javascript:$('#setting_dlg').dialog('close')" style="width:90px">Cancel</a>
            </div>-->

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

    function onGeoSelect(r){
        var cText = $(this).combobox('getText');
        if(cText == 'Select ALL'){
            $(this).combobox("setValues",r.value).combobox("setText",r.text);
            return;
        }
        if (r.text == 'Select ALL') {
            $(this).combobox("setValues",'').combobox("setText",'Select ALL');
        }else{

        }
    }

    $("#button01").mouseover(function(){
        $(this).attr("src","images/facebook2.png");
    });
    $("#button01").mouseout(function(){
        $(this).attr("src","images/facebook.png");
    });
    $("#button02").mouseover(function(){
        $(this).attr("src","images/google2.png");
    });
    $("#button02").mouseout(function(){
        $(this).attr("src","images/google.png");
    });
    $("#button03").mouseover(function(){
        $(this).attr("src","images/other2.png");
    });
    $("#button03").mouseout(function(){
        $(this).attr("src","images/other.png");
    });

    $("#start_date").datebox();
    var c=$("#start_date").datebox("calendar");
    c.calendar({
        validator:function(date){
            var now=new Date();

            var Y=now.getFullYear();
            var M=now.getMonth();
            var D=now.getDate();
            var start=new Date(Y, M, D);
            var end=new Date(Y, M, D + 7);
            var selectable=date >= start;
            //return selectable;
            return true;
        }

    });

    $("#end_date").datebox();
    var c=$("#end_date").datebox("calendar");
    c.calendar({
        validator:function(date){
            var now=new Date();
            var Y=now.getFullYear();
            var M=now.getMonth();
            var D=now.getDate();
            var start=new Date(Y, M, D);
            var end=new Date(Y, M, D + 7);
            var selectable=date >= start;
            return selectable;
            //return true;
        }

    });

    $("#r_end_date").datebox();
    var c=$("#r_end_date").datebox("calendar");
    c.calendar({
        validator:function(date){
            var now=new Date();
            var Y=now.getFullYear();
            var M=now.getMonth();
            var D=now.getDate();
            var start=new Date(Y, M, D);
            var end=new Date(Y, M, D + 7);
            var selectable=date >= start;
            //return selectable;
            return true;
        }

    });
    var f_adid = '10';
    $('#f_adid').combobox({
        url:'ajax_getad.php?adid='+f_adid,
        valueField:'f_id',
        textField:'f_name',
        onLoadSuccess: function () { //加载完成后,设置选中第一项
            var val = $(this).combobox("getData");
        },
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
        $('#comp_list').datagrid({
            pageSize:10,
            nowrap:false,
            /*rowStyler:function(index,row){
             if (index%2==1){
             return 'background-color:#FAFAFC;';
             }
             },*/
            onBeforeLoad:function(param){
                //return false;
            },
            onBeforeRender:function(){
            },
            onLoadError:function(){
            },
            onSelect:function(index,row){

            },
            onLoadSuccess:function(data){
                //setTimeout(function(){$('#comp_list').datagrid('fixRowHeight');},500);
                /*
                 $(".user_edit_text").linkbutton({ text:'Edit', plain:true, iconCls:'icon-edit'});
                 $(".user_import_text").linkbutton({ text:'TTO import', plain:true, iconCls:'icon-add'});
                 $(".user_set_text").linkbutton({ text:'Setting', plain:true, iconCls:'icon-redo'});
                 $(".user_finish_text").linkbutton({ text:'Finish', plain:true, iconCls:'icon-redo'});
                 */
            }
        });

        $('#f_day_budget').numberbox({
            min:0,
            precision:2,
            onChange:function(newValue,oldValue){
                //console.log(oldValue);
            }
        });
    });

    var cam_budget = "11.00";

    function saveSetting(){
        //$('#setting_dlg').dialog('close');
        var namelen = $("#f_uname").val().length;
        if(namelen > 50){
            alert("The maximum length of 50 characters");
            return false;
        }

        var budgetval = $("#f_day_budget").val();
        if(parseInt(budgetval) > parseInt(cam_budget)){
            alert("budget cannot be more than IO budget");
            return false;
        }
        if(parseInt(budgetval)<0){
            alert("budget can't be negative");
            return false;
        }
        var priceval = $("#f_uprice").val();
        if(parseInt(priceval)<0){
            alert("Cost Price can't be negative");
            return false;
        }
        var cost_base = $("input[name='f_cost_based_on']:checked ").val();

        if(cost_base!=1 && cost_base!=2){
            alert("please select Cost based on");
            return false;
        }
        var f_geotag = $('#f_geotag').combobox('getText');

        $('#setting_edit').form('submit',
                {
                    url: url + "&geotag="+f_geotag,
                    onSubmit: function(){
                        return $(this).form('validate');
                    },
                    success: function(result){
                        var obj = new Function("return" + result)();
                        if(obj.result > 0){
                            var res="save success";
                            $('#setting_edit').form('clear');
                            $('#setting_dlg').dialog('close');
                            $('#comp_list').datagrid('reload');
                            $.messager.alert('Info', res);
                            scriptcampaign(cid);//运行campaign脚本

                        }else{
                            $.messager.alert("error",obj.msg);

                        }

                    }
                });
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

    function formatDate(val,row){
        var s = row.f_start+" - "+row.f_end;
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


    function formatEventEdit(val,row){

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

        var str = "";
        if(row.f_pstatus==3 || timestamp > time2){
            //finished状态
            str += '<span style="width:50px;margin-left:6px;text-align:left;display:inline-block;"><a href="javascript:delEvent(\''+row.f_id+'\');void(0);" style="color:#057ADA">Delete</a></span>';
            str += '<span style="width:50px;margin-left:6px;text-align:left;display:inline-block;"><a href="javascript:frunEvent(\''+row.f_id+'\');void(0);" style="color:#057ADA">Run</a></span>';
        }else if(row.f_pstatus==1 || row.f_pstatus==4){
            if(timestamp >= time1 && timestamp<=time2 && (row.f_pstatus==1 || row.f_pstatus==4)){
                //running状态
                if(row.f_pstatus==4){
                    str = '<span style="width:50px;margin-left:6px;text-align:left;display:inline-block;"><a href="javascript:editEvent(\''+row.f_id+'\');void(0);" class="user_edit_text" style="color:#057ADA">Edit</a></span>';
                }
            }else{
                str = '<span style="width:50px;margin-left:6px;text-align:left;display:inline-block;"><a href="javascript:editEvent(\''+row.f_id+'\');void(0);" class="user_edit_text" style="color:#057ADA">Edit</a></span>';
            }
            str += '<span style="width:50px;margin-left:6px;text-align:left;display:inline-block;"><a style="color:#057ADA" href="javascript:SettingFlight(\''+row.f_id+'\');void(0);"  class="user_set_text" >Setting</a></span>';
            //str += '<span style="width:70px;margin-left:6px;text-align:left;display:inline-block;"><a style="color:#057ADA" href="javascript:showS2S(\''+row.f_offer_id+'\')">Click URL</a></span>';
            str += '<span style="width:50px;margin-left:6px;display:inline-block;"><a style="color:#057ADA" href="javascript:Finishit(\''+row.f_id+'\');void(0);"  class="user_finish_text" >Finish</a></span>';
            if(timestamp >= time1 && timestamp<=time2 && (row.f_pstatus==1 || row.f_pstatus==4)){
                //running状态
                if(row.f_pstatus==4){
                    str += '<span style="width:50px;margin-left:6px;text-align:left;display:inline-block;"><a href="javascript:stopEvent(\''+row.f_pstatus+'\');void(0);" class="user_edit_text" style="color:#057ADA">Run</a></span>';
                }else{
                    str += '<span style="width:50px;margin-left:6px;text-align:left;display:inline-block;"><a href="javascript:stopEvent(\''+row.f_pstatus+'\');void(0);" class="user_edit_text" style="color:#057ADA">Stop</a></span>';
                }
            }
        }else{
            //draft状态
            str = '<span style="width:50px;margin-left:6px;text-align:left;display:inline-block;"><a href="javascript:editEvent(\''+row.f_id+'\');void(0);" class="user_edit_text" style="color:#057ADA">Edit</a></span>';
            str += '<span style="width:50px;margin-left:6px;text-align:left;display:inline-block;"><a style="color:#057ADA" href="javascript:upSigmadAdunit(\''+row.f_id+'\')">Publish</a></span>';
            str += '<span style="width:50px;margin-left:6px;text-align:left;display:inline-block;"><a href="javascript:delEvent(\''+row.f_id+'\');void(0);" style="color:#057ADA">Delete</a></span>';
        }
        if(row.f_offer_id!=''){
            str += '<span style="width:70px;margin-left:6px;text-align:left;display:inline-block;"><a style="color:#057ADA" href="javascript:showS2S(\''+row.f_offer_id+'\')">Click URL</a></span>';
        }
        return str;
    }

    function formatDataImport(val,row){
        return '<a style="color:#057ADA" href="javascript:TtoImport(\''+row.f_id+'\');void(0);" class="user_import_text" >Import</a>'
    }

    function TtoImport(id){
        window.location.href = 'tto.php?uid='+id;
    }

    function SettingFlight(val){
        $(".user_add_icon").linkbutton({iconCls:'icon-add'});
        $(".user_remove_icon").linkbutton({iconCls:'icon-remove'});
        $('#set_dlg').dialog('open').dialog('setTitle','Setting Info');
        $("#unitid").val(val);
        getunitparam(val);

    }

    function Finishit(val){
        var cid = "83";
        $.messager.confirm('Confirm','Are you sure to finish？',function(r){
            if(r){
                jQuery.ajax({
                    type: "get",
                    url: "finishUnit.php",
                    data:"f_id="+val+"&cid="+cid,
                    cache:false,
                    beforeSend: function(XMLHttpRequest){
                    },
                    success: function(data, textStatus){
                        //alert(data);
                        if(data){
                            $('#comp_list').datagrid('reload');
                        }
                    },
                    complete: function(XMLHttpRequest, textStatus){
                    },
                    error: function(){
                        //请求出错处理
                    }
                });
            }
        });
    }

    function stopEvent(val){
        var row = $('#comp_list').datagrid('getSelected');
        var cid = "83";
        if(val == 4){
            tishi_msg = "Are you sure to run？";
        }else{
            tishi_msg = "Are you sure to stop？";
        }
        $.messager.confirm('Confirm',tishi_msg,function(r){
            if(r){
                jQuery.ajax({
                    type: "get",
                    url: "stopUnit.php",
                    data:"f_id="+row.f_id+"&cid="+cid+"&pstatus="+val,
                    cache:false,
                    beforeSend: function(XMLHttpRequest){
                    },
                    success: function(data, textStatus){
                        //alert(data);
                        scriptcampaign(cid);//运行campaign脚本
                        if(data){
                            $('#comp_list').datagrid('reload');
                        }
                    },
                    complete: function(XMLHttpRequest, textStatus){
                    },
                    error: function(){
                        //请求出错处理
                    }
                });
            }
        });
    }

    function frunEvent(val){
        var cid = "83";
        $("#reset_unitid").val(val);
        $('#frun_dlg').dialog('open').dialog('setTitle','Reset Endtime');
    }
    function ResetEndtime(){
        url = "unit_reendtime.php?type=1";
        $('#frun_dlg').dialog('close');
        var cid = "83";
        $('#set_endtime').form('submit',
                {
                    url: url,
                    onSubmit: function(){
                        return $(this).form('validate');
                    },
                    success: function(result){
                        //alert(result);return;
                        if(result==1){
                            $.messager.alert("result","success!");
                            //alert("success");
                        }else if(result==-1){
                            $.messager.alert("result","endtime is error!");
                            //alert("fail");
                        }else{
                            $.messager.alert("result",result);
                            //alert("fail");
                        }
                        scriptcampaign(cid);//运行campaign脚本
                        $('#comp_list').datagrid('reload');
                    }
                });
    }

    function getunitparam(val){
        $("#tablecontent").html('');
        jQuery.ajax({
            type: "get",
            url: "get_unit_param.php",
            data:"id="+val,
            cache:false,
            beforeSend: function(XMLHttpRequest){
            },
            success: function(data, textStatus){
                if(data){
                    $("#tablecontent").html(data);
                }
            },
            complete: function(XMLHttpRequest, textStatus){
            },
            error: function(){
                //请求出错处理
            }
        });
    }
    function Setup(){
        url = "unit_set_chk.php?type=1";
        $('#set_dlg').dialog('close');
        $('#set_edit').form('submit',
                {
                    url: url,
                    onSubmit: function(){
                        return $(this).form('validate');
                    },
                    success: function(result){
                        //alert(result);return;
                        var obj = new Function("return" + result)();
                        if(obj.result==1){
                            $.messager.alert("result","success!");
                            //alert("success");
                        }else{
                            $.messager.alert("result","fail!");
                            //alert("fail");
                        }
                    }
                });
    }

    function showS2S(a){
        window.location.href='s2s.php?oid='+a;
    }

    function upSigmadAdunit(f_id){
        $.messager.confirm('Confirm','Are you sure to publish？',function(r){
            if(r){
                var nurl = 'adunit_ajax.php?act=upSigmadUnit&f_id='+f_id;

                $.post(nurl,function(result){

                    if(result.result == 1){
                        $('#comp_list').datagrid('reload');
                        $.messager.alert('Publish Info', 'publish success', 'info');
                    } else {
                        $.messager.alert('Publish Error', result.msg, 'info');
                    }
                    scriptcampaign(cid);//运行campaign脚本
                },'json');
            }
        });
    }

    var cid = "83";

    function newApp(){
        $('#setting_dlg').dialog('open').dialog('setTitle','Create New Flight');
        $('#setting_edit').form('reset');
        url = 'unit_chk.php?type=1&s=add&f_cid='+cid;
    }

    function editEvent(row){
        //alert(row);
        var row = $('#comp_list').datagrid('getSelected');
        if (row){
            for(var i in row){
                if(row[i]!=null){
                    row[i] = row[i].replaceAll("&lt;","<").replaceAll("&gt;",">");
                }
            }
            $('#setting_dlg').dialog('open').dialog('setTitle','Edit');
            $('#setting_dlg').form('load',row);
            $("#f_geotag").combobox('setValue',row.f_geotag);
        }
        url = 'unit_chk.php?type=1&s=edit&eid='+row.f_id+'&f_cid='+cid;
    }

    if(cid!=''){
        var url = 'campaign_chk.php?type=1&s=edit';
    }else{
        var url = 'campaign_chk.php?type=1&s=add';
    }

    function Creatcampaign(){
        var name = $("#f_name").val();
        if(name==''){
            $.messager.alert("error","please input name!");
            //alert("please input name!");
        }
        var f_adname = $('#f_adid').combobox('getValue');
        var f_appid = $('#f_appid').combobox('getValue');
        var budget_val = $('#f_budget').val().length;
        var price_val = $('#f_price').val().length;
        if(budget_val > 11){
            $.messager.alert("error","Please enter budget value between 1 and 8!");
            return;
        }
        if(price_val > 11){
            $.messager.alert("error","Please enter price value between 1 and 8!");
            return;
        }
        var f_url = $('#f_url').val();
        var f_track_type = $('input[name="f_track_type"]').filter(':checked').val();

        if(f_url==''){
            $.messager.alert("error","please input Target Link!");
            return;
        }else{
            var Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
            var objExp=new RegExp(Expression);
            if(objExp.test(f_url)==false){
                $.messager.alert("error","Please enter a valid URL!");
                return;
            }

            if(f_track_type==2 || f_track_type==3){
                var t1 = f_url.indexOf("{CAMPAIGN_ID}");
                var t2 = f_url.indexOf("{CHANNEL_ID}");
                if(t1<0 || t2 <0){
                    var resinfo = "Please enter a valid URL，at least two macros（ {CAMPAIGN_ID} and {CHANNEL_ID}） in the target url，the URL is like “http://app.appsflyer.com/id2015231?pid=smartmadintl_int&c={CAMPAIGN_ID}&clickid={REF_ID}&sub_publisher={CHANNEL_ID}&sub5={SUB5}&sub4={SUB4}&sub3={SUB3}&sub2={SUB2}&sub1={SUB1}”";
                    $.messager.alert('Info', resinfo, 'info');
                    return;
                }
            }
        }
        url = url+"&f_adname="+encodeURIComponent(f_adname)+"&f_appid="+f_appid+"&f_track_type="+f_track_type+"&f_url="+encodeURIComponent(f_url);
        $('#campaign_edit').form('submit',
                {
                    url: url,
                    onSubmit: function(){
                        //return $(this).form('validate');
                    },
                    success: function(result){
                        //alert(result);return;
                        var rtmp = parseInt(result);
                        if(rtmp=="-9"){
                            $.messager.alert('Info','Same campaign has been existed');
                            return;
                        }
                        var res;
                        if(rtmp > 0){
                            res="save success";
                            //window.location.href="edit_campaign.php?cid="+result;
                        }else{
                            //res="save fail";
                            res="save success";
                        }
                        $.messager.alert('Info', res, 'info');
                        window.location.href="detail_campaign.php?cid=83";
                    }
                });
    }

    $.extend($.fn.validatebox.defaults.rules, {
        nurl: {
            validator: function (value) {
                return /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/.test(value);
            }
        }
    });

    function cancelcampaign(){
        window.location.href="campaign.php";
    }
    function getCompNowData(){
        $('#comp_list').datagrid('load',{date:$('#ndate2').datebox('getValue'),f_mobile:$('#f_mobile2').val(),f_card:$('#f_card2').val()});
    }

    function delEvent(row){
        $.messager.confirm('Confirm','Are you sure to delete？',function(r){
            if(r){
                $.ajax({
                    url: "unit_chk.php?type=1&s=del&eid="+row,
                    data: {id:row},
                    async: false,
                    success:function(result){
                        /*
                         var rtmp = parseInt(d);
                         var res;
                         if(rtmp > 0){
                         res="delete success";

                         $('#comp_list').datagrid('reload');
                         }else{
                         res="delete fail";
                         }
                         $.messager.alert('Info', res, 'info');
                         scriptcampaign(cid);//运行campaign脚本
                         */
                        var obj = new Function("return" + result)();
                        if(obj.result > 0){
                            var res="delete success";
                            $('#comp_list').datagrid('reload');
                            $.messager.alert('Info', res);
                            scriptcampaign(cid);//运行campaign脚本
                        }else{
                            $.messager.alert("error",obj.msg);

                        }
                    }
                });
            }
        });

    }

    function scriptcampaign(cid){
        jQuery.ajax({
            type: "get",
            url: "scriptcam.php",
            data:"cid="+cid,
            cache:false,
            beforeSend: function(XMLHttpRequest){
            },
            success: function(data, textStatus){
                //
            },
            complete: function(XMLHttpRequest, textStatus){
            },
            error: function(){
                //请求出错处理
            }
        });
    }
    if(document.addEventListener){
        window.addEventListener("load", onDocLoaded, false);
    }else if(document.attachEvent){
        window.attachEvent("onload", onDocLoaded);
    }




</script>
</body>
</html>