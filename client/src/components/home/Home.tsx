//src/components/home/Home.tsx

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Bot, Users } from "lucide-react";

// A simple decorative blob component
const BackgroundBlob = ({ className }: { className?: string }) => (
  <div
    className={`absolute rounded-full bg-primary/5 filter blur-3xl opacity-20 animate-blob ${className}`}
  />
);

export default function Home() {
  return (
    <div className="w-full overflow-hidden">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-40 text-center">
          <BackgroundBlob className="top-0 -left-4 w-72 h-72" />
          <BackgroundBlob className="top-0 -right-4 w-72 h-72 animation-delay-2000" />
          <BackgroundBlob className="bottom-0 left-20 w-72 h-72 animation-delay-4000" />

          <div className="container relative px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                  Elevate Your Educational Experience
                </h1>
                <p className="max-w-[700px] text-muted-foreground md:text-xl mx-auto">
                  Our platform transforms static course materials into dynamic,
                  AI-enhanced learning environments. Empower teachers and
                  inspire students like never before.
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                <Link href="/auth/register">
                  <Button size="lg">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-muted/40"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                Key Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                A Smarter Way to Learn and Teach
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                Discover the tools that streamline workflows and create deeper
                understanding.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:grid-cols-3">
              <div className="grid gap-2 text-center p-4 rounded-lg hover:bg-card transition-colors">
                <BookOpen className="mx-auto h-10 w-10 text-primary" />
                <h3 className="text-lg font-bold">Living Documents</h3>
                <p className="text-sm text-muted-foreground">
                  Convert any PDF or document into an interactive assignment
                  that students can complete and submit directly on the
                  platform.
                </p>
              </div>
              <div className="grid gap-2 text-center p-4 rounded-lg hover:bg-card transition-colors">
                <Bot className="mx-auto h-10 w-10 text-primary" />
                <h3 className="text-lg font-bold">AI Co-pilot</h3>
                <p className="text-sm text-muted-foreground">
                  Provide instant summaries, explanations, and practice quizzes
                  from course materials with an integrated AI assistant.
                </p>
              </div>
              <div className="grid gap-2 text-center p-4 rounded-lg hover:bg-card transition-colors">
                <Users className="mx-auto h-10 w-10 text-primary" />
                <h3 className="text-lg font-bold">Unified Workspace</h3>
                <p className="text-sm text-muted-foreground">
                  A clear, course-centric dashboard for teachers to manage
                  submissions and a simple, intuitive workflow for students.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to Redefine Your Classroom?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                Join a community of forward-thinking educators. Sign up in
                seconds and start building the future of learning today.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <Link href="/auth/register">
                <Button size="lg" className="w-full">
                  Sign Up for Free
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
