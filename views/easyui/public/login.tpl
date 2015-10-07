{{template "../public/header.tpl"}}
<link href="/static/css/login.css" rel="stylesheet"/>
<script type="text/javascript">
    var URL = "/public"
    //    $(function(){
    //        $("#dialog").dialog({
    //            closable:false,
    //            buttons:[{
    //            text:'登录',
    //            iconCls:'icon-save',
    //            handler:function(){
    //                fromsubmit();
    //            }
    //        },{
    //            text:'重置',
    //            iconCls:'icon-cancel',
    //            handler:function(){
    //                $("#form").from("reset");
    //            }
    //        }]
    //        });
    //    });
    function fromsubmit() {
        $("#loginform").form('submit', {
            url: URL + '/login?isajax=1',
            onSubmit: function () {
                return $("#form").form('validate');
            },
            success: function (r) {
                var r = $.parseJSON(r);
                if (r.status) {
                    location.href = URL + "/index"
                } else {
                    vac.alert(r.info);
                }
            }
        });
    }
    //这个就是键盘触发的函数
    var SubmitOrHidden = function (evt) {
        evt = window.event || evt;
        if (evt.keyCode == 13) {//如果取到的键值是回车
            fromsubmit();
        }

    }
    window.document.onkeydown = SubmitOrHidden;//当有键按下时执行函数
</script>

<body class="login-body">

<div class="container">

    <!--<form id="form" method="post">-->
    <!--<table >-->
    <!--<tr>-->
    <!--<td>用户名：</td><td><input type="text" class="easyui-validatebox" required="true" name="username" missingMessage="请输入用户名"/></td>-->
    <!--</tr>-->
    <!--<tr>-->
    <!--<td>密码：</td><td><input type="password" class="easyui-validatebox" required="true" name="password" missingMessage="请输入密码"/></td>-->
    <!--</tr>-->
    <!--</table>-->
    <!--</form>-->


    <form id="loginform" class="form-signin" action="#" method="post">
        <h2 class="form-signin-heading">广告平台</h2>

        <div class="login-wrap">
            <input type="text" class="form-control" placeholder="用户名" name="username" id="user_login" autofocus>
            <input type="password" class="form-control" name="password" id="user_pass" placeholder="密码">
            <button class="btn btn-lg btn-login btn-block" type="button" onclick="fromsubmit()">登录</button>

        </div>
    </form>
</div>
</body>
</html>