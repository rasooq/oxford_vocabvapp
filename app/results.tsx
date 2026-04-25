import { PlaceholderScreen } from "@/components/PlaceholderScreen";
import { ROUTES } from "@/constants/routes";

export default function ResultsScreen() {
  return (
    <PlaceholderScreen
      title="Results"
      subtitle="Session results will appear here."
      actions={[
        { label: "View Progress", href: ROUTES.PROGRESS },
        { label: "Practice Again", href: ROUTES.PRACTICE }
      ]}
    />
  );
}
