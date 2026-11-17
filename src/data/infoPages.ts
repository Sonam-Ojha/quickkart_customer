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
    title: 'About Jhatpats',
    subtitle: 'Delivering happiness in 10 minutes',
    emoji: '🛒',
    sections: [
      {
        heading: 'Who We Are',
        body: 'Jhatpats is India\'s fastest growing quick-commerce platform, delivering groceries, fresh produce, daily essentials, and even printouts right to your doorstep in 10 minutes. Founded in 2024, we operate across major cities with a mission to make everyday shopping effortless.',
      },
      {
        heading: 'Our Mission',
        body: 'We believe your time is precious. Our mission is simple — get you what you need, when you need it, without stepping out. From fresh vegetables to medicines to office printouts, Jhatpats is your one-stop neighborhood store, open 24x7.',
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
    title: 'Careers at Jhatpats',
    subtitle: 'Join us and build the future of quick commerce',
    emoji: '💼',
    sections: [
      {
        heading: 'Why Jhatpats?',
        body: 'We move fast — literally and figuratively. At Jhatpats, you\'ll work on problems that matter to millions of people every day. We offer competitive salaries, equity, flexible work, and a team that loves what it does.',
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
        body: 'Send your resume to careers@jhatpats.in with the role name in the subject line. We typically respond within 3 business days. We do not charge any application fees.',
      },
    ],
  },

  'blog': {
    title: 'Jhatpats Blog',
    subtitle: 'Tips, news & stories from our kitchen',
    emoji: '📝',
    sections: [
      {
        heading: '🥗 5 Healthy Breakfast Ideas Under ₹50',
        body: 'Start your mornings right without burning a hole in your pocket. We\'ve curated 5 nutritious breakfast recipes using everyday ingredients available on Jhatpats — all under ₹50 per serving.',
      },
      {
        heading: '🚀 How We Deliver in 10 Minutes',
        body: 'Ever wondered how your groceries reach your door in just 10 minutes? We take you behind the scenes of our dark store model, route optimization algorithms, and the dedicated delivery partners who make it happen.',
      },
      {
        heading: '🌾 Farm to Doorstep: Our Fresh Produce Story',
        body: 'Jhatpats partners with 200+ local farmers across Haryana, UP and Maharashtra. Here\'s how we ensure your vegetables are picked fresh in the morning and delivered the same day.',
      },
      {
        heading: '🖨️ Introducing QuickPrints — Documents in 25 Minutes',
        body: 'Need to print an important document urgently? QuickPrints is our newest service — upload your file, choose paper size and quantity, and receive printed copies at your door in under 25 minutes.',
      },
    ],
  },

  'press': {
    title: 'Press & Media',
    subtitle: 'Jhatpats in the news',
    emoji: '📰',
    sections: [
      {
        heading: 'Press Releases',
        body: '📅 June 2026 — Jhatpats raises ₹150 Cr Series B funding led by Tiger Global\n📅 March 2026 — Jhatpats launches QuickPrints service across Delhi NCR\n📅 January 2026 — Jhatpats crosses 1 lakh monthly orders in Noida alone',
      },
      {
        heading: 'Media Coverage',
        body: 'Jhatpats has been featured in Economic Times, YourStory, Inc42, The Hindu BusinessLine, and NDTV Profit. Our founders have appeared on Shark Tank India Season 4.',
      },
      {
        heading: 'Awards & Recognition',
        body: '🏆 Best Quick Commerce Startup — Startup India Awards 2025\n🏆 Most Innovative Logistics — CII National Awards 2026\n🏆 Best Customer Experience — Retail India Summit 2025',
      },
      {
        heading: 'Media Contact',
        body: 'For press inquiries, interviews, and media kits, please reach out to our PR team at press@jhatpats.in. We typically respond within 24 hours on business days.',
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
        body: 'We accept UPI (PhonePe, GPay, Paytm), credit/debit cards, net banking, and Cash on Delivery. You can also use Jhatpats Wallet balance or referral credits.',
      },
      {
        heading: 'Can I cancel my order?',
        body: 'You can cancel your order within 2 minutes of placing it. After that, the order is already being packed and cannot be cancelled. For issues post-delivery, please use our Returns & Refunds process.',
      },
      {
        heading: 'What if an item is missing or damaged?',
        body: 'We\'re sorry! Report it through the app within 24 hours of delivery. We will issue an instant refund to your Jhatpats Wallet or original payment method within 24-48 hours.',
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
        body: 'Once your delivery partner picks up your order, you can see their live location on the map inside the Jhatpats app. SMS updates are also sent at each stage.',
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
        body: 'Approved refunds are processed within 24 hours. Amount is credited to your Jhatpats Wallet instantly, or to your original payment method within 3-5 business days depending on your bank.',
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
        body: 'Call us: 1800-XXX-XXXX (Toll Free, 24x7)\nEmail: help@jhatpats.in\nResponse time: Under 2 hours on email, instant on call',
      },
      {
        heading: 'WhatsApp Support',
        body: 'Message us on WhatsApp at +91-XXXXX-XXXXX. Available 6 AM to 11 PM daily. For order-related issues, please have your Order ID ready.',
      },
      {
        heading: 'Office Address',
        body: 'Jhatpats Technologies Pvt. Ltd.\nPlot No. 45, Sector 62\nNoida, Uttar Pradesh — 201309\n\nMonday to Saturday, 10 AM to 6 PM',
      },
      {
        heading: 'For Business Enquiries',
        body: 'Want to list your products on Jhatpats, or partner as a vendor? Email us at vendors@jhatpats.in. For advertising and brand partnerships, write to brands@jhatpats.in.',
      },
    ],
  },

  'partner-with-us': {
    title: 'Partner with Jhatpats',
    subtitle: 'Grow your business with India\'s fastest delivery network',
    emoji: '🤝',
    sections: [
      {
        heading: 'Sell on Jhatpats',
        body: 'Are you a brand, manufacturer, or local retailer? List your products on Jhatpats and reach lakhs of customers in your city. We handle storage, packaging, and last-mile delivery — you focus on your product.',
      },
      {
        heading: 'Become a Delivery Partner',
        body: 'Join our network of 5,000+ delivery partners across India. Earn ₹20,000–₹40,000/month with flexible hours, weekly payouts, and accident insurance. Apply at careers@jhatpats.in with subject "Delivery Partner".',
      },
      {
        heading: 'Dark Store Franchise',
        body: 'Want to open a Jhatpats dark store in your city? We offer a franchise model with full operational support, tech infrastructure, and inventory management. Minimum investment starts at ₹15 lakhs.',
      },
      {
        heading: 'Get in Touch',
        body: 'For vendor registration: vendors@jhatpats.in\nFor franchise enquiries: franchise@jhatpats.in\nFor delivery partner onboarding: delivery@jhatpats.in',
      },
    ],
  },

  'privacy-policy': {
    title: 'Privacy Policy',
    subtitle: 'Last updated: 16 November 2026',
    emoji: '🔒',
    sections: [
      {
        heading: '1. Who We Are',
        body: 'Jhatpats is a quick-commerce service that delivers groceries, daily essentials, restaurant food and print jobs. This policy explains what we collect and why, and applies to the Jhatpats website (jhatpats.com) and the Jhatpats Android app.\n\nFor any privacy question, write to info@jhatpats.com or call 8840981098.\nAddress: Faridabad, Haryana, India.',
      },
      {
        heading: '2. Information You Give Us',
        body: 'Account: your mobile number (used to sign in with an OTP), and your name and email address if you add them.\n\nDelivery: the addresses you save — house/flat details, area, city, PIN code and the contact number for that address.\n\nOrders: what you add to your cart, the orders you place, coupons used, and any notes you add for the rider.\n\nSupport: messages, photos and order details you send us through in-app support or chat.',
      },
      {
        heading: '3. Location',
        body: 'With your permission, the app uses your device\'s precise location to find the Jhatpats store nearest to you, show whether we deliver to your area, estimate the delivery time, and pre-fill your address while you are adding one.\n\nYou can skip this and type your address instead. Location permission can be turned off at any time in your phone settings; the app still works, but you will need to set your delivery area by hand.\n\nWe do not track your location in the background when the app is closed.',
      },
      {
        heading: '4. Device & Notification Data',
        body: 'When you allow notifications, we store a push-notification token for your device so we can tell you when an order is confirmed, picked up or delivered, and about offers you have opted into. We also record basic device and app information (app version, device model, operating system) to fix crashes and problems.\n\nYou can turn off notifications in your phone settings at any time.',
      },
      {
        heading: '5. Payments',
        body: 'Online payments are handled by our payment partner, Razorpay. Your card, UPI or netbanking details are entered on their secure, PCI-DSS compliant systems — they never reach or get stored on Jhatpats servers. We only keep the payment result (success or failure), the amount, and a reference number for your order and any refund.\n\nFor Cash on Delivery orders, no payment details are collected at all.',
      },
      {
        heading: '6. How We Use Your Information',
        body: 'We use your information to:\n• accept, pack, deliver and invoice your orders;\n• let the delivery rider reach you and call you if needed;\n• send order updates by notification and SMS;\n• process payments, refunds and wallet balance;\n• answer your support requests;\n• show products available in your area and improve what we stock;\n• detect and prevent fraud and misuse;\n• meet our legal and tax obligations.',
      },
      {
        heading: '7. Who We Share It With',
        body: 'We do not sell your personal data. We share only what is needed, with:\n• Delivery riders — your name, delivery address and phone number, so your order reaches you;\n• Restaurant partners (for food orders) — your name, phone number and address, so the order can be prepared and handed over;\n• Razorpay — to process payments and refunds;\n• Google (Firebase and Maps) — for push notifications, crash reporting and map/address services;\n• Our SMS provider — to send OTP and order messages;\n• Government authorities or courts — only when the law requires it.',
      },
      {
        heading: '8. How Long We Keep It',
        body: 'We keep your account information for as long as your account is open. Order and payment records are kept for up to 8 years because tax and accounting law requires it. Support conversations are kept for up to 2 years. OTPs are deleted within minutes of use or expiry.',
      },
      {
        heading: '9. Deleting Your Account',
        body: 'You can delete your Jhatpats account and personal data at any time:\n• In the app: open Profile and tap "Delete Account" at the bottom; or\n• Email info@jhatpats.com from your registered email, or call 8840981098.\n\nWe action deletion requests within 30 days. Your profile, saved addresses, cart and wishlist are removed. Past order and payment records are kept only where tax law requires, and are no longer linked to a usable account.',
      },
      {
        heading: '10. Security',
        body: 'All traffic between your device and our servers uses TLS/SSL encryption. Passwords are stored hashed, never in plain text, and sign-in is protected by one-time passwords. Access to customer data inside Jhatpats is limited to staff who need it to run orders and support.\n\nNo system is perfectly secure, so please keep your OTP private — Jhatpats staff will never ask you for it.',
      },
      {
        heading: '11. Children',
        body: 'Jhatpats is meant for people aged 18 and above. We do not knowingly collect data from children. If you believe a child has given us personal information, write to info@jhatpats.com and we will delete it.',
      },
      {
        heading: '12. Your Rights',
        body: 'Under the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023, you can ask us to show you the data we hold about you, correct anything that is wrong, delete your data, or withdraw a permission you gave earlier.\n\nWrite to info@jhatpats.com and we will respond within 30 days.',
      },
      {
        heading: '13. Changes to This Policy',
        body: 'If we change this policy we will update the date at the top of this page, and tell you in the app or by notification when the change is significant.',
      },
    ],
  },

  'terms-of-service': {
    title: 'Terms of Service',
    subtitle: 'Please read these terms carefully before using Jhatpats',
    emoji: '📋',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        body: 'By accessing or using Jhatpats\'s website, app, or services, you agree to be bound by these Terms of Service and our Privacy Policy. If you disagree with any part, you may not use our services.',
      },
      {
        heading: '2. Use of Service',
        body: 'Jhatpats is intended for personal, non-commercial use. You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials.',
      },
      {
        heading: '3. Orders & Payments',
        body: 'All prices are in Indian Rupees (₹) and include applicable taxes. Delivery, handling and other charges are shown on the checkout screen before you pay.\n\nYou can pay online or by cash on delivery. An order is confirmed only once we accept it. We may cancel an order in case of a pricing error, an item going out of stock, an address we cannot deliver to, or suspected fraud — and any amount already paid is refunded in full.',
      },
      {
        heading: '4. Delivery',
        body: 'Delivery times shown in the app are estimates, not guarantees, and can change with weather, traffic, demand or the stock at the store serving you. We deliver only inside the areas shown as serviceable in the app.\n\nPlease make sure someone is available at the address to receive the order. If we cannot reach you or nobody collects the order, we may cancel it after attempting to contact you.',
      },
      {
        heading: '5. Cancellations, Returns & Refunds',
        body: 'You can cancel an order from the app before it is packed. Once a rider has picked it up, cancellation may not be possible.\n\nIf an item arrives damaged, spoiled, expired or wrong, report it from the app or call 8840981098 within 24 hours of delivery and we will replace it or refund it. Fresh produce, dairy and prepared food cannot be returned once accepted, unless there is a quality issue.\n\nApproved refunds go back to your Jhatpats wallet instantly, or to the original payment method within 5–7 working days.',
      },
      {
        heading: '6. Restaurant & Print Orders',
        body: 'Food is prepared by the partner restaurant shown on the order. Packaging, taste, portion and preparation are the restaurant\'s responsibility; Jhatpats delivers it and helps resolve problems. Restaurants may refuse or cancel an order when they are closed or an item is unavailable, and you are refunded in full.\n\nFor print orders, you are responsible for the content of the files you upload and for having the right to print them. Files are deleted after your order is completed.',
      },
      {
        heading: '7. Acceptable Use',
        body: 'Do not misuse the service — no fake orders, no abuse or threats towards our staff or riders, no attempt to break into or disrupt our systems, and no reselling of what you buy from us. We may suspend an account that does any of this.',
      },
      {
        heading: '8. Limitation of Liability',
        body: 'Jhatpats\'s liability for any order is limited to the value of that order. We are not liable for indirect or consequential losses. We do not guarantee that the service will always be available without interruption.',
      },
      {
        heading: '9. Governing Law',
        body: 'These terms are governed by the laws of India. Any dispute is subject to the exclusive jurisdiction of the courts at Faridabad, Haryana.',
      },
      {
        heading: '10. Contact Us',
        body: 'Jhatpats\nFaridabad, Haryana, India\nEmail: info@jhatpats.com\nPhone: 8840981098',
      },
    ],
  },

  'cookie-policy': {
    title: 'Cookie Policy',
    subtitle: 'How we use cookies on Jhatpats',
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
        heading: 'Refund to Jhatpats Wallet',
        body: 'If you choose refund to Jhatpats Wallet, the amount is credited instantly once approved. Wallet balance can be used for future purchases with no expiry.',
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
