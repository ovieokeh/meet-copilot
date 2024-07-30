import { MarkdownText } from "~/components/markdown-text";

const LAST_UPDATED = "2024-07-30";

const POLICY = `
**Privacy Policy**


**1. Introduction**

Welcome to Meet Copilot ("we", "our", "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines the types of data we collect, how we use it, and your rights regarding your data.

**2. Information We Collect**

- **Personal Information**: When you interact with our platform, we may collect personal information such as your name, email address, and any other information you voluntarily provide.
- **Usage Data**: We collect data related to your interactions with our platform, including IP addresses, browser types, operating systems, pages visited, and timestamps.
- **Cookies and Tracking Technologies**: We use cookies and similar technologies to track activity on our platform and hold certain information.

**3. How We Use Your Information**

- **To Provide and Improve Our Service**: We use your data to operate and enhance the platform, including providing personalized features and improving user experience.
- **Communication**: We may use your contact information to send you updates, newsletters, and other information you may find useful. You can opt-out of these communications at any time.
- **Security and Compliance**: We use data to maintain the security of our platform, prevent fraud, and comply with legal obligations.

**4. Sharing Your Information**

We do not sell or rent your personal information to third parties. We may share your information with:
- **Service Providers**: Third-party vendors who assist in operating our platform and providing services to you, under strict confidentiality agreements.
- **Legal Compliance**: If required by law or to protect our rights, we may disclose information to authorities or other relevant parties.

**5. Data Security**

We implement appropriate security measures to protect your data from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.

**6. Your Rights**

You have the right to:
- **Access**: Request access to your personal data.
- **Correction**: Request correction of any inaccurate information.
- **Deletion**: Request deletion of your data, subject to legal obligations.
- **Opt-Out**: Opt-out of marketing communications and data collection.

**7. Third-Party Links**

Our platform may contain links to third-party websites. We are not responsible for the privacy practices or content of these websites.

**8. Changes to This Privacy Policy**

We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new Privacy Policy on this page.

**9. Contact Us**

If you have any questions about this Privacy Policy or your personal information, please contact us at [email address].

---

By using Meet Copilot, you agree to the terms of this Privacy Policy. Please review it carefully and contact us if you have any concerns.  
`;

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col gap-8 min-h-[85dvh] text-slate-50  px-4 py-12 items-center">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <MarkdownText
        className="flex flex-col gap-8 max-w-2xl w-full"
        text={POLICY}
        childrenClassName={{
          base: "my-3",
        }}
      />

      <p className="text-slate-300">Last Updated: {LAST_UPDATED}</p>
    </div>
  );
}
