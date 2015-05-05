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

type ResRequestOTP struct {
	Header         ResponseHeader
	SequenceNumber string
}

type ResVerifyOTP struct {
	Header       ResponseHeader
	SecrityToken string
}

type ResLovList struct {
	Header  ResponseHeader
	LovList []*FeLov
}

type ResMaterialList struct {
	Header  ResponseHeader
	ResList []*ResMaterial
}

type ResMaterial struct {
	Name             string
	UnitPrice        float32
	StandardType     string
	StandardTypeName string
	SourceRegionCode string
	SourceRegionName string
	BrandCode        string
	BrandName        string
	RefreshCode      string
	RefreshName      string
	StandardWeight   float32
	LadderCode       string
	LadderName       string
	ShelfLife        int
	PicUrl           string
}
