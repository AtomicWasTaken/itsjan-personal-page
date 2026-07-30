// Realtime multiplayer cursor service for itsjan.dev
//
// Single Durable Object instance ("global" room) holds every active visitor's
// WebSocket. Each socket gets assigned an anonymous name + color on connect.
// Cursor positions are sent as % of viewport (0..1) so they translate across
// device sizes.

interface Attachment {
  id: string;
  name: string;
  color: string;
}

interface Env {
  CURSORS: DurableObjectNamespace;
}

type CursorMode =
  | "default"
  | "link"
  | "pill"
  | "link-amber"
  | "cta-primary"
  | "cta-secondary"
  | "text"
  | "view"
  | "accent"
  | "squiggly";

type MoveMessage = {
  type: "move";
  x: number;
  y: number;
  anchor?: unknown;
  ax?: unknown;
  ay?: unknown;
};

type StateMessage = { type: "state"; mode?: unknown; pressed?: unknown };
type SelectionMessage = { type: "selection"; anchor?: unknown; startOffset?: unknown; endOffset?: unknown };

const ADJ = [
  "Quiet", "Curious", "Brave", "Calm", "Bright", "Kind", "Wise", "Sneaky",
  "Gentle", "Cosmic", "Mellow", "Hidden", "Lone", "Eager", "Bold", "Quick",
  "Drowsy", "Plucky", "Stoic", "Wandering", "Sly", "Frosty", "Wild", "Dapper",
];

const ANIMAL = [
  "Otter", "Falcon", "Fox", "Wolf", "Hawk", "Owl", "Lynx", "Heron", "Crow",
  "Stoat", "Crane", "Mink", "Lemur", "Tapir", "Marmot", "Capybara", "Badger",
  "Raven", "Ibex", "Pangolin", "Quokka", "Ocelot", "Caracal", "Kestrel",
];

// Distinct colors that read well on the page's dark bg (#0a0a0a).
// Avoiding amber so they don't compete with the site's accent.
const COLORS = [
  "#ef4444", // red
  "#84cc16", // lime
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#ec4899", // pink
  "#f43f5e", // rose
  "#facc15", // yellow
];

const ROOM_NAME = "global";
const MAX_ANCHOR_LENGTH = 500;
const ALLOWED_MODES = new Set<string>([
  "default", "link", "pill", "link-amber", "cta-primary", "cta-secondary",
  "text", "view", "accent", "squiggly",
]);

const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const generateName = () => `${pick(ADJ)} ${pick(ANIMAL)}`;
const generateColor = () => pick(COLORS);

export class CursorsRoom implements DurableObject {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("upgrade") !== "websocket") {
      return new Response("Expected WebSocket upgrade", { status: 426 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // Hibernation-friendly: attach metadata that survives sleeps
    const attachment: Attachment = {
      id: crypto.randomUUID(),
      name: generateName(),
      color: generateColor(),
    };
    server.serializeAttachment(attachment);

    this.state.acceptWebSocket(server);

    // Snapshot of who's already here (excluding the new socket)
    const peers: Attachment[] = [];
    for (const ws of this.state.getWebSockets()) {
      if (ws === server) continue;
      const a = ws.deserializeAttachment() as Attachment | null;
      if (a) peers.push(a);
    }

    // Welcome the newcomer with their own identity + everyone else's
    server.send(JSON.stringify({
      type: "welcome",
      self: attachment,
      peers,
    }));

    // Tell everyone else a new cursor joined
    this.broadcast({ type: "join", ...attachment }, server);

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    const attachment = getAttachment(ws);
    if (!attachment) return;

    let data: unknown;
    try {
      const raw = typeof message === "string"
        ? message
        : new TextDecoder().decode(message);
      data = JSON.parse(raw);
    } catch {
      return;
    }

    if (isMoveMessage(data)) {
      // anchor + ax/ay are DOM-relative and survive different layouts.
      // x + y are fractional viewport fallback for when no anchor was resolvable
      this.broadcast({
        type: "move",
        id: attachment.id,
        x: clamp01(data.x),
        y: clamp01(data.y),
        anchor: truncateAnchor(data.anchor),
        ax: typeof data.ax === "number" ? data.ax : undefined,
        ay: typeof data.ay === "number" ? data.ay : undefined,
      }, ws);
      return;
    }

    if (isStateMessage(data)) {
      this.broadcast({
        type: "state",
        id: attachment.id,
        mode: sanitizeMode(data.mode),
        pressed: !!data.pressed,
      }, ws);
      return;
    }

    if (isSelectionMessage(data)) {
      // Prefer text-offset-within-anchor (renders pixel-perfect on any layout).
      // Falls back to rects[] for when DOM walks failed on the sender.
      this.broadcast({
        type: "selection",
        id: attachment.id,
        anchor: truncateAnchor(data.anchor),
        startOffset: typeof data.startOffset === "number" ? data.startOffset : undefined,
        endOffset: typeof data.endOffset === "number" ? data.endOffset : undefined,
      }, ws);
      return;
    }
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    const attachment = getAttachment(ws);
    if (attachment?.id) {
      this.broadcast({ type: "leave", id: attachment.id });
    }
  }

  async webSocketError(ws: WebSocket): Promise<void> {
    return this.webSocketClose(ws);
  }

  private broadcast(message: object, except?: WebSocket): void {
    const payload = JSON.stringify(message);
    for (const ws of this.state.getWebSockets()) {
      if (ws === except) continue;
      try { ws.send(payload); } catch { /* socket already closed */ }
    }
  }
}

function isMoveMessage(d: unknown): d is MoveMessage {
  return (
    isRecord(d) &&
    d.type === "move" &&
    typeof d.x === "number" &&
    typeof d.y === "number"
  );
}

function isStateMessage(d: unknown): d is StateMessage {
  return isRecord(d) && d.type === "state";
}

function isSelectionMessage(d: unknown): d is SelectionMessage {
  return isRecord(d) && d.type === "selection";
}

function sanitizeMode(m: unknown): CursorMode {
  return typeof m === "string" && ALLOWED_MODES.has(m) ? m as CursorMode : "default";
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getAttachment(socket: WebSocket): Attachment | null {
  return socket.deserializeAttachment() as Attachment | null;
}

function truncateAnchor(value: unknown): string | undefined {
  return typeof value === "string" ? value.slice(0, MAX_ANCHOR_LENGTH) : undefined;
}

// CORS headers. The main site lives at itsjan.dev, worker at workers.dev subdomain.
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Upgrade, Connection",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname === "/ws") {
      // Single global room. Every visitor joins the same one.
      const id = env.CURSORS.idFromName(ROOM_NAME);
      const room = env.CURSORS.get(id);
      return room.fetch(request);
    }

    if (url.pathname === "/" || url.pathname === "/health") {
      return new Response("itsjan-cursors · ok\n", {
        status: 200,
        headers: { "content-type": "text/plain", ...corsHeaders },
      });
    }

    return new Response("not found", { status: 404, headers: corsHeaders });
  },
} satisfies ExportedHandler<Env>;
