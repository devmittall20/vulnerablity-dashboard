const { PrismaClient } = require('@prisma/client');
const { parseFile } = require('../services/parser.service');
const { calculateRiskScore, getSeverityFromCVSS, generateTags } = require('../services/risk.service');
const fs = require('fs');

const prisma = new PrismaClient();

const uploadScan = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { scannerName, fileType } = req.body;
    if (!scannerName || !fileType) {
      return res.status(400).json({ message: 'Scanner name and file type are required' });
    }

    // Parse the file
    const normalizedData = await parseFile(req.file.path, fileType.toLowerCase());

    // Create a new Scan record
    const scan = await prisma.scan.create({
      data: {
        scanner_name: scannerName,
        imported_by: req.user.id // Requires authMiddleware to be run before this
      }
    });

    let newVulns = 0;
    let updatedVulns = 0;

    // Deduplication and DB insertion
    for (const item of normalizedData) {
      // 1. Find or create Asset
      let asset = await prisma.asset.findFirst({
        where: { ip_address: item.asset.ip_address }
      });
      if (!asset) {
        asset = await prisma.asset.create({
          data: {
            ip_address: item.asset.ip_address,
            hostname: item.asset.hostname,
            os: item.asset.os
          }
        });
      }

      // 2. Find or create Vulnerability
      let vuln = await prisma.vulnerability.findFirst({
        where: { title: item.vulnerability.title }
      });
      if (!vuln) {
        vuln = await prisma.vulnerability.create({
          data: {
            title: item.vulnerability.title,
            cve_id: item.vulnerability.cve_id,
            severity: item.vulnerability.severity || getSeverityFromCVSS(item.vulnerability.cvss_score),
            cvss_score: item.vulnerability.cvss_score,
            description: item.vulnerability.description,
            remediation_steps: item.vulnerability.remediation_steps,
            tags: generateTags(item.vulnerability.description)
          }
        });
      }

      const computedRiskScore = calculateRiskScore(vuln.cvss_score, asset.criticality, asset.exposure);

      // 3. Find or create AssetVulnerability (Deduplication)
      let assetVuln = await prisma.assetVulnerability.findFirst({
        where: {
          asset_id: asset.id,
          vulnerability_id: vuln.id
        }
      });

      if (!assetVuln) {
        await prisma.assetVulnerability.create({
          data: {
            asset_id: asset.id,
            vulnerability_id: vuln.id,
            scan_id: scan.id,
            status: 'Open',
            risk_score: computedRiskScore
          }
        });
        newVulns++;
      } else {
        // Just update the scan_id to reflect it was seen in the latest scan, and update risk score
        await prisma.assetVulnerability.update({
          where: { id: assetVuln.id },
          data: { 
            scan_id: scan.id,
            risk_score: computedRiskScore
          }
        });
        updatedVulns++;
      }
    }

    // Cleanup the uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'Scan imported successfully',
      scanId: scan.id,
      stats: {
        totalFound: normalizedData.length,
        new: newVulns,
        updated: updatedVulns
      }
    });

  } catch (error) {
    console.error(error);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Error processing scan file', error: error.message });
  }
};

module.exports = { uploadScan };
