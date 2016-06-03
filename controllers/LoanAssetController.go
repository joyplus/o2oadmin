package controllers

import (
	"admin/src/rbac"

	//"github.com/astaxie/beego"
	//"o2oadmin/models"
	//	"fmt"
)

type LoanAssetController struct {
	rbac.CommonController
}

// @router /:id [get]
func (this *LoanAssetController) GetOne() {
	this.TplName = this.GetTemplatetype() + "/loan/asset_detail.tpl"
}

// @router /operate [post]
func (this *LoanAssetController) Operate() {
	//this.TplNames = this.GetTemplatetype() + "/loan/asset_detail.tpl"
}

// @router /list [get]
func (this *LoanAssetController) List() {
	this.TplName = this.GetTemplatetype() + "/loan/asset_list.tpl"
}
