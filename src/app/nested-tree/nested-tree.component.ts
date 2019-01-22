import { Component, Input, OnInit } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { Map, List } from 'immutable';
import { BehaviorSubject } from 'rxjs';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Category, CategoryNode } from './category.model';


@Component({
    selector: 'nested-tree',
    templateUrl: 'nested-tree.component.html',
    styleUrls: ['nested-tree.component.css']
})
export class NestedTreeComponent implements OnInit {
    public nestedTreeControl: NestedTreeControl<CategoryNode>;
    public nestedDataSource: MatTreeNestedDataSource<CategoryNode>;
    @Input() immutableData: Category;

    dataChange = new BehaviorSubject<CategoryNode[]>([]);

    get data(): CategoryNode[] { return this.dataChange.value; }

    constructor() {
        this.nestedTreeControl = new NestedTreeControl<CategoryNode>(this.getChildren);
        this.nestedDataSource = new MatTreeNestedDataSource();

        this.dataChange.subscribe(data => {
            this.nestedDataSource.data = [];
            this.nestedDataSource.data = data;
        });
    }

    ngOnInit() {
        const data = (this.immutableData.toJS()) as CategoryNode;
        this.dataChange.next([data]);
    }

    hasNoContent = (_: number, nodeData: CategoryNode) => nodeData.name === '';

    hasNestedChild = (_: number, nodeData: CategoryNode) => !!nodeData.children.length;

    private getChildren = (node: CategoryNode) => node.children;

    public addNewNode(node: CategoryNode) {
        this.insertNode(node, '');
        let path = [];
        this.createNodePath(node, this.immutableData, path);
        let children = this.immutableData.getIn([...path, 'children']);
        children = children.push(Map({
            id: null,
            name: '',
            children: List()
        }));
        this.immutableData = this.immutableData.setIn([...path, 'children'], children);
        this.nestedTreeControl.expand(node);
    }

    private insertNode(parent: CategoryNode, name: string) {
        if (parent.children) {
            const node = {id: null, name: name, children:[]} as CategoryNode;
            parent.children.push(node);
            this.dataChange.next(this.data);
        }
    }

    public saveNode(node: CategoryNode, nodeValue: string) {
        let path = [];
        this.createNodePath(node, this.immutableData, path);
        let children = this.immutableData.getIn([...path]);
        children = children.set('name', nodeValue);
        this.immutableData = this.immutableData.setIn([...path], children);
        node.name = nodeValue;
        this.dataChange.next(this.data);
    }

    private createNodePath(node: CategoryNode, parent: Category, path: (number | string)[]): boolean {
        if (Map.isMap(parent)) {
            if (parent.get('name') === node.name) {
                return true;
            }
            const found = parent.get('children').some((child, childKey) => {
                if (child.get('name') === node.name) {
                    path.unshift('children', childKey);
                    return true;
                }

                if (this.createNodePath(node, child, path)) {
                    path.unshift('children', childKey);
                    return true;
                }
                return false;
            });
            return found;
        }
        return false;
    }
}