import {
  FileExcelOutlined,
  PicRightOutlined,
  ScheduleOutlined,
  // FormOutlined,
  IdcardOutlined,
  MessageOutlined,
  RadiusSettingOutlined,
  UnorderedListOutlined,
  // IdcardOutlined,
  LineChartOutlined,
  PictureOutlined,
  ProjectOutlined,
} from '@ant-design/icons';
import { ReactComponent as Categories } from '../../assets/icons/categorie.svg';
import { ReactComponent as Product } from '../../assets/icons/product.svg';
import { ReactComponent as Order } from '../../assets/icons/order.svg';
import { ReactComponent as Store } from '../../assets/icons/store.svg';
import { ReactComponent as Dashboard } from '../../assets/icons/dashboard.svg';
import { ReactComponent as Customer } from '../../assets/icons/customer.svg';
import { ReactComponent as User } from '../../assets/icons/user.svg';
import { ReactComponent as Coupon } from '../../assets/icons/coupon.svg';
import { ReactComponent as Search } from '../../assets/icons/search.svg';
import { ReactComponent as Settings } from '../../assets/icons/settings.svg';
import { ReactComponent as PlansAndWallet } from '../../assets/icons/plan-and-wallet.svg';

const menuData = [
  {
    key: 'Dashboard',
    name: 'Dashboard',
    linkURL: '/dashboard',
    icon: Dashboard,
  },
  {
    key: 'Order',
    name: 'Orders',
    linkURL: '/orders',
    icon: Order,
  },
  {
    key: 'Product',
    name: 'Products',
    linkURL: '/products',
    icon: Product,
    subMenu: [
      {
        key: 'collections',
        name: 'Menu',
        linkURL: '/menu',
      },
      {
        key: 'Inventory',
        name: 'Inventory',
        linkURL: '/inventory',
        icon: Store,
        role: 'store_admin',
      },
    ],
  },
  {
    key: 'Store',
    name: 'Stores',
    linkURL: '/stores',
    icon: Store,
    role: 'tenant_admin',
  },
  {
    key: 'Category',
    name: 'Categories',
    linkURL: '/categories',
    icon: Categories,
  },
  {
    key: 'Settings',
    name: 'Plans & Wallet',
    linkURL: '/plan',
    icon: PlansAndWallet,
  },
  // {
  //   key: 'Pos',
  //   name: 'POS',
  //   linkURL: '/pos',
  //   icon: Pos,
  //   role: 'tenant_admin',
  // },
  // {
  //   key: 'Pos User',
  //   name: 'POS Users',
  //   linkURL: '/pos-users',
  //   icon: UserSwitchOutlined,
  //   role: 'store_admin',
  // },
  {
    key: 'Customer',
    name: 'Customers',
    linkURL: '/customers',
    icon: Customer,
    role: 'tenant_admin',
    subMenu: [
      {
        key: 'Customer Engagement',
        name: 'Customer Engagement',
        linkURL: '/customer-engagement',
      },
      {
        key: 'User',
        name: 'Users',
        linkURL: '/users',
        icon: User,
      },
      {
        key: 'Product Search',
        name: 'Search Enquiries',
        linkURL: '/search-enquiries',
        icon: Search,
      },
    ],
  },
  // {
  //   key: 'Customer',
  //   name: 'Zupain Select',
  //   linkURL: '/zupain-select-customer',
  //   icon: FormOutlined,
  //   role: 'tenant_admin',
  //   // subMenu: [
  //   //   {
  //   //     key: 'Select',
  //   //     name: 'Zupain Select',
  //   //     linkURL: '/zupain-select-customer',
  //   //   },
  //   // ],
  // },
  // {
  //   key: 'Settings',
  //   name: 'Wallet',
  //   linkURL: '/wallet',
  //   icon: WalletOutlined,
  // },
  // {
  //   key: 'Delivery Charge',
  //   name: 'Delivery Charges',
  //   linkURL: '/delivery-charge',
  //   icon: Charges,
  // },
  {
    key: 'Coupon',
    name: 'Coupons',
    linkURL: '/coupons',
    icon: Coupon,
  },
  {
    key: 'Settings',
    name: 'Social Leads',
    linkURL: '/social-leads',
    icon: IdcardOutlined,
    subMenu: [
      {
        key: 'WhatsApp Tool',
        name: 'WhatsApp Tool',
        linkURL: '/whatsapp',
        icon: MessageOutlined,
        role: 'tenant_admin',
      },
      {
        key: 'Reports',
        name: 'Reports',
        linkURL: '/reports',
        icon: FileExcelOutlined,
      },
    ],
  },
  {
    key: 'Settings',
    name: 'Appearance',
    linkURL: '/appearance',
    icon: PicRightOutlined,
    subMenu: [
      {
        key: 'Settings',
        name: 'Page Builder',
        linkURL: '/page-builder',
        icon: PicRightOutlined,
        new: true,
      },
      {
        key: 'Settings',
        name: 'Theme Builder',
        linkURL: '/theme-builder',
        icon: ProjectOutlined,
        role: 'tenant_admin',
      },
    ],
  },
  {
    key: 'Settings',
    name: 'Settings',
    linkURL: '/settings',
    icon: Settings,
    role: 'tenant_admin',
    subMenu: [
      {
        key: 'Minimum Order Value',
        name: 'B2B Setup',
        linkURL: '/b2b-setup',
        icon: RadiusSettingOutlined,
      },
      {
        key: 'Settings',
        name: 'Social Media Performance',
        linkURL: '/social-media-performance',
        icon: PictureOutlined,
      },
      {
        key: 'Settings',
        name: 'Privacy Policy',
        linkURL: '/privacy-policy',
        icon: UnorderedListOutlined,
      },
      {
        key: 'Settings',
        name: 'Analytics',
        linkURL: '/analytics',
        icon: LineChartOutlined,
        role: 'tenant_admin',
      },
    ],
  },
  {
    key: 'Campaign',
    name: 'Campaign',
    linkURL: '/campaign',
    icon: ScheduleOutlined,
    role: 'tenant_admin',
  },
  {
    key: 'Settings',
    name: 'Whatsapp business',
    linkURL: '/gupshup',
    icon: MessageOutlined,
    role: 'tenant_admin',
  },
];

export default menuData;
