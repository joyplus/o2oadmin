package models

import (
	"errors"
	"fmt"
	"github.com/astaxie/beego/orm"
	"reflect"
	"strings"
	"time"
)

type FeMaterialMaster struct {
	Id                int       `orm:"column(id);auto"`
	Name              string    `orm:"column(name);size(45)"`
	Description       string    `orm:"column(description);size(50);null"`
	CategoryId        int       `orm:"column(category_id);size(11)"`
	UnitPrice         float32   `orm:"column(unit_price);null"`
	StandardType      string    `orm:"column(standard_type);size(3);null"`
	Delflg            int8      `orm:"column(delflg);null"`
	CreateUser        int       `orm:"column(create_user);null"`
	UpdateUser        int       `orm:"column(update_user);null"`
	CreateTime        time.Time `orm:"column(create_time);type(timestamp);null"`
	UpdateTime        time.Time `orm:"column(update_time);type(timestamp);null;auto_now"`
	ProvinceCode      string    `orm:"column(province_code);size(20);null"`
	CityCode          string    `orm:"column(city_code);size(20);null"`
	DistrictCode      string    `orm:"column(district_code);size(20);null"`
	LicenseNumber     string    `orm:"column(license_number);size(50);null"`
	LicenseNumberUrl  string    `orm:"column(license_number_url);size(200);null"`
	SecurityNumber    string    `orm:"column(security_number);size(50);null"`
	SecurityNumberUrl string    `orm:"column(security_number_url);size(200);null"`
	SrouceRegion      string    `orm:"column(srouce_region);size(20);null"`
	BrandCode         string    `orm:"column(brand_code);size(3);null"`
	RefreshCode       string    `orm:"column(refresh_code);size(3);null"`
	StandardWeight    float32   `orm:"column(standard_weight);null"`
	LadderCode        string    `orm:"column(ladder_code);size(3);null"`
	ShelfLife         int       `orm:"column(shelf_life);null"`
	PicUrl            string    `orm:"column(pic_url);size(200);null"`
}

func init() {
	orm.RegisterModel(new(FeMaterialMaster))
}

// AddFeMaterialMaster insert a new FeMaterialMaster into database and returns
// last inserted Id on success.
func AddFeMaterialMaster(m *FeMaterialMaster) (id int64, err error) {
	o := orm.NewOrm()
	id, err = o.Insert(m)
	return
}

// GetFeMaterialMasterById retrieves FeMaterialMaster by Id. Returns error if
// Id doesn't exist
func GetFeMaterialMasterById(id int) (v *FeMaterialMaster, err error) {
	o := orm.NewOrm()
	v = &FeMaterialMaster{Id: id}
	if err = o.Read(v); err == nil {
		return v, nil
	}
	return nil, err
}

// GetAllFeMaterialMaster retrieves all FeMaterialMaster matches certain condition. Returns empty list if
// no records exist
func GetAllFeMaterialMaster(query map[string]string, fields []string, sortby []string, order []string,
	offset int64, limit int64) (ml []interface{}, err error) {
	o := orm.NewOrm()
	qs := o.QueryTable(new(FeMaterialMaster))
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

	var l []FeMaterialMaster
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

// UpdateFeMaterialMaster updates FeMaterialMaster by Id and returns error if
// the record to be updated doesn't exist
func UpdateFeMaterialMasterById(m *FeMaterialMaster) (err error) {
	o := orm.NewOrm()
	v := FeMaterialMaster{Id: m.Id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Update(m); err == nil {
			fmt.Println("Number of records updated in database:", num)
		}
	}
	return
}

// DeleteFeMaterialMaster deletes FeMaterialMaster by Id and returns error if
// the record to be deleted doesn't exist
func DeleteFeMaterialMaster(id int) (err error) {
	o := orm.NewOrm()
	v := FeMaterialMaster{Id: id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Delete(&FeMaterialMaster{Id: id}); err == nil {
			fmt.Println("Number of records deleted in database:", num)
		}
	}
	return
}
