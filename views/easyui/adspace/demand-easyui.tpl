{{template "../public/header.tpl"}}
<script type="text/javascript" src="/static/easyui/jquery-easyui/accounting.min.js"></script>
<script type="text/javascript">
var date_format = 'yyyy-MM-dd';
var date_format_to_server = "yyyy-MM-dd";
var URL="/pmp/demand";
var maingridrowid = {{.maingridrowid}}
var initialDate = new Date();
initialDate.setDate(initialDate.getDate() - 3);
var startDate = initialDate.formatWithoutTime(date_format_to_server);
var title1, title2, title3, title4, title5, title6, title7;
updateTitles(initialDate);
$(function(){

    //广告主列表
    $("#datagrid").datagrid({
        title:'',
        url:URL+'/demandInfo',
        method:'POST',
		queryParams: {
			adspaceid:maingridrowid,
			startdate:startDate
		},
        fitColumns:true,
        striped:true,
        rownumbers:false,
        singleSelect:true,
        idField:'Name',
        pagination:false,
        columns:[[
            {field:'Name',title:'需求方名称',width:100,sortable:true},		
			{field:'DemandAdspaceName',title:'需求方平台广告位',width:120,sortable:true},
			{field:'Proportion',title:'权重',width:50,align:'center',editor:'text'
            },
			
			{field:'Day1',title:title1,width:100,align:'center',editor:'text',
                formatter: function(value,row, index){
                    if (value) return accounting.formatNumber(value);
                    return value;
                }
            },
			{field:'Day2',title:title2,width:100,align:'center',editor:'text',
                formatter: function(value,row, index){
                    if (value) return accounting.formatNumber(value);
                    return value;
                }
            },
			{field:'Day3',title:title3,width:100,align:'center',editor:'text',
                formatter: function(value,row, index){
                    if (value) return accounting.formatNumber(value);
                    return value;
                }
            },
			{field:'Day4',title:title4,width:100,align:'center',editor:'text',
                formatter: function(value,row, index){
                    if (value) return accounting.formatNumber(value);
                    return value;
                }
            },
			{field:'Day5',title:title5,width:100,align:'center',editor:'text',
                formatter: function(value,row, index){
                    if (value) return accounting.formatNumber(value);
                    return value;
                }
            },
			{field:'Day6',title:title6,width:100,align:'center',editor:'text',
                formatter: function(value,row, index){
                    if (value) return accounting.formatNumber(value);
                    return value;
                }
            },
			{field:'Day7',title:title7,width:100,align:'center',editor:'text',
                formatter: function(value,row, index){
                    if (value) return accounting.formatNumber(value);
                    return value;
                }
            },

			{field:'Operation', title:'操作',width:100,align:'center',
				formatter: function(value,row, index){
					return '<div><a href="#" icon="icon-edit" plain="true" onclick="edittherow($(this), ' + index +')" class="easyui-linkbutton" >编辑</a></div>';
				}
			},
			{field:'DemandAdspaceId', hidden:true}
        ]],
        onAfterEdit:function(index, data, changes){
            if(vac.isEmpty(changes)){
                return;
            }
            changes.DemandAdspaceId = data.DemandAdspaceId;
			changes.Operation = startDate; //use field Operation to pass start date
			//alert(JSON.stringify(changes))
            vac.ajax(URL+'/updateDailyAllocation', changes, 'POST', function(r){
                if(!r.status){
                    vac.alert(r.info);
                }else{
                    $("#datagrid").datagrid("reload");
                }
            })
        }
    });	
	initDate();
});			
				
function editrow(){
    if(!$("#datagrid").datagrid("getSelected")){
        vac.alert("请选择要编辑的行");
        return;
    }
    $('#datagrid').datagrid('beginEdit', vac.getindex("datagrid"));
}

function edittherow(obj, index) {
	$('#datagrid').datagrid('beginEdit', index);
	var savebutton = '<a href="#" icon="icon-save" plain="true" onclick="saverow($(this), ' + index + ')" class="easyui-linkbutton" >保存</a>';
	obj.parent().html(savebutton);
}

function saverow(obj,index){
    $('#datagrid').datagrid('endEdit', index);
	var editbutton = '<a href="#" icon="icon-edit" plain="true" onclick="edittherow($(this), ' + index +')" class="easyui-linkbutton" >编辑</a>';
	obj.parent().html(editbutton);
}

//刷新
function reloadrow(){
    $("#datagrid").datagrid("reload", {
			adspaceid:maingridrowid,
			startdate:startDate
		});
}

function onSelectStartDate(date) {
	var newDate = new Date(date);
	var endDateEl = $(this).parent().parent().find(".end");
	newDate.setDate(newDate.getDate() + 6);
	endDateEl.datebox('setValue', newDate.format(date_format));
	startDate = date.formatWithoutTime(date_format_to_server);
	changeColumns(date);
	reloadrow();
}

function onSelectEndDate(endDate) {
	var newDate = new Date(endDate);
	var startDateEl = $(this).parent().parent().find(".start");
	newDate.setDate(newDate.getDate() - 6);
	startDateEl.datebox('setValue', newDate.format(date_format));
	startDate = newDate.formatWithoutTime(date_format_to_server);
	changeColumns(startDate);
	reloadrow();
}

function initDate() {
	var startDateEl = $("body").find(".start");
	var endDateEl = $("body").find(".end");
	var newDate = new Date(startDate);
	startDateEl.datebox("setValue", newDate.format(date_format));
	newDate.setDate(newDate.getDate() + 6);
	endDateEl.datebox("setValue", newDate.format(date_format));
}

function updateTitles(d) {
	var newDate = new Date(d);
	title1 = newDate.formatWithoutTime(date_format_to_server);
	newDate.setDate(newDate.getDate() + 1);
	title2 = newDate.formatWithoutTime(date_format_to_server);
	newDate.setDate(newDate.getDate() + 1);
	title3 = newDate.formatWithoutTime(date_format_to_server);
	newDate.setDate(newDate.getDate() + 1);
	title4 = newDate.formatWithoutTime(date_format_to_server);
	newDate.setDate(newDate.getDate() + 1);
	title5 = newDate.formatWithoutTime(date_format_to_server);
	newDate.setDate(newDate.getDate() + 1);
	title6 = newDate.formatWithoutTime(date_format_to_server);
	newDate.setDate(newDate.getDate() + 1);
	title7 = newDate.formatWithoutTime(date_format_to_server);
}

function changeColumns(startDate) {
	updateTitles(startDate);

	$("#datagrid").datagrid({
		columns:[[
            {field:'Name',title:'需求方名称',width:100,sortable:true},		
			{field:'DemandAdspaceName',title:'需求方平台广告位',width:120,sortable:true},
			{field:'Proportion',title:'权重',width:50,align:'center',editor:'text'
            },
			
			{field:'Day1',title:title1,width:100,align:'center',editor:'text',
                formatter: function(value,row, index){
                    if (value) return accounting.formatNumber(value);
                    return value;
                }
            },
			{field:'Day2',title:title2,width:100,align:'center',editor:'text',
                formatter: function(value,row, index){
                    if (value) return accounting.formatNumber(value);
                    return value;
                }
            },
			{field:'Day3',title:title3,width:100,align:'center',editor:'text',
                formatter: function(value,row, index){
                    if (value) return accounting.formatNumber(value);
                    return value;
                }
            },
			{field:'Day4',title:title4,width:100,align:'center',editor:'text',
                formatter: function(value,row, index){
                    if (value) return accounting.formatNumber(value);
                    return value;
                }
            },
			{field:'Day5',title:title5,width:100,align:'center',editor:'text',
                formatter: function(value,row, index){
                    if (value) return accounting.formatNumber(value);
                    return value;
                }
            },
			{field:'Day6',title:title6,width:100,align:'center',editor:'text',
                formatter: function(value,row, index){
                    if (value) return accounting.formatNumber(value);
                    return value;
                }
            },
			{field:'Day7',title:title7,width:100,align:'center',editor:'text',
                formatter: function(value,row, index){
                    if (value) return accounting.formatNumber(value);
                    return value;
                }
            },

			{field:'Operation', title:'操作',width:100,align:'center',
				formatter: function(value,row, index){
					return '<div><a href="#" icon="icon-edit" plain="true" onclick="edittherow($(this), ' + index +')" class="easyui-linkbutton" >编辑</a></div>';
				}
			}
        ]]
		});
}

</script>
<body>
   <div style="margin:20px 0;"></div>
    <table>
        <tr>
            <td>Start Date:</td>
            <td>
                <input class="easyui-datebox start" data-options="onSelect:onSelectStartDate" editable="false"></input>
            </td>
            <td>End Date:</td>
            <td>
                <input class="easyui-datebox end" data-options="onSelect:onSelectEndDate" editable="false"></input>
            </td>
        </tr>
    </table>

<div style="margin:30px 0;"></div>
<table id="datagrid"></table>
</body>
</html>