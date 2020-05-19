#!/bin/sh
### NODE & NPM ###

# add nodejs 10 ppa (personal package archive) from nodesource
curl -sL https://deb.nodesource.com/setup_10.x |  -E bash -

## Recommendations ##

#development tools to build native addons
 apt-get install gcc g++ make

#install Yarn packManager
curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg |  apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" |  tee /etc/apt/sources.list.d/yarn.list
 apt-get update &&  apt-get install yarn


# install nodejs and npm
 apt-get install -y nodejs


### MONGODB ### Depend on Linux Version
 
# Import the public key used by the package management system
wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc |  apt-key add -

# Install gnupg and its required libraries
 apt-get install gnupg

#  retrying importing the key
wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc |  apt-key add -

#Create a list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/4.2 multiverse" |  tee /etc/apt/sources.list.d/mongodb-org-4.2.list

#Reload local package database
 apt-get update

#Install the MongoDB packages
 apt-get install -y mongodb-org

# start mongodb
 systemctl start mongod

# set mongodb to start automatically on system startup
 systemctl enable mongod

echo "
----------------------
  PM2
----------------------
"

# install pm2 with npm
 npm install -g pm2

# set pm2 to start automatically on system startup
 pm2 startup systemd


echo "
----------------------
  NGINX
----------------------
"

# install nginx
 apt-get install -y nginx


echo "
----------------------
  UFW (FIREWALL)
----------------------
"

# allow ssh connections through firewall
 ufw allow OpenSSH

# allow http & https through firewall
 ufw allow 'Nginx Full'

# enable firewall
 ufw --force enable
