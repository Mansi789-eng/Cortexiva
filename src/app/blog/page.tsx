import Link from 'next/link';
import { Metadata } from 'next';
import { getAllBlogPosts } from '@/lib/blog-data';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Insights on knowledge management, AI assistants, team productivity, and building better workflows.',
  openGraph: {
    title: 'Blog | Cortexiva',
    description:
      'Insights on knowledge management, AI assistants, team productivity, and building better workflows.',
  },
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="min-h-screen bg-gray-50">
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
                className="font-medium text-primary transition-colors"
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

      {/* Hero */}
      <section className="pt-32 pb-16 bg-white border-b border-gray-100">
        <div className="container-custom">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-dark mb-4">
              Blog
            </h1>
            <p className="text-xl text-gray-500">
              Insights on knowledge management, AI assistants, and building
              better team workflows.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-primary/20 hover:shadow-lg transition-all"
              >
                <Link href={`/blog/${post.slug}`}>
                  {/* Card Header */}
                  <div className="p-6">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                      {post.featured && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-secondary/10 text-secondary">
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-semibold text-dark mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{post.author}</span>
                      <div className="flex items-center gap-3">
                        <span>{post.readingTime}</span>
                        <span>
                          {new Date(post.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {/* Empty State */}
          {posts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500">No blog posts yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white border-t border-gray-100">
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
