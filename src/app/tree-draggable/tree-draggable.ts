import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import {Component, Injectable, ElementRef, ViewChild, Input, OnInit} from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import { CategoryNode, CategoryNodeFlat } from './category.model';

const TREE_DATA = [
    {
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
    },
    {
        id: 11,
        name: 'Webtools Test ',
        children: [
            {
                id: 12,
                name: 'first category',
                children: [
                    {
                        id: 13,
                        name: '3333',
                        children: [
                            {
                                id: 14,
                                name: '[1111]',
                                children: []
                            },
                            {
                                id: 15,
                                name: '[1112]',
                                children: []
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

@Injectable()
export class ChecklistDatabaseDraggable {
  dragNode: any;

  dataChange = new BehaviorSubject<CategoryNode[]>([]);

  flatNodeMap = new Map<CategoryNodeFlat, CategoryNode>();

  nestedNodeMap = new Map<CategoryNode, CategoryNodeFlat>();

  get data(): CategoryNode[] { return this.dataChange.value; }

  constructor() {
    this.initialize();
  }

  initialize() {
    const data = this.buildFileTree(TREE_DATA, 0);
    this.dataChange.next(data);
  }

  buildFileTree(obj: any[], level: number): CategoryNode[] {
      return obj.reduce<CategoryNode[]>((accumulator, entity) => {
          const node = new CategoryNode({
              id: entity.id,
              name: entity.name,
              children: (!!entity.children.length) ? this.buildFileTree(entity.children, level + 1) : []
          });
          return accumulator.concat(node);
      }, []);
  }

  insertItem(parent: CategoryNode, name: string): CategoryNode {
    if (!parent.children) {
      parent = parent.set('children', []);
    }
    const newItem = new CategoryNode({id: null, name: name, children: []});
    parent.children.push(newItem);
    this.dataChange.next(this.data);
    return newItem;
  }

  insertItemAbove(node: CategoryNode, name: string): CategoryNode {
    const parentNode = this.getParentFromNodes(node);
    const newItem = new CategoryNode({id: null, name: name, children: []});
    if (parentNode != null) {
      parentNode.children.splice(parentNode.children.indexOf(node), 0, newItem);
    } else {
      this.data.splice(this.data.indexOf(node), 0, newItem);
    }
    this.dataChange.next(this.data);
    return newItem;
  }

  insertItemBelow(node: CategoryNode, name: string): CategoryNode {
    const parentNode = this.getParentFromNodes(node);
    const newItem = new CategoryNode({id: null, name: name, children: []});
    if (parentNode != null) {
      parentNode.children.splice(parentNode.children.indexOf(node) + 1, 0, newItem);
    } else {
      this.data.splice(this.data.indexOf(node) + 1, 0, newItem);
    }
    this.dataChange.next(this.data);
    return newItem;
  }

  getParentFromNodes(node: CategoryNode): CategoryNode {
    for (let i = 0; i < this.data.length; ++i) {
      const currentRoot = this.data[i];
      const parent = this.getParent(currentRoot, node);
      if (parent != null) {
        return parent;
      }
    }
    return null;
  }

  getParent(currentRoot: CategoryNode, node: CategoryNode): CategoryNode {
    if (currentRoot.children && currentRoot.children.length > 0) {
      for (let i = 0; i < currentRoot.children.length; ++i) {
        const child = currentRoot.children[i];
        if (child === node) {
          return currentRoot;
        } else if (child.children && child.children.length > 0) {
          const parent = this.getParent(child, node);
          if (parent != null) {
            return parent;
          }
        }
      }
    }
    return null;
  }

  updateItem(node: CategoryNode, name: string) {
    node = node.set('name', name);
    this.dataChange.next(this.data);
  }

  deleteItem(node: CategoryNode) {
    this.deleteNode(this.data, node);
    this.dataChange.next(this.data);
  }

  copyPasteItem(from: CategoryNode, to: CategoryNode): CategoryNode {
    const newItem = this.insertItem(to, from.name);
    if (from.children) {
      from.children.forEach(child => {
        this.copyPasteItem(child, newItem);
      });
    }
    return newItem;
  }

  copyPasteItemAbove(from: CategoryNode, to: CategoryNode): CategoryNode {
    const newItem = this.insertItemAbove(to, from.name);
    if (from.children) {
      from.children.forEach(child => {
        this.copyPasteItem(child, newItem);
      });
    }
    return newItem;
  }

  copyPasteItemBelow(from: CategoryNode, to: CategoryNode): CategoryNode {
    const newItem = this.insertItemBelow(to, from.name);
    if (from.children) {
      from.children.forEach(child => {
        this.copyPasteItem(child, newItem);
      });
    }
    return newItem;
  }

  deleteNode(nodes: CategoryNode[], nodeToDelete: CategoryNode) {
    const index = nodes.indexOf(nodeToDelete, 0);
    if (index > -1) {
      nodes.splice(index, 1);
    } else {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          this.deleteNode(node.children, nodeToDelete);
        }
      });
    }
  }
}

@Component({
  selector: 'tree-draggable',
  templateUrl: './tree-draggable.html',
  styleUrls: ['./tree-draggable.css'],
})
export class TreeDraggable implements OnInit {

  selectedParent: CategoryNodeFlat | null = null;

  newItemName = '';

  treeControl: FlatTreeControl<CategoryNodeFlat>;

  treeFlattener: MatTreeFlattener<CategoryNode, CategoryNodeFlat>;

  dataSource: MatTreeFlatDataSource<CategoryNode, CategoryNodeFlat>;

  checklistSelection = new SelectionModel<CategoryNodeFlat>(true /* multiple */);

  /* Drag and drop */
  dragNodeExpandOverWaitTimeMs = 300;
  dragNodeExpandOverNode: any;
  dragNodeExpandOverTime: number;
  dragNodeExpandOverArea: string;
  @ViewChild('emptyItem') emptyItem: ElementRef;
  @Input() key: number | string;
  time: Date;

  constructor(private database: ChecklistDatabaseDraggable) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<CategoryNodeFlat>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.time = new Date();
  }

    public ngOnInit() {
        this.database.dataChange.subscribe(data => {
            this.dataSource.data = [];
            this.dataSource.data = [data[this.key]];
        });
    }

  getLevel = (node: CategoryNodeFlat) => node.level;

  isExpandable = (node: CategoryNodeFlat) => node.expandable;

  getChildren = (node: CategoryNode): CategoryNode[] => node.children;

  hasChild = (_: number, _nodeData: CategoryNodeFlat) => {
      return _nodeData.expandable;
  };

  hasNoContent = (_: number, _nodeData: CategoryNodeFlat) => _nodeData.name === '';

  transformer = (node: CategoryNode, level: number) => {
    const existingNode = this.database.nestedNodeMap.get(node);
    let flatNode = existingNode && existingNode.name === node.name
    ? existingNode
    : new CategoryNodeFlat();
    flatNode = flatNode.set('name', node.name);
    flatNode = flatNode.set('level', level);
    flatNode = flatNode.set('expandable', (node.children && node.children.length > 0));
    this.database.flatNodeMap.set(flatNode, node);
    this.database.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  descendantsAllSelected(node: CategoryNodeFlat): boolean {
    const descendants = this.treeControl.getDescendants(node);
    return descendants.every(child => this.checklistSelection.isSelected(child));
  }

  descendantsPartiallySelected(node: CategoryNodeFlat): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  todoItemSelectionToggle(node: CategoryNodeFlat): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);
  }

  addNewItem(node: CategoryNodeFlat) {
    const parentNode = this.database.flatNodeMap.get(node);
    this.database.insertItem(parentNode, '');
    this.treeControl.expand(node);
  }

  saveNode(node: CategoryNodeFlat, itemValue: string) {
    const nestedNode = this.database.flatNodeMap.get(node);
    this.database.updateItem(nestedNode, itemValue);
  }

  handleDragStart(event, node) {
    event.dataTransfer.setData('foo', 'bar');
    event.dataTransfer.setDragImage(this.emptyItem.nativeElement, 0, 0);
    this.database.dragNode = node;
    this.treeControl.collapse(node);
  }

  handleDragOver(event, node) {
    event.preventDefault();
    if (node === this.dragNodeExpandOverNode) {
      if (this.database.dragNode !== node && !this.treeControl.isExpanded(node)) {
        if ((new Date().getTime() - this.dragNodeExpandOverTime) > this.dragNodeExpandOverWaitTimeMs) {
          this.treeControl.expand(node);
        }
      }
    } else {
      this.dragNodeExpandOverNode = node;
      this.dragNodeExpandOverTime = new Date().getTime();
    }

    // Handle drag area
    const percentageX = event.offsetX / event.target.clientWidth;
    const percentageY = event.offsetY / event.target.clientHeight;
    if (percentageY < 0.25) {
      this.dragNodeExpandOverArea = 'above';
    } else if (percentageY > 0.75) {
      this.dragNodeExpandOverArea = 'below';
    } else {
      this.dragNodeExpandOverArea = 'center';
    }
  }

  handleDrop(event, node) {
    event.preventDefault();
    if (!!node && node !== this.database.dragNode) {
        let newItem: CategoryNode;
        if (this.dragNodeExpandOverArea === 'above') {
          newItem = this.database.copyPasteItemAbove(this.database.flatNodeMap.get(this.database.dragNode), this.database.flatNodeMap.get(node));
        } else if (this.dragNodeExpandOverArea === 'below') {
          newItem = this.database.copyPasteItemBelow(this.database.flatNodeMap.get(this.database.dragNode), this.database.flatNodeMap.get(node));
        } else {
          newItem = this.database.copyPasteItem(this.database.flatNodeMap.get(this.database.dragNode), this.database.flatNodeMap.get(node));
        }
        this.database.deleteItem(this.database.flatNodeMap.get(this.database.dragNode));
        this.treeControl.expandDescendants(this.database.nestedNodeMap.get(newItem));
    }
    this.database.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
  }

  handleDragEnd(event) {
    this.database.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
  }
}
