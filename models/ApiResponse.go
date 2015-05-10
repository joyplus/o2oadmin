package models

//import (
//	"errors"
//	"fmt"
//	"reflect"
//	"strings"
//	"time"

//	"github.com/astaxie/beego/orm"
//)

type ResponseHeader struct {
	StatusCode string
	ErrorMsg   string
}

type BaseResponse struct {
	Header ResponseHeader
}

type ResRequestOTP struct {
	BaseResponse
	SequenceNumber string
}

type ResVerifyOTP struct {
	BaseResponse
	SecrityToken string
}

type ResLovList struct {
	BaseResponse
	LovList []*FeLov
}

type ResMaterialList struct {
	BaseResponse
	ResList []*ResMaterial
}

type ResMaterial struct {
	Name             string
	UnitPrice        float64
	StandardType     string
	StandardTypeName string
	SourceRegionCode string
	SourceRegionName string
	BrandCode        string
	BrandName        string
	RefreshCode      string
	RefreshName      string
	StandardWeight   float64
	LadderCode       string
	LadderName       string
	ShelfLife        int
	PicUrl           string
}

type ResSupplierList struct {
	BaseResponse
	RstMap map[string][]*SupplierDetail
}

type SupplierDetail struct {
	CategoryKey  string
	SupplierId   string
	SupplierName string
	Address      string
	Distance     int
	OnTimeRate   float64
	Rating       int
}

type ResRequestOrderList struct {
	BaseResponse
	RequestOrderList []*RequestOrder
}

type RequestOrder struct {
	RequestDate               string
	NumberOfSuppliers         int
	NumberOfResponseSuppliers int
}
