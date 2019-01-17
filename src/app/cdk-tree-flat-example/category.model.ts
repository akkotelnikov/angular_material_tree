import { Record, List } from 'immutable';

export interface CategoryNodeInterface {
    id: number | string | null;
    name: string;
    children: CategoryNode[];
}

export interface CategoryNodeFlatInterface {
    id: number | string | null;
    name: string;
    children: Array<CategoryNode | CategoryNodeFlat>;
    expandable: boolean;
    level: number;
}

const categoryNodeRecord = Record<CategoryNodeInterface>({
    id: null,
    name: '',
    children: []
});

const categoryNodeFlatRecord = Record<CategoryNodeFlatInterface>({
    id: null,
    name: '',
    children: [],
    expandable: false,
    level: 0
});

export class CategoryNode extends categoryNodeRecord implements CategoryNodeInterface {}

export class CategoryNodeFlat extends categoryNodeFlatRecord implements CategoryNodeFlatInterface {}