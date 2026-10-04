import "./styles.css";

type Directory = {
  type: "directory";
  children: Record<string, Node>;
};

type File = {
  type: "file";
  content: string;
};

type Link = {
  type: "link";
  label: string;
  url: string;
};

type Node = Directory | File | Link;

const directory = (children: Record<string, Node>): Directory => ({
  type: "directory",
  children,
});
const file = (content: string): File => ({ type: "file", content });
const link = (label: string, url: string): Link => ({
  type: "link",
  label,
  url,
});

const filesystem = directory({
  "README.md": file(`# erke canbazoglu

software engineer
london / bournemouth, uk

i build web, mobile and cloud products.
currently working in private-markets fintech.

use \`ls\` to explore, or \`help\` for commands.`),
  about: directory({
    "me.md": file(
      "Software engineer focused on thoughtful, reliable product experiences.",
    ),
    "now.md": file(
      "Building products for private markets fintech and enjoying a good coffee.",
    ),
  }),
  experience: directory({
    titanbay: directory({
      "README.md": file(
        "# Titanbay\n\nBuilding technology for private-market investing.",
      ),
    }),
  }),
  projects: directory({
    manjo: link(
      "Food-ordering social marketplace for university students.",
      "https://manjoapp.com/",
    ),
    omnifood: link(
      "Subscription meal-delivery landing page.",
      "https://erkecanbazoglu.github.io/omnifood/",
    ),
    spoilage: link(
      "Data visualisation for spoilage analysis.",
      "https://front-end-exercise-two.vercel.app/",
    ),
  }),
  skills: directory({
    languages: file("Node.js, TypeScript, Go, Python, SQL"),
    frontend: file("Vue, React, Flutter"),
    backend: file("Node.js, TypeScript, APIs, PostgreSQL/NoSQL, dbt"),
    cloud: file("AWS, GCP"),
  }),
  education: directory({
    "koc-university.md": file("Koc University"),
  }),
  links: directory({
    github: link(
      "github.com/erkecanbazoglu",
      "https://github.com/erkecanbazoglu",
    ),
    linkedin: link(
      "linkedin.com/in/erkecanbazoglu",
      "https://www.linkedin.com/in/erkecanbazoglu/",
    ),
    email: link("erkecanbazoglu@gmail.com", "mailto:erkecanbazoglu@gmail.com"),
  }),
  ".coffee": file(
    "ERROR: dependency required for successful compilation.\nrecommended dosage: 2",
  ),
  ".secrets": file("permission denied.\nalso, this is javascript."),
});

const aliases: Record<string, string> = {
  experience: "~/experience",
  projects: "~/projects",
  skills: "~/skills",
  education: "~/education",
  contact: "~/links",
};

const output = document.querySelector<HTMLDivElement>("#terminal-output");
const form = document.querySelector<HTMLFormElement>("#command-form");
const input = document.querySelector<HTMLInputElement>("#command-input");
const promptPath = document.querySelector<HTMLElement>("#prompt-path");
const windowPath = document.querySelector<HTMLElement>("#window-path");
const terminal = document.querySelector<HTMLElement>(".terminal");
const restoreButton = document.querySelector<HTMLButtonElement>(
  "#terminal-restore",
);
const expandButton = document.querySelector<HTMLButtonElement>(
  '[data-window-action="expand"]',
);
const themeButtons =
  document.querySelectorAll<HTMLButtonElement>("[data-theme]");

if (
  !output ||
  !form ||
  !input ||
  !promptPath ||
  !windowPath ||
  !terminal ||
  !restoreButton ||
  !expandButton
) {
  throw new Error("Terminal could not be initialised.");
}

let currentPath: string[] = [];
let commandHistory: string[] = [];
let historyIndex = 0;

type Theme = "dark" | "light";
type WindowState = "open" | "closed" | "minimized";

const windowTransitionDuration = 360;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let windowState: WindowState = "open";
let windowTransition: number | undefined;

const setTheme = (theme: Theme, persist = false) => {
  document.documentElement.dataset.theme = theme;
  themeButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.theme === theme));
  });
  if (persist) localStorage.setItem("portfolio-theme", theme);
};

const finishWindowTransition = (callback: () => void) => {
  windowTransition = window.setTimeout(
    () => {
      windowTransition = undefined;
      callback();
    },
    reducedMotion.matches ? 0 : windowTransitionDuration,
  );
};

const hideTerminal = (nextState: Exclude<WindowState, "open">) => {
  if (windowState !== "open" || windowTransition !== undefined) return;

  terminal.inert = true;
  terminal.setAttribute("aria-hidden", "true");
  terminal.dataset.windowState = nextState;

  finishWindowTransition(() => {
    windowState = nextState;
    terminal.hidden = true;
    restoreButton.textContent =
      nextState === "closed" ? "Restore terminal" : "Open terminal";
    restoreButton.setAttribute(
      "aria-label",
      nextState === "closed" ? "Restore terminal" : "Restore minimized terminal",
    );
    restoreButton.hidden = false;
    restoreButton.focus();
  });
};

const restoreTerminal = () => {
  if (windowState === "open" || windowTransition !== undefined) return;

  terminal.hidden = false;
  restoreButton.disabled = true;

  requestAnimationFrame(() => {
    terminal.dataset.windowState = "open";
    finishWindowTransition(() => {
      windowState = "open";
      terminal.inert = false;
      terminal.removeAttribute("aria-hidden");
      restoreButton.disabled = false;
      restoreButton.hidden = true;
      input.focus({ preventScroll: true });
    });
  });
};

const toggleExpandedTerminal = () => {
  if (windowState !== "open" || windowTransition !== undefined) return;

  const expanded = terminal.dataset.expanded === "true";
  terminal.dataset.expanded = String(!expanded);
  expandButton.setAttribute("aria-pressed", String(!expanded));
  expandButton.setAttribute(
    "aria-label",
    expanded ? "Expand terminal" : "Restore terminal size",
  );
};

const pathLabel = () =>
  currentPath.length ? `~/${currentPath.join("/")}` : "~";

const updatePrompt = () => {
  const path = pathLabel();
  promptPath.textContent = path;
  windowPath.textContent = path;
  document.title = `erke@portfolio:${path}`;
};

const print = (text = "", className = "") => {
  const line = document.createElement("p");
  line.className = `output-line ${className}`;
  line.textContent = text;
  output.append(line);
  return line;
};

const printCommand = (command: string) => {
  const line = document.createElement("p");
  line.className = "output-line entered-command";
  line.innerHTML = `<span class="user">erke</span>@<span class="host">portfolio</span>:<span class="path">${pathLabel()}</span>$ `;
  line.append(command);
  output.append(line);
};

const resolvePath = (value: string) => {
  const absolute =
    value.startsWith("/") || value === "~" || value.startsWith("~/");
  const parts = value.replace(/^~\/?/, "").split("/");
  const path = absolute ? [] : [...currentPath];

  for (const part of parts) {
    if (!part || part === ".") continue;
    if (part === "..") path.pop();
    else path.push(part);
  }

  let node: Node = filesystem;
  for (const part of path) {
    if (node.type !== "directory" || !node.children[part]) return null;
    node = node.children[part];
  }

  return { node, path };
};

const updateRoute = () => {
  window.history.replaceState(null, "", `#/${currentPath.join("/")}`);
};

const renderListing = (name: string, node: Node) => {
  const item = document.createElement("button");
  item.type = "button";
  item.className = `listing-item ${node.type}`;
  item.textContent = node.type === "directory" ? `${name}/` : name;
  item.dataset.command =
    node.type === "directory"
      ? `cd ${name}`
      : node.type === "link"
        ? `open ${name}`
        : `cat ${name}`;
  return item;
};

const list = (target?: string, includeHidden = false) => {
  const resolved = resolvePath(target || ".");
  if (!resolved) {
    print(`ls: cannot access '${target}': No such file or directory`, "error");
    return;
  }
  if (resolved.node.type !== "directory") {
    print(target || "", resolved.node.type);
    return;
  }

  const line = document.createElement("p");
  line.className = "output-line listing";
  Object.entries(resolved.node.children)
    .filter(([name]) => includeHidden || !name.startsWith("."))
    .forEach(([name, node]) => line.append(renderListing(name, node)));
  output.append(line);
};

const changeDirectory = (target?: string) => {
  if (!target) {
    currentPath = [];
  } else {
    const resolved = resolvePath(target);
    if (!resolved || resolved.node.type !== "directory") {
      print(`cd: ${target}: No such directory`, "error");
      return;
    }
    currentPath = resolved.path;
  }
  updatePrompt();
  updateRoute();
};

const showHelp = () => {
  print(
    `available commands:
  help          show this message
  ls [-a] [dir] list files and directories
  cd <dir>      change directory
  cat <file>    read a file
  pwd           show the current directory
  open <link>   open a project or contact link
  whoami        show a short introduction
  clear         clear the terminal
  history       show previous commands
  neofetch      show a portfolio system summary

aliases: experience, projects, skills, education, contact`,
    "preformatted",
  );
};

const showNeofetch = () => {
  print(
    `              erke@portfolio
     ______   -------------------
    / ____/   Based in: Bournemouth
   / __/      Role: Software Engineer
   / /___     Stack: TypeScript / Web / Cloud
  /_____/     Languages: TR / EN / ES
              Current: Private-markets fintech`,
    "neofetch",
  );
};

const showWelcome = () => {
  const readme = filesystem.children["README.md"];
  printCommand("cat ~/README.md");
  if (readme?.type === "file") print(readme.content, "preformatted");
  print("type 'help' to explore", "muted");
};

const runCommand = (rawCommand: string, record = true) => {
  const command = rawCommand.trim();
  if (!command) return;

  printCommand(command);
  if (record) {
    commandHistory.push(command);
    historyIndex = commandHistory.length;
  }

  const [name, ...args] = command.split(/\s+/);
  if (name in aliases) {
    changeDirectory(aliases[name]);
    list();
  } else {
    switch (name) {
      case "help":
        showHelp();
        break;
      case "ls": {
        const includeHidden = args[0] === "-a";
        list(
          args.find((arg) => arg !== "-a"),
          includeHidden,
        );
        break;
      }
      case "cd":
        changeDirectory(args[0]);
        break;
      case "cat": {
        if (!args[0]) {
          print("cat: missing file operand", "error");
          break;
        }
        const resolved = resolvePath(args[0]);
        if (!resolved || resolved.node.type === "directory") {
          print(`cat: ${args[0]}: No such file`, "error");
        } else if (resolved.node.type === "link") {
          print(`${args[0]} is a link. Use 'open ${args[0]}'.`, "muted");
        } else {
          print(resolved.node.content, "preformatted");
        }
        break;
      }
      case "pwd":
        print(pathLabel());
        break;
      case "open": {
        if (!args[0]) {
          print("open: missing link operand", "error");
          break;
        }
        const resolved = resolvePath(args[0]);
        if (!resolved || resolved.node.type !== "link") {
          print(`open: ${args[0]}: Not a link`, "error");
        } else {
          window.open(resolved.node.url, "_blank", "noopener,noreferrer");
          print(`opening ${resolved.node.label}`, "muted");
        }
        break;
      }
      case "whoami":
        print("Erke Canbazoglu, a software engineer based in the UK.");
        break;
      case "clear":
        output.replaceChildren();
        showWelcome();
        break;
      case "history":
        commandHistory.forEach((entry, index) =>
          print(`${index + 1}  ${entry}`),
        );
        break;
      case "neofetch":
        showNeofetch();
        break;
      default:
        print(`-bash: ${name}: command not found. try 'help'`, "error");
    }
  }
  output.scrollTop = output.scrollHeight;
};

const autocomplete = () => {
  const value = input.value;
  const [first, ...rest] = value.split(/\s+/);
  const commands = [
    "help",
    "ls",
    "cd",
    "cat",
    "pwd",
    "open",
    "whoami",
    "clear",
    "history",
    "neofetch",
    ...Object.keys(aliases),
  ];

  if (!rest.length) {
    const match = commands.find((command) => command.startsWith(first));
    if (match) input.value = match;
    return;
  }

  if (!["cd", "cat", "open"].includes(first)) return;

  const target = rest.at(-1) || "";
  const lastSlash = target.lastIndexOf("/");
  const directoryPrefix =
    lastSlash === -1 ? "" : target.slice(0, lastSlash + 1);
  const partialName = target.slice(lastSlash + 1);
  const directoryTarget = directoryPrefix
    ? directoryPrefix.slice(0, -1) || "/"
    : ".";
  const resolved = resolvePath(directoryTarget);
  if (!resolved || resolved.node.type !== "directory") return;

  const expectedType =
    first === "cd" ? "directory" : first === "cat" ? "file" : "link";
  const match = Object.entries(resolved.node.children).find(
    ([entry, node]) =>
      node.type === expectedType && entry.startsWith(partialName),
  )?.[0];
  if (match)
    input.value = `${first} ${[...rest.slice(0, -1), `${directoryPrefix}${match}`].join(" ")}`;
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  runCommand(input.value);
  input.value = "";
});

input.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") {
    event.preventDefault();
    if (historyIndex > 0) historyIndex -= 1;
    input.value = commandHistory[historyIndex] || "";
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    if (historyIndex < commandHistory.length) historyIndex += 1;
    input.value = commandHistory[historyIndex] || "";
  } else if (event.key === "Tab") {
    event.preventDefault();
    autocomplete();
  }
});

document.addEventListener("click", (event) => {
  if (window.getSelection()?.toString()) return;
  const target = event.target as HTMLElement;
  if (target.closest("[data-window-action], #terminal-restore, [data-theme]")) {
    return;
  }
  const command =
    target.closest<HTMLElement>("[data-command]")?.dataset.command;
  if (command) runCommand(command);
  input.focus();
});

document
  .querySelectorAll<HTMLButtonElement>("[data-window-action]")
  .forEach((button) => {
    button.addEventListener("click", () => {
      switch (button.dataset.windowAction) {
        case "close":
          hideTerminal("closed");
          break;
        case "minimize":
          hideTerminal("minimized");
          break;
        case "expand":
          toggleExpandedTerminal();
          break;
      }
    });
  });

restoreButton.addEventListener("click", restoreTerminal);

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const theme = button.dataset.theme;
    if (theme === "dark" || theme === "light") setTheme(theme, true);
  });
});

window.addEventListener("hashchange", () => {
  const route = window.location.hash.replace(/^#\/?/, "");
  const resolved = resolvePath(`/${route}`);
  if (resolved?.node.type === "directory") {
    currentPath = resolved.path;
    updatePrompt();
  }
});

const initialRoute = window.location.hash.replace(/^#\/?/, "");
if (initialRoute) {
  const resolved = resolvePath(`/${initialRoute}`);
  if (resolved?.node.type === "directory") currentPath = resolved.path;
}
updatePrompt();
setTheme(
  localStorage.getItem("portfolio-theme") === "light" ? "light" : "dark",
);
showWelcome();
