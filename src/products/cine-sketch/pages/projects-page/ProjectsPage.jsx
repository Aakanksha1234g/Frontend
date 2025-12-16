import FetchProjects from "../FetchProjects";
import Heading from "@ui/Heading";

export default function CineSketchProjectsPage({ sortConfig }) {
  return (
    <div className="h-auto w-auto max-h-full overflow-y-auto p-4">
      <Heading as="h2" fontWeight="bold" padding="px6">ALL PROJECTS</Heading>
      <Heading as="p" size="sm" fontWeight="normal" margin="mb4" padding="px6">Pitch your Story through Creativity</Heading>
      <hr className="border-[#262626] mb-4" />
      <FetchProjects sortConfig={sortConfig} />
    </div>
  );
}