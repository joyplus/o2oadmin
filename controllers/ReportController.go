package controllers

import (
	"github.com/beego/admin/src/rbac"
	"time"
	"github.com/astaxie/beego"
	"o2oadmin/models"
	"strings"
)

type ReportController struct {
	rbac.CommonController
}

type PdbMediaRequest struct {
	Dimension 	string `form:"dimension"`
	Media		string `form:"media"`
	StartDate	time.Time `form:"startDate,2006-1-2"`
	EndDate	time.Time `form:"endDate,2006-1-2"`
	Page		int64 `form:"page"`
	Rows		int64 `form:"rows"`
}

type DspRequest struct {
	Dimension 	int	`form:"dimension"`
	Date		time.Time `form:"date"`
	QueryStr    string	`form:"q"`
}


func (this *ReportController) GetPdbMediaReport() {


	request := PdbMediaRequest{}
	this.ParseForm(request)
	this.TplNames = this.GetTemplatetype() + "/report/pmp_media_report.tpl"
	beego.Debug(request)

}

func (this *ReportController) GetPdbMediaReportData() {

	request := PdbMediaRequest{}
	this.ParseForm(&request)

	if request.Dimension != "" {
		strings.Split(request.Dimension, ",")
	}
	report, count, err := models.GetAllPmpDailyRequestReport(map[string]string{}, []string{}, []string{}, []string{}, (request.Page-1)*request.Rows, request.Rows)

	if err != nil {
		beego.Debug("failed to get pmp demand daily report")
	} else {
		// set PdbMediaName and PdbAdspaceName
		rows := []models.PdbMediaReportVo{}
		var reportItem models.PmpDailyRequestReport
		for _, item := range report {
			reportVo := models.PdbMediaReportVo{}
			reportItem = item.(models.PmpDailyRequestReport)

			reportVo.PdbMediaName = reportItem.PmpAdspace.PmpMedia.Name
			reportVo.PdbAdspaceName = reportItem.PmpAdspace.Name
			reportVo.AdDate = reportItem.AdDate
			reportVo.ReqAll = reportItem.ReqError + reportItem.ReqNoad + reportItem.ReqSuccess
			reportVo.ReqSuccess = reportItem.ReqSuccess
			reportVo.FillRate = reportItem.FillRate
			reportVo.ReqError = reportItem.ReqError

			rows = append(rows, reportVo)
		}

		this.Data["json"] = &map[string]interface{}{"total": count, "rows": &rows}
	}
	this.ServeJson()

}