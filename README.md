#Fortress

[![Build Status](https://travis-ci.org/Islive-io/fortress.svg?branch=master)](https://travis-ci.org/Islive-io/fortress)

Backend. Home of all features.

##Install
* npm install
* In `/config` rename `local.js.dist` to `local.js`
* Edit configuration in `/config/local.js`
* In `module.exports.models` set migrate to `alter` to fill the database.
* Install redis

After running the application once set the migrate back to `safe`

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

## Optimize DB

Due to lack of compound keys in waterline, run these manually:

Run:

```sql
alter table message add key `read_to` (`read`,`to`);
alter table message add key `to_thread` (`to`,`thread`);
alter table message add key `createdAt` (`createdAt`);
alter table thread add KEY `updatedAt` (`updatedAt`);
```

