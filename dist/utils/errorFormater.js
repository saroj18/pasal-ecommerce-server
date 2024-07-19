export const errorFormatter = (error) => {
    let err = Object.entries(error);
    const formatError = {};
    err.forEach((ele) => {
        var _a;
        if (ele[0] !== "_errors") {
            formatError[ele === null || ele === void 0 ? void 0 : ele[0]] = (_a = ele[1]._errors) === null || _a === void 0 ? void 0 : _a[0];
        }
    });
    return formatError;
};
