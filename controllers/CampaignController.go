package controllers

import (
	"github.com/beego/admin/src/rbac"
	"o2oadmin/models"
	"github.com/astaxie/beego"
//	"fmt"
)

type CampaignController struct {
	rbac.CommonController
}

const (
	 AD_TYPE string = "ad_type"
	 CAMPAIGN_TYPE string = "campaign_type"
	 ACCURATE_TYPE string = "accurate_type"
	 PRICING_TYPE string = "pricing_type"
	 STRATEGY_TYPE string = "strategy_type"
	 BUDGET_TYPE string = "budget_type"
	 CAMPAIGN_STATUS string = "campaign_status"
	 GENDER string = "gender"
	 TEMPRETURE string = "tempreture"
	 HUMIDITY string = "humidity"
	 WIND string = "wind"
	 WEATHER string = "weather"
	 OCCUPATION string = "occupation"
	 OPERATOR string = "operator"
	 PLATEFORM string = "plateform"
	 PHONE_BRAND string = "phone_brand"
	 INTERNET string = "internet")

func (this *CampaignController) Add() {
    categorys, _ := models.GetPmpAdCategoryOne()
	this.Data["categoryones"] = categorys
	lovMaps := this.GetPmpLovs()
	this.Data["lovmaps"] = &lovMaps
	this.TplNames = this.GetTemplatetype() + "/campaign/campaign_add.tpl"
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