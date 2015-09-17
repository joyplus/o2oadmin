package models

import (
	"errors"
	"fmt"
	"reflect"
	"strings"
	"strconv"
	"time"

	"github.com/astaxie/beego/orm"
	"o2oadmin/lib"
)

type PmpAdspace struct {
	Id            int       `orm:"column(id);auto"`
	Name          string    `orm:"column(name);size(255)"`
	Description   string    `orm:"column(description);size(500);null"`
	DelFlg        int8      `orm:"column(del_flg);default(0)"`
	CreateUser    int       `orm:"column(create_user);null"`
	CreateTime    time.Time `orm:"column(create_time);type(timestamp);null"`
	UpdateUser    int       `orm:"column(update_user);null"`
	UpdateTime    time.Time `orm:"column(update_time);type(timestamp);null"`
	PmpAdspaceKey string    `orm:"column(pmp_adspace_key);size(50);null"`
	SecretKey     string    `orm:"column(secret_key);size(50);null"`
	MediaId		  int        `orm:"column(media_id);null"`
	EstDailyImp   int       `orm:"column(est_daily_imp);null"`
	EstDailyClk   int       `orm:"column(est_daily_clk);null"`
	EstDailyCtr   float32   `orm:"column(est_daily_ctr);null"`
	Status        int       `orm:"default(1)" form:"Status" valid:"Range(1,2)"`
	CreativeType  int       `orm:"default(1)" form:"CreativeType" valid:"Range(1,2)"`
}

func (t *PmpAdspace) TableName() string {
	return "pmp_adspace"
}

func init() {
	orm.RegisterModel(new(PmpAdspace))
}

// AddPmpAdspace insert a new PmpAdspace into database and returns
// last inserted Id on success.
func AddPmpAdspace(m *PmpAdspace) (id int64, err error) {
	o := orm.NewOrm()
	id, err = o.Insert(m)
	if err == nil {
		// generate PmpAdspaceKey automatically
		pmpAdspaceKey := lib.GetMd5String(strconv.Itoa(int(id)) + "#" + m.Name)
		o.Read(m)
		m.PmpAdspaceKey = pmpAdspaceKey
		_, err = o.Update(m)
	}
	return
}

// add a new PmpAdspace and create the adsapce and demand mapping at the sametime
func AddPmpAdspaceAndMapDemand(v *AdspaceVo) (id int64, err error) {
    o := orm.NewOrm()
    o.Begin()
    adspaceV := PmpAdspace{Name:v.Name, Description:v.Description, PmpAdspaceKey:v.PmpAdspaceKey, SecretKey:v.SecretKey, MediaId:v.MediaId}
    id, err = o.Insert(&adspaceV)
    if err != nil {
        o.Rollback()
        return -1, err
    }
	// generate PmpAdspaceKey automatically
	pmpAdspaceKey := lib.GetMd5String(strconv.Itoa(int(id)) + "#" + v.Name);
	var m *PmpAdspace = &PmpAdspace{}
	m.Id = int(id)
	o.Read(m)
	m.PmpAdspaceKey = pmpAdspaceKey
	_, err = o.Update(m)
	if err != nil {
        o.Rollback()
        return -1, err
    }
	sql := "SELECT id FROM pmp_demand_adspace WHERE demand_id = ? order by id desc limit 1"
	var maps []orm.Params
	_, err = o.Raw(sql, v.DemandId).Values(&maps)
	if err != nil {
        o.Rollback()
        return -1, err
    }
	var daid int
	if idv, ok := maps[0]["id"].(string); ok {	
		daid,_ = strconv.Atoi(idv)		
	}
    matrix := PmpAdspaceMatrix{PmpAdspaceId:int(id), DemandId:v.DemandId, DemandAdspaceId:daid}
    id, err = o.Insert(&matrix)
    if err != nil {
        o.Rollback()
        return -1, err
    }
    o.Commit()
    return id, nil
}

// update PmpAdspace
func UpdatePmpAdspaceAndMatrix(v *AdspaceVo) (err error) {
    o := orm.NewOrm()
    tempv := PmpAdspace{Id: v.Id}
    adspaceV := PmpAdspace{Id:v.Id, Name:v.Name, Description:v.Description, PmpAdspaceKey:v.PmpAdspaceKey, SecretKey:v.SecretKey, MediaId:v.MediaId}
    // ascertain id exists in the database
    if err = o.Read(&tempv); err == nil {
        var num int64        
        if num, err = o.Update(&adspaceV); err == nil {
            fmt.Println("Number of records updated in database:", num)
        } else {
            return err    
        }
    }   
    return
}

// GetPmpAdspaceById retrieves PmpAdspace by Id. Returns error if
// Id doesn't exist
func GetPmpAdspaceById(id int) (v *PmpAdspace, err error) {
	o := orm.NewOrm()
	v = &PmpAdspace{Id: id}
	if err = o.Read(v); err == nil {
		return v, nil
	}
	return nil, err
}

// only contains the columns that need to be displayed in client
type AdspaceVo struct {
	Id int
	Name string
	MediaName string
	EstDaily string
	DemandName string
	DemandId int
	MediaId	int
	SecretKey string
	PmpAdspaceKey string
	Description string
}

// get adspace list, may filtered by adspace name
func GetAdspaceList(page int64, page_size int64, sort string, mediaid int, adspacename string) (adspaceVos []AdspaceVo, count int64) {
	var offset int64
	if page <= 1 {
		offset = 0
	} else {
		offset = (page - 1) * page_size
	}
	var maps []orm.Params
	o := orm.NewOrm()
	var r orm.RawSeter
	var query string = "SELECT a.id, a.name, a.media_id, a.description, a.pmp_adspace_key, m.name as media, a.est_daily_imp, a.est_daily_clk, a.est_daily_ctr FROM pmp_adspace a, pmp_media m WHERE a.media_id = m.id AND a.del_flg != 1 "
	var adspacenamecon string = "%" + adspacename + "%"
    if mediaid == -1 && adspacename == "" {		
		query = query + "ORDER BY a.id ASC limit ? offset ?"
		r = o.Raw(query, page_size, offset)
	} else if mediaid != -1 && adspacename != "" {
		query = query + "AND m.id=? AND a.name like ? ORDER BY a.id ASC limit ? offset ?"
		r = o.Raw(query, mediaid, adspacenamecon, page_size, offset)
	} else if mediaid != -1 {
		query = query + "AND m.id=? ORDER BY a.id ASC limit ? offset ?"
		r = o.Raw(query, mediaid, page_size, offset)
	} else {
		query = query + "AND a.name like ? ORDER BY a.id ASC limit ? offset ?"
		r = o.Raw(query, adspacenamecon, page_size, offset)
	}
	num, err := r.Values(&maps)
	if err == nil {
	    fmt.Println("adspace nums: ", num)
		
	} else {
		fmt.Println(err)
		return nil, 0
	}
	
	if maps == nil || len(maps) == 0 {
		fmt.Println("query return with no rows. ")
		return nil, 0
	}
	fmt.Println(maps)
	var impstr,clkstr,ctrstr,descstr string
	var idint,mediaidint int	
	var namestr, mediastr,pmpAdspaceKeystr string
	for index := 0; index < len(maps); index++ {
		imp := maps[index]["est_daily_imp"]
		clk := maps[index]["est_daily_clk"]
		ctr := maps[index]["est_daily_ctr"]
		
		if impv, ok := imp.(string); ok {
			impstr = impv
		}
		if clkv, ok := clk.(string); ok {
			clkstr = clkv
		}
		if ctrv, ok := ctr.(string); ok {
			ctrstr = ctrv
		}
		
		est := impstr + "," + clkstr + "," + ctrstr
//		fmt.Println("**********" + est + "**********")
	
		if idv, ok := maps[index]["id"].(string); ok {
			idint,_ = strconv.Atoi(idv)
		} 
		
		if idv, ok := maps[index]["media_id"].(string); ok {
			mediaidint,_ = strconv.Atoi(idv)
		} 	
			
		if namev, ok := maps[index]["name"].(string); ok {
			namestr = namev
		}
		if mediav, ok := maps[index]["media"].(string); ok {
			mediastr = mediav
		}
		if descv, ok := maps[index]["description"].(string); ok {
			descstr = descv
		}
		if v, ok := maps[index]["pmp_adspace_key"].(string); ok {
			pmpAdspaceKeystr = v
		}
		
		adspaceVos = append(adspaceVos, AdspaceVo{Id:idint, Name:namestr, MediaName:mediastr, EstDaily:est, MediaId:mediaidint, Description:descstr, PmpAdspaceKey:pmpAdspaceKeystr})
	}

	return adspaceVos, int64(len(adspaceVos))
}

// GetAllPmpAdspace retrieves all PmpAdspace matches certain condition. Returns empty list if
// no records exist
func GetAllPmpAdspace(query map[string]string, fields []string, sortby []string, order []string,
	offset int64, limit int64) (ml []interface{}, err error) {
	o := orm.NewOrm()
	qs := o.QueryTable(new(PmpAdspace))
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

	var l []PmpAdspace
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

// UpdatePmpAdspace updates PmpAdspace by Id and returns error if
// the record to be updated doesn't exist
func UpdatePmpAdspaceById(m *PmpAdspace) (err error) {
	o := orm.NewOrm()
	v := PmpAdspace{Id: m.Id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Update(m); err == nil {
			fmt.Println("Number of records updated in database:", num)
		}
	}
	return
}

// only update mediaid, name and description
func UpdatePmpAdspace(m *PmpAdspace) (err error) {
	o := orm.NewOrm()
	v := PmpAdspace{Id: m.Id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		v.MediaId = m.MediaId
		v.Name = m.Name
		v.Description = m.Description
		if num, err = o.Update(&v); err == nil {
			fmt.Println("Number of records updated in database:", num)
		}
	}
	return
}

// DeletePmpAdspace deletes PmpAdspace by Id and returns error if
// the record to be deleted doesn't exist
func DeletePmpAdspace(id int) (err error) {
	o := orm.NewOrm()
	o.Begin()
	sql := "DELETE FROM pmp_adspace_matrix WHERE pmp_adspace_id=? "
	_, err = o.Raw(sql, id).Exec()
	if err != nil {
		o.Rollback()
		return err	
	}
	sql = "UPDATE pmp_adspace SET del_flg=1 WHERE id = ? "
	_, err = o.Raw(sql, id).Exec()
	if err != nil {
		o.Rollback()
		return err	
	}
	o.Commit()
	return nil
}
