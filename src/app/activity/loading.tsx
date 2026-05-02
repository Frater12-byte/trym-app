import { LoadingState } from "@/components/LoadingState";

export default function Loading() {
  return (
    <LoadingState
      eyebrow="Activity"
      title="Loading..."
      variant="list"
      currentPath="/activity"
    />
  );
}
