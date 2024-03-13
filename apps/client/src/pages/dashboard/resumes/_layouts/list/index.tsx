/* eslint-disable lingui/no-unlocalized-strings */
import { sortByDate } from "@reactive-resume/utils";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

import { useResumes } from "@/client/services/resume";

import { ConvversationView } from "./_components/conversation-item";
import { CreateResumeListItem } from "./_components/create-item";
import { ImportResumeListItem } from "./_components/import-item";
import { ResumeListItem } from "./_components/resume-item";
import { StatisticsCard } from "./_components/statistics-card";
import { UploadResumeListItem } from "./_components/upload-item";

export const ListView = () => {
  const { resumes, loading } = useResumes();

  return (
    <div className="p-4">
      {/* First Row: Profile Statistics and Buttons */}
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-12">
          <h2 className="mb-2 text-lg font-semibold">Profile Statistics</h2>
          <div className="mb-2 grid grid-cols-2 gap-2">
            <StatisticsCard title="Resume Views" value="100" />
            <StatisticsCard title="Bot Chats" value="500" />
          </div>
          <div className="flex items-center justify-between">
            {/* "Resumes" heading with animation */}
            <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-lg font-semibold">Resumes</h2>
            </motion.div>
          </div>
          <div className="mb-8 lg:col-span-12">
            <div className="max-h-[200px] overflow-auto">
              <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }}>
                <CreateResumeListItem />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
              >
                <ImportResumeListItem />
              </motion.div>
              {loading ? (
                <div className="animate-pulse">Loading...</div>
              ) : resumes ? (
                <AnimatePresence>
                  {resumes
                    .sort((a, b) => sortByDate(a, b, "updatedAt"))
                    .map((resume, index) => (
                      <motion.div
                        key={resume.id}
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: 0.1 * index } }}
                        exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.5 } }}
                        className="mb-2"
                      >
                        <ResumeListItem resume={resume} />
                      </motion.div>
                    ))}
                </AnimatePresence>
              ) : (
                <p>No resumes found.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Second Row: Resumes Section */}

      {/* Third Row: Chat History */}
      <div className="lg:col-span-12">
        <h2 className="mb-4 text-lg font-semibold">Chat History</h2>
        <div className="max-h-[300px] overflow-auto">
          <ConvversationView />
        </div>
      </div>
    </div>
  );
};
