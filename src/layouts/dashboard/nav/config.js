// component
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const navConfig = [
  {
    title: 'dashboard',
    path: '/dashboard/app',
    icon: icon('ic_analytics'),
  },
  {
    title: 'Book Management',
    path: '/dashboard/categories',
    icon: icon('ic_cart'),
  },
  // {
  //   title: 'orders',
  //   path: '/dashboard/orders',
  //   icon: icon('ic_user'),
  // },
  {
    title: 'Order History',
    path: '/dashboard/order-histroy',
    icon: icon('layer'),
  },

  // {
  //   title: 'Categories',
  //   path: '/dashboard/blog',
  //   icon: icon('layer'),
  // },
  // {
  //   title: 'Add Districts',
  //   path: '/dashboard/districts',
  //   icon: icon('pincode'),
  // },
  // {
  //   title: 'Settings',
  //   path: '/dashboard/settings',
  //   icon: icon('setting'),
  // },
  // {
  //   title: 'login',
  //   path: '/login',
  //   icon: icon('ic_lock'),
  // },
  // {
  //   title: 'Not found',
  //   path: '/404',
  //   icon: icon('ic_disabled'),
  // },
];

export default navConfig;
