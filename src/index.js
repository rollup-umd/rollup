/**
 * Code your first module here
 */

export default class DemoClass {
  static testStatic = 'This is a static test';

  testAttribute = 'This is a test attribute';

  state = {
    list: ['a', 'b'],
    isSpreadActive: true,
    isTestLiving: true,
  };

  hasInList(value) {
    return this.state.list.includes(value);
  }

  getReplacedEnv() {
    return process.env.NODE_ENV;
  }

  getIsSpreadActive() {
    const { isSpreadActive, ...rest } = this.state; // eslint-disable-line no-unused-vars
    return isSpreadActive;
  }

  getRest() {
    const { isSpreadActive, ...rest } = this.state;
    return rest;
  }

  getTestStatic() {
    return DemoClass.testStatic;
  }

  getTestAttribute() {
    return this.testAttribute;
  }

  setTestAttribute(testAttribute) {
    this.testAttribute = testAttribute;
  }
}
