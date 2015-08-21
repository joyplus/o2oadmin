{{template "../public/header.tpl"}}

<table id="dg" class="easyui-datagrid" title="" style="width:1000px;height:480px">
</table>
<div id="tb" style="padding:2px 5px;">
    <input class="easyui-combobox"
           name="dimension" id="dimension" style="width: 240px"
           data-options="
                    method:'get',
                    valueField:'id',
                    textField:'text',
                    data: [{
                        id: 0,
                        text: 'DSP'
                    },{
                        id: 1,
                        text: 'DSP广告位'
                    },{
                        id: 2,
                        text: 'PDB媒体'
                    },{
                        id: 3,
                        text: 'PDB广告位'
                    }],
                    multiple:true,
                    panelHeight:'auto'
            ">
    从：<input id="startDate" name="startDate" class="easyui-datebox"></input>
    到：<input id="endDate" name="endDate" class="easyui-datebox"></input>
    <a href="#" class="easyui-linkbutton" iconCls="icon-search" id="searchBtn">查询</a>
</div>

<script type="text/javascript">

    $(function () {

        function formatAdDate(value) {
            var d = new Date(value);
            return d.format('yyyy-MM-dd');
        }

        // 页面首次加载时选中两个选项
        var dynaFields = ["DemandName", "DemandAdSpaceName", "PdbMediaName", "PdbAdSpaceName"];
        $('#dimension').combobox({
           onSelect: function (rec) {
               $('#dg').datagrid('showColumn', dynaFields[rec.id]);
           },
            onUnselect: function (rec) {
                $('#dg').datagrid('hideColumn', dynaFields[rec.id]);
            }
        }).combobox('setValues', [0, 1, 2, 3]);


        $('#startDate').datebox('setValue', new Date(new Date().getTime() - 7*24*60*60*1000).format('yyyy-MM-dd'));
        $('#endDate').datebox('setValue', new Date().format('yyyy-MM-dd'));

        $('#dg').datagrid({
            url:'GetPdbDspReportData',
            rownumbers:true,
            singleSelect:true,
            method:'get',
            pagination:'true',
            pageSize: 20,
            toolbar:'#tb',
            footer:'#ft',
            columns:[[
                {field:'AdDate',title:'日期',width:80, formatter:formatAdDate},
                {field:'DemandName',title:'DSP',width:100},
                {field:'DemandAdSpaceName',title:'DSP广告位',width:200},
                {field:'PdbMediaName',title:'PDB媒体',width:150},
                {field:'PdbAdSpaceName',title:'PDB广告位',width:100},
                {field:'ReqAll',title:'请求数',width:100},
                {field:'ReqSuccess',title:'请求有效广告数',width:100},
                {field:'FillRate',title:'填充率（%）',width:100},
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
                dimension: $('#dimension').combobox('getValues'),
                startDate: $('#startDate').datebox("getValue"),
                endDate: $('#endDate').datebox("getValue")
            });
        });
    });
</script>