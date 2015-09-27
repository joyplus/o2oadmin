
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    {{template "../public/header.tpl"}}
    <!------Main Styles------>
</head>
<body>
<div id="main">
    <div id="content_area">
        <form id="campaign_edit" action="save"  method="post" enctype="multipart/form-data">
            <div id="creat_title">
                <span style="margin-left:10px">创建项目</span>
                <div style="float:right">
                    <a class="action_button" onclick="return Creatcampaign();" >保存</a>
                    <a class="cancel_button" onclick="return cancelcampaign();">取消</a>
                </div>
            </div>
            <div class="creat_area1" style="height:160px">
                <div style="float:left;width:100%;">
                    <div class="are_unit"><span class="unit_title">项目名称</span><input name="f_name" id="f_name" class="f1 easyui-textbox" data-options="required:true,missingMessage:'请输入名称!'"  style="height:32px;width:365px;" maxlength="20" /></div>
                </div>
                <div style="float:left;width:100%;">
                    <div class="are_unit"><span class="unit_title">预算</span><input name="f_budget" class="f1 easyui-numberbox" data-options="precision:2,required:true,missingMessage:'请输入预算!'" style="width:365px;height:32px;" id="f_budget" validType="length[1,8]"/></div>
                </div>
            </div>
        </form>
        <div style="height:10px;clear:both"></div>
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
        required:true,
        onSelect: function () {
            var adid = $('#f_adid').combobox('getValue');
            if(adid=="Please Choose Advertiser"){
                adid="";
            }
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
            pageSize:20,
            nowrap:false,
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
                $(".user_edit_text").linkbutton({ text:'Edit', plain:true, iconCls:'icon-edit'});
                $(".user_set_text").linkbutton({ text:'Setting', plain:true, iconCls:'icon-redo'});
            }
        });
    });

    var url = '';

    function Creatcampaign(){
        window.location.href="Detail/1";
    }

    $.extend($.fn.validatebox.defaults.rules, {
        nurl: {
            validator: function (value) {
                return /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/.test(value);
            }
        }
    });

    function cancelcampaign(){
        window.location.href="/pmp/performance";
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