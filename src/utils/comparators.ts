export const checkArrayEquality = (arr1: Array<any>, arr2: Array<any>, ignoreOrder: boolean = true) => {
  const count1: any = {}
  const count2: any = {}
  arr1.forEach(val => {
    if(val in count1) {
      count1[val] += 1
    } else {
      count1[val] = 1
    }
  })
  arr2.forEach(val => {
    if(val in count2) {
      count2[val] += 1
    } else {
      count2[val] = 1
    }
  })
  const objToIter = arr1.length > arr2.length ? count1 : count2;
  const objKeys = Object.keys(objToIter);
  for(const key of objKeys) {
    if (count1[key] !== count2[key]) {
      return false
    }
  }

  return true;
}