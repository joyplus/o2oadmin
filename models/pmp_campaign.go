package models

import (
	"time"
	"fmt"
	"github.com/astaxie/beego/orm"
	"o2oadmin/vo"
	"strings"
	"strconv"
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
	AdCategory 		int       `orm:"column(ad_category);null"`
}

const (
	 AD_TYPE string = "ad_type"
	 CAMPAIGN_TYPE string = "campaign_type"
	 ACCURATE_TYPE string = "accurate_type"
	 PRICING_TYPE string = "pricing_type"
	 STRATEGY_TYPE string = "strategy_type"
	 BUDGET_TYPE string = "budget_type"
	 CAMPAIGN_STATUS string = "campaign_status"
	 GENDER string = "gender"
	 TEMPRETURE string = "tempreture"
	 HUMIDITY string = "humidity"
	 WIND string = "wind"
	 WEATHER string = "weather"
	 OCCUPATION string = "occupation"
	 OPERATOR string = "operator"
	 PLATEFORM string = "plateform"
	 PHONE_BRAND string = "phone_brand"
	 INTERNET string = "internet"
	 CITY string = "CITY"
	 PROVINCE string = "PROVINCE") 
	
func (t *PmpCampaign) TableName() string {
	return "pmp_campaign"
}

func init() {
	orm.RegisterModel(new(PmpCampaign))
}

// update or create a new campaign
func SaveOrCreateCampaign(campaignPageVo vo.CampaingnPageVO) (err error) {
	o := orm.NewOrm()
	o.Begin()
	if campaignPageVo.Campaign.Id == 0 {
		// create new campaign group
		group := PmpCampaignGroup{Name:campaignPageVo.Campaign.GroupName}
		var id int64
		_, id, err = o.ReadOrCreate(&group, "Name")
		if err != nil {
			fmt.Errorf("Failed to ReadOrCreate PmpCampaignGroup!")
			o.Rollback()
			return	
		}	
		groupId := int(id)
		adCat := campaignPageVo.Campaign.AdCategory[len(campaignPageVo.Campaign.AdCategory) -1]
		// create new Campaign			
		campaign := PmpCampaign{GroupId:groupId, CampaignStatus:0, ImpTrackingUrl:campaignPageVo.Campaign.ImpTrackingUrl,
					ClkTrackingUrl:campaignPageVo.Campaign.ClkTrackingUrl, LandingUrl:campaignPageVo.Campaign.LandingUrl, AdType:campaignPageVo.Campaign.AdType, AccurateType:campaignPageVo.Campaign.AccurateType,
					PricingType:campaignPageVo.Campaign.PricingType, StrategyType:campaignPageVo.Campaign.StrategyType, BudgetType:campaignPageVo.Campaign.BudgetType,
					Budget:campaignPageVo.Campaign.Budget, BidPrice:campaignPageVo.Campaign.BidPrice, AdCategory:adCat}
					
		if campaignPageVo.Campaign.StartDate != "" {
			startDate, er := campaign.ParseDate(campaignPageVo.Campaign.StartDate)
			if er == nil {
				campaign.StartDate = startDate
			}
			
			endDate, er1 := campaign.ParseDate(campaignPageVo.Campaign.EndDate)
			if er1 == nil {
				campaign.EndDate = endDate
			}			
		}
		id, err = o.Insert(&campaign)
		if err != nil {
			fmt.Errorf("Failed to insert campaign!")
			o.Rollback();
			return
		}
		// For test, won't try to insert or update targeting data
		o.Commit()
		return nil
		
		// create new PmpCampaignTargeting
		campaignId := int(id)
		campaignTargetings := []PmpCampaignTargeting{{CampaignId:campaignId, TargetingType:GENDER, TargetingId:campaignPageVo.Gender}, {CampaignId:campaignId, TargetingType:TEMPRETURE, TargetingId:campaignPageVo.Tempreture},
								{CampaignId:campaignId, TargetingType:HUMIDITY, TargetingId:campaignPageVo.Humidity}, {CampaignId:campaignId, TargetingType:WIND, TargetingId:campaignPageVo.Wind}, {CampaignId:campaignId, TargetingType:WEATHER, TargetingId:campaignPageVo.Weather},
								{CampaignId:campaignId, TargetingType:OCCUPATION, TargetingId:campaignPageVo.Occupation}, {CampaignId:campaignId, TargetingType:OPERATOR, TargetingId:campaignPageVo.Operator}, {CampaignId:campaignId, TargetingType:PLATEFORM, TargetingId:campaignPageVo.Plateform},
								{CampaignId:campaignId, TargetingType:PHONE_BRAND, TargetingId:campaignPageVo.PhoneBrand}, {CampaignId:campaignId, TargetingType:INTERNET, TargetingId:campaignPageVo.Internet}}
		_, err = o.InsertMulti(10, campaignTargetings)
		if err != nil {
			fmt.Errorf("Failed to insert CampaignTargetings!")
			o.Rollback()
			return
		}
		campaignTargetings = []PmpCampaignTargeting{}
		for _, value := range campaignPageVo.Cities {
			campaignTargetings = append(campaignTargetings, PmpCampaignTargeting{CampaignId:campaignId, TargetingType:CITY, TargetingId:value})
		}
		_, err = o.InsertMulti(len(campaignPageVo.Cities), campaignTargetings)
		if err != nil {
			fmt.Errorf("Failed to insert CITY CampaignTargetings!")
			o.Rollback()
			return
		}
		
		// create PmpCampaignDailyConfig
		campaignConfigs := []PmpCampaignDailyConfig{}
		for _, val := range campaignPageVo.AdvertiseTime {
			timeArray := strings.Split(val, ";")
			weekday,_ := strconv.Atoi(timeArray[0])
			config := PmpCampaignDailyConfig{CampaignId:campaignId, WeekDay:weekday, TargetHours:timeArray[1]}
			campaignConfigs = append(campaignConfigs, config)
		}
		_, err = o.InsertMulti(len(campaignPageVo.AdvertiseTime), campaignConfigs)
		if err != nil {
			fmt.Errorf("Failed to insert PmpCampaignDailyConfig!")
			o.Rollback()
			return
		}
		
	} else {
		// update the existing campaign
		campaign := PmpCampaign{Id: campaignPageVo.Campaign.Id}
		o.Read(&campaign)
		// create new campaign group
		group := PmpCampaignGroup{Name:campaignPageVo.Campaign.GroupName}
		var id int64
		_, id, err = o.ReadOrCreate(&group, "Name")
		if err != nil {
			fmt.Errorf("Failed to ReadOrCreate PmpCampaignGroup!")
			o.Rollback()
			return	
		}	
		groupId := int(id)
		// update new Campaign			
		campaign.GroupId = groupId
		campaign.ImpTrackingUrl = campaignPageVo.Campaign.ImpTrackingUrl
		campaign.ClkTrackingUrl = campaignPageVo.Campaign.ClkTrackingUrl
		campaign.LandingUrl = campaignPageVo.Campaign.LandingUrl
		campaign.AdType = campaignPageVo.Campaign.AdType
		campaign.AccurateType = campaignPageVo.Campaign.AccurateType
		campaign.PricingType = campaignPageVo.Campaign.PricingType
		campaign.StrategyType = campaignPageVo.Campaign.StrategyType
		campaign.BudgetType = campaignPageVo.Campaign.BudgetType
		campaign.Budget = campaignPageVo.Campaign.Budget
		campaign.BidPrice = campaignPageVo.Campaign.BidPrice
		campaign.AdCategory = campaignPageVo.Campaign.AdCategory[len(campaignPageVo.Campaign.AdCategory) -1]
					
		if campaignPageVo.Campaign.StartDate != "" {
			startDate, er := campaign.ParseDate(campaignPageVo.Campaign.StartDate)
			if er == nil {
				campaign.StartDate = startDate
			}
			
			endDate, er1 := campaign.ParseDate(campaignPageVo.Campaign.EndDate)
			if er1 == nil {
				campaign.EndDate = endDate
			}			
		}
		id, err = o.Update(&campaign)
		if err != nil {
			fmt.Errorf("Failed to update campaign!")
			o.Rollback();
			return
		}
		
		// For test, won't try to insert or update targeting data
		o.Commit()
		return nil
		
		// update new PmpCampaignTargeting
		// delete existed campaign targetings
		delSql := "DELETE FROM pmp_campaign_targeting WHERE CampaignId=?"
		_, err = o.Raw(delSql, campaign.Id).Exec()
		if err != nil {
			fmt.Errorf("Failed to delete campaign targetings!")
			o.Rollback()
			return
		}
		campaignId := campaign.Id
		campaignTargetings := []PmpCampaignTargeting{{CampaignId:campaignId, TargetingType:GENDER, TargetingId:campaignPageVo.Gender}, {CampaignId:campaignId, TargetingType:TEMPRETURE, TargetingId:campaignPageVo.Tempreture},
								{CampaignId:campaignId, TargetingType:HUMIDITY, TargetingId:campaignPageVo.Humidity}, {CampaignId:campaignId, TargetingType:WIND, TargetingId:campaignPageVo.Wind}, {CampaignId:campaignId, TargetingType:WEATHER, TargetingId:campaignPageVo.Weather},
								{CampaignId:campaignId, TargetingType:OCCUPATION, TargetingId:campaignPageVo.Occupation}, {CampaignId:campaignId, TargetingType:OPERATOR, TargetingId:campaignPageVo.Operator}, {CampaignId:campaignId, TargetingType:PLATEFORM, TargetingId:campaignPageVo.Plateform},
								{CampaignId:campaignId, TargetingType:PHONE_BRAND, TargetingId:campaignPageVo.PhoneBrand}, {CampaignId:campaignId, TargetingType:INTERNET, TargetingId:campaignPageVo.Internet}}
		_, err = o.InsertMulti(10, campaignTargetings)
		if err != nil {
			fmt.Errorf("Failed to insert CampaignTargetings!")
			o.Rollback()
			return
		}
		campaignTargetings = []PmpCampaignTargeting{}
		for _, value := range campaignPageVo.Cities {
			campaignTargetings = append(campaignTargetings, PmpCampaignTargeting{CampaignId:campaignId, TargetingType:CITY, TargetingId:value})
		}
		_, err = o.InsertMulti(len(campaignPageVo.Cities), campaignTargetings)
		if err != nil {
			fmt.Errorf("Failed to insert CITY CampaignTargetings!")
			o.Rollback()
			return
		}
		
		// create PmpCampaignDailyConfig
		// delete PmpCampaignDailyConfig at first
		delSql = "DELETE FROM PmpCampaignDailyConfig WHERE CampaignId=?"
		_, err = o.Raw(delSql, campaign.Id).Exec()
		if err != nil {
			fmt.Errorf("Failed to delete PmpCampaignDailyConfig!")
			o.Rollback()
			return
		}
		campaignConfigs := []PmpCampaignDailyConfig{}
		for _, val := range campaignPageVo.AdvertiseTime {
			timeArray := strings.Split(val, ";")
			weekday,_ := strconv.Atoi(timeArray[0])
			config := PmpCampaignDailyConfig{CampaignId:campaignId, WeekDay:weekday, TargetHours:timeArray[1]}
			campaignConfigs = append(campaignConfigs, config)
		}
		_, err = o.InsertMulti(len(campaignPageVo.AdvertiseTime), campaignConfigs)
		if err != nil {
			fmt.Errorf("Failed to insert PmpCampaignDailyConfig!")
			o.Rollback()
			return
		}
		// delete no more related campaign creative
		delSql = "DELETE FROM pmp_campaign_creative WHERE campaign_id=? AND id NOT IN ?"
		creativeIds := []int{}
		for _, val := range campaignPageVo.CampaignCreatives {
			creativeIds = append(creativeIds, val.Id)
		}
		_, err = o.Raw(delSql, campaign.Id, creativeIds).Exec()
		if err != nil {
			fmt.Errorf("Failed to delete PmpCampaignCreative!")
			o.Rollback()
			return
		}
	}
	o.Commit()
	return nil
}

func (this *PmpCampaign) ParseDate(datestr string)(date time.Time, err error) {
	var layout = "2006-1-2"
	date, err = time.Parse(layout, datestr)
	return date, err
}

// AddPmpCampaign insert a new PmpCampaign into database and returns
// last inserted Id on success.
func AddPmpCampaign(m *PmpCampaign) (id int64, err error) {
	o := orm.NewOrm()
	id, err = o.Insert(m)
	return
}

// GetPmpCampaignById retrieves PmpCampaign by Id. 
func GetPmpCampaignById(id int) (v vo.PmpCampaignVO) {
	o := orm.NewOrm()
	campaign := PmpCampaign{Id: id}
	if err := o.Read(&campaign); err != nil {
		return vo.PmpCampaignVO{Id:0}
	}
	v = vo.PmpCampaignVO{Id:id, GroupId:campaign.GroupId, Name:campaign.Name, CampaignStatus:campaign.CampaignStatus,
		DemandAdspaceId:campaign.DemandAdspaceId, ImpTrackingUrl:campaign.ImpTrackingUrl, ClkTrackingUrl:campaign.ClkTrackingUrl,
		LandingUrl:campaign.LandingUrl, AdType:campaign.AdType,CampaignType:campaign.CampaignType,AccurateType:campaign.AccurateType,
		PricingType:campaign.PricingType, StrategyType:campaign.StrategyType, BudgetType:campaign.BudgetType, Budget:campaign.Budget,
		BidPrice:campaign.BidPrice}
	group := PmpCampaignGroup{Id:campaign.GroupId}
	o.Read(&group)
	v.GroupName = group.Name
	adCat := make([]int, 1)
	adCat = append(adCat, campaign.AdCategory)
	v.AdCategory = adCat
	return v
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
