# Installing ubuntu base
FROM ubuntu:16.04

LABEL maintainer="{jorgehpo, remi.rampin, yamuna, raonipd, bowen.yu}@nyu.edu"

# Update apt-get local index
RUN apt-get -qq update

# installing apt-utils
# RUN apt-get install -y --no-install-recommends apt-utils

# installing build essentials and git
RUN apt-get install -y build-essential git

# installing java
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y  software-properties-common && \
    add-apt-repository ppa:webupd8team/java -y && \
    apt-get update && \
    echo oracle-java7-installer shared/accepted-oracle-license-v1-1 select true | /usr/bin/debconf-set-selections && \
    apt-get install -y oracle-java8-installer && \
    apt-get clean

# avoid prompt messages
RUN export DEBIAN_FRONTEND=noninteractive

# install apache and wget
RUN apt-get -y install wget curl unzip apache2 apache2-utils

# install mySQL server
RUN echo "mysql-server mysql-server/root_password password root" |  debconf-set-selections
RUN echo "mysql-server mysql-server/root_password_again password root" |  debconf-set-selections
RUN apt-get install -y mysql-server

#RUN mysql_secure_installation



# Installing Nodejs
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs


# Installing mySQL client
RUN apt-get install mysql-client

WORKDIR /visflow

ADD . /visflow



# Installing gulp and bower
RUN npm install -g gulp
RUN npm install -g bower


# enabling root mode in bower
RUN echo '{ "allow_root": true }' > /root/.bowerrc


# Installing client dependencies
RUN npm install
RUN bower install

# Build VisFlow web and its documentation.
RUN gulp build
RUN gulp build-doc


# Initializing the DB and the demo data and diagrams:
# WORKDIR visflow
# WORKDIR server
# RUN mysql -u root -p < init-db.sql
# RUN ./init.sh


# Make port 80 available to the world outside this container
EXPOSE 80