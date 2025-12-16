import FetchProjects from "../FetchProjects";
import Heading from "@ui/Heading";

export default function PitchCraftProjectsPage({ sortConfig }) {
  return (
    <div className={`h-auto w-auto max-h-full overflow-y-auto ${localStorage.getItem("theme") === "dark" ? "scrollbar-black": "scrollbar-custom"} p-4`}>
      <Heading as="h2" fontWeight="bold" padding="px6">ALL PROJECTS</Heading>
      <Heading as="p" size="sm" fontWeight="normal" margin="mb4" padding="px6">Pitch your Story through Creativity</Heading>
      <hr className="dark:border-dark-accent-hover border-light-accent-soft_hover border-1 mb-4" />
      <FetchProjects sortConfig={sortConfig} />
    </div>
  );
}