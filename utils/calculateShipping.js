function calculateShipping(baseShipping, weight, sender, total) {
  const specificNames = ["Hillt"];
  let shipping = baseShipping;

  if (weight > 3) {
    shipping += specificNames.includes(sender)
      ? (weight - 3) * 5
      : (weight - 3) * 10;
  }

  if (total > 3000) {
    shipping += total * 0.01;
  }

  return shipping;
}

module.exports = calculateShipping;
