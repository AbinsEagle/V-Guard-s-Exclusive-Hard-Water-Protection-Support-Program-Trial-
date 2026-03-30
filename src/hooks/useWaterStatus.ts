import { useState, useEffect } from 'react';
import { WaterData, Alert } from '../types';
import { classifyTDS } from '../utils';

// Mock data — swap this call out for a real API service later
const MOCK_WATER_DATA: WaterData = {
  hardnessLevel: 'hard',
  tds: 420,
  ph: 7.4,
  deviceName: 'V-Guard Protec 7L RO+UV',
  filterHealth: 68,
  nextServiceDate: '2026-06-15',
  lastUpdated: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  isActive: true,
};

const MOCK_ALERTS: Alert[] = [
  {
    id: 'alert-1',
    message: 'Schedule your next service visit before June 2026.',
    type: 'info',
    createdAt: new Date().toISOString(),
  },
];

interface UseWaterStatusReturn {
  waterData: WaterData;
  alerts: Alert[];
  isLoading: boolean;
  refresh: () => void;
}

export function useWaterStatus(): UseWaterStatusReturn {
  const [waterData, setWaterData] = useState<WaterData>(MOCK_WATER_DATA);
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = () => {
    setIsLoading(true);
    // Replace with real API call: waterService.fetchStatus()
    setTimeout(() => {
      setWaterData({
        ...MOCK_WATER_DATA,
        hardnessLevel: classifyTDS(MOCK_WATER_DATA.tds),
        lastUpdated: new Date().toISOString(),
      });
      setIsLoading(false);
    }, 800);
  };

  useEffect(() => {
    refresh();
  }, []);

  return { waterData, alerts, isLoading, refresh };
}
