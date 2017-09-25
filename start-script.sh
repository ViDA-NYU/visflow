#!/bin/bash

# Initializing mysql
# Starting mysql server
service mysql start

if [ ! -f "/data/visflow/INITIALIZED_VOLUME.flag" ]; then
# Control will enter here if INITIALIZED_VOLUME.flag does not exists.
echo Initializing container...
touch /data/visflow/INITIALIZED_VOLUME.flag
cd /var/www/html/server
mysql -u root "-proot" < init-db.sql
./init.sh
chown -R www-data:www-data /data
fi

# Initializing python relay server
echo Starting python GRPC relay server...
python2 server/GRPC_TA2_TA3/TA3.py  &

# Initializing Apache
#/usr/sbin/apache2ctl -D FOREGROUND
echo Starting apache2 server
service apache2 start
/bin/bash

