import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();

    // Get issue with author
    const { data: issue, error: issueError } = await supabase
      .from('issues')
      .select(`
        *,
        members!issues_author_id_fkey (
          id,
          full_name,
          party_cd,
          res_city
        )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (issueError || !issue) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await supabase
      .from('issues')
      .update({ view_count: issue.view_count + 1 })
      .eq('id', issue.id);

    // Get tags
    const { data: tagRelations } = await supabase
      .from('issue_tag_relations')
      .select(`
        issue_tags (
          id,
          name,
          slug
        )
      `)
      .eq('issue_id', issue.id);

    const tags = tagRelations?.map(tr => tr.issue_tags) || [];

    return NextResponse.json({
      issue,
      tags,
    });
  } catch (error) {
    console.error('Error fetching issue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
