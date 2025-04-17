# **App Name**: RVMS

## Core Features:

- Application Management: Enable users to add, edit, and delete application records, each with specific details such as name, category, and associated vulnerabilities.
- Vulnerability Management: Enable users to add, edit, and delete vulnerability records, linking them to specific applications with details like title, description, risk level, status, report link, and date discovered. Allows filtering by risk level, status and application.
- Dashboard Overview: Display a dashboard providing a summary of vulnerability data, including total vulnerabilities, risk level breakdown (using charts), total applications, and a list of recently added vulnerabilities.
- File Upload and Management: Allow users to upload and preview or download PDF reports for each vulnerability or application to centralize documentation.
- AI-Powered Risk Assessment: AI Tool that suggests potential risk levels or remediation steps based on the vulnerability description.

## Style Guidelines:

- Neutral base colors: white, gray, and black to provide a clean and professional look.
- Status indicators: Green for fixed, red for critical, orange for medium, and yellow for low.
- Accent color: Blue (#007BFF) for interactive elements and highlights.
- Clean and readable typography to improve readability and user experience.
- Simple, flat icons for easy recognition and a modern look.
- Sidebar navigation for easy access to applications, vulnerabilities, and the dashboard.
- Subtle animations for a smooth and engaging user experience.

## Original User Request:
Title:
RVMD — Modern & Minimalist Design

Description:
Design a modern, clean, and intuitive web-based application for managing penetration testing findings and vulnerable applications. The goal is to simplify vulnerability tracking and reporting for a solo security analyst or a small cybersecurity team.

Core Features
Applications Management

Add, edit, and delete applications.

View list of applications with a clean table layout.

Filter applications by name or category.

Link vulnerabilities directly to each application.

Vulnerability Management

Add, edit, and delete vulnerability records.

Attach vulnerabilities to specific applications.

Fields include:

Title

Description

Risk Level (Low, Medium, High, Critical)

Status (Open, In Progress, Fixed)

Report Link (Upload and view PDF reports)

Date Discovered

Filter vulnerabilities by:

Risk Level

Status

Application

Dashboard

Total number of vulnerabilities.

Breakdown by risk level (Low, Medium, High, Critical) using charts.

Total applications.

Recently added vulnerabilities list.

Pie or bar chart to visualize the distribution of risks.

File Upload

Ability to upload PDF reports for each vulnerability or application.

Preview or download PDF reports.

Design Style
Minimalist, modern design.

Light and dark theme support.

Rounded corners, soft shadows, and smooth animations.

Simple, flat iconography.

Color scheme: Neutral base colors (white, gray, black) with accent colors for status (green = fixed, red = critical, orange = medium, yellow = low).

Use clean typography: Inter, Roboto, or similar.

UI Components
Sidebar navigation (Applications, Vulnerabilities, Dashboard, Settings).

Application List page: Table with search & filter.

Vulnerability List page: Table with status badges, risk tags, and filtering.

Create & Edit Forms with modern input design.

File Upload widget for PDFs.

Dashboard cards: Total Counts, Risk Breakdown Chart, Recent Activity.

Tech Stack Suggestion (if code generation)
Frontend: React / Next.js with TailwindCSS.

Backend: Node.js with Express or FastAPI.

Database: PostgreSQL or SQLite (lightweight).

File Storage: Local storage or S3 for PDF reports.

Charts: Recharts or Chart.js for visual reporting.

Auth: Simple JWT-based authentication.

Goal
Centralize vulnerability tracking.

Improve personal productivity.

Simplify reporting and documentation.

Clean, easy-to-navigate interface that feels professional.
  