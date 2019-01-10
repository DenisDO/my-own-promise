const RESOLVED = 'RESOLVED';
const REJECTED = 'REJECTED';
const PENDING = 'PENDING';

let cb = null;

class OwnPromise {
  constructor(executor) {
    this.state = PENDING;
    this.callbacks = [];

    const resolve = data => {
      if (this.state !== PENDING) {
        return;
      }

      this.state = RESOLVED;
      this.value = data;
      this.callbacks.forEach(({ res, rej }) => {
        this.value = res(this.value);
      });
    }; // Контекстом будет этот промис, поэтому не function()

    const reject = error => {

    };

    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }
}

module.exports = OwnPromise;
