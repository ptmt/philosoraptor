#!/bin/sh

BUILDIMAGE="unknownexception/raptor"
#line=$(docker images | grep $BUILDIMAGE)
#if [ x"$line" = x ]
#then
docker build -t $BUILDIMAGE .   
#fi

#Stop previously running container
oldid= $(docker ps | grep $BUILDIMAGE | cut -d' ' -f1)

docker kill $oldid;

id=$(docker run -p 49160:8080 -d $BUILDIMAGE)
echo $id