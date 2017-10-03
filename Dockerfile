# Base image: Apache, PHP on Debian:jessie
FROM ubuntu:xenial

LABEL maintainer="{jorgehpo, remi.rampin, yamuna, raonipd, bowen.yu}@nyu.edu"

ENV GRPC_PORT 50051
ENV GRPC_HOST localhost

# Setting volume entrypoints, in case they are not mounted
# VOLUME ["/data/visflow", "/var/lib/mysql"]

# Updating package list
RUN apt-get update

# Installing apache2
RUN apt-get install -y apache2

# Installing MySQL
RUN echo "mysql-server-5.7 mysql-server/root_password password root" | debconf-set-selections
RUN echo "mysql-server-5.7 mysql-server/root_password_again password root" | debconf-set-selections
RUN apt-get install -y mysql-server-5.7

# Installing PHP
RUN apt-get install -y php7.0 php7.0-curl php7.0-cli libapache2-mod-php7.0 php7.0-mysqlnd

# Installing build-essential
RUN apt-get install -y build-essential

# Installing various dependencies
RUN apt-get install -y curl unzip vim git openjdk-8-jre

# Install npm, gulp, bower
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g gulp bower

# Installing python
RUN apt-get install -y python2.7 python2.7-dev python-pip

# Upgrading pip
RUN pip install --upgrade pip

WORKDIR /var/www/html/

# Install JavaScript dependencies
ADD package.json .
RUN npm install
ADD bower.json .
RUN bower --allow-root install

# Installing python dependencies
RUN mkdir -p server/GRPC_TA2_TA3
ADD server/GRPC_TA2_TA3/requirements.txt server/GRPC_TA2_TA3/
RUN pip install -r /var/www/html/server/GRPC_TA2_TA3/requirements.txt

# Copying visflow to apache folder
ADD . /var/www/html/

# Build visflow
RUN gulp build && gulp build-doc

RUN chmod +x server/init.sh

# Copy configuration
ADD my.cnf /etc/mysql/conf.d/my.cnf
RUN cp vhost.conf /etc/apache2/sites-available/000-default.conf

RUN a2enmod ssl && \
    a2enmod rewrite && \
    a2enmod headers && \
    a2enmod proxy && \
    a2enmod proxy_wstunnel

# Exposing HTTP
EXPOSE 80

# Exposing websocket
EXPOSE 8888

# Moving executables to root directory
RUN mv start-script.sh /usr/local/bin/start-script.sh
RUN mv ta3_search /usr/local/bin/ta3_search

# Adding execute permissions
RUN chmod +x /usr/local/bin/ta3_search
RUN chmod +x /usr/local/bin/start-script.sh

# Running bash
CMD ["/bin/bash"]

# RUN: docker network create ta2ta3

# RUN: docker run -ti -p 80:80 -p 8888:8888 -v data:/data/visflow -v mysql:/var/lib/mysql -v data_d3m:/data/d3m -e GRPC_PORT='5005' --name ta3 --net ta2ta3 visflow

# RUN TAMU TA2: docker run -it -p 50051:5005 -v data_d3m:/data/d3m:rw --net ta2ta3 --name ta2 jhfjhfj1/tamuta2:latest

# RUN_OLD: docker run -ti -p 80:80 -p 8888:8888 -v data:/data/visflow -v mysql:/var/lib/mysql -v data_d3m:/data/d3m -e GRPC_PORT='5005' --name ta3 --net ta2ta3 visflow

