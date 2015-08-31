package models

import (
	"errors"
	"fmt"
	"reflect"
	"strings"
	"time"

	"github.com/astaxie/beego/orm"
)

type PmpDemandPlatformDesk struct {
	Id                 int       `orm:"column(id);auto"`
	Name               string    `orm:"column(name);size(255)"`
	RequestUrlTemplate string    `orm:"column(request_url_template);size(500);null"`
	DelFlg             int8      `orm:"column(del_flg);null"`
	CreateUser         int       `orm:"column(create_user);null"`
	CreateTime         time.Time `orm:"column(create_time);type(timestamp);null"`
	UpdateUser         int       `orm:"column(update_user);null"`
	UpdateTime         time.Time `orm:"column(update_time);type(timestamp);null"`
	Timeout            int       `orm:"column(timeout)"`
	InvokeFuncName     string    `orm:"column(invoke_func_name);size(20)"`
}

func (t *PmpDemandPlatformDesk) TableName() string {
	return "pmp_demand_platform_desk"
}

func init() {
	orm.RegisterModel(new(PmpDemandPlatformDesk))
}

// AddPmpDemandPlatformDesk insert a new PmpDemandPlatformDesk into database and returns
// last inserted Id on success.
func AddPmpDemandPlatformDesk(m *PmpDemandPlatformDesk) (id int64, err error) {
	o := orm.NewOrm()
	id, err = o.Insert(m)
	return
}

// GetPmpDemandPlatformDeskById retrieves PmpDemandPlatformDesk by Id. Returns error if
// Id doesn't exist
func GetPmpDemandPlatformDeskById(id int) (v *PmpDemandPlatformDesk, err error) {
	o := orm.NewOrm()
	v = &PmpDemandPlatformDesk{Id: id}
	if err = o.Read(v); err == nil {
		return v, nil
	}
	return nil, err
}

// Get demand list
func GetDemandList(page int64, page_size int64, sort string, name string)(demands []PmpDemandPlatformDesk, count int64){
	var offset int64
	if page <= 1 {
		offset = 0
	} else {
		offset = (page - 1) * page_size
	}
	o := orm.NewOrm()
	var r orm.RawSeter
	sql := "select d.id, d.name, d.request_url_template, d.timeout from pmp_demand_platform_desk d where (d.del_flg is null or d.del_flg != 1) "
	if name == "" && sort == "" {
		sql += "limit ? offset ? "
		r = o.Raw(sql, page_size, offset)	
	} else if name != "" && sort != "" {
		name = "%" + name + "%"
		sql += "and d.name like ? order by " + sort + " " + "limit ? offset ?"
		r = o.Raw(sql, name, page_size, offset)
	} else if sort != "" {
		sql += "order by " + sort + " " + "limit ? offset ?"
		r = o.Raw(sql, page_size, offset)	
	} else if name != "" {
		name = "%" + name + "%"
		sql += "and d.name like ? limit ? offset ?"
		r = o.Raw(sql, name, page_size, offset)
	}
	num, err := r.QueryRows(&demands)
	if err != nil  {
		fmt.Println(err)
		return nil, 0
	}
	fmt.Println("demands nums: ", num)
	return demands, num
}

// GetAllPmpDemandPlatformDesk retrieves all PmpDemandPlatformDesk matches certain condition. Returns empty list if
// no records exist
func GetAllPmpDemandPlatformDesk(query map[string]string, fields []string, sortby []string, order []string,
	offset int64, limit int64) (ml []interface{}, err error) {
	o := orm.NewOrm()
	qs := o.QueryTable(new(PmpDemandPlatformDesk))
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

	var l []PmpDemandPlatformDesk
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

// UpdatePmpDemandPlatformDesk updates PmpDemandPlatformDesk by Id and returns error if
// the record to be updated doesn't exist
func UpdatePmpDemandPlatformDeskById(m *PmpDemandPlatformDesk) (err error) {
	o := orm.NewOrm()
	v := PmpDemandPlatformDesk{Id: m.Id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Update(m); err == nil {
			fmt.Println("Number of records updated in database:", num)
		}
	}
	return
}

// DeletePmpDemandPlatformDesk deletes PmpDemandPlatformDesk by Id and returns error if
// the record to be deleted doesn't exist
func DeletePmpDemandPlatformDesk(id int) (err error) {
	o := orm.NewOrm()
	v := PmpDemandPlatformDesk{Id: id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Delete(&PmpDemandPlatformDesk{Id: id}); err == nil {
			fmt.Println("Number of records deleted in database:", num)
		}
	}
	return
}

type DemandMappingVo struct {
	Id int
	Name string
	MappedAdspaceId int
	MappedAdspaceName string
	Ck int
	DemandName string
	DemandId int
}

// get the all the demands information to map to a specified adspace
func GetDemandsMappingInfo(page int64, page_size int64, sort string, name string, adspaceid int, demandid int)(v []DemandMappingVo, err error) {
	o := orm.NewOrm()
	var offset int64
	if page <= 1 {
		offset = 0
	} else {
		offset = (page - 1) * page_size
	}
	var r orm.RawSeter
	sql := "SELECT demandadspace.id, demandadspace.name, d.name as demand_name, d.id as demand_id, CASE WHEN matrix.mapped_adspace_id IS NOT NULL THEN 1 ELSE 0 END AS ck, matrix.mapped_adspace_id, matrix.mapped_adspace_name FROM pmp_demand_platform_desk d inner join pmp_demand_adspace demandadspace on d.id=demandadspace.demand_id left join (SELECT m.demand_adspace_id, m.pmp_adspace_id as mapped_adspace_id, a.name as mapped_adspace_name, m.demand_id FROM pmp_adspace_matrix m INNER JOIN pmp_adspace a on m.pmp_adspace_id = a.id  WHERE m.pmp_adspace_id=?) as matrix on demandadspace.id = matrix.demand_adspace_id WHERE (d.del_flg is null OR d.del_flg != 1) AND (demandadspace.del_flg is null OR demandadspace.del_flg != 1) "
	if demandid > 0 {
		name = "%" + name + "%"
		sql = sql + "AND d.id=? AND d.name LIKE ?"
		r = o.Raw(sql, adspaceid, demandid, name)		
	} else {
		
		if name == "" && sort == "" {
			if page > 0 {
				sql += "limit ? offset ? "
				r = o.Raw(sql, adspaceid, page_size, offset)
			} else {
				r = o.Raw(sql, adspaceid)
			}
			
		} else if name != "" && sort != "" {
			name = "%" + name + "%"
			if page > 0 {
				sql += "and d.name like ? order by " + sort + " " + "limit ? offset ?"
				r = o.Raw(sql, adspaceid, name, page_size, offset)
			} else {
				sql += "and d.name like ? order by " + sort 
				r = o.Raw(sql, adspaceid, name)
			}
			
		} else if sort != "" {
			if page > 0 {
				sql += "order by " + sort + " " + "limit ? offset ?"
				r = o.Raw(sql, adspaceid, page_size, offset)	
			} else {
				sql += "order by " + sort 
				r = o.Raw(sql, adspaceid)	
			}
			
		} else if name != "" {
			if page > 0 {
				name = "%" + name + "%"
				sql += "and d.name like ? limit ? offset ?"
				r = o.Raw(sql, adspaceid, name, page_size, offset)
			} else {
				name = "%" + name + "%"
				sql += "and d.name like ? "
				r = o.Raw(sql, adspaceid, name)
			}		
		}
	}
	_, err = r.QueryRows(&v)
	if err != nil {
		return nil, err
	}	
	p := PmpAdspace{Id:adspaceid}
	o.Read(&p)
	for index,_ := range v {
		v[index].MappedAdspaceId = p.Id
		v[index].MappedAdspaceName = p.Name
	}
	return v, nil
}