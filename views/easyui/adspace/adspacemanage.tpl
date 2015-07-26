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
								field:"Name", title:"广告位名称", width:100
							},
							{
								field:"MediaName", title:"所属媒体", width:100
							},
							{
								field:"EstDaily", title:"广告位预估流量", width:50,
									formatter: function(value,row,index){
										if (value) {
											vs = value.split(",");
											var html = "预估曝光量:"+ accounting.formatNumber(vs[0]) + "<br/>";
											html += "预估点击量:" + accounting.formatNumber(vs[1]) + "<br/>";
											html += "预估点击率" + parseFloat(vs[2]).toFixed(2) * 100 + "%";
											return html;
											
										} else {
											return value;
										}
									}
							}
							
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
        		});
				
				//新建广告位弹窗
				function addrow(){
				    $("#dd").dialog('open');
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
				<div style="float:right; padding-right:30px"> <a href="#" icon='icon-reload' plain="true" onclick="reloadrow()" class="easyui-linkbutton" >刷新</a></div>
				<div class="search" style="float:right; padding-left:5px;">	              	              
	              <input type="text" class="" id="field1" placeholder="请输入搜索内容">				  
	          </div>
			<div style="float:right"><input id="mediacc" class="easyui-combobox" name="media" data-options="valueField:'Id',textField:'Text',url:'/pmp/adspace/medias'"></div>
			</div>
		    <table id="dg" title="广告位列表" style="width:1000px;height:650px"
	            url="/pmp/adspace/index"
		            pagination="true"
		            fitColumns="true" singleSelect="true"
					resizable="true" idField="Id" >
		        <thead>
		            <tr>
		                <th field="Id" width="50">ID</th>
		                <th field="Name" width="100">广告位名称</th>
		                <th field="MediaName" width="100">所属媒体</th>
						 <th field="EstDaily" width="50">广告位预估流量</th>
		            </tr>
		        </thead>
		    </table>
			
			<div id="dd" class="easyui-dialog" title="新建广告位" style="width:400px;height:400px;"
			        data-options="resizable:true,modal:true,closed:true,buttons:'#bb'">
				<div style="padding:20px 20px 40px 80px;" >
			    <form id="form1" method="post">
		            <table>
		                <tr>
		                    <td>用户名：</td>
		                    <td><input name="Username" class="easyui-validatebox" required="true"/></td>
		                </tr>
		                <tr>
		                    <td>昵称：</td>
		                    <td><input name="Nickname" class="easyui-validatebox" required="true"  /></td>
		                </tr>
		                <tr>
		                    <td>密码：</td>
		                    <td><input name="Password" type="password" class="easyui-validatebox" required="true"   validType="password[4,20]" /></td>
		                </tr>
		                <tr>
		                    <td>重复密码：</td>
		                    <td><input name="Repassword" type="password" class="easyui-validatebox" required="true"   validType="password[4,20]" /></td>
		                </tr>
		                <tr>
		                    <td>Email：</td>
		                    <td><input name="Email" class="easyui-validatebox" validType="email"  /></td>
		                </tr>
		                <tr>
		                    <td>状态：</td>
		                    <td>
		                        <select name="Status"  style="width:153px;" class="easyui-combobox " editable="false" required="true"  >
		                            <option value="2" >启用</option>
		                            <option value="1">禁用</option>
		                        </select>
		                    </td>
		                </tr>
		                <tr>
		                    <td>备注：</td>
		                    <td><textarea name="Remark" class="easyui-validatebox" validType="length[0,200]"></textarea></td>
		                </tr>
		            </table>
		        </form>
				</div>
			</div>	    
		    
			<div id="bb">
				<a href="#" class="easyui-linkbutton">Save</a>
				<a href="#" class="easyui-linkbutton">Close</a>
			</div>
		</body>
	</html>
