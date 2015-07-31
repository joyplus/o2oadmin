package routers

import (
	"github.com/astaxie/beego"
	"github.com/beego/admin"
	"o2oadmin/controllers"
)

func init() {
	beego.Router("/pmp/adspace/index", &controllers.PmpAdspaceController{}, "*:GetAdspaceList")
	beego.Router("/pmp/adspace/addadspace", &controllers.PmpAdspaceController{}, "*:Post")
	beego.Router("/pmp/demand/demandInfo", &controllers.PmpDemandPlatformDeskController{}, "*:GetDemands")
	beego.Router("/pmp/demand/updateDailyAllocation", &controllers.PmpDemandPlatformDeskController{}, "*:UpdateDailyAllocation")	
	beego.Router("/pmp/adspace/medias", &controllers.PmpMediaController{}, "*:GetAll")
	admin.Run()

}
