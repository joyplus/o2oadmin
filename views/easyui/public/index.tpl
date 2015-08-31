{{template "../public/header.tpl"}}
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css">
<script type="text/javascript">
var URL="/public"
    $( function() {
        //生成树
        $("#tree").tree({
            url:URL+'/index',
            onClick:function(node){
                if(node.attributes.url == ""){
                    $(this).tree("toggle",node.target);
                    return false;
                }
                var href = node.attributes.url;
                var tabs = $("#tabs");
                if(href){
                    var content = '<iframe scrolling="auto" frameborder="0"  src="'+href+'" style="width:100%;height:100%;"></iframe>';
                }else{
                    var content = '未实现';
                }
                //已经存在tabs则选中它
                if(tabs.tabs('exists',node.text)){
                    //选中
                    tabs.tabs('select',node.text);
                    //refreshTab(node.text);
                }else{
                    //添加
                    tabs.tabs('add',{
                        title:node.text,
                        content:content,
                        closable:true,
                        cache:false,
                        fit:'true'
                    });
                }
            }
        });
        $("#tabs").tabs({
            width: $("#tabs").parent().width(),
            height: "auto",
            fit:true,
            border:false,
            onContextMenu : function(e, title) {
                e.preventDefault();
                $("#mm").menu('show', {
                    left : e.pageX,
                    top : e.pageY
                }).data('tabTitle', title);
            }
        });
        $('#mm').menu({
            onClick : function(item) {
                var curTabTitle = $(this).data('tabTitle');
                var type = $(item.target).attr('type');

                if (type === 'refresh') {
                    refreshTab(curTabTitle);
                    return;
                }

                if (type === 'close') {
                    var t = $("#tabs").tabs('getTab', curTabTitle);
                    if (t.panel('options').closable) {
                        $("#tabs").tabs('close', curTabTitle);
                    }
                    return;
                }

                var allTabs = $("#tabs").tabs('tabs');
                var closeTabsTitle = [];

                $.each(allTabs, function() {
                    var opt = $(this).panel('options');
                    if (opt.closable && opt.title != curTabTitle && type === 'closeOther') {
                        closeTabsTitle.push(opt.title);
                    } else if (opt.closable && type === 'closeAll') {
                        closeTabsTitle.push(opt.title);
                    }
                });
                for ( var i = 0; i < closeTabsTitle.length; i++) {
                    $("#tabs").tabs('close', closeTabsTitle[i]);
                }
            }
        });
        //修改配色方案
        $("#changetheme").change(function(){
            var theme = $(this).val();
            $.cookie("theme",theme); //新建cookie
            location.reload();
        });
        //设置已选theme的值
//        var themed = $.cookie('theme');
//        if(themed){
//            $("#changetheme").val(themed);
//        }
    });
    function refreshTab(title) {
        var tab = $("#tabs").tabs("getTab", title);
        $("#tabs").tabs("update", {tab: tab, options: tab.panel("options")});
    }
    function undo(){
        $('#tree').tree('expandAll');
    }
    function redo(){
        $('#tree').tree('collapseAll');
    }
    function dropdown_personalmenu(){
        if($('#dropdown-menu').hasClass('close')){
            $('#dropdown-menu').removeClass('close');
        }
        else{
            $('#dropdown-menu').addClass('close');
        }
    }
    function modifypassword(){
        $("#dialog").dialog({
            modal:true,
            title:"修改密码",
            width:400,
            height:250,
            buttons:[{
                text:'保存',
                iconCls:'icon-save',
                handler:function(){
                    $("#form1").form('submit',{
                        url:URL+'/changepwd',
                        onSubmit:function(){
                            return $("#form1").form('validate');
                        },
                        success:function(r){
                            var r = $.parseJSON( r );
                            if(r.status){
                                $.messager.alert("提示", r.info,'info',function(){
                                    location.href = URL+"/logout";
                                });
                            }else{
                                vac.alert(r.info);
                            }
                        }
                    });
                }
            },{
                text:'取消',
                iconCls:'icon-cancel',
                handler:function(){
                    $("#dialog").dialog("close");
                }
            }]
        });
    }
    //选择分组
    function selectgroup(group_id){
        $(this).addClass("current");
        vac.ajax(URL+'/index', {group_id:group_id}, 'GET', function(data){
            $("#tree").tree("loadData",data)
        })

    }
</script>

<style>

ul li{
    list-style: none;
}
.ht_nav {
    float: left;
    overflow: hidden;
    padding: 0 0 0 10px;
    margin: 0;
}
.ht_nav li{
    font:700 16px/2.5 'microsoft yahei';
    float: left;
    list-style-type: none;
    margin-right: 10px;

}
.ht_nav li a{
    text-decoration: none;
    color:#333;
}
.ht_nav li a.current, .ht_nav li a:hover{
    color:#F20;

}

.header {
    position: fixed;
    left: 0;
    right: 0;
    z-index: 1002;
}
.white-bg {
    background: #fff;
    border-bottom: 1px solid #f1f2f7;
}
.sidebar-toggle-box {
    float: left;
    padding-right: 15px;
    margin-top: 15px;
    margin-left: 10px;
}
.sidebar-toggle-box .fa-bars {
    cursor: pointer;
    display: inline-block;
    font-size: 20px;
}
.fa {
    display: inline-block;
    font-family: FontAwesome;
    font-style: normal;
    font-weight: normal;
    line-height: 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
::selection {
    background: #FF6C60;
    color: #fff;
}
.fa-bars:before {
    content: "\f0c9";
}
a.logo {
    font-size: 21px;
    color: #2e2e2e;
    float: left;
    margin-top: 15px;
    text-transform: uppercase;
}
a, a:hover, a:focus {
    text-decoration: none;
    outline: none;
}
a.logo span {
    color: #FF6C60;
}
.top-nav {
    margin-top: 7px;
}
.pull-right {
    float: right!important;
}
.top-nav ul.top-menu > li {
    margin-left: 10px;
}
.top-nav ul.top-menu > li > a {
    border: 1px solid #eeeeee;
    border-radius: 4px;
    -webkit-border-radius: 4px;
    padding: 6px;
    background: none;
    margin-right: 15px;
}
ul.top-menu > li > a {
    color: #666666;
    font-size: 16px;
    border-radius: 4px;
    -webkit-border-radius: 4px;
    border: 1px solid #f0f0f8 !important;
    padding: 2px 6px;
    margin-right: 15px;
}
.top-nav .username {
    font-size: 13px;
    color: #555555;
}
.top-nav .nav .caret {
    border-bottom-color: #A4AABA;
    border-top-color: #A4AABA;
}
.caret {
    display: inline-block;
    width: 0;
    height: 0;
    margin-left: 2px;
    vertical-align: middle;
    border-top: 4px solid;
    border-right: 4px solid transparent;
    border-left: 4px solid transparent;
}
ul.top-menu{
    margin-top: 5px;
}
.top-nav ul.top-menu > li .dropdown-menu.logout {
    width: 268px !important;
    position:absolute;
    top:50px;
}
.top-nav .dropdown-menu.extended.logout {
    top: 50px;
}
.top-nav li.dropdown .dropdown-menu {
    float: right;
    right: 0;
    left: auto;
}
.log-arrow-up {
    background: url("../img/arrow-up.png") no-repeat;
    width: 20px;
    height: 11px;
    position: absolute;
    right: 20px;
    top: -10px;
}
.dropdown-menu.extended.logout > li {
    float: left;
    text-align: center;
    width: 33.3%;
}
.dropdown-menu.extended.logout > li > a {
    color: #a4abbb;
    border-bottom: none !important;
}
.dropdown-menu.extended li a {
    padding: 15px 10px !important;
    display: inline-block;
}
.dropdown-menu.extended li a {
    border-bottom: 1px solid #EBEBEB !important;
    font-size: 12px;
    list-style: none;
}
.dropdown-menu>li>a {
    display: block;
    padding: 3px 20px;
    clear: both;
    font-weight: 400;
    line-height: 1.42857143;
    color: #333;
    white-space: nowrap;
}
.dropdown-menu.extended.logout > li:last-child {
    float: left;
    text-align: center;
    width: 100%;
    background: #a9d96c;
    border-radius: 0 0 3px 3px;
}
.dropdown-menu.extended.logout > li:last-child > a, .dropdown-menu.extended.logout > li:last-child > a:hover {
    color: #fff;
    border-bottom: none !important;
    text-transform: uppercase;
}
.dropdown-menu.extended.logout > li > a i {
    font-size: 17px;
}
.close{
    display:none;
}
.dropdown-menu.extended.logout > li > a > i {
    display: block;
}
.dropdown-menu.extended {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.176) !important;
}
.layout-panel-west{
    top:45px;
}
.layout-panel-center{
    top:125px;
}
</style>
<body class="easyui-layout" style="text-align:left">
<header class="header white-bg">
          <div class="sidebar-toggle-box">
              <div data-original-title="Toggle Navigation" data-placement="right" class="fa fa-bars tooltips"></div>
          </div>
          <!--logo start-->
          <a href="index.html" class="logo">PMP<span>管理平台</span></a>
          <!--logo end-->

          <div class="top-nav ">
              <ul class="nav pull-right top-menu">
                  <!-- user login dropdown start-->
                  <li class="dropdown">
                      <a data-toggle="dropdown" class="dropdown-toggle" href="#" aria-expanded="false" onclick="dropdown_personalmenu()">
                          <span class="username">{{.userinfo.Nickname}}</span>
                          <b class="caret"></b>
                      </a>
                      <ul class="dropdown-menu extended logout close" id="dropdown-menu" style="padding-left:0px;right:15px;background-color: white;">
                          <div class="log-arrow-up"></div>
                          <li><a href="#"><i class=" fa fa-suitcase"></i>Profile</a></li>
                          <li><a href="javascript:void(0);" onclick="modifypassword()"><i class="fa fa-cog"></i> 修改密码</a></li>
                          <li><a href="#"><i class="fa fa-bell-o"></i> Notification</a></li>
                          <li><a href="/public/logout" target="_parent"><i class="fa fa-key"></i> 退出登录</a></li>
                      </ul>
                  </li>
              </ul>
          </div>
</header>
<div region="north" border="false" style="overflow: hidden; width: 100%; height:45px;">
</div>
<div id="dialog">
    <div style="padding:20px 20px 40px 80px;" >
        <form id="form1" method="post">
            <table>
                <tr>
                    <td>旧密码</td>
                    <td><input type="password"  name="oldpassword" class="easyui-validatebox"  required="true" validType="password[5,20]" missingMessage="请填写当前使用的密码"/></td>
                </tr>
                <tr>
                    <td>新密码：</td>
                    <td><input type="password"  name="newpassword" class="easyui-validatebox" required="true" validType="password[5,20]" missingMessage="请填写需要修改的密码"  /></td>
                </tr>
                <tr>
                    <td>重复密码：</td>
                    <td><input type="password"  name="repeatpassword"  class="easyui-validatebox" required="true" validType="password[5,20]" missingMessage="请重复填写需要修改的密码" /></td>
                </tr>
            </table>
        </form>
    </div>
</div>
</div>
<div region="west" border="false" split="true" title="菜单"  tools="#toolbar" style="width:200px;padding:5px;" class="index_toolbar_fix">
    <ul id="tree"></ul>
</div>
<div region="center" border="false" >
    <div id="tabs" >
    </div>
</div>
<div id="toolbar">
    <a href="#" class="icon-undo" title="全部展开"  onclick="undo()"></a>
    <a href="#" class="icon-redo" title="全部关闭"  onclick="redo()"></a>
</div>
<!--右键菜单-->
<div id="mm" style="width: 120px;display:none;">
    <div iconCls='icon-reload' type="refresh">刷新</div>
    <div class="menu-sep"></div>
    <div  type="close">关闭</div>
    <div type="closeOther">关闭其他</div>
    <div type="closeAll">关闭所有</div>
</div>
</body>
</html>