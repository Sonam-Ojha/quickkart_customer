export interface InfoSection {
  heading: string
  body: string
}

export interface InfoPage {
  title: string
  subtitle: string
  emoji: string
  sections: InfoSection[]
}

export const infoPages: Record<string, InfoPage> = {

  'about-us': {
    title: 'About QuickKart',
    subtitle: 'Delivering happiness in 10 minutes',
    emoji: '🛒',
    sections: [
      {
        heading: 'Who We Are',
        body: 'QuickKart is India\'s fastest growing quick-commerce platform, delivering groceries, fresh produce, daily essentials, and even printouts right to your doorstep in 10 minutes. Founded in 2024, we operate across major cities with a mission to make everyday shopping effortless.',
      },
      {
        heading: 'Our Mission',
        body: 'We believe your time is precious. Our mission is simple — get you what you need, when you need it, without stepping out. From fresh vegetables to medicines to office printouts, QuickKart is your one-stop neighborhood store, open 24x7.',
      },
      {
        heading: 'Our Numbers',
        body: '30,000+ products · 50+ dark stores · 1 lakh+ happy customers · 10-minute average delivery time · Available in Noida, Delhi NCR, Mumbai, Bangalore and expanding fast.',
      },
      {
        heading: 'Our Values',
        body: 'Speed, Freshness, and Trust. We source directly from local farms and trusted brands. Every product is quality-checked before it reaches you. We\'re committed to zero-waste packaging and supporting local vendors.',
      },
    ],
  },

  'careers': {
    title: 'Careers at QuickKart',
    subtitle: 'Join us and build the future of quick commerce',
    emoji: '💼',
    sections: [
      {
        heading: 'Why QuickKart?',
        body: 'We move fast — literally and figuratively. At QuickKart, you\'ll work on problems that matter to millions of people every day. We offer competitive salaries, equity, flexible work, and a team that loves what it does.',
      },
      {
        heading: 'Open Roles',
        body: 'Software Engineer (Backend / Frontend / Mobile) · Product Manager · Data Analyst · Operations Manager · Dark Store Executive · Delivery Partner · Marketing Lead · Customer Support Associate',
      },
      {
        heading: 'Our Culture',
        body: 'We are a diverse, inclusive, and flat organization. We believe the best ideas can come from anyone — a delivery partner or the CTO. We celebrate wins, learn from failures, and always put the customer first.',
      },
      {
        heading: 'How to Apply',
        body: 'Send your resume to careers@quickkart.in with the role name in the subject line. We typically respond within 3 business days. We do not charge any application fees.',
      },
    ],
  },

  'blog': {
    title: 'QuickKart Blog',
    subtitle: 'Tips, news & stories from our kitchen',
    emoji: '📝',
    sections: [
      {
        heading: '🥗 5 Healthy Breakfast Ideas Under ₹50',
        body: 'Start your mornings right without burning a hole in your pocket. We\'ve curated 5 nutritious breakfast recipes using everyday ingredients available on QuickKart — all under ₹50 per serving.',
      },
      {
        heading: '🚀 How We Deliver in 10 Minutes',
        body: 'Ever wondered how your groceries reach your door in just 10 minutes? We take you behind the scenes of our dark store model, route optimization algorithms, and the dedicated delivery partners who make it happen.',
      },
      {
        heading: '🌾 Farm to Doorstep: Our Fresh Produce Story',
        body: 'QuickKart partners with 200+ local farmers across Haryana, UP and Maharashtra. Here\'s how we ensure your vegetables are picked fresh in the morning and delivered the same day.',
      },
      {
        heading: '🖨️ Introducing QuickPrints — Documents in 25 Minutes',
        body: 'Need to print an important document urgently? QuickPrints is our newest service — upload your file, choose paper size and quantity, and receive printed copies at your door in under 25 minutes.',
      },
    ],
  },

  'press': {
    title: 'Press & Media',
    subtitle: 'QuickKart in the news',
    emoji: '📰',
    sections: [
      {
        heading: 'Press Releases',
        body: '📅 June 2026 — QuickKart raises ₹150 Cr Series B funding led by Tiger Global\n📅 March 2026 — QuickKart launches QuickPrints service across Delhi NCR\n📅 January 2026 — QuickKart crosses 1 lakh monthly orders in Noida alone',
      },
      {
        heading: 'Media Coverage',
        body: 'QuickKart has been featured in Economic Times, YourStory, Inc42, The Hindu BusinessLine, and NDTV Profit. Our founders have appeared on Shark Tank India Season 4.',
      },
      {
        heading: 'Awards & Recognition',
        body: '🏆 Best Quick Commerce Startup — Startup India Awards 2025\n🏆 Most Innovative Logistics — CII National Awards 2026\n🏆 Best Customer Experience — Retail India Summit 2025',
      },
      {
        heading: 'Media Contact',
        body: 'For press inquiries, interviews, and media kits, please reach out to our PR team at press@quickkart.in. We typically respond within 24 hours on business days.',
      },
    ],
  },

  'faq': {
    title: 'Frequently Asked Questions',
    subtitle: 'Got questions? We have answers.',
    emoji: '❓',
    sections: [
      {
        heading: 'How fast is the delivery?',
        body: 'We deliver in 10 minutes on average for orders within our serviceable area. In some cases during peak hours or bad weather, it may take up to 20 minutes. You can track your order in real time once placed.',
      },
      {
        heading: 'What is the minimum order value?',
        body: 'There is no minimum order value. You can order even a single item. However, delivery fee of ₹25 applies for orders below ₹99. Orders above ₹99 get free delivery.',
      },
      {
        heading: 'How do I pay?',
        body: 'We accept UPI (PhonePe, GPay, Paytm), credit/debit cards, net banking, and Cash on Delivery. You can also use QuickKart Wallet balance or referral credits.',
      },
      {
        heading: 'Can I cancel my order?',
        body: 'You can cancel your order within 2 minutes of placing it. After that, the order is already being packed and cannot be cancelled. For issues post-delivery, please use our Returns & Refunds process.',
      },
      {
        heading: 'What if an item is missing or damaged?',
        body: 'We\'re sorry! Report it through the app within 24 hours of delivery. We will issue an instant refund to your QuickKart Wallet or original payment method within 24-48 hours.',
      },
    ],
  },

  'track-order': {
    title: 'Track Your Order',
    subtitle: 'Know where your order is, every step of the way',
    emoji: '📦',
    sections: [
      {
        heading: 'How to Track',
        body: 'Once you place an order, you will receive a confirmation SMS and email with your Order ID. Use that ID in the tracking section of your profile, or click the tracking link in your SMS/email.',
      },
      {
        heading: 'Order Status Explained',
        body: '✅ Order Placed — We have received your order\n🏪 Being Packed — Our team is picking your items\n🛵 Out for Delivery — Your delivery partner is on the way\n✅ Delivered — Order delivered successfully',
      },
      {
        heading: 'Live Tracking',
        body: 'Once your delivery partner picks up your order, you can see their live location on the map inside the QuickKart app. SMS updates are also sent at each stage.',
      },
      {
        heading: 'Delivery Partner Contact',
        body: 'You can call or WhatsApp your delivery partner directly once the order is out for delivery. Their number is visible on the tracking screen.',
      },
    ],
  },

  'returns': {
    title: 'Returns & Refunds',
    subtitle: 'Easy, hassle-free returns guaranteed',
    emoji: '↩️',
    sections: [
      {
        heading: 'Return Policy',
        body: 'We accept returns for damaged, expired, or wrong items delivered. Report the issue within 24 hours of delivery through the app or by calling our support. We do not accept returns for perishable items like fruits, vegetables, and dairy after 2 hours of delivery.',
      },
      {
        heading: 'How to Raise a Return',
        body: '1. Go to My Orders in the app\n2. Select the order\n3. Tap "Report an Issue"\n4. Choose the item and issue type\n5. Upload a photo if required\n6. Submit — our team reviews within 2 hours',
      },
      {
        heading: 'Refund Timeline',
        body: 'Approved refunds are processed within 24 hours. Amount is credited to your QuickKart Wallet instantly, or to your original payment method within 3-5 business days depending on your bank.',
      },
      {
        heading: 'Non-Returnable Items',
        body: 'Opened personal care products, medicines, baby food, and items on final sale cannot be returned. Custom print orders (QuickPrints) cannot be returned once delivered.',
      },
    ],
  },

  'contact-us': {
    title: 'Contact Us',
    subtitle: 'We are here to help, 24 hours a day',
    emoji: '📞',
    sections: [
      {
        heading: 'Customer Support',
        body: 'Call us: 1800-XXX-XXXX (Toll Free, 24x7)\nEmail: help@quickkart.in\nResponse time: Under 2 hours on email, instant on call',
      },
      {
        heading: 'WhatsApp Support',
        body: 'Message us on WhatsApp at +91-XXXXX-XXXXX. Available 6 AM to 11 PM daily. For order-related issues, please have your Order ID ready.',
      },
      {
        heading: 'Office Address',
        body: 'QuickKart Technologies Pvt. Ltd.\nPlot No. 45, Sector 62\nNoida, Uttar Pradesh — 201309\n\nMonday to Saturday, 10 AM to 6 PM',
      },
      {
        heading: 'For Business Enquiries',
        body: 'Want to list your products on QuickKart, or partner as a vendor? Email us at vendors@quickkart.in. For advertising and brand partnerships, write to brands@quickkart.in.',
      },
    ],
  },

  'partner-with-us': {
    title: 'Partner with QuickKart',
    subtitle: 'Grow your business with India\'s fastest delivery network',
    emoji: '🤝',
    sections: [
      {
        heading: 'Sell on QuickKart',
        body: 'Are you a brand, manufacturer, or local retailer? List your products on QuickKart and reach lakhs of customers in your city. We handle storage, packaging, and last-mile delivery — you focus on your product.',
      },
      {
        heading: 'Become a Delivery Partner',
        body: 'Join our network of 5,000+ delivery partners across India. Earn ₹20,000–₹40,000/month with flexible hours, weekly payouts, and accident insurance. Apply at careers@quickkart.in with subject "Delivery Partner".',
      },
      {
        heading: 'Dark Store Franchise',
        body: 'Want to open a QuickKart dark store in your city? We offer a franchise model with full operational support, tech infrastructure, and inventory management. Minimum investment starts at ₹15 lakhs.',
      },
      {
        heading: 'Get in Touch',
        body: 'For vendor registration: vendors@quickkart.in\nFor franchise enquiries: franchise@quickkart.in\nFor delivery partner onboarding: delivery@quickkart.in',
      },
    ],
  },

  'privacy-policy': {
    title: 'Privacy Policy',
    subtitle: 'Last updated: June 2026',
    emoji: '🔒',
    sections: [
      {
        heading: '1. Information We Collect',
        body: 'We collect information you provide directly: name, phone number, email, delivery address, and payment information. We also collect usage data such as pages visited, products searched, and orders placed to improve your experience.',
      },
      {
        heading: '2. How We Use Your Information',
        body: 'We use your information to: process and deliver orders, send order updates via SMS/email, personalize product recommendations, prevent fraud, comply with legal obligations, and improve our services.',
      },
      {
        heading: '3. Data Sharing',
        body: 'We do not sell your personal data. We share data with delivery partners (for order fulfillment), payment processors (for transactions), and analytics providers under strict confidentiality agreements. We may disclose information if required by law.',
      },
      {
        heading: '4. Data Security',
        body: 'We use industry-standard encryption (TLS/SSL) for all data in transit. Payment data is processed by PCI-DSS compliant partners and never stored on our servers. We conduct regular security audits.',
      },
      {
        heading: '5. Your Rights',
        body: 'You have the right to access, correct, or delete your personal data at any time. To exercise these rights, email us at privacy@quickkart.in. We will respond within 30 days as per IT Act 2000 and DPDP Act 2023.',
      },
    ],
  },

  'terms-of-service': {
    title: 'Terms of Service',
    subtitle: 'Please read these terms carefully before using QuickKart',
    emoji: '📋',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        body: 'By accessing or using QuickKart\'s website, app, or services, you agree to be bound by these Terms of Service and our Privacy Policy. If you disagree with any part, you may not use our services.',
      },
      {
        heading: '2. Use of Service',
        body: 'QuickKart is intended for personal, non-commercial use. You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials.',
      },
      {
        heading: '3. Orders & Payments',
        body: 'All prices are in Indian Rupees (₹) and inclusive of applicable taxes. We reserve the right to cancel orders in cases of pricing errors, stock unavailability, or suspected fraud. Refunds for cancelled orders are processed within 5 business days.',
      },
      {
        heading: '4. Limitation of Liability',
        body: 'QuickKart\'s liability is limited to the value of the order placed. We are not liable for indirect, incidental, or consequential damages. We do not guarantee uninterrupted service availability.',
      },
      {
        heading: '5. Governing Law',
        body: 'These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Noida, Uttar Pradesh.',
      },
    ],
  },

  'cookie-policy': {
    title: 'Cookie Policy',
    subtitle: 'How we use cookies on QuickKart',
    emoji: '🍪',
    sections: [
      {
        heading: 'What Are Cookies?',
        body: 'Cookies are small text files stored on your device when you visit a website. They help us remember your preferences, keep you logged in, and understand how you use our platform.',
      },
      {
        heading: 'Types of Cookies We Use',
        body: '🔧 Essential Cookies — Required for the site to function (login sessions, cart data)\n📊 Analytics Cookies — Help us understand usage patterns (Google Analytics)\n🎯 Marketing Cookies — Used for personalized ads (with your consent)\n⚙️ Preference Cookies — Remember your settings (language, location)',
      },
      {
        heading: 'Managing Cookies',
        body: 'You can control and delete cookies through your browser settings. Disabling essential cookies may affect site functionality. For analytics and marketing cookies, you can opt out through our cookie consent banner.',
      },
      {
        heading: 'Third-Party Cookies',
        body: 'We use Google Analytics, Facebook Pixel, and payment gateway cookies. These third parties have their own privacy policies. We recommend reviewing them separately.',
      },
    ],
  },

  'refund-policy': {
    title: 'Refund Policy',
    subtitle: 'We make refunds simple and fast',
    emoji: '💰',
    sections: [
      {
        heading: 'When Are Refunds Issued?',
        body: 'Refunds are issued in the following cases: wrong item delivered, damaged or expired product, missing items from your order, order cancelled before packing began, or payment debited but order not placed.',
      },
      {
        heading: 'Refund to QuickKart Wallet',
        body: 'If you choose refund to QuickKart Wallet, the amount is credited instantly once approved. Wallet balance can be used for future purchases with no expiry.',
      },
      {
        heading: 'Refund to Original Payment Method',
        body: 'UPI refunds: 1-2 business days\nCredit/Debit card: 3-5 business days\nNet Banking: 3-7 business days\nTiming depends on your bank and payment processor.',
      },
      {
        heading: 'Non-Refundable Cases',
        body: 'Refunds will not be issued for: change of mind after delivery, minor cosmetic damage to packaging that does not affect the product, items consumed before raising an issue, or orders where discount/coupon was misused.',
      },
    ],
  },
}

export const footerLinks = {
  company: [
    { label: 'About Us',  to: '/info/about-us'  },
    { label: 'Careers',   to: '/info/careers'   },
    { label: 'Blog',      to: '/info/blog'       },
    { label: 'Press',     to: '/info/press'      },
  ],
  help: [
    { label: 'FAQ',              to: '/info/faq'              },
    { label: 'Track Order',      to: '/info/track-order'      },
    { label: 'Returns',          to: '/info/returns'          },
    { label: 'Contact Us',       to: '/info/contact-us'       },
    { label: 'Partner with Us',  to: '/info/partner-with-us'  },
  ],
  legal: [
    { label: 'Privacy Policy',    to: '/info/privacy-policy'    },
    { label: 'Terms of Service',  to: '/info/terms-of-service'  },
    { label: 'Cookie Policy',     to: '/info/cookie-policy'     },
    { label: 'Refund Policy',     to: '/info/refund-policy'     },
  ],
}
