import { LoadingState } from "@/components/LoadingState";

export default function Loading() {
  return (
    <LoadingState
      eyebrow="Plan"
      title="Loading..."
      variant="plan"
      currentPath="/plan"
    />
  );
}
