jolira-deployer [<img src="https://secure.travis-ci.org/jolira/deployer.png" />](http://travis-ci.org/#!/jolira/deployer)
========================================

The deployer is a very simple tool for automatically deploying applications when launching a new virtual machine on
systems such as [EC2](http://aws.amazon.com/ec2/) or [OpenStack](http://www.openstack.org/).

You may want to also look at systems such as [Ubuntu's Juju](https://juju.ubuntu.com/). Juju is a much more comprehensive
solution than the deployer.

The basic idea is that applications and the OS are mainted and deployed separately (potentially by different teams).
The OS is kept using AMI that represents "Golden Image". When the AMI is launched configuration information is passed
as ["user-data"](http://docs.amazonwebservices.com/AWSEC2/latest/UserGuide/AESDG-chapter-instancedata.html#AMI-launch-index-examples).
This configuration information identifies the application manifest that defines what application should be deployed
and how it should be launched.

The deployer takes care of installing the application and launches it.

Installation
---------------

Start with an AMI from a trusted source such as [Ubuntu's Cloud Images](http://cloud-images.ubuntu.com/). The deployer
has been tested with [Ubuntu 12.04](http://cloud-images.ubuntu.com/precise/) and [Ubuntu 12.10](http://cloud-images.ubuntu.com/quantal/),
but should run without any problems on any OS that is supported by [node.js](http://nodejs.org/).

Launch an instance, download the [config.sh](https://raw.github.com/jolira/deployer/master/bin/config.sh), and run
the script a root.

The [config.sh](https://raw.github.com/jolira/deployer/master/bin/config.sh) script will install node.js,
[npm](http://npmjs.org), the build essentials, and a number of other dependencies. It will also install an
[Upstart](http://upstart.ubuntu.com/) script that automatically launches the deployer at startup.

The [config.sh](https://raw.github.com/jolira/deployer/master/bin/config.sh) script will also create a new user
called ``deployer``. In order to be able to be able to use be able to provision applications from
[github](http://github.com), you will have to create a key and add it to a github user that can access your source
code.

```bash
sudo su - deployer
ssh-keygen
cat ~/.ssh/id_rsa.pub
```

You will also have to install all OS dependencies your application may require, as [npm](http://npmjs.org) does not
manage these types of components.

My applications are connected using [zero-conf](https://github.com/agnat/node_mdns) and require the following
component to be installed.

```bash
sudo apt-get install libavahi-compat-libdnssd-dev
```

After the AMI the instance is configured accordingly, create an AMI.

Usage
---------------

In order to use the deployer, one has to create a manifest that defines where to get the application (currently
only git sources are supported), the environment variables that have to be defined to run the application and the
command line to be used to start the application. Here is an example for a manifest file:

```json
{
    "repository":"git@github.com:jolira/myapp.git",
    "env": {
        "NODE_ENV": "production"
    },
    "command":{
        "cmd":"./node_modules/site-manager/bin/site-manager",
        "args":[
            "--watch-dirs=false",
            "."
        ]
    }
}
```

The manifest can be stored in an S3-bucket, on an http-server or on the local file-system.

When launching an instance of the AMI that contains the deployer, one has to pass enough information for the deployer
to be able to find the manifest file, such as in:

```json
{
    "aws-access-key-id": "AKKAJKRUL44GH2U7AP5Q",
    "aws-secret-access-key": "EVQKm+xVCjhwxjZOlOxxDpf+eBFSIaSK13Um0uFQ",
    "aws-log-bucket": "jolira-logs",
    "aws-region": "us-west-2",
    "manifest": "s3://jolira-qa/config/myapp.json"
}
```


License
-----------------

[MIT License](https://raw.github.com/jolira/deployer/master/LICENSE.txt)
