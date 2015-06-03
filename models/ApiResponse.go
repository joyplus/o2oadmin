package models

import (
	"time"
)

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
	MerchantId   int
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
	Id               int
	Name             string
	Description      string
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
	OrderQuality     int
	SubTotal         float32
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

type ResActivityList struct {
	BaseResponse
	ResList []*FeActivityMaster
}

type ResCategoryList struct {
	BaseResponse
	ResList []*CategoryNode
}

type CategoryNode struct {
	Id              int
	Name            string
	SubCategoryList []*FeCategoryMaster
}

type ResTransactionList struct {
	BaseResponse
	ResList []*TransactionItem
}

type TransactionItem struct {
	Id                   int
	OrderNumber          string
	OrderAmount          float32
	OrderTime            time.Time
	ActualReceiveTime    time.Time
	TrasactionStatus     string
	TrasactionStatusName string
}

type ResTransactionDetail struct {
	BaseResponse
	ResList []*ResMaterial
}
