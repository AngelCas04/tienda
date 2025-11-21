
import { Invoice, InvoiceItem, Product } from '../types';

// Mapa para convertir palabras numéricas a dígitos
const NUMBER_WORDS: { [key: string]: number } = {
  'un': 1, 'una': 1, 'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5,
  'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
  'once': 11, 'doce': 12, 'veinte': 20, 'media': 0.5, 'medio': 0.5
};

// Función para normalizar texto: minúsculas y sin acentos (tildes)
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Reemplazar "punto" rodeado de números por un punto literal
    // Ej: "2 punto 5" -> "2.5"
    .replace(/(\d+)\s*punto\s*(\d+)/g, "$1.$2");
}

// Función para extraer un precio explícito del texto (ej: "$2.50", "2 dolares")
function extractExplicitPrice(text: string): { price: number | null, textWithoutPrice: string } {
  // Regex para formatos de moneda: $2, $ 2.50
  const currencySymbolRegex = /\$\s*(\d+(\.\d+)?)/;
  const matchSymbol = text.match(currencySymbolRegex);

  if (matchSymbol) {
    const price = parseFloat(matchSymbol[1]);
    // Removemos el precio encontrado del texto para seguir procesando
    const textWithoutPrice = text.replace(matchSymbol[0], '').trim();
    return { price, textWithoutPrice };
  }

  // Regex para formatos verbales: 2.50 dolares, 2 dólares, 5 pesos, 5 usd
  const wordsRegex = /(\d+(\.\d+)?)\s*(dolares|dólares|pesos|usd)/i;
  const matchWords = text.match(wordsRegex);

  if (matchWords) {
    const price = parseFloat(matchWords[1]);
    const textWithoutPrice = text.replace(matchWords[0], '').trim();
    return { price, textWithoutPrice };
  }

  return { price: null, textWithoutPrice: text };
}

function parseQuantity(text: string): { quantity: number, remainingText: string } {
  text = text.trim();

  // Intentar encontrar un número al principio (ej: "2", "2.5", "20")
  const numberMatch = text.match(/^(\d+(\.\d+)?)\s*/);
  if (numberMatch) {
    return {
      quantity: parseFloat(numberMatch[1]),
      remainingText: text.substring(numberMatch[0].length)
    };
  }

  // Intentar encontrar palabras numéricas (ej: "dos", "una")
  const words = text.split(' ');
  const firstWord = normalize(words[0]); // Usar normalizado para comparar
  if (NUMBER_WORDS[firstWord]) {
    return {
      quantity: NUMBER_WORDS[firstWord],
      remainingText: text.substring(words[0].length).trim()
    };
  }

  // Por defecto 1
  return { quantity: 1, remainingText: text };
}

function findProduct(text: string, productList: Product[]): Product | null {
  const normalizedText = normalize(text);

  // Ordenamos los productos por coincidencia de keyword para priorizar las más específicas o largas
  let bestMatch: Product | null = null;
  let maxLen = 0;

  for (const prod of productList) {
    for (const keyword of prod.keywords) {
      const normalizedKeyword = normalize(keyword);
      // Buscamos si la palabra clave está dentro del texto del usuario
      if (normalizedText.includes(normalizedKeyword) && normalizedKeyword.length > maxLen) {
        maxLen = normalizedKeyword.length;
        bestMatch = prod;
      }
    }
  }
  return bestMatch;
}

export const generateResponse = async (userInput: string, products: Product[]): Promise<Invoice | { response: string }> => {
  // Simular delay de red para UX
  await new Promise(resolve => setTimeout(resolve, 400));

  const normalizedInput = normalize(userInput);

  // 1. Modo Consulta de Precios
  const isPriceQuery = (normalizedInput.includes('precio') ||
    normalizedInput.includes('cuanto cuesta') ||
    normalizedInput.includes('vale')) &&
    !/\d/.test(normalizedInput); // Evitar si hay números

  if (isPriceQuery) {
    const product = findProduct(userInput, products);
    if (product) {
      return { response: `El precio de ${product.name} es $${product.price.toFixed(2)} por ${product.unit}.` };
    } else {
      return { response: "Lo siento, no encontré ese producto en la lista de precios. Intenta usar el nombre exacto o una palabra clave." };
    }
  }

  // 2. Modo Facturación (Parsing del pedido)
  const segments = userInput.split(/,|\ny\s|\sy\s|\n/g).filter(s => s.trim().length > 0);

  const invoiceItems: InvoiceItem[] = [];
  let total = 0;
  let itemCount = 0;

  for (const segment of segments) {
    const cleanSegment = segment.replace(/\.+$/g, '').trim(); // Quitar solo puntos al final
    if (!cleanSegment) continue;

    // PASO 1: Buscar si hay un precio explícito
    const { price: explicitPrice, textWithoutPrice } = extractExplicitPrice(cleanSegment);

    // PASO 2: Buscar cantidad
    const { quantity, remainingText } = parseQuantity(textWithoutPrice);

    // PASO 3: Buscar producto
    const productSearchText = remainingText.replace(/^\s*de\s+/i, '').trim();
    const product = findProduct(productSearchText, products);

    // LÓGICA DE DECISIÓN
    if (product) {
      const finalUnitPrice = explicitPrice !== null ? explicitPrice : product.price;
      const subtotal = Math.round((quantity * finalUnitPrice) * 100) / 100; // Redondear a 2 decimales

      invoiceItems.push({
        quantity: `${quantity} ${quantity > 1 && product.unit !== 'lb' ? product.unit + 's' : product.unit}`,
        product: product.name + (explicitPrice !== null ? ' (Precio manual)' : ''),
        unit_price: finalUnitPrice,
        subtotal: subtotal
      });
      total += subtotal;
      itemCount++;
    } else if (explicitPrice !== null) {
      const adHocName = productSearchText.length > 0
        ? productSearchText.charAt(0).toUpperCase() + productSearchText.slice(1)
        : "Varios";

      const subtotal = Math.round((quantity * explicitPrice) * 100) / 100; // Redondear a 2 decimales

      invoiceItems.push({
        quantity: quantity.toString(),
        product: adHocName,
        unit_price: explicitPrice,
        subtotal: subtotal
      });
      total += subtotal;
      itemCount++;
    }
  }

  if (itemCount > 0) {
    return {
      items: invoiceItems,
      total_items: invoiceItems.length,
      grand_total: Math.round(total * 100) / 100 // Redondear total final a 2 decimales
    };
  }

  return {
    response: "No pude identificar productos ni precios en tu mensaje. Intenta decir algo como '2 chulas', 'ciruela', o '$2 de pan'."
  };
};
