import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PrecisionManufacturingOutlinedIcon from '@mui/icons-material/PrecisionManufacturingOutlined';

export const NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: DashboardOutlinedIcon,
    permission: 'dashboard.read',
  },
  {
    label: 'Raporlar',
    path: '/reports',
    icon: AssessmentOutlinedIcon,
    permission: 'reports.read',
  },
  {
    label: 'Kullanıcılar',
    path: '/users',
    icon: PeopleAltOutlinedIcon,
    permission: 'users.manage',
  },
  {
    label: 'Makineler',
    path: '/machines',
    icon: PrecisionManufacturingOutlinedIcon,
    permission: 'machines.read',
  },
];
