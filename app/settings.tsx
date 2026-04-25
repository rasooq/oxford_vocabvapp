import { PlaceholderScreen } from "@/components/PlaceholderScreen";
import { ROUTES } from "@/constants/routes";

export default function SettingsScreen() {
  return (
    <PlaceholderScreen
      title="Settings"
      subtitle="App preferences and profile options placeholder."
      actions={[
        { label: "Return to Home", href: ROUTES.HOME },
        { label: "Log Out", href: ROUTES.LOGIN }
      ]}
    />
  );
}
