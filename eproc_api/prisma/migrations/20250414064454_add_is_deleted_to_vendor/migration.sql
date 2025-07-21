BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Material] ALTER COLUMN [is_deleted] INT NULL;
ALTER TABLE [dbo].[Material] ALTER COLUMN [created_at] DATETIME2 NULL;
ALTER TABLE [dbo].[Material] ALTER COLUMN [updated_at] DATETIME2 NULL;

-- CreateTable
CREATE TABLE [dbo].[Vendor] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [countryCode] NVARCHAR(1000),
    [postalCode] NVARCHAR(1000),
    [address] NVARCHAR(1000),
    [vendorCode] NVARCHAR(1000),
    [vendorCode_new] NVARCHAR(1000),
    [phoneNo] NVARCHAR(1000),
    [vendorType] NVARCHAR(1000),
    [emailPO] NVARCHAR(1000),
    [province] NVARCHAR(1000),
    [city] NVARCHAR(1000),
    [statusPenanamanModal] NVARCHAR(1000),
    [jenisUsaha] NVARCHAR(1000),
    [noNib] NVARCHAR(1000),
    [fileNib] NVARCHAR(1000),
    [noNpwp] NVARCHAR(1000),
    [fileNpwp] NVARCHAR(1000),
    [nameBank] NVARCHAR(1000),
    [noRekening] NVARCHAR(1000),
    [atasNamaRekening] NVARCHAR(1000),
    [fileRekening] NVARCHAR(1000),
    [fileAktaPendirian] NVARCHAR(1000),
    [fileAnggaranDasar] NVARCHAR(1000),
    [fileIjinUsaha] NVARCHAR(1000),
    [fileSkdp] NVARCHAR(1000),
    [fileKtpDireksi] NVARCHAR(1000),
    [fileSkt] NVARCHAR(1000),
    [sppkp] NVARCHAR(1000),
    [fileSppkp] NVARCHAR(1000),
    [suratAgen] NVARCHAR(1000),
    [fileSuratAgen] NVARCHAR(1000),
    [filePernyataanRekening] NVARCHAR(1000),
    [filePernyataanPajak] NVARCHAR(1000),
    [fileEtikaBertransaksi] NVARCHAR(1000),
    [fileAhu] NVARCHAR(1000),
    [fileSertifikatStandar] NVARCHAR(1000),
    [filePkkpr] NVARCHAR(1000),
    [fileAktaPenyesuaianUupt] NVARCHAR(1000),
    [fileAktaPerubahan] NVARCHAR(1000),
    [fileLingkunganPerusahaan] NVARCHAR(1000),
    [filePelaporanPajak] NVARCHAR(1000),
    [badanHukum] NVARCHAR(1000),
    [fax] NVARCHAR(1000),
    [jenisBarang] NVARCHAR(1000),
    [namaBarang] NVARCHAR(1000),
    [contactPerson] NVARCHAR(1000),
    [jabatan] NVARCHAR(1000),
    [handphone] NVARCHAR(1000),
    [paymentMethod] NVARCHAR(1000),
    [currency] NVARCHAR(1000),
    [kantorCabang] NVARCHAR(1000),
    [fileMasterVendor] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Vendor_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(1000) NOT NULL,
    [updatedAt] DATETIME2 NOT NULL,
    [lastModifiedBy] NVARCHAR(1000) NOT NULL,
    [is_deleted] INT CONSTRAINT [Vendor_is_deleted_df] DEFAULT 0,
    CONSTRAINT [Vendor_pkey] PRIMARY KEY CLUSTERED ([id])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
