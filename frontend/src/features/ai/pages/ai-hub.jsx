import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import { fetchAiInsights } from '@/lib/api/ai-api.js';
import { fetchMachines } from '@/features/machines/services/machines-api.js';
import { formatDate, formatDateTime } from '@/lib/date-format.js';

const USE_CASE_LABELS = {
  'oee-insight': 'OEE Insight',
  'downtime-reason': 'Durus Reason',
  'anomaly-risk': 'Anomali Risk',
};

const USE_CASE_ROUTE = {
  'oee-insight': '/reports',
  'downtime-reason': '/downtimes',
  'anomaly-risk': '/monitoring',
};

const buildWindowLabel = (window) => {
  if (!window) return '-';
  if (window.mode === 'shift') {
    return `Shift ${window.shiftDateYmd || '-'}`;
  }
  if (window.mode === 'range') {
    const fromLabel = window.fromMs ? formatDate(new Date(window.fromMs)) : '-';
    const toLabel = window.toMs ? formatDate(new Date(window.toMs)) : '-';
    return `${fromLabel} -> ${toLabel}`;
  }
  return '-';
};

const buildMachineMap = (machines) => {
  const map = new Map();
  (machines || []).forEach((machine) => {
    const id = machine.id || machine._id;
    if (!id) return;
    const label = machine.name || machine.code || String(id);
    map.set(String(id), label);
  });
  return map;
};

const UseCaseCard = ({ title, description, statusLabel, route, icon: Icon, tone }) => (
  <Card
    sx={{
      borderRadius: 2,
      border: '1px solid',
      borderColor: (theme) => alpha(theme.palette.divider, 0.6),
      boxShadow: 'none',
      height: '100%',
    }}
  >
    <CardContent>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: (theme) => alpha(theme.palette[tone].main, 0.15),
              color: (theme) => theme.palette[tone].main,
            }}
          >
            <Icon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {title}
            </Typography>
            <Chip size="small" label={statusLabel} color={tone} variant="outlined" />
          </Box>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
        <Button
          component={NavLink}
          to={route}
          variant="contained"
          color={tone}
          size="small"
          sx={{ alignSelf: 'flex-start' }}
        >
          Sayfaya Git
        </Button>
      </Stack>
    </CardContent>
  </Card>
);

const InsightCard = ({ insight, machineLabel }) => {
  const summary = insight?.output?.summary || 'Ozet bulunamadi.';
  const highlight = insight?.output?.highlights?.[0];
  const actionTitle = insight?.output?.actions?.[0]?.title;
  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: 2, borderColor: (theme) => alpha(theme.palette.divider, 0.7) }}
    >
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {USE_CASE_LABELS[insight.useCase] || insight.useCase}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {machineLabel} · {buildWindowLabel(insight.window)} · {insight.source || '-'}
              </Typography>
            </Box>
            <Chip size="small" label={formatDateTime(insight.generatedAt)} />
          </Stack>
          <Typography variant="body2">{summary}</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {highlight ? <Chip size="small" label={highlight} variant="outlined" /> : null}
            {actionTitle ? <Chip size="small" label={actionTitle} color="primary" variant="outlined" /> : null}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

const AiHubPage = () => {
  const insightsQuery = useQuery({
    queryKey: ['aiInsights', 'latest', 20],
    queryFn: () => fetchAiInsights({ limit: 20 }),
    staleTime: 15000,
  });

  const machinesQuery = useQuery({
    queryKey: ['machines', 'ai-hub'],
    queryFn: fetchMachines,
    staleTime: 60000,
  });

  const machineMap = useMemo(() => buildMachineMap(machinesQuery.data), [machinesQuery.data]);

  const insights = insightsQuery.data || [];
  const isLoading = insightsQuery.isLoading || machinesQuery.isLoading;
  const hasError = insightsQuery.isError || machinesQuery.isError;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={3}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <AutoAwesomeOutlinedIcon color="primary" />
            <Typography variant="h4" fontWeight={700}>
              AI Asistani
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Son 20 analiz gosteriliyor. Filtreler (kaynak, makine, tarih) daha sonra eklenecek.
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <UseCaseCard
              title="U1 - OEE Insight"
              description="OEE ozetleri, kayip analizi ve operator yorumu."
              statusLabel="Aktif"
              route="/reports"
              icon={InsightsOutlinedIcon}
              tone="primary"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <UseCaseCard
              title="U2 - Durus Reason"
              description="Plansiz duruslar icin reason onerileri."
              statusLabel="Hazirlaniyor"
              route="/downtimes"
              icon={PauseCircleOutlineIcon}
              tone="warning"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <UseCaseCard
              title="U3 - Anomali Risk"
              description="Canli izleme icin risk uyarisi ve anomali tespiti."
              statusLabel="Hazirlaniyor"
              route="/monitoring"
              icon={SensorsOutlinedIcon}
              tone="info"
            />
          </Grid>
        </Grid>

        <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Son AI Analizleri</Typography>
                <Chip label={`${insights.length} kayit`} size="small" />
              </Stack>
              <Divider />
              {hasError ? (
                <Alert severity="error" variant="outlined">
                  Analizler yuklenemedi. Lutfen daha sonra tekrar deneyin.
                </Alert>
              ) : null}
              {isLoading ? (
                <Stack alignItems="center" py={4}>
                  <CircularProgress size={32} />
                </Stack>
              ) : null}
              {!isLoading && !hasError && insights.length === 0 ? (
                <Alert severity="info" variant="outlined">
                  Henuz analiz kaydi bulunmuyor.
                </Alert>
              ) : null}
              {!isLoading && !hasError && insights.length > 0 ? (
                <Stack spacing={2}>
                  {insights.map((insight) => {
                    const machineLabel = insight.machineId
                      ? machineMap.get(String(insight.machineId)) || String(insight.machineId)
                      : 'Makine yok';
                    return (
                      <InsightCard
                        key={insight._id}
                        insight={insight}
                        machineLabel={machineLabel}
                      />
                    );
                  })}
                </Stack>
              ) : null}
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: 2,
            boxShadow: 'none',
            border: '1px dashed',
            borderColor: (theme) => alpha(theme.palette.text.primary, 0.2),
            opacity: 0.6,
          }}
        >
          <CardContent>
            <Typography variant="h6">Kullanim Istatistikleri (Yakinda)</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Token kullanimi ve limit durumu daha sonra eklenecek.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default AiHubPage;
