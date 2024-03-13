/*
  Warnings:

  - You are about to drop the column `created_at` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `last_message_at` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `chat_id` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `sender_id` on the `Message` table. All the data in the column will be lost.
  - Added the required column `createdAt` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastMessageAt` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionId` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chatId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chat_id_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_sender_id_fkey";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "created_at",
DROP COLUMN "last_message_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "lastMessageAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "sessionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "chat_id",
DROP COLUMN "created_at",
DROP COLUMN "sender_id",
ADD COLUMN     "chatId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "senderId" TEXT;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE;
