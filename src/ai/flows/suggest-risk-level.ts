// src/ai/flows/suggest-risk-level.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting a risk level
 * (Low, Medium, High, Critical) for a vulnerability based on its description.
 *
 * The flow uses a prompt to get the AI to suggest the risk level.
 *
 * @exports {
 *   suggestRiskLevel,
 *   SuggestRiskLevelInput,
 *   SuggestRiskLevelOutput,
 * }
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestRiskLevelInputSchema = z.object({
  vulnerabilityDescription: z
    .string()
    .describe('The description of the vulnerability.'),
});

export type SuggestRiskLevelInput = z.infer<typeof SuggestRiskLevelInputSchema>;

const SuggestRiskLevelOutputSchema = z.object({
  suggestedRiskLevel: z.enum(['Low', 'Medium', 'High', 'Critical']).describe(
    'The suggested risk level for the vulnerability, based on its description.'
  ),
});

export type SuggestRiskLevelOutput = z.infer<typeof SuggestRiskLevelOutputSchema>;

export async function suggestRiskLevel(
  input: SuggestRiskLevelInput
): Promise<SuggestRiskLevelOutput> {
  return suggestRiskLevelFlow(input);
}

const suggestRiskLevelPrompt = ai.definePrompt({
  name: 'suggestRiskLevelPrompt',
  input: {
    schema: z.object({
      vulnerabilityDescription: z
        .string()
        .describe('The description of the vulnerability.'),
    }),
  },
  output: {
    schema: z.object({
      suggestedRiskLevel: z
        .enum(['Low', 'Medium', 'High', 'Critical'])
        .describe(
          'The suggested risk level for the vulnerability, based on its description.'
        ),
    }),
  },
  prompt: `Based on the following vulnerability description, suggest a risk level (Low, Medium, High, Critical).

Vulnerability Description: {{{vulnerabilityDescription}}}

Suggest Risk Level:`,
});

const suggestRiskLevelFlow = ai.defineFlow<
  typeof SuggestRiskLevelInputSchema,
  typeof SuggestRiskLevelOutputSchema
>({
  name: 'suggestRiskLevelFlow',
  inputSchema: SuggestRiskLevelInputSchema,
  outputSchema: SuggestRiskLevelOutputSchema,
},
async input => {
  const {output} = await suggestRiskLevelPrompt(input);
  return output!;
});
