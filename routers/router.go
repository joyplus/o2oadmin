package routers

import (
	"admin"
	"github.com/astaxie/beego"
	"o2oadmin/controllers"
)

func init() {

	//beego.Router("/operation/merchant/addMerchant", &controllers.MerchantController{}, "*:AddMerchant")
	//beego.Router("/operation/merchant/updateMerchant", &controllers.MerchantController{}, "*:UpdateMerchant")
	//beego.Router("/operation/merchant/deleteMerchant", &controllers.MerchantController{}, "*:DelMerchant")
	//beego.Router("/operation/merchant/index", &controllers.MerchantController{}, "*:Index")

	ns := beego.NewNamespace("/pmp",
		beego.NSRouter("adspace/index", &controllers.PmpAdspaceController{}, "*:GetAdspaceList"),
		beego.NSRouter("adspace/addadspace", &controllers.PmpAdspaceController{}, "*:Post"),
		beego.NSRouter("adspace/medias", &controllers.PmpMediaController{}, "*:GetAll"),
		beego.NSRouter("adspace/updateadspace", &controllers.PmpAdspaceController{}, "*:SaveOrUpdateAdspace"),
		beego.NSRouter("adspace/deladspace", &controllers.PmpAdspaceController{}, "*:Delete"),

		beego.NSRouter("demand/demandInfo", &controllers.PmpDemandPlatformDeskController{}, "*:GetDemandByAdspace"),
		beego.NSRouter("demand/demands", &controllers.PmpDemandPlatformDeskController{}, "*:GetAll"),
		beego.NSRouter("demand/updateDailyAllocation", &controllers.PmpDemandPlatformDeskController{}, "*:UpdateDailyAllocation"),

		beego.NSRouter("demand/index", &controllers.PmpDemandPlatformDeskController{}, "*:GetDemandList"),
		beego.NSRouter("report/getPdbMediaReport", &controllers.ReportController{}, "*:GetPdbMediaReport"),
		beego.NSRouter("report/getPdbMediaReportData", &controllers.ReportController{}, "*:GetPdbMediaReportData"),
		//  beego.NSRouter("report/GetPdbMediaReportData", &controllers.PmpDailyRequestReportController{}, "*:GetAll"),
		beego.NSRouter("report/getPdbDspReport", &controllers.ReportController{}, "*:GetPdbDspReport"),
		beego.NSRouter("report/getPdbDspReportData", &controllers.ReportController{}, "*:GetPdbDspReportData"),

		beego.NSRouter("demand/updatedemand", &controllers.PmpDemandPlatformDeskController{}, "*:SaveOrUpdateDemand"),
		beego.NSRouter("demand/deldemand", &controllers.PmpDemandPlatformDeskController{}, "*:Delete"),
		beego.NSRouter("demand/getDemandsMappingInfo", &controllers.PmpDemandPlatformDeskController{}, "*:GetDemandsMappingInfo"),

		beego.NSRouter("demand/getDemandAdspaceByDemand", &controllers.PmpDemandAdspaceController{}, "*:GetDemandAdspaceListByDemand"),
		beego.NSRouter("adspace/updatedemandadspace", &controllers.PmpDemandAdspaceController{}, "*:SaveOrUpdateDemandAdspace"),
		beego.NSRouter("adspace/deldemandadspace", &controllers.PmpDemandAdspaceController{}, "*:Delete"),

		beego.NSRouter("media/index", &controllers.PmpMediaController{}, "*:GetMediaList"),
		beego.NSRouter("media/updatemedia", &controllers.PmpMediaController{}, "*:SaveOrUpdateMedia"),
		beego.NSRouter("media/delmedia", &controllers.PmpMediaController{}, "*:Delete"),

		beego.NSRouter("adspacematrix/deladspacematrix", &controllers.PmpAdspaceMatrixController{}, "*:DeleteByDemandIdAndAdspaceId"),
		beego.NSRouter("adspacematrix/updateAdspaceMatrix", &controllers.PmpAdspaceMatrixController{}, "*:UpdateAdspaceMatrix"),

		beego.NSRouter("performance", &controllers.PerformanceController{}),

		//Campaign
		//        beego.NSRouter("campaign/add", &controllers.CampaignController{}, "*:Add"),
		//        beego.NSRouter("campaign/getCategoryByParentId", &controllers.CampaignController{}, "*:GetCategoryByParentId"),
		//		beego.NSRouter("campaign/newCreative", &controllers.CampaignController{}, "*:NewCampaignCreative"),
		//		beego.NSRouter("campaign/loadGroups", &controllers.CampaignController{}, "*:GetAllGroups"),

		beego.NSNamespace("/campaign",
			beego.NSInclude(
				&controllers.CampaignController{},
			),
		),

		beego.NSNamespace("/dashboard",
			beego.NSInclude(
				&controllers.LtvDashboardController{},
			),
		),
		beego.NSNamespace("/flightGroup",
			beego.NSInclude(
				&controllers.LtvFlightGroupController{},
			),
		),
		beego.NSNamespace("/flight",
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
