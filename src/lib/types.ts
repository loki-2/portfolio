// ─── Notion rich-text atom ────────────────────────────────────────────────────
export interface NotionAnnotations {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
  color: string;
}

export interface NotionRichText {
  type: string;
  plain_text: string;
  href: string | null;
  annotations: NotionAnnotations;
}

// ─── Notion block ─────────────────────────────────────────────────────────────
export interface NotionBlock {
  id: string;
  type: string;
  has_children: boolean;
  // Each block type stores its payload under its own key (e.g. block.paragraph)
  [key: string]: unknown;
}

// ─── Project — as stored in Supabase and passed around the app ────────────────
export interface NotionProject {
  notionPageId: string;    // Notion page ID (without dashes)
  title: string;
  subtext: string;
  role: string;
  team: string;
  duration: string;
  methods: string;
  tags: string[];
  blocks: NotionBlock[];   // raw Notion block list, stored as JSONB
  updatedAt: string;       // ISO timestamp
}

// ─── Grouped content section (H1 = section boundary) ─────────────────────────
export interface ProjectSection {
  title: string;
  blocks: NotionBlock[];
}

// ─── Work card shown on the home page ────────────────────────────────────────
export interface WorkItem {
  title: string;
  description: string;
  tags: string[];
  bgClass: string;
  bgGradient?: string;    // optional inline gradient override (e.g. for specific cards)
  coverImage?: string;    // URL to cover image shown on the right of the card
  notionPageId: string;   // Notion page ID (without dashes) — used for routing
}
