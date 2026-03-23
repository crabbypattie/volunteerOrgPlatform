-- MySQL dump 10.13  Distrib 8.0.32, for Linux (x86_64)
--
-- Host: localhost    Database: Organizations
-- ------------------------------------------------------
-- Server version	8.0.32-0ubuntu0.22.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS Organizations;
USE Organizations;

DROP TABLE IF EXISTS `RSVP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `RSVP` (
  `rsvpID` bigint NOT NULL AUTO_INCREMENT,
  `userID` int NOT NULL,
  `eventID` bigint NOT NULL,
  `permission_response` bigint DEFAULT NULL,
  PRIMARY KEY (`rsvpID`),
  KEY `userID` (`userID`),
  KEY `eventID` (`eventID`),
  CONSTRAINT `RSVP_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`user_id`),
  CONSTRAINT `RSVP_ibfk_2` FOREIGN KEY (`eventID`) REFERENCES `events` (`eventID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RSVP`
--

LOCK TABLES `RSVP` WRITE;
/*!40000 ALTER TABLE `RSVP` DISABLE KEYS */;
INSERT INTO `RSVP` VALUES (1,3,1,1),(2,3,3,1),(3,3,2,1),(4,1,2,1);
/*!40000 ALTER TABLE `RSVP` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `eventID` bigint NOT NULL AUTO_INCREMENT,
  `organizationID` int NOT NULL,
  `eventName` varchar(255) NOT NULL,
  `eventDescription` varchar(255) DEFAULT NULL,
  `eventDate` datetime NOT NULL,
  `eventLocation` varchar(255) DEFAULT NULL,
  `type` enum('private','public') NOT NULL DEFAULT 'public',
  PRIMARY KEY (`eventID`),
  KEY `organizationID` (`organizationID`),
  CONSTRAINT `fk_organization` FOREIGN KEY (`organizationID`) REFERENCES `organizations` (`organization_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (1,1,'Helping Moms in the Street','Helping moms in the street on Monday','2024-08-06 00:00:00','Bonython Park','public'),(2,2,'Slapping People','Slapping people on Saturday','2024-09-05 00:00:00','Charles house','public'),(3,1,'Kissing me','CARLOS CHAN KISS ME','2024-09-06 00:00:00','My house','public');
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_users`
--

DROP TABLE IF EXISTS `oauth_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oauth_users` (
  `oauth_user_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `provider` varchar(50) NOT NULL,
  `provider_user_id` varchar(100) NOT NULL,
  PRIMARY KEY (`oauth_user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `oauth_users_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_users`
--

LOCK TABLES `oauth_users` WRITE;
/*!40000 ALTER TABLE `oauth_users` DISABLE KEYS */;
/*!40000 ALTER TABLE `oauth_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization_categories`
--

DROP TABLE IF EXISTS `organization_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organization_categories` (
  `categoryID` bigint NOT NULL AUTO_INCREMENT,
  `categoryName` varchar(255) NOT NULL,
  PRIMARY KEY (`categoryID`),
  UNIQUE KEY `unique_categoryName` (`categoryName`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization_categories`
--

LOCK TABLES `organization_categories` WRITE;
/*!40000 ALTER TABLE `organization_categories` DISABLE KEYS */;
INSERT INTO `organization_categories` VALUES (1,'Animal Welfare'),(2,'Arts & Culture'),(3,'Community Development'),(4,'Education'),(5,'Environmental'),(6,'Healthcare'),(7,'Human Rights'),(8,'Sports & Recreation'),(9,'Technology');
/*!40000 ALTER TABLE `organization_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization_managers`
--

DROP TABLE IF EXISTS `organization_managers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organization_managers` (
  `managerID` bigint NOT NULL AUTO_INCREMENT,
  `organizationID` int NOT NULL,
  `userID` int NOT NULL,
  PRIMARY KEY (`managerID`),
  KEY `organizationID` (`organizationID`),
  KEY `userID` (`userID`),
  CONSTRAINT `fk_org_manager_organization` FOREIGN KEY (`organizationID`) REFERENCES `organizations` (`organization_id`),
  CONSTRAINT `fk_org_manager_user` FOREIGN KEY (`userID`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization_managers`
--

LOCK TABLES `organization_managers` WRITE;
/*!40000 ALTER TABLE `organization_managers` DISABLE KEYS */;
INSERT INTO `organization_managers` VALUES (1,12,1),(2,13,1);
/*!40000 ALTER TABLE `organization_managers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization_members`
--

DROP TABLE IF EXISTS `organization_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organization_members` (
  `memberID` bigint NOT NULL AUTO_INCREMENT,
  `organizationID` int NOT NULL,
  `userID` int NOT NULL,
  PRIMARY KEY (`memberID`),
  KEY `organizationID` (`organizationID`),
  KEY `userID` (`userID`),
  CONSTRAINT `fk_org_member_organization` FOREIGN KEY (`organizationID`) REFERENCES `organizations` (`organization_id`),
  CONSTRAINT `fk_org_member_user` FOREIGN KEY (`userID`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization_members`
--

LOCK TABLES `organization_members` WRITE;
/*!40000 ALTER TABLE `organization_members` DISABLE KEYS */;
INSERT INTO `organization_members` VALUES (1,1,3),(2,2,3),(3,4,3),(4,7,3),(5,6,3),(6,2,1),(7,3,1),(8,1,1),(9,1,2),(10,12,1);
/*!40000 ALTER TABLE `organization_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organizations`
--

DROP TABLE IF EXISTS `organizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizations` (
  `organization_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `email` varchar(100) DEFAULT NULL,
  `categoryID` bigint DEFAULT NULL,
  `location_type` enum('onsite','remote','hybrid') NOT NULL DEFAULT 'onsite',
  PRIMARY KEY (`organization_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizations`
--

LOCK TABLES `organizations` WRITE;
/*!40000 ALTER TABLE `organizations` DISABLE KEYS */;
INSERT INTO `organizations` VALUES (1,'mami mami','i am a widow bjrottt','mamiditabrak@gamil.com',1,'onsite'),(2,'Helping Hands','We provide support to underprivileged communities.','contact@helpinghands.org',3,'onsite'),(3,'Green Earth','Our mission is to protect and restore the environment.','info@greenearth.org',5,'onsite'),(4,'Health First','Providing healthcare services to those in need.','support@healthfirst.org',6,'onsite'),(5,'Tech for Good','Leveraging technology to drive social change.','hello@techforgood.org',9,'onsite'),(6,'Arts Alive','Promoting arts and culture in local communities.','admin@artsalive.org',2,'onsite'),(7,'Animal Rescue Squad','Rescuing and rehabilitating abandoned animals.','rescue@arsquad.org',1,'onsite'),(8,'Right to Learn','Ensuring education for all children.','info@righttolearn.org',4,'onsite'),(9,'Play and Thrive','Promoting sports and recreational activities.','contact@playandthrive.org',8,'onsite'),(10,'Equal Rights Now','Advocating for human rights and social justice.','support@equalrightsnow.org',7,'onsite'),(11,'Entitled panda','No Descrpition, just panda','panda.entitled@gmail.com',1,'onsite'),(12,'YAMERO','Anythng is finne','apaya@gmail.com',3,'onsite'),(13,'','aaaa','QuackPanda@gmail.com',1,'onsite');
/*!40000 ALTER TABLE `organizations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `updates`
--

DROP TABLE IF EXISTS `updates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `updates` (
  `updateID` bigint NOT NULL AUTO_INCREMENT,
  `organizationID` int NOT NULL,
  `eventID` bigint NOT NULL,
  `public` tinyint(1) NOT NULL,
  `update_date` datetime NOT NULL,
  `update_description` text,
  PRIMARY KEY (`updateID`),
  KEY `organizationID` (`organizationID`),
  KEY `eventID` (`eventID`),
  CONSTRAINT `fk_update_event` FOREIGN KEY (`eventID`) REFERENCES `events` (`eventID`),
  CONSTRAINT `fk_update_organization` FOREIGN KEY (`organizationID`) REFERENCES `organizations` (`organization_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `updates`
--

LOCK TABLES `updates` WRITE;
/*!40000 ALTER TABLE `updates` DISABLE KEYS */;
/*!40000 ALTER TABLE `updates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `given_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `username` varchar(50) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `interests` varchar(255) DEFAULT NULL,
  `profile_photo` varchar(255) NOT NULL DEFAULT '/uploads/profile_pictures/anonymous.jpg',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'William','Cuang','a1843487','24445689','a1843487@adelaide.edu.au','$2b$10$qnCVmFT7INFvw9zRnODdc.OaYM5nc3TrI54zLdZitSBRfwW6bwGjy','Culture','/uploads/profile_pictures/a1843487.jpg'),(2,'WAWA','wawawa','wawa1212','223344','wawa@gmail.com','$2b$10$KRZv/8THGnJ/Bymdk3X6L.Ufdp.W/UttEn2u6JSN.bxtgFkfBkHFa','Culture','/uploads/profile_pictures/wawa1212.png'),(3,'Ani','Ani','ani123','0409657432','ani@gmail.com','$2b$10$m.quYzHTjfqGffRc/a0.t.1sRyIP9pnKcfU7AB4HhP4xyyIIzouxe','animal','/uploads/profile_pictures/ani123.jpeg'),(4,'Manis','Gups','mani12','0409657432','mani@gmail.com','$2b$10$E2V.NyxH9RR0.lKLv6oNAe17vjThFlt0DCV5vEZpsfCLIFJsajQd6','animal','/uploads/profile_pictures/anonymous.jpg');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-06-14 14:15:29
