import { http } from '@kaaylabs/kaaylabs-http-package';
import { serialize } from 'object-to-formdata';
import axios from 'axios';
import { getApiUrl } from './environment';

const baseUrl = getApiUrl();
const token = () => localStorage.getItem('token');

// user URLS
export const getUser = (parameters) => http.get(`${baseUrl}/user/`, parameters);
export const getCustomer = (parameters) =>
  http.get(`${baseUrl}/user/get-customer/`, parameters);
export const getFilterCustomer = (parameters) =>
  http.get(`${baseUrl}/user/filter-customer/`, parameters);
export const getCustomerType = (parameters) =>
  http.get(`${baseUrl}/user/get-customer-type/`, parameters);
export const getCustomerContactForm = (parameters) =>
  http.get(`${baseUrl}/user/get-customer-enquiry/`, parameters);
export const createOrUpdateContactForm = (object) =>
  http.post(`${baseUrl}/user/create-or-update-customer-enquiry`, object);
export const getCurrentUser = (userID) =>
  http.get(`${baseUrl}/user/get-user/`, userID);
export const userVerification = (parameters) =>
  http.get(`${baseUrl}/user/user-verification`, parameters);
export const deleteUser = (userID) => http.del(`${baseUrl}/user/${userID}`);
export const createUser = (details) => http.post(`${baseUrl}/user/`, details);
export const editUser = (parameters, userID) =>
  http.put(`${baseUrl}/user/${userID}`, parameters);
export const userAuthenticate = (parameters) =>
  http.post(`${baseUrl}/user/login`, parameters);
export const getRole = () => http.get(`${baseUrl}/role`);
export const updateUserPassword = (object, files, userID) =>
  http.handleMultipart(
    `${baseUrl}/user/update-password/${userID}/`,
    object,
    files,
    'PUT'
  );

// Create delivery charge
export const getDelivery = (parameters) =>
  http.get(`${baseUrl}/delivery_charge`, parameters);
export const createDeliveryCharge = (parameters) =>
  http.post(`${baseUrl}/delivery_charge`, parameters);
export const deleteDeliveryCharge = (userID) =>
  http.del(`${baseUrl}/delivery_charge/${userID}`);
export const createDeliveryChargeCriteria = (parameters) =>
  http.post(`${baseUrl}/delivery_charge_criteria`, parameters);
export const createDeliveryChargeLocation = (parameters) =>
  http.post(`${baseUrl}/delivery_charge_criteria/location`, parameters);
export const createDeliveryChargeCart = (parameters) =>
  http.post(`${baseUrl}/delivery_charge_criteria/saveByCartPrice`, parameters);
export const updateDeliveryChargeLocation = (parameters) =>
  http.put(`${baseUrl}/delivery_charge_criteria`, parameters);
export const updateDeliveryChargeCart = (parameters) =>
  http.put(`${baseUrl}/delivery_charge_criteria/updateByCartPrice`, parameters);
export const getAllDelivery = (parameters) =>
  http.get(`${baseUrl}/delivery_charge_criteria/getAll`, parameters);
export const getAllDeliveryByCart = (parameters) =>
  http.get(`${baseUrl}/delivery_charge_criteria/getByCartPrice`, parameters);
export const deleteDeliveryByCriteria = (criteriaId) =>
  http.del(`${baseUrl}/delivery_charge_criteria/${criteriaId}`);
export const updateMinimumOrderValue = (parameters) =>
  http.put(`${baseUrl}/minimum_order_value`, parameters);
export const getMinimumOrderValue = (parameters) =>
  http.get(`${baseUrl}/minimum_order_value`, parameters);
export const deleteDeliveryByCart = (criteriaId) =>
  http.del(
    `${baseUrl}/delivery_charge_criteria/deleteByCartPrice/${criteriaId}`
  );
export const getAllDeliveryChargeByWeight = (parameters) =>
  http.get(`${baseUrl}/delivery_charge_criteria/getByWeight`, parameters);
export const createDeliveryChargeByWeight = (parameters) =>
  http.post(`${baseUrl}/delivery_charge_criteria/createByWeight`, parameters);
export const deleteDeliveryChargeByWeight = (criteriaId) =>
  http.del(`${baseUrl}/delivery_charge_criteria/deleteByWeight/${criteriaId}`);
export const updateDeliveryChargeWeight = (parameters) =>
  http.put(`${baseUrl}/delivery_charge_criteria/updateByWeight`, parameters);
// Market Place
export const getMarketProductSync = (parameters) =>
  http.get(`${baseUrl}/marketPlace/sync-get`, parameters);
export const getMarketPlace = (parameters) =>
  http.get(`${baseUrl}/marketPlace/get-market-place`, parameters);
export const addProductToMarket = (parameters) =>
  http.post(`${baseUrl}/marketPlace/add-product-market-place`, parameters);
export const addStoreToMarketPlace = (parameter) =>
  http.post(`${baseUrl}/marketPlace/add-store-market-place`, parameter);
export const updateMarketSync = (parameter) =>
  http.put(`${baseUrl}/marketPlace/sync-update`, parameter);
export const syncMoveTo = (parameter) =>
  http.put(`${baseUrl}/marketPlace/sync-move`, parameter);
export const activeMarketPlace = (parameter) =>
  http.put(`${baseUrl}/marketPlace/active`, parameter);

// customers
export const getCustomersLocation = () =>
  http.get(`${baseUrl}/user/customer-location`);
export const getOrderByCustomer = (parameters) =>
  http.get(`${baseUrl}/order`, parameters);
export const getOrderDetail = (parameter) =>
  http.get(`${baseUrl}/order-detail`, parameter);
export const getOrdersByDate = (parameters, id) =>
  http.get(`${baseUrl}/order-detail/${id}`, parameters);
export const getCategory = (parameters) =>
  http.get(`${baseUrl}/category/getCategory`, parameters);
export const getCategoryAndSubcategory = (parameters) =>
  http.get(`${baseUrl}/category/get-category-subcategory-list`, parameters);
export const getCategoryData = (parameters) =>
  http.get(`${baseUrl}/category/get-category-list`, parameters);
export const getAllAttributes = (parameters) =>
  http.get(`${baseUrl}/attribute`, parameters);
export const getDataTypes = (parameters) =>
  http.get(`${baseUrl}/attribute/data-type`, parameters);
export const createAttribute = (parameters) =>
  http.post(`${baseUrl}/attribute`, parameters);
export const deleteAttribute = (parameters) =>
  http.del(`${baseUrl}/attribute`, {}, parameters);
export const getOrderCustomerDate = (parameters) =>
  http.get(`${baseUrl}/order/get-order-customer-date`, parameters);
// export const createCategory = (object, files) =>
//   http.handleMultipart(`${baseUrl}/category/`, object, files, 'POST');

export const createCategory = (object, files) => {
  const formData = serialize({ ...object, ...files });
  return axios({
    method: 'POST',
    url: `${baseUrl}/category/`,
    data: formData,
    headers: {
      // eslint-disable-next-line no-template-curly-in-string
      'Content-Type': 'multipart/form-data; boundary=${form._boundary}',
      Authorization: `Bearer ${token()}`,
    },
  });
};

export const createSubCategory = (object, files) => {
  const formData = serialize({ ...object, ...files });
  return axios({
    method: 'POST',
    url: `${baseUrl}/category/subcategory/`,
    data: formData,
    headers: {
      // eslint-disable-next-line no-template-curly-in-string
      'Content-Type': 'multipart/form-data; boundary=${form._boundary}',
      Authorization: `Bearer ${token()}`,
    },
  });
};

export const deleteCategory = (parameters) =>
  http.del(`${baseUrl}/category`, {}, parameters);
export const getCategoryList = () => http.get(`/category/list`);
export const getSubCategoryDetails = (categoryUid) =>
  http.get(`${baseUrl}/category/getSubCategory/${categoryUid}`);

export const editCategory = (object, files, userID) => {
  const formData = serialize({ ...object, ...files });
  return axios({
    method: 'PUT',
    url: `${baseUrl}/category/${userID}`,
    data: formData,
    headers: {
      // eslint-disable-next-line no-template-curly-in-string
      'Content-Type': 'multipart/form-data; boundary=${form._boundary}',
      Authorization: `Bearer ${token()}`,
    },
  });
};

export const updateStatus = (id, parameters) =>
  http.put(`${baseUrl}/category/update-status/${id}`, parameters);

export const updateCategoryProduct = (id, parameters) =>
  http.put(`${baseUrl}/category/update-product/${id}`, parameters);

export const editSubCategory = (parameters, userID) =>
  http.put(`${baseUrl}/category/subcategory/${userID}`, parameters);

// tenant functions
export const getTenant = () => http.get(`${baseUrl}/tenant`);
export const createTenant = (parameters) =>
  http.post(`${baseUrl}/tenant`, parameters);
export const editTenant = (parameters, tenantID) =>
  http.put(`${baseUrl}/tenant/${tenantID}`, parameters);
// Pos functions
export const getPOS = (parameters) => http.get(`${baseUrl}/pos`, parameters);
export const getPOSLocation = () => http.get(`${baseUrl}/pos/location`);
export const getPOSUsers = () => http.get(`${baseUrl}/pos-user`);
export const getPOSID = (id) => http.get(`${baseUrl}/pos/${id}`);
export const addPOS = (parameters) => http.post(`${baseUrl}/pos`, parameters);
export const deletePOS = (userID) => http.del(`${baseUrl}/pos/${userID}`);
export const editPOS = (parameters, userID) =>
  http.put(`${baseUrl}/pos/${userID}`, parameters);
export const addPOSUser = (parameters) =>
  http.post(`${baseUrl}/pos-user`, parameters);
export const editPOSUser = (parameters, userID) =>
  http.put(`${baseUrl}/pos-user/${userID}`, parameters);
export const deletePOSUser = (userID) =>
  http.del(`${baseUrl}/pos-user/${userID}`);
// store
export const getStore = (parameter) => http.get(`${baseUrl}/store`, parameter);
export const getOneStore = (parameters) =>
  http.get(`${baseUrl}/store/get-store`, parameters);
export const getStoreByLocation = () => http.get(`${baseUrl}/store/location`);
export const createStore = (object, files) =>
  http.handleMultipart(`${baseUrl}/store/add-store/`, object, files, 'POST');
export const editStore = (object, files, id) =>
  http.handleMultipart(`${baseUrl}/store/${id}/`, object, files, 'PUT');
export const deleteStore = (id, body) =>
  http.del(`${baseUrl}/store/${id}`, body);
export const getStorePOS = (parameters) =>
  http.get(`${baseUrl}/store/storePOS`, parameters);
export const getCentralStoreDetail = () =>
  http.get(`${baseUrl}/store/central-store`);
export const getStoreStatus = () => http.get(`${baseUrl}/store/store-status`);
export const editStoreStatus = (parameters, id) =>
  http.put(`${baseUrl}/store/store-status/${id}/`, parameters);
export const setOneStoreStatus = (uid, parameters) =>
  http.put(`${baseUrl}/store/set-one-store-status/${uid}/`, parameters);
// search enquiries
export const getSearchEnquiries = (parameters) =>
  http.get(`${baseUrl}/product_search`, parameters);
export const deleteSearchEnquiries = (parameters) =>
  http.del(`${baseUrl}/product_search/delete-products`, '', parameters);
export const getSearchEnquiriesByDate = (parameters) =>
  http.get(`${baseUrl}/product_search/date`, parameters);
export const getSearchByLocation = () =>
  http.get(`${baseUrl}/product_search/location`);
// Settings - Profile
export const createOrUpdateProfile = (object, files) =>
  http.handleMultipart(
    `${baseUrl}/settings/update-or-create`,
    object,
    files,
    'POST'
  );
export const editGridListStatus = (parameter) =>
  http.put(`${baseUrl}/settings/edit-grid-list`, parameter);
export const updateSocialStatus = (parameter) =>
  http.put(`${baseUrl}/settings/social-status-update`, parameter);
export const getState = () => http.get(`${baseUrl}/state`);
export const getDistrict = (id) =>
  http.get(`${baseUrl}/state/get-district/${id}`);
export const getSubDistrict = (id) =>
  http.get(`${baseUrl}/state/get-subdistrict/${id}`);
export const getLocality = (id) =>
  http.get(`${baseUrl}/state/get-locality/${id}`);
export const getPincodeDetail = (id) =>
  http.get(`${baseUrl}/state/pincode/${id}`);

export const getDate = () => http.get(`${baseUrl}/date-format`);

// banner
export const getBanners = (parameters) =>
  http.get(`${baseUrl}/banners`, parameters);
export const createBanner = (object, files) =>
  http.handleMultipart(`${baseUrl}/banners/add-banner/`, object, files, 'POST');
export const editBanner = (object, files, id) =>
  http.handleMultipart(`${baseUrl}/banners/${id}/`, object, files, 'PUT');
export const deleteBanner = (id, parameters) =>
  http.del(`${baseUrl}/banners/${id}`, parameters);
export const sortBanners = (parameters) =>
  http.post(`${baseUrl}/banners`, parameters);
export const getcategoryProducts = () =>
  http.get(`${baseUrl}/banners/get-mapped-product`);

// products
export const getProducts = (parameters) =>
  http.get(`${baseUrl}/product`, parameters);
export const getProductOrders = (parameters) =>
  http.get(`${baseUrl}/product/product-orders`, parameters);
export const getProductOrderDate = (parameters) =>
  http.get(`${baseUrl}/product/product-order-date`, parameters);
export const getTopProduct = (parameters) =>
  http.get(`${baseUrl}/product/get-top-product`, parameters);
export const getUserOrders = (parameters) =>
  http.get(`${baseUrl}/product/user-orders`, parameters);
export const createProduct = (object, files) => {
  const formData = serialize({ ...object, ...files });
  return axios({
    method: 'POST',
    url: `${baseUrl}/product/add`,
    data: formData,
    headers: {
      // eslint-disable-next-line no-template-curly-in-string
      'Content-Type': 'multipart/form-data; boundary=${form._boundary}',
      Authorization: `Bearer ${token()}`,
    },
  });
};
export const getBulkDownload = () => {
  return axios({
    method: 'get',
    url: `${baseUrl}/product/bulk-download`,
    responseType: 'blob',
    headers: {
      // eslint-disable-next-line no-template-curly-in-string
      'Content-Type': 'multipart/form-data; boundary=${form._boundary}',
      Authorization: `Bearer ${token()}`,
    },
  });
};

export const BulkUploadData = (object, files) => {
  const formData = serialize({ ...object, ...files });
  return axios({
    method: 'POST',
    url: `${baseUrl}/product/bulk-upload`,
    data: formData,
    headers: {
      // eslint-disable-next-line no-template-curly-in-string
      'Content-Type': 'multipart/form-data; boundary=${form._boundary}',
      Authorization: `Bearer ${token()}`,
    },
  });
};

export const getCustomerDownload = () => {
  return axios({
    method: 'get',
    url: `${baseUrl}/user/customer-download`,
    responseType: 'blob',
    headers: {
      // eslint-disable-next-line no-template-curly-in-string
      'Content-Type': 'multipart/form-data; boundary=${form._boundary}',
      Authorization: `Bearer ${token()}`,
    },
  });
};

export const bulkCustomersUpload = (object, files) => {
  const formData = serialize({ ...object, ...files });
  return axios({
    method: 'POST',
    url: `${baseUrl}/user/customer-upload`,
    data: formData,
    headers: {
      // eslint-disable-next-line no-template-curly-in-string
      'Content-Type': 'multipart/form-data; boundary=${form._boundary}',
      Authorization: `Bearer ${token()}`,
    },
  });
};

export const updateProduct = (data, files, id) => {
  const formData = serialize({ ...data, ...files });
  return axios({
    method: 'PUT',
    url: `${baseUrl}/product/update/${id}`,
    data: formData,
    headers: {
      // eslint-disable-next-line no-template-curly-in-string
      'Content-Type': 'multipart/form-data; boundary=${form._boundary}',
      Authorization: `Bearer ${token()}`,
    },
  });
};

export const fetchAllProducts = (parameter) =>
  http.get(`${baseUrl}/product/get-products`, parameter);
export const fetchProductList = (parameter) =>
  http.get(`${baseUrl}/product/all-products`, parameter);

export const updateVariants = (parameter) =>
  http.put(`${baseUrl}/product/variants-update`, parameter);
export const deleteProduct = (parameter) =>
  http.del(`${baseUrl}/product/delete/`, '', parameter);
export const getAllOrder = (id, parameter) =>
  http.get(`${baseUrl}/order/get-all/${id}`, parameter);
export const getAllOrderKanban = (id, parameter) =>
  http.get(`${baseUrl}/order/get-all-kanban/${id}`, parameter);
export const getOrder = (id) => http.get(`${baseUrl}/order/get/${id}`);
export const getOrderByAdmin = (parameter) =>
  http.get(`${baseUrl}/order/get-order-admin`, parameter);
export const getOrderCount = (parameter) =>
  http.get(`${baseUrl}/order/get-order-count`, parameter);
export const getOrderDate = (parameter) =>
  http.get(`${baseUrl}/order/get-order-date`, parameter);
export const getAllOrderDetails = (parameter) =>
  http.get(`${baseUrl}/order/get-all-order-details`, parameter);
export const getAllOrderCount = (parameter) =>
  http.get(`${baseUrl}/order/get-all-order-count`, parameter);
export const customerPdf = (id) => {
  return axios({
    method: 'get',
    url: `${baseUrl}/order/customer/${id}`,
    data: id,
    responseType: 'blob',
    headers: {
      // eslint-disable-next-line no-template-curly-in-string
      'Content-Type': 'multipart/form-data; boundary=${form._boundary}',
      Authorization: `Bearer ${token()}`,
    },
  });
};
export const singleOrderPdfDownload = (id) => {
  return axios({
    method: 'get',
    url: `${baseUrl}/order/single-order/${id}`,
    data: id,
    responseType: 'blob',
    headers: {
      // eslint-disable-next-line no-template-curly-in-string
      'Content-Type': 'multipart/form-data; boundary=${form._boundary}',
      Authorization: `Bearer ${token()}`,
    },
  });
};
export const multipleOrderPdfDownload = (orderIDS) => {
  return axios(`${baseUrl}/order/multiple-order`, {
    method: 'post',
    data: JSON.stringify({ orderIDS }),
    responseType: 'blob',
    headers: {
      // eslint-disable-next-line no-template-curly-in-string
      'Content-type': 'application/json; charset=UTF-8',
      Authorization: `Bearer ${token()}`,
    },
  });
};
export const getOrderConfirmation = (id, appType) =>
  http.get(`${baseUrl}/order/get-all-confirmation/${id}/${appType}`);
export const getFilterOrder = (id) =>
  http.get(`${baseUrl}/order/filter-order/${id}`);
export const editStatus = (parameter, id) =>
  http.put(`${baseUrl}/order/edit-status/${id}`, parameter);
export const getMilestone = () => http.get(`${baseUrl}/order/get-milestone`);
export const editCancelRequest = (parameters, id) =>
  http.post(`${baseUrl}/order/cancel/${id}`, parameters);

export const sendPass = (parameters) =>
  http.post(`${baseUrl}/user/forgetpassword`, parameters);
export const resetPass = (parameters) =>
  http.put(`${baseUrl}/user/reset/Password`, parameters);

export const getAllUnits = () => http.get(`${baseUrl}/product/get-all-units`);

// Coupon API
export const createCoupon = (object, files) => {
  const formData = serialize({ ...object, ...files });
  return axios({
    method: 'POST',
    url: `${baseUrl}/coupon`,
    data: formData,
    headers: {
      // eslint-disable-next-line no-template-curly-in-string
      'Content-Type': 'multipart/form-data; boundary=${form._boundary}',
      Authorization: `Bearer ${token()}`,
    },
  });
};
export const getExistingCouponProducts = (parameter) =>
  http.get(`${baseUrl}/coupon/get-existing-products`, parameter);
export const updateCoupon = (object, files, id) =>
  http.handleMultipart(`${baseUrl}/coupon/${id}/`, object, files, 'PUT');
export const getAllCoupons = (parameter) =>
  http.get(`${baseUrl}/coupon/get-all`, parameter);
export const deleteCoupon = (id, body) =>
  http.del(`${baseUrl}/coupon/${id}`, body);
export const updateCouponStatus = (id, parameters) =>
  http.put(`${baseUrl}/coupon/update-coupon-status/${id}`, parameters);

export const getAllProductList = (parameter) =>
  http.get(`${baseUrl}/coupon/get-all-products`, parameter);

// tenant_document API
export const getAllDocuments = (parameters) =>
  http.get(`${baseUrl}/document/get-all`, parameters);
export const updateDocument = (parameters, files, id) =>
  http.handleMultipart(`${baseUrl}/document/${id}/`, parameters, files, 'PUT');
export const getDocumentByID = (id) => http.get(`${baseUrl}/document/${id}`);
export const uploadFile = (file) =>
  http.handleMultipart(`${baseUrl}/document/upload`, {}, file, 'POST');
export const createDocument = (parameters) =>
  http.post(`${baseUrl}/document`, parameters);
export const deleteDocument = (id) => http.del(`${baseUrl}/document/${id}`);
export const updateDocumentStatus = (id, parameters) =>
  http.put(`${baseUrl}/document/update-document-status/${id}`, parameters);

// Location API
export const getDistrictByStateID = (parameters) =>
  http.get(`${baseUrl}/state/district`, parameters);

export const getDeliveryLocation = () =>
  http.get(`${baseUrl}/state/delivery-location`);
export const getSubDistrictByDistrictID = (parameters) =>
  http.post(`${baseUrl}/state/sub-district`, parameters);
export const createDeliveryLocation = (parameters) =>
  http.post(`${baseUrl}/state/add-delivery-location`, parameters);
export const deleteDeliveryLocation = (parameters) =>
  http.put(`${baseUrl}/state/delete-delivery-location`, parameters);

// Bag API
export const getBagCount = (parameter) =>
  http.get(`${baseUrl}/bag/get-bag-count`, parameter);

// Related Products API
export const getAllRelatedProducts = (uid, parameters) =>
  http.get(`${baseUrl}/related/get-all-related-products/${uid}`, parameters);
export const deleteRelatedProducts = (id) =>
  http.del(`${baseUrl}/related/related-products/${id}`);
export const createRelatedProducts = (parameters) =>
  http.post(`${baseUrl}/related/related-products/bulk`, parameters);

// Role Access API
export const getAllRoles = (parameter) =>
  http.get(`${baseUrl}/user/get-all-roles`, parameter);
export const createOrUpdateRoleAccess = (parameters) =>
  http.post(`${baseUrl}/user/add-role-access`, parameters);
export const getAllModulesRoles = (parameters) =>
  http.get(`${baseUrl}/user/get-all-modules-roles`, parameters);
export const getSearchDetails = (parameter) =>
  http.get(`${baseUrl}/state/search-state`, parameter);

// deliveryslot API
export const getAllDeliverySlots = () =>
  http.get(`${baseUrl}/settings/delivery-slots`);

export const createOrUpdateDeliverySlot = (parameters) =>
  http.post(`${baseUrl}/settings/add-delivery-slot`, parameters);

export const assignInventory = (parameters) =>
  http.post(`${baseUrl}/inventory`, parameters);

export const addStoreDetailInOrders = (parameters) =>
  http.put(`${baseUrl}/order/update-order-detail`, parameters);

export const getInventoryStoresDetail = (parameter) =>
  http.get(`${baseUrl}/inventory/get-stores`, parameter);

export const addInpackingOrder = (parameters) =>
  http.post(`${baseUrl}/inventory/add-order`, parameters);

export const getStoresByProduct = (parameters) =>
  http.get(`${baseUrl}/inventory/get-product-stores`, parameters);

export const getInventoryDetails = (parameters) =>
  http.get(`${baseUrl}/inventory/get-details`, parameters);

// Footers
export const getAllfooterDetails = () => http.get(`${baseUrl}/settings/footer`);
export const createOrUpdateFooter = (parameters) =>
  http.post(`${baseUrl}/settings/add-footer`, parameters);
export const getSocialMedias = (parameters) =>
  http.get(`${baseUrl}/settings/social-media/get-all-social-media`, parameters);
export const deleteSocialMeadia = (parameter) =>
  http.del(`${baseUrl}/settings/social-media/delete-social-media`, parameter);

export const updateSocialMediaStatus = (id, parameters) =>
  http.put(
    `${baseUrl}/settings/social-media/update-social-status/${id}`,
    parameters
  );

export const createCustomMedia = (object, files) => {
  const formData = serialize({ ...object, ...files });
  return axios({
    method: 'POST',
    url: `${baseUrl}/settings/social-media/create-custom-media/`,
    data: formData,
    headers: {
      // eslint-disable-next-line no-template-curly-in-string
      'Content-Type': 'multipart/form-data; boundary=${form._boundary}',
      Authorization: `Bearer ${token()}`,
    },
  });
};
export const createOrUpdateStoreProduct = (parameters) =>
  http.put(`${baseUrl}/inventory/add-store-product`, parameters);

export const getOrdersByStore = (id, parameters) =>
  http.get(`${baseUrl}/order/order-by-store/${id}`, parameters);

// Reports

export const getAllReports = () => http.get(`${baseUrl}/reports`);
export const getOneReports = (parameters) =>
  http.get(`${baseUrl}/reports/report-details`, parameters);
export const createCustomReport = (parameters) =>
  http.put(`${baseUrl}/reports/create-custom-report`, parameters);
export const getAllCustomReports = () =>
  http.get(`${baseUrl}/reports/custom-report-details`);
export const deleteCustomReport = (id) =>
  http.del(`${baseUrl}/reports/custom-report-delete/${id}`);
export const updateCustomReport = (parameters) =>
  http.put(`${baseUrl}/reports/update-custom-report`, parameters);
export const downloadReport = (parameters) =>
  http.downloadDocument(`${baseUrl}/reports/download-report`, parameters);

// Best Seller
export const getBestSeller = () =>
  http.get(`${baseUrl}/settings/get-best-seller`);
export const createBestSeller = (parameters) =>
  http.post(`${baseUrl}/settings/add-best-seller`, parameters);
export const deleteBestSeller = (parameter) =>
  http.del(`${baseUrl}/settings/delete-best-seller/`, '', parameter);
export const getbestsellerProducts = (parameter) =>
  http.get(`${baseUrl}/settings/get-non-mapped-product/`, parameter);

// token generate
export const getCampaignToken = (parameters) =>
  http.post(`${baseUrl}/user/campaign-token`, parameters);

// SliderBox
export const CreateSliderBoxRow = (parameter) =>
  http.post(`${baseUrl}/settings/slider-box`, parameter);
export const updateSliderBox = (id, body) =>
  http.put(`${baseUrl}/settings/slider-box/${id}`, body);
export const CreateSliderBoxProduct = (parameters) =>
  http.post(`${baseUrl}/settings/slider-box-product`, parameters);
export const getSliderBox = (parameter) =>
  http.get(`${baseUrl}/settings/slider-box`, parameter);
export const deleteSliderBox = (id) =>
  http.del(`${baseUrl}/settings/slider-box/${id}`);
export const deleteSliderBoxProduct = (parameter) =>
  http.del(`${baseUrl}/settings/slider-box-product`, '', parameter);
export const getNonMappedSliderProducts = (parameter) =>
  http.get(`${baseUrl}/settings/slider-box/non-mapped-product/`, parameter);

// payment methods API

export const getAllPaymentMethods = () =>
  http.get(`${baseUrl}/order/get-payment-methods`);

export const updatePaymentMethod = (id, parameters) =>
  http.put(`${baseUrl}/order/update/payment/${id}`, parameters);

// Theme
export const getColor = () => http.get(`${baseUrl}/custom-theme`);
export const editColor = (parameter) =>
  http.put(`${baseUrl}/custom-theme/edit-color`, parameter);
export const createLane = (parameter) =>
  http.post(`${baseUrl}/settings/create-lane`, parameter);
export const updateLanePosition = (parameter) =>
  http.put(`${baseUrl}/settings/update-lane-position`, parameter);
export const getLanes = (parameter) =>
  http.get(`${baseUrl}/settings/get-lanes`, parameter);
export const deleteLane = (parameter) =>
  http.post(`${baseUrl}/settings/delete-lane`, parameter);

export const createSection = (parameter) =>
  http.post(`${baseUrl}/settings/create-section`, parameter);
export const updateSection = (parameter) =>
  http.put(`${baseUrl}/settings/update-section`, parameter);
export const getSections = (parameter) =>
  http.get(`${baseUrl}/settings/get-sections`, parameter);
export const getAllSections = (parameter) =>
  http.get(`${baseUrl}/settings/all-sections`, parameter);
export const deleteSection = (parameter) =>
  http.del(`${baseUrl}/settings/delete-section`, '', parameter);

export const createSectionColumn = (parameter) =>
  http.post(`${baseUrl}/settings/create-section-column`, parameter);
export const deleteSectionColumn = (parameter) =>
  http.del(`${baseUrl}/settings/delete-section-column`, '', parameter);

export const createOrUpdateAppearance = (object, files) => {
  const formFile = serialize({ ...files });
  const formData = serialize({ ...object }, { indices: true }, formFile);
  return axios({
    method: 'POST',
    url: `${baseUrl}/settings/appearance`,
    data: formData,
    headers: {
      // eslint-disable-next-line no-template-curly-in-string
      'Content-Type': 'multipart/form-data; boundary=${form._boundary}',
      Authorization: `Bearer ${token()}`,
    },
  });
};
export const getAppearance = (parameter) =>
  http.get(`${baseUrl}/settings/appearance`, parameter);

export const getAppearanceWidget = (parameter) =>
  http.get(`${baseUrl}/settings/get-appearance-widget`, parameter);

export const getAppearanceAttributeFontSize = (parameter) =>
  http.get(`${baseUrl}/settings/appearance/attribute/font-size`, parameter);
export const getAppearanceAttributeFontFamily = (parameter) =>
  http.get(`${baseUrl}/settings/appearance/attribute/font-family`, parameter);
export const getAppearanceTemplates = () =>
  http.get(`${baseUrl}/settings/appearance/sections/templates`);
export const createAppearanceTheme = (parameter) =>
  http.post(`${baseUrl}/settings/appearance/theme`, parameter);
export const getAppearanceTheme = (parameter) =>
  http.get(`${baseUrl}/settings/appearance/theme`, parameter);
export const updateAppearanceTheme = (id, parameter) =>
  http.put(`${baseUrl}/settings/appearance/theme/${id}`, parameter);
export const deleteAppearanceTheme = (parameter) =>
  http.del(`${baseUrl}/settings/appearance/theme`, parameter);
export const duplicateAppearanceTheme = (parameter) =>
  http.post(`${baseUrl}/settings/appearance/theme/duplicate`, parameter);

export const getNonMappedSectionProducts = (parameter) =>
  http.get(`${baseUrl}/settings/section/non-mapped-product`, parameter);
export const getNonMappedSectionCategory = (parameter) =>
  http.get(`${baseUrl}/settings/section/non-mapped-category`, parameter);

export const updateProductStatus = (id, parameter) =>
  http.put(`${baseUrl}/product/update-product-status/${id}`, parameter);
export const updateRevokeAccessToken = (parameter) =>
  http.post(`${baseUrl}/settings/revoke-access-token`, parameter);

export const pincodeValidation = (parameters) =>
  http.get(`${baseUrl}/state/pincode-validation`, parameters);
export const getNotificationCount = () =>
  http.get(`${baseUrl}/notification/get-count`);

export const getSubCategory = () => http.get(`${baseUrl}/sub-category`);

export const getStateByStoreId = (id) =>
  http.get(`${baseUrl}/state/get-store-by-store-id/${id}`);

// eslint-disable-next-line unicorn/prevent-abbreviations
export const getLocalityBySubDistId = (parameters) =>
  http.post(`${baseUrl}/state/get-locality-by-store-id`, parameters);

export const deleteRedisStoreLocationData = (parameter) =>
  http.post(`${baseUrl}/state/delete-key`, parameter);
export const getWhatsapp = () =>
  http.get(`${baseUrl}/notification/get-whatsapp-list`);

// Shipment details
export const getCourierPartner = (parameter) =>
  http.post(`${baseUrl}/shipment/ship-rocket/serviceability`, parameter);
export const getAllShipmentMethods = (parameter) =>
  http.get(`${baseUrl}/shipment`, parameter);
export const getAllChannels = () =>
  http.get(`${baseUrl}/shipment/ship-rocket/channels`);
export const getAllShiprocketOrders = (parameter) =>
  http.get(`${baseUrl}/shipment/ship-rocket/orders`, parameter);
export const generateAwbShipment = (parameter) =>
  http.post(`${baseUrl}/shipment/ship-rocket/generate/awb`, parameter);
export const generatePickupShipment = (parameter) =>
  http.post(`${baseUrl}/shipment/ship-rocket/generate/pickup`, parameter);
export const generateManifest = (parameter) =>
  http.post(`${baseUrl}/shipment/ship-rocket/generate/manifest`, parameter);
export const generateLabel = (parameter) =>
  http.post(`${baseUrl}/shipment/ship-rocket/generate/label`, parameter);
export const generateInvoice = (parameter) =>
  http.post(`${baseUrl}/shipment/ship-rocket/generate/invoice`, parameter);
export const shiprocketOrderCancel = (parameter) =>
  http.post(`${baseUrl}/shipment/ship-rocket/orders/cancel`, parameter);
export const shiprocketShipmentCancel = (parameter) =>
  http.post(`${baseUrl}/shipment/ship-rocket/shipment/cancel`, parameter);
export const updateShipmentMethod = (id, parameters) =>
  http.put(`${baseUrl}/shipment/update/${id}`, parameters);
export const getAllPickupAddress = () =>
  http.get(`${baseUrl}/shipment/ship-rocket/get-all-pick-up-location`);
export const getLocationByPincode = (pincode) =>
  http.get(`${baseUrl}/state/get-location-by-pincode/${pincode}`);
export const orderAvailable = (id) =>
  http.get(`${baseUrl}/shipment/ship-rocket/order/available/${id}`);
export const AddPickupAddress = (parameter) =>
  http.post(`${baseUrl}/shipment/ship-rocket/add-pick-up-location`, parameter);
export const createShiprocketOrder = (object, files) => {
  const formData = serialize({ ...object, ...files });
  return axios({
    method: 'POST',
    url: `${baseUrl}/shipment/ship-rocket/create-order`,
    data: formData,
    headers: {
      // eslint-disable-next-line no-template-curly-in-string
      'Content-Type': 'multipart/form-data; boundary=${form._boundary}',
      Authorization: `Bearer ${token()}`,
    },
  });
};

// delhivery

export const getAllDelhiveryPickupAddress = () =>
  http.get(`${baseUrl}/shipment/delhivery/pickup-address`);
export const createDelhiveryPickupAddress = (parameters) =>
  http.post(`${baseUrl}/shipment/delhivery/pickup-address/create`, parameters);
export const updateDelhiveryPickupAddress = (id, parameters) =>
  http.put(
    `${baseUrl}/shipment/delhivery/pickup-address/edit/${id}`,
    parameters
  );
export const createDelhiveryOrder = (parameter) =>
  http.post(`${baseUrl}/shipment/delhivery/create-order`, parameter);
export const getPincodeServiceability = (parameter) =>
  http.get(`${baseUrl}/shipment/delhivery/serviceability`, parameter);
export const getDownloadPackingLabel = (id) => {
  return axios({
    method: 'get',
    url: `${baseUrl}/shipment/delhivery/packing-slip/${id}`,
    responseType: 'blob',
    headers: {
      // eslint-disable-next-line no-template-curly-in-string
      'Content-Type': 'multipart/form-data; boundary=${form._boundary}',
      Authorization: `Bearer ${token()}`,
    },
  });
};
export const getCategories = (parameters) =>
  http.get(`${baseUrl}/category/get-categories`, parameters);

export const getGoogleFormUrl = () =>
  http.get(`${baseUrl}/settings/google-form`);

// Shippo

export const createInitialAddress = (parameters) =>
  http.post(`${baseUrl}/shipment/shippo/create-address`, parameters);

export const getshippoPickupAddress = () =>
  http.get(`${baseUrl}/shipment/shippo/pickup-address`);

export const updateShippoPickupAddress = (id, parameters) =>
  http.put(`${baseUrl}/shipment/shippo/edit/${id}`, parameters);

export const createShippoPickupAddress = (parameters) =>
  http.post(`${baseUrl}/shipment/shippo/create`, parameters);

export const createShipment = (parameters) =>
  http.post(`${baseUrl}/shipment/shippo/create-shipment`, parameters);

export const buyShippingLabel = (id, parameters) =>
  http.get(`${baseUrl}/shipment/shippo/buy-label/${id}`, parameters);

export const createShippoOrder = (parameters) =>
  http.post(`${baseUrl}/shipment/shippo/create-order`, parameters);

// wallet
export const userPaymentTransactionDetails = (parameter) =>
  http.post(`${baseUrl}/settings/payment-transaction-details`, parameter);

export const userWalletBalance = (parameter) =>
  http.post(`${baseUrl}/settings/user-wallet`, parameter);

export const createPayment = (parameter) =>
  http.post(`${baseUrl}/settings/create-payment`, parameter);

export const paymentSuccess = (parameter) =>
  http.post(`${baseUrl}/settings/payment-success`, parameter);

export const updateGoogleAnalytics = (id, parameter) =>
  http.put(`${baseUrl}/settings/google-analytics-key/${id}`, parameter);

// subscription plan
export const getSubscriptionPlan = (parameter) =>
  http.post(`${baseUrl}/settings/subscription-plan`, parameter);
export const subscriptionDebitWallet = (parameter) =>
  http.post(`${baseUrl}/settings/wallet-debit`, parameter);
export const createSubscriber = (parameter) =>
  http.post(`${baseUrl}/settings/subscribe`, parameter);
export const getPlanDetail = (id) =>
  http.get(`${baseUrl}/settings/plan-detail/${id}`);
export const getPlanTransaction = (parameter) =>
  http.post(`${baseUrl}/settings/transaction`, parameter);
export const getPlanDuration = (parameter) =>
  http.post(`${baseUrl}/settings/active-duration`, parameter);
export const validateCoupon = (parameter) =>
  http.post(`${baseUrl}/settings/validate-coupon`, parameter);
export const getAllPlans = (parameter) =>
  http.post(`${baseUrl}/settings/all-plan`, parameter);

// on board guide
export const getOnboardGuide = () => http.get(`${baseUrl}/onboard`);
export const getSubGuideOnboard = () =>
  http.get(`${baseUrl}/onboard/sub-guide-data`);
export const putOnboardSubGuide = (parameters) =>
  http.get(`${baseUrl}/onboard/sub-guide`, parameters);

export const getPlanStatus = (id) =>
  http.get(`${baseUrl}/settings/subscription-plan/${id}`);

export const getGA4Report = (id, parameter) =>
  http.get(`${baseUrl}/settings/analytics-report/${id}`, parameter);

export const createSelfShipmentOrder = (parameter) =>
  http.post(`${baseUrl}/selfship/self-shipment`, parameter);

export const deleteProductVariant = (id) =>
  http.del(`${baseUrl}/product/delete-product-variant/${id}`);

// collection
export const createCollection = (object, files) => {
  const formFile = serialize({ ...files });
  const formData = serialize({ ...object }, { indices: true }, formFile);
  return axios({
    method: 'POST',
    url: `${baseUrl}/collection/createOrUpdate`,
    data: formData,
    headers: {
      // eslint-disable-next-line no-template-curly-in-string
      'Content-Type': 'multipart/form-data; boundary=${form._boundary}',
      Authorization: `Bearer ${token()}`,
    },
  });
};
export const getAllCollections = (parameter) =>
  http.get(`${baseUrl}/collection/getAllCollection`, parameter);
export const getSelectedProduct = (id) =>
  http.get(`${baseUrl}/collection/getSelectedProduct/${id}`);
export const deleteSelectedProduct = (id) =>
  http.del(`${baseUrl}/collection/deleteSelectedProduct/${id}`);
export const deleteCollection = (id) =>
  http.del(`${baseUrl}/collection/deleteCollection/${id}`);
export const updateCollectionStatus = (id, parameter) =>
  http.put(`${baseUrl}/collection/update-collection-status/${id}`, parameter);
export const getB2cCategory = (parameters) =>
  http.get(`${baseUrl}/category/get-b2c-category`, parameters);
export const getCurrenyDetails = (parameter) =>
  http.get(`${baseUrl}/currency/get-all-currencies`, parameter);

export const updateTenantSettings = (parameter) =>
  http.put(`${baseUrl}/settings/update-settings-tenant-profile`, parameter);

export const getGalleryImage = () =>
  http.get(`${baseUrl}/product/get-gallery-image`);

export const deleteGallery = (parameter) =>
  http.del(`${baseUrl}/product/delete-gallery/`, '', parameter);

export const createGallery = (object, files) => {
  const formData = serialize({ ...object, ...files });
  return axios({
    method: 'POST',
    url: `${baseUrl}/product/create-gallery`,
    data: formData,
    headers: {
      // eslint-disable-next-line no-template-curly-in-string
      'Content-Type': 'multipart/form-data; boundary=${form._boundary}',
      Authorization: `Bearer ${token()}`,
    },
  });
};

// meta
export const disconnectAuth = (id) =>
  http.del(`${baseUrl}/promote/disconnect-auth/${id}`);
export const getFbLongLivedToken = (parameters) =>
  http.post(`${baseUrl}/promote/long-live-token`, parameters);
export const getFbPageDetails = (id) =>
  http.get(`${baseUrl}/promote/fb-page-details/${id}`);
export const getFbPagePosts = (parameters) =>
  http.post(`${baseUrl}/promote/fb-page-posts`, parameters);
export const getFbPostInsight = (parameters) =>
  http.post(`${baseUrl}/promote/fb-post-insight`, parameters);
export const getIgMediaPost = (parameters) =>
  http.post(`${baseUrl}/promote/ig-posts`, parameters);
export const getIgPostInsight = (parameters) =>
  http.post(`${baseUrl}/promote/ig-insight`, parameters);
export const fbMediaPost = (parameters) =>
  http.post(`${baseUrl}/promote/fb-media-post`, parameters);
export const igMediaPost = (parameters) =>
  http.post(`${baseUrl}/promote/ig-media-post`, parameters);
export const getMessengerConversation = (parameters) =>
  http.post(`${baseUrl}/promote/messenger`, parameters);
export const getConversationMessages = (parameters) =>
  http.post(`${baseUrl}/promote/messenger-chat`, parameters);
export const sendMessengerMessage = (parameters) =>
  http.post(`${baseUrl}/promote/messenger-response`, parameters);

export const getGoogleScope = () =>
  http.get(`${baseUrl}/settings/google-scope`);
export const getThemeBuilder = () =>
  http.get(`${baseUrl}/settings/theme-builder`);
export const putThemeBuilderTemplate = (id, parameters) =>
  http.put(`${baseUrl}/settings/theme-builder/${id}`, parameters);
export const createThemeBuilderTemplate = (parameters) =>
  http.post(`${baseUrl}/settings/theme-builder/`, parameters);
export const deleteThemeBuilderTemplate = (parameters) =>
  http.del(`${baseUrl}/settings/theme-builder/${parameters}`);
export const activeThemeBuilderTemplate = (parameters) =>
  http.put(`${baseUrl}/settings/active-theme-builder`, parameters);

// menu
export const createMenuList = (parameters) =>
  http.post(`${baseUrl}/menu/create-or-update`, parameters);
export const getMenu = (parameters) =>
  http.get(`${baseUrl}/menu/get-all-b2c-menu`, parameters);
export const getAllMenu = (parameter) =>
  http.get(`${baseUrl}/menu/get-all-menu`, parameter);
export const createMenuTheme = (parameters) =>
  http.post(`${baseUrl}/menu-theme/create-or-update`, parameters);
export const deleteMenu = (id) => http.del(`${baseUrl}/menu/delete-menu/${id}`);
export const updateMenuStatus = (id, parameter) =>
  http.put(`${baseUrl}/menu/update-menu-status/${id}`, parameter);
export const getMenuTheme = () =>
  http.get(`${baseUrl}/menu-theme/get-menu-theme`);

// social leads
export const getTenantWhatsappNumbers = () =>
  http.get(`${baseUrl}/social-leads/get-tenant-whatsapp-number`);

export const getSocialLeads = (parameter) =>
  http.get(`${baseUrl}/social-leads/`, parameter);

export const sendWhatsappMessage = (parameters) =>
  http.post(`${baseUrl}/social-leads/message-send`, parameters);

export const cardTabChange = (parameters) =>
  http.post(`${baseUrl}/social-leads/card-tab-change`, parameters);

export const createSocialLeadsTab = (parameters) =>
  http.post(`${baseUrl}/social-leads/create-tab`, parameters);

export const insertWhatsappNumber = (parameters) =>
  http.post(`${baseUrl}/social-leads/create-whatsapp-login-number`, parameters);

export const manualLogin = (parameters) =>
  http.post(`${baseUrl}/social-leads/manual-login`, parameters);

export const storeChatHistoryMessage = (parameters) =>
  http.post(`${baseUrl}/social-leads/store-chat-history-message`, parameters);
export const getCoupons = (parameters) =>
  http.get(`${baseUrl}/coupon/get-coupon`, parameters);

export const updateDomainTags = (id, parameter) =>
  http.put(`${baseUrl}/settings/update-domain-tag/${id}`, parameter);

// clic
export const createClicProduct = (object, files) => {
  const formData = serialize({ ...object, ...files });
  return axios({
    method: 'POST',
    url: `${baseUrl}/clic/product`,
    data: formData,
    headers: {
      // eslint-disable-next-line no-template-curly-in-string
      'Content-Type': 'multipart/form-data; boundary=${form._boundary}',
      Authorization: `Bearer ${token()}`,
    },
  });
};
export const updateClicProduct = (data, files, id) => {
  const formData = serialize({ ...data, ...files });
  return axios({
    method: 'PUT',
    url: `${baseUrl}/clic/product/${id}`,
    data: formData,
    headers: {
      // eslint-disable-next-line no-template-curly-in-string
      'Content-Type': 'multipart/form-data; boundary=${form._boundary}',
      Authorization: `Bearer ${token()}`,
    },
  });
};
export const getClicLeads = (parameters) =>
  http.get(`${baseUrl}/clic/leads`, parameters);
export const getClicProducts = (parameters) =>
  http.get(`${baseUrl}/clic/products`, parameters);
export const getClicProduct = (id) => http.get(`${baseUrl}/clic/product/${id}`);
export const deleteClicProduct = (parameter) =>
  http.del(`${baseUrl}/clic/product`, '', parameter);
export const updateClicProductStatus = (id, parameter) =>
  http.put(`${baseUrl}/clic/product-status/${id}`, parameter);
export const getBookingTimeSlot = (parameter) =>
  http.get(`${baseUrl}/clic/booking/time-slot`, parameter);
export const getBookingProduct = (parameter) =>
  http.get(`${baseUrl}/clic/bookings`, parameter);
export const updateBookingStatus = (id, parameter) =>
  http.put(`${baseUrl}/clic/booking/status/${id}`, parameter);

export const getAllCountry = (countryUrl) => {
  return fetch(`${countryUrl}/country-from-state-city`, {
    headers: {
      'Content-type': 'application/json',
    },
    method: 'GET',
  });
};
export const getInternationalState = (code) => {
  return fetch(
    `https://dev-countryapi.zupain.com/country-api/v1/state?countryCode=${code}`,
    {
      headers: {
        'Content-type': 'application/json',
      },
      method: 'GET',
    }
  );
};

export const getCitiesOfCountry = (countryCode, stateCode) => {
  return fetch(
    `https://dev-countryapi.zupain.com/country-api/v1/cities?countryCode=${countryCode}&stateCode=${stateCode}`,
    {
      headers: {
        'Content-type': 'application/json',
      },
      method: 'GET',
    }
  );
};

export const getCountryByCode = (code) => {
  return fetch(
    `https://dev-countryapi.zupain.com/country-api/v1/?countryCode=${code}`,
    {
      headers: {
        'Content-type': 'application/json',
      },
      method: 'GET',
    }
  );
};

export const createEnquiryLead = (parameter) =>
  http.post(`${baseUrl}/clic/create-enquiry-lead`, parameter);
export const updateEnquiryLead = (id, parameter) =>
  http.put(`${baseUrl}/clic/update-enquiry-lead/${id}`, parameter);
export const deleteEnquiryLead = (id, parameters) =>
  http.del(`${baseUrl}/clic/delete-enquiry-lead/${id}`, parameters);
export const getAllEnquiryLeads = () =>
  http.get(`${baseUrl}/clic/get-enquiry-lead`);
export const getAllEnquiryData = (parameters) =>
  http.get(`${baseUrl}/clic/get-enquiry-data`, parameters);
export const updateEnquiryData = (id, parameter) =>
  http.put(`${baseUrl}/clic/update-enquiry-data/${id}`, parameter);
export const getTopProducts = (parameter) =>
  http.get(`${baseUrl}/clic/dashboard/top-products`, parameter);
export const getTopEnquireProducts = (parameter) =>
  http.get(`${baseUrl}/clic/dashboard/top-enquire-products`, parameter);
export const getEnquiryCount = (parameter) =>
  http.get(`${baseUrl}/clic/dashboard/enquiry-count`, parameter);
export const getClicProductNames = (parameter) =>
  http.get(`${baseUrl}/clic/product-names`, parameter);

// facebook pixel
export const updateFacebookPixel = (id, parameter) =>
  http.put(`${baseUrl}/settings/facebook-pixel/${id}`, parameter);

export const insertCustomerChat = (parameters) =>
  http.post(`${baseUrl}/social-leads/insert-customer-chat`, parameters);

export const updateTabName = (parameters) =>
  http.post(`${baseUrl}/social-leads/update-tab-name`, parameters);

export const deleteTabAllChats = (parameters) =>
  http.post(`${baseUrl}/social-leads/delete-tab`, parameters);

export const getDiscardCustomerChatDetail = (id) =>
  http.get(`${baseUrl}/social-leads/discard-customer-chat-detail/${id}`);

export const createTrackSession = (parameters) =>
  http.post(`${baseUrl}/settings/track-session`, parameters);

export const logoutWhatsappNumber = (parameter) =>
  http.post(`${baseUrl}/social-leads/logout`, parameter);

export const createSpreadSheet = (parameter) =>
  http.post(`${baseUrl}/order/create-spread-sheet`, parameter);

export const changeBackground = (parameter, key, apiUrl) => {
  return axios({
    method: 'POST',
    url: `${apiUrl}v1/instant-backgrounds`,
    data: parameter,
    headers: {
      'x-api-key': key,
      'Content-Type': 'multipart/form-data',
    },
    responseType: 'blob',
  });
};

export const getCredits = () => http.get(`${baseUrl}/product/get-credits`);

// page builder
export const getPageBuilder = () =>
  http.get(`${baseUrl}/settings/page-builder/page`);
export const createPageBuilder = (object, files) => {
  const formData = serialize({ ...object, ...files });

  return axios({
    method: 'POST',
    url: `${baseUrl}/settings/page-builder/page`,
    data: formData,
    headers: {
      // eslint-disable-next-line no-template-curly-in-string
      'Content-Type': 'multipart/form-data; boundary=${form._boundary}',
      Authorization: `Bearer ${token()}`,
    },
  });
};

export const updatePageBuilder = (object, files) => {
  const formData = serialize({ ...object, ...files });

  return axios({
    method: 'PUT',
    url: `${baseUrl}/settings/page-builder/page`,
    data: formData,
    headers: {
      // eslint-disable-next-line no-template-curly-in-string
      'Content-Type': 'multipart/form-data; boundary=${form._boundary}',
      Authorization: `Bearer ${token()}`,
    },
  });
};

export const showAppearanceOrNot = () =>
  http.get(`${baseUrl}/settings/page-builder/show-appearance-or-not`);

export const getSimulationData = (data) =>
  axios.get(`${baseUrl}/simulation/get-simulation`, data);

// gupshup-partner
export const createPartnerApp = (parameter) =>
  http.post(`${baseUrl}/settings/gupshup-partner/app`, parameter);
export const getAllPartnerApp = (parameter) =>
  http.get(`${baseUrl}/settings/gupshup-partner/app`, parameter);
export const deletePartnerApp = (id) =>
  http.del(`${baseUrl}/settings/gupshup-partner/app/${id}`);
export const setAsDefaultApp = (id, parameters) =>
  http.put(`${baseUrl}/settings/gupshup-partner/active/${id}`, parameters);
export const getTemplates = (parameter) =>
  http.get(`${baseUrl}/settings/gupshup-partner/templates`, parameter);
export const getTemplate = (parameter) =>
  http.get(`${baseUrl}/settings/gupshup-partner/template`, parameter);
export const updateTemplate = (id, parameter) =>
  http.put(`${baseUrl}/settings/gupshup-partner/template/${id}`, parameter);
export const updateTemplateStatus = (id, parameters) =>
  http.put(
    `${baseUrl}/settings/gupshup-partner/template/status/${id}`,
    parameters
  );
export const createTemplate = (parameter) =>
  http.post(`${baseUrl}/settings/gupshup-partner/template`, parameter);
export const getMessages = (parameter) =>
  http.get(`${baseUrl}/settings/gupshup-partner/messages`, parameter);
export const getMessagesStatusCount = (parameter) =>
  http.get(
    `${baseUrl}/settings/gupshup-partner/messages/status/count`,
    parameter
  );
export const getMessagesTemplate = (parameter) =>
  http.get(
    `${baseUrl}/settings/gupshup-partner/messages/template/status`,
    parameter
  );
export const getMessagesDateWiseCount = (parameter) =>
  http.get(
    `${baseUrl}/settings/gupshup-partner/messages/date-wise-count`,
    parameter
  );

export const getCustomerCartList = (id) =>
  http.get(`${baseUrl}/user/get-cart-list/${id}`);
