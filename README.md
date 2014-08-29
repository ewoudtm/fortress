#Fortress
Backend. Home of all features.

##Install
* npm install
* In `/config` rename `local.js.dist` to `local.js`
* Edit configuration in `/config/local.js`
* Install redis

If you want to run the application on port 80 add the following line to your firewall or startup.
`/sbin/iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8001`

## Installing redis:
Add to /etc/apt/sources.list
```
deb http://packages.dotdeb.org squeeze all
deb-src http://packages.dotdeb.org squeeze all
```
```
wget -q -O - http://www.dotdeb.org/dotdeb.gpg | sudo apt-key add -
```
```
sudo apt-get update
sudo apt-get install redis-server
```

In project folder
```
npm install connect-redis@1.4.5
```

