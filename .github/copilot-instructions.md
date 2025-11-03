# AI Assistant Instructions for gobierno Project

## Project Overview
This is a React-based government administrative system with two main modules:
- Treasury Management (`/tesoreria`)
- Public Works Management (`/obras`)

## Architecture

### Core Technologies
- React + TypeScript
- Vite for build tooling
- React Router for routing
- React Query for data management
- Zustand for state management
- Tailwind CSS + Radix UI for styling

### Project Structure
```
src/
├── app/          # Core app setup (routes, layouts, guards)
├── auth/         # Authentication logic and components
├── treasury/     # Treasury module (financial management)
├── publicWorks/  # Public works module
└── shared/       # Shared utilities and components
```

### Key Patterns

1. **Authentication Flow**
- Uses token-based auth via `auth.store.ts`
- Protected routes handled by `RequireAuth` guard
- Default credentials: tesorero@demo/demo1234

2. **API Communication**
- Centralized in `shared/lib/api.ts`
- Mock adapter for development
- Standardized error handling with toast notifications
- Module-specific API services (e.g., `publicWorksApi.ts`)

3. **Component Organization**
- Features organized by domain (treasury/publicWorks)
- Each domain has:
  - `components/` - Reusable UI components
  - `hooks/` - Custom hooks for data/logic
  - `pages/` - Route components
  - `services/` - API interfaces
  - `types.ts` - TypeScript definitions

4. **State Management**
- Global auth state: Zustand store in `auth.store.ts`
- Server state: React Query hooks in domain `hooks/` folders
- UI state: Local state or domain-specific stores

## Common Tasks

### Adding New Features
1. Create components in relevant domain folder
2. Add routes in `app/routes.tsx`
3. Create API methods in domain's service file
4. Implement data hooks in domain's `hooks/` directory

### Error Handling
- API errors automatically shown via toast notifications
- Use `toast()` from `@shared/hooks/useToast` for user feedback

### Testing Conventions
- Test files adjacent to implementation (`__tests__/` folders)
- Use Vitest for testing
- Mock API responses in `mocks/handlers.ts`

## File Locations for Common Tasks
- New routes: `src/app/routes.tsx`
- Auth logic: `src/auth/useAuth.ts`
- API setup: `src/shared/lib/api.ts`
- Shared components: `src/shared/components/`
- Mock data: `src/mocks/`

## Development Workflow
```bash
# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```