#!/usr/bin/env node

/**
 * Upload all PDFs from local /PDF directory to Supabase private bucket
 * Maintains original folder structure
 * 
 * Usage:
 *   node scripts/upload-pdfs-to-supabase.js
 * 
 * Requires environment variables:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_KEY
 *   SUPABASE_PDF_BUCKET (default: premium-pdfs)
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const BUCKET_NAME = process.env.SUPABASE_PDF_BUCKET || "premium-pdfs";
const PDF_SOURCE_DIR = path.join(rootDir, "PDF");

// Validation
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing required environment variables:");
  console.error("   - SUPABASE_URL");
  console.error("   - SUPABASE_SERVICE_KEY");
  process.exit(1);
}

if (!fs.existsSync(PDF_SOURCE_DIR)) {
  console.error(`❌ Source directory not found: ${PDF_SOURCE_DIR}`);
  process.exit(1);
}

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Recursively get all files from a directory
 */
function getAllFiles(dir, baseDir = dir) {
  const files = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath);

      if (entry.isDirectory()) {
        files.push(...getAllFiles(fullPath, baseDir));
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".pdf")) {
        files.push({
          fullPath,
          relativePath: relativePath.replace(/\\/g, "/")
        });
      }
    }
  } catch (error) {
    console.error(`⚠️  Error reading directory ${dir}:`, error.message);
  }

  return files;
}

/**
 * Upload a single file to Supabase
 */
async function uploadFile(supabaseClient, bucketName, filePath, remotePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    const { error } = await supabaseClient.storage
      .from(bucketName)
      .upload(remotePath, fileBuffer, {
        cacheControl: "3600",
        upsert: true
      });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message || String(error)
    };
  }
}

/**
 * Main upload function
 */
async function uploadAllPdfs() {
  console.log("📦 PDF Upload to Supabase Storage");
  console.log("================================\n");
  console.log(`📂 Source directory: ${PDF_SOURCE_DIR}`);
  console.log(`☁️  Bucket: ${BUCKET_NAME}`);
  console.log(`🌐 URL: ${SUPABASE_URL}\n`);

  // Get all PDF files
  const pdfFiles = getAllFiles(PDF_SOURCE_DIR);

  if (pdfFiles.length === 0) {
    console.log("⚠️  No PDF files found in source directory");
    process.exit(0);
  }

  console.log(`📋 Found ${pdfFiles.length} PDF file(s) to upload\n`);

  let successCount = 0;
  let failureCount = 0;
  const failures = [];

  // Upload each file
  for (let i = 0; i < pdfFiles.length; i += 1) {
    const { fullPath, relativePath } = pdfFiles[i];
    const fileSize = fs.statSync(fullPath).size;
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

    process.stdout.write(
      `[${i + 1}/${pdfFiles.length}] Uploading: ${relativePath} (${fileSizeMB} MB)... `
    );

    const result = await uploadFile(supabase, BUCKET_NAME, fullPath, relativePath);

    if (result.success) {
      console.log("✅");
      successCount += 1;
    } else {
      console.log(`❌ ${result.error}`);
      failureCount += 1;
      failures.push({
        file: relativePath,
        error: result.error
      });
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary
  console.log("\n================================");
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`📊 Total: ${pdfFiles.length}\n`);

  if (failures.length > 0) {
    console.log("⚠️  Failed uploads:");
    failures.forEach(f => {
      console.log(`   - ${f.file}: ${f.error}`);
    });
    console.log("");
  }

  if (failureCount === 0) {
    console.log("🎉 All PDFs uploaded successfully!");
  }

  process.exit(failureCount > 0 ? 1 : 0);
}

// Run
uploadAllPdfs().catch(error => {
  console.error("❌ Fatal error:", error.message);
  process.exit(1);
});
