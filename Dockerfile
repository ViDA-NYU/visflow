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

# Required by NIST to build Python in our image, needed for their evaluation process
RUN apt-get install -y build-essential libncursesw5-dev libreadline6-dev libssl-dev libgdbm-dev libc6-dev libsqlite3-dev tk-dev libbz2-dev zlib1g-dev

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


#RUN mkdir -p server/GRPC_TA2_TA3
WORKDIR server/GRPC_TA2_TA3
# Installing python dependencies
ADD server/GRPC_TA2_TA3/requirements.txt .
RUN pip install -r requirements.txt

# Installing Node Relay Server dependencies
# Creating nonroot user (node doesn't install properly with root)
RUN useradd nonroot -m -s /bin/bash
ADD server/GRPC_TA2_TA3/package.json .
RUN cp package.json /home/nonroot
USER nonroot
WORKDIR /home/nonroot
RUN npm install
USER root
RUN cp -r /home/nonroot/node_modules /var/www/html/server/GRPC_TA2_TA3/

WORKDIR /var/www/html/

# Copying visflow to apache folder
ADD . /var/www/html/

# Build visflow
RUN gulp build-dev && gulp build-doc

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

