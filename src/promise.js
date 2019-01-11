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

    const resolve = data => {
      if (data instanceof OwnPromise) {
        data.then(res => {
          this.value = res;
        });
      }

      if (this.state !== PENDING) {
        return;
      }

      this.state = RESOLVED;
      this.value = data;
      this.callbacks.forEach(({ res }) => {
        this.value = res(this.value);

        // Добавить проверку isResolve/isReject
        // Возможно, перенести в const reject // this.callbacks.forEach(({ res }) / this.callbacks.forEach(({ rej }
      }); // В forEach создаем 2 переменные через деструктуризацию для объекта в массиве
    }; // Контекстом будет этот промис, поэтому не function()

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

    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  then(res, rej) {
    return new OwnPromise((resolve, reject) => {
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
          throw new TypeError('callback have to be a function');
        }
      };

      if (this.state === RESOLVED) {
        setTimeout(_onFulfilled, 0, this.value);
      } else if (this.state === REJECTED) {
        setTimeout(_onRejected, 0, this.value);
      } else {
        this.callbacks.push({ 
          res: _onFulfilled,
          rej: _onRejected
        });
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

    return new OwnPromise(resolve => resolve(data));
  }

  static reject(error) {
    if (typeof this !== 'function') {
      throw new TypeError('this is not a constructor');
    }

    return new OwnPromise((resolve, reject) => reject(error));
  }

  static all(iterable) {
    if (typeof this !== 'function') {
      throw new TypeError('this is not a constructor');
    }

    return new OwnPromise((resolve, reject) => {
      const isIterable = object => object !== null && typeof object[Symbol.iterator] === 'function';

      if (!isIterable(iterable)) {
        console.log('NON-ITERABLE');
        throw new TypeError('Non-iterable value');
      }

      const isEmptyIterable = iterable => {
        for (let key of iterable) {
          return true;
        }
        return false;
      };

      if (!(isEmptyIterable(iterable))) {
        console.log('EMPTY');
        return resolve([]);
      }

      const result = [];

      for (let i = 0; i < iterable.length; i++) {
        if (iterable[i].state === RESOLVED) {
          result.push(iterable[i].value);
        } else if (iterable[i].state === REJECTED) {
          console.log(iterable[i].value);
        } else {
          resolve(iterable[i]);
        }
      }

      console.log(result);
    });
  }

  catch(rej) {
    return this.then(undefined, rej);
  }
}

// module.exports = OwnPromise;

const p1 = new OwnPromise(function(resolve, reject) {
  resolve(1);
});

const p2 = new OwnPromise(function(resolve, reject) {
  resolve(2);
});

const p3 = new OwnPromise(function(resolve, reject) {
  resolve(3);
});

const p4 = new OwnPromise(function(resolve, reject) {
  resolve(4);
});

// p1
// .then(data => {console.log('1', data); return 5;})
// .then(data => {console.log('3', data);});

// p1
// .then(data => {console.log('2', data);});

OwnPromise.all([p1, p2, p3, p4]);

// const p = new OwnPromise(function(resolve, reject) {
//   setTimeout(() => {
//     resolve(3);
//   }, 1000);
// });

// p
// .then(data => {console.log(data); return 5;})
// .then(data => {console.log(data);})