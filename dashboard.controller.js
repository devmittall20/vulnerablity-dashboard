const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getStats = async (req, res) => {
  try {
    const vulns = await prisma.assetVulnerability.findMany({
      include: { vulnerability: true, asset: true }
    });

    const total = vulns.length;
    let open = 0, resolved = 0, inProgress = 0;
    let critical = 0, high = 0, medium = 0, low = 0;

    vulns.forEach(v => {
      // Status counts
      if (v.status === 'Resolved' || v.status === 'Verified') resolved++;
      else if (v.status === 'In Progress') inProgress++;
      else open++;

      // Severity counts
      const sev = v.vulnerability.severity;
      if (sev === 'Critical') critical++;
      else if (sev === 'High') high++;
      else if (sev === 'Medium') medium++;
      else low++;
    });

    // Calculate top assets
    const assetRisk = {};
    vulns.forEach(v => {
      if (v.status === 'Resolved' || v.status === 'Verified') return;
      const ip = v.asset.ip_address;
      if (!assetRisk[ip]) assetRisk[ip] = { ip, hostname: v.asset.hostname, critical: 0, high: 0, total: 0, score: 0 };
      
      assetRisk[ip].total++;
      assetRisk[ip].score += v.risk_score;
      if (v.vulnerability.severity === 'Critical') assetRisk[ip].critical++;
      if (v.vulnerability.severity === 'High') assetRisk[ip].high++;
    });

    const topAssets = Object.values(assetRisk)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    res.json({
      summary: { total, open, inProgress, resolved },
      severity: [
        { name: 'Critical', value: critical },
        { name: 'High', value: high },
        { name: 'Medium', value: medium },
        { name: 'Low', value: low }
      ],
      statusDistribution: [
        { name: 'Open', value: open },
        { name: 'In Progress', value: inProgress },
        { name: 'Resolved', value: resolved }
      ],
      topAssets
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

module.exports = { getStats };
