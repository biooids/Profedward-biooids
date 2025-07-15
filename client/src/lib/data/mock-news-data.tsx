// lib/data/mock-news-data.tsx
import React from "react";

export type NewsCategory =
  | "Breakthroughs"
  | "Higher Ed"
  | "AI in Academia"
  | "Funding"
  | "Humanities";

export type NewsArticle = {
  id: string;
  title: string;
  summary: string;
  author: string;
  publication: string;
  date: string; // e.g., "June 11, 2025"
  category: NewsCategory;
  imageUrl: string;
  isFeatured?: boolean;
};

export const mockNewsData: NewsArticle[] = [
  {
    id: "news-01",
    title:
      "CRISPR Gene-Editing Breakthrough Shows Promise in Eradicating Genetic Disorders",
    summary:
      'A new study published in "Nature" demonstrates a novel CRISPR-Cas9 technique that has successfully corrected a genetic mutation in preclinical trials, opening new doors for therapeutic applications.',
    author: "Dr. Elena Vance",
    publication: "Nature Journal",
    date: "June 10, 2025",
    category: "Breakthroughs",
    imageUrl: "https://picsum.photos/id/101/1200/800",
    isFeatured: true,
  },
  {
    id: "news-02",
    title:
      "AI Models Now Able to Predict Protein Folding with Unprecedented Accuracy",
    summary:
      "DeepMind's latest model, AlphaFold 3, is revolutionizing structural biology by predicting the structure of complex proteins, which could massively accelerate drug discovery.",
    author: "Sarah Jenkins",
    publication: "MIT Technology Review",
    date: "June 9, 2025",
    category: "AI in Academia",
    imageUrl: "https://picsum.photos/id/42/1200/800",
  },
  {
    id: "news-03",
    title:
      "The Future of Higher Education: A Shift Towards Hybrid Learning Models",
    summary:
      "Universities globally are adopting hybrid learning models, blending online and in-person instruction to increase flexibility and accessibility for students post-pandemic.",
    author: "David Matthews",
    publication: "Times Higher Education",
    date: "June 8, 2025",
    category: "Higher Ed",
    imageUrl: "https://picsum.photos/id/211/1200/800",
  },
  {
    id: "news-04",
    title:
      "National Science Foundation Announces $200M in Funding for Quantum Computing Research",
    summary:
      "The NSF has launched a new initiative to fund ambitious, large-scale quantum computing projects across several leading U.S. universities.",
    author: "Admin",
    publication: "NSF Press Releases",
    date: "June 7, 2025",
    category: "Funding",
    imageUrl: "https://picsum.photos/id/54/1200/800",
  },
  {
    id: "news-05",
    title:
      "Newly Discovered Viking-Era Text Sheds Light on Early Norse Mythology",
    summary:
      "Archaeologists in Norway have unearthed a runestone with inscriptions that challenge previous understandings of the Norse pantheon and pre-Christian traditions.",
    author: "Dr. Ingrid Bjornsen",
    publication: "Journal of Archaeological Science",
    date: "June 5, 2025",
    category: "Humanities",
    imageUrl: "https://picsum.photos/id/1043/1200/800",
  },
];

export const newsCategories: NewsCategory[] = [
  "Breakthroughs",
  "Higher Ed",
  "AI in Academia",
  "Funding",
  "Humanities",
];
