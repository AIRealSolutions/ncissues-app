import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// GET - Get all comments for an issue
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();

    // Get issue ID from slug
    const { data: issue } = await supabase
      .from('issues')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    // Get comments
    const { data: comments, error } = await supabase
      .from('issue_comments')
      .select(`
        *,
        members (
          id,
          full_name,
          party_cd,
          res_city
        )
      `)
      .eq('issue_id', issue.id)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(comments || []);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add a comment
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.type !== 'member') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const body = await request.json();
    const { comment_text, parent_comment_id } = body;

    if (!comment_text || comment_text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment text is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get issue ID from slug
    const { data: issue } = await supabase
      .from('issues')
      .select('id, comment_count')
      .eq('slug', slug)
      .single();

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from('issue_comments')
      .insert({
        issue_id: issue.id,
        member_id: user.id,
        comment_text,
        parent_comment_id: parent_comment_id || null,
      })
      .select(`
        *,
        members (
          id,
          full_name,
          party_cd,
          res_city
        )
      `)
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update comment count
    await supabase
      .from('issues')
      .update({ comment_count: issue.comment_count + 1 })
      .eq('id', issue.id);

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
