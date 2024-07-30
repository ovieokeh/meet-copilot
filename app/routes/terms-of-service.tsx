import { MarkdownText } from "~/components/markdown-text";

const LAST_UPDATED = "2024-07-30";
const TOS = `
  
**Terms of Service**


**1. Acceptance of Terms**

By accessing or using Meet Copilot ("we", "our", "us"), you agree to comply with and be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services.

**2. Use of the Service**

- **Eligibility**: You must be at least 18 years old to use our service. By using Meet Copilot, you represent and warrant that you meet this age requirement.
- **Account Registration**: You may be required to create an account to access certain features. You agree to provide accurate information and to keep your account credentials confidential. You are responsible for all activities under your account.
- **Prohibited Conduct**: You agree not to:
  - Use the service for any unlawful purpose or in violation of any local, state, national, or international law.
  - Harass, threaten, or defraud users of the service.
  - Impersonate any person or entity or falsely state or otherwise misrepresent your affiliation with a person or entity.
  - Access, tamper with, or use non-public areas of the service, our computer systems, or the technical delivery systems of our providers.
  - Interfere with or disrupt the service or servers or networks connected to the service.

**3. Intellectual Property**

- **Ownership**: All content, trademarks, and data on Meet Copilot, including but not limited to text, graphics, logos, and software, are the property of Meet Copilot or its licensors. You are granted a limited, non-exclusive, non-transferable, and revocable license to use the service for personal, non-commercial purposes.
- **Restrictions**: You may not copy, modify, distribute, sell, or lease any part of our service or included software, nor may you reverse engineer or attempt to extract the source code of that software, unless laws prohibit these restrictions or you have our written permission.

**4. User Content**

- **Responsibility for User Content**: You are solely responsible for the content you upload, post, or otherwise transmit via the service. You agree not to post content that is illegal, offensive, or infringes on the rights of others.
- **Rights Granted**: By submitting content, you grant Meet Copilot a worldwide, non-exclusive, royalty-free license to use, copy, modify, and distribute your content in connection with the operation of the service.

**5. Termination**

We may terminate or suspend your access to the service at any time, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the service will immediately cease.

**6. Disclaimers and Limitation of Liability**

- **Disclaimer of Warranties**: The service is provided on an "as is" and "as available" basis. We make no warranties, express or implied, regarding the operation of the service or the information, content, or materials included on the service.
- **Limitation of Liability**: To the fullest extent permitted by law, Meet Copilot shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your use of the service.

**7. Indemnification**

You agree to indemnify, defend, and hold harmless Meet Copilot, its affiliates, and their respective directors, officers, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including without limitation reasonable attorney's fees, arising out of or in any way connected with your access to or use of the service.

**8. Governing Law**

These Terms shall be governed and construed in accordance with the laws of [Jurisdiction], without regard to its conflict of law principles. You agree to submit to the personal jurisdiction of the courts located in [Jurisdiction] for the purpose of litigating all such claims or disputes.

**9. Changes to the Terms**

We reserve the right to modify these Terms at any time. We will provide notice of any material changes by posting the new Terms on this page. Your continued use of the service after any such changes constitutes your acceptance of the new Terms.

**10. Contact Us**

If you have any questions about these Terms, please contact us at [email address].

---

By using Meet Copilot, you agree to these Terms of Service. Please review them carefully and contact us if you have any questions or concerns.
`;

export default function TermsOfService() {
  return (
    <div className="flex flex-col gap-8 min-h-[85dvh] text-slate-50  px-4 py-12 items-center">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <MarkdownText
        className="flex flex-col gap-8 max-w-2xl w-full"
        text={TOS}
        childrenClassName={{
          base: "my-3",
        }}
      />

      <p className="text-slate-300">Last Updated: {LAST_UPDATED}</p>
    </div>
  );
}
