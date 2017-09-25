#!/bin/bash

# Initializing mysql
service mysql start

if [ ! -f "/data/visflow/INITIALIZED_VOLUME.flag" ]; then
# Control will enter here if INITIALIZED_VOLUME.flag does not exists.
echo initializing container
touch /data/visflow/INITIALIZED_VOLUME.flag
cd /var/www/html/server
mysql -u root "-proot" < init-db.sql
./init.sh
chown -R www-data:www-data /data
fi

# Initializing Apache
#/usr/sbin/apache2ctl -D FOREGROUND
service apache2 start
/bin/bash

