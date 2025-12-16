COMPLETE PROJECT OUTLINE
BiswasSetu -Bridge of Trust
1️⃣ Project Overview
Project Title

BishwasSetu – Bridge of Trust

Vision

To create a community-driven trust ecosystem that helps people in Nepal confidently hire reliable local service providers using verified reviews, behavior-based trust scores, and transparent dispute handling.

Problem Statement

People in Nepal often hesitate to hire local service providers due to:

Lack of verified reviews

Fake or biased ratings

No accountability after service completion

No structured complaint resolution system

Proposed Solution

A centralized trust platform where:

Service providers are evaluated using behavior-based trust scores

Reviews are linked only to verified bookings

Complaints are tracked and resolved transparently

Honest vendors are rewarded with higher visibility

2️⃣ System Architecture (High Level)
Public Website
     |
Authentication Layer (JWT + Cookies)
     |
-----------------------------------------
| Customer Dashboard                    |
| Vendor Dashboard                      |
| Admin Dashboard                       |
-----------------------------------------
     |
Backend REST API (Node + Express)
     |
Trust Score Engine
     |
Database (MySQL + Prisma)

3️⃣ Tech Stack (Final & Practical)
Frontend

React.js + TypeScript

Tailwind CSS

shadcn/ui

framer-motion

lucide-react

Axios

React Router 

Backend

Node.js

Express.js

Prisma ORM

MySQL

JWT Authentication (HttpOnly cookies)

Role-Based Access Control (RBAC)

Rate limiting

Dev Tools

Git & GitHub

Postman

VS Code

Docker (optional)

4️⃣ PUBLIC WEBSITE (Marketing Layer)
Purpose

Educate users

Build initial trust

Convert visitors into users/vendors

Pages & Features
Navigation

Home

Services

Providers

About

Login / Register

Home Page Sections

Hero section with search

Platform value highlights

Service categories

Featured trusted providers

Community impact stats

Call-to-action section

Footer (legal & contact)

Frontend Responsibility

SEO-friendly UI

Responsive layout

Reusable components

Backend Support

Public providers API

Public trust score API

5️⃣ CUSTOMER DASHBOARD (Service Seekers)
Purpose

To help customers find, book, review, and report services confidently.

Core Features
Dashboard Overview

Active bookings

Completed services

Trusted providers

Recent activity

Search Services

Filter by:

Category

Location

Trust score

Provider cards

Bookings Management

Upcoming / completed bookings

Review submission (only after completion)

Reviews & Ratings

Review history

Trust score impact indicator

Complaints & Support

Submit complaint

Track resolution status

Notifications

Booking updates

Complaint updates

Profile & Settings

Personal info

Security settings

6️⃣ VENDOR DASHBOARD (Service Providers)
Purpose

To help vendors manage jobs, build trust, and grow income.

Core Features
Dashboard Overview

New job requests

Active jobs

Monthly earnings

Current trust score

Job Requests & Jobs

Accept / reject jobs

Mark jobs as completed

Trust Score & Reputation

Trust score (0–100)

Breakdown:

Completion rate

Timeliness

Reviews

Complaint history

Verification status

Trend visualization

Improvement tips

Reviews & Feedback

View reviews

Respond to feedback

Complaints & Disputes

View complaints

Submit explanation

Availability & Schedule

Weekly availability

Vacation mode

Profile & Verification

Business details

Document upload

Verification badge

7️⃣ ADMIN DASHBOARD (Governance Layer)
Purpose

To maintain fairness, transparency, and quality.

Core Features
Admin Overview

Platform statistics

Trust score distribution

Vendor Verification

Review documents

Approve / reject vendors

Complaint Management

Review disputes

Resolve complaints

Trust Score Moderation

Audit trust score components

Manual adjustment with reason logging

User Management

Suspend or warn users/vendors

8️⃣ TRUST SCORE SYSTEM (CORE INNOVATION)
Trust Score (0–100)
Factor	Weight
Job completion rate	30%
Timeliness	20%
Customer reviews	25%
Complaint history	15%
Verification status	10%
Key Rules

Reviews allowed only after verified bookings

Complaints reduce score gradually

Resolved complaints recover trust slowly

One bad review cannot destroy reputation

9️⃣ AUTHENTICATION & SECURITY
Auth Features

Email + password

OTP verification

JWT-based authentication

Role-based authorization

Security Measures

Rate limiting

Input validation

Secure cookies

🔟 FRONTEND ↔ BACKEND SYNC (IMPORTANT)
Role-based API Mapping
Public

GET /providers

GET /categories

Customer

POST /bookings

POST /reviews

POST /complaints

Vendor

GET /jobs

PATCH /jobs/:id

GET /trust-score

Admin

PATCH /admin/verify

PATCH /admin/complaints

PATCH /admin/trust-adjust