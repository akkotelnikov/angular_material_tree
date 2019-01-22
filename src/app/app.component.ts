import { Component } from '@angular/core';
import { fromJS } from 'immutable';

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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  treeData = TREE_DATA;
}
