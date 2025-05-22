import { NextResponse } from 'next/server';

// Create Basic Auth header
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY!;
if (!privateKey) {
  throw new Error('IMAGEKIT_PRIVATE_KEY is not set');
}

// Ensure the private key starts with 'private_'
if (!privateKey.startsWith('private_')) {
  throw new Error('Invalid private key format. Must start with "private_"');
}

// Create auth string with private key and empty password
const authString = `${privateKey}:`;
const basicAuth = Buffer.from(authString).toString('base64');

export async function POST(request: Request) {
  try {
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    // Delete file using ImageKit's REST API directly with Basic Auth
    const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('ImageKit Error:', error);
      throw new Error(error.message || 'Failed to delete image');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
