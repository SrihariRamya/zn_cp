import {
  LocationIcon,
  SearchIcon,
  HomeIcon,
  ProductsIcon,
  BagIcon,
  AccountIcon,
} from './icon-helper';

// Store
export const STORE_UPDATE_SUCCESS = 'Store Updated successfully';
export const STORE_ADD_SUCCESS = 'Store Added successfully';
export const STORE_DELETE_SUCCESS = 'Store Deleted successfully';
export const STORE_ADD_FAILED = 'Failed to add store';
export const STORE_UPDATE_FAILED = 'Failed to update store';
export const STORE_DELETE_FAILED = 'Failed to delete store';
export const STORE_LOCATION_FAILED = 'Store location not found';
export const STORE_NAME_EXISTS = 'Store name already exists';
export const STORE_DETAILS_EXISTS = 'Store details already exist';
export const USE_GOOGGLE_MAP_TO_ADD_ADDRESS = 'Use google map to add address';
export const STORE_FIRST_TIME_USER_TITLE =
  'Expand your reach by adding Stores Seamlessly!';
export const STORE_FIRST_TIME_USER_DESCRIPTION =
  "Easily expand your business's presence and reach new customers by seamlessly adding new stores today";
export const STORE_INITIAL_STATUS_MESSAGE =
  "Our store is temporarily closed for orders, but you can still add products to your cart. We'll be back soon to process your orders. Thank you for your patience.";
export const STORE_STATUS_NOTE =
  'Note: Enable the Store Delivery Location(s) for the store to deliver selected pincodes.';
export const STORE_OFFLINE_STATUS_NOTE =
  'Pops up display message when your online store is closed or offline, keeping customers informed about updates, maintenance, or special announcements.';

export const storeOffline = [
  {
    id: 1,
    value: 30,
    name: '30 mins',
  },
  {
    id: 2,
    value: 1,
    name: '1 hour',
  },
  {
    id: 3,
    value: 2,
    name: '2 hour',
  },
  {
    id: 4,
    value: 4,
    name: '4 hour',
  },
  {
    id: 5,
    value: 24,
    name: '24 hour',
  },
  {
    id: 6,
    value: 'custom',
    name: 'Custom',
  },
  {
    id: 7,
    value: '0',
    name: 'I will do it on my own',
  },
];
//
export const FAILED_TO_LOAD = ' Failed to load the data';
export const DOWNLOAD_FAILED = 'Download failed';
export const DOWNLOAD_SUCCESS = 'Report download successfully';
export const FAILED_TO_LOAD_SOCIAL_LEADS =
  'Failed to load the social leads data';

// Product
export const PRODUCT_DELETE_SUCCESS = 'Product Deleted successfully';
export const PRODUCT_DELETE_FAILED = 'Failed to delete product';
export const TRACK_INVENTORY_ERROR_MESSAGE =
  'This Product is not associated with Inventory';
export const PRODUCT_VARIANT_DELETE_SUCCESS =
  'Product Varient Deleted successfully';
export const PRODUCT_VARIANT_DELETE_FAILED = 'Failed to delete Product Varient';
export const SYNTAX_JSON_ERROR = 'Syntax error in secret config';
export const EMOJIS_RESTRICT = 'Emojis are not allowed in the product name.';
// POS
export const POS_UPDATE_FAILED = 'Failed to update POS Machine';
export const POS_DELETE_FAILED = 'Failed to delete POS Machine';
export const POS_DELETE_SUCCESS = 'POS Machine Deleted successfully';
export const POS_UPDATE_SUCCESS = 'POS Machine Updated successfully';
export const POS_ADD_SUCCESS = 'POS Machine Added successfully';
export const POS_ADD_FAILED = 'Failed to add POS Machine';

// POSUSER
export const POSUSER_UPDATE_FAILED = 'Failed to Update POS User';
export const POSUSER_DELETE_FAILED = 'Failed to Delete POS User';
export const POSUSER_DELETE_SUCCESS = 'POS User Deleted successfully';
export const POSUSER_UPDATE_SUCCESS = 'POS User Updated successfully';
export const POSUSER_ADD_SUCCESS =
  'POS User assigned to POS Machine successfully ';
export const POSUSER_ADD_FAILED = 'Failed to add POS User';

// Delivery Charge
export const DELIVERYCHARGE_ADD_SUCCESS = 'Delivery charge Added successfully';
export const DELIVERYCHARGE_UPDATE_SUCCESS =
  'Delivery charge Updated successfully';
export const DELIVERYCHARGE_ADD_FAILED = 'Failed to add delivery charge ';
export const DELIVERYCHARGE_UPDATE_FAILED = 'Failed to update delivery charge ';
export const DELIVERYCHARGE_DELETE_FAILED = 'Failed to delete delivery charge';
export const DELIVERYCHARGE_DELETE_SUCCESS =
  'Delivery charge deleted successfully';
export const PRICERANGEALREADYEXIST = 'Price range already exist';

// Category
export const CATEGORY_GET_FAILED = 'Failed to fetch category list.';
export const CATEGORY_ADD_SUCCESS = 'Category Created successfully';
export const CATEGORY_ADD_FAILED = 'Failed to create the category';
export const SUB_CATEGORY_ADD_SUCCESS = 'Subcategory Created successfully';
export const SUB_CATEGORY_ADD_FAILED = 'Failed to create the Subcategory';
export const SUB_CATEGORY_DELETE_SUCCESS = 'Subcategory Deleted successfully';
export const SUB_CATEGORY_DELETE_FAILED = 'Failed to delete the Subcategory';
export const ATTRIBUTE_ADD_SUCCESS = 'Attribute Created successfully';
export const ATTRIBUTE_ADD_FAILED = 'Failed to create the attribute';
export const ATTRIBUTE_DELETE_SUCCESS = 'Attribute Deleted successfully';
export const ATTRIBUTE_DELETE_FAILED = 'Failed to delete the attribute';
export const CATEGORY_DELETE_SUCCESS = 'Category Deleted successfully';
export const CATEGORY_DELETE_FAILED = 'Failed to delete the category';
export const CATEGORY_EDIT_SUCCESS = 'Category Updated successfully';
export const CATEGORY_EDIT_FAILED = 'Failed to update the category';
export const SUB_CATEGORY_EDIT_SUCCESS = 'Subcategory Updated successfully';
export const SUB_CATEGORY_EDIT_FAILED = 'Failed to update the subcategory';
export const CATEGORY_DELETE_WARNING =
  'This category has subcategory. Can not be deleted';
export const CAT_BUTTON = 'Add Category';
export const SWITCH_WARNING =
  'If you disable this category all subcategory and product will disabled';
export const CAT_PRODUCT_PAGE_LIMIT = 9;
export const CAT_ATTRIBUTE_INFO =
  'Allows you to customize your item by specifying additional properties, relevant information that helps define the object and configuring settings to suit your specific needs.';
export const CAT_SEO_INFO =
  "SEO (Search Engine Optimization) is the art of boosting a website's visibility and ranking on search engines like Google, Bing, and Yahoo. " +
  'Its aim is to attract more organic traffic, enhance online presence, and drive conversions for business success.';

// User
export const USER_ADD_SUCCESS = 'User Created successfully';
export const USER_ADD_FAILED = 'Failed to create the user';
export const USER_UPDATE_SUCCESS = 'User Updated successfully';
export const USER_UPDATE_FAILED = 'Failed to update the user';
export const USER_DELETE_SUCCESS = 'User Deleted successfully';
export const USER_DELETE_FAILED = 'Failed to delete the user';
export const PROFILE_ADD_SUCCESS = 'Profile Added successfully';
export const PROFILE_UPDATE_SUCCESS = 'Profile Updated successfully';
export const PROFILE_ADD_FAILED = 'Failed to add the profile';
export const PROFILE_UPDATE_FAILED = 'Failed to update the profile';
export const CUSTOMER_DELETE_SUCCESS = 'Customer Deleted successfully';
export const CUSTOMER_DELETE_FAILED = 'Failed to delete the Customer';
export const CUSTOMER_DELETE =
  'Are you sure want to delete this customer from the list?';
export const CATEGORY_DELETE =
  'Are you sure want to delete this category from the list?';
export const FAILED_TO_UPDATE_USER_PROFILE = 'Failed to update Your profile';
export const USER_PROFILE_UPDATE_SUCCESS = 'Your profile updated successfully';
export const CUSTOMER_ENQUIRY_FORM = 'Contact Form';

// Order
export const ORDER_CHECKOUT = 7;
export const STATUS_EDIT_SUCCESS = 'Order status Updated successfully';
export const STATUS_EDIT_FAILED = 'Failed to Update the status';
export const EXCEL_FILE_DOWNLOAD_FAILED = 'Failed to download excel file(s)';
export const PRODUCT_PLACED = 'online';

// Banner
export const BANNER_UPDATE_SUCCESS = 'Banner Updated successfully';
export const BANNER_ADD_SUCCESS = 'Banner Added successfully';
export const BANNER_DELETE_SUCCESS = 'Banner Deleted successfully';
export const BANNER_ADD_FAILED = 'Failed to add banner';
export const BANNER_UPDATE_FAILED = 'Failed to update banner';
export const BANNER_DELETE_FAILED = 'Failed to delete banner';
export const POSITION_UPDATE_FAILED = 'Failed to update position';
export const POSITION_UPDATE_SUCCESS = 'Position Updated successfully';
export const IS_JPG_OR_PNG_OR_WEBP = 'You can only upload JPG/PNG/WEBP file!';
export const IS_LT_2MB = 'Image must be smaller than 2MB';
export const BANNER_CREATE_FAILED = 'Failed to create Adobe banner';

export const ADOBE_BANNER = [
  {
    key: '1',
    canvasSize: '2:1',
    lable: 'Banner size (2:1)',
  },
  {
    key: '2',
    canvasSize: '3:1',
    lable: 'Banner size (3:1)',
  },
];

// profile
export const PROFILE_DETAILS_EXISTS = 'Profile details already exist';

// Email Exists
export const EMAIL_NOT_EXISTS = "Email id doesn't exist";

// Search Enquiries
export const ENQUIRY_DELETE_SUCCESS = 'Enquries Deleted successfully';
export const ENQUIRY_DELETE_FAIL = 'Failed to deleted enquiries';

// Coupon
export const COUPON_ADD_SUCCESS = 'Coupon Created successfully';
export const COUPON_ADD_FAILED = 'Failed to create the coupon';
export const COUPON_UPDATE_SUCCESS = 'Coupon Updated successfully';
export const COUPON_UPDATE_FAILED = 'Failed to update the coupon';
export const COUPON_DELETE_SUCCESS = 'Coupon Deleted successfully';
export const COUPON_DELETE_FAILED = 'Failed to delete the coupon';
export const COUPON_ALREADY_EXIST = 'Coupon already exists';
export const MAXIMUM_DISCOUNT_ERROR =
  'By value should also be greater than the Discount amount';
export const DISCOUNT_OFFER_ERROR =
  'Discount offer should be greater than the Maximum discount Amount';
export const COUPON_BY_VALUE_ERROR = 'Please enter coupon by value';
export const COUPON_BY_PERCENTAGE_ERROR = 'please enter Percentage %';

export const COUPON_USAGE_LIMIT_INFO =
  'Maximum number of times an user can use this coupon';
export const MINIMUN_PURCHASE_INFO =
  'Minimum order amount to avail this coupon';
export const COUPON_USER_LIMIT_INFO =
  'Priority given based on coupon limit.For example, the coupon is valid for the first 100';
export const MAXIMUM_DISCOUNT_INFO =
  'To benefit from the highest available discount as specified';

// Document
export const DOCUMENT_UPDATE_SUCCESS = 'Document Updated Successfully';
export const DOCUMENT_UPDATE_FAILED = 'Failed to update the Document';

// Delivery Location
export const LOCATION_ADD_SUCCESS = 'Location Added successfully';
export const LOCATION_ADD_FAILED = 'Failed to Add the Location';
export const LOCATION_DELETE_SUCCESS = 'Location deleted successfully';
export const LOCATION_DELETE_FAILED = 'Failed to delete the Delivery Location';
export const LOCATION_NOT_IN_US =
  'The delivery location is not in the United States. Please try another shipment method';

// Delivery Slot
export const DELIVERY_SLOT_ADD_SUCCESS = 'Delivery Slot Added Successfully';
export const DELIVERY_SLOT_ADD_FAILED = 'Failed to Add the delivery slot';

// Analytics
export const GOOGLE_ANALYTIC_FROM = 'Google Analytic';
export const GOOGLE_TAG_FROM = 'Google Tag';
export const FB_PIXEL_TAG_FROM = 'Facebook pixel';
export const SETTINGS_UPDATE_FAILED = 'Failed to update the settings';
export const SETTINGS_UPDATE_SUCCESS = 'Settings Update successfully';
// Tag
export const GOOGLE_TAG_MANAGER_TITLE = 'Connect to Google Tag Manager';
export const GOOGLE_TAG_SUCCESS = 'Google Tag Manager Id Update successfully';
export const GOOGLE_TAG_DELETE_SUCCESS =
  'Google Tag Manager Id removed successfully';
export const GOOGLE_TAG_DELETE_FAILED =
  'Failed to delete the Google Tag Manager Id';
export const GOOGLE_TAG_UPDATE_FAILED =
  'Failed to update the google tag manager';
export const GOOGLE_TAG_COMFIRM_POP_TITLE =
  'Are you sure want to remove Google Tag Manager Id ?';
export const GOOGLE_TAG_EXIST = 'Google Tag Manager Id already exist';

// Google Analytic
export const GOOGLE_ANALYTICS_TITLE = 'Connect Google Analytics';
export const GOOGLE_ANALYTIC_SUCCESS =
  'Google Analytic Measurement Id Update successfully';
export const GOOGLE_ANALYTIC_UPDATE_FAILED = 'Failed to update google analytic';
export const GOOGLE_ANALYTIC_DELETE_SUCCESS =
  'Google Analytic Id removed successfully';
export const GOOGLE_ANALYTIC_DELETE_FAILED =
  'Failed to delete the Google Analytic Id';
export const ANALYTIC_COMFIRM_POP_TITLE =
  'Are you sure want to remove Google analytic Id ?';
export const GOOGLE_ANALYTIC_EXIST = 'Analytic Id already exist';
export const GOOGLE_ANALYTIC_ERROR = 'Please Enter the valid Id';

// Facebook Pixel
export const FACEBOOK_PIXEL_SUCCESS = 'Facebook Pixel Id updated successfully';
export const FACEBOOK_PIXEL_UPDATE_FAILED = 'Failed to update facebook pixel';
export const FACEBOOK_PIXEL_DELETE_SUCCESS =
  'Facebook Pixel Id removed successfully';
export const FACEBOOK_PIXEL_DELETE_FAILED =
  'Failed to delete the Facebook Pixel Id';
export const REMOVE_FACEBOOK_PIXEL =
  'Are you sure want to remove Facebook Pixel Id ?';
export const FACEBOOK_PIXEL_EXIST = 'Facebook Pixel Id already exist';
export const FACEBOOK_PIXEL_TITLE = 'Connect to Facebook Pixel';

// Grid_List_View Status
export const GRID_VIEW_STATUS_UPDATE_SUCCESS =
  'Grid view status updated Successfully';
export const LIST_VIEW_STATUS_UPDATE_SUCCESS =
  'List view status updated Successfully';
export const GRID_LIST_VIEW_STATUS_UPDATE_FAILED =
  'Failed to update grid List view Status';

// Social Status
export const SOCIAL_LOGIN_UPDATE_SUCCESS =
  'Social Media login Status Updated Successfully';
export const FRESH_CHAT_UPDATE_SUCCESS =
  'Fresh Chat Status Updated Successfully';
export const LOW_STOCK_LABEL_SUCCESS =
  'Low Stock Label Status Updated Successfully';
export const LOW_STOCK_LIMIT_SUCCESS =
  'Low Stock Label Limit Updated Successfully';
export const SOCIAL_UPDATE_FAILED = 'Failed to update the Status';
export const PAGE_LIMIT = 10;
export const PAGE_LIMIT_5 = 5;
export const INITIAL_PAGE = 1;

// Theme Customization
export const BGCOLOR_UPDATE_SUCCESS =
  'Theme configurations updated Successfully';
export const BGCOLOR_UPDATE_FAILED =
  'Failed to update the theme configurations';

// FOOTER MANAGEMENT
export const FOOTER_UPDATE_SUCCESS = 'Footer Updated successfully';
export const FOOTER_UPDATE_FAILED = 'Failed to update the footer';

// MARKET PLACE
export const PROUDUCT_MARKET_ADD_SUCCESS =
  'Product has been added to marketplace sync process';
export const MARKET_SYNC_UPDATE_SUCCESS = 'Sync updated successfully';
export const MARKET_SYNC_ADD_FAILED = 'Failed to sync data';
export const MARKET_SYNC_UPDATE_FAIL = 'Failed to update sync';
export const MARKET_SYNC_MOVE_SUCCESS =
  'Marketplace creation request has been submitted successfully';
export const MARKET_SYNC_MOVE_FAIL = 'Marketplace creation request Failed';
export const MARKET_SYNC_MRP_REQUIRED_TITLE =
  'MRP is required to push to marketplace';

// Report
export const REPORT_ADD_SUCCESS = 'Report Created successfully';
export const REPORT_ADD_FAILED = 'Failed to create the Report';
export const REPORT_UPDATE_SUCCESS = 'Report Updated successfully';
export const REPORT_UPDATE_FAILED = 'Failed to update the Report';
export const REPORT_DELETE_SUCCESS = 'Report Deleted successfully';
export const REPORT_DELETE_FAILED = 'Failed to delete the Report';

// Add lane settings
export const APPEARANCE_TEMPLATE_NAME_1 = 'ONE';
export const APPEARANCE_TEMPLATE_NAME_2 = 'TWO';
export const APPEARANCE_TEMPLATE_NAME_3 = 'THERE';
export const APPEARANCE_TEMPLATE_TYPE_PRODUCT = 'PRODUCT';
export const APPEARANCE_TEMPLATE_TYPE_CLIC = 'CLIC-PRODUCT';
export const PRODUCT_TEMPLATE_VARIANT_INPUT = 'INPUT';
export const PRODUCT_TEMPLATE_VARIANT_BUTTON = 'BUTTON';

export const CHANNEL_SMS = 1;
export const CHANNEL_EMAIL = 2;
export const CHANNEL_PUSH = 3;
export const CHANNEL_WHATSAPP = 4;
export const RICH_TEXT_HEADER = [1, 2, 3, 4, 5, 6, false];

export const headerList = [
  {
    id: 1,
    name: 'Location',
    icon: LocationIcon,
  },
  {
    id: 2,
    name: 'Search',
    icon: SearchIcon,
  },
  {
    id: 3,
    name: 'Home',
    icon: HomeIcon,
  },
  {
    id: 4,
    name: 'Products',
    icon: ProductsIcon,
  },
  {
    id: 5,
    name: 'Bag',
    icon: BagIcon,
  },
  {
    id: 6,
    name: 'Account',
    icon: AccountIcon,
  },
];

export const footerNavigation = [
  {
    id: 1,
    name: 'Home',
    icon: HomeIcon,
  },
  {
    id: 2,
    name: 'Search',
    icon: SearchIcon,
  },
  {
    id: 3,
    name: 'Product',
    icon: ProductsIcon,
  },
  {
    id: 4,
    name: 'Bag',
    icon: BagIcon,
  },
  {
    id: 5,
    name: 'Account',
    icon: AccountIcon,
  },
];

export const CHART_BACKGROUND_COLOR = [
  '#41B883',
  '#E46651',
  '#a8eb34',
  '#00D8FF',
  '#DD1B16',
  '#34ebd8',
  '#eb7434',
  '#10D8FF',
];

// Delete
export const DELETE_CONFIRMATION_DATA =
  'Are you sure you want to delete this custom report from the list?';

// Role Access
export const ROLES_UPDATE_SUCCESS = 'Roles Updated successfully';
export const ROLES_UPDATE_FAILED = 'Failed to update the Roles';

// payment method
export const PAYMENT_METHOD_SLUG_COD = 'cod';
export const PAYMENT_UPDATE_SUCCESS = 'Payment updated successfully';
export const PAYMENT_UPDATE_FAILED = 'Failed to update the payment data';
export const TENANT_RAZORPAY_DETAILS_FAILED = `Failed to revoke tenant's razorpay details`;
export const UPDATE_BANK_DETAILS_SUCCESS = 'Bank details updated successfully';
export const UPDATE_BANK_DETAILS_FAILED =
  'Failed to update the bank details data';

// Appearance
export const APPEARANCE_UPDATE_SUCCESS = 'Appearance updated successfully';
export const APPEARANCE_THEME_UPDATE_SUCCESS =
  'Appearance theme updated successfully';
export const APPEARANCE_LAYOUT_SOURCE_WEB = 'Web';

// redis
export const FAILED_TO_DELETE_REDIS_KEY = 'Failed to delete redis key';

// Related Products
export const RELATED_PRODUCT_CREATE_FAILED =
  'Failed to create Related Products';
export const PRODUCT_RETRIVE_FAILED = 'Failed to retrive Products';
export const RELATED_PRODUCT_RETRIVE_FAILED =
  'Failed to retrive related Products';
export const RELATED_PRODUCT_DELETE_FAILED =
  'Failed to delete related Products';
export const DELETE_RELATED_PRODUCT = 'Related Product deleted successfully';
// shiprocket package details
export const SHIPROCKET_PACKAGE_DETAILS_WEIGHT_ERROR_TEXT =
  'Please enter a value greater than or equal to 0.5 kg';
export const SHIPROCKET_PACKAGE_DETAILS_ERROR_TEXT =
  'Please enter a value greater than or equal to 0.5 cm';
export const SHIPROCKET_PACKAGE_DETAILS_NOTES_1 =
  'Note: This minimum chargeable weight is 0.05 kg';
export const SHIPROCKET_PACKAGE_DETAILS_NOTES_2 =
  'Note: Dimensions should be in centimeters only & values should be greater than 0.50 cm';
export const SHIPROCKET_PACKAGE_DETAILS_INFO_1 =
  'Enter package dimensions to calculate volumetric weight';
export const SHIPROCKET_PACKAGE_DETAILS_INFO_2 =
  '* Applicable weight is the heavier among the two weights that is Dead Weight V/s the Volumetric Weight, basis on which freight charges are calculated';
export const SHIPROCKET_PACKAGE_DETAILS_INFO_3 =
  '* Final chargeable weight will be based on the weight slab of the courier selected before shipping';
export const SHIPMENT_UPDATE_SUCCESS = 'Shipment updated successfully';
export const SHIPMENT_UPDATE_FAILED = 'Failed to update the shipment data';
export const SPREADSHEET_EXPORT = 'Spreadsheet downloaded successfully!';
export const SPREADSHEET_EXPORT_ERROR =
  'Some error occurred while creating spreadsheet values';
export const PAYMENT_METHOD_SHIPMENT = ['Prepaid', 'Cod'];
export const SELF_SHIPMENT_CREATE_SUCCESS =
  'Self Shipment Order Created Successfully';
export const SELF_SHIPMENT_CREATE_FAILED =
  'Failed to create self shipment order';
export const SHIPROCKET_SHIPMENT_CANCEL_TEXT =
  'A cancellation request will be sent to the selected courier partner. Once approved, your freight amount will be refunded & credited to your shiprocket wallet immediately';
export const SHIPROCKET_ORDER_CANCEL_TEXT =
  'A cancellation request will be sent to the selected courier partner. Once approved, your freight amount will be refunded & credited to your Shiprocket wallet in 3-4 working days';
export const LONG_DATE_FORMAT = 'YYYY-MM-DD';
// eslint-disable-next-line unicorn/numeric-separators-style
export const TOTAL_MAX_AMOUNT = 50000;
export const DATE_WITH_TIME_FORMAT = 'DD-MM-YYYY hh:mm a';
export const DATE_WITHOUT_TIME_FORMAT = 'MMMM DD, YYYY';
export const DATE_AND_TIME_WITH_SECOND_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const TIME_FORMAT_WITH_12HOURS = 'hh:mm a';

// Payment method
export const PAYMENT_METHOD_SLUG_PAYOFFLINE = 'pay_offline';
export const PAYMENT_METHOD_TEXT_PAYOFFLINE = 'Pay offline';
export const PAYMENT_METHOD_SLUG_PAYPAL = 'paypal';

export const WALLET_CREDIT = 'Credit';
export const WALLET_DEBIT = 'Debit';
export const FAILED_TO_LOAD_WALLET = ' Failed to load the Wallet Balance';
export const WALLET_TAB_VALUES = ['Credit', 'Debit'];
export const AVAILABLE_BALANCE = 'Available Balance';
export const TOP_UP_WALLET = 'Top-up Wallet';

export const EXPLORE = '/explore';
export const PAGE_BULIDER_PATH = '/explore';

export const DELETE_APPEARANCE_LAYOUT =
  'Appearance layout deleted successfully';
export const APPEARANCE_LAYOUT_NAME_ERROR = 'Invalid Layout Name!';

// wallet
export const LOW_WALLET_BALANCE = 'LOW BALANCE, PLEASE RECHARGE YOUR WALLET!';
// Shipment method slug

export const SHIPMENT_METHOD_SLUG_SELF = 'self_ship';
export const SHIPMENT_METHOD_SLUG_DELHIVERY = 'delhivery';
export const SHIPMENT_METHOD_SLUG_SHIPROCKET = 'shiprocket';
export const SHIPMENT_METHOD_SLUG_SHIPPO = 'shippo';

// delhivery
export const DELHIVERY_ORDER_DETAILS_ERROR_TEXT =
  'Please enter a value greater than zero';

// Minimum order value
export const CHECKOUT_CONDITION_UPDATED_SUCCESS =
  'Checkout condtion updated succesfully';
export const CHECKOUT_CONDITION_UPDATED_FAILED =
  'Checkout condition update failed';
// collection
export const COLLECTION_STATUS_UPDATED = 'Status Updated successfully';
export const COLLECTION_STATUS_UPDATED_FAILED = 'Failed to update status';
export const COLLECTION_DELETED_SUCCESS = 'Collection deleted successfully';
export const COLLECTION_DELETED_FAILED = 'Failed to delete Collection';
export const COLLECTION_ADD_SUCCESS = 'Collection create successfully';
export const COLLECTION_UPDATE_SUCCESS = 'Collection updated successfully';
export const COLLECTION_CREATE_UPDATE_FAILED =
  'some error occurred ,please try again';
export const COLLECTION_PRODUCT_DELETED_SUCCESS = 'deleted successfully';
export const COLLECTION_PRODUCT_DELETED_FAILED = 'Failed to delete !';

export const CURRENCYSYMBOLS = {
  AUD: '$',
  BRL: 'R$',
  CAD: '$',
  CNY: '¥',
  CZK: 'Kč',
  DKK: 'kr',
  EUR: '€', // Euro
  HKD: '$',
  HUF: 'ft',
  ILS: '₪', // Israeli New Sheqel
  INR: '₹', // Indian Rupee
  JPY: '¥', // Japanese Yen
  MYR: 'RM',
  MXN: '$',
  TWD: 'NT$',
  NZD: '$',
  NOK: 'kr',
  PHP: '₱', // Philippine Peso
  PLN: 'zł', // Polish Zloty
  GBP: '£', // British Pound Sterling
  RUB: '₽',
  SGD: '$',
  SEK: 'kr',
  CHF: 'CHF',
  THB: '฿', // Thai Baht
  USD: '$', // US Dollar
};

export const VIDEO_TYPES = ['mp4', 'webm'];
export const PRODUCT_MEDIA_COUNT = 7;
export const VARIANT_MEDIA_COUNT = 4;

// Whatsapp
export const WHATSAPP_NUMBER_STATUS = `You must logout your mobile number before initiating deletion`;
export const WHATSAPP_NUMBER_EXITS = `Your number is already exists!`;
export const WHATSAPP_USERS_EMPTY = `Please select or upload your users`;

// subscription plan
export const PLAN_ONE_WEEK_BEFORE_EXPIRY =
  ' Your Subscription is expiring soon. Please buy new subscription to avoid loosing your sales';
export const PLAN_ON_EXPIRY_DAY =
  ' Your Subscription plan is expiring today. Please Recharge to avoid Account suspension';
export const PLAN_TAX_PERCENT = 18;
// menu
export const MENU_DELETE_FAILED = 'Menu Delete Failed';
export const MENU_DELETE_SUCCESS = 'The menu was successfully deleted.';
export const MENU_ADD_SUCCESS = 'The menu was successfully added.';
export const MENU_ADD_FAILED = 'Menu Add Failed';
export const MENU_THEME_ADD_SUCCESS =
  'The Menu Theme was Successfully Added/Updated';
export const MENU_THEME_ADD_FAILED = 'Menu Theme Add/Update Failed';
export const MENU_UPDATE_SUCCESS = 'The menu was successfully Updated';
export const MENU_UPDATE_FAILED = 'Menu Update Failed';
export const MENU_STATUS_UPDATE_SUCCESS =
  'The Menu Status was Successfully Updated';
export const MENU_STATUS_UPDATE_FAILED = 'Menu Status Update Failed';
export const MENU_ITEMS_EMPTY = 'Please add a menu item';
export const menuType = {
  collection: 'collection',
  category: 'category',
};
export const VIDEO_FORMAT = ['mp4'];

export const PRESET_COLOR = [
  'TRANSPARENT',
  '#D0021B',
  '#F5A623',
  '#F8E71C',
  '#8B572A',
  '#7ED321',
  '#417505',
  '#BD10E0',
  '#9013FE',
  '#4A90E2',
  '#50E3C2',
  '#B8E986',
  '#000000',
  '#4A4A4A',
  '#9B9B9B',
  '#FFFFFF',
];

// clic
export const TENANT_MODE_CLIC = 'Clic';
export const TENANT_MODE_NORMAL = 'Normal';
export const CLIC_UPLOAD_FILE_FORM_PRODUCT = 'PRODUCT';
export const CLIC_UPLOAD_FILE_FORM_SETTINGS = 'SETTINGS';
export const NORMAL_UPLOAD_FILE = 'NORMALTENANT';

// Mode
export const SCREEN_MODE_VIEW = 'VIEW';
export const SCREEN_MODE_EDIT = 'EDIT';
export const SCREEN_MODE_ADD = 'ADD';
export const SCREEN_MODE_DELETE = 'DELETE';

// Button text
export const BUTTON_CREATE_TEXT = 'Create';
export const BUTTON_SAVE_TEXT = 'Submit';
export const BUTTON_CANCEL_TEXT = 'Cancel';
export const BUTTON_DELETE_TEXT = 'Delete';
export const BUTTON_YES_TEXT = 'Yes';
export const BUTTON_NO_TEXT = 'No';

// Product
export const PRODUCT_FEILD_TYPE_INPUT = 'input';
export const PRODUCT_FEILD_TYPE_RADIO = 'radio';
export const PRODUCT_FEILD_TYPE_CHECKBOX = 'checkbox';

export const PRODUCTS_BREAD_TITLE = 'Products';
export const PRODUCT_CREATE_SUCCESS = 'Product Created Successfully';
export const PRODUCT_CREATE_FAILED = 'Product Creation Failed';
export const PRODUCT_CREATE_ERROR = 'Failed to create the product';
export const PRODUCT_UPDATE_SUCCESS = 'Product updated Successfully';
export const PRODUCT_UPDATE_FAILED = 'Product update Failed';
export const PRODUCT_UPDATE_ERROR = 'Failed to update the product';
export const PRODUCT_CHECK_OPTION_FIELD_ERROR =
  'Please select any of the option to save the product';
export const PRODUCT_DELETE_COMFIRM_TEXT =
  'Are you sure you want to delete this product from the list?';
export const PRODUCT_STATUS_LIVE_COMFIRM_TEXT =
  'Are you sure you want to change this product live?';
export const PRODUCT_CHECK_OPTION_LABEL = 'Option to Check';

// Settings
export const SETTINGS_BREAD_TITLE = 'Settings';
export const DOCUMENT_DELETE_COMFIRM_TEXT =
  'Are you sure you want to delete this document from the list?';
export const DOCUMENT_STATUS_COMFIRM_TEXT =
  'Are you sure you want to change this document?';
export const ADD_DOCUMENT_TEXT = 'Add documentation';
export const UPDATE_DOCUMENT_STATUS_SUCCESS =
  'Document status updated successfully';
export const UPDATE_DOCUMENT_STATUS_FAILD = 'Failed to update document status';
export const ANALYTICS_CLEAR_COMFIRM_TEXT =
  'Are you sure want to remove Google analytic Id ?';
export const UPDATE_ANALYTICS_SUCCESS = 'Analytic Id removed successfully';
export const UPDATE_ANALYTICS__ERROR = 'Failed to update the google analytic';

// Bookings
export const BOOKINGS_BREAD_TITLE = 'Bookings';
export const BOOKINGS_SLOTS_BREAD_TITLE = 'Booking Slots';
export const BOOKINGS_DELIVERY_DATES_TEXT =
  'I want to show my delivery dates upto';
export const BOOKINGS_MAX_SLOT_TEXT = 'Maximum orders per slot';
export const SLOT_FORMAT = 'hh:mm A';
export const SETTINGS_DETAILS_PICK = [
  'deliveryslot_management_active',
  'deliveryslot_max_day',
  'deliveryslot_max_day_is_active',
  'deliveryslot_order_processing_time_is_active',
  'deliveryslot_order_processing_time',
  'max_orders_per_slot_is_active',
  'max_orders_per_slot',
];
export const BOOKING_STATUS_WAITING = 'Waiting';

export const BOOKING_STATUS_TABS_VALUES = [
  {
    value: 'Waiting',
    lable: 'Waiting',
  },
  {
    lable: 'Accepted',
    value: 'Accepted',
  },
  {
    lable: 'Cancelled',
    value: 'Cancelled',
  },
];

// Plan
export const SUBSCRIPTION_PLAN_TITLE = 'SUBSCRIPTION PLAN';
export const BILLING_DATE_TITLE = 'BILLING DATE';
export const PAYMENT_METHOD_TITLE = 'PAYMENT METHOD';
export const BILLING_HISTORY_TITLE = 'Billing History';
export const PLAN_AND_BILLING_TITLE = 'Plan and Billing';
export const PLAN_DATE_FORMAT = 'DD/MM/YY';

// wallet
export const WALLET_MANAGEMENT_TIITLE = 'Wallet Management';

// currency
export const CURRENCY_TYPE = 'INR';
export const CURRENCY_LANGUAGE = 'en-IN';
export const ORDER_BY_DESC = 'desc';
export const ORDER_BY_ASCEND = 'ascend';
export const TABLE_PAGINATE_ACTION = 'paginate';

// Leads
export const LEADS_BREAD_TITLE = 'Leads';

// Enquiry
export const ENQUIRY_BREAD_TITLE = 'Enquiry';

// Appearance
export const LAYOUT_TITLE = 'Layout';
export const APPEARANCE_TITLE = 'Appearance';
export const APPEARANCE_DEMO_TITLE = 'Demo';
export const APPEARANCE_UPDATE_LAYOUT_ERROR =
  'Please Save your changes to copy layout';
export const CREATE_APPEARANCE_TITLE = 'Create Appearance Layout';
export const RENAME_APPEARANCE_TITLE = 'Rename Appearance Layout';
export const APPEARANCE_LAYOUT_LIBRARY_TITLE = 'Layout Library';
export const APPEARANCE_LAYOUT_LIBRARY_INFO_TEXT =
  'These layouts are only visible to you. You can switch to another layout by publishing it to your store';
export const BUTTON_COLOR = 'ButtonColor';
export const TEXT_COLOR = 'TextColor';
export const FONT_WEIGHT = 'fontWeight';
export const TEXT_ALIGN = 'textAlign';
export const SIZE = 'size';
export const fontWeightOptions = [
  { value: 'normal', text: 'Normal' },
  { value: 'bold', text: 'Bold' },
];

// Dashboard
export const DASHBOARD_BREAD_TITLE = 'Dashboard';
export const TOP_ENQUIRE_PRODUCTS_TITLE = 'PRODUCTS WITH MOST ENQUIRIES';
export const TOP_PRODUCTS_TITLE = 'TOP PRODUCTS';
export const NUMBER_OF_VISITORS = 'NUMBER OF VISITORS';
export const COMMENTED_POSTS = 'COMMENTED POSTS';
export const NUMBER_OF_ENQUIRING = 'NUMBER OF ENQUIRIES';
export const NUMBER_OF_MESSAGES_TITLE = 'NUMBER OF MESSAGES';
export const STAGES_OF_LEADS_TITLE = 'LEADS PER STAGES';
export const AVERAGE_TIME_OF_CONVERT_TITLE = 'AVERAGE CONVERSION TIME';
export const NUMBER_OF_POSTS_TITLE = 'NUMBER OF POSTS';
export const IN_WHATSAPP_VALUE = 'In Whatsapp';
export const IN_ENQUIR_VALUE = 'In Enquiry';
export const TODAY = 'today';
export const YESTERDAY = 'yesterday';
export const CUSTOM = 'customize';
export const ALL = 'all';
export const LASTWEEK = 'lastweek';
export const LASTMONTH = 'lastmonth';
export const LASTYEAR = 'lastyear';
export const FILTER_VALUES = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'Yesterday',
    value: 'yesterday',
  },
  {
    label: 'Today',
    value: 'today',
  },
  {
    label: 'Last Week',
    value: 'lastweek',
  },
  {
    label: 'Last Month',
    value: 'lastmonth',
  },
  {
    label: 'Last Year',
    value: 'lastyear',
  },
  {
    label: 'Customize',
    value: 'customize',
  },
];
export const FROM_LOGIN = 'LOGIN';
export const FROM_TOKEN = 'TOKEN';
export const CLOSE_TEXT = 'Close';
export const SELECT_TEXT = 'Select';
export const UPLOAD_FORMAT_ERROR = 'Upload the proper file format';

// Select Fliter Type
export const LAST_WEEK_VALUE = 'last_week';
export const CUSTOMIZE_VALUE = 'customize';
export const DETAULT_TIME_PERIOD_COUNT = {
  count: 7,
  timePeriod: 'ordered_day',
};

export const selectOptionData = [
  {
    value: 'yester_day',
    count: 1,
    timePeriod: 'ordered_hour',
    label: 'Yesterday',
  },
  {
    value: 'today',
    count: 1,
    timePeriod: 'ordered_hour',
    label: 'Today',
  },
  {
    value: 'last_week',
    count: 7,
    timePeriod: 'ordered_day',
    label: 'Last Week',
  },
  {
    value: 'last_month',
    count: 30,
    timePeriod: 'ordered_day',
    label: 'Last Month',
  },
  {
    value: 'last_year',
    count: 365,
    timePeriod: 'ordered_month',
    label: 'Last Year',
  },
  {
    value: 'customize',
    label: 'Customize',
  },
];

// kanban
export const ONCE_ORDER_STATUS_IS_CHANGED_TO =
  'Once order status is changed to';
export const CAN_NOT_ABLE_TO_CHANGE_THE_STATUS_TO =
  "can't able to change the status to";
export const CAN_NOT_ABLE_TO_MOVE_CARD_INTO = "Can't able to move card into";
export const VIEW_PAYMENT_PROOF = 'View Payment Proof';

export const LIST_TYPE_GRID = 'grid';
export const SINGLE_ITEM = 'single';
export const FILE_TYPE_IMAGE = 'images';
export const FILE_TYPE_SHEET = 'sheet';

export const CATEGORIES_TYPES = [
  {
    label: 'Category',
    value: 'Category',
  },
  {
    label: 'Sub Category',
    value: 'Sub Category',
  },
  {
    label: 'Sort by',
    value: 'Sort by',
  },
];

export const CAT_FILTER_TYPES = [
  {
    label: 'Category',
    value: 'Category',
  },
  {
    label: 'Sub Category',
    value: 'Sub Category',
  },
];

// Page Builder
export const IMAGE_ACTION_PAGE_VALUE = 'page';
export const IMAGE_ACTION_CATEGORY_VALUE = 'category';
export const IMAGE_ACTION_SUB_CATEGORY_VALUE = 'subCategory';
export const IMAGE_ACTION_PRODUCT_VALUE = 'product';
export const IMAGE_ACTION_LIST = [
  {
    label: 'Open web page',
    value: IMAGE_ACTION_PAGE_VALUE,
  },
  {
    label: 'Open category page',
    value: IMAGE_ACTION_CATEGORY_VALUE,
  },
  {
    label: 'Open sub category page',
    value: IMAGE_ACTION_SUB_CATEGORY_VALUE,
  },
  {
    label: 'Open product page',
    value: IMAGE_ACTION_PRODUCT_VALUE,
  },
];
export const IMAGE_ACTION_PAGE_LABEL = 'Add Web URL';
export const IMAGE_ACTION_CATEGORY_LABEL = 'Select Category';
export const IMAGE_ACTION_SUB_CATEGORY_LABEL = 'Select Sub Category';
export const IMAGE_ACTION_PRODUCT_LABEL = 'Select Product';
export const IMAGE_ACTION_PAGE_ERROR_MESSAGE = 'Please enter the web url';
export const PAGE_BUILDER_UPLOAD = 'page-builder';

const generateSettingTab = (key, title, subTitle, route) => ({
  key,
  title,
  subTitle,
  route,
});

export const SETTINGS_TABS = [
  generateSettingTab('1', 'Profile', 'Edit your brand information', 'profile'),
  generateSettingTab(
    '2',
    'Store Feature',
    `Configure your store's feature`,
    'storeFeature'
  ),
  generateSettingTab(
    '3',
    'Delivery Charges',
    'based on weight, location, and cart price',
    'charges'
  ),
  generateSettingTab(
    '4',
    'Delivery Slots',
    'Customize your delivery slots',
    'slots'
  ),
  generateSettingTab(
    '5',
    'Pages',
    'Customize your documentation pages',
    'documentations'
  ),
  generateSettingTab(
    '6',
    'Footer',
    `Customize your website's footer`,
    'footer'
  ),
  generateSettingTab(
    '7',
    'Integration',
    'Payment, Shipment, and Analytics',
    'integration'
  ),
];

// Settings
export const defaultSocialMedia = [
  {
    social_media_id: 0,
    social_media_status: 'insta_is_active',
    social_media_name: 'instagram_hyperlink',
    social_media_label: 'Instagram',
    image: 'https://zupain-image.s3.ap-south-1.amazonaws.com/instagram.svg',
  },
  {
    social_media_id: 1,
    social_media_status: 'fb_is_active',
    social_media_name: 'facebook_hyperlink',
    social_media_label: 'Facebook',
    image: 'https://zupain-image.s3.ap-south-1.amazonaws.com/facebook-logo.svg',
  },
  {
    social_media_id: 2,
    social_media_status: 'twiter_is_active',
    social_media_name: 'twitter_hyperlink',
    social_media_label: 'Twitter',
    image: 'https://zupain-image.s3.ap-south-1.amazonaws.com/x-logo.svg',
  },
  {
    social_media_id: 3,
    social_media_status: 'youtube_is_active',
    social_media_name: 'youtube_hyperlink',
    social_media_label: 'Youtube',
    image: 'https://zupain-image.s3.ap-south-1.amazonaws.com/youtube-log.svg',
  },
];

export const defaultIsNormalSocialMedia = [
  {
    social_media_id: 0,
    social_media_status: 'whatsapp_is_active',
    social_media_name: 'whatsapp_hyperlink',
    social_media_label: 'Whatsapp',
    image: 'https://zupain-image.s3.ap-south-1.amazonaws.com/whatsapp-logo.svg',
  },
  {
    social_media_id: 1,
    social_media_status: 'linkedin_is_active',
    social_media_name: 'linkedin_hyperlink',
    social_media_label: 'Linkedin',
    image: 'https://zupain-image.s3.ap-south-1.amazonaws.com/linkedin-logo.svg',
  },
];

export const DELIVERY_CHARGE_INFO =
  'Only the lowest value will be applied, ensuring savings and convenience for both you and your customers.';

// Gupshup
export const GUPSHUP_PARTNER_APP_TITLE = 'Whatsapp business account';
export const GUPSHUP_PARTNER_TEMPLATE_TITLE = 'Whatsapp Templates';
export const GUPSHUP_PARTNER_TEMPLATE_MESSAGE_TITLE =
  'Whatsapp Message Analytics';
export const GUPSHUP_PARTNER_STATUS_CONFIRM =
  'Already an app is active, are you sure to change the status';
export const GUPSHUP_PARTNER_STATUS_WARNING =
  'Atleast one app should be active, so cannot able to change the status';
export const GUPSHUP_PARTNER_ACTIVE_COMFIRM_TEXT =
  'Are you sure you want to change the template status?';
export const GUPSHUP_TEMPLATE_TO_APPROVE_SCCESSS_MESSAGE =
  'Your template has been moved to the pending stage for approval.';
export const GUPSHUP_TEMPLATE_DEFAULT_ALREADY_MESSAGE =
  "Template has requested for Approval, so can't able to edit";
export const GUPSHUP_TEMPLATE_DEFAULT_EDIT_MESSAGE =
  'This template content not used and go to approve template';
export const GUPSHUP_PARTNER_APPROVE_COMFIRM_TEXT =
  'Are you sure to send request to get approval for this Template';
export const GUPSHUP_TEMPLATE_STATUS_DEFAULT = 'DEFAULT';
export const GUPSHUP_TEMPLATE_STATUS_ALL = 'ALL';
export const GUPSHUP_TEMPLATE_STATUS_DRAFT = 'DRAFT';
export const GUPSHUP_TEMPLATE_STATUS_PENDING = 'PENDING';
export const GUPSHUP_TEMPLATE_STATUS_APPROVED = 'APPROVED';
export const GUPSHUP_TEMPLATE_STATUS_REJECTED = 'REJECTED';
export const GUPSHUP_MESSAGE_ENQUEUED_STATUS = 'ENQUEUED';
export const GUPSHUP_MESSAGE_SENT_STATUS = 'SENT';
export const GUPSHUP_MESSAGE_DELIVERED_STATUS = 'DELIVERED';
export const GUPSHUP_MESSAGE_READ_STATUS = 'READ';
export const GUPSHUP_MESSAGE_MISMATCH_STATUS = 'MISMATCH';
export const GUPSHUP_MESSAGE_FAILED_STATUS = 'FAILED';
export const MESSAGE_SENT_TEXT = 'Messages Sent';
export const MESSAGE_DELIVERED_TEXT = 'Messages Delivered';
export const MESSAGE_READ_TEXT = 'Messages Read';
export const MESSAGE_FAILED_TEXT = 'Messages Failed';
export const TEMPLATE_STATUS_COUNT_TITLE = 'Template Engagement';
export const TEMPLATE_STATUS_COUNT_INFO_TEXT = 'Message delivery trendline';
export const MESSAGE_STATUS_COUNT_TITLE = 'Messages Count';
export const MESSAGE_STATUS_COUNT_INFO_TEXT =
  'Read rate shows the ratio of Read count by Sent count';
export const MESSAGE_CATEGORY_COUNT_TITLE = 'Conversation Count by Category';
export const MESSAGE_CATEGORY_COUNT_INFO_TEXT =
  'Conversation count will not always match with Template sent count because templates can also be sent during the coversation session window.';

export const GUPSHUP_TEMPLATE_DEFAULT_ADD_CARD = {
  image:
    'https://images-zupain.s3.amazonaws.com/04-01-2024-06-43-51-992-5120x5120-template-vector-icon.jpg',
  text: 'Click Here Add New Template',
};

export const DOWNLOAD_PDF_MENU_ITEM = 'Download PDF';
export const DOWNLOAD_EXCEL_MENU_ITEM = 'Download Excel';
export const DOWNLOAD_IMAGE_MENU_ITEM = 'Download Image';
export const MESSAGE_DOWNLOAD_FROM_TABLE = 'Table';
export const MESSAGE_DOWNLOAD_FROM_LINE = 'Line';
export const MESSAGE_DOWNLOAD_FROM_DOUGHNUT = 'Doughnut';
export const DOWNLOAD_EXCEL_FAILED_MESSAGE = 'Failed download excel file.';

export const MESSAGES_COUNT_LIST = [
  {
    dataIndex: 'sent_count',
    key: 'Sent Count',
    text: MESSAGE_SENT_TEXT,
    info_text: `Total ${MESSAGE_SENT_TEXT}`,
    card_classname: 'send-card-container',
  },
  {
    dataIndex: 'delivered_count',
    key: 'Delivered Count',
    text: MESSAGE_DELIVERED_TEXT,
    info_text: `Total ${MESSAGE_DELIVERED_TEXT}`,
    card_classname: 'delivered-card-container',
  },
  {
    dataIndex: 'read_count',
    key: 'Read Count',
    text: MESSAGE_READ_TEXT,
    info_text: `Total ${MESSAGE_READ_TEXT}`,
    card_classname: 'read-card-container',
  },
  {
    dataIndex: 'failed_count',
    key: 'Failed Count',
    text: MESSAGE_FAILED_TEXT,
    info_text: `Total ${MESSAGE_FAILED_TEXT}`,
    card_classname: 'failed-card-container',
  },
];

export const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const PROMPTS = [
  'Remove the background',
  'Change into green color',
  'City skyline with tall buildings',
  'Change background to a snowy winter',
  'Starry night sky and a crescent moon',
  'Blur effect for a professional look',
  'Insert a nature scene or cityscape',
  'Gradient background with two or more colors',
  'Change background with a pattern, like stripes, polka dots, or chevrons',
];

export const PHOTOROOMTUTORIALVIDEO =
  'https://images-zupain.s3.amazonaws.com/02-01-2024-13-54-12-896-WhatsApp%20Video%202023-12-30%20at%206.20.18%20PM.mp4';
