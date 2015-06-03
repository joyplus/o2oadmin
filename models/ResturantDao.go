package models

import (
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
	"o2oadmin/lib"
	"time"
)

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
	} else if err == nil {
		beego.Debug("Find query header for merchant id:", merchantId)
		_, rstError = o.Update(&queryRequestHeader)
	} else {
		rstError = err
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

	beego.Debug(orderRequest)

	for _, orderDetail := range orderRequest.PlaceOrderDetailList {

		var orderAmount float32
		var transactionHeaderId int64

		transactionHeader := BeTransactionHeader{MerchantId: merchantId}

		transactionHeader.SupplierId = orderDetail.SupplierId
		transactionHeader.ExpectedReceiveTime = orderDetail.ExpectedReceiveTime
		transactionHeader.OrderTime = time.Now()
		transactionHeader.TrasactionStatus = lib.LOV_TRANSACTION_TYPE_START
		transactionHeader.OrderNumber = lib.GenerateOrderNumber(lib.ORDER_TRANSACTION)
		transactionHeaderId, rstError = o.Insert(&transactionHeader)

		if rstError != nil {
			break
		}

		transactionDetailList := orderDetail.TransactionDetailList
		for _, transactionDetail := range transactionDetailList {
			transactionDetail.TransactionId = int(transactionHeaderId)
			fOrderQuality := float32(transactionDetail.OrderQuality)

			orderAmount += fOrderQuality * transactionDetail.UnitPrice
		}

		_, rstError = o.InsertMulti(100, transactionDetailList)

		if rstError != nil {
			break
		}

		transactionHeader.OrderAmount = orderAmount

		_, rstError = o.Update(&transactionHeader)

	}

	if rstError != nil {
		beego.Error(rstError.Error())
		rstError = o.Rollback()
	} else {
		rstError = o.Commit()
	}

	return rstError
}

func UpdateOrder(orderNumber string, transactionStatus string) (rstError error) {
	o := orm.NewOrm()
	rstError = o.Begin()

	transactionHeader := BeTransactionHeader{OrderNumber: orderNumber}

	rstError = o.Read(&transactionHeader, "OrderNumber")

	if rstError == orm.ErrNoRows {
		beego.Debug("No transaction header for order number:", orderNumber)

	} else if rstError == nil {
		beego.Debug("Find transaction header for order number:", orderNumber)
		transactionHeader.TrasactionStatus = transactionStatus
		_, rstError = o.Update(&transactionHeader)
	}

	if rstError != nil {
		beego.Error(rstError.Error())
		rstError = o.Rollback()
	} else {
		rstError = o.Commit()
	}

	return rstError
}

func GetMaterialListByCategory(categoryId int) (resList []*ResMaterial, resError error) {
	o := orm.NewOrm()
	_, resError = o.Raw("select m.id as id, m.name as name,m.description as description,m.standard_type as standard_type,lov.lov_value as standard_type_name,m.pic_url as pic_url from fe_material_master as m left join fe_lov as lov on m.standard_type=lov.lov_key and lov.lov_code='STANDARD_TYPE' WHERE category_id = ?", categoryId).QueryRows(&resList)

	return resList, resError
}

func GetCategoryList(categoryType string) (categoryNodeList []*CategoryNode, err error) {

	o := orm.NewOrm()
	sql := "select id, name, image_url, level, parent_id from fe_category_master order by level, parent_id,priority desc "

	var dataList []FeCategoryMaster
	tmpMap := make(map[int]*CategoryNode)
	_, err = o.Raw(sql).QueryRows(&dataList)

	if err == nil {

		for _, record := range dataList {

			if record.Level == 1 {
				tmpMap[record.Id] = buildCategoryNode(record)
			} else {
				tmpNode, ok := tmpMap[record.ParentId]
				if ok {
					tmpNode.SubCategoryList = append(tmpNode.SubCategoryList, &record)
				} else {
					tmpMap[record.Id] = buildCategoryNode(record)
				}
			}
		}

		for _, value := range tmpMap {
			categoryNodeList = append(categoryNodeList, value)
		}
	}

	return categoryNodeList, err
}

func buildCategoryNode(record FeCategoryMaster) (tmpNode *CategoryNode) {

	tmpNode = new(CategoryNode)
	tmpNode.Id = record.Id
	tmpNode.Name = record.Name
	return tmpNode

}

func GetTransactionList(merchantId int, isOrderFinished bool) (RstList []*TransactionItem, err error) {
	o := orm.NewOrm()

	//Id                   int
	//OrderNumber          string
	//OrderAmount          float32
	//OrderTime            time.Time
	//ActualReceiveTime    time.Time
	//TrasactionStatus     string
	//TrasactionStatusName string
	sql := "select header.id as id, header.order_number as order_number,header.order_amount as order_amount,header.order_time as order_time,header.transaction_status as transaction_status, lov.lov_value as transaction_status_name from be_transaction_header as header left join fe_lov as lov on header.transaction_status=lov.lov_key and lov.lov_code='TRANSACTION_STATUS' where 1=1 "
	var paramList []interface{}
	if merchantId != 0 {
		sql += " and header.merchant_id=?"
		paramList = append(paramList, merchantId)
	}

	if isOrderFinished {
		sql += " and header.transaction_status='006'"
	} else {
		sql += " and header.transaction_status<>'006'"
	}

	sql += " order by order_time desc"
	_, err = o.Raw(sql, paramList).QueryRows(&RstList)

	return RstList, err
}

func GetTransactionDetail(merchantId int, trancactionId int) (RstList []*ResMaterial, err error) {
	o := orm.NewOrm()

	sql := "select m.name as name,m.description as description,m.standard_type as standard_type,lov.lov_value as standard_type_name,m.pic_url as pic_url, detail.unit_price as unit_price, detail.order_quality as order_quality, detail.sub_total as sub_total from be_transaction_detail as detail inner join be_transaction_header as header on detail.transaction_id=header.id inner join fe_material_master as m on detail.material_id = m.id left join fe_lov as lov on m.standard_type=lov.lov_key and lov.lov_code='STANDARD_TYPE' where header.merchant_id=? and header.id=? "
	var paramList []interface{}
	paramList = append(paramList, merchantId)
	paramList = append(paramList, trancactionId)

	sql += " order by detail.id desc"
	_, err = o.Raw(sql, paramList).QueryRows(&RstList)

	return RstList, err
}

func GetRegularMaterialList(merchantId int) (resList []*ResMaterial, resError error) {
	o := orm.NewOrm()
	_, resError = o.Raw("select m.name as name,m.description as description,m.standard_type as standard_type,lov.lov_value as standard_type_name,m.pic_url as pic_url from be_merchant_regular_buy as detail  inner join fe_material_master as m on detail.material_id = m.id left join fe_lov as lov on m.standard_type=lov.lov_key and lov.lov_code='STANDARD_TYPE' where detail.merchant_id=?", merchantId).QueryRows(&resList)

	return resList, resError
}
