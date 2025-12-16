import { FeatureCard } from '../ui/feature-card';
import Navbar from './navbar';
import { useMemo } from 'react';

const Hero = () => {
  return (
    <section
      className="relative overflow-hidden py-20 bg-cover bg-center"
      style={{ backgroundImage: "url('/hero-banner.png')" }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0" />

      <div className="container relative z-10 mx-auto px-4 text-center">
        <h2 className="text-sm font-medium tracking-wider text-white">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent font-bold">
            LORVEN AI
          </span>
        </h2>
        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
          From Idea to Screen:
          <br />
          Your{' '}
          <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            All-in-One Hub
          </span>{' '}
          for Storytelling Brilliance!
        </h1>
        <p className="mx-auto text-sm mt-6 max-w-2xl text-white">
          Supercharge your design workflow, kick-start your project faster, and
          level up your process.
        </p>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute right-0 top-1/2 -z-10 h-[800px] w-[800px] -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-tr from-gray-900/5 to-gray-900/50 opacity-20 blur-3xl" />
    </section>
  );
};

export default function Home() {
  const features = [
    {
      title: 'Cine Scribe',
      description:
        'Transform your film idea into a professional screenplay — with expert guidance and in-depth analysis powered by LORVEN AI.',
      imageSrc: '/product_logo/cine scribe.jpg',
      redirectUrl: '/cine-scribe',
    },
    {
      title: 'Cine Sketch',
      description:
        'Visualize every scene in your script — with cinematic AI sketches tailored to your story stone and emotion.',
      imageSrc: '/product_logo/cine sketch.jpg',
      // redirectUrl: '/cine-sketch',
      redirectUrl: '/',
    },
    {
      title: 'Pitch Craft',
      description:
        'Create a professional pitch deck in minutes — with visuals, casting, and story structure designed for studios and OTT platforms.',
      imageSrc: '/product_logo/pitch craft.jpg',
      redirectUrl: '/pitch-craft',
    },
    {
      title: 'Cine Flow',
      description:
        'Bring your story’s world to life — with AI-powered set, costume, prop, and lighting designs built directly from your script.',
      imageSrc: '/product_logo/cine flow.jpg',
      redirectUrl: '/',
    },
  ];
  const navbarHeight = useMemo(() => (window.innerWidth >= 1920 ? 64 : 54), []);

  return (
    <div className='flex flex-col h-full w-full'>
      <div className="fixed top-0 left-0 right-0 z-50"
        style={{ height: `${navbarHeight}px` }}>
        <Navbar />
      </div>
      <Hero />
      <section className="container mx-auto px-4 py-12">
        <ul className="grid lg:grid-cols-4 lg:gap-5 mt-4 overflow-auto scrollbar-custom p-2 gap-10">
          {features.map((feature, index) => (
            <li key={index} className="flex justify-center ">
              <FeatureCard
                title={feature.title}
                description={feature.description}
                imageSrc={feature.imageSrc}
                className="w-full max-w-xs"
                onClick={() => (window.location.href = feature.redirectUrl)}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
