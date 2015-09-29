package models

import (
	"time"
	"fmt"
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
