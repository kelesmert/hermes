import PropTypes from 'prop-types';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { createDowntimeReasonInsight } from '@/lib/api/ai-api.js';
import { formatDateTime } from '@/lib/date-format.js';

const buildSkipMessage = (reason) => {
  if (reason === 'open_downtime') return 'Duruş kapanmadığı için analiz yapılmadı.';
  if (reason === 'missing_reason') return 'Reason seçilmediği için analiz yapılmadı.';
  if (reason === 'planned_reason') return 'Planlı duruş için analiz kapalı.';
  return 'Analiz için uygun veri bulunamadı.';
};

const DowntimeAiDialog = ({ open, downtime, onClose }) => {
  const downtimeId = downtime?.id || downtime?._id;
  const isClosed = Boolean(downtime?.endedAt);

  const [state, setState] = useState({
    loading: false,
    error: null,
    skipped: null,
    insight: null,
  });

  const machineLabel = useMemo(() => {
    if (!downtime?.machine) return '-';
    if (typeof downtime.machine === 'string') return downtime.machine;
    return downtime.machine.name || downtime.machine.code || '-';
  }, [downtime]);

  const fetchInsight = (forceRefresh = false) => {
    if (!downtimeId) return;
    setState({ loading: true, error: null, skipped: null, insight: null });
    createDowntimeReasonInsight({ downtimeId, forceRefresh })
      .then((response) => {
        if (response?.skipped) {
          setState({
            loading: false,
            error: null,
            skipped: response.reason || 'unknown',
            insight: null,
          });
          return;
        }
        setState({
          loading: false,
          error: null,
          skipped: null,
          insight: response?.insight || null,
        });
      })
      .catch((error) => {
        const message = error?.response?.data?.message || error?.message || 'AI analizi alinmadi.';
        setState({ loading: false, error: message, skipped: null, insight: null });
      });
  };

  useEffect(() => {
    if (!open || !downtimeId) return;
    fetchInsight(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, downtimeId]);

  const summary = state.insight?.output?.summary || '-';
  const patterns = state.insight?.output?.patterns || state.insight?.output?.highlights || [];
  const actions = state.insight?.output?.actions || [];
  const warnings = state.insight?.output?.warnings || [];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>AI Duruş Analizi</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2">Makine</Typography>
            <Typography variant="body2" color="text.secondary">
              {machineLabel}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2">Reason</Typography>
            <Typography variant="body2" color="text.secondary">
              {downtime?.reasonCode || '-'}
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Box>
              <Typography variant="subtitle2">Başlangıç</Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDateTime(downtime?.startedAt)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">Bitiş</Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDateTime(downtime?.endedAt)}
              </Typography>
            </Box>
          </Stack>

          {!isClosed && (
            <Alert severity="info">
              Duruş kapanmadığı için analiz yapılmaz. Kapanıştan sonra tekrar deneyin.
            </Alert>
          )}

          {state.loading && (
            <Typography variant="body2" color="text.secondary">
              AI analizi hazirlaniyor...
            </Typography>
          )}

          {!state.loading && state.error && <Alert severity="error">{state.error}</Alert>}

          {!state.loading && state.skipped && (
            <Alert severity="warning">{buildSkipMessage(state.skipped)}</Alert>
          )}

          {!state.loading && !state.error && !state.skipped && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2">Özet</Typography>
                <Typography variant="body2" color="text.secondary">
                  {summary}
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="subtitle2">Patternlar</Typography>
                {patterns.length ? (
                  <Stack spacing={0.5}>
                    {patterns.map((item, index) => (
                      <Typography key={`${item}-${index}`} variant="body2" color="text.secondary">
                        - {item}
                      </Typography>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Pattern bulunamadi.
                  </Typography>
                )}
              </Box>
              <Divider />
              <Box>
                <Typography variant="subtitle2">Önerilen Aksiyonlar</Typography>
                {actions.length ? (
                  <Stack spacing={0.5}>
                    {actions.map((action, index) => (
                      <Typography key={`${action.title}-${index}`} variant="body2" color="text.secondary">
                        - {action.title}: {action.reason}
                      </Typography>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Aksiyon önerisi yok.
                  </Typography>
                )}
              </Box>
              {warnings.length > 0 && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2">Uyarılar</Typography>
                    <Stack spacing={0.5}>
                      {warnings.map((warn, index) => (
                        <Typography key={`${warn}-${index}`} variant="body2" color="text.secondary">
                          - {warn}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                </>
              )}
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Kapat</Button>
        <Button
          variant="contained"
          disabled={!downtimeId || state.loading || !isClosed}
          onClick={() => fetchInsight(true)}
        >
          Yeniden Analiz
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DowntimeAiDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  downtime: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default DowntimeAiDialog;
