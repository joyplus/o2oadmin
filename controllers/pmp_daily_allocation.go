package controllers

import (
	"encoding/json"
	"errors"
	"o2oadmin/models"
	"strconv"
	"strings"

	"github.com/beego/admin/src/rbac"
	"github.com/astaxie/beego"
)

// oprations for PmpDailyAllocation
type PmpDailyAllocationController struct {
	rbac.CommonController
}

func (c *PmpDailyAllocationController) URLMapping() {
	c.Mapping("Post", c.Post)
	c.Mapping("GetOne", c.GetOne)
	c.Mapping("GetAll", c.GetAll)
	c.Mapping("Put", c.Put)
	c.Mapping("Delete", c.Delete)
}

// @Title Post
// @Description create PmpDailyAllocation
// @Param	body		body 	models.PmpDailyAllocation	true		"body for PmpDailyAllocation content"
// @Success 200 {int} models.PmpDailyAllocation.Id
// @Failure 403 body is empty
// @router / [post]
func (c *PmpDailyAllocationController) Post() {
	var v models.PmpDailyAllocation
	json.Unmarshal(c.Ctx.Input.RequestBody, &v)
	if id, err := models.AddPmpDailyAllocation(&v); err == nil {
		c.Data["json"] = map[string]int64{"id": id}
	} else {
		c.Data["json"] = err.Error()
	}
	c.ServeJson()
}

// @Title Get
// @Description get PmpDailyAllocation by id
// @Param	id		path 	string	true		"The key for staticblock"
// @Success 200 {object} models.PmpDailyAllocation
// @Failure 403 :id is empty
// @router /:id [get]
func (c *PmpDailyAllocationController) GetOne() {
	idStr := c.Ctx.Input.Params[":id"]
	id, _ := strconv.Atoi(idStr)
	v, err := models.GetPmpDailyAllocationById(id)
	if err != nil {
		c.Data["json"] = err.Error()
	} else {
		c.Data["json"] = v
	}
	c.ServeJson()
}

// @Title Get All
// @Description get PmpDailyAllocation
// @Param	query	query	string	false	"Filter. e.g. col1:v1,col2:v2 ..."
// @Param	fields	query	string	false	"Fields returned. e.g. col1,col2 ..."
// @Param	sortby	query	string	false	"Sorted-by fields. e.g. col1,col2 ..."
// @Param	order	query	string	false	"Order corresponding to each sortby field, if single value, apply to all sortby fields. e.g. desc,asc ..."
// @Param	limit	query	string	false	"Limit the size of result set. Must be an integer"
// @Param	offset	query	string	false	"Start position of result set. Must be an integer"
// @Success 200 {object} models.PmpDailyAllocation
// @Failure 403
// @router / [get]
func (c *PmpDailyAllocationController) GetAll() {
	var fields []string
	var sortby []string
	var order []string
	var query map[string]string = make(map[string]string)
	var limit int64 = 10
	var offset int64 = 0
	params := "fields:" + c.GetString("fields") + " ****** limit:" + c.GetString("limit") + " ****** offset:" + c.GetString("offset") + " ****** sortby:" + c.GetString("sortby") +
				" ****** query:" + c.GetString("query") + " ******* page: " + c.GetString("page") + " ****** rows:" + c.GetString("rows") + " **** sort:" + c.GetString("sort")  + " ****** order:" + c.GetString("order")
	beego.Info(params)

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

	l, count, err := models.GetAllPmpDailyAllocation(query, fields, sortby, order, offset, limit)
	if err != nil {
		c.Data["json"] = err.Error()
	} else {
		c.Data["json"] = l
	}
	if c.IsAjax() {
		c.Data["json"] = &map[string]interface{}{"total": count, "rows": &l}
		c.ServeJson()
		return
	} else {
		tree := c.GetTree()
		c.Data["tree"] = &tree
		c.Data["json"] = &map[string]interface{}{"total": count, "rows": &l}
		if c.GetTemplatetype() != "easyui" {
			c.Layout = c.GetTemplatetype() + "/public/layout.tpl"
		}
		c.TplNames = c.GetTemplatetype() + "/adspace/adspacemanage.tpl"	
	}

}

// @Title Get All
// @Description get PmpDailyAllocation
// @Param	id	query	string	false	"Start position of result set. Must be an integer"
// @Success 200 {object} models.PmpDailyAllocation
// @Failure 403
// @router / [get]
//func (c *PmpDailyAllocationController) ShowDetail() {
//	id := c.GetString("id")
//	divId := strings.Join([]string{"p", id}, "-")
//    responseString := strings.Join([]string{ "<div class='panel' style='display: block; width: 700px;'>",
//	    id,
//		"<div class='panel-header' style='width: 688px;'><div class='panel-title'>Load Panel Content</div><div class='panel-tool'><a href='javascript:void(0)' class='icon-reload'></a></div></div><div id='",
//		divId,
//		"' class='easyui-panel panel-body' title='' style='padding: 10px; width: 678px; height: 151px;' data-options=\"tools:[{iconCls:'icon-reload',handler:function(){alert('refresh'); $('#",
//		divId,
//		"').panel('refresh', '/pmp/adspace/showDetail?id=",
//		id,
//		"'); alert('refresh1');}}]\"><p style='font-size:14px'>Here is the content loaded via AJAX.</p><ul>",
//		"<li>easyui is a collection of user-interface plugin based on jQuery.</li>",
//		"<li>easyui provides essential functionality for building modem, interactive, javascript applications.</li>",
//		"<li>using easyui you don't need to write many javascript code, you usually defines user-interface by writing some HTML markup.</li>",
//		"<li>complete framework for HTML5 web page.</li>",
//		"<li>easyui save your time and scales while developing your products.</li>",
//		"<li>easyui is very easy but powerful.</li>",
//		"</ul>",
//		"</div></div>"}, "")
//	c.Ctx.WriteString(responseString)

//}


// @Title Update
// @Description update the PmpDailyAllocation
// @Param	id		path 	string	true		"The id you want to update"
// @Param	body		body 	models.PmpDailyAllocation	true		"body for PmpDailyAllocation content"
// @Success 200 {object} models.PmpDailyAllocation
// @Failure 403 :id is not int
// @router /:id [put]
func (c *PmpDailyAllocationController) Put() {
	idStr := c.Ctx.Input.Params[":id"]
	id, _ := strconv.Atoi(idStr)
	v := models.PmpDailyAllocation{Id: id}
	json.Unmarshal(c.Ctx.Input.RequestBody, &v)
	if err := models.UpdatePmpDailyAllocationById(&v); err == nil {
		c.Data["json"] = "OK"
	} else {
		c.Data["json"] = err.Error()
	}
	c.ServeJson()
}

// @Title Delete
// @Description delete the PmpDailyAllocation
// @Param	id		path 	string	true		"The id you want to delete"
// @Success 200 {string} delete success!
// @Failure 403 id is empty
// @router /:id [delete]
func (c *PmpDailyAllocationController) Delete() {
	idStr := c.Ctx.Input.Params[":id"]
	id, _ := strconv.Atoi(idStr)
	if err := models.DeletePmpDailyAllocation(id); err == nil {
		c.Data["json"] = "OK"
	} else {
		c.Data["json"] = err.Error()
	}
	c.ServeJson()
}
