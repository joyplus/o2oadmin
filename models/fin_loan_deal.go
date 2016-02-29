package models

import (
	"errors"
	"fmt"
	"reflect"
	"strings"
	"time"

	"github.com/astaxie/beego/orm"
)

type FinLoanDeal struct {
	Id              int       `orm:"column(id);auto"`
	BorrowerId      int       `orm:"column(borrower_id)"`
	SupplyOrgId     int       `orm:"column(supply_org_id)"`
	DemandOrgId     int       `orm:"column(demand_org_id)"`
	LovDealStatus   int8      `orm:"column(lov_deal_status)"`
	LoanAmount      float32   `orm:"column(loan_amount);null"`
	LovDurationType int8      `orm:"column(lov_duration_type);null"`
	Duration        int       `orm:"column(duration);null"`
	LovReturnMethod int8      `orm:"column(lov_return_method);null"`
	FirstDueDate    time.Time `orm:"column(first_due_date);type(date);null"`
	LastDueDate     time.Time `orm:"column(last_due_date);type(date);null"`
	Remark          string    `orm:"column(remark);size(500);null"`
	LovLoanType     int8      `orm:"column(lov_loan_type);null"`
}

func init() {
	orm.RegisterModel(new(FinLoanDeal))
}

// AddFinLoanDeal insert a new FinLoanDeal into database and returns
// last inserted Id on success.
func AddFinLoanDeal(m *FinLoanDeal) (id int64, err error) {
	o := orm.NewOrm()
	id, err = o.Insert(m)
	return
}

// GetFinLoanDealById retrieves FinLoanDeal by Id. Returns error if
// Id doesn't exist
func GetFinLoanDealById(id int) (v *FinLoanDeal, err error) {
	o := orm.NewOrm()
	v = &FinLoanDeal{Id: id}
	if err = o.Read(v); err == nil {
		return v, nil
	}
	return nil, err
}

// GetAllFinLoanDeal retrieves all FinLoanDeal matches certain condition. Returns empty list if
// no records exist
func GetAllFinLoanDeal(query map[string]string, fields []string, sortby []string, order []string,
	offset int64, limit int64) (ml []interface{}, err error) {
	o := orm.NewOrm()
	qs := o.QueryTable(new(FinLoanDeal))
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

	var l []FinLoanDeal
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

// UpdateFinLoanDeal updates FinLoanDeal by Id and returns error if
// the record to be updated doesn't exist
func UpdateFinLoanDealById(m *FinLoanDeal) (err error) {
	o := orm.NewOrm()
	v := FinLoanDeal{Id: m.Id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Update(m); err == nil {
			fmt.Println("Number of records updated in database:", num)
		}
	}
	return
}

// DeleteFinLoanDeal deletes FinLoanDeal by Id and returns error if
// the record to be deleted doesn't exist
func DeleteFinLoanDeal(id int) (err error) {
	o := orm.NewOrm()
	v := FinLoanDeal{Id: id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Delete(&FinLoanDeal{Id: id}); err == nil {
			fmt.Println("Number of records deleted in database:", num)
		}
	}
	return
}
