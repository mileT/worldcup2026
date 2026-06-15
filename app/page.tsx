import type { Metadata } from 'next';
import WorldCupApp from '@/app/worldcup/worldcup-app';

export const metadata: Metadata = {
  title: 'World Cup 2026 Bracket Predictor',
  description:
    'Predict the 2026 FIFA World Cup: sort all 12 groups, pick the knockout bracket, and save your road to the champion as an image.',
};

export default function Page() {
  return <WorldCupApp />;
}
