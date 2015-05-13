package controllers

import (
	"encoding/json"
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/validation"
	"o2oadmin/lib"
	m "o2oadmin/models"
	"strings"
)

type CustomerController struct {
	ApiBaseController
}

//API Request OTP
func (this *CustomerController) RequestOTP() {

	flg := true
	var apiRequest m.OTPRequest
	response := new(m.ResRequestOTP)
	err := json.Unmarshal(this.Ctx.Input.RequestBody, &apiRequest)
	if err != nil {
		beego.Error(err.Error())
		response.Header.StatusCode = lib.ERROR_JSON_UNMARSHAL_FAILED
		flg = false
	}

	if flg {
		valid := validation.Validation{}
		valid.Mobile(apiRequest.MobileNumber, "mobile")
		if valid.HasErrors() {
			response.Header.StatusCode = lib.BIZ_WRONG_MOBILE_NUMBER
			flg = false
		}
	}

	if flg {
		response.Header.StatusCode = lib.STATUS_SUCCESS
		otp := lib.GenerateOTP()
		response.SequenceNumber = lib.GenerateSequenceNumberForOTP(otp)

		beego.Debug(response.SequenceNumber + ":" + otp)

		redisx.Put("OTP_SEQ_"+response.SequenceNumber, otp, 300)
		redisx.Put("OTP_MOBILE_"+response.SequenceNumber, apiRequest.MobileNumber, 300)
		go sendOTPSMS(apiRequest.MobileNumber, otp)
	}

	response.Header.ErrorMsg = GetErrorMsg(response.Header.StatusCode)
	this.Data["json"] = &response
	this.ServeJson()

}

//API Request OTP
func (this *CustomerController) VerifyOTP() {
	var apiRequest m.VerifyOTPRequest
	response := new(m.ResVerifyOTP)
	err := json.Unmarshal(this.Ctx.Input.RequestBody, &apiRequest)
	if err != nil {
		beego.Error(err.Error())
		response.Header.StatusCode = lib.ERROR_JSON_UNMARSHAL_FAILED
	} else {

		tmpOtp := GetCacheData("OTP_SEQ_" + apiRequest.SequenceNumber)

		if strings.EqualFold(tmpOtp, apiRequest.OTP) {

			mobileNumber := GetCacheData("OTP_MOBILE_" + apiRequest.SequenceNumber)
			oldToken, newToken, err := m.VerifyMerchantUserByMobile(mobileNumber)
			if err == nil {
				response.Header.StatusCode = lib.STATUS_SUCCESS
				DeleteCacheData(oldToken)
				response.MerchantId = GetMerchantId(newToken)
				response.SecrityToken = newToken

			} else {
				beego.Error(err.Error())
				response.Header.StatusCode = lib.ERROR_MYSQL_QUERY_FAILED
			}

		} else {
			response.Header.StatusCode = lib.BIZ_OTP_VERIFIED_FAILED

		}
	}
	response.Header.ErrorMsg = GetErrorMsg(response.Header.StatusCode)
	this.Data["json"] = &response
	this.ServeJson()

}

func sendOTPSMS(sendToMobile string, otp string) {
	err := SendTemplateSMS(sendToMobile, []string{otp, "10"}, "1")
	if err != nil {
		beego.Error(err.Error())
	}
}
