#!/bin/sh

if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 1>&2
   exit 1
fi

apt-get -y install python-software-properties
add-apt-repository -y ppa:chris-lea/node.js
apt-get update
apt-get -y install nodejs-dev npm git build-essential
apt-get -y install libavahi-compat-libdnssd-dev libexpat1-dev
adduser --system --no-create-home --disabled-password deployer
cat << EOF > /etc/init/deployer.conf
# start the deployer

pre-start script
    rm -rf /var/run/deployer
    mkdir -p rm -rf /var/run/deployer
    chown deployer rm -rf /var/run/deployer
end script

start on runlevel [2345]
stop on runlevel [06]

exec start-stop-daemon --start --quiet --chuid deployer --chdir /var/run/deployer --exec /usr/local/bin/deployer
EOF
