import { Router } from "express";
import multer from "multer";

// Controllers
import { getAllMaterials, getMaterialById, createMaterial, updateMaterial, deleteMaterial, } from "../controllers/cms/MaterialController";
import { getAllMaterialGroups, getMaterialGroupById, createMaterialGroup, updateMaterialGroup, deleteMaterialGroup,} from "../controllers/cms/MaterialGroupController";
import { getAllPlants, getPlantById, createPlant, updatePlant, deletePlant, } from "../controllers/cms/PlantController";
import { getAllUsers, getUserById, createUser, updateUser, deleteUser, } from "../controllers/cms/UserController";
import { getAllVendors, getVendorById, createVendor, updateVendor, deleteVendor, } from "../controllers/cms/VendorController";
import { getAllRFQs, getRFQById, createRFQ, updateRFQ, approveRfq, archiveRFQ, rejectRfq, downloadRFQPicture, downloadRFQFile, getRfqDetailById, } from "../controllers/cms/TrsRfqController";
import { getRfqDetailsByRfqId, createRfqDetail, updateRfqDetail, deleteRfqDetail, } from "../controllers/cms/TrsRfqDetailController";
import { getPicturesByRfqId, uploadRfqPicture, deleteRfqPicture, } from "../controllers/cms/TrsRfqPictureController";
import { getFilesByRfqId, uploadRfqFile, deleteRfqFile, } from "../controllers/cms/TrsRfqFileController";
import { getVendorsByRfqId, addVendorToRfq, updateRfqVendor, deleteRfqVendor, } from "../controllers/cms/TrsRfqVendorController";
import { getAllSubcontractors } from '../controllers/cms/SubcontractorController';
import { getDashboardSummary, getDashboardVendorSummary  } from "../controllers/cms/DashboardController"; 
import { getAllKblis, getKbliById, createKbli, updateKbli, deleteKbli, } from "../controllers/cms/KbliController";
import { registerVendor } from "../controllers/cms/RegisterVendorController";
import { submitVendorQuotation,getVendorRFQToQuote, updateVendorQuotation, getVendorQuotationDetail, downloadQuotationAttachment    } from "../controllers/cms/VendorQuotationController";
import { getReportRFQ, getVendorReport } from "../controllers/cms/ReportController";

const router = Router();
const upload = multer();

// Dashboard Routes
router.get("/dashboard-vendor", getDashboardVendorSummary);
router.get("/dashboard", getDashboardSummary);

// Master Routes
router.get("/materials", getAllMaterials);
router.get("/materials/:id", getMaterialById);
router.post("/materials", createMaterial);
router.put("/materials/:id", updateMaterial);
router.delete("/materials/:id", deleteMaterial);

router.get("/material-groups", getAllMaterialGroups);
router.get("/material-groups/:id", getMaterialGroupById);
router.post("/material-groups", createMaterialGroup);
router.put("/material-groups/:id", updateMaterialGroup);
router.delete("/material-groups/:id", deleteMaterialGroup);

router.get("/plants", getAllPlants);
router.get("/plants/:id", getPlantById);
router.post("/plants", createPlant);
router.put("/plants/:id", updatePlant);
router.delete("/plants/:id", deletePlant);

router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

router.get("/vendors", getAllVendors);
router.get("/vendors/:id", getVendorById);
router.post("/vendors", createVendor);
router.put("/vendors/:id", updateVendor);
router.delete("/vendors/:id", deleteVendor);

router.get("/kblis", getAllKblis);
router.get("/kblis/:id", getKbliById);
router.post("/kblis", createKbli);
router.put("/kblis/:id", updateKbli);
router.delete("/kblis/:id", deleteKbli);

// Transactional Routes - RFQ
router.get("/rfq", getAllRFQs);
router.get("/rfq/:id", getRFQById);
router.post(
  "/rfq",
  upload.fields([
    { name: "rfqPicture", maxCount: 1 },
    { name: "rfqAttachment", maxCount: 1 }
  ]),
  createRFQ
);
router.put("/rfq/:id", updateRFQ);
router.delete("/rfq/:id", archiveRFQ);
router.put("/rfq/:id/approve", approveRfq);
router.put("/rfq/:id/reject", rejectRfq);
router.get("/rfq-picture/:id", downloadRFQPicture);
router.get("/rfq-attachment/:id", downloadRFQFile);

// RFQ Details
router.get("/rfq/:rfq_id/details", getRfqDetailsByRfqId);
router.post("/rfq/:rfq_id/details", createRfqDetail);
router.put("/rfq/details/:id", updateRfqDetail);
router.delete("/rfq/details/:id", deleteRfqDetail);

// RFQ Pictures
router.get("/rfq/:rfq_id/pictures", getPicturesByRfqId);
router.post("/rfq/:rfq_id/pictures", upload.single("file"), uploadRfqPicture);
router.delete("/rfq/pictures/:id", deleteRfqPicture);

// RFQ Files
router.get("/rfq/:rfq_id/files", getFilesByRfqId);
router.post("/rfq/:rfq_id/files", upload.single("file"), uploadRfqFile);
router.delete("/rfq/files/:id", deleteRfqFile);

// RFQ Vendors
router.get("/rfq/:rfq_id/vendors", getVendorsByRfqId);
router.post("/rfq/:rfq_id/vendors", addVendorToRfq);
router.put("/rfq/vendors/:id", updateRfqVendor);
router.delete("/rfq/vendors/:id", deleteRfqVendor);

router.get('/subcontractor', getAllSubcontractors);

//Report Routes
router.get("/report", getReportRFQ);
router.get("/report/vendor", getVendorReport); 
router.post("/vendor-quotation", submitVendorQuotation);
router.get("/vendor-quotation", getVendorRFQToQuote);
router.post("/register-vendors", registerVendor);
router.get("/rfq/details/:id", getRfqDetailById);
router.put("/vendor-quotation", updateVendorQuotation);
router.get("/vendor-detail", getVendorQuotationDetail);
router.get("/vendor-quotation/:quotation_id/download", downloadQuotationAttachment);



export default router;
