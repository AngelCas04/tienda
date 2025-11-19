import { GoogleGenAI, Type } from "@google/genai";
import { Invoice } from '../types';

const priceList = `
- Aceite: $1.50/botella trasegado
- Arroz blanco y preco: $0.60/lb
- Azúcar: $0.55/lb
- Café Riko: $3.90/caja y 3 sobresitos por $0.25
- Harina Suave: $1.50
- Aceite Orisol: $2.15
- Aceite Mazola: $2.15
- Bandeja Anaranjado: $3.25
- Bandeja Dipsa: $4.25
- Jamaica: $2.20/lb
- Plato rosado: $0.65/unidad
- Plato azul: $0.70/unidad
- Leche pesada: $2.80/lb
- Rancheras: $0.60/unidad
- Sopas: $0.45/unidad (genérica, si no se especifica otra)
- Coditos: $0.60/unidad
- Margarina: $0.45/barrita y $2 la caja
- Aluminio: $1/unidad
- Vaso 8: $0.75/unidad
- Vaso 10: $0.90/unidad
- Bolsa de 1lb: $0.60
- Bolsa de 2lb: $0.80
- Jugos ya: $0.35/unidad
- Frijoles: $1.20/lb
- Bolsa de 3lb: $1
- Bolsa de #1: $1
- Bolsa de #2: $1.80
- Macarrones: $0.60/unidad
- Salsas Chula: $0.35
- Soperos: $4.25 la tira entera y 5 por $1
- Coscafe De hervir: $1.20/unidad
- Lasaña: $2.25
- Coscafe: $2 caja y 3 por $0.25
- Sopa de tortilla Knorr: $1
- Sopa de mariscos: $0.80/unidad
- Sopa de cola de res: $0.80/unidad
- Sopa de tortilla Maggi: $0.80/unidad
- Bolsa de 5lb: $1.85
- Papel Scott: $1.25/unidad
- Jabón de ropa: $1.10/unidad
- Leche 26g: $0.35/unidad
- Leche 350g: $3.50/unidad
- Vinagre de manzana: $1/unidad
- Esencias (vainilla, fresa): $1 grande y $0.60 pequeña
- Salsa de Soya Shihito: $1
- Chile ciruela: $0.25/unidad
- Chile guaco: 2 por $0.25
- Pasta Colgate: $1/unidad
- Salsa inglesa: $1.50/unidad
- Bote de ajo grande: $1.50/unidad
- Mostaza preparada bote: $1.50/unidad
- Chile Jalisco: $1.50/unidad
- Chile macho: $1.50/unidad
- Chile grosero: $1.25/unidad
- Avena: $1.30/unidad
- Fósforo: $0.40/unidad
- Sardina Del norte: $1/unidad
- Sardina Madrigal: $2.85/unidad
- Cubitos: 25 por $1
- Lata Hongos: $2.25/unidad
- Bolsa Mini Termo: $0.85/unidad
- Bolsa Mini Corriente: $0.65/unidad
`;

const systemInstruction = `Eres un asistente de punto de venta para una tienda. Tu única función es procesar pedidos de clientes y responder preguntas sobre precios basándote ESTRICTAMENTE en la siguiente lista de precios. Todos los precios están en dólares americanos (USD).

LISTA DE PRECIOS:
${priceList}

TUS REGLAS:
1.  **Si el usuario te da un pedido (una lista de artículos)**: DEBES responder ÚNICAMENTE con un objeto JSON que siga el esquema definido. Calcula el subtotal para cada artículo (cantidad * precio unitario) y el total general. Interpreta cantidades como 'un', 'una', 'dos', etc. Si no se especifica cantidad, asume 1. Para artículos vendidos por libra (lb), la cantidad debe reflejar eso (ej. "1 lb").
2.  **Si el usuario pregunta por el precio de uno o varios artículos**: Responde con un texto corto y directo en español. Por ejemplo, si preguntan "¿Cuánto cuesta el arroz?", responde "El arroz blanco y preco cuesta $0.60 por libra.". No uses el formato JSON para esto.
3.  **No respondas a ninguna pregunta que no esté relacionada con la lista de precios o la creación de una factura.** Si te preguntan otra cosa, responde amablemente: "Solo puedo ayudarte con precios y pedidos de la tienda.".
4.  Sé preciso con los cálculos.
5.  Interpreta el lenguaje natural. "un arroz" significa "1 lb de Arroz blanco y preco". "dos sopas" significa 2 unidades de "Sopas".
`;


const invoiceSchema = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      description: 'Lista de los artículos en el pedido.',
      items: {
        type: Type.OBJECT,
        properties: {
          quantity: {
            type: Type.STRING,
            description: 'La cantidad del artículo (ej. "2 unidades", "1 lb").',
          },
          product: {
            type: Type.STRING,
            description: 'El nombre del producto.',
          },
          unit_price: {
            type: Type.NUMBER,
            description: 'El precio por unidad del producto.',
          },
          subtotal: {
            type: Type.NUMBER,
            description: 'El costo total para este artículo (cantidad * precio unitario).',
          },
        },
        required: ['quantity', 'product', 'unit_price', 'subtotal'],
      },
    },
    total_items: {
      type: Type.NUMBER,
      description: 'El número total de artículos individuales en el pedido.',
    },
    grand_total: {
      type: Type.NUMBER,
      description: 'La suma total de todos los subtotales.',
    },
  },
  required: ['items', 'total_items', 'grand_total'],
};


const textResponseSchema = {
    type: Type.OBJECT,
    properties: {
        response: {
            type: Type.STRING,
            description: "Respuesta en texto plano a una pregunta de precio o una consulta general."
        }
    },
    required: ['response']
};

export const generateResponse = async (userInput: string): Promise<Invoice | { response: string }> => {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userInput,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
            oneOf: [
                invoiceSchema,
                textResponseSchema,
            ]
        }
      },
    });

    const text = response.text;
    if (!text) {
        throw new Error("La respuesta de la API está vacía.");
    }
    
    const jsonText = text.trim();
    const parsedJson = JSON.parse(jsonText);
    return parsedJson;

  } catch (error) {
    console.error("Error al llamar a la API de Gemini:", error);
    throw new Error("No se pudo obtener una respuesta del asistente.");
  }
};