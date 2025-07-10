import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

// Setup the Inter font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // This makes it available as a CSS variable
})

export const metadata: Metadata = {
  title: 'CaseCraft',
  description: 'AI Case Studies in 5 Minutes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // Add the 'dark' class to enable dark mode for Tailwind
    <html lang="en" className="dark">
      {/* Apply the Inter font and our dark background color */}
      <body className={`${inter.variable} font-inter bg-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  )
}