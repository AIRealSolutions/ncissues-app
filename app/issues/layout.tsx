import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NC Issues - Community Discussions on North Carolina Topics',
  description: 'Join the conversation on education, healthcare, environment, economy, and other issues affecting North Carolina. Share your voice and engage with your community.',
  openGraph: {
    title: 'NC Issues - Community Discussions',
    description: 'Join the conversation on issues affecting North Carolina. Share your voice and engage with your community.',
    url: 'https://ncissues-app-git-main-airealsolutions.vercel.app/issues',
    siteName: 'NC Issues',
    type: 'website',
    images: [
      {
        url: 'https://ncissues-app-git-main-airealsolutions.vercel.app/api/og/issue?title=NC%20Issues&excerpt=Community%20discussions%20on%20topics%20affecting%20North%20Carolina',
        width: 1200,
        height: 630,
        alt: 'NC Issues - Community Discussions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NC Issues - Community Discussions',
    description: 'Join the conversation on issues affecting North Carolina.',
    images: ['https://ncissues-app-git-main-airealsolutions.vercel.app/api/og/issue?title=NC%20Issues&excerpt=Community%20discussions%20on%20topics%20affecting%20North%20Carolina'],
    creator: '@NCIssues',
    site: '@NCIssues',
  },
  keywords: ['North Carolina', 'NC Issues', 'community', 'discussion', 'politics', 'legislation', 'education', 'healthcare', 'environment', 'economy'],
};

export default function IssuesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
