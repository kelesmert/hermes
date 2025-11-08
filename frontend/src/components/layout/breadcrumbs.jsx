import { Breadcrumbs, Link, Typography } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const BreadcrumbsNav = () => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
      <Link component={RouterLink} color="inherit" to="/dashboard">
        Ana Sayfa
      </Link>
      {segments.map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join('/')}`;
        const label = segment.charAt(0).toUpperCase() + segment.slice(1);
        const isLast = index === segments.length - 1;

        if (isLast) {
          return (
            <Typography key={path} color="text.primary">
              {label}
            </Typography>
          );
        }

        return (
          <Link component={RouterLink} color="inherit" to={path} key={path}>
            {label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};

export default BreadcrumbsNav;
