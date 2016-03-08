	{{template "../public/header.tpl"}}
	<body>
	
	        <form id="ff" class="easyui-form" method="post" data-options="novalidate:true">
    <div id="tb" style="float:left; display:inline;padding:5px;">
	    <a href="#" icon='icon-save' plain="true" onclick="saverow()" class="easyui-linkbutton" >保存</a>
	    <a href="#" icon='icon-cancel' plain="true" onclick="delrow()" class="easyui-linkbutton" >删除</a>
	    <a href="#" icon='icon-reload' plain="true" onclick="reloadrow()" class="easyui-linkbutton" >刷新</a>
	</div>


    <div class="easyui-panel" title="基本信息" style="float:left; display:inline;width:100%">

		<div style="padding:10px 60px 20px 60px">
            <table cellpadding="5">
                <tr>
                    <td>期望金额:</td>
                    <td><input class="easyui-textbox" type="text" name="name" data-options="required:true"></input></td>
                </tr>
                <tr>
                    <td>贷款用途:</td>
                    <td>
                        <select class="easyui-combobox" name="language">
							<option value="0">不限</option>
							<option value="1">个人消费</option>
							<option value="2">购房首付</option>
							<option value="3">按揭买车</option>
							<option value="4">装修贷款</option>
							<option value="5">留学贷款</option>
							<option value="6">购买家具家电</option>
						</select>
                    </td>
                </tr>
				<tr>
                    <td>借款人身份:</td>
                    <td>
                        <select class="easyui-combobox" name="language">
							<option value="0">上班族</option>
							<option value="1">企业主</option>
							<option value="2">个体户</option>
							<option value="3">自由职业</option>

						</select>
                    </td>
                </tr>
				<tr>
                    <td>借款人年龄:</td>
                    <td><input class="easyui-textbox" type="text" name="name" data-options="required:true"></input></td>
                </tr>
				<tr>
                    <td>现居住地:</td>
                    <td>
                        <select class="easyui-combobox" name="language">
							<option value="1">上海</option>
							<option value="0">外地</option>
						</select>
                    </td>
                </tr>
            </table>


        </div>
    </div>
	
	    <div class="easyui-panel" title="贷款资质" style="float:right; display:inline;width:100%">
        <div style="padding:10px 60px 20px 60px">
            <table cellpadding="5">
                <tr>
                    <td>期望金额:</td>
                    <td><input class="easyui-textbox" type="text" name="name" data-options="required:true"></input></td>
                </tr>
                <tr>
                    <td>贷款用途:</td>
                    <td>
                        <select class="easyui-combobox" name="language">
							<option value="0">不限</option>
							<option value="1">个人消费</option>
							<option value="2">购房首付</option>
							<option value="3">按揭买车</option>
							<option value="4">装修贷款</option>
							<option value="5">留学贷款</option>
							<option value="6">购买家具家电</option>
						</select>
                    </td>
                </tr>
				<tr>
                    <td>借款人身份:</td>
                    <td>
                        <select class="easyui-combobox" name="language">
							<option value="0">上班族</option>
							<option value="1">企业主</option>
							<option value="2">个体户</option>
							<option value="3">自由职业</option>

						</select>
                    </td>
                </tr>
				<tr>
                    <td>借款人年龄:</td>
                    <td><input class="easyui-textbox" type="text" name="name" data-options="required:true"></input></td>
                </tr>
				<tr>
                    <td>现居住地:</td>
                    <td>
                        <select class="easyui-combobox" name="language">
							<option value="1">上海</option>
							<option value="0">外地</option>
						</select>
                    </td>
                </tr>
            </table>


        </div>
    </div>
	
	        </form>
	
    <script>
        function submitForm(){
            $('#ff').form('submit',{
                onSubmit:function(){
                    return $(this).form('enableValidation').form('validate');
                }
            });
        }
        function clearForm(){
            $('#ff').form('clear');
        }
    </script>
</body>
</html>