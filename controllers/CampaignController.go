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
	if this.IsAjax() {
		var campaignPageVo vo.CampaingnPageVO
		this.ParseForm(&campaignPageVo)
		err := models.SaveOrCreateCampaign(campaignPageVo)
		if err == nil {
			this.Data["json"] = "ok"
		} else {
			this.Data["json"] = "failed"
		}
		this.ServeJson()
	} else {
		categorys, _ := models.GetPmpAdCategoryOne()
		this.Data["categoryones"] = categorys
		lovMaps := this.GetPmpLovs()
		this.Data["lovmaps"] = &lovMaps
		this.TplNames = this.GetTemplatetype() + "/campaign/campaign_add.tpl"
	}

}

// @router /edit [*]
func (this *CampaignController) Edit() {
	
}

// @router /upload [*]
func (this *CampaignController) Upload() {
	_, header, err := this.GetFile("images")
	if err != nil {
		beego.Error("upload file error:", err)
	} else {
	    beego.Info("filename", header.Filename)
	}
	this.ServeJson()
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
	this.ServeJson()
}

// @router /getCategoryByParentId [get]
func (this *CampaignController) GetCategoryByParentId() {
	parentId, _ := this.GetInt("parentId")
	beego.Info("*** parentId:", parentId)
	categorys, _ := models.GetPmpAdCategoryByParentId(parentId)
	this.Data["json"] = categorys
	this.ServeJson()
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
	this.ServeJson()
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
	this.ServeJson()

}

// @router /index [get]
func (this *CampaignController) Index() {
	this.TplNames = this.GetTemplatetype() + "/campaign/index.tpl"
}
