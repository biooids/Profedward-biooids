// lib/data/mock-relaxing-area-data.ts
import React from "react";
import {
  Gamepad2,
  Puzzle,
  Library,
  Brain,
  Coffee,
  CloudRain,
  Wind,
} from "lucide-react";

// --- Types ---
export type GameCategory = "Strategy" | "Board" | "Puzzle" | "Card";
export type Game = {
  id: string;
  name: string;
  description: string;
  category: GameCategory;
  image: string;
  players: string;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard";
  available: boolean;
};
export type Soundscape = {
  id: string;
  name: string;
  icon: React.ReactNode;
};

// --- Mock Data ---
export const mockGames: Game[] = [
  {
    id: "chess",
    name: "Chess",
    description: "The classic game of strategy and intellect.",
    category: "Strategy",
    image: "https://picsum.photos/id/260/600/400",
    players: "2",
    duration: "30-60 min",
    difficulty: "Hard",
    available: true,
  },
  {
    id: "sudoku",
    name: "Sudoku",
    description: "A logic-based number-placement puzzle.",
    category: "Puzzle",
    image: "https://picsum.photos/id/131/600/400",
    players: "1",
    duration: "15-45 min",
    difficulty: "Medium",
    available: true,
  },
  {
    id: "solitaire",
    name: "Solitaire",
    description: "A timeless single-player card game of patience.",
    category: "Card",
    image: "https://picsum.photos/id/111/600/400",
    players: "1",
    duration: "10-20 min",
    difficulty: "Easy",
    available: true,
  },
  {
    id: "scrabble",
    name: "Scrabble",
    description: "Build words and challenge your vocabulary.",
    category: "Board",
    image: "https://picsum.photos/id/278/600/400",
    players: "2-4",
    duration: "45-90 min",
    difficulty: "Medium",
    available: false,
  },
];
export const gameCategories: GameCategory[] = [
  "Strategy",
  "Board",
  "Puzzle",
  "Card",
];

export const mockSoundscapes: Soundscape[] = [
  { id: "rain", name: "Rainy Day", icon: <CloudRain /> },
  { id: "library", name: "Library Scriptorium", icon: <Library /> },
  { id: "cafe", name: "Coffee Shop", icon: <Coffee /> },
];
