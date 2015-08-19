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

type PmpDailyRequestReport struct {
	Id           int       `orm:"column(id);auto"`
	AdDate       time.Time `orm:"column(ad_date);type(date);null"`
	PmpAdspaceId int       `orm:"column(pmp_adspace_id);null"`
	ReqSuccess   int       `orm:"column(req_success);null"`
	ReqNoad      int       `orm:"column(req_noad);null"`
	ReqError     int       `orm:"column(req_error);null"`
	FillRate     float32   `orm:"column(fill_rate);null"`

//	PmpAdspace	 *PmpAdspace	`orm:"rel(fk);column(pmp_adspace_id)"`

//	PdbMediaName string		`orm:"-"`
//	PdbAdspaceName string	`orm:"-"`
//	ReqAll		   int	`orm:"-"`
}

func (t *PmpDailyRequestReport) TableName() string {
	return "pmp_daily_request_report"
}

func init() {
	orm.RegisterModel(new(PmpDailyRequestReport))
}

// AddPmpDailyRequestReport insert a new PmpDailyRequestReport into database and returns
// last inserted Id on success.
func AddPmpDailyRequestReport(m *PmpDailyRequestReport) (id int64, err error) {
	o := orm.NewOrm()
	id, err = o.Insert(m)
	return
}

// GetPmpDailyRequestReportById retrieves PmpDailyRequestReport by Id. Returns error if
// Id doesn't exist
func GetPmpDailyRequestReportById(id int) (v *PmpDailyRequestReport, err error) {
	o := orm.NewOrm()
	v = &PmpDailyRequestReport{Id: id}
	if err = o.Read(v); err == nil {
		return v, nil
	}
	return nil, err
}

// GetAllPmpDailyRequestReport retrieves all PmpDailyRequestReport matches certain condition. Returns empty list if
// no records exist
func GetAllPmpDailyRequestReport(query map[string]string, fields []string, sortby []string, order []string,
	offset int64, limit int64) (ml []interface{}, count int64, err error) {
	o := orm.NewOrm()
	qs := o.QueryTable(new(PmpDailyRequestReport))
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
					return nil, 0, errors.New("Error: Invalid order. Must be either [asc|desc]")
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
					return nil, 0, errors.New("Error: Invalid order. Must be either [asc|desc]")
				}
				sortFields = append(sortFields, orderby)
			}
		} else if len(sortby) != len(order) && len(order) != 1 {
			return nil, 0, errors.New("Error: 'sortby', 'order' sizes mismatch or 'order' size is not 1")
		}
	} else {
		if len(order) != 0 {
			return nil, 0, errors.New("Error: unused 'order' fields")
		}
	}

	var l []PmpDailyRequestReport
	qs = qs.OrderBy(sortFields...)
	count, err = qs.RelatedSel().Count()
	if _, err := qs.Limit(limit, offset).RelatedSel().All(&l, fields...); err == nil {
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
		return ml, count, nil
	}
	return nil, 0, err
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
func GetGroupedPmpDailyRequestReport(groupFields []string, medias []string, startDate time.Time, endDate time.Time, sortby string, order string,
	offset int, limit int) (ml []PdbMediaReportVo, count int, err error) {
	o := orm.NewOrm()
	qb, _ := orm.NewQueryBuilder("mysql")

	selectFields := []string{
		"pmp_adspace.id as pmp_adspace_id",
		"pmp_adspace.name as pmp_adspace_name",
		"ad_date",
		"pmp_media.id as pmp_media_id",
		"pmp_media.name as pmp_media_name",
		"sum(pmp_daily_request_report.req_success) as req_success",
		"sum(pmp_daily_request_report.req_noad) as req_noad",
		"sum(pmp_daily_request_report.req_error) as req_error"}

	possibleGroupFields := map[string]string{"0":"pmp_adspace.id", "1":"pmp_daily_request_report.ad_date"}

	groupby := "pmp_media.id"
	if groupFields != nil && len(groupFields) > 0 {
		for _, fldIdx := range groupFields {
			groupby += "," + possibleGroupFields[fldIdx]
		}
	}
	qb.Select(strings.Join(selectFields, ", ")).
	From("pmp_daily_request_report").
	InnerJoin("pmp_adspace").On("pmp_daily_request_report.pmp_adspace_id=pmp_adspace.id").
	InnerJoin("pmp_media").On("pmp_adspace.media_id=pmp_media.id")

	qb.Where("1=1")
	if medias != nil {
		qb.And("pmp_media.id in (" + strings.Join(medias, ",") + ")")
	}

	qb.And("pmp_daily_request_report.ad_date >= ?")
	qb.And("pmp_daily_request_report.ad_date <= ?")

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
	report := []PdbMediaReportVo{}
	o.Raw(qb.String(), startDate, endDate).QueryRows(&report)

	return report, count, err
}

// UpdatePmpDailyRequestReport updates PmpDailyRequestReport by Id and returns error if
// the record to be updated doesn't exist
func UpdatePmpDailyRequestReportById(m *PmpDailyRequestReport) (err error) {
	o := orm.NewOrm()
	v := PmpDailyRequestReport{Id: m.Id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Update(m); err == nil {
			fmt.Println("Number of records updated in database:", num)
		}
	}
	return
}

// DeletePmpDailyRequestReport deletes PmpDailyRequestReport by Id and returns error if
// the record to be deleted doesn't exist
func DeletePmpDailyRequestReport(id int) (err error) {
	o := orm.NewOrm()
	v := PmpDailyRequestReport{Id: id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Delete(&PmpDailyRequestReport{Id: id}); err == nil {
			fmt.Println("Number of records deleted in database:", num)
		}
	}
	return
}
