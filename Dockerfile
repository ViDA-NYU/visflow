# Base image: LAMP server
FROM greyltc/lamp
#FROM janes/alpine-lamp
#FROM linode/lamp
#FROM fauria/lamp

LABEL maintainer="{jorgehpo, remi.rampin, yamuna, raonipd, bowen.yu}@nyu.edu"

ADD . /srv/http


WORKDIR /srv/http/server




# FROM fauria/lamp
# RUN  apt-get update \
#   && DEBIAN_FRONTEND=noninteractive apt-get install -y \
#     apache2 \
#     mysql-server \
#     php7.0 \
#     php7.0-bcmath \
#     php7.0-mcrypt
# COPY start-script.sh /root/
# RUN chmod +x /root/start-script.sh 
# CMD /root/start-script.sh
