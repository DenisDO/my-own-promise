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
    if (this.state === RESOLVED) {
      res(this.value);
    }
    this.callbacks.push({ res, rej });
    return this;
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

  catch(rej) {
    return this.then(undefined, rej);
  }
}

module.exports = OwnPromise;

const p = new OwnPromise(function(resolve, reject) {
  setTimeout(() => {
    resolve(3);
  }, 1000);
});

p
.then(data => {console.log(data); return 5;})
.then(data => {console.log(data);})