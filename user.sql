/*
 Navicat Premium Data Transfer

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 50159
 Source Host           : localhost:3306
 Source Schema         : user

 Target Server Type    : MySQL
 Target Server Version : 50159
 File Encoding         : 65001

 Date: 21/03/2020 11:58:51
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for root
-- ----------------------------
DROP TABLE IF EXISTS `__admin`;
CREATE TABLE `__admin`  (
  `pwd` varchar(20) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  primary key (pwd)
) ENGINE = InnoDB CHARACTER SET = latin1 COLLATE = latin1_swedish_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of root
-- ----------------------------
INSERT INTO `__admin` VALUES ('123456');

-- ----------------------------
-- Table structure for student
-- ----------------------------
DROP TABLE IF EXISTS `__student`;
CREATE TABLE `__student`  (
  `id` int(11) primary key auto_increment NOT NULL ,
  `student_id` varchar(12) NOT NULL ,
  `pwd` varchar(20) NOT NULL ,
  `student_name` varchar(20) NULL DEFAULT NULL
) ENGINE = InnoDB CHARACTER SET = utf8 ROW_FORMAT = Compact;

-- ----------------------------
-- Records of student
-- ----------------------------
-- ----------------------------
-- Table structure for teacher
-- ----------------------------
DROP TABLE IF EXISTS `__teacher`;
CREATE TABLE `__teacher`  (
  `id` int(11) primary key auto_increment NOT NULL ,
  `teacher_id` varchar(12) NOT NULL ,
  `pwd` varchar(20) NOT NULL ,
  `teacher_name` varchar(20) NULL DEFAULT NULL
) ENGINE = InnoDB CHARACTER SET = utf8 ROW_FORMAT = Compact;


SET FOREIGN_KEY_CHECKS = 1;
