package routers

import (
    "github.com/astaxie/beego"
    "github.com/beego/admin"
    "o2oadmin/controllers"
)

func init() {

    ns := beego.NewNamespace("/pmp",
        beego.NSRouter("/pmp/adspace/index", &controllers.PmpAdspaceController{}, "*:GetAdspaceList"),
        beego.NSRouter("/pmp/adspace/addadspace", &controllers.PmpAdspaceController{}, "*:Post"),
        beego.NSRouter("/pmp/adspace/medias", &controllers.PmpMediaController{}, "*:GetAll"),
        beego.NSRouter("/pmp/adspace/updateadspace", &controllers.PmpAdspaceController{}, "*:SaveOrUpdateAdspace"),
        beego.NSRouter("/pmp/adspace/deladspace", &controllers.PmpAdspaceController{}, "*:Delete"),

        beego.NSRouter("/pmp/demand/demandInfo", &controllers.PmpDemandPlatformDeskController{}, "*:GetDemandByAdspace"),
        beego.NSRouter("/pmp/demand/demands", &controllers.PmpDemandPlatformDeskController{}, "*:GetAll"),
        beego.NSRouter("/pmp/demand/updateDailyAllocation", &controllers.PmpDemandPlatformDeskController{}, "*:UpdateDailyAllocation"),

        beego.NSRouter("/pmp/demand/index", &controllers.PmpDemandPlatformDeskController{}, "*:GetDemandList"),
        beego.NSRouter("/pmp/report/getPdbMediaReport", &controllers.ReportController{}, "*:GetPdbMediaReport"),
        beego.NSRouter("/pmp/report/getPdbMediaReportData", &controllers.ReportController{}, "*:GetPdbMediaReportData"),
        //  beego.NSRouter("/pmp/report/GetPdbMediaReportData", &controllers.PmpDailyRequestReportController{}, "*:GetAll"),
        beego.NSRouter("/pmp/report/getPdbDspReport", &controllers.ReportController{}, "*:GetPdbDspReport"),
        beego.NSRouter("/pmp/report/getPdbDspReportData", &controllers.ReportController{}, "*:GetPdbDspReportData"),

        beego.NSRouter("/pmp/demand/updatedemand", &controllers.PmpDemandPlatformDeskController{}, "*:SaveOrUpdateDemand"),
        beego.NSRouter("/pmp/demand/deldemand", &controllers.PmpDemandPlatformDeskController{}, "*:Delete"),
        beego.NSRouter("/pmp/demand/getDemandsMappingInfo", &controllers.PmpDemandPlatformDeskController{}, "*:GetDemandsMappingInfo"),

        beego.NSRouter("/pmp/demand/getDemandAdspaceByDemand", &controllers.PmpDemandAdspaceController{}, "*:GetDemandAdspaceListByDemand"),
        beego.NSRouter("/pmp/adspace/updatedemandadspace", &controllers.PmpDemandAdspaceController{}, "*:SaveOrUpdateDemandAdspace"),
        beego.NSRouter("/pmp/adspace/deldemandadspace", &controllers.PmpDemandAdspaceController{}, "*:Delete"),

        beego.NSRouter("/pmp/media/index", &controllers.PmpMediaController{}, "*:GetMediaList"),
        beego.NSRouter("/pmp/media/updatemedia", &controllers.PmpMediaController{}, "*:SaveOrUpdateMedia"),
        beego.NSRouter("/pmp/media/delmedia", &controllers.PmpMediaController{}, "*:Delete"),

        beego.NSRouter("/pmp/adspacematrix/deladspacematrix", &controllers.PmpAdspaceMatrixController{}, "*:DeleteByDemandIdAndAdspaceId"),
        beego.NSRouter("/pmp/adspacematrix/updateAdspaceMatrix", &controllers.PmpAdspaceMatrixController{}, "*:UpdateAdspaceMatrix"),

        
        beego.NSRouter("/operation/merchant/addMerchant", &controllers.MerchantController{}, "*:AddMerchant"),
        beego.NSRouter("/operation/merchant/updateMerchant", &controllers.MerchantController{}, "*:UpdateMerchant"),
        beego.NSRouter("/operation/merchant/deleteMerchant", &controllers.MerchantController{}, "*:DelMerchant"),
        beego.NSRouter("/operation/merchant/index", &controllers.MerchantController{}, "*:Index"),

        beego.NSRouter("/api/customer/requestOTP", &controllers.CustomerController{}, "*:RequestOTP"),
        beego.NSRouter("/api/customer/verifyOTP", &controllers.CustomerController{}, "*:VerifyOTP"),

        beego.NSRouter("/api/resturant/getLovList", &controllers.ResturantController{}, "*:GetLovList"),
        beego.NSRouter("/api/resturant/getMaterialListByCategory", &controllers.ResturantController{}, "*:GetMaterialListByCategory"),

        beego.NSRouter("/api/resturant/getSupplierList", &controllers.ResturantController{}, "*:GetSupplierList"),
        beego.NSRouter("/api/resturant/queryPrice", &controllers.ResturantController{}, "*:QueryPrice"),
        beego.NSRouter("/api/resturant/getRequestOrderList", &controllers.ResturantController{}, "*:GetRequestOrderList"),
        beego.NSRouter("/api/resturant/placeOrder", &controllers.ResturantController{}, "*:PlaceOrder"),
        beego.NSRouter("/api/resturant/cancelOrder", &controllers.ResturantController{}, "*:CancelOrder"),

        beego.NSRouter("/api/activity/getList", &controllers.ActivityController{}, "*:GetActiveActivityList"),
        beego.NSRouter("/api/resturant/getCategoryList", &controllers.ResturantController{}, "*:GetCategoryList"),
        beego.NSRouter("/api/resturant/getTransactionList", &controllers.ResturantController{}, "*:GetTransactionList"),
        beego.NSRouter("/api/resturant/getTransactionDetail", &controllers.ResturantController{}, "*:GetTransactionDetail"),
        beego.NSRouter("/api/resturant/getRegularMaterialList", &controllers.ResturantController{}, "*:GetRegularMaterialList"),


        //Campaign
        beego.NSRouter("/pmp/campaign/add", &controllers.CampaignController{}, "*:Add"),
        beego.NSRouter("/api/addcampaign", &controllers.CampaignController{}, "*:Add"),

        beego.NSRouter("Performance", &controllers.PerformanceController{}),

        beego.NSNamespace("/Campaign",
            beego.NSInclude(
                &controllers.LtvDashboardController{},
            ),
        ),
        beego.NSNamespace("/FlightGroup",
            beego.NSInclude(
                &controllers.LtvFlightGroupController{},
            ),
        ),
        beego.NSNamespace("/Flight",
            beego.NSInclude(
                &controllers.LtvFlightController{},
            ),
        ),
    )

    beego.AddNamespace(ns)
    admin.Run()

    beego.Info("o2oadmin start")

	

}

//func router() {
//	beego.NSRouter("/merchant/addMerchant", &controllers.MerchantController{}, "*:addMerchant")
//	beego.NSRouter("/merchant/updateMerchant", &controllers.MerchantController{}, "*:updateMerchant")
//	beego.NSRouter("/merchant/deleteMerchant", &controllers.MerchantController{}, "*:delMerchant")
//	beego.NSRouter("/merchant/index", &controllers.MerchantController{}, "*:Index")
//}
