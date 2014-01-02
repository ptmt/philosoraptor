#!/bin/sh

BUILDIMAGE="unknownexception/raptor"
#line=$(docker images | grep $BUILDIMAGE)
#if [ x"$line" = x ]
#then
docker build -t $BUILDIMAGE /home/philosoraptor/src   
#fi

ls

#Stop previously running container
oldid= $(docker ps | grep $BUILDIMAGE | cut -d' ' -f1)
if [ x"$oldid" = x ]
then
   docker kill $oldid
fi

#id=$(docker run -e NODE_ENV=PRODUCTION -p 8080 -d $BUILDIMAGE)
#echo $id