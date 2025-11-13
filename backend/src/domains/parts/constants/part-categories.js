const PART_CATEGORIES = [
  {
    id: 'fasteners',
    label: 'Fasteners (Bağlantı Elemanları)',
    units: ['piece'],
    defaultUnit: 'piece',
    machineSettings: [
      { key: 'feedRate', label: 'İlerleme (mm/rev)', type: 'number' },
      { key: 'spindleSpeed', label: 'Spindle Hızı (rpm)', type: 'number' },
      { key: 'torque', label: 'Tork (Nm)', type: 'number' },
    ],
  },
  {
    id: 'electronics',
    label: 'Elektronik Bileşenler',
    units: ['piece', 'set'],
    defaultUnit: 'set',
    machineSettings: [
      { key: 'placementSpeed', label: 'Placement Hızı (mm/s)', type: 'number' },
      { key: 'reflowTemp', label: 'Reflow Sıcaklığı (°C)', type: 'number' },
      { key: 'solderType', label: 'Lehim Tipi', type: 'text' },
    ],
  },
  {
    id: 'mechanical_plastics',
    label: 'Mekanik & Plastik',
    units: ['piece', 'assembly'],
    defaultUnit: 'piece',
    machineSettings: [
      { key: 'moldTemp', label: 'Kalıp Sıcaklığı (°C)', type: 'number' },
      { key: 'coolingTime', label: 'Soğuma Süresi (sn)', type: 'number' },
      { key: 'pressure', label: 'Basınç (bar)', type: 'number' },
    ],
  },
];

const PART_CATEGORY_MAP = new Map(PART_CATEGORIES.map((category) => [category.id, category]));

const getCategoryConfig = (categoryId) => {
  if (!categoryId) return undefined;
  return PART_CATEGORY_MAP.get(categoryId.trim().toLowerCase());
};

module.exports = {
  PART_CATEGORIES,
  PART_CATEGORY_MAP,
  getCategoryConfig,
};
