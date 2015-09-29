DELETE FROM `node` WHERE `id` in (31,32,33,34);
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (31,'PDB','pmp',1,0,'',2,2);
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (32,'PDB广告位管理','adspace/index',2,31,NULL,2,2);
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (33,'DSP管理','demand/index',2,31,NULL,2,2);
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (34,'PDB媒体管理','media/index',2,31,NULL,2,2);
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (35,'PDB媒体报表','report/getPdbMediaReport',2,31,NULL,2,2);
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (36,'DSP报表','report/getPdbDspReport',2,31,NULL,2,2);

UPDATE node SET name='report/getPdbMediaReport' WHERE id=35;
UPDATE node SET name='report/getPdbDspReport' WHERE id=36;

INSERT INTO `pmp`.`node` (`id`, `title`, `name`, `level`, `pid`, `remark`, `status`, `group_id`) VALUES (NULL, '创建活动', 'campaign/add', '2', '31', NULL, '2', '2');

#2015-09-20#
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (NULL,'PDB space list','index',3,31,NULL,2,2);
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (NULL,'DSP management','index',3,31,NULL,2,2);
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (NULL,'PDB media management','index',3,31,NULL,2,2);
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (NULL,'PDB media report','getPdbMediaReport',3,31,NULL,2,2);
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (NULL,'DSP report','getPdbDspReport',3,31,NULL,2,2);

-- 添加 效果监测 菜单入口
INSERT INTO `node` (`title`, `name`, `level`, `pid`, `status`, `group_id`) VALUES ('效果监测', 'performance', '2', '32', '2', '2');
INSERT INTO `node` (`title`, `name`, `level`, `pid`, `status`, `group_id`) VALUES ('综合报表', 'flightGroup/FullReport', '2', '32', '2', '2');
=======
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (NULL,'PDB space list','index',3,32,NULL,2,2);
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (NULL,'DSP management','index',3,33,NULL,2,2);
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (NULL,'PDB media management','index',3,34,NULL,2,2);
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (NULL,'PDB media report','getPdbMediaReport',3,35,NULL,2,2);
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (NULL,'DSP report','getPdbDspReport',3,36,NULL,2,2);

#2015-09-21#
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (NULL,'创建','add',3,37,NULL,2,2);

#2015-09-29#
INSERT INTO `pmp_lov` VALUES (1,'ad_type',0,'开屏',0),(2,'ad_type',1,'信息流',1),(3,'ad_type',2,'焦点图',2),(4,'ad_type',3,'banner',3),(5,'campaign_type',0,'RTB',0),(6,'campaign_type',1,'PDB',1),(7,'accurate_type',0,'精准',0),(8,'accurate_type',1,'适中',1),(9,'accurate_type',2,'宽泛',2),(10,'pricing_type',0,'GD',0),(11,'pricing_type',1,'CPM',1),(12,'pricing_type',2,'CPC',2),(13,'strategy_type',0,'尽快投放',0),(14,'strategy_type',1,'平均',1),(15,'strategy_type',2,'按小时',2),(16,'budget_type',0,'总预算',0),(17,'budget_type',1,'日预算',1),(18,'campaign_status',0,'停止',0),(19,'campaign_status',1,'运行',1),(20,'campaign_status',2,'完成',2),(21,'gender',0,'不限',0),(22,'gender',1,'男',1),(23,'gender',2,'女',2),(24,'tempreture',0,'零下',0),(25,'tempreture',1,'0~10℃',1),(26,'tempreture',2,'10~20℃',2),(27,'tempreture',3,'20~30℃',3),(28,'tempreture',4,'大于30℃',4),(29,'humidity',0,'干燥',0),(30,'humidity',1,'舒适',1),(31,'humidity',2,'潮湿',2),(37,'wind',0,'微风',0),(38,'wind',1,'清风',1),(39,'wind',2,'大风',2),(40,'wind',3,'暴风',3),(41,'wind',4,'台风',4),(42,'weather',0,'晴天',0),(43,'weather',1,'阴天',1),(44,'weather',2,'雨天',2),(45,'weather',3,'雪天',3),(46,'weather',4,'雾霾天',4),(47,'weather',5,'沙尘暴',5),(48,'occupation',0,'白领',0),(49,'occupation',1,'医疗卫生',1),(50,'occupation',2,'政府机关',2),(51,'occupation',3,'教育',3),(52,'occupation',4,'服务业',4),(53,'operator',0,'未知',0),(54,'operator',1,'移动',1),(55,'operator',2,'联通',2),(56,'operator',3,'电信',3),(57,'plateform',0,'不限',0),(58,'plateform',1,'iPhone',1),(59,'plateform',2,'Android',2),(60,'plateform',3,'手机网站',3),(61,'phone_brand',0,'不限',0),(62,'phone_brand',1,'HTC',1),(63,'phone_brand',2,'LG',2),(64,'phone_brand',3,'OPPO',3),(65,'phone_brand',4,'TCL',4),(66,'phone_brand',5,'VIVO',5),(67,'phone_brand',6,'ZUK',6),(68,'phone_brand',7,'一加',7),(69,'phone_brand',8,'三星',8),(70,'internet',0,'不限',0),(71,'internet',1,'WIFI',1);
