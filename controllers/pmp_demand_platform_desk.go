package controllers

import (
	"encoding/json"
	"errors"
	"o2oadmin/models"
	"strconv"
	"strings"
	"time"
	"github.com/beego/admin/src/rbac"
	"github.com/astaxie/beego"
	
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

type DemandVo struct {
	Name string
	Proportion float32
	Day1 int
	Day2 int
	Day3 int
	Day4 int
	Day5 int
	Day6 int
	Day7 int
	Operation string
}

func (c *PmpDemandPlatformDeskController) GetDemands() {
	adspaceId := c.GetString("adspaceid")
	date := c.GetString("startdate")
	usetpl, err := c.GetBool("usetpl")
	beego.Info(" **** param adspaceid: " + adspaceId + " *** param startdate: " + date + " **** param usetpl: " + strconv.FormatBool(usetpl))
	if (err !=  nil) {
		usetpl = false;
	}
	c.Data["maingridrowid"] = adspaceId
	c.Data["startdate"] = date
	if (usetpl) {
		tree := c.GetTree()
		c.Data["tree"] = &tree
		c.Data["json"] = &map[string]interface{}{"total": 2, "rows": []DemandVo{}}
		if c.GetTemplatetype() != "easyui" {
			c.Layout = c.GetTemplatetype() + "/public/layout.tpl"
		}
		c.TplNames = c.GetTemplatetype() + "/adspace/demand-easyui.tpl"
		return
	} 
	const layout = "2006-1-2"
	startdate, _ := time.Parse(layout, date)
	startdate = startdate.Local()
	beego.Info(" **** startdate:" + startdate.Format(layout))
	var dailyAllocations []models.PmpDailyAllocationVo
	adspaceIdInt, _ := strconv.Atoi(adspaceId)
	dailyAllocations = models.GetPmpDailyAllocationByAdspaceIdAndAdDate(adspaceIdInt, startdate)
	var demandVos []DemandVo
	var days [7]string
	var y, d int
	var m time.Month
	y,m,d = startdate.Date()
	days[0] = strconv.Itoa(y) + "-" + m.String() + "-" + strconv.Itoa(d)
	for i := 1; i < 7; i++ {
		startdate = startdate.AddDate(0, 0, 1)
		y,m,d = startdate.Date()
		days[i] = strconv.Itoa(y) + "-" + m.String() + "-" + strconv.Itoa(d)
	}
	var lastdemandname string = ""
	for _, v := range dailyAllocations {	
		if lastdemandname != v.Name {
			demandVos = append(demandVos, DemandVo{Name: v.Name})
			lastdemandname = v.Name
		}
		y,m,d  := v.AdDate.Date()
		addate := strconv.Itoa(y) + "-" + m.String() + "-" + strconv.Itoa(d)
		for index, val := range days {
			var allocation int
			currIndex := len(demandVos) - 1
			
			if val == addate {
				allocation = v.Imp
				switch index {
					case 0:
						demandVos[currIndex].Day1 = allocation
					case 1:
						demandVos[currIndex].Day2 = allocation
					case 2:
						demandVos[currIndex].Day3 = allocation
					case 3:
						demandVos[currIndex].Day4 = allocation
					case 4:
						demandVos[currIndex].Day5 = allocation
					case 5:
						demandVos[currIndex].Day6 = allocation
					case 6:
						demandVos[currIndex].Day7 = allocation
				}
			}
			
		}
		
	}
	beego.Info("**** demandVos:", demandVos)
	c.Data["json"] = &map[string]interface{}{"total": len(demandVos), "rows": &demandVos}
	c.ServeJson()

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
