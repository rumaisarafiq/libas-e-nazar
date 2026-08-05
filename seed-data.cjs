// One-time script to seed sample data into Firestore: 10 orders, and
// 10 people each with a signup + login + logout event (30 authHistory
// records total).
//
// Setup:
//   1. Download a service account key from Firebase Console →
//      Project Settings → Service Accounts → Generate new private key
//   2. Save it as serviceAccountKey.json in the project root
//      (make sure it's in .gitignore — never commit this file)
//   3. npm install firebase-admin --save-dev
//   4. node seed-data.js
//
// Safe to run only once — running it again adds a second copy of
// everything (new random Firestore IDs each time).

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// ---------------------------------------------------------------------
// ORDERS — 10 records, different customers from the auth history below
// ---------------------------------------------------------------------
const orders = [
  {
    orderId: "LEN-100001AKHN",
    userName: "Ali Raza Khan",
    userEmail: "ali.raza.khan@gmail.com",
    userUid: "guest-akhn001",
    shipping_details: {
      phone: "0321-4567890",
      address: "House 12-B, Street 5, Gulshan-e-Iqbal",
      apartment: null,
      city: "Karachi",
      postalCode: "75300",
      country: "Pakistan",
    },
    shippingMethod: "standard",
    paymentMethod: "cod",
    items: [
      {
        name: "Mustard Gold Kurta",
        role: "Kurta",
        size: "M",
        style: "eastern",
        qty: 1,
        price: 3500,
      },
      {
        name: "Brocade Waistcoat",
        role: "Coat",
        size: "M",
        style: "eastern",
        qty: 1,
        price: 7000,
      },
    ],
    subtotal: 10500,
    shipping: 250,
    tax: 525,
    grandTotal: 11275,
    date: "7/28/2026",
    time: "4:12:00 PM",
    createdAt: "2026-07-28T16:12:00.000Z",
  },
  {
    orderId: "LEN-100002BSDQ",
    userName: "Bilal Ahmed Siddiqui",
    userEmail: "bilal.siddiqui92@yahoo.com",
    userUid: "guest-bsdq002",
    shipping_details: {
      phone: "0300-2345671",
      address: "Flat 14, Block C, Model Town Extension",
      apartment: "2nd Floor",
      city: "Lahore",
      postalCode: "54700",
      country: "Pakistan",
    },
    shippingMethod: "express",
    paymentMethod: "cod",
    items: [
      {
        name: "Classic White Dress Shirt",
        role: "Shirt",
        size: "M",
        style: "western",
        qty: 1,
        price: 2300,
      },
      {
        name: "Black Dress Pants",
        role: "Trouser",
        size: "M",
        style: "western",
        qty: 1,
        price: 3500,
      },
    ],
    subtotal: 5800,
    shipping: 750,
    tax: 290,
    grandTotal: 6840,
    date: "7/29/2026",
    time: "11:34:00 AM",
    createdAt: "2026-07-29T11:34:00.000Z",
  },
  {
    orderId: "LEN-100003HTML",
    userName: "Hamza Tariq Malik",
    userEmail: "hamza.tmalik@hotmail.com",
    userUid: "guest-html003",
    shipping_details: {
      phone: "0345-7891234",
      address: "House 7, Street 21, F-10/2",
      apartment: null,
      city: "Islamabad",
      postalCode: "44000",
      country: "Pakistan",
    },
    shippingMethod: "standard",
    paymentMethod: "cod",
    items: [
      {
        name: "Royal Blue Shirt",
        role: "Shirt",
        size: "M",
        style: "western",
        qty: 1,
        price: 4600,
      },
    ],
    subtotal: 4600,
    shipping: 250,
    tax: 230,
    grandTotal: 5080,
    date: "7/30/2026",
    time: "6:50:00 PM",
    createdAt: "2026-07-30T18:50:00.000Z",
  },
  {
    orderId: "LEN-100004FYQR",
    userName: "Faizan Yousuf Qureshi",
    userEmail: "faizan.yq@gmail.com",
    userUid: "guest-fyqr004",
    shipping_details: {
      phone: "0333-6547891",
      address: "B-45, Sector 11-A, North Karachi",
      apartment: null,
      city: "Karachi",
      postalCode: "75850",
      country: "Pakistan",
    },
    shippingMethod: "standard",
    paymentMethod: "cod",
    items: [
      {
        name: "Heather Grey Sweatshirt",
        role: "Shirt",
        size: "M",
        style: "western",
        qty: 1,
        price: 3800,
      },
      {
        name: "Grey Pants",
        role: "Trouser",
        size: "M",
        style: "western",
        qty: 1,
        price: 3200,
      },
    ],
    subtotal: 7000,
    shipping: 250,
    tax: 350,
    grandTotal: 7600,
    date: "7/31/2026",
    time: "2:05:00 PM",
    createdAt: "2026-07-31T14:05:00.000Z",
  },
  {
    orderId: "LEN-100005UZFR",
    userName: "Usman Zafar",
    userEmail: null,
    userUid: "guest-uzfr005",
    shipping_details: {
      phone: "0312-9087654",
      address: "House 22, Cavalry Ground",
      apartment: null,
      city: "Lahore",
      postalCode: "54000",
      country: "Pakistan",
    },
    shippingMethod: "standard",
    paymentMethod: "cod",
    items: [
      {
        name: "Grey Polo",
        role: "Shirt",
        size: "M",
        style: "western",
        qty: 2,
        price: 3300,
      },
    ],
    subtotal: 6600,
    shipping: 250,
    tax: 330,
    grandTotal: 7180,
    date: "8/1/2026",
    time: "9:20:00 AM",
    createdAt: "2026-08-01T09:20:00.000Z",
  },
  {
    orderId: "LEN-100006SNVR",
    userName: "Saad Nadeem Vohra",
    userEmail: "saad.vohra@outlook.com",
    userUid: "guest-snvr006",
    shipping_details: {
      phone: "0301-5674839",
      address: "Plot 9, Phase 6, DHA",
      apartment: null,
      city: "Karachi",
      postalCode: "75500",
      country: "Pakistan",
    },
    shippingMethod: "express",
    paymentMethod: "cod",
    items: [
      {
        name: "Ivory Sherwani",
        role: "Item",
        size: "M",
        style: "eastern",
        qty: 1,
        price: 18000,
      },
    ],
    subtotal: 18000,
    shipping: 0,
    tax: 900,
    grandTotal: 18900,
    date: "8/1/2026",
    time: "5:45:00 PM",
    createdAt: "2026-08-01T17:45:00.000Z",
  },
  {
    orderId: "LEN-100007ZKRH",
    userName: "Zain Karim Rehman",
    userEmail: "zain.rehman@gmail.com",
    userUid: "guest-zkrh007",
    shipping_details: {
      phone: "0322-1123456",
      address: "House 3, Street 14, Bahria Town Phase 4",
      apartment: null,
      city: "Rawalpindi",
      postalCode: "46000",
      country: "Pakistan",
    },
    shippingMethod: "standard",
    paymentMethod: "cod",
    items: [
      {
        name: "Sand Beige Kurta",
        role: "Kurta",
        size: "M",
        style: "eastern",
        qty: 1,
        price: 4500,
      },
    ],
    subtotal: 4500,
    shipping: 250,
    tax: 225,
    grandTotal: 4975,
    date: "8/2/2026",
    time: "1:15:00 PM",
    createdAt: "2026-08-02T13:15:00.000Z",
  },
  {
    orderId: "LEN-100008ABNS",
    userName: "Abdullah Bin Nasir",
    userEmail: "abdullah.nasir@yahoo.com",
    userUid: "guest-abns008",
    shipping_details: {
      phone: "0334-8765432",
      address: "House 56, Hayatabad Phase 3",
      apartment: null,
      city: "Peshawar",
      postalCode: "25100",
      country: "Pakistan",
    },
    shippingMethod: "standard",
    paymentMethod: "cod",
    items: [
      {
        name: "Navy Blue Polo",
        role: "Shirt",
        size: "M",
        style: "western",
        qty: 1,
        price: 4300,
      },
      {
        name: "Olive Green Pants",
        role: "Trouser",
        size: "M",
        style: "western",
        qty: 1,
        price: 3200,
      },
    ],
    subtotal: 7500,
    shipping: 250,
    tax: 375,
    grandTotal: 8125,
    date: "8/2/2026",
    time: "10:40:00 AM",
    createdAt: "2026-08-02T10:40:00.000Z",
  },
  {
    orderId: "LEN-100009TFHS",
    userName: "Talha Farooq Hashmi",
    userEmail: "talha.hashmi@gmail.com",
    userUid: "guest-tfhs009",
    shipping_details: {
      phone: "0315-3216549",
      address: "Flat 8B, Askari 5",
      apartment: null,
      city: "Multan",
      postalCode: "60000",
      country: "Pakistan",
    },
    shippingMethod: "express",
    paymentMethod: "cod",
    items: [
      {
        name: "Off-White Prince Coat",
        role: "Item",
        size: "M",
        style: "eastern",
        qty: 1,
        price: 20200,
      },
    ],
    subtotal: 20200,
    shipping: 0,
    tax: 1010,
    grandTotal: 21210,
    date: "8/3/2026",
    time: "7:25:00 PM",
    createdAt: "2026-08-03T19:25:00.000Z",
  },
  {
    orderId: "LEN-100010WRJD",
    userName: "Waqar Raza Jadoon",
    userEmail: "waqar.jadoon@hotmail.com",
    userUid: "guest-wrjd010",
    shipping_details: {
      phone: "0341-6789012",
      address: "House 18, Satellite Town",
      apartment: null,
      city: "Quetta",
      postalCode: "87300",
      country: "Pakistan",
    },
    shippingMethod: "standard",
    paymentMethod: "cod",
    items: [
      {
        name: "Dark Brown Shirt",
        role: "Shirt",
        size: "M",
        style: "western",
        qty: 1,
        price: 3100,
      },
    ],
    subtotal: 3100,
    shipping: 250,
    tax: 155,
    grandTotal: 3505,
    date: "8/4/2026",
    time: "3:55:00 PM",
    createdAt: "2026-08-04T15:55:00.000Z",
  },
];

// ---------------------------------------------------------------------
// AUTH HISTORY — 10 people, each with signup + login + logout (30 total)
// Fresh names, not reused from the orders above or from earlier batches.
// ---------------------------------------------------------------------
const authPeople = [
  {
    name: "Sarmad Iqbal Chaudhry",
    email: "sarmad.chaudhry@gmail.com",
    uid: "guest-sic016",
    signup: "2026-07-19T08:20:00.000Z",
    login: "2026-08-01T09:10:00.000Z",
    logout: "2026-08-01T09:45:00.000Z",
  },
  {
    name: "Owais Rehman Qazi",
    email: "owais.qazi@yahoo.com",
    uid: "guest-orq017",
    signup: "2026-07-20T13:05:00.000Z",
    login: "2026-08-01T19:30:00.000Z",
    logout: "2026-08-01T20:02:00.000Z",
  },
  {
    name: "Fahad Naveed Awan",
    email: "fahad.awan@hotmail.com",
    uid: "guest-fna018",
    signup: "2026-07-21T17:50:00.000Z",
    login: "2026-08-02T10:15:00.000Z",
    logout: "2026-08-02T10:40:00.000Z",
  },
  {
    name: "Shahzaib Munir Dar",
    email: "shahzaib.dar@gmail.com",
    uid: "guest-smd019",
    signup: "2026-07-22T11:35:00.000Z",
    login: "2026-08-02T14:55:00.000Z",
    logout: "2026-08-02T15:20:00.000Z",
  },
  {
    name: "Adeel Farrukh Baig",
    email: "adeel.baig@outlook.com",
    uid: "guest-afb020",
    signup: "2026-07-23T09:00:00.000Z",
    login: "2026-08-02T21:05:00.000Z",
    logout: "2026-08-02T21:30:00.000Z",
  },
  {
    name: "Noman Ashraf Gill",
    email: "noman.gill@gmail.com",
    uid: "guest-nag021",
    signup: "2026-07-24T15:15:00.000Z",
    login: "2026-08-03T08:40:00.000Z",
    logout: "2026-08-03T09:00:00.000Z",
  },
  {
    name: "Haris Zubair Mirza",
    email: "haris.mirza@yahoo.com",
    uid: "guest-hzm022",
    signup: "2026-07-25T18:25:00.000Z",
    login: "2026-08-03T13:20:00.000Z",
    logout: "2026-08-03T13:50:00.000Z",
  },
  {
    name: "Taimoor Salman Bhatti",
    email: "taimoor.bhatti@gmail.com",
    uid: "guest-tsb023",
    signup: "2026-07-26T07:45:00.000Z",
    login: "2026-08-03T17:10:00.000Z",
    logout: "2026-08-03T17:35:00.000Z",
  },
  {
    name: "Asadullah Rafiq Cheema",
    email: "asadullah.cheema@hotmail.com",
    uid: "guest-arc024",
    signup: "2026-07-27T12:30:00.000Z",
    login: "2026-08-04T09:50:00.000Z",
    logout: "2026-08-04T10:15:00.000Z",
  },
  {
    name: "Umer Farooq Satti",
    email: "umer.satti@gmail.com",
    uid: "guest-ufs025",
    signup: "2026-07-28T16:40:00.000Z",
    login: "2026-08-04T20:25:00.000Z",
    logout: "2026-08-04T20:55:00.000Z",
  },
];

async function seed() {
  console.log(`Adding ${orders.length} orders...`);
  for (const order of orders) {
    const ref = await db.collection("orders").add({
      ...order,
      createdAtServer: FieldValue.serverTimestamp(),
    });
    console.log(`  order ${order.orderId} -> ${ref.id}`);
  }

  console.log(
    `\nAdding authHistory for ${authPeople.length} people (signup+login+logout each)...`,
  );
  for (const p of authPeople) {
    const events = [
      { type: "signup", timestamp: p.signup },
      { type: "login", timestamp: p.login },
      { type: "logout", timestamp: p.logout },
    ];
    for (const e of events) {
      const ref = await db.collection("authHistory").add({
        type: e.type,
        name: p.name,
        email: p.email,
        uid: p.uid,
        timestamp: e.timestamp,
      });
      console.log(`  ${e.type} for ${p.name} -> ${ref.id}`);
    }
  }

  console.log(
    "\nDone! Check Firebase Console -> Firestore Database -> orders / authHistory.",
  );
  process.exit(0);
}

seed().catch((err) => {
  console.error("Failed to seed data:", err);
  process.exit(1);
});
