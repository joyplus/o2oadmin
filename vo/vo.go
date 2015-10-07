package vo

type LtvFlightGroupVO struct {
    Id              int
    Name            string

    // below are from ltv_flight
    Budget          float32
    Spending        float32
    Cost            float32
    Imp             int
    Clk             int
    Install         int
    PostbackInstall int
    Register        int
    Submit          int
    Conversion      int
    Revenue         float32
    ECPA            float32     `orm:"column(eCPA);null"`
}

// for campain
type CampaingnPageVO struct {
	Campaign PmpCampaignVO
	Gender int
	Tempreture int
	Humidity int
	Wind int
	Weather int
	Occupation int
	Operator int
	Plateform int
	PhoneBrand int
	Internet int
	//创意列表
	CampaignCreatives []PmpCampaignCreativeVO
	// 地域, city id array
	Cities []int
	// 投放时间段
	AdvertiseTime []string
	
}

type CityVO struct {
	Id int
	CityName string
	Zipcode string
	ProvinceId int
}

type PmpCampaignVO struct {
	Id              int       
	GroupId         int 
	GroupName		string      
	Name            string    
	StartDate       string
	EndDate         string
	CampaignStatus  int       
	DemandAdspaceId int       
	ImpTrackingUrl  string    
	ClkTrackingUrl  string    
	LandingUrl      string    
	AdType          int       
	CampaignType    int       
	AccurateType    int       
	PricingType     int
	// 投放策略        
	StrategyType    int       
	BudgetType      int       
	Budget          int      
	BidPrice        float32  
	AdCategory 		int
}

type PmpCampaignCreativeVO struct {
	Id             int    
	CampaignId     int    
	Name           string 
	Width          int    
	Height         int    
	CreativeUrl    string 
	CreativeStatus int    
	LandingUrl     string 
	ImpTrackingUrl string 
	ClkTrackingUrl string 
	DisplayTitle   string 
	DisplayText    string 
}

// campaign group vo
type PmpCampaignGroupVO struct {
	Id           int
	AdvertiserId int
	Name         string
	Budget       int 
}