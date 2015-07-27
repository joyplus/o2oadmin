package controllers

import (
	"encoding/json"
	"errors"
	"o2oadmin/models"
	"strconv"
	"strings"

	"github.com/beego/admin/src/rbac"
	
)

// oprations for PmpDemandPlatformDesk
type PmpDemandPlatformDeskController struct {
	rbac.CommonController
}

func (c *PmpDemandPlatformDeskController) URLMapping() {
	c.Mapping("Post", c.Post)
	c.Mapping("GetOne", c.GetOne)
	c.Mapping("GetAll", c.GetAll)
	c.Mapping("Put", c.Put)
	c.Mapping("Delete", c.Delete)
}

func (c *PmpDemandPlatformDeskController) GetDemands() {
	adspaceId := c.GetString("adspaceid")
	date := c.GetString("startdate")
	usetpl, err := c.GetBool("usetpl")
	if (err !=  nil) {
		usetpl = false;
	}
	
	demandVos := []DemandVo{{Name: "name1", Proportion: 0.2, Day1: 1000000, Day2: 1200033, Day3:3100000, Day4: 3100000, Day5:5000000, Day6: 600000, Day7:999900000}, 
					{Name: "name2", Proportion: 0.2, Day1: 1000000, Day2: 1200033, Day3:3100000, Day4: 3100000, Day5:5000000, Day6: 600000, Day7:888900000}}

	c.Data["maingridrowid"] = adspaceId
	c.Data["startdate"] = date
	if (usetpl) {
		tree := c.GetTree()
		c.Data["tree"] = &tree
		c.Data["json"] = &map[string]interface{}{"total": 2, "rows": &demandVos}
		if c.GetTemplatetype() != "easyui" {
			c.Layout = c.GetTemplatetype() + "/public/layout.tpl"
		}
		c.TplNames = c.GetTemplatetype() + "/adspace/demand-easyui.tpl"
	}  else {
		c.Data["json"] = &map[string]interface{}{"total": 2, "rows": &demandVos}
		c.ServeJson()
	}
}

type DemandVo struct {
	Name string
	Proportion float32
	Day1 int64
	Day2 int64
	Day3 int64
	Day4 int64
	Day5 int64
	Day6 int64
	Day7 int64
	Operation string
}


// @Title Post
// @Description create PmpDemandPlatformDesk
// @Param	body		body 	models.PmpDemandPlatformDesk	true		"body for PmpDemandPlatformDesk content"
// @Success 200 {int} models.PmpDemandPlatformDesk.Id
// @Failure 403 body is empty
// @router / [post]
func (c *PmpDemandPlatformDeskController) Post() {
	var v models.PmpDemandPlatformDesk
	json.Unmarshal(c.Ctx.Input.RequestBody, &v)
	if id, err := models.AddPmpDemandPlatformDesk(&v); err == nil {
		c.Data["json"] = map[string]int64{"id": id}
	} else {
		c.Data["json"] = err.Error()
	}
	c.ServeJson()
}

// @Title Get
// @Description get PmpDemandPlatformDesk by id
// @Param	id		path 	string	true		"The key for staticblock"
// @Success 200 {object} models.PmpDemandPlatformDesk
// @Failure 403 :id is empty
// @router /:id [get]
func (c *PmpDemandPlatformDeskController) GetOne() {
	idStr := c.Ctx.Input.Params[":id"]
	id, _ := strconv.Atoi(idStr)
	v, err := models.GetPmpDemandPlatformDeskById(id)
	if err != nil {
		c.Data["json"] = err.Error()
	} else {
		c.Data["json"] = v
	}
	c.ServeJson()
}

// @Title Get All
// @Description get PmpDemandPlatformDesk
// @Param	query	query	string	false	"Filter. e.g. col1:v1,col2:v2 ..."
// @Param	fields	query	string	false	"Fields returned. e.g. col1,col2 ..."
// @Param	sortby	query	string	false	"Sorted-by fields. e.g. col1,col2 ..."
// @Param	order	query	string	false	"Order corresponding to each sortby field, if single value, apply to all sortby fields. e.g. desc,asc ..."
// @Param	limit	query	string	false	"Limit the size of result set. Must be an integer"
// @Param	offset	query	string	false	"Start position of result set. Must be an integer"
// @Success 200 {object} models.PmpDemandPlatformDesk
// @Failure 403
// @router / [get]
func (c *PmpDemandPlatformDeskController) GetAll() {
	var fields []string
	var sortby []string
	var order []string
	var query map[string]string = make(map[string]string)
	var limit int64 = 10
	var offset int64 = 0

	// fields: col1,col2,entity.col3
	if v := c.GetString("fields"); v != "" {
		fields = strings.Split(v, ",")
	}
	// limit: 10 (default is 10)
	if v, err := c.GetInt64("limit"); err == nil {
		limit = v
	}
	// offset: 0 (default is 0)
	if v, err := c.GetInt64("offset"); err == nil {
		offset = v
	}
	// sortby: col1,col2
	if v := c.GetString("sortby"); v != "" {
		sortby = strings.Split(v, ",")
	}
	// order: desc,asc
	if v := c.GetString("order"); v != "" {
		order = strings.Split(v, ",")
	}
	// query: k:v,k:v
	if v := c.GetString("query"); v != "" {
		for _, cond := range strings.Split(v, ",") {
			kv := strings.Split(cond, ":")
			if len(kv) != 2 {
				c.Data["json"] = errors.New("Error: invalid query key/value pair")
				c.ServeJson()
				return
			}
			k, v := kv[0], kv[1]
			query[k] = v
		}
	}

	l, err := models.GetAllPmpDemandPlatformDesk(query, fields, sortby, order, offset, limit)
	if err != nil {
		c.Data["json"] = err.Error()
	} else {
		c.Data["json"] = l
	}
	c.ServeJson()
}

// @Title Update
// @Description update the PmpDemandPlatformDesk
// @Param	id		path 	string	true		"The id you want to update"
// @Param	body		body 	models.PmpDemandPlatformDesk	true		"body for PmpDemandPlatformDesk content"
// @Success 200 {object} models.PmpDemandPlatformDesk
// @Failure 403 :id is not int
// @router /:id [put]
func (c *PmpDemandPlatformDeskController) Put() {
	idStr := c.Ctx.Input.Params[":id"]
	id, _ := strconv.Atoi(idStr)
	v := models.PmpDemandPlatformDesk{Id: id}
	json.Unmarshal(c.Ctx.Input.RequestBody, &v)
	if err := models.UpdatePmpDemandPlatformDeskById(&v); err == nil {
		c.Data["json"] = "OK"
	} else {
		c.Data["json"] = err.Error()
	}
	c.ServeJson()
}

// @Title Delete
// @Description delete the PmpDemandPlatformDesk
// @Param	id		path 	string	true		"The id you want to delete"
// @Success 200 {string} delete success!
// @Failure 403 id is empty
// @router /:id [delete]
func (c *PmpDemandPlatformDeskController) Delete() {
	idStr := c.Ctx.Input.Params[":id"]
	id, _ := strconv.Atoi(idStr)
	if err := models.DeletePmpDemandPlatformDesk(id); err == nil {
		c.Data["json"] = "OK"
	} else {
		c.Data["json"] = err.Error()
	}
	c.ServeJson()
}
