import { Runner } from '../types';

export const DEMO_RUNNERS: Runner[] = [
  {
    bib: '61137',
    name: 'Yuki Yokota',
    gender: 'M',
    distance: '10K',
    distanceDisplay: '10K',
    overallRank: 80,
    genderRank: 67,
    ag: 'M01-30',
    ageGroupRank: 35,
    gunTime: '59:13',
    chipTime: '58:48',
    date: '13/09/2026',
    photoUrl: '/2.jpg',
    startTime: '05:00:00',
    cp1: '14:20',
    cp1Pace: '5:44 /km',
    cp2: '29:10',
    cp2Pace: '5:56 /km',
    cp3: '44:05',
    cp3Pace: '5:58 /km',
    avgPace: '5:53 /km',
    finishPace: '5:54 /km',
  },
  {
    bib: '52535',
    name: 'Ilyina Iryna',
    gender: 'F',
    distance: '5K',
    distanceDisplay: '5K',
    overallRank: 227,
    genderRank: 47,
    ag: 'F60+',
    ageGroupRank: 2,
    gunTime: '34:33',
    chipTime: '34:20',
    date: '13/09/2026',
    photoUrl: '/3.jpg',
    startTime: '05:30:00',
    cp1: '09:55',
    cp1Pace: '6:37 /km',
    cp2: '20:15',
    cp2Pace: '6:53 /km',
    cp3: '27:20',
    cp3Pace: '7:05 /km',
    avgPace: '6:52 /km',
    finishPace: '7:00 /km',
  },
];

export const DEMO_PHOTOS: Record<string, string> = {
  '61137': '/2.jpg',
  '52535': '/3.jpg',
};

// Ảnh thi đấu ví dụ cố định cho từng VĐV mẫu (không trộn lẫn)
export const DEMO_RACE_PHOTOS: Record<string, string[]> = {
  '61137': ['/2.jpg'],
  '52535': ['/3.jpg'],
};

/**
 * Trả về ảnh mẫu chính xác theo BIB hoặc Họ tên VĐV
 * Yuki Yokota (61137)     -> /2.jpg
 * Ilyina Iryna (52535)    -> /3.jpg
 */
export function getDemoPhoto(bibOrName?: string | null): string | null {
  if (!bibOrName) return null;
  const s = String(bibOrName).trim().toLowerCase();
  if (s === '61137' || s.includes('yuki') || s.includes('yokota')) {
    return '/2.jpg';
  }
  if (s === '52535' || s.includes('ilyina') || s.includes('iryna')) {
    return '/3.jpg';
  }
  return null;
}

export const INITIAL_RUNNERS: Runner[] = DEMO_RUNNERS;

