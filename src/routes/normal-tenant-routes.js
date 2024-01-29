import React, { useEffect, useState, useContext } from 'react';
import { get } from 'lodash';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Spin, notification } from 'antd';

import GupshupTemplate from '../components/gupshup/template';
import SimulationPhase from '../components/simulation/simulation';
import POS from '../components/pos/pos';
import Layout from '../components/layout/layout';
import Login from '../components/authentication/login-container';
import ForgetPassword from '../components/authentication/forgot-password';
import GeneratePassword from '../components/authentication/generate-password';
import StoreDashboard from '../components/dashboard/new-dashboard';
import UserLayout from '../components/user-management/index';
import TenantManagement from '../components/tenant-management';
import DeliveryCharge from '../components/delivery/delivery';
import AddPOS from '../components/pos/add-pos';
import POSUsers from '../components/pos-users';
import Store from '../components/store/index';
import Customers from '../components/customers/customers';
import StoreForm from '../components/store/store-form';
import CustomerDetails from '../components/customers/customer-details';
import Orders from '../components/orders/orders';
import OrderDetails from '../components/orders/order-details';
import SearchEnquiries from '../components/search-enquiries/index';
import Product from '../components/products/index';
import ProductForm from '../components/products/product-form';
import ProductDetails from '../components/products/product-details';
import Settings from '../components/settings';
import StoreDetails from '../components/store/store-details';
import Coupons from '../components/coupons/coupons';
import InventoryManagement from '../components/inventory-mangement';
import UserProfileTab from '../components/user-profile';
import AssignProduct from '../components/inventory-mangement/assign-inventory';
import SubtractInventory from '../components/inventory-mangement/subtract-inventory';
import NotFoundPage from '../components/not-found';
import PageEditor from '../components/settings/documentations/page-editor';
import Reports from '../components/reports/index';
import ReportDetails from '../components/reports/general-report-details';
import syncDetails from '../components/products/sync/sync-details';
import Appearance from '../components/settings/appearance';
import ShipmentList from '../components/shiprocket-orders';
import PromoteMediaProducts from '../components/promote-on-social-media/index';
import SocialMediaPerformance from '../components/social-media-performance';
import Campaign from '../components/campaign/index';
import AppearanceTheme from '../components/settings/appearance-theme';
import WalletCharge from '../components/wallet/index';
import ZupainSelect from '../components/zupain-select';
import SubscriptionPlan from '../components/subscription-plan';
import CustomerEngagement from '../components/customer-engagement';
import OnboardGuide from '../components/dashboard/onboard-guide';
import WhatsApp from '../components/whatsapp/index';
import B2BSetup from '../components/b2b-setup/b2b-setup';
import ZupainSelectCustomer from '../components/zupain-select-customer';
import AnalyticsReport from '../components/google-analytics';
import ImageGallery from '../components/products/gallery';
import privacyPolicy from '../components/privacy-policy';
import Menu from '../components/products/menu-index';
import { RoleContext } from '../components/context/role-access-context';
import { getAllModulesRoles } from '../utils/api/url-helper';
import { FAILED_TO_LOAD } from '../shared/constant-values';
import ThemeBuilder from '../components/theme-builder';
import AppearanceDemo from '../components/settings/appearance-theme/appearance-demo';
import SocialLeads from '../components/social-leads';
import ProtectedRoute from './protected-route';
import Categories from '../components/categories/categories';

import validateTenantUid from '../shared/tenant-helper';
import PageBuilder from '../components/page-builder';
import GupshupPartnerList from '../components/gupshup';
import CreateGupshupTemplate from '../components/gupshup/create-template';
import GupshupMessage from '../components/gupshup/message';

function NormalTenantRoutes({ tenantBusinessName, backgroundImage }) {
  const [roleDetails] = useContext(RoleContext);
  const [loading, setLoading] = useState(true);
  const [roleData, setRoleData] = useState([]);
  const location = useLocation();
  const history = useNavigate();

  useEffect(() => {
    setLoading(true);
    getAllModulesRoles(roleDetails)
      .then((response) => {
        const data = get(response, 'data', []);
        setRoleData(data);
        setLoading(false);
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  }, [roleDetails]);

  useEffect(() => {
    if (
      location?.pathname !== '/forget-password' &&
      !location?.pathname.includes('GeneratePassword')
    ) {
      validateTenantUid(history);
    }
  }, [history]);

  return (
    <div>
      {loading ? (
        <div className="empty-container">
          <Spin spinning={loading} />
        </div>
      ) : (
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
          <Route path="simulation-phase" Component={SimulationPhase} />
          <Route path="GeneratePassword/:token" Component={GeneratePassword} />
          <Route element={<Layout />}>
            <Route path="theme-builder" Component={ThemeBuilder} />
            <Route path="user-profile" Component={UserProfileTab} />
            <Route path="privacy-policy" Component={privacyPolicy} />
            <Route path="social-leads" Component={SocialLeads} />
            <Route path="tenant-management" Component={TenantManagement} />
            <Route
              path="delivery-charge"
              element={
                <ProtectedRoute
                  roleData={roleData}
                  moduleName="Delivery Charge"
                  element={DeliveryCharge}
                />
              }
            />
            <Route
              path="coupons"
              element={
                <ProtectedRoute
                  roleData={roleData}
                  moduleName="Coupon"
                  element={Coupons}
                />
              }
            />
            <Route
              path="customer-engagement"
              element={
                <ProtectedRoute
                  roleData={roleData}
                  moduleName="Customer"
                  element={CustomerEngagement}
                />
              }
            />
            <Route
              path="zupain-select-customer"
              element={
                <ProtectedRoute
                  roleData={roleData}
                  moduleName="Customer"
                  element={ZupainSelectCustomer}
                />
              }
            />
            <Route
              path="zupain-select"
              element={
                <ProtectedRoute
                  roleData={roleData}
                  moduleName="Customer"
                  element={ZupainSelect}
                />
              }
            />
            <Route
              path="pos-users"
              element={
                <ProtectedRoute
                  roleData={roleData}
                  moduleName="Pos User"
                  element={POSUsers}
                />
              }
            />
            <Route
              path="categories"
              element={
                <ProtectedRoute
                  roleData={roleData}
                  moduleName="Category"
                  element={Categories}
                />
              }
            />
            <Route
              path="search-enquiries"
              element={
                <ProtectedRoute
                  roleData={roleData}
                  moduleName="Product Search"
                  element={SearchEnquiries}
                />
              }
            />
            <Route
              path="plan"
              element={
                <ProtectedRoute
                  roleData={roleData}
                  moduleName="Settings"
                  element={SubscriptionPlan}
                />
              }
            />
            <Route
              path="b2b-setup"
              element={
                <ProtectedRoute
                  roleData={roleData}
                  moduleName="Minimum Order Value"
                  element={B2BSetup}
                />
              }
            />
            <Route
              path="wallet"
              element={
                <ProtectedRoute
                  roleData={roleData}
                  moduleName="Settings"
                  element={WalletCharge}
                />
              }
            />
            <Route
              path="whatsapp"
              element={
                <ProtectedRoute
                  roleData={roleData}
                  moduleName="Settings"
                  element={WhatsApp}
                />
              }
            />
            <Route
              path="social-media-performance"
              element={
                <ProtectedRoute
                  roleData={roleData}
                  moduleName="Settings"
                  element={SocialMediaPerformance}
                />
              }
            />
            <Route
              path="promote-on-social-media"
              element={
                <ProtectedRoute
                  roleData={roleData}
                  moduleName="Settings"
                  element={PromoteMediaProducts}
                />
              }
            />
            <Route
              path="shiprocket/orders"
              element={
                <ProtectedRoute
                  roleData={roleData}
                  moduleName="Order"
                  element={ShipmentList}
                />
              }
            />
            <Route
              path="campaign"
              element={
                <ProtectedRoute
                  roleData={roleData}
                  moduleName="Settings"
                  element={Campaign}
                />
              }
            />
            <Route
              path="analytics"
              element={
                <ProtectedRoute
                  roleData={roleData}
                  moduleName="Settings"
                  element={AnalyticsReport}
                />
              }
            />
            <Route
              path="menu"
              element={
                <ProtectedRoute
                  roleData={roleData}
                  moduleName="Product"
                  element={Menu}
                />
              }
            />
            <Route
              path="gallery"
              element={
                <ProtectedRoute
                  roleData={roleData}
                  moduleName="Product"
                  element={ImageGallery}
                />
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute
                  roleData={roleData}
                  moduleName="User"
                  element={UserLayout}
                />
              }
            />

            <Route path="dashboard">
              <Route
                index
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Dashboard"
                    element={StoreDashboard}
                  />
                }
              />
              <Route path="onboard-guide" Component={OnboardGuide} />
            </Route>

            <Route path="orders">
              <Route
                index
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Order"
                    element={Orders}
                  />
                }
              />
              <Route
                path=":id"
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Order"
                    element={OrderDetails}
                  />
                }
              />
            </Route>

            <Route path="customers">
              <Route
                index
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Customer"
                    element={Customers}
                  />
                }
              />
              <Route
                path=":id"
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Customer"
                    element={CustomerDetails}
                  />
                }
              />
            </Route>

            <Route path="pos">
              <Route
                index
                Component={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Pos"
                    element={POS}
                  />
                }
              />
              <Route
                path="add-pos"
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Pos"
                    element={AddPOS}
                  />
                }
              />
              <Route
                path="edit-pos/:id"
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Pos"
                    element={AddPOS}
                  />
                }
              />
            </Route>

            <Route path="stores">
              <Route
                index
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Store"
                    element={Store}
                  />
                }
              />
              <Route
                path="add-store"
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Store"
                    element={StoreForm}
                  />
                }
              />
              <Route
                path="edit-store/:id"
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Store"
                    element={StoreForm}
                  />
                }
              />
              <Route
                path="store-details"
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Store"
                    element={StoreDetails}
                  />
                }
              />
            </Route>

            <Route path="inventory">
              <Route
                index
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Inventory"
                    element={InventoryManagement}
                  />
                }
              />
              <Route
                path=":id/add"
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Inventory"
                    element={AssignProduct}
                  />
                }
              />
              <Route
                path=":id/subtract"
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Inventory"
                    element={SubtractInventory}
                  />
                }
              />
            </Route>

            <Route path="reports">
              <Route
                index
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Reports"
                    element={Reports}
                  />
                }
              />
              <Route
                path="report-details"
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Reports"
                    element={ReportDetails}
                  />
                }
              />
            </Route>

            <Route path="appearance">
              <Route
                index
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Settings"
                    element={AppearanceTheme}
                  />
                }
              />
              <Route
                path=":id"
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Settings"
                    element={Appearance}
                  />
                }
              />
              <Route
                path=":id/demo"
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Settings"
                    element={AppearanceDemo}
                  />
                }
              />
            </Route>

            <Route path="page-builder">
              <Route
                index
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Settings"
                    element={PageBuilder}
                  />
                }
              />
              <Route
                path=":id"
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Settings"
                    element={PageBuilder}
                  />
                }
              />
              {/* <Route path=":id" element={<ProtectedRoute roleData={roleData} moduleName="Settings" element={Appearance} />} /> */}
              {/* <Route path=":id/demo" element={<ProtectedRoute roleData={roleData} moduleName="Settings" element={AppearanceDemo} />} /> */}
            </Route>

            <Route path="settings">
              <Route
                index
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Settings"
                    element={Settings}
                  />
                }
              />
              <Route
                path=":id"
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Settings"
                    element={PageEditor}
                  />
                }
              />
            </Route>

            <Route path="products">
              <Route
                index
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Product"
                    element={Product}
                  />
                }
              />
              <Route
                path="?list=table"
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Product"
                    element={Product}
                  />
                }
              />
              <Route
                path="?list=grid"
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Product"
                    element={Product}
                  />
                }
              />
              <Route
                path="add-product"
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Product"
                    element={ProductForm}
                  />
                }
              />
              <Route
                path="edit-product/:id"
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Product"
                    element={ProductForm}
                  />
                }
              />
              <Route
                path="product-details/:id"
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Product"
                    element={ProductDetails}
                  />
                }
              />
              <Route path="marketplace-sync" Component={syncDetails} />
            </Route>

            <Route path="gupshup">
              <Route
                index
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Settings"
                    element={GupshupPartnerList}
                  />
                }
              />
              <Route
                path=":appId/messages"
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Settings"
                    element={GupshupMessage}
                  />
                }
              />
              <Route
                path=":appId/template"
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Settings"
                    element={GupshupTemplate}
                  />
                }
              />
              <Route
                path=":appId/template/create"
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Settings"
                    element={CreateGupshupTemplate}
                  />
                }
              />
              <Route
                path=":appId/template/edit/:templateId"
                element={
                  <ProtectedRoute
                    roleData={roleData}
                    moduleName="Settings"
                    element={CreateGupshupTemplate}
                  />
                }
              />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      )}
    </div>
  );
}
export default NormalTenantRoutes;
