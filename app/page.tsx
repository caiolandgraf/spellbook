'use client'

import { motion } from 'framer-motion'
import {
    BookOpen,
    Code2,
    GitBranch,
    Sparkles,
    Star,
    Terminal,
    Users,
    Zap
} from 'lucide-react'
import Link from 'next/link'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations'
import { CodeShowcase } from '@/components/code-showcase'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          {/* Logo/Icon */}
          <FadeIn delay={0.1}>
            <div className="flex justify-center mb-8">
              <motion.div
                className="relative"
                animate={{
                  y: [0, -10, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full" />
                <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 p-6 rounded-2xl border border-primary/30 backdrop-blur-sm">
                  <BookOpen
                    className="w-16 h-16 text-primary"
                    strokeWidth={1.5}
                  />
                </div>
              </motion.div>
            </div>
          </FadeIn>

          {/* Heading */}
          <FadeIn delay={0.2}>
            <div className="space-y-6">
              <div className="inline-block">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Your Personal Code Library
                  </span>
                </div>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  Code Like
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent animate-gradient">
                  Magic ✨
                </span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Store, organize, execute and share your code snippets.
                <br className="hidden sm:block" />
                Build your personal spellbook and cast powerful code spells.
              </p>
            </div>
          </FadeIn>

          {/* CTA Buttons */}
          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                size="lg"
                className="text-base px-8 h-12 group relative overflow-hidden"
                asChild
              >
                <Link href="/auth/signin">
                  <span className="relative z-10 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    Start Your Journey
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-yellow-400 to-primary opacity-0 group-hover:opacity-20 transition-opacity" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 h-12 border-primary/30 hover:bg-white transition-colors duration-200"
                asChild
              >
                <Link href="/spells">
                  <Code2 className="w-5 h-5 mr-2" />
                  Explore Spells
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                <span>Unlimited Spells</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>Share & Collaborate</span>
              </div>
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                <span>Run Code Live</span>
              </div>
            </div>
          </FadeIn>

          {/* Code Showcase */}
          <FadeIn delay={0.4}>
            <div className="pt-8">
              <CodeShowcase />
            </div>
          </FadeIn>

          {/* Features */}
          <StaggerContainer
            staggerDelay={0.1}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16"
          >
            <StaggerItem>
              <FeatureCard
                icon={<BookOpen className="w-6 h-6" />}
                title="Organize by Books"
                description="Group your code snippets into spellbooks for better organization and quick access"
              />
            </StaggerItem>
            <StaggerItem>
              <FeatureCard
                icon={<Zap className="w-6 h-6" />}
                title="Execute Code"
                description="Run your code directly in the browser and see the results instantly without setup"
              />
            </StaggerItem>
            <StaggerItem>
              <FeatureCard
                icon={<GitBranch className="w-6 h-6" />}
                title="Share & Collaborate"
                description="Share your spells with the community and discover amazing code from others"
              />
            </StaggerItem>
          </StaggerContainer>

          {/* Meet Runes Card */}
          <FadeIn delay={0.7}>
            <div className="pt-16 max-w-4xl mx-auto">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-primary/20 to-blue-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all" />
                <div className="relative p-8 rounded-3xl border border-primary/30 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-shrink-0">
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-primary/20 border border-primary/30">
                        <Sparkles className="w-16 h-16 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-3">
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-primary to-blue-400 bg-clip-text text-transparent">
                        Meet Runes ✨
                      </h2>
                      <p className="text-lg text-muted-foreground">
                        Create interactive components with HTML, CSS, and JavaScript. 
                        Build dynamic UI elements and share them with the world!
                      </p>
                      <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
                        <Button size="lg" asChild>
                          <Link href="/runes">
                            <Sparkles className="w-5 h-5 mr-2" />
                            Explore Runes
                          </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                          <Link href="/dashboard/runes/new">
                            Create Your First Rune
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4 backdrop-blur-sm bg-background/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="font-semibold">Spellbook</span>
            </div>
            <div className="text-sm text-muted-foreground">Built with ✨</div>
            <div className="flex gap-4 text-sm">
              <Link
                href="/spells"
                className="hover:text-primary transition-colors"
              >
                Explore Spells
              </Link>
              <Link
                href="/runes"
                className="hover:text-primary transition-colors"
              >
                Explore Runes
              </Link>
              <Link
                href="/auth/signin"
                className="hover:text-primary transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
      <div className="relative p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
            {icon}
          </div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}
