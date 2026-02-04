import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getAllBlogPosts } from '@/lib/blog-data';

const BASE_URL = 'https://cortexiva.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/homepage`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Blog posts
  const blogPosts = getAllBlogPosts();
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Dynamic pages: Published public bots
  let botPages: MetadataRoute.Sitemap = [];

  try {
    const supabase = await createClient();
    const { data: bots } = await supabase
      .from('bots')
      .select('id, updated_at')
      .eq('is_published', true)
      .eq('access_type', 'public');

    if (bots) {
      botPages = bots.map((bot) => ({
        url: `${BASE_URL}/chat/${bot.id}`,
        lastModified: new Date(bot.updated_at),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    // Silently fail - sitemap will still include static pages
    console.error('Error fetching bots for sitemap:', error);
  }

  return [...staticPages, ...blogPages, ...botPages];
}
