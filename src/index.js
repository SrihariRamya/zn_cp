import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { WalletProvider } from './components/context/wallet-context';
import { MilestoneProvider } from './components/context/milestone-context';
import withClearCache from './clear-cache';
import AppRoutes from './app-routes';
import * as serviceWorker from './serviceWorker';
import { TenantProvider } from './components/context/tenant-context';
import { RoleProvider } from './components/context/role-access-context';
import App from './app';
import { AppearanceProvider } from './components/context/appearance-context';
import { StoreProvider } from './components/context/store-form-context';

const container = document.querySelector('#root');
const root = createRoot(container);
const ClearCacheComponent = withClearCache(AppRoutes);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <TenantProvider>
        <MilestoneProvider>
          <AppearanceProvider>
            <RoleProvider>
              <StoreProvider>
                <WalletProvider>
                  <App />
                  <ClearCacheComponent />
                </WalletProvider>
              </StoreProvider>
            </RoleProvider>
          </AppearanceProvider>
        </MilestoneProvider>
      </TenantProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
