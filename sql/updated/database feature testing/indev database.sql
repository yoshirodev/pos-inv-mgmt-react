-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 20, 2026 at 02:13 PM
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
-- Table structure for table `components`
--

CREATE TABLE `components` (
  `component_id` int(255) NOT NULL,
  `product_id` int(255) NOT NULL,
  `component_name` varchar(1000) NOT NULL,
  `description` varchar(1000) NOT NULL,
  `quantity` int(11) NOT NULL,
  `cost` int(11) NOT NULL,
  `selling_price` int(11) NOT NULL,
  `added_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `components`
--

INSERT INTO `components` (`component_id`, `product_id`, `component_name`, `description`, `quantity`, `cost`, `selling_price`, `added_by`) VALUES
(6, 1, 'Plastic Faucet / Spigot', 'Replacement faucet/spigot for 5-gallon slim container.', 87, 25, 45, 14),
(7, 1, 'Bottle Cap / Lid', 'Secure cap/lid for 5-gallon slim container.', 87, 10, 20, 14),
(8, 1, 'Rubber O-Ring', 'Rubber sealing O-ring for leak prevention.', 187, 5, 12, 14),
(9, 2, 'Plastic Faucet / Spigot', 'Replacement faucet/spigot for 5-gallon round container.', 96, 25, 45, 14),
(10, 2, 'Bottle Cap / Lid', 'Secure cap/lid for 5-gallon round container.', 96, 10, 20, 14),
(11, 2, 'Rubber O-Ring', 'Rubber sealing O-ring for leak prevention.', 196, 5, 12, 14),
(12, 3, 'O-Rings', 'Sealing O-rings for membrane housing.', 98, 8, 15, 14),
(13, 3, 'Flow Restrictor', 'Controls wastewater flow in reverse osmosis systems.', 48, 35, 65, 14),
(14, 3, 'Elbow Connectors', 'Plastic elbow connectors for tubing.', 96, 12, 25, 14),
(15, 4, 'Thread Seal Points / Sealing Rings', 'Sealing rings for flow meter fittings.', 94, 6, 15, 14),
(16, 4, 'Connector Joints', 'Connector joints for flow meter installation.', 69, 18, 35, 14),
(17, 5, 'Brass Connector', 'Durable brass connector for pressure gauges.', 46, 45, 85, 14),
(18, 5, 'Adapter Fittings', 'Adapter fittings for various pipe sizes.', 71, 20, 40, 14),
(19, 5, 'Isolation Valve', 'Valve used to isolate pressure gauge during maintenance.', 20, 80, 150, 14),
(20, 6, 'O-Ring Seal', 'Main O-ring seal for filter housing.', 99, 15, 30, 14),
(21, 6, 'Inlet/Outlet Ports', 'Replacement threaded inlet and outlet ports.', 39, 60, 110, 14),
(22, 7, 'O-Ring', 'Sealing O-ring for sediment filter housing.', 99, 5, 12, 14),
(23, 7, 'End Caps', 'Protective end caps for sediment filters.', 72, 12, 25, 14),
(24, 8, 'Pressure Switch', 'Automatic pressure switch for booster pumps.', 30, 120, 220, 14),
(25, 8, 'Tubing Connectors', 'Connectors for pump tubing installation.', 100, 10, 20, 14),
(26, 9, 'Float Valve', 'Controls water level in brine tanks.', 18, 150, 280, 14),
(27, 9, 'Brine Valve', 'Valve assembly for brine tank operation.', 18, 200, 350, 14),
(28, 9, 'Overflow Elbow', 'Elbow fitting for overflow drain connection.', 38, 25, 50, 14),
(29, 10, 'Nozzle Attachments', 'Interchangeable nozzles for heat gun applications.', 25, 90, 170, 14),
(30, 10, 'Power Cord', 'Replacement power cord for heat gun.', 20, 120, 220, 14),
(31, 11, 'O-Rings', 'Rubber O-rings for sealing filter systems.', 150, 5, 12, 14),
(32, 11, 'Gaskets', 'Flat gaskets for leak-proof sealing.', 100, 8, 18, 14),
(33, 12, 'Quartz Sleeve', 'Protective quartz sleeve for UV lamp.', 15, 450, 750, 14),
(34, 12, 'UV Ballast', 'Electrical ballast for UV lamp operation.', 10, 850, 1400, 14),
(35, 12, 'Lamp Holder', 'Socket and holder for UV lamps.', 20, 120, 220, 14),
(36, 14, 'Protective Cap', 'Protective cap for TDS meter sensor.', 50, 20, 40, 14),
(37, 14, 'Battery Compartment Cover', 'Replacement battery cover for TDS meter.', 25, 35, 65, 14);

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
  `description` varchar(255) DEFAULT NULL,
  `added_by` int(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventory`
--

INSERT INTO `inventory` (`id`, `product_name`, `type`, `selling_price`, `quantity`, `image_path`, `cost`, `category`, `brand`, `created_at`, `updated_at`, `length`, `width`, `height`, `serial_number`, `description`, `added_by`) VALUES
(1, '5 Gal. Slim Container', 'container', 450.00, 87, '5galslimcontainer.webp', 320, 'Water Storage', 'Pure Star', '2026-05-19 22:17:58', '2026-05-20 20:02:58', 28, 18, 45, 0, 'A slim 5-gallon plastic container used for storing water and household liquids. Durable, lightweight, and suitable for residential and commercial use.\n', 14),
(2, '5 Gal. Round Container', 'container', 420.00, 88, '5galroundcontainer.jpg', 300, 'Water Storage', 'Wilkins', '2026-05-19 22:17:58', '2026-05-19 23:45:32', 27, 27, 50, 0, 'A round 5-gallon water container commonly used for water refilling stations and dispensers in the Philippines. Made from reusable food-grade plastic material.\n', 14),
(3, 'R.O Membranes', 'filter', 1200.00, 80, 'romembrane.jpg', 850, 'Water Filtration', 'Vontron', '2026-05-19 22:17:58', '2026-05-20 20:02:58', 101, 10, 10, 0, 'Reverse osmosis membranes designed for water purification systems. Efficient in removing impurities, bacteria, and dissolved solids for safe drinking water.\n', 14),
(4, 'Flow Meters', 'equipment', 350.00, 92, 'flowmeters.jpg', 220, 'Water Supply Equipment', 'Asahi', '2026-05-19 22:17:58', '2026-05-20 00:49:17', 16, 8, 10, 0, 'A mechanical water flow meter used to measure water consumption accurately in residential and commercial water systems. Durable and easy to install.\n', 14),
(5, 'Pressure Gauge', 'equipment', 300.00, 56, 'pressuregauge.webp', 180, 'Water Pressure Equipment', 'Wika', '2026-05-19 22:17:58', '2026-05-19 23:45:32', 10, 5, 10, 0, 'A water pressure gauge used to monitor pressure levels in water systems and filtration equipment. Durable and accurate for residential and commercial applications.', 14),
(6, 'Filter Housing', 'filter', 650.00, 89, 'filterhousing.jpeg', 450, 'Water Filtration', 'Pentair', '2026-05-19 22:17:58', '2026-05-19 23:45:32', 35, 12, 12, 0, 'A transparent filter housing designed to hold sediment and carbon filters for water purification systems. Made from durable plastic with easy installation features.\n', 14),
(7, 'Sediment Filters', 'filter', 450.00, 87, 'sedimentfilters.jpg', 280, 'Water Filtration', 'AquaPlus', '2026-05-19 22:17:58', '2026-05-20 01:38:57', 25, 7, 7, 0, 'Sediment filters used to remove dirt, rust, sand, and other particles from water systems. Ideal for improving water quality and protecting filtration equipment.\n', 14),
(8, 'Booster Pumps', 'equipment', 3500.00, 100, 'boosterpumps.jpg', 2500, 'Water Pump Equipment', 'Grundfos', '2026-05-19 22:17:58', '2026-05-19 23:45:32', 40, 20, 25, 0, 'A high-pressure booster pump used to improve water flow and pressure in residential and commercial water systems. Energy-efficient and built for continuous operation.\n', 14),
(9, 'Brine Tanks', 'container', 2500.00, 98, 'brinetanks.jpg', 1800, 'Water Filtration Equipment', 'Poly Tank', '2026-05-19 22:17:58', '2026-05-19 23:45:32', 120, 35, 35, 0, 'A durable brine tank used in water softener and filtration systems for storing salt or brine solution. Made from corrosion-resistant polyethylene material suitable for residential and commercial applications.\n', 14),
(10, 'Heat Gun', 'tool', 900.00, 100, 'heatgun.jpeg', 650, 'Electrical Tools', 'Makita', '2026-05-19 22:17:58', '2026-05-19 23:46:00', 0, 8, 21, 0, 'A portable electric heat gun used for pipe fitting, plastic welding, paint removal, and heat shrinking applications. Designed for reliable heating performance and continuous use.\n', 14),
(11, 'Filter Seals', 'parts', 80.00, 100, 'filterseals.jpg', 45, 'Water Filter Parts', 'Aqua Flo', '2026-05-19 22:17:58', '2026-05-19 23:46:00', 10, 10, 1, 0, 'High-quality rubber filter seals used to prevent leaks in water filtration systems. Flexible, durable, and resistant to pressure and chemical exposure.\n\n', 14),
(12, 'UV Lamps', 'filter', 1500.00, 97, 'uvlamps.jpeg', 1100, 'UV Water Purification', 'Agua Topone', '2026-05-19 22:17:58', '2026-05-19 23:46:00', 90, 8, 8, 0, ' A UV sterilization lamp system designed to eliminate bacteria and microorganisms in water treatment systems. Suitable for residential and commercial water purification setups.\n\n', 14),
(14, 'TDS Meter', 'equipment', 700.00, 98, 'tdsmeter.png', 450, 'Water Testing Equipment', 'HM Digital', '2026-05-19 22:17:58', '2026-05-19 23:46:00', 15, 3, 2, 0, 'A digital TDS meter used to measure the total dissolved solids in water. Ideal for checking water purity and monitoring filtration system performance in residential and commercial setups.\n', 14),
(15, '100 pcs Plastic Container', 'container', 150.00, 179, '20x30plasticforcontainers.png', 90, 'Storage Containers', 'Robton Industries', '2026-05-19 22:17:58', '2026-05-19 23:46:00', 30, 25, 10, 0, 'A simple plastic cover/bag used to protect or wrap containers for storage. Durable, lightweight, and used mainly for covering purposes.', 14);

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

--
-- Dumping data for table `service_requests`
--

INSERT INTO `service_requests` (`service_id`, `name`, `address`, `phone_no`, `email`, `service_ordered`, `status`, `created_at`, `price`, `perso_id`) VALUES
(1, 'Juan Dela Cruz', 'Calamba, Laguna', '09171234567', 'juan@mail.com', 'Membrane Cleaning', 'Done', '2026-05-19 16:46:36', 1200, 4),
(2, 'Maria Santos', 'San Pablo, Laguna', '09281234567', 'maria@mail.com', 'Repair and Upgrades', 'Done', '2026-05-19 16:46:36', 2500, NULL),
(3, 'Pedro Reyes', 'Sta. Rosa, Laguna', '09351234567', 'pedro@mail.com', 'Supply and Install Water Stations', 'Done', '2026-05-19 16:46:36', 5000, 3),
(10, 'tQ3GFfew', 'faefasfsadfsdf', '3255533515315', 'fsaAFSAf@gmail.com', 'Membrane Cleaning', 'Done', '2026-05-19 13:57:35', 3000, 4),
(11, '421214214', '21412124', '214214214', '1242114@gmail.com', 'Repair and Upgrades', 'Done', '2026-05-19 13:57:45', 2500, 3),
(12, '324324432', '32432424', '4322432', '43224@fdsad.com', 'Membrane Cleaning', 'Done', '2026-05-19 14:00:36', 3000, 2),
(13, 'rqwqrrr', 'qrqwrqrw', '5235325325', 'qrwrqqr@gmail.com', 'Repair and Upgrades', 'Done', '2026-05-19 14:36:25', 2500, 3);

-- --------------------------------------------------------

--
-- Table structure for table `transaction_log`
--

CREATE TABLE `transaction_log` (
  `log_id` int(11) NOT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `timestamp` datetime DEFAULT current_timestamp(),
  `product_name` text DEFAULT NULL,
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
(1, 'CP-2471284192641094', '2026-05-19 03:00:50', '5 Gal. Slim Container (x4), Filter Housing (x5), TDS Meter (x2)', 11, 586.36, 6450.00, 'Cash', 7000.00, 550.00, NULL, 14, NULL),
(2, 'CP-17791750938277745', '2026-05-19 15:18:13', '5 Gal. Round Container (x4)', 4, 497.00, 1988.00, 'Cash', 2000.00, 12.00, NULL, 14, NULL),
(3, 'OP-43543545435345', '2026-05-19 15:18:51', 'Pressure Gauge (x4), Brine Tanks (x2)', 6, 1443.33, 8660.00, 'GCash', 9000.00, 340.00, NULL, 14, NULL),
(4, 'CP-17791991005799270', '2026-05-19 21:58:20', 'Repair and Upgrades', 1, 2500.00, 2500.00, 'Cash', 5500.00, 3000.00, NULL, 14, 11),
(5, 'OP-414141242142141241', '2026-05-19 22:01:03', 'Membrane Cleaning', 1, 3000.00, 3000.00, 'GCash', 3000.00, 0.00, NULL, 14, 12),
(6, 'CP-17792014032887039', '2026-05-19 22:36:43', 'Repair and Upgrades', 1, 2500.00, 2500.00, 'Cash', 2500.00, 0.00, NULL, 14, 13),
(7, 'CP-17792040003293330', '2026-05-19 23:20:00', '5 Gal. Slim Container (x5) [Plastic Faucet / Spigot, Bottle Cap / Lid, Rubber O-Ring], 100 pcs Plastic Container (x1), Filter Housing (x1) [O-Ring Seal, Inlet/Outlet Ports]', 7, 510.71, 3575.00, 'Cash', 4000.00, 425.00, NULL, 14, NULL),
(8, 'CP-17792040362152362', '2026-05-19 23:20:36', 'Pressure Gauge (x1) [Isolation Valve]', 1, 450.00, 450.00, 'Cash', 500.00, 50.00, NULL, 14, NULL),
(9, 'CP-17792044177972066', '2026-05-19 23:26:57', 'Flow Meters (x2) [Thread Seal Points / Sealing Rings, Connector Joints], Sediment Filters (x1) [O-Ring, End Caps]', 3, 429.00, 1287.00, 'Cash', 2000.00, 713.00, NULL, 14, NULL),
(20, 'CP-17792093578707821', '2026-05-20 00:49:17', 'Flow Meters (x4) [Thread Seal Points / Sealing Rings, Connector Joints]', 4, 400.00, 1600.00, 'Cash', 2000.00, 400.00, NULL, 14, NULL),
(21, 'CP-17792093882619444', '2026-05-20 00:49:48', 'Supply and Install Water Stations', 1, 5000.00, 5000.00, 'Cash', 5000.00, 0.00, NULL, 14, 3),
(22, 'CP-17792122394088538', '2026-05-20 01:37:19', 'Membrane Cleaning', 1, 1200.00, 1200.00, 'Cash', 2000.00, 800.00, NULL, 14, 1),
(23, 'OP-21412412414421', '2026-05-20 01:38:29', '5 Gal. Slim Container (x5) [Plastic Faucet / Spigot, Bottle Cap / Lid, Rubber O-Ring]', 5, 527.00, 2635.00, 'GCash', 2653.00, 18.00, NULL, 14, NULL),
(24, 'CP-17792123379777599', '2026-05-20 01:38:57', 'R.O Membranes (x2) [Elbow Connectors], Sediment Filters (x2) [End Caps]', 4, 850.00, 3400.00, 'Cash', 4000.00, 600.00, NULL, 14, NULL),
(25, 'CP-17792785784238575', '2026-05-20 20:02:58', '5 Gal. Slim Container (x3) [Plastic Faucet / Spigot, Bottle Cap / Lid, Rubber O-Ring], R.O Membranes (x2) [O-Rings, Flow Restrictor, Elbow Connectors]', 5, 838.20, 4191.00, 'Cash', 5000.00, 809.00, NULL, 14, NULL);




CREATE TABLE `activity_log` (
  `activity_id` int(11) NOT NULL,
  `description` text NOT NULL,
  `inventory_id` int(11) DEFAULT NULL,
  `transaction_id` int(11) DEFAULT NULL,
  `components_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
--
-- Indexes for dumped tables
--

--
-- Indexes for table `components`
--
ALTER TABLE `components`
  ADD PRIMARY KEY (`component_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `added_by` (`added_by`);

--
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_inventory_added_by` (`added_by`);

--
-- Indexes for table `logindata`
--
ALTER TABLE `logindata`
  ADD PRIMARY KEY (`accID`);

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
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `components`
--
ALTER TABLE `components`
  MODIFY `component_id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `logindata`
--
ALTER TABLE `logindata`
  MODIFY `accID` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `service_personel`
--
ALTER TABLE `service_personel`
  MODIFY `perso_id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `service_requests`
--
ALTER TABLE `service_requests`
  MODIFY `service_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `transaction_log`
--
ALTER TABLE `transaction_log`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `components`
--
ALTER TABLE `components`
  ADD CONSTRAINT `added_by` FOREIGN KEY (`added_by`) REFERENCES `logindata` (`accID`),
  ADD CONSTRAINT `product_id` FOREIGN KEY (`product_id`) REFERENCES `inventory` (`id`);

--
-- Constraints for table `inventory`
--
ALTER TABLE `inventory`
  ADD CONSTRAINT `fk_inventory_added_by` FOREIGN KEY (`added_by`) REFERENCES `logindata` (`accID`) ON DELETE SET NULL ON UPDATE CASCADE;

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

-- Indexes for dumped tables
--

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`activity_id`),
  ADD KEY `fk_activity_inventory` (`inventory_id`),
  ADD KEY `fk_activity_transaction` (`transaction_id`),
  ADD KEY `fk_activity_component` (`components_id`),
  ADD KEY `fk_activity_user` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `activity_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD CONSTRAINT `fk_activity_component` FOREIGN KEY (`components_id`) REFERENCES `components` (`component_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_activity_inventory` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_activity_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `transaction_log` (`log_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_activity_user` FOREIGN KEY (`user_id`) REFERENCES `logindata` (`accID`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
