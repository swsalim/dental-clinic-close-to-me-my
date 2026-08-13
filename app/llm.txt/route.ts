import { getLlmsIndex, LLMS_REVALIDATE_SECONDS, llmsTextResponse } from '@/lib/llms';

export const revalidate = LLMS_REVALIDATE_SECONDS;

export async function GET() {
  const body = await getLlmsIndex();
  return llmsTextResponse(body);
}
