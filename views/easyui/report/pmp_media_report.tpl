{{template "../public/header.tpl"}}

<table id="dg" class="easyui-datagrid" title="" style="width:1000px;height:480px">
</table>
<div id="tb" style="padding:2px 5px;">
    <div class="dimensions"></div>
    <div class="medias"></div>
    从：<input id="startDate" name="startDate" class="easyui-datebox"></input>
    到：<input id="endDate" name="endDate" class="easyui-datebox"></input>
    <a href="#" class="easyui-linkbutton" iconCls="icon-search" id="searchBtn">查询</a>
</div>

<script type="text/javascript">

    $(function () {

        var myData = [{id: 0, label: "PDB广告位", isChecked: true },{id: 1, label: "日期", isChecked: true}];
        $(".dimensions").dropdownCheckbox({
            data: myData,
            title: "二级维度"
        });
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

        $.ajax({
            url: '/pmp/adspace/medias',
            type: 'GET',
            success: function (data) {
                console.log(JSON.stringify(data));
                var mediaData = [];//[{id: 0, label: "PDB广告位", isChecked: true },{id: 1, label: "日期", isChecked: true}];
                $.each(data, function (idx) {
                   var item = data[idx];
                   mediaData.push({
                       id: item.Id,
                       label: item.Text,
                       isChecked: true
                   });
                });
                $(".medias").dropdownCheckbox({
                    data: mediaData,
                    title: "媒体"
                });
            }
        });

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
                dimension: getDropdownCheckedValues($('.dimensions')),
                media: getDropdownCheckedValues($('.medias')),
                startDate: $('#startDate').datebox("getValue"),
                endDate: $('#endDate').datebox("getValue")
            });
        });
    });
</script>