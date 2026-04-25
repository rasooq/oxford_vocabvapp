import { Link } from "expo-router";
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/lib/theme";
import { AppRoute } from "@/types/navigation";

type NavAction = {
  label: string;
  href: AppRoute;
};

type PlaceholderScreenProps = {
  title: string;
  subtitle?: string;
  actions: NavAction[];
  children?: ReactNode;
};

export function PlaceholderScreen({
  title,
  subtitle,
  actions,
  children
}: PlaceholderScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        {children}

        <View style={styles.actionsWrapper}>
          {actions.map((action) => (
            <Link href={action.href} asChild key={`${title}-${action.href}`}>
              <Pressable style={styles.button}>
                <Text style={styles.buttonText}>{action.label}</Text>
              </Pressable>
            </Link>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    backgroundColor: theme.colors.card,
    padding: 20,
    gap: 12
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text
  },
  subtitle: {
    fontSize: 16,
    color: "#4b5563"
  },
  actionsWrapper: {
    gap: 10,
    marginTop: 8
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center"
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600"
  }
});
