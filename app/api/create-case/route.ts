// File: app/api/create-case/route.ts

import { createClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

// Note: It's best practice to use the Supabase client that can securely
// access RLS policies, especially if you have user authentication.
// For this MVP step, we'll use the service role key for simplicity,
// but you would switch to the per-request client later on.

// Initialize Supabase client with environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Handles POST requests to create a new case study record.
 * @param {NextRequest} req - The incoming request object.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Parse the incoming request body
    const { raw_text_url } = await req.json()

    // 2. Validate the input
    if (!raw_text_url || typeof raw_text_url !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid raw_text_url' },
        { status: 400 }
      )
    }

    // 3. Insert a new record into the 'cases' table
    // We set a default status of 'drafting'
    const { data, error } = await supabase
      .from('cases')
      .insert([
        {
          raw_text_url: raw_text_url,
          status: 'drafting',
          // TODO: Add user_id once authentication is fully implemented
          // user_id: '...'
        },
      ])
      .select('id') // Important: Ask Supabase to return the 'id' of the new row
      .single() // We expect only one row to be created, so .single() is convenient

    // 4. Handle any potential database errors
    if (error) {
      console.error('Supabase Insert Error:', error)
      return NextResponse.json(
        { error: 'Failed to create case study in database.' },
        { status: 500 }
      )
    }

    // 5. Return the ID of the newly created case study
    return NextResponse.json({ id: data.id }, { status: 201 })

  } catch (err) {
    console.error('API Route Error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
