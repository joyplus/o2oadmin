package models

import (
	"errors"
	"fmt"
	"github.com/astaxie/beego/orm"
	"reflect"
	"strings"
	"time"
)

type BeMerchantQueryRequestHeader struct {
	Id                       int       `orm:"column(id);auto"`
	MerchantId               int       `orm:"column(merchant_id)"`
	RequestDatetime          time.Time `orm:"column(request_datetime);type(datetime);null"`
	RequestDeliveryTimeStart string    `orm:"column(request_delivery_time_start);size(10);null"`
	RequestDeliveryTimeEnd   string    `orm:"column(request_delivery_time_end);size(10);null"`
	PaymentDuration          int       `orm:"column(payment_duration);null"`
	CreateUser               int       `orm:"column(create_user);null"`
	UpdateUser               int       `orm:"column(update_user);null"`
	CreateTime               time.Time `orm:"column(create_time);type(timestamp);null"`
	UpdateTime               time.Time `orm:"column(update_time);type(timestamp);null;auto_now"`
	Remark                   string    `orm:"column(remark);size(255)"`
	RequestDate              string    `orm:"column(request_date);type(date)"`
}

func init() {
	orm.RegisterModel(new(BeMerchantQueryRequestHeader))
}

// AddBeMerchantQueryRequestHeader insert a new BeMerchantQueryRequestHeader into database and returns
// last inserted Id on success.
func AddBeMerchantQueryRequestHeader(m *BeMerchantQueryRequestHeader) (id int64, err error) {
	o := orm.NewOrm()
	id, err = o.Insert(m)
	return
}

// GetBeMerchantQueryRequestHeaderById retrieves BeMerchantQueryRequestHeader by Id. Returns error if
// Id doesn't exist
func GetBeMerchantQueryRequestHeaderById(id int) (v *BeMerchantQueryRequestHeader, err error) {
	o := orm.NewOrm()
	v = &BeMerchantQueryRequestHeader{Id: id}
	if err = o.Read(v); err == nil {
		return v, nil
	}
	return nil, err
}

// GetAllBeMerchantQueryRequestHeader retrieves all BeMerchantQueryRequestHeader matches certain condition. Returns empty list if
// no records exist
func GetAllBeMerchantQueryRequestHeader(query map[string]string, fields []string, sortby []string, order []string,
	offset int64, limit int64) (ml []interface{}, err error) {
	o := orm.NewOrm()
	qs := o.QueryTable(new(BeMerchantQueryRequestHeader))
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

	var l []BeMerchantQueryRequestHeader
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

// UpdateBeMerchantQueryRequestHeader updates BeMerchantQueryRequestHeader by Id and returns error if
// the record to be updated doesn't exist
func UpdateBeMerchantQueryRequestHeaderById(m *BeMerchantQueryRequestHeader) (err error) {
	o := orm.NewOrm()
	v := BeMerchantQueryRequestHeader{Id: m.Id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Update(m); err == nil {
			fmt.Println("Number of records updated in database:", num)
		}
	}
	return
}

// DeleteBeMerchantQueryRequestHeader deletes BeMerchantQueryRequestHeader by Id and returns error if
// the record to be deleted doesn't exist
func DeleteBeMerchantQueryRequestHeader(id int) (err error) {
	o := orm.NewOrm()
	v := BeMerchantQueryRequestHeader{Id: id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Delete(&BeMerchantQueryRequestHeader{Id: id}); err == nil {
			fmt.Println("Number of records deleted in database:", num)
		}
	}
	return
}
