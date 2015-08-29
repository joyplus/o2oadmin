package models

import (
	"errors"
	"fmt"
	"reflect"
	"strings"

	"github.com/astaxie/beego/orm"
)

type PmpAdspaceMatrix struct {
	Id              int `orm:"column(id);auto"`
	PmpAdspaceId    int `orm:"column(pmp_adspace_id)"`
	DemandId        int `orm:"column(demand_id);null"`
	DemandAdspaceId int `orm:"column(demand_adspace_id);null"`
	Priority        int `orm:"column(priority);null"`
}

func (t *PmpAdspaceMatrix) TableName() string {
	return "pmp_adspace_matrix"
}

func init() {
	orm.RegisterModel(new(PmpAdspaceMatrix))
}

// AddPmpAdspaceMatrix insert a new PmpAdspaceMatrix into database and returns
// last inserted Id on success.
func AddPmpAdspaceMatrix(m *PmpAdspaceMatrix) (id int64, err error) {
	o := orm.NewOrm()
	id, err = o.Insert(m)
	return
}

// GetPmpAdspaceMatrixById retrieves PmpAdspaceMatrix by Id. Returns error if
// Id doesn't exist
func GetPmpAdspaceMatrixById(id int) (v *PmpAdspaceMatrix, err error) {
	o := orm.NewOrm()
	v = &PmpAdspaceMatrix{Id: id}
	if err = o.Read(v); err == nil {
		return v, nil
	}
	return nil, err
}

// Get PmpAdspaceMatrix by demand id and adspace id
func GetPmpAdspaceMatrixByDemandIdAndAdspaceId(demandid int, adspaceid int) (v *PmpAdspaceMatrix, err error) {
	sql := "SELECT * FROM pmp_adspace_matrix m WHERE m.demand_id = ? and m.pmp_adspace_id = ?"
	o := orm.NewOrm()
	err = o.Raw(sql, demandid, adspaceid).QueryRow(v)
	if err == nil {
		return v, nil
	}
	fmt.Println(err)
	return nil, err
}

// Retrieves PmpAdspaceMatrix by PmpDemandSpaceId. Returns error if pmpDemandSpaceId doesn't exist
func GetPmpAdspaceMatrixByDemandSpaceId(pmpDemandSpaceId int) (v *PmpAdspaceMatrix, err error) {
	querysql := "SELECT * FROM pmp_adspace_matrix where demand_adspace_id=?"
	o := orm.NewOrm()
	v = &PmpAdspaceMatrix{}
	err = o.Raw(querysql, pmpDemandSpaceId).QueryRow(v)
	if err == nil {
		return v, nil
	}
	fmt.Println(err)
	return nil, err
}

// GetAllPmpAdspaceMatrix retrieves all PmpAdspaceMatrix matches certain condition. Returns empty list if
// no records exist
func GetAllPmpAdspaceMatrix(query map[string]string, fields []string, sortby []string, order []string,
	offset int64, limit int64) (ml []interface{}, err error) {
	o := orm.NewOrm()
	qs := o.QueryTable(new(PmpAdspaceMatrix))
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

	var l []PmpAdspaceMatrix
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

// UpdatePmpAdspaceMatrix updates PmpAdspaceMatrix by Id and returns error if
// the record to be updated doesn't exist
func UpdatePmpAdspaceMatrixById(m *PmpAdspaceMatrix) (err error) {
	o := orm.NewOrm()
	v := PmpAdspaceMatrix{Id: m.Id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Update(m); err == nil {
			fmt.Println("Number of records updated in database:", num)
		}
	}
	return
}

// DeletePmpAdspaceMatrix deletes PmpAdspaceMatrix by Id and returns error if
// the record to be deleted doesn't exist
func DeletePmpAdspaceMatrix(id int) (err error) {
	o := orm.NewOrm()
	v := PmpAdspaceMatrix{Id: id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Delete(&PmpAdspaceMatrix{Id: id}); err == nil {
			fmt.Println("Number of records deleted in database:", num)
		}
	}
	return
}

// delete demand adspace mapping information by adspace id and demand id
func DeletePmpAdspaceMatrixByAdspaceIdAndDemandId(demandid int, adspaceid int) (err error) {
	o := orm.NewOrm()
	sql := "DELETE FROM pmp_adspace_matrix WHERE demand_id = ? and pmp_adspace_id = ?"
	_, err = o.Raw(sql, demandid, adspaceid).Exec()
	return err
}

// update demand & adspace maps
func UpdateAdspaceMatrix(v []DemandMappingVo) (err error) {
	o := orm.NewOrm()
	o.Begin()
	for _, vo := range v {
		if vo.Ck == 0 {
			sql := "DELETE FROM pmp_adspace_matrix WHERE demand_adspace_id=? AND pmp_adspace_id = ? "
			_, err = o.Raw(sql, vo.Id, vo.MappedAdspaceId).Exec()
			if err != nil {
				o.Rollback()
				return err
			}
		} else {
			sql := "SELECT * FROM pmp_adspace_matrix WHERE demand_adspace_id = ? and pmp_adspace_id = ?"
			var matrix orm.Params
			o.Raw(sql, vo.Id, vo.MappedAdspaceId).QueryRow(&matrix)
			if matrix == nil {
				m := PmpAdspaceMatrix{PmpAdspaceId:vo.MappedAdspaceId, DemandId: vo.DemandId, DemandAdspaceId:vo.Id}
				fmt.Println("-------", m)
				_, err = o.Insert(&m)
				if err != nil {
					o.Rollback()
					return err
				}
			}
		}
	}
	o.Commit()
	return nil
}