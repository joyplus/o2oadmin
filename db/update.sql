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