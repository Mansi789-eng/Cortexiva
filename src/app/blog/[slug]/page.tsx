import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogPost, getAllBlogPosts } from '@/lib/blog-data';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | Cortexiva Blog`,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  // Simple markdown-like rendering for the content
  const renderContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      // Headers
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl font-bold text-dark mt-8 mb-4">
            {line.replace('## ', '')}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-xl font-semibold text-dark mt-6 mb-3">
            {line.replace('### ', '')}
          </h3>
        );
      }

      // Bold text and links
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={index} className="font-semibold text-dark my-2">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      }

      // List items
      if (line.startsWith('- ')) {
        const text = line.replace('- ', '');
        // Handle bold within list items
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        return (
          <li key={index} className="ml-6 text-gray-600 my-1">
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={i} className="text-dark">
                    {part.replace(/\*\*/g, '')}
                  </strong>
                );
              }
              return part;
            })}
          </li>
        );
      }

      // Numbered list items
      if (/^\d+\.\s/.test(line)) {
        const text = line.replace(/^\d+\.\s/, '');
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        return (
          <li key={index} className="ml-6 text-gray-600 my-1 list-decimal">
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={i} className="text-dark">
                    {part.replace(/\*\*/g, '')}
                  </strong>
                );
              }
              return part;
            })}
          </li>
        );
      }

      // Tables (simple)
      if (line.startsWith('|')) {
        if (line.includes('---')) return null; // Skip separator
        const cells = line.split('|').filter(Boolean).map((c) => c.trim());
        const isHeader = index < 3; // Assume first row is header
        return (
          <tr key={index} className={isHeader ? 'bg-gray-50' : ''}>
            {cells.map((cell, i) => (
              <td
                key={i}
                className={`border border-gray-200 px-4 py-2 ${
                  isHeader ? 'font-semibold text-dark' : 'text-gray-600'
                }`}
              >
                {cell}
              </td>
            ))}
          </tr>
        );
      }

      // Links
      if (line.includes('[') && line.includes('](')) {
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = linkRegex.exec(line)) !== null) {
          if (match.index > lastIndex) {
            parts.push(line.slice(lastIndex, match.index));
          }
          parts.push(
            <Link
              key={match.index}
              href={match[2]}
              className="text-primary hover:underline"
            >
              {match[1]}
            </Link>
          );
          lastIndex = match.index + match[0].length;
        }

        if (lastIndex < line.length) {
          parts.push(line.slice(lastIndex));
        }

        return (
          <p key={index} className="text-gray-600 my-4">
            {parts}
          </p>
        );
      }

      // Empty lines
      if (line.trim() === '') {
        return null;
      }

      // Regular paragraphs with inline bold
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={index} className="text-gray-600 my-4">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={i} className="text-dark">
                  {part.replace(/\*\*/g, '')}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <nav className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/homepage" className="flex items-center">
              <span className="text-2xl font-bold gradient-text">Cortexiva</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/blog"
                className="font-medium text-gray-600 hover:text-primary transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/login"
                className="font-medium text-gray-600 hover:text-primary transition-colors"
              >
                Log in
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Article */}
      <article className="pt-32 pb-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-8">
              <Link
                href="/blog"
                className="text-primary hover:underline text-sm flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Blog
              </Link>
            </nav>

            {/* Header */}
            <header className="mb-8">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark mb-6">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="flex items-center gap-4 text-gray-500 text-sm">
                <span>{post.author}</span>
                <span>•</span>
                <span>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span>•</span>
                <span>{post.readingTime}</span>
              </div>
            </header>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              {renderContent(post.content)}
            </div>

            {/* Share */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <p className="text-gray-500 text-sm mb-4">Share this article</p>
              <div className="flex gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    post.title
                  )}&url=${encodeURIComponent(
                    `https://cortexiva.com/blog/${post.slug}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition-colors"
                >
                  Twitter
                </a>
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                    `https://cortexiva.com/blog/${post.slug}`
                  )}&title=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* CTA */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="container-custom text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">
            Ready to build your knowledge bot?
          </h2>
          <p className="text-gray-500 mb-6 max-w-lg mx-auto">
            Stop answering the same questions. Create an AI assistant that knows
            your documentation inside and out.
          </p>
          <Link href="/signup" className="btn-primary inline-flex">
            Get Started Free
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-12">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/homepage" className="flex items-center">
              <span className="text-xl font-bold gradient-text">Cortexiva</span>
            </Link>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/homepage" className="hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/blog" className="hover:text-primary transition-colors">
                Blog
              </Link>
              <Link href="/login" className="hover:text-primary transition-colors">
                Login
              </Link>
            </div>
            <p className="text-gray-500 text-sm">
              &copy; 2026 Cortexiva. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
