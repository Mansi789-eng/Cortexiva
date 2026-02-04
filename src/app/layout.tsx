import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://cortexiva.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Cortexiva - Knowledge Bots That Stay Fresh",
    template: "%s | Cortexiva",
  },
  description:
    "Create AI-powered knowledge bots for your team. Connect Slack, Notion, and more. Stop answering the same questions - let your bot handle it.",
  keywords: [
    "knowledge bot",
    "AI assistant",
    "team knowledge base",
    "internal wiki",
    "HR bot",
    "support bot",
    "Notion integration",
    "Slack bot",
    "GDPR compliant AI",
    "EU data residency",
  ],
  authors: [{ name: "Cortexiva" }],
  creator: "Cortexiva",
  publisher: "Cortexiva",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Cortexiva",
    title: "Cortexiva - Knowledge Bots That Stay Fresh",
    description:
      "Create AI-powered knowledge bots for your team. Stop answering the same questions - let your bot handle it.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cortexiva - Knowledge Bots That Stay Fresh",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cortexiva - Knowledge Bots That Stay Fresh",
    description:
      "Create AI-powered knowledge bots for your team. Stop answering the same questions.",
    images: ["/og-image.png"],
    creator: "@cortexiva",
  },
  icons: {
    icon: "/logo-cortexiva-icon.svg",
    shortcut: "/logo-cortexiva-icon.svg",
    apple: "/logo-cortexiva-icon.svg",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo-cortexiva-icon.svg" type="image/svg+xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Cortexiva",
              applicationCategory: "BusinessApplication",
              description:
                "AI-powered knowledge bots that help teams access information instantly. Connect your docs, build a bot, deploy in minutes.",
              url: BASE_URL,
              logo: `${BASE_URL}/logo-cortexiva.svg`,
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "EUR",
                description: "Free tier available",
              },
              operatingSystem: "Web",
              author: {
                "@type": "Organization",
                name: "Cortexiva",
                url: BASE_URL,
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
