import { LoadingState } from "@/components/LoadingState";

export default function Loading() {
  return (
    <LoadingState
      eyebrow="Today"
      title="Hey 👋"
      variant="dashboard"
      currentPath="/dashboard"
    />
  );
}
