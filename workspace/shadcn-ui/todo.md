# RafflePi Application - MVP Todo List

## Overview
Building a Pi Network raffle/lottery application with frontend and backend capabilities.

## Core Features to Implement
1. **Frontend Components (React + shadcn/ui)**
   - Main raffle display with current pot and countdown
   - Ticket purchasing interface with 5 packages
   - Leaders/leaderboard section
   - Winners history section
   - Pi Network authentication integration
   - Responsive design

2. **Backend API (Node.js/Express simulation)**
   - Raffle state management
   - Ticket purchase handling
   - Winner selection logic
   - User data management
   - Pi Network payment integration simulation

## Files to Create
1. `src/pages/Index.tsx` - Main application page
2. `src/components/RaffleHeader.tsx` - Header with pot and countdown
3. `src/components/TicketPackages.tsx` - Ticket purchasing interface
4. `src/components/LeaderBoard.tsx` - Leaders section
5. `src/components/WinnersHistory.tsx` - Winners display
6. `src/components/PiAuth.tsx` - Pi Network authentication
7. `src/lib/api.ts` - Backend API simulation
8. `src/types/raffle.ts` - TypeScript interfaces

## Implementation Strategy
- Use localStorage for data persistence (simulating backend)
- Implement Pi Network SDK integration
- Create responsive design matching the demo
- Add real-time countdown functionality
- Implement winner selection algorithm