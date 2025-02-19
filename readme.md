
# Warehouse Management System  

A **React Native** mobile application for **warehouse inventory management**. This system helps businesses track products across multiple locations, monitor stock levels in real time, and maintain detailed product information using barcode scanning.  

## Features  

### Product Management  
- Add and edit products with comprehensive details.  
- Barcode scanning for quick product identification.  
- Image upload and management for better product visualization.  
- Product history tracking for monitoring changes over time.  

### Stock Management  
- Multi-location inventory tracking to manage stock across different warehouses.  
- Real-time stock level monitoring to prevent shortages or overstocking.  
- Stock adjustment functionality to update quantities when needed.  
- Location-based stock distribution to optimize inventory placement.  

### Documentation & Reporting  
- PDF export for generating product reports.  
- Barcode generation for easier product tracking.  
- Supplier information management for seamless procurement tracking.  

## Tech Stack  
- **React Native with Expo** for cross-platform mobile development.  
- **TypeScript** for type safety and maintainability.  
- **Expo Camera and Barcode Scanner** for efficient barcode reading.  
- **React Navigation** for smooth app navigation.  
- **Axios** for API communication with the backend.  
- **AsyncStorage** for local data persistence.  

## Prerequisites  
Before running the application, ensure you have the following installed:  
- Node.js (v14 or higher)  
- npm or yarn  
- Expo CLI  
- iOS Simulator (Xcode) or Android Emulator (Android Studio)  

## Installation  

1. Clone the repository:  
   ```bash
   git clone https://github.com/OUMAIMAtakrour/warehouse_management.git
   cd warehouse_management
   ```  
2. Install dependencies:  
   ```bash
   npm install
   ```  
   or  
   ```bash
   yarn install
   ```  
3. Start the application:  
   ```bash
   npm start
   ```  
   or  
   ```bash
   yarn start
   ```  

## Project Structure  
```
src/  
├── components/   # Reusable UI components  
├── screens/      # Application screens  
├── services/     # API services  
├── types/        # TypeScript definitions  
├── assets/       # Images, fonts, etc.  
└── utils/        # Helper functions  
```  

## Available Scripts  
- `npm start` – Starts the Expo development server.  
- `npm run android` – Runs the app on an Android device/emulator.  
- `npm run ios` – Runs the app on an iOS simulator.  
- `npm run web` – Runs the app in a web browser.  

## Testing  
The project is configured with Jest for unit testing. To run tests, execute:  
```bash
npx jest
```  

This version keeps the README **clean, structured, and professional** while ensuring all details are clearly explained. Let me know if you need any refinements.