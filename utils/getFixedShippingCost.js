const fixedShippingPrices = {
  0: ["زارا", "نفس"],
  25: ["Hillt", "Fitwear"],
  30: ["أحمد علي مصطفى"],
  35: [
    "Demand & Beyond", "Dounista", "Velora Skin", "Wipy", "Kids fashion",
    "مصنع البن", "محمود اسماعيل"
  ],
  40: ["دريم", "Fire"],
  50: [
    "amzoo +", "سولار لايت لكشافات الطاقة", "أنتي", "علي مقاسك", "محل مزايا",
    "راقيا", "Vivofit Store", "el_3raby_store", "مها عصام", "مسار جاليري",
    "فاطمة", "سيمون عادل", "رشا عادل", "المدينة المنورة للادوات الصحية"
  ],
  53: ["وصفة طب عرب"]
};

function getFixedShippingCost(sender, type) {
  if (type !== "Return Parcel") return null;
  for (const cost in fixedShippingPrices) {
    if (fixedShippingPrices[cost].includes(sender)) {
      return parseInt(cost);
    }
  }
  return null;
}

module.exports = getFixedShippingCost;
