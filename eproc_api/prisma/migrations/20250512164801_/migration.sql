/*
  Warnings:

  - You are about to drop the `_ms_material_groupToms_user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ms_plantToms_user` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `user_id` to the `ms_material_group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `ms_plant` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[_ms_material_groupToms_user] DROP CONSTRAINT [_ms_material_groupToms_user_A_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[_ms_material_groupToms_user] DROP CONSTRAINT [_ms_material_groupToms_user_B_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[_ms_plantToms_user] DROP CONSTRAINT [_ms_plantToms_user_A_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[_ms_plantToms_user] DROP CONSTRAINT [_ms_plantToms_user_B_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[ms_material] DROP CONSTRAINT [ms_material_material_group_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[ms_material] DROP CONSTRAINT [ms_material_plant_id_fkey];

-- AlterTable
ALTER TABLE [dbo].[ms_material_group] ADD [user_id] INT NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[ms_plant] ADD [user_id] INT NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[trs_rfq] ALTER COLUMN [rfq_duedate] DATETIME2 NULL;
ALTER TABLE [dbo].[trs_rfq] ALTER COLUMN [release_at] DATETIME2 NULL;
ALTER TABLE [dbo].[trs_rfq] ALTER COLUMN [created_at] DATETIME2 NULL;
ALTER TABLE [dbo].[trs_rfq] ALTER COLUMN [updated_at] DATETIME2 NULL;

-- DropTable
DROP TABLE [dbo].[_ms_material_groupToms_user];

-- DropTable
DROP TABLE [dbo].[_ms_plantToms_user];

-- AddForeignKey
ALTER TABLE [dbo].[ms_plant] ADD CONSTRAINT [ms_plant_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[ms_user]([user_id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ms_material_group] ADD CONSTRAINT [ms_material_group_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[ms_user]([user_id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ms_material] ADD CONSTRAINT [ms_material_material_group_id_fkey] FOREIGN KEY ([material_group_id]) REFERENCES [dbo].[ms_material_group]([material_group_id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ms_material] ADD CONSTRAINT [ms_material_plant_id_fkey] FOREIGN KEY ([plant_id]) REFERENCES [dbo].[ms_plant]([plant_id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
