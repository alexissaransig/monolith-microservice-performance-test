CREATE DATABASE newone;
DROP TABLE IF EXISTS `posts`;
CREATE TABLE `posts` (
  `thread` int(11) DEFAULT NULL,
  `text` varchar(11) DEFAULT NULL,
  `user` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
