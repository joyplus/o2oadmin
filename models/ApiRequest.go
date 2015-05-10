package models

//import (
//	"time"
//)

type BaseRequest struct {
	Token  string
	Device Device
}

type SupplierCategory struct {
	SupplierId  int
	CategoryKey string
}

type PlaceOrderRequest struct {
	BaseRequest
	TransactionType string
	ReqMap          map[string][]*PlaceOrderDetail
}

type PlaceOrderDetail struct {
	SupplierId  int
	MaterialIds []int
}

type PriceQueryRequest struct {
	BaseRequest
	PaymentDuration          int
	RequestDeliveryTimeStart string
	RequestDeliveryTimeEnd   string
	MaterialList             []*BeMerchantQueryRequestDetail
	SupplierCategoryList     []*SupplierCategory
	Remark                   string
}

type ResturantQueryRequest struct {
	BaseRequest
	CategoryKey      string
	LovCode          string
	Distance         int
	OnTimeRate       float64
	SupplierPriority int
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
