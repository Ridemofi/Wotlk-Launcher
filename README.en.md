# WotLK Launcher

<p align="center">
  <a href="./README.md">Spanish</a> | <strong>English</strong>
</p>

A desktop launcher for **World of Warcraft: Wrath of the Lich King 3.3.5a**.

Built with **Electron**, **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **i18next**.

## Features

- Local WotLK client path selection and validation.
- Direct game launch through `Wow.exe`.
- Automatic `realmlist.wtf` management.
- Built-in default server list and custom realmlist support.
- Add, edit, delete, and apply custom realmlists.
- Cache size display and controlled Cache cleanup.
- WTF backup creation as compressed `.zip` files.
- WTF restoration from the latest backup.
- Backup folder shortcut.
- Screenshots folder detection and quick access.
- Disk usage scan for important client folders.
- Settings modal with:
  - language selector;
  - minimize launcher when opening the game;
  - clear Cache when opening the game.
- Spanish and English interface support.
- Success toast notifications and error modals.
- Portable Windows build support.

## Current Tools

- **Cache**: shows current Cache size and can clean the folder contents.
- **Disk usage**: scans client folders such as `Data`, `Interface/AddOns`, `Screenshots`, `WTF`, `Cache`, and `Logs`.
- **WTF**: creates and restores configuration backups.
- **Screenshots**: shows screenshot count and opens the Screenshots folder.

## Backups

WTF backups are stored in the launcher user data directory:

```text
Backups/WTF
```

The launcher keeps up to 10 WTF backups and removes the oldest ones when the limit is exceeded.

## Internationalization

The launcher currently supports:

- Spanish (`es`)
- English (`en`)

The selected language is saved in `settings.json` and restored when the app opens again.

## Roadmap

### AddOns

Planned AddOns section:

- Detect installed AddOns from `Interface/AddOns`.
- Show AddOn name, folder, and basic status.
- Enable or disable AddOns from the launcher.
- Open the AddOns folder quickly.
- Add future support for downloading or updating selected AddOns.

### Mods

Planned Mods section:

- Manage optional client patches and visual enhancements.
- Detect installed patch files.
- Show enabled/available mod status.
- Provide links or controlled downloads for external HD patches.
- Validate files before applying or replacing client mods.

## Development

Install dependencies:

```bash
npm install
```

Run in development mode:

```bash
npm run dev
```

Run type checks:

```bash
npm run typecheck
```

Run lint:

```bash
npm run lint
```

Build the app:

```bash
npm run build
```

Build the Windows portable executable:

```bash
npm run build:win
```

## Tech Stack

- Electron
- React
- TypeScript
- Vite
- Tailwind CSS
- i18next
- electron-builder

## License

No license has been defined yet.
