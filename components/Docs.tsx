import React from 'react';

const Docs: React.FC = () => {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', padding: '2rem', lineHeight: '1.6', color: '#333' }}>
      <h1 style={{ borderBottom: '2px solid #eaeaea', paddingBottom: '0.5rem' }}>Project Structure & API Mapping Guide</h1>
      
      <p>
        This document provides a high-level overview of the application's structure to assist front-end developers in mapping APIs and understanding the data flow.
        There are no navigation menus on this page by design.
      </p>

      <h2>1. Core Application Structure</h2>
      <ul>
        <li><strong><code>App.tsx</code>:</strong> The root application component containing routing logic. Currently handles mobile/desktop rendering variations based on viewport and user-agent.</li>
        <li><strong><code>DesktopApp.tsx</code> & <code>MobileApp.tsx</code>:</strong> The main layout wrappers for the desktop and mobile experiences respectively.</li>
        <li><strong><code>components/</code>:</strong> Contains all the React components (e.g., flight cards, booking views, conversational interfaces). UI functionality resides here.</li>
      </ul>

      <h2>2. Data Handling & Types</h2>
      <ul>
        <li><strong><code>types.ts</code>:</strong> Contains all Type definitions and interfaces (e.g., Flight, Hotel, Booking). <em>Ensure any new API responses match these types or update the types accordingly.</em></li>
        <li><strong><code>mockData.ts</code>:</strong> Contains static, fallback data currently used to mimic backend responses. This is what you'll be replacing when integrating real APIs.</li>
      </ul>

      <h2>3. API & Service Integration</h2>
      <ul>
        <li><strong><code>services/</code>:</strong> This directory should handle all external communications.</li>
        <li><strong><code>services/gemini.ts</code>:</strong> Currently handles interactions with AI/Gemini. </li>
        <li><strong><em>Action Item for API Mapping:</em></strong> Create a new file (e.g., <code>services/api.ts</code>) to centralize standard HTTP requests (GET/POST/PUT) using <code>fetch</code> or <code>axios</code>. Replace imports of <code>mockData</code> within components with calls to these new service functions.</li>
      </ul>

      <h2>4. Key Components to Update for API Data</h2>
      <p>When mapping APIs, you will likely need to update the state management (e.g., <code>useEffect</code> hooks or Redux/Zustand if implemented) within these specific components to fetch live data instead of static data:</p>
      <ul>
        <li><strong><code>FlightBookingView.tsx</code> / <code>MobileManualResults.tsx</code>:</strong> Replace flight search mock data.</li>
        <li><strong><code>HotelBookingView.tsx</code>:</strong> Replace hotel search mock data.</li>
        <li><strong><code>MyBookingsView.tsx</code> / <code>MobileBookings.tsx</code>:</strong> Fetch user's actual past and upcoming trips.</li>
        <li><strong><code>PaymentGateway.tsx</code>:</strong> Connect to the real payment processing endpoints.</li>
        <li><strong><code>ConversationalPlanner.tsx</code> / <code>AITripBuilder.tsx</code>:</strong> Ensure the AI inputs map correctly to standard booking endpoints once a real itinerary is formed.</li>
      </ul>

      <p style={{ marginTop: '3rem', fontSize: '0.9rem', color: '#666', borderTop: '1px solid #eaeaea', paddingTop: '1rem' }}>
        For further questions or deeper architectural changes, refer back to the project repository documentation.
      </p>
    </div>
  );
};

export default Docs;
