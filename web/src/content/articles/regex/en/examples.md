---
tool: regex
type: examples
lang: en
title: 'Common Regular Expressions: Email/Phone/URL and More'
seoTitle: 'Common Regular Expressions: Email/Phone/URL/ID | DevBox'
description: 'A collection of the most common regular expressions: email, phone number, URL, IP, ID number, date, Chinese characters, password strength, and more—copy-ready, with real-time online validation of matches.'
order: 3
updated: "2026-07-02"
faqs:
  - q: 'Why do the "email regexes" online all differ from each other?'
    a: 'The full email specification (RFC 5322) is extremely complex, and a strict regex is long and hard to maintain. In practice, people mostly use a "good enough" lenient version for common cases, then back it up with measures like sending a verification code.'
  - q: 'Can these regexes be used directly for strict validation?'
    a: 'They can serve as a format pre-filter. For things like phone numbers and ID numbers, a correct format doesn''t mean the value actually exists; critical business logic still needs server-side or third-party validation.'
---

## How to Use

The regexes below can be copied directly. It's recommended to paste them into the [Regex Tester](/en/regex) and validate against your real data before using them. The examples don't include start/end anchors by default; add `^` and `$` at both ends when doing whole-string validation.

## Email

```
[\w.+-]+@[\w-]+\.[\w.-]+
```
A lenient, good-enough version. For whole-string validation, add anchors: `^[\w.+-]+@[\w-]+\.[\w.-]+$`.

## Phone Number (Mainland China)

```
1[3-9]\d{9}
```
Starts with 1, the second digit is 3-9, 11 digits total. For whole-string validation: `^1[3-9]\d{9}$`.

## URL

```
https?://[^\s]+
```
Matches http/https links. For stricter matching, restrict the domain and path characters.

## IPv4 Address

```
\b(?:\d{1,3}\.){3}\d{1,3}\b
```
Note: this only validates the "four groups of digits" format; it does not guarantee each group is ≤ 255.

## ID Number (Mainland China, 18 digits)

```
\d{17}[\dXx]
```
17 leading digits + a final digit or X. Whole-string: `^\d{17}[\dXx]$`.

## Date (YYYY-MM-DD)

```
\d{4}-\d{2}-\d{2}
```
E.g. 2026-07-02.

## Chinese Characters

```
[一-龥]+
```
Matches a run of consecutive Chinese characters.

## Numbers (Including Negatives and Decimals)

```
-?\d+(?:\.\d+)?
```
Matches 42, -3.14, etc.

## Password Strength (At Least 8 Characters, with Upper- and Lowercase Letters and Digits)

```
(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}
```
Uses three lookaheads to require a lowercase letter, an uppercase letter, and a digit respectively. Add `^...$` for whole-string validation.

## HTML Tag

```
<([a-zA-Z][\w-]*)[^>]*>
```
Matches an opening tag and captures the tag name. For parsing complex HTML, it's still recommended to use a dedicated parser rather than a regex.

## Keep Learning

- Don't understand the symbols above: read [What Is a Regular Expression](/en/regex/what-is-regex);
- Want to learn to write your own: read [How to Write a Regular Expression](/en/regex/guide);
- The regex you copied doesn't match: read [What to Do When a Regex Doesn't Match](/en/regex/troubleshooting).
