import dotenv from "dotenv";
import connectDB from "@/config/database";
import { Role } from "@/models";

// Load environment variables
dotenv.config();

const roles = [
  {
    roleKey: "CUSTOMER",
    roleName: "Customer",
    description: "Regular customer who can purchase products",
    status: "Active",
  },
  {
    roleKey: "SELLER",
    roleName: "Seller",
    description: "Seller who can create and manage products",
    status: "Active",
  },
  {
    roleKey: "ADMIN",
    roleName: "Administrator",
    description: "System administrator with full access",
    status: "Active",
  },
  {
    roleKey: "MODERATOR",
    roleName: "Moderator",
    description: "Moderator who can review and manage content",
    status: "Active",
  },
];

async function seedRoles() {
  try {
    console.log("Connecting to database...");
    await connectDB();

    console.log("Seeding roles...");
    for (const roleData of roles) {
      const existingRole = await Role.findOne({ roleKey: roleData.roleKey });
      
      if (existingRole) {
        console.log(`Role ${roleData.roleKey} already exists, skipping...`);
        continue;
      }

      await Role.create(roleData);
      console.log(`Created role: ${roleData.roleKey} - ${roleData.roleName}`);
    }

    console.log("Roles seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding roles:", error);
    process.exit(1);
  }
}

seedRoles();
