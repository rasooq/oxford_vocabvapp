import { PlaceholderScreen } from "@/components/PlaceholderScreen";
import { ROUTES } from "@/constants/routes";

export default function ProgressScreen() {
  return (
    <PlaceholderScreen
      title="Progress"
      subtitle="Track your vocabulary growth over time."
      actions={[
        { label: "Go to Settings", href: ROUTES.SETTINGS },
        { label: "Back to Home", href: ROUTES.HOME }
      ]}
    />
  );
}
