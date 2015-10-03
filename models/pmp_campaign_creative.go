package models

import (
	"github.com/astaxie/beego/orm"
)

type PmpCampaignCreative struct {
	Id             int    `orm:"column(id);auto"`
	CampaignId     int    `orm:"column(campaign_id)"`
	Name           string `orm:"column(name);size(45);null"`
	Width          int    `orm:"column(width);null"`
	Height         int    `orm:"column(height);null"`
	CreativeUrl    string `orm:"column(creative_url);size(255);null"`
	CreativeStatus int    `orm:"column(creative_status);null"`
	LandingUrl     string `orm:"column(landing_url);size(500);null"`
	ImpTrackingUrl string `orm:"column(imp_tracking_url);size(1000);null"`
	ClkTrackingUrl string `orm:"column(clk_tracking_url);size(1000)"`
	DisplayTitle   string `orm:"column(display_title);size(200);null"`
	DisplayText    string `orm:"column(display_text);size(1000);null"`
}

func (t *PmpCampaignCreative) TableName() string {
	return "pmp_campaign_creative"
}

func init() {
	orm.RegisterModel(new(PmpCampaignCreative))
}

func AddPmpCampaignCreative(v *PmpCampaignCreative) (err error) {
	o := orm.NewOrm()
//	o.Begin()
	_, err = o.Insert(v)
	return err
//	o.Commit()
}