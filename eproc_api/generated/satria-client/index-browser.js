
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable',
  Snapshot: 'Snapshot'
});

exports.Prisma.Ms_userScalarFieldEnum = {
  user_id: 'user_id',
  username: 'username',
  password: 'password',
  personal_number: 'personal_number',
  dept: 'dept',
  department: 'department',
  division: 'division',
  email_sf: 'email_sf',
  role: 'role',
  created_at: 'created_at',
  is_deleted: 'is_deleted'
};

exports.Prisma.Ms_plantScalarFieldEnum = {
  plant_id: 'plant_id',
  plant: 'plant',
  postcode: 'postcode',
  city: 'city',
  name: 'name',
  is_deleted: 'is_deleted',
  user_id: 'user_id'
};

exports.Prisma.Ms_material_groupScalarFieldEnum = {
  material_group_id: 'material_group_id',
  material_type: 'material_type',
  material_group: 'material_group',
  material_group_description: 'material_group_description',
  is_deleted: 'is_deleted',
  user_id: 'user_id'
};

exports.Prisma.Ms_materialScalarFieldEnum = {
  material_id: 'material_id',
  material_group_id: 'material_group_id',
  material_number: 'material_number',
  base_unit: 'base_unit',
  plant_id: 'plant_id',
  is_deleted: 'is_deleted',
  material_description: 'material_description'
};

exports.Prisma.Ms_vendorScalarFieldEnum = {
  vendor_id: 'vendor_id',
  name: 'name',
  email: 'email',
  country_code: 'country_code',
  postal_code: 'postal_code',
  address: 'address',
  vendor_code: 'vendor_code',
  phone_no: 'phone_no',
  vendor_type: 'vendor_type',
  email_po: 'email_po',
  created_at: 'created_at',
  created_by: 'created_by',
  updated_at: 'updated_at',
  last_modified_by: 'last_modified_by',
  is_deleted: 'is_deleted',
  password: 'password'
};

exports.Prisma.Register_vendorScalarFieldEnum = {
  id: 'id',
  company_name: 'company_name',
  email: 'email',
  password: 'password',
  telephone: 'telephone',
  address: 'address',
  nib: 'nib',
  vendor_category: 'vendor_category',
  referral: 'referral',
  company_aff_id: 'company_aff_id',
  vendor_id: 'vendor_id',
  created_at: 'created_at'
};

exports.Prisma.Ms_kbliScalarFieldEnum = {
  id: 'id',
  year: 'year',
  code: 'code',
  title: 'title',
  description: 'description',
  enable: 'enable',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.Ms_kbli_detailScalarFieldEnum = {
  id: 'id',
  kbli_id: 'kbli_id',
  register_vendor_id: 'register_vendor_id'
};

exports.Prisma.Trs_rfqScalarFieldEnum = {
  rfq_id: 'rfq_id',
  user_id: 'user_id',
  rfq_category: 'rfq_category',
  rfq_type: 'rfq_type',
  rfq_number: 'rfq_number',
  rfq_title: 'rfq_title',
  rfq_specification: 'rfq_specification',
  rfq_duedate: 'rfq_duedate',
  is_active: 'is_active',
  is_release: 'is_release',
  release_by: 'release_by',
  release_by_name: 'release_by_name',
  release_at: 'release_at',
  is_locked: 'is_locked',
  is_deleted: 'is_deleted',
  status: 'status',
  created_by: 'created_by',
  created_at: 'created_at',
  updated_by: 'updated_by',
  updated_at: 'updated_at',
  approved_at: 'approved_at',
  is_approved: 'is_approved'
};

exports.Prisma.Trs_rfq_vendorScalarFieldEnum = {
  id: 'id',
  rfq_id: 'rfq_id',
  vendor_id: 'vendor_id',
  status: 'status',
  created_at: 'created_at',
  last_modified_at: 'last_modified_at',
  last_modified_by: 'last_modified_by',
  is_deleted: 'is_deleted'
};

exports.Prisma.Trs_rfq_detailScalarFieldEnum = {
  id: 'id',
  rfq_id: 'rfq_id',
  pr_number: 'pr_number',
  pr_item: 'pr_item',
  part_number: 'part_number',
  description: 'description',
  pr_qty: 'pr_qty',
  pr_uom: 'pr_uom',
  matgroup: 'matgroup',
  status: 'status',
  created_at: 'created_at',
  last_modified_at: 'last_modified_at',
  last_modified_by: 'last_modified_by',
  is_deleted: 'is_deleted',
  source_type: 'source_type'
};

exports.Prisma.Trs_rfq_fileScalarFieldEnum = {
  id: 'id',
  rfq_id: 'rfq_id',
  filename: 'filename',
  created_at: 'created_at',
  created_by: 'created_by',
  updated_at: 'updated_at',
  updated_by: 'updated_by',
  is_deleted: 'is_deleted',
  source: 'source'
};

exports.Prisma.Trs_rfq_pictureScalarFieldEnum = {
  id: 'id',
  rfq_id: 'rfq_id',
  filename: 'filename',
  source: 'source',
  created_at: 'created_at',
  created_by: 'created_by',
  updated_at: 'updated_at',
  updated_by: 'updated_by',
  is_deleted: 'is_deleted'
};

exports.Prisma.Vendor_quotationScalarFieldEnum = {
  id: 'id',
  rfq_detail_id: 'rfq_detail_id',
  vendor_id: 'vendor_id',
  price: 'price',
  moq: 'moq',
  valid_until: 'valid_until',
  attachment: 'attachment',
  is_submitted: 'is_submitted',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.SubcontractorScalarFieldEnum = {
  id: 'id',
  Material: 'Material',
  Description: 'Description',
  material_group: 'material_group',
  uom: 'uom'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  ms_user: 'ms_user',
  ms_plant: 'ms_plant',
  ms_material_group: 'ms_material_group',
  ms_material: 'ms_material',
  ms_vendor: 'ms_vendor',
  register_vendor: 'register_vendor',
  ms_kbli: 'ms_kbli',
  ms_kbli_detail: 'ms_kbli_detail',
  trs_rfq: 'trs_rfq',
  trs_rfq_vendor: 'trs_rfq_vendor',
  trs_rfq_detail: 'trs_rfq_detail',
  trs_rfq_file: 'trs_rfq_file',
  trs_rfq_picture: 'trs_rfq_picture',
  vendor_quotation: 'vendor_quotation',
  Subcontractor: 'Subcontractor'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
