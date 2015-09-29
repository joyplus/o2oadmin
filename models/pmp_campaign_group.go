package models

import (
	"github.com/astaxie/beego/orm"
)

type PmpCampaignGroup struct {
	Id           int    `orm:"column(id);auto"`
	AdvertiserId int    `orm:"column(advertiser_Id)"`
	Name         string `orm:"column(name);size(50)"`
	Budget       int    `orm:"column(budget)"`
}

func (t *PmpCampaignGroup) TableName() string {
	return "pmp_campaign_group"
}

func init() {
	orm.RegisterModel(new(PmpCampaignGroup))
}
