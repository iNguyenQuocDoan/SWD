/**
 * Seed script to create test users (Admin and Moderator)
 * Run: npm run seed:users or tsx src/scripts/seed-users.ts
 */

import "dotenv/config";
import connectDB from "@/config/database";
import { User, Role } from "@/models";
import { PermissionService } from "@/services/auth/permission.service";
import { ROLE_KEYS, ROLE_NAMES, ROLE_DESCRIPTIONS, ROLE_STATUS } from "@/constants/roles";
import bcrypt from "bcryptjs";

async function seedUsers() {
  try {
    console.log("🔌 Connecting to database...");
    await connectDB();
    console.log("✅ Connected to database\n");

    // 1. Ensure roles exist
    console.log("📋 Checking roles...");
    const roles = await Role.find({});
    console.log(`Found ${roles.length} roles: ${roles.map((r) => r.roleKey).join(", ")}\n`);

    // Create roles if they don't exist
    const roleData = [
      { roleKey: ROLE_KEYS.CUSTOMER, roleName: ROLE_NAMES.CUSTOMER, description: ROLE_DESCRIPTIONS.CUSTOMER },
      { roleKey: ROLE_KEYS.SELLER, roleName: ROLE_NAMES.SELLER, description: ROLE_DESCRIPTIONS.SELLER },
      { roleKey: ROLE_KEYS.ADMIN, roleName: ROLE_NAMES.ADMIN, description: ROLE_DESCRIPTIONS.ADMIN },
      { roleKey: ROLE_KEYS.MODERATOR, roleName: ROLE_NAMES.MODERATOR, description: ROLE_DESCRIPTIONS.MODERATOR },
    ];

    for (const roleInfo of roleData) {
      const existingRole = await Role.findOne({ roleKey: roleInfo.roleKey });
      if (!existingRole) {
        await Role.create(roleInfo);
        console.log(`✅ Created role: ${roleInfo.roleKey}`);
      } else {
        console.log(`ℹ️  Role already exists: ${roleInfo.roleKey}`);
      }
    }
    console.log("");

    // 2. Assign default permissions to roles
    console.log("🔐 Assigning default permissions to roles...");
    try {
      await PermissionService.assignDefaultPermissions();
      console.log("✅ Default permissions assigned\n");
    } catch (error) {
      console.log("⚠️  Could not assign default permissions (may already be assigned)\n");
    }

    // 3. Create Admin user
    console.log("👤 Creating Admin user...");
    const adminEmail = "admin@gmail.com";
    const adminPassword = "admin123"; // Default password for testing
    const adminFullName = "Admin User";

    const existingAdmin = await User.findOne({ email: adminEmail, isDeleted: false });
    if (existingAdmin) {
      console.log(`⚠️  Admin user already exists: ${adminEmail}`);
      console.log(`   User ID: ${existingAdmin._id}`);
      console.log(`   Role: ${(await Role.findById(existingAdmin.roleId))?.roleKey || "Unknown"}\n`);
    } else {
      const adminRole = await Role.findOne({ roleKey: ROLE_KEYS.ADMIN });
      if (!adminRole) {
        throw new Error(`${ROLE_KEYS.ADMIN} role not found`);
      }

      const passwordHash = await bcrypt.hash(adminPassword, 10);
      const adminUser = await User.create({
        roleId: adminRole._id,
        email: adminEmail,
        passwordHash,
        fullName: adminFullName,
        status: ROLE_STATUS.ACTIVE,
        emailVerified: true, // Set to true for test accounts
        phoneVerified: false,
        trustLevel: 100, // Max trust level for admin
      });

      console.log(`✅ Created Admin user:`);
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
      console.log(`   User ID: ${adminUser._id}`);
      console.log(`   Role: ${ROLE_KEYS.ADMIN}\n`);
    }

    // 4. Create Moderator user
    console.log("👤 Creating Moderator user...");
    const moderatorEmail = "moderator@gmail.com";
    const moderatorPassword = "moderator123"; // Default password for testing
    const moderatorFullName = "Moderator User";

    const existingModerator = await User.findOne({
      email: moderatorEmail,
      isDeleted: false,
    });
    if (existingModerator) {
      console.log(`⚠️  Moderator user already exists: ${moderatorEmail}`);
      console.log(`   User ID: ${existingModerator._id}`);
      console.log(`   Role: ${(await Role.findById(existingModerator.roleId))?.roleKey || "Unknown"}\n`);
    } else {
      const moderatorRole = await Role.findOne({ roleKey: ROLE_KEYS.MODERATOR });
      if (!moderatorRole) {
        throw new Error(`${ROLE_KEYS.MODERATOR} role not found`);
      }

      const passwordHash = await bcrypt.hash(moderatorPassword, 10);
      const moderatorUser = await User.create({
        roleId: moderatorRole._id,
        email: moderatorEmail,
        passwordHash,
        fullName: moderatorFullName,
        status: ROLE_STATUS.ACTIVE,
        emailVerified: true, // Set to true for test accounts
        phoneVerified: false,
        trustLevel: 80, // High trust level for moderator
      });

      console.log(`✅ Created Moderator user:`);
      console.log(`   Email: ${moderatorEmail}`);
      console.log(`   Password: ${moderatorPassword}`);
      console.log(`   User ID: ${moderatorUser._id}`);
      console.log(`   Role: ${ROLE_KEYS.MODERATOR}\n`);
    }

    // 5. Display summary
    console.log("📊 Summary:");
    console.log("=".repeat(50));
    console.log("Test Accounts Created:");
    console.log("");
    console.log("1. Admin Account:");
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Role: ${ROLE_KEYS.ADMIN}`);
    console.log("");
    console.log("2. Moderator Account:");
    console.log(`   Email: ${moderatorEmail}`);
    console.log(`   Password: ${moderatorPassword}`);
    console.log(`   Role: ${ROLE_KEYS.MODERATOR}`);
    console.log("");
    console.log("=".repeat(50));
    console.log("✅ Seed completed successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    process.exit(1);
  }
}

// Run the seed function
seedUsers();
