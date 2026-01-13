import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const comment = searchParams.get('comment') || '';
    const author = searchParams.get('author') || '';
    const party = searchParams.get('party') || '';
    const issueTitle = searchParams.get('issue') || '';

    if (!comment || !author || !issueTitle) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Generate HTML for comment Open Graph image
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
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 60px;
            color: white;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .logo {
            font-size: 36px;
            font-weight: bold;
          }
          .badge {
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 24px;
            border-radius: 20px;
            font-size: 20px;
            font-weight: 600;
          }
          .content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .quote-icon {
            font-size: 80px;
            opacity: 0.3;
            margin-bottom: -20px;
          }
          .comment-text {
            font-size: 38px;
            line-height: 1.4;
            font-weight: 500;
            margin-bottom: 32px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          .author-section {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 24px;
          }
          .avatar {
            width: 60px;
            height: 60px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            font-weight: bold;
            color: #1e3a8a;
          }
          .author-info {
            flex: 1;
          }
          .author-name {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 4px;
          }
          .party {
            font-size: 20px;
            opacity: 0.9;
          }
          .party.rep { color: #fca5a5; }
          .party.dem { color: #93c5fd; }
          .footer {
            padding-top: 24px;
            border-top: 2px solid rgba(255, 255, 255, 0.3);
          }
          .issue-title {
            font-size: 20px;
            opacity: 0.8;
            margin-bottom: 8px;
          }
          .cta {
            font-size: 18px;
            opacity: 0.7;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">NC Issues</div>
          <div class="badge">💬 Comment</div>
        </div>
        <div class="content">
          <div class="quote-icon">"</div>
          <div class="comment-text">${comment.substring(0, 200)}${comment.length > 200 ? '...' : ''}</div>
          <div class="author-section">
            <div class="avatar">${author.charAt(0).toUpperCase()}</div>
            <div class="author-info">
              <div class="author-name">${author}</div>
              ${party ? `<div class="party ${party.toLowerCase()}">${party === 'REP' ? 'Republican' : party === 'DEM' ? 'Democrat' : party}</div>` : ''}
            </div>
          </div>
        </div>
        <div class="footer">
          <div class="issue-title">On: ${issueTitle.substring(0, 80)}${issueTitle.length > 80 ? '...' : ''}</div>
          <div class="cta">Read full discussion on NC Issues</div>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error generating comment OG image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
