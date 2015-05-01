package controllers

import (
	"github.com/astaxie/beego"
	"o2oadmin/lib"
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
	redisx = lib.NewRedisxCache()
	err := redisx.StartAndGC(`{"conn":":6379"}`)
	if err != nil {
		panic(err)
	}

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
	v := redisx.Get(key)
	switch t := v.(type) {
	case string:
		return t
	case []byte:
		return string(t)
	default:
		return t.(string)
	}
}
