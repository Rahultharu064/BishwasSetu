BishwasSetu – Complete Project Outline

Home Services & Community Trust Platform

1. Platform Overview

BishwasSetu is a trust-based home services marketplace that connects customers with verified service providers using a transparent Trust Score system, mandatory provider verification (KYC), and community-driven reviews.

2. Core Platform Modules

Public Website

Authentication & Authorization

Customer Module

Service Provider Module

Provider Professional Information & KYC (Mandatory)

Service Discovery & Advanced Search

Booking & Job Management

Trust Score Engine

Review & Rating System

Complaint & Resolution System

Admin & Moderator Panel

Notifications & Payments (Optional MVP)

3. Frontend Engineer – Page-wise Responsibilities
Professional UI Rules

All public pages share common Header & Footer

Dashboard pages use role-based layouts

Consistent design system & animations

3.1 Public Website (No Login Required)
A. Global Header (Navbar)

Logo: BishwasSetu

Menu: Home | Services | Providers | About

Actions: Login | Register

Sticky navbar, hover animations, mobile drawer

B. Global Footer

Brand & tagline

Quick links

Legal links

Contact info

Public Pages
1. Landing Page

Hero section with service + location search

Service categories grid

Why BishwasSetu (Trust, Verification, Support)

Featured trusted providers

Call-to-action banners

2. Services Page (Updated – Informative)

Service category cards with:

Icon

Description

Avg trust score

“View Providers” CTA

Service detail preview:

Included tasks

Estimated pricing

Avg completion time

Trust benefits section

3. Providers Page (Updated – Advanced)

Advanced filters:

Category

Location

Trust score

Verification status

Availability

Provider cards:

Photo

Skills

Experience

Trust score

Verification badge

Provider profile detail page:

Trust score breakdown

Experience Badge

Reviews

Availability

Book service CTA

4. About Page

Mission & vision

Trust philosophy

Platform values

Contact details

3.2 Authentication Pages
5. Login / Register

Phone or Email

OTP verification

Role selection:

Customer

Provider

3.3 Customer Module (After Login)
6. Customer Dashboard

Nearby trusted providers

Recommended services

Recent bookings summary

7. Provider Profile Page

Detailed provider info

Trust score meter

Reviews & ratings

Book service CTA

8. Booking Flow

Booking creation page

Booking status tracking

Review & rating submission

3.4 Service Provider Module (After Login)
🚨 Mandatory Enforcement Rule

Providers CANNOT accept bookings until professional info & KYC are approved.

9. Provider Onboarding Status Page

Status indicators:

Incomplete

Documents Pending

Under Review

Verified

Rejected (with reason)

10. Provider Professional Information Page

Legal name

Phone & email

Service categories & skills

Experience

Experience Badge (based on years of experience):

- Navin (नविन): Below 1 year

- Anubhavi (अनुभवी): 1-2 years

- Prabin (प्रवीन): More than 2 years

Service description

Service area

Availability schedule

3.5 Provider Document Verification (KYC) – REQUIRED
11. Provider KYC Page (Wizard Flow)

Step 1: Professional Info
Step 2: Document Upload

Government ID

Profile photo

Certificate (optional)

Step 3: Verification Status

Status badges

Admin feedback

Re-upload option

Post-Submission Behavior

Redirect to Read-Only Dashboard

Booking disabled

Trust score locked

12. Provider Dashboard (Verified Only)

Trust score overview

Booking requests

Earnings summary

Verification badge

13. Booking Management

Accept / reject bookings

Update job status

Mark completed

3.6 Admin & Moderator Module
14. Provider Verification Review (Admin)

View uploaded documents

Approve / reject

Add rejection reason

15. Complaint Review Page

Complaint details

Chat timeline

Resolution actions

16. Admin Dashboard

Users & providers management

Trust score audit logs

Platform analytics

Fraud & abuse flags

4. Backend Engineer – Feature-wise Responsibilities
4.1 Authentication & Authorization
POST /api/auth/register
POST /api/auth/login
POST /api/auth/verify-otp
POST /api/auth/logout


OTP authentication

JWT with HttpOnly cookies

Role-based access control

4.2 User & Provider Management
GET  /api/users/me
PUT  /api/users/me
GET  /api/providers/:id
PUT  /api/providers/profile

4.3 Provider Professional Info & KYC
POST /api/providers/profile/complete
POST /api/providers/kyc/upload
GET  /api/providers/kyc/status

GET  /api/admin/providers/kyc
PUT  /api/admin/providers/kyc/:id/approve
PUT  /api/admin/providers/kyc/:id/reject


Business Rule:
Providers with status ≠ VERIFIED cannot accept bookings.

4.4 Service & Category Module
GET  /api/categories
POST /api/categories (Admin)

4.5 Provider Discovery & Search
GET /api/providers


Filters: category, location, trust score, verification

4.6 Booking & Job Lifecycle
POST /api/bookings
GET  /api/bookings/:id
PUT  /api/bookings/:id/status

4.7 Review & Rating System
POST /api/reviews
GET  /api/providers/:id/reviews

4.8 Trust Score Engine
GET /api/providers/:id/trust-score


Inputs:

Reviews

Timeliness

Complaints

Verification

Community vouches

4.9 Complaint & Resolution System
POST /api/complaints
PUT  /api/complaints/:id/resolve

4.10 Admin Module
GET  /api/admin/users
GET  /api/admin/providers
PUT  /api/admin/providers/:id/status

5. Database & DevOps

Prisma schema

KYC document tables

Status enums

Secure file storage

Indexing & optimization
