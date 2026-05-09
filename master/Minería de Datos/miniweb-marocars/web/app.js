const state = {
  modelData: window.MODEL_DATA || null,
  lastPrediction: null
};

const form = document.getElementById("car-form");
const brandInput = document.getElementById("brand");
const modelInput = document.getElementById("model");
const brandSuggestions = document.getElementById("brand-suggestions");
const modelSuggestions = document.getElementById("model-suggestions");
const ageSelect = document.getElementById("age");
const mileageInput = document.getElementById("mileage");
const fiscalPowerSelect = document.getElementById("fiscal-power");
const doorsSelect = document.getElementById("doors");
const gearboxSelect = document.getElementById("gearbox");
const fuelSelect = document.getElementById("fuel");
const conditionSelect = document.getElementById("condition");
const extrasContainer = document.getElementById("extras-container");
const isLuxuryCheckbox = document.getElementById("is-luxury");
const resultsSection = document.getElementById("results");
const estimatedPriceNode = document.getElementById("estimated-price");
const firstOwnerLabelNode = document.getElementById("first-owner-label");
const firstOwnerProbabilityNode = document.getElementById("first-owner-probability");
const warningsNode = document.getElementById("result-warnings");
const inlineWarningNode = document.getElementById("inline-warning");
const downloadPdfButton = document.getElementById("download-pdf");

function buildOption(value, label = value) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

function resetSelect(selectNode, placeholder) {
  selectNode.innerHTML = "";
  selectNode.appendChild(buildOption("", placeholder));
}

function fillSelect(selectNode, values, placeholder, formatter) {
  resetSelect(selectNode, placeholder);
  values.forEach((value) => {
    const label = formatter ? formatter(value) : value;
    selectNode.appendChild(buildOption(value, label));
  });
}

function renderExtras(extras) {
  extrasContainer.innerHTML = "";
  extras.forEach((extra) => {
    const wrapper = document.createElement("label");
    wrapper.className = "extra-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "extras";
    checkbox.value = extra;

    const text = document.createElement("span");
    text.textContent = extra;

    wrapper.appendChild(checkbox);
    wrapper.appendChild(text);
    extrasContainer.appendChild(wrapper);
  });
}

function fillDatalist(listNode, values) {
  listNode.innerHTML = "";
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    listNode.appendChild(option);
  });
}

function populateBrandModelMap() {
  const brands = Object.keys(state.modelData.metadata.brand_model_map);
  fillDatalist(brandSuggestions, brands);
  fillDatalist(modelSuggestions, []);
}

function updateModelsForBrand() {
  const selectedBrand = brandInput.value.trim();
  const models = state.modelData.metadata.brand_model_map[selectedBrand] || [];
  fillDatalist(modelSuggestions, models);
}

function readSelectedExtras() {
  return [...document.querySelectorAll('input[name="extras"]:checked')].map(
    (checkbox) => checkbox.value
  );
}

function renderInlineWarnings() {
  const mileage = Number(mileageInput.value);
  if (Number.isFinite(mileage) && mileage > 700000) {
    inlineWarningNode.textContent =
      "Kilometraje anomalo: superar 700000 km puede afectar a la precision de la prediccion.";
    inlineWarningNode.classList.remove("hidden");
    return;
  }

  inlineWarningNode.textContent = "";
  inlineWarningNode.classList.add("hidden");
}

function buildPayload() {
  return {
    brand: brandInput.value.trim(),
    model: modelInput.value.trim(),
    age: Number(ageSelect.value),
    mileage_mid: Number(mileageInput.value),
    fiscal_power_num: Number(fiscalPowerSelect.value),
    number_of_doors: doorsSelect.value,
    gearbox: gearboxSelect.value,
    fuel: fuelSelect.value,
    condition: conditionSelect.value,
    is_luxury: isLuxuryCheckbox.checked,
    extras: readSelectedExtras()
  };
}

function sigmoid(value) {
  return 1 / (1 + Math.exp(-value));
}

function predictFirstOwnerProbability(payload) {
  const { coefficient_names: names, coefficients, xlevels } = state.modelData.logistic_model;
  let linear = 0;

  names.forEach((name, index) => {
    const coef = Number(coefficients[index]);

    if (name === "(Intercept)") {
      linear += coef;
      return;
    }

    if (name === "Age") {
      linear += coef * payload.age;
      return;
    }

    if (name === "Mileage_mid") {
      linear += coef * payload.mileage_mid;
      return;
    }

    if (name === "Fiscal_Power_num") {
      linear += coef * payload.fiscal_power_num;
      return;
    }

    if (name === "n_extras_total") {
      linear += coef * payload.extras.length;
      return;
    }

    if (name.startsWith("Number.of.Doors")) {
      const level = name.replace("Number.of.Doors", "");
      if (payload.number_of_doors === level && level !== xlevels["Number.of.Doors"][0]) {
        linear += coef;
      }
      return;
    }

    if (name.startsWith("Gearbox")) {
      const level = name.replace("Gearbox", "");
      if (payload.gearbox === level && level !== xlevels.Gearbox[0]) {
        linear += coef;
      }
      return;
    }

    if (name.startsWith("Fuel")) {
      const level = name.replace("Fuel", "");
      if (payload.fuel === level && level !== xlevels.Fuel[0]) {
        linear += coef;
      }
      return;
    }

    if (name.startsWith("Condition")) {
      const level = name.replace("Condition", "");
      if (payload.condition === level && level !== xlevels.Condition[0]) {
        linear += coef;
      }
    }
  });

  return sigmoid(linear);
}

function goLeftForCategoricalSplit(splitPoint, categoryIndex) {
  const mask = Math.trunc(splitPoint);
  return ((mask >> (categoryIndex - 1)) & 1) === 1;
}

function getFeatureValue(featureName, payload) {
  if (featureName === "Condition") {
    return payload.condition;
  }
  if (featureName === "Gearbox") {
    return payload.gearbox;
  }
  if (featureName === "Fuel") {
    return payload.fuel;
  }
  if (featureName === "Number.of.Doors") {
    return payload.number_of_doors;
  }
  if (featureName === "Age") {
    return payload.age;
  }
  if (featureName === "Mileage_mid") {
    return payload.mileage_mid;
  }
  if (featureName === "Fiscal_Power_num") {
    return payload.fiscal_power_num;
  }
  if (featureName === "n_extras_total") {
    return payload.extras.length;
  }
  return null;
}

function predictTree(tree, payload) {
  const rf = state.modelData.random_forest_model;
  let nodeIndex = 1;

  while (true) {
    const i = nodeIndex - 1;
    const status = Number(tree.status[i]);
    if (status === -1) {
      return Number(tree.prediction[i]);
    }

    const splitVar = Number(tree.split_var[i]);
    const featureName = rf.feature_order[splitVar - 1];
    const splitPoint = Number(tree.split_point[i]);
    const featureValue = getFeatureValue(featureName, payload);
    const ncat = Number(rf.ncat[splitVar - 1]);

    if (ncat > 1) {
      const levels = rf.xlevels[featureName];
      const categoryIndex = levels.indexOf(String(featureValue)) + 1;
      const takeLeft = goLeftForCategoricalSplit(splitPoint, categoryIndex);
      nodeIndex = takeLeft ? Number(tree.left[i]) : Number(tree.right[i]);
      continue;
    }

    nodeIndex =
      Number(featureValue) <= splitPoint ? Number(tree.left[i]) : Number(tree.right[i]);
  }
}

function predictPrice(payload) {
  const trees = state.modelData.random_forest_model.trees;
  const total = trees.reduce((sum, tree) => sum + predictTree(tree, payload), 0);
  return total / trees.length;
}

function buildWarnings(payload) {
  const warnings = [];
  const luxuryBrands = state.modelData.metadata.luxury_brands;
  const autoLuxuryBrand = luxuryBrands.includes(payload.brand);

  if (payload.mileage_mid > 700000) {
    warnings.push(
      "Kilometraje anomalo: superar 700000 km puede afectar a la precision de la prediccion."
    );
  }

  if (autoLuxuryBrand && payload.is_luxury) {
    warnings.push(
      "Marca detectada como lujo y confirmada por el usuario: en este segmento la prediccion puede ser menos fiable."
    );
  } else if (autoLuxuryBrand) {
    warnings.push(
      "Marca detectada como posible lujo: la prediccion puede ser menos precisa en este segmento."
    );
  } else if (payload.is_luxury) {
    warnings.push(
      "Coche marcado manualmente como lujo: la prediccion puede ser menos precisa en este segmento."
    );
  }

  return warnings;
}

function formatMad(value) {
  return new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 0
  }).format(value);
}

function renderResults(prediction) {
  estimatedPriceNode.textContent = `${formatMad(prediction.estimated_price_mad)} MAD`;
  firstOwnerLabelNode.textContent = prediction.predicted_first_owner;
  firstOwnerProbabilityNode.textContent =
    `Probabilidad de primer propietario: ${Math.round(
      prediction.first_owner_probability * 100
    )}%`;

  warningsNode.innerHTML = "";
  prediction.warnings.forEach((warning) => {
    const item = document.createElement("div");
    item.className = "notice";
    item.textContent = warning;
    warningsNode.appendChild(item);
  });

  resultsSection.classList.remove("hidden");
}

async function loadModelData() {
  if (!state.modelData) {
    throw new Error("No se pudieron cargar los datos del modelo embebido.");
  }

  populateBrandModelMap();
  fillSelect(
    ageSelect,
    state.modelData.metadata.age_values,
    "Selecciona antiguedad",
    (value) => `${value} anos`
  );
  fillSelect(
    fiscalPowerSelect,
    state.modelData.metadata.fiscal_power_values,
    "Selecciona potencia fiscal",
    (value) => `${value} CV`
  );
  fillSelect(doorsSelect, state.modelData.metadata.door_values, "Selecciona puertas");
  fillSelect(gearboxSelect, state.modelData.metadata.gearbox_values, "Selecciona cambio");
  fillSelect(fuelSelect, state.modelData.metadata.fuel_values, "Selecciona combustible");
  fillSelect(conditionSelect, state.modelData.metadata.condition_values, "Selecciona estado");
  renderExtras(state.modelData.metadata.extras);
}

function submitPrediction(event) {
  event.preventDefault();
  renderInlineWarnings();

  const payload = buildPayload();
  const firstOwnerProbability = predictFirstOwnerProbability(payload);
  const estimatedPrice = predictPrice(payload);
  const data = {
    brand: payload.brand,
    model: payload.model,
    estimated_price_mad: Math.round(estimatedPrice),
    first_owner_probability: Number(firstOwnerProbability.toFixed(4)),
    predicted_first_owner: firstOwnerProbability >= 0.5 ? "Si" : "No",
    warnings: buildWarnings(payload)
  };

  state.lastPrediction = {
    ...payload,
    ...data
  };

  renderResults(state.lastPrediction);
}

function downloadPdf() {
  if (!state.lastPrediction) {
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  const p = state.lastPrediction;
  const extrasText = p.extras.length > 0 ? p.extras.join(", ") : "Sin extras marcados";
  const warningLines =
    p.warnings.length > 0 ? p.warnings : ["Sin avisos adicionales del modelo."];

  let y = 18;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text("QimaCar Maroc - Informe de estimacion", 14, y);

  y += 10;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.text(`Fecha: ${new Date().toLocaleString("es-ES")}`, 14, y);
  y += 10;
  pdf.text(`Marca: ${p.brand}`, 14, y);
  y += 8;
  pdf.text(`Modelo: ${p.model}`, 14, y);
  y += 8;
  pdf.text(`Antiguedad: ${p.age} anos`, 14, y);
  y += 8;
  pdf.text(`Kilometraje: ${formatMad(p.mileage_mid)} km`, 14, y);
  y += 8;
  pdf.text(`Potencia fiscal: ${p.fiscal_power_num} CV`, 14, y);
  y += 8;
  pdf.text(`Puertas: ${p.number_of_doors}`, 14, y);
  y += 8;
  pdf.text(`Cambio: ${p.gearbox}`, 14, y);
  y += 8;
  pdf.text(`Combustible: ${p.fuel}`, 14, y);
  y += 8;
  pdf.text(`Estado: ${p.condition}`, 14, y);
  y += 8;
  pdf.text(`Marcado como lujo: ${p.is_luxury ? "Si" : "No"}`, 14, y);
  y += 8;

  const extrasLines = pdf.splitTextToSize(`Extras: ${extrasText}`, 180);
  pdf.text(extrasLines, 14, y);
  y += extrasLines.length * 7 + 4;

  pdf.setFont("helvetica", "bold");
  pdf.text(`Precio estimado: ${formatMad(p.estimated_price_mad)} MAD`, 14, y);
  y += 8;
  pdf.text(
    `Probabilidad de first owner: ${Math.round(p.first_owner_probability * 100)}%`,
    14,
    y
  );
  y += 8;
  pdf.text(`Prediccion final: ${p.predicted_first_owner}`, 14, y);
  y += 12;

  pdf.setFont("helvetica", "normal");
  pdf.text("Avisos del modelo:", 14, y);
  y += 8;

  warningLines.forEach((line) => {
    const lines = pdf.splitTextToSize(`- ${line}`, 180);
    pdf.text(lines, 16, y);
    y += lines.length * 7;
  });

  pdf.save(`qimacar-${p.brand}-${p.model}.pdf`.replace(/\s+/g, "-").toLowerCase());
}

brandInput.addEventListener("input", updateModelsForBrand);
mileageInput.addEventListener("input", renderInlineWarnings);
form.addEventListener("submit", (event) => {
  try {
    submitPrediction(event);
  } catch (error) {
    alert(error.message);
  }
});
downloadPdfButton.addEventListener("click", downloadPdf);

loadModelData().catch((error) => {
  alert(error.message);
});
