# Power Actions

A [Millennium](https://steambrew.app/) plugin that runs a power action when your Steam downloads finish — like [SteamShutdown](https://github.com/akorb/SteamShutdown), built directly into the Steam client UI.

## Features

- **A power button on the Downloads page** — styled to match the native settings gear, sitting right next to it. Click it to open the picker.
- **Custom Steam-styled picker panel** (not the OS context menu) with radio buttons for the action and checkboxes for what to wait for — stays open across clicks so you can tick multiple games in one go.
- **Choose the action:** Shut down and Restart are always offered; Sleep, Hibernate, Lock screen, and Quit Steam can be toggled on/off in the plugin settings.
- **Wait for specific games** — pick one or more titles from the current download queue instead of the whole queue. Fires once every picked game finishes downloading, even if others are still going. If you remove a watched game from the queue before it finishes, it's automatically dropped from the list (and the plugin disarms if that was the last one).
- **Cancellable countdown** — a Steam-styled card slides in with a live countdown, a **Cancel** button, and a **Now** button.
- **One-shot** — arming disarms itself after firing, so a later download burst won't surprise you.
- **Only after new installs** (optional) — ignore routine updates and act only when a freshly installed game finishes.
- **Localized** into 18 languages, matching the Steam client's own language setting.

## How it works

The frontend watches `SteamClient.Downloads` for the download queue (with a couple of fallbacks for quirks in Steam's own callback) and, while armed, starts the countdown once the watched work is done. All settings — defaults, validation, which actions exist, the countdown range — live in the Lua backend behind a single `set_setting` entry point, so the frontend is just a thin, reactive renderer. When the countdown elapses, the backend runs the platform power command (`shutdown /s`, `shutdown /r`, `shutdown /h`, `SetSuspendState`, `LockWorkStation`); "Quit Steam" is handled directly via `SteamClient.User.StartShutdown`.

There's no probing of what your machine actually supports (that used to flash console windows on startup) — you simply enable the actions you want in the settings page.

> **Platform:** the OS power commands are Windows-only. "Quit Steam" works on any platform.

## Settings

Open the plugin's page in Millennium to choose which optional actions appear in the picker (Shut down / Restart are always on), plus the "only after new installs" toggle.

## Prerequisites

- **[Millennium](https://github.com/SteamClientHomebrew/Millennium)**

## Building

```bash
bun install
bun run build   # production build
bun run dev     # development build
bun run ship    # production build + copy runtime files into Steam/millennium/plugins
```

Enable **Power Actions** in Millennium's plugin settings afterwards.
