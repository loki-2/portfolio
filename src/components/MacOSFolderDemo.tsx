/**
 * MacOSFolder Component Demo
 *
 * This file demonstrates various use cases of the MacOSFolder component
 * showing different configurations, content types, and customizations.
 */

import React from 'react';
import { MacOSFolder } from './MacOSFolder';
import { FolderGit2, Briefcase, GraduationCap, Heart } from 'lucide-react';

/**
 * Demo 1: Simple folder with text content
 */
export const SimpleFolderDemo: React.FC = () => {
  return (
    <MacOSFolder label="Notes" icon={<FolderGit2 size={11} />}>
      <div className="space-y-3">
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <h3 className="text-white/90 font-semibold mb-2">Design Philosophy</h3>
          <p className="text-white/60 text-sm">
            Focus on clarity, consistency, and user delight.
          </p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <h3 className="text-white/90 font-semibold mb-2">Development Approach</h3>
          <p className="text-white/60 text-sm">
            Build with modern tools, optimize for performance.
          </p>
        </div>
      </div>
    </MacOSFolder>
  );
};

/**
 * Demo 2: Folder with list items
 */
export const ListFolderDemo: React.FC = () => {
  const items = [
    { id: 1, title: 'Product Strategy', status: 'Complete' },
    { id: 2, title: 'User Research', status: 'In Progress' },
    { id: 3, title: 'Wireframing', status: 'Pending' },
    { id: 4, title: 'Visual Design', status: 'Pending' },
  ];

  return (
    <MacOSFolder label="Projects" icon={<Briefcase size={11} />}>
      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <span className="text-white/80 text-sm">{item.title}</span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                item.status === 'Complete'
                  ? 'bg-green-500/20 text-green-400'
                  : item.status === 'In Progress'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-white/10 text-white/40'
              }`}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </MacOSFolder>
  );
};

/**
 * Demo 3: Folder with image grid
 */
export const ImageGridFolderDemo: React.FC = () => {
  const images = [
    '/avatar.png',
    '/cover_ai_chat.png',
    '/cover_fintech.png',
    '/avatar.png',
  ];

  return (
    <MacOSFolder label="Gallery" icon={<Heart size={11} />}>
      <div className="grid grid-cols-2 gap-2">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
          >
            <img
              src={img}
              alt={`Gallery item ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </MacOSFolder>
  );
};

/**
 * Demo 4: Folder with timeline/chronological content
 */
export const TimelineFolderDemo: React.FC = () => {
  const events = [
    {
      year: '2025',
      title: 'Senior Product Designer',
      company: 'Tech Corp',
    },
    {
      year: '2024',
      title: 'Product Designer',
      company: 'Startup Inc',
    },
    {
      year: '2023',
      title: 'Junior Designer',
      company: 'Design Studio',
    },
  ];

  return (
    <MacOSFolder label="Timeline" icon={<GraduationCap size={11} />}>
      <div className="space-y-4">
        {events.map((event, idx) => (
          <div key={idx} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-white/40" />
              {idx < events.length - 1 && (
                <div className="w-px flex-1 bg-white/10 mt-1" />
              )}
            </div>
            <div className="flex-1 pb-4">
              <span className="text-white/40 text-xs">{event.year}</span>
              <h4 className="text-white/90 font-semibold text-sm">
                {event.title}
              </h4>
              <p className="text-white/60 text-xs">{event.company}</p>
            </div>
          </div>
        ))}
      </div>
    </MacOSFolder>
  );
};

/**
 * Demo 5: All demos in a grid layout
 */
export const AllFolderDemos: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          macOS Folder Component Demos
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-white/60 text-sm mb-4 uppercase tracking-wider">
              Simple Text Content
            </h2>
            <SimpleFolderDemo />
          </div>

          <div>
            <h2 className="text-white/60 text-sm mb-4 uppercase tracking-wider">
              List Items with Status
            </h2>
            <ListFolderDemo />
          </div>

          <div>
            <h2 className="text-white/60 text-sm mb-4 uppercase tracking-wider">
              Image Grid
            </h2>
            <ImageGridFolderDemo />
          </div>

          <div>
            <h2 className="text-white/60 text-sm mb-4 uppercase tracking-wider">
              Timeline/Chronological
            </h2>
            <TimelineFolderDemo />
          </div>
        </div>

        <div className="mt-12 p-6 bg-white/5 rounded-lg border border-white/10">
          <h3 className="text-white/90 font-semibold mb-3">
            Component Features
          </h3>
          <ul className="space-y-2 text-white/60 text-sm">
            <li>✓ Authentic macOS folder shape with precise bezier curves</li>
            <li>✓ Three-layer design: tab, translucent back panel, solid front panel</li>
            <li>✓ Dark theme optimized colors (#2a2a2f range)</li>
            <li>✓ SVG-based for perfect scaling and curve control</li>
            <li>✓ Customizable label and icon</li>
            <li>✓ Flexible content area with overflow scrolling</li>
            <li>✓ Depth and lighting effects for realism</li>
            <li>✓ Fully responsive and accessible</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AllFolderDemos;
