const functions = require('firebase-functions');
const express = require('express');
var cors = require('cors');
const admin = require('firebase-admin');
const config = require('./config');
const jwt = require('express-jwt');
const app = express();
const uuidv1 = require('uuid/v1');


/*
app.use(jwt({
    secret: 's3crete'
}).unless({ path: '/' }));
*/
app.use(cors({
    origin: '*',
    allowedHeaders: '*'
}));
admin.initializeApp(config);
const db = admin.firestore();

app.get('/', (req, res) => {
    res.send({ status: 'Express server started' });
});
// Get all Products
app.get('/products', async (req, res) => {
    const p = await db.collection('products').get();
    const products = [];
    p.forEach((docs) => {
        products.push({
            product: docs.data()
        });
    });
    res.send(products);
});

app.get('/products/:id', async (req, res) => {
    const p = await db.collection('products').where('id', '==', req.params.id).get();
    const products = [];
    p.forEach((docs) => {
        products.push({
            product: docs.data()
        });
    });
    res.send(products);
});
// Get all Foods
app.get('/foods', async (req, res) => {
    const f = await db.collection('foods').get();
    const foods = [];
    f.forEach(docs => {
        foods.push({
            id: docs.id,
            food: docs.data()
        });
    });
    res.send(foods);
});
app.get('/foods/:id', async (req, res) => {
    const f = await db.collection('foods').doc(req.params.id).get().then(doc => {
        res.send(doc.data());
    });
});

app.post('/transactions', async (req, res) => {
    const transactionId = uuidv1();
    try {
        await db.collection('transactions').doc(transactionId).set(req.body).then((transaction) => {
            updateStock(transactionId);
            res.send({ status: 'success' });
        }).catch((err) => {
            res.send({ status: 'error', reason: err });
        });
    } catch (err) {
        res.send({ status: 'error', reason: err.message });
    }
});
async function updateStock(transactionId) {
    try {
        await db.collection('transactions').doc(transactionId).get().then(async (transaction) => {
            const id = transaction.data().food.id.toString();
            const quantity = transaction.data().quantity;
            let _product;
            let docId;
            let currentQuantity;
            //console.log(id.toString);
            await db.collection('products').where('foodId', '==', id).get().then(async (products) => {
                products.forEach(doc => {
                    docId = doc.id;
                    _product = doc.data();
                });
                _product.currentQuantity = _product.currentQuantity - quantity;
                await db.collection('products').doc(docId).update(_product).then(async (resp) => {
                    console.log('Update current product success');
                });
            });

        });
    } catch (err) {
        console.log(err);
        return false;
    }
}

// Initialize api
exports.api = functions.https.onRequest(app);
