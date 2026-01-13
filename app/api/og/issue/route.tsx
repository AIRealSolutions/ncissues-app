import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'NC Issues';
    const author = searchParams.get('author') || '';
    const excerpt = searchParams.get('excerpt') || '';
    const tags = searchParams.get('tags') || '';

    // Generate HTML for Open Graph image
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
          .tags {
            display: flex;
            gap: 12px;
          }
          .tag {
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 18px;
          }
          .content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            max-width: 900px;
          }
          .title {
            font-size: 56px;
            font-weight: bold;
            line-height: 1.2;
            margin-bottom: 24px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          .excerpt {
            font-size: 28px;
            line-height: 1.4;
            opacity: 0.9;
            margin-bottom: 32px;
          }
          .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 24px;
            border-top: 2px solid rgba(255, 255, 255, 0.3);
          }
          .author {
            font-size: 24px;
            font-weight: 600;
          }
          .cta {
            font-size: 20px;
            opacity: 0.8;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">NC Issues</div>
          ${tags ? `
            <div class="tags">
              ${tags.split(',').slice(0, 3).map(tag => `<div class="tag">${tag.trim()}</div>`).join('')}
            </div>
          ` : ''}
        </div>
        <div class="content">
          <div class="title">${title.substring(0, 100)}${title.length > 100 ? '...' : ''}</div>
          ${excerpt ? `<div class="excerpt">${excerpt.substring(0, 150)}${excerpt.length > 150 ? '...' : ''}</div>` : ''}
        </div>
        <div class="footer">
          ${author ? `<div class="author">By ${author}</div>` : '<div></div>'}
          <div class="cta">Read full issue on NC Issues</div>
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
    console.error('Error generating OG image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
