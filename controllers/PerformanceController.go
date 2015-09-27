package controllers
import "github.com/beego/admin/src/rbac"

type PerformanceController struct {
    rbac.CommonController
}

func (this *PerformanceController) Get() {

    if this.GetTemplatetype() != "easyui" {
        this.Layout = this.GetTemplatetype() + "/public/layout.tpl"
    }
    this.TplNames = this.GetTemplatetype() + "/performance/index.tpl"
}