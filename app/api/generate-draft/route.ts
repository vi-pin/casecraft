// File: app/api/generate-draft/route.ts

import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { z } from 'zod'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// The Zod schema defines the structure we expect from the AI.
const CaseStudySchema = z.object({
  headline: z.string().describe('A compelling, attention-grabbing headline for the case study.'),
  customer: z.object({
    name: z.string().describe("The name of the customer or company."),
    description: z.string().describe("A brief, one-sentence description of the customer."),
  }),
  challenge: z.string().describe("A 2-3 sentence paragraph describing the main problem the customer was facing."),
  solution: z.string().describe("A 2-3 sentence paragraph explaining how the product/service solved the challenge."),
  results: z.array(
    z.object({
      metric: z.string().describe("The key result, e.g., '40% Increase' or '50 Hours Saved'."),
      description: z.string().describe("A short sentence explaining the result."),
    })
  ).min(1).max(3).describe("A list of 1 to 3 key, quantifiable results."),
  quote: z.string().describe("A powerful, impactful quote from the customer found within the transcript."),
})

/**
 * Handles POST requests to generate an AI draft for a case study using OpenAI.
 */
export async function POST(req: NextRequest) {
  try {
    const { caseId, templateId } = await req.json()

    if (!caseId || !templateId) {
      return NextResponse.json({ error: 'Missing caseId or templateId' }, { status: 400 })
    }

    // 1. Fetch the case study record from Supabase
    const { data: caseData, error: fetchError } = await supabase
      .from('cases')
      .select('raw_text_url')
      .eq('id', caseId)
      .single()

    if (fetchError || !caseData) {
      throw new Error(`Case study not found or could not be fetched. Supabase error: ${fetchError?.message}`)
    }

    // 2. Fetch the content of the uploaded text file
    const textResponse = await fetch(caseData.raw_text_url)
    if (!textResponse.ok) {
      throw new Error('Failed to download the transcript file.')
    }
    const transcript = await textResponse.text()

    // 3. Call the OpenAI API with the complete and robust prompt
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', 
      messages: [
        {
          role: 'system',
          content: `You are an expert marketing copywriter specializing in B2B case studies. Your task is to analyze the provided transcript and extract the key information to structure it into a compelling case study. 
          
          You MUST respond ONLY with a valid JSON object that strictly conforms to the following structure. Do not include any conversational text, markdown formatting, or any other text outside of the single JSON object.

          Example of the required JSON output format:
          {
            "headline": "Innovatech Boosts Design Velocity by 40% with PixelPerfect",
            "customer": { 
              "name": "Innovatech", 
              "description": "A leading provider of enterprise software solutions." 
            },
            "challenge": "The design team was struggling with a chaotic feedback process across multiple platforms, leading to significant delays.",
            "solution": "By implementing PixelPerfect's centralized dashboard, all feedback and approvals were streamlined into a single, efficient workflow.",
            "results": [ 
              { "metric": "40% Reduction", "description": "in design approval times." },
              { "metric": "80% Decrease", "description": "in weekly administrative tasks for designers." }
            ],
            "quote": "PixelPerfect gave us our sanity back."
          }`,
        },
        {
          role: 'user',
          content: `Here is the transcript:\n\n---\n\n${transcript}`,
        },
      ],
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error('OpenAI returned an empty response.')
    }
    
    console.log("Raw AI Output:", content);

    // 4. Validate the response from OpenAI against our Zod schema
    const parsedContent = CaseStudySchema.parse(JSON.parse(content))

    // 5. Save the structured JSON content back to our database
    const { error: updateError } = await supabase
      .from('cases')
      .update({ draft_content: parsedContent })
      .eq('id', caseId)

    if (updateError) {
      console.error('Supabase Update Error:', updateError);
      throw new Error(`Failed to save the generated draft to the database. Reason: ${updateError.message}`);
    }

    // Return the generated content in the success response
    return NextResponse.json({ success: true, draftContent: parsedContent }, { status: 200 })

  } catch (err: any) {
    if (err instanceof z.ZodError) {
      console.error('Zod Validation Error:', err.errors)
      return NextResponse.json({ error: 'AI returned invalid data format.', details: err.errors }, { status: 500 })
    }
    console.error('API Route Error:', err)
    return NextResponse.json({ error: err.message || 'An unexpected error occurred.' }, { status: 500 })
  }
}
