-- AlterTable: make user_id optional in SystemLogs
ALTER TABLE `systemlogs` MODIFY `user_id` INTEGER NULL;
