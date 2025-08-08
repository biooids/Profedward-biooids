// src/components/home/Home.tsx

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  Bot,
  Users,
  UploadCloud,
  GraduationCap,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
// --- FIX: Import the 'Variants' type ---
import { motion, type Variants } from "motion/react";
import React, { useEffect, useState } from "react";

// Reusable UI Components (In a real app, move these to their own files)
// ============================================================================

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}) => (
  <motion.div
    variants={itemVariants}
    className={`bg-card/40 dark:bg-card/10 backdrop-blur-lg rounded-2xl border border-border/20 p-6 text-center shadow-lg ${className}`}
  >
    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-4 border border-primary/20">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="text-xl font-bold text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground mt-2">{description}</p>
  </motion.div>
);

const AnimatedAiDemo = () => {
  const [step, setStep] = useState(0);
  const demoSteps = [
    {
      prompt: "Summarize the section on mitochondria...",
      response:
        "Mitochondria are the powerhouses of the cell, responsible for generating most of the cell's supply of ATP...",
    },
    {
      prompt: "Create a quiz question about this chapter...",
      response: "What are the two main stages of photosynthesis?",
    },
    {
      prompt: "Explain 'Krebs Cycle' like I'm 15...",
      response:
        "Imagine it's a circular metabolic pathway that cells use to generate energy from food molecules...",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prevStep) => (prevStep + 1) % demoSteps.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [demoSteps.length]);

  return (
    <div className="bg-card/50 dark:bg-card/20 backdrop-blur-xl rounded-2xl border border-border/20 p-6 w-full max-w-lg h-[300px] md:h-[350px] flex flex-col justify-center relative overflow-hidden shadow-2xl">
      <div className="absolute top-4 left-4 text-xs font-semibold text-muted-foreground flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        AI Co-pilot: Live Demo
      </div>
      <div className="space-y-4">
        {demoSteps.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: index === step ? 1 : 0,
              y: index === step ? 0 : 20,
              position: index === step ? "relative" : "absolute",
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full px-6"
          >
            <div className="text-left">
              <p className="text-sm font-medium text-muted-foreground">
                User Prompt:
              </p>
              <p className="text-lg font-semibold text-foreground">
                "{item.prompt}"
              </p>
            </div>
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent my-4" />
            <div className="text-left">
              <p className="text-sm font-medium text-primary">AI Response:</p>
              <p className="text-md text-foreground/90">{item.response}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Animation Variants
// ============================================================================
// --- FIX: Apply the 'Variants' type to your objects ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

// Page Sections (In a real app, move these to their own files)
// ============================================================================

const HeroSection = () => (
  <section className="w-full py-20 md:py-28">
    <div className="container grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-4 md:px-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-start space-y-6 text-left"
      >
        <motion.h1
          variants={itemVariants}
          className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-br from-foreground to-muted-foreground"
        >
          The Future of Education, Today.
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="max-w-[600px] text-muted-foreground md:text-xl"
        >
          Transform static materials into dynamic learning experiences. Our
          AI-powered platform empowers teachers and inspires students.
        </motion.p>
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/auth/register">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="w-full sm:w-auto"
          >
            <Link href="/about">Learn More</Link>
          </Button>
        </motion.div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        className="flex justify-center"
      >
        <AnimatedAiDemo />
      </motion.div>
    </div>
  </section>
);

const HowItWorksSection = () => (
  <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
    <div className="container px-4 md:px-6">
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
          A Simple Path to Smarter Learning
        </h2>
        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
          In three simple steps, revolutionize your classroom workflow.
        </p>
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:grid-cols-3"
      >
        <FeatureCard
          icon={UploadCloud}
          title="1. Upload & Transform"
          description="Convert any PDF or document into an interactive 'Living Document' with a single click."
        />
        <FeatureCard
          icon={Bot}
          title="2. Interact with AI"
          description="Students get instant help with summaries, quizzes, and explanations from their AI co-pilot."
        />
        <FeatureCard
          icon={Users}
          title="3. Assign & Grade"
          description="Manage assignments and provide feedback through a unified, intuitive workspace for teachers."
        />
      </motion.div>
    </div>
  </section>
);

const AiFeaturesSection = () => {
  const ListItem = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-start gap-3">
      <Sparkles className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
      <span className="text-muted-foreground">{children}</span>
    </li>
  );

  return (
    <section id="ai-features" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
            Powered by an Advanced AI Co-pilot
          </h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
            Our AI enhances the learning experience for everyone, providing
            tools that save time and deepen understanding.
          </p>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mx-auto w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 pt-10"
        >
          <motion.div
            variants={itemVariants}
            className="bg-card/40 dark:bg-card/10 backdrop-blur-lg rounded-2xl border border-border/20 p-6 text-left shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <GraduationCap className="h-8 w-8 text-primary" />
              <h3 className="text-2xl font-bold">For Students</h3>
            </div>
            <ul className="space-y-3">
              <ListItem>
                **Instant Explanations:** Get complex topics broken down in
                simple terms.
              </ListItem>
              <ListItem>
                **Practice Quizzes:** Generate self-assessment questions from
                any document.
              </ListItem>
              <ListItem>
                **Summarization:** Condense long texts into key points for
                efficient revision.
              </ListItem>
            </ul>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="bg-card/40 dark:bg-card/10 backdrop-blur-lg rounded-2xl border border-border/20 p-6 text-left shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
              <h3 className="text-2xl font-bold">For Teachers</h3>
            </div>
            <ul className="space-y-3">
              <ListItem>
                **Question Generation:** Create assignment and quiz questions
                automatically.
              </ListItem>
              <ListItem>
                **Feedback Suggestions:** Get AI-powered ideas for constructive
                feedback.
              </ListItem>
              <ListItem>
                **Lesson Planning:** Generate ideas and outlines based on your
                curriculum.
              </ListItem>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const FinalCtaSection = () => (
  <section className="w-full py-12 md:py-24 lg:py-32">
    <div className="container flex flex-col items-center justify-center gap-4 px-4 text-center md:px-6">
      <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
        Ready to Redefine Your Classroom?
      </h2>
      <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed">
        Join thousands of forward-thinking educators. Sign up in seconds and
        start building the future of learning today.
      </p>
      <div className="mt-6">
        <Button
          asChild
          size="lg"
          className="w-full sm:w-auto px-10 py-6 text-lg"
        >
          <Link href="/auth/register">Sign Up for Free</Link>
        </Button>
      </div>
    </div>
  </section>
);

// Main Home Component
// ============================================================================

export default function Home() {
  return (
    <div className="w-full bg-background text-foreground isolate">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background">
        {/* Grid Pattern */}
        <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        {/* Aurora Glow */}
        <div className="absolute inset-0 -z-20 h-full w-full bg-transparent overflow-hidden">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 bg-primary/10 rounded-full filter blur-3xl animate-blob opacity-30"></div>
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 bg-secondary/10 rounded-full filter blur-3xl animate-blob animation-delay-2000 opacity-30"></div>
        </div>
      </div>

      <main className="relative z-10">
        <HeroSection />
        <HowItWorksSection />
        <AiFeaturesSection />
        <FinalCtaSection />
      </main>
    </div>
  );
}
