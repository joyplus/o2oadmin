package models

import (
	"errors"
	"fmt"
	"reflect"
	"strings"

	"github.com/astaxie/beego/orm"
)

type FinOrg struct {
	Id                  int    `orm:"column(id);auto"`
	Name                string `orm:"column(name);size(100)"`
	LovOrgType          int8   `orm:"column(lov_org_type)"`
	Address             string `orm:"column(address);size(200);null"`
	OrgPhoneNumber      string `orm:"column(org_phone_number);size(20);null"`
	ContactName         string `orm:"column(contact_name);size(20);null"`
	ContactMobileNumber string `orm:"column(contact_mobile_number);size(20);null"`
	BaseCityId          int    `orm:"column(base_city_id);null"`
	OrgLicenseNumber    string `orm:"column(org_license_number);size(45);null"`
	OrgLicensePhotoUrl  string `orm:"column(org_license_photo_url);size(200);null"`
}

func init() {
	orm.RegisterModel(new(FinOrg))
}

// AddFinOrg insert a new FinOrg into database and returns
// last inserted Id on success.
func AddFinOrg(m *FinOrg) (id int64, err error) {
	o := orm.NewOrm()
	id, err = o.Insert(m)
	return
}

// GetFinOrgById retrieves FinOrg by Id. Returns error if
// Id doesn't exist
func GetFinOrgById(id int) (v *FinOrg, err error) {
	o := orm.NewOrm()
	v = &FinOrg{Id: id}
	if err = o.Read(v); err == nil {
		return v, nil
	}
	return nil, err
}

// GetAllFinOrg retrieves all FinOrg matches certain condition. Returns empty list if
// no records exist
func GetAllFinOrg(query map[string]string, fields []string, sortby []string, order []string,
	offset int64, limit int64) (ml []interface{}, err error) {
	o := orm.NewOrm()
	qs := o.QueryTable(new(FinOrg))
	// query k=v
	for k, v := range query {
		// rewrite dot-notation to Object__Attribute
		k = strings.Replace(k, ".", "__", -1)
		qs = qs.Filter(k, v)
	}
	// order by:
	var sortFields []string
	if len(sortby) != 0 {
		if len(sortby) == len(order) {
			// 1) for each sort field, there is an associated order
			for i, v := range sortby {
				orderby := ""
				if order[i] == "desc" {
					orderby = "-" + v
				} else if order[i] == "asc" {
					orderby = v
				} else {
					return nil, errors.New("Error: Invalid order. Must be either [asc|desc]")
				}
				sortFields = append(sortFields, orderby)
			}
			qs = qs.OrderBy(sortFields...)
		} else if len(sortby) != len(order) && len(order) == 1 {
			// 2) there is exactly one order, all the sorted fields will be sorted by this order
			for _, v := range sortby {
				orderby := ""
				if order[0] == "desc" {
					orderby = "-" + v
				} else if order[0] == "asc" {
					orderby = v
				} else {
					return nil, errors.New("Error: Invalid order. Must be either [asc|desc]")
				}
				sortFields = append(sortFields, orderby)
			}
		} else if len(sortby) != len(order) && len(order) != 1 {
			return nil, errors.New("Error: 'sortby', 'order' sizes mismatch or 'order' size is not 1")
		}
	} else {
		if len(order) != 0 {
			return nil, errors.New("Error: unused 'order' fields")
		}
	}

	var l []FinOrg
	qs = qs.OrderBy(sortFields...)
	if _, err := qs.Limit(limit, offset).All(&l, fields...); err == nil {
		if len(fields) == 0 {
			for _, v := range l {
				ml = append(ml, v)
			}
		} else {
			// trim unused fields
			for _, v := range l {
				m := make(map[string]interface{})
				val := reflect.ValueOf(v)
				for _, fname := range fields {
					m[fname] = val.FieldByName(fname).Interface()
				}
				ml = append(ml, m)
			}
		}
		return ml, nil
	}
	return nil, err
}

// UpdateFinOrg updates FinOrg by Id and returns error if
// the record to be updated doesn't exist
func UpdateFinOrgById(m *FinOrg) (err error) {
	o := orm.NewOrm()
	v := FinOrg{Id: m.Id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Update(m); err == nil {
			fmt.Println("Number of records updated in database:", num)
		}
	}
	return
}

// DeleteFinOrg deletes FinOrg by Id and returns error if
// the record to be deleted doesn't exist
func DeleteFinOrg(id int) (err error) {
	o := orm.NewOrm()
	v := FinOrg{Id: id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Delete(&FinOrg{Id: id}); err == nil {
			fmt.Println("Number of records deleted in database:", num)
		}
	}
	return
}
