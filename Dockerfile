FROM ubuntu:quantal
MAINTAINER unknownexception "unknownliveid@hotmail.com"

RUN apt-get update
RUN apt-get -y install dialog net-tools nano wget
RUN apt-get -y install software-properties-common python-software-properties python g++ make
RUN apt-get -y install git 
RUN add-apt-repository -y ppa:chris-lea/node.js
RUN apt-get update
RUN apt-get -y install nodejs
RUN rm -rf /var/lib/apt/lists/*
RUN apt-get clean
RUN npm install forever -g
#RUN npm install bower -g
#RUN npm install grunt-cli -g
ADD . /src
RUN cd /src; npm install