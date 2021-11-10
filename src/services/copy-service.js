export const CopyService = {
    copyArray(sourceArray) {
        const targetArray = [];

        sourceArray.forEach((element) => {
            if (typeof element !== "object") {
                targetArray.push(element);
            } else if (Array.isArray(element)) {
                targetArray.push(this.copyArray(element));
            } else {
                targetArray.push(this.copyObject(element));
            }
        });

        return targetArray;
    },

    //TODO - what if sourceObject contains null, undefined values? what if it contains functions?
    copyObject(sourceObject) {
        if (sourceObject === null) {
            return null;
        }

        const targetObject = {};

        for (let prop in sourceObject) {
            if (typeof sourceObject[prop] !== "object") {
                targetObject[prop] = sourceObject[prop];
            } else if (Array.isArray(sourceObject[prop])) {
                targetObject[prop] = this.copyArray(sourceObject[prop]);
            } else {
                targetObject[prop] = this.copyObject(sourceObject[prop]);
            }
        }

        return targetObject;
    },
}