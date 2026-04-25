import { PlaceholderScreen } from "@/components/PlaceholderScreen";
import { ROUTES } from "@/constants/routes";

export default function WordCountScreen() {
  return (
    <PlaceholderScreen
      title="Word Count"
      subtitle="Choose how many words you want to practice today."
      actions={[
        { label: "Start Practice", href: ROUTES.PRACTICE },
        { label: "Back to Home", href: ROUTES.HOME }
      ]}
    />
  );
}
