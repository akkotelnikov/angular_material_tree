import {SelectionModel} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';
import {Component, Injectable} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {BehaviorSubject} from 'rxjs';

/**
 * Node for to-do item
 */
export class TodoItemNode {
    id: number | string | null;
    item: string;
    children: TodoItemNode[];
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
    id: number | string | null;
    item: string;
    level: number;
    expandable: boolean;
}

/**
 * The Json object for to-do list data.
 */
// const TREE_DATA = {
//     Groceries: {
//         'Almond Meal flour': null,
//         'Organic eggs': null,
//         'Protein Powder': null,
//         Fruits: {
//             Apple: null,
//             Berries: ['Blueberry', 'Raspberry'],
//             Orange: null
//         }
//     },
//     Reminders: [
//         'Cook dinner',
//         'Read the Material Design spec',
//         'Upgrade Application to Angular'
//     ]
// };

const TREE_DATA = [
    {
        id: 1,
        item: 'Main Checklist',
        children: [
            {
                id: 2,
                item: 'Procedures that Apply to all Projects and tests',
                children: [
                    {
                        id: 3,
                        item: 'List of devices to be used on tests',
                        children: [
                            {
                                id: 5,
                                item: '[0.1.3B]',
                                children: []
                            },
                            {
                                id: 6,
                                item: '[0.1.3C]',
                                children: []
                            },
                            {
                                id: 7,
                                item: '[0.1.3A]',
                                children: []
                            }
                        ]
                    },
                    {
                        id: 4,
                        item: 'Testing documentation',
                        children: [
                            {
                                id: 8,
                                item: '[0.1.1B]',
                                children: []
                            },
                            {
                                id: 9,
                                item: '[0.1.4]',
                                children: []
                            },
                            {
                                id: 10,
                                item: '[0.1.1A]',
                                children: []
                            },
                            {
                                id: 10,
                                item: '[0.1.5]',
                                children: []
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents a to-do item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable()
export class ChecklistDatabase {
    dataChange = new BehaviorSubject<TodoItemNode[]>([]);

    get data(): TodoItemNode[] { return this.dataChange.value; }

    constructor() {
        this.initialize();
    }

    initialize() {
        // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
        //     file node as children.
        const data = this.buildFileTree(TREE_DATA, 0);

        // Notify the change.
        this.dataChange.next(data);
    }

    /**
     * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
     * The return value is the list of `TodoItemNode`.
     */
    buildFileTree(obj: any[], level: number): TodoItemNode[] {
        return obj.reduce<TodoItemNode[]>((accumulator, entity) => {
            console.log('reduce', accumulator, entity);
            const node = new TodoItemNode();
            node.id = entity.id;
            node.item = entity.item;
            node.children = entity.children;
            if (!!node.children.length) {
                node.children = this.buildFileTree(node.children, level + 1);
            }
            return accumulator.concat(node);
        }, []);
    }

    /** Add an item to to-do list */
    insertItem(parent: TodoItemNode, name: string) {
        if (parent.children) {
            const node = new TodoItemNode();
            node.item = name;
            node.id = null;
            node.children = [];
            parent.children.push(node);
            this.dataChange.next(this.data);
        }
    }

    updateItem(node: TodoItemNode, name: string) {
        node.item = name;
        this.dataChange.next(this.data);
    }
}

/**
 * @title Tree with checkboxes
 */
@Component({
    selector: 'angular-tree',
    templateUrl: 'angular-tree.html',
    styleUrls: ['angular-tree.css'],
    providers: [ChecklistDatabase]
})
export class AngularTree {
    /** Map from flat node to nested node. This helps us finding the nested node to be modified */
    flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();

    /** Map from nested node to flattened node. This helps us to keep the same object for selection */
    nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

    /** A selected parent node to be inserted */
    selectedParent: TodoItemFlatNode | null = null;

    /** The new item's name */
    newItemName = '';

    treeControl: FlatTreeControl<TodoItemFlatNode>;

    treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

    dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

    /** The selection for checklist */
    checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

    constructor(private database: ChecklistDatabase) {
        this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
            this.isExpandable, this.getChildren);
        this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
        this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

        database.dataChange.subscribe(data => {
            this.dataSource.data = data;
        });
    }

    getLevel = (node: TodoItemFlatNode) => node.level;

    isExpandable = (node: TodoItemFlatNode) => node.expandable;

    getChildren = (node: TodoItemNode): TodoItemNode[] => node.children;

    hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

    hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

    /**
     * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
     */
    transformer = (node: TodoItemNode, level: number) => {
        const existingNode = this.nestedNodeMap.get(node);
        const flatNode = existingNode && existingNode.item === node.item
            ? existingNode
            : new TodoItemFlatNode();
        flatNode.item = node.item;
        flatNode.level = level;
        flatNode.expandable = !!node.children.length;
        this.flatNodeMap.set(flatNode, node);
        this.nestedNodeMap.set(node, flatNode);
        return flatNode;
    }

    /** Whether all the descendants of the node are selected. */
    descendantsAllSelected(node: TodoItemFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);
        const descAllSelected = descendants.every(child =>
            this.checklistSelection.isSelected(child)
        );
        return descAllSelected;
    }

    /** Whether part of the descendants are selected */
    descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);
        const result = descendants.some(child => this.checklistSelection.isSelected(child));
        return result && !this.descendantsAllSelected(node);
    }

    /** Toggle the to-do item selection. Select/deselect all the descendants node */
    todoItemSelectionToggle(node: TodoItemFlatNode): void {
        this.checklistSelection.toggle(node);
        const descendants = this.treeControl.getDescendants(node);
        this.checklistSelection.isSelected(node)
            ? this.checklistSelection.select(...descendants)
            : this.checklistSelection.deselect(...descendants);

        // Force update for the parent
        descendants.every(child =>
            this.checklistSelection.isSelected(child)
        );
        this.checkAllParentsSelection(node);
    }

    /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
    todoLeafItemSelectionToggle(node: TodoItemFlatNode): void {
        this.checklistSelection.toggle(node);
        this.checkAllParentsSelection(node);
    }

    /* Checks all the parents when a leaf node is selected/unselected */
    checkAllParentsSelection(node: TodoItemFlatNode): void {
        let parent: TodoItemFlatNode | null = this.getParentNode(node);
        while (parent) {
            this.checkRootNodeSelection(parent);
            parent = this.getParentNode(parent);
        }
    }

    /** Check root node checked state and change it accordingly */
    checkRootNodeSelection(node: TodoItemFlatNode): void {
        const nodeSelected = this.checklistSelection.isSelected(node);
        const descendants = this.treeControl.getDescendants(node);
        const descAllSelected = descendants.every(child =>
            this.checklistSelection.isSelected(child)
        );
        if (nodeSelected && !descAllSelected) {
            this.checklistSelection.deselect(node);
        } else if (!nodeSelected && descAllSelected) {
            this.checklistSelection.select(node);
        }
    }

    /* Get the parent node of a node */
    getParentNode(node: TodoItemFlatNode): TodoItemFlatNode | null {
        const currentLevel = this.getLevel(node);

        if (currentLevel < 1) {
            return null;
        }

        const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

        for (let i = startIndex; i >= 0; i--) {
            const currentNode = this.treeControl.dataNodes[i];

            if (this.getLevel(currentNode) < currentLevel) {
                return currentNode;
            }
        }
        return null;
    }

    /** Select the category so we can insert the new item. */
    addNewItem(node: TodoItemFlatNode) {
        console.log('addNewItem', this.flatNodeMap);
        const parentNode = this.flatNodeMap.get(node);
        this.database.insertItem(parentNode!, '');
        this.treeControl.expand(node);
    }

    /** Save the node to database */
    saveNode(node: TodoItemFlatNode, itemValue: string) {
        const nestedNode = this.flatNodeMap.get(node);
        this.database.updateItem(nestedNode!, itemValue);
    }
}


/**  Copyright 2018 Google Inc. All Rights Reserved.
 Use of this source code is governed by an MIT-style license that
 can be found in the LICENSE file at http://angular.io/license */