const express = require("express");
const app = express();
const path = require("path");
require('dotenv').config();
const port = process.env.PORT || 1000;

const multer = require("multer");
const xlsx = require("xlsx");

const fs = require("fs");


app.set('view engine', 'ejs');
// Application.use(express.static('public'));
app.use(express.static('uploads'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
// // استخدام المكونات المتوسطة (middleware) لتحليل البيانات
app.use(express.urlencoded({ extended: false }));
app.use(express.json());







// const upload = multer({ storage: multer.memoryStorage() });
const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
    res.render("upload");
});


app.post("/upload", upload.fields([{ name: "speedaf" }, { name: "speedo" }]), (req, res) => {
    try {
        const speedafFile = req.files["speedaf"][0].path;
        const speedoFile = req.files["speedo"][0].path;

        const speedafSheet = xlsx.readFile(speedafFile).Sheets[xlsx.readFile(speedafFile).SheetNames[0]];
        const speedoSheet = xlsx.readFile(speedoFile).Sheets[xlsx.readFile(speedoFile).SheetNames[0]];

        // const speedafSheet = xlsx.read(req.files["speedaf"][0].buffer, { type: "buffer" }).Sheets;
        // const speedoSheet = xlsx.read(req.files["speedo"][0].buffer, { type: "buffer" }).Sheets;
        const speedafData = xlsx.utils.sheet_to_json(speedafSheet);
        const speedoData = xlsx.utils.sheet_to_json(speedoSheet);
        const speedafMap = {};
        speedafData.forEach(row => {
            const waybill = row["Waybill No."]?.toString().trim();
            if (waybill) {
                speedafMap[waybill] = row;
            }
        });
        const mergedData = speedoData
            .map(row => {
                const waybill = row["البوليصة"]?.toString().trim();
                if (waybill && speedafMap[waybill]) {
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
                    const specificNames = ["Hillt"];
                    if (weight > 3) {
                        if (specificNames.includes(sender)) {
                            shipping += (weight - 3) * 5;
                        } else {
                            shipping += (weight - 3) * 10;
                        }
                    }
                    const type = speedafRow["Type"] || "";
                    const specificName0 = [
                        "زارا",
                        "نفس"];
                    const specificName25 = [
                        "Hillt", "Fitwear"
                    ];
                    const specificName30 = [
                        "أحمد علي مصطفى"
                    ];
                    const specificName35 = [
                        "Demand & Beyond",
                        "Dounista",
                        "Velora Skin",
                        "Wipy",
                        "Kids fashion",
                        "مصنع البن",
                        "محمود اسماعيل",
                    ];
                    const specificName40 = [
                        "دريم",
                        "Fire"
                    ];
                    const specificName50 = [
                        "amzoo +",
                        "سولار لايت لكشافات الطاقة",
                        "أنتي",
                        "علي مقاسك",
                        "محل مزايا",
                        "راقيا",
                        "Vivofit Store",
                        "el_3raby_store",
                        "مها عصام",
                        "مسار جاليري",
                        "محل مزايا",
                        "فاطمة",
                        "سيمون عادل",
                        "رشا عادل",
                        "المدينة المنورة للادوات الصحية",
                    ];
                    const specificName53 = [
                        "وصفة طب عرب"
                    ];
                    if (type === "Return Parcel" && specificName25.includes(sender)) {
                        shipping = 25;
                    } else if (type === "Return Parcel" && specificName30.includes(sender)) {
                        shipping = 30;
                    } else if (type === "Return Parcel" && specificName35.includes(sender)) {
                        shipping = 35;
                    } else if (type === "Return Parcel" && specificName40.includes(sender)) {
                        shipping = 40;
                    }
                    else if (type === "Return Parcel" && specificName50.includes(sender)) {
                        shipping = 50;
                    }
                    else if (type === "Return Parcel" && specificName0.includes(sender)) {
                        shipping = 0;
                    }

                    else if (type === "Return Parcel" && specificName53.includes(sender)) {
                        shipping = 53;
                    }

                    else {
                        shipping = shipping;
                    }

                    if (total > 3000) {
                        shipping += (total * 0.01)
                    }
                    const adjustedClaim = claim < 70 ? 0 : claim;
                    const profit = shipping - commission - 0.1 * commission;
                    const collection = (total + adjustedClaim) - shipping;
                    const supply = (total + adjustedClaim) - commission - 0.1 * commission;
                    let typeColor = "";
                    if (type === "Abnormal signed") typeColor = "red";
                    else if (type === "Collected") typeColor = "green";
                    else if (type === "Return Parcel") typeColor = "orange";
                    return {
                        waybill,
                        sender,
                        shipping,
                        commission,
                        total,
                        profit,
                        collection,
                        supply,
                        weight,
                        type,
                        typeColor,
                        receiver,
                        fuel
                    };
                }
                return null;
            })
            .filter(row => row !== null);
        const newSheet = xlsx.utils.json_to_sheet(mergedData);
        const newWorkbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(newWorkbook, newSheet, "Processed Data");
        const outputPath = path.join(__dirname, "public", "processed.xlsx");
        xlsx.writeFile(newWorkbook, outputPath);
        fs.unlinkSync(speedafFile);
        fs.unlinkSync(speedoFile);
        res.json({ results: mergedData, fileUrl: "/processed.xlsx" });
    } catch (error) {
        console.error(" خطأ أثناء معالجة الملفات:", error);
        res.json({ error: "حدث خطأ أثناء معالجة الملفات." });
    }
});


app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
