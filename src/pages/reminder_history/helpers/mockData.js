// Toggle this flag to switch between mock data and real API
export const IS_TESTING = false;

// Mock data for reminder history list
export const MOCK_REMINDER_HISTORY = [
  {
    _id: "67f8a1b2c3d4e5f6a7b8c9d0",
    channel: "email",
    templateName: "Friendly Reminder",
    subject: "Don't forget your items!",
    totalRecipients: 50,
    successCount: 47,
    failedCount: 2,
    pendingCount: 1,
    status: "completed",
    sentBy: {
      name: "Admin User",
      email: "admin@petcaart.com"
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    _id: "67f8a1b2c3d4e5f6a7b8c9d1",
    channel: "whatsapp",
    templateName: "Cart Reminder",
    subject: null,
    totalRecipients: 35,
    successCount: 35,
    failedCount: 0,
    pendingCount: 0,
    status: "completed",
    sentBy: {
      name: "Marketing Team",
      email: "marketing@petcaart.com"
    },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
  {
    _id: "67f8a1b2c3d4e5f6a7b8c9d2",
    channel: "sms",
    templateName: "Short Reminder",
    subject: null,
    totalRecipients: 100,
    successCount: 85,
    failedCount: 15,
    pendingCount: 0,
    status: "partial",
    sentBy: {
      name: "Admin User",
      email: "admin@petcaart.com"
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    _id: "67f8a1b2c3d4e5f6a7b8c9d3",
    channel: "email",
    templateName: "Special Discount",
    subject: "Special 10% OFF on your cart!",
    totalRecipients: 75,
    successCount: 72,
    failedCount: 3,
    pendingCount: 0,
    status: "completed",
    sentBy: {
      name: "Sales Team",
      email: "sales@petcaart.com"
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    _id: "67f8a1b2c3d4e5f6a7b8c9d4",
    channel: "email",
    templateName: "Urgent Reminder",
    subject: "Your cart is waiting - Limited stock!",
    totalRecipients: 60,
    successCount: 0,
    failedCount: 60,
    pendingCount: 0,
    status: "failed",
    sentBy: {
      name: "Admin User",
      email: "admin@petcaart.com"
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    _id: "67f8a1b2c3d4e5f6a7b8c9d5",
    channel: "whatsapp",
    templateName: "Personalized Message",
    subject: null,
    totalRecipients: 45,
    successCount: 30,
    failedCount: 0,
    pendingCount: 15,
    status: "processing",
    sentBy: {
      name: "Marketing Team",
      email: "marketing@petcaart.com"
    },
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
  },
];

// Mock data for individual reminder history detail
export const MOCK_REMINDER_DETAILS = {
  "67f8a1b2c3d4e5f6a7b8c9d0": {
    _id: "67f8a1b2c3d4e5f6a7b8c9d0",
    channel: "email",
    templateName: "Friendly Reminder",
    subject: "Don't forget your items!",
    totalRecipients: 50,
    successCount: 47,
    failedCount: 2,
    pendingCount: 1,
    status: "completed",
    sentBy: {
      name: "Admin User",
      email: "admin@petcaart.com"
    },
    messagePreview: `Hi {{name}},

We noticed you left {{itemCount}} items in your cart worth {{totalAmount}}.

Don't miss out on these great products! Complete your purchase now and get them delivered to your doorstep.

Your Cart Items:
{{itemsList}}

Click here to complete your purchase: {{checkoutLink}}

Best regards,
Pet Caart Team`,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    recipients: [
      {
        userId: {
          _id: "user001",
          name: "Parth Panjwani",
          email: "parthpanjwani9@gmail.com",
          phoneNumber: "7817884143"
        },
        cartValue: 2724,
        itemCount: 7,
        status: "sent",
        deliveryStatus: "Delivered successfully",
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: {
          _id: "user002",
          name: "Kashif Deshmukh",
          email: "kashif@gmail.com",
          phoneNumber: "9876543210"
        },
        cartValue: 1333,
        itemCount: 2,
        status: "sent",
        deliveryStatus: "Delivered successfully",
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: {
          _id: "user003",
          name: "Test App",
          email: "kaam25@gmail.com",
          phoneNumber: "8298257542"
        },
        cartValue: 3999,
        itemCount: 2,
        status: "failed",
        errorMessage: "Invalid email address",
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: {
          _id: "user004",
          name: "Farish Jamal",
          email: "farishjamal98@gmail.com",
          phoneNumber: "7763868786"
        },
        cartValue: 2210,
        itemCount: 5,
        status: "sent",
        deliveryStatus: "Delivered successfully",
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: {
          _id: "user005",
          name: "Test User 5",
          email: "test5@gmail.com",
          phoneNumber: "5555555555"
        },
        cartValue: 2208,
        itemCount: 1,
        status: "pending",
        deliveryStatus: "Queued for delivery",
        sentAt: null,
      },
    ],
  },
  "67f8a1b2c3d4e5f6a7b8c9d1": {
    _id: "67f8a1b2c3d4e5f6a7b8c9d1",
    channel: "whatsapp",
    templateName: "Cart Reminder",
    subject: null,
    totalRecipients: 35,
    successCount: 35,
    failedCount: 0,
    pendingCount: 0,
    status: "completed",
    sentBy: {
      name: "Marketing Team",
      email: "marketing@petcaart.com"
    },
    messagePreview: "🛒 Hi {{name}}! You have {{itemCount}} items waiting in your cart ({{totalAmount}}). Complete your order: {{link}}",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    recipients: [
      {
        userId: {
          _id: "user006",
          name: "John Doe",
          email: "john@example.com",
          phoneNumber: "9999999999"
        },
        cartValue: 1500,
        itemCount: 3,
        status: "sent",
        deliveryStatus: "Message read",
        sentAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: {
          _id: "user007",
          name: "Jane Smith",
          email: "jane@example.com",
          phoneNumber: "8888888888"
        },
        cartValue: 2500,
        itemCount: 5,
        status: "sent",
        deliveryStatus: "Message delivered",
        sentAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  "67f8a1b2c3d4e5f6a7b8c9d2": {
    _id: "67f8a1b2c3d4e5f6a7b8c9d2",
    channel: "sms",
    templateName: "Short Reminder",
    subject: null,
    totalRecipients: 100,
    successCount: 85,
    failedCount: 15,
    pendingCount: 0,
    status: "partial",
    sentBy: {
      name: "Admin User",
      email: "admin@petcaart.com"
    },
    messagePreview: "Hi {{name}}, you left {{itemCount}} items worth {{totalAmount}} in your cart. Complete now: {{link}}",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    recipients: Array.from({ length: 20 }, (_, i) => ({
      userId: {
        _id: `user${100 + i}`,
        name: `Customer ${i + 1}`,
        email: `customer${i + 1}@example.com`,
        phoneNumber: `98${String(i).padStart(8, '0')}`
      },
      cartValue: Math.floor(Math.random() * 5000) + 500,
      itemCount: Math.floor(Math.random() * 10) + 1,
      status: i < 17 ? "sent" : "failed",
      deliveryStatus: i < 17 ? "Delivered" : "Network error",
      errorMessage: i >= 17 ? "SMS delivery failed - network issue" : null,
      sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    })),
  },
  "67f8a1b2c3d4e5f6a7b8c9d3": {
    _id: "67f8a1b2c3d4e5f6a7b8c9d3",
    channel: "email",
    templateName: "Special Discount",
    subject: "Special 10% OFF on your cart!",
    totalRecipients: 75,
    successCount: 72,
    failedCount: 3,
    pendingCount: 0,
    status: "completed",
    sentBy: {
      name: "Sales Team",
      email: "sales@petcaart.com"
    },
    messagePreview: `Hi {{name}},

Great news! We're offering you a special 10% discount on your abandoned cart.

Original Total: {{totalAmount}}
After Discount: {{discountedAmount}}

Your Cart:
{{itemsList}}

Use code: COMPLETE10

Complete your purchase: {{checkoutLink}}

Offer valid for 24 hours only!

Pet Caart Team`,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    recipients: Array.from({ length: 15 }, (_, i) => ({
      userId: {
        _id: `user${200 + i}`,
        name: `Buyer ${i + 1}`,
        email: `buyer${i + 1}@example.com`,
        phoneNumber: `97${String(i).padStart(8, '0')}`
      },
      cartValue: Math.floor(Math.random() * 8000) + 1000,
      itemCount: Math.floor(Math.random() * 15) + 1,
      status: i < 14 ? "sent" : "failed",
      deliveryStatus: i < 14 ? "Email opened" : "Bounce - invalid email",
      errorMessage: i >= 14 ? "Invalid email address" : null,
      sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    })),
  },
  "67f8a1b2c3d4e5f6a7b8c9d4": {
    _id: "67f8a1b2c3d4e5f6a7b8c9d4",
    channel: "email",
    templateName: "Urgent Reminder",
    subject: "Your cart is waiting - Limited stock!",
    totalRecipients: 60,
    successCount: 0,
    failedCount: 60,
    pendingCount: 0,
    status: "failed",
    sentBy: {
      name: "Admin User",
      email: "admin@petcaart.com"
    },
    messagePreview: `Hi {{name}},

HURRY! The items in your cart are in high demand and stock is running low.

Cart Total: {{totalAmount}}
Items: {{itemCount}}

{{itemsList}}

Don't miss out - complete your purchase now before they're gone!

{{checkoutLink}}

Pet Caart Team`,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    recipients: Array.from({ length: 10 }, (_, i) => ({
      userId: {
        _id: `user${300 + i}`,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        phoneNumber: `96${String(i).padStart(8, '0')}`
      },
      cartValue: Math.floor(Math.random() * 6000) + 800,
      itemCount: Math.floor(Math.random() * 12) + 1,
      status: "failed",
      deliveryStatus: "Server error",
      errorMessage: "SMTP server connection timeout",
      sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    })),
  },
  "67f8a1b2c3d4e5f6a7b8c9d5": {
    _id: "67f8a1b2c3d4e5f6a7b8c9d5",
    channel: "whatsapp",
    templateName: "Personalized Message",
    subject: null,
    totalRecipients: 45,
    successCount: 30,
    failedCount: 0,
    pendingCount: 15,
    status: "processing",
    sentBy: {
      name: "Marketing Team",
      email: "marketing@petcaart.com"
    },
    messagePreview: "Hey {{name}}! 🐾 Your pets are waiting! Complete your {{totalAmount}} order and get free delivery. {{link}}",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    recipients: Array.from({ length: 10 }, (_, i) => ({
      userId: {
        _id: `user${400 + i}`,
        name: `Pet Owner ${i + 1}`,
        email: `petowner${i + 1}@example.com`,
        phoneNumber: `95${String(i).padStart(8, '0')}`
      },
      cartValue: Math.floor(Math.random() * 4000) + 600,
      itemCount: Math.floor(Math.random() * 8) + 1,
      status: i < 7 ? "sent" : "pending",
      deliveryStatus: i < 7 ? "Message delivered" : "In queue",
      sentAt: i < 7 ? new Date(Date.now() - 30 * 60 * 1000).toISOString() : null,
    })),
  },
};

// Helper function to get mock history list with pagination
export const getMockHistoryList = ({ params }) => {
  const { page = 1, per_page = 25, search = "", start_date, end_date } = params;
  
  let filteredHistory = [...MOCK_REMINDER_HISTORY];
  
  // Filter by search
  if (search) {
    filteredHistory = filteredHistory.filter(item => 
      item.templateName.toLowerCase().includes(search.toLowerCase()) ||
      item.channel.toLowerCase().includes(search.toLowerCase()) ||
      (item.subject && item.subject.toLowerCase().includes(search.toLowerCase()))
    );
  }
  
  // Filter by date range
  if (start_date && end_date) {
    filteredHistory = filteredHistory.filter(item => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= new Date(start_date) && itemDate <= new Date(end_date);
    });
  }
  
  const total = filteredHistory.length;
  const startIndex = (page - 1) * per_page;
  const endIndex = startIndex + per_page;
  const paginatedData = filteredHistory.slice(startIndex, endIndex);
  
  return {
    history: paginatedData,
    total,
  };
};

// Helper function to get mock history detail
export const getMockHistoryDetail = (id) => {
  return MOCK_REMINDER_DETAILS[id] || null;
};

