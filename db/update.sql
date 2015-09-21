DELETE FROM `node` WHERE `id` in (31,32,33,34);
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (31,'PDB','pmp',1,0,'',2,2);
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (32,'PDB广告位管理','adspace/index',2,31,NULL,2,2);
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (33,'DSP管理','demand/index',2,31,NULL,2,2);
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (34,'PDB媒体管理','media/index',2,31,NULL,2,2);
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (35,'PDB媒体报表','report/GetPdbMediaReport',2,31,NULL,2,2);
INSERT INTO `node` (`id`,`title`,`name`,`level`,`pid`,`remark`,`status`,`group_id`) VALUES (36,'DSP报表','report/GetPdbDspReport',2,31,NULL,2,2);

UPDATE node SET name='report/getPdbMediaReport' WHERE id=35;
UPDATE node SET name='report/getPdbDspReport' WHERE id=36;

-- 添加 效果监测 菜单入口
INSERT INTO `node` (`id`, `title`, `name`, `level`, `pid`, `status`, `group_id`) VALUES ('38', '效果监测', 'Performance', '2', '31', '2', '2');


CREATE TABLE `dsp_advertiser` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  `mobile` VARCHAR(45) NULL,
  `email` VARCHAR(45) NULL,
  `campany` VARCHAR(45) NULL,
  PRIMARY KEY (`id`));

CREATE TABLE `dsp_application` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  `advertiser_id` VARCHAR(45) NULL,
  `version` VARCHAR(45) NULL,
  `package_name` VARCHAR(45) NULL,
  `os` INT NULL,
  PRIMARY KEY (`id`));

CREATE TABLE `dsp_campaign` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `advertiser_id` INT NULL,
  `app_id` INT NULL,
  `name` VARCHAR(45) NULL,
  `budget` FLOAT NULL,
  `price` FLOAT NULL,
  `description` VARCHAR(255) NULL,
  `target_link` VARCHAR(45) NULL,
  PRIMARY KEY (`id`));

CREATE TABLE `dsp_channel` (
  `id` INT NOT NULL,
  `channel_id` VARCHAR(45) NULL COMMENT 'this is to be used externally',
  `name` VARCHAR(45) NULL,
  `logo_url` VARCHAR(200) NULL,
  `postback_url_ios` VARCHAR(200) NULL,
  `postback_url_android` VARCHAR(200) NULL,
  `ref_id` VARCHAR(45) NULL,
  PRIMARY KEY (`id`));

CREATE TABLE `dsp_adunit` (
  `id` INT NOT NULL,
  `name` VARCHAR(45) NULL,
  `dsp_campaign_id` INT NULL,
  `dsp_channel_id` INT NULL,
  `start_date` DATETIME NULL,
  `end_date` DATETIME NULL,
  `budget` FLOAT NULL,
  `price` FLOAT NULL,
  `bidding_type` INT NULL COMMENT 'CPA / CPC',
  PRIMARY KEY (`id`));

