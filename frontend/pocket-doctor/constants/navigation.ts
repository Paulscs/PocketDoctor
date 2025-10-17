export const TabItems = [
  {
    id: "home",
    label: "Home",
    icon: "house.fill",
    route: "/(tabs)/home",
  },
  {
    id: "chat",
    label: "Chat",
    icon: "message.fill",
    route: "/(tabs)/chat",
  },
  {
    id: "history",
    label: "Historial",
    icon: "clock.fill",
    route: "/(tabs)/history",
  },
  {
    id: "profile",
    label: "Perfil",
    icon: "person.fill",
    route: "/(tabs)/profile",
  },
] as const;

export type TabItemId = (typeof TabItems)[number]["id"];
