DELETE FROM `node` WHERE `id` in (31,32,33,34);
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (31,'PDB','pmp',1,0,'',2,2);
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (32,'PDB广告位管理','adspace/index',2,31,NULL,2,2);
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (33,'DSP管理','demand/index',2,31,NULL,2,2);
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (34,'PDB媒体管理','media/index',2,31,NULL,2,2);
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (35,'PDB媒体报表','report/GetPdbMediaReport',2,31,NULL,2,2);
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (36,'DSP报表','report/GetPdbDspReport',2,31,NULL,2,2);

UPDATE node SET name='report/getPdbMediaReport' WHERE id=35;
UPDATE node SET name='report/getPdbDspReport' WHERE id=36;

INSERT INTO `pmp`.`node` (`id`, `title`, `name`, `level`, `pid`, `remark`, `status`, `group_id`) VALUES (NULL, '创建活动', 'campaign/add', '2', '31', NULL, '2', '2');