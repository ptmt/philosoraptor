#!/bin/sh

BUILDIMAGE="unknownexception/raptor"
oldid=$(docker ps | grep $BUILDIMAGE | cut -d' ' -f1)
echo "oldid:::$oldid"
docker build -t $BUILDIMAGE /home/philosoraptor/src
#Stop previously running container
if [ ! -z "$oldid" ]
then
   echo "killing container..."
   echo $(docker kill $oldid)
fi

docker run -e NODE_ENV=PRODUCTION -p 8080 -d $BUILDIMAGE /bin/bash -c "cd /src; forever start index.js;forever logs index.js -f"