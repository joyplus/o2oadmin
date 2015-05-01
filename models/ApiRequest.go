package models

//import (
//	"errors"
//	"fmt"
//	"reflect"
//	"strings"
//	"time"

//	"github.com/astaxie/beego/orm"
//)

type OTPRequest struct {
	MobileNumber string
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
