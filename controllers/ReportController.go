package controllers

import (
	"github.com/beego/admin/src/rbac"
	"time"
	"github.com/astaxie/beego"
	"o2oadmin/models"
)

type ReportController struct {
	rbac.CommonController
}

type ReportQueryRequest struct {
	Dimension 	[]string `form:"dimension[]"`
	Medias		[]string `form:"media[]"`

	StartDate	time.Time `form:"startDate,2006-1-2"`
	EndDate	time.Time `form:"endDate,2006-1-2"`
	Page		int `form:"page"`
	Rows		int `form:"rows"`
	Sortby		string `form:"sortby"`
	Order		string `form:"order"`
}

type DspRequest struct {
	Dimension 	int	`form:"dimension"`
	Date		time.Time `form:"date"`
	QueryStr    string	`form:"q"`
}


func (this *ReportController) GetPdbMediaReport() {

	this.TplNames = this.GetTemplatetype() + "/report/pmp_media_report.tpl"

}

func (this *ReportController) GetPdbMediaReportData() {

	request := ReportQueryRequest{}
	this.ParseForm(&request)

	report, count, err := models.GetGroupedPmpDailyRequestReport(request.Dimension, request.Medias, request.StartDate, request.EndDate, request.Sortby, request.Order,(request.Page-1)*request.Rows, request.Rows)

	beego.Debug("startDate: ", request.StartDate)

	if err != nil {
		beego.Debug("failed to get pmp daily report")
	} else {
		// set PdbMediaName and PdbAdspaceName
		for idx, reportItem := range report {

			// because range copy values from the slice, we need to use index to change the original item
			report[idx].ReqAll = reportItem.ReqError + reportItem.ReqNoad + reportItem.ReqSuccess
			if report[idx].ReqAll > 0 {
				report[idx].FillRate = float32(reportItem.ReqSuccess) / float32(report[idx].ReqAll)
			}
		}

		this.Data["json"] = &map[string]interface{}{"total": count, "rows": &report}
	}
	this.ServeJson()

}

func (this *ReportController) GetPdbDspReport() {
	this.TplNames = this.GetTemplatetype() + "/report/pmp_dsp_report.tpl"
}

func (this *ReportController) GetPdbDspReportData() {
	request := ReportQueryRequest{}
	this.ParseForm(&request)

	report, count, err := models.GetGroupedPmpDemandDailyReport(request.Dimension, request.Medias, request.StartDate, request.EndDate, request.Sortby, request.Order,(request.Page-1)*request.Rows, request.Rows)

	if err != nil {
		beego.Debug("failed to get pmp demand daily report")
	} else {
		// set PdbMediaName and PdbAdspaceName
		for idx, reportItem := range report {

			// because range copy values from the slice, we need to use index to change the original item
			report[idx].ReqAll = reportItem.ReqError + reportItem.ReqNoad + reportItem.ReqSuccess
			if report[idx].ReqAll > 0 {
				report[idx].FillRate = float32(reportItem.ReqSuccess) / float32(report[idx].ReqAll)
			}
			if report[idx].Imp > 0 {
                report[idx].Ctr = float32(reportItem.Clk) / float32(reportItem.Imp)
            }
		}

		this.Data["json"] = &map[string]interface{}{"total": count, "rows": &report}
	}
	this.ServeJson()
}