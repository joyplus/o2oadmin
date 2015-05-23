package models

import (
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
	"o2oadmin/lib"
)

func VerifyMerchantUserByMobile(mobileNumber string) (oldToken string, newToken string, err error) {
	o := orm.NewOrm()
	mixuser := FeMixUser{MobileNumber: mobileNumber}
	err = o.Read(&mixuser, "MobileNumber")
	newToken = lib.GenerateSecurityToken(mobileNumber)
	if err == orm.ErrNoRows {
		beego.Debug("No mix user for mobile number:", mobileNumber)
		mixuser.Token = newToken
		_, err = o.Insert(&mixuser)
	} else if err == nil {
		beego.Debug("Find mix user for mobile number:", mobileNumber)
		oldToken = mixuser.Token
		mixuser.Token = newToken
		_, err = o.Update(&mixuser)
	}

	return oldToken, newToken, err
}

func GetMixUserByToken(token string, mixType string) (mixUserMatrix *FeMixUserMatrix, err error) {
	o := orm.NewOrm()
	mixuser := FeMixUser{Token: token}
	err = o.Read(&mixuser, "Token")

	if err == orm.ErrNoRows {
		beego.Debug("No mix user for token:", token)

	} else if err == nil {
		beego.Debug("Find mix user for token:", token)
		mixUserMatrix = new(FeMixUserMatrix)
		mixUserMatrix.UserId = mixuser.Id
		mixUserMatrix.MixType = mixType
		mixUserMatrix.DefaultFlg = 1
		err = o.Read(mixUserMatrix, "UserId", "MixType", "DefaultFlg")
	}

	return mixUserMatrix, err
}
