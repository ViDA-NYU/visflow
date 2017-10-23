#!/bin/bash
# This is the entry script for the docker container. It is called from ta3_search, and is responsible for initializing apache, mysql and grpc-relay services.

# Setting mysql permissions
chown -R mysql:mysql /var/lib/mysql
# Starting mysql server
service mysql start
if [ ! -f "/data/visflow/INITIALIZED_VOLUME.flag" ]; then
  # Control will enter here if INITIALIZED_VOLUME.flag does not exists.
  echo Initializing container...
  touch /data/visflow/INITIALIZED_VOLUME.flag
  pushd .
  cd /var/www/html/server
  mysql -u root "-proot" < init-db.sql
  ./init.sh
  chown -R www-data:www-data /data
  popd
fi
# Initializing relay server
echo Starting GRPC relay server...
node server/GRPC_TA2_TA3/relay.js &
# Initializing Apache
echo Starting Apache2 server
service apache2 start
