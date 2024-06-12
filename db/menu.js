

import express from 'express';
import Datastore from 'nedb';
import Joi from 'joi';
import verifyAdmin from '../middlewares/verifyAdmin.js';

const dbMenu = new Datastore({ filename: './db/dbmenu.db', autoload: true });
const dbSpecialOffers = new Datastore({ filename: './db/specialOffers.db', autoload: true });

const router = express.Router();

// Funktion för att infoga menyer i databasen
const insertMenu = (callback) => {
    dbMenu.count({}, (err, count) => {
        if (err) {
            console.error('Fel:', err);
            callback(err);
            return;
        }
        if (count === 0) {
            dbMenu.insert(menu, (err, newDocs) => {
                if (err) {
                    console.error('Det gick inte att lägga till i menyn:', err);
                    callback(err);
                    return;
                }
                console.log('Meny tillagd:', newDocs);
                callback(null);
            });
        } else {
            callback(null);
        }
    });
};
//const router = express.Router();

const productSchema = Joi.object({
    id: Joi.number().required(),
    title: Joi.string().required(),
    desc: Joi.string().required(),
    price: Joi.number().required(),
    about: Joi.string().required()
});

const specialOfferSchema = Joi.object({
    products: Joi.array().items(Joi.string()).required(),
    price: Joi.number().required()
});

router.post('/add-product', verifyAdmin, (req, res) => {
    const { id, title, desc, price, about } = req.body;
    const productData = { id, title, desc, price, about };

    const { error } = productSchema.validate(productData);
    if (error) {
        return res.status(400).json({ message: 'Felaktig input', details: error.details });
    }

    const newMenuItem = { ...productData, createdAt: new Date() };

    dbMenu.insert(newMenuItem, (err, newDoc) => {
        if (err) {
            return res.status(500).json({ message: 'Det gick inte att lägga till produkt', error: err });
        }
        res.status(201).json({ message: 'Produkten har lagts till', product: newDoc });
    });
});

router.post('/add-specialOffer', verifyAdmin, (req, res) => {
    const { products, price } = req.body;
    const specialOfferData = { products, price };

    const { error } = specialOfferSchema.validate(specialOfferData);
    if (error) {
        return res.status(400).json({ message: 'Felaktig input', details: error.details });
    }

    dbMenu.find({ title: { $in: products } }, (err, foundProducts) => {
        if (err) {
            return res.status(500).json({ message: 'Det gick inte att hämta produkter', error: err });
        }

        const foundProductTitles = foundProducts.map(product => product.title);
        const missingProducts = products.filter(product => !foundProductTitles.includes(product));

        if (missingProducts.length > 0) {
            const newProducts = missingProducts.map(title => ({ title }));
            dbMenu.insert(newProducts, (err, newDocs) => {
                if (err) {
                    return res.status(500).json({ message: 'Det gick inte att lägga till nya produkter', error: err });
                }

                const allProducts = foundProducts.concat(newDocs);
                createCampaign(allProducts, price, res);
            });
        } else {
            createCampaign(foundProducts, price, res);
        }
    });
});

const createCampaign = (products, price, res) => {
    const campaignProducts = products.map(product => ({
        id: product.id,
        title: product.title,
    }));

    const newCampaign = { products: campaignProducts, price, createdAt: new Date() };

    dbSpecialOffers.insert(newCampaign, (err, newDoc) => {
        if (err) {
            return res.status(500).json({ message: 'Det gick inte att lägga till kampanj', error: err });
        }
        res.status(201).json({ message: 'Kampanjer har lagts till', campaign: newDoc });
    });
};

router.put('/update-product/:id', verifyAdmin, (req, res) => {
    const { id, title, desc, price, about } = req.body;
    const productData = { id, title, desc, price, about };

    const { error } = productSchema.validate(productData);
    if (error) {
        return res.status(400).json({ message: 'Felaktig input', details: error.details });
    }

    const itemId = parseInt(req.params.id);
    const updatedFields = { ...productData, modifiedAt: new Date() };

    dbMenu.update({ id: itemId }, { $set: updatedFields }, {}, (err, numReplaced) => {
        if (err) {
            return res.status(500).json({ message: 'Fel vid ändring av produkt', error: err });
        }

        if (numReplaced === 0) {
            return res.status(404).json({ message: 'Produkten finns inte' });
        }

        res.status(200).json({ message: 'Produkt är modifierad', updatedFields });
    });
});

router.delete('/delete-product/:id', verifyAdmin, (req, res) => {
    const itemId = parseInt(req.params.id);
    dbMenu.remove({ id: itemId }, {}, (err, numRemoved) => {
        if (err) {
            return res.status(500).json({ message: 'Det gick inte att ta bort produkten', error: err });
        }
        if (numRemoved === 0) {
            return res.status(404).json({ message: 'Produkten hittades inte' });
        }
        res.status(200).json({ message: 'Produkten raderad' });
    });
});

const menu = [
    {
        "id": 1,
        "title": "Bryggkaffe",
        "desc": "Bryggd på månadens bönor.",
        "price": 39,
        "about": "Välkommen till kafferosteri Power Nappers - en passionerad bryggning av tradition och innovation. Vi är en familjeägd verksamhet dedikerad till att erbjuda kaffe av högsta kvalitet, från böna till kopp. Genom noggrant utvalda kaffebönor från de bästa odlingarna runt om i världen och en expertis i rostning som sträcker sig över generationer, skapar vi unika smakupplevelser som tillfredsställer alla sinnen. Njut av vår bryggkaffe, en klassisk och smakrik dryck tillagad med omsorgsfullt utvalda kaffebönor och bryggad till perfektion för att locka fram dess naturliga smaker och aromer. En välbalanserad kopp kaffe som är redo att förgylla din dag."
    },
    {
        "id": 2,
        "title": "Caffè Doppio",
        "desc": "Bryggd på månadens bönor.",
        "price": 49,
        "about": "Välkommen till kafferosteri Power Nappers - en passionerad bryggning av tradition och innovation. Vi är en familjeägd verksamhet dedikerad till att erbjuda kaffe av högsta kvalitet, från böna till kopp. Genom noggrant utvalda kaffebönor från de bästa odlingarna runt om i världen och en expertis i rostning som sträcker sig över generationer, skapar vi unika smakupplevelser som tillfredsställer alla sinnen. Upplev intensiteten i vår doppio - en dubbel espresso som erbjuder en kraftfull och koncentrerad smakupplevelse. Perfekt för de som söker en extra kick av koffein eller vill njuta av den djupa komplexiteten i kaffets essens."
    },
    {
        "id": 3,
        "title": "Cappuccino",
        "desc": "Bryggd på månadens bönor.",
        "price": 49,
        "about": "Välkommen till kafferosteri Power Nappers - en passionerad bryggning av tradition och innovation. Vi är en familjeägd verksamhet dedikerad till att erbjuda kaffe av högsta kvalitet, från böna till kopp. Genom noggrant utvalda kaffebönor från de bästa odlingarna runt om i världen och en expertis i rostning som sträcker sig över generationer, skapar vi unika smakupplevelser som tillfredsställer alla sinnen. Upptäck harmonin mellan espresso och krämig ånga i vår cappuccino. Med sin perfekta balans mellan stark espresso, mjölk och krämigt skum erbjuder denna klassiska italienska dryck en lyxig och smakrik upplevelse som är oemotståndlig för alla sinnen."
    },
    {
        "id": 4,
        "title": "Latte Macchiato",
        "desc": "Bryggd på månadens bönor.",
        "price": 49,
        "about": "Välkommen till kafferosteri Power Nappers - en passionerad bryggning av tradition och innovation. Vi är en familjeägd verksamhet dedikerad till att erbjuda kaffe av högsta kvalitet, från böna till kopp. Genom noggrant utvalda kaffebönor från de bästa odlingarna runt om i världen och en expertis i rostning som sträcker sig över generationer, skapar vi unika smakupplevelser som tillfredsställer alla sinnen. Utforska elegansen i vår latte macchiato - en konstnärlig skapelse av varm mjölk och en välbalanserad espresso, vars lager av mjölk och kaffe skapar ett vackert konstverk i din kopp. Upplev en mild och krämig smak med en subtil touch av espresso, perfekt för att njuta av lugnet i en stund för dig själv."
    },
    {
        "id": 5,
        "title": "Kaffe Latte",
        "desc": "Bryggd på månadens bönor.",
        "price": 54,
        "about": "Välkommen till kafferosteri Power Nappers - en passionerad bryggning av tradition och innovation. Vi är en familjeägd verksamhet dedikerad till att erbjuda kaffe av högsta kvalitet, från böna till kopp. Genom noggrant utvalda kaffebönor från de bästa odlingarna runt om i världen och en expertis i rostning som sträcker sig över generationer, skapar vi unika smakupplevelser som tillfredsställer alla sinnen. Njut av en smidig och förförisk upplevelse med vår kaffe latte. En harmonisk kombination av krämig ånga mjölk och intensiv espresso, vars smak dansar perfekt balanserat på din tunga. Upplev kaffets elegans på sitt bästa sätt."
    },
    {
        "id": 6,
        "title": "Cortado",
        "desc": "Bryggd på månadens bönor.",
        "price": 39,
        "about": "Välkommen till kafferosteri Power Nappers - en passionerad bryggning av tradition och innovation. Vi är en familjeägd verksamhet dedikerad till att erbjuda kaffe av högsta kvalitet, från böna till kopp. Genom noggrant utvalda kaffebönor från de bästa odlingarna runt om i världen och en expertis i rostning som sträcker sig över generationer, skapar vi unika smakupplevelser som tillfredsställer alla sinnen. Upplev koncentrationen av kaffe i sin renaste form med vår cortado. En harmonisk kombination av espresso och ånga mjölk, vars delikata balans av styrka och lenhet ger en njutbar kaffepaus. För den som söker en elegant och kraftfull smakupplevelse."
    }
]

export { router as default, insertMenu };