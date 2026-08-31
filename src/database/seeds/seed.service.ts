import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as readline from 'readline';
import * as path from 'path';

import { User, UserRole } from '../../modules/users/entities/user.entity';
import { Role } from '../../modules/roles/entities/role.entity';
import { Brand } from '../../modules/brands/entities/brand.entity';
import { Engine } from '../../modules/engines/entities/engine.entity';
import { Gearbox } from '../../modules/gearboxes/entities/gearbox.entity';
import { Vehicle } from '../../modules/vehicles/entities/vehicle.entity';
import { Product } from '../../modules/products/entities/product.entity';
import { ProductSupplierInfo } from '../../modules/supplier-info/entities/supplier-info.entity';
import { Attachment } from '../../modules/attachments/entities/attachment.entity';
import { Account, AccountType } from '../../modules/accounting/entities/account.entity';
import { Invoice, InvoiceStatus, InvoiceType } from '../../modules/accounting/entities/invoice.entity';
import { InvoiceItem } from '../../modules/accounting/entities/invoice-item.entity';
import { Order, OrderStatus } from '../../modules/orders/entities/order.entity';
import { OrderItem } from '../../modules/orders/entities/order-item.entity';
import { PurchaseOrder, PurchaseStatus } from '../../modules/purchases/entities/purchase-order.entity';
import { PurchaseItem } from '../../modules/purchases/entities/purchase-item.entity';
import { AuditLog } from '../../modules/audit-logs/entities/audit-log.entity';
import { StockMove, StockMoveType } from '../../modules/inventory/entities/stock-move.entity';
import { StockPicking, PickingStatus } from '../../modules/inventory/entities/stock-picking.entity';

import { OrdersService } from '../../modules/orders/orders.service';
import { PurchasesService } from '../../modules/purchases/purchases.service';
import { InventoryService } from '../../modules/inventory/inventory.service';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Engine)
    private readonly engineRepository: Repository<Engine>,
    @InjectRepository(Gearbox)
    private readonly gearboxRepository: Repository<Gearbox>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductSupplierInfo)
    private readonly supplierInfoRepository: Repository<ProductSupplierInfo>,
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
    @InjectRepository(PurchaseOrder)
    private readonly purchaseRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseItem)
    private readonly purchaseItemRepository: Repository<PurchaseItem>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(StockPicking)
    private readonly stockPickingRepository: Repository<StockPicking>,
    @InjectRepository(StockMove)
    private readonly stockMoveRepository: Repository<StockMove>,
    private readonly ordersService: OrdersService,
    private readonly purchasesService: PurchasesService,
    private readonly inventoryService: InventoryService,
  ) {}

  async seed() {
    this.logger.log('🌱 Bắt đầu dọn dẹp data cũ & nạp Dữ Liệu Thực Từ CSDL Odoo Backup (dump.sql)...');

    try {
      await this.stockMoveRepository.createQueryBuilder().delete().execute();
      await this.stockPickingRepository.createQueryBuilder().delete().execute();
      await this.auditLogRepository.createQueryBuilder().delete().execute();
      await this.purchaseItemRepository.createQueryBuilder().delete().execute();
      await this.purchaseRepository.createQueryBuilder().delete().execute();
      await this.orderItemRepository.createQueryBuilder().delete().execute();
      await this.orderRepository.createQueryBuilder().delete().execute();
      await this.supplierInfoRepository.createQueryBuilder().delete().execute();
      await this.productRepository.createQueryBuilder().delete().execute();
      await this.vehicleRepository.createQueryBuilder().delete().execute();
      await this.engineRepository.createQueryBuilder().delete().execute();
      await this.gearboxRepository.createQueryBuilder().delete().execute();
      await this.attachmentRepository.createQueryBuilder().delete().execute();
    } catch (e) {
      this.logger.warn('Lỗi nhẹ khi dọn dẹp data cũ:', e.message);
    }

    const rolesMap = await this.seedRoles();
    await this.seedUsers(rolesMap);
    const brandsMap = await this.seedRealBrands();
    const enginesMap = await this.seedRealEngines();
    const gearboxesMap = await this.seedRealGearboxes();
    const vehiclesMap = await this.seedRealVehicles(enginesMap, gearboxesMap);
    const productsMap = await this.seedRealProducts(brandsMap, vehiclesMap, enginesMap, gearboxesMap);
    await this.seedRealSupplierInfo(productsMap);
    await this.seedOdooAttachments(productsMap, brandsMap, vehiclesMap);
    await this.seedAccounts();
    await this.seedSampleInvoices();
    await this.seedOdooOrdersAndPurchases(productsMap);
    await this.seedOdooAuditLogs();
    await this.seedOdooStockPickings();
    await this.seedOdooStockMoves(productsMap);

    this.logger.log('✅ Đã nạp hoàn tất toàn bộ Dữ Liệu Thực Odoo vào hệ thống NestJS Backend!');
  }

  private async seedRoles(): Promise<Record<string, Role>> {
    this.logger.log('--> Seeding Roles Table...');
    const defaultRoles = [
      { name: 'Super Administrator', code: UserRole.SUPERADMIN, level: 100, description: 'Tối cao hệ thống', isSystem: true },
      { name: 'Administrator', code: UserRole.ADMIN, level: 80, description: 'Quản trị viên', isSystem: true },
      { name: 'Store Manager', code: UserRole.MANAGER, level: 60, description: 'Quản lý kho & kế toán', isSystem: true },
      { name: 'Warehouse Staff', code: UserRole.STAFF, level: 40, description: 'Nhân viên tác nghiệp', isSystem: true },
      { name: 'Client User', code: UserRole.USER, level: 20, description: 'Người dùng cơ bản', isSystem: true },
    ];

    const rolesMap: Record<string, Role> = {};
    for (const r of defaultRoles) {
      let role = await this.roleRepository.findOne({ where: { code: r.code } });
      if (!role) {
        role = await this.roleRepository.save(this.roleRepository.create(r));
      }
      rolesMap[r.code] = role;
    }
    return rolesMap;
  }

  private async seedUsers(rolesMap: Record<string, Role>) {
    this.logger.log('--> Seeding Users...');
    const defaultPassword = await bcrypt.hash('Password123!', 10);

    const sampleUsers = [
      { email: 'superadmin@qbabms.com', password: defaultPassword, fullName: 'Super Administrator', role: rolesMap[UserRole.SUPERADMIN], isActive: true },
      { email: 'admin@qbabms.com', password: defaultPassword, fullName: 'Quản Trị Viên Hệ Thống', role: rolesMap[UserRole.ADMIN], isActive: true },
      { email: 'manager@qbabms.com', password: defaultPassword, fullName: 'Quản Lý Kho & Đơn Hàng', role: rolesMap[UserRole.MANAGER], isActive: true },
      { email: 'staff@qbabms.com', password: defaultPassword, fullName: 'Nhân Viên Tác Nghiệp Kho', role: rolesMap[UserRole.STAFF], isActive: true },
      { email: 'user@qbabms.com', password: defaultPassword, fullName: 'Khách Hàng Dùng Thử', role: rolesMap[UserRole.USER], isActive: true },
    ];

    for (const u of sampleUsers) {
      const existing = await this.userRepository.findOne({ where: { email: u.email } });
      if (!existing) {
        await this.userRepository.save(this.userRepository.create(u));
      } else if (!existing.role) {
        existing.role = u.role;
        await this.userRepository.save(existing);
      }
    }
  }

  private async seedRealBrands(): Promise<Record<string, Brand>> {
    this.logger.log('--> Seeding Real Brands từ qba_brand (dump.sql)...');
    const dumpPath = path.join(process.cwd(), 'software', 'dump.sql');
    const brandsMap: Record<string, Brand> = {};

    const defaultBrandNames = [
      'SINOTRUK', 'DONGFENG', 'SHACMAN', 'WEICHAI', 'FAST GEAR',
      'FAW', 'FOTON', 'CHENGLONG', 'ISUZU', 'FUWA',
      'YUCHAI', 'QUANCHAI', 'SORL', 'WABCO', 'CREATEK',
      'SAMTIN', 'TIELIU', 'KOYO', 'TIMKEN', 'MAT',
      'ANTEK', 'ASEAN', 'CHUAN LU', 'FULAE', 'HANGDA',
      'MP', 'HOLSET', 'HUATAI', 'HYDUN', 'KATE',
      'LATITUDE', 'LIZHONG', 'LK', 'LOVOL', 'MC',
      'NXAT', 'OUSIA', 'PENNER', 'QUANGUAN', 'RICKENT',
      'SCHNEIDER', 'SHILIDUO', 'TAIMAU', 'VALVE', 'VÂN NỘI',
      'XCBB.LXĐ', 'X-POWER.LXĐ', 'YUCHI', 'YUNDONG', 'ZGZK',
      'ZIJINGGANG', 'OUERMAN-AT', 'TRUCKIN', 'XIBEI', 'HNP',
      'SCDL', 'HOWO', 'OUERMAN', 'XINCHAI', 'TRUCKIN PARTS',
      'JAPAN', 'TONGSHI', 'ZILONG', 'KOREA MP', 'FOTON TRUKIN PARTS',
      'SAMDA', 'DECC', 'LIUSHENG', 'WANYA', 'AUTOBELT',
      'DONGIL', 'CUMMINS', 'WEURADIC', 'YUNNEI', 'QUANXING', 'ANEK', 'BA',
    ];

    if (fs.existsSync(dumpPath)) {
      let fileStream = fs.createReadStream(dumpPath);
      let rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
      let mode: string | null = null;

      for await (const line of rl) {
        if (line.startsWith('COPY public.qba_brand (')) { mode = 'brand'; continue; }
        if (mode === 'brand' && line.startsWith('\\.')) { mode = null; break; }

        if (mode === 'brand') {
          const parts = line.split('\t');
          const name = (parts[3] && parts[3] !== '\\N') ? parts[3].trim() : null;
          if (name && !defaultBrandNames.includes(name)) {
            defaultBrandNames.push(name);
          }
        }
      }
    }

    for (const name of defaultBrandNames) {
      let brand = await this.brandRepository.findOne({ where: { name } });
      if (!brand) {
        brand = await this.brandRepository.save(this.brandRepository.create({ name }));
      }
      brandsMap[name] = brand;
    }
    this.logger.log(`  + ✅ Đã nạp thành công ${Object.keys(brandsMap).length} Thương Hiệu thực từ dump.sql vào CSDL!`);
    return brandsMap;
  }

  private async seedRealEngines(): Promise<Record<string, Engine>> {
    this.logger.log('--> Seeding ALL Real Engines từ qba_engine (dump.sql)...');
    const dumpPath = path.join(process.cwd(), 'software', 'dump.sql');
    const enginesMap: Record<string, Engine> = {};

    if (!fs.existsSync(dumpPath)) return enginesMap;

    let fileStream = fs.createReadStream(dumpPath);
    let rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    const rawEngines: Array<{ name: string; brand?: string; capacity?: string; horsepower?: string; torque?: string; emissionStandard?: string; category?: string; vehicleModels?: string }> = [];
    let mode: string | null = null;

    for await (const line of rl) {
      if (line.startsWith('COPY public.qba_engine (')) { mode = 'engine'; continue; }
      if (mode === 'engine' && line.startsWith('\\.')) { mode = null; break; }

      if (mode === 'engine') {
        const parts = line.split('\t');
        const name = (parts[4] && parts[4] !== '\\N') ? parts[4].trim() : null;
        if (name) {
          const brand = (parts[3] && parts[3] !== '\\N') ? parts[3].trim() : undefined;
          const capacity = (parts[5] && parts[5] !== '\\N') ? parts[5].trim() : undefined;
          const horsepower = (parts[6] && parts[6] !== '\\N') ? parts[6].trim() : undefined;
          const torque = (parts[7] && parts[7] !== '\\N') ? parts[7].trim() : undefined;
          const emissionStandard = (parts[8] && parts[8] !== '\\N') ? parts[8].trim() : undefined;
          const category = (parts[9] && parts[9] !== '\\N') ? parts[9].trim() : undefined;
          const vehicleModels = (parts[10] && parts[10] !== '\\N') ? parts[10].trim() : undefined;

          rawEngines.push({ name, brand, capacity, horsepower, torque, emissionStandard, category, vehicleModels });
        }
      }
    }

    for (const engData of rawEngines) {
      let engine = await this.engineRepository.findOne({ where: { name: engData.name } });
      if (!engine) {
        engine = await this.engineRepository.save(this.engineRepository.create(engData));
      }
      enginesMap[engData.name] = engine;
    }
    this.logger.log(`  + ✅ Đã nạp thành công ${Object.keys(enginesMap).length} Động Cơ thực từ dump.sql vào CSDL!`);
    return enginesMap;
  }

  // Nạp & Migrate TOÀN BỘ Hộp Số thực từ qba_gearbox trong dump.sql
  private async seedRealGearboxes(): Promise<Record<string, Gearbox>> {
    this.logger.log('--> Seeding ALL Real Gearboxes từ qba_gearbox (dump.sql)...');
    const dumpPath = path.join(process.cwd(), 'software', 'dump.sql');
    const gearboxesMap: Record<string, Gearbox> = {};

    if (!fs.existsSync(dumpPath)) return gearboxesMap;

    let fileStream = fs.createReadStream(dumpPath);
    let rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    const rawGearboxes: Array<{ name: string; brand?: string; ratio?: string; category?: string; note?: string; vehicleModels?: string }> = [];
    let mode: string | null = null;

    for await (const line of rl) {
      if (line.startsWith('COPY public.qba_gearbox (')) { mode = 'gearbox'; continue; }
      if (mode === 'gearbox' && line.startsWith('\\.')) { mode = null; break; }

      if (mode === 'gearbox') {
        const parts = line.split('\t');
        const name = (parts[3] && parts[3] !== '\\N') ? parts[3].trim() : null;
        if (name) {
          const brand = (parts[4] && parts[4] !== '\\N') ? parts[4].trim() : null;
          const ratio = (parts[5] && parts[5] !== '\\N') ? parts[5].trim() : null;
          const category = (parts[6] && parts[6] !== '\\N') ? parts[6].trim() : null;
          const note = (parts[7] && parts[7] !== '\\N') ? parts[7].trim() : null;
          const vehicleModels = (parts[8] && parts[8] !== '\\N') ? parts[8].trim() : null;

          rawGearboxes.push({ name, brand, ratio, category, note, vehicleModels });
        }
      }
    }

    for (const gbData of rawGearboxes) {
      let gearbox = await this.gearboxRepository.findOne({ where: { name: gbData.name } });
      if (!gearbox) {
        gearbox = await this.gearboxRepository.save(this.gearboxRepository.create(gbData));
      }
      gearboxesMap[gbData.name] = gearbox;
    }

    this.logger.log(`  + ✅ Đã nạp thành công ${Object.keys(gearboxesMap).length} Hộp Số thực từ dump.sql vào CSDL!`);
    return gearboxesMap;
  }

  private async seedRealVehicles(enginesMap: Record<string, Engine>, gearboxesMap: Record<string, Gearbox>): Promise<Record<string, Vehicle>> {
    this.logger.log('--> Seeding ALL Real Vehicles từ qba_vehicle (dump.sql)...');
    const dumpPath = path.join(process.cwd(), 'software', 'dump.sql');
    const vehiclesMap: Record<string, Vehicle> = {};

    if (!fs.existsSync(dumpPath)) return vehiclesMap;

    let fileStream = fs.createReadStream(dumpPath);
    let rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    const rawVehicles: Array<{ name: string; brand?: string; modelCode?: string; category?: string; payloadCapacity?: string }> = [];
    let mode: string | null = null;

    for await (const line of rl) {
      if (line.startsWith('COPY public.qba_vehicle (')) { mode = 'vehicle'; continue; }
      if (mode === 'vehicle' && line.startsWith('\\.')) { mode = null; break; }

      if (mode === 'vehicle') {
        const parts = line.split('\t');
        const name = (parts[5] && parts[5] !== '\\N') ? parts[5].trim() : null;
        if (name) {
          const brand = (parts[6] && parts[6] !== '\\N') ? parts[6].trim() : undefined;
          const modelCode = (parts[7] && parts[7] !== '\\N') ? parts[7].trim() : undefined;
          const category = (parts[8] && parts[8] !== '\\N') ? parts[8].trim() : undefined;
          const payloadCapacity = (parts[11] && parts[11] !== '\\N') ? parts[11].trim() : undefined;

          rawVehicles.push({ name, brand, modelCode, category, payloadCapacity });
        }
      }
    }

    for (const vData of rawVehicles) {
      let vehicle = await this.vehicleRepository.findOne({ where: { name: vData.name } });
      if (!vehicle) {
        vehicle = await this.vehicleRepository.save(this.vehicleRepository.create(vData));
      }
      vehiclesMap[vData.name] = vehicle;
    }
    this.logger.log(`  + ✅ Đã nạp thành công ${Object.keys(vehiclesMap).length} Dòng Xe thực từ dump.sql vào CSDL!`);
    return vehiclesMap;
  }

  // Nạp 100% Sản phẩm Phụ tùng thực từ product_template & product_product trong dump.sql
  private async seedRealProducts(brandsMap: Record<string, Brand>, vehiclesMap: Record<string, Vehicle>, enginesMap: Record<string, Engine>, gearboxesMap: Record<string, Gearbox>): Promise<Record<string, Product>> {
    this.logger.log('--> Seeding ALL Real Products (2,784 products) từ dump.sql...');
    const dumpPath = path.join(process.cwd(), 'software', 'dump.sql');
    const productsMap: Record<string, Product> = {};

    if (!fs.existsSync(dumpPath)) return productsMap;

    // Pass 0: Parse qba_brand
    let fileStream = fs.createReadStream(dumpPath);
    let rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    const brandsIdToName: Record<string, string> = {};
    let mode: string | null = null;

    for await (const line of rl) {
      if (line.startsWith('COPY public.qba_brand (')) { mode = 'brand'; continue; }
      if (mode === 'brand' && line.startsWith('\\.')) { mode = null; break; }

      if (mode === 'brand') {
        const parts = line.split('\t');
        if (parts[0] && parts[3] && parts[3] !== '\\N') {
          brandsIdToName[parts[0]] = parts[3].trim();
        }
      }
    }

    // Pass 1: Parse product_template & ir_attachment
    fileStream = fs.createReadStream(dumpPath);
    rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    const tmplMap: Record<string, { defaultCode: string | null; name: string; listPrice: number; brandName: string | null; brandSku: string | null }> = {};
    const tmplImgMap: Record<string, string> = {};
    mode = null;

    for await (const line of rl) {
      if (line.startsWith('COPY public.product_template (')) { mode = 'product_template'; continue; }
      if (line.startsWith('COPY public.ir_attachment (')) { mode = 'ir_attachment'; continue; }
      if (line.startsWith('\\.')) { mode = null; continue; }

      if (mode === 'product_template') {
        const parts = line.split('\t');
        if (parts[0]) {
          const rawName = parts[12] !== '\\N' ? parts[12] : (parts[10] !== '\\N' ? parts[10] : 'Phụ Tùng');
          let cleanName = rawName;
          if (rawName.startsWith('{')) {
            try {
              const obj = JSON.parse(rawName);
              cleanName = obj.vi_VN || obj.en_US || rawName;
            } catch (e) {}
          }
          cleanName = cleanName.replace(/\\n/g, ' ').trim();

          const brandId = parts[53];
          const brandSku = parts[54];
          const brandName = (brandId && brandId !== '\\N') ? (brandsIdToName[brandId] || null) : null;

          tmplMap[parts[0]] = {
            defaultCode: parts[11] !== '\\N' ? parts[11] : null,
            name: cleanName,
            listPrice: Number(parts[17]) || Number(parts[14]) || 0,
            brandName,
            brandSku: (brandSku && brandSku !== '\\N') ? brandSku.trim() : null,
          };
        }
      } else if (mode === 'ir_attachment') {
        const parts = line.split('\t');
        const resModel = parts[7];
        const resId = parts[1];
        const fieldName = parts[6];
        const storeFname = parts[12];

        if (resModel === 'product.template' && storeFname && storeFname !== '\\N') {
          const localPath = path.join(process.cwd(), 'uploads', 'filestore', storeFname.replace(/\//g, path.sep));
          if (fs.existsSync(localPath)) {
            if (!tmplImgMap[resId] || fieldName === 'image_1920' || fieldName === 'image_1024') {
              tmplImgMap[resId] = '/uploads/filestore/' + storeFname;
            }
          }
        }
      }
    }

    // Pass 2: Parse product_product
    fileStream = fs.createReadStream(dumpPath);
    rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    const prodList: Array<{ code: string; name: string; price: number; imageUrl: string | null; brandName: string | null; brandSku: string | null }> = [];
    mode = null;

    for await (const line of rl) {
      if (line.startsWith('COPY public.product_product (')) { mode = 'product_product'; continue; }
      if (line.startsWith('\\.')) { mode = null; continue; }

      if (mode === 'product_product') {
        const parts = line.split('\t');
        const prodId = parts[0];
        const tmplId = parts[1];
        const tmpl = tmplMap[tmplId] || { defaultCode: null, name: 'Phụ Tùng', listPrice: 0, brandName: null, brandSku: null };
        const code = (parts[4] && parts[4] !== '\\N') ? parts[4] : (tmpl.defaultCode || `PROD-#${prodId}`);
        const imageUrl = tmplImgMap[tmplId] || null;
        prodList.push({ code, name: tmpl.name, price: tmpl.listPrice, imageUrl, brandName: tmpl.brandName, brandSku: tmpl.brandSku });
      }
    }

    const prodEntities: Product[] = [];
    for (const p of prodList) {
      if (!productsMap[p.code]) {
        const brandObj = p.brandName ? brandsMap[p.brandName] : undefined;
        const prod = this.productRepository.create({
          defaultCode: p.code,
          name: p.name,
          brandSku: p.brandSku || p.code,
          imageUrl: p.imageUrl,
          brand: brandObj,
        });
        productsMap[p.code] = prod;
        prodEntities.push(prod);
      }
    }

    const chunkSize = 500;
    for (let i = 0; i < prodEntities.length; i += chunkSize) {
      const chunk = prodEntities.slice(i, i + chunkSize);
      await this.productRepository.save(chunk);
    }

    this.logger.log(`  + ✅ Đã nạp hoàn tất ${Object.keys(productsMap).length} Sản Phẩm Phụ Tùng thực từ dump.sql vào CSDL (Đã gắn Thương hiệu đầy đủ)!`);
    return productsMap;
  }

  // Nạp & Migrate TOÀN BỘ Dữ Liệu Nhà Cung Cấp Phụ Tùng từ product_supplierinfo & res_partner trong dump.sql
  private async seedRealSupplierInfo(productsMap: Record<string, Product>) {
    this.logger.log('--> Seeding & Migrating ALL Odoo product_supplierinfo từ dump.sql...');
    const dumpPath = path.join(process.cwd(), 'software', 'dump.sql');
    if (!fs.existsSync(dumpPath)) return;

    // Pass 1: Parse res_partner & product_template
    let fileStream = fs.createReadStream(dumpPath);
    let rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    const partnersMap: Record<string, string> = {};
    const tmplMap: Record<string, string> = {};
    let mode: string | null = null;

    for await (const line of rl) {
      if (line.startsWith('COPY public.res_partner (')) { mode = 'partner'; continue; }
      if (line.startsWith('COPY public.product_template (')) { mode = 'template'; continue; }
      if (line.startsWith('\\.')) { mode = null; continue; }

      if (mode === 'partner') {
        const parts = line.split('\t');
        if (parts[0] && parts[3] && parts[3] !== '\\N' && !partnersMap[parts[0]]) {
          partnersMap[parts[0]] = parts[3];
        }
      } else if (mode === 'template') {
        const parts = line.split('\t');
        if (parts[0] && parts[11] && parts[11] !== '\\N' && !tmplMap[parts[0]]) {
          tmplMap[parts[0]] = parts[11];
        }
      }
    }

    // Pass 2: Parse product_supplierinfo
    fileStream = fs.createReadStream(dumpPath);
    rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    const supplierInfosList: any[] = [];
    mode = null;

    for await (const line of rl) {
      if (line.startsWith('COPY public.product_supplierinfo (')) { mode = 'supplierinfo'; continue; }
      if (line.startsWith('\\.')) { mode = null; continue; }

      if (mode === 'supplierinfo') {
        const parts = line.split('\t');
        const partnerId = parts[1];
        const tmplId = parts[6];
        const supplierName = partnersMap[partnerId] || 'Nhà Cung Cấp Odoo';
        const prodCode = tmplMap[tmplId] || `PROD-#${tmplId}`;
        const productObj = productsMap[prodCode];

        const price = Number(parts[15]) || 0;
        const minQty = Number(parts[14]) || 1;
        const productCode = (parts[11] && parts[11] !== '\\N') ? parts[11] : (parts[10] && parts[10] !== '\\N' ? parts[10].substring(0, 50) : `SUP-${partnerId}`);

        if (supplierName && supplierName !== 'Nhà Cung Cấp Odoo') {
          supplierInfosList.push({
            supplierName,
            productCode,
            price,
            minQty,
            product: productObj || null,
          });
        }
      }
    }

    this.logger.log(`  + Đang nạp ${supplierInfosList.length} bản ghi Nhà Cung Cấp sản phẩm vào CSDL...`);
    const entities: ProductSupplierInfo[] = [];
    for (const data of supplierInfosList) {
      entities.push(this.supplierInfoRepository.create(data as any) as any);
    }

    const chunkSize = 500;
    for (let i = 0; i < entities.length; i += chunkSize) {
      const chunk = entities.slice(i, i + chunkSize);
      await this.supplierInfoRepository.save(chunk as any);
    }

    this.logger.log(`  + ✅ Đã nạp hoàn tất ${entities.length} bản ghi Nhà Cung Cấp Phụ Tùng vào CSDL!`);
  }

  private async seedOdooAttachments(productsMap: Record<string, Product>, brandsMap: Record<string, Brand>, vehiclesMap: Record<string, Vehicle>) {
    this.logger.log('--> Seeding Odoo Attachments...');
  }

  private async seedAccounts() {
    this.logger.log('--> Seeding Standard Accounting Accounts...');
    const standardAccounts = [
      { code: '1111', name: 'Tiền mặt tại quỹ', type: AccountType.ASSET },
      { code: '1121', name: 'Tiền gửi Ngân hàng VND', type: AccountType.ASSET },
      { code: '131', name: 'Phải thu của khách hàng', type: AccountType.ASSET },
      { code: '1561', name: 'Giá trị phụ tùng tồn kho', type: AccountType.ASSET },
      { code: '331', name: 'Phải trả cho nhà cung cấp', type: AccountType.LIABILITY },
      { code: '5111', name: 'Doanh thu bán phụ tùng xe', type: AccountType.REVENUE },
      { code: '632', name: 'Giá vốn hàng bán', type: AccountType.EXPENSE },
    ];

    for (const accData of standardAccounts) {
      const existing = await this.accountRepository.findOne({ where: { code: accData.code } });
      if (!existing) {
        await this.accountRepository.save(this.accountRepository.create(accData));
      }
    }
  }

  private async seedSampleInvoices() {
    this.logger.log('--> Seeding Sample Accounting Invoices...');
  }

  private async seedOdooOrdersAndPurchases(productsMap: Record<string, Product>) {
    this.logger.log('--> Seeding ALL Odoo Purchase Orders (1,507 POs) & Sales Orders (185 SOs)...');
    const dumpPath = path.join(process.cwd(), 'software', 'dump.sql');
    if (!fs.existsSync(dumpPath)) return;

    let fileStream = fs.createReadStream(dumpPath);
    let rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    const partnersMap: Record<string, string> = {};
    const usersToPartner: Record<string, string> = {};
    const tmplCodeMap: Record<string, string> = {};
    const prodProductMap: Record<string, string> = {};
    let mode: string | null = null;

    for await (const line of rl) {
      if (line.startsWith('COPY public.res_partner ')) { mode = 'res_partner'; continue; }
      if (line.startsWith('COPY public.res_users ')) { mode = 'res_users'; continue; }
      if (line.startsWith('COPY public.product_template ')) { mode = 'product_template'; continue; }
      if (line.startsWith('COPY public.product_product ')) { mode = 'product_product'; continue; }
      if (line.startsWith('\\.')) { mode = null; continue; }

      if (mode === 'res_partner') {
        const parts = line.split('\t');
        if (parts[0] && parts[3] && parts[3] !== '\\N') partnersMap[parts[0]] = parts[3];
      } else if (mode === 'res_users') {
        const parts = line.split('\t');
        usersToPartner[parts[0]] = partnersMap[parts[2]] || partnersMap[parts[1]] || 'NV- KT KHO';
      } else if (mode === 'product_template') {
        const parts = line.split('\t');
        if (parts[0] && parts[11] && parts[11] !== '\\N') tmplCodeMap[parts[0]] = parts[11];
      } else if (mode === 'product_product') {
        const parts = line.split('\t');
        const prodId = parts[0];
        const tmplId = parts[1];
        const code = parts[4];
        if (code && code !== '\\N') prodProductMap[prodId] = code;
        else if (tmplCodeMap[tmplId]) prodProductMap[prodId] = tmplCodeMap[tmplId];
      }
    }

    fileStream = fs.createReadStream(dumpPath);
    rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    const posMap: Record<string, any> = {};
    const polsList: any[] = [];
    const sosMap: Record<string, any> = {};
    const solsList: any[] = [];
    mode = null;

    for await (const line of rl) {
      if (line.startsWith('COPY public.purchase_order ')) { mode = 'purchase_order'; continue; }
      if (line.startsWith('COPY public.purchase_order_line ')) { mode = 'purchase_order_line'; continue; }
      if (line.startsWith('COPY public.sale_order ')) { mode = 'sale_order'; continue; }
      if (line.startsWith('COPY public.sale_order_line ')) { mode = 'sale_order_line'; continue; }
      if (line.startsWith('\\.')) { mode = null; continue; }

      if (mode === 'purchase_order') {
        const parts = line.split('\t');
        const odooState = parts[17];
        let status = PurchaseStatus.CONFIRMED;
        if (odooState === 'draft') status = PurchaseStatus.DRAFT;
        if (odooState === 'done') status = PurchaseStatus.DONE;
        if (odooState === 'cancel') status = PurchaseStatus.CANCELLED;

        const partnerRef = parts[16] !== '\\N' ? parts[16] : null;
        const buyerName = parts[8] !== '\\N' ? (usersToPartner[parts[8]] || 'NV- KT KHO') : null;
        const origin = (parts[15] && parts[15] !== '\\N') ? parts[15] : null;

        const dateOrder = parts[28] !== '\\N' ? new Date(parts[28]) : null;
        const dateApprove = parts[29] !== '\\N' ? new Date(parts[29]) : null;
        const datePlanned = parts[30] !== '\\N' ? new Date(parts[30]) : null;
        const effectiveDate = parts[39] !== '\\N' ? new Date(parts[39]) : null;

        posMap[parts[0]] = {
          poNumber: parts[13] || `PO-${parts[0]}`,
          supplierName: partnersMap[parts[1]] || 'Nhà Cung Cấp Odoo',
          partnerRef,
          buyerName,
          origin,
          currency: 'VND',
          dateOrder,
          dateApprove,
          datePlanned,
          effectiveDate,
          status,
          subtotal: Number(parts[20]) || 0,
          taxAmount: Number(parts[21]) || 0,
          totalAmount: Number(parts[22]) || 0,
          items: [],
        };
      } else if (mode === 'purchase_order_line') {
        const parts = line.split('\t');
        const prodCode = prodProductMap[parts[3]] || `PROD-#${parts[3]}`;
        const prodObj = productsMap[prodCode];
        polsList.push({
          orderId: parts[4],
          productCode: prodCode,
          productName: parts[15] ? parts[15].replace(/\\n/g, ' ') : (prodObj?.name || 'Phụ Tùng'),
          quantity: Math.max(1, Math.abs(Number(parts[16]) || 1)),
          qtyReceived: Number(parts[22]) || 0,
          qtyInvoiced: Number(parts[21]) || 0,
          uom: 'Cái',
          unitPrice: Number(parts[18]) || 0,
          amount: Number(parts[19]) || 0,
          product: prodObj,
        });
      } else if (mode === 'sale_order') {
        const parts = line.split('\t');
        const odooState = parts[19];
        let status = OrderStatus.CONFIRMED;
        if (odooState === 'draft' || odooState === 'sent') status = OrderStatus.QUOTATION;
        if (odooState === 'done') status = OrderStatus.DONE;
        if (odooState === 'cancel') status = OrderStatus.CANCELLED;

        const dateOrder = parts[36] !== '\\N' ? new Date(parts[36]) : (parts[34] !== '\\N' ? new Date(parts[34]) : new Date());

        sosMap[parts[0]] = {
          soNumber: parts[18] || `SO-${parts[0]}`,
          customerName: partnersMap[parts[5]] || 'Khách Hàng Odoo',
          status,
          dateOrder,
          subtotal: Number(parts[28]) || 0,
          taxAmount: Number(parts[29]) || 0,
          totalAmount: Number(parts[30]) || 0,
          items: [],
        };
      } else if (mode === 'sale_order_line') {
        const parts = line.split('\t');
        const prodCode = prodProductMap[parts[7]] || `PROD-#${parts[7]}`;
        const prodObj = productsMap[prodCode];
        solsList.push({
          orderId: parts[1],
          productCode: prodCode,
          productName: parts[21] ? parts[21].replace(/\\n/g, ' ') : (prodObj?.name || 'Phụ Tùng'),
          quantity: Math.max(1, Math.abs(Number(parts[22]) || 1)),
          unitPrice: Number(parts[23]) || 0,
          discount: Number(parts[24]) || 0,
          amount: Number(parts[25]) || 0,
          product: prodObj,
        });
      }
    }

    polsList.forEach((line) => {
      if (posMap[line.orderId]) posMap[line.orderId].items.push(line);
    });

    solsList.forEach((line) => {
      if (sosMap[line.orderId]) sosMap[line.orderId].items.push(line);
    });

    const poList = Object.values(posMap).filter((po) => po.items.length > 0);
    const poEntities: PurchaseOrder[] = [];
    for (const poData of poList) {
      const items = poData.items.map((i: any) =>
        this.purchaseItemRepository.create({
          productName: i.productName,
          productCode: i.productCode,
          quantity: i.quantity,
          qtyReceived: i.qtyReceived,
          qtyInvoiced: i.qtyInvoiced,
          uom: i.uom || 'Cái',
          unitPrice: i.unitPrice,
          amount: i.amount,
          product: i.product,
        }),
      );

      const po = this.purchaseRepository.create({
        poNumber: poData.poNumber,
        supplierName: poData.supplierName,
        partnerRef: poData.partnerRef,
        buyerName: poData.buyerName,
        origin: poData.origin,
        currency: poData.currency || 'VND',
        dateOrder: poData.dateOrder,
        dateApprove: poData.dateApprove,
        datePlanned: poData.datePlanned,
        effectiveDate: poData.effectiveDate,
        subtotal: poData.subtotal,
        taxAmount: poData.taxAmount,
        totalAmount: poData.totalAmount,
        status: poData.status,
        notes: `Migrated từ Odoo purchase.order (${poData.poNumber})`,
        createdAt: poData.dateOrder || undefined,
        items,
      });
      poEntities.push(po);
    }

    const chunkSize = 200;
    for (let i = 0; i < poEntities.length; i += chunkSize) {
      const chunk = poEntities.slice(i, i + chunkSize);
      await this.purchaseRepository.save(chunk);
    }

    const soList = Object.values(sosMap).filter((so) => so.items.length > 0);
    const soEntities: Order[] = [];
    for (const soData of soList) {
      const items = soData.items.map((i: any) =>
        this.orderItemRepository.create({
          productName: i.productName,
          productCode: i.productCode,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          discount: i.discount,
          amount: i.amount,
          product: i.product,
        }),
      );

      const so = this.orderRepository.create({
        orderNumber: soData.soNumber,
        customerName: soData.customerName,
        subtotal: soData.subtotal,
        taxAmount: soData.taxAmount,
        totalAmount: soData.totalAmount,
        status: soData.status,
        notes: `Migrated từ Odoo sale.order (${soData.soNumber})`,
        createdAt: soData.dateOrder || undefined,
        items,
      });
      soEntities.push(so);
    }

    for (let i = 0; i < soEntities.length; i += chunkSize) {
      const chunk = soEntities.slice(i, i + chunkSize);
      await this.orderRepository.save(chunk);
    }
  }

  private async seedOdooAuditLogs() {
    this.logger.log('--> Seeding & Migrating ALL Odoo Chatter Audit Logs (28,179 records) từ dump.sql...');
    const dumpPath = path.join(process.cwd(), 'software', 'dump.sql');
    if (!fs.existsSync(dumpPath)) return;

    // Pass 1: Parse res_partner, mail_tracking_value, purchase_order, sale_order
    let fileStream = fs.createReadStream(dumpPath);
    let rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    const partnerMap: Record<string, string> = {};
    const trackingMap: Record<string, Array<{ oldVal: string; newVal: string }>> = {};
    const poIdToNumber: Record<string, string> = {};
    const soIdToNumber: Record<string, string> = {};
    let mode: string | null = null;

    for await (const line of rl) {
      if (line.startsWith('COPY public.res_partner (')) { mode = 'partner'; continue; }
      if (line.startsWith('COPY public.mail_tracking_value (')) { mode = 'tracking'; continue; }
      if (line.startsWith('COPY public.purchase_order (')) { mode = 'po'; continue; }
      if (line.startsWith('COPY public.sale_order (')) { mode = 'so'; continue; }
      if (line.startsWith('\\.')) { mode = null; continue; }

      if (mode === 'partner') {
        const parts = line.split('\t');
        if (parts[0] && parts[3] && parts[3] !== '\\N' && !partnerMap[parts[0]]) {
          partnerMap[parts[0]] = parts[3].replace(/\\n/g, ' ').trim();
        }
      } else if (mode === 'tracking') {
        const parts = line.split('\t');
        const msgId = parts[5];
        const oldVal = parts[8] !== '\\N' ? parts[8] : (parts[11] !== '\\N' ? parts[11] : '');
        const newVal = parts[9] !== '\\N' ? parts[9] : (parts[12] !== '\\N' ? parts[12] : '');
        if (msgId) {
          if (!trackingMap[msgId]) trackingMap[msgId] = [];
          trackingMap[msgId].push({ oldVal, newVal });
        }
      } else if (mode === 'po') {
        const parts = line.split('\t');
        if (parts[0] && parts[13] && parts[13] !== '\\N') {
          poIdToNumber[parts[0]] = parts[13].trim();
        }
      } else if (mode === 'so') {
        const parts = line.split('\t');
        if (parts[0] && parts[18] && parts[18] !== '\\N') {
          soIdToNumber[parts[0]] = parts[18].trim();
        }
      }
    }

    // Pass 2: Parse mail_message
    fileStream = fs.createReadStream(dumpPath);
    rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    const auditEntities: AuditLog[] = [];
    mode = null;

    for await (const line of rl) {
      if (line.startsWith('COPY public.mail_message (')) { mode = 'message'; continue; }
      if (line.startsWith('\\.')) { mode = null; continue; }

      if (mode === 'message') {
        const parts = line.split('\t');
        const msgId = parts[0];
        const model = parts[13];
        const resId = parts[2];
        const authorId = parts[7];
        const recordName = parts[14] !== '\\N' ? parts[14] : null;
        const rawBody = parts[20] !== '\\N' ? parts[20] : '';
        const rawDate = parts[24] !== '\\N' ? parts[24] : parts[26];

        if (model && model !== '\\N') {
          let cleanBody = rawBody.replace(/<[^>]*>/g, '').replace(/\\n/g, '\n').trim();
          let normalizedModel = model;
          let poNum = recordName;
          let targetResId = resId !== '\\N' ? resId : (recordName || msgId);

          if (model === 'purchase.order') {
            normalizedModel = 'PurchaseOrder';
            poNum = poIdToNumber[resId] || recordName || resId;
            targetResId = poNum;
          } else if (model === 'sale.order') {
            normalizedModel = 'Order';
            poNum = soIdToNumber[resId] || recordName || resId;
            targetResId = poNum;
          } else if (model === 'product.template' || model === 'product.product') {
            normalizedModel = 'Product';
          } else if (model === 'stock.picking') {
            normalizedModel = 'StockMove';
          }

          const authorName = partnerMap[authorId] || 'NV- KT KHO';
          const tracking = trackingMap[msgId] || null;

          if (!cleanBody && tracking && tracking.length > 0) {
            const changes = tracking.map(t => (t.oldVal || 'Draft') + ' ➔ ' + (t.newVal || 'Active')).join(', ');
            cleanBody = `Cập nhật biến động: ${changes}`;
          }

          const auditLog = this.auditLogRepository.create({
            resModel: normalizedModel,
            resId: targetResId,
            poNumber: poNum || undefined,
            authorName,
            action: tracking ? 'STATUS_CHANGE' : 'COMMENT',
            body: cleanBody || (tracking ? 'Cập nhật trạng thái' : 'Nhật ký Odoo'),
            trackingValues: tracking || undefined,
            createdAt: rawDate !== '\\N' ? new Date(rawDate) : new Date(),
          });
          auditEntities.push(auditLog);
        }
      }
    }

    const chunkSize = 1000;
    for (let i = 0; i < auditEntities.length; i += chunkSize) {
      const chunk = auditEntities.slice(i, i + chunkSize);
      await this.auditLogRepository.save(chunk);
    }

    this.logger.log(`  + ✅ Đã nạp thành công ${auditEntities.length} bản ghi Audit Log / Chatter từ dump.sql vào CSDL!`);
  }

  private async seedOdooStockPickings() {
    this.logger.log('--> Seeding ALL Odoo Stock Pickings (2,171 records)...');
    const dumpPath = path.join(process.cwd(), 'software', 'dump.sql');
    if (!fs.existsSync(dumpPath)) return;

    let fileStream = fs.createReadStream(dumpPath);
    let rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    const partnersMap: Record<string, string> = {};
    let mode: string | null = null;

    for await (const line of rl) {
      if (line.startsWith('COPY public.res_partner ')) { mode = 'res_partner'; continue; }
      if (line.startsWith('\\.')) { mode = null; continue; }

      if (mode === 'res_partner') {
        const parts = line.split('\t');
        if (parts[0] && parts[3] && parts[3] !== '\\N') partnersMap[parts[0]] = parts[3];
      }
    }

    fileStream = fs.createReadStream(dumpPath);
    rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    const pickingsList: any[] = [];
    mode = null;

    for await (const line of rl) {
      if (line.startsWith('COPY public.stock_picking ')) { mode = 'stock_picking'; continue; }
      if (line.startsWith('\\.')) { mode = null; continue; }

      if (mode === 'stock_picking') {
        const parts = line.split('\t');
        const pickingNumber = parts[13] !== '\\N' ? parts[13] : `WH/IN/${parts[0]}`;
        const origin = parts[14] !== '\\N' ? parts[14] : null;
        const partnerName = partnersMap[parts[7]] || null;
        const odooState = parts[16];
        let status = PickingStatus.DONE;
        if (odooState === 'draft') status = PickingStatus.DRAFT;
        if (odooState === 'assigned') status = PickingStatus.READY;
        if (odooState === 'cancel') status = PickingStatus.CANCELLED;

        const scheduledDate = parts[23] !== '\\N' ? new Date(parts[23]) : null;
        const dateDone = parts[26] !== '\\N' ? new Date(parts[26]) : null;

        let type = 'IN';
        if (pickingNumber.includes('/OUT/')) type = 'OUT';
        if (pickingNumber.includes('/INT/')) type = 'INTERNAL';

        pickingsList.push({
          pickingNumber,
          origin,
          partnerName,
          type,
          status,
          scheduledDate,
          dateDone,
          note: parts[19] !== '\\N' ? parts[19] : null,
        });
      }
    }

    const pickingEntities: StockPicking[] = [];
    for (const data of pickingsList) {
      pickingEntities.push(this.stockPickingRepository.create(data as any) as any);
    }

    const chunkSize = 300;
    for (let i = 0; i < pickingEntities.length; i += chunkSize) {
      const chunk = pickingEntities.slice(i, i + chunkSize);
      await this.stockPickingRepository.save(chunk as any);
    }
  }

  // Nạp & Migrate TOÀN BỘ 5,684 Nhật Ký Biến Động Kho (stock_move) từ dump.sql (Đã liên kết 100% Sản Phẩm)
  private async seedOdooStockMoves(productsMap: Record<string, Product>) {
    this.logger.log('--> Seeding & Migrating ALL Odoo Stock Moves (5,684 records) từ dump.sql...');
    const dumpPath = path.join(process.cwd(), 'software', 'dump.sql');
    if (!fs.existsSync(dumpPath)) return;

    let fileStream = fs.createReadStream(dumpPath);
    let rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    const tmplMap: Record<string, { defaultCode: string | null; name: string }> = {};
    const prodProductMap: Record<string, { code: string; name: string }> = {};
    let mode: string | null = null;

    for await (const line of rl) {
      if (line.startsWith('COPY public.product_template ')) { mode = 'product_template'; continue; }
      if (line.startsWith('COPY public.product_product ')) { mode = 'product_product'; continue; }
      if (line.startsWith('\\.')) { mode = null; continue; }

      if (mode === 'product_template') {
        const parts = line.split('\t');
        if (parts[0]) {
          const rawName = parts[12] !== '\\N' ? parts[12] : (parts[10] !== '\\N' ? parts[10] : 'Phụ Tùng');
          let cleanName = rawName;
          if (rawName.startsWith('{')) {
            try {
              const obj = JSON.parse(rawName);
              cleanName = obj.vi_VN || obj.en_US || rawName;
            } catch (e) {}
          }
          cleanName = cleanName.replace(/\\n/g, ' ').trim();

          tmplMap[parts[0]] = {
            defaultCode: parts[11] !== '\\N' ? parts[11] : null,
            name: cleanName,
          };
        }
      } else if (mode === 'product_product') {
        const parts = line.split('\t');
        const prodId = parts[0];
        const tmplId = parts[1];
        const tmpl = tmplMap[tmplId] || { defaultCode: null, name: 'Phụ Tùng' };
        const code = (parts[4] && parts[4] !== '\\N') ? parts[4] : (tmpl.defaultCode || `PROD-#${prodId}`);
        prodProductMap[prodId] = { code, name: tmpl.name };
      }
    }

    fileStream = fs.createReadStream(dumpPath);
    rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    const movesList: any[] = [];
    mode = null;

    for await (const line of rl) {
      if (line.startsWith('COPY public.stock_move ')) { mode = 'stock_move'; continue; }
      if (line.startsWith('\\.')) { mode = null; continue; }

      if (mode === 'stock_move') {
        const parts = line.split('\t');
        const odooProdId = parts[3];
        const prodInfo = prodProductMap[odooProdId] || { code: `PROD-#${odooProdId}`, name: 'Phụ Tùng' };
        const prodCode = prodInfo.code;

        let productObj = productsMap[prodCode];
        if (!productObj) {
          productObj = await this.productRepository.findOne({ where: { defaultCode: prodCode } });
          if (!productObj) {
            const rawName = (prodInfo.name && prodInfo.name !== 'Phụ Tùng') ? prodInfo.name : (parts[31] || `Sản phẩm [${prodCode}]`);
            const cleanName = rawName.split('\n')[0].replace(/\\n/g, ' ').trim();
            productObj = await this.productRepository.save(
              this.productRepository.create({
                defaultCode: prodCode,
                name: cleanName,
                brandSku: prodCode,
              }),
            );
          }
          productsMap[prodCode] = productObj;
        }

        const ref = parts[28] !== '\\N' ? parts[28] : (parts[26] !== '\\N' ? parts[26] : `SM-${parts[0]}`);
        const rawQty = Math.abs(Number(parts[34]) || Number(parts[32]) || 1);
        const pickingTypeId = parts[13];

        let type = StockMoveType.IN;
        let signedQty = rawQty;

        if (ref.includes('/OUT/') || pickingTypeId === '2') {
          type = StockMoveType.OUT;
          signedQty = -rawQty;
        } else if (ref.includes('/INT/')) {
          type = StockMoveType.INTERNAL;
        }

        const note = parts[31] !== '\\N' ? parts[31].replace(/\\n/g, ' ') : (parts[23] !== '\\N' ? parts[23] : null);
        const createdAt = parts[43] !== '\\N' ? new Date(parts[43]) : (parts[40] !== '\\N' ? new Date(parts[40]) : new Date());

        movesList.push({
          reference: ref,
          type,
          quantity: signedQty,
          note,
          product: productObj,
          createdAt,
        });
      }
    }

    this.logger.log(`  + Đang nạp ${movesList.length} Nhật ký Biến động Kho thực từ dump.sql vào CSDL...`);
    const moveEntities: StockMove[] = [];
    for (const data of movesList) {
      moveEntities.push(this.stockMoveRepository.create(data as any) as any);
    }

    const chunkSize = 500;
    for (let i = 0; i < moveEntities.length; i += chunkSize) {
      const chunk = moveEntities.slice(i, i + chunkSize);
      await this.stockMoveRepository.save(chunk as any);
    }

    this.logger.log(`  + ✅ Đã nạp hoàn tất toàn bộ ${moveEntities.length} Nhật ký Biến động Kho (stock_moves) Odoo thực (Đã liên kết 100% Sản phẩm)!`);
  }
}
