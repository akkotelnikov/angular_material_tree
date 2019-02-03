import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as memoize  from 'fast-memoize/src/index.js';

@Component({
    selector: 'fast-memoize',
    templateUrl: 'fast-memoize.component.html',
    styleUrls: ['fast-memoize.component.css']
})
export class FastMemoizeComponent implements OnInit {

    constructor() { }

    ngOnInit() {
        console.log('ngOninit');
        const fn = (...args) => {
            console.log('fn', args);
            const callbackFn = args[0];
            const callbackArgs = args.slice(1);
            return callbackFn(...callbackArgs);
        };
        const callback = function (one, two, three) {
            console.log('callback', one, two, three);
            return [one, two, three];
        }

        const memoized = memoize(fn, {
            cache: {
                create() {
                    var store = {};
                    return {
                        has(key) { return (key in store); },
                        get(key) {
                            console.log('get', key);
                            return store[key];
                        },
                        set(key, value) {
                            console.log('set', key, value);
                            store[key] = value;
                        }
                    };
                }
            },
            serializer: args => {
                const serializedArr = Array.from(args).map(x => {
                    if (typeof x === 'function') return x + '';
                    return x;
                });
                console.log('serializedArr', serializedArr);
                return serializedArr;
            }
        })

        console.log('fn', fn(callback, 'foo', 3, 'bar'));
        console.log('memoized', memoized(callback, 'foo', 3, 'bar'));
        console.log('memoized', memoized(callback, 'foo', 3, 'bar')); // Cache hit
    }
}