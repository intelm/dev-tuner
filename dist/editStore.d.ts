export type StyleValues = {
    fontSize: number;
    color: string;
    background: string | null;
    paddingBlock: number;
    paddingInline: number;
    radius: number;
    gap: number | null;
    opacity: number;
};
export type Edit = {
    selector: string;
    label: string;
    el: HTMLElement;
    v0: StyleValues;
    changed: Partial<StyleValues>;
};
export declare const CSS_PROPS: Record<keyof StyleValues, string>;
export declare const formatValue: (key: keyof StyleValues, v: string | number | null) => string;
export declare const matchingElements: (selector: string) => HTMLElement[];
export declare function recordEdit<K extends keyof StyleValues>(selector: string, label: string, el: HTMLElement, v0: StyleValues, key: K, value: StyleValues[K]): void;
export declare function removeEdit(selector: string): void;
export declare function resetEdit(selector: string): void;
export declare function resetCount(el: HTMLElement): number;
export declare function useEdits(): Edit[];
