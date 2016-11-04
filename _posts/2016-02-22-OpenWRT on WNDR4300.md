---
title: OpenWRT on WNDR4300
permalink: openwrt-wndr4300
date: 2016-02-22
---

# WNDR4300刷机备忘

- 路由器的IP地址要设置成和WLAN不同网段的地址，例如，WLAN是`192.168.1.x`那么路由器应该设置成静态地址`10.0.0.1`之类的地址。
- dhcp服务可能无法启动，如果没有使用ipv6，记得把ipv6的dhcp关掉，有可能是因为这个引起的。
- 5G信号如果无法连接或者找不到，请按照这个[链接](https://wiki.openwrt.org/toh/netgear/wndr4300)设置。
- 正常登录路由器后记得把SSH访问设置成证书验证，以防被人攻击。
