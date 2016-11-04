---
title: Linode Setup for Shadowsocks, DNS Server and a Blog
permalink: linode
date: 2016-03-31
---

# Linode Setup for Shadowsocks, DNS Server and a Blog

以前的博客都是放在托管的服务上的，之前一个域名忘了续期，现在已经无法访问了，好在之前的东西都在
Dropbox上，没有丢失什么。前段时间买了个WNDR4300，刷机弄科学上网，又想起来是不是可以自己买个
VPS把ss和dns都放在上面，弄完后又想起来还能放个blog，于是就有了这个小站。

这期间前前后后大概弄了有半个月吧，之前一直很懒，没有搭建过自己的服务器，业余时间学学弄弄没想到
倒腾了这么久。趁着现在还有印象，就写个备忘。

配置Linode
-----

[Linode](https://www.linode.com/)现在入门款`$10`一个月，算上备份服务的就是`$12.5`。日本
节点卖完了，所以选了一个Fremont的机器。说实话，延迟有点大，但是还算稳定。系统选的Debian，因为
相对熟悉一点。装机教程这种没营养的东西我就不多说了，Linode文档很不错的，照着步骤一步步做下去就
好了。[Secure You Server](https://www.linode.com/docs/security/securing-your-server)
这篇建议必须做，网络上对Linode的攻击是很多的，自己配置好了看log就知道了。不需要的网络端口一定不要
开着。

科学上网
-----

安装[shadowsocks-libev](https://github.com/shadowsocks/shadowsocks-libev)，配置一下
端口和密码，密码建议用个机器生成的强密码，我都是存在1Password里的，用的时候从里面复制。装完记得
看一下这个优化的[wiki](https://github.com/shadowsocks/shadowsocks/wiki/Optimizing-Shadowsocks)，
配置一下还是有些效果的。Linode 65版的内核没有自带`hybla`模块，需要自己编译，请参考
[Compile kernel module on Linode Debian VPS](http://blog.anthonywong.net/2015/01/07/compile-kernel-module-on-linode-debian-vps/)。

然后是DNS服务器，我就是自用的，dnsmasq就够用了。端口不要用标准的53，所有墙外的dns时候
都会被污染的。`dig +trace google.com`就明白了。本地用的话，建议在路由器或者电脑上再跑一个
dnsmasq把非标准端口的请求转换成标准端口，这样子手机等设备也可以使用。

Shadowsocks和DNS最好都设置一下iptables的链接限制，以防被攻击。我都设置了connlimit限制。

博客
-----

之前的博客都是markdown写的，所以想找一个简单好用点的静态网站系统。网上看了几个，都不是很喜欢，
都说自己很简单，但大凡有点名气的还是要花点时间看文档的。很多人推荐的Hexo，我自己不是很喜欢它的设计，各有所好吧。

我对博客想法是很简单，不需要那么多乱七八糟的东西，一个index和一堆文章就可以了。所以我自己在空余
时间自己写了一个。花一天做了个雏形，之后陆陆续续增强了一些功能。代码我放在github上了，有需要的可以
参考一下，觉着合适自己的就fork一个。放上[链接](https://github.com/cpylua/cheli.im)。你现在
看见的这个博客就是用它生成的。

http服务器用的是nginx，Linode是支持ipv6的，所以博客同时支持ipv4和ipv6的方式访问。

证书是[Let's Encrypt](https://letsencrypt.org/)的免费证书。请参考官方的
[User Guide](https://letsencrypt.readthedocs.org/en/latest/using.html)和这篇
DigitalOcean的[教程](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-14-04)。
其实就一行命令罢了，看着样样洒洒那么多字。

```
# obtain a certificate
# If you have multiple domains, they will be in the same certificate.
letsencrypt-auto --text --agree-tos --email xxx@yyy.com certonly --webroot -w /tmp/foobar -d example.com

# renew
# You can create a cron task.
letsencrypt-auto renew
```
