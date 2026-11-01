export interface User {
  id: string;
  email: string;
  clerkId: string;
  displayName?: string;
  avatarUrl?: string;
}

export type MemoryType = 'personal' | 'preference' | 'tool' | 'project' | 'workflow' | 'decision' | 'template' | 'entity';

export interface Memory {
  id: string;
  userId: string;
  projectId?: string;
  conversationId?: string;
  type: MemoryType;
  content: string;
  structuredData: Record<string, any>;
  score: number;
  confidence: number;
  status: 'pending_review' | 'active' | 'archived' | 'rejected';
}
