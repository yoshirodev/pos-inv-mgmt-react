-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 14, 2026 at 08:41 PM
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

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

CREATE TABLE `inventory` (
  `id` int(11) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `selling_price` decimal(10,2) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `image_path` varchar(255) NOT NULL,
  `cost` int(11) NOT NULL,
  `category` varchar(1000) NOT NULL,
  `brand` varchar(1000) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `length` int(11) NOT NULL,
  `width` int(11) NOT NULL,
  `height` int(11) NOT NULL,
  `serial_number` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventory`
--

INSERT INTO `inventory` (`id`, `product_name`, `type`, `selling_price`, `quantity`, `image_path`, `cost`, `category`, `brand`, `created_at`, `updated_at`, `length`, `width`, `height`, `serial_number`) VALUES
(1, '5 Gal. Slim Container', 'container', 450.00, 57, '5galslimcontainer.webp', 0, '', '', NULL, NULL, 0, 0, 0, 0),
(2, '5 Gal. Round Container', 'container', 420.00, 21, '5galroundcontainer.jpg', 0, '', '', NULL, NULL, 0, 0, 0, 0),
(3, 'R.O Membranes', 'filter', 1200.00, 84, 'romembrane.jpg', 0, '', '', NULL, NULL, 0, 0, 0, 0),
(4, 'Flow Meters', 'equipment', 350.00, 98, 'flowmeters.jpg', 0, '', '', NULL, NULL, 0, 0, 0, 0),
(5, 'Pressure Gauge', 'equipment', 300.00, 64, 'pressuregauge.webp', 0, '', '', NULL, NULL, 0, 0, 0, 0),
(6, 'Filter Housing', 'filter', 650.00, 95, 'filterhousing.jpeg', 0, '', '', NULL, NULL, 0, 0, 0, 0),
(7, 'Sediment Filters', 'filter', 450.00, 90, 'sedimentfilters.jpg', 0, '', '', NULL, NULL, 0, 0, 0, 0),
(8, 'Booster Pumps', 'equipment', 3500.00, 100, 'boosterpumps.jpg', 0, '', '', NULL, NULL, 0, 0, 0, 0),
(9, 'Brine Tanks', 'container', 2500.00, 48, 'brinetanks.jpg', 0, '', '', NULL, NULL, 0, 0, 0, 0),
(10, 'Heat Gun', 'tool', 900.00, 100, 'heatgun.jpeg', 0, '', '', NULL, NULL, 0, 0, 0, 0),
(11, 'Filter Seals', 'parts', 80.00, 100, 'filterseals.jpg', 0, '', '', NULL, NULL, 0, 0, 0, 0),
(12, 'UV Lamps', 'filter', 1500.00, 99, 'uvlamps.jpeg', 0, '', '', NULL, NULL, 0, 0, 0, 0),
(14, 'TDS Meter', 'equipment', 700.00, 100, 'tdsmeter.png', 0, '', '', NULL, NULL, 0, 0, 0, 0),
(15, 'Plastic Container', 'container', 150.00, 180, '20x30plasticforcontainers.png', 0, '', '', NULL, NULL, 0, 0, 0, 0),
(34, 'Duck', 'toy', 100.00, 21, '1778699759840.jpg', 0, '', '', NULL, NULL, 0, 0, 0, 0),
(37, 'Kim Chaewon', 'dancer/singer', 99999999.99, 1, '1778783022441.jpg', 1000000, 'human', 'Le Sserafim', '2026-05-15 02:23:42', '2026-05-15 02:24:00', 30, 30, 180, 143),
(38, 'Hokazono Iroha', 'dancer/singer', 99999999.99, 1, '1778783173654.webp', 2147483647, 'human', 'ILLIT', '2026-05-15 02:26:13', '2026-05-15 02:26:13', 30, 30, 170, 14324);

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
  MODIFY `daily_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `logindata`
--
ALTER TABLE `logindata`
  MODIFY `accID` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `monthly_sales`
--
ALTER TABLE `monthly_sales`
  MODIFY `monthly_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `service_requests`
--
ALTER TABLE `service_requests`
  MODIFY `service_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transaction_log`
--
ALTER TABLE `transaction_log`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `weekly_sales`
--
ALTER TABLE `weekly_sales`
  MODIFY `weekly_id` int(11) NOT NULL AUTO_INCREMENT;

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
