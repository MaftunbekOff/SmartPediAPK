import { useState, useEffect } from 'react';
import { WHOGrowthStandard } from '../types';

// Simplified WHO growth standards data (in production, this would come from a comprehensive database)
const WHO_GROWTH_DATA: WHOGrowthStandard[] = [
  // Sample data for 24 months old male
  {
    ageInMonths: 24,
    gender: 'male',
    heightPercentiles: { P3: 82.3, P10: 84.1, P25: 86.2, P50: 88.4, P75: 90.7, P90: 93.2, P97: 96.1 },
    weightPercentiles: { P3: 9.7, P10: 10.5, P25: 11.4, P50: 12.5, P75: 13.7, P90: 15.3, P97: 17.4 },
  },
  // Sample data for 24 months old female
  {
    ageInMonths: 24,
    gender: 'female',
    heightPercentiles: { P3: 80.8, P10: 82.5, P25: 84.6, P50: 86.8, P75: 89.1, P90: 91.7, P97: 94.7 },
    weightPercentiles: { P3: 9.0, P10: 9.8, P25: 10.7, P50: 11.7, P75: 12.8, P90: 14.3, P97: 16.2 },
  },
  // Add more data points for different ages...
];

export const useWHOGrowthStandards = () => {
  const [growthStandards, setGrowthStandards] = useState<WHOGrowthStandard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, this would fetch from a comprehensive WHO database
    setGrowthStandards(WHO_GROWTH_DATA);
    setLoading(false);
  }, []);

  const calculatePercentile = (
    value: number,
    ageInMonths: number,
    gender: 'male' | 'female',
    measurement: 'height' | 'weight'
  ): number => {
    const standard = growthStandards.find(
      s => s.ageInMonths === ageInMonths && s.gender === gender
    );

    if (!standard) return 50; // Default to 50th percentile if no data

    const percentiles = measurement === 'height' ? standard.heightPercentiles : standard.weightPercentiles;
    
    // Simple interpolation to find percentile
    if (value <= percentiles.P3) return 3;
    if (value <= percentiles.P10) return interpolate(value, percentiles.P3, percentiles.P10, 3, 10);
    if (value <= percentiles.P25) return interpolate(value, percentiles.P10, percentiles.P25, 10, 25);
    if (value <= percentiles.P50) return interpolate(value, percentiles.P25, percentiles.P50, 25, 50);
    if (value <= percentiles.P75) return interpolate(value, percentiles.P50, percentiles.P75, 50, 75);
    if (value <= percentiles.P90) return interpolate(value, percentiles.P75, percentiles.P90, 75, 90);
    if (value <= percentiles.P97) return interpolate(value, percentiles.P90, percentiles.P97, 90, 97);
    
    return 97; // Above 97th percentile
  };

  const interpolate = (value: number, x1: number, x2: number, y1: number, y2: number): number => {
    return y1 + ((value - x1) / (x2 - x1)) * (y2 - y1);
  };

  const getGrowthAssessment = (
    heightPercentile: number,
    weightPercentile: number
  ): { status: string; message: string; color: string } => {
    if (heightPercentile < 3 || weightPercentile < 3) {
      return {
        status: 'Concern',
        message: 'Growth is below the 3rd percentile. Consider consulting a pediatrician.',
        color: 'red'
      };
    }
    
    if (heightPercentile < 10 || weightPercentile < 10) {
      return {
        status: 'Monitor',
        message: 'Growth is below the 10th percentile. Continue monitoring closely.',
        color: 'yellow'
      };
    }
    
    if (heightPercentile > 97 || weightPercentile > 97) {
      return {
        status: 'Monitor',
        message: 'Growth is above the 97th percentile. Monitor for any concerns.',
        color: 'yellow'
      };
    }
    
    return {
      status: 'Normal',
      message: 'Growth is within normal range.',
      color: 'green'
    };
  };

  return {
    growthStandards,
    loading,
    calculatePercentile,
    getGrowthAssessment,
  };
};