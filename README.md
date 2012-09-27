deployer [<img src="https://secure.travis-ci.org/jolira/deployer.png" />](http://travis-ci.org/#!/jolira/deployer)
========================================

ssh-keygen
cat ~/.ssh/id_rsa.pub
cd /tmp
git clone git@github.com:MensWearhouse/tailorapp.git


```bash
sudo adduser --system --home /var/deployer --disabled-password --shell /bin/bash deployer
sudo su - deployer
git clone git://github.com/jolira/deployer.git .
chmod -R og-rx .ssh
```

```bash
sudo apt-get install libavahi-compat-libdnssd-dev
```

License
-----------------

[MIT License](https://raw.github.com/jolira/deployer/master/LICENSE.txt)
