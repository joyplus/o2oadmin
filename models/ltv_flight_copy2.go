package models

import (
	"errors"
	"fmt"
	"reflect"
	"strings"

	"github.com/astaxie/beego/orm"
)

type LtvFlightCopy2 struct {
	Id              int     `orm:"column(id);auto"`
	GroupId         int     `orm:"column(group_id)"`
	Name            string  `orm:"column(name);size(45)"`
	Budget          float32 `orm:"column(budget);null"`
	Spending        float32 `orm:"column(spending);null"`
	Cost            float32 `orm:"column(cost);null"`
	Install         int     `orm:"column(install);null"`
	PostbackInstall int     `orm:"column(postback_install);null"`
	Register        int     `orm:"column(register);null"`
	Conversion      int     `orm:"column(conversion);null"`
	Revenue         float32 `orm:"column(revenue);null"`
	ECPA            float32 `orm:"column(eCPA);null"`
}

func (t *LtvFlightCopy2) TableName() string {
	return "ltv_flight_copy2"
}

func init() {
	orm.RegisterModel(new(LtvFlightCopy2))
}

// AddLtvFlightCopy2 insert a new LtvFlightCopy2 into database and returns
// last inserted Id on success.
func AddLtvFlightCopy2(m *LtvFlightCopy2) (id int64, err error) {
	o := orm.NewOrm()
	id, err = o.Insert(m)
	return
}

// GetLtvFlightCopy2ById retrieves LtvFlightCopy2 by Id. Returns error if
// Id doesn't exist
func GetLtvFlightCopy2ById(id int) (v *LtvFlightCopy2, err error) {
	o := orm.NewOrm()
	v = &LtvFlightCopy2{Id: id}
	if err = o.Read(v); err == nil {
		return v, nil
	}
	return nil, err
}

// GetAllLtvFlightCopy2 retrieves all LtvFlightCopy2 matches certain condition. Returns empty list if
// no records exist
func GetAllLtvFlightCopy2(query map[string]string, fields []string, sortby []string, order []string,
	offset int64, limit int64) (ml []interface{}, err error) {
	o := orm.NewOrm()
	qs := o.QueryTable(new(LtvFlightCopy2))
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

	var l []LtvFlightCopy2
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

// UpdateLtvFlightCopy2 updates LtvFlightCopy2 by Id and returns error if
// the record to be updated doesn't exist
func UpdateLtvFlightCopy2ById(m *LtvFlightCopy2) (err error) {
	o := orm.NewOrm()
	v := LtvFlightCopy2{Id: m.Id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Update(m); err == nil {
			fmt.Println("Number of records updated in database:", num)
		}
	}
	return
}

// DeleteLtvFlightCopy2 deletes LtvFlightCopy2 by Id and returns error if
// the record to be deleted doesn't exist
func DeleteLtvFlightCopy2(id int) (err error) {
	o := orm.NewOrm()
	v := LtvFlightCopy2{Id: id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Delete(&LtvFlightCopy2{Id: id}); err == nil {
			fmt.Println("Number of records deleted in database:", num)
		}
	}
	return
}
