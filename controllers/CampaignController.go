package controllers

import (
	"admin/src/rbac"
	"github.com/astaxie/beego"
	"o2oadmin/models"
	//	"fmt"
	"o2oadmin/vo"
)

type CampaignController struct {
	rbac.CommonController
}

// @router /add [*]
func (this *CampaignController) Add() {
	save := this.GetString("save")
	if save == "true" {
		var campaignPageVo = vo.CampaingnPageVO{}
		var campaignVo vo.PmpCampaignVO
		this.ParseForm(&campaignVo)
		beego.Info("****** Campaign Id Parsed:", campaignVo.Id)
		campaignPageVo.Campaign = campaignVo
		err := models.SaveOrCreateCampaign(campaignPageVo)
		if err == nil {
			this.Data["json"] = "ok"
		} else {
			this.Data["json"] = "failed"
		}
		this.ServeJSON()
	} else {
		categorys, _ := models.GetPmpAdCategoryOne()
		this.Data["categoryones"] = categorys
		this.Data["campaignid"] = 0
		lovMaps := this.GetPmpLovs()
		this.Data["lovmaps"] = &lovMaps
		this.TplName = this.GetTemplatetype() + "/campaign/campaign_add.tpl"
	}

}

// @router /edit [*]
func (this *CampaignController) Edit() {
	campaignId, err := this.GetInt("Id")
	if err != nil {
		beego.Error(err)
		this.Data["json"] = "failed"
		this.ServeJSON()
		return
	}
	beego.Info("Campaign Id:", campaignId)
	campaignVo := models.GetPmpCampaignById(campaignId)
	beego.Info(campaignVo)
	this.Data["campaignid"] = campaignId
	this.Data["campaignvo"] = &campaignVo
	categorys, _ := models.GetPmpAdCategoryOne()
	this.Data["categoryones"] = categorys
	lovMaps := this.GetPmpLovs()
	this.Data["lovmaps"] = &lovMaps
	this.TplName = this.GetTemplatetype() + "/campaign/campaign_add.tpl"
}

// @router /upload [*]
func (this *CampaignController) Upload() {
	_, header, err := this.GetFile("file_upload_1")
	if err != nil {
		beego.Error("upload file error:", err)
	} else {
		beego.Info("filename", header.Filename)
	}
	this.ServeJSON()
}

// @router /newCreative [*]
func (this *CampaignController) NewCampaignCreative() {
	v := models.PmpCampaignCreative{}
	this.ParseForm(&v)
	err := models.AddPmpCampaignCreative(&v)
	if err == nil {
		this.Data["json"] = "ok"
	} else {
		this.Data["json"] = "failed"
	}
	this.ServeJSON()
}

// @router /getCategoryByParentId [get]
func (this *CampaignController) GetCategoryByParentId() {
	parentId, _ := this.GetInt("parentId")
	beego.Info("*** parentId:", parentId)
	categorys, _ := models.GetPmpAdCategoryByParentId(parentId)
	this.Data["json"] = categorys
	this.ServeJSON()
}

func (this *CampaignController) GetPmpLovs() map[string][]models.PmpLov {
	var lovs []models.PmpLov
	lovs, _ = models.GetAllPmpLov()
	lovMaps := make(map[string][]models.PmpLov)
	for _, lov := range lovs {
		if lovslice, ok := lovMaps[lov.LovCode]; ok {
			lovslice = append(lovslice, lov)
			lovMaps[lov.LovCode] = lovslice
		} else {
			var lovslice = []models.PmpLov{}
			lovslice = append(lovslice, lov)
			lovMaps[lov.LovCode] = lovslice
		}
	}
	//	fmt.Println("****", "LovMaps:", lovMaps)
	return lovMaps
}

// @router /loadGroups [*]
func (this *CampaignController) GetAllGroups() {
	groups := models.GetAllCampaignGroup()
	this.Data["groups"] = &groups
	this.ServeJSON()
}

// @router /getCampaignReport [get]
func (this *CampaignController) GetCampaignReport() {

	request := ReportQueryRequest{}
	this.ParseForm(&request)

	// Dimension here only have two value, 0 or 1
	report, count, err := models.GetPmpCampaignDailyReport(request.Dimension[0], request.Medias, getLocalDate(request.StartDate), getLocalDate(request.EndDate), request.Sortby, request.Order, (request.Page-1)*request.Rows, request.Rows)

	beego.Debug("startDate: ", request.StartDate)

	if err != nil {
		beego.Debug("failed to get pmp daily report")
	} else {
		// 如果需要以活动组分组，则需要重新计算 ctr, eCPM, eCPC,
		if request.Dimension[0] == "1" {
			for idx, _ := range report {
				rawReportItem := report[idx]
				rawReportItem.Ctr = float32(rawReportItem.Clk) / float32(rawReportItem.Imp)
				// TODO eCPM, eCPC ???
				//				rawReportItem.Ecpm =
			}
		}

		this.Data["json"] = &map[string]interface{}{"total": count, "rows": &report}
	}
	this.ServeJSON()

}

// @router /index [get]
func (this *CampaignController) Index() {
	this.TplName = this.GetTemplatetype() + "/campaign/index.tpl"
}
