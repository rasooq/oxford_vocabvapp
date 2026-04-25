import { PlaceholderScreen } from "@/components/PlaceholderScreen";
import { ROUTES } from "@/constants/routes";

export default function HomeScreen() {
  return (
    <PlaceholderScreen
      title="Home"
      subtitle="Your dashboard for WordCraft AI."
      actions={[
        { label: "Set Word Count", href: ROUTES.WORD_COUNT },
        { label: "Settings", href: ROUTES.SETTINGS }
      ]}
    />
  );
}
