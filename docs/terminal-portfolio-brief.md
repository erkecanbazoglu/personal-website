# Terminal Portfolio Concept

## Core Idea

Build a working personal website that presents Erke's career as a filesystem, rather than simply being a portfolio styled to resemble a terminal.

The terminal should be a small, deterministic browser-side simulation, not a real shell. No server execution or backend is required.

Suggested prompt:

```text
erke@portfolio:~$
```

`erke@portfolio` is immediately understandable while retaining the technical character of the experience.

## Why This Works

The terminal reference uses a deliberately small JavaScript virtual filesystem. Files have content, links have URLs and descriptions, and directories contain other items. A small path resolver handles `~`, `.`, `..`, and `/`.

Commands such as these are client-side lookups rather than server-side execution:

```text
ls
cd projects
ls
cat peer-arena
open peer-arena
```

Small shell details make the interface convincing:

- Tab autocomplete
- Up/down-arrow command history
- Relative navigation with `cd ..`
- Hidden files shown by `ls -a`
- Bash-style unknown-command errors
- Focusing the terminal when its window is clicked
- Semantic colours for directories, files, links, errors, and hidden files

For example:

```text
erke@portfolio:~$ hey
-bash: hey: command not found. try 'help'
```

## Content Structure

```text
~
├── README.md
├── about/
│   ├── me.md
│   └── now.md
├── experience/
│   └── titanbay/
│       └── README.md
├── projects/
├── skills/
│   ├── languages
│   ├── frontend
│   ├── backend
│   └── cloud
├── education/
│   └── koc-university.md
├── links/
│   ├── github
│   ├── linkedin
│   └── email
└── .secrets
```

This gives the design a purpose:

- Jobs are directories.
- Projects are repositories.
- Skills are executables or packages.
- Social profiles are links.
- Personality appears through hidden files and Easter eggs.

## Initial Experience

Do not start with an empty screen. The initial terminal should reveal enough information for non-technical visitors while inviting technically curious visitors to explore.

```text
erke@portfolio:~$ cat README.md

# erke canbazoglu

software engineer
london / bournemouth, uk

i build web, mobile and cloud products.
currently working in private-markets fintech.

-> github    -> linkedin    -> email

-----------------------------------------------------------

erke@portfolio:~$ _

type `help` to explore
```

The GitHub, LinkedIn, and email entries should be clickable. Directory and file output should also be clickable where practical; clicking `projects/`, for example, can execute the equivalent of `cd projects && ls`.

## V1 Commands

Keep the first version focused:

```text
help       show available commands
ls [-a]    list files, optionally including hidden files
cd <dir>   change directory
cat <file> read a file
pwd        show the current directory
open <f>   open a link
whoami     show a short introduction
clear      clear the terminal
history    show previous commands
neofetch   show a portfolio-specific system summary
```

Portfolio aliases can be added when useful:

```text
experience
projects
skills
education
contact
```

## Progressive Discovery

The best interaction is progressive discovery: a casual visitor immediately understands the site, a curious visitor starts typing, and a Unix-savvy visitor is rewarded for trying `ls -a`.

Possible hidden files and responses:

```text
erke@portfolio:~$ ls -a
.  ..  .gitconfig  .coffee  .secrets  README.md  projects/ ...
```

```text
erke@portfolio:~$ cat .coffee
ERROR: dependency required for successful compilation.
recommended dosage: 2
```

```text
erke@portfolio:~$ sudo cat .secrets
[sudo] password for guest:
permission denied.
also, this is javascript.
```

`sudo` and similar details can remain undocumented so that they feel like discoveries rather than core navigation.

## Neofetch Example

`neofetch` should report on Erke rather than the browser or operating system:

```text
              erke@portfolio
     ______   -------------------
    / ____/   OS: Bournemouth
   / __/      Role: Software Engineer
  / /___      Stack: TypeScript / React / Node
 /_____/      Cloud: AWS / GCP
              Languages: TR / EN / ES
              Uptime: 28 years
```

## Visual Direction

Use the terminal visual language without copying another site's exact palette.

| Element | Suggested direction |
| --- | --- |
| Page background | `#0a0e14` |
| Terminal surface | `#0d1117` |
| Primary text | `#d6deeb` |
| Muted text | `#637777` |
| Username | Soft green |
| Hostname | Soft cyan |
| Directories | Blue |
| Links | Turquoise |
| Highlights | Amber |
| Errors | Coral |

Use a narrow terminal viewport of roughly 760px on desktop, with a dark background, macOS-style window controls, subtle scan lines, and a responsive mobile layout.

Suitable fonts:

- JetBrains Mono
- Berkeley Mono
- Geist Mono
- Commit Mono

JetBrains Mono is the simplest free option.

## URL Behaviour

Commands should update the browser URL so pages are shareable and refreshable:

```text
cd projects
```

Could update the URL to:

```text
erke.dev/#/projects
```

And:

```text
cat projects/foo/README.md
```

Could update it to:

```text
erke.dev/#/projects/foo
```

On refresh, the app should reconstruct the relevant working directory and content from the route.

## V1 Technology Choice

Use vanilla TypeScript and Vite for V1. This interface has one small, deterministic client-side state model, so a framework would add dependencies without solving a current problem.

Keep the shell parser, virtual filesystem, content, and DOM rendering separate enough that a later React or Vue implementation can retain the domain logic. Revisit a framework only if the portfolio gains substantially more independently interactive UI, such as project detail views, themes, settings, or multiple panels.

The portfolio was initially built in an isolated subdirectory until it was ready to replace the previous website. It is now deployed from `terminal-portfolio/`; the previous site is archived in `legacy-grid-portfolio/`.

## Suggested Architecture

```text
Vanilla TypeScript + Vite
|
├── terminal.ts
├── Shell.ts
│   ├── parser
│   ├── command registry
│   └── history
├── filesystem.ts
├── commands/
│   ├── ls.ts
│   ├── cat.ts
│   ├── cd.ts
│   ├── open.ts
│   └── whoami.ts
└── content/
    ├── projects.ts
    ├── experience.ts
    └── profile.ts
```

All shell logic remains client-side and is deployed as static assets to S3.

## Later Enhancements

Do not add these in V1, but they could be fun subsequent additions:

- `tree` to show the filesystem hierarchy.
- Basic simulated pipes, such as `cat skills.txt | grep React`.
- Metadata search, such as `grep -r "typescript" projects`.
- Themes and command chaining.
- Fake SSH or network commands.
- Visitor-specific Easter eggs.
- An optional hidden experiment such as `./erke` or `chat`.

Avoid making an LLM chatbot central to the experience. It makes the site slower and less predictable; the charm of the terminal portfolio is that it is deterministic and genuinely explorable.
