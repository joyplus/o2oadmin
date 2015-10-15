-- ltv_flight_group
INSERT INTO `ltv_flight_group` (`id`, `name`, `budget`) VALUES ('1', '第一单', '100000');

--  ltv_flight
INSERT INTO `ltv_flight` (`id`, `group_id`, `name`, `budget`, `spending`, `cost`, `imp`, `clk`, `install`, `postback_install`, `register`, `submit`, `conversion`, `revenue`, `eCPA`, `del_flg`, `spread_url`, `spread_name`, `ltv_app_id`) VALUES ('1', '1', 'talking data', '30000', '20000', '15000', '20000', '400', '40', '35', '30', '25', '20', '100000', '100', '0', 'http://talkingdata.com/xxx', 'talking data name', '1');
INSERT INTO `ltv_flight` (`id`, `group_id`, `name`, `budget`, `spending`, `cost`, `imp`, `clk`, `install`, `postback_install`, `register`, `submit`, `conversion`, `revenue`, `eCPA`, `del_flg`, `spread_url`) VALUES ('2', '1', '百度', '20000', '150000', '10000', '30000', '500', '50', '45', '40', '35', '15', '150000', '150', '0', 'http://baidu.com');

-- ltv_app
INSERT INTO `ltv_app` (`id`, `name`, `pkgname`, `app_key`, `security_key`) VALUES ('1', 'wechat', 'com.wechat', '124_app_key', '3456_security_key');

-- test data for pmp campaign report 2015-10-09
INSERT INTO `pmp_campaign_group` (`id`, `advertiser_Id`, `name`, `budget`) VALUES ('0', '0', '活动组1', '30000');
INSERT INTO `pmp_campaign_group` (`id`, `advertiser_Id`, `name`, `budget`) VALUES ('1', '1', '活动组2', '40000');
INSERT INTO `pmp_campaign_daily_report` (`id`, `campaign_id`, `ad_date`, `imp`, `clk`, `ctr`, `ecpm`, `ecpc`, `spending`, `cost`) VALUES ('1', '1', '2015-09-28', '10000', '1000', '0.05', '0.1', '0.5', '5000', '4000');
INSERT INTO `pmp_campaign_daily_report` (`id`, `campaign_id`, `ad_date`, `imp`, `clk`, `ctr`, `ecpm`, `ecpc`, `spending`, `cost`) VALUES ('2', '1', '2015-09-29', '15000', '1200', '0.04', '0.1', '0.45', '7000', '6500');
INSERT INTO `pmp_campaign_daily_report` (`id`, `campaign_id`, `ad_date`, `imp`, `clk`, `ctr`, `ecpm`, `ecpc`, `spending`, `cost`) VALUES ('3', '2', '2015-09-28', '20000', '1000', '0.05', '0.1', '0.5', '11000', '10000');
INSERT INTO `pmp_campaign_daily_report` (`id`, `campaign_id`, `ad_date`, `imp`, `clk`, `ctr`, `ecpm`, `ecpc`, `spending`, `cost`) VALUES ('4', '2', '2015-09-29', '28000', '2200', '0.05', '0.1', '0.5', '15000', '12000');
INSERT INTO `pmp_campaign_daily_report` (`id`, `campaign_id`, `ad_date`, `imp`, `clk`, `ctr`, `ecpm`, `ecpc`, `spending`, `cost`) VALUES ('5', '3', '2015-09-28', '30000', '3300', '0.05', '0.1', '0.5', '30000', '25000');
INSERT INTO `pmp_campaign_daily_report` (`id`, `campaign_id`, `ad_date`, `imp`, `clk`, `ctr`, `ecpm`, `ecpc`, `spending`, `cost`) VALUES ('6', '3', '2015-09-29', '35000', '3000', '0.05', '0.1', '0.5', '350000', '30000');
