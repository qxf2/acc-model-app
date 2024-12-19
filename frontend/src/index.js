import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from '@mui/material/styles';
import reportWebVitals from './reportWebVitals';
import theme from './theme';
import { asyncWithLDProvider } from 'launchdarkly-react-client-sdk';

(async () => {
  try {
    const LDProvider = await asyncWithLDProvider({
      clientSideID: '6759493de54a3e097ee75b00',
      context: {
        kind: 'user',
        key: 'example-user-key',
        name: 'Sravanti',
      },
    });

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <LDProvider>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </LDProvider>
    </React.StrictMode>
  );
  } catch (error) {
    console.error("Failed to initialize LaunchDarkly:", error);
  }
})();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();