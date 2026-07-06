---
tool: regex
type: guide
lang: en
title: 'How to Write a Regular Expression? Building from Scratch and Practical Tips'
seoTitle: 'How to Write a Regex? Character Classes/Quantifiers/Groups Explained | DevBox'
description: 'A step-by-step guide to writing regex: how to use character classes, quantifiers, groups, anchors, and greedy vs. non-greedy matching, with examples, plus how to use and verify them in JavaScript, Python, and other languages.'
order: 2
updated: "2026-07-02"
faqs:
  - q: 'What is the difference between greedy and non-greedy?'
    a: 'Quantifiers are greedy by default and match as much as possible; adding ? after a quantifier makes it non-greedy, matching as little as possible. For example, against <a><b>, .*? matches only up to the first >, whereas .* matches up to the last >.'
  - q: 'How do I match "the whole string" instead of just part of it?'
    a: 'Use anchors to frame both ends: ^ at the start and $ at the end. For example, to validate an all-digits string use ^\d+$, not \d+ (the latter matches as long as it contains any digit).'
---

## The Basic Approach to Writing Regex

Writing a regex means **using symbols to describe "what the text I want to match looks like"**, assembled piece by piece from left to right: first think clearly about "what characters it's made of, how many times each repeats, and whether the start and end need to be fixed."

## Step 1: Describe the Characters

- Write specific characters directly: `abc`.
- Use a character class for a category of characters: digits `\d`, alphanumerics `\w`, or custom ones like `[a-z]`, `[aeiou]`.
- Use `.` for any character (excludes newline by default).

## Step 2: Describe the Quantity

Add a quantifier to a character to say how many times it repeats:

- `\d{4}` — exactly 4 digits
- `\w+` — one or more alphanumerics
- `-?` — an optional hyphen
- `\d{2,4}` — 2 to 4 digits

## Step 3: Groups and Alternation

- Use `( )` to wrap the part you want to repeat as a whole or extract: `(\d{4})-(\d{2})` captures the year and month as two groups.
- Named groups are more readable: `(?<year>\d{4})`.
- Use `|` for "or": `(jpg|png|gif)`.

## Step 4: Add Anchors to Fix Boundaries

- `^` for start, `$` for end: `^1[3-9]\d{9}$` validates that the entire string is a phone number.
- `\b` for word boundary: `\bcat\b` matches only a standalone cat, not category.

## Greedy vs. Non-Greedy (a Frequent Trap)

Quantifiers are **greedy** by default (match as much as possible). Against `<a><b>`, `<.*>` matches the whole thing; to match only `<a>`, use the non-greedy `<.*?>`. **When you match "too much," first consider whether you should add `?`.**

## Using It in Code

The same regex is written slightly differently across languages:

- JavaScript: `/regex/flags`, e.g. `str.match(/\d+/g)`
- Python: `import re; re.findall(r'\d+', s)` (use a raw string `r''` to avoid backslash escaping)
- Java: `Pattern.compile("\\d+")` (backslashes must be doubled inside the string)

> As you write, use the [Regex Tester](/en/regex) to see highlighting and groups in real time, and confirm it's correct before pasting it into code.

## Keep Learning

- Not familiar with the basic symbols: see [What Is a Regular Expression](/en/regex/what-is-regex);
- Want ready-made patterns: see [Common Regular Expressions](/en/regex/examples);
- Wrote one but it doesn't match: see [What to Do When a Regex Doesn't Match](/en/regex/troubleshooting).
