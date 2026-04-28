import { LoadingState } from "@/components/LoadingState";

export default function Loading() {
  return (
    <LoadingState
      eyebrow="This week's plan"
      title="Loading..."
      variant="dashboard"
    />
  );
}
