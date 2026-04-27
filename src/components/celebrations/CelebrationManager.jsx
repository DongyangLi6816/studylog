import { useCelebration } from '../../context/CelebrationContext';
import Tier1Toast from './Tier1Toast';

export default function CelebrationManager() {
  const { celebration, clearCelebration } = useCelebration();
  if (!celebration) return null;
  if (celebration.tier === 1) {
    return <Tier1Toast key={celebration.id} message={celebration.message} onDismiss={clearCelebration} />;
  }
  return null;
}
