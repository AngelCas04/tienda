import { Message, Product } from './types';

export const initialMessage: Message = {
  id: 'init',
  sender: 'ai',
  text: '¡Hola! Soy tu asistente de tienda. Puedes preguntarme el precio de un producto o dictarme un pedido para generar una factura. Por ejemplo: "cuánto cuesta el aceite" o "un arroz, dos sopas y una libra de frijoles".',
};

export const DEFAULT_PRODUCTS: Product[] = [
  // Aceites
  { id: 'aceite_orisol', keywords: ['aceite orisol', 'orisol'], price: 2.15, name: 'Aceite Orisol', unit: 'unidad', category: 'Aceites', stock: 100 },
  { id: 'aceite_mazola', keywords: ['aceite mazola', 'mazola'], price: 2.15, name: 'Aceite Mazola', unit: 'unidad', category: 'Aceites', stock: 100 },
  { id: 'aceite_generico', keywords: ['aceite'], price: 1.50, name: 'Aceite (Trasegado)', unit: 'botella', category: 'Aceites', stock: 100 },

  // Granos y Básicos
  { id: 'arroz', keywords: ['arroz'], price: 0.60, name: 'Arroz blanco y preco', unit: 'lb', category: 'Granos', stock: 100 },
  { id: 'azucar', keywords: ['azucar'], price: 0.55, name: 'Azúcar', unit: 'lb', category: 'Granos', stock: 100 },
  { id: 'harina', keywords: ['harina'], price: 1.50, name: 'Harina Suave', unit: 'unidad', category: 'Granos', stock: 100 },
  { id: 'frijoles', keywords: ['frijoles', 'frijol'], price: 1.20, name: 'Frijoles', unit: 'lb', category: 'Granos', stock: 100 },
  { id: 'avena', keywords: ['avena'], price: 1.30, name: 'Avena', unit: 'unidad', category: 'Granos', stock: 100 },

  // Café
  { id: 'cafe_riko_caja', keywords: ['cafe riko', 'caja de cafe', 'riko'], price: 3.90, name: 'Café Riko (Caja)', unit: 'caja', category: 'Café', stock: 100 },
  { id: 'cafe_sobres', keywords: ['sobre de cafe', 'sobres de cafe', 'sobre cafe', 'sobres', 'sobrecito'], price: 0.09, name: 'Sobre Café Riko', unit: 'sobre', category: 'Café', stock: 100 },
  { id: 'coscafe_hervir', keywords: ['coscafe de hervir', 'de hervir'], price: 1.20, name: 'Coscafe De hervir', unit: 'unidad', category: 'Café', stock: 100 },
  { id: 'coscafe_caja', keywords: ['coscafe', 'caja coscafe'], price: 2.00, name: 'Coscafe (Caja)', unit: 'caja', category: 'Café', stock: 100 },

  // Bandejas y Platos
  { id: 'bandeja_dipsa', keywords: ['bandeja dipsa', 'dipsa'], price: 4.25, name: 'Bandeja Dipsa', unit: 'unidad', category: 'Desechables', stock: 100 },
  { id: 'bandeja_anaranjado', keywords: ['bandeja anaranjado', 'bandeja naranja', 'anaranjado'], price: 3.25, name: 'Bandeja Anaranjado', unit: 'unidad', category: 'Desechables', stock: 100 },
  { id: 'plato_rosado', keywords: ['plato rosado', 'rosado'], price: 0.65, name: 'Plato rosado', unit: 'unidad', category: 'Desechables', stock: 100 },
  { id: 'plato_azul', keywords: ['plato azul', 'azul'], price: 0.70, name: 'Plato azul', unit: 'unidad', category: 'Desechables', stock: 100 },
  { id: 'vaso_8', keywords: ['vaso 8', 'vasos 8'], price: 0.75, name: 'Vaso #8', unit: 'unidad', category: 'Desechables', stock: 100 },
  { id: 'vaso_10', keywords: ['vaso 10', 'vasos 10'], price: 0.90, name: 'Vaso #10', unit: 'unidad', category: 'Desechables', stock: 100 },

  // Bebidas y Líquidos
  { id: 'jamaica', keywords: ['jamaica'], price: 2.20, name: 'Jamaica', unit: 'lb', category: 'Bebidas', stock: 100 },
  { id: 'leche_pesada', keywords: ['leche pesada', 'pesada'], price: 2.80, name: 'Leche pesada', unit: 'lb', category: 'Lácteos', stock: 100 },
  { id: 'leche_26g', keywords: ['leche 26g', 'leche pequeña'], price: 0.35, name: 'Leche 26g', unit: 'unidad', category: 'Lácteos', stock: 100 },
  { id: 'leche_350g', keywords: ['leche 350g', 'leche grande'], price: 3.50, name: 'Leche 350g', unit: 'unidad', category: 'Lácteos', stock: 100 },
  { id: 'jugos_ya', keywords: ['jugos ya', 'jugo ya'], price: 0.35, name: 'Jugos Ya', unit: 'unidad', category: 'Bebidas', stock: 100 },
  { id: 'vinagre', keywords: ['vinagre'], price: 1.00, name: 'Vinagre de manzana', unit: 'unidad', category: 'Cocina', stock: 100 },

  // Sopas y Pastas
  { id: 'rancheras', keywords: ['ranchera', 'rancheras'], price: 0.60, name: 'Rancheras', unit: 'unidad', category: 'Sopas', stock: 100 },
  { id: 'sopa_tortilla_knorr', keywords: ['sopa de tortilla knorr', 'knorr'], price: 1.00, name: 'Sopa de tortilla Knorr', unit: 'unidad', category: 'Sopas', stock: 100 },
  { id: 'sopa_tortilla_maggi', keywords: ['sopa de tortilla maggi', 'maggi'], price: 0.80, name: 'Sopa de tortilla Maggi', unit: 'unidad', category: 'Sopas', stock: 100 },
  { id: 'sopa_mariscos', keywords: ['sopa de marisco', 'marisco', 'mariscos'], price: 0.80, name: 'Sopa de mariscos', unit: 'unidad', category: 'Sopas', stock: 100 },
  { id: 'sopa_cola', keywords: ['sopa de cola', 'cola de res'], price: 0.80, name: 'Sopa de cola de res', unit: 'unidad', category: 'Sopas', stock: 100 },
  { id: 'soperos_tira', keywords: ['tira de soperos', 'tira soperos', 'tira entera'], price: 4.25, name: 'Soperos (Tira entera)', unit: 'tira', category: 'Sopas', stock: 100 },
  { id: 'soperos_indiv', keywords: ['soperos', 'sopero'], price: 0.20, name: 'Soperos (Individual)', unit: 'unidad', category: 'Sopas', stock: 100 },
  { id: 'sopas_generic', keywords: ['sopa', 'sopas'], price: 0.45, name: 'Sopas (Genérica)', unit: 'unidad', category: 'Sopas', stock: 100 },
  { id: 'coditos', keywords: ['codito', 'coditos'], price: 0.60, name: 'Coditos', unit: 'unidad', category: 'Pastas', stock: 100 },
  { id: 'macarrones', keywords: ['macarron', 'macarrones'], price: 0.60, name: 'Macarrones', unit: 'unidad', category: 'Pastas', stock: 100 },
  { id: 'lasana', keywords: ['lasaña', 'lasana'], price: 2.25, name: 'Lasaña', unit: 'unidad', category: 'Pastas', stock: 100 },

  // Varios Cocina
  { id: 'margarina_caja', keywords: ['caja de margarina', 'caja margarina'], price: 2.00, name: 'Margarina (Caja)', unit: 'caja', category: 'Cocina', stock: 100 },
  { id: 'margarina_barra', keywords: ['margarina', 'barra margarina', 'barrita'], price: 0.45, name: 'Margarina (Barrita)', unit: 'barrita', category: 'Cocina', stock: 100 },
  { id: 'aluminio', keywords: ['aluminio'], price: 1.00, name: 'Aluminio', unit: 'unidad', category: 'Cocina', stock: 100 },
  { id: 'salsas_chula', keywords: ['salsa chula', 'salsas chula', 'chula'], price: 0.35, name: 'Salsas Chula', unit: 'unidad', category: 'Cocina', stock: 100 },
  { id: 'esencia_grande', keywords: ['esencia grande', 'vainilla grande', 'fresa grande'], price: 1.00, name: 'Esencia (Grande)', unit: 'unidad', category: 'Cocina', stock: 100 },
  { id: 'esencia_pequena', keywords: ['esencia', 'vainilla', 'fresa'], price: 0.60, name: 'Esencia (Pequeña)', unit: 'unidad', category: 'Cocina', stock: 100 },
  { id: 'salsa_soya', keywords: ['salsa de soya', 'salsa soya', 'soya', 'shihito'], price: 1.00, name: 'Salsa de Soya Shihito', unit: 'unidad', category: 'Cocina', stock: 100 },
  { id: 'salsa_inglesa', keywords: ['salsa inglesa', 'inglesa'], price: 1.50, name: 'Salsa inglesa', unit: 'unidad', category: 'Cocina', stock: 100 },
  { id: 'ajo', keywords: ['ajo', 'bote de ajo'], price: 1.50, name: 'Bote de ajo grande', unit: 'unidad', category: 'Cocina', stock: 100 },
  { id: 'mostaza', keywords: ['mostaza'], price: 1.50, name: 'Mostaza preparada bote', unit: 'unidad', category: 'Cocina', stock: 100 },
  { id: 'cubitos', keywords: ['cubito', 'cubitos'], price: 0.04, name: 'Cubitos', unit: 'unidad', category: 'Cocina', stock: 100 },
  { id: 'hongos', keywords: ['lata hongos', 'hongo', 'hongos'], price: 2.25, name: 'Lata Hongos', unit: 'unidad', category: 'Cocina', stock: 100 },
  { id: 'sardina_madrigal', keywords: ['sardina madrigal', 'madrigal'], price: 2.85, name: 'Sardina Madrigal', unit: 'unidad', category: 'Enlatados', stock: 100 },
  { id: 'sardina_norte', keywords: ['sardina del norte', 'sardina norte', 'sardina'], price: 1.00, name: 'Sardina Del norte', unit: 'unidad', category: 'Enlatados', stock: 100 },

  // Chiles
  { id: 'chile_ciruela', keywords: ['chile ciruela', 'ciruela'], price: 0.25, name: 'Chile ciruela', unit: 'unidad', category: 'Especias', stock: 100 },
  { id: 'chile_guaco', keywords: ['chile guaco', 'guaco'], price: 0.125, name: 'Chile guaco', unit: 'unidad', category: 'Especias', stock: 100 },
  { id: 'chile_jalisco', keywords: ['chile jalisco', 'jalisco'], price: 1.50, name: 'Chile Jalisco', unit: 'unidad', category: 'Especias', stock: 100 },
  { id: 'chile_macho', keywords: ['chile macho', 'macho'], price: 1.50, name: 'Chile macho', unit: 'unidad', category: 'Especias', stock: 100 },
  { id: 'chile_grosero', keywords: ['chile grosero', 'grosero'], price: 1.25, name: 'Chile grosero', unit: 'unidad', category: 'Especias', stock: 100 },

  // Bolsas
  { id: 'bolsa_1lb', keywords: ['bolsa de 1lb', 'bolsa 1lb', 'bolsa de una libra'], price: 0.60, name: 'Bolsa de 1lb', unit: 'unidad', category: 'Bolsas', stock: 100 },
  { id: 'bolsa_2lb', keywords: ['bolsa de 2lb', 'bolsa 2lb', 'bolsa de dos libras'], price: 0.80, name: 'Bolsa de 2lb', unit: 'unidad', category: 'Bolsas', stock: 100 },
  { id: 'bolsa_3lb', keywords: ['bolsa de 3lb', 'bolsa 3lb', 'bolsa de tres libras'], price: 1.00, name: 'Bolsa de 3lb', unit: 'unidad', category: 'Bolsas', stock: 100 },
  { id: 'bolsa_5lb', keywords: ['bolsa de 5lb', 'bolsa 5lb', 'bolsa de cinco libras'], price: 1.85, name: 'Bolsa de 5lb', unit: 'unidad', category: 'Bolsas', stock: 100 },
  { id: 'bolsa_1', keywords: ['bolsa 1', 'bolsa #1', 'bolsa numero 1'], price: 1.00, name: 'Bolsa de #1', unit: 'unidad', category: 'Bolsas', stock: 100 },
  { id: 'bolsa_2', keywords: ['bolsa 2', 'bolsa #2', 'bolsa numero 2'], price: 1.80, name: 'Bolsa de #2', unit: 'unidad', category: 'Bolsas', stock: 100 },
  { id: 'bolsa_mini_termo', keywords: ['bolsa mini termo', 'mini termo'], price: 0.85, name: 'Bolsa Mini Termo', unit: 'unidad', category: 'Bolsas', stock: 100 },
  { id: 'bolsa_mini', keywords: ['bolsa mini', 'mini corriente'], price: 0.65, name: 'Bolsa Mini Corriente', unit: 'unidad', category: 'Bolsas', stock: 100 },

  // Limpieza y Otros
  { id: 'papel_scott', keywords: ['papel scott', 'papel higienico', 'scott'], price: 1.25, name: 'Papel Scott', unit: 'unidad', category: 'Limpieza', stock: 100 },
  { id: 'jabon_ropa', keywords: ['jabon de ropa', 'jabón de ropa', 'jabon ropa'], price: 1.10, name: 'Jabón de ropa', unit: 'unidad', category: 'Limpieza', stock: 100 },
  { id: 'pasta_colgate', keywords: ['pasta colgate', 'colgate', 'pasta'], price: 1.00, name: 'Pasta Colgate', unit: 'unidad', category: 'Higiene', stock: 100 },
  { id: 'fosforos', keywords: ['fosforo', 'fósforo', 'fosforos'], price: 0.40, name: 'Fósforo', unit: 'unidad', category: 'Hogar', stock: 100 },
];
