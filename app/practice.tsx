import { PlaceholderScreen } from "@/components/PlaceholderScreen";
import { ROUTES } from "@/constants/routes";

export default function PracticeScreen() {
  return (
    <PlaceholderScreen
      title="Practice"
      subtitle="Practice session placeholder screen."
      actions={[
        { label: "Finish Session", href: ROUTES.RESULTS },
        { label: "Back to Home", href: ROUTES.HOME }
      ]}
    />
  );
}
