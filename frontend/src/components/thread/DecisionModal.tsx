/**
 * DecisionModal Component (Legacy - decisions UI now in DecisionsPage)
 */

export type DecisionType = "scale" | "pivot" | "invest" | "divest" | "unblock" | "defer";

export interface DecisionData {
  title: string;
  type: DecisionType;
}

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DecisionModal({ isOpen, onClose }: DecisionModalProps) {
  if (!isOpen) return null;
  
  return (
    <div>
      <p>Decision modal - replaced by DecisionsPage</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
}

export default DecisionModal;
