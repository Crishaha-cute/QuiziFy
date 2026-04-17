import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const RootComponent = () => {
  // Theme is now hardcoded to dark in index.html, so no state management is needed.
  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(<RootComponent />);