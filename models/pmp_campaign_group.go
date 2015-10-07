package models

import (
	"github.com/astaxie/beego/orm"
	"o2oadmin/vo"
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

func GetAllCampaignGroup()[]vo.PmpCampaignGroupVO {
	groups := []vo.PmpCampaignGroupVO{}
	o := orm.NewOrm()
	o.QueryTable("PmpCampaignGroup").All(groups)
	return groups
}