package models
import "time"

type PdbMediaReportVo struct {
	PmpAdspaceId		string		`orm:"column(pmp_adspace_id);"`
	PdbAdspaceName 		string		`orm:"column(pmp_adspace_name);"`
	AdDate 				time.Time	`orm:"column(ad_date);type(datetime);"`
	PmpMediaId			string		`orm:"column(pmp_media_id);"`
	PdbMediaName		string		`orm:"column(pmp_media_name);"`
	ReqSuccess 			int			`orm:"column(req_success);"`
	ReqNoad				int			`orm:"column(req_noad);"`
	ReqError 			int			`orm:"column(req_error);"`

	ReqAll		 		int			`orm:"-"`
	FillRate			float32		`orm:"-"`
}

type DspReportItem struct {
	Date 					time.Time
	DspName					string
	DspAdSpace 				string
	PdbMedia 				string
	PdbAdSpace 				string
	RequestCount 			int
	countRequestCountValid 	int
	Rate					float32
	ErrorCount				int
	RequestCountTimeout		int
	ImplCount				int
}


