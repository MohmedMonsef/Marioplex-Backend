echo "
----------------------
  NODE
----------------------
"

### NODE & NPM ###

# add nodejs 10 ppa (personal package archive) from nodesource
curl -sL https://deb.nodesource.com/setup_10.x |  -E bash -

## Recommendations ##

#development tools to build native addons
 apt-get install gcc g++ make

#install Yarn packManager
curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg |  apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" |  tee /etc/apt/sources.list.d/yarn.list
 apt-get update &&  apt-get install -y yarn


# install nodejs and npm
 apt-get install -y nodejs



echo "
----------------------
  PM2
----------------------
"

# install pm2 with npm
 npm install -y -g pm2

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
sudo apt-get install ufw
# allow ssh connections through firewall
 ufw allow OpenSSH

# allow http & https through firewall
 ufw allow 'Nginx Full'

# enable firewall
 ufw --force enable
