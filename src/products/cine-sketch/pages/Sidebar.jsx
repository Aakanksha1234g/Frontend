import SidebarComponent from "@ui/Sidebar";
import Home from "@assets/pitch-craft/Home.svg?react";
import AllProjects from "@assets/pitch-craft/All-projects.svg?react";
import Settings from "@assets/pitch-craft/Settings.svg?react";
import Help from "@assets/pitch-craft/Help.svg?react";

export function Sidebar() {
  const navItems = [
    { id: "home", label: "Home", href: "/cine-sketch/", Icon: Home },
    { id: "projects", label: "All Projects", href: "/cine-sketch/projects", Icon: AllProjects },
  ];

  const bottomItems = [
    { id: "settings", label: "Settings", href: "#", Icon: Settings },
    { id: "help", label: "Help", href: "#", Icon: Help },
  ];

  return (
    <SidebarComponent navItems={navItems} bottomItems={bottomItems} />
  );
}
