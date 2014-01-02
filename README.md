philosoraptor
=============


Build and run Docker container (0.6.5+ required):
````
start.sh
````
Or run ansible-playbook.

````
$ sudo add-apt-repository ppa:rquillo/ansible
$ sudo apt-get update
$ sudo apt-get install ansible
````

Ensure docker daemon is running.

For log into container:
````
docker run -t -i unknownexception/raptor /bin/bash
````