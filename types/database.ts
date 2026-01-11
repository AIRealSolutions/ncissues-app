export interface Bill {
  id: number;
  bill_number: string;
  title: string;
  chamber: 'house' | 'senate';
  status: string;
  topic: string | null;
  summary: string | null;
  full_text: string | null;
  introduced_date: string | null;
  primary_sponsor: string | null;
  cosponsors: string[] | null;
  ncleg_url: string | null;
  last_action: string | null;
  last_action_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: number;
  user_id: string;
  topics: string[] | null;
  municipalities: string[] | null;
  notification_frequency: 'daily' | 'weekly' | 'immediate';
  email_enabled: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  author_id: string | null;
  category: string | null;
  tags: string[] | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Legislator {
  id: number;
  name: string;
  chamber: 'house' | 'senate';
  district: string | null;
  party: string | null;
  email: string | null;
  phone: string | null;
  office_address: string | null;
  website_url: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: number;
  user_id: string | null;
  legislator_id: number;
  bill_id: number | null;
  subject: string;
  message: string;
  position: 'support' | 'oppose' | 'neutral' | null;
  sent_at: string;
  created_at: string;
}
