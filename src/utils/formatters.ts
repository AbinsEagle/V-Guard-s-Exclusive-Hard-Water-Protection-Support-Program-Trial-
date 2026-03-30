import { HardnessLevel } from '../types';
import { colors } from '../theme';

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function getHardnessLabel(level: HardnessLevel): string {
  const labels: Record<HardnessLevel, string> = {
    soft: 'Soft',
    moderate: 'Moderate',
    hard: 'Hard',
    very_hard: 'Very Hard',
  };
  return labels[level];
}

export function getHardnessColor(level: HardnessLevel): string {
  const colorMap: Record<HardnessLevel, string> = {
    soft: colors.waterSoft,
    moderate: colors.waterModerate,
    hard: colors.waterHard,
    very_hard: colors.waterVeryHard,
  };
  return colorMap[level];
}

export function getFilterHealthColor(health: number): string {
  if (health >= 60) return colors.success;
  if (health >= 30) return colors.warning;
  return colors.error;
}

export function classifyTDS(tds: number): HardnessLevel {
  if (tds < 150) return 'soft';
  if (tds < 300) return 'moderate';
  if (tds < 500) return 'hard';
  return 'very_hard';
}
