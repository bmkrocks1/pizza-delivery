/*
 * Cart Validator
 * 
 * Author: Billie Ko <bmkrocks@gmail.com>
 * Date: 12/12/19
 */

const validator = {};

validator.toCreateOrUpdate = cart => {
  if (!cart) {
    throw 'Cart payload is empty.'
  }

  const { items } = cart;

  if (!items) {
    throw 'Missing required field(s) in payload.';
  }

  if (items.length === 0) {
    throw 'Cart items is empty.'
  }

  const validatedItems = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (!item) {
      throw 'An item cannot be null.'
    }

    const { itemId, quantity } = item;

    if (!(itemId && quantity)) {
      throw `Missing required field(s) in item at index: ${i}.`
    }

    validatedItems.push({ itemId, quantity });
  }

  return { items: validatedItems };
};

module.exports = validator;
