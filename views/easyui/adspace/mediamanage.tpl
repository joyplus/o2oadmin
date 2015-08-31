	{{template "../public/header.tpl"}}
	<body>
			<script type="text/javascript">
		        $(function(){
		            $('#dg').datagrid({
						columns:[[
							{field:'Id',title:'ID', width:100,  sortable:true
							},
							{
								field:"Name", title:"PDB媒体名称", width:150, sortable:true,
								formatter: function(value,row,index){
									if (value) {
										var html = '<div style="display:inline; padding-right:20px;">' + value +'</div>' + '<div style="float:right;" onclick="showOperation($(this), ' + index +')"><img src="/static/easyui/jquery-easyui/themes/icons/orp.png"/></div>'
										return html;
									} else {
										return value;
									}
								}
							},
							{
								field:"Description", title:"备注", width:300
							}							
						]]
		                
           			});
					
					$("#field1").keyup(function(event){
					    if(event.keyCode == 13){
					        filterData();
					    }
					});
        		});
				
				//新建需求方平台弹窗
				function addrow(){
					$('#dd').dialog({title: '新建PDB媒体'});
					$("#form1").form('clear');
					$('#savebutton').show();
					$('#cancelbutton').show();
				    $("#dd").dialog('open');
				}	
				
				function saveNew() {
					$("#form1").form('submit',{
                    url:'/pmp/media/updatemedia',
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
					var nameval = $("#field1").val();
					$("#dg").datagrid('reload', {name:nameval,page:'1',rows:'10'});
				}
				
				function showOperation(obj, index) {
					var pos = obj.position();
					$('#mm').menu('show', {
						left:pos.left + 20,
						top: pos.top + 80
					});
				}
				
				function viewRow() {
					$('#dd').dialog({title: '查看PDB媒体'});
					$('#savebutton').hide();
					$('#cancelbutton').show();
					$("#dd").dialog('open');
					var row = $('#dg').datagrid('getSelected');
					$("#form1").form('load', row);
					
				}
				
				function editRow() {
					$('#dd').dialog({title: '编辑PDB媒体'});
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
				            vac.ajax('/pmp/media/delmedia', {Id:row.Id}, 'POST', function(data){
				                if(data == "OK"){
				                    $("#dg").datagrid('reload');
				                }else{
				                    vac.alert(data);
				                }
				            })
				        }
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
				<div style="display:inline"> <a href="#" icon='icon-add' plain="true" onclick="addrow()" class="easyui-linkbutton" >新建PDB媒体</a></div> 
				<div style="float:right; padding-right:30px"> <a href="#" icon='icon-reload' plain="true" onclick="filterData()" class="easyui-linkbutton" >搜索</a></div>
				<div class="search" style="float:right; padding-left:5px;">	              	              
	              <input type="text" class="" id="field1" placeholder="请输入部分名称">				  
	          </div>
			</div>
		    <table id="dg" title="PDB媒体列表" style="width:1000px;height:550px"
	            url="/pmp/media/index"
		            pagination="true"
		            fitColumns="true" singleSelect="true"
					resizable="true" idField="Id" >
		        <thead>
		            <tr>
		                <th field="Id" width="100">ID</th>
		                <th field="Name" width="150">PDB媒体名称</th>
		                <th field="Description" width="300">备注</th>
		            </tr>
		        </thead>
		    </table>
			
			<div id="dd" class="easyui-dialog" title="新建PDB媒体" style="width:400px;height:400px;padding-top:10px;"
			        data-options="resizable:true,modal:true,closed:true,buttons:'#bb'">
				<div style="padding:20px 20px 40px 80px;" >
			    <form id="form1" method="post">
		            <table>
					    <tr><input name="Id" hidden="true"/> </tr>
		                <tr>
		                    <td>PDB媒体名称：</td>
		                    <td><input name="Name" class="easyui-validatebox" required="true" width="300px"/></td>
		                </tr>
		                <tr>
		                    <td>备注：</td>	
		                    <td><textarea name="Description" class="easyui-validatebox" width="300px" height="400px"></textarea></td>
		                </tr>
		            </table>
		        </form>
				</div>
			</div>	    
		    
			<div id="bb">
				<a href="#" id="savebutton" class="easyui-linkbutton" onclick="saveNew()">Save</a>
				<a href="#" id="cancelbutton" class="easyui-linkbutton" onclick="cancelNew()">Close</a>
			</div>
			
			<div id="mm" class="easyui-menu" style="width:120px;">
				<div onclick="javascript:viewRow()">查看</div>
				<div onclick="javascript:editRow()">编辑</div>
				<div onclick="javascript:deleteRow()">删除</div>
			</div>
			
		</body>
	</html>
