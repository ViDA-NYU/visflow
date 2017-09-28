# Base image: Apache, PHP on Debian:jessie
FROM ubuntu:xenial

LABEL maintainer="{jorgehpo, remi.rampin, yamuna, raonipd, bowen.yu}@nyu.edu"

ENV GRPC_PORT 50051
ENV GRPC_HOST localhost

# Setting volume entrypoints, in case Docker Run does not use -v 
VOLUME ["/data/visflow", "/var/lib/mysql"]

# Updating package list
RUN apt-get update

# Installing apache2
RUN apt-get install -y apache2


# Installing MySQL
RUN echo "mysql-server-5.7 mysql-server/root_password password root" | debconf-set-selections
RUN echo "mysql-server-5.7 mysql-server/root_password_again password root" | debconf-set-selections
RUN apt-get install -y mysql-server-5.7
ADD my.cnf /etc/mysql/conf.d/my.cnf 


# Installing PHP
RUN apt-get install -y php7.0 php7.0-curl php7.0-cli libapache2-mod-php7.0 php7.0-mysqlnd

# Installing vim
RUN apt-get install -y vim

# Inistalling build-essential
RUN apt-get install -y build-essential 

# Installing python 
RUN apt-get install -y python2.7 python2.7-dev python-pip

# Upgrading pip
RUN pip install --upgrade pip

# # Copying visflow to apache folder
WORKDIR /var/www/html/
ADD . /var/www/html/


# Installing python dependencies
RUN pip install -r /var/www/html/server/GRPC_TA2_TA3/requirements.txt

# Installing curl and unzip
RUN apt-get install -y curl unzip

RUN chmod +x server/init.sh

RUN a2enmod ssl
RUN a2enmod rewrite
RUN a2enmod headers
RUN a2enmod proxy
RUN a2enmod proxy_wstunnel

RUN cp vhost.conf /etc/apache2/sites-available/000-default.conf

# Exposing HTTP
EXPOSE 80 

# Exposing websocket
EXPOSE 8888


# Moving executables to root directory
RUN mkdir d3m_executables
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

