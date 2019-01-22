import { Map, List, fromJS } from 'immutable';

export interface Category extends Map<string, any> {
    get(key: 'id'):  number | string | null;
    get(key: 'name'): string;
    get(key: 'children'): List<Category>;
}

export interface CategoryNode {
    id: number | string | null;
    name: string;
    children: CategoryNode[];
}