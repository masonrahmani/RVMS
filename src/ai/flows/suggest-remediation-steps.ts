// src/ai/flows/suggest-remediation-steps.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting remediation steps for a given vulnerability description.
 *
 * @remarks
 * This flow takes a vulnerability description as input and uses an LLM to suggest potential remediation steps.
 *
 * @exports suggestRemediationSteps - An async function that triggers the remediation suggestion flow.
 * @exports SuggestRemediationStepsInput - The input type for the suggestRemediationSteps function.
 * @exports SuggestRemediationStepsOutput - The output type for the suggestRemediationSteps function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestRemediationStepsInputSchema = z.object({
  vulnerabilityDescription: z
    .string()
    .describe('The description of the vulnerability to remediate.'),
});
export type SuggestRemediationStepsInput = z.infer<
  typeof SuggestRemediationStepsInputSchema
>;

const SuggestRemediationStepsOutputSchema = z.object({
  remediationSteps: z
    .string()
    .describe('The suggested remediation steps for the vulnerability.'),
});
export type SuggestRemediationStepsOutput = z.infer<
  typeof SuggestRemediationStepsOutputSchema
>;

export async function suggestRemediationSteps(
  input: SuggestRemediationStepsInput
): Promise<SuggestRemediationStepsOutput> {
  return suggestRemediationStepsFlow(input);
}

const suggestRemediationStepsPrompt = ai.definePrompt({
  name: 'suggestRemediationStepsPrompt',
  input: {
    schema: z.object({
      vulnerabilityDescription: z
        .string()
        .describe('The description of the vulnerability to remediate.'),
    }),
  },
  output: {
    schema: z.object({
      remediationSteps: z
        .string()
        .describe('The suggested remediation steps for the vulnerability.'),
    }),
  },
  prompt: `You are an AI assistant specializing in cybersecurity remediation.
  Based on the following vulnerability description, suggest potential remediation steps:
  \n
  Vulnerability Description: {{{vulnerabilityDescription}}}
  \n
  Remediation Steps:`,
});

const suggestRemediationStepsFlow = ai.defineFlow<
  typeof SuggestRemediationStepsInputSchema,
  typeof SuggestRemediationStepsOutputSchema
>(
  {
    name: 'suggestRemediationStepsFlow',
    inputSchema: SuggestRemediationStepsInputSchema,
    outputSchema: SuggestRemediationStepsOutputSchema,
  },
  async input => {
    const {output} = await suggestRemediationStepsPrompt(input);
    return output!;
  }
);
