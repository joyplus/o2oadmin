	{{template "../public/header.tpl"}}
	<body>
			<script type="text/javascript">
				var demandid = {{.demandid}};
				var gridurl = "/pmp/demand/getDemandAdspaceByDemand?demandid=" + demandid;
		        $(function(){
		            $('#dg').datagrid({
						url:gridurl,
						columns:[[
							{field:'Id',title:'ID', width:100,  sortable:true
							},
							{
								field:"Name", title:"广告位名称", width:350, sortable:true,
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
								field:"DemandName", title:"所属需求方平台", width:150, sortable:true
							},
							{
								field:"SecretKey", title:"Secret Key", width:150
							},
							{
								field:"RealAdspaceKey", title:"Ad space key", width:150
							},
							{
								field:"Description", title:"备注", width:300
							},
							{
								field:"DemandId", hidden:true
							}														
						]]
		                
           			});
					
					$("#field1").keyup(function(event){
					    if(event.keyCode == 13){
					        filterData();
					    }
					});
					
					$('#demandcc').combobox({					    
					    valueField:'Id',
					    textField:'Name',
						url:'/pmp/demand/demands',
						readonly:true					
					});
					
        		});
				
				//新建广告位
				function addrow(){
					$('#dd').dialog({title: '新建广告位'});
					$("#form1").form('clear');
					$('#savebutton').show();
					$('#cancelbutton').show();
					$('#demandcc').combobox("setValue", demandid);
					// set set input editable
					$('#realadspacekeyid').prop('readonly', '');
					//$('#realadspacekeyid').addClass('easyui-validatebox');
				    $("#dd").dialog('open');
					
				}	
				
				function saveNew() {
					$("#form1").form('submit',{
                    url:'/pmp/adspace/updatedemandadspace',
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
					$('#dd').dialog({title: '查看广告位'});
					$('#savebutton').hide();
					$('#cancelbutton').show();
					// set set input non editable
					$('#realadspacekeyid').prop('readonly', 'readonly');
					//$('#realadspacekeyid').removeClass('easyui-validatebox');
					$("#dd").dialog('open');
					var row = $('#dg').datagrid('getSelected');
					$("#form1").form('load', row);
					
				}
				
				function editRow() {
					$('#dd').dialog({title: '编辑广告位'});
					$('#savebutton').show();
					$('#cancelbutton').show();
					// set set input non editable
					$('#realadspacekeyid').prop('readonly', 'readonly');
					//$('#realadspacekeyid').removeClass('easyui-validatebox');
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
				            vac.ajax('/pmp/adspace/deldemandadspace', {adspaceid:row.Id}, 'POST', function(data){
				                if(data == "OK"){
				                    $("#dg").datagrid('reload');
				                }else{
				                    vac.alert(data);
				                }
				            })
				        }
				    });
				}
				
				function back() {
					window.location = "/pmp/demand/index";
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
				<div style="display:inline"> <a href="#" icon='icon-add' plain="true" onclick="addrow()" class="easyui-linkbutton" >新建广告位</a></div> 
				<div style="display:inline"> <a href="#" icon='icon-back' plain="true" onclick="back()" class="easyui-linkbutton" >返回</a></div> 
				<div style="float:right; padding-right:30px"> <a href="#" icon='icon-reload' plain="true" onclick="filterData()" class="easyui-linkbutton" >搜索</a></div>
				<div class="search" style="float:right; padding-left:5px;">	              	              
	              <input type="text" class="" id="field1" placeholder="请输入部分名称"/>				  
	          </div>
			</div>
		    <table id="dg" title="广告位列表" style="width:1000px;height:550px"
	            url="/pmp/demand/getAdspaceByDemand?demandid=" + demandid
		            pagination="true"
		            fitColumns="true" singleSelect="true"
					resizable="true" idField="Id" >
		        <thead>
		            <tr>
		                <th field="Id" width="100">ID</th>
		                <th field="Name" width="250">广告位名称</th>
						<th field="DemandName" width="150">所属需求方平台</th>
						<th field="SecretKey" width="150">Secret Key</th>
						<th field="RealAdspaceKey" width="150">Ad space key</th>
		                <th field="Description" width="300">备注</th>
		            </tr>
		        </thead>
		    </table>
			
			<div id="dd" class="easyui-dialog" title="新建广告位" style="width:400px;height:400px;padding-top:10px;"
			        data-options="resizable:true,modal:true,closed:true,buttons:'#bb'">
				<div style="padding:20px 20px 40px 80px;" >
			    <form id="form1" method="post">
		            <table>
						<tr><input name="Id" hidden="true"/> </tr>
						
		                <tr>
		                    <td>广告位名称：</td>
		                    <td><input name="Name" class="easyui-validatebox" required="true"/></td>
		                </tr>
		                <tr>
		                    <td>所属需求方平台：</td>
		                    <td><input id="demandcc" name="DemandId" class="easyui-combobox" required="true" /></td>
		                </tr>
						<tr>
		                    <td>Secret Key：</td>
		                    <td><input name="SecretKey" class="easyui-validatebox" required="true"/></td>
		                </tr>
						<tr>
		                    <td>Ad space Key:</td>
		                    <td><input id="realadspacekeyid" class="easyui-validatebox" name="RealAdspaceKey" required="true"/></td>
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
			
			<div id="mm" class="easyui-menu" style="width:120px;">
				<div onclick="javascript:viewRow()">查看</div>
				<div onclick="javascript:editRow()">编辑</div>
				<div onclick="javascript:deleteRow()">删除</div>
			</div>
			
		</body>
	</html>