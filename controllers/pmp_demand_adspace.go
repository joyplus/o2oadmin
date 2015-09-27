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

// oprations for PmpDemandAdspace
type PmpDemandAdspaceController struct {
	rbac.CommonController
}

func (c *PmpDemandAdspaceController) URLMapping() {
	c.Mapping("GetOne", c.GetOne)
	c.Mapping("GetAll", c.GetAll)
	c.Mapping("Put", c.Put)
	c.Mapping("Delete", c.Delete)
}

// @Title Get
// @Description get PmpDemandAdspace by id
// @Param	id		path 	string	true		"The key for staticblock"
// @Success 200 {object} models.PmpDemandAdspace
// @Failure 403 :id is empty
// @router /:id [get]
func (c *PmpDemandAdspaceController) GetOne() {
	idStr := c.Ctx.Input.Params[":id"]
	id, _ := strconv.Atoi(idStr)
	v, err := models.GetPmpDemandAdspaceById(id)
	if err != nil {
		c.Data["json"] = err.Error()
	} else {
		c.Data["json"] = v
	}
	c.ServeJson()
}

// @Title Get All
// @Description get PmpDemandAdspace
// @Param	query	query	string	false	"Filter. e.g. col1:v1,col2:v2 ..."
// @Param	fields	query	string	false	"Fields returned. e.g. col1,col2 ..."
// @Param	sortby	query	string	false	"Sorted-by fields. e.g. col1,col2 ..."
// @Param	order	query	string	false	"Order corresponding to each sortby field, if single value, apply to all sortby fields. e.g. desc,asc ..."
// @Param	limit	query	string	false	"Limit the size of result set. Must be an integer"
// @Param	offset	query	string	false	"Start position of result set. Must be an integer"
// @Success 200 {object} models.PmpDemandAdspace
// @Failure 403
// @router / [get]
func (c *PmpDemandAdspaceController) GetAll() {
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

	l, err := models.GetAllPmpDemandAdspace(query, fields, sortby, order, offset, limit)
	if err != nil {
		c.Data["json"] = err.Error()
	} else {
		c.Data["json"] = l
	}
	c.ServeJson()
}

// @Title Update
// @Description update the PmpDemandAdspace
// @Param	id		path 	string	true		"The id you want to update"
// @Param	body		body 	models.PmpDemandAdspace	true		"body for PmpDemandAdspace content"
// @Success 200 {object} models.PmpDemandAdspace
// @Failure 403 :id is not int
// @router /:id [put]
func (c *PmpDemandAdspaceController) Put() {
	idStr := c.Ctx.Input.Params[":id"]
	id, _ := strconv.Atoi(idStr)
	v := models.PmpDemandAdspace{Id: id}
	json.Unmarshal(c.Ctx.Input.RequestBody, &v)
	if err := models.UpdatePmpDemandAdspaceById(&v); err == nil {
		c.Data["json"] = "OK"
	} else {
		c.Data["json"] = err.Error()
	}
	c.ServeJson()
}

// @Title Delete
// @Description delete the PmpDemandAdspace
// @Param	id		path 	string	true		"The id you want to delete"
// @Success 200 {string} delete success!
// @Failure 403 id is empty
// @router /:id [delete]
func (c *PmpDemandAdspaceController) Delete() {
	id, err := c.GetInt("adspaceid")
	beego.Info("param adspaceid:", c.GetString("adspaceid"))
	if err != nil {
		c.Data["json"] = err.Error()
		c.ServeJson()
		return 
	}
	if err = models.DeletePmpDemandAdspace(id); err == nil {
		c.Data["json"] = "OK"
	} else {
		c.Data["json"] = err.Error()
	}
	c.ServeJson()
}

// get demand adspace list by demand id
func (c *PmpDemandAdspaceController) GetDemandAdspaceListByDemand() {
	beego.Info("********* demandid:", c.GetString("demandid"), "********** demand_adspace_name:", c.GetString("name"))
	id,err := c.GetInt("demandid")
	adspacename := c.GetString("name")
	page, _ := c.GetInt64("page")
	page_size, _ := c.GetInt64("rows")
	sort := c.GetString("sort")
	order := c.GetString("order")
	usetpl,_ := c.GetBool("usetpl")
	if len(order) > 0 {
		if order == "desc" {
			sort = " " + sort + " DESC"
		}
	} else {
		sort = "Id"
	}
	var adspaceVos []models.DemandAdspaceVo
	var count int64
	if err == nil {
		adspaceVos, count = models.GetDemandAdspaceListByDemandId(page, page_size, sort, id, adspacename)
	}
	if usetpl {
//		c.Data["json"] = &adspaceVos
		c.Data["demandid"] = id
		if c.GetTemplatetype() != "easyui" {
			c.Layout = c.GetTemplatetype() + "/public/layout.tpl"
		}
		c.TplNames = c.GetTemplatetype() + "/adspace/demandadspacelist.tpl"			
		return
	} else {
		c.Data["json"] = &map[string]interface{}{"total": count, "rows": &adspaceVos}		
		c.ServeJson()
	}
}

// save or update adspace with param models.DemandAdspaceVo
func (c *PmpDemandAdspaceController) SaveOrUpdateDemandAdspace() {
	var v models.DemandAdspaceVo
	c.ParseForm(&v)
	beego.Info("*********** pased form values:", v)
	if v.Id == 0 {
		if id, err := models.AddPmpDemandAdspace(&v); err == nil {
			c.Data["json"] = map[string]int64{"id": id}
		} else {
			c.Data["json"] = err.Error()
		}
	} else {
		if err := models.UpdatePmpDemandAdspace(&v); err == nil {
			c.Data["json"] = "OK"
		} else {
			c.Data["json"] = err.Error()
		}
	}	
	c.ServeJson()
}