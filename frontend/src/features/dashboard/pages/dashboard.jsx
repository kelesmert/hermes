import { Card, CardContent, Grid, Typography } from '@mui/material';

const metrics = [
  { label: 'Aktif Makineler', value: '12', caption: 'Son 15 dk' },
  { label: 'Toplam Duruş', value: '3', caption: 'Bugün' },
  { label: 'Uyarılar', value: '2', caption: 'Anlık' },
];

const DashboardPage = () => (
  <Grid container spacing={3}>
    {metrics.map((metric) => (
      <Grid item xs={12} sm={6} md={4} key={metric.label}>
        <Card>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              {metric.label}
            </Typography>
            <Typography variant="h4" sx={{ my: 1 }}>
              {metric.value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {metric.caption}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

export default DashboardPage;
