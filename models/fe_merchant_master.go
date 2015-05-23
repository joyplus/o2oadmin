package models

import (
	"errors"
	"github.com/astaxie/beego/orm"
	"reflect"
	"strings"
	"time"
)

type FeMerchantMaster struct {
	Id           int64     `orm:"column(id);auto"`
	Name         string    `orm:"column(name);size(45)"`
	MerchantType string    `orm:"column(merchant_type);size(3)"`
	Delflg       int8      `orm:"column(delflg);null"`
	CreateUser   int       `orm:"column(create_user);null"`
	UpdateUser   int       `orm:"column(update_user);null"`
	CreateTime   time.Time `orm:"column(create_time);type(timestamp);null"`
	UpdateTime   time.Time `orm:"column(update_time);type(timestamp);null"`
	Description  string    `orm:"column(description);size(2000);null"`
	ScaleType    string    `orm:"column(scale_type);size(3);null"`
	Address      string    `orm:"column(address);size(500);null"`
	Income       float32   `orm:"column(income);null"`
	Outcome      float32   `orm:"column(outcome);null"`
}

func init() {
	orm.RegisterModel(new(FeMerchantMaster))
}

// AddFeMerchantMaster insert a new FeMerchantMaster into database and returns
// last inserted Id on success.
func AddFeMerchantMaster(m *FeMerchantMaster) (id int64, err error) {
	o := orm.NewOrm()
	id, err = o.Insert(m)
	return
}

// GetFeMerchantMasterById retrieves FeMerchantMaster by Id. Returns error if
// Id doesn't exist
func GetFeMerchantMasterById(id int64) (v *FeMerchantMaster, err error) {
	o := orm.NewOrm()
	v = &FeMerchantMaster{Id: id}
	if err = o.Read(v); err == nil {
		return v, nil
	}
	return nil, err
}

// GetAllFeMerchantMaster retrieves all FeMerchantMaster matches certain condition. Returns empty list if
// no records exist
func GetAllFeMerchantMaster(query map[string]string, fields []string, sortby []string, order []string,
	offset int64, limit int64) (ml []interface{}, err error) {
	o := orm.NewOrm()
	qs := o.QueryTable(new(FeMerchantMaster))
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

	var l []FeMerchantMaster
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

// UpdateFeMerchantMaster updates FeMerchantMaster by Id and returns error if
// the record to be updated doesn't exist
func UpdateFeMerchantMasterById(m *FeMerchantMaster) (int64, error) {

	o := orm.NewOrm()
	merchant := make(orm.Params)
	if len(m.Name) > 0 {
		merchant["Name"] = m.Name
	}

	if len(merchant) == 0 {
		return 0, errors.New("update field is empty")
	}
	var table FeMerchantMaster
	num, err := o.QueryTable(table).Filter("Id", m.Id).Update(merchant)
	return num, err
}

// DeleteFeMerchantMaster deletes FeMerchantMaster by Id and returns error if
// the record to be deleted doesn't exist
func DeleteFeMerchantMaster(id int64) (int64, error) {
	o := orm.NewOrm()
	status, err := o.Delete(&FeMerchantMaster{Id: id})
	return status, err
}
