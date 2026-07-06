---
tool: cron
type: wiki
lang: en
title: 'What Is Cron? A Clear Guide to crontab and Expression Format'
seoTitle: 'What Is Cron? crontab Expression Format Explained | DevBox'
description: 'Cron is the scheduled-task system on Linux/macOS, and crontab is its configuration. This article explains the five fields of a cron expression, what the special characters mean, and common pitfalls—so even beginners can read and write cron.'
order: 1
updated: "2026-07-01"
faqs:
  - q: 'What is the difference between cron and crontab?'
    a: 'cron is the background service (daemon) responsible for "running things on a schedule"; crontab is the configuration file it reads, and also the command used to edit that file (crontab -e). The scheduling rules you write are stored in the crontab, and the cron service runs them on time.'
  - q: 'How many fields does a cron expression have?'
    a: 'A standard cron has 5 fields: minute, hour, day of month, month, and day of week. Some systems (such as Quartz and Spring) use 6 fields, adding a "seconds" field at the front.'
  - q: 'In the day-of-week field, do both 0 and 7 mean Sunday?'
    a: 'In most implementations 0 means Sunday; some also accept 7 for Sunday. For compatibility, it is recommended to consistently use 0 for Sunday.'
---

## What Is Cron

**Cron** is the background service on Linux, macOS, and other Unix-like systems responsible for **running tasks on a schedule**. You simply tell it "when to run and what command to run," and it runs automatically at the specified time—no manual supervision needed. Common uses: automatically backing up a database in the early morning, cleaning up temporary files every hour, checking service status every minute, and so on.

## crontab: cron's Configuration

The configuration cron reads is called the **crontab** (short for cron table). At the same time, `crontab` is also the command used to manage this configuration:

- `crontab -e`: edit the current user's scheduled tasks
- `crontab -l`: list existing scheduled tasks
- `crontab -r`: delete all tasks (use with care)

Each line in a crontab = **one cron expression** + **the command to run**, for example:

```
0 3 * * * /usr/bin/backup.sh
```

This means: run `/usr/bin/backup.sh` every day at 3 AM. The leading `0 3 * * *` is the **cron expression**, which describes "when."

## The Five Fields of a Cron Expression

A standard cron expression consists of 5 fields, separated by spaces. From left to right, they are:

| Position | Field | Range | Description |
|------|------|---------|------|
| 1 | Minute | 0-59 | Which minute |
| 2 | Hour | 0-23 | Which hour (24-hour clock) |
| 3 | Day of month | 1-31 | Which day of the month |
| 4 | Month | 1-12 | Which month |
| 5 | Day of week | 0-6 | Which weekday (0 = Sunday) |

For example, `30 8 * * 1` means: **every Monday at 8:30 AM**.

## Meaning of Special Characters

Within each field you can combine these symbols to build flexible time rules:

| Symbol | Meaning | Example |
|------|------|------|
| `*` | Every value (any value) | `*` in the minute field = every minute |
| `,` | Enumerate multiple values | `9,18` in the hour field = 9 AM and 6 PM |
| `-` | Continuous range | `1-5` in the day-of-week field = Monday through Friday |
| `/` | Step (every N) | `*/5` in the minute field = every 5 minutes |

Combined example: `*/10 9-18 * * 1-5` means **every 10 minutes between 9 AM and 6 PM on weekdays**.

## Common Pitfalls

- **Confusing "day of month" and "day of week"**: when both are set to specific values, most systems run the task "if either matches," which can trigger more often than expected. In everyday use, just use one of them.
- **Forgetting that commands need absolute paths**: cron's runtime `PATH` is very minimal, so it's best to write `python`, `node`, etc. as full paths.
- **Writing seconds into the expression**: standard cron has **no seconds**; if you need second-level precision, use a 6-field implementation (such as Quartz).

## Next Steps

Now that you understand the format, you can:

- Use the [Cron Expression Generator](/en/cron) to visually build expressions and preview their run times;
- Read [How to Write a Cron Expression](/en/cron/guide) to learn to construct them from scratch;
- Browse the [Cron Expression Examples](/en/cron/examples) to copy common patterns.
