package models

import (
	"github.com/astaxie/beego/orm"
)

type PmpCampaignTargeting struct {
	Id            int    `orm:"column(id);auto"`
	CampaignId    int    `orm:"column(campaign_id)"`
	TargetingType string `orm:"column(targeting_type);size(45);null"`
	TargetingId   int    `orm:"column(targeting_id);null"`
}

func (t *PmpCampaignTargeting) TableName() string {
	return "pmp_campaign_targeting"
}

func init() {
	orm.RegisterModel(new(PmpCampaignTargeting))
}

