GRANT ALL PRIVILEGES ON `db_auth`.* TO 'admin'@'127.0.0.1';
GRANT ALL PRIVILEGES ON `db_catalog`.* TO 'admin'@'127.0.0.1';
GRANT ALL PRIVILEGES ON `db_orders`.* TO 'admin'@'127.0.0.1';
GRANT ALL PRIVILEGES ON `db_support`.* TO 'admin'@'127.0.0.1';

GRANT ALL PRIVILEGES ON `db_auth`.* TO 'admin'@'localhost';
GRANT ALL PRIVILEGES ON `db_catalog`.* TO 'admin'@'localhost';
GRANT ALL PRIVILEGES ON `db_orders`.* TO 'admin'@'localhost';
GRANT ALL PRIVILEGES ON `db_support`.* TO 'admin'@'localhost';

GRANT CREATE, DROP, ALTER, REFERENCES ON *.* TO 'admin'@'127.0.0.1';
GRANT CREATE, DROP, ALTER, REFERENCES ON *.* TO 'admin'@'localhost';

FLUSH PRIVILEGES;
