import FetchProjects from '../FetchProjects';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Button from '@ui/Button';
import Heading from '@ui/Heading';
export default function CineSketchHomePage({ sortConfig }) {
  const [showProjects, setShowProjects] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="h-full w-full max-h-full overflow-y-auto p-4">
      <Heading as="h2" fontWeight={'thin'} className="leading-7">
        {' '}
        WELCOME TO{' '}
        <Heading as="span" fontWeight="bold">
          CINE SKETCH
        </Heading>
      </Heading>
      <hr className="border-[#262626] mb-4" />

      <div>
        <div>
          <div className="mt-12">
            <div className="flex justify-between items-center">
              <div>
                <Heading as="h2" fontWeight="bold">
                  RECENT PROJECTS
                </Heading>
                <Heading
                  as="p"
                  size="sm"
                  fontWeight="normal"
                  margin="mb4"
                  className="text-[#999]"
                >
                  VISUALIZE YOUR SCENES. CREATE STORYBOARDS.
                </Heading>
              </div>
              <Button
                onClick={() => navigate('/cine-sketch/projects')}
                className="mx-2 text-xs"
                size="sm"
                variant="primary"
              >
                View More →
              </Button>
            </div>
          </div>
          <hr className="border-[#262626] mb-4" />
        </div>
        <FetchProjects
          sortConfig={
            sortConfig || { sortBy: 'Date Created', sortOrder: 'Newest First' }
          }
          isHomePage={true}
        />
      </div>
    </div>
  );
}
