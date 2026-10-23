import type { Metadata } from "next";
import "./desk.css";

export const metadata: Metadata = {
  title: "Daily reports",
  description: "See which party chiefs have not submitted the Monday through Saturday report.",
};

export default function DeskLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
