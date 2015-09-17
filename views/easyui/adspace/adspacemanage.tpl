	{{template "../public/header.tpl"}}
	<script type="text/javascript" src="/static/easyui/jquery-easyui/datagrid-detailview.js"></script>
	<script type="text/javascript" src="/static/easyui/jquery-easyui/accounting.min.js"></script>
	<body>
			<script type="text/javascript">
		        $(function(){
		            $('#dg').datagrid({
						columns:[[
							{field:'Id',title:'ID', width:50
							},
							{
								field:"Name", title:"PDB广告位名称", width:100,
								formatter: function(value,row,index){
									if (value) {
										var html = '<div style="display:inline; padding-right:20px;">' + value +'</div>' + '<div style="float:right;" onclick="showOperation($(this))"><img src="/static/easyui/jquery-easyui/themes/icons/orp.png"/></div>'
										return html;
									} else {
										return value;
									}
								}
							},
							{
								field:"MediaName", title:"所属PDB媒体", width:100
							},
							{
								field:"EstDaily", title:"PDB广告位预估流量", width:100,
									formatter: function(value,row,index){
										if (value) {
											vs = value.split(",");
											var html = "预估曝光量: "+ accounting.formatNumber(vs[0]) + "<br/>";
											html += "预估点击量: " + accounting.formatNumber(vs[1]) + "<br/>";
											html += "预估点击率: " + parseFloat(vs[2]).toFixed(2) * 100 + "%";
											return html;
											
										} else {
											return value;
										}
									}
							},
							{field:'MediaId', hidden:true},
							{field:'Description', hidden:true},
							{field:'PmpAdspaceKey', hidden:true}
														
						]],
		                view: detailview,
		                detailFormatter:function(index,row){
		                    return '<div class="ddv"><iframe frameborder="0" scrolling="auto" style="width:100%;min-height:300px;" ></iframe></div>';
		                },
		                onExpandRow: function(index,row){
							var ddv = $(this).datagrid('getRowDetail',index).find('div.ddv');
							var url = '/pmp/demand/demandInfo?adspaceid=' + row.Id + '&usetpl=true';
							var frame = ddv.find('iframe');
							frame.attr('src', url);					                    
				 		    
          				}
           			});
					
					$("#field1").keyup(function(event){
					    if(event.keyCode == 13){
					        filterData();
					    }
					});
					$("#field2").keyup(function(event){
					    if(event.keyCode == 13){
					        filterData2();
					    }
					});					
					initContextMenu();
					
        		});				
				
				//新建广告位弹窗
				function addrow(){
					$('#dd').dialog({title: '新建PDB广告位'});
					$("#form1").form('clear');
					$('#savebutton').show();
					$('#cancelbutton').show();
				    $("#dd").dialog('open');
				}	
				
				function saveNew() {
					$("#form1").form('submit',{
                    url:'/pmp/adspace/addadspace',
                    onSubmit:function(){
                        return $("#form1").form('validate');
                    },
                    success:function(r){
						$("#dd").dialog("close");
                       $("#dg").datagrid('reload');
                    }
					});
				}
				
				function cancelNew() {
					$("#dd").dialog("close");
				}	
				
				function filterData() {
					$('#dg').datagrid('loadData', {"total":0,"rows":[]});
					var name = $("#field1").val();
					var id = $('#mediacc').combobox('getValue');
					$("#dg").datagrid('load', {mediaid:id,adspacename:name,page:'1',rows:'10'});
				}
				
				function showOperation(obj) {
					var pos = obj.position();
					$('#mm').menu('show', {
						left:pos.left + 20,
						top: pos.top + 80
					});
				}
				
				function viewRow() {
					$('#dd').dialog({title: '查看广告位'});
					$('#savebutton').hide();
					$('#cancelbutton').show();
					$("#dd").dialog('open');
					var row = $('#dg').datagrid('getSelected');
					$("#form1").form('load', row);
					
				}
				
				function editRow() {
					$('#dd').dialog({title: '编辑广告位'});
					$('#demandcc').combobox({					    					   
						readonly:true					
					});
					$('#savebutton').show();
					$('#cancelbutton').show();
					$("#dd").dialog('open');
					var row = $('#dg').datagrid('getSelected');
					$("#form1").form('load', row);
				}
				
				function deleteRow() {
					$.messager.confirm('Confirm','你确定要删除?',function(r){
				        if (r){
				            var row = $("#dg").datagrid("getSelected");
				            if(!row){
				                vac.alert("请选择要删除的行");
				                return;
				            }
				            vac.ajax('/pmp/adspace/deladspace', {id:row.Id}, 'POST', function(data){
				                if(data == "OK"){
				                    $("#dg").datagrid('reload');
				                }else{
				                    vac.alert(data);
				                }
				            })
				        }
				    });
				}
				
				var allChanges = [];	
				var adspaceid;			
				function allocateToDemands() {
					$("#field2").val("");
					$('#demandcc').combobox("setValue", "需求方平台");
					var row = $('#dg').datagrid('getSelected');
					aid = row.Id;
					adspaceid = aid;
					allChanges.length = 0;
					$("#mapDemandDialog").dialog('open');
					$("#demandDataGrid").datagrid({
				        title:'',
				        url:'/pmp/demand/getDemandsMappingInfo',
				        method:'POST',
						queryParams: {
							adspaceid:aid,						
						},
				        fitColumns:true,
				        striped:true,
				        rownumbers:false,
				        singleSelect:true,
				        idField:'Name',
				        pagination:true,
				        columns:[[
							{field:'Ck',title:'',width:50,
								formatter: function(value,row,index){
									var c;
									if (value == 0) {
										c = '';
									} else {
										c = 'checked="checked"';
									}
									var html = '<input type="checkbox" onchange="onCheck($(this), ' + index + ')" ' + c + ' /> '
									return html;						
								}
							},
				            {field:'Name',title:'需求方平台广告位',width:350},		
							{field:'DemandName',title:'所属需求方平台',width:350},											
							{field:'Id', hidden:true},
							{field:'MappedAdspaceId', hidden:true},
							{field:'DemandId', hidden:true}
							
				        ]]
				    });	
					
				}	
				
				function onCheck(ckbox, index) {
					var row = $('#demandDataGrid').datagrid('getRows')[index];
					if (ckbox.is(':checked')) {
						row.Ck = 1;
					} else {
						row.Ck = 0;
					}
					if (allChanges.length > 0) {
						if (allChanges[allChanges.length - 1].Id == row.Id) {
							allChanges.pop();
						}
					}
					allChanges.push(row);
				}
				
				function cancelMapChanges() {
					allChanges = [];
					$("#mapDemandDialog").dialog('close');
				}
				
				function saveMapChanges() {
					var jsonstr = JSON.stringify(allChanges);
					$.ajax({url:'/pmp/adspacematrix/updateAdspaceMatrix', data:jsonstr,contentType:'application/json',dataType:'json', type:'POST', success:function(r){
				                if(r != "OK"){
				                    alert(r);
				                }else{
				                    $("#dg").datagrid("reload");
									$("#mapDemandDialog").dialog("close");
				                }
				            }});
				}
				
				function filterData2() {
					$('#demandDataGrid').datagrid('loadData', {"total":0,"rows":[]});
					var nameval = $("#field2").val();
					var demandid = $('#demandcc').combobox('getValue');
					$("#demandDataGrid").datagrid('reload', {demandid:demandid,adspaceid:adspaceid,name:nameval,page:'1',rows:'10'});
				}
				
				
				function resetFilter2() {
					$("#field2").val("");
					$('#demandcc').combobox("setValue", "需求方平台");
					$("#demandDataGrid").datagrid('reload', {adspaceid:adspaceid,page:'1',rows:'10'});
				}
				
				function initContextMenu() {
					// append a top menu item
					$('#mm').menu('appendItem', {
						text: '关联需求方平台',
						onclick: allocateToDemands
					});
					// append a menu separator
					$('#mm').menu('appendItem', {
						separator: true
					});
					$('#mm').menu('appendItem', {
						text: '查看',
						onclick: viewRow
					});
					$('#mm').menu('appendItem', {
						text: '编辑',
						onclick: editRow
					});
					$('#mm').menu('appendItem', {
						text: '删除',
						onclick: deleteRow
					});
				}
		    </script>
		    <style type="text/css">
		        .dv-table td{
		            border:0;
		        }
		        .dv-table input{
		            border:1px solid #ccc;
		        }
				.search {border-radius: 30px; font-size: 14px;}
		    </style>
			
		        
		    <div> 
				<div style="display:inline"> <a href="#" icon='icon-add' plain="true" onclick="addrow()" class="easyui-linkbutton" >新建PDB广告位</a></div> 
				<div style="float:right; padding-right:30px"> <a href="#" icon='icon-reload' plain="true" onclick="filterData()" class="easyui-linkbutton" >搜索</a></div>
				<div class="search" style="float:right; padding-left:5px;">	              	              
	              <input type="text" class="" id="field1" placeholder="请输入部分广告位名称">				  
	          </div>
			<div style="float:right"><input id="mediacc" class="easyui-combobox" name="media" data-options="valueField:'Id',textField:'Text',url:'/pmp/adspace/medias', panelHeight:'auto'"></div>
			</div>
		    <table id="dg" title="广告位列表" style="width:1000px;height:550px"
	            url="/pmp/adspace/index"
		            pagination="true"
		            fitColumns="true" singleSelect="true"
					resizable="true" idField="Id" >
		        <thead>
		            <tr>
		                <th field="Id" width="50">ID</th>
		                <th field="Name" width="100">PDB广告位名称</th>
		                <th field="MediaName" width="100">所属PDB媒体</th>
						 <th field="EstDaily" width="100">PDB广告位预估流量</th>
		            </tr>
		        </thead>
		    </table>
			
			<div id="dd" class="easyui-dialog" title="新建广告位" style="width:400px;height:400px;padding-top:10px;"
			        data-options="resizable:true,modal:true,closed:true,buttons:'#bb'">
				<div style="padding:20px 20px 40px 80px;" >
			    <form id="form1" method="post">
		            <table>
						<tr><td><input name="Id" hidden="true"/></td><td></td> </tr>
		                <tr>
		                    <td>广告位名称：</td>
		                    <td><input name="Name" class="easyui-validatebox" required="true"/></td>
		                </tr>
		                <tr>
		                    <td>所属媒体：</td>
		                    <td><input class="easyui-combobox" id="mediacc2" name="MediaId" data-options="valueField:'Id',textField:'Text',url:'/pmp/adspace/medias', panelHeight:'auto'" required="true"/></td>
		                </tr>
						<tr>
		                    <td>PmpAdspaceKey：</td>
		                    <td><input name="PmpAdspaceKey" readonly/></td>
		                </tr>
		                <tr>
		                    <td>备注：</td>
		                    <td><textarea style="height:150px;" name="Description" class="easyui-validatebox" validType="length[0,1000]"></textarea></td>
		                </tr>											
		            </table>
		        </form>
				</div>
			</div>	    
		    
			<div id="bb">
				<a href="#" id="savebutton" class="easyui-linkbutton" onclick="saveNew()">Save</a>
				<a href="#" id="cancelbutton" class="easyui-linkbutton" onclick="cancelNew()">Close</a>
			</div>
				
			<div id="mm" class="easyui-menu" style="width:120px;"></div>
			
			<div id="mapDemandDialog" class="easyui-dialog" title="关联需求方平台" style="width:800px;height:400px;padding-top:10px;"
			        data-options="resizable:true,modal:true,closed:true,buttons:'#mb'">
					<div style="margin:10px 0;"></div>
				    <table>
				        <tr>
							<td width="300px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
				            <td><input id="demandcc" name="DemandId" class="easyui-combobox" data-options="valueField:'Id',textField:'Name',url:'/pmp/demand/demands', panelHeight:'auto'" /></td>
				            <td>
				                <input id="field2" type="text" placeholder="请输入部分需求方平台名称"/>	
				            </td>
				            <td><a href="#" icon='icon-reload' plain="true" onclick="filterData2()" class="easyui-linkbutton">搜索</a></td>
				            <td>
				                <a href="#"  class="easyui-linkbutton" onclick="resetFilter2()">重置筛选</a>
				            </td>
				        </tr>
				    </table>
				
					<div style="margin:10px 0;"></div>
					<table id="demandDataGrid" style="height:270px"></table>
			</div>
			
			<div id="mb">
				<a href="#"  class="easyui-linkbutton" onclick="saveMapChanges()">保存</a>
				<a href="#"  class="easyui-linkbutton" onclick="cancelMapChanges()">取消</a>
			</div>
		</body>
	</html>