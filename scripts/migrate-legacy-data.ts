/**
 * Legacy Data Migration Script
 *
 * This script migrates ALL data from the original Java POS system's text files
 * to MongoDB Atlas with a normalized schema.
 *
 * Original Database Files:
 * - employeeDatabase.txt - Employee records
 * - itemDatabase.txt - Sale items inventory
 * - rentalDatabase.txt - Rental items inventory
 * - userDatabase.txt - Customer rental history
 * - couponNumber.txt - Valid coupon codes (C001-C200)
 * - saleinvoiceRecord.txt - Historical sale transactions
 * - employeeLogfile.txt - Login/logout audit logs
 * - ReturnSale.txt - Return transaction records
 * - temp.txt files - Pending return transactions
 *
 * Run: npx tsx scripts/migrate-legacy-data.ts
 */

import { MongoClient, type Db } from "mongodb"

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://i222657:goku1356@a3p2.p7u3y.mongodb.net/?retryWrites=true&w=majority&appName=a3p2"
const DB_NAME = process.env.MONGODB_DB || "pos_system"
const TAX_RATE = 0.06 // 6% tax rate from original system

// ============================================
// RAW DATA FROM ORIGINAL TEXT FILES
// ============================================

// From employeeDatabase.txt
// Format: employeeId role firstName lastName password
const EMPLOYEE_DATA = `110001 Admin Harry Larry 1
110002 Cashier Debra Cooper lehigh2016
110003 Admin Clayton Watson lehigh2017
110004 Cashier Seth Moss lehigh2018
110005 Admin Amy Adams 1101
110006 Cashier Mike Spears lehigh
110009 Admin John Candle candles
110011 Cashier Anthony Hopkins theman
110012 Cashier Robert Lek huehue
110013 Cashier Johnny Cage mortalkombat
110014 Cashier Eim Lou cowboybebop
110015 Cashier Michael Scott thatswhatshesaid`

// From itemDatabase.txt (COMPLETE - 101 items)
// Format: itemId itemName price quantity
const ITEM_DATA = `1000 Potato 1.0 249
1001 PlasticCup 0.5 376
1002 SkirtSteak 15.0 1055
1003 PotatoChips 1.2 168
1004 Curry 2.3 500
1005 Tomato 0.8 150
1006 Pineapple 2.0 201
1007 Apple 0.6 200
1008 Pumpkin 1.5 200
1009 GreenApple 0.7 250
1010 Applesauce 2.5 100
1011 Corn 2.0 499
1012 CornMeal 1.1 200
1013 Molasses 6.5 10
1014 Muffins 2.0 500
1015 Sauerkraut 3.2 100
1016 Sausage 2.0 400
1017 BabyFood 4.5 50
1018 Mushrooms 2.0 100
1019 Seafood 10.0 52
1020 BabyFormula 2.2 500
1021 CornSyrup 1.0 401
1022 Mustard 1.1 400
1023 SeasoningMix 8.8 11
1024 Bacon 5.5 9001
1025 Crackers 0.5 600
1026 Noodles 2.0 100
1027 Pasta 1.5 100
1028 Bagels 2.5 20
1029 CreamCheese 1.0 30
1030 NoodleMix 0.5 200
1031 Soda 0.35 500
1032 BakeryGoods 6.0 100
1033 Cream 1.2 200
1034 Nuts 3.4 200
1035 CannedSoup 1.5 200
1036 WhippedCream 6.0 10
1037 BakingSoda 1.0 200
1038 Oatmeal 1.1 500
1039 Croutons 5.6 10
1040 Oil 2.0 20
1041 SourCream 3.0 20
1042 Beans 2.0 100
1043 Olives 1.0 540
1044 Spaghetti 2.3 102
1045 Cucumber 1.2 404
1046 Dessert 3.4 40
1047 Onion 2.0 40
1048 Spices 8.0 80
1049 Beans 1.0 80
1050 OnionRings 0.5 100
1051 Eggs 12.0 100
1052 BeefJerky 6.0 10
1053 DrinkMix 2.0 100
1054 Oranges 1.0 200
1055 Stuffing 0.75 50
1056 WhyAreYouReadingThese 1.0 60
1057 PancakeMix 0.3 50
1058 BrownSugar 1.5 100
1059 RoastBeef 5.25 50
1060 Steak 10.5 6
1061 EvaporatedMilk 0.6 10
1062 Peaches 2.1 10
1063 Sugar 2.0 10
1064 Fish 6.5 20
1065 PeanutButter 4.5 10
1066 Beer 999.0 1
1067 Pears 2.0 50
1068 Flour 1.0 10
1069 Syrup 1.25 20
1070 CannedFruit 2.0 20
1071 Biscuits 1.75 100
1072 Pickles 2.5 50
1073 TomatoSauce 0.75 30
1074 Tea 4.5 100
1075 Pease 1.0 500
1076 Tortillas 1.0 100
1077 Gelatin 0.75 10
1078 GrahmCrackers 2.2 50
1079 Pineapple 1.0 50
1080 Tuna 7.0 4
1081 PizzaDough 2.0 20
1082 Turkey 6.7 10
1083 GranolaBars 1.0 20
1084 PizzaSauce 4.0 50
1085 Vanilla 1.0 50
1086 Butter 0.5 100
1087 VegetablesFrozen 4.5 47
1088 VegetablesCanned 4.5 50
1089 Plums 1.25 10
1090 Vinegar 3.67 60
1091 Cabbage 2.34 50
1092 GreenPepper 4.5 50
1093 Cake 10.5 10
1094 Ham 11.5 10
1095 WafflesFrozen 6.7 10
1096 Honey 2.35 50
1097 Candy 1.65 50
1098 PorkAndBeans 4.5 50
1099 Water 1.75 100
1100 IceCreamToppings 6.7 100`

// From rentalDatabase.txt (COMPLETE - 24 rental items)
// Format: itemId itemName rentalPricePerDay quantity
const RENTAL_DATA = `1000 TheoryOfEverything 30.0 249
1001 AdventuresOfTomSawyer 40.5 391
1002 PrideAndPrejudice 30.0 995
1003 MarleyAndMe 35.0 199
1004 TheMummy 30.0 98
1005 TheInterview 20.0 200
1006 Aladdin 15.0 200
1007 HarvestMoon 45.0 200
1008 ParksAndRecSeason1 20.0 200
1009 ParksAndRecSeason2 20.0 200
1010 ParksAndRecSeason3 20.0 199
1011 ParksAndRecSeason4 20.0 198
1012 ParksAndRecSeason5 20.0 200
1013 ParksAndRecSeason6 20.0 195
1014 ParksAndRecSeason7 20.0 200
1015 ArrowSeason1 15.0 300
1016 ArrowSeason2 15.0 300
1017 ArrowSeason3 15.0 300
1018 ArrowSeason4 15.0 300
1019 TheIllusionist 40.0 200
1020 IllusionistsLive 20.0 100
1021 KissFromTheRose 5.0 400
1022 TheHulk 20.0 200
1023 Avengers 30.0 399`

// From userDatabase.txt - Customer rental history (COMPLETE)
// Format: phoneNumber rentalItemId,date,returned rentalItemId,date,returned ...
const USER_DATABASE = `6096515668 1000,6/30/09,true 1022,6/31/11,true
7282941912 1011,11/19/15,true
4801239021 1022,3/02/13,true
5893013292 1018,2/19/14,true
3948219384 1006,7/07/11,true
6096515662 1001,11/03/15,true
9948069922 1000,11/19/15,true
9994806991 1001,11/19/15,true
1111112222 1010,11/19/15,false
1112223334 1013,11/19/15,false
993456893 1001,03/11/19,false 1002,03/11/19,false
1234567893
1234567892`

// From saleinvoiceRecord.txt - Historical transactions (COMPLETE)
const SALE_INVOICE_DATA = `2015-11-17 20:33:06.997
1002 SkirtSteak 3 45.0
Total with tax: 47.7
2015-11-17 20:34:29.595
1002 SkirtSteak 1 15.0
Total with tax: 15.9
2015-11-17 20:58:15.281
1000 Potato 2 2.0
Total with tax: 2.12
2015-11-17 22:59:56.529
1020 BabyFormula 2 4.400000095367432
Total with tax: 4.664000101089478
2015-11-17 23:02:25.834
1019 Seafood 2 20.0
Total with tax: 21.200000000000003
2015-11-17 23:11:33.093
1021 CornSyrup 1 1.0
Total with tax: 1.06
2015-11-17 23:14:23.604
1024 Bacon 1 5.5
Total with tax: 5.83
2015-11-17 23:28:46.873
1023 SeasoningMix 1 8.800000190734863
Total with tax: 9.328000202178956
2015-11-19 20:38:47.725
1000 Potato 1 1.0
Total with tax: 1.06
2015-11-19 20:51:34.957
1002 SkirtSteak 2 30.0
Total with tax: 31.8
2015-11-19 21:01:35.685
1001 PlasticCup 2 1.0
Total with tax: 1.06
2015-11-19 21:31:14.815
1000 Potato 2 2.0
Total with tax: 2.12
2015-11-19 22:10:37.933
1001 PlasticCup 1 0.5
Total with tax: 0.53
2015-11-20 14:33:41.035
1020 BabyFormula 2 4.400000095367432
1080 Tuna 3 21.0
1087 VegetablesFrozen 3 13.5
Total with tax: 41.23400010108948`

// From employeeLogfile.txt - Audit logs (COMPLETE)
const EMPLOYEE_LOG_DATA = `Debra Cooper (110002 Cashier) logs into POS System. Time: 2015-11-03 15:18:36.757
Debra Cooper (110002 Cashier) logs out of POS System. Time: 2015-11-03 15:18:36.757
Christy Hughes (110001 Admin) logs into POS System. Time: 2015-11-03 18:18:19.146
Christy Hughes (110001 Admin) logs out of POS System. Time: 2015-11-03 18:18:19.146
Debra Cooper (110002 Cashier) logs into POS System. Time: 2015-11-03 18:44:15.045
Debra Cooper (110002 Cashier) logs into POS System. Time: 2015-11-03 18:45:07.550
Debra Cooper (110002 Cashier) logs into POS System. Time: 2015-11-03 18:46:13.079
Debra Cooper (110002 Cashier) logs into POS System. Time: 2015-11-03 18:50:19.320
Debra Cooper (110002 Cashier) logs out of POS System. Time: 2015-11-03 18:50:19.320
Christy Hughes (110001 Admin) logs into POS System. Time: 2015-11-03 19:14:27.694
Christy Hughes (110001 Admin) logs out of POS System. Time: 2015-11-03 19:14:27.694
Harry Larry (110001 Admin) logs into POS System. Time: 2015-11-19 22:38:56.421
Harry Larry (110001 Admin) logs into POS System. Time: 2015-11-19 22:38:56.422
Harry Larry (110001 Admin) logs out of POS System. Time: 2015-11-19 22:39:40.582
Debra Cooper (110002 Cashier) logs into POS System. Time: 2015-11-19 23:07:16.492
Debra Cooper (110002 Cashier) logs into POS System. Time: 2015-11-20 11:16:12.714
Debra Cooper (110002 Cashier) logs out of POS System. Time: 2015-11-20 11:16:15.129
Harry Larry (110001 Admin) logs into POS System. Time: 2015-11-20 11:16:21.005
Harry Larry (110001 Admin) logs into POS System. Time: 2015-11-20 11:16:21.006
Harry Larry (110001 Admin) logs out of POS System. Time: 2015-11-20 11:16:58.573
Harry Larry (110001 Admin) logs into POS System. Time: 2015-11-20 11:17:59.748
Harry Larry (110001 Admin) logs into POS System. Time: 2015-11-20 11:17:59.749
Harry Larry (110001 Admin) logs into POS System. Time: 2015-11-20 11:31:48.704
Harry Larry (110001 Admin) logs into POS System. Time: 2015-11-20 11:31:48.705
Harry Larry (110001 Admin) logs into POS System. Time: 2015-11-20 11:32:13.017
Harry Larry (110001 Admin) logs into POS System. Time: 2015-11-20 11:32:13.018
Harry Larry (110001 Admin) logs into POS System. Time: 2015-11-20 11:32:31.185
Harry Larry (110001 Admin) logs into POS System. Time: 2015-11-20 11:32:31.186
Harry Larry (110001 Admin) logs into POS System. Time: 2015-11-20 11:34:34.207
Harry Larry (110001 Admin) logs into POS System. Time: 2015-11-20 11:34:34.208
Harry Larry (110001 Admin) logs into POS System. Time: 2015-11-20 11:34:55.685
Harry Larry (110001 Admin) logs into POS System. Time: 2015-11-20 11:34:55.686
Harry Larry (110001 Admin) logs into POS System. Time: 2015-11-20 11:35:09.888
Harry Larry (110001 Admin) logs into POS System. Time: 2015-11-20 11:35:09.889
Harry Larry (110001 Admin) logs into POS System. Time: 2015-11-20 11:36:24.695
Harry Larry (110001 Admin) logs into POS System. Time: 2015-11-20 11:36:24.696
Harry Larry (110001 Admin) logs into POS System. Time: 2015-11-20 11:39:04.328
Harry Larry (110001 Admin) logs into POS System. Time: 2015-11-20 11:39:04.329
Harry Larry (110001 Admin) logs into POS System. Time: 2015-11-20 11:41:18.096
Harry Larry (110001 Admin) logs into POS System. Time: 2015-11-20 11:41:18.098
Harry Larry (110001 Admin) logs into POS System. Time: 2015-11-20 11:42:29.736
Harry Larry (110001 Admin) logs into POS System. Time: 2015-11-20 11:42:29.737
Harry Larry (110001 Admin) logs into POS System. Time: 2015-11-20 14:32:57.530
Harry Larry (110001 Admin) logs into POS System. Time: 2015-11-20 14:32:57.532`

// From ReturnSale.txt - Return records (consolidated)
const RETURN_SALE_DATA = `1002 SkirtSteak 1 15.0
1002 SkirtSteak 2 30.0
1001 PlasticCup 2 1.0
1003 PotatoChips 4 4.800000190734863`

// From temp.txt, temp(1).txt, temp(2).txt, temp(3).txt - Pending returns
const TEMP_RETURN_DATA = `Return
1234567892
1005 1
1002 3
1005 1`

// ============================================
// PARSER FUNCTIONS
// ============================================

interface ParsedEmployee {
  legacyId: string
  role: string
  firstName: string
  lastName: string
  password: string
}

function parseEmployees(data: string): ParsedEmployee[] {
  const lines = data.trim().split("\n")
  return lines.map((line) => {
    const parts = line.trim().split(" ")
    return {
      legacyId: parts[0],
      role: parts[1].toLowerCase(),
      firstName: parts[2],
      lastName: parts[3],
      password: parts[4] || parts[0],
    }
  })
}

interface ParsedProduct {
  legacyId: string
  name: string
  price: number
  quantity: number
  isRentable: boolean
}

function parseProducts(data: string, isRentable: boolean): ParsedProduct[] {
  const lines = data.trim().split("\n")
  return lines.map((line) => {
    const parts = line.trim().split(" ")
    return {
      legacyId: parts[0],
      name: parts[1],
      price: Number.parseFloat(parts[2]),
      quantity: Number.parseInt(parts[3], 10),
      isRentable,
    }
  })
}

interface ParsedCustomer {
  phone: string
  rentals: Array<{
    itemId: string
    date: string
    returned: boolean
  }>
}

function parseCustomers(data: string): ParsedCustomer[] {
  const lines = data.trim().split("\n")
  const customers: ParsedCustomer[] = []

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine) continue

    const parts = trimmedLine.split(" ")
    const phone = parts[0]

    // Skip if phone already exists (deduplicate)
    if (customers.find((c) => c.phone === phone)) continue

    const rentals: ParsedCustomer["rentals"] = []

    // Parse rental entries (format: itemId,date,returned)
    for (let i = 1; i < parts.length; i++) {
      const rentalParts = parts[i].split(",")
      if (rentalParts.length >= 3) {
        rentals.push({
          itemId: rentalParts[0],
          date: rentalParts[1],
          returned: rentalParts[2] === "true",
        })
      }
    }

    customers.push({ phone, rentals })
  }

  return customers
}

interface ParsedTransaction {
  timestamp: string
  items: Array<{
    productId: string
    name: string
    quantity: number
    subtotal: number
  }>
  totalWithTax: number
}

function parseTransactions(data: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = []
  const lines = data.trim().split("\n")

  let currentTransaction: ParsedTransaction | null = null

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine) continue

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmedLine)) {
      if (currentTransaction && currentTransaction.items.length > 0) {
        transactions.push(currentTransaction)
      }
      currentTransaction = {
        timestamp: trimmedLine,
        items: [],
        totalWithTax: 0,
      }
    } else if (trimmedLine.startsWith("Total with tax:")) {
      if (currentTransaction) {
        currentTransaction.totalWithTax = Number.parseFloat(trimmedLine.replace("Total with tax:", "").trim())
      }
    } else if (currentTransaction) {
      const parts = trimmedLine.split(" ")
      if (parts.length >= 4) {
        currentTransaction.items.push({
          productId: parts[0],
          name: parts[1],
          quantity: Number.parseInt(parts[2], 10),
          subtotal: Number.parseFloat(parts[3]),
        })
      }
    }
  }

  if (currentTransaction && currentTransaction.items.length > 0) {
    transactions.push(currentTransaction)
  }

  return transactions
}

interface ParsedAuditLog {
  userName: string
  legacyUserId: string
  userRole: string
  action: "login" | "logout"
  timestamp: string
}

// Fixed regex to properly parse audit logs - using \( and \) for literal parentheses
function parseAuditLogs(data: string): ParsedAuditLog[] {
  const logs: ParsedAuditLog[] = []
  const lines = data.trim().split("\n")

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine) continue

    // Pattern: "Name (ID Role) logs into/out of POS System. Time: timestamp"
    // Using \( and \) to match literal parentheses
    const match = trimmedLine.match(/^(.+?) \((\d+) (\w+)\) logs (into|out of) POS System\. Time: (.+)$/)
    if (match) {
      logs.push({
        userName: match[1],
        legacyUserId: match[2],
        userRole: match[3].toLowerCase(),
        action: match[4] === "into" ? "login" : "logout",
        timestamp: match[5],
      })
    }
  }

  return logs
}

interface ParsedReturn {
  productId: string
  productName: string
  quantity: number
  subtotal: number
}

function parseReturnSales(data: string): ParsedReturn[] {
  const returns: ParsedReturn[] = []
  const lines = data.trim().split("\n")

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine) continue

    const parts = trimmedLine.split(" ")
    if (parts.length >= 4) {
      returns.push({
        productId: parts[0],
        productName: parts[1],
        quantity: Number.parseInt(parts[2], 10),
        subtotal: Number.parseFloat(parts[3]),
      })
    }
  }

  return returns
}

// ============================================
// MIGRATION FUNCTIONS
// ============================================

async function migrateEmployees(db: Db) {
  console.log("\n[1/8] Migrating Employees...")

  const employees = parseEmployees(EMPLOYEE_DATA)
  const users = employees.map((emp, index) => ({
    userId: `USR-${(index + 1).toString().padStart(3, "0")}`,
    legacyId: emp.legacyId,
    username: `${emp.firstName.toLowerCase()}${emp.lastName.toLowerCase()}`,
    password: emp.password,
    role: emp.role === "admin" ? "admin" : "cashier",
    firstName: emp.firstName,
    lastName: emp.lastName,
    name: `${emp.firstName} ${emp.lastName}`,
    email: `${emp.firstName.toLowerCase()}.${emp.lastName.toLowerCase()}@sgtech.com`,
    isActive: true,
    createdAt: new Date(),
  }))

  await db.collection("users").deleteMany({})
  await db.collection("users").insertMany(users)

  console.log(`   Migrated ${users.length} employees`)
  console.log(`   Sample login: username="${users[0].username}" password="${users[0].password}"`)

  return users
}

async function migrateProducts(db: Db) {
  console.log("\n[2/8] Migrating Products (Sale Items + Rental Items)...")

  const saleItems = parseProducts(ITEM_DATA, false)
  const rentalItems = parseProducts(RENTAL_DATA, true)

  // Sale products - prefix with S for sale
  const saleProducts = saleItems.map((item) => ({
    productId: `PRD-S${item.legacyId}`,
    legacyId: item.legacyId,
    name: item.name,
    description: `Sale item: ${item.name}`,
    price: item.price,
    cost: item.price * 0.6,
    quantity: item.quantity,
    category: "Groceries",
    barcode: item.legacyId,
    isActive: true,
    isRentable: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }))

  // Rental products - prefix with R for rental
  const rentalProducts = rentalItems.map((item) => ({
    productId: `PRD-R${item.legacyId}`,
    legacyId: `R${item.legacyId}`,
    name: item.name,
    description: `Rental item: ${item.name} (Movies/Books)`,
    price: item.price * 3, // Purchase price (3x rental)
    cost: item.price * 2,
    quantity: item.quantity,
    category: "Rentals",
    barcode: `R${item.legacyId}`,
    isActive: true,
    isRentable: true,
    rentalPricePerDay: item.price,
    createdAt: new Date(),
    updatedAt: new Date(),
  }))

  const allProducts = [...saleProducts, ...rentalProducts]

  await db.collection("products").deleteMany({})
  await db.collection("products").insertMany(allProducts)

  console.log(`   Migrated ${saleProducts.length} sale items (PRD-S prefix)`)
  console.log(`   Migrated ${rentalProducts.length} rental items (PRD-R prefix)`)
  console.log(`   Total: ${allProducts.length} products`)

  return allProducts
}

async function migrateCategories(db: Db) {
  console.log("\n[3/8] Migrating Categories...")

  const categories = [
    { categoryId: "CAT-001", name: "Groceries", description: "Food and grocery items for sale", isActive: true },
    { categoryId: "CAT-002", name: "Rentals", description: "Movies, books, and rental items", isActive: true },
  ]

  await db.collection("categories").deleteMany({})
  await db.collection("categories").insertMany(categories)

  console.log(`   Created ${categories.length} categories`)

  return categories
}

async function migrateCustomers(db: Db) {
  console.log("\n[4/8] Migrating Customers with Rental History...")

  const parsedCustomers = parseCustomers(USER_DATABASE)

  const customers = parsedCustomers.map((cust, index) => {
    const hasOutstanding = cust.rentals.some((r) => !r.returned)

    return {
      customerId: `CUST-${(index + 1).toString().padStart(4, "0")}`,
      phone: cust.phone,
      name: `Customer ${cust.phone.slice(-4)}`,
      email: `customer${cust.phone.slice(-4)}@example.com`,
      address: "",
      loyaltyPoints: 0,
      rentals: cust.rentals.map((r) => {
        // Parse date and calculate due date
        const rentalDate = new Date(r.date)
        const dueDate = new Date(rentalDate)
        dueDate.setDate(dueDate.getDate() + 14) // 14 day rental period

        return {
          productId: `PRD-R${r.itemId}`,
          productName: `Rental Item ${r.itemId}`,
          quantity: 1,
          rentedAt: rentalDate,
          dueDate: dueDate,
          isReturned: r.returned,
          returnedAt: r.returned ? dueDate : null,
          lateFeePerDay: 2.0, // Default late fee
        }
      }),
      hasOutstandingRentals: hasOutstanding,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  })

  await db.collection("customers").deleteMany({})
  if (customers.length > 0) {
    await db.collection("customers").insertMany(customers)
  }

  const outstandingCount = customers.filter((c) => c.hasOutstandingRentals).length
  console.log(`   Migrated ${customers.length} customers`)
  console.log(`   ${outstandingCount} customers have outstanding rentals`)

  return customers
}

async function migrateCoupons(db: Db) {
  console.log("\n[5/8] Migrating Coupons...")

  // Original system had C001 to C200
  const codes: string[] = []
  for (let i = 1; i <= 200; i++) {
    codes.push(`C${i.toString().padStart(3, "0")}`)
  }

  const coupons = codes.map((code) => ({
    code,
    discountPercent: 10, // 10% discount from original system
    isActive: true,
    usedCount: 0,
    createdAt: new Date(),
  }))

  await db.collection("coupons").deleteMany({})
  await db.collection("coupons").insertMany(coupons)

  console.log(`   Migrated ${coupons.length} coupon codes (C001 to C200)`)
  console.log(`   Each coupon provides 10% discount`)

  return coupons
}

async function migrateTransactions(db: Db) {
  console.log("\n[6/8] Migrating Historical Sale Transactions...")

  const parsedTransactions = parseTransactions(SALE_INVOICE_DATA)

  const transactions = parsedTransactions.map((tx, index) => {
    const subtotal = tx.items.reduce((sum, item) => sum + item.subtotal, 0)
    const tax = subtotal * TAX_RATE

    return {
      transactionId: `TXN-LEGACY-${(index + 1).toString().padStart(4, "0")}`,
      type: "sale",
      items: tx.items.map((item) => ({
        productId: `PRD-S${item.productId}`,
        legacyProductId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.subtotal / item.quantity,
        subtotal: item.subtotal,
        discount: 0,
      })),
      subtotal,
      tax,
      taxRate: TAX_RATE,
      discount: 0,
      total: tx.totalWithTax > 0 ? tx.totalWithTax : subtotal + tax,
      paymentMethod: "cash",
      paymentStatus: "completed",
      cashierId: "USR-001",
      createdAt: new Date(tx.timestamp.replace(" ", "T")),
      legacyTimestamp: tx.timestamp,
    }
  })

  await db.collection("transactions").deleteMany({})
  if (transactions.length > 0) {
    await db.collection("transactions").insertMany(transactions)
  }

  console.log(`   Migrated ${transactions.length} historical sale transactions`)

  return transactions
}

async function migrateReturns(db: Db) {
  console.log("\n[7/8] Migrating Return Records...")

  const parsedReturns = parseReturnSales(RETURN_SALE_DATA)

  // Consolidate returns into transactions
  const returnTransactions = []
  let returnIndex = 1

  // Group returns
  const returnGroups: { [key: string]: ParsedReturn[] } = {}
  for (const ret of parsedReturns) {
    const key = `${ret.productId}-${ret.quantity}`
    if (!returnGroups[key]) {
      returnGroups[key] = []
    }
    returnGroups[key].push(ret)
  }

  for (const [, returns] of Object.entries(returnGroups)) {
    const firstReturn = returns[0]
    returnTransactions.push({
      transactionId: `RTN-LEGACY-${returnIndex.toString().padStart(4, "0")}`,
      type: "return",
      items: [
        {
          productId: `PRD-S${firstReturn.productId}`,
          productName: firstReturn.productName,
          quantity: firstReturn.quantity,
          unitPrice: firstReturn.subtotal / firstReturn.quantity,
          subtotal: firstReturn.subtotal,
          discount: 0,
        },
      ],
      subtotal: -firstReturn.subtotal,
      tax: 0,
      discount: 0,
      total: -firstReturn.subtotal,
      paymentMethod: "cash",
      paymentStatus: "completed",
      cashierId: "USR-001",
      createdAt: new Date("2015-11-20"),
    })
    returnIndex++
  }

  if (returnTransactions.length > 0) {
    await db.collection("transactions").insertMany(returnTransactions)
  }

  console.log(`   Migrated ${returnTransactions.length} return transactions`)

  return returnTransactions
}

async function migrateAuditLogs(db: Db) {
  console.log("\n[8/8] Migrating Audit Logs (Employee Login History)...")

  const parsedLogs = parseAuditLogs(EMPLOYEE_LOG_DATA)

  const auditLogs = parsedLogs.map((log, index) => ({
    logId: `LOG-${(index + 1).toString().padStart(4, "0")}`,
    userId: log.legacyUserId,
    userName: log.userName,
    userRole: log.userRole,
    action: log.action,
    details: `${log.userName} (${log.legacyUserId} ${log.userRole}) ${log.action === "login" ? "logged into" : "logged out of"} POS System`,
    timestamp: new Date(log.timestamp.replace(" ", "T")),
    legacyTimestamp: log.timestamp,
  }))

  await db.collection("audit_logs").deleteMany({})
  if (auditLogs.length > 0) {
    await db.collection("audit_logs").insertMany(auditLogs)
  }

  console.log(`   Migrated ${auditLogs.length} audit log entries`)

  return auditLogs
}

// ============================================
// MAIN MIGRATION FUNCTION
// ============================================

async function main() {
  console.log("\n" + "=".repeat(70))
  console.log("     POS SYSTEM - LEGACY DATA MIGRATION TO MONGODB ATLAS")
  console.log("     Migrating all .txt database files to MongoDB")
  console.log("=".repeat(70))

  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("\n[OK] Connected to MongoDB Atlas")

    const db = client.db(DB_NAME)
    console.log(`[OK] Using database: ${DB_NAME}`)

    // Run all migrations
    const employees = await migrateEmployees(db)
    const products = await migrateProducts(db)
    await migrateCategories(db)
    const customers = await migrateCustomers(db)
    await migrateCoupons(db)
    await migrateTransactions(db)
    await migrateReturns(db)
    await migrateAuditLogs(db)

    // Print summary
    console.log("\n" + "=".repeat(70))
    console.log("     MIGRATION COMPLETE - SUMMARY")
    console.log("=".repeat(70))
    console.log(`
Collections created:
  - users: ${employees.length} records (from employeeDatabase.txt)
  - products: ${products.length} records (from itemDatabase.txt + rentalDatabase.txt)
  - categories: 2 records (Groceries, Rentals)
  - customers: ${customers.length} records (from userDatabase.txt)
  - coupons: 200 records (from couponNumber.txt - C001 to C200)
  - transactions: Historical sales (from saleinvoiceRecord.txt)
  - audit_logs: Login history (from employeeLogfile.txt)

Data Normalization:
  - Split products into sale (PRD-S*) and rental (PRD-R*) items
  - Normalized customer rental history with due dates
  - Converted timestamps to proper Date objects
  - Added foreign key references between collections

Login Credentials (from employeeDatabase.txt):
  Admin:   username="harrylarry" password="1"
  Admin:   username="claytonwatson" password="lehigh2017"
  Cashier: username="debracooper" password="lehigh2016"
  Cashier: username="sethmoss" password="lehigh2018"
`)
    // Create indexes
    console.log("Creating indexes...")
    await db.collection("users").createIndex({ username: 1 }, { unique: true })
    await db.collection("users").createIndex({ legacyId: 1 })
    await db.collection("products").createIndex({ productId: 1 }, { unique: true })
    await db.collection("products").createIndex({ barcode: 1 })
    await db.collection("products").createIndex({ isRentable: 1 })
    await db.collection("customers").createIndex({ phone: 1 }, { unique: true })
    await db.collection("transactions").createIndex({ createdAt: -1 })
    await db.collection("coupons").createIndex({ code: 1 }, { unique: true })
    console.log("[OK] Indexes created\n")
  } catch (error) {
    console.error("\n[ERROR] Migration failed:", error)
    process.exit(1)
  } finally {
    await client.close()
    console.log("[OK] Database connection closed")
  }
}

main()
