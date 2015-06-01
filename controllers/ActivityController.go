package controllers

import (
	//"encoding/json"
	"github.com/astaxie/beego"
	//"github.com/astaxie/beego/validation"
	"o2oadmin/lib"
	m "o2oadmin/models"
	//"strings"
)

type ActivityController struct {
	ApiBaseController
}

func (this *ActivityController) GetActiveActivityList() {

	response := new(m.ResActivityList)
	resList, err := m.GetActiveActivityList()
	if err != nil {
		beego.Error(err.Error())
		response.Header.StatusCode = lib.ERROR_MYSQL_QUERY_FAILED
	} else {
		response.Header.StatusCode = lib.STATUS_SUCCESS
		response.ResList = resList
	}

	response.Header.ErrorMsg = GetErrorMsg(response.Header.StatusCode)
	this.Data["json"] = &response
	this.SetupResponseHeader()
	this.ServeJson()
}
