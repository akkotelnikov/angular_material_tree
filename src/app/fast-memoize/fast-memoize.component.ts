import { Component, Input, OnInit } from '@angular/core';
import { memoized, memoizedRemoveFromCache } from './memoize';

@Component({
    selector: 'fast-memoize',
    templateUrl: 'fast-memoize.component.html',
    styleUrls: ['fast-memoize.component.css']
})
export class FastMemoizeComponent implements OnInit {

    constructor() { }

    ngOnInit() {
        console.log('ngOninit');

        const callback = function (one, two, three) {
            console.log('callback', one, two, three);
            return [one, two, three];
        }

        // console.log('memoizedFn', memoizedFn(callback, 'foo', 3, 'bar'));
        console.log('memoized', memoized(callback, 'foo', 3, 'bar'));
        console.log('memoized', memoized(callback, 'foo', 3, 'bar')); // Cache hit
        // memoizedRemoveFromCache([callback, 'foo', 3, 'bar']);
        // console.log('memoized', memoized(callback, 'foo', 3, 'bar'));
    }
}