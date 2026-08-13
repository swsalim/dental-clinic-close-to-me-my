import { getLlmsFull, LLMS_REVALIDATE_SECONDS, llmsTextResponse } from '@/lib/llms';

export const revalidate = LLMS_REVALIDATE_SECONDS;

export async function GET() {
  const body = await getLlmsFull();
  return llmsTextResponse(body);
}
