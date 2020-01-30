# Pizza Delivery API

## Authentication API

Obtain a token from the server that expires after 1 hour by logging in. If you have not created your own User object yet, please read the **Create a User** section first and create your own User object.

#### Login User
----
Creates a token that expires after 1 hour. After calling this API, copy the token value from the response and add it into the Request Headers for all your API calls, except for user creation and login. The key will be `token`.

An API call that requires a token returns a `403 Forbidden` error if the token is not provided or if the token provided has already expired.

**Sample 403 Forbidden Error Response**
```json
{
    "message": "Unauthorized access."
}
```

**URL**
```POST /login```

**PAYLOAD**
Required fields:
* **email**: Your email address
* **password**: Your password

**Sample Response**
  ```json
{
    "token": "f270b7f7bfb16da7a30b194e31579951",
    "expires": 1576581997321
}
  ```
  
#### Logout User
----
Deletes your existing token. This API requires a valid `token` in the Request Headers.

**URL**
```GET /logout```

## Users API
You can only create, retrieve, update, and delete your own created User objects.

#### The `User` Object
Properties:
* **id**: The User object ID.
* **email**: Valid email address.
* **password**: User's password.
* **name**: User's full name.
* **address**: User's complete address.
* **paymentMethod**: User's payment method: Type: `PaymentMethod`

#### The `PaymentMethod` Object
* **type**: The payment method type. Possible value: `card`
* **cardNumber**: Credit card number.
* **cardExpMonth**: Credit card expiration month.
* **cardExpYear**: Credit card expiration year.
* **cardCVC**: Credit card CVC.

#### Create a User
----
  Creates a `User` object.

**URL**
```POST /users```

**PAYLOAD**
Required fields:
* **email**: A valid email address
* **password**: Your password
* **name**: Your full name
* **address**: Your complete address
    
Optional fields:
* **paymentMethod**: Your payment method is optional, but once you checkout your cart, you need to add your Payment Method first using the `PUT /users` endpoint. Type: `PaymentMethod`

**Sample Request Payload**
```json
{
	"email": "foobar@example.com",
	"password": "1234",
	"name": "foobar",
	"address": "San Francisco, California, USA",
	"paymentMethod": {
		"type": "card",
		"cardNumber": "4242424242424242",
		"cardExpMonth": "12",
		"cardExpYear": "2020",
		"cardCVC": "143"
	}
}
```

**Sample Response**
  ```json
{
    "email": "foobar@example.com",
    "name": "foobar",
    "address": "San Francisco, California, USA",
    "paymentMethod": {
        "type": "card",
        "cardNumber": "4242424242424242",
        "cardExpMonth": "12",
        "cardExpYear": "2020",
        "cardCVC": "143"
    },
    "id": "b6c69dc3c6388e2d7084a810fd655bb9"
}
  ```
  
#### Retrieve a User
----
  Retrieves your own `User` object.

**URL**
```GET /users```

**PARAMETERS**
Required:
* **id**: User object ID.

#### Update a User
----
  Updates your own `User` object.

**URL**
```PUT /users```

**PARAMETERS**
Required:
* **id**: User object ID.

**PAYLOAD**
Optional fields: (_All of the fields are optional but one of them must be present._)
* **password**: Your password
* **name**: Your full name
* **address**: Your complete address
* **paymentMethod**: When provided, all of its fields are required. Type: `PaymentMethod`

#### Delete a User
----
  Deletes your own `User` object.

**URL**
```DELETE /users```

**PARAMETERS**
Required:
* **id**: User object ID.

## Menu

#### The `Menu` Object
Properties:
* **items**: Array of `Item` objects. Type: `Item[]`

#### The `Item` Object
Properties:
* **id**: Item object ID.
* **name**: Item name.
* **description**: Item description.
* **price**: Item price. Type: `number`

#### Retrieve a Menu
----
  Retrieves a `Menu` object.

**URL**
```GET /menu```

**Sample Response**
```
{
    "items": [
        {
            "id": "1",
            "name": "Hawaiian Pizza",
            "description": "Topped with tomato sauce, cheese, pineapple, and ham.",
            "price": 9.5
        },
        {
            "id": "2",
            "name": "Vegetarian Pizza",
            "description": "Topped with tomatoes, mushrooms, and onions.",
            "price": 8
        }
    ]
}
```

## Cart

The shopping cart is where you can add items you want to order. You can checkout the cart if you're ready to make the order.

There is only 1 cart per user so everytime you create a cart, your old cart will be deleted.

The same with the Users API, you can only create, retrieve, update, and delete your own Cart object.

#### The `Cart` Object
Properties:
* **id**: The Cart object ID.
* **items**: Array of `Item_Quantity` objects. Type: `Item_Quantity[]`
* **createdDate**: Created date in milliseconds. Type: `number`
* **userId**: The User object ID. The owner of this Cart.
* **userEmail**: The User object email: The owner of this Cart.

#### The `Item_Quantity` Object
Properties:
* **itemId**: The Item object ID.
* **quantity**: The number of items. Type: `number`

#### Create a Cart
----
  Creates a `Cart` object.

**URL**
```POST /cart```

**PAYLOAD**
Required fields:
* **items**: An array of objects that has `itemId` and `quantity` properties.
    * **itemId**: The Item object ID.
    * **quantity**: The number of items.

**Sample Request Payload**
```json
{
    "items": [
        {
            "itemId": "1",
            "quantity": 10
        },
        {
            "itemId": "2",
            "quantity": 20
        }
    ]
}
```

**Sample Response**
```json
{
    "items": [
        {
            "itemId": "1",
            "quantity": 10
        },
        {
            "itemId": "2",
            "quantity": 20
        }
    ],
    "id": "165799cd84c2a81fd8ae1b6be2fdeaba",
    "createdDate": 1576580712748
}
```

#### Retrieve a Cart
----
  Retrieves your own `Cart` object.

**URL**
```GET /cart```

**PARAMETERS**
Required:
* **id**: User object ID.

#### Update a Cart
----
  Updates your own `Cart` object.

**URL**
```PUT /cart```

**PARAMETERS**
Required:
* **id**: Cart object ID.

**PAYLOAD**
Required fields:
* **items**: An array of objects that has `itemId` and `quantity` properties.
    * **itemId**: The Item object ID.
    * **quantity**: The number of items.

#### Delete a Cart
----
  Delete your own `Cart` object.

**URL**
```DELETE /cart```

**PARAMETERS**
Required:
* **id**: Cart object ID.

## Checkout

#### The `Order` Object
Properties:
* **id**: The Order object ID.
* **orderedDate**: Ordered date in milliseconds. Type: `number`
* **userId**: The User object ID. The owner of this Order.
* **userEmail**: The User object email: The owner of this Order.
* **items**: Array of `Ordered_Item` objects. Type `Ordered_Item[]`
* **totalAmount**: The total amount of this order. Type: `number`
* **totalQuantity**: The total number of items in this order. Type: `number`
* **status**: The status of this order. Possible values: `to_pay`, `to_deliver`, `delivering`, and `complete`.

### The `Ordered_Item` Object
Properties:
* **item**: The `Item` object. Type: `Item`
* **quantity**: The number of items. Type: `number`
* **amount**: The total amount of this ordered item(s). Type: `numer`

#### Checkout a Cart
----
  Checkouts a Cart, creates the order, auto-confirms the payment (if a Payment Method is provided), and sends out an Invoice Email to the user's email address if the payment is successful.
  
  The response of this API after the checkout is successful is the `Order` object.

**URL**
```POST /checkout```

**PARAMETERS**
Required:
* **cart_id**: Cart object ID.

**Sample Response**
```json
{
    "items": [
        {
            "item": {
                "id": "1",
                "name": "Hawaiian Pizza",
                "description": "Topped with tomato sauce, cheese, pineapple, and ham.",
                "price": 9.5
            },
            "quantity": 10,
            "amount": 95
        },
        {
            "item": {
                "id": "2",
                "name": "Vegetarian Pizza",
                "description": "Topped with tomatoes, mushrooms, and onions.",
                "price": 8
            },
            "quantity": 20,
            "amount": 160
        }
    ],
    "id": "43b667332c66f9b8dc14268ac6067731",
    "orderedDate": 1576593528329,
    "userId": "41b98f873930c29da8b838c9d8aa3a81",
    "userEmail": "bmkrocks@gmail.com",
    "totalAmount": 255,
    "totalQuantity": 30,
    "status": "to_deliver"
}
```