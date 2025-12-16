import AllScriptDisplayAndCreatePage from '@products/cine-scribe/pages/script-writing/pages';
import DisplayScriptInputAndEdit from '@products/cine-scribe/pages/script-writing/pages/[id]/input';
import DisplayAnalysis from '@products/cine-scribe/pages/script-writing/pages/[id]/act-analysis';
import DisplayCharacterArc from '@products/cine-scribe/pages/script-writing/pages/[id]/character-arc';
import DisplaySceneEvaluation from '@products/cine-scribe/pages/script-writing/pages/[id]/scene-evaluation';
import DisplayGraphsAnalysis from '@products/cine-scribe/pages/script-writing/pages/[id]/beat-sheet';
import DisplayScriptAnalysisReport from '@products/cine-scribe/pages/script-writing/pages/[id]/script-report';
import DisplayScriptInfo from '@products/cine-scribe/pages/script-writing/pages/[id]/script-details';
import CineScribe from '@products/cine-scribe/pages';

// story-generation
import AddProject from '@products/cine-scribe/pages/story-generation/pages/add-project';
import SmartScriptProjectsPage from '@products/cine-scribe/pages/story-generation/pages/projects-page';
import StoryDetails from '@products/cine-scribe/pages/story-generation/pages/[id]/story-details';
import ChatHistory from '@products/cine-scribe/pages/story-generation/pages/[id]/chat';
import WebArticlePage from '@products/cine-scribe/pages/story-generation/pages/[id]/web-article';
import BeatSheet from '@products/cine-scribe/pages/story-generation/pages/[id]/beats';
import Oneliners from '@products/cine-scribe/pages/story-generation/pages/[id]/one-liners';
import Script from '@products/cine-scribe/pages/story-generation/pages/[id]/script';

// Cine Sketch routes
import CineSketchHomePage from '@products/cine-sketch/pages/home';
import CineSketchLayout from '@products/cine-sketch/pages/Layout';
import CineSketchProjectsPage from '@products/cine-sketch/pages/projects-page';
import StoryboardPage from '@products/cine-sketch/pages/storyboard';
import SceneSketchInput from '@products/cine-sketch/pages/scene-sketch-input';
import CharacterConsistencyPage from '@products/cine-sketch/pages/character-consistency';

// Pitch craft routes
import PitchCraftHomePage from '@products/pitch-craft/pages/home';
import PitchCraftPage from '@products/pitch-craft/pages/projects-page';
import CastEditor from '@products/pitch-craft/pages/cast-and-crew-page/';
import PitchEditor from '@products/pitch-craft/pages/edit-pitch';
import {Layout as PitchCraftLayout} from '@products/pitch-craft/pages/Layout';

// Cine Flow routes
import DocumentsDisplayPage from "@products/cine-flow/pages/document-management";

export const cineScribeRoutes = [
  {
    path: '/cine-scribe',
    element: <CineScribe />,
  },
 
  {
    path: '/cine-scribe/story-generation',
    element: <SmartScriptProjectsPage />,

  },
  {
    path: '/cine-scribe/story-generation/add-project',
    element: <AddProject />,
  },
  {
    path: '/cine-scribe/story-generation/:id/story-details',
    element: <StoryDetails />,
  },
  {
    path: '/cine-scribe/story-generation/:id/web-articles',
    element: <WebArticlePage />,
  },
  {
    path: '/cine-scribe/story-generation/:id/story-arena',
    element: <ChatHistory />,
  },
  {
    path: '/cine-scribe/story-generation/:id/beat-sheet',
    element: <BeatSheet />,
  },
  {
    path: '/cine-scribe/story-generation/:id/one-liners',
    element: <Oneliners />,
  },
  {
    path: '/cine-scribe/story-generation/:id/scenes',
    element: <Script />,
  },
];

export const sceneEvaluationRoutes = [
  {
    path: '/cine-scribe/script-writing',
    element: <AllScriptDisplayAndCreatePage />,
  },
  {
    path: '/cine-scribe/script-writing/:id/input',
    element: <DisplayScriptInputAndEdit />,
  },
  {
    path: '/cine-scribe/script-writing/:id/script-details',
    element: <DisplayScriptInfo />,
  },
  // {
  //   path: "/cine-scribe/script-writing/:id/write",
  //   element: <WriteAndViewScriptInput />,
  // },
  {
    path: '/cine-scribe/script-writing/:id/analysis',
    element: <DisplayAnalysis />,
  },
  {
    path: '/cine-scribe/script-writing/:id/beats',
    element: <DisplayGraphsAnalysis />,
  },
  {
    path: '/cine-scribe/script-writing/:id/character-arc',
    element: <DisplayCharacterArc />,
  },
  {
    path: '/cine-scribe/script-writing/:id/report',
    element: <DisplayScriptAnalysisReport />,
  },
  {
    path: '/cine-scribe/script-writing/:id/evaluation',
    element: <DisplaySceneEvaluation />,
  },
];

export const cineSketchRoutes = [
  {
    path: '/cine-sketch/',
    element: <CineSketchLayout showSort={false}><CineSketchHomePage /></CineSketchLayout>,
  },
  {
    path: '/cine-sketch/projects',
    element: <CineSketchLayout showSort={true}><CineSketchProjectsPage /></CineSketchLayout>,
  },
  {
    path: '/cine-sketch/:script_id/input',
    element: <CineSketchLayout showSort={false}><SceneSketchInput /></CineSketchLayout>,
  },
  {
    path: '/cine-sketch/projects/:sketch_id',
    element: <CineSketchLayout showSort={false}><StoryboardPage /></CineSketchLayout>,
  },
  {
    path: '/cine-sketch/character-consistency/:script_id',
    element: <CineSketchLayout showSort={false}><CharacterConsistencyPage /></CineSketchLayout>,
  },
];

export const pitchCraftRoutes = [
  {
    path: '/pitch-craft/',
    element: <PitchCraftLayout showSort={false}><PitchCraftHomePage /></PitchCraftLayout>,
  },
  {
    path: '/pitch-craft/projects',
    element: <PitchCraftLayout showSort={true}><PitchCraftPage /></PitchCraftLayout>,
  },
  {
    path: '/pitch-craft/projects/:pitch_id/',
    element: <PitchEditor />,
  },

];
  
export const cineFlowRoutes = [
  {
    path: "/cine-flow/document-management",
    element: (
      <DocumentsDisplayPage />
    ),
  },
];
