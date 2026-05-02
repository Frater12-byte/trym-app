import { LoadingState } from "@/components/LoadingState";

export default function Loading() {
  return (
    <LoadingState
      eyebrow="Groceries"
      title="Your list."
      variant="groceries"
      currentPath="/groceries"
    />
  );
}
