import { Card, CardContent, Typography } from '@mui/material';

const UsersPage = () => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Kullanıcı Yönetimi (Yolda)
      </Typography>
      <Typography color="text.secondary">
        RBAC gereksinimlerine uygun kullanıcı/rol yönetimi bu ekranda uygulanacak. Yetkili kullanıcılar
        listeleme, rol atama ve pasif etme işlemlerini buradan gerçekleştirecek.
      </Typography>
    </CardContent>
  </Card>
);

export default UsersPage;
