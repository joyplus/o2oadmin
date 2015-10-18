define(function(){
    // hasAptitudes字段 表示该渠道是否可添加资质
    // hasCategories字段 表示该渠道可选'行业分类
    // hasIndustry 字段 表示新建资质时要输入行业分类号码，新浪需要
    // hasMemo 字段 表示新建资质时加入备注，腾讯需要
    // needAptitudes 字段 表示在新建活动选择广告渠道时，有这个字段的渠道并且该账号没有对应资质会提示：当前账户需要设置对应的资质
    // hasMoblieClient 字段 表示支持移动端RTB广告投放
    // needCategories 行业分类的判断，好耶需要

    return [
        {id:10004, name:_T('TanX'), hasAptitudes:true, needAptitudes:true},
        {id:10008, name:_T('优酷'), hasAptitudes:true, needAptitudes:true, hasMoblieClient:true},
        {id:10009, name:_T('百度'), hasAptitudes:true, needAptitudes:true},
        {id:10022, name:_T('IMAGETER'), hasAptitudes:true, needAptitudes:true, hasMoblieClient:true},
        {id:10044, name:_T('聚效')},
        {id:10002, name:_T('腾讯'), hasAptitudes:true, needAptitudes:true, hasMemo:true,hasMoblieClient:true},
        {id:10013, name:_T('PubRight'), hasAptitudes:true, needAptitudes:true},
        {id:10055, name:_T('adoceans'), hasAptitudes:true, needAptitudes:true},
        {id:10001, name:_T('秒针'), hasAptitudes:true, needAptitudes:true,hasMoblieClient:true},
        {id:10028, name:_T('互众'), hasAptitudes:true, needAptitudes:true},
        {id:10010, name:_T('新浪'), hasAptitudes:true, needAptitudes:true, hasIndustry:true},
        {id:10015, name:_T('易传媒')},
        {id:10005, name:_T('好耶'), hasCategories:true, needCategories:true},
        {id:10029, name:_T('万流客')},
        {id:10025, name:_T('搜狐'), hasAptitudes:true, needAptitudes:true,hasMemo:true},
        {id:10006, name:_T('联袂'), hasAptitudes:true, needAptitudes:true},
        {id:10020, name:_T('新浪视频'), hasAptitudes:true, needAptitudes:true, hasIndustry:true},
        {id:10014, name:_T('亿告')},
        {id:10007, name:_T('谷歌'), hasAptitudes:true, needAptitudes:true, skip_list:1},
        {id:10018, name:_T('天极')},
        {id:10017, name:_T('中关村在线')},
        {id:10019, name:_T('暴风')},
        //{id:10012, name:_T('宣传易')},
        //{id:10003, name:_T('号百'), hasAptitudes:true, needAptitudes:true},
        // {id:10011, name:_T('梦传媒')},
        {id:10021, name:_T('财经')},
        {id:10030, name:_T('传漾')},
        {id:10031, name:_T('海云')},
        {id:10035, name:_T('地幔'), hasAptitudes:true},
        {id:10050, name:_T('乐视'), hasAptitudes:true, needAptitudes:true},
        {id:10042, name:_T('光明网')},
        {id:10039, name:_T('PubMatic')},
        // 芒果
        {id:10032, name:_T('今日头条'), hasMoblieClient:true, noPC:true},
        {id:10024, name:_T('百度移动'), hasMoblieClient:true, noPC:true, hasAptitudes:true, needAptitudes:true},
        {id:10038, name:_T('易传媒移动'), hasMoblieClient:true, noPC:true},
        {id:10016, name:_T('移动资源'), hasMoblieClient:true, noPC:true},
        {id:10033, name:_T('聚效移动'), hasMoblieClient:true, noPC:true},
        {id:10023, name:_T('TanX移动'), hasMoblieClient:true, noPC:true},
        {id:10026, name:_T('谷歌移动'), hasAptitudes:true, needAptitudes:true, hasMoblieClient:true, noPC:true},
        {id:10041, name:_T('乐视移动'), noPC:true, hasMoblieClient:true, hasAptitudes:true, needAptitudes:true},
        {id:10043, name:_T('暴风移动'), hasMoblieClient:true, noPC:true},
        //{id:10027, name:_T('木瓜移动'), hasMoblieClient:true, noPC:true},
        {id:10040, name:_T('爱奇艺'), hasAptitudes:true},
        {id:10051, name:_T('讯飞移动'), hasMoblieClient:true, noPC:true, hasAptitudes:true, needAptitudes:true},
        {id:10036, name:_T('Smaato'), hasMoblieClient:true, noPC:true},
        {id:10037, name:_T('M_Inmobi'), hasMoblieClient:true, noPC:true},
        {id:10045, name:_T('M_PubMatic'), hasMoblieClient:true, noPC:true},
        {id:10046, name:_T('爱奇艺移动'), hasMoblieClient:true, noPC:true, hasAptitudes:true},
        {id:10052, name:_T('百度手助'), hasMoblieClient:true, noPC:true},
        {id:10053, name:_T('风行'), hasAptitudes:true, needAptitudes:true},
        {id:10054, name:_T('风行移动'), hasAptitudes:true, needAptitudes:true, hasMoblieClient:true, noPC:true},
        {id:10056, name:_T('物优SSP'), hasAptitudes:true, needAptitudes:true},
        {id:10057, name:_T('usingde'), hasAptitudes:true, needAptitudes:true},
        {id:10058, name:_T('ALL X'), hasAptitudes:true, needAptitudes:true},
        {id:10048, name:_T('新浪微博'), hasMoblieClient:true, noPC:true, hasAptitudes:true, needAptitudes:true},
        {id:10049, name:_T('广点通'), hasMoblieClient:true, noPC:true, hasAptitudes:true, needAptitudes:true},
        {id:10060, name:_T('鹰击'), hasAptitudes:true, needAptitudes:true, hasMoblieClient:true},
        {id:10061, name:_T('PPTV'), hasAptitudes:true, needAptitudes:true},
        {id:10062, name:_T('百川')},
        {id:10063, name:_T('M_PPTV'), noPC:true,hasAptitudes:true, needAptitudes:true, hasMoblieClient:true},
        {id:10064, name:_T('百川移动'), noPC:true, hasMoblieClient:true},
        {id:10067, name:_T('玉米移动'), noPC:true, hasMoblieClient:true},
        {id:10068, name:_T('M1905'), hasAptitudes:true, needAptitudes:true},
        {id:10069, name:_T('中天移动'), noPC:true, hasMoblieClient:true, hasAptitudes:true, needAptitudes:true},
        {id:10070, name:_T('中天PC'), hasAptitudes:true, needAptitudes:true}
    ];
});

