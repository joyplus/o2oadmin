package models

//import (
//	"errors"
//	"fmt"
//	"reflect"
//	"strings"
//	"time"

//	"github.com/astaxie/beego/orm"
//)

type ResturantQueryRequest struct {
	Token       string
	CategoryKey string
	LovCode     string
}

type OTPRequest struct {
	MobileNumber string `valid:"Mobile"` // Mobile必须为正确的手机号
	SystemId     string
	FuncName     string
	Device       Device
}

type VerifyOTPRequest struct {
	SequenceNumber string
	OTP            string
	Device         Device
}

type Device struct {
	IMEI      string
	MAC       string
	IDFA      string
	AndroidId string
	OS        string
}
