package controllers

import (
	"encoding/json"
	"github.com/astaxie/beego"
	//"github.com/astaxie/beego/validation"
	"o2oadmin/lib"
	m "o2oadmin/models"
	//"strings"
)

type ResturantController struct {
	ApiBaseController
}

func (this *ResturantController) GetMaterialListByCategory() {

	var merchantId int
	flg := true
	var apiRequest m.ResturantQueryRequest
	response := new(m.ResMaterialList)
	err := json.Unmarshal(this.Ctx.Input.RequestBody, &apiRequest)
	if err != nil {
		beego.Error(err.Error())
		response.Header.StatusCode = lib.ERROR_JSON_UNMARSHAL_FAILED
		flg = false
	}

	//input validation

	if flg {
		merchantId = GetMerchantId(apiRequest.Token)
		if merchantId == 0 {
			response.Header.StatusCode = lib.ERROR_TOKEN_NOT_VERIFIED
			flg = false
		}
	}
	if flg {
		rstList, err := m.GetMaterialListByCategory(apiRequest.CategoryId)
		if err != nil {
			beego.Error(err.Error())
			response.Header.StatusCode = lib.ERROR_MYSQL_QUERY_FAILED
		} else {
			if len(rstList) > 0 {
				response.Header.StatusCode = lib.STATUS_SUCCESS
				response.ResList = rstList
			} else {
				response.Header.StatusCode = lib.BIZ_NO_RECORD
			}
		}

	}

	response.Header.ErrorMsg = GetErrorMsg(response.Header.StatusCode)
	this.Data["json"] = &response
	this.SetupResponseHeader()
	this.ServeJson()
}

func (this *ResturantController) GetLovList() {

	flg := true
	var apiRequest m.ResturantQueryRequest
	response := new(m.ResLovList)
	err := json.Unmarshal(this.Ctx.Input.RequestBody, &apiRequest)
	if err != nil {
		beego.Error(err.Error())
		response.Header.StatusCode = lib.ERROR_JSON_UNMARSHAL_FAILED
		flg = false
	}

	//input validation
	if flg {
		if len(apiRequest.LovCode) == 0 {
			response.Header.StatusCode = lib.BIZ_REQUIRED_LOVCODE
			flg = false
		}
	}

	if flg {
		lovList, err := m.GetFeLovsByKey(apiRequest.LovCode)

		if err != nil {
			beego.Error(err.Error())
			response.Header.StatusCode = lib.ERROR_MYSQL_QUERY_FAILED
		} else if len(lovList) == 0 {
			response.Header.StatusCode = lib.ERROR_NO_LOV_DATA
		} else {
			response.Header.StatusCode = lib.STATUS_SUCCESS
			response.LovList = lovList
		}
	}

	response.Header.ErrorMsg = GetErrorMsg(response.Header.StatusCode)
	this.Data["json"] = &response
	this.SetupResponseHeader()
	this.ServeJson()
}

func (this *ResturantController) GetSupplierList() {
	flg := true
	var apiRequest m.ResturantQueryRequest
	response := new(m.ResSupplierList)
	err := json.Unmarshal(this.Ctx.Input.RequestBody, &apiRequest)
	if err != nil {
		beego.Error(err.Error())
		response.Header.StatusCode = lib.ERROR_JSON_UNMARSHAL_FAILED
		flg = false
	}

	//input validation
	var merchantId int
	if flg {
		merchantId = GetMerchantId(apiRequest.Token)
		if merchantId == 0 {
			response.Header.StatusCode = lib.ERROR_TOKEN_NOT_VERIFIED
			flg = false
		}
	}
	if flg {
		supplierPriority := apiRequest.SupplierPriority

		if supplierPriority == 0 {
			supplierPriority = lib.SUPPLIER_READY
		}

		supplierDetailList, err := m.GetSupplierListByMerchantId(merchantId, supplierPriority, apiRequest.Distance, apiRequest.OnTimeRate)
		rstMap := make(map[string][]*m.SupplierDetail)

		if err != nil {
			beego.Error(err.Error())
			response.Header.StatusCode = lib.ERROR_MYSQL_QUERY_FAILED
		} else {
			var tmpList []*m.SupplierDetail

			response.Header.StatusCode = lib.STATUS_SUCCESS
			for _, supplierDetail := range supplierDetailList {
				beego.Debug(supplierDetail)
				tmpList = rstMap[supplierDetail.CategoryKey]
				if tmpList != nil {
					tmpList = append(tmpList, supplierDetail)
				} else {
					tmpList = []*m.SupplierDetail{supplierDetail}
					rstMap[supplierDetail.CategoryKey] = tmpList
				}
			}
			response.RstMap = rstMap

		}

	}

	response.Header.ErrorMsg = GetErrorMsg(response.Header.StatusCode)
	this.Data["json"] = &response
	this.SetupResponseHeader()
	this.ServeJson()
}

//商户提交报价单
func (this *ResturantController) QueryPrice() {
	flg := true
	var apiRequest m.PriceQueryRequest
	response := new(m.BaseResponse)
	err := json.Unmarshal(this.Ctx.Input.RequestBody, &apiRequest)
	if err != nil {
		beego.Error(err.Error())
		response.Header.StatusCode = lib.ERROR_JSON_UNMARSHAL_FAILED
		flg = false
	}

	//input validation
	var merchantId int
	if flg {
		merchantId = GetMerchantId(apiRequest.Token)
		if merchantId == 0 {
			response.Header.StatusCode = lib.ERROR_TOKEN_NOT_VERIFIED
			flg = false
		}
	}

	if flg {
		err := m.QueryPrice(merchantId, apiRequest)
		if err != nil {
			beego.Error(err.Error())
			response.Header.StatusCode = lib.ERROR_MYSQL_QUERY_FAILED
		} else {
			response.Header.StatusCode = lib.STATUS_SUCCESS
		}
	}

	response.Header.ErrorMsg = GetErrorMsg(response.Header.StatusCode)
	this.Data["json"] = &response
	this.SetupResponseHeader()
	this.ServeJson()
}

func (this *ResturantController) GetRequestOrderList() {
	flg := true
	var apiRequest m.BaseRequest
	response := new(m.ResRequestOrderList)
	err := json.Unmarshal(this.Ctx.Input.RequestBody, &apiRequest)
	if err != nil {
		beego.Error(err.Error())
		response.Header.StatusCode = lib.ERROR_JSON_UNMARSHAL_FAILED
		flg = false
	}

	//input validation
	var merchantId int
	if flg {
		merchantId = GetMerchantId(apiRequest.Token)
		if merchantId == 0 {
			response.Header.StatusCode = lib.ERROR_TOKEN_NOT_VERIFIED
			flg = false
		}
	}
	if flg {
		requestOrderList, err := m.GetRequestOrderList(merchantId)

		if err != nil {
			beego.Error(err.Error())
			response.Header.StatusCode = lib.ERROR_MYSQL_QUERY_FAILED
		} else {
			response.Header.StatusCode = lib.STATUS_SUCCESS
			response.RequestOrderList = requestOrderList

		}

	}

	response.Header.ErrorMsg = GetErrorMsg(response.Header.StatusCode)
	this.Data["json"] = &response
	this.SetupResponseHeader()
	this.ServeJson()
}

//下单/试送
func (this *ResturantController) PlaceOrder() {
	flg := true
	var apiRequest m.PlaceOrderRequest
	response := new(m.BaseResponse)
	err := json.Unmarshal(this.Ctx.Input.RequestBody, &apiRequest)
	if err != nil {
		beego.Error(err.Error())
		response.Header.StatusCode = lib.ERROR_JSON_UNMARSHAL_FAILED
		flg = false
	}

	//input validation
	var merchantId int
	if flg {
		merchantId = GetMerchantId(apiRequest.Token)
		if merchantId == 0 {
			response.Header.StatusCode = lib.ERROR_TOKEN_NOT_VERIFIED
			flg = false
		}
	}

	if flg {
		err := m.PlaceOrder(merchantId, apiRequest)
		if err != nil {
			beego.Error(err.Error())
			response.Header.StatusCode = lib.ERROR_MYSQL_QUERY_FAILED
		} else {
			response.Header.StatusCode = lib.STATUS_SUCCESS
		}
	}

	response.Header.ErrorMsg = GetErrorMsg(response.Header.StatusCode)
	this.Data["json"] = &response
	this.SetupResponseHeader()
	this.ServeJson()
}

//下单/试送
func (this *ResturantController) CancelOrder() {
	flg := true
	var apiRequest m.UpdateOrderRequest
	response := new(m.BaseResponse)
	err := json.Unmarshal(this.Ctx.Input.RequestBody, &apiRequest)
	if err != nil {
		beego.Error(err.Error())
		response.Header.StatusCode = lib.ERROR_JSON_UNMARSHAL_FAILED
		flg = false
	}

	//input validation
	var merchantId int
	if flg {
		merchantId = GetMerchantId(apiRequest.Token)
		if merchantId == 0 {
			response.Header.StatusCode = lib.ERROR_TOKEN_NOT_VERIFIED
			flg = false
		}
	}

	if flg {
		err := m.UpdateOrder(apiRequest.OrderNumber, lib.LOV_TRANSACTION_TYPE_CANCEL)
		if err != nil {
			beego.Error(err.Error())
			response.Header.StatusCode = lib.ERROR_MYSQL_QUERY_FAILED
		} else {
			response.Header.StatusCode = lib.STATUS_SUCCESS
		}
	}

	response.Header.ErrorMsg = GetErrorMsg(response.Header.StatusCode)
	this.Data["json"] = &response
	this.SetupResponseHeader()
	this.ServeJson()
}

func (this *ResturantController) GetCategoryList() {

	response := new(m.ResCategoryList)
	rstList, err := m.GetCategoryList("")
	if err != nil {
		beego.Error(err.Error())
		response.Header.StatusCode = lib.ERROR_MYSQL_QUERY_FAILED
	} else {
		if len(rstList) > 0 {
			response.Header.StatusCode = lib.STATUS_SUCCESS
			response.ResList = rstList
		} else {
			response.Header.StatusCode = lib.BIZ_NO_RECORD
		}
	}

	response.Header.ErrorMsg = GetErrorMsg(response.Header.StatusCode)
	this.Data["json"] = &response
	this.SetupResponseHeader()
	this.ServeJson()
}

func (this *ResturantController) GetTransactionList() {
	flg := true
	var apiRequest m.ResturantQueryRequest
	response := new(m.ResTransactionList)
	err := json.Unmarshal(this.Ctx.Input.RequestBody, &apiRequest)
	if err != nil {
		beego.Error(err.Error())
		response.Header.StatusCode = lib.ERROR_JSON_UNMARSHAL_FAILED
		flg = false
	}

	//input validation
	var merchantId int
	if flg {
		merchantId = GetMerchantId(apiRequest.Token)
		if merchantId == 0 {
			response.Header.StatusCode = lib.ERROR_TOKEN_NOT_VERIFIED
			flg = false
		}
	}
	if flg {
		rstList, err := m.GetTransactionList(merchantId, apiRequest.IsOrderFinished)

		if err != nil {
			beego.Error(err.Error())
			response.Header.StatusCode = lib.ERROR_MYSQL_QUERY_FAILED
		} else {
			if len(rstList) > 0 {
				response.Header.StatusCode = lib.STATUS_SUCCESS
				response.ResList = rstList
			} else {
				response.Header.StatusCode = lib.BIZ_NO_RECORD
			}

		}

	}

	response.Header.ErrorMsg = GetErrorMsg(response.Header.StatusCode)
	this.Data["json"] = &response
	this.SetupResponseHeader()
	this.ServeJson()
}

func (this *ResturantController) GetTransactionDetail() {
	flg := true
	var apiRequest m.ResturantQueryRequest
	response := new(m.ResTransactionDetail)
	err := json.Unmarshal(this.Ctx.Input.RequestBody, &apiRequest)
	if err != nil {
		beego.Error(err.Error())
		response.Header.StatusCode = lib.ERROR_JSON_UNMARSHAL_FAILED
		flg = false
	}

	//input validation
	var merchantId int
	if flg {
		merchantId = GetMerchantId(apiRequest.Token)
		if merchantId == 0 {
			response.Header.StatusCode = lib.ERROR_TOKEN_NOT_VERIFIED
			flg = false
		}
	}

	if apiRequest.TransactionId == 0 {
		response.Header.StatusCode = lib.BIZ_REQUIRED_TRANSACTIONID
		flg = false
	}

	if flg {
		rstList, err := m.GetTransactionDetail(merchantId, apiRequest.TransactionId)

		if err != nil {
			beego.Error(err.Error())
			response.Header.StatusCode = lib.ERROR_MYSQL_QUERY_FAILED
		} else {
			if len(rstList) > 0 {
				response.Header.StatusCode = lib.STATUS_SUCCESS
				response.ResList = rstList
			} else {
				response.Header.StatusCode = lib.BIZ_NO_RECORD
			}

		}

	}

	response.Header.ErrorMsg = GetErrorMsg(response.Header.StatusCode)
	this.Data["json"] = &response
	this.SetupResponseHeader()
	this.ServeJson()
}

func (this *ResturantController) GetRegularMaterialList() {
	flg := true
	var apiRequest m.BaseRequest
	response := new(m.ResMaterialList)
	err := json.Unmarshal(this.Ctx.Input.RequestBody, &apiRequest)
	if err != nil {
		beego.Error(err.Error())
		response.Header.StatusCode = lib.ERROR_JSON_UNMARSHAL_FAILED
		flg = false
	}

	//input validation
	var merchantId int
	if flg {
		merchantId = GetMerchantId(apiRequest.Token)
		if merchantId == 0 {
			response.Header.StatusCode = lib.ERROR_TOKEN_NOT_VERIFIED
			flg = false
		}
	}

	if flg {
		rstList, err := m.GetRegularMaterialList(merchantId)

		if err != nil {
			beego.Error(err.Error())
			response.Header.StatusCode = lib.ERROR_MYSQL_QUERY_FAILED
		} else {
			if len(rstList) > 0 {
				response.Header.StatusCode = lib.STATUS_SUCCESS
				response.ResList = rstList
			} else {
				response.Header.StatusCode = lib.BIZ_NO_RECORD
			}
		}

	}

	response.Header.ErrorMsg = GetErrorMsg(response.Header.StatusCode)
	this.Data["json"] = &response
	this.SetupResponseHeader()
	this.ServeJson()
}
