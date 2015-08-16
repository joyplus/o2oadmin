{{template "../public/header.tpl"}}

<table id="dg" class="easyui-datagrid" title="" style="width:700px;height:250px"
       data-options="rownumbers:true,singleSelect:true,url:'GetPdbMediaReportData',method:'get',toolbar:'#tb',footer:'#ft', pagination:'true'">
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

        function formatAdDate(value) {
            var d = new Date(value);
            return d.format('yyyy-MM-dd');
        }

        // 页面首次加载时选中两个选项
        $('#dimension').combobox('setValues', ['0', '1']);

        $('#startDate').datebox('setValue', new Date(new Date().getTime() - 7*24*60*60*1000).format('yyyy-MM-dd'));
        $('#endDate').datebox('setValue', new Date().format('yyyy-MM-dd'));

        $('#dg').datagrid({
            columns:[[
                {field:'PdbMediaName',title:'PDB媒体',width:100},
                {field:'PdbAdspaceName',title:'PDB广告位',width:100},
                {field:'AdDate',title:'日期',width:80, formatter:formatAdDate},
                {field:'ReqAll',title:'请求数',width:100},
                {field:'ReqSuccess',title:'请求有效广告数',width:100},
                {field:'FillRate',title:'填充率（%）',width:100},
                {field:'reqError',title:'错误数',width:100}
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