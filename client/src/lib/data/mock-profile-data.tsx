// lib/data/mock-profile-data.tsx
import React from "react";
import { FileText, BookOpen, Clock, Award } from "lucide-react";

export const mockUser = {
  name: "Jane Smith",
  email: "jane.smith@university.edu",
  phone: "+1 (234) 567-8901",
  university: "State University",
  major: "Computer Science",
  year: "Junior Year",
  avatarUrl: "https://picsum.photos/id/237/200",
  about:
    "Dedicated Computer Science student with a profound passion for artificial intelligence and machine learning. Actively seeking research opportunities and scholarships to contribute to innovative projects and further my education in computational linguistics.",
  interests: [
    "Artificial Intelligence",
    "Machine Learning",
    "Data Science",
    "Web Development",
    "Cybersecurity",
  ],
  education: [
    {
      institution: "State University",
      degree: "Bachelor of Science in Computer Science",
      years: "2023 - Present",
    },
    {
      institution: "Central High School",
      degree: "High School Diploma",
      years: "2019 - 2023",
    },
  ],
  activities: [
    "Robotics Club President",
    "Student Government Senator",
    "Math Department Tutor",
  ],
  awards: [
    { title: "Dean's List", issuer: "Fall 2023, Spring 2024" },
    {
      title: "Hackathon Winner (1st Place)",
      issuer: "State University Tech Fest 2024",
    },
  ],
  skills: [
    { name: "Python", proficiency: 90 },
    { name: "Java", proficiency: 75 },
    { name: "Web Development", proficiency: 85 },
  ],
};

export const mockStats = [
  { label: "Documents", value: 24, icon: <FileText className="h-5 w-5" /> },
  { label: "Courses", value: 8, icon: <BookOpen className="h-5 w-5" /> },
  { label: "Study Hours", value: 143, icon: <Clock className="h-5 w-5" /> },
  { label: "Awards", value: 2, icon: <Award className="h-5 w-5" /> },
];
