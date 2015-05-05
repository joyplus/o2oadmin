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
	flg := true
	var apiRequest m.ResturantQueryRequest
	response := new(m.ResMaterialList)
	err := json.Unmarshal(this.Ctx.Input.RequestBody, &apiRequest)
	if err != nil {
		beego.Error(err.Error())
		response.Header.StatusCode = lib.ERROR_JSON_UNMARSHAL_FAILED
		flg = false
	}
	if flg {
		resList, err := m.GetMaterialListByCategory(apiRequest.CategoryKey)
		if err != nil {
			beego.Error(err.Error())
			response.Header.StatusCode = lib.ERROR_MYSQL_QUERY_FAILED
		} else {
			response.Header.StatusCode = lib.STATUS_SUCCESS
			response.ResList = resList
		}

	}

	response.Header.ErrorMsg = GetErrorMsg(response.Header.StatusCode)
	this.Data["json"] = &response
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
	this.ServeJson()
}
