#!/bin/bash
service mysql start
cd /var/www/html/server
mysql -u root "-proot" < init-db.sql
chmod +x init.sh
./init.sh
/usr/sbin/apache2ctl -D FOREGROUND
