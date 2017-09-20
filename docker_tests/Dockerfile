# Base image: Apache, PHP on Debian:jessie
FROM php:7.0-apache

LABEL maintainer="{jorgehpo, remi.rampin, yamuna, raonipd, bowen.yu}@nyu.edu"

RUN apt-get update

# Installing Nodejs
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs


# installing build-essentials
RUN apt-get install -y build-essential

# Installing gulp and bower
RUN npm install -g gulp
RUN npm install -g bower

# Installing git
RUN apt-get install -y git-core

# Installing java
RUN apt-get install default-jre default-jdk -y

# Copying visflow to apache folder
WORKDIR /var/www/html/
ADD . /var/www/html/

RUN apt-get install vim -y

# =============================================================
# Everything has to be built before
#
# Enabling root mode in bower
# RUN echo '{ "allow_root": true }' > /root/.bowerrc
#
# Installing client dependencies
# RUN npm install
# RUN bower install

# Build VisFlow web and its documentation.
# RUN gulp build
# RUN gulp build-doc

# =============================================================

RUN a2enmod ssl
RUN a2enmod rewrite
RUN a2enmod headers


RUN openssl req -new -newkey rsa:2048 -nodes -out visflow.csr -keyout visflow.key -subj "/C=US/ST=/L=/O=NYU/CN=visflow"

RUN openssl x509 -req -in visflow.csr -signkey visflow.key -out visflow.crt

RUN cat apache_conf_append.conf >> /etc/apache2/apache2.conf


