-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hostname" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "os" TEXT,
    "criticality" TEXT NOT NULL DEFAULT 'Medium',
    "exposure" TEXT NOT NULL DEFAULT 'Internal',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Scan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scanner_name" TEXT NOT NULL,
    "scan_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imported_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Scan_imported_by_fkey" FOREIGN KEY ("imported_by") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vulnerability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cve_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "cvss_score" REAL,
    "remediation_steps" TEXT,
    "tags" TEXT
);

-- CreateTable
CREATE TABLE "AssetVulnerability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "asset_id" TEXT NOT NULL,
    "vulnerability_id" TEXT NOT NULL,
    "scan_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "assigned_to" TEXT,
    "due_date" DATETIME,
    "risk_score" REAL NOT NULL DEFAULT 0.0,
    CONSTRAINT "AssetVulnerability_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "Asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AssetVulnerability_vulnerability_id_fkey" FOREIGN KEY ("vulnerability_id") REFERENCES "Vulnerability" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AssetVulnerability_scan_id_fkey" FOREIGN KEY ("scan_id") REFERENCES "Scan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AssetVulnerability_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RemediationHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "asset_vuln_id" TEXT NOT NULL,
    "changed_by" TEXT NOT NULL,
    "old_status" TEXT NOT NULL,
    "new_status" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RemediationHistory_asset_vuln_id_fkey" FOREIGN KEY ("asset_vuln_id") REFERENCES "AssetVulnerability" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RemediationHistory_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "generated_by" TEXT NOT NULL,
    "report_type" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Report_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
