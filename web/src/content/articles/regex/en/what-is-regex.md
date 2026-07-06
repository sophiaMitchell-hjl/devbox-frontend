---
tool: regex
type: wiki
lang: en
title: 'What Is a Regular Expression? A Clear Guide to the Basic Syntax'
seoTitle: 'What Is a Regular Expression? Basic Syntax & Metacharacters | DevBox'
description: 'A regular expression (regex) is a tool that matches text using a set of rules. This article explains the basic syntax—metacharacters, character classes, quantifiers, groups, anchors—and a common-symbol reference table, so even beginners can follow along.'
order: 1
updated: "2026-07-02"
faqs:
  - q: 'Are regular expressions the same across different languages?'
    a: 'The basic syntax (character classes, quantifiers, groups, anchors) is common across most languages such as JavaScript, Python, Java, and PHP; a few advanced features (such as certain lookarounds, \p{} properties, and named-group syntax) differ, so for complex cases it''s best to test in the target language.'
  - q: 'Do I have to memorize every symbol to learn regex?'
    a: 'No. First master the dozen or so most common metacharacters (. * + ? [] () ^ $ \d \w \s), and use an online tester to write and see the highlighting as you go—you''ll get the hang of it quickly.'
---

## What Is a Regular Expression

A **regular expression** (regex for short) is a "pattern" used to **match text by rules**. For example, if you want to find all email addresses in a piece of text, validate a phone-number format, or batch-replace dates—a regex can describe it in one line, without writing a pile of if statements.

It works in almost every programming language, editor, and command-line tool (grep, sed), making it a universal tool for working with text.

## Basic Components

A regex is made up of **literal characters** and **metacharacters** (symbols with special meaning). For example, in `\d{4}-\d{2}`: `\d` means "a digit," `{4}` means "repeat 4 times," and `-` is an ordinary hyphen.

## Common Metacharacters Quick Reference

| Symbol | Meaning | Example |
|------|------|------|
| `.` | Any single character (excludes newline by default) | `a.c` matches abc, a1c |
| `\d` | Digit 0-9 | `\d\d` matches 42 |
| `\w` | Letter, digit, or underscore | `\w+` matches hello_1 |
| `\s` | Whitespace (space/tab/newline) | |
| `[abc]` | Character class: any one inside the brackets | `[aeiou]` matches any vowel |
| `[^abc]` | Negation: not these characters | `[^0-9]` matches non-digits |
| `[a-z]` | Range | `[a-z]` matches lowercase letters |

## Quantifiers (Repetition Count)

| Symbol | Meaning |
|------|------|
| `*` | 0 or more times |
| `+` | 1 or more times |
| `?` | 0 or 1 time (optional) |
| `{n}` | Exactly n times |
| `{n,}` | At least n times |
| `{n,m}` | n to m times |

## Groups and Anchors

- **Group `( )`**: wraps a part so it can be repeated as a whole or extracted. E.g. `(ab)+` matches ababab; `(?<year>\d{4})` is a named group.
- **Alternation `|`**: `cat|dog` matches cat or dog.
- **Anchors**: `^` matches the start, `$` matches the end, and `\b` matches a word boundary. E.g. `^\d+$` means "the entire string is digits."

## Common Pitfalls

- **Forgetting to escape**: `.`, `*`, `(`, etc. are themselves metacharacters; to match them literally you must escape them as `\.`, `\*`, `\(`.
- **Greedy matching**: `.*` matches as much as possible by default, often "matching too much"; use the non-greedy `.*?` when needed.

## Next Steps

- To learn how to write regex systematically: see [How to Write a Regular Expression](/en/regex/guide);
- To copy common patterns directly: see [Common Regular Expressions](/en/regex/examples);
- To verify as you write: open the [Regex Tester](/en/regex) for real-time highlighting.
