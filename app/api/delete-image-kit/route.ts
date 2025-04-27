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

console.log('Auth Debug:', {
  privateKey: privateKey.substring(0, 10) + '...', // Log only first 10 chars for security
  authString,
  basicAuth,
});

export async function POST(request: Request) {
  try {
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    console.log('Request Debug:', {
      fileId,
      url: `https://api.imagekit.io/v1/files/${fileId}`,
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
    });

    // Delete file using ImageKit's REST API directly with Basic Auth
    const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

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
