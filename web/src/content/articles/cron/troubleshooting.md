---
tool: cron
type: troubleshooting
title: crontab 不执行怎么办?排查步骤与解决方法
seoTitle: crontab 不执行怎么办?排查步骤与解决方法 | DevBox
description: crontab 任务不执行、不生效的常见原因与逐步排查:cron 服务未运行、PATH 环境变量、权限、命令路径、日志与时区问题,附解决方法。
order: 4
updated: "2026-07-01"
faqs:
  - q: 为什么手动运行命令正常,放进 crontab 就不执行?
    a: 最常见原因是环境不同。cron 的 PATH 很精简、也不加载你的 .bashrc,导致找不到命令或环境变量缺失。解决办法是命令用绝对路径,并在脚本开头显式设置需要的环境变量。
  - q: 怎么知道 cron 到底有没有跑?
    a: 查看 cron 日志(如 /var/log/syslog 或 /var/log/cron),搜索你的任务;同时在命令末尾加 >> /tmp/job.log 2>&1 把输出和报错都记录下来。
---

## 先确认表达式没写错

很多"不执行"其实是**时间没到或写错了**。先把表达式粘到 [Cron 表达式生成器](/cron),核对中文解释和未来执行时间是否符合预期——这一步能排掉一大半问题。

## 1. cron 服务是否在运行

cron 本身是个后台服务,没启动自然不执行:

```
systemctl status cron    # Debian/Ubuntu
systemctl status crond   # CentOS/RHEL
```

未运行就启动并设为开机自启:`systemctl enable --now cron`。

## 2. 环境变量 / PATH 问题(最常见)

cron 运行时的环境和你登录终端**完全不同**:PATH 很短、不加载 `.bashrc`。所以"手动能跑、cron 不行"几乎都是这个原因。

解决:

- 命令一律用**绝对路径**:`/usr/bin/python3 /opt/app/job.py`,而不是 `python3 job.py`。
- 需要的环境变量在脚本里**显式设置**,或在 crontab 顶部定义 `PATH=`。

## 3. 命令与脚本权限

- 脚本要有**可执行权限**:`chmod +x /opt/app/job.sh`。
- 确认执行用户对相关文件/目录有权限。系统级 `/etc/cron.d/` 里还要写明**以哪个用户运行**。

## 4. 把输出写进日志

不写日志就等于"盲跑"。给命令加上重定向,报错立刻可见:

```
0 3 * * * /opt/app/job.sh >> /var/log/job.log 2>&1
```

`>>` 记录正常输出,`2>&1` 把错误也一并写入。

## 5. 查看系统 cron 日志

```
grep CRON /var/log/syslog     # Debian/Ubuntu
tail -f /var/log/cron         # CentOS/RHEL
```

能看到 cron 有没有在对应时间触发你的任务。如果日志里根本没出现,多半是表达式或服务的问题;出现了但任务失败,就是命令/权限/环境的问题。

## 6. 文件格式细节

- crontab 文件**末尾要有空行**(换行),否则最后一条可能被忽略。
- 命令里的 `%` 有特殊含义(代表换行),需要时用 `\%` 转义。

## 7. 时区不对

任务在"错误的时间"执行,通常是服务器时区与你预期不一致。用 `timedatectl` 查看,并按需设置系统时区;部分实现支持在 crontab 顶部设 `CRON_TZ=Asia/Shanghai`。

## 还是不行?

回到基础逐条排除:先用 [Cron 是什么](/cron/what-is-cron) 确认字段理解无误,再用 [Cron 表达式生成器](/cron) 校验表达式,最后按上面 1→5 顺序检查服务、环境、权限、日志。
