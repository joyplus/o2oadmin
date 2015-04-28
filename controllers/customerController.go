package controllers

import (
	"github.com/beego/admin/src/rbac"
	m "o2oadmin/models"
)

type CustomerController struct {
	rbac.CommonController
}

//API
func (this *CustomerController) BindByOTP() {
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
	this.ServeJson()

}
