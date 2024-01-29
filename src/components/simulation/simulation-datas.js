const items = [
  {
    key: 'sub1',
    label: 'All',
    id: 1,
  },
  {
    key: 'sub2',
    label: 'Design',
    id: 11,
    children: [
      { key: '3', label: 'Customise appearance' },
      { key: '4', label: 'Delete appearance' },
    ],
  },
  {
    key: 'sub3',
    label: 'Product',
    children: [
      { key: '5', label: 'Add product' },
      { key: '6', label: 'Edit product' },
      { key: '7', label: 'Delete product' },
      { key: '8', label: 'Bulk upload' },
      { key: '9', label: 'Push and pull products from social media' },
    ],
  },
  {
    key: 'sub4',
    label: 'Category',
    children: [
      { key: '10', label: 'Add category and subcategory' },
      { key: '11', label: 'Edit category and subcategory' },
      { key: '12', label: 'Delete category and subcategory' },
    ],
  },
  {
    key: 'sub5',
    label: 'Orders',
    children: [{ key: '13', label: 'Manage orders' }],
  },
  {
    key: 'sub6',
    label: 'Store management',
    children: [
      { key: '14', label: 'Create coupons' },
      { key: '15', label: 'Manage delivery charges' },
      { key: '16', label: 'My search enquiries' },
    ],
  },
  {
    key: 'sub7',
    label: 'Payment',
    children: [
      { key: '17', label: 'Connect phonepay' },
      { key: '18', label: 'Connect Mobile UPI pay' },
      { key: '19', label: 'Connect stripe' },
      { key: '20', label: 'Connect cash on delivery' },
    ],
  },
  {
    key: 'sub8',
    label: 'Shipment',
    children: [
      { key: '21', label: 'Connect shiprocket' },
      { key: '22', label: 'Connect delhivery' },
      { key: '23', label: 'Connect self-shipping' },
    ],
  },
  {
    key: 'sub9',
    label: 'Domain',
    children: [{ key: '24', label: 'Create own domain using Godaddy' }],
  },
  {
    key: 'sub10',
    label: 'Social Media Integration',
    children: [
      { key: '25', label: 'Connect Facebook/Instagram' },
      { key: '26', label: 'Connect Whatsapp' },
    ],
  },
];

export default items;
