/*
  Warnings:

  - You are about to drop the column `user_id` on the `ms_material` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `ms_material_group` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `ms_plant` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `ms_vendor` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[ms_material] DROP CONSTRAINT [ms_material_material_group_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[ms_material] DROP CONSTRAINT [ms_material_plant_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[ms_material] DROP CONSTRAINT [ms_material_user_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[ms_material_group] DROP CONSTRAINT [ms_material_group_user_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[ms_plant] DROP CONSTRAINT [ms_plant_user_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[ms_vendor] DROP CONSTRAINT [ms_vendor_user_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[trs_rfq_vendor] DROP CONSTRAINT [trs_rfq_vendor_rfq_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[trs_rfq_vendor] DROP CONSTRAINT [trs_rfq_vendor_vendor_id_fkey];

-- AlterTable
ALTER TABLE [dbo].[ms_material] DROP COLUMN [user_id];

-- AlterTable
ALTER TABLE [dbo].[ms_material_group] DROP COLUMN [user_id];

-- AlterTable
ALTER TABLE [dbo].[ms_plant] DROP COLUMN [user_id];

-- AlterTable
ALTER TABLE [dbo].[ms_vendor] DROP COLUMN [user_id];

-- CreateTable
CREATE TABLE [dbo].[_ms_userToms_vendor] (
    [A] INT NOT NULL,
    [B] INT NOT NULL,
    CONSTRAINT [_ms_userToms_vendor_AB_unique] UNIQUE NONCLUSTERED ([A],[B])
);

-- CreateTable
CREATE TABLE [dbo].[_ms_plantToms_user] (
    [A] INT NOT NULL,
    [B] INT NOT NULL,
    CONSTRAINT [_ms_plantToms_user_AB_unique] UNIQUE NONCLUSTERED ([A],[B])
);

-- CreateTable
CREATE TABLE [dbo].[_ms_material_groupToms_user] (
    [A] INT NOT NULL,
    [B] INT NOT NULL,
    CONSTRAINT [_ms_material_groupToms_user_AB_unique] UNIQUE NONCLUSTERED ([A],[B])
);

-- CreateTable
CREATE TABLE [dbo].[_ms_materialToms_user] (
    [A] INT NOT NULL,
    [B] INT NOT NULL,
    CONSTRAINT [_ms_materialToms_user_AB_unique] UNIQUE NONCLUSTERED ([A],[B])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [_ms_userToms_vendor_B_index] ON [dbo].[_ms_userToms_vendor]([B]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [_ms_plantToms_user_B_index] ON [dbo].[_ms_plantToms_user]([B]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [_ms_material_groupToms_user_B_index] ON [dbo].[_ms_material_groupToms_user]([B]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [_ms_materialToms_user_B_index] ON [dbo].[_ms_materialToms_user]([B]);

-- AddForeignKey
ALTER TABLE [dbo].[ms_material] ADD CONSTRAINT [ms_material_material_group_id_fkey] FOREIGN KEY ([material_group_id]) REFERENCES [dbo].[ms_material_group]([material_group_id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ms_material] ADD CONSTRAINT [ms_material_plant_id_fkey] FOREIGN KEY ([plant_id]) REFERENCES [dbo].[ms_plant]([plant_id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[trs_rfq_vendor] ADD CONSTRAINT [trs_rfq_vendor_rfq_id_fkey] FOREIGN KEY ([rfq_id]) REFERENCES [dbo].[trs_rfq]([rfq_id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[trs_rfq_vendor] ADD CONSTRAINT [trs_rfq_vendor_vendor_id_fkey] FOREIGN KEY ([vendor_id]) REFERENCES [dbo].[ms_vendor]([vendor_id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_ms_userToms_vendor] ADD CONSTRAINT [_ms_userToms_vendor_A_fkey] FOREIGN KEY ([A]) REFERENCES [dbo].[ms_user]([user_id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_ms_userToms_vendor] ADD CONSTRAINT [_ms_userToms_vendor_B_fkey] FOREIGN KEY ([B]) REFERENCES [dbo].[ms_vendor]([vendor_id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_ms_plantToms_user] ADD CONSTRAINT [_ms_plantToms_user_A_fkey] FOREIGN KEY ([A]) REFERENCES [dbo].[ms_plant]([plant_id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_ms_plantToms_user] ADD CONSTRAINT [_ms_plantToms_user_B_fkey] FOREIGN KEY ([B]) REFERENCES [dbo].[ms_user]([user_id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_ms_material_groupToms_user] ADD CONSTRAINT [_ms_material_groupToms_user_A_fkey] FOREIGN KEY ([A]) REFERENCES [dbo].[ms_material_group]([material_group_id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_ms_material_groupToms_user] ADD CONSTRAINT [_ms_material_groupToms_user_B_fkey] FOREIGN KEY ([B]) REFERENCES [dbo].[ms_user]([user_id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_ms_materialToms_user] ADD CONSTRAINT [_ms_materialToms_user_A_fkey] FOREIGN KEY ([A]) REFERENCES [dbo].[ms_material]([material_id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_ms_materialToms_user] ADD CONSTRAINT [_ms_materialToms_user_B_fkey] FOREIGN KEY ([B]) REFERENCES [dbo].[ms_user]([user_id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
