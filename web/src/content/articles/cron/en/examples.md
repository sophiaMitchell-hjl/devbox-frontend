---
tool: cron
type: examples
lang: en
title: 'Cron Expression Examples: How to Write Common Scheduling Scenarios'
seoTitle: 'Cron Expression Examples: every 5 min/daily/weekly | DevBox'
description: 'A collection of the most common cron expressions: every minute, every 5 minutes, hourly, daily in the early morning, every Monday, the 1st of each month, weekdays, and more—ready to copy, with online validation of run times.'
order: 3
updated: "2026-07-01"
faqs:
  - q: 'Can cron be precise to the second?'
    a: 'The smallest granularity of standard cron is the minute; it cannot be precise to the second. For second-level precision, use a 6-field implementation (such as Quartz or Spring), or combine cron with a sleep in your script.'
  - q: 'How do I write "every 2 hours"?'
    a: 'Write it as 0 */2 * * *. The */2 in the hour field means every 2 hours, and the 0 in the minute field ensures it runs on the hour.'
---

## Quick Reference

Below are the most common patterns. Click into the matching section for details, or head straight to the [Cron Expression Generator](/en/cron) to paste and validate.

| Expression | Meaning |
|--------|------|
| `* * * * *` | Every minute |
| `*/5 * * * *` | Every 5 minutes |
| `0 * * * *` | Every hour, on the hour |
| `0 */2 * * *` | Every 2 hours |
| `0 0 * * *` | Every day at midnight |
| `0 3 * * *` | Every day at 3 AM |
| `0 9 * * 1` | Every Monday at 9 AM |
| `0 0 1 * *` | The 1st of every month |
| `0 18 * * 1-5` | Weekdays at 6 PM |
| `30 2 * * 0` | Every Sunday at 2:30 AM |

## By Minute

**Run every minute:** `* * * * *`

**Run every 5 minutes:** `*/5 * * * *` (commonly used for health checks)

**Run every 30 minutes:** `*/30 * * * *`

**At minutes 15 and 45 of every hour:** `15,45 * * * *`

## By Hour

**Run every hour on the hour:** `0 * * * *`

**Run every 2 hours:** `0 */2 * * *`

**Run every hour from 9 AM to 6 PM:** `0 9-18 * * *` (good for polling during work hours)

## By Day

**Every day at midnight:** `0 0 * * *`

**Every day at 3 AM (commonly used for backups):** `0 3 * * *`

**Every day at 12:30 PM:** `30 12 * * *`

## By Week

**Every Monday at 9 AM:** `0 9 * * 1`

**Every Sunday at 2:30 AM:** `30 2 * * 0`

**Weekdays (Monday to Friday) at 6 PM:** `0 18 * * 1-5`

**Every weekend (Saturday and Sunday) at 10 AM:** `0 10 * * 6,0`

## By Month

**The 1st of every month at midnight:** `0 0 1 * *`

**The last day of the month needs special handling**: standard cron does not support "the last day." A common approach is to run a script at midnight every day and have the script check whether it's the end of the month.

## Combined Scenarios

**Weekdays, 9 AM to 6 PM, every 10 minutes:** `*/10 9-18 * * 1-5`

**The first day of each quarter (the 1st of January, April, July, October) at midnight:** `0 0 1 1,4,7,10 *`

## Not Sure About an Expression? Validate First

Paste any of these into the [Cron Expression Generator](/en/cron) to see a plain-language explanation and future run times, avoiding the "thought it was daily but it runs every minute" mistake. If you're unclear on what the fields mean, start with [What Is Cron](/en/cron/what-is-cron); to learn how to write them systematically, see [How to Write a Cron Expression](/en/cron/guide).
