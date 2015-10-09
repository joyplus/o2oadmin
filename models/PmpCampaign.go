package models
import (
    "time"
    "github.com/astaxie/beego/orm"
    "strings"
    "strconv"
)

/**
  groupFields might be:
  1. nil,
  2. ["0"]
  3. ["1"]
  4 ["0", "1"]

  0 表示 PDB广告位
  1 表示 日期
 */
func GetPmpCampaignDailyReport(groupField string, medias []string, startDate time.Time, endDate time.Time, sortby string, order string,
offset int, limit int) (ml []PmpCampaignDailyReportVo, count int, err error) {
    o := orm.NewOrm()
    qb, _ := orm.NewQueryBuilder("mysql")

    selectFields := []string{
        "cdr.ad_date",
        "g.name as group_name",
        "sum(cdr.imp) as imp",
        "sum(cdr.clk) as clk",
        "sum(cdr.ctr) as ctr",
        "sum(cdr.ecpm) as ecpm",
        "sum(cdr.ecpc) as ecpc",
        "sum(cdr.spending) as spending",
        "sum(cdr.cost) as cost",
    }

    if groupField == "0" {
        selectFields = append(selectFields, "cmp.name")
    }

    possibleGroupFields := map[string]string{
        "0":"cmp.id",
        "1":"g.id",
    }

    groupby := "cdr.ad_date"
    groupby += "," + possibleGroupFields[groupField]

    qb.Select(strings.Join(selectFields, ", ")).
    From("pmp_campaign_daily_report cdr").
    InnerJoin("pmp_campaign cmp").On("cdr.campaign_id=cmp.id").
    InnerJoin("pmp_campaign_group g").On("cmp.group_id = g.id")

    qb.Where("1=1")
    //	if medias != nil {
    //		qb.And("pmp_media.id in (" + strings.Join(medias, ",") + ")")
    //	}

    qb.And("cdr.ad_date >= ?")
    qb.And("cdr.ad_date <= ?")

    qb.GroupBy(groupby)


    // order by:
    if sortby != "" {
        qb.OrderBy(sortby)
        if order == "desc"{
            qb.Desc()
        } else {
            qb.Asc()
        }
    }
    // TODO default order by ???


    qbCount, _ := orm.NewQueryBuilder("mysql")
    qbCount.Select("count(*) as cnt").
    From("(" + qb.String() + ") as sub")
    var countResult []orm.Params
    o.Raw(qbCount.String(), startDate, endDate).Values(&countResult)
    count, _ = strconv.Atoi(countResult[0]["cnt"].(string))

    qb.Limit(limit)
    qb.Offset(offset)
    report := []PmpCampaignDailyReportVo{}
    o.Raw(qb.String(), startDate, endDate).QueryRows(&report)

    return report, count, err
}