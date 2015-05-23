package models

import (
	"errors"
	"fmt"
	"reflect"
	"strings"
	"time"

	"github.com/astaxie/beego/orm"
)

type FeSupplierMaster struct {
	Id                int       `orm:"column(id);auto"`
	Name              string    `orm:"column(name);size(45)"`
	Address           string    `orm:"column(address);size(500);null"`
	ScaleType         string    `orm:"column(scale_type);size(3);null"`
	Delflg            int8      `orm:"column(delflg);null"`
	MerchantType      string    `orm:"column(merchant_type);size(3);null"`
	CreateUser        int       `orm:"column(create_user);null"`
	UpdateUser        int       `orm:"column(update_user);null"`
	CreateTime        time.Time `orm:"column(create_time);type(timestamp);null"`
	UpdateTime        time.Time `orm:"column(update_time);type(timestamp);null;auto_now"`
	ProvinceCode      int       `orm:"column(province_code);null"`
	CityCode          int       `orm:"column(city_code);null"`
	DistrictCode      int       `orm:"column(district_code);null"`
	LicenseNumber     string    `orm:"column(license_number);size(50);null"`
	ContactPhone      string    `orm:"column(contact_phone);size(45);null"`
	LicenseNumberUrl  string    `orm:"column(license_number_url);size(200);null"`
	SecurityNumber    string    `orm:"column(security_number);size(50);null"`
	SecurityNumberUrl string    `orm:"column(security_number_url);size(200);null"`
	Rating            int       `orm:"column(rating);null"`
	OnTimeRate        float32   `orm:"column(on_time_rate);null"`
	OperationTypeCode string    `orm:"column(operation_type_code);size(3);null"`
	PaymentDuration   int       `orm:"column(payment_duration);null"`
}

func init() {
	orm.RegisterModel(new(FeSupplierMaster))
}

// AddFeSupplierMaster insert a new FeSupplierMaster into database and returns
// last inserted Id on success.
func AddFeSupplierMaster(m *FeSupplierMaster) (id int64, err error) {
	o := orm.NewOrm()
	id, err = o.Insert(m)
	return
}

// GetFeSupplierMasterById retrieves FeSupplierMaster by Id. Returns error if
// Id doesn't exist
func GetFeSupplierMasterById(id int) (v *FeSupplierMaster, err error) {
	o := orm.NewOrm()
	v = &FeSupplierMaster{Id: id}
	if err = o.Read(v); err == nil {
		return v, nil
	}
	return nil, err
}

// GetAllFeSupplierMaster retrieves all FeSupplierMaster matches certain condition. Returns empty list if
// no records exist
func GetAllFeSupplierMaster(query map[string]string, fields []string, sortby []string, order []string,
	offset int64, limit int64) (ml []interface{}, err error) {
	o := orm.NewOrm()
	qs := o.QueryTable(new(FeSupplierMaster))
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

	var l []FeSupplierMaster
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

// UpdateFeSupplierMaster updates FeSupplierMaster by Id and returns error if
// the record to be updated doesn't exist
func UpdateFeSupplierMasterById(m *FeSupplierMaster) (err error) {
	o := orm.NewOrm()
	v := FeSupplierMaster{Id: m.Id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Update(m); err == nil {
			fmt.Println("Number of records updated in database:", num)
		}
	}
	return
}

// DeleteFeSupplierMaster deletes FeSupplierMaster by Id and returns error if
// the record to be deleted doesn't exist
func DeleteFeSupplierMaster(id int) (err error) {
	o := orm.NewOrm()
	v := FeSupplierMaster{Id: id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Delete(&FeSupplierMaster{Id: id}); err == nil {
			fmt.Println("Number of records deleted in database:", num)
		}
	}
	return
}
