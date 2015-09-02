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

// Get the demand list 
func (this *PmpDemandPlatformDeskController) GetDemandList(){
	params := "fields:" + this.GetString("fields") + " ******* page: " + this.GetString("page") + " ****** rows:" + this.GetString("rows") + " **** sort:" + 
				this.GetString("sort")  + " ****** order:" + this.GetString("order") + " ****** name: " + this.GetString("name")
	beego.Info(params)
	name := this.GetString("name")
	page, _ := this.GetInt64("page")
	page_size, _ := this.GetInt64("rows")
	sort := this.GetString("sort")
	order := this.GetString("order")
	if len(order) > 0 {
		if order == "desc" {
			sort = " " + sort
		}
	} else {
		sort = "Id"
	}
	
	demands, count := models.GetDemandList(page, page_size, sort, name)
	if this.IsAjax() {
		this.Data["json"] = &map[string]interface{}{"total": count, "rows": &demands}
		this.ServeJson()
		return
	} else {
//		this.Data["json"] = &demands
		if this.GetTemplatetype() != "easyui" {
			this.Layout = this.GetTemplatetype() + "/public/layout.tpl"
		}
		this.TplNames = this.GetTemplatetype() + "/adspace/demandmanage.tpl"
	}
}

// get the all the demands information to map to a specified adspace
func (c *PmpDemandPlatformDeskController) GetDemandsMappingInfo() {
	adspaceId, _ := c.GetInt("adspaceid")
	demandid, _ := c.GetInt("demandid")
	page, err := c.GetInt64("page")
	name := c.GetString("name")
	beego.Info(" **** param adspaceid:", adspaceId, " **** page:", c.GetString("page"), " **** demand name:", name, "*** demandid:", demandid)
	var page_size int64 
	if err != nil {
		page = 0	
	} else {
		page_size, _ = c.GetInt64("rows")
	}	
	sort := "d.Id"
	demandMappingVos, _ := models.GetDemandsMappingInfo(page, page_size, sort, name, adspaceId, demandid)	
	if page > 0 {
		c.Data["json"] = &map[string]interface{}{"total": len(demandMappingVos), "rows": &demandMappingVos}
	} else {
		c.Data["json"] = &demandMappingVos
	}
	beego.Info("********** demands mapping information:", demandMappingVos)
	c.ServeJson()
}

type DemandVo struct {
	Name string
	DemandAdspaceId int
	Proportion int
	Day1 int
	Day2 int
	Day3 int
	Day4 int
	Day5 int
	Day6 int
	Day7 int
	Operation string
	DemandAdspaceName string
}

// Get demands by adspace id
func (c *PmpDemandPlatformDeskController) GetDemandByAdspace() {
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
		//c.Data["json"] = &map[string]interface{}{"total": 2, "rows": []DemandVo{}}
		if c.GetTemplatetype() != "easyui" {
			c.Layout = c.GetTemplatetype() + "/public/layout.tpl"
		}
		c.TplNames = c.GetTemplatetype() + "/adspace/demand-easyui.tpl"
		return
	} 
	const layout = "2006-1-2"
	startdate, _ := time.Parse(layout, date)
	startdate = startdate.Local()
	enddate := startdate.AddDate(0, 0, 6)
	dateend := enddate.Format(layout)
	beego.Info(" **** startdate:" + startdate.Format(layout), " **** enddate:" , dateend)
	var dailyAllocations []models.PmpDailyAllocationVo
	adspaceIdInt, _ := strconv.Atoi(adspaceId)
	dailyAllocations = models.GetPmpDailyAllocationByAdspaceIdAndAdDate(adspaceIdInt, date, dateend)
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
	var lastdemandadspaceid int = -1
	for _, v := range dailyAllocations {	
		if lastdemandadspaceid != v.DemandAdspaceId {
			demandVos = append(demandVos, DemandVo{Name:v.Name, DemandAdspaceId:v.DemandAdspaceId, Proportion:v.Priority, DemandAdspaceName:v.DemandAdspaceName})
			lastdemandadspaceid = v.DemandAdspaceId
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

func (this *PmpDemandPlatformDeskController) UpdateDailyAllocation() {
	u := DemandVo{Day1:-1, Day2:-1, Day3:-1, Day4:-1, Day5:-1, Day6:-1, Day7:-1}
	if err := this.ParseForm(&u); err != nil {
		//handle error
		this.Rsp(false, err.Error())
		return
	}
	const layout = "2006-1-2"
	startdate, _ := time.Parse(layout, u.Operation)
	startdate = startdate.Local()
	var imps []int
	imps = append(imps, u.Day1)
	imps = append(imps, u.Day2)
	imps = append(imps, u.Day3)
	imps = append(imps, u.Day4)
	imps = append(imps, u.Day5)
	imps = append(imps, u.Day6)
	imps = append(imps, u.Day7)
	var datestrs []string
	for i := 0 ; i < 7; i++ {
		tempdate := startdate.AddDate(0, 0, i)
		datestrs = append(datestrs, tempdate.Format(layout))
	}
	beego.Info(" **** datestrs:" , datestrs, " DemandAdspaceId: ", u.DemandAdspaceId, " imps: ", imps)
	num, err := models.UpdateImpByDemandAdpaceIdAndAdDate(u.DemandAdspaceId,u.Proportion, datestrs, imps)
	if err == nil {
		beego.Info(" **** Number of rows updated: ", num)
		this.Rsp(true, "Success")
		return
	} else {
		this.Rsp(false, err.Error())
		return
	}

}

// @Title Post
// @Description create PmpDemandPlatformDesk
// @Param	body		body 	models.PmpDemandPlatformDesk	true		"body for PmpDemandPlatformDesk content"
// @Success 200 {int} models.PmpDemandPlatformDesk.Id
// @Failure 403 body is empty
// @router / [post]
func (c *PmpDemandPlatformDeskController) Post() {
	var v models.PmpDemandPlatformDesk
//	json.Unmarshal(c.Ctx.Input.RequestBody, &v)
	c.ParseForm(&v)
	if id, err := models.AddPmpDemandPlatformDesk(&v); err == nil {
		c.Data["json"] = map[string]int64{"id": id}
	} else {
		c.Data["json"] = err.Error()
	}
	c.ServeJson()
}

// save or upate demand 
func (c *PmpDemandPlatformDeskController) SaveOrUpdateDemand() {
	var v models.PmpDemandPlatformDesk
	c.ParseForm(&v)
	beego.Info("*********** pased form values:", v)
	if v.Id == 0 {
		if id, err := models.AddPmpDemandPlatformDesk(&v); err == nil {
			c.Data["json"] = map[string]int64{"id": id}
		} else {
			c.Data["json"] = err.Error()
		}
	} else {
		if err := models.UpdatePmpDemandPlatformDeskById(&v); err == nil {
			c.Data["json"] = "OK"
		} else {
			c.Data["json"] = err.Error()
		}
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
	var limit int64 = 1000
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
	beego.Info("******* param:", c.GetString("Id"))
	id, _ := c.GetInt("Id")
	if err := models.DeletePmpDemandPlatformDesk(id); err == nil {
		c.Data["json"] = "OK"
	} else {
		c.Data["json"] = err.Error()
	}
	c.ServeJson()
}