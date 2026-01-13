import { NextResponse } from 'next/server';

// Generate shareable image card for a comment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { comment_text, author_name, issue_title, party } = body;

    if (!comment_text || !author_name || !issue_title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate HTML for the share card
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 1200px;
            height: 630px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 60px;
          }
          .card {
            background: white;
            border-radius: 24px;
            padding: 60px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            max-width: 100%;
          }
          .quote {
            font-size: 32px;
            line-height: 1.6;
            color: #1f2937;
            margin-bottom: 32px;
            font-weight: 500;
            position: relative;
          }
          .quote::before {
            content: '"';
            font-size: 72px;
            color: #1e3a8a;
            position: absolute;
            left: -20px;
            top: -20px;
            opacity: 0.3;
          }
          .author {
            font-size: 24px;
            color: #4b5563;
            margin-bottom: 8px;
            font-weight: 600;
          }
          .party {
            font-size: 20px;
            color: #6b7280;
            margin-bottom: 24px;
          }
          .party.rep { color: #dc2626; }
          .party.dem { color: #2563eb; }
          .issue {
            font-size: 18px;
            color: #9ca3af;
            padding-top: 24px;
            border-top: 2px solid #e5e7eb;
          }
          .logo {
            position: absolute;
            top: 40px;
            right: 60px;
            font-size: 28px;
            font-weight: bold;
            color: white;
          }
        </style>
      </head>
      <body>
        <div class="logo">NC Issues</div>
        <div class="card">
          <div class="quote">${comment_text.substring(0, 280)}${comment_text.length > 280 ? '...' : ''}</div>
          <div class="author">${author_name}</div>
          ${party ? `<div class="party ${party.toLowerCase()}">${party === 'REP' ? 'Republican' : party === 'DEM' ? 'Democrat' : party}</div>` : ''}
          <div class="issue">On: ${issue_title.substring(0, 100)}${issue_title.length > 100 ? '...' : ''}</div>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error generating share card:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
