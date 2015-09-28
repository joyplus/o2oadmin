package models

import (
//	"errors"
//	"fmt"
//	"reflect"
//	"strings"

	"github.com/astaxie/beego/orm"
)

type PmpLov struct {
	Id        int    `orm:"column(id);auto"`
	LovCode   string `orm:"column(lov_code);size(45)"`
	LovKey    int 	  `orm:"column(lov_key)"`
	LovValue  string `orm:"column(lov_value);size(45)"`
	DispOrder int    `orm:"column(disp_order);null"`
}

func (t *PmpLov) TableName() string {
	return "pmp_lov"
}

func init() {
	orm.RegisterModel(new(PmpLov))
}

// get all the lov key-value maps, filtered by lov code
func GetPmpLovByCode(code string)(lovs *PmpLov, err error) {
	o := orm.NewOrm()
	_, err = o.QueryTable("PmpLov").Filter("LovCode", code).OrderBy("-DispOrder").All(&lovs)
	if err != nil {
		return nil, err
	}
	return lovs, nil
}

// get all the lov key-value maps
func GetAllPmpLov() (lovs *PmpLov, err error) {
	o := orm.NewOrm()
	_, err = o.QueryTable("PmpLov").OrderBy("-LovCode").OrderBy("-DispOrder").All(&lovs)
	if err != nil {
		return nil, err	
	}
	return lovs, nil
}

