export const MARIKINA_RIVER_THRESHOLDS = {
  ALARM_1: 15.0, // Monitoring
  ALARM_2: 16.0, // Preparation
  ALARM_3: 18.0, // Evacuation
};

/**
 * Calculates unified alert status based on water level gauge reading (meters)
 */
export function calculateAlertStatus(level, stationName = 'Sto. Niño') {
  const numLevel = Number(level) || 0;

  if (numLevel >= MARIKINA_RIVER_THRESHOLDS.ALARM_3) {
    return {
      status: '3rd Alarm',
      label: '3rd Alarm (Evacuation)',
      severity: 'danger',
      color: '#dc2626',
      badgeClass: 'status-badge-3rd-alarm'
    };
  }

  if (numLevel >= MARIKINA_RIVER_THRESHOLDS.ALARM_2) {
    return {
      status: '2nd Alarm',
      label: '2nd Alarm (Preparation)',
      severity: 'warning',
      color: '#ea580c',
      badgeClass: 'status-badge-2nd-alarm'
    };
  }

  if (numLevel >= MARIKINA_RIVER_THRESHOLDS.ALARM_1) {
    return {
      status: '1st Alarm',
      label: '1st Alarm (Monitoring)',
      severity: 'info',
      color: '#ca8a04',
      badgeClass: 'status-badge-1st-alarm'
    };
  }

  return {
    status: 'Normal',
    label: 'Normal Level',
    severity: 'success',
    color: '#16a34a',
    badgeClass: 'status-badge-normal'
  };
}
