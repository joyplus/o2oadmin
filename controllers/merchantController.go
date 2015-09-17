package controllers

import (
	"github.com/beego/admin/src/rbac"
	m "o2oadmin/models"
)

type MerchantController struct {
	rbac.CommonController
}

func (this *MerchantController) Index() {
	page, _ := this.GetInt64("page")
	page_size, _ := this.GetInt64("rows")
	sort := this.GetString("sort")
	order := this.GetString("order")
	if len(order) > 0 {
		if order == "desc" {
			sort = "-" + sort
		}
	} else {
		sort = "Id"
	}
	merchants, count := m.GetMerchantlist(page, page_size, sort)
	if this.IsAjax() {
		this.Data["json"] = &map[string]interface{}{"total": count, "rows": &merchants}
		this.ServeJson()
		return
	} else {
		//this.Data["merchants"] = &merchants
		if this.GetTemplatetype() != "easyui" {
			this.Layout = this.GetTemplatetype() + "/public/layout.tpl"
		}
		this.TplNames = this.GetTemplatetype() + "/rbac/merchant.tpl"
	}

}

func (this *MerchantController) AddMerchant() {
	u := m.FeMerchantMaster{}
	if err := this.ParseForm(&u); err != nil {
		//handle error
		this.Rsp(false, err.Error())
		return
	}
	id, err := m.AddFeMerchantMaster(&u)
	if err == nil && id > 0 {
		this.Rsp(true, "Success")
		return
	} else {
		this.Rsp(false, err.Error())
		return
	}

}

func (this *MerchantController) UpdateMerchant() {
	u := m.FeMerchantMaster{}
	if err := this.ParseForm(&u); err != nil {
		//handle error
		this.Rsp(false, err.Error())
		return
	}
	id, err := m.UpdateFeMerchantMasterById(&u)
	if err == nil && id > 0 {
		this.Rsp(true, "Success")
		return
	} else {
		this.Rsp(false, err.Error())
		return
	}

}

func (this *MerchantController) DelMerchant() {
	Id, _ := this.GetInt64("Id")
	status, err := m.DeleteFeMerchantMaster(Id)
	if err == nil && status > 0 {
		this.Rsp(true, "Success")
		return
	} else {
		this.Rsp(false, err.Error())
		return
	}
}

//API使用
func (this *MerchantController) GetList() {
	page, _ := this.GetInt64("page")
	page_size, _ := this.GetInt64("rows")
	sort := this.GetString("sort")
	order := this.GetString("order")
	if len(order) > 0 {
		if order == "desc" {
			sort = "-" + sort
		}
	} else {
		sort = "Id"
	}
	merchants, count := m.GetMerchantlist(page, page_size, sort)
	this.Data["json"] = &map[string]interface{}{"total": count, "rows": &merchants}
	this.Data["content"] = "value"
	//this.ServeJson()
	this.TplNames = "html/test.tpl"

}
