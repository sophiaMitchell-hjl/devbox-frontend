---
tool: cron
type: troubleshooting
lang: en
title: 'crontab Not Running? Troubleshooting Steps and Solutions'
seoTitle: 'crontab Not Running? Troubleshooting Steps and Solutions | DevBox'
description: 'Common reasons a crontab task won''t run or take effect, and step-by-step troubleshooting: cron service not running, PATH environment variable, permissions, command paths, logs, and timezone issues—with solutions.'
order: 4
updated: "2026-07-01"
faqs:
  - q: 'Why does a command run fine manually but not run when put in crontab?'
    a: 'The most common reason is a different environment. cron''s PATH is very minimal and it does not load your .bashrc, so it can''t find the command or is missing environment variables. The fix is to use absolute paths for commands and explicitly set any needed environment variables at the start of your script.'
  - q: 'How do I know whether cron actually ran?'
    a: 'Check the cron logs (such as /var/log/syslog or /var/log/cron) and search for your task; also append >> /tmp/job.log 2>&1 to the command to record both output and errors.'
---

## First, Confirm the Expression Is Correct

Many "won't run" cases are really **the time hasn't come yet or the expression is wrong**. First paste the expression into the [Cron Expression Generator](/en/cron) and check whether the plain-language explanation and future run times match your intent—this step rules out over half of all problems.

## 1. Is the cron Service Running

cron itself is a background service; if it isn't started, nothing runs:

```
systemctl status cron    # Debian/Ubuntu
systemctl status crond   # CentOS/RHEL
```

If it isn't running, start it and enable it at boot: `systemctl enable --now cron`.

## 2. Environment Variable / PATH Issues (Most Common)

cron's runtime environment is **completely different** from your login terminal: PATH is short and `.bashrc` isn't loaded. So "runs manually but not under cron" is almost always this cause.

Fix:

- Always use **absolute paths** for commands: `/usr/bin/python3 /opt/app/job.py`, not `python3 job.py`.
- Set any needed environment variables **explicitly** in the script, or define `PATH=` at the top of the crontab.

## 3. Command and Script Permissions

- The script must have **execute permission**: `chmod +x /opt/app/job.sh`.
- Confirm the executing user has permission on the relevant files/directories. In system-level `/etc/cron.d/`, you must also specify **which user to run as**.

## 4. Write Output to a Log

Not logging is essentially "running blind." Add redirection to the command so errors are immediately visible:

```
0 3 * * * /opt/app/job.sh >> /var/log/job.log 2>&1
```

`>>` records normal output, and `2>&1` also writes errors to the same place.

## 5. Check the System cron Logs

```
grep CRON /var/log/syslog     # Debian/Ubuntu
tail -f /var/log/cron         # CentOS/RHEL
```

This shows whether cron triggered your task at the expected time. If it doesn't appear in the log at all, the problem is likely the expression or the service; if it appears but the task fails, it's a command/permission/environment problem.

## 6. File Format Details

- The crontab file **must end with a blank line** (a trailing newline), or the last entry may be ignored.
- The `%` character in commands has a special meaning (it represents a newline); escape it as `\%` when needed.

## 7. Wrong Timezone

A task running at the "wrong time" usually means the server timezone differs from what you expect. Use `timedatectl` to check, and set the system timezone as needed; some implementations support setting `CRON_TZ=Asia/Shanghai` at the top of the crontab.

## Still Not Working?

Go back to basics and rule things out one by one: first use [What Is Cron](/en/cron/what-is-cron) to confirm you understand the fields correctly, then use the [Cron Expression Generator](/en/cron) to validate the expression, and finally check the service, environment, permissions, and logs in the order 1→5 above.
