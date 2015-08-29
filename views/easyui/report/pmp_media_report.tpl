{{template "../public/header.tpl"}}

<table id="dg" class="easyui-datagrid" title="" style="width:1000px;height:480px">
</table>
<div id="tb" style="padding:2px 5px;">
    <input class="easyui-combobox"
           name="dimension" id="dimension"
           data-options="
                    method:'get',
                    valueField:'id',
                    textField:'text',
                    data: [{
                        id: 0,
                        text: 'PDB广告位'
                    },{
                        id: 1,
                        text: '日期'
                    }],
                    multiple:true,
                    panelHeight:'auto'
            ">
    媒体:
    <input class="easyui-combobox"
           name="media" id="media"
           data-options="
                    url:'/pmp/adspace/medias',
                    method:'get',
                    valueField:'Id',
                    textField:'Text',
                    multiple:true,
                    panelHeight:'auto'
            ">
    从：<input id="startDate" name="startDate" class="easyui-datebox"></input>
    到：<input id="endDate" name="endDate" class="easyui-datebox"></input>
    <a href="#" class="easyui-linkbutton" iconCls="icon-search" id="searchBtn">查询</a>
</div>

<script type="text/javascript">

    $(function () {

        // 页面首次加载时选中两个选项
        var dynaFields = ["PdbAdSpaceName", "AdDate"];
        $('#dimension').combobox({
           onSelect: function (rec) {
               $('#dg').datagrid('showColumn', dynaFields[rec.id]);
           },
            onUnselect: function (rec) {
                $('#dg').datagrid('hideColumn', dynaFields[rec.id]);
            }
        }).combobox('setValues', ['0', '1']);


        $('#startDate').datebox('setValue', new Date(new Date().getTime() - 7*24*60*60*1000).format('MM/dd/yyyy'));
        $('#endDate').datebox('setValue', new Date().format('MM/dd/yyyy'));

        $('#dg').datagrid({
            url:'getPdbMediaReportData',
            rownumbers:true,
            singleSelect:true,
            method:'get',
            pagination:'true',
            pageSize: 20,
            toolbar:'#tb',
            footer:'#ft',
            columns:[[
                {field:'PdbMediaName',title:'PDB媒体',width:150},
                {field:'PdbAdSpaceName',title:'PDB广告位',width:200},
                {field:'AdDate',title:'日期',width:80, formatter:adDateFormatter},
                {field:'ReqAll',title:'请求数',width:100},
                {field:'ReqSuccess',title:'请求有效广告数',width:100},
                {field:'FillRate',title:'填充率（%）',width:100, formatter: numberFormater},
                {field:'ReqError',title:'错误数',width:100}
            ]]
        });
        $('#searchBtn').bind('click', function () {

            var dg = $('#dg');
            dg.datagrid('loadData',[]);

            dg.datagrid('load', {
                dimension: $('#dimension').combobox('getValues'),
                media: $('#media').combobox('getValues'),
                startDate: $('#startDate').datebox("getValue"),
                endDate: $('#endDate').datebox("getValue")
            });
        });
    });
</script>