import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllProducts } from '../services/db';
import { Product } from '../types';

interface AutocompleteState {
    suggestions: Product[];
    isLoading: boolean;
    selectedIndex: number;
}

interface UseAutocompleteReturn {
    suggestions: Product[];
    isLoading: boolean;
    selectedIndex: number;
    handleInputChange: (value: string, cursorPosition: number) => string;
    selectSuggestion: (product: Product, currentText: string) => string;
    handleKeyNavigation: (key: string) => boolean;
    clearSuggestions: () => void;
    currentWord: string;
}

/**
 * Hook de autocompletado inteligente para productos
 * Busca productos por nombre y keywords, inserta comas automáticamente
 */
const useAutocomplete = (): UseAutocompleteReturn => {
    const [products, setProducts] = useState<Product[]>([]);
    const [state, setState] = useState<AutocompleteState>({
        suggestions: [],
        isLoading: true,
        selectedIndex: -1
    });
    const [currentWord, setCurrentWord] = useState('');

    // Cargar productos al iniciar
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const allProducts = await getAllProducts();
                setProducts(allProducts);
                setState(prev => ({ ...prev, isLoading: false }));
            } catch (error) {
                console.error('Error cargando productos:', error);
                setState(prev => ({ ...prev, isLoading: false }));
            }
        };
        loadProducts();
    }, []);

    // Extraer la última palabra después de la última coma
    const extractCurrentWord = useCallback((text: string, cursorPosition: number): string => {
        const textBeforeCursor = text.slice(0, cursorPosition);
        const lastCommaIndex = textBeforeCursor.lastIndexOf(',');
        const wordAfterComma = textBeforeCursor.slice(lastCommaIndex + 1).trim();

        // Solo buscar si hay al menos 2 caracteres
        return wordAfterComma.length >= 2 ? wordAfterComma.toLowerCase() : '';
    }, []);

    // Buscar productos que coincidan
    const searchProducts = useCallback((searchTerm: string): Product[] => {
        if (!searchTerm || searchTerm.length < 2) return [];

        const term = searchTerm.toLowerCase();

        return products
            .filter(product => {
                // Buscar en nombre
                if (product.name.toLowerCase().includes(term)) return true;

                // Buscar en keywords
                if (product.keywords?.some(kw => kw.toLowerCase().includes(term))) return true;

                // Buscar en categoría
                if (product.category?.toLowerCase().includes(term)) return true;

                return false;
            })
            .slice(0, 6); // Máximo 6 sugerencias
    }, [products]);

    // Manejar cambio en el input
    const handleInputChange = useCallback((value: string, cursorPosition: number): string => {
        const word = extractCurrentWord(value, cursorPosition);
        setCurrentWord(word);

        if (word) {
            const matches = searchProducts(word);
            setState(prev => ({
                ...prev,
                suggestions: matches,
                selectedIndex: -1
            }));
        } else {
            setState(prev => ({
                ...prev,
                suggestions: [],
                selectedIndex: -1
            }));
        }

        return value;
    }, [extractCurrentWord, searchProducts]);

    // Seleccionar una sugerencia
    const selectSuggestion = useCallback((product: Product, currentText: string): string => {
        // Encontrar la última coma y reemplazar lo que viene después con el producto
        const lastCommaIndex = currentText.lastIndexOf(',');
        const prefix = lastCommaIndex >= 0 ? currentText.slice(0, lastCommaIndex + 1) + ' ' : '';

        // Formato: "cantidad unidad Producto" - aquí solo insertamos el producto
        // El usuario puede agregar cantidad manualmente o por voz
        const newText = `${prefix}${product.name}, `;

        // Limpiar sugerencias
        setState(prev => ({
            ...prev,
            suggestions: [],
            selectedIndex: -1
        }));
        setCurrentWord('');

        return newText;
    }, []);

    // Navegación con teclado
    const handleKeyNavigation = useCallback((key: string): boolean => {
        const { suggestions, selectedIndex } = state;

        if (suggestions.length === 0) return false;

        switch (key) {
            case 'ArrowDown':
                setState(prev => ({
                    ...prev,
                    selectedIndex: Math.min(prev.selectedIndex + 1, suggestions.length - 1)
                }));
                return true;

            case 'ArrowUp':
                setState(prev => ({
                    ...prev,
                    selectedIndex: Math.max(prev.selectedIndex - 1, -1)
                }));
                return true;

            case 'Tab':
            case 'Enter':
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    return true; // Indica que se debe seleccionar
                }
                return false;

            case 'Escape':
                setState(prev => ({
                    ...prev,
                    suggestions: [],
                    selectedIndex: -1
                }));
                return true;

            default:
                return false;
        }
    }, [state]);

    // Limpiar sugerencias
    const clearSuggestions = useCallback(() => {
        setState(prev => ({
            ...prev,
            suggestions: [],
            selectedIndex: -1
        }));
        setCurrentWord('');
    }, []);

    return {
        suggestions: state.suggestions,
        isLoading: state.isLoading,
        selectedIndex: state.selectedIndex,
        handleInputChange,
        selectSuggestion,
        handleKeyNavigation,
        clearSuggestions,
        currentWord
    };
};

export default useAutocomplete;
