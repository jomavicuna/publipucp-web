/**
 * API Endpoint for creating tickets in Airtable
 * POST /api/tickets
 */

import type { APIRoute } from 'astro';
import Airtable from 'airtable';

export const prerender = false;

const AIRTABLE_API_KEY = import.meta.env.AIRTABLE_API_KEY;
const BASE_ID = import.meta.env.AIRTABLE_BASE_ID || 'app9WURJGgbSPdDXy';

if (!AIRTABLE_API_KEY) {
  throw new Error('AIRTABLE_API_KEY is required');
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(BASE_ID);

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const { type, projectId, userIds, notes } = body;

    // Validate required fields
    if (!type || !projectId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: type and projectId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate type
    if (!['update-users', 'update-images', 'update-videos'].includes(type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build ticket fields
    const fields: Record<string, any> = {
      type,
      project: [projectId],
    };

    // Add user IDs if provided (for update-users type)
    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      fields['update-users'] = userIds;
    }

    // Add notes if provided
    if (notes) {
      fields.notes = notes;
    }

    // Create ticket in Airtable
    const record = await base('tickets').create(fields);

    return new Response(
      JSON.stringify({
        success: true,
        ticketId: record.id
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating ticket:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to create ticket',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
