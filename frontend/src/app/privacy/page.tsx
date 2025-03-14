'use client';

import React from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function PrivacyPolicy() {
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl pt-24">
        <h1 className="text-3xl font-bold mb-8">
          Our Website and Marketing Privacy Policy
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="mb-6">
            Crescent Advisors Ltd (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), trading as Flowon AI, is committed to protecting 
            and respecting your privacy. This Privacy Policy outlines how we collect, use, and protect your 
            personal data when you use our services. By using Flowon AI, you agree to the terms of this policy.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" id="information-collect">1. Information We Collect</h2>
            <h3 className="text-xl font-medium mb-2" id="personal-identification">1.1 Personal Identification Information:</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Name, email address, phone number when you create an account.</li>
              <li>Billing information such as payment details and billing address for paid services.</li>
            </ul>

            <h3 className="text-xl font-medium mb-2" id="usage-data">1.2 Usage Data:</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Details of your interactions with our services, including transcription data.</li>
              <li>Technical information such as IP address, browser type, and pages visited.</li>
            </ul>

            <h3 className="text-xl font-medium mb-2" id="cookies-tracking">1.3 Cookies and Tracking:</h3>
            <p className="mb-4">
              We use cookies to enhance your experience, remember preferences, and perform analytics.
            </p>

            <h3 className="text-xl font-medium mb-2" id="correspondence">1.4 Correspondence:</h3>
            <p className="mb-4">
              Records of your communications with us for support purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" id="how-use-information">2. How We Use Your Information</h2>
            <h3 className="text-xl font-medium mb-2" id="service-provision">2.1 Service Provision:</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>To provide, maintain, and improve our services.</li>
              <li>To process transactions and send related information, including purchase confirmations and invoices.</li>
            </ul>

            <h3 className="text-xl font-medium mb-2" id="communication">2.2 Communication:</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>To send administrative information, including updates to our terms and policies.</li>
              <li>To respond to your inquiries and provide customer support.</li>
            </ul>

            <h3 className="text-xl font-medium mb-2" id="analytics">2.3 Analytics:</h3>
            <p className="mb-4">
              To monitor and analyze usage to improve our services and user experience.
            </p>

            <h3 className="text-xl font-medium mb-2" id="legal-compliance">2.4 Legal Compliance:</h3>
            <p className="mb-4">
              To comply with legal obligations, resolve disputes, and enforce agreements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" id="data-sharing">3. Data Sharing and Disclosure</h2>
            <h3 className="text-xl font-medium mb-2" id="service-providers">3.1 Service Providers:</h3>
            <p className="mb-4">
              We share information with third-party service providers who perform services on our behalf, 
              such as payment processing and data storage.
            </p>

            <h3 className="text-xl font-medium mb-2" id="legal-requirements">3.2 Legal Requirements:</h3>
            <p className="mb-4">
              We may disclose your information if required by law or in response to legal requests to protect 
              our rights and safety.
            </p>

            <h3 className="text-xl font-medium mb-2" id="business-transfers">3.3 Business Transfers:</h3>
            <p className="mb-4">
              In connection with any merger, sale of company assets, or acquisition, your information may be 
              transferred to the new owner.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" id="data-security">4. Data Security</h2>
            <h3 className="text-xl font-medium mb-2" id="encryption">4.1 Encryption:</h3>
            <p className="mb-4">
              All data is encrypted using industry-standard encryption methods during transmission and at rest.
            </p>

            <h3 className="text-xl font-medium mb-2" id="access-controls">4.2 Access Controls:</h3>
            <p className="mb-4">
              Access to your data is restricted to authorized personnel only.
            </p>

            <h3 className="text-xl font-medium mb-2" id="data-retention">4.3 Data Retention:</h3>
            <p className="mb-4">
              We retain your data as long as your account is active or as needed to provide you with our services. 
              Upon account deletion, your data will be purged within 90 days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" id="your-rights">5. Your Rights</h2>
            <h3 className="text-xl font-medium mb-2" id="access-update">5.1 Access and Update:</h3>
            <p className="mb-4">
              You have the right to access and update your personal information through your account settings.
            </p>

            <h3 className="text-xl font-medium mb-2" id="deletion">5.2 Deletion:</h3>
            <p className="mb-4">
              You can delete your account and associated data at any time. This will permanently erase your data 
              from our active systems within 7 days and from backups within 90 days.
            </p>

            <h3 className="text-xl font-medium mb-2" id="objection-restriction">5.3 Objection and Restriction:</h3>
            <p className="mb-4">
              You have the right to object to the processing of your data and request restrictions on how we use it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" id="international-transfers">6. International Data Transfers</h2>
            <h3 className="text-xl font-medium mb-2" id="transfer-mechanisms">6.1 Transfer Mechanisms:</h3>
            <p className="mb-4">
              We transfer and store your data on servers located outside of your home country, including in the 
              United States. By using our services, you consent to this transfer.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" id="policy-changes">7. Changes to This Policy</h2>
            <h3 className="text-xl font-medium mb-2" id="updates">7.1 Updates:</h3>
            <p className="mb-4">
              We may update this policy as necessary to reflect changes in our practices or for other operational, 
              legal, or regulatory reasons. We will notify you of any significant changes through our services or 
              by other means.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" id="contact-us">8. Contact Us</h2>
            <h3 className="text-xl font-medium mb-2" id="questions-concerns">8.1 Questions and Concerns:</h3>
            <p>
              If you have any questions or concerns about this Privacy Policy or your data, 
              please contact us at{' '}
              <a 
                href="mailto:support@flowon.ai" 
                className="text-blue-600 hover:text-blue-800"
              >
                support@flowon.ai
              </a>
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
