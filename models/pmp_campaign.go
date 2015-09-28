package models

import (
	"errors"
	"fmt"
	"reflect"
	"strings"
	"time"

	"github.com/astaxie/beego/orm"
)

type PmpCampaign struct {
	Id              int       `orm:"column(id);auto"`
	GroupId         int       `orm:"column(group_id)"`
	Name            string    `orm:"column(name);size(45)"`
	StartDate       time.Time `orm:"column(start_date);type(date);null"`
	EndDate         time.Time `orm:"column(end_date);type(date);null"`
	CampaignStatus  int       `orm:"column(campaign_status)"`
	DemandAdspaceId int       `orm:"column(demand_adspace_id)"`
	ImpTrackingUrl  string    `orm:"column(imp_tracking_url);size(1000);null"`
	ClkTrackingUrl  string    `orm:"column(clk_tracking_url);size(1000);null"`
	LandingUrl      string    `orm:"column(landing_url);size(1000);null"`
	AdType          int       `orm:"column(ad_type);null"`
	CampaignType    int       `orm:"column(campaign_type);null"`
	AccurateType    int       `orm:"column(accurate_type);null"`
	PricingType     int       `orm:"column(pricing_type);null"`
	StrategyType    int       `orm:"column(strategy_type);null"`
	BudgetType      int       `orm:"column(budget_type);null"`
	Budget          int       `orm:"column(budget);null"`
	BidPrice        float32   `orm:"column(bid_price);null"`
}

func (t *PmpCampaign) TableName() string {
	return "pmp_campaign"
}

func init() {
	orm.RegisterModel(new(PmpCampaign))
}

// AddPmpCampaign insert a new PmpCampaign into database and returns
// last inserted Id on success.
func AddPmpCampaign(m *PmpCampaign) (id int64, err error) {
	o := orm.NewOrm()
	id, err = o.Insert(m)
	return
}

// GetPmpCampaignById retrieves PmpCampaign by Id. Returns error if
// Id doesn't exist
func GetPmpCampaignById(id int) (v *PmpCampaign, err error) {
	o := orm.NewOrm()
	v = &PmpCampaign{Id: id}
	if err = o.Read(v); err == nil {
		return v, nil
	}
	return nil, err
}

// GetAllPmpCampaign retrieves all PmpCampaign matches certain condition. Returns empty list if
// no records exist
func GetAllPmpCampaign(query map[string]string, fields []string, sortby []string, order []string,
	offset int64, limit int64) (ml []interface{}, err error) {
	o := orm.NewOrm()
	qs := o.QueryTable(new(PmpCampaign))
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

	var l []PmpCampaign
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

// UpdatePmpCampaign updates PmpCampaign by Id and returns error if
// the record to be updated doesn't exist
func UpdatePmpCampaignById(m *PmpCampaign) (err error) {
	o := orm.NewOrm()
	v := PmpCampaign{Id: m.Id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Update(m); err == nil {
			fmt.Println("Number of records updated in database:", num)
		}
	}
	return
}

// DeletePmpCampaign deletes PmpCampaign by Id and returns error if
// the record to be deleted doesn't exist
func DeletePmpCampaign(id int) (err error) {
	o := orm.NewOrm()
	v := PmpCampaign{Id: id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Delete(&PmpCampaign{Id: id}); err == nil {
			fmt.Println("Number of records deleted in database:", num)
		}
	}
	return
}
