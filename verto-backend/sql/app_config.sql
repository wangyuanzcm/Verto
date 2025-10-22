-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- 主机： mysql:3306
-- 生成日期： 2025-10-22 07:14:01
-- 服务器版本： 9.4.0
-- PHP 版本： 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 数据库： `verto`
--

-- --------------------------------------------------------

--
-- 表的结构 `app_config`
--

CREATE TABLE `app_config` (
  `id` varchar(64) NOT NULL,
  `name` varchar(128) NOT NULL,
  `type` varchar(32) NOT NULL,
  `status` varchar(16) NOT NULL,
  `environment` varchar(32) DEFAULT NULL,
  `description` varchar(512) DEFAULT NULL,
  `app_id` varchar(64) DEFAULT NULL,
  `config` text,
  `create_by` varchar(64) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `update_by` varchar(64) DEFAULT NULL,
  `update_time` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- 转存表中的数据 `app_config`
--

INSERT INTO `app_config` (`id`, `name`, `type`, `status`, `environment`, `description`, `app_id`, `config`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES
('1980850854019145730', 'jeecgboot流水线配置', 'pipeline', 'enabled', 'dev', 'asas', NULL, '{\"0\":\"{\",\"1\":\"}\",\"stages\":[{\"id\":\"1761114612769-4d80da800a3458\",\"name\":\"goujian\",\"type\":\"build\",\"environment\":\"\",\"timeout\":30,\"retryCount\":0,\"script\":\"\"}],\"triggers\":[],\"variables\":[],\"notifications\":[]}', 'e9ca23d68d884d4ebb19d07889727dae', '2025-10-22 12:17:01', 'e9ca23d68d884d4ebb19d07889727dae', '2025-10-22 14:30:18');

--
-- 转储表的索引
--

--
-- 表的索引 `app_config`
--
ALTER TABLE `app_config`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_app_id` (`app_id`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_update_time` (`update_time`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
