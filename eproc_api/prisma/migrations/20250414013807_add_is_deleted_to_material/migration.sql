BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[users] (
    [id] INT NOT NULL IDENTITY(1,1),
    [username] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [created_at] DATETIME2 NOT NULL,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [users_username_key] UNIQUE NONCLUSTERED ([username])
);

-- CreateTable
CREATE TABLE [dbo].[tb_rfq] (
    [id] INT NOT NULL IDENTITY(1,1),
    [year] INT NOT NULL,
    [rfq_category] VARCHAR(16) NOT NULL,
    [rfq_type] VARCHAR(12) NOT NULL,
    [rfq_number] VARCHAR(128) NOT NULL,
    [rfq_title] TEXT NOT NULL,
    [rfq_specification] TEXT NOT NULL,
    [rfq_duedate] DATE NOT NULL,
    [bid_type] VARCHAR(32) NOT NULL,
    [any_kbli] BIT NOT NULL,
    [is_active] BIT NOT NULL,
    [is_release] BIT NOT NULL,
    [release_by] INT NOT NULL,
    [release_by_name] VARCHAR(128) NOT NULL,
    [release_at] DATETIME2,
    [is_locked] BIT NOT NULL,
    [is_deleted] BIT NOT NULL,
    [status] INT NOT NULL,
    [created_by] VARCHAR(64) NOT NULL,
    [created_at] DATETIME2 NOT NULL,
    [updated_by] VARCHAR(64) NOT NULL,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [tb_rfq_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[tb_rfq_detail] (
    [id] INT NOT NULL IDENTITY(1,1),
    [rfq_id] INT NOT NULL,
    [rfq_number] VARCHAR(128) NOT NULL,
    [pr_number] VARCHAR(64) NOT NULL,
    [pr_item] VARCHAR(6) NOT NULL,
    [part_number] VARCHAR(64) NOT NULL,
    [description] TEXT NOT NULL,
    [pr_qty] FLOAT(53) NOT NULL,
    [pr_uom] VARCHAR(8) NOT NULL,
    [matgroup] VARCHAR(64) NOT NULL,
    [estimated_cost] NVARCHAR(1000) NOT NULL,
    [status] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL,
    [last_modified_at] DATETIME2 NOT NULL,
    [last_modified_by] VARCHAR(255) NOT NULL,
    CONSTRAINT [tb_rfq_detail_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[tb_rfq_kbli] (
    [id] INT NOT NULL IDENTITY(1,1),
    [rfq_id] INT NOT NULL,
    [rfq_number] VARCHAR(128) NOT NULL,
    [kbli_code] VARCHAR(12) NOT NULL,
    [kbli_title] TEXT NOT NULL,
    [status] BIT NOT NULL,
    [created_at] DATETIME2 NOT NULL,
    [last_modified_at] DATETIME2 NOT NULL,
    [last_modified_by] VARCHAR(255) NOT NULL,
    CONSTRAINT [tb_rfq_kbli_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[tb_rfq_vendor] (
    [id] INT NOT NULL IDENTITY(1,1),
    [rfq_id] INT NOT NULL,
    [rfq_number] VARCHAR(128) NOT NULL,
    [vendor_name] VARCHAR(128) NOT NULL,
    [vendor_code] VARCHAR(64) NOT NULL,
    [vendor_code_new] VARCHAR(64) NOT NULL,
    [email] VARCHAR(255) NOT NULL,
    [status] BIT NOT NULL,
    [created_at] DATETIME2 NOT NULL,
    [last_modified_at] DATETIME2 NOT NULL,
    [last_modified_by] VARCHAR(255) NOT NULL,
    CONSTRAINT [tb_rfq_vendor_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[tb_rfq_file] (
    [id] INT NOT NULL IDENTITY(1,1),
    [rfq_id] INT NOT NULL,
    [filename] TEXT NOT NULL,
    [created_at] DATETIME2 NOT NULL,
    [created_by] VARCHAR(18) NOT NULL,
    [updated_at] DATETIME2 NOT NULL,
    [updated_by] VARCHAR(18) NOT NULL,
    CONSTRAINT [tb_rfq_file_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[tb_rfq_picture] (
    [id] INT NOT NULL IDENTITY(1,1),
    [rfq_id] INT NOT NULL,
    [filename] TEXT NOT NULL,
    [source] VARBINARY(max) NOT NULL,
    [created_at] DATETIME2 NOT NULL,
    [created_by] VARCHAR(18) NOT NULL,
    [updated_at] DATETIME2 NOT NULL,
    [updated_by] VARCHAR(18) NOT NULL,
    CONSTRAINT [tb_rfq_picture_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Material] (
    [id] INT NOT NULL IDENTITY(1,1),
    [material_number] NVARCHAR(1000) NOT NULL,
    [material_description] NVARCHAR(1000) NOT NULL,
    [material_group] NVARCHAR(1000) NOT NULL,
    [material_group_description] NVARCHAR(1000),
    [material_type] NVARCHAR(1000) NOT NULL,
    [base_unit] NVARCHAR(1000) NOT NULL,
    [plant] NVARCHAR(1000) NOT NULL,
    [is_deleted] INT NOT NULL CONSTRAINT [Material_is_deleted_df] DEFAULT 0,
    [created_at] DATETIME2 NOT NULL,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [Material_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Subcontractor] (
    [id] INT NOT NULL IDENTITY(1,1),
    [Material] NVARCHAR(1000) NOT NULL,
    [Description] NVARCHAR(1000) NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [Subcontractor_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [version] INT,
    [vendorId] INT,
    [status] NVARCHAR(1000),
    CONSTRAINT [Subcontractor_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[tb_rfq_detail] ADD CONSTRAINT [tb_rfq_detail_rfq_id_fkey] FOREIGN KEY ([rfq_id]) REFERENCES [dbo].[tb_rfq]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[tb_rfq_kbli] ADD CONSTRAINT [tb_rfq_kbli_rfq_id_fkey] FOREIGN KEY ([rfq_id]) REFERENCES [dbo].[tb_rfq]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[tb_rfq_vendor] ADD CONSTRAINT [tb_rfq_vendor_rfq_id_fkey] FOREIGN KEY ([rfq_id]) REFERENCES [dbo].[tb_rfq]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[tb_rfq_file] ADD CONSTRAINT [tb_rfq_file_rfq_id_fkey] FOREIGN KEY ([rfq_id]) REFERENCES [dbo].[tb_rfq]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[tb_rfq_picture] ADD CONSTRAINT [tb_rfq_picture_rfq_id_fkey] FOREIGN KEY ([rfq_id]) REFERENCES [dbo].[tb_rfq]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
