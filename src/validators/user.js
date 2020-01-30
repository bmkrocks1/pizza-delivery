/*
 * User Validator
 * 
 * Author: Billie Ko <bmkrocks@gmail.com>
 * Date: 12/9/19
 */

const validator = {};

const validateEmail = email => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

validator.toCreate = user => {
  if (!user) {
    throw 'User payload is empty.'
  }

  const { email, password, name, address, paymentMethod } = user;

  if (!(email && password && name && address)) {
    throw 'Missing required field(s) in payload.';
  }

  if (!validateEmail(email)) {
    throw `Email (${email}) is invalid.`;
  }

  // Payment Method is optional. But if it is provided, let's validate.
  if (paymentMethod) {
    const { type, cardNumber, cardExpMonth, cardExpYear, cardCVC } = paymentMethod;

    if (!(type && cardNumber && cardExpMonth && cardExpYear && cardCVC)) {
      throw 'Missing required field(s) in payment method.';
    }
  }

  return { email, password, name, address, paymentMethod: paymentMethod || null };
};

validator.toUpdate = user => {
  if (!user) {
    throw 'User payload is empty.'
  }

  const { password, name, address, paymentMethod } = user;

  if (!(password || name || address || paymentMethod)) {
    throw 'Missing required field(s) in payload.';
  }

  // Payment Method is optional. But if it is provided, let's validate.
  if (paymentMethod) {
    const { type, cardNumber, cardExpMonth, cardExpYear, cardCVC } = paymentMethod;

    if (!(type && cardNumber && cardExpMonth && cardExpYear && cardCVC)) {
      throw 'Missing required field(s) in payment method.';
    }
  }

  const update = {};

  if (password) {
    update.password = password;
  }

  if (name) {
    update.name = name;
  }

  if (address) {
    update.address = address;
  }

  if (paymentMethod) {
    update.paymentMethod = paymentMethod;
  }

  return update;
};

module.exports = validator;
