-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- 主机： mysql:3306
-- 生成日期： 2025-10-23 00:00:00
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
-- 表的结构 `app_pipeline_binding`
--

CREATE TABLE `app_pipeline_binding` (
  `id` varchar(64) NOT NULL,
  `app_id` varchar(64) NOT NULL,
  `environment` varchar(32) NOT NULL,
  `job_name` varchar(128) NOT NULL,
  `job_url` varchar(256) DEFAULT NULL,
  `status` varchar(16) NOT NULL DEFAULT 'enabled',
  `create_by` varchar(64) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `update_by` varchar(64) DEFAULT NULL,
  `update_time` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- 转储表的索引
--

--
-- 表的索引 `app_pipeline_binding`
--
ALTER TABLE `app_pipeline_binding`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_app_id` (`app_id`),
  ADD KEY `idx_environment` (`environment`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_update_time` (`update_time`),
  ADD KEY `idx_app_env` (`app_id`,`environment`);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;