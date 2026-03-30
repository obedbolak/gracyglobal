// scripts/migrate-roles.ts
import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);

const prisma = new PrismaClient({ adapter });

async function migrateRoles() {
  console.log("🔄 Migrating user roles from strings to arrays...");

  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, role: true, email: true },
    });

    console.log(`Found ${users.length} users to check`);

    let migratedCount = 0;

    for (const user of users) {
      let needsMigration = false;
      let newRole: UserRole[] = [];

      // Check if role is a string (needs migration)
      if (typeof user.role === "string") {
        needsMigration = true;
        const roleString = user.role as string;

        // Convert string role to array
        switch (roleString) {
          case "USER":
            newRole = [UserRole.USER];
            break;
          case "ADMIN":
            newRole = [UserRole.ADMIN];
            break;
          case "COUNSELOR":
            newRole = [UserRole.COUNSELOR];
            break;
          case "VOLUNTEER":
            newRole = [UserRole.VOLUNTEER];
            break;
          default:
            newRole = [UserRole.USER]; // Default fallback
        }

        console.log(
          `Migrating ${user.email}: "${roleString}" → [${newRole.join(", ")}]`,
        );
      }
      // Check if role is already an array but contains strings instead of enums
      else if (
        Array.isArray(user.role) &&
        user.role.length > 0 &&
        typeof user.role[0] === "string"
      ) {
        needsMigration = true;
        newRole = (user.role as string[]).map((roleStr) => {
          switch (roleStr) {
            case "USER":
              return UserRole.USER;
            case "ADMIN":
              return UserRole.ADMIN;
            case "COUNSELOR":
              return UserRole.COUNSELOR;
            case "VOLUNTEER":
              return UserRole.VOLUNTEER;
            default:
              return UserRole.USER;
          }
        });

        console.log(
          `Fixing ${user.email}: [${(user.role as string[]).join(", ")}] → [${newRole.join(", ")}]`,
        );
      }

      if (needsMigration) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: newRole },
        });
        migratedCount++;
      }
    }

    console.log(`✅ Migration complete! Updated ${migratedCount} users`);

    // Verify the migration
    const sampleUsers = await prisma.user.findMany({
      take: 3,
      select: { email: true, role: true },
    });

    console.log("\n📊 Sample users after migration:");
    sampleUsers.forEach((user) => {
      console.log(
        `${user.email}: ${Array.isArray(user.role) ? user.role.join(", ") : user.role}`,
      );
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateRoles();
