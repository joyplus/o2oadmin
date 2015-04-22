package models

import (
	"errors"
	"fmt"
	"reflect"
	"strings"
	"time"

	"github.com/astaxie/beego/orm"
)

type BeEvent struct {
	Id         int       `orm:"column(id);auto"`
	UserId     int       `orm:"column(user_id)"`
	EventType  string    `orm:"column(event_type);size(3)"`
	EventExtra string    `orm:"column(event_extra);size(255);null"`
	EventTime  time.Time `orm:"column(event_time);type(datetime);null"`
	CreateUser int       `orm:"column(create_user);null"`
	UpdateUser int       `orm:"column(update_user);null"`
	CreateTime time.Time `orm:"column(create_time);type(timestamp);null"`
	UpdateTime time.Time `orm:"column(update_time);type(timestamp);null"`
}

func init() {
	orm.RegisterModel(new(BeEvent))
}

// AddBeEvent insert a new BeEvent into database and returns
// last inserted Id on success.
func AddBeEvent(m *BeEvent) (id int64, err error) {
	o := orm.NewOrm()
	id, err = o.Insert(m)
	return
}

// GetBeEventById retrieves BeEvent by Id. Returns error if
// Id doesn't exist
func GetBeEventById(id int) (v *BeEvent, err error) {
	o := orm.NewOrm()
	v = &BeEvent{Id: id}
	if err = o.Read(v); err == nil {
		return v, nil
	}
	return nil, err
}

// GetAllBeEvent retrieves all BeEvent matches certain condition. Returns empty list if
// no records exist
func GetAllBeEvent(query map[string]string, fields []string, sortby []string, order []string,
	offset int64, limit int64) (ml []interface{}, err error) {
	o := orm.NewOrm()
	qs := o.QueryTable(new(BeEvent))
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

	var l []BeEvent
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

// UpdateBeEvent updates BeEvent by Id and returns error if
// the record to be updated doesn't exist
func UpdateBeEventById(m *BeEvent) (err error) {
	o := orm.NewOrm()
	v := BeEvent{Id: m.Id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Update(m); err == nil {
			fmt.Println("Number of records updated in database:", num)
		}
	}
	return
}

// DeleteBeEvent deletes BeEvent by Id and returns error if
// the record to be deleted doesn't exist
func DeleteBeEvent(id int) (err error) {
	o := orm.NewOrm()
	v := BeEvent{Id: id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Delete(&BeEvent{Id: id}); err == nil {
			fmt.Println("Number of records deleted in database:", num)
		}
	}
	return
}
