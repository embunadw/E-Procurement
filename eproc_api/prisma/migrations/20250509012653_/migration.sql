BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[ms_vendor] DROP CONSTRAINT [ms_vendor_user_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[trs_rfq] DROP CONSTRAINT [trs_rfq_user_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[trs_rfq_vendor] DROP CONSTRAINT [trs_rfq_vendor_rfq_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[trs_rfq_vendor] DROP CONSTRAINT [trs_rfq_vendor_vendor_id_fkey];

-- AlterTable
ALTER TABLE [dbo].[ms_material] ALTER COLUMN [user_id] INT NULL;

-- AlterTable
ALTER TABLE [dbo].[ms_material_group] ALTER COLUMN [user_id] INT NULL;

-- AlterTable
ALTER TABLE [dbo].[ms_plant] ALTER COLUMN [user_id] INT NULL;

-- AlterTable
ALTER TABLE [dbo].[ms_user] ALTER COLUMN [personal_number] NVARCHAR(1000) NOT NULL;

-- AddForeignKey
ALTER TABLE [dbo].[ms_vendor] ADD CONSTRAINT [ms_vendor_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[ms_user]([user_id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[trs_rfq] ADD CONSTRAINT [trs_rfq_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[ms_user]([user_id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[trs_rfq_vendor] ADD CONSTRAINT [trs_rfq_vendor_rfq_id_fkey] FOREIGN KEY ([rfq_id]) REFERENCES [dbo].[trs_rfq]([rfq_id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[trs_rfq_vendor] ADD CONSTRAINT [trs_rfq_vendor_vendor_id_fkey] FOREIGN KEY ([vendor_id]) REFERENCES [dbo].[ms_vendor]([vendor_id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
