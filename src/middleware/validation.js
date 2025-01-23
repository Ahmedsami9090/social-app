const validateInput = (schema, locations) => {
  return (req, res, next) => {
    let errorBox = [];
    for (const location of locations) {
      if (schema[location]) {
        const { error } = schema[location].validate(req[location], {
          abortEarly: false,
        });
        if(error){
          errorBox.push(...error.details.map((detail) => detail.message));
        }
      }
    }
    if (errorBox.length) {
      return next(new Error(errorBox.join(", "), { cause: 406 }));
    }
    next();
  };
};
export default validateInput