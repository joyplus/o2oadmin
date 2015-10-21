package routers

import (
	"github.com/astaxie/beego"
)

func init() {

	beego.GlobalControllerRouter["o2oadmin/controllers:CampaignController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:CampaignController"],
		beego.ControllerComments{
			"Add",
			`/add`,
			[]string{"*"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:CampaignController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:CampaignController"],
		beego.ControllerComments{
			"Edit",
			`/edit`,
			[]string{"*"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:CampaignController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:CampaignController"],
		beego.ControllerComments{
			"Upload",
			`/upload`,
			[]string{"*"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:CampaignController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:CampaignController"],
		beego.ControllerComments{
			"NewCampaignCreative",
			`/newCreative`,
			[]string{"*"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:CampaignController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:CampaignController"],
		beego.ControllerComments{
			"GetCategoryByParentId",
			`/getCategoryByParentId`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:CampaignController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:CampaignController"],
		beego.ControllerComments{
			"GetAllGroups",
			`/loadGroups`,
			[]string{"*"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:CampaignController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:CampaignController"],
		beego.ControllerComments{
			"GetCampaignReport",
			`/getCampaignReport`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:CampaignController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:CampaignController"],
		beego.ControllerComments{
			"Index",
			`/index`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:FeLovController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:FeLovController"],
		beego.ControllerComments{
			"Post",
			`/`,
			[]string{"post"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:FeLovController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:FeLovController"],
		beego.ControllerComments{
			"GetOne",
			`/:id`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:FeLovController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:FeLovController"],
		beego.ControllerComments{
			"GetAll",
			`/`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:FeLovController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:FeLovController"],
		beego.ControllerComments{
			"Put",
			`/:id`,
			[]string{"put"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:FeLovController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:FeLovController"],
		beego.ControllerComments{
			"Delete",
			`/:id`,
			[]string{"delete"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:LtvAppController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:LtvAppController"],
		beego.ControllerComments{
			"Post",
			`/`,
			[]string{"post"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:LtvAppController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:LtvAppController"],
		beego.ControllerComments{
			"GetOne",
			`/:id`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:LtvAppController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:LtvAppController"],
		beego.ControllerComments{
			"GetAll",
			`/`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:LtvAppController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:LtvAppController"],
		beego.ControllerComments{
			"Put",
			`/:id`,
			[]string{"put"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:LtvAppController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:LtvAppController"],
		beego.ControllerComments{
			"Delete",
			`/:id`,
			[]string{"delete"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:LtvDashboardController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:LtvDashboardController"],
		beego.ControllerComments{
			"GetTop5Campaign",
			`/GetTop5Campaign`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:LtvDashboardController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:LtvDashboardController"],
		beego.ControllerComments{
			"GetTop5Channel",
			`/GetTop5Channel`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightController"],
		beego.ControllerComments{
			"Post",
			`/`,
			[]string{"post"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightController"],
		beego.ControllerComments{
			"GetOne",
			`/:id`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightController"],
		beego.ControllerComments{
			"GetAll",
			`/`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightController"],
		beego.ControllerComments{
			"Put",
			`/:id`,
			[]string{"put"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightController"],
		beego.ControllerComments{
			"Delete",
			`/:id`,
			[]string{"delete"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightGroupController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightGroupController"],
		beego.ControllerComments{
			"Post",
			`/`,
			[]string{"post"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightGroupController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightGroupController"],
		beego.ControllerComments{
			"GetOne",
			`/:id`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightGroupController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightGroupController"],
		beego.ControllerComments{
			"GetAll",
			`/`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightGroupController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightGroupController"],
		beego.ControllerComments{
			"Put",
			`/:id`,
			[]string{"put"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightGroupController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightGroupController"],
		beego.ControllerComments{
			"Delete",
			`/:id`,
			[]string{"delete"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightGroupController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightGroupController"],
		beego.ControllerComments{
			"GetSummaryList",
			`/GetSummaryList`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightGroupController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightGroupController"],
		beego.ControllerComments{
			"Create",
			`/create`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightGroupController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightGroupController"],
		beego.ControllerComments{
			"Detail",
			`/Detail/:id`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightGroupController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightGroupController"],
		beego.ControllerComments{
			"Edit",
			`/Edit/:id`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightGroupController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightGroupController"],
		beego.ControllerComments{
			"Save",
			`/Save`,
			[]string{"post"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightGroupController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightGroupController"],
		beego.ControllerComments{
			"FullReportPage",
			`/fullReport/:id`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightGroupController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:LtvFlightGroupController"],
		beego.ControllerComments{
			"FullReportPageAll",
			`/fullReport`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpAdspaceController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpAdspaceController"],
		beego.ControllerComments{
			"Post",
			`/`,
			[]string{"post"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpAdspaceController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpAdspaceController"],
		beego.ControllerComments{
			"GetOne",
			`/:id`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpAdspaceController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpAdspaceController"],
		beego.ControllerComments{
			"GetAll",
			`/`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpAdspaceController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpAdspaceController"],
		beego.ControllerComments{
			"Put",
			`/:id`,
			[]string{"put"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpAdspaceController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpAdspaceController"],
		beego.ControllerComments{
			"Delete",
			`/:id`,
			[]string{"delete"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpAdspaceMatrixController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpAdspaceMatrixController"],
		beego.ControllerComments{
			"Post",
			`/`,
			[]string{"post"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpAdspaceMatrixController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpAdspaceMatrixController"],
		beego.ControllerComments{
			"GetOne",
			`/:id`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpAdspaceMatrixController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpAdspaceMatrixController"],
		beego.ControllerComments{
			"GetAll",
			`/`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpAdspaceMatrixController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpAdspaceMatrixController"],
		beego.ControllerComments{
			"Put",
			`/:id`,
			[]string{"put"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpAdspaceMatrixController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpAdspaceMatrixController"],
		beego.ControllerComments{
			"Delete",
			`/:id`,
			[]string{"delete"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpCampaignMatrixController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpCampaignMatrixController"],
		beego.ControllerComments{
			"Post",
			`/`,
			[]string{"post"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpCampaignMatrixController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpCampaignMatrixController"],
		beego.ControllerComments{
			"GetOne",
			`/:id`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpCampaignMatrixController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpCampaignMatrixController"],
		beego.ControllerComments{
			"GetAll",
			`/`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpCampaignMatrixController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpCampaignMatrixController"],
		beego.ControllerComments{
			"Put",
			`/:id`,
			[]string{"put"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpCampaignMatrixController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpCampaignMatrixController"],
		beego.ControllerComments{
			"Delete",
			`/:id`,
			[]string{"delete"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyAllocationController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyAllocationController"],
		beego.ControllerComments{
			"Post",
			`/`,
			[]string{"post"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyAllocationController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyAllocationController"],
		beego.ControllerComments{
			"GetOne",
			`/:id`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyAllocationController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyAllocationController"],
		beego.ControllerComments{
			"GetAll",
			`/`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyAllocationController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyAllocationController"],
		beego.ControllerComments{
			"Put",
			`/:id`,
			[]string{"put"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyAllocationController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyAllocationController"],
		beego.ControllerComments{
			"Delete",
			`/:id`,
			[]string{"delete"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyAllocationDetailController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyAllocationDetailController"],
		beego.ControllerComments{
			"Post",
			`/`,
			[]string{"post"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyAllocationDetailController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyAllocationDetailController"],
		beego.ControllerComments{
			"GetOne",
			`/:id`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyAllocationDetailController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyAllocationDetailController"],
		beego.ControllerComments{
			"GetAll",
			`/`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyAllocationDetailController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyAllocationDetailController"],
		beego.ControllerComments{
			"Put",
			`/:id`,
			[]string{"put"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyAllocationDetailController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyAllocationDetailController"],
		beego.ControllerComments{
			"Delete",
			`/:id`,
			[]string{"delete"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyReportController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyReportController"],
		beego.ControllerComments{
			"Post",
			`/`,
			[]string{"post"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyReportController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyReportController"],
		beego.ControllerComments{
			"GetOne",
			`/:id`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyReportController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyReportController"],
		beego.ControllerComments{
			"GetAll",
			`/`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyReportController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyReportController"],
		beego.ControllerComments{
			"Put",
			`/:id`,
			[]string{"put"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyReportController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyReportController"],
		beego.ControllerComments{
			"Delete",
			`/:id`,
			[]string{"delete"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyRequestReportController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyRequestReportController"],
		beego.ControllerComments{
			"Post",
			`/`,
			[]string{"post"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyRequestReportController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyRequestReportController"],
		beego.ControllerComments{
			"GetOne",
			`/:id`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyRequestReportController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyRequestReportController"],
		beego.ControllerComments{
			"GetAll",
			`/`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyRequestReportController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyRequestReportController"],
		beego.ControllerComments{
			"Put",
			`/:id`,
			[]string{"put"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyRequestReportController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDailyRequestReportController"],
		beego.ControllerComments{
			"Delete",
			`/:id`,
			[]string{"delete"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandAdspaceController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandAdspaceController"],
		beego.ControllerComments{
			"GetOne",
			`/:id`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandAdspaceController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandAdspaceController"],
		beego.ControllerComments{
			"GetAll",
			`/`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandAdspaceController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandAdspaceController"],
		beego.ControllerComments{
			"Put",
			`/:id`,
			[]string{"put"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandAdspaceController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandAdspaceController"],
		beego.ControllerComments{
			"Delete",
			`/:id`,
			[]string{"delete"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandDailyReportController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandDailyReportController"],
		beego.ControllerComments{
			"Post",
			`/`,
			[]string{"post"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandDailyReportController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandDailyReportController"],
		beego.ControllerComments{
			"GetOne",
			`/:id`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandDailyReportController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandDailyReportController"],
		beego.ControllerComments{
			"GetAll",
			`/`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandDailyReportController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandDailyReportController"],
		beego.ControllerComments{
			"Put",
			`/:id`,
			[]string{"put"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandDailyReportController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandDailyReportController"],
		beego.ControllerComments{
			"Delete",
			`/:id`,
			[]string{"delete"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandPlatformDeskController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandPlatformDeskController"],
		beego.ControllerComments{
			"Post",
			`/`,
			[]string{"post"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandPlatformDeskController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandPlatformDeskController"],
		beego.ControllerComments{
			"GetOne",
			`/:id`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandPlatformDeskController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandPlatformDeskController"],
		beego.ControllerComments{
			"GetAll",
			`/`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandPlatformDeskController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandPlatformDeskController"],
		beego.ControllerComments{
			"Put",
			`/:id`,
			[]string{"put"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandPlatformDeskController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandPlatformDeskController"],
		beego.ControllerComments{
			"Delete",
			`/:id`,
			[]string{"delete"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandResponseLogController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandResponseLogController"],
		beego.ControllerComments{
			"Post",
			`/`,
			[]string{"post"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandResponseLogController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandResponseLogController"],
		beego.ControllerComments{
			"GetOne",
			`/:id`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandResponseLogController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandResponseLogController"],
		beego.ControllerComments{
			"GetAll",
			`/`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandResponseLogController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandResponseLogController"],
		beego.ControllerComments{
			"Put",
			`/:id`,
			[]string{"put"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandResponseLogController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpDemandResponseLogController"],
		beego.ControllerComments{
			"Delete",
			`/:id`,
			[]string{"delete"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpMediaController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpMediaController"],
		beego.ControllerComments{
			"Post",
			`/`,
			[]string{"post"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpMediaController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpMediaController"],
		beego.ControllerComments{
			"GetOne",
			`/:id`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpMediaController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpMediaController"],
		beego.ControllerComments{
			"GetAll",
			`/`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpMediaController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpMediaController"],
		beego.ControllerComments{
			"Put",
			`/:id`,
			[]string{"put"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpMediaController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpMediaController"],
		beego.ControllerComments{
			"Delete",
			`/:id`,
			[]string{"delete"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpRequestLogController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpRequestLogController"],
		beego.ControllerComments{
			"Post",
			`/`,
			[]string{"post"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpRequestLogController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpRequestLogController"],
		beego.ControllerComments{
			"GetOne",
			`/:id`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpRequestLogController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpRequestLogController"],
		beego.ControllerComments{
			"GetAll",
			`/`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpRequestLogController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpRequestLogController"],
		beego.ControllerComments{
			"Put",
			`/:id`,
			[]string{"put"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpRequestLogController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpRequestLogController"],
		beego.ControllerComments{
			"Delete",
			`/:id`,
			[]string{"delete"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpTrackingLogController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpTrackingLogController"],
		beego.ControllerComments{
			"Post",
			`/`,
			[]string{"post"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpTrackingLogController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpTrackingLogController"],
		beego.ControllerComments{
			"GetOne",
			`/:id`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpTrackingLogController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpTrackingLogController"],
		beego.ControllerComments{
			"GetAll",
			`/`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpTrackingLogController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpTrackingLogController"],
		beego.ControllerComments{
			"Put",
			`/:id`,
			[]string{"put"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpTrackingLogController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpTrackingLogController"],
		beego.ControllerComments{
			"Delete",
			`/:id`,
			[]string{"delete"},
			nil})

}
