Warehouse Management System
Overview
A React Native mobile application for efficient warehouse inventory management. This system allows businesses to track products across multiple locations, manage stock levels, and maintain detailed product information with barcode scanning capabilities.
Features

Product Management

Add and edit products with detailed information
Barcode scanning for quick product identification
Image upload and management
Product history tracking


Stock Management

Multi-location inventory tracking
Real-time stock level monitoring
Stock adjustment functionality
Location-based stock distribution


Documentation

PDF export for product details
Barcode generation
Supplier information management



Tech Stack

React Native with Expo
TypeScript
Expo Camera and Barcode Scanner
React Navigation
Axios for API communication
AsyncStorage for local data persistence

Prerequisites

Node.js (v14 or higher)
npm or yarn
Expo CLI
iOS Simulator or Android Emulator

Installation

Clone the repository:

bashCopygit clone [https://github.com/OUMAIMAtakrour/warehouse_management.git]

Install dependencies:

bashCopynpm install
# or
yarn install

Start the application:

bashCopynpm start
# or
yarn start
Project Structure
Copysrc/
  ├── components/     # Reusable UI components
  ├── screens/        # Application screens
  ├── services/       # API services
  ├── types/          # TypeScript definitions
  ├── assets/         # Images, fonts, etc.
  └── utils/          # Helper functions
Available Scripts

npm start: Start the Expo development server
npm run android: Run on Android device/emulator
npm run ios: Run on iOS simulator
npm run web: Run in web browser

Testing
Tests are configured with Jest:
bashCopy:
npx jest