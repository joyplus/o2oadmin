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
