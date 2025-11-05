export type Id = string;

export type Role = 'admin' | 'designer' | 'editor' | 'viewer';

export interface User {
  id: Id;
  orgId: Id;
  role: Role;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface BrandKit {
  id: Id;
  orgId: Id;
  palettes: string[][];
  fonts: { family: string; weights: number[] }[];
  logos: { name: string; url: string }[];
  rules?: Record<string, unknown>;
}

export interface Deck {
  id: Id;
  orgId: Id;
  ownerId: Id;
  title: string;
  status: 'draft' | 'published';
}

export interface Slide {
  id: Id;
  deckId: Id;
  index: number;
  sceneJson: unknown;
  notes?: string;
}

export interface Comment {
  id: Id;
  deckId: Id;
  slideId: Id;
  selection?: unknown;
  body: string;
  authorId: Id;
  resolved: boolean;
}

export interface Lock {
  id: Id;
  scope: 'element' | 'slide';
  subjectId: Id;
  deckId: Id;
  createdBy: Id;
  reason?: string;
  expiresAt?: string;
}

export interface VersionEntry {
  id: Id;
  deckId: Id;
  slideId?: Id;
  createdAt: string;
  authorId: Id;
  diff?: unknown;
}

export interface ShareLink {
  id: Id;
  deckId: Id;
  role: 'viewer' | 'editor';
  token: string;
  expiresAt?: string;
}


