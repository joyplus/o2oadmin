package controllers

import (
	"encoding/json"
	"errors"
	"o2oadmin/models"
	"strconv"
	"strings"

	"github.com/astaxie/beego"
    "github.com/beego/admin/src/rbac"
)

// oprations for LtvFlightGroup
type LtvFlightGroupController struct {
    rbac.CommonController
}

type FlightGroupSummaryRequest struct {
	Page         int    `form:"page"`
	Rows         int    `form:"rows"`
	Sortby       string `form:"sort"`
	Order        string `form:"order"`

	AdvertiserId string `form:"advertiserId`
	GroupId      string `form:"groupId`
}

func (c *LtvFlightGroupController) URLMapping() {
	c.Mapping("Post", c.Post)
	c.Mapping("GetOne", c.GetOne)
	c.Mapping("GetAll", c.GetAll)
	c.Mapping("Put", c.Put)
	c.Mapping("Delete", c.Delete)
}

// @Title Post
// @Description create LtvFlightGroup
// @Param	body		body 	models.LtvFlightGroup	true		"body for LtvFlightGroup content"
// @Success 200 {int} models.LtvFlightGroup.Id
// @Failure 403 body is empty
// @router / [post]
func (c *LtvFlightGroupController) Post() {
	var v models.LtvFlightGroup
	json.Unmarshal(c.Ctx.Input.RequestBody, &v)
    if v.Name != "" {
        if id, err := models.AddLtvFlightGroup(&v); err == nil {
            c.Data["json"] = map[string]int64{"id": id}
        } else {
            c.Data["json"] = err.Error()
        }
    }

	c.ServeJson()
}

// @Title Get
// @Description get LtvFlightGroup by id
// @Param	id		path 	string	true		"The key for staticblock"
// @Success 200 {object} models.LtvFlightGroup
// @Failure 403 :id is empty
// @router /:id [get]
func (c *LtvFlightGroupController) GetOne() {
	idStr := c.Ctx.Input.Params[":id"]
	id, _ := strconv.Atoi(idStr)
	v, err := models.GetLtvFlightGroupById(id)
	if err != nil {
		c.Data["json"] = err.Error()
	} else {
		c.Data["json"] = v
	}
	c.ServeJson()
}

// @Title Get All
// @Description get LtvFlightGroup
// @Param	query	query	string	false	"Filter. e.g. col1:v1,col2:v2 ..."
// @Param	fields	query	string	false	"Fields returned. e.g. col1,col2 ..."
// @Param	sortby	query	string	false	"Sorted-by fields. e.g. col1,col2 ..."
// @Param	order	query	string	false	"Order corresponding to each sortby field, if single value, apply to all sortby fields. e.g. desc,asc ..."
// @Param	limit	query	string	false	"Limit the size of result set. Must be an integer"
// @Param	offset	query	string	false	"Start position of result set. Must be an integer"
// @Success 200 {object} models.LtvFlightGroup
// @Failure 403
// @router / [get]
func (c *LtvFlightGroupController) GetAll() {
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

	l, err := models.GetAllLtvFlightGroup(query, fields, sortby, order, offset, limit)
	if err != nil {
		c.Data["json"] = err.Error()
	} else {
		c.Data["json"] = l
	}
	c.ServeJson()
}

// @Title Update
// @Description update the LtvFlightGroup
// @Param	id		path 	string	true		"The id you want to update"
// @Param	body		body 	models.LtvFlightGroup	true		"body for LtvFlightGroup content"
// @Success 200 {object} models.LtvFlightGroup
// @Failure 403 :id is not int
// @router /:id [put]
func (c *LtvFlightGroupController) Put() {
	idStr := c.Ctx.Input.Params[":id"]
	id, _ := strconv.Atoi(idStr)
	v := models.LtvFlightGroup{Id: id}
	json.Unmarshal(c.Ctx.Input.RequestBody, &v)
	if err := models.UpdateLtvFlightGroupById(&v); err == nil {
		c.Data["json"] = "OK"
	} else {
		c.Data["json"] = err.Error()
	}
	c.ServeJson()
}

// @Title Delete
// @Description delete the LtvFlightGroup
// @Param	id		path 	string	true		"The id you want to delete"
// @Success 200 {string} delete success!
// @Failure 403 id is empty
// @router /:id [delete]
func (c *LtvFlightGroupController) Delete() {
	idStr := c.Ctx.Input.Params[":id"]
	id, _ := strconv.Atoi(idStr)
	if err := models.DeleteLtvFlightGroup(id); err == nil {
		c.Data["json"] = "OK"
	} else {
		c.Data["json"] = err.Error()
	}
	c.ServeJson()
}

// @Title Delete
// @Description delete the LtvFlightGroup
// @Param	advertiserId		path 	string	true		"The advertiser id you want to query"
// @Param	groupId				path 	string	true		"The flight group id you want to query"
// @Success 200 {string} get the summary list sucessfully!
// @Failure 403 failed to get query
// @router /GetSummaryList [get]
func (c *LtvFlightGroupController) GetSummaryList() {

	request := FlightGroupSummaryRequest{}
	c.ParseForm(&request)
    beego.Debug(request)

	result, count, err := models.GetFlightGroupSummaryList(request.AdvertiserId, request.GroupId, request.Sortby, request.Order, (request.Page-1)*request.Rows, request.Rows)

	if err != nil {
		beego.Debug("failed to get ltv flight group summary report")
	} else {
		c.Data["json"] = &map[string]interface{}{"total": count, "rows": &result}
	}
	c.ServeJson()
}

// ~~~~~~~~~~~~~   below are custom methods  ~~~~~~~~~~~~~~~ //
// @router /create [get]
func (c *LtvFlightGroupController) Create() {
    c.TplNames = c.GetTemplatetype() + "/performance/project_create.tpl"
}

// @router /Detail/:id [get]
func (c *LtvFlightGroupController) Detail() {
    c.TplNames = c.GetTemplatetype() + "/performance/project_detail.tpl"
}

// @router /Edit/:id [get]
func (c *LtvFlightGroupController) Edit() {
    c.TplNames = c.GetTemplatetype() + "/performance/project_edit.tpl"
}

// @router /Save [post]
func (c *LtvFlightGroupController) Save() {
    c.TplNames = c.GetTemplatetype() + "/performance/project_detail.tpl"
}

// @router /fullReport/:id [get]
func (c *LtvFlightGroupController) FullReportPage() {
    c.TplNames = c.GetTemplatetype() + "/performance/project_detail_full_report.tpl"
}

// @router /fullReport [get]
func (c *LtvFlightGroupController) FullReportPageAll() {
    c.TplNames = c.GetTemplatetype() + "/performance/project_detail_full_report.tpl"
}