package models

import (
	"errors"
	"fmt"
	"reflect"
	"strings"

	"github.com/astaxie/beego/orm"
	"strconv"
	"o2oadmin/vo"
)

type LtvFlightGroup struct {
	Id     int     `orm:"column(id);auto"`
	Name   string  `orm:"column(name);size(45)"`
	Budget float32 `orm:"column(budget)"`
}

func (t *LtvFlightGroup) TableName() string {
	return "ltv_flight_group"
}

func init() {
	orm.RegisterModel(new(LtvFlightGroup))
}

// AddLtvFlightGroup insert a new LtvFlightGroup into database and returns
// last inserted Id on success.
func AddLtvFlightGroup(m *LtvFlightGroup) (id int64, err error) {
	o := orm.NewOrm()
	id, err = o.Insert(m)
	return
}

// GetLtvFlightGroupById retrieves LtvFlightGroup by Id. Returns error if
// Id doesn't exist
func GetLtvFlightGroupById(id int) (v *LtvFlightGroup, err error) {
	o := orm.NewOrm()
	v = &LtvFlightGroup{Id: id}
	if err = o.Read(v); err == nil {
		return v, nil
	}
	return nil, err
}

// GetAllLtvFlightGroup retrieves all LtvFlightGroup matches certain condition. Returns empty list if
// no records exist
func GetAllLtvFlightGroup(query map[string]string, fields []string, sortby []string, order []string,
	offset int64, limit int64) (ml []interface{}, err error) {
	o := orm.NewOrm()
	qs := o.QueryTable(new(LtvFlightGroup))
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

	var l []LtvFlightGroup
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

// UpdateLtvFlightGroup updates LtvFlightGroup by Id and returns error if
// the record to be updated doesn't exist
func UpdateLtvFlightGroupById(m *LtvFlightGroup) (err error) {
	o := orm.NewOrm()
	v := LtvFlightGroup{Id: m.Id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Update(m); err == nil {
			fmt.Println("Number of records updated in database:", num)
		}
	}
	return
}

// DeleteLtvFlightGroup deletes LtvFlightGroup by Id and returns error if
// the record to be deleted doesn't exist
func DeleteLtvFlightGroup(id int) (err error) {
	o := orm.NewOrm()
	v := LtvFlightGroup{Id: id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Delete(&LtvFlightGroup{Id: id}); err == nil {
			fmt.Println("Number of records deleted in database:", num)
		}
	}
	return
}


//  ########  below are newly added functions
func GetFlightGroupSummaryList(advertiserId string, flightGroupId string,sortby string, order string,
	offset int, limit int) (result []vo.LtvFlightGroupVO, count int, err error) {

	o := orm.NewOrm()

	selectFields := []string{
		"lg.id as id",
		"lg.name as name",

		"sum(l.budget) as budget",
		"sum(l.spending) as spending",
		"sum(l.cost) as cost",
		"sum(l.imp) as imp",
		"sum(l.clk) as clk",
		"sum(l.install) as install",
		"sum(l.postback_install) as postback_install",
		"sum(l.register) as register",
		"sum(l.submit) as submit",
		"sum(l.conversion) as conversion",
		"sum(l.revenue) as revenue",
		"avg(l.eCPA) as eCPA",

//		"l.del_flg as del_flg",
//		"l.spread_url as spread_url",
//		"l.spread_name as spread_name",
//		"l.ltv_app_id as ltv_app_id",

	}

	qb, _ := orm.NewQueryBuilder("mysql")

	qb.Select(strings.Join(selectFields, ", ")).
	From("ltv_flight l").
	InnerJoin("ltv_flight_group lg").
	Where("1=1").
    And("del_flg = 0").
	GroupBy("group_id")

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
	o.Raw(qbCount.String()).Values(&countResult)
	count, _ = strconv.Atoi(countResult[0]["cnt"].(string))

	qb.Limit(limit).Offset(offset)

	report := []vo.LtvFlightGroupVO{}

	_, err = o.Raw(qb.String()).QueryRows(&report)
	return report, count, err
}

