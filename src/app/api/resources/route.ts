import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { week, topic } = await req.json();
  // Just return 3 dummy resources per request
  return NextResponse.json({
    resources: [
      {
        title: `Official ${topic} Docs`,
        url: 'https://developer.mozilla.org/',
        type: 'docs'
      },
      {
        title: `${topic} Crash Course Video`,
        url: 'https://youtube.com/',
        type: 'video'
      },
      {
        title: `${topic} Tutorial Article`,
        url: 'https://freecodecamp.org/',
        type: 'article'
      }
    ]
  });
}
