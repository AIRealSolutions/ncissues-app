import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// GET - List all published issues
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    const featured = searchParams.get('featured');

    const supabase = await createClient();

    let query = supabase
      .from('issues')
      .select(`
        *,
        members!issues_author_id_fkey (
          id,
          full_name,
          party_cd
        )
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    const { data: issues, error } = await query;

    if (error) {
      console.error('Error fetching issues:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If tag filter is specified, filter by tag
    if (tag && issues) {
      const { data: taggedIssues } = await supabase
        .from('issue_tag_relations')
        .select('issue_id, issue_tags!inner(slug)')
        .eq('issue_tags.slug', tag);

      const taggedIssueIds = new Set(taggedIssues?.map(t => t.issue_id) || []);
      const filteredIssues = issues.filter(issue => taggedIssueIds.has(issue.id));
      
      return NextResponse.json(filteredIssues);
    }

    return NextResponse.json(issues || []);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new issue (contributors only)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.type !== 'member') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is a contributor
    const supabase = await createClient();
    const { data: member } = await supabase
      .from('members')
      .select('is_contributor')
      .eq('id', user.id)
      .single();

    if (!member?.is_contributor) {
      return NextResponse.json(
        { error: 'Contributor access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, excerpt, image_url, tags, status = 'draft' } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Create issue
    const { data: issue, error } = await supabase
      .from('issues')
      .insert({
        title,
        slug,
        content,
        excerpt: excerpt || content.substring(0, 200) + '...',
        author_id: user.id,
        status,
        image_url,
        published_at: status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating issue:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add tags if provided
    if (tags && tags.length > 0) {
      const tagRelations = tags.map((tagId: number) => ({
        issue_id: issue.id,
        tag_id: tagId,
      }));

      await supabase
        .from('issue_tag_relations')
        .insert(tagRelations);
    }

    return NextResponse.json({
      success: true,
      message: 'Issue created successfully',
      issue,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
