const RESOLVED = 'RESOLVED';
const REJECTED = 'REJECTED';
const PENDING = 'PENDING';

class OwnPromise {
  constructor(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError('Executor must be a function');
    }
    this.state = PENDING;
    this.callbacks = [];

    const reject = error => {
      if (this.state !== 'PENDING') {
        return;
      }

      this.state = REJECTED;
      this.value = error;

      this.callbacks.forEach(({ rej }) => {
        this.value = rej(this.value);
      });
    };

    const resolve = data => {
      if (this.state !== PENDING) {
        return;
      }

      if (this.isThenable(data) && data.state === PENDING) {
        data.then(v => resolve(v), v => reject(v));
      } else {
        this.state = this.isThenable(data) ? data.state : RESOLVED;
        this.value = this.isThenable(data) ? data.value : data;
      }

      this.callHandlers();
    };

    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  isThenable(data) {
    return data && data.then;
  }

  callHandlers() {
    const run = () => {
      this.callbacks.forEach((callback, i) => {
        const { res, rej } = callback;

        if (this.callbacks.length === i) {
          this.value = this.state === RESOLVED ? res(this.value) : rej(this.value);
        }

        this.state === RESOLVED ? res(this.value) : rej(this.value);
      });
    };

    setTimeout(run, 0);
  }

  then(res, rej) {
    return new this.constructor((resolve, reject) => {
      const _onFulfilled = value => {
        try {
          resolve(typeof res === 'function' ? res(value) : value);
        } catch (err) {
          reject(err);
        }
      };

      const _onRejected = err => {
        if (rej && typeof rej === 'function') {
          try {
            resolve(rej(err));
          } catch (error) {
            reject(error);
          }
        } else {
          reject(err);
        }
      };

      if (this.state === PENDING) {
        this.callbacks.push({ res: _onFulfilled, rej: _onRejected });
      } else if (this.callbacks.length > 0) {
        this.callHandlers();
      } else {
        this.state === RESOLVED
          ? setTimeout(() => _onFulfilled(this.value), 0)
          : setTimeout(() => _onRejected(this.value), 0);
      }
    });
  }

  static resolve(data) {
    if (typeof this !== 'function') {
      throw new TypeError('this is not a constructor');
    }

    if (data instanceof OwnPromise) {
      return data;
    }

    return new this((resolve, reject) => {
      if (typeof resolve !== 'function' || typeof reject !== 'function') {
        throw new TypeError('Not a function');
      }
      resolve(data);
    });
  }

  static reject(error) {
    if (typeof this !== 'function') {
      throw new TypeError('this is not a constructor');
    }

    return new this((resolve, reject) => {
      if (typeof resolve !== 'function' || typeof reject !== 'function') {
        throw new TypeError('Not a function');
      }
      reject(error);
    });
  }

  static all(iterable) {
    if (typeof this !== 'function') {
      throw new TypeError('this is not a constructor');
    }

    return new this((resolve, reject) => {
      if (typeof resolve !== 'function' || typeof reject !== 'function') {
        throw new TypeError('Not a function');
      }

      const isIterable = object => object !== null && typeof object[Symbol.iterator] === 'function';

      if (!isIterable(iterable)) {
        throw new TypeError('ERROR');
      }

      const isEmptyIterable = iterable => {
        for (let key of iterable) {
          return true;
        }
        return false;
      };

      if (!isEmptyIterable(iterable)) {
        return resolve([]);
      }

      const values = new Array(iterable.length);
      let counter = 0;

      const tryResolve = i => value => {
        values[i] = value;
        counter += 1;

        if (counter === iterable.length) {
          resolve(values);
        }
      };

      for (let i = 0; i < iterable.length; i++) {
        const promise = iterable[i] instanceof OwnPromise
          ? iterable[i]
          : new OwnPromise(res => { res(iterable[i]); });

        promise.then(tryResolve(i), reject);
      }
    });
  }

  static race(iterable) {
    if (typeof this !== 'function') {
      throw new TypeError('this is not a constructor');
    }

    return new this((resolve, reject) => {
      const isIterable = object => object !== null && typeof object[Symbol.iterator] === 'function';

      if (!isIterable(iterable)) {
        throw new TypeError('ERROR');
      }

      for (let i = 0; i < iterable.length; i++) {
        iterable[i].then(resolve, reject);
      }
    });
  }

  catch(rej) {
    return this.then(null, rej);
  }
}

module.exports = OwnPromise;

// const p1 = new OwnPromise(function(resolve, reject) {
//   resolve(1);
// });

// const p2 = new OwnPromise(function(resolve, reject) {
//   resolve(2);
// });

// const p3 = new OwnPromise(function(resolve, reject) {
//   resolve(3);
// });

// const p4 = new OwnPromise(function(resolve, reject) {
//   resolve(4);
// });

// p1
// .then(data => {console.log('1', data); return 5;})
// .then(data => {console.log('3', data);});

// p1
// .then(data => {console.log('2', data);});

// const p = OwnPromise.all([p1, p2, p3, p4]);

// const p = new OwnPromise(function(resolve, reject) {
//   setTimeout(() => {
//     resolve(3);
//   }, 1000);
// });

// p
// .then(data => {console.log(data); return 5;})
// .then(data => {console.log(data);})