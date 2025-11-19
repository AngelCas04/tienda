import { Invoice, InvoiceItem } from '../types';

// Definición de productos con sus palabras clave y precios
interface ProductDef {
  id: string;
  keywords: string[];
  price: number;
  name: string;
  unit: string;
}

const PRODUCTS: ProductDef[] = [
  // Aceites
  { id: 'aceite_orisol', keywords: ['aceite orisol', 'orisol'], price: 2.15, name: 'Aceite Orisol', unit: 'unidad' },
  { id: 'aceite_mazola', keywords: ['aceite mazola', 'mazola'], price: 2.15, name: 'Aceite Mazola', unit: 'unidad' },
  { id: 'aceite_generico', keywords: ['aceite'], price: 1.50, name: 'Aceite (Trasegado)', unit: 'botella' },

  // Granos y Básicos
  { id: 'arroz', keywords: ['arroz'], price: 0.60, name: 'Arroz blanco y preco', unit: 'lb' },
  { id: 'azucar', keywords: ['azucar'], price: 0.55, name: 'Azúcar', unit: 'lb' },
  { id: 'harina', keywords: ['harina'], price: 1.50, name: 'Harina Suave', unit: 'unidad' },
  { id: 'frijoles', keywords: ['frijoles', 'frijol'], price: 1.20, name: 'Frijoles', unit: 'lb' },
  { id: 'avena', keywords: ['avena'], price: 1.30, name: 'Avena', unit: 'unidad' },
  
  // Café
  { id: 'cafe_riko_caja', keywords: ['cafe riko', 'caja de cafe', 'riko'], price: 3.90, name: 'Café Riko (Caja)', unit: 'caja' },
  { id: 'cafe_sobres', keywords: ['sobre de cafe', 'sobres de cafe', 'sobre cafe', 'sobres', 'sobrecito'], price: 0.09, name: 'Sobre Café Riko', unit: 'sobre' }, // Aprox para cálculo unitario (3x0.25)
  { id: 'coscafe_hervir', keywords: ['coscafe de hervir', 'de hervir'], price: 1.20, name: 'Coscafe De hervir', unit: 'unidad' },
  { id: 'coscafe_caja', keywords: ['coscafe', 'caja coscafe'], price: 2.00, name: 'Coscafe (Caja)', unit: 'caja' },

  // Bandejas y Platos
  { id: 'bandeja_dipsa', keywords: ['bandeja dipsa', 'dipsa'], price: 4.25, name: 'Bandeja Dipsa', unit: 'unidad' },
  { id: 'bandeja_anaranjado', keywords: ['bandeja anaranjado', 'bandeja naranja', 'anaranjado'], price: 3.25, name: 'Bandeja Anaranjado', unit: 'unidad' },
  { id: 'plato_rosado', keywords: ['plato rosado', 'rosado'], price: 0.65, name: 'Plato rosado', unit: 'unidad' },
  { id: 'plato_azul', keywords: ['plato azul', 'azul'], price: 0.70, name: 'Plato azul', unit: 'unidad' },
  { id: 'vaso_8', keywords: ['vaso 8', 'vasos 8'], price: 0.75, name: 'Vaso #8', unit: 'unidad' },
  { id: 'vaso_10', keywords: ['vaso 10', 'vasos 10'], price: 0.90, name: 'Vaso #10', unit: 'unidad' },

  // Bebidas y Líquidos
  { id: 'jamaica', keywords: ['jamaica'], price: 2.20, name: 'Jamaica', unit: 'lb' },
  { id: 'leche_pesada', keywords: ['leche pesada', 'pesada'], price: 2.80, name: 'Leche pesada', unit: 'lb' },
  { id: 'leche_26g', keywords: ['leche 26g', 'leche pequeña'], price: 0.35, name: 'Leche 26g', unit: 'unidad' },
  { id: 'leche_350g', keywords: ['leche 350g', 'leche grande'], price: 3.50, name: 'Leche 350g', unit: 'unidad' },
  { id: 'jugos_ya', keywords: ['jugos ya', 'jugo ya'], price: 0.35, name: 'Jugos Ya', unit: 'unidad' },
  { id: 'vinagre', keywords: ['vinagre'], price: 1.00, name: 'Vinagre de manzana', unit: 'unidad' },

  // Sopas y Pastas
  { id: 'rancheras', keywords: ['ranchera', 'rancheras'], price: 0.60, name: 'Rancheras', unit: 'unidad' },
  { id: 'sopa_tortilla_knorr', keywords: ['sopa de tortilla knorr', 'knorr'], price: 1.00, name: 'Sopa de tortilla Knorr', unit: 'unidad' },
  { id: 'sopa_tortilla_maggi', keywords: ['sopa de tortilla maggi', 'maggi'], price: 0.80, name: 'Sopa de tortilla Maggi', unit: 'unidad' },
  { id: 'sopa_mariscos', keywords: ['sopa de marisco', 'marisco', 'mariscos'], price: 0.80, name: 'Sopa de mariscos', unit: 'unidad' },
  { id: 'sopa_cola', keywords: ['sopa de cola', 'cola de res'], price: 0.80, name: 'Sopa de cola de res', unit: 'unidad' },
  { id: 'soperos_tira', keywords: ['tira de soperos', 'tira soperos', 'tira entera'], price: 4.25, name: 'Soperos (Tira entera)', unit: 'tira' },
  { id: 'soperos_indiv', keywords: ['soperos', 'sopero'], price: 0.20, name: 'Soperos (Individual)', unit: 'unidad' }, // 5 x $1 = 0.20
  { id: 'sopas_generic', keywords: ['sopa', 'sopas'], price: 0.45, name: 'Sopas (Genérica)', unit: 'unidad' },
  { id: 'coditos', keywords: ['codito', 'coditos'], price: 0.60, name: 'Coditos', unit: 'unidad' },
  { id: 'macarrones', keywords: ['macarron', 'macarrones'], price: 0.60, name: 'Macarrones', unit: 'unidad' },
  { id: 'lasana', keywords: ['lasaña', 'lasana'], price: 2.25, name: 'Lasaña', unit: 'unidad' },

  // Varios Cocina
  { id: 'margarina_caja', keywords: ['caja de margarina', 'caja margarina'], price: 2.00, name: 'Margarina (Caja)', unit: 'caja' },
  { id: 'margarina_barra', keywords: ['margarina', 'barra margarina', 'barrita'], price: 0.45, name: 'Margarina (Barrita)', unit: 'barrita' },
  { id: 'aluminio', keywords: ['aluminio'], price: 1.00, name: 'Aluminio', unit: 'unidad' },
  { id: 'salsas_chula', keywords: ['salsa chula', 'salsas chula', 'chula'], price: 0.35, name: 'Salsas Chula', unit: 'unidad' },
  { id: 'esencia_grande', keywords: ['esencia grande', 'vainilla grande', 'fresa grande'], price: 1.00, name: 'Esencia (Grande)', unit: 'unidad' },
  { id: 'esencia_pequena', keywords: ['esencia', 'vainilla', 'fresa'], price: 0.60, name: 'Esencia (Pequeña)', unit: 'unidad' },
  { id: 'salsa_soya', keywords: ['salsa de soya', 'salsa soya', 'soya', 'shihito'], price: 1.00, name: 'Salsa de Soya Shihito', unit: 'unidad' },
  { id: 'salsa_inglesa', keywords: ['salsa inglesa', 'inglesa'], price: 1.50, name: 'Salsa inglesa', unit: 'unidad' },
  { id: 'ajo', keywords: ['ajo', 'bote de ajo'], price: 1.50, name: 'Bote de ajo grande', unit: 'unidad' },
  { id: 'mostaza', keywords: ['mostaza'], price: 1.50, name: 'Mostaza preparada bote', unit: 'unidad' },
  { id: 'cubitos', keywords: ['cubito', 'cubitos'], price: 0.04, name: 'Cubitos', unit: 'unidad' }, // 25 x $1 = 0.04
  { id: 'hongos', keywords: ['lata hongos', 'hongo', 'hongos'], price: 2.25, name: 'Lata Hongos', unit: 'unidad' },
  { id: 'sardina_madrigal', keywords: ['sardina madrigal', 'madrigal'], price: 2.85, name: 'Sardina Madrigal', unit: 'unidad' },
  { id: 'sardina_norte', keywords: ['sardina del norte', 'sardina norte', 'sardina'], price: 1.00, name: 'Sardina Del norte', unit: 'unidad' },
  
  // Chiles
  { id: 'chile_ciruela', keywords: ['chile ciruela', 'ciruela'], price: 0.25, name: 'Chile ciruela', unit: 'unidad' },
  { id: 'chile_guaco', keywords: ['chile guaco', 'guaco'], price: 0.125, name: 'Chile guaco', unit: 'unidad' }, // 2 x 0.25
  { id: 'chile_jalisco', keywords: ['chile jalisco', 'jalisco'], price: 1.50, name: 'Chile Jalisco', unit: 'unidad' },
  { id: 'chile_macho', keywords: ['chile macho', 'macho'], price: 1.50, name: 'Chile macho', unit: 'unidad' },
  { id: 'chile_grosero', keywords: ['chile grosero', 'grosero'], price: 1.25, name: 'Chile grosero', unit: 'unidad' },

  // Bolsas
  { id: 'bolsa_1lb', keywords: ['bolsa de 1lb', 'bolsa 1lb', 'bolsa de una libra'], price: 0.60, name: 'Bolsa de 1lb', unit: 'unidad' },
  { id: 'bolsa_2lb', keywords: ['bolsa de 2lb', 'bolsa 2lb', 'bolsa de dos libras'], price: 0.80, name: 'Bolsa de 2lb', unit: 'unidad' },
  { id: 'bolsa_3lb', keywords: ['bolsa de 3lb', 'bolsa 3lb', 'bolsa de tres libras'], price: 1.00, name: 'Bolsa de 3lb', unit: 'unidad' },
  { id: 'bolsa_5lb', keywords: ['bolsa de 5lb', 'bolsa 5lb', 'bolsa de cinco libras'], price: 1.85, name: 'Bolsa de 5lb', unit: 'unidad' },
  { id: 'bolsa_1', keywords: ['bolsa 1', 'bolsa #1', 'bolsa numero 1'], price: 1.00, name: 'Bolsa de #1', unit: 'unidad' },
  { id: 'bolsa_2', keywords: ['bolsa 2', 'bolsa #2', 'bolsa numero 2'], price: 1.80, name: 'Bolsa de #2', unit: 'unidad' },
  { id: 'bolsa_mini_termo', keywords: ['bolsa mini termo', 'mini termo'], price: 0.85, name: 'Bolsa Mini Termo', unit: 'unidad' },
  { id: 'bolsa_mini', keywords: ['bolsa mini', 'mini corriente'], price: 0.65, name: 'Bolsa Mini Corriente', unit: 'unidad' },

  // Limpieza y Otros
  { id: 'papel_scott', keywords: ['papel scott', 'papel higienico', 'scott'], price: 1.25, name: 'Papel Scott', unit: 'unidad' },
  { id: 'jabon_ropa', keywords: ['jabon de ropa', 'jabón de ropa', 'jabon ropa'], price: 1.10, name: 'Jabón de ropa', unit: 'unidad' },
  { id: 'pasta_colgate', keywords: ['pasta colgate', 'colgate', 'pasta'], price: 1.00, name: 'Pasta Colgate', unit: 'unidad' },
  { id: 'fosforos', keywords: ['fosforo', 'fósforo', 'fosforos'], price: 0.40, name: 'Fósforo', unit: 'unidad' },
];

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
    .replace(/[\u0300-\u036f]/g, "");
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

function findProduct(text: string): ProductDef | null {
  const normalizedText = normalize(text);
  
  // Ordenamos los productos por coincidencia de keyword para priorizar las más específicas o largas
  let bestMatch: ProductDef | null = null;
  let maxLen = 0;

  for (const prod of PRODUCTS) {
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

export const generateResponse = async (userInput: string): Promise<Invoice | { response: string }> => {
  // Simular delay de red para UX
  await new Promise(resolve => setTimeout(resolve, 400));

  const normalizedInput = normalize(userInput);

  // 1. Modo Consulta de Precios
  const isPriceQuery = normalizedInput.includes('precio') || 
                       normalizedInput.includes('cuanto cuesta') || 
                       normalizedInput.includes('vale');

  if (isPriceQuery) {
    const product = findProduct(userInput); // findProduct hace su propia normalización
    if (product) {
      return { response: `El precio de ${product.name} es $${product.price.toFixed(2)} por ${product.unit}.` };
    } else {
      return { response: "Lo siento, no encontré ese producto en la lista de precios. Intenta usar el nombre exacto o una palabra clave." };
    }
  }

  // 2. Modo Facturación (Parsing del pedido)
  // Separar por comas, "y", o saltos de línea
  const segments = userInput.split(/,|\ny\s|\sy\s|\n/g).filter(s => s.trim().length > 0);
  
  const invoiceItems: InvoiceItem[] = [];
  let total = 0;
  let itemCount = 0;

  for (const segment of segments) {
    const cleanSegment = segment.replace(/\./g, '').trim(); // Quitar puntos finales
    if (!cleanSegment) continue;

    const { quantity, remainingText } = parseQuantity(cleanSegment);
    const product = findProduct(remainingText);

    if (product) {
      const subtotal = quantity * product.price;
      invoiceItems.push({
        quantity: `${quantity} ${quantity > 1 && product.unit !== 'lb' ? product.unit + 's' : product.unit}`,
        product: product.name,
        unit_price: product.price,
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
      grand_total: total
    };
  }

  // Si no se detectó nada claro
  return { 
    response: "No pude identificar productos en tu mensaje. Intenta decir algo como '2 chulas y 1 libra de arroz' o 'ciruela'." 
  };
};