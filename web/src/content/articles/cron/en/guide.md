---
tool: cron
type: guide
lang: en
title: 'How to Write a Cron Expression? The Five Fields Explained with Examples'
seoTitle: 'How to Write a Cron Expression? 5 Fields Explained with Examples | DevBox'
description: 'A step-by-step guide to writing cron expressions: the meaning of the five fields, how to use the * / , - special characters, examples for every 5 minutes, daily, weekly and more, plus how to add it to your crontab and how to verify it.'
order: 2
updated: "2026-07-01"
faqs:
  - q: 'How do I write "every 5 minutes"?'
    a: 'Write it as */5 * * * *. The */5 in the minute field means "every 5 minutes," and the * in the other fields means no restriction.'
  - q: 'How do I write "run at a fixed time every day"?'
    a: 'Set the minute and hour to specific values and leave the rest as *. For example, every day at 3:30 AM is 30 3 * * *.'
  - q: 'How can I confirm my cron expression is correct?'
    a: 'Paste the expression into the Cron Expression Generator; it gives a plain-language explanation and the next few run times, so you can check at a glance whether it matches your intent.'
---

## First, Understand the Structure

A cron expression is 5 fields separated by spaces:

```
┌─ minute (0-59)
│ ┌─ hour (0-23)
│ │ ┌─ day of month (1-31)
│ │ │ ┌─ month (1-12)
│ │ │ │ ┌─ day of week (0-6, 0=Sunday)
│ │ │ │ │
* * * * *
```

The core idea when writing cron: **whichever field you want to restrict, fill in a specific value; if there's no restriction, use `*`**.

## The Four Key Symbols

- `*` — every value. Placed in a field, it means "no restriction on this dimension."
- `,` — enumeration. E.g. `9,12,18` in the hour field.
- `-` — range. E.g. `1-5` in the day-of-week field (Monday through Friday).
- `/` — step. E.g. `*/15` in the minute field (every 15 minutes).

## Building It Step by Step

**Goal 1: run every 5 minutes.** Just restrict the minute dimension to "every 5 minutes" and leave the rest open:

```
*/5 * * * *
```

**Goal 2: run at 3 AM every day.** Restrict minute=0 and hour=3, leave the rest open:

```
0 3 * * *
```

**Goal 3: run at 9 AM every Monday.** minute=0, hour=9, day of week=1:

```
0 9 * * 1
```

**Goal 4: run on the hour, every hour, on weekdays.** minute=0, day of week=1-5:

```
0 * * * 1-5
```

The pattern: **from left to right, fill in specific values for the dimensions you want to fix, and leave the rest as `*`**. Use `/` for "every N," `,` for "several specific values," and `-` for "a range."

## Adding It to crontab

Once you've written the expression, pair it with the command to run and add it to your crontab:

```
# After crontab -e, add a line:
0 3 * * * /usr/bin/backup.sh >> /var/log/backup.log 2>&1
```

- The first part is "when" (the expression), and the second part is "what to run" (the command).
- It's recommended to use **absolute paths** for commands, and to redirect output to a log for easier troubleshooting.
- After saving and exiting, run `crontab -l` to confirm it was added.

> In the [Cron Expression Generator](/en/cron), fill in your command and you get this entire crontab line ready to copy; it also shows the equivalent syntax for Windows Task Scheduler, Node.js, Python, Spring, and other environments.

## Verifying Your Expression

The most common beginner mistake is "thinking it runs daily when it actually runs every minute." Always verify after writing:

1. Open the [Cron Expression Generator](/en/cron);
2. Paste your expression;
3. Check whether the **plain-language explanation** and the **next 5 run times** match your intent.

## Keep Learning

- Not clear on what the fields and symbols mean? Read [What Is Cron](/en/cron/what-is-cron).
- Just want to copy common patterns? See [Cron Expression Examples](/en/cron/examples).
- Wrote it but it won't run? See [What to Do When crontab Won't Run](/en/cron/troubleshooting).
