import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import {Component, Injectable, ElementRef, ViewChild, Input, OnInit} from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';

/**
 * Node for to-do item
 */
export class TodoItemNode {
  id: number;
  item: string;
  children: TodoItemNode[];
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
  id: number;
  item: string;
  level: number;
  expandable: boolean;
}

/**
 * The Json object for to-do list data.
 */
// const TREE_DATA = {
//   Groceries: {
//     'Almond Meal flour': null,
//     'Organic eggs': null,
//     'Protein Powder': null,
//     Fruits: {
//       Apple: null,
//       Berries: ['Blueberry', 'Raspberry'],
//       Orange: null
//     }
//   },
//   Reminders: [
//     'Cook dinner',
//     'Read the Material Design spec',
//     'Upgrade Application to Angular'
//   ]
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
    },
    {
        id: 11,
        item: 'Webtools Test ',
        children: [
            {
                id: 12,
                item: 'first category',
                children: [
                    {
                        id: 13,
                        item: '3333',
                        children: [
                            {
                                id: 14,
                                item: '[1111]',
                                children: []
                            },
                            {
                                id: 15,
                                item: '[1112]',
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
export class ChecklistDatabaseDraggable {
  dragNode: any;

  dataChange = new BehaviorSubject<TodoItemNode[]>([]);

  flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

  get data(): TodoItemNode[] { return this.dataChange.value; }

  constructor() {
    const time = new Date();
    console.log('ChecklistDatabaseDraggable', time.getTime());
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
  insertItem(parent: TodoItemNode, name: string): TodoItemNode {
    if (!parent.children) {
      parent.children = [];
    }
    const newItem = { item: name } as TodoItemNode;
    parent.children.push(newItem);
    this.dataChange.next(this.data);
    return newItem;
  }

  insertItemAbove(node: TodoItemNode, name: string): TodoItemNode {
    const parentNode = this.getParentFromNodes(node);
    const newItem = { item: name } as TodoItemNode;
    if (parentNode != null) {
      parentNode.children.splice(parentNode.children.indexOf(node), 0, newItem);
    } else {
      this.data.splice(this.data.indexOf(node), 0, newItem);
    }
    this.dataChange.next(this.data);
    return newItem;
  }

  insertItemBelow(node: TodoItemNode, name: string): TodoItemNode {
    const parentNode = this.getParentFromNodes(node);
    const newItem = { item: name } as TodoItemNode;
    if (parentNode != null) {
      parentNode.children.splice(parentNode.children.indexOf(node) + 1, 0, newItem);
    } else {
      this.data.splice(this.data.indexOf(node) + 1, 0, newItem);
    }
    this.dataChange.next(this.data);
    return newItem;
  }

  getParentFromNodes(node: TodoItemNode): TodoItemNode {
    for (let i = 0; i < this.data.length; ++i) {
      const currentRoot = this.data[i];
      const parent = this.getParent(currentRoot, node);
      if (parent != null) {
        return parent;
      }
    }
    return null;
  }

  getParent(currentRoot: TodoItemNode, node: TodoItemNode): TodoItemNode {
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

  updateItem(node: TodoItemNode, name: string) {
    node.item = name;
    this.dataChange.next(this.data);
  }

  deleteItem(node: TodoItemNode) {
    this.deleteNode(this.data, node);
    this.dataChange.next(this.data);
  }

  copyPasteItem(from: TodoItemNode, to: TodoItemNode): TodoItemNode {
    console.log('copyPasteItem', from, to);
    const newItem = this.insertItem(to, from.item);
    if (from.children) {
      from.children.forEach(child => {
        this.copyPasteItem(child, newItem);
      });
    }
    return newItem;
  }

  copyPasteItemAbove(from: TodoItemNode, to: TodoItemNode): TodoItemNode {
    const newItem = this.insertItemAbove(to, from.item);
    if (from.children) {
      from.children.forEach(child => {
        this.copyPasteItem(child, newItem);
      });
    }
    return newItem;
  }

  copyPasteItemBelow(from: TodoItemNode, to: TodoItemNode): TodoItemNode {
    const newItem = this.insertItemBelow(to, from.item);
    if (from.children) {
      from.children.forEach(child => {
        this.copyPasteItem(child, newItem);
      });
    }
    return newItem;
  }

  deleteNode(nodes: TodoItemNode[], nodeToDelete: TodoItemNode) {
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

  /** A selected parent node to be inserted */
  selectedParent: TodoItemFlatNode | null = null;

  /** The new item's name */
  newItemName = '';

  treeControl: FlatTreeControl<TodoItemFlatNode>;

  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

  dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

  /* Drag and drop */
  dragNodeExpandOverWaitTimeMs = 300;
  dragNodeExpandOverNode: any;
  dragNodeExpandOverTime: number;
  dragNodeExpandOverArea: string;
  @ViewChild('emptyItem') emptyItem: ElementRef;
  @Input() key: number | string;

  constructor(private database: ChecklistDatabaseDraggable) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

    public ngOnInit() {
        this.database.dataChange.subscribe(data => {
            console.log('data1', data, this.key, this);
            this.dataSource.data = [];
            this.dataSource.data = [data[this.key]];
        });
    }

  getLevel = (node: TodoItemFlatNode) => node.level;

  isExpandable = (node: TodoItemFlatNode) => node.expandable;

  getChildren = (node: TodoItemNode): TodoItemNode[] => node.children;

  hasChild = (_: number, _nodeData: TodoItemFlatNode) => {
      console.log('hasChild', _nodeData);
      return _nodeData.expandable;
  };

  hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: TodoItemNode, level: number) => {
    const existingNode = this.database.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item
    ? existingNode
    : new TodoItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = (node.children && node.children.length > 0);
    console.log('transformer node', node, flatNode);
    this.database.flatNodeMap.set(flatNode, node);
    this.database.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  /** Whether all the descendants of the node are selected */
  descendantsAllSelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    return descendants.every(child => this.checklistSelection.isSelected(child));
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
  }

  /** Select the category so we can insert the new item. */
  addNewItem(node: TodoItemFlatNode) {
    const parentNode = this.database.flatNodeMap.get(node);
    this.database.insertItem(parentNode, '');
    this.treeControl.expand(node);
  }

  /** Save the node to database */
  saveNode(node: TodoItemFlatNode, itemValue: string) {
    const nestedNode = this.database.flatNodeMap.get(node);
    this.database.updateItem(nestedNode, itemValue);
  }

  handleDragStart(event, node) {
    // Required by Firefox (https://stackoverflow.com/questions/19055264/why-doesnt-html5-drag-and-drop-work-in-firefox)
    event.dataTransfer.setData('foo', 'bar');
    event.dataTransfer.setDragImage(this.emptyItem.nativeElement, 0, 0);
    this.database.dragNode = node;
    this.treeControl.collapse(node);
  }

  handleDragOver(event, node) {
    event.preventDefault();

    // Handle node expand
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
    console.log('handleDrop', node, this.database.dragNode);
    console.log('!', this.database.dragNode, this.database.flatNodeMap);
    event.preventDefault();
    if (!!node && node !== this.database.dragNode) {
        let newItem: TodoItemNode;
        if (this.dragNodeExpandOverArea === 'above') {
          newItem = this.database.copyPasteItemAbove(this.database.flatNodeMap.get(this.database.dragNode), this.database.flatNodeMap.get(node));
        } else if (this.dragNodeExpandOverArea === 'below') {
          newItem = this.database.copyPasteItemBelow(this.database.flatNodeMap.get(this.database.dragNode), this.database.flatNodeMap.get(node));
        } else {
          newItem = this.database.copyPasteItem(this.database.flatNodeMap.get(this.database.dragNode), this.database.flatNodeMap.get(node));
        }
        this.database.deleteItem(this.database.flatNodeMap.get(this.database.dragNode));
        this.treeControl.expandDescendants(this.database.nestedNodeMap.get(newItem));
        console.log('newItem', this.database.nestedNodeMap.get(newItem), this.database.nestedNodeMap.get(newItem));
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
