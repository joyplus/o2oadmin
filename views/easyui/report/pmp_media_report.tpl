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
                    method:'get',
                    valueField:'id',
                    textField:'text',
                    multiple:true,
                    panelHeight:'auto'
            ">
    从：<input id="startDate" name="startDate" class="easyui-datebox"></input>
    到：<input id="endDate" name="endDate" class="easyui-datebox"></input>
    <a href="#" class="easyui-linkbutton" iconCls="icon-search" id="searchBtn">Search</a>
</div>

<script type="text/javascript">

    $(function () {

        /*
         <thead>
         <tr>
         <th data-options="field:'PdbMedia',width:80">PDB媒体</th>
         <th data-options="field:'PdbAdspace',width:100">PDB广告位</th>
         <th data-options="field:'Date',width:80,align:'right'">日期</th>
         <th data-options="field:'RequestCount',width:80,align:'right'">请求数</th>
         <th data-options="field:'RequestCountValid',width:240">请求有效广告数</th>
         <th data-options="field:'Rate',width:60,align:'center'">填充率（%）</th>
         <th data-options="field:'RequestCountError',width:240">错误数</th>
         </tr>
         </thead>

         */
        $('#dg').datagrid({
            columns:[[
                {field:'PdbMediaName',title:'PDB媒体',width:100},
                {field:'PdbAdspaceName',title:'PDB广告位',width:100},
                {field:'AdDate',title:'日期',width:100},
                {field:'ReqAll',title:'请求数',width:80},
                {field:'ReqSuccess',title:'请求有效广告数',width:80},
                {field:'FillRate',title:'填充率（%）',width:80},
                {field:'reqError',title:'错误数',width:80}
            ]]
        });
        $('#searchBtn').bind('click', function () {

            var dg = $('#dg');
            dg.datagrid('loadData',[]);

//            $.ajax({
//                url: 'pmp/Report/GetPdbMediaReportData',
//                type: 'POST',
//                data: {
//                    dimension: $('#dimension').combobox('getValue'),
//                    media: $('#media').combobox('getValue'),
//                    dt: $('#dt').combobox('getValue'),
//                    offset: dg.datagrid('pageSize') * dg.datagrid('pageNumber'),
//                    limit: dg.datagrid('pageSize')
//                },
//                success: function (data) {
//                    if (data.rows) {
//                        dg.datagrid('loadData', data);
//                    } else {
//                        dg.datagrid({data:{total: 0, rows: {}}});
//                    }
//                }
//            });

            dg.datagrid('load', {
                dimension: $('#dimension').combobox('getValue'),
                mediaName: $('#media').combobox('getValue'),
                startDate: $('#startDate').datebox("getValue"),
                endDate: $('#endDate').datebox("getValue")
            });
        });
    });
</script>