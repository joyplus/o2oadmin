package controllers

import (
	"admin/src/rbac"
	"o2oadmin/vo"

	"github.com/astaxie/beego"
	//"o2oadmin/models"
	//	"fmt"
)

type LoanRequestController struct {
	rbac.CommonController
}

// @router /prepare [get]
func (this *LoanRequestController) Prepare() {
	memberInfo := this.GetSession("memberinfo")
	beego.Debug(memberInfo.(vo.MemberVo).DisplayName)

	this.TplNames = this.GetTemplatetype() + "/loan/request_input.tpl"
}

// @router /save [post]
func (this *LoanRequestController) Save() {
	//this.TplNames = this.GetTemplatetype() + "/loan/request_detail.tpl"
}

// @router /list [get]
func (this *LoanRequestController) List() {
	this.TplNames = this.GetTemplatetype() + "/loan/request_list.tpl"
}

// @router /match [get]
func (this *LoanRequestController) Match() {
	this.TplNames = this.GetTemplatetype() + "/loan/request_match.tpl"
}
