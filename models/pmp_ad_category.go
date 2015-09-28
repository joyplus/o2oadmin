package models

import (
	"github.com/astaxie/beego/orm"
)

type PmpAdCategory struct {
	Id       int    `orm:"column(id);auto"`
	Name     string `orm:"column(name);size(45)"`
	ParentId int    `orm:"column(parent_id);null"`
}

func (t *PmpAdCategory) TableName() string {
	return "pmp_ad_category"
}

func init() {
	orm.RegisterModel(new(PmpAdCategory))
}

// Get the categorys in first level
func GetPmpAdCategoryOne()(categorys *PmpAdCategory, count int64) {
	o := orm.NewOrm()
	count, _ = o.QueryTable("PmpAdCategory").Filter("ParentId", nil).OrderBy("Id").All(&categorys)
	return categorys, count
}

// Get the categorys by id of parent category
func GetPmpAdCategoryByParentId(parentId int)(categorys *PmpAdCategory, count int64) {
	o := orm.NewOrm()
	count, _ = o.QueryTable("PmpAdCategory").Filter("ParentId", parentId).OrderBy("Id").All(&categorys)
	return categorys, count
}


