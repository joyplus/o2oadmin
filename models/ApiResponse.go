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
	StatusCode  string
	ErrorString string
}

type ResRequestOTP struct {
	Header         ResponseHeader
	SequenceNumber string
}

type ResVerifyOTP struct {
	Header       ResponseHeader
	SecrityToken string
}
