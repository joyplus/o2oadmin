package controllers

import (
	"admin/src/rbac"

	//"github.com/astaxie/beego"
	//"o2oadmin/models"
	//	"fmt"
)

type LoanRequestController struct {
	rbac.CommonController
}

// @router /prepare [get]
func (this *LoanRequestController) Prepare() {
	this.TplNames = this.GetTemplatetype() + "/loan/request_detail.tpl"
}
