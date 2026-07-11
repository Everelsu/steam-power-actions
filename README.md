# Power Actions

A [Millennium](https://steambrew.app/) plugin that runs a power action when your Steam downloads finish — like [SteamShutdown](https://github.com/akorb/SteamShutdown), built into the Steam client UI.

## Features

- **Auto-run on download completion** — arm it, and when all active downloads finish, your chosen action runs.
- **Choose the action:** shut down, restart, sleep, hibernate, lock screen, or quit Steam.
- **Cancellable countdown** — a card slides in bottom-right with a live countdown, a **Cancel** button, and a **Now** button.
- **One-shot** — arming disarms itself after firing, so a later download burst won't surprise you.
- **Only after new installs** (optional) — ignore routine updates and act only when a freshly installed game finishes.
- **Test countdown** button to preview the flow without waiting for a download.

## How it works

Pure client plugin. The frontend watches `SteamClient.Downloads` for the transition from active downloads to an idle queue and, while armed, starts the countdown. When it elapses, a tiny Lua backend runs the platform power command (`shutdown /s`, `shutdown /r`, `shutdown /h`, `SetSuspendState`, `LockWorkStation`); "Quit Steam" uses `SteamClient.User.StartShutdown`.

> **Platform:** the OS power commands are Windows-only. On other platforms the "Quit Steam" action still works.

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
