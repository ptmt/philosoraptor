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
if [ ! -z "$oldid" ]
then
   docker kill $oldid
fi

docker run -e NODE_ENV=PRODUCTION -p 8080 -d $BUILDIMAGE /bin/sh "cd /src; forever start index.js;forever logs index.js -f"
#echo $id