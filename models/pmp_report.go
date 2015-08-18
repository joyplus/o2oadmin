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

type DspReportVo struct {
	AdDate 				time.Time	`orm:"column(ad_date);type(datetime);"`
	DspId				string		`orm:"column(demand_adspace_id);"`
	DspName				string		`orm:"column(demand_adspace_name);"`
	DspAdSpaceId 		string		`orm:"column(demand_adspace_id);"`
	DspAdSpaceName 		string		`orm:"column(demand_adspace_name);"`
	PdbMediaId 			string		`orm:"column(pmp_media_id);"`
	PdbMediaName 		string		`orm:"column(pmp_media_name);"`
	PdbAdSpaceId 		string		`orm:"column(pmp_adspace_id);"`
	PdbAdSpaceName 		string		`orm:"column(pmp_adspace_id);"`
	ReqSuccess	 		int			`orm:"column(req_success);"`
	ReqError			int			`orm:"column(req_error);"`
	ReqTimeout			int			`orm:"column(req_timeout);"`
	ReqNoad				int			`orm:"column(req_noad);"`
	Impl				int			`orm:"column(impl);"`
	Clk					int			`orm:"column(clk);"`

	Ctr					float32		`orm:"-"`

	ReqAll 				int			`orm:"-"`
	FillRate			float32		`orm:"-"`
}


