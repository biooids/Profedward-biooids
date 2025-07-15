// lib/data/mock-opportunities.ts
import React from "react";

export type OpportunityType =
  | "Scholarship"
  | "Internship"
  | "Fellowship"
  | "Event";

export type Opportunity = {
  id: string;
  title: string;
  organization: string;
  type: OpportunityType;
  description: string;
  deadline: string;
  location: "Remote" | "On-site" | "Hybrid";
  field: "STEM" | "Humanities" | "Arts" | "Business" | "General";
  award?: string; // For scholarships/fellowships, e.g., "$10,000"
  isFeatured?: boolean;
};

export const mockOpportunities: Opportunity[] = [
  {
    id: "opp-01",
    title: "Global Excellence Scholarship 2025",
    organization: "Horizon Foundation",
    type: "Scholarship",
    description:
      "A prestigious scholarship for outstanding students in STEM fields, offering full tuition coverage and mentorship.",
    deadline: "2025-12-15",
    location: "On-site",
    field: "STEM",
    award: "$25,000 per year",
    isFeatured: true,
  },
  {
    id: "opp-02",
    title: "Summer Research Internship",
    organization: "Innovatech Labs",
    type: "Internship",
    description:
      "A 10-week paid internship focused on machine learning research and development.",
    deadline: "2025-03-01",
    location: "Remote",
    field: "STEM",
    award: "Paid Position",
  },
  {
    id: "opp-03",
    title: "Digital Humanities Fellowship",
    organization: "The Getty Institute",
    type: "Fellowship",
    description:
      "A year-long fellowship for PhD candidates exploring the intersection of technology and the humanities.",
    deadline: "2025-04-30",
    location: "On-site",
    field: "Humanities",
    award: "$30,000 stipend",
  },
  {
    id: "opp-04",
    title: "Innovate for Good Conference",
    organization: "TechCrunch",
    type: "Event",
    description:
      "A 3-day conference connecting student innovators with leaders in social impact technology.",
    deadline: "2025-08-15", // Registration deadline
    location: "On-site",
    field: "General",
  },
  {
    id: "opp-05",
    title: "Clean Energy Grant",
    organization: "Green Future Fund",
    type: "Scholarship",
    description:
      "Funding for undergraduate and graduate projects related to sustainable energy solutions.",
    deadline: "2025-11-01",
    location: "Remote",
    field: "STEM",
    award: "Up to $5,000",
  },
];

export const opportunityTypes: OpportunityType[] = [
  "Scholarship",
  "Internship",
  "Fellowship",
  "Event",
];
