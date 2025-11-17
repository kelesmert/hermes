export const JOB_ORDER_STATUS_CONFIG = {
  pending: { label: 'Beklemede', color: 'default' },
  in_progress: { label: 'Çalışıyor', color: 'success' },
  paused: { label: 'Duraklatıldı', color: 'warning' },
  completed: { label: 'Tamamlandı', color: 'primary' },
  cancelled: { label: 'İptal Edildi', color: 'default' },
};

export const QUALITY_OPTIONS = [
  { value: 'good', label: 'Sağlam Ürün' },
  { value: 'defective', label: 'Hatalı Ürün' },
];

export const DEFECT_OPTIONS = [
  { value: 'scratch', label: 'Çizik' },
  { value: 'dimension_error', label: 'Ölçü Hatası' },
  { value: 'incomplete', label: 'Eksik Üretim' },
  { value: 'other', label: 'Diğer' },
];

export const EVENT_TYPE_LABELS = {
  created: 'Oluşturuldu',
  updated: 'Güncellendi',
  start: 'Başlatıldı',
  produce: 'Üretim',
  defect: 'Hatalı Ürün',
  pause: 'Duraklatıldı',
  resume: 'Devam Ettirildi',
  complete: 'Tamamlandı',
  cancel: 'İptal Edildi',
  auto_pause: 'Otomatik Duraklatma',
  auto_resume: 'Otomatik Devam',
};
