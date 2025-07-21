import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient as SatriaClient } from "../../../generated/satria-client";

const prisma = new SatriaClient();

export const registerVendor = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      company_name,
      telephone,
      address,
      email,
      password,
      vendor_category,
      referral,
      company_aff_id,
      kbli_id,
      nib,
    } = req.body;

    // Validasi semua input wajib
    if (
      !company_name || !telephone || !address || !email || !password ||
      !vendor_category || !nib || !company_aff_id || !kbli_id ||
      !Array.isArray(kbli_id) || kbli_id.length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "All data must be filled in and the KBLI ID must be an array."
      });
      return;
    }

    // Validasi panjang nib
    if (nib.length > 13) {
      res.status(400).json({
        success: false,
        message: "NIB maximum 13 characters."
      });
      return;
    }

    // Validasi angka
    const parsedAffId = Number(company_aff_id);
    const parsedKbliIds = kbli_id.map((id: any) => Number(id));

    if (isNaN(parsedAffId)) {
      res.status(400).json({
        success: false,
        message: "company affiliate must be numeric."
      });
      return;
    }

    if (parsedKbliIds.some(isNaN)) {
      res.status(400).json({
        success: false,
        message: "All KBLI IDs must be numeric."
      });
      return;
    }

    // Cek email sudah terdaftar
    const existingEmail = await prisma.register_vendor.findUnique({ where: { email } });
    if (existingEmail) {
      res.status(400).json({
        success: false,
        message: "Email is already registered."
      });
      return;
    }

    // Cek NIB sudah digunakan
    const existingNIB = await prisma.register_vendor.findFirst({ where: { nib } });
    if (existingNIB) {
      res.status(400).json({
        success: false,
        message: "NIB has been registered."
      });
      return;
    }
// ⬇ Tambahkan di sini
if (!/^\d+$/.test(nib)) {
  res.status(400).json({
    success: false,
    message: "NIB may only contain numbers.",
  });
  return;
}
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan ke register_vendor
    const reg = await prisma.register_vendor.create({
      data: {
        company_name,
        telephone,
        address,
        email,
        password: hashedPassword,
        vendor_category,
        referral,
        company_aff_id: parsedAffId,
        nib,
      },
    });

    // Simpan ke ms_kbli_detail
    for (const kbliId of parsedKbliIds) {
      await prisma.ms_kbli_detail.create({
        data: {
          kbli_id: kbliId,
          register_vendor_id: reg.id,
        },
      });
    }

    // Simpan ke ms_vendor
    const vendor = await prisma.ms_vendor.create({
      data: {
        name: company_name,
        email,
        password: hashedPassword,
        address,
        vendor_type: vendor_category,
        phone_no: telephone,
        email_po: email,
        vendor_code: nib,
        country_code: "",
        postal_code: "",
        created_at: new Date(),
        updated_at: new Date(),
        created_by: "system",
        last_modified_by: "system",
        is_deleted: 0,
      },
    });

    // Update register_vendor dengan vendor_id
    await prisma.register_vendor.update({
      where: { id: reg.id },
      data: { vendor_id: vendor.vendor_id },
    });

    res.status(201).json({
      success: true,
      message: "Vendor successfully registered.",
      data: {
        register_id: reg.id,
        vendor_id: vendor.vendor_id,
      },
    });

  } catch (error: any) {
    console.error("Error Register Vendor:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred on the server.",
      error: error.message,
    });
  }
};
