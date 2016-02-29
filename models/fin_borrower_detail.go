package models

import (
	"errors"
	"fmt"
	"reflect"
	"strings"

	"github.com/astaxie/beego/orm"
)

type FinBorrowerDetail struct {
	Id                         int     `orm:"column(id);auto"`
	LovBorrowerIdentity        int8    `orm:"column(lov_borrower_identity)"`
	Age                        int     `orm:"column(age)"`
	BaseCityId                 int     `orm:"column(base_city_id)"`
	LovUnitType                int8    `orm:"column(lov_unit_type);null"`
	WorkDuration               int     `orm:"column(work_duration);null"`
	OperationDuration          int     `orm:"column(operation_duration);null"`
	BankMonthlyIncome          float32 `orm:"column(bank_monthly_income);null"`
	CashMonthlyIncome          float32 `orm:"column(cash_monthly_income);null"`
	BankMonthlyLiquity         float32 `orm:"column(bank_monthly_liquity);null"`
	SocialSecurityFundDuration int     `orm:"column(social_security_fund_duration);null"`
	HouseFundDuration          int     `orm:"column(house_fund_duration);null"`
	LovHouseType               int8    `orm:"column(lov_house_type)"`
	LovVehicleType             int8    `orm:"column(lov_vehicle_type)"`
	IsWorkInBaseCity           int8    `orm:"column(is_work_in_base_city)"`
	IsLiveInBaseCity           int8    `orm:"column(is_live_in_base_city)"`
	HasHouseCertificate        int8    `orm:"column(has_house_certificate);null"`
	PersonsOnHouseCertificate  int     `orm:"column(persons_on_house_certificate);null"`
	LovsHouseOwners            string  `orm:"column(lovs_house_owners);size(45);null"`
	LovHouseMortgageStatus     int8    `orm:"column(lov_house_mortgage_status);null"`
	HouseArea                  int     `orm:"column(house_area);null"`
	HousePrice                 int     `orm:"column(house_price);null"`
	BackupHouseNumber          int     `orm:"column(backup_house_number);null"`
	LovCarOwnerType            int8    `orm:"column(lov_car_owner_type);null"`
	LovCarMortgageType         int8    `orm:"column(lov_car_mortgage_type);null"`
	IsVehicleLicenseInBaseCity int8    `orm:"column(is_vehicle_license_in_base_city);null"`
	VehicleAge                 int     `orm:"column(vehicle_age);null"`
	VehiclePrice               float32 `orm:"column(vehicle_price);null"`
	LovCreditRecordType        int8    `orm:"column(lov_credit_record_type)"`
	IdCardPhotoFrontUrl        string  `orm:"column(id_card_photo_front_url);size(200);null"`
	IdCardPhotoBackUrl         string  `orm:"column(id_card_photo_back_url);size(200);null"`
	HouseCertificatePhotoUrl   string  `orm:"column(house_certificate_photo_url);size(200);null"`
	VehicleCertificatePhotoUrl string  `orm:"column(vehicle_certificate_photo_url);size(200);null"`
}

func init() {
	orm.RegisterModel(new(FinBorrowerDetail))
}

// AddFinBorrowerDetail insert a new FinBorrowerDetail into database and returns
// last inserted Id on success.
func AddFinBorrowerDetail(m *FinBorrowerDetail) (id int64, err error) {
	o := orm.NewOrm()
	id, err = o.Insert(m)
	return
}

// GetFinBorrowerDetailById retrieves FinBorrowerDetail by Id. Returns error if
// Id doesn't exist
func GetFinBorrowerDetailById(id int) (v *FinBorrowerDetail, err error) {
	o := orm.NewOrm()
	v = &FinBorrowerDetail{Id: id}
	if err = o.Read(v); err == nil {
		return v, nil
	}
	return nil, err
}

// GetAllFinBorrowerDetail retrieves all FinBorrowerDetail matches certain condition. Returns empty list if
// no records exist
func GetAllFinBorrowerDetail(query map[string]string, fields []string, sortby []string, order []string,
	offset int64, limit int64) (ml []interface{}, err error) {
	o := orm.NewOrm()
	qs := o.QueryTable(new(FinBorrowerDetail))
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

	var l []FinBorrowerDetail
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

// UpdateFinBorrowerDetail updates FinBorrowerDetail by Id and returns error if
// the record to be updated doesn't exist
func UpdateFinBorrowerDetailById(m *FinBorrowerDetail) (err error) {
	o := orm.NewOrm()
	v := FinBorrowerDetail{Id: m.Id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Update(m); err == nil {
			fmt.Println("Number of records updated in database:", num)
		}
	}
	return
}

// DeleteFinBorrowerDetail deletes FinBorrowerDetail by Id and returns error if
// the record to be deleted doesn't exist
func DeleteFinBorrowerDetail(id int) (err error) {
	o := orm.NewOrm()
	v := FinBorrowerDetail{Id: id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Delete(&FinBorrowerDetail{Id: id}); err == nil {
			fmt.Println("Number of records deleted in database:", num)
		}
	}
	return
}
