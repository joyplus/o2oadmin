-- ltv_flight_group
INSERT INTO `pmp`.`ltv_flight_group` (`id`, `name`, `budget`) VALUES ('1', '第一单', '100000');

--  ltv_flight
INSERT INTO `pmp`.`ltv_flight` (`id`, `group_id`, `name`, `budget`, `spending`, `cost`, `imp`, `clk`, `install`, `postback_install`, `register`, `submit`, `conversion`, `revenue`, `eCPA`, `del_flg`, `spread_url`, `spread_name`, `ltv_app_id`) VALUES ('1', '1', 'talking data', '30000', '20000', '15000', '20000', '400', '40', '35', '30', '25', '20', '100000', '100', '0', 'http://talkingdata.com/xxx', 'talking data name', '1');
INSERT INTO `pmp`.`ltv_flight` (`id`, `group_id`, `name`, `budget`, `spending`, `cost`, `imp`, `clk`, `install`, `postback_install`, `register`, `submit`, `conversion`, `revenue`, `eCPA`, `del_flg`, `spread_url`) VALUES ('2', '1', '百度', '20000', '150000', '10000', '30000', '500', '50', '45', '40', '35', '15', '150000', '150', '0', 'http://baidu.com');

-- ltv_app
INSERT INTO `pmp`.`ltv_app` (`id`, `name`, `pkgname`, `app_key`, `security_key`) VALUES ('1', 'wechat', 'com.wechat', '124_app_key', '3456_security_key');
