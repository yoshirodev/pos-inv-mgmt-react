-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 17, 2026 at 02:18 PM
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
  `serial_number` int(11) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventory`
--

INSERT INTO `inventory` (`id`, `product_name`, `type`, `selling_price`, `quantity`, `image_path`, `cost`, `category`, `brand`, `created_at`, `updated_at`, `length`, `width`, `height`, `serial_number`, `description`) VALUES
(1, '5 Gal. Slim Container', 'container', 450.00, 57, '5galslimcontainer.webp', 320, 'Water Storage', 'Pure Star', NULL, '2026-05-16 23:19:57', 28, 18, 45, 0, 'A slim 5-gallon plastic container used for storing water and household liquids. Durable, lightweight, and suitable for residential and commercial use.\n'),
(2, '5 Gal. Round Container', 'container', 420.00, 21, '5galroundcontainer.jpg', 300, 'Water Storage', 'Wilkins', NULL, '2026-05-16 23:20:08', 27, 27, 50, 0, 'A round 5-gallon water container commonly used for water refilling stations and dispensers in the Philippines. Made from reusable food-grade plastic material.\n'),
(3, 'R.O Membranes', 'filter', 1200.00, 84, 'romembrane.jpg', 850, 'Water Filtration', 'Vontron', NULL, '2026-05-16 23:20:18', 101, 10, 10, 0, 'Reverse osmosis membranes designed for water purification systems. Efficient in removing impurities, bacteria, and dissolved solids for safe drinking water.\n'),
(4, 'Flow Meters', 'equipment', 350.00, 98, 'flowmeters.jpg', 220, 'Water Supply Equipment', 'Asahi', NULL, '2026-05-16 23:20:31', 16, 8, 10, 0, 'A mechanical water flow meter used to measure water consumption accurately in residential and commercial water systems. Durable and easy to install.\n'),
(5, 'Pressure Gauge', 'equipment', 300.00, 64, 'pressuregauge.webp', 180, 'Water Pressure Equipment', 'Wika', NULL, '2026-05-16 23:14:47', 10, 5, 10, 0, 'A water pressure gauge used to monitor pressure levels in water systems and filtration equipment. Durable and accurate for residential and commercial applications.'),
(6, 'Filter Housing', 'filter', 650.00, 95, 'filterhousing.jpeg', 450, 'Water Filtration', 'Pentair', NULL, '2026-05-16 23:15:28', 35, 12, 12, 0, 'A transparent filter housing designed to hold sediment and carbon filters for water purification systems. Made from durable plastic with easy installation features.\n'),
(7, 'Sediment Filters', 'filter', 450.00, 90, 'sedimentfilters.jpg', 280, 'Water Filtration', 'AquaPlus', NULL, '2026-05-16 23:16:06', 25, 7, 7, 0, 'Sediment filters used to remove dirt, rust, sand, and other particles from water systems. Ideal for improving water quality and protecting filtration equipment.\n'),
(8, 'Booster Pumps', 'equipment', 3500.00, 100, 'boosterpumps.jpg', 2500, 'Water Pump Equipment', 'Grundfos', NULL, '2026-05-16 23:16:38', 40, 20, 25, 0, 'A high-pressure booster pump used to improve water flow and pressure in residential and commercial water systems. Energy-efficient and built for continuous operation.\n'),
(9, 'Brine Tanks', 'container', 2500.00, 48, 'brinetanks.jpg', 1800, 'Water Filtration Equipment', 'Poly Tank', NULL, '2026-05-16 23:17:11', 120, 35, 35, 0, 'A durable brine tank used in water softener and filtration systems for storing salt or brine solution. Made from corrosion-resistant polyethylene material suitable for residential and commercial applications.\n'),
(10, 'Heat Gun', 'tool', 900.00, 100, 'heatgun.jpeg', 650, 'Electrical Tools', 'Makita', NULL, '2026-05-16 23:17:39', 24, 8, 21, 0, 'A portable electric heat gun used for pipe fitting, plastic welding, paint removal, and heat shrinking applications. Designed for reliable heating performance and continuous use.\n'),
(11, 'Filter Seals', 'parts', 80.00, 100, 'filterseals.jpg', 45, 'Water Filter Parts', 'Aqua Flo', NULL, '2026-05-16 23:18:09', 10, 10, 1, 0, 'High-quality rubber filter seals used to prevent leaks in water filtration systems. Flexible, durable, and resistant to pressure and chemical exposure.\n\n'),
(12, 'UV Lamps', 'filter', 1500.00, 99, 'uvlamps.jpeg', 1100, 'UV Water Purification', 'Agua Topone', NULL, '2026-05-16 23:18:39', 90, 8, 8, 0, ' A UV sterilization lamp system designed to eliminate bacteria and microorganisms in water treatment systems. Suitable for residential and commercial water purification setups.\n\n'),
(14, 'TDS Meter', 'equipment', 700.00, 100, 'tdsmeter.png', 450, 'Water Testing Equipment', 'HM Digital', NULL, '2026-05-16 23:19:11', 15, 3, 2, 0, 'A digital TDS meter used to measure the total dissolved solids in water. Ideal for checking water purity and monitoring filtration system performance in residential and commercial setups.\n'),
(15, '100 p Plastic Container', 'container', 150.00, 180, '20x30plasticforcontainers.png', 90, 'Storage Containers', 'Robton Industries', NULL, '2026-05-16 23:54:35', 30, 25, 10, 0, 'A simple plastic cover/bag used to protect or wrap containers for storage. Durable, lightweight, and used mainly for covering purposes.'),
(34, 'Duck', 'toy', 100.00, 21, '1778699759840.jpg', 0, '', '', NULL, NULL, 0, 0, 0, 0, NULL),
(37, 'Kim Chaewon', 'dancer/singer', 99999999.99, 1, '1778783022441.jpg', 1000000, 'human', 'Le Sserafim', '2026-05-15 02:23:42', '2026-05-15 02:24:00', 30, 30, 180, 143, NULL),
(38, 'Hokazono Iroha', 'dancer/singer', 99999999.99, 1, '1778783173654.webp', 2147483647, 'human', 'ILLIT', '2026-05-15 02:26:13', '2026-05-15 02:26:13', 30, 30, 170, 14324, NULL);

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
-- Table structure for table `service_personel`
--

CREATE TABLE `service_personel` (
  `perso_id` int(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone_no` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `service_personel`
--

INSERT INTO `service_personel` (`perso_id`, `first_name`, `last_name`, `email`, `phone_no`) VALUES
(2, 'Stephen Carl', 'Parajes', 'stephencar.parajes@unc.edu.ph', '09123456789'),
(3, 'John Kevin', 'Bueza', 'johnkevin.bueza@unc.edu.ph', '09123456789'),
(4, 'Jason Sean', 'Barcela', 'jasonsean.barcela@unc.edu.ph', '09123456789');

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
  `price` double NOT NULL DEFAULT 0,
  `perso_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transaction_log`
--

CREATE TABLE `transaction_log` (
  `log_id` int(11) NOT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
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
-- Dumping data for table `weekly_sales`
--

INSERT INTO `weekly_sales` (`weekly_id`, `year`, `week_number`, `total_transactions`, `total_items_sold`, `total_revenue`) VALUES
(1, 2026, 20, 1, 1, 3000.00);

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
-- Indexes for table `service_personel`
--
ALTER TABLE `service_personel`
  ADD PRIMARY KEY (`perso_id`);

--
-- Indexes for table `service_requests`
--
ALTER TABLE `service_requests`
  ADD PRIMARY KEY (`service_id`),
  ADD KEY `perso_id` (`perso_id`);

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
-- AUTO_INCREMENT for table `service_personel`
--
ALTER TABLE `service_personel`
  MODIFY `perso_id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `service_requests`
--
ALTER TABLE `service_requests`
  MODIFY `service_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `transaction_log`
--
ALTER TABLE `transaction_log`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `weekly_sales`
--
ALTER TABLE `weekly_sales`
  MODIFY `weekly_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `service_requests`
--
ALTER TABLE `service_requests`
  ADD CONSTRAINT `perso_id` FOREIGN KEY (`perso_id`) REFERENCES `service_personel` (`perso_id`);

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
