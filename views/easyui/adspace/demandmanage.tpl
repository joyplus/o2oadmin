	{{template "../public/header.tpl"}}
	<body>
			<script type="text/javascript">
		        $(function(){
		            $('#dg').datagrid({
						columns:[[
							{field:'Id',title:'ID', width:100,  sortable:true
							},
							{
								field:"Name", title:"需求方平台名称", width:150, sortable:true
							},
							{
								field:"RequestUrlTemplate", title:"需求方平台URL", width:300
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
				    $("#dd").dialog('open');
				}	
				
				function saveNew() {
					$("#form1").form('submit',{
                    url:'/pmp/demand/adddemand',
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
				<div style="display:inline"> <a href="#" icon='icon-add' plain="true" onclick="addrow()" class="easyui-linkbutton" >新建需求方平台</a></div> 
				<div style="float:right; padding-right:30px"> <a href="#" icon='icon-reload' plain="true" onclick="filterData()" class="easyui-linkbutton" >刷新</a></div>
				<div class="search" style="float:right; padding-left:5px;">	              	              
	              <input type="text" class="" id="field1" placeholder="请输入部分名称">				  
	          </div>
			</div>
		    <table id="dg" title="需求方平台列表" style="width:1000px;height:550px"
	            url="/pmp/demand/index"
		            pagination="true"
		            fitColumns="true" singleSelect="true"
					resizable="true" idField="Id" >
		        <thead>
		            <tr>
		                <th field="Id" width="100">ID</th>
		                <th field="Name" width="150">需求方平台名称</th>
		                <th field="RequestUrlTemplate" width="300">需求方平台URL</th>
		            </tr>
		        </thead>
		    </table>
			
			<div id="dd" class="easyui-dialog" title="新建需求方平台" style="width:400px;height:400px;padding-top:10px;"
			        data-options="resizable:true,modal:true,closed:true,buttons:'#bb'">
				<div style="padding:20px 20px 40px 80px;" >
			    <form id="form1" method="post">
		            <table>
		                <tr>
		                    <td>需求方平台名称：</td>
		                    <td><input name="Name" class="easyui-validatebox" required="true"/></td>
		                </tr>
		                <tr>
		                    <td>需求方平台URL：</td>	
		                    <td><input name="RequestUrlTemplate" class="easyui-validatebox" required="true"/></td>
		                </tr>
		                <tr>
		                    <td>允许超时时间：</td>
		                    <td><input name="Timeout" class="easyui-validatebox" required="true"/>ms</td>
		                </tr>
		            </table>
		        </form>
				</div>
			</div>	    
		    
			<div id="bb">
				<a href="#" class="easyui-linkbutton" onclick="saveNew()">Save</a>
				<a href="#" class="easyui-linkbutton" onclick="cancelNew()">Close</a>
			</div>
		</body>
	</html>
