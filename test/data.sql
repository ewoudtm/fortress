-- Database name is `test_fortress`
use test_fortress;

-- Drop tables to ensure clean testing database.
drop table if exists `user`, `user_client`, `io_sync`;


-- ##################
-- # Create tables. #
-- ##################
CREATE TABLE `io_sync` (
  `user_id` int(11) NOT NULL,
  `credits` int(11) NOT NULL,
  PRIMARY KEY (`user_id`)
) CHARSET=utf8;

CREATE TABLE `user` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nickname` char(50) DEFAULT NULL,
  `username` char(50) DEFAULT NULL,
  `password` char(50) DEFAULT NULL,
  `deleted` tinyint(1) unsigned DEFAULT NULL,
  `first_access_dt` datetime DEFAULT NULL,
  `last_access_dt` datetime DEFAULT NULL,
  `verified_dt` datetime DEFAULT NULL,
  `payment_provider` enum('tintel','izixs','flatbox','dialxs','d2media','beateuhse','chatterbox','other','crazywebcam','crazywebcamdev') DEFAULT NULL,
  `payment_account` char(32) DEFAULT NULL,
  `payment_type` enum('wallet','phone') DEFAULT NULL,
  `country_code` char(2) DEFAULT NULL,
  `language` char(2) DEFAULT NULL,
  `reg_program_id` int(10) unsigned DEFAULT NULL,
  `reg_website_id` int(10) unsigned DEFAULT NULL,
  `reg_promotor_id` int(10) unsigned DEFAULT NULL,
  `reg_promotor_info` char(50) DEFAULT NULL,
  `payments_successful` smallint(5) unsigned DEFAULT '0',
  `allow_free_minutes` tinyint(1) unsigned DEFAULT '0',
  `received_free_minutes` tinyint(1) unsigned DEFAULT '0',
  `custom` varchar(50) DEFAULT NULL,
  `tintel_session_id` int(10) unsigned DEFAULT NULL,
  `session_count` int(11) DEFAULT '0',
  `payment_pending` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`,`reg_program_id`,`reg_website_id`),
  KEY `nickname` (`nickname`),
  KEY `payment_account` (`payment_account`),
  KEY `custom` (`custom`),
  KEY `tintel_session_id` (`tintel_session_id`)
) DEFAULT CHARSET=utf8;

CREATE TABLE `user_client` (
  `id` int(10) unsigned NOT NULL,
  `state` enum('offline','online') DEFAULT 'offline',
  `activity_dt` datetime DEFAULT NULL,
  `camback_status` enum('on','off') NOT NULL DEFAULT 'off',
  `last_client_state` enum('connecting','active','passive','exclusive','excluded') DEFAULT NULL,
  `payment_session_id` varchar(100) DEFAULT NULL,
  `current_domain` varchar(100) DEFAULT NULL,
  `available_credits` int(10) DEFAULT '0',
  `pending_snapshots` int(10) DEFAULT '0',
  `session_data` varchar(255) DEFAULT NULL,
  `payment_id` char(32) DEFAULT NULL,
  `partner_code` char(10) DEFAULT NULL,
  `device` enum('mobile','other') NOT NULL DEFAULT 'other',
  PRIMARY KEY (`id`),
  KEY `activity_dt` (`activity_dt`),
  KEY `state` (`state`),
  KEY `payment_session_id` (`payment_session_id`),
  KEY `payment_id_idx` (`payment_id`)
) CHARSET=utf8;


-- ####################
-- # Insert fixtures. #
-- ####################
-- user
INSERT INTO `user` (`id`,`nickname`,`username`,`password`,`deleted`,`first_access_dt`,`last_access_dt`,`verified_dt`,`payment_provider`,`payment_account`,`payment_type`,`country_code`,`language`,`reg_program_id`,`reg_website_id`,`reg_promotor_id`,`reg_promotor_info`,`payments_successful`,`allow_free_minutes`,`received_free_minutes`,`custom`,`tintel_session_id`,`session_count`,`payment_pending`) VALUES (9163052,'kees',  'user1@example.com','abcd',0,'2014-08-28 08:24:52','2014-08-28 08:25:04','2014-08-28 08:25:04','tintel','9163052','wallet',NULL,NULL,2473,186,316,'reconnect',1,0,0,'islive/chatgirlnl',1475214,1,'abc');
INSERT INTO `user` (`id`,`nickname`,`username`,`password`,`deleted`,`first_access_dt`,`last_access_dt`,`verified_dt`,`payment_provider`,`payment_account`,`payment_type`,`country_code`,`language`,`reg_program_id`,`reg_website_id`,`reg_promotor_id`,`reg_promotor_info`,`payments_successful`,`allow_free_minutes`,`received_free_minutes`,`custom`,`tintel_session_id`,`session_count`,`payment_pending`) VALUES (9163000,NULL,    'user2@example.com',NULL,0,'2014-08-28 08:14:27','2014-08-28 08:14:27','2014-08-28 08:14:27','tintel','8707894','wallet','NL','NL',2473,180,NULL,NULL,NULL,0,0,NULL,NULL,0,NULL);
INSERT INTO `user` (`id`,`nickname`,`username`,`password`,`deleted`,`first_access_dt`,`last_access_dt`,`verified_dt`,`payment_provider`,`payment_account`,`payment_type`,`country_code`,`language`,`reg_program_id`,`reg_website_id`,`reg_promotor_id`,`reg_promotor_info`,`payments_successful`,`allow_free_minutes`,`received_free_minutes`,`custom`,`tintel_session_id`,`session_count`,`payment_pending`) VALUES (9162952,'burton','user3@example.com','abcd',0,'2014-08-28 07:54:40','2014-08-28 07:55:55','2014-08-28 07:54:40','tintel','5425321','wallet','NL','NL',2473,10,NULL,NULL,1,0,0,NULL,1474992,1,'abc');
INSERT INTO `user` (`id`,`nickname`,`username`,`password`,`deleted`,`first_access_dt`,`last_access_dt`,`verified_dt`,`payment_provider`,`payment_account`,`payment_type`,`country_code`,`language`,`reg_program_id`,`reg_website_id`,`reg_promotor_id`,`reg_promotor_info`,`payments_successful`,`allow_free_minutes`,`received_free_minutes`,`custom`,`tintel_session_id`,`session_count`,`payment_pending`) VALUES (9162948,NULL,    'user4@example.com','abcd',0,'2014-08-28 07:54:23','2014-08-28 07:54:24',NULL,'tintel','9162948','wallet',NULL,NULL,2473,597,11472,'typein',NULL,0,0,'islive/gratiswebcamsexnlgratisminuten',NULL,0,NULL);
INSERT INTO `user` (`id`,`nickname`,`username`,`password`,`deleted`,`first_access_dt`,`last_access_dt`,`verified_dt`,`payment_provider`,`payment_account`,`payment_type`,`country_code`,`language`,`reg_program_id`,`reg_website_id`,`reg_promotor_id`,`reg_promotor_info`,`payments_successful`,`allow_free_minutes`,`received_free_minutes`,`custom`,`tintel_session_id`,`session_count`,`payment_pending`) VALUES (9162908,NULL,    'user5@example.com',NULL,0,'2014-08-28 07:44:46','2014-08-28 07:44:46','2014-08-28 07:44:46','tintel','5441440','wallet','NL','NL',2473,180,NULL,NULL,NULL,0,0,NULL,NULL,0,NULL);
INSERT INTO `user` (`id`,`nickname`,`username`,`password`,`deleted`,`first_access_dt`,`last_access_dt`,`verified_dt`,`payment_provider`,`payment_account`,`payment_type`,`country_code`,`language`,`reg_program_id`,`reg_website_id`,`reg_promotor_id`,`reg_promotor_info`,`payments_successful`,`allow_free_minutes`,`received_free_minutes`,`custom`,`tintel_session_id`,`session_count`,`payment_pending`) VALUES (9162894,'rim',   'user6@example.com','abcd',0,'2014-08-28 07:43:02','2014-08-28 07:43:02','2014-08-28 07:43:02','tintel','31417','wallet','NL','NL',2473,201,15358,'flow006',1,0,0,'respo/splash6c',1474876,1,'abc');
INSERT INTO `user` (`id`,`nickname`,`username`,`password`,`deleted`,`first_access_dt`,`last_access_dt`,`verified_dt`,`payment_provider`,`payment_account`,`payment_type`,`country_code`,`language`,`reg_program_id`,`reg_website_id`,`reg_promotor_id`,`reg_promotor_info`,`payments_successful`,`allow_free_minutes`,`received_free_minutes`,`custom`,`tintel_session_id`,`session_count`,`payment_pending`) VALUES (9162820,NULL,    'user7@example.com','abcd',0,'2014-08-28 07:27:35','2014-08-28 07:27:35',NULL,'tintel','9162820','wallet',NULL,NULL,2473,780,61,'typein',NULL,0,0,'respo/splash1',NULL,0,'abc');
INSERT INTO `user` (`id`,`nickname`,`username`,`password`,`deleted`,`first_access_dt`,`last_access_dt`,`verified_dt`,`payment_provider`,`payment_account`,`payment_type`,`country_code`,`language`,`reg_program_id`,`reg_website_id`,`reg_promotor_id`,`reg_promotor_info`,`payments_successful`,`allow_free_minutes`,`received_free_minutes`,`custom`,`tintel_session_id`,`session_count`,`payment_pending`) VALUES (9162818,NULL,    'user8@example.com','abcd',0,'2014-08-28 07:27:20','2014-08-28 07:27:20',NULL,'tintel','9162818','wallet',NULL,NULL,2473,219,13961,'meidenvanholland.nl-promo',NULL,0,0,'islive/meidenvanhollandnl',NULL,0,'abc');
INSERT INTO `user` (`id`,`nickname`,`username`,`password`,`deleted`,`first_access_dt`,`last_access_dt`,`verified_dt`,`payment_provider`,`payment_account`,`payment_type`,`country_code`,`language`,`reg_program_id`,`reg_website_id`,`reg_promotor_id`,`reg_promotor_info`,`payments_successful`,`allow_free_minutes`,`received_free_minutes`,`custom`,`tintel_session_id`,`session_count`,`payment_pending`) VALUES (9162802,NULL,    'user9@example.com','abcd',0,'2014-08-28 07:23:02','2014-08-28 07:23:02','2014-08-28 07:23:02','tintel','1054087','wallet',NULL,NULL,2473,679,NULL,NULL,NULL,0,0,'islive/livesexvaginanl',NULL,0,NULL);
INSERT INTO `user` (`id`,`nickname`,`username`,`password`,`deleted`,`first_access_dt`,`last_access_dt`,`verified_dt`,`payment_provider`,`payment_account`,`payment_type`,`country_code`,`language`,`reg_program_id`,`reg_website_id`,`reg_promotor_id`,`reg_promotor_info`,`payments_successful`,`allow_free_minutes`,`received_free_minutes`,`custom`,`tintel_session_id`,`session_count`,`payment_pending`) VALUES (9162724,NULL,    'user0@example.com',NULL,0,'2014-08-28 06:58:48','2014-08-28 06:58:48','2014-08-28 06:58:48','tintel','8758603','wallet','NL','NL',2473,180,NULL,NULL,NULL,0,0,NULL,NULL,0,NULL);
INSERT INTO `user` (`id`,`nickname`,`username`,`password`,`deleted`,`first_access_dt`,`last_access_dt`,`verified_dt`,`payment_provider`,`payment_account`,`payment_type`,`country_code`,`language`,`reg_program_id`,`reg_website_id`,`reg_promotor_id`,`reg_promotor_info`,`payments_successful`,`allow_free_minutes`,`received_free_minutes`,`custom`,`tintel_session_id`,`session_count`,`payment_pending`) VALUES (123,NULL,    'fortress-test@ratus.nl',NULL,0,'2014-01-01 07:00:00','2014-01-01 07:00:00','2014-01-01 07:00:00','tintel','987','wallet','NL','NL',2473,180,NULL,NULL,NULL,0,0,NULL,NULL,0,NULL);

-- user_client
INSERT INTO `user_client` (`id`,`state`,`activity_dt`,`camback_status`,`last_client_state`,`payment_session_id`,`current_domain`,`available_credits`,`pending_snapshots`,`session_data`,`payment_id`,`partner_code`,`device`) VALUES (9162724,'offline',NULL,'off',NULL,NULL,NULL,0,0,NULL,'',NULL,'other');
INSERT INTO `user_client` (`id`,`state`,`activity_dt`,`camback_status`,`last_client_state`,`payment_session_id`,`current_domain`,`available_credits`,`pending_snapshots`,`session_data`,`payment_id`,`partner_code`,`device`) VALUES (9162802,'offline',NULL,'off',NULL,NULL,NULL,0,0,NULL,'',NULL,'other');
INSERT INTO `user_client` (`id`,`state`,`activity_dt`,`camback_status`,`last_client_state`,`payment_session_id`,`current_domain`,`available_credits`,`pending_snapshots`,`session_data`,`payment_id`,`partner_code`,`device`) VALUES (9162818,'offline',NULL,'off',NULL,NULL,NULL,0,0,NULL,'',NULL,'other');
INSERT INTO `user_client` (`id`,`state`,`activity_dt`,`camback_status`,`last_client_state`,`payment_session_id`,`current_domain`,`available_credits`,`pending_snapshots`,`session_data`,`payment_id`,`partner_code`,`device`) VALUES (9162820,'offline',NULL,'off',NULL,NULL,NULL,0,0,NULL,'',NULL,'other');
INSERT INTO `user_client` (`id`,`state`,`activity_dt`,`camback_status`,`last_client_state`,`payment_session_id`,`current_domain`,`available_credits`,`pending_snapshots`,`session_data`,`payment_id`,`partner_code`,`device`) VALUES (9162894,'offline',NULL,'off','connecting','abc','islivesplash6.nl',1229,0,'foo','xyz','12578','other');
INSERT INTO `user_client` (`id`,`state`,`activity_dt`,`camback_status`,`last_client_state`,`payment_session_id`,`current_domain`,`available_credits`,`pending_snapshots`,`session_data`,`payment_id`,`partner_code`,`device`) VALUES (9162908,'offline',NULL,'off',NULL,NULL,NULL,0,0,NULL,'',NULL,'other');
INSERT INTO `user_client` (`id`,`state`,`activity_dt`,`camback_status`,`last_client_state`,`payment_session_id`,`current_domain`,`available_credits`,`pending_snapshots`,`session_data`,`payment_id`,`partner_code`,`device`) VALUES (9162948,'offline',NULL,'off',NULL,NULL,NULL,0,0,NULL,'',NULL,'other');
INSERT INTO `user_client` (`id`,`state`,`activity_dt`,`camback_status`,`last_client_state`,`payment_session_id`,`current_domain`,`available_credits`,`pending_snapshots`,`session_data`,`payment_id`,`partner_code`,`device`) VALUES (9162952,'offline',NULL,'off','connecting','abc','islivemodels.nl',1417,0,'bar','xyz','15559','other');
INSERT INTO `user_client` (`id`,`state`,`activity_dt`,`camback_status`,`last_client_state`,`payment_session_id`,`current_domain`,`available_credits`,`pending_snapshots`,`session_data`,`payment_id`,`partner_code`,`device`) VALUES (9163000,'offline',NULL,'off',NULL,NULL,NULL,0,0,NULL,'',NULL,'other');
INSERT INTO `user_client` (`id`,`state`,`activity_dt`,`camback_status`,`last_client_state`,`payment_session_id`,`current_domain`,`available_credits`,`pending_snapshots`,`session_data`,`payment_id`,`partner_code`,`device`) VALUES (9163052,'offline',NULL,'off','connecting','abc','chatgirl.nl',1956,0,'baz','xyz','316','other');
INSERT INTO `user_client` (`id`,`state`,`activity_dt`,`camback_status`,`last_client_state`,`payment_session_id`,`current_domain`,`available_credits`,`pending_snapshots`,`session_data`,`payment_id`,`partner_code`,`device`) VALUES (123,'offline',NULL,'off','connecting','abc','islive-test.io',1956,0,'baz','xyz','316','other');
