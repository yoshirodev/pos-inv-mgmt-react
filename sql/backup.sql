-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 13, 2026 at 11:49 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `waterapp`
--

-- --------------------------------------------------------

--
-- Table structure for table `daily_sales`
--

CREATE TABLE `daily_sales` (
  `daily_id` int(11) NOT NULL,
  `sales_date` date DEFAULT NULL,
  `total_transactions` int(11) DEFAULT NULL,
  `total_items_sold` int(11) DEFAULT NULL,
  `total_revenue` decimal(12,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `daily_sales`
--

INSERT INTO `daily_sales` (`daily_id`, `sales_date`, `total_transactions`, `total_items_sold`, `total_revenue`) VALUES
(3, '2026-03-11', 5, 111, 9100.00),
(4, '2026-03-12', 2, 2, 4950.00),
(5, '2026-03-13', 1, 5, 2250.00),
(6, '2026-04-25', 4, 65, 38300.00),
(7, '2026-04-30', 3, 35, 214400.00),
(8, '2026-05-08', 1, 5, 2250.00),
(9, '2026-05-09', 10, 124, 166380.00),
(129, '2026-05-11', 1, 6, 7200.00);

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

CREATE TABLE `inventory` (
  `id` int(11) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `cost` decimal(10,2) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `image_path` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventory`
--

INSERT INTO `inventory` (`id`, `product_name`, `type`, `cost`, `quantity`, `image_path`) VALUES
(1, '5 Gal. Slim Container', 'container', 450.00, 77, '5galslimcontainer.webp'),
(2, '5 Gal. Round Container', 'container', 420.00, 21, '5galroundcontainer.jpg'),
(3, 'R.O Membranes', 'filter', 1200.00, 84, 'romembrane.jpg'),
(4, 'Flow Meters', 'equipment', 350.00, 98, 'flowmeters.jpg'),
(5, 'Pressure Gauge', 'equipment', 300.00, 64, 'pressuregauge.webp'),
(6, 'Filter Housing', 'filter', 650.00, 100, 'filterhousing.jpeg'),
(7, 'Sediment Filters', 'filter', 450.00, 100, 'sedimentfilters.jpg'),
(8, 'Booster Pumps', 'equipment', 3500.00, 100, 'boosterpumps.jpg'),
(9, 'Brine Tanks', 'container', 2500.00, 48, 'brinetanks.jpg'),
(10, 'Heat Gun', 'tool', 900.00, 100, 'heatgun.jpeg'),
(11, 'Filter Seals', 'parts', 80.00, 100, 'filterseals.jpg'),
(12, 'UV Lamps', 'filter', 1500.00, 99, 'uvlamps.jpeg'),
(14, 'TDS Meter', 'equipment', 700.00, 100, 'tdsmeter.png'),
(15, 'Plastic Container', 'container', 150.00, 180, '20x30plasticforcontainers.png');

-- --------------------------------------------------------

--
-- Table structure for table `logindata`
--

CREATE TABLE `logindata` (
  `accID` int(100) NOT NULL,
  `lastname` varchar(100) NOT NULL,
  `firstname` varchar(100) NOT NULL,
  `middlename` varchar(100) NOT NULL,
  `birthdate` date NOT NULL,
  `gender` varchar(100) NOT NULL,
  `phonenumber` varchar(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `userpassword` varchar(200) NOT NULL,
  `accountType` varchar(100) NOT NULL,
  `username` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `logindata`
--

INSERT INTO `logindata` (`accID`, `lastname`, `firstname`, `middlename`, `birthdate`, `gender`, `phonenumber`, `email`, `userpassword`, `accountType`, `username`) VALUES
(11, 'Rodriguez', 'Yoshiki', '', '2006-03-04', 'Male', '992-724-246', 'yoshiki.rodriguez@unc.edu.ph', '$2y$10$s0/Th.ixC9Ykw5gsIXb4ZOWOGeWLvY7eH.mmssXUeoRBbNjzlXJxq', 'Manager', 'yoshi'),
(12, 'Gasilla', 'Zier Damerick', 'Tible', '2006-11-11', 'Male', '992-724-246', 'zierdamerick.gasilla@unc.edu.ph', '$2y$10$14IetAScbMgkEMSTW25k2uBDJ0jimR7fc4KlQfue5LicSNSGzMF/G', 'Employee', 'zier'),
(14, 'Boncodin', 'Kyle Mitchel', 'Test', '2026-03-05', 'Male', '992-835-567', 'kylemitchel.boncodin@unc.edu.ph', '$2y$10$cp5fmfWyx3UNJf/PPIfZ.eD/qQhajqvrqfP/VkfhrNZgl4q9xj5TO', 'Manager', 'bom');

-- --------------------------------------------------------

--
-- Table structure for table `monthly_sales`
--

CREATE TABLE `monthly_sales` (
  `monthly_id` int(11) NOT NULL,
  `year` int(11) DEFAULT NULL,
  `month` int(11) DEFAULT NULL,
  `total_transactions` int(11) DEFAULT NULL,
  `total_items_sold` int(11) DEFAULT NULL,
  `total_revenue` decimal(12,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `monthly_sales`
--

INSERT INTO `monthly_sales` (`monthly_id`, `year`, `month`, `total_transactions`, `total_items_sold`, `total_revenue`) VALUES
(1, 2026, 3, 8, 118, 16300.00),
(2, 2026, 4, 7, 100, 252700.00),
(3, 2026, 5, 12, 135, 175830.00);

-- --------------------------------------------------------

--
-- Table structure for table `service_requests`
--

CREATE TABLE `service_requests` (
  `service_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `address` varchar(150) NOT NULL,
  `phone_no` varchar(30) NOT NULL,
  `email` varchar(150) NOT NULL,
  `service_ordered` varchar(100) NOT NULL,
  `status` enum('Pending','Done') DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `price` double NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `service_requests`
--

INSERT INTO `service_requests` (`service_id`, `name`, `address`, `phone_no`, `email`, `service_ordered`, `status`, `created_at`, `price`) VALUES
(2, 'Person Test', 'Address Test', '09123456789', 'testemail@gmail.com', 'Rehab of Media Filters', 'Done', '2026-03-12 18:21:57', 4500),
(3, 'Person 2', 'wfafAWF', '43441', 'zierdamerick.gasilla@unc.edu.ph', 'Repair and Upgrades', 'Done', '2026-04-25 15:32:34', 2500),
(4, 'Person 1', '21421412414214241', '12421442', 'yoshiki.rodriguez@gmail.com', 'Membrane Cleaning', 'Done', '2026-04-25 15:38:08', 3000),
(5, 'Person Test', '214214124214', '214214214', 'rem.balatan@unc.edu.ph', 'Dual Membrane Upgrade', 'Done', '2026-04-25 15:38:40', 18000),
(10, '41141414', '21421421421', '1421421421', '214214@gmail.com', 'Dual Membrane Upgrade', 'Done', '2026-05-08 15:35:19', 18000);

-- --------------------------------------------------------

--
-- Table structure for table `transaction_log`
--

CREATE TABLE `transaction_log` (
  `log_id` int(11) NOT NULL,
  `reference_number` int(100) DEFAULT NULL,
  `timestamp` datetime DEFAULT current_timestamp(),
  `product_name` varchar(100) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `amount_paid` decimal(10,2) DEFAULT NULL,
  `change_amount` decimal(10,2) DEFAULT NULL,
  `inventory_id` int(11) DEFAULT NULL,
  `processed_by` int(11) DEFAULT NULL,
  `service_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transaction_log`
--

INSERT INTO `transaction_log` (`log_id`, `reference_number`, `timestamp`, `product_name`, `quantity`, `price`, `subtotal`, `payment_method`, `amount_paid`, `change_amount`, `inventory_id`, `processed_by`, `service_id`) VALUES
(100, 100, '2026-03-11 23:04:20', 'Database Test', 100, 100.00, 100.00, 'Cash', 100.00, 0.00, NULL, NULL, NULL),
(101, 0, '2026-03-11 23:24:38', '5 Gal. Slim Container', 5, 450.00, 2250.00, 'Cash', 3000.00, 750.00, 1, NULL, NULL),
(102, 2147483647, '2026-03-11 23:26:09', '5 Gal. Slim Container', 1, 450.00, 450.00, 'GCash', 450.00, 0.00, 1, NULL, NULL),
(103, 2147483647, '2026-03-11 23:27:47', 'UV Lamps', 1, 1500.00, 1500.00, 'Maya', 1500.00, 0.00, 12, NULL, NULL),
(104, 0, '2026-03-11 23:40:32', 'R.O Membranes', 4, 1200.00, 4800.00, 'Cash', 5000.00, 200.00, 3, NULL, NULL),
(105, 0, '2026-03-13 03:00:26', 'Rehab of Media Filters', 1, 4500.00, 4500.00, 'Cash', 5000.00, 500.00, NULL, NULL, NULL),
(106, 0, '2026-03-13 03:15:39', '5 Gal. Slim Container', 1, 450.00, 450.00, 'Cash', 500.00, 50.00, 1, NULL, NULL),
(107, 0, '2026-03-13 14:07:39', '5 Gal. Slim Container', 5, 450.00, 2250.00, 'Cash', 3000.00, 750.00, 1, NULL, NULL),
(108, 0, '2026-04-25 22:35:38', '5 Gal. Round Container', 20, 420.00, 8400.00, 'Cash', 10000.00, 1600.00, 2, NULL, NULL),
(109, 0, '2026-04-25 22:37:06', '5 Gal. Round Container', 20, 420.00, 8400.00, 'Cash', 10000.00, 1600.00, 2, NULL, NULL),
(110, 0, '2026-04-25 22:37:25', 'Brine Tanks', 5, 2500.00, 12500.00, 'Cash', 50000.00, 37500.00, 9, NULL, NULL),
(111, 0, '2026-04-25 23:10:36', '5 Gal. Slim Container', 20, 450.00, 9000.00, 'Cash', 9000.00, 0.00, 1, NULL, NULL),
(112, 0, '2026-04-30 14:20:47', 'Rehab of Media Filters', 1, 4500.00, 4500.00, 'Cash', 5000.00, 500.00, NULL, NULL, NULL),
(113, 0, '2026-04-30 14:23:03', 'Supply and Install Water Stations', 1, 200000.00, 200000.00, 'Cash', 1000000.00, 800000.00, NULL, NULL, NULL),
(114, 0, '2026-04-30 14:28:05', 'Pressure Gauge', 33, 300.00, 9900.00, 'Cash', 10000.00, 100.00, 5, NULL, NULL),
(115, 0, '2026-05-08 23:18:22', '5 Gal. Slim Container', 5, 450.00, 2250.00, 'Cash', 10000.00, 7750.00, 1, NULL, NULL),
(116, 0, '2026-05-09 19:42:17', '5 Gal. Slim Container', 6, 450.00, 2700.00, 'Cash', 3000.00, 300.00, 1, NULL, NULL),
(117, 421214124, '2026-05-09 19:43:59', 'Brine Tanks', 43, 2500.00, 107500.00, 'Cash', 200000.00, 85300.00, 9, NULL, NULL),
(118, 421214124, '2026-05-09 19:43:59', 'R.O Membranes', 6, 1200.00, 7200.00, 'Cash', 200000.00, 85300.00, 3, NULL, NULL),
(119, 0, '2026-05-09 19:44:36', 'Plastic Container', 20, 150.00, 3000.00, 'Cash', 3000.00, 0.00, 15, NULL, NULL),
(120, 0, '2026-05-09 19:45:01', '5 Gal. Round Container', 33, 420.00, 13860.00, 'Cash', 30000.00, 5240.00, 2, NULL, NULL),
(121, 0, '2026-05-09 19:45:01', 'Brine Tanks', 4, 2500.00, 10000.00, 'Cash', 30000.00, 5240.00, 9, NULL, NULL),
(122, 0, '2026-05-09 19:45:01', 'Pressure Gauge', 3, 300.00, 900.00, 'Cash', 30000.00, 5240.00, 5, NULL, NULL),
(123, 0, '2026-05-09 20:45:37', 'Flow Meters', 2, 350.00, 700.00, 'Cash', 1000.00, 300.00, 4, NULL, NULL),
(124, 0, '2026-05-09 20:53:23', '5 Gal. Round Container', 6, 420.00, 2520.00, 'Cash', 3000.00, 480.00, 2, NULL, NULL),
(125, 0, '2026-05-09 21:07:58', 'Dual Membrane Upgrade', 1, 18000.00, 18000.00, 'Cash', 20000.00, 2000.00, NULL, NULL, NULL),
(126, NULL, '2026-05-11 14:08:48', 'R.O Membranes', 6, 1200.00, 7200.00, 'Cash', 10000.00, 2800.00, 3, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `weekly_sales`
--

CREATE TABLE `weekly_sales` (
  `weekly_id` int(11) NOT NULL,
  `year` int(11) DEFAULT NULL,
  `week_number` int(11) DEFAULT NULL,
  `total_transactions` int(11) DEFAULT NULL,
  `total_items_sold` int(11) DEFAULT NULL,
  `total_revenue` decimal(12,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `weekly_sales`
--

INSERT INTO `weekly_sales` (`weekly_id`, `year`, `week_number`, `total_transactions`, `total_items_sold`, `total_revenue`) VALUES
(1, 2026, 11, 8, 118, 16300.00),
(2, 2026, 17, 4, 65, 38300.00),
(3, 2026, 18, 3, 35, 214400.00),
(4, 2026, 19, 11, 129, 168630.00),
(73, 2026, 20, 1, 6, 7200.00);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `daily_sales`
--
ALTER TABLE `daily_sales`
  ADD PRIMARY KEY (`daily_id`),
  ADD UNIQUE KEY `sales_date` (`sales_date`);

--
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `logindata`
--
ALTER TABLE `logindata`
  ADD PRIMARY KEY (`accID`);

--
-- Indexes for table `monthly_sales`
--
ALTER TABLE `monthly_sales`
  ADD PRIMARY KEY (`monthly_id`),
  ADD UNIQUE KEY `year_month` (`year`,`month`);

--
-- Indexes for table `service_requests`
--
ALTER TABLE `service_requests`
  ADD PRIMARY KEY (`service_id`);

--
-- Indexes for table `transaction_log`
--
ALTER TABLE `transaction_log`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `fk_txlog_inventory` (`inventory_id`),
  ADD KEY `fk_txlog_processed_by` (`processed_by`),
  ADD KEY `fk_txlog_service` (`service_id`);

--
-- Indexes for table `weekly_sales`
--
ALTER TABLE `weekly_sales`
  ADD PRIMARY KEY (`weekly_id`),
  ADD UNIQUE KEY `year_week` (`year`,`week_number`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `daily_sales`
--
ALTER TABLE `daily_sales`
  MODIFY `daily_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=146;

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `logindata`
--
ALTER TABLE `logindata`
  MODIFY `accID` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `monthly_sales`
--
ALTER TABLE `monthly_sales`
  MODIFY `monthly_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `service_requests`
--
ALTER TABLE `service_requests`
  MODIFY `service_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `transaction_log`
--
ALTER TABLE `transaction_log`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=127;

--
-- AUTO_INCREMENT for table `weekly_sales`
--
ALTER TABLE `weekly_sales`
  MODIFY `weekly_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `transaction_log`
--
ALTER TABLE `transaction_log`
  ADD CONSTRAINT `fk_txlog_inventory` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_txlog_processed_by` FOREIGN KEY (`processed_by`) REFERENCES `logindata` (`accID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_txlog_service` FOREIGN KEY (`service_id`) REFERENCES `service_requests` (`service_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transaction_log_ibfk_1` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`id`),
  ADD CONSTRAINT `transaction_log_ibfk_2` FOREIGN KEY (`processed_by`) REFERENCES `logindata` (`accID`),
  ADD CONSTRAINT `transaction_log_ibfk_3` FOREIGN KEY (`service_id`) REFERENCES `service_requests` (`service_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
