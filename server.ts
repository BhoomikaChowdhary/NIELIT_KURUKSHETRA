import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import ExcelJS from "exceljs";
import Database from "better-sqlite3";
import cors from "cors";

// Initialize folders
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const PHOTOS_DIR = path.join(process.cwd(), "photos");
const SIGNATURES_DIR = path.join(process.cwd(), "signatures");
const EXCEL_DIR = path.join(process.cwd(), "excel_output");
const EXCEL_FILE_PATH = path.join(EXCEL_DIR, "extracted_data.xlsx");

[UPLOADS_DIR, PHOTOS_DIR, SIGNATURES_DIR, EXCEL_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Initialize Database
const db = new Database("stats.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS stats (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    total_uploaded INTEGER DEFAULT 0,
    processed INTEGER DEFAULT 0,
    photos_extracted INTEGER DEFAULT 0,
    signatures_extracted INTEGER DEFAULT 0
  )
`);
db.exec(`INSERT OR IGNORE INTO stats (id, total_uploaded, processed, photos_extracted, signatures_extracted) VALUES (1, 0, 0, 0, 0)`);

db.exec(`
  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT,
    status TEXT,
    session_id TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use("/photos", express.static(PHOTOS_DIR));
app.use("/signatures", express.static(SIGNATURES_DIR));

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

async function finalizeProcessing(filePath: string, filename: string, data: any, sessionId: string) {
  try {
    const isPdf = filename.toLowerCase().endsWith(".pdf");
    const imageBuffer = fs.readFileSync(filePath);
    let photoFileName = "";
    let signatureFileName = "";

    // 1. Crop Photo
    if (!isPdf && data.photoBoundingBox && data.photoBoundingBox.length === 4) {
      try {
        const [ymin, xmin, ymax, xmax] = data.photoBoundingBox;
        const metadata = await sharp(imageBuffer).metadata();
        if (metadata.width && metadata.height) {
          const left = Math.round((xmin / 1000) * metadata.width);
          const top = Math.round((ymin / 1000) * metadata.height);
          const width = Math.round(((xmax - xmin) / 1000) * metadata.width);
          const height = Math.round(((ymax - ymin) / 1000) * metadata.height);

          photoFileName = `${path.parse(filename).name}_photo_${Date.now()}.jpg`;
          await sharp(imageBuffer)
            .extract({ left, top, width, height })
            .toFile(path.join(PHOTOS_DIR, photoFileName));
          
          db.prepare("UPDATE stats SET photos_extracted = photos_extracted + 1 WHERE id = 1").run();
        }
      } catch (sharpError) {
        console.warn(`Could not extract photo from ${filename}:`, sharpError);
      }
    }

    // 2. Crop Signature
    if (!isPdf && data.signatureBoundingBox && data.signatureBoundingBox.length === 4) {
      try {
        const [ymin, xmin, ymax, xmax] = data.signatureBoundingBox;
        const metadata = await sharp(imageBuffer).metadata();
        if (metadata.width && metadata.height) {
          const left = Math.round((xmin / 1000) * metadata.width);
          const top = Math.round((ymin / 1000) * metadata.height);
          const width = Math.round(((xmax - xmin) / 1000) * metadata.width);
          const height = Math.round(((ymax - ymin) / 1000) * metadata.height);

          signatureFileName = `${path.parse(filename).name}_sign_${Date.now()}.jpg`;
          await sharp(imageBuffer)
            .extract({ left, top, width, height })
            .toFile(path.join(SIGNATURES_DIR, signatureFileName));
          
          db.prepare("UPDATE stats SET signatures_extracted = signatures_extracted + 1 WHERE id = 1").run();
        }
      } catch (sharpError) {
        console.warn(`Could not extract signature from ${filename}:`, sharpError);
      }
    }

    // 3. Update Excel (Session Specific)
    const sessionExcelPath = path.join(EXCEL_DIR, `dataset_${sessionId}.xlsx`);
    let workbook = new ExcelJS.Workbook();
    if (fs.existsSync(sessionExcelPath)) {
      await workbook.xlsx.readFile(sessionExcelPath);
    }
    let worksheet = workbook.getWorksheet("Extracted Data") || workbook.addWorksheet("Extracted Data");
    
    // Prepare row data
    const baseUrl = process.env.APP_URL || "http://localhost:3000";
    const rowData: any = {
      "File Name": filename,
      "Form Type": data.formType || "Unknown",
      ...data,
      "Timestamp": new Date().toLocaleString(),
      "Photo Link": photoFileName ? { text: "Open Photo", hyperlink: `${baseUrl}/photos/${photoFileName}` } : "",
      "Signature Link": signatureFileName ? { text: "Open Signature", hyperlink: `${baseUrl}/signatures/${signatureFileName}` } : "",
    };
    
    // Clean up data for Excel
    delete rowData.photoBoundingBox;
    delete rowData.signatureBoundingBox;
    delete rowData.isGovernmentForm;
    delete rowData.formType;

    // Dynamic Column Management
    const currentKeys = Object.keys(rowData);
    
    // Try to recover columns if they are not set (common when reading existing file)
    if (!worksheet.columns || worksheet.columns.length === 0) {
      if (worksheet.rowCount > 0) {
        const headerRow = worksheet.getRow(1);
        const recoveredColumns: any[] = [];
        headerRow.eachCell({ includeEmpty: false }, (cell) => {
          let val = "";
          if (cell.value) {
            if (typeof cell.value === 'object' && 'text' in (cell.value as any)) {
              val = (cell.value as any).text.toString();
            } else {
              val = cell.value.toString();
            }
          }
          if (val && val !== "[object Object]") {
            recoveredColumns.push({ header: val, key: val, width: 20 });
          }
        });
        worksheet.columns = recoveredColumns;
      }
    }

    const existingColumns = worksheet.columns || [];
    const existingKeys = new Set(existingColumns.map(c => c.key));
    let updatedColumns = [...existingColumns];
    let headersChanged = false;

    currentKeys.forEach(key => {
      if (key && !existingKeys.has(key)) {
        updatedColumns.push({ header: key, key: key, width: 20 });
        existingKeys.add(key);
        headersChanged = true;
      }
    });

    if (headersChanged || worksheet.rowCount === 0) {
      worksheet.columns = updatedColumns;
      // Ensure header row is written if it's a new sheet or headers changed
      const headerRow = worksheet.getRow(1);
      updatedColumns.forEach((col, i) => {
        if (col.header) {
          headerRow.getCell(i + 1).value = col.header.toString();
        }
      });
      headerRow.commit();
    }

    const row = worksheet.addRow(rowData);
    row.commit();
    
    if (photoFileName) {
      try {
        const photoLinkCell = row.getCell("Photo Link");
        if (photoLinkCell) {
          photoLinkCell.value = { 
            text: "Open Photo", 
            hyperlink: `${baseUrl}/photos/${photoFileName}`,
            tooltip: "Click to open photo"
          };
          photoLinkCell.font = { color: { argb: "FF0000FF" }, underline: true };
        }
      } catch (e) {
        console.warn("Could not set Photo Link in Excel:", e);
      }
    }

    if (signatureFileName) {
      try {
        const signLinkCell = row.getCell("Signature Link");
        if (signLinkCell) {
          signLinkCell.value = { 
            text: "Open Signature", 
            hyperlink: `${baseUrl}/signatures/${signatureFileName}`,
            tooltip: "Click to open signature"
          };
          signLinkCell.font = { color: { argb: "FF0000FF" }, underline: true };
        }
      } catch (e) {
        console.warn("Could not set Signature Link in Excel:", e);
      }
    }

    await workbook.xlsx.writeFile(sessionExcelPath);
    
    const masterExcelPath = path.join(EXCEL_DIR, "extracted_data.xlsx");
    await workbook.xlsx.writeFile(masterExcelPath);

    // 4. Update Stats
    db.prepare("UPDATE stats SET processed = processed + 1 WHERE id = 1").run();
    db.prepare("INSERT INTO activity_log (filename, status, session_id) VALUES (?, ?, ?)").run(filename, "Processed Successfully", sessionId);

  } catch (error) {
    console.error("Error finalizing processing:", error);
    db.prepare("INSERT INTO activity_log (filename, status, session_id) VALUES (?, ?, ?)").run(filename, "Finalization Failed", sessionId);
  }
}

// Endpoints
app.post("/api/upload", upload.single("document"), async (req, res) => {
  const file = req.file;
  const extractedData = JSON.parse(req.body.data || "{}");
  const sessionId = req.body.sessionId || "unknown";

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    db.prepare("UPDATE stats SET total_uploaded = total_uploaded + 1 WHERE id = 1").run();
    await finalizeProcessing(file.path, file.originalname, extractedData, sessionId);
    res.json({ message: "File processed successfully" });
  } catch (error) {
    console.error("Error processing upload:", error);
    db.prepare("INSERT INTO activity_log (filename, status, session_id) VALUES (?, ?, ?)").run(file?.originalname || "unknown", "Processing Failed", sessionId);
    res.status(500).json({ error: "Failed to process document" });
  }
});

app.get("/api/stats", (req, res) => {
  const stats = db.prepare("SELECT * FROM stats WHERE id = 1").get();
  const logs = db.prepare("SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT 10").all();
  res.json({ stats, logs });
});

app.get("/api/download-excel", (req, res) => {
  const sessionId = req.query.sessionId as string;
  let filePath = EXCEL_FILE_PATH;
  
  if (sessionId) {
    const sessionPath = path.join(EXCEL_DIR, `dataset_${sessionId}.xlsx`);
    if (fs.existsSync(sessionPath)) {
      filePath = sessionPath;
    }
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Excel file not found yet." });
  }
  res.download(filePath);
});

app.post("/api/clear-logs", (req, res) => {
  try {
    db.prepare("UPDATE stats SET total_uploaded = 0, processed = 0, photos_extracted = 0, signatures_extracted = 0 WHERE id = 1").run();
    db.prepare("DELETE FROM activity_log").run();

    [UPLOADS_DIR, PHOTOS_DIR, SIGNATURES_DIR, EXCEL_DIR].forEach((dir) => {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          fs.unlinkSync(path.join(dir, file));
        }
      }
    });

    res.json({ message: "Logs and data cleared successfully" });
  } catch (error) {
    console.error("Error clearing logs:", error);
    res.status(500).json({ error: "Failed to clear logs" });
  }
});

async function startServer() {
  console.log("Starting server initialization...");
  if (process.env.NODE_ENV !== "production") {
    try {
      console.log("Initializing Vite server...");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite middleware attached.");
    } catch (viteError) {
      console.error("Failed to initialize Vite server:", viteError);
    }
  } else {
    console.log("Serving production build from dist/");
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
