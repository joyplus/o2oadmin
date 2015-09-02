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

// oprations for PmpMedia
type PmpMediaController struct {
	rbac.CommonController
}

func (c *PmpMediaController) URLMapping() {
	c.Mapping("Post", c.Post)
	c.Mapping("GetOne", c.GetOne)
	c.Mapping("GetAll", c.GetAll)
	c.Mapping("Put", c.Put)
	c.Mapping("Delete", c.Delete)
}

// save or update media
func (c *PmpMediaController) SaveOrUpdateMedia() {
	var v models.PmpMedia
	c.ParseForm(&v)
	beego.Info("*********** pased form values:", v)
	if v.Id == 0 {
		if id, err := models.AddPmpMedia(&v); err == nil {
			c.Data["json"] = map[string]int64{"id": id}
		} else {
			c.Data["json"] = err.Error()
		}
	} else {
		if err := models.UpdatePmpMediaById(&v); err == nil {
			c.Data["json"] = "OK"
		} else {
			c.Data["json"] = err.Error()
		}
	}	
	c.ServeJson()
}

// @Title Post
// @Description create PmpMedia
// @Param	body		body 	models.PmpMedia	true		"body for PmpMedia content"
// @Success 200 {int} models.PmpMedia.Id
// @Failure 403 body is empty
// @router / [post]
func (c *PmpMediaController) Post() {
	var v models.PmpMedia
//	json.Unmarshal(c.Ctx.Input.RequestBody, &v)
	c.ParseForm(&v)
	if id, err := models.AddPmpMedia(&v); err == nil {
		c.Data["json"] = map[string]int64{"id": id}
	} else {
		c.Data["json"] = err.Error()
	}
	c.ServeJson()
}

// @Title Get
// @Description get PmpMedia by id
// @Param	id		path 	string	true		"The key for staticblock"
// @Success 200 {object} models.PmpMedia
// @Failure 403 :id is empty
// @router /:id [get]
func (c *PmpMediaController) GetOne() {
	idStr := c.Ctx.Input.Params[":id"]
	id, _ := strconv.Atoi(idStr)
	v, err := models.GetPmpMediaById(id)
	if err != nil {
		c.Data["json"] = err.Error()
	} else {
		c.Data["json"] = v
	}
	c.ServeJson()
}

// Get the media list 
func (this * PmpMediaController) GetMediaList() {
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
	
	medias, count := models.GetMediaList(page, page_size, sort, name)
	if this.IsAjax() {
		this.Data["json"] = &map[string]interface{}{"total": count, "rows": &medias}
		jsoncontent, _ := json.Marshal(this.Data["json"])
		beego.Info("*********************" + string(jsoncontent) + "******************")
		this.ServeJson()
		return
	} else {
		//this.Data["json"] = &medias
		if this.GetTemplatetype() != "easyui" {
			this.Layout = this.GetTemplatetype() + "/public/layout.tpl"
		}
		this.TplNames = this.GetTemplatetype() + "/adspace/mediamanage.tpl"
	}
}

type MediaVo struct {
	Id int
	Text string
}

// @Title Get All
// @Description get PmpMedia
// @Param	query	query	string	false	"Filter. e.g. col1:v1,col2:v2 ..."
// @Param	fields	query	string	false	"Fields returned. e.g. col1,col2 ..."
// @Param	sortby	query	string	false	"Sorted-by fields. e.g. col1,col2 ..."
// @Param	order	query	string	false	"Order corresponding to each sortby field, if single value, apply to all sortby fields. e.g. desc,asc ..."
// @Param	limit	query	string	false	"Limit the size of result set. Must be an integer"
// @Param	offset	query	string	false	"Start position of result set. Must be an integer"
// @Success 200 {object} models.PmpMedia
// @Failure 403
// @router / [get]
func (c *PmpMediaController) GetAll() {
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

	l, err := models.GetAllPmpMedia(query, fields, sortby, order, offset, limit)
	if err != nil {
		c.Data["json"] = err.Error()
	} else {
		//	[{id: 1, text: "baidu"}, {id: 2, text: "google"}]
		var medias []MediaVo
		for _, v := range l {
			if mediamodel , ok := v.(models.PmpMedia); ok {
				m := MediaVo{mediamodel.Id, mediamodel.Name};
				medias = append(medias, m)
			}						
			
		}
		c.Data["json"] = &medias
	}	
	c.ServeJson()
}

// @Title Update
// @Description update the PmpMedia
// @Param	id		path 	string	true		"The id you want to update"
// @Param	body		body 	models.PmpMedia	true		"body for PmpMedia content"
// @Success 200 {object} models.PmpMedia
// @Failure 403 :id is not int
// @router /:id [put]
func (c *PmpMediaController) Put() {
	idStr := c.Ctx.Input.Params[":id"]
	id, _ := strconv.Atoi(idStr)
	v := models.PmpMedia{Id: id}
	json.Unmarshal(c.Ctx.Input.RequestBody, &v)
	if err := models.UpdatePmpMediaById(&v); err == nil {
		c.Data["json"] = "OK"
	} else {
		c.Data["json"] = err.Error()
	}
	c.ServeJson()
}

// @Title Delete
// @Description delete the PmpMedia
// @Param	id		path 	string	true		"The id you want to delete"
// @Success 200 {string} delete success!
// @Failure 403 id is empty
// @router /:id [delete]
func (c *PmpMediaController) Delete() {
	beego.Info("******* param:", c.GetString("Id"))
	id, _ := c.GetInt("Id")
	if err := models.DeletePmpMedia(id); err == nil {
		c.Data["json"] = "OK"
	} else {
		c.Data["json"] = err.Error()
	}
	c.ServeJson()
}