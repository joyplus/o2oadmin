package controllers

import (
	"github.com/beego/admin/src/rbac"

	//"github.com/astaxie/beego"
)

type CampaignController struct {
	rbac.CommonController
}

func (this *CampaignController) Add() {

	this.TplNames = this.GetTemplatetype() + "/campaign/campaign_add.tpl"
}
