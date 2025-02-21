CREATE DATABASE chatbot_db;
USE chatbot_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nickname VARCHAR(20) NOT NULL,
    password VARCHAR(20) NOT NULL
);

SHOW TABLES;
select * from users;
show STATUS