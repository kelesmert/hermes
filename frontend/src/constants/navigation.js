import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PrecisionManufacturingOutlinedIcon from '@mui/icons-material/PrecisionManufacturingOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';

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
    label: 'İş Emirleri',
    path: '/production',
    icon: AssignmentTurnedInOutlinedIcon,
    permission: 'production.read',
  },
  {
    label: 'Duruşlar',
    path: '/downtimes',
    icon: PauseCircleOutlineIcon,
    permission: ['work_orders.execute', 'production.manage'],
  },
  {
    label: 'Kullanıcılar',
    path: '/users',
    icon: PeopleAltOutlinedIcon,
    permission: 'users.manage',
  },
  {
    label: 'Monitoring',
    path: '/monitoring',
    icon: SensorsOutlinedIcon,
    permission: 'dashboard.read',
  },
  {
    label: 'Makineler',
    path: '/machines',
    icon: PrecisionManufacturingOutlinedIcon,
    permission: 'machines.read',
  },
  {
    label: 'Parçalar',
    path: '/parts',
    icon: CategoryOutlinedIcon,
    permission: 'parts.read',
  },
  {
    label: 'Simülasyonlar',
    path: '/simulations',
    icon: ScienceOutlinedIcon,
    permission: 'production.manage',
  },
];
