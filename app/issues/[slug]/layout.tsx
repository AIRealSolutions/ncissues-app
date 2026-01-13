import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const search = await searchParams;
    const commentId = search.comment_id;
    
    const supabase = await createClient();

    const { data: issue } = await supabase
      .from('issues')
      .select(`
        *,
        members!issues_author_id_fkey (
          full_name
        )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (!issue) {
      return {
        title: 'Issue Not Found - NC Issues',
        description: 'The issue you are looking for could not be found.',
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ncissues-app-git-main-airealsolutions.vercel.app';
    const issueUrl = `${baseUrl}/issues/${slug}`;

    // If comment ID is provided, generate comment-specific metadata
    if (commentId) {
      const { data: comment } = await supabase
        .from('issue_comments')
        .select(`
          *,
          members (
            full_name,
            party_cd
          )
        `)
        .eq('id', commentId)
        .single();

      if (comment) {
        const commentUrl = `${issueUrl}?comment_id=${commentId}#comment-${commentId}`;
        const ogImageUrl = `${baseUrl}/api/og/comment?comment=${encodeURIComponent(comment.comment_text)}&author=${encodeURIComponent(comment.members.full_name)}&party=${encodeURIComponent(comment.members.party_cd || '')}&issue=${encodeURIComponent(issue.title)}`;

        return {
          title: `${comment.members.full_name}'s comment on "${issue.title}" - NC Issues`,
          description: comment.comment_text.substring(0, 160),
          openGraph: {
            title: `Comment by ${comment.members.full_name}`,
            description: comment.comment_text.substring(0, 160),
            url: commentUrl,
            siteName: 'NC Issues',
            type: 'article',
            images: [
              {
                url: ogImageUrl,
                width: 1200,
                height: 630,
                alt: `Comment by ${comment.members.full_name}`,
              },
            ],
          },
          twitter: {
            card: 'summary_large_image',
            title: `Comment by ${comment.members.full_name}`,
            description: comment.comment_text.substring(0, 160),
            images: [ogImageUrl],
            creator: '@NCIssues',
            site: '@NCIssues',
          },
          alternates: {
            canonical: commentUrl,
          },
        };
      }
    }

    // Default issue metadata (no comment specified)
    const { data: tagRelations } = await supabase
      .from('issue_tag_relations')
      .select(`
        issue_tags (
          name
        )
      `)
      .eq('issue_id', issue.id);

    const tags = tagRelations?.map(tr => tr.issue_tags.name).join(', ') || '';
    const ogImageUrl = `${baseUrl}/api/og/issue?title=${encodeURIComponent(issue.title)}&author=${encodeURIComponent(issue.members.full_name)}&excerpt=${encodeURIComponent(issue.excerpt || '')}&tags=${encodeURIComponent(tags)}`;

    return {
      title: `${issue.title} - NC Issues`,
      description: issue.excerpt || issue.content.substring(0, 160),
      openGraph: {
        title: issue.title,
        description: issue.excerpt || issue.content.substring(0, 160),
        url: issueUrl,
        siteName: 'NC Issues',
        type: 'article',
        publishedTime: issue.published_at,
        authors: [issue.members.full_name],
        images: [
          {
            url: issue.image_url || ogImageUrl,
            width: 1200,
            height: 630,
            alt: issue.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: issue.title,
        description: issue.excerpt || issue.content.substring(0, 160),
        images: [issue.image_url || ogImageUrl],
        creator: '@NCIssues',
        site: '@NCIssues',
      },
      alternates: {
        canonical: issueUrl,
      },
      keywords: tags.split(', ').filter(Boolean),
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'NC Issues - North Carolina Community Discussions',
      description: 'Join the conversation on issues affecting North Carolina.',
    };
  }
}

export default function IssueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
