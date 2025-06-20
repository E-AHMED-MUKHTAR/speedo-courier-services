function getTypeColor(type) {
  if (type === "Abnormal signed") return "red";
  if (type === "Collected") return "green";
  if (type === "Return Parcel") return "orange";
  return "";
}

module.exports = getTypeColor;
