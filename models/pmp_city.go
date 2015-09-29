package models

import (
	"github.com/astaxie/beego/orm"
)

type PmpCity struct {
	Id         int    `orm:"column(city_id);pk"`
	CityName   string `orm:"column(city_name);size(50);null"`
	Zipcode    string `orm:"column(zipcode);size(50);null"`
	ProvinceId int64  `orm:"column(province_id);null"`
}

func (t *PmpCity) TableName() string {
	return "pmp_city"
}

func init() {
	orm.RegisterModel(new(PmpCity))
}
