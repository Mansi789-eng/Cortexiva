export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  readingTime: string;
  tags: string[];
  featured?: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "why-knowledge-bots-are-the-future",
    title: "Why Knowledge Bots Are the Future of Team Productivity",
    excerpt:
      "Teams waste 20% of their time searching for information. Knowledge bots change that by bringing answers to your fingertips.",
    content: `
## The Problem: Information Overload

Every growing team faces the same challenge: as your documentation grows, finding the right information becomes harder. Wikis become graveyards. Slack threads get buried. New hires ask the same questions veterans answered a hundred times.

**The numbers are stark:**
- Employees spend 20% of their time searching for information
- 60% of that time is spent looking for answers that already exist
- Onboarding a new team member takes 3x longer than it should

## Enter Knowledge Bots

A knowledge bot is an AI assistant trained on your company's documentation. Instead of searching through folders, you ask a question in natural language and get an instant answer with sources.

**What makes them different from search:**
- **Conversational**: Ask follow-up questions naturally
- **Contextual**: Understands your company's terminology
- **Current**: Updates automatically when your docs change

## Real-World Impact

Teams using knowledge bots report:
- **10x faster** answers to common questions
- **60% reduction** in repeat questions to senior team members
- **50% faster** onboarding for new hires

## Getting Started

The best part? You don't need engineering resources. Modern platforms like Cortexiva let you:

1. Connect your existing docs (Notion, Google Drive, etc.)
2. Configure access controls
3. Deploy to your team in minutes

No API integrations. No custom development. Just instant answers.

## The Bottom Line

Knowledge bots aren't replacing humans - they're freeing humans to do higher-value work. When your bot handles "What's our PTO policy?" for the hundredth time, your HR team can focus on what matters.

Ready to stop answering the same questions? [Get started with Cortexiva](/signup).
    `,
    author: "Cortexiva Team",
    publishedAt: "2026-02-01",
    readingTime: "4 min read",
    tags: ["productivity", "knowledge management", "AI"],
    featured: true,
  },
  {
    slug: "gdpr-compliant-ai-eu-data-residency",
    title: "GDPR-Compliant AI: Why EU Data Residency Matters",
    excerpt:
      "Most AI tools send your data to US servers. Here's why that's a problem for European companies - and how to solve it.",
    content: `
## The Hidden Risk in AI Adoption

When you use most AI tools, your data takes a journey:
1. You type a question
2. Your data flies to a US server
3. An AI processes it
4. The answer comes back

For European companies, this creates a compliance nightmare.

## What GDPR Actually Requires

GDPR doesn't ban data transfers outside the EU - but it makes them complicated:

- **Standard Contractual Clauses** (SCCs) are required
- **Transfer Impact Assessments** must be documented
- **Schrems II** ruling added more requirements

For many teams, the legal overhead isn't worth it. Especially when the alternative is simple.

## The EU Data Residency Solution

With 100% EU data residency, your data never leaves European soil:

| Component | Location |
|-----------|----------|
| Application | Frankfurt, DE |
| Database | Frankfurt, DE |
| AI Processing | Netherlands, EU |
| CDN | European Edge |

**Result**: No international transfers. No SCCs. No TIAs. Just compliant AI.

## What to Look For

When evaluating AI tools for your European team:

1. **Where is data stored?** (Should be EU)
2. **Where is AI processing done?** (Should be EU)
3. **Who is the data controller?** (Should be clearly defined)
4. **Is there a DPA available?** (Should be yes)

## Cortexiva's Approach

We built Cortexiva EU-first:

- **Supabase** (Frankfurt) for database
- **Vertex AI** (Netherlands) for LLM processing
- **Vercel** (Amsterdam) for hosting

Your company data stays in the EU. Period.

[Learn more about our security practices](/security) or [start building](/signup).
    `,
    author: "Cortexiva Team",
    publishedAt: "2026-01-28",
    readingTime: "5 min read",
    tags: ["GDPR", "compliance", "EU", "security"],
  },
  {
    slug: "5-minute-hr-bot-setup-guide",
    title: "Build an HR Bot in 5 Minutes: A Step-by-Step Guide",
    excerpt:
      "Your HR team answers the same questions daily. Here's how to build a bot that handles them automatically.",
    content: `
## The HR Team's Dilemma

Every HR professional knows the feeling:
- "What's our parental leave policy?"
- "How do I submit expenses?"
- "When do benefits kick in?"

These questions are important. They also take time away from strategic work.

## The Solution: An HR Knowledge Bot

An HR bot trained on your employee handbook can answer 80% of routine questions instantly. Here's how to build one.

## Step 1: Gather Your Sources (1 minute)

Collect links to:
- Employee handbook (PDF or Notion)
- Benefits documentation
- Common HR FAQs
- Policy documents

**Pro tip**: Start with your top 10 most-asked questions.

## Step 2: Create Your Bot (1 minute)

1. Sign up at Cortexiva
2. Click "Create Bot"
3. Name it "HR Assistant" (or your preference)
4. Choose the HR template

## Step 3: Add Your Knowledge (2 minutes)

Upload or connect:
- PDF documents (drag and drop)
- Notion pages (paste links)
- Google Docs (connect account)
- Plain text (copy/paste)

The bot processes everything automatically.

## Step 4: Configure Access (30 seconds)

Choose who can use your bot:
- **Public**: Anyone with the link
- **Domain-restricted**: Only @yourcompany.com emails
- **Invite-only**: Specific email addresses

## Step 5: Deploy (30 seconds)

Get your shareable link and send it to your team. That's it.

## What Happens Next

- Employees ask questions directly
- Bot provides instant answers with sources
- HR team gets time back for strategic work
- New hires onboard faster

## Measuring Success

Track these metrics:
- Questions answered per week
- Time saved per HR team member
- Employee satisfaction scores
- Repeat questions to HR (should decrease)

Ready to give your HR team superpowers? [Start building now](/signup).
    `,
    author: "Cortexiva Team",
    publishedAt: "2026-01-25",
    readingTime: "3 min read",
    tags: ["HR", "tutorial", "getting started"],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getFeaturedPosts(): BlogPost[] {
  return blogPosts.filter((post) => post.featured);
}
