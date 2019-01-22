import {NestedTreeControl} from '@angular/cdk/tree';
import {Component, Injectable} from '@angular/core';
import {MatTreeNestedDataSource} from '@angular/material/tree';
import {BehaviorSubject} from 'rxjs';
import { Map, List, fromJS } from 'immutable';
/**
 * The Json tree data in string. The data could be parsed into Json object
 */
const TREE_DATA = fromJS({
    id: 1,
    name: 'Main Checklist',
    children: [
        {
            id: 2,
            name: 'Procedures that Apply to all Projects and tests',
            children: [
                {
                    id: 3,
                    name: 'List of devices to be used on tests',
                    children: [
                        {
                            id: 5,
                            name: '[0.1.3B]',
                            children: []
                        },
                        {
                            id: 6,
                            name: '[0.1.3C]',
                            children: []
                        },
                        {
                            id: 7,
                            name: '[0.1.3A]',
                            children: []
                        }
                    ]
                },
                {
                    id: 4,
                    name: 'Testing documentation',
                    children: [
                        {
                            id: 8,
                            name: '[0.1.1B]',
                            children: []
                        },
                        {
                            id: 9,
                            name: '[0.1.4]',
                            children: []
                        },
                        {
                            id: 10,
                            name: '[0.1.1A]',
                            children: []
                        },
                        {
                            id: 10,
                            name: '[0.1.5]',
                            children: []
                        }
                    ]
                }
            ]
        }
    ]
});

export interface Category extends Map<string, any> {
    get(key: 'id'):  number | string | null;
    get(key: 'name'): string;
    get(key: 'children'): List<Category>;
}

// /** Flat to-do name node with expandable and level information */
export class CategoryNode {
    id: number | string | null;
    name: string;
    children: CategoryNode[];
}

/**
 * File database, it can build a tree structured Json object from string.
 * Each node in Json object represents a file or a directory. For a file, it has filename and type.
 * For a directory, it has filename and children (a list of files or directories).
 * The input will be a json object string, and the output is a list of `CategoryNode` with nested
 * structure.
 */
@Injectable()
export class FileDatabase {
    dataChange = new BehaviorSubject<CategoryNode[]>([]);

    get data(): CategoryNode[] { return this.dataChange.value; }

    constructor() {
        this.initialize();
    }

    initialize() {
        const data = TREE_DATA.toJS();
        console.log('initialize', data);
        this.dataChange.next([data]);
    }

    /** Add an item to to-do list */
    insertItem(parent: CategoryNode, name: string) {
        if (parent.children) {
            const node = new CategoryNode();
            node.id = null;
            node.name = name;
            node.children = [];
            parent.children.push(node);
            this.dataChange.next(this.data);
            console.log('insertItem', parent);
        }
    }

    updateItem(node: CategoryNode, name: string) {
        node.id = null;
        node.name = name;
        this.dataChange.next(this.data);
    }
}

/**
 * @title Tree with nested nodes
 */
@Component({
    selector: 'tree-nested-overview-example',
    templateUrl: 'tree-nested-overview-example.html',
    styleUrls: ['tree-nested-overview-example.css'],
    providers: [FileDatabase]
})
export class TreeNestedOverviewExample {
    nestedTreeControl: NestedTreeControl<CategoryNode>;
    nestedDataSource: MatTreeNestedDataSource<CategoryNode>;
    immutableTreeData: Category;

    constructor(public database: FileDatabase) {
        this.nestedTreeControl = new NestedTreeControl<CategoryNode>(this._getChildren);
        this.nestedDataSource = new MatTreeNestedDataSource();

        database.dataChange.subscribe(data => {
            this.nestedDataSource.data = [];
            this.nestedDataSource.data = data;
            console.log('this.nestedDataSource.data11', this.nestedDataSource.data);
        });

        this.immutableTreeData = TREE_DATA;
    }

    hasNoContent = (_: number, nodeData: CategoryNode) => nodeData.name === '';

    hasNestedChild = (_: number, nodeData: CategoryNode) => !!nodeData.children.length;

    private _getChildren = (node: CategoryNode) => node.children;

    public addNewItem(node: CategoryNode) {
        /** Add an item to to-do list */
        this.database.insertItem(node, '');
        let path = [];
        this.buildRequirementPath(node, this.immutableTreeData, path);

        let children = this.immutableTreeData.getIn([...path, 'children']);

        children = children.push(Map({
            id: null,
            name: '',
            children: List()
        }));
        this.immutableTreeData = this.immutableTreeData.setIn([...path, 'children'], children);
        console.log('addNewItem', this.immutableTreeData, path);
        this.nestedTreeControl.expand(node);
    }

    /** Save the node to database */
    saveNode(node: CategoryNode, itemValue: string) {
        let path = [];
        this.buildRequirementPath(node, this.immutableTreeData, path);

        let children = this.immutableTreeData.getIn([...path]);
        children = children.set('name', itemValue);
        this.immutableTreeData = this.immutableTreeData.setIn([...path], children);
        this.database.updateItem(node, itemValue);
        console.log('saveNode', this.immutableTreeData, path);
    }

    buildRequirementPath(node: CategoryNode, parent: Category, path: (number | string)[]): boolean {
        console.log('buildRequirementPath parent', parent);
        if (Map.isMap(parent)) {

            if (parent.get('name') === node.name) {
                return true;
            }

            const found = parent.get('children').some((child, childKey) => {
                if (child.get('name') === node.name) {
                    path.unshift('children', childKey);
                    console.log('B1');
                    return true;
                }

                if (this.buildRequirementPath(node, child, path)) {
                    console.log('B2');
                    path.unshift('children', childKey);
                    return true;
                }
                console.log('B3', child, node);
                return false;
            });
            return found;
        }
        return false;
    }
}


/**  Copyright 2018 Google Inc. All Rights Reserved.
 Use of this source code is governed by an MIT-style license that
 can be found in the LICENSE file at http://angular.io/license */