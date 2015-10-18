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
