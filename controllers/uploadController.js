const xlsx = require("xlsx");
const calculateShipping = require("../utils/calculateShipping");
const getFixedShippingCost = require("../utils/getFixedShippingCost");
const getTypeColor = require("../utils/getTypeColor");
const Report = require("../models/Report");

const handleUpload = async (req, res) => {
  try {
    const speedafBuffer = req.files["speedaf"][0].buffer;
    const speedoBuffer = req.files["speedo"][0].buffer;

    const speedafWorkbook = xlsx.read(speedafBuffer, { type: "buffer" });
    const speedoWorkbook = xlsx.read(speedoBuffer, { type: "buffer" });

    const speedafSheet = speedafWorkbook.Sheets[speedafWorkbook.SheetNames[0]];
    const speedoSheet = speedoWorkbook.Sheets[speedoWorkbook.SheetNames[0]];

    const speedafData = xlsx.utils.sheet_to_json(speedafSheet);
    const speedoData = xlsx.utils.sheet_to_json(speedoSheet);

    const speedafMap = {};
    speedafData.forEach(row => {
      const waybill = row["Waybill No."]?.toString().trim();
      if (waybill) speedafMap[waybill] = row;
    });

    const mergedData = speedoData.map(row => {
      const waybill = row["البوليصة"]?.toString().trim();
      if (!waybill || !speedafMap[waybill]) return null;

      const speedafRow = speedafMap[waybill];

      const shippingColumn = Object.keys(row).find(key => key.includes("شحن"));
      const senderColumn = Object.keys(row).find(key => key.includes("اسم الراسل") || key.includes("إسم الراسل"));
      const receiverColumn = Object.keys(row).find(key => key.includes("اسم الراسل إليه") || key.includes("إسم المرسل إليه"));

      let shipping = Math.abs(parseFloat(row[shippingColumn] || 0));
      const sender = senderColumn ? row[senderColumn].toString().trim() : "غير معروف";
      const receiver = receiverColumn ? row[receiverColumn].toString().trim() : "غير معروف";

      const commission = Math.abs(parseFloat(speedafRow["Freight"] || 0));
      const total = Math.abs(parseFloat(speedafRow["COD"] || 0));
      const claim = Math.abs(parseFloat(speedafRow["Claim Amount"] || 0));
      const fuel = Math.abs(parseFloat(speedafRow["Fuel surcharge"] || 0));
      const weight = Math.abs(parseFloat(speedafRow["Chargeable weight"] || 0));
      const type = speedafRow["Type"] || "";

      const fixedShipping = getFixedShippingCost(sender, type);

      shipping = fixedShipping !== null
        ? fixedShipping
        : calculateShipping(shipping, weight, sender, total);

      const adjustedClaim = claim < 70 ? 0 : claim;
      const profit = shipping - commission - 0.1 * commission;
      const collectionName = (total + adjustedClaim) - shipping;
      const supply = (total + adjustedClaim) - commission - 0.1 * commission;
      const typeColor = getTypeColor(type);

      return {
        waybill,
        sender,
        shipping,
        commission,
        total,
        profit,
        collectionName,
        supply,
        weight,
        type,
        typeColor,
        receiver,
        fuel,
        createdAt: new Date()
      };
    }).filter(Boolean);

    await Report.insertMany(mergedData);

    const newSheet = xlsx.utils.json_to_sheet(mergedData);
    const newWorkbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(newWorkbook, newSheet, "Processed Data");
    const buffer = xlsx.write(newWorkbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", "attachment; filename=processed.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.json({ buffer: buffer.toString('base64'), data: mergedData });


  } catch (error) {
    console.error("خطأ أثناء معالجة الملفات:", error);
    res.status(500).json({ error: "حدث خطأ أثناء معالجة الملفات." });
  }
};

module.exports = {
  handleUpload
};
