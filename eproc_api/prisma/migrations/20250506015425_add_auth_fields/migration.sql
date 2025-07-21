/*
  Warnings:

  - You are about to drop the `Material` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subcontractor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tb_rfq` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tb_rfq_detail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tb_rfq_file` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tb_rfq_kbli` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tb_rfq_picture` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tb_rfq_vendor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vendor` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[tb_rfq_detail] DROP CONSTRAINT [tb_rfq_detail_rfq_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[tb_rfq_file] DROP CONSTRAINT [tb_rfq_file_rfq_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[tb_rfq_kbli] DROP CONSTRAINT [tb_rfq_kbli_rfq_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[tb_rfq_picture] DROP CONSTRAINT [tb_rfq_picture_rfq_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[tb_rfq_vendor] DROP CONSTRAINT [tb_rfq_vendor_rfq_id_fkey];

-- DropTable
DROP TABLE [dbo].[Material];

-- DropTable
DROP TABLE [dbo].[Subcontractor];

-- DropTable
DROP TABLE [dbo].[tb_rfq];

-- DropTable
DROP TABLE [dbo].[tb_rfq_detail];

-- DropTable
DROP TABLE [dbo].[tb_rfq_file];

-- DropTable
DROP TABLE [dbo].[tb_rfq_kbli];

-- DropTable
DROP TABLE [dbo].[tb_rfq_picture];

-- DropTable
DROP TABLE [dbo].[tb_rfq_vendor];

-- DropTable
DROP TABLE [dbo].[users];

-- DropTable
DROP TABLE [dbo].[Vendor];

-- CreateTable
CREATE TABLE [dbo].[ms_user] (
    [user_id] INT NOT NULL IDENTITY(1,1),
    [username] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [personal_number] INT NOT NULL,
    [dept] NVARCHAR(1000) NOT NULL,
    [department] NVARCHAR(1000) NOT NULL,
    [division] NVARCHAR(1000) NOT NULL,
    [email_sf] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL,
    [created_at] DATETIME2 NOT NULL,
    [is_deleted] INT NOT NULL CONSTRAINT [ms_user_is_deleted_df] DEFAULT 0,
    CONSTRAINT [ms_user_pkey] PRIMARY KEY CLUSTERED ([user_id]),
    CONSTRAINT [ms_user_username_key] UNIQUE NONCLUSTERED ([username])
);

-- CreateTable
CREATE TABLE [dbo].[ms_plant] (
    [plant_id] INT NOT NULL IDENTITY(1,1),
    [user_id] INT NOT NULL,
    [plant] NVARCHAR(1000) NOT NULL,
    [postcode] INT NOT NULL,
    [city] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [is_deleted] INT NOT NULL CONSTRAINT [ms_plant_is_deleted_df] DEFAULT 0,
    CONSTRAINT [ms_plant_pkey] PRIMARY KEY CLUSTERED ([plant_id])
);

-- CreateTable
CREATE TABLE [dbo].[ms_material_group] (
    [material_group_id] INT NOT NULL IDENTITY(1,1),
    [user_id] INT NOT NULL,
    [material_type] NVARCHAR(1000) NOT NULL,
    [material_group] NVARCHAR(1000) NOT NULL,
    [material_group_description] NVARCHAR(1000),
    [is_deleted] INT NOT NULL CONSTRAINT [ms_material_group_is_deleted_df] DEFAULT 0,
    CONSTRAINT [ms_material_group_pkey] PRIMARY KEY CLUSTERED ([material_group_id])
);

-- CreateTable
CREATE TABLE [dbo].[ms_material] (
    [material_id] INT NOT NULL IDENTITY(1,1),
    [user_id] INT NOT NULL,
    [material_group_id] INT NOT NULL,
    [material_number] NVARCHAR(1000) NOT NULL,
    [material_type] NVARCHAR(1000) NOT NULL,
    [base_unit] NVARCHAR(1000) NOT NULL,
    [plant_id] INT NOT NULL,
    [is_deleted] INT NOT NULL CONSTRAINT [ms_material_is_deleted_df] DEFAULT 0,
    CONSTRAINT [ms_material_pkey] PRIMARY KEY CLUSTERED ([material_id])
);

-- CreateTable
CREATE TABLE [dbo].[ms_vendor] (
    [vendor_id] INT NOT NULL IDENTITY(1,1),
    [user_id] INT NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [country_code] NVARCHAR(1000) NOT NULL,
    [postal_code] NVARCHAR(1000) NOT NULL,
    [address] NVARCHAR(1000) NOT NULL,
    [vendor_code] NVARCHAR(1000) NOT NULL,
    [phone_no] NVARCHAR(1000) NOT NULL,
    [vendor_type] NVARCHAR(1000) NOT NULL,
    [email_po] NVARCHAR(1000) NOT NULL,
    [created_at] DATETIME2 NOT NULL,
    [created_by] NVARCHAR(1000) NOT NULL,
    [updated_at] DATETIME2 NOT NULL,
    [last_modified_by] NVARCHAR(1000) NOT NULL,
    [is_deleted] INT NOT NULL CONSTRAINT [ms_vendor_is_deleted_df] DEFAULT 0,
    CONSTRAINT [ms_vendor_pkey] PRIMARY KEY CLUSTERED ([vendor_id])
);

-- CreateTable
CREATE TABLE [dbo].[trs_rfq] (
    [rfq_id] INT NOT NULL IDENTITY(1,1),
    [user_id] INT NOT NULL,
    [rfq_category] NVARCHAR(1000) NOT NULL,
    [rfq_type] NVARCHAR(1000) NOT NULL,
    [rfq_number] NVARCHAR(1000) NOT NULL,
    [rfq_title] NVARCHAR(1000) NOT NULL,
    [rfq_specification] NVARCHAR(1000) NOT NULL,
    [rfq_duedate] DATETIME2 NOT NULL,
    [is_active] INT NOT NULL,
    [is_release] INT NOT NULL,
    [release_by] NVARCHAR(1000) NOT NULL,
    [release_by_name] NVARCHAR(1000) NOT NULL,
    [release_at] DATETIME2 NOT NULL,
    [is_locked] INT NOT NULL,
    [is_deleted] INT NOT NULL,
    [status] INT NOT NULL,
    [created_by] NVARCHAR(1000) NOT NULL,
    [created_at] DATETIME2 NOT NULL,
    [updated_by] NVARCHAR(1000) NOT NULL,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [trs_rfq_pkey] PRIMARY KEY CLUSTERED ([rfq_id])
);

-- CreateTable
CREATE TABLE [dbo].[trs_rfq_detail] (
    [id] INT NOT NULL IDENTITY(1,1),
    [rfq_id] INT NOT NULL,
    [pr_number] NVARCHAR(1000) NOT NULL,
    [pr_item] NVARCHAR(1000) NOT NULL,
    [part_number] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000) NOT NULL,
    [pr_qty] FLOAT(53) NOT NULL,
    [pr_uom] NVARCHAR(1000) NOT NULL,
    [matgroup] NVARCHAR(1000) NOT NULL,
    [status] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL,
    [last_modified_at] DATETIME2 NOT NULL,
    [last_modified_by] NVARCHAR(1000) NOT NULL,
    [is_deleted] INT NOT NULL CONSTRAINT [trs_rfq_detail_is_deleted_df] DEFAULT 0,
    CONSTRAINT [trs_rfq_detail_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[trs_rfq_file] (
    [id] INT NOT NULL IDENTITY(1,1),
    [rfq_id] INT NOT NULL,
    [filename] NVARCHAR(1000) NOT NULL,
    [created_at] DATETIME2 NOT NULL,
    [created_by] NVARCHAR(1000) NOT NULL,
    [updated_at] DATETIME2 NOT NULL,
    [updated_by] NVARCHAR(1000) NOT NULL,
    [is_deleted] INT NOT NULL CONSTRAINT [trs_rfq_file_is_deleted_df] DEFAULT 0,
    CONSTRAINT [trs_rfq_file_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[trs_rfq_picture] (
    [id] INT NOT NULL IDENTITY(1,1),
    [rfq_id] INT NOT NULL,
    [filename] NVARCHAR(1000) NOT NULL,
    [source] VARBINARY(max) NOT NULL,
    [created_at] DATETIME2 NOT NULL,
    [created_by] NVARCHAR(1000) NOT NULL,
    [updated_at] DATETIME2 NOT NULL,
    [updated_by] NVARCHAR(1000) NOT NULL,
    [is_deleted] INT NOT NULL CONSTRAINT [trs_rfq_picture_is_deleted_df] DEFAULT 0,
    CONSTRAINT [trs_rfq_picture_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[trs_rfq_vendor] (
    [id] INT NOT NULL IDENTITY(1,1),
    [rfq_id] INT NOT NULL,
    [vendor_id] INT NOT NULL,
    [status] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL,
    [last_modified_at] DATETIME2 NOT NULL,
    [last_modified_by] NVARCHAR(1000) NOT NULL,
    [is_deleted] INT NOT NULL CONSTRAINT [trs_rfq_vendor_is_deleted_df] DEFAULT 0,
    CONSTRAINT [trs_rfq_vendor_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[ms_plant] ADD CONSTRAINT [ms_plant_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[ms_user]([user_id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ms_material_group] ADD CONSTRAINT [ms_material_group_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[ms_user]([user_id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ms_material] ADD CONSTRAINT [ms_material_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[ms_user]([user_id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ms_material] ADD CONSTRAINT [ms_material_material_group_id_fkey] FOREIGN KEY ([material_group_id]) REFERENCES [dbo].[ms_material_group]([material_group_id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ms_material] ADD CONSTRAINT [ms_material_plant_id_fkey] FOREIGN KEY ([plant_id]) REFERENCES [dbo].[ms_plant]([plant_id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ms_vendor] ADD CONSTRAINT [ms_vendor_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[ms_user]([user_id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[trs_rfq] ADD CONSTRAINT [trs_rfq_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[ms_user]([user_id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[trs_rfq_detail] ADD CONSTRAINT [trs_rfq_detail_rfq_id_fkey] FOREIGN KEY ([rfq_id]) REFERENCES [dbo].[trs_rfq]([rfq_id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[trs_rfq_file] ADD CONSTRAINT [trs_rfq_file_rfq_id_fkey] FOREIGN KEY ([rfq_id]) REFERENCES [dbo].[trs_rfq]([rfq_id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[trs_rfq_picture] ADD CONSTRAINT [trs_rfq_picture_rfq_id_fkey] FOREIGN KEY ([rfq_id]) REFERENCES [dbo].[trs_rfq]([rfq_id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[trs_rfq_vendor] ADD CONSTRAINT [trs_rfq_vendor_rfq_id_fkey] FOREIGN KEY ([rfq_id]) REFERENCES [dbo].[trs_rfq]([rfq_id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[trs_rfq_vendor] ADD CONSTRAINT [trs_rfq_vendor_vendor_id_fkey] FOREIGN KEY ([vendor_id]) REFERENCES [dbo].[ms_vendor]([vendor_id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
