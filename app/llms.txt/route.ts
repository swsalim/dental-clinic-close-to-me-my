import { getLlmsIndex, llmsTextResponse } from '@/lib/llms';

export const revalidate = 2_592_000;

export async function GET() {
  const body = await getLlmsIndex();
  return llmsTextResponse(body);
}
