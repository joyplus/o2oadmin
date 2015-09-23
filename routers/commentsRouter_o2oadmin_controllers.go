package routers

import (
	"github.com/astaxie/beego"
)

func init() {

	beego.GlobalControllerRouter["o2oadmin/controllers:DspAdunitController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspAdunitController"],
		beego.ControllerComments{
			"Post",
			`/`,
			[]string{"post"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspAdunitController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspAdunitController"],
		beego.ControllerComments{
			"GetOne",
			`/:id`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspAdunitController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspAdunitController"],
		beego.ControllerComments{
			"GetAll",
			`/`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspAdunitController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspAdunitController"],
		beego.ControllerComments{
			"Put",
			`/:id`,
			[]string{"put"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspAdunitController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspAdunitController"],
		beego.ControllerComments{
			"Delete",
			`/:id`,
			[]string{"delete"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspAdvertiserController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspAdvertiserController"],
		beego.ControllerComments{
			"Post",
			`/`,
			[]string{"post"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspAdvertiserController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspAdvertiserController"],
		beego.ControllerComments{
			"GetOne",
			`/:id`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspAdvertiserController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspAdvertiserController"],
		beego.ControllerComments{
			"GetAll",
			`/`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspAdvertiserController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspAdvertiserController"],
		beego.ControllerComments{
			"Put",
			`/:id`,
			[]string{"put"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspAdvertiserController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspAdvertiserController"],
		beego.ControllerComments{
			"Delete",
			`/:id`,
			[]string{"delete"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspApplicationController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspApplicationController"],
		beego.ControllerComments{
			"Post",
			`/`,
			[]string{"post"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspApplicationController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspApplicationController"],
		beego.ControllerComments{
			"GetOne",
			`/:id`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspApplicationController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspApplicationController"],
		beego.ControllerComments{
			"GetAll",
			`/`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspApplicationController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspApplicationController"],
		beego.ControllerComments{
			"Put",
			`/:id`,
			[]string{"put"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspApplicationController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspApplicationController"],
		beego.ControllerComments{
			"Delete",
			`/:id`,
			[]string{"delete"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspCampaignController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspCampaignController"],
		beego.ControllerComments{
			"CreatePage",
			`/Create`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspCampaignController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspCampaignController"],
		beego.ControllerComments{
			"EditPage",
			`/Edit`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspCampaignController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspCampaignController"],
		beego.ControllerComments{
			"DetailPage",
			`/Detail`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspCampaignController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspCampaignController"],
		beego.ControllerComments{
			"FullReportPage",
			`/FullReport`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspCampaignController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspCampaignController"],
		beego.ControllerComments{
			"SaveFlight",
			`/SaveFlight`,
			[]string{"post"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspCampaignController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspCampaignController"],
		beego.ControllerComments{
			"Post",
			`/`,
			[]string{"post"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspCampaignController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspCampaignController"],
		beego.ControllerComments{
			"GetOne",
			`/:id`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspCampaignController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspCampaignController"],
		beego.ControllerComments{
			"GetAll",
			`/`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspCampaignController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspCampaignController"],
		beego.ControllerComments{
			"Put",
			`/:id`,
			[]string{"put"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspCampaignController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspCampaignController"],
		beego.ControllerComments{
			"Delete",
			`/:id`,
			[]string{"delete"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspChannelController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspChannelController"],
		beego.ControllerComments{
			"Post",
			`/`,
			[]string{"post"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspChannelController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspChannelController"],
		beego.ControllerComments{
			"GetOne",
			`/:id`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspChannelController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspChannelController"],
		beego.ControllerComments{
			"GetAll",
			`/`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspChannelController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspChannelController"],
		beego.ControllerComments{
			"Put",
			`/:id`,
			[]string{"put"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:DspChannelController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:DspChannelController"],
		beego.ControllerComments{
			"Delete",
			`/:id`,
			[]string{"delete"},
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

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpCampaignController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpCampaignController"],
		beego.ControllerComments{
			"Post",
			`/`,
			[]string{"post"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpCampaignController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpCampaignController"],
		beego.ControllerComments{
			"GetOne",
			`/:id`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpCampaignController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpCampaignController"],
		beego.ControllerComments{
			"GetAll",
			`/`,
			[]string{"get"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpCampaignController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpCampaignController"],
		beego.ControllerComments{
			"Put",
			`/:id`,
			[]string{"put"},
			nil})

	beego.GlobalControllerRouter["o2oadmin/controllers:PmpCampaignController"] = append(beego.GlobalControllerRouter["o2oadmin/controllers:PmpCampaignController"],
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
			"Post",
			`/`,
			[]string{"post"},
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
