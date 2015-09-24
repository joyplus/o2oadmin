package controllers
import (
    "github.com/beego/admin/src/rbac"
)

type LtvDashboardController struct {
    rbac.CommonController
}

// @Title Get
// @Description index page of campaign creation
// @Param	id		path 	string	true		"The key for staticblock"
// @Success 200 {object} models.DspCampaign
// @Failure 500 failed to load index page of campaign creation
// @router /Create [get]
func (c *LtvDashboardController) CreatePage() {
    c.TplNames = c.GetTemplatetype() + "/performance/project_create.tpl"
}

// @router /Edit [get]
func (c *LtvDashboardController) EditPage() {
    c.TplNames = c.GetTemplatetype() + "/performance/project_edit.tpl"
}

// @router /Detail [get]
func (c *LtvDashboardController) DetailPage() {
    c.TplNames = c.GetTemplatetype() + "/performance/project_detail.tpl"
}
// @router /Save [post]
func (c *LtvDashboardController) Save() {
    c.TplNames = c.GetTemplatetype() + "/performance/project_detail.tpl"
}

// @router /FullReport [get]
func (c *LtvDashboardController) FullReportPage() {
    c.TplNames = c.GetTemplatetype() + "/performance/project_detail_full_report.tpl"
}
// @router /SaveFlight [post]
func (c *LtvDashboardController) SaveFlight() {

    c.Data["json"] = "save sucessful"
    c.ServeJson()
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

// @Title Post
// @Description create DspCampaign
// @Param	body		body 	models.DspCampaign	true		"body for DspCampaign content"
// @Success 200 {int} models.DspCampaign.Id
// @Failure 403 body is empty
// @router / [post]
func (c *LtvDashboardController) Post() {

    c.TplNames = c.GetTemplatetype() + "/performance/project_detail.tpl"
}