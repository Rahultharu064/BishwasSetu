Project Name: BishwasSetu – Home Services & Community Trust Platform

Goal: Fully professional, modern, responsive public website for desktop, tablet, and mobile. Includes Navbar, Footer, and all main pages: Home, Services, Providers, About, Login/Register.

1️⃣ Global Design System

Color Palette:

Primary / CTA: #1E90FF

Secondary / Highlights: #FFD700

Success / Verified: #28A745

Warning / Pending: #FFC107

Danger / Errors: #DC3545

Background: #F8F9FA

Surface / Cards: #FFFFFF

Text Primary: #212529

Text Secondary: #6C757D

Border / Divider: #E9ECEF

Typography (desktop scale):

H1: 40px, Bold, 48px line-height

H2: 32px, Semi-bold, 40px line-height

H3: 24px, Medium, 32px line-height

Body Large: 18px, Regular, 28px line-height

Body Normal: 16px, Regular, 24px line-height

Small / Helper Text: 14px, Regular, 20px line-height

Buttons: 16–18px, Medium / Semi-bold

Spacing:

Base grid: 8px increments

Section padding: 64px top/bottom desktop, 48px tablet, 32px mobile

Card padding: 24px

Gap between cards: 24px desktop, 16px tablet, 12px mobile

Border & Shadow:

Card radius: 16px

Shadows: rgba(0,0,0,0.08) 0px 4px 12px for card elevation

2️⃣ Navbar (Global)

Layout Desktop:

Height: 80px

Logo (left): 160px width × 40px height

Menu (center): 24px spacing between links, font 16px semi-bold

CTA Buttons (right):

Login: Outline (#1E90FF) 120x40px

Register: Filled (#1E90FF) 140x44px

Mobile:

Hamburger icon: 32x32px

Drawer width: 280px

Menu items stacked, 24px vertical spacing

Interactions:

Sticky top, soft shadow on scroll

Hover underline on links, 2px height, transition 0.3s

Active link highlighted #1E90FF

3️⃣ Footer (Global)

Structure: 4 columns desktop, stacked on mobile

Brand: Logo 120x32px + tagline

Quick Links: 16px font, 20px line-height, 12px vertical spacing

Legal: same as Quick Links

Contact Info: 16px font, 20px line-height

Bottom Bar: 48px height, #E9ECEF background

4️⃣ Pages
A. Home / Landing Page

Hero Section:

Height: 600px desktop, 400px tablet

Two-column layout: left 60% (text & CTA), right 40% illustration

Headline: H1 (40px), Subtext: Body Large (18px)

Search bar: width 100% max 500px, height 50px, border-radius 12px

CTA buttons: "Find Trusted Vendors" 160x48px, "Join as Vendor" 140x44px

Background: subtle motion/gradient (#F0F8FF → #FFFFFF)

Service Categories Grid:

Desktop: 3 columns × 2 rows

Card: 180x180px, padding 24px, icon 48x48px centered

Gap: 24px

Hover: lift 6px, shadow increase

Featured Providers Section:

Horizontal scroll desktop: Card 240x280px, image 160x120px top

Trust badge: 32x32px circle top-right

Card hover: slide-up 8px, CTA button appear

Why BishwasSetu Section:

4 cards grid, 1 icon + 1 heading + 1 description

Icon: 48x48px

Gap: 24px desktop, 16px tablet

Community Highlights Section:

3 stats cards (Total bookings, Trusted vendors, Community vouches)

Card: 180x120px

Animated counters via framer-motion

CTA Banner: height 200px, background: #1E90FF, text white, button white-filled hover primary blue

B. Services Page

Page title H2: 32px

Grid: 3 columns desktop, 2 tablet, 1 mobile

Card: 200x200px, icon 48x48px, padding 16px

Hover: lift 4px, shadow increase

Optional sidebar filter: width 280px, checkboxes for category & ratings

C. Providers Page

Search bar: width 400px desktop, 100% mobile

Filters: Category, Location, Trust Score (dropdowns)

Grid cards: 3 columns desktop, 2 tablet, 1 mobile

Card: 240x280px, image 120x120px circle, badge top-right 32x32px

Hover: Show quick actions – "Book Service" 120x40px

D. About Page

Two-column layout for Mission & Vision: left image 400x400px, right text

Team cards: circle photo 120x120px, name, role below

Contact form: width 400px desktop, 100% mobile, inputs height 50px

E. Login / Register Page

Split-screen layout: 50% illustration / branding, 50% form

Form width 400px desktop, 100% mobile

Input height: 50px, border-radius 12px

Role selection: toggle buttons 120x40px

CTA: Register 140x44px primary, Login 120x40px outline

5️⃣ Interactions & Animations

Hero CTA buttons: subtle scale-up hover 1.05x, transition 0.3s

Card hover: lift + shadow

Navbar link hover: underline animate 0.3s

Counters: 0 → value animation using framer-motion

Horizontal scroll: smooth inertia

Mobile drawer slide-in / slide-out

6️⃣ Responsive Settings

Desktop: 1440px, full grid
Tablet: 1024px, reduce columns & padding
Mobile: 375px, stacked single-column cards, collapsible filters & sections

7️⃣ Output

Separate frames for each page: Home, Services, Providers, About, Login/Register

Include global navbar & footer

Cards, badges, modals, buttons

Typography, spacing, grid, and colors as per system

Hover and active states included

Animation / interaction notes for developer handoff