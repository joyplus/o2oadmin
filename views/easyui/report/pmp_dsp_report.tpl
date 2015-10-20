{{template "../public/header.tpl"}}
<script type="text/javascript" src="/static/easyui/jquery-easyui/easyui_expand.js"></script>
<table id="dg" class="easyui-datagrid" title="" style="width:1000px;height:480px">
</table>
<div id="tb" style="padding:2px 5px;">
    <div class="dimensions"></div>
    从：<input id="startDate" name="startDate" class="easyui-datebox"></input>
    到：<input id="endDate" name="endDate" class="easyui-datebox"></input>
    <a href="#" class="easyui-linkbutton" iconCls="icon-search" id="searchBtn">查询</a>
</div>

<script type="text/javascript">

    $(function () {

        var dimensionData = [{
            id: 0,
            label: 'DSP',
            isChecked: true
        },{
            id: 1,
            label: 'DSP广告位',
            isChecked: true
        },{
            id: 2,
            label: 'PDB媒体',
            isChecked: true
        },{
            id: 3,
            label: 'PDB广告位',
            isChecked: true
        }];
        $(".dimensions").dropdownCheckbox({
            data: dimensionData,
            title: "二级维度"
        });

        // 页面首次加载时选中两个选项
        var dynaFields = ["DemandName", "DemandAdSpaceName", "PdbMediaName", "PdbAdSpaceName"];
        $(".dimensions").on('checked', function(val){
            var items = $(".dimensions").dropdownCheckbox('items');
            $.each(items, function(idx) {
                if (items[idx].isChecked) {
                    $('#dg').datagrid('showColumn', dynaFields[items[idx].id]);
                } else {
                    $('#dg').datagrid('hideColumn', dynaFields[items[idx].id]);
                }
            });
        });


        $('#startDate').datebox('setValue', new Date(new Date().getTime() - 7*24*60*60*1000).format('MM/dd/yyyy'));
        $('#endDate').datebox('setValue', new Date().format('MM/dd/yyyy'));

        $('#dg').datagrid({
            url:'getPdbDspReportData',
            rownumbers:true,
            singleSelect:true,
            method:'get',
            pagination:'true',
            pageSize: 20,
            toolbar:'#tb',
            footer:'#ft',
            columns:[[
                {field:'AdDate',title:'日期',width:80, formatter:adDateFormatter},
                {field:'DemandName',title:'DSP',width:100},
                {field:'DemandAdSpaceName',title:'DSP广告位',width:200},
                {field:'PdbMediaName',title:'PDB媒体',width:150},
                {field:'PdbAdSpaceName',title:'PDB广告位',width:100},
                {field:'ReqAll',title:'请求数',width:100},
                {field:'ReqSuccess',title:'请求有效广告数',width:100},
                {field:'FillRate',title:'填充率（%）',width:100, formatter: numberFormater},
                {field:'ReqError',title:'错误数',width:100},
                {field:'ReqTimeout',title:'请求超时数',width:100},
                {field:'Imp',title:'曝光数',width:100},
                {field:'Clk',title:'点击数',width:100},
                {field:'Ctr',title:'点击率（%）',width:100, formatter: numberFormater}
            ]]
        });
        $('#searchBtn').bind('click', function () {

            var dg = $('#dg');
            dg.datagrid('loadData',[]);

            dg.datagrid('load', {
                dimension: getDropdownCheckedValues($('.dimensions')),
                startDate: $('#startDate').datebox("getValue"),
                endDate: $('#endDate').datebox("getValue")
            });
        });
    });
</script>