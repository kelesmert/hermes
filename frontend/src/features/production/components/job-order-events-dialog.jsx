import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { fetchJobOrderEvents } from '@/features/production/services/job-orders-api.js';
import { EVENT_TYPE_LABELS } from '@/features/production/constants/job-order.js';

const formatDate = (value) => {
  if (!value) return '-';
  try {
    return format(new Date(value), 'dd.MM.yyyy HH:mm', { locale: tr });
  } catch (error) {
    return value;
  }
};

const JobOrderEventsDialog = ({ open, jobOrder, onClose }) => {
  const jobOrderId = jobOrder?.id || jobOrder?._id;

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['jobOrderEvents', jobOrderId],
    queryFn: () => fetchJobOrderEvents(jobOrderId),
    enabled: open && Boolean(jobOrderId),
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{jobOrder ? `${jobOrder.orderNo || jobOrder.id} - Olaylar` : 'Olaylar'}</span>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">Yükleniyor...</Typography>
          </Box>
        ) : events.length === 0 ? (
          <Typography color="text.secondary">Henüz kayıt bulunmuyor.</Typography>
        ) : (
          <Stack spacing={2}>
            {events.map((event, index) => (
              <Box key={event.id || index}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                  <Chip
                    size="small"
                    label={EVENT_TYPE_LABELS[event.eventType] || event.eventType}
                    color={event.eventType === 'defect' ? 'error' : 'default'}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(event.timestamp)}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {event.quantity ? `${event.quantity} adet` : ''}
                  {event.qualityStatus === 'defective' && event.defectType
                    ? ` · Hata: ${event.defectType}`
                    : ''}
                </Typography>
                {event.notes && (
                  <Typography variant="body2" color="text.secondary">
                    {event.notes}
                  </Typography>
                )}
                {index < events.length - 1 && <Divider sx={{ mt: 1.5 }} />}
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Tooltip title="Kapat">
          <Button onClick={onClose}>Kapat</Button>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
};

JobOrderEventsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  jobOrder: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

JobOrderEventsDialog.defaultProps = {
  jobOrder: null,
};

export default JobOrderEventsDialog;
