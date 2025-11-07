/**
 * Airtable Client for PubliPUCP
 * Handles all data fetching from Airtable
 */

import Airtable from 'airtable';
import type { User, Category, Course, Project, ProcessedUser, ProcessedProject } from '../types/airtable';

const AIRTABLE_API_KEY = import.meta.env.AIRTABLE_API_KEY;
const BASE_ID = import.meta.env.AIRTABLE_BASE_ID || 'app9WURJGgbSPdDXy';

if (!AIRTABLE_API_KEY) {
  throw new Error('AIRTABLE_API_KEY is required');
}

// Initialize Airtable
const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(BASE_ID);

/**
 * Get all users from Airtable
 */
export async function getAllUsers(): Promise<User[]> {
  const records = await base('users').select().all();
  return records.map(record => ({
    id: record.id,
    fields: record.fields as User['fields']
  }));
}

/**
 * Get all categories from Airtable
 */
export async function getAllCategories(): Promise<Category[]> {
  const records = await base('categories').select().all();
  return records.map(record => ({
    id: record.id,
    fields: record.fields as Category['fields']
  }));
}

/**
 * Get all courses from Airtable
 */
export async function getAllCourses(): Promise<Course[]> {
  const records = await base('courses').select().all();
  return records.map(record => ({
    id: record.id,
    fields: record.fields as Course['fields']
  }));
}

/**
 * Get all projects from Airtable
 */
export async function getAllProjects(): Promise<Project[]> {
  const records = await base('projects').select().all();
  return records.map(record => ({
    id: record.id,
    fields: record.fields as Project['fields']
  }));
}

/**
 * Process user data for frontend
 */
export function processUser(user: User, projectCount: number = 0): ProcessedUser {
  const fullName = [
    user.fields.first_name,
    user.fields.last_name,
    user.fields.second_last_name
  ].filter(Boolean).join(' ');

  return {
    id: user.id,
    firstName: user.fields.first_name,
    lastName: user.fields.last_name,
    secondLastName: user.fields.second_last_name,
    fullName,
    code: user.fields.code,
    url: user.fields.url,
    email: user.fields.email,
    projectCount
  };
}

/**
 * Process project data for frontend
 */
export async function processProject(
  project: Project,
  usersMap: Map<string, User>,
  categoriesMap: Map<string, Category>,
  coursesMap: Map<string, Course>
): Promise<ProcessedProject> {
  // Process authors
  const authors = (project.fields.authors || [])
    .map(authorId => {
      const user = usersMap.get(authorId);
      if (!user) return null;
      return processUser(user);
    })
    .filter((author): author is ProcessedUser => author !== null);

  // Process categories
  const categories = (project.fields.category || [])
    .map(catId => categoriesMap.get(catId)?.fields.Name)
    .filter((name): name is string => !!name);

  // Process courses
  const courses = (project.fields.course || [])
    .map(courseId => coursesMap.get(courseId)?.fields.Name)
    .filter((name): name is string => !!name);

  // Process gallery images
  const gallery = [
    ...(project.fields.gallery_1 || []),
    ...(project.fields.gallery_2 || []),
    ...(project.fields.gallery_3 || []),
    ...(project.fields.gallery_4 || []),
    ...(project.fields.gallery_5 || [])
  ];

  // Process videos
  const videos = [
    project.fields.video_1,
    project.fields.video_2,
    project.fields.video_3,
    project.fields.video_4,
    project.fields.video_5
  ].filter((url): url is string => !!url);

  // Generate slug if not exists
  const slug = project.fields.slug || generateSlug(project.fields.title);

  return {
    id: project.id,
    numericId: project.fields.id,
    title: project.fields.title,
    description: project.fields.description,
    slug,
    cycle: project.fields.cycle,
    cover: project.fields.cover?.[0],
    url: project.fields.url,
    gallery,
    videos,
    authors,
    categories,
    courses,
    contact: project.fields.contact,
    createdAt: project.fields.created ? new Date(project.fields.created) : undefined,
    seo: {
      title: project.fields.seo_title || project.fields.title,
      description: project.fields.seo_description || project.fields.description || '',
      keywords: project.fields.keywords || []
    }
  };
}

/**
 * Generate slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Get all processed projects with related data
 */
export async function getAllProcessedProjects(): Promise<ProcessedProject[]> {
  // Fetch all data
  const [projects, users, categories, courses] = await Promise.all([
    getAllProjects(),
    getAllUsers(),
    getAllCategories(),
    getAllCourses()
  ]);

  // Create maps for quick lookup
  const usersMap = new Map(users.map(u => [u.id, u]));
  const categoriesMap = new Map(categories.map(c => [c.id, c]));
  const coursesMap = new Map(courses.map(c => [c.id, c]));

  // Process all projects
  const processedProjects = await Promise.all(
    projects.map(project => processProject(project, usersMap, categoriesMap, coursesMap))
  );

  return processedProjects;
}

/**
 * Get processed project by slug
 */
export async function getProjectBySlug(slug: string): Promise<ProcessedProject | null> {
  const projects = await getAllProcessedProjects();
  return projects.find(p => p.slug === slug) || null;
}

/**
 * Get all processed users with project counts
 */
export async function getAllProcessedUsers(): Promise<ProcessedUser[]> {
  const [users, projects] = await Promise.all([
    getAllUsers(),
    getAllProjects()
  ]);

  // Count projects per user
  const projectCounts = new Map<string, number>();
  projects.forEach(project => {
    (project.fields.authors || []).forEach(authorId => {
      projectCounts.set(authorId, (projectCounts.get(authorId) || 0) + 1);
    });
  });

  return users.map(user => processUser(user, projectCounts.get(user.id) || 0));
}
