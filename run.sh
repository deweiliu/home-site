#!/bin/bash
service="my-website"
port=80

# set up variables
image="${service}-image"
container="${service}-container"
stars() {
    echo "***********************************************************"
}

execute() {
    # print the command before executing
    echo "--- $1"
    sudo $1
}

# service start
stars
echo ${service}
stars


# Docker Build
echo "Start buiding Docker image"
echo "${image}"
execute "docker build -t $image ."
exitCode=$?
if [ $exitCode != 0 ]; then
    echo "Docker build failed"
    exit $exitCodecontainer
fi
echo "Docker build successed"

# Docker run
echo "Running Docker container"
execute "docker run -d --name $container -p $port:$port $image"
stars
echo "The ${service} is now running at localhost:${port}"
echo "Press anykey to stop the ${service}"
stars
read -n 1 -s -r -p ""

# Docker remove
echo "Removing the container and image"
execute "docker stop $container"
execute "docker rm $container"
execute "docker rmi -f $image"
echo "Done"