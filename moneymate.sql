-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.28 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             11.3.0.6295
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for moneymate
CREATE DATABASE IF NOT EXISTS `moneymate` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `moneymate`;

-- Dumping structure for table moneymate.account_transfers
CREATE TABLE IF NOT EXISTS `account_transfers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `from_account_id` bigint unsigned NOT NULL,
  `to_account_id` bigint unsigned NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `transfer_date` date NOT NULL,
  `note` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `account_transfers_user_id_foreign` (`user_id`),
  KEY `account_transfers_from_account_id_foreign` (`from_account_id`),
  KEY `account_transfers_to_account_id_foreign` (`to_account_id`),
  CONSTRAINT `account_transfers_from_account_id_foreign` FOREIGN KEY (`from_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `account_transfers_to_account_id_foreign` FOREIGN KEY (`to_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `account_transfers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table moneymate.account_transfers: ~2 rows (approximately)
/*!40000 ALTER TABLE `account_transfers` DISABLE KEYS */;
/*!40000 ALTER TABLE `account_transfers` ENABLE KEYS */;

-- Dumping structure for table moneymate.bank_accounts
CREATE TABLE IF NOT EXISTS `bank_accounts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `bank_name_id` bigint unsigned NOT NULL,
  `account_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `balance` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bank_accounts_user_id_foreign` (`user_id`),
  KEY `bank_accounts_bank_name_id_foreign` (`bank_name_id`),
  CONSTRAINT `bank_accounts_bank_name_id_foreign` FOREIGN KEY (`bank_name_id`) REFERENCES `bank_names` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `bank_accounts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table moneymate.bank_accounts: ~3 rows (approximately)
/*!40000 ALTER TABLE `bank_accounts` DISABLE KEYS */;
INSERT INTO `bank_accounts` (`id`, `user_id`, `bank_name_id`, `account_name`, `account_number`, `balance`, `created_at`, `updated_at`) VALUES
	(9, 1, 23, 'Mehrab Hossain', '10102121323203232121', 50000.00, '2023-08-18 10:31:08', '2023-08-18 23:23:59'),
	(10, 1, 24, 'Mehrab Hossain', '122313412312123', 0.00, '2023-08-18 10:31:28', '2023-08-18 23:23:46'),
	(11, 1, 25, 'Eden Springs Homes Rental LLC', '34123314123123', 0.00, '2023-08-18 10:31:56', '2023-08-18 23:23:40');
/*!40000 ALTER TABLE `bank_accounts` ENABLE KEYS */;

-- Dumping structure for table moneymate.bank_names
CREATE TABLE IF NOT EXISTS `bank_names` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `bank_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bank_names_user_id_foreign` (`user_id`),
  CONSTRAINT `bank_names_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table moneymate.bank_names: ~3 rows (approximately)
/*!40000 ALTER TABLE `bank_names` DISABLE KEYS */;
INSERT INTO `bank_names` (`id`, `user_id`, `bank_name`, `created_at`, `updated_at`) VALUES
	(23, 1, 'Emirate NBD(Personal current account)', '2023-08-18 10:29:57', '2023-08-18 10:29:57'),
	(24, 1, 'CBD(Business Account)', '2023-08-18 10:30:13', '2023-08-18 10:30:13'),
	(25, 1, 'Mashreq NEO(Business account)', '2023-08-18 10:30:32', '2023-08-18 10:30:32');
/*!40000 ALTER TABLE `bank_names` ENABLE KEYS */;

-- Dumping structure for table moneymate.borrows
CREATE TABLE IF NOT EXISTS `borrows` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `amount` decimal(10,2) NOT NULL,
  `debt_id` bigint unsigned NOT NULL,
  `account_id` bigint unsigned NOT NULL,
  `date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `borrows_debt_id_foreign` (`debt_id`),
  KEY `borrows_account_id_foreign` (`account_id`),
  CONSTRAINT `borrows_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `borrows_debt_id_foreign` FOREIGN KEY (`debt_id`) REFERENCES `debts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table moneymate.borrows: ~0 rows (approximately)
/*!40000 ALTER TABLE `borrows` DISABLE KEYS */;
/*!40000 ALTER TABLE `borrows` ENABLE KEYS */;

-- Dumping structure for table moneymate.budgets
CREATE TABLE IF NOT EXISTS `budgets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `budget_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `updated_amount` decimal(10,2) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `user_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `budgets_user_id_foreign` (`user_id`),
  CONSTRAINT `budgets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table moneymate.budgets: ~1 rows (approximately)
/*!40000 ALTER TABLE `budgets` DISABLE KEYS */;
INSERT INTO `budgets` (`id`, `budget_name`, `amount`, `updated_amount`, `start_date`, `end_date`, `created_at`, `updated_at`, `user_id`) VALUES
	(2, 'First Year Budget', 200000.00, 200000.00, '2023-07-01', '2024-06-30', '2023-08-18 13:50:08', '2023-08-18 23:30:38', 1);
/*!40000 ALTER TABLE `budgets` ENABLE KEYS */;

-- Dumping structure for table moneymate.budget_category
CREATE TABLE IF NOT EXISTS `budget_category` (
  `budget_id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`budget_id`,`category_id`),
  KEY `budget_category_category_id_foreign` (`category_id`),
  CONSTRAINT `budget_category_budget_id_foreign` FOREIGN KEY (`budget_id`) REFERENCES `budgets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `budget_category_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table moneymate.budget_category: ~1 rows (approximately)
/*!40000 ALTER TABLE `budget_category` DISABLE KEYS */;
INSERT INTO `budget_category` (`budget_id`, `category_id`) VALUES
	(2, 24),
	(2, 27),
	(2, 28),
	(2, 29),
	(2, 31);
/*!40000 ALTER TABLE `budget_category` ENABLE KEYS */;

-- Dumping structure for table moneymate.budget_expenses
CREATE TABLE IF NOT EXISTS `budget_expenses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `budget_id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `budget_expenses_user_id_foreign` (`user_id`),
  KEY `budget_expenses_budget_id_foreign` (`budget_id`),
  KEY `budget_expenses_category_id_foreign` (`category_id`),
  CONSTRAINT `budget_expenses_budget_id_foreign` FOREIGN KEY (`budget_id`) REFERENCES `budgets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `budget_expenses_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `budget_expenses_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table moneymate.budget_expenses: ~1 rows (approximately)
/*!40000 ALTER TABLE `budget_expenses` DISABLE KEYS */;
INSERT INTO `budget_expenses` (`id`, `user_id`, `budget_id`, `category_id`, `amount`, `created_at`, `updated_at`) VALUES
	(1, 1, 2, 24, 2130.00, '2023-08-18 13:50:13', '2023-08-18 13:50:13');
/*!40000 ALTER TABLE `budget_expenses` ENABLE KEYS */;

-- Dumping structure for table moneymate.categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('income','expense') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `categories_user_id_foreign` (`user_id`),
  CONSTRAINT `categories_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table moneymate.categories: ~6 rows (approximately)
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` (`id`, `user_id`, `name`, `type`, `created_at`, `updated_at`) VALUES
	(24, 1, 'Pantheon Elysee-1 (121)', 'expense', '2023-08-17 10:40:14', '2023-08-18 10:37:11'),
	(25, 1, 'Pantheon Elysee-1 (121)', 'income', '2023-08-17 22:36:09', '2023-08-18 10:52:26'),
	(26, 1, 'Satwa Villa', 'income', '2023-08-18 10:52:40', '2023-08-18 10:52:40'),
	(27, 1, 'Satwa Villa', 'expense', '2023-08-18 10:57:14', '2023-08-18 10:57:14'),
	(28, 1, 'Back Office', 'expense', '2023-08-18 10:57:32', '2023-08-18 10:57:37'),
	(29, 1, 'License', 'expense', '2023-08-18 10:57:46', '2023-08-18 10:57:46'),
	(30, 1, 'Hor Al Anaz Villa', 'income', '2023-08-18 23:23:00', '2023-08-18 23:23:00'),
	(31, 1, 'Hor Al Anaz Villa', 'expense', '2023-08-18 23:23:07', '2023-08-18 23:23:07');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;

-- Dumping structure for table moneymate.debts
CREATE TABLE IF NOT EXISTS `debts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `account_id` bigint unsigned NOT NULL,
  `type` enum('lend','repayment','borrow','debt-collection') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `person` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `note` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `debts_user_id_foreign` (`user_id`),
  KEY `debts_account_id_foreign` (`account_id`),
  CONSTRAINT `debts_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `debts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table moneymate.debts: ~0 rows (approximately)
/*!40000 ALTER TABLE `debts` DISABLE KEYS */;
/*!40000 ALTER TABLE `debts` ENABLE KEYS */;

-- Dumping structure for table moneymate.debt_collections
CREATE TABLE IF NOT EXISTS `debt_collections` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `amount` decimal(10,2) NOT NULL,
  `debt_id` bigint unsigned NOT NULL,
  `account_id` bigint unsigned NOT NULL,
  `date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `debt_collections_debt_id_foreign` (`debt_id`),
  KEY `debt_collections_account_id_foreign` (`account_id`),
  CONSTRAINT `debt_collections_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `debt_collections_debt_id_foreign` FOREIGN KEY (`debt_id`) REFERENCES `debts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table moneymate.debt_collections: ~0 rows (approximately)
/*!40000 ALTER TABLE `debt_collections` DISABLE KEYS */;
/*!40000 ALTER TABLE `debt_collections` ENABLE KEYS */;

-- Dumping structure for table moneymate.expenses
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `account_id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `refundable_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `refunded_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `reference` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expense_date` date DEFAULT NULL,
  `note` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `attachment` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `expenses_user_id_foreign` (`user_id`),
  KEY `expenses_account_id_foreign` (`account_id`),
  KEY `expenses_category_id_foreign` (`category_id`),
  CONSTRAINT `expenses_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `expenses_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `expenses_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table moneymate.expenses: ~1 rows (approximately)
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;

-- Dumping structure for table moneymate.failed_jobs
CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table moneymate.failed_jobs: ~0 rows (approximately)
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;

-- Dumping structure for table moneymate.incomes
CREATE TABLE IF NOT EXISTS `incomes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `account_id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `reference` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `income_date` date DEFAULT NULL,
  `note` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `attachment` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `incomes_user_id_foreign` (`user_id`),
  KEY `incomes_account_id_foreign` (`account_id`),
  KEY `incomes_category_id_foreign` (`category_id`),
  CONSTRAINT `incomes_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `incomes_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `incomes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table moneymate.incomes: ~1 rows (approximately)
/*!40000 ALTER TABLE `incomes` DISABLE KEYS */;
/*!40000 ALTER TABLE `incomes` ENABLE KEYS */;

-- Dumping structure for table moneymate.investments
CREATE TABLE IF NOT EXISTS `investments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `investor_id` bigint unsigned NOT NULL,
  `added_by` bigint unsigned NOT NULL,
  `account_id` bigint unsigned NOT NULL,
  `amount` double(10,2) NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `investment_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table moneymate.investments: ~0 rows (approximately)
/*!40000 ALTER TABLE `investments` DISABLE KEYS */;
/*!40000 ALTER TABLE `investments` ENABLE KEYS */;

-- Dumping structure for table moneymate.lends
CREATE TABLE IF NOT EXISTS `lends` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `amount` decimal(10,2) NOT NULL,
  `debt_id` bigint unsigned NOT NULL,
  `account_id` bigint unsigned NOT NULL,
  `date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lends_debt_id_foreign` (`debt_id`),
  KEY `lends_account_id_foreign` (`account_id`),
  CONSTRAINT `lends_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lends_debt_id_foreign` FOREIGN KEY (`debt_id`) REFERENCES `debts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table moneymate.lends: ~0 rows (approximately)
/*!40000 ALTER TABLE `lends` DISABLE KEYS */;
/*!40000 ALTER TABLE `lends` ENABLE KEYS */;

-- Dumping structure for table moneymate.migrations
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table moneymate.migrations: ~33 rows (approximately)
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
	(1, '2014_10_12_000000_create_users_table', 1),
	(2, '2014_10_12_100000_create_password_reset_tokens_table', 1),
	(3, '2014_10_12_100000_create_password_resets_table', 1),
	(4, '2019_08_19_000000_create_failed_jobs_table', 1),
	(5, '2019_12_14_000001_create_personal_access_tokens_table', 1),
	(6, '2023_05_09_165554_create_bank_names_table', 1),
	(7, '2023_05_10_013504_create_categories_table', 1),
	(8, '2023_05_10_093447_create_bank_accounts_table', 1),
	(9, '2023_05_10_093453_create_incomes_table', 1),
	(10, '2023_05_10_093458_create_expenses_table', 1),
	(11, '2023_05_10_093508_add_user_id_to_tables', 1),
	(12, '2023_05_12_213817_add_profile_pictire_to_users_table', 1),
	(13, '2023_05_16_100804_add_additional_fields_to_incomes_table', 1),
	(14, '2023_05_17_101320_create_options_table', 1),
	(15, '2023_05_20_153108_create_budget_table', 1),
	(16, '2023_05_20_153322_budget_category', 1),
	(17, '2023_05_21_012355_add_user_id_to_budgets', 1),
	(18, '2023_05_21_015617_create_budget_expenses_table', 1),
	(19, '2023_05_21_090112_add_additional_columns_to_expenses_table', 1),
	(20, '2023_05_21_095557_create_permission_tables', 1),
	(21, '2023_05_26_133931_create_wallets_table', 1),
	(22, '2023_05_27_161852_create_debts_table', 1),
	(23, '2023_05_27_163118_create_lends_table', 1),
	(24, '2023_05_27_163135_create_repayments_table', 1),
	(25, '2023_05_27_163144_create_borrows_table', 1),
	(26, '2023_05_27_163157_create_debt_collections_table', 1),
	(27, '2023_06_07_190243_add_column_to_borrows_table', 1),
	(28, '2023_06_07_190300_add_column_to_lends_table', 1),
	(29, '2023_06_09_123346_add_account_id_to_repayments_table', 1),
	(30, '2023_06_09_123417_add_account_id_to_debt_collections_table', 1),
	(31, '2023_06_09_185224_create_account_transfer_table', 1),
	(32, '2023_06_27_140832_create_subscriptions_table', 2),
	(35, '2023_08_17_103013_update_expance_table', 3),
	(37, '2023_08_17_151605_create_investments_table', 4),
	(38, '2023_08_18_184054_refactor_investment_table', 5);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;

-- Dumping structure for table moneymate.model_has_roles
CREATE TABLE IF NOT EXISTS `model_has_roles` (
  `role_id` bigint unsigned NOT NULL,
  `model_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`),
  CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table moneymate.model_has_roles: ~21 rows (approximately)
/*!40000 ALTER TABLE `model_has_roles` DISABLE KEYS */;
INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`) VALUES
	(1, 'App\\Models\\User', 1),
	(1, 'App\\Models\\User', 2),
	(1, 'App\\Models\\User', 3),
	(1, 'App\\Models\\User', 4),
	(1, 'App\\Models\\User', 5),
	(1, 'App\\Models\\User', 13),
	(1, 'App\\Models\\User', 14),
	(1, 'App\\Models\\User', 15),
	(1, 'App\\Models\\User', 16),
	(1, 'App\\Models\\User', 17),
	(1, 'App\\Models\\User', 18),
	(1, 'App\\Models\\User', 19),
	(1, 'App\\Models\\User', 20),
	(1, 'App\\Models\\User', 21),
	(1, 'App\\Models\\User', 22),
	(1, 'App\\Models\\User', 23),
	(1, 'App\\Models\\User', 24),
	(1, 'App\\Models\\User', 25),
	(1, 'App\\Models\\User', 26),
	(1, 'App\\Models\\User', 27),
	(1, 'App\\Models\\User', 28);
/*!40000 ALTER TABLE `model_has_roles` ENABLE KEYS */;

-- Dumping structure for table moneymate.options
CREATE TABLE IF NOT EXISTS `options` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `value` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table moneymate.options: ~13 rows (approximately)
/*!40000 ALTER TABLE `options` DISABLE KEYS */;
INSERT INTO `options` (`id`, `key`, `value`, `created_at`, `updated_at`) VALUES
	(1, 'company_name', 'EDEN SPRINGS HOMES RENTAL L.L.C', '2023-06-14 02:29:57', '2023-08-18 23:22:19'),
	(2, 'web_site', 'https://esholiday.com', '2023-06-14 02:29:57', '2023-08-18 23:22:19'),
	(3, 'default_currency', 'AED', '2023-06-14 02:29:57', '2023-08-18 23:22:19'),
	(4, 'phone', '0551258910', '2023-06-14 02:29:57', '2023-08-18 23:22:19'),
	(5, 'address', '118 Naif Street - Deira - Dubai', '2023-06-14 02:29:57', '2023-08-18 23:22:19'),
	(6, 'num_data_per_page', '30', '2023-06-14 17:59:56', '2023-08-18 23:22:19'),
	(7, 'public_key', NULL, '2023-06-24 20:28:05', '2023-08-18 23:22:19'),
	(8, 'secret_key', NULL, '2023-06-24 20:28:05', '2023-08-18 23:22:19'),
	(9, 'registration_type', 'free', '2023-06-24 21:30:29', '2023-07-17 05:47:18'),
	(10, 'subscription_price', '100', '2023-06-24 22:49:41', '2023-06-24 22:58:46'),
	(11, 'product_api_id', NULL, '2023-06-27 23:13:48', '2023-08-18 23:22:19'),
	(12, 'product_price', '30', '2023-07-04 22:41:17', '2023-07-05 13:13:17'),
	(13, 'product_id', '', '2023-07-04 22:41:17', '2023-07-04 22:41:17');
/*!40000 ALTER TABLE `options` ENABLE KEYS */;

-- Dumping structure for table moneymate.password_resets
CREATE TABLE IF NOT EXISTS `password_resets` (
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  KEY `password_resets_email_index` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table moneymate.password_resets: ~0 rows (approximately)
/*!40000 ALTER TABLE `password_resets` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_resets` ENABLE KEYS */;

-- Dumping structure for table moneymate.password_reset_tokens
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table moneymate.password_reset_tokens: ~0 rows (approximately)
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;

-- Dumping structure for table moneymate.personal_access_tokens
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table moneymate.personal_access_tokens: ~7 rows (approximately)
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
	(1, 'App\\Models\\User', 1, 'AdminToken', 'a481b39912951902a01f64843d3f8be1cbb0e58657bd2002b1b39bcf1001bad2', '["admin"]', '2023-07-16 15:54:58', NULL, '2023-07-16 12:40:45', '2023-07-16 15:54:58'),
	(3, 'App\\Models\\User', 1, 'AdminToken', 'cb5a50f6500fab136a2e32b0cedd6bb9701118988da5c74376140f5d3a9f14c9', '["admin"]', '2023-07-17 05:47:18', NULL, '2023-07-17 05:33:12', '2023-07-17 05:47:18'),
	(4, 'App\\Models\\User', 1, 'AdminToken', '7949d18d3d65c32e33672aa14d34ddf0cf53946c90d52d7d4defdc7644b15b06', '["admin"]', '2023-07-18 07:46:26', NULL, '2023-07-18 07:43:52', '2023-07-18 07:46:26'),
	(5, 'App\\Models\\User', 1, 'AdminToken', '199d53c9afdae05a519806cb2cf1ae285748feca29c1307d3c8cf9ad59f3a03a', '["admin"]', '2023-07-18 07:47:46', NULL, '2023-07-18 07:47:08', '2023-07-18 07:47:46'),
	(6, 'App\\Models\\User', 1, 'AdminToken', 'a241a27257e8367f209002d847f51a6605c4034b3081910dbc9cd009b764853b', '["admin"]', '2023-07-18 07:49:18', NULL, '2023-07-18 07:48:35', '2023-07-18 07:49:18'),
	(7, 'App\\Models\\User', 1, 'AdminToken', '23819c8957c769f85676db4428760f9d57f5be79f9728482aeff4ac091230853', '["admin"]', '2023-08-17 13:27:32', NULL, '2023-08-17 09:57:11', '2023-08-17 13:27:32'),
	(12, 'App\\Models\\User', 1, 'AdminToken', '9f254792d0568165bf88452952ff0e0474a9e138a1a4fbdc94f0348bef256822', '["admin"]', '2023-08-18 22:10:30', NULL, '2023-08-17 21:12:40', '2023-08-18 22:10:30'),
	(13, 'App\\Models\\User', 1, 'AdminToken', '8b319778e52b601490b30c0153322e028aba8ff9871a3ec4547ba9fdd508da0d', '["admin"]', '2023-08-18 23:34:24', NULL, '2023-08-18 22:14:50', '2023-08-18 23:34:24');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;

-- Dumping structure for table moneymate.repayments
CREATE TABLE IF NOT EXISTS `repayments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `amount` decimal(10,2) NOT NULL,
  `debt_id` bigint unsigned NOT NULL,
  `account_id` bigint unsigned NOT NULL,
  `date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `repayments_debt_id_foreign` (`debt_id`),
  KEY `repayments_account_id_foreign` (`account_id`),
  CONSTRAINT `repayments_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `repayments_debt_id_foreign` FOREIGN KEY (`debt_id`) REFERENCES `debts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table moneymate.repayments: ~0 rows (approximately)
/*!40000 ALTER TABLE `repayments` DISABLE KEYS */;
/*!40000 ALTER TABLE `repayments` ENABLE KEYS */;

-- Dumping structure for table moneymate.subscriptions
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `stripe_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `plan` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `current_period_start` timestamp NULL DEFAULT NULL,
  `current_period_end` timestamp NULL DEFAULT NULL,
  `amount` decimal(8,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `subscriptions_user_id_foreign` (`user_id`),
  CONSTRAINT `subscriptions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table moneymate.subscriptions: ~0 rows (approximately)
/*!40000 ALTER TABLE `subscriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscriptions` ENABLE KEYS */;

-- Dumping structure for table moneymate.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `profile_picture` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_as` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user' COMMENT 'user, admin',
  `remember_token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table moneymate.users: ~5 rows (approximately)
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `name`, `email`, `profile_picture`, `email_verified_at`, `password`, `role_as`, `remember_token`, `created_at`, `updated_at`) VALUES
	(1, 'Mehrab Hossain', 'hossainmehraab@gmail.com', NULL, NULL, '$2y$10$DJ.ePHwlgLkxtoWMziN9sufoBVbz4EFyoYraO.x7kaNfp5X69TymC', 'admin', NULL, '2023-06-12 14:47:21', '2023-08-18 10:36:30'),
	(2, 'Hanif', 'hanif@eden.com', NULL, NULL, '$2y$10$u/lEu90VyhtXEFwkvVGVbu18pGC0iESKsokq.F2.CiUVh.PNnozx6', 'user', NULL, '2023-08-18 10:34:42', '2023-08-18 10:34:42'),
	(3, 'Selim', 'selim@eden.com', NULL, NULL, '$2y$10$D1yO7hMhZLY7qOUqc7KeUejoMbPvSD2S78Sk17WXUzkYoo64z0yBO', 'user', NULL, '2023-08-18 10:35:12', '2023-08-18 10:35:12'),
	(4, 'Kamal', 'kamal@eden.com', NULL, NULL, '$2y$10$zz0qWBGWe1lQLadD5gF1jO/KRGHfggMRdg26rd93rvLDAtOMum5iy', 'user', NULL, '2023-08-18 10:35:36', '2023-08-18 10:35:36'),
	(5, 'Jashim', 'jashim@eden.com', NULL, NULL, '$2y$10$ZB6EwY2i1cIRm35DfgRdQOWh6MHJGrVuAGbospodqYfjcpAx2MSMS', 'user', NULL, '2023-08-18 10:35:57', '2023-08-18 10:35:57');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;

-- Dumping structure for table moneymate.wallets
CREATE TABLE IF NOT EXISTS `wallets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `balance` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `wallets_user_id_foreign` (`user_id`),
  CONSTRAINT `wallets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table moneymate.wallets: ~0 rows (approximately)
/*!40000 ALTER TABLE `wallets` DISABLE KEYS */;
/*!40000 ALTER TABLE `wallets` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
