const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');

const prisma = new PrismaClient();

const downloadReport = async (req, res) => {
  try {
    const { type, level } = req.query;

    const vulns = await prisma.assetVulnerability.findMany({
      include: { vulnerability: true, asset: true },
      orderBy: { risk_score: 'desc' }
    });

    if (type === 'csv') {
      const data = vulns.map(v => ({
        'Risk Score': v.risk_score,
        'Asset IP': v.asset.ip_address,
        'Asset Hostname': v.asset.hostname,
        'Exposure': v.asset.exposure,
        'Vulnerability': v.vulnerability.title,
        'CVE ID': v.vulnerability.cve_id || 'N/A',
        'Severity': v.vulnerability.severity,
        'CVSS': v.vulnerability.cvss_score || 'N/A',
        'Status': v.status,
        'Due Date': v.due_date ? v.due_date.toISOString().split('T')[0] : 'N/A',
        'Tags': v.vulnerability.tags || 'None'
      }));
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(data);
      res.header('Content-Type', 'text/csv');
      res.attachment(`Vulnerability_Report_${new Date().toISOString().split('T')[0]}.csv`);
      return res.send(csv);
    }

    if (type === 'pdf') {
      const doc = new PDFDocument({ margin: 0, size: 'A4' });
      const filename = `Executive_Summary_${new Date().toISOString().split('T')[0]}.pdf`;
      res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-type', 'application/pdf');
      doc.pipe(res);

      const W = doc.page.width;
      const H = doc.page.height;

      // ── HEADER BANNER ──────────────────────────────────────
      doc.rect(0, 0, W, 110).fill('#0f172a');
      doc.rect(0, 108, W, 3).fill('#6366f1');

      // Logo icon placeholder (solid square)
      doc.roundedRect(40, 22, 50, 50, 10).fill('#6366f1');
      doc.fontSize(28).fillColor('#ffffff').text('V', 52, 31, { width: 26, align: 'center' });

      doc.fontSize(22).fillColor('#ffffff').font('Helvetica-Bold')
        .text('VulnTrack', 105, 28);
      doc.fontSize(10).fillColor('#94a3b8').font('Helvetica')
        .text('Vulnerability Management Dashboard', 105, 55);

      // Date top right
      doc.fontSize(9).fillColor('#64748b')
        .text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, W - 200, 45, { width: 160, align: 'right' });

      // ── TITLE ───────────────────────────────────────────────
      doc.fontSize(20).fillColor('#1e293b').font('Helvetica-Bold')
        .text('Vulnerability Executive Summary', 40, 135);
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor('#64748b').font('Helvetica')
        .text('Confidential — For internal security use only', 40);

      // ── DIVIDER ──────────────────────────────────────────────
      doc.moveDown(0.8);
      const divY = doc.y;
      doc.rect(40, divY, W - 80, 1).fill('#e2e8f0');
      doc.y = divY + 14;

      // ── STAT CARDS ───────────────────────────────────────────
      const openVulns = vulns.filter(v => v.status === 'Open' || v.status === 'In Progress');
      const critical = openVulns.filter(v => v.vulnerability.severity === 'Critical').length;
      const high = openVulns.filter(v => v.vulnerability.severity === 'High').length;
      const medium = openVulns.filter(v => v.vulnerability.severity === 'Medium').length;
      const low = openVulns.filter(v => v.vulnerability.severity === 'Low').length;
      const resolved = vulns.filter(v => v.status === 'Resolved' || v.status === 'Verified').length;

      const cardY = doc.y;
      const cardW = (W - 80 - 30) / 4; // 4 cards, 10px gap each
      const cards = [
        { label: 'Critical', value: critical, color: '#ef4444', light: '#fef2f2' },
        { label: 'High', value: high, color: '#f97316', light: '#fff7ed' },
        { label: 'Medium', value: medium, color: '#f59e0b', light: '#fffbeb' },
        { label: 'Low', value: low, color: '#10b981', light: '#f0fdf4' },
      ];

      cards.forEach((card, i) => {
        const x = 40 + i * (cardW + 10);
        doc.roundedRect(x, cardY, cardW, 80, 6).fill(card.light);
        doc.roundedRect(x, cardY, 4, 80, 2).fill(card.color);
        doc.fontSize(9).fillColor('#64748b').font('Helvetica')
          .text(card.label.toUpperCase(), x + 14, cardY + 12, { width: cardW - 18 });
        doc.fontSize(32).fillColor(card.color).font('Helvetica-Bold')
          .text(String(card.value), x + 14, cardY + 26, { width: cardW - 18 });
      });

      doc.y = cardY + 92;

      // ── RISK OVERVIEW SECTION ─────────────────────────────────
      const secY = doc.y;
      doc.roundedRect(40, secY, W - 80, 22, 4).fill('#1e293b');
      doc.fontSize(11).fillColor('#ffffff').font('Helvetica-Bold')
        .text('  Risk Posture Overview', 40, secY + 5, { width: W - 80 });
      doc.y = secY + 30;

      const rows = [
        ['Total Vulnerabilities Tracked', vulns.length],
        ['Open / In Progress', openVulns.length],
        ['Resolved / Verified', resolved],
        ['Critical Risk (Score > 9.0)', vulns.filter(v => v.risk_score > 9).length],
        ['External Exposure', vulns.filter(v => v.asset.exposure === 'External').length],
      ];

      rows.forEach(([label, val], i) => {
        const rowY = doc.y;
        if (i % 2 === 0) doc.rect(40, rowY, W - 80, 20).fill('#f8fafc');
        doc.fontSize(10).fillColor('#374151').font('Helvetica')
          .text(label, 52, rowY + 4, { width: 300 });
        doc.fontSize(10).fillColor('#111827').font('Helvetica-Bold')
          .text(String(val), W - 140, rowY + 4, { width: 90, align: 'right' });
        doc.rect(40, rowY + 20, W - 80, 0.5).fill('#e2e8f0');
        doc.y = rowY + 22;
      });

      doc.moveDown(1);

      // ── TOP CRITICAL FINDINGS ─────────────────────────────────
      const sec2Y = doc.y;
      doc.roundedRect(40, sec2Y, W - 80, 22, 4).fill('#7f1d1d');
      doc.fontSize(11).fillColor('#ffffff').font('Helvetica-Bold')
        .text('  Top Critical Assets at Risk', 40, sec2Y + 5, { width: W - 80 });
      doc.y = sec2Y + 30;

      const criticalVulns = openVulns.filter(v => v.vulnerability.severity === 'Critical').slice(0, 8);

      if (criticalVulns.length === 0) {
        doc.roundedRect(40, doc.y, W - 80, 40, 6).fill('#f0fdf4');
        doc.fontSize(11).fillColor('#16a34a').font('Helvetica-Bold')
          .text('✓  No critical vulnerabilities found. Excellent security posture!', 55, doc.y + 12, { width: W - 110 });
        doc.y += 52;
      } else {
        criticalVulns.forEach((v, i) => {
          const fy = doc.y;
          doc.roundedRect(40, fy, W - 80, 44, 4).fill(i % 2 === 0 ? '#fff5f5' : '#ffffff');
          doc.roundedRect(40, fy, 4, 44, 2).fill('#ef4444');

          // Badge
          doc.roundedRect(W - 110, fy + 8, 60, 16, 8).fill('#ef4444');
          doc.fontSize(8).fillColor('#ffffff').font('Helvetica-Bold')
            .text(`Score: ${v.risk_score}`, W - 108, fy + 12, { width: 56, align: 'center' });

          doc.fontSize(10).fillColor('#111827').font('Helvetica-Bold')
            .text(`${i + 1}. ${v.vulnerability.title}`, 52, fy + 7, { width: W - 170 });
          doc.fontSize(8.5).fillColor('#6b7280').font('Helvetica')
            .text(`${v.asset.ip_address} (${v.asset.hostname})  ·  CVE: ${v.vulnerability.cve_id || 'N/A'}  ·  CVSS: ${v.vulnerability.cvss_score || 'N/A'}`, 52, fy + 22, { width: W - 170 });
          doc.y = fy + 48;
        });
      }

      // ── FOOTER ───────────────────────────────────────────────
      const footerY = H - 45;
      doc.rect(0, footerY, W, 45).fill('#0f172a');
      doc.rect(0, footerY, W, 2).fill('#6366f1');
      doc.fontSize(8).fillColor('#64748b').font('Helvetica')
        .text('VulnTrack Vulnerability Management Dashboard  ·  CONFIDENTIAL', 40, footerY + 16, { width: W - 80, align: 'left' });
      doc.fontSize(8).fillColor('#64748b')
        .text(`Page 1  ·  ${new Date().toISOString().split('T')[0]}`, 40, footerY + 16, { width: W - 80, align: 'right' });

      doc.end();
      return;
    }

    res.status(400).json({ message: 'Invalid report type' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating report' });
  }
};

module.exports = { downloadReport };
