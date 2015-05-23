package models

import (
	"errors"
	"fmt"
	"reflect"
	"strings"

	"github.com/astaxie/beego/orm"
)

type FeLov struct {
	Id        int    `orm:"column(id);auto"`
	LovCode   string `orm:"column(lov_code);size(30)"`
	LovKey    string `orm:"column(lov_key);size(3)"`
	LovValue  string `orm:"column(lov_value);size(45)"`
	DispOrder int    `orm:"column(disp_order);null"`
}

func init() {
	orm.RegisterModel(new(FeLov))
}

// AddFeLov insert a new FeLov into database and returns
// last inserted Id on success.
func AddFeLov(m *FeLov) (id int64, err error) {
	o := orm.NewOrm()
	id, err = o.Insert(m)
	return
}

// GetFeLovById retrieves FeLov by Id. Returns error if
// Id doesn't exist
func GetFeLovById(id int) (v *FeLov, err error) {
	o := orm.NewOrm()
	v = &FeLov{Id: id}
	if err = o.Read(v); err == nil {
		return v, nil
	}
	return nil, err
}

func GetFeLovsByKey(lovKey string) ([]*FeLov, error) {

	o := orm.NewOrm()
	var lovs []*FeLov
	_, err := o.QueryTable("FeLov").Filter("LovCode", lovKey).OrderBy("-DispOrder").All(&lovs)
	//lovs, err := GetAllFeLov(map[string]string{"lovKey": lovKey}, []string{"lovCode", "lovValue"}, []string{"dispOrder"}, []string{"desc"},
	//	0, 100)

	return lovs, err
}

// GetAllFeLov retrieves all FeLov matches certain condition. Returns empty list if
// no records exist
func GetAllFeLov(query map[string]string, fields []string, sortby []string, order []string,
	offset int64, limit int64) (ml []interface{}, err error) {
	o := orm.NewOrm()
	qs := o.QueryTable(new(FeLov))
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

	var l []FeLov
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

// UpdateFeLov updates FeLov by Id and returns error if
// the record to be updated doesn't exist
func UpdateFeLovById(m *FeLov) (err error) {
	o := orm.NewOrm()
	v := FeLov{Id: m.Id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Update(m); err == nil {
			fmt.Println("Number of records updated in database:", num)
		}
	}
	return
}

// DeleteFeLov deletes FeLov by Id and returns error if
// the record to be deleted doesn't exist
func DeleteFeLov(id int) (err error) {
	o := orm.NewOrm()
	v := FeLov{Id: id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Delete(&FeLov{Id: id}); err == nil {
			fmt.Println("Number of records deleted in database:", num)
		}
	}
	return
}
