package controllers

import (
	"github.com/beego/admin/src/rbac"
	"o2oadmin/models"
	"github.com/astaxie/beego"
//	"fmt"
	"o2oadmin/vo"
)

type CampaignController struct {
	rbac.CommonController
}

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

func (this *CampaignController) GetCategoryByParentId() {
	parentId,_ := this.GetInt("parentId")
	beego.Info("*** parentId:", parentId)
	categorys,_ := models.GetPmpAdCategoryByParentId(parentId)
	this.Data["json"] = categorys
	this.ServeJson()
}

func (this *CampaignController) GetPmpLovs() map[string][]models.PmpLov {
	var lovs []models.PmpLov
	lovs,_ = models.GetAllPmpLov()
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

func (this *CampaignController) GetAllGroups(){
	groups := models.GetAllCampaignGroup()
	this.Data["groups"] = &groups
	this.ServeJson()
}