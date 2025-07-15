// lib/data/mock-tools.ts
import React from "react";
import {
  Share2,
  Files,
  Sigma,
  Presentation,
  Milestone,
  Languages,
  Calculator,
  Calendar,
  Clock,
  Highlighter,
  FileSearch,
  BookCopy,
  TestTube2,
  FlaskConical,
  Globe,
} from "lucide-react";

export type ToolCategory =
  | "Writing & Research"
  | "Productivity & Planning"
  | "Data & Analysis"
  | "Lab & Science";

export type AcademicTool = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: ToolCategory;
  isFeatured?: boolean;
  comingSoon?: boolean;
};

export const mockTools: AcademicTool[] = [
  // Featured Tools
  {
    id: "ai-research-assistant",
    name: "AI Research Assistant",
    description:
      "Get AI-powered suggestions and summaries from academic databases.",
    icon: <FileSearch size={28} />,
    category: "Writing & Research",
    isFeatured: true,
  },
  {
    id: "citation-generator",
    name: "Citation Generator",
    description:
      "Generate citations in APA, MLA, Chicago, and other formats instantly.",
    icon: <BookCopy size={28} />,
    category: "Writing & Research",
    isFeatured: true,
  },
  {
    id: "data-visualizer",
    name: "Data Visualizer",
    description:
      "Paste your data to generate charts, graphs, and statistical models.",
    icon: <Sigma size={28} />,
    category: "Data & Analysis",
    isFeatured: true,
  },
  {
    id: "study-planner",
    name: "Study Planner",
    description:
      "Organize your schedule, set goals, and track deadlines automatically.",
    icon: <Calendar size={28} />,
    category: "Productivity & Planning",
    isFeatured: true,
  },
  // Other Tools
  {
    id: "plagiarism-checker",
    name: "Plagiarism Checker",
    description:
      "Check your documents for potential plagiarism against online sources.",
    icon: <Files size={24} />,
    category: "Writing & Research",
  },
  {
    id: "pomodoro-timer",
    name: "Focus Timer",
    description:
      "Use the Pomodoro technique to manage study sessions effectively.",
    icon: <Clock size={24} />,
    category: "Productivity & Planning",
  },
  {
    id: "lab-notebook",
    name: "Digital Lab Notebook",
    description:
      "Log experiments, data, and observations in a secure, organized format.",
    icon: <TestTube2 size={24} />,
    category: "Lab & Science",
  },
  {
    id: "scientific-calculator",
    name: "Scientific Calculator",
    description:
      "An advanced calculator for complex scientific and mathematical equations.",
    icon: <Calculator size={24} />,
    category: "Data & Analysis",
  },
  {
    id: "academic-translator",
    name: "Academic Translator",
    description:
      "Translate complex papers and technical terms with high accuracy.",
    icon: <Languages size={24} />,
    category: "Writing & Research",
  },
  // Coming Soon
  {
    id: "argument-mapper",
    name: "Argument Mapper",
    description:
      "Visually map out logical arguments, premises, and conclusions.",
    icon: <Milestone size={24} />,
    category: "Writing & Research",
    comingSoon: true,
  },
  {
    id: "presentation-builder",
    name: "Presentation Builder",
    description:
      "Automatically generate a slide deck outline from your research paper.",
    icon: <Presentation size={24} />,
    category: "Productivity & Planning",
    comingSoon: true,
  },
];

export const toolCategories: ToolCategory[] = [
  "Writing & Research",
  "Productivity & Planning",
  "Data & Analysis",
  "Lab & Science",
];
