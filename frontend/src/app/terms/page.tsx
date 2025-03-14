import React from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function TermsOfService() {
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl pt-24">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="mb-4">
            THESE TERMS OF SERVICE (the "Agreement") GOVERN YOUR RECEIPT, ACCESS TO, AND USE OF THE SERVICES PROVIDED BY CRESCENT ADVISORS LTD. ("Flowon AI"). BY (A) PURCHASING ACCESS TO THE SERVICE THROUGH AN ONLINE ORDERING PROCESS THAT REFERENCES THIS AGREEMENT, (B) SIGNING UP FOR A FREE OR PAID ACCESS PLAN FOR THE SERVICE VIA A PLATFORM THAT REFERENCES THIS AGREEMENT, OR (C) CLICKING A BOX INDICATING ACCEPTANCE, YOU AGREE TO BE BOUND BY THE TERMS OF THIS AGREEMENT. THE INDIVIDUAL ACCEPTING THIS AGREEMENT DOES SO ON BEHALF OF A COMPANY OR OTHER LEGAL ENTITY ("Customer"); SUCH INDIVIDUAL REPRESENTS AND WARRANTS THAT THEY HAVE THE AUTHORITY TO BIND SUCH ENTITY AND ITS AFFILIATES TO THIS AGREEMENT. IF THE INDIVIDUAL ACCEPTING THIS AGREEMENT DOES NOT HAVE SUCH AUTHORITY, OR IF THE ENTITY DOES NOT AGREE WITH THESE TERMS AND CONDITIONS, SUCH INDIVIDUAL MUST NOT ACCEPT THIS AGREEMENT AND MAY NOT USE THE SERVICES. CAPITALIZED TERMS HAVE THE MEANINGS SET FORTH HEREIN. THE PARTIES AGREE AS FOLLOWS:
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4" id="service">1. The Service</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-3" id="service-description">1.1 Service Description</h3>
          <p className="mb-4">
            Flowon AI owns and provides a cloud-based artificial intelligence service offering chatbots for customer support, sales, and user engagement (the "Service"). Anything the Customer (including Users) configures, customizes, uploads, or otherwise utilizes through the Service is considered a "User Submission." Customer is solely responsible for all User Submissions it contributes to the Service. Additional terms regarding User Submissions, including ownership, are in Section 8.2 below. The Service may include templates, scripts, documentation, and other materials that assist Customer in using the Service ("Flowon AI Content"). Customers will not receive or have access to the underlying code or software of the Service (collectively, the "Software") nor receive a copy of the Software itself.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3" id="customer-subscription">1.2. Customer's Subscription</h3>
          <p className="mb-4">
            Subject to the terms of this Agreement, Customer may purchase a subscription to, and has the right to access and use, the Service as specified in one or more ordering screens agreed upon by the parties through Flowon AI's website or service portal that reference this Agreement and describe the business terms related to Customer's subscription ("Order(s)"). All subscriptions are for the period described in the applicable Order ("Subscription Period"). Use of and access to the Service is permitted only for individuals authorized by the Customer and solely for Customer's own internal business purposes, not for the benefit of any third party ("Users").
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3" id="ownership">1.3 Flowon AI's Ownership</h3>
          <p className="mb-4">
            Flowon AI owns the Service, Software, Flowon AI Content, Documentation, and anything else provided by Flowon AI to the Customer (collectively, the "Flowon AI Materials"). Flowon AI retains all rights, title, and interest (including all intellectual property rights) in and to the Flowon AI Materials, all related and underlying technology, and any updates, enhancements, modifications, or fixes thereto, as well as all derivative works of or modifications to any of the foregoing. No implied licenses are granted under this Agreement, and any rights not expressly granted to the Customer are reserved by Flowon AI.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3" id="permissions">1.4 Permissions</h3>
          <p className="mb-4">
            The Service includes customizable settings allowing Users to grant permissions to other Users to perform various tasks within the Service ("Permissions"). It is solely the Customer's responsibility to set and manage all Permissions, including determining which Users can set such Permissions. Accordingly, Flowon AI has no responsibility for managing Permissions and no liability for Permissions set by the Customer and its Users. The Customer may provide access to the Service to its Affiliates, in which case all rights granted and obligations incurred under this Agreement shall extend to such Affiliates. The Customer represents and warrants it is fully responsible for any breaches of this Agreement by its Affiliates and has the authority to negotiate this Agreement on behalf of its Affiliates. The Customer is also responsible for all payment obligations under this Agreement, regardless of whether the use of the Service is by the Customer or its Affiliates. Any claim by an Affiliate against Flowon AI must be brought by the Customer, not the Affiliate. An "Affiliate" of a party means any entity directly or indirectly controlling, controlled by, or under common control with that party, where "control" means the ownership of more than fifty percent (50%) of the voting shares or other equity interests.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4" id="restrictions">2. Restrictions</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-3" id="customer-responsibilities">2.1 Customer's Responsibilities</h3>
          <p className="mb-4">
            The Customer is responsible for all activity on its account and those of its Users, except where such activity results from unauthorized access due to vulnerabilities in the Service itself. The Customer will ensure its Users are aware of and comply with the obligations and restrictions in this Agreement, bearing responsibility for any breaches by a User.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3" id="use-restrictions">2.2 Use Restrictions</h3>
          <p className="mb-4">
            The Customer agrees not to, and not to permit Users or third parties to, directly or indirectly: (a) modify, translate, copy, or create derivative works based on the Service; (b) reverse engineer, decompile, or attempt to discover the source code or underlying ideas of the Service, except as permitted by law; (c) sublicense, sell, rent, lease, distribute, or otherwise commercially exploit the Service; (d) remove proprietary notices from the Service; (e) use the Service in violation of laws or regulations; (f) attempt unauthorized access to or disrupt the Service; (g) use the Service to support products competitive to Flowon AI; (h) test the Service's vulnerability without authorization. If the Customer's use of the Service significantly harms Flowon AI or the Service's security or integrity, Flowon AI may suspend access to the Service, taking reasonable steps to notify the Customer and resolve the issue promptly.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3" id="api-restrictions">2.3. API Access Restrictions</h3>
          <p className="mb-4">
            Flowon AI may provide access to APIs as part of the Service. Flowon AI reserves the right to set and enforce usage limits on the APIs, and the Customer agrees to comply with such limits. Flowon AI may also suspend or terminate API access at any time.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4" id="third-party-services">3. Third-Party Services</h2>
          <p className="mb-4">
            The Service may interface with third-party products, services, or applications that are not owned or controlled by Flowon AI ("Third-Party Services"). Customers have the discretion to utilize these Third-Party Services in conjunction with our Service. Should the integration of the Service with any Third-Party Service require, customers will be responsible for providing their login information to Flowon AI solely for the purpose of enabling Flowon AI to deliver its Service. Customers affirm that they have the authority to provide such information without violating any terms and conditions governing their use of the Third-Party Services. Flowon AI does not endorse any Third-Party Services. Customers acknowledge that this Agreement does not cover the use of Third-Party Services, and they may need to enter into separate agreements with the providers of these services. Flowon AI expressly disclaims all representations and warranties concerning Third-Party Services. Customers must direct any warranty claims or other disputes directly to the providers of the Third-Party Services. The use of Third-Party Services is at the customer's own risk. Flowon AI shall not be liable for any issues arising from the use or inability to use Third-Party Services.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4" id="financial-terms">4. Financial Terms</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-3" id="fees">4.1 Fees</h3>
          <p className="mb-4">
            Customers are required to pay for access to and use of the Service as detailed in the applicable order ("Fees"). All Fees will be charged in the currency stated in the order or, if no currency is specified, in U.S. dollars. Payment obligations are non-cancellable and, except as explicitly stated in this Agreement, Fees are non-refundable. Flowon AI reserves the right to modify its Fees or introduce new fees at its discretion. Customers have the option not to renew their subscription if they disagree with any revised fees.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3" id="payment">4.2 Payment</h3>
          <p className="mb-4">
            Flowon AI, either directly or through its third-party payment processor ("Payment Processor"), will bill the customer for the Fees using the credit card or ACH payment information provided by the customer. Flowon AI reserves the right to charge the customer's credit card or ACH payment method for any services provided under the order, including recurring Fees. It is the customer's responsibility to ensure that Flowon AI has current and accurate credit card or ACH payment information. Failure to provide accurate information may lead to a suspension of access to the Services. Flowon AI also reserves the right to offset any Fees owed by the customer. If the customer pays through a Payment Processor, such transactions will be subject to the Payment Processor's terms, conditions, and privacy policies, in addition to this Agreement. Flowon AI is not responsible for errors or omissions by the Payment Processor. Flowon AI reserves the right to correct any errors made by the Payment Processor, even if payment has already been requested or received. If the customer authorizes, through accepting an order, recurring charges will be automatically applied to the customer's payment method without further authorization until the customer terminates this Agreement or updates their payment method.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3" id="taxes">4.3 Taxes</h3>
          <p className="mb-4">
            Fees do not include any taxes, levies, duties, or similar governmental assessments, including value-added, sales, use, or withholding taxes, imposed by any jurisdiction (collectively, "Taxes"). Customers are responsible for paying all Taxes associated with their purchases. If Flowon AI is obligated to pay or collect Taxes for which the customer is responsible, Flowon AI will invoice the customer for such Taxes unless the customer provides Flowon AI with a valid tax exemption certificate authorized by the appropriate taxing authority beforehand. For clarity, Flowon AI is solely responsible for taxes based on its income, property, and employees.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3" id="failure-to-pay">4.4 Failure to Pay</h3>
          <p className="mb-4">
            If a customer fails to pay any Fees when due, Flowon AI may suspend access to the Service until overdue amounts are paid. Flowon AI is authorized to attempt charging the customer's payment method multiple times if an initial charge is unsuccessful. If a customer believes they have been incorrectly billed, they must contact Flowon AI within sixty (60) days from the first billing statement showing the error to request an adjustment or credit. Upon receiving a dispute notice, Flowon AI will review and provide the customer with a written decision, including evidence supporting this decision. If it is determined that the billed amounts are due, the customer must pay these amounts within ten (10) days of receiving Flowon AI's written decision.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4" id="term-termination">5. Term and Termination</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-3" id="agreement-term">5.1 Agreement Term and Renewals</h3>
          <p className="mb-4">
            Subscriptions to access and use Flowon AI's service ("Service") commence on the start date specified on the applicable Order ("Subscription Start Date") and continue for the duration of the Subscription Period. Customers may opt not to renew their Subscription Period by notifying Flowon AI at support@flowon.ai (provided that Flowon AI confirms such cancellation in writing) or by modifying their subscription through the Customer's account settings within the Service. This Agreement takes effect on the first day of the Subscription Period and remains effective for the duration of the Subscription Period stated on the Order, including any renewals of the Subscription Period and any period that the Customer is using the Service, even if such use is not under a paid Order ("Term"). If this Agreement is terminated by either party, it will automatically terminate all Orders. If a Customer cancels or chooses not to renew their paid subscription to the Service, the Customer's subscription will still be accessible but will automatically be downgraded to a version of the Service with reduced features and functionality that Flowon AI offers to unpaid subscribers ("Free Version"). Should this Agreement be terminated by either Flowon AI or the Customer, or should the Customer delete its workspace within the Service, access to the Free Version will be revoked.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3" id="termination">5.2 Termination</h3>
          <p className="mb-4">
            Either party may terminate this Agreement with written notice to the other party if the other party materially breaches this Agreement and such breach is not cured within thirty (30) days after receipt of such notice. Flowon AI may terminate a Customer's access to the Free Version at any time upon notice.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3" id="effect-termination">5.3 Effect of Termination</h3>
          <p className="mb-4">
            If the Customer terminates this Agreement due to an uncured breach by Flowon AI, Flowon AI will refund any unused, prepaid Fees for the remainder of the then-current Subscription Period. If Flowon AI terminates this Agreement due to an uncured breach by the Customer, the Customer will pay any unpaid Fees covering the remainder of the then-current Subscription Period after the date of termination. No termination will relieve the Customer of the obligation to pay any Fees payable to Flowon AI for the period prior to the effective date of termination. Upon termination, all rights and licenses granted by Flowon AI will cease immediately, and the Customer will lose access to the Service. Within thirty (30) days of termination for cause, upon the Customer's request, or if the Customer deletes its workspace within the Service, Flowon AI will delete the Customer's User Information, including passwords, files, and submissions, unless an earlier deletion is requested in writing. For Customers using the Free Version, Flowon AI may retain User Submissions and User Information to facilitate continued use. Flowon AI may delete all User Submissions and User Information if an account remains inactive for more than one (1) year.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3" id="survival">5.4 Survival</h3>
          <p className="mb-4">
            Sections titled "Flowon AI's Ownership", "Third-Party Services", "Financial Terms", "Term and Termination", "Warranty Disclaimer", "Limitation of Liability", "Confidentiality", "Data" and "General Terms" will survive any termination or expiration of this Agreement.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4" id="warranties-disclaimers">6. Warranties and Disclaimers</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-3" id="warranties">6.1. Warranties</h3>
          <p className="mb-4">
            Customers represent and warrant that all User Submissions submitted by Users comply with all applicable laws, rules, and regulations.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3" id="warranty-disclaimer">6.2. Warranty Disclaimer</h3>
          <p className="mb-4">
            EXCEPT AS EXPRESSLY STATED HEREIN, THE SERVICES AND ALL RELATED COMPONENTS AND INFORMATION ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT ANY WARRANTIES OF ANY KIND, AND FLOWON AI EXPRESSLY DISCLAIMS ANY AND ALL WARRANTIES, WHETHER EXPRESS OR IMPLIED, INCLUDING THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. CUSTOMERS ACKNOWLEDGE THAT FLOWON AI DOES NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE. SOME JURISDICTIONS DO NOT ALLOW THE DISCLAIMER OF CERTAIN WARRANTIES, SO THE FOREGOING DISCLAIMERS MAY NOT APPLY TO THE EXTENT PROHIBITED BY LAW.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4" id="limitation-liability">7. Limitation of Liability</h2>
          <p className="mb-4">
            NOTWITHSTANDING ANY PROVISION TO THE CONTRARY, FLOWON AI WILL NOT BE LIABLE FOR ANY INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL DAMAGES, OR DAMAGES BASED ON THE USE OR ACCESS, INTERRUPTION, DELAY, OR INABILITY TO USE THE SERVICE, LOST REVENUES OR PROFITS, LOSS OF BUSINESS OR GOODWILL, DATA CORRUPTION, OR SYSTEM FAILURES, REGARDLESS OF THE LEGAL THEORY. FURTHER, FLOWON AI'S TOTAL LIABILITY WILL NOT EXCEED THE TOTAL FEES PAID OR PAYABLE BY THE CUSTOMER FOR THE SERVICE DURING THE TWELVE (12) MONTHS PRIOR TO THE CLAIM. THESE LIMITATIONS APPLY REGARDLESS OF WHETHER FLOWON AI HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4" id="confidentiality">8. Confidentiality</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-3" id="definition">8.1 Definition</h3>
          <p className="mb-4">
            Each party (the "Receiving Party") recognizes that the other party (the "Disclosing Party") may share business, technical, or financial information pertaining to the Disclosing Party's operations that, due to the nature of the information and the context of disclosure, is reasonably considered confidential ("Confidential Information"). For Flowon AI, Confidential Information includes non-public details about features, functionality, and performance of the Service. For Customers, Confidential Information comprises User Information and User Submissions. This Agreement, along with all related Orders, is considered Confidential Information of both parties. However, Confidential Information does not include information that: (a) becomes publicly available without breaching any duty to the Disclosing Party; (b) was known to the Receiving Party before disclosure by the Disclosing Party without breaching any duty; (c) is received from a third party without breaching any duty; or (d) was independently developed by the Receiving Party without using the Disclosing Party's Confidential Information.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3" id="protection-confidential">8.2 Protection and Use of Confidential Information</h3>
          <p className="mb-4">
            The Receiving Party must: (a) protect the Disclosing Party's Confidential Information with at least the same degree of care it uses for its own similar information, but no less than a reasonable level of care; (b) restrict access to Confidential Information to personnel, affiliates, subcontractors, agents, consultants, legal advisors, financial advisors, and contractors ("Representatives") who need this information in relation to this Agreement and who are bound by confidentiality obligations similar to those in this Agreement; (c) not disclose any Confidential Information to third parties without prior written consent from the Disclosing Party, except as expressly stated herein; and (d) use the Confidential Information solely to fulfill obligations under this Agreement. This does not prevent sharing of Agreement terms or the other party's name with potential investors or buyers under standard confidentiality terms.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3" id="compelled-disclosure">8.3 Compelled Access or Disclosure</h3>
          <p className="mb-4">
            If required by law, the Receiving Party may access or disclose the Disclosing Party's Confidential Information, provided that it notifies the Disclosing Party in advance (when legally permissible) and offers reasonable help, at the Disclosing Party's expense, if the Disclosing Party wants to contest the disclosure.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3" id="feedback">8.4 Feedback</h3>
          <p className="mb-4">
            Customers may occasionally offer feedback on the Service ("Feedback"). Flowon AI may choose to incorporate this Feedback into its services. Customers grant Flowon AI a royalty-free, worldwide, perpetual, irrevocable, fully transferable, and sublicensable license to use, disclose, modify, create derivative works from, distribute, display, and exploit any Feedback as Flowon AI sees fit, without any obligation or restriction, except for not identifying the Customer as the source of Feedback.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4" id="data">9. Data</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-3" id="user-information">9.1 User Information</h3>
          <p className="mb-4">
            Customers and their Users must provide information like names, email addresses, usernames, IP addresses, browsers, and operating systems ("User Information") to access the Service. Customers authorize Flowon AI and its subcontractors to store, process, and retrieve User Information as part of the Service usage. Customers guarantee they have the necessary rights to provide User Information to Flowon AI for processing as described in this Agreement. Customers are liable for their User Information and any unauthorized use of their credentials.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3" id="user-submissions">9.2 User Submissions</h3>
          <p className="mb-4">
            Customers grant Flowon AI a non-exclusive, worldwide, royalty-free, transferable license to use, process, and display User Submissions solely to provide the Service. Beyond the rights granted here, Customers retain all rights to User Submissions, with no implied licenses under this Agreement.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3" id="service-data">9.3 Service Data</h3>
          <p className="mb-4">
            Flowon AI collects data on Service performance and operation ("Service Data") as Customers use the Service. Provided Service Data is aggregated and anonymized, without disclosing any personal information, Flowon AI can use this data freely. Flowon AI owns all rights to Service Data, but will not identify Customers or Users as its source.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3" id="data-protection">9.4 Data Protection</h3>
          <p className="mb-4">
            Flowon AI maintains reasonable security practices to protect Customer Data, including User Submissions and User Information. Nonetheless, Customers are responsible for securing their systems and data.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4" id="general-terms">10. General Terms</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-3" id="publicity">10.1 Publicity</h3>
          <p className="mb-4">
            With prior written consent from the Customer, Flowon AI is allowed to identify the Customer and use and display the Customer's name, logo, trademarks, or service marks on Flowon AI's website and in Flowon AI's marketing materials. This will help in demonstrating the clientele and user base of Flowon AI without compromising any confidential information or privacy rights of the Customer.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3" id="force-majeure">10.2 Force Majeure</h3>
          <p className="mb-4">
            Flowon AI shall not be liable for any failure or delay in performing its obligations hereunder caused by events beyond its reasonable control, including but not limited to failures of third-party hosting or utility providers, strikes (excluding those involving Flowon AI's employees), riots, fires, natural disasters, wars, terrorism, or government actions. These circumstances provide a shield for Flowon AI against unforeseen events that prevent it from fulfilling its service obligations.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3" id="changes">10.3 Changes</h3>
          <p className="mb-4">
            Flowon AI acknowledges that its service is an evolving, subscription-based product. To enhance customer experience, Flowon AI reserves the right to make modifications to the Service. However, Flowon AI commits to not materially reducing the core functionality provided to Customers. Furthermore, Flowon AI may modify the terms of this Agreement unilaterally, provided that Customers are notified at least thirty (30) days before such changes take effect, with changes posted prominently on the Flowon AI website terms page.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3" id="relationship">10.4 Relationship of the Parties</h3>
          <p className="mb-4">
            This Agreement does not create a partnership, franchise, joint venture, agency, fiduciary, or employment relationship between Flowon AI and the Customer. Both parties are independent contractors, maintaining their respective operations and autonomy while cooperating under the terms laid out in this Agreement.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3" id="no-third-party">10.5 No Third-Party Beneficiaries</h3>
          <p className="mb-4">
            This Agreement is strictly between Flowon AI and the Customer. It is not intended to benefit any third party, nor shall any third party have the right to enforce any of its terms, directly or indirectly. This clause clarifies the intended scope of the Agreement, limiting obligations and benefits to the parties involved.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3" id="email-communications">10.6 Email Communications</h3>
          <p className="mb-4">
            Notices under this Agreement will be communicated via email, although Flowon AI may choose to provide notices through the Service instead. Notices to Flowon AI must be directed to a designated Flowon AI email, while notices to Customers will be sent to the email addresses provided by them through the Service. Notices are considered delivered the next business day after emailing or the same day if provided through the Service.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3" id="amendment-waivers">10.7 Amendment and Waivers</h3>
          <p className="mb-4">
            No modifications to this Agreement will be effective unless in writing and signed or acknowledged by authorized representatives of both parties. Neither party's delay or failure to exercise any right under this Agreement will be deemed a waiver of that right. Waivers must also be in writing and signed by the party granting the waiver.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3" id="severability">10.8 Severability</h3>
          <p className="mb-4">
            Should any provision of this Agreement be found unlawful or unenforceable by a court, it will be modified to the minimum extent necessary to make it lawful or enforceable, while the remaining provisions continue in full effect. This clause ensures the Agreement remains operational even if parts of it are modified or removed.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3" id="assignment">10.9 Assignment</h3>
          <p className="mb-4">
            Neither party may assign or delegate their rights or obligations under this Agreement without the other party's prior written consent, except that Flowon AI may do so without consent in cases of mergers, acquisitions, corporate reorganizations, or sales of substantially all assets. Any unauthorized assignment will be void. This Agreement binds and benefits the parties, their successors, and permitted assigns.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3" id="governing-law">10.10 Governing Law and Venue</h3>
          <p className="mb-4">
            This Agreement will be governed by the laws of England & Wales, UK, excluding its conflict of laws principles. To which both parties consent to jurisdiction and venue. There is a waiver of any right to a jury trial for disputes arising under this Agreement. The prevailing party in any enforcement action is entitled to recover its reasonable costs and attorney fees.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3" id="entire-agreement">10.11 Entire Agreement</h3>
          <p className="mb-4">
            This Agreement, including any referenced documents and Orders, constitutes the full agreement between Flowon AI (owned and operated by Crescent Advisors Ltd.) and the Customer, superseding all prior discussions, agreements, and understandings of any nature. This ensures clarity and completeness in the mutual expectations and obligations of the parties involved.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}