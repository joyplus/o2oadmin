package models

import (
	"github.com/astaxie/beego/orm"
	//"o2oadmin/lib"
	"time"
)

func GetActiveActivityList() (activityList []*FeActivityMaster, err error) {
	o := orm.NewOrm()
	sql := "select display_text, image_url, landing_url from fe_activity_master where 1=1 "

	currentDate := time.Now().Format("2006-01-02")
	var paramList []interface{}

	sql += " and ? >= start_date"
	paramList = append(paramList, currentDate)

	sql += " and end_date >= ?"
	paramList = append(paramList, currentDate)

	sql += " and activity_status = 'ACT'"

	sql += " order by priority desc limit 3"
	_, err = o.Raw(sql, paramList).QueryRows(&activityList)

	return activityList, err
}
