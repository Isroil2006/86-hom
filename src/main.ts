//@ts-nocheck

enum ProductCategory {
  ELECTRONICS = "elektronika",
  CLOTHING = "kiyim-kechak",
  BOOKS = "kitoblar",
  FOOD = "oziq-ovqat",
  HOME = "uy-ro'zg'or buyumlari",
}

enum OrderStatus {
  PENDING = "kutilmoqda",
  PROCESSING = "qayta ishlanmoqda",
  SHIPPED = "yuborilgan",
  DELIVERED = "yetkazilgan",
  CANCELLED = "bekor qilingan",
}

enum PaymentMethod {
  CARD = "plastik karta",
  CASH = "naqd pul",
  BANK_TRANSFER = "bank o'tkazmasi",
  DIGITAL_WALLET = "raqamli hamyon",
}

enum PaymentStatus {
  PENDING = "kutilmoqda",
  COMPLETED = "yakunlangan",
  FAILED = "muvaffaqiyatsiz",
  REFUNDED = "qaytarilgan",
}

interface OrderItem {
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface SearchResult {
  products: Product[];
  totalCount: number;
  searchTime: number;
}

interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

class Product {
  constructor(public id: number, public name: string, public price: number, public stock: number, public category: ProductCategory) {}

  updatePrice(newPrice: number) {
    if (newPrice > 0) this.price = newPrice;
  }
  addStock(quantity: number) {
    if (quantity > 0) this.stock += quantity;
  }
  reduceStock(quantity: number) {
    if (quantity > 0) this.stock -= quantity;
  }
  isAvailable(): boolean {
    return this.stock > 0;
  }
}

class Customer {
  orders: Order[] = [];

  constructor(public customerId: number, public fullName: string, public email: string, public phoneNumber: string, public bonusPoints: number = 0) {}

  addBonusPoints(points: number) {
    if (points > 0) this.bonusPoints += points;
  }
  useBonusPoints(points: number) {
    if (points > 0 && this.bonusPoints >= points) this.bonusPoints -= points;
  }
  updateContactInfo(email: any, phone: number) {
    this.email = email;
    this.phoneNumber = phone;
  }
  getTotalOrders() {
    return this.orders.length;
  }
}

class Order {
  orderItems: OrderItem[] = [];
  orderStatus: OrderStatus = OrderStatus.PENDING;

  constructor(public orderId: number, public customer: Customer) {}

  addItem(product: Product, quantity: number) {
    if (product.isAvailable() && quantity <= product.stock) {
      const unitPrice = product.price;
      const totalPrice = unitPrice * quantity;

      this.orderItems.push({
        productId: product.id,
        quantity,
        unitPrice,
        totalPrice,
      });

      product.reduceStock(quantity); 
    }
  }

  calculateTotal(): number {
    let total = 0;
    for (let item of this.orderItems) {
      total += item.totalPrice;
    }
    return total;
  }

  updateStatus(newStatus: OrderStatus) {
    this.orderStatus = newStatus;
  }
}

class Shop {
  products: Product[] = [];
  customers: Customer[] = [];
  orders: Order[] = [];

  constructor(public shopName: string) {}

  addProduct(product: Product) {
    if (!this.products.find((p) => p.id === product.id)) {
      this.products.push(product);
    }
  }

  registerCustomer(customer: Customer) {
    if (!this.customers.find((c) => c.email === customer.email)) {
      this.customers.push(customer);
    }
  }

  processOrder(order: Order) {
    if (order.orderItems.length > 0) {
      this.orders.push(order);
      order.customer.orders.push(order);
    }
  }
}

class Payment {
  paymentStatus: PaymentStatus = PaymentStatus.PENDING;

  constructor(public paymentId: number, public order: Order, public paymentMethod: PaymentMethod, public amount: number) {}

  processPayment() {
    if (this.amount > 0) {
      this.paymentStatus = PaymentStatus.COMPLETED;
    }
  }

  refundPayment() {
    if (this.paymentStatus === PaymentStatus.COMPLETED) {
      this.paymentStatus = PaymentStatus.REFUNDED;
    }
  }

  validatePayment(): boolean {
    return this.amount > 0;
  }

  generateReceipt(): string | null {
    if (this.paymentStatus === PaymentStatus.COMPLETED) {
      return `Receipt: Payment #${this.paymentId} for Order #${this.order.orderId}`;
    }
    return null;
  }
}

const myShop = new Shop("Isroil Store");

const iphone = new Product(1, "iPhone 15", 15000000, 10, ProductCategory.ELECTRONICS);
const tshirt = new Product(2, "White T-shirt", 100000, 20, ProductCategory.CLOTHING);
const bread = new Product(3, "Non", 3000, 50, ProductCategory.FOOD);

myShop.addProduct(iphone);
myShop.addProduct(tshirt);
myShop.addProduct(bread);

const customer1 = new Customer(101, "Marko", "mark@mail.com", "+998901234567");

myShop.registerCustomer(customer1);

const order1 = new Order(1, customer1);

order1.addItem(iphone, 1);
order1.addItem(tshirt, 2);
order1.addItem(bread, 3);

myShop.processOrder(order1);

console.log("Buyurtma summasi:", order1.calculateTotal(), "so'm");

order1.updateStatus(OrderStatus.PROCESSING);
console.log("Buyurtma holati:", order1.orderStatus);

const payment1 = new Payment(5001, order1, PaymentMethod.CARD, order1.calculateTotal());
payment1.processPayment();
console.log("To'lov holati:", payment1.paymentStatus);

const receipt = payment1.generateReceipt();
if (receipt) {
  console.log(receipt);
}

console.log("Mijozning jami buyurtmalari:", customer1.getTotalOrders());
