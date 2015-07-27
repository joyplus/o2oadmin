package routers

import (
	"github.com/astaxie/beego"
	"github.com/beego/admin"
	"o2oadmin/controllers"
)

func init() {
	beego.Router("/pmp/adspace/index", &controllers.PmpAdspaceController{}, "*:GetAdspaceList")
	beego.Router("/pmp/adspace/addadspace", &controllers.PmpAdspaceController{}, "*:Post")
	beego.Router("/pmp/demand/demandInfo", &controllers.PmpDemandPlatformDeskController{}, "*:GetDemands")
	beego.Router("/pmp/adspace/medias", &controllers.PmpMediaController{}, "*:GetAll")
	admin.Run()
	beego.Info("o2oadmin start")
	beego.Router("/operation/merchant/addMerchant", &controllers.MerchantController{}, "*:AddMerchant")
	beego.Router("/operation/merchant/updateMerchant", &controllers.MerchantController{}, "*:UpdateMerchant")
	beego.Router("/operation/merchant/deleteMerchant", &controllers.MerchantController{}, "*:DelMerchant")
	beego.Router("/operation/merchant/index", &controllers.MerchantController{}, "*:Index")

	beego.Router("/api/customer/requestOTP", &controllers.CustomerController{}, "*:RequestOTP")
	beego.Router("/api/customer/verifyOTP", &controllers.CustomerController{}, "*:VerifyOTP")

	beego.Router("/api/resturant/getLovList", &controllers.ResturantController{}, "*:GetLovList")
	beego.Router("/api/resturant/getMaterialListByCategory", &controllers.ResturantController{}, "*:GetMaterialListByCategory")

	beego.Router("/api/resturant/getSupplierList", &controllers.ResturantController{}, "*:GetSupplierList")
	beego.Router("/api/resturant/queryPrice", &controllers.ResturantController{}, "*:QueryPrice")
	beego.Router("/api/resturant/getRequestOrderList", &controllers.ResturantController{}, "*:GetRequestOrderList")
	beego.Router("/api/resturant/placeOrder", &controllers.ResturantController{}, "*:PlaceOrder")
	beego.Router("/api/resturant/cancelOrder", &controllers.ResturantController{}, "*:CancelOrder")

	beego.Router("/api/activity/getList", &controllers.ActivityController{}, "*:GetActiveActivityList")
	beego.Router("/api/resturant/getCategoryList", &controllers.ResturantController{}, "*:GetCategoryList")
	beego.Router("/api/resturant/getTransactionList", &controllers.ResturantController{}, "*:GetTransactionList")
	beego.Router("/api/resturant/getTransactionDetail", &controllers.ResturantController{}, "*:GetTransactionDetail")
	beego.Router("/api/resturant/getRegularMaterialList", &controllers.ResturantController{}, "*:GetRegularMaterialList")

}

//func router() {
//	beego.Router("/merchant/addMerchant", &controllers.MerchantController{}, "*:addMerchant")
//	beego.Router("/merchant/updateMerchant", &controllers.MerchantController{}, "*:updateMerchant")
//	beego.Router("/merchant/deleteMerchant", &controllers.MerchantController{}, "*:delMerchant")
//	beego.Router("/merchant/index", &controllers.MerchantController{}, "*:Index")
//}
