import { Card, CardContent, Typography } from '@mui/material';

const ReportsPage = () => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Raporlama Modülü (Yolda)
      </Typography>
      <Typography color="text.secondary">
        Bu alan, makine verimliliği ve duruş süreleri için agregasyon sonuçlarını gösterecek. Backend
        endpointleri hazır olduğunda tablo, filtre ve export bileşenleri burada yer alacak.
      </Typography>
    </CardContent>
  </Card>
);

export default ReportsPage;
