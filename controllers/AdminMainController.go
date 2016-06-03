package controllers

import (
	m "admin/src/models"
	"admin/src/rbac"
	"github.com/astaxie/beego"
	"o2oadmin/models"
)

type AdminMainController struct {
	rbac.MainController
}

func (this *AdminMainController) Main() {

	userinfo := this.GetSession("userinfo")
	if userinfo == nil {
		this.Ctx.Redirect(302, beego.AppConfig.String("rbac_auth_gateway"))
	}

	this.SetSession("memberinfo", models.GetMember(userinfo.(m.User).Id))

	tree := this.GetTree(userinfo)
	if this.IsAjax() {
		this.Data["json"] = &tree
		this.ServeJSON()
		return
	} else {
		groups := m.GroupList()
		this.Data["userinfo"] = userinfo
		this.Data["groups"] = groups
		this.Data["tree"] = &tree
		if this.GetTemplatetype() != "easyui" {
			this.Layout = this.GetTemplatetype() + "/public/layout.tpl"
		}
		this.TplName = this.GetTemplatetype() + "/public/index.tpl"
	}
}
