package controllers

import (
	"encoding/json"
	"fmt"
	"github.com/astaxie/beego"
	"o2oadmin/lib"
	m "o2oadmin/models"
	"strings"
)

type ApiBaseController struct {
	beego.Controller
}

var (
	redisx     *lib.RedisxCache
	serverInfo *lib.ServerInfo
)

func init() {
	//redisx = lib.NewRedisxCache()
	//err := redisx.StartAndGC(`{"conn":":6379"}`)
	//if err != nil {
	//	panic(err)
	//}

	//configure yuntongxun
	serverInfo = new(lib.ServerInfo)
	//主帐号
	serverInfo.AccountSid = beego.AppConfig.String("yuntongxun::account_sid")
	//主帐号Token
	serverInfo.AccountToken = beego.AppConfig.String("yuntongxun::account_token")

	//应用Id
	serverInfo.AppId = beego.AppConfig.String("yuntongxun::app_id")

	//请求地址，格式如下，不需要写https://
	serverInfo.ServerIP = beego.AppConfig.String("yuntongxun::server_ip")

	//请求端口
	serverInfo.ServerPort = beego.AppConfig.String("yuntongxun::server_port")

	//REST版本号
	serverInfo.SoftVersion = beego.AppConfig.String("yuntongxun::soft_version")
}

func SendTemplateSMS(to string, datas []string, tempId string) (resError error) {
	result, err := lib.SendTemplateSMS(to, datas, tempId, serverInfo)
	if err != nil {
		beego.Error(err.Error())
		resError = &lib.SysError{lib.ERROR_SEND_SMS_FAILED, "Failed to send sms.", err}
	} else {
		statusCode := result["statusCode"].(string)
		if !strings.EqualFold(statusCode, "000000") {
			resError = &lib.BizError{lib.BIZ_SEND_SMS_FAILED, result["statusMsg"].(string), err}
		}
	}
	return resError
}

func GetCacheData(key string) string {
	if redisx == nil {
		return ""
	}
	v := redisx.Get(key)
	if v != nil {
		switch t := v.(type) {
		case string:
			return t
		case []byte:
			return string(t)
		default:
			return t.(string)
		}
	} else {
		return ""
	}
}

func DeleteCacheData(key string) {
	if redisx != nil {
		redisx.Delete(key)
	}
}

func GetErrorMsg(statusCode string) string {
	if statusCode == "000000" {
		return ""
	} else if strings.HasPrefix(statusCode, "2") {
		return lib.Messages[statusCode]
	} else {
		return fmt.Sprintf("服务异常(%s)", statusCode)
	}

}

func GetMerchantId(token string) int {
	merchantId := lib.ConvertStrToInt(GetCacheData("MERCHANT_ID_" + token))
	if merchantId > 0 {
		return merchantId
	}
	mixUserMatrix, err := m.GetMixUserByToken(token, lib.LOV_MERCHANT_KEY_RET)
	if err != nil {
		return 0
	} else {
		SetupCacheUserData(mixUserMatrix, token)
		return mixUserMatrix.MixId
	}

}

func GetUserId(token string) int {
	userId := lib.ConvertStrToInt(GetCacheData("USER_ID_" + token))
	if userId > 0 {
		return userId
	}
	mixUserMatrix, err := m.GetMixUserByToken(token, lib.LOV_MERCHANT_KEY_RET)
	if err != nil {
		return 0
	} else {
		SetupCacheUserData(mixUserMatrix, token)
		return mixUserMatrix.UserId
	}
}

func SetupCacheUserData(mixUserMatrix *m.FeMixUserMatrix, token string) {

	newUserData := m.UserData{UserId: mixUserMatrix.UserId}
	newUserData.DefaultMixId = mixUserMatrix.MixId
	newUserData.MixType = mixUserMatrix.MixType

	if redisx != nil {
		redisx.Put("MERCHANT_ID_"+token, newUserData.DefaultMixId, 86400)
		redisx.Put("USER_ID_"+token, newUserData.UserId, 86400)
	}

}

func GetCacheUserData(token string) (userData *m.UserData) {

	if redisx == nil {
		return nil
	}
	v := redisx.Get("USERDATA_" + token)

	if v != nil {

		bJson, err := lib.GetBytes(v)
		if err != nil {
			beego.Error(err.Error())
			return nil
		}

		beego.Debug("Get cache user data:" + string(bJson))

		err = json.Unmarshal(bJson, &userData)
		if err != nil {
			beego.Error(err.Error())
			return nil
		}

	}

	return userData
}

//func (this *ApiBaseController) ServeJson() {
//	this.Ctx.Output.Header("Access-Control-Allow-Origin", "*")
//	beego.Controller.ServeJson()
//}

func (this *ApiBaseController) SetupResponseHeader() {
	this.Ctx.Output.Header("Access-Control-Allow-Origin", "*")
}
