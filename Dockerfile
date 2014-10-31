FROM node:0.10.32

RUN npm install forever -g
ADD . /src
RUN cd /src; npm install
