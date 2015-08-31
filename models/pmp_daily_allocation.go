package models

import (
	"errors"
	"fmt"
	"reflect"
	"strings"
	"time"
	"github.com/astaxie/beego/orm"
)

type PmpDailyAllocation struct {
	Id              int       `orm:"column(id);auto"`
	AdDate          time.Time `orm:"column(ad_date);type(date);null"`
	DemandAdspaceId int       `orm:"column(demand_adspace_id);null"`
	Imp             int       `orm:"column(imp);null"`
	Clk             int       `orm:"column(clk);null"`
	Ctr             float32   `orm:"column(ctr);null"`
	PmpAdspaceId    int       `orm:"column(pmp_adspace_id)"`
}

func (t *PmpDailyAllocation) TableName() string {
	return "pmp_daily_allocation"
}

func init() {
	orm.RegisterModel(new(PmpDailyAllocation))
}

// AddPmpDailyAllocation insert a new PmpDailyAllocation into database and returns
// last inserted Id on success.
func AddPmpDailyAllocation(m *PmpDailyAllocation) (id int64, err error) {
	o := orm.NewOrm()
	id, err = o.Insert(m)
	return
}

// GetPmpDailyAllocationById retrieves PmpDailyAllocation by Id. Returns error if
// Id doesn't exist
func GetPmpDailyAllocationById(id int) (v *PmpDailyAllocation, err error) {
	o := orm.NewOrm()
	v = &PmpDailyAllocation{Id: id}
	if err = o.Read(v); err == nil {
		return v, nil
	}
	return nil, err
}

// GetAllPmpDailyAllocation retrieves all PmpDailyAllocation matches certain condition. Returns empty list if
// no records exist
func GetAllPmpDailyAllocation(query map[string]string, fields []string, sortby []string, order []string,
	offset int64, limit int64) (ml []interface{}, count int64, err error) {
	o := orm.NewOrm()
	qs := o.QueryTable(new(PmpDailyAllocation))
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

	var l []PmpDailyAllocation
	qs = qs.OrderBy(sortFields...)
	count = 0
	if _, err := qs.Limit(limit, offset).All(&l, fields...); err == nil {
		if len(fields) == 0 {
			for _, v := range l {
				ml = append(ml, v)
				count++
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
				count++
			}
		}
		
		return ml, count, nil
	}
	return nil, count, err
}

// UpdatePmpDailyAllocation updates PmpDailyAllocation by Id and returns error if
// the record to be updated doesn't exist
func UpdatePmpDailyAllocationById(m *PmpDailyAllocation) (err error) {
	o := orm.NewOrm()
	v := PmpDailyAllocation{Id: m.Id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Update(m); err == nil {
			fmt.Println("Number of records updated in database:", num)
		}
	}
	return
}

type PmpDailyAllocationVo struct {
	Name string
	DemandAdspaceId int
	AdDate time.Time
	Imp int
	Clk int
	Ctr float32
	Priority int
	DemandAdspaceName string
}

// Query PmpDailyAllocation
func GetPmpDailyAllocationByAdspaceIdAndAdDate(adspaceid int, startdate string, enddate string)[]PmpDailyAllocationVo {
	var querysql string = "select ad.name, ad.demand_adspace_name, ad.demand_adspace_id, ad.priority, da.imp, da.clk, da.ctr, da.ad_date from " +
							"(select matrix.pmp_adspace_id, matrix.demand_id as demand_id, demand.name, demandspace.name as demand_adspace_name, matrix.demand_adspace_id, matrix.priority from pmp_adspace_matrix as matrix inner join pmp_adspace as adspace on matrix.pmp_adspace_id=adspace.id inner join pmp_demand_adspace demandspace on matrix.demand_adspace_id=demandspace.id inner join pmp_demand_platform_desk as demand on demandspace.demand_id=demand.id where adspace.id=?) as ad " +
							"left join " + 
							"(select * from pmp_daily_allocation where ad_date >= STR_TO_DATE(?,'%Y-%m-%d') and ad_date <= STR_TO_DATE(?,'%Y-%m-%d')) as da on ad.demand_adspace_id = da.demand_adspace_id order by ad.demand_adspace_id"
	o := orm.NewOrm()
	var dailyAllocationVos []PmpDailyAllocationVo
	fmt.Println("startdate: ", startdate, " enddate: ", enddate)
	count, err := o.Raw(querysql, adspaceid, startdate, enddate).QueryRows(&dailyAllocationVos)
	if err != nil {
		fmt.Println("SQL Syntax Error or Parameter Error")
		return nil
	} else {
		fmt.Printf("%d rows returned for PmpDailyAllocation\n", count)
	}
	return dailyAllocationVos
}

// Update Imp by DemandAdspaceId and AdDate
func UpdateImpByDemandAdpaceIdAndAdDate(demandadspaceid int, proportion int, datestrs []string, imps []int)(int64, error) {
	fmt.Println(" datestrs: ", datestrs," demandadspaceid: ", demandadspaceid,  " imps: ", imps, " proportion: ", proportion)
	const layout = "2006-1-2"
	o := orm.NewOrm()
	proportionSql := "update pmp_adspace_matrix set priority = ? where demand_adspace_id = ?"
	p, sqlerr := o.Raw("update pmp_daily_allocation set imp=? where demand_adspace_id=? and ad_date=STR_TO_DATE(?,'%Y-%m-%d')").Prepare()	
	defer p.Close()
	if sqlerr != nil {
		fmt.Println("SQL Syntax Error")
		return 0, sqlerr 
	}
	var num int64 = 0
	o.Begin()
	_, err := o.Raw(proportionSql, proportion, demandadspaceid).Exec()
	if err != nil {
		o.Rollback()
		fmt.Println("Update Priority SQL Syntax Error")
		return 0, err 
	} 
	for i := 0; i < 7; i++ {
		if imps[i] == -1 {
			continue
		}
		res, err := p.Exec(imps[i], demandadspaceid, datestrs[i])
		if err != nil {
			o.Rollback()
			fmt.Println("SQL Syntax Error")
			return 0, err 
		} else {
			n, _ := res.RowsAffected()
			if n == 0 {
				// need to insert new record
				d,_ := time.Parse(layout, datestrs[i])
				v, _ := GetPmpAdspaceMatrixByDemandSpaceId(demandadspaceid);
				model := PmpDailyAllocation{DemandAdspaceId:demandadspaceid, PmpAdspaceId:v.PmpAdspaceId, Imp:imps[i], AdDate:d}
				id, err := o.Insert(&model)
				if err == nil {
				    fmt.Println("Insert PmpDailyAllocation:", id)
				} else {
					o.Rollback()
					fmt.Println("Insert Error")
					return 0, err 
				}
			}
			num = num + n
		}
	}	
	o.Commit()
	fmt.Println("Row affected nums: ", num)
	return num, nil
}

// Update daily allocation 
func UpdatePmpDailyAllocationByDemandAdpaceId(demandadspaceid int, addate time.Time, imp int, clk int, ctr float32)(int64, error) {
	var updatesql = "update pmp_daily_allocation set imp=?, clk=?, ctr=? where demand_adspace_id=? and ad_date=?";
	o := orm.NewOrm()
	res, err := o.Raw(updatesql, imp, clk, ctr, demandadspaceid, addate).Exec()
	if err == nil {
	    num, _ := res.RowsAffected()
	    fmt.Println("mysql row affected nums: ", num)
		return num, nil
	} else {
		fmt.Println("SQL Syntax Error")
		return 0, err
	}
}

// DeletePmpDailyAllocation deletes PmpDailyAllocation by Id and returns error if
// the record to be deleted doesn't exist
func DeletePmpDailyAllocation(id int) (err error) {
	o := orm.NewOrm()
	v := PmpDailyAllocation{Id: id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Delete(&PmpDailyAllocation{Id: id}); err == nil {
			fmt.Println("Number of records deleted in database:", num)
		}
	}
	return
}