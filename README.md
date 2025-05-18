# SHMS Frontend (React Application)

This is the frontend client for the Smart Hotel Management System (SHMS), built with React and Tailwind CSS.

## Features

- Responsive design that works on desktops, tablets, and mobile devices
- Role-based access control for guests, hotel managers, and administrators
- Interactive UI for booking rooms, managing hotels, and admin operations
- JWT authentication for secure user sessions
- Real-time validation for forms and user input

## Project Structure

The React client is organized as follows:

```
client/
├── public/          # Static files
├── src/             # Source code
│   ├── components/  # Reusable UI components
│   ├── context/     # React context providers (auth, etc.)
│   ├── pages/       # Page components
│   ├── services/    # API service layer
│   ├── utils/       # Utility functions
│   ├── App.js       # Main application component
│   └── index.js     # Application entry point
└── package.json     # Dependencies and scripts
```

## Key Components

- **Authentication**: JWT-based authentication with protected routes
- **Context API**: Global state management for user authentication
- **Service Layer**: Abstraction for API communication
- **Responsive UI**: Tailwind CSS for responsive design
- **Form Validation**: Client-side validation for user inputs

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- SHMS backend API running at http://localhost:5217

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

The application will be available at http://localhost:3000.

### Environment Variables

Create a `.env` file in the client directory with the following variables:

```
REACT_APP_API_URL=http://localhost:5217/api
```

## User Interfaces

### Guest Interface

- Home page with hotel search
- Hotel details with room listings
- Booking form for room reservation
- Guest dashboard for managing bookings and reviews
- Profile management

### Hotel Manager Interface

- Manager dashboard
- Hotel management (details, amenities)
- Room management (add, edit, availability)
- Booking overview
- Review management

### Admin Interface

- Admin dashboard
- User management
- Hotel and manager assignment
- System-wide statistics

## Building for Production

To create a production build:

```bash
npm run build
```

This creates an optimized build in the `build` folder that can be deployed to any static hosting service.

## Testing

Run the test suite:

```bash
npm test
```

## Troubleshooting

### Common Issues

1. **API Connection Problems**
   - Ensure the backend API is running
   - Check the API URL in the `.env` file or `src/services/api.js`

2. **Authentication Issues**
   - Clear browser localStorage and cookies
   - Verify that the JWT token is being sent in API requests

3. **UI Rendering Problems**
   - Check browser console for JavaScript errors
   - Verify that you're using a supported browser

## Additional Scripts

In the project directory, you can also run:

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for performance.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

This command will remove the Create React App build dependency from your project and copy all configuration files and dependencies directly into your project.

## Learn More

- [React Documentation](https://reactjs.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)
