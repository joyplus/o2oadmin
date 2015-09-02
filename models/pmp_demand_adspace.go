package models

import (
	"errors"
	"fmt"
	"reflect"
	"strings"
	"time"

	"github.com/astaxie/beego/orm"
	"o2oadmin/lib"
)

type PmpDemandAdspace struct {
	Id               int       `orm:"column(id);auto"`
	Name             string    `orm:"column(name);size(255)"`
	Description   	  string    `orm:"column(description);size(500);null"`
	DelFlg           int8      `orm:"column(del_flg);default(0)"`
	CreateUser       int       `orm:"column(create_user);null"`
	CreateTime       time.Time `orm:"column(create_time);type(timestamp);null"`
	UpdateUser       int       `orm:"column(update_user);null"`
	UpdateTime       time.Time `orm:"column(update_time);type(timestamp);null"`
	SecretKey        string    `orm:"column(secret_key);size(50);null"`
	DemandAdspaceKey string    `orm:"column(demand_adspace_key);size(50);not null;unique"`
	DemandId         int       `orm:"column(demand_id)"`
	RealAdspaceKey   string    `orm:"column(real_adspace_key);size(50);not null"`
}

// only contains the columns that need to be displayed in client
type DemandAdspaceVo struct {
	Id int
	Name string
	DemandName string
	DemandId int
	SecretKey string
	RealAdspaceKey string
	Description string
}

func (t *PmpDemandAdspace) TableName() string {
	return "pmp_demand_adspace"
}

func init() {
	orm.RegisterModel(new(PmpDemandAdspace))
}

// AddPmpDemandAdspace insert a new PmpDemandAdspace into database and returns
// last inserted Id on success.
func AddPmpDemandAdspace(m *DemandAdspaceVo) (id int64, err error) {
	o := orm.NewOrm()
	fmt.Println("time string:", time.Now().String())	
	// generate PmpDemandAdspaceKey automatically
	pmpDemandAdspaceKey := lib.GetMd5String(m.RealAdspaceKey + "#" + time.Now().String())
	entity := &PmpDemandAdspace{Name:m.Name, DemandId:m.DemandId, Description:m.Description, SecretKey:m.SecretKey, RealAdspaceKey:m.RealAdspaceKey, DemandAdspaceKey:pmpDemandAdspaceKey}	
	id, err = o.Insert(entity)
	return
}

// update pmp_demand_adspace by DemandAdspaceVo
func UpdatePmpDemandAdspace(m *DemandAdspaceVo) (err error) {
	o := orm.NewOrm()
	tempv := PmpDemandAdspace{Id: m.Id}
    // ascertain id exists in the database
    if err = o.Read(&tempv); err == nil {
        var num int64  
		tempv.Name = m.Name
		tempv.Description = m.Description
		tempv.SecretKey = m.SecretKey      
        if num, err = o.Update(&tempv); err == nil {
            fmt.Println("Number of records updated in database:", num)
        } else {
            return err    
        }
    }   
    return
}

// GetPmpDemandAdspaceById retrieves PmpDemandAdspace by Id. Returns error if
// Id doesn't exist
func GetPmpDemandAdspaceById(id int) (v *PmpDemandAdspace, err error) {
	o := orm.NewOrm()
	v = &PmpDemandAdspace{Id: id}
	if err = o.Read(v); err == nil {
		return v, nil
	}
	return nil, err
}

// GetAllPmpDemandAdspace retrieves all PmpDemandAdspace matches certain condition. Returns empty list if
// no records exist
func GetAllPmpDemandAdspace(query map[string]string, fields []string, sortby []string, order []string,
	offset int64, limit int64) (ml []interface{}, err error) {
	o := orm.NewOrm()
	qs := o.QueryTable(new(PmpDemandAdspace))
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

	var l []PmpDemandAdspace
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

// UpdatePmpDemandAdspace updates PmpDemandAdspace by Id and returns error if
// the record to be updated doesn't exist
func UpdatePmpDemandAdspaceById(m *PmpDemandAdspace) (err error) {
	o := orm.NewOrm()
	v := PmpDemandAdspace{Id: m.Id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Update(m); err == nil {
			fmt.Println("Number of records updated in database:", num)
		}
	}
	return
}

// DeletePmpDemandAdspace deletes PmpDemandAdspace by Id and returns error if
// the record to be deleted doesn't exist
func DeletePmpDemandAdspace(id int) (err error) {
	o := orm.NewOrm()
	v := PmpDemandAdspace{Id: id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		v.DelFlg = 1		
		if num, err = o.Update(&v); err == nil {
			fmt.Println("Number of records deleted in database:", num)
		}
	} else {
		fmt.Println("*** delete pmp_demand_adspace failed.")
	}
	return
}

// get demand adspace list by demand id , may filtered by adspace name
func GetDemandAdspaceListByDemandId(page int64, page_size int64, sort string, demandid int, adspacename string) (adspaceVos []DemandAdspaceVo, count int64) {
	var sql = "SELECT demandadspace.*, demand.name as demand_name, demand.id as demand_id FROM pmp_demand_adspace demandadspace INNER JOIN pmp_demand_platform_desk demand on demandadspace.demand_id = demand.id WHERE demand_id=? AND demandadspace.del_flg != 1 "
	var offset int64
	if page <= 1 {
		offset = 0
	} else {
		offset = (page - 1) * page_size
	}
	o := orm.NewOrm()
	var r orm.RawSeter
	if adspacename == "" {
		if sort == "" {
			sort = "ORDER BY demandadspace.id ASC limit ? offset ?"
		} else {
			sort = "ORDER BY " + sort + " " + "limit ? offset ?"
		}
		sql = sql + sort
		r = o.Raw(sql, demandid, page_size, offset)
	} else {
		sql = sql + "and demandadspace.name like ? "
		if sort == "" {
			sort = "ORDER BY demandadspace.id ASC limit ? offset ?"
		} else {
			sort = "ORDER BY " + sort + " " + "limit ? offset ?"
		}
		sql = sql + sort
		adspacename = "%" + adspacename + "%"
		r = o.Raw(sql, demandid, adspacename, page_size, offset)
	}
	count, err := r.QueryRows(&adspaceVos)
	if err == nil {
		return adspaceVos, count
	} else {
		return nil, 0	
	}
}