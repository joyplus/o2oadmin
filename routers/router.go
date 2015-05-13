package routers

import (
	"github.com/astaxie/beego"
	"github.com/beego/admin"
	"o2oadmin/controllers"
)

func init() {
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

}

//func router() {
//	beego.Router("/merchant/addMerchant", &controllers.MerchantController{}, "*:addMerchant")
//	beego.Router("/merchant/updateMerchant", &controllers.MerchantController{}, "*:updateMerchant")
//	beego.Router("/merchant/deleteMerchant", &controllers.MerchantController{}, "*:delMerchant")
//	beego.Router("/merchant/index", &controllers.MerchantController{}, "*:Index")
//}
