import { Redirect } from "expo-router";

import { ROUTES } from "@/constants/routes";

export default function IndexScreen() {
  return <Redirect href={ROUTES.LOGIN} />;
}
