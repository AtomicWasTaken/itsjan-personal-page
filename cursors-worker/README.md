# itsjan-cursors

A tiny Cloudflare Worker + Durable Object that powers the live multiplayer cursors on [itsjan.dev](https://itsjan.dev).

Every visitor joins a single global "room", gets an anonymous name (e.g. *Quiet Otter*) and a color, then broadcasts cursor positions to everyone else via WebSocket. Cursor positions travel as % of viewport so they translate cleanly across screen sizes.

Uses the WebSocket Hibernation API so idle Durable Objects don't burn budget.

## Deploy

```bash
cd cursors-worker
bun install        # or npm install
bun run deploy     # runs `wrangler deploy`
```

First deploy will prompt you to log in to Cloudflare and create the Durable Object. After deploy you'll get a URL like `https://itsjan-cursors.<your-account>.workers.dev`.

Set the WebSocket URL in the main site's env:

```
PUBLIC_CURSORS_WSS=wss://itsjan-cursors.<your-account>.workers.dev/ws
```

(Add to `.dev.vars` for local dev, and as a Pages env var for production.)

If `PUBLIC_CURSORS_WSS` is unset, the client silently skips the cursor feature — the site still works normally.

## Local dev

```bash
bun run dev
```

Serves on `ws://localhost:8788/ws`. Point the main site at it:

```
PUBLIC_CURSORS_WSS=ws://localhost:8788/ws
```

## Wire protocol

All messages are JSON.

**Server → client on connect**:
```json
{ "type": "welcome", "self": { "id": "...", "name": "Quiet Otter", "color": "#ef4444" }, "peers": [{ "id": "...", "name": "...", "color": "..." }, ...] }
```

**Server → other clients when someone joins**:
```json
{ "type": "join", "id": "...", "name": "Brave Fox", "color": "#22c55e" }
```

**Server → other clients when someone leaves**:
```json
{ "type": "leave", "id": "..." }
```

**Client → server when cursor moves** (sender throttles to ~30 fps):
```json
{ "type": "move", "x": 0.42, "y": 0.78 }
```

**Server → other clients on every move**:
```json
{ "type": "move", "id": "...", "x": 0.42, "y": 0.78 }
```

`x` and `y` are clamped to `[0, 1]` server-side as a safety net.
