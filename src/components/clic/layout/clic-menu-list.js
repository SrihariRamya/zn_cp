import { MessageOutlined } from '@ant-design/icons';
import { ReactComponent as CilcSettings } from '../../../assets/icons/clic/clic-setting.svg';
import { ReactComponent as ClicAppearance } from '../../../assets/icons/clic/clic-appearance.svg';
import { ReactComponent as ClicProducts } from '../../../assets/icons/clic/clic-products.svg';
import { ReactComponent as ClicPlan } from '../../../assets/icons/clic/clic-plan.svg';
import { ReactComponent as ClicWallet } from '../../../assets/icons/clic/clic-wallet.svg';
import { ReactComponent as ClicDashboard } from '../../../assets/icons/clic/clic-dashboard.svg';
import { ReactComponent as ClicLeads } from '../../../assets/icons/clic/clic-leads.svg';
import { ReactComponent as ClicBooking } from '../../../assets/icons/clic/clic-booking.svg';
import { ReactComponent as ClicEnquiry } from '../../../assets/icons/clic/clic-enquiry.svg';

const clicMenuData = [
  {
    key: 'dashboard',
    name: 'Dashboard',
    linkURL: '/dashboard',
    icon: ClicDashboard,
  },
  {
    key: 'appearance',
    name: 'Appearance',
    linkURL: '/appearance',
    icon: ClicAppearance,
  },
  {
    key: 'Settings',
    name: 'Page Builder',
    linkURL: '/page-builder',
    icon: ClicAppearance,
  },
  {
    key: 'products',
    name: 'Products',
    linkURL: '/products',
    icon: ClicProducts,
  },
  {
    key: 'plan',
    name: 'Plan',
    linkURL: '/plan',
    icon: ClicPlan,
  },
  {
    key: 'wallet',
    name: 'Wallet',
    linkURL: '/wallet',
    icon: ClicWallet,
  },
  {
    key: 'social-leads',
    name: 'Social Leads',
    linkURL: '/social-leads',
    icon: ClicLeads,
  },
  {
    key: 'whatsapp',
    name: 'WhatsApp Tool',
    linkURL: '/whatsapp',
    icon: MessageOutlined,
    role: 'tenant_admin',
  },
  {
    key: 'bookings',
    name: 'Bookings',
    linkURL: '/bookings',
    icon: ClicBooking,
  },
  {
    key: 'enquiry-leads',
    name: 'Enquiry Leads',
    linkURL: '/enquiry-leads',
    icon: ClicEnquiry,
  },
  {
    key: 'settings',
    name: 'Settings',
    linkURL: '/settings',
    icon: CilcSettings,
  },
  {
    key: 'Settings',
    name: 'Whatsapp business',
    linkURL: '/gupshup',
    icon: MessageOutlined,
  },
];
export default clicMenuData;
