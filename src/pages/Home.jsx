import React, { useState } from 'react';

import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import SearchForm from '../partials/actions/SearchForm';
import FilterButton from '../components/DropdownFilter';
import AudioJobCard from '../partials/audio/AudioJobCard';
import PaginationNumeric from '../components/PaginationNumeric';

function Home() {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock data for audio processing jobs
  // const audioJobs = [
  //   {
  //     id: 1,
  //     name: 'podcast_episode_001.mp3',
  //     size: 15728640, // 15MB
  //     duration: 1800, // 30 minutes
  //     status: 'transcribing',
  //     progress: 65,
  //     createdAt: 'Jan 20',
  //     updatedAt: '2 min ago',
  //     transcription: 'Welcome to our podcast where we discuss the latest trends in artificial intelligence and machine learning...',
  //     error: null
  //   },
  //   {
  //     id: 2,
  //     name: 'interview_recording.wav',
  //     size: 52428800, // 50MB
  //     duration: 2700, // 45 minutes
  //     status: 'processing',
  //     progress: 85,
  //     createdAt: 'Jan 20',
  //     updatedAt: '5 min ago',
  //     transcription: 'Today we have an exclusive interview with the CEO of TechCorp about their latest innovations...',
  //     error: null
  //   },
  //   {
  //     id: 3,
  //     name: 'meeting_notes.m4a',
  //     size: 8388608, // 8MB
  //     duration: 1200, // 20 minutes
  //     status: 'complete',
  //     progress: 100,
  //     createdAt: 'Jan 19',
  //     updatedAt: '1 hour ago',
  //     transcription: 'The quarterly meeting focused on our product roadmap and upcoming feature releases...',
  //     error: null
  //   },
  //   {
  //     id: 4,
  //     name: 'webinar_presentation.mp3',
  //     size: 31457280, // 30MB
  //     duration: 3600, // 60 minutes
  //     status: 'generating',
  //     progress: 45,
  //     createdAt: 'Jan 19',
  //     updatedAt: '10 min ago',
  //     transcription: 'In this webinar, we will explore advanced techniques for data analysis and visualization...',
  //     error: null
  //   },
  //   {
  //     id: 5,
  //     name: 'customer_feedback.wav',
  //     size: 12582912, // 12MB
  //     duration: 900, // 15 minutes
  //     status: 'error',
  //     progress: 0,
  //     createdAt: 'Jan 19',
  //     updatedAt: '3 hours ago',
  //     transcription: null,
  //     error: 'Failed to process audio file. Unsupported format or corrupted file.'
  //   },
  //   {
  //     id: 6,
  //     name: 'conference_talk.mp3',
  //     size: 41943040, // 40MB
  //     duration: 2400, // 40 minutes
  //     status: 'upload',
  //     progress: 0,
  //     createdAt: 'Jan 18',
  //     updatedAt: '1 day ago',
  //     transcription: null,
  //     error: null
  //   },
  //   {
  //     id: 7,
  //     name: 'team_standup.m4a',
  //     size: 5242880, // 5MB
  //     duration: 600, // 10 minutes
  //     status: 'complete',
  //     progress: 100,
  //     createdAt: 'Jan 18',
  //     updatedAt: '1 day ago',
  //     transcription: 'Daily standup meeting where team members discussed their current tasks and blockers...',
  //     error: null
  //   },
  //   {
  //     id: 8,
  //     name: 'client_call.wav',
  //     size: 25165824, // 24MB
  //     duration: 1500, // 25 minutes
  //     status: 'processing',
  //     progress: 30,
  //     createdAt: 'Jan 17',
  //     updatedAt: '30 min ago',
  //     transcription: 'Client call to discuss project requirements and timeline for the upcoming quarter...',
  //     error: null
  //   }
  // ];

  const audioJobs = [];

  return (
    <div className="flex h-[100dvh] overflow-hidden">

      {/* Sidebar */}
      {/* <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> */}

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">

        {/*  Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

            {/* Page header */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">

              {/* Left: Title */}
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Jobs</h1>
                <p className="text-gray-600 dark:text-gray-400">Monitor and manage your jobs</p>
              </div>

              {/* Right: Actions */}
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                {/* Filter button */}
                <FilterButton align="right" />
                {/* Search */}
                <SearchForm placeholder="Search audio files..." />
                {/* Add new job button */}
                <button 
                  onClick={() => window.location.href = '/audio-regeneration'}
                  className="btn bg-violet-500 text-white hover:bg-violet-600"
                >
                  <svg className="fill-current shrink-0 xs:hidden" width="16" height="16" viewBox="0 0 16 16">
                    <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                  </svg>
                  <span className="max-xs:sr-only">New Job</span>
                </button>                
              </div>

            </div>

            {/* Stats */}
            <div className="grid grid-cols-12 gap-6 mb-8">
              <div className="col-span-full sm:col-span-6 xl:col-span-3">
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {audioJobs.filter(job => job.status === 'transcribing' || job.status === 'processing' || job.status === 'generating').length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Active Jobs</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-full sm:col-span-6 xl:col-span-3">
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {audioJobs.filter(job => job.status === 'complete').length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-full sm:col-span-6 xl:col-span-3">
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {audioJobs.filter(job => job.status === 'error').length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-full sm:col-span-6 xl:col-span-3">
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12 7-12 6z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{audioJobs.length}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Jobs</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Audio Processing Jobs */}
            <div className="grid grid-cols-12 gap-6 mb-8">
              {audioJobs.map(job => (
                <AudioJobCard key={job.id} file={job} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8">
              <PaginationNumeric />
            </div>

          </div>
        </main>

      </div>

    </div>
  );
}

export default Home;