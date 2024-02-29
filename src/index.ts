import {
  readFileSync,
  writeFileSync,
  existsSync,
} from "fs";
import YAML from 'yaml'

export class YAMLDatabase<T>{
  path: string;
  constructor(path: string) {
    this.path = path;
  }
  read(): T {
    return YAML.parse(readFileSync(this.path).toString());
  }
  write(data: T): T {
    writeFileSync(this.path, YAML.stringify(data, null, 4));
    return this.read();
  }
}

export class YAMLArray<T> extends YAMLDatabase<Array<T>> {
  constructor(path: string, readOnly = false) {
    super(path);
    if (readOnly) {
      this.write = () => {
        throw new Error(`This YAMLArray of ${this.path} is readonly.`);
      };
      if (!existsSync(path)) {
        throw new Error(
          `This YAMLArray of ${this.path} is readonly yet is not found`
        );
      }
    }
    if (!existsSync(path)) {
      writeFileSync(path, "[]");
    }
    return this;
  }
  at(index: number) {
    return this.read()[index];
  }
  concat(other: Array<T>) {
    return this.write(this.read().concat(other));
  }
  entries() {
    return this.read().entries();
  }
  every(condition: (value: T, index: number, array: Array<T>) => boolean) {
    return this.read().every(condition);
  }
  filter(condition: (value: T, index: number, array: Array<T>) => boolean) {
    return this.read().filter(condition);
  }
  find(condition: (value: T, index: number, array: Array<T>) => boolean) {
    return this.read().find(condition);
  }
  findIndex(condition: (value: T, index: number, array: Array<T>) => boolean) {
    return this.read().findIndex(condition);
  }
  flat() {
    return this.read().flat();
  }
  forEach(callbackfn: (value: T, index: number, array: Array<T>) => void) {
    return this.read().forEach(callbackfn);
  }
  includes(element: T) {
    return this.read().includes(element);
  }
  indexOf(element: T) {
    return this.read().indexOf(element);
  }
  join(seperator?: string) {
    return this.read().join(seperator);
  }
  keys() {
    return this.read().keys;
  }
  lastIndexOf(element: T) {
    return this.read().lastIndexOf(element);
  }
  map(callback: (element: T) => any) {
    return this.read().map(callback);
  }
  pop(write = true) {
    const _ = this.read();
    _.pop();
    if (write) {
      this.write(_);
    }
    return _;
  }
  push(element: T, write = true) {
    const _ = this.read();
    _.push(element);
    if (write) {
      this.write(_);
    }
    return _;
  }
  remove(condition: (element: T) => void, write = true) {
    const _ = this.read();
    _.splice(_.findIndex(condition), 1);
    if (write) {
      this.write(_);
    }
    return _;
  }
  removeAll(condition: (element: T) => void, write = true) {
    const _ = this.read();
    while (_.findIndex(condition) != -1) {
      _.splice(_.findIndex(condition), 1);
    }
    if (write) {
      this.write(_);
    }
    return _;
  }
  reduce(
    callback: (
      previousValue: T,
      currentValue: T,
      currentIndex: number,
      array: Array<T>
    ) => T,
    initialValue: any = null
  ) {
    return this.read().reduce(callback, initialValue);
  }
  reduceRight(
    callback: (
      previousValue: T,
      currentValue: T,
      currentIndex: number,
      array: Array<T>
    ) => T,
    initialValue: any = null
  ) {
    return this.read().reduceRight(callback, initialValue);
  }
  reverse(write = true) {
    const _ = this.read().reverse();
    if (write) {
      this.write(_);
    }
    return _;
  }
  shift(write = true) {
    const _ = this.read();
    _.shift();
    if (write) {
      this.write(_);
    }
    return _;
  }
  slice(start: number = undefined, end: number = undefined, write = true) {
    const _ = this.read().slice(start, end);
    if (write) {
      this.write(_);
    }
    return _;
  }
  some(condition: (value: T, index: number, array: Array<T>) => boolean) {
    return this.read().some(condition);
  }
  sort(compareFn: (a: T, b: T) => number, write = true) {
    const _ = this.read().sort(compareFn);
    if (write) {
      this.write(_);
    }
    return _;
  }
  splice(start: number, deleteCount: number = 0, ...items: Array<T>) {
    return this.read().splice(start, deleteCount, ...items);
  }
  toString() {
    return this.read().toString();
  }
  unshift(items: Array<T>, write = true) {
    const _ = this.read();
    _.unshift(...items);
    if (write) {
      this.write(_);
    }
    return _;
  }
  values() {
    return this.read().values();
  }
}
export class YAMLMap<T> extends YAMLDatabase<{
  [key: string]: T;
}> {
  constructor(path: string, readOnly = false) {
    super(path);
    if (readOnly) {
      this.write = () => {
        throw new Error(`This JSONMap of ${this.path} is readonly.`);
      };
      if (!existsSync(path)) {
        throw new Error(
          `This JSONMap of ${this.path} is readonly yet is not found`
        );
      }
    }
    if (!existsSync(path)) {
      writeFileSync(path, "{}");
    }
    return this;
  }
  set(
    key: string,
    value: T
  ): {
    [key: string]: T;
  } {
    const _ = this.read();
    _[key] = value;
    return this.write(_);
  }
  unset(key: string): {
    [key: string]: T;
  } {
    const _ = this.read();
    delete _[key];
    return this.write(_);
  }
  get(key: string): T {
    return this.read()[key];
  }
  getKey(value: T): keyof T {
    return Object.keys(this.read()).find(
      (key) => this.read()[key] === value
    ) as keyof T;
  }
  keys(): string[] {
    return Object.keys(this.read());
  }
  values(): T[] {
    return Object.values(this.read());
  }
  entries(): [string, T][] {
    return Object.entries(this.read());
  }
}

export class YAMLIntegerMap extends YAMLMap<number> {
  increment(key: string, amount: number): number {
    if (!(key in this.read())) {
      this.set(key, 0);
    }
    if (isNaN(this.read()[key])) {
      throw new Error("Not a number");
    }
    this.set(key, this.get(key) + amount);
    return this.get(key);
  }
}

export class YAMLObjectMap<
  T extends {
    [attribute: string]: any;
  }
> extends YAMLMap<T> {
  setAttribute(key: string, attibute: keyof T, value: any) {
    const _ = this.read();
    _[key][attibute] = value;
    return this.write(_);
  }
}