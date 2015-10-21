var url_prefix = "/pmp/campaign";
var url_separator = "/";

function bindCategoryChange() {
//	$("#category_two_id").css("display","none");
//	$("#category_three_id").css("display","none");
	
	$("#category_one_id").bind("change", function(){
		$("#category_three_id").css("display","none");
		if ($(this).val() != "") {
			parentId = $(this).val();
			$("#category_two_id").css("display","inline");
			jQuery.ajax({
	            type: "get",
	            url: url_prefix + url_separator + "getCategoryByParentId",
	            data:"parentId=" + parentId,
	            cache:false,
	            beforeSend: function(XMLHttpRequest){
	            },
	            success: function(data, textStatus){
					if ("success" == textStatus) {
						if (data != "") {
							$("#category_two_id").css("display","inline");
							$("#category_two_id").html('<option value="">请选择二级分类</option>	');
							$.each(data, function(key, value) {
								optionhtml = "<option value='" + value.Id + "'>" + value.Name + "</option>";	
								$("#category_two_id").append(optionhtml);
							    
							});
						} else {
							$("#category_two_id").css("display","none");			
						}
						
					}
					
				}
			});
		} else {
			$("#category_two_id").css("display","none");
		}
	});
	
	$("#category_two_id").bind("change", function(){
		if ($(this).val() != "") {
			parentId = $(this).val();
			jQuery.ajax({
	            type: "get",
	            url: url_prefix + url_separator + "getCategoryByParentId",
	            data:"parentId=" + parentId,
	            cache:false,
	            beforeSend: function(XMLHttpRequest){
	            },
	            success: function(data, textStatus){
					if ("success" == textStatus) {
						if (data != "") {
							$("#category_three_id").css("display","inline");
							$("#category_three_id").html('<option value="">请选择三级分类</option>	');
							$.each(data, function(index, value) {
								optionhtml = "<option value='" + value.Id + "'>" + value.Name + "</option>";	
								$("#category_three_id").append(optionhtml);
							    
							});
						} else {
							$("#category_three_id").css("display","none");
						}
						
					}
					
				}
			});
		} else {
			$("#category_three_id").css("display","none");
		}
	});
}

function TreeNode(text, href) {
	this.text = text;
	this.href = href;
	//this.icon = "glyphicon glyphicon-stop";
	//this.selectedIcon = "glyphicon glyphicon-stop";
	this.nodes = null;
	this.color = "blue";
	this.backColor = "#FFFFFF";
	this.selectable = true;
}	

function TreeNode(text) {
	this.text = text;
	//this.href = href;
	//this.icon = "glyphicon glyphicon-stop";
	//this.selectedIcon = "glyphicon glyphicon-stop";
	this.nodes = null;
	this.color = "blue";
	this.backColor = "#FFFFFF";
	this.selectable = true;
}		
	
function getTree() {
	var treeNodes = new Array();
	var p1 = new TreeNode("人口属性");
	var p2 = new TreeNode("设备属性");
	var p3 = new TreeNode("地理位置");
	var p4 = new TreeNode("应用兴趣");
	var p5 = new TreeNode("游戏偏好");
	var p6 = new TreeNode("消费偏好");
	p1.selectable = false;
	p2.selectable = false;
	p3.selectable = false;
	p4.selectable = false;
	p5.selectable = false;
	p6.selectable = false;
	
	treeNodes.push(p1);
	treeNodes.push(p2);
	treeNodes.push(p3);
	treeNodes.push(p4);
	treeNodes.push(p5);
	treeNodes.push(p6);
						
	var p11 = new TreeNode("性别");
	var p12 = new TreeNode("人生阶段");
	var p13 = new TreeNode("身份职业");
	var p14 = new TreeNode("婚育阶段");
	var p15 = new TreeNode("车辆条件");
	p1.nodes = new Array();	
	p11.selectable = false;
	p12.selectable = false;
	p13.selectable = false;
	p14.selectable = false;
	p15.selectable = false;
		
	p1.nodes.push(p11);	
	p1.nodes.push(p12);
	p1.nodes.push(p13);	
	p1.nodes.push(p14);
	p1.nodes.push(p15);	
	
	var p111 = new TreeNode("男");
	var p112 = new TreeNode("女");
	p11.nodes = new Array();
	p11.nodes.push(p111);	
	p11.nodes.push(p112);			
	
	var p121 = new TreeNode("少年");
	var p122 = new TreeNode("青年");
	var p123 = new TreeNode("中年");
	var p124 = new TreeNode("老年");
	p12.nodes = new Array();
	p12.nodes.push(p121);
	p12.nodes.push(p122);
	p12.nodes.push(p123);
	p12.nodes.push(p124);
	
	var p131 = new TreeNode("大学生");
	var p132 = new TreeNode("非大学生");
	p13.nodes = new Array();
	p13.nodes.push(p131);
	p13.nodes.push(p132);
	
	var p141 = new TreeNode("已婚");
	var p142 = new TreeNode("未婚");
	p14.nodes = new Array();
	p14.nodes.push(p141);
	p14.nodes.push(p142);
	
	var p151 = new TreeNode("有车");
	var p152 = new TreeNode("无车");
	p15.nodes = new Array();
	p15.nodes.push(p151);
	p15.nodes.push(p152);
	
	var p21 = new TreeNode("品牌");
	var p22 = new TreeNode("上市价");
	var p23 = new TreeNode("机型");
	var p24 = new TreeNode("设备品类");
	var p25 = new TreeNode("功能特性");
	var p26 = new TreeNode("屏幕尺寸");
	var p27 = new TreeNode("操纵系统");
	var p28 = new TreeNode("硬件特性");
	var p29 = new TreeNode("运营商");
	var p2_10 = new TreeNode("网络");
	p2.nodes = new Array();	
	p21.selectable = false;
	p22.selectable = false;
	p23.selectable = false;
	p24.selectable = false;
	p25.selectable = false;
	p26.selectable = false;
	p27.selectable = false;
	p28.selectable = false;
	p29.selectable = false;
	p2_10.selectable = false;
	p2.nodes.push(p21);
	p2.nodes.push(p22);
	p2.nodes.push(p23);
	p2.nodes.push(p24);
	p2.nodes.push(p25);
	p2.nodes.push(p26);
	p2.nodes.push(p27);
	p2.nodes.push(p28);
	p2.nodes.push(p29);
	p2.nodes.push(p2_10);
	
	var p211 = new TreeNode("苹果");
	var p212 = new TreeNode("三星");
	var p213 = new TreeNode("小米");
	var p214 = new TreeNode("华为");
	var p215 = new TreeNode("步步高");
	var p216 = new TreeNode("OPPO");
	var p217 = new TreeNode("联想");
	var p218 = new TreeNode("宇龙酷派");
	var p219 = new TreeNode("中兴");
	var p21_10 = new TreeNode("魅族");
	var p21_11 = new TreeNode("金立");
	var p21_12 = new TreeNode("HTC");
	var p21_13 = new TreeNode("索尼");
	var p21_14 = new TreeNode("海信");
	var p21_15 = new TreeNode("LG");
	p21.nodes = new Array();
	p21.nodes.push(p211);	
	p21.nodes.push(p212);
	p21.nodes.push(p213);
	p21.nodes.push(p214);
	p21.nodes.push(p215);
	p21.nodes.push(p216);
	p21.nodes.push(p217);
	p21.nodes.push(p218);
	p21.nodes.push(p219);
	p21.nodes.push(p21_10);
	p21.nodes.push(p21_11);
	p21.nodes.push(p21_12);
	p21.nodes.push(p21_13);
	p21.nodes.push(p21_14);
	p21.nodes.push(p21_15);
	
	var p221 = new TreeNode("1~499");
	var p222 = new TreeNode("500~999");
	var p223 = new TreeNode("1000~1999");
	var p224 = new TreeNode("2000~3999");
	var p225 = new TreeNode("4000以上");
	p22.nodes = new Array();
	p22.nodes.push(p221);	
	p22.nodes.push(p222);
	p22.nodes.push(p223);
	p22.nodes.push(p224);
	p22.nodes.push(p225);
	
	var p231 = new TreeNode("IPhone6 Plus");
	var p232 = new TreeNode("IPhone6");
	var p233 = new TreeNode("三星Galaxy S6");
	var p234 = new TreeNode("三星Galaxy Note5");
	var p235 = new TreeNode("华为荣耀7");
	p23.nodes = new Array();
	p23.nodes.push(p231);	
	p23.nodes.push(p232);
	p23.nodes.push(p233);
	p23.nodes.push(p234);
	p23.nodes.push(p235);
	
	var p241 = new TreeNode("手机");
	var p242 = new TreeNode("平板");
	var p243 = new TreeNode("智能电视");
	var p244 = new TreeNode("智能手表");
	var p245 = new TreeNode("智能手环");
	p24.nodes = new Array();
	p24.nodes.push(p241);	
	p24.nodes.push(p242);
	p24.nodes.push(p243);
	p24.nodes.push(p244);
	p24.nodes.push(p245);
	
	var p251 = new TreeNode("音乐");
	var p252 = new TreeNode("美颜");
	var p253 = new TreeNode("老人机");
	var p254 = new TreeNode("摄影手机");
	var p255 = new TreeNode("高端商务");
	var p256 = new TreeNode("高性价比");
	p25.nodes = new Array();
	p25.nodes.push(p251);	
	p25.nodes.push(p252);
	p25.nodes.push(p253);
	p25.nodes.push(p254);
	p25.nodes.push(p255);
	p25.nodes.push(p256);
	
	var p261 = new TreeNode("3.5英寸");
	var p262 = new TreeNode("4.0英寸");
	var p263 = new TreeNode("5.0英寸");
	p26.nodes = new Array();
	p26.nodes.push(p261);	
	p26.nodes.push(p262);
	p26.nodes.push(p263);
	
	var p271 = new TreeNode("iOS");
	var p272 = new TreeNode("WP");
	var p273 = new TreeNode("Android");
	p27.nodes = new Array();
	p27.nodes.push(p271);	
	p27.nodes.push(p272);
	p27.nodes.push(p273);
	
	var p281 = new TreeNode("8核芯片");
	var p282 = new TreeNode("陀螺仪");
	var p283 = new TreeNode("NFC芯片");
	var p284 = new TreeNode("蓝牙");
	var p285 = new TreeNode("双卡双待");
	p28.nodes = new Array();
	p28.nodes.push(p281);	
	p28.nodes.push(p282);
	p28.nodes.push(p283);
	p28.nodes.push(p284);
	p28.nodes.push(p285);
	
	var p291 = new TreeNode("中国移动");
	var p292 = new TreeNode("中国联通");
	var p293 = new TreeNode("中国电信");
	p29.nodes = new Array();
	p29.nodes.push(p291);	
	p29.nodes.push(p292);
	p29.nodes.push(p293);
	
	var p2_10_1 = new TreeNode("WIFI");
	var p2_10_2 = new TreeNode("4G");
	var p2_10_3 = new TreeNode("3G");
	var p2_10_4 = new TreeNode("2G");
	p2_10.nodes = new Array();
	p2_10.nodes.push(p2_10_1);	
	p2_10.nodes.push(p2_10_2);
	p2_10.nodes.push(p2_10_3);
	p2_10.nodes.push(p2_10_4);
	
	var p31 = new TreeNode("常去场所");
	p31.selectable = false;
	p3.nodes = new Array();
	p3.nodes.push(p31);
	
	var p311 = new TreeNode("高端场所");
	var p312 = new TreeNode("交通枢纽");
	var p313 = new TreeNode("科教文化");
	var p314 = new TreeNode("旅游景区");
	var p315 = new TreeNode("医院");
	p311.selectable = false;
	p312.selectable = false;
	p313.selectable = false;
	p31.nodes = new Array();
	p31.nodes.push(p311);
	p31.nodes.push(p312);
	p31.nodes.push(p313);
	p31.nodes.push(p314);
	p31.nodes.push(p315);
	
	var p3111 = new TreeNode("四五星级酒店");
	var p3112 = new TreeNode("高尔夫球会");
	var p3113 = new TreeNode("滑雪场");
	p311.nodes = new Array();
	p311.nodes.push(p3111);
	p311.nodes.push(p3112);
	p311.nodes.push(p3113);
	
	var p3121 = new TreeNode("飞机场");
	var p3122 = new TreeNode("火车站");
	p312.nodes = new Array();
	p312.nodes.push(p3121);
	p312.nodes.push(p3122);
	
	var p3131 = new TreeNode("大学");
	var p3132 = new TreeNode("中学");
	p313.nodes = new Array();
	p313.nodes.push(p3131);
	p313.nodes.push(p3132);
	
	var p41 = new TreeNode("应用类别");
	p41.selectable = false;
	p4.nodes = new Array();
	p4.nodes.push(p41);
	
	var p411 = new TreeNode("网购");
	var p412 = new TreeNode("教育");
	var p413 = new TreeNode("阅读");
	var p414 = new TreeNode("资讯");
	var p415 = new TreeNode("社交");
	var p416 = new TreeNode("通讯");
	var p417 = new TreeNode("影音");
	var p418 = new TreeNode("商旅出行");
	var p419 = new TreeNode("家居");
	var p41_10 = new TreeNode("健康");
	var p41_11 = new TreeNode("生活");
	var p41_12 = new TreeNode("工作");
	var p41_13 = new TreeNode("手机工具");
	var p41_14 = new TreeNode("金融理财");
	var p41_15 = new TreeNode("房产");
	var p41_16 = new TreeNode("母婴");
	var p41_17 = new TreeNode("娱乐");
	var p41_18 = new TreeNode("汽车");
	var p41_19 = new TreeNode("个护美容");
	p411.selectable = false;
	p412.selectable = false;
	p413.selectable = false;
	p414.selectable = false;
	p415.selectable = false;
	p416.selectable = false;
	p417.selectable = false;
	p418.selectable = false;
	p419.selectable = false;
	p41_10.selectable = false;
	p41_11.selectable = false;
	p41_12.selectable = false;
	p41_13.selectable = false;
	p41_14.selectable = false;
	p41_15.selectable = false;
	p41_16.selectable = false;
	p41_17.selectable = false;
	p41_18.selectable = false;
	p41_19.selectable = false;
	p41.nodes = new Array();
	p41.nodes.push(p411);
	p41.nodes.push(p412);
	p41.nodes.push(p413);
	p41.nodes.push(p414);
	p41.nodes.push(p415);
	p41.nodes.push(p416);
	p41.nodes.push(p417);
	p41.nodes.push(p418);
	p41.nodes.push(p419);
	p41.nodes.push(p41_10);
	p41.nodes.push(p41_11);
	p41.nodes.push(p41_12);
	p41.nodes.push(p41_13);
	p41.nodes.push(p41_14);
	p41.nodes.push(p41_15);
	p41.nodes.push(p41_16);
	p41.nodes.push(p41_17);
	p41.nodes.push(p41_18);
	p41.nodes.push(p41_19);
	
	var p4111 = new TreeNode("网上商城");
	var p4112 = new TreeNode("团购");
	var p4113 = new TreeNode("导购");
	var p4114 = new TreeNode("比价");
	var p4115 = new TreeNode("购物分享");
	p411.nodes = new Array();
	p411.nodes.push(p4111);
	p411.nodes.push(p4112);
	p411.nodes.push(p4113);
	p411.nodes.push(p4114);
	p411.nodes.push(p4115);
	
	var p4121 = new TreeNode("早教");
	var p4122 = new TreeNode("课外辅导");
	var p4123 = new TreeNode("留学出国");
	var p4124 = new TreeNode("外语");
	var p4125 = new TreeNode("专业技能");
	var p4126 = new TreeNode("管理");
	var p4127 = new TreeNode("文化艺术");
	var p4128 = new TreeNode("图书音像");
	var p4129 = new TreeNode("考试");
	var p412_10 = new TreeNode("方言");
	var p412_11 = new TreeNode("课程管理");
	p412.nodes = new Array();
	p412.nodes.push(p4121);
	p412.nodes.push(p4122);
	p412.nodes.push(p4123);
	p412.nodes.push(p4124);
	p412.nodes.push(p4125);
	p412.nodes.push(p4126);
	p412.nodes.push(p4127);
	p412.nodes.push(p4128);
	p412.nodes.push(p4129);
	p412.nodes.push(p412_10);
	p412.nodes.push(p412_11);
	
	var p4131 = new TreeNode("胎教读物");
	var p4132 = new TreeNode("少儿读物");
	var p4133 = new TreeNode("小说");
	var p4134 = new TreeNode("期刊杂志");
	var p4135 = new TreeNode("漫画");
	var p4136 = new TreeNode("词典翻译");
	var p4137 = new TreeNode("阅读平台");
	var p4138 = new TreeNode("诗词名著");
	var p4139 = new TreeNode("笑话");
	var p413_10 = new TreeNode("心理");
	var p413_11 = new TreeNode("科普");
	p413.nodes = new Array();
	p413.nodes.push(p4131);
	p413.nodes.push(p4132);
	p413.nodes.push(p4133);
	p413.nodes.push(p4134);
	p413.nodes.push(p4135);
	p413.nodes.push(p4136);
	p413.nodes.push(p4137);
	p413.nodes.push(p4138);
	p413.nodes.push(p4139);
	p413.nodes.push(p413_10);
	p413.nodes.push(p413_11);
	
	var p4141 = new TreeNode("新闻资讯");
	var p4142 = new TreeNode("娱乐资讯");
	var p4143 = new TreeNode("学术资讯");
	var p4144 = new TreeNode("体育资讯");
	var p4145 = new TreeNode("财经资讯");
	var p4146 = new TreeNode("科技资讯");
	var p4147 = new TreeNode("游戏攻略");
	p414.nodes = new Array();
	p414.nodes.push(p4141);
	p414.nodes.push(p4142);
	p414.nodes.push(p4143);
	p414.nodes.push(p4144);
	p414.nodes.push(p4145);
	p414.nodes.push(p4146);
	p414.nodes.push(p4147);
	
	var p4151 = new TreeNode("微博");
	var p4152 = new TreeNode("婚恋");
	var p4153 = new TreeNode("交友社区");
	var p4154 = new TreeNode("图片分享");
	var p4155 = new TreeNode("博客论坛");
	p415.nodes = new Array();
	p415.nodes.push(p4151);
	p415.nodes.push(p4152);
	p415.nodes.push(p4153);
	p415.nodes.push(p4154);
	p415.nodes.push(p4155);
	
	var p4161 = new TreeNode("即时通讯");
	var p4162 = new TreeNode("短信");
	var p4163 = new TreeNode("邮件");
	var p4164 = new TreeNode("电话");
	p416.nodes = new Array();
	p416.nodes.push(p4161);
	p416.nodes.push(p4162);
	p416.nodes.push(p4163);
	p416.nodes.push(p4164);
	
	var p4171 = new TreeNode("电台");
	var p4172 = new TreeNode("音乐");
	var p4173 = new TreeNode("视频");
	var p4174 = new TreeNode("秀场");
	var p4175 = new TreeNode("有声读物");
	p417.nodes = new Array();
	p417.nodes.push(p4171);
	p417.nodes.push(p4172);
	p417.nodes.push(p4173);
	p417.nodes.push(p4174);
	p417.nodes.push(p4175);
	
	var p4181 = new TreeNode("地图");
	var p4182 = new TreeNode("导航");
	var p4183 = new TreeNode("代驾");
	var p4184 = new TreeNode("打车");
	var p4185 = new TreeNode("租车");
	var p4186 = new TreeNode("航班");
	var p4187 = new TreeNode("公交");
	var p4188 = new TreeNode("火车");
	var p4189 = new TreeNode("酒店应用");
	var p418_10 = new TreeNode("旅游资讯");
	var p418_11 = new TreeNode("旅游产品");
	var p418_12 = new TreeNode("游记分享");
	var p418_13 = new TreeNode("长途客车");
	p418.nodes = new Array();
	p418.nodes.push(p4181);
	p418.nodes.push(p4182);
	p418.nodes.push(p4183);
	p418.nodes.push(p4184);
	p418.nodes.push(p4185);
	p418.nodes.push(p4186);
	p418.nodes.push(p4187);
	p418.nodes.push(p4188);
	p418.nodes.push(p4189);
	p418.nodes.push(p418_10);
	p418.nodes.push(p418_11);
	p418.nodes.push(p418_12);
	p418.nodes.push(p418_13);
	
	var p4191 = new TreeNode("装潢");
	var p4192 = new TreeNode("家电");
	var p4193 = new TreeNode("家具");
	var p4194 = new TreeNode("家居用品");
	var p4195 = new TreeNode("智能家居");
	p419.nodes = new Array();
	p419.nodes.push(p4191);
	p419.nodes.push(p4192);
	p419.nodes.push(p4193);
	p419.nodes.push(p4194);
	p419.nodes.push(p4195);
	
	var p41_10_1 = new TreeNode("减肥");
	var p41_10_2 = new TreeNode("运动健康");
	var p41_10_3 = new TreeNode("养生");
	var p41_10_4 = new TreeNode("医疗");
	var p41_10_5 = new TreeNode("健康管理");
	p41_10.nodes = new Array();
	p41_10.nodes.push(p41_10_1);
	p41_10.nodes.push(p41_10_2);
	p41_10.nodes.push(p41_10_3);
	p41_10.nodes.push(p41_10_4);
	p41_10.nodes.push(p41_10_5);
	
	var p41_11_1 = new TreeNode("拍照摄影");
	var p41_11_2 = new TreeNode("文玩收藏");
	var p41_11_3 = new TreeNode("外卖订餐");
	var p41_11_4 = new TreeNode("占星运程");
	var p41_11_5 = new TreeNode("优惠券");
	var p41_11_6 = new TreeNode("点评");
	var p41_11_7 = new TreeNode("食谱");
	var p41_11_8 = new TreeNode("营业厅");
	var p41_11_9 = new TreeNode("天气");
	var p41_11_10 = new TreeNode("时钟");
	var p41_11_11 = new TreeNode("快递");
	var p41_11_12 = new TreeNode("日历");
	var p41_11_13 = new TreeNode("记账");
	var p41_11_14 = new TreeNode("车主服务");
	var p41_11_15 = new TreeNode("便民服务");
	var p41_11_16 = new TreeNode("时尚穿搭");
	var p41_11_17 = new TreeNode("积分活动");
	var p41_11_18 = new TreeNode("家政");
	var p41_11_19 = new TreeNode("生活综合");
	p41_11.nodes = new Array();
	p41_11.nodes.push(p41_11_1);
	p41_11.nodes.push(p41_11_2);
	p41_11.nodes.push(p41_11_3);
	p41_11.nodes.push(p41_11_4);
	p41_11.nodes.push(p41_11_5);
	p41_11.nodes.push(p41_11_6);
	p41_11.nodes.push(p41_11_7);
	p41_11.nodes.push(p41_11_8);
	p41_11.nodes.push(p41_11_9);
	p41_11.nodes.push(p41_11_10);
	p41_11.nodes.push(p41_11_11);
	p41_11.nodes.push(p41_11_12);
	p41_11.nodes.push(p41_11_13);
	p41_11.nodes.push(p41_11_14);
	p41_11.nodes.push(p41_11_15);
	p41_11.nodes.push(p41_11_16);
	p41_11.nodes.push(p41_11_17);
	p41_11.nodes.push(p41_11_18);
	p41_11.nodes.push(p41_11_19);
	
	var p41_12_1 = new TreeNode("招聘求职");
	var p41_12_2 = new TreeNode("日常管理");
	var p41_12_3 = new TreeNode("笔记");
	var p41_12_4 = new TreeNode("备忘");
	var p41_12_5 = new TreeNode("文件编辑");
	var p41_12_6 = new TreeNode("名片");
	var p41_12_7 = new TreeNode("通讯录");
	var p41_12_8 = new TreeNode("网盘");
	var p41_12_9 = new TreeNode("店铺管理");
	var p41_12_10 = new TreeNode("工程制图");
	p41_12.nodes = new Array();
	p41_12.nodes.push(p41_12_1);
	p41_12.nodes.push(p41_12_2);
	p41_12.nodes.push(p41_12_3);
	p41_12.nodes.push(p41_12_4);
	p41_12.nodes.push(p41_12_5);
	p41_12.nodes.push(p41_12_6);
	p41_12.nodes.push(p41_12_7);
	p41_12.nodes.push(p41_12_8);
	p41_12.nodes.push(p41_12_9);
	p41_12.nodes.push(p41_12_10);
	
	var p41_13_1 = new TreeNode("系统工具");
	var p41_13_2 = new TreeNode("应用商店");
	var p41_13_3 = new TreeNode("搜索");
	var p41_13_4 = new TreeNode("输入法");
	var p41_13_5 = new TreeNode("浏览器");
	var p41_13_6 = new TreeNode("桌面美化");
	var p41_13_7 = new TreeNode("阅读器");
	var p41_13_8 = new TreeNode("实用工具");
	var p41_13_9 = new TreeNode("编辑器");
	var p41_13_10 = new TreeNode("WIFI");
	p41_13.nodes = new Array();
	p41_13.nodes.push(p41_13_1);
	p41_13.nodes.push(p41_13_2);
	p41_13.nodes.push(p41_13_3);
	p41_13.nodes.push(p41_13_4);
	p41_13.nodes.push(p41_13_5);
	p41_13.nodes.push(p41_13_6);
	p41_13.nodes.push(p41_13_7);
	p41_13.nodes.push(p41_13_8);
	p41_13.nodes.push(p41_13_9);
	p41_13.nodes.push(p41_13_10);
	
	var p41_14_1 = new TreeNode("财富管理");
	var p41_14_2 = new TreeNode("货币基金");
	var p41_14_3 = new TreeNode("直销银行");
	var p41_14_4 = new TreeNode("直销保险");
	var p41_14_5 = new TreeNode("证券");
	var p41_14_6 = new TreeNode("期货");
	var p41_14_7 = new TreeNode("外汇");
	var p41_14_8 = new TreeNode("贵金属");
	var p41_14_9 = new TreeNode("众筹融资");
	var p41_14_10 = new TreeNode("彩票");
	var p41_14_11 = new TreeNode("支付");
	var p41_14_12 = new TreeNode("借贷");
	p41_14.nodes = new Array();
	p41_14.nodes.push(p41_14_1);
	p41_14.nodes.push(p41_14_2);
	p41_14.nodes.push(p41_14_3);
	p41_14.nodes.push(p41_14_4);
	p41_14.nodes.push(p41_14_5);
	p41_14.nodes.push(p41_14_6);
	p41_14.nodes.push(p41_14_7);
	p41_14.nodes.push(p41_14_8);
	p41_14.nodes.push(p41_14_9);
	p41_14.nodes.push(p41_14_10);
	p41_14.nodes.push(p41_14_11);
	p41_14.nodes.push(p41_14_12);
	
	var p41_15_1 = new TreeNode("房屋咨询");
	var p41_15_2 = new TreeNode("买房");
	var p41_15_3 = new TreeNode("卖房");
	var p41_15_4 = new TreeNode("租房");
	p41_15.nodes = new Array();
	p41_15.nodes.push(p41_15_1);
	p41_15.nodes.push(p41_15_2);
	p41_15.nodes.push(p41_15_3);
	p41_15.nodes.push(p41_15_4);
	
	var p41_16_1 = new TreeNode("怀孕备孕");
	var p41_16_2 = new TreeNode("育儿");
	var p41_16_3 = new TreeNode("母婴用品类");	
	p41_16.nodes = new Array();
	p41_16.nodes.push(p41_16_1);
	p41_16.nodes.push(p41_16_2);
	p41_16.nodes.push(p41_16_3);
	
	var p41_17_1 = new TreeNode("KTV");
	var p41_17_2 = new TreeNode("演出");
	var p41_17_3 = new TreeNode("电影");	
	p41_17.nodes = new Array();
	p41_17.nodes.push(p41_17_1);
	p41_17.nodes.push(p41_17_2);
	p41_17.nodes.push(p41_17_3);
	
	var p41_18_1 = new TreeNode("汽车资讯");
	var p41_18_2 = new TreeNode("买卖车");	
	p41_18.nodes = new Array();
	p41_18.nodes.push(p41_18_1);
	p41_18.nodes.push(p41_18_2);
	
	var p41_19_1 = new TreeNode("护肤类应用");
	var p41_19_2 = new TreeNode("美容美发美甲");
	var p41_19_3 = new TreeNode("彩妆类应用");	
	p41_19.nodes = new Array();
	p41_19.nodes.push(p41_19_1);
	p41_19.nodes.push(p41_19_2);
	p41_19.nodes.push(p41_19_3);
	
	var p51 = new TreeNode("游戏类型");
	var p52 = new TreeNode("游戏题材");
	var p53 = new TreeNode("美术风格");
	p51.selectable = false;
	p52.selectable = false;
	p53.selectable = false;
	p5.nodes = new Array();
	p5.nodes.push(p51);
	p5.nodes.push(p52);
	p5.nodes.push(p53);
	
	var p511 = new TreeNode("休闲时间");
	var p512 = new TreeNode("跑酷竞速");
	var p513 = new TreeNode("宝石消除");
	var p514 = new TreeNode("网络游戏");
	var p515 = new TreeNode("动作射击");
	var p516 = new TreeNode("扑克棋牌");
	var p517 = new TreeNode("儿童益智");
	var p518 = new TreeNode("塔防守卫");
	var p519 = new TreeNode("体育格斗");
	var p51_10 = new TreeNode("角色扮演");
	var p51_11 = new TreeNode("经营策略");
	var p51_12 = new TreeNode("养成类");
	var p51_13 = new TreeNode("挂机类");
	var p51_14 = new TreeNode("文字游戏");
	var p51_15 = new TreeNode("博彩类");
	p511.selectable = false;
	p512.selectable = false;
	p513.selectable = false;
	p514.selectable = false;
	p515.selectable = false;
	p516.selectable = false;
	p517.selectable = false;
	p518.selectable = false;
	p519.selectable = false;
	p51_10.selectable = false;
	p51_11.selectable = false;
	p51_12.selectable = false;
	p51.nodes = new Array();
	p51.nodes.push(p511);
	p51.nodes.push(p512);
	p51.nodes.push(p513);
	p51.nodes.push(p514);
	p51.nodes.push(p515);
	p51.nodes.push(p516);
	p51.nodes.push(p517);
	p51.nodes.push(p518);
	p51.nodes.push(p519);
	p51.nodes.push(p51_10);
	p51.nodes.push(p51_11);
	p51.nodes.push(p51_12);
	p51.nodes.push(p51_13);
	p51.nodes.push(p51_14);
	p51.nodes.push(p51_15);
	
	var p5111 = new TreeNode("切东西");
	var p5112 = new TreeNode("找茬");
	var p5113 = new TreeNode("减压");
	var p5114 = new TreeNode("宠物");
	var p5115 = new TreeNode("答题");
	var p5116 = new TreeNode("捕鱼");
	var p5117 = new TreeNode("音乐舞蹈");
	var p5118 = new TreeNode("益智");
	var p5119 = new TreeNode("冒险解谜");	
	p511.nodes = new Array();
	p511.nodes.push(p5111);
	p511.nodes.push(p5112);
	p511.nodes.push(p5113);
	p511.nodes.push(p5114);
	p511.nodes.push(p5115);
	p511.nodes.push(p5116);
	p511.nodes.push(p5117);
	p511.nodes.push(p5118);
	p511.nodes.push(p5119);
	
	var p5121 = new TreeNode("跑酷");
	var p5122 = new TreeNode("赛车");
	var p5123 = new TreeNode("摩托");
	var p5124 = new TreeNode("赛艇");
	var p5125 = new TreeNode("飞机");
	p512.nodes = new Array();
	p512.nodes.push(p5121);
	p512.nodes.push(p5122);
	p512.nodes.push(p5123);
	p512.nodes.push(p5124);
	p512.nodes.push(p5125);
	
	var p5131 = new TreeNode("方块");
	var p5132 = new TreeNode("宝石");
	var p5133 = new TreeNode("连连看");
	var p5134 = new TreeNode("祖玛");
	var p5135 = new TreeNode("泡泡龙");
	var p5136 = new TreeNode("卡通");
	p513.nodes = new Array();
	p513.nodes.push(p5131);
	p513.nodes.push(p5132);
	p513.nodes.push(p5133);
	p513.nodes.push(p5134);
	p513.nodes.push(p5135);
	p513.nodes.push(p5136);
	
	var p5141 = new TreeNode("角色扮演");
	var p5142 = new TreeNode("动作竞技");
	var p5143 = new TreeNode("策略");
	var p5144 = new TreeNode("卡牌");
	var p5145 = new TreeNode("经营模拟");
	p514.nodes = new Array();
	p514.nodes.push(p5141);
	p514.nodes.push(p5142);
	p514.nodes.push(p5143);
	p514.nodes.push(p5144);
	p514.nodes.push(p5145);
	
	var p5151 = new TreeNode("横版");
	var p5152 = new TreeNode("设计");
	var p5153 = new TreeNode("3D");
	var p5154 = new TreeNode("飞行");
	var p5155 = new TreeNode("坦克");
	var p5156 = new TreeNode("狙击");
	p515.nodes = new Array();
	p515.nodes.push(p5151);
	p515.nodes.push(p5152);
	p515.nodes.push(p5153);
	p515.nodes.push(p5154);
	p515.nodes.push(p5155);
	p515.nodes.push(p5156);
	
	var p5161 = new TreeNode("斗地主");
	var p5162 = new TreeNode("棋类");
	var p5163 = new TreeNode("麻将");
	var p5164 = new TreeNode("桌游");
	var p5165 = new TreeNode("德州扑克");
	var p5166 = new TreeNode("纸牌");
	p516.nodes = new Array();
	p516.nodes.push(p5161);
	p516.nodes.push(p5162);
	p516.nodes.push(p5163);
	p516.nodes.push(p5164);
	p516.nodes.push(p5165);
	p516.nodes.push(p5166);
	
	var p5171 = new TreeNode("拼图");
	var p5172 = new TreeNode("识字");
	var p5173 = new TreeNode("智力开发");
	var p5174 = new TreeNode("数学");
	p517.nodes = new Array();
	p517.nodes.push(p5171);
	p517.nodes.push(p5172);
	p517.nodes.push(p5173);
	p517.nodes.push(p5174);
	
	var p5181 = new TreeNode("闯关");
	var p5182 = new TreeNode("抢滩登陆");
	p518.nodes = new Array();
	p518.nodes.push(p5181);
	p518.nodes.push(p5182);
	
	var p5191 = new TreeNode("街机");
	var p5192 = new TreeNode("篮球");
	var p5193 = new TreeNode("足球");
	var p5194 = new TreeNode("网球");
	var p5195 = new TreeNode("台球");
	var p5196 = new TreeNode("其他球类");
	p519.nodes = new Array();
	p519.nodes.push(p5191);
	p519.nodes.push(p5192);
	p519.nodes.push(p5193);
	p519.nodes.push(p5194);
	p519.nodes.push(p5195);
	p519.nodes.push(p5196);
	
	var p51_10_1 = new TreeNode("回合制");
	var p51_10_2 = new TreeNode("及时战斗");
	var p51_10_3 = new TreeNode("ARPG");
	p51_10.nodes = new Array();
	p51_10.nodes.push(p51_10_1);
	p51_10.nodes.push(p51_10_2);
	p51_10.nodes.push(p51_10_3);
	
	var p51_11_1 = new TreeNode("战旗");
	var p51_11_2 = new TreeNode("经营");
	var p51_11_3 = new TreeNode("农家场园");
	p51_11.nodes = new Array();
	p51_11.nodes.push(p51_11_1);
	p51_11.nodes.push(p51_11_2);
	p51_11.nodes.push(p51_11_3);
	
	var p51_12_1 = new TreeNode("宠物养成类");
	var p51_12_2 = new TreeNode("恋爱养成");
	p51_12.nodes = new Array();
	p51_12.nodes.push(p51_12_1);
	p51_12.nodes.push(p51_12_2);
	
	var p521 = new TreeNode("三国");
	var p522 = new TreeNode("武侠");
	var p523 = new TreeNode("修仙玄幻");
	var p524 = new TreeNode("西游");
	var p525 = new TreeNode("水浒");
	var p526 = new TreeNode("中国古典神话");
	var p527 = new TreeNode("西方神话");
	var p528 = new TreeNode("80后日本动漫");
	var p529 = new TreeNode("二次元动漫");
	var p52_10 = new TreeNode("影视");
	var p52_11 = new TreeNode("综艺");
	var p52_12 = new TreeNode("军事战争");
	var p52_13 = new TreeNode("科幻");
	var p52_14 = new TreeNode("僵尸");
	var p52_15 = new TreeNode("魔兽");
	var p52_16 = new TreeNode("魔幻");
	var p52_17 = new TreeNode("DOTA-LOL");
	var p52_18 = new TreeNode("航海");
	var p52_19 = new TreeNode("体育");
	p52.nodes = new Array();
	p52.nodes.push(p521);
	p52.nodes.push(p522);
	p52.nodes.push(p523);
	p52.nodes.push(p524);
	p52.nodes.push(p525);
	p52.nodes.push(p526);
	p52.nodes.push(p527);
	p52.nodes.push(p528);
	p52.nodes.push(p529);
	p52.nodes.push(p52_10);
	p52.nodes.push(p52_11);
	p52.nodes.push(p52_12);
	p52.nodes.push(p52_13);
	p52.nodes.push(p52_14);
	p52.nodes.push(p52_15);
	p52.nodes.push(p52_16);
	p52.nodes.push(p52_17);
	p52.nodes.push(p52_18);
	p52.nodes.push(p52_19);
	
	var p531 = new TreeNode("水墨");
	var p532 = new TreeNode("日韩风");
	var p533 = new TreeNode("日式动漫");
	var p534 = new TreeNode("欧美动漫");
	var p535 = new TreeNode("Q版画风");
	var p536 = new TreeNode("像素风格");
	var p537 = new TreeNode("暴力血腥");
	var p538 = new TreeNode("欧美魔幻");
	var p539 = new TreeNode("写实");
	var p53_10 = new TreeNode("中国动漫");
	p53.nodes = new Array();
	p53.nodes.push(p531);
	p53.nodes.push(p532);
	p53.nodes.push(p533);
	p53.nodes.push(p534);
	p53.nodes.push(p535);
	p53.nodes.push(p536);
	p53.nodes.push(p537);
	p53.nodes.push(p538);
	p53.nodes.push(p539);
	p53.nodes.push(p53_10);
	
	var p61 = new TreeNode("消费品类");
	var p62 = new TreeNode("消费定位");
	p61.selectable = false;
	p62.selectable = false;
	p6.nodes = new Array();
	p6.nodes.push(p61);
	p6.nodes.push(p62);
	
	var p611 = new TreeNode("服饰鞋帽");
	var p612 = new TreeNode("珠宝手表");
	var p613 = new TreeNode("箱包");
	var p614 = new TreeNode("化妆品");
	var p615 = new TreeNode("餐饮");
	var p616 = new TreeNode("休闲娱乐");
	var p617 = new TreeNode("文化教育");
	var p618 = new TreeNode("生活服务");
	var p619 = new TreeNode("运动健康");
	var p61_10 = new TreeNode("家居厨具");
	var p61_11 = new TreeNode("家用电器");
	var p61_12 = new TreeNode("数码");
	var p61_13 = new TreeNode("零售卖场");
	var p61_14 = new TreeNode("母婴用品");
	var p61_15 = new TreeNode("汽车");
	var p61_16 = new TreeNode("房产置业");
	p611.selectable = false;
	p612.selectable = false;
	p613.selectable = false;
	p614.selectable = false;
	p615.selectable = false;
	p616.selectable = false;
	p617.selectable = false;
	p618.selectable = false;
	p619.selectable = false;
	p61_10.selectable = false;
	p61_11.selectable = false;
	p61_12.selectable = false;
	p61_13.selectable = false;
	p61_14.selectable = false;
	p61_15.selectable = false;
	p61_16.selectable = false;
	p61.nodes = new Array();
	p61.nodes.push(p611);
	p61.nodes.push(p612);
	p61.nodes.push(p613);
	p61.nodes.push(p614);
	p61.nodes.push(p615);
	p61.nodes.push(p616);
	p61.nodes.push(p617);
	p61.nodes.push(p618);
	p61.nodes.push(p619);
	p61.nodes.push(p61_10);
	p61.nodes.push(p61_11);
	p61.nodes.push(p61_12);
	p61.nodes.push(p61_13);
	p61.nodes.push(p61_14);
	p61.nodes.push(p61_15);
	p61.nodes.push(p61_16);
	
	var p6111 = new TreeNode("女装");
	var p6112 = new TreeNode("男装");
	var p6113 = new TreeNode("童装");
	var p6114 = new TreeNode("女鞋");
	var p6115 = new TreeNode("男鞋");
	var p6116 = new TreeNode("童鞋");
	var p6117 = new TreeNode("内衣");
	var p6118 = new TreeNode("家居服装");
	var p6119 = new TreeNode("运动户外");	
	var p611_10 = new TreeNode("配饰");	
	p611.nodes = new Array();
	p611.nodes.push(p6111);
	p611.nodes.push(p6112);
	p611.nodes.push(p6113);
	p611.nodes.push(p6114);
	p611.nodes.push(p6115);
	p611.nodes.push(p6116);
	p611.nodes.push(p6117);
	p611.nodes.push(p6118);
	p611.nodes.push(p6119);
	p611.nodes.push(p611_10);
	
	var p6121 = new TreeNode("珠宝饰品");
	var p6122 = new TreeNode("品牌手表");
	p612.nodes = new Array();
	p612.nodes.push(p6121);
	p612.nodes.push(p6122);
	
	var p6131 = new TreeNode("女包");
	var p6132 = new TreeNode("功能包");
	var p6133 = new TreeNode("男包");
	var p6134 = new TreeNode("旅行包");
	var p6135 = new TreeNode("钱包");
	p613.nodes = new Array();
	p613.nodes.push(p6131);
	p613.nodes.push(p6132);
	p613.nodes.push(p6133);
	p613.nodes.push(p6134);
	p613.nodes.push(p6135);
	
	var p6141 = new TreeNode("彩妆");
	var p6142 = new TreeNode("护肤");
	var p6143 = new TreeNode("香氛精油");
	var p6144 = new TreeNode("个人护理");
	var p6145 = new TreeNode("假发");
	p614.nodes = new Array();
	p614.nodes.push(p6141);
	p614.nodes.push(p6142);
	p614.nodes.push(p6143);
	p614.nodes.push(p6144);
	p614.nodes.push(p6145);
	
	var p6151 = new TreeNode("中餐正餐");
	var p6152 = new TreeNode("西餐正餐");
	var p6153 = new TreeNode("自助餐");
	var p6154 = new TreeNode("火锅涮锅");
	var p6155 = new TreeNode("日料");
	var p6156 = new TreeNode("韩食");
	var p6157 = new TreeNode("快餐简餐");
	var p6158 = new TreeNode("咖啡水吧");
	var p6159 = new TreeNode("面包甜点");	
	var p615_10 = new TreeNode("零食小吃");	
	p615.nodes = new Array();
	p615.nodes.push(p6151);
	p615.nodes.push(p6152);
	p615.nodes.push(p6153);
	p615.nodes.push(p6154);
	p615.nodes.push(p6155);
	p615.nodes.push(p6156);
	p615.nodes.push(p6157);
	p615.nodes.push(p6158);
	p615.nodes.push(p6159);
	p615.nodes.push(p615_10);
	
	var p6161 = new TreeNode("影院");
	var p6162 = new TreeNode("冰场");
	var p6163 = new TreeNode("KTV");
	var p6164 = new TreeNode("电玩");
	var p6165 = new TreeNode("酒吧");
	var p6166 = new TreeNode("体验");
	var p6167 = new TreeNode("SPA");
	var p6168 = new TreeNode("桌游");
	var p6169 = new TreeNode("儿童娱乐");	
	var p616_10 = new TreeNode("游泳");	
	var p616_11 = new TreeNode("滑雪");	
	p616.nodes = new Array();
	p616.nodes.push(p6161);
	p616.nodes.push(p6162);
	p616.nodes.push(p6163);
	p616.nodes.push(p6164);
	p616.nodes.push(p6165);
	p616.nodes.push(p6166);
	p616.nodes.push(p6167);
	p616.nodes.push(p6168);
	p616.nodes.push(p6169);
	p616.nodes.push(p616_10);
	p616.nodes.push(p616_11);
	
	var p6171 = new TreeNode("图书音像");
	var p6172 = new TreeNode("工艺美术");
	var p6173 = new TreeNode("教育培训");
	var p6174 = new TreeNode("办公文具");
	var p6175 = new TreeNode("儿童玩具");
	var p6176 = new TreeNode("乐器");
	var p6177 = new TreeNode("体育用品");
	p617.nodes = new Array();
	p617.nodes.push(p6171);
	p617.nodes.push(p6172);
	p617.nodes.push(p6173);
	p617.nodes.push(p6174);
	p617.nodes.push(p6175);
	p617.nodes.push(p6176);
	p617.nodes.push(p6177);
	
	var p6181 = new TreeNode("美容美发");
	var p6182 = new TreeNode("美甲刺青");
	var p6183 = new TreeNode("洗衣");//／皮具保养／改衣
	var p6184 = new TreeNode("摄影冲印");
	var p6185 = new TreeNode("机械维修");
	var p6186 = new TreeNode("金融理财");
	var p6187 = new TreeNode("药店");//／医疗器械／保健品
	var p6188 = new TreeNode("花店");//／水果铺
	var p6189 = new TreeNode("健身房");	
	var p618_10 = new TreeNode("运动场馆");	
	var p618_11 = new TreeNode("旅行社");
	var p618_12 = new TreeNode("电信营业厅");	
	var p618_13 = new TreeNode("宠物");
	var p618_14 = new TreeNode("机票");	//／火车票代售
	var p618_15 = new TreeNode("婚庆服务");
	var p618_16 = new TreeNode("酒店");	
	p618.nodes = new Array();
	p618.nodes.push(p6181);
	p618.nodes.push(p6182);
	p618.nodes.push(p6183);
	p618.nodes.push(p6184);
	p618.nodes.push(p6185);
	p618.nodes.push(p6186);
	p618.nodes.push(p6187);
	p618.nodes.push(p6188);
	p618.nodes.push(p6189);
	p618.nodes.push(p618_10);
	p618.nodes.push(p618_11);
	p618.nodes.push(p618_12);
	p618.nodes.push(p618_13);
	p618.nodes.push(p618_14);
	p618.nodes.push(p618_15);
	p618.nodes.push(p618_16);
	
	var p6191 = new TreeNode("健身器材");
	var p6192 = new TreeNode("骑行运动");
	var p6193 = new TreeNode("垂钓用品");
	var p6194 = new TreeNode("游泳用品");
	var p6195 = new TreeNode("户外装备");
	p619.nodes = new Array();
	p619.nodes.push(p6191);
	p619.nodes.push(p6192);
	p619.nodes.push(p6193);
	p619.nodes.push(p6194);
	p619.nodes.push(p6195);
	
	var p61_10_1 = new TreeNode("家具");
	var p61_10_2 = new TreeNode("装修建材");
	var p61_10_3 = new TreeNode("家具装饰");
	var p61_10_4 = new TreeNode("床上用品");
	var p61_10_5 = new TreeNode("餐具");
	var p61_10_6 = new TreeNode("厨具");
	p61_10.nodes = new Array();
	p61_10.nodes.push(p61_10_1);
	p61_10.nodes.push(p61_10_2);
	p61_10.nodes.push(p61_10_3);
	p61_10.nodes.push(p61_10_4);
	p61_10.nodes.push(p61_10_5);
	p61_10.nodes.push(p61_10_6);
	
	var p61_11_1 = new TreeNode("大家电");
	var p61_11_2 = new TreeNode("小家电");
	var p61_11_3 = new TreeNode("厨房电器");
	p61_11.nodes = new Array();
	p61_11.nodes.push(p61_11_1);
	p61_11.nodes.push(p61_11_2);
	p61_11.nodes.push(p61_11_3);
	
	var p61_12_1 = new TreeNode("手机");
	var p61_12_2 = new TreeNode("相机");
	var p61_12_3 = new TreeNode("电脑");
	var p61_12_4 = new TreeNode("耳机音响");
	var p61_12_5 = new TreeNode("数码配件");
	p61_12.nodes = new Array();
	p61_12.nodes.push(p61_12_1);
	p61_12.nodes.push(p61_12_2);
	p61_12.nodes.push(p61_12_3);
	p61_12.nodes.push(p61_12_4);
	p61_12.nodes.push(p61_12_5);
	
	var p61_13_1 = new TreeNode("大型超市");
	var p61_13_2 = new TreeNode("便利店");
	var p61_13_3 = new TreeNode("数码卖场");
	var p61_13_4 = new TreeNode("家电卖场");
	var p61_13_5 = new TreeNode("杂货");
	p61_13.nodes = new Array();
	p61_13.nodes.push(p61_13_1);
	p61_13.nodes.push(p61_13_2);
	p61_13.nodes.push(p61_13_3);
	p61_13.nodes.push(p61_13_4);
	p61_13.nodes.push(p61_13_5);
	
	var p61_14_1 = new TreeNode("孕妈用品");
	var p61_14_2 = new TreeNode("婴儿服饰");
	var p61_14_3 = new TreeNode("婴儿食品");
	var p61_14_4 = new TreeNode("婴儿护理");
	var p61_14_5 = new TreeNode("童车床");
	var p61_14_6 = new TreeNode("婴幼家纺");
	p61_14.nodes = new Array();
	p61_14.nodes.push(p61_14_1);
	p61_14.nodes.push(p61_14_2);
	p61_14.nodes.push(p61_14_3);
	p61_14.nodes.push(p61_14_4);
	p61_14.nodes.push(p61_14_5);
	p61_14.nodes.push(p61_14_6);
	
	var p61_15_1 = new TreeNode("汽车4S店");
	p61_15.nodes = new Array();
	p61_15.nodes.push(p61_15_1);
	
	var p61_16_1 = new TreeNode("房屋中介");
	var p61_16_2 = new TreeNode("地产置业");
	p61_16.nodes = new Array();
	p61_16.nodes.push(p61_16_1);
	p61_16.nodes.push(p61_16_2);
	
	var p621 = new TreeNode("大众");
	var p622 = new TreeNode("潮流");
	var p623 = new TreeNode("高端");
	var p624 = new TreeNode("奢侈");
	p62.nodes = new Array();
	p62.nodes.push(p621);
	p62.nodes.push(p622);
	p62.nodes.push(p623);
	p62.nodes.push(p624);			
	
	return JSON.stringify(treeNodes);
}

var $tree;
var selectedNodes = new Array();

function findNode(arr, node) {
	if (arr == null || arr.length == 0) {
		return null;	
	}
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].nodeId == node.nodeId) {
			return arr[i];	
		}
	}
	for (var i = 0; i < arr.length; i++) {
		var foundNode = findNode(arr[i].nodes, node);
		if (foundNode != null) {
			return foundNode;
		}
	}
	return null;
}

function treeNodeSelected(data) {								
	var parentNodes = new Array();
	parentNodes.push(data);		
	var tempNode = data;
	var nodeInSelArray;

	while (true) {
		var parentNode = $tree.treeview('getParent', tempNode);
		nodeInSelArray = findNode(selectedNodes, parentNode);	
		if (nodeInSelArray != null) {
			break;
		} 		
		if (typeof parentNode.nodeId == "undefined") {
			break;
		}	
	    parentNodes.push(parentNode);			
		tempNode = parentNode;
	}

	var lastPNode = nodeInSelArray;			
	while (parentNodes.length > 0) {
		var pNode = parentNodes.pop();
		if (lastPNode == null) {
			// root node is not in the selectedNodes array
			var node = new TreeNode(pNode.text);
			node.nodeId = pNode.nodeId;
			selectedNodes.push(node);
			node.nodes = new Array();
			lastPNode = node;
		} else {
			var node = new TreeNode(pNode.text);
			node.nodeId = pNode.nodeId;
			if (nodeInSelArray == null || nodeInSelArray.text != pNode.text) {
				if (parentNodes.length > 0) {
					node.nodes = new Array();	
				}						
			}
			lastPNode.nodes.push(node);
			lastPNode = node;
		}
	}	

	$('#selectedtree').treeview({
        data: JSON.stringify(selectedNodes),
		levels:4
	});
}

function removeNode(arr, node) {
	var index = -1;
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].nodeId == node.nodeId) {
			index = i;
			break;
		}
	}
	if (index > -1) {
		arr.splice(index, 1);	
	}
}

function treeNodeUnSelected(data) {
	removeUnselectedNode(data);
	$('#selectedtree').treeview({
        data: JSON.stringify(selectedNodes),
		levels:4
	});
}

function removeUnselectedNode(node) {
	var parentNode = $tree.treeview('getParent', node);
	var parentNodeInSelArray = findNode(selectedNodes, parentNode);

	if (parentNodeInSelArray == null) {
		removeNode(selectedNodes, node);
		return 0;
	} else if (parentNodeInSelArray.nodes.length > 1) {
		removeNode(parentNodeInSelArray.nodes, node);
		return 0;
	} else {
		return removeUnselectedNode(parentNode);
	}
}

function deleteAllSelectedNodes() {	
	
	$tree = $("#sourcetree").treeview({
                data: getTree(),
				 multiSelect:true,
				 levels:1
            });
	$('#sourcetree').on('nodeSelected', function(event, data) {
	  treeNodeSelected(data);
	});
			
	$('#sourcetree').on('nodeUnselected', function(event, data) {
	  treeNodeUnSelected(data);
	});
	if (selectedNodes.length > 0) {
		$("#selectedtree").treeview("remove");
	}	
	selectedNodes = new Array();
}

// phone brand related js start
var num = 0;
function addCategory(obj) {
   if (num == 10) {
       alert("最多选择10个品牌");
       return;
   }
   if ($(obj).parent().hasClass("category-selected")) {
       return;
   }
   var item = $(obj).prev().html();
   num += 1;
   var li_html = '<li ng-repeat="item in selected" class="ng-scope"><span class="category-index ng-binding">' + num + '</span><span ng-bind="item.name" class="ng-binding">' + item + '</span><i class="fa fa-minus" onclick="removeCategory(this)"></i></li>';
   $("#selectedcategorylist").append(li_html);
   $(obj).parent().addClass("category-selected");
   updateselectednumber();
}

function removeCategory(obj) {
   num -= 1;
   var text = $(obj).prev().html();
   $(obj).parent().remove();
   activatecategory(text);
   updateselectednumber();
   renumber();
}

function renumber() {
   $("#selectedcategorylist").find("li").each(function(i) {
       $(this).children(".category-index").html(i + 1);
   });
}

function updateselectednumber() {
   $("#selectednumberid").html(num);
   $("#remainnumberid").html(10 - num);
}

function activatecategory(item) {
   var filter = ":contains('" + item + "')";
   $("#sourcecategorylist").find(filter).removeClass("category-selected");
}
// phone brand related js end

function uncheckallplateform() {
	$("#allplateform").attr("checked", false);
}

function checkallplateform() {
	$("#osdiv").find("input").each(function(i){
		$(this).attr("checked", false);
	});
	$("#allplateform").prop("checked", true);
}

// 素材规格动态变化
function SucaiTemplate() {
	this.tpl = '<label class="radio-inline"></label>';
	this.input = '<input type="radio" name="sucaiguige" value="">';
}
var sucaiArray = new Array();
sucaiArray.push("640 x 960,640 x 1136,750 x 1334,1242×2208"); //开屏
sucaiArray.push("228 x 150,690 x 286");//信息流
sucaiArray.push("640 x 200,640 x 100");//焦点图
sucaiArray.push("468 x 60,728 x 90");//banner

var sucaiTitleArray = new Array();
sucaiTitleArray.push("开屏展示图片");
sucaiTitleArray.push("信息流展示图片");
sucaiTitleArray.push("焦点图展示图片");
sucaiTitleArray.push("banner展示图片");

function changeAdType(typeKey) {
	var sucaiTpl = new SucaiTemplate();
	var sucais = sucaiArray[typeKey].split(",");
	$("#sucaiguigediv").html("");
	$("#sucaititleid").html(sucaiTitleArray[typeKey]);
	for (var i = 0; i < sucais.length; i ++) {
		var str = sucaiTpl.input + sucais[i]+ "</input>";
		var $guigeinput = $(str);
		$guige = $(sucaiTpl.tpl);
		if (i == 0) {
			$guigeinput.attr("checked", "checked");	
		}
		$guige.append($guigeinput);
		$("#sucaiguigediv").append($guige);
	}
}