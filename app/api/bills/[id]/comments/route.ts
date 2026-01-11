import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// GET - List comments for a bill
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const billId = parseInt(id);
  const supabase = await createClient();

  try {
    const { data: comments, error } = await supabase
      .from('bill_comments')
      .select(`
        *,
        members:member_id (
          id,
          full_name,
          party_cd
        )
      `)
      .eq('bill_id', billId)
      .eq('is_approved', true)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(comments || []);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new comment (member-only)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const billId = parseInt(id);

  try {
    const user = await getCurrentUser();
    
    if (!user || user.type !== 'member') {
      return NextResponse.json(
        { error: 'You must be logged in as a member to comment' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { comment_text, parent_comment_id } = body;

    if (!comment_text || comment_text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment text is required' },
        { status: 400 }
      );
    }

    if (comment_text.length > 2000) {
      return NextResponse.json(
        { error: 'Comment must be less than 2000 characters' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if user has premium membership (optional - can be enforced)
    const { data: member } = await supabase
      .from('members')
      .select('membership_tier')
      .eq('id', user.id)
      .single();

    const newComment = {
      bill_id: billId,
      member_id: user.id,
      comment_text: comment_text.trim(),
      parent_comment_id: parent_comment_id || null,
      is_approved: true, // Auto-approve for now, can add moderation later
    };

    const { data: comment, error } = await supabase
      .from('bill_comments')
      .insert(newComment)
      .select(`
        *,
        members:member_id (
          id,
          full_name,
          party_cd
        )
      `)
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.from('member_activity').insert({
      member_id: user.id,
      activity_type: 'comment',
      activity_data: { bill_id: billId, comment_id: comment.id },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
