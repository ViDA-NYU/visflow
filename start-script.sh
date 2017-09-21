#!/bin/bash
#service mysql start
#a2enmod ssl
#a2enmod rewrite
#a2enmod headers
chmod +x mysqld-wrapper
./mysqld-wrapper &
cd /var/www/html/server
mysql -u root "-proot" < init-db.sql
chmod +x init.sh
./init.sh
/usr/sbin/apache2ctl -D FOREGROUND
