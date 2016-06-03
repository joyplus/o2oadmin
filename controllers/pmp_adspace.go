package controllers

import (
	"encoding/json"
	"errors"
	"o2oadmin/models"
	"strconv"
	"strings"

	"admin/src/rbac"
	"github.com/astaxie/beego"
)

// oprations for PmpAdspace
type PmpAdspaceController struct {
	rbac.CommonController
}

func (c *PmpAdspaceController) URLMapping() {
	c.Mapping("Post", c.Post)
	c.Mapping("GetOne", c.GetOne)
	c.Mapping("GetAll", c.GetAll)
	c.Mapping("Put", c.Put)
	c.Mapping("Delete", c.Delete)
}

// @Title Post
// @Description create PmpAdspace
// @Param	body		body 	models.PmpAdspace	true		"body for PmpAdspace content"
// @Success 200 {int} models.PmpAdspace.Id
// @Failure 403 body is empty
// @router / [post]
func (c *PmpAdspaceController) Post() {
	var v models.PmpAdspace
	c.ParseForm(&v)
	beego.Info("**** pased form:", v)
	if v.Id == 0 {
		if id, err := models.AddPmpAdspace(&v); err == nil {
			c.Data["json"] = map[string]int64{"id": id}
		} else {
			c.Data["json"] = err.Error()
		}
	} else {
		if err := models.UpdatePmpAdspace(&v); err == nil {
			c.Data["json"] = "OK"
		} else {
			c.Data["json"] = err.Error()
		}
	}
	c.ServeJSON()
}

// save or update adspace with param models.AdspaceVo
func (c *PmpAdspaceController) SaveOrUpdateAdspace() {
	var v models.AdspaceVo
	c.ParseForm(&v)
	beego.Info("*********** pased form values:", v)
	if v.Id == 0 {
		if id, err := models.AddPmpAdspaceAndMapDemand(&v); err == nil {
			c.Data["json"] = map[string]int64{"id": id}
		} else {
			c.Data["json"] = err.Error()
		}
	} else {
		if err := models.UpdatePmpAdspaceAndMatrix(&v); err == nil {
			c.Data["json"] = "OK"
		} else {
			c.Data["json"] = err.Error()
		}
	}
	c.ServeJSON()
}

// @Title Get
// @Description get PmpAdspace by id
// @Param	id		path 	string	true		"The key for staticblock"
// @Success 200 {object} models.PmpAdspace
// @Failure 403 :id is empty
// @router /:id [get]
func (c *PmpAdspaceController) GetOne() {
	idStr := c.Ctx.Input.Params[":id"]
	id, _ := strconv.Atoi(idStr)
	v, err := models.GetPmpAdspaceById(id)
	if err != nil {
		c.Data["json"] = err.Error()
	} else {
		c.Data["json"] = v
	}
	c.ServeJSON()
}

// @Title Get All
// @Description get PmpAdspace
// @Param	query	query	string	false	"Filter. e.g. col1:v1,col2:v2 ..."
// @Param	fields	query	string	false	"Fields returned. e.g. col1,col2 ..."
// @Param	sortby	query	string	false	"Sorted-by fields. e.g. col1,col2 ..."
// @Param	order	query	string	false	"Order corresponding to each sortby field, if single value, apply to all sortby fields. e.g. desc,asc ..."
// @Param	limit	query	string	false	"Limit the size of result set. Must be an integer"
// @Param	offset	query	string	false	"Start position of result set. Must be an integer"
// @Success 200 {object} models.PmpAdspace
// @Failure 403
// @router / [get]
func (c *PmpAdspaceController) GetAll() {
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
				c.ServeJSON()
				return
			}
			k, v := kv[0], kv[1]
			query[k] = v
		}
	}

	l, err := models.GetAllPmpAdspace(query, fields, sortby, order, offset, limit)
	if err != nil {
		c.Data["json"] = err.Error()
	} else {
		c.Data["json"] = l
	}
	c.ServeJSON()
}

// get adspace list by page
func (this *PmpAdspaceController) GetAdspaceList() {
	params := "fields:" + this.GetString("fields") + " ******* page: " + this.GetString("page") + " ****** rows:" + this.GetString("rows") + " **** sort:" +
		this.GetString("sort") + " ****** order:" + this.GetString("order") + " ****** mediaid: " + this.GetString("mediaid") +
		" ***** adspacename: " + this.GetString("adspacename")
	beego.Info(params)

	mediaid, err := this.GetInt("mediaid")
	adspacename := this.GetString("adspacename")
	if err != nil {
		mediaid = -1
	}

	page, _ := this.GetInt64("page")
	page_size, _ := this.GetInt64("rows")
	sort := this.GetString("sort")
	order := this.GetString("order")
	if len(order) > 0 {
		if order == "desc" {
			sort = "-" + sort
		}
	} else {
		sort = "Id"
	}

	adspaces, count := models.GetAdspaceList(page, page_size, sort, mediaid, adspacename)
	if this.IsAjax() {
		this.Data["json"] = &map[string]interface{}{"total": count, "rows": &adspaces}
		jsoncontent, _ := json.Marshal(this.Data["json"])
		beego.Info("*********************" + string(jsoncontent) + "******************")
		this.ServeJSON()
		return
	} else {
		//this.Data["json"] = &adspaces
		if this.GetTemplatetype() != "easyui" {
			this.Layout = this.GetTemplatetype() + "/public/layout.tpl"
		}
		this.TplName = this.GetTemplatetype() + "/adspace/adspacemanage.tpl"
	}
}

// @Title Update
// @Description update the PmpAdspace
// @Param	id		path 	string	true		"The id you want to update"
// @Param	body		body 	models.PmpAdspace	true		"body for PmpAdspace content"
// @Success 200 {object} models.PmpAdspace
// @Failure 403 :id is not int
// @router /:id [put]
func (c *PmpAdspaceController) Put() {
	idStr := c.Ctx.Input.Params[":id"]
	id, _ := strconv.Atoi(idStr)
	v := models.PmpAdspace{Id: id}
	json.Unmarshal(c.Ctx.Input.RequestBody, &v)
	if err := models.UpdatePmpAdspaceById(&v); err == nil {
		c.Data["json"] = "OK"
	} else {
		c.Data["json"] = err.Error()
	}
	c.ServeJSON()
}

// @Title Delete
// @Description delete the PmpAdspace
// @Param	id		path 	string	true		"The id you want to delete"
// @Success 200 {string} delete success!
// @Failure 403 id is empty
// @router /:id [delete]
func (c *PmpAdspaceController) Delete() {
	id, _ := c.GetInt("id")
	if err := models.DeletePmpAdspace(id); err == nil {
		c.Data["json"] = "OK"
	} else {
		c.Data["json"] = err.Error()
	}
	c.ServeJSON()
}
