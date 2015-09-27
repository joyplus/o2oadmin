package controllers
import (
    "github.com/beego/admin/src/rbac"
)

type LtvDashboardController struct {
    rbac.CommonController
}

// @router /GetTop5Campaign [get]
func (c *LtvDashboardController) GetTop5Campaign() {

    c.Data["json"] = "10,20,30"
    c.ServeJson()
}
// @router /GetTop5Channel [get]
func (c *LtvDashboardController) GetTop5Channel() {

    c.Data["json"] = "save sucessful"
    c.ServeJson()
}