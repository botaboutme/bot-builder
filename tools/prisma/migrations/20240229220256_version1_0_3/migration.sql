/*
  Warnings:

  - A unique constraint covering the columns `[sessionId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Chat_sessionId_key" ON "Chat"("sessionId");
