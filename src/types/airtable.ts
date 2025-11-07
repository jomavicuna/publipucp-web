/**
 * Airtable Types for PubliPUCP
 * Based on cleaned database schema
 */

export interface AirtableAttachment {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
  thumbnails?: {
    small: { url: string; width: number; height: number };
    large: { url: string; width: number; height: number };
    full: { url: string; width: number; height: number };
  };
}

export interface User {
  id: string;
  fields: {
    first_name: string;
    last_name?: string;
    second_last_name?: string;
    code?: string;
    url?: string;
    email?: string;
    posts_id?: string[];
    tickets?: string[];
  };
}

export interface Category {
  id: string;
  fields: {
    Name: string;
    projects?: string[];
  };
}

export interface Course {
  id: string;
  fields: {
    Name: string;
    projects?: string[];
  };
}

export interface Project {
  id: string;
  fields: {
    id: number;
    title: string;
    description?: string;
    course?: string[]; // Array of course IDs
    cycle?: string; // e.g. "2025-1", "2024-2"
    category?: string[]; // Array of category IDs
    cover?: AirtableAttachment[];
    url?: string;
    gallery_1?: AirtableAttachment[];
    gallery_2?: AirtableAttachment[];
    gallery_3?: AirtableAttachment[];
    gallery_4?: AirtableAttachment[];
    gallery_5?: AirtableAttachment[];
    video_1?: string;
    video_2?: string;
    video_3?: string;
    video_4?: string;
    video_5?: string;
    authors?: string[]; // Array of user IDs
    contact?: string;
    created?: string;
    seo_title?: string;
    seo_description?: string;
    slug?: string;
    keywords?: string[];
    published_to_webflow?: boolean;
  };
}

// Processed types for frontend use
export interface ProcessedUser {
  id: string;
  firstName: string;
  lastName?: string;
  secondLastName?: string;
  fullName: string;
  code?: string;
  url?: string;
  email?: string;
  projectCount: number;
}

export interface ProcessedProject {
  id: string;
  numericId: number;
  title: string;
  description?: string;
  slug: string;
  cycle?: string;
  cover?: AirtableAttachment;
  url?: string;
  gallery: AirtableAttachment[];
  videos: string[];
  authors: ProcessedUser[];
  categories: string[];
  courses: string[];
  contact?: string;
  createdAt?: Date;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export interface Ticket {
  id: string;
  fields: {
    type: 'update-users' | 'update-images' | 'update-videos';
    project?: string[]; // Link to projects
    'update-users'?: string[]; // Link to users (only for type: update-users)
    notes?: string; // Quantity or "TODO"
    created?: string; // Auto-created timestamp
  };
}
