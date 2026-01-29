import { Invoice, InvoiceItem, Product } from '../types';

// Mapa para convertir palabras numéricas a dígitos
const NUMBER_WORDS: { [key: string]: number } = {
  'un': 1, 'una': 1, 'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5,
  'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
  'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15,
  'veinte': 20, 'treinta': 30, 'cuarenta': 40, 'cincuenta': 50,
  'media': 0.5, 'medio': 0.5, 'cuarto': 0.25
};

// Correcciones ortográficas comunes
const SPELLING_CORRECTIONS: { [key: string]: string } = {
  'aroz': 'arroz', 'aros': 'arroz', 'arros': 'arroz', 'arrz': 'arroz',
  'frigol': 'frijol', 'frigoles': 'frijoles', 'frijl': 'frijol', 'friiol': 'frijol',
  'asucar': 'azucar', 'aszucar': 'azucar', 'azuca': 'azucar', 'asukar': 'azucar',
  'azeite': 'aceite', 'aseite': 'aceite', 'acite': 'aceite',
  'lech': 'leche', 'leche': 'leche',
  'polllo': 'pollo', 'poyo': 'pollo', 'poll': 'pollo',
  'huebo': 'huevo', 'guevo': 'huevo', 'uevo': 'huevo', 'guevos': 'huevos',
  'tomat': 'tomate', 'tomae': 'tomate',
  'sevolla': 'cebolla', 'cevolla': 'cebolla', 'sebolla': 'cebolla', 'cebollo': 'cebolla',
  'paoa': 'papa',
  'tortilas': 'tortillas', 'tortila': 'tortillas', 'tortiya': 'tortillas',
  'psta': 'pasta', 'sops': 'sopa', 'sop': 'sopa',
  'cafee': 'cafe', 'kafe': 'cafe',
  'libra': 'libras', 'librs': 'libras', 'libbras': 'libras', 'libar': 'libras',
  'kilo': 'kilos', 'killos': 'kilos', 'klos': 'kilos',
  'unidad': 'unidades', 'unidads': 'unidades',
  'jabon': 'jabón', 'jamon': 'jamón', 'limon': 'limón',
  'ranchera': 'rancheras', 'macarron': 'macarrones', 'codito': 'coditos',
  'sopero': 'soperos', 'cubito': 'cubitos', 'fosforo': 'fosforos'
};

// Función para normalizar texto: minúsculas y sin acentos
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/(\d+)\s*punto\s*(\d+)/g, "$1.$2")
    .replace(/(\d+)\s*coma\s*(\d+)/g, "$1.$2");
}

// Corregir ortografía de una palabra
function correctSpelling(word: string): string {
  const normalized = normalize(word);
  return SPELLING_CORRECTIONS[normalized] || word;
}

// Verificar si un token es un número
function isNumberToken(token: string): boolean {
  const normalized = normalize(token);
  return /^\d+([.,]\d+)?$/.test(token) || NUMBER_WORDS.hasOwnProperty(normalized);
}

// Parsear número de un token
function parseNumber(token: string): number {
  const normalized = normalize(token);
  if (/^\d+([.,]\d+)?$/.test(token)) {
    return parseFloat(token.replace(',', '.'));
  }
  return NUMBER_WORDS[normalized] || 1;
}

// Buscar producto más similar en el inventario
function findProduct(text: string, productList: Product[]): Product | null {
  const normalizedText = normalize(text);

  // Ordenamos productos por longitud de keyword para priorizar coincidencias más específicas
  let bestMatch: Product | null = null;
  let maxLen = 0;

  for (const prod of productList) {
    for (const keyword of prod.keywords) {
      const normalizedKeyword = normalize(keyword);
      if (normalizedText.includes(normalizedKeyword) && normalizedKeyword.length > maxLen) {
        maxLen = normalizedKeyword.length;
        bestMatch = prod;
      }
    }
  }
  return bestMatch;
}

// Extraer precio explícito del texto
function extractExplicitPrice(text: string): { price: number | null, textWithoutPrice: string } {
  const currencySymbolRegex = /\$\s*(\d+(\.\d+)?)/;
  const matchSymbol = text.match(currencySymbolRegex);

  if (matchSymbol) {
    const price = parseFloat(matchSymbol[1]);
    const textWithoutPrice = text.replace(matchSymbol[0], '').trim();
    return { price, textWithoutPrice };
  }

  const wordsRegex = /(\d+(\.\d+)?)\s*(dolares|dólares|pesos|usd)/i;
  const matchWords = text.match(wordsRegex);

  if (matchWords) {
    const price = parseFloat(matchWords[1]);
    const textWithoutPrice = text.replace(matchWords[0], '').trim();
    return { price, textWithoutPrice };
  }

  return { price: null, textWithoutPrice: text };
}

/**
 * LÓGICA CLAVE: Detectar productos por patrón de números
 * [NÚMERO] → abre producto
 * [TEXTO] → nombre del producto
 * [NÚMERO] → cierra producto anterior + abre nuevo
 */
function parseOrderByNumbers(text: string): { quantity: number, productText: string }[] {
  // Limpiar y tokenizar
  const cleanText = text.replace(/[,;.]+/g, ' ').replace(/\s+/g, ' ').trim();
  const tokens = cleanText.split(' ');

  const orders: { quantity: number, productText: string }[] = [];
  let currentQuantity: number | null = null;
  let currentProductWords: string[] = [];

  for (const token of tokens) {
    const correctedToken = correctSpelling(token);

    if (isNumberToken(correctedToken)) {
      // Si ya teníamos un producto, lo cerramos
      if (currentQuantity !== null && currentProductWords.length > 0) {
        orders.push({
          quantity: currentQuantity,
          productText: currentProductWords.join(' ')
        });
        currentProductWords = [];
      }
      // Abrimos nuevo producto con esta cantidad
      currentQuantity = parseNumber(correctedToken);
    } else if (currentQuantity !== null) {
      // Es texto de producto
      // Filtrar palabras conectoras
      const skipWords = ['de', 'el', 'la', 'los', 'las', 'y', 'con'];
      if (!skipWords.includes(normalize(correctedToken)) || currentProductWords.length > 0) {
        currentProductWords.push(correctedToken);
      }
    } else {
      // Texto sin número previo - asumimos cantidad 1
      currentQuantity = 1;
      currentProductWords.push(correctedToken);
    }
  }

  // Agregar el último producto
  if (currentQuantity !== null && currentProductWords.length > 0) {
    orders.push({
      quantity: currentQuantity,
      productText: currentProductWords.join(' ')
    });
  }

  return orders;
}

export const generateResponse = async (userInput: string, products: Product[]): Promise<Invoice | { response: string }> => {
  // Simular delay de red para UX
  await new Promise(resolve => setTimeout(resolve, 300));

  const normalizedInput = normalize(userInput);

  // 1. Modo Consulta de Precios
  const isPriceQuery = (normalizedInput.includes('precio') ||
    normalizedInput.includes('cuanto cuesta') ||
    normalizedInput.includes('cuanto vale') ||
    normalizedInput.includes('vale')) &&
    !/\d/.test(normalizedInput);

  if (isPriceQuery) {
    const product = findProduct(userInput, products);
    if (product) {
      return { response: `El precio de **${product.name}** es **$${product.price.toFixed(2)}** por ${product.unit}.` };
    } else {
      return { response: "No encontré ese producto. Intenta con el nombre exacto o una palabra clave." };
    }
  }

  // 2. Modo Facturación - NUEVA LÓGICA basada en números
  const parsedOrders = parseOrderByNumbers(userInput);

  const invoiceItems: InvoiceItem[] = [];
  let total = 0;

  for (const order of parsedOrders) {
    // Buscar precio explícito primero
    const { price: explicitPrice, textWithoutPrice } = extractExplicitPrice(order.productText);
    const searchText = textWithoutPrice || order.productText;

    // Buscar producto en inventario
    const product = findProduct(searchText, products);

    if (product) {
      const finalUnitPrice = explicitPrice !== null ? explicitPrice : product.price;
      const subtotal = Math.round((order.quantity * finalUnitPrice) * 100) / 100;

      invoiceItems.push({
        quantity: `${order.quantity} ${product.unit}`,
        product: product.name + (explicitPrice !== null ? ' (Precio manual)' : ''),
        unit_price: finalUnitPrice,
        subtotal: subtotal
      });
      total += subtotal;
    } else if (explicitPrice !== null) {
      // Producto ad-hoc con precio manual
      const adHocName = searchText.length > 0
        ? searchText.charAt(0).toUpperCase() + searchText.slice(1)
        : "Varios";

      const subtotal = Math.round((order.quantity * explicitPrice) * 100) / 100;

      invoiceItems.push({
        quantity: order.quantity.toString(),
        product: adHocName,
        unit_price: explicitPrice,
        subtotal: subtotal
      });
      total += subtotal;
    } else if (searchText.trim()) {
      // Producto no encontrado pero con texto - agregarlo como "no encontrado"
      invoiceItems.push({
        quantity: order.quantity.toString(),
        product: `${searchText} (NO ENCONTRADO)`,
        unit_price: 0,
        subtotal: 0
      });
    }
  }

  if (invoiceItems.length > 0) {
    return {
      items: invoiceItems,
      total_items: invoiceItems.length,
      grand_total: Math.round(total * 100) / 100
    };
  }

  return {
    response: "No pude identificar productos. Intenta decir algo como '2 arroz 3 frijoles' o '2 chulas, 1 aceite'."
  };
};
