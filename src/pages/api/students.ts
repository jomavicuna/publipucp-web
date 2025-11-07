/**
 * API Endpoint for getting all students
 * GET /api/students
 */

import type { APIRoute } from 'astro';
import { getAllProcessedUsers } from '../../lib/airtable';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const users = await getAllProcessedUsers();

    // Return simplified user data for the modal
    const simplifiedUsers = users.map(user => ({
      id: user.id,
      fullName: user.fullName,
      code: user.code
    }));

    return new Response(
      JSON.stringify(simplifiedUsers),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error fetching students:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch students',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};
