export const PART_CATEGORIES = [
  {
    id: 'fasteners',
    label: 'Fasteners (Bağlantı Elemanları)',
    units: ['piece'],
    defaultUnit: 'piece',
    machineSettings: [
      { key: 'feedRate', label: 'İlerleme (mm/rev)', type: 'number', step: 0.01 },
      { key: 'spindleSpeed', label: 'Spindle Hızı (rpm)', type: 'number', step: 50 },
      { key: 'torque', label: 'Tork (Nm)', type: 'number', step: 0.1 },
    ],
  },
  {
    id: 'electronics',
    label: 'Elektronik Bileşenler',
    units: ['piece', 'set'],
    defaultUnit: 'set',
    machineSettings: [
      { key: 'placementSpeed', label: 'Placement Hızı (mm/s)', type: 'number', step: 1 },
      { key: 'reflowTemp', label: 'Reflow Sıcaklığı (°C)', type: 'number', step: 1 },
      { key: 'solderType', label: 'Lehim Tipi', type: 'text' },
    ],
  },
  {
    id: 'mechanical_plastics',
    label: 'Mekanik & Plastik',
    units: ['piece', 'assembly'],
    defaultUnit: 'piece',
    machineSettings: [
      { key: 'moldTemp', label: 'Kalıp Sıcaklığı (°C)', type: 'number', step: 1 },
      { key: 'coolingTime', label: 'Soğuma Süresi (sn)', type: 'number', step: 0.5 },
      { key: 'pressure', label: 'Basınç (bar)', type: 'number', step: 0.1 },
    ],
  },
];

export const PART_CATEGORY_MAP = new Map(
  PART_CATEGORIES.map((category) => [category.id, category]),
);

export const getCategoryById = (id) => (id ? PART_CATEGORY_MAP.get(id) : undefined);
