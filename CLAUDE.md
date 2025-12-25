# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Agan-Adhigaram-Admin is a React-based admin dashboard for managing a Tamil book store. It's built on the Minimal UI Kit template and uses Firebase as the backend.

## Development Commands

```bash
npm start          # Start development server
npm run build      # Create production build
npm run lint       # Run ESLint on src/
npm run lint:fix   # Auto-fix lint issues
npm run deploy     # Deploy to Firebase hosting
npm run build-and-deploy  # Build and deploy in one step
```

## Architecture

### State Management
The app uses a dual state management approach:
- **Redux Toolkit** (`src/store/`) - Primary state for user authentication and orders
  - `userSlice.js` - Authentication state with login/logout actions
  - `orderSlice.js` - Order management with status categories (booked, dispatched, delivered, cancelled)
- **React Context** (`src/context/auth-context.js`) - Legacy auth context (being phased out in favor of Redux)

### Firebase Integration
Firebase services are initialized in `src/services/firebase.js`:
- **Authentication** - Email/password auth via Firebase Auth
- **Firestore** - Database for books, orders, and users
- **Storage** - Image storage for book covers
- **Hosting** - Deployed to `admin-agan-adhigaram.firebaseapp.com`

### Directory Structure
- `src/pages/` - Route-level page components
- `src/sections/@dashboard/` - Dashboard feature sections (products, blog, settings, user)
- `src/Reuseable/` - Shared UI components (modals, tables, spinners, uploads)
- `src/components/` - Base UI components (chart, label, logo, scrollbar, nav-section)
- `src/layouts/` - Dashboard and simple layout shells
- `src/theme/` - MUI theme configuration (palette, typography, shadows, component overrides)
- `src/api/` - Firebase API wrapper functions
- `src/utils/` - Helper functions (formatting, notifications, validation)

### Key Data Models (Firestore Collections)
- `books` - Book catalog with title, author, genre, price, Tamil translations
- `orders` - Customer orders with status tracking, user details, ordered_books array
- `users` - Admin user profiles

### Routing
Routes are defined in `src/routes.js` with protected route logic:
- `/dashboard/*` - Main admin routes (requires authentication)
- `/login`, `/register` - Auth routes
- Active routes: `/dashboard/book-management`, `/dashboard/order-histroy`

### UI Framework
- Material-UI v5 with custom theme in `src/theme/`
- ApexCharts for dashboard visualizations
- react-toastify for notifications (`successNotification`, `errorNotification` from `src/utils/notification.js`)

## Key Patterns

### Firebase Data Fetching
Data is fetched using Firestore SDK directly in components:
```javascript
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

const booksRef = collection(db, 'books');
getDocs(booksRef).then(snapshot => { ... });
```

### Modal Pattern
Book/Product editing uses modal components from `src/Reuseable/Modal/` that receive:
- Current item data for editing
- `showModal`/`closeModal` state handlers
- `updateItems` callback to refresh parent list

### Path Aliases
Uses `src/` as import alias (configured in jsconfig.json), e.g.:
```javascript
import OrderTabs from 'src/Reuseable/OrderTab/OrderTabs';
```
