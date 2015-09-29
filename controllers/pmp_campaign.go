package controllers

import (
	"encoding/json"
	"o2oadmin/models"

	"github.com/astaxie/beego"
)

// oprations for PmpCampaign
type PmpCampaignController struct {
	beego.Controller
}

func (c *PmpCampaignController) URLMapping() {
	c.Mapping("Post", c.Post)
}

// @Title Post
// @Description create PmpCampaign
// @Param	body		body 	models.PmpCampaign	true		"body for PmpCampaign content"
// @Success 200 {int} models.PmpCampaign.Id
// @Failure 403 body is empty
// @router / [post]
func (c *PmpCampaignController) Post() {
	var v models.PmpCampaign
	json.Unmarshal(c.Ctx.Input.RequestBody, &v)
	if id, err := models.AddPmpCampaign(&v); err == nil {
		c.Data["json"] = map[string]int64{"id": id}
	} else {
		c.Data["json"] = err.Error()
	}
	c.ServeJson()
}

