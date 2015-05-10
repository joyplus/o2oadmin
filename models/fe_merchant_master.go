package models

import (
	"errors"
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
	"reflect"
	"strings"
	"time"
)

type FeMerchantMaster struct {
	Id           int64     `orm:"column(id);auto"`
	Name         string    `orm:"column(name);size(45)"`
	MerchantType string    `orm:"column(merchant_type);size(3)"`
	Delflg       int8      `orm:"column(delflg);null"`
	CreateUser   int       `orm:"column(create_user);null"`
	UpdateUser   int       `orm:"column(update_user);null"`
	CreateTime   time.Time `orm:"column(create_time);type(timestamp);null"`
	UpdateTime   time.Time `orm:"column(update_time);type(timestamp);null"`
	Description  string    `orm:"column(description);size(2000);null"`
	ScaleType    string    `orm:"column(scale_type);size(3);null"`
	Address      string    `orm:"column(address);size(500);null"`
	Income       float32   `orm:"column(income);null"`
	Outcome      float32   `orm:"column(outcome);null"`
}

func init() {
	orm.RegisterModel(new(FeMerchantMaster))
}

// AddFeMerchantMaster insert a new FeMerchantMaster into database and returns
// last inserted Id on success.
func AddFeMerchantMaster(m *FeMerchantMaster) (id int64, err error) {
	o := orm.NewOrm()
	id, err = o.Insert(m)
	return
}

// GetFeMerchantMasterById retrieves FeMerchantMaster by Id. Returns error if
// Id doesn't exist
func GetFeMerchantMasterById(id int64) (v *FeMerchantMaster, err error) {
	o := orm.NewOrm()
	v = &FeMerchantMaster{Id: id}
	if err = o.Read(v); err == nil {
		return v, nil
	}
	return nil, err
}

// GetAllFeMerchantMaster retrieves all FeMerchantMaster matches certain condition. Returns empty list if
// no records exist
func GetAllFeMerchantMaster(query map[string]string, fields []string, sortby []string, order []string,
	offset int64, limit int64) (ml []interface{}, err error) {
	o := orm.NewOrm()
	qs := o.QueryTable(new(FeMerchantMaster))
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

	var l []FeMerchantMaster
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

// UpdateFeMerchantMaster updates FeMerchantMaster by Id and returns error if
// the record to be updated doesn't exist
func UpdateFeMerchantMasterById(m *FeMerchantMaster) (int64, error) {

	o := orm.NewOrm()
	merchant := make(orm.Params)
	if len(m.Name) > 0 {
		merchant["Name"] = m.Name
	}

	if len(merchant) == 0 {
		return 0, errors.New("update field is empty")
	}
	var table FeMerchantMaster
	num, err := o.QueryTable(table).Filter("Id", m.Id).Update(merchant)
	return num, err
}

// DeleteFeMerchantMaster deletes FeMerchantMaster by Id and returns error if
// the record to be deleted doesn't exist
func DeleteFeMerchantMaster(id int64) (int64, error) {
	o := orm.NewOrm()
	status, err := o.Delete(&FeMerchantMaster{Id: id})
	return status, err
}

func GetMerchantlist(page int64, page_size int64, sort string) (merchants []orm.Params, count int64) {
	beego.Debug("Enter Merchant Model.")
	o := orm.NewOrm()
	merchant := new(FeMerchantMaster)
	qs := o.QueryTable(merchant)
	var offset int64
	if page <= 1 {
		offset = 0
	} else {
		offset = (page - 1) * page_size
	}
	qs.Limit(page_size, offset).OrderBy(sort).Values(&merchants)
	count, _ = qs.Count()
	beego.Debug(merchants)
	return merchants, count
}

func GetSupplierListByMerchantId(merchantId int, priority int, distance int, onTimeRate float64) (RstList []*SupplierDetail, err error) {
	o := orm.NewOrm()
	var supplierList []*SupplierDetail
	sql := "select category_key, supplier_id, name as supplier_name,address,distance,on_time_rate,rating from fe_merchant_supplier_matrix as matrix left join fe_supplier_master as supplier on matrix.supplier_id= supplier.id where 1=1 "
	var paramList []interface{}
	if merchantId != 0 {
		sql += " and matrix.merchant_id=?"
		paramList = append(paramList, merchantId)
	}
	if priority != 0 {
		sql += " and priority>=?"
		paramList = append(paramList, priority)
	}

	if distance != 0 {
		sql += " and distance<?"
		paramList = append(paramList, distance)
	}

	if onTimeRate != 0 {
		sql += " and onTimeRate>?"
		paramList = append(paramList, onTimeRate)
	}

	sql += " order by matrix.category_key,matrix.distance"
	_, err = o.Raw(sql, paramList).QueryRows(&supplierList)

	return supplierList, err
}

func QueryPrice(merchantId int, queryRequest PriceQueryRequest) (rstError error) {
	o := orm.NewOrm()
	rstError = o.Begin()

	beego.Debug(queryRequest)
	queryRequestHeader := BeMerchantQueryRequestHeader{MerchantId: merchantId}
	//queryRequestHeader.MerchantId = merchantId
	queryRequestHeader.RequestDate = time.Now().Format("2006-01-02")
	queryRequestHeader.RequestDatetime = time.Now()
	queryRequestHeader.PaymentDuration = queryRequest.PaymentDuration
	queryRequestHeader.RequestDeliveryTimeStart = queryRequest.RequestDeliveryTimeStart
	queryRequestHeader.RequestDeliveryTimeEnd = queryRequest.RequestDeliveryTimeEnd

	var requestHeaderId int64
	//三个返回参数依次为：是否新创建的，对象Id值，错误
	//if created, id, err := o.ReadOrCreate(&queryRequestHeader, "MerchantId", "RequestDate"); err == nil {
	//	if created {
	//		beego.Debug("New Insert an query header Id:", id)
	//	} else {
	//		beego.Debug("Updae query header Id:", id)
	//	}
	//	rstError = err
	//	requestHeaderId = id
	//}
	err := o.Read(&queryRequestHeader, "MerchantId", "RequestDate")
	if err == orm.ErrNoRows {
		beego.Debug("No query header for merchant id:", merchantId)
		requestHeaderId, rstError = o.Insert(&queryRequestHeader)
	} else {
		beego.Debug("Find query header for merchant id:", merchantId)
		_, rstError = o.Update(&queryRequestHeader)
	}

	//if err == orm.ErrNoRows {
	//	fmt.Println("查询不到")
	//} else if err == orm.ErrMissPK {
	//	fmt.Println("找不到主键")
	//} else {
	//	requestHeaderId = int64(queryRequestHeader.Id)
	//}

	if rstError == nil {
		for _, queryDetail := range queryRequest.MaterialList {
			queryDetail.HeaderId = int(requestHeaderId)
			if created, id, err := o.ReadOrCreate(queryDetail, "HeaderId", "MaterialId"); err == nil {
				if created {
					beego.Debug("New Insert an query detail Id:", id)
				} else {
					beego.Debug("Updae query detail Id:", id)
				}
			} else {
				rstError = err
				break
			}
		}
		//_, err = o.InsertMulti(100, queryRequest.MaterialList)
	}

	if rstError == nil {

		for _, supplierCategory := range queryRequest.SupplierCategoryList {

			resposneHeader := BeMerchantQueryResponseHeader{RequestId: int(requestHeaderId)}
			resposneHeader.SupplierId = supplierCategory.SupplierId
			resposneHeader.CategoryKey = supplierCategory.CategoryKey
			if created, id, err := o.ReadOrCreate(&resposneHeader, "RequestId", "SupplierId", "CategoryKey"); err == nil {
				if created {
					beego.Debug("New Insert an query response header Id:", id)
				} else {
					beego.Debug("Updae query response header Id:", id)
				}
			} else {
				rstError = err
				break
			}

		}
		//_, err = o.InsertMulti(100, responseHeaderList)
	}

	if rstError != nil {
		beego.Error(rstError.Error())
		rstError = o.Rollback()
	} else {
		rstError = o.Commit()
	}

	return rstError
}

func GetRequestOrderList(merchantId int) (RstList []*RequestOrder, err error) {
	o := orm.NewOrm()
	var requestOrderList []*RequestOrder
	sql := "select request_date from be_merchant_query_request_header as request where 1=1 "
	var paramList []interface{}
	if merchantId != 0 {
		sql += " and request.merchant_id=?"
		paramList = append(paramList, merchantId)
	}

	sql += " order by request.request_date"
	_, err = o.Raw(sql, paramList).QueryRows(&requestOrderList)

	return requestOrderList, err
}

func PlaceOrder(merchantId int, orderRequest PlaceOrderRequest) (rstError error) {
	o := orm.NewOrm()
	rstError = o.Begin()

	if rstError != nil {
		beego.Error(rstError.Error())
		rstError = o.Rollback()
	} else {
		rstError = o.Commit()
	}

	return rstError
}
