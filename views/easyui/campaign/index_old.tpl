{{template "../public/header.tpl"}}
<script type="text/javascript" src="/static/easyui/jquery-easyui/easyui_expand.js"></script>
<table id="dg" class="easyui-datagrid" title="" style="width:1000px;height:480px">
</table>
<div id="tb" style="padding:2px 5px;">
    <input class="easyui-combobox"
           name="dimension" id="dimension" style="width: 240px"
           data-options="
                    valueField:'id',
                    textField:'text',
                    data: [{
                        id: 0,
                        text: '活动日报'
                    },{
                        id: 1,
                        text: '活动组日报'
                    }],
                    multiple:false,
                    panelHeight:'auto'
            ">
    从：<input id="startDate" name="startDate" class="easyui-datebox"></input>
    到：<input id="endDate" name="endDate" class="easyui-datebox"></input>
    <a href="#" class="easyui-linkbutton" iconCls="icon-search" id="searchBtn">查询</a>
</div>

<script type="text/javascript">

    $(function () {

        $('#dimension').combobox({
            onSelect: function (rec) {
                if (rec.id == 0) {
                    $('#dg').datagrid('showColumn', 'Name');
                } else {
                    $('#dg').datagrid('hideColumn', 'Name');
                }
            }
        }).combobox('setValues', [0]);


        $('#startDate').datebox('setValue', new Date(new Date().getTime() - 7*24*60*60*1000).format('MM/dd/yyyy'));
        $('#endDate').datebox('setValue', new Date().format('MM/dd/yyyy'));

        $('#dg').datagrid({
            url:'getCampaignReport',
            rownumbers:true,
            singleSelect:true,
            method:'get',
            pagination:'true',
            pageSize: 20,
            toolbar:'#tb',
            footer:'#ft',
            columns:[[
                {field:'AdDate',title:'日期',width:80, formatter:adDateFormatter},
                {field:'Name',title:'活动名称',width:150},
                {field:'GroupName',title:'活动组名称',width:150},
                {field:'Imp',title:'展示数',width:100},
                {field:'Clk',title:'点击数',width:100},
                {field:'Ctr',title:'点击率',width:100},
                {field:'Ecpm',title:'eCPM',width:100, formatter: numberFormater},
                {field:'Ecpc',title:'eCPC',width:100},
                {field:'Spending',title:'广告主支出',width:100},
                {field:'Cost',title:'渠道支出',width:100},
            ]]
        });
        $('#searchBtn').bind('click', function () {

            var dg = $('#dg');
            dg.datagrid('loadData',[]);

            dg.datagrid('load', {
                dimension: $('#dimension').combobox('getValues'),
                startDate: $('#startDate').datebox("getValue"),
                endDate: $('#endDate').datebox("getValue")
            });
        });
    });
</script>