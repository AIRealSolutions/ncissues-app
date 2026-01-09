import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Layout from '@/components/Layout';
import { documents } from '@/components/Sidebar';
import { promises as fs } from 'fs';
import path from 'path';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return documents.map((doc) => ({
    id: doc.id,
  }));
}

export default async function DocumentPage({ params }: PageProps) {
  const { id } = await params;
  const doc = documents.find((d) => d.id === id);

  if (!doc) {
    notFound();
  }

  const filePath = path.join(process.cwd(), 'public', 'markdown_docs', doc.file);
  let content: string;

  try {
    content = await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading file ${doc.file}:`, error);
    notFound();
  }

  return (
    <Layout>
      <article className="prose prose-lg max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </article>
    </Layout>
  );
}
