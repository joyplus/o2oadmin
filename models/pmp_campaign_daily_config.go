package models

import (
	"github.com/astaxie/beego/orm"
)

type PmpCampaignDailyConfig struct {
	Id          int    `orm:"column(id);auto"`
	CampaignId  int    `orm:"column(campaign_id)"`
	WeekDay     int    `orm:"column(week_day)"`
	TargetHours string `orm:"column(target_hours);size(100);null"`
}

func (t *PmpCampaignDailyConfig) TableName() string {
	return "pmp_campaign_daily_config"
}

func init() {
	orm.RegisterModel(new(PmpCampaignDailyConfig))
}
