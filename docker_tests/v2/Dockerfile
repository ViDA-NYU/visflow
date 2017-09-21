# Base image: Apache, PHP on Debian:jessie
FROM httpd:2.2

LABEL maintainer="{jorgehpo, remi.rampin, yamuna, raonipd, bowen.yu}@nyu.edu"

RUN apt-get update

# Installing php
RUN apt-get install -y php5 php5-curl php5-cli libapache2-mod-php5 php5-mysqlnd


# Installing build-essentials
RUN apt-get install -y build-essential

# Copying visflow to apache folder
WORKDIR /var/www/html/
ADD . /var/www/html/

RUN apt-get install vim -y

RUN a2enmod ssl
RUN a2enmod rewrite
RUN a2enmod headers

# Creating SSL files: csr and key
RUN openssl req -new -newkey rsa:2048 -nodes -out visflow.csr -keyout visflow.key -subj "/C=US/ST=/L=/O=NYU/CN=visflow"

# Creating crt file from csr and key
RUN openssl x509 -req -in visflow.csr -signkey visflow.key -out visflow.crt

# Appending apache configuration
RUN cat apache_conf_append.conf >> /usr/local/apache2/conf/httpd.conf

RUN service apache2 restart

EXPOSE 443