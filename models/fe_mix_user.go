package models

import (
	"errors"
	"fmt"
	"reflect"
	"strings"
	"time"

	"github.com/astaxie/beego/orm"
)

type FeMixUser struct {
	Id           int       `orm:"column(id);auto"`
	LoginName    string    `orm:"column(login_name);size(50)"`
	Delflg       int8      `orm:"column(delflg);null"`
	MobileNumber string    `orm:"column(mobile_number);size(20);null"`
	Token        string    `orm:"column(token);size(100);null"`
	Password     string    `orm:"column(password);size(50);null"`
	CreateUser   int       `orm:"column(create_user);null"`
	UpdateUser   int       `orm:"column(update_user);null"`
	CreateTime   time.Time `orm:"column(create_time);type(timestamp);null"`
	UpdateTime   time.Time `orm:"column(update_time);type(timestamp);null;auto_now"`
	RoleKey      string    `orm:"column(role_key);size(3);null"`
	RealName     string    `orm:"column(real_name);size(20);null"`
	IdNumber     string    `orm:"column(id_number);size(45);null"`
	MixType      string    `orm:"column(mix_type);size(3);null"`
}

func init() {
	orm.RegisterModel(new(FeMixUser))
}

// AddFeMixUser insert a new FeMixUser into database and returns
// last inserted Id on success.
func AddFeMixUser(m *FeMixUser) (id int64, err error) {
	o := orm.NewOrm()
	id, err = o.Insert(m)
	return
}

// GetFeMixUserById retrieves FeMixUser by Id. Returns error if
// Id doesn't exist
func GetFeMixUserById(id int) (v *FeMixUser, err error) {
	o := orm.NewOrm()
	v = &FeMixUser{Id: id}
	if err = o.Read(v); err == nil {
		return v, nil
	}
	return nil, err
}

// GetAllFeMixUser retrieves all FeMixUser matches certain condition. Returns empty list if
// no records exist
func GetAllFeMixUser(query map[string]string, fields []string, sortby []string, order []string,
	offset int64, limit int64) (ml []interface{}, err error) {
	o := orm.NewOrm()
	qs := o.QueryTable(new(FeMixUser))
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

	var l []FeMixUser
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

// UpdateFeMixUser updates FeMixUser by Id and returns error if
// the record to be updated doesn't exist
func UpdateFeMixUserById(m *FeMixUser) (err error) {
	o := orm.NewOrm()
	v := FeMixUser{Id: m.Id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Update(m); err == nil {
			fmt.Println("Number of records updated in database:", num)
		}
	}
	return
}

// DeleteFeMixUser deletes FeMixUser by Id and returns error if
// the record to be deleted doesn't exist
func DeleteFeMixUser(id int) (err error) {
	o := orm.NewOrm()
	v := FeMixUser{Id: id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Delete(&FeMixUser{Id: id}); err == nil {
			fmt.Println("Number of records deleted in database:", num)
		}
	}
	return
}
