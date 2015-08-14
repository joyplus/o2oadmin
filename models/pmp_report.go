package models
import "time"

type PdbMediaReportVo struct {
	Id					string
	PdbMediaName		string
	PdbAdspaceName 		string
	AdDate 				time.Time
	ReqAll		 		int
	ReqError 			int
	ReqSuccess 			int
	FillRate			float32
}

type DspReportItem struct {
	Date 				time.Time
	DspName				string
	DspAdSpace 			string
	PdbMedia 			string
	PdbAdSpace 			string
	RequestCount 		int
	RequestCountValid 	int
	Rate				float32
	ErrorCount			int
	RequestCountTimeout	int
	ImplCount			int
}


