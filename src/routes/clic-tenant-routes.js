import React, { useEffect } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import validateTenantUid from '../shared/tenant-helper';
import Login from '../components/authentication/login-container';
import ForgetPassword from '../components/authentication/forgot-password';
import GeneratePassword from '../components/authentication/generate-password';
import Product from '../components/clic/product/index';
import Settings from '../components/settings/index';
import NotFoundPage from '../components/not-found';
import Appearance from '../components/settings/appearance';
import AppearanceTheme from '../components/settings/appearance-theme';
import AppearanceDemo from '../components/settings/appearance-theme/appearance-demo';
import WalletCharge from '../components/wallet/index';
import SubscriptionPlan from '../components/subscription-plan';
import WhatsApp from '../components/whatsapp/index';
import AddProduct from '../components/clic/product/add-product';
import AddBookingSlot from '../components/settings/delivery-slot';
import ClicPageEditor from '../components/settings/documentations/page-editor';
import ClicLayout from '../components/clic/layout';
import SocialLeads from '../components/social-leads';
import ClicDashboard from '../components/clic/dashboard';
import Bookings from '../components/clic/booking';
import EnquiryLeads from '../components/clic/enquiry';
import PageBuilder from '../components/page-builder';
import CreateGupshupTemplate from '../components/gupshup/create-template';
import GupshupTemplate from '../components/gupshup/template';
import GupshupPartnerList from '../components/gupshup';
import GupshupMessage from '../components/gupshup/message';

function ClicTenantRoutes({ tenantBusinessName, backgroundImage }) {
  const location = useLocation();
  const history = useNavigate();
  useEffect(() => {
    if (
      location?.pathname !== '/forget-password' &&
      !location?.pathname.includes('GeneratePassword')
    ) {
      validateTenantUid(history);
    }
  }, [history]);
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Login
            tenantName={tenantBusinessName}
            tenantBgImage={backgroundImage}
          />
        }
      />
      <Route path="forget-password" Component={ForgetPassword} />
      <Route path="GeneratePassword/:token" Component={GeneratePassword} />

      <Route element={<ClicLayout />}>
        <Route path="dashboard" Component={ClicDashboard} />
        <Route path="plan" Component={SubscriptionPlan} />
        <Route path="wallet" Component={WalletCharge} />
        <Route path="whatsapp" Component={WhatsApp} />
        <Route path="social-leads" Component={SocialLeads} />
        <Route path="enquiry-leads" Component={EnquiryLeads} />

        <Route path="bookings">
          <Route index Component={Bookings} />
          <Route path="slots" Component={AddBookingSlot} />
        </Route>

        <Route path="appearance">
          <Route index Component={AppearanceTheme} />
          <Route path=":id" Component={Appearance} />
          <Route path=":id/demo" Component={AppearanceDemo} />
        </Route>

        <Route path="page-builder">
          <Route index Component={PageBuilder} />
          <Route path=":id" Component={PageBuilder} />
        </Route>

        <Route path="Settings">
          <Route index Component={Settings} />
          <Route path=":id" Component={ClicPageEditor} />
        </Route>

        <Route path="products">
          <Route index Component={Product} />
          <Route path="add-product" Component={AddProduct} />
          <Route path="edit-product/:id" Component={AddProduct} />
        </Route>

        <Route path="gupshup">
          <Route index Component={GupshupPartnerList} />
          <Route path=":appId/messages" Component={GupshupMessage} />
          <Route path=":appId/template" Component={GupshupTemplate} />
          <Route
            path=":appId/template/create"
            Component={CreateGupshupTemplate}
          />
          <Route
            path=":appId/template/edit/:templateId"
            Component={CreateGupshupTemplate}
          />
        </Route>

        <Route path="*" Component={NotFoundPage} />
      </Route>
    </Routes>
  );
}
export default ClicTenantRoutes;
