package models

import (
	"errors"
	"fmt"
	"reflect"
	"strings"
	"time"

	"github.com/astaxie/beego/orm"
	"strconv"
)

type PmpDemandDailyReport struct {
	Id              int       `orm:"column(id);auto"`
	DemandAdspaceId int       `orm:"column(demand_adspace_id);null"`
	AdDate          time.Time `orm:"column(ad_date);type(date);null"`
	ReqSuccess      int       `orm:"column(req_success);null"`
	ReqTimeout      int       `orm:"column(req_timeout);null"`
	ReqNoad         int       `orm:"column(req_noad);null"`
	ReqError        int       `orm:"column(req_error);null"`
}

func (t *PmpDemandDailyReport) TableName() string {
	return "pmp_demand_daily_report"
}

func init() {
	orm.RegisterModel(new(PmpDemandDailyReport))
}

// AddPmpDemandDailyReport insert a new PmpDemandDailyReport into database and returns
// last inserted Id on success.
func AddPmpDemandDailyReport(m *PmpDemandDailyReport) (id int64, err error) {
	o := orm.NewOrm()
	id, err = o.Insert(m)
	return
}

// GetPmpDemandDailyReportById retrieves PmpDemandDailyReport by Id. Returns error if
// Id doesn't exist
func GetPmpDemandDailyReportById(id int) (v *PmpDemandDailyReport, err error) {
	o := orm.NewOrm()
	v = &PmpDemandDailyReport{Id: id}
	if err = o.Read(v); err == nil {
		return v, nil
	}
	return nil, err
}

// GetAllPmpDemandDailyReport retrieves all PmpDemandDailyReport matches certain condition. Returns empty list if
// no records exist
func GetAllPmpDemandDailyReport(query map[string]string, fields []string, sortby []string, order []string,
	offset int64, limit int64) (ml []interface{}, err error) {
	o := orm.NewOrm()
	qs := o.QueryTable(new(PmpDemandDailyReport))
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

	var l []PmpDemandDailyReport
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


/**
  groupFields might be:
  1. nil,
  2. ["0"]
  3. ["1"]
  4 ["0", "1"]

  0 表示 PDB广告位
  1 表示 日期
 */
func GetGroupedPmpDemandDailyReport(groupFields []string, medias []string, startDate time.Time, endDate time.Time, sortby string, order string,
offset int, limit int) (ml []PdbDemandReportVo, count int, err error) {
	o := orm.NewOrm()
	qb, _ := orm.NewQueryBuilder("mysql")

	selectFields := []string{
		"ddr.ad_date",
		"pda.demand_id as demand_id",
		"dpd.name as demand_name",
		"pda.id as demand_adspace_id",
		"pda.name as demand_adspace_name",
		"pmp_media.id as pmp_media_id",
		"pmp_media.name as pmp_media_name",
		"pmp_adspace.id as pmp_adspace_id",
		"pmp_adspace.name as pmp_adspace_name",
		"sum(ddr.req_success) as req_success",
		"sum(ddr.req_noad) as req_noad",
		"sum(ddr.req_timeout) as req_timeout",
		"sum(ddr.req_error) as req_error",
		"sum(pdr.imp) as imp",
		"sum(pdr.clk) as clk",
	}

	possibleGroupFields := map[string]string{
		"0":"pda.demand_id",
		"1":"pda.id",
		"2":"pmp_media.id",
		"3":"pmp_adspace.id",
	}

	groupby := "ddr.ad_date"
	if groupFields != nil && len(groupFields) > 0 {
		for _, fldIdx := range groupFields {
			groupby += "," + possibleGroupFields[fldIdx]
		}
	}
	qb.Select(strings.Join(selectFields, ", ")).
	From("pmp_demand_daily_report ddr").
	InnerJoin("pmp_daily_report pdr").On("ddr.demand_adspace_id=pdr.demand_adspace_id").
	InnerJoin("pmp_adspace").On("pdr.pmp_adspace_id=pmp_adspace.id").
	InnerJoin("pmp_media").On("pmp_adspace.media_id=pmp_media.id").
	InnerJoin("pmp_demand_adspace pda").On("pda.id=ddr.demand_adspace_id").
	InnerJoin("pmp_demand_platform_desk dpd").On("pda.demand_id=dpd.id")

	qb.Where("1=1")
//	if medias != nil {
//		qb.And("pmp_media.id in (" + strings.Join(medias, ",") + ")")
//	}

	qb.And("ddr.ad_date >= ?")
	qb.And("ddr.ad_date <= ?")

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
	report := []PdbDemandReportVo{}
	o.Raw(qb.String(), startDate, endDate).QueryRows(&report)

	return report, count, err
}


// UpdatePmpDemandDailyReport updates PmpDemandDailyReport by Id and returns error if
// the record to be updated doesn't exist
func UpdatePmpDemandDailyReportById(m *PmpDemandDailyReport) (err error) {
	o := orm.NewOrm()
	v := PmpDemandDailyReport{Id: m.Id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Update(m); err == nil {
			fmt.Println("Number of records updated in database:", num)
		}
	}
	return
}

// DeletePmpDemandDailyReport deletes PmpDemandDailyReport by Id and returns error if
// the record to be deleted doesn't exist
func DeletePmpDemandDailyReport(id int) (err error) {
	o := orm.NewOrm()
	v := PmpDemandDailyReport{Id: id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Delete(&PmpDemandDailyReport{Id: id}); err == nil {
			fmt.Println("Number of records deleted in database:", num)
		}
	}
	return
}
