---
title: Upgrade OpenWRT to 15.05.1
permalink: upgrade-openwrt
date: 2016-04-07
---

# Upgrade OpenWRT to 15.05.1

## Prepare

Backup current configurations from LuCI, you need to tell OpenWRT which files to
backup. I recommend to include at least the following:

- `/etc/config`
- `/etc/dropbear`
- `/etc/crontabs`

You can add other files/folders to the list. Since I use shadowsocks on the router,
I also included these files:

- `/etc/shadowsocks.conf`
- `/etc/chinadns_chnroute`
- `/usr/bin/shadowsocks-firewall`

## Build image

In order to make use of more disk space, I recommend you to build a custom image.
You need a Linux box to build OpenWRT, it is doable on other systems(e.g. OS X)
but I don't recommend it. You have to fix all sort of wired problems on OS X,
believe me, I once tried and gave up at the end. It's just much simpler to use
a Linux box.

- Download [ImageBuilder](https://downloads.openwrt.org/chaos_calmer/15.05/ar71xx/nand/OpenWrt-ImageBuilder-15.05-ar71xx-nand.Linux-x86_64.tar.bz2)

- Download [OpenWRT SDK](https://downloads.openwrt.org/chaos_calmer/15.05/ar71xx/nand/OpenWrt-SDK-15.05-ar71xx-nand_gcc-4.8-linaro_uClibc-0.9.33.2.Linux-x86_64.tar.bz2)

The SDK is used to build the shadowsocks package since OpenWRT 15.05.1 does not
come with a pre-built one. You can use a mirror for faster download. You can use
this [mirror](https://mirrors.tuna.tsinghua.edu.cn/openwrt/chaos_calmer/15.05.1/ar71xx/nand/)
if you are in China.

Extract files using `tar -xzf file-name.tar.bz2`. I rename the two extracted folders
to `latest-ar71xx` and `latest-ar71xx-sdk`.

### Build shadowsocks

```
cd latest-ar71xx-sdk
git clone https://github.com/shadowsocks/shadowsocks-libev.git

# Enable shadowsocks-libev in network category
make menuconfig

# Packages will be saved to bin/ar71xx/packages/base
make V=99 package/shadowsocks-libev/openwrt/compile
```

Copy `shadowsocks-libev-x.x.x_ar71xx.ipk` to `latest-ar71xx/packages/base`. If
you prefer polarssl, just copy `shadowsocks-libev-polarssl_x.x.x_ar71xx.ipk`.

### Determine packages to include

You can follow the detailed steps [here](https://softwaredownload.gitbooks.io/openwrt-fanqiang/content/ebook/wndr4300/1.download-imagebuilder-for-netgear-wndr4300.html). Here's what I do:

```
echo $(wget -qO - http://downloads.openwrt.org/snapshots/trunk/ar71xx/nand/config | sed -ne 's/^CONFIG_PACKAGE_\([a-z0-9-]*\)=y/\1/ip') >base-packages

make info | grep -Po 'Default Packages: \K.+$' >wndr4300-base-packages
make info | grep -P -A 2 'WNDR4300:' | tail -1 | grep -Po 'Packages: \K.+' >wndr4300-packages
```

I also want to include `shadowsocks-libev`, `unbound` and `dnscrypt-proxy` and a
few other utilities.

```
cat <<EOF >user-packages
shadowsocks-libev
dnscrypt-proxy
unbound
luci-ssl
iptables-mod-nat-extra
bind-dig
ipset
wget
libopenssl
EOF
```

Note: the [reference](https://softwaredownload.gitbooks.io/openwrt-fanqiang/content/ebook/wndr4300/1.download-imagebuilder-for-netgear-wndr4300.html) I gave uses `dnsmasq-full` instead the
default `dnsmasq`. I will not use `dnsmasq` as DNS server, so the default package
is fine.

Now we have all the packages need, let's sort and remove duplicates.

```
tr ' ' '\n' <wndr4300-packages <wndr4300-base-package <base-package <user-packages | sort | uniq | tr '\n' ' ' >image-packages
```

All packages are in the file `image-packages`.

### Change image memory layout

WNDR4300 has `128MB` NAND memory, but `96MB` of which is reserved. We need to
change image flash layout to fully utilize the `96MB` reserved memory.

```
#!/bin/sh

cd latest-ar71xx
now=`date +%s`

sed -i-$now.bak -e 's/23552k/121856k/g' -e 's/25600k/123904k/g' target/linux/ar71xx/image/Makefile
```

### Let's build the image now!

Extract the backup file you downloaded from router into a directory `config`.

```
#!/bin/bash

packages=`cat image-packages`
cd latest-ar71xx
make image PROFILE=WNDR4300 PACKAGES="$packages" FILES=config
```

That's it! You can find the images in `latest-ar71xx/bin/ar71xx`. The `sysupgrade.tar`
file can be used in LuCI web interface and `ubi-factory.img` can used with `tftp`.
Check the [instructions here](https://wiki.openwrt.org/toh/netgear/wndr3700#installation).

## Troubleshooting

- I have to disable `option dhcpv6 'disabled'` in `/etc/config/dhcp` for IPV4 dhcp
to work. This is really confusing, but it's safe for me because I don't have IPV6
connection.

- Another thing to note is that if you backup your `/etc/dropbear` folder, you need
to change file mod with `chmod` to make public key authentication work. See the
troubleshooting section [here](https://wiki.openwrt.org/oldwiki/dropbearpublickeyauthenticationhowto).

- If dns server is not working when ssh into the router, you may need to remove
`/etc/resolv.conf` and create a new one. By default this file symbolic links to
`/tmp/resolve.conf`.

```
# Change 8.8.8.8 to any server you want
rm /etc/resolv.conf
cat <<EOF >/etc/resolv.conf
nameserver 8.8.8.8
EOF
```

## Configure shadowsocks

You have to adjust the init script in `/etc/init.d/shadowsocks` to fulfill your
needs. I only use `ss-redir` and the configuration file is `/etc/shadowsocks.conf`
which I included in the backup. I also put my shadowsocks related `iptables`
rules in `/etc/firewall.user`. You can use [this](https://github.com/softwaredownload/openwrt-fanqiang/blob/master/openwrt/default/usr/bin/shadowsocks-firewall) as a reference.

## Setup DNS server

I have my own `dnscrypt` enabled server, so I need to setup `dnscrypt-proxy` in
the router to forward requests to my own DNS server. You need to edit the
`/etc/init.d/dnscrypt-proxy`.

```
# Adjust the options as you need
# The reference is here https://dnscrypt.org/

/usr/sbin/dnscrypt \
    --local-address=127.0.0.1:55 \
    --logfile=/path/to/logfile/dnscrypt.log \
    --resolver-address=your-remote-dnscrypt-server \
    --provider-name=your-remote-provider-name \
    --provider-key=your-fingerprint \
    --tcp-only \
    --user=nobody \
```

To test `dnscrypt-proxy` works properly, run `dig -p 55 @127.0.0.1 google.com`.

Next we need to setup `unbound` as a local DNS forward cache server. Take a look
at the [sample configuration file](https://github.com/CNMan/unbound.conf/blob/master/unbound.conf).
You should have `unbound` listen on port 53.

Script to download zone files for your([source](https://github.com/CNMan/unbound.conf)).

```
#!/bin/bash

wget ftp://ftp.internic.net/domain/named.cache -O named.cache
wget https://raw.githubusercontent.com/CNMan/unbound.conf/master/unbound.forward-zone.China.conf -O unbound.forward-zone.China.conf
wget https://raw.githubusercontent.com/CNMan/unbound.conf/master/unbound.local-zone.block.conf -O unbound.local-zone.block.conf
wget https://raw.githubusercontent.com/CNMan/unbound.conf/master/unbound.local-zone.hosts.conf -O unbound.local-zone.hosts.conf
```

I only use `forward-zone.China.conf` as adblocking in the router is somewhat inconvenient
in China sometimes(orz...). `local-zone.hosts` contains working IP addresses for
most of the blocked internet services in China. It's like using `hosts` file on
your local system. It should not be used if you have a working proxy, IMHO. Make
your own choice!

I recommend turn off logging for unbound in favor of speed. Remember to adjust
these two options:

- `username`, if unset defaults to `unbound` which does not exits on the router.
- `access-control`, if unset defaults to only localhost is allowed, so you will
not be able to use it on devices connected to your router.

You can read the [manual](https://www.unbound.net/documentation/unbound.conf.html).

To test `unbound`, run `dig @127.0.0.1 google.com`.

Last thing, edit `/etc/config/dhcp` to configure your router as the DNS server.

```
config dhcp 'lan'
    ...
    list dhcp_option '6,your-router-lan-ip'
```

## Notes on shadowsocks and DNS related services

`/etc/init.d/dnscrypt-proxy`, `/etc/init.d/unbound` and `/etc/init.d/shadowsocks`
should be run after any other network services. So set `START=90` or some other
large value.

I was using `dnsmasq` as the forward DNS server before the upgrade, but I found
it doesn't work well with tcp DNS queries. So I decided to switch to `unbound` with
this upgrade. To quote<sup>[[1]](http://lists.thekelleys.org.uk/pipermail/dnsmasq-discuss/2008q2/002104.html), [[2]](https://github.com/ArchiDroid/dnsmasq/blob/master/FAQ)</sup>:

> Sooo........  How can I configure the notebook instances of dnsmasq to
> always send queries to the tcp port, rather than the default udp ports?

> You can't: there's no option to do that, and the structure of the code
> makes it difficult to do anything other that forwarding UDP queries as
> UDP and TCP queries as TCP. Sorry.

> Q: Why doesn't dnsmasq support DNS queries over TCP? Don't the RFC's specify
>    that?

> A: Update: from version 2.10, it does. There are a few limitations:
>    data obtained via TCP is not cached, and source-address
>    or query-port specifications are ignored for TCP.
