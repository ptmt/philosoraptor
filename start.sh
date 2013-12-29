#!/bin/bash

BUILDIMAGE="unknownexception/raptor"
#line=$(docker images | grep $BUILDIMAGE)
#if [ x"$line" = x ]
#then
docker build -t $BUILDIMAGE .   
#fi
id=$(docker run -p 49160:8080 -d $BUILDIMAGE)
echo $id